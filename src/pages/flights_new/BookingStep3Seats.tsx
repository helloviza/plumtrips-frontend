// // ============================================================
// //  BookingStep3Seats.tsx — FIXED
// //
// //  Fixes:
// //  1. handleContinue now writes ALL leg seat selections into
// //     passenger.selectedSeats (Record<legIdx, seatCode>) AND
// //     sets selectedSeat (leg 0) for backwards compatibility.
// //  2. Props use ssrDataPerLeg (array) consistently.
// //  3. seatMaps derived per-leg from ssrDataPerLeg[i].
// //  4. legs array memoized to avoid useMemo dependency loop.
// //  5. Premium note reads from current active leg's SSR.
// //  6. Aircraft-style seat map UI preserved from previous version.
// // ============================================================

// import { useState, useMemo, useEffect } from "react";
// import type { DisplayFlight, FareTier } from "../../lib/types_t";
// import type { PassengerData, SeatMap } from "./BookingShared";
// import { SectionHeading, AIRLINE_COLORS } from "./BookingShared";
// import type { SSRResult, SSRSegment } from "../../lib/flights_api";

// // ─── PROPS ──────────────────────────────────────────────────

// interface Step3Props {
//   flight: DisplayFlight;
//   tier: FareTier;
//   passengers: PassengerData[];
//   paxTypes: ("Adult" | "Child" | "Infant")[];
//   multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
//   returnFlight?: DisplayFlight;
//   isRoundTrip: boolean;
//   isMultiCity: boolean;
//   ssrDataPerLeg: (SSRResult | null)[]; // one entry per leg, in leg order
//   ssrLoading: boolean;
//   onChange: (passengers: PassengerData[]) => void;
//   onNext: () => void;
//   onBack: () => void;
//   onSeatMapsResolved?: (maps: Record<number, SeatMap>) => void;
//   returnTier?: FareTier;
// }

// // ─── HELPERS ────────────────────────────────────────────────

// function ssrToSeatMap(apiMap: SSRResult["seatMap"] | null | undefined): SeatMap | null {
//   if (!apiMap || !apiMap.rows || apiMap.rows.length === 0) return null;

//   const occupied = apiMap.rows.flatMap((r) =>
//     r.seats.filter((s) => s.isOccupied).map((s) => s.code)
//   );
//   const premium = apiMap.rows.flatMap((r) =>
//     r.seats.filter((s) => s.isPremium).map((s) => s.code)
//   );
//   const prices: Record<string, number> = Object.fromEntries(
//     apiMap.rows.flatMap((r) => r.seats.map((s) => [s.code, s.price]))
//   );

//   const types: Record<string, "Window" | "Middle" | "Aisle"> = {};
//   const aisleAfterIndex =
//     apiMap.cols.length > 4
//       ? Math.floor(apiMap.cols.length / 2)
//       : Math.ceil(apiMap.cols.length / 2);

//   apiMap.cols.forEach((col, ci) => {
//     types[col] =
//       ci === 0 || ci === apiMap.cols.length - 1
//         ? "Window"
//         : ci === aisleAfterIndex - 1 || ci === aisleAfterIndex
//         ? "Aisle"
//         : "Middle";
//   });

//   return {
//     rows: apiMap.totalRows,
//     cols: apiMap.cols,
//     occupied,
//     premium,
//     prices,
//     types,
//   };
// }

// // ─── COMPONENT ──────────────────────────────────────────────

// export default function BookingStep3Seats({
//   flight,
//   tier,
//   passengers,
//   paxTypes,
//   multiCityLegs,
//   returnFlight,
//   isRoundTrip,
//   isMultiCity,
//   ssrDataPerLeg,
//   ssrLoading,
//   onChange,
//   onNext,
//   onBack,
//   onSeatMapsResolved,
//   returnTier,
// }: Step3Props) {
//   const [activeLeg, setActiveLeg] = useState(0);
//   const [activeSegment, setActiveSegment] = useState(0);
//   const [activePax, setActivePax] = useState(0);

//   // ── Leg definitions (memoized) ─────────────────────────────
//   const legs = useMemo(
//     () => [
//       {
//         flight,
//         tier,
//         label: isRoundTrip ? "Outbound" : isMultiCity ? "Leg 1" : "Seat Map",
//       },
      

