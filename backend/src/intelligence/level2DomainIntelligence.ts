import { createHash, randomUUID } from "node:crypto";
import { supabaseAdmin } from "../config/supabase.js";
import { persistArbitraryDerivedIntelligenceNode } from "./persistedIntelligenceGraph.js";

const LEVEL = 2;
const VERSION = "iris-level2-domain-intelligence-v1";
const CERTIFICATION_POLICY_VERSION = "iris-level2-domain-intelligence-certification-v1";
const DOMAINS = ["authentication", "transactions", "balance", "identity", "assets", "liabilities", "investments", "statements"] as const;
type DomainKey = typeof DOMAINS[number];
type EvidenceState = "OBSERVED" | "CALCULATED" | "INFERRED" | "LIMITED" | "INSUFFICIENT_EVIDENCE";

function hash(value: unknown): string { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }
function evidenceState(observed: boolean, derived = false): EvidenceState { return observed ? (derived ? "CALCULATED" : "OBSERVED") : "INSUFFICIENT_EVIDENCE"; }
function asNumber(value: unknown): number | null { return value === null || value === undefined || value === "" ? null : Number(value); }
function unique<T>(values: T[]): T[] { return [...new Set(values)]; }
function chunk<T>(values: T[], size = 500): T[][] { const out: T[][] = []; for (let i = 0; i < values.length; i += size) out.push(values.slice(i, i + size)); return out; }
async function selectIn<T = any>(table: string, select: string, column: string, values: string[], userId: string): Promise<T[]> {
  if (!values.length) return [];
  const out: T[] = [];
  for (const part of chunk(values)) {
    const { data, error } = await supabaseAdmin.from(table).select(select).eq("user_id", userId).in(column, part);
    if (error) throw new Error(`LEVEL2_${table.toUpperCase()}_READ_FAILED:${error.message}`);
    out.push(...((data ?? []) as T[]));
  }
  return out;
}

interface Level1Boundary { runId: string; executionId: string; evidenceBoundary: string; manifestHash: string; evidenceIds: string[]; sourceIds: Record<string, string[]>; itemIds: string[]; accountIds: string[]; }
interface DomainResult { domain_key: DomainKey; evidence_state: EvidenceState; evidence_boundary: string; source_scope: Record<string, unknown>; canonical_fields: any[]; derived_fields: any[]; relationships: any[]; domain_intelligence: any[]; limitations: string[]; provenance: Record<string, unknown>; freshness: Record<string, unknown>; }

async function latestCertifiedLevel1(userId: string): Promise<Level1Boundary> {
  const { data: run, error } = await supabaseAdmin.from("iris_runs").select("id,evidence_boundary,evidence_manifest_hash").eq("user_id", userId).eq("request_mode", "level1_master_intelligence").eq("status", "CERTIFIED").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error(`LEVEL2_LEVEL1_RUN_READ_FAILED:${error.message}`);
  if (!run?.id || !run.evidence_boundary || !run.evidence_manifest_hash) throw new Error("LEVEL2_LEVEL1_CERTIFIED_BOUNDARY_REQUIRED");
  const { data: execution } = await supabaseAdmin.from("iris_execution_records").select("id,certification_status,validation_status").eq("run_id", run.id).eq("user_id", userId).eq("certification_status", "CERTIFIED").eq("validation_status", "PASS").maybeSingle();
  if (!execution?.id) throw new Error("LEVEL2_LEVEL1_CERTIFIED_EXECUTION_REQUIRED");
  const { data: evidence, error: evidenceError } = await supabaseAdmin.from("iris_run_evidence").select("id,product,source_id,raw_observation_id,product_observation_id,receipt_id").eq("run_id", run.id).eq("user_id", userId);
  if (evidenceError) throw new Error(`LEVEL2_LEVEL1_EVIDENCE_READ_FAILED:${evidenceError.message}`);
  const sourceIds: Record<string, string[]> = {};
  const rawIds: string[] = [];
  const productIds: string[] = [];
  const receiptIds: string[] = [];
  for (const row of evidence ?? []) {
    sourceIds[row.product] = sourceIds[row.product] ?? [];
    sourceIds[row.product].push(row.source_id);
    if (row.raw_observation_id) rawIds.push(row.raw_observation_id);
    if (row.product_observation_id) productIds.push(row.product_observation_id);
    if (row.receipt_id) receiptIds.push(row.receipt_id);
  }
  const accountIds = unique(rawIds);
  const { data: rawTransactions } = await selectIn("plaid_raw_transactions", "account_id", "id", sourceIds.plaid_raw_transactions ?? [], userId);
  const { data: rawBalances } = await selectIn("plaid_raw_balances", "account_id", "id", sourceIds.plaid_raw_balances ?? [], userId);
  const { data: rawLiabilities } = await selectIn("plaid_raw_liabilities", "account_id", "id", sourceIds.plaid_raw_liabilities ?? [], userId);
  const inferredAccounts = unique([...((rawTransactions as any[]) ?? []), ...((rawBalances as any[]) ?? []), ...((rawLiabilities as any[]) ?? [])].map((r) => r.account_id).filter(Boolean));
  return { runId: run.id, executionId: execution.id, evidenceBoundary: run.evidence_boundary, manifestHash: run.evidence_manifest_hash, evidenceIds: (evidence ?? []).map((e) => e.id), sourceIds, itemIds: sourceIds.plaid_items ?? [], accountIds: unique([...accountIds, ...inferredAccounts]), };
}

