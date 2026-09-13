import { useEffect, useMemo, useState } from "react";
import { api } from "../api/backend";
import "./IrisHierarchyExperience.css";

type Field = { field_key: string; label: string; value: unknown; value_type?: string; evidence_state?: string; derivation_operator?: string };
type Relationship = { relation_type?: string; account_id?: string; item_id?: string; domain_keys?: string[]; evidence_state?: string; [key: string]: unknown };
type Domain = { domain_key: string; evidence_state: string; canonical_fields?: Field[]; derived_fields?: Field[]; relationships?: Relationship[]; domain_intelligence?: any[]; limitations?: string[] };
type Cross = { key: string; name: string; domains: string[]; state: string; value: Record<string, unknown> };
type Level2 = { certified?: boolean; level: number; evidence_boundary?: string; domains?: Domain[]; cross_domain?: Cross[]; materialized?: { nodes: number; edges: number; compositions: number } };
type Level3Capability = { capability_id?: string; name?: string | null; evidence_state?: string; recursive_depth?: number | null; upstream_count?: number };
type Level3 = { certified?: boolean; status?: string; publication_status?: string; run_id?: string; execution_id?: string; evidence_boundary?: string; output_hash?: string; certification_hash?: string; capability_count?: number; capabilities?: Level3Capability[]; materialized?: { nodes?: number }; parent_level2?: { run_id?: string; execution_id?: string; output_hash?: string; certification_hash?: string } | null };

const names: Record<string, string> = { authentication: "Connections", transactions: "Transactions", balance: "Balance", identity: "Identity", assets: "Assets", liabilities: "Liabilities", investments: "Investments", statements: "Statements" };
const capabilityNames: Record<string, string> = { temporal: "Temporal", financial_life_state: "Financial Life State", relational_ontology: "Relational Ontology", analysis: "Analysis", behavioral: "Behavioral", pattern: "Pattern", relationship: "Relationship", anomaly: "Anomaly", causal: "Causal", predictive: "Predictive", scenario: "Scenario", decision: "Decision", recommendation: "Recommendation", risk: "Risk", opportunity: "Opportunity", consequence: "Consequence", outcome: "Outcome", learning: "Learning", emergent: "Emergent" };
const money = (v: unknown) => typeof v === "number" && Number.isFinite(v) ? `${v < 0 ? "−" : ""}$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : v == null ? "—" : String(v);
const pretty = (key: string) => key.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const stateLabel = (state?: string) => pretty((state ?? "INSUFFICIENT_EVIDENCE").toLowerCase());
const show = (v: unknown, type?: string) => type === "currency" ? money(v) : type === "ratio" && typeof v === "number" ? `${(v * 100).toFixed(1)}%` : v == null ? "Insufficient evidence" : typeof v === "object" ? "" : String(v);
function State({ state }: { state?: string }) { return <span className={`ih-state ${(state ?? "INSUFFICIENT_EVIDENCE").toLowerCase()}`}>{stateLabel(state)}</span>; }
function FieldValue({ field }: { field: Field }) { return <article className="ih-field"><div><span>{field.label}</span><State state={field.evidence_state}/></div><strong>{show(field.value, field.value_type)}</strong><small>{field.derivation_operator ? pretty(field.derivation_operator) : "Observed financial state"}</small></article>; }
function TransactionRecord({ field }: { field: Field }) { const value = (field.value ?? {}) as Record<string, unknown>; const amount = typeof value.amount === "number" ? value.amount : null; const date = typeof value.posted_date === "string" ? new Date(`${value.posted_date}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Date not observed"; const classification = typeof value.transaction_class === "string" ? value.transaction_class : "unknown"; return <article className="ih-transaction"><div className="ih-transaction-main"><div className="ih-merchant"><b>{field.label}</b><span>{date}</span></div><div className="ih-transaction-amount"><strong>{amount === null ? "—" : money(amount)}</strong><State state="OBSERVED"/></div></div><div className="ih-transaction-meta"><span>{pretty(classification)}</span><span>{String(value.currency ?? "USD")}</span><span>Observed</span></div></article>; }

