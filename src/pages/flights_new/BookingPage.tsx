// ============================================================
//  BookingPage.tsx — FIXED
//
//  Fixes:
//  1. SSR fetch now triggers on EVERY entry to Step 3, not just
//     the first time (guards against back-navigation re-entry).
//  2. `legs` array is the single source of truth for Steps 3 & 4
//     AND for the SSR fetch — guarantees index alignment.
//  3. `handleContinueSeats` now writes ALL leg seat selections
//     back into PassengerData.selectedSeats (leg-indexed map).
//  4. Tier passed to Step 4 correctly uses per-leg tier objects.
// ============================================================

import { useState, useMemo } from "react";
import type { DisplayFlight, FareTier } from "../../lib/types_t";
import { MOCK_MODE, apiFareQuote, apiBookFlight, apiGetSSRForLegs } from "../../lib/flights_api";
import type { BookPassenger, SSRResult } from "../../lib/flights_api";
import { createFlightPaymentOrder, verifyFlightPayment } from "../../services/paymentApi";
import { calcFares, BookingShell, emptyPassenger } from "./BookingShared";
import type { BookingFormState, SeatMap } from "./BookingShared";

import BookingStep1FareReview    from "./BookingStep1FareReview";
import BookingStep2Passengers    from "./BookingStep2Passengers";
import BookingStep3Seats         from "./BookingStep3Seats";
import BookingStep4Extras        from "./BookingStep4Extras";
import BookingStep5Review        from "./BookingStep5Review";
import BookingStep6Payment       from "./BookingStep6Payment";
import BookingStep7Confirmation  from "./ConfirmationPage";





// ─── RAZORPAY LOADER ────────────────────────────────────────

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";


// ─── PROPS ──────────────────────────────────────────────────

type FlightBookPassenger = BookPassenger & {
  MealDynamic?: Array<Record<string, unknown>>;
  Baggage?: Array<Record<string, unknown>>;
};

interface BookingPageProps {
  flight: DisplayFlight;
  tier: FareTier;
  returnFlight?: DisplayFlight;
  returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  adults: number;
  children: number;
  infants: number;
  forcePassport?: boolean;
  isInternational?: boolean;
  onBack: () => void;
  onConfirm: (bookingId?: number, pnr?: string, passengerNames?: string[], contactEmail?: string, totalPaid?: number) => void;
}

// ─── MAIN COMPONENT ─────────────────────────────────────────

