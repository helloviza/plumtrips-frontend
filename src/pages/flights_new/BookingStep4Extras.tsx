// // ============================================================
// //  BookingStep4Extras.tsx — FIXED (v2: connecting-flight segments)
// //
// //  Previous fixes (kept):
// //  1. totalExtras iterates ssrDataPerLeg.length so it sums all legs.
// //  2. getExtra default object avoids reference identity issues.
// //  4. Leg tabs only render when legs.length > 1.
// //  5. No duplicate formatINR import.
// //
// //  NEW fixes (this pass):
// //  6. Meals & baggage are now sourced from
// //     ssrDataPerLeg[activeLeg].segments[activeSegment] instead of the
// //     leg's flattened top-level ssrData.meals/.baggage. Any leg with a
// //     stop (1-stop/2-stop) is actually MULTIPLE physical flight segments
// //     — each sold with its own meal/baggage menu — and the old flat
// //     lists silently mixed them together (or, after a prior fix
// //     upstream, just showed the first segment). A segment sub-tab now
// //     appears whenever the active leg has more than one segment.
// //  7. Every meal/baggage pick now records segmentIndex, origin,
// //     destination and flightNumber on the ExtraSelection, so the
// //     booking payload builder (BookingPage.tsx) can send the correct
// //     Origin/Destination/FlightNumber for TBO's MealDynamic/Baggage
// //     arrays instead of guessing from the leg's overall from/to codes
// //     (which don't match a connecting segment's own O&D).
// // ============================================================

// import type { PassengerData, ExtraSelection, BookingFormState } from "./BookingShared";
// import { SectionHeading } from "./BookingShared";
// import { formatINR } from "../../lib/flights_api";
// import type { SSRResult, SSRSegment } from "../../lib/flights_api";
// import type { DisplayFlight } from "../../lib/types_t";
// import { useState } from "react";
// import { useCurrency } from "../../context/currencyContext";

// // ─── PROPS ──────────────────────────────────────────────────

// interface Step4Props {
//   flight: DisplayFlight;
//   form: BookingFormState;
//   paxTypes: ("Adult" | "Child" | "Infant")[];
//   ssrDataPerLeg: (SSRResult | null)[]; // index matches legs array
//   legs: { label: string; flight: DisplayFlight }[]; // same order as ssrDataPerLeg
//   onChange: (form: BookingFormState) => void;
//   onNext: () => void;
//   onBack: () => void;
// }

// // ─── COMPONENT ──────────────────────────────────────────────

// export default function BookingStep4Extras({
//   flight,
//   form,
//   paxTypes,
//   onChange,
//   onNext,
//   onBack,
//   ssrDataPerLeg,
//   legs,
// }: Step4Props) {
//   // Active leg tab — defaults to 0 (outbound)
//   const [activeLeg, setActiveLeg] = useState(0);
//   // Active PHYSICAL SEGMENT within the leg — a 1-stop/2-stop leg has more
//   // than one, each sold with its own meal/baggage menu.
//   const [activeSegment, setActiveSegment] = useState(0);

//   // Segments for any leg. Falls back to a single pseudo-segment built
//   // from the top-level ssrData fields when `segments` isn't populated
//   // (e.g. still loading), so the UI always has at least one tab to draw.
//   function legSegments(legIdx: number): SSRSegment[] {
//     const ssr = ssrDataPerLeg?.[legIdx] ?? null;
//     if (ssr?.segments && ssr.segments.length > 0) return ssr.segments;
//     if (ssr) {
//       return [{
//         origin: legs[legIdx]?.flight.fromCode ?? "",
//         destination: legs[legIdx]?.flight.toCode ?? "",
//         flightNumber: legs[legIdx]?.flight.flightNumber ?? "",
//         airlineCode: legs[legIdx]?.flight.airlineCode ?? "",
//         seatMap: ssr.seatMap,
//         meals: ssr.meals,
//         baggage: ssr.baggage,
//         availability: ssr.availability ?? { seatMap: false, meals: false, baggage: false },
//       }];
//     }
//     return [];
//   }

//   function selectLeg(i: number) {
//     setActiveLeg(i);
//     setActiveSegment(0);
//   }

