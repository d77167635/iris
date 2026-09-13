import { useEffect, useState } from "react";
import { api, IrisApiError } from "../api/backend";
import type { IrisReportCatalogUserReport } from "../contracts/irisReportCatalog";
import "./IrisIntelligenceScreens.css";

type Props = { go?: (page: string) => void };
type RuntimeOutput = { report_id?: string; analysis_name?: string; state?: string; evidence_publication_state?: string; runtime_lineage?: { run_id?: string; execution_id?: string; run_evidence_ids?: string[] } | null };

export function IrisReportsSurface({ go }: Props) {
  const [reports, setReports] = useState<IrisReportCatalogUserReport[]>([]);
  const [runtime, setRuntime] = useState<RuntimeOutput[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let live = true;
    Promise.allSettled([api.getIrisCatalog(), api.getIntelligence()]).then(([catalogResult, intelligenceResult]) => {
      if (!live) return;
      if (catalogResult.status === "fulfilled") setReports(catalogResult.value.user_reports ?? []);
      else setError(catalogResult.reason instanceof Error ? catalogResult.reason.message : "Reports could not be loaded.");
      if (intelligenceResult.status === "fulfilled") {
        setRuntime((intelligenceResult.value.intelligence_output_runtime?.outputs ?? []) as RuntimeOutput[]);
      } else {
        const reason = intelligenceResult.reason;
        setRuntime(null);
        setRuntimeError(reason instanceof IrisApiError ? reason.body?.error ?? reason.message : reason instanceof Error ? reason.message : "Runtime intelligence is currently unavailable.");
      }
    }).finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, []);
  return <main className="iis-screen"><section className="iis-hero"><span>IRIS · REPORTS</span><h1>Produced results</h1><p>This surface contains actual report results and runtime outputs only. Report definitions and activation preferences remain in the Report Catalog.</p></section>{error && <section className="iis-panel"><span>REPORT STATUS</span><h2>Unable to read reports</h2><p>{error}</p></section>}{loading && <section className="iis-panel"><p>Reading persisted report results…</p></section>}<section className="iis-metric-grid"><article className="iis-metric"><span>Your produced reports</span><strong>{reports.length}</strong><small>Stored user report compositions</small></article><article className="iis-metric"><span>Runtime outputs</span><strong>{runtime == null ? "—" : runtime.length}</strong><small>{runtime == null ? "Runtime output unavailable" : "Returned by the governed intelligence runtime"}</small></article></section><section className="iis-panel"><header><div><span>YOUR REPORT RESULTS</span><h2>Reports actually produced for you</h2></div></header><div className="iis-catalog-grid">{reports.map(r => <article className="iis-catalog-card" key={r.id}><div><span>{r.primary_content_kind} · certified</span><b>{r.title}</b></div><small>{r.description}</small><small>{r.content_node_ids.length} content nodes · {r.source_evidence_ids.length} source-evidence references</small><button type="button" onClick={() => go?.("iris/catalog")}>Open in Report Catalog →</button></article>)}{!loading && reports.length === 0 && <p className="iis-note">No stored user report result exists yet. IRIS will not manufacture a report.</p>}</div></section><section className="iis-panel"><header><div><span>RUNTIME RESULTS</span><h2>Governed runtime report outputs</h2></div></header>{runtimeError && <div className="iis-boundary"><p><strong>Runtime unavailable:</strong> {runtimeError}</p><p>No zero is substituted for an unavailable runtime response.</p></div>}<div className="iis-catalog-grid">{runtime?.map((r, i) => <article className="iis-catalog-card" key={`${r.report_id ?? "runtime"}-${i}`}><div><span>{r.evidence_publication_state ?? "—"}</span><b>{r.analysis_name ?? r.report_id ?? "Report output"}</b></div><small>State: {r.state ?? "—"}</small><small>Run: {r.runtime_lineage?.run_id ?? "—"}</small><small>Execution: {r.runtime_lineage?.execution_id ?? "—"}</small><small>Evidence references: {r.runtime_lineage?.run_evidence_ids?.length == null ? "—" : r.runtime_lineage.run_evidence_ids.length}</small></article>)}{runtime === null && !runtimeError && <p className="iis-note">Runtime output is unavailable.</p>}{runtime !== null && !loading && runtime.length === 0 && <p className="iis-note">No runtime report output is currently available.</p>}</div></section><section className="iis-panel"><header><div><span>BOUNDARY</span><h2>Definitions are not results</h2></div></header><p>The Report Catalog defines and activates report products. This screen reports only what IRIS has actually produced from governed runtime evidence. A catalog definition never counts as a produced financial result.</p><button type="button" onClick={() => go?.("iris/catalog")}>Open Report Catalog →</button></section></main>;
}