// apps/frontend/src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, type MeResponse, type MarketResponse } from "../lib/authApi";

type User = NonNullable<MeResponse["user"]>;
type MarketUser = NonNullable<MarketResponse["user"]>;
type AuthContextType = {
  user: User | MarketUser | null;
  loading: boolean;
  refresh: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  marketRefresh: () => Promise<void>;
  marketlogin: (email: string, password: string) => Promise<void>;
  marketlogout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<"user" | "market" | null>(() => {
  return localStorage.getItem("role") as any;
});
  const [user, setUser] = useState<User | MarketUser | null>(null);
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

async function marketRefresh() {
  try {
    const res = await authApi.marketMe();
    if (res.user) {
      setUser(res.user);
      setRole("market");
    } else {
      // session dead — clean up
      setUser(null);
      setRole(null);
      localStorage.removeItem("role");
    }
  } catch {
    setUser(null);
    setRole(null);
    localStorage.removeItem("role"); // ← clear stale role
  } finally {
    setLoading(false); // ← only false AFTER check completes
  }
}

 useEffect(() => {
  const savedRole = localStorage.getItem("role");
  if (savedRole === "market") {
    marketRefresh();
  } else {
    refresh();
  }
}, []);

  async function login(email: string, password: string) {
    setLoading(true);
    try {
      const res = await authApi.login({ email, password });
      setUser(res.user);
      setRole("user");
      localStorage.setItem("role", "user");
    } finally {
      setLoading(false);
    }
  }

  async function register(fullName: string, email: string, password: string, phone?: string) {
    setLoading(true);
    try {
      const res = await authApi.register({ fullName, email, password, phone });
      setUser(res.user);
      setRole("user");
      localStorage.setItem("role", "user");
    } finally {
      setLoading(false);
    }
  }
 
  async function logout() {
    await authApi.logout();
    setUser(null);
    setRole(null);
    localStorage.removeItem("role");
  }

  async function marketlogin(email: string, password: string) {
    setLoading(true);
    try {
      const res = await authApi.marketLogin({ email, password }); 
      setUser(res.user);
      setRole("market");
      localStorage.setItem("role", "market");
    } finally {
      setLoading(false);
    }
  } 

  async function marketlogout() {
    await authApi.marketLogout();
    setUser(null);
    setRole(null);
    localStorage.removeItem("role");
  }

  const value = useMemo(() => ({ user, loading, refresh, login, register, logout, marketRefresh, marketlogin, marketlogout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
