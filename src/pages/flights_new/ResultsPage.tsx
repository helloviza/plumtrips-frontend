// ============================================================
//  ResultsPage.tsx — DateStrip removed
// ============================================================

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import type { SearchForm, DisplayFlight, ActiveFilters, FareTier, Airport } from "../../lib/types_t";
import { formatINR, MOCK_MODE, apiSearchFlights, apiFareQuote } from "../../lib/flights_api";
import type { FlightSearchResult, FareQuoteResult } from "../../lib/flights_api";
import OneSearchBar from "./OneSearchBar";

type CityLeg = { from: Airport; to: Airport; departDate: string };

// ─── CONSTANTS ─────────────────────────────────────────────

const AIRLINE_COLORS: Record<string, { bg: string; text: string }> = {
  "6E": { bg: "#1b4b9e", text: "#fff" },
  AI:  { bg: "#c8102e", text: "#fff" },
  SG:  { bg: "#d03f2f", text: "#fff" },
  UK:  { bg: "#5c1c81", text: "#fff" },
  QP:  { bg: "#e87722", text: "#fff" },
  IX:  { bg: "#c8102e", text: "#fff" },
  G8:  { bg: "#f5a623", text: "#000" },
  "2T":{ bg: "#00796b", text: "#fff" },
};

const TIME_SLOTS = [
  { id: "early",     label: "Early morning", sub: "Before 6 AM",   range: [0, 6]   },
  { id: "morning",   label: "Morning",        sub: "6 AM – 12 PM",  range: [6, 12]  },
  { id: "afternoon", label: "Afternoon",       sub: "12 PM – 6 PM",  range: [12, 18] },
  { id: "evening",   label: "Evening",         sub: "After 6 PM",    range: [18, 24] },
];

// ─── HELPERS ───────────────────────────────────────────────

function durationStr(mins: number) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function timeToMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function slotMatch(time: string, slotId: string | null) {
  if (!slotId) return true;
  const slot = TIME_SLOTS.find(s => s.id === slotId);
  if (!slot) return true;
  const h = Math.floor(timeToMins(time) / 60);
  return h >= slot.range[0] && h < slot.range[1];
}

function co2Badge(stops: number, duration: number) {
  const base = 80 + duration * 0.15 + stops * 25;
  return Math.round(base);
}

// ─── SHARED STYLE TOKENS ───────────────────────────────────

const S = {
  navy:      "#00305f",
  navyDeep:  "#0d2d5e",
  navyMid:   "#00477f",
  accent:    "#d06549",
  accentDk:  "#b8543a",
  accentLt:  "#f9c08a",
  muted:     "#8fafd4",
  mutedLt:   "#b0bfd4",
  border:    "#e2ecf7",
  borderMid: "#c9d5e8",
  surface:   "#f5f8fc",
  ink:       "#0d1f3c",
  green:     "#0d7a52",
  greenBg:   "#e8f8f1",
};

// ─── AIRLINE BADGE ─────────────────────────────────────────

