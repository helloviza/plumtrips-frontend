import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import m1 from "../../../public/mice/m12.jpeg";
import m2 from "../../../public/assets/mice/m2.jpeg";
import m3 from "../../../public/mice/a2.jpeg";
import m4 from "../../../public/mice/a9.jpeg";

/* ─── Brand ─────────────────────────────────────────── */
const BRAND = "#00477f";
const ACCENT = "#d06549";
const xyz = "#000000";

/* ─── Data ───────────────────────────────────────────── */
type EventKey = "Meetings" | "Incentives" | "Conferences" | "Exhibitions";

const EVENTS: Record<
  EventKey,
  {
    num: string;
    tagline: string;
    desc: string;
    bullets: string[];
    cta: string;
    img: string;
    imgAlt: string;
  }
> = {
  Meetings: {
    num: "01",
    tagline: "Run meetings that actually work",
    desc: "Leadership retreats, board offsites, or sales kick-offs — we handle every detail so your team stays focused on the agenda, not the logistics.",
    bullets: [
      "Venue & destination shortlisting",
      "Best-rate negotiation on rooms & flights",
      "Ground transfers & travel coordination",
      "On-site concierge support",
    ],
    cta: "Plan a meeting",
    img: m1,
    imgAlt: "Corporate meeting setup",
  },
  Incentives: {
    num: "02",
    tagline: "Reward your top performers",
    desc: "Turn results into experiences. We design high-impact incentive trips — from exotic getaways to luxury group travel — that motivate and retain your best people.",
    bullets: [
      "Custom itinerary design",
      "Premium hotel & resort sourcing",
      "Curated dining & experiences",
      "End-to-end group travel management",
    ],
    cta: "Explore incentives",
    img: m2,
    imgAlt: "Incentive travel destination",
  },
  Conferences: {
    num: "03",
    tagline: "Conferences built for impact",
    desc: "From intimate summits to multi-day global conferences, we manage the full picture — venue, tech, registration, and production — so every session runs flawlessly.",
    bullets: [
      "AV, staging & production partners",
      "Online registration + payment gateway",
      "Custom event microsite",
      "Catering & vendor coordination",
    ],
    cta: "Plan a conference",
    img: m3,
    imgAlt: "Conference auditorium",
  },
  Exhibitions: {
    num: "04",
    tagline: "Exhibitions that leave a mark",
    desc: "Expo floors, trade shows, product launches — we handle branding, signage, booth coordination, and on-site management so you show up looking your best.",
    bullets: [
      "Event branding & print design",
      "Signage & booth production",
      "Logistics & ground arrangements",
      "Full on-site management team",
    ],
    cta: "Explore exhibitions",
    img: m4,
    imgAlt: "Exhibition floor",
  },
};

const EVENT_KEYS: EventKey[] = ["Meetings", "Incentives", "Conferences", "Exhibitions"];

const PROCESS = [
  { step: "01", title: "Discovery", text: "Goals, audience, budget, and success metrics." },
  { step: "02", title: "Design", text: "Destinations, venues, agenda, and creative concept." },
  { step: "03", title: "Procure", text: "Rates negotiated, contracts finalized, compliance checks." },
  { step: "04", title: "Build", text: "Registration, travel blocks, production, show-flows." },
  { step: "05", title: "Deliver", text: "On-site ops, VIP care, issues resolved in real time." },
  { step: "06", title: "Debrief", text: "Reporting, ROI, and next-event recommendations." },
];

const STATS = [
  { kpi: "300+", label: "Events Delivered" },
  { kpi: "65+", label: "Cities Worldwide" },
  { kpi: "4.8/5", label: "Client Rating" },
  { kpi: "24×7", label: "Concierge Support" },
];

const WHY = [
  { icon: "/assets/mice1/x1.png", title: "Proven Delivery", text: "Board meetings to 2,000-delegate conferences — flawlessly executed every time." },
  { icon: "/assets/mice1/x6.png", title: "Negotiation Power", text: "Preferred rates through global hotel & airline partnerships for real savings." },
  { icon: "/assets/mice1/x3.png", title: "Creative Production", text: "Stage design, AV storytelling, and brand experiences your audience remembers." },
  { icon: "/assets/mice1/x2.png", title: "Global + Local", text: "Worldwide reach with local specialists to navigate culture, permits, and logistics." },
  { icon: "/assets/mice1/x5.png", title: "Risk Management", text: "Compliance, traveler safety, and contingency planning built in from day one." },
  { icon: "/assets/mice1/x4.png", title: "Concierge Support", text: "Dedicated PMO, VIP handling, and 24×7 traveler assistance throughout." },
];

