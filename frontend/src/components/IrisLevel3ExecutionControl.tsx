import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api, IrisApiError } from "../api/backend";
import "./IrisLevel3ExecutionControl.css";

export function IrisLevel3ExecutionControl() {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const locate = () => setTarget(document.querySelector<HTMLElement>(".ih-section"));
    locate();
    const observer = new MutationObserver(locate);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  if (!target) return null;

  const run = async () => {
    if (running) return;
    setRunning(true);
    setMessage(null);
    setError(null);
    try {
      const result = await api.runIrisLevel3();
      if (!result?.run_id) throw new Error("IRIS did not return a Level 3 execution identity.");
      if (result.certified !== true) {
        setMessage(`Level 3 execution ${result.run_id} completed but is not certified. No unpublished result was presented as certified.`);
      } else {
        setMessage(`Level 3 execution ${result.run_id} is certified and available for hierarchy reload.`);
      }
      window.dispatchEvent(new CustomEvent("iris-level3-executed", { detail: result }));
    } catch (e) {
      const detail = e instanceof IrisApiError ? e.message : e instanceof Error ? e.message : "Level 3 recursive intelligence execution failed.";
      setError(detail);
    } finally {
      setRunning(false);
    }
  };

  return createPortal(
    <div className="iris-level3-execution-control">
      <div className="iris-level3-execution-copy">
        <strong>Recursive intelligence</strong>
        <span>Run the governed Level 3 pipeline from the certified Level 2 hierarchy.</span>
        {message && <small>{message}</small>}
        {error && <small className="error">{error}</small>}
      </div>
      <button type="button" onClick={() => void run()} disabled={running} aria-busy={running}>
        {running ? "Running Level 3…" : "Run Level 3 intelligence"}
      </button>
    </div>,
    target,
  );
}
