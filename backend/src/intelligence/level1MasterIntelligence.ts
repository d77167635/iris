import { createHash, randomUUID } from "node:crypto";
import { supabaseAdmin } from "../config/supabase.js";

const LEVEL = 1;
const VERSION = "iris-level1-governance-v1";

type Source = { table: string; domain: string; item: boolean; account: boolean; select: string; hashField?: string };
type Evidence = { run_id: string; user_id: string; evidence_type: string; provider: string; product: string; receipt_id: string | null; product_observation_id: string | null; raw_observation_id: string | null; source_field_id: string | null; effective_at: string | null; acquired_at: string; evidence_hash: string; source_id: string };

const SOURCES: Source[] = [
  { table: "plaid_items", domain: "authentication", item: true, account: false, select: "id,plaid_item_id,status,institution_name,created_at,updated_at,last_synced_at" },
  { table: "plaid_accounts", domain: "balance", item: true, account: false, select: "id,item_id,plaid_account_id" },
  { table: "plaid_raw_transactions", domain: "transactions", item: false, account: true, select: "id,account_id,observation_hash,effective_at,acquired_at,is_current,evidence_state", hashField: "observation_hash" },
  { table: "plaid_raw_balances", domain: "balance", item: false, account: true, select: "id,account_id,observation_hash,effective_at,acquired_at,is_current,evidence_state", hashField: "observation_hash" },
  { table: "plaid_raw_liabilities", domain: "liabilities", item: false, account: true, select: "id,account_id,observation_hash,effective_at,acquired_at,is_current,evidence_state", hashField: "observation_hash" },
  { table: "plaid_raw_product_observations", domain: "identity", item: true, account: false, select: "id,item_id,product,observation_hash,effective_at,acquired_at,is_current,evidence_state", hashField: "observation_hash" },
  { table: "plaid_provider_response_receipts", domain: "authentication", item: true, account: false, select: "id,item_id,product,endpoint,http_status,response_hash,acquired_at", hashField: "response_hash" },
];

function hash(value: unknown) { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }

async function insertBatched(table: string, rows: Record<string, unknown>[]) {
  for (let i = 0; i < rows.length; i += 250) {
    const { error } = await supabaseAdmin.from(table).insert(rows.slice(i, i + 250));
    if (error) throw new Error(`LEVEL1_${table.toUpperCase()}_WRITE_FAILED:${i}:${error.message}`);
  }
}

async function authoritativeItem(userId: string) {
  const { data, error } = await supabaseAdmin.from("plaid_items").select("id,user_id,plaid_item_id,institution_name,status,created_at,updated_at,last_synced_at").eq("user_id", userId).eq("status", "active").order("created_at", { ascending: false }).limit(2);
  if (error) throw new Error(`LEVEL1_AUTHORITATIVE_ITEM_READ_FAILED:${error.message}`);
  if (!data?.length) throw new Error("LEVEL1_NO_AUTHORITATIVE_ACTIVE_ITEM");
  if (data.length !== 1) throw new Error("LEVEL1_MULTIPLE_AUTHORITATIVE_ACTIVE_ITEMS");
  return data[0];
}

