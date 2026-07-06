import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plane, Wallet, Sparkles, MapPin, Moon, ArrowRightLeft } from "lucide-react";

const C = {
  orange:    "#FF682C",
  navy:      "#0A1E3F",
  navyDeep:  "#061224",
  blue:      "#2D8CFF",
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
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
        <div style={{ textAlign: "center", maxWidth: 560 }}>
          <h1 style={{ fontSize: "2rem", marginBottom: 16 }}>No itinerary found</h1>
          <p style={{ color: "#556477", marginBottom: 24 }}>
            Your planner result is not available yet. Please generate a trip from the home planner and try again.
          </p>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              background: "#FF682C",
              color: "#fff",
              border: "none",
              borderRadius: 12,
              padding: "14px 22px",
              fontWeight: 700,
              cursor: "pointer",
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
        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{formatMoney(flight.price)}</div>
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
        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{formatMoney(hotelData.totalPrice)}</div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", backgroundColor: C.softWhite, minHeight: "100vh", paddingBottom: 100 }}>
      <header style={{
        position: "relative",
        background: `linear-gradient(135deg, ${C.navyDeep} 0%, ${C.navy} 100%)`,
        color: "#fff",
        padding: "60px 0 100px",
        overflow: "hidden"
      }}>
        <div style={{
          position: "absolute", top: 0, right: 0, bottom: 0, width: "45%",
          backgroundImage: "url('/__mockup/images/bali-hero.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.32,
          maskImage: "linear-gradient(to right, transparent, black 40%)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 40%)"
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(6,18,36,1) 0%, rgba(10,30,63,0.78) 52%, rgba(0,0,0,0) 100%)" }} />

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 40px", position: "relative", zIndex: 10 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,104,44,0.16)", border: `1px solid rgba(255,104,44,0.3)`, padding: "8px 16px", borderRadius: 24, color: C.orange, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 22 }}>
            <Sparkles size={14} />
            AI-Powered Itinerary
          </div>

          <h1 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: 18, maxWidth: 820, lineHeight: 1.05 }}>
            {tripTitle}
          </h1>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.82)", maxWidth: 700, marginBottom: 30, lineHeight: 1.65 }}>
            {summary}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16 }}>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: 18, borderRadius: 18, border: "1px solid rgba(255,255,255,0.12)" }}>
              <div style={{ fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>DATES</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{slots.departDate || "TBD"} – {slots.returnDate || "TBD"}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: 18, borderRadius: 18, border: "1px solid rgba(255,255,255,0.12)" }}>
              <div style={{ fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>TRAVELERS</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{slots.adults || 1} Adult{slots.children ? ` + ${slots.children} Child` : ""}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: 18, borderRadius: 18, border: "1px solid rgba(255,255,255,0.12)" }}>
              <div style={{ fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>TRIP LENGTH</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{tripLength} Night{tripLength === 1 ? "" : "s"}</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.1)", padding: 18, borderRadius: 18, border: "1px solid rgba(255,255,255,0.12)" }}>
              <div style={{ fontSize: 12, letterSpacing: "0.12em", color: "rgba(255,255,255,0.65)", marginBottom: 6 }}>TRIP VIBE</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{slots.tripVibe || "Personalized"}</div>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "-80px auto 0", padding: "0 40px", display: "grid", gridTemplateColumns: "1.7fr 0.9fr", gap: 28, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <section style={{ background: "#fff", borderRadius: 24, padding: 28, boxShadow: "0 20px 60px rgba(15,23,42,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: C.orange, marginBottom: 10 }}>Trip Itinerary</div>
                <h2 style={{ fontSize: "2rem", fontWeight: 800, color: C.navy, marginBottom: 8 }}>{tripTitle}</h2>
                <p style={{ fontSize: 15, color: C.textMuted, lineHeight: 1.8, maxWidth: 720 }}>{summary}</p>
              </div>
              {pageData.pdfUrl ? (
                <button
                  type="button"
                  onClick={() => window.open(pageData.pdfUrl, "_blank")}
                  style={{ background: C.orange, color: "#fff", border: "none", borderRadius: 16, padding: "14px 24px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}
                >
                  Download PDF
                </button>
              ) : null}
            </div>
          </section>

          {outboundFlight || returnFlight || hotel ? (
            <section style={{ display: "grid", gap: 20, marginBottom: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {outboundFlight ? (
                  <div style={{ background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 12px 30px rgba(15,23,42,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <Plane size={18} color={C.orange} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>Outbound Flight</div>
                        <div style={{ fontSize: 13, color: C.textMuted }}>{slots.originAirportCode || "Origin"} → {slots.destinationAirportCode || "Destination"} • {slots.departDate || "TBD"}</div>
                      </div>
                    </div>
                    {formatFlight(outboundFlight)}
                  </div>
                ) : null}

                {returnFlight ? (
                  <div style={{ background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 12px 30px rgba(15,23,42,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                      <ArrowRightLeft size={18} color={C.orange} />
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
                <div style={{ background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 12px 30px rgba(15,23,42,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                    <Moon size={18} color={C.orange} />
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
            <section style={{ display: "grid", gap: 20 }}>
              {days.map((day: any, index: number) => (
                <article key={index} style={{ background: "#fff", borderRadius: 24, padding: 28, boxShadow: "0 14px 45px rgba(15,23,42,0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
                    <div style={{ width: 56, height: 56, borderRadius: 18, background: C.navy, color: "#fff", display: "grid", placeItems: "center", fontWeight: 800, fontSize: 18 }}>{day.dayNumber ?? index + 1}</div>
                    <div>
                      <div style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: C.orange, marginBottom: 4 }}>Day {day.dayNumber ?? index + 1}</div>
                      <h3 style={{ fontSize: 20, fontWeight: 700, color: C.navy, margin: 0 }}>{day.title || `Day ${index + 1}`}</h3>
                    </div>
                  </div>
                  <div style={{ display: "grid", gap: 16 }}>
                    {Array.isArray(day.activities) && day.activities.length ? day.activities.map((activity: any, activityIndex: number) => (
                      <div key={activityIndex} style={{ display: "grid", gap: 6, padding: 18, borderRadius: 18, border: "1px solid #E5E7EB", background: "#FAFAFC" }}>
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
            <section style={{ background: "#fff", borderRadius: 24, padding: 28, boxShadow: "0 20px 60px rgba(15,23,42,0.06)" }}>
              <p style={{ margin: 0, color: C.textMuted }}>The itinerary has not provided day-by-day details yet.</p>
            </section>
          )}
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <section style={{ background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 20px 60px rgba(15,23,42,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <Wallet size={20} color={C.orange} />
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

          <section style={{ background: "#fff", borderRadius: 24, padding: 24, boxShadow: "0 20px 60px rgba(15,23,42,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <MapPin size={20} color={C.orange} />
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.navy }}>Trip Overview</h3>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 12, color: C.textMuted }}>
              <li><strong>Destination:</strong> {slots.destinationCity || "Not provided"}</li>
              <li><strong>Origin:</strong> {slots.originCity || "Not provided"}</li>
              <li><strong>Adults:</strong> {slots.adults || 1}</li>
              <li><strong>Children:</strong> {slots.children || 0}</li>
              <li><strong>Vibe:</strong> {slots.tripVibe || "Flexible"}</li>
            </ul>
          </section>

          {pageData.pdfUrl ? (
            <section style={{ background: "rgba(255,104,44,0.06)", borderRadius: 24, padding: 24, border: "1px solid rgba(255,104,44,0.16)" }}>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 12 }}>PDF Ready</h4>
              <p style={{ margin: 0, color: C.textMuted, lineHeight: 1.7 }}>Your itinerary PDF has been generated and can be downloaded at any time.</p>
              <button
                type="button"
                onClick={() => window.open(pageData.pdfUrl, "_blank")}
                style={{ marginTop: 18, width: "100%", background: C.orange, color: "#fff", border: "none", borderRadius: 14, padding: "14px", fontWeight: 700, cursor: "pointer" }}
              >
                Download PDF
              </button>
            </section>
          ) : null}
        </aside>
      </main>
    </div>
  );
}
