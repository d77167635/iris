import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./api/supabase";
import { Auth } from "./components/Auth";
import { IrisRawPlaidSupabaseSurface } from "./components/IrisRawPlaidSupabaseSurface";
import "./iris-ui.css";

function authCallbackKind() { return new URLSearchParams(window.location.search).get("iris_auth"); }
function isRecoveryUrl() {
  const p = new URLSearchParams(window.location.search);
  const h = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  return p.get("iris_auth") === "recovery" || p.get("type") === "recovery" || h.get("type") === "recovery" || p.has("code");
}
function clearAuthCallback() { window.history.replaceState(null, "", `${window.location.origin}${window.location.pathname}`); }

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);
  const [recovery, setRecovery] = useState(isRecoveryUrl());

  useEffect(() => {
    let active = true;
    const recoveryUrl = isRecoveryUrl();
    const callback = authCallbackKind();
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (recoveryUrl && data.session) setRecovery(true);
      if (callback === "confirmed" && data.session) clearAuthCallback();
      setCheckedAuth(true);
    }).catch(() => {
      if (active) {
        setSession(null);
        setCheckedAuth(true);
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY") setRecovery(true);
      setSession(newSession);
      if (event === "SIGNED_IN" && authCallbackKind() === "confirmed") clearAuthCallback();
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (!checkedAuth) return <main style={{ minHeight: "100dvh", background: "#050609" }} />;
  if (recovery && session) return <Auth recovery onRecoveryComplete={() => { setRecovery(false); clearAuthCallback(); }} />;
  if (!session) return <Auth />;
  return <IrisRawPlaidSupabaseSurface />;
}
