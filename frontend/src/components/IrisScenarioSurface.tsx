import { useState } from "react";
import { api, IrisApiError } from "../api/backend";

type Props = { go?: (page: string) => void };
type ScenarioType = "spending_change" | "bill_change" | "income_change";
type ScenarioResult = {
  evidence?: string;
  certified?: boolean;
  run_id?: string | null;
  certification_hash?: string | null;
  baseline?: { safeToSpend?: number | null; cashFlowNet?: number | null };
  scenario?: { safeToSpend?: number | null; cashFlowNet?: number | null };
  delta?: { safeToSpend?: number | null; cashFlowNet?: number | null };
  assumption?: string;
};

const money = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n < 0 ? "−" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const signed = (value: unknown) => {
  if (value === null || value === undefined || value === "") return "—";
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return `${n >= 0 ? "+" : "−"}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

function ScenarioRow({ label, baseline, scenario, delta }: { label: string; baseline?: number | null; scenario?: number | null; delta?: number | null }) {
  return <div className="iris-scenario-row"><span>{label}</span><b>{money(baseline)}</b><span>→</span><strong>{money(scenario)}</strong><em className={Number(delta) >= 0 ? "good" : "bad"}>{signed(delta)}</em></div>;
}

export function IrisScenarioSurface({ go }: Props) {
  const [type, setType] = useState<ScenarioType>("spending_change");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<ScenarioResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const run = async () => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) {
      setError("Enter a numeric scenario change before running the scenario.");
      return;
    }
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const next = await api.runScenario(type, numericAmount) as ScenarioResult;
      setResult(next);
    } catch (reason) {
      if (reason instanceof IrisApiError) {
        setError(reason.message);
      } else {
        setError(reason instanceof Error ? reason.message : "Scenario calculation could not be completed.");
      }
    } finally {
      setRunning(false);
    }
  };

  return <main className="iris4-screen"><div className="iris4-body">
    <section className="iris-surface">
      <span className="eyebrow">SCENARIOS</span>
      <h1>Explore possibilities without changing reality.</h1>
      <p>Scenarios are explicitly hypothetical. They use the governed financial baseline and never write financial records or move money.</p>
      {error && <div className="iris-surface"><span className="eyebrow">SCENARIO STATUS</span><h2>Calculation unavailable</h2><p>{error}</p><p>IRIS will not substitute a zero, example value, or fabricated baseline when the governing intelligence result is unavailable.</p></div>}
      <div className="iris-whatif-controls">
        <label>Variable<select value={type} onChange={(event) => setType(event.target.value as ScenarioType)}><option value="spending_change">Spending change ($)</option><option value="bill_change">Essential-bill change ($)</option><option value="income_change">30-day inflow change (%)</option></select></label>
        <label>Change<input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder={type === "income_change" ? "−10" : "−300"}/></label>
        <button type="button" onClick={() => void run()} disabled={running || amount === ""}>{running ? "Calculating…" : "Run scenario"}</button>
      </div>
    </section>

    {result?.evidence === "calculated" ? <section className="iris-surface">
      <span className="eyebrow">CALCULATED IMPACT</span>
      <h2>Scenario result</h2>
      <div className="iris-scenario-result"><ScenarioRow label="Safe to spend" baseline={result.baseline?.safeToSpend} scenario={result.scenario?.safeToSpend} delta={result.delta?.safeToSpend}/><ScenarioRow label="30-day cash flow" baseline={result.baseline?.cashFlowNet} scenario={result.scenario?.cashFlowNet} delta={result.delta?.cashFlowNet}/></div>
      {result.assumption && <p>{result.assumption}</p>}
      <small>Certified run: {result.run_id ?? "Unavailable"}</small>
    </section> : !result && !error ? <section className="iris-surface"><span className="eyebrow">GOVERNED SIMULATION</span><h2>Waiting for a real governed baseline.</h2><p>Run a scenario after IRIS has a certified intelligence result. If certification is blocked, the scenario remains blocked rather than producing synthetic output.</p></section> : null}

    <section className="iris-surface"><span className="eyebrow">JOURNEY</span><h2>Keep the scenario connected to the hierarchy.</h2><div className="iris-journey-actions"><button type="button" onClick={() => go?.("iris/evidence")}>Verify evidence →</button><button type="button" onClick={() => go?.("iris/decisions")}>Move to decisions →</button><button type="button" onClick={() => go?.("iris/reasoning")}>Understand the reasoning →</button></div></section>
  </div></main>;
}
