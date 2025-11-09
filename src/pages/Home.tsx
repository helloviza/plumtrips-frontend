// src/pages/Home.tsx
import HeroCarousel from "../components/HeroCarousel";
import HomeExplore from "../components/home/HomeExplore";

export default function Home() {
  const heroBg = `
    linear-gradient(
      to bottom,
      rgba(0,71,127,1)    0%,
      rgba(0,71,127,1)    50%,
      rgba(0,71,127,0.85) 75%,
      rgba(0,71,127,0.70) 85%,
      rgba(0,71,127,0.55) 95%,
      rgba(0,71,127,0.35) 100%
    )
  `;

  return (
    <div className="relative">
      {/* HERO */}
      <div className="relative overflow-hidden text-white" style={{ background: heroBg }}>
        {/* === GLOBAL AI ENERGY RING (covers full hero) === */}
        <div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          aria-hidden
        >
          <div className="ai-global-ring absolute left-1/2 top-1/2 h-[1100px] w-[1100px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        </div>

        <div className="relative z-[1] mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-10">
            {/* LEFT: AI Actions */}
            <div className="lg:col-span-7">
              <div className="relative max-w-[960px]">
                {/* Local glows */}
                <div
                  className="pointer-events-none absolute -left-24 -top-12 h-56 w-56 rounded-full bg-cyan-400/22 blur-3xl ai-pulse-slow"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute -right-20 top-8 h-72 w-72 rounded-full bg-emerald-400/18 blur-3xl ai-pulse-slower"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute left-1/3 top-24 h-40 w-40 -translate-x-1/2 rounded-full bg-indigo-400/22 blur-3xl ai-pulse-slow"
                  aria-hidden
                />
                <div
                  className="pointer-events-none ai-orbit-ring absolute -left-10 top-3 h-64 w-64 rounded-full border border-dashed border-cyan-200/25"
                  aria-hidden
                />

                {/* Header badges */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.9)] ai-pulse-dot" />
                    AI Travel OS
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2.5 py-1 text-[11px] font-medium text-sky-100">
                    <span className="h-3 w-3 rounded-full bg-gradient-to-tr from-sky-300 to-cyan-200" />
                    Powered by pluto.ai
                  </span>
                  <span className="ml-auto hidden items-center gap-1 rounded-full bg-white/5 px-2 py-1 text-[10px] font-medium text-sky-100/90 sm:inline-flex">
                    <span className="h-1 w-4 rounded-full bg-gradient-to-r from-emerald-300 to-sky-300 ai-scan-beam" />
                    Live • sandbox preview
                  </span>
                </div>

                {/* Title & copy */}
                <h1 className="text-[22px] font-semibold leading-snug text-sky-50 sm:text-[26px] md:text-[28px]">
                  One AI-native workspace for{" "}
                  <span className="font-extrabold text-amber-300">
                    flights, hotels, visas & holidays
                  </span>
                  .
                </h1>
                <p className="mt-2 max-w-xl text-xs text-sky-100/80 sm:text-sm">
                  PlumTrips is building a{" "}
                  <span className="font-semibold text-sky-100">
                    travel operating system for B2B
                  </span>
                  : real-time content from global suppliers, wrapped in a human UI
                  and assisted by{" "}
                  <span className="font-semibold text-amber-200">pluto.ai</span>{" "}
                  for policy-aware, exception-ready journeys.
                </p>

                {/* Micro chips */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[10px] font-medium text-sky-100/70">
                  <span className="rounded-full bg-white/5 px-2 py-1">
                    • Gen-AI trip design
                  </span>
                  <span className="rounded-full bg-white/5 px-2 py-1">
                    • Policy-aware fares
                  </span>
                  <span className="rounded-full bg-white/5 px-2 py-1">
                    • Supplier-agnostic routing
                  </span>
                </div>

                {/* AI action links */}
                <div className="mt-6 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  <AIActionLink
                    href="https://www.plumtrips.in/flights"
                    label="AI Flight Engine"
                    caption="Search & book flights in real time"
                  >
                    <AIChipIcon />
                  </AIActionLink>

                  <AIActionLink
                    href="https://www.plumtrips.in/hotels"
                    label="AI Hotel Finder"
                    caption="Smart stays for teams & guests"
                  >
                    <AIHotelIcon />
                  </AIActionLink>

                  <AIActionLink
                    href="https://www.plumtrips.in/holidays"
                    label="Smart Holidays"
                    caption="Curated itineraries with human help"
                  >
                    <AIGlobeIcon />
                  </AIActionLink>

                  <AIActionLink
                    href="https://www.plumtrips.in/visa"
                    label="Visas & Compliance"
                    caption="Guided visa journeys & support"
                  >
                    <AIVisaIcon />
                  </AIActionLink>

                  <AIActionLink
                    href="https://www.plumtrips.in/bus"
                    label="Intercity Bus Travel"
                    caption="Pan-India routes for your travellers"
                  >
                    <AIBusIcon />
                  </AIActionLink>

                  <AIActionLink
                    href="https://www.plumtrips.in/insurance"
                    label="Travel Insurance"
                    caption="Coverage that moves with your people"
                  >
                    <AIShieldIcon />
                  </AIActionLink>
                </div>

                <p className="mt-5 text-[11px] leading-relaxed text-sky-100/70">
                  For now, booking flows run on{" "}
                  <span className="font-semibold text-amber-200">
                    plumtrips.in
                  </span>{" "}
                  while we wire the full AI OS. Your data and payments remain with
                  our accredited engine partners.
                </p>
              </div>
            </div>

            {/* RIGHT: Carousel */}
            <div className="lg:col-span-3">
              <HeroCarousel />
            </div>
          </div>
        </div>
      </div>

      {/* EXPLORE SECTION */}
      <section className="relative">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/home/explore-bg.jpg')" }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-[-1px] z-[2] h-6"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,71,127,0.35) 0%, rgba(0,71,127,0.25) 0%, rgba(0,71,127,0.00) 0%)",
          }}
          aria-hidden
        />
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-white/38 to-white/70"
          aria-hidden
        />
        <div className="relative z-[3]">
          <HomeExplore />
        </div>
      </section>

      {/* Local animations & AI visuals */}
      <style>{`
        /* Global hero energy ring */
        @keyframes aiGlobalSpin {
          0%   { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .ai-global-ring {
          border: 1px solid rgba(255,255,255,0.05);
          background:
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.12) 0, transparent 60%),
            conic-gradient(
              from 0deg,
              rgba(125,211,252,0) 0deg,
              rgba(125,211,252,0.9) 40deg,
              rgba(52,211,153,0.7) 70deg,
              rgba(125,211,252,0) 110deg,
              rgba(15,23,42,0) 360deg
            );
          mix-blend-mode: screen;
          box-shadow:
            0 0 120px rgba(56,189,248,0.3),
            0 0 260px rgba(37,99,235,0.25);
          animation: aiGlobalSpin 42s linear infinite;
          opacity: 0.55;
        }
        .ai-global-ring::before {
          content: "";
          position: absolute;
          inset: 12%;
          border-radius: 9999px;
          border: 1px dashed rgba(148,163,184,0.45);
          box-shadow: 0 0 40px rgba(148,163,184,0.35);
        }
        .ai-global-ring::after {
          content: "";
          position: absolute;
          inset: 30%;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(248,250,252,0.32), transparent 60%);
          opacity: 0.0;
          animation: aiGlobalPulse 5.8s ease-in-out infinite;
        }
        @keyframes aiGlobalPulse {
          0%,100% { opacity: 0.0; }
          40%     { opacity: 0.38; }
        }

        /* Existing artifacts */
        @keyframes aiOrbit { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
        .ai-orbit-ring{ animation: aiOrbit 26s linear infinite; transform-origin:50% 50% }
        @keyframes aiPulseSlow { 0%,100%{opacity:.22; transform:scale(1)} 50%{opacity:.46; transform:scale(1.06)} }
        .ai-pulse-slow{ animation: aiPulseSlow 11s ease-in-out infinite }
        .ai-pulse-slower{ animation: aiPulseSlow 16s ease-in-out infinite }
        @keyframes aiPulseDot { 0%,100%{transform:scale(.9);opacity:.6} 50%{transform:scale(1.2);opacity:1} }
        .ai-pulse-dot{ animation: aiPulseDot 1.4s ease-in-out infinite }
        @keyframes aiScanBeam { 0%{transform:translateX(-6px);opacity:.2} 50%{transform:translateX(0);opacity:1} 100%{transform:translateX(6px);opacity:.2} }
        .ai-scan-beam{ animation: aiScanBeam 2.4s ease-in-out infinite alternate }
      `}</style>
    </div>
  );
}

