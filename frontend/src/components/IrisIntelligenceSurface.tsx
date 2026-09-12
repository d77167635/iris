import { useEffect, useState } from "react";
import { api, IrisApiError } from "../api/backend";
import "./IrisIntelligenceSurface.css";

type Props = { page?: string; go?: (page: string) => void };
type IntelligenceState = { certified?: boolean; certification_hash?: string | null; certification_gate?: { eligible?: boolean; status?: string } | null; publication_boundary?: { status?: string; reason?: string; derived_intelligence_publication?: boolean } | null; run_id?: string | null; execution_id?: string | null; run_status?: string | null; narrative?: string | null; provider_lineage?: unknown; uncertainty?: unknown; intelligence_atlas?: { definitions?: unknown[] } | null; higher_order_synthesis?: { findings?: unknown[] } | null; [key: string]: unknown };

const surfaces = [
  ["iris/intelligence", "Intelligence", "The complete governed intelligence hierarchy."],
  ["iris/intelligence/hierarchy", "Hierarchy", "From observed reality through recursive intelligence."],
  ["iris/intelligence/evidence", "Evidence", "Evidence, canonical state and transformation boundaries."],
  ["iris/intelligence/graph", "Graph", "Relationships, nodes, edges and cross-domain composition."],
  ["iris/intelligence/forward", "Forward", "Traverse from governed evidence toward intelligence."],
  ["iris/intelligence/reverse", "Reverse", "Trace intelligence back toward supporting evidence."],
  ["iris/intelligence/recursive", "Recursive", "Derived intelligence becoming upstream intelligence."],
  ["iris/intelligence/relationships", "Relationships", "Relational and cross-domain intelligence."],
  ["iris/intelligence/uncertainty", "Uncertainty", "Observed, derived, inferred, predicted and hypothetical states."],
  ["iris/intelligence/scenarios", "Scenarios", "Explicit hypothetical and counterfactual reasoning."],
  ["iris/intelligence/certification", "Certification", "Execution, evidence, lineage and publication proof."],
  ["iris/intelligence/higher-order", "Higher-Order", "Recursive synthesis without an artificial semantic ceiling."],
] as const;

function count(value: unknown): string { if (Array.isArray(value)) return String(value.length); if (value && typeof value === "object") return String(Object.keys(value as Record<string, unknown>).length); return value == null ? "—" : String(value); }
function blockedState(error: unknown): IntelligenceState { if (error instanceof IrisApiError && error.body && typeof error.body === "object") return error.body as IntelligenceState; return { certified: false, publication_boundary: { status: "blocked", reason: "CERTIFICATION_REQUIRED", derived_intelligence_publication: false } }; }

