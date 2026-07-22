// // ============================================================
// //  BookingShared.tsx — Shared types, components, price sidebar
// //  Redesigned: premium international airline booking aesthetic
// //  Responsive: mobile · tablet · desktop
// // ============================================================

// import type { DisplayFlight, FareTier } from "../../lib/types_t";
// import { formatINR } from "../../lib/flights_api";
// import { useState, useEffect, useRef } from "react";
// import { couponApi, type CouponReasonCode } from "../../lib/couponApi";
// import { useCurrency } from "../../context/currencyContext";

// // ─── RE-EXPORT TYPES ────────────────────────────────────────

// export interface PassengerData {
//   title: "Mr" | "Mrs" | "Ms" | "Mstr" | "Miss";
//   firstName: string;
//   lastName: string;
//   dob: string;
//   gender: "Male" | "Female";
//   panNumber: string;
//   passportNo: string;
//   passportExpiry: string;
//   nationality: string;
//   ffAirlineCode: string;
//   ffNumber: string;
//   selectedSeat?: string;
//   /** Keyed by `${legIndex}:${segmentIndex}` — a leg with stops has one
//    *  physical flight segment per stop, and each needs its own seat pick.
//    *  For a direct leg, segmentIndex is always 0 (key looks like "0:0"). */
//   selectedSeats?: Record<string, string>;
// }

// export interface SeatMap {
//   rows: number;
//   cols: string[];
//   occupied: string[];
//   premium: string[];
//   prices: Record<string, number>;
//   types: Record<string, "Window" | "Middle" | "Aisle">;
// }

// export interface ExtraSelection {
//   baggageLabel: string;
//   legIndex: number;
//   /** Index into ssrDataPerLeg[legIndex].segments — 0 for a direct leg,
//    *  0/1/(2) for a leg with one/two stops. Meals and baggage are sold
//    *  per PHYSICAL flight segment, not per leg, so this must be tracked
//    *  alongside legIndex to know which segment a pick belongs to. */
//   segmentIndex: number;
//   flightNumber?: string;
//   passengerId: number;
//   mealCode: string;
//   mealLabel: string;
//   mealPrice: number;
//   origin:string;
//   destination:string;
//   baggageCode: string;
//   baggageKg: number;
//   baggagePrice: number;
// }

// export interface BookingFormState {
//   passengers: PassengerData[];
//   contactEmail: string;
//   contactPhone: string;
//   gstNumber: string;
//   gstCompanyName: string;
//   gstCompanyEmail: string;
//   gstCompanyAddress: string;
//   promoCode: string;
//   promoApplied: boolean;
//   promoDiscount: number;
//   extras: ExtraSelection[];
// }

// export function emptyPassenger(type: "adult" | "child" | "infant"): PassengerData {
//   return {
//     title: type === "adult" ? "Mr" : "Mstr",
//     firstName: "", lastName: "", dob: "",
//     gender: "Male", panNumber: "", passportNo: "",
//     passportExpiry: "", nationality: "IN",
//     ffAirlineCode: "", ffNumber: "",
//   };
// }

// // ─── AIRLINE COLORS ─────────────────────────────────────────

// export const AIRLINE_COLORS: Record<string, string> = {
//   "6E": "#1b4b9e", AI: "#c8102e", SG: "#d03f2f",
//   UK: "#5c1c81", QP: "#e87722", IX: "#c8102e",
// };


// export const AirlineLogo = ({
//   code,
//   size = "md",
// }: {
//   code: string;
//   size?: "sm" | "md" | "lg";
// }) =>{
  
//   const [imgFailed, setImgFailed] = useState(false);

//   const color =
//     AIRLINE_COLORS[code] ?? { bg: "#475569", text: "#fff" };

//   const dims: Record<string, React.CSSProperties> = {
//     sm: { width: 32, height: 32, fontSize: 9, borderRadius: 8 },
//     md: { width: 40, height: 40, fontSize: 10, borderRadius: 11 },
//     lg: { width: 48, height: 48, fontSize: 11, borderRadius: 13 },
//   };

//   return (
//     <div
//       style={{
//         ...dims[size],
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         fontWeight: 900,
//         fontFamily: "'Sora', sans-serif",
//         flexShrink: 0,
//         overflow: "hidden",
//       }}
//     >
//       {imgFailed ? (
//         code
//       ) : (
//         <img
//           src={`/airlines/${code}.gif`}
//           alt={code}
//           style={{
//             width: "100%",
//             height: "100%",
//             objectFit: "contain",
//           }}
//           onError={() => setImgFailed(true)}
//         />
//       )}
//     </div>
//   );
// }

// // ─── STEP LABELS ────────────────────────────────────────────

// export const STEP_LABELS = [
//   "Fare Review",
//   "Passengers",
//   "Seat Selection",
//   "Extras",
//   "Review",
//   "Payment",
//   "Confirmation",
// ];

// // ─── FIELD LABEL ────────────────────────────────────────────

// export function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
//   return (
//     <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-1.5 select-none">
//       {children}
//       {required && <span className="text-rose-400 ml-1">✦</span>}
//     </label>
//   );
// }

// // ─── TEXT INPUT ─────────────────────────────────────────────

// export function TextInput({
//   value, onChange, placeholder, type = "text", className = "", disabled = false,
// }: {
//   value: string; onChange: (v: string) => void; placeholder?: string;
//   type?: string; className?: string; disabled?: boolean;
// }) {
//   return (
//     <input
//       type={type}
//       value={value}
//       disabled={disabled}
//       onChange={(e) => onChange(e.target.value)}
//       placeholder={placeholder}
//       className={[
//         "w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-800",
//         "bg-white border border-slate-200/80",
//         "placeholder-slate-300",
//         "focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/10",
//         "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
//         "transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
//         className,
//       ].join(" ")}
//     />
//   );
// }

// // ─── SELECT INPUT ────────────────────────────────────────────

// export function SelectInput({ value, onChange, options }: {
//   value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
// }) {
//   return (
//     <select
//       value={value}
//       onChange={(e) => onChange(e.target.value)}
//       className="w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-800
//         bg-white border border-slate-200/80
//         focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/10
//         transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)]
//         appearance-none cursor-pointer"
//       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
//     >
//       {options.map((o) => (
//         <option key={o.value} value={o.value}>{o.label}</option>
//       ))}
//     </select>
//   );
// }

// // ─── SECTION HEADING ─────────────────────────────────────────

// export function SectionHeading({
//   step, title, desc, accent = "blue",
// }: {
//   step?: string; title: string; desc?: string; accent?: "blue" | "violet" | "emerald" | "amber";
// }) {
//   const styles: Record<string, { bg: string; ring: string }> = {
//     blue:    { bg: "from-[#1a56db] to-[#1e40af]", ring: "ring-[#1a56db]/20" },
//     violet:  { bg: "from-violet-600 to-violet-800", ring: "ring-violet-500/20" },
//     emerald: { bg: "from-emerald-500 to-emerald-700", ring: "ring-emerald-500/20" },
//     amber:   { bg: "from-amber-400 to-amber-600", ring: "ring-amber-400/20" },
//   };
//   const s = styles[accent];
//   return (
//     <div className="flex items-start gap-3.5 mb-7">
//       {step && (
//         <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] bg-gradient-to-br ${s.bg} ring-4 ${s.ring}
//           font-black text-xs text-white flex items-center justify-center shrink-0 shadow-lg`}>
//           {step}
//         </div>
//       )}
//       <div className="pt-0.5">
//         <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">{title}</h2>
//         {desc && <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed font-medium">{desc}</p>}
//       </div>
//     </div>
//   );
// }

// // ─── ERROR BANNER ────────────────────────────────────────────

// export function ErrorBanner({ message }: { message: string }) {
//   return (
//     <div className="bg-rose-50 border border-rose-200/80 rounded-2xl px-4 py-3.5 mb-4 flex items-start gap-3
//       shadow-[0_1px_3px_rgba(244,63,94,0.08)]">
//       <span className="text-base shrink-0 mt-0.5">⚠️</span>
//       <p className="text-sm text-rose-700 font-semibold leading-snug">{message}</p>
//     </div>
//   );
// }

