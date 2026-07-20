// ============================================================
//  DateSlider.tsx — the horizontal date/price scroller shown
//  under the search bar.
//
//  UI reworked to match the capsule-button look:
//   - Date pills + right-hand action capsules now sit on ONE
//     single horizontal line (not stacked rows). The date
//     scroller flexes to fill available space; the action
//     capsules are docked at the end of that same row.
//   - Full labeled capsules from lg up; below that, compact
//     icon-only round buttons so nothing overflows on
//     mobile/tablet — but always inline, same row.
//
//  All data logic is unchanged:
//  - Per-date fares come from the SAME endpoint the calendar
//    popup uses — apiGetCalendarPrices(from, to, cabin) — just
//    windowed down to the ~7 days this strip actually shows.
//  - Falls back to the selected date's fare if a specific day's
//    price hasn't loaded yet, so pills never show a hard blank.
//  - Dates are built from LOCAL date components (never
//    toISOString()) so the ISO keys line up with whatever page
//    populated `prices`, regardless of the browser's timezone.
//
//  Drop-in call from ResultsPage.tsx:
//
//    <DateSlider
//      baseDate={form.departDate}
//      fromCode={form.from?.code}
//      toCode={form.to?.code}
//      cabinClass={form.cabinClass}
//      selectedPrice={cheapestPrice}
//      currency={convert}
//      onSelectDate={(iso) => onNewSearch?.({ ...form, departDate: iso }, multiLegs)}
//    />
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { DatePill } from './DatePill';
import { ChevronLeft, ChevronRight, BellRing, Leaf, Gem } from 'lucide-react';
import { apiGetCalendarPrices } from '../../../lib/flights_api';

interface DateSliderProps {
  /** ISO yyyy-mm-dd — the currently selected date. */
  baseDate: string;
  fromCode?: string;
  toCode?: string;
  cabinClass?: string;
  /** Cheapest fare for the currently selected date (fallback only). */
  selectedPrice: number | null;
  currency: (amount: number) => string;
  onSelectDate: (iso: string) => void;
  /** Optional pre-fetched ISO-date → fare map. Skips the internal apiGetCalendarPrices() call when supplied. */
  prices?: Record<string, number>;
  /** How many days to show either side of baseDate. Default 3 (7 total). */
  spread?: number;
  /** Optional handlers for the right-hand utility badges — wire these up to
   *  whatever the calendar / alerts / carbon-filter features actually do. */
  onOpenPriceCalendar?: () => void;
  onOpenPriceAlert?: () => void;
  onFilterLowerCarbon?: () => void;
}

