import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Star, Check, X, Wifi, Waves, Coffee, Car, Dumbbell, Wind } from 'lucide-react';
import { useHotelStore } from '../../stores/hotelStore';
import { formatCurrency } from '../../lib/utils';
import { useCurrency } from '../../context/currencyContext';

const S = {
  navy:      "#00305f",
  navyDeep:  "#0d2d5e",
  navyMid:   "#00477f",
  accent:    "#d06549",
  accentDk:  "#b8543a",
  muted:     "#8fafd4",
  border:    "#e2ecf7",
  borderMid: "#c9d5e8",
  surface:   "#f5f8fc",
};

const BLUE = S.navyDeep;

function DualRangeSlider({
  min, max, low, high,
  onLowChange, onHighChange,
}: {
  min: number; max: number; low: number; high: number;
  onLowChange: (v: number) => void;
  onHighChange: (v: number) => void;
}) {
  return (
    <div className="relative h-5 w-full mt-2">
      <style>{`
        .range-slider-input::-webkit-slider-thumb { pointer-events: auto; }
        .range-slider-input::-moz-range-thumb { pointer-events: auto; }
      `}</style>
      <div className="absolute top-1.5 left-0 right-0 h-1.5 rounded-full bg-slate-100 pointer-events-none">
        <div
          className="absolute h-1.5 rounded-full transition-all"
          style={{
            backgroundColor: '#f97316',
            left: `${((low - min) / (max - min)) * 100}%`,
            right: `${100 - ((high - min) / (max - min)) * 100}%`,
          }}
        />
      </div>
      <input type="range" min={min} max={max} value={low}
        onChange={e => onLowChange(Math.min(parseInt(e.target.value), high - 1))}
        className="absolute w-full h-2 top-1.5 appearance-none bg-transparent cursor-pointer z-20 range-slider-input pointer-events-none"
        style={{ accentColor: '#f97316' }}
      />
      <input type="range" min={min} max={max} value={high}
        onChange={e => onHighChange(Math.max(parseInt(e.target.value), low + 1))}
        className="absolute w-full h-2 top-1.5 appearance-none bg-transparent cursor-pointer z-20 range-slider-input pointer-events-none"
        style={{ accentColor: '#f97316' }}
      />
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-3">
      {children}
    </h3>
  );
}

function QuickToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <div
      className="flex items-center justify-between w-full cursor-pointer select-none py-0.5"
      onClick={onChange}
    >
      <span className="text-sm text-slate-700 font-medium leading-none">{label}</span>
      <div className={`relative flex-none w-[36px] h-[20px] rounded-full transition-colors duration-200 ${checked ? 'bg-orange-500' : 'bg-slate-200'}`}>
        <span
          className="absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200"
          style={{ transform: checked ? 'translateX(16px)' : 'translateX(0px)' }}
        />
      </div>
    </div>
  );
}

const AMENITY_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  'Wi-Fi': Wifi, 'WiFi': Wifi, 'Free Wi-Fi': Wifi,
  'Pool': Waves,
  'Breakfast': Coffee,
  'Parking': Car,
  'Gym': Dumbbell,
  'A/C': Wind,
};

