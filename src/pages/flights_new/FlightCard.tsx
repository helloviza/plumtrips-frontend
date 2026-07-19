// ============================================================
//  FlightCard.tsx — the individual flight result row/card,
//  its loading skeleton, and the empty-results state.
//
//  Visual redesign (no data-shape changes): tighter grid,
//  optional "Cheapest / Fastest / Recommended" tag chip +
//  top ribbon, inline baggage row, and a cleaner footer link
//  bar. All new props are OPTIONAL — existing callers that only
//  pass `flight` + `onViewFares` keep working unchanged.
// ============================================================

import { useState } from "react";
import type { DisplayFlight } from "../../lib/types_t";
import { useCurrency } from "../../context/currencyContext";
import { S, AirlineLogo, co2Badge } from "./ResultShared";

export type FlightCardTag = "recommended" | "cheapest" | "fastest";

const TAG_META: Record<FlightCardTag, { label: string; bg: string; fg: string }> = {
  recommended: { label: "Recommended", bg: S.greenBg, fg: S.green },
  cheapest:    { label: "Cheapest",     bg: "#e6f0ff", fg: "#1d4ed8" },
  fastest:     { label: "Fast arrival", bg: "#f3e8ff", fg: "#7c3aed" },
};

// ─── FLIGHT CARD ───────────────────────────────────────────

