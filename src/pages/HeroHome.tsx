import { useRef } from "react";
import SearchPage from "../pages/flights_new/SearchPage";
import type { SearchForm } from "../lib/types_t";
import type { CityLeg } from "../components/SearchTabs";

interface HeroHomeProps {
  onSearch?: (form: SearchForm, multiLegs?: CityLeg[]) => void;
  tripType?: "oneWay" | "roundTrip" | "multiCity";
  onTripTypeChange?: (t: "oneWay" | "roundTrip" | "multiCity") => void;
}

const today = new Date().toLocaleDateString("en-CA");

export default function HeroHome({
  onSearch,
  tripType = "oneWay",
  onTripTypeChange,
}: HeroHomeProps) {
  const heroImgRef = useRef<HTMLImageElement>(null);

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

  const TRENDING = [
    { city: "Dubai",     img: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=48&h=48&fit=crop&q=80" },
    { city: "Singapore", img: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=48&h=48&fit=crop&q=80" },
    { city: "Bali",      img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=48&h=48&fit=crop&q=80" },
    { city: "Europe",    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=48&h=48&fit=crop&q=80" },
    { city: "Thailand",  img: "https://images.unsplash.com/photo-1528181304800-259b08848526?w=48&h=48&fit=crop&q=80" },
  ];

  return (
    <>
      {/* Responsive styles injected via a <style> tag so no build tool changes needed */}
      <style>{`
        .hero-root {
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 520px;
        }

        /* ── Background ── */
        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .hero-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.72);
          transition: transform 10000ms ease;
          transform: scale(1.1) translate(0,0);
        }
        .hero-bg-gradient {
          position: absolute;
          inset: 0;
        }
        .hero-bg-bottom-fade {
          pointer-events: none;
          position: absolute;
          inset-inline: 0;
          bottom: 0;
          z-index: 2;
          height: 7rem;
          background: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(255,255,255,0.18) 70%,
            rgba(255,255,255,0.55) 100%
          );
        }

        /* ── Content wrapper ── */
        .hero-content {
          position: relative;
          z-index: 10;
          flex-grow: 1;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .hero-inner {
          position: relative;
          z-index: 3;
          width: 100%;
          /* Mobile-first padding */
          padding: 100px 16px 40px;
        }

        /* ── Top row: copy + deal card ── */
        .hero-top-row {
          display: flex;
          flex-direction: column;       /* stack on mobile */
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 20px;
        }

        /* ── Copy block ── */
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 5px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.10);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.18);
          font-family: Poppins, sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 14px;
        }
        .hero-headline {
          font-family: Poppins, sans-serif;
          font-weight: 800;
          /* fluid: 1.6 rem on tiny screens → 2.5 rem on large */
          font-size: clamp(1.6rem, 5vw, 2.5rem);
          line-height: 1.13;
          letter-spacing: -0.02em;
          color: #fff;
          margin: 0 0 8px;
        }
        .hero-subline {
          font-family: Poppins, sans-serif;
          font-weight: 300;
          font-size: clamp(12px, 2.5vw, 15px);
          color: rgba(255,255,255,0.60);
          margin: 0;
        }

        /* ── Deal card ── */
        .hero-deal-card {
          width: 100%;               /* full-width on mobile */
          border-radius: 16px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.22);
          box-shadow: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18);
          box-sizing: border-box;
        }
        .deal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .deal-label {
          font-family: Poppins, sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.65);
        }
        .deal-graph-img {
          width: 30px;
          height: 30px;
          margin-right: -4px;
          margin-bottom: -2px;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25));
        }
        .deal-route {
          font-family: Poppins, sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: #fff;
          margin-bottom: 6px;
        }
        .deal-price-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 8px;
          min-height: 34px;
        }
        .deal-price {
          font-family: Poppins, sans-serif;
          font-weight: 800;
          font-size: clamp(20px, 5vw, 25px);
          color: #FF9A6C;
          line-height: 1;
        }
        .deal-flight-img {
          width: 50px;
          height: 50px;
          margin-right: -4px;
          margin-bottom: -2px;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25));
        }
        .deal-tags {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .deal-tag-airline {
          font-family: Poppins, sans-serif;
          font-size: 10px;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          background: rgba(255,255,255,0.10);
          border-radius: 6px;
          padding: 2px 7px;
        }
        .deal-tag-nonstop {
          font-family: Poppins, sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: #6ee7a0;
          background: rgba(110,231,160,0.12);
          border-radius: 6px;
          padding: 2px 7px;
        }
        .deal-cta {
          display: flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: Poppins, sans-serif;
          font-size: 12px;
          font-weight: 600;
          color: #FF9A6C;
          padding: 0;
        }

        /* ── Trending ── */
        .hero-trending {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .trending-label {
          font-family: Poppins, sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.40);
        }
        .trending-pill {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px 4px 4px;
          border-radius: 999px;
          background: rgba(255,255,255,0.09);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.15);
          font-family: Poppins, sans-serif;
          font-size: 12px;
          font-weight: 500;
          color: rgba(255,255,255,0.88);
          cursor: pointer;
          transition: background 0.2s;
        }
        .trending-pill:hover {
          background: rgba(255,255,255,0.16);
        }
        .trending-pill img {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          object-fit: cover;
        }

        /* ── Search form wrapper ── */
        .hero-search {
          width: 100%;
        }

        /* ── Tablet (≥ 640 px) ── */
        @media (min-width: 640px) {
          .hero-inner {
            padding: 120px 28px 48px;
          }
          .hero-badge {
            font-size: 11px;
          }
        }

        /* ── Desktop (≥ 900 px): restore side-by-side layout ── */
        @media (min-width: 900px) {
          .hero-root {
            min-height: 560px;
          }
          .hero-inner {
            padding: 140px 40px 56px;
            max-width: 1280px;
            margin-inline: auto;
          }
          .hero-top-row {
            flex-direction: row;      /* side by side */
            align-items: flex-start;
            gap: 24px;
          }
          .hero-copy {
            flex: 1 1 0;
            min-width: 0;
          }
          .hero-deal-card {
            width: 212px;             /* fixed card width */
            flex-shrink: 0;
            align-self: flex-start;
            margin-top: 4px;
          }
        }

        /* ── Wide (≥ 1280 px) ── */
        @media (min-width: 1280px) {
          .hero-inner {
            padding-inline: 64px;
          }
        }
      `}</style>

      <div
        className="hero-root reveal"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        {/* Background */}
        <div className="hero-bg">
          <img
            ref={heroImgRef}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPrdPFPE8eNavLsNhU40Vr6HgI6m6zUFGkKy7pMsMq6f7mll2KFuCsho_t5W0X0nniQXQIiVeXavDh_DPHCYMYIc0vv75xa6PUV13_Mu-rZjBln8Ci_jFfWpkStL4seYnTwcW4S1fYr70VC2NSM8MfRyBdlBj5x-SGzva53bTVO5colVAd-V3hKXlT0_W8-Gb8YWjzDDD2yNpUjLZ46kLTmEAITKba_8Y8JiIpVPiY5Lztat_8ytxVUyZCuYO4LKE77OrsjG5c3cnO"
            alt="Panoramic mountain view"
          />
          <div className="hero-bg-gradient hero-gradient" />
          <div className="hero-bg-bottom-fade" aria-hidden />
        </div>

        {/* Hero content */}
        <div className="hero-content">
          <div className="hero-inner">

            {/* Top row: copy + deal card */}
            <div className="hero-top-row reveal" style={{ transitionDelay: "0.04s" }}>

              {/* Copy block */}
              <div className="hero-copy">
                <div className="hero-badge">✈ Fly Smarter · Stay Better</div>
                <h1 className="hero-headline">
                  Explore the World <br /> At Unbeatable Prices
                </h1>
                <p className="hero-subline">
                  Best fares on domestic &amp; international flights · Hotels from ₹999/night
                </p>
              </div>

              {/* Deal card */}
              <div className="hero-deal-card">
                <div className="deal-header">
                  <span className="deal-label">Cheapest this week</span>
                  <img src="/home/graph.png" alt="" className="deal-graph-img" />
                </div>
                <div className="deal-route">Delhi → Mumbai</div>
                <div className="deal-price-row">
                  <div className="deal-price">₹4,899</div>
                  <img src="/home/flighttakeoff.png" alt="" className="deal-flight-img" />
                </div>
                <div className="deal-tags">
                  <span className="deal-tag-airline">IndiGo · 2h 10m</span>
                  <span className="deal-tag-nonstop">Non-stop</span>
                </div>
                <button
                  className="deal-cta"
                  onClick={() =>
                    onSearch?.({
                      tripType: "oneWay",
                      from: {
                        code: "DEL", city: "New Delhi",
                        name: "Indira Gandhi International",
                        cityCode: "DEL", country: "India", countryCode: "IN",
                        label: "New Delhi (DEL)",
                      },
                      to: {
                        code: "BOM", city: "Mumbai",
                        name: "Chhatrapati Shivaji Maharaj International",
                        cityCode: "BOM", country: "India", countryCode: "IN",
                        label: "Mumbai (BOM)",
                      },
                      departDate:  today,
                      returnDate:  "",
                      adults:      1,
                      children:    0,
                      infants:     0,
                      cabinClass:  "Economy",
                      nonStopOnly: false,
                      fareType:    "Regular",
                    })
                  }
                >
                  View Deals →
                </button>
              </div>
            </div>

            {/* Trending destinations */}
            <div className="hero-trending reveal" style={{ transitionDelay: "0.06s" }}>
              <span className="trending-label">Trending destinations:</span>
              {TRENDING.map(d => (
                <button key={d.city} className="trending-pill">
                  <img src={d.img} alt={d.city} />
                  {d.city}
                </button>
              ))}
            </div>

            {/* Search form */}
            <div className="hero-search reveal" style={{ transitionDelay: "0.08s" }}>
              <SearchPage
                onSearch={onSearch ?? (() => {})}
                tripType={tripType}
                onTripTypeChange={onTripTypeChange ?? (() => {})}
              />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}