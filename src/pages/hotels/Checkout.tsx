import { useCurrency } from '../../context/currencyContext';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Tag, ChevronDown, ChevronUp,
  CheckCircle, Loader2, Star, Gift, AlertTriangle, RefreshCw, Clock, XCircle, Info
} from 'lucide-react';
import { runHotelBook, runHotelPreBook, formatHotelTraceApiError } from '../../hooks/useHotelApi';
import { CancellationPolicyPanel } from '../../components/hotels/CancellationPolicyPanel';
import { useRazorpayCheckout } from '../../hooks/useRazorpayCheckout';
import { createHotelPaymentOrder } from '../../services/paymentApi';
import type { BookGuest } from '../../services/hotelApi';
import { loadRazorpayScript } from '../../lib/loadRazorpayScript';
import { couponApi, type ValidateCouponResult, type CouponReasonCode } from '../../lib/couponApi';
import { useHotelStore } from '../../stores/hotelStore';
import Button from '../../components/ui/Button';
import HotelBookingShell from '../../components/hotels/HotelBookingShell';
import { calculateNights } from '../../lib/utils';
import {
  getConfirmedOnlinePayable,
  getRoomOnlinePayable,
  getRoomsListingTotal,
  hasSupplierPriceChange,
} from '../../lib/hotelPricing';
import toast from 'react-hot-toast';

const ADD_ON_PRICES: Record<string, number> = {
  travelInsurance: 299, airportTransfer: 799,
  breakfastUpgrade: 499, roomUpgrade: 1500, lateCheckout: 999,
};

function couponReasonMessage(reason: CouponReasonCode): string {
  switch (reason) {
    case 'COUPON_NOT_FOUND': return 'Invalid coupon code.';
    case 'COUPON_INACTIVE': return 'This coupon is no longer active.';
    case 'COUPON_NOT_YET_STARTED': return "This coupon isn't active yet.";
    case 'COUPON_EXPIRED': return 'This coupon has expired.';
    case 'COUPON_EXHAUSTED': return 'This coupon has reached its usage limit.';
    case 'CATEGORY_MISMATCH': return "This coupon isn't valid for hotel bookings.";
    case 'MIN_BOOKING_AMOUNT_NOT_MET': return 'Your booking amount is below the minimum required for this coupon.';
    case 'USER_LIMIT_REACHED': return "You've already used this coupon.";
    default: return "This coupon can't be applied.";
  }
}