//   // FIX #1: Derive meals/baggage from the ACTIVE leg's ACTIVE SEGMENT.
//   // Previously this read ssrData.meals/.baggage directly, which for a
//   // 1-stop/2-stop leg silently collapsed to (at best) a mixed, undeduped
//   // list across every physical flight — there was no way to pick meals/
//   // baggage per segment, and no segment identity was kept to send back
//   // to TBO. Now each physical segment (flight) gets its own tab & menu.
//   const activeSegments = legSegments(activeLeg);
//   const activeSeg = activeSegments[activeSegment] ?? null;
//   const meals   = activeSeg?.meals   ?? [];
//   const baggage = activeSeg?.baggage ?? [];
//   const activeAirline = legs[activeLeg]?.flight.airline ?? flight.airline ?? "this airline";
//   const mealsUnavailableMessage =
//     activeSeg?.availability?.mealsMessage ??
//     `Meals are not available for this ${activeAirline} flight.`;
//   const baggageUnavailableMessage =
//     activeSeg?.availability?.baggageMessage ??
//     `Extra baggage is not available for this ${activeAirline} flight.`;

//   // ── Extras helpers ─────────────────────────────────────────

//   function getExtra(paxIdx: number, legIdx = activeLeg, segIdx = activeSegment): ExtraSelection {
//     const seg = legSegments(legIdx)[segIdx] ?? null;
//     return (
//       form.extras.find(
//         (e) => e.legIndex === legIdx && e.segmentIndex === segIdx && e.passengerId === paxIdx
//       ) ?? {
//         legIndex: legIdx,
//         segmentIndex: segIdx,
//         flightNumber: seg?.flightNumber,
//         passengerId: paxIdx,
//         mealCode: "NoMeal",
//         mealLabel: "No meal",
//         origin: seg?.origin ?? "",
//         destination: seg?.destination ?? "",
//         baggageLabel:"",
//         mealPrice: 0,
//         baggageCode: "NoBaggage",
//         baggageKg: 0,
//         baggagePrice: 0,
//       }
//     );
//   }

//   function updateExtra(
//     paxIdx: number,
//     partial: Partial<ExtraSelection>,
//     legIdx = activeLeg,
//     segIdx = activeSegment,
//   ) {
//     const current = getExtra(paxIdx, legIdx, segIdx);
//     const updated = form.extras.filter(
//       (e) => !(e.legIndex === legIdx && e.segmentIndex === segIdx && e.passengerId === paxIdx)
//     );
//     updated.push({ ...current, ...partial });
//     onChange({ ...form, extras: updated });
//   }

//   // FIX #2: Total extras sums across ALL legs AND ALL physical segments
//   // within each leg (a 1-stop/2-stop leg has more than one).
//   const legCount = Math.max(legs.length, ssrDataPerLeg.length, 1);
//   const totalExtras = form.passengers.reduce((sum, _, paxIdx) => {
//     let legTotal = 0;
//     for (let legIdx = 0; legIdx < legCount; legIdx++) {
//       const segCount = Math.max(legSegments(legIdx).length, 1);
//       for (let segIdx = 0; segIdx < segCount; segIdx++) {
//         const e = getExtra(paxIdx, legIdx, segIdx);
//         legTotal += e.mealPrice + e.baggagePrice;
//       }
//     }
//     return sum + legTotal;
//   }, 0);
//   const { convert } = useCurrency();

//   // ── RENDER ─────────────────────────────────────────────────

//   return (
//     <div>
//       <SectionHeading
//         step="4"
//         title="Meals & Baggage"
//         desc="Add meals and extra baggage for each passenger. These can be skipped — you can add them later via the airline."
//         accent="amber"
//       />

