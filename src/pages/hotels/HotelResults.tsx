import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, MapPin, X, Star, Search,
  Wifi, Dumbbell, UtensilsCrossed, Car, Waves,
  Coffee, Heart, ChevronDown, SlidersHorizontal, Loader2, AlertTriangle
} from 'lucide-react';
import { useHotelStore } from '../../stores/hotelStore';
import { useHotelSearch } from '../../hooks/useHotelApi';
import { calculateNights, formatDateShort, getDayOfWeek } from '../../lib/utils';

// ── Musafir colour tokens ─────────────────────────────────────────────────
const BLUE = '#003580';
const YELLOW = '#FFC107';        // "See rooms" button

// ── Sidebar filter data ───────────────────────────────────────────────────
const NEIGHBOURHOODS = [
  'Colaba', 'Bandra', 'Andheri', 'Juhu', 'BKC',
  'Powai', 'Dadar', 'Worli', 'Nariman Point', 'Parel',
];

const AMENITIES_LIST = [
  'Airport shuttle', 'Bar', 'Breakfast', 'Business center',
  'Free WiFi', 'Gym', 'Parking', 'Pool', 'Restaurant', 'Spa',
];

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Free WiFi': <Wifi className="h-3.5 w-3.5" />,
  'Gym': <Dumbbell className="h-3.5 w-3.5" />,
  'Restaurant': <UtensilsCrossed className="h-3.5 w-3.5" />,
  'Parking': <Car className="h-3.5 w-3.5" />,
  'Pool': <Waves className="h-3.5 w-3.5" />,
  'Breakfast': <Coffee className="h-3.5 w-3.5" />,
};

// ── Helpers ───────────────────────────────────────────────────────────────
function StarRow({ count }: { count: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`h-3.5 w-3.5 ${i < count ? 'fill-[#FFC107] text-[#FFC107]' : 'fill-gray-200 text-gray-200'}`} />
      ))}
    </span>
  );
}

// Dual-handle range slider (pure CSS trick — two overlapping inputs)
function DualRangeSlider({
  min, max, low, high,
  onLowChange, onHighChange,
}: {
  min: number; max: number; low: number; high: number;
  onLowChange: (v: number) => void;
  onHighChange: (v: number) => void;
}) {
  return (
    <div className="relative h-5 w-full">
      <div className="absolute top-1.5 left-0 right-0 h-2 rounded-full bg-gray-200">
        <div
          className="absolute h-2 rounded-full"
          style={{
            backgroundColor: BLUE,
            left: `${((low - min) / (max - min)) * 100}%`,
            right: `${100 - ((high - min) / (max - min)) * 100}%`,
          }}
        />
      </div>
      <input type="range" min={min} max={max} value={low}
        onChange={e => onLowChange(Math.min(parseInt(e.target.value), high - 1))}
        className="absolute w-full h-2 top-1.5 appearance-none bg-transparent cursor-pointer"
        style={{ accentColor: BLUE }}
      />
      <input type="range" min={min} max={max} value={high}
        onChange={e => onHighChange(Math.max(parseInt(e.target.value), low + 1))}
        className="absolute w-full h-2 top-1.5 appearance-none bg-transparent cursor-pointer"
        style={{ accentColor: BLUE }}
      />
    </div>
  );
}

