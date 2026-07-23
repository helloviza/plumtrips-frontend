// ============================================================
//  FilterPanela.tsx — sidebar / drawer filters.
//
//  UI is wired to real data (accordion sections, checkbox-style
//  stops list, airline "show more", time-slot grid, carbon tag)
//  via the same flights/filters/onChange/onReset/mobile contract
//  used elsewhere in the results page.
//
//  BUG FIX: the original file referenced an `airlines` array that
//  was never defined anywhere in the component — it's now derived
//  from the `flights` prop. The airline toggle also now rebuilds
//  the selection from the CURRENT selection (not the full airline
//  list), so unchecking a second airline can't silently re-check
//  one you'd already unchecked.
//
//  UI POLISH: Baggage & Fare Type and Layover City used to render
//  as plain comma-joined text, which looked flat next to the rest
//  of the panel. They now render as pill/chip badges (same visual
//  language as the airline "show more" and Refundability cards),
//  so every section reads as a first-class filter block even
//  where there's no ActiveFilters field to wire up yet.
// ============================================================

import React, { useState } from 'react';
import { FilterSection } from '../../molecules/FilterSection';
import { Slider } from '../../atoms/Slider';
import { Checkbox } from '../../atoms/Checkbox';
import { AirlineLogo } from '../../molecules/AirlineLogo';
import { SlidersHorizontal, Sunrise, Sun, Sunset, Moon, Luggage, Ticket, MapPin } from 'lucide-react';
import { Tag } from '../../atoms/Tag';
import { cn } from '../../../lib/utils';
import type { DisplayFlight, ActiveFilters } from '../../../lib/types_t';
import { useCurrency } from '../../../context/currencyContext';
import { co2Badge } from '../ResultShared';

const AIRLINES_PREVIEW_COUNT = 5;

