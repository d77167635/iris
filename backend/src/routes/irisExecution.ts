import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { executeIrisRun } from "../intelligence/irisExecution.js";
import { executeIndependentCapabilities } from "../intelligence/independentCapabilityExecution.js";
import { executeLevel3Analysis } from "../intelligence/level3AnalysisExecution.js";
import { executeLevel3Temporal } from "../intelligence/level3TemporalExecution.js";

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

    const hasExplicitIndependentCapability = requestedCapabilities?.some((capability: string) => capability !== "iris.full_intelligence") ?? false;
    const run = hasExplicitIndependentCapability
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

irisExecutionRouter.post("/iris/level3/temporal/run", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const requestId = typeof req.body?.request_id === "string" ? req.body.request_id : undefined;
    const run = await executeLevel3Temporal(req.userId!, requestId);
    if (!run.certified) return res.status(422).json({ run_id: run.id ?? null, execution_id: run.execution_id ?? null, status: run.status, certified: false, certification_hash: null });
    return res.status(200).json(run);
  } catch (error) {
    console.error("Iris Level 3 Temporal run failed", error);
    return res.status(422).json({ error: error instanceof Error ? error.message : "Iris Level 3 Temporal could not be completed" });
  }
});

irisExecutionRouter.get("/iris/level3/temporal", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { supabaseAdmin } = await import("../config/supabase.js");
    const { data: run, error: runError } = await supabaseAdmin.from("iris_runs").select("id,status,publication_status,created_at,completed_at,evidence_boundary").eq("user_id", req.userId!).eq("request_mode", "level3_temporal").order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (runError) throw runError;
    if (!run) return res.status(404).json({ certified: false, status: "NOT_RUN" });
    const { data: execution, error: executionError } = await supabaseAdmin.from("iris_execution_records").select("id,capability_id,operator_id,operator_version,execution_state,validation_status,certification_status,output_hash").eq("run_id", run.id).eq("user_id", req.userId!).eq("capability_id", "temporal").maybeSingle();
    if (executionError) throw executionError;
    if (!execution) return res.status(409).json({ certified: false, status: run.status, run_id: run.id });
    const { data: output, error: outputError } = await supabaseAdmin.from("iris_execution_outputs").select("value,hash,evidence_state").eq("execution_id", execution.id).maybeSingle();
    if (outputError) throw outputError;
    const { data: certification, error: certificationError } = await supabaseAdmin.from("iris_certifications").select("status,certification_hash,certified_at").eq("run_id", run.id).eq("execution_id", execution.id).maybeSingle();
    if (certificationError) throw certificationError;
    return res.json({ certified: run.status === "CERTIFIED" && run.publication_status === "HIERARCHY_PUBLISHED" && certification?.status === "CERTIFIED", run_id: run.id, execution_id: execution.id, status: run.status, publication_status: run.publication_status, evidence_boundary: run.evidence_boundary, output_hash: output?.hash ?? null, evidence_state: output?.evidence_state ?? null, result: output?.value ?? null, certification_hash: certification?.certification_hash ?? null, certified_at: certification?.certified_at ?? null });
  } catch (error) {
    console.error("Iris Level 3 Temporal read failed", error);
    return res.status(500).json({ error: "Iris Level 3 Temporal could not be read" });
  }
});

irisExecutionRouter.post("/iris/level3/analysis/run", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const requestId = typeof req.body?.request_id === "string" ? req.body.request_id : undefined;
    const run = await executeLevel3Analysis(req.userId!, requestId);
    if (!run.certified) return res.status(422).json({ run_id: run.id ?? null, execution_id: run.execution_id ?? null, status: run.status, certified: false, certification_hash: null });
    return res.status(200).json(run);
  } catch (error) {
    console.error("Iris Level 3 analysis run failed", error);
    return res.status(422).json({ error: error instanceof Error ? error.message : "Iris Level 3 analysis could not be completed" });
  }
});

irisExecutionRouter.get("/iris/level3/analysis", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const { data: run, error: runError } = await import("../config/supabase.js").then(({ supabaseAdmin }) => supabaseAdmin.from("iris_runs").select("id,status,created_at,completed_at,evidence_boundary").eq("user_id", req.userId!).eq("request_mode", "level3_analysis").order("created_at", { ascending: false }).limit(1).maybeSingle());
    if (runError) throw runError;
    if (!run) return res.status(404).json({ certified: false, status: "NOT_RUN" });
    const { supabaseAdmin } = await import("../config/supabase.js");
    const { data: execution, error: executionError } = await supabaseAdmin.from("iris_execution_records").select("id,capability_id,operator_id,operator_version,execution_state,validation_status,certification_status,output_hash").eq("run_id", run.id).eq("user_id", req.userId!).eq("capability_id", "analysis").limit(1).maybeSingle();
    if (executionError) throw executionError;
    if (!execution) return res.status(409).json({ certified: false, status: run.status, run_id: run.id });
    const { data: output, error: outputError } = await supabaseAdmin.from("iris_execution_outputs").select("value,hash,evidence_state").eq("execution_id", execution.id).limit(1).maybeSingle();
    if (outputError) throw outputError;
    const { data: certification, error: certificationError } = await supabaseAdmin.from("iris_certifications").select("status,certification_hash,certified_at").eq("run_id", run.id).eq("execution_id", execution.id).limit(1).maybeSingle();
    if (certificationError) throw certificationError;
    return res.json({ certified: run.status === "CERTIFIED" && certification?.status === "CERTIFIED", run_id: run.id, execution_id: execution.id, status: run.status, evidence_boundary: run.evidence_boundary, output_hash: output?.hash ?? null, evidence_state: output?.evidence_state ?? null, result: output?.value ?? null, certification_hash: certification?.certification_hash ?? null, certified_at: certification?.certified_at ?? null });
  } catch (error) {
    console.error("Iris Level 3 analysis read failed", error);
    return res.status(500).json({ error: "Iris Level 3 analysis could not be read" });
  }
});
