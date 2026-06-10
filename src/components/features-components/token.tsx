// ─────────────────────────────────────────────
// PlumTrips — Design Tokens & Shared Primitives
// ─────────────────────────────────────────────
import React from "react";

// ── Color Palette ────────────────────────────
export const C = {
  orange:    "#FF682C",
  navy:      "#0A1E3F",
  navyDeep:  "#061224",
  blue:      "#2D8CFF",
  slate:     "#6A94A6",
  softWhite: "#F5F7FA",
  textMuted: "#6B7280",
  border:    "rgba(255,255,255,0.10)",
  cardBg:    "rgba(10,30,63,0.68)",
} as const;

// ── SVG defaults ──────────────────────────────
export const SVG_PROPS = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// ── Icons ─────────────────────────────────────
export const IconArrow   = () => <svg width="16" height="16" viewBox="0 0 24 24" {...SVG_PROPS}><path d="M5 12h14M13 6l6 6-6 6"/></svg>;
export const IconCheck   = () => <svg width="14" height="14" viewBox="0 0 24 24" {...SVG_PROPS}><path d="m20 6-11 11-5-5"/></svg>;
export const IconTag     = () => <svg width="20" height="20" viewBox="0 0 24 24" {...SVG_PROPS}><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8Z"/><circle cx="7" cy="7" r="1.3"/></svg>;
export const IconGift    = () => <svg width="20" height="20" viewBox="0 0 24 24" {...SVG_PROPS}><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M12 8C9 8 7.5 3.5 9.5 3.5S12 8 12 8Zm0 0c3 0 4.5-4.5 2.5-4.5S12 8 12 8Z"/></svg>;
export const IconHeadset = () => <svg width="20" height="20" viewBox="0 0 24 24" {...SVG_PROPS}><path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="2.5" y="13" width="4" height="6" rx="1.5"/><rect x="17.5" y="13" width="4" height="6" rx="1.5"/><path d="M20 19a4 4 0 0 1-4 3h-2"/></svg>;
export const IconShield  = () => <svg width="20" height="20" viewBox="0 0 24 24" {...SVG_PROPS}><path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5l-8-3Z"/><path d="m9 12 2 2 4-4"/></svg>;
export const IconCal     = () => <svg width="20" height="20" viewBox="0 0 24 24" {...SVG_PROPS}><rect x="3" y="4.5" width="18" height="17" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/></svg>;
export const IconStar    = () => <svg width="20" height="20" viewBox="0 0 24 24" {...SVG_PROPS}><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.2l1-5.8L3.5 9.2l5.9-.9L12 3z"/></svg>;

export const ICON_MAP = {
  tag:      IconTag,
  gift:     IconGift,
  headset:  IconHeadset,
  shield:   IconShield,
  calendar: IconCal,
  star:     IconStar,
} as const;

// ── Typography base ────────────────────────────
export const FONT = "Poppins, sans-serif";

// ── SectionHead (shared across sections) ──────
interface SectionHeadProps {
  eyebrow: string;
  title: string;
  sub?: string;
  action?: string;
  dark?: boolean;
  onAction?: () => void;
}

export function SectionHead({ eyebrow, title, sub, action, dark, onAction }: SectionHeadProps) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24, marginBottom: 36, flexWrap: "wrap" }}>
      <div>
        <span style={{ display: "inline-block", marginBottom: 10, fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: C.orange }}>
          {eyebrow}
        </span>
        <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "2rem", lineHeight: 1.15, letterSpacing: "-0.02em", margin: 0, color: dark ? "#fff" : C.navy }}>
          {title}
        </h2>
        {sub && (
          <p style={{ fontFamily: FONT, fontSize: 14, color: dark ? "rgba(255,255,255,0.6)" : C.textMuted, margin: "10px 0 0", maxWidth: 520, lineHeight: 1.6 }}>
            {sub}
          </p>
        )}
      </div>
      {action && (
        <button
          onClick={onAction}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 10, border: `1.5px solid ${C.orange}`, background: "none", color: C.orange, fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}
        >
          {action} <IconArrow />
        </button>
      )}
    </div>
  );
}