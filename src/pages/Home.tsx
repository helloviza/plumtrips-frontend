import { useEffect, useRef, useState } from "react";

import { getHomeCarousels } from "../lib/api";
// import HeroCarousel from "../components/HeroCarousel";
import SearchTabs , { type TopTab } from "../components/SearchTabs";
import { Link } from "react-router-dom";

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

  const [carouselImages, setCarouselImages] = useState<string[]>([]);
  const [tab, setTab] = useState<TopTab>("flights");

  useEffect(() => {
    getHomeCarousels().then((items) =>
      setCarouselImages(items.map((i) => i.image))
    );
  }, []);

  const heroImgRef = useRef<HTMLImageElement>(null);

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
        className="bg-[#f9f9fc] text-[#1a1c1e] overflow-x-hidden -mt-[72px]"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {/* ================================================================
            HERO SECTION — full-width search card
        ================================================================ */}
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

          {/* Hero content — single full-width column */}
          <div className="relative z-10 flex-grow flex items-center w-full">
            <div className="relative z-[3] mx-auto max-w-6xl w-full px-6 pt-[88px] pb-14">

              {/* ── Headline copy — tab-aware ── */}
              <div className="mb-2 reveal" style={{ transitionDelay: "0.04s", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 24 }}>

                {/* Left: copy block */}
                <div style={{ flex: "1 1 0", minWidth: 0 }}>
                  <div className="mb-3">
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "6px 16px", borderRadius: 999,
                      background: "rgba(255,255,255,0.10)", backdropFilter: "blur(8px)",
                      border: "1px solid rgba(255,255,255,0.18)",
                      fontFamily: "Poppins, sans-serif", fontSize: 11, fontWeight: 600,
                      letterSpacing: "0.14em", textTransform: "uppercase", color: "#fff",
                      transition: "opacity 0.3s",
                    }}>
                      {tab === "flights" ? "✈ Fly Smarter · Stay Better" : "🏨 Stay Better · Live More"}
                    </span>
                  </div>
                  <h1 style={{
                    fontFamily: "Montserrat, sans-serif", fontWeight: 800,
                    fontSize: "clamp(2rem, 4vw, 3rem)", lineHeight: 1.13,
                    letterSpacing: "-0.02em", color: "#fff", margin: "0 0 8px",
                    transition: "opacity 0.3s",
                  }}>
                    {tab === "flights"
                      ? "Explore The World At Unbeatable Prices"
                      : <>Find Your Perfect Stay,<br />Every Night</>}
                  </h1>
                  <p style={{
                    fontFamily: "Inter, sans-serif", fontWeight: 300,
                    fontSize: 15, color: "rgba(255,255,255,0.60)", margin: 0,
                    transition: "opacity 0.3s",
                  }}>
                    {tab === "flights"
                      ? "Best fares on domestic & international flights · Hotels from ₹999/night"
                      : "Handpicked hotels & stays · From budget gems to luxury escapes · Starting ₹999/night"}
                  </p>
                </div>

                {/* Right: Deal Card — floats beside the headline */}
                <div style={{ flexShrink: 0, alignSelf: "flex-start", marginTop: 4 }}>
                  {tab === "flights" ? (
                    /* ── Flight Deal Card ── */
                    <div style={{
                      width: 212, borderRadius: 16, padding: "14px 16px",
                      background: "rgba(255,255,255,0.12)",
                      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{
                          fontFamily: "Poppins, sans-serif", fontSize: 11, fontWeight: 500,
                          color: "rgba(255,255,255,0.65)",
                        }}>Cheapest this week</span>
                        <span style={{ fontSize: 13 }}>📈</span>
                      </div>
                      <div style={{
                        fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 14,
                        color: "#fff", marginBottom: 6,
                      }}>Delhi → Mumbai</div>
                      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 8, minHeight: 34 }}>
                        <div style={{
                          fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 25,
                          color: "#FF9A6C", lineHeight: 1,
                        }}>₹4,899</div>
                        <span style={{ fontSize: 28, marginRight: -4, marginBottom: -2, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" }}>✈️</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <span style={{
                          fontFamily: "Poppins, sans-serif", fontSize: 10, fontWeight: 500,
                          color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.10)",
                          borderRadius: 6, padding: "2px 7px",
                        }}>IndiGo · 2h 10m</span>
                        <span style={{
                          fontFamily: "Poppins, sans-serif", fontSize: 10, fontWeight: 600,
                          color: "#6ee7a0", background: "rgba(110,231,160,0.12)",
                          borderRadius: 6, padding: "2px 7px",
                        }}>Non-stop</span>
                      </div>
                      <button style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "none", border: "none", cursor: "pointer",
                        fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 600,
                        color: "#FF9A6C", padding: 0,
                      }}>View Deals →</button>
                    </div>
                  ) : (
                    /* ── Hotel Deal Card ── */
                    <div style={{
                      width: 212, borderRadius: 16, padding: "14px 16px",
                      background: "rgba(255,255,255,0.12)",
                      backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                      border: "1px solid rgba(255,255,255,0.22)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                        <span style={{
                          fontFamily: "Poppins, sans-serif", fontSize: 11, fontWeight: 500,
                          color: "rgba(255,255,255,0.65)",
                        }}>Tonight's top pick</span>
                        <span style={{ fontSize: 13 }}>🔥</span>
                      </div>
                      <div style={{
                        fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: 13,
                        color: "#fff", marginBottom: 4,
                      }}>The Leela Palace, Delhi</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
                        {"★★★★★".split("").map((s, i) => (
                          <span key={i} style={{ color: "#fbbf24", fontSize: 11 }}>{s}</span>
                        ))}
                        <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.45)", marginLeft: 2 }}>5-star</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 6 }}>
                        <div>
                          <div style={{
                            fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 22,
                            color: "#FF9A6C", lineHeight: 1,
                          }}>₹8,499</div>
                          <div style={{
                            fontFamily: "Poppins, sans-serif", fontSize: 10,
                            color: "rgba(255,255,255,0.35)", textDecoration: "line-through",
                          }}>₹12,000</div>
                        </div>
                        <span style={{ fontSize: 26, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.3))" }}>🏨</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                        <span style={{
                          fontFamily: "Poppins, sans-serif", fontSize: 10, fontWeight: 600,
                          color: "#6ee7a0", background: "rgba(110,231,160,0.12)",
                          borderRadius: 6, padding: "2px 7px",
                        }}>29% off</span>
                        <span style={{
                          fontFamily: "Poppins, sans-serif", fontSize: 10, fontWeight: 500,
                          color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.10)",
                          borderRadius: 6, padding: "2px 7px",
                        }}>Breakfast incl.</span>
                      </div>
                      <button style={{
                        display: "flex", alignItems: "center", gap: 6,
                        background: "none", border: "none", cursor: "pointer",
                        fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 600,
                        color: "#FF9A6C", padding: 0,
                      }}>View Hotels →</button>
                    </div>
                  )}
                </div>

              </div>

              {/* ── Full-width SearchTabs ── */}
              <div className="w-full reveal" style={{ transitionDelay: "0.08s" }}>
                <SearchTabs onTabChange={setTab} />
              </div>


          <div style={{ display: "flex", gap: 40, marginTop: 36 }}>
          {[
            { ico: "⭐", val: "4.8/5",     lbl: "Average Customer Rating" },
            { ico: "👥", val: "50,000+",   lbl: "Happy Travelers" },
            { ico: "✈",  val: "1M+",       lbl: "Flights Booked" },
            { ico: "🔒", val: "100%",      lbl: "Secure Booking" },
          ].map(s => (
            <div key={s.lbl} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12, flexShrink: 0,
                background: "rgba(255,104,44,0.14)",
                border: "1px solid rgba(255,104,44,0.28)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              }}>{s.ico}</div>
              <div>
                <div style={{
                  fontFamily: "Poppins, sans-serif", fontWeight: 700,
                  fontSize: 18, color: "#fff", lineHeight: 1,
                }}>{s.val}</div>
                <div style={{
                  fontFamily: "Poppins, sans-serif", fontSize: 11,
                  color: "rgba(255,255,255,0.38)", marginTop: 3,
                }}>{s.lbl}</div>
              </div>
            </div>
          ))}
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
                <Link to="/offers">
                <button className="flex items-center gap-2 text-[#003059] font-bold hover:underline group transition-all duration-300 hover:scale-105">
                  View offers{" "}
                  <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform duration-300">
                    arrow_right_alt
                  </span>
                </button>
                </Link>
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
                      img: "/assets/home_m/italy2.png",
                      alt: "Italy",
                      tags: ["Holidays", "Europe Packages"],
                      title: "Discover Italy",
                      sub: "Visit Rome",
                      delay: "0.1s",
                    },
                    {
                      img: "/assets/home_m/peru1.png",
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
                  <div
                    className="bg-[#d06549] p-6 rounded-3xl shadow-lg cursor-pointer flex-grow flex flex-col justify-between group"
                    style={{ transition: "all 0.5s cubic-bezier(0.165,0.84,0.44,1)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.transform = "scale(1.05)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "0 15px 35px -5px rgba(208,101,73,0.4)";
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

                  {[
                    { icon: "airplane_ticket", label: "Reprint ticket" },
                    { icon: "luggage", label: "Baggage info" },
                    { icon: "help", label: "FAQ" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="p-4 rounded-3xl border border-[#c2c7d1]/30 flex items-center justify-between group cursor-pointer"
                      style={{
                        background: "linear-gradient(145deg, #004e8b, #004072)",
                        transition: "all 0.5s cubic-bezier(0.165,0.84,0.44,1)",
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
                        <h4 className="font-bold text-xs text-white">{item.label}</h4>
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
                    img: "/assets/home_m/norway1.png",
                    tag: "Norway Packages",
                    alt: "Norway",
                    title: "Spectacular Norway",
                    sub: "Oslo, Bergen & Trondheim",
                    cta: "Explore",
                    delay: "0.2s",
                  },
                  {
                    img: "/assets/home_m/turkey.png",
                    tag: "Turkey Stopover",
                    alt: "Turkey Stopover",
                    title: "Turkey Stopover Package",
                    sub: "Experience the rich culture of Turkey.",
                    cta: "Visit Turkey",
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
                        style={{ fontFamily: "Montserrat, sans-serif", fontSize: 20 }}
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
                <div
                  className="relative group overflow-hidden rounded-[2rem] shadow-lg h-[320px] reveal cursor-pointer"
                  style={{ transition: "all 0.5s cubic-bezier(0.165,0.84,0.44,1)" }}
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
                      Explorer Blogs
                    </span>
                    <h3
                      className="text-white font-bold mb-8 leading-tight group-hover:translate-x-4 transition-transform duration-700"
                      style={{ fontFamily: "Montserrat, sans-serif", fontSize: 48, lineHeight: 1.2 }}
                    >
                      Inspiring Travel Stories
                    </h3>
                    <Link to="/blogs" className="group/btn">
                    <button className="bg-white text-[#003059] px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center gap-2 group/btn">
                      Read Stories{" "}
                      <span className="material-symbols-outlined text-lg group-hover/btn:rotate-12 transition-transform">
                        auto_stories
                      </span>
                    </button>
                    </Link>
                  </div>
                </div>

                <div
                  className="relative group overflow-hidden rounded-[2rem] bg-slate-50 border border-[#c2c7d1]/30 h-[320px] reveal cursor-pointer"
                  style={{ transition: "all 0.5s cubic-bezier(0.165,0.84,0.44,1)", transitionDelay: "0.1s" }}
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
                        style={{ fontFamily: "Montserrat, sans-serif", fontSize: 32, lineHeight: 1.3 }}
                      >
                        Expert Assistance Anytime
                      </h3>
                      <p className="text-[#424750] mb-8 text-sm">
                        Your personal travel specialists are just a click away for seamless luxury.
                      </p>
                      <Link to="/contact" className="group/btn">
                      <button className="bg-[#d06549] text-white px-8 py-3 rounded-xl font-bold hover:brightness-110 transition-all flex items-center gap-2">
                        Contact Us{" "}
                        <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">
                          support_agent
                        </span>
                      </button>
                      </Link>
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