import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getHomeCarousels } from "../lib/api";
import HeroHome from "./HeroHome";
import type { SearchForm } from "../lib/types_t";
import type { CityLeg } from "../components/SearchTabs";
import { useScrollEffect } from "../hooks/useScrollEffect";

import {
  TrustBar,
  TravelYourWay,
  TrendingDestination,
  trustBarProps,
  AIPlanner,
  CorporateTravel,
  StatsStrip,
  Testimonials,
  TravelStories,
  TrustedPartners,
  ConciergeCTA,
  trendingDestinationProps,
  travelYourWayProps,
  aiPlannerProps,
  corporateTravelProps,
  statsStripProps,
  testimonialsProps,
  travelStoriesProps,
  trustedPartnersProps,
  conciergeCTAProps,
} from "../components/features-components";

// ---------------------------------------------------------------------------
// Home — Flights landing page at route "/"
// ---------------------------------------------------------------------------
export default function Home() {
  const navigate = useNavigate();

  // ✨ Replaces the old `useReveal()` — adds parallax, tilt, counters & bar
  useScrollEffect();

  const [_carouselImages, setCarouselImages] = useState<string[]>([]);
  const [tripType, setTripType] = useState<"oneWay" | "roundTrip" | "multiCity">("oneWay");

  useEffect(() => {
    getHomeCarousels().then((items) =>
      setCarouselImages(items.map((i) => i.image))
    );
  }, []);

  const [_scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleFlightSearch(form: SearchForm, multiLegs?: CityLeg[]) {
    sessionStorage.setItem(
      "flightSearch",
      JSON.stringify({ form, multiLegs: multiLegs ?? null })
    );
    navigate("/flights-new/results");
  }

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
        /* ── Base utilities ─────────────────────────────────────────────── */
        .glass-panel { background: rgba(255,255,255,0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        .hero-gradient { background: linear-gradient(to bottom, rgba(0,48,89,0.45), rgba(26,28,30,0.15)); }
        .material-symbols-outlined { font-variation-settings: 'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #003059; border-radius: 10px; }

        /* ── Scroll-progress bar ────────────────────────────────────────── */
        #scroll-progress {
          position: fixed;
          top: 0; left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #003059, #0077cc, #00c2ff);
          transform: scaleX(0);
          transform-origin: left;
          z-index: 9999;
          pointer-events: none;
          /* Subtle glow */
          box-shadow: 0 0 8px rgba(0, 194, 255, 0.7);
        }

        /* ── Section reveal — staggered slide-up + fade ─────────────────── */
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition:
            opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
          /* transition-delay is injected per-sibling by useScrollEffects */
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }

        /* ── Card hover lift ─────────────────────────────────────────────── */
        .hover-lift {
          transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
                      box-shadow 0.28s cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }
        .hover-lift:hover {
          transform: translateY(-6px) scale(1.015);
          box-shadow: 0 20px 40px rgba(0, 48, 89, 0.12);
        }

        /* ── Shimmer skeleton placeholders ──────────────────────────────── */
        @keyframes shimmer {
          0%   { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, #e8eaf0 25%, #f4f5f8 50%, #e8eaf0 75%);
          background-size: 800px 100%;
          animation: shimmer 1.6s infinite linear;
          border-radius: 6px;
        }

        /* ── Section divider fade-in line ────────────────────────────────── */
        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,48,89,0.12), transparent);
          margin: 0 auto;
          width: 0;
          transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .section-divider.active { width: 80%; }

        /* ── Parallax wrapper — overflow clip so children can shift freely  */
        .parallax-clip { overflow: hidden; }

        /* ── Tilt target — GPU-composited ────────────────────────────────── */
        [data-tilt] { will-change: transform; }

        /* ── Reduced-motion safety net ───────────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .reveal,
          .hover-lift,
          [data-tilt],
          #scroll-progress,
          .section-divider {
            transition: none !important;
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            width: 80% !important;
          }
        }
      `}</style>

      {/* ── Scroll-progress bar ── */}
      <div id="scroll-progress" aria-hidden="true" />

      <div
        className="bg-[#f9f9fc] text-[#1a1c1e] overflow-x-hidden -mt-[124px]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* ── HERO ── */}
        <HeroHome
          onSearch={handleFlightSearch}
          tripType={tripType}
          onTripTypeChange={setTripType}
        />

        {/* ── CONTENT SECTIONS ──
            Add `reveal` to each section wrapper for staggered entry.
            Add `data-parallax="0.12"` to background image containers.
            Add `data-tilt` to card grids that should respond to scroll velocity.
            Add `data-count="…"` to stat numbers to animate them.
        */}
        <div className="reveal"><TrustBar {...trustBarProps} /></div>

        <div className="reveal parallax-clip">
          <TrendingDestination
            {...trendingDestinationProps}
            onActionClick={() => navigate("/holidays")}
          />
        </div>

        <div className="section-divider reveal" />

        <div className="reveal" data-tilt>
          <TravelYourWay
            {...travelYourWayProps}
            onActionClick={() => navigate("/offers")}
          />
        </div>

        <div className="reveal"><AIPlanner {...aiPlannerProps} /></div>

        <div className="section-divider reveal" />

        <div className="reveal"><CorporateTravel {...corporateTravelProps} /></div>

        {/* StatsStrip: add data-count to the individual number elements inside
            the component, or wrap here if the component exposes no inner refs */}
        <div className="reveal"><StatsStrip {...statsStripProps} /></div>

        <div className="reveal" data-tilt>
          <Testimonials {...testimonialsProps} />
        </div>

        <div className="section-divider reveal" />

        <div className="reveal parallax-clip">
          <TravelStories
            {...travelStoriesProps}
            onActionClick={() => navigate("/blogs")}
          />
        </div>

        <div className="reveal"><TrustedPartners {...trustedPartnersProps} /></div>

        <div className="reveal"><ConciergeCTA {...conciergeCTAProps} /></div>
      </div>
    </>
  );
}