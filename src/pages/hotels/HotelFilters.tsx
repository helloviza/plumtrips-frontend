import { useState } from 'react';
import _ from 'lodash';
import {
  Search, ChevronDown, ChevronUp, Star, Check, X,
  Wifi, Car, Waves, Dumbbell, Coffee, PawPrint, Wind,
  Tv, UtensilsCrossed, WashingMachine, Sparkles, ParkingSquare,
  Baby, Cigarette, Snowflake, ShieldCheck,
} from 'lucide-react';
import { useHotelStore } from '../../stores/hotelStore';
import { formatCurrency } from '../../lib/utils';

const BLUE = '#003580';

// Maps common amenity names to a representative icon.
// Falls back to a generic sparkle icon for anything unrecognized,
// so every row always has an aligned icon slot instead of empty space.
const AMENITY_ICON_RULES: [RegExp, React.ComponentType<{ className?: string }>][] = [
  [/wi-?fi|internet/i, Wifi],
  [/park/i, Car],
  [/pool|swim/i, Waves],
  [/gym|fitness/i, Dumbbell],
  [/breakfast|coffee/i, Coffee],
  [/pet/i, PawPrint],
  [/air ?condition|a\/c/i, Wind],
  [/tv|television/i, Tv],
  [/restaurant|kitchen|dining/i, UtensilsCrossed],
  [/laundry|washer/i, WashingMachine],
  [/garage|valet/i, ParkingSquare],
  [/child|kid|baby|family/i, Baby],
  [/smok/i, Cigarette],
  [/ac |cooling|heater|heating/i, Snowflake],
  [/secur|safe/i, ShieldCheck],
];

function getAmenityIcon(name: string) {
  const match = AMENITY_ICON_RULES.find(([regex]) => regex.test(name));
  return match ? match[1] : Sparkles;
}

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
      <div className="absolute top-1.5 left-0 right-0 h-1.5 rounded-full bg-gray-200 pointer-events-none">
        <div
          className="absolute h-1.5 rounded-full transition-all"
          style={{
            backgroundColor: BLUE,
            left: `${((low - min) / (max - min)) * 100}%`,
            right: `${100 - ((high - min) / (max - min)) * 100}%`,
          }}
        />
      </div>
      <input type="range" min={min} max={max} value={low}
        onChange={e => onLowChange(Math.min(parseInt(e.target.value), high - 1))}
        className="absolute w-full h-2 top-1.5 appearance-none bg-transparent cursor-pointer z-20 range-slider-input pointer-events-none"
        style={{ accentColor: BLUE }}
      />
      <input type="range" min={min} max={max} value={high}
        onChange={e => onHighChange(Math.max(parseInt(e.target.value), low + 1))}
        className="absolute w-full h-2 top-1.5 appearance-none bg-transparent cursor-pointer z-20 range-slider-input pointer-events-none"
        style={{ accentColor: BLUE }}
      />
    </div>
  );
}

