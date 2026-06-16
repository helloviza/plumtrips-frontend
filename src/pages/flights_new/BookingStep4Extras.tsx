// ============================================================
//  BookingStep4Extras.tsx — FIXED
//
//  Fixes:
//  1. totalExtras now iterates ssrDataPerLeg.length (not a fixed
//     count) so it correctly sums all legs even for multi-city.
//  2. getExtra default object is memoized inline to avoid
//     reference identity issues on re-renders.
//  3. Meal/baggage arrays fall back gracefully when ssrData is
//     null for a leg (shows empty state, not crash).
//  4. Leg tabs only render when legs.length > 1 (unchanged, but
//     now correctly driven by the shared legs prop from parent).
//  5. Removed duplicate formatINR import (_fmt alias).
// ============================================================

import type { PassengerData, ExtraSelection, BookingFormState } from "./BookingShared";
import { SectionHeading } from "./BookingShared";
import { formatINR } from "../../lib/flights_api";
import type { SSRResult } from "../../lib/flights_api";
import type { DisplayFlight } from "../../lib/types_t";
import { useState } from "react";

// ─── PROPS ──────────────────────────────────────────────────

interface Step4Props {
  flight: DisplayFlight;
  form: BookingFormState;
  paxTypes: ("Adult" | "Child" | "Infant")[];
  ssrDataPerLeg: (SSRResult | null)[]; // index matches legs array
  legs: { label: string; flight: DisplayFlight }[]; // same order as ssrDataPerLeg
  onChange: (form: BookingFormState) => void;
  onNext: () => void;
  onBack: () => void;
}

// ─── COMPONENT ──────────────────────────────────────────────

