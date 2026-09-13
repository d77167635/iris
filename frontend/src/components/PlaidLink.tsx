import { useCallback, useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { api } from "../api/backend";

type Props = { onSuccess: () => void };
type Connection = { id: string; institution_name: string | null; status: string; last_synced_at: string | null };

export function PlaidLinkButton({ onSuccess }: Props) {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [loadingToken, setLoadingToken] = useState(false);
  const [openRequested, setOpenRequested] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  const loadConnections = useCallback(async () => {
    try {
      const res = await api.getPlaidConnections();
      setConnections(res.connections ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load connected institutions.");
    }
  }, []);

  useEffect(() => { void loadConnections(); }, [loadConnections]);

  const loadToken = useCallback(async () => {
    if (loadingToken || connecting) return;
    setLoadingToken(true);
    setError(null);
    try {
      const res = await api.createLinkToken();
      setLinkToken(res.link_token);
      setOpenRequested(true);
    } catch (err) {
      setLinkToken(null);
      setOpenRequested(false);
      setError(err instanceof Error ? err.message : "Couldn't start the connection. Try again.");
    } finally {
      setLoadingToken(false);
    }
  }, [connecting, loadingToken]);

  const handleSuccess = useCallback(async (publicToken: string) => {
    setConnecting(true);
    setError(null);
    try {
      await api.exchangePublicToken(publicToken);
      await loadConnections();
      onSuccess();
      setLinkToken(null);
      setOpenRequested(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Financial institution connection failed. Try again.");
    } finally {
      setConnecting(false);
    }
  }, [loadConnections, onSuccess]);

  const refreshExistingEvidence = useCallback(async () => {
    if (refreshing || connecting) return;
    setRefreshing(true);
    setError(null);
    try {
      await api.refreshPlaidConnections();
      await loadConnections();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Existing evidence could not be refreshed.");
    } finally {
      setRefreshing(false);
    }
  }, [connecting, loadConnections, onSuccess, refreshing]);

  const disconnect = useCallback(async (connection: Connection) => {
    if (disconnecting) return;
    const institution = connection.institution_name ?? "this financial institution";
    if (!window.confirm(`Disconnect ${institution}? Historical evidence already received by Iris will be preserved, but this connection will no longer refresh.`)) return;
    setDisconnecting(connection.id);
    setError(null);
    try {
      await api.disconnectPlaidConnection(connection.id);
      await loadConnections();
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The financial institution could not be disconnected.");
    } finally {
      setDisconnecting(null);
    }
  }, [disconnecting, loadConnections, onSuccess]);

  const { open, ready } = usePlaidLink({
    token: linkToken ?? "",
    onSuccess: handleSuccess,
  });

  useEffect(() => {
    if (!openRequested || !ready || !linkToken || connecting) return;
    setOpenRequested(false);
    open();
  }, [open, openRequested, ready, linkToken, connecting]);

  const activeConnections = connections.filter((connection) => connection.status !== "disconnected");

  return (
    <div className="plaid-connect-wrap">
      <button
        type="button"
        className="btn-accent plaid-connect-button"
        onClick={() => void loadToken()}
        disabled={connecting || refreshing}
        aria-busy={connecting || loadingToken}
      >
        {connecting ? "Connecting…" : loadingToken ? "Preparing secure connection…" : "Connect financial institution"}
      </button>

      {activeConnections.length > 0 && (
        <div className="plaid-existing-evidence" aria-label="Existing financial connections">
          <div className="plaid-existing-evidence-head">
            <strong>Existing evidence</strong>
            <button type="button" onClick={() => void refreshExistingEvidence()} disabled={refreshing || disconnecting !== null}>
              {refreshing ? "Refreshing…" : "Refresh existing evidence"}
            </button>
          </div>
          {activeConnections.map((connection) => (
            <div className="plaid-connection-row" key={connection.id}>
              <div>
                <b>{connection.institution_name ?? "Connected institution"}</b>
                <small>{connection.status === "active" ? "Connected" : `State: ${connection.status}`}{connection.last_synced_at ? ` · Last sync ${new Date(connection.last_synced_at).toLocaleString()}` : ""}</small>
              </div>
              <button type="button" onClick={() => void disconnect(connection)} disabled={disconnecting !== null || refreshing}>
                {disconnecting === connection.id ? "Disconnecting…" : "Disconnect"}
              </button>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="plaid-connect-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => void loadToken()} disabled={loadingToken}>Retry</button>
        </div>
      )}
    </div>
  );
}
