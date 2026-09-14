import { assessTrajectory } from "./temporal.js";
import { computeCanonicalWindowFlows, computeEconomicCashFlow, type CanonicalTransaction } from "./transactionSemantics.js";
import { executeAnalysis, executeBehavioral, executePattern, executeRelationship, executeAnomaly, executeCausal, executePredictive, executeScenario, executeDecision, executeRecommendation, executeOutcome, executeLearning } from "./recursiveOperators.js";
import { executeFinancialLifeState, executeRelationalOntology } from "./foundationalIntelligenceOperators.js";
import { executeRisk, executeOpportunity, executeConsequence } from "./riskOpportunityConsequenceOperators.js";
import { buildRecursiveIntelligenceSynthesis } from "./recursiveIntelligenceSynthesis.js";
import type { SemanticDependencyProof } from "./semanticDependencyProof.js";
import { supabaseAdmin } from "../config/supabase.js";

export type CapabilityOperatorStatus = "implemented" | "planned";
export type GovernedCapabilityResult = { layer_metrics?: { provider_domains?: { selected_item_id?: string | null } }; uncertainty?: unknown; [key: string]: unknown };
export type CapabilityExecutionContext = {
  asOf?: string | null;
  evidenceBoundary?: string | null;
  runId?: string | null;
  executionId?: string | null;
  evidenceManifestHash?: string | null;
  runEvidenceIds?: string[];
  dependencyResults?: Record<string, CapabilityOperatorResult>;
  scenarioAssumptions?: Array<{ reductionPct: number }>;
  persistLineage?: (input: { capabilityId: string; result: CapabilityOperatorResult; dependencyResults: Record<string, CapabilityOperatorResult> }) => Promise<void>;
  persistGraphNode?: (input: { capabilityId: string; result: CapabilityOperatorResult; dependencyResults: Record<string, CapabilityOperatorResult>; dependencyNodeIds: Record<string, string> }) => Promise<{ id: string }>;
  persistSemanticDependencyProof?: (input: { capabilityId: string; dependencyResults: Record<string, CapabilityOperatorResult>; consumedDependencyIds: string[]; result: CapabilityOperatorResult; proof: SemanticDependencyProof }) => Promise<void>;
  persistSemanticTransformationEdges?: (input: { capabilityId: string; result: CapabilityOperatorResult; dependencyResults: Record<string, CapabilityOperatorResult>; dependencyNodeIds: Record<string, string>; consumedDependencyIds: string[]; consumedDependencyPaths: Record<string, Set<string>>; proof: SemanticDependencyProof; downstreamNodeId: string }) => Promise<void>;
};
export type CapabilityOperatorResult = { capability_id: string; operator_id: string; operator_version: string; evidence_state: "CALCULATED" | "INFERRED" | "PREDICTED" | "SCENARIO" | "INSUFFICIENT_EVIDENCE"; result: GovernedCapabilityResult };
export type CapabilityOperator = { capability_id: string; operator_id: string; version: string; status: CapabilityOperatorStatus; execution_stage: string; evidence_state: CapabilityOperatorResult["evidence_state"]; execute?: (userId: string, context?: CapabilityExecutionContext) => Promise<CapabilityOperatorResult> };

