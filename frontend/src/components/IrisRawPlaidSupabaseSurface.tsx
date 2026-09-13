import { useEffect, useState } from "react";
import { api } from "../api/backend";

type Level1 = { level: number; intelligence_name: string; certified: boolean; run_id: string; execution_id: string; certification_hash: string; content: Record<string, unknown[]> };
function pretty(value: unknown) { return JSON.stringify(value, null, 2); }
export function IrisRawPlaidSupabaseSurface() {
  const [data, setData] = useState<Level1 | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { let active = true; api.get("/iris/level1").then(value => { if (active) setData(value as Level1); }).catch(err => { if (active) setError(err?.message ?? "Level 1 is not available"); }); return () => { active = false; }; }, []);
  if (error) return <main style={{ minHeight: "100dvh", background: "#050609", color: "#f4f7fb", padding: 24, fontFamily: "system-ui" }}><h1>IRIS Master Intelligence</h1><p>Level 1 is not certified for publication.</p><p>{error}</p></main>;
  if (!data) return <main style={{ minHeight: "100dvh", background: "#050609" }} />;
  return <main style={{ minHeight: "100dvh", margin: 0, padding: 24, boxSizing: "border-box", background: "#050609", color: "#f4f7fb", fontFamily: "system-ui", overflow: "auto" }}><header><div style={{ fontSize: 12, opacity: .7 }}>LEVEL {data.level}</div><h1 style={{ margin: "4px 0 8px" }}>{data.intelligence_name}</h1><div style={{ fontSize: 12 }}>CERTIFIED · {data.run_id}</div></header>{Object.entries(data.content).map(([domain, records]) => <section key={domain} style={{ marginTop: 24 }}><h2 style={{ textTransform: "capitalize" }}>{domain.replace(/_/g, " ")}</h2>{records.map((record, index) => <article key={`${domain}-${index}`} style={{ border: "1px solid #252932", borderRadius: 10, padding: 14, margin: "10px 0" }}><pre style={{ margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere", fontSize: 12, lineHeight: 1.5 }}>{pretty(record)}</pre></article>)}</section>)}</main>;
}