// // In legs useMemo, change:
// ...(isRoundTrip && returnFlight
//   ? [{ flight: returnFlight, tier: returnTier ?? tier, label: "Return" }]
//   : []),
//       ...(isMultiCity
//         ? (multiCityLegs ?? []).slice(1).map((l, i) => ({
//             ...l,
//             label: `Leg ${i + 2}`,
//           }))
//         : []),
//     ],
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     [
//       flight.resultIndex,
//       returnFlight?.resultIndex,
//       isRoundTrip,
//       isMultiCity,
//       multiCityLegs?.length,
//     ]
//   );

//   // ── Physical segments per leg ───────────────────────────────
//   // A leg with stops (1-stop/2-stop) has MULTIPLE physical flight
//   // segments, each with its own seat map. ssrDataPerLeg[i].segments now
//   // carries all of them (see flights_api.ts parseTBOSSR fix); fall back
//   // to a single pseudo-segment built from the top-level fields so a leg
//   // whose SSR hasn't resolved yet (or a direct flight with the old
//   // shape) still renders one tab instead of zero.
//   function legSegments(legIdx: number): SSRSegment[] {
//     const ssr = ssrDataPerLeg[legIdx];
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

//   // Reset the segment tab whenever the leg tab changes.
//   function selectLeg(i: number) {
//     setActiveLeg(i);
//     setActiveSegment(0);
//     setActivePax(0);
//   }

//   // ── One SeatMap entry per (leg, segment) ────────────────────
//   const seatMapsByKey: Record<string, SeatMap | null> = useMemo(() => {
//     const out: Record<string, SeatMap | null> = {};
//     legs.forEach((_, legIdx) => {
//       const segs = legSegments(legIdx);
//       const segCount = Math.max(segs.length, 1);
//       for (let segIdx = 0; segIdx < segCount; segIdx++) {
//         out[`${legIdx}:${segIdx}`] = ssrToSeatMap(segs[segIdx]?.seatMap ?? null);
//       }
//     });
//     return out;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [legs, ssrDataPerLeg]);

//   // ── Seat selections keyed as "legIdx:segIdx-paxIdx" ──────────
//   // Pre-populate from existing passenger.selectedSeats if available
//   const [selections, setSelections] = useState<Record<string, string>>(() => {
//     const initial: Record<string, string> = {};
//     passengers.forEach((p, paxIdx) => {
//       // Restore from selectedSeats (multi-leg, multi-segment) map
//       if (p.selectedSeats) {
//         Object.entries(p.selectedSeats).forEach(([legSegKey, seat]) => {
//           if (seat) initial[`${legSegKey}-${paxIdx}`] = seat;
//         });
//       } else if (p.selectedSeat) {
//         // Fallback: selectedSeat is leg-0/segment-0 only
//         initial[`0:0-${paxIdx}`] = p.selectedSeat;
//       }
//     });
//     return initial;
//   });

//   function seatKey(legIdx: number, segIdx: number, paxIdx: number) {
//     return `${legIdx}:${segIdx}-${paxIdx}`;
//   }

//   // ── LIVE SYNC TO PARENT (for PriceSidebar) ─────────────────
//   // Previously these only fired inside handleContinue, so the
//   // sidebar total only updated after tapping "Continue" and moving
//   // to Step 4. Now both are pushed up as soon as they change, so
//   // the price updates on every seat tap.

//   // Push resolved seat maps (prices/occupancy) up as soon as SSR
//   // data is available — the sidebar needs this to price selections.
//   useEffect(() => {
//     const mapsRecord: Record<string, SeatMap> = {};
//     Object.entries(seatMapsByKey).forEach(([key, map]) => { if (map) mapsRecord[key] = map; });
//     onSeatMapsResolved?.(mapsRecord);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [seatMapsByKey]);

//   // Push current seat selections into passenger data on every tap,
//   // instead of only when handleContinue runs.
//   useEffect(() => {
//     const updated = passengers.map((p, paxIdx) => {
//       const selectedSeats: Record<string, string> = {};
//       Object.keys(seatMapsByKey).forEach((legSegKey) => {
//         const [legIdxStr, segIdxStr] = legSegKey.split(":");
//         const seat = selections[seatKey(Number(legIdxStr), Number(segIdxStr), paxIdx)];
//         if (seat) selectedSeats[legSegKey] = seat;
//       });

//       return {
//         ...p,
//         selectedSeat: selectedSeats["0:0"] ?? p.selectedSeat,
//         selectedSeats:
//           Object.keys(selectedSeats).length > 0 ? selectedSeats : p.selectedSeats,
//       };
//     });
//     onChange(updated);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selections, seatMapsByKey]);

//   function selectSeat(seat: string) {
//     const key = seatKey(activeLeg, activeSegment, activePax);
//     const currentMap = seatMapsByKey[`${activeLeg}:${activeSegment}`];
//     if (!currentMap) return;
//     if (currentMap.occupied.includes(seat)) return;

//     // Don't allow another pax's already-selected seat on this segment
//     const takenByOther = Object.entries(selections).some(
//       ([k, v]) => v === seat && k.startsWith(`${activeLeg}:${activeSegment}-`) && k !== key
//     );
//     if (takenByOther) return;

//     setSelections((prev) => {
//       const next = { ...prev };
//       if (prev[key] === seat) {
//         delete next[key]; // deselect
//       } else {
//         next[key] = seat;
//         // Auto-advance to next passenger
//         if (activePax < passengers.length - 1) setActivePax((p) => p + 1);
//       }
//       return next;
//     });
//   }

  

//   // FIX: Write ALL leg+segment seat selections back into passenger data.
//   // selectedSeat = leg-0/segment-0 seat (backwards compat)
//   // selectedSeats = { "legIdx:segIdx": seatCode } for every physical segment
//   function handleContinue() {
//     // Passenger seat selections and seat maps are now pushed to the
//     // parent live (see the useEffects above) on every tap, so all
//     // that's left here is advancing to the next step.
//     onNext();
//   }

//   const activeSegments = legSegments(activeLeg);
//   const currentMap = seatMapsByKey[`${activeLeg}:${activeSegment}`] ?? null;
//   const activeLegSSR = ssrDataPerLeg[activeLeg] ?? null;
//   const activeSegmentSSR = activeSegments[activeSegment] ?? null;

//   // Price of cheapest premium seat on this segment
//   const premiumPrice = activeSegmentSSR
//     ? (() => {
//         const prices = activeSegmentSSR.seatMap.rows
//           .flatMap((r) => r.seats)
//           .filter((s) => s.isPremium && s.price > 0)
//           .map((s) => s.price);
//         return prices.length > 0 ? Math.min(...prices) : null;
//       })()
//     : null;

//   // ── RENDER ─────────────────────────────────────────────────

//   return (
//     <div>
//       <SectionHeading
//         step="3"
//         title="Seat Selection"
//         desc="Pick your preferred seats. You can skip — seats can also be selected at check-in."
//         accent="violet"
//       />

//       {/* ── Leg tabs ────────────────────────────────────────── */}
//       {legs.length > 1 && (
//         <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-none">
//           {legs.map((leg, i) => (
//             <button
//               key={i}
//               onClick={() => selectLeg(i)}
//               className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
//                 activeLeg === i
//                   ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
//                   : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
//               }`}
//             >
//               <div
//                 className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black"
//                 style={{
//                   background:
//                     activeLeg === i
//                       ? "rgba(255,255,255,0.25)"
//                       : (AIRLINE_COLORS[leg.flight.airlineCode] ?? "#64748b"),
//                   color: "white",
//                 }}
//               >
//                 {leg.flight.airlineCode.slice(0, 2)}
//               </div>
//               {leg.label}: {leg.flight.fromCode} → {leg.flight.toCode}
//               {legSegments(i).every((seg) => !seg.availability.seatMap) && !ssrLoading && (
//                 <span className="ml-1 text-[9px] text-amber-500 font-normal">
//                   unavailable
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* ── Segment tabs — only shown when the active leg has a stop ─── */}
//       {activeSegments.length > 1 && (
//         <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-none">
//           {activeSegments.map((seg, i) => (
//             <button
//               key={i}
//               onClick={() => { setActiveSegment(i); setActivePax(0); }}
//               className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all border ${
//                 activeSegment === i
//                   ? "bg-violet-600 text-white border-violet-600"
//                   : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
//               }`}
//             >
//               Flight {i + 1}: {seg.origin} → {seg.destination}
//               {!seg.availability.seatMap && !ssrLoading && (
//                 <span className="ml-1 text-[9px] text-amber-500 font-normal">
//                   unavailable
//                 </span>
//               )}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* ── Passenger selector ──────────────────────────────── */}
//       <div className="flex gap-2 mb-5 flex-wrap">
//         {passengers.map((p, i) => {
//           if (paxTypes[i] === "Infant") return null;
//           const hasSeat = !!selections[seatKey(activeLeg, activeSegment, i)];
//           const seatCode = selections[seatKey(activeLeg, activeSegment, i)];
//           const isPremiumSeat =
//             seatCode && currentMap?.premium.includes(seatCode);
//           return (
//             <button
//               key={i}
//               onClick={() => setActivePax(i)}
//               className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
//                 activePax === i
//                   ? "bg-slate-900 text-white border-slate-900"
//                   : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
//               }`}
//             >
//               <div
//                 className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
//                   hasSeat
//                     ? isPremiumSeat
//                       ? "bg-amber-400 text-white"
//                       : "bg-emerald-500 text-white"
//                     : "bg-slate-200 text-slate-500"
//                 }`}
//               >
//                 {hasSeat ? "✓" : i + 1}
//               </div>
//               {p.firstName || `Pax ${i + 1}`}
//               {hasSeat && (
//                 <span
//                   className={`font-mono font-black ${
//                     isPremiumSeat ? "text-amber-500" : "text-emerald-600"
//                   }`}
//                 >
//                   {seatCode}
//                 </span>
//               )}
//             </button>
//           );
//         })}
//       </div>

//       {/* ── Seat map ────────────────────────────────────────── */}
//       {ssrLoading ? (
//         <LoadingState />
//       ) : currentMap ? (
//         <AircraftSeatMap
//           map={currentMap}
//           activeLeg={activeLeg}
//           activeSegment={activeSegment}
//           activePax={activePax}
//           passengers={passengers}
//           selections={selections}
//           onSelectSeat={selectSeat}
//           premiumPrice={premiumPrice}
//         />
//       ) : (
//         <UnavailableState
//           message={
//             activeSegmentSSR?.availability?.seatMapMessage ??
//             activeLegSSR?.availability?.seatMapMessage ??
//             `Seat map is not available for this ${legs[activeLeg]?.flight.airline ?? "airline"} flight.`
//           }
//         />
//       )}

