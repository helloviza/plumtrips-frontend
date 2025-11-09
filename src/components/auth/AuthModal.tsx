// apps/frontend/src/components/auth/AuthModal.tsx
import { useEffect, useMemo, useState } from "react";
import { useUi } from "../../context/UiContext";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

/** Bundled images (lives under src/assets) */
import s1 from "../../assets/auth/slide1.jpg";
import s2 from "../../assets/auth/slide2.jpg";
import s3 from "../../assets/auth/slide3.jpg";
import s4 from "../../assets/auth/slide4.jpg";
import s5 from "../../assets/auth/slide5.jpg";
import googleIcon from "../../assets/google.svg";

const SLIDES = [
  { src: s1, caption: "Lock Flight Prices & Pay Later" },
  { src: s2, caption: "Book Hotels at Exclusive Rates" },
  { src: s3, caption: "Best Deals on International Trips" },
  { src: s4, caption: "Visa Assistance Without Hassle" },
  { src: s5, caption: "MICE & Corporate Travel Experts" },
];

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

export default function AuthModal() {
  const {
    authOpen,
    authStep,
    authMode,           // "personal" | "biz"
    authModeLocked,     // true when opened from Business (hide Personal)
    closeAuth,
    setAuthStep,
    setAuthMode,
  } = useUi();
  const { login, register } = useAuth();

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const from = useMemo(
    () => (location.state as any)?.from || location.pathname + location.search || "/",
    [location]
  );

  // ---- modal a11y: lock scroll & ESC to close ----
  useEffect(() => {
    if (!authOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authOpen]);

  // ---- carousel logic (right side) ----
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!authOpen) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), 3000);
    return () => clearInterval(id);
  }, [authOpen]);

  // ---- Mobile step state ----
  const [cc, setCc] = useState("+91");
  const [mobile, setMobile] = useState("");
  const validMobile = useMemo(() => {
    const digits = mobile.replace(/\D/g, "");
    if (cc === "+91") return digits.length === 10;
    if (cc === "+971") return digits.length >= 9 && digits.length <= 10;
    if (cc === "+1") return digits.length === 10;
    return digits.length >= 8;
  }, [mobile, cc]);

  // ---- Email steps state ----
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  function onClose() {
    setErr(null);
    closeAuth();
  }

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email.trim(), password);
      onClose();
      navigate(from, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Login failed. Please check your credentials.");
    } finally {
      setBusy(false);
    }
  }

  async function handleEmailRegister(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await register(fullName.trim(), email.trim(), password, phone.trim() || undefined);
      onClose();
      navigate(from, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Registration failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function handleMobileContinue(e: React.FormEvent) {
    e.preventDefault();
    if (!validMobile) return;
    // TODO (Phase-2): request OTP, then show OTP input step
    setErr("Mobile OTP login coming soon. Use Email or Google for now.");
  }

  function handleGoogle() {
    const API = import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:8080";
    window.location.href = `${API}/api/oauth/google/start?from=${encodeURIComponent(from)}`;
  }

  if (!authOpen) return null;

  return (
    <div className="fixed inset-0 z-[200]" role="dialog" aria-modal="true" aria-labelledby="auth-title">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      {/* modal */}
      <div className="absolute left-1/2 top-1/2 w-full max-w-5xl -translate-x-1/2 -translate-y-1/2">
        <div className="relative mx-3 overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* close */}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 z-10 rounded-full bg-black/10 p-2 text-black/70 hover:bg-black/20"
            aria-label="Close"
          >
            ✕
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* LEFT: Forms */}
            <div className="relative p-6 md:p-8">
              {/* Tabs */}
              <div className="mb-6 flex gap-2">
                {authModeLocked ? (
                  // Opened from Business: show Biz only
                  <div className="rounded-full bg-[#0b5c99] px-4 py-2 text-sm font-semibold text-white shadow">
                    MYBIZ ACCOUNT
                  </div>
                ) : (
                  <>
                    <button
                      className={`rounded-full px-4 py-2 text-sm font-semibold shadow ${
                        authMode === "personal"
                          ? "bg-[#0b5c99] text-white"
                          : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                      }`}
                      onClick={() => {
                        setAuthMode("personal");
                        setAuthStep("mobile");
                      }}
                    >
                      PERSONAL ACCOUNT
                    </button>
                    <button
                      className={`rounded-full px-4 py-2 text-sm font-semibold shadow ${
                        authMode === "biz"
                          ? "bg-[#0b5c99] text-white"
                          : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
                      }`}
                      onClick={() => {
                        setAuthMode("biz");
                        setAuthStep("mobile");
                      }}
                    >
                      MYBIZ ACCOUNT
                    </button>
                  </>
                )}
              </div>

              {err && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

              {/* --- MOBILE STEP --- */}
              {authStep === "mobile" && (
                <form onSubmit={handleMobileContinue} className="space-y-4">
                  <label className="block">
                    <span className="mb-1 block text-sm font-medium text-zinc-800">Mobile Number</span>
                    <div className="flex">
                      <select
                        value={cc}
                        onChange={(e) => setCc(e.target.value)}
                        className="rounded-l-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-800 focus:outline-none"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+1">🇺🇸 +1</option>
                      </select>
                      <input
                        className={`w-full rounded-r-lg border px-3 py-2 outline-none ${
                          validMobile ? "border-zinc-300" : "border-red-400"
                        }`}
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        inputMode="tel"
                        placeholder="Enter Mobile Number"
                        required
                      />
                    </div>
                    {!validMobile && mobile && (
                      <p className="mt-1 text-xs text-red-600">Please enter a valid Mobile Number.</p>
                    )}
                  </label>

                  <button
                    type="submit"
                    disabled={!validMobile || busy}
                    className="w-full rounded-xl bg-zinc-300 py-2.5 font-semibold text-zinc-600 disabled:opacity-60"
                  >
                    CONTINUE
                  </button>

                  <div className="my-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-zinc-200" />
                    <span className="text-xs text-zinc-500">Or Login/Signup With</span>
                    <div className="h-px flex-1 bg-zinc-200" />
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    <button
                      type="button"
                      onClick={handleGoogle}
                      className="grid h-12 w-12 place-items-center rounded-full border border-zinc-300 bg-white hover:bg-zinc-50"
                      aria-label="Continue with Google"
                      title="Continue with Google"
                    >
                      <img src={googleIcon} className="h-6 w-6" alt="Google" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setAuthStep("emailLogin")}
                      className="grid h-12 w-12 place-items-center rounded-full border border-zinc-300 bg-white hover:bg-zinc-50"
                      aria-label="Continue with Email"
                      title="Continue with Email"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 4H4a2 2 0 00-2 2v.4l10 6.25L22 6.4V6a2 2 0 00-2-2z" />
                        <path d="M22 8.2l-9.44 5.89a1 1 0 01-1.12 0L2 8.2V18a2 2 0 002 2h16a2 2 0 002-2V8.2z" />
                      </svg>
                    </button>
                  </div>

                  <p className="mt-6 text-xs text-zinc-500">
                    By proceeding, you agree to PlumTrips’ Privacy Policy, User Agreement and T&Cs.
                  </p>
                </form>
              )}

              {/* --- EMAIL LOGIN STEP --- */}
              {authStep === "emailLogin" && (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <h2 id="auth-title" className="text-lg font-semibold text-zinc-900">
                    Sign in with Email
                  </h2>
                  <label className="block">
                    <span className="mb-1 block text-sm text-zinc-700">Email</span>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm text-zinc-700">Password</span>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-sky-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-900"
                        aria-label={showPw ? "Hide password" : "Show password"}
                      >
                        <EyeIcon open={showPw} />
                      </button>
                    </div>
                  </label>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-xl bg-[#00477f] py-2.5 font-semibold text-white hover:opacity-95 disabled:opacity-60"
                  >
                    {busy ? "Signing in…" : "Sign in"}
                  </button>
                  <div className="text-sm text-zinc-600">
                    Don’t have an account?{" "}
                    <button type="button" onClick={() => setAuthStep("emailRegister")} className="text-[#00477f] underline">
                      Create one
                    </button>
                  </div>
                </form>
              )}

              {/* --- EMAIL REGISTER STEP --- */}
              {authStep === "emailRegister" && (
                <form onSubmit={handleEmailRegister} className="space-y-4">
                  <h2 className="text-lg font-semibold text-zinc-900">Create your account</h2>
                  <label className="block">
                    <span className="mb-1 block text-sm text-zinc-700">Full name</span>
                    <input
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm text-zinc-700">Phone (optional)</span>
                    <input
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      inputMode="tel"
                      placeholder="+91XXXXXXXXXX"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm text-zinc-700">Email</span>
                    <input
                      type="email"
                      className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none focus:ring-2 focus:ring-sky-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-sm text-zinc-700">Password</span>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"}
                        className="w-full rounded-lg border border-zinc-300 px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-sky-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-900"
                        aria-label={showPw ? "Hide password" : "Show password"}
                      >
                        <EyeIcon open={showPw} />
                      </button>
                    </div>
                  </label>
                  <button
                    type="submit"
                    disabled={busy}
                    className="w-full rounded-xl bg-[#00477f] py-2.5 font-semibold text-white hover:opacity-95 disabled:opacity-60"
                  >
                    {busy ? "Creating your account…" : "Create account"}
                  </button>
                  <div className="text-sm text-zinc-600">
                    Already have an account?{" "}
                    <button type="button" onClick={() => setAuthStep("emailLogin")} className="text-[#00477f] underline">
                      Sign in
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* RIGHT: Carousel */}
            <div className="relative hidden md:block min-h-[560px] overflow-hidden">
              {SLIDES.map((s, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? "opacity-100" : "opacity-0"}`}
                >
                  <img src={s.src} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <h3 className="text-xl font-semibold drop-shadow">{s.caption}</h3>
                  </div>
                </div>
              ))}
              {/* dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full ${i === idx ? "bg-white" : "bg-white/50"}`}
                    onClick={() => setIdx(i)}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
