// src/pages/Home.tsx
import type { ReactNode } from "react";
import HeroCarousel from "../components/HeroCarousel";
import HomeExplore from "../components/home/HomeExplore";
import SearchTabs from "../components/SearchTabs";

export default function Home() {
  return (
    <div className="relative">
      {/* ── HERO ──
          Pull the hero up by the header height (72px) so it sits behind
          the now-transparent header. The header is sticky/z-50 so it
          floats visually over the top of the hero image. */}
      <div className="relative text-white -mt-[72px]">

        {/* Hero background image with Ken-Burns zoom */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat hero-bg"
          style={{ backgroundImage: "url('/assets/jq.jpeg')" }}
          aria-hidden
        />

        {/* Subtle dark overlay — just enough for text legibility */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: `linear-gradient(
              160deg,
              rgba(0,40,80,0.58) 0%,
              rgba(0,55,105,0.44) 50%,
              rgba(0,30,60,0.28) 100%
            )`,
          }}
          aria-hidden
        />

        {/* Soft bottom fade so hero blends into the explore section */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-28"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.18) 70%, rgba(255,255,255,0.55) 100%)",
          }}
          aria-hidden
        />

        {/* Add pt-[72px] so the SearchTabs content starts BELOW the header,
            not hidden behind it */}
        <div className="relative z-[3] mx-auto max-w-6xl px-4 pt-[72px] pb-7">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
            {/* LEFT */}
            <div className="lg:col-span-7 overflow-visible">
              <SearchTabs />
            </div>

            {/* RIGHT */}
            <div className="lg:col-span-3">
              <HeroCarousel />
            </div>
          </div>
        </div>
      </div>

      {/* ── EXPLORE SECTION ── */}
      <section className="relative">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/home/em1.jpeg')" }}
          aria-hidden
        />
        {/* Top blend from hero */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, transparent 100%)",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-white/36 to-white/70" aria-hidden />
        <div className="relative z-[3]">
          <HomeExplore />
        </div>
      </section>

      {/* ── Styles ── */}
      <style>{`
        /* Ken-Burns slow zoom on the hero image */
        @keyframes heroBgZoom {
          0%   { transform: scale(1.00); }
          100% { transform: scale(1.06); }
        }
        .hero-bg {
          animation: heroBgZoom 18s ease-in-out infinite alternate;
          transform-origin: center center;
        }

        /* ── Shared card styles ── */
        .ai-white-card {
          background: rgba(255,255,255,0.88);
          border: 1px solid rgba(0,71,127,0.14);
          box-shadow: 0 18px 35px rgba(0,0,0,0.12);
          transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
        }
        .ai-white-card:hover {
          transform: translateY(-2px);
          background: rgba(255,255,255,0.86);
          border-color: rgba(0,71,127,0.24);
        }
        .ai-card-title  { color: rgba(17,24,39,0.96); }
        .ai-card-caption { color: rgba(31,41,55,0.78); }
        .ai-icon-wrap {
          background: rgba(17,24,39,0.06);
          border: 1px solid rgba(17,24,39,0.14);
          color: rgba(17,24,39,0.85);
        }
        .ai-go-pill {
          background: #00477f;
          color: #ffffff;
          border: 1px solid rgba(0,71,127,0.28);
          box-shadow: 0 10px 18px rgba(0,0,0,0.12);
        }
        .ai-white-chip {
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(0,71,127,0.16);
          box-shadow: 0 10px 18px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.35);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        .ai-white-chip-text { color: rgba(17,24,39,0.92); letter-spacing: 0.01em; }
        .ai-white-chip svg  { color: rgba(0,71,127,0.96); }

        .ai-brand-panel {
          position: relative;
          overflow: hidden;
          background: #d06549;
          border: 1px solid rgba(255,255,255,0.18);
          box-shadow: 0 26px 70px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.18);
        }
        .ai-brand-panel::before {
          content: "";
          position: absolute;
          inset: -1px;
          background:
            radial-gradient(900px circle at 12% 0%, rgba(255,255,255,0.18), transparent 45%),
            radial-gradient(750px circle at 88% 55%, rgba(0,71,127,0.12), transparent 52%),
            linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.06));
          opacity: 0.95;
          pointer-events: none;
        }
        .ai-brand-panel::after {
          content: "";
          position: absolute;
          inset: 10px;
          border-radius: 28px;
          border: 1px solid rgba(255,255,255,0.12);
          pointer-events: none;
          opacity: 0.6;
        }
        .ai-brand-panel > * { position: relative; z-index: 1; }
        .ai-brand-muted     { color: rgba(0,71,127,0.82); }
      `}</style>
    </div>
  );
}

/* ── AI action card link (unchanged API) ── */
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
        "ai-white-card group relative flex items-center gap-2.5 rounded-2xl",
        "px-2.5 py-2.5 backdrop-blur-md",
        "focus:outline-none focus:ring-2 focus:ring-[#00477f]/60",
      ].join(" ")}
      aria-label={`${label} (opens booking flow)`}
    >
      <span className="ai-icon-wrap grid h-9 w-9 place-items-center rounded-2xl">{children}</span>

      <div className="min-w-0">
        <div className="ai-card-title truncate text-[13px] font-extrabold">{label}</div>
        <div className="ai-card-caption truncate text-[10.5px] font-semibold">{caption}</div>
      </div>

      <span className="ai-go-pill ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold">
        Go <GoArrowIcon />
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
      <path d="M5 12h12" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
      <path d="M13 6l6 6-6 6" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// function ChipSparkIcon() {
