import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./api/supabase";
import { Auth } from "./components/Auth";
import { IrisFinancialLifeHome } from "./components/IrisFinancialLifeHome";
import { IrisCommandSurface } from "./components/IrisCommandSurface";
import { IrisIntelligenceSurface } from "./components/IrisIntelligenceSurface";
import { IrisCatalog } from "./components/IrisCatalog";
import { IrisReportsSurface } from "./components/IrisReportsSurface";
import { IrisDecisionSurface } from "./components/IrisDecisionSurface";
import { IrisChangeUnderstandSurface } from "./components/IrisChangeUnderstandSurface";
import { IrisActionSurface } from "./components/IrisActionSurface";
import { IrisActionOutcome } from "./components/IrisActionOutcome";
import { IrisEvidenceAccess } from "./components/IrisEvidenceAccess";
import { IrisExperienceShell } from "./components/IrisExperienceShell";
import { IrisWorkspaceSurface } from "./components/IrisWorkspaceSurface";
import { IrisScenarioSurface } from "./components/IrisScenarioSurface";
import { findWorkspace } from "./components/irisWorkspaceRegistry";
import "./iris-command-deck.css";
import "./components/IrisExperienceShell.css";
import "./iris-ui.css";
function readIrisPage() { const hash = window.location.hash.replace(/^#/, ""); if (hash === "workspace/iris" || hash === "workspace/iris/") return "iris"; if (hash.startsWith("workspace/")) return hash.slice("workspace/".length) || "iris"; return "iris"; }
function authCallbackKind() { return new URLSearchParams(window.location.search).get("iris_auth"); }
function isRecoveryUrl() { const p = new URLSearchParams(window.location.search); const h = new URLSearchParams(window.location.hash.replace(/^#/, "")); return p.get("iris_auth") === "recovery" || p.get("type") === "recovery" || h.get("type") === "recovery" || p.has("code"); }
function clearAuthCallback() { window.history.replaceState(null, "", `${window.location.origin}${window.location.pathname}`); }
function canonicalPage(page: string) { return page === "iris/simulation" ? "iris/scenarios" : page; }
export default function App() {
  const [session, setSession] = useState<Session | null>(null); const [checkedAuth, setCheckedAuth] = useState(false); const [recovery, setRecovery] = useState(isRecoveryUrl()); const [irisPage, setIrisPage] = useState(canonicalPage(readIrisPage())); const [signingOut, setSigningOut] = useState(false);
  useEffect(() => { let active = true; const recoveryUrl = isRecoveryUrl(); const callback = authCallbackKind(); supabase.auth.getSession().then(({ data }) => { if (!active) return; setSession(data.session); if (recoveryUrl && data.session) setRecovery(true); if (callback === "confirmed" && data.session) { clearAuthCallback(); setIrisPage("iris"); } setCheckedAuth(true); }).catch(() => { if (active) { setSession(null); setCheckedAuth(true); } }); const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => { if (!active) return; if (event === "PASSWORD_RECOVERY") setRecovery(true); setSession(newSession); if (event === "SIGNED_IN" && authCallbackKind() === "confirmed") { clearAuthCallback(); setIrisPage("iris"); } }); const sync = () => setIrisPage(canonicalPage(readIrisPage())); window.addEventListener("hashchange", sync); window.addEventListener("popstate", sync); return () => { active = false; listener.subscription.unsubscribe(); window.removeEventListener("hashchange", sync); window.removeEventListener("popstate", sync); }; }, []);
  const navigate = (page = "iris") => { const canonical = canonicalPage(page); const hash = canonical === "iris" ? "#workspace/iris" : `#workspace/${canonical}`; if (window.location.hash !== hash) window.location.hash = hash.slice(1); else setIrisPage(canonical); };
  const signOut = async () => { if (signingOut) return; setSigningOut(true); const { error } = await supabase.auth.signOut({ scope: "local" }); if (error) { setSigningOut(false); return; } window.location.replace("/"); };
  if (!checkedAuth) return <main className="iris4-screen"><div className="iris4-empty"><span>IRIS</span><strong>Checking your session…</strong><p>Authenticating securely.</p></div></main>;
  if (recovery && session) return <Auth recovery onRecoveryComplete={() => { setRecovery(false); clearAuthCallback(); navigate("iris"); }} />;
  if (!session) return <Auth />;
  const account = <div className="ia-account-control"><span aria-label="Signed-in account" className="ia-account-email">{session.user.email ?? "Signed in"}</span><button aria-label="Sign out" type="button" onClick={() => void signOut()} disabled={signingOut}>{signingOut ? "Signing out…" : "Sign out"}</button></div>;
  const isIntelligencePage = irisPage === "iris/intelligence" || irisPage.startsWith("iris/intelligence/"); const isScenarioPage = irisPage === "iris/scenarios"; const isSpecialPage = irisPage === "iris/connect" || irisPage === "iris/catalog" || irisPage === "iris/reports" || irisPage === "iris/action" || irisPage === "iris/outcomes" || irisPage === "iris/decisions" || irisPage === "iris/behavior" || irisPage === "iris/reasoning" || isIntelligencePage || isScenarioPage || irisPage === "iris/evidence" || irisPage === "iris/state"; const isRegisteredWorkspace = Boolean(findWorkspace(irisPage));
  let content;
  if (irisPage === "iris/connect") content = <IrisEvidenceAccess go={navigate} />;
  else if (irisPage === "iris/catalog") content = <IrisCatalog go={navigate} />;
  else if (irisPage === "iris/reports") content = <IrisReportsSurface go={navigate} />;
  else if (irisPage === "iris/decisions") content = <IrisDecisionSurface go={navigate} />;
  else if (irisPage === "iris/behavior") content = <IrisChangeUnderstandSurface mode="change" go={navigate} />;
  else if (irisPage === "iris/reasoning") content = <IrisChangeUnderstandSurface mode="understand" go={navigate} />;
  else if (irisPage === "iris/action") content = <IrisActionSurface go={navigate} />;
  else if (irisPage === "iris/outcomes") content = <IrisActionOutcome mode="outcomes" go={navigate} />;
  else if (isIntelligencePage) content = <IrisIntelligenceSurface page={irisPage} go={navigate} />;
  else if (isScenarioPage) content = <IrisScenarioSurface go={navigate} />;
  else if (irisPage === "iris") content = <IrisFinancialLifeHome go={navigate} />;
  else if (isSpecialPage) content = <IrisCommandSurface page={irisPage} go={navigate} />;
  else if (isRegisteredWorkspace) content = <IrisWorkspaceSurface page={irisPage} go={navigate} />;
  else content = <IrisWorkspaceSurface page={irisPage} go={navigate} />;
  return <IrisExperienceShell page={irisPage} go={navigate}><div className="app-workspace app-workspace-iris">{content}{account}</div></IrisExperienceShell>;
}
