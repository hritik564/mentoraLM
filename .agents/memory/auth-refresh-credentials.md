---
name: Refresh cookie credentials
description: customFetch does not send cookies by default — refresh/signout hooks need credentials: "include"
---

## Rule
When calling `useRefreshToken` or `useSignout` from the generated API client, always pass `{ request: { credentials: "include" } }`.

## Why
The generated `refreshToken()` function calls `customFetch` which wraps the browser's `fetch`. By default, `fetch` does not send cookies. The httpOnly refresh token cookie is never attached unless `credentials: "include"` is explicitly passed. The 401 auto-refresh handler in api.ts already hardcodes this, but the initial on-mount refresh call went through the hook without it — causing every page reload to log the user out.

## How to apply
```ts
const refreshToken = useRefreshToken({ request: { credentials: "include" } });
const signoutMutation = useSignout({ request: { credentials: "include" } });
```