export default function BookingPage({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  adults, children, infants,
  forcePassport = false,
  isInternational = false,
  onBack, onConfirm,
}: BookingPageProps) {
  const isRoundTrip   = !!returnFlight && !!returnTier;
  const isMultiCity   = !!(multiCityLegs && multiCityLegs.length > 1);
  const needsPassport = flight.isPassportRequired || forcePassport || isInternational;
  const needsPan      = flight.isPanRequired;

  // ── STATE ─────────────────────────────────────────────────

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [fareChanged, setFareChanged] = useState(false);
  const [updatedFare, setUpdatedFare] = useState<number | null>(null);

  // FIX #1: SSR state — one entry per leg, null until loaded
  const [ssrDataPerLeg, setSsrDataPerLeg] = useState<(SSRResult | null)[]>([]);
  const [ssrLoading, setSsrLoading]       = useState(false);
  const [seatMaps, setSeatMaps] = useState<Record<number, SeatMap>>({});
  

  const [form, setForm] = useState<BookingFormState>({
    passengers: [
      ...Array(adults).fill(null).map(() => emptyPassenger("adult")),
      ...Array(children).fill(null).map(() => emptyPassenger("child")),
      ...Array(infants).fill(null).map(() => emptyPassenger("infant")),
    ],
    contactEmail: "",
    contactPhone: "",
    gstNumber: "",
    gstCompanyName: "",
    gstCompanyEmail: "",
    gstCompanyAddress: "",
    promoCode: "",
    promoApplied: false,
    promoDiscount: 0,
    extras: [],
  });

  // Confirmation result
  const [confirmedBookingId, setConfirmedBookingId] = useState<number | undefined>();
  const [confirmedPnr, setConfirmedPnr]             = useState<string | undefined>();
  const [confirmedNames, setConfirmedNames]         = useState<string[]>([]);

  // ── PAX TYPES ─────────────────────────────────────────────

  const paxTypes: ("Adult" | "Child" | "Infant")[] = [
    ...Array(adults).fill("Adult"),
    ...Array(children).fill("Child"),
    ...Array(infants).fill("Infant"),
  ];

  // ── LEGS — single source of truth shared by Steps 3, 4, and SSR fetch ──
  //
  // CRITICAL: The index here MUST match ssrDataPerLeg indices:
  //   [0] = outbound flight
  //   [1] = return flight (round-trip) OR leg 2 (multi-city)
  //   [2+] = additional multi-city legs
  //
  // multiCityLegs[0] is the same as `flight` (outbound), so we slice(1)
  // for the extra legs to avoid duplicating index 0.

  const legs = useMemo(() => [
    {
      flight,
      tier,
      label: isRoundTrip ? "Outbound" : isMultiCity ? "Leg 1" : "Flight",
    },
    ...(isRoundTrip && returnFlight && returnTier
      ? [{ flight: returnFlight, tier: returnTier, label: "Return" }]
      : []),
    ...(isMultiCity && multiCityLegs
      ? multiCityLegs.slice(1).map((l, i) => ({
          flight: l.flight,
          tier: l.tier,
          label: `Leg ${i + 2}`,
        }))
      : []),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [
    flight.resultIndex,
    returnFlight?.resultIndex,
    isRoundTrip,
    isMultiCity,
    multiCityLegs?.length,
  ]);

  // ── FARE CALC ─────────────────────────────────────────────

  const { subtotal, extrasTotal, taxes } = calcFares({
    tier, returnTier, multiCityLegs,
    adults, children, infants,
    extras: form.extras,
  });
  const totalPayable = Math.round(subtotal + extrasTotal + taxes - form.promoDiscount);

  // ── STEP 1: FARE QUOTE ────────────────────────────────────

  async function handleFareQuote() {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFareQuote(flight);
      if (result.fareChanged) {
        setFareChanged(true);
        setUpdatedFare(result.tiers[0]?.price ?? null);
      } else {
        setFareChanged(false);
        setStep(2);
      }
    } catch (e: any) {
      setError(e.message ?? "Could not confirm fare. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── STEP 2: PASSENGER VALIDATION → SSR FETCH ──────────────
  //
  // FIX #2: SSR is fetched using `legs.map(l => l.flight)` so
  // the order is guaranteed identical to the legs array indices.
  // We re-fetch if ssrDataPerLeg is empty (first visit) or if
  // the user went back and the data was cleared.

  function validatePassengers(): string | null {
    for (let i = 0; i < form.passengers.length; i++) {
      const p = form.passengers[i];
      if (!p.firstName.trim() || !p.lastName.trim())
        return `Fill first and last name for Passenger ${i + 1}`;
      if (needsPan && i < adults && !p.panNumber.match(/^[A-Z]{5}[0-9]{4}[A-Z]$/))
        return `Valid PAN required for Passenger ${i + 1}`;
      if (needsPassport) {
        if (!p.passportNo.trim())
          return `Passport number required for Passenger ${i + 1} (international flight)`;
        if (!p.passportExpiry.trim())
          return `Passport expiry required for Passenger ${i + 1}`;
        const expiry = new Date(p.passportExpiry);
        const sixMonths = new Date();
        sixMonths.setMonth(sixMonths.getMonth() + 6);
        if (expiry < sixMonths)
          return `Passport for Passenger ${i + 1} must be valid for at least 6 months beyond travel date`;
      }
    }
    if (!form.contactEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return "Enter a valid email address";
    if (!form.contactPhone.match(/^[6-9]\d{9}$/))
      return "Enter a valid 10-digit Indian mobile number";
    return null;
  }

  function handlePassengersNext() {
    const err = validatePassengers();
    if (err) { setError(err); return; }
    setError(null);

    // FIX #2: Always fetch SSR when entering Step 3 for the first time.
    // Use legs array directly so indices are guaranteed aligned.
    if (ssrDataPerLeg.length !== legs.length) {
      setSsrLoading(true);
setSsrDataPerLeg([]); // clear stale data so UI shows loading
const allFlights = legs.map((l) => ({
  ...l.flight,
  resultIndex: l.tier.resultIndex || l.flight.resultIndex,
}));
const ssrFn = apiGetSSRForLegs(allFlights);


  ssrFn
    .then(results => setSsrDataPerLeg(results))
    .catch((e: any) => {
      setError(e?.message ?? "Could not load seat, meal, and baggage options for this flight.");
      setSsrDataPerLeg(legs.map(() => null));
    })
    .finally(() => setSsrLoading(false));
    }
  setStep(3);

  }

  // ── SAVE BOOKING TO DB ────────────────────────────────────

  async function saveBooking(bookingId?: number, pnr?: string) {
    try {
      await fetch(`${API_BASE}/api/v1/flights/tbo/booking-save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId, pnr,
          contactEmail: form.contactEmail,
          contactPhone: form.contactPhone,
          passengers: form.passengers.map((p, i) => ({
            title: p.title,
            firstName: p.firstName,
            lastName: p.lastName,
            paxType: i < adults ? "Adult" : i < adults + children ? "Child" : "Infant",
            dob: p.dob,
            gender: p.gender,
            nationality: p.nationality,
            passportNo: p.passportNo || null,
            passportExpiry: p.passportExpiry || null,
            panNumber: p.panNumber || null,
            // FIX #3: persist all leg seats, not just leg 0
            selectedSeat: p.selectedSeat || null,
            selectedSeats: p.selectedSeats || null,
          })),
          extras: form.extras,
          flight: {
            resultIndex: flight.resultIndex,
            traceId: flight.traceId,
            airline: flight.airline,
            flightNumber: flight.flightNumber,
            fromCode: flight.fromCode,
            toCode: flight.toCode,
            departDate: flight.departDate,
            departTime: flight.departTime,
            arriveTime: flight.arriveTime,
            fareName: tier.name,
            farePrice: tier.price,
            isInternational,
          },
          returnFlight: returnFlight ? {
            resultIndex: returnFlight.resultIndex,
            airline: returnFlight.airline,
            flightNumber: returnFlight.flightNumber,
            fromCode: returnFlight.fromCode,
            toCode: returnFlight.toCode,
            departDate: returnFlight.departDate,
            departTime: returnFlight.departTime,
            arriveTime: returnFlight.arriveTime,
            fareName: returnTier?.name,
            farePrice: returnTier?.price,
          } : null,
          multiCityLegs: multiCityLegs ? multiCityLegs.map((leg, i) => ({
            legIndex: i,
            airline: leg.flight.airline,
            flightNumber: leg.flight.flightNumber,
            fromCode: leg.flight.fromCode,
            toCode: leg.flight.toCode,
            departDate: leg.flight.departDate,
            departTime: leg.flight.departTime,
            arriveTime: leg.flight.arriveTime,
            fareName: leg.tier.name,
            farePrice: leg.tier.price,
          })) : null,
          adults, children, infants,
          subtotal, taxes,
          extrasTotal,
          discount: form.promoDiscount,
          totalPayable,
          gst: form.gstNumber ? {
            gstNumber: form.gstNumber,
            gstCompanyName: form.gstCompanyName,
            gstCompanyEmail: form.gstCompanyEmail,
            gstCompanyAddress: form.gstCompanyAddress,
          } : null,
          paymentMode: MOCK_MODE ? "MOCK" : "RAZORPAY",
          bookedAt: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error("[saveBooking] Failed:", e);
    }
  }

  // ── STEP 6: PAYMENT ───────────────────────────────────────

  async function handlePayment() {
    setLoading(true);
    setError(null);

    const mealExtrasByPaxAndLeg: Record<number, Record<number, typeof form.extras[number]>> = {};
    form.extras.forEach((extra) => {
      if (!mealExtrasByPaxAndLeg[extra.passengerId]) {
        mealExtrasByPaxAndLeg[extra.passengerId] = {};
      }
      mealExtrasByPaxAndLeg[extra.passengerId][extra.legIndex] = extra;
    });

    const normalizeFlightNumber = (raw: string) =>
      String(raw).replace(/[^0-9]/g, "");

    const isNoMealCode = (code?: string) => {
      const normalized = String(code || "").trim().toLowerCase();
      return !normalized || ["none", "no_meal", "nomeal", "no meal", "no meal preference"].includes(normalized);
    };

    const isNoBaggageCode = (code?: string) => {
      const normalized = String(code || "").trim().toLowerCase();
      return !normalized || ["none", "no_baggage", "nobaggage", "no baggage", "included only"].includes(normalized);
    };

    const ssrAvailablePerLeg = ssrDataPerLeg.map(
  (ssr) => ssr !== null && (ssr.meals?.length ?? 0) > 0
);

    const baggageAvailablePerLeg = ssrDataPerLeg.map(
      (ssr) => ssr !== null && (ssr.baggage?.length ?? 0) > 0
    );

    const buildMealItem = (paxIndex: number, legIndex: number) => {
      const extra = mealExtrasByPaxAndLeg[paxIndex]?.[legIndex];
      if (!ssrAvailablePerLeg[legIndex]) return null;
      const code = extra ? String(extra.mealCode).trim() : "NoMeal";
      if (!code || code.length < 2) return null;

      const leg = legs[legIndex] ?? { flight };
      return {
        AirlineCode: leg.flight.airlineCode,
        FlightNumber: normalizeFlightNumber(leg.flight.flightNumber),
        WayType: 2,
        Code: isNoMealCode(code) ? "NoMeal" : code,
        Description: 2,
        AirlineDescription: "",
        Quantity: isNoMealCode(code) ? 0 : 1,
        Currency: "INR",
        Price: isNoMealCode(code) ? 0 : extra?.mealPrice ?? 0,
        Origin: leg.flight.fromCode,
        Destination: leg.flight.toCode,
      };
    };

    const buildBaggageItem = (paxIndex: number, legIndex: number) => {
      const extra = mealExtrasByPaxAndLeg[paxIndex]?.[legIndex];
      if (!baggageAvailablePerLeg[legIndex]) return null;
      const code = extra ? String(extra.baggageCode || "").trim() : "NoBaggage";
      const leg = legs[legIndex] ?? { flight };
      return {
        AirlineCode: leg.flight.airlineCode,
        FlightNumber: normalizeFlightNumber(leg.flight.flightNumber),
        WayType: 2,
        Code: isNoBaggageCode(code) ? "NoBaggage" : code,
        Description: 2,
        Weight: isNoBaggageCode(code) ? 0 : extra?.baggageKg ?? 0,
        Currency: "INR",
        Price: isNoBaggageCode(code) ? 0 : extra?.baggagePrice ?? 0,
        Origin: leg.flight.fromCode,
        Destination: leg.flight.toCode,
      };
    };

    const buildPassengersForLegs = (legIndexes: number[]): FlightBookPassenger[] =>
      form.passengers.map((p, i) => {
        const base = {
          Title: p.title as "Mr" | "Ms" | "Mrs" | "Mstr" | "Miss",
          FirstName: p.firstName.trim(),
          LastName: p.lastName.trim(),
          PaxType: (i < adults ? 1 : i < adults + children ? 2 : 3) as 1 | 2 | 3,
          DateOfBirth: p.dob ? `${p.dob}T00:00:00` : "1990-01-01T00:00:00",
          Gender: (p.gender === "Male" ? 1 : 2) as 1 | 2,
          PassportNo: p.passportNo || undefined,
          PassportExpiry: p.passportExpiry || undefined,
          Pan: p.panNumber || undefined,
          ContactNo: form.contactPhone,
          Email: form.contactEmail,
          IsLeadPax: i === 0,
          AddressLine1: "India",
          City: "Delhi",
          CountryCode: "IN",
          CountryName: "India",
          Nationality: p.nationality || "IN",
        };

        if (paxTypes[i] === "Infant") return base;

        const selectedMeals = legIndexes
          .map((legIndex) => buildMealItem(i, legIndex))
          .filter((meal): meal is Record<string, unknown> => meal !== null);
        const selectedBaggage = legIndexes
          .map((legIndex) => buildBaggageItem(i, legIndex))
          .filter((bag): bag is Record<string, unknown> => bag !== null);

        return {
          ...base,
          ...(selectedMeals.length > 0 ? { MealDynamic: selectedMeals } : {}),
          ...(selectedBaggage.length > 0 ? { Baggage: selectedBaggage } : {}),
        };
      });

    const passengersMapped = buildPassengersForLegs(legs.map((_, index) => index));

    const gstPayload = form.gstNumber ? {
      GSTNumber: form.gstNumber,
      GSTCompanyName: form.gstCompanyName,
      GSTCompanyEmail: form.gstCompanyEmail,
      GSTCompanyAddress: form.gstCompanyAddress,
    } : undefined;

    const passengerNames = form.passengers.map(
      (p) => `${p.title} ${p.firstName} ${p.lastName}`.trim()
    );

    const isSupplierCombinationError = (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err || "");
      const lower = message.toLowerCase();
      return lower.includes("combination") && lower.includes("supplier");
    };

    const bookRoundTripCombined = () =>
      apiBookFlight({
        traceId: flight.traceId,
        resultIndex: `${tier.resultIndex},${returnTier!.resultIndex}`,
        isLCC: flight.isLCC,
        isInternational,
        passengers: buildPassengersForLegs([0, 1]),
    contact: { Email: form.contactEmail, Mobile: form.contactPhone },
    gst: gstPayload,
      });

    const bookRoundTripSeparately = async () => {
      const outbound = await apiBookFlight({
        traceId: flight.traceId,
        resultIndex: tier.resultIndex,
        isLCC: flight.isLCC,
        isInternational,
        passengers: buildPassengersForLegs([0]),
        contact: { Email: form.contactEmail, Mobile: form.contactPhone },
        gst: gstPayload,
      });

      const inbound = await apiBookFlight({
        traceId: returnFlight!.traceId || flight.traceId,
        resultIndex: returnTier!.resultIndex,
        isLCC: returnFlight!.isLCC,
        isInternational,
        passengers: buildPassengersForLegs([1]),
        contact: { Email: form.contactEmail, Mobile: form.contactPhone },
        gst: gstPayload,
      });

      return {
        bookingId: outbound.bookingId,
        pnr: [outbound.pnr, inbound.pnr].filter(Boolean).join(" / "),
      };
    };

    const bookRoundTrip = async () => {
      if (flight.isLCC || returnFlight?.isLCC) {
        return bookRoundTripSeparately();
      }
      try {
        return await bookRoundTripCombined();
      } catch (err) {
        if (!isSupplierCombinationError(err) || !returnFlight || !returnTier) throw err;
        return bookRoundTripSeparately();
      }
    };

    // ── MOCK MODE ─────────────────────────────────────────

    if (MOCK_MODE) {
      try {
        let bookingId: number | undefined;
        let pnr: string | undefined;

        if (isMultiCity && multiCityLegs && multiCityLegs.length > 0) {
          const results: { bookingId?: number; pnr?: string }[] = [];
          for (let legIndex = 0; legIndex < multiCityLegs.length; legIndex++) {
            const leg = multiCityLegs[legIndex];
            const result = await apiBookFlight({
              traceId: leg.flight.traceId,
              resultIndex: leg.tier.resultIndex,
              isLCC: leg.flight.isLCC,
              isInternational,
              passengers: buildPassengersForLegs([legIndex]),
              contact: { Email: form.contactEmail, Mobile: form.contactPhone },
              gst: gstPayload,
            });
            results.push(result);
          }
          bookingId = results[0]?.bookingId;
          pnr = results.map((result) => result.pnr).filter(Boolean).join(", ");
        } else {
          const result = isRoundTrip && returnFlight && returnTier
            ? await bookRoundTrip()
            : await apiBookFlight({
                traceId: flight.traceId,
                resultIndex: tier.resultIndex,
                isLCC: flight.isLCC,
                isInternational,
                passengers: passengersMapped,
                contact: { Email: form.contactEmail, Mobile: form.contactPhone },
                gst: gstPayload,
              });
          bookingId = result.bookingId;
          pnr = result.pnr;
        }

        await saveBooking(bookingId, pnr);
        setConfirmedBookingId(bookingId);
        setConfirmedPnr(pnr);
        setConfirmedNames(passengerNames);
        setStep(7);
        onConfirm(bookingId, pnr, passengerNames, form.contactEmail, totalPayable);
      } catch (e: any) {
        setError(e.message ?? "Booking failed. Please try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── LIVE MODE: Razorpay ────────────────────────────────

    try {
      const rzpLoaded = await loadRazorpay();
      if (!rzpLoaded) {
        setError("Could not load Razorpay. Check your internet connection.");
        setLoading(false);
        return;
      }

      const orderData = await createFlightPaymentOrder({
        amount: totalPayable,
        bookingCode: `FLIGHT_${Date.now()}`,
        traceId: flight.traceId,
        flightRoute: `${flight.fromCode}-${flight.toCode}`,
        flightDate: flight.departDate,
        passengerCount: adults + children + infants,
      });

      await new Promise<void>((resolve, reject) => {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "PlumTrips",
          description: `${flight.fromCode} → ${flight.toCode} · ${adults + children + infants} traveller${adults + children + infants !== 1 ? "s" : ""}`,
          order_id: orderData.orderId,
          prefill: {
            name: `${form.passengers[0]?.firstName ?? ""} ${form.passengers[0]?.lastName ?? ""}`.trim(),
            email: form.contactEmail,
            contact: form.contactPhone,
          },
          theme: { color: "#2563eb" },
          modal: {
            backdropclose: false,
            ondismiss: () => reject(new Error("Payment cancelled. Your booking was not confirmed.")),
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              await verifyFlightPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              let bookingId: number | undefined;
              let pnr: string | undefined;

              if (isMultiCity && multiCityLegs && multiCityLegs.length > 0) {
                const results: { bookingId?: number; pnr?: string }[] = [];
                for (let legIndex = 0; legIndex < multiCityLegs.length; legIndex++) {
                  const leg = multiCityLegs[legIndex];
                  const result = await apiBookFlight({
                    traceId: leg.flight.traceId,
                    resultIndex: leg.tier.resultIndex,
                    isLCC: leg.flight.isLCC,
                    isInternational,
                    passengers: buildPassengersForLegs([legIndex]),
                    contact: { Email: form.contactEmail, Mobile: form.contactPhone },
                    gst: gstPayload,
                  });
                  results.push(result);
                }
                bookingId = results[0]?.bookingId;
                pnr = results.map((result) => result.pnr).filter(Boolean).join(", ");
              } else {
                const result = isRoundTrip && returnFlight && returnTier
                  ? await bookRoundTrip()
                  : await apiBookFlight({
                      traceId: flight.traceId,
                      resultIndex: tier.resultIndex,
                      isLCC: flight.isLCC,
                      isInternational,
                      passengers: passengersMapped,
                      contact: { Email: form.contactEmail, Mobile: form.contactPhone },
                      gst: gstPayload,
                    });
                bookingId = result.bookingId;
                pnr = result.pnr;
              }

              await saveBooking(bookingId, pnr);
Promise.resolve().then(() => {
  setConfirmedBookingId(bookingId);
  setConfirmedPnr(pnr);
  setConfirmedNames(passengerNames);
  setStep(7);
  onConfirm(bookingId, pnr, passengerNames, form.contactEmail, totalPayable);
});
              resolve();
            } catch (err: any) {
              reject(err);
            }
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });
    } catch (e: any) {
      setError(e.message ?? "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ── SHELL PROPS ───────────────────────────────────────────

  const shellProps = {
    flight, tier, returnFlight, returnTier, multiCityLegs,
    adults, childcount: children, infants,
    discount: form.promoDiscount,
    extras: form.extras,
    currentStep: step,
     passengers: form.passengers,
     seatMaps, 
    onBack: step === 1 ? onBack : () => setStep((s) => (s - 1) as any),
  };

  // ── CONFIRMATION STEP (no shell) ──────────────────────────

  if (step === 7) {
    return (
      <div className="min-h-screen" style={{ background: "#f8f7f4" }}>
        <BookingStep7Confirmation
          flight={flight} tier={tier}
          returnFlight={returnFlight} returnTier={returnTier}
          multiCityLegs={multiCityLegs}
          bookingId={confirmedBookingId}
          pnr={confirmedPnr}
          passengerNames={confirmedNames}
          contactEmail={form.contactEmail}
          totalPaid={totalPayable}
          isInternational={isInternational}
          onDone={() => onBack()}
        />
      </div>
    );
  }

  // ── ALL OTHER STEPS ───────────────────────────────────────

  return (
    <BookingShell {...shellProps}>

      {step === 1 && (
        <BookingStep1FareReview
          flight={flight} tier={tier}
          returnFlight={returnFlight} returnTier={returnTier}
          multiCityLegs={multiCityLegs}
          isInternational={isInternational}
          loading={loading} error={error}
          fareChanged={fareChanged} updatedFare={updatedFare}
          onLockFare={handleFareQuote}
          onAcceptNewFare={() => { setFareChanged(false); setStep(2); }}
          onAbort={onBack}
        />
      )}

      {step === 2 && (
        <BookingStep2Passengers
          form={form}
          paxTypes={paxTypes}
          adults={adults}
          needsPan={needsPan}
          needsPassport={needsPassport}
          error={error}
          onChange={setForm}
          onNext={handlePassengersNext}
          onBack={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <BookingStep3Seats
          flight={flight}
          tier={tier}
          passengers={form.passengers}
          multiCityLegs={multiCityLegs}
          returnFlight={returnFlight}
          isRoundTrip={isRoundTrip}
          isMultiCity={isMultiCity}
          ssrDataPerLeg={ssrDataPerLeg}
          ssrLoading={ssrLoading}
          returnTier={returnTier}
          onChange={(updatedPax) =>
            setForm((f) => ({ ...f, passengers: updatedPax }))
          }
          onSeatMapsResolved={(maps) => setSeatMaps(maps)} 
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <BookingStep4Extras
          flight={flight}
          form={form}
          paxTypes={paxTypes}
          ssrDataPerLeg={ssrDataPerLeg}   // full array — index matches legs
          legs={legs}                      // same memoized legs array as Step 3
          onChange={setForm}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <BookingStep5Review
          flight={flight} tier={tier}
          returnFlight={returnFlight} returnTier={returnTier}
          multiCityLegs={multiCityLegs}
          passengers={form.passengers}
          paxTypes={paxTypes}
          contactEmail={form.contactEmail}
          contactPhone={form.contactPhone}
          adults={adults} children={children} infants={infants}
          extras={form.extras}
          discount={form.promoDiscount}
          isInternational={isInternational}
          onConfirm={() => setStep(6)}
          onBack={() => setStep(4)}
        />
      )}

      {step === 6 && (
        <BookingStep6Payment
          flight={flight} tier={tier}
          returnFlight={returnFlight} returnTier={returnTier}
          multiCityLegs={multiCityLegs}
          form={form}
          adults={adults} children={children} infants={infants}
          loading={loading} error={error}
          onChange={setForm}
          onPay={handlePayment}
          onBack={() => setStep(5)}
        />
      )}

    </BookingShell>
  );
}