const TIME_SLOTS = [
  { id: 'morning',   label: 'Morning',   range: '6AM – 12PM', Icon: Sunrise, color: 'text-amber-500',  bg: 'bg-amber-50',  border: 'border-amber-300'  },
  { id: 'afternoon', label: 'Afternoon', range: '12PM – 6PM', Icon: Sun,     color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-300' },
  { id: 'evening',   label: 'Evening',   range: '6PM – 9PM',  Icon: Sunset,  color: 'text-rose-500',   bg: 'bg-rose-50',   border: 'border-rose-300'   },
  { id: 'night',     label: 'Night',     range: '9PM – 6AM',  Icon: Moon,    color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-300' },
] as const;

// Small reusable pill used for the Baggage/Fare Type/Layover chip lists.
function InfoChip({ icon: Icon, label }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 rounded-full pl-2 pr-2.5 py-1">
      <Icon size={12} className="text-slate-400 shrink-0" />
      {label}
    </span>
  );
}

interface FilterPanelaProps {
  flights: DisplayFlight[];
  filters: ActiveFilters;
  onChange: (f: ActiveFilters) => void;
  onReset: () => void;
  /** Renders inside a mobile drawer (drops the sticky sidebar sizing). */
  mobile?: boolean;
}

export function FilterPanela({ flights, filters, onChange, onReset, mobile }: FilterPanelaProps) {
  const { convert } = useCurrency();

  const airlines = [...new Set(flights.map(f => f.airline))].sort();
  const prices = flights.map(f => f.price);
  const maxP = prices.length ? Math.max(...prices) : 20000;
  const minP = prices.length ? Math.min(...prices) : 1000;

  const [showAllAirlines, setShowAllAirlines] = useState(false);

  // We now have `minPrice` in ActiveFilters, so both handles filter the results.

  // Correctly toggles a single airline in/out of the current selection.
  // (filters.airlines === [] is treated as "everything selected".)
  function toggleAirline(a: string) {
    const isChecked = filters.airlines.length === 0 || filters.airlines.includes(a);
    const current = filters.airlines.length === 0 ? airlines : filters.airlines;
    const next = isChecked ? current.filter(x => x !== a) : [...current, a];
    onChange({ ...filters, airlines: next.length === airlines.length ? [] : next });
  }

  // The three stop rows look independent, but they all map onto the single
  // filters.stops value (0 | 1 | 2 | null) — checking one clears the others.
  const cheapestForStops = (s: 0 | 1 | 2) => {
    const matching = flights.filter(f => (s === 2 ? f.stops >= 2 : f.stops === s));
    return matching.length ? convert(Math.min(...matching.map(f => f.price))) : undefined;
  };
  const setStops = (s: 0 | 1 | 2, checked: boolean) =>
    onChange({ ...filters, stops: checked ? s : null });

  // Derived, display-only data for the Baggage & Fare Type / Layover City
  // sections. No ActiveFilters field exists for these yet, so they stay
  // informational — but they're rendered as chips instead of raw text.
  const checkinBaggages = [...new Set(flights.map(f => f.checkinBaggage).filter(Boolean))] as string[];
  const fareTypes = [...new Set(flights.map(f => f.fareType).filter(Boolean))] as string[];
  const layoverCities = [...new Set(flights.flatMap(f => f.segments.slice(0, -1).map(s => s.toCity)))];

  return (
    <div className={cn('w-full flex flex-col', mobile ? '' : 'h-full sticky top-4 max-h-[calc(100vh-2rem)]')}>

      {/* Header */}
      <div className="flex items-center justify-between pb-3 mb-1 border-b border-slate-100 shrink-0">
        <div>
          <h2 className="text-base font-bold text-slate-900">{flights.length} Flight Results</h2>
          <span className="text-xs text-slate-500">
            Sorted by Recommended <span className="text-[10px]">▼</span>
          </span>
        </div>
        <button
          onClick={onReset}
          title="Clear all filters"
          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <SlidersHorizontal size={14} />
        </button>
      </div>

      {/* Scrollable filter sections */}
      <div className="relative flex-1 min-h-0">
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white/90 to-transparent z-10 rounded-b-xl" />

        <div className="h-full overflow-y-auto filter-scroll pr-0.5">

          {/* Price Range — high handle filters for real via filters.maxPrice;
              low handle is local-only until ExtendedFilters gets a minPrice field. */}
          <FilterSection title="Price Range">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-slate-600">
                {convert(filters.minPrice ?? minP)} – {convert(filters.maxPrice ?? maxP)}
              </span>
              <Slider
                min={minP}
                max={maxP}
                step={500}
                value={[filters.minPrice ?? minP, filters.maxPrice ?? maxP]}
                onValueChange={([lo, hi]) => {
                  onChange({ ...filters, minPrice: lo, maxPrice: hi });
                }}
              />
            </div>
          </FilterSection>

          {/* Stops */}
          <FilterSection title="Stops">
            <Checkbox
              label="Direct"
              rightLabel={cheapestForStops(0)}
              checked={filters.stops === 0}
              onChange={(c) => setStops(0, c)}
            />
            <Checkbox
              label="1 Stop"
              rightLabel={cheapestForStops(1)}
              checked={filters.stops === 1}
              onChange={(c) => setStops(1, c)}
            />
            <Checkbox
              label="2+ Stops"
              rightLabel={cheapestForStops(2)}
              checked={filters.stops === 2}
              onChange={(c) => setStops(2, c)}
            />
          </FilterSection>

          {/* Airlines */}
          {airlines.length > 0 && (
            <FilterSection title="Airlines">
              {(showAllAirlines ? airlines : airlines.slice(0, AIRLINES_PREVIEW_COUNT)).map((a) => {
                const checked = filters.airlines.length === 0 || filters.airlines.includes(a);
                const code = flights.find(f => f.airline === a)?.airlineCode ?? '';
                const minPrice = Math.min(...flights.filter(f => f.airline === a).map(f => f.price));
                return (
                  <div
                    key={a}
                    onClick={() => toggleAirline(a)}
                    className="flex items-center justify-between w-full group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center w-5 h-5">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAirline(a)}
                          onClick={(e) => e.stopPropagation()}
                          className="peer sr-only"
                        />
                        <div
                          className={cn(
                            'w-5 h-5 border rounded flex items-center justify-center transition-colors',
                            checked ? 'bg-orange-500 border-orange-500' : 'border-slate-300 bg-white group-hover:border-orange-400'
                          )}
                        >
                          {checked && (
                            <svg width={11} height={11} fill="none" stroke="white" strokeWidth={3} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <AirlineLogo code={code} name={a} size="sm" />
                        <span className="text-sm text-slate-700">{a}</span>
                      </div>
                    </div>
                    <span className="text-sm text-slate-500">{convert(minPrice)}</span>
                  </div>
                );
              })}
              {airlines.length > AIRLINES_PREVIEW_COUNT && (
                <button
                  onClick={() => setShowAllAirlines(v => !v)}
                  className="text-xs text-orange-600 font-medium hover:underline mt-2"
                >
                  {showAllAirlines ? 'Show less' : `Show ${airlines.length - AIRLINES_PREVIEW_COUNT} more`}
                </button>
              )}
            </FilterSection>
          )}

          {/* Departure Time — single-select, matches filters.departureSlot */}
          <FilterSection title="Departure Time" defaultExpanded={true}>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map(({ id, label, range, Icon, color, bg, border }) => {
                const active = filters.departureSlot === id;
                return (
                  <button
                    key={id}
                    onClick={() => onChange({ ...filters, departureSlot: filters.departureSlot === id ? null : id })}
                    className={cn(
                      'flex flex-col items-center justify-center gap-1 py-2.5 px-2 rounded-xl border text-center transition-all duration-200',
                      active
                        ? `${bg} ${border} shadow-sm`
                        : 'bg-white/40 border-slate-200/60 hover:border-slate-300'
                    )}
                  >
                    <Icon size={20} className={active ? color : 'text-slate-400'} strokeWidth={1.8} />
                    <span className={cn('text-[11px] font-semibold leading-tight', active ? 'text-slate-800' : 'text-slate-500')}>
                      {label}
                    </span>
                    <span className={cn('text-[9px] leading-tight', active ? 'text-slate-500' : 'text-slate-400')}>
                      {range}
                    </span>
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* Baggage & Fare Type — real data, rendered as chip pills so it
              reads as a proper filter block instead of a line of plain text.
              Still informational (no ActiveFilters field yet) — add e.g.
              `fareType: string | null` to make it interactive, same
              pattern as Stops/Refundability. */}
          <FilterSection title="Baggage & Fare Type" defaultExpanded={false}>
            <div className="flex flex-col gap-3">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Checked Baggage</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {checkinBaggages.length
                    ? checkinBaggages.map(b => <InfoChip key={b} icon={Luggage} label={b} />)
                    : <span className="text-xs text-slate-400">Not specified</span>}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Fare Type</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {fareTypes.length
                    ? fareTypes.map(f => <InfoChip key={f} icon={Ticket} label={f} />)
                    : <span className="text-xs text-slate-400">Not specified</span>}
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Refundability — fully wired: DisplayFlight.isRefundable + the
              existing filters.refundable field, same interaction pattern as
              Stops/Departure Time above. */}
          <FilterSection title="Refundability" defaultExpanded={false}>
            <div className="flex gap-2">
              {([
                { val: true, label: 'Refundable' },
                { val: false, label: 'Non-refundable' },
              ] as const).map(({ val, label }) => {
                const active = filters.refundable === val;
                const matching = flights.filter(f => f.isRefundable === val);
                const price = matching.length ? convert(Math.min(...matching.map(f => f.price))) : undefined;
                return (
                  <button
                    key={label}
                    onClick={() => onChange({ ...filters, refundable: filters.refundable === val ? null : val })}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-0.5 py-2 px-2 rounded-xl border text-center transition-all duration-200',
                      active ? 'bg-orange-50 border-orange-300 shadow-sm' : 'bg-white/40 border-slate-200/60 hover:border-slate-300'
                    )}
                  >
                    <span className={cn('text-[11px] font-semibold', active ? 'text-orange-700' : 'text-slate-600')}>
                      {label}
                    </span>
                    {price && (
                      <span className={cn('text-[9px]', active ? 'text-orange-600' : 'text-slate-400')}>
                        {price}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </FilterSection>

          {/* Layover City — real data, derived from each flight's segments
              (every stop's toCity except the final destination), rendered
              as chip pills for visual consistency with the rest of the
              panel. No matching field in ActiveFilters yet, so this stays
              informational only. */}
          <FilterSection title="Layover City" defaultExpanded={false}>
            <div className="flex flex-wrap gap-1.5">
              {layoverCities.length
                ? layoverCities.map(c => <InfoChip key={c} icon={MapPin} label={c} />)
                : <span className="text-xs text-slate-400">Direct flights only</span>}
            </div>
          </FilterSection>

          <div className="h-10" />
        </div>
      </div>

      {/* Footer — DisplayFlight still has no real emissions field, so this
          uses ResultShared's co2Badge(stops, duration) ESTIMATE to bucket
          flights as "lower carbon" (fewer stops, shorter duration score
          under 150). It's an approximation, not measured emissions data —
          swap in a real field here as soon as one exists. */}
      <div className="shrink-0 pt-3 mt-1 border-t border-slate-100">
        <Tag
          icon="Leaf"
          label={`Lower Carbon Flights (${flights.filter(f => co2Badge(f.stops, f.duration) < 150).length})`}
          color="green"
          className="w-full justify-center py-2"
        />
      </div>

    </div>
  );
}