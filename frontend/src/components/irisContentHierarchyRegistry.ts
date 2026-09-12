import { flattenWorkspaceRegistry, irisWorkspaceRegistry } from "./irisWorkspaceRegistry";

export type IrisContentKind = "question" | "explanation" | "education" | "workspace" | "report";

export type IrisContentHierarchyLink = {
  id: string;
  kind: IrisContentKind;
  label: string;
  capability_ids: string[];
  hierarchy_node_ids: string[];
  workspace_ids: string[];
};

const capabilityForWorkspace = (id: string): string[] => {
  const root = id.split("/")[0];
  const route = id.toLowerCase();
  if (route.includes("anomal")) return ["anomaly", "behavioral", "pattern"];
  if (route.includes("forecast")) return ["predictive", "temporal", "causal"];
  if (route.includes("scenario")) return ["scenario", "predictive", "risk"];
  if (route.includes("decision") || route.includes("payoff")) return ["decision", "recommendation", "consequence"];
  if (route.includes("risk")) return ["risk", "anomaly", "predictive"];
  if (route.includes("recurr") || route.includes("trend") || route.includes("change") || route.includes("timing")) return ["pattern", "behavioral", "temporal"];
  if (route.includes("merchant") || route.includes("categor") || route.includes("classification") || route.includes("spending")) return ["analysis", "behavioral", "pattern"];
  if (route.includes("income")) return ["financial_life_state", "analysis", "behavioral", "pattern"];
  if (route.includes("debt") || route.includes("liabilit") || route.includes("obligation")) return ["financial_life_state", "analysis", "risk", "opportunity"];
  if (route.includes("networth") || route.includes("asset")) return ["financial_life_state", "relational_ontology", "analysis"];
  if (route.includes("balance") || route.includes("cashflow") || route.includes("liquidity")) return ["financial_life_state", "temporal", "analysis"];
  if (route.includes("evidence") || route.includes("product") || route.includes("sync") || route.includes("data")) return ["financial_life_state", "relational_ontology", "analysis"];
  if (root === "iris") return ["analysis", "relationship", "risk", "opportunity", "predictive", "scenario", "decision", "recommendation", "consequence", "outcome", "learning", "emergent"];
  return ["financial_life_state", "analysis"];
};

export const IRIS_WORKSPACE_CONTENT_LINKS: IrisContentHierarchyLink[] = flattenWorkspaceRegistry(irisWorkspaceRegistry).map((node) => ({
  id: `workspace:${node.id}`,
  kind: "workspace",
  label: node.label,
  capability_ids: capabilityForWorkspace(node.id),
  hierarchy_node_ids: capabilityForWorkspace(node.id).map((id) => `capability.${id}`),
  workspace_ids: [node.id],
}));

export const IRIS_QUESTION_CONTENT_LINKS: IrisContentHierarchyLink[] = [
  ["question.financial_life", "What's happening with my money?", ["financial_life_state", "analysis", "emergent"]],
  ["question.spending_change", "Why did my spending change?", ["behavioral", "pattern", "temporal", "analysis"]],
  ["question.safe_to_spend", "How much is safe to spend?", ["analysis", "predictive", "risk", "decision"]],
  ["question.cashflow", "Explain my cash flow", ["temporal", "analysis", "relationship"]],
  ["question.evidence", "Show me the evidence", ["financial_life_state", "relational_ontology", "analysis"]],
  ["question.hierarchy", "Explain the intelligence hierarchy", ["relational_ontology", "emergent"]],
  ["question.reasoning", "How does IRIS reason from evidence?", ["analysis", "relationship", "causal"]],
  ["question.recursive", "What is recursive intelligence?", ["emergent", "learning"]],
  ["question.lineage", "Explain forward and reverse lineage", ["relational_ontology", "analysis", "emergent"]],
  ["question.unknown_zero", "Why isn't unknown the same as zero?", ["financial_life_state", "analysis"]],
].map(([id, label, capabilities]) => ({
  id: String(id), kind: "question", label: String(label), capability_ids: capabilities as string[], hierarchy_node_ids: (capabilities as string[]).map((capability) => `capability.${capability}`), workspace_ids: ["iris"],
}));

