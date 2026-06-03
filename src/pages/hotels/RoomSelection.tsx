import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BedDouble, Users, Maximize2, Eye,
  CheckCircle, XCircle, Shield, Plus, Minus, Loader2, AlertTriangle,
  UtensilsCrossed, Tag, Sparkles, LayoutGrid, List
} from 'lucide-react';
import { useHotelStore } from '../../stores/hotelStore';
import { useHotelRooms } from '../../hooks/useHotelApi';
import type { Room } from '../../stores/hotelStore';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { formatCurrency, calculateNights } from '../../lib/utils';
import toast from 'react-hot-toast';
import HotelBookingShell from '../../components/hotels/HotelBookingShell';
import HotelGallery from '../../components/hotels/HotelGallery';

function RoomCardHero({
  hotelImage,
  refundable,
  discountPct,
}: {
  hotelImage?: string;
  refundable: boolean;
  discountPct: number | null;
}) {
  return null; // Removed as requested for compact view
}

function RoomSpecChips({ room, searchGuestsLine }: { room: Room; searchGuestsLine: string }) {
  const chips: { icon: React.ReactNode; label: string }[] = [
    { icon: <BedDouble className="h-4 w-4" />, label: room.bedType },
    { icon: <Users className="h-4 w-4" />, label: room.occupancy },
  ];
  if (room.size > 0) {
    chips.push({
      icon: <Maximize2 className="h-4 w-4" />,
      label: `${room.size} sq ft`,
    });
  }
  if (room.view) {
    chips.push({ icon: <Eye className="h-4 w-4" />, label: room.view });
  }

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c, i) => (
        <div
          key={i}
          className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700"
        >
          <span className="shrink-0 text-slate-400">{c.icon}</span>
          <span className="truncate">{c.label}</span>
        </div>
      ))}
      <div className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-dashed border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-500">
        <Sparkles className="h-4 w-4 shrink-0 text-amber-500" />
        <span className="truncate">{searchGuestsLine}</span>
      </div>
    </div>
  );
}

function InclusionList({ items }: { items: string[] }) {
  const shown = items.slice(0, 6);
  const rest = items.length - shown.length;
  if (shown.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-slate-500">
        Rate includes the room and board options shown above. Full details appear at checkout.
      </p>
    );
  }
  return (
    <ul className="space-y-1.5">
      {shown.map((a, i) => (
        <li key={i} className="flex gap-2 text-sm text-slate-700">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span className="leading-snug">{a}</span>
        </li>
      ))}
      {rest > 0 && (
        <li className="pl-6 text-xs font-medium text-slate-500">+ {rest} more inclusion{rest !== 1 ? 's' : ''}</li>
      )}
    </ul>
  );
}

