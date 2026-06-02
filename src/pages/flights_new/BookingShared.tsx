// ============================================================
//  BookingShared.tsx — Shared types, components, price sidebar
// ============================================================

import type { DisplayFlight, FareTier } from "../../lib/types_t";
import { formatINR } from "../../lib/flights_api";

// ─── RE-EXPORT TYPES ────────────────────────────────────────

export interface PassengerData {
  title: "Mr" | "Mrs" | "Ms" | "Mstr" | "Miss";
  firstName: string;
  lastName: string;
  dob: string;
  gender: "Male" | "Female";
  panNumber: string;
  passportNo: string;
  passportExpiry: string;
  nationality: string;
  ffAirlineCode: string;
  ffNumber: string;
  selectedSeat?: string;                   // single-leg seat, e.g. "14A"
  selectedSeats?: Record<number, string>;  // multi-leg: legIndex → seat
}

export interface SeatMap {
  rows: number;
  cols: string[];                          // e.g. ["A","B","C","D","E","F"]
  occupied: string[];                      // e.g. ["3A","7F"]
  premium: string[];                       // window/extra-legroom seats
  prices: Record<string, number>;          // e.g. { "14A": 350, "1A": 750 }
  types: Record<string, "Window" | "Middle" | "Aisle">;
}

export interface ExtraSelection {
  legIndex: number;
  passengerId: number;
  mealCode: string;
  mealLabel: string;
  mealPrice: number;
  baggageKg: number;
  baggagePrice: number;
}

export interface BookingFormState {
  passengers: PassengerData[];
  contactEmail: string;
  contactPhone: string;
  gstNumber: string;
  gstCompanyName: string;
  gstCompanyEmail: string;
  gstCompanyAddress: string;
  promoCode: string;
  promoApplied: boolean;
  promoDiscount: number;
  extras: ExtraSelection[];
}

export function emptyPassenger(type: "adult" | "child" | "infant"): PassengerData {
  return {
    title: type === "adult" ? "Mr" : "Mstr",
    firstName: "", lastName: "", dob: "",
    gender: "Male", panNumber: "", passportNo: "",
    passportExpiry: "", nationality: "IN",
    ffAirlineCode: "", ffNumber: "",
  };
}

// ─── AIRLINE COLORS ─────────────────────────────────────────

export const AIRLINE_COLORS: Record<string, string> = {
  "6E": "#1b4b9e", AI: "#c8102e", SG: "#d03f2f",
  UK: "#5c1c81", QP: "#e87722", IX: "#c8102e",
};

// ─── STEP LABELS ────────────────────────────────────────────

export const STEP_LABELS = [
  "Fare Review",
  "Passengers",
  "Seat Selection",
  "Extras",
  "Review",
  "Payment",
  "Confirmation",
];

// ─── FIELD LABEL ────────────────────────────────────────────

export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

// ─── TEXT INPUT ─────────────────────────────────────────────

