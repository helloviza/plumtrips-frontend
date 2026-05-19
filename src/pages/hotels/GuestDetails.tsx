import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, User, Loader2, AlertTriangle } from 'lucide-react';
import HotelBookingShell from '../../components/hotels/HotelBookingShell';
import { runHotelPreBook, formatHotelTraceApiError } from '../../hooks/useHotelApi';
import { useHotelStore } from '../../stores/hotelStore';
import Button from '../../components/ui/Button';
import { generateId, formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

const guestSchema = z.object({
  title: z.enum(['Mr', 'Mrs', 'Ms', 'Miss', 'Mstr']),
  firstName: z.string().min(2, 'Min 2 characters'),
  middleName: z.string().optional(),
  lastName: z.string().min(2, 'Min 2 characters'),
  paxType: z.union([z.literal(1), z.literal(2)]), // 1=Adult, 2=Child
  age: z.number().min(1).max(12).optional(),
  leadGuest: z.boolean(),
});

const formSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile'),
  email: z.string().email('Enter valid email').optional().or(z.literal('')),
  guests: z.array(guestSchema).min(1, 'At least one guest required'),
  specialRequests: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function GuestDetails() {
  const navigate = useNavigate();
  const {
    user, setUser, setGuests, setSpecialRequests,
    selectedRooms, searchParams, selectedHotel,
    setPreBookResponse, setBookingCode, traceId,
    setCurrentStep, sessionExpired,
  } = useHotelStore();

  const [preBooking, setPreBooking] = useState(false);
  const [roomUnavailable, setRoomUnavailable] = useState(false);

  // ── Guard: must have rooms selected ──────────────────────────────────────
  useEffect(() => {
    if (sessionExpired) { toast.error('Session expired.'); navigate('/hotels'); return; }
    if (selectedRooms.length === 0) { toast.error('Please select rooms first.'); navigate('/hotels/results'); return; }
    setCurrentStep('guests');
  }, []);

  const generateInitialGuests = () => {
    const arr = [];
    for (let r = 0; r < searchParams.rooms; r++) {
      for (let a = 0; a < searchParams.adults; a++) {
        const isLead = r === 0 && a === 0;
        arr.push({
          title: (isLead ? 'Mr' : 'Mr') as 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Mstr',
          firstName: isLead ? user.firstName || '' : '',
          lastName: isLead ? user.lastName || '' : '',
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
    }
    return arr.length > 0 ? arr : [{ title: 'Mr' as const, firstName: user.firstName || '', lastName: user.lastName || '', paxType: 1 as const, leadGuest: true }];
  };

  const { register, handleSubmit, watch, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      mobile: user.mobile || '',
      email: user.email || '',
      guests: generateInitialGuests(),
    },
  });

  const { fields } = useFieldArray({ control, name: 'guests' });

  // ── PreBook before proceeding to payment ─────────────────────────────────
  const runPreBook = async (): Promise<boolean> => {
    setPreBooking(true);
    try {
      // Use the BookingCode from the first selected room
      const bookingCode = (selectedRooms[0] as any)?._bookingCode ?? selectedRooms[0]?.id;
      if (!bookingCode) {
        toast.error('No booking code found. Please re-select your room.');
        setPreBooking(false);
        return false;
      }

      if (!traceId?.trim()) {
        toast.error(
          'Missing hotel search session (traceId). Go back to hotel results and run your search again, then select your room.',
          { duration: 7000 }
        );
        setPreBooking(false);
        return false;
      }

      const preBook = await runHotelPreBook(bookingCode, traceId);

      if (!preBook.roomAvailable) {
        setRoomUnavailable(true);
        setPreBooking(false);
        return false;
      }

      setBookingCode(preBook.bookingCode);
      setPreBookResponse(preBook);
      return true;
    } catch (err: any) {
      toast.error(formatHotelTraceApiError(err, 'PreBook failed. Please try again.'));
      setPreBooking(false);
      return false;
    }
  };

  const onSubmit = async (data: FormData) => {
    if (data.guests.length < 1) { toast.error('At least one guest is required'); return; }

    setUser({
      mobile: data.mobile,
      ...(data.email ? { email: data.email } : {}),
    });
    setGuests(data.guests.map(g => ({ ...g, id: generateId() })));
    setSpecialRequests(data.specialRequests || '');

    // ── Always PreBook before payment ─────────────────────────────────────
    const success = await runPreBook();
    if (!success) return;

    setCurrentStep('checkout');
    navigate('/hotels/checkout');
  };

  const basePrice = selectedRooms.reduce((s, r) => s + (r.price + r.taxesAndFees) * r.quantity, 0);

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
        {/* Occupancy Summary */}
        <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <h2 className="font-semibold text-blue-800">Occupancy from Search</h2>
          <p className="text-sm text-blue-700 mt-1">
            {searchParams.rooms} Room{searchParams.rooms > 1 ? 's' : ''} · {searchParams.adults} Adult{searchParams.adults > 1 ? 's' : ''} per room
            {searchParams.children > 0 && ` · ${searchParams.children} Child${searchParams.children > 1 ? 'ren' : ''} per room`}
            <br />
            <span className="text-xs opacity-80">(If you need to change the number of guests or rooms, please go back and search again.)</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          {/* ── Guest Forms ── */}
          {fields.map((field, idx) => (
            <div key={field.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
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
                {watch(`guests.${idx}.paxType`) === 2 && (
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
              </div>
            </div>
          ))}

          {/* Remove "Add guest" button to enforce strict pax count matching */}

          {/* Special requests */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-gray-900">Special requests</h2>
            <textarea {...register('specialRequests')} rows={3}
              placeholder="Early check-in, high floor, extra pillows…"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-[#003580] focus:outline-none"
            />
            <p className="mt-1 text-xs text-gray-400">Requests are subject to availability and not guaranteed</p>
          </div>

          {/* Price summary */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-gray-900">Price summary</h2>
            {selectedRooms.map(r => (
              <div key={r.id} className="mb-1.5 flex justify-between text-sm text-gray-600">
                <span>{r.name} × {r.quantity}</span>
                <span>{formatCurrency(r.price * r.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm text-gray-400">
              <span>Taxes & fees</span>
              <span>{formatCurrency(selectedRooms.reduce((s, r) => s + r.taxesAndFees * r.quantity, 0))}</span>
            </div>
            <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 font-bold text-gray-900">
              <span>Estimated total</span>
              <span className="text-lg text-[#003580]">{formatCurrency(basePrice)}</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">
              * Final price confirmed after availability check
            </p>
          </div>

          <Button type="submit" fullWidth size="lg" disabled={preBooking}
            className="bg-[#003580] hover:bg-[#00224f]">
            {preBooking ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Checking availability…</>
            ) : (
              'Continue to payment'
            )}
          </Button>
        </form>
    </HotelBookingShell>
  );
}