/** Level 3 Temporal transforms the certified/published Level 2 hierarchy; it does not independently reread provider/canonical transactions. */
async function readCertifiedLevel2Transactions(userId: string): Promise<{ transactions: CanonicalTransaction[]; parent: { runId: string; executionId: string; outputHash: string; evidenceBoundary: string } | null }> {
  const { data: parentRun, error: parentRunError } = await supabaseAdmin.from("iris_runs").select("id,status,publication_status,evidence_boundary").eq("user_id", userId).eq("request_mode", "level2_domain_intelligence").eq("status", "CERTIFIED").eq("publication_status", "HIERARCHY_PUBLISHED").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (parentRunError) throw parentRunError;
  if (!parentRun) return { transactions: [], parent: null };
  const { data: parentExecution, error: parentExecutionError } = await supabaseAdmin.from("iris_execution_records").select("id,output_hash,execution_state,validation_status,certification_status").eq("run_id", parentRun.id).eq("user_id", userId).eq("execution_state", "EXECUTED").eq("validation_status", "PASS").eq("certification_status", "CERTIFIED").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (parentExecutionError) throw parentExecutionError;
  if (!parentExecution?.id || !parentExecution.output_hash) return { transactions: [], parent: null };
  const { data: parentOutput, error: parentOutputError } = await supabaseAdmin.from("iris_execution_outputs").select("value,hash").eq("execution_id", parentExecution.id).eq("output_key", "level2_domain_intelligence").maybeSingle();
  if (parentOutputError) throw parentOutputError;
  if (!parentOutput?.value || parentOutput.hash !== parentExecution.output_hash) return { transactions: [], parent: null };
  const output = parentOutput.value as { domains?: Array<{ domain_key?: string; canonical_fields?: Array<{ field_key?: string; label?: string; value?: unknown; evidence_state?: string }> }> };
  const transactionDomain = (output.domains ?? []).find((domain) => domain.domain_key === "transactions");
  const transactions: CanonicalTransaction[] = [];
  for (const field of transactionDomain?.canonical_fields ?? []) {
    if (!field.field_key?.startsWith("transaction:") || field.evidence_state !== "OBSERVED") continue;
    if (!field.value || typeof field.value !== "object") continue;
    const row = field.value as Record<string, unknown>;
    const id = field.field_key.slice("transaction:".length);
    const amount = typeof row.amount === "number" ? row.amount : Number(row.amount);
    const postedDate = typeof row.posted_date === "string" ? row.posted_date : null;
    if (!id || !Number.isFinite(amount) || !postedDate) continue;
    transactions.push({ id, account_id: "level2:transactions", amount, posted_date: postedDate, transaction_class: typeof row.transaction_class === "string" ? row.transaction_class : "unknown", classification_evidence: "observed", plaid_category_primary: null, plaid_category_detailed: null, merchant_id: null, merchant_name: typeof field.label === "string" ? field.label : null, subdomain: null, domain: null });
  }
  transactions.sort((a, b) => a.posted_date.localeCompare(b.posted_date) || a.id.localeCompare(b.id));
  return { transactions, parent: { runId: parentRun.id, executionId: parentExecution.id, outputHash: parentOutput.hash, evidenceBoundary: parentRun.evidence_boundary } };
}

const temporalOperator: CapabilityOperator = {
  capability_id: "temporal", operator_id: "temporal", version: "1.0.0", status: "implemented", execution_stage: "certified_level2_temporal_transformation", evidence_state: "CALCULATED",
  execute: async (userId, context) => {
    const windowsDays = [7, 30, 90, 180, 365] as const;
    const boundary = context?.evidenceBoundary ?? context?.asOf ?? null;
    const source = await readCertifiedLevel2Transactions(userId);
    if (!source.parent) return { capability_id: "temporal", operator_id: "temporal", operator_version: "1.0.0", evidence_state: "INSUFFICIENT_EVIDENCE", result: { evidence: { state: "insufficient_evidence", source: "certified_published_level2" }, limitation: "Temporal requires a certified and hierarchy-published Level 2 parent. No substitute value is generated.", provenance: { source: "certified_published_level2", provider_observations_created: false, financial_values_created: false, money_movement_executed: false, run_id: context?.runId ?? null, parent_level2: null } } };
    if (!source.transactions.length) return { capability_id: "temporal", operator_id: "temporal", operator_version: "1.0.0", evidence_state: "INSUFFICIENT_EVIDENCE", result: { evidence: { state: "insufficient_evidence", source: "certified_published_level2", parent_run_id: source.parent.runId }, limitation: "Certified Level 2 contains no observed transaction records usable for temporal transformation. No substitute value is generated.", provenance: { source: "certified_published_level2", provider_observations_created: false, financial_values_created: false, money_movement_executed: false, run_id: context?.runId ?? null, parent_level2: source.parent } } };
    const windows = computeCanonicalWindowFlows(source.transactions, windowsDays, context?.asOf ?? undefined, context?.runId ?? undefined, boundary);
    const trajectory = assessTrajectory(windows as any);
    const state = windows.some((window) => window.economicTxCount > 0) ? "CALCULATED" : "INSUFFICIENT_EVIDENCE";
    const cashFlow = computeEconomicCashFlow(source.transactions);
    return { capability_id: "temporal", operator_id: "temporal", operator_version: "1.0.0", evidence_state: state, result: { windows, trajectory, temporal_input: { source: "certified_published_level2", parent_level2_run_id: source.parent.runId, parent_level2_execution_id: source.parent.executionId, parent_level2_output_hash: source.parent.outputHash, observed_transaction_records_consumed: source.transactions.length }, level2_transformation: { observed_inflow: cashFlow.inflow, observed_outflow: cashFlow.outflow, observed_net: cashFlow.net, transaction_count: source.transactions.length }, evidence_boundary: boundary, evidence: { state: state === "CALCULATED" ? "calculated" : "insufficient_evidence", source: "certified_published_level2", transaction_count: source.transactions.length, provider_observations_created: false, financial_values_created: false, money_movement_executed: false }, provenance: { source: "certified_published_level2", provider_observations_created: false, financial_values_created: false, money_movement_executed: false, run_id: context?.runId ?? null, evidence_manifest_hash: context?.evidenceManifestHash ?? null, run_evidence_ids: [...(context?.runEvidenceIds ?? [])].sort(), evidence_boundary: boundary, parent_level2: source.parent } } };
  },
};

