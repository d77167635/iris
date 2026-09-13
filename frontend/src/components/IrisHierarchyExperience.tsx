import { useEffect, useMemo, useState } from "react";
import { api } from "../api/backend";
import "./IrisHierarchyExperience.css";

type Field = { field_key: string; label: string; value: unknown; value_type?: string; evidence_state?: string; derivation_operator?: string };
type Relationship = { relation_type?: string; account_id?: string; item_id?: string; domain_keys?: string[]; evidence_state?: string; [key: string]: unknown };
type Domain = { domain_key: string; evidence_state: string; canonical_fields?: Field[]; derived_fields?: Field[]; relationships?: Relationship[]; domain_intelligence?: any[]; limitations?: string[] };
type Cross = { key: string; name: string; domains: string[]; state: string; value: Record<string, unknown> };
type Level2 = { certified?: boolean; level: number; evidence_boundary?: string; domains?: Domain[]; cross_domain?: Cross[]; materialized?: { nodes: number; edges: number; compositions: number } };
type Level3Temporal = { certified?: boolean; status?: string; publication_status?: string; run_id?: string; execution_id?: string; evidence_boundary?: string; output_hash?: string; certification_hash?: string; result?: { temporal_state?: { first_observed_date?: string; last_observed_date?: string; observed_span_days?: number; canonical_posted_transaction_count?: number; temporal_granularity?: string; evidence_boundary?: string }; temporal_relationships?: Array<Record<string, unknown>>; coverage?: { transaction_date_range_supported?: boolean; transaction_level_sequence_supported?: boolean; limitation?: string }; upstream?: { level?: number; run_id?: string; execution_id?: string; output_hash?: string; node_id?: string; node_hash?: string }; provenance?: Record<string, unknown> } };

