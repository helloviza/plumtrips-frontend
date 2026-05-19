// src/components/search/HotelsSearchForm.tsx
// UI: HotelsSearchForm's dark glassmorphism style
// Logic/store/validation/navigation: identical to HotelSearch.tsx

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useHotelStore } from "../../stores/hotelStore";
import LocationAutocomplete from "../../components/hotels/LocationAutocomplete";

// ─── SHARED STYLE TOKENS ───────────────────────────────────

const fieldBtn =
  "w-full h-full text-left px-4 py-3 transition-colors hover:bg-white/10 group cursor-pointer";
const lbl =
  "text-[10px] font-bold text-[#8fafd4] uppercase tracking-widest mb-0.5";
const val = "text-[15px] font-black text-[#0d2d5e] leading-tight truncate";
const sub = "text-[11px] text-[#8fafd4] truncate mt-0.5";
const glassCls = "overflow-visible";
const boxBg: React.CSSProperties = { background: "white" };

// ─── PORTAL POSITION HOOK ──────────────────────────────────

function usePortalPos(
  anchorRef: React.RefObject<HTMLElement | null>,
  open: boolean
) {
  const [pos, setPos] = useState({
    top: 0,
    left: 0,
    width: 0,
    anchorHeight: 0,
  });

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

// ─── CALENDAR POPUP ────────────────────────────────────────

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function CalendarPopup({
  value,
  value2,
  isRange,
  min,
  onChange,
  onClose,
  anchorRef,
}: {
  value: string;
  value2?: string;
  isRange?: boolean;
  min?: string;
  onChange: (d1: string, d2?: string) => void;
  onClose: () => void;
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
  const [vy, setVy] = useState(() => {
    const d = parse(value);
    return d ? d.getFullYear() : today.getFullYear();
  });
  const [vm, setVm] = useState(() => {
    const d = parse(value);
    return d ? d.getMonth() : today.getMonth();
  });
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
    if (m < 0) { m = 11; y--; }
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
      const hov =
        isRange && value && !value2 && hovering && selecting === "to" &&
        ((s > value && s < hovering) || (s > hovering && s < value));
      const isToday = s === todayStr;
      cells.push(
        <button
          key={d}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHovering(s)}
          onMouseLeave={() => setHovering(null)}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => clickDay(s)}
          style={{
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: (inRange || hov) && !disabled ? "rgba(0,71,127,0.10)" : "transparent",
            border: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.25 : 1,
          }}
        >
          <span
            style={{
              width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "50%",
              fontSize: 12, fontWeight: 700,
              background: sel ? "#d06549" : "transparent",
              color: sel ? "white" : isToday && !disabled ? "#d06549" : disabled ? "#9ca3af" : "#0d2d5e",
              outline: isToday && !sel && !disabled ? "2px solid #d06549" : "none",
              outlineOffset: -2,
            }}
          >
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
      {isRange && (
        <div style={{ display: "flex", borderBottom: "1px solid #e8eef8", background: "#f4f7fc" }}>
          {[
            { key: "from" as const, label: "Check-in", v: value },
            { key: "to" as const, label: "Check-out", v: value2 ?? "" },
          ].map(({ key, label, v }) => (
            <button
              key={key}
              type="button"
              onClick={() => { if (key === "to" && !value) return; setSelecting(key); }}
              style={{
                flex: 1, padding: "12px 20px", textAlign: "left",
                background: "transparent", border: "none",
                borderBottom: selecting === key ? "2px solid #d06549" : "2px solid transparent",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#8fafd4", marginBottom: 2 }}>
                {label}
              </div>
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
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4fa")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg style={{ width: 16, height: 16, color: "#6a8ab5" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : <div style={{ width: 28 }} />}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: 4 }}>
              {DAYS.map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: 10, fontWeight: 700, color: "#8fafd4", padding: "4px 0" }}>{d}</div>
              ))}
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
          onMouseEnter={(e) => (e.currentTarget.style.color = "#d06549")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#8fafd4")}
        >
          Clear dates
        </button>
        <button type="button" onClick={onClose}
          style={{ padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 900, color: "white", background: "#d06549", border: "none", cursor: "pointer" }}
        >
          Done
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── DATE FIELD ────────────────────────────────────────────

function DateField({
  label,
  value,
  error,
  disabled,
  onClick,
}: {
  label: string;
  value: string;
  error?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const hasValue = !!value;
  const f = hasValue
    ? (() => {
        const d = new Date(value + "T00:00:00");
        return {
          date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
          year: d.getFullYear().toString(),
          day: d.toLocaleDateString("en-IN", { weekday: "short" }),
        };
      })()
    : null;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${fieldBtn} ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
      style={error ? { background: "rgba(254,226,226,0.45)" } : undefined}
    >
      {!hasValue && <div className={lbl}>{label}</div>}
      {f ? (
        <>
          <div className={val}>
            {f.date}{" "}
            <span className="text-white/50 text-xs font-semibold">{f.year}</span>
          </div>
          <div className={sub}>
            {error ? <span className="text-red-400 font-semibold">{error}</span> : f.day}
          </div>
        </>
      ) : (
        <>
          <div className="text-sm text-[#b0bfd4] font-medium mt-1">
            {disabled ? "—" : "Select date"}
          </div>
          {error && <div className="text-[11px] text-red-400 font-semibold mt-0.5">{error}</div>}
        </>
      )}
    </button>
  );
}

// LocationInput is replaced by LocationAutocomplete (imported above)

// ─── POPULAR DESTINATIONS ──────────────────────────────────
// Same list as HotelSearch.tsx

const POPULAR_DESTINATIONS = [
  { name: "Dubai",     country: "UAE" },
  { name: "Mumbai",    country: "India" },
  { name: "Goa",       country: "India" },
  { name: "Jaipur",    country: "India" },
  { name: "Maldives",  country: "Maldives" },
  { name: "Singapore", country: "Singapore" },
];

// ─── MAIN HOTELS SEARCH FORM ───────────────────────────────

export default function HotelsSearchForm() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-CA");

  // ── Store — identical to HotelSearch.tsx ──
  const { searchParams, setSearchParams, resetBooking } = useHotelStore();

  // ── Helper: normalise Date | string | null → "YYYY-MM-DD" | "" ──
  const toDateStr = (v: Date | string | null | undefined): string => {
    if (!v) return "";
    if (v instanceof Date) return v.toLocaleDateString("en-CA");
    return String(v);
  };

  const location  = searchParams.location ?? "";
  const checkIn   = toDateStr(searchParams.checkIn);
  const checkOut  = toDateStr(searchParams.checkOut);
  const adults    = searchParams.adults   ?? 2;
  const children  = searchParams.children ?? 0;
  const rooms     = searchParams.rooms    ?? 1;

  // ── Validation — identical to HotelSearch.tsx validate() ──
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  // ── handleSearch — identical to HotelSearch.tsx ──
  function handleSearch() {
    if (!validate()) return;
    resetBooking();
    navigate("/hotels/results");
  }

  // ── Calendar state ──
  const [calOpen, setCalOpen] = useState(false);
  const calAnchorRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full">
      <div className="space-y-2">

        {/* ROW 1 — Location */}
        <div
          className={glassCls}
          style={{
            ...boxBg,
            borderRadius: 8,
            outline: errors.location ? "2px solid #f87171" : "none",
            outlineOffset: -2,
            padding: "10px 16px",
          }}
        >
          <div className={lbl}>Hotel location</div>
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
        </div>

        {/* ROW 2 — Check-in | Check-out */}
        <div
          ref={calAnchorRef}
          className={glassCls}
          style={{ ...boxBg, borderRadius: 8 }}
        >
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div style={errors.checkIn ? { outline: "2px solid #f87171", outlineOffset: -2 } : undefined}>
              <DateField
                label="Check-in"
                value={checkIn}
                error={errors.checkIn}
                onClick={() => { setCalOpen(true); clearError("checkIn"); }}
              />
            </div>
            <div style={errors.checkOut ? { outline: "2px solid #f87171", outlineOffset: -2 } : undefined}>
              <DateField
                label="Check-out"
                value={checkOut}
                error={errors.checkOut}
                // mirrors HotelSearch: checkOut disabled when no checkIn
                disabled={!checkIn}
                onClick={checkIn ? () => { setCalOpen(true); clearError("checkOut"); } : undefined}
              />
            </div>
          </div>
        </div>

        {calOpen && (
          <CalendarPopup
            value={checkIn}
            value2={checkOut}
            isRange
            min={today}
            anchorRef={calAnchorRef}
            onChange={(d1, d2) => {
              // mirrors HotelSearch: store Date objects, same as DatePicker in HotelSearchBar
              setSearchParams({
                checkIn:  d1 ? new Date(d1 + "T00:00:00") : undefined,
                checkOut: d2 ? new Date(d2 + "T00:00:00") : undefined,
              });
              clearError("checkIn");
              clearError("checkOut");
              if (d1 && d2) setCalOpen(false);
            }}
            onClose={() => setCalOpen(false)}
          />
        )}

        {/* ROW 3 — Guests & Rooms (inline counters) */}
        <div className={glassCls} style={{ ...boxBg, borderRadius: 8 }}>
          <div className="flex items-center gap-5 px-4 py-3 flex-wrap">
            {[
              { label: "Adults",   value: adults,   min: 1, max: 9, key: "adults"   as const },
              { label: "Children", value: children, min: 0, max: 9, key: "children" as const },
              { label: "Rooms",    value: rooms,    min: 1, max: 8, key: "rooms"    as const },
            ].map(({ label, value, min, max, key }) => (
              <label key={key} className="flex flex-col items-center gap-1 cursor-pointer select-none">
                <span className={lbl}>{label}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSearchParams({ [key]: Math.max(min, value - 1) })}
                    disabled={value <= min}
                    className="w-6 h-6 rounded-full border border-[#c9d5e8] text-[#6a8ab5] flex items-center justify-center hover:border-[#d06549] hover:text-[#d06549] disabled:opacity-30 transition-colors text-sm font-bold"
                  >−</button>
                  <span className="w-4 text-center font-black text-[#0d2d5e] text-sm">{value}</span>
                  <button
                    type="button"
                    onClick={() => setSearchParams({ [key]: Math.min(max, value + 1) })}
                    disabled={value >= max}
                    className="w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-30 transition-colors text-sm font-bold text-white"
                    style={{ background: "#d06549" }}
                  >+</button>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bottom bar: Popular destinations + FIND HOTELS ── */}
      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
        {/* Popular destinations — same onClick as HotelSearch.tsx */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mr-1">
            Popular:
          </span>
          {POPULAR_DESTINATIONS.slice(0, 4).map((dest) => (
            <button
              key={dest.name}
              type="button"
              onClick={() => {
                // mirrors HotelSearch.tsx: setSearchParams({ location: `${dest.name}, ${dest.country}` })
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

        {/* Search button — calls handleSearch (same as HotelSearch.tsx) */}
        <button
          type="button"
          onClick={handleSearch}
          className="font-black text-sm tracking-widest text-white px-10 py-3 rounded-xl transition-all hover:brightness-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #d06549 0%, #b8543a 100%)",
            letterSpacing: "0.12em",
            boxShadow: "0 4px 24px rgba(208,101,73,0.45)",
          }}
        >
          FIND HOTELS
        </button>
      </div>
    </div>
  );
}