// // ─── COUPON / PROMO CODE ─────────────────────────────────────
// // Real backend-backed validate flow (dry run — never consumes a
// // redemption). Actual redemption via couponApi.apply() must happen once
// // a real bookingId exists, i.e. on the payment confirmation step — see
// // the note where this component is used.

// function couponReasonMessage(reason: CouponReasonCode): string {
//   switch (reason) {
//     case "COUPON_NOT_FOUND": return "Invalid coupon code.";
//     case "COUPON_INACTIVE": return "This coupon is no longer active.";
//     case "COUPON_NOT_YET_STARTED": return "This coupon isn't active yet.";
//     case "COUPON_EXPIRED": return "This coupon has expired.";
//     case "COUPON_EXHAUSTED": return "This coupon has reached its usage limit.";
//     case "CATEGORY_MISMATCH": return "This coupon isn't valid for flight bookings.";
//     case "MIN_BOOKING_AMOUNT_NOT_MET": return "Your booking amount is below the minimum required for this coupon.";
//     case "USER_LIMIT_REACHED": return "You've already used this coupon.";
//     default: return "This coupon can't be applied.";
//   }
// }

// export interface AppliedCoupon {
//   code: string;
//   discountAmount: number;
//   finalAmount: number;
// }

// export function CouponSection({
//   bookingAmount,
//   category = "FLIGHT",
//   applied,
//   onApply,
//   onRemove,
// }: {
//   /** The pre-discount amount to validate the coupon against (subtotal + seats + extras + taxes). */
//   bookingAmount: number;
//   category?: "FLIGHT" | "HOTEL" | "GENERAL";
//   applied: AppliedCoupon | null;
//   onApply: (result: AppliedCoupon) => void;
//   onRemove: () => void;
// }) {
//   const [code, setCode] = useState("");
//   const [status, setStatus] = useState<"idle" | "validating" | "error">("idle");
//   const [error, setError] = useState<string | null>(null);

//   // Tracks the amount the currently-applied coupon was validated against,
//   // so a change in fare (seat/extras update) invalidates a stale discount.
//   const validatedForRef = useRef<number | null>(null);

//   useEffect(() => {
//     if (applied && validatedForRef.current !== null && validatedForRef.current !== bookingAmount) {
//       validatedForRef.current = null;
//       onRemove();
//       setStatus("error");
//       setError("Fare amount changed — please re-apply your coupon.");
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [bookingAmount]);

//   const handleApply = async () => {
//     const trimmed = code.trim().toUpperCase();
//     if (!trimmed || status === "validating") return;

//     setStatus("validating");
//     setError(null);

//     try {
//       const result = await couponApi.validate({ code: trimmed, category, bookingAmount });
//       if (result.eligible) {
//         validatedForRef.current = bookingAmount;
//         setStatus("idle");
//         onApply({
//           code: trimmed,
//           discountAmount: result.discountAmount,
//           finalAmount: result.finalAmount,
//         });
//       } else {
//         setStatus("error");
//         setError(couponReasonMessage(result.reasonCode));
//       }
//     } catch (err) {
//       setStatus("error");
//       setError(err instanceof Error ? err.message : "Could not validate coupon.");
//     }
//   };

//   const handleRemove = () => {
//     validatedForRef.current = null;
//     setCode("");
//     setStatus("idle");
//     setError(null);
//     onRemove();
//   };
//   const { convert } = useCurrency();

//   return (
//     <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 mb-4">
//       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
//         🎟️ Promo / Coupon Code
//       </div>
//       <div className="flex gap-2">
//         <TextInput
//           value={code}
//           onChange={(v) => setCode(v.toUpperCase())}
//           placeholder="Enter coupon code"
//           disabled={!!applied || status === "validating"}
//         />
//         {applied ? (
//           <button
//             onClick={handleRemove}
//             className="shrink-0 rounded-xl border-2 border-slate-200 px-4 text-sm font-bold text-slate-700
//               hover:border-slate-300 hover:bg-slate-50 transition-all"
//           >
//             Remove
//           </button>
//         ) : (
//           <button
//             onClick={handleApply}
//             disabled={status === "validating" || !code.trim()}
//             className="shrink-0 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white
//               hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//           >
//             {status === "validating" ? "Checking…" : "Apply"}
//           </button>
//         )}
//       </div>

//       {applied && (
//         <div className="mt-2 text-xs font-bold text-emerald-600">
//           ✓ {applied.code} applied — saving {convert(applied.discountAmount)}
//         </div>
//       )}

//       {status === "error" && error && (
//         <div className="mt-2 text-xs font-bold text-rose-600">⚠️ {error}</div>
//       )}
//     </div>
//   );
// }

// // ─── SEAT PRICE HELPER ───────────────────────────────────────

// export function calcSeatTotal(
//   passengers: PassengerData[],
//   seatMaps: Record<string, SeatMap>,
// ): number {
//   let total = 0;
//   for (const pax of passengers) {
//     if (pax.selectedSeats) {
//       for (const [key, seat] of Object.entries(pax.selectedSeats)) {
//         const map = seatMaps[key];
//         if (map && seat) total += map.prices[seat] ?? 0;
//       }
//     } else if (pax.selectedSeat) {
//       const map = seatMaps["0:0"];
//       if (map) total += map.prices[pax.selectedSeat] ?? 0;
//     }
//   }
//   return total;
// }

// // ─── FARE CALCULATION ────────────────────────────────────────

// export function calcFares({
//   tier, returnTier, multiCityLegs, adults, children, infants, extras,
//   passengers, seatMaps,
// }: {
//   tier: FareTier;
//   returnTier?: FareTier;
//   multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
//   adults: number; children: number; infants: number;
//   extras: ExtraSelection[];
//   passengers?: PassengerData[];
//   seatMaps?: Record<string, SeatMap>;
// }) {
//   const adultUnit  = tier.adultFare  ?? tier.price;
//   const childUnit  = tier.childFare  ?? Math.round(tier.price * 0.75);
//   const infantUnit = tier.infantFare ?? Math.round(tier.price * 0.1);

//   const baseFares = {
//     adult:  adultUnit  * adults,
//     child:  childUnit  * children,
//     infant: infantUnit * infants,
//     return: returnTier
//       ? ((returnTier.adultFare ?? returnTier.price) * adults
//         + (returnTier.childFare ?? Math.round(returnTier.price * 0.75)) * children
//         + (returnTier.infantFare ?? Math.round(returnTier.price * 0.1)) * infants)
//       : 0,
//     multiCity: (multiCityLegs ?? []).slice(1).reduce((sum, leg) =>
//       sum
//       + (leg.tier.adultFare  ?? leg.tier.price) * adults
//       + (leg.tier.childFare  ?? Math.round(leg.tier.price * 0.75)) * children
//       + (leg.tier.infantFare ?? Math.round(leg.tier.price * 0.1))  * infants,
//       0,
//     ),
//   };

//   //const subtotal = Object.values(baseFares).reduce((a, b) => a + b, 0);
  
//   const fallbackSubtotal = Object.values(baseFares).reduce((a, b) => a + b, 0);

//   const outboundOffered = tier.totalOfferedFare;
//   const returnOffered   = returnTier?.totalOfferedFare;
//   const multiCityOffered = (multiCityLegs ?? []).slice(1)
//     .reduce<number | undefined>((sum, leg) => {
//       if (sum === undefined || leg.tier.totalOfferedFare === undefined) return undefined;
//       return sum + leg.tier.totalOfferedFare;
//     }, 0);

//   const subtotal =
//     outboundOffered !== undefined
//     && (returnTier === undefined || returnOffered !== undefined)
//     && (!(multiCityLegs && multiCityLegs.length > 1) || multiCityOffered !== undefined)
//       ? outboundOffered + (returnOffered ?? 0) + (multiCityOffered ?? 0)
//       : fallbackSubtotal;
   
//   const extrasTotal = extras.reduce((sum, e) => sum + e.mealPrice + e.baggagePrice, 0);

