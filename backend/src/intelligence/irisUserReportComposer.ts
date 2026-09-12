import { createHash } from "node:crypto";
import { supabaseAdmin } from "../config/supabase.js";

type ReportContentBlock = {
  kind: "intelligence" | "observed_evidence" | "derived_state" | "scenario" | "explanation" | "outcome" | "report";
  id: string;
  name: string;
  value: Record<string, unknown> | null;
  evidence_state: string;
  source_report_id?: string | null;
};

type RuntimeNode = {
  id: string;
  intelligence_key: string | null;
  intelligence_name: string | null;
  capability_id: string | null;
  value: Record<string, unknown> | null;
  evidence_state: string;
  recursive_depth: number | null;
  upstream_node_ids: string[] | null;
};

const EMPOWERMENT_WEIGHTS: Array<[RegExp, number]> = [
  [/decision|next[ ._-]?best|action|choice/i, 100],
  [/opportunity|optimization|goal/i, 95],
  [/consequence|resilience|safety/i, 92],
  [/risk|pressure|vulnerability/i, 90],
  [/forecast|projection|trajectory|outlook/i, 86],
  [/causal|driver|reasoning/i, 84],
  [/behavior|change|anomaly/i, 80],
  [/liquidity|cash[ ._-]?flow|debt/i, 76],
  [/state|position/i, 70],
];

const KIND_WEIGHTS: Record<ReportContentBlock["kind"], number> = {
  decision: 0,
  intelligence: 8,
  derived_state: 6,
  scenario: 5,
  outcome: 4,
  report: 3,
  explanation: 2,
  observed_evidence: 0,
} as Record<string, number>;

