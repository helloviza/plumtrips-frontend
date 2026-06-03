import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import type { SearchForm, Airport } from "../../lib/types_t";
import { apiGetAirports } from "../../lib/flights_api";

const MOCK_AIRPORTS: Airport[] = [
  { code: "DEL", city: "New Delhi",  name: "Indira Gandhi International",               cityCode: "DEL", country: "India", countryCode: "IN", label: "New Delhi (DEL)" },
  { code: "BOM", city: "Mumbai",     name: "Chhatrapati Shivaji Maharaj International",  cityCode: "BOM", country: "India", countryCode: "IN", label: "Mumbai (BOM)" },
  { code: "BLR", city: "Bengaluru",  name: "Kempegowda International",                   cityCode: "BLR", country: "India", countryCode: "IN", label: "Bengaluru (BLR)" },
];

// ── TYPES ─────────────────────────────────────────────────
interface CityLeg {
  from: Airport;
  to: Airport;
  departDate: string;
}

// ── PORTAL POSITION HOOK ──────────────────────────────────
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

// ── AIRPORT AUTOCOMPLETE ──────────────────────────────────
function AirportInput({ label, value, onChange, airports }: {
  label: string; value: Airport; onChange: (a: Airport) => void; airports: Airport[];
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
    <div ref={anchorRef} className="relative w-full h-full">
      <button
        type="button"
        onClick={() => { setOpen(true); setQuery(""); setTimeout(() => inputRef.current?.focus(), 10); }}
        className="w-full h-full text-left px-5 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</div>
        <div className="text-xl font-black text-[#1a3558] leading-tight">
          {value.code} — {value.city}
        </div>
        <div className="text-sm text-gray-400 mt-0.5 truncate">{value.name}</div>
      </button>

      {open && createPortal(
        <div
          ref={popupRef}
          style={{
            position: "absolute",
            top: pos.top + 4,
            left: pos.left,
            width: 340,
            maxHeight: 360,
            zIndex: 99999,
            background: "white",
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <svg style={{ width: 16, height: 16, color: "#94a3b8", flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              style={{ flex: 1, fontSize: 14, color: "#1a3558", outline: "none", background: "transparent", border: "none" }}
              placeholder="Search city or airport…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div style={{ overflowY: "auto", flex: 1 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "24px 16px", fontSize: 13, color: "#94a3b8", textAlign: "center" }}>No airports found</div>
            ) : filtered.map((a) => (
              <button
                key={a.code}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onChange(a); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12,
                  padding: "11px 16px", textAlign: "left", background: "transparent",
                  border: "none", borderBottom: "1px solid #f8fafc",
                  cursor: "pointer", color: "#1a3558",
                }}
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

// ── CALENDAR ──────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function CalendarPopup({ value, value2, isRange, min, onChange, onClose, anchorRef }: {
  value: string; value2?: string; isRange?: boolean; min?: string;
  onChange: (d1: string, d2?: string) => void; onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
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
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => clickDay(s)}
          style={{
            height: 34, display: "flex", alignItems: "center", justifyContent: "center",
            background: (inRange || hov) && !disabled ? "#fff0ed" : "transparent",
            border: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.3 : 1,
          }}
        >
          <span style={{
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            borderRadius: "50%", fontSize: 13, fontWeight: sel ? 900 : 600,
            background: sel ? "#d06549" : "transparent",
            color: sel ? "white" : isToday && !disabled ? "#d06549" : "#1a3558",
            outline: isToday && !sel && !disabled ? "2px solid #d06549" : "none",
            outlineOffset: -2,
          }}>{d}</span>
        </button>
      );
    }
    return cells;
  }

  const popupLeft = Math.min(pos.left, window.innerWidth - 580 - 8);

  return createPortal(
    <div ref={popupRef} style={{
      position: "absolute",
      top: pos.top + 4,
      left: Math.max(8, popupLeft),
      zIndex: 99999,
      background: "white",
      borderRadius: 12,
      border: "1px solid #e2e8f0",
      boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      minWidth: 560,
      overflow: "hidden",
    }}>
      {isRange && (
        <div style={{ display: "flex", borderBottom: "1px solid #f1f5f9", background: "#f8fafc" }}>
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
                <button type="button" onClick={() => advance(-1)}
                  style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <svg style={{ width: 14, height: 14, color: "#64748b" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              ) : <div style={{ width: 28 }} />}
              <span style={{ fontSize: 13, fontWeight: 900, color: "#1a3558" }}>{MONTHS[cal.m]} {cal.y}</span>
              {idx === 1 ? (
                <button type="button" onClick={() => advance(1)}
                  style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f1f5f9")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <svg style={{ width: 14, height: 14, color: "#64748b" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : <div style={{ width: 28 }} />}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
              {DAYS.map((d) => <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#94a3b8", padding: "4px 0" }}>{d}</div>)}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 2 }}>
              {renderMonth(cal.y, cal.m)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid #f1f5f9", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
        <button type="button" onClick={() => onChange("", "")}
          style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#d06549")}
          onMouseLeave={e => (e.currentTarget.style.color = "#94a3b8")}
        >Clear dates</button>
        <button type="button" onClick={onClose}
          style={{ padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 900, color: "white", background: "#d06549", border: "none", cursor: "pointer" }}>
          Done
        </button>
      </div>
    </div>,
    document.body
  );
}

// ── COUNTER BUTTON ─────────────────────────────────────────
function Counter({ label, value, min, max, onChange }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={value <= min}
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-500 font-bold text-lg leading-none hover:border-[#d06549] hover:text-[#d06549] disabled:opacity-30 transition-colors"
        >−</button>
        <span className="w-5 text-center font-black text-[#1a3558] text-base">{value}</span>
        <button
          type="button"
          disabled={value >= max}
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg leading-none disabled:opacity-30 transition-opacity"
          style={{ background: "#d06549" }}
        >+</button>
      </div>
    </div>
  );
}

// ── CABIN CLASS PICKER POPUP ──────────────────────────────
function CabinClassPicker({ cabinClass, onChange }: {
  cabinClass: SearchForm["cabinClass"];
  onChange: (cls: SearchForm["cabinClass"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  const popupRef  = useRef<HTMLDivElement>(null);
  const pos = usePortalPos(anchorRef, open);
  const classes: SearchForm["cabinClass"][] = ["Economy", "Premium Economy", "Business", "First"];

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
    <div ref={anchorRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex flex-col gap-1 cursor-pointer"
      >
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-left">Cabin Class</span>
        <span className="text-sm font-black text-[#1a3558] flex items-center gap-1">
          {cabinClass}
          <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </button>
      {open && createPortal(
        <div ref={popupRef} style={{
          position: "absolute",
          top: pos.top + 4,
          left: pos.left,
          width: 200,
          zIndex: 99999,
          background: "white",
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          boxShadow: "0 16px 40px rgba(0,0,0,0.12)",
          overflow: "hidden",
        }}>
          {classes.map((cls) => (
            <button key={cls} type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => { onChange(cls); setOpen(false); }}
              style={{
                width: "100%", padding: "11px 16px", textAlign: "left",
                background: cabinClass === cls ? "#fff0ed" : "transparent",
                border: "none", borderBottom: "1px solid #f8fafc",
                cursor: "pointer", fontSize: 13, fontWeight: cabinClass === cls ? 800 : 600,
                color: cabinClass === cls ? "#d06549" : "#1a3558",
              }}
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

// ── MULTI-CITY LEG ────────────────────────────────────────
function MultiCityLeg({ leg, index, total, today, airports, onUpdate, onRemove }: {
  leg: CityLeg; index: number; total: number; today: string;
  airports: Airport[]; onUpdate: (l: Partial<CityLeg>) => void; onRemove: () => void;
}) {
  const [calOpen, setCalOpen] = useState(false);
  const calAnchorRef = useRef<HTMLDivElement>(null);

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[11px] font-black text-[#d06549] uppercase tracking-widest">Flight {index + 1}</span>
        {total > 2 && (
          <button type="button" onClick={onRemove}
            className="ml-auto text-xs text-gray-400 hover:text-red-400 font-semibold transition-colors flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Remove
          </button>
        )}
      </div>
      <div className="flex divide-x divide-gray-200 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="flex-1">
          <AirportInput label="From" value={leg.from} airports={airports} onChange={(a) => onUpdate({ from: a })} />
        </div>
        <div className="flex-1">
          <AirportInput label="To" value={leg.to} airports={airports} onChange={(a) => onUpdate({ to: a })} />
        </div>
        <div className="flex-[0.7]" ref={calAnchorRef}>
          <button
            type="button"
            onClick={() => setCalOpen(!calOpen)}
            className="w-full h-full text-left px-5 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Depart</div>
            {leg.departDate ? (() => {
              const d = new Date(leg.departDate + "T00:00:00");
              return (
                <>
                  <div className="text-xl font-black text-[#1a3558]">
                    {d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </div>
                  <div className="text-sm text-gray-400 mt-0.5">{d.toLocaleDateString("en-IN", { weekday: "short" })}</div>
                </>
              );
            })() : <div className="text-sm text-gray-400 mt-1">Select date</div>}
          </button>
          {calOpen && (
            <CalendarPopup
              value={leg.departDate} min={today}
              anchorRef={calAnchorRef}
              onChange={(d1) => { onUpdate({ departDate: d1 }); setCalOpen(false); }}
              onClose={() => setCalOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ── MAIN SEARCH PAGE ──────────────────────────────────────
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
  }

  function updateLeg(idx: number, update: Partial<CityLeg>) {
    setMultiLegs((legs) => legs.map((l, i) => (i === idx ? { ...l, ...update } : l)));
  }

  function removeLeg(idx: number) {
    setMultiLegs((legs) => legs.filter((_, i) => i !== idx));
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

  // Format date for display
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

  return (
    <div className="w-full">

      {/* ── Trip type tabs ── */}
      <div className="mb-5">
        <div className="inline-flex bg-gray-200 rounded-full p-1 gap-0.5">
          {(["oneWay", "roundTrip", "multiCity"] as const).map((type) => {
            const labels = { oneWay: "One way", roundTrip: "Round trip", multiCity: "Multi-city" };
            const active = form.tripType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setTripType(type)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  active
                    ? "text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                style={active ? { background: "#d06549" } : {}}
              >
                {labels[type]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MULTI-CITY ── */}
      {isMulti ? (
        <div>
          {multiLegs.map((leg, idx) => (
            <MultiCityLeg key={idx} leg={leg} index={idx} total={multiLegs.length}
              today={today} airports={airports}
              onUpdate={(u) => updateLeg(idx, u)} onRemove={() => removeLeg(idx)} />
          ))}

          {/* Passengers row for multi-city */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 mb-3">
            <div className="flex items-center gap-8 flex-wrap">
              <Counter label="Adults" value={form.adults} min={1} max={9} onChange={(v) => setForm(f => ({ ...f, adults: v }))} />
              <Counter label="Children" value={form.children} min={0} max={9} onChange={(v) => setForm(f => ({ ...f, children: v }))} />
              <Counter label="Infants" value={form.infants} min={0} max={4} onChange={(v) => setForm(f => ({ ...f, infants: v }))} />
              <div className="h-8 w-px bg-gray-200 hidden sm:block" />
              <CabinClassPicker cabinClass={form.cabinClass} onChange={(cls) => setForm(f => ({ ...f, cabinClass: cls }))} />
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            {multiLegs.length < 5 ? (
              <button type="button" onClick={addLeg}
                className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#d06549] transition-colors border border-gray-200 hover:border-[#d06549] px-4 py-2 rounded-xl bg-white shadow-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add another city
              </button>
            ) : (
              <div className="text-xs text-gray-400">Maximum 5 flights</div>
            )}

            <button onClick={handleSearch}
              className="font-black text-sm tracking-widest text-white px-10 py-3.5 rounded-xl transition-all hover:brightness-110 active:scale-95 shadow-lg"
              style={{ background: "#d06549", letterSpacing: "0.12em" }}>
              FIND FLIGHTS
            </button>
          </div>
        </div>
      ) : (
        /* ── ONE-WAY / ROUND-TRIP ── */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-visible">

          {/* ROW 1: FROM | TO */}
          <div className="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200">
            <AirportInput label="From" value={form.from} airports={airports}
              onChange={(a) => setForm((f) => ({ ...f, from: a }))} />
            <AirportInput label="To" value={form.to} airports={airports}
              onChange={(a) => setForm((f) => ({ ...f, to: a }))} />
          </div>

          {/* ROW 2: DEPARTURE | RETURN */}
          <div ref={calAnchorRef} className="grid grid-cols-2 divide-x divide-gray-200 border-b border-gray-200">
            {/* Departure */}
            <button
              type="button"
              className="text-left px-5 py-4 hover:bg-gray-50 transition-colors"
              onClick={() => setCalOpen(true)}
            >
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Departure</div>
              {departFmt ? (
                <>
                  <div className="text-2xl font-black text-[#1a3558]">{departFmt.dayMonth}</div>
                  <div className="text-sm text-gray-400 mt-0.5">{departFmt.weekday}</div>
                </>
              ) : (
                <div className="text-sm text-gray-400 mt-1">Select date</div>
              )}
            </button>

            {/* Return */}
            <div
              onClick={!isRound ? () => { setTripType("roundTrip"); } : undefined}
              className={!isRound ? "cursor-pointer" : ""}
            >
              <button
                type="button"
                className={`w-full h-full text-left px-5 py-4 transition-colors ${isRound ? "hover:bg-gray-50" : "hover:bg-orange-50/30"}`}
                onClick={isRound ? () => setCalOpen(!calOpen) : undefined}
              >
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Return on</div>
                {isRound && returnFmt ? (
                  <>
                    <div className="text-2xl font-black text-[#1a3558]">{returnFmt.dayMonth}</div>
                    <div className="text-sm text-gray-400 mt-0.5">{returnFmt.weekday}</div>
                  </>
                ) : (
                  <>
                    <div className="text-lg font-black text-gray-300 mt-1">—</div>
                    <div className="text-sm text-gray-400 mt-0.5">
                      {isRound ? "Select date" : "One way flight"}
                    </div>
                  </>
                )}
              </button>
            </div>
          </div>

          {calOpen && (
            <CalendarPopup
              value={form.departDate}
              value2={isRound ? form.returnDate : undefined}
              isRange={isRound}
              min={today}
              anchorRef={calAnchorRef}
              onChange={(d1, d2) => {
                setForm((f) => ({ ...f, departDate: d1, returnDate: d2 ?? "" }));
                if (!isRound || d2) setCalOpen(false);
              }}
              onClose={() => setCalOpen(false)}
            />
          )}

          {/* ROW 3: Passengers + FIND FLIGHTS */}
          <div className="flex items-center px-5 py-4 gap-6 flex-wrap">
            <Counter label="Adults" value={form.adults} min={1} max={9}
              onChange={(v) => setForm(f => ({ ...f, adults: v }))} />
            <Counter label="Children" value={form.children} min={0} max={9}
              onChange={(v) => setForm(f => ({ ...f, children: v }))} />
            <Counter label="Infants" value={form.infants} min={0} max={4}
              onChange={(v) => setForm(f => ({ ...f, infants: v }))} />

            <div className="h-10 w-px bg-gray-200 hidden sm:block" />
            <CabinClassPicker cabinClass={form.cabinClass}
              onChange={(cls) => setForm(f => ({ ...f, cabinClass: cls }))} />

            <div className="flex-1" />

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.nonStopOnly}
                  onChange={(e) => setForm((f) => ({ ...f, nonStopOnly: e.target.checked }))}
                  className="w-4 h-4 rounded accent-[#d06549]"
                />
                <span className="text-sm text-gray-500 font-semibold whitespace-nowrap">Non-stop only</span>
              </label>

              <button
                onClick={handleSearch}
                className="font-black text-sm tracking-widest text-white px-10 py-3.5 rounded-xl transition-all hover:brightness-110 active:scale-95 shadow-md whitespace-nowrap"
                style={{ background: "#d06549", letterSpacing: "0.12em" }}
              >
                FIND FLIGHTS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}