const REQUIRED_UPSTREAM: Record<string, string[]> = { analysis: ["temporal"], behavioral: ["analysis"], pattern: ["analysis", "behavioral"], relationship: ["pattern", "relational_ontology"], anomaly: ["analysis", "temporal", "behavioral", "pattern"], causal: ["relationship"], predictive: ["causal", "temporal"], scenario: ["predictive", "risk"], decision: ["scenario", "risk"], recommendation: ["decision"], risk: ["analysis", "behavioral", "anomaly", "predictive"], opportunity: ["analysis", "behavioral", "scenario", "recommendation"], consequence: ["risk", "opportunity", "scenario", "decision"], outcome: ["decision", "recommendation"], learning: ["outcome"] };

function evidenceGated(capabilityId: string, execute: NonNullable<CapabilityOperator["execute"]>): CapabilityOperator["execute"] { return async (userId, context) => { const required = REQUIRED_UPSTREAM[capabilityId] ?? []; const missing = required.filter((dependency) => { const result = context?.dependencyResults?.[dependency]; return !result || result.evidence_state === "INSUFFICIENT_EVIDENCE"; }); if (missing.length) return { capability_id: capabilityId, operator_id: capabilityId, operator_version: capabilityId === "learning" ? "1.1.0" : "1.0.0", evidence_state: "INSUFFICIENT_EVIDENCE", result: { evidence: { state: "insufficient_evidence", source: "required_governed_upstream_capabilities" }, limitation: `Required real upstream capability evidence is not available: ${missing.join(", ")}. No substitute value is generated.`, provenance: { source: "required_governed_upstream_capabilities", provider_observations_created: false, financial_values_created: false, money_movement_executed: false, run_id: context?.runId ?? null, evidence_manifest_hash: context?.evidenceManifestHash ?? null, run_evidence_ids: [...(context?.runEvidenceIds ?? [])].sort(), evidence_boundary: context?.evidenceBoundary ?? context?.asOf ?? null, dependency_capabilities: required.map((dependency) => ({ capability_id: dependency, evidence_state: context?.dependencyResults?.[dependency]?.evidence_state ?? "INSUFFICIENT_EVIDENCE" })) } } }; return execute(userId, context); }; }

const executePredictiveAccurate: NonNullable<CapabilityOperator["execute"]> = async (userId, context) => {
  const base = await executePredictive(userId, context);
  if (base.evidence_state === "INSUFFICIENT_EVIDENCE") return base;
  const transactions = await (async () => {
    const source = await readCertifiedLevel2Transactions(userId);
    return source.transactions;
  })();
  if (transactions.length < 2) return base;
  const times = transactions.map(tx => new Date(tx.posted_date).getTime()).filter(Number.isFinite);
  if (times.length < 2) return base;
  const spanDays = Math.max(1, Math.ceil((Math.max(...times) - Math.min(...times)) / 86_400_000) + 1);
  const net = computeEconomicCashFlow(transactions).net;
  return { ...base, result: { ...base.result, historical_daily_net_rate: net / spanDays, historical_observation_span_days: spanDays } };
};

