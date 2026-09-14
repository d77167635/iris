import { useEffect, useMemo, useState } from "react";
import { api } from "../api/backend";

type RelatedFact = {
  domain_key?: string;
  field_key?: string;
  label?: string;
  value?: unknown;
  value_type?: string | null;
  evidence_state?: string;
  derivation_operator?: string | null;
  source_inputs?: string[];
  source_field_paths?: string[];
  output_hash?: string | null;
  evidence_boundary?: string | null;
};
type RelatedContent = { state?: string; domains?: string[]; facts?: RelatedFact[]; cross_domain?: Array<{ key?: string; name?: string; state?: string; value?: Record<string, unknown>; domains?: string[] }>; evidence_boundary?: string | null; source?: string };
type Node = { id: string; capability_id: string; intelligence_name?: string | null; intelligence_key?: string | null; value?: unknown; evidence_state?: string; confidence?: number | null; recursive_depth?: number | null; upstream_node_ids?: string[]; related_content?: RelatedContent };
type Edge = { id: string; from_node_id: string; to_node_id: string; relation_type?: string; evidence_state?: string; explanation?: string | null };
type Level3 = { certified?: boolean; published?: boolean; status?: string; publication_status?: string; capability_count?: number; materialized?: { nodes?: number; edges?: number; compositions?: number }; nodes?: Node[]; edges?: Edge[]; parent_level2?: { run_id?: string; execution_id?: string; output_hash?: string } | null; related_content_contract?: string };