function AirlineLogo({
  code,
  size = "md",
}: {
  code: string;
  size?: "sm" | "md" | "lg";
}) {
  const [imgFailed, setImgFailed] = useState(false);

  const color =
    AIRLINE_COLORS[code] ?? { bg: "#475569", text: "#fff" };

  const dims: Record<string, React.CSSProperties> = {
    sm: { width: 32, height: 32, fontSize: 9, borderRadius: 8 },
    md: { width: 40, height: 40, fontSize: 10, borderRadius: 11 },
    lg: { width: 48, height: 48, fontSize: 11, borderRadius: 13 },
  };

  return (
    <div
      style={{
        ...dims[size],
        background: color.bg,
        color: color.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontFamily: "'Sora', sans-serif",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {imgFailed ? (
        code
      ) : (
        <img
          src={`/airlines/${code}.gif`}
          alt={code}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          onError={() => setImgFailed(true)}
        />
      )}
    </div>
  );
}

// ─── FARE TIER CARD ────────────────────────────────────────

function FareTierCard({
  tier, selected, onSelect,
}: { tier: FareTier; selected: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative",
        borderRadius: 16,
        border: `2px solid ${selected ? S.navyDeep : S.border}`,
        cursor: "pointer",
        transition: "all .2s",
        background: selected ? "#f0f6ff" : "#fff",
        overflow: "hidden",
      }}
    >
      {tier.recommended && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          background: S.accent, color: "#fff",
          fontSize: 9, fontWeight: 800, textAlign: "center",
          padding: "3px 0", letterSpacing: "0.1em",
          fontFamily: "'Sora', sans-serif", textTransform: "uppercase",
        }}>
          Best Value
        </div>
      )}
      <div style={{ padding: tier.recommended ? "28px 14px 14px" : "14px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: S.navyDeep }}>{tier.name}</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: S.ink, marginTop: 2 }}>{formatINR(tier.price)}</div>
            <div style={{ fontSize: 10, color: S.muted, marginTop: 1 }}>per adult</div>
          </div>
          <div style={{
            width: 18, height: 18, borderRadius: "50%", marginTop: 2, flexShrink: 0,
            border: `2px solid ${selected ? S.navyDeep : S.borderMid}`,
            background: selected ? S.navyDeep : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .15s",
          }}>
            {selected && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
  { icon: "🧳", label: "Check-in",    val: tier.checkinBag      },
  { icon: "💼", label: "Cabin",        val: tier.cabinBag        },
  { icon: "↩️", label: "Cancel",       val: tier.cancellationFee },
  { icon: "📅", label: "Reschedule",   val: tier.dateChangeFee   },
  { icon: "💺", label: "Seat",         val: tier.seatSelection   },
  { icon: "🍽️", label: "Meals",        val: tier.meals           },
  {
    icon: tier.isRefundable ? "✅" : "❌",
    label: "Refundable",
    val: tier.isRefundable ? "Yes" : "No",
  },
].map(({ icon, label, val }) => (
            <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <span style={{ fontSize: 11, marginTop: 1, flexShrink: 0 }}>{icon}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9, color: S.muted, fontWeight: 600, lineHeight: 1 }}>{label}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: S.navyDeep, lineHeight: 1.3, marginTop: 2 }}>{val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FARE MODAL ────────────────────────────────────────────

function FareModal({
  flight, legIndex, totalLegs, onClose, onBook,
}: {
  flight: DisplayFlight;
  legIndex?: number;
  totalLegs?: number;
  onClose: () => void;
  onBook: (tier: FareTier) => void;
}) {
  const [selected, setSelected] = useState(1);
  const [tiers, setTiers] = useState<FareTier[]>([]);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [fareChanged, setFareChanged] = useState(false);
  const isMultiLeg = totalLegs && totalLegs > 1;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    setQuoteLoading(true);
    setQuoteError(null);
    apiFareQuote(flight)
      .then((result: FareQuoteResult) => {
        setTiers(result.tiers);
        setFareChanged(result.fareChanged);
        const recIdx = result.tiers.findIndex(t => t.recommended);
        setSelected(recIdx >= 0 ? recIdx : Math.min(1, result.tiers.length - 1));
        setQuoteLoading(false);
      })
      .catch((e: unknown) => {
        setQuoteError(e instanceof Error ? e.message : "Failed to fetch fare details");
        setQuoteLoading(false);
      });
  }, [flight.resultIndex]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <div style={{
  position: "relative", width: "100%", maxWidth: 780,
  background: "#fff", borderRadius: 20, maxHeight: "92dvh",
  display: "flex", flexDirection: "column", overflow: "hidden",
  boxShadow: "0 24px 80px rgba(0,48,95,0.30)",
}}>
        {/* Modal header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 20px", borderBottom: `1px solid ${S.border}`, flexShrink: 0,
        }}>
          <AirlineLogo code={flight.airlineCode} size="lg" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: S.navyDeep, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {flight.airline} · {flight.flightNumber}
              {isMultiLeg && (
                <span style={{
                  marginLeft: 8, fontSize: 10, fontWeight: 700, color: "#7c3aed",
                  background: "#ede9fe", padding: "2px 7px", borderRadius: 20,
                }}>
                  Leg {(legIndex ?? 0) + 1} of {totalLegs}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>
              {flight.departTime} → {flight.arriveTime} · {flight.durationLabel} · {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: "50%", border: `1px solid ${S.border}`,
              background: S.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width={14} height={14} fill="none" stroke={S.navyDeep} strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {fareChanged && (
          <div style={{
            padding: "10px 20px", background: "#fffbeb", borderBottom: "1px solid #fef3c7",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
            <div style={{ fontSize: 11, color: "#92400e", fontWeight: 600 }}>
              The fare has changed since your search. The updated price is shown below.
            </div>
          </div>
        )}

        <div style={{ overflowY: "auto", flex: 1, padding: "20px" }}>
          {quoteLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ borderRadius: 16, border: `1px solid ${S.border}`, padding: 16 }}>
                  {[60, 80, 40, 40, 40].map((w, j) => (
                    <div key={j} style={{ height: j === 0 ? 16 : j === 1 ? 22 : 12, background: "#e2ecf7", borderRadius: 6, width: `${w}%`, marginBottom: 8 }} />
                  ))}
                </div>
              ))}
            </div>
          ) : quoteError ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: S.navyDeep, marginBottom: 4 }}>Could not load fares</div>
              <div style={{ fontSize: 12, color: S.muted, marginBottom: 20 }}>{quoteError}</div>
              <button
                onClick={() => {
                  setQuoteLoading(true); setQuoteError(null);
                  apiFareQuote(flight)
                    .then((r: FareQuoteResult) => { setTiers(r.tiers); setFareChanged(r.fareChanged); setQuoteLoading(false); })
                    .catch((e: unknown) => { setQuoteError(e instanceof Error ? e.message : "Failed"); setQuoteLoading(false); });
                }}
                style={{ background: S.accent, color: "#fff", border: "none", borderRadius: 10, padding: "10px 24px", fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "'Sora',sans-serif" }}
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                {tiers.map((tier, idx) => (
                  <FareTierCard key={tier.name} tier={tier} selected={selected === idx} onSelect={() => setSelected(idx)} />
                ))}
              </div>
              <p style={{ fontSize: 10, color: S.muted, marginTop: 14, lineHeight: 1.6 }}>
                {MOCK_MODE ? "* Mock mode — fares are simulated." : "* Fares per traveller. PlumTrips service fee not included."}
                {" "}CO₂ emissions: ~{co2Badge(flight.stops, flight.duration)} kg/traveller.
              </p>
            </>
          )}
        </div>

        {!quoteLoading && !quoteError && tiers.length > 0 && (
          <div style={{
            padding: "14px 20px", borderTop: `1px solid ${S.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: S.surface, flexShrink: 0, gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 10, color: S.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{tiers[selected]?.name}</div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, color: S.navyDeep, lineHeight: 1.1 }}>{formatINR(tiers[selected]?.price ?? 0)}</div>
              <div style={{ fontSize: 11, color: S.muted }}>per adult · {tiers[selected]?.cancellationFee}</div>
            </div>
            <button
              onClick={() => onBook(tiers[selected])}
              style={{
                background: S.accent, color: "#fff", border: "none", borderRadius: 12,
                padding: "13px 28px", fontFamily: "'Sora',sans-serif", fontWeight: 800,
                fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                letterSpacing: "0.04em", transition: "all .2s",
              }}
            >
              {(legIndex !== undefined && totalLegs && legIndex < totalLegs - 1)
                ? `Select Leg ${legIndex + 1} →`
                : "Continue →"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FLIGHT CARD ───────────────────────────────────────────

function FlightCard({
  flight, onViewFares,
}: {
  flight: DisplayFlight;
  onViewFares: (f: DisplayFlight) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: `1px solid ${hovered ? "rgba(0,71,127,0.28)" : S.border}`,
        overflow: "hidden",
        transition: "all .2s",
        transform: hovered ? "translateY(-1px)" : "none",
      }}
    >
      <div style={{ padding: "10px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

          {/* Airline */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 100, flexShrink: 0 }}>
            <AirlineLogo code={flight.airlineCode} size="md" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 11, color: S.navyDeep, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{flight.airline}</div>
              <div style={{ fontSize: 10, color: S.muted }}>{flight.flightNumber}</div>
              {flight.fareType !== "Regular" && (
                <span style={{ fontSize: 9, fontWeight: 800, color: S.green, background: S.greenBg, padding: "1px 5px", borderRadius: 10, marginTop: 2, display: "inline-block" }}>
                  {flight.fareType}
                </span>
              )}
            </div>
          </div>

          {/* Times + route line */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 0 }}>
            {/* Depart */}
            <div style={{ textAlign: "center", minWidth: 56 }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: S.ink, lineHeight: 1 }}>{flight.departTime}</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: S.muted, marginTop: 2 }}>{flight.fromCode}</div>
              {flight.terminal && <div style={{ fontSize: 9, color: S.mutedLt }}>T{flight.terminal}</div>}
            </div>

            {/* Route line */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "0 10px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7fa3", fontFamily: "'Sora',sans-serif" }}>{flight.durationLabel}</div>
              <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 3 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", border: `1.5px solid ${S.mutedLt}`, flexShrink: 0 }} />
                <div style={{ flex: 1, height: 1, background: S.borderMid, position: "relative" }}>
                  {flight.stops > 0 && (
                    <div style={{
                      position: "absolute", left: "50%", top: "50%",
                      transform: "translate(-50%,-50%)",
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#f59e0b", border: "2px solid #fff",
                    }} />
                  )}
                </div>
                <svg width={13} height={13} fill={S.navyMid} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
                </svg>
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: flight.stops === 0 ? S.green : "#d97706" }}>
                {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}${flight.stopInfo ? ` · ${flight.stopInfo}` : ""}`}
              </div>
            </div>

            {/* Arrive */}
            <div style={{ textAlign: "center", minWidth: 56 }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: S.ink, lineHeight: 1 }}>
                {flight.arriveTime}
                {flight.arriveDate !== flight.departDate && (
                  <sup style={{ fontSize: 10, color: S.accent, fontWeight: 700, marginLeft: 1 }}>+1</sup>
                )}
              </div>
              <div style={{ fontSize: 10, fontWeight: 600, color: S.muted, marginTop: 2 }}>{flight.toCode}</div>
            </div>
          </div>

          {/* Baggage + refundable */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: S.surface, borderRadius: 7, padding: "4px 7px" }}>
              <span style={{ fontSize: 11 }}>🧳</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#4a5e7a" }}>{flight.checkinBaggage}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, background: S.surface, borderRadius: 7, padding: "4px 7px" }}>
              <span style={{ fontSize: 11 }}>💼</span>
              <span style={{ fontSize: 11, fontWeight: 700, color: "#4a5e7a" }}>{flight.cabinBaggage}</span>
            </div>
          </div>

          {/* Price + CTA */}
          <div style={{
            paddingLeft: 14, borderLeft: `1px solid ${S.border}`,
            display: "flex", flexDirection: "column", alignItems: "flex-end",
            gap: 4, minWidth: 130, flexShrink: 0,
          }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: S.navyDeep, lineHeight: 1 }}>{formatINR(flight.price)}</div>
            <div style={{ fontSize: 10, color: S.muted }}>per adult</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: flight.isRefundable ? S.green : S.muted }}>
              {flight.isRefundable ? "✓ Refundable" : "Non-refundable"}
            </div>
            {flight.seatsLeft && flight.seatsLeft < 10 && (
              <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 700 }}>
                {flight.seatsLeft} seats left!
              </div>
            )}
            <button
              onClick={() => onViewFares(flight)}
              style={{
                background: S.accent, color: "#fff", border: "none",
                borderRadius: 10, padding: "9px 16px",
                fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 11,
                cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase",
                transition: "all .2s", marginTop: 2, whiteSpace: "nowrap",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = S.accentDk)}
              onMouseLeave={e => (e.currentTarget.style.background = S.accent)}
            >
              View Fares
            </button>
          </div>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          borderTop: `1px solid ${S.border}`,
          padding: "8px 0", fontSize: 11, color: S.muted,
          background: "transparent", border: "none",
          cursor: "pointer", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 5, fontWeight: 600,
          transition: "color .15s",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = S.navyMid)}
        onMouseLeave={e => (e.currentTarget.style.color = S.muted)}
      >
        {expanded ? "Hide details" : "Flight details & fare rules"}
        <svg
          width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2.5}
          viewBox="0 0 24 24"
          style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s" }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div style={{ borderTop: `1px solid ${S.border}`, background: S.surface, padding: "14px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              ["Aircraft",    flight.craft ?? "—"],
              ["Terminal",    flight.terminal ? `T${flight.terminal}` : "—"],
              ["Carrier",     flight.isLCC ? "Low-Cost" : "Full Service"],
              ["PAN required",flight.isPanRequired ? "Yes" : "No"],
              ["Passport",    flight.isPassportRequired ? "Yes" : "No"],
              ["CO₂",         `~${co2Badge(flight.stops, flight.duration)} kg`],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ background: "#fff", borderRadius: 10, padding: "8px 10px", border: `1px solid ${S.border}` }}>
                <div style={{ fontSize: 10, color: S.muted, fontWeight: 600 }}>{lbl}</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: S.navyDeep, marginTop: 2 }}>{val}</div>
              </div>
            ))}
          </div>
          {flight.lastTicketingDate && (
            <div style={{ marginTop: 8, fontSize: 10, color: "#b45309", fontWeight: 600 }}>
              ⏰ Book by {new Date(flight.lastTicketingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── FILTER PANEL ──────────────────────────────────────────

interface ExtendedFilters extends ActiveFilters {
  arrivalSlot: string | null;
  maxDuration: number | null;
}

function FilterPanel({
  flights, filters, onChange, onReset, mobile,
}: {
  flights: DisplayFlight[];
  filters: ExtendedFilters;
  onChange: (f: ExtendedFilters) => void;
  onReset: () => void;
  mobile?: boolean;
}) {
  const airlines = [...new Set(flights.map(f => f.airline))].sort();
  const prices = flights.map(f => f.price);
  const maxP = prices.length ? Math.max(...prices) : 20000;
  const minP = prices.length ? Math.min(...prices) : 1000;

  const fsLabel: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: S.muted,
    textTransform: "uppercase", letterSpacing: "0.08em",
    fontFamily: "'Sora',sans-serif", marginBottom: 10, display: "block",
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div style={{ padding: "14px 16px", borderBottom: `1px solid ${S.border}` }}>
      <span style={fsLabel}>{title}</span>
      {children}
    </div>
  );

  return (
    <div style={mobile ? {} : {
  background: "#fff", borderRadius: 16, border: `1px solid ${S.border}`,
  overflow: "hidden", position: "sticky", top: 16,
  maxHeight: "calc(100vh - 32px)", overflowY: "auto",
  scrollbarWidth: "none",          /* Firefox */
  msOverflowStyle: "none",         /* IE/Edge */
}}>
      {/* Header */}
      <div style={{
        padding: "14px 16px 0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingBottom: 14, borderBottom: `1px solid ${S.border}`,
      }}>
        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 12, color: S.navyDeep, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Filters
        </span>
        <button
          onClick={onReset}
          style={{ fontSize: 11, color: S.accent, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
        >
          Clear all
        </button>
      </div>

      {/* Stops */}
      <Section title="Stops">
        <div style={{ display: "flex", gap: 4 }}>
          {([null, 0, 1, 2] as const).map(s => {
            const active = filters.stops === s;
            return (
              <button
                key={String(s)}
                onClick={() => onChange({ ...filters, stops: filters.stops === s ? null : s })}
                style={{
                  flex: 1, textAlign: "center", padding: "7px 4px",
                  borderRadius: 8, fontSize: 11, fontWeight: 700,
                  fontFamily: "'Sora',sans-serif", cursor: "pointer",
                  border: `1px solid ${active ? S.navyDeep : S.borderMid}`,
                  background: active ? S.navyDeep : "#fff",
                  color: active ? "#fff" : "#6b7fa3",
                  transition: "all .15s",
                }}
              >
                {s === null ? "Any" : s === 0 ? "Direct" : `${s} stop`}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Max Price */}
      <Section title="Price per adult">
        <input
          type="range" min={minP} max={maxP} step={500}
          value={filters.maxPrice ?? maxP}
          onChange={e => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          style={{ width: "100%", accentColor: S.navyDeep, margin: "8px 0" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'Sora',sans-serif", fontWeight: 700 }}>
          <span style={{ color: S.muted }}>{formatINR(minP)}</span>
          <span style={{ color: S.navyDeep }}>{formatINR(filters.maxPrice ?? maxP)}</span>
        </div>
      </Section>

      {/* Departure time */}
      <Section title="Departure time">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {TIME_SLOTS.map(({ id, label, sub }) => {
            const active = filters.departureSlot === id;
            return (
              <button
                key={id}
                onClick={() => onChange({ ...filters, departureSlot: filters.departureSlot === id ? null : id })}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px", borderRadius: 9,
                  border: `1px solid ${active ? S.navyDeep : S.border}`,
                  background: active ? "#f0f6ff" : "#fff",
                  cursor: "pointer", transition: "all .15s",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.navyDeep, fontFamily: "'Sora',sans-serif" }}>{label}</div>
                  <div style={{ fontSize: 10, color: S.muted, marginTop: 1 }}>{sub}</div>
                </div>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  border: `1.5px solid ${active ? S.navyDeep : S.borderMid}`,
                  background: active ? S.navyDeep : "transparent",
                  transition: "all .15s",
                }} />
              </button>
            );
          })}
        </div>
      </Section>

      {/* Refundable */}
      <Section title="Fare type">
        <div style={{ display: "flex", gap: 6 }}>
          {([
            { val: true,  label: "Refundable"     },
            { val: false, label: "Non-refundable"  },
          ] as const).map(({ val, label }) => {
            const active = filters.refundable === val;
            return (
              <button
                key={label}
                onClick={() => onChange({ ...filters, refundable: filters.refundable === val ? null : val })}
                style={{
                  flex: 1, padding: "7px 6px", borderRadius: 8,
                  fontSize: 11, fontWeight: 700, fontFamily: "'Sora',sans-serif",
                  border: `1px solid ${active ? S.green : S.borderMid}`,
                  background: active ? S.greenBg : "#fff",
                  color: active ? S.green : "#6b7fa3",
                  cursor: "pointer", transition: "all .15s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Airlines */}
      {airlines.length > 0 && (
        <div style={{ padding: "14px 16px" }}>
          <span style={fsLabel}>Airlines</span>
          <div>
            {airlines.map((a, idx) => {
              const flightCount = flights.filter(f => f.airline === a).length;
              const minPrice = Math.min(...flights.filter(f => f.airline === a).map(f => f.price));
              const checked = filters.airlines.length === 0 || filters.airlines.includes(a);
              const code = flights.find(f => f.airline === a)?.airlineCode ?? "";
              return (
                <div
                  key={a}
                  onClick={() => {
                    const newList = checked
                      ? airlines.filter(x => x !== a)
                      : [...filters.airlines.filter(x => airlines.includes(x)), a];
                    onChange({ ...filters, airlines: newList.length === airlines.length ? [] : newList });
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "7px 0",
                    borderTop: idx > 0 ? `1px solid #f0f5fc` : "none",
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: `1.5px solid ${checked ? S.navyDeep : S.borderMid}`,
                    background: checked ? S.navyDeep : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .15s",
                  }}>
                    {checked && (
                      <svg width={9} height={9} fill="none" stroke="#fff" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <AirlineLogo code={code} size="sm" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#4a5e7a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a} <span style={{ color: S.muted, fontWeight: 500 }}>({flightCount})</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: S.accent, fontFamily: "'Sora',sans-serif", flexShrink: 0 }}>
                    {formatINR(minPrice)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MOBILE FILTER DRAWER ──────────────────────────────────

function MobileFilterDrawer({
  flights, filters, onChange, onReset, onClose,
}: {
  flights: DisplayFlight[];
  filters: ExtendedFilters;
  onChange: (f: ExtendedFilters) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div style={{
        position: "relative", width: "100%", background: "#fff",
        borderRadius: "20px 20px 0 0", maxHeight: "90dvh",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: `1px solid ${S.border}`, flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: S.navyDeep }}>Filters</span>
          <button
            onClick={onClose}
            style={{ fontSize: 13, color: S.accent, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
          >
            Done
          </button>
        </div>
        <div
  className="mobile-filter-scroll"
  style={{ overflowY: "auto", flex: 1, padding: "0 0 20px", scrollbarWidth: "none", msOverflowStyle: "none" }}
>
          <FilterPanel flights={flights} filters={filters} onChange={onChange} onReset={onReset} mobile />
        </div>
      </div>
    </div>
  );
}

// ─── SKELETON & EMPTY STATE ────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: `1px solid ${S.border}`,
      padding: "14px 16px",
    }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#e2ecf7", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ height: 12, background: "#e2ecf7", borderRadius: 6, width: "40%" }} />
          <div style={{ height: 10, background: "#eef3fa", borderRadius: 6, width: "25%" }} />
        </div>
        <div style={{ flex: 1, height: 2, background: "#eef3fa", borderRadius: 2 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end" }}>
          <div style={{ height: 20, background: "#e2ecf7", borderRadius: 6, width: 80 }} />
          <div style={{ height: 10, background: "#eef3fa", borderRadius: 6, width: 55 }} />
        </div>
        <div style={{ height: 34, width: 90, background: "#e2ecf7", borderRadius: 9, flexShrink: 0 }} />
      </div>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: `1px solid ${S.border}`,
      padding: "60px 40px", textAlign: "center",
    }}>
      <div style={{ fontSize: 44, marginBottom: 14 }}>✈️</div>
      <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 17, color: S.navyDeep, marginBottom: 6 }}>No flights found</div>
      <div style={{ fontSize: 13, color: S.muted, marginBottom: 24, maxWidth: 280, margin: "0 auto 24px" }}>
        No flights match your current filters. Try adjusting or removing some filters.
      </div>
      <button
        onClick={onReset}
        style={{
          background: S.accent, color: "#fff", border: "none", borderRadius: 10,
          padding: "11px 24px", fontFamily: "'Sora',sans-serif", fontWeight: 800,
          fontSize: 12, cursor: "pointer", letterSpacing: "0.04em",
        }}
      >
        Clear all filters
      </button>
    </div>
  );
}

