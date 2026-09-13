import { useEffect, useState } from "react";
import { api, IrisApiError } from "../api/backend";
import "./IrisRawPlaidSupabaseSurface.css";

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

function label(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function display(value: unknown) {
  return value === null || value === undefined || value === "" ? "Not observed" : String(value);
}
function count(value: unknown) {
  return typeof value === "number" ? value.toLocaleString("en-US") : display(value);
}
function shortHash(value?: string) {
  return value ? `${value.slice(0, 18)}…${value.slice(-12)}` : "Not observed";
}

const sourceLabels: Record<string, string> = {
  plaid_items: "Connected institutions",
  plaid_accounts: "Accounts",
  plaid_raw_balances: "Balance observations",
  plaid_raw_liabilities: "Liability observations",
  plaid_raw_transactions: "Transactions",
  plaid_raw_product_observations: "Product observations",
  plaid_provider_response_receipts: "Provider receipts",
};

const domains = [
  ["01", "Transactions"],
  ["02", "Balance"],
  ["03", "Identity"],
  ["04", "Assets"],
  ["05", "Liabilities"],
  ["06", "Investments"],
  ["07", "Statements"],
];

export function IrisLevel1HierarchySurface() {
  const [data, setData] = useState<Governance | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        let value: Governance;
        try {
          value = await api.get("/iris/level1");
        } catch (err) {
          if (!(err instanceof IrisApiError) || err.status !== 409) throw err;
          await api.post("/iris/level1/run");
          value = await api.get("/iris/level1");
        }
        if (active) setData(value);
      } catch (err: any) {
        if (active) setError(err?.message ?? "IRIS is temporarily unavailable");
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <main className="iris-shell">
        <div className="iris-state">
          <span className="iris-kicker">IRIS</span>
          <h1>IRIS is temporarily unavailable</h1>
          <p>The current financial state could not be loaded.</p>
          <code>{error}</code>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="iris-shell">
        <div className="iris-state">
          <span className="iris-kicker">IRIS</span>
          <h1>Your financial life</h1>
          <div className="iris-loading-mark" aria-hidden="true" />
          <p>Loading your connected financial state…</p>
        </div>
      </main>
    );
  }

  const sourceCounts = Object.entries(data.source_counts ?? {});
  const certified = data.certified === true;

  return (
    <main className="iris-shell">
      <div className="iris-app">
        <aside className="iris-sidebar" aria-label="IRIS navigation">
          <div className="iris-brand">
            <span className="iris-brand-mark">I</span>
            <div><strong>IRIS</strong><small>Financial intelligence</small></div>
          </div>

          <nav className="iris-nav">
            <div className="iris-nav-label">Your financial life</div>
            <a className="iris-nav-item active" href="#overview"><span>Overview</span><b>01</b></a>
            <a className="iris-nav-item" href="#transactions"><span>Transactions</span><b>{count(data.source_counts?.plaid_raw_transactions)}</b></a>
            <a className="iris-nav-item" href="#balance"><span>Balance</span><b>{count(data.source_counts?.plaid_raw_balances)}</b></a>
            <a className="iris-nav-item" href="#identity"><span>Identity</span><b>{count(data.source_counts?.plaid_accounts)}</b></a>
            <a className="iris-nav-item" href="#assets"><span>Assets</span><b>—</b></a>
            <a className="iris-nav-item" href="#liabilities"><span>Liabilities</span><b>{count(data.source_counts?.plaid_raw_liabilities)}</b></a>
            <a className="iris-nav-item" href="#investments"><span>Investments</span><b>—</b></a>
            <a className="iris-nav-item" href="#statements"><span>Statements</span><b>—</b></a>
          </nav>

          <div className="iris-sidebar-footer">
            <div className="iris-connection"><span className="iris-live-dot" />Connected financial data</div>
            <div className="iris-sidebar-source">Powered by your authorized data</div>
          </div>
        </aside>

        <section className="iris-main" id="overview">
          <header className="iris-topbar">
            <div>
              <span className="iris-kicker">Overview</span>
              <h1>Your financial life</h1>
            </div>
            <div className={`iris-status ${certified ? "good" : "pending"}`}>
              <span />
              {certified ? "Connected and verified" : "Verification in progress"}
            </div>
          </header>

          <section className="iris-command-card">
            <div className="iris-command-copy">
              <span className="iris-kicker">IRIS state</span>
              <h2>A governed view of your connected financial life.</h2>
              <p>IRIS organizes the financial information available from your connected institutions into one coherent system. Only observed data is used.</p>
            </div>
            <div className="iris-command-ring" aria-hidden="true"><span>IRIS</span></div>
          </section>

          <section className="iris-summary-grid" aria-label="Financial connection summary">
            <article className="iris-summary-card emphasis"><span>Connected institutions</span><strong>{count(data.source_counts?.plaid_items)}</strong><small>Active financial connections</small></article>
            <article className="iris-summary-card"><span>Accounts</span><strong>{count(data.source_counts?.plaid_accounts)}</strong><small>Connected account relationships</small></article>
            <article className="iris-summary-card"><span>Transactions</span><strong>{count(data.source_counts?.plaid_raw_transactions)}</strong><small>Observed transaction records</small></article>
            <article className="iris-summary-card"><span>Balance observations</span><strong>{count(data.source_counts?.plaid_raw_balances)}</strong><small>Observed balance records</small></article>
          </section>

          <section className="iris-hierarchy" aria-label="Financial life domains">
            <div className="iris-section-head">
              <div><span className="iris-kicker">Financial life</span><h2>One connected picture</h2></div>
              <span className="iris-section-note">Observed data only</span>
            </div>
            <div className="iris-domain-map">
              <div className="iris-domain-core"><span>IRIS</span><small>Financial life</small></div>
              <div className="iris-domain-lines" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
              <div className="iris-domain-grid">
                {domains.map(([number, name]) => (
                  <article className="iris-domain-card" key={name} id={name.toLowerCase()}>
                    <span>{number}</span>
                    <strong>{name}</strong>
                    <small>{name === "Transactions" ? `${count(data.source_counts?.plaid_raw_transactions)} observed` : name === "Balance" ? `${count(data.source_counts?.plaid_raw_balances)} observed` : name === "Liabilities" ? `${count(data.source_counts?.plaid_raw_liabilities)} observed` : "Available when supported by evidence"}</small>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="iris-evidence" aria-label="Connected data">
            <div className="iris-section-head">
              <div><span className="iris-kicker">Connected data</span><h2>What IRIS currently sees</h2></div>
              <span className="iris-section-note">{count(data.evidence_count)} observations</span>
            </div>
            <div className="iris-evidence-grid">
              {sourceCounts.map(([name, value]) => (
                <article className="iris-evidence-row" key={name}>
                  <div><strong>{sourceLabels[name] ?? label(name)}</strong><small>Observed from connected financial data</small></div>
                  <b>{count(value)}</b>
                </article>
              ))}
            </div>
          </section>

          <section className="iris-detail" aria-label="Data verification details">
            <div className="iris-detail-head"><span className="iris-kicker">Data verification</span><strong>{certified ? "Verified" : "Pending"}</strong></div>
            <div className="iris-detail-grid">
              <div><span>Last verified</span><strong>{display(data.certified_at)}</strong></div>
              <div><span>Evidence state</span><strong>{label(data.evidence_state ?? "unknown")}</strong></div>
              <div><span>Connection scope</span><strong>{count(data.evidence_count)} records</strong></div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