//       {/* ── Selection summary ───────────────────────────────── */}
//       {Object.keys(selections).length > 0 && (
//         <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
//           <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">
//             Selected Seats
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {legs.map((leg, legIdx) =>
//               legSegments(legIdx).map((seg, segIdx) =>
//                 passengers.map((p, paxIdx) => {
//                   if (paxTypes[paxIdx] === "Infant") return null;
//                   const seat = selections[seatKey(legIdx, segIdx, paxIdx)];
//                   if (!seat) return null;
//                   const segLabel =
//                     legSegments(legIdx).length > 1
//                       ? `${leg.label} · ${seg.origin}→${seg.destination}`
//                       : leg.label;
//                   return (
//                     <div
//                       key={`${legIdx}-${segIdx}-${paxIdx}`}
//                       className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 border border-blue-200"
//                     >
//                       {(legs.length > 1 || legSegments(legIdx).length > 1) && (
//                         <span className="text-[9px] font-black text-slate-400 uppercase">
//                           {segLabel}
//                         </span>
//                       )}
//                       <span className="text-xs font-bold text-slate-700">
//                         {p.firstName || `Pax ${paxIdx + 1}`}
//                       </span>
//                       <span className="text-xs font-mono font-black text-blue-600">
//                         {seat}
//                       </span>
//                     </div>
//                   );
//                 })
//               )
//             )}
//           </div>
//         </div>
//       )}

//       {/* ── Navigation ──────────────────────────────────────── */}
//       <div className="flex gap-3 mt-2">
//         <button
//           onClick={onBack}
//           className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-sm hover:border-slate-300 hover:bg-white transition-all"
//         >
//           ← Back
//         </button>
//         <button
//           onClick={onNext}
//           className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl text-sm hover:border-blue-300 hover:text-blue-600 transition-all"
//         >
//           Skip for now
//         </button>
//         <button
//           onClick={handleContinue}
//           className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-blue-200"
//         >
//           Continue to Extras →
//         </button>
//       </div>
//     </div>
//   );
// }

// // ─── AIRCRAFT SEAT MAP ───────────────────────────────────────

// interface AircraftSeatMapProps {
//   map: SeatMap;
//   activeLeg: number;
//   activeSegment: number;
//   activePax: number;
//   passengers: PassengerData[];
//   selections: Record<string, string>;
//   onSelectSeat: (seat: string) => void;
//   premiumPrice: number | null;
// }

// function AircraftSeatMap({
//   map,
//   activeLeg,
//   activeSegment,
//   activePax,
//   passengers,
//   selections,
//   onSelectSeat,
//   premiumPrice,
// }: AircraftSeatMapProps) {
//   function seatKey(legIdx: number, segIdx: number, paxIdx: number) {
//     return `${legIdx}:${segIdx}-${paxIdx}`;
//   }

//   const aisleAfterIndex =
//     map.cols.length > 4
//       ? Math.floor(map.cols.length / 2)
//       : Math.ceil(map.cols.length / 2);

//   return (
//     <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-4">

//       {/* Aircraft nose graphic */}
//       <div className="relative bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 py-5 flex flex-col items-center">
//         <svg width="80" height="40" viewBox="0 0 80 40" className="mb-1 opacity-30">
//           <path d="M40 2 C20 2, 4 12, 4 24 L4 38 L76 38 L76 24 C76 12, 60 2, 40 2 Z"
//             fill="none" stroke="#64748b" strokeWidth="1.5" />
//           <path d="M40 2 L40 38" stroke="#64748b" strokeWidth="0.75" strokeDasharray="3 3" />
//           <ellipse cx="40" cy="38" rx="36" ry="4" fill="#64748b" opacity="0.08" />
//         </svg>
//         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
//           Front of aircraft
//         </div>

//         {/* Legend */}
//         <div className="flex items-center gap-4 mt-3 text-[10px]">
//           <LegendItem color="bg-blue-600" border="" label="Your seat" />
//           <LegendItem color="bg-emerald-100" border="border border-emerald-300" label="Other pax" />
//           <LegendItem color="bg-amber-100" border="border border-amber-300" label="Premium" />
//           <LegendItem color="bg-slate-100" border="border border-slate-200" label="Available" />
//           <LegendItem color="bg-slate-700" border="" label="Taken" />
//         </div>
//       </div>

//       {/* Scrollable seat grid */}
//       <div className="overflow-auto max-h-[520px]">
//         <div className="p-4 min-w-[340px] w-fit mx-auto">

//           {/* Column headers */}
//           <div className="flex items-center mb-3 pl-9">
//             {map.cols.map((col, ci) => (
//               <div
//                 key={col}
//                 className={`w-10 text-center text-[10px] font-black text-slate-400 ${
//                   ci === aisleAfterIndex ? "ml-6" : ""
//                 }`}
//               >
//                 {col}
//               </div>
//             ))}
//           </div>

//           {/* Seat rows */}
//           {Array.from({ length: map.rows }, (_, ri) => {
//             const row = ri + 1;
//             const isExitRow = row === 12 || row === 13 || row === 14 || row === 26 || row === 27;

//             return (
//               <div key={row}>
//                 {row === 1 && (
//                   <ZoneLabel label="Business / Premium" color="text-amber-500" />
//                 )}
//                 {row === 4 && (
//                   <ZoneLabel label="Economy" color="text-slate-400" />
//                 )}
//                 {isExitRow && row === 12 && <ExitRowDivider />}

//                 <div className="flex items-center mb-1.5 group">
//                   {/* Row number */}
//                   <div className="w-8 shrink-0 text-right pr-2 text-[10px] text-slate-300 font-bold group-hover:text-slate-500 transition-colors">
//                     {row}
//                   </div>

//                   {/* Seats */}
//                   {map.cols.map((col, ci) => {
//                     const seat = `${row}${col}`;
//                     const isOccupied = map.occupied.includes(seat);
//                     const isPremium = map.premium.includes(seat);
//                     const price = map.prices?.[seat] ?? 0;

//                     const myKey = seatKey(activeLeg, activeSegment, activePax);
//                     const isSelectedByMe = selections[myKey] === seat;
//                     const otherEntry = Object.entries(selections).find(
//                       ([k, v]) =>
//                         v === seat &&
//                         k.startsWith(`${activeLeg}:${activeSegment}-`) &&
//                         k !== myKey
//                     );
//                     const otherPaxIdx = otherEntry?.[0]?.split("-")[1];
//                     const isSelectedByOther = otherPaxIdx !== undefined;

//                     const seatType =
//                       ci === 0 || ci === map.cols.length - 1
//                         ? "window"
//                         : ci === aisleAfterIndex - 1 || ci === aisleAfterIndex
//                         ? "aisle"
//                         : "middle";

//                     return (
//                       <button
//                         key={col}
//                         onClick={() => onSelectSeat(seat)}
//                         disabled={isOccupied || isSelectedByOther}
//                         title={
//                           isOccupied
//                             ? "Seat unavailable"
//                             : isSelectedByOther
//                             ? `Taken by ${
//                                 passengers[Number(otherPaxIdx)]?.firstName ||
//                                 `Pax ${Number(otherPaxIdx) + 1}`
//                               }`
//                             : price > 0
//                             ? `${seatType.charAt(0).toUpperCase() + seatType.slice(1)} · Premium · +₹${price}`
//                             : `${seatType.charAt(0).toUpperCase() + seatType.slice(1)} · Free`
//                         }
//                         className={[
//                           "relative w-10 h-9 rounded-t-2xl rounded-b-sm text-[9px] font-bold transition-all duration-100",
//                           "flex flex-col items-center justify-center gap-px",
//                           ci === aisleAfterIndex ? "ml-6" : "",
//                           isOccupied
//                             ? "bg-slate-700 text-slate-500 cursor-not-allowed"
//                             : isSelectedByOther
//                             ? "bg-emerald-100 border border-emerald-300 text-emerald-700 cursor-not-allowed"
//                             : isSelectedByMe
//                             ? "bg-blue-600 text-white shadow-lg shadow-blue-200/60 scale-105 ring-2 ring-blue-400 ring-offset-1 z-10"
//                             : isPremium && price > 0
//                             ? "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 hover:scale-105 hover:shadow-md hover:shadow-amber-100 cursor-pointer"
//                             : "bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200 hover:scale-105 hover:shadow-sm cursor-pointer",
//                         ]
//                           .filter(Boolean)
//                           .join(" ")}
//                       >
//                         {isOccupied ? (
//                           <span className="text-[10px] opacity-40">✕</span>
//                         ) : isSelectedByMe ? (
//                           <>
//                             <span className="text-[11px] leading-none">✓</span>
//                             <span className="text-[8px] font-mono opacity-80 leading-none">{seat}</span>
//                           </>
//                         ) : isSelectedByOther ? (
//                           <span className="text-[8px] font-mono leading-none">
//                             {passengers[Number(otherPaxIdx)]?.firstName?.[0] || "P"}
//                           </span>
//                         ) : (
//                           <>
//                             <span className="font-mono leading-none">{seat}</span>
//                             {price > 0 && (
//                               <span className="text-[7px] opacity-60 leading-none">
//                                 ₹{price >= 1000 ? `${(price / 1000).toFixed(1)}k` : price}
//                               </span>
//                             )}
//                           </>
//                         )}

//                         {/* Seat back indicator */}
//                         <span
//                           className={[
//                             "absolute bottom-0 left-1 right-1 h-1 rounded-full",
//                             isSelectedByMe
//                               ? "bg-blue-400"
//                               : isOccupied
//                               ? "bg-slate-600"
//                               : isPremium && price > 0
//                               ? "bg-amber-200"
//                               : "bg-slate-200",
//                           ].join(" ")}
//                         />
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             );
//           })}

//           {/* Tail */}
//           <div className="flex flex-col items-center mt-4 opacity-30">
//             <svg width="80" height="30" viewBox="0 0 80 30">
//               <path
//                 d="M4 2 L76 2 L76 14 C76 22, 60 28, 40 28 C20 28, 4 22, 4 14 Z"
//                 fill="none" stroke="#64748b" strokeWidth="1.5"
//               />
//             </svg>
//             <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
//               Rear
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Premium info footer */}
//       {premiumPrice !== null && premiumPrice !== undefined && (
//         <div className="px-6 py-3 bg-amber-50 border-t border-amber-100 flex items-center gap-2">
//           <span className="text-amber-500 text-sm">★</span>
//           <span className="text-xs text-amber-700 font-medium">
//             Premium seats include extra legroom · from{" "}
//             <strong>+₹{premiumPrice.toLocaleString("en-IN")}</strong> per seat
//           </span>
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── SMALL HELPERS ───────────────────────────────────────────

