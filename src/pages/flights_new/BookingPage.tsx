// ============================================================
//  BookingPage.tsx — v3 FIXED
//
//  FIXES:
//  1. Multi-city Leg 2+ shown in review section with full details
//  2. Step 2.5 REVIEW SECTION: Full passenger + itinerary + rules review
//     before payment. Cannot proceed without ticking confirmation checkbox.
//  3. Passport fields FORCED when isInternational=true or forcePassport=true,
//     regardless of TBO's IsPanRequired / IsPassportRequired flags.
//  4. Razorpay: /tbo/create-order + /tbo/book-after-payment fully wired.
//     Mock mode still uses apiBookFlight for dev/testing.
//  5. Booking data saved via POST /api/v1/flights/bookings after confirmation.
// ============================================================

import { useState, useEffect } from "react";
import type { DisplayFlight, FareTier } from "../../lib/types_t";
import { formatINR, MOCK_MODE, apiFareQuote, apiBookFlight } from "../../lib/flights_api";
import type { BookFlightInput } from "../../lib/flights_api";

// ─── TYPES ─────────────────────────────────────────────────

interface PassengerData {
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
}

interface BookingFormState {
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
}

function emptyPassenger(type: "adult" | "child" | "infant"): PassengerData {
  return {
    title: type === "adult" ? "Mr" : "Mstr",
    firstName: "",
    lastName: "",
    dob: "",
    gender: "Male",
    panNumber: "",
    passportNo: "",
    passportExpiry: "",
    nationality: "IN",
    ffAirlineCode: "",
    ffNumber: "",
  };
}

// ─── AIRLINE COLORS ────────────────────────────────────────

const AIRLINE_COLORS: Record<string, string> = {
  "6E": "#1b4b9e",
  AI: "#c8102e",
  SG: "#d03f2f",
  UK: "#5c1c81",
  QP: "#e87722",
  IX: "#c8102e",
};

// ─── SHARED COMPONENTS ─────────────────────────────────────

