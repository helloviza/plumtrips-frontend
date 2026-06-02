// // src/pages/Home.tsx
// import type { ReactNode } from "react";
import HeroCarousel from "../components/HeroCarousel";
// import HomeExplore from "../components/home/HomeExplore";
import SearchTabs from "../components/SearchTabs";

// export default function Home() {
//   return (
//     <div className="relative">
//       {/* ── HERO ──
//           Pull the hero up by the header height (72px) so it sits behind
//           the now-transparent header. The header is sticky/z-50 so it
//           floats visually over the top of the hero image. */}
//       <div className="relative text-white -mt-[72px]">

//         {/* Hero background image with Ken-Burns zoom */}
//         <div
//           className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat hero-bg"
//           style={{ backgroundImage: "url('/assets/jq.jpeg')" }}
//           aria-hidden
//         />

//         {/* Subtle dark overlay — just enough for text legibility */}
//         <div
//           className="absolute inset-0 z-[1]"
//           style={{
//             background: `linear-gradient(
//               160deg,
//               rgba(0,40,80,0.58) 0%,
//               rgba(0,55,105,0.44) 50%,
//               rgba(0,30,60,0.28) 100%
//             )`,
//           }}
//           aria-hidden
//         />

//         {/* Soft bottom fade so hero blends into the explore section */}
//         <div
//           className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-28"
//           style={{
//             background:
//               "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.18) 70%, rgba(255,255,255,0.55) 100%)",
//           }}
//           aria-hidden
//         />

//         {/* Add pt-[72px] so the SearchTabs content starts BELOW the header,
//             not hidden behind it */}
        // <div className="relative z-[3] mx-auto max-w-6xl px-4 pt-[72px] pb-7">
        //   <div className="grid grid-cols-1 gap-6 lg:grid-cols-10">
        //     {/* LEFT */}
        //     <div className="lg:col-span-7 overflow-visible">
        //       <SearchTabs />
        //     </div>

        //     {/* RIGHT */}
        //     <div className="lg:col-span-3">
        //       <HeroCarousel />
        //     </div>
        //   </div>
        // </div>
//       </div>

//       {/* ── EXPLORE SECTION ── */}
//       <section className="relative">
//         <div
//           className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
//           style={{ backgroundImage: "url('/assets/home/em1.jpeg')" }}
//           aria-hidden
//         />
//         {/* Top blend from hero */}
//         <div
//           className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-10"
//           style={{
//             background:
//               "linear-gradient(to bottom, rgba(255,255,255,0.50) 0%, transparent 100%)",
//           }}
//           aria-hidden
//         />
//         <div className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-white/36 to-white/70" aria-hidden />
//         <div className="relative z-[3]">
//           <HomeExplore />
//         </div>
//       </section>

//       {/* ── Styles ── */}
//       <style>{`
//         /* Ken-Burns slow zoom on the hero image */
//         @keyframes heroBgZoom {
//           0%   { transform: scale(1.00); }
//           100% { transform: scale(1.06); }
//         }
//         .hero-bg {
//           animation: heroBgZoom 18s ease-in-out infinite alternate;
//           transform-origin: center center;
//         }

//         /* ── Shared card styles ── */
//         .ai-white-card {
//           background: rgba(255,255,255,0.88);
//           border: 1px solid rgba(0,71,127,0.14);
//           box-shadow: 0 18px 35px rgba(0,0,0,0.12);
//           transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
//         }
//         .ai-white-card:hover {
//           transform: translateY(-2px);
//           background: rgba(255,255,255,0.86);
//           border-color: rgba(0,71,127,0.24);
//         }
//         .ai-card-title  { color: rgba(17,24,39,0.96); }
//         .ai-card-caption { color: rgba(31,41,55,0.78); }
//         .ai-icon-wrap {
//           background: rgba(17,24,39,0.06);
//           border: 1px solid rgba(17,24,39,0.14);
//           color: rgba(17,24,39,0.85);
//         }
//         .ai-go-pill {
//           background: #00477f;
//           color: #ffffff;
//           border: 1px solid rgba(0,71,127,0.28);
//           box-shadow: 0 10px 18px rgba(0,0,0,0.12);
//         }
//         .ai-white-chip {
//           background: rgba(255,255,255,0.72);
//           border: 1px solid rgba(0,71,127,0.16);
//           box-shadow: 0 10px 18px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.35);
//           backdrop-filter: blur(10px);
//           -webkit-backdrop-filter: blur(10px);
//         }
//         .ai-white-chip-text { color: rgba(17,24,39,0.92); letter-spacing: 0.01em; }
//         .ai-white-chip svg  { color: rgba(0,71,127,0.96); }

