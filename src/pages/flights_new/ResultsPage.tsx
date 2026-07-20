import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import SearchBar from './organisms/SearchBar';
import { DateSlider } from './organisms/DateSlider';
import { FilterPanela } from './organisms/FilterPanela';
import { FlightList } from './organisms/FlightList';
import { SearchSummary } from './organisms/SearchSummary';
import type { SearchForm, DisplayFlight, ActiveFilters, FareTier } from '../../lib/types_t';
import { apiSearchFlights } from '../../lib/flights_api';
import { useCurrency } from '../../context/currencyContext';
import { slotMatch, type CityLeg } from './ResultShared';

const DEFAULT_FILTERS: ActiveFilters = {
  stops: null,
  maxPrice: null,
  airlines: [],
  departureSlot: null,
  arrivalSlot: null,
  refundable: null,
  sortBy: 'price',
};

interface SearchResultsProps {
  form: SearchForm;
  multiLegs?: CityLeg[];
  onBook?: (flight: DisplayFlight, tier: FareTier, legIndex?: number) => void;
  onBack?: () => void;
  onNewSearch?: (form: SearchForm, multiLegs?: CityLeg[]) => void;
  selectedOutboundFlight?: DisplayFlight | null;
  selectedOutboundTier?: FareTier | null;
  selectedLegs?: Array<{ flight: DisplayFlight; tier: FareTier } | null>;
}

