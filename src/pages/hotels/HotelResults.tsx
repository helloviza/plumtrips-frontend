import { useCurrency } from '../../context/currencyContext';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HotelFilters from '../../components/hotels/HotelFilters';
import SortDropdown from '../../components/hotels/SortDropdown';
import {
  MapPin, X, Star, Search,
  Wifi, Dumbbell, UtensilsCrossed, Car, Waves,
  Coffee, Loader2, AlertTriangle, Shield, CheckCircle, Building2,
  List, ArrowRight
} from 'lucide-react';
import { getAmenityIcon } from '../../components/hotels/amenityIcons';
import { useHotelStore } from '../../stores/hotelStore';
import { useHotelSearch } from '../../hooks/useHotelApi';
import { calculateNights } from '../../lib/utils';
import { getHotelTotalPayable, getRoomOnlinePayable } from '../../lib/hotelPricing';
import Button from '../../components/ui/Button';
import HotelSearchBar from '../../components/hotels/HotelSearchBar';
import { useSearchParams as useRouterSearchParams } from 'react-router-dom';

// ── Musafir colour tokens (kept for any values still referenced below) ────
const S = {
  navy:      "#00305f",
  navyDeep:  "#0d2d5e",
  navyMid:   "#00477f",
  accent:    "#d06549",
  accentDk:  "#b8543a",
  accentLt:  "#f9c08a",
  muted:     "#8fafd4",
  mutedLt:   "#b0bfd4",
  border:    "#e2ecf7",
  borderMid: "#c9d5e8",
  surface:   "#f5f8fc",
  ink:       "#0d1f3c",
  green:     "#0d7a52",
  greenBg:   "#e8f8f1",
};

// ── Shared UI ─────────────────────────────────────────────────────────────

function StarRow({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} className={i < count ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'} />
      ))}
    </span>
  );
}

