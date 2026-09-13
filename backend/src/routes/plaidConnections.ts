import { Router } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { getPlaidAccessToken } from "../services/tokenStore.js";
import { fullSyncForItem } from "../services/sync.js";
import { plaidClient } from "../plaid/client.js";

export const plaidConnectionsRouter = Router();

plaidConnectionsRouter.get("/plaid/connections", requireAuth, async (req: AuthedRequest, res) => {
  const { data, error } = await supabaseAdmin
    .from("plaid_items")
    .select("id, institution_name, status, last_synced_at, created_at, updated_at")
    .eq("user_id", req.userId!)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: "Unable to load connected institutions" });
  res.json({ connections: data ?? [] });
});

plaidConnectionsRouter.post("/plaid/connections/refresh", requireAuth, async (req: AuthedRequest, res) => {
  const { data: items, error } = await supabaseAdmin
    .from("plaid_items")
    .select("id, user_id, plaid_access_token, last_synced_at, status")
    .eq("user_id", req.userId!)
    .in("status", ["active", "syncing", "retryable", "partial"]);
  if (error) return res.status(500).json({ error: "Unable to load connected institutions" });

  const outcomes: Array<{ item_id: string; status: "completed" | "failed"; error?: string }> = [];
  for (const item of items ?? []) {
    try {
      const accessToken = await getPlaidAccessToken(item.id, item.user_id, item.plaid_access_token);
      const syncKey = `plaid-refresh:${item.id}:${item.last_synced_at ?? "never"}`;
      await supabaseAdmin.from("plaid_items").update({ status: "syncing" }).eq("id", item.id).eq("user_id", req.userId!);
      await fullSyncForItem(item.id, item.user_id, accessToken, syncKey);
      outcomes.push({ item_id: item.id, status: "completed" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Evidence refresh failed";
      console.error(`plaid/connections/refresh failed for item ${item.id}:`, message);
      await supabaseAdmin.from("plaid_items").update({ status: "retryable" }).eq("id", item.id).eq("user_id", req.userId!);
      outcomes.push({ item_id: item.id, status: "failed", error: message });
    }
  }

  const failed = outcomes.filter((x) => x.status === "failed").length;
  res.status(failed ? 207 : 200).json({ refreshed_items: outcomes.filter((x) => x.status === "completed").length, failed_items: failed, outcomes });
});

plaidConnectionsRouter.post("/plaid/connections/:itemId/disconnect", requireAuth, async (req: AuthedRequest, res) => {
  const itemId = req.params.itemId;
  const { data: item, error } = await supabaseAdmin
    .from("plaid_items")
    .select("id, user_id, plaid_access_token, institution_name, status")
    .eq("id", itemId)
    .eq("user_id", req.userId!)
    .maybeSingle();
  if (error) return res.status(500).json({ error: "Unable to load the connection" });
  if (!item) return res.status(404).json({ error: "Connection not found" });
  if (item.status === "disconnected") return res.json({ item_id: item.id, status: "disconnected", institution_name: item.institution_name });

  const { error: lockingError } = await supabaseAdmin
    .from("plaid_items")
    .update({ status: "disconnecting" })
    .eq("id", item.id)
    .eq("user_id", req.userId!);
  if (lockingError) return res.status(500).json({ error: "Unable to begin disconnect" });

  try {
    const accessToken = await getPlaidAccessToken(item.id, item.user_id, item.plaid_access_token);
    await plaidClient.itemRemove({ access_token: accessToken });
    const { error: finalizeError } = await supabaseAdmin
      .from("plaid_items")
      .update({ status: "disconnected", last_webhook_code: "ITEM_REMOVED" })
      .eq("id", item.id)
      .eq("user_id", req.userId!);
    if (finalizeError) throw finalizeError;
    return res.json({ item_id: item.id, status: "disconnected", institution_name: item.institution_name, historical_evidence_preserved: true });
  } catch (err) {
    console.error(`plaid/connections/${item.id}/disconnect failed:`, err);
    await supabaseAdmin.from("plaid_items").update({ status: item.status }).eq("id", item.id).eq("user_id", req.userId!);
    return res.status(502).json({ error: "Plaid did not confirm the connection could be disconnected. Historical evidence was not deleted." });
  }
});
