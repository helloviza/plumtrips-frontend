// apps/frontend/src/pages/auth/Login.tsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    // eye-off
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
        d="M3 3l18 18M10.584 10.587a3 3 0 104.243 4.243M9.88 4.24A10.477 10.477 0 0112 4.5c5.523 0 9.5 5.5 9.5 7.5a10.548 10.548 0 01-2.05 3.318M6.61 6.603A10.552 10.552 0 002.5 12c0 2 3.977 7.5 9.5 7.5 1.59 0 3.084-.35 4.4-.977" />
    </svg>
  ) : (
    // eye
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 12s3.75-7.5 9.75-7.5S21.75 12 21.75 12 18 19.5 12 19.5 2.25 12 2.25 12z" />
      <circle cx="12" cy="12" r="3.25" strokeWidth={1.5} />
    </svg>
  );
}

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as any)?.from || "/";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (e: any) {
      setErr(e.message || "Login failed. Please check your credentials.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(120deg,#001f33, #00477f_55%,#0a2540)] text-slate-100 flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-cyan-400/40 to-blue-500/40 blur"></div>
        <div className="relative rounded-3xl bg-white/10 backdrop-blur-xl shadow-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <img src="/assets/logo.png" alt="PlumTrips" className="h-8 w-auto" />
            <h1 className="text-xl font-semibold tracking-wide">Welcome back</h1>
          </div>

          {err && <div className="mb-4 rounded-lg bg-red-500/15 text-red-100 px-3 py-2 text-sm">{err}</div>}

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-200">Email</span>
              <input
                type="email"
                className="mt-1 w-full rounded-xl bg-white/15 text-white placeholder:text-slate-300 border border-white/20 px-3 py-2 outline-none focus:ring-2 focus:ring-cyan-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                placeholder="you@domain.com"
              />
            </label>

            <label className="block">
              <span className="text-sm text-slate-200">Password</span>
              <div className="mt-1 relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full rounded-xl bg-white/15 text-white placeholder:text-slate-300 border border-white/20 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-cyan-400"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-200 hover:text-white p-1"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  <EyeIcon open={showPw} />
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-2xl bg-[#FFD166] text-[#0b2540] py-2.5 font-semibold tracking-wide hover:opacity-95 disabled:opacity-60 shadow-lg"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-sm text-slate-200 flex items-center justify-between">
            <span>Don’t have an account?</span>
            <Link to="/auth/register" className="text-cyan-300 hover:underline" state={{ from }}>
              Create one
            </Link>
          </div>

          {/* Phase-2: Google / OTP buttons go here */}
        </div>
      </div>
    </div>
  );
}
