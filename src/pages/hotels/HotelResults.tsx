import { useCurrency } from '../../context/currencyContext';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HotelFilters from '../../components/hotels/HotelFilters';
import SortDropdown from '../../components/hotels/SortDropdown';
import {
  MapPin, X, Star, Search,
  Wifi, Dumbbell, UtensilsCrossed, Car, Waves,
  Coffee, Loader2, AlertTriangle, Shield, CheckCircle, Building2
} from 'lucide-react';
import { getAmenityIcon } from '../../components/hotels/amenityIcons';
import { useHotelStore } from '../../stores/hotelStore';
import { useHotelSearch } from '../../hooks/useHotelApi';
import { calculateNights } from '../../lib/utils';
import { getHotelTotalPayable, getRoomOnlinePayable } from '../../lib/hotelPricing';
import Button from '../../components/ui/Button';
import HotelSearchBar from '../../components/hotels/HotelSearchBar';
import { useSearchParams as useRouterSearchParams } from 'react-router-dom';

// ── Musafir colour tokens ─────────────────────────────────────────────────
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
        <Star key={i} className={`h-3.5 w-3.5 ${i < count ? 'fill-[#FFC107] text-[#FFC107]' : 'fill-gray-200 text-gray-200'}`} />
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
      style={{
        background: "#fff",
        borderRadius: 16,
        border: `1px solid ${hovered || isSelected ? "rgba(0,71,127,0.28)" : S.border}`,
        overflow: "hidden",
        transition: "all .2s",
        boxShadow: isSelected ? "0 4px 12px rgba(0,71,127,0.15)" : "none",
      }}
      className="flex flex-col md:flex-row"
    >
      <div className="flex flex-col md:flex-row flex-1 min-w-0">
        {/* Image Gallery area */}
        <div style={{ position: "relative" }} className="w-full md:w-64 h-48 shrink-0 bg-slate-100 overflow-hidden flex items-center justify-center">
          {hotel.images && hotel.images[0] ? (
            <img
              src={hotel.images[0]}
              alt={hotel.name}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center opacity-40 text-[#00305f]">
              <Building2 className="w-12 h-12 mb-2" />
              <span className="text-xs font-bold font-['Sora',sans-serif]">No Image Available</span>
            </div>
          )}
          {hotel.freeCancellation && (
            <span style={{ position: "absolute", top: 12, left: 12, background: "rgba(16,185,129,0.95)", backdropFilter: "blur(4px)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 8px", borderRadius: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <Shield className="w-3 h-3" /> Free cancellation
            </span>
          )}
        </div>

        {/* Middle: Info */}
        <div style={{ flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", minWidth: 0 }}>
          <div>
            <div style={{ marginBottom: 8 }}>
              <StarRow count={hotel.starRating} />
            </div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 18, color: S.navyDeep, lineHeight: 1.2, marginBottom: 4 }}>
              {hotel.name}
            </div>
            <p style={{ fontSize: 12, color: S.navyMid, display: "flex", alignItems: "center", gap: 4, fontWeight: 500 }}>
              <MapPin className="h-3.5 w-3.5" />
              <span style={{ textDecoration: "underline", textDecorationStyle: "dotted", cursor: "pointer" }}>{hotel.location}</span>
            </p>
          </div>

          <div style={{ marginTop: 16, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            {hotel.amenities.slice(0, 5).map((a: string, i: number) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: S.navyDeep, background: S.surface, border: `1px solid ${S.border}`, padding: "4px 8px", borderRadius: 6, fontWeight: 500 }}>
                {getAmenityIcon(a, 'sm')}
                {a}
              </span>
            ))}
            {hotel.amenities.length > 5 && (
              <span style={{ fontSize: 11, color: S.muted, fontWeight: 600 }}>+{hotel.amenities.length - 5} more</span>
            )}
          </div>
        </div>

        {/* Right: Price & CTA */}
        <div style={{ flexShrink: 0, borderTop: `1px solid ${S.border}`, padding: "16px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between", background: S.surface }} className="w-full md:w-56 md:border-t-0 md:border-l">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
            {/* Ratings strictly from API */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: S.navyDeep, color: "#fff", fontWeight: 800, fontSize: 14, padding: "4px 8px", borderRadius: "8px 8px 8px 0", display: "flex", alignItems: "center", fontFamily: "'Sora',sans-serif" }}>
                {displayRating.toFixed(1)}
              </div>
              {hasRealReviews && (
                <div style={{ fontSize: 11 }}>
                  <div style={{ fontWeight: 800, color: S.navyDeep }}>Good</div>
                  <div style={{ color: S.muted, fontWeight: 500 }}>{hotel.reviewCount} reviews</div>
                </div>
              )}
            </div>
          </div>

          <div style={{ textAlign: "right", marginTop: "auto" }}>
            <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, fontWeight: 500 }}>{nights} night{nights > 1 ? 's' : ''}, {useHotelStore.getState().searchParams.rooms || 1} room{(useHotelStore.getState().searchParams.rooms || 1) > 1 ? 's' : ''}</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, color: S.navyDeep, lineHeight: 1 }}>
              {convert(totalPayable)}
            </div>
            <div style={{ fontSize: 10, color: S.muted, marginTop: 4, fontWeight: 500 }}>
              incl. taxes & fees
            </div>
            
            <button
              onClick={() => setSelectedHotel(hotel)}
              style={{
                marginTop: 16, width: "100%", borderRadius: 12, padding: "12px 16px", fontSize: 13, fontWeight: 800, fontFamily: "'Sora',sans-serif",
                transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: isSelected ? S.green : S.accent,
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
              onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = S.accentDk; }}
              onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = S.accent; }}
            >
              {isSelected ? (
                <>
                  <CheckCircle className="w-4 h-4" /> Selected
                </>
              ) : 'Select →'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Sticky Bottom Bar for Selected Hotel */}
      {isSelected && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] flex justify-center animate-in slide-in-from-bottom-full duration-300">
          <div className="max-w-6xl w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden shrink-0 hidden sm:flex">
                {hotel.images && hotel.images[0] ? (
                  <img src={hotel.images[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-6 h-6 text-gray-400 opacity-50" />
                )}
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Selected Hotel</div>
                <div className="font-bold text-gray-900 truncate max-w-xs sm:max-w-md">{hotel.name}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="text-right hidden sm:block">
                <div className="text-sm text-gray-500 font-medium">{nights} night{nights > 1 ? 's' : ''}</div>
                <div className="font-extrabold text-xl text-[#00477f] leading-none">
                  {convert(getHotelTotalPayable(hotel))}
                </div>
              </div>
              <button
                onClick={() => navigate(`/hotels/${hotel.id}/rooms`)}
                className="flex-1 sm:flex-none bg-[#00477f] hover:bg-[#002766] text-white px-8 py-3 rounded-xl font-bold text-base transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
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
  // TBO returns occupancy-specific pricing — rooms=1 gives a different rate than
  // rooms=2. The search must re-run whenever the room/guest count changes so the
  // displayed per-room price matches what the supplier is actually quoting.
  const searchKey = `${searchParams.rooms}-${searchParams.adults}-${searchParams.children}-${searchParams.locationId || searchParams.location}-${searchParams.checkIn instanceof Date ? searchParams.checkIn.toISOString().split('T')[0] : searchParams.checkIn}-${searchParams.checkOut instanceof Date ? searchParams.checkOut.toISOString().split('T')[0] : searchParams.checkOut}`;
  const lastSearchKeyRef = useRef('');

  useEffect(() => {
    if (isDefault) {
      resetBooking();
    }

    let finalLocation = searchParams.locationId || searchParams.location;
    let finalCheckIn = ci;
    let finalCheckOut = co;

    // Default dates if empty OR if navigated from header
    if (!finalCheckIn || !finalCheckOut || isDefault) {
      finalCheckIn = new Date();
      finalCheckIn.setDate(finalCheckIn.getDate() + 1);
      finalCheckOut = new Date();
      finalCheckOut.setDate(finalCheckOut.getDate() + 2);
      setSearchParams({ checkIn: finalCheckIn, checkOut: finalCheckOut });
    }

    if (searchParams.children > 0 && searchParams.childrenAges.length !== searchParams.children) {
      setSearchParams({ childrenAges: Array(searchParams.children).fill(5) });
    }

    if (!finalLocation) return;

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
// ── Hotel Card ─────────────────────────────────────────────


  // Sticky bottom summary bar for multiple room selections
  const totalRoomsSelected = selectedRooms.length ? selectedRooms.reduce((sum, r) => sum + r.quantity, 0) : 0;
  const totalPrice = selectedRooms.length
    ? selectedRooms.reduce((sum, r) => sum + getRoomOnlinePayable(r, r.quantity), 0)
    : 0;

  return (
    <div style={{ minHeight: "100vh", background: S.surface, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* ── Top Search Bar ── */}
      <div 
        className="sticky top-[52px] md:top-[88px] z-40 border-b border-gray-200 backdrop-blur-sm shadow-sm"
        style={{ boxShadow: "0 8px 28px rgba(15,23,42,0.08)" }}
      >
        <div className="mx-auto max-w-7xl ">
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
      </div>
      
      {/* ── Body ── */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "20px 24px", display: "flex", gap: 20 }}>
        {/* ── Left sidebar ── */}
        <aside style={{ width: 260, flexShrink: 0 }} className="hidden lg:block">
          <div className="sticky top-[240px]">
             <HotelFilters maxPrice={MAX_PRICE} neighborhoods={NEIGHBOURHOODS} amenitiesList={AMENITIES_LIST} propertyTypes={PROPERTY_TYPES} propertySearch={propertySearch} setPropertySearch={setPropertySearch} />
          </div>
        </aside>

        {/* ── Results list ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Skeletons */}
          {(loading || (!hasSearched && !error)) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {statusMessage && (
                <div className="mb-4 flex items-center justify-center gap-2 text-sm font-bold text-[#00477f] bg-blue-50 py-3 rounded-xl border border-blue-100">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {statusMessage}
                </div>
              )}
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{
                  background: "#fff", borderRadius: 16, border: `1px solid ${S.border}`,
                  height: 140, display: "flex", overflow: "hidden"
                }}>
                  <div style={{ width: 140, height: "100%", background: S.surface, animation: "pulse 1.5s infinite" }} />
                  <div style={{ flex: 1, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ width: "40%", height: 16, background: S.surface, borderRadius: 4, animation: "pulse 1.5s infinite" }} />
                    <div style={{ width: "20%", height: 12, background: S.surface, borderRadius: 4, animation: "pulse 1.5s infinite" }} />
                  </div>
                  <div style={{ width: 180, borderLeft: `1px solid ${S.border}`, padding: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                     <div style={{ width: 60, height: 14, background: S.surface, borderRadius: 4, animation: "pulse 1.5s infinite" }} />
                     <div style={{ width: "100%", height: 24, background: S.surface, borderRadius: 4, animation: "pulse 1.5s infinite", marginTop: "auto" }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }`}</style>

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-red-200 bg-white shadow-sm px-4">
              <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Search Failed</h3>
              <p className="text-gray-500 mb-6 text-center">{error}</p>
            </div>
          )}

          {/* Results */}
          {!loading && !error && hasSearched && (
            filteredHotels.length > 0 ? (
              <>
                <div className="mb-4 flex items-center justify-between text-sm font-semibold text-gray-700">
                  <span>{filteredHotels.length} properties found</span>
                  <SortDropdown />
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
        </div>
      </div>

      {/* ── Sticky Room Selection Summary Bar ── */}
      {totalRoomsSelected > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white p-4 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md transition-transform translate-y-0">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6">
            <div>
              <div className="flex items-end gap-3 mb-1">
                <div className="text-2xl font-extrabold tabular-nums text-slate-900">{convert(totalPrice)}</div>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                {totalRoomsSelected} room{totalRoomsSelected !== 1 ? 's' : ''} selected · {nights} night{nights !== 1 ? 's' : ''}
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



