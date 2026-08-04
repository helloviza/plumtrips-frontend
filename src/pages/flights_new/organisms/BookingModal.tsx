// ============================================================
//  BookingModal.tsx — fare-tier selector modal. UI language
//  unchanged (same header, flight summary row, carbon/price-
//  trend cards, fare cards grid, AI insight, fare timeline,
//  trust badges, sticky footer) — now driven by real
//  DisplayFlight/FareTier data instead of the hardcoded 3-fare
//  mock array, matching what FareModal.tsx already does for the
//  same job.
//
//  RESPONSIVE PASS: every section below now has explicit
//  mobile → tablet → desktop breakpoints (Tailwind's default
//  sm=640px / md=768px / lg=1024px scale). Nothing about the
//  data wiring changed from the previous pass — only layout,
//  sizing, and spacing utility classes.
//
//  A few things that were fabricated in the original mock have
//  no backing field anywhere (no price-history API, no "% of
//  travellers chose this" analytics) — those stay as clearly
//  commented illustrative placeholders rather than pretending
//  to be real data. Everything that DOES have a real field
//  (fare prices, baggage, refundability, cancellation charges,
//  CO2 estimate) is wired for real.
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Briefcase, Luggage, Armchair, UtensilsCrossed, RefreshCw,
  CalendarClock, Check, Info, TrendingUp, Users,
  ChevronDown, Star, Leaf
} from 'lucide-react';
import { AirlineLogo } from '../../molecules/AirlineLogo';
import type { DisplayFlight, FareTier, TBOCancellationPolicy } from '../../../lib/types_t';
import { MOCK_MODE } from '../../../lib/flights_api';
import { useCurrency } from '../../../context/currencyContext';
import { co2Badge } from '../ResultShared';

interface BookingModalProps {
  flight: DisplayFlight;
  /** Present when this flight is one leg of a multi-city search. */
  legIndex?: number;
  totalLegs?: number;
  onClose: () => void;
  onBook: (tier: FareTier) => void;
}

function formatPrice(num: number): string {
  return '₹' + Math.round(num).toLocaleString('en-IN');
}

// Fare-row spec. Real FareTier has cancellationFee + dateChangeFee (no
// separate "reissue" fee) — the original mock had 7 rows including a
// distinct "Reissue" value that doesn't exist on the real type, so Date
// Change and Reissue are merged into one row here.
const fareRows = [
  { icon: Briefcase, label: 'Cabin Bag', get: (t: FareTier) => t.cabinBag },
  { icon: Luggage, label: 'Check-in Baggage', get: (t: FareTier) => t.checkinBag },
  { icon: Armchair, label: 'Seat Selection', get: (t: FareTier) => t.seatSelection },
  { icon: UtensilsCrossed, label: 'Meals', get: (t: FareTier) => t.meals },
  { icon: RefreshCw, label: 'Refund', get: (t: FareTier) => (t.isRefundable ? 'Refundable' : 'Non-refundable') },
  { icon: CalendarClock, label: 'Date Change / Reissue', get: (t: FareTier) => t.dateChangeFee },
] as const;

function valueColor(val: string) {
  if (val === 'Free' || val === 'Included' || val === 'Refundable') return 'text-green-600 font-semibold';
  if (val === 'Non-refundable') return 'text-red-500 font-semibold';
  if (val === 'Paid') return 'text-slate-500';
  return 'text-slate-700 font-medium';
}

// Mini sparkline SVG for price trend — purely decorative, matches the
// original; not derived from real data (see note near its usage below).
function SparkLine() {
  const points = '10,38 25,32 40,36 55,28 70,30 85,22 100,18 115,24';
  return (
    <svg viewBox="0 0 125 50" className="w-full h-8 sm:h-10" fill="none">
      <polyline points={points} stroke="#f97316" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" fill="none" />
      <circle cx="115" cy="24" r="3" fill="#f97316" />
    </svg>
  );
}

