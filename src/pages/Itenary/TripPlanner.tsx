import { useEffect, useRef, useState } from "react";
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
  MessageCircle,
  Send,
  Loader2,
} from "lucide-react";

import { useCurrency } from "../../context/currencyContext";
import { getBackendOrigin } from "../../lib/backendOrigin";

const C = {
  orange: "#FF682C",
  navy: "#0A1E3F",
  navyDeep: "#061224",
  blue: "#2D8CFF",
  softWhite: "#F5F7FA",
  textMuted: "#6B7280",
};

type EditLogEntry = { role: "user" | "assistant"; text: string };

// A Trip Overview row that doubles as an inline editor: clicking the value
// turns it into an input, and committing it (Enter or blur) fires the same
// "update trip" chat flow used by the quick-edit chips below — so editing
// the summary and editing via chat are really the same mechanism.
function EditableStat({
  label,
  value,
  editKey,
  activeEditKey,
  disabled,
  inputType = "text",
  onStartEdit,
  onCancelEdit,
  onCommit,
}: {
  label: string;
  value: string | number;
  editKey: string;
  activeEditKey: string | null;
  disabled?: boolean;
  inputType?: "text" | "number";
  onStartEdit: (key: string) => void;
  onCancelEdit: () => void;
  onCommit: (key: string, newValue: string) => void;
}) {
  const isEditing = activeEditKey === editKey;
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing) {
      setDraft(String(value));
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [isEditing]); // eslint-disable-line react-hooks/exhaustive-deps

  const commit = () => {
    const trimmed = draft.trim();
    onCancelEdit();
    if (!trimmed || trimmed === String(value)) return;
    onCommit(editKey, trimmed);
  };

  return (
    <li style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
      <span>{label}</span>
      {isEditing ? (
        <input
          ref={inputRef}
          type={inputType}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            }
            if (event.key === "Escape") {
              event.preventDefault();
              onCancelEdit();
            }
          }}
          aria-label={`Edit ${label}`}
          style={{
            width: 120,
            textAlign: "right",
            padding: "4px 8px",
            borderRadius: 8,
            border: `1px solid ${C.orange}`,
            fontSize: 13,
            color: C.navy,
            outline: "none",
            background: "#FFF7F3",
          }}
        />
      ) : (
        <button
          type="button"
          onClick={() => !disabled && onStartEdit(editKey)}
          disabled={disabled}
          title="Click to edit"
          style={{
            background: "none",
            border: "none",
            padding: "2px 0",
            cursor: disabled ? "default" : "pointer",
            color: C.navy,
            fontWeight: 700,
            fontSize: 13,
            textDecoration: disabled ? "none" : "underline",
            textDecorationStyle: "dotted",
            textUnderlineOffset: 3,
            textDecorationColor: "rgba(10,30,63,0.35)",
          }}
        >
          {value}
        </button>
      )}
    </li>
  );
}

