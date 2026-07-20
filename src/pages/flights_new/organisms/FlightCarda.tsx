// ============================================================
//  FlightCarda.tsx — the individual flight result card. Same
//  data/logic as your version: real DisplayFlight fields, real
//  fare tiers, real expandable sections, same modal flow.
//
//  Now supports a `view: 'list' | 'grid'` prop (default 'list'),
//  same idea as the old FlightCard.tsx, but the grid card is
//  built from the *same* boarding-pass visual language as the
//  list card (shared header/footer tint + tear-line) instead of
//  reintroducing that file's separate grey theme — so switching
//  views feels like one card family, not two different designs.
//
//  Grid card is intentionally a compact "at a glance" view: badge
//  strip, airline + route, tear-line, price/baggage + Book Now.
//  It drops the Flight Details / Fare Rules / Price Breakdown
//  expandable footer (same as the old grid card did) — that's a
//  deliberate density trade-off for a 2-up grid, not an oversight.
//  Switch to list view for the full expandable detail.
//
//  Responsive approach (mobile-first, Tailwind `sm:` = >=640px):
//   - List mode: airline + segment share a row on mobile, price/
//     CTA becomes its own full-width row underneath; reverts to
//     a single row with the price column on the right at >=sm.
//   - Grid mode: single column on mobile, 2-up from the parent
//     list's grid classes at >=sm.
//
//  UPDATE: list card's bottom info bar now also carries a "Book"
//  button. It sits pinned in the second slot of the row (right
//  where the CO2 badge used to be first), with the CO2 badge
//  nudged slightly right of it. The left-hand link group
//  (Flight Details / Fare Rules / Price Breakdown) is now
//  `flex-1 min-w-0` so it narrows/wraps to make room instead of
//  pushing the right-hand group around — Book stays pinned.
// ============================================================

import React, { useState } from 'react';
import { AirlineLogo } from '../../molecules/AirlineLogo';
import { FlightSegment } from '../../molecules/FlightSegment';
import { Button } from '../../atoms/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Luggage, ChevronDown, Zap } from 'lucide-react';
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
  /** 'list' (default) = full boarding-pass card with expandable detail.
   *  'grid' = compact at-a-glance card for a 2-up grid layout. */
  view?: 'list' | 'grid';
}

// Shared glass shell — overflow:visible so the tear-line notch circles can
// poke outside the card's own border. Rounded corners still work because
// the header/footer strips carry their own matching radius classes below.
const glassStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.32)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.55)',
  boxShadow: '0 8px 32px rgba(40,60,120,0.10), inset 0 1px 0 rgba(255,255,255,0.7)',
  overflow: 'visible',
};

const headerStyle: React.CSSProperties = {
  background: 'rgba(241,245,249,0.80)',
  borderBottom: '1px solid rgba(203,213,225,0.45)',
};

const footerStyle: React.CSSProperties = {
  background: 'rgba(241,245,249,0.90)',
  borderTop: '1px solid rgba(203,213,225,0.5)',
};

// Colour behind the card list — used so the tear-line notch circles look
// like actual punched-out holes rather than floating dots. Match this to
// whatever background sits behind the flight list if that ever changes.
const NOTCH_BG = 'rgb(228,234,246)';

/** The boarding-pass tear-line: dashed rule + two semicircular notch circles. */
function TearLine({ radius = 12 }: { radius?: number }) {
  const d = radius * 2;
  return (
    <div className="relative" style={{ height: 0, zIndex: 5 }}>
      <div style={{
        position: 'absolute', left: -radius, top: -radius, width: d, height: d,
        borderRadius: '50%', background: NOTCH_BG,
        boxShadow: 'inset 0 1px 3px rgba(100,120,160,0.18)', zIndex: 6,
      }} />
      <div style={{
        position: 'absolute', left: radius + 4, right: radius + 4, top: 0,
        borderTop: '1.5px dashed rgba(148,163,184,0.65)',
      }} />
      <div style={{
        position: 'absolute', right: -radius, top: -radius, width: d, height: d,
        borderRadius: '50%', background: NOTCH_BG,
        boxShadow: 'inset 0 1px 3px rgba(100,120,160,0.18)', zIndex: 6,
      }} />
    </div>
  );
}

/** Shared badge strip — used by both list and grid cards so the "header
 *  band" always looks like one component, just at two sizes. */
