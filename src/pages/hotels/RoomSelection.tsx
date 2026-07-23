// import { useCurrency } from '../../hooks/useCurrency';
import { formatINR } from '../../lib/flights_api';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BedDouble, Maximize2, 
  CheckCircle, XCircle, Loader2, AlertTriangle,
  Star, MapPin, Plus, Minus,
  MessageCircle, Navigation, ChevronRight, Images, Info, Map, X
} from 'lucide-react';
import { CancellationPolicyPanel } from '../../components/hotels/CancellationPolicyPanel';
import { getAmenityIcon } from '../../components/hotels/amenityIcons';
import { useHotelStore } from '../../stores/hotelStore';
import { useHotelRooms, runHotelPreBook, formatHotelTraceApiError, getCancellationPolicyDisplay, getPolicyChargeText, formatPolicyDate } from '../../hooks/useHotelApi';
import { hasSupplierPriceChange } from '../../lib/hotelPricing';
import type { Room, PreBookResponse } from '../../stores/hotelStore';
import Button from '../../components/ui/Button';
import { calculateNights } from '../../lib/utils';
import toast from 'react-hot-toast';
import HotelBookingShell from '../../components/hotels/HotelBookingShell';
import HotelSearchSummaryBar from '../../components/hotels/HotelSearchSummaryBar';
import { useCurrency } from '../../context/currencyContext';

// ── Helpers ───────────────────────────────────────────────────────────────────

function parsePolicyDate(dStr: string): Date | null {
  if (!dStr) return null;
  try {
    // Handle DD-MM-YYYY [HH:MM:SS] format from TBO
    const match = dStr.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(.*))?$/);
    const parseStr = match
      ? `${match[3]}-${match[2]}-${match[1]}${match[4] ? 'T' + match[4] : ''}`
      : dStr;
    const d = new Date(parseStr);
    return isNaN(d.getTime()) ? null : d;
  } catch { return null; }
}