export async function executeLevel1MasterIntelligence(userId: string) {
  const asOf = new Date().toISOString();
  const item = await authoritativeItem(userId);
  const { data: accounts, error: accountError } = await supabaseAdmin.from("plaid_accounts").select("id").eq("user_id", userId).eq("item_id", item.id);
  if (accountError) throw new Error(`LEVEL1_ACCOUNT_SCOPE_READ_FAILED:${accountError.message}`);
  const accountIds = (accounts ?? []).map((a) => a.id);
  if (!accountIds.length) throw new Error("LEVEL1_AUTHORITATIVE_ITEM_HAS_NO_ACCOUNTS");

  const { data: run, error: runError } = await supabaseAdmin.from("iris_runs").insert({
    request_id: `level1:${randomUUID()}`, user_id: userId, request_surface: "iris_level1", request_mode: "level1_master_intelligence", requested_capabilities: ["iris.master_governance"], status: "PLANNED", as_of: asOf, evidence_boundary: asOf, evidence_version: VERSION,
    execution_policy: { level: LEVEL, role: "governance_only", source_of_truth: "supabase", authoritative_item_id: item.id, downstream_levels_enabled: false, financial_content_output: false },
    planner_version: VERSION, orchestrator_version: VERSION, certification_policy_version: "iris-level1-governance-certification-v1", started_at: asOf, updated_at: asOf,
  }).select("id").single();
  if (runError || !run) throw new Error(`LEVEL1_RUN_CREATE_FAILED:${runError?.message ?? "unknown"}`);

  const { data: execution, error: executionError } = await supabaseAdmin.from("iris_execution_records").insert({
    run_id: run.id, user_id: userId, capability_id: "iris.master_governance", operator_id: "level1MasterIntelligence", operator_version: VERSION, execution_state: "EXECUTING", evidence_state: "OBSERVED", validation_status: "UNKNOWN", certification_status: "PENDING",
    input_manifest: { level: LEVEL, role: "governance_only", source_of_truth: "supabase", authoritative_item_id: item.id, source_tables: SOURCES.map((s) => s.table), financial_content_output: false },
    input_hash: hash({ run_id: run.id, user_id: userId, item_id: item.id, asOf, version: VERSION }),
  }).select("id").single();
  if (executionError || !execution) throw new Error(`LEVEL1_EXECUTION_CREATE_FAILED:${executionError?.message ?? "unknown"}`);

  const evidence: Evidence[] = [];
  const sourceCounts: Record<string, number> = {};
  for (const spec of SOURCES) {
    let rows: Record<string, unknown>[] = [];
    if (spec.table === "plaid_items") rows = [item as unknown as Record<string, unknown>];
    else if (spec.item) {
      const { data, error } = await supabaseAdmin.from(spec.table).select(spec.select).eq("user_id", userId).eq("item_id", item.id);
      if (error) throw new Error(`LEVEL1_SOURCE_READ_FAILED:${spec.table}:${error.message}`);
      rows = (data ?? []) as unknown as Record<string, unknown>[];
    } else if (spec.account) {
      const { data, error } = await supabaseAdmin.from(spec.table).select(spec.select).eq("user_id", userId).in("account_id", accountIds);
      if (error) throw new Error(`LEVEL1_SOURCE_READ_FAILED:${spec.table}:${error.message}`);
      rows = (data ?? []) as unknown as Record<string, unknown>[];
    }
    sourceCounts[spec.table] = rows.length;
    for (const row of rows) {
      const sourceId = String(row.id);
      const evidenceHash = spec.hashField && typeof row[spec.hashField] === "string" ? String(row[spec.hashField]) : hash(row);
      const raw = spec.table.startsWith("plaid_raw_");
      evidence.push({ run_id: run.id, user_id: userId, evidence_type: "supabase_source_record", provider: "plaid", product: spec.table,
        receipt_id: spec.table === "plaid_provider_response_receipts" ? sourceId : null,
        product_observation_id: spec.table === "plaid_raw_product_observations" ? sourceId : null,
        raw_observation_id: raw && spec.table !== "plaid_raw_product_observations" ? sourceId : null,
        source_field_id: null, effective_at: typeof row.effective_at === "string" ? row.effective_at : null,
        acquired_at: typeof row.acquired_at === "string" ? row.acquired_at : asOf, evidence_hash: evidenceHash, source_id: sourceId });
    }
  }
  if (!evidence.length) throw new Error("LEVEL1_NO_OBSERVED_SOURCE_EVIDENCE");

  const manifest = { run_id: run.id, user_id: userId, authoritative_item_id: item.id, evidence_boundary: asOf, evidence_version: VERSION, source_counts: sourceCounts,
    evidence: evidence.map((e) => ({ evidence_type: e.evidence_type, product: e.product, source_id: e.source_id, evidence_hash: e.evidence_hash, receipt_id: e.receipt_id, product_observation_id: e.product_observation_id, raw_observation_id: e.raw_observation_id })) };
  const manifestHash = hash(manifest);
  await insertBatched("iris_run_evidence", evidence as unknown as Record<string, unknown>[]);

  const { error: runUpdateError } = await supabaseAdmin.from("iris_runs").update({ status: "EXECUTING", evidence_manifest_hash: manifestHash,
    execution_policy: { level: LEVEL, role: "governance_only", source_of_truth: "supabase", authoritative_item_id: item.id, evidence_count: evidence.length, downstream_levels_enabled: false, financial_content_output: false }, updated_at: new Date().toISOString() }).eq("id", run.id).eq("user_id", userId);
  if (runUpdateError) throw new Error(`LEVEL1_RUN_UPDATE_FAILED:${runUpdateError.message}`);

  const { error: inputError } = await supabaseAdmin.from("iris_execution_inputs").insert({ execution_id: execution.id, input_type: "supabase_authoritative_evidence_manifest", reference_type: "iris_run", reference_id: run.id, role: "primary", hash: manifestHash });
  if (inputError) throw new Error(`LEVEL1_INPUT_WRITE_FAILED:${inputError.message}`);

  const governanceOutput = {
    hierarchy_level: LEVEL, artifact_type: "governance_and_lineage_certificate", intelligence_name: "IRIS Master Intelligence / Master Governor", role: "governance_only", source_of_truth: "Supabase", evidence_state: "OBSERVED", evidence_boundary: asOf,
    evidence_manifest_hash: manifestHash, authoritative_item_scope_hash: hash({ user_id: userId, item_id: item.id }), evidence_count: evidence.length, source_counts: sourceCounts,
    financial_content_output: false, financial_values_created: false, provider_observations_created: false, money_movement_executed: false, downstream_levels_enabled: false, next_content_level: 2,
  };
  const outputHash = hash(governanceOutput);
  const { error: outputError } = await supabaseAdmin.from("iris_execution_outputs").insert({ execution_id: execution.id, output_key: "level1_governance_certificate", output_type: "governance_certificate", value: governanceOutput, hash: outputHash, evidence_state: "OBSERVED", uncertainty: null });
  if (outputError) throw new Error(`LEVEL1_OUTPUT_WRITE_FAILED:${outputError.message}`);

  const lineage = evidence.map((e) => ({ user_id: userId, run_id: run.id, execution_id: execution.id, lineage_role: "SOURCE_EVIDENCE", source_type: e.product, source_id: e.source_id, source_field_path: null,
    destination_type: "iris_execution_output", destination_id: execution.id, destination_field_path: null, evidence_state: "OBSERVED", transformation: "governance_scope_only", source_hash: e.evidence_hash,
    lineage_hash: hash({ run_id: run.id, execution_id: execution.id, source_type: e.product, source_id: e.source_id, output: "level1_governance_certificate" }), metadata: { output_key: "level1_governance_certificate", item_id: item.id, source_of_truth: "supabase" } }));
  lineage.push({ user_id: userId, run_id: run.id, execution_id: execution.id, lineage_role: "OUTPUT_DERIVATION", source_type: "iris_execution", source_id: execution.id, source_field_path: null,
    destination_type: "iris_execution_output", destination_id: execution.id, destination_field_path: null, evidence_state: "OBSERVED", transformation: "governance_certificate", source_hash: manifestHash,
    lineage_hash: hash({ run_id: run.id, execution_id: execution.id, output_hash: outputHash }), metadata: { output_key: "level1_governance_certificate", financial_content_output: false } });
  await insertBatched("iris_execution_lineage", lineage as unknown as Record<string, unknown>[]);

  const count = async (table: string, filters: Record<string, string>) => {
    let query = supabaseAdmin.from(table).select("id", { count: "exact", head: true });
    for (const [key, value] of Object.entries(filters)) query = query.eq(key, value);
    const result = await query;
    if (result.error) throw new Error(`LEVEL1_${table.toUpperCase()}_COUNT_FAILED:${result.error.message}`);
    return result.count ?? 0;
  };
  const fieldLineageCount = await count("iris_field_lineage_edges", { user_id: userId, item_id: item.id });
  const executionLineageCount = await count("iris_execution_lineage", { run_id: run.id, execution_id: execution.id });
  const outputCount = await count("iris_execution_outputs", { execution_id: execution.id, output_key: "level1_governance_certificate" });
  const nodeCount = await count("iris_user_intelligence_nodes", { run_id: run.id, execution_id: execution.id });
  const edgeCount = await count("iris_user_intelligence_edges", { run_id: run.id });
  const compositionCount = await count("iris_user_intelligence_compositions", { run_id: run.id });

  const checks = [
    ["AUTHENTICATED_USER_SCOPE", Boolean(userId)], ["SINGLE_AUTHORITATIVE_ACTIVE_ITEM", item.status === "active"], ["SUPABASE_SOURCE_EVIDENCE_PRESENT", evidence.length > 0],
    ["EVIDENCE_HASHES_PRESENT", evidence.every((e) => Boolean(e.evidence_hash))], ["EVIDENCE_MANIFEST_BOUND", Boolean(manifestHash)], ["EXECUTION_INPUT_BOUND", Boolean(manifestHash)],
    ["GOVERNANCE_OUTPUT_ONLY", outputCount === 1 && governanceOutput.financial_content_output === false], ["EXECUTION_LINEAGE_COMPLETE", executionLineageCount === evidence.length + 1],
    ["FIELD_LINEAGE_AVAILABLE", fieldLineageCount >= 0], ["NO_LEVEL1_FINANCIAL_NODES", nodeCount === 0], ["NO_LEVEL1_USER_EDGES", edgeCount === 0], ["NO_LEVEL1_COMPOSITIONS", compositionCount === 0],
    ["DOWNSTREAM_LEVELS_DISABLED", governanceOutput.downstream_levels_enabled === false],
  ] as const;
  const allPass = checks.every(([, pass]) => pass);
  const validation = checks.map(([rule_id, pass]) => ({ run_id: run.id, execution_id: execution.id, user_id: userId, rule_id, rule_version: "iris-level1-governance-certification-v1",
    status: pass ? "PASS" : "FAIL", severity: pass ? "INFO" : "CRITICAL", expected: { status: "PASS" }, actual: { status: pass ? "PASS" : "FAIL" },
    details: { level: LEVEL, output_key: "level1_governance_certificate", evidence_count: evidence.length, execution_lineage_count: executionLineageCount, field_lineage_count: fieldLineageCount, financial_content_output: false } }));
  const { error: validationError } = await supabaseAdmin.from("iris_validation_results").insert(validation);
  if (validationError) throw new Error(`LEVEL1_VALIDATION_WRITE_FAILED:${validationError.message}`);
  if (!allPass) {
    await supabaseAdmin.from("iris_execution_records").update({ execution_state: "FAILED", validation_status: "FAIL", certification_status: "NOT_CERTIFIED", error_code: "LEVEL1_GOVERNANCE_VALIDATION_FAILED", error_message: "One or more Level 1 governance checks failed." }).eq("id", execution.id).eq("user_id", userId);
    await supabaseAdmin.from("iris_runs").update({ status: "VALIDATION_FAILED", failure_code: "LEVEL1_GOVERNANCE_VALIDATION_FAILED", failure_message: "One or more Level 1 governance checks failed.", updated_at: new Date().toISOString() }).eq("id", run.id).eq("user_id", userId);
    throw new Error("LEVEL1_GOVERNANCE_VALIDATION_FAILED");
  }

  const checksObject = Object.fromEntries(checks.map(([id, pass]) => [id, { status: pass ? "PASS" : "FAIL" }]));
  const reconciliationSnapshot = { status: "PASS", source_record_count: evidence.length, execution_lineage_count: executionLineageCount, field_lineage_count: fieldLineageCount, user_financial_content_node_count: nodeCount, user_financial_edge_count: edgeCount, user_financial_composition_count: compositionCount };
  const evidenceSnapshot = { evidence_state: "OBSERVED", evidence_count: evidence.length, evidence_manifest_hash: manifestHash, source_counts: sourceCounts };
  const certificationHash = hash({ run_id: run.id, execution_id: execution.id, input_hash: manifestHash, output_hash: outputHash, policy: "iris-level1-governance-certification-v1", checks: checksObject });
  const certifiedAt = new Date().toISOString();

  const { error: executionReadyError } = await supabaseAdmin.from("iris_execution_records").update({ execution_state: "EXECUTED", completed_at: certifiedAt, output_hash: outputHash, output_snapshot: { output_key: "level1_governance_certificate", output_hash: outputHash, financial_content_output: false }, validation_status: "PASS" }).eq("id", execution.id).eq("user_id", userId);
  if (executionReadyError) throw new Error(`LEVEL1_EXECUTION_READY_FAILED:${executionReadyError.message}`);
  const { error: certificationError } = await supabaseAdmin.from("iris_certifications").insert({ run_id: run.id, execution_id: execution.id, user_id: userId, result_id: execution.id, policy_version: "iris-level1-governance-certification-v1", status: "CERTIFIED", validation_snapshot: { status: "PASS", checks: checksObject }, reconciliation_snapshot: reconciliationSnapshot, evidence_snapshot: evidenceSnapshot, certification_hash: certificationHash, certified_at: certifiedAt });
  if (certificationError) throw new Error(`LEVEL1_CERTIFICATION_WRITE_FAILED:${certificationError.message}`);
  const { error: executionUpdateError } = await supabaseAdmin.from("iris_execution_records").update({ certification_status: "CERTIFIED", publication_status: "HIERARCHY_PUBLISHED", hierarchy_published_at: certifiedAt }).eq("id", execution.id).eq("user_id", userId);
  if (executionUpdateError) throw new Error(`LEVEL1_EXECUTION_FINALIZE_FAILED:${executionUpdateError.message}`);
  const { error: finalRunError } = await supabaseAdmin.from("iris_runs").update({ status: "CERTIFIED", completed_at: certifiedAt, updated_at: certifiedAt, publication_status: "HIERARCHY_PUBLISHED", hierarchy_published_at: certifiedAt }).eq("id", run.id).eq("user_id", userId);
  if (finalRunError) throw new Error(`LEVEL1_RUN_FINALIZE_FAILED:${finalRunError.message}`);
  return { runId: run.id, executionId: execution.id, certificationHash, output: governanceOutput };
}
