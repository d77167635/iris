import { createHash, randomUUID } from "node:crypto";
import { supabaseAdmin } from "../config/supabase.js";
import { planCapabilities } from "./capabilityPlanner.js";
import { executeRecursiveCapabilityPlan } from "./recursiveCapabilityExecutor.js";
import { persistRecursiveLineage } from "./recursiveLineage.js";
import { evaluateCertificationGate } from "./certificationGate.js";
import { materializeCertifiedHierarchy, materializeIrisUserReportInventory } from "./irisUserReportComposer.js";
import { resolveCanonicalProviderItem, IRIS_CANONICAL_PROVIDER_DOMAINS, type IrisEvidenceScope } from "./evidenceScope.js";

const PLANNER_VERSION = "iris-capability-planner-v7";
const ORCHESTRATOR_VERSION = "iris-recursive-orchestrator-v2";
const CERTIFICATION_POLICY_VERSION = "iris-certification-v3";
const CAPABILITY_ID = "iris.full_intelligence";
const EXECUTOR_OPERATOR_ID = "recursiveCapabilityExecutor";
const EXECUTOR_OPERATOR_VERSION = "iris-recursive-capability-executor-v11";
const DEFAULT_REQUESTED_CAPABILITIES = [CAPABILITY_ID];

type RunRequest = { userId: string; requestId?: string; surface?: string; mode?: string; requestedCapabilities?: string[] };
function hash(value: unknown): string { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function errorText(error: unknown): string { if (error instanceof Error) return error.message; if (typeof error === "string") return error; try { return JSON.stringify(error); } catch { return String(error); } }

async function publicationRpc(name: string, args: Record<string, unknown>): Promise<void> {
  const { error } = await supabaseAdmin.rpc(name, args);
  if (error) throw new Error(`PUBLICATION_STATE_PERSISTENCE_FAILED: ${name}: ${error.message}`);
}

async function failPublication(runId: string, executionId: string, userId: string, code: "HIERARCHY_PUBLICATION_FAILED" | "REPORT_PUBLICATION_FAILED" | "PUBLICATION_STATE_PERSISTENCE_FAILED", error: unknown): Promise<never> {
  const message = errorText(error);
  try {
    await publicationRpc("iris_publication_mark_failed", { p_run_id: runId, p_execution_id: executionId, p_user_id: userId, p_error_code: code, p_error_message: message });
  } catch (stateError) {
    throw new Error(`PUBLICATION_STATE_PERSISTENCE_FAILED: ${errorText(stateError)}`);
  }
  throw new Error(`${code}: ${message}`);
}

/** The single governed Iris execution boundary. Computation certification is distinct from post-certification hierarchy/report publication. */
export async function executeIrisRun(request: RunRequest) {
  const userId = request.userId;
  const requestId = request.requestId?.trim() || randomUUID();
  const surface = request.surface || "iris";
  const mode = request.mode || "full_intelligence";
  const requestedCapabilities = request.requestedCapabilities?.length ? request.requestedCapabilities : DEFAULT_REQUESTED_CAPABILITIES;
  const asOf = new Date().toISOString();

  const { data: existing } = await supabaseAdmin.from("iris_runs").select("*").eq("user_id", userId).eq("request_id", requestId).maybeSingle();
  if (existing?.id) {
    const { data: existingExecution } = await supabaseAdmin.from("iris_execution_records").select("id").eq("run_id", existing.id).eq("user_id", userId).maybeSingle();
    const { data: output } = existingExecution ? await supabaseAdmin.from("iris_execution_outputs").select("value,hash,evidence_state").eq("execution_id", existingExecution.id).maybeSingle() : { data: null };
    return { ...existing, execution_id: existingExecution?.id ?? null, result: output?.value ?? null, output_hash: output?.hash ?? null, certified: existing.status === "CERTIFIED" };
  }

  const selectedItemId = await resolveCanonicalProviderItem(userId);
  const evidenceScope: IrisEvidenceScope = { kind: selectedItemId ? "provider_item" : "user_aggregate", selectedItemId, canonicalProviderDomains: IRIS_CANONICAL_PROVIDER_DOMAINS, deferredProviderDomains: ["statements"] };
  const plan = await planCapabilities(userId, requestedCapabilities, selectedItemId);
  if (plan.status === "BLOCKED") throw new Error(`CAPABILITY_PLAN_BLOCKED: ${plan.limitations.join(" | ")}`);

  const initialManifest = { user_id: userId, request_id: requestId, surface, mode, requested_capabilities: requestedCapabilities, capability_plan: plan, evidence_scope: evidenceScope, as_of: asOf, planner_version: PLANNER_VERSION, orchestrator_version: ORCHESTRATOR_VERSION, certification_policy_version: CERTIFICATION_POLICY_VERSION };
  const { data: run, error: runError } = await supabaseAdmin.from("iris_runs").insert({ request_id: requestId, user_id: userId, request_surface: surface, request_mode: mode, requested_capabilities: requestedCapabilities, status: "PLANNED", as_of: asOf, evidence_boundary: asOf, evidence_version: "provider-observation-boundary-v4", resource_budget: { max_execution_time_ms: 120000, max_graph_nodes: 10000, max_graph_edges: 30000, max_compositions: 5000 }, execution_policy: { evidence_gated: true, certify_only_after_validation: true, server_authoritative: true, capability_plan_status: plan.status, evidence_scope_kind: evidenceScope.kind, selected_item_id: selectedItemId, canonical_provider_domains: [...IRIS_CANONICAL_PROVIDER_DOMAINS], deferred_provider_domains: ["statements"], recursive_executor: EXECUTOR_OPERATOR_ID, recursive_executor_version: EXECUTOR_OPERATOR_VERSION }, planner_version: PLANNER_VERSION, orchestrator_version: ORCHESTRATOR_VERSION, certification_policy_version: CERTIFICATION_POLICY_VERSION, financial_context_hash: hash({ user_id: userId, as_of: asOf, evidence_scope: evidenceScope }), evidence_manifest_hash: hash(initialManifest), started_at: asOf, updated_at: asOf }).select("*").single();
  if (runError || !run) throw new Error(`Unable to create Iris run: ${runError?.message || "unknown error"}`);

  const evidenceQuery = supabaseAdmin.from("plaid_raw_product_observations").select("id,item_id,product,raw_response,effective_at,acquired_at").eq("user_id", userId).eq("is_current", true).eq("evidence_state", "observed");
  const scopedEvidenceQuery = selectedItemId ? evidenceQuery.eq("item_id", selectedItemId) : evidenceQuery;
  const rawEvidence = (await scopedEvidenceQuery).data ?? [];
  const evidenceRows = rawEvidence.map(e => ({ run_id: run.id, user_id: userId, evidence_type: "provider_raw_observation", provider: "plaid", product: e.product, raw_observation_id: e.id, effective_at: e.effective_at ?? e.acquired_at, acquired_at: e.acquired_at, evidence_hash: hash(e.raw_response) }));
  if (evidenceRows.length) { const { error: evidenceInsertError } = await supabaseAdmin.from("iris_run_evidence").insert(evidenceRows); if (evidenceInsertError) { await failRun(run.id, userId, `RUN_EVIDENCE_PERSIST_FAILED: ${evidenceInsertError.message}`); throw new Error(`Unable to persist Iris run evidence: ${evidenceInsertError.message}`); } }

  const { data: completeEvidence, error: completeEvidenceError } = await supabaseAdmin.from("iris_run_evidence").select("id,raw_observation_id,evidence_type,provider,product,effective_at,acquired_at,evidence_hash").eq("run_id", run.id).eq("user_id", userId).order("raw_observation_id", { ascending: true });
  if (completeEvidenceError) { await failRun(run.id, userId, `RUN_EVIDENCE_COMPLETE_READ_FAILED: ${completeEvidenceError.message}`); throw new Error(`Unable to read expanded Iris run evidence: ${completeEvidenceError.message}`); }
  if (!completeEvidence?.length) { await failRun(run.id, userId, "RUN_EVIDENCE_EMPTY: selected evidence boundary produced no run evidence"); throw new Error("Unable to establish the Iris run evidence boundary: no run evidence was persisted."); }
  const runEvidenceIds = completeEvidence.map(row => row.id).filter((id): id is string => typeof id === "string").sort();
  const evidenceManifest = completeEvidence.map(row => ({ id: row.id, raw_observation_id: row.raw_observation_id, evidence_type: row.evidence_type, provider: row.provider, product: row.product, effective_at: row.effective_at, acquired_at: row.acquired_at, evidence_hash: row.evidence_hash }));
  const evidenceManifestHash = hash({ run_id: run.id, ...initialManifest, evidence: evidenceManifest });
  const { error: manifestUpdateError } = await supabaseAdmin.from("iris_runs").update({ evidence_manifest_hash: evidenceManifestHash, execution_policy: { ...(run.execution_policy ?? {}), evidence_count: completeEvidence.length, evidence_manifest_bound: true, run_evidence_ids: runEvidenceIds, run_evidence_manifest: evidenceManifest }, updated_at: new Date().toISOString() }).eq("id", run.id).eq("user_id", userId);
  if (manifestUpdateError) { await failRun(run.id, userId, `RUN_EVIDENCE_MANIFEST_UPDATE_FAILED: ${manifestUpdateError.message}`); throw new Error(`Unable to bind Iris run evidence manifest: ${manifestUpdateError.message}`); }

  const executionManifest = { ...initialManifest, run_id: run.id, run_evidence_ids: runEvidenceIds, evidence_count: completeEvidence.length, evidence_manifest_hash: evidenceManifestHash, evidence_manifest: evidenceManifest };
  const inputHash = hash(executionManifest);
  const { data: execution, error: executionError } = await supabaseAdmin.from("iris_execution_records").insert({ run_id: run.id, user_id: userId, capability_id: CAPABILITY_ID, operator_id: EXECUTOR_OPERATOR_ID, operator_version: EXECUTOR_OPERATOR_VERSION, execution_state: "EXECUTING", started_at: asOf, evidence_state: "CALCULATED", validation_status: "UNKNOWN", certification_status: "PENDING", input_manifest: executionManifest, input_hash: inputHash }).select("*").single();
  if (executionError || !execution) { await failRun(run.id, userId, `EXECUTION_RECORD_CREATE_FAILED: ${executionError?.message || "unknown error"}`); throw new Error(`Unable to create Iris execution record: ${executionError?.message || "unknown error"}`); }
  await supabaseAdmin.from("iris_runs").update({ status: "EXECUTING", evidence_version: "provider-observation-boundary-v4", updated_at: new Date().toISOString() }).eq("id", run.id).eq("user_id", userId);
  const { error: inputError } = await supabaseAdmin.from("iris_execution_inputs").insert({ execution_id: execution.id, input_type: "execution_manifest", reference_type: "iris_run", reference_id: run.id, role: "primary", hash: inputHash });
  if (inputError) { await failExecution(run.id, execution.id, userId, "EXECUTION_INPUT_PERSIST_FAILED", inputError.message); throw new Error(`Unable to persist Iris execution input: ${inputError.message}`); }

  try {
    const recursive = await executeRecursiveCapabilityPlan(userId, plan, { runId: run.id, executionId: execution.id, asOf, evidenceBoundary: run.evidence_boundary, evidenceManifestHash, runEvidenceIds, persistLineage: ({ capabilityId, result, dependencyResults }) => persistRecursiveLineage({ userId, runId: run.id, executionId: execution.id, capabilityId, result, dependencyResults, runEvidenceIds }) }, { maxNodes: 10000, maxEdges: 30000, maxCompositions: 5000 });
    if (recursive.status !== "COMPLETED") { const code = recursive.status === "EXECUTION_BUDGET_EXCEEDED" ? "EXECUTION_BUDGET_EXCEEDED" : "RECURSIVE_CAPABILITY_EXECUTION_FAILED"; const message = recursive.error || `Recursive capability execution ended with ${recursive.status}.`; await failExecution(run.id, execution.id, userId, code, message); return { ...run, id: run.id, status: "FAILED", execution_id: execution.id, result: recursive, certified: false }; }
    const result = { architecture_version: "IRIS_RECURSIVE_CAPABILITY_GRAPH_V2", execution_status: recursive.status, requested_capabilities: requestedCapabilities, ordered_capabilities: recursive.ordered_capabilities, executed_capabilities: recursive.executed_capabilities, contracts: plan.contracts, results: recursive.results, graph_node_ids: recursive.graph_node_ids, resource_usage: recursive.resource_usage, arbitrary_recursive_compositions: { materializedNodeIds: [], skippedFindingIds: [] }, evidence_scope: evidenceScope, evidence_boundary: run.evidence_boundary, provenance: { source: "governed_capability_registry_and_run_bound_evidence", run_id: run.id, run_evidence_ids: runEvidenceIds, evidence_manifest_hash: evidenceManifestHash, planner_version: PLANNER_VERSION, executor_version: EXECUTOR_OPERATOR_VERSION, persisted_graph_version: "iris-persisted-intelligence-graph-v6", arbitrary_composition_version: "iris-arbitrary-recursive-composition-v3", financial_values_created: false, provider_observations_created: false, money_movement_executed: false } };
    const outputHash = hash(result); const finishedAt = new Date().toISOString();
    const { error: outputError } = await supabaseAdmin.from("iris_execution_outputs").insert({ execution_id: execution.id, output_key: "recursive_intelligence_graph", output_type: "recursive_intelligence_graph", value: result, hash: outputHash, evidence_state: "CALCULATED", uncertainty: null });
    if (outputError) { await failExecution(run.id, execution.id, userId, "EXECUTION_OUTPUT_PERSIST_FAILED", outputError.message); throw new Error(`Unable to persist Iris execution output: ${outputError.message}`); }
    await supabaseAdmin.from("iris_runs").update({ status: "EXECUTED", completed_at: finishedAt, updated_at: finishedAt }).eq("id", run.id).eq("user_id", userId);
    const { error: executionStateError } = await supabaseAdmin.from("iris_execution_records").update({ execution_state: "EXECUTED", completed_at: finishedAt, input_hash: inputHash, output_hash: outputHash, output_snapshot: { output_key: "recursive_intelligence_graph", output_hash: outputHash, executed_capabilities: recursive.executed_capabilities, resource_usage: recursive.resource_usage }, resource_usage: { duration_ms: Date.parse(finishedAt) - Date.parse(asOf), ...recursive.resource_usage }, validation_status: "UNKNOWN" }).eq("id", execution.id).eq("user_id", userId);
    if (executionStateError) { await failExecution(run.id, execution.id, userId, "EXECUTION_STATE_UPDATE_FAILED", executionStateError.message); throw new Error(`Unable to finalize Iris execution state: ${executionStateError.message}`); }
    const gate = await evaluateCertificationGate({ runId: run.id, executionId: execution.id, userId, inputHash, outputHash });
    const validationRows = Object.entries(gate.checks).map(([ruleId, gateCheck]) => ({ run_id: run.id, execution_id: execution.id, user_id: userId, rule_id: ruleId, rule_version: CERTIFICATION_POLICY_VERSION, status: gateCheck.status, severity: gateCheck.status === "PASS" ? "INFO" : "CRITICAL", expected: { status: "PASS" }, actual: { status: gateCheck.status }, details: { message: gateCheck.details, gate_version: CERTIFICATION_POLICY_VERSION } }));
    const { error: validationError } = await supabaseAdmin.from("iris_validation_results").insert(validationRows);
    if (validationError) { await failExecution(run.id, execution.id, userId, "VALIDATION_PERSIST_FAILED", validationError.message); throw new Error(`Unable to persist Iris validation: ${validationError.message}`); }
    if (!gate.eligible) { const message = `Certification blocked: ${gate.critical_failures.join(", ")}`; await supabaseAdmin.from("iris_execution_records").update({ validation_status: "FAIL", certification_status: "NOT_CERTIFIED" }).eq("id", execution.id).eq("user_id", userId); await supabaseAdmin.from("iris_runs").update({ status: "VALIDATION_FAILED", failure_code: "CERTIFICATION_GATE_FAILED", failure_message: message, updated_at: new Date().toISOString() }).eq("id", run.id).eq("user_id", userId); return { ...run, id: run.id, status: "VALIDATION_FAILED", execution_id: execution.id, result, certified: false, certification_gate: gate }; }
    const { error: validationStateError } = await supabaseAdmin.from("iris_execution_records").update({ validation_status: "PASS" }).eq("id", execution.id).eq("user_id", userId);
    if (validationStateError) { await failExecution(run.id, execution.id, userId, "VALIDATION_STATE_UPDATE_FAILED", validationStateError.message); throw new Error(`Unable to finalize Iris validation state: ${validationStateError.message}`); }
    const certificationHash = hash({ run_id: run.id, execution_id: execution.id, input_hash: inputHash, output_hash: outputHash, policy: CERTIFICATION_POLICY_VERSION, evidence: gate.evidence_snapshot, reconciliation: gate.reconciliation_snapshot });
    const { error: certificationError } = await supabaseAdmin.from("iris_certifications").insert({ run_id: run.id, execution_id: execution.id, user_id: userId, result_id: execution.id, policy_version: CERTIFICATION_POLICY_VERSION, status: "CERTIFIED", validation_snapshot: { status: "PASS", checks: gate.checks }, reconciliation_snapshot: gate.reconciliation_snapshot, evidence_snapshot: gate.evidence_snapshot, certification_hash: certificationHash, certified_at: new Date().toISOString() });
    if (certificationError) { await failExecution(run.id, execution.id, userId, "CERTIFICATION_PERSIST_FAILED", certificationError.message); throw new Error(`Unable to persist Iris certification: ${certificationError.message}`); }
    const certifiedAt = new Date().toISOString();
    const { error: executionCertificationStateError } = await supabaseAdmin.from("iris_execution_records").update({ validation_status: "PASS", certification_status: "CERTIFIED" }).eq("id", execution.id).eq("user_id", userId);
    if (executionCertificationStateError) throw new Error(`Unable to finalize Iris certification state: ${executionCertificationStateError.message}`);
    const { error: runCertificationStateError } = await supabaseAdmin.from("iris_runs").update({ status: "CERTIFIED", completed_at: certifiedAt, updated_at: certifiedAt }).eq("id", run.id).eq("user_id", userId);
    if (runCertificationStateError) throw new Error(`Unable to finalize Iris run certification state: ${runCertificationStateError.message}`);

    try { await publicationRpc("iris_publication_mark_hierarchy_pending", { p_run_id: run.id, p_execution_id: execution.id, p_user_id: userId }); }
    catch (publicationStateError) { return await failPublication(run.id, execution.id, userId, "PUBLICATION_STATE_PERSISTENCE_FAILED", publicationStateError); }
    try { await materializeCertifiedHierarchy({ userId, runId: run.id, executionId: execution.id, certificationHash }); }
    catch (hierarchyError) { return await failPublication(run.id, execution.id, userId, "HIERARCHY_PUBLICATION_FAILED", hierarchyError); }
    try { await publicationRpc("iris_publication_mark_hierarchy_published", { p_run_id: run.id, p_execution_id: execution.id, p_user_id: userId }); }
    catch (publicationStateError) { return await failPublication(run.id, execution.id, userId, "PUBLICATION_STATE_PERSISTENCE_FAILED", publicationStateError); }
    try { await publicationRpc("iris_publication_mark_report_pending", { p_run_id: run.id, p_execution_id: execution.id, p_user_id: userId }); }
    catch (publicationStateError) { return await failPublication(run.id, execution.id, userId, "PUBLICATION_STATE_PERSISTENCE_FAILED", publicationStateError); }
    try { await materializeIrisUserReportInventory({ userId, runId: run.id, executionId: execution.id, certificationHash }); }
    catch (reportError) { return await failPublication(run.id, execution.id, userId, "REPORT_PUBLICATION_FAILED", reportError); }
    try { await publicationRpc("iris_publication_mark_published", { p_run_id: run.id, p_execution_id: execution.id, p_user_id: userId }); }
    catch (publicationStateError) { return await failPublication(run.id, execution.id, userId, "PUBLICATION_STATE_PERSISTENCE_FAILED", publicationStateError); }
    return { ...run, id: run.id, status: "CERTIFIED", execution_id: execution.id, result, certified: true, certification_hash: certificationHash, certification_gate: gate, publication_status: "PUBLISHED" };
  } catch (error) {
    const message = errorText(error);
    if (/^(HIERARCHY_PUBLICATION_FAILED|REPORT_PUBLICATION_FAILED|PUBLICATION_STATE_PERSISTENCE_FAILED):/.test(message)) throw error;
    await failExecution(run.id, execution.id, userId, "INTELLIGENCE_EXECUTION_FAILED", message);
    throw error;
  }
}

async function failExecution(runId: string, executionId: string, userId: string, code: string, message: string) { const now = new Date().toISOString(); await supabaseAdmin.from("iris_execution_records").update({ execution_state: "FAILED", completed_at: now, validation_status: "FAIL", certification_status: "NOT_CERTIFIED", error_code: code, error_message: message }).eq("id", executionId).eq("user_id", userId); await supabaseAdmin.from("iris_runs").update({ status: "FAILED", failure_code: code, failure_message: message, completed_at: now, updated_at: now }).eq("id", runId).eq("user_id", userId); }
async function failRun(runId: string, userId: string, message: string) { const now = new Date().toISOString(); await supabaseAdmin.from("iris_runs").update({ status: "FAILED", failure_code: "EXECUTION_SETUP_FAILED", failure_message: message, completed_at: now, updated_at: now }).eq("id", runId).eq("user_id", userId); }
