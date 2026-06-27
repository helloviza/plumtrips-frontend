// import { useCurrency } from '../../hooks/useCurrency';
import { formatINR } from '../../lib/flights_api';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, User, Loader2, AlertTriangle, CheckCircle, XCircle, Shield } from 'lucide-react';
import HotelBookingShell from '../../components/hotels/HotelBookingShell';
import HotelSearchSummaryBar from '../../components/hotels/HotelSearchSummaryBar';
import { runHotelPreBook, formatHotelTraceApiError } from '../../hooks/useHotelApi';
import { useHotelStore } from '../../stores/hotelStore';
import { useAuth } from '../../context/AuthContext';
import { useUi } from '../../context/UiContext';
import Button from '../../components/ui/Button';
import { generateId } from '../../lib/utils';
import {
  getConfirmedOnlinePayable,
  getRoomsListingTotal,
  hasSupplierPriceChange,
} from '../../lib/hotelPricing';
import toast from 'react-hot-toast';

const guestSchema = z.object({
  title: z.enum(['Mr', 'Mrs', 'Ms', 'Miss', 'Mstr']),
  firstName: z.string().min(2, 'Min 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Min 2 characters'),
  paxType: z.union([z.literal(1), z.literal(2)]), // 1=Adult, 2=Child
  age: z.number().min(1).max(12).optional(),
  leadGuest: z.boolean(),
  pan: z.string().optional(),
});

const getFormSchema = (isInternational: boolean) => z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile'),
  email: z.string().email('Enter valid email').optional().or(z.literal('')),
  guests: z.array(guestSchema).min(1, 'At least one guest required'),
  specialRequests: z.string().optional(),
  isCorporate: z.boolean().optional(),
  corporatePan: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.isCorporate) {
    const corporatePan = normalizePan(data.corporatePan);
    if (!corporatePan) {
      ctx.addIssue({ path: ['corporatePan'], message: 'PAN is required for corporate bookings', code: z.ZodIssueCode.custom });
    } else if (!isValidPan(corporatePan)) {
      ctx.addIssue({ path: ['corporatePan'], message: 'Enter a valid 10-character PAN (e.g., ABCDE1234F)', code: z.ZodIssueCode.custom });
    }
  }
  if (isInternational) {
    data.guests.forEach((guest, index) => {
      if (guest.leadGuest) {
        const pan = normalizePan(guest.pan);
        if (!pan) {
          ctx.addIssue({ path: ['guests', index, 'pan'], message: 'PAN is required for international bookings', code: z.ZodIssueCode.custom });
        } else if (!isValidPan(pan)) {
          ctx.addIssue({ path: ['guests', index, 'pan'], message: 'Enter a valid 10-character PAN', code: z.ZodIssueCode.custom });
        }
      }
    });
  }
});

// We need a dummy type since the schema is now a function, but we can derive it from the return type
type FormData = z.infer<ReturnType<typeof getFormSchema>>;

type NameSource = { fullName?: string; firstName?: string; lastName?: string };