// Reusable checkbox row — square check, fixed-size icon slot, single-line
// truncating label. Using items-center (not items-start) keeps the box,
// icon, and text baseline-aligned regardless of label length.
function CheckboxRow({
  checked,
  onChange,
  label,
  icon: Icon,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 group">
      <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors
        ${checked ? 'bg-[#003580] border-[#003580]' : 'border-gray-300 group-hover:border-[#003580]'}`}>
        {checked && <Check className="h-3.5 w-3.5 text-white" />}
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
      {Icon && (
        <div className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-400 group-hover:text-[#003580] transition-colors">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors truncate">
        {label}
      </span>
    </label>
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

  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllNeighborhoods, setShowAllNeighborhoods] = useState(false);
  const [showAllPropertyTypes, setShowAllPropertyTypes] = useState(false);

  // De-duplicated source lists — guards against upstream data (e.g. an API
  // response) containing the same amenity/neighborhood/property type twice,
  // which previously caused duplicate rows and duplicate React keys.
  const uniqueAmenities = _.uniq(amenitiesList);
  const uniqueNeighborhoods = _.uniq(neighborhoods);
  const uniquePropertyTypes = _.uniq(propertyTypes);

  // Helper to toggle array items in filters. Uses lodash to guarantee the
  // resulting filter array never contains duplicate entries, even if the
  // same value somehow gets toggled twice in a row (e.g. a fast double-click).
  const toggleArrayFilter = (key: 'starRatings' | 'amenities' | 'propertyTypes' | 'neighborhoods', val: any) => {
    const arr = filters[key] as any[];
    if (arr.includes(val)) {
      setFilters({ [key]: _.without(arr, val) });
    } else {
      setFilters({ [key]: _.uniq([...arr, val]) });
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
    <div className="w-full bg-white md:bg-transparent rounded-xl md:rounded-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <h2 className="font-bold text-gray-900 text-lg">Filter by:</h2>
        {(activeFilterCount > 0 || propertySearch) && (
          <button 
            onClick={() => { resetFilters(); setPropertySearch(''); }} 
            className="text-sm text-[#003580] hover:underline font-semibold flex items-center gap-1 transition-all"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Search by property */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={propertySearch}
          onChange={e => setPropertySearch(e.target.value)}
          placeholder="Search by property name"
          className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-[#003580]/20 focus:border-[#003580] transition-all outline-none placeholder:text-gray-400"
        />
        {propertySearch && (
          <button onClick={() => setPropertySearch('')} className="absolute right-3 top-3">
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden divide-y divide-gray-100">
        
        {/* Popular Filters */}
        <div className="p-5">
          <h3 className="font-bold text-gray-900 mb-4">Popular Filters</h3>
          <div className="space-y-3.5">
            <CheckboxRow
              checked={filters.cancellationPolicy === 'free'}
              onChange={() => setFilters({ cancellationPolicy: filters.cancellationPolicy === 'free' ? 'all' : 'free' })}
              label="Free cancellation"
            />
            <CheckboxRow
              checked={filters.amenities.includes('Breakfast')}
              onChange={() => toggleArrayFilter('amenities', 'Breakfast')}
              label="Breakfast included"
              icon={Coffee}
            />
          </div>
        </div>

        {/* Price Slider */}
        <div className="p-5">
          <h3 className="font-bold text-gray-900 mb-4">Price Range</h3>
          <DualRangeSlider
            min={0} max={maxPrice}
            low={filters.priceRange[0]}
            high={filters.priceRange[1] === 50000 ? maxPrice : filters.priceRange[1]}
            onLowChange={v => setFilters({ priceRange: [v, filters.priceRange[1] === 50000 ? maxPrice : filters.priceRange[1]] })}
            onHighChange={v => setFilters({ priceRange: [filters.priceRange[0], v] })}
          />
          <div className="mt-4 flex items-center justify-between gap-2">
            <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 w-full text-center">
              {formatCurrency(filters.priceRange[0])}
            </div>
            <span className="text-gray-400 font-bold">-</span>
            <div className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-semibold text-gray-700 w-full text-center">
              {filters.priceRange[1] >= 50000 ? `${formatCurrency(maxPrice)}+` : formatCurrency(filters.priceRange[1])}
            </div>
          </div>
        </div>

        {/* Star Rating Pills */}
        <div className="p-5">
          <h3 className="font-bold text-gray-900 mb-3">Star Rating</h3>
          <div className="flex flex-wrap gap-2">
            {[5, 4, 3, 2, 1].map(star => {
              const isSelected = filters.starRatings.includes(star);
              return (
                <button
                  key={star}
                  onClick={() => toggleArrayFilter('starRatings', star)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all border
                    ${isSelected 
                      ? 'bg-[#003580] border-[#003580] text-white' 
                      : 'bg-white border-gray-300 text-gray-700 hover:border-[#003580] hover:bg-blue-50'}`}
                >
                  {star} <Star className={`h-3.5 w-3.5 ${isSelected ? 'fill-white text-white' : 'fill-yellow-400 text-yellow-400'}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Guest Rating */}
        <div className="p-5">
          <h3 className="font-bold text-gray-900 mb-3">Guest Rating</h3>
          <div className="space-y-2">
            {[
              { label: 'Excellent: 9+', value: 9 },
              { label: 'Very Good: 8+', value: 8 },
              { label: 'Good: 7+', value: 7 },
              { label: 'Pleasant: 6+', value: 6 },
            ].map(r => {
              const isSelected = filters.reviewScore === r.value;
              return (
                <label key={r.value} className="flex cursor-pointer items-center gap-3 group">
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected ? 'border-[#003580]' : 'border-gray-300 group-hover:border-[#003580]'}`}>
                    {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-[#003580]" />}
                  </div>
                  <input type="radio" className="hidden"
                    checked={isSelected}
                    onChange={() => setFilters({ reviewScore: isSelected ? 0 : r.value })}
                  />
                  <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{r.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Property Type */}
        {uniquePropertyTypes.length > 0 && (
          <div className="p-5">
            <h3 className="font-bold text-gray-900 mb-4">Property Type</h3>
            <div className="space-y-3.5">
              {(showAllPropertyTypes ? uniquePropertyTypes : uniquePropertyTypes.slice(0, 5)).map(pt => (
                <CheckboxRow
                  key={pt}
                  checked={filters.propertyTypes.includes(pt)}
                  onChange={() => toggleArrayFilter('propertyTypes', pt)}
                  label={pt}
                />
              ))}
            </div>
            {uniquePropertyTypes.length > 5 && (
              <button 
                onClick={() => setShowAllPropertyTypes(!showAllPropertyTypes)}
                className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#003580] hover:underline"
              >
                {showAllPropertyTypes ? 'Show less' : 'Show all'}
                {showAllPropertyTypes ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </div>
        )}

        {/* Amenities — 2-column grid on wider screens, icon-labelled rows,
            all baseline-aligned via the shared CheckboxRow component. */}
        {uniqueAmenities.length > 0 && (
          <div className="p-5">
            <h3 className="font-bold text-gray-900 mb-4">Amenities</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5">
              {(showAllAmenities ? uniqueAmenities : uniqueAmenities.slice(0, 8)).map(am => (
                <CheckboxRow
                  key={am}
                  checked={filters.amenities.includes(am)}
                  onChange={() => toggleArrayFilter('amenities', am)}
                  label={am}
                  icon={getAmenityIcon(am)}
                />
              ))}
            </div>
            {uniqueAmenities.length > 8 && (
              <button 
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#003580] hover:underline"
              >
                {showAllAmenities ? 'Show less' : 'Show all'}
                {showAllAmenities ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </div>
        )}

        {/* Neighborhoods */}
        {uniqueNeighborhoods.length > 0 && (
          <div className="p-5">
            <h3 className="font-bold text-gray-900 mb-4">Neighborhood</h3>
            <div className="space-y-3.5">
              {(showAllNeighborhoods ? uniqueNeighborhoods : uniqueNeighborhoods.slice(0, 5)).map(nb => (
                <CheckboxRow
                  key={nb}
                  checked={filters.neighborhoods.includes(nb)}
                  onChange={() => toggleArrayFilter('neighborhoods', nb)}
                  label={nb}
                />
              ))}
            </div>
            {uniqueNeighborhoods.length > 5 && (
              <button 
                onClick={() => setShowAllNeighborhoods(!showAllNeighborhoods)}
                className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#003580] hover:underline"
              >
                {showAllNeighborhoods ? 'Show less' : 'Show all'}
                {showAllNeighborhoods ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
}