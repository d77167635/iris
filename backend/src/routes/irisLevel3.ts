import { Router } from "express";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { executeIrisRun } from "../intelligence/irisExecution.js";
import { supabaseAdmin } from "../config/supabase.js";

export const irisLevel3Router = Router();
const REQUEST_MODE = "level3_recursive_intelligence";

const RELATED_DOMAIN_MAP: Record<string, string[]> = {
  temporal: ["transactions"],
  financial_life_state: ["transactions", "balance", "assets", "liabilities"],
  relational_ontology: ["identity", "transactions", "balance", "assets", "liabilities", "investments"],
  analysis: ["transactions", "balance"],
  behavioral: ["transactions"],
  pattern: ["transactions"],
  relationship: ["transactions", "identity", "assets", "liabilities"],
  anomaly: ["transactions", "balance"],
  causal: ["transactions", "balance", "liabilities"],
  predictive: ["transactions", "balance", "liabilities"],
  risk: ["balance", "liabilities", "transactions", "assets"],
  scenario: ["transactions", "balance", "liabilities"],
  decision: ["transactions", "balance", "liabilities", "assets"],
  recommendation: ["transactions", "balance", "liabilities", "assets"],
  opportunity: ["assets", "balance", "transactions", "investments"],
  consequence: ["transactions", "balance", "liabilities", "assets"],
  outcome: ["transactions", "balance", "liabilities", "assets"],
  learning: ["transactions", "balance", "liabilities", "assets"],
  emergent: ["transactions", "balance", "identity", "assets", "liabilities", "investments"],
};

type Level2Field = {
  field_key?: string;
  label?: string;
  value?: unknown;
  value_type?: string;
  evidence_state?: string;
  derivation_operator?: string;
  source_inputs?: string[];
  source_field_paths?: string[];
  output_hash?: string;
  evidence_boundary?: string;
};

type Level2Domain = {
  domain_key: string;
  evidence_state?: string;
  canonical_fields?: Level2Field[];
  derived_fields?: Level2Field[];
  domain_intelligence?: Array<{ intelligence_key?: string; evidence_state?: string; value?: unknown }>;
  limitations?: string[];
};

type Level2State = {
  domains?: Level2Domain[];
  cross_domain?: Array<{ key?: string; name?: string; state?: string; value?: Record<string, unknown>; domains?: string[] }>;
  evidence_boundary?: string;
};

function buildRelatedContent(capabilityId: string, level2: Level2State | null) {
  if (!level2) return { state: "INSUFFICIENT_EVIDENCE", domains: [], facts: [], cross_domain: [] };
  const domainKeys = RELATED_DOMAIN_MAP[capabilityId] ?? [];
  const domains = (level2.domains ?? []).filter((domain) => domainKeys.includes(domain.domain_key));
  const facts: Array<Record<string, unknown>> = [];
  for (const domain of domains) {
    for (const field of [...(domain.derived_fields ?? []), ...(domain.canonical_fields ?? [])]) {
      if (!field.field_key) continue;
      facts.push({
        domain_key: domain.domain_key,
        field_key: field.field_key,
        label: field.label ?? field.field_key,
        value: field.value,
        value_type: field.value_type ?? null,
        evidence_state: field.evidence_state ?? domain.evidence_state ?? "INSUFFICIENT_EVIDENCE",
        derivation_operator: field.derivation_operator ?? null,
        source_inputs: field.source_inputs ?? [],
        source_field_paths: field.source_field_paths ?? [],
        output_hash: field.output_hash ?? null,
        evidence_boundary: field.evidence_boundary ?? level2.evidence_boundary ?? null,
      });
    }
  }
  const crossDomain = (level2.cross_domain ?? []).filter((item) => (item.domains ?? []).some((domain) => domainKeys.includes(domain)));
  return {
    state: facts.length || crossDomain.length ? "OBSERVED_OR_CALCULATED" : "INSUFFICIENT_EVIDENCE",
    domains: domainKeys,
    facts,
    cross_domain: crossDomain,
    evidence_boundary: level2.evidence_boundary ?? null,
    source: "certified_published_level2",
  };
}

