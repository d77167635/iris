import { useCallback, useEffect, useState } from "react";
import { IrisMark } from "./IrisMark";
import { PlaidLinkButton } from "./PlaidLink";
import { api, IrisApiError } from "../api/backend";
import "./IrisEvidenceAccess.css";

type Props = { go?: (page: string) => void };

export function IrisEvidenceAccess({ go }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [running, setRunning] = useState(false);
  const [runMessage, setRunMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    setError(null);
    try {
      const surface = await api.getPlaidSurface();
      setItems(Array.isArray(surface?.items) ? surface.items : []);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : "Connected evidence could not be loaded.");
    } finally {
      setLoadingItems(false);
    }
  }, []);

  useEffect(() => { void loadItems(); }, [loadItems]);

  const resync = async () => {
    if (refreshing) return;
    setRefreshing(true);
    setError(null);
    setRunMessage(null);
    try {
      await api.resync();
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Provider evidence refresh failed. No fallback data was created.");
    } finally {
      setRefreshing(false);
    }
  };

  const runIris = async () => {
    if (running) return;
    setRunning(true);
    setError(null);
    setRunMessage(null);
    try {
      const result = await api.runIris({ surface: "iris/evidence", mode: "full_intelligence" });
      setRunMessage(`IRIS execution ${result?.status ?? "accepted"}. Run: ${result?.run_id ?? "—"}.`);
    } catch (err) {
      if (err instanceof IrisApiError && err.body?.run_id) {
        setRunMessage(`IRIS execution ${err.body.status ?? "failed"}. Run: ${err.body.run_id}. ${err.body.certification_gate?.status ?? "Certification not passed"}.`);
      } else {
        setError(err instanceof Error ? err.message : "IRIS intelligence execution could not be completed.");
      }
    } finally {
      setRunning(false);
    }
  };

  return (
    <main className="iea-shell">
      <section className="iea-content">
        <div className="iea-intro">
          <span className="iea-kicker">EVIDENCE FORMATION</span>
          <div className="iea-mark"><IrisMark size={68} color="currentColor" /></div>
          <h1>Build the complete<br /><em>financial evidence</em> boundary.</h1>
          <p>IRIS uses provider observations that are actually returned and persisted. The eight authoritative domains remain independently governed; an available or consented product is never presented as observed data.</p>
        </div>
        <aside className="iea-panel">
          <div className="iea-panel-kicker">PROVIDER CONNECTION</div>
          <h2>Connect a financial institution</h2>
          <p>New provider connections use the governed Plaid Link flow. Existing Plaid Items remain persisted and are not replaced or deleted by opening a new connection.</p>
          <PlaidLinkButton onSuccess={() => void loadItems()} />
          <button type="button" className="iea-later" onClick={() => void resync()} disabled={refreshing}>{refreshing ? "Refreshing existing evidence…" : "Refresh existing evidence"}</button>
          <button type="button" className="iea-later" onClick={() => void runIris()} disabled={running}>{running ? "Running IRIS intelligence…" : "Run IRIS intelligence"}</button>
          {runMessage && <div className="plaid-connect-error" role="status"><span>{runMessage}</span></div>}
          {error && <div className="plaid-connect-error" role="alert"><span>{error}</span><button type="button" onClick={() => void loadItems()} disabled={loadingItems}>Retry</button></div>}
          <div className="iea-boundary">
            <div><b>OBSERVED</b><span>Provider responses become evidence only after they are actually received and persisted.</span></div>
            <div><b>GOVERNED</b><span>Evidence stays tied to the authenticated user and exact Item boundary.</span></div>
            <div><b>READ-ONLY</b><span>No financial movement is initiated by evidence formation.</span></div>
            <div><b>RUNTIME</b><span>IRIS execution may be requested from this governed evidence boundary; publication still requires the server certification gates.</span></div>
          </div>
        </aside>
      </section>
      <section className="iea-items">
        <div><span className="iea-kicker">CONNECTED ITEMS</span><h2>Persisted provider evidence, if any</h2><p>Existing persisted Items remain available for inspection. Statements remain deferred until the real-banking phase.</p></div>
        {loadingItems ? <div className="iea-item-empty">Reading persisted connected Items…</div> : items.length === 0 ? <div className="iea-item-empty">No connected Plaid Items are currently persisted.</div> : items.map((item: any) => <article className="iea-item" key={item.item_id}><div><strong>{item.institution_name ?? "Institution name unavailable"}</strong><span>{item.status ?? "Status unavailable"}{item.last_synced_at ? ` · last synced ${new Date(item.last_synced_at).toLocaleString()}` : ""}</span></div><b>Statements deferred until real banking</b></article>)}
      </section>
      <section className="iea-items">
        <div><span className="iea-kicker">CONTINUE</span><h2>Continue through your financial life.</h2><p>Use the Financial Life, Reports and Intelligence surfaces to inspect persisted provider evidence and governed results.</p></div>
        <div className="iris-journey-actions"><button type="button" onClick={() => go?.("iris")}>Financial Life →</button><button type="button" onClick={() => go?.("iris/reports")}>Reports →</button><button type="button" onClick={() => go?.("iris/intelligence")}>Intelligence →</button></div>
      </section>
    </main>
  );
}