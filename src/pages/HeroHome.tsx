import { useEffect, useRef, useState } from "react";
import SearchTabs, { type TopTab } from "../components/SearchTabs";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface HeroHomeProps {
  onTabChange?: (tab: TopTab) => void;
}

// ---------------------------------------------------------------------------
// HeroHome Component
// ---------------------------------------------------------------------------
export default function HeroHome({ onTabChange }: HeroHomeProps) {
  const [tab, setTab] = useState<TopTab>("flights");
  const heroImgRef = useRef<HTMLImageElement>(null);

  const handleTabChange = (newTab: TopTab) => {
    setTab(newTab);
    onTabChange?.(newTab);
  };

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
        <div className="relative z-[3] mx-auto max-w-6xl w-full px-6 pt-[140px] pb-14">

          {/* Headline copy — tab-aware */}
          <div
            className="mb-2 reveal"
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
              <div className="mb-3">
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
                    transition: "opacity 0.3s",
                  }}
                >
                  {tab === "flights"
                    ? "✈ Fly Smarter · Stay Better"
                    : "🏨 Stay Better · Live More"}
                </span>
              </div>
              <h1
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontWeight: 800,
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                  lineHeight: 1.13,
                  letterSpacing: "-0.02em",
                  color: "#fff",
                  margin: "0 0 8px",
                  transition: "opacity 0.3s",
                }}
              >
                {tab === "flights"
                  ? (<> Explore the World <br/> At Unbeatable Prices</>)
                  : (
                    <>
                      Find Your Perfect Stay,
                      <br />
                      Every Night
                    </>
                  )}
              </h1>
              <p
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 300,
                  fontSize: 15,
                  color: "rgba(255,255,255,0.60)",
                  margin: 0,
                  transition: "opacity 0.3s",
                }}
              >
                {tab === "flights"
                  ? "Best fares on domestic & international flights · Hotels from ₹999/night"
                  : "Handpicked hotels & stays · From budget gems to luxury escapes · Starting ₹999/night"}
              </p>
            </div>

            {/* Right: Deal Card */}
            <div style={{ flexShrink: 0, alignSelf: "flex-start", marginTop: 4 }}>
              {tab === "flights" ? (
                /* Flight Deal Card */
                <div
                  style={{
                    width: 212,
                    borderRadius: 16,
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    boxShadow:
                      "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.65)",
                      }}
                    >
                      Cheapest this week
                    </span>
                    <span style={{ fontSize: 13 }}>📈</span>
                  </div>
                  <div
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                      fontSize: 14,
                      color: "#fff",
                      marginBottom: 6,
                    }}
                  >
                    Delhi → Mumbai
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      minHeight: 34,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontWeight: 800,
                        fontSize: 25,
                        color: "#FF9A6C",
                        lineHeight: 1,
                      }}
                    >
                      ₹4,899
                    </div>
                    <span
                      style={{
                        fontSize: 28,
                        marginRight: -4,
                        marginBottom: -2,
                        filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))",
                      }}
                    >
                      ✈️
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontSize: 10,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.55)",
                        background: "rgba(255,255,255,0.10)",
                        borderRadius: 6,
                        padding: "2px 7px",
                      }}
                    >
                      IndiGo · 2h 10m
                    </span>
                    <span
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#6ee7a0",
                        background: "rgba(110,231,160,0.12)",
                        borderRadius: 6,
                        padding: "2px 7px",
                      }}
                    >
                      Non-stop
                    </span>
                  </div>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "Poppins, sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#FF9A6C",
                      padding: 0,
                    }}
                  >
                    View Deals →
                  </button>
                </div>
              ) : (
                /* Hotel Deal Card */
                <div
                  style={{
                    width: 212,
                    borderRadius: 16,
                    padding: "14px 16px",
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(24px)",
                    WebkitBackdropFilter: "blur(24px)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    boxShadow:
                      "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontSize: 11,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.65)",
                      }}
                    >
                      Tonight's top pick
                    </span>
                    <span style={{ fontSize: 13 }}>🔥</span>
                  </div>
                  <div
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 600,
                      fontSize: 13,
                      color: "#fff",
                      marginBottom: 4,
                    }}
                  >
                    The Leela Palace, Delhi
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      marginBottom: 8,
                    }}
                  >
                    {"★★★★★".split("").map((s, i) => (
                      <span key={i} style={{ color: "#fbbf24", fontSize: 11 }}>
                        {s}
                      </span>
                    ))}
                    <span
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontSize: 10,
                        color: "rgba(255,255,255,0.45)",
                        marginLeft: 2,
                      }}
                    >
                      5-star
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontWeight: 800,
                          fontSize: 22,
                          color: "#FF9A6C",
                          lineHeight: 1,
                        }}
                      >
                        ₹8,499
                      </div>
                      <div
                        style={{
                          fontFamily: "Poppins, sans-serif",
                          fontSize: 10,
                          color: "rgba(255,255,255,0.35)",
                          textDecoration: "line-through",
                        }}
                      >
                        ₹12,000
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 26,
                        filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))",
                      }}
                    >
                      🏨
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontSize: 10,
                        fontWeight: 600,
                        color: "#6ee7a0",
                        background: "rgba(110,231,160,0.12)",
                        borderRadius: 6,
                        padding: "2px 7px",
                      }}
                    >
                      29% off
                    </span>
                    <span
                      style={{
                        fontFamily: "Poppins, sans-serif",
                        fontSize: 10,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.55)",
                        background: "rgba(255,255,255,0.10)",
                        borderRadius: 6,
                        padding: "2px 7px",
                      }}
                    >
                      Breakfast incl.
                    </span>
                  </div>
                  <button
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "Poppins, sans-serif",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#FF9A6C",
                      padding: 0,
                    }}
                  >
                    View Hotels →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Full-width SearchTabs */}
          <div className="w-full reveal" style={{ transitionDelay: "0.08s" }}>
            <SearchTabs onTabChange={handleTabChange} />
          </div>

          {/* Stats bar */}
          <div style={{ display: "flex", gap: 40, marginTop: 36 }}>
            {[
              { ico: "⭐", val: "4.8/5", lbl: "Average Customer Rating" },
              { ico: "👥", val: "50,000+", lbl: "Happy Travelers" },
              { ico: "✈", val: "1M+", lbl: "Flights Booked" },
              { ico: "🔒", val: "100%", lbl: "Secure Booking" },
            ].map((s) => (
              <div
                key={s.lbl}
                style={{ display: "flex", alignItems: "center", gap: 12 }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    flexShrink: 0,
                    background: "rgba(255,104,44,0.14)",
                    border: "1px solid rgba(255,104,44,0.28)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  {s.ico}
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: 700,
                      fontSize: 18,
                      color: "#fff",
                      lineHeight: 1,
                    }}
                  >
                    {s.val}
                  </div>
                  <div
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontSize: 11,
                      color: "rgba(255,255,255,0.38)",
                      marginTop: 3,
                    }}
                  >
                    {s.lbl}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}