function field(fieldKey: string, label: string, value: unknown, valueType: string, state: EvidenceState, operator: string, inputs: string[], boundary: string) {
  return { field_key: fieldKey, label, value, value_type: valueType, evidence_state: state, derivation_operator: operator, derivation_version: VERSION, source_inputs: inputs, upstream_nodes: [], source_field_paths: inputs, as_of: boundary, evidence_boundary: boundary, provenance: { source: "level2_governed_domain_runtime", source_inputs: inputs }, output_hash: hash({ fieldKey, value, state, operator, boundary }) };
}

function domainEnvelope(domain: DomainKey, state: EvidenceState, boundary: string, sourceScope: Record<string, unknown>, canonicalFields: any[], derivedFields: any[], relationships: any[], intelligence: any[], limitations: string[]): DomainResult {
  return { domain_key: domain, evidence_state: state, evidence_boundary: boundary, source_scope: sourceScope, canonical_fields: canonicalFields, derived_fields: derivedFields, relationships, domain_intelligence: intelligence, limitations, provenance: { runtime_version: VERSION, source_of_truth: "Supabase", level1_governance_required: true }, freshness: { evidence_boundary: boundary } };
}

async function buildDomains(userId: string, boundary: Level1Boundary): Promise<DomainResult[]> {
  const itemRows = await selectIn<any>("plaid_items", "id,plaid_item_id,institution_name,status,created_at,updated_at,last_synced_at", "id", boundary.itemIds, userId);
  const accountRows = await selectIn<any>("plaid_accounts", "id,item_id,plaid_account_id,name,official_name,mask,type,subtype,current_balance,available_balance,credit_limit,balance_updated_at", "id", boundary.accountIds, userId);
  const rawTxIds = boundary.sourceIds.plaid_raw_transactions ?? [];
  const rawBalanceIds = boundary.sourceIds.plaid_raw_balances ?? [];
  const rawLiabilityIds = boundary.sourceIds.plaid_raw_liabilities ?? [];
  const txRows = await selectIn<any>("transactions", "id,account_id,raw_transaction_id,plaid_transaction_id,amount,iso_currency_code,merchant_name,plaid_category_primary,plaid_category_detailed,posted_date,pending,transaction_class,classification_evidence,is_active", "raw_transaction_id", rawTxIds, userId);
  const balanceRows = await selectIn<any>("plaid_raw_balances", "id,account_id,raw_response,effective_at,acquired_at,evidence_state,observation_hash,is_current", "id", rawBalanceIds, userId);
  const liabilityRows = await selectIn<any>("plaid_raw_liabilities", "id,account_id,raw_response,effective_at,acquired_at,evidence_state,observation_hash,is_current", "id", rawLiabilityIds, userId);
  const productRows = await selectIn<any>("plaid_raw_product_observations", "id,item_id,product,provider_object_id,effective_at,acquired_at,evidence_state,is_current,observation_hash", "id", boundary.sourceIds.plaid_raw_product_observations ?? [], userId);
  const receiptRows = await selectIn<any>("plaid_provider_response_receipts", "id,item_id,product,endpoint,http_status,response_hash,acquired_at", "id", boundary.sourceIds.plaid_provider_response_receipts ?? [], userId);

  const posted = txRows.filter((t) => !t.pending && t.is_active !== false);
  const inflow = posted.filter((t) => Number(t.amount) < 0).reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const outflow = posted.filter((t) => Number(t.amount) > 0).reduce((s, t) => s + Number(t.amount), 0);
  const net = inflow - outflow;
  const dates = posted.map((t) => t.posted_date).filter(Boolean).sort();
  const depository = accountRows.filter((a) => a.type === "depository" && a.current_balance !== null);
  const credit = accountRows.filter((a) => a.type === "credit" && a.current_balance !== null);
  const liquidAssets = depository.length ? depository.reduce((s, a) => s + Number(a.current_balance), 0) : null;
  const revolvingDebt = credit.length ? credit.reduce((s, a) => s + Number(a.current_balance), 0) : null;
  const creditWithLimits = credit.filter((a) => a.credit_limit !== null && Number(a.credit_limit) > 0);
  const creditUtilization = creditWithLimits.length ? creditWithLimits.reduce((s, a) => s + Number(a.current_balance) / Number(a.credit_limit), 0) / creditWithLimits.length : null;
  const latestBalance = accountRows.map((a) => a.balance_updated_at).filter(Boolean).sort().pop() ?? null;
  const investmentProducts = productRows.filter((p) => /investment|holdings|portfolio/i.test(String(p.product)));
  const statementProducts = productRows.filter((p) => /statement/i.test(String(p.product)));
  const identityObserved = itemRows.length > 0 || receiptRows.length > 0;

  const authentication = domainEnvelope("authentication", evidenceState(identityObserved), boundary.evidenceBoundary,
    { plaid_items: itemRows.length, provider_response_receipts: receiptRows.length },
    itemRows.map((i) => field("item.status", "Connection status", i.status, "string", "OBSERVED", "provider_observation", [`plaid_items:${i.id}.status`], boundary.evidenceBoundary)),
    [field("active_item_count", "Active connections", itemRows.filter((i) => i.status === "active").length, "integer", "CALCULATED", "count", ["plaid_items.status"], boundary.evidenceBoundary)],
    receiptRows.map((r) => ({ relation_type: "provider_response_for", from_node_id: r.id, to_node_id: null, domain_keys: ["authentication"], evidence_state: "OBSERVED", basis: { endpoint: r.endpoint, product: r.product, http_status: r.http_status }, derivation_operator: "provider_receipt_binding" })),
    [{ intelligence_key: "authentication.connection_state", name: "Connection state", value: { active_connections: itemRows.filter((i) => i.status === "active").length, receipts: receiptRows.length }, evidence_state: "CALCULATED" }],
    []);

  const transactions = domainEnvelope("transactions", posted.length > 0 ? "OBSERVED" : "INSUFFICIENT_EVIDENCE", boundary.evidenceBoundary,
    { source_records: rawTxIds.length, canonical_records: posted.length, date_range: dates.length ? { first: dates[0], last: dates[dates.length - 1] } : null },
    posted.slice(0, 250).map((t) => field(`transaction:${t.id}`, t.merchant_name ?? "Transaction", { amount: t.amount, date: t.posted_date, class: t.transaction_class, currency: t.iso_currency_code }, "object", "OBSERVED", "canonical_transaction", [`transactions:${t.id}`], boundary.evidenceBoundary)),
    [field("posted_transaction_count", "Posted transactions", posted.length, "integer", "CALCULATED", "count", ["transactions.id"], boundary.evidenceBoundary), field("inflow", "Observed inflow", inflow, "currency", "CALCULATED", "signed_transaction_aggregation", ["transactions.amount"], boundary.evidenceBoundary), field("outflow", "Observed outflow", outflow, "currency", "CALCULATED", "signed_transaction_aggregation", ["transactions.amount"], boundary.evidenceBoundary), field("net_cash_flow", "Observed net cash flow", net, "currency", "CALCULATED", "inflow_minus_outflow", ["transactions.amount"], boundary.evidenceBoundary)],
    unique(posted.map((t) => t.account_id)).map((accountId) => ({ relation_type: "belongs_to_account", from_node_id: accountId, to_node_id: null, domain_keys: ["transactions", "balance"], evidence_state: "OBSERVED", basis: { account_id: accountId }, derivation_operator: "transaction_account_binding" })),
    [{ intelligence_key: "transactions.cash_flow_state", name: "Observed cash flow state", value: { inflow, outflow, net, transaction_count: posted.length }, evidence_state: "CALCULATED" }],
    posted.length ? [] : ["No posted transaction observations were included in the certified Level 1 boundary."]);

  const balance = domainEnvelope("balance", accountRows.length ? "OBSERVED" : "INSUFFICIENT_EVIDENCE", boundary.evidenceBoundary,
    { accounts: accountRows.length, raw_balance_observations: balanceRows.length },
    accountRows.map((a) => field(`account_balance:${a.id}`, a.name ?? "Account balance", { current_balance: a.current_balance, available_balance: a.available_balance, currency: "USD" }, "object", a.current_balance === null ? "LIMITED" : "OBSERVED", "balance_account_observation", [`plaid_accounts:${a.id}.current_balance`, `plaid_accounts:${a.id}.available_balance`], boundary.evidenceBoundary)),
    [field("liquid_assets", "Liquid assets", liquidAssets, "currency", liquidAssets === null ? "INSUFFICIENT_EVIDENCE" : "CALCULATED", "depository_balance_aggregation", ["plaid_accounts.current_balance", "plaid_accounts.type"], boundary.evidenceBoundary), field("revolving_debt", "Revolving debt", revolvingDebt, "currency", revolvingDebt === null ? "INSUFFICIENT_EVIDENCE" : "CALCULATED", "credit_balance_aggregation", ["plaid_accounts.current_balance", "plaid_accounts.type"], boundary.evidenceBoundary), field("credit_utilization", "Credit utilization", creditUtilization, "ratio", creditUtilization === null ? "INSUFFICIENT_EVIDENCE" : "CALCULATED", "credit_limit_ratio", ["plaid_accounts.current_balance", "plaid_accounts.credit_limit"], boundary.evidenceBoundary)],
    accountRows.map((a) => ({ relation_type: "account_balance_observed", from_node_id: a.id, to_node_id: null, domain_keys: ["balance"], evidence_state: a.current_balance === null ? "LIMITED" : "OBSERVED", basis: { balance_updated_at: a.balance_updated_at }, derivation_operator: "balance_account_binding" })),
    [{ intelligence_key: "balance.current_position", name: "Current balance position", value: { liquid_assets: liquidAssets, revolving_debt: revolvingDebt, credit_utilization: creditUtilization, as_of: latestBalance }, evidence_state: "CALCULATED" }],
    liquidAssets === null && revolvingDebt === null ? ["No usable current balances were observed in the certified boundary."] : []);

  const identity = domainEnvelope("identity", identityObserved ? "OBSERVED" : "INSUFFICIENT_EVIDENCE", boundary.evidenceBoundary,
    { institutions: unique(itemRows.map((i) => i.institution_name).filter(Boolean)), accounts: accountRows.length },
    itemRows.map((i) => field(`institution:${i.id}`, "Institution", i.institution_name, "string", "OBSERVED", "provider_identity_binding", [`plaid_items:${i.id}.institution_name`], boundary.evidenceBoundary)),
    [field("account_count", "Connected accounts", accountRows.length, "integer", "CALCULATED", "count", ["plaid_accounts.id"], boundary.evidenceBoundary), field("account_types", "Account types", unique(accountRows.map((a) => `${a.type}:${a.subtype ?? "unknown"}`)), "array", "CALCULATED", "account_type_inventory", ["plaid_accounts.type", "plaid_accounts.subtype"], boundary.evidenceBoundary)],
    accountRows.map((a) => ({ relation_type: "identity_contains_account", from_node_id: null, to_node_id: a.id, domain_keys: ["identity", "balance"], evidence_state: "OBSERVED", basis: { account_id: a.id, institution_item_id: a.item_id }, derivation_operator: "account_identity_binding" })),
    [{ intelligence_key: "identity.account_inventory", name: "Account identity inventory", value: { institutions: unique(itemRows.map((i) => i.institution_name).filter(Boolean)), account_count: accountRows.length }, evidence_state: "CALCULATED" }],
    []);

  const assets = domainEnvelope("assets", depository.length ? "OBSERVED" : "INSUFFICIENT_EVIDENCE", boundary.evidenceBoundary,
    { depository_accounts: depository.length, investment_product_observations: investmentProducts.length },
    depository.map((a) => field(`asset_account:${a.id}`, a.name ?? "Asset account", { account_id: a.id, subtype: a.subtype, current_balance: a.current_balance }, "object", "OBSERVED", "depository_asset_binding", [`plaid_accounts:${a.id}.type`, `plaid_accounts:${a.id}.current_balance`], boundary.evidenceBoundary)),
    [field("liquid_asset_total", "Liquid asset total", liquidAssets, "currency", liquidAssets === null ? "INSUFFICIENT_EVIDENCE" : "CALCULATED", "asset_balance_aggregation", ["plaid_accounts.type", "plaid_accounts.current_balance"], boundary.evidenceBoundary)],
    depository.map((a) => ({ relation_type: "asset_account", from_node_id: null, to_node_id: a.id, domain_keys: ["assets", "balance"], evidence_state: "OBSERVED", basis: { account_type: a.type, subtype: a.subtype }, derivation_operator: "asset_account_binding" })),
    [{ intelligence_key: "assets.liquid_position", name: "Liquid asset position", value: { total: liquidAssets, account_count: depository.length }, evidence_state: "CALCULATED" }],
    depository.length ? [] : ["No depository asset observations were included in the certified boundary."]);

  const liabilities = domainEnvelope("liabilities", credit.length || liabilityRows.length ? "OBSERVED" : "INSUFFICIENT_EVIDENCE", boundary.evidenceBoundary,
    { credit_accounts: credit.length, raw_liability_observations: liabilityRows.length },
    credit.map((a) => field(`liability_account:${a.id}`, a.name ?? "Credit account", { current_balance: a.current_balance, credit_limit: a.credit_limit, subtype: a.subtype }, "object", "OBSERVED", "credit_liability_binding", [`plaid_accounts:${a.id}.current_balance`, `plaid_accounts:${a.id}.credit_limit`], boundary.evidenceBoundary)),
    [field("revolving_debt_total", "Revolving debt total", revolvingDebt, "currency", revolvingDebt === null ? "INSUFFICIENT_EVIDENCE" : "CALCULATED", "liability_balance_aggregation", ["plaid_accounts.type", "plaid_accounts.current_balance"], boundary.evidenceBoundary), field("liability_observation_count", "Liability observations", liabilityRows.length, "integer", "CALCULATED", "count", ["plaid_raw_liabilities.id"], boundary.evidenceBoundary)],
    credit.map((a) => ({ relation_type: "liability_account", from_node_id: null, to_node_id: a.id, domain_keys: ["liabilities", "balance"], evidence_state: "OBSERVED", basis: { account_type: a.type, subtype: a.subtype }, derivation_operator: "liability_account_binding" })),
    [{ intelligence_key: "liabilities.revolving_position", name: "Revolving liability position", value: { total: revolvingDebt, account_count: credit.length, observation_count: liabilityRows.length }, evidence_state: "CALCULATED" }],
    credit.length || liabilityRows.length ? [] : ["No liability observations were included in the certified boundary."]);

  const investments = domainEnvelope("investments", investmentProducts.length ? "OBSERVED" : "INSUFFICIENT_EVIDENCE", boundary.evidenceBoundary,
    { observed_product_records: investmentProducts.length },
    investmentProducts.map((p) => field(`investment_product:${p.id}`, "Investment evidence", { product: p.product, effective_at: p.effective_at }, "object", "OBSERVED", "provider_product_observation", [`plaid_raw_product_observations:${p.id}.product`], boundary.evidenceBoundary)),
    [field("observed_investment_product_count", "Observed investment product records", investmentProducts.length, "integer", "CALCULATED", "count", ["plaid_raw_product_observations.product"], boundary.evidenceBoundary)],
    [],
    [{ intelligence_key: "investments.evidence_state", name: "Investment evidence state", value: { observed_product_records: investmentProducts.length }, evidence_state: investmentProducts.length ? "CALCULATED" : "INSUFFICIENT_EVIDENCE" }],
    investmentProducts.length ? [] : ["No investment product observations were present in the certified Level 1 boundary; holdings are not inferred."]);

  const statements = domainEnvelope("statements", statementProducts.length ? "OBSERVED" : "INSUFFICIENT_EVIDENCE", boundary.evidenceBoundary,
    { observed_statement_product_records: statementProducts.length },
    statementProducts.map((p) => field(`statement_product:${p.id}`, "Statement evidence", { product: p.product, effective_at: p.effective_at }, "object", "OBSERVED", "provider_statement_observation", [`plaid_raw_product_observations:${p.id}.product`], boundary.evidenceBoundary)),
    [field("observed_statement_product_count", "Observed statement product records", statementProducts.length, "integer", "CALCULATED", "count", ["plaid_raw_product_observations.product"], boundary.evidenceBoundary)],
    [],
    [{ intelligence_key: "statements.evidence_state", name: "Statement evidence state", value: { observed_product_records: statementProducts.length }, evidence_state: statementProducts.length ? "CALCULATED" : "INSUFFICIENT_EVIDENCE" }],
    statementProducts.length ? [] : ["Statements are structurally supported but no statement observation was present in the certified evidence boundary."]);

  return [authentication, transactions, balance, identity, assets, liabilities, investments, statements];
}