const TESTIMONIALS = [
  {
    quote: "Flawless execution end-to-end. Our leadership summit felt premium without the premium headaches.",
    name: "R. Mehta",
    role: "Head of People, Fintech",
  },
  {
    quote: "From visas to venue design — the Plumtrips team anticipated every detail. Best incentive trip yet.",
    name: "L. D'Souza",
    role: "Sales Director, FMCG",
  },
];

// const LOGO_SLOTS = ["logo-1", "logo-2", "logo-3", "logo-4", "logo-5", "logo-6"];

/* ─── Sub-components ─────────────────────────────────── */
function CheckRow({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-0.5 flex-none inline-flex h-5 w-5 items-center justify-center rounded-full"
        style={{ background: ACCENT }}
      >
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none">
          <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-sm text-slate-600 leading-5">{text}</span>
    </li>
  );
}

function Icon({ children, size = 20 }: { children: ReactNode; size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl text-white flex-none"
      style={{ width: size, height: size, background: ACCENT, fontSize: size * 0.55 }}
    >
      {children}
    </span>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function MicePage() {
  const [active, setActive] = useState<EventKey>("Meetings");
  const ev = EVENTS[active];

  return (
    <main
      className="min-h-screen -mt-[124px] "
      style={{ background: "#f8fafc", fontFamily: "Poppins, sans-serif"  }}
    >
      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: 520 }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(/assets/mice/miceevents.png)` }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(125deg, ${xyz}ee 0%, ${xyz}99 30%, #1a6fa844 70%)`,
          }}
        />

        <div className="relative mx-auto mt-40 max-w-7xl px-4 sm:px-6 pt-20 pb-16 flex flex-col items-center text-center">
          <span
            className="inline-block px-4 py-1 rounded-full text-xs font-bold tracking-widest uppercase mb-5"
            style={{ background: `${ACCENT}33`, color: "#d06549", border: `1px solid ${ACCENT}66` }}
          >
            MICE — Corporate & Group Events
          </span>

          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight max-w-3xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            Events that move
            <br />
            <span style={{ color: "#d06549" }}>people forward</span>
          </h1>

          <p className="mt-5 text-white max-w-xl text-lg leading-relaxed">
            Meetings, Incentives, Conferences & Exhibitions — crafted with concierge precision from concept to applause.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {EVENT_KEYS.map((key) => (
              <button
                key={key}
                onClick={() => setActive(key)}
                className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200"
                style={
                  active === key
                    ? { background: ACCENT, color: "#fff", boxShadow: `0 4px 16px ${ACCENT}55` }
                    : { background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.25)" }
                }
              >
                {key}
              </button>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl py-4 text-center"
                style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
              >
                <div className="text-2xl font-extrabold text-white">{s.kpi}</div>
                <div className="text-xs text-white/65 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          EVENT DETAIL (tab-driven)
      ════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">

          <div className="relative">
            <div
              className="absolute -inset-2 rounded-3xl opacity-20"
              style={{ background: `linear-gradient(135deg, ${BRAND}, ${ACCENT})` }}
            />
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/3]">
              {EVENT_KEYS.map((key) => (
                <img
                  key={key}
                  src={EVENTS[key].img}
                  alt={EVENTS[key].imgAlt}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500"
                  style={{ opacity: key === active ? 1 : 0 }}
                />
              ))}
              <div
                className="absolute top-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-extrabold shadow-lg z-10"
                style={{ background: ACCENT }}
              >
                {ev.num}
              </div>
            </div>
          </div>

          <div>
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: ACCENT }}
            >
              {active}
            </span>
            <h2
              className="mt-2 text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              {ev.tagline}
            </h2>
            <p className="mt-4 text-slate-500 text-sm leading-relaxed max-w-md">{ev.desc}</p>

            <ul className="mt-6 space-y-3">
              {ev.bullets.map((b) => (
                <CheckRow key={b} text={b} />
              ))}
            </ul>

            <div className="mt-8 flex gap-3 flex-wrap">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white text-sm font-semibold transition-all hover:scale-105"
                style={{ background: ACCENT, boxShadow: `0 4px 18px ${ACCENT}44` }}
              >
                {ev.cta}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link
                to="/concierge"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold ring-1 ring-slate-200 bg-white hover:bg-slate-50 transition"
                style={{ color: BRAND }}
              >
                Free consultation
              </Link>
            </div>
          </div>
        </div>

        <div className="hidden md:grid grid-cols-4 gap-4 mt-12">
          {EVENT_KEYS.map((key) => {
            const isActive = key === active;
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className="rounded-2xl p-4 text-left transition-all border"
                style={
                  isActive
                    ? { borderColor: ACCENT, background: "#fff5f2", boxShadow: `0 0 0 1px ${ACCENT}` }
                    : { borderColor: "#e2e8f0", background: "#fff" }
                }
              >
                <span className="text-xs font-bold" style={{ color: isActive ? ACCENT : "#94a3b8" }}>
                  {EVENTS[key].num}
                </span>
                <div className="mt-1 font-semibold text-slate-800 text-sm">{key}</div>
                <div className="mt-0.5 text-xs text-slate-400 leading-4 line-clamp-2">{EVENTS[key].tagline}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW WE WORK
      ════════════════════════════════════════ */}
      <section
        className="py-16"
        style={{ background: `linear-gradient(135deg, ${BRAND}08, ${ACCENT}06)` }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
              Our Process
            </span>
            <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-slate-900">
              Six steps to extraordinary
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PROCESS.map((p, i) => (
              <div key={p.step} className="relative">
                {i < PROCESS.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-6 left-[calc(50%+24px)] right-[-50%] h-px"
                    style={{ background: `linear-gradient(90deg, ${ACCENT}40, transparent)` }}
                  />
                )}
                <div className="bg-white rounded-2xl p-4 text-center ring-1 ring-slate-100 shadow-sm relative">
                  <div
                    className="mx-auto w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-extrabold"
                    style={{ background: i === 0 ? ACCENT : BRAND }}
                  >
                    {p.step}
                  </div>
                  <div className="mt-3 font-bold text-slate-800 text-sm">{p.title}</div>
                  <div className="mt-1 text-xs text-slate-500 leading-4">{p.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          WHY PLUMTRIPS
      ════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
            Why us
          </span>
          <h2 className="mt-2 text-2xl md:text-3xl font-extrabold text-slate-900">
            What sets Plumtrips MICE apart
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {WHY.map((w) => (
            <div
              key={w.title}
              className="bg-white rounded-2xl p-5 ring-1 ring-slate-100 shadow-sm flex gap-4 hover:shadow-md transition-shadow"
            >
              <img src={w.icon} alt={w.title} className="w-10 h-10 mt-0.5 flex-none object-contain" />
              <div>
                <div className="font-bold text-slate-800 text-sm">{w.title}</div>
                <div className="mt-1 text-xs text-slate-500 leading-5">{w.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          EVENT MANAGEMENT HIGHLIGHT
      ════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div
          className="rounded-3xl overflow-hidden grid md:grid-cols-2 shadow-xl"
          style={{ background: BRAND }}
        >
          <div className="aspect-[4/3] md:aspect-auto overflow-hidden">
            <img
              src="/assets/mice/e2.jpeg"
              alt="Event management"
              loading="lazy"
              className="w-full h-full object-cover opacity-80"
            />
          </div>

          <div className="p-8 md:p-10 flex flex-col justify-center">
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "#ffb89a" }}>
              After the event
            </span>
            <h3 className="mt-3 text-2xl md:text-3xl font-extrabold text-white leading-tight">
              Support that doesn't stop
              <br />
              when the lights go down.
            </h3>
            <p className="mt-4 text-white/65 text-sm leading-relaxed">
              Budget reconciliation, ROI reporting, and cost-saving recommendations for your next program — we're your long-term MICE partner, not just a vendor.
            </p>
            <ul className="mt-6 space-y-2">
              {["Ongoing program support", "Detailed financial reporting", "Event ROI analysis", "Next-event planning"].map((x) => (
                <li key={x} className="flex items-center gap-2 text-sm text-white/80">
                  <span
                    className="inline-block w-4 h-4 rounded-full flex-none text-center leading-4 text-xs"
                    style={{ background: ACCENT, color: "#fff" }}
                  >
                    ✓
                  </span>
                  {x}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105"
                style={{ background: ACCENT, color: "#fff", boxShadow: `0 4px 18px ${ACCENT}55` }}
              >
                Free consultation
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          TESTIMONIALS
      ════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 ring-1 ring-slate-100 shadow-sm bg-white relative overflow-hidden"
            >
              <div
                className="absolute -top-3 -right-2 text-8xl font-extrabold leading-none select-none"
                style={{ color: `${ACCENT}12` }}
              >
                "
              </div>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: ACCENT }}>
                <path d="M7 7h5v5H9v5H4v-5c0-2.8 1-5 3-5zm10 0h5v5h-3v5h-5v-5c0-2.8 1-5 3-5z" fill="currentColor" />
              </svg>
              <blockquote className="mt-3 text-slate-700 text-sm leading-6 relative">
                "{t.quote}"
              </blockquote>
              <div className="mt-4 flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-none"
                  style={{ background: BRAND }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">{t.name}</div>
                  <div className="text-xs text-slate-400">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          RFP FORM
      ════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <div className="rounded-3xl bg-white p-6 md:p-10 ring-1 ring-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                Get started
              </span>
              <h3 className="mt-1 text-2xl font-extrabold text-slate-900">Request a proposal</h3>
              <p className="mt-1 text-slate-400 text-sm">Share the essentials — we'll come back with ideas & indicative budgets.</p>
            </div>
            <div className="flex gap-2 text-xs text-slate-400">
              <span className="px-3 py-1 rounded-full ring-1 ring-slate-200">No commitment</span>
              <span className="px-3 py-1 rounded-full ring-1 ring-slate-200">48h response</span>
            </div>
          </div>

          <form
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget as HTMLFormElement);
              console.log("MICE RFP:", Object.fromEntries((fd as any).entries()));
              alert("Thanks! Our MICE team will contact you shortly.");
            }}
          >
            {[
              { placeholder: "Full Name *", name: "name", required: true },
              { placeholder: "Company *", name: "company", required: true },
              { placeholder: "Email *", name: "email", type: "email", required: true },
              { placeholder: "Phone *", name: "phone", required: true },
              { placeholder: "Group Size (approx.)", name: "groupSize" },
              { placeholder: "Preferred Dates", name: "dates" },
              { placeholder: "City / Destination", name: "destination" },
              { placeholder: "Budget (₹) or range", name: "budget", colSpan: true },
            ].map(({ colSpan, type, ...field }) => (
              <input
                key={field.name}
                type={type || "text"}
                {...field}
                className={`mice-input${colSpan ? " md:col-span-2" : ""}`}
              />
            ))}

            <select className="mice-input" name="eventType" defaultValue="Meetings">
              {EVENT_KEYS.map((et) => (
                <option key={et} value={et}>{et}</option>
              ))}
            </select>

            <textarea
              className="mice-input md:col-span-2"
              placeholder="Notes — agenda highlights, venue preferences, production ideas…"
              name="notes"
              rows={3}
            />

            <div className="md:col-span-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full text-white text-sm font-semibold transition-all hover:scale-105"
                style={{ background: ACCENT, boxShadow: `0 4px 18px ${ACCENT}44` }}
              >
                Send request
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </section>

      <style>{`
        :root { --mice-accent: ${ACCENT}; --mice-brand: ${BRAND}; }
        .mice-input {
          width: 100%;
          border-radius: 0.875rem;
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          padding: 0.75rem 1rem;
          font-size: 14px;
          color: #1e293b;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          font-family: Poppins, sans-serif;
        }
        .mice-input::placeholder { color: #94a3b8; }
        .mice-input:focus {
          border-color: var(--mice-accent);
          background: #fff;
          box-shadow: 0 0 0 3px ${ACCENT}22;
        }
        select.mice-input { appearance: none; cursor: pointer; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </main>
  );
}