// function LegendItem({ color, border, label }: { color: string; border: string; label: string }) {
//   return (
//     <div className="flex items-center gap-1.5">
//       <div className={`w-5 h-4 rounded-t-lg rounded-b-sm ${color} ${border}`} />
//       <span className="text-slate-500">{label}</span>
//     </div>
//   );
// }

// function ZoneLabel({ label, color }: { label: string; color: string }) {
//   return (
//     <div className={`text-[9px] font-black uppercase tracking-widest ${color} py-1.5 text-center`}>
//       {label}
//     </div>
//   );
// }

// function ExitRowDivider() {
//   return (
//     <div className="flex items-center gap-2 my-2 py-1">
//       <div className="flex-1 border-t border-dashed border-green-300" />
//       <div className="text-[9px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 whitespace-nowrap">
//         ⚡ Emergency Exit Row
//       </div>
//       <div className="flex-1 border-t border-dashed border-green-300" />
//     </div>
//   );
// }

// function LoadingState() {
//   return (
//     <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center mb-4">
//       <div className="w-7 h-7 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
//       <p className="text-sm font-medium text-slate-500 mb-1">Loading seat map from airline…</p>
//       <p className="text-xs text-slate-400">This usually takes a few seconds</p>
//     </div>
//   );
// }

// function UnavailableState({ message }: { message: string }) {
//   return (
//     <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 text-center mb-4">
//       <div className="text-3xl mb-3">✈️</div>
//       <p className="text-sm font-medium text-slate-600 mb-1">
//         {message}
//       </p>
//       <p className="text-xs text-slate-400">
//         You can choose your seat at check-in, usually 24–48 hours before departure.
//       </p>
//     </div>
//   );
// }

// ============================================================
//  BookingStep3Seats.tsx — RESTYLED (UI parity with SeatSelection.tsx)
//
//  This pass is visual-only. Every prop, hook, state shape, and
//  handler below is byte-for-byte the same logic as before:
//  1. handleContinue still relies on the live-sync useEffects to
//     push passenger.selectedSeats / selectedSeat up to the parent.
//  2. Props still use ssrDataPerLeg (array) consistently.
//  3. seatMaps are still derived per-(leg,segment) from ssrDataPerLeg.
//  4. legs array is still memoized the same way.
//  5. Premium note still reads from the active segment's SSR.
//  Only className/markup/inline-style choices changed, borrowing the
//  aircraft nose/wing/tail graphic, seat-button shape, legend and
//  zone-divider treatment from SeatSelection.tsx.
// ============================================================

import React, { useState, useMemo, useEffect } from "react";
import type { DisplayFlight, FareTier } from "../../lib/types_t";
import type { PassengerData, SeatMap } from "./BookingShared";
import { SectionHeading, AIRLINE_COLORS } from "./BookingShared";
import type { SSRResult, SSRSegment } from "../../lib/flights_api";

// ─── PROPS ──────────────────────────────────────────────────

interface Step3Props {
  flight: DisplayFlight;
  tier: FareTier;
  passengers: PassengerData[];
  paxTypes: ("Adult" | "Child" | "Infant")[];
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  returnFlight?: DisplayFlight;
  isRoundTrip: boolean;
  isMultiCity: boolean;
  ssrDataPerLeg: (SSRResult | null)[]; // one entry per leg, in leg order
  ssrLoading: boolean;
  onChange: (passengers: PassengerData[]) => void;
  onNext: () => void;
  onBack: () => void;
  onSeatMapsResolved?: (maps: Record<number, SeatMap>) => void;
  returnTier?: FareTier;
}

