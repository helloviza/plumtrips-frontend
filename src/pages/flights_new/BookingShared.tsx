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
  selectedSeat?: string; // e.g. "14A"
}

export interface SeatMap {
  rows: number;
  cols: string[]; // e.g. ["A","B","C","D","E","F"]
  occupied: string[]; // e.g. ["3A","7F"]
  premium: string[]; // window/extra legroom
  prices: Record<string, number>;
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

// ─── FARE CALCULATION ────────────────────────────────────────

export function calcFares({
  tier, returnTier, multiCityLegs, adults, children, infants, extras,
}: {
  tier: FareTier;
  returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  adults: number; children: number; infants: number;
  extras: ExtraSelection[];
}) {
  const baseFares = {
    adult: tier.price * adults,
    child: Math.round(tier.price * 0.75 * children),
    infant: Math.round(tier.price * 0.1 * infants),
    return: returnTier ? returnTier.price * adults : 0,
    multiCity: (multiCityLegs ?? []).slice(1).reduce((sum, leg) =>
      sum + leg.tier.price * adults + Math.round(leg.tier.price * 0.75 * children) + Math.round(leg.tier.price * 0.1 * infants), 0),
  };
  const subtotal = Object.values(baseFares).reduce((a, b) => a + b, 0);
  const extrasTotal = extras.reduce((sum, e) => sum + e.mealPrice + e.baggagePrice, 0);
  const taxes = Math.round(subtotal * 0.05);
  return { baseFares, subtotal, extrasTotal, taxes };
}

// ─── PRICE SIDEBAR ───────────────────────────────────────────

export function PriceSidebar({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  adults, children, infants, discount, extras,
  currentStep,
}: {
  flight: DisplayFlight; tier: FareTier;
  returnFlight?: DisplayFlight; returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  adults: number; children: number; infants: number;
  discount: number; extras: ExtraSelection[];
  currentStep: number;
}) {
  const { baseFares, subtotal, extrasTotal, taxes } = calcFares({
    tier, returnTier, multiCityLegs, adults, children, infants, extras,
  });
  const total = Math.round(subtotal + extrasTotal + taxes - discount);

  const isRoundTrip = !!returnFlight && !!returnTier;
  const isMultiCity = !!(multiCityLegs && multiCityLegs.length > 1);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-700 p-5 text-white">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Price Summary</div>
        <div className="font-black text-2xl">{formatINR(total)}</div>
        <div className="text-xs text-slate-400 mt-0.5">
          {adults + children + infants} traveller{adults + children + infants !== 1 ? "s" : ""} · incl. taxes
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Route pills */}
        <div className="space-y-2">
          <FlightRoutePill flight={flight} label={isRoundTrip ? "Outbound" : isMultiCity ? "Leg 1" : undefined} color={AIRLINE_COLORS[flight.airlineCode] ?? "#64748b"} />
          {isRoundTrip && returnFlight && <FlightRoutePill flight={returnFlight} label="Return" color={AIRLINE_COLORS[returnFlight.airlineCode] ?? "#64748b"} />}
          {isMultiCity && multiCityLegs!.slice(1).map((leg, i) => (
            <FlightRoutePill key={i} flight={leg.flight} label={`Leg ${i + 2}`} color={AIRLINE_COLORS[leg.flight.airlineCode] ?? "#64748b"} />
          ))}
        </div>

        {/* Line items */}
        <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
          {adults > 0 && <LineItem label={`${adults} Adult${adults > 1 ? "s" : ""}`} value={baseFares.adult} />}
          {children > 0 && <LineItem label={`${children} Child${children > 1 ? "ren" : ""}`} value={baseFares.child} />}
          {infants > 0 && <LineItem label={`${infants} Infant${infants > 1 ? "s" : ""}`} value={baseFares.infant} />}
          {baseFares.return > 0 && <LineItem label="Return Fare" value={baseFares.return} />}
          {baseFares.multiCity > 0 && <LineItem label="Multi-City Fares" value={baseFares.multiCity} />}
          <LineItem label="Taxes & Fees (5%)" value={taxes} />
          {extrasTotal > 0 && <LineItem label="Meals & Baggage" value={extrasTotal} accent="violet" />}
          {discount > 0 && <LineItem label="Promo Discount" value={-discount} accent="emerald" />}
        </div>

        {/* Total */}
        <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
          <span className="font-black text-slate-900 text-sm">Total Payable</span>
          <span className="font-black text-blue-600 text-lg">{formatINR(total)}</span>
        </div>

        {/* Baggage included */}
        <div className="bg-slate-50 rounded-2xl p-3 space-y-1.5">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Included in Fare</div>
          <div className="text-xs text-slate-600 flex items-center gap-1.5"><span>🎒</span> Cabin: {tier.cabinBag}</div>
          <div className="text-xs text-slate-600 flex items-center gap-1.5"><span>🧳</span> Check-in: {tier.checkinBag}</div>
        </div>

        {/* Step progress mini */}
        <div className="space-y-1">
          {STEP_LABELS.slice(0, 6).map((label, i) => (
            <div key={label} className={`flex items-center gap-2 text-[10px] font-semibold ${
              i + 1 < currentStep ? "text-emerald-600" : i + 1 === currentStep ? "text-blue-600" : "text-slate-300"
            }`}>
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                i + 1 < currentStep ? "bg-emerald-100" : i + 1 === currentStep ? "bg-blue-100" : "bg-slate-100"
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
      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[9px] font-black shrink-0" style={{ background: color }}>
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

function LineItem({ label, value, accent }: { label: string; value: number; accent?: "violet" | "emerald" }) {
  const color = accent === "emerald" ? "text-emerald-600" : accent === "violet" ? "text-violet-600" : "text-slate-700";
  return (
    <div className={`flex justify-between items-center ${color}`}>
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{value < 0 ? `−${formatINR(-value)}` : formatINR(value)}</span>
    </div>
  );
}

// ─── BOOKING SHELL LAYOUT ────────────────────────────────────

export function BookingShell({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  adults, childcount, infants, discount, extras,
  currentStep, onBack, children,
}: {
  flight: DisplayFlight; tier: FareTier;
  returnFlight?: DisplayFlight; returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  adults: number; childcount: number; infants: number;
  discount: number; extras: ExtraSelection[];
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
              const done = stepNum < currentStep;
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

          {/* Logo */}
          {/* <div className="font-black text-slate-900 text-sm tracking-tight hidden sm:block">
            Plum<span className="text-blue-600">Trips</span>
          </div> */}
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
            currentStep={currentStep}
          />
        </aside>
      </div>
    </div>
  );
}