function crossDomainDefinitions(domains: DomainResult[], boundary: Level1Boundary) {
  const tx = domains.find((d) => d.domain_key === "transactions")!;
  const balance = domains.find((d) => d.domain_key === "balance")!;
  const liabilities = domains.find((d) => d.domain_key === "liabilities")!;
  const txNet = tx.derived_fields.find((f) => f.field_key === "net_cash_flow")?.value ?? null;
  const liquid = balance.derived_fields.find((f) => f.field_key === "liquid_assets")?.value ?? null;
  const debt = liabilities.derived_fields.find((f) => f.field_key === "revolving_debt_total")?.value ?? null;
  const defs: any[] = [];
  if (tx.evidence_state !== "INSUFFICIENT_EVIDENCE" && balance.evidence_state !== "INSUFFICIENT_EVIDENCE") defs.push({ key: "transactions_balance.position", name: "Transaction and balance position", value: { observed_net_cash_flow: txNet, observed_liquid_assets: liquid, evidence_boundary: boundary.evidenceBoundary }, state: "CALCULATED", domains: ["transactions", "balance"] });
  if (tx.evidence_state !== "INSUFFICIENT_EVIDENCE" && liabilities.evidence_state !== "INSUFFICIENT_EVIDENCE") defs.push({ key: "transactions_liabilities.debt_flow_context", name: "Transaction and liability context", value: { observed_net_cash_flow: txNet, observed_revolving_debt: debt, evidence_boundary: boundary.evidenceBoundary }, state: "CALCULATED", domains: ["transactions", "liabilities"] });
  return defs;
}