// ─── HELPERS ────────────────────────────────────────────────

function ssrToSeatMap(apiMap: SSRResult["seatMap"] | null | undefined): SeatMap | null {
  if (!apiMap || !apiMap.rows || apiMap.rows.length === 0) return null;

  const occupied = apiMap.rows.flatMap((r) =>
    r.seats.filter((s) => s.isOccupied).map((s) => s.code)
  );
  const premium = apiMap.rows.flatMap((r) =>
    r.seats.filter((s) => s.isPremium).map((s) => s.code)
  );
  const prices: Record<string, number> = Object.fromEntries(
    apiMap.rows.flatMap((r) => r.seats.map((s) => [s.code, s.price]))
  );

  const types: Record<string, "Window" | "Middle" | "Aisle"> = {};
  const aisleAfterIndex =
    apiMap.cols.length > 4
      ? Math.floor(apiMap.cols.length / 2)
      : Math.ceil(apiMap.cols.length / 2);

  apiMap.cols.forEach((col, ci) => {
    types[col] =
      ci === 0 || ci === apiMap.cols.length - 1
        ? "Window"
        : ci === aisleAfterIndex - 1 || ci === aisleAfterIndex
        ? "Aisle"
        : "Middle";
  });

  return {
    rows: apiMap.totalRows,
    cols: apiMap.cols,
    occupied,
    premium,
    prices,
    types,
  };
}

// ─── COMPONENT ──────────────────────────────────────────────