const money = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? `${value < 0 ? "−" : ""}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : typeof value === "number" ? String(value) : value == null ? "Insufficient evidence" : String(value);
const pretty = (value: string) => value.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
const capabilityName = (value: string) => pretty(value);
const numeric = (value: unknown, valueType?: string | null) => valueType === "currency" ? money(value) : valueType === "ratio" && typeof value === "number" ? `${(value * 100).toFixed(1)}%` : typeof value === "number" ? value.toLocaleString("en-US", { maximumFractionDigits: 4 }) : typeof value === "object" ? JSON.stringify(value) : String(value ?? "Insufficient evidence");

function Badge({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return <span style={{ display: "inline-flex", alignItems: "center", borderRadius: 999, padding: "5px 9px", fontSize: 11, fontWeight: 700, letterSpacing: ".04em", textTransform: "uppercase", background: muted ? "#f1f1ef" : "#e9f6ef", color: muted ? "#666" : "#176b3a" }}>{children}</span>;
}

export function IrisLevel3PublishedGraph() {
  const [data, setData] = useState<Level3 | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    api.getIrisLevel3().then(result => { if (alive) setData(result as Level3); }).catch(err => { if (alive) setError(err instanceof Error ? err.message : "Level 3 could not be read."); });
    return () => { alive = false; };
  }, []);

  const nodes = data?.nodes ?? [];
  const edges = data?.edges ?? [];
  const selected = useMemo(() => nodes.find(node => node.id === selectedId) ?? nodes[0] ?? null, [nodes, selectedId]);
  const upstream = useMemo(() => selected ? new Set(selected.upstream_node_ids ?? []) : new Set<string>(), [selected]);
  const selectedEdges = useMemo(() => selected ? edges.filter(edge => edge.to_node_id === selected.id || edge.from_node_id === selected.id || upstream.has(edge.from_node_id) || upstream.has(edge.to_node_id)) : [], [edges, selected, upstream]);

  if (error) return <section style={{ margin: "32px 0", padding: 24, borderRadius: 24, background: "#fff", border: "1px solid #e5e5e1" }}><b>Level 3 intelligence</b><p>{error}</p></section>;
  if (!data) return <section style={{ margin: "32px 0", padding: 24, borderRadius: 24, background: "#fff", border: "1px solid #e5e5e1" }}><b>Level 3 intelligence</b><p>Loading published intelligence graph…</p></section>;

  const published = Boolean(data.certified && data.published);
  return <section style={{ margin: "40px 0", padding: 28, borderRadius: 28, background: "#fbfbf8", border: "1px solid #e1e1dc", boxShadow: "0 12px 35px rgba(0,0,0,.04)" }}>
    <header style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
      <div><div style={{ fontSize: 11, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "#777" }}>Level 3 · Recursive intelligence</div><h2 style={{ margin: "8px 0 6px", fontSize: 30 }}>Intelligence and its financial content</h2><p style={{ margin: 0, color: "#666", maxWidth: 760 }}>Every node is persisted intelligence. Related content below is the actual certified Level 2 financial state that supports the recursive hierarchy. No replacement value is generated for insufficient evidence.</p></div>
      <Badge muted={!published}>{published ? "Certified · Published" : "Not published"}</Badge>
    </header>

    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginTop: 22 }}>
      <div style={{ background: "#fff", border: "1px solid #e6e6e1", borderRadius: 18, padding: 16 }}><small>Intelligence nodes</small><strong style={{ display: "block", fontSize: 26, marginTop: 5 }}>{data.materialized?.nodes ?? nodes.length}</strong></div>
      <div style={{ background: "#fff", border: "1px solid #e6e6e1", borderRadius: 18, padding: 16 }}><small>Relationships</small><strong style={{ display: "block", fontSize: 26, marginTop: 5 }}>{data.materialized?.edges ?? edges.length}</strong></div>
      <div style={{ background: "#fff", border: "1px solid #e6e6e1", borderRadius: 18, padding: 16 }}><small>Compositions</small><strong style={{ display: "block", fontSize: 26, marginTop: 5 }}>{data.materialized?.compositions ?? 0}</strong></div>
      <div style={{ background: "#fff", border: "1px solid #e6e6e1", borderRadius: 18, padding: 16 }}><small>Related-content contract</small><strong style={{ display: "block", fontSize: 13, marginTop: 8 }}>{data.related_content_contract ?? "—"}</strong></div>
    </div>

    {!published ? <div style={{ marginTop: 18, padding: 18, borderRadius: 16, background: "#f1f1ef", color: "#666" }}>The published graph is not currently available. The screen will not substitute financial or intelligence values.</div> : <>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(250px,.8fr) minmax(0,1.8fr)", gap: 18, marginTop: 22 }}>
        <div style={{ background: "#fff", border: "1px solid #e6e6e1", borderRadius: 20, padding: 12, maxHeight: 640, overflow: "auto" }}>
          <div style={{ padding: "8px 10px 12px", fontSize: 12, color: "#777", fontWeight: 700 }}>Persisted intelligence graph</div>
          {nodes.map(node => <button key={node.id} onClick={() => setSelectedId(node.id)} style={{ width: "100%", textAlign: "left", border: 0, borderRadius: 14, padding: "13px 12px", marginBottom: 5, cursor: "pointer", background: selected?.id === node.id ? "#f0f0eb" : "transparent" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}><strong>{capabilityName(node.capability_id)}</strong><span style={{ fontSize: 11, color: "#777" }}>D{node.recursive_depth ?? "—"}</span></div><div style={{ fontSize: 12, color: "#777", marginTop: 4 }}>{node.intelligence_name ?? node.intelligence_key ?? "Persisted intelligence"}</div><div style={{ fontSize: 11, marginTop: 6, color: node.evidence_state === "INSUFFICIENT_EVIDENCE" ? "#8a5b00" : "#176b3a" }}>{pretty(node.evidence_state ?? "INSUFFICIENT_EVIDENCE")}</div></button>)}
        </div>

        <div style={{ minWidth: 0 }}>
          {selected ? <article style={{ background: "#fff", border: "1px solid #e6e6e1", borderRadius: 20, padding: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}><div><div style={{ fontSize: 12, color: "#777" }}>Depth {selected.recursive_depth ?? "—"} · {selected.upstream_node_ids?.length ?? 0} upstream relationships</div><h3 style={{ margin: "5px 0" }}>{selected.intelligence_name ?? capabilityName(selected.capability_id)}</h3><div style={{ color: "#777", fontSize: 13 }}>{selected.intelligence_key ?? selected.capability_id}</div></div><Badge muted={selected.evidence_state === "INSUFFICIENT_EVIDENCE"}>{pretty(selected.evidence_state ?? "INSUFFICIENT_EVIDENCE")}</Badge></div>

            <div style={{ marginTop: 22 }}><div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#777", marginBottom: 10 }}>Related financial content · actual certified Level 2 numbers</div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 10 }}>
              {(selected.related_content?.facts ?? []).filter(f => ["currency", "ratio", "integer", "number"].includes(f.value_type ?? "") || typeof f.value === "number").map((fact, index) => <div key={`${fact.field_key}-${index}`} style={{ border: "1px solid #e9e9e4", borderRadius: 15, padding: 14 }}><div style={{ fontSize: 11, color: "#777" }}>{pretty(fact.domain_key ?? "source")} · {fact.label ?? fact.field_key}</div><strong style={{ display: "block", fontSize: 21, marginTop: 5 }}>{numeric(fact.value, fact.value_type)}</strong><div style={{ fontSize: 10, color: "#777", marginTop: 6 }}>{fact.evidence_state ?? "INSUFFICIENT_EVIDENCE"} · {fact.derivation_operator ?? "observed"}</div></div>)}
            </div></div>

            <div style={{ marginTop: 20, borderTop: "1px solid #ecece7", paddingTop: 18 }}><div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#777", marginBottom: 10 }}>Supporting domains</div><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{(selected.related_content?.domains ?? []).map(domain => <span key={domain} style={{ border: "1px solid #deded9", borderRadius: 999, padding: "6px 10px", fontSize: 12 }}>{pretty(domain)}</span>)}</div></div>

            {selected.related_content?.cross_domain?.length ? <div style={{ marginTop: 20, borderTop: "1px solid #ecece7", paddingTop: 18 }}><div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#777", marginBottom: 10 }}>Supporting cross-domain intelligence</div>{selected.related_content.cross_domain.map((item, index) => <div key={`${item.key}-${index}`} style={{ padding: 12, borderRadius: 13, background: "#f7f7f4", marginBottom: 8 }}><strong>{item.name ?? item.key}</strong><div style={{ display: "flex", gap: 15, flexWrap: "wrap", marginTop: 6, fontSize: 13 }}>{Object.entries(item.value ?? {}).map(([key, value]) => <span key={key}><b>{pretty(key)}:</b> {money(value)}</span>)}</div></div>)}</div> : null}

            <div style={{ marginTop: 20, borderTop: "1px solid #ecece7", paddingTop: 18, fontSize: 12, color: "#777" }}><div>Evidence boundary: {selected.related_content?.evidence_boundary ?? selected.evidence_boundary ?? "—"}</div><div>Source: certified published Level 2 hierarchy · Supabase source lineage preserved</div></div>
          </article> : null}
        </div>
      </div>

      <div style={{ marginTop: 18, background: "#fff", border: "1px solid #e6e6e1", borderRadius: 20, padding: 20 }}><div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".08em", textTransform: "uppercase", color: "#777", marginBottom: 12 }}>Persisted relationships</div><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 8 }}>{selectedEdges.map(edge => { const from = nodes.find(n => n.id === edge.from_node_id); const to = nodes.find(n => n.id === edge.to_node_id); return <button key={edge.id} onClick={() => setSelectedId(to?.id ?? from?.id ?? null)} style={{ textAlign: "left", border: "1px solid #e9e9e4", background: "#fafaf7", borderRadius: 13, padding: 12, cursor: "pointer" }}><b>{from?.intelligence_name ?? from?.capability_id ?? "Node"}</b><span style={{ display: "block", color: "#777", margin: "4px 0" }}>↓ {pretty(edge.relation_type ?? "relationship")} ↓</span><b>{to?.intelligence_name ?? to?.capability_id ?? "Node"}</b></button>; })}</div></div>
    </>}

    {data.parent_level2 ? <footer style={{ marginTop: 18, fontSize: 11, color: "#777" }}>Certified Level 2 parent: {data.parent_level2.run_id ?? "—"} · execution {data.parent_level2.execution_id ?? "—"} · output hash {data.parent_level2.output_hash ?? "—"}</footer> : null}
  </section>;
}