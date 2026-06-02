import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HotelFilters from '../../components/hotels/HotelFilters';
import SortDropdown from '../../components/hotels/SortDropdown';
import {
  ArrowLeft, MapPin, X, Star, Search,
  Wifi, Dumbbell, UtensilsCrossed, Car, Waves,
  Coffee, Heart, ChevronDown, SlidersHorizontal, Loader2, AlertTriangle, Shield, CheckCircle, Plus, Minus, Users, BedDouble
} from 'lucide-react';
import { useHotelStore } from '../../stores/hotelStore';
import type { Room } from '../../stores/hotelStore';
import { useHotelSearch, useHotelRooms } from '../../hooks/useHotelApi';
import { calculateNights, formatDateShort, formatCurrency } from '../../lib/utils';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

// ── Musafir colour tokens ─────────────────────────────────────────────────
const BLUE = '#003580';
const YELLOW = '#FFC107';        // "See rooms" button

// ── Shared UI ─────────────────────────────────────────────────────────────
const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Free WiFi': <Wifi className="h-3.5 w-3.5" />,
  'Gym': <Dumbbell className="h-3.5 w-3.5" />,
  'Restaurant': <UtensilsCrossed className="h-3.5 w-3.5" />,
  'Parking': <Car className="h-3.5 w-3.5" />,
  'Pool': <Waves className="h-3.5 w-3.5" />,
  'Breakfast': <Coffee className="h-3.5 w-3.5" />,
};