//   // ── Live seat total: always derived from current passenger seat selections ──
//   const seatsTotal = (passengers && seatMaps)
//     ? calcSeatTotal(passengers, seatMaps)
//     : (tier.seatCharges ?? 0);

//   // TBO OfferedFare is tax-inclusive
//   const taxes = 0;
//   const taxesIncluded = true;

//   // Convenience fee: display-only, waived
//   const convenienceFeeDisplay = Math.round(subtotal * 0.07);

//   return { baseFares, subtotal, extrasTotal, seatsTotal, taxes, taxesIncluded, convenienceFeeDisplay };
// }

// // ─── PRICE SIDEBAR ───────────────────────────────────────────

// export function PriceSidebar({
//   flight, tier, returnFlight, returnTier, multiCityLegs,
//   adults, children, infants, discount, extras,
//   passengers, seatMaps,
//   currentStep,
// }: {
//   flight: DisplayFlight; tier: FareTier;
//   returnFlight?: DisplayFlight; returnTier?: FareTier;
//   multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
//   adults: number; children: number; infants: number;
//   discount: number; extras: ExtraSelection[];
//   passengers?: PassengerData[];
//   seatMaps?: Record<string, SeatMap>;
//   currentStep: number;
// }) {
//   const { convert } = useCurrency();
//   const { baseFares, subtotal, extrasTotal, seatsTotal, taxes, taxesIncluded, convenienceFeeDisplay } =
//     calcFares({ tier, returnTier, multiCityLegs, adults, children, infants, extras, passengers, seatMaps });

//   const total = Math.round(subtotal + extrasTotal + seatsTotal + taxes - discount);

//   const isRoundTrip = !!returnFlight && !!returnTier;
//   const isMultiCity = !!(multiCityLegs && multiCityLegs.length > 1);
//   const travellers  = adults + children + infants;

//   return (
//     <div className="bg-white rounded-3xl border border-slate-100/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden sticky top-24">

//       {/* ── Header gradient ── */}
//       <div className="relative overflow-hidden px-5 py-5"
// style={{ background: "linear-gradient(135deg, #7a2e1d 0%, #a84b32 60%, #d06549 100%)" }}>
//         {/* Decorative orbs */}
//         <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full"
//           style={{ background: "radial-gradient(circle, rgba(255,200,150,0.2) 0%, transparent 70%)" }} />
//         <div className="absolute bottom-0 left-0 w-16 h-16 rounded-full"
//           style={{ background: "radial-gradient(circle, rgba(208,101,73,0.2) 0%, transparent 70%)" }} />

//         <div className="relative">
//           <div className="flex items-center gap-1.5 mb-3">
//             <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
//             <span className="text-[9px] font-black uppercase tracking-[0.18em] text-blue-200/70">
//               Live Price Summary
//             </span>
//           </div>
//           <span className="font-black text-[28px] text-white leading-none tracking-tight">
//             {convert(total)}
//           </span>
//           <div className="text-[11px] text-blue-200/60 mt-1.5 font-medium">
//             {travellers} traveller{travellers !== 1 ? "s" : ""} · all taxes included
//           </div>

//           {/* ── Fare breakdown: Base + Tax per traveller type — always visible, display only ── */}
//           <div className="mt-3 pt-3 border-t border-white/10 space-y-1.5">
//             {adults > 0 && (
//               <div className="flex justify-between items-center text-[11px]">
//                 <span className="text-blue-200/70 font-medium">Adult (base + tax)</span>
//                 <span className="text-white font-semibold">
//                   {convert(tier.adultBase ?? 0)} + {convert(tier.adultTax ?? 0)}
//                 </span>
//               </div>
//             )}
//             {children > 0 && (
//               <div className="flex justify-between items-center text-[11px]">
//                 <span className="text-blue-200/70 font-medium">Child (base + tax)</span>
//                 <span className="text-white font-semibold">
//                   {convert(tier.childBase ?? 0)} + {convert(tier.childTax ?? 0)}
//                 </span>
//               </div>
//             )}
//             {infants > 0 && (
//               <div className="flex justify-between items-center text-[11px]">
//                 <span className="text-blue-200/70 font-medium">Infant (base + tax)</span>
//                 <span className="text-white font-semibold">
//                   {convert(tier.infantBase ?? 0)} + {convert(tier.infantTax ?? 0)}
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="p-4 space-y-4">

//         {/* ── Route pills ── */}
//         <div className="space-y-2">
//           <FlightRoutePill
//             flight={flight}
//             label={isRoundTrip ? "Outbound" : isMultiCity ? "Leg 1" : undefined}
//           />
//           {isRoundTrip && returnFlight && (
//             <FlightRoutePill flight={returnFlight} label="Return" />
//           )}
//           {isMultiCity && multiCityLegs!.slice(1).map((leg, i) => (
//             <FlightRoutePill key={i} flight={leg.flight} label={`Leg ${i + 2}`} />
//           ))}
//         </div>

//         {/* ── Fare line items ── */}
//         <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs">
//           {adults   > 0 && <LineItem label={`${adults} Adult${adults > 1 ? "s" : ""}`}           value={baseFares.adult} />}
//           {children > 0 && <LineItem label={`${children} Child${children > 1 ? "ren" : ""}`}     value={baseFares.child} />}
//           {infants  > 0 && <LineItem label={`${infants} Infant${infants > 1 ? "s" : ""}`}        value={baseFares.infant} />}
//           {baseFares.return    > 0 && <LineItem label="Return fare"      value={baseFares.return} />}
//           {baseFares.multiCity > 0 && <LineItem label="Multi-city fares" value={baseFares.multiCity} />}

//           {/* ── Live seat total — updates instantly as seats are picked ── */}
//           {seatsTotal > 0 && (
//             <div className="flex justify-between items-center">
//               <span className="text-slate-400 flex items-center gap-1">
//                 Seat upgrades
//                 <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
//               </span>
//               <span className="font-semibold text-blue-600">{convert(seatsTotal)}</span>
//             </div>
//           )}

//           {extrasTotal > 0 && (
//             <LineItem label="Meals & baggage" value={extrasTotal} accent="violet" />
//           )}

//           {taxesIncluded ? (
//             <div className="flex justify-between items-center">
//               <span className="text-slate-400">Taxes & fees</span>
//               <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200/60
//                 rounded-full px-2 py-0.5 font-black uppercase tracking-wider">Included</span>
//             </div>
//           ) : (
//             taxes > 0 && <LineItem label="Taxes & fees (5%)" value={taxes} />
//           )}

//           {/* Convenience fee — display only, waived */}
//           <div className="flex justify-between items-center">
//             <span className="text-slate-400">Convenience fee</span>
//             <span className="flex items-center gap-1.5">
//               <span className="line-through text-slate-300 font-medium text-[11px]">{convert(convenienceFeeDisplay)}</span>
//               <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200/60
//                 rounded-full px-2 py-0.5 font-black uppercase tracking-wider">Free</span>
//             </span>
//           </div>

//           {discount > 0 && (
//             <LineItem label="Promo discount" value={-discount} accent="emerald" />
//           )}
//         </div>

//         {/* ── Subtotal ── */}
//         <div className="border-t border-dashed border-slate-100 pt-3 flex justify-between items-center text-xs">
//           <span className="text-slate-400 font-medium">Subtotal</span>
//           <span className="text-slate-500 font-semibold">{convert(subtotal + extrasTotal + seatsTotal + taxes)}</span>
//         </div>

//         {/* ── Total payable ── */}
//         <div className="bg-gradient-to-r from-[#f0f5ff] to-[#eff6ff] rounded-2xl px-4 py-3.5
//           flex justify-between items-center border border-[#dbeafe]/80">
//           <span className="font-black text-slate-800 text-sm">Total payable</span>
//           <span className="font-black text-[#1a56db] text-xl tracking-tight">{convert(total)}</span>
//         </div>

//         {/* ── Baggage info ── */}
//         <div className="bg-slate-50/80 rounded-2xl p-3.5 space-y-2 border border-slate-100">
//           <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.14em] mb-1">Included in fare</div>
//           <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
//             <span className="text-base">🎒</span>
//             <span>Cabin — {tier.cabinBag}</span>
//           </div>
//           <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
//             <span className="text-base">🧳</span>
//             <span>Check-in — {tier.checkinBag}</span>
//           </div>
//         </div>