const executeDecisionAccurate: NonNullable<CapabilityOperator["execute"]> = async (userId, context) => { const scenario = context?.dependencyResults?.scenario?.result; const risk = context?.dependencyResults?.risk?.result; const scenarioOutputs = scenario?.scenarios; const riskSignals = risk?.risk_signals; if (scenarioOutputs === undefined || riskSignals === undefined) return { capability_id: "decision", operator_id: "decision", operator_version: "1.0.0", evidence_state: "INSUFFICIENT_EVIDENCE", result: { options: [], limitation: "Decision requires scenario scenarios and risk signals as governed upstream outputs." } }; return executeDecision(userId, context); };
const executeAnalysisAccurate: NonNullable<CapabilityOperator["execute"]> = async (userId, context) => { const temporalResult = context?.dependencyResults?.temporal?.result; const temporalTrajectory = temporalResult?.trajectory; if (temporalResult === undefined) return { capability_id: "analysis", operator_id: "analysis", operator_version: "1.0.0", evidence_state: "INSUFFICIENT_EVIDENCE", result: { limitation: "Analysis requires temporal output as governed upstream evidence." } }; const base = await executeAnalysis(userId, context); return { ...base, result: { ...base.result, temporal_context: temporalResult, temporal_trajectory: temporalTrajectory } }; };
function op(capability_id: string, execute: CapabilityOperator["execute"], evidence_state: CapabilityOperatorResult["evidence_state"], execution_stage: string, version = "1.0.0"): CapabilityOperator { return { capability_id, operator_id: capability_id, version, status: "implemented", execution_stage, evidence_state, execute: execute ? evidenceGated(capability_id, execute) : undefined }; }
const financialLifeStateOperator: CapabilityOperator = op("financial_life_state", executeFinancialLifeState, "CALCULATED", "canonical_financial_life_state");
const relationalOntologyOperator: CapabilityOperator = { capability_id: "relational_ontology", operator_id: "relational_ontology", version: "1.0.0", status: "implemented", execution_stage: "relational_ontology_expansion", evidence_state: "CALCULATED", execute: executeRelationalOntology };
const emergentOperator: CapabilityOperator = { capability_id: "emergent", operator_id: "emergent", version: "1.1.0", status: "implemented", execution_stage: "recursive_higher_order_synthesis", evidence_state: "INFERRED", execute: async (_userId, context) => { const dependencyResults = context?.dependencyResults ?? {}; const usableDependencies = Object.fromEntries(Object.entries(dependencyResults).filter(([, value]) => value.evidence_state !== "INSUFFICIENT_EVIDENCE")); if (!Object.keys(usableDependencies).length) return { capability_id: "emergent", operator_id: "emergent", operator_version: "1.1.0", evidence_state: "INSUFFICIENT_EVIDENCE", result: { evidence: { state: "insufficient_evidence", source: "governed_run_capability_outputs" }, limitation: "No real upstream intelligence output is sufficiently evidenced for higher-order composition. No substitute intelligence is generated.", provenance: { source: "governed_run_capability_outputs", provider_observations_created: false, financial_values_created: false, money_movement_executed: false, run_id: context?.runId ?? null, evidence_manifest_hash: context?.evidenceManifestHash ?? null, run_evidence_ids: [...(context?.runEvidenceIds ?? [])].sort(), evidence_boundary: context?.evidenceBoundary ?? context?.asOf ?? null } } }; const synthesis = buildRecursiveIntelligenceSynthesis(usableDependencies, context); return { capability_id: "emergent", operator_id: "emergent", operator_version: "1.1.0", evidence_state: synthesis.evidence_profile.inferred > 0 || synthesis.evidence_profile.predicted > 0 || synthesis.evidence_profile.scenario > 0 ? "INFERRED" : "CALCULATED", result: { ...synthesis, evidence: { state: synthesis.evidence_profile.complete ? "inferred" : "calculated", source: "governed_run_capability_outputs", dependency_count: Object.keys(usableDependencies).length }, provenance: { ...synthesis.provenance, source: "governed_run_capability_outputs" } } }; } };
export const EXECUTABLE_CAPABILITY_OPERATORS: CapabilityOperator[] = [ temporalOperator, financialLifeStateOperator, relationalOntologyOperator, op("analysis", executeAnalysisAccurate, "CALCULATED", "canonical_semantic_analysis"), op("behavioral", executeBehavioral, "CALCULATED", "category_behavior"), op("pattern", executePattern, "CALCULATED", "pattern_composition"), op("relationship", executeRelationship, "INFERRED", "financial_relationship_analysis"), op("anomaly", executeAnomaly, "CALCULATED", "canonical_anomaly_detection"), op("causal", executeCausal, "INFERRED", "observational_candidate_analysis"), op("predictive", executePredictiveAccurate, "PREDICTED", "constrained_forward_projection"), op("scenario", executeScenario, "SCENARIO", "counterfactual_spending_analysis"), op("decision", executeDecisionAccurate, "INFERRED", "decision_intelligence"), op("recommendation", executeRecommendation, "INFERRED", "review_recommendations"), op("risk", executeRisk, "INFERRED", "risk_signal_synthesis"), op("opportunity", executeOpportunity, "INFERRED", "opportunity_investigation_synthesis"), op("consequence", executeConsequence, "INFERRED", "conditional_consequence_propagation"), op("outcome", executeOutcome, "CALCULATED", "durable_outcome_loop"), op("learning", executeLearning, "INFERRED", "validated_outcome_learning", "1.1.0"), emergentOperator ];
export function getCapabilityOperator(capabilityId: string): CapabilityOperator | null { return EXECUTABLE_CAPABILITY_OPERATORS.find((operator) => operator.capability_id === capabilityId) ?? null; }