//   return (
//     <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
//       <path d="M12 3l1.1 4.2L17 8.3l-3.3 2.3.9 4.1L12 12.7 9.4 14.7l.9-4.1L7 8.3l3.9-1.1L12 3z" fill="currentColor" opacity="0.95" />
//       <path d="M19.2 4.6l.35 1.2 1.2.35-1.2.35-.35 1.2-.35-1.2-1.2-.35 1.2-.35.35-1.2z" fill="currentColor" opacity="0.7" />
//     </svg>
//   );
// }

// function ChipShieldCheckIcon() {
//   return (
//     <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
//       <path d="M12 4 7 6v5.6c0 3 2.1 5.4 5 6.3 2.9-.9 5-3.3 5-6.3V6l-5-2z" className="stroke-current" strokeWidth="1.7" strokeLinejoin="round" opacity="0.95" />
//       <path d="M9.5 11.7 11.2 13.4 14.7 9.9" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
//     </svg>
//   );
// }

// function ChipRouteIcon() {
//   return (
//     <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" aria-hidden>
//       <circle cx="5" cy="7" r="2" fill="currentColor" opacity="0.9" />
//       <circle cx="19" cy="17" r="2" fill="currentColor" opacity="0.9" />
//       <path d="M7 7h8.5a4.5 4.5 0 0 1 4.5 4.5V13" className="stroke-current" strokeWidth="1.7" strokeLinecap="round" opacity="0.9" />
//       <path d="M7.5 16.5h7a3.5 3.5 0 0 0 3.5-3.5V12" className="stroke-current" strokeWidth="1.7" strokeLinecap="round" opacity="0.55" />
//       <path d="M7.5 16.5l1.6-1M7.5 16.5l1.6 1" className="stroke-current" strokeWidth="1.7" strokeLinecap="round" opacity="0.8" />
//     </svg>
//   );
// }

// function AIChipIcon() {
//   return (
//     <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
//       <rect x="6" y="6" width="12" height="12" rx="3" className="stroke-current" strokeWidth="1.4" opacity="0.95" />
//       <rect x="10" y="10" width="4" height="4" rx="1" fill="currentColor" opacity="0.85" />
//       <path d="M12 2v3M12 19v3M4 12h3M17 12h3" className="stroke-current" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
//     </svg>
//   );
// }

// function AIHotelIcon() {
//   return (
//     <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
//       <rect x="5" y="8" width="14" height="10" rx="2" className="stroke-current" strokeWidth="1.4" opacity="0.95" />
//       <path d="M7 11h3M7 14h3M14 11h3M14 14h3" className="stroke-current" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
//       <circle cx="12" cy="5" r="1.4" className="stroke-current" strokeWidth="1.2" opacity="0.8" />
//     </svg>
//   );
// }

// function AIGlobeIcon() {
//   return (
//     <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
//       <circle cx="12" cy="12" r="8" className="stroke-current" strokeWidth="1.4" opacity="0.95" />
//       <path d="M4.5 10.5c2 .5 3.5.7 5.5-.5 1.5-.9 3-.9 4.5 0 1.7 1 3 1 5 0" className="stroke-current" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
//       <path d="M9 7c0 4 1.5 6.5 3 6.5S15 11 15 7" className="stroke-current" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
//     </svg>
//   );
// }

// function AIVisaIcon() {
//   return (
//     <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
//       <rect x="4" y="6" width="16" height="12" rx="2" className="stroke-current" strokeWidth="1.4" opacity="0.95" />
//       <rect x="7" y="9" width="10" height="1.6" fill="currentColor" opacity="0.75" />
//       <rect x="7" y="12" width="6" height="1.4" fill="currentColor" opacity="0.55" />
//       <circle cx="17" cy="13.5" r="1.3" className="stroke-current" strokeWidth="1.1" opacity="0.7" />
//     </svg>
//   );
// }

// function AIBusIcon() {
//   return (
//     <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
//       <rect x="5" y="6" width="14" height="10" rx="2" className="stroke-current" strokeWidth="1.4" opacity="0.95" />
//       <path d="M7 9h4M13 9h4" className="stroke-current" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
//       <circle cx="9" cy="17" r="1.3" fill="currentColor" opacity="0.85" />
//       <circle cx="15" cy="17" r="1.3" fill="currentColor" opacity="0.85" />
//     </svg>
//   );
// }

// function AIShieldIcon() {
//   return (
//     <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
//       <path d="M12 4 7 6v5.5c0 3.1 2.2 5.6 5 6.5 2.8-.9 5-3.4 5-6.5V6l-5-2z" className="stroke-current" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
//       <path d="M9.5 11.5 11 13l3-3" className="stroke-current" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
//     </svg>
//   );
// }