export default function ResultsSearch({
  form: formProp,
  multiLegs: multiLegsProp,
  onBook,
  onBack,
  onNewSearch,
  selectedOutboundFlight,
  selectedOutboundTier: selectedOutboundTierProp,
}: SearchResultsProps) {
  const { convert } = useCurrency();
  const heroRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<SearchForm | null>(formProp);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noResultReason, setNoResultReason] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActiveFilters>(DEFAULT_FILTERS);

  const [outboundFlights, setOutboundFlights] = useState<DisplayFlight[]>([]);
  const [returnFlights, setReturnFlights] = useState<DisplayFlight[] | undefined>(undefined);

  const [selectedOutbound, setSelectedOutbound] = useState<DisplayFlight | null>(selectedOutboundFlight ?? null);
  const [selectedOutboundTier, setSelectedOutboundTier] = useState<FareTier | null>(selectedOutboundTierProp ?? null);
  const isPickingReturn = !!(form?.tripType === 'roundTrip' && selectedOutbound && returnFlights?.length);

  const runSearch = useCallback((searchForm: SearchForm, legs?: CityLeg[]) => {
    setForm(searchForm);
    setFilters(DEFAULT_FILTERS);
    setSelectedOutbound(null);
    setSelectedOutboundTier(null);
    setLoading(true);
    setError(null);
    setNoResultReason(null);
    onNewSearch?.(searchForm, legs);
    apiSearchFlights(searchForm, legs)
      .then(result => {
        setOutboundFlights(result.outbound);
        setReturnFlights(result.returnFlights);
        setNoResultReason(result.noResultReason ?? null);
      })
      .catch((err: any) => {
        setError(err?.message ?? 'Something went wrong while searching flights. Please try again.');
        setOutboundFlights([]);
        setReturnFlights(undefined);
      })
      .finally(() => setLoading(false));
  }, [onNewSearch]);

  useEffect(() => {
    runSearch(formProp, multiLegsProp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayedFlights = isPickingReturn ? (returnFlights as DisplayFlight[]) : outboundFlights;

  const filteredFlights = useMemo(() => {
    return displayedFlights.filter(f => {
      if (filters.stops !== null) {
        const matchesStops = filters.stops === 2 ? f.stops >= 2 : f.stops === filters.stops;
        if (!matchesStops) return false;
      }
      if (filters.maxPrice !== null && f.price > filters.maxPrice) return false;
      if (filters.airlines.length > 0 && !filters.airlines.includes(f.airline)) return false;
      if (!slotMatch(f.departTime, filters.departureSlot)) return false;
      if (!slotMatch(f.arriveTime, filters.arrivalSlot)) return false;
      if (filters.refundable !== null && f.isRefundable !== filters.refundable) return false;
      return true;
    });
  }, [displayedFlights, filters]);

  const cheapestPrice = useMemo(
    () => (filteredFlights.length ? Math.min(...filteredFlights.map(f => f.price)) : null),
    [filteredFlights]
  );

  function handleBookFare(flight: DisplayFlight, tier: FareTier) {
    if (form?.tripType === 'roundTrip' && !isPickingReturn && returnFlights && returnFlights.length > 0) {
      setSelectedOutbound(flight);
      setSelectedOutboundTier(tier);
      setFilters(DEFAULT_FILTERS);
      heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onBook?.(flight, tier, 0);
      return;
    }

    if (form?.tripType === 'roundTrip' && selectedOutbound) {
      onBook?.(flight, tier, 1);
      return;
    }

    onBook?.(flight, tier);
  }

  function backToOutbound() {
    setSelectedOutbound(null);
    setSelectedOutboundTier(null);
    setFilters(DEFAULT_FILTERS);
  }

  function scrollToSearchBar() {
    heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div
      className="min-h-screen font-sans text-slate-900"
      style={{
        background: `radial-gradient(circle at 50% -20%, rgba(82,145,255,.15), transparent 38%), radial-gradient(circle at 0% 20%, rgba(255,132,132,.06), transparent 30%), radial-gradient(circle at 100% 30%, rgba(88,170,255,.08), transparent 35%), linear-gradient(180deg, #FAFCFF 0%, #F6F9FD 40%, #EEF3FA 100%)`,
      }}
    >
      {/* Search bar + date slider — no separate white panel, same page background flows through */}
      <div ref={heroRef} className="w-full">
        <div className="max-w-[1500px] mx-auto px-6 pt-4 pb-2">
          <SearchBar onSearch={runSearch} form={form ?? undefined} />
          {form && !isPickingReturn && (
            <DateSlider
              baseDate={form.departDate}
              fromCode={form.from?.code}
              toCode={form.to?.code}
              cabinClass={form.cabinClass}
              selectedPrice={cheapestPrice}
              currency={convert}
              onSelectDate={(iso) => runSearch({ ...form, departDate: iso })}
            />
          )}
        </div>
      </div>

      <main className="max-w-[1500px] mx-auto px-6 pb-20 pt-4">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-medium px-4 py-3">
            {error}
          </div>
        )}
        {!error && !loading && noResultReason && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-sm font-medium px-4 py-3">
            {noResultReason}
          </div>
        )}

        {/* Round-trip step banner */}
        {isPickingReturn && form && selectedOutbound && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
            <div className="text-sm text-orange-800">
              <span className="font-bold">Outbound selected</span> — {selectedOutbound.fromCode} → {selectedOutbound.toCode}, {selectedOutbound.departTime}.
              {' '}Now choose your return flight ({form.to.code} → {form.from.code}).
            </div>
            <button onClick={backToOutbound} className="shrink-0 text-sm font-bold text-orange-700 hover:underline whitespace-nowrap">
              ← Back to outbound
            </button>
          </div>
        )}

        {/* Column on mobile/tablet, side-by-side row from lg up */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left filter — glass card, sticky on desktop */}
          <div className="w-full lg:w-72 lg:shrink-0 lg:sticky lg:top-[72px]">
            <div
              className="rounded-xl p-4 flex flex-col"
              style={{
                background: 'rgba(255,255,255,0.28)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 8px 32px rgba(40,60,120,0.10), inset 0 1px 0 rgba(255,255,255,0.6)',
              }}
            >
              <style>{`@media (min-width: 1024px) { .results-filter-card { height: calc(100vh - 100px); } }`}</style>
              <div className="results-filter-card flex flex-col flex-1 min-h-0">
                <FilterPanela
                  mobile
                  flights={filteredFlights}
                  filters={filters}
                  onChange={setFilters}
                  onReset={() => setFilters(DEFAULT_FILTERS)}
                />
              </div>
            </div>
          </div>

          <FlightList
            flights={filteredFlights}
            loading={loading}
            onBookFare={handleBookFare}
            onResetFilters={() => setFilters(DEFAULT_FILTERS)}
          />

          {form && <SearchSummary form={form} onEdit={scrollToSearchBar} />}
        </div>
      </main>
    </div>
  );
}