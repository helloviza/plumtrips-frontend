// import { useCurrency } from '../../hooks/useCurrency';
import { formatINR } from '../../lib/flights_api';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle, Calendar, MapPin, Users, Clock,
  Download, Share2, RotateCcw, Star, Phone, Mail,
  Loader2, XCircle
} from 'lucide-react';
import { useHotelStore } from '../../stores/hotelStore';
import Button from '../../components/ui/Button';
import { formatDate, calculateNights } from '../../lib/utils';
import {
  getConfirmedOnlinePayable,
  getRoomOnlinePayable,
  getRoomsPayAtHotelTotal,
  getRoomsPriceBreakdown,
} from '../../lib/hotelPricing';
import { getHotelBookingDetail, cancelHotel } from '../../hooks/useHotelApi';
import toast from 'react-hot-toast';

const POLL_DELAY_MS = 120_000; // 2 minutes — per spec

export default function BookingConfirmation() {
  //const { formatINR: formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const {
    bookingId: storeBookingId,
    confirmationNo: storeConfirmationNo,
    pnr: storePnr,
    selectedHotel, selectedRooms,
    guests, searchParams, user, resetBooking, setBookingDetail,
    confirmedPaidAmount, preBookResponse, preBookResponses,
  } = useHotelStore();

  // Read localStorage SYNCHRONOUSLY in the useState initializer — this runs
  // before the first render, so the "No booking found" guard never fires
  // while waiting for a useEffect.
  const [localBookingId] = useState<string | null>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('hotel-booking-storage') || '{}');
      return stored?.state?.bookingId || null;
    } catch { return null; }
  });
  const [localConfirmationNo] = useState<string | null>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('hotel-booking-storage') || '{}');
      return stored?.state?.confirmationNo || null;
    } catch { return null; }
  });
  const [localPnr] = useState<string | null>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('hotel-booking-storage') || '{}');
      return stored?.state?.pnr || null;
    } catch { return null; }
  });

  // Prefer live store value; fall back to what we read from localStorage
  const bookingId = storeBookingId || localBookingId;
  const confirmationNo = storeConfirmationNo || localConfirmationNo;
  const pnr = storePnr || localPnr;

  const nights = calculateNights(searchParams.checkIn, searchParams.checkOut) || 1;
  const roomBreakdown = getRoomsPriceBreakdown(selectedRooms);
  const confirmedBreakdown = getConfirmedOnlinePayable(
    preBookResponse,
    selectedRooms,
    preBookResponses.length > 1 ? preBookResponses : undefined
  );
  const payAtHotelTotal = getRoomsPayAtHotelTotal(selectedRooms);
  const totalPaid =
    confirmedPaidAmount ??
    confirmedBreakdown.totalPayable ??
    roomBreakdown.totalPayable;

  // ── Booking detail state ──────────────────────────────────────────────────
  const [detailLoading, setDetailLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<string>('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch booking detail on mount ─────────────────────────────────────────
  const fetchDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const detail = await getHotelBookingDetail(id);
      setBookingDetail(detail);
      const status =
        detail?.HotelBookingStatus ??
        detail?.BookingStatus ??
        detail?.status ??
        'Confirmed';
      setBookingStatus(String(status));
      if (String(status).toLowerCase() === 'pending') {
        pollTimerRef.current = setTimeout(() => fetchDetail(id), POLL_DELAY_MS);
      }
    } catch (err: any) {
      console.warn('[BookingDetail] fetch failed (non-critical):', err?.message);
      setBookingStatus('Confirmed');
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    if (bookingId) {
      fetchDetail(bookingId);
    }
    return () => {
      if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
    };
  }, [bookingId]);

  // ── Cancel booking ────────────────────────────────────────────────────────
  const handleCancel = async () => {
    if (!bookingId) {
      toast.error('No booking ID found');
      return;
    }
    
    setCancelLoading(true);
    try {
      console.log('🚫 Cancelling booking:', bookingId);
      const result = await cancelHotel(bookingId, 4);
      console.log('✅ Cancel response:', result);
      
      setCancelled(true);
      setBookingStatus('Cancelled');
      toast.success('Booking cancelled successfully.');
      setCancelConfirm(false);
    } catch (err: any) {
      console.error('❌ Cancel error:', err);
      toast.error(err?.message ?? 'Cancellation failed. Please contact support.');
    } finally {
      setCancelLoading(false);
    }
  };

  // ── Download E-Ticket/Voucher ─────────────────────────────────────────────
  const handleDownload = () => {
    const id = bookingId ?? pnr ?? confirmationNo;
    if (!id) {
      toast.error('No booking reference found');
      return;
    }
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    window.open(`${base}/api/v1/hotels/voucher/${id}`, '_blank', 'noopener,noreferrer');
  };

  const handleAddToCalendar = () => {
    if (!searchParams.checkIn || !searchParams.checkOut || !selectedHotel) return;
    const ci = searchParams.checkIn instanceof Date ? searchParams.checkIn : new Date(searchParams.checkIn);
    const co = searchParams.checkOut instanceof Date ? searchParams.checkOut : new Date(searchParams.checkOut);
    const start = ci.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = co.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const title = encodeURIComponent(`Hotel Stay: ${selectedHotel.name}`);
    const details = encodeURIComponent(`Booking ID: ${bookingId}\nGuests: ${guests.length}`);
    const location = encodeURIComponent(selectedHotel.location);
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`;
    window.open(url, '_blank');
  };

  const handleShare = () => {
    const text = `I just booked ${selectedHotel?.name}! Booking ID: ${bookingId}`;
    if (navigator.share) {
      navigator.share({ title: 'Hotel Booking', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      toast.success('Booking details copied!');
    }
  };

  const handleBookAgain = () => {
    resetBooking();
    navigate('/hotels');
  };

  // If bookingId is still null after 3 seconds, the booking genuinely wasn't made
  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    if (bookingId) return;
    const t = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, [bookingId]);

  if (!bookingId) {
    if (!timedOut) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#003580]" />
            <p className="mt-2 text-sm text-gray-500">Loading booking details…</p>
          </div>
        </div>
      );
    }
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">No booking found</h2>
          <p className="mt-2 text-sm text-gray-500">Your booking may not have completed.</p>
          <button onClick={() => navigate('/hotels')} className="mt-4 text-orange-500 hover:underline">
            Search Hotels
          </button>
        </div>
      </div>
    );
  }

  const isPending = bookingStatus.toLowerCase() === 'pending';
  const isCancelled = cancelled || bookingStatus.toLowerCase().includes('cancel');
  const displayStatus = cancelled ? 'Cancelled' : bookingStatus || 'Confirmed';

  return (
    <div className="min-h-screen bg-[#f5f7fa] py-8">
      <div className="mx-auto max-w-2xl px-4">

        {/* ── Status Header ── */}
        <div className="mb-8 text-center">
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
            isCancelled ? 'bg-red-100' : isPending ? 'bg-yellow-100' : 'bg-green-100'
          }`}>
            {isCancelled ? (
              <XCircle className="h-12 w-12 text-red-500" />
            ) : isPending ? (
              <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
            ) : (
              <CheckCircle className="h-12 w-12 text-green-500" />
            )}
          </div>
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {isCancelled ? 'Booking Cancelled' : isPending ? 'Booking Pending' : 'Booking Confirmed!'}
          </h1>
          <p className="text-gray-500">
            {isCancelled
              ? 'Your booking has been cancelled.'
              : isPending
              ? 'Your booking is being processed. We\'ll update you in a few minutes.'
              : 'Your hotel has been successfully booked'}
          </p>
          {isPending && (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-yellow-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking status automatically…
            </div>
          )}
        </div>

        {/* ── Booking ID ── */}
        <div className="mb-6 rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 p-5 text-center">
          <div className="text-sm text-gray-500">PNR (Booking Reference)</div>
          <div className="mt-1 text-3xl font-bold tracking-widest text-orange-600">
            {pnr || confirmationNo || bookingId}
          </div>
          {confirmationNo && (
            <div className="mt-1 text-xs text-gray-400">Confirmation No: {confirmationNo}</div>
          )}
          {bookingId && (
            <div className="mt-1 text-xs text-gray-400">Booking ID: {bookingId}</div>
          )}
          <div className="mt-2 text-xs text-gray-400">Save this for your records</div>
        </div>

        {/* ── Booking detail loading/error ── */}
        {detailLoading && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading booking details…
          </div>
        )}


        {/* ── Hotel Details ── */}
        {selectedHotel && (
          <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="relative h-40">
              <img
                src={selectedHotel.images[0]}
                alt={selectedHotel.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white">
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: selectedHotel.starRating }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <h2 className="text-xl font-bold">{selectedHotel.name}</h2>
                <div className="flex items-center gap-1 text-sm text-white/80">
                  <MapPin className="h-3 w-3" />
                  {selectedHotel.location}
                </div>
              </div>
            </div>

            <div className="p-5">
              {/* Status badge */}
              {displayStatus && (
                <div className={`mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium ${
                  isCancelled
                    ? 'bg-red-100 text-red-700'
                    : isPending
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {isCancelled ? <XCircle className="h-4 w-4" /> : isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Status: {displayStatus}
                </div>
              )}

              {/* Check-in / Check-out */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-green-50 p-3">
                  <div className="text-xs text-gray-500">Check-in</div>
                  <div className="font-bold text-gray-900">{formatDate(searchParams.checkIn)}</div>
                  <div className="text-xs text-gray-500">From {selectedHotel.checkInTime}</div>
                </div>
                <div className="rounded-lg bg-red-50 p-3">
                  <div className="text-xs text-gray-500">Check-out</div>
                  <div className="font-bold text-gray-900">{formatDate(searchParams.checkOut)}</div>
                  <div className="text-xs text-gray-500">By {selectedHotel.checkOutTime}</div>
                </div>
              </div>

              {/* Duration */}
              <div className="mb-4 flex items-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                <Clock className="h-4 w-4" />
                {nights} night{nights !== 1 ? 's' : ''} stay
              </div>

              {/* Rooms */}
              <div className="mb-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-700">Rooms Booked</h3>
                {selectedRooms.map(room => (
                  <div key={room.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{room.name} × {room.quantity}</span>
                    <span className="font-medium">{formatINR(getRoomOnlinePayable(room, room.quantity))}</span>
                  </div>
                ))}
                {payAtHotelTotal > 0 && (
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span>Pay at hotel (mandatory)</span>
                    <span>
                      ₹{payAtHotelTotal}
                    </span>
                  </div>
                )}
              </div>

              {/* Guests */}
              {guests.length > 0 && (
                <div className="mb-4">
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">Guests</h3>
                  {guests.map((guest, i) => (
                    <div key={(guest as any).id ?? i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Users className="h-4 w-4 text-gray-400" />
                      {(guest as any).title} {guest.firstName} {guest.lastName}
                      {i === 0 && <span className="text-xs text-orange-500">(Primary)</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* Contact */}
              {user.mobile && (
                <div className="mb-4 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-gray-400" />
                    +91 {user.mobile}
                  </div>
                  {user.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {user.email}
                    </div>
                  )}
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between border-t border-gray-200 pt-3 font-bold text-gray-900">
                <span>Total Paid</span>
                <span className="text-xl text-orange-600">{formatINR(totalPaid)}</span>
              </div>
              {payAtHotelTotal > 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  Mandatory property charges are payable directly at the hotel and are not included above.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── What's Next ── */}
        {!isCancelled && (
          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 font-bold text-gray-900">What's Next?</h2>
            <div className="space-y-4">
              {[
                {
                  icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                  title: 'Booking Confirmed',
                  desc: 'Your booking is confirmed',
                  done: !isPending,
                },
                {
                  icon: <Mail className="h-5 w-5 text-blue-500" />,
                  title: 'Confirmation Email',
                  desc: 'Check your email for details',
                  done: !isPending,
                },
                {
                  icon: <Calendar className="h-5 w-5 text-orange-500" />,
                  title: 'Check-in Day',
                  desc: `Arrive at ${selectedHotel?.checkInTime || '2:00 PM'}`,
                  done: false,
                },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  {step.icon}
                  <div>
                    <div className={`text-sm font-medium ${step.done ? 'text-gray-900' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="grid gap-3 sm:grid-cols-2">
          {!isCancelled && (
            <>
              <Button variant="outline" onClick={handleAddToCalendar} className="flex items-center justify-center gap-2">
                <Calendar className="h-4 w-4" />
                Add to Calendar
              </Button>
              <Button variant="outline" onClick={handleDownload} className="flex items-center justify-center gap-2">
                <Download className="h-4 w-4" /> Download E-Ticket
              </Button>
              <Button variant="outline" onClick={handleShare} className="flex items-center justify-center gap-2">
                <Share2 className="h-4 w-4" />
                Share Booking
              </Button>
            </>
          )}
          <Button onClick={handleBookAgain} className="flex items-center justify-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Book Again
          </Button>
        </div>

        {/* ── Cancel Booking ── */}
        {!isCancelled && bookingId && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">
            <h3 className="mb-1 font-bold text-gray-900">Cancel Booking</h3>
            <p className="mb-3 text-sm text-gray-600">
              Cancellation is subject to the hotel's cancellation policy. Refunds may take 5–7 business days.
            </p>
            {!cancelConfirm ? (
              <Button
                variant="outline"
                onClick={() => setCancelConfirm(true)}
                className="border-red-300 text-red-600 hover:bg-red-100"
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel this booking
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-700">
                  Are you sure you want to cancel booking {confirmationNo || bookingId}?
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleCancel}
                    disabled={cancelLoading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {cancelLoading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling…</>
                    ) : (
                      'Yes, cancel it'
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setCancelConfirm(false)}>
                    Keep booking
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}


      </div>
    </div>
  );
}