//         {/* ── Step progress ── */}
//         <div className="space-y-1 pt-1">
//           {STEP_LABELS.slice(0, 6).map((label, i) => {
//             const done   = i + 1 < currentStep;
//             const active = i + 1 === currentStep;
//             return (
//               <div key={label} className={`flex items-center gap-2.5 text-[10px] font-semibold py-0.5 transition-colors ${
//                 done ? "text-emerald-600" : active ? "text-[#1a56db]" : "text-slate-300"
//               }`}>
//                 <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 transition-all ${
//                   done ? "bg-emerald-100 text-emerald-600"
//                   : active ? "bg-[#1a56db]/10 text-[#1a56db]"
//                   : "bg-slate-100 text-slate-300"
//                 }`}>
//                   {done ? "✓" : i + 1}
//                 </div>
//                 {label}
//                 {active && (
//                   <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1a56db] animate-pulse" />
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// }

// function FlightRoutePill({ flight, label }: { flight: DisplayFlight; label?: string }) {
//   return (
//     <div className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/80
//       rounded-xl px-3 py-2.5 transition-colors duration-150 border border-slate-100/80">
//       <div className="shrink-0">
//         <AirlineLogo code={flight.airlineCode} size="sm" />
//       </div>
//       <div className="flex-1 min-w-0">
//         <div className="text-[11px] font-bold text-slate-700 truncate tracking-wide">
//           {flight.fromCode} <span className="text-slate-300 font-normal">→</span> {flight.toCode}
//         </div>
//         <div className="text-[10px] text-slate-400 font-medium mt-0.5">{flight.departDate}</div>
//       </div>
//       {label && (
//         <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.12em]
//           bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 shrink-0">
//           {label}
//         </div>
//       )}
//     </div>
//   );
// }

// function LineItem({ label, value, accent }: { label: string; value: number; accent?: "blue" | "violet" | "emerald" }) {
//   const textColor =
//     accent === "emerald" ? "text-emerald-600"
//     : accent === "violet" ? "text-violet-600"
//     : accent === "blue"   ? "text-blue-600"
//     : "text-slate-600";
  
//   const { convert } = useCurrency();
//   return (
//     <div className="flex justify-between items-center">
//       <span className="text-slate-400">{label}</span>
//       <span className={`font-semibold ${textColor}`}>
//         {value < 0 ? `−${convert(-value)}` : convert(value)}
//       </span>
//     </div>
//   );
// }

// // ─── MOBILE PRICE BAR ─────────────────────────────────────────
// // Shown at bottom of screen on mobile/tablet instead of the sidebar

// export function MobilePriceBar({
//   flight, tier, returnFlight, returnTier, multiCityLegs,
//   adults, children, infants, discount, extras,
//   passengers, seatMaps,
//   currentStep,
// }: {
//   flight: DisplayFlight; tier: FareTier;
//   returnFlight?: DisplayFlight; returnTier?: FareTier;
//   multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
//   adults: number; children: number; infants: number;
//   discount: number; extras: ExtraSelection[];
//   passengers?: PassengerData[];
//   seatMaps?: Record<string, SeatMap>;
//   currentStep: number;
// }) {
//   const { subtotal, extrasTotal, seatsTotal, taxes } = calcFares({
//     tier, returnTier, multiCityLegs, adults, children, infants,
//     extras, passengers, seatMaps,
//   });
//   const total = Math.round(subtotal + extrasTotal + seatsTotal + taxes - discount);
//   const travellers = adults + children + infants;
//   const { convert } = useCurrency();

//   return (
//     <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40
//       bg-white border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]
//       px-4 py-3 flex items-center gap-3">
//       <div className="flex-1 min-w-0">
//         <div className="flex items-center gap-1.5">
//           <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
//           <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
//             {travellers} traveller{travellers !== 1 ? "s" : ""} · all-inclusive
//           </span>
//         </div>
//         <div className="font-black text-xl text-slate-900 tracking-tight leading-tight">
//           {convert(total)}
//         </div>
//       </div>
//       {/* Mini step indicator */}
//       <div className="flex items-center gap-1 shrink-0">
//         {STEP_LABELS.slice(0, 6).map((_, i) => (
//           <div key={i} className={`rounded-full transition-all duration-300 ${
//             i + 1 < currentStep  ? "w-1.5 h-1.5 bg-emerald-500"
//             : i + 1 === currentStep ? "w-4 h-1.5 bg-[#1a56db]"
//             : "w-1.5 h-1.5 bg-slate-200"
//           }`} />
//         ))}
//       </div>
//     </div>
//   );
// }

// // ─── BOOKING SHELL LAYOUT ────────────────────────────────────

// export function BookingShell({
//   flight, tier, returnFlight, returnTier, multiCityLegs,
//   adults, childcount, infants, discount, extras,
//   passengers, seatMaps,
//   currentStep, onBack, children,
// }: {
//   flight: DisplayFlight; tier: FareTier;
//   returnFlight?: DisplayFlight; returnTier?: FareTier;
//   multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
//   adults: number; childcount: number; infants: number;
//   discount: number; extras: ExtraSelection[];
//   passengers?: PassengerData[];
//   seatMaps?: Record<string, SeatMap>;
//   currentStep: number;
//   onBack: () => void;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen pb-24 lg:pb-0" style={{ background: "#f5f6fa", fontFamily: "'DM Sans', system-ui, sans-serif" }}>

//       {/* ── Top navigation ── */}
//       <header className="bg-white border-b border-slate-100 sticky top-0 z-30
//         shadow-[0_1px_0_rgba(0,0,0,0.04),0_2px_12px_rgba(0,0,0,0.03)]">
//         <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-4 sm:gap-6">

//           {/* Back button */}
//           <button
//             onClick={onBack}
//             className="group flex items-center gap-1.5 text-slate-400 hover:text-slate-800 transition-colors duration-150 shrink-0"
//           >
//             <div className="w-7 h-7 rounded-lg border border-slate-200 group-hover:border-slate-300
//               flex items-center justify-center transition-colors duration-150">
//               <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//               </svg>
//             </div>
//             <span className="hidden sm:block text-sm font-semibold">Back</span>
//           </button>

//           {/* Brand mark */}
//           <div className="shrink-0 hidden sm:flex items-center gap-2">
//             <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#1a56db] to-[#1e40af] flex items-center justify-center">
//               <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                   d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//               </svg>
//             </div>
//           </div>

//           {/* ── Step indicators ── */}
//           <div className="flex-1 flex items-center justify-center gap-0.5 overflow-x-auto scrollbar-none min-w-0">
//             {STEP_LABELS.slice(0, 7).map((label, i) => {
//               const stepNum = i + 1;
//               const done    = stepNum < currentStep;
//               const active  = stepNum === currentStep;
//               return (
//                 <div key={label} className="flex items-center gap-0.5 shrink-0">
//                   <div className="flex items-center gap-1.5">
//                     <div className={`
//                       w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center
//                       text-[9px] sm:text-[10px] font-black transition-all duration-200
//                       ${done   ? "bg-emerald-500 text-white shadow-[0_0_0_3px_rgba(16,185,129,0.15)]"
//                       : active ? "bg-[#1a56db] text-white shadow-[0_0_0_3px_rgba(26,86,219,0.15)]"
//                                : "bg-slate-100 text-slate-400"}`}>
//                       {done ? (
//                         <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
//                         </svg>
//                       ) : stepNum}
//                     </div>
//                     <span className={`hidden lg:block text-[10px] font-semibold whitespace-nowrap transition-colors duration-200 ${
//                       active ? "text-[#1a56db]" : done ? "text-emerald-500" : "text-slate-300"
//                     }`}>{label}</span>
//                   </div>
//                   {i < STEP_LABELS.length - 2 && (
//                     <div className={`w-3 sm:w-5 h-px mx-0.5 shrink-0 transition-colors duration-300 ${
//                       done ? "bg-emerald-300" : "bg-slate-150"
//                     }`} />
//                   )}
//                 </div>
//               );
//             })}
//           </div>