export default function RoomSelection() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { searchParams, selectedRooms, addRoom, removeRoom, updateRoomQuantity, selectedHotel, searchResultsMap, clearRooms } = useHotelStore();
  const { rooms, loading, error, loadRoomsFromResult } = useHotelRooms();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const nights = calculateNights(searchParams.checkIn, searchParams.checkOut) || 1;
  const heroImage = selectedHotel?.images?.[0];

  const searchGuestsLine = [
    `${searchParams.adults} adult${searchParams.adults !== 1 ? 's' : ''}`,
    searchParams.children > 0
      ? `${searchParams.children} child${searchParams.children !== 1 ? 'ren' : ''}`
      : null,
    `${searchParams.rooms} room${searchParams.rooms !== 1 ? 's' : ''} booked`,
  ]
    .filter(Boolean)
    .join(' · ');

  useEffect(() => {
    if (!id) { navigate('/hotels/results'); return; }
    const rawResult = searchResultsMap[id];
    if (rawResult) {
      clearRooms();
      loadRoomsFromResult(rawResult);
    } else {
      navigate('/hotels/results');
    }
  }, [id]);

  const hotel = selectedHotel;

  if (!hotel) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Hotel not found</h2>
          <button onClick={() => navigate('/hotels/results')} className="mt-4 text-orange-500 hover:underline">
            Back to results
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#003580]" />
          <p className="text-gray-600">Loading available rooms…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-orange-400" />
          <h2 className="mb-2 text-xl font-bold text-gray-900">Could not load rooms</h2>
          <p className="mb-4 text-gray-500">{error}</p>
          <Button onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

  const getSelectedRoom = (roomId: string) => selectedRooms.find(r => r.id === roomId);

  const totalPrice = selectedRooms.reduce((sum, r) => sum + (r.price + r.taxesAndFees) * r.quantity, 0);
  const totalRoomsSelected = selectedRooms.reduce((sum, r) => sum + r.quantity, 0);

  const handleAddRoom = (room: Room) => {
    addRoom(room);
  };

  const handleProceed = () => {
    if (selectedRooms.length === 0) {
      toast.error('Please select at least one room');
      return;
    }
    navigate('/hotels/guest-details');
  };

  return (
    <HotelBookingShell
      activeStep={1}
      maxWidth="7xl"
      title={hotel.name}
      subtitle={`${nights} night${nights !== 1 ? 's' : ''}`}
      onBack={() => navigate(`/hotels/${id}`)}
    >
      <div className="mx-auto max-w-7xl px-4 py-8">
        
        {/* Hotel Details Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">{hotel.name}</h1>
          <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
            <span className="flex items-center gap-1">
              {Array.from({ length: hotel.starRating || 0 }).map((_, i) => (
                <Sparkles key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
              ))}
            </span>
            {hotel.location && (
              <>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>{hotel.location}</span>
              </>
            )}
          </div>
          
          <HotelGallery images={hotel.images || []} />

          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Hotel Amenities</h2>
              <div className="flex flex-wrap gap-2">
                {(showAllAmenities ? hotel.amenities : hotel.amenities.slice(0, 15)).map((am, i) => (
                  <span key={i} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-medium hover:bg-slate-200 transition-colors cursor-default">
                    {am}
                  </span>
                ))}
                {hotel.amenities.length > 15 && (
                  <button 
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    {showAllAmenities ? 'View Less' : `+ ${hotel.amenities.length - 15} More`}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mb-8 border-t border-slate-200 pt-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Choose your room</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Rates below are for your entire stay ({nights} night{nights !== 1 ? 's' : ''}), including taxes. Select a
            rate to continue—details match what the property confirmed in search.
          </p>
        </div>

        <div className="mb-6 flex justify-end">
          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-gray-100 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <List className="h-4 w-4" />
              List
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-4 max-w-4xl mx-auto">
            {rooms.map(room => {
              const selected = getSelectedRoom(room.id);
              const totalStay = room.price + room.taxesAndFees;
              const perNight = nights > 0 ? Math.round(totalStay / nights) : totalStay;
              const discountPct =
                room.originalPrice && room.originalPrice > totalStay
                  ? Math.round(((room.originalPrice - totalStay) / room.originalPrice) * 100)
                  : null;

              return (
                <article
                  key={room.id}
                  className={`flex flex-col sm:flex-row gap-4 p-4 rounded-xl border bg-white transition-shadow ${
                    selected
                      ? 'border-[#003580] ring-1 ring-[#003580]/20 shadow-md bg-blue-50/10'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                      <h2 className="text-lg font-bold text-slate-900">{room.name}</h2>
                      <div className="flex gap-2">
                        {room.cancellationPolicy.toLowerCase().includes('free') && (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                            Free Cancellation
                          </span>
                        )}
                        {discountPct != null && discountPct > 0 && (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700">
                            {discountPct}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                    {room.roomSubtitle && (
                      <p className="mb-3 text-sm text-slate-600">{room.roomSubtitle}</p>
                    )}

                    <RoomSpecChips room={room} searchGuestsLine={searchGuestsLine} />
                    
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {room.mealPlanLabel && (
                        <span className="font-medium text-amber-700">
                          {room.mealPlanLabel}
                        </span>
                      )}
                      {room.amenities.slice(0, 3).map((am, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-slate-300">•</span>}
                          {am}
                        </span>
                      ))}
                      {room.amenities.length > 3 && <span>+{room.amenities.length - 3} more</span>}
                    </div>
                  </div>

                  <div className="flex flex-col items-start sm:items-end justify-between sm:w-56 border-t sm:border-t-0 sm:border-l border-slate-100 pt-3 sm:pt-0 sm:pl-4">
                    <div className="mb-3 sm:mb-0 w-full sm:text-right">
                      {room.originalPrice != null && room.originalPrice > totalStay && (
                        <div className="text-xs text-slate-400 line-through">
                          {formatCurrency(room.originalPrice)}
                        </div>
                      )}
                      <div className="text-xl font-bold tabular-nums text-slate-900">
                        {formatCurrency(totalStay)}
                      </div>
                      <div className="text-xs text-slate-500">
                        Total for {nights} night{nights !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <div className="w-full">
                      {selected ? (
                        <div className="flex items-center justify-between sm:justify-end gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (selected.quantity <= 1) removeRoom(room.id);
                                else updateRoomQuantity(room.id, selected.quantity - 1);
                              }}
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{selected.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateRoomQuantity(room.id, selected.quantity + 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <Button fullWidth size="sm" onClick={() => handleAddRoom(room)}>
                          Select
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {totalRoomsSelected > 0 ? (
              <>
                <div className="text-2xl font-bold tabular-nums text-slate-900">{formatCurrency(totalPrice)}</div>
                <div className="text-xs text-slate-500">
                  {totalRoomsSelected} room{totalRoomsSelected !== 1 ? 's' : ''} · {nights} night{nights !== 1 ? 's' : ''}{' '}
                  · incl. taxes
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500">Select a room to see your total</div>
            )}
          </div>
          <Button
            size="lg"
            onClick={handleProceed}
            disabled={selectedRooms.length === 0}
            className="w-full min-w-[200px] sm:w-auto sm:min-w-48"
          >
            Continue to guest details
          </Button>
        </div>
      </div>
    </HotelBookingShell>
  );
}