function StarRow({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < count ? 'fill-[#FFC107] text-[#FFC107]' : 'fill-gray-200 text-gray-200'}`} />
      ))}
    </span>
  );
}
function HotelCard({ 
  hotel, 
  nights, 
  showTotalPrice,
  isSelected
}: { 
  hotel: any; 
  nights: number; 
  showTotalPrice: boolean;
  isSelected?: boolean;
}) {
  const navigate = useNavigate();
  const { setSelectedHotel } = useHotelStore();
  const price = showTotalPrice ? hotel.price : Math.round(hotel.price / nights);
  const taxes = showTotalPrice ? hotel._taxes : Math.round((hotel._taxes || 0) / nights);

  // Strict API mapping for ratings.
  // If no text reviews from API, just show star rating as the metric
  const hasRealReviews = hotel.reviewCount > 0;
  const displayRating = hasRealReviews ? hotel.rating : hotel.starRating;

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border bg-white transition-all duration-300 hover:shadow-md ${
      isSelected ? 'border-[#003580] ring-2 ring-[#003580]/20 shadow-md' : 'border-gray-200'
    }`}>
      <div className="flex flex-col md:flex-row">
        {/* Image Gallery area */}
        <div className="relative w-full md:w-72 shrink-0 bg-slate-100 overflow-hidden">
          <img
            src={hotel.images[0] || '/assets/hotel-bg.jpg'}
            alt={hotel.name}
            loading="lazy"
            className="h-48 md:h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          />
          {hotel.freeCancellation && (
            <span className="absolute top-3 left-3 bg-emerald-500/95 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
              <Shield className="w-3 h-3" /> Free cancellation
            </span>
          )}
        </div>

        {/* Middle: Info */}
        <div className="flex flex-1 flex-col justify-between p-5">
          <div>
            <div className="mb-2">
              <StarRow count={hotel.starRating} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 leading-tight">
              {hotel.name}
            </h3>
            <p className="mt-1 text-sm text-[#003580] flex items-center gap-1 font-medium">
              <MapPin className="h-3.5 w-3.5" />
              <span className="underline decoration-dotted cursor-pointer">{hotel.location}</span>
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {hotel.amenities.slice(0, 5).map((a: string, i: number) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-gray-600 bg-slate-50 border border-slate-100 px-2 py-1 rounded-md">
                {AMENITY_ICONS[a] ?? <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />}
                {a}
              </span>
            ))}
            {hotel.amenities.length > 5 && (
              <span className="text-xs text-gray-400 font-medium">+{hotel.amenities.length - 5} more</span>
            )}
          </div>
        </div>

        {/* Right: Price & CTA */}
        <div className="w-full md:w-56 shrink-0 border-t md:border-t-0 md:border-l border-gray-100 p-5 flex flex-col justify-between bg-slate-50/30">
          <div className="flex justify-between items-start mb-4">
            {/* Ratings strictly from API */}
            <div className="flex items-center gap-2">
              <div className="bg-[#003580] text-white font-bold text-sm px-2 py-1 rounded-md rounded-tr-none flex items-center gap-1">
                {displayRating.toFixed(1)}
              </div>
              {hasRealReviews && (
                <div className="text-xs">
                  <div className="font-bold text-gray-900">Good</div>
                  <div className="text-gray-500">{hotel.reviewCount} reviews</div>
                </div>
              )}
            </div>
          </div>

          <div className="text-right mt-auto">
            <div className="text-xs text-gray-500 mb-1">{nights} night{nights > 1 ? 's' : ''}, {useHotelStore.getState().searchParams.rooms || 1} room{(useHotelStore.getState().searchParams.rooms || 1) > 1 ? 's' : ''}</div>
            <div className="text-2xl font-extrabold text-gray-900 tabular-nums leading-none">
              {formatCurrency(price)}
            </div>
            <div className="mt-1.5 text-[11px] text-gray-500 font-medium">
              + {formatCurrency(taxes ?? 0)} taxes & fees
            </div>
            
            <button
              onClick={() => setSelectedHotel(hotel)}
              className={`mt-4 w-full rounded-lg px-4 py-2.5 text-sm font-bold transition-all shadow-sm flex items-center justify-center gap-2 ${
                isSelected 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'bg-[#FFC107] text-slate-900 hover:bg-[#ffb300]'
              }`}
            >
              {isSelected ? (
                <>
                  <CheckCircle className="w-4 h-4" /> Selected
                </>
              ) : 'Select'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Sticky Bottom Bar for Selected Hotel */}
      {isSelected && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex justify-center animate-in slide-in-from-bottom-full duration-300">
          <div className="max-w-6xl w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 hidden sm:block">
                <img src={hotel.images[0] || '/assets/hotel-bg.jpg'} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Selected Hotel</div>
                <div className="font-bold text-gray-900 truncate max-w-xs sm:max-w-md">{hotel.name}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="text-right hidden sm:block">
                <div className="text-sm text-gray-500 font-medium">{nights} night{nights > 1 ? 's' : ''}</div>
                <div className="font-extrabold text-xl text-[#003580] leading-none">
                  {formatCurrency(showTotalPrice ? hotel.price : Math.round(hotel.price / nights))}
                </div>
              </div>
              <button
                onClick={() => navigate(`/hotels/${hotel.id}/rooms`)}
                className="flex-1 sm:flex-none bg-[#003580] hover:bg-[#002766] text-white px-8 py-3 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
              >
                View Rooms
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HotelResults() {
  const navigate = useNavigate();
  const { searchParams, filters, setFilters, resetFilters, sortBy, setSortBy, sortDirection, setSortDirection, setSearchResultsMap, selectedHotel, setSelectedHotel, selectedRooms } = useHotelStore();
  const { hotels: apiHotels, rawResults, loading, error, statusMessage, search, loadMore, hasMore, loadingMore } = useHotelSearch();

  // Local state
  const [propertySearch, setPropertySearch] = useState('');
  const [showAllNeighbourhoods, setShowAllNeighbourhoods] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(10);
  const [showTotalPrice, setShowTotalPrice] = useState(true);

  const nights = calculateNights(searchParams.checkIn, searchParams.checkOut) || 1;
  const ci = searchParams.checkIn ? (searchParams.checkIn instanceof Date ? searchParams.checkIn : new Date(searchParams.checkIn)) : null;
  const co = searchParams.checkOut ? (searchParams.checkOut instanceof Date ? searchParams.checkOut : new Date(searchParams.checkOut)) : null;

  // ── Trigger API search on mount ─────────────────────────────────────
  useEffect(() => {
    if (!searchParams.locationId && !searchParams.location) {
      navigate('/hotels');
      return;
    }
    const checkIn = ci ? ci.toISOString().split('T')[0] : '';
    const checkOut = co ? co.toISOString().split('T')[0] : '';
    if (!checkIn || !checkOut) { navigate('/hotels'); return; }

    if (searchParams.children > 0 && searchParams.childrenAges.length !== searchParams.children) {
      navigate('/hotels');
      return;
    }

    search({
      cityCode: searchParams.locationId ?? searchParams.location,
      checkIn,
      checkOut,
      rooms: searchParams.rooms,
      adults: searchParams.adults,
      children: searchParams.children || undefined,
      nationality: 'IN',
    });
  }, []);

  useEffect(() => {
    if (rawResults.length > 0) {
      const map: Record<string, any> = {};
      for (const r of rawResults) {
        if (r.HotelCode) map[r.HotelCode] = r;
        if (r.BookingCode) map[r.BookingCode] = r;
      }
      setSearchResultsMap(map);
    }
  }, [rawResults]);

  // ── Dynamic derived data from actual API results ─────────────────────────
  const MAX_PRICE = useMemo(() => {
    let max = 0;
    apiHotels.forEach(h => { if(h.price > max) max = h.price; });
    return max > 0 ? max : 5000;
  }, [apiHotels]);

  const NEIGHBOURHOODS = useMemo(() => {
    const seen = new Set<string>();
    apiHotels.forEach(h => {
      const parts = h.location.split(',');
      if (parts.length > 1) seen.add(parts[0].trim());
    });
    return Array.from(seen).slice(0, 20);
  }, [apiHotels]);

  const AMENITIES_LIST = useMemo(() => {
    const seen = new Set<string>();
    apiHotels.forEach(h => h.amenities.forEach(a => seen.add(a)));
    const fallback = ['Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Parking', 'Breakfast'];
    return seen.size > 0 ? Array.from(seen).slice(0, 15) : fallback;
  }, [apiHotels]);

  const PROPERTY_TYPES = useMemo(() => {
    const seen = new Set<string>();
    apiHotels.forEach(h => { if(h.propertyType) seen.add(h.propertyType); });
    return Array.from(seen).slice(0, 5);
  }, [apiHotels]);

  // ── Filter logic ─────────────────────────────────────────────────────────
  const filteredHotels = useMemo(() => {
    let r = [...apiHotels];

    if (propertySearch.trim()) {
      r = r.filter(h => h.name.toLowerCase().includes(propertySearch.toLowerCase()));
    }

    // Min price and Max price from filters
    const isDefaultMax = filters.priceRange[1] === 50000;
    if (filters.priceRange[0] > 0 || !isDefaultMax) {
      const effectiveMax = isDefaultMax ? Infinity : filters.priceRange[1];
      r = r.filter(h => h.price >= filters.priceRange[0] && h.price <= effectiveMax);
    }

    if (filters.starRatings.length) {
      r = r.filter(h => filters.starRatings.includes(h.starRating));
    }

    if (filters.propertyTypes.length) {
      r = r.filter(h => filters.propertyTypes.includes(h.propertyType));
    }

    if (filters.neighborhoods.length) {
      r = r.filter(h => filters.neighborhoods.some(n => h.location.includes(n)));
    }

    if (filters.amenities.length) {
      r = r.filter(h => filters.amenities.every(a => h.amenities.some(ha => ha.toLowerCase().includes(a.toLowerCase()))));
    }

    if (filters.cancellationPolicy === 'free') r = r.filter(h => h.freeCancellation);
    
    // Exact match for ReviewScore via StarRating since no text reviews available
    if (filters.reviewScore > 0) {
      r = r.filter(h => h.starRating >= filters.reviewScore);
    }

    const dir = sortDirection === 'asc' ? 1 : -1;
    switch (sortBy) {
      case 'cheapest': r.sort((a, b) => (a.price - b.price) * dir); break;
      case 'rating': r.sort((a, b) => (b.starRating - a.starRating) * dir); break;
      case 'reviews': r.sort((a, b) => (b.starRating - a.starRating) * dir); break;
      case 'distance': r.sort((a, b) => (parseFloat(a.distance) - parseFloat(b.distance)) * dir); break;
      // case 'relevance': break;
    }
    return r;
  }, [apiHotels, filters, sortBy, sortDirection, propertySearch]);

  const handleClearFilters = () => {
    resetFilters();
    setPropertySearch('');
  };

  const toggleArrayFilter = (field: keyof typeof filters, value: any) => {
    const cur = filters[field] as any[];
    setFilters({ [field]: cur.includes(value) ? cur.filter(x => x !== value) : [...cur, value] });
  };
// ── Hotel Card ─────────────────────────────────────────────


  // Sticky bottom summary bar for multiple room selections
  const totalRoomsSelected = selectedRooms.length ? selectedRooms.reduce((sum, r) => sum + r.quantity, 0) : 0;
  const totalPrice = selectedRooms.length ? selectedRooms.reduce((sum, r) => sum + (r.price + r.taxesAndFees + (r.additionalCharges || 0)) * r.quantity, 0) : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* ── Top nav bar ── */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <button onClick={() => navigate('/hotels')} className="shrink-0 text-gray-500 hover:text-[#003580] transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <span className="text-base font-bold text-gray-900 block leading-tight">
              {searchParams.location || 'Mumbai'}
            </span>
            <span className="hidden text-xs text-gray-500 sm:block mt-0.5 font-medium">
              {ci && co ? `${formatDateShort(ci)} – ${formatDateShort(co)}` : ''}
              {' · '} {nights} night{nights !== 1 ? 's' : ''}
              {' · '} {searchParams.rooms} room{searchParams.rooms !== 1 ? 's' : ''}
              {' · '} {searchParams.adults} guest{searchParams.adults !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex-1" />

          <div className="relative hidden sm:block">
            <SortDropdown />
          </div>

          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 sm:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto flex max-w-7xl gap-8 px-4 sm:px-6 mt-6">
        {/* ── Left sidebar ── */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 bg-white border border-gray-200 rounded-xl p-5 shadow-sm h-[calc(100vh-8rem)] overflow-y-auto overflow-x-hidden">
             <HotelFilters maxPrice={MAX_PRICE} neighborhoods={NEIGHBOURHOODS} amenitiesList={AMENITIES_LIST} propertyTypes={PROPERTY_TYPES} propertySearch={propertySearch} setPropertySearch={setPropertySearch} />
          </div>
        </aside>

        {/* ── Results list ── */}
        <main className="flex-1">
          {/* Skeletons */}
          {loading && (
            <div className="space-y-6">
              {statusMessage && (
                <div className="mb-4 flex items-center justify-center gap-2 text-sm font-bold text-[#003580] bg-blue-50 py-3 rounded-xl border border-blue-100">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {statusMessage}
                </div>
              )}
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col md:flex-row h-auto md:h-56 animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white">
                  <div className="w-full md:w-72 shrink-0 bg-gray-200" />
                  <div className="flex-1 p-5 space-y-4">
                    <div className="h-5 w-48 rounded bg-gray-200" />
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="flex gap-2 pt-4">
                      <div className="h-8 w-20 rounded-md bg-gray-100" />
                      <div className="h-8 w-20 rounded-md bg-gray-100" />
                    </div>
                  </div>
                  <div className="w-full md:w-56 shrink-0 border-l border-gray-100 p-5 flex flex-col items-end space-y-3">
                    <div className="h-8 w-12 rounded bg-gray-200" />
                    <div className="h-10 w-32 rounded bg-gray-200 mt-auto" />
                    <div className="h-10 w-full rounded bg-gray-300" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-red-200 bg-white shadow-sm px-4">
              <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Search Failed</h3>
              <p className="text-gray-500 mb-6 text-center">{error}</p>
              <Button onClick={() => navigate('/hotels')} variant="outline">Modify search</Button>
            </div>
          )}

          {/* Results */}
          {!loading && !error && (
            filteredHotels.length > 0 ? (
              <>
                <div className="mb-4 flex items-center justify-between text-sm font-semibold text-gray-700">
                  <span>{filteredHotels.length} properties found</span>
                </div>
                {/* Hotel List */}
                <div className="flex flex-col gap-6">
                  {filteredHotels.slice(0, visibleCount).map((hotel) => (
                    <HotelCard 
                      key={hotel.id} 
                      hotel={hotel} 
                      nights={nights} 
                      showTotalPrice={showTotalPrice} 
                      isSelected={selectedHotel?.id === hotel.id}
                    />
                  ))}
                </div>

                {visibleCount < filteredHotels.length && (
                  <div className="mt-8 text-center">
                    <Button
                      variant="outline"
                      onClick={() => setVisibleCount(v => v + 10)}
                      className="bg-white"
                    >
                      Load more properties
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-24 text-center bg-white rounded-xl border border-gray-200 shadow-sm">
                <Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h3 className="mb-2 text-xl font-bold text-gray-900">No hotels found</h3>
                <p className="mb-6 text-sm text-gray-500 max-w-sm mx-auto">We couldn't find any properties matching your exact filters. Try broadening your search.</p>
                <Button onClick={handleClearFilters}>
                  Clear all filters
                </Button>
              </div>
            )
          )}
        </main>
      </div>

      {/* ── Sticky Room Selection Summary Bar ── */}
      {totalRoomsSelected > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white p-4 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md transition-transform translate-y-0">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6">
            <div>
              <div className="flex items-end gap-3 mb-1">
                <div className="text-2xl font-extrabold tabular-nums text-slate-900">{formatCurrency(totalPrice)}</div>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {totalRoomsSelected} room{totalRoomsSelected !== 1 ? 's' : ''} selected · {nights} night{nights !== 1 ? 's' : ''} · incl. taxes
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => navigate('/hotels/guest-details')}
              className="w-full sm:w-auto min-w-[240px] shadow-lg"
            >
              Continue to Guest Details
            </Button>
          </div>
        </div>
      )}

      {/* ── Mobile filter drawer ── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-100 bg-white/95 backdrop-blur px-5 py-4 z-10">
              <h2 className="text-lg font-bold text-gray-900">Filter Results</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-1 rounded-md hover:bg-gray-100">
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="p-5 pb-24">
              <HotelFilters maxPrice={MAX_PRICE} neighborhoods={NEIGHBOURHOODS} amenitiesList={AMENITIES_LIST} propertyTypes={PROPERTY_TYPES} propertySearch={propertySearch} setPropertySearch={setPropertySearch} />
            </div>
            <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4">
              <Button
                fullWidth
                onClick={() => setShowMobileFilters(false)}
              >
                Show {filteredHotels.length} hotels
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
