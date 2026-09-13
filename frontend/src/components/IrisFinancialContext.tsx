import { useCallback, useEffect, useState } from "react";
import { api } from "../api/backend";

type Props = { go: (page: string) => void };
type Overview = { accounts?: any[]; recent_transactions?: any[] };
type Surface = { products?: any[]; provider_evidence_counts?: Record<string, number> };
const DOMAINS = ["auth", "transactions", "balance", "identity", "assets", "liabilities", "investments"] as const;
const money = (v: unknown) => { if (v == null || v === "") return "—"; const n = Number(v); return Number.isFinite(n) ? `${n < 0 ? "−" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "—"; };

export function IrisFinancialContext({ go }: Props) {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [surface, setSurface] = useState<Surface | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); const [o, s] = await Promise.allSettled([api.getOverview(), api.getPlaidSurface()]); if (o.status === "fulfilled") setOverview(o.value); if (s.status === "fulfilled") setSurface(s.value); setLoading(false); }, []);
  useEffect(() => { void load(); }, [load]);
  const accounts = overview?.accounts ?? [];
  const transactions = overview?.recent_transactions ?? [];
  const liquidAccounts = accounts.filter((a: any) => a.type === "depository" && a.current_balance != null);
  const creditAccounts = accounts.filter((a: any) => a.type === "credit" && a.current_balance != null);
  const liquid = liquidAccounts.length ? liquidAccounts.reduce((s: number, a: any) => s + Number(a.current_balance), 0) : null;
  const debt = creditAccounts.length ? creditAccounts.reduce((s: number, a: any) => s + Number(a.current_balance), 0) : null;
  const observed = DOMAINS.filter(d => (surface?.products ?? []).some((p: any) => (p.key === d || p.product === d) && p.status === "observed")).length;
  return <section className="iris-financial-context" aria-label="Live financial-life context">
    <div className="ifc-heading"><span>LIVE FINANCIAL-LIFE CONTEXT</span><button type="button" onClick={() => go("iris")}>Open Financial Life →</button></div>
    <div className="ifc-grid">
      <button type="button" onClick={() => go("iris/state")}><span>LIQUID POSITION</span><strong>{loading ? "…" : money(liquid)}</strong><small>{liquidAccounts.length ? `${liquidAccounts.length} observed account${liquidAccounts.length === 1 ? "" : "s"}` : "No observed depository balance"}</small></button>
      <button type="button" onClick={() => go("iris/decisions")}><span>REVOLVING DEBT</span><strong>{loading ? "…" : money(debt)}</strong><small>{creditAccounts.length ? `${creditAccounts.length} observed credit account${creditAccounts.length === 1 ? "" : "s"}` : "No observed revolving-debt balance"}</small></button>
      <button type="button" onClick={() => go("iris/state")}><span>ACCOUNTS</span><strong>{loading ? "…" : accounts.length || "—"}</strong><small>Persisted provider-linked accounts</small></button>
      <button type="button" onClick={() => go("iris/behavior")}><span>RECENT ACTIVITY</span><strong>{loading ? "…" : transactions.length || "—"}</strong><small>Observed transactions</small></button>
      <button type="button" onClick={() => go("iris/evidence")}><span>EVIDENCE DOMAINS</span><strong>{loading ? "…" : `${observed}/${DOMAINS.length}`}</strong><small>Observed provider domains</small></button>
    </div>
  </section>;
}
