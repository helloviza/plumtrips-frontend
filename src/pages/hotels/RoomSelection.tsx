import { useState, useEffect } from 'react';
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

function RoomCardHero({
  hotelImage,
  refundable,
  discountPct,
}: {
  hotelImage?: string;
  refundable: boolean;
  discountPct: number | null;
}) {
  return (
    <div className="relative h-44 overflow-hidden bg-slate-900 sm:h-48">
      {hotelImage ? (
        <>
          <img
            src={hotelImage}
            alt=""
            className="h-full w-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        </>
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-slate-700 via-slate-800 to-slate-900" />
      )}
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.07]">
        <BedDouble className="h-32 w-32 text-white" />
      </div>
      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
        {refundable && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/95 px-2.5 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-sm">
            <Shield className="h-3.5 w-3.5" />
            Refundable rate
          </span>
        )}
        {discountPct != null && discountPct > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            <Tag className="h-3.5 w-3.5" />
            {discountPct}% off
          </span>
        )}
      </div>
    </div>
  );
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
    toast.success(`${room.name} added!`);
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Choose your room</h1>
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

        <div className={viewMode === 'grid' ? "grid gap-6 lg:grid-cols-2 xl:grid-cols-2" : "flex flex-col gap-6 max-w-4xl mx-auto"}>
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
                  className={`flex flex-col overflow-hidden rounded-2xl border bg-white shadow-md transition-shadow ${
                    selected
                      ? 'border-[#003580] ring-2 ring-[#003580]/25 shadow-lg'
                      : 'border-slate-200/90 hover:border-slate-300 hover:shadow-lg'
                  }`}
                >
                  <RoomCardHero
                    hotelImage={heroImage}
                    refundable={room.cancellationPolicy.toLowerCase().includes('free')}
                    discountPct={discountPct}
                  />

                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <div className="mb-4">
                      <h2 className="text-lg font-bold leading-snug text-slate-900 sm:text-xl">{room.name}</h2>
                      {room.roomSubtitle && (
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{room.roomSubtitle}</p>
                      )}
                    </div>

                    {room.mealPlanLabel && (
                      <div className="mb-4 flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/80">
                          <UtensilsCrossed className="h-3.5 w-3.5" />
                          {room.mealPlanLabel}
                        </span>
                        {room.breakfast && !room.mealPlanLabel?.toLowerCase().includes('breakfast') && (
                          <Badge variant="success" className="font-normal">
                            Breakfast
                          </Badge>
                        )}
                      </div>
                    )}

                    <RoomSpecChips room={room} searchGuestsLine={searchGuestsLine} />

                    <div className="my-5 border-t border-slate-100" />

                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      What&apos;s included
                    </div>
                    <div className="mb-5 min-h-18 rounded-xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
                      <InclusionList items={room.amenities} />
                    </div>

                    <div className="mb-5 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm">
                      {room.cancellationPolicy.toLowerCase().includes('free') ? (
                        <>
                          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <span className="text-slate-700">{room.cancellationPolicy}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                          <span className="text-slate-700">Non-refundable rate — best for fixed plans.</span>
                        </>
                      )}
                    </div>

                    <div className="mt-auto border-t border-slate-100 pt-5">
                      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                        <div>
                          {room.originalPrice != null && room.originalPrice > totalStay && (
                            <div className="text-sm text-slate-400 line-through">
                              {formatCurrency(room.originalPrice)}
                            </div>
                          )}
                          <div className="text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl">
                            {formatCurrency(totalStay)}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Total stay · incl. {formatCurrency(room.taxesAndFees)} taxes & fees
                          </div>
                          <div className="text-xs text-slate-400">≈ {formatCurrency(perNight)} / night</div>
                        </div>
                      </div>

                      {selected ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center justify-center gap-3 rounded-xl bg-slate-50 py-2 sm:justify-start sm:py-0">
                            <button
                              type="button"
                              onClick={() => {
                                if (selected.quantity <= 1) removeRoom(room.id);
                                else updateRoomQuantity(room.id, selected.quantity - 1);
                              }}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                              aria-label="Decrease rooms"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-[2ch] text-center text-lg font-bold tabular-nums text-slate-900">
                              {selected.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateRoomQuantity(room.id, selected.quantity + 1)}
                              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50"
                              aria-label="Increase rooms"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex flex-1 flex-col items-stretch gap-2 sm:items-end">
                            <span className="text-center text-sm font-semibold text-emerald-700 sm:text-right">
                              Selected for your trip
                            </span>
                            <Button
                              variant="outline"
                              fullWidth
                              className="sm:max-w-[200px] sm:ml-auto"
                              onClick={() => removeRoom(room.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button fullWidth size="lg" onClick={() => handleAddRoom(room)}>
                          Add this room
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