function parseDisplayName(source?: NameSource | null): { firstName: string; lastName: string } {
  if (!source) return { firstName: '', lastName: '' };
  if (source.firstName?.trim() || source.lastName?.trim()) {
    const firstName = source.firstName?.trim() || '';
    const lastName = source.lastName?.trim() || firstName || '';
    return { firstName, lastName };
  }
  const parts = (source.fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  const lastName = parts.pop()!;
  return { firstName: parts.join(' '), lastName };
}

function normalizeIndianMobile(raw?: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

function normalizePan(raw?: string): string {
  return (raw || '').trim().toUpperCase().replace(/\s+/g, '');
}

function isValidPan(raw?: string): boolean {
  const normalized = normalizePan(raw);
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(normalized);
}

function firstFormErrorMessage(errors: Record<string, unknown>): string {
  for (const val of Object.values(errors)) {
    if (!val || typeof val !== 'object') continue;
    if ('message' in val && typeof (val as { message?: unknown }).message === 'string') {
      return (val as { message: string }).message;
    }
    const nested = firstFormErrorMessage(val as Record<string, unknown>);
    if (nested) return nested;
  }
  return 'Please complete all required fields before continuing.';
}

// ── GuestRow — isolated component so useWatch is called once per guest, not on the whole form ──
function GuestRow({ idx, control, register, errors, setValue, isInternational }: {
  idx: number;
  control: any;
  register: any;
  errors: any;
  setValue: any;
  isInternational: boolean;
}) {
  const paxType = useWatch({ control, name: `guests.${idx}.paxType`, defaultValue: 1 });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900">
          <User className="mr-2 inline h-4 w-4 text-[#003580]" />
          Guest {idx + 1}
          {idx === 0 && <span className="ml-2 text-xs font-normal text-gray-400">(Lead passenger — required)</span>}
        </h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Title</label>
          <select {...register(`guests.${idx}.title`)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#003580] focus:outline-none">
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Ms">Ms</option>
            <option value="Miss">Miss</option>
            <option value="Mstr">Mstr (Child)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">First name *</label>
          <input {...register(`guests.${idx}.firstName`)} placeholder="First name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#003580] focus:outline-none"
          />
          {errors.guests?.[idx]?.firstName && (
            <p className="mt-1 text-xs text-red-500">{errors.guests[idx]?.firstName?.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Last name *</label>
          <input {...register(`guests.${idx}.lastName`)} placeholder="Last name"
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#003580] focus:outline-none"
          />
          {errors.guests?.[idx]?.lastName && (
            <p className="mt-1 text-xs text-red-500">{errors.guests[idx]?.lastName?.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Guest type</label>
          <select {...register(`guests.${idx}.paxType`, { valueAsNumber: true })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#003580] focus:outline-none">
            <option value={1}>Adult</option>
            <option value={2}>Child</option>
          </select>
        </div>
        {/* Age field — only shown for children */}
        {paxType === 2 && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Child age (1–12) *</label>
            <input
              {...register(`guests.${idx}.age`, { valueAsNumber: true })}
              type="number" min={1} max={12} placeholder="Age"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#003580] focus:outline-none"
            />
            {errors.guests?.[idx]?.age && (
              <p className="mt-1 text-xs text-red-500">{errors.guests[idx]?.age?.message}</p>
            )}
          </div>
        )}
        {/* PAN field — lead guest only, international bookings */}
        {isInternational && idx === 0 && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">PAN Number *</label>
            <input
              {...register(`guests.${idx}.pan`)}
              type="text" maxLength={10} placeholder="ABCDE1234F"
              onBlur={(e) => setValue(`guests.${idx}.pan`, e.target.value.toUpperCase().trim(), { shouldValidate: true })}
              className="w-full uppercase rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#003580] focus:outline-none"
            />
            {errors.guests?.[idx]?.pan && (
              <p className="mt-1 text-xs text-red-500">{errors.guests[idx]?.pan?.message}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function GuestDetails() {
  //const { formatINR: formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const {
    user, setUser, setGuests, setSpecialRequests,
    selectedRooms, searchParams, selectedHotel,
    preBookResponse, preBookResponses, setPreBookResponse, setPreBookResponses,
    setBookingCode, setBookingCodes, traceId,
    setCurrentStep, sessionExpired, roomGuestNames,
  } = useHotelStore();

  // Stable refs for values used inside async callbacks — avoids stale closures
  // without causing re-renders when these change during processSubmit
  const selectedRoomsRef = useRef(selectedRooms);
  const traceIdRef = useRef(traceId);
  const preBookResponseRef = useRef(preBookResponse);
  const preBookResponsesRef = useRef(preBookResponses);
  useEffect(() => { selectedRoomsRef.current = selectedRooms; }, [selectedRooms]);
  useEffect(() => { traceIdRef.current = traceId; }, [traceId]);
  useEffect(() => { preBookResponseRef.current = preBookResponse; }, [preBookResponse]);
  useEffect(() => { preBookResponsesRef.current = preBookResponses; }, [preBookResponses]);

  const { user: globalUser } = useAuth();
  const { openAuth } = useUi();
  const [pendingSubmit, setPendingSubmit] = useState(false);
  const [submitData, setSubmitData] = useState<FormData | null>(null);
  // useRef so the navigation lock is synchronous — useState batching can miss it
  const navigatingAwayRef = useRef(false);
  const processingRef = useRef(false); // prevent double-submit from useEffect deps changing

  const authName = parseDisplayName({
    fullName: (globalUser as NameSource | null)?.fullName,
    firstName: user.firstName,
    lastName: user.lastName,
  });
  const authMobile = normalizeIndianMobile(
    (globalUser as { phone?: string } | null)?.phone || user.mobile
  );

  useEffect(() => {
    if (pendingSubmit && globalUser && submitData) {
      setPendingSubmit(false);
      setSubmitData(null);
      processSubmit(submitData);
    }
  }, [globalUser, pendingSubmit, submitData]);

  const [preBooking, setPreBooking] = useState(false);
  const [roomUnavailable, setRoomUnavailable] = useState(false);
  const [priceChangeAcknowledged, setPriceChangeAcknowledged] = useState(true);

  const currentBookingCode =
    selectedRooms[0]?._bookingCode ?? selectedRooms[0]?.id ?? '';

  // All booking codes for selected rooms (used for multi-room prebook matching)
  const allBookingCodes = selectedRooms.map(r => r._bookingCode ?? r.id ?? '');

  const listingTotal = getRoomsListingTotal(selectedRooms);
  const priceBreakdown = getConfirmedOnlinePayable(
    preBookResponse,
    selectedRooms,
    preBookResponses.length > 1 ? preBookResponses : undefined
  );
  const { baseFare: totalBaseFare, taxes: totalTaxes, totalPayable } = priceBreakdown;
  const supplierPriceChanged = hasSupplierPriceChange(
    preBookResponse,
    selectedRooms,
    preBookResponses.length > 1 ? preBookResponses : undefined
  );

  // Keep acknowledgment in sync when prebook data is already in store (e.g. page refresh).
  useEffect(() => {
    if (!preBookResponse) return;
    const matchesRoom =
      !currentBookingCode ||
      preBookResponse.bookingCode === currentBookingCode ||
      preBookResponse.bookingCode === selectedRooms[0]?.id;
    if (!matchesRoom) return;
    setPriceChangeAcknowledged(
      !hasSupplierPriceChange(
        preBookResponse,
        selectedRooms,
        preBookResponses.length > 1 ? preBookResponses : undefined
      )
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preBookResponse?.bookingCode, currentBookingCode]);

  // ── Guard: must have rooms selected ──────────────────────────────────────
  useEffect(() => {
    if (navigatingAwayRef.current) return; // ref is synchronous — safe to check here
    if (sessionExpired) { toast.error('Session expired.'); navigate('/hotels'); return; }
    if (selectedRooms.length === 0) { toast.error('Please select rooms first.'); navigate('/hotels/results'); return; }
    setCurrentStep('guests');
  }, []);

  const [loadingPolicies, setLoadingPolicies] = useState(false);
  useEffect(() => {
    if (!currentBookingCode || !traceId) return;

    const isMultiRoom = selectedRooms.length > 1;

    if (isMultiRoom) {
      // Multi-room: check if all rooms have been prebooked
      const allPrebooked = allBookingCodes.every((code, idx) => {
        const resp = preBookResponses[idx];
        return resp && (resp.bookingCode === code || resp.bookingCode === selectedRooms[idx]?.id);
      });
      if (allPrebooked) return;
    } else {
      // Single room: check if prebook matches
      const prebookMatches =
        preBookResponse?.bookingCode === currentBookingCode ||
        preBookResponse?.bookingCode === selectedRooms[0]?.id;
      if (preBookResponse && prebookMatches) return;
    }

    setLoadingPolicies(true);

    // Prebook all rooms in parallel
    Promise.all(
      selectedRooms.map((room, idx) => {
        const code = room._bookingCode ?? room.id ?? '';
        if (!code) return Promise.resolve({ idx, result: null, error: 'No booking code' });
        return runHotelPreBook(code, traceId)
          .then(res => ({ idx, result: res, error: null }))
          .catch(err => ({ idx, result: null, error: err }));
      })
    ).then(results => {
      const responses: (import('../../stores/hotelStore').PreBookResponse | null)[] = new Array(selectedRooms.length).fill(null);
      let anyError = false;

      for (const { idx, result, error } of results) {
        if (error) {
          console.error(`PreBook failed for room ${idx}:`, error);
          anyError = true;
          toast.error(formatHotelTraceApiError(error, `Could not verify room ${idx + 1}. Please try again.`));
        } else if (result) {
          responses[idx] = result;
        }
      }

      if (!anyError || responses.some(r => r !== null)) {
        setPreBookResponses(responses);
        // Keep room 0 as the legacy single preBookResponse
        if (responses[0]) {
          setPreBookResponse(responses[0]);
          setBookingCode(responses[0].bookingCode);
        }
        // Store all booking codes
        const codes = responses.map((r, idx) => r?.bookingCode ?? allBookingCodes[idx] ?? '');
        setBookingCodes(codes);

        const allPriceChanged = hasSupplierPriceChange(
          responses[0],
          selectedRooms,
          responses.length > 1 ? responses : undefined
        );
        setPriceChangeAcknowledged(!allPriceChanged);
      }
    }).catch((err) => {
      console.error(err);
      toast.error(formatHotelTraceApiError(err, 'Could not verify price. Please try again.'));
    }).finally(() => setLoadingPolicies(false));

  // Re-run when the selected rooms' booking codes change (not when prebook result updates).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentBookingCode, traceId, selectedRooms.length]);

  const generateInitialGuests = () => {
    const arr = [];
    const roomCount = searchParams.rooms;
    
    console.log('🎯 GENERATING GUESTS:', {
      adults: searchParams.adults,
      children: searchParams.children,
      rooms: searchParams.rooms,
      childrenAges: searchParams.childrenAges
    });
    
    // For multi-room bookings, create `adults` adults per room
    // Total adults = searchParams.adults * roomCount? No — searchParams.adults is already
    // the per-room count. Total guests = adults + children (all rooms combined).
    // The API expects a flat guest list; leadGuest marks one adult per room.
    for (let a = 0; a < searchParams.adults; a++) {
      // First adult in the list is the lead guest (for single room or the primary room)
      const isLead = a === 0;
      
      let firstName = '';
      let lastName = '';
      
      if (isLead && roomGuestNames[0]) {
        const parts = roomGuestNames[0].trim().split(' ');
        if (parts.length > 1) {
          lastName = parts.pop() || '';
          firstName = parts.join(' ');
        } else {
          firstName = parts[0] || '';
        }
      } else if (isLead) {
        firstName = authName.firstName;
        lastName = authName.lastName;
      } else if (roomGuestNames[a]) {
        const parts = roomGuestNames[a].trim().split(' ');
        if (parts.length > 1) {
          lastName = parts.pop() || '';
          firstName = parts.join(' ');
        } else {
          firstName = parts[0] || '';
        }
      }

      arr.push({
        title: 'Mr' as 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Mstr',
        firstName,
        lastName,
        paxType: 1 as const,
        leadGuest: isLead,
      });
    }

    // Create exactly searchParams.children children
    for (let c = 0; c < (searchParams.children || 0); c++) {
      arr.push({
        title: 'Mstr' as const,
        firstName: '',
        lastName: '',
        paxType: 2 as const,
        age: searchParams.childrenAges?.[c] || 1,
        leadGuest: false,
      });
    }

    console.log('✅ TOTAL GUESTS GENERATED:', arr.length, 'for', roomCount, 'room(s)');

    return arr.length > 0 ? arr : [{
      title: 'Mr' as const,
      firstName: authName.firstName,
      lastName: authName.lastName || authName.firstName || 'Guest',
      paxType: 1 as const,
      leadGuest: true,
    }];
  };

  // Determine if international booking based on destinationCountryCode or fallback to locationId / location string
  const isInternational = (() => {
    if (searchParams.destinationCountryCode) {
      return searchParams.destinationCountryCode.toUpperCase() !== 'IN';
    }
    if (searchParams.locationId && searchParams.locationId.includes(':')) {
      return !searchParams.locationId.toUpperCase().startsWith('IN:');
    }
    if (searchParams.location) {
      const loc = searchParams.location.toLowerCase();
      if (loc.includes('india') || loc.includes(', in')) return false;
    }
    return false;
  })();

  // ── Freeze default values at mount — never recompute from live store state ──
  // useMemo with changing deps (authName, user) was causing RHF to reconcile
  // defaultValues on every store update, creating the re-render loop with 2+ rooms.
  const frozenDefaultsRef = useRef<FormData | null>(null);
  if (!frozenDefaultsRef.current) {
    frozenDefaultsRef.current = {
      mobile: authMobile,
      email: globalUser?.email || user?.email || '',
      isCorporate: false as boolean,
      corporatePan: '',
      guests: generateInitialGuests(),
    };
  }

  const formSchema = useMemo(() => getFormSchema(isInternational), [isInternational]);

  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: frozenDefaultsRef.current,
  });

  // Pre-fill from auth profile once it loads (signed-in users).
  useEffect(() => {
    if (!globalUser) return;
    const mobile = normalizeIndianMobile((globalUser as { phone?: string }).phone);
    if (mobile) setValue('mobile', mobile, { shouldValidate: true });
    if (globalUser.email) setValue('email', globalUser.email);
    const name = parseDisplayName({
      fullName: (globalUser as NameSource).fullName,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    if (name.firstName) setValue('guests.0.firstName', name.firstName, { shouldValidate: true });
    if (name.lastName) setValue('guests.0.lastName', name.lastName, { shouldValidate: true });
  }, [globalUser, setValue, user.firstName, user.lastName]);

  const isCorporate = watch('isCorporate');
  const { fields } = useFieldArray({ control, name: 'guests' });

  // ── PreBook before proceeding to payment ─────────────────────────────────
  const runPreBook = async (): Promise<boolean> => {
    console.log('📞 RunPreBook: Starting for', selectedRoomsRef.current.length, 'room(s)');
    setPreBooking(true);
    try {
      // Read from refs — stable even during re-renders
      const rooms = selectedRoomsRef.current;
      const tid = traceIdRef.current;

      if (!tid?.trim()) {
        toast.error(
          'Missing hotel search session (traceId). Go back to hotel results and run your search again, then select your room.',
          { duration: 7000 }
        );
        setPreBooking(false);
        return false;
      }

      // Prebook all rooms in parallel
      const results = await Promise.all(
        rooms.map((room, idx) => {
          const code = (room as any)._bookingCode ?? room.id ?? '';
          if (!code) return Promise.resolve({ idx, result: null as import('../../stores/hotelStore').PreBookResponse | null, error: 'No booking code' as any });
          return runHotelPreBook(code, tid)
            .then(res => ({ idx, result: res, error: null as any }))
            .catch(err => ({ idx, result: null as import('../../stores/hotelStore').PreBookResponse | null, error: err }));
        })
      );

      const responses: (import('../../stores/hotelStore').PreBookResponse | null)[] = new Array(rooms.length).fill(null);
      let anyUnavailable = false;

      for (const { idx, result, error } of results) {
        if (error) {
          console.error(`❌ RunPreBook: Room ${idx} failed:`, error);
          toast.error(formatHotelTraceApiError(error, `Could not verify room ${idx + 1}. Please try again.`));
          setPreBooking(false);
          return false;
        }
        if (!result) {
          setPreBooking(false);
          return false;
        }
        if (!result.roomAvailable) {
          anyUnavailable = true;
        }
        responses[idx] = result;
      }

      if (anyUnavailable) {
        setRoomUnavailable(true);
        setPreBooking(false);
        return false;
      }

      // Store all per-room prebook responses
      setPreBookResponses(responses);
      if (responses[0]) {
        setPreBookResponse(responses[0]);
        setBookingCode(responses[0].bookingCode);
      }
      const codes = responses.map((r, idx) => r?.bookingCode ?? ((rooms[idx] as any)._bookingCode ?? rooms[idx]?.id ?? ''));
      setBookingCodes(codes);

      setPriceChangeAcknowledged(
        !hasSupplierPriceChange(
          responses[0],
          rooms,
          responses.length > 1 ? responses : undefined
        )
      );
      return true;
    } catch (err: any) {
      console.error('❌ RunPreBook: API error', err);
      toast.error(formatHotelTraceApiError(err, 'PreBook failed. Please try again.'));
      return false;
    } finally {
      setPreBooking(false);
    }
  };

  const processSubmit = async (data: FormData) => {
    if (processingRef.current) return; // prevent double-execution
    processingRef.current = true;
    console.log('🚀 ProcessSubmit: Setting user and guests');
    setUser({
      mobile: data.mobile,
      ...(data.email ? { email: data.email } : {}),
    });
    setGuests(data.guests.map(g => ({ ...g, id: generateId() })));
    setSpecialRequests(data.specialRequests || '');

    // ── Always PreBook before payment ─────────────────────────────────────
    console.log('🔄 ProcessSubmit: Running prebook...');
    const success = await runPreBook();
    console.log('PreBook result:', success);
    
    if (!success) {
      console.log('❌ ProcessSubmit: PreBook failed, stopping');
      processingRef.current = false; // allow retry
      return;
    }

    console.log('✅ ProcessSubmit: PreBook successful, navigating to checkout');
    navigatingAwayRef.current = true; // set synchronously before any re-renders
    setCurrentStep('checkout');
    console.log('🔄 Calling React Router navigate("/hotels/checkout")');
    try {
      navigate('/hotels/checkout');
    } catch (e) {
      console.error('❌ Navigate threw error:', e);
    }
  };

  const onInvalid = (formErrors: typeof errors) => {
    toast.error(firstFormErrorMessage(formErrors as Record<string, unknown>));
    const firstGuestError = formErrors.guests?.findIndex?.(
      (g) => g && (g.firstName || g.lastName || g.pan || g.age)
    );
    if (typeof firstGuestError === 'number' && firstGuestError >= 0) {
      document.querySelector(`[name="guests.${firstGuestError}.firstName"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (formErrors.mobile) {
      document.querySelector('[name="mobile"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const onSubmit = async (data: FormData) => {
    const normalizedData: FormData = {
      ...data,
      corporatePan: normalizePan(data.corporatePan),
      guests: data.guests.map((guest) => ({
        ...guest,
        pan: normalizePan(guest.pan),
      })),
    };

    console.log('🔍 DEBUG - Form submission started');
    console.log('Guest count:', normalizedData.guests.length);
    console.log('SupplierPriceChanged:', supplierPriceChanged);
    console.log('PriceChangeAcknowledged:', priceChangeAcknowledged);
    console.log('GlobalUser:', globalUser);
    console.log('TraceId:', traceId);
    console.log('BookingCode:', currentBookingCode);
    console.log('PreBookResponse:', preBookResponse);
    
    if (normalizedData.guests.length < 1) { 
      console.log('❌ Blocked: No guests');
      toast.error('At least one guest is required'); 
      return; 
    }

    if (supplierPriceChanged && !priceChangeAcknowledged) {
      console.log('❌ Blocked: Price change not acknowledged');
      toast.error('Please confirm the updated price before continuing.');
      return;
    }

    if (!globalUser) {
      console.log('❌ Blocked: User not authenticated, opening auth modal');
      setSubmitData(normalizedData);
      setPendingSubmit(true);
      openAuth();
      return;
    }

    try {
      console.log('✅ All checks passed, proceeding to processSubmit');
      await processSubmit(normalizedData);
    } catch (err) {
      console.error('❌ ERROR in processSubmit:', err);
      processingRef.current = false; // allow retry on error
      toast.error('Could not continue to payment. Please try again.');
    }
  };

  // ── Room unavailable screen ───────────────────────────────────────────────
  if (roomUnavailable) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f7fa] px-4">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-lg">
          <AlertTriangle className="mx-auto mb-4 h-16 w-16 text-orange-500" />
          <h2 className="mb-2 text-xl font-bold text-gray-900">Room no longer available</h2>
          <p className="mb-6 text-gray-500">
            Sorry, this room was just booked by someone else. Please go back and select another room.
          </p>
          <Button fullWidth onClick={() => {
            setRoomUnavailable(false);
            navigate(`/hotels/${selectedHotel?.id}/rooms`);
          }}>
            Select another room
          </Button>
        </div>
      </div>
    );
  }

  return (
    <HotelBookingShell
      activeStep={2}
      maxWidth="4xl"
      title="Enter guest details"
      subtitle={selectedHotel?.name}
      onBack={() => navigate(-1)}
    >
      <HotelSearchSummaryBar />

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-5">
          {/* ── Contact Details ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-gray-900">Contact details</h2>

            {/* Mobile */}
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Mobile number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm text-gray-600 shrink-0">+91</div>
                <input
                  {...register('mobile')}
                  type="tel" maxLength={10}
                  placeholder="10-digit mobile"
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#003580] focus:outline-none"
                />
              </div>
              {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Email <span className="text-xs text-gray-400">(optional — for confirmation)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input {...register('email')} type="email" placeholder="your@email.com"
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-4 text-sm focus:border-[#003580] focus:outline-none"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
          </div>

          {/* Corporate Booking Details — only shown when hotel allows corporate bookings */}
          {preBookResponse?.corporateBookingAllowed && (
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-gray-900">Booking Type</h2>
            
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  {...register('isCorporate')}
                  className="w-4 h-4 text-[#003580] border-gray-300 rounded focus:ring-[#003580]"
                />
                <span className="text-sm font-medium text-gray-700">Is this a Corporate Booking?</span>
              </label>
            </div>

            {isCorporate && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Corporate PAN Card Number <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('corporatePan')}
                  type="text"
                  maxLength={10}
                  placeholder="e.g. ABCDE1234F"
                  onBlur={(e) => setValue('corporatePan', normalizePan(e.target.value), { shouldValidate: true })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-[#003580] focus:outline-none uppercase"
                />
                {errors.corporatePan && <p className="mt-1 text-xs text-red-500">{errors.corporatePan.message}</p>}
              </div>
            )}
          </div>
          )}

          {/* ── Guest Forms ── */}
          {fields.map((field, idx) => (
            <GuestRow
              key={field.id}
              idx={idx}
              control={control}
              register={register}
              errors={errors}
              setValue={setValue}
              isInternational={isInternational}
            />
          ))}

          {/* Remove "Add guest" button to enforce strict pax count matching */}
          {/* Special requests */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-gray-900">Special requests</h2>
            <textarea {...register('specialRequests')} rows={3}
              placeholder="Early check-in, high floor, extra pillows..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#003580] focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">Requests are subject to availability and not guaranteed</p>
          </div>

          {/* Cancellation Policy — shown for each selected room */}
          {selectedRooms.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm relative overflow-hidden mt-6">
              {loadingPolicies && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 backdrop-blur-[2px]">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                    <span className="text-sm font-semibold text-slate-700">Fetching latest policies...</span>
                  </div>
                </div>
              )}
              
              <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-slate-700" />
                  <h3 className="font-bold text-slate-900">Cancellation Policy</h3>
                  {selectedRooms.length > 1 && (
                    <span className="text-xs text-slate-500">({selectedRooms.length} rooms)</span>
                  )}
                </div>
              </div>

              {selectedRooms.map((room, roomIdx) => {
                // Prefer the prebook response for this room; fall back to room 0's legacy
                // response; fall back to null (will use room-level data from search).
                const roomPreBook = preBookResponses[roomIdx] ?? (roomIdx === 0 ? preBookResponse : null);

                // Best available policy text — prebook wins over search data
                const rawPolicyText =
                  roomPreBook?.cancellationPolicy ||
                  room.cancellationPolicy ||
                  '';
                const isGenericMsg =
                  !rawPolicyText ||
                  rawPolicyText === 'Please check hotel cancellation policy';
                const policyText = isGenericMsg ? '' : rawPolicyText;

                // Best available cancel-policy slabs — prebook wins over search data
                const preBookPolicies: any[] = (roomPreBook as any)?.cancelPolicies ?? [];
                const roomPolicies: any[] = room.cancelPolicies ?? [];
                const policies: any[] = preBookPolicies.length > 0 ? preBookPolicies : roomPolicies;

                // A room is refundable when:
                //  • the policy text doesn't say "non-refundable", OR
                //  • the room's _isRefundable flag is true, OR
                //  • there's a zero-charge slab in the policy array
                const textSaysNonRefundable = policyText.toLowerCase().includes('non-refundable');
                const hasFreeSlab = policies.some((p: any) => p.charge === 0);
                const isRefundable =
                  (room as any)._isRefundable === true ||
                  hasFreeSlab ||
                  (!textSaysNonRefundable && (policyText !== '' || policies.length > 0));

                // Penalty slabs (charge > 0) sorted by fromDate ascending
                const penaltySlabs = policies
                  .filter((p: any) => p.charge > 0)
                  .sort((a: any, b: any) => {
                    if (!a.fromDate) return 1;
                    if (!b.fromDate) return -1;
                    return new Date(a.fromDate).getTime() - new Date(b.fromDate).getTime();
                  });

                // The free-cancel deadline is the day before the first penalty slab starts
                const firstPenaltyFromDate = penaltySlabs[0]?.fromDate ?? null;

                const formatPolicyDate = (dStr: string) => {
                  if (!dStr) return '';
                  try {
                    let parseStr = dStr;
                    // Handle DD-MM-YYYY [HH:MM:SS] format from TBO
                    const match = dStr.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(.*))?$/);
                    if (match) {
                      parseStr = `${match[3]}-${match[2]}-${match[1]}${match[4] ? 'T' + match[4] : ''}`;
                    }
                    const d = new Date(parseStr);
                    if (isNaN(d.getTime())) return dStr;
                    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                  } catch { return dStr; }
                };

                const getDayBefore = (dStr: string) => {
                  if (!dStr) return '';
                  try {
                    let parseStr = dStr;
                    const match = dStr.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(.*))?$/);
                    if (match) {
                      parseStr = `${match[3]}-${match[2]}-${match[1]}${match[4] ? 'T' + match[4] : ''}`;
                    }
                    const d = new Date(parseStr);
                    if (isNaN(d.getTime())) return formatPolicyDate(dStr);
                    d.setDate(d.getDate() - 1);
                    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                  } catch { return formatPolicyDate(dStr); }
                };

                return (
                  <div key={room.id} className={`p-5 ${roomIdx > 0 ? 'border-t border-slate-100' : ''}`}>
                    {/* Room name + refundability badge */}
                    <div className="flex items-center justify-between mb-3">
                      {selectedRooms.length > 1 && (
                        <span className="text-sm font-semibold text-slate-700">{room.name}</span>
                      )}
                      <span className={`ml-auto text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                        isRefundable
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isRefundable ? 'Refundable' : 'Non-Refundable'}
                      </span>
                    </div>

                    {/* Policy text — only show if non-generic and adds info beyond the timeline */}
                    {policyText && (
                      <div className="text-sm text-slate-700 mb-4 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                        {policyText}
                      </div>
                    )}

                    {/* Policy timeline — always shown when we have refundability info */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                        Policy Timeline
                      </h4>

                      {/* Free Cancellation row — shown whenever the room is refundable */}
                      {isRefundable && (
                        <div className="flex items-start gap-3 bg-emerald-50/50 border border-emerald-100 p-3 rounded-xl">
                          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-emerald-900 text-sm">Free Cancellation</div>
                            {firstPenaltyFromDate && (
                              <div className="text-emerald-700 text-xs mt-0.5">
                                until {getDayBefore(firstPenaltyFromDate)}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Penalty charge slabs */}
                      {penaltySlabs.map((policy: any, idx: number) => {
                        const chargeText =
                          policy.chargeType === 2
                            ? `${policy.charge}% cancellation charge`
                            : `₹${policy.charge} cancellation charge`;
                        const fromText = policy.fromDate
                          ? `From ${formatPolicyDate(policy.fromDate)}`
                          : 'After free cancellation period';

                        return (
                          <div key={idx} className="flex items-start gap-3 bg-rose-50/50 border border-rose-100 p-3 rounded-xl">
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-semibold text-rose-900 text-sm">{fromText}</div>
                              <div className="text-rose-700 text-xs mt-0.5">{chargeText}</div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Non-refundable — no timeline to show */}
                      {!isRefundable && penaltySlabs.length === 0 && (
                        <div className="flex items-start gap-3 bg-rose-50/50 border border-rose-100 p-3 rounded-xl">
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <div className="font-semibold text-rose-900 text-sm">Non-Refundable</div>
                            <div className="text-rose-700 text-xs mt-0.5">No refund on cancellation</div>
                          </div>
                        </div>
                      )}

                      {/* Still loading prebook for this room */}
                      {loadingPolicies && !roomPreBook && (
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Confirming policy with supplier…
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Price summary */}
          {supplierPriceChanged && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-gray-900">Supplier updated the price</div>
                  <div className="text-xs text-gray-600 mt-1">
                    Price changed from{' '}
                    <span className="line-through">{formatINR(listingTotal)}</span> to{' '}
                    <strong className="text-gray-900">{formatINR(totalPayable)}</strong>.
                  </div>
                  <label className="mt-3 flex cursor-pointer items-start gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={priceChangeAcknowledged}
                      onChange={(e) => setPriceChangeAcknowledged(e.target.checked)}
                      className="mt-0.5 rounded border-gray-300"
                    />
                    I confirm the updated price and wish to continue
                  </label>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-gray-900">Price summary</h2>
            <div className="mb-1.5 flex justify-between text-sm text-gray-600">
              <span>Base Fare</span>
              <span>{formatINR(totalBaseFare)}</span>
            </div>
            {totalTaxes > 0 ? (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxes & fees</span>
                <span>{formatINR(totalTaxes)}</span>
              </div>
            ) : (
              <div className="text-xs text-gray-400">Taxes & fees included in total</div>
            )}
            <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 font-bold text-gray-900">
              <span>Total Payable</span>
              <span className="text-lg text-[#003580]">{formatINR(totalPayable)}</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              {priceBreakdown.fromPreBook
                ? '* Price confirmed with supplier'
                : '* Final price confirmed after availability check'}
            </p>
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={preBooking || loadingPolicies}
            className="bg-[#003580] hover:bg-[#00224f] disabled:opacity-60"
          >
            {preBooking || loadingPolicies ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Checking availability…</>
            ) : supplierPriceChanged && !priceChangeAcknowledged ? (
              'Confirm updated price to continue'
            ) : (
              'Continue to payment'
            )}
          </Button>
          {supplierPriceChanged && !priceChangeAcknowledged && (
            <p className="mt-2 text-center text-xs text-amber-700">
              Check the box above to confirm the supplier&apos;s updated price.
            </p>
          )}
        </form>
    </HotelBookingShell>
  );
}