export default function Checkout() {
  const { convert } = useCurrency();
  const navigate = useNavigate();
  const {
    selectedRooms, selectedHotel, guests, addOns, searchParams,
    setBookingId, user, preBookResponse, preBookResponses, sessionExpired,
    paymentSubmitted, setPaymentSubmitted, traceId,
    setCurrentStep, setPreBookResponse, setPreBookResponses, setBookingCode, setBookingCodes,
    setConfirmationNo, setPnr, setConfirmedPaidAmount, setTboReferenceNo, setVoucherUrl,
    specialRequests
  } = useHotelStore();

  const [showPriceSummary, setShowPriceSummary] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [preBooking, setPreBooking] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);
  const [priceChangeAcknowledged, setPriceChangeAcknowledged] = useState(false);
  const { openRazorpayCheckout } = useRazorpayCheckout();

  // Coupon state (real backend-backed validate/apply flow)
  const [couponCode, setCouponCode] = useState('');
  const [couponStatus, setCouponStatus] = useState<'idle' | 'validating' | 'applied' | 'error'>('idle');
  const [couponResult, setCouponResult] = useState<ValidateCouponResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Guards: apply() must fire at most once per booking, and a validated
  // discount must not survive a change in the amount it was validated against.
  const couponRedeemedRef = useRef(false);
  const validatedForAmountRef = useRef<number | null>(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [timerModalOpen, setTimerModalOpen] = useState(false);

  useEffect(() => {
    loadRazorpayScript().catch(() => {});
  }, []);

  useEffect(() => {
    console.log('🛒 Checkout: Mounted. traceId:', traceId);
    if (!hasSupplierPriceChange(preBookResponse, selectedRooms)) {
      setPriceChangeAcknowledged(true);
    }
    return () => console.log('🛒 Checkout: Unmounted');
  }, [preBookResponse, selectedRooms]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (!timerModalOpen) {
        setTimerModalOpen(true);
        setTimeout(() => {
          console.log('⏰ Checkout: Timer expired, navigating away');
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
      console.log('❌ Checkout: sessionExpired is true, navigating to /hotels');
      toast.error('Session expired. Please start again.');
      navigate('/hotels');
      return;
    }

    const kickoff = () => {
      console.log('🚀 Checkout: kickoff() running. selectedRooms length:', useHotelStore.getState().selectedRooms.length);
      if (useHotelStore.getState().selectedRooms.length === 0) {
        console.log('❌ Checkout: no selected rooms, navigating to /hotels/results');
        toast.error('Please select rooms first.');
        navigate('/hotels/results');
        return;
      }
      setCurrentStep('checkout');

      const pbr = useHotelStore.getState().preBookResponse;
      const selectedRoomsCount = useHotelStore.getState().selectedRooms.length;
      const completeMultiRoomPrebook =
        selectedRoomsCount <= 1 ||
        (useHotelStore.getState().preBookResponses.length === selectedRoomsCount &&
          useHotelStore.getState().preBookResponses.every(Boolean));
      console.log('🚀 Checkout: kickoff() preBookResponse:', pbr ? pbr.bookingCode : 'null');
      console.log('🚀 Checkout: completeMultiRoomPrebook:', completeMultiRoomPrebook);

      if (!pbr || !completeMultiRoomPrebook) {
        console.log('🚀 Checkout: running inline prebook; prebook state incomplete for all rooms');
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
      const { selectedRooms, traceId } = useHotelStore.getState();

      if (selectedRooms.length === 0) {
        toast.error('No rooms selected. Please re-select your room.');
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

      // Prebook all selected rooms in parallel
      const results = await Promise.all(
        selectedRooms.map((room, idx) => {
          const code = (room as any)._bookingCode ?? room.id ?? '';
          if (!code) return Promise.resolve({ idx, result: null as any, error: 'No booking code' });
          const checkInStr = searchParams.checkIn
            ? (searchParams.checkIn instanceof Date
                ? searchParams.checkIn.toISOString().split('T')[0]
                : String(searchParams.checkIn).split('T')[0])
            : '';
          const roomNameStr = selectedRooms[idx]?.name ?? '';
          return runHotelPreBook(code, traceId, checkInStr, roomNameStr)
            .then(res => ({ idx, result: res, error: null }))
            .catch(err => ({ idx, result: null, error: err }));
        })
      );

      const responses: any[] = new Array(selectedRooms.length).fill(null);
      let anyUnavailable = false;

      for (const { idx, result, error } of results) {
        if (error || !result) {
          const msg = error ? formatHotelTraceApiError(error, `Could not verify room ${idx + 1} availability.`) : `Could not verify room ${idx + 1}.`;
          toast.error(msg);
          setPreBooking(false);
          return;
        }
        if (!result.roomAvailable) {
          anyUnavailable = true;
        }
        responses[idx] = result;
      }

      if (anyUnavailable) {
        console.log('❌ Checkout: room no longer available in inline prebook, navigating back to rooms');
        toast.error('One or more rooms are no longer available. Please select different rooms.');
        const { selectedHotel } = useHotelStore.getState();
        navigate(selectedHotel ? `/hotels/${selectedHotel.id}/rooms` : '/hotels/results');
        return;
      }

      setPreBookResponses(responses);
      if (responses[0]) {
        setBookingCode(responses[0].bookingCode);
        setPreBookResponse(responses[0]);
      }
      const codes = responses.map((r, idx) => r?.bookingCode ?? ((selectedRooms[idx] as any)._bookingCode ?? selectedRooms[idx]?.id ?? ''));
      setBookingCodes(codes);
    } catch (err: unknown) {
      toast.error(formatHotelTraceApiError(err, 'Could not verify room availability. Please try again.'));
    } finally {
      setPreBooking(false);
    }
  };

  const currentBookingCode = preBookResponse?.bookingCode ?? selectedRooms[0]?._bookingCode ?? selectedRooms[0]?.id ?? '';
  const nights = calculateNights(searchParams.checkIn, searchParams.checkOut) || 1;

  const listingTotal = getRoomsListingTotal(selectedRooms);
  const confirmedBreakdown = getConfirmedOnlinePayable(
    preBookResponse,
    selectedRooms,
    preBookResponses.length > 1 ? preBookResponses : undefined
  );
  const confirmedPrice = confirmedBreakdown.baseFare;
  const confirmedTaxes = confirmedBreakdown.taxes;
  const confirmedRoomTotal = confirmedBreakdown.totalPayable;

  const addOnsTotal = Object.entries(addOns).reduce((s, [k, v]) => s + (v ? (ADD_ON_PRICES[k] || 0) : 0), 0);
  const subtotal = confirmedRoomTotal + addOnsTotal;

  // Discount now comes from the backend-validated coupon result, not a
  // hardcoded percentage. `finalAmount`/`discountAmount` are only trusted
  // while couponStatus === 'applied' (see the invalidation effect below).
  const discountAmount = couponStatus === 'applied' && couponResult ? couponResult.discountAmount : 0;
  const totalPrice = couponStatus === 'applied' && couponResult ? couponResult.finalAmount : subtotal;
  const payNow = totalPrice;

  const supplierPriceChanged = hasSupplierPriceChange(
    preBookResponse,
    selectedRooms,
    preBookResponses.length > 1 ? preBookResponses : undefined
  );

  // If the amount the coupon was validated against changes (e.g. a supplier
  // price change, add-ons toggled), the previously-validated discount is no
  // longer trustworthy — clear it and ask the user to re-apply.
  useEffect(() => {
    if (
      couponStatus === 'applied' &&
      validatedForAmountRef.current !== null &&
      validatedForAmountRef.current !== subtotal
    ) {
      setCouponStatus('idle');
      setCouponResult(null);
      setCouponError('Booking amount changed — please re-apply your coupon.');
      toast.error('Booking amount changed. Please re-apply your coupon.');
    }
  }, [subtotal]);

  const allRoomsPrebooked =
    selectedRooms.length <= 1 ||
    (preBookResponses.length === selectedRooms.length && preBookResponses.every(Boolean));
  const originalListingPrice = listingTotal;

  const razorpayPrefill = {
    name: [user.firstName, user.lastName].filter(Boolean).join(' ') || undefined,
    email: user.email || undefined,
    contact: user.mobile?.replace(/\D/g, '').slice(-10) || undefined,
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code || couponStatus === 'validating') return;

    setCouponStatus('validating');
    setCouponError(null);

    try {
      const result = await couponApi.validate({
        code,
        category: 'HOTEL',
        bookingAmount: subtotal, // room total + add-ons, before discount
      });

      if (result.eligible) {
        setCouponResult(result);
        setCouponStatus('applied');
        validatedForAmountRef.current = subtotal;
        toast.success(`Coupon applied! You saved ${convert(result.discountAmount)}`);
      } else {
        setCouponResult(null);
        setCouponStatus('error');
        setCouponError(couponReasonMessage(result.reasonCode));
      }
    } catch (err) {
      setCouponStatus('error');
      setCouponError(err instanceof Error ? err.message : 'Could not validate coupon.');
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setCouponStatus('idle');
    setCouponResult(null);
    setCouponError(null);
    validatedForAmountRef.current = null;
    couponRedeemedRef.current = false;
  };

  const resetPaymentState = () => {
    setPaymentSubmitted(false);
    setProcessing(false);
  };

  // Actually redeems the coupon. Only called once a real bookingId exists
  // (payment success or hold-booking success) — never on validate/apply-click.
  // couponRedeemedRef flips synchronously so this can never fire twice for
  // the same booking, even across re-renders or retried callbacks.
  const redeemCouponIfNeeded = async (bookingId: string) => {
    if (couponStatus !== 'applied' || !couponResult?.coupon || couponRedeemedRef.current) return;
    couponRedeemedRef.current = true;

    try {
      await couponApi.apply({
        code: couponResult.coupon.code,
        category: 'HOTEL',
        bookingAmount: subtotal,
        bookingId,
      });
    } catch (err) {
      console.error('[Coupon] redemption failed post-booking:', err);
      toast.error(
        'Your booking is confirmed, but the coupon redemption could not be finalized. Please contact support.',
        { duration: 10000 }
      );
    }
  };

  const finalizeBooking = async (razorpayPaymentId?: string) => {
    const expectedGuests = searchParams.adults + (searchParams.children || 0);
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

    // Get all booking codes for multi-room — prefer per-room prebook codes
    const storeState = useHotelStore.getState();
    const allCodes = storeState.preBookResponses.length > 1
      ? storeState.preBookResponses.map((r, idx) =>
          r?.bookingCode ??
          (storeState.selectedRooms[idx] as any)?._bookingCode ??
          storeState.selectedRooms[idx]?.id ??
          ''
        )
      : [preBookResponse!.bookingCode];

    const primaryBookingCode = allCodes[0];
    const primaryPreBook = storeState.preBookResponses[0] ?? preBookResponse;

    const confirmToast = toast.loading('Confirming booking…');
    try {
      const formatDateStr = (d: Date | string | null): string => {
        if (!d) return '';
        const date = d instanceof Date ? d : new Date(d);
        if (isNaN(date.getTime())) return '';
        // Use local time instead of UTC to avoid off-by-one day bugs
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      const bookPayload = {
        bookingCode: primaryBookingCode,
        bookingCodes: allCodes.length > 1 ? allCodes : undefined,
        traceId: primaryPreBook!.traceId,
        guestNationality: 'IN',
        isVoucherBooking: true as const,
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
        checkIn: formatDateStr(searchParams.checkIn),
        checkOut: formatDateStr(searchParams.checkOut),
        priceDetails: {
          total: totalPrice,
          taxes: confirmedTaxes,
          additionalCharges: addOnsTotal
        },
        isPackageFare: (primaryPreBook as { isPackageFare?: boolean })?.isPackageFare,
        isPackageDetailsMandatory: (primaryPreBook as { isPackageDetailsMandatory?: boolean })?.isPackageDetailsMandatory,
      };

      console.log('[Book] sending payload:', JSON.stringify(bookPayload, null, 2));

      const result = await runHotelBook(bookPayload);

      const inner: Record<string, unknown> =
        (result as { BookResult?: Record<string, unknown> }).BookResult ??
        (result as unknown as Record<string, unknown>);

      // Log the full raw response so we can see the actual shape
      console.log('[Book] raw result:', JSON.stringify(result));
      console.log('[Book] inner:', JSON.stringify(inner));

      const bookingId = (inner?.BookingId ?? inner?.bookingId ?? '') as string;
      const pnr = (inner?.pnr ?? inner?.Pnr ?? inner?.PNR ?? '') as string;
      const invoiceNumber = (inner?.InvoiceNumber ?? inner?.invoiceNumber ?? '') as string;
      const voucherUrl = (inner?.voucherUrl ?? inner?.VoucherUrl ?? inner?.VoucherURL ?? '') as string;
      const tboReferenceNo = (
        inner?.TBOReferenceNo ??
        inner?.tboReferenceNo ??
        inner?.BookingRefNo ??
        inner?.bookingRefNo ??
        ''
      ) as string;
      // Separate ?? chain from || fallback to avoid Babel parse error
      const confirmationNo = (
        inner?.ConfirmationNo ??
        inner?.confirmationNo ??
        inner?.BookingRefNo ??
        inner?.bookingRefNo ??
        inner?.TBOReferenceNo ??
        inner?.tboReferenceNo ??
        (invoiceNumber || bookingId)
      ) as string;
      const status = (
        inner?.HotelBookingStatus ??
        inner?.hotelBookingStatus ??
        inner?.Status ??
        inner?.status ??
        'Confirmed'
      ) as string;

      // The booking succeeded if we have ANY of: bookingId, pnr, invoiceNumber, confirmationNo
      const hasValidBooking = bookingId || pnr || invoiceNumber || confirmationNo;

      if (!hasValidBooking) {
        const msg = `Booking response missing BookingId. Raw: ${JSON.stringify(result)}`;
        setBookError(msg);
        resetPaymentState();
        toast.dismiss(confirmToast);
        return;
      }

      // Use the best available ID as the canonical booking reference
      const canonicalId = bookingId || invoiceNumber || pnr || confirmationNo;
      setBookingId(canonicalId);
      setConfirmationNo(confirmationNo || canonicalId);
      if (pnr) setPnr(pnr);
      if (tboReferenceNo) setTboReferenceNo(tboReferenceNo);
      if (voucherUrl) setVoucherUrl(voucherUrl);
      setConfirmedPaidAmount(payNow);
      setCurrentStep('confirmed');

      // Redeem the coupon now that a real booking exists. Guarded so it can
      // only ever run once for this booking.
      await redeemCouponIfNeeded(canonicalId);

      try {
        const raw = localStorage.getItem('hotel-booking-storage');
        const stored = raw ? JSON.parse(raw) : {};
        stored.state = {
          ...(stored.state ?? {}),
          bookingId: canonicalId,
          confirmationNo: confirmationNo || canonicalId,
          pnr,
          tboReferenceNo,
          voucherUrl,
          confirmedPaidAmount: payNow,
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

  const handleHoldBooking = async () => {
    if (processing || paymentSubmitted) return;
    if (supplierPriceChanged && !priceChangeAcknowledged) {
      toast.error('Please confirm the updated price before holding.');
      return;
    }

    setProcessing(true);
    setPaymentSubmitted(true);

    const confirmToast = toast.loading('Holding your booking...');

    try {
      const bookGuests = guests.map(g => ({
        ...g,
        age: g.paxType === 2 ? (g.age || 8) : undefined
      }));

      const formatDateStr = (d: Date | string | null): string => {
        if (!d) return '';
        const date = d instanceof Date ? d : new Date(d);
        if (isNaN(date.getTime())) return '';
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
      };

      const primaryBookingCode = preBookResponses[0]?.bookingCode ?? selectedRooms[0]?._bookingCode ?? selectedRooms[0]?.id ?? '';
      const allCodes = preBookResponses.map((r, i) => r?.bookingCode ?? ((selectedRooms[i] as any)._bookingCode ?? selectedRooms[i]?.id ?? ''));
      const primaryPreBook = preBookResponses[0] || preBookResponse;

      const bookPayload = {
        bookingCode: primaryBookingCode,
        bookingCodes: allCodes.length > 1 ? allCodes : undefined,
        traceId: primaryPreBook?.traceId || traceId,
        guestNationality: 'IN',
        isVoucherBooking: false as const, // Hold booking flag
        rooms: searchParams.rooms,
        adults: searchParams.adults,
        children: searchParams.children,
        guests: bookGuests,
        specialRequests: specialRequests,
        contact: {
          email: user.email || 'guest@plumtrips.com',
          mobile: user.mobile || '9999999999',
        },
        hotelId: selectedHotel?.id,
        hotelName: selectedHotel?.name,
        location: selectedHotel?.location,
        checkIn: formatDateStr(searchParams.checkIn),
        checkOut: formatDateStr(searchParams.checkOut),
        priceDetails: {
          total: totalPrice,
          taxes: confirmedTaxes,
          additionalCharges: addOnsTotal
        },
        isPackageFare: (primaryPreBook as { isPackageFare?: boolean })?.isPackageFare,
        isPackageDetailsMandatory: (primaryPreBook as { isPackageDetailsMandatory?: boolean })?.isPackageDetailsMandatory,
      };

      const bookResult = await runHotelBook(bookPayload);

      const inner: Record<string, unknown> =
        (bookResult as { BookResult?: Record<string, unknown> }).BookResult ??
        (bookResult as unknown as Record<string, unknown>);

      const bookingId = (inner?.BookingId ?? inner?.bookingId ?? '') as string;
      const pnr = (inner?.pnr ?? inner?.Pnr ?? inner?.PNR ?? '') as string;
      const invoiceNumber = (inner?.InvoiceNumber ?? inner?.invoiceNumber ?? '') as string;
      const tboReferenceNo = (
        inner?.TBOReferenceNo ??
        inner?.tboReferenceNo ??
        inner?.BookingRefNo ??
        inner?.bookingRefNo ??
        ''
      ) as string;
      const confirmationNo = (
        inner?.ConfirmationNo ??
        inner?.confirmationNo ??
        inner?.BookingRefNo ??
        inner?.bookingRefNo ??
        inner?.TBOReferenceNo ??
        inner?.tboReferenceNo ??
        (invoiceNumber || bookingId)
      ) as string;
      const status = (
        inner?.Status ??
        inner?.status ??
        (bookResult as { status?: number }).status
      ) as number;

      const canonicalId = bookingId || pnr || confirmationNo || '';
      setBookingId(canonicalId);
      setConfirmationNo(confirmationNo || canonicalId);
      if (pnr) setPnr(pnr);
      if (tboReferenceNo) setTboReferenceNo(tboReferenceNo);
      setConfirmedPaidAmount(0);
      setCurrentStep('confirmed');

      // Redeem the coupon now that a real booking exists (guarded to run once).
      await redeemCouponIfNeeded(canonicalId);

      try {
        const raw = localStorage.getItem('hotel-booking-storage');
        const stored = raw ? JSON.parse(raw) : {};
        stored.state = {
          ...(stored.state ?? {}),
          bookingId: canonicalId,
          confirmationNo: confirmationNo || canonicalId,
          pnr,
          tboReferenceNo,
          confirmedPaidAmount: 0,
        };
        localStorage.setItem('hotel-booking-storage', JSON.stringify(stored));
      } catch { /* ignore */ }

      toast.dismiss(confirmToast);
      toast.success('Booking held successfully! 🎉');
      navigate('/hotels/confirmation');
    } catch (err: unknown) {
      const errMsg = formatHotelTraceApiError(err, 'Failed to hold booking. Please try again.');
      console.error('[Hold] error:', errMsg, err);
      setBookError(errMsg);
      setPaymentSubmitted(false);
      setProcessing(false);
      toast.dismiss(confirmToast);
      toast.error(errMsg);
    }
  };

  const handlePayment = async () => {
    if (paymentSubmitted) {
      toast.error('Payment already submitted. Please wait.');
      return;
    }
    if (supplierPriceChanged && !priceChangeAcknowledged) {
      toast.error('Please confirm the updated price before paying.');
      return;
    }
    if (!preBookResponse?.bookingCode && (preBookResponses.length === 0 || !preBookResponses[0]?.bookingCode)) {
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
      const primaryCode = useHotelStore.getState().preBookResponses[0]?.bookingCode
        ?? preBookResponse?.bookingCode
        ?? useHotelStore.getState().bookingCode
        ?? '';
      const orderData = await createHotelPaymentOrder({
        amount: payNow,
        bookingCode: primaryCode,
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
        <div className="flex items-center justify-between mb-4 rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2.5 shadow-sm">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Complete booking in</span>
          </div>
          <div className="text-sm font-bold tabular-nums text-amber-700">
            {formatTime(timeLeft)}
          </div>
        </div>

        {supplierPriceChanged && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 shadow-sm">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <div className="flex-1">
                <div className="text-sm font-semibold text-gray-900">Supplier updated the price</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  Price changed from{' '}
                  <span className="line-through">{convert(originalListingPrice)}</span> to{' '}
                  <strong className="text-gray-900">{convert(confirmedRoomTotal)}</strong>.
                </div>
                <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={priceChangeAcknowledged}
                    onChange={(e) => setPriceChangeAcknowledged(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300"
                  />
                  I confirm the updated price and wish to pay
                </label>
              </div>
            </div>
          </div>
        )}

        {preBookResponse && allRoomsPrebooked && (
          <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <RefreshCw className="h-4 w-4 text-gray-500 shrink-0" />
              <h3 className="font-semibold text-gray-900 text-sm">Cancellation Policy</h3>
            </div>
            {selectedRooms.map((room, roomIdx) => {
              const roomPreBook = preBookResponses[roomIdx] ?? (roomIdx === 0 ? preBookResponse : null);
              return (
                <div key={room.id} className={roomIdx > 0 ? 'mt-3 pt-3 border-t border-gray-100' : ''}>
                  {selectedRooms.length > 1 && (
                    <p className="text-xs font-semibold text-gray-600 mb-2">{room.name}</p>
                  )}
                  <CancellationPolicyPanel
                    cancelPolicies={roomPreBook?.cancelPolicies ?? room.cancelPolicies}
                    cancellationPolicy={roomPreBook?.cancellationPolicy ?? room.cancellationPolicy}
                    isRefundable={roomPreBook?.isRefundable ?? room._isRefundable}
                    checkInDate={searchParams.checkIn}
                    roomName={room.name}
                    size="full"
                  />
                </div>
              );
            })}
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {preBookResponse?.promotions && preBookResponse.promotions.length > 0 && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 font-bold text-emerald-900">
                  <Gift className="h-5 w-5 text-emerald-600" /> Applicable Promotions
                </h2>
                <ul className="list-inside list-disc space-y-1 text-sm text-emerald-800">
                  {preBookResponse.promotions.map((promo, idx) => (
                    <li key={idx} dangerouslySetInnerHTML={{ __html: promo }} />
                  ))}
                </ul>
              </div>
            )}

            {preBookResponse?.rateConditions && preBookResponse.rateConditions.length > 0 && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 shadow-sm">
                <h2 className="mb-3 flex items-center gap-2 font-bold text-blue-900">
                  <Info className="h-5 w-5 text-blue-600" /> Rate Conditions
                </h2>
                <ul className="list-inside list-disc space-y-1 text-sm text-blue-800">
                  {preBookResponse.rateConditions.map((cond, idx) => (
                    <li key={idx} dangerouslySetInnerHTML={{ __html: cond }} />
                  ))}
                </ul>
              </div>
            )}
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
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter coupon code"
                  disabled={couponStatus === 'applied' || couponStatus === 'validating'}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#003580] focus:outline-none focus:ring-2 focus:ring-[#003580]/20 disabled:bg-gray-50"
                />
                {couponStatus === 'applied' ? (
                  <Button variant="outline" onClick={handleRemoveCoupon} size="sm">Remove</Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleApplyCoupon}
                    size="sm"
                    disabled={couponStatus === 'validating' || !couponCode.trim()}
                  >
                    {couponStatus === 'validating' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                  </Button>
                )}
              </div>

              {couponStatus === 'applied' && couponResult && (
                <div className="mt-2 flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {couponResult.coupon?.code} applied — saving {convert(couponResult.discountAmount)}
                </div>
              )}

              {couponStatus === 'error' && couponError && (
                <div className="mt-2 flex items-center gap-1 text-sm text-red-600">
                  <XCircle className="h-4 w-4" />
                  {couponError}
                </div>
              )}

              {user.isLoggedIn && (
              <div className="mt-4 mb-4 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <Gift className="h-5 w-5 text-indigo-500" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Earn reward coins</div>
                    <div className="text-xs text-gray-500">+250 coins on this booking</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-indigo-600">+250 dYT</div>
              </div>
            )}

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-2 text-sm font-bold text-gray-900">Secure payment</h2>
              <p className="text-xs text-gray-500">
                Pay with UPI, cards, net banking, wallets, and more via Razorpay secure checkout.
              </p>
            </div>
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
                      {searchParams.rooms} Room{searchParams.rooms !== 1 ? 's' : ''} · {searchParams.adults} Adult{searchParams.adults !== 1 ? 's' : ''} total
                      {searchParams.children > 0 && ` · ${searchParams.children} Child${searchParams.children !== 1 ? 'ren' : ''} total`}
                      <br/>Total Nights: {nights}
                    </div>
                    {selectedRooms.map(r => (
                      <div key={r.id} className="mt-1 flex justify-between text-xs text-gray-500">
                        <span className="truncate mr-2">{r.name} × {r.quantity}</span>
                        <span className="shrink-0">{convert(getRoomOnlinePayable(r, r.quantity))}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Base Fare</span>
                  <span>{convert(confirmedPrice)}</span>
                </div>
                {confirmedTaxes > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Taxes & fees</span>
                    <span>{convert(confirmedTaxes)}</span>
                  </div>
                )}
                {confirmedTaxes === 0 && confirmedBreakdown.fromPreBook && (
                  <div className="text-xs text-gray-400">Taxes & fees included in total</div>
                )}
                {addOnsTotal > 0 && (
                  <div className="flex justify-between text-gray-500">
                    <span>Add-ons</span>
                    <span>{convert(addOnsTotal)}</span>
                  </div>
                )}
                {couponStatus === 'applied' && couponResult && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({couponResult.coupon?.code})</span>
                    <span>- {convert(couponResult.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-3 font-bold text-gray-900">
                  <span>Total Payable</span>
                  <span className="text-xl text-[#003580]">{convert(payNow)}</span>
                </div>
              </div>

              {bookError && (
                <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <strong>Booking error:</strong> {bookError}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={processing || paymentSubmitted || preBooking || timeLeft <= 0 || (supplierPriceChanged && !priceChangeAcknowledged)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#003580] py-3.5 text-base font-bold text-white transition-colors hover:bg-[#00224f] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {processing || paymentSubmitted ? (
                  <><Loader2 className="h-5 w-5 animate-spin" /> Processing…</>
                ) : (
                  `Pay ${convert(payNow)} Securely`
                )}
              </button>
              {/* <button
                onClick={handleHoldBooking}
                disabled={processing || paymentSubmitted || preBooking || timeLeft <= 0 || (supplierPriceChanged && !priceChangeAcknowledged)}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-[#003580] bg-white py-3.5 text-base font-bold text-[#003580] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hold Booking Without Payment
              </button> */}
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