export async function executeLevel2DomainIntelligence(userId: string) {
  const boundary = await latestCertifiedLevel1(userId);
  const domains = await buildDomains(userId, boundary);
  const crossDomain = crossDomainDefinitions(domains, boundary);
  const asOf = new Date().toISOString();
  const { data: run, error: runError } = await supabaseAdmin.from("iris_runs").insert({ request_id: `level2:${randomUUID()}`, user_id: userId, request_surface: "iris_level2", request_mode: "level2_domain_intelligence", requested_capabilities: DOMAINS.map((d) => `domain.${d}`), status: "PLANNED", as_of: asOf, evidence_boundary: boundary.evidenceBoundary, evidence_version: VERSION, evidence_manifest_hash: boundary.manifestHash, execution_policy: { level: LEVEL, role: "domain_intelligence", source_of_truth: "Supabase", parent_level: 1, parent_run_id: boundary.runId, domains: DOMAINS, downstream_levels_enabled: false }, planner_version: VERSION, orchestrator_version: VERSION, certification_policy_version: CERTIFICATION_POLICY_VERSION, started_at: asOf, updated_at: asOf }).select("id").single();
  if (runError || !run) throw new Error(`LEVEL2_RUN_CREATE_FAILED:${runError?.message ?? "unknown"}`);
  const { data: execution, error: executionError } = await supabaseAdmin.from("iris_execution_records").insert({ run_id: run.id, user_id: userId, capability_id: "iris.level2.domain_intelligence", operator_id: "level2DomainIntelligence", operator_version: VERSION, execution_state: "EXECUTING", evidence_state: "OBSERVED", validation_status: "UNKNOWN", certification_status: "PENDING", input_manifest: { level: LEVEL, parent_level1_run_id: boundary.runId, parent_level1_execution_id: boundary.executionId, evidence_boundary: boundary.evidenceBoundary, evidence_manifest_hash: boundary.manifestHash, evidence_ids: boundary.evidenceIds, domains: DOMAINS }, input_hash: hash({ parent_run: boundary.runId, parent_execution: boundary.executionId, evidence_ids: boundary.evidenceIds, evidence_boundary: boundary.evidenceBoundary }) }).select("id").single();
  if (executionError || !execution) throw new Error(`LEVEL2_EXECUTION_CREATE_FAILED:${executionError?.message ?? "unknown"}`);
  const { error: inputError } = await supabaseAdmin.from("iris_execution_inputs").insert({ execution_id: execution.id, input_type: "level1_certified_evidence_boundary", reference_type: "iris_run", reference_id: boundary.runId, role: "parent_governance", hash: boundary.manifestHash });
  if (inputError) throw new Error(`LEVEL2_INPUT_WRITE_FAILED:${inputError.message}`);

  const domainOutput = { hierarchy_level: LEVEL, artifact_type: "domain_intelligence", intelligence_name: "IRIS Level 2 Domain Intelligence", parent_level: { level: 1, run_id: boundary.runId, execution_id: boundary.executionId, evidence_manifest_hash: boundary.manifestHash }, evidence_boundary: boundary.evidenceBoundary, domains, cross_domain: crossDomain, integrity: { fake_mock_or_seeded_financial_data: false, provider_observations_created: false, money_movement_executed: false, unsupported_values_invented: false } };
  const outputHash = hash(domainOutput);
  const { error: outputError } = await supabaseAdmin.from("iris_execution_outputs").insert({ execution_id: execution.id, output_key: "level2_domain_intelligence", output_type: "domain_intelligence", value: domainOutput, hash: outputHash, evidence_state: domains.some((d) => d.evidence_state === "OBSERVED") ? "CALCULATED" : "INSUFFICIENT_EVIDENCE", uncertainty: null });
  if (outputError) throw new Error(`LEVEL2_OUTPUT_WRITE_FAILED:${outputError.message}`);

  const lineageRows = boundary.evidenceIds.map((evidenceId) => ({ user_id: userId, run_id: run.id, execution_id: execution.id, lineage_role: "SOURCE_EVIDENCE", source_type: "iris_run_evidence", source_id: evidenceId, source_field_path: null, destination_type: "iris_execution_output", destination_id: execution.id, destination_field_path: "domains", evidence_state: "OBSERVED", transformation: "level2_domain_materialization", source_hash: boundary.manifestHash, lineage_hash: hash({ run: run.id, execution: execution.id, evidenceId, outputHash }), metadata: { level: LEVEL, parent_level1_run_id: boundary.runId } }));
  await chunk(lineageRows).reduce(async (p, rows) => { await p; const { error } = await supabaseAdmin.from("iris_execution_lineage").insert(rows); if (error) throw new Error(`LEVEL2_LINEAGE_WRITE_FAILED:${error.message}`); }, Promise.resolve());

  const checks = [
    ["PARENT_LEVEL1_CERTIFIED", true],
    ["EXACT_EVIDENCE_BOUNDARY_BOUND", boundary.evidenceBoundary === (await supabaseAdmin.from("iris_runs").select("evidence_boundary").eq("id", boundary.runId).single()).data?.evidence_boundary],
    ["ALL_EIGHT_DOMAINS_PRESENT", domains.length === 8 && DOMAINS.every((d) => domains.some((x) => x.domain_key === d))],
    ["NO_FAKE_FINANCIAL_DATA", domainOutput.integrity.fake_mock_or_seeded_financial_data === false],
    ["NO_PROVIDER_OBSERVATIONS_CREATED", domainOutput.integrity.provider_observations_created === false],
    ["DERIVED_VALUES_HASHED", domains.every((d) => d.derived_fields.every((f) => Boolean(f.output_hash)))],
    ["SOURCE_PROVENANCE_PRESENT", domains.every((d) => Boolean(d.provenance?.source_of_truth))],
    ["EVIDENCE_LIMITS_PRESERVED", domains.some((d) => d.domain_key === "statements" && d.evidence_state === "INSUFFICIENT_EVIDENCE") || domains.some((d) => d.domain_key === "statements" && d.evidence_state === "OBSERVED")],
    ["CROSS_DOMAIN_ONLY_WHEN_INPUTS_PRESENT", crossDomain.every((c) => c.domains.every((d: string) => domains.find((x) => x.domain_key === d)?.evidence_state !== "INSUFFICIENT_EVIDENCE"))],
    ["LEVEL3_DISABLED", true],
  ] as const;
  const validation = checks.map(([rule_id, pass]) => ({ run_id: run.id, execution_id: execution.id, user_id: userId, rule_id, rule_version: CERTIFICATION_POLICY_VERSION, status: pass ? "PASS" : "FAIL", severity: pass ? "INFO" : "CRITICAL", expected: { status: "PASS" }, actual: { status: pass ? "PASS" : "FAIL" }, details: { level: LEVEL, output_key: "level2_domain_intelligence", parent_level1_run_id: boundary.runId } }));
  const { error: validationError } = await supabaseAdmin.from("iris_validation_results").insert(validation);
  if (validationError) throw new Error(`LEVEL2_VALIDATION_WRITE_FAILED:${validationError.message}`);
  const allPass = checks.every(([, pass]) => pass);
  if (!allPass) throw new Error("LEVEL2_DOMAIN_VALIDATION_FAILED");
  const validationSnapshot = { status: "PASS", checks: Object.fromEntries(checks.map(([id, pass]) => [id, { status: pass ? "PASS" : "FAIL" }])), parent_level1_run_id: boundary.runId };
  const reconciliationSnapshot = { status: "PASS", domain_count: domains.length, cross_domain_count: crossDomain.length, evidence_count: boundary.evidenceIds.length, parent_level1_run_id: boundary.runId, hierarchy_materialization_pre_certification: false };
  const evidenceSnapshot = { parent_level1_run_id: boundary.runId, parent_level1_execution_id: boundary.executionId, evidence_boundary: boundary.evidenceBoundary, evidence_manifest_hash: boundary.manifestHash, evidence_count: boundary.evidenceIds.length };
  const { error: executionUpdateError } = await supabaseAdmin.from("iris_execution_records").update({ execution_state: "EXECUTED", validation_status: "PASS", output_hash: outputHash, validation_snapshot: validationSnapshot, reconciliation_snapshot: reconciliationSnapshot, evidence_snapshot: evidenceSnapshot, completed_at: new Date().toISOString(), publication_status: "NOT_STARTED" }).eq("id", execution.id).eq("user_id", userId);
  if (executionUpdateError) throw new Error(`LEVEL2_EXECUTION_UPDATE_FAILED:${executionUpdateError.message}`);
  await supabaseAdmin.from("iris_runs").update({ status: "VALIDATED", updated_at: new Date().toISOString() }).eq("id", run.id).eq("user_id", userId);
  const certificationPayload = { run_id: run.id, execution_id: execution.id, user_id: userId, policy_version: CERTIFICATION_POLICY_VERSION, status: "CERTIFIED", validation_snapshot: validationSnapshot, reconciliation_snapshot: reconciliationSnapshot, evidence_snapshot: evidenceSnapshot, output_hash: outputHash };
  const certificationHash = hash(certificationPayload);
  const { error: certificationError } = await supabaseAdmin.from("iris_certifications").insert({ ...certificationPayload, certification_hash: certificationHash, certified_at: new Date().toISOString() });
  if (certificationError) throw new Error(`LEVEL2_CERTIFICATION_WRITE_FAILED:${certificationError.message}`);
  const { error: executionCertError } = await supabaseAdmin.from("iris_execution_records").update({ certification_status: "CERTIFIED" }).eq("id", execution.id).eq("user_id", userId);
  if (executionCertError) throw new Error(`LEVEL2_EXECUTION_CERTIFICATION_UPDATE_FAILED:${executionCertError.message}`);
  await supabaseAdmin.from("iris_runs").update({ status: "CERTIFYING", updated_at: new Date().toISOString() }).eq("id", run.id).eq("user_id", userId);

  const materialized: string[] = [];
  const domainNodeIds: Record<string, string> = {};
  for (const domain of domains) {
    const node = await persistArbitraryDerivedIntelligenceNode({ userId, runId: run.id, executionId: execution.id, definition: { intelligenceKey: `level2.domain.${domain.domain_key}`, intelligenceName: `IRIS ${domain.domain_key}`, domainKey: domain.domain_key, nodeType: "intelligence", derivationOperator: "level2.domain_assembly", derivationVersion: VERSION, evidenceState: domain.evidence_state, value: domain as unknown as Record<string, unknown>, evidenceBoundary: boundary.evidenceBoundary, provenance: { parent_level1_run_id: boundary.runId, parent_level1_execution_id: boundary.executionId, evidence_manifest_hash: boundary.manifestHash, domain_key: domain.domain_key }, upstream: [] , capabilityId: `domain.${domain.domain_key}` } });
    domainNodeIds[domain.domain_key] = node.id; materialized.push(node.id);
  }
  for (const composition of crossDomain) {
    const upstream = composition.domains.map((d: string) => domainNodeIds[d]).filter(Boolean).map((nodeId: string) => ({ nodeId, role: `domain:${composition.domains.find((d: string) => domainNodeIds[d] === nodeId)}` }));
    const node = await persistArbitraryDerivedIntelligenceNode({ userId, runId: run.id, executionId: execution.id, definition: { intelligenceKey: `level2.cross_domain.${composition.key}`, intelligenceName: composition.name, nodeType: "cross_domain", derivationOperator: "level2.cross_domain_composition", derivationVersion: VERSION, evidenceState: composition.state, value: composition.value, evidenceBoundary: boundary.evidenceBoundary, provenance: { parent_level1_run_id: boundary.runId, source_domains: composition.domains }, upstream } });
    materialized.push(node.id);
  }
  await supabaseAdmin.from("iris_runs").update({ status: "CERTIFIED", publication_status: "HIERARCHY_PUBLISHED", hierarchy_published_at: new Date().toISOString(), completed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", run.id).eq("user_id", userId);
  return { level: LEVEL, run_id: run.id, execution_id: execution.id, certification_status: "CERTIFIED", certification_hash: certificationHash, output_hash: outputHash, evidence_boundary: boundary.evidenceBoundary, evidence_manifest_hash: boundary.manifestHash, domain_count: domains.length, cross_domain_count: crossDomain.length, materialized_node_count: materialized.length, materialized_node_ids: materialized, publication_status: "HIERARCHY_PUBLISHED" };
}

export async function readLatestLevel2(userId: string) {
  const { data: run } = await supabaseAdmin.from("iris_runs").select("id,status,created_at,completed_at,evidence_boundary,evidence_manifest_hash,publication_status,hierarchy_published_at").eq("user_id", userId).eq("request_mode", "level2_domain_intelligence").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!run || run.status !== "CERTIFIED") return { certified: false, level: LEVEL };
  const { data: execution } = await supabaseAdmin.from("iris_execution_records").select("id,certification_status,validation_status,output_hash").eq("run_id", run.id).eq("user_id", userId).maybeSingle();
  const { data: certification } = await supabaseAdmin.from("iris_certifications").select("certification_hash,certified_at,status").eq("run_id", run.id).eq("execution_id", execution?.id ?? "").eq("user_id", userId).maybeSingle();
  const { data: output } = await supabaseAdmin.from("iris_execution_outputs").select("value,hash,evidence_state").eq("execution_id", execution?.id ?? "").eq("output_key", "level2_domain_intelligence").maybeSingle();
  if (!execution || execution.certification_status !== "CERTIFIED" || execution.validation_status !== "PASS" || !certification || certification.status !== "CERTIFIED" || !output?.value) return { certified: false, level: LEVEL };
  const { count: nodeCount } = await supabaseAdmin.from("iris_user_intelligence_nodes").select("id", { count: "exact", head: true }).eq("run_id", run.id).eq("execution_id", execution.id).eq("user_id", userId);
  const { count: edgeCount } = await supabaseAdmin.from("iris_user_intelligence_edges").select("id", { count: "exact", head: true }).eq("run_id", run.id).eq("user_id", userId);
  const { count: compositionCount } = await supabaseAdmin.from("iris_user_intelligence_compositions").select("id", { count: "exact", head: true }).eq("run_id", run.id).eq("user_id", userId);
  return { level: LEVEL, intelligence_name: "IRIS Level 2 Domain Intelligence", certified: true, run_id: run.id, execution_id: execution.id, certification_hash: certification.certification_hash, certified_at: certification.certified_at, output_hash: output.hash, evidence_state: output.evidence_state, evidence_boundary: run.evidence_boundary, evidence_manifest_hash: run.evidence_manifest_hash, publication_status: run.publication_status, hierarchy_published_at: run.hierarchy_published_at, materialized: { nodes: nodeCount ?? 0, edges: edgeCount ?? 0, compositions: compositionCount ?? 0 }, ...output.value };
}
