// src/components/search/HotelsSearchForm.tsx
// UI: Dark glassmorphism matching the flights hero card style
// Logic/store/validation/navigation: identical to original HotelSearch.tsx

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useHotelStore } from "../../stores/hotelStore";
import { searchCities } from "../../hooks/useHotelApi";
import LocationAutocomplete from "../../components/hotels/LocationAutocomplete";
import GuestsRoomsSelector from "../../components/hotels/GuestsRoomsSelector";
import NationalitySelector from "../../components/hotels/NationalitySelector";

// ─── STYLE TOKENS ──────────────────────────────────────────────
const C = {
  orange:  "#FF682C",
  slate:   "rgba(255,255,255,0.38)",
  divider: "rgba(255,255,255,0.07)",
  border:  "rgba(255,255,255,0.10)",
};

import SharedCalendarPopup, { usePortalPos } from "../../components/hotels/SharedCalendarPopup";
// ─── FIELD COLUMN ──────────────────────────────────────────────
function FieldCol({ label, bordered, children, onClick, zIndex }: {
  label: string; bordered?: boolean; children: React.ReactNode; onClick?: () => void; zIndex?: number;
}) {
  return (
    <div
      onClick={onClick}
      style={{ padding: "14px 18px", borderLeft: bordered ? `1px solid ${C.divider}` : "none", cursor: onClick ? "pointer" : "default", transition: "background 0.15s", position: "relative", zIndex }}
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
  const nationality = searchParams.nationality ?? "IN";

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
    nationality: nationality,
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
    boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3), 0 8px 16px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.18)",
  };

  return (
    <div style={{ width: "100%", position: "relative", zIndex: 50 }}>
      {/* Main glass card */}
      <div style={{ position: "relative", borderRadius: 18, ...glassBg }}>
        {/* Top glass sheen */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1.5, zIndex: 3, background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.55) 50%, rgba(255,255,255,0.04))", pointerEvents: "none" }} />

        {/* Field row: Location | Check-in | Check-out | Guests | Nationality */}
        <div ref={calAnchorRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.1fr_1fr]" style={{ borderBottom: `1px solid ${C.divider}` }}>

          {/* LOCATION */}
          <div style={{
            position: "relative",
            zIndex: 50,
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
          <div style={{ position: "relative", zIndex: 40, ...(errors.checkIn ? { outline: "2px solid rgba(248,113,113,0.6)", outlineOffset: -2 } : {}) }}>
            <DateField
              label="CHECK-IN"
              bordered
              value={checkIn}
              error={errors.checkIn}
              onClick={() => { setCalOpen(true); clearError("checkIn"); }}
            />
          </div>

          {/* CHECK-OUT */}
          <div style={{ position: "relative", zIndex: 30, ...(errors.checkOut ? { outline: "2px solid rgba(248,113,113,0.6)", outlineOffset: -2 } : {}) }}>
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
          <FieldCol label="GUESTS & ROOMS" bordered zIndex={20}>
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

          {/* NATIONALITY */}
          <FieldCol label="NATIONALITY" bordered zIndex={10}>
            <NationalitySelector
              variant="bar"
              theme="dark"
              value={nationality}
              onChange={(v) => setSearchParams({ nationality: v })}
              error={errors.nationality}
            />
          </FieldCol>
        </div>

        {/* Calendar */}
        {calOpen && (
        <SharedCalendarPopup
          value={checkIn} value2={checkOut} isRange
          onClose={() => setCalOpen(false)}
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
onClick={async () => {
  const loc = `${dest.name}, ${dest.country}`;
  setSearchParams({ location: loc });
  clearError("location");
  
  let locId = "";
  try {
    const cities = await searchCities(dest.name);
    if (cities.length > 0) {
      locId = cities[0].cityCode;
      setSearchParams({ 
        locationId: locId,
        destinationCountryCode: cities[0].countryCode 
      });
    }
  } catch (e) {
    console.error(e);
  }

  // If dates already selected, navigate immediately with params
  if (checkIn && checkOut) {
    const params = new URLSearchParams({
      location: loc,
      checkIn,
      checkOut,
      adults:   String(adults),
      children: String(children),
      rooms:    String(rooms),
      nationality: nationality,
    });
    if (locId) {
      params.append("locationId", locId);
    }
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