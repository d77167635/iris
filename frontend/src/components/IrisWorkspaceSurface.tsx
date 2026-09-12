import { useEffect, useMemo, useState } from "react";
import { api } from "../api/backend";
import type { IrisConsumerIntelligenceResponse } from "../contracts/irisConsumer";
import { findWorkspace, workspaceChildren } from "./irisWorkspaceRegistry";

type Props = { page: string; go?: (page: string) => void };
type Overview = { accounts?: Array<Record<string, unknown>>; recent_transactions?: Array<Record<string, unknown>> };
type Intelligence = IrisConsumerIntelligenceResponse;
type Metric = { title: string; value: string; note?: string };
type RecordRow = { title: string; value: string; note?: string };

type RouteModel = {
  eyebrow: string;
  purpose: string;
  metrics: Metric[];
  sectionTitle: string;
  sectionText: string;
  rows: RecordRow[];
};

const money = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n < 0 ? "−" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const count = (value: unknown) => Array.isArray(value) ? String(value.length) : value && typeof value === "object" ? String(Object.keys(value as object).length) : value == null ? "—" : String(value);
const pct = (value: unknown) => { const n = Number(value); return Number.isFinite(n) ? `${(n * 100).toFixed(0)}%` : "—"; };
const label = (value: unknown) => String(value ?? "—").replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());
const array = (value: unknown): any[] => Array.isArray(value) ? value : [];

function Card({ title, value, note }: { title: string; value: unknown; note?: string }) {
  return <article className="iris-surface-card"><span>{title}</span><strong>{value == null ? "—" : String(value)}</strong>{note && <small>{note}</small>}</article>;
}