const names: Record<string, string> = { authentication: "Connections", transactions: "Transactions", balance: "Balance", identity: "Identity", assets: "Assets", liabilities: "Liabilities", investments: "Investments", statements: "Statements" };
const money = (v: unknown) => typeof v === "number" && Number.isFinite(v) ? `${v < 0 ? "−" : ""}$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : v == null ? "—" : String(v);
const pretty = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const stateLabel = (state?: string) => pretty((state ?? "INSUFFICIENT_EVIDENCE").toLowerCase());
const show = (v: unknown, type?: string) => type === "currency" ? money(v) : type === "ratio" && typeof v === "number" ? `${(v * 100).toFixed(1)}%` : v == null ? "Insufficient evidence" : typeof v === "object" ? "" : String(v);
function State({ state }: { state?: string }) { return <span className={`ih-state ${(state ?? "INSUFFICIENT_EVIDENCE").toLowerCase()}`}>{stateLabel(state)}</span>; }
function FieldValue({ field }: { field: Field }) { return <article className="ih-field"><div><span>{field.label}</span><State state={field.evidence_state}/></div><strong>{show(field.value, field.value_type)}</strong><small>{field.derivation_operator ? pretty(field.derivation_operator) : "Observed financial state"}</small></article>; }
function TransactionRecord({ field }: { field: Field }) { const value = (field.value ?? {}) as Record<string, unknown>; const amount = typeof value.amount === "number" ? value.amount : null; const date = typeof value.posted_date === "string" ? new Date(`${value.posted_date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Date not observed"; const classification = typeof value.transaction_class === "string" ? value.transaction_class : "unknown"; return <article className="ih-transaction"><div className="ih-transaction-main"><div className="ih-merchant"><b>{field.label}</b><span>{date}</span></div><div className="ih-transaction-amount"><strong>{amount === null ? "—" : money(amount)}</strong><State state="OBSERVED"/></div></div><div className="ih-transaction-meta"><span>{pretty(classification)}</span><span>{String(value.currency ?? "USD")}</span><span>Observed</span></div></article>; }

export function IrisHierarchyExperience() {
  const [data, setData] = useState<Level2 | null>(null);
  const [temporal, setTemporal] = useState<Level3Temporal | null>(null);
  const [active, setActive] = useState("overview");
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(true);
  const [temporalRunning, setTemporalRunning] = useState(false);

  const load = async () => {
    setError(null); setRunning(true);
    try {
      let current = await api.getIrisLevel2();
      if (!current?.certified) {
        const result = await api.runIrisLevel2();
        if (result?.certification_status !== "CERTIFIED") throw new Error("IRIS could not certify the current financial hierarchy.");
        current = await api.getIrisLevel2();
      }
      if (!current?.certified) throw new Error("The certified IRIS hierarchy is not available.");
      setData(current);
      try {
        let currentTemporal = await api.getIrisLevel3Temporal();
        if (!currentTemporal?.certified) {
          setTemporalRunning(true);
          currentTemporal = await api.runIrisLevel3Temporal();
        }
        setTemporal(currentTemporal);
      } catch (temporalError) {
        console.error("Level 3 Temporal unavailable", temporalError);
        setTemporal(null);
      } finally { setTemporalRunning(false); }
    } catch (e) { setError(e instanceof Error ? e.message : "IRIS could not load the current hierarchy."); }
    finally { setRunning(false); }
  };
  useEffect(() => { void load(); }, []);

  const domains = data?.domains ?? [];
  const selected = domains.find(d => d.domain_key === active);
  const cross = data?.cross_domain ?? [];
  const connections = useMemo(() => cross.filter(x => x.domains.length >= 2), [cross]);
  const accountNames = useMemo(() => { const map = new Map<string, string>(); const balances = domains.find(d => d.domain_key === "balance")?.canonical_fields ?? []; for (const field of balances) { const id = field.field_key.match(/^account:([^.]*)\.balance$/)?.[1]; if (id) map.set(id, field.label); } return map; }, [domains]);
  const relationshipLabel = (r: Relationship) => r.account_id ? accountNames.get(r.account_id) ?? "Connected account" : r.item_id ? "Connected institution" : pretty(r.relation_type ?? "relationship");
  const temporalState = temporal?.result?.temporal_state ?? {};
  const temporalCoverage = temporal?.result?.coverage ?? {};

  if (running) return <main className="ih-loading"><div className="ih-orb">I</div><h1>IRIS</h1><p>Assembling your connected financial life…</p></main>;
  if (error || !data) return <main className="ih-loading"><div className="ih-orb">I</div><h1>IRIS</h1><p>{error ?? "Your financial state could not be loaded."}</p><button onClick={() => void load()}>Try again</button></main>;

  return <main className="ih-app">
    <header className="ih-header"><div className="ih-brand"><div className="ih-mark">I</div><div><b>IRIS</b><span>Financial life intelligence</span></div></div><div className="ih-header-state"><span className="ih-live"/>Current state <State state="OBSERVED"/></div></header>
    <div className="ih-layout"><aside className="ih-nav"><div className="ih-nav-title">Your financial life</div><button className={active === "overview" ? "active" : ""} onClick={() => setActive("overview")}>Overview</button>{domains.map(d => <button key={d.domain_key} className={active === d.domain_key ? "active" : ""} onClick={() => setActive(d.domain_key)}>{names[d.domain_key] ?? pretty(d.domain_key)}<State state={d.evidence_state}/></button>)}</aside>
      <section className="ih-content">{active === "overview" ? <>
        <div className="ih-hero"><div><span className="ih-eyebrow">Your financial life</span><h1>See the relationships,<br/>not just the numbers.</h1><p>IRIS organizes authorized financial evidence into a living, relational state. Move through the hierarchy and connected intelligence stays in context.</p></div><div className="ih-core"><div className="ih-core-ring">IRIS</div>{domains.map((d, i) => <i key={d.domain_key} style={{ ["--i" as any]: i }}/>)}</div></div>

        <section className="ih-section"><div className="ih-section-head"><div><span className="ih-eyebrow">Level 3 · Intelligence</span><h2>Temporal</h2></div><span>{temporalRunning ? "Building from certified Level 2" : temporal?.certified ? "Certified · Published" : "Insufficient evidence"}</span></div>
          {temporal?.certified && temporalState ? <div className="ih-level3-grid">
            <article className="ih-level3-card"><span>Observed temporal span</span><State state="CALCULATED"/><strong>{temporalState.first_observed_date ?? "—"} → {temporalState.last_observed_date ?? "—"}</strong><small>{temporalState.observed_span_days == null ? "Insufficient evidence" : `${temporalState.observed_span_days} calendar days in the certified Level 2 boundary`}</small></article>
            <article className="ih-level3-card"><span>Transactions in boundary</span><State state="CALCULATED"/><strong>{temporalState.canonical_posted_transaction_count == null ? "—" : String(temporalState.canonical_posted_transaction_count)}</strong><small>Certified posted transaction count consumed from Level 2</small></article>
            <article className="ih-level3-card"><span>Temporal relationship</span><State state="CALCULATED"/><strong>Transaction → observed date range</strong><small>Calculated temporal structure derived from the certified transactions domain</small></article>
            <article className="ih-level3-card"><span>Granularity boundary</span><State state="INSUFFICIENT_EVIDENCE"/><strong>{temporalCoverage.transaction_level_sequence_supported ? "Transaction sequence supported" : "Sequence not promoted"}</strong><small>{temporalCoverage.limitation ?? "No unsupported temporal detail was inferred."}</small></article>
          </div> : <div className="ih-empty">Level 3 Temporal is not published because its certified Level 2 parent is not available.</div>}
        </section>

        <section className="ih-section"><div className="ih-section-head"><div><span className="ih-eyebrow">Connected state</span><h2>The financial picture</h2></div><span>{domains.length} domains</span></div><div className="ih-domain-strip">{domains.map(d => <button key={d.domain_key} onClick={() => setActive(d.domain_key)}><span>{names[d.domain_key] ?? pretty(d.domain_key)}</span><State state={d.evidence_state}/><b>{(d.derived_fields ?? []).length + (d.domain_intelligence ?? []).length}</b><small>intelligence elements</small></button>)}</div></section>
        <section className="ih-section"><div className="ih-section-head"><div><span className="ih-eyebrow">Combinations</span><h2>Where your financial state connects</h2></div><span>{connections.length} relationships</span></div><div className="ih-connections">{connections.length ? connections.map(c => <article key={c.key}><div className="ih-connection-nodes">{c.domains.map(d => <span key={d}>{names[d] ?? pretty(d)}</span>)}</div><h3>{c.name}</h3><p>{Object.entries(c.value).filter(([k]) => k !== "evidence_boundary").map(([k,v]) => <span key={k}><b>{pretty(k)}</b>{money(v)}</span>)}</p><State state={c.state}/></article>) : <div className="ih-empty">No cross-domain relationship is supported by the certified evidence.</div>}</div></section>
        <section className="ih-section"><div className="ih-section-head"><div><span className="ih-eyebrow">Relational view</span><h2>Follow the financial state</h2></div><span>{data.materialized?.nodes ?? 0} nodes · {data.materialized?.edges ?? 0} relationships</span></div><div className="ih-graph"><div className="ih-graph-center">IRIS<span>financial life</span></div>{domains.map((d, i) => <button key={d.domain_key} style={{ ["--i" as any]: i }} onClick={() => setActive(d.domain_key)}>{names[d.domain_key] ?? pretty(d.domain_key)}</button>)}</div></section>
      </> : <>
        <div className="ih-domain-hero"><span className="ih-eyebrow">Financial life</span><h1>{names[selected?.domain_key ?? active] ?? pretty(active)}</h1><p>{selected?.limitations?.[0] ?? "IRIS is organizing the evidence and relationships available for this part of your financial life."}</p><State state={selected?.evidence_state}/></div>
        <section className="ih-section"><div className="ih-section-head"><div><span className="ih-eyebrow">Derived state</span><h2>What IRIS can establish</h2></div></div><div className="ih-fields">{(selected?.derived_fields ?? []).map(f => <FieldValue key={f.field_key} field={f}/>)}</div></section>
        {active === "transactions" ? <section className="ih-section"><div className="ih-section-head"><div><span className="ih-eyebrow">Observed records</span><h2>Underlying transactions</h2></div><span>{(selected?.canonical_fields ?? []).length} observed records</span></div><div className="ih-transactions">{(selected?.canonical_fields ?? []).map(f => <TransactionRecord key={f.field_key} field={f}/>)}</div></section> : <section className="ih-section"><div className="ih-section-head"><div><span className="ih-eyebrow">Observed records</span><h2>Underlying domain content</h2></div></div><div className="ih-fields">{(selected?.canonical_fields ?? []).map(f => <FieldValue key={f.field_key} field={f}/>)}</div></section>}
        <section className="ih-section"><div className="ih-section-head"><div><span className="ih-eyebrow">Relationships</span><h2>Connected to</h2></div><span>{(selected?.relationships ?? []).length} observed relationships</span></div><div className="ih-related">{(selected?.relationships ?? []).length ? selected?.relationships?.map((r, i) => <article key={`${r.account_id ?? r.item_id ?? i}-${i}`}><div><b>{relationshipLabel(r)}</b><small>{pretty(r.relation_type ?? "relationship")}</small></div><div className="ih-related-right">{r.domain_keys?.map(d => <span key={d}>{names[d] ?? pretty(d)}</span>)}<State state={r.evidence_state}/></div></article>) : <div className="ih-empty">No additional relationship is supported by the certified evidence.</div>}</div></section>
        <section className="ih-section"><div className="ih-section-head"><div><span className="ih-eyebrow">Cross-domain intelligence</span><h2>What this connects to</h2></div></div><div className="ih-connections">{connections.filter(c => c.domains.includes(active)).map(c => <article key={c.key}><div className="ih-connection-nodes">{c.domains.map(d => <span key={d}>{names[d] ?? pretty(d)}</span>)}</div><h3>{c.name}</h3><p>{Object.entries(c.value).filter(([k]) => k !== "evidence_boundary").map(([k,v]) => <span key={k}><b>{pretty(k)}</b>{money(v)}</span>)}</p><State state={c.state}/></article>)}</div></section>
      </>}
      <footer className="ih-footer">Current state · {data.evidence_boundary ? new Date(data.evidence_boundary).toLocaleString("en-US") : "date not observed"}</footer>
      </section></div>
  </main>;
}
