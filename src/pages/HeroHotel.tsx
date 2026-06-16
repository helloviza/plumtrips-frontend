import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import HotelSearchForm from "../pages/hotels/HotelSearchForm";

export default function HeroHotel() {
  const navigate = useNavigate();
const today = new Date().toLocaleDateString("en-CA");
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
    <div
      className="relative flex flex-col overflow-hidden"
      style={{ minHeight: 560 }}
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
    >
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          ref={heroImgRef}
          src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1600&q=80"
          alt="Luxury hotel pool"
          className="w-full h-full object-cover brightness-75 transition-transform duration-[10000ms]"
          style={{ transform: "scale(1.1) translate(0px,0px)" }}
        />
        <div className="absolute inset-0 hero-gradient" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-28"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.18) 70%, rgba(255,255,255,0.55) 100%)",
          }}
          aria-hidden
        />
      </div>

      {/* Hero content */}
      <div className="relative z-10 flex-grow flex items-center w-full">
        <div className="relative z-[3] mx-auto w-full px-6 pt-[140px] pb-14">

          {/* Headline + Deal Card */}
          <div
            className=" reveal"
            style={{
              transitionDelay: "0.04s",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 24,
            }}
          >
            {/* Left: copy block */}
            <div style={{ flex: "1 1 0", minWidth: 0 }}>
              <div className="mb-5">
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 16px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.10)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#fff",
                  }}
                >
                  <img
                    src="/icons/HOTELS.png"
                    alt=""
                    style={{ width: 40, height: 40, marginRight: -4, marginBottom: -2, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" }}
                  />Stay Better · Live More
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(2rem, 3vw, 2.5rem)",
                  lineHeight: 1.13,
                  letterSpacing: "-0.02em",
                  color: "#fff",
                  margin: "0 0 8px",
                }}
              >
                Find Your Perfect Stay,
                <br />
                Every Night
              </h1>
              <p
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 300,
                  fontSize: 15,
                  color: "rgba(255,255,255,0.60)",
                  margin: 0,
                }}
              >
                Handpicked hotels &amp; stays · From budget gems to luxury escapes · Starting ₹999/night
              </p>
            </div>

            {/* Right: Hotel Deal Card */}
            <div style={{ flexShrink: 0, alignSelf: "flex-start", marginTop: 4 }}>
              <div
                style={{
                  width: 212,
                  borderRadius: 16,
                  padding: "14px 16px",
                  background: "rgba(255,255,255,0.12)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.22)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.65)" }}>
                    Tonight's top pick
                  </span>
                  <span style={{ fontSize: 13 }}>🔥</span>
                </div>
                <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 4 }}>
                  The Leela Palace, Delhi
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
                  {"★★★★★".split("").map((s, i) => (
                    <span key={i} style={{ color: "#fbbf24", fontSize: 11 }}>{s}</span>
                  ))}
                  <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.45)", marginLeft: 2 }}>
                    5-star
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 22, color: "#FF9A6C", lineHeight: 1 }}>
                      ₹8,499
                    </div>
                    <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.35)", textDecoration: "line-through" }}>
                      ₹12,000
                    </div>
                  </div>
                  <img
                    src="/icons/HOTELS.png"
                    alt=""
                    style={{ width: 70, height: 60, marginRight: -4, marginBottom: -2, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 10, fontWeight: 600, color: "#6ee7a0", background: "rgba(110,231,160,0.12)", borderRadius: 6, padding: "2px 7px" }}>
                    29% off
                  </span>
                  <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.10)", borderRadius: 6, padding: "2px 7px" }}>
                    Breakfast incl.
                  </span>
                </div>
<button
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
  style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 600, color: "#FF9A6C", padding: 0 }}
>
  View Hotels →
</button>
              </div>
            </div>
          </div>

          {/* Trending destinations — own row below headline */}
          <div
            className="reveal"
            style={{
              transitionDelay: "0.06s",
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginTop: -4,
              marginBottom: 16,
            }}
          >
            <span style={{
              fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 500,
              color: "rgba(255,255,255,0.4)",
            }}>
              Trending destinations:
            </span>
            {TRENDING.map(d => (
              <button key={d.city} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "4px 14px 4px 4px", borderRadius: 999,
                background: "rgba(255,255,255,0.09)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.15)",
                fontFamily: "Poppins, sans-serif", fontSize: 12.5, fontWeight: 500,
                color: "rgba(255,255,255,0.88)", cursor: "pointer",
              }}>
                <img src={d.img} alt={d.city} style={{
                  width: 24, height: 24, borderRadius: "50%", objectFit: "cover",
                }} />
                {d.city}
              </button>
            ))}
          </div>

          {/* Hotel Search Form — inline, no tab wrapper */}
          <div className="w-full reveal" style={{ transitionDelay: "0.08s" }}>
            <HotelSearchForm />
          </div>

        </div>
      </div>
    </div>
  );
}