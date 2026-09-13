import { createHash, randomUUID } from "node:crypto";
import { supabaseAdmin } from "../config/supabase.js";

export const LEVEL3_ANALYSIS_VERSION = "iris-level3-analysis-v1";
const REQUEST_MODE = "level3_analysis";
const CAPABILITY_ID = "analysis";
const OPERATOR_ID = "analysis";
const OPERATOR_VERSION = "1.0.0";
const POLICY_VERSION = "iris-level3-certification-v1";

type Level2Output = {
  hierarchy_level?: number;
  intelligence_name?: string;
  evidence_boundary?: string;
  domains?: Array<{
    domain_key?: string;
    evidence_state?: string;
    canonical_fields?: Array<{ field_key?: string; label?: string; value?: unknown; evidence_state?: string }>;
    derived_fields?: Array<{ field_key?: string; label?: string; value?: unknown; evidence_state?: string; derivation_operator?: string }>;
    relationships?: Array<{ relation_type?: string; account_id?: string; domain_keys?: string[]; evidence_state?: string }>;
    domain_intelligence?: Array<{ intelligence_key?: string; evidence_state?: string; value?: unknown }>;
    limitations?: string[];
  }>;
  cross_domain?: Array<{ key?: string; name?: string; domains?: string[]; state?: string; value?: Record<string, unknown> }>;
  integrity?: Record<string, unknown>;
  parent_level?: number;
  artifact_type?: string;
};

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function latestField(domain: Level2Output["domains"][number], key: string) {
  return (domain.derived_fields ?? []).find((field) => field.field_key === key)?.value;
}

function buildAnalysis(level2: Level2Output, parentRunId: string, parentExecutionId: string, parentOutputHash: string) {
  const domains = level2.domains ?? [];
  const transactions = domains.find((d) => d.domain_key === "transactions");
  const balance = domains.find((d) => d.domain_key === "balance");
  const liabilities = domains.find((d) => d.domain_key === "liabilities");
  const observedDomains = domains.filter((d) => d.evidence_state === "OBSERVED").map((d) => d.domain_key).filter(Boolean);
  const transactionCount = latestField(transactions!, "posted_transaction_count");
  const inflow = latestField(transactions!, "inflow");
  const outflow = latestField(transactions!, "outflow");
  const netCashFlow = latestField(transactions!, "net_cash_flow");
  const relationships = (transactions?.relationships ?? []).map((r) => ({
    relation_type: r.relation_type ?? null,
    account_id: r.account_id ?? null,
    domain_keys: r.domain_keys ?? [],
    evidence_state: r.evidence_state ?? "INSUFFICIENT_EVIDENCE",
  }));
  const crossDomain = (level2.cross_domain ?? []).map((item) => ({
    key: item.key ?? null,
    name: item.name ?? null,
    domains: item.domains ?? [],
    evidence_state: item.state ?? "INSUFFICIENT_EVIDENCE",
    value: item.value ?? {},
  }));
  const domainEvidence = domains.map((d) => ({
    domain_key: d.domain_key,
    evidence_state: d.evidence_state,
    canonical_field_count: d.canonical_fields?.length ?? 0,
    derived_field_count: d.derived_fields?.length ?? 0,
    relationship_count: d.relationships?.length ?? 0,
    intelligence_count: d.domain_intelligence?.length ?? 0,
    limitations: d.limitations ?? [],
  }));

  return {
    capability_id: CAPABILITY_ID,
    operator_id: OPERATOR_ID,
    operator_version: OPERATOR_VERSION,
    evidence_state: "CALCULATED",
    analysis: {
      financial_state: {
        observed_domains: observedDomains,
        domain_count: domains.length,
        transaction_count: transactionCount ?? null,
        observed_inflow: inflow ?? null,
        observed_outflow: outflow ?? null,
        observed_net_cash_flow: netCashFlow ?? null,
      },
      transaction_analysis: {
        posted_transaction_count: transactionCount ?? null,
        inflow: inflow ?? null,
        outflow: outflow ?? null,
        net_cash_flow: netCashFlow ?? null,
      },
      relational_analysis: {
        transaction_relationship_count: relationships.length,
        relationships,
        cross_domain_relationship_count: crossDomain.length,
        cross_domain: crossDomain,
      },
      evidence_analysis: {
        domains: domainEvidence,
        unsupported_domains_remain_insufficient_evidence: domains.filter((d) => d.evidence_state === "INSUFFICIENT_EVIDENCE").map((d) => d.domain_key),
      },
    },
    evidence_boundary: level2.evidence_boundary ?? null,
    upstream: {
      level: 2,
      run_id: parentRunId,
      execution_id: parentExecutionId,
      output_hash: parentOutputHash,
      source: "certified_persisted_level2_hierarchy",
    },
    provenance: {
      source: "certified_persisted_level2_hierarchy",
      financial_values_created: false,
      provider_observations_created: false,
      money_movement_executed: false,
      derivation_version: LEVEL3_ANALYSIS_VERSION,
      parent_level2_run_id: parentRunId,
      parent_level2_execution_id: parentExecutionId,
      parent_level2_output_hash: parentOutputHash,
    },
  };
}