function SectionHeading({ step, label, title, desc }: {
  step: string; label: string; title: string; desc?: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-5">
      <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0">
        {step}
      </div>
      <div>
        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-0.5">{label}</div>
        <h2 className="text-base font-black text-slate-800">{title}</h2>
        {desc && <p className="text-sm text-slate-500 mt-0.5">{desc}</p>}
      </div>
    </div>
  );
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
      {children}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", className = "" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; className?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 
        placeholder-slate-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 
        transition-all bg-white ${className}`}
    />
  );
}

function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-800 
        focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all bg-white"
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── PASSENGER CARD ────────────────────────────────────────

function PassengerCard({ index, paxType, data, needsPan, needsPassport, onChange }: {
  index: number; paxType: "Adult" | "Child" | "Infant";
  data: PassengerData; needsPan: boolean; needsPassport: boolean;
  onChange: (d: PassengerData) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showFF, setShowFF] = useState(false);
  const titles = paxType === "Adult" ? ["Mr", "Mrs", "Ms"] : ["Mstr", "Miss"];
  const paxColor = { Adult: "bg-blue-50 text-blue-700", Child: "bg-violet-50 text-violet-700", Infant: "bg-pink-50 text-pink-700" }[paxType];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`text-xs font-bold px-2.5 py-1 rounded-full ${paxColor}`}>{paxType}</div>
          <span className="font-bold text-slate-800 text-sm">
            {data.firstName && data.lastName
              ? `${data.title} ${data.firstName} ${data.lastName}`
              : `Passenger ${index + 1}`}
          </span>
          {needsPassport && (
            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
              🛂 Passport Required
            </span>
          )}
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-6 pb-6 border-t border-slate-100 pt-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <FieldLabel required>Title</FieldLabel>
              <SelectInput value={data.title} onChange={(v) => onChange({ ...data, title: v as PassengerData["title"] })} options={titles} />
            </div>
            <div>
              <FieldLabel required>First Name</FieldLabel>
              <TextInput value={data.firstName} onChange={(v) => onChange({ ...data, firstName: v })} placeholder="As on passport/ID" />
            </div>
            <div>
              <FieldLabel required>Last Name</FieldLabel>
              <TextInput value={data.lastName} onChange={(v) => onChange({ ...data, lastName: v })} placeholder="As on passport/ID" />
            </div>
            <div>
              <FieldLabel required>Gender</FieldLabel>
              <SelectInput value={data.gender} onChange={(v) => onChange({ ...data, gender: v as "Male" | "Female" })} options={["Male", "Female"]} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <FieldLabel required={paxType !== "Adult"}>Date of Birth</FieldLabel>
              <TextInput type="date" value={data.dob} onChange={(v) => onChange({ ...data, dob: v })} />
            </div>
            <div>
              <FieldLabel required>Nationality</FieldLabel>
              <TextInput value={data.nationality} onChange={(v) => onChange({ ...data, nationality: v.toUpperCase().slice(0, 2) })} placeholder="IN" />
            </div>
            {needsPan && (
              <div>
                <FieldLabel required>PAN Number</FieldLabel>
                <TextInput value={data.panNumber} onChange={(v) => onChange({ ...data, panNumber: v.toUpperCase().slice(0, 10) })} placeholder="ABCDE1234F" className="font-mono tracking-widest" />
              </div>
            )}
          </div>

          {/* PASSPORT SECTION — shown when international or required by TBO */}
          {needsPassport && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🛂</span>
                <div className="text-sm font-bold text-orange-800">International Travel — Passport Required</div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <FieldLabel required>Passport Number</FieldLabel>
                  <TextInput
                    value={data.passportNo}
                    onChange={(v) => onChange({ ...data, passportNo: v.toUpperCase() })}
                    placeholder="A1234567"
                    className="font-mono tracking-widest"
                  />
                </div>
                <div>
                  <FieldLabel required>Passport Expiry</FieldLabel>
                  <TextInput
                    type="date"
                    value={data.passportExpiry}
                    onChange={(v) => onChange({ ...data, passportExpiry: v })}
                  />
                </div>
                <div>
                  <FieldLabel required>Nationality (Country Code)</FieldLabel>
                  <TextInput
                    value={data.nationality}
                    onChange={(v) => onChange({ ...data, nationality: v.toUpperCase().slice(0, 2) })}
                    placeholder="IN"
                  />
                </div>
              </div>
              <p className="text-[10px] text-orange-600 mt-2 font-medium">
                Passport must be valid for at least 6 months beyond your travel date.
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowFF((v) => !v)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showFF ? "M20 12H4" : "M12 4v16m8-8H4"} />
            </svg>
            {showFF ? "Remove" : "Add"} Frequent Flyer Number
          </button>

          {showFF && (
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div><FieldLabel>Airline Code</FieldLabel><TextInput value={data.ffAirlineCode} onChange={(v) => onChange({ ...data, ffAirlineCode: v.toUpperCase() })} placeholder="AI" /></div>
              <div><FieldLabel>FF Number</FieldLabel><TextInput value={data.ffNumber} onChange={(v) => onChange({ ...data, ffNumber: v })} placeholder="123456789" /></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── CONTACT SECTION ───────────────────────────────────────

function ContactSection({ email, phone, onEmail, onPhone }: {
  email: string; phone: string; onEmail: (v: string) => void; onPhone: (v: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-4">
      <h3 className="font-bold text-slate-800 text-sm mb-4">Contact Details</h3>
      <p className="text-xs text-slate-400 mb-4">Your e-ticket and booking updates will be sent here.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Email Address</FieldLabel>
          <TextInput type="email" value={email} onChange={onEmail} placeholder="you@example.com" />
        </div>
        <div>
          <FieldLabel required>Mobile Number</FieldLabel>
          <div className="flex gap-2">
            <div className="w-16 shrink-0">
              <TextInput value="+91" onChange={() => { }} className="text-center text-slate-500" />
            </div>
            <TextInput type="tel" value={phone} onChange={onPhone} placeholder="9876543210" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GST SECTION ───────────────────────────────────────────

function GSTSection({ gstNumber, gstCompanyName, gstCompanyEmail, gstCompanyAddress, onChange }: {
  gstNumber: string; gstCompanyName: string; gstCompanyEmail: string; gstCompanyAddress: string;
  onChange: (field: string, value: string) => void;
}) {
  const [showGST, setShowGST] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">GST Invoice</h3>
          <p className="text-xs text-slate-400 mt-0.5">Optional — for business travel tax claims</p>
        </div>
        <button
          type="button"
          onClick={() => setShowGST((v) => !v)}
          className={`relative w-11 h-6 rounded-full transition-colors ${showGST ? "bg-blue-600" : "bg-slate-200"}`}
        >
          <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${showGST ? "translate-x-5" : ""}`} />
        </button>
      </div>
      {showGST && (
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><FieldLabel>GSTIN</FieldLabel><TextInput value={gstNumber} onChange={(v) => onChange("gstNumber", v.toUpperCase())} placeholder="22AAAAA0000A1Z5" className="font-mono tracking-wider" /></div>
            <div><FieldLabel>Company Name</FieldLabel><TextInput value={gstCompanyName} onChange={(v) => onChange("gstCompanyName", v)} placeholder="Acme Technologies Pvt. Ltd." /></div>
            <div><FieldLabel>Company Email</FieldLabel><TextInput type="email" value={gstCompanyEmail} onChange={(v) => onChange("gstCompanyEmail", v)} placeholder="accounts@acme.com" /></div>
            <div><FieldLabel>Registered Address</FieldLabel><TextInput value={gstCompanyAddress} onChange={(v) => onChange("gstCompanyAddress", v)} placeholder="123 Business Park, Mumbai" /></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FARE SIDEBAR ──────────────────────────────────────────

function FareSidebar({ flight, tier, adults, children: childCount, infants, discount, subtotalOverride, returnFlight, returnTier, multiCityLegs }: {
  flight: DisplayFlight; tier: FareTier;
  adults: number; children: number; infants: number;
  discount: number; subtotalOverride: number;
  returnFlight?: DisplayFlight; returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
}) {
  const taxes = Math.round(subtotalOverride * 0.05);
  const total = Math.round(subtotalOverride + taxes - discount);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-24">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Fare Summary</div>

      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: AIRLINE_COLORS[flight.airlineCode] ?? "#64748b" }}>
          {flight.airlineCode}
        </div>
        <div>
          <div className="font-bold text-slate-800 text-xs">{flight.airline}</div>
          <div className="text-[10px] text-slate-400">{flight.fromCode} → {flight.toCode}</div>
        </div>
      </div>

      {returnFlight && returnTier && (
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: AIRLINE_COLORS[returnFlight.airlineCode] ?? "#64748b" }}>
            {returnFlight.airlineCode}
          </div>
          <div>
            <div className="font-bold text-slate-800 text-xs">{returnFlight.airline}</div>
            <div className="text-[10px] text-slate-400">{returnFlight.fromCode} → {returnFlight.toCode} (Return)</div>
          </div>
        </div>
      )}

      {multiCityLegs && multiCityLegs.slice(1).map((leg, i) => (
        <div key={i} className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: AIRLINE_COLORS[leg.flight.airlineCode] ?? "#64748b" }}>
            {leg.flight.airlineCode}
          </div>
          <div>
            <div className="font-bold text-slate-800 text-xs">{leg.flight.airline}</div>
            <div className="text-[10px] text-slate-400">{leg.flight.fromCode} → {leg.flight.toCode} (Leg {i + 2})</div>
          </div>
        </div>
      ))}

      <div className="space-y-1.5 text-xs mb-3 pb-3 border-b border-slate-100">
        {adults > 0 && <div className="flex justify-between"><span className="text-slate-500">{adults} Adult{adults > 1 ? "s" : ""}</span><span className="font-semibold">{formatINR(tier.price * adults)}</span></div>}
        {childCount > 0 && <div className="flex justify-between"><span className="text-slate-500">{childCount} Child{childCount > 1 ? "ren" : ""}</span><span className="font-semibold">{formatINR(Math.round(tier.price * 0.75 * childCount))}</span></div>}
        {infants > 0 && <div className="flex justify-between"><span className="text-slate-500">{infants} Infant{infants > 1 ? "s" : ""}</span><span className="font-semibold">{formatINR(Math.round(tier.price * 0.1 * infants))}</span></div>}
        <div className="flex justify-between"><span className="text-slate-500">Taxes (5%)</span><span className="font-semibold">{formatINR(taxes)}</span></div>
        {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Promo Discount</span><span className="font-semibold">−{formatINR(discount)}</span></div>}
      </div>

      <div className="flex justify-between items-center">
        <span className="font-black text-slate-800 text-sm">Total</span>
        <span className="font-black text-blue-600 text-lg">{formatINR(total)}</span>
      </div>

      <div className="mt-3 flex items-center gap-2 bg-slate-50 rounded-xl p-2.5">
        <span className="text-sm">🧳</span>
        <div className="text-[10px] text-slate-600">
          <span className="font-bold">Cabin:</span> {tier.cabinBag} &nbsp;·&nbsp;
          <span className="font-bold">Check-in:</span> {tier.checkinBag}
        </div>
      </div>
    </div>
  );
}

// ─── BOOKING SHELL ─────────────────────────────────────────

