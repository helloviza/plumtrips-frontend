import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";

/**
 * PlumTrips — MICE Page
 * - Translucent hero gradient + background image
 * - Event-type chips
 * - Services, Event Management, Value chips
 * - Why PlumTrips grid, Process, Testimonials, Logos, RFP form
 * - Brand accent: #d06549
 */

/* ----------------------- Brand ----------------------- */
const BRAND_PRIMARY = "#00477f";
const ACCENT = "#d06549";
const HERO_BG = "/assets/mice/hero.jpg"; // put your hero image here

/* --------------------- Page Data --------------------- */
type EventType = "Meetings" | "Incentives" | "Conferences" | "Exhibitions";
const EVENT_TYPES: EventType[] = [
  "Meetings",
  "Incentives",
  "Conferences",
  "Exhibitions",
];

const CORE_SERVICES = [
  "Determine your group’s requirements",
  "Venue & destination curation to fit your event",
  "Negotiate best room rates and airfares",
  "Travel & ground arrangements",
  "Production partners (AV, staging, registration)",
  "Caterer/vendor management",
  "Custom event microsite",
  "Design: event branding, signage, print",
  "Online registration + payment gateway",
  "On-site management",
  "Audio-visual management and more",
];

const VALUE_CHIPS = [
  "Budget Management",
  "Transparent Communication",
  "Expert Guidance",
  "Risk Mitigation",
  "Flexible Solutions",
  "Flawless Execution",
  "Strategic Partnerships",
  "Continuous Support",
];

const WHY_PLUMTRIPS = [
  {
    title: "Proven Delivery",
    text:
      "Track record across MICE programs—board meetings to 2,000-delegate conferences.",
  },
  {
    title: "Negotiation Power",
    text:
      "Preferred rates through global hotel & airline partnerships for real savings.",
  },
  {
    title: "Creative Production",
    text:
      "Stage design, AV storytelling, and brand experiences your audience remembers.",
  },
  {
    title: "Global + Local",
    text:
      "Worldwide reach with local specialists to navigate culture, permits, and logistics.",
  },
  {
    title: "Responsible Travel",
    text:
      "Vendor compliance, traveler safety, and optional carbon-aware planning.",
  },
  {
    title: "Concierge Support",
    text:
      "Dedicated PMO, VIP handling, and 24×7 traveler assistance throughout.",
  },
];

const PROCESS = [
  { step: "01", title: "Discovery", text: "Goals, audience, budget, and success metrics." },
  { step: "02", title: "Design", text: "Destinations, venues, agenda, and creative concept." },
  { step: "03", title: "Procure", text: "Rates negotiated, contracts finalized, compliance checks." },
  { step: "04", title: "Build", text: "Registration, travel blocks, production, show-flows." },
  { step: "05", title: "Deliver", text: "On-site ops, VIP care, issues resolved in real time." },
  { step: "06", title: "Debrief", text: "Reporting, ROI, and next-event recommendations." },
];

const TESTIMONIALS = [
  {
    quote:
      "Flawless execution end-to-end. Our leadership summit felt premium without the premium headaches.",
    name: "R. Mehta",
    role: "Head of People, Fintech",
  },
  {
    quote:
      "From visas to venue design—the PlumTrips team anticipated every detail. Best incentive trip yet.",
    name: "L. D’Souza",
    role: "Sales Director, FMCG",
  },
];

/** Use named slots to avoid TS6133 unused index warning and keep stable keys */
const LOGO_SLOTS = ["logo-1", "logo-2", "logo-3", "logo-4", "logo-5", "logo-6"];

/* ----------------------- UI Bits --------------------- */
function Pill({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ring-1",
        active
          ? "text-white shadow-md"
          : "bg-white/5 text-white/90 hover:bg-white/15 ring-white/40",
      ].join(" ")}
      style={{ backgroundColor: active ? ACCENT : "transparent" }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      {label}
    </button>
  );
}

function CheckRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full"
        style={{ backgroundColor: ACCENT }}
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none">
          <path
            d="M5 13l4 4L19 7"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[15px] leading-6 text-slate-700">{text}</span>
    </li>
  );
}

function FeatureCard({
  title,
  text,
  icon,
}: {
  title: string;
  text: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
      <div
        className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: ACCENT }}
      >
        {icon}
      </div>
      <h4 className="text-lg font-bold text-slate-800">{title}</h4>
      <p className="mt-1 text-slate-600 text-[15px] leading-6">{text}</p>
    </div>
  );
}

function Stat({ kpi, label }: { kpi: string; label: string }) {
  return (
    <div className="rounded-2xl bg-white/90 p-5 ring-1 ring-slate-200 text-center">
      <div className="text-2xl font-extrabold" style={{ color: BRAND_PRIMARY }}>
        {kpi}
      </div>
      <div className="mt-1 text-sm text-slate-600">{label}</div>
    </div>
  );
}