function routeModel(page: string, accounts: Array<Record<string, unknown>>, transactions: Array<Record<string, unknown>>, intel: Intelligence | null, plaid: any, certified: boolean, nodeLabel: string): RouteModel {
  const i = (intel ?? {}) as any;
  const cash = i.cash_flow;
  const debt = i.debt_health;
  const net = i.net_worth;
  const spending = array(i.spending_hierarchy);
  const recurring = array(i.recurring_series ?? i.recurring);
  const anomalies = array(i.anomalies);
  const projection = i.forward_projection?.series ?? i.forward_projection?.projection;
  const balanceHistory = array(i.balance_history);
  const rowsFrom = (items: any[], titleKey: string, valueKey: string, noteKey?: string): RecordRow[] => items.slice(0, 50).map((item, index) => ({ title: String(item?.[titleKey] ?? item?.name ?? `${nodeLabel} ${index + 1}`), value: valueKey === "amount" ? money(item?.amount) : String(item?.[valueKey] ?? "—"), note: noteKey ? String(item?.[noteKey] ?? "") || undefined : undefined }));

  if (page === "money/overview") return { eyebrow: "MONEY · OVERVIEW", purpose: "Current financial structure from persisted account observations.", metrics: [{ title: "Observed accounts", value: count(accounts), note: "Persisted account observations" }, { title: "Observed activity", value: count(transactions), note: "Persisted transaction observations" }, { title: "Certified intelligence", value: certified ? "Available" : "Blocked", note: certified ? "Publication gate passed" : "No certified intelligence output" }], sectionTitle: "Financial structure", sectionText: "IRIS keeps account state and intelligence connected. Derived values appear only after their governing certification gate passes.", rows: accounts.slice(0, 50).map(a => ({ title: String(a.name ?? a.official_name ?? "Account"), value: money(a.current_balance), note: [a.type, a.subtype].filter(Boolean).join(" · ") || "Account type unavailable" })) };
  if (page === "money/accounts" || page === "money/accounts/detail") return { eyebrow: "MONEY · ACCOUNTS", purpose: page.endsWith("detail") ? "Account-level observations and relationships." : "Connected accounts observed for this signed-in user.", metrics: [{ title: "Accounts", value: count(accounts), note: "Observed and persisted" }, { title: "Latest activity", value: count(transactions), note: "Observed transactions" }, { title: "Evidence state", value: "Observed", note: "Account records are not fabricated" }], sectionTitle: page.endsWith("detail") ? "Account observations" : "Connected accounts", sectionText: page.endsWith("detail") ? "Select an account context from the observed records; unsupported account relationships remain unknown rather than inferred." : "Every account shown here is sourced from the governed overview response.", rows: accounts.slice(0, 50).map(a => ({ title: String(a.name ?? a.official_name ?? "Account"), value: money(a.current_balance), note: [a.type, a.subtype, a.mask].filter(Boolean).join(" · ") || "Account metadata unavailable" })) };
  if (page === "money/assets") return { eyebrow: "MONEY · ASSETS", purpose: "Observed asset state and relationships.", metrics: [{ title: "Observed accounts", value: count(accounts) }, { title: "Derived asset state", value: certified ? money(net?.liquid_assets) : "—", note: certified ? "Certified calculation" : "Insufficient certified intelligence" }, { title: "Evidence", value: certified ? "Certified" : "Observed only" }], sectionTitle: "Asset evidence", sectionText: certified ? "The derived asset metric is published because the intelligence certification gate passed." : "IRIS will not manufacture an asset total when the required intelligence output is not certified.", rows: [] };
  if (page === "money/liabilities") return { eyebrow: "MONEY · LIABILITIES", purpose: "Observed liability state where provider evidence supports it.", metrics: [{ title: "Observed accounts", value: count(accounts) }, { title: "Revolving debt", value: certified ? money(debt?.revolving_debt) : "—", note: certified ? "Certified calculation" : "Certification required" }, { title: "Evidence", value: certified ? "Certified" : "Evidence-gated" }], sectionTitle: "Liability evidence", sectionText: "Liability conclusions remain bounded to actual observed provider evidence and certified calculations.", rows: [] };
  if (page === "money/timeline") return { eyebrow: "MONEY · TIMELINE", purpose: "Financial state through time.", metrics: [{ title: "History points", value: certified ? count(balanceHistory) : "—", note: certified ? "Certified balance history" : "Certification required" }, { title: "Observed transactions", value: count(transactions) }, { title: "Evidence state", value: certified ? "Certified" : "Evidence-gated" }], sectionTitle: "Temporal state", sectionText: certified ? "The available history is derived from the governed balance/transaction boundary." : "A historical reconstruction is not displayed until the required intelligence output is certified.", rows: balanceHistory.slice(-12).map((x: any) => ({ title: String(x.date ?? "Date"), value: money(x.liquidAssets), note: "Derived balance state" })) };

  if (page.startsWith("cashflow")) {
    const base: Metric[] = [{ title: "Observed transactions", value: count(transactions) }, { title: "Evidence state", value: certified ? "Certified" : "Evidence-gated" }];
    if (page === "cashflow/inflows") base.unshift({ title: "Observed inflows", value: certified ? money(cash?.inflow) : "—", note: "Current governed window" });
    else if (page === "cashflow/outflows") base.unshift({ title: "Observed outflows", value: certified ? money(cash?.outflow) : "—", note: "Current governed window" });
    else if (page === "cashflow/forecast") base.unshift({ title: "Projection points", value: certified ? count(projection) : "—", note: "Evidence-bound forward model" });
    else if (page === "cashflow/liquidity") base.unshift({ title: "Liquidity", value: certified ? money(i.cash_flow_safety?.currentAvailable) : "—", note: "Observed available balance" });
    else base.unshift({ title: "Net flow", value: certified ? money(cash?.net) : "—", note: "Current governed window" });
    return { eyebrow: `CASH FLOW · ${nodeLabel.toUpperCase()}`, purpose: `Observed ${nodeLabel.toLowerCase()} within the same IRIS financial-life hierarchy.`, metrics: base, sectionTitle: nodeLabel, sectionText: certified ? "Derived cash-flow content is published only from the certified intelligence contract." : "This surface remains evidence-gated until the required intelligence output is certified.", rows: [] };
  }

  if (page.startsWith("spending")) {
    const rows = page === "spending/transactions" ? rowsFrom(transactions, "merchant_name", "amount", "posted_date") : spending.slice(0, 50).map((x: any) => ({ title: String(x.label ?? x.key ?? "Spending group"), value: money(x.amount), note: x.changePct == null ? undefined : `${Number(x.changePct).toFixed(0)}% change` }));
    return { eyebrow: `SPENDING · ${nodeLabel.toUpperCase()}`, purpose: `Observed behavior and economic classification: ${nodeLabel}.`, metrics: [{ title: "Observed transactions", value: count(transactions) }, { title: "Spending groups", value: certified ? count(spending) : "—", note: certified ? "Certified analysis" : "Certification required" }, { title: "Anomalies", value: certified ? count(anomalies) : "—", note: certified ? "Certified anomaly output" : "Certification required" }], sectionTitle: nodeLabel, sectionText: page === "spending/classification" ? "Classification retains evidence and uncertainty; unknown economic meaning is never silently converted into a definitive category." : "Spending views are derived from observed transaction records and governed intelligence only.", rows };
  }

  if (page.startsWith("obligations")) return { eyebrow: `OBLIGATIONS · ${nodeLabel.toUpperCase()}`, purpose: `Observed recurrence and expected commitment state: ${nodeLabel}.`, metrics: [{ title: "Recurring structures", value: certified ? count(recurring) : "—", note: certified ? "Certified recurrence analysis" : "Certification required" }, { title: "Upcoming", value: certified ? count(i.cash_flow_safety?.upcomingBills) : "—" }, { title: "Observed transactions", value: count(transactions) }], sectionTitle: nodeLabel, sectionText: page === "obligations/upcoming" || page === "obligations/calendar" ? "Future obligations are presented only when supported by governed recurrence/evidence logic; no commitment is invented." : "Recurring and subscription relationships remain evidence-backed candidates unless explicitly certified.", rows: recurring.slice(0, 50).map((x: any) => ({ title: String(x.merchant ?? "Recurring activity"), value: money(x.amount ?? x.typical_amount), note: String(x.expectedDate ?? x.next_expected_date ?? "") || undefined })) };

  if (page.startsWith("income")) return { eyebrow: `INCOME · ${nodeLabel.toUpperCase()}`, purpose: `Observed income signals and timing: ${nodeLabel}.`, metrics: [{ title: "Observed transactions", value: count(transactions) }, { title: "Observed inflow", value: certified ? money(cash?.inflow) : "—", note: "Not a guarantee of income" }, { title: "Evidence state", value: certified ? "Certified" : "Insufficient evidence" }], sectionTitle: nodeLabel, sectionText: "IRIS does not infer income merely because a transaction is positive. Income-specific semantics remain evidence-gated.", rows: [] };

  if (page.startsWith("debt")) return { eyebrow: `DEBT · ${nodeLabel.toUpperCase()}`, purpose: `Credit and repayment state: ${nodeLabel}.`, metrics: [{ title: "Revolving debt", value: certified ? money(debt?.revolving_debt) : "—" }, { title: "Credit utilization", value: certified ? pct(debt?.credit_utilization) : "—" }, { title: "Interest attribution", value: certified ? money(i.debt_cost?.estimatedMonthlyInterestCost ?? i.interest_cost_attribution?.estimatedMonthlyInterestCost) : "—" }], sectionTitle: nodeLabel, sectionText: "Debt intelligence is derived from observed liability, balance, and transaction evidence only. No payoff result is guaranteed.", rows: [] };

  if (page.startsWith("networth")) return { eyebrow: `NET WORTH · ${nodeLabel.toUpperCase()}`, purpose: `Assets, liabilities and change: ${nodeLabel}.`, metrics: [{ title: "Liquid assets", value: certified ? money(net?.liquid_assets) : "—" }, { title: "History points", value: certified ? count(balanceHistory) : "—" }, { title: "Evidence state", value: certified ? "Certified" : "Evidence-gated" }], sectionTitle: nodeLabel, sectionText: "Net-worth content is a derived state, not a provider observation. It is shown only when the governing intelligence output is certified.", rows: [] };

  if (page.startsWith("data")) {
    const items = array(plaid?.items);
    const providerCounts = plaid?.provider_evidence_counts;
    const rows = page === "data/products" ? items.slice(0, 50).map((x: any) => ({ title: String(x.product ?? "Provider product"), value: String(x.lifecycle_state ?? x.evidence_state ?? "—"), note: x.item_id ? `Item ${String(x.item_id).slice(0, 8)}…` : undefined })) : [];
    return { eyebrow: `DATA & PLAID · ${nodeLabel.toUpperCase()}`, purpose: `Provider boundary, coverage and provenance: ${nodeLabel}.`, metrics: [{ title: "Provider items", value: count(items), note: "Provider/source state" }, { title: "Provider evidence", value: count(providerCounts), note: "Observed evidence domains" }, { title: "Observed accounts", value: count(accounts) }], sectionTitle: nodeLabel, sectionText: "Data & Plaid is the external provider/source boundary within the same IRIS hierarchy. Provider capability state is never presented as financial observation.", rows };
  }

  if (page.startsWith("iris/")) return { eyebrow: `IRIS · ${nodeLabel.toUpperCase()}`, purpose: `Intelligence traversal surface: ${nodeLabel}.`, metrics: [{ title: "Observed accounts", value: count(accounts) }, { title: "Intelligence state", value: label(i.run_status ?? "not_run") }, { title: "Publication", value: certified ? "Certified" : "Evidence-gated" }], sectionTitle: nodeLabel, sectionText: certified ? "This surface is connected to the certified intelligence contract and may traverse supported upstream evidence." : "This surface remains connected to the hierarchy, but derived content is withheld until the runtime certification gate passes.", rows: [] };

  return { eyebrow: `IRIS · ${nodeLabel.toUpperCase()}`, purpose: "Governed financial-life traversal surface.", metrics: [{ title: "Observed accounts", value: count(accounts) }, { title: "Observed transactions", value: count(transactions) }, { title: "Publication", value: certified ? "Certified" : "Evidence-gated" }], sectionTitle: nodeLabel, sectionText: "Only persisted observations and certified intelligence are eligible for display.", rows: [] };
}

