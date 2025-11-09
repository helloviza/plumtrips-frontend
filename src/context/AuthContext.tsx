// apps/frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, type MeResponse } from "../lib/authApi";

type User = NonNullable<MeResponse["user"]>;
type AuthContextType = {
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await authApi.me();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // load session on first mount
    refresh();
  }, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  }

  async function register(fullName: string, email: string, password: string, phone?: string) {
    setLoading(true);
    try {
      const res = await authApi.register({ fullName, email, password, phone });
      setUser(res.user);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await authApi.logout();
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, refresh, login, register, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
