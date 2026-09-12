/**
 * Canonical mapping between executable Iris capabilities and the complete
 * financial-life hierarchy.
 *
 * Capability families are NOT hierarchy levels. They are executable semantic
 * operations that attach to one or more Level-2 domains and can consume or
 * produce related content anywhere in the recursive hierarchy.
 *
 * This module contains metadata only. It creates no financial observations,
 * values, outcomes, or intelligence findings.
 */
import { IRIS_DOMAIN_INTELLIGENCES } from "./irisIntelligenceHierarchy.js";
import { EXECUTABLE_CAPABILITY_OPERATORS } from "./capabilityOperators.js";
import { IRIS_CATALOG } from "./irisCatalog.js";
import { IRIS_CATALOG_EXPANSION } from "./irisCatalogExpansion.js";
import { IRIS_ANALYSIS_ATLAS } from "./analysisAtlas.js";
import { IRIS_REPORT_CATALOG } from "./irisReportCatalog.js";

export type IrisCapabilityHierarchyMapping = {
  capability_id: string;
  hierarchy_domain_ids: string[];
  related_capability_ids: string[];
  related_catalog_capability_ids: string[];
  related_analysis_ids: string[];
  related_report_ids: string[];
  related_content_kinds: string[];
  related_workspace_roots: string[];
  recursive: true;
};

const ALL_CATALOG = [...IRIS_CATALOG, ...IRIS_CATALOG_EXPANSION];
const ALL_DOMAIN_IDS = IRIS_DOMAIN_INTELLIGENCES.map((domain) => domain.domain_id);
const capabilityIds = EXECUTABLE_CAPABILITY_OPERATORS.map((operator) => operator.capability_id);

const DOMAIN_SCOPE: Record<string, string[]> = {
  temporal: ["transactions", "balance"],
  financial_life_state: ["transactions", "balance", "identity", "assets", "liabilities", "investments", "statements"],
  relational_ontology: ALL_DOMAIN_IDS,
  analysis: ALL_DOMAIN_IDS,
  behavioral: ["transactions", "balance"],
  pattern: ["transactions", "balance"],
  relationship: ALL_DOMAIN_IDS,
  anomaly: ["transactions", "balance"],
  causal: ALL_DOMAIN_IDS,
  predictive: ALL_DOMAIN_IDS,
  scenario: ALL_DOMAIN_IDS,
  decision: ALL_DOMAIN_IDS,
  recommendation: ALL_DOMAIN_IDS,
  risk: ALL_DOMAIN_IDS,
  opportunity: ALL_DOMAIN_IDS,
  consequence: ALL_DOMAIN_IDS,
  outcome: ALL_DOMAIN_IDS,
  learning: ALL_DOMAIN_IDS,
  emergent: ALL_DOMAIN_IDS,
};

const CAPABILITY_RELATIONS: Record<string, string[]> = {
  temporal: ["analysis", "behavioral", "pattern", "predictive"],
  financial_life_state: ["relational_ontology", "analysis", "relationship", "risk", "opportunity"],
  relational_ontology: ["financial_life_state", "relationship", "analysis", "behavioral", "causal"],
  analysis: ["temporal", "financial_life_state", "behavioral", "pattern", "anomaly", "causal", "predictive", "risk", "opportunity"],
  behavioral: ["analysis", "pattern", "relationship", "anomaly", "risk", "opportunity"],
  pattern: ["analysis", "behavioral", "relationship", "anomaly", "causal"],
  relationship: ["pattern", "relational_ontology", "causal", "analysis"],
  anomaly: ["analysis", "temporal", "behavioral", "pattern", "risk"],
  causal: ["relationship", "analysis", "predictive", "risk", "opportunity", "consequence"],
  predictive: ["causal", "temporal", "risk", "scenario", "decision"],
  scenario: ["predictive", "risk", "decision", "recommendation", "opportunity", "consequence"],
  decision: ["scenario", "risk", "recommendation", "consequence", "outcome"],
  recommendation: ["decision", "scenario", "opportunity", "consequence", "outcome"],
  risk: ["analysis", "behavioral", "anomaly", "predictive", "scenario", "decision", "consequence"],
  opportunity: ["analysis", "behavioral", "scenario", "recommendation", "decision", "consequence"],
  consequence: ["risk", "opportunity", "scenario", "decision", "outcome"],
  outcome: ["decision", "recommendation", "consequence", "learning"],
  learning: ["outcome", "decision", "recommendation", "emergent"],
  emergent: capabilityIds.filter((id) => id !== "emergent"),
};

