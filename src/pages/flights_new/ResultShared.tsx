// ============================================================
//  resultsShared.tsx — tokens, types & helpers shared by the
//  Results Page family of components (DateStrip, FilterPanel,
//  FlightCard, FareModal, ResultsPage).
//
//  NOTHING in this file changes any business logic — it is a
//  1:1 lift of what already lived inline inside ResultsPage.tsx.
// ============================================================

import { useState } from "react";
import type { Airport, ActiveFilters } from "../../lib/types_t";

export type CityLeg = { from: Airport; to: Airport; departDate: string };

// ─── CONSTANTS ─────────────────────────────────────────────

export const AIRLINE_COLORS: Record<string, { bg: string; text: string }> = {
  "6E": { bg: "#1b4b9e", text: "#fff" },
  AI: { bg: "#c8102e", text: "#fff" },
  SG: { bg: "#d03f2f", text: "#fff" },
  UK: { bg: "#5c1c81", text: "#fff" },
  QP: { bg: "#e87722", text: "#fff" },
  IX: { bg: "#c8102e", text: "#fff" },
  G8: { bg: "#f5a623", text: "#000" },
  "2T": { bg: "#00796b", text: "#fff" },
};

export const TIME_SLOTS = [
  { id: "early", label: "Early morning", sub: "Before 6 AM", range: [0, 6] },
  { id: "morning", label: "Morning", sub: "6 AM – 12 PM", range: [6, 12] },
  { id: "afternoon", label: "Afternoon", sub: "12 PM – 6 PM", range: [12, 18] },
  { id: "evening", label: "Evening", sub: "After 6 PM", range: [18, 24] },
];

// ─── HELPERS ───────────────────────────────────────────────

export function durationStr(mins: number) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export function timeToMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function slotMatch(time: string, slotId: string | null) {
  if (!slotId) return true;
  const slot = TIME_SLOTS.find((s) => s.id === slotId);
  if (!slot) return true;
  const h = Math.floor(timeToMins(time) / 60);
  return h >= slot.range[0] && h < slot.range[1];
}

export function co2Badge(stops: number, duration: number) {
  const base = 80 + duration * 0.15 + stops * 25;
  return Math.round(base);
}

// ─── SHARED STYLE TOKENS ───────────────────────────────────

export const S = {
  navy: "#00305f",
  navyDeep: "#0d2d5e",
  navyMid: "#00477f",
  accent: "#d06549",
  accentDk: "#b8543a",
  accentLt: "#f9c08a",
  muted: "#8fafd4",
  mutedLt: "#b0bfd4",
  border: "#e2ecf7",
  borderMid: "#c9d5e8",
  surface: "#f5f8fc",
  ink: "#0d1f3c",
  green: "#0d7a52",
  greenBg: "#e8f8f1",
};

// ─── EXTENDED FILTERS TYPE ─────────────────────────────────

export interface ExtendedFilters extends ActiveFilters {
  arrivalSlot: string | null;
  maxDuration: number | null;
  minPrice: number | null;
  fareType: string | null;
}

// export interface ExtendedFilters extends ActiveFilters {
//   arrivalSlot: string | null;
//   maxDuration: number | null;

// }

// ─── AIRLINE BADGE ─────────────────────────────────────────

export function AirlineLogo({
  code,
  size = "md",
}: {
  code: string;
  size?: "sm" | "md" | "lg";
}) {
  const [imgFailed, setImgFailed] = useState(false);

  const color = AIRLINE_COLORS[code] ?? { bg: "#475569", text: "#fff" };

  const dims: Record<string, React.CSSProperties> = {
    sm: { width: 32, height: 32, fontSize: 9, borderRadius: 8 },
    md: { width: 40, height: 40, fontSize: 10, borderRadius: 11 },
    lg: { width: 48, height: 48, fontSize: 11, borderRadius: 13 },
  };

  return (
    <div
      style={{
        ...dims[size],
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
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
          onError={() => setImgFailed(true)}
        />
      )}
    </div>
  );
}