function AmenityChip({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  const Icon = AMENITY_ICONS[label] || Check;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all ${
        active ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
      }`}
    >
      <Icon size={12} />
      {label}
    </button>
  );
}

interface HotelFiltersProps {
  maxPrice: number;
  neighborhoods: string[];
  amenitiesList: string[];
  propertyTypes: string[];
  propertySearch: string;
  setPropertySearch: (val: string) => void;
}

export default function HotelFilters({
  maxPrice,
  neighborhoods,
  amenitiesList,
  propertyTypes,
  propertySearch,
  setPropertySearch
}: HotelFiltersProps) {
  const { filters, setFilters, resetFilters } = useHotelStore();
  const { convert } = useCurrency();

  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllNeighborhoods, setShowAllNeighborhoods] = useState(false);
  const [showAllPropertyTypes, setShowAllPropertyTypes] = useState(false);

  // Helper to toggle array items in filters
  const toggleArrayFilter = (key: 'starRatings' | 'amenities' | 'propertyTypes' | 'neighborhoods', val: any) => {
    const arr = filters[key] as any[];
    if (arr.includes(val)) {
      setFilters({ [key]: arr.filter(item => item !== val) });
    } else {
      setFilters({ [key]: [...arr, val] });
    }
  };

  const activeFilterCount = (filters.priceRange[0] > 0 ? 1 : 0) +
    (filters.priceRange[1] < 50000 ? 1 : 0) +
    filters.starRatings.length +
    filters.amenities.length +
    filters.propertyTypes.length +
    (filters.cancellationPolicy !== 'all' ? 1 : 0) +
    filters.neighborhoods.length +
    (filters.reviewScore > 0 ? 1 : 0);

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200" style={{ boxShadow: "0 2px 12px rgba(40,60,120,0.07)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <span className="text-[15px] font-bold text-slate-900">Filters</span>
        {(activeFilterCount > 0 || propertySearch) && (
          <button
            onClick={() => { resetFilters(); setPropertySearch(''); }}
            className="text-xs font-bold text-orange-500 hover:underline bg-transparent border-none cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="px-5 py-4">
        {/* Search by property */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={propertySearch}
            onChange={e => setPropertySearch(e.target.value)}
            placeholder="Search by property name"
            className="w-full pl-9 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all outline-none placeholder:text-slate-400"
          />
          {propertySearch && (
            <button onClick={() => setPropertySearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        {/* Popular Filters */}
        <div className="pb-5 mb-5 border-b border-slate-100">
          <SectionHeading>Popular Filters</SectionHeading>
          <div className="space-y-3">
            <QuickToggleRow
              label="Free cancellation"
              checked={filters.cancellationPolicy === 'free'}
              onChange={() => setFilters({ cancellationPolicy: filters.cancellationPolicy === 'free' ? 'all' : 'free' })}
            />
            <QuickToggleRow
              label="Breakfast included"
              checked={filters.amenities.includes('Breakfast')}
              onChange={() => toggleArrayFilter('amenities', 'Breakfast')}
            />
          </div>
        </div>

        {/* Price Slider */}
        <div className="pb-5 mb-5 border-b border-slate-100">
          <SectionHeading>Price Range</SectionHeading>
          <DualRangeSlider
            min={0} max={maxPrice}
            low={filters.priceRange[0]}
            high={filters.priceRange[1] === 50000 ? maxPrice : filters.priceRange[1]}
            onLowChange={v => setFilters({ priceRange: [v, filters.priceRange[1] === 50000 ? maxPrice : filters.priceRange[1]] })}
            onHighChange={v => setFilters({ priceRange: [filters.priceRange[0], v] })}
          />
          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 w-full text-center">
              {convert(filters.priceRange[0])}
            </div>
            <span className="text-slate-300 font-bold">–</span>
            <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 w-full text-center">
              {filters.priceRange[1] >= 50000 ? `${convert(maxPrice)}+` : convert(filters.priceRange[1])}
            </div>
          </div>
        </div>

        {/* Star Rating Pills */}
        <div className="pb-5 mb-5 border-b border-slate-100">
          <SectionHeading>Star Rating</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {[5, 4, 3, 2, 1].map(star => {
              const isSelected = filters.starRatings.includes(star);
              return (
                <button
                  key={star}
                  onClick={() => toggleArrayFilter('starRatings', star)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-semibold transition-all ${
                    isSelected
                      ? 'bg-amber-400 border-amber-400 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300'
                  }`}
                >
                  <Star size={11} className={isSelected ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'} />
                  {star}
                </button>
              );
            })}
          </div>
        </div>

        {/* Guest Rating */}
        <div className="pb-5 mb-5 border-b border-slate-100">
          <SectionHeading>Guest Rating</SectionHeading>
          <div className="space-y-2.5">
            {[
              { label: 'Excellent: 9+', value: 9 },
              { label: 'Very Good: 8+', value: 8 },
              { label: 'Good: 7+', value: 7 },
              { label: 'Pleasant: 6+', value: 6 },
            ].map(r => {
              const isSelected = filters.reviewScore === r.value;
              return (
                <div
                  key={r.value}
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setFilters({ reviewScore: isSelected ? 0 : r.value })}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-300 bg-white'
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <input type="radio" className="hidden"
                      checked={isSelected}
                      onChange={() => setFilters({ reviewScore: isSelected ? 0 : r.value })}
                    />
                    <span className="text-sm text-slate-700 font-medium">{r.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Property Type */}
        {propertyTypes.length > 0 && (
          <div className="pb-5 mb-5 border-b border-slate-100">
            <SectionHeading>Property Type</SectionHeading>
            <div className="space-y-3">
              {(showAllPropertyTypes ? propertyTypes : propertyTypes.slice(0, 5)).map(pt => (
                <label key={pt} className="flex cursor-pointer items-center gap-2.5 group">
                  <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    filters.propertyTypes.includes(pt) ? 'bg-orange-500 border-orange-500' : 'border-slate-300 group-hover:border-orange-400'
                  }`}>
                    {filters.propertyTypes.includes(pt) && <Check style={{ width: 10, height: 10, color: "#fff" }} />}
                  </div>
                  <input type="checkbox" className="hidden"
                    checked={filters.propertyTypes.includes(pt)}
                    onChange={() => toggleArrayFilter('propertyTypes', pt)}
                  />
                  <span className="text-sm text-slate-700 font-medium flex-1 truncate">{pt}</span>
                </label>
              ))}
            </div>
            {propertyTypes.length > 5 && (
              <button
                onClick={() => setShowAllPropertyTypes(!showAllPropertyTypes)}
                className="mt-3 text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1"
              >
                {showAllPropertyTypes ? '− Show less' : '+ Show more'}
              </button>
            )}
          </div>
        )}

        {/* Amenities */}
        {amenitiesList.length > 0 && (
          <div className="pb-5 mb-5 border-b border-slate-100">
            <SectionHeading>Amenities</SectionHeading>
            <div className="flex flex-wrap gap-2">
              {(showAllAmenities ? amenitiesList : amenitiesList.slice(0, 5)).map(am => (
                <AmenityChip
                  key={am}
                  label={am}
                  active={filters.amenities.includes(am)}
                  onToggle={() => toggleArrayFilter('amenities', am)}
                />
              ))}
            </div>
            {amenitiesList.length > 5 && (
              <button
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="mt-3 text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1"
              >
                {showAllAmenities ? '− Show less' : '+ Show more'}
              </button>
            )}
          </div>
        )}

        {/* Neighborhoods */}
        {neighborhoods.length > 0 && (
          <div>
            <SectionHeading>Neighborhood</SectionHeading>
            <div className="space-y-3">
              {(showAllNeighborhoods ? neighborhoods : neighborhoods.slice(0, 5)).map(nb => (
                <label key={nb} className="flex cursor-pointer items-center gap-2.5 group">
                  <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    filters.neighborhoods.includes(nb) ? 'bg-orange-500 border-orange-500' : 'border-slate-300 group-hover:border-orange-400'
                  }`}>
                    {filters.neighborhoods.includes(nb) && <Check style={{ width: 10, height: 10, color: "#fff" }} />}
                  </div>
                  <input type="checkbox" className="hidden"
                    checked={filters.neighborhoods.includes(nb)}
                    onChange={() => toggleArrayFilter('neighborhoods', nb)}
                  />
                  <span className="text-sm text-slate-700 font-medium flex-1 truncate">{nb}</span>
                </label>
              ))}
            </div>
            {neighborhoods.length > 5 && (
              <button
                onClick={() => setShowAllNeighborhoods(!showAllNeighborhoods)}
                className="mt-3 text-xs text-orange-600 font-semibold hover:underline flex items-center gap-1"
              >
                {showAllNeighborhoods ? '− Show less' : '+ Show more'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}