export const IRIS_EXPLANATION_CONTENT_LINKS: IrisContentHierarchyLink[] = [
  ["explanation.evidence", "How Iris knows", ["financial_life_state", "relational_ontology", "analysis"]],
  ["explanation.change", "Why a change is shown", ["temporal", "behavioral", "pattern", "anomaly"]],
  ["explanation.relationship", "Why a relationship exists", ["relationship", "relational_ontology", "analysis"]],
  ["explanation.causality", "Causal boundary", ["causal", "relationship"]],
  ["explanation.prediction", "Prediction and uncertainty", ["predictive", "temporal", "causal"]],
  ["explanation.scenario", "Scenario assumptions", ["scenario", "predictive", "risk"]],
  ["explanation.decision", "Decision tradeoffs", ["decision", "risk", "opportunity", "consequence"]],
  ["explanation.lineage", "Forward and reverse lineage", ["relational_ontology", "analysis", "emergent"]],
].map(([id, label, capabilities]) => ({
  id: String(id), kind: "explanation", label: String(label), capability_ids: capabilities as string[], hierarchy_node_ids: (capabilities as string[]).map((capability) => `capability.${capability}`), workspace_ids: ["iris/reasoning", "iris/evidence"],
}));

export const IRIS_EDUCATION_CONTENT_LINKS: IrisContentHierarchyLink[] = [
  ["education.evidence", "Evidence and epistemic states", ["financial_life_state", "relational_ontology", "analysis"]],
  ["education.hierarchy", "The recursive intelligence hierarchy", ["relational_ontology", "emergent"]],
  ["education.lineage", "Forward and reverse lineage", ["relational_ontology", "analysis", "emergent"]],
  ["education.relationships", "Relationships without unsupported causation", ["relationship", "causal"]],
  ["education.prediction", "Prediction versus observation", ["predictive", "temporal"]],
  ["education.scenarios", "Scenarios versus observed reality", ["scenario", "predictive", "risk"]],
  ["education.outcomes", "Outcomes and learning", ["outcome", "learning"]],
].map(([id, label, capabilities]) => ({
  id: String(id), kind: "education", label: String(label), capability_ids: capabilities as string[], hierarchy_node_ids: (capabilities as string[]).map((capability) => `capability.${capability}`), workspace_ids: ["iris/education", "iris/intelligence"],
}));

export const IRIS_CONTENT_HIERARCHY_LINKS = [
  ...IRIS_WORKSPACE_CONTENT_LINKS,
  ...IRIS_QUESTION_CONTENT_LINKS,
  ...IRIS_EXPLANATION_CONTENT_LINKS,
  ...IRIS_EDUCATION_CONTENT_LINKS,
] as const;

export function getIrisContentHierarchyLink(id: string): IrisContentHierarchyLink | null {
  return IRIS_CONTENT_HIERARCHY_LINKS.find((item) => item.id === id) ?? null;
}

export function validateIrisContentHierarchyLinks(): string[] {
  const errors: string[] = [];
  const validCapabilities = new Set([
    "analysis", "anomaly", "behavioral", "causal", "consequence", "decision", "emergent", "financial_life_state", "learning", "opportunity", "outcome", "pattern", "predictive", "recommendation", "relational_ontology", "relationship", "risk", "scenario", "temporal",
  ]);
  const workspaceIds = new Set(flattenWorkspaceRegistry(irisWorkspaceRegistry).map((node) => node.id));
  const seen = new Set<string>();
  for (const item of IRIS_CONTENT_HIERARCHY_LINKS) {
    if (seen.has(item.id)) errors.push(`Duplicate content link: ${item.id}`);
    seen.add(item.id);
    if (!item.capability_ids.length) errors.push(`Content has no capability link: ${item.id}`);
    if (!item.hierarchy_node_ids.length) errors.push(`Content has no hierarchy node link: ${item.id}`);
    for (const capability of item.capability_ids) if (!validCapabilities.has(capability)) errors.push(`Unknown capability on content ${item.id}: ${capability}`);
    for (const workspace of item.workspace_ids) if (!workspaceIds.has(workspace) && workspace !== "iris/reasoning" && workspace !== "iris/evidence") errors.push(`Unknown workspace on content ${item.id}: ${workspace}`);
  }
  return errors;
}
