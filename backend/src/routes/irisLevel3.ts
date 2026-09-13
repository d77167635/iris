import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { executeLevel3Analysis } from "../intelligence/level3AnalysisExecution.js";
import { supabaseAdmin } from "../config/supabase.js";

export const irisLevel3Router = Router();

async function readLatestLevel3Analysis(userId: string) {
  const { data: run, error: runError } = await supabaseAdmin
    .from("iris_runs")
    .select("id,status,created_at,completed_at,evidence_boundary,request_mode,requested_capabilities,failure_code,failure_message")
    .eq("user_id", userId)
    .eq("request_mode", "level3_analysis")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (runError) throw runError;
  if (!run) return { certified: false, level: 3, capability_id: "analysis", status: "NOT_RUN" };

  const { data: execution, error: executionError } = await supabaseAdmin
    .from("iris_execution_records")
    .select("id,execution_state,validation_status,certification_status,output_hash,completed_at")
    .eq("run_id", run.id)
    .eq("user_id", userId)
    .eq("capability_id", "analysis")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (executionError) throw executionError;

  const { data: certification, error: certificationError } = await supabaseAdmin
    .from("iris_certifications")
    .select("id,status,certification_hash,certified_at")
    .eq("run_id", run.id)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (certificationError) throw certificationError;

  const { data: output, error: outputError } = execution
    ? await supabaseAdmin
        .from("iris_execution_outputs")
        .select("value,hash,evidence_state")
        .eq("execution_id", execution.id)
        .eq("output_key", "analysis")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null, error: null };
  if (outputError) throw outputError;

  const certified = run.status === "CERTIFIED" && certification?.status === "CERTIFIED" && execution?.certification_status === "CERTIFIED" && output?.value != null;
  return {
    ...run,
    level: 3,
    capability_id: "analysis",
    execution_id: execution?.id ?? null,
    execution_state: execution?.execution_state ?? null,
    validation_status: execution?.validation_status ?? null,
    certification_status: execution?.certification_status ?? null,
    certification_hash: certification?.certification_hash ?? null,
    certified_at: certification?.certified_at ?? null,
    output_hash: output?.hash ?? execution?.output_hash ?? null,
    output_evidence_state: output?.evidence_state ?? null,
    result: output?.value ?? null,
    certified,
  };
}

irisLevel3Router.get("/iris/level3/analysis", requireAuth, async (req: AuthedRequest, res) => {
  try {
    return res.json(await readLatestLevel3Analysis(req.userId!));
  } catch (error) {
    console.error("iris/level3/analysis error:", error);
    return res.status(500).json({ certified: false, level: 3, capability_id: "analysis", error: "Level 3 Analysis could not be read" });
  }
});

irisLevel3Router.post("/iris/level3/analysis/run", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const result = await executeLevel3Analysis(req.userId!, typeof req.body?.request_id === "string" ? req.body.request_id : undefined);
    return res.status(201).json(result);
  } catch (error) {
    console.error("iris/level3/analysis/run error:", error);
    return res.status(500).json({ certified: false, level: 3, capability_id: "analysis", error: error instanceof Error ? error.message : "Level 3 Analysis execution failed" });
  }
});
