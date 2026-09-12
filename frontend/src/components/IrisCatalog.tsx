import { useEffect, useMemo, useState } from "react";
import { api } from "../api/backend";
import type { IrisReportCatalogProduct, IrisReportCatalogResponse, IrisReportCatalogUserReport } from "../contracts/irisReportCatalog";
import { IrisReportDetail } from "./IrisReportDetail";
import "./IrisIntelligenceScreens.css";

type Props = { go?: (page: string) => void };
type RuntimeReport = { report_id?: string; runtime_lineage?: unknown };
type ProductState = "runtime" | "active" | "defined";

function productState(active: boolean, runtime: boolean): ProductState {
  if (runtime) return "runtime";
  if (active) return "active";
  return "defined";
}
function stateLabel(state: ProductState) {
  if (state === "runtime") return "Runtime output observed";
  if (state === "active") return "Active definition";
  return "Defined · inspect";
}
function stateDescription(state: ProductState) {
  if (state === "runtime") return "A governed runtime output was returned for this product.";
  if (state === "active") return "Activated by you; activation does not create evidence or intelligence.";
  return "A catalog definition exists; no produced result is being claimed here.";
}

export function IrisCatalog({ go }: Props) {
  const [catalog, setCatalog] = useState<IrisReportCatalogProduct[]>([]);
  const [userReports, setUserReports] = useState<IrisReportCatalogUserReport[]>([]);
  const [active, setActive] = useState<string[]>([]);
  const [dependencies, setDependencies] = useState<IrisReportCatalogResponse["dependency_graph"]>([]);
  const [runtimeReports, setRuntimeReports] = useState<RuntimeReport[]>([]);
  const [metadata, setMetadata] = useState<Pick<IrisReportCatalogResponse, "catalog_version" | "product_boundary" | "provider_boundary" | "catalog_counts"> | null>(null);
  const [family, setFamily] = useState("all");
  const [outputType, setOutputType] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedUserReportId, setSelectedUserReportId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const [catalogData, intelligenceData] = await Promise.all([api.getIrisCatalog(), api.getIntelligence().catch(() => null)]);
      setCatalog(catalogData.catalog ?? []);
      setUserReports(catalogData.user_reports ?? []);
      setActive(catalogData.activation?.report_ids ?? []);
      setDependencies(catalogData.dependency_graph ?? []);
      setMetadata({ catalog_version: catalogData.catalog_version, product_boundary: catalogData.product_boundary, provider_boundary: catalogData.provider_boundary, catalog_counts: catalogData.catalog_counts });
      setRuntimeReports((intelligenceData?.intelligence_output_runtime?.outputs ?? []) as RuntimeReport[]);
      setMessage("");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Unable to load Iris report library."); }
  };
  useEffect(() => { void load(); }, []);

  const families = useMemo(() => [...new Set(catalog.map((r) => r.family))].sort(), [catalog]);
  const outputTypes = useMemo(() => [...new Set(catalog.map((r) => r.outputType))].sort(), [catalog]);
  const visible = useMemo(() => catalog.filter((r) =>
    (family === "all" || r.family === family) &&
    (outputType === "all" || r.outputType === outputType) &&
    (!query.trim() || `${r.name} ${r.description} ${r.family} ${r.outputType} ${r.analysisId} ${r.requiredEvidenceInputs.join(" ")}`.toLowerCase().includes(query.toLowerCase()))
  ), [catalog, family, outputType, query]);
  const selected = selectedId ? catalog.find((r) => r.reportId === selectedId) ?? null : null;
  const selectedDependency = selected ? dependencies.find((item) => item.report_id === selected.reportId) : undefined;
  const selectedUserReport = selectedUserReportId ? userReports.find((report) => report.id === selectedUserReportId) ?? null : null;
  const runtimeReportIds = useMemo(() => new Set(runtimeReports.map((item) => item.report_id).filter((id): id is string => typeof id === "string")), [runtimeReports]);
  const definedCount = metadata?.catalog_counts.total ?? catalog.length;
  const runtimeCount = runtimeReportIds.size;
  const activeCount = active.length;
  const familyCount = metadata?.catalog_counts.families ?? families.length;
  const familyCounts = useMemo(() => families.map((name) => ({ name, count: catalog.filter((r) => r.family === name).length })), [catalog, families]);
  const discoverySuggestions = useMemo(() => ["cash flow", "spending changes", "financial position", "debt", "behavior", "forecast", "evidence", "risk"].filter((prompt) => !query.trim() || prompt.includes(query.trim().toLowerCase())).slice(0, 6), [query]);

  const toggle = async (reportId: string) => {
    if (saving) return;
    const previous = active;
    const next = previous.includes(reportId) ? previous.filter((id) => id !== reportId) : [...previous, reportId];
    setActive(next); setSaving(true); setMessage("");
    try { const result = await api.saveIrisCatalogSelection(next); setActive(result.activation.report_ids); setMessage("Report activation saved"); }
    catch (e) { setActive(previous); setMessage(e instanceof Error ? e.message : "Unable to save report activation."); }
    finally { setSaving(false); }
  };
  const reset = async () => {
    if (saving) return;
    setSaving(true); setMessage("");
    try { const data = await api.resetIrisCatalog(); setActive(data.activation.report_ids); setMessage("All currently defined report products restored"); }
    catch (e) { setMessage(e instanceof Error ? e.message : "Unable to restore report products."); }
    finally { setSaving(false); }
  };

  if (selectedUserReport) return (
    <div className="iis-screen">
      <section className="iis-panel">
        <header><div><span>IRIS · YOUR REPORT</span><h2>{selectedUserReport.title}</h2></div><button type="button" onClick={() => setSelectedUserReportId(null)}>← Report Library</button></header>
        <p>{selectedUserReport.description}</p>
        <div className="iis-boundary"><p><strong>Primary content:</strong> {selectedUserReport.primary_content_kind}</p><p><strong>Certified execution:</strong> {selectedUserReport.execution_id}</p><p><strong>Composition:</strong> {selectedUserReport.content_node_ids.length} intelligence/derived nodes and {selectedUserReport.source_evidence_ids.length} source-evidence references.</p></div>
        <div className="iis-catalog-grid">{Array.isArray(selectedUserReport.content?.blocks) && (selectedUserReport.content.blocks as Array<{ kind?: string; name?: string; evidence_state?: string }>).map((block, index) => <article className="iis-catalog-card" key={`${selectedUserReport.id}-${index}`}><div><span>{block.kind ?? "content"}</span><b>{block.name ?? "Unnamed content"}</b></div><small>Evidence state: {block.evidence_state ?? "—"}</small></article>)}</div>
      </section>
      <section className="iis-panel"><header><div><span>LINEAGE</span><h2>Trace the report backward or forward</h2></div></header><div className="iis-boundary"><p>Every stored report is tied to one certified execution and retains its exact content-node and source-evidence references. The report is a presentation/composition surface inside the same IRIS hierarchy—not a separate intelligence system.</p></div><div className="iis-catalog-toolbar"><button type="button" onClick={() => go?.("iris/evidence")}>Verify evidence</button><button type="button" onClick={() => go?.("iris/reasoning")}>Understand relationships</button><button type="button" onClick={() => go?.("iris/intelligence")}>Explore intelligence</button></div></section>
    </div>
  );

  if (selected) return (
    <>
      <IrisReportDetail report={selected} dependency={selectedDependency} active={active.includes(selected.reportId)} saving={saving} onToggle={() => void toggle(selected.reportId)} onBack={() => setSelectedId(null)} />
      <section className="iis-panel"><header><div><span>RETURN PATH</span><h2>Continue through the same hierarchy</h2></div></header><div className="iis-boundary"><p>From a report, IRIS can move toward reasoning, evidence, deeper intelligence, other reports, or any other supported hierarchy content without creating a second product side.</p></div></section>
    </>\>
  );

  return (
    <div className="iis-screen">
      <div className="iis-hero">
        <div className="iis-hero-top"><span>IRIS · REPORT LIBRARY</span>{go && <button type="button" className="iis-back" onClick={() => go("iris")}>← IRIS</button>}</div>
        <h1>Your IRIS report library</h1>
        <p>IRIS uses the complete hierarchy as one composition space. A report may combine observed evidence, canonical state, intelligence, explanations, scenarios, outcomes, other reports, or any supported mixture. There is no separate intelligence side.</p>
        <div className="iis-boundary"><p><strong>IRIS names each user report from its most important or empowering piece of content.</strong> The title is derived from actual certified composition content; no synthetic financial claim is invented.</p><p><strong>The library stores the report names and descriptions.</strong> Definitions remain separate from user-produced reports.</p></div>
      </div>

      <div className="iis-metric-grid">
        <div className="iis-metric"><span>Report definitions</span><strong>{definedCount}</strong><small>{metadata?.catalog_version ?? "Governed catalog"}</small></div>
        <div className="iis-metric"><span>Your reports</span><strong>{userReports.length}</strong><small>Actual IRIS-composed reports</small></div>
        <div className="iis-metric"><span>Active definitions</span><strong>{activeCount}</strong><small>Publication preferences</small></div>
        <div className="iis-metric"><span>Runtime outputs</span><strong>{runtimeCount}</strong><small>Actual readable runtime outputs</small></div>
      </div>

      <section className="iis-panel"><header><div><span>YOUR REPORTS</span><h2>Reports IRIS has actually created for you</h2></div></header><p className="iis-note">These are not placeholders and not catalog definitions. Each report below is tied to a certified execution and retains its composition and lineage references.</p><div className="iis-catalog-grid">{userReports.map((report) => <button type="button" key={report.id} className="iis-catalog-card selected" onClick={() => setSelectedUserReportId(report.id)}><div><span>{report.primary_content_kind} · certified</span><b>{report.title}</b></div><small>{report.description}</small><small>{report.content_node_ids.length} intelligence/derived nodes · {report.source_evidence_ids.length} evidence references</small><em>Open report →</em></button>)}{userReports.length === 0 && <p className="iis-note">No user-specific report has been created yet. IRIS will not manufacture one without a certified execution and governed content.</p>}</div></section>

      <section className="iis-panel"><header><div><span>REPORT DEFINITIONS</span><h2>Discover the product universe</h2></div></header><p className="iis-note">Definitions describe report products IRIS can publish when their runtime evidence, semantic dependencies, lineage and certification requirements are satisfied. The definition count is not an intelligence ceiling.</p><div className="iis-catalog-grid">{familyCounts.map((item) => <button type="button" key={item.name} className="iis-catalog-card" onClick={() => { setFamily(item.name); setQuery(""); }}><div><span>REPORT FAMILY</span><b>{item.name}</b></div><small>{item.count} defined product{item.count === 1 ? "" : "s"}</small><em>Browse family →</em></button>)}</div></section>

      <section className="iis-panel"><header><div><span>QUESTION-DRIVEN DISCOVERY</span><h2>Start with what you want to understand</h2></div></header><p className="iis-note">Searches definitions only; it does not claim that a user-specific report already exists.</p><div className="iis-catalog-toolbar"><input aria-label="Search Iris report products" placeholder="What do you want to understand?" value={query} onChange={(e) => setQuery(e.target.value)} />{discoverySuggestions.map((prompt) => <button type="button" key={prompt} onClick={() => setQuery(prompt)}>{prompt}</button>)}</div></section>

      <section className="iis-panel"><header><div><span>PUBLICATION PREFERENCES</span><h2>Active report definitions</h2></div><button type="button" onClick={() => void reset()} disabled={saving}>Restore available reports</button></header><p className="iis-note">Activation controls which defined report products you prioritize. It does not activate provider products, create evidence, or limit the underlying IRIS hierarchy.</p><div className="iis-catalog-grid">{catalog.filter((r) => active.includes(r.reportId)).map((r) => <button type="button" key={r.reportId} className="iis-catalog-card selected" onClick={() => setSelectedId(r.reportId)}><div><span>{r.family} · {r.outputType}</span><b>{r.name}</b></div><small>{r.description}</small><em>{runtimeReportIds.has(r.reportId) ? "Runtime output observed · Open" : "Definition only · Open"}</em></button>)}</div></section>

      <section className="iis-panel"><header><div><span>COMPLETE REGISTERED INVENTORY</span><h2>{visible.length} definitions shown</h2></div></header><div className="iis-catalog-toolbar"><input aria-label="Search Iris report products" placeholder="Search reports, analyses, evidence inputs…" value={query} onChange={(e) => setQuery(e.target.value)} /><select aria-label="Filter report family" value={family} onChange={(e) => setFamily(e.target.value)}><option value="all">All families</option>{families.map((f) => <option key={f} value={f}>{f}</option>)}</select><select aria-label="Filter report output type" value={outputType} onChange={(e) => setOutputType(e.target.value)}><option value="all">All output types</option>{outputTypes.map((type) => <option key={type} value={type}>{type}</option>)}</select></div><div className="iis-catalog-grid">{visible.map((r) => { const isActive = active.includes(r.reportId); const isRuntime = runtimeReportIds.has(r.reportId); const dependency = dependencies.find((item) => item.report_id === r.reportId); const state = productState(isActive, isRuntime); return <button type="button" key={r.reportId} className={`iis-catalog-card${isActive ? " selected" : ""}`} onClick={() => setSelectedId(r.reportId)}><div><span>{r.family} · {r.outputType}</span><b>{r.name}</b></div><small>{r.description}</small><small>{r.requiredEvidenceInputs.length} declared evidence input{r.requiredEvidenceInputs.length === 1 ? "" : "s"} · {dependency?.feature_ids.length ?? 0} feature mapping{(dependency?.feature_ids.length ?? 0) === 1 ? "" : "s"}</small><em>{stateLabel(state)}</em><small>{stateDescription(state)}</small></button>; })}{visible.length === 0 && <p className="iis-note">No report products match the current discovery terms or filters.</p>}</div></section>

      <section className="iis-panel"><header><div><span>ONE HIERARCHY</span><h2>Reports are compositions of the same IRIS ecosystem</h2></div></header><div className="iis-boundary"><p><strong>Forward:</strong> governed evidence can become state, relationships, intelligence and deeper derived content.</p><p><strong>Composition:</strong> IRIS can combine content from different hierarchy levels, including content that contains intelligence, content that does not, or a mixture.</p><p><strong>Naming:</strong> IRIS selects the most important or empowering actual content as the report's title anchor.</p><p><strong>Reverse:</strong> a report can traverse back through its exact composition and lineage to upstream content and evidence when those references exist.</p><p><strong>No fabrication:</strong> missing evidence remains missing; a report is never created from invented financial facts.</p></div></section>
    </div>
  );
}