//           {/* Spacer for symmetry */}
//           <div className="w-7 sm:w-20 shrink-0" />
//         </div>
//       </header>

//       {/* ── Main content layout ── */}
//       <div className="max-w-6xl mx-auto px-4 sm:px-5 py-5 sm:py-8 flex flex-col lg:flex-row gap-5 lg:gap-8 items-start">

//         {/* Content area */}
//         <div className="flex-1 min-w-0 w-full">
//           {children}
//         </div>

//         {/* Desktop sidebar */}
//         <aside className="w-full lg:w-72 shrink-0 hidden lg:block">
//           <PriceSidebar
//             flight={flight} tier={tier}
//             returnFlight={returnFlight} returnTier={returnTier}
//             multiCityLegs={multiCityLegs}
//             adults={adults} children={childcount} infants={infants}
//             discount={discount} extras={extras}
//             passengers={passengers}
//             seatMaps={seatMaps}
//             currentStep={currentStep}
//           />
//         </aside>
//       </div>

//       {/* ── Mobile sticky price bar ── */}
//       <MobilePriceBar
//         flight={flight} tier={tier}
//         returnFlight={returnFlight} returnTier={returnTier}
//         multiCityLegs={multiCityLegs}
//         adults={adults} children={childcount} infants={infants}
//         discount={discount} extras={extras}
//         passengers={passengers}
//         seatMaps={seatMaps}
//         currentStep={currentStep}
//       />
//     </div>
//   );
// }



// ============================================================
//  BookingShared.tsx — Shared types, components, price sidebar,
//  and the real fare/coupon/seat-map/multi-city calculation
//  engine that both PriceSidebar (here) and BookingSummaryPanel
//  (its own file, BookingSummaryPanel.tsx) are built on top of.
//
//  Exported for reuse by BookingSummaryPanel.tsx:
//    - calcFares, calcSeatTotal, collectSelectedSeatCodes
//    - useFareHoldTimer  (real countdown — see below)
//    - FlightRoutePill, AirlineLogo, AIRLINE_COLORS
//    - all the shared types (PassengerData, SeatMap, ExtraSelection, ...)
//
//  FARE-HOLD COUNTDOWN
//  --------------------
//  `useFareHoldTimer` is a real ticking countdown (setInterval,
//  re-renders every second) against an actual expiry timestamp —
//  not a static string. BookingShell computes one `fareHoldExpiresAt`
//  timestamp per booking session (stable across re-renders via a
//  ref, or taken straight from a prop if the caller already tracks
//  a hold from the backend) and threads it into both PriceSidebar
//  and MobilePriceBar, so every countdown on screen agrees. Pass the
//  same `fareHoldExpiresAt` into BookingSummaryPanel if you use it too.
// ============================================================

import type { DisplayFlight, FareTier } from "../../lib/types_t";
import { formatINR } from "../../lib/flights_api";
import { useState, useEffect, useRef, useMemo } from "react";
import { couponApi, type CouponReasonCode } from "../../lib/couponApi";
import { useCurrency } from "../../context/currencyContext";
import { Check, Shield, Clock } from "lucide-react";
import { BookingStepper } from "./organisms/BookingStepper";

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
  selectedSeat?: string;
  /** Keyed by `${legIndex}:${segmentIndex}` — a leg with stops has one
   *  physical flight segment per stop, and each needs its own seat pick.
   *  For a direct leg, segmentIndex is always 0 (key looks like "0:0"). */
  selectedSeats?: Record<string, string>;
}

export interface SeatMap {
  rows: number;
  cols: string[];
  occupied: string[];
  premium: string[];
  prices: Record<string, number>;
  types: Record<string, "Window" | "Middle" | "Aisle">;
}

export interface ExtraSelection {
  baggageLabel: string;
  legIndex: number;
  /** Index into ssrDataPerLeg[legIndex].segments — 0 for a direct leg,
   *  0/1/(2) for a leg with one/two stops. Meals and baggage are sold
   *  per PHYSICAL flight segment, not per leg, so this must be tracked
   *  alongside legIndex to know which segment a pick belongs to. */
  segmentIndex: number;
  flightNumber?: string;
  passengerId: number;
  mealCode: string;
  mealLabel: string;
  mealPrice: number;
  origin:string;
  destination:string;
  baggageCode: string;
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


export const AirlineLogo = ({
  code,
  size = "md",
}: {
  code: string;
  size?: "sm" | "md" | "lg";
}) =>{
  
  const [imgFailed, setImgFailed] = useState(false);

  const color =
    AIRLINE_COLORS[code] ?? { bg: "#475569", text: "#fff" };

  const dims: Record<string, React.CSSProperties> = {
    sm: { width: 32, height: 32, fontSize: 9, borderRadius: 8 },
    md: { width: 40, height: 40, fontSize: 10, borderRadius: 11 },
    lg: { width: 48, height: 48, fontSize: 11, borderRadius: 13 },
  };

  return (
    <div
      style={{
        ...dims[size],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontFamily: "'Sora', sans-serif",
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      {imgFailed ? (
        code
      ) : (
        <img
          src={`/airlines/${code}.gif`}
          alt={code}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          onError={() => setImgFailed(true)}
        />
      )}
    </div>
  );
}

// ─── STEP LABELS ────────────────────────────────────────────
// Kept for anything outside this file that still imports STEP_LABELS.
// BookingStepper.tsx also exports its own BOOKING_STEPS with the same
// values — both are used interchangeably here.

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
    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em] mb-1.5 select-none">
      {children}
      {required && <span className="text-rose-400 ml-1">✦</span>}
    </label>
  );
}

// ─── TEXT INPUT ─────────────────────────────────────────────

export function TextInput({
  value, onChange, placeholder, type = "text", className = "", disabled = false,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; className?: string; disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={[
        "w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-800",
        "bg-white border border-slate-200/80",
        "placeholder-slate-300",
        "focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/10",
        "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
        "transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        className,
      ].join(" ")}
    />
  );
}

// ─── SELECT INPUT ────────────────────────────────────────────