function HotelCard({ hotel, nights, showTotalPrice, isSelected }: { hotel: any; nights: number; showTotalPrice: boolean; isSelected?: boolean; }) {
  const { convert } = useCurrency();
  const navigate = useNavigate();
  const { setSelectedHotel } = useHotelStore();
  const totalPayable = showTotalPrice
    ? getHotelTotalPayable(hotel)
    : Math.ceil(getHotelTotalPayable(hotel) / nights);

  // Strict API mapping for ratings.
  // If no text reviews from API, just show star rating as the metric
  const hasRealReviews = hotel.reviewCount > 0;
  const displayRating = hasRealReviews ? hotel.rating : hotel.starRating;

  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-2xl border overflow-hidden flex flex-col md:flex-row transition-all"
      style={{
        borderColor: hovered || isSelected ? '#93c5fd' : '#e2e8f0',
        boxShadow: isSelected ? '0 8px 24px rgba(37,99,235,0.14)' : hovered ? '0 12px 32px rgba(40,60,120,0.10)' : '0 2px 12px rgba(40,60,120,0.06)',
      }}
    >
      <div className="flex flex-col md:flex-row flex-1 min-w-0">
        {/* Image area */}
        <div className="relative w-full md:w-60 h-48 md:h-auto shrink-0 bg-slate-100 overflow-hidden flex items-center justify-center">
          {hotel.images && hotel.images[0] ? (
            <img
              src={hotel.images[0]}
              alt={hotel.name}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center opacity-40 text-slate-500">
              <Building2 className="w-10 h-10 mb-2" />
              <span className="text-xs font-bold">No Image Available</span>
            </div>
          )}
          {hotel.freeCancellation && (
            <span className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-lg text-[10px] font-bold text-white px-2 py-1 shadow-sm" style={{ background: 'rgba(16,163,74,0.95)' }}>
              <Shield size={11} /> Free cancellation
            </span>
          )}
        </div>

        {/* Center: Details */}
        <div className="flex-1 flex flex-col px-5 py-4 min-w-0 border-r-0 md:border-r border-slate-100">
          <div className="mb-2">
            <StarRow count={hotel.starRating} />
          </div>
          <h3 className="text-[16px] font-bold text-slate-900 leading-tight mb-1.5">
            {hotel.name}
          </h3>
          <p className="flex items-center gap-1 text-[12px] text-slate-500 mb-3">
            <MapPin size={12} className="text-slate-400 shrink-0" />
            <span className="underline decoration-dotted decoration-slate-300 cursor-pointer">{hotel.location}</span>
          </p>

          <div className="flex flex-wrap items-center gap-1.5 mt-auto">
            {hotel.amenities.slice(0, 5).map((a: string, i: number) => (
              <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                {getAmenityIcon(a, 'sm')}
                {a}
              </span>
            ))}
            {hotel.amenities.length > 5 && (
              <span className="text-[11px] font-semibold text-slate-400">+{hotel.amenities.length - 5} more</span>
            )}
          </div>
        </div>

        {/* Right: Price & CTA */}
        <div className="shrink-0 w-full md:w-56 flex flex-col justify-between px-5 py-4 bg-slate-50 border-t md:border-t-0 border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[13px] font-bold text-white" style={{ background: '#16a34a' }}>
                <Star size={9} className="fill-white" />
                {displayRating.toFixed(1)}
              </div>
              {hasRealReviews && (
                <div className="text-[11px]">
                  <div className="font-bold text-slate-800 leading-tight">Good</div>
                  <div className="text-slate-400 font-medium leading-tight">{hotel.reviewCount} reviews</div>
                </div>
              )}
            </div>
          </div>

          <div className="text-right mt-auto">
            <div className="text-[11px] text-slate-400 font-medium mb-1">
              {nights} night{nights > 1 ? 's' : ''}, {useHotelStore.getState().searchParams.rooms || 1} room{(useHotelStore.getState().searchParams.rooms || 1) > 1 ? 's' : ''}
            </div>
            <div className="text-[24px] font-extrabold text-slate-900 leading-none">
              {convert(totalPayable)}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-1">
              incl. taxes &amp; fees
            </div>

            <button
              onClick={() => setSelectedHotel(hotel)}
              className="mt-4 w-full rounded-xl px-4 py-2.5 text-[13px] font-bold flex items-center justify-center gap-1.5 text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: isSelected ? '#16a34a' : 'linear-gradient(135deg,#f97316,#ea580c)',
                boxShadow: isSelected ? 'none' : '0 2px 8px rgba(249,115,22,0.35)',
              }}
            >
              {isSelected ? (
                <>
                  <CheckCircle size={15} /> Selected
                </>
              ) : (
                <>
                  Select <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar for Selected Hotel */}
      {isSelected && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 p-4 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] flex justify-center">
          <div className="max-w-6xl w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 hidden sm:flex">
                {hotel.images && hotel.images[0] ? (
                  <img src={hotel.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-6 h-6 text-slate-400 opacity-50" />
                )}
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium">Selected Hotel</div>
                <div className="font-bold text-slate-900 truncate max-w-xs sm:max-w-md">{hotel.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="text-right hidden sm:block">
                <div className="text-sm text-slate-500 font-medium">{nights} night{nights > 1 ? 's' : ''}</div>
                <div className="font-extrabold text-xl text-slate-900 leading-none">
                  {convert(getHotelTotalPayable(hotel))}
                </div>
              </div>
              <button
                onClick={() => navigate(`/hotels/${hotel.id}/rooms`)}
                className="flex-1 sm:flex-none text-white px-8 py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 whitespace-nowrap hover:opacity-90 active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 2px 8px rgba(249,115,22,0.35)' }}
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
  const { convert } = useCurrency();
  const navigate = useNavigate();
  const [urlParams] = useRouterSearchParams();
  const isDefault = urlParams.get('default') === 'true';

  const { searchParams, filters, resetFilters, sortBy, sortDirection, setSearchResultsMap, selectedHotel, selectedRooms, setSearchParams, resetBooking } = useHotelStore();
  const { hotels: apiHotels, rawResults, loading, hasSearched, error, statusMessage, search } = useHotelSearch();

  // Local state
  const [propertySearch, setPropertySearch] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const showTotalPrice = true;

  const nights = calculateNights(searchParams.checkIn, searchParams.checkOut) || 1;
  const ci = searchParams.checkIn ? (searchParams.checkIn instanceof Date ? searchParams.checkIn : new Date(searchParams.checkIn)) : null;
  const co = searchParams.checkOut ? (searchParams.checkOut instanceof Date ? searchParams.checkOut : new Date(searchParams.checkOut)) : null;

  // ── Hydrate store from URL params if store has no dates (e.g. direct link / refresh) ──
  useEffect(() => {
    const urlCheckIn  = urlParams.get('checkIn');
    const urlCheckOut = urlParams.get('checkOut');
    const urlLocation = urlParams.get('location');
    const urlLocationId = urlParams.get('locationId');
    const urlAdults   = urlParams.get('adults');
    const urlChildren = urlParams.get('children');
    const urlRooms    = urlParams.get('rooms');

    const updates: Partial<typeof searchParams> = {};

    if (urlCheckIn  && !searchParams.checkIn)  updates.checkIn  = new Date(urlCheckIn);
    if (urlCheckOut && !searchParams.checkOut) updates.checkOut = new Date(urlCheckOut);
    if (urlLocation && !searchParams.location) updates.location = urlLocation;
    if (urlLocationId && !searchParams.locationId) updates.locationId = urlLocationId;
    if (urlAdults  && !searchParams.adults)  updates.adults  = parseInt(urlAdults,  10);
    if (urlChildren && searchParams.children === 0 && urlChildren !== '0') updates.children = parseInt(urlChildren, 10);
    if (urlRooms   && searchParams.rooms === 1 && urlRooms   !== '1') updates.rooms   = parseInt(urlRooms,   10);

    if (Object.keys(updates).length > 0) setSearchParams(updates);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Trigger API search on mount and when occupancy changes ──────────────
  const searchKey = `${searchParams.rooms}-${searchParams.adults}-${searchParams.children}-${searchParams.locationId || searchParams.location}-${searchParams.checkIn instanceof Date ? searchParams.checkIn.toISOString().split('T')[0] : searchParams.checkIn}-${searchParams.checkOut instanceof Date ? searchParams.checkOut.toISOString().split('T')[0] : searchParams.checkOut}`;
  const lastSearchKeyRef = useRef('');

  useEffect(() => {
    if (isDefault) {
      resetBooking();
    }

    let finalLocation = searchParams.locationId || searchParams.location;
    let finalCheckIn = ci;
    let finalCheckOut = co;

    // Default dates if BOTH are empty OR if navigated from header
    if ((!finalCheckIn && !finalCheckOut) || isDefault) {
      finalCheckIn = new Date();
      finalCheckIn.setDate(finalCheckIn.getDate() + 1);
      finalCheckOut = new Date();
      finalCheckOut.setDate(finalCheckOut.getDate() + 2);
      setSearchParams({ checkIn: finalCheckIn, checkOut: finalCheckOut });
    }

    if (searchParams.children > 0 && searchParams.childrenAges.length !== searchParams.children) {
      setSearchParams({ childrenAges: Array(searchParams.children).fill(5) });
    }

    if (!finalLocation || !finalCheckIn || !finalCheckOut) return;

    // Skip if nothing meaningful changed (avoids double-firing on mount)
    const currentKey = `${searchParams.rooms}-${searchParams.adults}-${searchParams.children}-${finalLocation}-${finalCheckIn.toISOString().split('T')[0]}-${finalCheckOut.toISOString().split('T')[0]}`;
    if (lastSearchKeyRef.current === currentKey) return;
    lastSearchKeyRef.current = currentKey;

    search({
      cityCode: finalLocation,
      checkIn: finalCheckIn.toISOString().split('T')[0],
      checkOut: finalCheckOut.toISOString().split('T')[0],
      rooms: searchParams.rooms,
      adults: searchParams.adults,
      children: searchParams.children || undefined,
      childrenAges: searchParams.children > 0 ? (searchParams.childrenAges.length === searchParams.children ? searchParams.childrenAges : Array(searchParams.children).fill(5)) : undefined,
      nationality: searchParams.nationality || 'IN',
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchKey]);

  useEffect(() => {
    if (rawResults.length > 0) {
      const map: Record<string, any> = {};
      for (const r of rawResults) {
        if (r.HotelCode) map[r.HotelCode] = r;
        if (r.BookingCode) map[r.BookingCode] = r;
      }
      setSearchResultsMap(map);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawResults]);

  // ── Dynamic derived data from actual API results ─────────────────────────
  const MAX_PRICE = useMemo(() => {
    let max = 0;
    apiHotels.forEach(h => {
      const total = getHotelTotalPayable(h);
      if (total > max) max = total;
    });
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
      r = r.filter(h => {
        const total = getHotelTotalPayable(h);
        return total >= filters.priceRange[0] && total <= effectiveMax;
      });
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
      case 'cheapest': r.sort((a, b) => (getHotelTotalPayable(a) - getHotelTotalPayable(b)) * dir); break;
      case 'rating': r.sort((a, b) => (a.starRating - b.starRating) * dir); break;
      case 'reviews': r.sort((a, b) => (a.starRating - b.starRating) * dir); break;
      case 'distance': r.sort((a, b) => (parseFloat(a.distance) - parseFloat(b.distance)) * dir); break;
      // case 'relevance': break;
    }
    return r;
  }, [apiHotels, filters, sortBy, sortDirection, propertySearch]);

  const handleClearFilters = () => {
    resetFilters();
    setPropertySearch('');
  };

  // Sticky bottom summary bar for multiple room selections
  const totalRoomsSelected = selectedRooms.length ? selectedRooms.reduce((sum, r) => sum + r.quantity, 0) : 0;
  const totalPrice = selectedRooms.length
    ? selectedRooms.reduce((sum, r) => sum + getRoomOnlinePayable(r, r.quantity), 0)
    : 0;

  return (
    <div
      className="min-h-screen font-sans text-slate-900"
      style={{
        background: `radial-gradient(circle at 50% -20%, rgba(82,145,255,.15), transparent 38%), radial-gradient(circle at 0% 20%, rgba(255,132,132,.06), transparent 30%), radial-gradient(circle at 100% 30%, rgba(88,170,255,.08), transparent 35%), linear-gradient(180deg, #FAFCFF 0%, #F6F9FD 40%, #EEF3FA 100%)`,
      }}
    >
      {/* ── Top Search Bar ── */}
      <div
        className="sticky top-[52px] md:top-[88px] z-40"
        style={{
          background: 'rgba(250,252,255,0.88)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderBottom: '1px solid rgba(226,232,240,0.6)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 py-3">
          {/* Desktop Search Bar */}
          <div className="hidden md:block">
            <HotelSearchBar
              onSearch={() => {
                 const checkIn = searchParams.checkIn ? (searchParams.checkIn instanceof Date ? searchParams.checkIn : new Date(searchParams.checkIn)) : null;
                 const checkOut = searchParams.checkOut ? (searchParams.checkOut instanceof Date ? searchParams.checkOut : new Date(searchParams.checkOut)) : null;

                 search({
                   cityCode: searchParams.locationId ?? searchParams.location,
                   checkIn: checkIn ? checkIn.toISOString().split('T')[0] : '',
                   checkOut: checkOut ? checkOut.toISOString().split('T')[0] : '',
                   rooms: searchParams.rooms,
                   adults: searchParams.adults,
                   children: searchParams.children || undefined,
                   childrenAges: searchParams.children > 0 ? (searchParams.childrenAges.length === searchParams.children ? searchParams.childrenAges : Array(searchParams.children).fill(5)) : undefined,
                   nationality: searchParams.nationality || 'IN',
                 });
              }}
            />
          </div>

          {/* Mobile Search Summary */}
          <div className="md:hidden flex items-center justify-between rounded-xl bg-white border border-slate-200 px-3 py-2.5" style={{ boxShadow: '0 1px 6px rgba(40,60,120,0.07)' }}>
            <div className="flex flex-col min-w-0 flex-1 mr-4">
               <span className="font-bold text-[13px] text-slate-900 truncate leading-tight mb-0.5">{searchParams.location || 'Anywhere'}</span>
               <span className="text-[11px] text-slate-500 font-medium truncate">
                 {searchParams.checkIn ? new Date(searchParams.checkIn).toLocaleDateString('en-GB', {day:'numeric', month:'short'}) : 'Any date'} - {searchParams.checkOut ? new Date(searchParams.checkOut).toLocaleDateString('en-GB', {day:'numeric', month:'short'}) : 'Any date'} • {searchParams.adults} Adult{searchParams.adults > 1 ? 's' : ''}
               </span>
            </div>
            <button
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="text-[11px] font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 uppercase tracking-wide shrink-0 transition-colors hover:bg-orange-100"
            >
              {showMobileSearch ? 'Close' : 'Modify'}
            </button>
          </div>

          {/* Mobile Expanded Search Bar */}
          {showMobileSearch && (
            <div className="md:hidden mt-2 bg-white rounded-xl p-3 max-h-[75vh] overflow-y-auto border border-slate-200" style={{ boxShadow: '0 1px 6px rgba(40,60,120,0.07)' }}>
               <HotelSearchBar
                 variant="results"
                 onSearch={() => {
                   setShowMobileSearch(false);
                   const checkIn = searchParams.checkIn ? (searchParams.checkIn instanceof Date ? searchParams.checkIn : new Date(searchParams.checkIn)) : null;
                   const checkOut = searchParams.checkOut ? (searchParams.checkOut instanceof Date ? searchParams.checkOut : new Date(searchParams.checkOut)) : null;

                   search({
                     cityCode: searchParams.locationId ?? searchParams.location,
                     checkIn: checkIn ? checkIn.toISOString().split('T')[0] : '',
                     checkOut: checkOut ? checkOut.toISOString().split('T')[0] : '',
                     rooms: searchParams.rooms,
                     adults: searchParams.adults,
                     children: searchParams.children || undefined,
                     childrenAges: searchParams.children > 0 ? (searchParams.childrenAges.length === searchParams.children ? searchParams.childrenAges : Array(searchParams.children).fill(5)) : undefined,
                     nationality: searchParams.nationality || 'IN',
                   });
                 }}
               />
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col lg:flex-row max-w-[1440px] mx-auto px-4 md:px-6 py-5 gap-5">
        {/* ── Left sidebar ── */}
        <aside style={{ width: 260, flexShrink: 0 }} className="hidden lg:block">
          <div className="sticky top-[240px]">
             <HotelFilters maxPrice={MAX_PRICE} neighborhoods={NEIGHBOURHOODS} amenitiesList={AMENITIES_LIST} propertyTypes={PROPERTY_TYPES} propertySearch={propertySearch} setPropertySearch={setPropertySearch} />
          </div>
        </aside>

        {/* ── Results list ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          {/* Skeletons */}
          {(loading || (!hasSearched && !error)) && (
            <div className="flex flex-col gap-3">
              {statusMessage && (
                <div className="mb-2 flex items-center justify-center gap-2 text-sm font-bold text-blue-700 bg-blue-50 py-3 rounded-xl border border-blue-100">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {statusMessage}
                </div>
              )}
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex" style={{ height: 140 }}>
                  <div style={{ width: 140, height: "100%" }} className="bg-slate-100 animate-pulse" />
                  <div className="flex-1 px-6 py-5 flex flex-col gap-3">
                    <div className="h-4 w-2/5 bg-slate-100 rounded animate-pulse" />
                    <div className="h-3 w-1/5 bg-slate-100 rounded animate-pulse" />
                  </div>
                  <div style={{ width: 180 }} className="border-l border-slate-100 p-5 flex flex-col gap-2">
                     <div className="h-3.5 w-14 bg-slate-100 rounded animate-pulse" />
                     <div className="h-6 w-full bg-slate-100 rounded animate-pulse mt-auto" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-red-200 bg-white shadow-sm px-4">
              <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Search Failed</h3>
              <p className="text-slate-500 mb-6 text-center">{error}</p>
            </div>
          )}

          {/* Results */}
          {!loading && !error && hasSearched && (
            filteredHotels.length > 0 ? (
              <>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{filteredHotels.length} properties found</span>
                  <SortDropdown />
                </div>
                {/* Hotel List */}
                <div className="flex flex-col gap-4">
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
                  <div className="mt-6 text-center">
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
              <div className="py-24 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Search className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                <h3 className="mb-2 text-xl font-bold text-slate-900">No hotels found</h3>
                <p className="mb-6 text-sm text-slate-500 max-w-sm mx-auto">We couldn't find any properties matching your exact filters. Try broadening your search.</p>
                <Button onClick={handleClearFilters}>
                  Clear all filters
                </Button>
              </div>
            )
          )}
        </div>
      </div>

      {/* ── Sticky Room Selection Summary Bar ── */}
      {totalRoomsSelected > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white p-4 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6">
            <div>
              <div className="flex items-end gap-3 mb-1">
                <div className="text-2xl font-extrabold tabular-nums text-slate-900">{convert(totalPrice)}</div>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {totalRoomsSelected} room{totalRoomsSelected !== 1 ? 's' : ''} selected · {nights} night{nights !== 1 ? 's' : ''}
              </div>
            </div>
            <button
              onClick={() => navigate('/hotels/guest-details')}
              className="w-full sm:w-auto min-w-[240px] text-white px-8 py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 4px 14px rgba(249,115,22,0.35)' }}
            >
              Continue to Guest Details
            </button>
          </div>
        </div>
      )}

      {/* ── Mobile filter drawer ── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 h-[85vh] overflow-y-auto rounded-t-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white/95 backdrop-blur px-5 py-4 z-10">
              <h2 className="text-lg font-bold text-slate-900">Filter Results</h2>
              <button onClick={() => setShowMobileFilters(false)} className="p-1 rounded-md hover:bg-slate-100">
                <X className="h-6 w-6 text-slate-500" />
              </button>
            </div>
            <div className="p-5 pb-24">
              <HotelFilters maxPrice={MAX_PRICE} neighborhoods={NEIGHBOURHOODS} amenitiesList={AMENITIES_LIST} propertyTypes={PROPERTY_TYPES} propertySearch={propertySearch} setPropertySearch={setPropertySearch} />
            </div>
            <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white p-4">
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