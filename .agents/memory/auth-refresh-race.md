---
name: Auth refresh race condition
description: onSettled fires before async onSuccess finishes getMe(), causing ProtectedRoute to redirect to login
---

## Rule
Never use `onSettled` to set `isLoading: false` when `onSuccess` is async.
Put `setIsLoading(false)` inside a `finally` block within `onSuccess`, and explicitly in `onError`.

## Why
React Query's `onSettled` fires immediately when the network request resolves — it does NOT wait for async work inside `onSuccess` to finish. So when `onSuccess` awaits `getMe()`, `onSettled` has already set `isLoading: false` with `user` still null. ProtectedRoute sees that state and redirects to login before the user is ever set.

## How to apply
Any time an auth init flow does async work after receiving the token (e.g. fetching the user profile), keep `isLoading: true` until that whole chain is done. Pattern:

```ts
refreshToken.mutate(undefined, {
  onSuccess: async (data) => {
    setToken(data.accessToken);
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      setToken(null);
    } finally {
      setIsLoading(false); // only here
    }
  },
  onError: () => {
    setToken(null);
    setUser(null);
    setIsLoading(false); // and here
  },
  // NO onSettled
});
```