// ─── FARE RULES SUB-MODAL — same visual language as the main modal ────────
function FareRulesModal({
  tier, policies, airline, onClose,
}: { tier: FareTier; policies?: TBOCancellationPolicy[]; airline?: string; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        key="policy-backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-2000 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
      >
        <motion.div
          key="policy-modal"
          initial={{ opacity: 0, scale: 0.94, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[480px] max-h-[88vh] sm:max-h-[85vh] overflow-y-auto flex flex-col"
        >
          <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-100">
            <div>
              <div className="text-sm font-bold text-slate-900">Cancellation & Reissue Rules</div>
              <div className="text-xs text-slate-400 mt-0.5">{airline ? `${airline} · ` : ''}{tier.name}</div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0">
              <X size={14} className="text-slate-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <span>{tier.isRefundable ? '✅' : '❌'}</span>
              {tier.isRefundable ? 'This fare is refundable' : 'This fare is non-refundable'}
            </div>

            <div className="flex items-center justify-between gap-2 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-600">Cancellation charge</span>
              <span className="text-sm font-black text-orange-600">{tier.cancellationFee}</span>
            </div>
            <div className="flex items-center justify-between gap-2 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-semibold text-slate-600">Reissue / Date change charge</span>
              <span className="text-sm font-black text-orange-600">{tier.dateChangeFee}</span>
            </div>

            {policies && policies.length > 0 && (
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Time-banded charges</div>
                <div className="flex flex-col gap-2">
                  {policies.map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border border-slate-100 bg-white">
                      <span className="text-xs font-medium text-slate-600">{p.FromHours}–{p.ToHours} hrs before departure</span>
                      <span className="text-xs font-bold text-slate-800">
                        {p.Amount ? formatPrice(p.Amount) : `${p.Percentage}%`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Charges shown are per traveller as quoted at the time of search and may change closer to departure
              or once the fare is repriced at booking.
            </p>
          </div>

          <div className="px-4 sm:px-5 py-4 border-t border-slate-100 bg-slate-50 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors">
              Got it
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function BookingModal({ flight, legIndex, totalLegs, onClose, onBook }: BookingModalProps) {
  const { convert } = useCurrency();
  const tiers: FareTier[] = flight.fareTiers ?? [];
  const isMultiLeg = !!(totalLegs && totalLegs > 1);

  const recIdx = tiers.findIndex(t => t.recommended);
  const [selectedFare, setSelectedFare] = useState(recIdx >= 0 ? recIdx : 0);
  const [policyOpen, setPolicyOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const selected = tiers[selectedFare];
  const todayPrice = selected?.totalOfferedFare ?? flight.price;

  // Illustrative only — there's no price-history/prediction API or field
  // on DisplayFlight/FareTier, so these are computed as a small % either
  // side of today's real price rather than fabricated fixed numbers.
  const illustrativeYesterday = Math.round((todayPrice * 0.97) / 10) * 10;
  const illustrativePrediction = Math.round((todayPrice * 1.03) / 10) * 10;

  const isNextDayArrival = flight.arriveDate !== flight.departDate;
  const departDateLabel = new Date(flight.departDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const arriveDateLabel = new Date(flight.arriveDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const stopsLabel = flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`;
  const co2Estimate = co2Badge(flight.stops, flight.duration);

  // Recommended-tier savings vs the priciest tier — real numbers, derived
  // from the actual fare list instead of a hardcoded "₹526".
  const priciestTier = tiers.length ? tiers.reduce((a, b) => (b.totalOfferedFare > a.totalOfferedFare ? b : a), tiers[0]) : undefined;
  const recommendedTier = tiers.find(t => t.recommended) ?? tiers[0];
  const savings = recommendedTier && priciestTier ? priciestTier.totalOfferedFare - recommendedTier.totalOfferedFare : 0;

  return (
    <AnimatePresence>
      {/* Backdrop — on mobile the modal docks to the bottom edge-to-edge
          (no side padding, squared top corners already handled below);
          from sm+ it centers as a floating card like before. */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-2000 flex items-end sm:items-center justify-center p-0 sm:p-4"
        style={{ background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(4px)' }}
      >
        {/* Modal */}
        <motion.div
          key="modal"
          initial={{ opacity: 0, scale: 0.98, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 24 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          onClick={e => e.stopPropagation()}
          className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-[640px] lg:max-w-[960px] max-h-[94vh] sm:max-h-[92vh] overflow-y-auto"
          style={{ scrollbarWidth: 'thin' }}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
              <AirlineLogo code={flight.airlineCode} name={flight.airline} size="lg" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-sm sm:text-lg font-bold text-slate-900 truncate">{flight.airline}</span>
                  <span className="text-slate-400 hidden sm:inline">•</span>
                  <span className="text-sm sm:text-lg font-bold text-slate-900">{flight.flightNumber}</span>
                  {isMultiLeg && (
                    <span className="text-[9px] sm:text-[10px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                      Leg {(legIndex ?? 0) + 1} of {totalLegs}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {flight.craft && <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">{flight.craft}</span>}
                  <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-medium">{flight.fareClass ?? 'Economy'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors shrink-0"
            >
              <X size={16} className="text-slate-600" />
            </button>
          </div>

          <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
            {/* ── Flight Summary Row ── stacks to a column on mobile/tablet,
                becomes a 3-across row from lg (1024px) up like the original. */}
            <div className="flex flex-col lg:flex-row gap-3">
              {/* Flight segment card */}
              <div className="flex-1 rounded-xl border border-slate-100 bg-slate-50 px-3 sm:px-6 py-4 flex items-center gap-0">
                {/* Origin */}
                <div className="min-w-0">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">{flight.fromCode}</div>
                  <div className="text-sm sm:text-base font-bold text-slate-700 mt-0.5">{flight.departTime}</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">{departDateLabel}</div>
                </div>

                {/* Line */}
                <div className="flex-1 flex flex-col items-center gap-1 px-2 sm:px-4 min-w-0">
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium whitespace-nowrap">{flight.durationLabel}</div>
                  <div className="flex items-center gap-1.5 sm:gap-2 w-full">
                    <div className="flex-1 border-t-2 border-dashed border-orange-300" />
                    <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 16 16" className="w-3 h-3 text-white fill-white">
                        <path d="M14.5 5.5c0-.83-.67-1.5-1.5-1.5H10.5L7 1H5.5L7 5H3.5L2 3.5H1L2 8l-1 4.5h1L3.5 11H7l-1.5 4H7l3.5-3.5H13c.83 0 1.5-.67 1.5-1.5v-4z"/>
                      </svg>
                    </div>
                    <div className="flex-1 border-t-2 border-dashed border-orange-300" />
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-orange-500 font-semibold whitespace-nowrap">{stopsLabel}</div>
                </div>

                {/* Destination */}
                <div className="text-right min-w-0">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900">{flight.toCode}</div>
                  <div className="text-sm sm:text-base font-bold text-slate-700 mt-0.5">{flight.arriveTime}</div>
                  <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">{arriveDateLabel}{isNextDayArrival ? ' +1' : ''}</div>
                </div>
              </div>

              {/* Carbon Impact + Price Trend — side by side 2-up on mobile/
                  tablet, fixed-width columns next to the segment card on lg+. */}
              <div className="grid grid-cols-2 gap-3 lg:contents">
                {/* Carbon Impact — co2Badge(stops, duration) is an ESTIMATE
                    (same helper FareModal uses), not measured emissions data. */}
                <div className="w-full lg:w-44 rounded-xl border border-slate-100 bg-slate-50 px-3 sm:px-4 py-3.5 sm:py-4">
                  <div className="flex items-center gap-1.5 text-green-600 text-[11px] sm:text-xs font-semibold mb-2">
                    <Leaf size={13} />Carbon Impact
                    <Info size={12} className="text-slate-400 ml-auto hidden sm:block" />
                  </div>
                  <div className="text-lg sm:text-xl font-black text-slate-900">{co2Estimate} kg CO₂</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1">Estimated for this<br />itinerary (stops & duration)</div>
                </div>

                {/* Price Trend — illustrative; no price-history API exists,
                    see note above illustrativeYesterday/Prediction. */}
                <div className="w-full lg:w-44 rounded-xl border border-slate-100 bg-slate-50 px-3 sm:px-4 py-3.5 sm:py-4">
                  <div className="flex items-center gap-1.5 text-slate-600 text-[11px] sm:text-xs font-semibold mb-1">
                    <TrendingUp size={13} />Price Trend
                    <Info size={12} className="text-slate-400 ml-auto hidden sm:block" />
                  </div>
                  <SparkLine />
                  <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1">
                    Estimated range around<br />today's fare
                  </div>
                </div>
              </div>
            </div>

            {/* ── Fare Cards ── 1 column on mobile, 2 on tablet, 3 from lg+ */}
            {tiers.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-4xl mb-3">✈️</div>
                <div className="text-base font-bold text-slate-900 mb-1">No fare options available</div>
                <div className="text-xs text-slate-400">This flight has no selectable fare tiers.</div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tiers.map((tier, idx) => {
                    const isSelected = selectedFare === idx;
                    return (
                      <div
                        key={tier.resultIndex + idx}
                        onClick={() => setSelectedFare(idx)}
                        className="relative rounded-xl border-2 cursor-pointer transition-all"
                        style={{
                          borderColor: isSelected ? '#f97316' : '#e2e8f0',
                          background: isSelected ? '#fff7f0' : '#ffffff',
                        }}
                      >
                        {/* Recommended ribbon — real FareTier only has one
                            `recommended` flag, so this replaces the original
                            mock's two separate badges (plutoRecommends +
                            recommended) with the single real signal. */}
                        {tier.recommended && (
                          <div className="absolute -top-3 left-4">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-500 text-white shadow-sm">
                              ⭐ PLUTO RECOMMENDS
                            </span>
                          </div>
                        )}

                        <div className="p-4">
                          {/* Fare name + radio */}
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-base font-bold text-slate-900">{tier.name}</span>
                            <div
                              className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0"
                              style={{ borderColor: isSelected ? '#f97316' : '#cbd5e1' }}
                            >
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-2xl font-black text-slate-900">{convert(tier.totalOfferedFare)}</div>
                          <div className="text-[11px] text-slate-400 mb-3">per adult</div>

                          {tier.tag && (
                            <div className="mb-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-white">
                                <Star size={9} fill="white" />{tier.tag}
                              </span>
                            </div>
                          )}

                          {/* Fare rows */}
                          <div className="space-y-2.5 text-[12px]">
                            {fareRows.map(({ icon: Icon, label, get }) => {
                              const val = get(tier);
                              return (
                                <div key={label} className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-1.5 text-slate-500 min-w-0">
                                    <Icon size={13} className="shrink-0" />
                                    <span className="truncate">{label}</span>
                                  </div>
                                  <span className={`text-right shrink-0 ${valueColor(val)}`}>{val}</span>
                                </div>
                              );
                            })}
                          </div>

                          {/* View Fare Rules — now actually opens the rules modal */}
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedFare(idx); setPolicyOpen(true); }}
                            className="mt-4 w-full text-[12px] text-slate-500 border border-dashed border-slate-300 rounded-lg py-2 flex items-center justify-center gap-1.5 hover:border-slate-400 hover:text-slate-700 transition-colors"
                          >
                            <svg viewBox="0 0 16 16" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="1.5">
                              <rect x="2" y="1" width="12" height="14" rx="1.5" />
                              <path d="M5 5h6M5 8h6M5 11h4" strokeLinecap="round" />
                            </svg>
                            View Fare Rules
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-3.5 leading-relaxed">
                  {MOCK_MODE ? '* Mock mode — fares are simulated.' : '* Fares per traveller. PlumTrips service fee not included.'}
                  {' '}CO₂ emissions: ~{co2Estimate} kg/traveller.
                </p>
              </>
            )}

            {tiers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pluto AI Insight — headline/savings now computed from the
                    real fare list; "92% of travellers" has no backing field
                    anywhere (no analytics endpoint), so it stays as the same
                    illustrative copy the original design had. */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex gap-3">
                  <div
                    className="shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden flex items-center justify-center"
                    style={{ boxShadow: '0 0 16px rgba(96,165,250,0.6), 0 0 36px rgba(96,165,250,0.25)', background: 'radial-gradient(circle, rgba(30,58,138,0.5), transparent)' }}
                  >
                    <img src="/pluto-mascot.png" alt="Pluto AI" className="w-full h-full object-cover scale-110" style={{ filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.7))' }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800 mb-1">
                      <span style={{ background: 'linear-gradient(135deg,#7B61FF,#FF6FB5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>✦</span>
                      Pluto AI Insight
                    </div>
                    <p className="text-[12px] text-slate-600 leading-relaxed">
                      Based on this flight's fare options,{' '}
                      <strong>{recommendedTier?.name} fare is ideal for you.</strong>
                      {savings > 0 && <> You save {convert(savings)} compared to {priciestTier?.name} fare.</>}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700">
                      <Users size={11} />
                      92% of travellers choose this fare for similar trips
                    </div>
                  </div>
                </div>

                {/* Fare Timeline — illustrative, see note above */}
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800 mb-4">
                    <CalendarClock size={14} className="text-blue-500" />
                    Fare Timeline
                  </div>
                  <div className="grid grid-cols-3 text-center gap-2">
                    <div>
                      <div className="text-[11px] text-slate-400 mb-1">Yesterday</div>
                      <div className="text-sm sm:text-base font-bold text-slate-700">{convert(illustrativeYesterday)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 mb-1">Today</div>
                      <div className="text-lg sm:text-xl font-black text-orange-500">{convert(todayPrice)}</div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-400 mb-1">Prediction</div>
                      <div className="text-sm sm:text-base font-bold text-slate-700">
                        {convert(illustrativePrediction)}+
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-center gap-0.5 mt-0.5">
                        estimate <TrendingUp size={10} className="text-orange-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Trust badges — static, no backend data behind these ──
                2-up on mobile, 4-up from sm up. */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-2.5">
              {['Official Airline Fare', 'No Hidden Charges', 'Secure Payment', 'IATA Accredited'].map(label => (
                <div key={label} className="flex items-center gap-1.5 text-[11px] sm:text-[12px] text-slate-600 font-medium">
                  <Check size={14} className="text-green-500 shrink-0" />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* ── Sticky Footer CTA ──
              Mobile/tablet: info row on top, full-width button below.
              Desktop (sm+): original single-row layout with the button
              pinned to the right. Safe-area padding added for iOS. */}
          {tiers.length > 0 && (
            <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 sm:px-6 py-3.5 sm:py-4 rounded-b-none sm:rounded-b-2xl pb-[calc(0.875rem+env(safe-area-inset-bottom))] sm:pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <div className="flex items-center justify-between sm:contents">
                  {/* Selected fare */}
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Selected Fare</div>
                    <button className="flex items-center gap-1.5 text-[13px] font-bold text-slate-800 hover:text-orange-600 transition-colors">
                      {selected?.name} <ChevronDown size={14} />
                    </button>
                  </div>

                  <div className="hidden sm:block w-px h-10 bg-slate-200" />

                  {/* Total */}
                  <div className="text-right sm:text-left">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5">Total Amount</div>
                    <div className="flex items-baseline gap-1 justify-end sm:justify-start">
                      <span className="text-lg sm:text-xl font-black text-slate-900">{convert(todayPrice)}</span>
                      <Info size={13} className="text-slate-400 mb-0.5 hidden sm:inline" />
                    </div>
                    <div className="text-[10px] text-slate-400">Taxes included</div>
                  </div>
                </div>

                {/* Refund */}
                <div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">Refund</div>
                  <div className={`text-[12px] font-semibold ${selected?.isRefundable ? 'text-green-600' : 'text-red-500'}`}>
                    {selected?.isRefundable ? 'Refundable' : 'Non-refundable'}
                  </div>
                </div>

                {/* Continue */}
                <div className="sm:ml-auto sm:text-right">
                  <button
                    onClick={() => selected && onBook(selected)}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-xl text-white font-bold text-[14px] sm:text-[15px] hover:opacity-90 active:scale-95 transition-all"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                  >
                    {(legIndex !== undefined && totalLegs && legIndex < totalLegs - 1)
                      ? `Select Leg ${legIndex + 1} →`
                      : 'Continue →'}
                  </button>
                  <div className="text-[10px] text-slate-400 mt-1 text-center sm:text-right">You won't be charged yet</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {policyOpen && selected && (
        <FareRulesModal
          tier={selected}
          policies={flight.cancellationPolicies}
          airline={flight.airline}
          onClose={() => setPolicyOpen(false)}
        />
      )}
    </AnimatePresence>
  );
}