export function TextInput({ value, onChange, placeholder, type = "text", className = "", disabled = false }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; className?: string; disabled?: boolean;
}) {
  return (
    <input
      type={type} value={value} disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800
        placeholder-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100
        transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400 ${className}`}
    />
  );
}

// ─── SELECT INPUT ────────────────────────────────────────────

export function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800
        focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
    >
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ─── SECTION HEADING ─────────────────────────────────────────

export function SectionHeading({ step, title, desc, accent = "blue" }: {
  step?: string; title: string; desc?: string; accent?: "blue" | "violet" | "emerald" | "amber";
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-600 text-white",
    violet: "bg-violet-600 text-white",
    emerald: "bg-emerald-600 text-white",
    amber: "bg-amber-500 text-white",
  };
  return (
    <div className="flex items-start gap-4 mb-6">
      {step && (
        <div className={`w-9 h-9 rounded-2xl ${colors[accent]} font-black text-sm flex items-center justify-center shrink-0 shadow-md`}>
          {step}
        </div>
      )}
      <div>
        <h2 className="text-lg font-black text-slate-900 tracking-tight">{title}</h2>
        {desc && <p className="text-sm text-slate-500 mt-0.5 leading-relaxed">{desc}</p>}
      </div>
    </div>
  );
}

// ─── ERROR BANNER ────────────────────────────────────────────

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-4 flex items-start gap-3">
      <span className="text-lg shrink-0">⚠️</span>
      <p className="text-sm text-red-700 font-medium">{message}</p>
    </div>
  );
}

// ─── SEAT PRICE HELPER ───────────────────────────────────────
//
// Sums seat-upgrade charges across all passengers and legs.
// Each passenger may have:
//   - selectedSeat  (string)              → single leg
//   - selectedSeats (Record<number, str>) → one entry per leg
//
// The SeatMap.prices map drives the charge; if a seat code isn't
// in prices it is a free (standard) seat and contributes 0.

export function calcSeatTotal(
  passengers: PassengerData[],
  seatMaps: Record<number, SeatMap>,   // legIndex → SeatMap
): number {
  let total = 0;

  for (const pax of passengers) {
    // Multi-leg path
    if (pax.selectedSeats) {
      for (const [legIdxStr, seat] of Object.entries(pax.selectedSeats)) {
        const legIdx = Number(legIdxStr);
        const map = seatMaps[legIdx];
        if (map && seat) total += map.prices[seat] ?? 0;
      }
    }
    // Single-leg path (fallback)
    else if (pax.selectedSeat) {
      const map = seatMaps[0];
      if (map) total += map.prices[pax.selectedSeat] ?? 0;
    }
  }

  return total;
}

// ─── FARE CALCULATION ────────────────────────────────────────
//
// FIX 1 — seat prices now included via seatMaps + passengers.
// FIX 2 — taxes only applied when the fare does NOT already
//          include them (tier.taxesIncluded === false).
//          If the FareTier type does not expose taxesIncluded,
//          add it: `taxesIncluded?: boolean` (defaults to false
//          = taxes NOT included, which is the safe/conservative
//          assumption so no one is silently under-charged).

export function calcFares({
  tier, returnTier, multiCityLegs, adults, children, infants, extras,
  passengers, seatMaps,
}: {
  tier: FareTier;
  returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  adults: number; children: number; infants: number;
  extras: ExtraSelection[];
  // Optional: pass these in from the booking state to get seat totals.
  passengers?: PassengerData[];
  seatMaps?: Record<number, SeatMap>;
}) {  // Use API per-pax fares if available, else fall back to price * ratio
  const adultUnit  = tier.adultFare  ?? tier.price;
  const childUnit  = tier.childFare  ?? Math.round(tier.price * 0.75);
  const infantUnit = tier.infantFare ?? Math.round(tier.price * 0.1);

  const baseFares = {
    adult:  adultUnit  * adults,
    child:  childUnit  * children,
    infant: infantUnit * infants,
    return: returnTier
      ? ((returnTier.adultFare ?? returnTier.price) * adults
        + (returnTier.childFare ?? Math.round(returnTier.price * 0.75)) * children
        + (returnTier.infantFare ?? Math.round(returnTier.price * 0.1)) * infants)
      : 0,
    multiCity: (multiCityLegs ?? []).slice(1).reduce((sum, leg) =>
      sum
      + (leg.tier.adultFare  ?? leg.tier.price) * adults
      + (leg.tier.childFare  ?? Math.round(leg.tier.price * 0.75)) * children
      + (leg.tier.infantFare ?? Math.round(leg.tier.price * 0.1))  * infants,
      0,
    ),
  };

  const subtotal = Object.values(baseFares).reduce((a, b) => a + b, 0);
  const extrasTotal = extras.reduce((sum, e) => sum + e.mealPrice + e.baggagePrice, 0);

  // Seat charges: prefer API value (TotalSeatCharges), then UI-computed
  const seatsTotal = (passengers && seatMaps)
    ? calcSeatTotal(passengers, seatMaps)
    : (tier.seatCharges ?? 0);

  // TBO OfferedFare is ALWAYS tax-inclusive — never add 5% manually
  const taxes = 0;
  const taxesIncluded = true;

  return { baseFares, subtotal, extrasTotal, seatsTotal, taxes, taxesIncluded };
}

// ─── PRICE SIDEBAR ───────────────────────────────────────────

export function PriceSidebar({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  adults, children, infants, discount, extras,
  passengers, seatMaps,
  currentStep,
}: {
  flight: DisplayFlight; tier: FareTier;
  returnFlight?: DisplayFlight; returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  adults: number; children: number; infants: number;
  discount: number; extras: ExtraSelection[];
  // FIX 1: pass through so seat charges appear
  passengers?: PassengerData[];
  seatMaps?: Record<number, SeatMap>;
  currentStep: number;
}) {
  const { baseFares, subtotal, extrasTotal, seatsTotal, taxes, taxesIncluded } =
    calcFares({
      tier, returnTier, multiCityLegs,
      adults, children, infants,
      extras, passengers, seatMaps,
    });

  const total = Math.round(subtotal + extrasTotal + seatsTotal + taxes - discount);

  const isRoundTrip  = !!returnFlight && !!returnTier;
  const isMultiCity  = !!(multiCityLegs && multiCityLegs.length > 1);
  const travellers   = adults + children + infants;

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-700 p-5 text-white">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Price Summary</div>
        <div className="font-black text-2xl">{formatINR(total)}</div>
        <div className="text-xs text-slate-400 mt-0.5">
          {travellers} traveller{travellers !== 1 ? "s" : ""} · {taxesIncluded ? "all-inclusive" : "incl. taxes"}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Route pills */}
        <div className="space-y-2">
          <FlightRoutePill
            flight={flight}
            label={isRoundTrip ? "Outbound" : isMultiCity ? "Leg 1" : undefined}
            color={AIRLINE_COLORS[flight.airlineCode] ?? "#64748b"}
          />
          {isRoundTrip && returnFlight && (
            <FlightRoutePill flight={returnFlight} label="Return" color={AIRLINE_COLORS[returnFlight.airlineCode] ?? "#64748b"} />
          )}
          {isMultiCity && multiCityLegs!.slice(1).map((leg, i) => (
            <FlightRoutePill key={i} flight={leg.flight} label={`Leg ${i + 2}`} color={AIRLINE_COLORS[leg.flight.airlineCode] ?? "#64748b"} />
          ))}
        </div>

        {/* Line items */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
          {adults    > 0 && <LineItem label={`${adults} Adult${adults > 1 ? "s" : ""}`}             value={baseFares.adult} />}
          {children  > 0 && <LineItem label={`${children} Child${children > 1 ? "ren" : ""}`}       value={baseFares.child} />}
          {infants   > 0 && <LineItem label={`${infants} Infant${infants > 1 ? "s" : ""}`}          value={baseFares.infant} />}
          {baseFares.return    > 0 && <LineItem label="Return fare"       value={baseFares.return} />}
          {baseFares.multiCity > 0 && <LineItem label="Multi-city fares"  value={baseFares.multiCity} />}

          {/* FIX 1: Seat upgrade charge — only shown when non-zero */}
          {seatsTotal > 0 && (
            <LineItem label="Seat upgrades" value={seatsTotal} accent="blue" />
          )}

          {extrasTotal > 0 && (
            <LineItem label="Meals & baggage" value={extrasTotal} accent="violet" />
          )}

          {/* FIX 2: Taxes line — hidden entirely when fare already includes them */}
          {!taxesIncluded && taxes > 0 && (
            <LineItem label="Taxes & fees (5%)" value={taxes} />
          )}
          {taxesIncluded && (
            <div className="flex justify-between items-center text-emerald-600">
              <span className="text-slate-400">Taxes & fees</span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <span className="text-[9px] bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5 font-black uppercase tracking-wide">Included</span>
              </span>
            </div>
          )}

          {discount > 0 && (
            <LineItem label="Promo discount" value={-discount} accent="emerald" />
          )}
        </div>

        {/* Subtotal before discount */}
        <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between items-center text-xs text-slate-400">
          <span>Subtotal</span>
          <span>{formatINR(subtotal + extrasTotal + seatsTotal + taxes)}</span>
        </div>

        {/* Total */}
        <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
          <span className="font-black text-slate-900 text-sm">Total payable</span>
          <span className="font-black text-blue-600 text-lg">{formatINR(total)}</span>
        </div>

        {/* Baggage included */}
        <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Included in fare</div>
          <div className="text-xs text-slate-600 flex items-center gap-1.5"><span>🎒</span> Cabin: {tier.cabinBag}</div>
          <div className="text-xs text-slate-600 flex items-center gap-1.5"><span>🧳</span> Check-in: {tier.checkinBag}</div>
        </div>

        {/* Step progress mini */}
        <div className="space-y-1">
          {STEP_LABELS.slice(0, 6).map((label, i) => (
            <div key={label} className={`flex items-center gap-2 text-[10px] font-semibold ${
              i + 1 < currentStep  ? "text-emerald-600"
              : i + 1 === currentStep ? "text-blue-600"
              : "text-slate-300"
            }`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                i + 1 < currentStep  ? "bg-emerald-100"
                : i + 1 === currentStep ? "bg-blue-100"
                : "bg-slate-100"
              }`}>
                {i + 1 < currentStep ? "✓" : i + 1}
              </div>
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FlightRoutePill({ flight, label, color }: { flight: DisplayFlight; label?: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2">
      <div
        className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-black shrink-0"
        style={{ background: color }}
      >
        {flight.airlineCode}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] font-bold text-slate-700 truncate">{flight.fromCode} → {flight.toCode}</div>
        <div className="text-[10px] text-slate-400">{flight.departDate}</div>
      </div>
      {label && <div className="text-[9px] font-black text-slate-400 uppercase">{label}</div>}
    </div>
  );
}