export default function TripPlanner() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const initialData = (state as any) || JSON.parse(sessionStorage.getItem("plumml_itinerary_data") || "null") || null;

  // Trip data now lives in state so the "Update your trip" chat below
  // can rewrite it in place, without needing to re-navigate to this page.
  const [tripData, setTripData] = useState<any>(initialData);

  // ── "Update your trip" mini chat ──
  const [editLog, setEditLog] = useState<EditLogEntry[]>([]);
  const [editInput, setEditInput] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const editInputRef = useRef<HTMLInputElement | null>(null);
  const editLogRef = useRef<HTMLDivElement | null>(null);

  // Which Trip Overview stat (if any) is currently being edited inline.
  const [editingStatKey, setEditingStatKey] = useState<string | null>(null);

  useEffect(() => {
    if (document.getElementById("pt-poppins")) return;
    const l = document.createElement("link");
    l.id = "pt-poppins";
    l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap";
    document.head.appendChild(l);
  }, []);

  useEffect(() => {
    if (editLogRef.current) {
      editLogRef.current.scrollTop = editLogRef.current.scrollHeight;
    }
  }, [editLog, isEditing]);

  const getSessionId = () => {
    let sid = window.localStorage.getItem("plumml_session_id");
    if (!sid) {
      sid = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `plumml-${Date.now()}`;
      window.localStorage.setItem("plumml_session_id", sid);
    }
    return sid;
  };

  const sendTripEdit = async (message: string) => {
    const trimmed = message.trim();
    if (!trimmed || isEditing) return;

    setEditInput("");
    setEditLog((current) => [...current, { role: "user", text: trimmed }]);
    setIsEditing(true);

    const BACKEND = getBackendOrigin();
    try {
      const response = await fetch(`${BACKEND}/api/v1/plumml/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: getSessionId(), message: trimmed }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const errorText = data?.error || data?.message || response.statusText || "Update failed";
        throw new Error(errorText);
      }

      const replyText = data?.reply || "Done — I've updated your trip.";
      setEditLog((current) => [...current, { role: "assistant", text: replyText }]);

      setTripData((prev: any) => {
        const updated = {
          ...prev,
          itinerary: data?.itinerary || prev?.itinerary,
          outboundFlight: data?.outboundFlight ?? prev?.outboundFlight,
          returnFlight: data?.returnFlight ?? prev?.returnFlight,
          hotel: data?.hotel ?? prev?.hotel,
          priceBreakdown: data?.priceBreakdown || prev?.priceBreakdown,
          slots: { ...(prev?.slots || {}), ...(data?.slots || {}) },
          pdfUrl: data?.pdfUrl ?? prev?.pdfUrl,
        };
        try {
          sessionStorage.setItem("plumml_itinerary_data", JSON.stringify(updated));
        } catch {
          // ignore storage failures
        }
        return updated;
      });
    } catch (error: any) {
      console.error("Trip edit failed", error);
      setEditLog((current) => [
        ...current,
        { role: "assistant", text: error?.message || "Sorry, something went wrong updating your trip. Please try again." },
      ]);
    } finally {
      setIsEditing(false);
    }
  };

  // Fired when someone edits a Trip Overview value directly (destination,
  // origin, adults, children, vibe). Builds a natural instruction and sends
  // it through the exact same update-trip pipeline as the chips/chat below,
  // so an inline edit and a typed chat message trigger identically.
  const handleStatCommit = (key: string, newValue: string) => {
    const messageByKey: Record<string, string> = {
      destinationCity: `Please change my destination to ${newValue}.`,
      originCity: `Please change my departure city to ${newValue}.`,
      adults: `Please update the number of adults to ${newValue}.`,
      children: `Please update the number of children to ${newValue}.`,
      tripVibe: `Please change the trip vibe to ${newValue}.`,
    };
    sendTripEdit(messageByKey[key] || `Please update ${key} to ${newValue}.`);
  };

  const handleQuickEdit = (type: "dates" | "vibe" | "travelers") => {
    const templates: Record<typeof type, string> = {
      dates: "I'd like to change my travel dates to ",
      vibe: "Please change the trip vibe to ",
      travelers: "Please update the number of travelers to ",
    };
    setEditInput(templates[type]);
    editInputRef.current?.focus();
  };

  if (!tripData || !tripData.itinerary) {
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

  const itinerary = tripData.itinerary;
  const slots = tripData.slots || {};
  const outboundFlight = tripData.outboundFlight || null;
  const returnFlight = tripData.returnFlight || null;
  const hotel = tripData.hotel || null;
  const priceBreakdown = tripData.priceBreakdown || {};
  const tripTitle = itinerary.tripTitle || `${slots.destinationCity || "Your Trip"} Itinerary`;
  const summary = itinerary.summary || "Your personalized itinerary is ready.";
  const days = Array.isArray(itinerary.days) ? itinerary.days : [];
  const tripLength = days.length || (slots.departDate && slots.returnDate ? Math.max(1, Math.ceil((new Date(slots.returnDate).getTime() - new Date(slots.departDate).getTime()) / 86400000)) : 0);
  const highlightChips = [
    slots.destinationCity || "Curated destination",
    `${tripLength} night${tripLength === 1 ? "" : "s"}`,
    slots.tripVibe || "Personalized",
  ];

  const formatFlight = (flight: any) => {
    if (!flight) return null;
    return (
      <div style={{ display: "grid", gap: 6 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{flight.airline} {flight.flightNumber}</div>
        <div style={{ fontSize: 14, color: C.textMuted }}>{flight.departureTime || "TBD"} → {flight.arrivalTime || "TBD"}</div>
        <div style={{ fontSize: 13, color: C.textMuted }}>{flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops === 1 ? "" : "s"}`}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.orange }}>{convert(flight.price)}</div>
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
        <div style={{ fontSize: 14, fontWeight: 700, color: C.orange }}>{convert(hotelData.totalPrice)}</div>
      </div>
    );
  };

  const { convert } = useCurrency();

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
        .quick-edit-chip {
          font-family: inherit;
          font-size: 12.5px;
          font-weight: 600;
          color: ${C.navy};
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          border-radius: 999px;
          padding: 7px 13px;
          cursor: pointer;
          transition: all 0.15s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .quick-edit-chip:hover {
          background: rgba(255,104,44,0.1);
          border-color: rgba(255,104,44,0.35);
          color: ${C.orange};
        }
        .edit-log-bubble {
          padding: 9px 13px;
          border-radius: 14px;
          font-size: 13px;
          line-height: 1.5;
          max-width: 88%;
        }
        .edit-log-bubble.user {
          align-self: flex-end;
          background: ${C.orange};
          color: #fff;
          border-bottom-right-radius: 4px;
        }
        .edit-log-bubble.assistant {
          align-self: flex-start;
          background: #F1F5F9;
          color: #1f2937;
          border-bottom-left-radius: 4px;
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
                  <strong>{convert(priceBreakdown.flightTotal)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: C.textMuted }}>
                  <span>Hotel total</span>
                  <strong>{convert(priceBreakdown.hotelTotal)}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: C.textMuted }}>
                  <span>Minimum spend</span>
                  <strong>{convert(priceBreakdown.minimumLocalSpend)}</strong>
                </div>
                <div style={{ height: 1, background: "#E5E7EB", margin: "8px 0" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: C.navy }}>
                  <span>Total</span>
                  <strong>{convert(priceBreakdown.total)}</strong>
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
                <EditableStat
                  label="Destination"
                  value={slots.destinationCity || "Not provided"}
                  editKey="destinationCity"
                  activeEditKey={editingStatKey}
                  disabled={isEditing}
                  onStartEdit={setEditingStatKey}
                  onCancelEdit={() => setEditingStatKey(null)}
                  onCommit={handleStatCommit}
                />
                <EditableStat
                  label="Origin"
                  value={slots.originCity || "Not provided"}
                  editKey="originCity"
                  activeEditKey={editingStatKey}
                  disabled={isEditing}
                  onStartEdit={setEditingStatKey}
                  onCancelEdit={() => setEditingStatKey(null)}
                  onCommit={handleStatCommit}
                />
                <EditableStat
                  label="Adults"
                  value={slots.adults || 1}
                  editKey="adults"
                  inputType="number"
                  activeEditKey={editingStatKey}
                  disabled={isEditing}
                  onStartEdit={setEditingStatKey}
                  onCancelEdit={() => setEditingStatKey(null)}
                  onCommit={handleStatCommit}
                />
                <EditableStat
                  label="Children"
                  value={slots.children || 0}
                  editKey="children"
                  inputType="number"
                  activeEditKey={editingStatKey}
                  disabled={isEditing}
                  onStartEdit={setEditingStatKey}
                  onCancelEdit={() => setEditingStatKey(null)}
                  onCommit={handleStatCommit}
                />
                <EditableStat
                  label="Vibe"
                  value={slots.tripVibe || "Flexible"}
                  editKey="tripVibe"
                  activeEditKey={editingStatKey}
                  disabled={isEditing}
                  onStartEdit={setEditingStatKey}
                  onCancelEdit={() => setEditingStatKey(null)}
                  onCommit={handleStatCommit}
                />
              </ul>
              <p style={{ margin: "10px 0 0", fontSize: 11, color: "rgba(107,114,128,0.8)" }}>
                Tap any value to edit it — it'll update your trip automatically.
              </p>
            </section>

            {/* ── Update your trip: quick chips + free-text chat, wired to the same planner backend ── */}
            <section className="glass-card" style={{ padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,104,44,0.12)", display: "grid", placeItems: "center" }}>
                  <MessageCircle size={18} color={C.orange} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: C.navy }}>Update your trip</h3>
                  <div style={{ fontSize: 12, color: C.textMuted }}>Change dates, vibe, or anything else</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
                <button type="button" className="quick-edit-chip" onClick={() => handleQuickEdit("dates")}>
                  <CalendarDays size={13} /> Change dates
                </button>
                <button type="button" className="quick-edit-chip" onClick={() => handleQuickEdit("vibe")}>
                  <Star size={13} /> Change vibe
                </button>
                <button type="button" className="quick-edit-chip" onClick={() => handleQuickEdit("travelers")}>
                  <Users size={13} /> Update travelers
                </button>
              </div>

              <div
                ref={editLogRef}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  maxHeight: 190,
                  overflowY: "auto",
                  marginBottom: 12,
                  paddingRight: 4,
                }}
              >
                {editLog.length === 0 && !isEditing ? (
                  <p style={{ margin: 0, fontSize: 13, color: C.textMuted, lineHeight: 1.6 }}>
                    Tap a shortcut above or type below — e.g. "push my trip back a week" or "make it more relaxed and beachy".
                  </p>
                ) : (
                  editLog.map((entry, index) => (
                    <div key={index} className={`edit-log-bubble ${entry.role}`}>
                      {entry.text}
                    </div>
                  ))
                )}
                {isEditing && (
                  <div className="edit-log-bubble assistant" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Loader2 size={13} className="spin" style={{ animation: "spin 1s linear infinite" }} />
                    Updating your trip…
                  </div>
                )}
              </div>

              <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              `}</style>

              <div style={{ display: "flex", gap: 8 }}>
                <input
                  ref={editInputRef}
                  value={editInput}
                  onChange={(event) => setEditInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      sendTripEdit(editInput);
                    }
                  }}
                  placeholder="Tell us what to change…"
                  aria-label="Describe the change you want to make to your trip"
                  disabled={isEditing}
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: 999,
                    border: "1px solid #E2E8F0",
                    background: "#F8FAFC",
                    color: "#0f172a",
                    fontSize: 13,
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => sendTripEdit(editInput)}
                  disabled={isEditing || !editInput.trim()}
                  aria-label="Send update"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "none",
                    background: C.orange,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    cursor: isEditing || !editInput.trim() ? "default" : "pointer",
                    opacity: isEditing || !editInput.trim() ? 0.55 : 1,
                    flexShrink: 0,
                  }}
                >
                  <Send size={15} />
                </button>
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
}