// apps/frontend/src/components/RequireAuth.tsx
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { useUi } from "../context/UiContext";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth() as { user: any; loading?: boolean };
  const { authOpen, openAuth } = useUi();

  useEffect(() => {
    // If not logged in, open the popup (only once)
    if (!loading && !user && !authOpen) {
      openAuth("mobile");
    }
  }, [loading, user, authOpen, openAuth]);

  // While checking session, reserve space
  if (loading) return <div className="min-h-[40vh]" />;

  // Not logged in yet: keep page beneath, but don't render sensitive content
  if (!user) return <div className="min-h-[40vh]" />;

  // Logged in — render booking page
  return <>{children}</>;
}
