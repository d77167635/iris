import { useEffect, useState } from "react";
import { api, IrisApiError } from "../api/backend";
import "./IrisRawPlaidSupabaseSurface.css";

type Governance = {
  level: number;
  intelligence_name: string;
  certified: boolean;
  run_id: string;
  execution_id: string;
  certification_hash: string;
  certified_at?: string;
  evidence_state?: string;
  publication_status?: string;
  hierarchy_published_at?: string;
  artifact_type?: string;
  role?: string;
  source_of_truth?: string;
  evidence_boundary?: string;
  evidence_manifest_hash?: string;
  evidence_count?: number;
  source_counts?: Record<string, number>;
  financial_content_output?: boolean;
  financial_values_created?: boolean;
  provider_observations_created?: boolean;
  money_movement_executed?: boolean;
  downstream_levels_enabled?: boolean;
  next_content_level?: number;
};

function label(value: string) { return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()); }
function display(value: unknown) { return value === null || value === undefined || value === "" ? "Not observed" : String(value); }
function count(value: unknown) { return typeof value === "number" ? value.toLocaleString("en-US") : display(value); }
function shortHash(value?: string) { return value ? `${value.slice(0, 18)}…${value.slice(-12)}` : "Not observed"; }

const sourceLabels: Record<string, string> = {
  plaid_items: "Plaid Items",
  plaid_accounts: "Plaid Accounts",
  plaid_raw_balances: "Plaid Raw Balances",
  plaid_raw_liabilities: "Plaid Raw Liabilities",
  plaid_raw_transactions: "Plaid Raw Transactions",
  plaid_raw_product_observations: "Plaid Raw Product Observations",
  plaid_provider_response_receipts: "Plaid Provider Response Receipts",
};

