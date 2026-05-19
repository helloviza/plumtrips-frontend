// ============================================================
//  OneSearchBar.tsx  — v2 (full SearchPage parity)
//
//  DROP-IN replacement for the old OneSearchBar.
//  - All logic is identical to SearchPage (airport autocomplete,
//    calendar, pax picker, multi-city legs, swap, validation).
//  - The ONLY difference is the UI layout: single compact row
//    instead of SearchPage's stacked cards.
//  - onSearch(form, multiLegs?) signature matches SearchPage exactly.
// ============================================================

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { SearchForm, Airport } from "../../lib/types_t";
import { apiGetAirports } from "../../lib/flights_api";

// ─── MOCK FALLBACK (identical to SearchPage) ───────────────
const MOCK_AIRPORTS: Airport[] = [
  { code: "DEL", city: "New Delhi",  name: "Indira Gandhi International",               cityCode: "DEL", country: "India", countryCode: "IN", label: "New Delhi (DEL)" },
  { code: "BOM", city: "Mumbai",     name: "Chhatrapati Shivaji Maharaj International",  cityCode: "BOM", country: "India", countryCode: "IN", label: "Mumbai (BOM)" },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda International",                   cityCode: "BLR", country: "India", countryCode: "IN", label: "Bengaluru (BLR)" },
];

// ─── TYPES (same as SearchPage) ───────────────────────────
interface CityLeg {
  from: Airport;
  to: Airport;
  departDate: string;
}

