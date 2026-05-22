import { setBaseUrl, setAuthTokenGetter, setOn401Handler } from "@workspace/api-client-react";

// Use relative URL so the proxy handles it
setBaseUrl("");

// Module-level token cache — updated by configureAuthToken
let _currentToken: string | null = null;

export function configureAuthToken(token: string | null) {
  _currentToken = token;
  setAuthTokenGetter(() => _currentToken || "");
}

/**
 * Wire up the 401 auto-refresh handler.  Called once from AuthProvider after
 * the refresh function is available.  The handler performs a single-flight
 * token refresh using the httpOnly refresh-token cookie; on success it updates
 * the in-memory token and returns it so customFetch can replay the request.
 * On failure it returns null so the 401 propagates normally.
 */
export function configureOn401Handler(
  onRefreshSuccess: (token: string) => void,
  onRefreshFailure: () => void,
) {
  // Single-flight guard — only one refresh call in-flight at a time
  let refreshPromise: Promise<string | null> | null = null;

  setOn401Handler(async () => {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
          if (!res.ok) throw new Error("refresh failed");
          const data = (await res.json()) as { accessToken: string };
          _currentToken = data.accessToken;
          setAuthTokenGetter(() => _currentToken || "");
          onRefreshSuccess(data.accessToken);
          return data.accessToken;
        } catch {
          _currentToken = null;
          setAuthTokenGetter(() => "");
          onRefreshFailure();
          return null;
        } finally {
          refreshPromise = null;
        }
      })();
    }
    return refreshPromise;
  });
}
