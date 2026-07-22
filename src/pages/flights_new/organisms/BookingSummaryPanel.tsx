// ============================================================
//  BookingSummaryPanel.tsx — standalone booking summary card
//  Keeps its own distinct visual identity (warm orange/red
//  gradient header) as an alternative to PriceSidebar's blue
//  sidebar — same fare engine underneath, different look, for
//  wherever a more compact/portable summary card is wanted
//  (e.g. a review-step recap, a modal, an expanded mobile view).
//
//  Previously this component read flight/passenger/seats/extras
//  from a `BookingContext` (useBooking()) that doesn't exist
//  anywhere else in this codebase. That's gone — every value
//  here now comes from the same real props (DisplayFlight,
//  FareTier, PassengerData[], SeatMap, ExtraSelection[]) and the
//  same calcFares()/useFareHoldTimer() used by PriceSidebar in
//  BookingShared.tsx, so the numbers always agree with the rest
//  of the flow.
// ============================================================

import { Check, Clock, Shield, Edit2 } from "lucide-react";
import { useCurrency } from "../../../context/currencyContext";
import type { DisplayFlight, FareTier } from "../../../lib/types_t";
import {
  type PassengerData,
  type SeatMap,
  type ExtraSelection,
  calcFares,
  collectSelectedSeatCodes,
  useFareHoldTimer,
  AirlineLogo,
} from "../../../pages/flights_new/BookingShared";

interface Props {
  flight: DisplayFlight;
  tier: FareTier;
  returnFlight?: DisplayFlight;
  returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  adults: number;
  children: number;
  infants: number;
  /** Coupon discount amount already validated elsewhere (CouponSection) */
  couponDiscount?: number;
  couponCode?: string;
  extras: ExtraSelection[];
  passengers?: PassengerData[];
  seatMaps?: Record<string, SeatMap>;
  /** Real fare-hold expiry timestamp (ms). Falls back to a 15-min hold from mount if omitted —
   *  pass the same value used elsewhere (e.g. BookingShell's holdExpiresAt) to keep every
   *  countdown on screen in sync. */
  fareHoldExpiresAt?: number;
  /** Optional — only renders the "Edit" button on the route pill if a real handler is given. */
  onEditFlight?: () => void;
}