//       {/* Leg tabs — only shown for multi-leg trips */}
//       {legs.length > 1 && (
//         <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-none">
//           {legs.map((leg, i) => (
//             <button
//               key={i}
//               onClick={() => selectLeg(i)}
//               className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
//                 activeLeg === i
//                   ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
//                   : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
//               }`}
//             >
//               {leg.label}: {leg.flight.fromCode} → {leg.flight.toCode}
//               {/* FIX #3: show unavailable badge when EVERY segment of this leg lacks meals+baggage */}
//               {legSegments(i).every((seg) => !seg.availability.meals && !seg.availability.baggage) && (
//                 <span className="ml-1.5 text-[9px] text-amber-500 font-normal">
//                   unavailable
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* Segment tabs — only shown when the active leg has a stop.
//           Meals/baggage are sold PER PHYSICAL FLIGHT, so a 1-stop/2-stop
//           leg needs its own tab (and its own selection) per segment. */}
//       {activeSegments.length > 1 && (
//         <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-none">
//           {activeSegments.map((seg, i) => (
//             <button
//               key={i}
//               onClick={() => setActiveSegment(i)}
//               className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border ${
//                 activeSegment === i
//                   ? "bg-amber-500 text-white border-amber-500"
//                   : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"
//               }`}
//             >
//               Flight {i + 1}: {seg.origin} → {seg.destination}
//               {!seg.availability.meals && !seg.availability.baggage && (
//                 <span className="ml-1 text-[9px] text-amber-600 font-normal">
//                   unavailable
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* No SSR data for this leg/segment — show friendly notice */}
//       {activeSegments.length === 0 && legs.length > 1 && (
//         <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-5 flex items-start gap-3">
//           <span className="text-lg shrink-0">ℹ️</span>
//           <div>
//             <p className="text-sm font-semibold text-amber-800 mb-0.5">
//               Meals and extra baggage are not available for this {activeAirline} flight.
//             </p>
//             <p className="text-xs text-amber-600">
//               The airline did not provide add-on options for this flight.
//             </p>
//           </div>
//         </div>
//       )}

//       {/* Per-passenger extras */}
//       {form.passengers.map((pax, i) => {
//         // Infants don't get meal/baggage options
//         if (paxTypes[i] === "Infant") return null;

//         const extra = getExtra(i, activeLeg, activeSegment);
//         const hasExtras = extra.mealPrice + extra.baggagePrice > 0;

//         return (
//           <div key={i} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-5">
//             {/* Passenger header */}
//             <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 border-b border-slate-100">
//               <div className="w-8 h-8 rounded-2xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
//                 {i + 1}
//               </div>
//               <div>
//                 <div className="font-black text-slate-900 text-sm">
//                   {pax.firstName && pax.lastName
//                     ? `${pax.title} ${pax.firstName} ${pax.lastName}`
//                     : `Passenger ${i + 1}`}
//                 </div>
//                 <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
//                   {paxTypes[i]}
//                 </div>
//               </div>
//               {hasExtras && (
//                 <div className="ml-auto text-xs font-black text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
//                   +{convert(extra.mealPrice + extra.baggagePrice)}
//                 </div>
//               )}
//             </div>