export function IrisHierarchyExperience() {
  const [data, setData] = useState<Level2 | null>(null);
  const [level3, setLevel3] = useState<Level3 | null>(null);
  const [active, setActive] = useState("overview");
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(true);
  const [level3Running, setLevel3Running] = useState(false);

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
        let currentLevel3 = await api.getIrisLevel3();
        if (!currentLevel3?.certified) {
          setLevel3Running(true);
          currentLevel3 = await api.runIrisLevel3();
        }
        setLevel3(currentLevel3);
      } catch (level3Error) {
        console.error("Level 3 recursive intelligence unavailable", level3Error);
        setLevel3(null);
      } finally { setLevel3Running(false); }
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

  if (running) return <main className="ih-loading"><div className="ih-orb">I</div><h1>IRIS</h1><p>Assembling your connected financial life…</p></main>;
  if (error || !data) return <main className="ih-loading"><div className="ih-orb">I</div><h1>IRIS</h1><p>{error ?? "Your financial state could not be loaded."}</p><button onClick={() => void load()}>Try again</button></main>;

  return <main className="ih-app">
    <header className="ih-header"><div className="ih-brand"><div className="ih-mark">I</div><div><b>IRIS</b><span>Financial life intelligence</span></div></div><div className="ih-header-state"><span className="ih-live"/>Current state <State state="OBSERVED"/></div></header>
    <div className="ih-layout"><aside className="ih-nav"><div className="ih-nav-title">Your financial life</div><button className={active === "overview" ? "active" : ""} onClick={() => setActive("overview")}>Overview</button>{domains.map(d => <button key={d.domain_key} className={active === d.domain_key ? "active" : ""} onClick={() => setActive(d.domain_key)}>{names[d.domain_key] ?? pretty(d.domain_key)}<State state={d.evidence_state}/></button>)}</aside>
      <section className="ih-content">{active === "overview" ? <>
        <div className="ih-hero"><div><span className="ih-eyebrow">Your financial life</span><h1>See the relationships,<br/>not just the numbers.</h1><p>IRIS organizes authorized financial evidence into one living relational hierarchy. Financial state and intelligence remain in the same graph.</p></div><div className="ih-core"><div className="ih-core-ring">IRIS</div>{domains.map((d, i) => <i key={d.domain_key} style={{ ["--i" as any]: i }}/>)}</div></div>

        <section className="ih-section"><div className="ih-section-head"><div><span className="ih-eyebrow">Level 3+ · Recursive intelligence</span><h2>Intelligence graph</h2></div><span>{level3Running ? "Building from certified Level 2" : level3?.certified ? "Certified · Published" : "Insufficient evidence"}</span></div>
          {level3?.certified ? <>
            <div className="ih-level3-grid">
              <article className="ih-level3-card"><span>Recursive capabilities</span><State state="CERTIFIED"/><strong>{level3.capability_count ?? level3.capabilities?.length ?? 0}</strong><small>Registered operators resolved through governed dependency order</small></article>
              <article className="ih-level3-card"><span>Published intelligence nodes</span><State state="CERTIFIED"/><strong>{level3.materialized?.nodes ?? 0}</strong><small>Materialized only after execution, validation and certification</small></article>
              <article className="ih-level3-card"><span>Parent hierarchy</span><State state="CERTIFIED"/><strong>Level 2</strong><small>Bound to the certified published Level 2 execution</small></article>
              <article className="ih-level3-card"><span>Recursive depth</span><State state="CALCULATED"/><strong>{Math.max(0, ...(level3.capabilities ?? []).map(c => typeof c.recursive_depth === "number" ? c.recursive_depth : 0))}</strong><small>Observed from persisted upstream ancestry; no semantic depth ceiling</small></article>
            </div>
            <div className="ih-capability-grid">{(level3.capabilities ?? []).map((cap, index) => <article className="ih-capability-card" key={`${cap.capability_id ?? index}-${index}`}><div><span>{capabilityNames[cap.capability_id ?? ""] ?? pretty(cap.capability_id ?? "Capability")}</span><State state={cap.evidence_state}/></div><strong>{cap.recursive_depth == null ? "Derived intelligence" : `Depth ${cap.recursive_depth}`}</strong><small>{cap.upstream_count ?? 0} upstream relationship{(cap.upstream_count ?? 0) === 1 ? "" : "s"}</small></article>)}</div>
            {level3.parent_level2 && <div className="ih-lineage-note"><b>Governed parent</b><span>Level 2 run {level3.parent_level2.run_id ?? "—"}</span><span>Execution {level3.parent_level2.execution_id ?? "—"}</span><span>Output hash {level3.parent_level2.output_hash ?? "—"}</span></div>}
          </> : <div className="ih-empty">Level 3+ is not published because its certified Level 2 parent and recursive execution gates are not available.</div>}
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
