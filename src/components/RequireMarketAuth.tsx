import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireMarketAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  // ← CRITICAL: don't redirect while session is still being verified
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/marketing-login" replace />;

  return <>{children}</>;
}