import { useCurrency } from '../../context/currencyContext';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, User, Loader2, AlertTriangle, CheckCircle, XCircle, Shield } from 'lucide-react';
import HotelBookingShell from '../../components/hotels/HotelBookingShell';
import HotelSearchSummaryBar from '../../components/hotels/HotelSearchSummaryBar';
// import { runHotelPreBook, formatHotelTraceApiError, getCancellationPolicyDisplay, getPolicyChargeText, formatPolicyDate } from '../../hooks/useHotelApi';
// import { CancellationPolicyPanel } from '../../components/hotels/CancellationPolicyPanel';
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
  firstName: z.string().min(2, 'Min 2 characters').regex(/^[a-zA-Z\s]+$/, 'Only alphabets and spaces allowed'),
  middleName: z.string().optional(),
  lastName: z.string().optional().or(z.literal('')).refine(val => !val || (val.length >= 2 && /^[a-zA-Z\s]+$/.test(val)), 'Invalid last name'),
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
  const ten = digits.length >= 10 ? digits.slice(-10) : digits;
  // Only return the number if it looks like a valid Indian mobile (starts with 6-9)
  return /^[6-9]\d{9}$/.test(ten) ? ten : '';
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
function GuestRow({ idx, control, register, errors, setValue, isInternational, isLeadForRoom, roomLabel }: {
  idx: number;
  control: any;
  register: any;
  errors: any;
  setValue: any;
  isInternational: boolean;
  isLeadForRoom?: boolean;
  roomLabel?: string;
}) {
  const paxType = useWatch({ control, name: `guests.${idx}.paxType`, defaultValue: 1 });
  const isChild = paxType === 2;

  // Derive guest label
  const guestLabel = roomLabel
    ? isChild ? 'Child' : (isLeadForRoom ? 'Adult 1 (Lead)' : `Adult`)
    : `Guest ${idx + 1}${idx === 0 ? ' (Lead passenger — required)' : ''}`;

  return (
    <div className={roomLabel ? '' : 'rounded-xl border border-gray-200 bg-white p-5 shadow-sm'}>
      <div className="mb-4 flex items-center gap-2">
        <User className="h-4 w-4 text-[#003580]" />
        <h2 className="text-base font-bold text-gray-900">{guestLabel}</h2>
        {!roomLabel && idx === 0 && (
          <span className="text-xs font-normal text-gray-400">(Lead passenger — required)</span>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Title</label>
          <select {...register(`guests.${idx}.title`)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors">
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Ms">Ms</option>
            <option value="Miss">Miss</option>
            <option value="Mstr">Mstr</option>
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
        {/* Age field — only shown for children */}
        {paxType === 2 && (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">Child age (1–12) *</label>
            <input
              {...register(`guests.${idx}.age`, { valueAsNumber: true })}
              type="number" min={1} max={12} placeholder="Age" disabled
              className="w-full bg-slate-100 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-2.5 cursor-not-allowed"
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
  const { convert } = useCurrency();
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

  const priceBreakdown = getConfirmedOnlinePayable(
    preBookResponse,
    selectedRooms,
    preBookResponses.length > 1 ? preBookResponses : undefined
  );
  const { baseFare: totalBaseFare, taxes: totalTaxes, totalPayable } = priceBreakdown;

  // ── Guard: must have rooms selected ──────────────────────────────────────
  useEffect(() => {
    if (navigatingAwayRef.current) return; 
    if (sessionExpired) { toast.error('Session expired.'); navigate('/hotels'); return; }
    if (selectedRooms.length === 0) { toast.error('Please select rooms first.'); navigate('/hotels/results'); return; }
    setCurrentStep('guests');
  }, []);

  const generateInitialGuests = () => {
    const arr = [];
    const roomCount = searchParams.rooms;
    
    for (let a = 0; a < searchParams.adults; a++) {
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

    return arr.length > 0 ? arr : [{
      title: 'Mr' as const,
      firstName: authName.firstName,
      lastName: authName.lastName || authName.firstName || 'Guest',
      paxType: 1 as const,
      leadGuest: true,
    }];
  };

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

  const frozenDefaultsRef = useRef<FormData | null>(null);
  if (!frozenDefaultsRef.current) {
    frozenDefaultsRef.current = {
      mobile: '',
      email: '',
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

  useEffect(() => {
    if (!globalUser) return;
    const name = parseDisplayName({
      fullName: (globalUser as NameSource).fullName,
      firstName: user.firstName,
      lastName: user.lastName,
    });
    if (name.firstName) setValue('guests.0.firstName', name.firstName, { shouldValidate: true });
    if (name.lastName) setValue('guests.0.lastName', name.lastName, { shouldValidate: true });
    
    const email = (globalUser as any).email || user.email;
    const rawPhone = (globalUser as any).phone || (globalUser as any).mobile || user.mobile;
    const phone = (rawPhone === '1234567890' || rawPhone === '9999999999') ? '' : rawPhone;
    
    if (email) setValue('email', email, { shouldValidate: true });
    if (phone) setValue('mobile', phone, { shouldValidate: true });
  }, [globalUser, setValue, user.firstName, user.lastName, user.email, user.mobile]);

  const isCorporate = watch('isCorporate');
  const { fields } = useFieldArray({ control, name: 'guests' });

  // ── Build room groups for visual grouping ─────────────────────────────────
  // Use persisted per-room breakdown (searchParams.roomGuests) if available,
  // otherwise fall back to re-running distributeGuests with the same logic
  // the selector uses — so the allocation always matches what was shown at search.
  const roomGroups = useMemo(() => {
    const totalRooms = searchParams.rooms;
    const totalAdults = searchParams.adults;
    const totalChildren = searchParams.children;

    // Build per-room configs — prefer the saved breakdown, else distribute
    let configs: Array<{ adults: number; children: number }>;

    if (searchParams.roomGuests && searchParams.roomGuests.length === totalRooms) {
      configs = searchParams.roomGuests;
    } else {
      // Mirror distributeGuests() from GuestsRoomsSelector
      configs = Array.from({ length: Math.max(1, totalRooms) }, () => ({ adults: 1, children: 0 }));
      let rem = Math.max(0, totalAdults - totalRooms);
      let i = 0;
      while (rem > 0) {
        if (configs[i].adults < 4) { configs[i].adults++; rem--; }
        i = (i + 1) % totalRooms;
      }
      rem = totalChildren;
      i = 0;
      while (rem > 0) {
        if (configs[i].children < 3) { configs[i].children++; rem--; }
        i = (i + 1) % totalRooms;
      }
    }

    const groups: Array<{ roomLabel: string; roomName: string; guestIndexes: number[] }> = [];
    let adultIdx = 0;
    let childIdx = totalAdults;
    let roomNumber = 0;

    for (const room of selectedRooms) {
      const qty = room.quantity ?? 1;
      for (let slot = 0; slot < qty; slot++) {
        const cfg = configs[roomNumber] ?? { adults: 1, children: 0 };
        const indexes: number[] = [];
        for (let a = 0; a < cfg.adults; a++) {
          if (adultIdx < totalAdults) indexes.push(adultIdx++);
        }
        for (let c = 0; c < cfg.children; c++) {
          if (childIdx < fields.length) indexes.push(childIdx++);
        }
        groups.push({ roomLabel: `Room ${roomNumber + 1}`, roomName: room.name, guestIndexes: indexes });
        roomNumber++;
      }
    }

    if (groups.length === 0 && fields.length > 0) {
      groups.push({ roomLabel: 'Room 1', roomName: selectedRooms[0]?.name ?? '', guestIndexes: fields.map((_, i) => i) });
    } else if (groups.length > 0) {
      while (adultIdx < totalAdults) groups[groups.length - 1].guestIndexes.push(adultIdx++);
      while (childIdx < fields.length) groups[groups.length - 1].guestIndexes.push(childIdx++);
    }

    return groups;
  }, [selectedRooms, fields.length, searchParams.adults, searchParams.children, searchParams.rooms, searchParams.roomGuests]);

  const processSubmit = async (data: FormData) => {
    if (processingRef.current) return;
    processingRef.current = true;
    
    setUser({
      mobile: data.mobile,
      ...(data.email ? { email: data.email } : {}),
    });
    setGuests(data.guests.map(g => ({ ...g, id: generateId() })));
    setSpecialRequests(data.specialRequests || '');

    navigatingAwayRef.current = true; 
    setCurrentStep('checkout');
    navigate('/hotels/checkout');
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
    
    if (normalizedData.guests.length < 1) { 
      toast.error('At least one guest is required'); 
      return; 
    }

    if (!globalUser) {
      setSubmitData(normalizedData);
      setPendingSubmit(true);
      openAuth();
      return;
    }

    try {
      await processSubmit(normalizedData);
    } catch (err) {
      console.error('❌ ERROR in processSubmit:', err);
      processingRef.current = false; 
      toast.error('Could not continue to payment. Please try again.');
    }
  };

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
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-base font-bold text-gray-900">Contact details</h2>
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

          {/* Guest forms — grouped by room when multi-room */}
          {roomGroups.length > 1 ? (
            roomGroups.map((group) => (
              <div key={group.roomLabel} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                {/* Room header */}
                <div className="flex items-center gap-3 bg-[#f0f4ff] border-b border-gray-200 px-5 py-3">
                  <span className="rounded-md bg-[#003580] px-2.5 py-1 text-xs font-bold text-white">{group.roomLabel}</span>
                  <span className="text-sm font-medium text-gray-600">{group.roomName}</span>
                </div>
                {/* Guest rows inside the card */}
                <div className="divide-y divide-gray-100">
                  {group.guestIndexes.map((idx) => (
                    <div key={fields[idx]?.id ?? idx} className="px-5 py-4">
                      <GuestRow
                        idx={idx}
                        control={control}
                        register={register}
                        errors={errors}
                        setValue={setValue}
                        isInternational={isInternational}
                        isLeadForRoom={idx === group.guestIndexes[0]}
                        roomLabel={group.roomLabel}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            fields.map((field, idx) => (
              <GuestRow
                key={field.id}
                idx={idx}
                control={control}
                register={register}
                errors={errors}
                setValue={setValue}
                isInternational={isInternational}
              />
            ))
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-gray-900">Special requests</h2>
            <textarea {...register('specialRequests')} rows={3}
              placeholder="Early check-in, high floor, extra pillows..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#003580] focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">Requests are subject to availability and not guaranteed</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-gray-900">Price summary</h2>
            <div className="mb-1.5 flex justify-between text-sm text-gray-600">
              <span>Base Fare</span>
              <span>{convert(totalBaseFare)}</span>
            </div>
            {totalTaxes > 0 ? (
              <div className="flex justify-between text-sm text-gray-600">
                <span>Taxes & fees</span>
                <span>{convert(totalTaxes)}</span>
              </div>
            ) : (
              <div className="text-xs text-gray-400">Taxes & fees included in total</div>
            )}
            <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 font-bold text-gray-900">
              <span>Total Payable</span>
              <span className="text-lg font-bold text-[#003580]">{convert(totalPayable)}</span>
            </div>
            <p className="mt-1 text-xs text-green-600 font-medium">
              * Price and availability confirmed
            </p>
          </div>

          <div className="flex items-center justify-between">
            <Button
              type="submit"
              fullWidth
              size="lg"
              className="bg-[#003580] hover:bg-[#00224f] text-white font-bold"
            >
              Proceed to Payment
            </Button>
          </div>
        </form>
    </HotelBookingShell>
  );
}