// Star rating range slider (1–5)
function StarRangeSlider({
  low, high, onLowChange, onHighChange,
}: {
  low: number; high: number;
  onLowChange: (v: number) => void;
  onHighChange: (v: number) => void;
}) {
  return (
    <div className="relative h-5 w-full">
      <div className="absolute top-1.5 left-0 right-0 h-2 rounded-full bg-gray-200">
        <div
          className="absolute h-2 rounded-full"
          style={{
            backgroundColor: BLUE,
            left: `${((low - 1) / 4) * 100}%`,
            right: `${100 - ((high - 1) / 4) * 100}%`,
          }}
        />
      </div>
      <input type="range" min={1} max={5} value={low}
        onChange={e => onLowChange(Math.min(parseInt(e.target.value), high))}
        className="absolute w-full h-2 top-1.5 appearance-none bg-transparent cursor-pointer"
        style={{ accentColor: BLUE }}
      />
      <input type="range" min={1} max={5} value={high}
        onChange={e => onHighChange(Math.max(parseInt(e.target.value), low))}
        className="absolute w-full h-2 top-1.5 appearance-none bg-transparent cursor-pointer"
        style={{ accentColor: BLUE }}
      />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function HotelResults() {
  const navigate = useNavigate();
  const { searchParams, filters, setFilters, resetFilters, sortBy, setSortBy, setSearchResultsMap, setSelectedHotel } = useHotelStore();
  const { hotels: apiHotels, rawResults, loading, error, statusMessage, search } = useHotelSearch();

  // Local filter state matching Musafir sidebar
  const [propertySearch, setPropertySearch] = useState('');
  const [showAllNeighbourhoods, setShowAllNeighbourhoods] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(10);
  const [showTotalPrice, setShowTotalPrice] = useState(true);
  const [starLow, setStarLow] = useState(1);
  const [starHigh, setStarHigh] = useState(5);

  const nights = calculateNights(searchParams.checkIn, searchParams.checkOut) || 1;
  const ci = searchParams.checkIn ? (searchParams.checkIn instanceof Date ? searchParams.checkIn : new Date(searchParams.checkIn)) : null;
  const co = searchParams.checkOut ? (searchParams.checkOut instanceof Date ? searchParams.checkOut : new Date(searchParams.checkOut)) : null;

  // ── Trigger real API search on mount ─────────────────────────────────────
  useEffect(() => {
    if (!searchParams.locationId && !searchParams.location) {
      navigate('/hotels');
      return;
    }
    const checkIn = ci ? ci.toISOString().split('T')[0] : '';
    const checkOut = co ? co.toISOString().split('T')[0] : '';
    if (!checkIn || !checkOut) { navigate('/hotels'); return; }

    // Validate children ages
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
      childrenAges: searchParams.children > 0 ? searchParams.childrenAges : undefined,
      nationality: 'IN',
    });
  }, []);

  // Store raw results map for prebook/book steps
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

  // ── Derive neighbourhood list from actual results ─────────────────────────
  const NEIGHBOURHOODS = useMemo(() => {
    const seen = new Set<string>();
    apiHotels.forEach(h => {
      const parts = h.location.split(',');
      if (parts.length > 1) seen.add(parts[0].trim());
    });
    return Array.from(seen).slice(0, 20);
  }, [apiHotels]);

  // ── Derive amenities list from actual results ─────────────────────────────
  const AMENITIES_LIST = useMemo(() => {
    const seen = new Set<string>();
    apiHotels.forEach(h => h.amenities.forEach(a => seen.add(a)));
    const fallback = ['Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Parking', 'Airport Shuttle', 'Bar', 'Breakfast'];
    return seen.size > 0 ? Array.from(seen).slice(0, 15) : fallback;
  }, [apiHotels]);

  // ── Filter logic ─────────────────────────────────────────────────────────
  const filteredHotels = useMemo(() => {
    let r = [...apiHotels];

    // Property name search
    if (propertySearch.trim()) {
      r = r.filter(h => h.name.toLowerCase().includes(propertySearch.toLowerCase()));
    }

    // Price range
    r = r.filter(h => h.price >= filters.priceRange[0] && h.price <= filters.priceRange[1]);

    // Star range
    r = r.filter(h => h.starRating >= starLow && h.starRating <= starHigh);

    // Neighbourhoods
    if (filters.neighborhoods.length) {
      r = r.filter(h => filters.neighborhoods.some(n => h.location.includes(n)));
    }

    // Amenities
    if (filters.amenities.length) {
      r = r.filter(h => filters.amenities.every(a => h.amenities.some(ha => ha.toLowerCase().includes(a.toLowerCase()))));
    }

    // Quick filters
    if (filters.cancellationPolicy === 'free') r = r.filter(h => h.freeCancellation);
    if (filters.payAtHotel) r = r.filter(h => h.payAtHotel);

    // Sort
    switch (sortBy) {
      case 'cheapest': r.sort((a, b) => a.price - b.price); break;
      case 'rating': r.sort((a, b) => b.starRating - a.starRating); break;
      case 'reviews': r.sort((a, b) => b.rating - a.rating); break;
      case 'distance': r.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance)); break;
    }
    return r;
  }, [apiHotels, filters, sortBy, propertySearch, starLow, starHigh]);

  const toggleNeighbourhood = useCallback((n: string) => {
    const cur = filters.neighborhoods;
    setFilters({ neighborhoods: cur.includes(n) ? cur.filter(x => x !== n) : [...cur, n] });
  }, [filters.neighborhoods, setFilters]);

  const toggleAmenity = useCallback((a: string) => {
    const cur = filters.amenities;
    setFilters({ amenities: cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a] });
  }, [filters.amenities, setFilters]);

  const toggleWishlist = (id: string) => {
    setWishlisted(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Count helpers for sidebar (derived from live results)
  const amenityCount = (a: string) =>
    apiHotels.filter(h => h.amenities.some(ha => ha.toLowerCase().includes(a.toLowerCase()))).length;
  const neighbourhoodCount = (n: string) =>
    apiHotels.filter(h => h.location.includes(n)).length;

  const visibleNeighbourhoods = showAllNeighbourhoods ? NEIGHBOURHOODS : NEIGHBOURHOODS.slice(0, 5);
  const visibleAmenities = showAllAmenities ? AMENITIES_LIST : AMENITIES_LIST.slice(0, 5);

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div className="w-full text-sm">
      {/* Showing count */}
      <div className="mb-3 font-semibold text-gray-800">
        Showing {filteredHotels.length} hotels
      </div>

      {/* Map thumbnail */}
      <div
        className="mb-4 flex h-28 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100 hover:opacity-90"
        onClick={() => {}}
      >
        <div className="text-center">
          <div className="mb-1 text-2xl">🗺️</div>
          <span className="text-xs font-semibold text-gray-600">View Map</span>
        </div>
      </div>

      {/* Search by property */}
      <div className="mb-4 flex items-center gap-2 rounded border border-gray-300 bg-white px-2 py-1.5">
        <Search className="h-4 w-4 shrink-0 text-gray-400" />
        <input
          type="text"
          value={propertySearch}
          onChange={e => setPropertySearch(e.target.value)}
          placeholder="Search by property"
          className="flex-1 text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {/* Quick checkboxes */}
      <div className="mb-4 space-y-2">
        <label className="flex cursor-pointer items-center justify-between">
          <div className="flex items-center gap-2">
            <input type="checkbox"
              checked={filters.amenities.includes('Breakfast')}
              onChange={() => toggleAmenity('Breakfast')}
              className="h-4 w-4 rounded border-gray-400"
              style={{ accentColor: BLUE }}
            />
            <span className="text-gray-700">Free breakfast</span>
          </div>
          <span className="text-gray-400">({amenityCount('Breakfast')})</span>
        </label>
        <label className="flex cursor-pointer items-center justify-between">
          <div className="flex items-center gap-2">
            <input type="checkbox"
              checked={filters.cancellationPolicy === 'free'}
              onChange={() => setFilters({ cancellationPolicy: filters.cancellationPolicy === 'free' ? 'all' : 'free' })}
              className="h-4 w-4 rounded border-gray-400"
              style={{ accentColor: BLUE }}
            />
            <span className="text-gray-700">Free cancellation</span>
          </div>
          <span className="text-gray-400">({apiHotels.filter(h => h.freeCancellation).length})</span>
        </label>
        <label className="flex cursor-pointer items-center justify-between">
          <div className="flex items-center gap-2">
            <input type="checkbox"
              checked={filters.payAtHotel}
              onChange={e => setFilters({ payAtHotel: e.target.checked })}
              className="h-4 w-4 rounded border-gray-400"
              style={{ accentColor: BLUE }}
            />
            <span className="text-gray-700">Offers</span>
          </div>
          <span className="text-gray-400">({apiHotels.filter(h => h.originalPrice).length})</span>
        </label>
      </div>

      {/* Price slider */}
      <div className="mb-5">
        <div className="mb-2 font-semibold text-gray-800">Price</div>
        <DualRangeSlider
          min={0} max={50000}
          low={filters.priceRange[0]}
          high={filters.priceRange[1]}
          onLowChange={v => setFilters({ priceRange: [v, filters.priceRange[1]] })}
          onHighChange={v => setFilters({ priceRange: [filters.priceRange[0], v] })}
        />
        <div className="mt-1.5 flex justify-between text-xs text-gray-500">
          <span>Rs {filters.priceRange[0].toLocaleString('en-IN')}</span>
          <span>Rs {filters.priceRange[1].toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Star rating slider */}
      <div className="mb-5">
        <div className="mb-2 font-semibold text-gray-800">Star rating</div>
        <StarRangeSlider
          low={starLow} high={starHigh}
          onLowChange={setStarLow}
          onHighChange={setStarHigh}
        />
        <div className="mt-1.5 flex justify-between">
          <StarRow count={starLow} />
          <StarRow count={starHigh} />
        </div>
      </div>

      {/* Neighbourhoods */}
      <div className="mb-5">
        <div className="mb-2 font-semibold text-gray-800">Neighbourhoods</div>
        <div className="space-y-2">
          {visibleNeighbourhoods.map(n => {
            const count = neighbourhoodCount(n);
            if (count === 0) return null;
            return (
              <label key={n} className="flex cursor-pointer items-center justify-between">
                <div className="flex items-center gap-2">
                  <input type="checkbox"
                    checked={filters.neighborhoods.includes(n)}
                    onChange={() => toggleNeighbourhood(n)}
                    className="h-4 w-4 rounded border-gray-400"
                    style={{ accentColor: BLUE }}
                  />
                  <span className="text-gray-700">{n}</span>
                </div>
                <span className="text-gray-400">({count})</span>
              </label>
            );
          })}
        </div>
        <button
          onClick={() => setShowAllNeighbourhoods(v => !v)}
          className="mt-2 text-xs font-medium hover:underline"
          style={{ color: BLUE }}
        >
          {showAllNeighbourhoods ? 'Show less' : 'Show more'}
        </button>
      </div>

      {/* Amenities */}
      <div className="mb-4">
        <div className="mb-2 font-semibold text-gray-800">Amenities</div>
        <div className="space-y-2">
          {visibleAmenities.map(a => (
            <label key={a} className="flex cursor-pointer items-center justify-between">
              <div className="flex items-center gap-2">
                <input type="checkbox"
                  checked={filters.amenities.includes(a)}
                  onChange={() => toggleAmenity(a)}
                  className="h-4 w-4 rounded border-gray-400"
                  style={{ accentColor: BLUE }}
                />
                <span className="text-gray-700">{a}</span>
              </div>
              <span className="text-gray-400">({amenityCount(a)})</span>
            </label>
          ))}
        </div>
        <button
          onClick={() => setShowAllAmenities(v => !v)}
          className="mt-2 text-xs font-medium hover:underline"
          style={{ color: BLUE }}
        >
          {showAllAmenities ? 'Show less' : 'Show more'}
        </button>
      </div>
    </div>
  );

  // ── Hotel Card (Musafir style) ─────────────────────────────────────────────
  const HotelCard = ({ hotel }: { hotel: (typeof apiHotels)[0] }) => {
    // hotel.price is already TotalFare for full stay; show either total or per-night equivalent
    const price = showTotalPrice ? hotel.price : Math.round(hotel.price / nights);
    const origPrice = hotel.originalPrice ? (showTotalPrice ? hotel.originalPrice : Math.round(hotel.originalPrice / nights)) : null;

    const handleViewHotel = () => {
      setSelectedHotel(hotel);
      navigate(`/hotels/${hotel.id}`);
    };

    return (
      <div className="flex overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative h-auto w-64 shrink-0">
          <img
            src={hotel.images[0]}
            alt={hotel.name}
            loading="lazy"
            className="h-full w-full object-cover"
            style={{ minHeight: '180px' }}
          />
        </div>

        {/* Middle: info */}
        <div className="flex flex-1 flex-col justify-between p-4">
          {/* Stars */}
          <div className="mb-1">
            <StarRow count={hotel.starRating} />
          </div>

          {/* Name */}
          <h3
            className="mb-1 cursor-pointer text-base font-bold text-gray-900 hover:text-[#003580]"
            onClick={handleViewHotel}
          >
            {hotel.name}
          </h3>

          {/* Address */}
          <p className="mb-1 text-xs text-gray-500 line-clamp-2">
            {hotel.location}
          </p>

          {/* Distance */}
          <div className="mb-3 flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3 shrink-0" />
            <span>{hotel.distance}</span>
          </div>

          {/* Amenity icons row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
            {hotel.amenities.slice(0, 4).map((a, i) => (
              <span key={i} className="flex items-center gap-1">
                {AMENITY_ICONS[a] ?? null}
                {a}
              </span>
            ))}
          </div>
        </div>

        {/* Right: price + CTA */}
        <div className="flex w-44 shrink-0 flex-col items-end justify-between border-l border-gray-100 p-4">
          {/* Wishlist */}
          <button
            onClick={() => toggleWishlist(hotel.id)}
            className="self-end"
          >
            <Heart
              className={`h-5 w-5 transition-colors ${wishlisted.has(hotel.id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}`}
            />
          </button>

          {/* Price block */}
          <div className="text-right">
            {origPrice && (
              <div className="text-xs text-gray-400 line-through">
                Rs {origPrice.toLocaleString('en-IN')}
              </div>
            )}
            <div className="text-xl font-bold text-gray-900">
              Rs {price.toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-gray-500">Incl. of taxes &amp; fees</div>
            {hotel.freeCancellation && (
              <div className="mt-1 text-xs font-medium text-green-600">Free cancellation</div>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleViewHotel}
            className="mt-3 w-full rounded px-4 py-2 text-sm font-bold text-gray-900 transition-colors hover:opacity-90"
            style={{ backgroundColor: YELLOW }}
          >
            See rooms
          </button>
        </div>
      </div>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white">
      {/* ── Top nav bar (Musafir style) ── */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5">
          {/* Back */}
          <button onClick={() => navigate('/hotels')} className="shrink-0 text-gray-500 hover:text-gray-800">
            <ArrowLeft className="h-5 w-5" />
          </button>

          {/* Location */}
          <span className="text-base font-bold text-gray-900">
            {searchParams.location || 'Mumbai'}
          </span>

          {/* Dates + guests */}
          <span className="hidden text-sm text-gray-600 sm:inline">
            {ci && co
              ? `${formatDateShort(ci)} – ${formatDateShort(co)} (${nights} night${nights !== 1 ? 's' : ''})`
              : ''}
            {' · '}
            {searchParams.rooms} room{searchParams.rooms !== 1 ? 's' : ''}
            {' · '}
            {searchParams.adults} guest{searchParams.adults !== 1 ? 's' : ''}
          </span>

          {/* Change */}
          <button
            onClick={() => navigate('/hotels')}
            className="text-sm font-semibold hover:underline"
            style={{ color: BLUE }}
          >
            Change
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sort */}
          <div className="relative hidden sm:block">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none rounded border border-gray-300 bg-white py-1.5 pl-3 pr-7 text-sm text-gray-700 focus:border-[#003580] focus:outline-none"
            >
              <option value="rating">Sort by star rating</option>
              <option value="cheapest">Price (lowest first)</option>
              <option value="reviews">Guest rating</option>
              <option value="distance">Distance</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Show total price toggle */}
          <button
            onClick={() => setShowTotalPrice(v => !v)}
            className="hidden items-center gap-1 text-sm text-gray-700 hover:text-gray-900 sm:flex"
          >
            {showTotalPrice ? 'Show total price' : 'Show per night'}
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Mobile filter */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-1.5 rounded border border-gray-300 px-2.5 py-1.5 text-sm text-gray-700 sm:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto flex max-w-7xl gap-0">
        {/* ── Left sidebar ── */}
        <aside className="hidden w-52 shrink-0 border-r border-gray-100 px-4 py-5 lg:block">
          <Sidebar />
        </aside>

        {/* ── Results list ── */}
        <main className="flex-1 px-4 py-5">
          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-3">
              {statusMessage && (
                <div className="mb-2 flex items-center gap-2 text-sm text-gray-500">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#003580] border-t-transparent" />
                  {statusMessage}
                </div>
              )}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex h-48 animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <div className="w-64 shrink-0 bg-gray-200" />
                  <div className="flex-1 p-4 space-y-3">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                    <div className="h-5 w-64 rounded bg-gray-200" />
                    <div className="h-3 w-48 rounded bg-gray-200" />
                    <div className="flex gap-2">
                      <div className="h-6 w-16 rounded-full bg-gray-200" />
                      <div className="h-6 w-16 rounded-full bg-gray-200" />
                    </div>
                  </div>
                  <div className="w-44 shrink-0 border-l border-gray-100 p-4 space-y-2">
                    <div className="h-6 w-24 rounded bg-gray-200 ml-auto" />
                    <div className="h-8 w-32 rounded bg-gray-200 ml-auto" />
                    <div className="h-9 w-full rounded bg-gray-200 mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* API error */}
          {!loading && error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <div>
                <div className="font-semibold text-red-800">Search failed</div>
                <div className="mt-1 text-sm text-red-700">{error}</div>
                <button
                  onClick={() => navigate('/hotels')}
                  className="mt-3 text-sm font-medium text-red-700 underline"
                >
                  Modify search
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            filteredHotels.length > 0 ? (
              <>
                <div className="space-y-3">
                  {filteredHotels.slice(0, visibleCount).map(hotel => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>

                {visibleCount < filteredHotels.length && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setVisibleCount(v => v + 10)}
                      className="rounded border px-6 py-2 text-sm font-semibold transition-colors hover:bg-blue-50"
                      style={{ borderColor: BLUE, color: BLUE }}
                    >
                      Load more ({filteredHotels.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                <h3 className="mb-2 text-lg font-bold text-gray-800">No hotels found</h3>
                <p className="mb-4 text-sm text-gray-500">Try adjusting your filters</p>
                <button
                  onClick={resetFilters}
                  className="rounded border px-5 py-2 text-sm font-semibold"
                  style={{ borderColor: BLUE, color: BLUE }}
                >
                  Clear all filters
                </button>
              </div>
            )
          )}
        </main>
      </div>

      {/* ── Mobile filter drawer ── */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[90vh] overflow-y-auto rounded-t-2xl bg-white">
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <h2 className="text-base font-bold text-gray-900">Filters</h2>
              <button onClick={() => setShowMobileFilters(false)}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <Sidebar />
            </div>
            <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full rounded-lg py-3 text-sm font-bold text-white"
                style={{ backgroundColor: BLUE }}
              >
                Show {filteredHotels.length} hotels
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