//         .ai-brand-panel {
//           position: relative;
//           overflow: hidden;
//           background: #d06549;
//           border: 1px solid rgba(255,255,255,0.18);
//           box-shadow: 0 26px 70px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.18);
//         }
//         .ai-brand-panel::before {
//           content: "";
//           position: absolute;
//           inset: -1px;
//           background:
//             radial-gradient(900px circle at 12% 0%, rgba(255,255,255,0.18), transparent 45%),
//             radial-gradient(750px circle at 88% 55%, rgba(0,71,127,0.12), transparent 52%),
//             linear-gradient(180deg, rgba(255,255,255,0.08), rgba(0,0,0,0.06));
//           opacity: 0.95;
//           pointer-events: none;
//         }
//         .ai-brand-panel::after {
//           content: "";
//           position: absolute;
//           inset: 10px;
//           border-radius: 28px;
//           border: 1px solid rgba(255,255,255,0.12);
//           pointer-events: none;
//           opacity: 0.6;
//         }
//         .ai-brand-panel > * { position: relative; z-index: 1; }
//         .ai-brand-muted     { color: rgba(0,71,127,0.82); }
//       `}</style>
//     </div>
//   );
// }

// /* ── AI action card link (unchanged API) ── */
// function AIActionLink({
//   href,
//   label,
//   caption,
//   children,
// }: {
//   href: string;
//   label: string;
//   caption: string;
//   children: ReactNode;
// }) {
//   return (
//     <a
//       href={href}
//       className={[
//         "ai-white-card group relative flex items-center gap-2.5 rounded-2xl",
//         "px-2.5 py-2.5 backdrop-blur-md",
//         "focus:outline-none focus:ring-2 focus:ring-[#00477f]/60",
//       ].join(" ")}
//       aria-label={`${label} (opens booking flow)`}
//     >
//       <span className="ai-icon-wrap grid h-9 w-9 place-items-center rounded-2xl">{children}</span>

//       <div className="min-w-0">
//         <div className="ai-card-title truncate text-[13px] font-extrabold">{label}</div>
//         <div className="ai-card-caption truncate text-[10.5px] font-semibold">{caption}</div>
//       </div>

//       <span className="ai-go-pill ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold">
//         Go <GoArrowIcon />
//       </span>
//     </a>
//   );
// }

// function GoArrowIcon() {
//   return (
//     <svg
//       viewBox="0 0 24 24"
//       className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
//       fill="none"
//       aria-hidden
//     >
//       <path d="M5 12h12" className="stroke-current" strokeWidth="2" strokeLinecap="round" />
//       <path d="M13 6l6 6-6 6" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
//     </svg>
//   );
// }

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



/**
 * Home.tsx — Plumtrips Landing Page
 *
 * TWO PLACEHOLDER SLOTS you can replace with your own components:
 *
 *   1. <FlightSearchWidget />  (line ~60)  — swap with your flight search component
 *   2. <TopFlightsCarousel />  (line ~75)  — swap with your flights carousel component
 *
 * Everything else is faithfully converted from the original HTML.
 */

import { useEffect, useRef, useState } from "react";


// ---------------------------------------------------------------------------
// Reveal hook — mirrors the IntersectionObserver from the original JS
// ---------------------------------------------------------------------------
const useReveal = () => {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("active");
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
};