function hash(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function normalizeName(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function numericMetadata(value: Record<string, unknown> | null, keys: string[]): number {
  if (!value) return 0;
  for (const key of keys) {
    const candidate = value[key];
    if (typeof candidate === "number" && Number.isFinite(candidate)) return candidate;
  }
  return 0;
}

function empowermentScore(block: ReportContentBlock): number {
  const explicitEmpowerment = numericMetadata(block.value, ["empowerment_score", "user_empowerment_score", "empowermentScore"]);
  const explicitImportance = numericMetadata(block.value, ["importance_score", "importanceScore", "priority_score"]);
  const semanticWeight = EMPOWERMENT_WEIGHTS.find(([pattern]) => pattern.test(block.name))?.[1] ?? 50;
  const evidenceWeight = ["OBSERVED", "CALCULATED"].includes(block.evidence_state) ? 10 : 0;
  const kindWeight = KIND_WEIGHTS[block.kind] ?? 0;
  return (explicitEmpowerment * 1000) + (explicitImportance * 100) + semanticWeight + evidenceWeight + kindWeight;
}

function choosePrimary(blocks: ReportContentBlock[]): ReportContentBlock {
  if (!blocks.length) throw new Error("IRIS_USER_REPORT_COMPOSITION_EMPTY");
  return [...blocks].sort((a, b) => empowermentScore(b) - empowermentScore(a) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id))[0];
}

function buildDescription(primary: ReportContentBlock, blocks: ReportContentBlock[]): string {
  const names = [...new Set(blocks.map((block) => normalizeName(block.name)).filter(Boolean))];
  const supporting = names.filter((name) => name !== primary.name).slice(0, 4);
  return supporting.length
    ? `${primary.name} report combining ${supporting.join(", ")} from the certified IRIS hierarchy.`
    : `${primary.name} report generated from the certified IRIS hierarchy.`;
}

export function composeIrisUserReport(input: {
  userId: string;
  runId: string;
  executionId: string;
  certificationHash: string;
  blocks: ReportContentBlock[];
  sourceEvidenceIds?: string[];
  sourceReportIds?: string[];
}) {
  const blocks = input.blocks.filter((block) => block.id.trim() && block.name.trim() && block.evidence_state.trim());
  const primary = choosePrimary(blocks);
  const normalizedBlocks = [...blocks].sort((a, b) => a.id.localeCompare(b.id));
  const composition = {
    version: "IRIS_USER_REPORT_COMPOSITION_V2",
    rule: "IRIS may combine any governed hierarchy content available to this execution, whether it contains intelligence, does not contain intelligence, or mixes both; it selects the most important or empowering actual content as the report title anchor.",
    primary_content: { kind: primary.kind, id: primary.id, name: primary.name, empowerment_score: empowermentScore(primary) },
    content_count: normalizedBlocks.length,
    content_ids: normalizedBlocks.map((block) => block.id),
    content_kinds: normalizedBlocks.map((block) => ({ id: block.id, kind: block.kind, evidence_state: block.evidence_state })),
    source_evidence_ids: [...new Set(input.sourceEvidenceIds ?? [])].sort(),
    source_report_ids: [...new Set(input.sourceReportIds ?? [])].sort(),
  };
  const compositionHash = hash({ user_id: input.userId, run_id: input.runId, execution_id: input.executionId, certification_hash: input.certificationHash, composition });
  return {
    report_id: `user-report.${compositionHash.slice(0, 24)}`,
    title: normalizeName(primary.name),
    description: buildDescription(primary, normalizedBlocks),
    primary_content_kind: primary.kind,
    primary_content_id: primary.id,
    content_node_ids: normalizedBlocks.filter((block) => block.kind !== "observed_evidence").map((block) => block.id),
    source_evidence_ids: [...new Set(input.sourceEvidenceIds ?? [])].sort(),
    source_report_ids: [...new Set(input.sourceReportIds ?? [])].sort(),
    content: { blocks: normalizedBlocks },
    composition,
    composition_hash: compositionHash,
    certification_hash: input.certificationHash,
  };
}

export async function materializeIrisUserReportInventory(input: { userId: string; runId: string; executionId: string; certificationHash: string }): Promise<void> {
  const { data: nodes, error: nodeError } = await supabaseAdmin
    .from("iris_user_intelligence_nodes")
    .select("id,intelligence_key,intelligence_name,capability_id,value,evidence_state,recursive_depth,upstream_node_ids")
    .eq("user_id", input.userId)
    .eq("run_id", input.runId)
    .eq("execution_id", input.executionId);
  if (nodeError) throw new Error(`IRIS_USER_REPORT_NODE_LOOKUP_FAILED: ${nodeError.message}`);

  const runtimeNodes = (nodes ?? []) as RuntimeNode[];
  const blocks: ReportContentBlock[] = runtimeNodes
    .filter((node) => node.evidence_state !== "INSUFFICIENT_EVIDENCE")
    .map((node) => ({ kind: "intelligence", id: node.id, name: normalizeName(node.intelligence_name ?? node.intelligence_key ?? node.capability_id ?? "IRIS intelligence"), value: node.value, evidence_state: node.evidence_state }));

  const { data: evidenceRows, error: evidenceError } = await supabaseAdmin
    .from("iris_run_evidence")
    .select("id,product,effective_at,acquired_at")
    .eq("user_id", input.userId)
    .eq("run_id", input.runId);
  if (evidenceError) throw new Error(`IRIS_USER_REPORT_EVIDENCE_LOOKUP_FAILED: ${evidenceError.message}`);

  const evidenceBlocks: ReportContentBlock[] = (evidenceRows ?? []).map((row) => ({ kind: "observed_evidence", id: row.id, name: `${String(row.product ?? "Provider")} evidence`, value: { product: row.product, effective_at: row.effective_at, acquired_at: row.acquired_at }, evidence_state: "OBSERVED" }));
  const allBlocks = [...blocks, ...evidenceBlocks];
  if (!allBlocks.length) return;

  const report = composeIrisUserReport({ userId: input.userId, runId: input.runId, executionId: input.executionId, certificationHash: input.certificationHash, blocks: allBlocks, sourceEvidenceIds: (evidenceRows ?? []).map((row) => row.id) });
  const { error } = await supabaseAdmin.from("iris_user_reports").upsert({ user_id: input.userId, run_id: input.runId, execution_id: input.executionId, report_id: report.report_id, title: report.title, description: report.description, primary_content_kind: report.primary_content_kind, primary_content_id: report.primary_content_id, content_node_ids: report.content_node_ids, source_evidence_ids: report.source_evidence_ids, source_report_ids: report.source_report_ids, content: report.content, composition: report.composition, composition_hash: report.composition_hash, certification_hash: report.certification_hash, status: "PUBLISHED", updated_at: new Date().toISOString() }, { onConflict: "user_id,run_id,composition_hash" });
  if (error) throw new Error(`IRIS_USER_REPORT_PERSIST_FAILED: ${error.message}`);
}
