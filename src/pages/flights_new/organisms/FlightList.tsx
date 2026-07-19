// ============================================================
//  FlightList.tsx — sort tabs, AI banner, and the flight
//  results list. UI unchanged — now driven by a real
//  `flights: DisplayFlight[]` prop instead of an undefined
//  module-level `flights` array (that variable was never
//  defined anywhere in the original file), with real sorting,
//  loading skeletons, and an empty state.
// ============================================================

import React, { useMemo, useState } from 'react';
import { SortTab } from '../../molecules/SortTab';
import { FlightCarda, FlightCardaSkeleton, FlightCardaEmptyState, type FlightCardTag } from './FlightCarda';
import { motion } from 'framer-motion';
import { Check, Clock, Leaf, ChevronRight } from 'lucide-react';
import type { DisplayFlight, FareTier } from '../../../lib/types_t';
import { useCurrency } from '../../../context/currencyContext';
import { timeToMins } from '../ResultShared';

type SortKey = 'recommended' | 'cheapest' | 'fastest' | 'departure';

export interface FlightListProps {
  flights: DisplayFlight[];
  /** True while results are still loading — shows skeleton rows. */
  loading?: boolean;
  onViewFares?: (f: DisplayFlight) => void;
  onBookFare?: (f: DisplayFlight, tier: FareTier) => void;
  /** "Clear all filters" in the empty state. */
  onResetFilters?: () => void;
  /** "Show Price Insights" — no insights data/endpoint exists yet, so this
   *  is just a hook for whenever that feature lands; omit to hide nothing
   *  (the button still shows, it just no-ops without a handler). */
  onShowPriceInsights?: () => void;
}

const SKELETON_COUNT = 5;

export function FlightList({ flights, loading, onViewFares, onBookFare, onResetFilters, onShowPriceInsights }: FlightListProps) {
  const [activeSort, setActiveSort] = useState<SortKey>('recommended');
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
    <div className="flex-1 flex flex-col gap-4">
      {/* Sort Tabs */}
      <div className="rounded-xl overflow-hidden flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.28)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 32px rgba(40,60,120,0.10), inset 0 1px 0 rgba(255,255,255,0.6)' }}>
        <div className="flex">
          <SortTab
            label="Recommended"
            price={recommendedFlight ? convert(recommendedFlight.price) : '—'}
            active={activeSort === 'recommended'}
            onClick={() => setActiveSort('recommended')}
          />
          <div className="w-px bg-slate-100" />
          <SortTab
            label="Cheapest"
            price={cheapestFlight ? convert(cheapestFlight.price) : '—'}
            active={activeSort === 'cheapest'}
            onClick={() => setActiveSort('cheapest')}
          />
          <div className="w-px bg-slate-100" />
          <SortTab
            label="Fastest"
            price={fastestFlight ? convert(fastestFlight.price) : '—'}
            active={activeSort === 'fastest'}
            onClick={() => setActiveSort('fastest')}
          />
          <div className="w-px bg-slate-100" />
          <SortTab
            label="Departure Time"
            active={activeSort === 'departure'}
            onClick={() => setActiveSort('departure')}
            hasChevron
          />
        </div>

        <button onClick={onShowPriceInsights} className="px-4 py-3 flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors h-full">
          📊 Show Price Insights <ChevronRight size={16} />
        </button>
      </div>

      {/* AI Banner — frosted glass premium.
          Marketing copy only ("500+ data points", "87% on-time") — no
          backing analytics endpoint exists for this banner, so it stays
          static, same as the original design. */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{
          y: -2,
          boxShadow: '0 18px 45px rgba(70,90,160,.12), 0 0 35px rgba(255,120,120,.08), 0 0 35px rgba(80,140,255,.08)',
        }}
        className="relative overflow-hidden cursor-default"
        style={{
          borderRadius: '24px',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid rgba(255,255,255,.7)',
          boxShadow: '0 8px 35px rgba(40,60,120,.08), 0 0 40px rgba(255,120,120,.05), 0 0 50px rgba(70,140,255,.05)',
          background: `
            radial-gradient(circle at 0% 50%, rgba(255,118,118,.20), transparent 32%),
            radial-gradient(circle at 100% 50%, rgba(77,152,255,.18), transparent 35%),
            linear-gradient(90deg, rgba(255,255,255,.94), rgba(252,252,255,.98), rgba(245,249,255,.98), rgba(236,246,255,.95))
          `,
          transition: 'transform .35s ease, box-shadow .35s ease',
        }}
      >
        <div className="flex items-center gap-4 px-5 py-4 relative z-10">

          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 relative"
            style={{
              background: 'radial-gradient(circle, #6B6BFF 0%, #6E5CFF 30%, #497DFF 55%, transparent 75%)',
              boxShadow: '0 0 25px #7A5FFF, 0 0 60px rgba(122,95,255,.55)',
            }}
          >
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="9" width="20" height="15" rx="5" fill="white" fillOpacity="0.95"/>
              <circle cx="10.5" cy="15" r="2" fill="#6B6BFF"/>
              <circle cx="19.5" cy="15" r="2" fill="#6B6BFF"/>
              <rect x="11" y="19" width="8" height="2" rx="1" fill="#6B6BFF" opacity="0.7"/>
              <rect x="13" y="5" width="4" height="5" rx="1.5" fill="white" fillOpacity="0.9"/>
              <circle cx="15" cy="4" r="1.5" fill="white"/>
              <rect x="3" y="13" width="2" height="6" rx="1" fill="white" fillOpacity="0.8"/>
              <rect x="25" y="13" width="2" height="6" rx="1" fill="white" fillOpacity="0.8"/>
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-800 tracking-wide">✨ Recommended by Pluto AI</span>
                <span
                  className="text-[10px] font-semibold text-white px-2 py-0.5 rounded-full"
                  style={{ background: 'linear-gradient(135deg, #7B61FF, #B16EFF, #FF6FB5)' }}
                >
                  BETA
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: '#EAFBF2', color: '#16A34A', border: '1px solid #B8F3CF' }}
                >
                  <Check size={10} strokeWidth={3} /> Best value
                </div>
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: '#EEF5FF', color: '#2563EB', border: '1px solid #C7DCFF' }}
                >
                  <Clock size={10} /> On-time performance 87%
                </div>
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                  style={{ background: '#EFFCF4', color: '#0F9D58', border: '1px solid #CFF6DB' }}
                >
                  <Leaf size={10} /> Lower carbon
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              This flight gives you the best balance of price, time and reliability based on 500+ data points.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Flight Cards list */}
      <div className="flex flex-col gap-4">
        {loading ? (
          Array.from({ length: SKELETON_COUNT }).map((_, i) => <FlightCardaSkeleton key={i} />)
        ) : sortedFlights.length === 0 ? (
          <FlightCardaEmptyState onReset={() => onResetFilters?.()} />
        ) : (
          sortedFlights.map((flight, i) => (
            <FlightCarda
              key={flight.resultIndex}
              flight={flight}
              index={i}
              tag={tagFor(flight)}
              onViewFares={onViewFares}
              onBookFare={onBookFare}
            />
          ))
        )}
      </div>

    </div>
  );
}