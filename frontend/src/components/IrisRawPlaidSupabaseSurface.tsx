import { useEffect, useState } from "react";
import { api, IrisApiError } from "../api/backend";

type Level1Field = { field_name: string; source_field: string; value: unknown };
type Level1Record = { hierarchy_level: number; node_type: string; intelligence_key: string; intelligence_name: string; domain_key: string; evidence_state: string; fields: Level1Field[]; source?: { table?: string; record_id?: string } };
type Level1 = { level: number; intelligence_name: string; certified: boolean; run_id: string; execution_id: string; certification_hash: string; content: Record<string, Level1Record[]>; evidence_state?: string; certified_at?: string };

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Not observed";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return "Observed";
  return String(value);
}
function title(value: string) { return value.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }

export function IrisLevel1HierarchySurface() {
  const [data, setData] = useState<Level1 | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        let value: Level1;
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
  if (error) return <main style={shell}><div style={{ maxWidth: 1100, margin: "0 auto" }}><div style={{ fontSize: 12, letterSpacing: 1.5, opacity: .65 }}>LEVEL 1</div><h1 style={{ margin: "6px 0 10px" }}>IRIS Master Intelligence</h1><p style={{ opacity: .75 }}>Level 1 is not certified for publication.</p><p style={{ opacity: .55, fontSize: 13 }}>{error}</p></div></main>;
  if (!data) return <main style={shell}><div style={{ maxWidth: 1100, margin: "0 auto" }}><div style={{ fontSize: 12, letterSpacing: 1.5, opacity: .65 }}>LEVEL 1</div><h1>IRIS Master Intelligence</h1><p style={{ opacity: .55 }}>Loading governed financial-life state…</p></div></main>;

  return <main style={shell}><div style={{ maxWidth: 1100, margin: "0 auto" }}>
    <header style={{ borderBottom: "1px solid #252932", paddingBottom: 20 }}>
      <div style={{ fontSize: 12, letterSpacing: 1.5, opacity: .65 }}>LEVEL {data.level}</div>
      <h1 style={{ margin: "6px 0 10px", fontSize: 32 }}>{data.intelligence_name}</h1>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", fontSize: 12, opacity: .72 }}><span>Certified</span><span>•</span><span>Observed evidence</span><span>•</span><span>Source of truth: Supabase</span></div>
    </header>
    {Object.entries(data.content).map(([domain, records]) => <section key={domain} style={{ marginTop: 28 }}>
      <h2 style={{ fontSize: 20, margin: 0 }}>{title(domain)}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginTop: 12 }}>
        {records.map((record, index) => <article key={`${record.intelligence_key}-${index}`} style={{ border: "1px solid #252932", borderRadius: 12, padding: 16, background: "#0a0c11" }}>
          <div style={{ fontSize: 14, fontWeight: 650 }}>{record.intelligence_name}</div>
          <div style={{ fontSize: 11, opacity: .5, marginTop: 4 }}>Observed through Level 1</div>
          <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
            {record.fields.filter(field => field.source_field !== "user_id").map(field => <div key={field.source_field} style={{ display: "grid", gridTemplateColumns: "minmax(120px, .8fr) minmax(120px, 1.2fr)", gap: 12, borderTop: "1px solid #1b1e25", paddingTop: 9 }}><span style={{ fontSize: 12, opacity: .62 }}>{field.field_name}</span><span style={{ fontSize: 13, overflowWrap: "anywhere" }}>{displayValue(field.value)}</span></div>)}
          </div>
        </article>)}
      </div>
    </section>)}
  </div></main>;
}
