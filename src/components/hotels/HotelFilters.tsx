import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Star, Check, X } from 'lucide-react';
import { useHotelStore } from '../../stores/hotelStore';
import { formatCurrency } from '../../lib/utils';

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
    <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden" }} className="w-full">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${S.borderMid}` }}>
        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: S.navyDeep }}>Filters</span>
        {(activeFilterCount > 0 || propertySearch) && (
          <button 
            onClick={() => { resetFilters(); setPropertySearch(''); }} 
            style={{ fontSize: 13, color: S.accent, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
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

      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Popular Filters */}
        {/* Popular Filters */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${S.borderMid}` }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: S.navyDeep, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Popular Filters</h3>
          <div className="space-y-3.5">
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "6px 0" }}>
              <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${filters.cancellationPolicy === 'free' ? 'bg-[#003580] border-[#003580]' : 'border-gray-300 group-hover:border-[#003580]'}`}>
                {filters.cancellationPolicy === 'free' && <Check style={{ width: 12, height: 12, color: "#fff" }} />}
              </div>
              <input type="checkbox" className="hidden"
                checked={filters.cancellationPolicy === 'free'}
                onChange={() => setFilters({ cancellationPolicy: filters.cancellationPolicy === 'free' ? 'all' : 'free' })}
              />
              <span style={{ fontSize: 13, color: S.navyDeep, fontWeight: 500, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Free cancellation</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "6px 0" }}>
              <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${filters.amenities.includes('Breakfast') ? 'bg-[#003580] border-[#003580]' : 'border-gray-300 group-hover:border-[#003580]'}`}>
                {filters.amenities.includes('Breakfast') && <Check style={{ width: 12, height: 12, color: "#fff" }} />}
              </div>
              <input type="checkbox" className="hidden"
                checked={filters.amenities.includes('Breakfast')}
                onChange={() => toggleArrayFilter('amenities', 'Breakfast')}
              />
              <span style={{ fontSize: 13, color: S.navyDeep, fontWeight: 500, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Breakfast included</span>
            </label>
          </div>
        </div>

        {/* Price Slider */}
        {/* Price Slider */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${S.borderMid}` }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: S.navyDeep, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Price Range</h3>
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
        {/* Star Rating Pills */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${S.borderMid}` }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: S.navyDeep, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Star Rating</h3>
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
        {/* Guest Rating */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${S.borderMid}` }}>
          <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: S.navyDeep, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Guest Rating</h3>
          <div className="space-y-2">
            {[
              { label: 'Excellent: 9+', value: 9 },
              { label: 'Very Good: 8+', value: 8 },
              { label: 'Good: 7+', value: 7 },
              { label: 'Pleasant: 6+', value: 6 },
            ].map(r => {
              const isSelected = filters.reviewScore === r.value;
              return (
                <label key={r.value} className="flex cursor-pointer items-start gap-3 group">
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${isSelected ? 'border-[#003580]' : 'border-gray-300 group-hover:border-[#003580]'}`}>
                    {isSelected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                  </div>
                  <input type="radio" className="hidden"
                    checked={isSelected}
                    onChange={() => setFilters({ reviewScore: isSelected ? 0 : r.value })}
                  />
                  <span style={{ fontSize: 13, color: S.navyDeep, fontWeight: 500, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Property Type */}
        {propertyTypes.length > 0 && (
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${S.borderMid}` }}>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: S.navyDeep, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Property Type</h3>
            <div className="space-y-3.5">
              {(showAllPropertyTypes ? propertyTypes : propertyTypes.slice(0, 5)).map(pt => (
                <label key={pt} className="flex cursor-pointer items-start gap-3 group">
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${filters.propertyTypes.includes(pt) ? 'bg-[#003580] border-[#003580]' : 'border-gray-300 group-hover:border-[#003580]'}`}>
                    {filters.propertyTypes.includes(pt) && <Check style={{ width: 12, height: 12, color: "#fff" }} />}
                  </div>
                  <input type="checkbox" className="hidden"
                    checked={filters.propertyTypes.includes(pt)}
                    onChange={() => toggleArrayFilter('propertyTypes', pt)}
                  />
                  <span style={{ fontSize: 13, color: S.navyDeep, fontWeight: 500, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pt}</span>
                </label>
              ))}
            </div>
            {propertyTypes.length > 5 && (
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

        {/* Amenities */}
        {amenitiesList.length > 0 && (
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${S.borderMid}` }}>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: S.navyDeep, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Amenities</h3>
            <div className="space-y-3.5">
              {(showAllAmenities ? amenitiesList : amenitiesList.slice(0, 5)).map(am => (
                <label key={am} className="flex cursor-pointer items-start gap-3 group">
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${filters.amenities.includes(am) ? 'bg-[#003580] border-[#003580]' : 'border-gray-300 group-hover:border-[#003580]'}`}>
                    {filters.amenities.includes(am) && <Check style={{ width: 12, height: 12, color: "#fff" }} />}
                  </div>
                  <input type="checkbox" className="hidden"
                    checked={filters.amenities.includes(am)}
                    onChange={() => toggleArrayFilter('amenities', am)}
                  />
                  <span style={{ fontSize: 13, color: S.navyDeep, fontWeight: 500, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{am}</span>
                </label>
              ))}
            </div>
            {amenitiesList.length > 5 && (
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
        {neighborhoods.length > 0 && (
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${S.borderMid}` }}>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: S.navyDeep, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Neighborhood</h3>
            <div className="space-y-3.5">
              {(showAllNeighborhoods ? neighborhoods : neighborhoods.slice(0, 5)).map(nb => (
                <label key={nb} className="flex cursor-pointer items-start gap-3 group">
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${filters.neighborhoods.includes(nb) ? 'bg-[#003580] border-[#003580]' : 'border-gray-300 group-hover:border-[#003580]'}`}>
                    {filters.neighborhoods.includes(nb) && <Check style={{ width: 12, height: 12, color: "#fff" }} />}
                  </div>
                  <input type="checkbox" className="hidden"
                    checked={filters.neighborhoods.includes(nb)}
                    onChange={() => toggleArrayFilter('neighborhoods', nb)}
                  />
                  <span style={{ fontSize: 13, color: S.navyDeep, fontWeight: 500, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nb}</span>
                </label>
              ))}
            </div>
            {neighborhoods.length > 5 && (
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