import { useRef } from "react";
import SearchPage from "../pages/flights_new/SearchPage";
import type { SearchForm } from "../lib/types_t";
import type { CityLeg } from "../components/SearchTabs";

interface HeroHomeProps {
  onSearch?: (form: SearchForm, multiLegs?: CityLeg[]) => void;
  tripType?: "oneWay" | "roundTrip" | "multiCity";
  onTripTypeChange?: (t: "oneWay" | "roundTrip" | "multiCity") => void;
}
// At the top, add today's date
const today = new Date().toLocaleDateString("en-CA");
export default function HeroHome({ onSearch, tripType = "oneWay", onTripTypeChange }: HeroHomeProps) {
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
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPrdPFPE8eNavLsNhU40Vr6HgI6m6zUFGkKy7pMsMq6f7mll2KFuCsho_t5W0X0nniQXQIiVeXavDh_DPHCYMYIc0vv75xa6PUV13_Mu-rZjBln8Ci_jFfWpkStL4seYnTwcW4S1fYr70VC2NSM8MfRyBdlBj5x-SGzva53bTVO5colVAd-V3hKXlT0_W8-Gb8YWjzDDD2yNpUjLZ46kLTmEAITKba_8Y8JiIpVPiY5Lztat_8ytxVUyZCuYO4LKE77OrsjG5c3cnO"
          alt="Panoramic mountain view"
          className="w-full h-full object-fill brightness-75 transition-transform duration-[10000ms]"
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

  className="reveal flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-10"
  style={{ transitionDelay: "0.04s" }}
>
          
            {/* Left: copy block */}
            <div style={{ flex: "1 1 0", minWidth: 0 , width:"100%"}}>
            
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
                  ✈ Fly Smarter · Stay Better
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
                Explore the World <br /> At Unbeatable Prices
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
                Best fares on domestic &amp; international flights · Hotels from ₹999/night
              </p>
            </div>

            {/* Right: Flight Deal Card */}
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
                    Cheapest this week
                  </span>
                  <img src="/home/graph.png" alt="" style={{ width: 30, height: 30, marginRight: -4, marginBottom: -2, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" }} />
                </div>
                <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 14, color: "#fff", marginBottom: 6 }}>
                  Delhi → Mumbai
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8, minHeight: 34 }}>
                  <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 25, color: "#FF9A6C", lineHeight: 1 }}>
                    ₹4,899
                  </div>
                  <img src="/home/flighttakeoff.png" alt="" style={{ width: 50, height: 50, marginRight: -4, marginBottom: -2, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 10, fontWeight: 500, color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.10)", borderRadius: 6, padding: "2px 7px" }}>
                    IndiGo · 2h 10m
                  </span>
                  <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 10, fontWeight: 600, color: "#6ee7a0", background: "rgba(110,231,160,0.12)", borderRadius: 6, padding: "2px 7px" }}>
                    Non-stop
                  </span>
                </div>

<button
  onClick={() =>
    onSearch?.({
      tripType: "oneWay",
      from: { code: "DEL", city: "New Delhi", name: "Indira Gandhi International", cityCode: "DEL", country: "India", countryCode: "IN", label: "New Delhi (DEL)" },
      to:   { code: "BOM", city: "Mumbai",    name: "Chhatrapati Shivaji Maharaj International", cityCode: "BOM", country: "India", countryCode: "IN", label: "Mumbai (BOM)" },
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
  style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 600, color: "#FF9A6C", padding: 0 }}
>
  View Deals →
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

          {/* Flight Search Form — inline, no tab wrapper */}
          <div className="w-full reveal" style={{ transitionDelay: "0.08s" }}>
            <SearchPage
              onSearch={onSearch ?? (() => {})}
              tripType={tripType}
              onTripTypeChange={onTripTypeChange ?? (() => {})}
            />
          </div>

        </div>
      </div>
    </div>
  );
}