async function readCertifiedLevel2State(userId: string, parentRunId: string | null) {
  if (!parentRunId) return null;
  const { data: parentRun, error: parentRunError } = await supabaseAdmin
    .from("iris_runs")
    .select("id,status,publication_status,evidence_boundary")
    .eq("id", parentRunId)
    .eq("user_id", userId)
    .maybeSingle();
  if (parentRunError) throw parentRunError;
  if (!parentRun || parentRun.status !== "CERTIFIED" || !["HIERARCHY_PUBLISHED", "PUBLISHED"].includes(parentRun.publication_status)) return null;

  const { data: parentExecution, error: executionError } = await supabaseAdmin
    .from("iris_execution_records")
    .select("id,output_hash,execution_state,validation_status,certification_status")
    .eq("run_id", parentRunId)
    .eq("user_id", userId)
    .eq("execution_state", "EXECUTED")
    .eq("validation_status", "PASS")
    .eq("certification_status", "CERTIFIED")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (executionError) throw executionError;
  if (!parentExecution) return null;

  const { data: output, error: outputError } = await supabaseAdmin
    .from("iris_execution_outputs")
    .select("value,hash,evidence_state")
    .eq("execution_id", parentExecution.id)
    .eq("output_key", "hierarchy")
    .maybeSingle();
  if (outputError) throw outputError;
  if (!output?.value || output.hash !== parentExecution.output_hash) return null;

  return { ...output.value as Level2State, evidence_boundary: (output.value as Level2State).evidence_boundary ?? parentRun.evidence_boundary, run_id: parentRun.id, execution_id: parentExecution.id, output_hash: output.hash };
}

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
  if (!run) return { certified: false, level: 3, status: "NOT_RUN", capability_count: 0, capabilities: [], nodes: [], edges: [], compositions: [] };

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
    .select("id,node_type,domain_key,capability_id,intelligence_key,intelligence_name,value,evidence_state,confidence,as_of,evidence_boundary,provenance,node_hash,derivation_operator,derivation_version,upstream_node_ids,recursive_ancestry,recursive_depth,created_at")
    .eq("user_id", userId)
    .eq("run_id", run.id)
    .order("created_at", { ascending: true });
  if (nodeError) throw nodeError;

  const { data: edges, error: edgeError } = await supabaseAdmin
    .from("iris_user_intelligence_edges")
    .select("id,from_node_id,to_node_id,relation_type,evidence_state,weight,explanation,provenance,created_at")
    .eq("user_id", userId)
    .eq("run_id", run.id)
    .order("created_at", { ascending: true });
  if (edgeError) throw edgeError;

  const { data: compositions, error: compositionError } = await supabaseAdmin
    .from("iris_user_intelligence_compositions")
    .select("id,capability_id,composition_depth,input_node_ids,output_node_id,dependency_capability_ids,evidence_state,contract_version,composition_hash,created_at")
    .eq("run_id", run.id)
    .order("created_at", { ascending: true });
  if (compositionError) throw compositionError;

  const certified = run.status === "CERTIFIED"
    && ["HIERARCHY_PUBLISHED", "PUBLISHED"].includes(run.publication_status)
    && certification?.status === "CERTIFIED"
    && primaryExecution?.execution_state === "EXECUTED"
    && primaryExecution?.validation_status === "PASS"
    && primaryExecution?.certification_status === "CERTIFIED"
    && output?.hash === primaryExecution.output_hash;

  const parentRunId = typeof run.execution_policy?.parent_level2_run_id === "string" ? run.execution_policy.parent_level2_run_id : null;
  const parentLevel2 = parentRunId ? await readCertifiedLevel2State(userId, parentRunId) : null;
  const enrichedNodes = (nodes ?? []).map((node) => ({
    ...node,
    related_content: buildRelatedContent(node.capability_id, parentLevel2),
  }));

  return {
    ...run,
    level: 3,
    certified,
    published: ["HIERARCHY_PUBLISHED", "PUBLISHED"].includes(run.publication_status),
    execution_id: primaryExecution?.id ?? null,
    execution_state: primaryExecution?.execution_state ?? null,
    validation_status: primaryExecution?.validation_status ?? null,
    certification_status: primaryExecution?.certification_status ?? null,
    certification_hash: certification?.certification_hash ?? null,
    certified_at: certification?.certified_at ?? null,
    output_hash: output?.hash ?? primaryExecution?.output_hash ?? null,
    evidence_state: output?.evidence_state ?? null,
    parent_level2: parentLevel2 ? { run_id: parentLevel2.run_id, execution_id: parentLevel2.execution_id, output_hash: parentLevel2.output_hash } : null,
    capability_count: enrichedNodes.length,
    capabilities: enrichedNodes.map((node) => ({ capability_id: node.capability_id, name: node.intelligence_name, evidence_state: node.evidence_state, recursive_depth: node.recursive_depth, upstream_count: Array.isArray(node.upstream_node_ids) ? node.upstream_node_ids.length : 0 })),
    materialized: { nodes: enrichedNodes.length, edges: edges?.length ?? 0, compositions: compositions?.length ?? 0 },
    nodes: enrichedNodes,
    edges: edges ?? [],
    compositions: compositions ?? [],
    related_content_contract: "iris-level3-related-content-v1",
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
    const run = await executeIrisRun({ userId: req.userId!, requestId, surface: "iris", mode: REQUEST_MODE, requestedCapabilities: ["iris.full_intelligence"] });
    return res.status(run.certified ? 200 : 422).json({ ...run, level: 3 });
  } catch (error) {
    console.error("iris/level3 run error:", error);
    return res.status(422).json({ certified: false, level: 3, error: error instanceof Error ? error.message : "Level 3 recursive intelligence execution failed" });
  }
});