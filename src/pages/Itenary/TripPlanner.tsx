import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Plane,
  Wallet,
  Sparkles,
  MapPin,
  Moon,
  ArrowRightLeft,
  CalendarDays,
  Users,
  Compass,
  BadgeCheck,
  Star,
} from "lucide-react";

const C = {
  orange: "#FF682C",
  navy: "#0A1E3F",
  navyDeep: "#061224",
  blue: "#2D8CFF",
  softWhite: "#F5F7FA",
  textMuted: "#6B7280",
};

export default function TripPlanner() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pageData = (state as any) || JSON.parse(sessionStorage.getItem("plumml_itinerary_data") || "null") || null;

  useEffect(() => {
    if (document.getElementById("pt-poppins")) return;
    const l = document.createElement("link");
    l.id = "pt-poppins";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap";
    document.head.appendChild(l);
  }, []);

  if (!pageData || !pageData.itinerary) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px", background: "linear-gradient(135deg, #f8fbff 0%, #eef4ff 100%)" }}>
        <div style={{ textAlign: "center", maxWidth: 560, background: "#fff", borderRadius: 28, padding: "36px 32px", boxShadow: "0 20px 60px rgba(15,23,42,0.08)" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", margin: "0 auto 18px", background: "rgba(255,104,44,0.12)", display: "grid", placeItems: "center" }}>
            <Compass size={28} color={C.orange} />
          </div>
          <h1 style={{ fontSize: "2rem", marginBottom: 12, color: C.navy }}>No itinerary found</h1>
          <p style={{ color: "#556477", marginBottom: 24, lineHeight: 1.7 }}>
            Your planner result is not available yet. Please generate a trip from the home planner and try again.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              background: "linear-gradient(135deg, #FF682C 0%, #ff8a4c 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "14px 24px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 10px 25px rgba(255,104,44,0.25)",
            }}
          >
            Go back to planner
          </button>
        </div>
      </div>
    );
  }

  const itinerary = pageData.itinerary;
  const slots = pageData.slots || {};
  const outboundFlight = pageData.outboundFlight || null;
  const returnFlight = pageData.returnFlight || null;
  const hotel = pageData.hotel || null;
  const priceBreakdown = pageData.priceBreakdown || {};
  const tripTitle = itinerary.tripTitle || `${slots.destinationCity || "Your Trip"} Itinerary`;
  const summary = itinerary.summary || "Your personalized itinerary is ready.";
  const days = Array.isArray(itinerary.days) ? itinerary.days : [];
  const tripLength = days.length || (slots.departDate && slots.returnDate ? Math.max(1, Math.ceil((new Date(slots.returnDate).getTime() - new Date(slots.departDate).getTime()) / 86400000)) : 0);
  const highlightChips = [
    slots.destinationCity || "Curated destination",
    `${tripLength} night${tripLength === 1 ? "" : "s"}`,
    slots.tripVibe || "Personalized",
  ];

  const formatMoney = (value: unknown): string => {
    if (typeof value === "number") return `₹${value.toLocaleString("en-IN")}`;
    if (typeof value === "string") return value;
    return "-";
  };

  const formatFlight = (flight: any) => {
    if (!flight) return null;
    return (
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{flight.airline} {flight.flightNumber}</div>
        <div style={{ fontSize: 14, color: C.textMuted }}>{flight.departureTime || "TBD"} → {flight.arrivalTime || "TBD"}</div>
        <div style={{ fontSize: 13, color: C.textMuted }}>{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops === 1 ? "" : "s"}`}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.orange }}>{formatMoney(flight.price)}</div>
      </div>
    );
  };

  const formatHotel = (hotelData: any) => {
    if (!hotelData) return null;
    return (
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{hotelData.name}</div>
        <div style={{ fontSize: 14, color: C.textMuted }}>{hotelData.roomType || "Room details not available"}</div>
        <div style={{ fontSize: 13, color: C.textMuted }}>{hotelData.mealPlan || "Meal plan not available"}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.orange }}>{formatMoney(hotelData.totalPrice)}</div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "linear-gradient(180deg, #f8fbff 0%, #f2f6fb 100%)", minHeight: "100vh", paddingBottom: 100 }}>
      <style>{`
        .trip-planner-shell * { box-sizing: border-box; }
        .trip-planner-shell { color: #0f172a; }
        .glass-card {
          background: rgba(255,255,255,0.95);
          border: 1px solid rgba(255,255,255,0.8);
          border-radius: 24px;
          box-shadow: 0 20px 60px rgba(15,23,42,0.08);
          backdrop-filter: blur(12px);
        }
        .soft-pill {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border-radius: 999px;
          padding: 8px 12px;
          background: rgba(255,255,255,0.16);
          border: 1px solid rgba(255,255,255,0.18);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .metric-card {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.16);
          border-radius: 18px;
          padding: 16px 18px;
          backdrop-filter: blur(8px);
        }
        .summary-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, rgba(255,104,44,0.14) 0%, rgba(45,140,255,0.14) 100%);
          border: 1px solid rgba(255,104,44,0.18);
          color: #1f2937;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }
        .day-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 18px 45px rgba(15,23,42,0.1);
        }
        @media (max-width: 980px) {
          .trip-planner-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 720px) {
          .trip-planner-hero { padding: 40px 20px 80px !important; }
          .trip-planner-main { padding: 0 20px !important; }
          .trip-planner-metrics { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

      <div className="trip-planner-shell">
        <header
          style={{
            position: "relative",
            background: `linear-gradient(135deg, ${C.navyDeep} 0%, ${C.navy} 55%, #0f315d 100%)`,
            color: "#fff",
            padding: "60px 0 110px",
            overflow: "hidden",
          }}
          className="trip-planner-hero"
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              bottom: 0,
              width: "42%",
              backgroundImage: "url('/__mockup/images/bali-hero.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.24,
              maskImage: "linear-gradient(to right, transparent, black 42%)",
              WebkitMaskImage: "linear-gradient(to right, transparent, black 42%)",
            }}
          />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at top right, rgba(255,104,44,0.14), transparent 24%), linear-gradient(90deg, rgba(6,18,36,1) 0%, rgba(10,30,63,0.86) 55%, rgba(0,0,0,0) 100%)" }} />
          <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", background: "rgba(255,104,44,0.15)", filter: "blur(60px)", top: -80, left: -40 }} />

          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", position: "relative", zIndex: 10 }}>
            <div className="soft-pill" style={{ marginBottom: 18 }}>
              <Sparkles size={13} />
              AI-Powered Journey
            </div>

            <h1 style={{ fontSize: "clamp(2rem, 3.4vw, 3.2rem)", fontWeight: 800, marginBottom: 16, maxWidth: 820, lineHeight: 1.05 }}>
              {tripTitle}
            </h1>
            <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.84)", maxWidth: 700, marginBottom: 24, lineHeight: 1.7 }}>
              {summary}
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 24 }}>
              {highlightChips.map((chip) => (
                <span key={chip} className="summary-chip" style={{ color: "#fff" }}>
                  <BadgeCheck size={13} color={C.orange} />
                  {chip}
                </span>
              ))}
            </div>

            <div className="trip-planner-metrics" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
              <div className="metric-card">
                <div style={{ fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,255,255,0.68)", marginBottom: 6 }}>DATES</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{slots.departDate || "TBD"} – {slots.returnDate || "TBD"}</div>
              </div>
              <div className="metric-card">
                <div style={{ fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,255,255,0.68)", marginBottom: 6 }}>TRAVELERS</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{slots.adults || 1} Adult{slots.children ? ` + ${slots.children} Child` : ""}</div>
              </div>
              <div className="metric-card">
                <div style={{ fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,255,255,0.68)", marginBottom: 6 }}>TRIP LENGTH</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{tripLength} Night{tripLength === 1 ? "" : "s"}</div>
              </div>
              <div className="metric-card">
                <div style={{ fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,255,255,0.68)", marginBottom: 6 }}>TRIP VIBE</div>
                <div style={{ fontSize: 16, fontWeight: 700 }}>{slots.tripVibe || "Personalized"}</div>
              </div>
            </div>
          </div>
        </header>

        <main className="trip-planner-main" style={{ maxWidth: 1200, margin: "-76px auto 0", padding: "0 40px", display: "grid", gridTemplateColumns: "1.7fr 0.95fr", gap: 28, alignItems: "start" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <section className="glass-card" style={{ padding: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.orange, marginBottom: 10 }}>Trip Itinerary</div>
                  <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: C.navy, marginBottom: 8 }}>{tripTitle}</h2>
                  <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.8, maxWidth: 720 }}>{summary}</p>
                </div>
                {/* {pageData.pdfUrl ? (
                  <button
                    type="button"
                    onClick={() => window.open(pageData.pdfUrl, "_blank")}
                    style={{ background: "linear-gradient(135deg, #FF682C 0%, #ff8a4c 100%)", color: "#fff", border: "none", borderRadius: 999, padding: "13px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 25px rgba(255,104,44,0.25)" }}
                  >
                    Download PDF
                  </button>
                ) : null} */}
              </div>
            </section>

            {outboundFlight || returnFlight || hotel ? (
              <section style={{ display: "grid", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  {outboundFlight ? (
                    <div className="glass-card" style={{ padding: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,104,44,0.12)", display: "grid", placeItems: "center" }}>
                          <Plane size={18} color={C.orange} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Outbound Flight</div>
                          <div style={{ fontSize: 13, color: C.textMuted }}>{slots.originAirportCode || "Origin"} → {slots.destinationAirportCode || "Destination"} • {slots.departDate || "TBD"}</div>
                        </div>
                      </div>
                      {formatFlight(outboundFlight)}
                    </div>
                  ) : null}

                  {returnFlight ? (
                    <div className="glass-card" style={{ padding: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(45,140,255,0.12)", display: "grid", placeItems: "center" }}>
                          <ArrowRightLeft size={18} color={C.blue} />
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Return Flight</div>
                          <div style={{ fontSize: 13, color: C.textMuted }}>{slots.destinationAirportCode || "Destination"} → {slots.originAirportCode || "Origin"} • {slots.returnDate || "TBD"}</div>
                        </div>
                      </div>
                      {formatFlight(returnFlight)}
                    </div>
                  ) : null}
                </div>

                {hotel ? (
                  <div className="glass-card" style={{ padding: 24 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,104,44,0.12)", display: "grid", placeItems: "center" }}>
                        <Moon size={18} color={C.orange} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Hotel Stay</div>
                        <div style={{ fontSize: 13, color: C.textMuted }}>{slots.departDate || "Check-in"} → {slots.returnDate || "Check-out"}</div>
                      </div>
                    </div>
                    {formatHotel(hotel)}
                  </div>
                ) : null}
              </section>
            ) : null}

            {days.length ? (
              <section style={{ display: "grid", gap: 18 }}>
                {days.map((day: any, index: number) => (
                  <article key={index} className="glass-card day-card" style={{ padding: 24, transition: "all 0.2s ease" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
                      <div style={{ width: 54, height: 54, borderRadius: 16, background: "linear-gradient(135deg, #0A1E3F 0%, #2654a3 100%)", color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 18 }}>{day.dayNumber ?? index + 1}</div>
                      <div>
                        <div style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: C.orange, marginBottom: 4 }}>Day {day.dayNumber ?? index + 1}</div>
                        <h3 style={{ fontSize: 20, fontWeight: 700, color: C.navy, margin: 0 }}>{day.title || `Day ${index + 1}`}</h3>
                      </div>
                    </div>
                    <div style={{ display: "grid", gap: 12 }}>
                      {Array.isArray(day.activities) && day.activities.length ? day.activities.map((activity: any, activityIndex: number) => (
                        <div key={activityIndex} style={{ display: "grid", gap: 6, padding: 16, borderRadius: 16, border: "1px solid #E5E7EB", background: "linear-gradient(135deg, #fcfdff 0%, #f8fafc 100%)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{activity.place || activity.title || "Activity"}</span>
                            <span style={{ fontSize: 13, color: C.textMuted }}>{activity.time || "Anytime"}</span>
                          </div>
                          <p style={{ margin: 0, color: C.textMuted, lineHeight: 1.7 }}>{activity.description || activity.notes || "Enjoy this part of the day."}</p>
                        </div>
                      )) : (
                        <p style={{ margin: 0, color: C.textMuted }}>No daily activities are available yet for this itinerary.</p>
                      )}
                    </div>
                  </article>
                ))}
              </section>
            ) : (
              <section className="glass-card" style={{ padding: 24 }}>
                <p style={{ margin: 0, color: C.textMuted }}>The itinerary has not provided day-by-day details yet.</p>
              </section>
            )}
          </div>

          <aside style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <section className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,104,44,0.12)", display: "grid", placeItems: "center" }}>
                  <Wallet size={18} color={C.orange} />
                </div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.navy }}>Estimated Cost</h3>
              </div>
              <div style={{ display: "grid", gap: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: C.textMuted }}>
                  <span>Flight total</span>
                  <strong>{formatMoney(priceBreakdown.flightTotal)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: C.textMuted }}>
                  <span>Hotel total</span>
                  <strong>{formatMoney(priceBreakdown.hotelTotal)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: C.textMuted }}>
                  <span>Minimum spend</span>
                  <strong>{formatMoney(priceBreakdown.minimumLocalSpend)}</strong>
                </div>
                <div style={{ height: 1, background: "#E5E7EB", margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: C.navy }}>
                  <span>Total</span>
                  <strong>{formatMoney(priceBreakdown.total)}</strong>
                </div>
              </div>
            </section>

            <section className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(45,140,255,0.12)", display: "grid", placeItems: "center" }}>
                  <MapPin size={18} color={C.blue} />
                </div>
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.navy }}>Trip Overview</h3>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12, color: C.textMuted }}>
                <li style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><span>Destination</span><strong style={{ color: C.navy }}>{slots.destinationCity || "Not provided"}</strong></li>
                <li style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><span>Origin</span><strong style={{ color: C.navy }}>{slots.originCity || "Not provided"}</strong></li>
                <li style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><span>Adults</span><strong style={{ color: C.navy }}>{slots.adults || 1}</strong></li>
                <li style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><span>Children</span><strong style={{ color: C.navy }}>{slots.children || 0}</strong></li>
                <li style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><span>Vibe</span><strong style={{ color: C.navy }}>{slots.tripVibe || "Flexible"}</strong></li>
              </ul>
            </section>

            {/* <section style={{ background: "linear-gradient(135deg, rgba(255,104,44,0.08) 0%, rgba(45,140,255,0.08) 100%)", borderRadius: 24, padding: 24, border: "1px solid rgba(255,104,44,0.16)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <Star size={17} color={C.orange} />
                <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.navy }}>PDF Ready</h4>
              </div>
              <p style={{ margin: "0 0 12px", color: C.textMuted, lineHeight: 1.7 }}>Your itinerary PDF has been generated and can be downloaded at any time.</p>
              <button
                type="button"
                onClick={() => window.open(pageData.pdfUrl, "_blank")}
                style={{ width: "100%", background: "linear-gradient(135deg, #FF682C 0%, #ff8a4c 100%)", color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontWeight: 700, cursor: "pointer", boxShadow: "0 10px 25px rgba(255,104,44,0.25)" }}
              >
                Download PDF
              </button>
            </section> */}
          </aside>
        </main>
      </div>
    </div>
  );
}
