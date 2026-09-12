import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";
import { getCanonicalTransactions } from "../intelligence/transactionSemantics.js";
import { assertSimulationIntegrity, simulateTransactions, type SimulationRequest } from "../intelligence/simulationEngine.js";

export const irisSimulationRouter = Router();

irisSimulationRouter.post("/iris/simulate", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { data: run, error: runError } = await supabaseAdmin
      .from("iris_runs")
      .select("id,status,certification_hash")
      .eq("user_id", req.userId!)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (runError) throw runError;
    const certified = run?.status === "CERTIFIED" && typeof run.certification_hash === "string" && run.certification_hash.length > 0;
    if (!certified) return res.status(409).json({ error: "Iris intelligence is not certified for publication", certified: false, run_id: run?.id ?? null, status: run?.status ?? "NOT_RUN", publication_boundary: { status: "blocked", reason: "CERTIFICATION_REQUIRED", derived_intelligence_publication: false } });

    const body = (req.body ?? {}) as Partial<SimulationRequest>;
    const allowed = new Set(["roundup", "spending_reduction", "income_change", "budget_change", "custom_cashflow"]);
    if (typeof body.kind !== "string" || !allowed.has(body.kind)) {
      return res.status(400).json({ error: "A supported Iris simulation kind is required." });
    }
    const transactions = await getCanonicalTransactions(req.userId!);
    const result = simulateTransactions(transactions, {
      kind: body.kind as SimulationRequest["kind"],
      label: typeof body.label === "string" ? body.label.slice(0, 160) : undefined,
      percent: typeof body.percent === "number" ? body.percent : undefined,
      amount: typeof body.amount === "number" ? body.amount : undefined,
      days: typeof body.days === "number" ? Math.max(1, Math.min(3650, Math.round(body.days))) : undefined,
    });
    assertSimulationIntegrity(result);
    return res.json({ ...result, certified: true, run_id: run.id, certification_hash: run.certification_hash });
  } catch (error) {
    console.error("iris/simulate error:", error);
    return res.status(500).json({ error: "Unable to construct Iris simulation from current evidence." });
  }
});
