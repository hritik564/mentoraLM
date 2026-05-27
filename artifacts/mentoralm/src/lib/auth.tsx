import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { UserPublic, useRefreshToken, useSignout, getMe } from "@workspace/api-client-react";
import { configureAuthToken, configureOn401Handler } from "./api";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  user: UserPublic | null;
  token: string | null;
  isLoading: boolean;
  signin: (token: string, user: UserPublic) => void;
  signout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const queryClient = useQueryClient();
  const refreshToken = useRefreshToken({ request: { credentials: "include" } });
  const signoutMutation = useSignout({ request: { credentials: "include" } });

  const handleSignout = useCallback(() => {
    signoutMutation.mutate(undefined, {
      onSettled: () => {
        setToken(null);
        setUser(null);
        configureAuthToken(null);
        queryClient.clear();
      }
    });
  }, [signoutMutation, queryClient]);

  useEffect(() => {
    // Wire up the 401 auto-refresh handler once on mount.
    // On success: update local token state + configureAuthToken (done inside api.ts).
    // On failure: sign the user out.
    configureOn401Handler(
      (newToken) => {
        setToken(newToken);
      },
      () => {
        setToken(null);
        setUser(null);
        configureAuthToken(null);
        queryClient.clear();
      }
    );
  }, [queryClient]);

  useEffect(() => {
    refreshToken.mutate(undefined, {
      onSuccess: async (data) => {
        setToken(data.accessToken);
        configureAuthToken(data.accessToken);
        try {
          const me = await getMe();
          setUser(me);
        } catch {
          setToken(null);
          configureAuthToken(null);
        }
      },
      onError: () => {
        setToken(null);
        setUser(null);
        configureAuthToken(null);
      },
      onSettled: () => {
        setIsLoading(false);
      }
    });
  }, []);

  const handleSignin = useCallback((newToken: string, newUser: UserPublic) => {
    setToken(newToken);
    setUser(newUser);
    configureAuthToken(newToken);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signin: handleSignin, signout: handleSignout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
