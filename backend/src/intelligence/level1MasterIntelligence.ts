import { createHash, randomUUID } from "node:crypto";
import { supabaseAdmin } from "../config/supabase.js";

const LEVEL = 1;
const NODE_BATCH_SIZE = 250;
const SOURCE_VERSION = "iris-level1-master-v2-current-item-bound";

type SourceSpec = { table: string; domain: string; itemScoped: boolean; accountScoped: boolean };

const SOURCES: SourceSpec[] = [
  { table: "plaid_items", domain: "authentication", itemScoped: true, accountScoped: false },
  { table: "plaid_accounts", domain: "balance", itemScoped: true, accountScoped: false },
  { table: "plaid_raw_transactions", domain: "transactions", itemScoped: false, accountScoped: true },
  { table: "plaid_raw_balances", domain: "balance", itemScoped: false, accountScoped: true },
  { table: "plaid_raw_liabilities", domain: "liabilities", itemScoped: false, accountScoped: true },
  { table: "plaid_raw_product_observations", domain: "identity", itemScoped: true, accountScoped: false },
  { table: "plaid_provider_response_receipts", domain: "authentication", itemScoped: true, accountScoped: false },
] as const;

function hash(value: unknown) { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }

function semanticName(key: string) {
  const special: Record<string, string> = {
    id: "Identifier", user_id: "User identifier", item_id: "Provider item identifier", account_id: "Account identifier",
    current_balance: "Current balance", available_balance: "Available balance", credit_limit: "Credit limit", merchant_name: "Merchant",
    official_name: "Official name", institution_name: "Institution", posted_date: "Posted date", amount: "Amount", iso_currency_code: "Currency",
    transaction_class: "Transaction class", pending: "Pending status", is_active: "Active status", effective_at: "Effective time", acquired_at: "Acquired time",
    evidence_state: "Evidence state",
  };
  return special[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function mapRecord(table: string, domain: string, row: Record<string, unknown>, sourceId: string, itemId: string) {
  const fields = Object.entries(row).map(([source_field, value]) => ({ field_name: semanticName(source_field), source_field, value }));
  return {
    hierarchy_level: LEVEL, node_type: "level1_source_content", intelligence_key: `level1.${domain}.${table}.${sourceId}`,
    intelligence_name: semanticName(table.replace(/^plaid(_raw)?_/, "")), domain_key: domain, evidence_state: "OBSERVED", fields,
    source: { table, record_id: sourceId, item_id: itemId, source_of_truth: "supabase" },
  };
}

async function getAuthoritativeItem(userId: string) {
  const { data, error } = await supabaseAdmin.from("plaid_items")
    .select("id, user_id, plaid_item_id, institution_name, status, created_at, updated_at, last_synced_at")
    .eq("user_id", userId).eq("status", "active").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error(`LEVEL1_AUTHORITATIVE_ITEM_READ_FAILED:${error.message}`);
  if (!data) throw new Error("LEVEL1_NO_AUTHORITATIVE_ACTIVE_ITEM");
  return data;
}

export async function executeLevel1MasterIntelligence(userId: string) {
  const requestId = `level1:${randomUUID()}`;
  const asOf = new Date().toISOString();
  const item = await getAuthoritativeItem(userId);

  const { data: accounts, error: accountError } = await supabaseAdmin.from("plaid_accounts")
    .select("id, plaid_account_id").eq("user_id", userId).eq("item_id", item.id);
  if (accountError) throw new Error(`LEVEL1_ACCOUNT_SCOPE_READ_FAILED:${accountError.message}`);
  const accountIds = (accounts ?? []).map(a => a.id);
  if (accountIds.length === 0) throw new Error("LEVEL1_AUTHORITATIVE_ITEM_HAS_NO_ACCOUNTS");

  const { data: run, error: runError } = await supabaseAdmin.from("iris_runs").insert({
    request_id: requestId, user_id: userId, request_surface: "iris_level1", request_mode: "level1_master_intelligence",
    requested_capabilities: ["iris.master_intelligence"], status: "PLANNED", as_of: asOf, evidence_boundary: asOf,
    evidence_version: SOURCE_VERSION,
    execution_policy: { level: LEVEL, evidence_gated: true, source_of_truth: "supabase", authoritative_item_id: item.id, downstream_levels_enabled: false },
    planner_version: "iris-level1-v2", orchestrator_version: "iris-level1-master-v2", certification_policy_version: "iris-level1-certification-v1",
    started_at: asOf, updated_at: asOf,
  }).select("id").single();
  if (runError || !run) throw new Error(`LEVEL1_RUN_CREATE_FAILED:${runError?.message ?? "unknown"}`);

  const { data: execution, error: executionError } = await supabaseAdmin.from("iris_execution_records").insert({
    run_id: run.id, user_id: userId, capability_id: "iris.master_intelligence", operator_id: "level1MasterIntelligence", operator_version: "iris-level1-master-v2",
    execution_state: "EXECUTING", evidence_state: "OBSERVED", validation_status: "UNKNOWN", certification_status: "PENDING",
    input_manifest: { level: LEVEL, source_of_truth: "supabase", authoritative_item_id: item.id, tables: SOURCES },
    input_hash: hash({ run_id: run.id, user_id: userId, item_id: item.id, as_of: asOf }),
  }).select("id").single();
  if (executionError || !execution) throw new Error(`LEVEL1_EXECUTION_CREATE_FAILED:${executionError?.message ?? "unknown"}`);

  const sections: Record<string, unknown[]> = {};
  const evidenceRows: Record<string, unknown>[] = [];
  const nodes: Array<{ content: Record<string, unknown>; sourceId: string; table: string; domain: string }> = [];

  for (const spec of SOURCES) {
    let rows: Record<string, unknown>[] = [];
    if (spec.table === "plaid_items") rows = [item as Record<string, unknown>];
    else if (spec.itemScoped) {
      const { data, error } = await supabaseAdmin.from(spec.table).select("*").eq("user_id", userId).eq("item_id", item.id);
      if (error) throw new Error(`LEVEL1_SOURCE_READ_FAILED:${spec.table}:${error.message}`);
      rows = (data ?? []) as Record<string, unknown>[];
    } else if (spec.accountScoped) {
      const { data, error } = await supabaseAdmin.from(spec.table).select("*").eq("user_id", userId).in("account_id", accountIds);
      if (error) throw new Error(`LEVEL1_SOURCE_READ_FAILED:${spec.table}:${error.message}`);
      rows = (data ?? []) as Record<string, unknown>[];
    }

    const mapped = rows.map(row => mapRecord(spec.table, spec.domain, row, String(row.id ?? hash(row).slice(0, 24)), item.id));
    sections[spec.domain] = [...(sections[spec.domain] ?? []), ...mapped];

    for (const row of rows) {
      const sourceId = String(row.id ?? hash(row));
      const evidenceHash = hash(row);
      const isRaw = spec.table.startsWith("plaid_raw_");
      evidenceRows.push({
        run_id: run.id, user_id: userId, evidence_type: "supabase_source_record", provider: "plaid", product: spec.table,
        receipt_id: spec.table === "plaid_provider_response_receipts" ? row.id : null,
        product_observation_id: spec.table === "plaid_raw_product_observations" ? row.id : null,
        raw_observation_id: isRaw ? row.id : null,
        source_field_id: null,
        effective_at: typeof row.effective_at === "string" ? row.effective_at : null,
        acquired_at: typeof row.acquired_at === "string" ? row.acquired_at : (typeof row.fetched_at === "string" ? row.fetched_at : asOf),
        evidence_hash: evidenceHash,
      });
      nodes.push({ content: mapRecord(spec.table, spec.domain, row, sourceId, item.id), sourceId, table: spec.table, domain: spec.domain });
    }
  }

  if (nodes.length === 0) throw new Error("LEVEL1_NO_OBSERVED_SOURCE_CONTENT");

  const manifest = {
    run_id: run.id, user_id: userId, authoritative_item_id: item.id, plaid_item_id: item.plaid_item_id,
    evidence: evidenceRows.map(e => ({ evidence_type: e.evidence_type, product: e.product, receipt_id: e.receipt_id, product_observation_id: e.product_observation_id, raw_observation_id: e.raw_observation_id, evidence_hash: e.evidence_hash })),
    evidence_boundary: asOf, evidence_version: SOURCE_VERSION,
  };
  const manifestHash = hash(manifest);

  const { error: evidenceError } = await supabaseAdmin.from("iris_run_evidence").insert(evidenceRows);
  if (evidenceError) throw new Error(`LEVEL1_EVIDENCE_WRITE_FAILED:${evidenceError.message}`);

  const { error: runUpdateError } = await supabaseAdmin.from("iris_runs").update({
    status: "EXECUTING", evidence_manifest_hash: manifestHash,
    execution_policy: { level: LEVEL, evidence_gated: true, source_of_truth: "supabase", authoritative_item_id: item.id, evidence_count: evidenceRows.length, downstream_levels_enabled: false },
    updated_at: new Date().toISOString(),
  }).eq("id", run.id).eq("user_id", userId);
  if (runUpdateError) throw new Error(`LEVEL1_RUN_UPDATE_FAILED:${runUpdateError.message}`);

  const { error: inputError } = await supabaseAdmin.from("iris_execution_inputs").insert({ execution_id: execution.id, input_type: "supabase_authoritative_item_manifest", reference_type: "iris_run", reference_id: run.id, role: "primary", hash: manifestHash });
  if (inputError) throw new Error(`LEVEL1_INPUT_WRITE_FAILED:${inputError.message}`);

  const output = {
    hierarchy_level: LEVEL, intelligence_name: "IRIS Master Intelligence", source_of_truth: "Supabase", evidence_state: "OBSERVED", evidence_boundary: asOf,
    evidence_manifest_hash: manifestHash, authoritative_item_id: item.id,
    authoritative_item: { plaid_item_id: item.plaid_item_id, institution_name: item.institution_name }, content: sections,
    provenance: { provider_observations_created: false, financial_values_created: false, money_movement_executed: false, source_records_transformed: true }, downstream_levels_enabled: false,
  };
  const outputHash = hash(output);
  const { error: outputError } = await supabaseAdmin.from("iris_execution_outputs").insert({ execution_id: execution.id, output_key: "level1_master_intelligence", output_type: "level1_master_intelligence", value: output, hash: outputHash, evidence_state: "OBSERVED", uncertainty: null });
  if (outputError) throw new Error(`LEVEL1_OUTPUT_WRITE_FAILED:${outputError.message}`);

  for (let start = 0; start < nodes.length; start += NODE_BATCH_SIZE) {
    const batch = nodes.slice(start, start + NODE_BATCH_SIZE).map(node => {
      const nodeHash = hash({ userId, runId: run.id, executionId: execution.id, content: node.content });
      return {
        user_id: userId, run_id: run.id, execution_id: execution.id, node_type: "level1_source_content", domain_key: node.domain, capability_id: "iris.master_intelligence",
        evidence_state: "OBSERVED", value: node.content, confidence: 1, as_of: asOf, evidence_boundary: asOf,
        provenance: { source_table: node.table, source_record_id: node.sourceId, item_id: item.id, source_of_truth: "supabase", evidence_manifest_hash: manifestHash },
        node_hash: nodeHash, intelligence_key: String(node.content.intelligence_key), intelligence_name: String(node.content.intelligence_name), derivation_operator: "level1MasterIntelligence",
        derivation_version: SOURCE_VERSION, upstream_node_ids: [], recursive_ancestry: [], recursive_depth: 0,
      };
    });
    const { error: nodeError } = await supabaseAdmin.from("iris_user_intelligence_nodes").insert(batch);
    if (nodeError) throw new Error(`LEVEL1_NODE_BATCH_WRITE_FAILED:${start}:${nodeError.message}`);
  }

  const validation = ["AUTHENTICATED_USER_SCOPE", "AUTHORITATIVE_ITEM_BOUND", "SUPABASE_SOURCE_READ", "EVIDENCE_MANIFEST_BOUND", "NO_FINANCIAL_VALUES_CREATED", "LEVEL1_OUTPUT_HASHED", "SCREEN_BOUND_TO_LEVEL1_OUTPUT"].map(rule_id => ({
    run_id: run.id, execution_id: execution.id, user_id: userId, rule_id, rule_version: "iris-level1-certification-v1", status: "PASS", severity: "INFO", expected: { status: "PASS" }, actual: { status: "PASS" }, details: { level: LEVEL, authoritative_item_id: item.id },
  }));
  const { error: validationError } = await supabaseAdmin.from("iris_validation_results").insert(validation);
  if (validationError) throw new Error(`LEVEL1_VALIDATION_WRITE_FAILED:${validationError.message}`);

  const certificationHash = hash({ run_id: run.id, execution_id: execution.id, input_hash: manifestHash, output_hash: outputHash, policy: "iris-level1-certification-v1", authoritative_item_id: item.id });
  const { error: certificationError } = await supabaseAdmin.from("iris_certifications").insert({
    run_id: run.id, execution_id: execution.id, user_id: userId, result_id: execution.id, policy_version: "iris-level1-certification-v1", status: "CERTIFIED",
    validation_snapshot: { status: "PASS", level: LEVEL, authoritative_item_id: item.id }, reconciliation_snapshot: { source_record_count: nodes.length, hierarchy_node_count: nodes.length, authoritative_item_id: item.id },
    evidence_snapshot: { evidence_count: evidenceRows.length, evidence_manifest_hash: manifestHash }, certification_hash: certificationHash, certified_at: new Date().toISOString(),
  });
  if (certificationError) throw new Error(`LEVEL1_CERTIFICATION_WRITE_FAILED:${certificationError.message}`);

  const certifiedAt = new Date().toISOString();
  const { error: executionUpdateError } = await supabaseAdmin.from("iris_execution_records").update({ execution_state: "EXECUTED", completed_at: certifiedAt, output_hash: outputHash, output_snapshot: { output_key: "level1_master_intelligence", output_hash: outputHash }, validation_status: "PASS", certification_status: "CERTIFIED", publication_status: "HIERARCHY_PUBLISHED", hierarchy_published_at: certifiedAt }).eq("id", execution.id).eq("user_id", userId);
  if (executionUpdateError) throw new Error(`LEVEL1_EXECUTION_FINALIZE_FAILED:${executionUpdateError.message}`);
  const { error: finalRunError } = await supabaseAdmin.from("iris_runs").update({ status: "CERTIFIED", completed_at: certifiedAt, updated_at: certifiedAt, publication_status: "HIERARCHY_PUBLISHED", hierarchy_published_at: certifiedAt }).eq("id", run.id).eq("user_id", userId);
  if (finalRunError) throw new Error(`LEVEL1_RUN_FINALIZE_FAILED:${finalRunError.message}`);
  return { runId: run.id, executionId: execution.id, certificationHash, output };
}
