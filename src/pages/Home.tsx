// src/pages/Home.tsx
import type { ReactNode } from "react";
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
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden>
          <div className="ai-global-ring absolute left-1/2 top-1/2 h-[980px] w-[980px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        </div>

        <div className="relative z-[1] mx-auto max-w-6xl px-4 py-7">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
            {/* LEFT */}
            <div className="lg:col-span-7">
              <div className="relative max-w-[920px]">
                {/* Local glows */}
                <div
                  className="pointer-events-none absolute -left-20 -top-10 h-44 w-44 rounded-full bg-cyan-400/22 blur-3xl ai-pulse-slow"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute -right-16 top-6 h-56 w-56 rounded-full bg-emerald-400/18 blur-3xl ai-pulse-slower"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute left-1/3 top-20 h-32 w-32 -translate-x-1/2 rounded-full bg-indigo-400/18 blur-3xl ai-pulse-slow"
                  aria-hidden
                />
                <div
                  className="pointer-events-none ai-orbit-ring absolute -left-8 top-2 h-52 w-52 rounded-full border border-dashed border-cyan-200/22"
                  aria-hidden
                />

                {/* Header badges */}
                <div className="mb-2.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/16 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.9)] ai-pulse-dot" />
                    AI Travel OS
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/16 px-2.5 py-1 text-[10px] font-medium text-sky-100">
                    <span className="h-3 w-3 rounded-full bg-gradient-to-tr from-sky-300 to-cyan-200" />
                    Powered by pluto.ai
                  </span>

                  <span className="ml-auto hidden items-center gap-1 rounded-full bg-white/6 px-2 py-1 text-[10px] font-medium text-sky-100/90 sm:inline-flex">
                    <span className="h-1 w-4 rounded-full bg-gradient-to-r from-emerald-300 to-sky-300 ai-scan-beam" />
                    Live - sandbox preview
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-[18px] font-semibold leading-snug text-sky-50 sm:text-[21px] md:text-[23px]">
                  One AI-native workspace for{" "}
                  <span className="font-extrabold text-[#d06549]">
                    flights, hotels, visas & holidays
                  </span>
                  .
                </h1>

                {/* Copy */}
                <p className="mt-2 max-w-xl text-[11px] leading-relaxed text-sky-100/90 sm:text-[12px]">
                  Plumtrips is building a{" "}
                  <span className="font-semibold text-sky-50">travel operating system for B2B</span>: real-time content
                  from global suppliers, wrapped in a human UI and assisted by{" "}
                  <span className="font-semibold text-amber-200">pluto.ai</span> for policy-aware, exception-ready
                  journeys.
                </p>

                {/* Micro chips (icons + hyphen) */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[9.5px] font-medium text-sky-50/85">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-2 py-1 backdrop-blur-sm">
                    <ChipSparkIcon />
                    Gen-AI trip design
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-2 py-1 backdrop-blur-sm">
                    <ChipShieldCheckIcon />
                    Policy-aware fares
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-2 py-1 backdrop-blur-sm">
                    <ChipRouteIcon />
                    Supplier-agnostic routing
                  </span>
                </div>

                {/* AI action links */}
                <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <AIActionLink
                    href="https://www.plumtrips.in"
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
                    href="https://www.helloviza.com"
                    label="e-Visas"
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

                <p className="mt-4 text-[10px] leading-relaxed text-sky-50/72">
                  For now, booking flows run on{" "}
                  <span className="font-semibold text-amber-200">plumtrips.in</span> while we wire the full AI OS. Your
                  data and payments remain with our accredited engine partners.
                </p>
              </div>
            </div>

            {/* RIGHT */}
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
              "linear-gradient(to bottom, rgba(0,71,127,0.35) 0%, rgba(0,71,127,0.22) 40%, rgba(0,71,127,0.00) 100%)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-white/36 to-white/70" aria-hidden />
        <div className="relative z-[3]">
          <HomeExplore />
        </div>
      </section>

      {/* Local animations & AI visuals */}
      <style>{`
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
              rgba(125,211,252,0.85) 40deg,
              rgba(52,211,153,0.65) 70deg,
              rgba(125,211,252,0) 110deg,
              rgba(15,23,42,0) 360deg
            );
          mix-blend-mode: screen;
          box-shadow:
            0 0 110px rgba(56,189,248,0.24),
            0 0 220px rgba(37,99,235,0.18);
          animation: aiGlobalSpin 42s linear infinite;
          opacity: 0.52;
        }
        .ai-global-ring::before {
          content: "";
          position: absolute;
          inset: 12%;
          border-radius: 9999px;
          border: 1px dashed rgba(148,163,184,0.42);
          box-shadow: 0 0 34px rgba(148,163,184,0.26);
        }
        .ai-global-ring::after {
          content: "";
          position: absolute;
          inset: 30%;
          border-radius: 9999px;
          background: radial-gradient(circle, rgba(248,250,252,0.28), transparent 60%);
          opacity: 0.0;
          animation: aiGlobalPulse 5.8s ease-in-out infinite;
        }
        @keyframes aiGlobalPulse {
          0%,100% { opacity: 0.0; }
          40%     { opacity: 0.34; }
        }

        @keyframes aiOrbit { 0%{transform:rotate(0)} 100%{transform:rotate(360deg)} }
        .ai-orbit-ring{ animation: aiOrbit 26s linear infinite; transform-origin:50% 50% }
        @keyframes aiPulseSlow { 0%,100%{opacity:.22; transform:scale(1)} 50%{opacity:.46; transform:scale(1.06)} }
        .ai-pulse-slow{ animation: aiPulseSlow 11s ease-in-out infinite }
        .ai-pulse-slower{ animation: aiPulseSlow 16s ease-in-out infinite }
        @keyframes aiPulseDot { 0%,100%{transform:scale(.9);opacity:.6} 50%{transform:scale(1.2);opacity:1} }
        .ai-pulse-dot{ animation: aiPulseDot 1.4s ease-in-out infinite }
        @keyframes aiScanBeam { 0%{transform:translateX(-6px);opacity:.2} 50%{transform:translateX(0);opacity:1} 100%{transform:translateX(6px);opacity:.2} }
        .ai-scan-beam{ animation: aiScanBeam 2.4s ease-in-out infinite alternate }

        .ai-card::before{
          content:"";
          position:absolute;
          inset:0;
          border-radius:16px;
          background:
            radial-gradient(700px circle at 12% 0%, rgba(208,101,73,0.20), transparent 42%),
            radial-gradient(520px circle at 92% 30%, rgba(56,189,248,0.16), transparent 48%);
          opacity:0;
          transition: opacity 240ms ease;
          pointer-events:none;
        }
        .ai-card:hover::before{ opacity:1; }

        .ai-card::after{
          content:"";
          position:absolute;
          left:10px; right:10px; top:8px;
          height:1px;
          border-radius:9999px;
          background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.16), rgba(255,255,255,0));
          opacity:.6;
          pointer-events:none;
        }
      `}</style>
    </div>
  );
}