function BadgeStrip({ tag, size = 'md' }: { tag?: FlightCardTag; size?: 'sm' | 'md' }) {
  const small = size === 'sm';
  const px = small ? 'px-1.5' : 'px-2';
  const text = small ? 'text-[9px]' : 'text-[10px]';
  return (
    <div
      className={`rounded-t-xl flex flex-wrap items-center justify-between gap-2 ${small ? 'px-3' : 'px-3 sm:px-4'} py-1.5`}
      style={headerStyle}
    >
      <div>
        {tag === 'recommended' && (
          <span className={`inline-flex items-center gap-1 ${px} py-0.5 rounded ${text} font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200`}>
            Recommended
          </span>
        )}
        {tag === 'cheapest' && (
          <span className={`inline-flex items-center gap-1 ${px} py-0.5 rounded ${text} font-bold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-200`}>
            Cheapest
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {tag === 'fastest' && (
          <span className={`inline-flex items-center gap-1 ${px} py-0.5 rounded ${text} font-semibold bg-purple-50 text-purple-700 border border-purple-200`}>
            <Zap size={small ? 9 : 10} /> Fast arrival
          </span>
        )}
      </div>
    </div>
  );
}

export function FlightCarda({ flight, index, tag, onTimePercent, onViewFares, onBookFare, legIndex, totalLegs, view = 'list' }: FlightCardProps) {
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
  const hasHeader = hasBadge || hasTag;

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

  // ── GRID CARD — compact at-a-glance, same boarding-pass tokens ──────────
  if (view === 'grid') {
    return (
      <>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.07, duration: 0.25 }}
          whileHover={{ y: -3, boxShadow: '0 14px 40px rgba(40,60,120,0.14), inset 0 1px 0 rgba(255,255,255,0.7)' }}
          className="rounded-xl flex flex-col transition-all duration-300 relative w-full h-full"
          style={glassStyle}
        >
          {hasHeader && <BadgeStrip tag={tag} size="sm" />}

          <div className={`px-3 py-2.5 flex flex-col gap-2.5 flex-1 ${hasHeader ? '' : 'rounded-t-xl'}`}>
            {/* Airline */}
            <div className="flex items-center gap-2 min-w-0">
              <AirlineLogo code={flight.airlineCode} name={flight.airline} size="sm" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 leading-tight truncate">{flight.airline}</div>
                <div className="text-[9px] text-slate-400 truncate">{flight.flightNumber}{flight.craft ? ` · ${flight.craft}` : ''}</div>
              </div>
            </div>

            {/* Route — compact three-column summary (real times/codes/duration) */}
            <div className="flex items-center justify-between">
              <div className="text-center shrink-0">
                <div className="text-base font-black text-slate-900">{flight.departTime}</div>
                <div className="text-[10px] text-slate-500 font-semibold">{flight.fromCode}</div>
              </div>
              <div className="flex-1 flex flex-col items-center px-2 min-w-0">
                <div className="text-[9px] text-slate-400 font-medium truncate">{flight.durationLabel}</div>
                <div className="w-full flex items-center gap-1">
                  <div className="flex-1 h-px bg-slate-200" />
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                  <div className="flex-1 h-px bg-slate-200" />
                </div>
                <div className="text-[9px] text-orange-500 font-semibold truncate">{stopsLabel}</div>
              </div>
              <div className="text-center shrink-0">
                <div className="text-base font-black text-slate-900">
                  {flight.arriveTime}
                  {isNextDay && <sup className="text-[8px] text-orange-500 ml-0.5">+1</sup>}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">{flight.toCode}</div>
              </div>
            </div>
          </div>

          <TearLine radius={10} />

          <div className="px-3 py-2.5 flex items-center justify-between rounded-b-xl" style={footerStyle}>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
                <span className="flex items-center gap-0.5 text-[9px] whitespace-nowrap"><Briefcase size={11} />{flight.cabinBaggage}</span>
                <span className="flex items-center gap-0.5 text-[9px] whitespace-nowrap"><Luggage size={11} />{flight.checkinBaggage}</span>
              </div>
              <div className="text-lg font-black text-slate-900 leading-none">{convert(flight.price)}</div>
              <div className="text-[9px] text-slate-400 mt-0.5">per person</div>
            </div>
            <Button size="sm" className="shrink-0" onClick={() => { onViewFares?.(flight); setShowModal(true); }}>
              Book →
            </Button>
          </div>
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

  // ── LIST CARD — full boarding-pass shape with expandable detail ────────
  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      whileHover={{ y: -2, boxShadow: '0 12px 40px rgba(40,60,120,0.13), inset 0 1px 0 rgba(255,255,255,0.7)' }}
      className="rounded-xl transition-all duration-300 relative w-full"
      style={glassStyle}
    >
      {hasHeader && <BadgeStrip tag={tag} />}

      {/* ── Main content ──
          Mobile/tablet (<sm): airline + segment share a row, price/CTA
          drops to its own full-width row underneath.
          Desktop (>=sm): single row, price column pinned to the right. */}
      <div className={`px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${hasHeader ? '' : 'rounded-t-xl'}`}>
        <div className="flex items-center gap-3 sm:gap-4 sm:flex-1 sm:min-w-0">
          {/* Airline */}
          <div className="flex flex-col items-center gap-1.5 w-16 sm:w-[76px] shrink-0">
            <AirlineLogo code={flight.airlineCode} name={flight.airline} size="lg" />
            <div className="text-center w-full">
              <div className="text-[11px] sm:text-xs font-bold text-slate-900 leading-tight truncate">{flight.airline}</div>
              <div className="text-[9px] text-slate-400 mt-0.5 truncate">{flight.flightNumber}{flight.craft ? ` · ${flight.craft}` : ''}</div>
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
        </div>

        {/* Price + baggage — row on mobile/tablet, right-hand column on
            desktop. No CTA here anymore — the single Book button now lives
            in the bottom footer panel, so this column's min-width can drop
            (was 148px to fit the button, now just fits price/baggage). */}
        <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-start gap-3 sm:gap-1.5 shrink-0 pt-3 sm:pt-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-white/40 w-full sm:w-auto sm:min-w-[104px]">
          <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1.5 min-w-0">
            {/* Baggage — real fields */}
            <div className="flex items-center gap-2 text-slate-400 shrink-0">
              <span className="flex items-center gap-0.5 text-[10px] font-medium whitespace-nowrap">
                <Briefcase size={13} /> {flight.cabinBaggage}
              </span>
              <span className="flex items-center gap-0.5 text-[10px] font-medium whitespace-nowrap">
                <Luggage size={13} /> {flight.checkinBaggage}
              </span>
            </div>

            {/* Price */}
            <div className="text-right shrink-0">
              <div className="text-lg sm:text-[22px] font-black text-slate-900 leading-none">{convert(flight.price)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">per person</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tear line — boarding-pass separator between the flight info
          and the footer/CTA strip below. ── */}
      <TearLine />

      {/* ── Footer — its own tinted band (matches the header above) instead
          of the same flat glass as the middle, so the card reads as three
          distinct zones: header, body, footer.

          Layout: left = expandable-section links (flex-1 min-w-0, so this
          side narrows/wraps to make room), right = pinned group with
          Book (2nd slot overall — where the CO2 badge used to sit first),
          then the CO2 badge nudged slightly right of it, then On-Time. ── */}
      <div
        className={`px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[10px] sm:text-[11px] font-medium text-slate-500 ${!expandedSection ? 'rounded-b-xl' : ''}`}
        style={footerStyle}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:gap-4 flex-1 min-w-0">
          <button onClick={() => toggleSection('details')} className="hover:text-orange-500 flex items-center gap-1 transition-colors whitespace-nowrap">
            Flight Details <ChevronDown size={12} className={expandedSection === 'details' ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          <button onClick={() => toggleSection('fares')} className="hover:text-orange-500 flex items-center gap-1 transition-colors whitespace-nowrap">
            Fare Rules <ChevronDown size={12} className={expandedSection === 'fares' ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          <button onClick={() => toggleSection('breakdown')} className="hover:text-orange-500 flex items-center gap-1 transition-colors whitespace-nowrap">
            Price Breakdown <ChevronDown size={12} className={expandedSection === 'breakdown' ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          {/* co2Badge is an ESTIMATE (stops + duration), not measured emissions */}
          <span className="text-green-600 flex items-center gap-1 whitespace-nowrap">
            🌿 ~{co2Estimate} kg CO₂
          </span>
          {onTimePercent != null && (
            <span className="flex items-center gap-1 text-slate-400 whitespace-nowrap">
              ⏱ {onTimePercent}% On-Time
            </span>
          )}
          {/* Single Book CTA for the whole card — sized up (size="lg") since
              it's now the only booking entry point, not a small pinned chip. */}
          <Button
            size="md"
            className="shrink-0 ml-1 sm:ml-2"
            onClick={() => { onViewFares?.(flight); setShowModal(true); }}
          >
            Book →
          </Button>
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
            className="overflow-hidden rounded-b-xl border-t border-white/30"
            style={{ background: 'rgba(255,255,255,0.35)' }}
          >
            <div className="px-3 sm:px-4 py-3">
              {expandedSection === 'details' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    ['Aircraft', flight.craft ?? '—'],
                    ['Terminal', flight.terminal ? `T${flight.terminal}` : '—'],
                    ['Carrier', flight.isLCC ? 'Low-Cost' : 'Full Service'],
                    ['PAN required', flight.isPanRequired ? 'Yes' : 'No'],
                    ['Passport', flight.isPassportRequired ? 'Yes' : 'No'],
                    ['CO₂', `~${co2Estimate} kg`],
                  ].map(([lbl, val]) => (
                    <div key={lbl} className="bg-white/70 rounded-lg px-2.5 py-2 border border-white/60 min-w-0">
                      <div className="text-[10px] text-slate-400 font-medium truncate">{lbl}</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">{val}</div>
                    </div>
                  ))}
                  {flight.lastTicketingDate && (
                    <div className="col-span-2 sm:col-span-3 text-[10px] text-amber-700 font-semibold mt-1">
                      ⏰ Book by {new Date(flight.lastTicketingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  )}
                </div>
              )}

              {expandedSection === 'fares' && (
                firstTier ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div className="bg-white/70 rounded-lg px-2.5 py-2 border border-white/60 min-w-0">
                      <div className="text-[10px] text-slate-400 font-medium truncate">Refundable</div>
                      <div className={`text-xs font-bold mt-0.5 truncate ${firstTier.isRefundable ? 'text-green-600' : 'text-red-500'}`}>
                        {firstTier.isRefundable ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div className="bg-white/70 rounded-lg px-2.5 py-2 border border-white/60 min-w-0">
                      <div className="text-[10px] text-slate-400 font-medium truncate">Cancellation Charge</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">{firstTier.cancellationFee}</div>
                    </div>
                    <div className="bg-white/70 rounded-lg px-2.5 py-2 border border-white/60 min-w-0 col-span-2 sm:col-span-1">
                      <div className="text-[10px] text-slate-400 font-medium truncate">Date Change / Reissue</div>
                      <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">{firstTier.dateChangeFee}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">No fare rules available for this flight yet — open Book Now for full fare options.</div>
                )
              )}

              {expandedSection === 'breakdown' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="bg-white/70 rounded-lg px-2.5 py-2 border border-white/60 min-w-0">
                    <div className="text-[10px] text-slate-400 font-medium truncate">Base Fare</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">{convert(flight.baseFare)}</div>
                  </div>
                  <div className="bg-white/70 rounded-lg px-2.5 py-2 border border-white/60 min-w-0">
                    <div className="text-[10px] text-slate-400 font-medium truncate">Taxes & Fees</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5 truncate">{convert(flight.tax)}</div>
                  </div>
                  <div className="bg-white/70 rounded-lg px-2.5 py-2 border border-white/60 min-w-0 col-span-2 sm:col-span-1">
                    <div className="text-[10px] text-slate-400 font-medium truncate">Total</div>
                    <div className="text-xs font-bold text-slate-900 mt-0.5 truncate">{convert(flight.price)}</div>
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

// ─── SKELETON & EMPTY STATE — same glass tokens as the card ────────────────

export function FlightCardaSkeleton() {
  return (
    <div
      className="rounded-xl overflow-hidden px-3 sm:px-4 py-4"
      style={{
        background: 'rgba(255,255,255,0.32)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.55)',
      }}
    >
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-200/70 shrink-0 animate-pulse" />
        <div className="flex-1 min-w-[120px] flex flex-col gap-2">
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
      className="rounded-xl text-center px-6 sm:px-10 py-10 sm:py-14"
      style={{
        background: 'rgba(255,255,255,0.32)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.55)',
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