function getDayBefore(dStr: string): string {
  const d = parsePolicyDate(dStr);
  if (!d) return formatPolicyDate(dStr);
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ── CancellationBadge — shown on each room card ───────────────────────────────
function CancellationBadge({
  room,
  preBook,
  loading,
}: {
  room: Room;
  preBook: PreBookResponse | null | undefined;
  loading: boolean;
}) {
  const { searchParams } = useHotelStore();

  return (
    <div className="mb-5 max-w-md">
      <CancellationPolicyPanel
        cancelPolicies={preBook?.cancelPolicies ?? room.cancelPolicies}
        cancellationPolicy={preBook?.cancellationPolicy ?? room.cancellationPolicy}
        isRefundable={preBook?.isRefundable ?? room._isRefundable}
        checkInDate={searchParams.checkIn}
        roomName={room.name}
        loading={loading}
        size="compact"
      />
    </div>
  );
}

export default function RoomSelection() {
  //const { formatCurrency, symbol, currencyCode } = useCurrency();
  const { convert } = useCurrency();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    searchParams, selectedRooms, addRoom, removeRoom, updateRoomQuantity,
    selectedHotel, searchResultsMap, clearRooms,
    traceId, setPreBookResponses, setPreBookResponse, setBookingCode, setBookingCodes,
  } = useHotelStore();
  const { rooms, loading, error, loadRoomsFromResult } = useHotelRooms();

  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);


  const [roomPreBooks, setRoomPreBooks] = useState<Record<string, PreBookResponse>>({});
  const [preBookingRoomIds, setPreBookingRoomIds] = useState<Set<string>>(new Set());
  const [preBookErrors, setPreBookErrors] = useState<Record<string, string>>({});
  
  // New PreBook flow states
  const [preBookingSubmit, setPreBookingSubmit] = useState(false);
  const [supplierPriceChanged, setSupplierPriceChanged] = useState(false);
  const [priceChangeAcknowledged, setPriceChangeAcknowledged] = useState(false);

  const preBookFiredRef = useRef<string>(''); // tracks hotel id to avoid re-firing on same hotel

  const nights = calculateNights(searchParams.checkIn, searchParams.checkOut) || 1;

  useEffect(() => {
    if (!id) { navigate('/hotels/results'); return; }
    const rawResult = searchResultsMap[id];
    if (rawResult) {
      clearRooms();
      loadRoomsFromResult(rawResult);
      setRoomPreBooks({});
      preBookFiredRef.current = '';
    } else {
      navigate('/hotels/results');
    }
  }, [id]);

  // Fire prebook for ALL rooms in parallel once rooms are loaded.
  // Sequentially staggered by 200ms between each call to avoid hammering TBO.
  useEffect(() => {
    if (rooms.length === 0 || !traceId?.trim()) return;
    if (preBookFiredRef.current === id) return; // already fired for this hotel
    preBookFiredRef.current = id ?? '';

    const ids = new Set(rooms.map(r => (r as any)._bookingCode ?? r.id));
    setPreBookingRoomIds(ids);

    rooms.forEach((room, index) => {
      const code = (room as any)._bookingCode ?? room.id ?? '';
      if (!code) return;
      const checkInStr = searchParams.checkIn
        ? (searchParams.checkIn instanceof Date
            ? searchParams.checkIn.toISOString().split('T')[0]
            : String(searchParams.checkIn).split('T')[0])
        : '';

      // Stagger by 200ms per room to avoid rate limiting
      setTimeout(async () => {
        try {
          const result = await runHotelPreBook(code, traceId, checkInStr);
          setRoomPreBooks(prev => ({ ...prev, [code]: result }));
        } catch (err) {
          console.warn('[RoomSelection] prebook failed for room', index, code, ':', formatHotelTraceApiError(err, ''));
        } finally {
          setPreBookingRoomIds(prev => {
            const next = new Set(prev);
            next.delete(code);
            return next;
          });
        }
      }, index * 200);
    });
  }, [rooms, traceId, id]);

  // Fetch prebook for a single room on-demand (called on select)
  const fetchPreBookForRoom = async (room: Room) => {
    const code = (room as any)._bookingCode ?? room.id ?? '';
    if (!code || !traceId?.trim() || roomPreBooks[code]) return;
    setPreBookingRoomIds(prev => new Set(prev).add(code));
    const checkInStr = searchParams.checkIn
      ? (searchParams.checkIn instanceof Date
          ? searchParams.checkIn.toISOString().split('T')[0]
          : String(searchParams.checkIn).split('T')[0])
      : '';
    try {
      const result = await runHotelPreBook(code, traceId, checkInStr);
      setRoomPreBooks(prev => ({ ...prev, [code]: result }));
    } catch (err) {
      console.warn('[RoomSelection] on-demand prebook failed for', code);
    } finally {
      setPreBookingRoomIds(prev => { const n = new Set(prev); n.delete(code); return n; });
    }
  };

  const handleBookNow = async () => {
    if (totalRoomsSelected < searchParams.rooms) {
      toast.error(`Please select ${searchParams.rooms} room${searchParams.rooms !== 1 ? 's' : ''}. You have selected ${totalRoomsSelected}.`);
      return;
    }

    setPreBookingSubmit(true);
    setSupplierPriceChanged(false);

    try {
      const tid = traceId;
      if (!tid?.trim()) {
        toast.error('Missing hotel search session (traceId). Please search again.');
        setPreBookingSubmit(false);
        return;
      }

      // Fetch fresh PreBook for all selected rooms
      const results = await Promise.all(
        selectedRooms.map((room, idx) => {
          const code = (room as any)._bookingCode ?? room.id ?? '';
          if (!code) return Promise.resolve({ idx, result: null as PreBookResponse | null, error: 'No booking code' });
          const checkInStr = searchParams.checkIn
            ? (searchParams.checkIn instanceof Date
                ? searchParams.checkIn.toISOString().split('T')[0]
                : String(searchParams.checkIn).split('T')[0])
            : '';
          return runHotelPreBook(code, tid, checkInStr)
            .then(res => ({ idx, result: res, error: null }))
            .catch(err => ({ idx, result: null, error: err }));
        })
      );

      const responses: (PreBookResponse | null)[] = new Array(selectedRooms.length).fill(null);
      let anyUnavailable = false;

      for (const { idx, result, error } of results) {
        if (error) {
          console.error(`❌ PreBook failed for room ${idx}:`, error);
          toast.error(formatHotelTraceApiError(error, `Could not verify room ${idx + 1}. Please try again.`));
          setPreBookingSubmit(false);
          return;
        }
        if (!result) {
          setPreBookingSubmit(false);
          return;
        }
        if (!result.roomAvailable) {
          anyUnavailable = true;
        }
        responses[idx] = result;
      }

      if (anyUnavailable) {
        toast.error('Sorry, one or more selected rooms are no longer available. Please select different rooms.');
        setPreBookingSubmit(false);
        return;
      }

      // Update store with fresh results
      setPreBookResponses(responses);
      if (responses[0]) {
        setPreBookResponse(responses[0]);
        setBookingCode(responses[0].bookingCode);
      }
      const codes = responses.map((r, idx) => r?.bookingCode ?? ((selectedRooms[idx] as any)._bookingCode ?? selectedRooms[idx]?.id ?? ''));
      setBookingCodes(codes);

      // Check if price changed
      const priceChanged = hasSupplierPriceChange(
        responses[0]!,
        selectedRooms,
        responses.length > 1 ? responses : undefined
      );

      if (priceChanged) {
        setSupplierPriceChanged(true);
        setPriceChangeAcknowledged(false);
        setPreBookingSubmit(false);
        toast.error('The hotel has updated their rates. Please review and acknowledge the new price.');
        return;
      }

      // Success, no price change
      navigate('/hotels/guest-details');

    } catch (err) {
      console.error('❌ PreBook Flow error', err);
      toast.error(formatHotelTraceApiError(err, 'Availability check failed. Please try again.'));
      setPreBookingSubmit(false);
    }
  };

  // Persist selected rooms' prebook results to store so GuestDetails skips re-fetching
  useEffect(() => {
    if (selectedRooms.length === 0) return;
    const responses = selectedRooms.map(room => {
      const code = (room as any)._bookingCode ?? room.id ?? '';
      return roomPreBooks[code] ?? null;
    });
    if (responses.some(r => r !== null)) {
      setPreBookResponses(responses);
      const first = responses.find(r => r !== null);
      if (first) {
        setPreBookResponse(first);
        setBookingCode(first.bookingCode);
      }
      setBookingCodes(responses.map((r, i) => r?.bookingCode ?? ((selectedRooms[i] as any)._bookingCode ?? selectedRooms[i]?.id ?? '')));
    }
  }, [roomPreBooks, selectedRooms]);

  const hotel = selectedHotel;

  if (!hotel) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4]">
      <h2 className="text-xl font-bold">Hotel not found</h2>
    </div>
  );

  if (loading && rooms.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4]">
        <Loader2 className="h-10 w-10 animate-spin text-[#003580]" />
      </div>
    );
  }

  if (error) return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[#f8f7f4]">
      <div className="text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-orange-400" />
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );

  // Full payable (base + taxes) — same as results card and subsequent steps
  const lowestRoomTotal = rooms.reduce(
    (min, room) => {
      const total = room.price + (room.taxesAndFees ?? 0);
      return total < min ? total : min;
    },
    Infinity
  );

  const scrollToRooms = () => {
    document.getElementById('rooms-list')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getSelectedRoom = (roomId: string) => selectedRooms.find(r => r.id === roomId);
  const totalRoomsSelected = selectedRooms.reduce((sum, r) => sum + r.quantity, 0);
  // Include taxes in the bottom bar total — matches Results card and subsequent steps
  const totalPrice = selectedRooms.reduce((sum, r) => sum + ((r.price + (r.taxesAndFees ?? 0)) * r.quantity), 0);

  const roomsNeeded = searchParams.rooms;

  // Increment quantity for a room (or add it if not yet selected)
  const handleIncrement = (room: Room) => {
    const totalSelected = selectedRooms.reduce((sum, r) => sum + r.quantity, 0);
    if (totalSelected >= roomsNeeded) return; // already at the cap
    addRoom(room); // addRoom increments quantity if already in cart
    void fetchPreBookForRoom(room);
  };

  // Decrement quantity for a room (removes it from cart if it hits 0)
  const handleDecrement = (room: Room) => {
    const selected = selectedRooms.find(r => r.id === room.id);
    if (!selected) return;
    if (selected.quantity <= 1) {
      removeRoom(room.id);
    } else {
      updateRoomQuantity(room.id, selected.quantity - 1);
    }
  };

  const totalGuests = searchParams.adults + searchParams.children;

  return (
    <HotelBookingShell activeStep={1} maxWidth="7xl">
      <div className="font-sans pb-24 w-full">
        <HotelSearchSummaryBar />
        {/* Top Gallery Section */}
        <div className="mb-8 rounded-3xl overflow-hidden bg-white/70 backdrop-blur-xl p-2.5 shadow-[0_8px_32px_rgba(15,23,42,0.08)] border border-white/80">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-[400px]">
            {/* Main Left Image */}
            <div className="md:col-span-2 rounded-2xl overflow-hidden relative group cursor-pointer" onClick={() => setIsGalleryOpen(true)}>
              {hotel.images?.[0] ? (
                <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center"><BedDouble className="w-16 h-16 text-slate-400"/></div>
              )}
              {/* Mobile View All Photos Overlay */}
              <div className="absolute bottom-4 right-4 md:hidden z-10">
                <div className="bg-black/60 backdrop-blur-md border border-white/20 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm shadow-lg">
                  <Images className="w-4 h-4" /> View Photos
                </div>
              </div>
            </div>
            {/* Right Stacked Images */}
            <div className="hidden md:flex flex-col gap-2 h-full">
              <div className="flex-1 min-h-0 rounded-2xl overflow-hidden relative group">
                {hotel.images?.[1] ? (
                  <img src={hotel.images[1]} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-slate-200" />
                )}
              </div>
              <div className="flex-1 min-h-0 rounded-2xl overflow-hidden relative group cursor-pointer">
                {hotel.images?.[2] ? (
                  <img src={hotel.images[2]} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-slate-200" />
                )}
                {/* View All Photos Overlay */}
                <div 
                  className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity hover:bg-black/50 cursor-pointer z-10"
                  onClick={() => setIsGalleryOpen(true)}
                >
                  <div className="bg-white/20 backdrop-blur-md border border-white/40 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2">
                    <Images className="w-5 h-5" /> View All Photos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Info Banner */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-[0_8px_32px_rgba(15,23,42,0.08)] border border-white/70">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: hotel.starRating || 0 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-[11px] font-bold text-[#00477f] uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">{hotel.propertyType || 'Hotel'}</span>
            </div>
            <h1 className="text-[28px] md:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{hotel.name}</h1>
            <p className="text-slate-600 flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="w-4 h-4 text-[#00477f]" />
              {hotel.location} {hotel.distance && <span className="text-slate-400 font-normal">| {hotel.distance}</span>}
              <span className="text-[#00477f] font-bold cursor-pointer hover:underline ml-2 hidden sm:inline">Show on Map</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About the Property */}
            <section className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] border border-white/70">
              <h2 className="text-xl font-bold text-slate-900 mb-4 tracking-tight">About the Property</h2>
              <div 
                className={`text-slate-600 leading-relaxed text-sm [&>p]:mb-3 [&>br]:mb-2 [&>b]:font-bold [&>strong]:font-bold ${showMoreAbout ? '' : 'line-clamp-3'}`}
                dangerouslySetInnerHTML={{ 
                  __html: hotel.description || `The ${hotel.name} stands as a beacon of luxury and sustainability, located at the heart of the vibrant cityscape. Its commitment to eco-friendly practices is seamlessly integrated with its opulent design, making it an architectural gem. Noteworthy for its award-winning services, sweeping views, and world-class dining options, ensuring an unforgettable stay.`
                }}
              />
              <button 
                onClick={() => setShowMoreAbout(!showMoreAbout)}
                className="text-[#00477f] font-bold text-sm mt-3 flex items-center gap-0.5 hover:gap-1.5 transition-all hover:underline"
              >
                {showMoreAbout ? 'Show less' : 'Show more'} <ChevronRight className={`w-4 h-4 transition-transform ${showMoreAbout ? '-rotate-90' : 'rotate-90'}`} />
              </button>
            </section>

            {/* Experience & Amenities */}
            <section className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.06)] border border-white/70">
              <h2 className="text-xl font-bold text-slate-900 mb-6 tracking-tight">Experience & Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
                {hotel.amenities.slice(0, showAllAmenities ? hotel.amenities.length : 8).map((am, i) => (
                  <div key={i} className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                    <span className="text-[#00477f] shrink-0 flex items-center justify-center w-9 h-9 rounded-xl bg-blue-50 border border-blue-100">
                      {getAmenityIcon(am, 'lg')}
                    </span>
                    <span className="leading-tight pt-0.5">{am}</span>
                  </div>
                ))}
              </div>
              {hotel.amenities.length > 8 && (
                <button 
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="text-[#00477f] font-bold text-sm mt-6 flex items-center gap-0.5 hover:gap-1.5 transition-all hover:underline"
                >
                  {showAllAmenities ? 'Show Less' : `Show All ${hotel.amenities.length} Amenities`} <ChevronRight className={`w-4 h-4 transition-transform ${showAllAmenities ? '-rotate-90' : 'rotate-90'}`} />
                </button>
              )}
            </section>

            {/* Choose Your Room */}
            <section id="rooms-list" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">Choose Your Room</h2>
              
              <div className="flex flex-col gap-6">
                {rooms.map((room, index) => {
                  const selected = getSelectedRoom(room.id);
                  // Always show the full payable total (base + taxes) — same formula
                  // used by the hotel card on results page and every subsequent step.
                  const totalStay = room.price + (room.taxesAndFees ?? 0);
                  const roomImage = room.images?.[0] || hotel.images?.[(index + 1) % (hotel.images.length || 1)];
                  const bookingCode = (room as any)._bookingCode ?? room.id ?? '';
                  const preBook = roomPreBooks[bookingCode];
                  const isPreBookLoading = preBookingRoomIds.has(bookingCode);
                  
                  return (
                    <article
                      key={room.id}
                      className={`flex flex-col md:flex-row overflow-hidden rounded-3xl border transition-all duration-300 ${
                        selected
                          ? 'border-[#003580] shadow-[0_12px_36px_rgba(0,53,128,0.18)] bg-gradient-to-br from-blue-50/50 to-white ring-2 ring-[#003580]/30'
                          : 'border-slate-200/80 bg-white/70 backdrop-blur-sm hover:border-slate-300 hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)] hover:-translate-y-0.5'
                      }`}
                    >
                      {/* Left Side: Room Image */}
                      <div className="w-full md:w-[280px] lg:w-[320px] shrink-0 bg-slate-100 h-64 md:h-auto relative border-b md:border-b-0 md:border-r border-slate-100">
                        {roomImage ? (
                          <img src={roomImage} alt={room.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <BedDouble className="w-12 h-12" />
                          </div>
                        )}
                        {room.size > 0 && (
                          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 shadow-md flex items-center gap-1.5 border border-white">
                            <Maximize2 className="w-3.5 h-3.5" /> {room.size} sq.ft
                          </div>
                        )}
                      </div>

                      {/* Right Side: Content */}
                      <div className="flex-1 p-5 md:p-6 flex flex-col relative">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">{room.name}</h3>
                          <div className="flex flex-col items-end gap-1.5 shrink-0 relative z-10">
                            {index === 0 && <span className="bg-gradient-to-r from-blue-600 to-[#00477f] text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest shadow-md shadow-blue-900/20">Top Pick</span>}
                          </div>
                        </div>
                        
                        <div className="text-sm text-slate-600 mb-5 font-medium">
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-2.5 py-1 text-xs font-bold">
                            <CheckCircle className="w-3.5 h-3.5" /> {room.mealPlanLabel || 'Room Only'}
                          </span>
                        </div>

                        {/* Cancellation Policy — enriched with prebook data in background */}
                        <CancellationBadge
                          room={room}
                          preBook={preBook}
                          loading={isPreBookLoading}
                        />

                        {/* Mandatory Tax Box */}
                        {room.additionalCharges ? (
                          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-3.5 shadow-sm max-w-md">
                            <div className="flex items-start gap-2 mb-2.5">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <span className="text-xs font-bold text-amber-900 leading-tight">
                                Mandatory extra charges – payable directly to the hotel at check-in/check-out
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-amber-800 ml-6 bg-white px-3 py-2 rounded-xl border border-amber-100">
                              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"/> Mandatory Tax</span>
                              <span>{room.additionalChargesCurrency || currencyCode} {room.additionalCharges}</span>
                            </div>
                          </div>
                        ) : null}

                        {/* Card Footer */}
                        <div className="mt-auto pt-5 border-t border-slate-100 flex items-end justify-between">
                          <div>
                            <div className="text-3xl font-black bg-gradient-to-r from-[#003580] to-[#00477f] bg-clip-text text-transparent tracking-tighter leading-none mb-1">{convert(totalStay)}</div>
                            <div className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                              {nights} Night{nights !== 1 ? 's' : ''} · incl. taxes &amp; fees
                            </div>
                          </div>

                          {/* Counter / Select button */}
                          {selected ? (
                            <div className="flex items-center gap-3">
                              {/* Decrement */}
                              <button
                                type="button"
                                onClick={() => handleDecrement(room)}
                                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-slate-600 hover:border-[#003580] hover:text-[#003580] hover:shadow-md transition-all"
                              >
                                <Minus className="w-4 h-4" />
                              </button>

                              {/* Count + label */}
                              <div className="text-center min-w-[40px]">
                                <div className="text-xl font-black text-[#003580] leading-none">{selected.quantity}</div>
                                <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">
                                  {selected.quantity === 1 ? 'room' : 'rooms'}
                                </div>
                              </div>

                              {/* Increment */}
                              <button
                                type="button"
                                onClick={() => handleIncrement(room)}
                                disabled={totalRoomsSelected >= roomsNeeded}
                                className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#003580] bg-gradient-to-br from-[#003580] to-[#00295c] text-white shadow-md shadow-blue-900/25 hover:shadow-lg hover:shadow-blue-900/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <Button
                              size="lg"
                              disabled={totalRoomsSelected >= roomsNeeded}
                              className="bg-gradient-to-r from-[#00477f] to-[#003580] hover:opacity-90 rounded-2xl font-bold px-8 shadow-lg shadow-blue-900/25 disabled:opacity-40 transition-opacity"
                              onClick={() => handleIncrement(room)}
                            >
                              Select Room &rarr;
                            </Button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Sticky Sidebar */}
          <div className="relative hidden lg:block">
            <div className="sticky top-24 space-y-6">
              
              {/* Sticky Booking Card */}
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-[0_10px_36px_rgba(15,23,42,0.10)] border border-white/70 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-blue-50/60 to-white">
                  <div className="text-xs font-bold text-slate-500 tracking-wide uppercase mb-1">Starting from</div>
                  <div className="text-3xl font-black bg-gradient-to-r from-[#003580] to-[#00477f] bg-clip-text text-transparent tabular-nums tracking-tighter mb-1">
                    {convert(lowestRoomTotal)}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mb-4">
                    {nights > 1 ? `for ${nights} nights · incl. taxes` : 'incl. taxes & fees'}
                  </div>
                  <Button fullWidth size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:opacity-90 font-bold rounded-2xl text-base shadow-lg shadow-orange-600/25 transition-opacity" onClick={scrollToRooms}>
                    View Rooms &rarr;
                  </Button>
                </div>
                
                {/* Mini Location Map inside booking card */}
                <div className="p-4 border-b border-slate-100">
                  <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                    <Map className="w-4 h-4 text-[#00477f]" /> Location
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + hotel.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-2xl overflow-hidden mb-3 relative h-32 bg-slate-100 border border-slate-200 cursor-pointer group shadow-sm"
                  >
                    <iframe 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(hotel.name + ' ' + hotel.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      width="100%" 
                      height="100%" 
                      style={{ border: 0, pointerEvents: 'none' }} 
                      allowFullScreen={false} 
                      loading="lazy"
                      className="opacity-80 group-hover:opacity-100 transition"
                    ></iframe>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white p-2 rounded-full shadow-lg text-red-500 transform group-hover:scale-110 transition pointer-events-none">
                        <MapPin className="w-5 h-5 fill-red-50" />
                      </div>
                    </div>
                  </a>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {hotel.location}
                  </p>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hotel.name + ' ' + hotel.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00477f] font-bold text-xs mt-2 flex items-center hover:underline"
                  >
                    Get Directions <Navigation className="w-3 h-3 ml-1" />
                  </a>
                </div>

                <div className="p-4 bg-slate-50/80">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Check-in</span>
                    <span className="font-bold text-slate-900">{hotel.checkInTime || '2:00 PM'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-500 font-medium">Check-out</span>
                    <span className="font-bold text-slate-900">{hotel.checkOutTime || '12:00 PM'}</span>
                  </div>
                </div>
              </div>

              {/* Need Help Banner (Sidebar version) */}
              <div className="bg-gradient-to-br from-[#00477f] to-blue-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-blue-900/20">
                <div className="absolute -top-4 -right-4 p-4 opacity-10">
                  <MessageCircle className="w-32 h-32" />
                </div>
                <h3 className="text-xl font-bold mb-2 relative z-10 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-300" /> Need help?
                </h3>
                <p className="text-blue-100 text-sm mb-5 relative z-10 leading-relaxed font-medium">
                  Our travel team is available 24/7 to assist with your booking and queries.
                </p>
                <a href="mailto:hello@plumtrips.com" className="inline-flex items-center justify-center w-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors rounded-xl py-2.5 text-white font-bold text-sm relative z-10">
                  hello@plumtrips.com
                </a>
              </div>

            </div>
          </div>
        </div>

      {/* Floating Bottom Right Support Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-14 h-14 bg-gradient-to-br from-[#00477f] to-blue-800 hover:from-blue-800 hover:to-[#00477f] text-white rounded-full shadow-2xl shadow-blue-900/30 flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Checkout Sticky Bottom Bar (Only visible when rooms are selected) */}
      {totalRoomsSelected > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/70 bg-white/90 backdrop-blur-xl p-4 shadow-[0_-12px_40px_rgba(15,23,42,0.12)]">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4">
            <div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Your Selection</div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-black bg-gradient-to-r from-[#003580] to-[#00477f] bg-clip-text text-transparent tracking-tight leading-none">{convert(totalPrice)}</div>
                <div className="text-sm font-medium text-slate-500 mb-0.5">
                  {roomsNeeded > 1
                    ? `${totalRoomsSelected} of ${roomsNeeded} rooms • ${nights} night${nights !== 1 ? 's' : ''}`
                    : `${totalRoomsSelected} room${totalRoomsSelected !== 1 ? 's' : ''} • ${nights} night${nights !== 1 ? 's' : ''}`
                  }
                </div>
              </div>
              {totalRoomsSelected < roomsNeeded && (
                <div className="text-xs text-amber-600 font-medium mt-1">
                  Select {roomsNeeded - totalRoomsSelected} more room{roomsNeeded - totalRoomsSelected !== 1 ? 's' : ''} to proceed
                </div>
              )}
            </div>
            
            <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
              {supplierPriceChanged && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm w-full sm:w-[350px] mb-2 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-amber-900">Price Updated by Hotel</div>
                      <div className="text-xs text-amber-800 mt-1">
                        The hotel has updated their rates since you started your search. Please acknowledge the new price to continue.
                      </div>
                      <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-amber-900 font-medium">
                        <input
                          type="checkbox"
                          checked={priceChangeAcknowledged}
                          onChange={(e) => setPriceChangeAcknowledged(e.target.checked)}
                          className="mt-0.5 rounded border-amber-400 text-amber-600 focus:ring-amber-500 bg-white"
                        />
                        I accept the updated price
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <Button
                size="lg"
                onClick={() => {
                  if (supplierPriceChanged) {
                    if (!priceChangeAcknowledged) {
                      toast.error('Please acknowledge the price change to continue.');
                      return;
                    }
                    navigate('/hotels/guest-details');
                  } else {
                    handleBookNow();
                  }
                }}
                disabled={totalRoomsSelected < searchParams.rooms || preBookingSubmit}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-emerald-600 hover:opacity-90 disabled:opacity-60 text-white font-bold rounded-2xl px-10 shadow-lg shadow-emerald-600/25 text-lg transition-opacity"
              >
                {preBookingSubmit ? (
                  <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...</>
                ) : totalRoomsSelected < searchParams.rooms ? (
                  `Select ${searchParams.rooms - totalRoomsSelected} More Room${searchParams.rooms - totalRoomsSelected !== 1 ? 's' : ''}`
                ) : supplierPriceChanged ? (
                  'Continue with New Price'
                ) : (
                  'Book Now'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* Fullscreen Photo Gallery Modal */}
      {isGalleryOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-in fade-in duration-300">
          <div className="p-4 flex justify-between items-center bg-black/50 sticky top-0 z-10 backdrop-blur-md">
            <h3 className="text-white font-bold text-lg">{hotel.name} - Photos</h3>
            <button 
              onClick={() => setIsGalleryOpen(false)}
              className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-6xl mx-auto columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
              {hotel.images?.map((img, i) => (
                <div key={i} className="break-inside-avoid rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                  <img src={img} alt={`${hotel.name} photo ${i + 1}`} className="w-full h-auto object-cover hover:opacity-90 transition" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

    </HotelBookingShell>
  );
}