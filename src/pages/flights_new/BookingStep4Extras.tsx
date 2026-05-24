// ============================================================
//  BookingStep4Extras.tsx — Step 4: Meals & Baggage Add-ons
// ============================================================

import type { PassengerData, ExtraSelection, BookingFormState } from "./BookingShared";
import { SectionHeading} from "./BookingShared";
import {formatINR as _fmt } from "../../lib/flights_api"
import { formatINR } from "../../lib/flights_api";
import type { SSRResult } from "../../lib/flights_api";
import type { DisplayFlight } from "../../lib/types_t";




interface Step4Props {
  flight: DisplayFlight;      // ← ADD
  form: BookingFormState;
  paxTypes: ("Adult" | "Child" | "Infant")[];
  ssrDataPerLeg: (SSRResult | null)[];
legs: { label: string; flight: DisplayFlight }[];
  onChange: (form: BookingFormState) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BookingStep4Extras({flight, form, paxTypes, onChange, onNext, onBack , ssrDataPerLeg,legs}: Step4Props) {

const ssrData = ssrDataPerLeg?.[0] ?? null;
const meals = ssrData?.meals ?? [];
const baggage = ssrData?.baggage ?? [];
  function getExtra(paxIdx: number, legIdx = 0): ExtraSelection {
  return form.extras.find(e => e.legIndex === legIdx && e.passengerId === paxIdx) ?? {
    legIndex: legIdx, passengerId: paxIdx,
    mealCode: "NONE", mealLabel: "No meal", mealPrice: 0,
    baggageKg: 0, baggagePrice: 0,
  };
}


  function updateExtra(paxIdx: number, partial: Partial<ExtraSelection>) {
    const current = getExtra(paxIdx);
    const updated = [...form.extras];
    // ensure array is large enough
    while (updated.length <= paxIdx) updated.push(getExtra(updated.length));
    updated[paxIdx] = { ...current, ...partial };
    onChange({ ...form, extras: updated });
  }

  const totalExtras = form.passengers.reduce((sum, _, i) => {
    const e = getExtra(i);
    return sum + e.mealPrice + e.baggagePrice;
  }, 0);

  return (
    <div>
      <SectionHeading
        step="4"
        title="Meals & Baggage"
        desc="Add meals and extra baggage for each passenger. These can be skipped — you can add them later via the airline."
        accent="amber"
      />

      {/* Per-passenger extras */}
      {form.passengers.map((pax, i) => {
        if (paxTypes[i] === "Infant") return null; // infants don't get meals/bags
        const extra = getExtra(i);

        return (
          <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-5">
            {/* Pax header */}
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-100">
              <div className="w-8 h-8 rounded-2xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">{i + 1}</div>
              <div>
                <div className="font-black text-slate-900 text-sm">
                  {pax.firstName && pax.lastName ? `${pax.title} ${pax.firstName} ${pax.lastName}` : `Passenger ${i + 1}`}
                </div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{paxTypes[i]}</div>
              </div>
              {(extra.mealPrice + extra.baggagePrice) > 0 && (
                <div className="ml-auto text-xs font-black text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
                  +{formatINR(extra.mealPrice + extra.baggagePrice)}
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Meal selection */}
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
                        onClick={() => updateExtra(i, { mealCode: meal.code, mealLabel: meal.label, mealPrice: meal.price })}
                        className={`flex flex-col items-start p-3 rounded-2xl border-2 text-left transition-all ${
                          selected
                            ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                            : "border-slate-100 bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-xl mb-1.5">{meal.emoji}</span>
                        <div className={`text-xs font-bold ${selected ? "text-blue-700" : "text-slate-700"}`}>{meal.label}</div>
                        <div className="text-[10px] text-slate-400 mb-1">{meal.description}</div>
                        <div className={`text-[10px] font-black ${selected ? "text-blue-600" : "text-slate-500"}`}>
                          {meal.price === 0 ? "Free" : `+${formatINR(meal.price)}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Baggage selection */}
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
                        onClick={() => updateExtra(i, { baggageKg: opt.kg, baggagePrice: opt.price })}
                        className={`flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all min-w-[90px] ${
                          selected
                            ? "border-amber-500 bg-amber-50 shadow-md shadow-amber-100"
                            : "border-slate-100 bg-slate-50 hover:border-slate-300"
                        }`}
                      >
                        <div className={`text-sm font-black ${selected ? "text-amber-700" : "text-slate-700"}`}>{opt.label}</div>
                        <div className="text-[10px] text-slate-400 mb-0.5">{opt.description}</div>
                        <div className={`text-[10px] font-black ${selected ? "text-amber-600" : "text-slate-500"}`}>
                          {opt.price === 0 ? "Included" : `+${formatINR(opt.price)}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Extras total */}
      {totalExtras > 0 && (
        <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4 mb-4">
          <div>
            <div className="text-xs font-bold text-violet-700 uppercase tracking-widest">Total Extras</div>
            <div className="text-[10px] text-violet-500 mt-0.5">Meals + additional baggage for all passengers</div>
          </div>
          <div className="font-black text-violet-700 text-xl">{formatINR(totalExtras)}</div>
        </div>
      )}

      <div className="flex gap-3 mt-2">
        <button onClick={onBack} className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-sm hover:border-slate-300 hover:bg-white transition-all">
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