/* ---------- AI action card link ---------- */
function AIActionLink({
  href,
  label,
  caption,
  children,
}: {
  href: string;
  label: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className={[
        "ai-card group relative flex items-center gap-2.5 rounded-2xl",
        "border border-white/12 bg-white/7 px-2.5 py-2.5 backdrop-blur-md",
        "shadow-[0_10px_26px_rgba(0,0,0,0.16)] transition",
        "hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/18",
        "focus:outline-none focus:ring-2 focus:ring-[#d06549]/70",
      ].join(" ")}
      aria-label={`${label} (opens booking flow)`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-2xl bg-black/18 text-amber-100 ring-1 ring-white/12 group-hover:ring-white/24">
        {children}
      </span>

      <div className="min-w-0">
        <div className="truncate text-[13px] font-semibold text-sky-50">{label}</div>
        <div className="truncate text-[10.5px] text-sky-50/80">{caption}</div>
      </div>

      {/* GO pill (SVG arrow so it never becomes →) */}
      <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-sky-50 transition group-hover:border-[#d06549]/45 group-hover:bg-[#d06549] group-hover:text-white">
        Go
        <GoArrowIcon />
      </span>
    </a>
  );
}

function GoArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
      fill="none"
      aria-hidden
    >
      <path
        d="M5 12h12"
        className="stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M13 6l6 6-6 6"
        className="stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Micro chip icons ---------- */
function ChipSparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path
        d="M12 3l1.1 4.2L17 8.3l-3.3 2.3.9 4.1L12 12.7 9.4 14.7l.9-4.1L7 8.3l3.9-1.1L12 3z"
        className="fill-amber-200/90"
      />
      <path
        d="M19.5 4.5l.4 1.4 1.4.4-1.4.4-.4 1.4-.4-1.4-1.4-.4 1.4-.4.4-1.4z"
        className="fill-sky-200/80"
      />
    </svg>
  );
}

function ChipShieldCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path
        d="M12 4 7 6v5.6c0 3 2.1 5.4 5 6.3 2.9-.9 5-3.3 5-6.3V6l-5-2z"
        className="stroke-emerald-200/90"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 11.7 11.2 13.4 14.7 9.9"
        className="stroke-emerald-200/90"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChipRouteIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
      <path
        d="M7 7c0 1.1-.9 2-2 2S3 8.1 3 7s.9-2 2-2 2 .9 2 2zM21 17c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"
        className="fill-sky-200/85"
      />
      <path
        d="M5 7h9a4 4 0 0 1 4 4v1.5"
        className="stroke-sky-200/85"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.5 16.5h6.5a3 3 0 0 0 3-3V12"
        className="stroke-sky-200/55"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M7.5 16.5l1.6-1M7.5 16.5l1.6 1"
        className="stroke-sky-200/70"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
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
      <path
        d="M12 4 7 6v5.5c0 3.1 2.2 5.6 5 6.5 2.8-.9 5-3.4 5-6.5V6l-5-2z"
        className="stroke-emerald-200"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 11.5 11 13l3-3"
        className="stroke-emerald-200"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
