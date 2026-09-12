import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { supabaseAdmin } from "../config/supabase.js";
import { getCanonicalTransactions } from "../intelligence/transactionSemantics.js";
import { buildDecisionLab, type DecisionLabRequest } from "../intelligence/decisionLab.js";

export const irisDecisionLabRouter = Router();

irisDecisionLabRouter.post("/iris/decision-lab", requireAuth, async (req: AuthedRequest, res) => {
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

    const body = (req.body ?? {}) as Partial<DecisionLabRequest>;
    const transactions = await getCanonicalTransactions(req.userId!);
    const result = buildDecisionLab(transactions, {
      question: typeof body.question === "string" ? body.question : undefined,
      amount: typeof body.amount === "number" ? body.amount : undefined,
      horizon_days: typeof body.horizon_days === "number" ? body.horizon_days : undefined,
    });
    return res.json({ ...result, certified: true, run_id: run.id, certification_hash: run.certification_hash });
  } catch (error) {
    console.error("iris/decision-lab error:", error);
    return res.status(500).json({ error: "Unable to construct Decision Lab analysis from current evidence." });
  }
});
