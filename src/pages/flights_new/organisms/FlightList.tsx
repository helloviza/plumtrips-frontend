// ============================================================
//  FlightList.tsx — sort tabs, AI banner, and the flight
//  results list. Logic/data flow is unchanged from your version:
//  same `flights: DisplayFlight[]` prop, same sorting, same
//  loading skeletons, same empty state.
//
//  What changed this round:
//   - Removed "Show Price Insights" entirely — it was a dead
//     link to a feature/endpoint that doesn't exist, so the
//     `onShowPriceInsights` prop is gone too rather than left
//     as an unused hook.
//   - Brought back a list/grid view toggle (like the very first
//     draft had), now wired to FlightCarda's real `view` prop —
//     switching actually re-renders the boarding-pass cards in
//     a 2-up grid instead of just flipping a button that did
//     nothing.
//   - AI banner gets a second pass: a soft breathing glow on the
//     avatar (the one signature motion moment on this list, kept
//     restrained rather than added everywhere), a gradient title
//     treatment tying it to the BETA badge, and tightened
//     spacing/contrast on the chips.
// ============================================================

import React, { useMemo, useState } from 'react';
import { SortTab } from '../../molecules/SortTab';
import { FlightCarda, FlightCardaSkeleton, FlightCardaEmptyState, type FlightCardTag } from './FlightCarda';
import { motion } from 'framer-motion';
import { Check, Clock, Leaf, LayoutList, LayoutGrid } from 'lucide-react';
import type { DisplayFlight, FareTier } from '../../../lib/types_t';
import { useCurrency } from '../../../context/currencyContext';
import { timeToMins } from '../ResultShared';

type SortKey = 'recommended' | 'cheapest' | 'fastest' | 'departure';
type ViewMode = 'list' | 'grid';

export interface FlightListProps {
  flights: DisplayFlight[];
  /** True while results are still loading — shows skeleton rows. */
  loading?: boolean;
  onViewFares?: (f: DisplayFlight) => void;
  onBookFare?: (f: DisplayFlight, tier: FareTier) => void;
  /** "Clear all filters" in the empty state. */
  onResetFilters?: () => void;
}

const SKELETON_COUNT = 5;