export function FlightCard({
  flight,
  onViewFares,
  tag,
  /** Optional real on-time performance (0-100). Omitted entirely
   *  when not supplied — never fabricated in this component. */
  onTimePercent,
}: {
  flight: DisplayFlight;
  onViewFares: (f: DisplayFlight) => void;
  tag?: FlightCardTag;
  onTimePercent?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { convert } = useCurrency();

  const tagMeta = tag ? TAG_META[tag] : null;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        border: `1px solid ${hovered ? "rgba(0,71,127,0.28)" : S.border}`,
        overflow: "hidden",
        transition: "box-shadow .2s, border-color .2s, transform .2s",
        transform: hovered ? "translateY(-2px)" : "none",
        boxShadow: hovered
          ? "0 10px 24px -12px rgba(13,45,94,0.22)"
          : "0 1px 2px rgba(13,45,94,0.04)",
        position: "relative",
      }}
    >
      {/* Ribbon — only for the top AI/algorithmic pick */}
      {tag === "recommended" && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 16,
            background: S.green,
            color: "#fff",
            fontFamily: "'Sora',sans-serif",
            fontWeight: 800,
            fontSize: 9,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "4px 10px",
            borderRadius: "0 0 8px 8px",
          }}
        >
          Recommended
        </div>
      )}

      <div className="fc-pad" style={{ padding: "14px 18px 10px", paddingTop: tag === "recommended" ? 22 : 14 }}>
        <div className="fc-row" style={{ display: "flex", alignItems: "center", gap: 14 }}>

          {/* Airline */}
          <div className="fc-airline" style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 118, flexShrink: 0 }}>
            <AirlineLogo code={flight.airlineCode} size="md" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 12, color: S.navyDeep, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {flight.airline}
              </div>
              <div style={{ fontSize: 10.5, color: S.muted, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {flight.flightNumber}{flight.craft ? ` · ${flight.craft}` : ""}
              </div>
              {flight.fareType !== "Regular" && (
                <span style={{ fontSize: 9, fontWeight: 800, color: S.green, background: S.greenBg, padding: "1px 6px", borderRadius: 10, marginTop: 3, display: "inline-block" }}>
                  {flight.fareType}
                </span>
              )}
            </div>
          </div>

          {/* Times + route line */}
          <div className="fc-times" style={{ flex: 1, display: "flex", alignItems: "center", gap: 0, minWidth: 0 }}>
            {/* Depart */}
            <div style={{ textAlign: "center", minWidth: 58 }}>
              <div className="fc-time-val" style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: S.ink, lineHeight: 1 }}>{flight.departTime}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: S.muted, marginTop: 3 }}>{flight.fromCode}</div>
              {flight.terminal && <div style={{ fontSize: 9, color: S.mutedLt, marginTop: 1 }}>Terminal {flight.terminal}</div>}
            </div>

            {/* Route line */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "0 12px", minWidth: 0 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#6b7fa3", fontFamily: "'Sora',sans-serif" }}>{flight.durationLabel}</div>
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
              <div style={{ fontSize: 10.5, fontWeight: 700, color: flight.stops === 0 ? S.green : "#d97706", whiteSpace: "nowrap" }}>
                {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}${flight.stopInfo ? ` · ${flight.stopInfo}` : ""}`}
              </div>
            </div>

            {/* Arrive */}
            <div style={{ textAlign: "center", minWidth: 58 }}>
              <div className="fc-time-val" style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: S.ink, lineHeight: 1 }}>
                {flight.arriveTime}
                {flight.arriveDate !== flight.departDate && (
                  <sup style={{ fontSize: 10, color: S.accent, fontWeight: 700, marginLeft: 1 }}>+1</sup>
                )}
              </div>
              <div style={{ fontSize: 10, fontWeight: 700, color: S.muted, marginTop: 3 }}>{flight.toCode}</div>
            </div>
          </div>

          {/* Baggage */}
          <div className="fc-bags" style={{ display: "flex", flexDirection: "column", gap: 5, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: S.surface, borderRadius: 7, padding: "4px 8px" }}>
              <span style={{ fontSize: 11, lineHeight: 1 }}>💼</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#4a5e7a", whiteSpace: "nowrap" }}>Cabin {flight.cabinBaggage}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, background: S.surface, borderRadius: 7, padding: "4px 8px" }}>
              <span style={{ fontSize: 11, lineHeight: 1 }}>🧳</span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: "#4a5e7a", whiteSpace: "nowrap" }}>Check-in {flight.checkinBaggage}</span>
            </div>
          </div>

          {/* Price + CTA */}
          <div className="fc-price" style={{
            paddingLeft: 16, borderLeft: `1px solid ${S.border}`,
            display: "flex", flexDirection: "column", alignItems: "flex-end",
            gap: 5, minWidth: 140, flexShrink: 0,
          }}>
            {tagMeta && (
              <span style={{
                fontSize: 9.5, fontWeight: 800, color: tagMeta.fg, background: tagMeta.bg,
                padding: "2px 8px", borderRadius: 20, letterSpacing: "0.02em",
              }}>
                {tagMeta.label}
              </span>
            )}
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, color: S.navyDeep, lineHeight: 1, marginTop: tagMeta ? 2 : 0 }}>
              {convert(flight.price)}
            </div>
            <div style={{ fontSize: 10, color: S.muted }}>total fare</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: flight.isRefundable ? S.green : S.muted }}>
              {flight.isRefundable ? "✓ Refundable" : "Non-refundable"}
            </div>
            {flight.seatsLeft != null && flight.seatsLeft < 10 && (
              <div style={{ fontSize: 10, color: "#ef4444", fontWeight: 700 }}>
                {flight.seatsLeft} seats left!
              </div>
            )}
            <button
              onClick={() => onViewFares(flight)}
              className="fc-cta"
              style={{
                background: S.accent, color: "#fff", border: "none",
                borderRadius: 10, padding: "10px 18px",
                fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 11,
                cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase",
                transition: "background .2s, transform .15s", marginTop: 3, whiteSpace: "nowrap",
                display: "flex", alignItems: "center", gap: 6,
              }}
              onMouseEnter={e => (e.currentTarget.style.background = S.accentDk)}
              onMouseLeave={e => (e.currentTarget.style.background = S.accent)}
            >
              View Fares
              <svg width={11} height={11} fill="none" stroke="#fff" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Footer link bar */}
      <div
        style={{
          borderTop: `1px solid ${S.border}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 18px",
          background: hovered ? S.surface : "#fff",
          transition: "background .15s",
        }}
      >
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            padding: "9px 0", fontSize: 11.5, color: S.navyMid,
            background: "transparent", border: "none",
            cursor: "pointer", display: "flex", alignItems: "center",
            gap: 5, fontWeight: 700, fontFamily: "'Sora',sans-serif",
          }}
        >
          {expanded ? "Hide details" : "Flight details & fare rules"}
          <svg
            width={11} height={11} fill="none" stroke="currentColor" strokeWidth={2.5}
            viewBox="0 0 24 24"
            style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform .2s" }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {onTimePercent != null && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700, color: S.muted }}>
            <svg width={11} height={11} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" d="M12 7v5l3 3" />
            </svg>
            {onTimePercent}% On-Time
          </div>
        )}
      </div>

      {expanded && (
        <div style={{ borderTop: `1px solid ${S.border}`, background: S.surface, padding: "14px 16px" }}>
          <div className="fc-details-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {[
              ["Aircraft",     flight.craft ?? "—"],
              ["Terminal",     flight.terminal ? `T${flight.terminal}` : "—"],
              ["Carrier",      flight.isLCC ? "Low-Cost" : "Full Service"],
              ["PAN required", flight.isPanRequired ? "Yes" : "No"],
              ["Passport",     flight.isPassportRequired ? "Yes" : "No"],
              ["CO₂",          `~${co2Badge(flight.stops, flight.duration)} kg`],
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

// ─── SKELETON & EMPTY STATE ────────────────────────────────

export function SkeletonCard() {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, border: `1px solid ${S.border}`,
      padding: "16px 18px",
    }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "#e2ecf7", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ height: 12, background: "#e2ecf7", borderRadius: 6, width: "40%" }} />
          <div style={{ height: 10, background: "#eef3fa", borderRadius: 6, width: "25%" }} />
        </div>
        <div className="hidden sm:block" style={{ flex: 1, height: 2, background: "#eef3fa", borderRadius: 2 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end" }}>
          <div style={{ height: 20, background: "#e2ecf7", borderRadius: 6, width: 80 }} />
          <div style={{ height: 10, background: "#eef3fa", borderRadius: 6, width: 55 }} />
        </div>
        <div className="hidden sm:block" style={{ height: 36, width: 96, background: "#e2ecf7", borderRadius: 10, flexShrink: 0 }} />
      </div>
    </div>
  );
}

export function EmptyState({ onReset }: { onReset: () => void }) {
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