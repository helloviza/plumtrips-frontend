import { useCurrency } from '../../hooks/useCurrency';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Tag, ChevronDown, ChevronUp,
  CheckCircle, Loader2, Star, Gift, AlertTriangle, RefreshCw, Clock
} from 'lucide-react';
import { runHotelBook, runHotelPreBook, formatHotelTraceApiError } from '../../hooks/useHotelApi';
import { useRazorpayCheckout } from '../../hooks/useRazorpayCheckout';
import { createHotelPaymentOrder } from '../../services/paymentApi';
import type { BookGuest } from '../../services/hotelApi';
import { useHotelStore } from '../../stores/hotelStore';
import Button from '../../components/ui/Button';
import HotelBookingShell from '../../components/hotels/HotelBookingShell';
import { calculateNights } from '../../lib/utils';
import toast from 'react-hot-toast';

const ADD_ON_PRICES: Record<string, number> = {
  travelInsurance: 299, airportTransfer: 799,
  breakfastUpgrade: 499, roomUpgrade: 1500, lateCheckout: 999,
};

export default function Checkout() {
  const { formatCurrency, symbol } = useCurrency();
  const navigate = useNavigate();
  const {
    selectedRooms, selectedHotel, guests, addOns, searchParams,
    promoCode, promoDiscount, applyPromoCode,
    setBookingId, user, preBookResponse, sessionExpired,
    paymentSubmitted, setPaymentSubmitted, traceId,
    setCurrentStep, setPreBookResponse, setBookingCode,
    setConfirmationNo, setPnr,
  } = useHotelStore();

  const [promoInput, setPromoInput] = useState('');
  const [showPriceSummary, setShowPriceSummary] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [preBooking, setPreBooking] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const { openRazorpayCheckout } = useRazorpayCheckout();

  // Timer state
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [timerModalOpen, setTimerModalOpen] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!timerModalOpen) {
        setTimerModalOpen(true);
        setTimeout(() => {
          navigate(selectedHotel ? `/hotels/${selectedHotel.id}/rooms` : '/hotels');
        }, 10000);
      }
      return;
    }
    const timerId = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, timerModalOpen, navigate, selectedHotel]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (sessionExpired) {
      toast.error('Session expired. Please start again.');
      navigate('/hotels');
      return;
    }

    const kickoff = () => {
      if (useHotelStore.getState().selectedRooms.length === 0) {
        toast.error('Please select rooms first.');
        navigate('/hotels/results');
        return;
      }
      setCurrentStep('checkout');
      if (!useHotelStore.getState().preBookResponse) {
        void runInlinePreBook();
      }
    };

    if (useHotelStore.persist.hasHydrated()) {
      kickoff();
    } else {
      return useHotelStore.persist.onFinishHydration(() => kickoff());
    }
  }, []);

  const runInlinePreBook = async () => {
    setPreBooking(true);
    try {
      const { selectedRooms, selectedHotel, traceId } = useHotelStore.getState();
      const bookingCode = (selectedRooms[0] as { _bookingCode?: string; id?: string })?._bookingCode ?? selectedRooms[0]?.id;
      if (!bookingCode) {
        toast.error('No booking code found. Please re-select your room.');
        setPreBooking(false);
        return;
      }

      if (!traceId?.trim()) {
        toast.error(
          'Missing hotel search session (traceId). Go back to hotel results and search again before checkout.',
          { duration: 7000 }
        );
        setPreBooking(false);
        navigate('/hotels/results');
        return;
      }

      const preBook = await runHotelPreBook(bookingCode, traceId);

      if (!preBook.roomAvailable) {
        toast.error('Room no longer available. Please select another room.');
        navigate(`/hotels/${selectedHotel?.id}/rooms`);
        return;
      }

      setBookingCode(preBook.bookingCode);
      setPreBookResponse(preBook);
    } catch (err: unknown) {
      toast.error(formatHotelTraceApiError(err, 'Could not verify room availability. Please try again.'));
    } finally {
      setPreBooking(false);
    }
  };

  const nights = calculateNights(searchParams.checkIn, searchParams.checkOut) || 1;

  const roomsBasePrice = selectedRooms.reduce((s, r) => s + r.price * r.quantity, 0);
  const roomsTaxes = selectedRooms.reduce((s, r) => s + r.taxesAndFees * r.quantity, 0);

  const preBookNet = (preBookResponse as { netAmount?: number })?.netAmount ?? 0;
  const preBookConfirmed = preBookResponse?.confirmedPrice ?? 0;
  const preBookTaxes = preBookResponse?.confirmedTaxes ?? 0;

  let confirmedPrice: number;
  let confirmedTaxes: number;

  if (preBookNet > 0) {
    confirmedPrice = preBookNet;
    confirmedTaxes = 0;
  } else if (preBookConfirmed > 0) {
    confirmedPrice = preBookConfirmed;
    confirmedTaxes = preBookTaxes;
  } else {
    confirmedPrice = roomsBasePrice;
    confirmedTaxes = roomsTaxes;
  }

  const addOnsTotal = Object.entries(addOns).reduce((s, [k, v]) => s + (v ? (ADD_ON_PRICES[k] || 0) : 0), 0);
  const subtotal = confirmedPrice + confirmedTaxes + addOnsTotal;
  const discountAmount = promoDiscount > 0 ? Math.round(subtotal * promoDiscount / 100) : 0;
  const totalPrice = subtotal - discountAmount;
  const payNow = totalPrice;

  const razorpayPrefill = {
    name: [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined,
    email: user.email || undefined,
    contact: user.mobile?.replace(/\D/g, '').slice(-10) || undefined,
  };

  const priceChanged = preBookResponse?.priceChanged;
  const originalListingPrice = roomsBasePrice + roomsTaxes;

  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    applyPromoCode(promoInput);
    if (['SAVE10', 'SAVE20', 'WELCOME', 'FIRST'].includes(promoInput.toUpperCase())) {
      toast.success('Promo code applied!');
    } else {
      toast.error('Invalid promo code');
    }
  };

  const resetPaymentState = () => {
    setPaymentSubmitted(false);
    setProcessing(false);
  };

  const finalizeBooking = async (razorpayPaymentId?: string) => {
    const expectedGuests = searchParams.rooms * (searchParams.adults + (searchParams.children || 0));
    if (guests.length !== expectedGuests) {
      toast.error(`Please search again. Guest count changed (expected ${expectedGuests}, got ${guests.length}).`);
      resetPaymentState();
      return;
    }

    const bookGuests: BookGuest[] = guests.map((g, i) => ({
      title: g.title as BookGuest['title'],
      firstName: g.firstName,
      middleName: g.middleName,
      lastName: g.lastName,
      paxType: (g.paxType ?? 1) as 1 | 2,
      leadGuest: i === 0,
      age: g.paxType === 2 ? g.age : undefined,
      pan: g.pan,
    }));

    const bookTraceId = useHotelStore.getState().traceId?.trim();
    if (!bookTraceId) {
      const msg =
        'Missing hotel search session (traceId). Return to hotel results, search again, then complete checkout.';
      setBookError(msg);
      toast.error(msg, { duration: 7000 });
      resetPaymentState();
      return;
    }

    const confirmToast = toast.loading('Confirming booking…');
    try {
      const result = await runHotelBook({
        bookingCode: preBookResponse!.bookingCode,
        traceId: preBookResponse!.traceId,
        guestNationality: 'IN',
        isVoucherBooking: true,
        rooms: searchParams.rooms,
        adults: searchParams.adults,
        children: searchParams.children,
        guests: bookGuests,
        contact: {
          email: user.email || 'guest@plumtrips.com',
          mobile: user.mobile || '9999999999',
        },
        hotelId: selectedHotel?.id,
        hotelName: selectedHotel?.name,
        location: selectedHotel?.location,
        checkIn: searchParams.checkIn,
        checkOut: searchParams.checkOut,
        priceDetails: {
          total: totalPrice,
          taxes: confirmedTaxes,
          additionalCharges: addOnsTotal
        },
        isPackageFare: (preBookResponse as { isPackageFare?: boolean }).isPackageFare,
        isPackageDetailsMandatory: (preBookResponse as { isPackageDetailsMandatory?: boolean })
          .isPackageDetailsMandatory,
      });

      const inner: Record<string, unknown> =
        (result as { BookResult?: Record<string, unknown> }).BookResult ??
        (result as unknown as Record<string, unknown>);
      const bookingId = String(inner?.BookingId ?? inner?.bookingId ?? '');
      const pnr = String(inner?.pnr ?? '');
      const confirmationNo = String(
        inner?.ConfirmationNo ?? inner?.confirmationNo ??
        inner?.BookingRefNo ?? inner?.bookingRefNo ?? bookingId
      );
      const status = String(
        inner?.HotelBookingStatus ?? inner?.Status ?? inner?.status ?? 'Confirmed'
      );

      if (!bookingId) {
        const fallbackConfNo =
          inner?.ConfirmationNo ?? inner?.BookingRefNo ?? inner?.InvoiceNumber ?? '';
        if (fallbackConfNo) {
          setBookingId(String(fallbackConfNo));
          setConfirmationNo(String(fallbackConfNo));
          if (pnr) setPnr(pnr);
          setCurrentStep('confirmed');
          toast.dismiss(confirmToast);
          navigate('/hotels/confirmation');
          return;
        }
        const msg = `Booking response missing BookingId. Raw: ${JSON.stringify(result)}`;
        setBookError(msg);
        resetPaymentState();
        toast.dismiss(confirmToast);
        return;
      }

      setBookingId(bookingId);
      setConfirmationNo(confirmationNo);
      if (pnr) setPnr(pnr);
      setCurrentStep('confirmed');

      try {
        const raw = localStorage.getItem('hotel-booking-storage');
        const stored = raw ? JSON.parse(raw) : {};
        stored.state = {
          ...(stored.state ?? {}),
          bookingId,
          confirmationNo,
        };
        localStorage.setItem('hotel-booking-storage', JSON.stringify(stored));
      } catch { /* ignore */ }

      toast.dismiss(confirmToast);
      if (status.toLowerCase() === 'pending') {
        toast('Booking pending confirmation. We\'ll update you shortly.', { icon: '⏳' });
      } else {
        toast.success('Booking confirmed! 🎉');
      }

      navigate('/hotels/confirmation');
    } catch (err: unknown) {
      const errMsg = formatHotelTraceApiError(err, 'Booking failed. Please try again.');
      console.error('[Book] error:', errMsg, err);
      setBookError(errMsg);
      resetPaymentState();
      toast.dismiss(confirmToast);

      if (razorpayPaymentId) {
        try {
          sessionStorage.setItem('plumtrips_last_razorpay_payment_id', razorpayPaymentId);
        } catch { /* ignore */ }
        toast.error(
          `Payment received (ID: ${razorpayPaymentId}) but booking failed. Contact support with this payment ID.`,
          { duration: 12000 }
        );
      } else {
        toast.error(errMsg);
      }
    }
  };

  const handlePayment = async () => {
    if (paymentSubmitted) {
      toast.error('Payment already submitted. Please wait.');
      return;
    }
    if (!preBookResponse?.bookingCode) {
      toast.error('Booking session expired. Please start again.');
      navigate('/hotels');
      return;
    }
    if (!traceId?.trim()) {
      toast.error(
        'Missing hotel search session (traceId). Return to hotel results, search again, then complete checkout.',
        { duration: 7000 }
      );
      navigate('/hotels/results');
      return;
    }

    setBookError(null);
    setPaymentSubmitted(true);
    setProcessing(true);

    const createToast = toast.loading('Creating payment…');

    try {
      const orderData = await createHotelPaymentOrder({
        amount: payNow,
        bookingCode: preBookResponse.bookingCode,
        traceId: traceId.trim(),
        hotelName: selectedHotel?.name,
      });
      toast.dismiss(createToast);
      setProcessing(false);

      await openRazorpayCheckout({
        orderData,
        description: `Hotel booking – ${selectedHotel?.name ?? 'PlumTrips'}`,
        prefill: razorpayPrefill,
        onSuccess: async (response) => {
          setProcessing(true);
          await finalizeBooking(response.razorpay_payment_id);
        },
        onDismiss: resetPaymentState,
        onFailed: resetPaymentState,
      });
    } catch (err: unknown) {
      toast.dismiss(createToast);
      const msg = err instanceof Error ? err.message : 'Could not start payment';
      if (msg !== 'Payment cancelled') {
        toast.error(msg);
      }
      resetPaymentState();
    }
  };

  if (preBooking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#003580]" />
          <p className="font-semibold text-gray-700">Verifying room availability…</p>
          <p className="mt-1 text-sm text-gray-500">Confirming your price and booking details</p>
        </div>
      </div>
    );
  }

  return (
    <HotelBookingShell
      activeStep={3}
      maxWidth="6xl"
      title="Payment"
      subtitle={selectedHotel?.name}
      onBack={() => navigate(-1)}
    >
        <div className="flex items-center justify-between mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-red-600 animate-pulse" />
            <span className="font-semibold text-red-800">Complete your booking soon!</span>
          </div>
          <div className="text-xl font-bold tabular-nums text-red-600">
            {formatTime(timeLeft)}
          </div>
        </div>

        {priceChanged && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-yellow-300 bg-yellow-50 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-600" />
            <div>
              <div className="font-semibold text-yellow-800">Price updated</div>
              <div className="text-sm text-yellow-700">
                The price has changed from {formatCurrency(originalListingPrice)} to{' '}
                <strong>{formatCurrency(confirmedPrice + confirmedTaxes)}</strong> since you last viewed this room.
                This is the latest confirmed price.
              </div>
            </div>
          </div>
        )}

        {preBookResponse && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
            <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
            <div>
              <div className="font-semibold text-blue-800">Cancellation policy</div>
              <div className="text-sm text-blue-700">{preBookResponse.cancellationPolicy}</div>
            </div>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
              <Shield className="h-6 w-6 shrink-0 text-green-600" />
              <div>
                <div className="font-semibold text-green-800">Best Price Guarantee</div>
                <div className="text-sm text-green-700">Lowest price or double the difference</div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 flex items-center gap-2 font-bold text-gray-900">
                <Tag className="h-5 w-5 text-[#003580]" /> Promo / Coupon Code
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoInput}
                  onChange={e => setPromoInput(e.target.value.toUpperCase())}
                  placeholder="Enter code (try SAVE10)"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#003580] focus:outline-none focus:ring-2 focus:ring-[#003580]/20"
                />
                <Button variant="outline" onClick={handleApplyPromo} size="sm">Apply</Button>
              </div>
              {promoDiscount > 0 && (
                <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {promoDiscount}% off applied — saving {formatCurrency(discountAmount)}
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {['SAVE10', 'SAVE20', 'WELCOME'].map(c => (
                  <button key={c} onClick={() => setPromoInput(c)}
                    className="rounded-full border border-dashed border-[#003580]/40 px-2 py-0.5 text-xs text-[#003580] hover:bg-blue-50">
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {user.isLoggedIn && (
              <div className="flex items-center justify-between rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-center gap-3">
                  <Gift className="h-6 w-6 text-yellow-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Earn reward coins</div>
                    <div className="text-sm text-gray-600">+250 coins on this booking</div>
                  </div>
                </div>
                <div className="text-lg font-bold text-yellow-600">+250 🪙</div>
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 font-bold text-gray-900">Secure payment</h2>
              <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                Pay with UPI, cards, net banking, wallets, and more via Razorpay secure checkout.
              </p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <button
                onClick={() => setShowPriceSummary(!showPriceSummary)}
                className="flex w-full items-center justify-between lg:cursor-default"
              >
                <h2 className="font-bold text-gray-900">Price summary</h2>
                <span className="lg:hidden">
                  {showPriceSummary ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </span>
              </button>

              <div className={`mt-4 space-y-2.5 text-sm ${showPriceSummary ? 'block' : 'hidden lg:block'}`}>
                {selectedHotel && (
                  <div className="mb-4 rounded-lg bg-gray-50 p-3">
                    <div className="font-semibold text-gray-900 text-sm">{selectedHotel.name}</div>
                    <div className="flex items-center gap-1 mt-0.5">
                      {Array.from({ length: selectedHotel.starRating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {searchParams.rooms} Room{searchParams.rooms !== 1 ? 's' : ''} · {searchParams.adults} Adult{searchParams.adults !== 1 ? 's' : ''} per room
                      {searchParams.children > 0 && ` · ${searchParams.children} Child${searchParams.children !== 1 ? 'ren' : ''} per room`}
                      <br/>Total Nights: {nights}
                    </div>
                    {selectedRooms.map(r => (
                      <div key={r.id} className="mt-1 flex justify-between text-xs text-gray-500">
                        <span className="truncate mr-2">{r.name} × {r.quantity}</span>
                        <span className="shrink-0">{formatCurrency((r.price + r.taxesAndFees) * r.quantity)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Room charges</span>
                  <span>{formatCurrency(confirmedPrice)}</span>
                </div>
                {confirmedTaxes > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Taxes & fees</span>
                    <span>{formatCurrency(confirmedTaxes)}</span>
                  </div>
                )}
                {confirmedTaxes === 0 && preBookNet > 0 && (
                  <div className="text-xs text-gray-400">Taxes & fees included in total</div>
                )}
                {addOnsTotal > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Add-ons</span>
                    <span>{formatCurrency(addOnsTotal)}</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Promo ({promoCode})</span>
                    <span>- {formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-3 font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-xl text-[#003580]">{formatCurrency(payNow)}</span>
                </div>
              </div>

              {bookError && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <strong>Booking error:</strong> {bookError}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={processing || paymentSubmitted || preBooking || timeLeft <= 0}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#003580] py-3.5 text-base font-bold text-white transition-colors hover:bg-[#00224f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing || paymentSubmitted ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Processing…</>
                ) : (
                  `Pay ${formatCurrency(payNow)} Securely`
                )}
              </button>

              <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-400">
                <Shield className="h-3 w-3" /> 256-bit SSL encrypted
              </div>
            </div>
          </div>
        </div>

        {/* Timer Expired Modal */}
        {timerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
              <h2 className="mb-2 text-xl font-bold text-gray-900">Booking Time Over</h2>
              <p className="mb-6 text-gray-600">Your session has expired. You will be redirected to the previous page in 10 seconds.</p>
              <button 
                className="w-full rounded-lg bg-[#003580] py-3 text-white font-bold"
                onClick={() => navigate(selectedHotel ? `/hotels/${selectedHotel.id}/rooms` : '/hotels')}
              >
                Go Back Now
              </button>
            </div>
          </div>
        )}
    </HotelBookingShell>
  );
}
