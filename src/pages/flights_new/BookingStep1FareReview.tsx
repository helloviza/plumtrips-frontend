// ============================================================
//  BookingStep1FareReview.tsx — Step 1: Fare Review & Lock
// ============================================================

import type { DisplayFlight, FareTier } from "../../lib/types_t";
import { formatINR } from "../../lib/flights_api";
import { AIRLINE_COLORS, SectionHeading, ErrorBanner } from "./BookingShared";

interface Step1Props {
  flight: DisplayFlight;
  tier: FareTier;
  returnFlight?: DisplayFlight;
  returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  isInternational: boolean;
  loading: boolean;
  error: string | null;
  fareChanged: boolean;
  updatedFare: number | null;
  onLockFare: () => void;
  onAcceptNewFare: () => void;
  onAbort: () => void;
}

export default function BookingStep1FareReview({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  isInternational, loading, error,
  fareChanged, updatedFare,
  onLockFare, onAcceptNewFare, onAbort,
}: Step1Props) {
  const isRoundTrip = !!returnFlight && !!returnTier;
  const isMultiCity = !!(multiCityLegs && multiCityLegs.length > 1);

  return (
    <div>
      <SectionHeading
        step="1"
        title="Review Your Fare"
        desc="We verify the latest price with the airline before you enter any details. This takes just a moment."
      />

      {/* International badge */}
      {isInternational && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-5">
          <span className="text-2xl shrink-0">🛂</span>
          <div>
            <div className="font-bold text-amber-900 text-sm">International Flight</div>
            <p className="text-xs text-amber-700">Passport details will be required for all passengers in the next step.</p>
          </div>
        </div>
      )}

      {/* Primary flight card */}
      <FlightDetailCard
        flight={flight}
        tier={tier}
        label={isRoundTrip ? "Outbound" : isMultiCity ? "Leg 1" : undefined}
        accentColor={isRoundTrip ? "blue" : isMultiCity ? "violet" : undefined}
      />

      {/* Return flight */}
      {isRoundTrip && returnFlight && returnTier && (
        <>
          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 border-t border-dashed border-slate-300" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 bg-[#f8f7f4]">Return Flight</span>
            <div className="flex-1 border-t border-dashed border-slate-300" />
          </div>
          <FlightDetailCard flight={returnFlight} tier={returnTier} label="Return" accentColor="emerald" />
        </>
      )}

      {/* Multi-city legs */}
      {isMultiCity && multiCityLegs && multiCityLegs.length > 1 && (
        <>
          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 border-t border-dashed border-slate-300" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 bg-[#f8f7f4]">Additional Legs</span>
            <div className="flex-1 border-t border-dashed border-slate-300" />
          </div>
          {multiCityLegs.slice(1).map((leg, i) => (
            <FlightDetailCard key={i} flight={leg.flight} tier={leg.tier} label={`Leg ${i + 2}`} accentColor="violet" />
          ))}
        </>
      )}

      {/* Fare changed warning */}
      {fareChanged && updatedFare && (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">⚠️</span>
            <div className="flex-1">
              <div className="font-black text-amber-900 text-sm mb-1">Fare Updated by Airline</div>
              <p className="text-xs text-amber-700 mb-4">
                Price changed from <strong>{formatINR(tier.price)}</strong> to{" "}
                <strong className="text-amber-900">{formatINR(updatedFare)}</strong> per adult since you last checked.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onAcceptNewFare}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
                >
                  Accept new fare & continue
                </button>
                <button onClick={onAbort} className="text-amber-700 text-xs font-semibold underline">
                  Search again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Urgency */}
      {flight.seatsLeft && flight.seatsLeft <= 9 && (
        <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-5 py-3 mb-4">
          <span>🔥</span>
          <span className="text-sm text-rose-600 font-bold">
            Only {flight.seatsLeft} seat{flight.seatsLeft > 1 ? "s" : ""} left at this price!
          </span>
        </div>
      )}

      {error && <ErrorBanner message={error} />}

      {/* CTA */}
      {!fareChanged && (
        <button
          onClick={onLockFare}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-base py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3 mt-2"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Confirming fare with airline…</>
          ) : (
            <>Lock Fare & Enter Details →</>
          )}
        </button>
      )}
      <p className="text-xs text-slate-400 text-center mt-3">
        Price confirmed with the airline in real time. No surprise charges at checkout.
      </p>
    </div>
  );
}