export function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl px-4 py-3 text-sm font-medium text-slate-800
        bg-white border border-slate-200/80
        focus:outline-none focus:border-[#1a56db] focus:ring-2 focus:ring-[#1a56db]/10
        transition-all duration-150 shadow-[0_1px_2px_rgba(0,0,0,0.04)]
        appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ─── SECTION HEADING ─────────────────────────────────────────

export function SectionHeading({
  step, title, desc, accent = "blue",
}: {
  step?: string; title: string; desc?: string; accent?: "blue" | "violet" | "emerald" | "amber";
}) {
  const styles: Record<string, { bg: string; ring: string }> = {
    blue:    { bg: "from-[#1a56db] to-[#1e40af]", ring: "ring-[#1a56db]/20" },
    violet:  { bg: "from-violet-600 to-violet-800", ring: "ring-violet-500/20" },
    emerald: { bg: "from-emerald-500 to-emerald-700", ring: "ring-emerald-500/20" },
    amber:   { bg: "from-amber-400 to-amber-600", ring: "ring-amber-400/20" },
  };
  const s = styles[accent];
  return (
    <div className="flex items-start gap-3.5 mb-7">
      {step && (
        <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] bg-gradient-to-br ${s.bg} ring-4 ${s.ring}
          font-black text-xs text-white flex items-center justify-center shrink-0 shadow-lg`}>
          {step}
        </div>
      )}
      <div className="pt-0.5">
        <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">{title}</h2>
        {desc && <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed font-medium">{desc}</p>}
      </div>
    </div>
  );
}

// ─── ERROR BANNER ────────────────────────────────────────────

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="bg-rose-50 border border-rose-200/80 rounded-2xl px-4 py-3.5 mb-4 flex items-start gap-3
      shadow-[0_1px_3px_rgba(244,63,94,0.08)]">
      <span className="text-base shrink-0 mt-0.5">⚠️</span>
      <p className="text-sm text-rose-700 font-semibold leading-snug">{message}</p>
    </div>
  );
}

// ─── COUPON / PROMO CODE ─────────────────────────────────────
// Real backend-backed validate flow (dry run — never consumes a
// redemption). Actual redemption via couponApi.apply() must happen once
// a real bookingId exists, i.e. on the payment confirmation step — see
// the note where this component is used.

function couponReasonMessage(reason: CouponReasonCode): string {
  switch (reason) {
    case "COUPON_NOT_FOUND": return "Invalid coupon code.";
    case "COUPON_INACTIVE": return "This coupon is no longer active.";
    case "COUPON_NOT_YET_STARTED": return "This coupon isn't active yet.";
    case "COUPON_EXPIRED": return "This coupon has expired.";
    case "COUPON_EXHAUSTED": return "This coupon has reached its usage limit.";
    case "CATEGORY_MISMATCH": return "This coupon isn't valid for flight bookings.";
    case "MIN_BOOKING_AMOUNT_NOT_MET": return "Your booking amount is below the minimum required for this coupon.";
    case "USER_LIMIT_REACHED": return "You've already used this coupon.";
    default: return "This coupon can't be applied.";
  }
}

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
  finalAmount: number;
}

export function CouponSection({
  bookingAmount,
  category = "FLIGHT",
  applied,
  onApply,
  onRemove,
}: {
  /** The pre-discount amount to validate the coupon against (subtotal + seats + extras + taxes). */
  bookingAmount: number;
  category?: "FLIGHT" | "HOTEL" | "GENERAL";
  applied: AppliedCoupon | null;
  onApply: (result: AppliedCoupon) => void;
  onRemove: () => void;
}) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "validating" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  // Tracks the amount the currently-applied coupon was validated against,
  // so a change in fare (seat/extras update) invalidates a stale discount.
  const validatedForRef = useRef<number | null>(null);

  useEffect(() => {
    if (applied && validatedForRef.current !== null && validatedForRef.current !== bookingAmount) {
      validatedForRef.current = null;
      onRemove();
      setStatus("error");
      setError("Fare amount changed — please re-apply your coupon.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingAmount]);

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed || status === "validating") return;

    setStatus("validating");
    setError(null);

    try {
      const result = await couponApi.validate({ code: trimmed, category, bookingAmount });
      if (result.eligible) {
        validatedForRef.current = bookingAmount;
        setStatus("idle");
        onApply({
          code: trimmed,
          discountAmount: result.discountAmount,
          finalAmount: result.finalAmount,
        });
      } else {
        setStatus("error");
        setError(couponReasonMessage(result.reasonCode));
      }
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Could not validate coupon.");
    }
  };

  const handleRemove = () => {
    validatedForRef.current = null;
    setCode("");
    setStatus("idle");
    setError(null);
    onRemove();
  };
  const { convert } = useCurrency();

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 mb-4">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
        🎟️ Promo / Coupon Code
      </div>
      <div className="flex gap-2">
        <TextInput
          value={code}
          onChange={(v) => setCode(v.toUpperCase())}
          placeholder="Enter coupon code"
          disabled={!!applied || status === "validating"}
        />
        {applied ? (
          <button
            onClick={handleRemove}
            className="shrink-0 rounded-xl border-2 border-slate-200 px-4 text-sm font-bold text-slate-700
              hover:border-slate-300 hover:bg-slate-50 transition-all"
          >
            Remove
          </button>
        ) : (
          <button
            onClick={handleApply}
            disabled={status === "validating" || !code.trim()}
            className="shrink-0 rounded-xl bg-slate-900 px-5 text-sm font-bold text-white
              hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {status === "validating" ? "Checking…" : "Apply"}
          </button>
        )}
      </div>

      {applied && (
        <div className="mt-2 text-xs font-bold text-emerald-600">
          ✓ {applied.code} applied — saving {convert(applied.discountAmount)}
        </div>
      )}

      {status === "error" && error && (
        <div className="mt-2 text-xs font-bold text-rose-600">⚠️ {error}</div>
      )}
    </div>
  );
}

// ─── SEAT PRICE HELPER ───────────────────────────────────────

export function calcSeatTotal(
  passengers: PassengerData[],
  seatMaps: Record<string, SeatMap>,
): number {
  let total = 0;
  for (const pax of passengers) {
    if (pax.selectedSeats) {
      for (const [key, seat] of Object.entries(pax.selectedSeats)) {
        const map = seatMaps[key];
        if (map && seat) total += map.prices[seat] ?? 0;
      }
    } else if (pax.selectedSeat) {
      const map = seatMaps["0:0"];
      if (map) total += map.prices[pax.selectedSeat] ?? 0;
    }
  }
  return total;
}

/** Flattened list of the actual seat codes a passenger set has picked —
 *  used purely for display (e.g. the "Your Seats" card in PriceSidebar
 *  and BookingSummaryPanel). */
export function collectSelectedSeatCodes(passengers: PassengerData[]): string[] {
  const seats: string[] = [];
  for (const pax of passengers) {
    if (pax.selectedSeats) {
      for (const seat of Object.values(pax.selectedSeats)) {
        if (seat) seats.push(seat);
      }
    } else if (pax.selectedSeat) {
      seats.push(pax.selectedSeat);
    }
  }
  return seats;
}

// ─── FARE-HOLD COUNTDOWN ──────────────────────────────────────
// Real ticking timer — re-renders every second against an actual
// expiry timestamp. If no `expiresAt` is supplied it falls back to
// `fallbackMinutes` from the moment the hook first mounts (so a
// component can be dropped in standalone and still tick down for
// real, not just display a static string).

export interface FareHoldTimer {
  /** MM:SS, e.g. "04:32" */
  label: string;
  secondsLeft: number;
  /** true once under 2 minutes remain — drives the red/urgent styling */
  urgent: boolean;
  /** true once the hold has actually run out */
  expired: boolean;
}

export function useFareHoldTimer(expiresAt?: number | null, fallbackMinutes = 15): FareHoldTimer {
  const fallbackRef = useRef<number | null>(null);
  if (fallbackRef.current === null) {
    fallbackRef.current = Date.now() + fallbackMinutes * 60 * 1000;
  }
  const target = expiresAt ?? fallbackRef.current;

  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const secondsLeft = Math.max(0, Math.round((target - now) / 1000));
  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, "0");
  const ss = (secondsLeft % 60).toString().padStart(2, "0");

  return {
    label: `${mm}:${ss}`,
    secondsLeft,
    urgent: secondsLeft <= 120,
    expired: secondsLeft <= 0,
  };
}

// ─── FARE CALCULATION ────────────────────────────────────────

export function calcFares({
  tier, returnTier, multiCityLegs, adults, children, infants, extras,
  passengers, seatMaps,
}: {
  tier: FareTier;
  returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  adults: number; children: number; infants: number;
  extras: ExtraSelection[];
  passengers?: PassengerData[];
  seatMaps?: Record<string, SeatMap>;
}) {
  const adultUnit  = tier.adultFare  ?? tier.price;
  const childUnit  = tier.childFare  ?? Math.round(tier.price * 0.75);
  const infantUnit = tier.infantFare ?? Math.round(tier.price * 0.1);

  const baseFares = {
    adult:  adultUnit  * adults,
    child:  childUnit  * children,
    infant: infantUnit * infants,
    return: returnTier
      ? ((returnTier.adultFare ?? returnTier.price) * adults
        + (returnTier.childFare ?? Math.round(returnTier.price * 0.75)) * children
        + (returnTier.infantFare ?? Math.round(returnTier.price * 0.1)) * infants)
      : 0,
    multiCity: (multiCityLegs ?? []).slice(1).reduce((sum, leg) =>
      sum
      + (leg.tier.adultFare  ?? leg.tier.price) * adults
      + (leg.tier.childFare  ?? Math.round(leg.tier.price * 0.75)) * children
      + (leg.tier.infantFare ?? Math.round(leg.tier.price * 0.1))  * infants,
      0,
    ),
  };

  //const subtotal = Object.values(baseFares).reduce((a, b) => a + b, 0);
  
  const fallbackSubtotal = Object.values(baseFares).reduce((a, b) => a + b, 0);

  const outboundOffered = tier.totalOfferedFare;
  const returnOffered   = returnTier?.totalOfferedFare;
  const multiCityOffered = (multiCityLegs ?? []).slice(1)
    .reduce<number | undefined>((sum, leg) => {
      if (sum === undefined || leg.tier.totalOfferedFare === undefined) return undefined;
      return sum + leg.tier.totalOfferedFare;
    }, 0);

  const subtotal =
    outboundOffered !== undefined
    && (returnTier === undefined || returnOffered !== undefined)
    && (!(multiCityLegs && multiCityLegs.length > 1) || multiCityOffered !== undefined)
      ? outboundOffered + (returnOffered ?? 0) + (multiCityOffered ?? 0)
      : fallbackSubtotal;
   
  const extrasTotal = extras.reduce((sum, e) => sum + e.mealPrice + e.baggagePrice, 0);

  // ── Live seat total: always derived from current passenger seat selections ──
  const seatsTotal = (passengers && seatMaps)
    ? calcSeatTotal(passengers, seatMaps)
    : (tier.seatCharges ?? 0);

  // TBO OfferedFare is tax-inclusive
  const taxes = 0;
  const taxesIncluded = true;

  // Convenience fee: display-only, waived
  const convenienceFeeDisplay = Math.round(subtotal * 0.07);

  return { baseFares, subtotal, extrasTotal, seatsTotal, taxes, taxesIncluded, convenienceFeeDisplay };
}

// ─── PRICE SIDEBAR ───────────────────────────────────────────

export function PriceSidebar({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  adults, children, infants, discount, extras,
  passengers, seatMaps,
  currentStep,
  fareHoldExpiresAt,
}: {
  flight: DisplayFlight; tier: FareTier;
  returnFlight?: DisplayFlight; returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  adults: number; children: number; infants: number;
  discount: number; extras: ExtraSelection[];
  passengers?: PassengerData[];
  seatMaps?: Record<string, SeatMap>;
  currentStep: number;
  /** Real fare-hold expiry timestamp (ms). Falls back to a 15-min hold from mount if omitted. */
  fareHoldExpiresAt?: number;
}) {
  const { convert } = useCurrency();
  const { baseFares, subtotal, extrasTotal, seatsTotal, taxes, taxesIncluded, convenienceFeeDisplay } =
    calcFares({ tier, returnTier, multiCityLegs, adults, children, infants, extras, passengers, seatMaps });

  const total = Math.round(subtotal + extrasTotal + seatsTotal + taxes - discount);

  const isRoundTrip = !!returnFlight && !!returnTier;
  const isMultiCity = !!(multiCityLegs && multiCityLegs.length > 1);
  const travellers  = adults + children + infants;

  const selectedSeatCodes = passengers ? collectSelectedSeatCodes(passengers) : [];
  const holdTimer = useFareHoldTimer(fareHoldExpiresAt);

  return (
    <div className="w-full flex flex-col gap-3 sticky top-24">

      {/* ── Header card: total + route (BookingSummaryPanel gradient look) ── */}
      <div className="rounded-2xl overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg,#f97316 0%,#ea580c 55%,#dc2626 100%)' }}>
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-white tracking-widest uppercase">Booking Summary</span>
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </div>
          <div className="text-4xl font-black text-white mb-0.5 tracking-tight">{convert(total)}</div>
          <div className="text-[11px] text-white font-medium">
            {travellers} traveller{travellers !== 1 ? "s" : ""} · all taxes included
          </div>
        </div>

        <div className="px-3 pb-3 space-y-1.5">
          <FlightRoutePill
            flight={flight}
            label={isRoundTrip ? "Outbound" : isMultiCity ? "Leg 1" : undefined}
            onDark
          />
          {isRoundTrip && returnFlight && (
            <FlightRoutePill flight={returnFlight} label="Return" onDark />
          )}
          {isMultiCity && multiCityLegs!.slice(1).map((leg, i) => (
            <FlightRoutePill key={i} flight={leg.flight} label={`Leg ${i + 2}`} onDark />
          ))}
        </div>
      </div>

      {/* ── Price breakdown card — Base Fare + Taxes shown clearly, as before ── */}
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

        {/* Per-traveller-type detail — kept from the live fare engine, just tucked under the headline rows */}
        {(adults > 0 || children > 0 || infants > 0) && (
          <div className="rounded-xl bg-slate-50/70 border border-slate-100 px-3 py-2.5 space-y-1.5">
            {adults > 0 && <FareDetailRow label={`${adults} Adult${adults > 1 ? "s" : ""}`} value={baseFares.adult} />}
            {children > 0 && <FareDetailRow label={`${children} Child${children > 1 ? "ren" : ""}`} value={baseFares.child} />}
            {infants > 0 && <FareDetailRow label={`${infants} Infant${infants > 1 ? "s" : ""}`} value={baseFares.infant} />}
            {baseFares.return > 0 && <FareDetailRow label="Return fare" value={baseFares.return} />}
            {baseFares.multiCity > 0 && <FareDetailRow label="Multi-city fares" value={baseFares.multiCity} />}

            {/* Base + tax split per traveller type, straight from the fare tier (unchanged from before) */}
            {(tier.adultBase !== undefined || tier.adultTax !== undefined) && (
              <div className="border-t border-slate-200/70 pt-1.5 mt-1.5 space-y-1.5">
                {adults > 0 && (
                  <FareDetailSplitRow label="Adult (base + tax)" base={tier.adultBase ?? 0} tax={tier.adultTax ?? 0} />
                )}
                {children > 0 && (
                  <FareDetailSplitRow label="Child (base + tax)" base={tier.childBase ?? 0} tax={tier.childTax ?? 0} />
                )}
                {infants > 0 && (
                  <FareDetailSplitRow label="Infant (base + tax)" base={tier.infantBase ?? 0} tax={tier.infantTax ?? 0} />
                )}
              </div>
            )}
          </div>
        )}

        {seatsTotal > 0 && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-slate-600 flex items-center gap-1.5">
              Seat upgrades
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            </span>
            <span className="font-semibold text-blue-600">{convert(seatsTotal)}</span>
          </div>
        )}

        {extrasTotal > 0 && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-slate-600">Meals &amp; Baggage</span>
            <span className="font-semibold text-violet-600">+ {convert(extrasTotal)}</span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-slate-600">Coupon Discount</span>
            <span className="font-semibold text-green-600">− {convert(discount)}</span>
          </div>
        )}

        <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between">
          <span className="text-sm font-bold text-slate-800">Total Payable</span>
          <span className="text-xl font-black text-[#1a56db]">{convert(total)}</span>
        </div>
      </div>

      {/* ── Price protected / fare-hold countdown ── */}
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
          <span className={`flex items-center gap-1 font-bold tabular-nums ${holdTimer.urgent ? "text-red-500" : "text-green-600"}`}>
            <Clock size={12} /> {holdTimer.label}
          </span>
        </div>
      </div>

      {/* ── Selected extras ── */}
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
            <span className="font-black text-blue-600">{convert(extrasTotal)}</span>
          </div>
        </div>
      )}

      {/* ── Selected seats ── */}
      {selectedSeatCodes.length > 0 && (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3">Your Seats</div>
          <div className="flex flex-wrap gap-2">
            {selectedSeatCodes.map((seat, i) => (
              <span
                key={`${seat}-${i}`}
                className="px-3 py-1.5 rounded-xl text-[13px] font-black"
                style={{ background: "linear-gradient(135deg,#1a56db,#1e40af)", color: "#fff" }}
              >
                💺 {seat}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── What's included ── */}
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

      {/* ── Secure booking ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <Shield size={16} className="text-blue-600" />
        </div>
        <div>
          <div className="text-[13px] font-bold text-slate-800 mb-0.5">Secure Booking</div>
          <div className="text-[11px] text-slate-500 leading-relaxed">Your data is safe with us. We use industry-standard encryption.</div>
        </div>
      </div>

      {/* ── Step progress ── */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <BookingStepper active={currentStep - 1} steps={STEP_LABELS.slice(0, 6)} orientation="vertical" />
      </div>
    </div>
  );
}

export function FlightRoutePill({ flight, label, onDark = false }: { flight: DisplayFlight; label?: string; onDark?: boolean }) {
  if (onDark) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.12)" }}>
        <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center shrink-0 overflow-hidden">
          <AirlineLogo code={flight.airlineCode} size="sm" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 text-white font-bold text-sm">
            {flight.fromCode} <span className="text-blue-200">→</span> {flight.toCode}
          </div>
          <div className="text-[11px] text-white">{flight.departDate}</div>
        </div>
        {label && (
          <div className="text-[8px] font-black text-blue-100 uppercase tracking-[0.12em]
            bg-white/15 rounded-lg px-1.5 py-0.5 shrink-0">
            {label}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 bg-slate-50 hover:bg-slate-100/80
      rounded-xl px-3 py-2.5 transition-colors duration-150 border border-slate-100/80">
      <div className="shrink-0">
        <AirlineLogo code={flight.airlineCode} size="sm" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-bold text-slate-700 truncate tracking-wide">
          {flight.fromCode} <span className="text-slate-300 font-normal">→</span> {flight.toCode}
        </div>
        <div className="text-[10px] text-slate-400 font-medium mt-0.5">{flight.departDate}</div>
      </div>
      {label && (
        <div className="text-[8px] font-black text-slate-400 uppercase tracking-[0.12em]
          bg-white border border-slate-200 rounded-lg px-1.5 py-0.5 shrink-0">
          {label}
        </div>
      )}
    </div>
  );
}

function FareDetailRow({ label, value }: { label: string; value: number }) {
  const { convert } = useCurrency();
  return (
    <div className="flex justify-between items-center text-[11px]">
      <span className="text-slate-400 font-medium">{label}</span>
      <span className="text-slate-600 font-semibold">{convert(value)}</span>
    </div>
  );
}

function FareDetailSplitRow({ label, base, tax }: { label: string; base: number; tax: number }) {
  const { convert } = useCurrency();
  return (
    <div className="flex justify-between items-center text-[11px]">
      <span className="text-slate-400 font-medium">{label}</span>
      <span className="text-slate-600 font-semibold">{convert(base)} + {convert(tax)}</span>
    </div>
  );
}

// ─── MOBILE PRICE BAR ─────────────────────────────────────────
// Shown at bottom of screen on mobile/tablet instead of the sidebar

export function MobilePriceBar({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  adults, children, infants, discount, extras,
  passengers, seatMaps,
  currentStep,
  fareHoldExpiresAt,
}: {
  flight: DisplayFlight; tier: FareTier;
  returnFlight?: DisplayFlight; returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  adults: number; children: number; infants: number;
  discount: number; extras: ExtraSelection[];
  passengers?: PassengerData[];
  seatMaps?: Record<string, SeatMap>;
  currentStep: number;
  fareHoldExpiresAt?: number;
}) {
  const { subtotal, extrasTotal, seatsTotal, taxes } = calcFares({
    tier, returnTier, multiCityLegs, adults, children, infants,
    extras, passengers, seatMaps,
  });
  const total = Math.round(subtotal + extrasTotal + seatsTotal + taxes - discount);
  const travellers = adults + children + infants;
  const { convert } = useCurrency();
  const holdTimer = useFareHoldTimer(fareHoldExpiresAt);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40
      bg-white border-t border-slate-100 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]
      px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {travellers} traveller{travellers !== 1 ? "s" : ""} · all-inclusive
          </span>
        </div>
        <div className="font-black text-xl text-slate-900 tracking-tight leading-tight">
          {convert(total)}
        </div>
      </div>
      {/* Fare-hold countdown chip */}
      <span className={`flex items-center gap-1 text-[10px] font-bold tabular-nums shrink-0 px-2 py-1 rounded-lg ${
        holdTimer.urgent ? "bg-red-50 text-red-500" : "bg-green-50 text-green-600"
      }`}>
        <Clock size={11} /> {holdTimer.label}
      </span>
      {/* Mini step indicator */}
      <div className="flex items-center gap-1 shrink-0">
        {STEP_LABELS.slice(0, 6).map((_, i) => (
          <div key={i} className={`rounded-full transition-all duration-300 ${
            i + 1 < currentStep  ? "w-1.5 h-1.5 bg-emerald-500"
            : i + 1 === currentStep ? "w-4 h-1.5 bg-[#1a56db]"
            : "w-1.5 h-1.5 bg-slate-200"
          }`} />
        ))}
      </div>
    </div>
  );
}

// ─── BOOKING SHELL LAYOUT ────────────────────────────────────

export function BookingShell({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  adults, childcount, infants, discount, extras,
  passengers, seatMaps,
  currentStep, onBack, children,
  fareHoldExpiresAt,
}: {
  flight: DisplayFlight; tier: FareTier;
  returnFlight?: DisplayFlight; returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  adults: number; childcount: number; infants: number;
  discount: number; extras: ExtraSelection[];
  passengers?: PassengerData[];
  seatMaps?: Record<string, SeatMap>;
  currentStep: number;
  onBack: () => void;
  children: React.ReactNode;
  /** Real fare-hold expiry timestamp (ms since epoch), e.g. from a backend "hold" response.
   *  If omitted, a stable 15-minute hold is started the moment BookingShell first mounts,
   *  and that same timestamp is shared by the desktop sidebar and the mobile price bar. */
  fareHoldExpiresAt?: number;
}) {
  const fallbackHoldRef = useRef<number | null>(null);
  if (fallbackHoldRef.current === null) {
    fallbackHoldRef.current = Date.now() + 15 * 60 * 1000;
  }
  const holdExpiresAt = fareHoldExpiresAt ?? fallbackHoldRef.current;

  return (
    <div className="min-h-screen pb-24 lg:pb-0" style={{ background: "#f5f6fa" }}>

      {/* ── Top navigation ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30
        shadow-[0_1px_0_rgba(0,0,0,0.04),0_2px_12px_rgba(0,0,0,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center gap-4 sm:gap-6">

          {/* Back button */}
          <button
            onClick={onBack}
            className="group flex items-center gap-1.5 text-slate-400 hover:text-slate-800 transition-colors duration-150 shrink-0"
          >
            <div className="w-7 h-7 rounded-lg border border-slate-200 group-hover:border-slate-300
              flex items-center justify-center transition-colors duration-150">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="hidden sm:block text-sm font-semibold">Back</span>
          </button>

          {/* Brand mark */}
          {/* <div className="shrink-0 hidden sm:flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#1a56db] to-[#1e40af] flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </div> */}

          {/* ── Step indicators (shared BookingStepper) ── */}
          <div className="flex-1 flex items-center justify-center min-w-0">
            <BookingStepper active={currentStep - 1} steps={STEP_LABELS} />
          </div>

          {/* Spacer for symmetry */}
          <div className="w-7 sm:w-20 shrink-0" />
        </div>
      </header>

      {/* ── Main content layout ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-5 sm:py-8 flex flex-col lg:flex-row gap-5 lg:gap-8 items-start">

        {/* Content area */}
        <div className="flex-1 min-w-0 w-full">
          {children}
        </div>

        {/* Desktop sidebar */}
        <aside className="w-full lg:w-72 shrink-0 hidden lg:block">
          <PriceSidebar
            flight={flight} tier={tier}
            returnFlight={returnFlight} returnTier={returnTier}
            multiCityLegs={multiCityLegs}
            adults={adults} children={childcount} infants={infants}
            discount={discount} extras={extras}
            passengers={passengers}
            seatMaps={seatMaps}
            currentStep={currentStep}
            fareHoldExpiresAt={holdExpiresAt}
          />
        </aside>
      </div>

      {/* ── Mobile sticky price bar ── */}
      <MobilePriceBar
        flight={flight} tier={tier}
        returnFlight={returnFlight} returnTier={returnTier}
        multiCityLegs={multiCityLegs}
        adults={adults} children={childcount} infants={infants}
        discount={discount} extras={extras}
        passengers={passengers}
        seatMaps={seatMaps}
        currentStep={currentStep}
        fareHoldExpiresAt={holdExpiresAt}
      />
    </div>
  );
}