// ─── DESIGN TOKENS ────────────────────────────────────────
const S = {
  navy:     "#00305f",
  navyDeep: "#0d2d5e",
  navyMid:  "#00477f",
  accent:   "#d06549",
  accentDk: "#b8543a",
  muted:    "#8fafd4",
  border:   "#e2ecf7",
  borderMid:"#c9d5e8",
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

// ─── PORTAL POSITION HOOK ─────────────────────────────────
function usePortalPos(anchorRef: React.RefObject<HTMLElement | null>, open: boolean) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, height: 0 });
  useEffect(() => {
    if (!open || !anchorRef.current) return;
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

// ─── AIRPORT AUTOCOMPLETE POPUP ───────────────────────────
// Identical filtering logic to SearchPage's AirportInput popup.
// Positioning: drops DOWN below anchor (bar context) instead of up.
function AirportDropdown({
  anchorRef, open, airports, onSelect, onClose,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  airports: Airport[];
  onSelect: (a: Airport) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const pos = usePortalPos(anchorRef, open);

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

  if (!open) return null;

  // Same filtering as SearchPage
  const filtered = query.trim()
    ? airports.filter(a => {
        const q = query.toLowerCase();
        return (
          a.city?.toLowerCase().includes(q) ||
          a.code?.toLowerCase().includes(q) ||
          a.name?.toLowerCase().includes(q) ||
          a.country?.toLowerCase().includes(q)
        );
      })
    : airports.slice(0, 80);

  const popupTop = pos.top + pos.height + 6;
  const popupLeft = Math.min(pos.left, window.innerWidth - 340 - 8);

  return createPortal(
    <div
      ref={popupRef}
      style={{
        position: "absolute",
        top: Math.max(8, popupTop),
        left: Math.max(8, popupLeft),
        width: 340,
        height: 320,
        zIndex: 99999,
        background: "#00305f",
        borderRadius: 14,
        border: "1px solid rgba(255,255,255,0.15)",
        boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.10)", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <svg style={{ width: 16, height: 16, color: "rgba(255,255,255,0.4)", flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          ref={inputRef}
          style={{ flex: 1, fontSize: 14, color: "white", outline: "none", background: "transparent", border: "none" }}
          placeholder="Search city or airport…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      <div style={{ overflowY: "auto", flex: 1 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "24px 16px", fontSize: 13, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>No airports found</div>
        ) : filtered.map(a => (
          <button
            key={a.code}
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => { onSelect(a); onClose(); }}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 12,
              padding: "11px 16px", textAlign: "left", background: "transparent",
              border: "none", borderBottom: "1px solid rgba(255,255,255,0.05)",
              cursor: "pointer", color: "white",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, flexShrink: 0 }}>
              {a.code}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{a.city}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}{a.country ? ` · ${a.country}` : ""}</div>
            </div>
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}

// ─── CALENDAR POPUP ───────────────────────────────────────
// Identical logic to SearchPage's CalendarPopup.
// Positions BELOW anchor (bar context).
function CalendarPopup({
  anchorRef, value, value2, isRange, min, onChange, onClose,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  value: string; value2?: string; isRange?: boolean; min?: string;
  onChange: (d1: string, d2?: string) => void;
  onClose: () => void;
}) {
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-CA");
  const minStr = min ?? todayStr;
  const popupRef = useRef<HTMLDivElement>(null);
  const pos = usePortalPos(anchorRef, true);

  const parse = (s: string) => s ? new Date(s + "T00:00:00") : null;
  const [hovering, setHovering] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<"from" | "to">(
    value ? (isRange && !value2 ? "to" : "from") : "from"
  );
  const [vy, setVy]   = useState(() => { const d = parse(value); return d ? d.getFullYear() : today.getFullYear(); });
  const [vm, setVm]   = useState(() => { const d = parse(value); return d ? d.getMonth() : today.getMonth(); });
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
    if (m > 11) { m = 0; y++; } if (m < 0) { m = 11; y--; }
    setVm(m); setVy(y);
    let m2 = m + 1, y2 = y; if (m2 > 11) { m2 = 0; y2++; }
    setVm2(m2); setVy2(y2);
  }

  function toStr(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function clickDay(s: string) {
    if (s < minStr) return;
    if (!isRange) { onChange(s); onClose(); return; }
    if (selecting === "from") { onChange(s, ""); setSelecting("to"); }
    else { if (s < value) onChange(s, value); else onChange(value, s); onClose(); }
  }

  function renderMonth(y: number, m: number) {
    const days = new Date(y, m + 1, 0).getDate();
    const first = new Date(y, m, 1).getDay();
    const cells: React.ReactNode[] = [];
    for (let i = 0; i < first; i++) cells.push(<div key={`e${i}`} />);
    for (let d = 1; d <= days; d++) {
      const s = toStr(y, m, d);
      const disabled = s < minStr;
      const sel = s === value || (isRange && s === value2);
      const inRange = isRange && value && value2 && s > value && s < value2;
      const hov = isRange && value && !value2 && hovering && selecting === "to" &&
        ((s > value && s < hovering) || (s > hovering && s < value));
      const isToday = s === todayStr;
      cells.push(
        <button key={d} type="button" disabled={disabled}
          onMouseEnter={() => setHovering(s)} onMouseLeave={() => setHovering(null)}
          onMouseDown={e => e.preventDefault()}
          onClick={() => clickDay(s)}
          style={{
            height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            background: (inRange || hov) && !disabled ? "rgba(0,71,127,0.10)" : "transparent",
            border: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.25 : 1,
          }}>
          <span style={{
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "50%", fontSize: 12, fontWeight: 700,
            background: sel ? "#d06549" : "transparent",
            color: sel ? "white" : isToday && !disabled ? "#d06549" : disabled ? "#9ca3af" : "#0d2d5e",
            outline: isToday && !sel && !disabled ? "2px solid #d06549" : "none",
            outlineOffset: -2,
          }}>{d}</span>
        </button>
      );
    }
    return cells;
  }

  const popupTop = pos.top + pos.height + 6;
  const popupLeft = Math.min(pos.left, window.innerWidth - 576 - 8);

  return createPortal(
    <div ref={popupRef} style={{
      position: "absolute",
      top: Math.max(8, popupTop),
      left: Math.max(8, popupLeft),
      zIndex: 99999,
      background: "white",
      borderRadius: 12,
      border: "1px solid #d0dff0",
      boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
      minWidth: 560,
      overflow: "hidden",
    }}>
      {isRange && (
        <div style={{ display: "flex", borderBottom: "1px solid #e8eef8", background: "#f4f7fc" }}>
          {([{ key: "from" as const, label: "Departure", v: value }, { key: "to" as const, label: "Return", v: value2 ?? "" }] as const).map(({ key, label, v }) => (
            <button key={key} type="button"
              onClick={() => { if (key === "to" && !value) return; setSelecting(key); }}
              style={{ flex: 1, padding: "12px 20px", textAlign: "left", background: "transparent", border: "none", borderBottom: selecting === key ? "2px solid #d06549" : "2px solid transparent", cursor: "pointer" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8fafd4", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0d2d5e" }}>
                {v ? new Date(v + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Select date"}
              </div>
            </button>
          ))}
        </div>
      )}
      <div style={{ display: "flex" }}>
        {[{ y: vy, m: vm }, { y: vy2, m: vm2 }].map((cal, idx) => (
          <div key={idx} style={{ flex: 1, padding: 16, borderRight: idx === 0 ? "1px solid #e8eef8" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              {idx === 0 ? (
                <button type="button" onClick={() => advance(-1)}
                  style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4fa")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <svg style={{ width: 16, height: 16, color: "#6a8ab5" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              ) : <div style={{ width: 28 }} />}
              <span style={{ fontSize: 14, fontWeight: 900, color: "#0d2d5e" }}>{MONTHS[cal.m]} {cal.y}</span>
              {idx === 1 ? (
                <button type="button" onClick={() => advance(1)}
                  style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4fa")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <svg style={{ width: 16, height: 16, color: "#6a8ab5" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : <div style={{ width: 28 }} />}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
              {DAYS.map(d => <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#8fafd4", padding: "4px 0" }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 2 }}>
              {renderMonth(cal.y, cal.m)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid #e8eef8", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f4f7fc" }}>
        <button type="button" onClick={() => onChange("", "")}
          style={{ fontSize: 12, color: "#8fafd4", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#d06549")}
          onMouseLeave={e => (e.currentTarget.style.color = "#8fafd4")}>
          Clear dates
        </button>
        <button type="button" onClick={onClose}
          style={{ padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 900, color: "white", background: "#d06549", border: "none", cursor: "pointer" }}>
          Done
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── PASSENGER PICKER POPUP ───────────────────────────────
// Identical logic to SearchPage's PassengerPicker.
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

  if (!open) return null;

  const classes: SearchForm["cabinClass"][] = ["Economy", "Premium Economy", "Business", "First"];

  // Identical PassengerRow UI
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
            style={{ width: 30, height: 30, borderRadius: "50%", background: "#d06549", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: value >= max ? "not-allowed" : "pointer", opacity: value >= max ? 0.3 : 1, fontSize: 18, fontWeight: 700 }}>+</button>
        </div>
      </div>
    );
  }

  const popupTop = pos.top + pos.height + 6;

  return createPortal(
    <div ref={popupRef} style={{
      position: "absolute",
      top: Math.max(8, popupTop),
      left: Math.max(8, pos.left + pos.width - 288),
      width: 288,
      zIndex: 99999,
      background: "#00305f",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.15)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
      padding: 20,
    }}>
      <PRow label="Adults"   sub="12+ years"    value={adults}   min={1} max={9} onCh={v => onChange(v, children, infants, cabinClass)} />
      <PRow label="Children" sub="2–12 years"   value={children} min={0} max={9} onCh={v => onChange(adults, v, infants, cabinClass)} />
      <PRow label="Infants"  sub="Under 2 years" value={infants}  min={0} max={4} onCh={v => onChange(adults, children, v, cabinClass)} />
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Cabin Class</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {classes.map(cls => (
            <button key={cls} type="button" onClick={() => onChange(adults, children, infants, cls)}
              style={{ padding: "8px 4px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", background: cabinClass === cls ? "#d06549" : "transparent", color: cabinClass === cls ? "white" : "rgba(255,255,255,0.65)", border: cabinClass === cls ? "2px solid #d06549" : "2px solid rgba(255,255,255,0.15)" }}>
              {cls}
            </button>
          ))}
        </div>
      </div>
      <button type="button" onClick={onClose}
        style={{ marginTop: 14, width: "100%", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 700, color: "white", background: "#00477f", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}>
        Confirm
      </button>
    </div>,
    document.body
  );
}

// ─── TRIP TYPE PICKER ─────────────────────────────────────
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

  if (!open) return null;

  const opts: { key: SearchForm["tripType"]; label: string; icon: string }[] = [
    { key: "oneWay",    label: "One-way",    icon: "→" },
    { key: "roundTrip", label: "Round trip", icon: "⇄" },
    { key: "multiCity", label: "Multi-city", icon: "⊕" },
  ];

  const popupTop = pos.top + pos.height + 6;

  return createPortal(
    <div ref={popupRef} style={{
      position: "absolute",
      top: Math.max(8, popupTop),
      left: Math.max(8, pos.left),
      width: 180,
      zIndex: 99999,
      background: "#00305f",
      borderRadius: 12,
      border: "1px solid rgba(255,255,255,0.15)",
      boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
      overflow: "hidden",
    }}>
      {opts.map(o => (
        <button key={o.key} type="button"
          onClick={() => { onChange(o.key); onClose(); }}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: 10,
            padding: "12px 16px", textAlign: "left",
            background: value === o.key ? "rgba(255,255,255,0.12)" : "transparent",
            border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)",
            cursor: "pointer", color: "white", fontSize: 13,
            fontWeight: value === o.key ? 800 : 500,
          }}
          onMouseEnter={e => { if (value !== o.key) e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          onMouseLeave={e => { if (value !== o.key) e.currentTarget.style.background = "transparent"; }}
        >
          <span style={{ fontSize: 16, flexShrink: 0 }}>{o.icon}</span>
          {o.label}
          {value === o.key && (
            <svg style={{ marginLeft: "auto", flexShrink: 0 }} width={14} height={14} fill="none" stroke="#d06549" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      ))}
    </div>,
    document.body
  );
}

// ─── COMPACT PILL FIELD ───────────────────────────────────
// The single-row UI atom — replaces SearchPage's stacked card fields.
function PillField({
  label, line1, line2, onClick, active, style: extraStyle,
}: {
  label: string; line1: string; line2?: string;
  onClick: () => void; active?: boolean;
  style?: React.CSSProperties;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "8px 16px",
        background: active ? "#eef4ff" : hov ? "#f5f8fc" : "transparent",
        border: "none", cursor: "pointer", textAlign: "left",
        transition: "background .15s",
        ...extraStyle,
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 1 }}>{label}</div>
      <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: S.navyDeep, lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {line1}
      </div>
      {line2 && (
        <div style={{ fontSize: 10, color: S.muted, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{line2}</div>
      )}
    </button>
  );
}

// ─── MULTI-CITY EXPANDED PANEL ────────────────────────────
// Shown below the bar when tripType === "multiCity".
// Reuses same AirportDropdown + CalendarPopup logic — identical to SearchPage's MultiCityLeg.
function MultiCityPanel({
  legs, airports, today, onUpdate, onAdd, onRemove,
}: {
  legs: CityLeg[];
  airports: Airport[];
  today: string;
  onUpdate: (idx: number, update: Partial<CityLeg>) => void;
  onAdd: () => void;
  onRemove: (idx: number) => void;
}) {
  return (
    <div style={{ background: "white", borderRadius: "0 0 14px 14px", borderTop: "1px solid #e2ecf7", padding: "12px 16px 14px", boxShadow: "0 8px 28px rgba(0,0,0,0.14)" }}>
      {legs.map((leg, idx) => (
        <MultiCityLegRow
          key={idx}
          leg={leg}
          index={idx}
          total={legs.length}
          today={today}
          airports={airports}
          onUpdate={u => onUpdate(idx, u)}
          onRemove={() => onRemove(idx)}
        />
      ))}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        {legs.length < 5 ? (
          <button type="button" onClick={onAdd}
            style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700,
              color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.2)",
              background: "rgba(0,48,95,0.75)", borderRadius: 8, padding: "7px 14px", cursor: "pointer",
              transition: "all .15s",
            }}
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
      </div>
    </div>
  );
}

function MultiCityLegRow({ leg, index, total, today, airports, onUpdate, onRemove }: {
  leg: CityLeg; index: number; total: number; today: string;
  airports: Airport[]; onUpdate: (u: Partial<CityLeg>) => void; onRemove: () => void;
}) {
  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 10, fontWeight: 900, color: "#f9c08a", textTransform: "uppercase", letterSpacing: "0.1em" }}>
          Flight {index + 1}
        </span>
        {total > 2 && (
          <button type="button" onClick={onRemove}
            style={{ marginLeft: "auto", fontSize: 11, color: "rgba(255,255,255,0.4)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}
            onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}>
            <svg width={12} height={12} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Remove
          </button>
        )}
      </div>
      <div style={{ display: "flex", background: "white", border: "1px solid #e2ecf7", borderRadius: 10, overflow: "hidden" }}>
        {/* FROM */}
        <div ref={fromRef} style={{ flex: 1, borderRight: "1px solid #e2ecf7", position: "relative" }}>
          <PillField label="From" line1={leg.from?.code ?? "—"} line2={leg.from?.city} active={fromOpen}
            onClick={() => { setFromOpen(o => !o); setToOpen(false); }} />
          <AirportDropdown anchorRef={fromRef} open={fromOpen} airports={airports}
            onSelect={a => { onUpdate({ from: a }); setFromOpen(false); }}
            onClose={() => setFromOpen(false)} />
        </div>
        {/* TO */}
        <div ref={toRef} style={{ flex: 1, borderRight: "1px solid #e2ecf7", position: "relative" }}>
          <PillField label="To" line1={leg.to?.code ?? "—"} line2={leg.to?.city} active={toOpen}
            onClick={() => { setToOpen(o => !o); setFromOpen(false); }} />
          <AirportDropdown anchorRef={toRef} open={toOpen} airports={airports}
            onSelect={a => { onUpdate({ to: a }); setToOpen(false); }}
            onClose={() => setToOpen(false)} />
        </div>
        {/* DATE */}
        <div ref={calRef} style={{ flex: "0 0 130px", position: "relative" }}>
          {(() => {
            const f = leg.departDate ? (() => {
              const d = new Date(leg.departDate + "T00:00:00");
              return {
                short: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
                sub: d.toLocaleDateString("en-IN", { weekday: "short" }),
              };
            })() : null;
            return (
              <PillField
                label="Depart"
                line1={f?.short ?? "Select date"}
                line2={f?.sub}
                active={calOpen}
                onClick={() => setCalOpen(o => !o)}
              />
            );
          })()}
          {calOpen && (
            <CalendarPopup
              anchorRef={calRef}
              value={leg.departDate}
              min={today}
              onChange={d1 => { onUpdate({ departDate: d1 }); setCalOpen(false); }}
              onClose={() => setCalOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────

export interface OneSearchBarProps {
  /** Mirror of SearchPage's onSearch signature — multiLegs present when tripType === "multiCity" */
  onSearch: (form: SearchForm, multiLegs?: CityLeg[]) => void;
  /** Optional: seed the bar with an existing form (e.g. from ResultsPage) */
  form?: Partial<SearchForm>;
  /** Optional: trip type controlled externally */
  tripType?: SearchForm["tripType"];
  onTripTypeChange?: (t: SearchForm["tripType"]) => void;
}

type ActivePopup = "from" | "to" | "depart" | "return" | "pax" | "tripType" | null;

export default function OneSearchBar({ onSearch, form: formProp, tripType: tripTypeProp, onTripTypeChange }: OneSearchBarProps) {
  const today = new Date().toLocaleDateString("en-CA");

  // ── Core state — identical shape to SearchPage ──────────
  const [airports, setAirports] = useState<Airport[]>(MOCK_AIRPORTS);
  const [form, setForm] = useState<SearchForm>({
    tripType: tripTypeProp ?? formProp?.tripType ?? "oneWay",
    from: formProp?.from ?? MOCK_AIRPORTS[0],
    to:   formProp?.to   ?? MOCK_AIRPORTS[1],
    departDate:  formProp?.departDate  ?? today,
    returnDate:  formProp?.returnDate  ?? "",
    adults:      formProp?.adults      ?? 1,
    children:    formProp?.children    ?? 0,
    infants:     formProp?.infants     ?? 0,
    cabinClass:  formProp?.cabinClass  ?? "Economy",
    nonStopOnly: formProp?.nonStopOnly ?? false,
    fareType:    formProp?.fareType    ?? "Regular",
  });

  // Multi-city legs — identical initial state to SearchPage
  const [multiLegs, setMultiLegs] = useState<CityLeg[]>([
    { from: MOCK_AIRPORTS[0], to: MOCK_AIRPORTS[1], departDate: today },
    { from: MOCK_AIRPORTS[1] ?? MOCK_AIRPORTS[0], to: MOCK_AIRPORTS[2] ?? MOCK_AIRPORTS[0], departDate: "" },
  ]);

  // Sync external tripType prop (mirrors SearchPage's useEffect)
  useEffect(() => {
    if (tripTypeProp) setForm(f => ({ ...f, tripType: tripTypeProp }));
  }, [tripTypeProp]);

  // Sync external form prop (e.g. date strip click from ResultsPage)
  useEffect(() => {
    if (formProp) setForm(f => ({ ...f, ...formProp }));
  }, [formProp]);

  useEffect(() => {
    apiGetAirports().then(setAirports).catch(() => setAirports(MOCK_AIRPORTS));
  }, []);

  // ── Popup state ─────────────────────────────────────────
  const [popup, setPopup] = useState<ActivePopup>(null);
  function toggle(p: ActivePopup) { setPopup(prev => (prev === p ? null : p)); }

  // ── Multi-city helpers — identical to SearchPage ────────
  function addLeg() {
    if (multiLegs.length >= 5) return;
    const last = multiLegs[multiLegs.length - 1];
    setMultiLegs(legs => [...legs, { from: last.to, to: airports[0] ?? MOCK_AIRPORTS[0], departDate: last.departDate }]);
  }
  function updateLeg(idx: number, update: Partial<CityLeg>) {
    setMultiLegs(legs => legs.map((l, i) => (i === idx ? { ...l, ...update } : l)));
  }
  function removeLeg(idx: number) {
    setMultiLegs(legs => legs.filter((_, i) => i !== idx));
  }

  // ── Anchor refs ─────────────────────────────────────────
  const fromRef   = useRef<HTMLDivElement>(null);
  const toRef     = useRef<HTMLDivElement>(null);
  const departRef = useRef<HTMLDivElement>(null);
  const returnRef = useRef<HTMLDivElement>(null);
  const paxRef    = useRef<HTMLDivElement>(null);
  const tripRef   = useRef<HTMLDivElement>(null);

  // ── Submit — identical validation logic to SearchPage ───
  function handleSearch() {
    const isMulti = form.tripType === "multiCity";
    if (isMulti) {
      if (multiLegs.some(leg => !leg.departDate)) {
        alert("Please select a departure date for all flights.");
        return;
      }
      onSearch({ ...form, tripType: "multiCity" }, multiLegs);
    } else {
      if (!form.departDate) { alert("Please select a departure date."); return; }
      onSearch(form);
    }
    setPopup(null);
  }

  // ── Helpers ─────────────────────────────────────────────
  function fmtDate(d: string) {
    if (!d) return null;
    const dt = new Date(d + "T00:00:00");
    return {
      short: dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      sub:   dt.toLocaleDateString("en-IN", { weekday: "short", year: "numeric" }),
    };
  }

  const isRound = form.tripType === "roundTrip";
  const isMulti = form.tripType === "multiCity";
  const departFmt = fmtDate(form.departDate);
  const returnFmt = fmtDate(form.returnDate);
  const totalPax  = form.adults + form.children + form.infants;
  const tripLabel = isRound ? "⇄ Round trip" : isMulti ? "⊕ Multi-city" : "→ One-way";
  const tripColor = isRound ? "#059669" : isMulti ? "#7c3aed" : S.accent;

  // ── Render ───────────────────────────────────────────────
  return (
    <div style={{ width: "100%" }}>
      {/* ── MAIN PILL BAR ───────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "stretch",
        background: "#fff", borderRadius: isMulti ? "14px 14px 0 0" : 14,
        boxShadow: "0 2px 20px rgba(0,0,0,0.22)",
        overflow: "visible",
        position: "relative",
      }}>

        {/* TRIP TYPE */}
        <div ref={tripRef} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => toggle("tripType")}
            style={{
              height: "100%", display: "flex", alignItems: "center", gap: 4,
              padding: "0 14px",
              background: popup === "tripType" ? "rgba(0,48,95,0.10)" : "rgba(0,48,95,0.06)",
              border: "none", borderRight: `1px solid ${S.border}`, cursor: "pointer",
              borderRadius: isMulti ? "14px 0 0 0" : "14px 0 0 14px",
              transition: "background .15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,48,95,0.10)")}
            onMouseLeave={e => (e.currentTarget.style.background = popup === "tripType" ? "rgba(0,48,95,0.10)" : "rgba(0,48,95,0.06)")}
          >
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.04em", color: tripColor, whiteSpace: "nowrap" }}>
              {tripLabel}
            </span>
            <svg width={10} height={10} fill="none" stroke={tripColor} strokeWidth={2.5} viewBox="0 0 24 24" style={{ flexShrink: 0, opacity: 0.7 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <TripTypePicker
            anchorRef={tripRef}
            open={popup === "tripType"}
            value={form.tripType}
            onChange={t => {
              setForm(f => ({ ...f, tripType: t, returnDate: t !== "roundTrip" ? "" : f.returnDate }));
              onTripTypeChange?.(t);
            }}
            onClose={() => setPopup(null)}
          />
        </div>

        {/* FROM (hidden in multi-city — managed in expanded panel) */}
        {!isMulti && (
          <div ref={fromRef} style={{ display: "flex", alignItems: "stretch", flexShrink: 0, minWidth: 130, maxWidth: 170, position: "relative" }}>
            <PillField
              label="From"
              line1={form.from?.code ?? "—"}
              line2={form.from?.city}
              active={popup === "from"}
              onClick={() => toggle("from")}
              style={{ flex: 1, borderRight: `1px solid ${S.border}` }}
            />
            <AirportDropdown
              anchorRef={fromRef}
              open={popup === "from"}
              airports={airports}
              onSelect={a => { setForm(f => ({ ...f, from: a })); setPopup(null); }}
              onClose={() => setPopup(null)}
            />
          </div>
        )}

        {/* SWAP (hidden in multi-city) */}
        {!isMulti && (
          <div style={{ display: "flex", alignItems: "center", padding: "0 4px", borderRight: `1px solid ${S.border}`, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, from: f.to, to: f.from }))}
              title="Swap airports"
              style={{
                width: 28, height: 28, borderRadius: "50%",
                border: `1.5px solid ${S.borderMid}`,
                background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = S.navyDeep; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
            >
              <svg width={13} height={13} fill="none" stroke={S.navyMid} strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </button>
          </div>
        )}

        {/* TO (hidden in multi-city) */}
        {!isMulti && (
          <div ref={toRef} style={{ display: "flex", alignItems: "stretch", flexShrink: 0, minWidth: 130, maxWidth: 170, position: "relative" }}>
            <PillField
              label="To"
              line1={form.to?.code ?? "—"}
              line2={form.to?.city}
              active={popup === "to"}
              onClick={() => toggle("to")}
              style={{ flex: 1, borderRight: `1px solid ${S.border}` }}
            />
            <AirportDropdown
              anchorRef={toRef}
              open={popup === "to"}
              airports={airports}
              onSelect={a => { setForm(f => ({ ...f, to: a })); setPopup(null); }}
              onClose={() => setPopup(null)}
            />
          </div>
        )}

        {/* DEPART DATE (hidden in multi-city — each leg has its own) */}
        {!isMulti && (
          <div ref={departRef} style={{ display: "flex", alignItems: "stretch", flexShrink: 0, minWidth: 110, position: "relative" }}>
            <PillField
              label="Depart"
              line1={departFmt?.short ?? "Select"}
              line2={departFmt?.sub}
              active={popup === "depart"}
              onClick={() => toggle("depart")}
              style={{ flex: 1, borderRight: `1px solid ${S.border}` }}
            />
            {popup === "depart" && (
              <CalendarPopup
                anchorRef={departRef}
                value={form.departDate}
                value2={isRound ? form.returnDate : undefined}
                isRange={isRound}
                min={today}
                onChange={(d1, d2) => {
                  setForm(f => ({ ...f, departDate: d1, returnDate: d2 ?? f.returnDate }));
                  if (!isRound || d2) setPopup(null);
                }}
                onClose={() => setPopup(null)}
              />
            )}
          </div>
        )}

        {/* RETURN DATE — only in round-trip (same "click to enable" behaviour as SearchPage) */}
        {!isMulti && (
          <div ref={returnRef} style={{ display: "flex", alignItems: "stretch", flexShrink: 0, minWidth: 110, position: "relative" }}>
            {isRound ? (
              <>
                <PillField
                  label="Return"
                  line1={returnFmt?.short ?? "Select"}
                  line2={returnFmt?.sub}
                  active={popup === "return"}
                  onClick={() => toggle("return")}
                  style={{ flex: 1, borderRight: `1px solid ${S.border}` }}
                />
                {popup === "return" && (
                  <CalendarPopup
                    anchorRef={returnRef}
                    value={form.departDate}
                    value2={form.returnDate}
                    isRange
                    min={today}
                    onChange={(d1, d2) => {
                      setForm(f => ({ ...f, departDate: d1, returnDate: d2 ?? "" }));
                      if (d2) setPopup(null);
                    }}
                    onClose={() => setPopup(null)}
                  />
                )}
              </>
            ) : (
              // Greyed "add return" nudge — clicking switches to round-trip (same as SearchPage)
              <button
                type="button"
                onClick={() => {
                  setForm(f => ({ ...f, tripType: "roundTrip" }));
                  onTripTypeChange?.("roundTrip");
                }}
                style={{
                  display: "flex", flexDirection: "column", justifyContent: "center",
                  padding: "8px 16px", borderRight: `1px solid ${S.border}`,
                  background: "transparent", border: "none", cursor: "pointer",
                  textAlign: "left", transition: "all .15s", minWidth: 110, opacity: 0.55,
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "#f5f8fc"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "0.55"; e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ fontSize: 9, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 1 }}>Return</div>
                <div style={{ fontWeight: 700, fontSize: 13, color: S.navyDeep, lineHeight: 1 }}>+ Add return</div>
                <div style={{ fontSize: 10, color: S.muted, marginTop: 1 }}>Switch to round-trip</div>
              </button>
            )}
          </div>
        )}

        {/* Multi-city summary pill (shown instead of From/To/Date fields) */}
        {isMulti && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "8px 16px", borderRight: `1px solid ${S.border}` }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 1 }}>Route</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: S.navyDeep }}>
                {multiLegs.map(l => l.from?.code ?? "?").join(" → ")} → {multiLegs[multiLegs.length - 1]?.to?.code ?? "?"}
              </div>
              <div style={{ fontSize: 10, color: S.muted, marginTop: 1 }}>{multiLegs.length} flights · edit below</div>
            </div>
          </div>
        )}

        {/* PAX + CLASS — always visible */}
        <div ref={paxRef} style={{ display: "flex", alignItems: "stretch", flex: isMulti ? "0 0 auto" : 1, minWidth: 0, position: "relative" }}>
          <PillField
            label="Travellers & Class"
            line1={`${totalPax} Traveller${totalPax !== 1 ? "s" : ""}`}
            line2={form.cabinClass}
            active={popup === "pax"}
            onClick={() => toggle("pax")}
            style={{ flex: 1, maxWidth: "100%", overflow: "hidden" }}
          />
          <PaxPicker
            anchorRef={paxRef}
            open={popup === "pax"}
            adults={form.adults}
            children={form.children}
            infants={form.infants}
            cabinClass={form.cabinClass}
            onChange={(a, c, i, cls) => setForm(f => ({ ...f, adults: a, children: c, infants: i, cabinClass: cls }))}
            onClose={() => setPopup(null)}
          />
        </div>

        {/* Non-stop checkbox — compact inline version */}
        <div style={{ display: "flex", alignItems: "center", padding: "0 12px", borderRight: `1px solid ${S.border}`, flexShrink: 0 }}>
          <label style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: S.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>Non-stop</span>
            <input
              type="checkbox"
              checked={form.nonStopOnly}
              onChange={e => setForm(f => ({ ...f, nonStopOnly: e.target.checked }))}
              style={{ accentColor: S.accent, width: 15, height: 15 }}
            />
          </label>
        </div>

        {/* SEARCH BUTTON */}
        <button
          type="button"
          onClick={handleSearch}
          style={{
            background: S.accent, color: "#fff", border: "none",
            padding: "0 26px", cursor: "pointer",
            fontWeight: 800, fontSize: 13,
            letterSpacing: "0.04em", transition: "background .2s",
            flexShrink: 0, display: "flex", alignItems: "center", gap: 8,
            borderRadius: isMulti ? "0 14px 0 0" : "0 14px 14px 0",
          }}
          onMouseEnter={e => (e.currentTarget.style.background = S.accentDk)}
          onMouseLeave={e => (e.currentTarget.style.background = S.accent)}
        >
          <svg width={15} height={15} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <circle cx={11} cy={11} r={8} />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
          </svg>
          Search
        </button>
      </div>

      {/* ── MULTI-CITY EXPANDED PANEL ──────────────────── */}
      {isMulti && (
        <MultiCityPanel
          legs={multiLegs}
          airports={airports}
          today={today}
          onUpdate={updateLeg}
          onAdd={addLeg}
          onRemove={removeLeg}
        />
      )}
    </div>
  );
}