import { useEffect, useState } from "react";
import { supabase } from "../api/supabase";

const PAGE_SIZE = 1000;
const rawTables = [
  ["plaid_items", ["id", "user_id", "plaid_item_id", "institution_id", "institution_name", "status", "last_webhook_code", "last_synced_at", "created_at", "updated_at"]],
  ["plaid_accounts", null],
  ["plaid_raw_transactions", null],
  ["plaid_raw_balances", null],
  ["plaid_raw_liabilities", null],
  ["plaid_raw_product_observations", null],
  ["plaid_provider_response_receipts", null]
] as const;

async function readAll(table: string, userId: string, columns: readonly string[] | null) {
  const rows: Record<string, unknown>[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const query = supabase.from(table).select(columns ? columns.join(",") : "*").eq("user_id", userId).range(from, from + PAGE_SIZE - 1);
    const { data, error } = await query;
    if (error) throw error;
    const page = (data ?? []) as unknown as Record<string, unknown>[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

export function IrisRawPlaidSupabaseSurface() {
  const [data, setData] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(async ({ data: sessionData, error: sessionError }) => {
      if (sessionError || !sessionData.session) return;
      const userId = sessionData.session.user.id;
      const result: Record<string, unknown> = {};
      for (const [table, columns] of rawTables) {
        result[table] = await readAll(table, userId, columns);
      }
      if (active) setData(result);
    }).catch(() => {
      if (active) setData(null);
    });
    return () => { active = false; };
  }, []);

  if (!data) return <main style={{ minHeight: "100dvh", background: "#050609" }} />;

  return <main style={{ minHeight: "100dvh", margin: 0, padding: 16, boxSizing: "border-box", background: "#050609", color: "#f4f7fb", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace", overflow: "auto" }}><pre style={{ margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 12, lineHeight: 1.5 }}>{JSON.stringify(data, null, 2)}</pre></main>;
}
