import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { SearchForm, Airport } from "../../lib/types_t";
import { apiGetAirports, apiGetCalendarPrices } from "../../lib/flights_api";

const MOCK_AIRPORTS: Airport[] = [
  { code: "DEL", city: "New Delhi",  name: "Indira Gandhi International",              cityCode: "DEL", country: "India", countryCode: "IN", label: "New Delhi (DEL)" },
  { code: "BOM", city: "Mumbai",     name: "Chhatrapati Shivaji Maharaj International", cityCode: "BOM", country: "India", countryCode: "IN", label: "Mumbai (BOM)" },
  { code: "BLR", city: "Bengaluru", name: "Kempegowda International",                  cityCode: "BLR", country: "India", countryCode: "IN", label: "Bengaluru (BLR)" },
];

// ─── TYPES ─────────────────────────────────────────────────

interface CityLeg {
  from: Airport;
  to: Airport;
  departDate: string;
}

// ─── SHARED STYLE TOKENS ───────────────────────────────────

const fieldBtn =
  "w-full h-full text-left px-4 py-3 transition-colors hover:bg-white/10 group cursor-pointer";
const lbl = "text-[10px] font-bold text-[#8fafd4] uppercase tracking-widest mb-0.5";
const val = "text-[15px] font-black text-[#0d2d5e] leading-tight truncate";
const sub = "text-[11px] text-[#8fafd4] truncate mt-0.5";

const glassCls = "overflow-visible";

const boxBg: React.CSSProperties = {
  background: "white",
};

// ─── FORMAT HELPERS ────────────────────────────────────────

function formatPriceShort(price: number): string {
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  if (price >= 1000)   return `₹${(price / 1000).toFixed(1)}k`;
  return `₹${price}`;
}

// ─── PORTAL POSITION HOOK ──────────────────────────────────

function usePortalPos(
  anchorRef: React.RefObject<HTMLElement | null>,
  open: boolean
) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, anchorHeight: 0 });

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    function measure() {
      if (!anchorRef.current) return;
      const r = anchorRef.current.getBoundingClientRect();
      setPos({
        top: r.top + window.scrollY,
        left: r.left + window.scrollX,
        width: r.width,
        anchorHeight: r.height,
      });
    }
    measure();
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [open, anchorRef]);

  return pos;
}

// ─── AIRPORT AUTOCOMPLETE ──────────────────────────────────