const WORKSPACE_ROOTS: Record<string, string[]> = {
  temporal: ["money", "cashflow", "spending", "iris"],
  financial_life_state: ["money", "networth", "iris"],
  relational_ontology: ["money", "cashflow", "spending", "obligations", "income", "debt", "networth", "iris"],
  analysis: ["money", "cashflow", "spending", "obligations", "income", "debt", "networth", "iris"],
  behavioral: ["spending", "obligations", "income", "iris"],
  pattern: ["spending", "obligations", "income", "iris"],
  relationship: ["money", "spending", "obligations", "income", "debt", "networth", "iris"],
  anomaly: ["spending", "iris"],
  causal: ["money", "cashflow", "spending", "debt", "networth", "iris"],
  predictive: ["cashflow", "obligations", "income", "debt", "networth", "iris"],
  scenario: ["cashflow", "spending", "obligations", "debt", "networth", "iris"],
  decision: ["money", "cashflow", "spending", "obligations", "debt", "networth", "iris"],
  recommendation: ["money", "cashflow", "spending", "obligations", "debt", "networth", "iris"],
  risk: ["money", "cashflow", "spending", "obligations", "income", "debt", "networth", "iris"],
  opportunity: ["money", "cashflow", "spending", "obligations", "income", "debt", "networth", "iris"],
  consequence: ["money", "cashflow", "spending", "obligations", "debt", "networth", "iris"],
  outcome: ["money", "cashflow", "spending", "obligations", "income", "debt", "networth", "iris"],
  learning: ["money", "cashflow", "spending", "obligations", "income", "debt", "networth", "iris"],
  emergent: ["money", "cashflow", "spending", "obligations", "income", "debt", "networth", "iris"],
};

const CONTENT_KINDS: Record<string, string[]> = {
  temporal: ["observed_evidence", "canonical_state", "calculation", "intelligence", "explanation", "report"],
  financial_life_state: ["observed_evidence", "canonical_state", "calculation", "ontology", "intelligence", "explanation", "report"],
  relational_ontology: ["observed_evidence", "canonical_state", "ontology", "intelligence", "higher_order_intelligence", "recursive_intelligence", "explanation", "report"],
  analysis: ["observed_evidence", "canonical_state", "calculation", "ontology", "intelligence", "explanation", "report"],
  behavioral: ["observed_evidence", "calculation", "intelligence", "explanation", "report"],
  pattern: ["observed_evidence", "calculation", "intelligence", "explanation", "report"],
  relationship: ["observed_evidence", "canonical_state", "ontology", "intelligence", "higher_order_intelligence", "explanation", "report"],
  anomaly: ["observed_evidence", "calculation", "intelligence", "explanation", "report"],
  causal: ["observed_evidence", "canonical_state", "ontology", "intelligence", "explanation", "report"],
  predictive: ["canonical_state", "calculation", "intelligence", "scenario", "explanation", "report"],
  scenario: ["canonical_state", "intelligence", "scenario", "decision", "consequence", "explanation", "report"],
  decision: ["canonical_state", "intelligence", "scenario", "decision", "consequence", "explanation", "report"],
  recommendation: ["canonical_state", "intelligence", "decision", "consequence", "explanation", "report"],
  risk: ["canonical_state", "intelligence", "higher_order_intelligence", "scenario", "decision", "consequence", "explanation", "report"],
  opportunity: ["canonical_state", "intelligence", "higher_order_intelligence", "scenario", "decision", "consequence", "explanation", "report"],
  consequence: ["canonical_state", "intelligence", "scenario", "decision", "consequence", "outcome", "explanation", "report"],
  outcome: ["canonical_state", "intelligence", "decision", "consequence", "outcome", "explanation", "report"],
  learning: ["canonical_state", "intelligence", "higher_order_intelligence", "recursive_intelligence", "outcome", "explanation", "report"],
  emergent: ["observed_evidence", "canonical_state", "calculation", "ontology", "intelligence", "higher_order_intelligence", "recursive_intelligence", "scenario", "decision", "consequence", "outcome", "explanation", "report"],
};

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function catalogForCapability(capabilityId: string) {
  const familyHints: Record<string, string[]> = {
    temporal: ["temporal"],
    financial_life_state: ["state"],
    relational_ontology: ["synthesis", "state"],
    analysis: ["state", "cash_flow", "spending", "temporal", "debt", "forecast", "roundups", "causal", "decisions", "evidence", "synthesis"],
    behavioral: ["behavior", "spending", "roundups"],
    pattern: ["behavior", "spending", "temporal"],
    relationship: ["synthesis", "cash_flow", "spending", "debt"],
    anomaly: ["behavior"],
    causal: ["causal", "state", "spending", "debt"],
    predictive: ["forecast", "temporal", "roundups"],
    scenario: ["decisions", "forecast", "debt", "roundups"],
    decision: ["decisions", "state", "forecast", "causal"],
    recommendation: ["decisions", "spending", "debt", "roundups"],
    risk: ["state", "cash_flow", "spending", "behavior", "debt", "forecast", "causal"],
    opportunity: ["state", "spending", "debt", "roundups", "decisions"],
    consequence: ["decisions", "debt", "state"],
    outcome: ["decisions", "state", "synthesis"],
    learning: ["education", "synthesis", "decisions"],
    emergent: ALL_CATALOG.map((capability) => capability.family),
  };
  const hints = familyHints[capabilityId] ?? [];
  return ALL_CATALOG.filter((capability) => hints.includes(capability.family) || capability.id === capabilityId);
}

