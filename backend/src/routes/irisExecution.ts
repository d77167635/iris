import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { executeIrisRun } from "../intelligence/irisExecution.js";
import { executeIndependentCapabilities } from "../intelligence/independentCapabilityExecution.js";

export const irisExecutionRouter = Router();

irisExecutionRouter.post("/iris/runs", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const requestedCapabilities: string[] | undefined = Array.isArray(req.body?.requested_capabilities)
      ? req.body.requested_capabilities.filter((x: unknown): x is string => typeof x === "string" && x.trim().length > 0)
      : undefined;

    const request = {
      userId: req.userId!,
      requestId: typeof req.body?.request_id === "string" ? req.body.request_id : undefined,
      surface: typeof req.body?.surface === "string" ? req.body.surface : "iris",
      mode: typeof req.body?.mode === "string" ? req.body.mode : "full_intelligence",
      requestedCapabilities,
    };

    const hasIndependentCapability = requestedCapabilities?.some(
      (capability: string) => capability !== "iris.full_intelligence",
    ) ?? false;
    const run = hasIndependentCapability
      ? await executeIndependentCapabilities({ ...request, requestedCapabilities: requestedCapabilities! })
      : await executeIrisRun(request);

    const certified = run.status === "CERTIFIED" && run.certified === true && typeof run.certification_hash === "string" && run.certification_hash.length > 0;
    if (!certified) {
      return res.status(run.status === "FAILED" || run.status === "VALIDATION_FAILED" ? 422 : 202).json({
        run_id: run.id ?? null,
        execution_id: run.execution_id ?? null,
        status: run.status,
        certified: false,
        certification_gate: run.certification_gate ?? null,
        publication_boundary: { status: "blocked", reason: "CERTIFICATION_REQUIRED", derived_intelligence_publication: false },
      });
    }

    return res.status(200).json({ ...run, certified: true, certification_hash: run.certification_hash });
  } catch (error) {
    console.error("Iris run failed", error);
    return res.status(500).json({ error: "Iris run could not be completed" });
  }
});