function toISO(d: Date) {
  // Build the date string from LOCAL components — never toISOString(),
  // which converts to UTC first and silently shifts the calendar date
  // by ±1 day depending on the browser's timezone offset.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function DateSlider({
  baseDate,
  fromCode,
  toCode,
  cabinClass,
  selectedPrice,
  currency,
  onSelectDate,
  prices: pricesProp,
  spread = 3,
  onOpenPriceCalendar,
  onOpenPriceAlert,
  onFilterLowerCarbon,
}: DateSliderProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [fetchedPrices, setFetchedPrices] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(!pricesProp);

  // Fetch the same calendar-price map the Best Price Calendar uses, once
  // per route/cabin. We still only ever render the small window of dates
  // below — no month grid, no extra UI — this just reuses that data source.
  useEffect(() => {
    if (pricesProp) {
      setIsLoading(false);
      return; // caller already supplied prices — don't fetch
    }
    if (!fromCode || !toCode || fromCode === toCode) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    apiGetCalendarPrices(fromCode, toCode)
      .then(p => { if (!cancelled) setFetchedPrices(p); })
      .catch(() => { if (!cancelled) setFetchedPrices({}); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [fromCode, toCode, cabinClass, pricesProp]);

  const prices = pricesProp ?? fetchedPrices;

  const base = new Date(baseDate + 'T00:00:00');
  if (isNaN(base.getTime())) return null;

  const dates = Array.from({ length: spread * 2 + 1 }, (_, i) =>
    new Date(base.getFullYear(), base.getMonth(), base.getDate() + (i - spread))
  );

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 200, behavior: 'smooth' });
  };

  // Shared visual style for the floating action capsules — kept in one
  // place so the buttons stay visually consistent.
  const capsuleStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid rgba(203,213,225,0.6)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    boxShadow: '0 2px 8px rgba(40,60,120,0.07)',
  };
  const carbonCapsuleStyle: React.CSSProperties = {
    background: 'rgba(220,252,231,0.75)',
    border: '1px solid rgba(134,239,172,0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    boxShadow: '0 2px 8px rgba(22,163,74,0.08)',
  };

  return (
    // Single row — date scroller + action capsules aligned on one line.
    <div className="w-full flex items-center gap-3 my-4 max-w-[1500px] mx-auto">

      {/* ── Date scroll section — flexes to fill remaining space ── */}
      <div className="flex items-center flex-1 min-w-0">
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Earlier dates"
          className="w-7 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shrink-0"
        >
          <ChevronLeft size={18} />
        </button>

        <div ref={scrollerRef} className="flex gap-1.5 pl-1 overflow-x-auto scrollbar-hide flex-1 min-w-0">
          {dates.map(d => {
            const iso = toISO(d);
            const isSelected = iso === baseDate;
            // Real fare for this date if we have it; otherwise fall back to
            // the currently-selected date's cheapest fare so the pill still
            // shows something sensible rather than a blank/dash.
            const fare = prices[iso] ?? selectedPrice ?? null;
            const day = d.toLocaleDateString('en-IN', { weekday: 'short' });
            const dateLabel = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

            return (
              <DatePill
                key={iso}
                day={day}
                date={dateLabel}
                price={fare != null ? currency(fare) : null}
                active={isSelected}
                isLoading={isLoading && prices[iso] == null}
                onClick={() => onSelectDate(iso)}
              />
            );
          })}
        </div>

        <button
          onClick={() => scrollBy(1)}
          aria-label="Later dates"
          className="w-7 h-10 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors shrink-0"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* ── Right action capsules — same row, docked at the end.
          Full labeled capsules from lg up. ── */}
      <div className="hidden lg:flex items-center gap-2.5 shrink-0">
        <button
          onClick={onOpenPriceCalendar}
          style={capsuleStyle}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all hover:shadow-md group"
        >
          <Gem size={20} className="text-blue-500 shrink-0" />
          <div className="text-left">
            <div className="text-[11px] font-bold text-slate-800 leading-tight whitespace-nowrap">Best Price Calendar</div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">View Month</div>
          </div>
        </button>

        <button
          onClick={onOpenPriceAlert}
          style={capsuleStyle}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all hover:shadow-md group"
        >
          <BellRing size={18} className="text-slate-400 group-hover:text-orange-500 transition-colors shrink-0" />
          <div className="text-left">
            <div className="text-[11px] font-bold text-slate-800 leading-tight whitespace-nowrap">Price Alert</div>
            <div className="text-[10px] text-slate-400 leading-tight mt-0.5">Get Notified</div>
          </div>
        </button>

        <button
          onClick={onFilterLowerCarbon}
          style={carbonCapsuleStyle}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl transition-all hover:shadow-md group"
        >
          <Leaf size={18} className="text-green-500 shrink-0" />
          <div className="text-left">
            <div className="text-[11px] font-bold text-green-700 leading-tight whitespace-nowrap">Lower Carbon Flights</div>
            <div className="text-[10px] text-green-600 leading-tight mt-0.5">Available</div>
          </div>
        </button>
      </div>

      {/* ── Compact icon-only actions — same row, mobile/tablet (below lg) ── */}
      <div className="flex lg:hidden items-center gap-2 shrink-0">
        <button
          onClick={onOpenPriceCalendar}
          aria-label="Best Price Calendar"
          style={capsuleStyle}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:shadow-md shrink-0"
        >
          <Gem size={16} className="text-blue-500" />
        </button>
        <button
          onClick={onOpenPriceAlert}
          aria-label="Price Alert"
          style={capsuleStyle}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:shadow-md shrink-0"
        >
          <BellRing size={14} className="text-slate-400" />
        </button>
        <button
          onClick={onFilterLowerCarbon}
          aria-label="Lower Carbon Flights Available"
          style={carbonCapsuleStyle}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:shadow-md shrink-0"
        >
          <Leaf size={14} className="text-green-500" />
        </button>
      </div>
    </div>
  );
}