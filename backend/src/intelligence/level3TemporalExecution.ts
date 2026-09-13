import { createHash, randomUUID } from "node:crypto";
import { supabaseAdmin } from "../config/supabase.js";
import { evaluateIndependentCapabilityCertification } from "./independentCapabilityCertification.js";
import { persistArbitraryDerivedIntelligenceNode } from "./persistedIntelligenceGraph.js";

const POLICY_VERSION = "iris-temporal-certification-v1";
const TEMPORAL_VERSION = "iris-level3-temporal-v1";
const OPERATOR_ID = "temporal";
const OPERATOR_VERSION = "1.0.0";

type Level2Output = { domains?: Array<Record<string, any>> };
function hash(value: unknown): string { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function errorText(error: unknown): string { return error instanceof Error ? error.message : String(error); }
function dateOnly(value: unknown): string | null { return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null; }
function daysInclusive(start: string, end: string): number { const a = Date.parse(`${start}T00:00:00Z`); const b = Date.parse(`${end}T00:00:00Z`); return Math.floor((b - a) / 86400000) + 1; }

export async function executeLevel3Temporal(userId: string, requestId?: string) {
  const rid = requestId?.trim() || randomUUID();
  const { data: existing } = await supabaseAdmin.from("iris_runs").select("*").eq("user_id", userId).eq("request_id", rid).maybeSingle();
  if (existing?.id) return { ...existing, certified: existing.status === "CERTIFIED", execution_id: (await supabaseAdmin.from("iris_execution_records").select("id").eq("run_id", existing.id).eq("capability_id", "temporal").maybeSingle()).data?.id ?? null };

  const { data: parentRun, error: parentRunError } = await supabaseAdmin.from("iris_runs").select("id,status,publication_status,evidence_boundary,evidence_manifest_hash,created_at").eq("user_id", userId).eq("request_mode", "level2_domain_intelligence").eq("status", "CERTIFIED").eq("publication_status", "HIERARCHY_PUBLISHED").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (parentRunError || !parentRun) throw new Error("TEMPORAL_LEVEL2_PARENT_REQUIRED");

  const { data: parentExecution, error: parentExecutionError } = await supabaseAdmin.from("iris_execution_records").select("id,capability_id,operator_id,operator_version,certification_status,validation_status,output_hash,input_hash").eq("run_id", parentRun.id).eq("user_id", userId).eq("capability_id", "level2_domain_intelligence").eq("certification_status", "CERTIFIED").maybeSingle();
  if (parentExecutionError || !parentExecution) throw new Error("TEMPORAL_LEVEL2_EXECUTION_REQUIRED");
  const { data: parentOutput, error: parentOutputError } = await supabaseAdmin.from("iris_execution_outputs").select("value,hash,evidence_state").eq("execution_id", parentExecution.id).maybeSingle();
  if (parentOutputError || !parentOutput) throw new Error("TEMPORAL_LEVEL2_OUTPUT_REQUIRED");
  if (!parentExecution.output_hash || parentExecution.output_hash !== parentOutput.hash) throw new Error("TEMPORAL_LEVEL2_OUTPUT_HASH_MISMATCH");

  const level2 = parentOutput.value as Level2Output;
  const transactionDomain = (level2.domains ?? []).find((d) => d.domain_key === "transactions");
  if (!transactionDomain) throw new Error("TEMPORAL_TRANSACTIONS_DOMAIN_REQUIRED");
  const scope = transactionDomain.source_scope ?? {};
  const start = dateOnly(scope.date_range?.first);
  const end = dateOnly(scope.date_range?.last);
  const count = typeof scope.canonical_posted_transactions === "number" ? scope.canonical_posted_transactions : null;
  if (!start || !end || count === null || count < 1) throw new Error("TEMPORAL_TRANSACTION_DATE_BOUNDARY_INSUFFICIENT");
  if (Date.parse(`${end}T00:00:00Z`) > Date.parse(String(parentRun.evidence_boundary))) throw new Error("TEMPORAL_FUTURE_LEAKAGE");

  const { data: parentNode, error: parentNodeError } = await supabaseAdmin.from("iris_user_intelligence_nodes").select("id,node_hash,intelligence_key,value,evidence_state").eq("user_id", userId).eq("run_id", parentRun.id).eq("capability_id", "domain.transactions").maybeSingle();
  if (parentNodeError || !parentNode) throw new Error("TEMPORAL_LEVEL2_TRANSACTION_NODE_REQUIRED");

  const asOf = new Date().toISOString();
  const manifest = { user_id: userId, request_id: rid, mode: "level3_temporal", surface: "iris", capability_id: "temporal", operator_id: OPERATOR_ID, operator_version: OPERATOR_VERSION, temporal_version: TEMPORAL_VERSION, parent_level: 2, parent_run_id: parentRun.id, parent_execution_id: parentExecution.id, parent_output_hash: parentOutput.hash, parent_node_id: parentNode.id, parent_node_hash: parentNode.node_hash, evidence_boundary: parentRun.evidence_boundary, evidence_manifest_hash: parentRun.evidence_manifest_hash, as_of: asOf };
  const inputHash = hash(manifest);
  const { data: run, error: runError } = await supabaseAdmin.from("iris_runs").insert({ request_id: rid, user_id: userId, request_surface: "iris", request_mode: "level3_temporal", requested_capabilities: ["temporal"], status: "PLANNED", as_of: asOf, evidence_boundary: parentRun.evidence_boundary, evidence_version: "level2-certified-parent-v1", evidence_manifest_hash: parentRun.evidence_manifest_hash, planner_version: "iris-level3-temporal-v1", orchestrator_version: "iris-level3-temporal-v1", certification_policy_version: POLICY_VERSION, execution_policy: { evidence_gated: true, certify_only_after_validation: true, server_authoritative: true, parent_level: 2, parent_run_id: parentRun.id, parent_execution_id: parentExecution.id, parent_output_hash: parentOutput.hash, parent_node_id: parentNode.id }, financial_context_hash: hash({ user_id: userId, parent_run_id: parentRun.id, parent_output_hash: parentOutput.hash }), started_at: asOf, updated_at: asOf }).select("*").single();
  if (runError || !run) throw new Error(`TEMPORAL_RUN_CREATE_FAILED: ${runError?.message ?? "unknown"}`);

  try {
    const { data: parentEvidence, error: evidenceError } = await supabaseAdmin.from("iris_run_evidence").select("evidence_type,provider,product,raw_observation_id,effective_at,acquired_at,evidence_hash").eq("run_id", parentRun.id).eq("user_id", userId);
    if (evidenceError) throw evidenceError;
    if (!parentEvidence?.length) throw new Error("TEMPORAL_RUN_EVIDENCE_REQUIRED");
    const evidenceRows = parentEvidence.map((e) => ({ ...e, run_id: run.id, user_id: userId }));
    const { error: evidenceInsertError } = await supabaseAdmin.from("iris_run_evidence").insert(evidenceRows);
    if (evidenceInsertError) throw new Error(`TEMPORAL_RUN_EVIDENCE_COPY_FAILED: ${evidenceInsertError.message}`);

    const { data: execution, error: executionError } = await supabaseAdmin.from("iris_execution_records").insert({ run_id: run.id, user_id: userId, capability_id: "temporal", operator_id: OPERATOR_ID, operator_version: OPERATOR_VERSION, execution_state: "EXECUTING", started_at: asOf, evidence_state: "CALCULATED", validation_status: "UNKNOWN", certification_status: "PENDING", input_manifest: manifest, input_hash: inputHash }).select("*").single();
    if (executionError || !execution) throw new Error(`TEMPORAL_EXECUTION_CREATE_FAILED: ${executionError?.message ?? "unknown"}`);
    const { error: inputError } = await supabaseAdmin.from("iris_execution_inputs").insert([
      { execution_id: execution.id, input_type: "level2_execution_output", reference_type: "iris_execution", reference_id: parentExecution.id, role: "primary", hash: parentOutput.hash },
      { execution_id: execution.id, input_type: "level2_intelligence_node", reference_type: "iris_user_intelligence_node", reference_id: parentNode.id, role: "parent_hierarchy_node", hash: parentNode.node_hash },
    ]);
    if (inputError) throw new Error(`TEMPORAL_EXECUTION_INPUT_PERSIST_FAILED: ${inputError.message}`);

    const result = { temporal_state: { first_observed_date: start, last_observed_date: end, observed_span_days: daysInclusive(start, end), canonical_posted_transaction_count: count, temporal_granularity: "certified_level2_transaction_domain_summary", evidence_boundary: parentRun.evidence_boundary }, temporal_relationships: [{ relation_type: "transaction_observation_span", source_domain: "transactions", target: "observed_date_range", evidence_state: "CALCULATED" }], coverage: { transaction_date_range_supported: true, transaction_level_sequence_supported: false, limitation: "Certified Level 2 currently exposes transaction date bounds and count, not the individual transaction timeline; no finer temporal sequence is inferred." }, upstream: { level: 2, run_id: parentRun.id, execution_id: parentExecution.id, output_hash: parentOutput.hash, node_id: parentNode.id, node_hash: parentNode.node_hash }, provenance: { source_of_truth: "Supabase", operator_id: OPERATOR_ID, operator_version: OPERATOR_VERSION, temporal_version: TEMPORAL_VERSION, parent_level: 2, financial_values_created: false, provider_observations_created: false, money_movement_executed: false } };
    const outputHash = hash(result);
    const { error: outputError } = await supabaseAdmin.from("iris_execution_outputs").insert({ execution_id: execution.id, output_key: "temporal", output_type: "temporal", value: result, hash: outputHash, evidence_state: "CALCULATED" });
    if (outputError) throw new Error(`TEMPORAL_OUTPUT_PERSIST_FAILED: ${outputError.message}`);
    const { error: executionUpdateError } = await supabaseAdmin.from("iris_execution_records").update({ execution_state: "EXECUTED", completed_at: new Date().toISOString(), output_hash: outputHash, output_snapshot: { output_key: "temporal", output_hash: outputHash, parent_level: 2, parent_run_id: parentRun.id, parent_execution_id: parentExecution.id, parent_output_hash: parentOutput.hash, parent_node_id: parentNode.id, parent_node_hash: parentNode.node_hash } }).eq("id", execution.id).eq("user_id", userId);
    if (executionUpdateError) throw executionUpdateError;

    const contract = { version: "1.0.0", capability_id: "temporal", dependencies: [], output_type: "temporal", evidence_requirements: ["canonical_transactions", "run_evidence", "source_lineage"], validation_rules: ["evidence_bounded", "no_future_leakage", "lineage_present"] };
    const gate = await evaluateIndependentCapabilityCertification({ runId: run.id, executionId: execution.id, userId, inputHash, outputHash, contract: contract as any });
    const checks = { level2_parent_certified: { status: "PASS", details: "Certified and hierarchy-published Level 2 parent was consumed." }, parent_output_hash_integrity: { status: "PASS", details: "Persisted Level 2 execution output hash exactly matches the persisted output-row hash." }, parent_transaction_node_present: { status: "PASS", details: "Temporal execution is linked to the certified Level 2 transactions node." }, evidence_bounded: { status: "PASS", details: "Temporal dates are bounded by the certified Level 2 evidence boundary." }, no_future_leakage: { status: "PASS", details: "The observed last date is not later than the Level 2 evidence boundary." }, temporal_derivation_calculated: { status: "PASS", details: "Temporal span is calculated only from certified Level 2 fields." }, source_lineage: { status: gate.checks.lineage_present?.status === "PASS" ? "PASS" : "FAIL", details: gate.checks.lineage_present?.details ?? "Source lineage was not certified." } };
    const eligible = Object.values(checks).every((c) => c.status === "PASS");
    const validationRows = Object.entries(checks).map(([ruleId, c]) => ({ run_id: run.id, execution_id: execution.id, user_id: userId, rule_id: ruleId, rule_version: "1.0.0", status: c.status, severity: c.status === "PASS" ? "INFO" : "CRITICAL", expected: { status: "PASS" }, actual: { status: c.status }, details: { message: c.details, capability_id: "temporal", parent_run_id: parentRun.id, parent_execution_id: parentExecution.id } }));
    const { error: validationError } = await supabaseAdmin.from("iris_validation_results").insert(validationRows);
    if (validationError) throw validationError;
    if (!eligible) throw new Error("TEMPORAL_CERTIFICATION_GATE_FAILED");
    const certificationHash = hash({ run_id: run.id, execution_id: execution.id, input_hash: inputHash, output_hash: outputHash, policy: POLICY_VERSION, capability_id: "temporal", contract_version: "1.0.0", parent_level2: { run_id: parentRun.id, execution_id: parentExecution.id, output_hash: parentOutput.hash, node_id: parentNode.id, node_hash: parentNode.node_hash } });
    const { error: certificationError } = await supabaseAdmin.rpc("finalize_iris_capability_certification", { p_run_id: run.id, p_execution_id: execution.id, p_user_id: userId, p_policy_version: POLICY_VERSION, p_validation_snapshot: { status: "PASS", checks, contract_version: "1.0.0", evidence_manifest_hash: parentRun.evidence_manifest_hash }, p_reconciliation_snapshot: { parent_level2_run_id: parentRun.id, parent_level2_execution_id: parentExecution.id, parent_level2_output_hash: parentOutput.hash }, p_evidence_snapshot: { parent_level2_run_id: parentRun.id, parent_level2_execution_id: parentExecution.id, evidence_manifest_hash: parentRun.evidence_manifest_hash, source_lineage_verified: true }, p_certification_hash: certificationHash, p_certified_at: new Date().toISOString() });
    if (certificationError) throw new Error(`TEMPORAL_CERTIFICATION_FINALIZE_FAILED: ${certificationError.message}`);
    const node = await persistArbitraryDerivedIntelligenceNode({ userId, runId: run.id, executionId: execution.id, definition: { intelligenceKey: "level3.temporal.observed_span", intelligenceName: "Temporal observation span", capabilityId: "temporal", derivationOperator: OPERATOR_ID, derivationVersion: TEMPORAL_VERSION, evidenceState: "CALCULATED", value: result, evidenceBoundary: parentRun.evidence_boundary, provenance: { certification_hash: certificationHash, parent_level2_run_id: parentRun.id, parent_level2_execution_id: parentExecution.id, parent_level2_output_hash: parentOutput.hash }, upstream: [{ nodeId: parentNode.id, role: "level2.transactions" }] } });
    const now = new Date().toISOString();
    const { error: publishError } = await supabaseAdmin.from("iris_runs").update({ status: "CERTIFIED", publication_status: "HIERARCHY_PUBLISHED", completed_at: now, updated_at: now, publication_metadata: { hierarchy_published: true, publication_reason: "certified_temporal_operator", certification_hash: certificationHash, materialized_node_id: node.id, parent_level2_run_id: parentRun.id, parent_level2_execution_id: parentExecution.id } }).eq("id", run.id).eq("user_id", userId);
    if (publishError) throw new Error(`TEMPORAL_HIERARCHY_PUBLICATION_FAILED: ${publishError.message}`);
    return { ...run, id: run.id, status: "CERTIFIED", publication_status: "HIERARCHY_PUBLISHED", certified: true, execution_id: execution.id, certification_hash: certificationHash, output_hash: outputHash, result, materialized_node_id: node.id, parent: { level: 2, run_id: parentRun.id, execution_id: parentExecution.id, output_hash: parentOutput.hash } };
  } catch (error) {
    const now = new Date().toISOString();
    await supabaseAdmin.from("iris_runs").update({ status: "FAILED", failure_code: "TEMPORAL_EXECUTION_FAILED", failure_message: errorText(error), completed_at: now, updated_at: now }).eq("id", run.id).eq("user_id", userId);
    throw error;
  }
}
