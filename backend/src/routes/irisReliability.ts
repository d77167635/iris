import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { executeIrisRun } from "../intelligence/irisExecution.js";
import { assessReliability } from "../intelligence/reliability.js";

export const irisReliabilityRouter = Router();

irisReliabilityRouter.get("/dashboard/intelligence/reliability", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const run = await executeIrisRun({
      userId: req.userId!,
      requestId: typeof req.header("x-iris-request-id") === "string" ? req.header("x-iris-request-id")! : undefined,
      surface: "iris_reliability",
      mode: "full_intelligence",
    });
    const full = run.result;
    const certified = run.status === "CERTIFIED" && run.certified === true && typeof run.certification_hash === "string" && run.certification_hash.length > 0;
    if (!full) return res.status(503).json({ error: "Iris intelligence is temporarily unavailable", certified: false, run_id: run.id ?? null });
    if (!certified) return res.status(409).json({ error: "Iris intelligence is not certified for publication", certified: false, run_id: run.id ?? null, execution_id: run.execution_id ?? null, status: run.status, certification_gate: run.certification_gate ?? null, publication_boundary: { status: "blocked", reason: "CERTIFICATION_REQUIRED", derived_intelligence_publication: false } });
    res.json({
      run_id: run.id ?? null,
      execution_id: run.execution_id ?? null,
      certified: true,
      certification_hash: run.certification_hash,
      certification_gate: run.certification_gate ?? null,
      reliability: assessReliability(full.evidence_graph),
    });
  } catch (err) {
    console.error("dashboard/intelligence/reliability error:", err);
    res.status(500).json({ error: "Failed to assess Iris intelligence reliability" });
  }
});
