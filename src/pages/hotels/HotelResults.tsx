import { uniq } from 'lodash';
import { useCurrency } from '../../context/currencyContext';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import HotelFilters from '../../components/hotels/HotelFilters';
import { Slider } from '../atoms/Slider';
import SortDropdown from '../../components/hotels/SortDropdown';
import {
  MapPin, X, Star, Search,
  Wifi, Dumbbell, UtensilsCrossed, Car, Waves,
  Coffee, Loader2, AlertTriangle, Shield, CheckCircle, Building2,
  List, ArrowRight, Map as MapIcon, Heart, Info, Sparkles, Navigation,
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

// tiny className joiner (kept local so no new project dependency is introduced)
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}

// ── Coordinates come from /city-hotels (Latitude/Longitude), carried through
// normHotel() onto each Hotel object as _latitude/_longitude. Nothing else
// in the /search or pricing flow carries lat/lng, so this is the only source. ──
function getHotelCoords(hotel: any): [number, number] | null {
  const lat = hotel?._latitude;
  const lng = hotel?._longitude;
  if (typeof lat !== 'number' || typeof lng !== 'number' || Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return [lat, lng];
}

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

// Colour treatment for amenity chips, matching the reference design language.
// Falls back to a neutral slate chip for amenities not in the map — no data is invented.
const AMENITY_COLORS: Record<string, string> = {
  'Free Breakfast': 'bg-green-50 text-green-700 border-green-200',
  'Breakfast': 'bg-green-50 text-green-700 border-green-200',
  'Pool': 'bg-blue-50 text-blue-700 border-blue-200',
  'Beachfront': 'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Free WiFi': 'bg-purple-50 text-purple-700 border-purple-200',
  'Free Wi-Fi': 'bg-purple-50 text-purple-700 border-purple-200',
  'WiFi': 'bg-purple-50 text-purple-700 border-purple-200',
  'Spa': 'bg-rose-50 text-rose-700 border-rose-200',
  'Gym': 'bg-orange-50 text-orange-700 border-orange-200',
  'Parking': 'bg-slate-50 text-slate-700 border-slate-200',
  'Restaurant': 'bg-amber-50 text-amber-700 border-amber-200',
};

function AmenityChip({ label }: { label: string }) {
  const cls = AMENITY_COLORS[label] || 'bg-slate-50 text-slate-600 border-slate-200';
  return (
    <span className={cx('inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-lg border px-2 py-1', cls)}>
      {getAmenityIcon(label, 'sm')}
      {label}
    </span>
  );
}

/* ─── Category chips (cosmetic only — mirrors reference design; does not filter results) ─── */
const CATEGORIES = [
  { id: 'all',   icon: '🏨', label: 'All Stays',          sub: 'Every match for your dates', from: '#1e293b', to: '#475569' },
  { id: 'top',   icon: '⭐', label: 'Top Reviewed',        sub: 'Loved by travellers',        from: '#f59e0b', to: '#f97316' },
  { id: 'free',  icon: '✅', label: 'Free Cancellation',   sub: 'Book now, pay later',        from: '#10b981', to: '#059669' },
  { id: 'value', icon: '💰', label: 'Best Value',          sub: 'Great price for the stars',  from: '#3b82f6', to: '#6366f1' },
];

function CategoryChips({ active, onSelect }: { active: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      {CATEGORIES.map((cat) => (
        <motion.button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          className={cx(
            'flex items-center gap-3 px-4 py-3 rounded-xl border min-w-max transition-all',
            active === cat.id
              ? 'border-transparent shadow-md text-white'
              : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
          )}
          style={active === cat.id ? { background: `linear-gradient(135deg,${cat.from},${cat.to})` } : {}}
        >
          <span className="text-xl leading-none">{cat.icon}</span>
          <div className="text-left">
            <div className={cx('text-[13px] font-bold leading-tight', active === cat.id ? 'text-white' : 'text-slate-800')}>
              {cat.label}
            </div>
            <div className={cx('text-[11px] leading-tight', active === cat.id ? 'text-white/80' : 'text-slate-500')}>
              {cat.sub}
            </div>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// Max amenity chips to show inline on a card before collapsing into "+N more".
// Card width doesn't grow, so anything beyond this goes into the popup modal.
const VISIBLE_AMENITY_COUNT = 4;

function AmenitiesModal({ hotelName, amenities, onClose }: { hotelName: string; amenities: string[]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="bg-white rounded-2xl max-w-md w-full max-h-[70vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white z-10">
          <div>
            <h3 className="text-[15px] font-bold text-slate-900">All amenities</h3>
            <p className="text-[11px] text-slate-400 truncate max-w-[280px]">{hotelName}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-slate-100 shrink-0" aria-label="Close">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        <div className="p-5 flex flex-wrap gap-2">
          {amenities.map((a, i) => (
            <AmenityChip key={i} label={a} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Card-shaped loading placeholder ───────────────────────────────────────
   Mirrors the real HotelCard's three-column layout (image / details / price)
   so the "searching" state reads as a prototype of the card itself rather
   than generic grey bars, and carries no "finding hotels…" copy at all. ── */
function HotelCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-auto flex flex-col md:flex-row min-w-0 ">
      {/* Image column */}
      <div className="shrink-0 w-full md:w-60 h-48 md:h-[158px] bg-slate-100" />

      {/* Details column */}
      <div className="flex-1 min-w-0 flex flex-col gap-3 px-5 py-4 border-r-0 md:border-r border-slate-100">
        <div className="flex gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-3 w-3 rounded-full bg-slate-200" />
          ))}
        </div>
        <div className="h-4 w-2/3 bg-slate-200 rounded" />
        <div className="h-3 w-1/3 bg-slate-100 rounded" />
        <div className="flex gap-1.5 mt-auto flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-6 w-16 bg-slate-100 rounded-lg shrink-0" />
          ))}
        </div>
      </div>

      {/* Price / CTA column */}
      <div className="shrink-0 w-full md:w-56 flex flex-col justify-between px-5 py-4 bg-slate-50 border-t md:border-t-0 border-slate-100">
        <div className="h-6 w-14 bg-slate-200 rounded-lg self-start" />
        <div className="flex flex-col items-end gap-2 mt-auto">
          <div className="h-3 w-20 bg-slate-100 rounded" />
          <div className="h-6 w-24 bg-slate-200 rounded" />
          <div className="h-9 w-full bg-slate-200 rounded-xl mt-2" />
        </div>
      </div>
    </div>
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
  const [wishlisted, setWishlisted] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);

  // De-duplicate amenities coming from the API (e.g. "WiFi" + "Free WiFi" both
  // present) so the visible-count / "+N more" math is always accurate.
  const uniqueAmenities: string[] = useMemo(() => uniq(hotel.amenities), [hotel.amenities]);

  const gallery: string[] = (hotel.images && hotel.images.length > 0) ? hotel.images : [];
  const thumbCount = Math.min(gallery.length, 3);

  // Clicking Select takes the guest straight into the room list for this hotel —
  // no intermediate "Selected" state / sticky confirm bar to click through.
  const handleSelectHotel = () => {
    setSelectedHotel(hotel);
    navigate(`/hotels/${hotel.id}/rooms`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-2xl border overflow-hidden flex flex-col md:flex-row transition-all"
      style={{
        borderColor: hovered || isSelected ? '#93c5fd' : '#e2e8f0',
        boxShadow: isSelected ? '0 8px 24px rgba(37,99,235,0.14)' : hovered ? '0 12px 32px rgba(40,60,120,0.10)' : '0 2px 12px rgba(40,60,120,0.06)',
      }}
    >
      <div className="flex flex-col md:flex-row flex-1 min-w-0">
        {/* ── LEFT: Image gallery column ── */}
        <div className="relative shrink-0 flex flex-col w-full md:w-60">
          {/* Hero image */}
          <div className="relative bg-slate-100 overflow-hidden flex items-center justify-center h-48 md:h-[158px]">
            {gallery[0] ? (
              <img src={gallery[0]} alt={hotel.name} loading="lazy" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center opacity-40 text-slate-500">
                <Building2 className="w-10 h-10 mb-2" />
                <span className="text-xs font-bold">No Image Available</span>
              </div>
            )}

            {hotel.freeCancellation && (
              <span className="absolute top-2 left-2 flex items-center gap-1 rounded-lg text-[10px] font-bold text-white px-2 py-1 shadow-sm" style={{ background: 'rgba(16,163,74,0.95)' }}>
                <Shield size={10} /> Free cancellation
              </span>
            )}

            {/* Wishlist heart — top-right (local, presentational only) */}
            <button
              onClick={() => setWishlisted((v) => !v)}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm"
            >
              <Heart size={13} className={wishlisted ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
            </button>

            {/* Image counter — bottom-right */}
            {gallery.length > 0 && (
              <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-black/55 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md leading-none">
                1/{gallery.length}
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {thumbCount > 0 && (
            <div className="hidden md:flex gap-1 p-1.5 bg-slate-50 border-t border-slate-100">
              {gallery.slice(0, thumbCount).map((img, i) => (
                <div key={i} className="flex-1 rounded-md overflow-hidden opacity-75 hover:opacity-100 transition-opacity cursor-pointer" style={{ height: 44 }}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── CENTER: Details column ── */}
        <div className="flex-1 flex flex-col px-5 py-4 min-w-0 border-r-0 md:border-r border-slate-100">
          <div className="mb-2">
            <StarRow count={hotel.starRating} />
          </div>

          <div className="flex items-center gap-1.5 mb-1.5">
            <h3 className="text-[16px] font-bold text-slate-900 leading-tight">{hotel.name}</h3>
            <Info size={13} className="text-slate-400 shrink-0" />
          </div>

          <p className="flex items-center gap-1 text-[12px] text-slate-500 mb-3">
            <MapPin size={12} className="text-slate-400 shrink-0" />
            <span className="underline decoration-dotted decoration-slate-300 cursor-pointer">{hotel.location}</span>
          </p>

          <div className="flex flex-wrap items-center gap-1.5 mt-auto">
            {uniqueAmenities.slice(0, VISIBLE_AMENITY_COUNT).map((a: string, i: number) => (
              <AmenityChip key={i} label={a} />
            ))}
            {uniqueAmenities.length > VISIBLE_AMENITY_COUNT && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowAmenitiesModal(true); }}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline self-center px-1"
              >
                +{uniqueAmenities.length - VISIBLE_AMENITY_COUNT} more
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT: Price & CTA column ── */}
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
              onClick={handleSelectHotel}
              className="mt-4 w-full rounded-xl px-4 py-2.5 text-[13px] font-bold flex items-center justify-center gap-1.5 text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg,#f97316,#ea580c)',
                boxShadow: '0 2px 8px rgba(249,115,22,0.35)',
              }}
            >
              Select <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Amenities popup — shows the full de-duplicated list without widening the card */}
      <AnimatePresence>
        {showAmenitiesModal && (
          <AmenitiesModal
            hotelName={hotel.name}
            amenities={uniqueAmenities}
            onClose={() => setShowAmenitiesModal(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Map preview panel (slide-up on pin click) — shows real hotel data ─── */
function HotelMapPreview({ hotel, nights, showTotalPrice, onClose, onSelect }: {
  hotel: any; nights: number; showTotalPrice: boolean; onClose: () => void; onSelect: () => void;
}) {
  const { convert } = useCurrency();
  const navigate = useNavigate();
  const totalPayable = showTotalPrice
    ? getHotelTotalPayable(hotel)
    : Math.ceil(getHotelTotalPayable(hotel) / nights);
  const image = hotel.images && hotel.images[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      className="absolute bottom-12 left-3 right-3 z-[1000] bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.22)', border: '1px solid rgba(226,232,240,0.7)' }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors"
        style={{ background: 'rgba(0,0,0,0.32)', backdropFilter: 'blur(4px)' }}
        aria-label="Close preview"
      >
        <X size={12} />
      </button>

      <div className="relative overflow-hidden bg-slate-800" style={{ height: 96 }}>
        {image ? (
          <img src={image} alt={hotel.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center opacity-50 text-white">
            <Building2 className="w-8 h-8" />
          </div>
        )}
        {hotel.freeCancellation && (
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold text-white" style={{ background: 'rgba(16,163,74,0.92)' }}>
            Free cancellation
          </div>
        )}
        <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded-md text-[9px] font-semibold text-white" style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}>
          {hotel.location}
        </div>
      </div>

      <div className="px-3 py-2.5">
        <h3 className="text-[13px] font-bold text-slate-900 leading-tight mb-1.5 pr-4 truncate">{hotel.name}</h3>

        <div className="flex items-center gap-1.5 mb-2.5">
          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-bold text-white" style={{ background: '#16a34a' }}>
            <Star size={8} className="fill-white" />
            {(hotel.reviewCount > 0 ? hotel.rating : hotel.starRating).toFixed(1)}
          </span>
          <StarRow count={hotel.starRating} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-0.5">
            <span className="text-[20px] font-extrabold text-slate-900 leading-none">{convert(totalPayable)}</span>
            <span className="text-[10px] text-slate-400 ml-0.5">/{showTotalPrice ? `${nights}n` : 'night'}</span>
          </div>
          <button
            onClick={onSelect}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl text-white text-[12px] font-bold hover:opacity-90 active:scale-[0.97] transition-all"
            style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)', boxShadow: '0 2px 8px rgba(249,115,22,0.4)' }}
          >
            Select <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Live map panel — plots real hotels using the API's Map (lat|lng) field ─── */
function ResultsMapPanel({ hotels, nights, showTotalPrice }: { hotels: any[]; nights: number; showTotalPrice: boolean }) {
  const { setSelectedHotel } = useHotelStore();
  const navigate = useNavigate();
  const mapRef      = useRef<HTMLDivElement>(null);
  const leafletRef  = useRef<any>(null);
  const markersRef  = useRef<Record<string, any>>({});
  const activeIdRef = useRef<string | null>(null);
  const makeIconRef = useRef<((h: any, active: boolean) => any) | null>(null);
  const hotelsRef   = useRef(hotels);
  hotelsRef.current = hotels;

  const [activeHotel, setActiveHotel] = useState<any | null>(null);
  const [query, setQuery] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const { convert } = useCurrency();

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return hotels.filter((h) =>
      h.name.toLowerCase().includes(q) || h.location.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query, hotels]);

  const priceLabel = (h: any) => {
    const total = showTotalPrice ? getHotelTotalPayable(h) : Math.ceil(getHotelTotalPayable(h) / nights);
    return convert(total);
  };

  const flyToHotel = (h: any) => {
    setQuery(h.name);
    setDropOpen(false);
    const map = leafletRef.current;
    if (!map || h.lat == null || h.lng == null) return;
    map.flyTo([h.lat, h.lng], 15, { animate: true, duration: 0.7 });
    setTimeout(() => {
      activeIdRef.current = h.id;
      setActiveHotel(h);
      hotelsRef.current.forEach((loc) => {
        markersRef.current[loc.id]?.setIcon(makeIconRef.current!(loc, loc.id === h.id));
      });
    }, 750);
  };

  // Navigate straight to the rooms page for the hotel chosen from the map
  const handleSelectFromMap = (h: any) => {
    setSelectedHotel(h);
    navigate(`/hotels/${h.id}/rooms`);
  };

  // Initialise Leaflet once
  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    import('leaflet').then(({ default: L }) => {
      if (!mapRef.current || leafletRef.current) return;

      const withCoords = hotelsRef.current.filter((h) => h.lat != null && h.lng != null);
      const center: [number, number] = withCoords.length
        ? [withCoords[0].lat, withCoords[0].lng]
        : [20.5937, 78.9629]; // fallback: India center, only used if no hotel has coordinates

      const map = L.map(mapRef.current, {
        center,
        zoom: withCoords.length ? 13 : 5,
        zoomControl: true,
        attributionControl: false,
      });
      leafletRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

      function makeIcon(h: any, active: boolean) {
        const bg    = active ? '#0f172a' : '#ffffff';
        const color = active ? '#ffffff' : '#1e293b';
        const bdr   = active ? '#0f172a' : '#e2e8f0';
        return L.divIcon({
          className: '',
          iconAnchor: [36, 30] as [number, number],
          iconSize:   [72, 30] as [number, number],
          html: `<div style="display:inline-flex;flex-direction:column;align-items:center;filter:drop-shadow(0 2px 6px rgba(0,0,0,${active ? '.3' : '.15'}));transition:all .15s;transform:${active ? 'scale(1.12)' : 'scale(1)'}">
            <div style="background:${bg};color:${color};border:1.5px solid ${bdr};border-radius:20px;padding:4px 10px;font-size:11px;font-weight:700;white-space:nowrap;font-family:system-ui,sans-serif;line-height:1.2;">${priceLabel(h)}</div>
            <div style="width:6px;height:6px;border-radius:50%;background:${active ? '#0f172a' : '#94a3b8'};margin-top:-1px;"></div>
          </div>`,
        });
      }
      makeIconRef.current = makeIcon;

      withCoords.forEach((h) => {
        const marker = L.marker([h.lat, h.lng], { icon: makeIcon(h, false) });
        marker.on('click', (e: any) => {
          L.DomEvent.stopPropagation(e);
          const isActive = activeIdRef.current === h.id;
          const next = isActive ? null : h.id;
          activeIdRef.current = next;
          setActiveHotel(isActive ? null : h);
          hotelsRef.current.forEach((loc) => markersRef.current[loc.id]?.setIcon(makeIcon(loc, loc.id === next)));
        });
        marker.addTo(map);
        markersRef.current[h.id] = marker;
      });

      map.on('click', () => {
        if (activeIdRef.current) {
          hotelsRef.current.forEach((loc) => markersRef.current[loc.id]?.setIcon(makeIcon(loc, false)));
        }
        activeIdRef.current = null;
        setActiveHotel(null);
      });
    });

    return () => { leafletRef.current?.remove(); leafletRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep markers in sync when the underlying filtered/sorted hotel list changes
  useEffect(() => {
    const map = leafletRef.current;
    const L = (window as any).L;
    if (!map || !makeIconRef.current) return;

    // remove markers for hotels no longer present
    Object.keys(markersRef.current).forEach((id) => {
      if (!hotels.some((h) => h.id === id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });
    // add markers for new hotels (uses dynamic import lazily via cached module)
    import('leaflet').then(({ default: Lmod }) => {
      hotels.forEach((h) => {
        if (h.lat == null || h.lng == null) return;
        if (markersRef.current[h.id]) {
          markersRef.current[h.id].setIcon(makeIconRef.current!(h, activeIdRef.current === h.id));
          return;
        }
        const marker = Lmod.marker([h.lat, h.lng], { icon: makeIconRef.current!(h, false) });
        marker.on('click', (e: any) => {
          Lmod.DomEvent.stopPropagation(e);
          const isActive = activeIdRef.current === h.id;
          const next = isActive ? null : h.id;
          activeIdRef.current = next;
          setActiveHotel(isActive ? null : h);
          hotelsRef.current.forEach((loc) => markersRef.current[loc.id]?.setIcon(makeIconRef.current!(loc, loc.id === next)));
        });
        marker.addTo(map);
        markersRef.current[h.id] = marker;
      });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotels]);

  const recenter = () => {
    const withCoords = hotels.filter((h) => h.lat != null && h.lng != null);
    if (!withCoords.length || !leafletRef.current) return;
    leafletRef.current.flyTo([withCoords[0].lat, withCoords[0].lng], 13, { animate: true, duration: 0.7 });
  };

  const clearSearch = () => setQuery('');

  return (
    <div
      className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col"
      style={{ height: 'calc(100vh - 180px)', minHeight: 540, position: 'sticky', top: 240 }}
    >
      <div className="bg-white px-3 py-2.5 border-b border-slate-100 shrink-0">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setDropOpen(true); }}
            onFocus={() => query && setDropOpen(true)}
            placeholder="Search hotels or areas…"
            className="w-full pl-8 pr-8 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
          />
          {query && (
            <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={14} />
            </button>
          )}

          <AnimatePresence>
            {dropOpen && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl z-[2000] overflow-hidden"
              >
                {suggestions.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => flyToHotel(h)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left border-b border-slate-50 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shrink-0">
                      <MapPin size={13} className="text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12px] font-semibold text-slate-800 truncate">{h.name}</div>
                      <div className="text-[10px] text-slate-400">{h.location} · {priceLabel(h)}</div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-500 shrink-0">★ {(h.reviewCount > 0 ? h.rating : h.starRating).toFixed(1)}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="relative flex-1 min-h-0" onClick={() => setDropOpen(false)}>
        <div ref={mapRef} style={{ height: '100%', width: '100%' }} />

        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[999] bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-md">
          {hotels.filter((h) => h.lat != null && h.lng != null).length} {hotels.length === 1 ? 'property' : 'properties'} in view
        </div>

        <button
          onClick={recenter}
          className="absolute bottom-14 right-3 z-[1000] w-9 h-9 bg-white rounded-xl shadow-md flex items-center justify-center text-slate-600 hover:bg-slate-50 border border-slate-200 transition-colors"
          title="Recenter map"
        >
          <Navigation size={14} />
        </button>

        <div className="absolute bottom-1 left-1 z-[1000] text-[9px] text-slate-400 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded pointer-events-none">
          © OpenStreetMap contributors
        </div>

        <AnimatePresence>
          {activeHotel && (
            <HotelMapPreview
              hotel={activeHotel}
              nights={nights}
              showTotalPrice={showTotalPrice}
              onClose={() => {
                activeIdRef.current = null;
                setActiveHotel(null);
                hotelsRef.current.forEach((loc) => markersRef.current[loc.id]?.setIcon(makeIconRef.current!(loc, false)));
              }}
              onSelect={() => handleSelectFromMap(activeHotel)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function HotelResults() {
  const { convert } = useCurrency();
  const navigate = useNavigate();
  const [urlParams] = useRouterSearchParams();
  const isDefault = urlParams.get('default') === 'true';

  const { searchParams, filters, resetFilters, sortBy, sortDirection, setSearchResultsMap, selectedHotel, selectedRooms, setSearchParams, resetBooking } = useHotelStore();
  const { hotels: apiHotels, rawResults, loading, hasSearched, error, search } = useHotelSearch();

  // Local state
  const [propertySearch, setPropertySearch] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [activeCategory, setActiveCategory] = useState('all');
  const [showMobileMap, setShowMobileMap] = useState(false);
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

  // De-duplicated with lodash's uniq — API results sometimes repeat the same
  // amenity label across hotels/rooms, which used to inflate this list.
  const AMENITIES_LIST = useMemo(() => {
    const all = uniq(apiHotels.flatMap(h => h.amenities as string[]));
    const fallback = ['Free WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Parking', 'Breakfast'];
    return all.length > 0 ? all.slice(0, 15) : fallback;
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

  // ── Attach real lat/lng (from /city-hotels, carried onto the hotel as _latitude/_longitude) ──
  const mapHotels = useMemo(() => {
    return filteredHotels.map((h) => {
      const coords = getHotelCoords(h);
      return coords ? { ...h, lat: coords[0], lng: coords[1] } : { ...h, lat: null, lng: null };
    });
  }, [filteredHotels]);

  const handleClearFilters = () => {
    resetFilters();
    setPropertySearch('');
  };

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
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-5">

        {/* Results header */}
        <div className="mb-4 mx-7 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[18px] font-bold text-slate-900">
              {filteredHotels.length} {filteredHotels.length === 1 ? 'property' : 'properties'} found{searchParams.location ? ` in ${searchParams.location}` : ''}
            </h1>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Prices for {nights} night{nights > 1 ? 's' : ''}
              {ci && co ? ` • ${ci.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} – ${co.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}` : ''}
              {' '}• {searchParams.adults} Guest{searchParams.adults > 1 ? 's' : ''}
            </p>
          </div>

          {/* Mobile-only toggle to reveal the map, since it lives in a side column on larger screens */}
          <button
            onClick={() => setShowMobileMap(v => !v)}
            className={cx(
              'xl:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold border shrink-0 transition-colors',
              showMobileMap ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            )}
          >
            <MapIcon size={13} />
            {showMobileMap ? 'Hide Map' : 'Show Map'}
          </button>
        </div>

        {/* Mobile map (shown above the list, since the side map column is hidden below xl) */}
        {showMobileMap && (
          <div className="xl:hidden mb-4">
            <ResultsMapPanel hotels={mapHotels} nights={nights} showTotalPrice={showTotalPrice} />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-5">
          {/* ── Left sidebar ── */}
          <aside style={{ width: 260, flexShrink: 0 }} className="hidden lg:block">
            <div
              className="rounded-xl p-4"
              style={{
                position: 'sticky',
                top: 240,         
              }}
            >
              <HotelFilters maxPrice={MAX_PRICE} neighborhoods={NEIGHBOURHOODS} amenitiesList={AMENITIES_LIST} propertyTypes={PROPERTY_TYPES} propertySearch={propertySearch} setPropertySearch={setPropertySearch} />
            </div>
          </aside>

          {/* ── Center: Hotel List ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Sort bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500 font-medium">Sort by</span>
                <SortDropdown />
              </div>
            </div>

            {/* Category chips (cosmetic only, matches reference — does not affect filtering) */}
            <CategoryChips active={activeCategory} onSelect={setActiveCategory} />

            {/* Loading state — card-shaped skeletons only, no "finding hotels…" copy or spinner */}
            {(loading || (!hasSearched && !error)) && (
              <div className="flex flex-col ">
                {[1, 2, 3, 4].map(i => (
                  <HotelCardSkeleton key={i} />
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

          {/* ── Right: Map (always visible alongside the list on large screens) ── */}
          {!loading && !error && hasSearched && filteredHotels.length > 0 && (
            <div className="w-[360px] shrink-0 hidden xl:block">
              <ResultsMapPanel hotels={mapHotels} nights={nights} showTotalPrice={showTotalPrice} />
            </div>
          )}
        </div>
      </div>

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