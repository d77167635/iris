import { useEffect, useMemo, useState } from "react";
import { api } from "../api/backend";
import type { IrisConsumerIntelligenceResponse } from "../contracts/irisConsumer";
import { findWorkspace } from "./irisWorkspaceRegistry";

type Props = { page: string; go?: (page: string) => void };
type Overview = { accounts?: Array<Record<string, unknown>>; recent_transactions?: Array<Record<string, unknown>> };
type Intelligence = IrisConsumerIntelligenceResponse;

const money = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n < 0 ? "−" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const count = (value: unknown) => Array.isArray(value) ? String(value.length) : value && typeof value === "object" ? String(Object.keys(value as object).length) : value == null ? "—" : String(value);
const pct = (value: unknown) => { const n = Number(value); return Number.isFinite(n) ? `${(n * 100).toFixed(0)}%` : "—"; };
const label = (value: unknown) => String(value ?? "—").replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());

function Card({ title, value, note }: { title: string; value: unknown; note?: string }) {
  return <article className="iris-surface-card"><span>{title}</span><strong>{value == null ? "—" : String(value)}</strong>{note && <small>{note}</small>}</article>;
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
    setLoading(true); setError(null);
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
  const metrics = useMemo((): Array<[string, string, string?]> => {
    const cash = intel?.cash_flow;
    const debt = intel?.debt_health;
    const net = intel?.net_worth;
    const spending = Array.isArray(intel?.spending_hierarchy) ? intel.spending_hierarchy : [];
    const recurringValue = intel?.recurring_series ?? intel?.recurring;
    const recurring = Array.isArray(recurringValue) ? recurringValue : [];
    const anomalies = Array.isArray(intel?.anomalies) ? intel.anomalies : [];
    const projection = intel?.forward_projection?.series;
    if (page.startsWith("money")) return [["Accounts", count(accounts), "Observed persisted accounts"], ["Liquid assets", certified ? money(net?.liquid_assets) : "—", certified ? "Certified calculation" : "Intelligence publication blocked"], ["Transactions", count(transactions), "Observed transaction records"]];
    if (page.startsWith("cashflow")) return [["Inflows", certified ? money(cash?.inflow) : "—"], ["Outflows", certified ? money(cash?.outflow) : "—"], ["Net", certified ? money(cash?.net) : "—"], ["Forward projection points", certified ? count(projection) : "—"]];
    if (page.startsWith("spending")) return [["Spending groups", certified ? count(spending) : "—"], ["Anomalies", certified ? count(anomalies) : "—"], ["Observed transactions", count(transactions)]];
    if (page.startsWith("obligations")) return [["Recurring structures", certified ? count(recurring) : "—"], ["Known upcoming bills", certified ? count(intel?.cash_flow_safety?.upcomingBills) : "—"], ["Evidence state", certified ? "Certified" : "Insufficient evidence"]];
    if (page.startsWith("income")) return [["Observed inflow", certified ? money(cash?.inflow) : "—", "IRIS will not infer income from unrelated activity"], ["Transaction observations", count(transactions)], ["Evidence state", certified ? "Certified" : "Insufficient evidence"]];
    if (page.startsWith("debt")) return [["Revolving debt", certified ? money(debt?.revolving_debt) : "—"], ["Credit utilization", certified ? pct(debt?.credit_utilization) : "—"], ["Interest attribution", certified ? money(debt?.interest_cost_attribution?.estimatedMonthlyInterestCost) : "—"]];
    if (page.startsWith("networth")) return [["Liquid assets", certified ? money(net?.liquid_assets) : "—"], ["Balance history", certified ? count(intel?.balance_history) : "—"], ["Evidence state", certified ? "Certified" : "Insufficient evidence"]];
    if (page.startsWith("data")) return [["Accounts", count(accounts)], ["Provider items", count(plaid?.items)], ["Provider evidence", count(plaid?.provider_evidence_counts)]];
    if (page.startsWith("iris/")) return [["Certified publication", certified ? "Yes" : "No"], ["Intelligence state", label(intel?.run_status ?? "not_run")], ["Observed accounts", count(accounts)]];
    return [["Observed accounts", count(accounts)], ["Observed transactions", count(transactions)], ["Intelligence publication", certified ? "Certified" : "Blocked"]];
  }, [accounts, transactions, intel, plaid, page, certified]);

  if (!node) return <main className="iris4-screen"><section className="iris-surface"><span className="eyebrow">UNSUPPORTED ROUTE</span><h1>This IRIS destination does not exist.</h1><p>The route is not present in the authoritative workspace registry. IRIS will not silently substitute another page.</p><button type="button" onClick={() => go?.("iris")}>Return to IRIS</button></section></main>;

  return <main className="iris4-screen"><header className="iris4-hero"><div><span>IRIS · {node.label}</span><h1>{node.label}</h1><p>{node.description}</p></div><div className="iris4-status"><b>Observed accounts</b> {count(accounts)}<i/><b>Publication</b> {certified ? "certified" : "evidence-gated"}<i/><b>State</b> {label(intel?.run_status ?? "not run")}</div></header><section className="iris4-body"><section className="iris-surface"><span className="eyebrow">GOVERNED SURFACE</span><h2>Only evidence-backed content is shown.</h2><p>{loading ? "Reading governed financial evidence…" : error ? error : "This workspace is a traversal surface into the same IRIS hierarchy. Values below come from persisted observations or certified intelligence only."}</p><div className="iris-metric-grid">{metrics.map(([title, value, note]) => <Card key={title} title={title} value={value} note={note}/>)}</div></section>{page.startsWith("money/accounts") && <section className="iris-surface"><span className="eyebrow">OBSERVED ACCOUNTS</span>{accounts.length ? <div className="iris-metric-grid">{accounts.map(account => <Card key={String(account.id)} title={String(account.name ?? account.official_name ?? "Account")} value={money(account.current_balance)} note={[account.type, account.subtype].filter(Boolean).join(" · ") || "Account type unavailable"}/>)}</div> : <p>No persisted account observations are available.</p>}</section>}{page === "spending/transactions" && <section className="iris-surface"><span className="eyebrow">OBSERVED TRANSACTIONS</span>{transactions.length ? <div>{transactions.slice(0, 50).map(tx => <p key={String(tx.id)}><strong>{String(tx.merchant_name ?? tx.name ?? "Transaction")}</strong> · {money(tx.amount)} · {String(tx.posted_date ?? "date unavailable")}</p>)}</div> : <p>No persisted transaction observations are available.</p>}</section>}<section className="iris-surface"><span className="eyebrow">TRAVERSE THE HIERARCHY</span><p>IRIS keeps every workspace connected to evidence, reasoning and the broader intelligence graph.</p><div className="iris-journey-actions"><button type="button" onClick={() => go?.("iris/evidence")}>Verify evidence →</button><button type="button" onClick={() => go?.("iris/intelligence")}>Explore intelligence →</button><button type="button" onClick={() => go?.("iris/reasoning")}>Understand →</button></div></section></section></main>;
}
