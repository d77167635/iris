import { useEffect, useState } from "react";
import { api, IrisApiError } from "../api/backend";

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
      } catch (err: any) { if (active) setError(err?.message ?? "Level 1 is not available"); }
    };
    load();
    return () => { active = false; };
  }, []);

  const shell = { minHeight: "100dvh", boxSizing: "border-box" as const, background: "#050609", color: "#f4f7fb", padding: "28px 24px", fontFamily: "system-ui, sans-serif" };
  if (error) return <main style={shell}><div style={{ maxWidth: 1000, margin: "0 auto" }}><div style={{ fontSize: 12, letterSpacing: 1.5, opacity: .65 }}>LEVEL 1</div><h1 style={{ margin: "6px 0 10px" }}>IRIS Master Governor</h1><p style={{ opacity: .75 }}>Level 1 is not certified for publication.</p><p style={{ opacity: .55, fontSize: 13 }}>{error}</p></div></main>;
  if (!data) return <main style={shell}><div style={{ maxWidth: 1000, margin: "0 auto" }}><div style={{ fontSize: 12, letterSpacing: 1.5, opacity: .65 }}>LEVEL 1</div><h1>IRIS Master Governor</h1><p style={{ opacity: .55 }}>Loading governance and lineage state…</p></div></main>;

  const sourceCounts = Object.entries(data.source_counts ?? {});
  return <main style={shell}><div style={{ maxWidth: 1000, margin: "0 auto" }}>
    <header style={{ borderBottom: "1px solid #252932", paddingBottom: 20 }}>
      <div style={{ fontSize: 12, letterSpacing: 1.5, opacity: .65 }}>LEVEL {data.level}</div>
      <h1 style={{ margin: "6px 0 10px", fontSize: 32 }}>IRIS Master Governor</h1>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, opacity: .72 }}><span>Certified</span><span>•</span><span>Governance only</span><span>•</span><span>Source of truth: Supabase</span></div>
    </header>

    <section style={{ marginTop: 28, border: "1px solid #252932", borderRadius: 12, padding: 20, background: "#0a0c11" }}>
      <h2 style={{ margin: 0, fontSize: 20 }}>Level 1 certification</h2>
      <p style={{ opacity: .72, lineHeight: 1.6 }}>Level 1 establishes the governed evidence boundary, execution identity, validation, certification and reverse lineage. It does not publish financial-life content.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 16 }}>
        {[['Evidence state', data.evidence_state], ['Evidence records', data.evidence_count], ['Publication', data.publication_status], ['Next content level', data.next_content_level], ['Financial content output', data.financial_content_output ? 'Yes' : 'No'], ['Downstream levels enabled', data.downstream_levels_enabled ? 'Yes' : 'No']].map(([name, value]) => <div key={String(name)} style={{ borderTop: "1px solid #1b1e25", paddingTop: 10 }}><div style={{ fontSize: 11, opacity: .55 }}>{name}</div><div style={{ marginTop: 5, fontSize: 14 }}>{display(value)}</div></div>)}
      </div>
    </section>

    <section style={{ marginTop: 20, border: "1px solid #252932", borderRadius: 12, padding: 20, background: "#0a0c11" }}>
      <h2 style={{ margin: 0, fontSize: 20 }}>Governed source boundary</h2>
      <p style={{ opacity: .68, fontSize: 13 }}>These are source-record counts used to establish Level 1 evidence scope. The records themselves are not rendered as Level 1 financial content.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10, marginTop: 14 }}>
        {sourceCounts.map(([name, count]) => <div key={name} style={{ display: "flex", justifyContent: "space-between", gap: 12, borderTop: "1px solid #1b1e25", paddingTop: 9 }}><span style={{ fontSize: 12, opacity: .68 }}>{label(name)}</span><span style={{ fontSize: 13 }}>{count}</span></div>)}
      </div>
    </section>

    <section style={{ marginTop: 20, border: "1px solid #252932", borderRadius: 12, padding: 20, background: "#0a0c11" }}>
      <h2 style={{ margin: 0, fontSize: 20 }}>Lineage and certification identity</h2>
      <div style={{ display: "grid", gap: 10, marginTop: 14 }}>
        {[['Evidence boundary', data.evidence_boundary], ['Evidence manifest hash', data.evidence_manifest_hash], ['Certification hash', data.certification_hash], ['Run ID', data.run_id], ['Execution ID', data.execution_id], ['Certified at', data.certified_at]].map(([name, value]) => <div key={String(name)} style={{ display: "grid", gridTemplateColumns: "190px 1fr", gap: 12, borderTop: "1px solid #1b1e25", paddingTop: 9 }}><span style={{ fontSize: 11, opacity: .55 }}>{name}</span><span style={{ fontSize: 12, overflowWrap: "anywhere" }}>{display(value)}</span></div>)}
      </div>
    </section>

    <section style={{ marginTop: 20, padding: 16, borderRadius: 12, background: "#0a0c11", border: "1px solid #252932", opacity: .9 }}>
      <strong>Level 2 is where financial content begins.</strong><div style={{ marginTop: 6, fontSize: 13, opacity: .7 }}>Transactions, Balance, Identity, Assets, Liabilities, Investments and the applicable evidence-backed domain state are materialized only after this Level 1 governance gate.</div>
    </section>
  </div></main>;
}
