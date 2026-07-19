// ============================================================
//  FlightCarda.tsx — the individual flight result card. UI
//  unchanged (frosted glass card, badge strip, airline block,
//  segment row, baggage chips, price + CTA, footer link bar) —
//  now driven by real DisplayFlight data instead of the mock
//  shape (flight.airline.code, flight.departure.time, etc.)
//  that doesn't exist on the real type, matching what
//  FlightCard.tsx already does for the same job.
//
//  Also exports FlightCardaSkeleton and FlightCardaEmptyState,
//  same pattern as FlightCard.tsx's SkeletonCard/EmptyState,
//  but in this file's own frosted-glass look instead of
//  FlightCard's navy/inline-style theme.
// ============================================================

import React, { useState } from 'react';
import { AirlineLogo } from '../../molecules/AirlineLogo';
import { FlightSegment } from '../../molecules/FlightSegment';
import { Button } from '../../atoms/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Luggage, ChevronDown, Check, Zap } from 'lucide-react';
import { BookingModal } from './BookingModal';
import type { DisplayFlight, FareTier } from '../../../lib/types_t';
import { useCurrency } from '../../../context/currencyContext';
import { co2Badge } from '../ResultShared';

export type FlightCardTag = 'recommended' | 'cheapest' | 'fastest';

interface FlightCardProps {
  flight: DisplayFlight;
  index: number;
  /** Computed by the list (sort position), not stored on the flight itself. */
  tag?: FlightCardTag;
  /** Real on-time performance (0-100) if you have it. Omitted → chip hidden. */
  onTimePercent?: number;
  onViewFares?: (f: DisplayFlight) => void;
  /** Called when the person picks a fare in the modal and hits Continue. */
  onBookFare?: (f: DisplayFlight, tier: FareTier) => void;
  /** Forwarded to BookingModal for multi-city itineraries. */
  legIndex?: number;
  totalLegs?: number;
}

