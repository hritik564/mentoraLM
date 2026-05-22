import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

// Use relative URL so the proxy handles it
setBaseUrl("");

export function configureAuthToken(token: string | null) {
  setAuthTokenGetter(() => token || "");
}
