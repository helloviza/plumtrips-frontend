import { useEffect, useState } from "react";

import { getHomeCarousels } from "../lib/api";
import HeroHome from "./HeroHome";
import SearchTabs, { type TopTab } from "../components/SearchTabs";
import { useNavigate } from "react-router-dom";

import { TrustBar,TravelYourWay,TrendingDestination, trustBarProps, AIPlanner, CorporateTravel, StatsStrip, Testimonials, TravelStories, TrustedPartners, ConciergeCTA, trendingDestinationProps, travelYourWayProps, aiPlannerProps, corporateTravelProps, statsStripProps, testimonialsProps, travelStoriesProps, trustedPartnersProps, conciergeCTAProps } from "../components/features-components";

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
  const navigate = useNavigate();
  useReveal();

  const [_carouselImages, setCarouselImages] = useState<string[]>([]);
  const [_tab, setTab] = useState<TopTab>("flights");

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
        className="bg-[#f9f9fc] text-[#1a1c1e] overflow-x-hidden -mt-[124px]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* ================================================================
            HERO SECTION — extracted into HeroHome component
        ================================================================ */}
        <HeroHome onTabChange={setTab} />
        <TrustBar {...trustBarProps} />
              <TrendingDestination {...trendingDestinationProps} onActionClick={() => navigate("/holidays")}  />
      <TravelYourWay {...travelYourWayProps}  onActionClick={() => navigate("/offers")} />
      <AIPlanner {...aiPlannerProps} />
      <CorporateTravel {...corporateTravelProps} />
      <StatsStrip {...statsStripProps} />
      <Testimonials {...testimonialsProps} />
      <TravelStories {...travelStoriesProps} onActionClick={() => navigate("/blogs")} />
      <TrustedPartners {...trustedPartnersProps} />
      <ConciergeCTA {...conciergeCTAProps} />


        {/* ================================================================
            CONTENT SECTIONS
        ================================================================ */}

      </div>
    </>
  );
}