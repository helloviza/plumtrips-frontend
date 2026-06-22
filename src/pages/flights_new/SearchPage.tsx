import { useCurrency } from '../../hooks/useCurrency';
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { SearchForm, Airport } from "../../lib/types_t";
import { apiGetAirports, apiGetCalendarPrices } from "../../lib/flights_api";

const MOCK_AIRPORTS: Airport[] = [
  { code: "DEL", city: "New Delhi",  name: "Indira Gandhi International",               cityCode: "DEL", country: "India", countryCode: "IN", label: "New Delhi (DEL)" },
  { code: "BOM", city: "Mumbai",     name: "Chhatrapati Shivaji Maharaj International",  cityCode: "BOM", country: "India", countryCode: "IN", label: "Mumbai (BOM)" },
  { code: "BLR", city: "Bengaluru",  name: "Kempegowda International",                   cityCode: "BLR", country: "India", countryCode: "IN", label: "Bengaluru (BLR)" },
];

// ── STYLE TOKENS ─────────────────────────────────────────────
const C = {
  orange:  "#FF682C",
  navy:    "#061224",
  slate:   "rgba(255,255,255,0.38)",
  glassBg: "linear-gradient(180deg, rgba(31,50,86,0.60), rgba(10,22,44,0.74))",
  border:  "rgba(255,255,255,0.10)",
  divider: "rgba(255,255,255,0.07)",
};

// ── TYPES ─────────────────────────────────────────────────────
interface CityLeg {
  from: Airport;
  to: Airport;
  departDate: string;
}

// ── FORMAT HELPER ─────────────────────────────────────────────
function formatCurrency(price: number): string {
  if (price >= 100000) return `{symbol}${(price / 100000).toFixed(1)}L`;
  if (price >= 1000)   return `{symbol}${(price / 1000).toFixed(1)}k`;
  return `{symbol}${price}`;
}

// ── PORTAL POSITION HOOK ──────────────────────────────────────
function usePortalPos(anchorRef: React.RefObject<HTMLElement | null>, open: boolean) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, height: 0 });
  useEffect(() => {
    if (!open || !anchorRef.current) return;
    function measure() {
      if (!anchorRef.current) return;
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height });
    }
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => { window.removeEventListener("scroll", measure, true); window.removeEventListener("resize", measure); };
  }, [open, anchorRef]);
  return pos;
}

// ── FIELD COLUMN ─────────────────────────────────────────────
function FieldCol({ label, bordered, children }: { label: string; bordered?: boolean; children: React.ReactNode }) {
  return (
    <div style={{
      padding: "14px 18px",
      borderLeft: bordered ? `1px solid ${C.divider}` : "none",
      cursor: "pointer",
      transition: "background 0.15s",
    }}
      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{
        fontFamily: "Poppins, sans-serif", fontSize: 9, fontWeight: 600,
        color: C.slate, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 5,
      }}>{label}</div>
      {children}
    </div>
  );
}