//             <div className="p-6 space-y-6">
//               {/* ── Meal selection ─────────────────────────── */}
//               {meals.length > 0 ? (
//                 <div>
//                   <div className="flex items-center gap-2 mb-3">
//                     <span className="text-base">🍽️</span>
//                     <span className="font-bold text-slate-800 text-sm">Meal Preference</span>
//                   </div>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
//                     {meals.map((meal) => {
//                       const selected = extra.mealCode === meal.code;
//                       return (
//                         <button
//                           key={meal.code}
//                           onClick={() =>
//                             updateExtra(
//                               i,
//                               {
//                                 mealCode: meal.code,
//                                 mealLabel: meal.label,
//                                 mealPrice: meal.price,
//                                 origin: meal.origin || activeSeg?.origin || "",
//                                 destination: meal.destination || activeSeg?.destination || "",
//                                 segmentIndex: activeSegment,
//                                 flightNumber: meal.flightNumber ?? activeSeg?.flightNumber,
//                               },
//                               activeLeg,
//                               activeSegment,
//                             )
//                           }
//                           className={`flex flex-col items-start p-3 rounded-2xl border-2 text-left transition-all ${
//                             selected
//                               ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
//                               : "border-slate-100 bg-slate-50 hover:border-slate-300"
//                           }`}
//                         >
//                           <span className="text-xl mb-1.5">{meal.emoji}</span>
//                           <div className={`text-xs font-bold ${selected ? "text-blue-700" : "text-slate-700"}`}>
//                             {meal.label}
//                           </div>
//                           <div className="text-[10px] text-slate-400 mb-1">{meal.description}</div>
//                           <div className={`text-[10px] font-black ${selected ? "text-blue-600" : "text-slate-500"}`}>
//                             {meal.price === 0 ? "Free" : `+${convert(meal.price)}`}
//                           </div>
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ) : (
//                 /* No meals available for this leg */
//                 <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
//                   <span className="text-slate-300 text-xl">🍽️</span>
//                   <div>
//                     <p className="text-sm font-semibold text-slate-500">{mealsUnavailableMessage}</p>
//                     <p className="text-xs text-slate-400">The airline did not provide meal options for this flight.</p>
//                   </div>
//                 </div>
//               )}

//               {/* ── Baggage selection ──────────────────────── */}
//               {baggage.length > 0 ? (
//                 <div>
//                   <div className="flex items-center gap-2 mb-3">
//                     <span className="text-base">🧳</span>
//                     <span className="font-bold text-slate-800 text-sm">Extra Check-in Baggage</span>
//                   </div>
//                   <div className="flex flex-wrap gap-2">
//                     {baggage.map((opt) => {
//                       const selected = extra.baggageKg === opt.kg;
//                       return (
//                         <button
//                           key={opt.kg}
//                           onClick={() =>
//                             updateExtra(
//                               i,
//                               {
//                                 baggageCode: opt.code,
//                                 baggageKg: opt.kg,
//                                 baggagePrice: opt.price,
//                                 baggageLabel: opt.label,
//                                 origin: opt.origin || activeSeg?.origin || "",
//                                 destination: opt.destination || activeSeg?.destination || "",
//                                 segmentIndex: activeSegment,
//                                 flightNumber: opt.flightNumber ?? activeSeg?.flightNumber,
//                               },
//                               activeLeg,
//                               activeSegment,
//                             )
//                           }
//                           className={`flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all min-w-[90px] ${
//                             selected
//                               ? "border-amber-500 bg-amber-50 shadow-md shadow-amber-100"
//                               : "border-slate-100 bg-slate-50 hover:border-slate-300"
//                           }`}
//                         >
//                           <div className={`text-sm font-black ${selected ? "text-amber-700" : "text-slate-700"}`}>
//                             {opt.label}
//                           </div>
//                           <div className="text-[10px] text-slate-400 mb-0.5">{opt.description}</div>
//                           <div className={`text-[10px] font-black ${selected ? "text-amber-600" : "text-slate-500"}`}>
//                             {opt.price === 0 ? "Included" : `+${convert(opt.price)}`}
//                           </div>
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
//                   <span className="text-slate-300 text-xl">🧳</span>
//                   <div>
//                     <p className="text-sm font-semibold text-slate-500">{baggageUnavailableMessage}</p>
//                     <p className="text-xs text-slate-400">The airline did not provide extra baggage options for this flight.</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         );
//       })}

//       {/* Extras total */}
//       {totalExtras > 0 && (
//         <div className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4 mb-4">
//           <div>
//             <div className="text-xs font-bold text-violet-700 uppercase tracking-widest">Total Extras</div>
//             <div className="text-[10px] text-violet-500 mt-0.5">
//               Meals + additional baggage for all passengers · all legs & flights
//             </div>
//           </div>
//           <div className="font-black text-violet-700 text-xl">{convert(totalExtras)}</div>
//         </div>
//       )}

//       {/* Navigation */}
//       <div className="flex gap-3 mt-2">
//         <button
//           onClick={onBack}
//           className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-sm hover:border-slate-300 hover:bg-white transition-all"
//         >
//           ← Back
//         </button>
//         <button
//           onClick={onNext}
//           className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-blue-200"
//         >
//           Review Booking →
//         </button>
//       </div>
//     </div>
//   );
// }


// ============================================================
//  BookingStep4Extras.tsx — FIXED (v2: connecting-flight segments)
//  UI refreshed to match the Extras page visual language.
//  All frontend/backend logic below is UNCHANGED from the source —
//  only JSX/markup/styling was touched.
//
//  Previous fixes (kept):
//  1. totalExtras iterates ssrDataPerLeg.length so it sums all legs.
//  2. getExtra default object avoids reference identity issues.
//  4. Leg tabs only render when legs.length > 1.
//  5. No duplicate formatINR import.
//
//  NEW fixes (this pass):
//  6. Meals & baggage are now sourced from
//     ssrDataPerLeg[activeLeg].segments[activeSegment] instead of the
//     leg's flattened top-level ssrData.meals/.baggage. Any leg with a
//     stop (1-stop/2-stop) is actually MULTIPLE physical flight segments
//     — each sold with its own meal/baggage menu — and the old flat
//     lists silently mixed them together (or, after a prior fix
//     upstream, just showed the first segment). A segment sub-tab now
//     appears whenever the active leg has more than one segment.
//  7. Every meal/baggage pick now records segmentIndex, origin,
//     destination and flightNumber on the ExtraSelection, so the
//     booking payload builder (BookingPage.tsx) can send the correct
//     Origin/Destination/FlightNumber for TBO's MealDynamic/Baggage
//     arrays instead of guessing from the leg's overall from/to codes
//     (which don't match a connecting segment's own O&D).
// ============================================================

import type { PassengerData, ExtraSelection, BookingFormState } from "./BookingShared";
import { SectionHeading } from "./BookingShared";
import { formatINR } from "../../lib/flights_api";
import type { SSRResult, SSRSegment } from "../../lib/flights_api";
import type { DisplayFlight } from "../../lib/types_t";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Utensils, Luggage } from "lucide-react";
import { useCurrency } from "../../context/currencyContext";

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
  // Active PHYSICAL SEGMENT within the leg — a 1-stop/2-stop leg has more
  // than one, each sold with its own meal/baggage menu.
  const [activeSegment, setActiveSegment] = useState(0);

  // Segments for any leg. Falls back to a single pseudo-segment built
  // from the top-level ssrData fields when `segments` isn't populated
  // (e.g. still loading), so the UI always has at least one tab to draw.
  function legSegments(legIdx: number): SSRSegment[] {
    const ssr = ssrDataPerLeg?.[legIdx] ?? null;
    if (ssr?.segments && ssr.segments.length > 0) return ssr.segments;
    if (ssr) {
      return [{
        origin: legs[legIdx]?.flight.fromCode ?? "",
        destination: legs[legIdx]?.flight.toCode ?? "",
        flightNumber: legs[legIdx]?.flight.flightNumber ?? "",
        airlineCode: legs[legIdx]?.flight.airlineCode ?? "",
        seatMap: ssr.seatMap,
        meals: ssr.meals,
        baggage: ssr.baggage,
        availability: ssr.availability ?? { seatMap: false, meals: false, baggage: false },
      }];
    }
    return [];
  }

  function selectLeg(i: number) {
    setActiveLeg(i);
    setActiveSegment(0);
  }

  // FIX #1: Derive meals/baggage from the ACTIVE leg's ACTIVE SEGMENT.
  // Previously this read ssrData.meals/.baggage directly, which for a
  // 1-stop/2-stop leg silently collapsed to (at best) a mixed, undeduped
  // list across every physical flight — there was no way to pick meals/
  // baggage per segment, and no segment identity was kept to send back
  // to TBO. Now each physical segment (flight) gets its own tab & menu.
  const activeSegments = legSegments(activeLeg);
  const activeSeg = activeSegments[activeSegment] ?? null;
  const meals   = activeSeg?.meals   ?? [];
  const baggage = activeSeg?.baggage ?? [];
  const activeAirline = legs[activeLeg]?.flight.airline ?? flight.airline ?? "this airline";
  const mealsUnavailableMessage =
    activeSeg?.availability?.mealsMessage ??
    `Meals are not available for this ${activeAirline} flight.`;
  const baggageUnavailableMessage =
    activeSeg?.availability?.baggageMessage ??
    `Extra baggage is not available for this ${activeAirline} flight.`;

  // ── Extras helpers ─────────────────────────────────────────

  function getExtra(paxIdx: number, legIdx = activeLeg, segIdx = activeSegment): ExtraSelection {
    const seg = legSegments(legIdx)[segIdx] ?? null;
    return (
      form.extras.find(
        (e) => e.legIndex === legIdx && e.segmentIndex === segIdx && e.passengerId === paxIdx
      ) ?? {
        legIndex: legIdx,
        segmentIndex: segIdx,
        flightNumber: seg?.flightNumber,
        passengerId: paxIdx,
        mealCode: "NoMeal",
        mealLabel: "No meal",
        origin: seg?.origin ?? "",
        destination: seg?.destination ?? "",
        baggageLabel:"",
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
    legIdx = activeLeg,
    segIdx = activeSegment,
  ) {
    const current = getExtra(paxIdx, legIdx, segIdx);
    const updated = form.extras.filter(
      (e) => !(e.legIndex === legIdx && e.segmentIndex === segIdx && e.passengerId === paxIdx)
    );
    updated.push({ ...current, ...partial });
    onChange({ ...form, extras: updated });
  }

  // FIX #2: Total extras sums across ALL legs AND ALL physical segments
  // within each leg (a 1-stop/2-stop leg has more than one).
  const legCount = Math.max(legs.length, ssrDataPerLeg.length, 1);
  const totalExtras = form.passengers.reduce((sum, _, paxIdx) => {
    let legTotal = 0;
    for (let legIdx = 0; legIdx < legCount; legIdx++) {
      const segCount = Math.max(legSegments(legIdx).length, 1);
      for (let segIdx = 0; segIdx < segCount; segIdx++) {
        const e = getExtra(paxIdx, legIdx, segIdx);
        legTotal += e.mealPrice + e.baggagePrice;
      }
    }
    return sum + legTotal;
  }, 0);
  const { convert } = useCurrency();

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
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-none">
          {legs.map((leg, i) => (
            <button
              key={i}
              onClick={() => selectLeg(i)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all border ${
                activeLeg === i
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
              }`}
            >
              {leg.label}: {leg.flight.fromCode} → {leg.flight.toCode}
              {/* FIX #3: show unavailable badge when EVERY segment of this leg lacks meals+baggage */}
              {legSegments(i).every((seg) => !seg.availability.meals && !seg.availability.baggage) && (
                <span className="ml-1.5 text-[9px] text-amber-500 font-normal">
                  unavailable
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Segment tabs — only shown when the active leg has a stop.
          Meals/baggage are sold PER PHYSICAL FLIGHT, so a 1-stop/2-stop
          leg needs its own tab (and its own selection) per segment. */}
      {activeSegments.length > 1 && (
        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-none">
          {activeSegments.map((seg, i) => (
            <button
              key={i}
              onClick={() => setActiveSegment(i)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border ${
                activeSegment === i
                  ? "bg-amber-500 text-white border-amber-500"
                  : "bg-white text-slate-600 border-slate-200 hover:border-amber-300"
              }`}
            >
              Flight {i + 1}: {seg.origin} → {seg.destination}
              {!seg.availability.meals && !seg.availability.baggage && (
                <span className="ml-1 text-[9px] text-amber-600 font-normal">
                  unavailable
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* No SSR data for this leg/segment — show friendly notice */}
      {activeSegments.length === 0 && legs.length > 1 && (
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

        const extra = getExtra(i, activeLeg, activeSegment);
        const hasExtras = extra.mealPrice + extra.baggagePrice > 0;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-5"
          >
            {/* Passenger header */}
            <div
              className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100"
              style={{ background: "linear-gradient(90deg,#f8faff,#fff)" }}
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center shrink-0">
                {i + 1}
              </div>
              <div>
                <div className="text-[13px] font-bold text-slate-800">
                  {pax.firstName && pax.lastName
                    ? `${pax.title} ${pax.firstName} ${pax.lastName}`
                    : `Passenger ${i + 1}`}
                </div>
                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                  {paxTypes[i]}
                </div>
              </div>
              {hasExtras && (
                <div className="ml-auto text-[11px] font-black text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
                  +{convert(extra.mealPrice + extra.baggagePrice)}
                </div>
              )}
            </div>

            <div className="p-5 space-y-5">
              {/* ── Meal selection ─────────────────────────── */}
              {meals.length > 0 ? (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-base">🍽️</span>
                    <span className="text-[13px] font-bold text-slate-700">Meal Preference</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {meals.map((meal) => {
                      const selected = extra.mealCode === meal.code;
                      return (
                        <ExtraOptionCard
                          key={meal.code}
                          icon={<Utensils size={17} />}
                          label={meal.label}
                          description={meal.description}
                          priceLabel={meal.price === 0 ? "Free" : `+${convert(meal.price)}`}
                          selected={selected}
                          onToggle={() =>
                            updateExtra(
                              i,
                              {
                                mealCode: meal.code,
                                mealLabel: meal.label,
                                mealPrice: meal.price,
                                origin: meal.origin || activeSeg?.origin || "",
                                destination: meal.destination || activeSeg?.destination || "",
                                segmentIndex: activeSegment,
                                flightNumber: meal.flightNumber ?? activeSeg?.flightNumber,
                              },
                              activeLeg,
                              activeSegment,
                            )
                          }
                          leadingEmoji={meal.emoji}
                        />
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
                    <span className="text-[13px] font-bold text-slate-700">Extra Check-in Baggage</span>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    {baggage.map((opt) => {
                      const selected = extra.baggageKg === opt.kg;
                      return (
                        <ExtraOptionCard
                          key={opt.kg}
                          icon={<Luggage size={17} />}
                          label={opt.label}
                          description={opt.description}
                          priceLabel={opt.price === 0 ? "Included" : `+${convert(opt.price)}`}
                          selected={selected}
                          accent="amber"
                          onToggle={() =>
                            updateExtra(
                              i,
                              {
                                baggageCode: opt.code,
                                baggageKg: opt.kg,
                                baggagePrice: opt.price,
                                baggageLabel: opt.label,
                                origin: opt.origin || activeSeg?.origin || "",
                                destination: opt.destination || activeSeg?.destination || "",
                                segmentIndex: activeSegment,
                                flightNumber: opt.flightNumber ?? activeSeg?.flightNumber,
                              },
                              activeLeg,
                              activeSegment,
                            )
                          }
                        />
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
          </motion.div>
        );
      })}

      {/* Extras total */}
      <AnimatePresence>
        {totalExtras > 0 && (
          <motion.div
            key="extras-total"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            className="flex items-center justify-between bg-violet-50 border border-violet-200 rounded-2xl px-5 py-4 mb-4"
          >
            <div>
              <div className="text-[11px] font-bold text-violet-700 uppercase tracking-widest">Total Extras</div>
              <div className="text-[10px] text-violet-500 mt-0.5">
                Meals + additional baggage for all passengers · all legs & flights
              </div>
            </div>
            <div className="font-black text-violet-700 text-xl">{convert(totalExtras)}</div>
          </motion.div>
        )}
      </AnimatePresence>

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
          className="flex-[2] flex items-center justify-center gap-2 text-white font-black py-3.5 rounded-2xl text-sm shadow-lg shadow-blue-200 hover:opacity-95 active:scale-[0.99] transition-all"
          style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
        >
          Review Booking
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── EXTRA OPTION CARD (meal / baggage row) ───────────────────
// Presentational only — mirrors the Extras.tsx `ExtraCard` look.
// Does not read or write any state itself; the parent's onToggle
// carries out the exact same updateExtra(...) call as before.

function ExtraOptionCard({
  icon,
  leadingEmoji,
  label,
  description,
  priceLabel,
  selected,
  onToggle,
  accent = "blue",
}: {
  icon: React.ReactNode;
  leadingEmoji?: string;
  label: string;
  description?: string;
  priceLabel: string;
  selected: boolean;
  onToggle: () => void;
  accent?: "blue" | "amber";
}) {
  const accentColor = accent === "amber" ? "#f59e0b" : "#2563eb";
  const accentBg = accent === "amber"
    ? "linear-gradient(135deg,#fffbeb,#fff7ed)"
    : "linear-gradient(135deg,#eff6ff,#eef2ff)";
  const accentText = accent === "amber" ? "text-amber-700" : "text-blue-700";
  const priceText = accent === "amber" ? "text-amber-600" : "text-blue-600";

  return (
    <motion.button
      type="button"
      layout
      onClick={onToggle}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left rounded-2xl border transition-all duration-200 p-3.5 flex items-center gap-3"
      style={
        selected
          ? { background: accentBg, borderColor: accentColor, boxShadow: `0 0 0 2px ${accentColor}33` }
          : { background: "#fff", borderColor: "#e2e8f0" }
      }
    >
      {/* Icon bubble */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors"
        style={selected ? { background: accentColor, color: "#fff" } : { background: "#f1f5f9", color: "#64748b" }}
      >
        {leadingEmoji ? <span className="text-base">{leadingEmoji}</span> : icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className={`text-[13px] font-bold ${selected ? accentText : "text-slate-800"}`}>{label}</div>
        {description && <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{description}</p>}
      </div>

      {/* Price + toggle */}
      <div className="shrink-0 flex items-center gap-2.5">
        <span className={`text-[13px] font-black ${selected ? priceText : "text-slate-500"}`}>{priceLabel}</span>
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors"
          style={selected ? { background: accentColor, borderColor: accentColor, color: "#fff" } : { background: "#fff", borderColor: "#cbd5e1", color: "#94a3b8" }}
        >
          {selected ? <Check size={12} strokeWidth={3} /> : <Plus size={12} strokeWidth={2.5} />}
        </div>
      </div>
    </motion.button>
  );
}