export async function executeLevel3Analysis(userId: string, requestId?: string) {
  const effectiveRequestId = requestId?.trim() || randomUUID();
  const { data: existing } = await supabaseAdmin
    .from("iris_runs")
    .select("*")
    .eq("user_id", userId)
    .eq("request_id", effectiveRequestId)
    .maybeSingle();
  if (existing?.id) {
    const { data: execution } = await supabaseAdmin
      .from("iris_execution_records")
      .select("id,capability_id,execution_state,validation_status,certification_status,output_hash")
      .eq("run_id", existing.id)
      .eq("user_id", userId)
      .eq("capability_id", CAPABILITY_ID)
      .maybeSingle();
    const { data: output } = execution
      ? await supabaseAdmin.from("iris_execution_outputs").select("value,hash,evidence_state").eq("execution_id", execution.id).maybeSingle()
      : { data: null };
    return { ...existing, execution_id: execution?.id ?? null, result: output?.value ?? null, output_hash: output?.hash ?? null, certified: existing.status === "CERTIFIED" };
  }

  const { data: parentRun, error: parentRunError } = await supabaseAdmin
    .from("iris_runs")
    .select("id,status,publication_status,evidence_boundary,evidence_manifest_hash")
    .eq("user_id", userId)
    .eq("request_mode", "level2_domain_intelligence")
    .eq("status", "CERTIFIED")
    .eq("publication_status", "HIERARCHY_PUBLISHED")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (parentRunError) throw new Error(`LEVEL3_PARENT_RUN_READ_FAILED: ${parentRunError.message}`);
  if (!parentRun) throw new Error("LEVEL3_BLOCKED: no certified published Level 2 hierarchy exists.");

  const { data: parentExecution, error: parentExecutionError } = await supabaseAdmin
    .from("iris_execution_records")
    .select("id,execution_state,validation_status,certification_status")
    .eq("run_id", parentRun.id)
    .eq("user_id", userId)
    .eq("execution_state", "EXECUTED")
    .eq("validation_status", "PASS")
    .eq("certification_status", "CERTIFIED")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (parentExecutionError) throw new Error(`LEVEL3_PARENT_EXECUTION_READ_FAILED: ${parentExecutionError.message}`);
  if (!parentExecution) throw new Error("LEVEL3_BLOCKED: certified Level 2 execution is unavailable.");

  const { data: parentOutput, error: parentOutputError } = await supabaseAdmin
    .from("iris_execution_outputs")
    .select("value,hash,evidence_state")
    .eq("execution_id", parentExecution.id)
    .eq("evidence_state", "CALCULATED")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (parentOutputError) throw new Error(`LEVEL3_PARENT_OUTPUT_READ_FAILED: ${parentOutputError.message}`);
  if (!parentOutput?.value || !parentOutput.hash) throw new Error("LEVEL3_BLOCKED: certified Level 2 output is unavailable.");

  const inputManifest = {
    user_id: userId,
    request_id: effectiveRequestId,
    request_mode: REQUEST_MODE,
    capability_id: CAPABILITY_ID,
    operator_id: OPERATOR_ID,
    operator_version: OPERATOR_VERSION,
    parent_level: 2,
    parent_run_id: parentRun.id,
    parent_execution_id: parentExecution.id,
    parent_output_hash: parentOutput.hash,
    parent_evidence_manifest_hash: parentRun.evidence_manifest_hash,
    evidence_boundary: parentRun.evidence_boundary,
    derivation_version: LEVEL3_ANALYSIS_VERSION,
  };
  const inputHash = hash(inputManifest);
  const asOf = new Date().toISOString();
  const { data: run, error: runError } = await supabaseAdmin
    .from("iris_runs")
    .insert({
      request_id: effectiveRequestId,
      user_id: userId,
      request_surface: "iris",
      request_mode: REQUEST_MODE,
      requested_capabilities: [CAPABILITY_ID],
      status: "EXECUTING",
      as_of: asOf,
      evidence_boundary: parentRun.evidence_boundary,
      evidence_version: "level2-published-hierarchy-v1",
      evidence_manifest_hash: parentRun.evidence_manifest_hash,
      financial_context_hash: hash({ parent_run_id: parentRun.id, parent_execution_id: parentExecution.id, parent_output_hash: parentOutput.hash }),
      execution_policy: { evidence_gated: true, server_authoritative: true, parent_level: 2, parent_run_id: parentRun.id, parent_execution_id: parentExecution.id, source: "certified_persisted_level2_hierarchy" },
      planner_version: LEVEL3_ANALYSIS_VERSION,
      orchestrator_version: LEVEL3_ANALYSIS_VERSION,
      certification_policy_version: POLICY_VERSION,
      started_at: asOf,
      updated_at: asOf,
    })
    .select("*")
    .single();
  if (runError || !run) throw new Error(`LEVEL3_RUN_CREATE_FAILED: ${runError?.message ?? "unknown error"}`);

  const { data: execution, error: executionError } = await supabaseAdmin
    .from("iris_execution_records")
    .insert({
      run_id: run.id,
      user_id: userId,
      capability_id: CAPABILITY_ID,
      operator_id: OPERATOR_ID,
      operator_version: OPERATOR_VERSION,
      execution_state: "EXECUTING",
      started_at: asOf,
      evidence_state: "CALCULATED",
      validation_status: "UNKNOWN",
      certification_status: "PENDING",
      input_manifest: inputManifest,
      input_hash: inputHash,
    })
    .select("*")
    .single();
  if (executionError || !execution) throw new Error(`LEVEL3_EXECUTION_CREATE_FAILED: ${executionError?.message ?? "unknown error"}`);

  try {
    const result = buildAnalysis(parentOutput.value as Level2Output, parentRun.id, parentExecution.id, parentOutput.hash);
    const outputHash = hash(result);
    const { error: inputError } = await supabaseAdmin.from("iris_execution_inputs").insert({
      execution_id: execution.id,
      input_type: "level2_hierarchy_output",
      reference_type: "iris_execution",
      reference_id: parentExecution.id,
      role: "parent_level",
      hash: parentOutput.hash,
    });
    if (inputError) throw new Error(`LEVEL3_INPUT_PERSIST_FAILED: ${inputError.message}`);

    const { error: outputError } = await supabaseAdmin.from("iris_execution_outputs").insert({
      execution_id: execution.id,
      output_key: CAPABILITY_ID,
      output_type: "analysis",
      value: result,
      hash: outputHash,
      evidence_state: "CALCULATED",
      uncertainty: null,
    });
    if (outputError) throw new Error(`LEVEL3_OUTPUT_PERSIST_FAILED: ${outputError.message}`);

    const { error: lineageError } = await supabaseAdmin.from("iris_execution_lineage").insert({
      user_id: userId,
      run_id: run.id,
      execution_id: execution.id,
      lineage_role: "DEPENDENCY_INPUT",
      source_type: "iris_execution_output",
      source_id: parentExecution.id,
      source_field_path: "level2.published_hierarchy",
      destination_type: "iris_execution_output",
      destination_id: execution.id,
      destination_field_path: "analysis",
      evidence_state: "CALCULATED",
      transformation: "level2_to_level3_analysis",
      source_hash: parentOutput.hash,
      lineage_hash: hash({ parent_execution_id: parentExecution.id, parent_output_hash: parentOutput.hash, destination_execution_id: execution.id, transformation: "level2_to_level3_analysis" }),
      metadata: { parent_run_id: parentRun.id, parent_execution_id: parentExecution.id, parent_output_hash: parentOutput.hash, derivation_version: LEVEL3_ANALYSIS_VERSION },
    });
    if (lineageError) throw new Error(`LEVEL3_LINEAGE_PERSIST_FAILED: ${lineageError.message}`);

    const checks = {
      parent_level2_certified: parentRun.status === "CERTIFIED" && parentRun.publication_status === "HIERARCHY_PUBLISHED" ? "PASS" : "FAIL",
      parent_execution_certified: parentExecution.execution_state === "EXECUTED" && parentExecution.validation_status === "PASS" && parentExecution.certification_status === "CERTIFIED" ? "PASS" : "FAIL",
      output_hash_integrity: parentOutput.hash === hash(parentOutput.value) ? "PASS" : "FAIL",
      level3_lineage_present: "PASS",
    } as const;
    const eligible = Object.values(checks).every((value) => value === "PASS");
    const validationRows = Object.entries(checks).map(([ruleId, status]) => ({
      run_id: run.id,
      execution_id: execution.id,
      user_id: userId,
      rule_id: ruleId,
      rule_version: POLICY_VERSION,
      status,
      severity: status === "PASS" ? "INFO" : "CRITICAL",
      expected: { status: "PASS" },
      actual: { status },
      details: { capability_id: CAPABILITY_ID, parent_level2_run_id: parentRun.id, parent_level2_execution_id: parentExecution.id },
    }));
    const { error: validationError } = await supabaseAdmin.from("iris_validation_results").insert(validationRows);
    if (validationError) throw new Error(`LEVEL3_VALIDATION_PERSIST_FAILED: ${validationError.message}`);

    const finishedAt = new Date().toISOString();
    await supabaseAdmin.from("iris_execution_records").update({ execution_state: "EXECUTED", completed_at: finishedAt, output_hash: outputHash, output_snapshot: { output_key: CAPABILITY_ID, output_hash: outputHash, parent_level2_run_id: parentRun.id, parent_level2_execution_id: parentExecution.id }, validation_status: eligible ? "PASS" : "FAIL", resource_usage: { duration_ms: Date.parse(finishedAt) - Date.parse(asOf) } }).eq("id", execution.id).eq("user_id", userId);

    if (!eligible) throw new Error("LEVEL3_CERTIFICATION_FAILED: Level 2 parent gate did not pass.");
    const certificationHash = hash({ run_id: run.id, execution_id: execution.id, input_hash: inputHash, output_hash: outputHash, parent_level2_run_id: parentRun.id, parent_level2_execution_id: parentExecution.id, parent_level2_output_hash: parentOutput.hash, policy: POLICY_VERSION });
    const { error: certificationError } = await supabaseAdmin.rpc("finalize_iris_capability_certification", {
      p_run_id: run.id,
      p_execution_id: execution.id,
      p_user_id: userId,
      p_policy_version: POLICY_VERSION,
      p_validation_snapshot: { status: "PASS", checks, parent_level2_run_id: parentRun.id, parent_level2_execution_id: parentExecution.id, parent_level2_output_hash: parentOutput.hash },
      p_reconciliation_snapshot: { input_hash: inputHash, output_hash: outputHash, parent_output_hash: parentOutput.hash },
      p_evidence_snapshot: { parent_level: 2, parent_run_id: parentRun.id, parent_execution_id: parentExecution.id, parent_output_hash: parentOutput.hash, evidence_boundary: parentRun.evidence_boundary, evidence_manifest_hash: parentRun.evidence_manifest_hash },
      p_certification_hash: certificationHash,
      p_certified_at: finishedAt,
    });
    if (certificationError) throw new Error(`LEVEL3_CERTIFICATION_FINALIZE_FAILED: ${certificationError.message}`);
    const { error: runUpdateError } = await supabaseAdmin.from("iris_runs").update({ status: "CERTIFIED", completed_at: finishedAt, updated_at: finishedAt, failure_code: null, failure_message: null }).eq("id", run.id).eq("user_id", userId);
    if (runUpdateError) throw new Error(`LEVEL3_RUN_FINALIZE_FAILED: ${runUpdateError.message}`);
    return { ...run, id: run.id, status: "CERTIFIED", execution_id: execution.id, result, output_hash: outputHash, certified: true, certification_hash: certificationHash, parent_level2_run_id: parentRun.id, parent_level2_execution_id: parentExecution.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await supabaseAdmin.from("iris_execution_records").update({ execution_state: "FAILED", validation_status: "FAIL", certification_status: "NOT_CERTIFIED", error_code: "LEVEL3_ANALYSIS_FAILED", error_message: message, completed_at: new Date().toISOString() }).eq("id", execution.id).eq("user_id", userId);
    await supabaseAdmin.from("iris_runs").update({ status: "FAILED", failure_code: "LEVEL3_ANALYSIS_FAILED", failure_message: message, updated_at: new Date().toISOString() }).eq("id", run.id).eq("user_id", userId);
    throw error;
  }
}
