import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { executeIrisRun } from "../intelligence/irisExecution.js";
import { supabaseAdmin } from "../config/supabase.js";

export const irisLevel3Router = Router();
const REQUEST_MODE = "level3_recursive_intelligence";

async function readLatestLevel3(userId: string) {
  const { data: run, error: runError } = await supabaseAdmin
    .from("iris_runs")
    .select("id,status,publication_status,created_at,completed_at,evidence_boundary,evidence_manifest_hash,requested_capabilities,execution_policy,failure_code,failure_message")
    .eq("user_id", userId)
    .eq("request_mode", REQUEST_MODE)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (runError) throw runError;
  if (!run) return { certified: false, level: 3, status: "NOT_RUN", capability_count: 0, capabilities: [] };

  const { data: execution, error: executionError } = await supabaseAdmin
    .from("iris_execution_records")
    .select("id,capability_id,operator_id,operator_version,execution_state,validation_status,certification_status,output_hash")
    .eq("run_id", run.id)
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (executionError) throw executionError;

  const { data: certification, error: certificationError } = await supabaseAdmin
    .from("iris_certifications")
    .select("status,certification_hash,certified_at")
    .eq("run_id", run.id)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (certificationError) throw certificationError;

  const primaryExecution = execution?.find((row) => row.capability_id === "iris.full_intelligence") ?? execution?.[0] ?? null;
  const { data: output, error: outputError } = primaryExecution
    ? await supabaseAdmin.from("iris_execution_outputs").select("value,hash,evidence_state").eq("execution_id", primaryExecution.id).eq("output_key", "recursive_intelligence_graph").maybeSingle()
    : { data: null, error: null };
  if (outputError) throw outputError;

  const { data: nodes, error: nodeError } = await supabaseAdmin
    .from("iris_user_intelligence_nodes")
    .select("id,capability_id,intelligence_name,evidence_state,recursive_depth,upstream_node_ids")
    .eq("user_id", userId)
    .eq("run_id", run.id)
    .order("created_at", { ascending: true });
  if (nodeError) throw nodeError;

  const capabilityRows = (nodes ?? []).map((node) => ({
    capability_id: node.capability_id,
    name: node.intelligence_name,
    evidence_state: node.evidence_state,
    recursive_depth: node.recursive_depth,
    upstream_count: Array.isArray(node.upstream_node_ids) ? node.upstream_node_ids.length : 0,
  }));

  const certified = run.status === "CERTIFIED"
    && run.publication_status === "HIERARCHY_PUBLISHED"
    && certification?.status === "CERTIFIED"
    && primaryExecution?.execution_state === "EXECUTED"
    && primaryExecution?.validation_status === "PASS"
    && primaryExecution?.certification_status === "CERTIFIED"
    && output?.hash === primaryExecution.output_hash;

  return {
    ...run,
    level: 3,
    certified,
    execution_id: primaryExecution?.id ?? null,
    execution_state: primaryExecution?.execution_state ?? null,
    validation_status: primaryExecution?.validation_status ?? null,
    certification_status: primaryExecution?.certification_status ?? null,
    certification_hash: certification?.certification_hash ?? null,
    certified_at: certification?.certified_at ?? null,
    output_hash: output?.hash ?? primaryExecution?.output_hash ?? null,
    evidence_state: output?.evidence_state ?? null,
    parent_level2: run.execution_policy?.parent_level2_run_id ? {
      run_id: run.execution_policy.parent_level2_run_id,
      execution_id: run.execution_policy.parent_level2_execution_id,
      output_hash: run.execution_policy.parent_level2_output_hash,
      certification_hash: run.execution_policy.parent_level2_certification_hash,
    } : null,
    capability_count: capabilityRows.length,
    capabilities: capabilityRows,
    materialized: { nodes: nodes?.length ?? 0 },
    result: output?.value ?? null,
  };
}

irisLevel3Router.get("/iris/level3", requireAuth, async (req: AuthedRequest, res) => {
  try {
    return res.json(await readLatestLevel3(req.userId!));
  } catch (error) {
    console.error("iris/level3 read error:", error);
    return res.status(500).json({ certified: false, level: 3, error: "Level 3 recursive intelligence could not be read" });
  }
});

irisLevel3Router.post("/iris/level3/run", requireAuth, async (req: AuthedRequest, res) => {
  try {
    const requestId = typeof req.body?.request_id === "string" ? req.body.request_id : undefined;
    const run = await executeIrisRun({
      userId: req.userId!,
      requestId,
      surface: "iris",
      mode: REQUEST_MODE,
      requestedCapabilities: ["iris.full_intelligence"],
    });
    return res.status(run.certified ? 200 : 422).json({ ...run, level: 3 });
  } catch (error) {
    console.error("iris/level3 run error:", error);
    return res.status(422).json({ certified: false, level: 3, error: error instanceof Error ? error.message : "Level 3 recursive intelligence execution failed" });
  }
});