export function IrisWorkspaceSurface({ page, go }: Props) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [intel, setIntel] = useState<Intelligence | null>(null);
  const [plaid, setPlaid] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const node = findWorkspace(page);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.allSettled([
      api.getOverview(),
      api.getIntelligence(),
      page.startsWith("data/") || page === "data" ? api.getPlaidSurface() : Promise.resolve(null),
    ]).then(([overviewResult, intelResult, plaidResult]) => {
      if (!active) return;
      if (overviewResult.status === "fulfilled") setOverview(overviewResult.value);
      else setError(overviewResult.reason instanceof Error ? overviewResult.reason.message : "IRIS could not read observed financial data.");
      if (intelResult.status === "fulfilled") setIntel(intelResult.value);
      if (plaidResult.status === "fulfilled") setPlaid(plaidResult.value);
      setLoading(false);
    });
    return () => { active = false; };
  }, [page]);

  const accounts = overview?.accounts ?? [];
  const transactions = overview?.recent_transactions ?? [];
  const certified = intel?.certified === true && intel?.certification_gate?.eligible === true;
  const model = useMemo(() => node ? routeModel(page, accounts, transactions, intel, plaid, certified, node.label) : null, [page, node, accounts, transactions, intel, plaid, certified]);
  const children = workspaceChildren(page);

  if (!node) return <main className="iris4-screen"><section className="iris-surface iris-route-state"><span className="eyebrow">UNSUPPORTED ROUTE</span><h1>This IRIS destination does not exist.</h1><p>The route is not present in the authoritative workspace registry. IRIS will not silently substitute another page.</p><button type="button" onClick={() => go?.("iris")}>Return to IRIS</button></section></main>;

  return <main className="iris4-screen">
    <header className="iris4-hero iris-route-hero">
      <div><span>IRIS · {node.label}</span><h1>{node.label}</h1><p>{node.description}</p></div>
      <div className="iris4-status"><b>Observed accounts</b> {count(accounts)}<i/><b>Publication</b> {certified ? "certified" : "evidence-gated"}<i/><b>State</b> {label(intel?.run_status ?? "not run")}</div>
    </header>
    <section className="iris4-body">
      <section className="iris-surface iris-route-intro"><span className="eyebrow">{model?.eyebrow}</span><h2>{model?.purpose}</h2><p>{loading ? "Reading governed financial evidence…" : error ? error : model?.sectionText}</p></section>
      <section className="iris-metric-grid iris-route-metrics">{model?.metrics.map(metric => <Card key={metric.title} title={metric.title} value={metric.value} note={metric.note}/>)}</section>
      {children.length > 0 && <section className="iris-surface iris-route-children"><span className="eyebrow">EXPLORE THIS DOMAIN</span><div className="iris-route-child-grid">{children.map(child => <button key={child.id} type="button" onClick={() => go?.(child.id)}><strong>{child.label}</strong><span>{child.description}</span></button>)}</div></section>}
      <section className="iris-surface iris-route-records"><span className="eyebrow">{model?.sectionTitle.toUpperCase()}</span>{model?.rows.length ? <div className="iris-record-list">{model.rows.map(row => <article key={`${row.title}-${row.value}`}><strong>{row.title}</strong><b>{row.value}</b>{row.note && <small>{row.note}</small>}</article>)}</div> : <p className="iris-truth-state">{certified ? "No additional records are currently exposed by this route's governed contract." : "Derived content is withheld until its required intelligence certification gate passes. Observed provider records remain available only on routes that explicitly expose them."}</p>}</section>
      {page === "spending/transactions" && transactions.length > 0 && <section className="iris-surface iris-route-records"><span className="eyebrow">OBSERVED TRANSACTIONS</span><div className="iris-record-list">{transactions.slice(0, 50).map(tx => <article key={String(tx.id)}><strong>{String(tx.merchant_name ?? tx.name ?? "Transaction")}</strong><b>{money(tx.amount)}</b><small>{String(tx.posted_date ?? "Date unavailable")}</small></article>)}</div></section>}
      <section className="iris-surface iris-route-traverse"><span className="eyebrow">TRAVERSE THE HIERARCHY</span><p>Every route remains connected to evidence, reasoning and the broader IRIS graph. Unsupported content is withheld rather than invented.</p><div className="iris-journey-actions"><button type="button" onClick={() => go?.("iris/evidence")}>Verify evidence →</button><button type="button" onClick={() => go?.("iris/intelligence")}>Explore intelligence →</button><button type="button" onClick={() => go?.("iris/reasoning")}>Understand →</button></div></section>
    </section>
  </main>;
}
