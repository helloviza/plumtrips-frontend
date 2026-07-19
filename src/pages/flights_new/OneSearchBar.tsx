// ============================================================
//  OneSearchBar.tsx — fully responsive (mobile / tablet / desktop)
//  All original logic preserved. Responsive layer added via
//  useBreakpoint() hook. Three distinct layouts:
//
//  Mobile  (<640px)  : Stacked card — each field on its own row,
//                      full-width search button at bottom.
//  Tablet  (640-1023): Two-column grid for airports + dates,
//                      travellers row below, compact search btn.
//  Desktop (≥1024px) : Original horizontal bar, unchanged.
// ============================================================

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import type { SearchForm, Airport } from "../../lib/types_t";
import { apiGetAirports, apiGetCalendarPrices } from "../../lib/flights_api";

// ─── MOCK FALLBACK ────────────────────────────────────────────────────────────
const MOCK_AIRPORTS: Airport[] = [
  { code: "DEL", city: "New Delhi",  name: "Indira Gandhi International",               cityCode: "DEL", country: "India", countryCode: "IN", label: "New Delhi (DEL)" },
  { code: "BOM", city: "Mumbai",     name: "Chhatrapati Shivaji Maharaj International", cityCode: "BOM", country: "India", countryCode: "IN", label: "Mumbai (BOM)" },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda International",                  cityCode: "BLR", country: "India", countryCode: "IN", label: "Bengaluru (BLR)" },
];

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface CityLeg {
  id: string;
  from: Airport;
  to:   Airport;
  departDate: string;
}

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const S = {
  navy:      "#00305f",
  navyDeep:  "#0d2d5e",
  navyMid:   "#00477f",
  accent:    "#d06549",
  accentDk:  "#b8543a",
  muted:     "#8fafd4",
  border:    "#e2ecf7",
  borderMid: "#c9d5e8",
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];
let legIdCounter = 0;
const newId = () => `leg-${++legIdCounter}`;

// ─── RESPONSIVE HOOK ──────────────────────────────────────────────────────────
function useBreakpoint() {
  const [w, setW] = useState(() => (typeof window !== "undefined" ? window.innerWidth : 1280));
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024, width: w };
}

// ─── FORMAT HELPER ────────────────────────────────────────────────────────────
function formatPriceShort(price: number): string {
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  if (price >= 1000)   return `₹${(price / 1000).toFixed(1)}k`;
  return `₹${price}`;
}

// ─── PORTAL POSITION HOOK ─────────────────────────────────────────────────────
function usePortalPos(anchorRef: React.RefObject<HTMLElement | null>, open: boolean) {
  const [pos, setPos] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  useEffect(() => {
    if (!open) { setPos(null); return; }
    function measure() {
      if (!anchorRef.current) return;
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height });
    }
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => { window.removeEventListener("scroll", measure, true); window.removeEventListener("resize", measure); };
  }, [open, anchorRef]);
  return pos;
}