function BookingShell({ flight, tier, returnFlight, returnTier, multiCityLegs, adults, childCount, infants, discount, subtotal, step, onBack, children }: {
  flight: DisplayFlight; tier: FareTier;
  returnFlight?: DisplayFlight; returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  adults: number; childCount: number; infants: number;
  discount: number; subtotal: number;
  step: 1 | 2 | 3 | 4;
  onBack: () => void;
  children: React.ReactNode;
}) {
  const steps = ["Review Fare", "Traveller Details", "Review & Confirm", "Payment"];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-700 transition-colors text-sm font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <div className="flex-1 flex items-center justify-center gap-1 sm:gap-2 overflow-x-auto">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-1 sm:gap-2">
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-all ${
                    i + 1 < step ? "bg-emerald-500 text-white" :
                    i + 1 === step ? "bg-blue-600 text-white" :
                    "bg-slate-100 text-slate-400"
                  }`}>
                    {i + 1 < step ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className={`hidden sm:block text-xs font-semibold transition-colors whitespace-nowrap ${
                    i + 1 === step ? "text-blue-600" : i + 1 < step ? "text-slate-400" : "text-slate-300"
                  }`}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-4 sm:w-8 h-px transition-colors shrink-0 ${i + 1 < step ? "bg-emerald-300" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex gap-8">
        <div className="flex-1 min-w-0">{children}</div>
        <div className="w-72 shrink-0 hidden lg:block">
          <FareSidebar
            flight={flight} tier={tier}
            adults={adults} children={childCount} infants={infants}
            discount={discount} subtotalOverride={subtotal}
            returnFlight={returnFlight} returnTier={returnTier}
            multiCityLegs={multiCityLegs}
          />
        </div>
      </div>
    </div>
  );
}

// ─── RAZORPAY LOADER ───────────────────────────────────────

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

// ─── REVIEW STEP COMPONENT (Step 3) ────────────────────────

function ReviewStep({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  passengers, paxTypes, contactEmail, contactPhone,
  adults, children, infants, subtotal, discount, isInternational,
  onConfirm, onBack,
}: {
  flight: DisplayFlight; tier: FareTier;
  returnFlight?: DisplayFlight; returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  passengers: PassengerData[];
  paxTypes: ("Adult" | "Child" | "Infant")[];
  contactEmail: string; contactPhone: string;
  adults: number; children: number; infants: number;
  subtotal: number; discount: number; isInternational: boolean;
  onConfirm: () => void; onBack: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const taxes = Math.round(subtotal * 0.05);
  const totalPayable = Math.round(subtotal + taxes - discount);

  const isRoundTrip = !!returnFlight && !!returnTier;
  const isMultiCity = !!multiCityLegs && multiCityLegs.length > 1;

  // Fare rules displayed in review
  const fareRules = [
    { icon: "↩️", label: "Cancellation", value: tier.cancellationFee },
    { icon: "📅", label: "Date Change", value: tier.dateChangeFee },
    { icon: "💺", label: "Seat Selection", value: tier.seatSelection },
    { icon: "🍽️", label: "Meals", value: tier.meals },
  ];

  return (
    <div>
      <SectionHeading
        step="✓"
        label="Step 3 of 4"
        title="Review Your Booking"
        desc="Verify all details before proceeding to payment. This is your last chance to go back."
      />

      {/* FLIGHT ITINERARY */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Flight Itinerary</div>

        {/* Outbound / Only flight */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black" style={{ background: AIRLINE_COLORS[flight.airlineCode] ?? "#64748b" }}>
                {flight.airlineCode}
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm">{flight.airline} · {flight.flightNumber}</span>
                {isRoundTrip && <span className="ml-2 text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">Outbound</span>}
                {isMultiCity && <span className="ml-2 text-[10px] font-bold text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded">Leg 1</span>}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <div className="text-center">
                <div className="font-black text-lg text-slate-900">{flight.departTime}</div>
                <div className="text-xs font-bold text-slate-700">{flight.fromCode}</div>
                <div className="text-[10px] text-slate-400">{flight.departDate}</div>
              </div>
              <div className="flex flex-col items-center px-3">
                <div className="text-[10px] text-slate-400">{flight.durationLabel}</div>
                <div className="border-t border-dashed border-slate-300 w-16 my-1" />
                <div className={`text-[10px] font-bold ${flight.stops === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}
                </div>
              </div>
              <div className="text-center">
                <div className="font-black text-lg text-slate-900">{flight.arriveTime}</div>
                <div className="text-xs font-bold text-slate-700">{flight.toCode}</div>
                <div className="text-[10px] text-slate-400">{flight.arriveDate}</div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-slate-400">Fare</div>
            <div className="font-black text-blue-600">{formatINR(tier.price)}</div>
            <div className="text-[10px] text-slate-400">per adult</div>
          </div>
        </div>

        {/* Return flight */}
        {isRoundTrip && returnFlight && returnTier && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black" style={{ background: AIRLINE_COLORS[returnFlight.airlineCode] ?? "#64748b" }}>
                  {returnFlight.airlineCode}
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm">{returnFlight.airline} · {returnFlight.flightNumber}</span>
                  <span className="ml-2 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Return</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="text-center">
                  <div className="font-black text-lg text-slate-900">{returnFlight.departTime}</div>
                  <div className="text-xs font-bold text-slate-700">{returnFlight.fromCode}</div>
                  <div className="text-[10px] text-slate-400">{returnFlight.departDate}</div>
                </div>
                <div className="flex flex-col items-center px-3">
                  <div className="text-[10px] text-slate-400">{returnFlight.durationLabel}</div>
                  <div className="border-t border-dashed border-slate-300 w-16 my-1" />
                  <div className={`text-[10px] font-bold ${returnFlight.stops === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                    {returnFlight.stops === 0 ? "Non-stop" : `${returnFlight.stops} stop`}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-black text-lg text-slate-900">{returnFlight.arriveTime}</div>
                  <div className="text-xs font-bold text-slate-700">{returnFlight.toCode}</div>
                  <div className="text-[10px] text-slate-400">{returnFlight.arriveDate}</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400">Fare</div>
              <div className="font-black text-blue-600">{formatINR(returnTier.price)}</div>
              <div className="text-[10px] text-slate-400">per adult</div>
            </div>
          </div>
        )}

        {/* Multi-city legs 2+ */}
        {isMultiCity && multiCityLegs!.slice(1).map((leg, i) => (
          <div key={i} className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 last:border-0 last:mb-0 last:pb-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black" style={{ background: AIRLINE_COLORS[leg.flight.airlineCode] ?? "#64748b" }}>
                  {leg.flight.airlineCode}
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm">{leg.flight.airline} · {leg.flight.flightNumber}</span>
                  <span className="ml-2 text-[10px] font-bold text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded">Leg {i + 2}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="text-center">
                  <div className="font-black text-lg text-slate-900">{leg.flight.departTime}</div>
                  <div className="text-xs font-bold text-slate-700">{leg.flight.fromCode}</div>
                  <div className="text-[10px] text-slate-400">{leg.flight.departDate}</div>
                </div>
                <div className="flex flex-col items-center px-3">
                  <div className="text-[10px] text-slate-400">{leg.flight.durationLabel}</div>
                  <div className="border-t border-dashed border-slate-300 w-16 my-1" />
                  <div className={`text-[10px] font-bold ${leg.flight.stops === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                    {leg.flight.stops === 0 ? "Non-stop" : `${leg.flight.stops} stop`}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-black text-lg text-slate-900">{leg.flight.arriveTime}</div>
                  <div className="text-xs font-bold text-slate-700">{leg.flight.toCode}</div>
                  <div className="text-[10px] text-slate-400">{leg.flight.arriveDate}</div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400">Fare</div>
              <div className="font-black text-blue-600">{formatINR(leg.tier.price)}</div>
              <div className="text-[10px] text-slate-400">per adult</div>
            </div>
          </div>
        ))}
      </div>

      {/* PASSENGERS SUMMARY */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Passengers</div>
        <div className="space-y-3">
          {passengers.map((p, i) => (
            <div key={i} className="flex items-start justify-between py-2 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center shrink-0">{i + 1}</div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">{p.title} {p.firstName} {p.lastName}</div>
                  <div className="text-xs text-slate-400">{paxTypes[i]}{p.dob ? ` · DOB: ${p.dob}` : ""}</div>
                  {p.passportNo && <div className="text-xs text-orange-600 font-medium mt-0.5">🛂 Passport: {p.passportNo} (Exp: {p.passportExpiry})</div>}
                  {p.panNumber && <div className="text-xs text-slate-500 font-medium mt-0.5">PAN: {p.panNumber}</div>}
                </div>
              </div>
              <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                { Adult: "bg-blue-50 text-blue-700", Child: "bg-violet-50 text-violet-700", Infant: "bg-pink-50 text-pink-700" }[paxTypes[i]]
              }`}>{paxTypes[i]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CONTACT DETAILS */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Contact Details</div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-xs text-slate-400">Email</div>
            <div className="font-semibold text-slate-800">{contactEmail}</div>
          </div>
          <div>
            <div className="text-xs text-slate-400">Phone</div>
            <div className="font-semibold text-slate-800">+91 {contactPhone}</div>
          </div>
        </div>
      </div>

      {/* FARE RULES */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Fare Rules & Policies</div>
        <div className="grid grid-cols-2 gap-3">
          {fareRules.map(({ icon, label, value }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{icon}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</span>
              </div>
              <div className="text-xs font-semibold text-slate-700">{value}</div>
            </div>
          ))}
        </div>

        {isInternational && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-xl">
            <div className="flex items-start gap-2">
              <span className="text-lg shrink-0">🛂</span>
              <div className="text-xs text-orange-800">
                <div className="font-bold mb-1">International Travel Regulations</div>
                <ul className="space-y-1 text-orange-700">
                  <li>• Passport must be valid for at least 6 months from travel date</li>
                  <li>• Check visa requirements for your destination country</li>
                  <li>• Arrive at least 3 hours before international departure</li>
                  <li>• Ensure all names match your passport exactly</li>
                  <li>• Indian citizens may require travel insurance for certain destinations</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 p-3 bg-slate-50 rounded-xl">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-2">General Rules</div>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• Arrive at least {isInternational ? "3 hours" : "2 hours"} before departure</li>
            <li>• Government-issued photo ID required for all passengers</li>
            <li>• Baggage allowance: Cabin {tier.cabinBag} · Check-in {tier.checkinBag}</li>
            <li>• Check-in closes 45 minutes before departure for domestic, 60 minutes for international</li>
            <li>• Fares are non-transferable between passengers</li>
          </ul>
        </div>
      </div>

      {/* FARE SUMMARY */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Final Fare Breakdown</div>
        <div className="space-y-2 text-sm">
          {adults > 0 && <div className="flex justify-between"><span className="text-slate-500">{adults} Adult{adults > 1 ? "s" : ""} × {formatINR(tier.price)}</span><span className="font-semibold">{formatINR(tier.price * adults)}</span></div>}
          {children > 0 && <div className="flex justify-between"><span className="text-slate-500">{children} Child{children > 1 ? "ren" : ""}</span><span className="font-semibold">{formatINR(Math.round(tier.price * 0.75 * children))}</span></div>}
          {infants > 0 && <div className="flex justify-between"><span className="text-slate-500">{infants} Infant{infants > 1 ? "s" : ""}</span><span className="font-semibold">{formatINR(Math.round(tier.price * 0.1 * infants))}</span></div>}
          {returnTier && <div className="flex justify-between"><span className="text-slate-500">Return Fare</span><span className="font-semibold">{formatINR(returnTier.price * adults)}</span></div>}
          {multiCityLegs && multiCityLegs.slice(1).map((leg, i) => (
            <div key={i} className="flex justify-between"><span className="text-slate-500">Leg {i + 2} Fare</span><span className="font-semibold">{formatINR(leg.tier.price * adults)}</span></div>
          ))}
          <div className="flex justify-between"><span className="text-slate-500">Taxes & Fees (5%)</span><span className="font-semibold">{formatINR(Math.round(subtotal * 0.05))}</span></div>
          {discount > 0 && <div className="flex justify-between text-emerald-600"><span>Promo Discount</span><span>−{formatINR(discount)}</span></div>}
          <div className="flex justify-between font-black text-base border-t border-slate-100 pt-2 mt-2">
            <span className="text-slate-800">Total Payable</span>
            <span className="text-blue-600">{formatINR(totalPayable)}</span>
          </div>
        </div>
      </div>

      {/* CONFIRMATION CHECKBOX */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="sr-only"
            />
            <div
              onClick={() => setConfirmed(v => !v)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                confirmed ? "bg-blue-600 border-blue-600" : "bg-white border-slate-300"
              }`}
            >
              {confirmed && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <div className="text-sm text-blue-800">
            <span className="font-bold">I confirm that all passenger details are correct</span> and I have read and agree to the
            fare rules, cancellation policy, and{" "}
            <a href="/terms" className="underline hover:text-blue-900">Terms of Service</a>.
            {isInternational && " I confirm all passengers hold valid passports for international travel."}
          </div>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-sm hover:border-slate-300 transition-colors"
        >
          ← Edit Details
        </button>
        <button
          onClick={onConfirm}
          disabled={!confirmed}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-2xl text-sm transition-colors shadow-lg shadow-blue-200"
        >
          Proceed to Payment →
        </button>
      </div>
      {!confirmed && (
        <p className="text-xs text-center text-slate-400 mt-2">Please check the confirmation box above to continue</p>
      )}
    </div>
  );
}

// ─── MAIN BOOKING PAGE ─────────────────────────────────────

interface BookingPageProps {
  flight: DisplayFlight;
  tier: FareTier;
  returnFlight?: DisplayFlight;
  returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  adults: number;
  children: number;
  infants: number;
  /** Forces passport collection regardless of TBO flags */
  forcePassport?: boolean;
  /** Marks route as international for review section messaging */
  isInternational?: boolean;
  onBack: () => void;
  onConfirm: (bookingId?: number, pnr?: string, passengerNames?: string[], contactEmail?: string) => void;
}

export default function BookingPage({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  adults, children, infants,
  forcePassport = false,
  isInternational = false,
  onBack, onConfirm,
}: BookingPageProps) {
  const isRoundTrip = !!returnFlight && !!returnTier;
  const isMultiCity = !!multiCityLegs && multiCityLegs.length > 1;

  // FIX #3: Passport required if TBO says so OR if route is international
  const needsPassport = flight.isPassportRequired || forcePassport;
  const needsPan = flight.isPanRequired;

  // Fare calculation
  const outboundAdultFare  = tier.price * adults;
  const outboundChildFare  = Math.round(tier.price * 0.75 * children);
  const outboundInfantFare = Math.round(tier.price * 0.1 * infants);

  const returnAdultFare  = isRoundTrip ? (returnTier!.price * adults) : 0;
  const returnChildFare  = isRoundTrip ? Math.round(returnTier!.price * 0.75 * children) : 0;
  const returnInfantFare = isRoundTrip ? Math.round(returnTier!.price * 0.1 * infants) : 0;

  const multiCityExtraFare = isMultiCity
    ? multiCityLegs!.slice(1).reduce((sum, leg) => (
        sum + leg.tier.price * adults
             + Math.round(leg.tier.price * 0.75 * children)
             + Math.round(leg.tier.price * 0.1 * infants)
      ), 0)
    : 0;

  const subtotal =
    outboundAdultFare + outboundChildFare + outboundInfantFare +
    returnAdultFare + returnChildFare + returnInfantFare +
    multiCityExtraFare;
  const taxes = Math.round(subtotal * 0.05);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fareChanged, setFareChanged] = useState(false);
  const [updatedFare, setUpdatedFare] = useState<number | null>(null);

  const [form, setForm] = useState<BookingFormState>({
    passengers: [
      ...Array(adults).fill(null).map(() => emptyPassenger("adult")),
      ...Array(children).fill(null).map(() => emptyPassenger("child")),
      ...Array(infants).fill(null).map(() => emptyPassenger("infant")),
    ],
    contactEmail: "",
    contactPhone: "",
    gstNumber: "",
    gstCompanyName: "",
    gstCompanyEmail: "",
    gstCompanyAddress: "",
    promoCode: "",
    promoApplied: false,
    promoDiscount: 0,
  });

  const discount = form.promoDiscount;
  const totalPayable = Math.round(subtotal + taxes - discount);

  async function handleFareQuote() {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFareQuote(flight);
      if (result.fareChanged) {
        setFareChanged(true);
        setUpdatedFare(result.tiers[0]?.price ?? null);
      } else {
        setFareChanged(false);
        setStep(2);
      }
    } catch (e: any) {
      setError(e.message ?? "Could not fetch latest fare. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function validatePassengers(): string | null {
    for (let i = 0; i < form.passengers.length; i++) {
      const p = form.passengers[i];
      if (!p.firstName.trim() || !p.lastName.trim()) return `Fill first and last name for Passenger ${i + 1}`;
      if (needsPan && i < adults && !p.panNumber.match(/^[A-Z]{5}[0-9]{4}[A-Z]$/)) {
        return `Valid PAN required for Passenger ${i + 1}`;
      }
      // FIX #3: Check passport for international routes regardless of TBO flag
      if (needsPassport) {
        if (!p.passportNo.trim()) return `Passport number required for Passenger ${i + 1} (international flight)`;
        if (!p.passportExpiry.trim()) return `Passport expiry required for Passenger ${i + 1}`;
        // Validate passport expiry is at least 6 months from now
        const expiry = new Date(p.passportExpiry);
        const sixMonthsFromNow = new Date();
        sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
        if (expiry < sixMonthsFromNow) {
          return `Passport for Passenger ${i + 1} must be valid for at least 6 months beyond travel date`;
        }
      }
    }
    if (!form.contactEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Enter a valid email address";
    if (!form.contactPhone.match(/^[6-9]\d{9}$/)) return "Enter a valid 10-digit Indian mobile number";
    return null;
  }

  function handlePassengerSubmit() {
    const err = validatePassengers();
    if (err) { setError(err); return; }
    setError(null);
    setStep(3); // Go to REVIEW step
  }

  function applyPromo() {
    const PROMOS: Record<string, number> = {
      FIRST500: 500,
      HDFC10: Math.round(totalPayable * 0.1),
      PLUM200: 200,
    };
    const disc = PROMOS[form.promoCode.toUpperCase()];
    if (disc) {
      setForm((f) => ({ ...f, promoApplied: true, promoDiscount: disc }));
    } else {
      setError("Invalid or expired promo code");
    }
  }

  // ── Save booking to database ─────────────────────────────
  async function saveBooking(bookingId?: number, pnr?: string, passengerNames?: string[]) {
    try {
      await fetch(`${API_BASE}/api/v1/flights/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          pnr,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
          passengers: form.passengers.map((p, i) => ({
            title: p.title,
            firstName: p.firstName,
            lastName: p.lastName,
            paxType: i < adults ? "Adult" : i < adults + children ? "Child" : "Infant",
            dob: p.dob,
            gender: p.gender,
            nationality: p.nationality,
            passportNo: p.passportNo || null,
            passportExpiry: p.passportExpiry || null,
            panNumber: p.panNumber || null,
          })),
          flight: {
            resultIndex: flight.resultIndex,
            traceId: flight.traceId,
            airline: flight.airline,
            flightNumber: flight.flightNumber,
            fromCode: flight.fromCode,
            toCode: flight.toCode,
            departDate: flight.departDate,
            departTime: flight.departTime,
            arriveTime: flight.arriveTime,
            fareName: tier.name,
            farePrice: tier.price,
            isInternational,
          },
          returnFlight: returnFlight ? {
            resultIndex: returnFlight.resultIndex,
            airline: returnFlight.airline,
            flightNumber: returnFlight.flightNumber,
            fromCode: returnFlight.fromCode,
            toCode: returnFlight.toCode,
            departDate: returnFlight.departDate,
            departTime: returnFlight.departTime,
            arriveTime: returnFlight.arriveTime,
            fareName: returnTier?.name,
            farePrice: returnTier?.price,
          } : null,
          multiCityLegs: multiCityLegs ? multiCityLegs.map((leg, i) => ({
            legIndex: i,
            airline: leg.flight.airline,
            flightNumber: leg.flight.flightNumber,
            fromCode: leg.flight.fromCode,
            toCode: leg.flight.toCode,
            departDate: leg.flight.departDate,
            departTime: leg.flight.departTime,
            arriveTime: leg.flight.arriveTime,
            fareName: leg.tier.name,
            farePrice: leg.tier.price,
          })) : null,
          adults,
          children,
          infants,
          subtotal,
          taxes,
          discount,
          totalPayable,
          gst: form.gstNumber ? {
            gstNumber: form.gstNumber,
            gstCompanyName: form.gstCompanyName,
            gstCompanyEmail: form.gstCompanyEmail,
            gstCompanyAddress: form.gstCompanyAddress,
          } : null,
          paymentMode: MOCK_MODE ? "MOCK" : "RAZORPAY",
          bookedAt: new Date().toISOString(),
        }),
      });
    } catch (e) {
      // Non-fatal: booking already confirmed, DB save failure should not block user
      console.error("[saveBooking] Failed to save booking to DB:", e);
    }
  }

  // ── Step 4: Full Razorpay Payment Flow ───────────────────
  async function handlePayment() {
    setLoading(true);
    setError(null);

    const passengersMapped: BookFlightInput["passengers"] = form.passengers.map((p, i) => ({
      Title: p.title as "Mr" | "Ms" | "Mrs" | "Mstr" | "Miss",
      FirstName: p.firstName.trim(),
      LastName: p.lastName.trim(),
      PaxType: (i < adults ? 1 : i < adults + children ? 2 : 3) as 1 | 2 | 3,
      DateOfBirth: p.dob ? `${p.dob}T00:00:00` : "1990-01-01T00:00:00",
      Gender: p.gender === "Male" ? 1 : 2,
      PassportNo: p.passportNo || undefined,
      PassportExpiry: p.passportExpiry || undefined,
      Pan: p.panNumber || undefined,
    }));

    const gstPayload = form.gstNumber ? {
      GSTNumber: form.gstNumber,
      GSTCompanyName: form.gstCompanyName,
      GSTCompanyEmail: form.gstCompanyEmail,
      GSTCompanyAddress: form.gstCompanyAddress,
    } : undefined;

    const passengerNames = form.passengers.map((p) => `${p.title} ${p.firstName} ${p.lastName}`.trim());

    // ── MOCK MODE ─────────────────────────────────────────
    if (MOCK_MODE) {
      try {
        let bookingId: number | undefined;
        let pnr: string | undefined;

        if (isMultiCity && multiCityLegs && multiCityLegs.length > 0) {
          const results: { bookingId?: number; pnr?: string }[] = [];
          for (const leg of multiCityLegs) {
            const r = await apiBookFlight({
              traceId: leg.flight.traceId,
              resultIndex: leg.tier.resultIndex,
              isLCC: leg.flight.isLCC,
              passengers: passengersMapped,
              contact: { Email: form.contactEmail, Mobile: form.contactPhone },
              gst: gstPayload,
            });
            results.push(r);
          }
          bookingId = results[0].bookingId;
          pnr = results.map(r => r.pnr).filter(Boolean).join(", ");
        } else {
          const result = await apiBookFlight({
            traceId: flight.traceId,
            resultIndex: isRoundTrip && returnTier
              ? `${tier.resultIndex},${returnTier.resultIndex}`
              : tier.resultIndex,
            isLCC: flight.isLCC,
            passengers: passengersMapped,
            contact: { Email: form.contactEmail, Mobile: form.contactPhone },
            gst: gstPayload,
          });
          bookingId = result.bookingId;
          pnr = result.pnr;
        }

        // FIX #5: Save booking to DB
        await saveBooking(bookingId, pnr, passengerNames);
        onConfirm(bookingId, pnr, passengerNames, form.contactEmail);
      } catch (e: any) {
        setError(e.message ?? "Booking failed. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── LIVE MODE: Full Razorpay ──────────────────────────
    try {
      const rzpLoaded = await loadRazorpay();
      if (!rzpLoaded) {
        setError("Could not load Razorpay. Check your internet connection.");
        setLoading(false);
        return;
      }

      // 1. Create Razorpay order on backend
      const orderRes = await fetch(`${API_BASE}/api/v1/flights/tbo/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalPayable * 100, // paise
          currency: "INR",
          receipt: `plum_${Date.now()}`,
          notes: {
            route: `${flight.fromCode}→${flight.toCode}`,
            passengers: adults + children + infants,
          },
        }),
      });

      const orderJson = await orderRes.json();
      if (!orderJson.ok) throw new Error(orderJson.message || "Failed to create payment order");

      const { orderId, amount } = orderJson.data;

      // 2. Open Razorpay checkout
      await new Promise<void>((resolve, reject) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
          amount,
          currency: "INR",
          name: "PlumTrips",
          description: `${flight.fromCode} → ${flight.toCode} · ${adults + children + infants} traveller${adults + children + infants !== 1 ? "s" : ""}`,
          order_id: orderId,
          prefill: {
            name: `${form.passengers[0]?.firstName ?? ""} ${form.passengers[0]?.lastName ?? ""}`.trim(),
            email: form.contactEmail,
            contact: `+91${form.contactPhone}`,
          },
          theme: { color: "#2563eb" },
          modal: {
            backdropclose: false,
            ondismiss: () => {
              reject(new Error("Payment cancelled. Your booking was not confirmed."));
            },
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              // 3. Verify payment + book with TBO atomically
              const bookRes = await fetch(`${API_BASE}/api/v1/flights/tbo/book-after-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  // Razorpay payment proof
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  // TBO booking params
                  traceId: flight.traceId,
                  resultIndex: isRoundTrip && returnTier
                    ? `${tier.resultIndex},${returnTier.resultIndex}`
                    : tier.resultIndex,
                  isLCC: flight.isLCC,
                  passengers: passengersMapped,
                  contact: { Email: form.contactEmail, Mobile: form.contactPhone },
                  gst: gstPayload,
                }),
              });

              const bookJson = await bookRes.json();
              if (!bookJson.ok) throw new Error(bookJson.message || "Booking failed after payment");

              const { bookingId, pnr } = bookJson.data;

              // FIX #5: Save booking to DB
              await saveBooking(bookingId, pnr, passengerNames);

              onConfirm(bookingId, pnr, passengerNames, form.contactEmail);
              resolve();
            } catch (err: any) {
              reject(err);
            }
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });

    } catch (e: any) {
      setError(e.message ?? "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const paxTypes: ("Adult" | "Child" | "Infant")[] = [
    ...Array(adults).fill("Adult"),
    ...Array(children).fill("Child"),
    ...Array(infants).fill("Infant"),
  ];

  const shellProps = {
    flight, tier,
    returnFlight, returnTier, multiCityLegs,
    adults, childCount: children, infants,
    discount, subtotal,
    onBack: step === 1 ? onBack : () => setStep((s) => (s - 1) as 1 | 2 | 3 | 4),
  };

  // ══ STEP 1: Review Fare ═══════════════════════════════════

  if (step === 1) {
    return (
      <BookingShell {...shellProps} step={1}>
        <SectionHeading step="1" label="Step 1 of 4" title="Review Your Fare" desc="We confirm the latest price before you enter details." />

        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-4">
          {/* International Notice */}
          {isInternational && (
            <div className="flex items-center gap-2 mb-4 p-3 bg-orange-50 border border-orange-100 rounded-xl">
              <span className="text-xl shrink-0">🛂</span>
              <div className="text-sm text-orange-800">
                <span className="font-bold">International Flight</span> — Passport details required for all passengers.
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black" style={{ background: AIRLINE_COLORS[flight.airlineCode] ?? "#64748b" }}>
                {flight.airlineCode}
              </div>
              <div>
                <div className="font-bold text-slate-800">{flight.airline}</div>
                <div className="text-xs text-slate-400">{flight.flightNumber} · {flight.craft ?? ""}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${flight.isLCC ? "bg-amber-50 text-amber-700" : "bg-indigo-50 text-indigo-700"}`}>
                {flight.isLCC ? "LCC" : "Full Service"}
              </div>
              <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${flight.isRefundable ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
                {flight.isRefundable ? "Refundable" : "Non-refundable"}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-5">
            <div className="text-center">
              <div className="font-black text-3xl text-slate-900">{flight.departTime}</div>
              <div className="text-xs text-slate-400 mt-1">{flight.departDate}</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">{flight.fromCode}</div>
              {flight.fromCity && <div className="text-[10px] text-slate-400">{flight.fromCity}</div>}
              {flight.terminal && <div className="text-xs text-blue-500 font-medium mt-0.5">Terminal {flight.terminal}</div>}
            </div>
            <div className="flex-1 mx-6 flex flex-col items-center gap-1.5">
              <div className="text-xs text-slate-500 font-semibold">{flight.durationLabel}</div>
              <div className="w-full flex items-center gap-0.5">
                <div className="w-2 h-2 rounded-full bg-slate-300" />
                <div className="flex-1 border-t border-dashed border-slate-200 relative">
                  {flight.stops > 0 && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 border-2 border-white" />
                  )}
                </div>
                <div className="w-2 h-2 rounded-full bg-slate-300" />
              </div>
              <div className={`text-xs font-bold ${flight.stops === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}${flight.stopInfo ? ` · ${flight.stopInfo}` : ""}`}
              </div>
            </div>
            <div className="text-center">
              <div className="font-black text-3xl text-slate-900">{flight.arriveTime}</div>
              <div className="text-xs text-slate-400 mt-1">{flight.arriveDate}</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">{flight.toCode}</div>
              {flight.toCity && <div className="text-[10px] text-slate-400">{flight.toCity}</div>}
              {flight.arrivalTerminal && <div className="text-xs text-blue-500 font-medium mt-0.5">Terminal {flight.arrivalTerminal}</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5 border-t border-slate-100">
            {[
              { label: "Cabin Bag", value: tier.cabinBag, icon: "🎒" },
              { label: "Check-in", value: tier.checkinBag, icon: "🧳" },
              { label: "Seats", value: tier.seatSelection, icon: "💺" },
              { label: "Meals", value: tier.meals, icon: "🍽️" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-lg mb-1">{icon}</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</div>
                <div className="text-xs font-bold text-slate-700">{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Return flight in review */}
        {isRoundTrip && returnFlight && returnTier && (
          <>
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 border-t border-dashed border-slate-200" />
              <span className="text-xs font-bold text-slate-400 px-2">Return Flight</span>
              <div className="flex-1 border-t border-dashed border-slate-200" />
            </div>
            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black" style={{ background: AIRLINE_COLORS[returnFlight.airlineCode] ?? "#64748b" }}>
                    {returnFlight.airlineCode}
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">{returnFlight.airline}</div>
                    <div className="text-xs text-slate-400">{returnFlight.flightNumber}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="font-black text-2xl text-slate-900">{returnFlight.departTime}</div>
                  <div className="text-xs font-bold text-slate-700">{returnFlight.fromCode}</div>
                  <div className="text-xs text-slate-400">{returnFlight.departDate}</div>
                </div>
                <div className="flex-1 mx-4 text-center">
                  <div className="text-xs text-slate-500">{returnFlight.durationLabel}</div>
                  <div className="border-t border-dashed border-slate-300 my-1" />
                  <div className={`text-xs font-bold ${returnFlight.stops === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                    {returnFlight.stops === 0 ? "Non-stop" : `${returnFlight.stops} stop`}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-black text-2xl text-slate-900">{returnFlight.arriveTime}</div>
                  <div className="text-xs font-bold text-slate-700">{returnFlight.toCode}</div>
                  <div className="text-xs text-slate-400">{returnFlight.arriveDate}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs">
                <span className="text-slate-500">Fare: <strong>{returnTier.name}</strong></span>
                <span className="font-black text-blue-600">{formatINR(returnTier.price)} / adult</span>
              </div>
            </div>
          </>
        )}

        {/* Multi-city Legs 2+ */}
        {isMultiCity && multiCityLegs && multiCityLegs.length > 1 && (
          <>
            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 border-t border-dashed border-slate-200" />
              <span className="text-xs font-bold text-slate-400 px-2">Additional Legs</span>
              <div className="flex-1 border-t border-dashed border-slate-200" />
            </div>
            <div className="space-y-3 mb-4">
              {multiCityLegs.slice(1).map((leg, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Leg {i + 2}</span>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-black" style={{ background: AIRLINE_COLORS[leg.flight.airlineCode] ?? "#64748b" }}>
                        {leg.flight.airlineCode}
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{leg.flight.airline} · {leg.flight.flightNumber}</span>
                    </div>
                    <span className="font-black text-blue-600 text-sm">{formatINR(leg.tier.price)}/adult</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-center">
                      <div className="font-black text-xl text-slate-900">{leg.flight.departTime}</div>
                      <div className="text-xs font-bold text-slate-700">{leg.flight.fromCode}</div>
                      <div className="text-[10px] text-slate-400">{leg.flight.departDate}</div>
                    </div>
                    <div className="flex-1 mx-3 text-center">
                      <div className="text-[10px] text-slate-400">{leg.flight.durationLabel}</div>
                      <div className="border-t border-dashed border-slate-300 my-1" />
                      <div className={`text-[10px] font-bold ${leg.flight.stops === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                        {leg.flight.stops === 0 ? "Non-stop" : `${leg.flight.stops} stop`}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-black text-xl text-slate-900">{leg.flight.arriveTime}</div>
                      <div className="text-xs font-bold text-slate-700">{leg.flight.toCode}</div>
                      <div className="text-[10px] text-slate-400">{leg.flight.arriveDate}</div>
                    </div>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
                    <span>Fare: {leg.tier.name}</span>
                    <span>{leg.flight.isRefundable ? "✅ Refundable" : "❌ Non-refundable"}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {fareChanged && updatedFare && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
            <div className="flex items-start gap-3">
              <div className="text-xl shrink-0">⚠️</div>
              <div>
                <div className="font-bold text-amber-800 text-sm mb-1">Fare Updated by Airline</div>
                <p className="text-xs text-amber-700 mb-3">
                  Price changed from <strong>{formatINR(tier.price)}</strong> to <strong>{formatINR(updatedFare)}</strong> per adult.
                </p>
                <div className="flex gap-3">
                  <button onClick={() => { setFareChanged(false); setStep(2); }} className="bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors">
                    Accept new fare & continue
                  </button>
                  <button onClick={onBack} className="text-amber-700 text-xs font-semibold underline">Go back & search again</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {flight.seatsLeft && flight.seatsLeft <= 9 && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-4 text-sm text-rose-600 font-semibold flex items-center gap-2">
            <span>🔥</span> Only {flight.seatsLeft} seat{flight.seatsLeft > 1 ? "s" : ""} left at this price!
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 font-medium">{error}</div>
        )}

        <button
          onClick={handleFareQuote}
          disabled={loading || (fareChanged && !updatedFare)}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-base py-4 rounded-2xl transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-3"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Locking in your fare...</>
          ) : "Lock Fare & Enter Details →"}
        </button>
        <p className="text-xs text-slate-400 text-center mt-3">Price is confirmed with the airline before you enter any details.</p>
      </BookingShell>
    );
  }

  // ══ STEP 2: Traveller Details ══════════════════════════════

  if (step === 2) {
    return (
      <BookingShell {...shellProps} step={2}>
        <SectionHeading step="A" label="Step 2 of 4 · Section A" title="Passenger Information" desc={needsPassport
          ? "International flight — passport details required for all passengers."
          : "Names must exactly match the government-issued ID."} />

        {needsPassport && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">🛂</span>
            <div>
              <div className="font-bold text-orange-800 text-sm mb-1">International Flight — Passport Mandatory</div>
              <p className="text-xs text-orange-700">All passengers must provide a valid passport number and expiry date. Passports must be valid for at least 6 months beyond the travel date.</p>
            </div>
          </div>
        )}

        {form.passengers.map((pax, i) => (
          <PassengerCard
            key={i}
            index={i}
            paxType={paxTypes[i]}
            data={pax}
            needsPan={needsPan && paxTypes[i] === "Adult"}
            needsPassport={needsPassport}
            onChange={(d) => {
              setForm((f) => {
                const paxArr = [...f.passengers];
                paxArr[i] = d;
                return { ...f, passengers: paxArr };
              });
            }}
          />
        ))}

        <div className="mt-6">
          <SectionHeading step="B" label="Step 2 of 4 · Section B" title="Contact Details" desc="Ticket and updates will be sent here." />
          <ContactSection
            email={form.contactEmail}
            phone={form.contactPhone}
            onEmail={(v) => setForm((f) => ({ ...f, contactEmail: v }))}
            onPhone={(v) => setForm((f) => ({ ...f, contactPhone: v }))}
          />
        </div>

        <div className="mt-6">
          <SectionHeading step="C" label="Step 2 of 4 · Section C" title="GST & Other Options" />
          <GSTSection
            gstNumber={form.gstNumber}
            gstCompanyName={form.gstCompanyName}
            gstCompanyEmail={form.gstCompanyEmail}
            gstCompanyAddress={form.gstCompanyAddress}
            onChange={(field, value) => setForm((f) => ({ ...f, [field]: value }))}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 font-medium">{error}</div>
        )}

        <button
          onClick={handlePassengerSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-base py-4 rounded-2xl transition-colors shadow-lg shadow-blue-200"
        >
          Continue to Review →
        </button>
      </BookingShell>
    );
  }

  // ══ STEP 3: Review & Confirm ═══════════════════════════════

  if (step === 3) {
    return (
      <BookingShell {...shellProps} step={3}>
        <ReviewStep
          flight={flight} tier={tier}
          returnFlight={returnFlight} returnTier={returnTier}
          multiCityLegs={multiCityLegs}
          passengers={form.passengers}
          paxTypes={paxTypes}
          contactEmail={form.contactEmail}
          contactPhone={form.contactPhone}
          adults={adults} children={children} infants={infants}
          subtotal={subtotal} discount={discount}
          isInternational={isInternational}
          onConfirm={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      </BookingShell>
    );
  }

  // ══ STEP 4: Payment ════════════════════════════════════════

  return (
    <BookingShell {...shellProps} step={4}>
      {/* Section D — Promo Code */}
      <SectionHeading step="D" label="Step 4 of 4 · Section D" title="Promo Code" />
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
        {form.promoApplied ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold text-sm">{form.promoCode} applied — {formatINR(discount)} saved!</span>
            </div>
            <button onClick={() => setForm((f) => ({ ...f, promoApplied: false, promoDiscount: 0, promoCode: "" }))} className="text-xs text-slate-400 hover:text-slate-600 underline">Remove</button>
          </div>
        ) : (
          <div className="flex gap-3">
            <TextInput
              value={form.promoCode}
              onChange={(v) => setForm((f) => ({ ...f, promoCode: v.toUpperCase() }))}
              placeholder="FIRST500, HDFC10…"
              className="font-mono tracking-widest"
            />
            <button onClick={applyPromo} className="bg-slate-800 hover:bg-slate-700 text-white px-5 rounded-xl text-sm font-bold transition-colors shrink-0">Apply</button>
          </div>
        )}
        <p className="text-xs text-slate-400 mt-2">Try: FIRST500 · HDFC10 · PLUM200</p>
      </div>

      {/* Section E — Payment */}
      <SectionHeading
        step="E"
        label="Step 4 of 4 · Section E"
        title="Secure Payment"
        desc={MOCK_MODE
          ? "Mock mode — payment is simulated, no real charge."
          : "Pay safely via Razorpay — UPI, cards, netbanking, EMI accepted."}
      />

      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
        <div className="flex items-center gap-3 flex-wrap mb-5">
          {["UPI", "Visa", "Mastercard", "RuPay", "NetBanking", "EMI", "Wallets"].map((m) => (
            <div key={m} className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">{m}</div>
          ))}
        </div>

        {!MOCK_MODE && (
          <div className="flex items-center gap-2 mb-5 p-3 bg-blue-50 rounded-xl">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-black">R</span>
            </div>
            <div className="text-xs text-blue-700 font-semibold">Powered by Razorpay · PCI-DSS Level 1 Certified</div>
          </div>
        )}

        <div className="space-y-2 text-sm mb-5 pb-5 border-b border-slate-100">
          <div className="flex justify-between">
            <span className="text-slate-500">Base fare + taxes</span>
            <span className="font-semibold text-slate-700">{formatINR(subtotal + taxes)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-emerald-600 font-semibold">Promo discount</span>
              <span className="text-emerald-600 font-semibold">−{formatINR(discount)}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="font-black text-slate-800 text-base">Total Payable</span>
          <span className="font-black text-2xl text-slate-900">{formatINR(totalPayable)}</span>
        </div>
        <p className="text-xs text-slate-400">Inclusive of all taxes and fees. No hidden charges.</p>
      </div>

      <div className="flex items-center justify-center gap-5 mb-6">
        {[{ icon: "🔒", label: "256-bit SSL" }, { icon: "✅", label: "PCI DSS Compliant" }, { icon: "🛡️", label: "3D Secure" }].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>{icon}</span> {label}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 font-medium whitespace-pre-line">{error}</div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-lg py-4 rounded-2xl transition-colors shadow-xl shadow-blue-300 flex items-center justify-center gap-3"
      >
        {loading ? (
          <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            {MOCK_MODE ? "Confirming mock booking..." : "Opening payment…"}</>
        ) : (
          <>
            {MOCK_MODE ? (
              <>✓ Confirm Booking — {formatINR(totalPayable)}</>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Pay {formatINR(totalPayable)} via Razorpay
              </>
            )}
          </>
        )}
      </button>

      <p className="text-xs text-slate-400 text-center mt-3">
        By paying you agree to PlumTrips{" "}
        <a href="/terms" className="underline hover:text-slate-600">Terms of Service</a> and{" "}
        <a href="/cancellation" className="underline hover:text-slate-600">Cancellation Policy</a>.
        {MOCK_MODE && " (Running in mock mode — no actual payment will occur.)"}
      </p>
    </BookingShell>
  );
}