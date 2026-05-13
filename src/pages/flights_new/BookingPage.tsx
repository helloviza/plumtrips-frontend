// ============================================================
//  BookingPage.tsx — Production-ready, 3-step booking
//
//  Step 1: Review Fare  (FareQuote lock + fare-change alert)
//  Step 2: Traveller Details
//    Section A — Passenger Info (per pax)
//    Section B — Contact Details
//    Section C — GST / Frequent Flyer (optional)
//  Step 3: Payment
//    Section D — Promo Code
//    Section E — Razorpay Checkout
//
//  Secrets via env:
//    VITE_RAZORPAY_KEY_ID   — publishable key (safe on client)
//    VITE_API_BASE_URL      — your backend base URL
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

// ─── SMALL SHARED COMPONENTS ───────────────────────────────

function SectionHeading({
  step, label, title, desc,
}: { step: string; label: string; title: string; desc?: string }) {
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

function TextInput({
  value, onChange, placeholder, type = "text", className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
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

function SelectInput({
  value, onChange, options,
}: { value: string; onChange: (v: string) => void; options: string[] }) {
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

// ─── SECTION A: PASSENGER FORM ─────────────────────────────

function PassengerCard({
  index,
  paxType,
  data,
  needsPan,
  needsPassport,
  onChange,
}: {
  index: number;
  paxType: "Adult" | "Child" | "Infant";
  data: PassengerData;
  needsPan: boolean;
  needsPassport: boolean;
  onChange: (d: PassengerData) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showFF, setShowFF] = useState(false);
  const titles = paxType === "Adult" ? ["Mr", "Mrs", "Ms"] : ["Mstr", "Miss"];

  const paxColor = { Adult: "bg-blue-50 text-blue-700", Child: "bg-violet-50 text-violet-700", Infant: "bg-pink-50 text-pink-700" }[paxType];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-4">
      {/* Collapsible header */}
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
        </div>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="px-6 pb-6 border-t border-slate-100 pt-5">
          {/* Row 1: Title / First / Last / Gender */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <FieldLabel required>Title</FieldLabel>
              <SelectInput
                value={data.title}
                onChange={(v) => onChange({ ...data, title: v as PassengerData["title"] })}
                options={titles}
              />
            </div>
            <div>
              <FieldLabel required>First Name</FieldLabel>
              <TextInput
                value={data.firstName}
                onChange={(v) => onChange({ ...data, firstName: v })}
                placeholder="As on passport/ID"
              />
            </div>
            <div>
              <FieldLabel required>Last Name</FieldLabel>
              <TextInput
                value={data.lastName}
                onChange={(v) => onChange({ ...data, lastName: v })}
                placeholder="As on passport/ID"
              />
            </div>
            <div>
              <FieldLabel required>Gender</FieldLabel>
              <SelectInput
                value={data.gender}
                onChange={(v) => onChange({ ...data, gender: v as "Male" | "Female" })}
                options={["Male", "Female"]}
              />
            </div>
          </div>

          {/* Row 2: DOB / Nationality / PAN / Passport */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <FieldLabel required={paxType !== "Adult"}>Date of Birth</FieldLabel>
              <TextInput
                type="date"
                value={data.dob}
                onChange={(v) => onChange({ ...data, dob: v })}
              />
            </div>
            <div>
              <FieldLabel required>Nationality</FieldLabel>
              <TextInput
                value={data.nationality}
                onChange={(v) => onChange({ ...data, nationality: v.toUpperCase().slice(0, 2) })}
                placeholder="IN"
              />
            </div>
            {needsPan && (
              <div>
                <FieldLabel required>PAN Number</FieldLabel>
                <TextInput
                  value={data.panNumber}
                  onChange={(v) => onChange({ ...data, panNumber: v.toUpperCase().slice(0, 10) })}
                  placeholder="ABCDE1234F"
                  className="font-mono tracking-widest"
                />
              </div>
            )}
            {needsPassport && (
              <>
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
              </>
            )}
          </div>

          {/* Frequent Flyer toggle */}
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
              <div>
                <FieldLabel>Airline Code</FieldLabel>
                <TextInput
                  value={data.ffAirlineCode}
                  onChange={(v) => onChange({ ...data, ffAirlineCode: v.toUpperCase() })}
                  placeholder="AI"
                />
              </div>
              <div>
                <FieldLabel>FF Number</FieldLabel>
                <TextInput
                  value={data.ffNumber}
                  onChange={(v) => onChange({ ...data, ffNumber: v })}
                  placeholder="123456789"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SECTION B: CONTACT DETAILS ────────────────────────────

function ContactSection({
  email, phone,
  onEmail, onPhone,
}: {
  email: string;
  phone: string;
  onEmail: (v: string) => void;
  onPhone: (v: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-4">
      <h3 className="font-bold text-slate-800 text-sm mb-4">Contact Details</h3>
      <p className="text-xs text-slate-400 mb-4">
        Your e-ticket and booking updates will be sent here. Use the lead traveller's details.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FieldLabel required>Email Address</FieldLabel>
          <TextInput
            type="email"
            value={email}
            onChange={onEmail}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <FieldLabel required>Mobile Number</FieldLabel>
          <div className="flex gap-2">
            <div className="w-16 shrink-0">
              <TextInput value="+91" onChange={() => { }} className="text-center text-slate-500" />
            </div>
            <TextInput
              type="tel"
              value={phone}
              onChange={onPhone}
              placeholder="9876543210"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SECTION C: GST DETAILS ────────────────────────────────

function GSTSection({
  gstNumber, gstCompanyName, gstCompanyEmail, gstCompanyAddress,
  onChange,
}: {
  gstNumber: string;
  gstCompanyName: string;
  gstCompanyEmail: string;
  gstCompanyAddress: string;
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
          <span
            className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${showGST ? "translate-x-5" : ""}`}
          />
        </button>
      </div>

      {showGST && (
        <div className="mt-5 pt-5 border-t border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FieldLabel>GSTIN</FieldLabel>
              <TextInput
                value={gstNumber}
                onChange={(v) => onChange("gstNumber", v.toUpperCase())}
                placeholder="22AAAAA0000A1Z5"
                className="font-mono tracking-wider"
              />
            </div>
            <div>
              <FieldLabel>Company Name</FieldLabel>
              <TextInput
                value={gstCompanyName}
                onChange={(v) => onChange("gstCompanyName", v)}
                placeholder="Acme Technologies Pvt. Ltd."
              />
            </div>
            <div>
              <FieldLabel>Company Email</FieldLabel>
              <TextInput
                type="email"
                value={gstCompanyEmail}
                onChange={(v) => onChange("gstCompanyEmail", v)}
                placeholder="accounts@acme.com"
              />
            </div>
            <div>
              <FieldLabel>Registered Address</FieldLabel>
              <TextInput
                value={gstCompanyAddress}
                onChange={(v) => onChange("gstCompanyAddress", v)}
                placeholder="123 Business Park, Mumbai"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── FARE SUMMARY SIDEBAR ──────────────────────────────────

function FareSidebar({
  flight, tier, adults, children, infants, discount,
}: {
  flight: DisplayFlight;
  tier: FareTier;
  adults: number;
  children: number;
  infants: number;
  discount: number;
}) {
  const adultFare = tier.price * adults;
  const childFare = Math.round(tier.price * 0.75 * children);
  const infantFare = Math.round(tier.price * 0.1 * infants);
  const subtotal = adultFare + childFare + infantFare;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + taxes - discount;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 sticky top-24">
      {/* Flight summary */}
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
          style={{ background: AIRLINE_COLORS[flight.airlineCode] ?? "#64748b" }}
        >
          {flight.airlineCode}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-slate-800 text-sm truncate">{flight.airline}</div>
          <div className="text-xs text-slate-400">{flight.flightNumber} · {tier.name}</div>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
        <div className="text-center">
          <div className="font-black text-slate-900 text-xl">{flight.departTime}</div>
          <div className="text-xs text-slate-400 mt-0.5">{flight.departDate}</div>
          <div className="text-xs font-bold text-slate-600 mt-0.5">{flight.fromCode}</div>
          {flight.fromCity && <div className="text-[10px] text-slate-400">{flight.fromCity}</div>}
        </div>
        <div className="flex-1 mx-3 flex flex-col items-center gap-1">
          <div className="text-xs text-slate-400 font-medium">{flight.durationLabel}</div>
          <div className="w-full flex items-center gap-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <div className="flex-1 border-t border-dashed border-slate-200" />
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          </div>
          <div className={`text-xs font-semibold ${flight.stops === 0 ? "text-emerald-600" : "text-amber-600"}`}>
            {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}
          </div>
        </div>
        <div className="text-center">
          <div className="font-black text-slate-900 text-xl">{flight.arriveTime}</div>
          <div className="text-xs text-slate-400 mt-0.5">{flight.arriveDate}</div>
          <div className="text-xs font-bold text-slate-600 mt-0.5">{flight.toCode}</div>
          {flight.toCity && <div className="text-[10px] text-slate-400">{flight.toCity}</div>}
        </div>
      </div>

      {/* Baggage */}
      <div className="flex gap-3 mb-4 pb-4 border-b border-slate-100">
        {[
          { label: "Cabin", value: tier.cabinBag },
          { label: "Check-in", value: tier.checkinBag },
        ].map(({ label, value }) => (
          <div key={label} className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">{label}</div>
            <div className="text-xs font-bold text-slate-700">{value}</div>
          </div>
        ))}
      </div>

      {/* Fare breakdown */}
      <div className="space-y-2 text-sm mb-4">
        {adults > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-500">Adult × {adults}</span>
            <span className="font-semibold text-slate-700">{formatINR(adultFare)}</span>
          </div>
        )}
        {children > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-500">Child × {children}</span>
            <span className="font-semibold text-slate-700">{formatINR(childFare)}</span>
          </div>
        )}
        {infants > 0 && (
          <div className="flex justify-between">
            <span className="text-slate-500">Infant × {infants}</span>
            <span className="font-semibold text-slate-700">{formatINR(infantFare)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-slate-500">Taxes & Fees</span>
          <span className="font-semibold text-slate-700">{formatINR(taxes)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-emerald-600 font-semibold">Promo Applied</span>
            <span className="font-semibold text-emerald-600">−{formatINR(discount)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-slate-100">
        <span className="font-bold text-slate-800">Total</span>
        <span className="font-black text-xl text-blue-600">{formatINR(total)}</span>
      </div>

      {/* Cancellation policy */}
      <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Policy</div>
        {[
          { label: "Cancellation", value: tier.cancellationFee },
          { label: "Date Change", value: tier.dateChangeFee },
          { label: "Seats", value: tier.seatSelection },
          { label: "Meals", value: tier.meals },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-xs">
            <span className="text-slate-400 font-medium">{label}</span>
            <span className="font-semibold text-slate-600 text-right max-w-[60%]">{value}</span>
          </div>
        ))}
      </div>

      {MOCK_MODE && (
        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2 font-medium">
          ⚠ Mock mode — see INTEGRATION_GUIDE.md to go live
        </div>
      )}
    </div>
  );
}

// ─── BOOKING SHELL (shared layout) ────────────────────────

function BookingShell({
  flight, tier, adults, childCount, infants, discount,
  onBack, step, children,
}: {
  flight: DisplayFlight;
  tier: FareTier;
  adults: number;
  childCount: number;
  infants: number;
  discount: number;
  onBack: () => void;
  step: 1 | 2 | 3;
  children: React.ReactNode;
}) {
  const steps = ["Review Fare", "Traveller Details", "Payment"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">P</span>
            </div>
            <span className="text-slate-800 font-black">plumtrips</span>
          </div>

          <div className="h-5 w-px bg-slate-200" />

          <button onClick={onBack} className="text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* Step progress */}
          <div className="flex items-center gap-1.5 ml-auto">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className="flex items-center gap-1.5">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${i + 1 < step
                    ? "bg-emerald-500 text-white"
                    : i + 1 === step
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100 text-slate-400"
                    }`}>
                    {i + 1 < step ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : i + 1}
                  </div>
                  <span className={`hidden sm:block text-xs font-semibold transition-colors ${i + 1 === step ? "text-blue-600" : i + 1 < step ? "text-slate-400" : "text-slate-300"
                    }`}>
                    {s}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-6 sm:w-10 h-px transition-colors ${i + 1 < step ? "bg-emerald-300" : "bg-slate-200"}`} />
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
            flight={flight}
            tier={tier}
            adults={adults}
            children={childCount}
            infants={infants}
            discount={discount}
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

// ─── MAIN BOOKING PAGE ─────────────────────────────────────

interface BookingPageProps {
  flight: DisplayFlight;
  tier: FareTier;
  adults: number;
  children: number;
  infants: number;
  onBack: () => void;
  onConfirm: (bookingId?: number, pnr?: string, passengerNames?: string[], contactEmail?: string) => void;
}

export default function BookingPage({
  flight, tier, adults, children, infants, onBack, onConfirm,
}: BookingPageProps) {
  const adultFare = tier.price * adults;
  const childFare = Math.round(tier.price * 0.75 * children);
  const infantFare = Math.round(tier.price * 0.1 * infants);
  const subtotal = adultFare + childFare + infantFare;
  const taxes = Math.round(subtotal * 0.05);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fare change state (from FareQuote)
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

  const effectiveFare = updatedFare ?? tier.price;
  const discount = form.promoDiscount;
  const totalPayable = Math.round(subtotal + taxes - discount);

  async function handleFareQuote() {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFareQuote(flight);
      if (result.fareChanged) {
        setFareChanged(true);
        setUpdatedFare(result.tiers[0]?.price ?? null)
      }
      else {
        setFareChanged(false);
        setStep(2);
      }
    } catch (e: any) {
      setError(e.message ?? "Could not fetch latest fare. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── Validate passenger fields ─────────────────────────────
  function validatePassengers(): string | null {
    for (let i = 0; i < form.passengers.length; i++) {
      const p = form.passengers[i];
      if (!p.firstName.trim() || !p.lastName.trim()) return `Fill first and last name for Passenger ${i + 1}`;
      if (flight.isPanRequired && !p.panNumber.match(/^[A-Z]{5}[0-9]{4}[A-Z]$/)) {
        return `Valid PAN required for Passenger ${i + 1}`;
      }
      if (flight.isPassportRequired && !p.passportNo.trim()) {
        return `Passport number required for Passenger ${i + 1}`;
      }
    }
    if (!form.contactEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return "Enter a valid email address";
    if (!form.contactPhone.match(/^[6-9]\d{9}$/)) return "Enter a valid 10-digit Indian mobile number";
    return null;
  }

  // ── Step 2 → Step 3 ───────────────────────────────────────
  function handlePassengerSubmit() {
    const err = validatePassengers();
    if (err) { setError(err); return; }
    setError(null);
    setStep(3);
  }

  // ── Promo code ────────────────────────────────────────────
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

  // ── Step 3: Book via backend ──────────────────────────────
  async function handlePayment() {
    setLoading(true);
    setError(null);
    try {
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

      const result = await apiBookFlight({
        traceId: flight.traceId,
        resultIndex: tier.resultIndex,
        isLCC: flight.isLCC,
        passengers: passengersMapped,
        contact: { Email: form.contactEmail, Mobile: form.contactPhone },
        gst: form.gstNumber
          ? {
            GSTNumber: form.gstNumber,
            GSTCompanyName: form.gstCompanyName,
            GSTCompanyEmail: form.gstCompanyEmail,
            GSTCompanyAddress: form.gstCompanyAddress,
          }
          : undefined,
      });

      const passengerNames = form.passengers.map(
        (p) => `${p.title} ${p.firstName} ${p.lastName}`.trim()
      );
      onConfirm(result.bookingId, result.pnr, passengerNames, form.contactEmail);
    } catch (e: any) {
      setError(e.message ?? "Booking failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── RENDER ────────────────────────────────────────────────

  const shellProps = { flight, tier, adults, childCount: children, infants, discount, onBack: step === 1 ? onBack : () => setStep((s) => (s - 1) as 1 | 2 | 3) };

  // ════════════════════════════════════════════════
  // STEP 1 — Review Fare
  // ════════════════════════════════════════════════

  if (step === 1) {
    return (
      <BookingShell {...shellProps} step={1}>
        <SectionHeading step="1" label="Step 1 of 3" title="Review Your Fare" desc="We confirm the latest price before you enter details." />

        {/* Fare card */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-4">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black"
                style={{ background: AIRLINE_COLORS[flight.airlineCode] ?? "#64748b" }}
              >
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

        {/* Fare change alert */}
        {fareChanged && updatedFare && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-4">
            <div className="flex items-start gap-3">
              <div className="text-xl shrink-0">⚠️</div>
              <div>
                <div className="font-bold text-amber-800 text-sm mb-1">Fare Updated by Airline</div>
                <p className="text-xs text-amber-700 mb-3">
                  The price has changed from <strong>{formatINR(tier.price)}</strong> to <strong>{formatINR(updatedFare)}</strong> per adult since you selected this flight.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setFareChanged(false); setStep(2); }}
                    className="bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-amber-700 transition-colors"
                  >
                    Accept new fare & continue
                  </button>
                  <button onClick={onBack} className="text-amber-700 text-xs font-semibold underline">
                    Go back & search again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Seats left badge */}
        {flight.seatsLeft && flight.seatsLeft <= 9 && (
          <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-4 text-sm text-rose-600 font-semibold flex items-center gap-2">
            <span>🔥</span> Only {flight.seatsLeft} seat{flight.seatsLeft > 1 ? "s" : ""} left at this price!
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handleFareQuote}
          disabled={loading || (fareChanged && !updatedFare)}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-base py-4 rounded-2xl transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-3"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Locking in your fare...
            </>
          ) : (
            "Lock Fare & Enter Details →"
          )}
        </button>
        <p className="text-xs text-slate-400 text-center mt-3">
          Price is confirmed with the airline before you enter any details.
        </p>
      </BookingShell>
    );
  }

  // ════════════════════════════════════════════════
  // STEP 2 — Traveller Details
  // ════════════════════════════════════════════════

  if (step === 2) {
    const paxTypes: ("Adult" | "Child" | "Infant")[] = [
      ...Array(adults).fill("Adult"),
      ...Array(children).fill("Child"),
      ...Array(infants).fill("Infant"),
    ];

    return (
      <BookingShell {...shellProps} step={2}>
        {/* Section A */}
        <SectionHeading step="A" label="Step 2 of 3 · Section A" title="Passenger Information" desc="Names must exactly match the government-issued ID or passport." />

        {form.passengers.map((pax, i) => (
          <PassengerCard
            key={i}
            index={i}
            paxType={paxTypes[i]}
            data={pax}
            needsPan={flight.isPanRequired && paxTypes[i] === "Adult"}
            needsPassport={flight.isPassportRequired}
            onChange={(d) => {
              setForm((f) => {
                const paxArr = [...f.passengers];
                paxArr[i] = d;
                return { ...f, passengers: paxArr };
              });
            }}
          />
        ))}

        {/* Section B */}
        <div className="mt-6">
          <SectionHeading step="B" label="Step 2 of 3 · Section B" title="Contact Details" desc="Ticket and updates will be sent here." />
          <ContactSection
            email={form.contactEmail}
            phone={form.contactPhone}
            onEmail={(v) => setForm((f) => ({ ...f, contactEmail: v }))}
            onPhone={(v) => setForm((f) => ({ ...f, contactPhone: v }))}
          />
        </div>

        {/* Section C */}
        <div className="mt-6">
          <SectionHeading step="C" label="Step 2 of 3 · Section C" title="GST & Other Options" />
          <GSTSection
            gstNumber={form.gstNumber}
            gstCompanyName={form.gstCompanyName}
            gstCompanyEmail={form.gstCompanyEmail}
            gstCompanyAddress={form.gstCompanyAddress}
            onChange={(field, value) => setForm((f) => ({ ...f, [field]: value }))}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 font-medium">
            {error}
          </div>
        )}

        <button
          onClick={handlePassengerSubmit}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-base py-4 rounded-2xl transition-colors shadow-lg shadow-blue-200"
        >
          Continue to Payment →
        </button>
      </BookingShell>
    );
  }

  // ════════════════════════════════════════════════
  // STEP 3 — Payment
  // ════════════════════════════════════════════════

  return (
    <BookingShell {...shellProps} step={3}>
      {/* Section D — Promo Code */}
      <SectionHeading step="D" label="Step 3 of 3 · Section D" title="Promo Code" />
      <div className="bg-white rounded-2xl border border-slate-100 p-5 mb-4">
        {form.promoApplied ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold text-sm">{form.promoCode} applied — {formatINR(discount)} saved!</span>
            </div>
            <button
              onClick={() => setForm((f) => ({ ...f, promoApplied: false, promoDiscount: 0, promoCode: "" }))}
              className="text-xs text-slate-400 hover:text-slate-600 underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <TextInput
              value={form.promoCode}
              onChange={(v) => setForm((f) => ({ ...f, promoCode: v.toUpperCase() }))}
              placeholder="FIRST500, HDFC10…"
              className="font-mono tracking-widest"
            />
            <button
              onClick={applyPromo}
              className="bg-slate-800 hover:bg-slate-700 text-white px-5 rounded-xl text-sm font-bold transition-colors shrink-0"
            >
              Apply
            </button>
          </div>
        )}
        <p className="text-xs text-slate-400 mt-2">Try: FIRST500 · HDFC10 · PLUM200</p>
      </div>

      {/* Section E — Payment */}
      <SectionHeading step="E" label="Step 3 of 3 · Section E" title="Secure Payment" desc="Pay safely via Razorpay — UPI, cards, netbanking accepted." />

      <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
        {/* Payment method icons */}
        <div className="flex items-center gap-3 flex-wrap mb-5">
          {["UPI", "Visa", "Mastercard", "NetBanking", "EMI"].map((m) => (
            <div key={m} className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">{m}</div>
          ))}
        </div>

        {/* Total breakdown */}
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

      {/* Security badges */}
      <div className="flex items-center justify-center gap-5 mb-6">
        {[
          { icon: "🔒", label: "256-bit SSL" },
          { icon: "✅", label: "PCI DSS Compliant" },
          { icon: "🛡️", label: "3D Secure" },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>{icon}</span> {label}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 font-medium">
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-lg py-4 rounded-2xl transition-colors shadow-xl shadow-blue-300 flex items-center justify-center gap-3"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Confirming your booking...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Confirm Booking — {formatINR(totalPayable)}
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