// ─── FLIGHT DETAIL CARD ───────────────────────────────────────

function FlightDetailCard({
  flight, tier, label, accentColor,
}: {
  flight: DisplayFlight;
  tier: FareTier;
  label?: string;
  accentColor?: "blue" | "emerald" | "violet";
}) {
  const accentMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    violet: "text-violet-600 bg-violet-50",
  };
  const accent = accentColor ? accentMap[accentColor] : "";

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-4">
      {/* Airline bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-md"
            style={{ background: AIRLINE_COLORS[flight.airlineCode] ?? "#64748b" }}
          >
            {flight.airlineCode}
          </div>
          <div>
            <div className="font-black text-slate-900 text-sm">{flight.airline}</div>
            <div className="text-[10px] text-slate-400 font-medium">{flight.flightNumber}{flight.craft ? ` · ${flight.craft}` : ""}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {label && <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${accent}`}>{label}</span>}
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${flight.isLCC ? "bg-amber-50 text-amber-700" : "bg-indigo-50 text-indigo-700"}`}>
            {flight.isLCC ? "LCC" : "Full Service"}
          </span>
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${flight.isRefundable ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
            {flight.isRefundable ? "Refundable" : "Non-refundable"}
          </span>
        </div>
      </div>

      {/* Route */}
      <div className="flex items-center justify-between px-8 py-6">
        <div className="text-center">
          <div className="font-black text-4xl text-slate-900 tracking-tight">{flight.departTime}</div>
          <div className="text-[10px] text-slate-400 mt-1">{flight.departDate}</div>
          <div className="font-black text-slate-800 text-sm mt-0.5">{flight.fromCode}</div>
          {flight.fromCity && <div className="text-[10px] text-slate-400">{flight.fromCity}</div>}
          {flight.terminal && <div className="text-[10px] text-blue-500 font-bold mt-0.5">Terminal {flight.terminal}</div>}
        </div>

        <div className="flex-1 mx-8 flex flex-col items-center gap-2">
          <div className="text-xs text-slate-500 font-semibold">{flight.durationLabel}</div>
          <div className="w-full flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-400 bg-white" />
            <div className="flex-1 border-t-2 border-dashed border-slate-200 relative">
              {flight.stops > 0 && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </div>
            <div className="w-2.5 h-2.5 rounded-full border-2 border-slate-400 bg-white" />
          </div>
          <div className={`text-[10px] font-black uppercase tracking-widest ${flight.stops === 0 ? "text-emerald-600" : "text-amber-600"}`}>
            {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}${flight.stopInfo ? ` · ${flight.stopInfo}` : ""}`}
          </div>
        </div>

        <div className="text-center">
          <div className="font-black text-4xl text-slate-900 tracking-tight">{flight.arriveTime}</div>
          <div className="text-[10px] text-slate-400 mt-1">{flight.arriveDate}</div>
          <div className="font-black text-slate-800 text-sm mt-0.5">{flight.toCode}</div>
          {flight.toCity && <div className="text-[10px] text-slate-400">{flight.toCity}</div>}
          {flight.arrivalTerminal && <div className="text-[10px] text-blue-500 font-bold mt-0.5">Terminal {flight.arrivalTerminal}</div>}
        </div>
      </div>

      {/* Fare inclusions */}
      <div className="grid grid-cols-4 border-t border-slate-100">
        {[
          { icon: "🎒", label: "Cabin", value: tier.cabinBag },
          { icon: "🧳", label: "Check-in", value: tier.checkinBag },
          { icon: "💺", label: "Seat", value: tier.seatSelection },
          { icon: "🍽️", label: "Meals", value: tier.meals },
        ].map(({ icon, label, value }) => (
          <div key={label} className="text-center py-4 border-r border-slate-100 last:border-0">
            <div className="text-xl mb-1">{icon}</div>
            <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</div>
            <div className="text-[10px] font-bold text-slate-700">{value}</div>
          </div>
        ))}
      </div>

      {/* Fare name & price */}
      <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          Fare: <strong className="text-slate-700">{tier.name}</strong>
        </div>
        <div className="font-black text-blue-600 text-sm">{formatINR(tier.price)} <span className="text-slate-400 font-medium text-[10px]">/ adult</span></div>
      </div>
    </div>
  );
}