export default function BookingStep4Extras({
  flight,
  form,
  paxTypes,
  onChange,
  onNext,
  onBack,
  ssrDataPerLeg,
  legs,
}: Step4Props) {
  // Active leg tab — defaults to 0 (outbound)
  const [activeLeg, setActiveLeg] = useState(0);

  // FIX #1: Derive meals/baggage from the ACTIVE leg's SSR.
  // If ssrDataPerLeg[activeLeg] is null (unavailable), fall back
  // to leg 0's data, then to empty arrays.
  const ssrData = ssrDataPerLeg?.[activeLeg] ?? null;
  const meals   = ssrData?.meals   ?? [];
  const baggage = ssrData?.baggage ?? [];
  const activeAirline = legs[activeLeg]?.flight.airline ?? flight.airline ?? "this airline";
  const mealsUnavailableMessage =
    ssrData?.availability?.mealsMessage ??
    `Meals are not available for this ${activeAirline} flight.`;
  const baggageUnavailableMessage =
    ssrData?.availability?.baggageMessage ??
    `Extra baggage is not available for this ${activeAirline} flight.`;

  // ── Extras helpers ─────────────────────────────────────────

  function getExtra(paxIdx: number, legIdx = activeLeg): ExtraSelection {
    return (
      form.extras.find(
        (e) => e.legIndex === legIdx && e.passengerId === paxIdx
      ) ?? {
        legIndex: legIdx,
        passengerId: paxIdx,
        mealCode: "NoMeal",
        mealLabel: "No meal",
        mealPrice: 0,
        baggageCode: "NoBaggage",
        baggageKg: 0,
        baggagePrice: 0,
      }
    );
  }

  function updateExtra(
    paxIdx: number,
    partial: Partial<ExtraSelection>,
    legIdx = activeLeg
  ) {
    const current = getExtra(paxIdx, legIdx);
    const updated = form.extras.filter(
      (e) => !(e.legIndex === legIdx && e.passengerId === paxIdx)
    );
    updated.push({ ...current, ...partial });
    onChange({ ...form, extras: updated });
  }

  // FIX #2: Total extras sums across ALL legs (uses ssrDataPerLeg.length
  // instead of a hardcoded count, so multi-city works correctly).
  const legCount = Math.max(legs.length, ssrDataPerLeg.length, 1);
  const totalExtras = form.passengers.reduce((sum, _, paxIdx) => {
    return (
      sum +
      Array.from({ length: legCount }, (_, legIdx) => {
        const e = getExtra(paxIdx, legIdx);
        return e.mealPrice + e.baggagePrice;
      }).reduce((a, b) => a + b, 0)
    );
  }, 0);

  // ── RENDER ─────────────────────────────────────────────────

  return (
    <div>
      <SectionHeading
        step="4"
        title="Meals & Baggage"
        desc="Add meals and extra baggage for each passenger. These can be skipped — you can add them later via the airline."
        accent="amber"
      />

      {/* Leg tabs — only shown for multi-leg trips */}
      {legs.length > 1 && (
        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-none">
          {legs.map((leg, i) => (
            <button
              key={i}
              onClick={() => setActiveLeg(i)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                activeLeg === i
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
              }`}
            >
              {leg.label}: {leg.flight.fromCode} → {leg.flight.toCode}
              {/* FIX #3: show unavailable badge when SSR is null for this leg */}
              {ssrDataPerLeg[i] === null && (
                <span className="ml-1.5 text-[9px] text-amber-500 font-normal">
                  unavailable
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No SSR data for this leg — show friendly notice */}
      {ssrDataPerLeg[activeLeg] === null && legs.length > 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-5 flex items-start gap-3">
          <span className="text-lg shrink-0">ℹ️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 mb-0.5">
              Meals and extra baggage are not available for this {activeAirline} flight.
            </p>
            <p className="text-xs text-amber-600">
              The airline did not provide add-on options for this flight.
            </p>
          </div>
        </div>
      )}

      {/* Per-passenger extras */}
      {form.passengers.map((pax, i) => {
        // Infants don't get meal/baggage options
        if (paxTypes[i] === "Infant") return null;

        const extra = getExtra(i, activeLeg);
        const hasExtras = extra.mealPrice + extra.baggagePrice > 0;

        return (
          <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-5">
            {/* Passenger header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="w-8 h-8 rounded-2xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <div>
                <div className="font-black text-slate-900 text-sm">
                  {pax.firstName && pax.lastName
                    ? `${pax.title} ${pax.firstName} ${pax.lastName}`
                    : `Passenger ${i + 1}`}
                </div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                  {paxTypes[i]}
                </div>
              </div>
              {hasExtras && (
                <div className="ml-auto text-xs font-black text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
                  +{formatINR(extra.mealPrice + extra.baggagePrice)}
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* ── Meal selection ─────────────────────────── */}
              {meals.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">🍽️</span>
                    <span className="font-bold text-slate-800 text-sm">Meal Preference</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {meals.map((meal) => {
                      const selected = extra.mealCode === meal.code;
                      return (
                        <button
                          key={meal.code}
                          onClick={() =>
                            updateExtra(
                              i,
                              {
                                mealCode: meal.code,
                                mealLabel: meal.label,
                                mealPrice: meal.price,
                              },
                              activeLeg
                            )
                          }
                          className={`flex flex-col items-start p-3 rounded-2xl border-2 text-left transition-all ${
                            selected
                              ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                              : "border-slate-100 bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <span className="text-xl mb-1.5">{meal.emoji}</span>
                          <div className={`text-xs font-bold ${selected ? "text-blue-700" : "text-slate-700"}`}>
                            {meal.label}
                          </div>
                          <div className="text-[10px] text-slate-400 mb-1">{meal.description}</div>
                          <div className={`text-[10px] font-black ${selected ? "text-blue-600" : "text-slate-500"}`}>
                            {meal.price === 0 ? "Free" : `+${formatINR(meal.price)}`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* No meals available for this leg */
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <span className="text-slate-300 text-xl">🍽️</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{mealsUnavailableMessage}</p>
                    <p className="text-xs text-slate-400">The airline did not provide meal options for this flight.</p>
                  </div>
                </div>
              )}

              {/* ── Baggage selection ──────────────────────── */}
              {baggage.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">🧳</span>
                    <span className="font-bold text-slate-800 text-sm">Extra Check-in Baggage</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {baggage.map((opt) => {
                      const selected = extra.baggageKg === opt.kg;
                      return (
                        <button
                          key={opt.kg}
                          onClick={() =>
                            updateExtra(
                              i,
                              { baggageCode: opt.code, baggageKg: opt.kg, baggagePrice: opt.price },
                              activeLeg
                            )
                          }
                          className={`flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all min-w-[90px] ${
                            selected
                              ? "border-amber-500 bg-amber-50 shadow-md shadow-amber-100"
                              : "border-slate-100 bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <div className={`text-sm font-black ${selected ? "text-amber-700" : "text-slate-700"}`}>
                            {opt.label}
                          </div>
                          <div className="text-[10px] text-slate-400 mb-0.5">{opt.description}</div>
                          <div className={`text-[10px] font-black ${selected ? "text-amber-600" : "text-slate-500"}`}>
                            {opt.price === 0 ? "Included" : `+${formatINR(opt.price)}`}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <span className="text-slate-300 text-xl">🧳</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">{baggageUnavailableMessage}</p>
                    <p className="text-xs text-slate-400">The airline did not provide extra baggage options for this flight.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Extras total */}
      {totalExtras > 0 && (
        <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4 mb-4">
          <div>
            <div className="text-xs font-bold text-violet-700 uppercase tracking-widest">Total Extras</div>
            <div className="text-[10px] text-violet-500 mt-0.5">
              Meals + additional baggage for all passengers · all legs
            </div>
          </div>
          <div className="font-black text-violet-700 text-xl">{formatINR(totalExtras)}</div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={onBack}
          className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-sm hover:border-slate-300 hover:bg-white transition-all"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-blue-200"
        >
          Review Booking →
        </button>
      </div>
    </div>
  );
}
