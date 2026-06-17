import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import HotelSearchForm from "../pages/hotels/HotelSearchForm";

export default function HeroHotel() {
  const navigate = useNavigate();
  const today    = new Date().toLocaleDateString("en-CA");
  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString("en-CA");

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
      <style>{`
        /* ── Root ── */
        .hh-root {
          position: relative;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-height: 520px;
        }

        /* ── Background ── */
        .hh-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .hh-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: brightness(0.72);
          transition: transform 10000ms ease;
          transform: scale(1.1) translate(0, 0);
        }
        .hh-bg-gradient {
          position: absolute;
          inset: 0;
        }
        .hh-bg-fade {
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

        /* ── Content ── */
        .hh-content {
          position: relative;
          z-index: 10;
          flex-grow: 1;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .hh-inner {
          position: relative;
          z-index: 3;
          width: 100%;
          /* mobile-first */
          padding: 100px 16px 40px;
          box-sizing: border-box;
        }

        /* ── Top row ── */
        .hh-top-row {
          display: flex;
          flex-direction: column;   /* stack on mobile */
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 20px;
        }

        /* ── Copy ── */
        .hh-copy {
          flex: 1 1 0;
          min-width: 0;
        }
        .hh-badge {
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
        .hh-badge img {
          width: 36px;
          height: 36px;
          margin-right: -4px;
          margin-bottom: -2px;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25));
        }
        .hh-headline {
          font-family: Poppins, sans-serif;
          font-weight: 800;
          font-size: clamp(1.6rem, 5vw, 2.5rem);
          line-height: 1.13;
          letter-spacing: -0.02em;
          color: #fff;
          margin: 0 0 8px;
        }
        .hh-subline {
          font-family: Poppins, sans-serif;
          font-weight: 300;
          font-size: clamp(12px, 2.5vw, 15px);
          color: rgba(255,255,255,0.60);
          margin: 0;
        }

        /* ── Deal card ── */
        .hh-deal-card {
          width: 100%;           /* full-width on mobile */
          border-radius: 16px;
          padding: 14px 16px;
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.22);
          box-shadow: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18);
          box-sizing: border-box;
        }
        .hh-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .hh-card-label {
          font-family: Poppins, sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.65);
        }
        .hh-card-hotel-name {
          font-family: Poppins, sans-serif;
          font-weight: 600;
          font-size: 13px;
          color: #fff;
          margin-bottom: 4px;
        }
        .hh-stars {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 8px;
        }
        .hh-star { color: #fbbf24; font-size: 11px; }
        .hh-star-label {
          font-family: Poppins, sans-serif;
          font-size: 10px;
          color: rgba(255,255,255,0.45);
          margin-left: 2px;
        }
        .hh-price-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 6px;
        }
        .hh-price {
          font-family: Poppins, sans-serif;
          font-weight: 800;
          font-size: clamp(18px, 4vw, 22px);
          color: #FF9A6C;
          line-height: 1;
        }
        .hh-price-strike {
          font-family: Poppins, sans-serif;
          font-size: 10px;
          color: rgba(255,255,255,0.35);
          text-decoration: line-through;
        }
        .hh-card-hotel-img {
          width: 60px;
          height: 52px;
          margin-right: -4px;
          margin-bottom: -2px;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.25));
        }
        .hh-tags {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        .hh-tag-discount {
          font-family: Poppins, sans-serif;
          font-size: 10px;
          font-weight: 600;
          color: #6ee7a0;
          background: rgba(110,231,160,0.12);
          border-radius: 6px;
          padding: 2px 7px;
        }
        .hh-tag-info {
          font-family: Poppins, sans-serif;
          font-size: 10px;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
          background: rgba(255,255,255,0.10);
          border-radius: 6px;
          padding: 2px 7px;
        }
        .hh-cta {
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
        .hh-trending {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: -4px;
          margin-bottom: 16px;
        }
        .hh-trending-label {
          font-family: Poppins, sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: rgba(255,255,255,0.40);
        }
        .hh-pill {
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
        .hh-pill:hover { background: rgba(255,255,255,0.16); }
        .hh-pill img {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          object-fit: cover;
        }

        /* ── Search wrapper ── */
        .hh-search { width: 100%; }

        /* ── Tablet (≥ 640px) ── */
        @media (min-width: 640px) {
          .hh-inner { padding: 120px 28px 48px; }
          .hh-badge { font-size: 11px; }
          .hh-badge img { width: 40px; height: 40px; }
        }

        /* ── Desktop (≥ 900px): side-by-side ── */
        @media (min-width: 900px) {
          .hh-root    { min-height: 560px; }
          .hh-inner   {
            padding: 140px 40px 56px;
            max-width: 1280px;
            margin-inline: auto;
          }
          .hh-top-row {
            flex-direction: row;
            align-items: flex-start;
            gap: 24px;
          }
          .hh-deal-card {
            width: 212px;
            flex-shrink: 0;
            align-self: flex-start;
            margin-top: 4px;
          }
        }

        /* ── Wide (≥ 1280px) ── */
        @media (min-width: 1280px) {
          .hh-inner { padding-inline: 64px; }
        }
      `}</style>

      <div
        className="hh-root reveal"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        {/* Background */}
        <div className="hh-bg">
          <img
            ref={heroImgRef}
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80"
            alt="Luxury hotel pool"
          />
          <div className="hh-bg-gradient hero-gradient" />
          <div className="hh-bg-fade" aria-hidden />
        </div>

        {/* Hero content */}
        <div className="hh-content">
          <div className="hh-inner">

            {/* Top row: copy + deal card */}
            <div className="hh-top-row reveal" style={{ transitionDelay: "0.04s" }}>

              {/* Copy */}
              <div className="hh-copy">
                <div className="hh-badge">
                  <img src="/icons/HOTELS.png" alt="" />
                  Stay Better · Live More
                </div>
                <h1 className="hh-headline">
                  Find Your Perfect Stay,<br />Every Night
                </h1>
                <p className="hh-subline">
                  Handpicked hotels &amp; stays · From budget gems to luxury escapes · Starting ₹999/night
                </p>
              </div>

              {/* Deal card */}
              <div className="hh-deal-card">
                <div className="hh-card-header">
                  <span className="hh-card-label">Tonight's top pick</span>
                  <span style={{ fontSize: 13 }}>🔥</span>
                </div>

                <div className="hh-card-hotel-name">The Leela Palace, Delhi</div>

                <div className="hh-stars">
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i} className="hh-star">{s}</span>
                  ))}
                  <span className="hh-star-label">5-star</span>
                </div>

                <div className="hh-price-row">
                  <div>
                    <div className="hh-price">₹8,499</div>
                    <div className="hh-price-strike">₹12,000</div>
                  </div>
                  <img
                    src="/icons/HOTELS.png"
                    alt=""
                    className="hh-card-hotel-img"
                  />
                </div>

                <div className="hh-tags">
                  <span className="hh-tag-discount">29% off</span>
                  <span className="hh-tag-info">Breakfast incl.</span>
                </div>

                <button
                  className="hh-cta"
                  onClick={() => {
                    const params = new URLSearchParams({
                      location: "New Delhi, India",
                      checkIn:  today,
                      checkOut: tomorrow,
                      adults:   "1",
                      children: "0",
                      rooms:    "1",
                    });
                    navigate(`/hotels/results?${params.toString()}`);
                  }}
                >
                  View Hotels →
                </button>
              </div>
            </div>

            {/* Trending destinations */}
            <div className="hh-trending reveal" style={{ transitionDelay: "0.06s" }}>
              <span className="hh-trending-label">Trending destinations:</span>
              {TRENDING.map(d => (
                <button key={d.city} className="hh-pill">
                  <img src={d.img} alt={d.city} />
                  {d.city}
                </button>
              ))}
            </div>

            {/* Hotel Search Form */}
            <div className="hh-search reveal" style={{ transitionDelay: "0.08s" }}>
              <HotelSearchForm />
            </div>

          </div>
        </div>
      </div>
    </>
  );
}