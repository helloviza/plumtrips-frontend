// ============================================================
//  BookingStep5Review.tsx — Step 5: Full Booking Review
// ============================================================

import { useState } from "react";
import type { DisplayFlight, FareTier } from "../../lib/types_t";
import type { PassengerData, ExtraSelection } from "./BookingShared";
import { SectionHeading, AIRLINE_COLORS, calcFares } from "./BookingShared";
import { formatINR } from "../../lib/flights_api";

interface Step5Props {
  flight: DisplayFlight; tier: FareTier;
  returnFlight?: DisplayFlight; returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  passengers: PassengerData[];
  paxTypes: ("Adult" | "Child" | "Infant")[];
  contactEmail: string; contactPhone: string;
  adults: number; children: number; infants: number;
  extras: ExtraSelection[];
  discount: number;
  isInternational: boolean;
  onConfirm: () => void;
  onBack: () => void;
}

export default function BookingStep5Review({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  passengers, paxTypes, contactEmail, contactPhone,
  adults, children, infants, extras, discount, isInternational,
  onConfirm, onBack,
}: Step5Props) {
  const [agreed, setAgreed] = useState(false);

  const { baseFares, subtotal, extrasTotal, taxes } = calcFares({
    tier, returnTier, multiCityLegs, adults, children, infants, extras,
  });
  const total = Math.round(subtotal + extrasTotal + taxes - discount);

  const isRoundTrip = !!returnFlight && !!returnTier;
  const isMultiCity = !!(multiCityLegs && multiCityLegs.length > 1);

  const allLegs = [
    { flight, tier, label: isRoundTrip ? "Outbound" : isMultiCity ? "Leg 1" : undefined },
    ...(isRoundTrip && returnFlight && returnTier ? [{ flight: returnFlight, tier: returnTier, label: "Return" }] : []),
    ...(isMultiCity ? (multiCityLegs ?? []).slice(1).map((l, i) => ({ ...l, label: `Leg ${i + 2}` })) : []),
  ];

  return (
    <div>
      <SectionHeading
        step="5"
        title="Review Your Booking"
        desc="This is your final review before payment. Verify everything carefully."
        accent="emerald"
      />

      {/* ── FLIGHT ITINERARY ─────────────────────────────── */}
      <ReviewCard title="✈️ Flight Itinerary">
        <div className="divide-y divide-slate-100">
          {allLegs.map(({ flight: f, tier: t, label }, idx) => (
            <LegRow key={idx} flight={f} tier={t} label={label} />
          ))}
        </div>
      </ReviewCard>

      {/* ── PASSENGERS ────────────────────────────────────── */}
      <ReviewCard title="👤 Passengers">
        <div className="divide-y divide-slate-100">
          {passengers.map((p, i) => {
            const extra = extras[i];
            return (
              <div key={i} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center shrink-0">{i + 1}</div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{p.title} {p.firstName} {p.lastName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {paxTypes[i]}{p.dob ? ` · DOB: ${p.dob}` : ""}
                        {p.nationality ? ` · ${p.nationality}` : ""}
                      </div>
                      {p.passportNo && (
                        <div className="text-xs text-orange-700 font-medium mt-0.5">
                          🛂 Passport: <span className="font-mono">{p.passportNo}</span> · Exp: {p.passportExpiry}
                        </div>
                      )}
                      {p.panNumber && (
                        <div className="text-xs text-slate-500 mt-0.5">PAN: <span className="font-mono">{p.panNumber}</span></div>
                      )}
                      {p.selectedSeat && (
                        <div className="text-xs text-blue-600 font-bold mt-0.5">💺 Seat: {p.selectedSeat}</div>
                      )}
                      {extra && (extra.mealCode !== "NONE" || extra.baggageKg > 0) && (
                        <div className="text-xs text-violet-600 font-medium mt-0.5">
                          {extra.mealCode !== "NONE" && `🍽️ ${extra.mealLabel}`}
                          {extra.mealCode !== "NONE" && extra.baggageKg > 0 && " · "}
                          {extra.baggageKg > 0 && `🧳 +${extra.baggageKg}kg`}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${
                    paxTypes[i] === "Adult" ? "bg-blue-50 text-blue-700"
                    : paxTypes[i] === "Child" ? "bg-violet-50 text-violet-700"
                    : "bg-pink-50 text-pink-700"
                  }`}>{paxTypes[i]}</span>
                </div>
              </div>
            );
          })}
        </div>
      </ReviewCard>

      {/* ── CONTACT ───────────────────────────────────────── */}
      <ReviewCard title="📱 Contact Details">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Email</div>
            <div className="font-semibold text-slate-800">{contactEmail}</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-0.5">Phone</div>
            <div className="font-semibold text-slate-800">+91 {contactPhone}</div>
          </div>
        </div>
      </ReviewCard>

      {/* ── FARE RULES ────────────────────────────────────── */}
      <ReviewCard title="📋 Fare Rules & Policies">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { icon: "↩️", label: "Cancellation", value: tier.cancellationFee },
            { icon: "📅", label: "Date Change", value: tier.dateChangeFee },
            { icon: "💺", label: "Seat Selection", value: tier.seatSelection },
            { icon: "🍽️", label: "Meals", value: tier.meals },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-slate-50 rounded-2xl p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{icon}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
              </div>
              <div className="text-xs font-semibold text-slate-700">{value}</div>
            </div>
          ))}
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 space-y-1">
          <div className="font-bold text-slate-700 mb-2">General Rules</div>
          <div>• Arrive {isInternational ? "3 hrs" : "2 hrs"} before departure</div>
          <div>• Government-issued photo ID required for all passengers</div>
          <div>• Cabin: {tier.cabinBag} · Check-in: {tier.checkinBag}</div>
          <div>• Fares are non-transferable between passengers</div>
          <div>• Check-in closes {isInternational ? "60" : "45"} minutes before departure</div>
        </div>

        {isInternational && (
          <div className="mt-3 bg-orange-50 border border-orange-100 rounded-2xl p-4 text-xs text-orange-800 space-y-1">
            <div className="font-bold mb-1.5">🛂 International Travel Requirements</div>
            <div>• Passport valid for 6+ months from travel date</div>
            <div>• Check visa requirements for your destination</div>
            <div>• Arrive 3 hours before international departure</div>
            <div>• Names must match passport exactly</div>
            <div>• Travel insurance may be required for some destinations</div>
          </div>
        )}
      </ReviewCard>

      {/* ── FARE BREAKDOWN ─────────────────────────────────── */}
      <ReviewCard title="💰 Final Fare Breakdown">
        <div className="space-y-2 text-sm">
          {adults > 0 && (
            <FareRow label={`${adults} Adult${adults > 1 ? "s" : ""} × ${formatINR(tier.price)}`} value={baseFares.adult} />
          )}
          {children > 0 && (
            <FareRow label={`${children} Child${children > 1 ? "ren" : ""}`} value={baseFares.child} />
          )}
          {infants > 0 && (
            <FareRow label={`${infants} Infant${infants > 1 ? "s" : ""}`} value={baseFares.infant} />
          )}
          {baseFares.return > 0 && <FareRow label="Return Fare" value={baseFares.return} />}
          {baseFares.multiCity > 0 && <FareRow label="Multi-city Fares" value={baseFares.multiCity} />}
          {extrasTotal > 0 && <FareRow label="Meals & Baggage" value={extrasTotal} accent="violet" />}
          <FareRow label="Taxes & Fees (5%)" value={taxes} />
          {discount > 0 && <FareRow label="Promo Discount" value={-discount} accent="emerald" />}

          <div className="flex justify-between items-center border-t-2 border-slate-200 pt-3 mt-2">
            <span className="font-black text-slate-900 text-base">Total Payable</span>
            <span className="font-black text-blue-600 text-xl">{formatINR(total)}</span>
          </div>
        </div>
      </ReviewCard>

      {/* ── CONFIRMATION CHECKBOX ─────────────────────────── */}
      <div className={`rounded-3xl border-2 p-5 mb-6 transition-all ${agreed ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-white"}`}>
        <label className="flex items-start gap-4 cursor-pointer">
          <div
            onClick={() => setAgreed((v) => !v)}
            className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5 ${
              agreed ? "bg-emerald-500 border-emerald-500" : "bg-white border-slate-300"
            }`}
          >
            {agreed && (
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <div className={`text-sm leading-relaxed ${agreed ? "text-emerald-800" : "text-slate-700"}`}>
            <span className="font-bold">I confirm all passenger details are correct</span> and I agree to the fare rules,
            cancellation policy, and{" "}
            <a href="/terms" className="underline">Terms of Service</a>.
            {isInternational && " I confirm all passengers hold valid passports for international travel."}
          </div>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-sm hover:border-slate-300 hover:bg-white transition-all"
        >
          ← Edit Details
        </button>
        <button
          onClick={onConfirm}
          disabled={!agreed}
          className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-black py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-blue-200 disabled:shadow-none"
        >
          {agreed ? `Proceed to Payment — ${formatINR(total)} →` : "Please confirm details above to continue"}
        </button>
      </div>
    </div>
  );
}

function ReviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 mb-4">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{title}</div>
      {children}
    </div>
  );
}

function FareRow({ label, value, accent }: { label: string; value: number; accent?: "violet" | "emerald" }) {
  const color = accent === "emerald" ? "text-emerald-600" : accent === "violet" ? "text-violet-600" : "text-slate-700";
  return (
    <div className={`flex justify-between items-center ${color}`}>
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold">{value < 0 ? `−${formatINR(-value)}` : formatINR(value)}</span>
    </div>
  );
}

function LegRow({ flight, tier, label }: { flight: DisplayFlight; tier: FareTier; label?: string }) {
  return (
    <div className="py-4 first:pt-0 last:pb-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-[9px] font-black"
            style={{ background: AIRLINE_COLORS[flight.airlineCode] ?? "#64748b" }}
          >
            {flight.airlineCode}
          </div>
          <div>
            <span className="font-bold text-slate-900 text-sm">{flight.airline} · {flight.flightNumber}</span>
            {label && (
              <span className={`ml-2 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                label.includes("Return") ? "bg-emerald-50 text-emerald-700"
                : label.includes("Leg") ? "bg-violet-50 text-violet-700"
                : "bg-blue-50 text-blue-700"
              }`}>{label}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-black text-blue-600 text-sm">{formatINR(tier.price)}</div>
          <div className="text-[9px] text-slate-400">per adult</div>
        </div>
      </div>
      <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4">
        <div className="text-center">
          <div className="font-black text-slate-900 text-xl">{flight.departTime}</div>
          <div className="text-xs font-bold text-slate-700">{flight.fromCode}</div>
          <div className="text-[10px] text-slate-400">{flight.departDate}</div>
        </div>
        <div className="flex-1 flex flex-col items-center gap-1">
          <div className="text-[10px] text-slate-400">{flight.durationLabel}</div>
          <div className="w-full border-t border-dashed border-slate-300" />
          <div className={`text-[10px] font-bold ${flight.stops === 0 ? "text-emerald-600" : "text-amber-600"}`}>
            {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}
          </div>
        </div>
        <div className="text-center">
          <div className="font-black text-slate-900 text-xl">{flight.arriveTime}</div>
          <div className="text-xs font-bold text-slate-700">{flight.toCode}</div>
          <div className="text-[10px] text-slate-400">{flight.arriveDate}</div>
        </div>
      </div>
    </div>
  );
}