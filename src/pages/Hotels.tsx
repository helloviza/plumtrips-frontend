import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import HeroHotel from "./HeroHotel";
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
  travelStoriesProps,
  aiPlannerProps,
  corporateTravelProps,
  statsStripProps,
  conciergeCTAProps,
  hotelCollectionsProps,
  hotelTrendingDestinationsProps,
  topHotelBrandsProps,
  guestStoriesProps,
  aiHotelFinderProps,
} from "../components/features-components";
import { AIHotelFinder } from "../components/features-components/AIHotelFinder";

// ---------------------------------------------------------------------------
// HotelHome — Hotels landing page at route "/hotels"
// ---------------------------------------------------------------------------
export default function HotelHome() {
  const navigate = useNavigate();

  // ✨ Same rich scroll effects as the flights Home page
  useScrollEffect();

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

        /* ── Scroll-progress bar ────────────────────────────────────────── */
        #scroll-progress {
          position: fixed;
          top: 0; left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, #003059, #c9a84c, #f0d080);
          transform: scaleX(0);
          transform-origin: left;
          z-index: 9999;
          pointer-events: none;
          box-shadow: 0 0 8px rgba(201, 168, 76, 0.7);
        }

        /* ── Section reveal — staggered slide-up + fade ─────────────────── */
        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition:
            opacity 0.65s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
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

        /* ── Section divider fade-in line ────────────────────────────────── */
        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.25), transparent);
          margin: 0 auto;
          width: 0;
          transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .section-divider.active { width: 80%; }

        /* ── Parallax wrapper ────────────────────────────────────────────── */
        .parallax-clip { overflow: hidden; }

        /* ── Tilt target ─────────────────────────────────────────────────── */
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

      {/* ── Scroll-progress bar (warm gold for hotel page) ── */}
      <div id="scroll-progress" aria-hidden="true" />

      <div
        className="bg-[#f9f9fc] text-[#1a1c1e] -mt-[124px]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* ── HERO ── */}
        <HeroHotel />

        {/* ── CONTENT SECTIONS ── */}
        <TrustBar {...trustBarProps} />

        <div className="reveal parallax-clip">
          <TrendingDestination
            {...hotelTrendingDestinationsProps}
            onActionClick={() => navigate("/holidays")}
          />
        </div>

        <div className="section-divider reveal" />

        <div className="reveal" data-tilt>
          <TravelYourWay
            {...hotelCollectionsProps}
            onActionClick={() => navigate("/offers")}
          />
        </div>

        <div className="reveal"><AIHotelFinder {...aiHotelFinderProps}/></div>

        <div className="section-divider reveal" />

        <div className="reveal"><CorporateTravel {...corporateTravelProps} onPrimaryClick={() => {
  window.open("https://plumbox.plumtrips.com", "_blank")}} /></div>

        <div className="reveal"><StatsStrip {...statsStripProps} /></div>

        <div className="reveal" data-tilt>
          <Testimonials {...guestStoriesProps} onActionClick={()=>navigate("/reviews")} />
        </div>

        <div className="section-divider reveal" />

        <div className="reveal parallax-clip">
          <TravelStories
            {...travelStoriesProps}
            onActionClick={() => navigate("/blogs")}
          />
        </div>

        <div className="reveal"><TrustedPartners {...topHotelBrandsProps} /></div>

        <div className="reveal"><ConciergeCTA {...conciergeCTAProps} /></div>
      </div>
    </>
  );
}