function LineItem({ label, value, accent }: { label: string; value: number; accent?: "blue" | "violet" | "emerald" }) {
  const color =
    accent === "emerald" ? "text-emerald-600"
    : accent === "violet" ? "text-violet-600"
    : accent === "blue"   ? "text-blue-600"
    : "text-slate-700";
  return (
    <div className={`flex justify-between items-center ${color}`}>
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">
        {value < 0 ? `−${formatINR(-value)}` : formatINR(value)}
      </span>
    </div>
  );
}

// ─── BOOKING SHELL LAYOUT ────────────────────────────────────

export function BookingShell({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  adults, childcount, infants, discount, extras,
  passengers, seatMaps,
  currentStep, onBack, children,
}: {
  flight: DisplayFlight; tier: FareTier;
  returnFlight?: DisplayFlight; returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  adults: number; childcount: number; infants: number;
  discount: number; extras: ExtraSelection[];
  // FIX 1: forwarded to PriceSidebar
  passengers?: PassengerData[];
  seatMaps?: Record<number, SeatMap>;
  currentStep: number;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ background: "#f8f7f4", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Top nav */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:block">Back</span>
          </button>

          {/* Step indicators */}
          <div className="flex-1 flex items-center justify-center gap-1 overflow-x-auto scrollbar-none">
            {STEP_LABELS.slice(0, 7).map((label, i) => {
              const stepNum = i + 1;
              const done   = stepNum < currentStep;
              const active = stepNum === currentStep;
              return (
                <div key={label} className="flex items-center gap-1 shrink-0">
                  <div className="flex items-center gap-1">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                      done ? "bg-emerald-500 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}>
                      {done ? "✓" : stepNum}
                    </div>
                    <span className={`hidden md:block text-[10px] font-semibold whitespace-nowrap ${
                      active ? "text-blue-600" : done ? "text-emerald-500" : "text-slate-300"
                    }`}>{label}</span>
                  </div>
                  {i < STEP_LABELS.length - 2 && (
                    <div className={`w-4 h-px mx-0.5 shrink-0 ${done ? "bg-emerald-300" : "bg-slate-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex gap-8 items-start">
        <div className="flex-1 min-w-0">{children}</div>
        <aside className="w-72 shrink-0 hidden lg:block">
          <PriceSidebar
            flight={flight} tier={tier}
            returnFlight={returnFlight} returnTier={returnTier}
            multiCityLegs={multiCityLegs}
            adults={adults} children={childcount} infants={infants}
            discount={discount} extras={extras}
            passengers={passengers}
            seatMaps={seatMaps}
            currentStep={currentStep}
          />
        </aside>
      </div>
    </div>
  );
}