export default function BookingStep3Seats({
  flight,
  tier,
  passengers,
  paxTypes,
  multiCityLegs,
  returnFlight,
  isRoundTrip,
  isMultiCity,
  ssrDataPerLeg,
  ssrLoading,
  onChange,
  onNext,
  onBack,
  onSeatMapsResolved,
  returnTier,
}: Step3Props) {
  const [activeLeg, setActiveLeg] = useState(0);
  const [activeSegment, setActiveSegment] = useState(0);
  const [activePax, setActivePax] = useState(0);

  // ── Leg definitions (memoized) ─────────────────────────────
  const legs = useMemo(
    () => [
      {
        flight,
        tier,
        label: isRoundTrip ? "Outbound" : isMultiCity ? "Leg 1" : "Seat Map",
      },

      // In legs useMemo, change:
      ...(isRoundTrip && returnFlight
        ? [{ flight: returnFlight, tier: returnTier ?? tier, label: "Return" }]
        : []),
      ...(isMultiCity
        ? (multiCityLegs ?? []).slice(1).map((l, i) => ({
            ...l,
            label: `Leg ${i + 2}`,
          }))
        : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      flight.resultIndex,
      returnFlight?.resultIndex,
      isRoundTrip,
      isMultiCity,
      multiCityLegs?.length,
    ]
  );

  // ── Physical segments per leg ───────────────────────────────
  // A leg with stops (1-stop/2-stop) has MULTIPLE physical flight
  // segments, each with its own seat map. ssrDataPerLeg[i].segments now
  // carries all of them (see flights_api.ts parseTBOSSR fix); fall back
  // to a single pseudo-segment built from the top-level fields so a leg
  // whose SSR hasn't resolved yet (or a direct flight with the old
  // shape) still renders one tab instead of zero.
  function legSegments(legIdx: number): SSRSegment[] {
    const ssr = ssrDataPerLeg[legIdx];
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

  // Reset the segment tab whenever the leg tab changes.
  function selectLeg(i: number) {
    setActiveLeg(i);
    setActiveSegment(0);
    setActivePax(0);
  }

  // ── One SeatMap entry per (leg, segment) ────────────────────
  const seatMapsByKey: Record<string, SeatMap | null> = useMemo(() => {
    const out: Record<string, SeatMap | null> = {};
    legs.forEach((_, legIdx) => {
      const segs = legSegments(legIdx);
      const segCount = Math.max(segs.length, 1);
      for (let segIdx = 0; segIdx < segCount; segIdx++) {
        out[`${legIdx}:${segIdx}`] = ssrToSeatMap(segs[segIdx]?.seatMap ?? null);
      }
    });
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [legs, ssrDataPerLeg]);

  // ── Seat selections keyed as "legIdx:segIdx-paxIdx" ──────────
  // Pre-populate from existing passenger.selectedSeats if available
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    passengers.forEach((p, paxIdx) => {
      // Restore from selectedSeats (multi-leg, multi-segment) map
      if (p.selectedSeats) {
        Object.entries(p.selectedSeats).forEach(([legSegKey, seat]) => {
          if (seat) initial[`${legSegKey}-${paxIdx}`] = seat;
        });
      } else if (p.selectedSeat) {
        // Fallback: selectedSeat is leg-0/segment-0 only
        initial[`0:0-${paxIdx}`] = p.selectedSeat;
      }
    });
    return initial;
  });

  function seatKey(legIdx: number, segIdx: number, paxIdx: number) {
    return `${legIdx}:${segIdx}-${paxIdx}`;
  }

  // ── LIVE SYNC TO PARENT (for PriceSidebar) ─────────────────
  // Previously these only fired inside handleContinue, so the
  // sidebar total only updated after tapping "Continue" and moving
  // to Step 4. Now both are pushed up as soon as they change, so
  // the price updates on every seat tap.

  // Push resolved seat maps (prices/occupancy) up as soon as SSR
  // data is available — the sidebar needs this to price selections.
  useEffect(() => {
    const mapsRecord: Record<string, SeatMap> = {};
    Object.entries(seatMapsByKey).forEach(([key, map]) => { if (map) mapsRecord[key] = map; });
    onSeatMapsResolved?.(mapsRecord);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seatMapsByKey]);

  // Push current seat selections into passenger data on every tap,
  // instead of only when handleContinue runs.
  useEffect(() => {
    const updated = passengers.map((p, paxIdx) => {
      const selectedSeats: Record<string, string> = {};
      Object.keys(seatMapsByKey).forEach((legSegKey) => {
        const [legIdxStr, segIdxStr] = legSegKey.split(":");
        const seat = selections[seatKey(Number(legIdxStr), Number(segIdxStr), paxIdx)];
        if (seat) selectedSeats[legSegKey] = seat;
      });

      return {
        ...p,
        // Always reflect the CURRENT selection state — including the
        // case where the passenger has deselected every seat for this
        // leg/segment. Previously this fell back to the old p.selectedSeat
        // / p.selectedSeats whenever the freshly computed value was empty,
        // which meant removing a seat never reached the parent (and the
        // price sidebar kept billing for a seat that had been removed).
        selectedSeat: selectedSeats["0:0"],
        selectedSeats,
      };
    });
    onChange(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selections, seatMapsByKey]);

  function selectSeat(seat: string) {
    const key = seatKey(activeLeg, activeSegment, activePax);
    const currentMap = seatMapsByKey[`${activeLeg}:${activeSegment}`];
    if (!currentMap) return;
    if (currentMap.occupied.includes(seat)) return;

    // Don't allow another pax's already-selected seat on this segment
    const takenByOther = Object.entries(selections).some(
      ([k, v]) => v === seat && k.startsWith(`${activeLeg}:${activeSegment}-`) && k !== key
    );
    if (takenByOther) return;

    setSelections((prev) => {
      const next = { ...prev };
      if (prev[key] === seat) {
        delete next[key]; // deselect
      } else {
        next[key] = seat;
        // Auto-advance to next passenger
        if (activePax < passengers.length - 1) setActivePax((p) => p + 1);
      }
      return next;
    });
  }



  // FIX: Write ALL leg+segment seat selections back into passenger data.
  // selectedSeat = leg-0/segment-0 seat (backwards compat)
  // selectedSeats = { "legIdx:segIdx": seatCode } for every physical segment
  function handleContinue() {
    // Passenger seat selections and seat maps are now pushed to the
    // parent live (see the useEffects above) on every tap, so all
    // that's left here is advancing to the next step.
    onNext();
  }

  const activeSegments = legSegments(activeLeg);
  const currentMap = seatMapsByKey[`${activeLeg}:${activeSegment}`] ?? null;
  const activeLegSSR = ssrDataPerLeg[activeLeg] ?? null;
  const activeSegmentSSR = activeSegments[activeSegment] ?? null;

  // Price of cheapest premium seat on this segment
  const premiumPrice = activeSegmentSSR
    ? (() => {
        const prices = activeSegmentSSR.seatMap.rows
          .flatMap((r) => r.seats)
          .filter((s) => s.isPremium && s.price > 0)
          .map((s) => s.price);
        return prices.length > 0 ? Math.min(...prices) : null;
      })()
    : null;

  // ── RENDER ─────────────────────────────────────────────────

  return (
    <div>
      <SectionHeading
        step="3"
        title="Seat Selection"
        desc="Pick your preferred seats. You can skip — seats can also be selected at check-in."
        accent="violet"
      />

      {/* ── Leg tabs ────────────────────────────────────────── */}
      {legs.length > 1 && (
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-none">
          {legs.map((leg, i) => (
            <button
              key={i}
              onClick={() => selectLeg(i)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all border ${
                activeLeg === i
                  ? "bg-blue-700 text-white border-blue-700 shadow-sm"
                  : "bg-white text-slate-500 border-slate-200 hover:border-blue-300"
              }`}
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black"
                style={{
                  background:
                    activeLeg === i
                      ? "rgba(255,255,255,0.25)"
                      : (AIRLINE_COLORS[leg.flight.airlineCode] ?? "#64748b"),
                  color: "white",
                }}
              >
                {leg.flight.airlineCode.slice(0, 2)}
              </div>
              {leg.label}: {leg.flight.fromCode} → {leg.flight.toCode}
              {legSegments(i).every((seg) => !seg.availability.seatMap) && !ssrLoading && (
                <span className="ml-1 text-[9px] text-amber-500 font-normal">
                  unavailable
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Segment tabs — only shown when the active leg has a stop ─── */}
      {activeSegments.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none">
          {activeSegments.map((seg, i) => (
            <button
              key={i}
              onClick={() => { setActiveSegment(i); setActivePax(0); }}
              className={`flex-shrink-0 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-[11px] font-bold whitespace-nowrap transition-all border ${
                activeSegment === i
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-500 border-slate-200 hover:border-indigo-300"
              }`}
            >
              Flight {i + 1}: {seg.origin} → {seg.destination}
              {!seg.availability.seatMap && !ssrLoading && (
                <span className="ml-1 text-[9px] text-amber-500 font-normal">
                  unavailable
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Passenger selector ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-3 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {passengers.map((p, i) => {
            if (paxTypes[i] === "Infant") return null;
            const hasSeat = !!selections[seatKey(activeLeg, activeSegment, i)];
            const seatCode = selections[seatKey(activeLeg, activeSegment, i)];
            const isPremiumSeat =
              seatCode && currentMap?.premium.includes(seatCode);
            return (
              <button
                key={i}
                onClick={() => setActivePax(i)}
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-[12px] font-semibold transition-all border ${
                  activePax === i
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                    hasSeat
                      ? isPremiumSeat
                        ? "bg-amber-400 text-white"
                        : "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {hasSeat ? "✓" : i + 1}
                </div>
                {p.firstName || `Pax ${i + 1}`}
                {hasSeat && (
                  <span
                    className={`font-mono font-bold ${
                      isPremiumSeat ? "text-amber-500" : "text-emerald-600"
                    }`}
                  >
                    {seatCode}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Legend — styled like SeatSelection's legend row ── */}
        <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
          <LegendItem
            label="Available"
            style={{ background: "#f8faff", borderColor: "#cbd5e1", color: "#64748b" }}
          />
          <LegendItem
            label="Your seat"
            style={{
              background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
              borderColor: "#1d4ed8",
              color: "#fff",
            }}
          />
          <LegendItem
            label="Other pax"
            style={{ background: "#ecfdf5", borderColor: "#6ee7b7", color: "#059669" }}
          />
          <LegendItem
            label="Premium"
            style={{ background: "#eff6ff", borderColor: "#93c5fd", color: "#64748b" }}
          />
          <LegendItem
            label="Taken"
            style={{ background: "#f1f5f9", borderColor: "#e2e8f0", color: "#cbd5e1" }}
          />
        </div>
      </div>

      {/* ── Seat map ────────────────────────────────────────── */}
      {ssrLoading ? (
        <LoadingState />
      ) : currentMap ? (
        <AircraftSeatMap
          map={currentMap}
          activeLeg={activeLeg}
          activeSegment={activeSegment}
          activePax={activePax}
          passengers={passengers}
          selections={selections}
          onSelectSeat={selectSeat}
          premiumPrice={premiumPrice}
        />
      ) : (
        <UnavailableState
          message={
            activeSegmentSSR?.availability?.seatMapMessage ??
            activeLegSSR?.availability?.seatMapMessage ??
            `Seat map is not available for this ${legs[activeLeg]?.flight.airline ?? "airline"} flight.`
          }
        />
      )}

      {/* ── Selection summary ───────────────────────────────── */}
      {Object.keys(selections).length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3 sm:p-4 mb-4">
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">
            Selected Seats
          </div>
          <div className="flex flex-wrap gap-2">
            {legs.map((leg, legIdx) =>
              legSegments(legIdx).map((seg, segIdx) =>
                passengers.map((p, paxIdx) => {
                  if (paxTypes[paxIdx] === "Infant") return null;
                  const seat = selections[seatKey(legIdx, segIdx, paxIdx)];
                  if (!seat) return null;
                  const segLabel =
                    legSegments(legIdx).length > 1
                      ? `${leg.label} · ${seg.origin}→${seg.destination}`
                      : leg.label;
                  return (
                    <div
                      key={`${legIdx}-${segIdx}-${paxIdx}`}
                      className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 border border-blue-200"
                    >
                      {(legs.length > 1 || legSegments(legIdx).length > 1) && (
                        <span className="text-[9px] font-black text-slate-400 uppercase">
                          {segLabel}
                        </span>
                      )}
                      <span className="text-xs font-bold text-slate-700">
                        {p.firstName || `Pax ${paxIdx + 1}`}
                      </span>
                      <span className="text-xs font-mono font-black text-blue-600">
                        {seat}
                      </span>
                    </div>
                  );
                })
              )
            )}
          </div>
        </div>
      )}

      {/* ── Navigation ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-2">
        <div className="flex gap-2 sm:contents">
          <button
            onClick={onBack}
            className="flex-1 sm:flex-1 border-2 border-slate-200 text-slate-700 font-bold py-3 sm:py-3.5 rounded-2xl text-sm hover:border-slate-300 hover:bg-white transition-all"
          >
            ← Back
          </button>
          <button
            onClick={onNext}
            className="flex-1 sm:flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3 sm:py-3.5 rounded-2xl text-sm hover:border-blue-300 hover:text-blue-600 transition-all"
          >
            Skip for now
          </button>
        </div>
        <button
          onClick={handleContinue}
          className="w-full sm:flex-[2] font-black py-3.5 rounded-2xl text-sm transition-all text-white shadow-lg"
          style={{ background: "linear-gradient(135deg,#1d4ed8,#1e40af)" }}
        >
          Continue to Extras →
        </button>
      </div>
    </div>
  );
}

// ─── AIRCRAFT SEAT MAP ───────────────────────────────────────
// Visual language ported from SeatSelection.tsx: a wing/engine
// silhouette floating behind the card, a nose-cone + cockpit
// window graphic above the seat grid, and a tail-fin graphic
// below it. The underlying seat data/behavior (occupied / premium
// / mine / other-pax) is unchanged — only the seat button and
// section-divider styling now matches SeatSelection's look.

interface AircraftSeatMapProps {
  map: SeatMap;
  activeLeg: number;
  activeSegment: number;
  activePax: number;
  passengers: PassengerData[];
  selections: Record<string, string>;
  onSelectSeat: (seat: string) => void;
  premiumPrice: number | null;
}

function AircraftSeatMap({
  map,
  activeLeg,
  activeSegment,
  activePax,
  passengers,
  selections,
  onSelectSeat,
  premiumPrice,
}: AircraftSeatMapProps) {
  function seatKey(legIdx: number, segIdx: number, paxIdx: number) {
    return `${legIdx}:${segIdx}-${paxIdx}`;
  }

  const aisleAfterIndex =
    map.cols.length > 4
      ? Math.floor(map.cols.length / 2)
      : Math.ceil(map.cols.length / 2);

  // Rows are split into a "premium" zone (first ~20% of rows, min 1)
  // and the remaining "standard" zone, purely for the section divider
  // label — this mirrors SeatSelection's Business/Economy split
  // without changing any seat-selection logic.
  const premiumRowCount = Math.max(1, Math.round(map.rows * 0.15));

  return (
    <div className="relative mb-4">
      {/* ── Wings + engines silhouette, floating behind the card ──
           Purely decorative, so it's hidden on phones (< sm) to avoid
           forcing horizontal overflow on narrow viewports, and scales
           fluidly with the card's width on larger screens. ── */}
      <div
        className="hidden sm:block"
        style={{
          position: "absolute",
          top: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "92%",
          maxWidth: 560,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <svg viewBox="0 0 560 96" className="w-full h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M 100 14 L 8 40 L 26 72 L 100 80 Z"
            fill="rgba(240,246,255,0.95)" stroke="rgba(148,163,184,0.65)" strokeWidth="1.5" strokeLinejoin="round" />
          <ellipse cx="44" cy="52" rx="24" ry="10"
            fill="rgba(224,234,248,0.98)" stroke="rgba(148,163,184,0.7)" strokeWidth="1.5" />
          <line x1="20" y1="52" x2="68" y2="52" stroke="rgba(148,163,184,0.35)" strokeWidth="0.8" />
          <path d="M 460 14 L 552 40 L 534 72 L 460 80 Z"
            fill="rgba(240,246,255,0.95)" stroke="rgba(148,163,184,0.65)" strokeWidth="1.5" strokeLinejoin="round" />
          <ellipse cx="516" cy="52" rx="24" ry="10"
            fill="rgba(224,234,248,0.98)" stroke="rgba(148,163,184,0.7)" strokeWidth="1.5" />
          <line x1="492" y1="52" x2="540" y2="52" stroke="rgba(148,163,184,0.35)" strokeWidth="0.8" />
        </svg>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden relative" style={{ zIndex: 1 }}>

        {/* ── Nose / cockpit ── */}
        <div
          className="flex flex-col items-center pt-4 sm:pt-5 pb-2.5 sm:pb-3 border-b border-slate-100"
          style={{ background: "linear-gradient(180deg,#eaf0fc,#f8faff)" }}
        >
          <svg viewBox="0 0 110 58" className="w-16 sm:w-[90px] h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="22" y="32" width="66" height="22"
              fill="#eaf0fc" stroke="rgba(148,163,184,0.55)" strokeWidth="1.5" />
            <path d="M 22 32 C 22 14 30 4 55 2 C 80 4 88 14 88 32 Z"
              fill="#dce9f8" stroke="rgba(148,163,184,0.6)" strokeWidth="1.5" strokeLinejoin="round" />
            <ellipse cx="40" cy="28" rx="8" ry="10"
              fill="rgba(186,214,255,0.55)" stroke="rgba(148,163,184,0.5)" strokeWidth="1" />
            <ellipse cx="70" cy="28" rx="8" ry="10"
              fill="rgba(186,214,255,0.55)" stroke="rgba(148,163,184,0.5)" strokeWidth="1" />
            <circle cx="55" cy="3" r="2.5" fill="rgba(148,163,184,0.4)" />
          </svg>
          <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold tracking-[0.15em] sm:tracking-[0.18em] uppercase mt-1">
            Front of aircraft
          </span>
        </div>

        {/* Scrollable seat grid — overflow-auto covers both axes, so on
             narrow phones the grid can scroll horizontally instead of
             squeezing seats unreadably small. */}
        <div className="overflow-auto max-h-[70vh] sm:max-h-[520px]">
          <div className="px-3 sm:px-6 py-3 sm:py-4 min-w-[280px] sm:min-w-[340px] w-fit mx-auto">

            {/* Column headers */}
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 justify-center">
              <div className="w-6 sm:w-7 text-center" />
              {map.cols.map((col, ci) => (
                <React.Fragment key={col}>
                  {ci === aisleAfterIndex && <div className="w-4 sm:w-6" />}
                  <div className="w-7 sm:w-9 text-center text-[9px] sm:text-[10px] font-bold text-slate-400">
                    {col}
                  </div>
                </React.Fragment>
              ))}
            </div>

            {/* Seat rows */}
            {Array.from({ length: map.rows }, (_, ri) => {
              const row = ri + 1;
              const isExitRow = row === 12 || row === 13 || row === 14 || row === 26 || row === 27;

              return (
                <div key={row}>
                  {row === 1 && <ZoneLabel label="Premium" color="text-blue-500" line="bg-blue-100" />}
                  {row === premiumRowCount + 1 && (
                    <ZoneLabel label="Standard" color="text-slate-400" line="bg-slate-100" />
                  )}
                  {isExitRow && row === 12 && <ExitRowDivider />}

                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 justify-center group">
                    {/* Row number */}
                    <div className="w-6 sm:w-7 text-center text-[10px] sm:text-[11px] font-semibold text-slate-400 group-hover:text-slate-600 transition-colors">
                      {row}
                    </div>

                    {/* Seats */}
                    {map.cols.map((col, ci) => {
                      const seat = `${row}${col}`;
                      const isOccupied = map.occupied.includes(seat);
                      const isPremium = map.premium.includes(seat);
                      const price = map.prices?.[seat] ?? 0;

                      const myKey = seatKey(activeLeg, activeSegment, activePax);
                      const isSelectedByMe = selections[myKey] === seat;
                      const otherEntry = Object.entries(selections).find(
                        ([k, v]) =>
                          v === seat &&
                          k.startsWith(`${activeLeg}:${activeSegment}-`) &&
                          k !== myKey
                      );
                      const otherPaxIdx = otherEntry?.[0]?.split("-")[1];
                      const isSelectedByOther = otherPaxIdx !== undefined;

                      const seatType =
                        ci === 0 || ci === map.cols.length - 1
                          ? "window"
                          : ci === aisleAfterIndex - 1 || ci === aisleAfterIndex
                          ? "aisle"
                          : "middle";

                      const seatStyle: React.CSSProperties = isOccupied
                        ? { background: "#f1f5f9", borderColor: "#e2e8f0", color: "#cbd5e1" }
                        : isSelectedByOther
                        ? { background: "#ecfdf5", borderColor: "#6ee7b7", color: "#059669" }
                        : isSelectedByMe
                        ? {
                            background: "linear-gradient(135deg,#2563eb,#1d4ed8)",
                            borderColor: "#1d4ed8",
                            color: "#fff",
                            boxShadow: "0 2px 8px rgba(29,78,216,0.35)",
                          }
                        : isPremium && price > 0
                        ? { background: "#eff6ff", borderColor: "#93c5fd", color: "#64748b" }
                        : { background: "#f8faff", borderColor: "#cbd5e1", color: "#64748b" };

                      return (
                        <button
                          key={col}
                          type="button"
                          onClick={() => onSelectSeat(seat)}
                          disabled={isOccupied || isSelectedByOther}
                          title={
                            isOccupied
                              ? "Seat unavailable"
                              : isSelectedByOther
                              ? `Taken by ${
                                  passengers[Number(otherPaxIdx)]?.firstName ||
                                  `Pax ${Number(otherPaxIdx) + 1}`
                                }`
                              : price > 0
                              ? `${seatType.charAt(0).toUpperCase() + seatType.slice(1)} · Premium · +₹${price}`
                              : `${seatType.charAt(0).toUpperCase() + seatType.slice(1)} · Free`
                          }
                          className={[
                            "flex flex-col items-center justify-center gap-0 rounded text-[8px] sm:text-[9px] font-bold border select-none transition-all duration-150 w-7 h-8 sm:w-9 sm:h-10",
                            ci === aisleAfterIndex ? "ml-4 sm:ml-6" : "",
                            "touch-manipulation",
                            isOccupied
                              ? "cursor-not-allowed"
                              : isSelectedByOther
                              ? "cursor-not-allowed"
                              : "cursor-pointer hover:scale-110 active:scale-95",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          style={seatStyle}
                        >
                          {isOccupied ? (
                            <span className="text-[10px] opacity-50">✕</span>
                          ) : isSelectedByMe ? (
                            <>
                              <span className="text-[11px] leading-none">✓</span>
                              <span className="text-[7px] font-mono opacity-90 leading-none">{seat}</span>
                            </>
                          ) : isSelectedByOther ? (
                            <span className="text-[9px] font-mono leading-none">
                              {passengers[Number(otherPaxIdx)]?.firstName?.[0] || "P"}
                            </span>
                          ) : (
                            <>
                              <span className="font-mono leading-none">{col}</span>
                              {price > 0 && (
                                <span className="text-[7px] opacity-60 leading-none">
                                  ₹{price >= 1000 ? `${(price / 1000).toFixed(1)}k` : price}
                                </span>
                              )}
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Tail ── */}
        <div
          className="flex flex-col items-center pt-2.5 sm:pt-3 pb-4 sm:pb-5 border-t border-slate-100"
          style={{ background: "linear-gradient(180deg,#f8faff,#eaf0fc)" }}
        >
          <svg viewBox="0 0 120 64" className="w-[72px] sm:w-[100px] h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="38" y="0" width="44" height="28"
              fill="#eaf0fc" stroke="rgba(148,163,184,0.55)" strokeWidth="1.5" />
            <path d="M 38 20 L 6 36 L 18 48 L 38 36 Z"
              fill="#dce9f8" stroke="rgba(148,163,184,0.6)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 82 20 L 114 36 L 102 48 L 82 36 Z"
              fill="#dce9f8" stroke="rgba(148,163,184,0.6)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 38 28 C 38 44 44 56 60 60 C 76 56 82 44 82 28 Z"
              fill="#dce9f8" stroke="rgba(148,163,184,0.6)" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M 56 0 L 56 28 L 64 28 L 64 0 C 64 0 60 -2 56 0 Z"
              fill="rgba(199,218,248,0.7)" stroke="rgba(148,163,184,0.5)" strokeWidth="1" strokeLinejoin="round" />
            <circle cx="60" cy="58" r="2.5" fill="rgba(148,163,184,0.4)" />
          </svg>
          <span className="text-[8px] sm:text-[9px] text-slate-400 font-bold tracking-[0.15em] sm:tracking-[0.18em] uppercase mt-1">
            Rear
          </span>
        </div>
      </div>

      {/* Premium info footer */}
      {premiumPrice !== null && premiumPrice !== undefined && (
        <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-50 border-t border-blue-100 rounded-b-3xl -mt-px flex items-center gap-2 relative" style={{ zIndex: 1 }}>
          <span className="text-blue-500 text-sm shrink-0">★</span>
          <span className="text-[11px] sm:text-xs text-blue-700 font-medium">
            Premium seats include extra legroom · from{" "}
            <strong>+₹{premiumPrice.toLocaleString("en-IN")}</strong> per seat
          </span>
        </div>
      )}
    </div>
  );
}

// ─── SMALL HELPERS ───────────────────────────────────────────

function LegendItem({ style, label }: { style: React.CSSProperties; label: string }) {
  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      <div className="w-5 h-4 sm:w-6 sm:h-5 rounded border shrink-0" style={style} />
      <span className="text-[10px] sm:text-[11px] text-slate-500 whitespace-nowrap">{label}</span>
    </div>
  );
}

function ZoneLabel({ label, color, line }: { label: string; color: string; line: string }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 my-1.5 sm:my-2">
      <div className={`h-px flex-1 ${line}`} />
      <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wide sm:tracking-widest ${color} px-1 whitespace-nowrap`}>
        {label}
      </span>
      <div className={`h-px flex-1 ${line}`} />
    </div>
  );
}

function ExitRowDivider() {
  return (
    <div className="flex items-center gap-1.5 sm:gap-2 my-1.5 sm:my-2 py-1">
      <div className="flex-1 border-t-2 border-dashed border-amber-200" />
      <div className="text-[8px] sm:text-[9px] font-bold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-1.5 sm:px-2 py-0.5 whitespace-nowrap">
        🚪 Emergency Exit Row
      </div>
      <div className="flex-1 border-t-2 border-dashed border-amber-200" />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 text-center mb-4">
      <div className="w-7 h-7 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
      <p className="text-sm font-medium text-slate-500 mb-1">Loading seat map from airline…</p>
      <p className="text-xs text-slate-400">This usually takes a few seconds</p>
    </div>
  );
}

function UnavailableState({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-5 sm:p-8 text-center mb-4">
      <div className="text-3xl mb-3">✈️</div>
      <p className="text-sm font-medium text-slate-600 mb-1">
        {message}
      </p>
      <p className="text-xs text-slate-400">
        You can choose your seat at check-in, usually 24–48 hours before departure.
      </p>
    </div>
  );
}