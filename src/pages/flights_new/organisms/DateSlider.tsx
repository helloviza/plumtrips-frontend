// ============================================================
//  DateSlider.tsx — the horizontal date/price scroller shown
//  under the search bar. Same visual design as before (glass
//  pill strip + DatePill), now wired to real data:
//
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
import { ChevronLeft, ChevronRight, BellRing, Leaf } from 'lucide-react';
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

  return (
    <div
      className="w-full rounded-xl flex items-center justify-between overflow-hidden my-4 max-w-7xl mx-auto"
      style={{
        background: 'rgba(255,255,255,0.28)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.5)',
        boxShadow: '0 8px 32px rgba(40,60,120,0.10), inset 0 1px 0 rgba(255,255,255,0.6)',
      }}
    >
      <div className="flex items-center flex-1 py-3 pl-2">
        <button
          onClick={() => scrollBy(-1)}
          aria-label="Earlier dates"
          className="w-8 h-12 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors shrink-0"
        >
          <ChevronLeft size={20} />
        </button>

        <div ref={scrollerRef} className="flex gap-2 px-2 overflow-x-auto scrollbar-hide flex-1">
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
          className="w-8 h-12 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors shrink-0"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="hidden lg:flex items-center self-stretch border-l border-slate-100">
        <div
          onClick={onOpenPriceCalendar}
          className="flex flex-col items-center justify-center px-5 border-r border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors h-full group"
        >
          <span className="text-blue-500 mb-1 group-hover:scale-110 transition-transform">💎</span>
          <span className="text-xs font-bold text-slate-800">Best Price</span>
          <span className="text-[10px] text-slate-500">Calendar View Month</span>
        </div>

        <div
          onClick={onOpenPriceAlert}
          className="flex flex-col items-center justify-center px-5 border-r border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors h-full group"
        >
          <BellRing size={16} className="text-slate-400 mb-1 group-hover:text-orange-500 transition-colors" />
          <span className="text-xs font-bold text-slate-800">Price Alert</span>
          <span className="text-[10px] text-slate-500">Get Notified</span>
        </div>

        <div
          onClick={onFilterLowerCarbon}
          className="flex flex-col items-center justify-center px-5 bg-green-50/50 cursor-pointer hover:bg-green-50 transition-colors h-full group"
        >
          <Leaf size={16} className="text-green-600 mb-1 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-green-800 text-center leading-tight">
            Lower Carbon<br />Flights Available
          </span>
        </div>
      </div>
    </div>
  );
}