export const IRIS_CAPABILITY_HIERARCHY: IrisCapabilityHierarchyMapping[] = capabilityIds.map((capabilityId) => {
  const catalogCapabilities = catalogForCapability(capabilityId);
  const catalogIds = unique(catalogCapabilities.map((capability) => capability.id));
  const analysisIds = unique(catalogCapabilities.flatMap((capability) => capability.atlas_ids));
  const reportIds = unique(IRIS_REPORT_CATALOG.filter((report) => analysisIds.includes(report.analysisId)).map((report) => report.reportId));
  return {
    capability_id: capabilityId,
    hierarchy_domain_ids: unique(DOMAIN_SCOPE[capabilityId] ?? ALL_DOMAIN_IDS),
    related_capability_ids: unique(CAPABILITY_RELATIONS[capabilityId] ?? []),
    related_catalog_capability_ids: catalogIds,
    related_analysis_ids: analysisIds,
    related_report_ids: reportIds,
    related_content_kinds: [...(CONTENT_KINDS[capabilityId] ?? ["intelligence", "explanation", "report"])],
    related_workspace_roots: [...(WORKSPACE_ROOTS[capabilityId] ?? ["iris"])],
    recursive: true,
  };
});

export function getIrisCapabilityHierarchyMapping(capabilityId: string): IrisCapabilityHierarchyMapping | null {
  return IRIS_CAPABILITY_HIERARCHY.find((mapping) => mapping.capability_id === capabilityId) ?? null;
}

export function validateIrisCapabilityHierarchyMapping(): string[] {
  const errors: string[] = [];
  const mapped = new Set(IRIS_CAPABILITY_HIERARCHY.map((mapping) => mapping.capability_id));
  const registered = new Set(capabilityIds);
  for (const capabilityId of registered) if (!mapped.has(capabilityId)) errors.push(`Capability is not mapped into the Iris hierarchy: ${capabilityId}`);
  for (const capabilityId of mapped) if (!registered.has(capabilityId)) errors.push(`Hierarchy mapping has no executable capability: ${capabilityId}`);
  for (const mapping of IRIS_CAPABILITY_HIERARCHY) {
    if (mapping.hierarchy_domain_ids.length === 0) errors.push(`Capability has no hierarchy domain mapping: ${mapping.capability_id}`);
    if (mapping.related_content_kinds.length === 0) errors.push(`Capability has no related content mapping: ${mapping.capability_id}`);
    if (mapping.related_workspace_roots.length === 0) errors.push(`Capability has no workspace mapping: ${mapping.capability_id}`);
    if (!mapping.recursive) errors.push(`Capability is not marked recursive: ${mapping.capability_id}`);
  }
  return errors;
}