// ─── SORT CHIP (mobile) ────────────────────────────────────

function SortChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, padding: "6px 14px", borderRadius: 20,
        fontSize: 11, fontWeight: 700, fontFamily: "'Sora',sans-serif",
        border: `1px solid ${active ? S.navyDeep : S.borderMid}`,
        background: active ? S.navyDeep : "#fff",
        color: active ? "#fff" : "#6b7fa3",
        cursor: "pointer", transition: "all .15s",
      }}
    >
      {label}
    </button>
  );
}

// ─── MAIN RESULTS PAGE ─────────────────────────────────────

interface ResultsPageProps {
  form: SearchForm;
  multiLegs?: CityLeg[];
  onBack: () => void;
  onBook: (flight: DisplayFlight, tier: FareTier, legIndex?: number) => void;
  onNewSearch?: (form: SearchForm, legs?: CityLeg[]) => void;
  selectedOutboundFlight?: DisplayFlight | null;
  selectedLegs?: Array<{ flight: DisplayFlight; tier: FareTier } | null>;
  searchKey?: string;
}

type SortKey = "price" | "duration" | "depart" | "arrive" | "stops";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "price",    label: "Cheapest"       },
  { key: "duration", label: "Fastest"         },
  { key: "depart",   label: "Depart ↑"        },
  { key: "arrive",   label: "Arrive ↑"        },
  { key: "stops",    label: "Non-stop first"  },
];