export function FlightList({ flights, loading, onViewFares, onBookFare, onResetFilters }: FlightListProps) {
  const [activeSort, setActiveSort] = useState<SortKey>('recommended');
  const [view, setView] = useState<ViewMode>('list');
  const { convert } = useCurrency();

  // "Recommended" = the order the flights arrived in (assumed to already
  // reflect the backend/parent's default ranking) — DisplayFlight carries
  // no explicit recommended/ranking flag of its own.
  const recommendedFlight = flights[0];
  const cheapestFlight = useMemo(
    () => (flights.length ? flights.reduce((a, b) => (b.price < a.price ? b : a), flights[0]) : undefined),
    [flights]
  );
  const fastestFlight = useMemo(
    () => (flights.length ? flights.reduce((a, b) => (b.duration < a.duration ? b : a), flights[0]) : undefined),
    [flights]
  );

  const sortedFlights = useMemo(() => {
    const list = [...flights];
    switch (activeSort) {
      case 'cheapest': return list.sort((a, b) => a.price - b.price);
      case 'fastest': return list.sort((a, b) => a.duration - b.duration);
      case 'departure': return list.sort((a, b) => timeToMins(a.departTime) - timeToMins(b.departTime));
      case 'recommended':
      default: return list;
    }
  }, [flights, activeSort]);

  function tagFor(flight: DisplayFlight): FlightCardTag | undefined {
    if (recommendedFlight && flight.resultIndex === recommendedFlight.resultIndex) return 'recommended';
    if (cheapestFlight && flight.resultIndex === cheapestFlight.resultIndex) return 'cheapest';
    if (fastestFlight && flight.resultIndex === fastestFlight.resultIndex) return 'fastest';
    return undefined;
  }

  return (
    <div className="flex-1 flex flex-col gap-3 sm:gap-4 w-full min-w-0">
      {/* Sort Tabs + view toggle — tabs scroll horizontally on mobile/tablet
          so 4 tabs never get squeezed; the list/grid toggle stays pinned
          to the right in a single row at every width (it's just two small
          icon buttons, unlike the old full-width Price Insights link). */}
      <div
        className="rounded-2xl overflow-hidden flex items-center justify-between gap-2"
        style={{
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(226,232,240,0.8)',
          boxShadow: '0 4px 20px rgba(40,60,120,0.07), inset 0 1px 0 rgba(255,255,255,0.7)',
        }}
      >
        <div className="flex overflow-x-auto no-scrollbar min-w-0" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          <div className="shrink-0">
            <SortTab
              label="Recommended"
              price={recommendedFlight ? convert(recommendedFlight.price) : '—'}
              active={activeSort === 'recommended'}
              onClick={() => setActiveSort('recommended')}
            />
          </div>
          <div className="w-px bg-slate-200/70 shrink-0" />
          <div className="shrink-0">
            <SortTab
              label="Cheapest"
              price={cheapestFlight ? convert(cheapestFlight.price) : '—'}
              active={activeSort === 'cheapest'}
              onClick={() => setActiveSort('cheapest')}
            />
          </div>
          <div className="w-px bg-slate-200/70 shrink-0" />
          <div className="shrink-0">
            <SortTab
              label="Fastest"
              price={fastestFlight ? convert(fastestFlight.price) : '—'}
              active={activeSort === 'fastest'}
              onClick={() => setActiveSort('fastest')}
            />
          </div>
          <div className="w-px bg-slate-200/70 shrink-0" />
          <div className="shrink-0">
            <SortTab
              label="Departure Time"
              active={activeSort === 'departure'}
              onClick={() => setActiveSort('departure')}
              hasChevron
            />
          </div>
        </div>

        {/* View toggle — actually switches FlightCarda's `view` prop below,
            not a decorative button. */}
        <div className="flex items-center gap-1 pr-2 shrink-0">
          <button
            onClick={() => setView('list')}
            title="List view"
            className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-orange-100 text-orange-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <LayoutList size={17} />
          </button>
          <button
            onClick={() => setView('grid')}
            title="Grid view"
            className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-orange-100 text-orange-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
          >
            <LayoutGrid size={17} />
          </button>
        </div>
      </div>

      {/* AI Banner — frosted glass, the signature element of this list.
          Marketing copy only ("500+ data points", "87% on-time") — no
          backing analytics endpoint exists for this banner, so it stays
          static, same as before. */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{
          y: -2,
          boxShadow: '0 16px 38px rgba(70,90,160,.10), 0 0 26px rgba(122,95,255,.10)',
        }}
        className="relative overflow-hidden cursor-default"
        style={{
          borderRadius: '24px',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,.75)',
          boxShadow: '0 6px 24px rgba(40,60,120,.08), 0 0 24px rgba(122,95,255,.06)',
          background: `
            radial-gradient(circle at 0% 50%, rgba(255,118,118,.14), transparent 32%),
            radial-gradient(circle at 100% 50%, rgba(77,152,255,.14), transparent 35%),
            linear-gradient(90deg, rgba(255,255,255,.96), rgba(252,252,255,.98), rgba(245,249,255,.98), rgba(238,246,255,.96))
          `,
          transition: 'transform .35s ease, box-shadow .35s ease',
        }}
      >
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 relative z-10">

          {/* Avatar — one restrained signature motion on this whole list:
              a slow breathing glow, not a hover-only effect, so the banner
              reads as quietly "alive" rather than static marketing chrome. */}
          <motion.div
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'radial-gradient(circle, #6B6BFF 0%, #6E5CFF 32%, #497DFF 58%, transparent 78%)' }}
            animate={{
              boxShadow: [
                '0 0 14px rgba(122,95,255,.32), 0 0 28px rgba(122,95,255,.14)',
                '0 0 20px rgba(122,95,255,.5), 0 0 40px rgba(122,95,255,.26)',
                '0 0 14px rgba(122,95,255,.32), 0 0 28px rgba(122,95,255,.14)',
              ],
            }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
           <img src="/pluto-mascot.png" alt="Pluto AI" className="w-full h-full object-cover scale-110" style={{ filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.7))' }} />
                 
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs sm:text-sm font-bold tracking-wide"
                style={{
                  background: 'linear-gradient(90deg, #4338CA, #7C3AED)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                ✨ Recommended by Pluto AI
              </span>
              <span
                className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full shrink-0"
                style={{ background: 'linear-gradient(135deg, #7B61FF, #B16EFF, #FF6FB5)' }}
              >
                BETA
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 mb-2 leading-relaxed max-w-2xl">
              This flight gives you the best balance of price, time and reliability based on 500+ data points.
            </p>

            <div className="flex items-center gap-1.5 flex-wrap">
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
                style={{ background: '#EAFBF2', color: '#16A34A', border: '1px solid #B8F3CF' }}
              >
                <Check size={11} strokeWidth={3} /> Best value
              </div>
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
                style={{ background: '#EEF5FF', color: '#2563EB', border: '1px solid #C7DCFF' }}
              >
                <Clock size={11} /> On-time performance 87%
              </div>
              <div
                className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap"
                style={{ background: '#EFFCF4', color: '#0F9D58', border: '1px solid #CFF6DB' }}
              >
                <Leaf size={11} /> Lower carbon
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Flight Cards — list or grid, both rendering the same real data
          through FlightCarda's `view` prop. Staggered fade-in either way. */}
      <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4' : 'flex flex-col gap-3 sm:gap-4'}>
        {loading ? (
          Array.from({ length: SKELETON_COUNT }).map((_, i) => <FlightCardaSkeleton key={i} />)
        ) : sortedFlights.length === 0 ? (
          <div className={view === 'grid' ? 'sm:col-span-2' : ''}>
            <FlightCardaEmptyState onReset={() => onResetFilters?.()} />
          </div>
        ) : (
          sortedFlights.map((flight, i) => (
            <motion.div
              key={flight.resultIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: Math.min(i, 6) * 0.04 }}
            >
              <FlightCarda
                flight={flight}
                index={i}
                tag={tagFor(flight)}
                view={view}
                onViewFares={onViewFares}
                onBookFare={onBookFare}
              />
            </motion.div>
          ))
        )}
      </div>

    </div>
  );
}