// src/components/search/HotelsSearchForm.tsx
// UI: Redesigned to match the clean white-card hotel search screenshot
// Logic/store/validation/navigation: identical to original — no backend changes

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useHotelStore } from "../../stores/hotelStore";
import LocationAutocomplete from "../../components/hotels/LocationAutocomplete";

// ─── CALENDAR POPUP (unchanged logic, refreshed skin) ──────

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

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
      setPos({ top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, anchorHeight: r.height });
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

function CalendarPopup({
  value, value2, isRange, min, onChange, onClose, anchorRef,
}: {
  value: string; value2?: string; isRange?: boolean; min?: string;
  onChange: (d1: string, d2?: string) => void; onClose: () => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}) {
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-CA");
  const minStr = min ?? todayStr;
  const popupRef = useRef<HTMLDivElement>(null);
  const pos = usePortalPos(anchorRef, true);
  const POPUP_H = isRange ? 460 : 400;

  const parse = (s: string) => (s ? new Date(s + "T00:00:00") : null);
  const [hovering, setHovering] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<"from" | "to">(
    value ? (isRange && !value2 ? "to" : "from") : "from"
  );
  const [vy, setVy] = useState(() => { const d = parse(value); return d ? d.getFullYear() : today.getFullYear(); });
  const [vm, setVm] = useState(() => { const d = parse(value); return d ? d.getMonth() : today.getMonth(); });
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
      else onChange(value, s);
      onClose();
    }
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
          onMouseDown={(e) => e.preventDefault()} onClick={() => clickDay(s)}
          style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "center",
            background: (inRange || hov) && !disabled ? "rgba(196,90,62,0.10)" : "transparent",
            border: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.25 : 1 }}
        >
          <span style={{ width: 32, height: 32, display: "flex", alignItems: "center",
            justifyContent: "center", borderRadius: "50%", fontSize: 12, fontWeight: 700,
            background: sel ? "#c45a3e" : "transparent",
            color: sel ? "white" : isToday && !disabled ? "#c45a3e" : disabled ? "#9ca3af" : "#1a3a5c",
            outline: isToday && !sel && !disabled ? "2px solid #c45a3e" : "none", outlineOffset: -2 }}>
            {d}
          </span>
        </button>
      );
    }
    return cells;
  }

  const popupTop = Math.max(8, pos.top - POPUP_H - 6);
  const popupLeft = Math.min(pos.left, window.innerWidth - 576 - 8);

  return createPortal(
    <div ref={popupRef} style={{ position: "absolute", top: popupTop, left: Math.max(8, popupLeft),
      zIndex: 99999, background: "white", borderRadius: 16, border: "1px solid #e2e8f0",
      boxShadow: "0 24px 64px rgba(0,0,0,0.18)", minWidth: 560, overflow: "hidden" }}>
      {isRange && (
        <div style={{ display: "flex", borderBottom: "1px solid #e8eef8", background: "#f8fafc" }}>
          {[{ key: "from" as const, label: "Check-in", v: value }, { key: "to" as const, label: "Check-out", v: value2 ?? "" }].map(({ key, label, v }) => (
            <button key={key} type="button"
              onClick={() => { if (key === "to" && !value) return; setSelecting(key); }}
              style={{ flex: 1, padding: "12px 20px", textAlign: "left", background: "transparent", border: "none",
                borderBottom: selecting === key ? "2px solid #c45a3e" : "2px solid transparent", cursor: "pointer" }}>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 14, fontWeight: 900, color: "#1a3a5c" }}>
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
                  style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg style={{ width: 16, height: 16, color: "#94a3b8" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              ) : <div style={{ width: 28 }} />}
              <span style={{ fontSize: 14, fontWeight: 900, color: "#1a3a5c" }}>{MONTHS[cal.m]} {cal.y}</span>
              {idx === 1 ? (
                <button type="button" onClick={() => advance(1)}
                  style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg style={{ width: 16, height: 16, color: "#94a3b8" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : <div style={{ width: 28 }} />}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
              {DAYS.map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#94a3b8", padding: "4px 0" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", rowGap: 2 }}>
              {renderMonth(cal.y, cal.m)}
            </div>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid #e8eef8", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc" }}>
        <button type="button" onClick={() => onChange("", "")}
          style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
          Clear dates
        </button>
        <button type="button" onClick={onClose}
          style={{ padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 900, color: "white", background: "#c45a3e", border: "none", cursor: "pointer" }}>
          Done
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── COUNTER BUTTON ────────────────────────────────────────

function CounterBtn({
  onClick, disabled, children,
}: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-8 h-8 rounded-full flex items-center justify-center text-base font-bold transition-all disabled:opacity-30 select-none"
      style={{
        background: disabled ? "#e2e8f0" : "#c45a3e",
        color: disabled ? "#94a3b8" : "white",
        border: "none",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      {children}
    </button>
  );
}

// ─── POPULAR DESTINATIONS ──────────────────────────────────

const POPULAR_DESTINATIONS = [
  { name: "Dubai",     country: "UAE" },
  { name: "Mumbai",    country: "India" },
  { name: "Goa",       country: "India" },
  { name: "Jaipur",    country: "India" },
  { name: "Maldives",  country: "Maldives" },
  { name: "Singapore", country: "Singapore" },
];

// ─── MAIN COMPONENT ────────────────────────────────────────

export default function HotelsSearchForm() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-CA");

  const { searchParams, setSearchParams, resetBooking } = useHotelStore();

  const toDateStr = (v: Date | string | null | undefined): string => {
    if (!v) return "";
    if (v instanceof Date) return v.toLocaleDateString("en-CA");
    return String(v);
  };

  const location = searchParams.location ?? "";
  const checkIn  = toDateStr(searchParams.checkIn);
  const checkOut = toDateStr(searchParams.checkOut);
  const adults   = searchParams.adults   ?? 2;
  const children = searchParams.children ?? 0;
  const rooms    = searchParams.rooms    ?? 1;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [calOpen, setCalOpen] = useState(false);
  const calAnchorRef = useRef<HTMLDivElement>(null);

  function clearError(key: string) {
    setErrors((e) => { const n = { ...e }; delete n[key]; return n; });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!location.trim()) e.location = "Please enter a destination";
    if (!checkIn)         e.checkIn  = "Select check-in date";
    if (!checkOut)        e.checkOut = "Select check-out date";
    if (checkIn && checkOut) {
      const ci = new Date(checkIn  + "T00:00:00");
      const co = new Date(checkOut + "T00:00:00");
      if (ci >= co) e.checkOut = "Check-out must be after check-in";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSearch() {
    if (!validate()) return;
    resetBooking();
    navigate("/hotels/results");
  }

  function formatDate(d: string) {
    if (!d) return null;
    return new Date(d + "T00:00:00").toLocaleDateString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  return (
    <div className="w-full">
      {/* ── Main card ── */}
      <div
        className="rounded-2xl overflow-visible"
        style={{
          background: "#f0f2f5",
          padding: "20px 20px 16px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
        }}
      >
        {/* ROW 1 — Hotel Location */}
        <div
          className="rounded-xl mb-3 px-4 py-3"
          style={{
            background: "white",
            border: errors.location ? "1.5px solid #f87171" : "1.5px solid transparent",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#1a3a5c", opacity: 0.55 }}>
            Hotel Location
          </div>
          <LocationAutocomplete
            variant="bar"
            value={location}
            error={errors.location}
            placeholder="City, area or property"
            onChange={(v, cityId) => {
              setSearchParams({ location: v, ...(cityId ? { locationId: cityId } : {}) });
              clearError("location");
            }}
          />
          {errors.location && (
            <div className="text-[11px] text-red-400 font-semibold mt-1">{errors.location}</div>
          )}
        </div>

        {/* ROW 2 — Check-in / Check-out */}
        <div ref={calAnchorRef} className="grid grid-cols-2 gap-3 mb-3">
          {/* Check-in */}
          <button
            type="button"
            onClick={() => { setCalOpen(true); clearError("checkIn"); }}
            className="rounded-xl px-4 py-3 text-left transition-all hover:shadow-md"
            style={{
              background: "white",
              border: errors.checkIn ? "1.5px solid #f87171" : "1.5px solid transparent",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              cursor: "pointer",
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#1a3a5c", opacity: 0.55 }}>
              Check-In
            </div>
            <div className="text-[17px] font-black leading-tight" style={{ color: checkIn ? "#1a3a5c" : "#94a3b8" }}>
              {checkIn ? formatDate(checkIn) : "Select date"}
            </div>
            {errors.checkIn && (
              <div className="text-[11px] text-red-400 font-semibold mt-0.5">{errors.checkIn}</div>
            )}
          </button>

          {/* Check-out */}
          <button
            type="button"
            onClick={checkIn ? () => { setCalOpen(true); clearError("checkOut"); } : undefined}
            disabled={!checkIn}
            className="rounded-xl px-4 py-3 text-left transition-all hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: "white",
              border: errors.checkOut ? "1.5px solid #f87171" : "1.5px solid transparent",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              cursor: checkIn ? "pointer" : "not-allowed",
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#1a3a5c", opacity: 0.55 }}>
              Check-Out
            </div>
            <div className="text-[17px] font-black leading-tight" style={{ color: checkOut ? "#1a3a5c" : "#94a3b8" }}>
              {checkOut ? formatDate(checkOut) : "—"}
            </div>
            {errors.checkOut && (
              <div className="text-[11px] text-red-400 font-semibold mt-0.5">{errors.checkOut}</div>
            )}
          </button>
        </div>

        {calOpen && (
          <CalendarPopup
            value={checkIn} value2={checkOut} isRange min={today}
            anchorRef={calAnchorRef}
            onChange={(d1, d2) => {
              setSearchParams({
                checkIn:  d1 ? new Date(d1 + "T00:00:00") : undefined,
                checkOut: d2 ? new Date(d2 + "T00:00:00") : undefined,
              });
              clearError("checkIn"); clearError("checkOut");
              if (d1 && d2) setCalOpen(false);
            }}
            onClose={() => setCalOpen(false)}
          />
        )}

        {/* ROW 3 — Adults / Children / Find Hotels */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Adults counter */}
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1a3a5c", opacity: 0.55 }}>
              Adults
            </span>
            <div className="flex items-center gap-3">
              <CounterBtn onClick={() => setSearchParams({ adults: Math.max(1, adults - 1) })} disabled={adults <= 1}>−</CounterBtn>
              <span className="text-[17px] font-black w-5 text-center" style={{ color: "#1a3a5c" }}>{adults}</span>
              <CounterBtn onClick={() => setSearchParams({ adults: Math.min(8, adults + 1) })} disabled={adults >= 8}>+</CounterBtn>
            </div>
          </div>

          {/* Children counter */}
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1a3a5c", opacity: 0.55 }}>
              Children
            </span>
            <div className="flex items-center gap-3">
              <CounterBtn onClick={() => setSearchParams({ children: Math.max(0, children - 1) })} disabled={children <= 0}>−</CounterBtn>
              <span className="text-[17px] font-black w-5 text-center" style={{ color: "#1a3a5c" }}>{children}</span>
              <CounterBtn onClick={() => setSearchParams({ children: Math.min(4, children + 1) })} disabled={children >= 4}>+</CounterBtn>
            </div>
          </div>

          {/* Rooms counter */}
          <div className="flex flex-col items-start">
            <span className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#1a3a5c", opacity: 0.55 }}>
              Rooms
            </span>
            <div className="flex items-center gap-3">
              <CounterBtn onClick={() => setSearchParams({ rooms: Math.max(1, rooms - 1) })} disabled={rooms <= 1}>−</CounterBtn>
              <span className="text-[17px] font-black w-5 text-center" style={{ color: "#1a3a5c" }}>{rooms}</span>
              <CounterBtn onClick={() => setSearchParams({ rooms: Math.min(8, rooms + 1) })} disabled={rooms >= 8}>+</CounterBtn>
            </div>
          </div>

          {/* Spacer + Find Hotels button */}
          <div className="flex-1 flex justify-end">
            <button
              type="button"
              onClick={handleSearch}
              className="rounded-xl font-black tracking-widest text-white transition-all hover:brightness-110 active:scale-95"
              style={{
                background: "#c45a3e",
                padding: "14px 36px",
                fontSize: 14,
                letterSpacing: "0.1em",
                boxShadow: "0 4px 20px rgba(196,90,62,0.4)",
                border: "none",
                cursor: "pointer",
              }}
            >
              FIND HOTELS
            </button>
          </div>
        </div>
      </div>

      {/* ── Popular destinations (below the card) ── */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Popular:</span>
        {POPULAR_DESTINATIONS.slice(0, 4).map((dest) => (
          <button
            key={dest.name}
            type="button"
            onClick={() => {
              setSearchParams({ location: `${dest.name}, ${dest.country}` });
              clearError("location");
            }}
            className="text-[11px] font-semibold text-white/60 hover:text-white border border-white/15 hover:border-white/35 px-2.5 py-1 rounded-full transition-all"
            style={{ background: "rgba(255,255,255,0.07)" }}
          >
            {dest.name}
          </button>
        ))}
      </div>
    </div>
  );
}