const defaultFilters = (): ExtendedFilters => ({
  stops: null, maxPrice: null, airlines: [],
  departureSlot: null, arrivalSlot: null,
  refundable: null, sortBy: "price", maxDuration: null,
});

export default function ResultsPage({
  form,
  multiLegs,
  onBack,
  onBook,
  onNewSearch,
  selectedOutboundFlight,
  selectedLegs,
  searchKey,
}: ResultsPageProps) {
  // Guard: if form is undefined (direct URL hit with no state)
  if (!form) {
    return (
      <div style={{ minHeight: "100vh", background: S.surface, fontFamily: "'DM Sans',sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <style>{`@import aside::-webkit-scrollbar { display: none; }
        @keyframes .mobile-filter-scroll::-webkit-scrollbar { display: none; }
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');`}</style>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✈️</div>
          <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: S.navyDeep, marginBottom: 8 }}>
            No search found
          </div>
          <div style={{ fontSize: 14, color: S.muted, marginBottom: 24 }}>
            Please start a new search to see flight results.
          </div>
          <button
            onClick={onBack}
            style={{
              background: S.accent, color: "#fff", border: "none", borderRadius: 12,
              padding: "12px 28px", fontFamily: "'Sora',sans-serif", fontWeight: 800,
              fontSize: 13, cursor: "pointer",
            }}
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  const [allFlights, setAllFlights] = useState<DisplayFlight[]>([]);
  const [returnFlightsList, setReturnFlightsList] = useState<DisplayFlight[]>([]);
  const [multiLegFlightsList, setMultiLegFlightsList] = useState<DisplayFlight[][]>([]);
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExtendedFilters>(defaultFilters());
  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [selectedFlight, setSelectedFlight] = useState<DisplayFlight | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const isRoundTrip = form.tripType === "roundTrip";
  const isMultiCity = form.tripType === "multiCity";
  const legs = multiLegs ?? [];

  useEffect(() => {
    if (!isMultiCity || !selectedLegs) return;
    const nextUnselected = selectedLegs.findIndex(l => !l);
    if (nextUnselected !== -1 && nextUnselected !== activeTab) setActiveTab(nextUnselected);
  }, [selectedLegs]); // eslint-disable-line

  useEffect(() => {
    if (isMultiCity) { setFilters(defaultFilters()); setSortKey("price"); }
  }, [activeTab]); // eslint-disable-line

  const derivedSearchKey = searchKey ?? JSON.stringify({
    from: form.from?.code,
    to: form.to?.code,
    depart: form.departDate,
    ret: form.returnDate,
    type: form.tripType,
    adults: form.adults,
    children: form.children,
    infants: form.infants,
    cabin: form.cabinClass,
    legs: multiLegs?.map(l => `${l.from.code}-${l.to.code}-${l.departDate}`).join("|"),
  });

  const fetchFlights = useCallback(() => {
    setLoading(true); setSearchError(null); setMultiLegFlightsList([]);
    apiSearchFlights(form, multiLegs)
      .then((result: FlightSearchResult) => {
        setAllFlights(result.outbound ?? []);
        setReturnFlightsList(result.returnFlights ?? []);
        if (result.multiLegFlights && result.multiLegFlights.length > 0) {
          setMultiLegFlightsList(result.multiLegFlights);
        } else if (isMultiCity && result.outbound && result.outbound.length > 0) {
          const legCount = legs.length;
          const byLeg: DisplayFlight[][] = Array.from({ length: legCount }, () => []);
          for (const f of result.outbound) {
            let legIdx = (f as any)._legIndex;
            if (legIdx === undefined) {
              legIdx = legs.findIndex(l => l.from.code === f.fromCode && l.to.code === f.toCode);
            }
            if (legIdx >= 0 && legIdx < legCount) byLeg[legIdx].push(f);
          }
          setMultiLegFlightsList(byLeg);
        }
        setLoading(false);
      })
      .catch((e: any) => { setSearchError(e?.message ?? "Search failed"); setLoading(false); });
  }, [form, multiLegs]); // eslint-disable-line

  useEffect(() => {
    fetchFlights();
  }, [derivedSearchKey]); // eslint-disable-line

  const resetFilters = () => setFilters(defaultFilters());

  const sourceFlights = useMemo(() => {
    if (isMultiCity) return multiLegFlightsList[activeTab] ?? [];
    return allFlights;
  }, [isMultiCity, allFlights, multiLegFlightsList, activeTab]);

  const applyFiltersAndSort = (list: DisplayFlight[]) => {
    return list.filter(f => {
      if (filters.stops !== null && f.stops !== filters.stops) return false;
      if (filters.maxPrice !== null && f.price > filters.maxPrice) return false;
      if (filters.maxDuration !== null && f.duration > filters.maxDuration) return false;
      if (filters.airlines.length > 0 && !filters.airlines.includes(f.airline)) return false;
      if (filters.refundable !== null && f.isRefundable !== filters.refundable) return false;
      if (!slotMatch(f.departTime, filters.departureSlot)) return false;
      if (!slotMatch(f.arriveTime, filters.arrivalSlot)) return false;
      if (form.nonStopOnly && f.stops > 0) return false;
      return true;
    }).sort((a, b) => {
      switch (sortKey) {
        case "price":    return a.price - b.price;
        case "duration": return a.duration - b.duration;
        case "depart":   return timeToMins(a.departTime) - timeToMins(b.departTime);
        case "arrive":   return timeToMins(a.arriveTime) - timeToMins(b.arriveTime);
        case "stops":    return a.stops - b.stops;
        default:         return 0;
      }
    });
  };

  const filtered = useMemo(() => applyFiltersAndSort(sourceFlights), [sourceFlights, filters, sortKey, form.nonStopOnly]);
  const filteredReturn = useMemo(() => applyFiltersAndSort(returnFlightsList), [returnFlightsList, filters, sortKey, form.nonStopOnly]);

  const activeFilterCount = [
    filters.stops !== null, filters.maxPrice !== null, filters.airlines.length > 0,
    !!filters.departureSlot, !!filters.arrivalSlot, filters.refundable !== null,
  ].filter(Boolean).length;

  const cheapestPrice = sourceFlights.length ? Math.min(...sourceFlights.map(f => f.price)) : null;
  const fastestDur    = sourceFlights.length ? Math.min(...sourceFlights.map(f => f.duration)) : null;

  return (
    <div style={{ minHeight: "100vh", background: S.surface, fontFamily: "'DM Sans',sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{
        background: `linear-gradient(160deg, #081428 0%, ${S.navy} 60%, ${S.navyMid} 100%)`,
      }}>
       <div style={{ width: "100%", padding: "0" }}>

  <OneSearchBar
    form={form}
    onSearch={(f, legs) => onNewSearch?.(f, legs)}
  />


          {/* Multi-city leg tabs */}
          {isMultiCity && legs.length > 0 && (
  <div style={{
    display: "flex", gap: 4, paddingTop: 8, paddingBottom: 0,
    overflowX: "auto", paddingLeft: 24,
  }}>
              {legs.map((leg, i) => {
                const isSelected = !!(selectedLegs?.[i]);
                const isCurrent = activeTab === i;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    style={{
                      flexShrink: 0, padding: "8px 16px",
                      borderRadius: "10px 10px 0 0",
                      fontSize: 11, fontWeight: 800,
                      fontFamily: "'Sora',sans-serif",
                      border: "none", cursor: "pointer",
                      background: isCurrent ? "#fff" : "rgba(255,255,255,0.1)",
                      color: isCurrent ? S.navyDeep : "rgba(255,255,255,0.65)",
                      display: "flex", alignItems: "center", gap: 6,
                      transition: "all .15s",
                    }}
                  >
                    {isSelected && (
                      <span style={{
                        width: 14, height: 14, borderRadius: "50%",
                        background: "#10b981",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <svg width={8} height={8} fill="none" stroke="#fff" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                    Leg {i + 1}: {leg.from.code} → {leg.to.code}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* ── SORT BAR ── */}
      <div
        className="hidden lg:flex"
        style={{
          background: "#fff",
          borderBottom: `1px solid ${S.border}`,
        }}
      >
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "stretch", width: "100%", overflowX: "auto" }}>
          {SORT_OPTIONS.map(({ key, label }) => {
            const active = sortKey === key;
            const subVal = key === "price" && cheapestPrice
              ? formatINR(cheapestPrice)
              : key === "duration" && fastestDur
                ? durationStr(fastestDur)
                : null;
            return (
              <button
                key={key}
                onClick={() => setSortKey(key)}
                style={{
                  padding: "13px 20px", fontSize: 11, fontWeight: 800,
                  fontFamily: "'Sora',sans-serif",
                  color: active ? S.navyDeep : S.muted,
                  background: "none",
                  border: "none",
                  borderBottom: `2px solid ${active ? S.accent : "transparent"}`,
                  cursor: "pointer", whiteSpace: "nowrap",
                  textTransform: "uppercase", letterSpacing: "0.04em",
                  display: "flex", flexDirection: "column", gap: 2,
                  transition: "color .15s, border-color .15s",
                }}
              >
                {label}
                {subVal && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: active ? S.accent : S.muted, textTransform: "none", letterSpacing: 0 }}>
                    {subVal}
                  </span>
                )}
              </button>
            );
          })}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", paddingLeft: 16, flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: S.muted, fontWeight: 600 }}>
              {loading ? "Searching…" : <><b style={{ color: S.accent }}>{filtered.length}</b> of {sourceFlights.length} flights</>}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile filter chip row */}
      <div
        className="lg:hidden"
        style={{
          background: "#fff", borderBottom: `1px solid ${S.border}`,
          padding: "8px 16px", display: "flex", alignItems: "center", gap: 8,
          overflowX: "auto", position: "sticky", top: 0, zIndex: 30,
        }}
      >
        <button
          onClick={() => setShowFilters(true)}
          style={{
            flexShrink: 0, display: "flex", alignItems: "center", gap: 6,
            padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
            fontFamily: "'Sora',sans-serif", cursor: "pointer", transition: "all .15s",
            border: `1px solid ${activeFilterCount > 0 ? S.navyDeep : S.borderMid}`,
            background: activeFilterCount > 0 ? S.navyDeep : "#fff",
            color: activeFilterCount > 0 ? "#fff" : "#6b7fa3",
          }}
        >
          <svg width={12} height={12} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 8h10M11 12h2" />
          </svg>
          Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>
        <div style={{ width: 1, height: 18, background: S.border, flexShrink: 0 }} />
        {SORT_OPTIONS.map(({ key, label }) => (
          <SortChip key={key} label={label} active={sortKey === key} onClick={() => setSortKey(key)} />
        ))}
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "20px 24px", display: "flex", gap: 20 }}>

        {/* Desktop sidebar */}
        <aside style={{ width: 260, flexShrink: 0 }} className="hidden lg:block">
          <FilterPanel
            flights={sourceFlights} filters={filters}
            onChange={setFilters} onReset={resetFilters}
          />
        </aside>

        {/* Results */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>

          <div
            className="hidden lg:flex"
            style={{ alignItems: "center", gap: 8, padding: "0 2px" }}
          >
            <div style={{ width: 14, height: 2, background: S.accent, borderRadius: 2 }} />
            <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 11, color: S.navyDeep, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {isMultiCity
                ? `Leg ${activeTab + 1} · ${legs[activeTab]?.from.code} → ${legs[activeTab]?.to.code}`
                : "Departing flights"}
            </span>
            <span style={{ fontSize: 11, color: S.muted, marginLeft: 4 }}>
              {loading ? "Searching…" : `${filtered.length} of ${sourceFlights.length} flights`}
            </span>
          </div>

          {/* Multi-city status */}
          {isMultiCity && legs.length > 0 && !loading && (
            <div>
              {multiLegFlightsList[activeTab]?.length === 0 ? (
                <div style={{
                  background: "#fffbeb", border: `1px solid #fef3c7`,
                  borderRadius: 12, padding: "10px 14px",
                  fontSize: 12, color: "#92400e", fontWeight: 600,
                }}>
                  No flights found for Leg {activeTab + 1}: {legs[activeTab]?.from.code} → {legs[activeTab]?.to.code}. Try different dates or nearby airports.
                </div>
              ) : (
                <div style={{ fontSize: 11, color: S.muted, fontWeight: 600, padding: "0 2px" }}>
                  Leg {activeTab + 1}: {legs[activeTab]?.from.code} → {legs[activeTab]?.to.code}
                  {selectedLegs?.[activeTab] ? " ✓ Selected" : " — pick your flight"}
                </div>
              )}
            </div>
          )}

          {/* Round trip step indicator */}
          {isRoundTrip && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981" }} />
              <span style={{ fontSize: 13, fontWeight: 800, fontFamily: "'Sora',sans-serif", color: S.navyDeep }}>
                {selectedOutboundFlight ? "✓ Outbound Selected" : "Step 1: Pick Outbound Flight"}
                {" · "}{form.from?.code} → {form.to?.code}
              </span>
            </div>
          )}

          {/* Main list */}
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : searchError ? (
            <div style={{
              background: "#fff", borderRadius: 16, border: "1px solid #fde8e8",
              padding: "40px 20px", textAlign: "center",
            }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>⚠️</div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: S.navyDeep, marginBottom: 6 }}>Search failed</div>
              <div style={{ fontSize: 12, color: S.muted, marginBottom: 20 }}>{searchError}</div>
              <button
                onClick={fetchFlights}
                style={{
                  background: S.accent, color: "#fff", border: "none", borderRadius: 10,
                  padding: "10px 24px", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer",
                }}
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {(!isRoundTrip || !selectedOutboundFlight) && filtered.length === 0 ? (
                <EmptyState onReset={resetFilters} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {filtered.map(f => (
                    <FlightCard key={f.resultIndex} flight={f} onViewFares={setSelectedFlight} />
                  ))}
                </div>
              )}

              {/* Outbound selected banner */}
              {isRoundTrip && selectedOutboundFlight && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", margin: "6px 0",
                  background: "#f0fdf6", border: "1px solid #bbf7d0", borderRadius: 14,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", background: "#10b981",
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <svg width={12} height={12} fill="none" stroke="#fff" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#065f46", fontFamily: "'Sora',sans-serif" }}>
                      Outbound selected: {selectedOutboundFlight.airline} {selectedOutboundFlight.flightNumber}
                    </div>
                    <div style={{ fontSize: 11, color: "#059669", marginTop: 1 }}>
                      {selectedOutboundFlight.departTime} → {selectedOutboundFlight.arriveTime} · Now pick your return flight below ↓
                    </div>
                  </div>
                </div>
              )}

              {/* Return flights */}
              {isRoundTrip && filteredReturn.length > 0 && (
                <>
                  <div id="return-flights-section" style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 6px" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: selectedOutboundFlight ? S.navyMid : "#10b981" }} />
                    <span style={{ fontSize: 13, fontWeight: 800, fontFamily: "'Sora',sans-serif", color: S.navyDeep }}>
                      {selectedOutboundFlight ? "Step 2: Pick Return Flight" : "Return"}
                      {" · "}{form.to?.code} → {form.from?.code}
                    </span>
                    <span style={{ fontSize: 11, color: S.muted }}>
                      {form.returnDate ? new Date(form.returnDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filteredReturn.map(f => (
                      <FlightCard key={f.resultIndex} flight={f} onViewFares={setSelectedFlight} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <MobileFilterDrawer
          flights={sourceFlights} filters={filters}
          onChange={setFilters} onReset={resetFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Fare modal */}
      {selectedFlight && (
        <FareModal
          flight={selectedFlight}
          legIndex={isMultiCity ? activeTab : undefined}
          totalLegs={isMultiCity ? legs.length : undefined}
          onClose={() => setSelectedFlight(null)}
          onBook={tier => {
            setSelectedFlight(null);
            onBook(selectedFlight, tier, isMultiCity ? activeTab : undefined);
            if (isRoundTrip && !selectedOutboundFlight) {
              setTimeout(() => {
                document.getElementById("return-flights-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
              }, 300);
            }
          }}
        />
      )}
    </div>
  );
}