export function BookingSummaryPanel({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  adults, children, infants,
  couponDiscount = 0, couponCode,
  extras, passengers, seatMaps,
  fareHoldExpiresAt,
  onEditFlight,
}: Props) {
  const { convert } = useCurrency();

  const { baseFares, subtotal, extrasTotal, seatsTotal, taxes, taxesIncluded, convenienceFeeDisplay } =
    calcFares({ tier, returnTier, multiCityLegs, adults, children, infants, extras, passengers, seatMaps });

  const total = Math.round(subtotal + extrasTotal + seatsTotal + taxes - couponDiscount);

  const travellers = adults + children + infants;
  const travelerLabel = `${travellers} Traveller${travellers > 1 ? "s" : ""}`;

  const lead = passengers?.[0];
  const passengerName = lead?.firstName
    ? `${lead.title} ${lead.firstName}${lead.lastName ? " " + lead.lastName : ""}`
    : null;

  const selectedSeatCodes = passengers ? collectSelectedSeatCodes(passengers) : [];
  const holdTimer = useFareHoldTimer(fareHoldExpiresAt);

  const isRoundTrip = !!returnFlight && !!returnTier;
  const isMultiCity = !!(multiCityLegs && multiCityLegs.length > 1);

  return (
    <div className="w-72 shrink-0 flex flex-col gap-3">
      {/* Header card */}
      <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg,#f97316 0%,#ea580c 55%,#dc2626 100%)' }}>
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-orange-100 tracking-widest uppercase">Booking Summary</span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Live
            </span>
          </div>
          <div className="text-4xl font-black text-white mb-0.5">{convert(total)}</div>
          <div className="text-[12px] text-orange-100">
            {travelerLabel} · All taxes included
          </div>
          {passengerName && (
            <div className="text-[11px] text-orange-200 mt-0.5">{passengerName}</div>
          )}
        </div>
        <div className="mx-3 mb-3 px-3 py-2.5 rounded-xl flex items-center gap-2.5" style={{ background: 'rgba(255,255,255,0.15)' }}>
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0 overflow-hidden">
            <AirlineLogo code={flight.airlineCode} size="sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-white font-bold text-sm">
              {flight.fromCode} <span className="text-orange-200">→</span> {flight.toCode}
              {(isRoundTrip || isMultiCity) && (
                <span className="text-[9px] font-black text-orange-100 uppercase tracking-wider bg-white/15 rounded px-1.5 py-0.5 ml-1">
                  {isRoundTrip ? "Outbound" : "Leg 1"}
                </span>
              )}
            </div>
            <div className="text-[11px] text-orange-100">{flight.departDate} · Non-stop</div>
          </div>
          {onEditFlight && (
            <button
              onClick={onEditFlight}
              className="flex items-center gap-1 text-[11px] text-orange-100 hover:text-white font-medium transition-colors"
            >
              <Edit2 size={10} /> Edit
            </button>
          )}
        </div>
        {isRoundTrip && returnFlight && (
          <div className="mx-3 mb-3 px-3 py-2.5 rounded-xl flex items-center gap-2.5" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0 overflow-hidden">
              <AirlineLogo code={returnFlight.airlineCode} size="sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-white font-bold text-sm">
                {returnFlight.fromCode} <span className="text-orange-200">→</span> {returnFlight.toCode}
                <span className="text-[9px] font-black text-orange-100 uppercase tracking-wider bg-white/15 rounded px-1.5 py-0.5 ml-1">
                  Return
                </span>
              </div>
              <div className="text-[11px] text-orange-100">{returnFlight.departDate} · Non-stop</div>
            </div>
          </div>
        )}
        {isMultiCity && multiCityLegs!.slice(1).map((leg, i) => (
          <div key={i} className="mx-3 mb-3 px-3 py-2.5 rounded-xl flex items-center gap-2.5" style={{ background: 'rgba(255,255,255,0.15)' }}>
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0 overflow-hidden">
              <AirlineLogo code={leg.flight.airlineCode} size="sm" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-white font-bold text-sm">
                {leg.flight.fromCode} <span className="text-orange-200">→</span> {leg.flight.toCode}
                <span className="text-[9px] font-black text-orange-100 uppercase tracking-wider bg-white/15 rounded px-1.5 py-0.5 ml-1">
                  Leg {i + 2}
                </span>
              </div>
              <div className="text-[11px] text-orange-100">{leg.flight.departDate} · Non-stop</div>
            </div>
          </div>
        ))}
      </div>

      {/* Price breakdown */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-2.5">
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-slate-600">Base Fare</span>
          <span className="font-semibold text-slate-800">{convert(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-slate-600">Taxes &amp; Fees</span>
          {taxesIncluded ? (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">INCLUDED</span>
          ) : (
            <span className="font-semibold text-slate-800">{convert(taxes)}</span>
          )}
        </div>
        <div className="flex items-center justify-between text-[13px]">
          <span className="text-slate-600">Convenience Fee</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 line-through text-[12px]">{convert(convenienceFeeDisplay)}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700">FREE</span>
          </div>
        </div>
        {couponDiscount > 0 && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-slate-600 flex items-center gap-1.5">
              Coupon Discount
              {couponCode && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 tracking-wide">
                  {couponCode}
                </span>
              )}
            </span>
            <span className="font-semibold text-green-600">- {convert(couponDiscount)}</span>
          </div>
        )}
        {seatsTotal > 0 && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-slate-600">Seat upgrades</span>
            <span className="font-semibold text-blue-600">+ {convert(seatsTotal)}</span>
          </div>
        )}
        {extrasTotal > 0 && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-slate-600">Extras</span>
            <span className="font-semibold text-slate-800">+ {convert(extrasTotal)}</span>
          </div>
        )}
        <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-800">Total Payable</span>
          <span className="text-xl font-black text-blue-600">{convert(total)}</span>
        </div>
      </div>

      {/* Price protected — real, ticking fare-hold countdown */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2.5 mb-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${holdTimer.expired ? "bg-red-100" : "bg-green-100"}`}>
            <Check size={15} className={holdTimer.expired ? "text-red-500" : "text-green-600"} strokeWidth={3} />
          </div>
          <div>
            <div className="text-[13px] font-bold text-slate-800">
              {holdTimer.expired ? "Your fare hold has expired" : "Your price is protected"}
            </div>
            <div className="text-[11px] text-slate-500">
              {holdTimer.expired ? "Please re-search to get current pricing." : "This fare is locked and guaranteed."}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-slate-500">{holdTimer.expired ? "Expired" : "Expires in"}</span>
          <span className={`flex items-center gap-1 font-bold tabular-nums ${holdTimer.urgent ? 'text-red-500' : 'text-green-600'}`}>
            <Clock size={12} /> {holdTimer.label}
          </span>
        </div>
      </div>

      {/* Selected extras */}
      {extras.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3">Your Extras</div>
          <div className="space-y-2 mb-3">
            {extras.map((extra, i) => (
              <div key={i} className="flex items-center justify-between text-[12px]">
                <span className="text-slate-600 flex items-center gap-1.5 min-w-0">
                  <span className="w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center shrink-0">
                    <Check size={9} className="text-white" strokeWidth={3} />
                  </span>
                  <span className="truncate">
                    {extra.mealLabel || extra.baggageLabel}
                    {extra.baggageKg > 0 ? ` · ${extra.baggageKg}kg` : ""}
                  </span>
                </span>
                <span className="font-semibold text-slate-800 shrink-0 ml-2">
                  {convert(extra.mealPrice + extra.baggagePrice)}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-[12px]">
            <span className="font-bold text-slate-600">Extras Total</span>
            <span className="font-black text-blue-600">
              {convert(extrasTotal)}
            </span>
          </div>
        </div>
      )}

      {/* Selected seats */}
      {selectedSeatCodes.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3">Your Seats</div>
          <div className="flex flex-wrap gap-2">
            {selectedSeatCodes.map((seat, i) => (
              <span
                key={`${seat}-${i}`}
                className="px-3 py-1.5 rounded-xl text-[13px] font-black"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', color: '#fff' }}
              >
                💺 {seat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* What's included */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3">What's Included</div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-2 text-slate-600"><span>🎒</span>Cabin Baggage</span>
            <span className="font-semibold text-slate-800">{tier.cabinBag}</span>
          </div>
          <div className="flex items-center justify-between text-[12px]">
            <span className="flex items-center gap-2 text-slate-600"><span>🧳</span>Check-in Baggage</span>
            <span className="font-semibold text-slate-800">{tier.checkinBag}</span>
          </div>
        </div>
      </div>

      {/* Secure booking */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <Shield size={16} className="text-blue-600" />
        </div>
        <div>
          <div className="text-[13px] font-bold text-slate-800 mb-0.5">Secure Booking</div>
          <div className="text-[11px] text-slate-500 leading-relaxed">Your data is safe with us. We use industry-standard encryption.</div>
        </div>
      </div>
    </div>
  );
}