/* ---------- Simple AI action row link ---------- */

function AIActionLink({
  href,
  label,
  caption,
  children,
}: {
  href: string;
  label: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-3 rounded-xl px-2 py-3 transition hover:bg-white/5"
    >
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-black/20 text-amber-100 ring-1 ring-white/10 group-hover:ring-white/25">
        {children}
      </span>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-sky-50">
          {label}
        </div>
        <div className="truncate text-[11px] text-sky-100/75">{caption}</div>
      </div>
      <span className="ml-auto text-xs text-amber-100/80 transition group-hover:translate-x-0.5 group-hover:text-amber-50">
        Go →
      </span>
    </a>
  );
}

/* ---------- Tiny AI icons ---------- */

function AIChipIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <rect x="6" y="6" width="12" height="12" rx="3" className="stroke-amber-200" strokeWidth="1.4" />
      <rect x="10" y="10" width="4" height="4" rx="1" className="fill-amber-300" />
      <path d="M12 2v3M12 19v3M4 12h3M17 12h3" className="stroke-amber-200/80" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function AIHotelIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <rect x="5" y="8" width="14" height="10" rx="2" className="stroke-sky-200" strokeWidth="1.4" />
      <path d="M7 11h3M7 14h3M14 11h3M14 14h3" className="stroke-sky-200" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="12" cy="5" r="1.4" className="stroke-sky-200" strokeWidth="1.2" />
    </svg>
  );
}
function AIGlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <circle cx="12" cy="12" r="8" className="stroke-emerald-200" strokeWidth="1.4" />
      <path d="M4.5 10.5c2 .5 3.5.7 5.5-.5 1.5-.9 3-.9 4.5 0 1.7 1 3 1 5 0" className="stroke-emerald-200/80" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M9 7c0 4 1.5 6.5 3 6.5S15 11 15 7" className="stroke-emerald-100" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
function AIVisaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <rect x="4" y="6" width="16" height="12" rx="2" className="stroke-sky-200" strokeWidth="1.4" />
      <rect x="7" y="9" width="10" height="1.6" className="fill-sky-200/85" />
      <rect x="7" y="12" width="6" height="1.4" className="fill-sky-200/60" />
      <circle cx="17" cy="13.5" r="1.3" className="stroke-sky-200" strokeWidth="1.1" />
    </svg>
  );
}
function AIBusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <rect x="5" y="6" width="14" height="10" rx="2" className="stroke-sky-200" strokeWidth="1.4" />
      <path d="M7 9h4M13 9h4" className="stroke-sky-200/85" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="9" cy="17" r="1.3" className="fill-sky-100" />
      <circle cx="15" cy="17" r="1.3" className="fill-sky-100" />
    </svg>
  );
}
function AIShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
      <path d="M12 4 7 6v5.5c0 3.1 2.2 5.6 5 6.5 2.8-.9 5-3.4 5-6.5V6l-5-2z" className="stroke-emerald-200" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 11.5 11 13l3-3" className="stroke-emerald-200" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