export function FlightCarda({ flight, index, tag, onTimePercent, onViewFares, onBookFare, legIndex, totalLegs }: FlightCardProps) {
  const [showModal, setShowModal] = useState(false);
  // null | 'details' | 'fares' | 'breakdown' — only one open at a time.
  const [expandedSection, setExpandedSection] = useState<null | 'details' | 'fares' | 'breakdown'>(null);
  const { convert } = useCurrency();

  const hasBadge = tag === 'recommended' || tag === 'cheapest';
  // Original mock also had an independent "Best Value" chip alongside
  // "Fast arrival" — dropped here since there's no real signal for "best
  // value" distinct from the recommended tag; "Fast arrival" maps to the
  // real `fastest` tag.
  const hasTag = tag === 'fastest';

  const firstTier = flight.fareTiers?.[0];
  const co2Estimate = co2Badge(flight.stops, flight.duration);
  const isNextDay = flight.arriveDate !== flight.departDate;
  const stopsLabel = flight.stops === 0
    ? 'Non-stop'
    : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}${flight.stopInfo ? ` · ${flight.stopInfo}` : ''}`;

  function toggleSection(section: 'details' | 'fares' | 'breakdown') {
    setExpandedSection(prev => (prev === section ? null : section));
  }

  function handleBook(tier: FareTier) {
    onBookFare?.(flight, tier);
    setShowModal(false);
  }

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(40,60,120,0.13), inset 0 1px 0 rgba(255,255,255,0.7)' }}
      className="rounded-xl overflow-hidden transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.28)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 8px 32px rgba(40,60,120,0.10), inset 0 1px 0 rgba(255,255,255,0.6)',
      }}
    >
      {/* ── Top badge strip ── */}
      {(hasBadge || hasTag) && (
        <div className="flex items-center justify-between px-4 pt-3 pb-0">
          <div>
            {tag === 'recommended' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
                Recommended
              </span>
            )}
            {tag === 'cheapest' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
                Cheapest
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {tag === 'fastest' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                <Zap size={10} /> Fast arrival
              </span>
            )}
          </div>
        </div>
      )}

      {/* ── Main content row ── */}
      <div className="px-4 py-3 flex items-center gap-4">
        {/* Airline */}
        <div className="flex flex-col items-center gap-1.5 w-[76px] shrink-0">
          <AirlineLogo code={flight.airlineCode} name={flight.airline} size="lg" />
          <div className="text-center">
            <div className="text-xs font-bold text-slate-900 leading-tight">{flight.airline}</div>
            <div className="text-[9px] text-slate-400 mt-0.5">{flight.flightNumber}{flight.craft ? ` · ${flight.craft}` : ''}</div>
          </div>
        </div>

        {/* Flight segment — FlightSegment.tsx expects a formatted `stops`
            string (e.g. "Non-stop", "1 stop"), not the raw count. */}
        <div className="flex-1 min-w-0">
          <FlightSegment
            departureTime={flight.departTime}
            origin={flight.fromCode}
            arrivalTime={flight.arriveTime}
            destination={flight.toCode}
            duration={flight.durationLabel}
            stops={stopsLabel}
            isNextDay={isNextDay}
          />
        </div>

        {/* Price + baggage + CTA */}
        <div className="flex flex-col items-end gap-1.5 shrink-0 pl-4 border-l border-white/40 min-w-[148px]">
          {/* Baggage — real fields */}
          <div className="flex items-center gap-2 text-slate-400">
            <span className="flex items-center gap-0.5 text-[10px] font-medium">
              <Briefcase size={13} /> {flight.cabinBaggage}
            </span>
            <span className="flex items-center gap-0.5 text-[10px] font-medium">
              <Luggage size={13} /> {flight.checkinBaggage}
            </span>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="text-[22px] font-black text-slate-900 leading-none">{convert(flight.price)}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">per person</div>
          </div>

          {/* Book Now */}
          <Button size="md" className="w-full" onClick={() => { onViewFares?.(flight); setShowModal(true); }}>
            Book Now →
          </Button>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        className="px-4 py-2.5 border-t border-white/30 flex items-center justify-between text-[11px] font-medium text-slate-500"
        style={{ background: 'rgba(255,255,255,0.15)' }}
      >
        <div className="flex items-center gap-4">
          <button onClick={() => toggleSection('details')} className="hover:text-orange-500 flex items-center gap-1 transition-colors">
            Flight Details <ChevronDown size={12} className={expandedSection === 'details' ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          <button onClick={() => toggleSection('fares')} className="hover:text-orange-500 flex items-center gap-1 transition-colors">
            Fare Rules <ChevronDown size={12} className={expandedSection === 'fares' ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          <button onClick={() => toggleSection('breakdown')} className="hover:text-orange-500 flex items-center gap-1 transition-colors">
            Price Breakdown <ChevronDown size={12} className={expandedSection === 'breakdown' ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
        </div>
        <div className="flex items-center gap-3">
          {/* co2Badge is an ESTIMATE (stops + duration), not measured emissions */}
          <span className="text-green-600 flex items-center gap-1">
            🌿 ~{co2Estimate} kg CO₂
          </span>
          {onTimePercent != null && (
            <span className="flex items-center gap-1 text-slate-400">
              ⏱ {onTimePercent}% On-Time
            </span>
          )}
        </div>
      </div>

      {/* ── Expandable sections — real data, one open at a time ── */}
      <AnimatePresence initial={false}>
        {expandedSection && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-white/30"
            style={{ background: 'rgba(255,255,255,0.35)' }}
          >
            <div className="px-4 py-3">
              {expandedSection === 'details' && (
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ['Aircraft', flight.craft ?? '—'],
                    ['Terminal', flight.terminal ? `T${flight.terminal}` : '—'],
                    ['Carrier', flight.isLCC ? 'Low-Cost' : 'Full Service'],
                    ['PAN required', flight.isPanRequired ? 'Yes' : 'No'],
                    ['Passport', flight.isPassportRequired ? 'Yes' : 'No'],
                    ['CO₂', `~${co2Estimate} kg`],
                  ].map(([lbl, val]) => (
                    <div key={lbl} className="bg-white/70 rounded-lg px-2.5 py-2 border border-white/60">
                      <div className="text-[10px] text-slate-400 font-medium">{lbl}</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">{val}</div>
                    </div>
                  ))}
                  {flight.lastTicketingDate && (
                    <div className="col-span-3 text-[10px] text-amber-700 font-semibold mt-1">
                      ⏰ Book by {new Date(flight.lastTicketingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              )}

              {expandedSection === 'fares' && (
                firstTier ? (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white/70 rounded-lg px-2.5 py-2 border border-white/60">
                      <div className="text-[10px] text-slate-400 font-medium">Refundable</div>
                      <div className={`text-xs font-bold mt-0.5 ${firstTier.isRefundable ? 'text-green-600' : 'text-red-500'}`}>
                        {firstTier.isRefundable ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-lg px-2.5 py-2 border border-white/60">
                      <div className="text-[10px] text-slate-400 font-medium">Cancellation Charge</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">{firstTier.cancellationFee}</div>
                    </div>
                    <div className="bg-white/70 rounded-lg px-2.5 py-2 border border-white/60">
                      <div className="text-[10px] text-slate-400 font-medium">Date Change / Reissue</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5">{firstTier.dateChangeFee}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">No fare rules available for this flight yet — open Book Now for full fare options.</div>
                )
              )}

              {expandedSection === 'breakdown' && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/70 rounded-lg px-2.5 py-2 border border-white/60">
                    <div className="text-[10px] text-slate-400 font-medium">Base Fare</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">{convert(flight.baseFare)}</div>
                  </div>
                  <div className="bg-white/70 rounded-lg px-2.5 py-2 border border-white/60">
                    <div className="text-[10px] text-slate-400 font-medium">Taxes & Fees</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">{convert(flight.tax)}</div>
                  </div>
                  <div className="bg-white/70 rounded-lg px-2.5 py-2 border border-white/60">
                    <div className="text-[10px] text-slate-400 font-medium">Total</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5">{convert(flight.price)}</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>

    <AnimatePresence>
      {showModal && (
        <BookingModal
          flight={flight}
          legIndex={legIndex}
          totalLegs={totalLegs}
          onClose={() => setShowModal(false)}
          onBook={handleBook}
        />
      )}
    </AnimatePresence>
    </>
  );
}

// ─── SKELETON & EMPTY STATE — same frosted-glass look as the card ──────────

export function FlightCardaSkeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden px-4 py-4"
      style={{
        background: 'rgba(255,255,255,0.28)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.5)',
      }}
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-200/70 shrink-0 animate-pulse" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-3 bg-slate-200/70 rounded w-2/5 animate-pulse" />
          <div className="h-2.5 bg-slate-200/50 rounded w-1/4 animate-pulse" />
        </div>
        <div className="hidden sm:block flex-1 h-0.5 bg-slate-200/50 rounded animate-pulse" />
        <div className="flex flex-col items-end gap-2">
          <div className="h-5 bg-slate-200/70 rounded w-20 animate-pulse" />
          <div className="h-2.5 bg-slate-200/50 rounded w-14 animate-pulse" />
        </div>
        <div className="hidden sm:block h-9 w-24 bg-slate-200/70 rounded-xl animate-pulse shrink-0" />
      </div>
    </div>
  );
}

export function FlightCardaEmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div
      className="rounded-xl text-center px-10 py-14"
      style={{
        background: 'rgba(255,255,255,0.28)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.5)',
      }}
    >
      <div className="text-4xl mb-3.5">✈️</div>
      <div className="text-base font-bold text-slate-900 mb-1.5">No flights found</div>
      <div className="text-xs text-slate-500 mb-6 max-w-[280px] mx-auto">
        No flights match your current filters. Try adjusting or removing some filters.
      </div>
      <button onClick={onReset} className="px-6 py-2.5 rounded-xl text-white text-xs font-bold bg-orange-500 hover:bg-orange-600 transition-colors">
        Clear all filters
      </button>
    </div>
  );
}