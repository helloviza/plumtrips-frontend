import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";

/** Types mirrored from backend payload */
type Band = "start" | "good" | "half" | "almost" | "complete";

type StepKey =
  | "verify_mobile"
  | "verify_email"
  | "passport"
  | "address"
  | "emergency_contact"
  | "2fa"
  | "backup_email"
  | "payment"
  | "co_traveller"
  | "prefs"
  | "gst";

type CompletionItem = {
  key: StepKey | "name" | "dob" | "gender" | "avatar";
  label: string;
  weight: number;
  completed: boolean;
};

type ProfileCompletion = {
  score: number;
  band: Band;
  nextStep?: {
    key: StepKey;
    label: string;
    reason: string;
    ctaText: string;
    target: string; // "/account/..." or "action:*"
  };
  breakdown: CompletionItem[];
  snoozed: string[];
};

export default function ProfileMeter() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [pc, setPc] = useState<ProfileCompletion | null>(null);
  const navigate = useNavigate();

  async function fetchPc() {
    setLoading(true);
    setErr(null);
    try {
      const data = await api.get<ProfileCompletion>(
        `/api/v1/me/profile-completion?ts=${Date.now()}`
      );
      setPc(data);
    } catch (e) {
      console.error(e);
      setErr("Couldn’t load your progress.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPc();
  }, []);

  const remaining = useMemo(() => {
    const items = pc?.breakdown?.filter((b) => !b.completed) || [];
    // Show the most valuable first
    return [...items].sort((a, b) => b.weight - a.weight).slice(0, 5);
  }, [pc]);

  function handleCTA() {
    const t = pc?.nextStep?.target || "";
    if (!t) return;

    // fire global events (wired in main.tsx)
    if (t === "action:openOtp") {
      window.dispatchEvent(new CustomEvent("plum:openOtp"));
      return;
    }
    if (t === "action:sendEmailVerification") {
      window.dispatchEvent(new CustomEvent("plum:sendEmailVerification"));
      return;
    }

    // otherwise navigate to the section
    if (t.startsWith("/")) {
      navigate(t);
    }
  }

  async function snooze() {
    if (!pc?.nextStep?.key) return;
    try {
      await api.post("/api/v1/me/profile-snooze", { key: pc.nextStep.key });
      await fetchPc();
    } catch (e) {
      console.error(e);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse rounded-xl border border-zinc-200 p-5">
        <div className="mb-4 h-5 w-48 rounded bg-zinc-200" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="h-32 rounded-xl bg-zinc-100" />
          <div className="h-32 rounded-xl bg-zinc-100" />
        </div>
      </div>
    );
  }

  if (err || !pc) {
    return (
      <div className="rounded-xl border border-zinc-200 p-5">
        <div className="text-sm text-red-600">{err || "Something went wrong."}</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-zinc-200 p-5">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-zinc-900">Profile completion</h3>
        <p className="text-sm text-zinc-600">
          Finish your profile to speed up booking and get smarter suggestions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Left: Elegant progress ring */}
        <div className="flex items-center gap-5">
          <ProgressRing value={pc.score} />
          <div className="text-sm text-zinc-600">
            {copyForBand(pc.band, pc.score)}
          </div>
        </div>

        {/* Right: Next step card */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Next step
          </div>
          {pc.nextStep ? (
            <>
              <div className="mb-1 text-lg font-semibold text-zinc-900">
                {pc.nextStep.label}
              </div>
              <div className="mb-4 text-sm text-zinc-600">{pc.nextStep.reason}</div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCTA}
                  className="rounded-xl bg-zinc-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black"
                >
                  {pc.nextStep.ctaText}
                </button>
                <button
                  onClick={snooze}
                  className="rounded-xl border border-zinc-300 bg-white px-5 py-2 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
                >
                  I’ll do this later
                </button>
              </div>
            </>
          ) : (
            <div className="text-sm text-emerald-700">
              🎉 All set—your profile is complete.
            </div>
          )}
        </div>
      </div>

      {/* What's left */}
      {remaining.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 text-sm font-semibold text-zinc-900">What’s left</div>
          <ul className="space-y-2">
            {remaining.map((i) => (
              <li key={`${i.key}`} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full bg-zinc-300" />
                  <span className="text-sm text-zinc-700">{i.label}</span>
                </div>
                <span className="text-sm tabular-nums text-zinc-500">{i.weight} pts</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Stylish SVG ring with gradient & rounded cap */
function ProgressRing({ value }: { value: number }) {
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const dash = (pct / 100) * c;

  return (
    <div className="relative h-[120px] w-[120px]">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="pcGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#111827" />
            <stop offset="100%" stopColor="#3f3f46" />
          </linearGradient>
        </defs>

        {/* track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#e5e7eb"
          strokeWidth={stroke}
          fill="none"
        />
        {/* progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#pcGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          fill="none"
        />
      </svg>

      {/* center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-extrabold text-zinc-900">{pct}%</div>
          <div className="text-xs text-zinc-500">progress</div>
        </div>
      </div>
    </div>
  );
}

function copyForBand(band: Band, score: number) {
  switch (band) {
    case "start":
      return "Let’s get you set up.";
    case "good":
      return "Great start—verify contacts next.";
    case "half":
      return "Halfway there—add key details to unlock faster checkout.";
    case "almost":
      return "Almost done—just a couple more steps.";
    case "complete":
      return `Fantastic—${score}% complete.`;
    default:
      return "";
  }
}
