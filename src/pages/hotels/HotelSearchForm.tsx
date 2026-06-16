// src/components/search/HotelsSearchForm.tsx
// UI: Dark glassmorphism matching the flights hero card style
// Logic/store/validation/navigation: identical to original HotelSearch.tsx

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useHotelStore } from "../../stores/hotelStore";
import LocationAutocomplete from "../../components/hotels/LocationAutocomplete";
import GuestsRoomsSelector from "../../components/hotels/GuestsRoomsSelector";

// ─── STYLE TOKENS ──────────────────────────────────────────────
const C = {
  orange:  "#FF682C",
  slate:   "rgba(255,255,255,0.38)",
  divider: "rgba(255,255,255,0.07)",
  border:  "rgba(255,255,255,0.10)",
};

// ─── PORTAL POSITION HOOK ──────────────────────────────────────
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

// ─── CALENDAR POPUP ────────────────────────────────────────────
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

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
  const [vy, setVy]   = useState(() => { const d = parse(value); return d ? d.getFullYear() : today.getFullYear(); });
  const [vm, setVm]   = useState(() => { const d = parse(value); return d ? d.getMonth() : today.getMonth(); });
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
        <button key={d} type="button" disabled={disabled}
          onMouseEnter={() => setHovering(s)} onMouseLeave={() => setHovering(null)}
          onMouseDown={(e) => e.preventDefault()} onClick={() => clickDay(s)}
          style={{ height: 32, display: "flex", alignItems: "center", justifyContent: "center", background: (inRange || hov) && !disabled ? "rgba(255,104,44,0.10)" : "transparent", border: "none", cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.25 : 1 }}
        >
          <span style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", fontSize: 12, fontWeight: 700, background: sel ? C.orange : "transparent", color: sel ? "white" : isToday && !disabled ? C.orange : disabled ? "#9ca3af" : "#0d2d5e", outline: isToday && !sel && !disabled ? `2px solid ${C.orange}` : "none", outlineOffset: -2 }}>
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
    <div ref={popupRef} style={{ position: "absolute", top: popupTop, left: Math.max(8, popupLeft), zIndex: 99999, background: "white", borderRadius: 12, border: "1px solid #d0dff0", boxShadow: "0 24px 64px rgba(0,0,0,0.25)", minWidth: 560, overflow: "hidden" }}>
      {isRange && (
        <div style={{ display: "flex", borderBottom: "1px solid #e8eef8", background: "#f4f7fc" }}>
          {[{ key: "from" as const, label: "Check-in", v: value }, { key: "to" as const, label: "Check-out", v: value2 ?? "" }].map(({ key, label, v }) => (
            <button key={key} type="button"
              onClick={() => { if (key === "to" && !value) return; setSelecting(key); }}
              style={{ flex: 1, padding: "12px 20px", textAlign: "left", background: "transparent", border: "none", borderBottom: selecting === key ? `2px solid ${C.orange}` : "2px solid transparent", cursor: "pointer" }}
            >
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
                <button type="button" onClick={() => advance(-1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4fa")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <svg style={{ width: 16, height: 16, color: "#6a8ab5" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                </button>
              ) : <div style={{ width: 28 }} />}
              <span style={{ fontSize: 14, fontWeight: 900, color: "#0d2d5e" }}>{MONTHS[cal.m]} {cal.y}</span>
              {idx === 1 ? (
                <button type="button" onClick={() => advance(1)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f0f4fa")} onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <svg style={{ width: 16, height: 16, color: "#6a8ab5" }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
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
      <div style={{ borderTop: "1px solid #e8eef8", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f4f7fc" }}>
        <button type="button" onClick={() => onChange("", "")}
          style={{ fontSize: 12, color: "#8fafd4", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}
          onMouseEnter={e => (e.currentTarget.style.color = C.orange)} onMouseLeave={e => (e.currentTarget.style.color = "#8fafd4")}>
          Clear dates
        </button>
        <button type="button" onClick={onClose}
          style={{ padding: "8px 20px", borderRadius: 8, fontSize: 12, fontWeight: 900, color: "white", background: C.orange, border: "none", cursor: "pointer" }}>
          Done
        </button>
      </div>
    </div>,
    document.body
  );
}

// ─── FIELD COLUMN ──────────────────────────────────────────────
function FieldCol({ label, bordered, children, onClick }: {
  label: string; bordered?: boolean; children: React.ReactNode; onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{ padding: "14px 18px", borderLeft: bordered ? `1px solid ${C.divider}` : "none", cursor: onClick ? "pointer" : "default", transition: "background 0.15s" }}
      onMouseEnter={e => { if (onClick) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 9, fontWeight: 600, color: C.slate, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

// ─── DATE FIELD ────────────────────────────────────────────────
function DateField({
  label, value, error, disabled, onClick, bordered,
}: {
  label: string; value: string; error?: string; disabled?: boolean; onClick?: () => void; bordered?: boolean;
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
    <FieldCol label={label} bordered={bordered} onClick={!disabled ? onClick : undefined}>
      <button type="button" onClick={!disabled ? onClick : undefined} disabled={disabled}
        style={{ background: "none", border: "none", cursor: disabled ? "not-allowed" : "pointer", padding: 0, textAlign: "left", opacity: disabled ? 0.4 : 1, width: "100%" }}>
        {f ? (
          <>
            <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 14, color: "#fff", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {f.date} <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 500 }}>{f.year}</span>
            </div>
            <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 11, color: error ? "#f87171" : "rgba(255,255,255,0.42)", marginTop: 2 }}>
              {error || f.day}
            </div>
          </>
        ) : (
          <>
            <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 14, color: "rgba(255,255,255,0.28)", lineHeight: 1.2 }}>—</div>
            <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 11, color: error ? "#f87171" : "rgba(255,255,255,0.28)", marginTop: 2 }}>
              {error || (disabled ? "—" : "Select date")}
            </div>
          </>
        )}
      </button>
    </FieldCol>
  );
}

// ─── POPULAR DESTINATIONS ──────────────────────────────────────
const POPULAR_DESTINATIONS = [
  { name: "Dubai",     country: "UAE"       },
  { name: "Mumbai",    country: "India"     },
  { name: "Goa",       country: "India"     },
  { name: "Jaipur",    country: "India"     },
  { name: "Maldives",  country: "Maldives"  },
  { name: "Singapore", country: "Singapore" },
];

// ─── MAIN HOTELS SEARCH FORM ────────────────────────────────────
export default function HotelsSearchForm() {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString("en-CA");

  const { searchParams, setSearchParams, resetBooking } = useHotelStore();

  const toDateStr = (v: Date | string | null | undefined): string => {
    if (!v) return "";
    if (v instanceof Date) return v.toLocaleDateString("en-CA");
    return String(v);
  };

  const location = searchParams.location  ?? "";
  const checkIn  = toDateStr(searchParams.checkIn);
  const checkOut = toDateStr(searchParams.checkOut);
  const adults   = searchParams.adults    ?? 2;
  const children = searchParams.children  ?? 0;
  const rooms    = searchParams.rooms     ?? 1;

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

// ✅ Replace with
function handleSearch() {
  if (!validate()) return;
  resetBooking();

  const params = new URLSearchParams({
    location:  location.trim(),
    checkIn:   checkIn,
    checkOut:  checkOut,
    adults:    String(adults),
    children:  String(children),
    rooms:     String(rooms),
  });

  navigate(`/hotels/results?${params.toString()}`);
}

  const [calOpen, setCalOpen] = useState(false);
  const calAnchorRef = useRef<HTMLDivElement>(null);

  // Glassmorphic card styles
  const glassBg: React.CSSProperties = {
    background: "linear-gradient(180deg, rgba(31,50,86,0.60), rgba(10,22,44,0.74))",
    backdropFilter: "blur(34px)",
    WebkitBackdropFilter: "blur(34px)",
    border: `1px solid ${C.border}`,
    boxShadow: "0 40px 90px -12px rgba(0,0,0,0.62), 0 10px 30px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.18)",
  };

  return (
    <div style={{ width: "100%", position: "relative", zIndex: 50 }}>
      {/* Main glass card */}
      <div style={{ position: "relative", borderRadius: 18, ...glassBg }}>
        {/* Top glass sheen */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, zIndex: 3, background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.04))", pointerEvents: "none" }} />

        {/* Field row: Location | Check-in | Check-out | Guests */}
        <div ref={calAnchorRef} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1.2fr", borderBottom: `1px solid ${C.divider}` }}>

          {/* LOCATION */}
          <div style={{
            padding: "14px 18px",
            outline: errors.location ? "2px solid rgba(248,113,113,0.6)" : "none",
            outlineOffset: -2,
          }}>
            <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 9, fontWeight: 600, color: C.slate, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 5 }}>DESTINATION</div>
            <LocationAutocomplete
              variant="bar"
              theme="dark"
              value={location}
              error={errors.location}
              placeholder="City, area or property"
              onChange={(v, cityId, countryCode) => {
                setSearchParams({
                  location: v,
                  ...(cityId ? { locationId: cityId } : {}),
                  ...(countryCode ? { destinationCountryCode: countryCode } : {}),
                });
                clearError("location");
              }}
            />
          </div>

          {/* CHECK-IN */}
          <div style={errors.checkIn ? { outline: "2px solid rgba(248,113,113,0.6)", outlineOffset: -2 } : undefined}>
            <DateField
              label="CHECK-IN"
              bordered
              value={checkIn}
              error={errors.checkIn}
              onClick={() => { setCalOpen(true); clearError("checkIn"); }}
            />
          </div>

          {/* CHECK-OUT */}
          <div style={errors.checkOut ? { outline: "2px solid rgba(248,113,113,0.6)", outlineOffset: -2 } : undefined}>
            <DateField
              label="CHECK-OUT"
              bordered
              value={checkOut}
              error={errors.checkOut}
              disabled={!checkIn}
              onClick={checkIn ? () => { setCalOpen(true); clearError("checkOut"); } : undefined}
            />
          </div>

          {/* GUESTS & ROOMS */}
          <FieldCol label="GUESTS & ROOMS" bordered>
            <GuestsRoomsSelector
              variant="bar"
              theme="dark"
              rooms={rooms}
              adults={adults}
              children={children}
              childrenAges={searchParams.childrenAges ?? []}
              onRoomsChange={(r) => setSearchParams({ rooms: r })}
              onAdultsChange={(a) => setSearchParams({ adults: a })}
              onChildrenChange={(c) => setSearchParams({ children: c })}
              onChildrenAgesChange={(ages) => setSearchParams({ childrenAges: ages })}
            />
          </FieldCol>
        </div>

        {/* Calendar */}
        {calOpen && (
          <CalendarPopup
            value={checkIn}
            value2={checkOut}
            isRange
            min={today}
            anchorRef={calAnchorRef}
            onChange={(d1, d2) => {
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

        {/* Bottom bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", flexWrap: "wrap", gap: 12 }}>
          {/* Popular destinations */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: "Poppins, sans-serif", fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em" }}>Popular:</span>
            {POPULAR_DESTINATIONS.slice(0, 4).map((dest) => (
              <button key={dest.name} type="button"
                // ✅ Replace with
onClick={() => {
  const loc = `${dest.name}, ${dest.country}`;
  setSearchParams({ location: loc });
  clearError("location");
  // If dates already selected, navigate immediately with params
  if (checkIn && checkOut) {
    const params = new URLSearchParams({
      location: loc,
      checkIn,
      checkOut,
      adults:   String(adults),
      children: String(children),
      rooms:    String(rooms),
    });
    resetBooking();
    navigate(`/hotels/results?${params.toString()}`);
  }
}}
                style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 999, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", fontFamily: "Poppins, sans-serif", fontSize: 11.5, fontWeight: 500, color: "rgba(255,255,255,0.70)", cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.13)"; (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.70)"; }}
              >
              <img
                    src="/icons/HOTELS.png"
                    alt=""
                    style={{ width: 30, height: 20, marginRight: -4, marginBottom: -2, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" }}
                  />{dest.name}
              </button>
            ))}
          </div>

          {/* Search button */}
          <button type="button" onClick={handleSearch}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px 10px 24px", borderRadius: 11, border: "none", background: C.orange, color: "#fff", fontFamily: "Poppins, sans-serif", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", boxShadow: "0 8px 28px rgba(255,104,44,0.50)", letterSpacing: "0.02em" }}>
            Find Hotels
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.22)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>              <img
                    src="/icons/HOTELS.png"
                    alt=""
                    style={{ width: 30, height: 30, marginRight: -4, marginBottom: -2, filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.25))" }}
                  /></span>
          </button>
        </div>
      </div>
    </div>
  );
}