export function IrisLevel1HierarchySurface() {
  const [data, setData] = useState<Governance | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        let value: Governance;
        try { value = await api.get("/iris/level1"); }
        catch (err) {
          if (!(err instanceof IrisApiError) || err.status !== 409) throw err;
          await api.post("/iris/level1/run");
          value = await api.get("/iris/level1");
        }
        if (active) setData(value);
      } catch (err: any) {
        if (active) setError(err?.message ?? "Level 1 is not available");
      }
    };
    load();
    return () => { active = false; };
  }, []);

  if (error) return (
    <main className="l1-shell">
      <div className="l1-state">
        <span className="l1-eyebrow">LEVEL 1 · GOVERNANCE</span>
        <h1>IRIS Master Governor</h1>
        <div className="l1-error-badge">CERTIFICATION UNAVAILABLE</div>
        <p>Level 1 is not certified for publication.</p>
        <code>{error}</code>
      </div>
    </main>
  );

  if (!data) return (
    <main className="l1-shell">
      <div className="l1-state">
        <span className="l1-eyebrow">LEVEL 1 · GOVERNANCE</span>
        <h1>IRIS Master Governor</h1>
        <div className="l1-loading-mark" aria-hidden="true" />
        <p>Loading governed financial-life state…</p>
      </div>
    </main>
  );

  const sourceCounts = Object.entries(data.source_counts ?? {});
  const certified = data.certified === true;

  return (
    <main className="l1-shell">
      <div className="l1-page">
        <header className="l1-hero">
          <div className="l1-hero-copy">
            <span className="l1-eyebrow">LEVEL {data.level} · MASTER GOVERNOR</span>
            <h1>IRIS Master Governor</h1>
            <p>Governed evidence boundary, execution identity, validation, certification and reverse lineage.</p>
          </div>
          <div className={`l1-cert-badge ${certified ? "certified" : "pending"}`}>
            <span className="l1-cert-dot" />
            <div><strong>{certified ? "CERTIFIED" : "NOT CERTIFIED"}</strong><small>Governance only</small></div>
          </div>
        </header>

        <section className="l1-source-strip" aria-label="Source of truth">
          <span><b>Source of truth</b> Supabase</span><i />
          <span><b>Evidence</b> {label(data.evidence_state ?? "unknown")}</span><i />
          <span><b>Publication</b> {display(data.publication_status)}</span>
        </section>

        <section className="l1-section l1-cert-section">
          <div className="l1-section-heading">
            <div><span>01 · CERTIFICATION</span><h2>Governance gate established</h2></div>
            <span className="l1-section-state">LEVEL 1</span>
          </div>
          <p className="l1-section-description">Level 1 establishes the governed evidence boundary. It does not publish financial-life content or materialize financial-domain state.</p>
          <div className="l1-metric-grid">
            <article className="l1-metric featured"><span>Evidence state</span><strong>{display(data.evidence_state)}</strong><small>Authoritative evidence observed</small></article>
            <article className="l1-metric"><span>Evidence records</span><strong>{count(data.evidence_count)}</strong><small>Governed source scope</small></article>
            <article className="l1-metric"><span>Publication</span><strong>{display(data.publication_status)}</strong><small>No Level 1 financial content to publish</small></article>
            <article className="l1-metric"><span>Next content level</span><strong>{count(data.next_content_level)}</strong><small>Financial content begins here</small></article>
            <article className="l1-metric"><span>Financial content output</span><strong>{data.financial_content_output ? "YES" : "NO"}</strong><small>Governance boundary only</small></article>
            <article className="l1-metric"><span>Downstream levels enabled</span><strong>{data.downstream_levels_enabled ? "YES" : "NO"}</strong><small>Remains gated until Level 1 completes</small></article>
          </div>
        </section>

        <section className="l1-section">
          <div className="l1-section-heading">
            <div><span>02 · SOURCE BOUNDARY</span><h2>Governed evidence scope</h2></div>
            <span className="l1-record-total">{count(data.evidence_count)} records</span>
          </div>
          <p className="l1-section-description">These counts establish the authoritative source-record boundary. The records themselves are not rendered as Level 1 financial content.</p>
          <div className="l1-source-grid">
            {sourceCounts.map(([name, value]) => (
              <article className="l1-source-card" key={name}>
                <div><span>{sourceLabels[name] ?? label(name)}</span><small>Supabase source scope</small></div>
                <strong>{count(value)}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="l1-section">
          <div className="l1-section-heading">
            <div><span>03 · LINEAGE IDENTITY</span><h2>Trace every certified execution</h2></div>
            <span className="l1-section-state">AUDITABLE</span>
          </div>
          <div className="l1-lineage-grid">
            <article className="l1-lineage-card wide"><span>Evidence boundary</span><strong>{display(data.evidence_boundary)}</strong></article>
            <article className="l1-lineage-card"><span>Evidence manifest hash</span><strong title={data.evidence_manifest_hash}>{shortHash(data.evidence_manifest_hash)}</strong><code>{display(data.evidence_manifest_hash)}</code></article>
            <article className="l1-lineage-card"><span>Certification hash</span><strong title={data.certification_hash}>{shortHash(data.certification_hash)}</strong><code>{display(data.certification_hash)}</code></article>
            <article className="l1-lineage-card"><span>Run ID</span><strong title={data.run_id}>{shortHash(data.run_id)}</strong><code>{display(data.run_id)}</code></article>
            <article className="l1-lineage-card"><span>Execution ID</span><strong title={data.execution_id}>{shortHash(data.execution_id)}</strong><code>{display(data.execution_id)}</code></article>
            <article className="l1-lineage-card wide"><span>Certified at</span><strong>{display(data.certified_at)}</strong></article>
          </div>
        </section>

        <section className="l1-boundary-banner">
          <div className="l1-boundary-icon">01</div>
          <div><span>HIERARCHY BOUNDARY</span><strong>Level 2 is where financial content begins.</strong><p>Transactions, Balance, Identity, Assets, Liabilities, Investments and applicable evidence-backed domain state are materialized only after this Level 1 governance gate.</p></div>
        </section>
      </div>
    </main>
  );
}