function FieldText({ main, sub, dim }: { main: string; sub: string; dim?: boolean }) {
  return (
    <>
      <div style={{
        fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 14,
        color: dim ? "rgba(255,255,255,0.28)" : "#fff", lineHeight: 1.2,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{main}</div>
      <div style={{
        fontFamily: "Poppins, sans-serif", fontSize: 11,
        color: dim ? "rgba(255,255,255,0.20)" : "rgba(255,255,255,0.42)",
        marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{sub}</div>
    </>
  );
}

// ── AIRPORT AUTOCOMPLETE ──────────────────────────────────────
function AirportInput({ label, value, onChange, airports, bordered }: {
  label: string; value: Airport; onChange: (a: Airport) => void; airports: Airport[]; bordered?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const anchorRef = useRef<HTMLDivElement>(null);
  const popupRef  = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const pos = usePortalPos(anchorRef, open);

  const filtered = query.trim()
    ? airports.filter((a) => {
        const q = query.toLowerCase();
        return (a.city?.toLowerCase() || "").includes(q)
          || (a.code?.toLowerCase() || "").includes(q)
          || (a.name?.toLowerCase() || "").includes(q)
          || (a.country?.toLowerCase() || "").includes(q);
      })
    : airports.slice(0, 80);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return;
      if (popupRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div ref={anchorRef} style={{ height: "100%" }}>
      <FieldCol label={label} bordered={bordered}>
        <button
          type="button"
          onClick={() => { setOpen(true); setQuery(""); setTimeout(() => inputRef.current?.focus(), 10); }}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left", width: "100%" }}
        >
          <FieldText main={`${value.code} — ${value.city}`} sub={value.name} />
        </button>
      </FieldCol>

      {open && createPortal(
        <div ref={popupRef} style={{
          position: "absolute", top: pos.top + 4, left: pos.left, width: 340, maxHeight: 360,
          zIndex: 99999, background: "white", borderRadius: 12,
          border: "1px solid #e2e8f0", boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
          overflow: "hidden", display: "flex", flexDirection: "column",
        }}>
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <svg style={{ width: 16, height: 16, color: "#94a3b8", flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input ref={inputRef} style={{ flex: 1, fontSize: 14, color: "#1a3558", outline: "none", background: "transparent", border: "none" }}
              placeholder="Search city or airport…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "24px 16px", fontSize: 13, color: "#94a3b8", textAlign: "center" }}>No airports found</div>
            ) : filtered.map((a) => (
              <button key={a.code} type="button" onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(a); setOpen(false); }}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "11px 16px", textAlign: "left", background: "transparent", border: "none", borderBottom: "1px solid #f8fafc", cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f8fafc")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <div style={{ width: 38, height: 38, borderRadius: 8, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 11, color: "#1a3558", flexShrink: 0 }}>
                  {a.code}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#1a3558" }}>{a.city}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.name}{a.country ? ` · ${a.country}` : ""}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ── CALENDAR ──────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function CalendarPopup({ value, value2, isRange, min, onChange, onClose, anchorRef, prices = {} }: {
  value: string; value2?: string; isRange?: boolean; min?: string;
  onChange: (d1: string, d2?: string) => void; onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
  prices?: Record<string, number>;
}) {
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-CA");
  const minStr = min ?? todayStr;
  const popupRef = useRef<HTMLDivElement>(null);
  const pos = usePortalPos(anchorRef, true);

  const parse = (s: string) => s ? new Date(s + "T00:00:00") : null;
  const [hovering, setHovering] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<"from" | "to">(value ? (isRange && !value2 ? "to" : "from") : "from");
  const [vy,  setVy]  = useState(() => { const d = parse(value); return d ? d.getFullYear() : today.getFullYear(); });
  const [vm,  setVm]  = useState(() => { const d = parse(value); return d ? d.getMonth() : today.getMonth(); });
  const [vy2, setVy2] = useState(() => vm === 11 ? vy + 1 : vy);
  const [vm2, setVm2] = useState(() => vm === 11 ? 0 : vm + 1);

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

  function getVisiblePriceRange(): { min: number; max: number } {
    const visibleDates: string[] = [];
    for (let d = 1; d <= new Date(vy, vm + 1, 0).getDate(); d++) visibleDates.push(toStr(vy, vm, d));
    for (let d = 1; d <= new Date(vy2, vm2 + 1, 0).getDate(); d++) visibleDates.push(toStr(vy2, vm2, d));
    const vals = visibleDates.map(s => prices[s]).filter((p): p is number => p !== undefined && p > 0);
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
      const price = prices[s];
      const pColor = priceColor(price ?? 0, !!sel, priceRange);
      cells.push(
        <button key={d} type="button" disabled={disabled}
          onMouseEnter={() => setHovering(s)} onMouseLeave={() => setHovering(null)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => clickDay(s)}
          style={{ height: 46, display: "flex", alignItems: "center", justifyContent: "center", background: (inRange || hov) && !disabled ? "#fff0ed" : "transparent", border: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.3 : 1 }}
        >
          <span style={{ width: 36, height: 40, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, borderRadius: 8, fontSize: 12, fontWeight: sel ? 900 : 700, background: sel ? C.orange : "transparent", color: sel ? "white" : isToday && !disabled ? C.orange : disabled ? "#9ca3af" : "#1a3558", outline: isToday && !sel && !disabled ? `2px solid ${C.orange}` : "none", outlineOffset: -2 }}>
            <span style={{ lineHeight: 1 }}>{d}</span>
            {price !== undefined && !disabled && (
              <span style={{ fontSize: 7.5, fontWeight: 800, color: pColor, lineHeight: 1, whiteSpace: "nowrap", letterSpacing: "-0.02em" }}>
                {formatCurrency(price)}
              </span>
            )}
          </span>
        </button>
      );
    }
    return cells;
  }

  const priceRange = getVisiblePriceRange();
  const popupLeft = Math.min(pos.left, window.innerWidth - 580 - 8);

  return createPortal(
    <div ref={popupRef} style={{ position: "absolute", top: pos.top + 4, left: Math.max(8, popupLeft), zIndex: 99999, background: "white", borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", minWidth: 560, overflow: "hidden" }}>
      {isRange && (
        <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
          {[{ key: "from" as const, label: "Departure", v: value }, { key: "to" as const, label: "Return", v: value2 ?? "" }].map(({ key, label, v }) => (
            <button key={key} type="button"
              onClick={() => { if (key === "to" && !value) return; setSelecting(key); }}
              style={{ flex: 1, padding: "12px 20px", textAlign: "left", background: "transparent", border: "none", borderBottom: selecting === key ? `2px solid ${C.orange}` : "2px solid transparent", cursor: "pointer" }}
            >
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#1a3558" }}>
                {v ? new Date(v + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Select date"}
              </div>
            </button>
          ))}
        </div>
      )}
      <div style={{ display: "flex" }}>
        {[{ y: vy, m: vm }, { y: vy2, m: vm2 }].map((cal, idx) => (
          <div key={idx} style={{ flex: 1, padding: 16, borderRight: idx === 0 ? "1px solid #f1f5f9" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              {idx === 0 ? (
                <button type="button" onClick={() => advance(-1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <svg style={{ width: 14, height: 14, color: "#64748b" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
              ) : <div style={{ width: 28 }} />}
              <span style={{ fontSize: 13, fontWeight: 900, color: "#1a3558" }}>{MONTHS[cal.m]} {cal.y}</span>
              {idx === 1 ? (
                <button type="button" onClick={() => advance(1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <svg style={{ width: 14, height: 14, color: "#64748b" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : <div style={{ width: 28 }} />}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
              {DAYS.map((d) => <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#94a3b8", padding: "4px 0" }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 2 }}>
              {renderMonth(cal.y, cal.m, priceRange)}
            </div>
          </div>
        ))}
      </div>
      {Object.keys(prices).length > 0 && (
        <div style={{ borderTop: "1px solid #f1f5f9", padding: "8px 20px", display: "flex", alignItems: "center", gap: 14, background: "#fafcff" }}>
          <span style={{ fontSize: 10, color: "#94a3b8", fontWeight: 600 }}>Fares:</span>
          {[{ color: "#059669", label: "Low" }, { color: "#d97706", label: "Mid" }, { color: "#dc2626", label: "High" }].map(({ color, label }) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#6a8ab5", fontWeight: 600 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, display: "inline-block" }} />{label}
            </span>
          ))}
          {priceRange.min > 0 && (
            <span style={{ marginLeft: "auto", fontSize: 10, color: "#059669", fontWeight: 800 }}>From {formatCurrency(priceRange.min)}</span>
          )}
        </div>
      )}
      <div style={{ borderTop: "1px solid #f1f5f9", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
        <button type="button" onClick={() => onChange("", "")}
          style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.color = C.orange)} onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}
        >Clear dates</button>
        <button type="button" onClick={onClose}
          style={{ padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 900, color: "white", background: C.orange, border: "none", cursor: "pointer" }}>Done</button>
      </div>
    </div>,
    document.body
  );
}

// ── COUNTER ───────────────────────────────────────────────────
function Counter({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 9, fontWeight: 600, color: C.slate, textTransform: "uppercase", letterSpacing: "0.09em" }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button type="button" disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}
          style={{ width: 26, height: 26, borderRadius: "50%", border: `1.5px solid rgba(255,255,255,0.22)`, background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 700, cursor: value <= min ? "not-allowed" : "pointer", opacity: value <= min ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, fontFamily: "Poppins, sans-serif" }}>−</button>
        <span style={{ width: 18, textAlign: "center", fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: 14, color: "#fff" }}>{value}</span>
        <button type="button" disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))}
          style={{ width: 26, height: 26, borderRadius: "50%", border: "none", background: C.orange, color: "#fff", fontSize: 15, fontWeight: 700, cursor: value >= max ? "not-allowed" : "pointer", opacity: value >= max ? 0.3 : 1, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, fontFamily: "Poppins, sans-serif" }}>+</button>
      </div>
    </div>
  );
}

// ── CABIN CLASS PICKER ────────────────────────────────────────
const CABIN_CLASSES: SearchForm["cabinClass"][] = ["Economy", "Premium Economy", "Business", "First"];

function CabinClassPicker({ cabinClass, onChange }: {
  cabinClass: SearchForm["cabinClass"];
  onChange: (cls: SearchForm["cabinClass"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const popupRef  = useRef<HTMLDivElement>(null);
  const pos = usePortalPos(anchorRef, open);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return;
      if (popupRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);

  return (
    <div ref={anchorRef}>
      <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 9, fontWeight: 600, color: C.slate, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 4 }}>Cabin Class</div>
      <button type="button" onClick={() => setOpen(!open)}
        style={{ background: "rgba(255,255,255,0.07)", border: `1px solid rgba(255,255,255,0.12)`, color: "#fff", borderRadius: 7, padding: "5px 10px", fontFamily: "Poppins, sans-serif", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
        {cabinClass}
        <svg style={{ width: 10, height: 10, opacity: 0.5 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && createPortal(
        <div ref={popupRef} style={{ position: "absolute", top: pos.top + 4, left: pos.left, width: 200, zIndex: 99999, background: "white", borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 16px 40px rgba(0,0,0,0.12)", overflow: "hidden" }}>
          {CABIN_CLASSES.map((cls) => (
            <button key={cls} type="button" onMouseDown={e => e.preventDefault()}
              onClick={() => { onChange(cls); setOpen(false); }}
              style={{ width: "100%", padding: "11px 16px", textAlign: "left", background: cabinClass === cls ? "#fff0ed" : "transparent", border: "none", borderBottom: "1px solid #f8fafc", cursor: "pointer", fontSize: 13, fontWeight: cabinClass === cls ? 800 : 600, color: cabinClass === cls ? C.orange : "#1a3558" }}
              onMouseEnter={e => { if (cabinClass !== cls) e.currentTarget.style.background = "#f8fafc"; }}
              onMouseLeave={e => { e.currentTarget.style.background = cabinClass === cls ? "#fff0ed" : "transparent"; }}
            >{cls}</button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}

// ── MULTI-CITY LEG ────────────────────────────────────────────
function MultiCityLeg({ leg, index, total, today, airports, onUpdate, onRemove, prices }: {
  leg: CityLeg; index: number; total: number; today: string;
  airports: Airport[]; onUpdate: (l: Partial<CityLeg>) => void; onRemove: () => void;
  prices: Record<string, number>;
}) {
  const [calOpen, setCalOpen] = useState(false);
  const calAnchorRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 10, fontWeight: 700, color: C.orange, textTransform: "uppercase", letterSpacing: "0.1em" }}>Flight {index + 1}</span>
        {total > 2 && (
          <button type="button" onClick={onRemove}
            style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontFamily: "Poppins, sans-serif", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 4 }}>
            <svg style={{ width: 11, height: 11 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            Remove
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.7fr", borderRadius: 12, overflow: "hidden", background: "rgba(255,255,255,0.05)", border: `1px solid ${C.border}` }}>
        <AirportInput label="From" value={leg.from} airports={airports} onChange={(a) => onUpdate({ from: a })} />
        <AirportInput label="To" value={leg.to} airports={airports} onChange={(a) => onUpdate({ to: a })} bordered />
        <div ref={calAnchorRef}>
          <FieldCol label="Depart" bordered>
            <button type="button" onClick={() => setCalOpen(!calOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
              {leg.departDate ? (() => {
                const d = new Date(leg.departDate + "T00:00:00");
                return <FieldText main={d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })} sub={d.toLocaleDateString("en-IN", { weekday: "short" })} />;
              })() : <FieldText main="—" sub="Select date" dim />}
            </button>
          </FieldCol>
          {calOpen && (
            <CalendarPopup value={leg.departDate} min={today} anchorRef={calAnchorRef} prices={prices}
              onChange={(d1) => { onUpdate({ departDate: d1 }); setCalOpen(false); }} onClose={() => setCalOpen(false)} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── GLASS CARD WRAPPER ────────────────────────────────────────
function GlassCard({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      position: "relative",
      borderRadius: 18,
      overflow: "hidden",
      background: C.glassBg,
      backdropFilter: "blur(34px)",
      WebkitBackdropFilter: "blur(34px)",
      border: `1px solid ${C.border}`,
      boxShadow: "0 40px 90px -12px rgba(0,0,0,0.62), 0 10px 30px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.18)",
    }}>
      {/* Top glass sheen */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, zIndex: 3, background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.04))", pointerEvents: "none" }} />
      {children}
    </div>
  );
}

// ── MAIN SEARCH PAGE ──────────────────────────────────────────
interface SearchPageProps {
  onSearch: (form: SearchForm, multiLegs?: CityLeg[]) => void;
  tripType?: "oneWay" | "roundTrip" | "multiCity";
  onTripTypeChange?: (t: "oneWay" | "roundTrip" | "multiCity") => void;
}

export default function SearchPage({ onSearch, tripType: tripTypeProp, onTripTypeChange }: SearchPageProps) {
  const { formatCurrency, symbol } = useCurrency();
  const today = new Date().toLocaleDateString("en-CA");

  const [airports, setAirports] = useState<Airport[]>(MOCK_AIRPORTS);
  useEffect(() => {
    apiGetAirports().then(setAirports).catch(() => setAirports(MOCK_AIRPORTS));
  }, []);

  const [form, setForm] = useState<SearchForm>({
    tripType: tripTypeProp ?? "oneWay",
    from: MOCK_AIRPORTS[0],
    to: MOCK_AIRPORTS[1],
    departDate: today,
    returnDate: "",
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: "Economy",
    nonStopOnly: false,
    fareType: "Regular",
  });

  useEffect(() => {
    if (tripTypeProp) setForm((f) => ({ ...f, tripType: tripTypeProp }));
  }, [tripTypeProp]);

  const [multiLegs, setMultiLegs] = useState<CityLeg[]>([
    { from: MOCK_AIRPORTS[0], to: MOCK_AIRPORTS[1], departDate: today },
    { from: MOCK_AIRPORTS[1] ?? MOCK_AIRPORTS[0], to: MOCK_AIRPORTS[2] ?? MOCK_AIRPORTS[0], departDate: "" },
  ]);

  const [calPrices, setCalPrices] = useState<Record<string, number>>({});
  const [legPrices, setLegPrices] = useState<Record<string, number>[]>([{}, {}]);

  useEffect(() => {
    const fromCode = form.from?.code;
    const toCode   = form.to?.code;
    if (!fromCode || !toCode || fromCode === toCode) return;
    let cancelled = false;
    apiGetCalendarPrices(fromCode, toCode, form.cabinClass)
      .then(prices => { if (!cancelled) setCalPrices(prices); })
      .catch(() => {});
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
  }, [
    form.tripType,
    form.cabinClass,
    ...multiLegs.map(l => `${l.from?.code}-${l.to?.code}`),
  ]);

  const [calOpen, setCalOpen] = useState(false);
  const calAnchorRef = useRef<HTMLDivElement>(null);

  const isRound = form.tripType === "roundTrip";
  const isMulti = form.tripType === "multiCity";

  function setTripType(t: "oneWay" | "roundTrip" | "multiCity") {
    setForm((f) => ({ ...f, tripType: t }));
    onTripTypeChange?.(t);
  }

  function addLeg() {
    if (multiLegs.length >= 5) return;
    const last = multiLegs[multiLegs.length - 1];
    setMultiLegs((legs) => [...legs, { from: last.to, to: airports[0] ?? MOCK_AIRPORTS[0], departDate: last.departDate }]);
    setLegPrices(lp => [...lp, {}]);
  }

  function updateLeg(idx: number, update: Partial<CityLeg>) {
    setMultiLegs((legs) => legs.map((l, i) => (i === idx ? { ...l, ...update } : l)));
  }

  function removeLeg(idx: number) {
    setMultiLegs((legs) => legs.filter((_, i) => i !== idx));
    setLegPrices(lp => lp.filter((_, i) => i !== idx));
  }

  function handleSearch() {
    if (isMulti) {
      if (multiLegs.some((leg) => !leg.departDate)) {
        alert("Please select a departure date for all flights.");
        return;
      }
      onSearch({ ...form, tripType: "multiCity" }, multiLegs);
    } else {
      if (!form.departDate) { alert("Please select a departure date."); return; }
      onSearch(form);
    }
  }

  function formatDate(dateStr: string) {
    if (!dateStr) return null;
    const d = new Date(dateStr + "T00:00:00");
    return {
      dayMonth: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      weekday: d.toLocaleDateString("en-IN", { weekday: "short" }),
    };
  }

  const departFmt = formatDate(form.departDate);
  const returnFmt = formatDate(form.returnDate);

  // ── Trip type config ──
  const tripTypes = [
    { key: "oneWay" as const,    icon: "✈",  label: "One way"    },
    { key: "roundTrip" as const, icon: "⇄",  label: "Round trip" },
    // { key: "multiCity" as const, icon: "⊞",  label: "Multi-city" },   ///To Update Multicity Remove this comment
  ];

  // ── MULTI-CITY RENDER ────────────────────────────────────────
  if (isMulti) {
    return (
      <div style={{ width: "100%" }}>
        <GlassCard>
          {/* Trip-type tabs */}
          <div style={{ display: "flex", gap: 8, padding: "14px 20px 12px", borderBottom: `1px solid ${C.divider}` }}>
            {tripTypes.map(({ key, icon, label }) => {
              const active = form.tripType === key;
              return (
                <button key={key} onClick={() => setTripType(key)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "Poppins, sans-serif", fontWeight: active ? 600 : 400, fontSize: 12, background: active ? C.orange : "rgba(255,255,255,0.06)", color: active ? "#fff" : "rgba(255,255,255,0.5)", border: active ? "none" : `1px solid rgba(255,255,255,0.09)`, boxShadow: active ? "0 4px 14px rgba(255,104,44,0.35)" : "none", transition: "all 0.2s" }}>
                  {icon} {label}
                </button>
              );
            })}
          </div>

          <div style={{ padding: "16px 20px 20px" }}>
            {multiLegs.map((leg, idx) => (
              <MultiCityLeg key={idx} leg={leg} index={idx} total={multiLegs.length}
                today={today} airports={airports} prices={legPrices[idx] ?? {}}
                onUpdate={(u) => updateLeg(idx, u)} onRemove={() => removeLeg(idx)} />
            ))}

            {/* Passengers row */}
            <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap", padding: "14px 0 4px", borderTop: `1px solid ${C.divider}`, marginTop: 6 }}>
              <Counter label="Adults" value={form.adults} min={1} max={9} onChange={(v) => setForm(f => ({ ...f, adults: v }))} />
              <Counter label="Children" value={form.children} min={0} max={9} onChange={(v) => setForm(f => ({ ...f, children: v }))} />
              <Counter label="Infants" value={form.infants} min={0} max={4} onChange={(v) => setForm(f => ({ ...f, infants: v }))} />
              <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.08)" }} />
              <CabinClassPicker cabinClass={form.cabinClass} onChange={(cls) => setForm(f => ({ ...f, cabinClass: cls }))} />
              <div style={{ flex: 1 }} />
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                {multiLegs.length < 5 ? (
                  <button type="button" onClick={addLeg}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.07)", border: `1px solid rgba(255,255,255,0.14)`, borderRadius: 10, padding: "7px 14px", fontFamily: "Poppins, sans-serif", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.65)", cursor: "pointer" }}>
                    <svg style={{ width: 12, height: 12 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    Add city
                  </button>
                ) : (
                  <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Max 5 flights</span>
                )}
                <button onClick={handleSearch} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px 10px 22px", borderRadius: 11, border: "none", background: C.orange, color: "#fff", fontFamily: "Poppins, sans-serif", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 6px 22px rgba(255,104,44,0.45)", letterSpacing: "0.04em" }}>
                  Find Flights
                  <span style={{ width: 26, height: 26, borderRadius: "50%", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✈</span>
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // ── ONE-WAY / ROUND-TRIP RENDER ──────────────────────────────
  return (
    <div style={{ width: "100%" }}>
      <GlassCard>
        {/* Trip-type tabs */}
        <div style={{ display: "flex", gap: 8, padding: "14px 20px 12px", borderBottom: `1px solid ${C.divider}` }}>
          {tripTypes.map(({ key, icon, label }) => {
            const active = form.tripType === key;
            return (
              <button key={key} onClick={() => setTripType(key)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 16px", borderRadius: 10, cursor: "pointer", fontFamily: "Poppins, sans-serif", fontWeight: active ? 600 : 400, fontSize: 12, background: active ? C.orange : "rgba(255,255,255,0.06)", color: active ? "#fff" : "rgba(255,255,255,0.5)", border: active ? "none" : `1px solid rgba(255,255,255,0.09)`, boxShadow: active ? "0 4px 14px rgba(255,104,44,0.35)" : "none", transition: "all 0.2s" }}>
                {icon} {label}
              </button>
            );
          })}
        </div>

        {/* Field row */}
        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 38px 1.15fr 1fr 1fr 1.1fr", alignItems: "center", borderBottom: `1px solid ${C.divider}` }}>
          {/* FROM */}
          <AirportInput label="FROM" value={form.from} airports={airports}
            onChange={(a) => setForm((f) => ({ ...f, from: a }))} />

          {/* Swap */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => setForm(f => ({ ...f, from: f.to, to: f.from }))}
              style={{ width: 30, height: 30, borderRadius: "50%", background: C.orange, border: "none", cursor: "pointer", color: "#fff", fontSize: 13, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 3px 12px rgba(255,104,44,0.45)" }}>⇄</button>
          </div>

          {/* TO */}
          <AirportInput label="TO" value={form.to} airports={airports}
            onChange={(a) => setForm((f) => ({ ...f, to: a }))} bordered />

          {/* DEPARTURE */}
          <div ref={calAnchorRef}>
            <FieldCol label="DEPARTURE" bordered>
              <button type="button" onClick={() => setCalOpen(true)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
                {departFmt
                  ? <FieldText main={departFmt.dayMonth} sub={departFmt.weekday} />
                  : <FieldText main="—" sub="Select date" dim />}
              </button>
            </FieldCol>
          </div>

          {/* RETURN */}
          <FieldCol label="RETURN" bordered>
            <button type="button"
              onClick={isRound ? () => setCalOpen(true) : () => setTripType("roundTrip")}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}>
              {isRound && returnFmt
                ? <FieldText main={returnFmt.dayMonth} sub={returnFmt.weekday} />
                : <FieldText main="—" sub={isRound ? "Select date" : "One way trip"} dim={!isRound} />}
            </button>
          </FieldCol>

          {/* TRAVELERS & CABIN */}
          <FieldCol label="TRAVELERS & CLASS" bordered>
            <FieldText main={`${form.adults} Traveler${form.adults > 1 ? "s" : ""}`} sub={`${form.cabinClass} ▾`} />
          </FieldCol>
        </div>

        {/* Calendar portal */}
        {calOpen && (
          <CalendarPopup
            value={form.departDate}
            value2={isRound ? form.returnDate : undefined}
            isRange={isRound}
            min={today}
            anchorRef={calAnchorRef}
            prices={calPrices}
            onChange={(d1, d2) => {
              setForm((f) => ({ ...f, departDate: d1, returnDate: d2 ?? "" }));
              if (!isRound || d2) setCalOpen(false);
            }}
            onClose={() => setCalOpen(false)}
          />
        )}

        {/* Bottom controls */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "16px 20px", flexWrap: "wrap", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 22, flexWrap: "wrap" }}>
            <Counter label="Adults"   value={form.adults}   min={1} max={9} onChange={(v) => setForm(f => ({ ...f, adults: v }))} />
            <Counter label="Children" value={form.children} min={0} max={9} onChange={(v) => setForm(f => ({ ...f, children: v }))} />
            <Counter label="Infants"  value={form.infants}  min={0} max={4} onChange={(v) => setForm(f => ({ ...f, infants: v }))} />
            <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.08)", flexShrink: 0 }} />
            <CabinClassPicker cabinClass={form.cabinClass} onChange={(cls) => setForm(f => ({ ...f, cabinClass: cls }))} />
            <label style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }}>
              <div onClick={() => setForm(f => ({ ...f, nonStopOnly: !f.nonStopOnly }))}
                style={{ width: 15, height: 15, borderRadius: 4, flexShrink: 0, background: form.nonStopOnly ? C.orange : "rgba(255,255,255,0.08)", border: form.nonStopOnly ? "none" : "1.5px solid rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                {form.nonStopOnly && <span style={{ color: "#fff", fontSize: 9, lineHeight: 1 }}>✓</span>}
              </div>
              <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 12, color: "rgba(255,255,255,0.50)" }}>Non-stop only</span>
            </label>
          </div>

          <button onClick={handleSearch}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px 10px 24px", borderRadius: 11, border: "none", background: C.orange, color: "#fff", fontFamily: "Poppins, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 8px 28px rgba(255,104,44,0.50)" }}>
            Find Flights
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✈</span>
          </button>
        </div>
      </GlassCard>
    </div>
  );
}