function AirportInput({ label, value, onChange, airports }: {
  label: string; value: Airport; onChange: (a: Airport) => void; airports: Airport[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const anchorRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pos = usePortalPos(anchorRef, open);

  const POPUP_H = 340;

  const filtered = query.trim()
    ? airports.filter((a) => {
        const q = query.toLowerCase();
        const city = a.city?.toLowerCase() || "";
        const code = a.code?.toLowerCase() || "";
        const name = a.name?.toLowerCase() || "";
        const country = a.country?.toLowerCase() || "";
        return (
          city.includes(q) ||
          code.includes(q) ||
          name.includes(q) ||
          country.includes(q)
        );
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

  const popupTop = pos.top - POPUP_H - 6;

  const hasValue = !!value?.code;

  return (
    <div ref={anchorRef} className="relative w-full h-full">
      <button
        type="button"
        onClick={() => { setOpen(true); setQuery(""); setTimeout(() => inputRef.current?.focus(), 10); }}
        className={fieldBtn}
      >
        {!hasValue && <div className={lbl}>{label}</div>}
        <div className={val}>{value.code} — {value.city}</div>
        <div className={sub}>{value.name}</div>
      </button>

      {open && createPortal(
        <div
          ref={popupRef}
          style={{
            position: "absolute",
            top: Math.max(8, popupTop),
            left: pos.left,
            width: 320,
            height: POPUP_H,
            zIndex: 99999,
            background: "#00305f",
            borderRadius: 12,
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
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "24px 16px", fontSize: 14, color: "rgba(255,255,255,0.35)", textAlign: "center" }}>No airports found</div>
            ) : filtered.map((a) => (
              <button
                key={a.code}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(a); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "12px 16px", textAlign: "left", background: "transparent",
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
      )}
    </div>
  );
}

// ─── CALENDAR POPUP ────────────────────────────────────────

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

  const POPUP_H = isRange ? 500 : 440;

  const parse = (s: string) => s ? new Date(s + "T00:00:00") : null;
  const [hovering, setHovering] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<"from" | "to">(
    value ? (isRange && !value2 ? "to" : "from") : "from"
  );
  const [vy, setVy] = useState(() => { const d = parse(value); return d ? d.getFullYear() : today.getFullYear(); });
  const [vm, setVm] = useState(() => { const d = parse(value); return d ? d.getMonth() : today.getMonth(); });
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

  // Find min/max prices in visible months for colour-coding
  const visibleDates: string[] = [];
  for (let d = 1; d <= new Date(vy, vm + 1, 0).getDate(); d++) visibleDates.push(toStr(vy, vm, d));
  for (let d = 1; d <= new Date(vy2, vm2 + 1, 0).getDate(); d++) visibleDates.push(toStr(vy2, vm2, d));
  const visiblePrices = visibleDates.map(s => prices[s]).filter((p): p is number => p !== undefined && p > 0);
  const minPrice = visiblePrices.length ? Math.min(...visiblePrices) : 0;
  const maxPrice = visiblePrices.length ? Math.max(...visiblePrices) : 0;

  function priceColor(price: number, isSel: boolean): string {
    if (isSel) return "rgba(255,255,255,0.9)";
    if (!price || minPrice === maxPrice) return "#059669";
    const ratio = (price - minPrice) / (maxPrice - minPrice);
    if (ratio < 0.33) return "#059669"; // green = cheapest
    if (ratio < 0.66) return "#d97706"; // amber = mid
    return "#dc2626";                   // red = expensive
  }

  function renderMonth(y: number, m: number) {
    const days = new Date(y, m + 1, 0).getDate();
    const first = new Date(y, m, 1).getDay();
    const cells: React.ReactNode[] = [];
    for (let i = 0; i < first; i++) cells.push(<div key={`e${i}`} />);
    for (let d = 1; d <= days; d++) {
      const s = toStr(y, m, d);
      const disabled = s < minStr;
      const sel = Boolean(s === value || (isRange && s === value2));
      const inRange = isRange && value && value2 && s > value && s < value2;
      const hov = isRange && value && !value2 && hovering && selecting === "to" &&
        ((s > value && s < hovering) || (s > hovering && s < value));
      const isToday = s === todayStr;
      const price = prices[s];
      const pColor = priceColor(price ?? 0, sel);

      cells.push(
        <button
          key={d} type="button" disabled={disabled}
          onMouseEnter={() => setHovering(s)} onMouseLeave={() => setHovering(null)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => clickDay(s)}
          style={{
            height: 46,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: (inRange || hov) && !disabled ? "rgba(0,71,127,0.10)" : "transparent",
            border: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.25 : 1,
          }}
        >
          <span style={{
            width: 36, height: 40,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 1,
            borderRadius: 8, fontSize: 12, fontWeight: 700,
            background: sel ? "#d06549" : "transparent",
            color: sel ? "white" : isToday && !disabled ? "#d06549" : disabled ? "#9ca3af" : "#0d2d5e",
            outline: isToday && !sel && !disabled ? "2px solid #d06549" : "none",
            outlineOffset: -2,
          }}>
            <span style={{ lineHeight: 1 }}>{d}</span>
            {price !== undefined && !disabled && (
              <span style={{
                fontSize: 7.5,
                fontWeight: 800,
                color: pColor,
                lineHeight: 1,
                whiteSpace: "nowrap",
                letterSpacing: "-0.02em",
              }}>
                {formatPriceShort(price)}
              </span>
            )}
          </span>
        </button>
      );
    }
    return cells;
  }

  const popupTop = Math.max(8, pos.top - POPUP_H - 6);
  const popupLeft = Math.min(pos.left, window.innerWidth - 576 - 8);

  return createPortal(
    <div
      ref={popupRef}
      style={{
        position: "absolute",
        top: popupTop,
        left: Math.max(8, popupLeft),
        zIndex: 99999,
        background: "white",
        borderRadius: 12,
        border: "1px solid #d0dff0",
        boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
        minWidth: 560,
        overflow: "hidden",
      }}
    >
      {/* Range header */}
      {isRange && (
        <div style={{ display: "flex", borderBottom: "1px solid #e8eef8", background: "#f4f7fc" }}>
          {[
            { key: "from" as const, label: "Departure", v: value },
            { key: "to" as const, label: "Return", v: value2 ?? "" },
          ].map(({ key, label, v }) => (
            <button key={key} type="button"
              onClick={() => { if (key === "to" && !value) return; setSelecting(key); }}
              style={{
                flex: 1, padding: "12px 20px", textAlign: "left", background: "transparent",
                border: "none", borderBottom: selecting === key ? "2px solid #d06549" : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8fafd4", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#0d2d5e" }}>
                {v ? new Date(v + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Select date"}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Two-month grid */}
      <div style={{ display: "flex" }}>
        {[{ y: vy, m: vm }, { y: vy2, m: vm2 }].map((cal, idx) => (
          <div key={idx} style={{ flex: 1, padding: 16, borderRight: idx === 0 ? "1px solid #e8eef8" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              {idx === 0 ? (
                <button type="button" onClick={() => advance(-1)}
                  style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4fa")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
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
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <svg style={{ width: 16, height: 16, color: "#6a8ab5" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : <div style={{ width: 28 }} />}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
              {DAYS.map((d) => <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#8fafd4", padding: "4px 0" }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 2 }}>
              {renderMonth(cal.y, cal.m)}
            </div>
          </div>
        ))}
      </div>

      {/* Price legend */}
      {Object.keys(prices).length > 0 && (
        <div style={{ borderTop: "1px solid #e8eef8", padding: "8px 20px", display: "flex", alignItems: "center", gap: 16, background: "#fafcff" }}>
          <span style={{ fontSize: 10, color: "#8fafd4", fontWeight: 600 }}>Fares:</span>
          {[
            { color: "#059669", label: "Low" },
            { color: "#d97706", label: "Mid" },
            { color: "#dc2626", label: "High" },
          ].map(({ color, label }) => (
            <span key={label} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "#6a8ab5", fontWeight: 600 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
              {label}
            </span>
          ))}
          {minPrice > 0 && (
            <span style={{ marginLeft: "auto", fontSize: 10, color: "#059669", fontWeight: 700 }}>
              From {formatPriceShort(minPrice)}
            </span>
          )}
        </div>
      )}

      <div style={{ borderTop: "1px solid #e8eef8", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f4f7fc" }}>
        <button type="button" onClick={() => onChange("", "")}
          style={{ fontSize: 12, color: "#8fafd4", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#d06549")}
          onMouseLeave={e => (e.currentTarget.style.color = "#8fafd4")}
        >
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

// ─── DATE FIELD ────────────────────────────────────────────

function DateField({ label, value, isRange, disabled, onClick }: {
  label: string; value: string; value2?: string; isRange?: boolean;
  min?: string; disabled?: boolean; onClick?: () => void;
}) {
  const hasValue = !!value;
  const f = hasValue ? (() => {
    const d = new Date(value + "T00:00:00");
    return {
      date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      year: d.getFullYear().toString(),
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
    };
  })() : null;

  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className={`${fieldBtn} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
      {!hasValue && <div className={lbl}>{label}</div>}
      {f ? (
        <>
          <div className={val}>{f.date} <span className="text-white/50 text-xs font-semibold">{f.year}</span></div>
          <div className={sub}>{f.day}</div>
        </>
      ) : (
        <div className="text-sm text-[#b0bfd4] font-medium mt-1">{disabled ? "—" : "Select date"}</div>
      )}
    </button>
  );
}

// ─── PASSENGER ROW ─────────────────────────────────────────

function PassengerRow({ label, sub: subtitle, value, min, max, onChange }: {
  label: string; sub: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{label}</div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{subtitle}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.25)", background: "transparent", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", cursor: value <= min ? "not-allowed" : "pointer", opacity: value <= min ? 0.3 : 1, fontSize: 18, fontWeight: 700 }}>−</button>
        <span style={{ width: 18, textAlign: "center", fontWeight: 900, color: "white", fontSize: 14 }}>{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
          style={{ width: 30, height: 30, borderRadius: "50%", background: "#d06549", border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: value >= max ? "not-allowed" : "pointer", opacity: value >= max ? 0.3 : 1, fontSize: 18, fontWeight: 700 }}>+</button>
      </div>
    </div>
  );
}

// ─── PASSENGER PICKER ──────────────────────────────────────

function PassengerPicker({ adults, children, infants, cabinClass, onChange }: {
  adults: number; children: number; infants: number; cabinClass: SearchForm["cabinClass"];
  onChange: (a: number, c: number, i: number, cls: SearchForm["cabinClass"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const classes: SearchForm["cabinClass"][] = ["Economy", "Premium Economy", "Business", "First"];
  const total = adults + children + infants;
  const pos = usePortalPos(anchorRef, open);

  const POPUP_H = 290;

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
    <div ref={anchorRef} className="relative w-full h-full">
      <button type="button" onClick={() => setOpen(!open)} className={`${fieldBtn} group`}>
        <div className={lbl}>Passengers &amp; Class</div>
        <div className={val}>{total} {total === 1 ? "Traveller" : "Travellers"}</div>
        <div className={sub}>{cabinClass}</div>
      </button>

      {open && createPortal(
        <div
          ref={popupRef}
          style={{
            position: "absolute",
            top: Math.max(8, pos.top - POPUP_H - 6),
            left: Math.max(8, pos.left + pos.width - 288),
            width: 288,
            zIndex: 99999,
            background: "#00305f",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.15)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
            padding: 20,
          }}
        >
          <PassengerRow label="Adults" sub="12+ years" value={adults} min={1} max={9}
            onChange={(v) => onChange(v, children, infants, cabinClass)} />
          <PassengerRow label="Children" sub="2–12 years" value={children} min={0} max={9}
            onChange={(v) => onChange(adults, v, infants, cabinClass)} />
          <PassengerRow label="Infants" sub="Under 2 years" value={infants} min={0} max={4}
            onChange={(v) => onChange(adults, children, v, cabinClass)} />

          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Cabin Class</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {classes.map((cls) => (
                <button key={cls} type="button"
                  onClick={() => onChange(adults, children, infants, cls)}
                  style={{
                    padding: "8px 4px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer",
                    background: cabinClass === cls ? "#d06549" : "transparent",
                    color: cabinClass === cls ? "white" : "rgba(255,255,255,0.65)",
                    border: cabinClass === cls ? "2px solid #d06549" : "2px solid rgba(255,255,255,0.15)",
                  }}>
                  {cls}
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={() => setOpen(false)}
            style={{ marginTop: 14, width: "100%", borderRadius: 8, padding: "10px", fontSize: 14, fontWeight: 700, color: "white", background: "#00477f", border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer" }}>
            Confirm
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── MULTI-CITY LEG ────────────────────────────────────────

function MultiCityLeg({ leg, index, total, today, airports, onUpdate, onRemove, prices }: {
  leg: CityLeg; index: number; total: number; today: string;
  airports: Airport[]; onUpdate: (l: Partial<CityLeg>) => void; onRemove: () => void;
  prices: Record<string, number>;
}) {
  const [calOpen, setCalOpen] = useState(false);
  const calAnchorRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] font-black text-[#f9c08a] uppercase tracking-widest">Flight {index + 1}</span>
        {total > 2 && (
          <button type="button" onClick={onRemove}
            className="ml-auto text-[10px] text-white/40 hover:text-red-400 font-semibold transition-colors flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Remove
          </button>
        )}
      </div>
      <div className={`flex ${glassCls} divide-x divide-white/10`} style={boxBg}>
        <div className="flex-1">
          <AirportInput label="From" value={leg.from} airports={airports} onChange={(a) => onUpdate({ from: a })} />
        </div>
        <div className="flex-1">
          <AirportInput label="To" value={leg.to} airports={airports} onChange={(a) => onUpdate({ to: a })} />
        </div>
        <div className="flex-[0.7]" ref={calAnchorRef}>
          <DateField label="Depart" value={leg.departDate} min={today} onClick={() => setCalOpen(!calOpen)} />
          {calOpen && (
            <CalendarPopup
              value={leg.departDate} min={today}
              anchorRef={calAnchorRef}
              prices={prices}
              onChange={(d1) => { onUpdate({ departDate: d1 }); setCalOpen(false); }}
              onClose={() => setCalOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN SEARCH PAGE ──────────────────────────────────────

interface SearchPageProps {
  onSearch: (form: SearchForm, multiLegs?: CityLeg[]) => void;
  tripType?: "oneWay" | "roundTrip" | "multiCity";
  onTripTypeChange?: (t: "oneWay" | "roundTrip" | "multiCity") => void;
}

export default function SearchPage({ onSearch, tripType: tripTypeProp, onTripTypeChange }: SearchPageProps) {
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

  // ── Calendar price state ────────────────────────────────
  const [calPrices, setCalPrices] = useState<Record<string, number>>({});
  const [pricesLoading, setPricesLoading] = useState(false);

  useEffect(() => {
    const fromCode = form.tripType === "multiCity" ? multiLegs[0]?.from?.code : form.from?.code;
    const toCode   = form.tripType === "multiCity" ? multiLegs[0]?.to?.code   : form.to?.code;
    if (!fromCode || !toCode || fromCode === toCode) return;

    let cancelled = false;
    setPricesLoading(true);
    apiGetCalendarPrices(fromCode, toCode, form.cabinClass)
      .then((prices) => { if (!cancelled) { setCalPrices(prices); setPricesLoading(false); } })
      .catch(() => { if (!cancelled) setPricesLoading(false); });

    return () => { cancelled = true; };
  }, [form.from?.code, form.to?.code, form.cabinClass, form.tripType, multiLegs]);

  const [calOpen, setCalOpen] = useState(false);
  const calAnchorRef = useRef<HTMLDivElement>(null);

  function addLeg() {
    if (multiLegs.length >= 5) return;
    const last = multiLegs[multiLegs.length - 1];
    setMultiLegs((legs) => [...legs, { from: last.to, to: airports[0] ?? MOCK_AIRPORTS[0], departDate: last.departDate }]);
  }

  function updateLeg(idx: number, update: Partial<CityLeg>) {
    setMultiLegs((legs) => legs.map((l, i) => (i === idx ? { ...l, ...update } : l)));
  }

  function removeLeg(idx: number) {
    setMultiLegs((legs) => legs.filter((_, i) => i !== idx));
  }

  const isRound = form.tripType === "roundTrip";
  const isMulti = form.tripType === "multiCity";

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

  return (
    <div className="w-full">

      {/* ── MULTI-CITY ── */}
      {isMulti ? (
        <div>
          {multiLegs.map((leg, idx) => (
            <MultiCityLeg key={idx} leg={leg} index={idx} total={multiLegs.length}
              today={today} airports={airports}
              prices={calPrices}
              onUpdate={(u) => updateLeg(idx, u)} onRemove={() => removeLeg(idx)} />
          ))}
          <div className="flex items-center justify-between mt-2 mb-3">
            {multiLegs.length < 5 ? (
              <button type="button" onClick={addLeg}
                className="flex items-center gap-2 text-xs font-bold text-white/55 hover:text-[#f9c08a] transition-colors border border-white/20 hover:border-[#f9c08a]/50 px-4 py-2 rounded-lg"
                style={{ background: "rgba(255,255,255,0.06)" }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add another city
              </button>
            ) : (
              <div className="text-xs text-[#b0bfd4]">Maximum 5 flights</div>
            )}
            <div className={`${glassCls} w-52`} style={boxBg}>
              <PassengerPicker adults={form.adults} children={form.children} infants={form.infants}
                cabinClass={form.cabinClass}
                onChange={(a, c, i, cls) => setForm((f) => ({ ...f, adults: a, children: c, infants: i, cabinClass: cls }))} />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">

          {/* ROW 1: From | To */}
          <div className={glassCls} style={boxBg}>
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
              <AirportInput label="From" value={form.from} airports={airports}
                onChange={(a) => setForm((f) => ({ ...f, from: a }))} />
              <AirportInput label="To" value={form.to} airports={airports}
                onChange={(a) => setForm((f) => ({ ...f, to: a }))} />
            </div>
          </div>

          {/* ROW 2: Depart | Return */}
          <div ref={calAnchorRef} className={glassCls} style={boxBg}>
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
              <DateField label="Leave on" value={form.departDate} min={today}
                onClick={() => !isRound && setCalOpen(true)} />
              <div onClick={!isRound ? () => { setForm((f) => ({ ...f, tripType: "roundTrip" })); onTripTypeChange?.("roundTrip"); } : undefined}>
                <DateField label="Return on" value={form.returnDate} value2={form.returnDate}
                  isRange={isRound} min={form.departDate || today}
                  disabled={!isRound}
                  onClick={isRound ? () => setCalOpen(!calOpen) : undefined} />
              </div>
            </div>
          </div>
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

          {/* ROW 3: Passengers + cabin */}
          <div className={glassCls} style={boxBg}>
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
              <div className="flex items-center gap-5 px-4 py-3 flex-wrap">
                {[
                  { label: "Adults", value: form.adults, min: 1, max: 9, key: "adults" as const },
                  { label: "Children", value: form.children, min: 0, max: 9, key: "children" as const },
                  { label: "Infants", value: form.infants, min: 0, max: 4, key: "infants" as const },
                ].map(({ label, value, min, max, key }) => (
                  <label key={key} className="flex flex-col items-center gap-1 cursor-pointer select-none">
                    <span className={lbl}>{label}</span>
                    <div className="flex items-center gap-2">
                      <button type="button"
                        onClick={() => setForm((f) => ({ ...f, [key]: Math.max(min, f[key] - 1) }))}
                        disabled={value <= min}
                        className="w-6 h-6 rounded-full border border-[#c9d5e8] text-[#6a8ab5] flex items-center justify-center hover:border-[#d06549] hover:text-[#d06549] disabled:opacity-30 transition-colors text-sm font-bold">
                        −
                      </button>
                      <span className="w-4 text-center font-black text-[#0d2d5e] text-sm">{value}</span>
                      <button type="button"
                        onClick={() => setForm((f) => ({ ...f, [key]: Math.min(max, f[key] + 1) }))}
                        disabled={value >= max}
                        className="w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-30 transition-colors text-sm font-bold text-white"
                        style={{ background: "#d06549" }}>
                        +
                      </button>
                    </div>
                  </label>
                ))}
              </div>

              <PassengerPicker adults={form.adults} children={form.children} infants={form.infants}
                cabinClass={form.cabinClass}
                onChange={(a, c, i, cls) => setForm((f) => ({ ...f, adults: a, children: c, infants: i, cabinClass: cls }))} />
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom: non-stop + FIND FLIGHTS ── */}
      <div className="flex items-center justify-between mt-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.nonStopOnly}
            onChange={(e) => setForm((f) => ({ ...f, nonStopOnly: e.target.checked }))}
            className="accent-[#d06549] rounded w-4 h-4" />
          <span className="text-sm text-white/65 font-semibold">Non-stop only</span>
        </label>

        <button onClick={handleSearch}
          className="font-black text-sm tracking-widest text-white px-10 py-3 rounded-xl transition-all hover:brightness-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #d06549 0%, #b8543a 100%)",
            letterSpacing: "0.12em",
            boxShadow: "0 4px 24px rgba(208,101,73,0.45)",
          }}>
          {pricesLoading ? "Loading…" : "FIND FLIGHTS"}
        </button>
      </div>
    </div>
  );
}