export function IrisIntelligenceSurface({ page = "iris/intelligence", go }: Props) {
  const [intel, setIntel] = useState<IntelligenceState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { let active = true; setLoading(true); setError(null); setIntel(null); api.getIntelligence().then(value => { if (active) setIntel(value); }).catch(reason => { if (!active) return; setIntel(blockedState(reason)); if (!(reason instanceof IrisApiError && reason.status === 409)) setError(reason instanceof Error ? reason.message : "Iris intelligence could not be loaded"); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [page]);

  const certified = intel?.certified === true && intel?.certification_gate?.eligible === true && typeof intel?.certification_hash === "string" && intel.certification_hash.length > 0;
  const selected = surfaces.find(([key]) => key === page) ?? surfaces[0];

  return <main className="iris-intelligence-surface">
    <section className="iis-header"><div><span className="iis-kicker">IRIS · COMPLETE HIERARCHY</span><h1>{selected[1]}</h1><p>{selected[2]}</p></div><div className="iis-state"><strong>PUBLICATION</strong><span>{loading ? "Checking certification…" : certified ? "Certified" : "Blocked"}</span></div></section>
    <section className="iis-section iis-intelligence-map"><div className="iis-section-head"><div><span className="iis-kicker">ONE IRIS HIERARCHY</span><h2>Traverse the same system</h2></div><p>Financial Life, evidence, ontology, intelligence, reports, questions and workspaces are traversal surfaces of one hierarchy.</p></div><nav className="iis-map-grid" aria-label="IRIS intelligence hierarchy surfaces">{surfaces.map(([key, label, description]) => <button key={key} type="button" className={key === page ? "active" : ""} onClick={() => go?.(key)}><strong>{label}</strong><span>{description}</span></button>)}</nav></section>
    {error && <section className="iis-section"><span className="iis-kicker">EVIDENCE STATUS</span><h2>Iris remains evidence-gated</h2><p>{error}</p></section>}
    {!loading && !certified && <section className="iis-section iis-integrity"><span className="iis-kicker">PUBLICATION STATUS</span><h2>Derived intelligence is not certified for publication</h2><p>The server returned the governed certification state, but the current intelligence run has not satisfied the publication gate. No derived financial intelligence is rendered from the blocked response.</p><p>Observed evidence remains available through the governed Financial-Life and evidence traversal surfaces. Unknown or unavailable information remains unknown or unavailable.</p></section>}
    {certified && <>
      <section className="iis-section iis-principle"><div className="iis-section-head"><div><span className="iis-kicker">CERTIFIED INTELLIGENCE</span><h2>Observed reality can become deeper intelligence.</h2></div><p>Every published result remains governed by its evidence boundary and certification state.</p></div><div className="iis-principle-grid"><article><span>RUN</span><strong>{intel.run_id ?? "—"}</strong><p>Certified runtime identity.</p></article><article><span>EXECUTION</span><strong>{intel.execution_id ?? "—"}</strong><p>Certified execution identity.</p></article><article><span>PUBLICATION</span><strong>Certified</strong><p>Derived intelligence is permitted to cross the server publication boundary.</p></article></div></section>
      <section className="iis-section"><div className="iis-section-head"><div><span className="iis-kicker">CURRENT INTELLIGENCE</span><h2>What this certified run supports</h2></div></div><div className="iis-deep-grid"><article><span>01</span><strong>Intelligence definitions</strong><h3>{count(intel.intelligence_atlas?.definitions)}</h3><p>Definitions materialized by the certified intelligence runtime.</p></article><article><span>02</span><strong>Higher-order findings</strong><h3>{count(intel.higher_order_synthesis?.findings)}</h3><p>Higher-order findings returned by the certified graph.</p></article><article><span>03</span><strong>Provider lineage</strong><h3>{count(intel.provider_lineage)}</h3><p>Provider lineage attached to the published intelligence context.</p></article><article><span>04</span><strong>Uncertainty</strong><h3>{count(intel.uncertainty)}</h3><p>Uncertainty remains attached to the published result.</p></article></div></section>
      {intel.narrative && <section className="iis-section"><span className="iis-kicker">CERTIFIED INTERPRETATION</span><h2>IRIS interpretation</h2><p>{intel.narrative}</p></section>}
    </>}
    <section className="iis-section iis-traversal"><div className="iis-section-head"><div><span className="iis-kicker">TRAVERSAL</span><h2>Forward and reverse</h2></div><p>Semantic depth has no artificial maximum; runtime, evidence, authorization and usefulness are the actual constraints.</p></div><div className="iis-traversal-grid"><article><span>FORWARD</span><strong>Evidence → canonical state → relational ontology → intelligence → higher-order composition</strong><p>Move deeper only when upstream evidence and transformation are governed.</p></article><article><span>REVERSE</span><strong>Result → derived node → upstream node → canonical state → evidence</strong><p>Use exact lineage where persisted runtime identities exist.</p></article><article><span>RECURSIVE</span><strong>Any valid derived node can become upstream intelligence</strong><p>There is no fixed semantic depth ceiling.</p></article></div></section>
  </main>;
}