// ─── AIRPORT DROPDOWN PORTAL ──────────────────────────────────────────────────
function AirportDropdownPortal({
  anchorRef, open, airports, onSelect, onClose, preferUp = false,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean; airports: Airport[];
  onSelect: (a: Airport) => void; onClose: () => void; preferUp?: boolean;
}) {
  const [query, setQuery] = useState("");
  const inputRef  = useRef<HTMLInputElement>(null);
  const popupRef  = useRef<HTMLDivElement>(null);
  const pos       = usePortalPos(anchorRef, open);
  const POPUP_H   = 300;
  const vw        = typeof window !== "undefined" ? window.innerWidth : 1280;
  const POPUP_W   = Math.min(320, vw - 16);

  useEffect(() => {
    if (open) { setQuery(""); setTimeout(() => inputRef.current?.focus(), 10); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return;
      if (popupRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, anchorRef, onClose]);

  if (!open || !pos) return null;

  const filtered = query.trim()
    ? airports.filter(a => {
        const q = query.toLowerCase();
        return a.city?.toLowerCase().includes(q) || a.code?.toLowerCase().includes(q) ||
          a.name?.toLowerCase().includes(q) || a.country?.toLowerCase().includes(q);
      })
    : airports.slice(0, 80);

  const spaceBelow = window.innerHeight - (pos.top - window.scrollY) - pos.height;
  const spaceAbove = pos.top - window.scrollY;
  const goAbove    = preferUp ? spaceAbove > spaceBelow : spaceBelow < POPUP_H + 16 && spaceAbove > spaceBelow;
  const top        = goAbove ? Math.max(8, pos.top - POPUP_H - 6) : pos.top + pos.height + 6;
  const left       = Math.max(8, Math.min(pos.left, window.innerWidth - POPUP_W - 8));

  return createPortal(
    <div ref={popupRef} style={{
      position: "absolute", top, left,
      width: POPUP_W, height: POPUP_H, zIndex: 99999,
      background: S.navy, borderRadius: 14,
      border: "1px solid rgba(255,255,255,0.15)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
      overflow: "hidden", display: "flex", flexDirection: "column",
    }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.10)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <svg style={{ width: 16, height: 16, color: "rgba(255,255,255,0.4)", flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input ref={inputRef}
          style={{ flex: 1, fontSize: 14, color: "white", outline: "none", background: "transparent", border: "none" }}
          placeholder="Search city or airport…"
          value={query} onChange={e => setQuery(e.target.value)} />
      </div>
      <div style={{ overflowY: "auto", flex: 1, WebkitOverflowScrolling: "touch" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "24px 16px", fontSize: 13, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>No airports found</div>
        ) : filtered.map(a => (
          <button key={a.code} type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => { onSelect(a); onClose(); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", textAlign: "left", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", color: "white" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, flexShrink: 0 }}>
              {a.code}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{a.city}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {a.name}{a.country ? ` · ${a.country}` : ""}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}

// ─── CALENDAR POPUP ───────────────────────────────────────────────────────────
function CalendarPopup({
  anchorRef, value, value2, isRange, min, onChange, onClose, preferUp = false, prices = {},
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  value: string; value2?: string; isRange?: boolean; min?: string;
  onChange: (d1: string, d2?: string) => void;
  onClose: () => void; preferUp?: boolean;
  prices?: Record<string, number>;
}) {
  const { isMobile } = useBreakpoint();
  const todayDate = new Date();
  const todayStr  = todayDate.toLocaleDateString("en-CA");
  const minStr    = min ?? todayStr;
  const popupRef  = useRef<HTMLDivElement>(null);
  const pos       = usePortalPos(anchorRef, true);

  // On mobile show 1 month; tablet/desktop show 2
  const showSingleMonth = isMobile;
  const POPUP_H = isRange ? (showSingleMonth ? 420 : 510) : (showSingleMonth ? 380 : 450);
  const POPUP_W = showSingleMonth ? Math.min(window.innerWidth - 16, 320) : 560;

  const parse = (s: string) => (s ? new Date(s + "T00:00:00") : null);
  const [hovering,  setHovering]  = useState<string | null>(null);
  const [selecting, setSelecting] = useState<"from" | "to">(
    value ? (isRange && !value2 ? "to" : "from") : "from"
  );
  const [vy,  setVy]  = useState(() => { const d = parse(value); return d ? d.getFullYear() : todayDate.getFullYear(); });
  const [vm,  setVm]  = useState(() => { const d = parse(value); return d ? d.getMonth() : todayDate.getMonth(); });
  const [vy2, setVy2] = useState(() => (vm === 11 ? vy + 1 : vy));
  const [vm2, setVm2] = useState(() => (vm === 11 ? 0 : vm + 1));

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return;
      if (popupRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose, anchorRef]);

  function advance(dir: 1 | -1) {
    let m = vm + dir, y = vy;
    if (m > 11) { m = 0; y++; }
    if (m < 0)  { m = 11; y--; }
    setVm(m); setVy(y);
    let m2 = m + 1, y2 = y;
    if (m2 > 11) { m2 = 0; y2++; }
    setVm2(m2); setVy2(y2);
  }

  function toStr(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function clickDay(s: string) {
    if (s < minStr) return;
    if (!isRange) { onChange(s); onClose(); return; }
    if (selecting === "from") { onChange(s, ""); setSelecting("to"); }
    else {
      if (s < value) onChange(s, value);
      else           onChange(value, s);
      onClose();
    }
  }

  function getVisiblePriceRange(): { min: number; max: number } {
    const dates: string[] = [];
    for (let d = 1; d <= new Date(vy, vm + 1, 0).getDate(); d++) dates.push(toStr(vy, vm, d));
    if (!showSingleMonth) {
      for (let d = 1; d <= new Date(vy2, vm2 + 1, 0).getDate(); d++) dates.push(toStr(vy2, vm2, d));
    }
    const vals = dates.map(s => prices[s]).filter((p): p is number => p !== undefined && p > 0);
    if (!vals.length) return { min: 0, max: 0 };
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }

  function priceColor(price: number, isSel: boolean, range: { min: number; max: number }): string {
    if (isSel) return "rgba(255,255,255,0.9)";
    if (!price || range.min === range.max) return "#059669";
    const ratio = (price - range.min) / (range.max - range.min);
    if (ratio < 0.33) return "#059669";
    if (ratio < 0.66) return "#d97706";
    return "#dc2626";
  }

  function renderMonth(y: number, m: number, priceRange: { min: number; max: number }) {
    const days  = new Date(y, m + 1, 0).getDate();
    const first = new Date(y, m, 1).getDay();
    const cells: React.ReactNode[] = [];
    for (let i = 0; i < first; i++) cells.push(<div key={`e${i}`} />);
    for (let d = 1; d <= days; d++) {
      const s        = toStr(y, m, d);
      const disabled = s < minStr;
      const sel      = s === value || (isRange && s === value2);
      const inRange  = isRange && value && value2 && s > value && s < value2;
      const hov      = isRange && value && !value2 && hovering && selecting === "to" &&
        ((s > value && s < hovering) || (s > hovering && s < value));
      const isToday  = s === todayStr;
      const price    = prices[s];
      const pColor   = priceColor(price ?? 0, !!sel, priceRange);

      cells.push(
        <button key={d} type="button" disabled={disabled}
          onMouseEnter={() => setHovering(s)}
          onMouseLeave={() => setHovering(null)}
          onMouseDown={e => e.preventDefault()}
          onClick={() => clickDay(s)}
          style={{
            height: showSingleMonth ? 42 : 46,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: (inRange || hov) && !disabled ? "rgba(0,71,127,0.10)" : "transparent",
            border: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.25 : 1,
          }}
        >
          <span style={{
            width: showSingleMonth ? 32 : 36, height: showSingleMonth ? 36 : 40,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 1, borderRadius: 8, fontSize: showSingleMonth ? 11 : 12, fontWeight: 700,
            background: sel ? S.accent : "transparent",
            color: sel ? "white" : isToday && !disabled ? S.accent : disabled ? "#9ca3af" : S.navyDeep,
            outline: isToday && !sel && !disabled ? `2px solid ${S.accent}` : "none",
            outlineOffset: -2,
          }}>
            <span style={{ lineHeight: 1 }}>{d}</span>
            {price !== undefined && !disabled && (
              <span style={{ fontSize: 7, fontWeight: 800, color: pColor, lineHeight: 1, whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>
                {formatPriceShort(price)}
              </span>
            )}
          </span>
        </button>
      );
    }
    return cells;
  }

  if (!pos) return null;

  const priceRange  = getVisiblePriceRange();
  const spaceBelow  = window.innerHeight - (pos.top - window.scrollY) - pos.height;
  const spaceAbove  = pos.top - window.scrollY;
  const goAbove     = preferUp ? spaceAbove > spaceBelow : spaceBelow < POPUP_H + 16 && spaceAbove > spaceBelow;
  const top         = goAbove ? Math.max(8, pos.top - POPUP_H - 6) : pos.top + pos.height + 6;
  const rawLeft     = showSingleMonth
    ? Math.max(8, (window.innerWidth - POPUP_W) / 2) // center on mobile
    : Math.max(8, Math.min(pos.left, window.innerWidth - POPUP_W - 8));

  const calendars = showSingleMonth
    ? [{ y: vy, m: vm }]
    : [{ y: vy, m: vm }, { y: vy2, m: vm2 }];

  return createPortal(
    <div ref={popupRef} style={{
      position: "absolute", top, left: rawLeft,
      zIndex: 99999, background: "white",
      borderRadius: 12, border: "1px solid #d0dff0",
      boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
      width: POPUP_W, overflow: "hidden",
    }}>
      {isRange && (
        <div style={{ display: "flex", borderBottom: "1px solid #e8eef8", background: "#f4f7fc" }}>
          {([
            { key: "from" as const, label: "Departure", v: value },
            { key: "to"   as const, label: "Return",    v: value2 ?? "" },
          ] as const).map(({ key, label, v }) => (
            <button key={key} type="button"
              onClick={() => { if (key === "to" && !value) return; setSelecting(key); }}
              style={{ flex: 1, padding: "10px 14px", textAlign: "left", background: "transparent", border: "none", borderBottom: selecting === key ? `2px solid ${S.accent}` : "2px solid transparent", cursor: "pointer" }}
            >
              <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: S.muted, marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: S.navyDeep }}>
                {v ? new Date(v + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Select date"}
              </div>
            </button>
          ))}
        </div>
      )}

      <div style={{ display: "flex" }}>
        {calendars.map((cal, idx) => (
          <div key={idx} style={{ flex: 1, padding: showSingleMonth ? 12 : 16, borderRight: !showSingleMonth && idx === 0 ? "1px solid #e8eef8" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              {(idx === 0) ? (
                <button type="button" onClick={() => advance(-1)}
                  style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4fa")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <svg style={{ width: 14, height: 14, color: "#6a8ab5" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              ) : <div style={{ width: 28 }} />}
              <span style={{ fontSize: 13, fontWeight: 900, color: S.navyDeep }}>{MONTHS[cal.m]} {cal.y}</span>
              {(showSingleMonth || idx === 1) ? (
                <button type="button" onClick={() => advance(1)}
                  style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4fa")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <svg style={{ width: 14, height: 14, color: "#6a8ab5" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : <div style={{ width: 28 }} />}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
              {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700, color: S.muted, padding: "3px 0" }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 1 }}>
              {renderMonth(cal.y, cal.m, priceRange)}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(prices).length > 0 && (
        <div style={{ borderTop: "1px solid #e8eef8", padding: "7px 14px", display: "flex", alignItems: "center", gap: 10, background: "#fafcff", flexWrap: "wrap" }}>
          <span style={{ fontSize: 9, color: S.muted, fontWeight: 600 }}>Fares:</span>
          {[{ color: "#059669", label: "Low" }, { color: "#d97706", label: "Mid" }, { color: "#dc2626", label: "High" }].map(({ color, label }) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 9, color: "#6a8ab5", fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
              {label}
            </span>
          ))}
          {priceRange.min > 0 && (
            <span style={{ marginLeft: "auto", fontSize: 9, color: "#059669", fontWeight: 800 }}>
              From {formatPriceShort(priceRange.min)}
            </span>
          )}
        </div>
      )}

      <div style={{ borderTop: "1px solid #e8eef8", padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f4f7fc" }}>
        <button type="button" onClick={() => onChange("", "")}
          style={{ fontSize: 12, color: S.muted, fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.color = S.accent)}
          onMouseLeave={e => (e.currentTarget.style.color = S.muted)}>Clear dates</button>
        <button type="button" onClick={onClose}
          style={{ padding: "8px 18px", borderRadius: 8, fontSize: 12, fontWeight: 900, color: "white", background: S.accent, border: "none", cursor: "pointer" }}>Done</button>
      </div>
    </div>,
    document.body
  );
}

// ─── PASSENGER PICKER ─────────────────────────────────────────────────────────
function PaxPicker({
  anchorRef, open, adults, children, infants, cabinClass, onChange, onClose,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  adults: number; children: number; infants: number;
  cabinClass: SearchForm["cabinClass"];
  onChange: (a: number, c: number, i: number, cls: SearchForm["cabinClass"]) => void;
  onClose: () => void;
}) {
  const popupRef   = useRef<HTMLDivElement>(null);
  const pos        = usePortalPos(anchorRef, open);
  const { isMobile, width } = useBreakpoint();

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return;
      if (popupRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, anchorRef, onClose]);

  if (!open || !pos) return null;

  const classes: SearchForm["cabinClass"][] = ["Economy", "Premium Economy", "Business", "First"];
  const POPUP_W   = isMobile ? Math.min(width - 16, 300) : 288;
  const popupLeft = isMobile
    ? Math.max(8, (width - POPUP_W) / 2)
    : Math.max(8, Math.min(pos.left + pos.width - POPUP_W, width - POPUP_W - 8));
  const popupTop  = Math.max(8, pos.top + pos.height + 6);

  function PRow({ label, sub, value, min, max, onCh }: {
    label: string; sub: string; value: number; min: number; max: number; onCh: (v: number) => void;
  }) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{label}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{sub}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button type="button" onClick={() => onCh(Math.max(min, value - 1))} disabled={value <= min}
            style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", background: "transparent", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: value <= min ? "not-allowed" : "pointer", opacity: value <= min ? 0.3 : 1, fontSize: 18, fontWeight: 700 }}>−</button>
          <span style={{ width: 18, textAlign: "center", fontWeight: 900, color: "white", fontSize: 14 }}>{value}</span>
          <button type="button" onClick={() => onCh(Math.min(max, value + 1))} disabled={value >= max}
            style={{ width: 30, height: 30, borderRadius: "50%", background: S.accent, border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: value >= max ? "not-allowed" : "pointer", opacity: value >= max ? 0.3 : 1, fontSize: 18, fontWeight: 700 }}>+</button>
        </div>
      </div>
    );
  }

  return createPortal(
    <div ref={popupRef} style={{
      position: "absolute", top: popupTop, left: popupLeft,
      width: POPUP_W, zIndex: 99999,
      background: S.navy, borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.15)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
      padding: 18,
    }}>
      <PRow label="Adults"   sub="12+ years"     value={adults}   min={1} max={9} onCh={v => onChange(v, children, infants, cabinClass)} />
      <PRow label="Children" sub="2–12 years"    value={children} min={0} max={9} onCh={v => onChange(adults, v, infants, cabinClass)} />
      <PRow label="Infants"  sub="Under 2 years" value={infants}  min={0} max={4} onCh={v => onChange(adults, children, v, cabinClass)} />
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Cabin Class</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {classes.map(cls => (
            <button key={cls} type="button" onClick={() => onChange(adults, children, infants, cls)}
              style={{ padding: "8px 4px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", background: cabinClass === cls ? S.accent : "transparent", color: cabinClass === cls ? "white" : "rgba(255,255,255,0.65)", border: cabinClass === cls ? `2px solid ${S.accent}` : "2px solid rgba(255,255,255,0.15)" }}>
              {cls}
            </button>
          ))}
        </div>
      </div>
      <button type="button" onClick={onClose}
        style={{ marginTop: 14, width: "100%", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 700, color: "white", background: S.navyMid, border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}>
        Confirm
      </button>
    </div>,
    document.body
  );
}

// ─── TRIP TYPE PICKER ─────────────────────────────────────────────────────────
function TripTypePicker({
  anchorRef, open, value, onChange, onClose,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  value: SearchForm["tripType"];
  onChange: (t: SearchForm["tripType"]) => void;
  onClose: () => void;
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const pos = usePortalPos(anchorRef, open);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return;
      if (popupRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, anchorRef, onClose]);

  if (!open || !pos) return null;

  const opts: { key: SearchForm["tripType"]; label: string; icon: string }[] = [
    { key: "oneWay",    label: "One-way",    icon: "→" },
    { key: "roundTrip", label: "Round trip", icon: "⇄" },
    // { key: "multiCity", label: "Multi-city", icon: "⊕" },
  ];

  return createPortal(
    <div ref={popupRef} style={{
      position: "absolute", top: Math.max(8, pos.top + pos.height + 6), left: Math.max(8, pos.left),
      width: 180, zIndex: 99999,
      background: S.navy, borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.15)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
      overflow: "hidden",
    }}>
      {opts.map(o => (
        <button key={o.key} type="button"
          onClick={() => { onChange(o.key); onClose(); }}
          style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", textAlign: "left", background: value === o.key ? "rgba(255,255,255,0.12)" : "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)", cursor: "pointer", color: "white", fontSize: 13, fontWeight: value === o.key ? 800 : 500 }}
          onMouseEnter={e => { if (value !== o.key) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={e => { if (value !== o.key) e.currentTarget.style.background = "transparent"; }}
        >
          <span style={{ fontSize: 16, flexShrink: 0 }}>{o.icon}</span>
          {o.label}
          {value === o.key && (
            <svg style={{ marginLeft: "auto", flexShrink: 0 }} width={14} height={14} fill="none" stroke={S.accent} strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      ))}
    </div>,
    document.body
  );
}

// ─── PILL FIELD (desktop) ─────────────────────────────────────────────────────
function PillField({
  label, line1, line2, onClick, active, style: extra,
}: {
  label: string; line1: string; line2?: string;
  onClick: () => void; active?: boolean;
  style?: React.CSSProperties;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "8px 16px", height: "100%",
        background: active ? "#eef4ff" : hov ? "#f5f8fc" : "transparent",
        border: "none", cursor: "pointer", textAlign: "left",
        transition: "background .15s", ...extra,
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 1 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 15, color: S.navyDeep, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {line1}
      </div>
      {line2 && (
        <div style={{ fontSize: 10, color: S.muted, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{line2}</div>
      )}
    </button>
  );
}

// ─── MOBILE FIELD ROW ─────────────────────────────────────────────────────────
// A tappable row used inside the mobile stacked card layout
function MobileField({
  label, line1, line2, onClick, active, icon, noBorder,
}: {
  label: string; line1: string; line2?: string;
  onClick: () => void; active?: boolean; icon?: React.ReactNode; noBorder?: boolean;
}) {
  return (
    <button type="button" onClick={onClick}
      style={{
        width: "100%", display: "flex", alignItems: "center", gap: 12,
        padding: "13px 16px",
        background: active ? "#eef4ff" : "transparent",
        border: "none", borderBottom: noBorder ? "none" : `1px solid ${S.border}`,
        cursor: "pointer", textAlign: "left",
        transition: "background .15s",
      }}
    >
      {icon && (
        <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0f5fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {icon}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 9, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 1 }}>{label}</div>
        <div style={{ fontWeight: 800, fontSize: 15, color: S.navyDeep, lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{line1}</div>
        {line2 && <div style={{ fontSize: 11, color: S.muted, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{line2}</div>}
      </div>
      <svg width={14} height={14} fill="none" stroke={S.muted} strokeWidth={2} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

// ─── MULTI-CITY LEG ROW ───────────────────────────────────────────────────────
function MultiCityLegRow({
  leg, index, total, today, airports, onUpdate, onRemove, prices,
}: {
  leg: CityLeg; index: number; total: number; today: string;
  airports: Airport[]; onUpdate: (u: Partial<CityLeg>) => void; onRemove: () => void;
  prices: Record<string, number>;
}) {
  const { isMobile } = useBreakpoint();
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen,   setToOpen]   = useState(false);
  const [calOpen,  setCalOpen]  = useState(false);

  const fromRef = useRef<HTMLElement | null>(null);
  const toRef   = useRef<HTMLElement | null>(null);
  const calRef  = useRef<HTMLElement | null>(null);

  const dateFmt = leg.departDate ? (() => {
    const d = new Date(leg.departDate + "T00:00:00");
    return {
      short: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      sub:   d.toLocaleDateString("en-IN", { weekday: "short" }),
    };
  })() : null;

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 900, color: "#f9c08a", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Flight {index + 1}
        </span>
        {total > 2 && (
          <button type="button" onClick={onRemove}
            style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.45)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.45)")}>
            <svg width={12} height={12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Remove
          </button>
        )}
      </div>

      {isMobile ? (
        // ── MOBILE: stacked fields ──
        <div style={{ background: "white", borderRadius: 10, border: `1px solid ${S.border}`, overflow: "hidden" }}>
          <div ref={el => { fromRef.current = el; }} style={{ borderBottom: `1px solid ${S.border}` }}>
            <button type="button" onClick={() => { setFromOpen(o => !o); setToOpen(false); setCalOpen(false); }}
              style={{ width: "100%", padding: "11px 14px", textAlign: "left", background: fromOpen ? "#eef4ff" : "transparent", border: "none", cursor: "pointer" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>From</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: S.navyDeep }}>{leg.from?.code} — {leg.from?.city}</div>
              <div style={{ fontSize: 11, color: S.muted }}>{leg.from?.name}</div>
            </button>
            <AirportDropdownPortal anchorRef={fromRef} open={fromOpen} airports={airports}
              onSelect={a => { onUpdate({ from: a }); setFromOpen(false); }}
              onClose={() => setFromOpen(false)} preferUp />
          </div>
          <div ref={el => { toRef.current = el; }} style={{ borderBottom: `1px solid ${S.border}` }}>
            <button type="button" onClick={() => { setToOpen(o => !o); setFromOpen(false); setCalOpen(false); }}
              style={{ width: "100%", padding: "11px 14px", textAlign: "left", background: toOpen ? "#eef4ff" : "transparent", border: "none", cursor: "pointer" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>To</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: S.navyDeep }}>{leg.to?.code} — {leg.to?.city}</div>
              <div style={{ fontSize: 11, color: S.muted }}>{leg.to?.name}</div>
            </button>
            <AirportDropdownPortal anchorRef={toRef} open={toOpen} airports={airports}
              onSelect={a => { onUpdate({ to: a }); setToOpen(false); }}
              onClose={() => setToOpen(false)} preferUp />
          </div>
          <div ref={el => { calRef.current = el; }}>
            <button type="button" onClick={() => { setCalOpen(o => !o); setFromOpen(false); setToOpen(false); }}
              style={{ width: "100%", padding: "11px 14px", textAlign: "left", background: calOpen ? "#eef4ff" : "transparent", border: "none", cursor: "pointer" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Depart</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: dateFmt ? S.navyDeep : S.muted }}>{dateFmt?.short ?? "Select date"}</div>
              {dateFmt?.sub && <div style={{ fontSize: 11, color: S.muted }}>{dateFmt.sub}</div>}
            </button>
            {calOpen && (
              <CalendarPopup anchorRef={calRef} value={leg.departDate} min={today} prices={prices}
                onChange={d1 => { onUpdate({ departDate: d1 }); setCalOpen(false); }}
                onClose={() => setCalOpen(false)} preferUp />
            )}
          </div>
        </div>
      ) : (
        // ── TABLET / DESKTOP: horizontal row ──
        <div style={{ display: "flex", background: "white", borderRadius: 10, border: `1px solid ${S.border}`, overflow: "visible" }}>
          <div ref={el => { fromRef.current = el; }} style={{ flex: 1, borderRight: `1px solid ${S.border}`, minHeight: 64, position: "relative" }}>
            <button type="button" onClick={() => { setFromOpen(o => !o); setToOpen(false); setCalOpen(false); }}
              style={{ width: "100%", height: "100%", textAlign: "left", padding: "10px 14px", background: fromOpen ? "#eef4ff" : "transparent", border: "none", cursor: "pointer", transition: "background .15s", borderRadius: "10px 0 0 10px", minHeight: 64 }}
              onMouseEnter={e => { if (!fromOpen) e.currentTarget.style.background = "#f5f8fc"; }}
              onMouseLeave={e => { if (!fromOpen) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>From</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: S.navyDeep }}>{leg.from?.code ?? "—"} — {leg.from?.city ?? "Select city"}</div>
              <div style={{ fontSize: 11, color: S.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{leg.from?.name}</div>
            </button>
            <AirportDropdownPortal anchorRef={fromRef} open={fromOpen} airports={airports}
              onSelect={a => { onUpdate({ from: a }); setFromOpen(false); }}
              onClose={() => setFromOpen(false)} preferUp />
          </div>
          <div ref={el => { toRef.current = el; }} style={{ flex: 1, borderRight: `1px solid ${S.border}`, minHeight: 64, position: "relative" }}>
            <button type="button" onClick={() => { setToOpen(o => !o); setFromOpen(false); setCalOpen(false); }}
              style={{ width: "100%", height: "100%", textAlign: "left", padding: "10px 14px", background: toOpen ? "#eef4ff" : "transparent", border: "none", cursor: "pointer", transition: "background .15s", minHeight: 64 }}
              onMouseEnter={e => { if (!toOpen) e.currentTarget.style.background = "#f5f8fc"; }}
              onMouseLeave={e => { if (!toOpen) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>To</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: S.navyDeep }}>{leg.to?.code ?? "—"} — {leg.to?.city ?? "Select city"}</div>
              <div style={{ fontSize: 11, color: S.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{leg.to?.name}</div>
            </button>
            <AirportDropdownPortal anchorRef={toRef} open={toOpen} airports={airports}
              onSelect={a => { onUpdate({ to: a }); setToOpen(false); }}
              onClose={() => setToOpen(false)} preferUp />
          </div>
          <div ref={el => { calRef.current = el; }} style={{ flex: "0 0 150px", minHeight: 64, position: "relative" }}>
            <button type="button" onClick={() => { setCalOpen(o => !o); setFromOpen(false); setToOpen(false); }}
              style={{ width: "100%", height: "100%", textAlign: "left", padding: "10px 14px", background: calOpen ? "#eef4ff" : "transparent", border: "none", cursor: "pointer", transition: "background .15s", borderRadius: "0 10px 10px 0", minHeight: 64 }}
              onMouseEnter={e => { if (!calOpen) e.currentTarget.style.background = "#f5f8fc"; }}
              onMouseLeave={e => { if (!calOpen) e.currentTarget.style.background = "transparent"; }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 2 }}>Depart</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: dateFmt ? S.navyDeep : S.muted }}>{dateFmt?.short ?? "Select date"}</div>
              {dateFmt?.sub && <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>{dateFmt.sub}</div>}
            </button>
            {calOpen && (
              <CalendarPopup anchorRef={calRef} value={leg.departDate} min={today} prices={prices}
                onChange={d1 => { onUpdate({ departDate: d1 }); setCalOpen(false); }}
                onClose={() => setCalOpen(false)} preferUp />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MULTI-CITY PANEL ─────────────────────────────────────────────────────────
function MultiCityPanel({
  legs, airports, today, totalPax, cabinClass, onUpdate, onAdd, onRemove, legPrices,
}: {
  legs: CityLeg[]; airports: Airport[]; today: string;
  totalPax: number; cabinClass: string;
  onUpdate: (idx: number, u: Partial<CityLeg>) => void;
  onAdd: () => void; onRemove: (idx: number) => void;
  legPrices: Record<string, number>[];
}) {
  return (
    <div style={{
      background: "rgba(0,30,65,0.94)",
      borderRadius: "0 0 14px 14px",
      borderTop: "1px solid rgba(255,255,255,0.08)",
      padding: "14px 16px 16px",
      boxShadow: "0 12px 40px rgba(0,0,0,0.30)",
    }}>
      {legs.map((leg, idx) => (
        <MultiCityLegRow
          key={leg.id} leg={leg} index={idx} total={legs.length}
          today={today} airports={airports} prices={legPrices[idx] ?? {}}
          onUpdate={u => onUpdate(idx, u)}
          onRemove={() => onRemove(idx)}
        />
      ))}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4, flexWrap: "wrap", gap: 10 }}>
        {legs.length < 5 ? (
          <button type="button" onClick={onAdd}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.2)", background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "7px 14px", cursor: "pointer", transition: "all .15s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f9c08a"; e.currentTarget.style.borderColor = "rgba(249,192,138,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
          >
            <svg width={14} height={14} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add another city
          </button>
        ) : (
          <div style={{ fontSize: 12, color: "#b0bfd4" }}>Maximum 5 flights</div>
        )}
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
          {totalPax} traveller{totalPax !== 1 ? "s" : ""} · {cabinClass}
        </div>
      </div>
    </div>
  );
}

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const IconPlane  = () => <svg width={16} height={16} fill="none" stroke={S.navyMid} strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
const IconCalendar = () => <svg width={16} height={16} fill="none" stroke={S.navyMid} strokeWidth={2} viewBox="0 0 24 24"><rect x={3} y={4} width={18} height={18} rx={2} /><path strokeLinecap="round" d="M16 2v4M8 2v4M3 10h18" /></svg>;
const IconUsers  = () => <svg width={16} height={16} fill="none" stroke={S.navyMid} strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx={9} cy={7} r={4} /><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" /></svg>;
const IconSeat   = () => <svg width={16} height={16} fill="none" stroke={S.navyMid} strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 4v9a2 2 0 002 2h8" /><path strokeLinecap="round" strokeLinejoin="round" d="M5 20h14M8 20l1-5M18 20l-2-5M15 15h3a2 2 0 002-2v-1" /></svg>;
const IconCard   = () => <svg width={16} height={16} fill="none" stroke={S.navyMid} strokeWidth={2} viewBox="0 0 24 24"><rect x={2} y={5} width={20} height={14} rx={2.5} /><path strokeLinecap="round" d="M2 9.5h20" /></svg>;

// ─── TOP-ROW DROPDOWN TRIGGER (desktop row 1) ─────────────────────────────────
function TopDropdownButton({
  icon, label, active, onClick,
}: { icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 7,
        background: active || hov ? "#f0f5fb" : "transparent",
        border: "none", borderRadius: 10, padding: "9px 12px",
        cursor: "pointer", fontSize: 13.5, fontWeight: 700, color: S.navyDeep,
        transition: "background .15s", whiteSpace: "nowrap",
      }}>
      {icon}
      <span>{label}</span>
      <svg width={10} height={10} fill="none" stroke="#9aa9c0" strokeWidth={2.3} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

// ─── ROW-2 ICON FIELD (from / to / date boxes) ────────────────────────────────
function IconField({
  icon, label, value, active, onClick, style: extra,
}: {
  icon: React.ReactNode; label: string; value: string;
  active?: boolean; onClick: () => void; style?: React.CSSProperties;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button type="button" onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "13px 18px", minWidth: 0,
        background: active ? "#eef4ff" : hov ? "#f5f8fc" : "transparent",
        border: "none", cursor: "pointer", textAlign: "left",
        transition: "background .15s", ...extra,
      }}>
      <span style={{ flexShrink: 0, display: "flex" }}>{icon}</span>
      <span style={{ minWidth: 0 }}>
        <div style={{ fontSize: 11.5, color: S.muted, fontWeight: 600, marginBottom: 2, whiteSpace: "nowrap" }}>{label}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: S.navyDeep, lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{value}</div>
      </span>
    </button>
  );
}

// ─── PAYMENT METHOD POPOVER (UI-only, decorative — no data/API behind it) ─────
function PaymentMethodPopover({
  anchorRef, open, value, onChange, onClose,
}: {
  anchorRef: React.RefObject<HTMLElement | null>; open: boolean; value: string;
  onChange: (v: string) => void; onClose: () => void;
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return;
      if (popupRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, anchorRef, onClose]);
  if (!open) return null;
  const options = ["All Payment Methods", "Credit / Debit Card", "UPI", "Net Banking", "Wallets"];
  return (
    <div ref={popupRef} style={{
      position: "absolute", top: "calc(100% + 6px)", right: 0, width: 220, zIndex: 60,
      background: S.navy, borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.55)", overflow: "hidden",
    }}>
      {options.map(o => (
        <button key={o} type="button" onClick={() => onChange(o)}
          style={{ width: "100%", textAlign: "left", padding: "10px 14px", background: value === o ? "rgba(255,255,255,0.12)" : "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#fff", fontSize: 13, fontWeight: value === o ? 800 : 500, cursor: "pointer" }}
          onMouseEnter={e => { if (value !== o) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={e => { if (value !== o) e.currentTarget.style.background = "transparent"; }}>
          {o}
        </button>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export interface OneSearchBarProps {
  onSearch: (form: SearchForm, multiLegs?: CityLeg[]) => void;
  form?: Partial<SearchForm>;
  tripType?: SearchForm["tripType"];
  onTripTypeChange?: (t: SearchForm["tripType"]) => void;
}

type ActivePopup = "from" | "to" | "depart" | "return" | "pax" | "tripType" | null;

export default function OneSearchBar({
  onSearch, form: formProp, tripType: tripTypeProp, onTripTypeChange,
}: OneSearchBarProps) {
  const today = new Date().toLocaleDateString("en-CA");
  const { isMobile, isTablet, isDesktop } = useBreakpoint();

  const [airports, setAirports] = useState<Airport[]>(MOCK_AIRPORTS);
  useEffect(() => {
    apiGetAirports().then(setAirports).catch(() => setAirports(MOCK_AIRPORTS));
  }, []);

  const [form, setForm] = useState<SearchForm>({
    tripType:    tripTypeProp ?? formProp?.tripType ?? "oneWay",
    from:        formProp?.from        ?? MOCK_AIRPORTS[0],
    to:          formProp?.to          ?? MOCK_AIRPORTS[1],
    departDate:  formProp?.departDate  ?? today,
    returnDate:  formProp?.returnDate  ?? "",
    adults:      formProp?.adults      ?? 1,
    children:    formProp?.children    ?? 0,
    infants:     formProp?.infants     ?? 0,
    cabinClass:  formProp?.cabinClass  ?? "Economy",
    nonStopOnly: formProp?.nonStopOnly ?? false,
    fareType:    formProp?.fareType    ?? "Regular",
  });

  const [multiLegs, setMultiLegs] = useState<CityLeg[]>([
    { id: newId(), from: MOCK_AIRPORTS[0], to: MOCK_AIRPORTS[1], departDate: today },
    { id: newId(), from: MOCK_AIRPORTS[1] ?? MOCK_AIRPORTS[0], to: MOCK_AIRPORTS[2] ?? MOCK_AIRPORTS[0], departDate: "" },
  ]);

  useEffect(() => {
    if (tripTypeProp) setForm(f => ({ ...f, tripType: tripTypeProp }));
  }, [tripTypeProp]);

  useEffect(() => {
    if (!formProp) return;
    setForm(f => ({
      ...f,
      tripType:    formProp.tripType    ?? f.tripType,
      from:        formProp.from        ?? f.from,
      to:          formProp.to          ?? f.to,
      departDate:  formProp.departDate  ?? f.departDate,
      returnDate:  formProp.returnDate  ?? f.returnDate,
      adults:      formProp.adults      ?? f.adults,
      children:    formProp.children    ?? f.children,
      infants:     formProp.infants     ?? f.infants,
      cabinClass:  formProp.cabinClass  ?? f.cabinClass,
      nonStopOnly: formProp.nonStopOnly ?? f.nonStopOnly,
      fareType:    formProp.fareType    ?? f.fareType,
    }));
  }, [
    formProp?.tripType, formProp?.from?.code, formProp?.to?.code,
    formProp?.departDate, formProp?.returnDate, formProp?.adults,
    formProp?.children, formProp?.infants, formProp?.cabinClass, formProp?.nonStopOnly,
  ]);

  const [calPrices, setCalPrices] = useState<Record<string, number>>({});
  const [legPrices, setLegPrices] = useState<Record<string, number>[]>([{}, {}]);
  const [pricesLoading, setPricesLoading] = useState(false);

  useEffect(() => {
    const fromCode = form.from?.code;
    const toCode   = form.to?.code;
    if (!fromCode || !toCode || fromCode === toCode) return;
    let cancelled = false;
    setPricesLoading(true);
    apiGetCalendarPrices(fromCode, toCode, form.cabinClass)
      .then(prices => { if (!cancelled) { setCalPrices(prices); setPricesLoading(false); } })
      .catch(() => { if (!cancelled) setPricesLoading(false); });
    return () => { cancelled = true; };
  }, [form.from?.code, form.to?.code, form.cabinClass]);

  useEffect(() => {
    if (form.tripType !== "multiCity") return;
    let cancelled = false;
    Promise.all(
      multiLegs.map(leg =>
        leg.from?.code && leg.to?.code && leg.from.code !== leg.to.code
          ? apiGetCalendarPrices(leg.from.code, leg.to.code, form.cabinClass)
          : Promise.resolve({} as Record<string, number>)
      )
    ).then(results => { if (!cancelled) setLegPrices(results); }).catch(() => {});
    return () => { cancelled = true; };
  }, [form.tripType, form.cabinClass, ...multiLegs.map(l => `${l.from?.code}-${l.to?.code}`)]);

  const [popup, setPopup] = useState<ActivePopup>(null);
  const toggle = useCallback((p: ActivePopup) => setPopup(prev => prev === p ? null : p), []);

  // UI-only, decorative — not part of the search form / API payload
  const [paymentMethod, setPaymentMethod] = useState("All Payment Methods");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const paymentRef = useRef<HTMLDivElement>(null);

  const fromRef   = useRef<HTMLDivElement>(null);
  const toRef     = useRef<HTMLDivElement>(null);
  const departRef = useRef<HTMLDivElement>(null);
  const returnRef = useRef<HTMLDivElement>(null);
  const paxRef    = useRef<HTMLDivElement>(null);
  const tripRef   = useRef<HTMLDivElement>(null);

  function addLeg() {
    if (multiLegs.length >= 5) return;
    const last            = multiLegs[multiLegs.length - 1];
    const differentAirport = airports.find(a => a.code !== last.to.code) ?? MOCK_AIRPORTS[0];
    setMultiLegs(legs => [...legs, { id: newId(), from: last.to, to: differentAirport, departDate: "" }]);
    setLegPrices(lp => [...lp, {}]);
  }

  function updateLeg(idx: number, update: Partial<CityLeg>) {
    setMultiLegs(legs => legs.map((l, i) => i === idx ? { ...l, ...update } : l));
  }

  function removeLeg(idx: number) {
    setMultiLegs(legs => legs.length <= 2 ? legs : legs.filter((_, i) => i !== idx));
    setLegPrices(lp => lp.filter((_, i) => i !== idx));
  }

  function handleSearch() {
    if (form.tripType === "multiCity") {
      if (multiLegs.some(leg => !leg.departDate)) { alert("Please select a departure date for all flights."); return; }
      onSearch({ ...form, tripType: "multiCity" }, multiLegs);
    } else {
      if (!form.departDate) { alert("Please select a departure date."); return; }
      onSearch(form);
    }
    setPopup(null);
  }

  function fmtDate(d: string) {
    if (!d) return null;
    const dt = new Date(d + "T00:00:00");
    return {
      short: dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      sub:   dt.toLocaleDateString("en-IN", { weekday: "short", year: "numeric" }),
    };
  }

  // Full single-line date label used by the redesigned desktop bar, e.g. "Thu, 16 Jul 2026"
  function fmtDateLong(d: string) {
    if (!d) return "Select date";
    const dt = new Date(d + "T00:00:00");
    const weekday = dt.toLocaleDateString("en-US", { weekday: "short" });
    return `${weekday}, ${dt.getDate()} ${MONTHS[dt.getMonth()].slice(0, 3)} ${dt.getFullYear()}`;
  }

  // Shifts a yyyy-mm-dd string by `delta` days — powers the ‹ › quick-nav arrows
  function shiftDate(d: string, delta: number) {
    const dt = new Date((d || today) + "T00:00:00");
    dt.setDate(dt.getDate() + delta);
    return dt.toLocaleDateString("en-CA");
  }

  const isRound   = form.tripType === "roundTrip";
  const isMulti   = form.tripType === "multiCity";
  const departFmt = fmtDate(form.departDate);
  const returnFmt = fmtDate(form.returnDate);
  const totalPax  = form.adults + form.children + form.infants;
  const tripLabel = isRound ? "⇄ Round trip" : isMulti ? "⊕ Multi-city" : "→ One-way";
  const tripColor = isRound ? "#059669" : isMulti ? "#7c3aed" : S.accent;

  const routeStr = isMulti
    ? [...multiLegs.map(l => l.from?.code ?? "?"), multiLegs[multiLegs.length - 1]?.to?.code ?? "?"].join(" → ")
    : "";

  // ── SEARCH BUTTON ──────────────────────────────────────────
  const SearchBtn = ({ full }: { full?: boolean }) => (
    <button type="button" onClick={handleSearch}
      style={{
        background: S.accent, color: "#fff", border: "none",
        padding: full ? "15px 24px" : "0 26px",
        height: full ? undefined : "100%",
        width: full ? "100%" : undefined,
        cursor: "pointer", fontWeight: 800, fontSize: 14,
        letterSpacing: "0.04em", transition: "background .2s",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        borderRadius: full ? 12 : "0 12px 12px 0",
        flexShrink: 0,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = S.accentDk)}
      onMouseLeave={e => (e.currentTarget.style.background = S.accent)}
    >
      {pricesLoading ? (
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ animation: "spin 1s linear infinite" }}>
          <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
        </svg>
      ) : (
        <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
          <circle cx={11} cy={11} r={8} /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
        </svg>
      )}
      Search Flights
    </button>
  );

  // ══════════════════════════════════════════════════════════════
  //  MOBILE LAYOUT  (<640px)
  //  Stacked card — each field on its own full-width row
  // ══════════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <div style={{ width: "100%" }}>
        <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 30px rgba(0,48,95,0.12)", border: `1px solid ${S.border}` }}>

          {/* Trip type row */}
          <div ref={tripRef} style={{ borderBottom: `1px solid ${S.border}`, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button type="button" onClick={() => toggle("tripType")}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${S.borderMid}`, borderRadius: 20, padding: "6px 12px", cursor: "pointer" }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: tripColor }}>{tripLabel}</span>
              <svg width={10} height={10} fill="none" stroke={tripColor} strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <TripTypePicker anchorRef={tripRef} open={popup === "tripType"} value={form.tripType}
              onChange={t => { setForm(f => ({ ...f, tripType: t, returnDate: t !== "roundTrip" ? "" : f.returnDate })); onTripTypeChange?.(t); setPopup(null); }}
              onClose={() => setPopup(null)} />
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={form.nonStopOnly}
                onChange={e => setForm(f => ({ ...f, nonStopOnly: e.target.checked }))}
                style={{ accentColor: S.accent, width: 14, height: 14 }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: S.muted }}>Non-stop</span>
            </label>
          </div>

          {/* FROM */}
          <div ref={fromRef}>
            <MobileField label="From" line1={`${form.from?.code ?? "—"} — ${form.from?.city ?? ""}`} line2={form.from?.name}
              active={popup === "from"} onClick={() => toggle("from")}
              icon={<IconPlane />} />
            <AirportDropdownPortal anchorRef={fromRef} open={popup === "from"} airports={airports}
              onSelect={a => { setForm(f => ({ ...f, from: a })); setPopup(null); }}
              onClose={() => setPopup(null)} />
          </div>

          {/* Swap button */}
          <div style={{ display: "flex", alignItems: "center", padding: "0 16px", marginTop: -12, marginBottom: -12, zIndex: 2, position: "relative" }}>
            <button type="button"
              onClick={() => setForm(f => ({ ...f, from: f.to, to: f.from }))}
              style={{ width: 32, height: 32, borderRadius: "50%", border: `2px solid ${S.border}`, background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,48,95,0.12)" }}>
              <svg width={14} height={14} fill="none" stroke={S.navyMid} strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </button>
            <div style={{ flex: 1, height: 1, background: S.border, marginLeft: 8 }} />
          </div>

          {/* TO */}
          <div ref={toRef}>
            <MobileField label="To" line1={`${form.to?.code ?? "—"} — ${form.to?.city ?? ""}`} line2={form.to?.name}
              active={popup === "to"} onClick={() => toggle("to")}
              icon={<IconPlane />} />
            <AirportDropdownPortal anchorRef={toRef} open={popup === "to"} airports={airports}
              onSelect={a => { setForm(f => ({ ...f, to: a })); setPopup(null); }}
              onClose={() => setPopup(null)} />
          </div>

          {/* Depart */}
          <div ref={departRef}>
            <MobileField label="Departure" line1={departFmt?.short ?? "Select date"} line2={departFmt?.sub}
              active={popup === "depart"} onClick={() => toggle("depart")}
              icon={<IconCalendar />} />
            {popup === "depart" && (
              <CalendarPopup anchorRef={departRef} value={form.departDate}
                value2={isRound ? form.returnDate : undefined} isRange={isRound}
                min={today} prices={calPrices}
                onChange={(d1, d2) => { setForm(f => ({ ...f, departDate: d1, returnDate: d2 ?? f.returnDate })); if (!isRound || d2) setPopup(null); }}
                onClose={() => setPopup(null)} />
            )}
          </div>

          {/* Return (only when round-trip) */}
          {isRound ? (
            <div ref={returnRef}>
              <MobileField label="Return" line1={returnFmt?.short ?? "Select date"} line2={returnFmt?.sub}
                active={popup === "return"} onClick={() => toggle("return")}
                icon={<IconCalendar />} />
              {popup === "return" && (
                <CalendarPopup anchorRef={returnRef} value={form.departDate} value2={form.returnDate}
                  isRange min={today} prices={calPrices}
                  onChange={(d1, d2) => { setForm(f => ({ ...f, departDate: d1, returnDate: d2 ?? "" })); if (d2) setPopup(null); }}
                  onClose={() => setPopup(null)} />
              )}
            </div>
          ) : (
            <button type="button" onClick={() => { setForm(f => ({ ...f, tripType: "roundTrip" })); onTripTypeChange?.("roundTrip"); }}
              style={{ width: "100%", padding: "13px 16px", background: "transparent", border: "none", borderBottom: `1px solid ${S.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, textAlign: "left", opacity: 0.5 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f0f5fb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <IconCalendar />
              </div>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 1 }}>Return</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: S.navyDeep }}>+ Add return date</div>
              </div>
            </button>
          )}

          {/* Travellers */}
          <div ref={paxRef}>
            <MobileField label="Travellers & Class" line1={`${totalPax} Traveller${totalPax !== 1 ? "s" : ""}`}
              line2={form.cabinClass} active={popup === "pax"} onClick={() => toggle("pax")}
              icon={<IconUsers />} noBorder />
            <PaxPicker anchorRef={paxRef} open={popup === "pax"}
              adults={form.adults} children={form.children} infants={form.infants} cabinClass={form.cabinClass}
              onChange={(a, c, i, cls) => setForm(f => ({ ...f, adults: a, children: c, infants: i, cabinClass: cls }))}
              onClose={() => setPopup(null)} />
          </div>

          {/* Search */}
          <div style={{ padding: 14 }}>
            <SearchBtn full />
          </div>
        </div>

        {isMulti && (
          <MultiCityPanel legs={multiLegs} airports={airports} today={today}
            totalPax={totalPax} cabinClass={form.cabinClass} legPrices={legPrices}
            onUpdate={updateLeg} onAdd={addLeg} onRemove={removeLeg} />
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  //  TABLET LAYOUT  (640–1023px)
  //  Two-row card: airports+dates on top, travellers+search below
  // ══════════════════════════════════════════════════════════════
  if (isTablet) {
    return (
      <div style={{ width: "100%" }}>
        <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 30px rgba(0,48,95,0.12)", border: `1px solid ${S.border}` }}>

          {/* Row 1: Trip type + non-stop */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", borderBottom: `1px solid ${S.border}`, background: "#fafcff" }}>
            <div ref={tripRef} style={{ display: "flex", alignItems: "center" }}>
              <button type="button" onClick={() => toggle("tripType")}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "transparent", border: `1px solid ${S.borderMid}`, borderRadius: 20, padding: "6px 14px", cursor: "pointer" }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: tripColor }}>{tripLabel}</span>
                <svg width={10} height={10} fill="none" stroke={tripColor} strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <TripTypePicker anchorRef={tripRef} open={popup === "tripType"} value={form.tripType}
                onChange={t => { setForm(f => ({ ...f, tripType: t, returnDate: t !== "roundTrip" ? "" : f.returnDate })); onTripTypeChange?.(t); setPopup(null); }}
                onClose={() => setPopup(null)} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
              <input type="checkbox" checked={form.nonStopOnly}
                onChange={e => setForm(f => ({ ...f, nonStopOnly: e.target.checked }))}
                style={{ accentColor: S.accent, width: 14, height: 14 }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: S.muted }}>Non-stop only</span>
            </label>
          </div>

          {/* Row 2: From / Swap / To / Depart / Return — 2-col grid with swap */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr 1fr 1fr", alignItems: "stretch", borderBottom: `1px solid ${S.border}`, minHeight: 70 }}>
            {/* FROM */}
            <div ref={fromRef} style={{ display: "flex", alignItems: "stretch" }}>
              <PillField label="From" line1={form.from?.code ?? "—"} line2={form.from?.city}
                active={popup === "from"} onClick={() => toggle("from")}
                style={{ flex: 1, borderRight: `1px solid ${S.border}` }} />
              <AirportDropdownPortal anchorRef={fromRef} open={popup === "from"} airports={airports}
                onSelect={a => { setForm(f => ({ ...f, from: a })); setPopup(null); }}
                onClose={() => setPopup(null)} />
            </div>

            {/* Swap */}
            <div style={{ display: "flex", alignItems: "center", padding: "0 6px", borderRight: `1px solid ${S.border}` }}>
              <button type="button" onClick={() => setForm(f => ({ ...f, from: f.to, to: f.from }))}
                style={{ width: 28, height: 28, borderRadius: "50%", border: `1.5px solid ${S.borderMid}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f0f5fb")}
                onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
                <svg width={12} height={12} fill="none" stroke={S.navyMid} strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>

            {/* TO */}
            <div ref={toRef} style={{ display: "flex", alignItems: "stretch" }}>
              <PillField label="To" line1={form.to?.code ?? "—"} line2={form.to?.city}
                active={popup === "to"} onClick={() => toggle("to")}
                style={{ flex: 1, borderRight: `1px solid ${S.border}` }} />
              <AirportDropdownPortal anchorRef={toRef} open={popup === "to"} airports={airports}
                onSelect={a => { setForm(f => ({ ...f, to: a })); setPopup(null); }}
                onClose={() => setPopup(null)} />
            </div>

            {/* DEPART */}
            <div ref={departRef} style={{ display: "flex", alignItems: "stretch" }}>
              <PillField label="Depart" line1={departFmt?.short ?? "Select"} line2={departFmt?.sub}
                active={popup === "depart"} onClick={() => toggle("depart")}
                style={{ flex: 1, borderRight: `1px solid ${S.border}` }} />
              {popup === "depart" && (
                <CalendarPopup anchorRef={departRef} value={form.departDate}
                  value2={isRound ? form.returnDate : undefined} isRange={isRound}
                  min={today} prices={calPrices}
                  onChange={(d1, d2) => { setForm(f => ({ ...f, departDate: d1, returnDate: d2 ?? f.returnDate })); if (!isRound || d2) setPopup(null); }}
                  onClose={() => setPopup(null)} />
              )}
            </div>

            {/* RETURN */}
            <div ref={returnRef} style={{ display: "flex", alignItems: "stretch" }}>
              {isRound ? (
                <>
                  <PillField label="Return" line1={returnFmt?.short ?? "Select"} line2={returnFmt?.sub}
                    active={popup === "return"} onClick={() => toggle("return")}
                    style={{ flex: 1 }} />
                  {popup === "return" && (
                    <CalendarPopup anchorRef={returnRef} value={form.departDate} value2={form.returnDate}
                      isRange min={today} prices={calPrices}
                      onChange={(d1, d2) => { setForm(f => ({ ...f, departDate: d1, returnDate: d2 ?? "" })); if (d2) setPopup(null); }}
                      onClose={() => setPopup(null)} />
                  )}
                </>
              ) : (
                <button type="button"
                  onClick={() => { setForm(f => ({ ...f, tripType: "roundTrip" })); onTripTypeChange?.("roundTrip"); }}
                  style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "8px 16px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left", opacity: 0.5, transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "#f5f8fc"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 1 }}>Return</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: S.navyDeep }}>+ Add return</div>
                </button>
              )}
            </div>
          </div>

          {/* Row 3: Travellers + Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div ref={paxRef} style={{ flex: 1 }}>
              <PillField label="Travellers & Class" line1={`${totalPax} Traveller${totalPax !== 1 ? "s" : ""}`}
                line2={form.cabinClass} active={popup === "pax"} onClick={() => toggle("pax")}
                style={{ width: "100%" }} />
              <PaxPicker anchorRef={paxRef} open={popup === "pax"}
                adults={form.adults} children={form.children} infants={form.infants} cabinClass={form.cabinClass}
                onChange={(a, c, i, cls) => setForm(f => ({ ...f, adults: a, children: c, infants: i, cabinClass: cls }))}
                onClose={() => setPopup(null)} />
            </div>
            <div style={{ padding: "10px 14px" }}>
              <button type="button" onClick={handleSearch}
                style={{ background: S.accent, color: "#fff", border: "none", padding: "12px 22px", cursor: "pointer", fontWeight: 800, fontSize: 13, letterSpacing: "0.04em", display: "flex", alignItems: "center", gap: 8, borderRadius: 10, whiteSpace: "nowrap", transition: "background .2s" }}
                onMouseEnter={e => (e.currentTarget.style.background = S.accentDk)}
                onMouseLeave={e => (e.currentTarget.style.background = S.accent)}>
                {pricesLoading ? (
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ animation: "spin 1s linear infinite" }}>
                    <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                ) : (
                  <svg width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <circle cx={11} cy={11} r={8} /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                  </svg>
                )}
                Search
              </button>
            </div>
          </div>
        </div>

        {isMulti && (
          <MultiCityPanel legs={multiLegs} airports={airports} today={today}
            totalPax={totalPax} cabinClass={form.cabinClass} legPrices={legPrices}
            onUpdate={updateLeg} onAdd={addLeg} onRemove={removeLeg} />
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  //  DESKTOP LAYOUT  (≥1024px)  — redesigned two-row bar
  //  Row 1: trip-type tabs + travellers/class/payment + Search
  //  Row 2: From ⇄ To · Departure Date (· Return when round-trip)
  //  All state, handlers, and API calls are unchanged from before.
  // ══════════════════════════════════════════════════════════════
  const TABS: { key: SearchForm["tripType"]; label: string }[] = [
    { key: "oneWay",     label: "One-way" },
    { key: "roundTrip",  label: "Round-trip" },
    // { key: "multiCity",  label: "Multi-city" },
  ];

  return (
    <div style={{ width: "100%" }}>
      {/* ── ROW 1 : tabs + travellers / class / payment + search ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, padding: "6px 4px 14px" }}>
        {/* Trip type tabs */}
        <div ref={tripRef} style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {TABS.map(t => {
            const isActive = form.tripType === t.key;
            return (
              <button key={t.key} type="button"
                onClick={() => {
                  setForm(f => ({ ...f, tripType: t.key, returnDate: t.key !== "roundTrip" ? "" : f.returnDate }));
                  onTripTypeChange?.(t.key);
                }}
                style={{
                  border: "none", cursor: "pointer", borderRadius: 20,
                  padding: "9px 16px", fontSize: 14.5, fontWeight: 700,
                  background: isActive ? "#e7f0ff" : "transparent",
                  color: isActive ? S.navyMid : "#8a97ab",
                  transition: "all .15s",
                }}>
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Right-hand control cluster */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexWrap: "wrap" }}>
          {/* Travellers */}
          <div ref={paxRef} style={{ position: "relative" }}>
            <TopDropdownButton icon={<IconUsers />} label={`${totalPax} ${totalPax === 1 ? "Adult" : "Travellers"}`}
              active={popup === "pax"} onClick={() => toggle("pax")} />
            <PaxPicker anchorRef={paxRef} open={popup === "pax"}
              adults={form.adults} children={form.children} infants={form.infants} cabinClass={form.cabinClass}
              onChange={(a, c, i, cls) => setForm(f => ({ ...f, adults: a, children: c, infants: i, cabinClass: cls }))}
              onClose={() => setPopup(null)} />
          </div>

          {/* Cabin class — shares the same travellers/class popover as above */}
          <TopDropdownButton icon={<IconSeat />} label={form.cabinClass}
            active={popup === "pax"} onClick={() => toggle("pax")} />

          {/* Payment methods — UI-only, decorative */}
          <div ref={paymentRef} style={{ position: "relative" }}>
            <TopDropdownButton icon={<IconCard />} label={paymentMethod}
              active={paymentOpen} onClick={() => setPaymentOpen(o => !o)} />
            <PaymentMethodPopover anchorRef={paymentRef} open={paymentOpen} value={paymentMethod}
              onChange={v => { setPaymentMethod(v); setPaymentOpen(false); }}
              onClose={() => setPaymentOpen(false)} />
          </div>

          {/* Non-stop — kept for functional parity, tucked in compactly */}
          <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", padding: "0 8px" }}>
            <input type="checkbox" checked={form.nonStopOnly}
              onChange={e => setForm(f => ({ ...f, nonStopOnly: e.target.checked }))}
              style={{ accentColor: S.accent, width: 14, height: 14 }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: S.muted, whiteSpace: "nowrap" }}>Non-stop</span>
          </label>

          {/* Search */}
          <button type="button" onClick={handleSearch}
            style={{ background: S.accent, color: "#fff", border: "none", padding: "13px 28px", cursor: "pointer", fontWeight: 800, fontSize: 14, letterSpacing: "0.02em", borderRadius: 12, display: "flex", alignItems: "center", gap: 8, transition: "background .2s" }}
            onMouseEnter={e => (e.currentTarget.style.background = S.accentDk)}
            onMouseLeave={e => (e.currentTarget.style.background = S.accent)}>
            {pricesLoading ? (
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} style={{ animation: "spin 1s linear infinite" }}>
                <path strokeLinecap="round" d="M12 2a10 10 0 0 1 10 10" />
              </svg>
            ) : (
              <svg width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <circle cx={11} cy={11} r={8} /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
              </svg>
            )}
            Search
          </button>
        </div>
      </div>

      {/* ── ROW 2 : From ⇄ To · Departure Date (· Return) ── */}
      <div style={{
        display: "flex", alignItems: "stretch",
        background: "#fff", borderRadius: 14,
        boxShadow: "0 4px 30px rgba(0,48,95,0.12)",
        border: `1px solid ${S.border}`,
        overflow: "hidden", position: "relative", minHeight: 68,
      }}>
        {!isMulti ? (
          <>
            {/* FROM */}
            <div ref={fromRef} style={{ display: "flex", alignItems: "stretch", flex: 1, minWidth: 150, borderRight: `1px solid ${S.border}` }}>
              <IconField icon={<IconPlane />} label="From"
                value={form.from ? `${form.from.city} (${form.from.code})` : "Select"}
                active={popup === "from"} onClick={() => toggle("from")} style={{ flex: 1 }} />
              <AirportDropdownPortal anchorRef={fromRef} open={popup === "from"} airports={airports}
                onSelect={a => { setForm(f => ({ ...f, from: a })); setPopup(null); }}
                onClose={() => setPopup(null)} />
            </div>

            {/* SWAP */}
            <div style={{ display: "flex", alignItems: "center", padding: "0 10px", borderRight: `1px solid ${S.border}`, flexShrink: 0 }}>
              <button type="button" onClick={() => setForm(f => ({ ...f, from: f.to, to: f.from }))}
                style={{ width: 30, height: 30, borderRadius: "50%", border: `1.5px solid ${S.borderMid}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background .15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f0f5fb")}
                onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
                <svg width={14} height={14} fill="none" stroke={S.navyMid} strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </button>
            </div>

            {/* TO */}
            <div ref={toRef} style={{ display: "flex", alignItems: "stretch", flex: 1, minWidth: 150, borderRight: `1px solid ${S.border}` }}>
              <IconField icon={<IconPlane />} label="To"
                value={form.to ? `${form.to.city} (${form.to.code})` : "Select"}
                active={popup === "to"} onClick={() => toggle("to")} style={{ flex: 1 }} />
              <AirportDropdownPortal anchorRef={toRef} open={popup === "to"} airports={airports}
                onSelect={a => { setForm(f => ({ ...f, to: a })); setPopup(null); }}
                onClose={() => setPopup(null)} />
            </div>

            {/* DEPART */}
            <div ref={departRef} style={{ display: "flex", alignItems: "stretch", flex: 1, minWidth: 190, borderRight: isRound ? `1px solid ${S.border}` : "none" }}>
              <IconField icon={<IconCalendar />} label="Departure Date"
                value={form.departDate ? fmtDateLong(form.departDate) : "Select"}
                active={popup === "depart"} onClick={() => toggle("depart")} style={{ flex: 1 }} />
              {popup === "depart" && (
                <CalendarPopup anchorRef={departRef} value={form.departDate}
                  value2={isRound ? form.returnDate : undefined} isRange={isRound}
                  min={today} prices={calPrices}
                  onChange={(d1, d2) => { setForm(f => ({ ...f, departDate: d1, returnDate: d2 ?? f.returnDate })); if (!isRound || d2) setPopup(null); }}
                  onClose={() => setPopup(null)} />
              )}
              {/* Quick day-shift arrows — one-way only, matches the reference design */}
              {!isRound && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 16px", flexShrink: 0 }}>
                  <button type="button" onClick={() => setForm(f => ({ ...f, departDate: shiftDate(f.departDate, -1) }))}
                    style={{ width: 26, height: 26, borderRadius: 8, border: `1px solid ${S.borderMid}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f0f5fb")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
                    <svg width={12} height={12} fill="none" stroke={S.navyMid} strokeWidth={2.4} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => setForm(f => ({ ...f, departDate: shiftDate(f.departDate, 1) }))}
                    style={{ width: 26, height: 26, borderRadius: 8, border: `1px solid ${S.borderMid}`, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f0f5fb")}
                    onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
                    <svg width={12} height={12} fill="none" stroke={S.navyMid} strokeWidth={2.4} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* RETURN — only for round-trip */}
            {isRound && (
              <div ref={returnRef} style={{ display: "flex", alignItems: "stretch", flex: 1, minWidth: 190 }}>
                <IconField icon={<IconCalendar />} label="Return Date"
                  value={form.returnDate ? fmtDateLong(form.returnDate) : "Select"}
                  active={popup === "return"} onClick={() => toggle("return")} style={{ flex: 1 }} />
                {popup === "return" && (
                  <CalendarPopup anchorRef={returnRef} value={form.departDate} value2={form.returnDate}
                    isRange min={today} prices={calPrices}
                    onChange={(d1, d2) => { setForm(f => ({ ...f, departDate: d1, returnDate: d2 ?? "" })); if (d2) setPopup(null); }}
                    onClose={() => setPopup(null)} />
                )}
              </div>
            )}
          </>
        ) : (
          /* MULTI-CITY ROUTE SUMMARY */
          <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "12px 20px", gap: 12 }}>
            <span style={{ flexShrink: 0, display: "flex" }}><IconPlane /></span>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 600, color: S.muted, marginBottom: 2 }}>Route</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: S.navyDeep }}>{routeStr}</div>
              <div style={{ fontSize: 11, color: S.muted, marginTop: 1 }}>{multiLegs.length} flights · edit below ↓</div>
            </div>
          </div>
        )}
      </div>

      {isMulti && (
        <MultiCityPanel legs={multiLegs} airports={airports} today={today}
          totalPax={totalPax} cabinClass={form.cabinClass} legPrices={legPrices}
          onUpdate={updateLeg} onAdd={addLeg} onRemove={removeLeg} />
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}