/* ----------------------- Page ------------------------ */
export default function MicePage() {
  const [type, setType] = useState<EventType>("Meetings");

  const heroSubtitle = useMemo(
    () =>
      "MICE (Meetings, Incentives, Conferences & Exhibitions) with concierge precision — from concept to applause.",
    []
  );

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ============ HERO ============ */}
      <section
        className="relative w-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,102,161,0.55) 0%, rgba(11,112,180,0.45) 40%, rgba(11,123,200,0.35) 100%)",
        }}
      >
        <div className="absolute inset-0">
          <div
            className="h-full w-full bg-center bg-cover opacity-55"
            style={{ backgroundImage: `url(${HERO_BG})` }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-14">
          <h1 className="text-center text-4xl md:text-5xl font-extrabold tracking-tight text-[#00477f]">
            In the Realm of Tourism & Hospitality
          </h1>
          <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-white/80" />
          <p className="mx-auto mt-4 max-w-3xl text-center text-white/90">
            {heroSubtitle}
          </p>

          {/* Chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {EVENT_TYPES.map((et) => (
              <Pill key={et} label={et} active={type === et} onClick={() => setType(et)} />
            ))}
          </div>

          {/* Stats row */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat kpi="300+" label="Corporate Events" />
            <Stat kpi="65+" label="Cities Served" />
            <Stat kpi="4.8/5" label="Client Satisfaction" />
            <Stat kpi="24×7" label="Concierge Support" />
          </div>
        </div>
      </section>

      {/* ============ OVERVIEW + SERVICES ============ */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900">
              {type}: end-to-end expertise
            </h2>
            <p className="mt-3 text-slate-600 text-[15px] leading-6">
              Whether you’re planning a leadership retreat, a global sales kick-off, or an expo
              floor, our specialists combine destination knowledge, rate negotiation, and on-site
              mastery to deliver a premium, low-friction experience for your team and guests.
            </p>

            <ul className="mt-6 grid gap-3">
              {CORE_SERVICES.map((s) => (
                <CheckRow key={s} text={s} />
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="rounded-full px-6 py-3 text-white font-semibold"
                style={{ backgroundColor: ACCENT }}
              >
                Book Now
              </Link>
              <Link
                to="/concierge"
                className="rounded-full px-6 py-3 font-semibold ring-2 ring-slate-300 hover:bg-slate-50"
                style={{ color: BRAND_PRIMARY }}
              >
                Free Consultation
              </Link>
            </div>
          </div>

          {/* Image quilt */}
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-slate-200">
              <img
                className="h-full w-full object-cover"
                loading="lazy"
                src="https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1400&auto=format&fit=crop"
                alt="Concert production"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-2xl ring-1 ring-slate-200">
              <img
                className="h-full w-full object-cover"
                loading="lazy"
                src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop"
                alt="Incentive travel"
              />
            </div>
            <div className="aspect-square overflow-hidden rounded-2xl ring-1 ring-slate-200">
              <img
                className="h-full w-full object-cover"
                loading="lazy"
                src="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=1400&auto=format&fit=crop"
                alt="Business handshake"
              />
            </div>
            <div className="aspect-[3/2] overflow-hidden rounded-2xl ring-1 ring-slate-200">
              <img
                className="h-full w-full object-cover"
                loading="lazy"
                src="https://images.unsplash.com/photo-1503428593586-e225b39bddfe?q=80&w=1400&auto=format&fit=crop"
                alt="Conference session"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ EVENT MANAGEMENT ============ */}
      <section className="mx-auto max-w-7xl px-4 pb-6">
        <div className="text-center">
          <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900">Event Management</h3>
          <div className="mx-auto mt-3 h-1 w-20 rounded-full" style={{ backgroundColor: BRAND_PRIMARY }} />
        </div>

        <div className="mt-8 grid gap-8 md:grid-cols-[1fr,1.1fr]">
          <div className="rounded-3xl ring-1 ring-slate-200 overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1400&auto=format&fit=crop"
              alt="Handshake"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
            <p className="text-slate-600 text-[15px] leading-6">
              Our support extends beyond the event itself. We provide ongoing assistance, budget
              reconciliation, and detailed reporting. You’ll receive cost-saving recommendations for
              future events, ensuring financial control and continuous improvements across your
              program portfolio.
            </p>
            <ul className="mt-4 grid gap-2">
              {["Ongoing Help", "Financial Reporting", "Event Analysis", "Planning for the Future"].map(
                (x) => (
                  <CheckRow key={x} text={x} />
                )
              )}
            </ul>
            <div className="mt-6">
              <Link
                to="/contact"
                className="rounded-full px-6 py-3 text-white font-semibold"
                style={{ backgroundColor: ACCENT }}
              >
                Free Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ VALUE CHIPS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {VALUE_CHIPS.map((v) => (
            <div
              key={v}
              className="rounded-full px-4 py-3 text-sm font-semibold text-slate-800 ring-1 ring-slate-300 bg-white hover:bg-slate-50 flex items-center justify-between"
            >
              <span>{v}</span>
              <span className="ml-3 inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: ACCENT }} />
            </div>
          ))}
        </div>
      </section>

      {/* ============ WHY PLUMTRIPS ============ */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <h3 className="text-center text-2xl md:text-3xl font-extrabold text-slate-900">
          What Sets PlumTrips MICE Apart?
        </h3>
        <div className="mx-auto mt-3 h-1 w-20 rounded-full" style={{ backgroundColor: BRAND_PRIMARY }} />
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {WHY_PLUMTRIPS.map((f) => (
            <FeatureCard
              key={f.title}
              title={f.title}
              text={f.text}
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l3 6 6 .9-4.5 4.3L18 20l-6-3.2L6 20l1.5-6.8L3 8.9 9 8l3-6z"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="white"
                    opacity="0.95"
                  />
                </svg>
              }
            />
          ))}
        </div>
      </section>

      {/* ============ PROCESS TIMELINE ============ */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">How We Work</h3>
          <div className="mt-6 grid gap-6 md:grid-cols-3 lg:grid-cols-6">
            {PROCESS.map((p) => (
              <div key={p.step} className="text-center">
                <div
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white font-bold"
                  style={{ backgroundColor: BRAND_PRIMARY }}
                >
                  {p.step}
                </div>
                <div className="mt-3 font-semibold text-slate-800">{p.title}</div>
                <div className="mt-1 text-sm text-slate-600">{p.text}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="grid gap-6 md:grid-cols-2">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M7 7h5v5H9v5H4v-5c0-2.8 1-5 3-5zm10 0h5v5h-3v5h-5v-5c0-2.8 1-5 3-5z" fill={ACCENT} />
              </svg>
              <blockquote className="mt-3 text-slate-800 text-[15px] leading-7">
                “{t.quote}”
              </blockquote>
              <div className="mt-3 text-sm text-slate-600">
                — <span className="font-semibold">{t.name}</span>, {t.role}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ TRUSTED BY ============ */}
      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
          <div className="text-center text-slate-700 font-semibold">Trusted by teams from</div>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-6">
            {LOGO_SLOTS.map((slot) => (
              <div
                key={slot}
                className="flex h-16 items-center justify-center rounded-xl ring-1 ring-slate-200 bg-slate-50"
              >
                <span className="text-slate-500 text-sm">Your Logo</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ RFP FORM ============ */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">Request a Proposal</h3>
          <p className="mt-1 text-slate-600 text-sm">
            Tell us the essentials—we’ll come back with ideas and indicative budgets.
          </p>

          <form
            className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              console.log("MICE RFP:", Object.fromEntries((fd as any).entries()));
              alert("Thanks! Our MICE team will contact you shortly.");
            }}
          >
            <input className="mice-input" placeholder="Full Name *" name="name" required />
            <input className="mice-input" placeholder="Company *" name="company" required />
            <input className="mice-input" placeholder="Email *" name="email" type="email" required />
            <input className="mice-input" placeholder="Phone *" name="phone" required />
            <select className="mice-input" name="eventType" defaultValue="Meetings">
              {EVENT_TYPES.map((et) => (
                <option key={et} value={et}>
                  {et}
                </option>
              ))}
            </select>
            <input className="mice-input" placeholder="Group Size (approx.)" name="groupSize" />
            <input className="mice-input" placeholder="Preferred Dates" name="dates" />
            <input className="mice-input" placeholder="City / Destination" name="destination" />
            <input className="mice-input md:col-span-2" placeholder="Budget (₹) or range" name="budget" />
            <textarea
              className="mice-input md:col-span-2"
              placeholder="Notes (agenda highlights, venue preferences, production ideas)…"
              name="notes"
              rows={4}
            />
            <div className="md:col-span-2">
              <button
                type="submit"
                className="rounded-full px-6 py-3 text-white font-semibold"
                style={{ backgroundColor: ACCENT }}
              >
                Send Request
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Lightweight CSS (no Tailwind @apply) */}
      <style>{`
        :root { --mice-accent: ${ACCENT}; }
        .mice-input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(203 213 225);
          background: #fff;
          padding: 0.75rem 1rem;
          font-size: 15px;
          color: rgb(30 41 59);
          outline: none;
        }
        .mice-input::placeholder { color: rgb(148 163 184); }
        .mice-input:focus {
          border-color: transparent;
          box-shadow: 0 0 0 2px var(--mice-accent);
        }
      `}</style>
    </main>
  );
}