// ---------------------------------------------------------------------------
// Main Home component
// ---------------------------------------------------------------------------
export default function Home() {
  useReveal();

  const heroImgRef = useRef<HTMLImageElement>(null);

  // ── Scroll-aware state so parent layout can pick this up if needed ──
  // (Keep this here in case you want to pass it down via context later)
  const [_scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Parallax on hero
  const handleHeroMouseMove = (e: React.MouseEvent) => {
    if (!heroImgRef.current) return;
    const moveX = (e.clientX - window.innerWidth / 2) * 0.005;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.005;
    heroImgRef.current.style.transform = `scale(1.1) translate(${moveX}px, ${moveY}px)`;
  };
  const handleHeroMouseLeave = () => {
    if (heroImgRef.current)
      heroImgRef.current.style.transform = "scale(1.1) translate(0,0)";
  };

  // Interactive card helpers
  const cardEnter = (
    e: React.MouseEvent,
    type: "orange" | "blue" = "orange"
  ) => {
    const el = e.currentTarget as HTMLElement;
    el.style.transform = "scale(1.03)";
    el.style.boxShadow =
      type === "orange"
        ? "0 10px 30px -5px rgba(208,101,73,0.3)"
        : "0 10px 30px -5px rgba(0,71,127,0.4)";
  };
  const cardLeave = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.transform = "";
    el.style.boxShadow = "";
  };

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .glass-panel { background: rgba(255,255,255,0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        .hero-gradient { background: linear-gradient(to bottom, rgba(0,48,89,0.45), rgba(26,28,30,0.15)); }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #003059; border-radius: 10px; }
        .reveal { opacity: 0; transform: translateY(30px); transition: all 0.6s cubic-bezier(0.165,0.84,0.44,1); }
        .reveal.active { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) {
          .reveal { transition: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>

      <div
        className="bg-[#f9f9fc] text-[#1a1c1e] overflow-x-hidden"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* ================================================================
            HERO SECTION
            KEY CHANGE: -mt-[72px] pulls the hero up behind the sticky
            transparent header (same as the first file).
            pt-[72px] inside the content area pushes content back down so
            it's not hidden behind the header.
        ================================================================ */}
        <div
          className="relative flex flex-col overflow-hidden -mt-[72px]"
          style={{ minHeight: 800 }}
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
        >
          {/* Background */}
          <div className="absolute inset-0 z-0">
            <img
              ref={heroImgRef}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPrdPFPE8eNavLsNhU40Vr6HgI6m6zUFGkKy7pMsMq6f7mll2KFuCsho_t5W0X0nniQXQIiVeXavDh_DPHCYMYIc0vv75xa6PUV13_Mu-rZjBln8Ci_jFfWpkStL4seYnTwcW4S1fYr70VC2NSM8MfRyBdlBj5x-SGzva53bTVO5colVAd-V3hKXlT0_W8-Gb8YWjzDDD2yNpUjLZ46kLTmEAITKba_8Y8JiIpVPiY5Lztat_8ytxVUyZCuYO4LKE77OrsjG5c3cnO"
              alt="Panoramic mountain view"
              className="w-full h-full object-cover brightness-75 transition-transform duration-[10000ms]"
              style={{ transform: "scale(1.1) translate(0px,0px)" }}
            />
            <div className="absolute inset-0 hero-gradient" />

            {/* Soft bottom fade so hero blends into the section below */}
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-28"
              style={{
                background:
                  "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.18) 70%, rgba(255,255,255,0.55) 100%)",
              }}
              aria-hidden
            />
          </div>

          {/* Hero content
              pt-[72px] = header height offset so SearchTabs starts BELOW the header
              Additional pt-8 gives breathing room above the widget             */}
          <div className="relative z-10 flex-grow flex items-center w-full">
            <div className="relative z-[3] mx-auto max-w-6xl w-full px-6 pt-[88px] pb-16">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-10 items-start">

                {/* LEFT — SearchTabs */}
                <div className="lg:col-span-7">
                  <div className="reveal" style={{ transitionDelay: "0.08s" }}>
                    <SearchTabs />
                  </div>
                </div>

                {/* RIGHT — HeroCarousel */}
                <div
                  className="lg:col-span-3 lg:mt-14 reveal"
                  style={{ transitionDelay: "0.12s" }}
                >
                  <HeroCarousel />
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ================================================================
            CONTENT SECTIONS
        ================================================================ */}
        <div className="relative w-full bg-white">
          <section className="py-20 px-6">
            <div className="max-w-[1280px] mx-auto">

              {/* Section heading */}
              <div className="flex justify-between items-center mb-10 border-l-4 border-[#003059] pl-4 reveal">
                <h2
                  className="font-bold text-[#1a1c1e]"
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 32,
                    lineHeight: 1.3,
                  }}
                >
                  Explore more with Plumtrips
                </h2>
                <button className="flex items-center gap-2 text-[#003059] font-bold hover:underline group transition-all duration-300 hover:scale-105">
                  View offers{" "}
                  <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform duration-300">
                    arrow_right_alt
                  </span>
                </button>
              </div>

              {/* ── Bento Grid Destinations ── */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-20">
                <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9Pd-tYI0uGNsPn2qn8bwIMMqFjtX9s3d3QUxL9xJcvwuefH96BFAiGWoO03Sj4AvTcmQLE5rkuDyu5TXn40bgVbaZRXydEGyPWeWBO2HpUkRRN6jeVGnoXV9sSrbrs3f7jxZJVNuPbE-A1gWKqnJj08eHxScu_yJYqG1bCMlNPDOQasV9DtStNKATIryxYT3NSxucQrb4Wo7i45F5nZcB8SLk9xjkqXZORhMIP_Bf5aLdTEXMbDjwVv7AuAfzWN48pY56fvi6NyUg",
                      alt: "Qatar",
                      tags: ["Holidays", "Qatar Packages"],
                      title: "Best Of Qatar",
                      sub: "Visit Doha",
                      delay: "0.05s",
                    },
                    {
                      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCMWznJ9cY4YSdKBd2Q_2wexZ-NOk_EcA1CmHDwJSOLdW5mU73A2ZGEWdH9QO_-bhhpPszsLkaZlrDpp_S8jghD6llS76vOJJ7u-pIYnnRNCyFokmUzAi92II7AJoMt9rIxVVVC7rurHAGiAYFlke4KXb8uSzbFJ_ckZn_0vHIsosvmek9_JxxfKxDHDDVpqnyaJzrSG1bVl97RAV62yavwbjt9xG4j93WkKLo8R2Bg_6K_nzBXRki0ltAua4hkSlwNXmHIxcmd5bC9",
                      alt: "Hong Kong",
                      tags: ["Holidays", "Hong Kong Packages"],
                      title: "Discover Hong Kong",
                      sub: "Visit Hong Kong",
                      delay: "0.1s",
                    },
                    {
                      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtzDJdP9pfLtVZDvFOJOEHeNMZPLyipGk2cn0BjwDIAZGhyz9A_sGno5r8O_J7OxCJGPvUloUGeNTsD6Z4Vprss-xYeNH-4bskyEAOogVc8EaxYwGw4xe8aM5wHLyVfaLEk7B-iqB_e9QxSgy7aEELSDqpPLbY6nbZjKleCE_-2Xfg-vLhBMRVLqOrU1U_kL7iKkwrR8viQ3A3XVvad8KFLGGH2L6A6xpO8P0_02qY-scd_rfenALOkcj-yiv_2RHvnVCqvjiaLkqf",
                      alt: "Group Departures",
                      tags: ["Holidays", "Group Departures"],
                      title: "Group Departures",
                      sub: "Thailand, Vietnam, Bali",
                      delay: "0.15s",
                    },
                  ].map((d) => (
                    <div
                      key={d.title}
                      className="rounded-3xl overflow-hidden relative group aspect-[3/4] shadow-lg h-full cursor-pointer reveal"
                      style={{
                        transition: "all 0.5s cubic-bezier(0.165,0.84,0.44,1)",
                        transitionDelay: d.delay,
                      }}
                      onMouseEnter={cardEnter}
                      onMouseLeave={cardLeave}
                    >
                      <img
                        src={d.img}
                        alt={d.alt}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                        <span className="bg-[#febb3c] text-[#412b00] font-bold px-3 py-1 rounded-full uppercase text-[10px]">
                          {d.tags[0]}
                        </span>
                        <span className="bg-[#00477f] text-[#86b6f5] font-bold px-3 py-1 rounded-full uppercase text-[10px]">
                          {d.tags[1]}
                        </span>
                      </div>
                      <div className="absolute bottom-6 left-6 right-6">
                        <h3
                          className="font-bold text-white group-hover:translate-x-2 transition-transform duration-500"
                          style={{
                            fontFamily: "Montserrat, sans-serif",
                            fontSize: 24,
                          }}
                        >
                          {d.title}
                        </h3>
                        <p className="text-white/80">{d.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Items Stack */}
                <div
                  className="lg:col-span-3 space-y-4 flex flex-col reveal"
                  style={{ transitionDelay: "0.2s" }}
                >
                  {/* Subscribe card */}
                  <div
                    className="bg-[#d06549] p-6 rounded-3xl shadow-lg cursor-pointer flex-grow flex flex-col justify-between group"
                    style={{
                      transition: "all 0.5s cubic-bezier(0.165,0.84,0.44,1)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform =
                        "scale(1.05)";
                      (
                        e.currentTarget as HTMLElement
                      ).style.boxShadow =
                        "0 15px 35px -5px rgba(208,101,73,0.4)";
                    }}
                    onMouseLeave={cardLeave}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:rotate-12 transition-transform">
                        <span className="material-symbols-outlined">mail</span>
                      </div>
                      <h4 className="font-bold text-white text-xs leading-tight">
                        Get our best offers by email
                      </h4>
                    </div>
                    <button className="w-full bg-white text-[#d06549] py-3 rounded-xl font-bold text-xs hover:bg-white/90 transition-all uppercase">
                      Subscribe
                    </button>
                  </div>

                  {/* Quick links */}
                  {[
                    { icon: "airplane_ticket", label: "Reprint ticket" },
                    { icon: "luggage", label: "Baggage info" },
                    { icon: "help", label: "FAQ" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-4 rounded-3xl border border-[#c2c7d1]/30 flex items-center justify-between group cursor-pointer"
                      style={{
                        background:
                          "linear-gradient(145deg, #004e8b, #004072)",
                        transition:
                          "all 0.5s cubic-bezier(0.165,0.84,0.44,1)",
                      }}
                      onMouseEnter={(e) => cardEnter(e, "blue")}
                      onMouseLeave={cardLeave}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 group-hover:bg-white/20 transition-colors">
                          <span className="material-symbols-outlined text-lg text-white/90">
                            {item.icon}
                          </span>
                        </div>
                        <h4 className="font-bold text-xs text-white">
                          {item.label}
                        </h4>
                      </div>
                      <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform text-white/90 text-lg">
                        chevron_right
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Stopover Packages ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
                {[
                  {
                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQG2C4XzfvG1KkGgwI3MJB98rZl8DRkrq3ANqSGj9swjXP1cu4kYKq71-J79UhhWW1TmU9L2wnSUAPbxYJ4XuLfyP2h1GRbNahGidpNtklm3zRA_8mXQ8o07dp0UPnGV4dcuzE6ql-HTvDA9HO_tg4UwcXq0_vC3LSYngC-qjXT6XffQZE9R1uXIvibFHpyFyXpfTI0akRWstmj5Ag2qkPJaQs-JBer2gBUjlMC8ec6rDUDBjJ1NDn-6PsM6SfU8C8J-AQM40dIloT",
                    tag: "Dubai Stopover",
                    alt: "Dubai",
                    title: "Dubai Stopover Package",
                    sub: "Experience the magic of the Emirates.",
                    cta: "Visit Dubai",
                    delay: "0.1s",
                  },
                  {
                    img: "https://img.magnific.com/premium-photo/riyadh-city-skyline-drone-shoot-drone-shot-king-fahd-road-riyadh-capital-city-saudi-arabia_430468-1471.jpg",
                    tag: "Saudi Packages",
                    alt: "Saudi Arabia",
                    title: "Spectacular Saudi Arabia",
                    sub: "Riyadh, AlUla & Jeddah",
                    cta: "Explore",
                    delay: "0.2s",
                  },
                  {
                    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDF2wIBP4s5V-SA--OLqFYi_x4kzSdIF60R9GKMsdNe3pt2tNYqDXsoMvYMUUgoyBO0JxmvBO6TEIKvOIcL8cylCq4QrlqnHzJRrSrqir0Z194TDQSyVONvP-xFPJkOM6OwF5v8-2o8DkCYTHEB2JhKxf4fNZB_u6ePCHa-RucVWkBx2jpb4w9o5WBuADxlIVqXdn5aFfhzAYn-ICHXiuXyV4odBJ2kyddHEEY6lX7gT-5iJdmFscNJzrtO9gTTGrj_kyczyvBxngpY",
                    tag: "Qatar Stopover",
                    alt: "Qatar Stopover",
                    title: "Qatar Stopover Package",
                    sub: "Luxury meets tradition in Doha.",
                    cta: "Visit Qatar",
                    delay: "0.3s",
                  },
                ].map((pkg) => (
                  <div
                    key={pkg.title}
                    className="bg-white rounded-3xl overflow-hidden border border-[#c2c7d1]/30 cursor-pointer reveal"
                    style={{
                      transition: "all 0.5s cubic-bezier(0.165,0.84,0.44,1)",
                      transitionDelay: pkg.delay,
                    }}
                    onMouseEnter={cardEnter}
                    onMouseLeave={cardLeave}
                  >
                    <div className="h-64 relative overflow-hidden">
                      <img
                        src={pkg.img}
                        alt={pkg.alt}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                      />
                      <div className="absolute top-4 left-4 bg-[#febb3c] text-[#412b00] font-bold px-3 py-1 rounded-full uppercase text-[12px]">
                        {pkg.tag}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3
                        className="font-bold text-[#1a1c1e] mb-1"
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontSize: 20,
                        }}
                      >
                        {pkg.title}
                      </h3>
                      <p className="text-[#424750] text-sm mb-4">{pkg.sub}</p>
                      <button className="text-[#003059] font-bold flex items-center gap-1 group transition-all duration-300">
                        {pkg.cta}{" "}
                        <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* ── Portal Cards ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
                {/* Explorer Journals */}
                <div
                  className="relative group overflow-hidden rounded-[2rem] shadow-lg h-[320px] reveal cursor-pointer"
                  style={{
                    transition: "all 0.5s cubic-bezier(0.165,0.84,0.44,1)",
                  }}
                  onMouseEnter={cardEnter}
                  onMouseLeave={cardLeave}
                >
                  <div className="absolute inset-0">
                    <img
                      src="https://img.sunset02.com/sites/default/files/image/2017/03/main/montecito-custom-home-0310-m.jpg"
                      alt="Stories"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#003059]/90 to-transparent" />
                  </div>
                  <div className="relative h-full p-10 flex flex-col justify-center items-start">
                    <span className="bg-[#d06549] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-4 tracking-widest">
                      Explorer Journals
                    </span>
                    <h3
                      className="text-white font-bold mb-8 leading-tight group-hover:translate-x-4 transition-transform duration-700"
                      style={{
                        fontFamily: "Montserrat, sans-serif",
                        fontSize: 48,
                        lineHeight: 1.2,
                      }}
                    >
                      Inspiring Travel Stories
                    </h3>
                    <button className="bg-white text-[#003059] px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center gap-2 group/btn">
                      Read Stories{" "}
                      <span className="material-symbols-outlined text-lg group-hover/btn:rotate-12 transition-transform">
                        auto_stories
                      </span>
                    </button>
                  </div>
                </div>

                {/* Concierge Support */}
                <div
                  className="relative group overflow-hidden rounded-[2rem] bg-slate-50 border border-[#c2c7d1]/30 h-[320px] reveal cursor-pointer"
                  style={{
                    transition: "all 0.5s cubic-bezier(0.165,0.84,0.44,1)",
                    transitionDelay: "0.1s",
                  }}
                  onMouseEnter={cardEnter}
                  onMouseLeave={cardLeave}
                >
                  <div className="relative h-full p-10 flex items-center justify-between">
                    <div className="max-w-[60%]">
                      <span className="bg-[#003059] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase mb-4 tracking-widest inline-block">
                        Concierge Support
                      </span>
                      <h3
                        className="text-[#003059] font-bold mb-4 group-hover:translate-x-2 transition-transform duration-500"
                        style={{
                          fontFamily: "Montserrat, sans-serif",
                          fontSize: 32,
                          lineHeight: 1.3,
                        }}
                      >
                        Expert Assistance Anytime
                      </h3>
                      <p className="text-[#424750] mb-8 text-sm">
                        Your personal travel specialists are just a click away
                        for seamless luxury.
                      </p>
                      <button className="bg-[#d06549] text-white px-8 py-3 rounded-xl font-bold hover:brightness-110 transition-all flex items-center gap-2">
                        Contact Us{" "}
                        <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">
                          support_agent
                        </span>
                      </button>
                    </div>
                    <div className="w-48 h-48 rounded-full overflow-hidden border-8 border-white shadow-xl group-hover:scale-110 transition-transform duration-700">
                      <img
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDcngLwwqt7wY1bY7xR64KBWe2lc2Wdrr6OmF1KMRsMeFoWzCoQvefEaGCUD8uUKTV4edbf6nbcV63c2ffYxnOe1-xuDRamPG2Z0uCgG-rDi7JbK9l_88IcXE9HeDgFHKhHEkLsg113W0QKIJMea_MNtgs7Z0ncFFPRB7FuZvAxg7nrrDd56piRYTu0frDAyDYUU13pzc6htkNS3er3f48QvU39MYlj4DQxyHO25gKZbq7husmiNsb1z-qW0W-uLwgnmCstoVZiqyW"
                        alt="Concierge"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>
        </div>
      </div>
    </>
  );
}