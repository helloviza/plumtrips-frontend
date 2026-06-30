import type {  BookTicketInput,
  TicketLCCPassenger,
  TicketPassengerFare,
  TicketBaggage,
  TicketMealDynamic,} from "../../lib/types_t"

// ============================================================
//  BookingPage.tsx
//
//  LCC  → apiBookTicket directly (no book step)
//  Non-LCC → apiBookFlight (hold) → apiBookTicket (issue)
//
//  [FQ-FIX] Fare-quote now applies PER LEG, not just outbound:
//    - prefetchedFareQuotes is now an ARRAY (one entry per leg) instead
//      of a single object. Previously only leg 0 (outbound) was ever
//      fare-quoted/locked, so round-trip return always used the raw,
//      unconfirmed search-time tier in activeReturnTier.
//    - lockedFareTiers is now seeded from prefetchedFareQuotes[i] for
//      EVERY leg (0 = outbound, 1 = return, 2+ = multi-city legs).
//    - handleFareQuote() now fare-quotes ALL legs in parallel when a
//      clean prefetch isn't available for all of them, instead of only
//      ever calling apiFareQuote(flight) for the outbound leg.
//
//  Other behavior unchanged:
//  1. handlePayment branches on isLCC:
//       LCC  → ticketFlight directly with full passenger payload
//       Non-LCC → bookFlight first → ticketFlight with PNR + BookingId
//  2. buildLCCPassengers() builds the richer TicketLCCPassenger
//     payload required by TBO Ticket (Fare breakdown, GST, Baggage,
//     MealDynamic — all mandatory for LCC Ticket API).
//  3. buildNonLCCPassengers() builds the leaner BookPassenger used
//     for the Non-LCC Book step.
//  4. Price-change guard: if apiBookTicket returns ticketStatus=8,
//     we surface the new fare to the user and re-call with
//     isPriceChangeAccepted:true on confirmation.
// ============================================================

import { useState, useMemo, useRef } from "react";
import type { DisplayFlight, FareTier } from "../../lib/types_t";
import {
  MOCK_MODE,
  apiFareQuote,
  apiBookFlight,
  apiBookTicket,
  apiGetSSRForLegs,
  formatINR,
} from "../../lib/flights_api";
import type {
  BookPassenger,
  SSRResult,
  FareQuoteResult,
} from "../../lib/flights_api";
import { createFlightPaymentOrder, verifyFlightPayment } from "../../services/paymentApi";
import { calcFares, BookingShell, emptyPassenger } from "./BookingShared";
import type { BookingFormState, SeatMap } from "./BookingShared";

import BookingStep1FareReview   from "./BookingStep1FareReview";
import BookingStep2Passengers   from "./BookingStep2Passengers";
import BookingStep3Seats        from "./BookingStep3Seats";
import BookingStep4Extras       from "./BookingStep4Extras";
import BookingStep5Review       from "./BookingStep5Review";
import BookingStep6Payment      from "./BookingStep6Payment";
import BookingStep7Confirmation from "./ConfirmationPage";

// ─── RAZORPAY LOADER ────────────────────────────────────────

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload  = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

// ─── TYPES ──────────────────────────────────────────────────

type FlightBookPassenger = BookPassenger & {
  MealDynamic?: Array<Record<string, unknown>>;
  GSTCompanyAddress:       string;
  GSTCompanyContactNumber: string;
  GSTCompanyName:          string;
  GSTNumber:               string;
  GSTCompanyEmail:         string;
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
  /** Pre-fetched fare-quote results from ResultsPage fare selection — ONE PER LEG.
   *  Index 0 = outbound/leg0, index 1 = return/leg1, index 2+ = further multi-city legs. */
  prefetchedFareQuotes?: (FareQuoteResult | null)[] | null;
  /** Pre-fetched SSR (seats/meals/baggage) per leg from ResultsPage fare selection */
  prefetchedSSR?: (SSRResult | null)[] | null;
  onBack: () => void;
  onConfirm: (
    bookingId?: number,
    pnr?: string,
    passengerNames?: string[],
    contactEmail?: string,
    totalPaid?: number,
  ) => void;
}

// ─── MAIN COMPONENT ─────────────────────────────────────────

export default function BookingPage({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  adults, children, infants,
  forcePassport = false,
  isInternational = false,
  prefetchedFareQuotes,
  prefetchedSSR,
  onBack, onConfirm,
}: BookingPageProps) {
  const isRoundTrip   = !!returnFlight && !!returnTier;
  const isMultiCity   = !!(multiCityLegs && multiCityLegs.length > 1);
  const needsPassport = flight.isPassportRequired || forcePassport || isInternational;
  const needsPan      = flight.isPanRequired;

  // How many legs this booking actually has (1 for one-way, 2 for round-trip,
  // N for multi-city) — used to know how many fare-quotes we need.
  const legCount = isMultiCity
    ? (multiCityLegs?.length ?? 1)
    : isRoundTrip ? 2 : 1;

  // ── STATE ─────────────────────────────────────────────────

  // A leg's prefetch is "clean" if it exists and didn't report a fare change.
  // We need EVERY leg to be clean to skip Step 1's loading entirely.
  const allLegsPrefetchedClean =
    !!prefetchedFareQuotes &&
    prefetchedFareQuotes.length >= legCount &&
    prefetchedFareQuotes.slice(0, legCount).every(q => q && !q.fareChanged);

  // True if ANY leg's prefetch came back with a fare change — surfaced on Step 1.
  const anyLegPrefetchedChanged =
    !!prefetchedFareQuotes &&
    prefetchedFareQuotes.slice(0, legCount).some(q => q && q.fareChanged);

  const hasPrefetchedFare       = allLegsPrefetchedClean;
  const hasPrefetchedFareChange = anyLegPrefetchedChanged;

  const [step, setStep]     = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  // Fare-change state — seed from prefetch if available.
  // updatedFare shows the FIRST changed leg's new price as a representative figure.
  const [fareChanged, setFareChanged]               = useState(hasPrefetchedFareChange);
  const [updatedFare, setUpdatedFare]               = useState<number | null>(() => {
    if (!hasPrefetchedFareChange || !prefetchedFareQuotes) return null;
    const changedLeg = prefetchedFareQuotes.find(q => q && q.fareChanged);
    return changedLeg?.tiers[0]?.price ?? null;
  });
  const [fareChangeMessage, setFareChangeMessage]   = useState<string | null>(null);

  // lockedFareTiers seeded from prefetchedFareQuotes — ONE ENTRY PER LEG.
  // Previously this only ever populated index 0 (outbound), so return/later
  // legs silently fell back to the raw, unconfirmed search-time tier.
  const [lockedFareTiers, setLockedFareTiers]       = useState<Record<number, FareTier>>(() => {
    if (!prefetchedFareQuotes) return {};
    const locked: Record<number, FareTier> = {};
    const legTiers: FareTier[] = isMultiCity && multiCityLegs
      ? multiCityLegs.map(l => l.tier)
      : isRoundTrip && returnTier
        ? [tier, returnTier]
        : [tier];

    legTiers.forEach((originalTier, i) => {
      const fq = prefetchedFareQuotes[i];
      if (!fq || fq.fareChanged) return; // only lock CLEAN (no-change) quotes upfront
      const quotedTiers = fq.tiers;
      const matched =
        quotedTiers.find(q => q.resultIndex === originalTier.resultIndex) ??
        quotedTiers.find(q => q.name === originalTier.name) ??
        quotedTiers[0];
      if (matched) locked[i] = matched;
    });

    return locked;
  });
  const [pendingFareTiers, setPendingFareTiers]     = useState<Record<number, FareTier>>({});

  // Price-change-at-ticket state (ticketStatus === 8)
  const [ticketPriceChanged, setTicketPriceChanged]       = useState(false);
  const [ticketPriceChangedAmount, setTicketPriceChangedAmount] = useState<number | null>(null);
  // Saved inputs for re-call after user accepts price change
  const [pendingTicketInputs, setPendingTicketInputs] =
    useState<BookTicketInput[] | null>(null);

  // SSR — seed from prefetch when available so Step 3 is instant
  const [ssrDataPerLeg, setSsrDataPerLeg] = useState<(SSRResult | null)[]>(prefetchedSSR ?? []);
  const [ssrLoading, setSsrLoading]       = useState(false);
  const [seatMaps, setSeatMaps]           = useState<Record<number, SeatMap>>({});

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

  // Confirmation
  const [confirmedBookingId, setConfirmedBookingId] = useState<number | undefined>();
  const [confirmedPnr, setConfirmedPnr]             = useState<string | undefined>();
  const [confirmedNames, setConfirmedNames]         = useState<string[]>([]);



  // ── HELPERS ───────────────────────────────────────────────

  const selectQuotedTier = (quotedTiers: FareTier[], selectedTier: FareTier) => {
    if (quotedTiers.length === 0) return selectedTier;
    return (
      quotedTiers.find((q) => q.resultIndex === selectedTier.resultIndex) ??
      quotedTiers.find((q) => q.name === selectedTier.name) ??
      quotedTiers.find((q) => q.recommended) ??
      quotedTiers[0]
    );
  };

  const activeTier          = lockedFareTiers[0] ?? tier;
  const activeReturnTier    = returnTier ? (lockedFareTiers[1] ?? returnTier) : undefined;
  const activeMultiCityLegs = multiCityLegs?.map((leg, index) => ({
    flight: leg.flight,
    tier:   lockedFareTiers[index] ?? leg.tier,
  }));

  // ── PAX TYPES ─────────────────────────────────────────────

  const paxTypes: ("Adult" | "Child" | "Infant")[] = [
    ...Array(adults).fill("Adult"),
    ...Array(children).fill("Child"),
    ...Array(infants).fill("Infant"),
  ];

  // ── LEGS — single source of truth ─────────────────────────

  const legs = useMemo(() => [
    {
      flight,
      tier: activeTier,
      label: isRoundTrip ? "Outbound" : isMultiCity ? "Leg 1" : "Flight",
    },
    ...(isRoundTrip && returnFlight && activeReturnTier
      ? [{ flight: returnFlight, tier: activeReturnTier, label: "Return" }]
      : []),
    ...(isMultiCity && activeMultiCityLegs
      ? activeMultiCityLegs.slice(1).map((l, i) => ({
          flight: l.flight,
          tier:   l.tier,
          label:  `Leg ${i + 2}`,
        }))
      : []),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [
    flight.resultIndex,
    activeTier.resultIndex,
    returnFlight?.resultIndex,
    activeReturnTier?.resultIndex,
    isRoundTrip,
    isMultiCity,
    activeMultiCityLegs?.length,
  ]);

  // ── FARE CALC ─────────────────────────────────────────────

  const { subtotal, extrasTotal, taxes } = calcFares({
    tier: activeTier, returnTier: activeReturnTier, multiCityLegs: activeMultiCityLegs,
    adults, children, infants,
    extras: form.extras,
  });
  const totalPayable = Math.round(subtotal + extrasTotal + taxes - form.promoDiscount);

  // ── STEP 1: FARE QUOTE ────────────────────────────────────
  // Fare-quotes EVERY leg, not just outbound. If a leg already has a clean
  // (no fare-change) prefetched quote, we reuse it instead of re-fetching.

    async function handleFareQuote() {
    // All legs already cleanly prefetched — lockedFareTiers was already
    // seeded for every leg in the useState initializer. Advance immediately.
    if (hasPrefetchedFare) {
      setStep(2);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Build the list of flights to quote, in leg order.
      const flightsToQuote: DisplayFlight[] = isMultiCity && multiCityLegs
        ? multiCityLegs.map(l => l.flight)
        : isRoundTrip && returnFlight
          ? [flight, returnFlight]
          : [flight];

      // [FQ-COMBINED-FIX v2] TraceId is shared by EVERY leg of a round-trip
      // search session (not just true "combined fare" itineraries where
      // resultIndex also matches). Firing apiFareQuote() concurrently for
      // legs that share a traceId — even with different resultIndex, as
      // ATG round-trips do — races against TBO's per-session lock the same
      // way SSR does. Group by traceId; within a group, dedupe identical
      // resultIndex (one network call, reused for every leg that shares
      // it) and walk distinct resultIndexes SEQUENTIALLY. Different
      // traceId groups (e.g. unrelated multi-city legs) still run in
      // parallel against each other.
      const byTraceId = new Map<string, number[]>();
      flightsToQuote.forEach((f, i) => {
        const arr = byTraceId.get(f.traceId);
        if (arr) arr.push(i); else byTraceId.set(f.traceId, [i]);
      });

      const results: (FareQuoteResult | null)[] = new Array(flightsToQuote.length).fill(null);

      await Promise.allSettled(
        [...byTraceId.values()].map(async (legIndexes) => {
          const byResultIndex = new Map<string, number[]>();
          legIndexes.forEach((i) => {
            const ri = flightsToQuote[i].resultIndex;
            const arr = byResultIndex.get(ri);
            if (arr) arr.push(i); else byResultIndex.set(ri, [i]);
          });

          for (const [, sameResultLegIdxs] of byResultIndex) {
            try {
              const r = await apiFareQuote(flightsToQuote[sameResultLegIdxs[0]]);
              sameResultLegIdxs.forEach((legIdx) => { results[legIdx] = r; });
            } catch {
              sameResultLegIdxs.forEach((legIdx) => { results[legIdx] = null; });
            }
            // Sequential by design — don't start the next resultIndex's
            // fare-quote for this traceId until this one has settled.
          }
        })
      );

      const anyFailed = results.some(r => r === null);
      if (anyFailed && results.every(r => r === null)) {
        throw new Error("Could not confirm fare. Please try again.");
      }

      const anyChanged = results.some(r => r?.fareChanged);

      if (anyChanged) {
        // Surface the first changed leg's new price to the user.
        const changedLeg = results.find(r => r?.fareChanged);
        setFareChanged(true);
        setUpdatedFare(changedLeg?.tiers[0]?.price ?? null);

        // Store ALL legs' new tiers as pending — user must accept before we lock them.
        const pending: Record<number, FareTier> = {};
        results.forEach((r, i) => {
          if (r?.tiers[0]) pending[i] = r.tiers[0];
        });
        setPendingFareTiers(pending);
      } else {
        // Lock the fare-quoted tiers for EVERY leg so SSR fallback
        // (handlePassengersNext) gets the fare-quoted resultIndex for each —
        // TBO ErrorCode 27 if we send the original one for ANY leg.
        const locked: Record<number, FareTier> = {};
        results.forEach((r, i) => {
          if (r?.tiers[0]) locked[i] = r.tiers[0];
        });
        setLockedFareTiers(locked);
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


// Add this ref at the top of the component with other state:
const ssrFetchingRef = useRef(false);
// Then in handlePassengersNext:
function handlePassengersNext() {
  const err = validatePassengers();
  if (err) { setError(err); return; }
  setError(null);

  const ssrAlreadyLoaded = ssrDataPerLeg.length === legs.length;

  // ── KEY FIX: prevent duplicate SSR fetches ──
  if (!ssrAlreadyLoaded && !ssrFetchingRef.current) {
    ssrFetchingRef.current = true;   // lock
    setSsrLoading(true);
    setSsrDataPerLeg([]);

    const allFlights = legs.map((l) => ({
      ...l.flight,
      resultIndex:  l.tier.resultIndex || l.flight.resultIndex,
      fareVariants: undefined,
    }));

    apiGetSSRForLegs(allFlights)
      .then(results => setSsrDataPerLeg(results))
      .catch((e: any) => {
        setError(e?.message ?? "Could not load seat/meal options.");
        setSsrDataPerLeg(legs.map(() => null));
      })
      .finally(() => {
        setSsrLoading(false);
        ssrFetchingRef.current = false;  // unlock
      });
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
            selectedSeat:  p.selectedSeat  || null,
            selectedSeats: p.selectedSeats || null,
          })),
          extras: form.extras,
          flight: {
            resultIndex: activeTier.resultIndex,
            traceId:     flight.traceId,
            airline:     flight.airline,
            flightNumber: flight.flightNumber,
            fromCode:    flight.fromCode,
            toCode:      flight.toCode,
            departDate:  flight.departDate,
            departTime:  flight.departTime,
            arriveTime:  flight.arriveTime,
            fareName:    activeTier.name,
            farePrice:   activeTier.price,
            isInternational,
          },
          returnFlight: returnFlight ? {
            resultIndex: activeReturnTier?.resultIndex ?? returnFlight.resultIndex,
            airline:     returnFlight.airline,
            flightNumber: returnFlight.flightNumber,
            fromCode:    returnFlight.fromCode,
            toCode:      returnFlight.toCode,
            departDate:  returnFlight.departDate,
            departTime:  returnFlight.departTime,
            arriveTime:  returnFlight.arriveTime,
            fareName:    activeReturnTier?.name,
            farePrice:   activeReturnTier?.price,
          } : null,
          multiCityLegs: activeMultiCityLegs
            ? activeMultiCityLegs.map((leg, i) => ({
                legIndex:    i,
                resultIndex: leg.tier.resultIndex,
                airline:     leg.flight.airline,
                flightNumber: leg.flight.flightNumber,
                fromCode:    leg.flight.fromCode,
                toCode:      leg.flight.toCode,
                departDate:  leg.flight.departDate,
                departTime:  leg.flight.departTime,
                arriveTime:  leg.flight.arriveTime,
                fareName:    leg.tier.name,
                farePrice:   leg.tier.price,
              }))
            : null,
          adults, children, infants,
          subtotal, taxes, extrasTotal,
          discount:     form.promoDiscount,
          totalPayable,
          gst: form.gstNumber ? {
            gstNumber:          form.gstNumber,
            gstCompanyName:     form.gstCompanyName,
            gstCompanyEmail:    form.gstCompanyEmail,
            gstCompanyAddress:  form.gstCompanyAddress,
          } : null,
          paymentMode: MOCK_MODE ? "MOCK" : "RAZORPAY",
          bookedAt: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error("[saveBooking] Failed:", e);
    }
  }

  // ── PASSENGER BUILDERS ────────────────────────────────────

  /**
   * Build the lean Non-LCC passenger list used by /tbo/book (bookFlight).
   * Fare breakdown is NOT required here — TBO pulls it from the ResultIndex.
   */
  function buildNonLCCPassengers(legIndexes: number[] , legTier: FareTier, ): FlightBookPassenger[] {
    const mealExtrasByPaxAndLeg: Record<number, Record<number, typeof form.extras[number]>> = {};
    form.extras.forEach((extra) => {
      if (!mealExtrasByPaxAndLeg[extra.passengerId])
        mealExtrasByPaxAndLeg[extra.passengerId] = {};
      mealExtrasByPaxAndLeg[extra.passengerId][extra.legIndex] = extra;
    });

    const ssrAvailablePerLeg = ssrDataPerLeg.map(
      (ssr) => ssr !== null && (ssr.meals?.length ?? 0) > 0
    );

    const isNoMealCode = (code?: string) => {
      const n = String(code || "").trim().toLowerCase();
      return !n || ["none", "no_meal", "nomeal", "no meal", "no meal preference"].includes(n);
    };

    const normalizeFlightNo = (raw: string) => String(raw).replace(/[^0-9]/g, "");


    return form.passengers.map((p, i) => {
      const paxType = (i < adults ? 1 : i < adults + children ? 2 : 3) as 1 | 2 | 3;
      // Replace your GST block with this:
const hasGST = !!form.gstNumber?.trim();
      const base: FlightBookPassenger = {
        Title:       p.title as "Mr" | "Ms" | "Mrs" | "Mstr" | "Miss",
        FirstName:   p.firstName.trim(),
        LastName:    p.lastName.trim(),
        PaxType:     paxType,
        DateOfBirth: p.dob ? `${p.dob}T00:00:00` : "1990-01-01T00:00:00",
        Gender:      (p.gender === "Male" ? 1 : 2) as 1 | 2,
        PassportNo:   p.passportNo    || undefined,
        PassportExpiry: p.passportExpiry || undefined,
        Pan:         p.panNumber      || undefined,
        ContactNo:   form.contactPhone,
        Email:       form.contactEmail,
        IsLeadPax:   i === 0,
        AddressLine1: "India",
        City:        "Delhi",
        CountryCode: "IN",
        CountryName: "India",
        Nationality: p.nationality || "IN",


// Then in the base passenger object:
GSTCompanyAddress:       hasGST ? (form.gstCompanyAddress || "")                    : "",
GSTCompanyContactNumber: hasGST ? (form.contactPhone      || "")                    : "",
GSTCompanyName:          hasGST ? (form.gstCompanyName    || "")                    : "",
GSTNumber:               hasGST ? (form.gstNumber         || "")                    : "",
GSTCompanyEmail:         hasGST ? (form.gstCompanyEmail   || form.contactEmail || "") : "",
        Fare: {
  BaseFare:             paxType === 3 ? 0 : Math.round(legTier.totalOfferedFare ?? legTier.price ?? 0),
  Tax:                  0,
  TransactionFee:       0,
  YQTax:                0,
  AdditionalTxnFeeOfrd: 0,
  AdditionalTxnFeePub:  0,
  AirTransFee:          0,
},
      };

      // Infants don't get meal selections
      if (paxTypes[i] === "Infant") return base;

      type NonLCCMeal = {
        AirlineCode: string; FlightNumber: string; WayType: number;
        Code: string; Description: number; AirlineDescription: string;
        Quantity: number; Currency: string; Price: number;
        Origin: string; Destination: string;
      };

      const meals = legIndexes
        .map((legIndex): NonLCCMeal | null => {
          const extra = mealExtrasByPaxAndLeg[i]?.[legIndex];
          if (!extra || isNoMealCode(extra.mealCode)) return null;
          if (!ssrAvailablePerLeg[legIndex]) return null;
          const leg = legs[legIndex] ?? { flight };
          return {
            AirlineCode:        leg.flight.airlineCode,
            FlightNumber:       normalizeFlightNo(leg.flight.flightNumber),
            WayType:            2,
            Code:               extra.mealCode!,
            Description:        2,
            AirlineDescription: extra.mealLabel,
            Quantity:           1,
            Currency:           "INR",
            Price:              extra.mealPrice ?? 0,
            Origin:             extra.origin,
            Destination:       extra.destination,
          };
        })
        .filter((m): m is NonLCCMeal => m !== null);

      const mealsAsRecord: Record<string, unknown>[] = meals;
      return meals.length > 0 ? { ...base, MealDynamic: mealsAsRecord } : base;
    });
  }

  /**
   * Build the richer LCC passenger list used by /tbo/ticket (ticketFlight).
   * TBO LCC Ticket requires: Fare breakdown per pax, GST fields,
   * optional Baggage[] and MealDynamic[] add-ons.
   */
  function buildLCCPassengers(
    legIndexes: number[],
    legFlight: DisplayFlight,
    legTier: FareTier,
  ): TicketLCCPassenger[] {
    const mealExtrasByPaxAndLeg: Record<number, Record<number, typeof form.extras[number]>> = {};
    const baggageExtrasByPaxAndLeg: Record<number, Record<number, typeof form.extras[number]>> = {};
    form.extras.forEach((extra) => {
      if (extra.mealCode) {
        if (!mealExtrasByPaxAndLeg[extra.passengerId])
          mealExtrasByPaxAndLeg[extra.passengerId] = {};
        mealExtrasByPaxAndLeg[extra.passengerId][extra.legIndex] = extra;
      }
      if (extra.baggageCode) {
        if (!baggageExtrasByPaxAndLeg[extra.passengerId])
          baggageExtrasByPaxAndLeg[extra.passengerId] = {};
        baggageExtrasByPaxAndLeg[extra.passengerId][extra.legIndex] = extra;
      }
    });

    const ssrAvailablePerLeg = ssrDataPerLeg.map(
      (ssr) => ssr !== null && (ssr.meals?.length ?? 0) > 0
    );

    const isNoMealCode = (code?: string) => {
      const n = String(code || "").trim().toLowerCase();
      return !n || ["none", "no_meal", "nomeal", "no meal", "no meal preference"].includes(n);
    };

    // Per-pax fare — TBO requires this for LCC Ticket.
    // We distribute the tier's OfferedFare evenly; BaseFare+Tax from tier.
// In buildLCCPassengers (line ~546) — replace perPaxFare:
const perPaxFare = (paxType: 1 | 2 | 3): TicketPassengerFare => {
  if (paxType === 3) {
    // Infant: TBO requires explicit infant fare, not zeros
    return {
      BaseFare:             legTier.infantFare ?? 0,
      Tax:                  0,
      TransactionFee:       0,
      YQTax:                0,
      AdditionalTxnFeeOfrd: 0,
      AdditionalTxnFeePub:  0,
      AirTransFee:          0,
    };
  }
  if (paxType === 2) {
    // Child: use childFare if available, else fall back to adultFare
    const childBase = legTier.childFare ?? legTier.adultFare ?? legTier.price ?? 0;
    return {
      BaseFare:             childBase,
      Tax:                  0,
      TransactionFee:       0,
      YQTax:                0,
      AdditionalTxnFeeOfrd: 0,
      AdditionalTxnFeePub:  0,
      AirTransFee:          0,
    };
  }
  // Adult
  return {
    BaseFare:             legTier.adultFare ?? legTier.price ?? 0,
    Tax:                  (legTier.totalOfferedFare ?? 0) - (legTier.adultFare ?? legTier.price ?? 0),
    TransactionFee:       0,
    YQTax:                0,
    AdditionalTxnFeeOfrd: 0,
    AdditionalTxnFeePub:  0,
    AirTransFee:          0,
  };
};

const hasGST = !!form.gstNumber?.trim();

const gstCompanyAddress         = hasGST ? (form.gstCompanyAddress  || "") : "";
const gstCompanyContactNumber   = hasGST ? (form.contactPhone        || "") : "";
const gstCompanyName            = hasGST ? (form.gstCompanyName      || "") : "";
const gstNumber                 = hasGST ? (form.gstNumber           || "") : "";
const gstCompanyEmail           = hasGST ? (form.gstCompanyEmail || form.contactEmail || "") : "";

    return form.passengers.map((p, i): TicketLCCPassenger => {
      const paxType = (i < adults ? 1 : i < adults + children ? 2 : 3) as 1 | 2 | 3;

      // ── Meals ─────────────────────────────────────────────
      const mealDynamic: TicketMealDynamic[] = paxTypes[i] !== "Infant"
        ? legIndexes
            .map((legIndex): TicketMealDynamic | null => {
              const extra = mealExtrasByPaxAndLeg[i]?.[legIndex];
              if (!extra || isNoMealCode(extra.mealCode)) return null;
              if (!ssrAvailablePerLeg[legIndex]) return null;
              const leg = legs[legIndex] ?? { flight: legFlight };
              return {
                WayType:            2 as const,
                Code:               extra.mealCode!,
                Description:        2,
                AirlineDescription: extra.mealLabel,
                Quantity:           "1",
                Price:              extra.mealPrice ?? 0,
                Currency:           "INR",
                Origin:             extra.origin ?? leg.flight.fromCode,
                Destination:        extra.destination ?? leg.flight.toCode,
                Nationality:        p.nationality || "IN",
              };
            })
            .filter((m): m is TicketMealDynamic => m !== null)
        : [];

      // ── Baggage ───────────────────────────────────────────
      const baggage: TicketBaggage[] = paxTypes[i] !== "Infant"
        ? legIndexes
            .map((legIndex): TicketBaggage | null => {
              const extra = baggageExtrasByPaxAndLeg[i]?.[legIndex];
              if (!extra?.baggageCode || extra.baggageCode === "NoBaggage") return null;
              const leg = legs[legIndex] ?? { flight: legFlight };
              return {
                WayType:     2 as const,
                Code:        extra.baggageCode,
                Description: extra.baggageLabel ?? "",
                Weight:      String(extra.baggageKg ?? ""),
                Currency:    "INR",
                Price:       extra.baggagePrice ?? 0,
                Origin:      leg.flight.fromCode,
                Destination: leg.flight.toCode,
              };
            })
            .filter((b): b is TicketBaggage => b !== null)
        : [];

      return {
        Title:       p.title as "Mr" | "Ms" | "Mrs" | "Mstr" | "Miss",
        FirstName:   p.firstName.trim(),
        LastName:    p.lastName.trim(),
        PaxType:     paxType,
        DateOfBirth: p.dob ? `${p.dob}T00:00:00` : undefined,
        Gender:      (p.gender === "Male" ? 1 : 2) as 1 | 2,
        PassportNo:   p.passportNo     || undefined,
        PassportExpiry: p.passportExpiry || undefined,
        AddressLine1: "India",
        City:        "Delhi",
        CountryCode: "IN",
        CountryName: "India",
        ContactNo:   form.contactPhone,
        Email:       form.contactEmail,
        IsLeadPax:   i === 0,
GSTCompanyAddress:       hasGST ? (form.gstCompanyAddress || "")           : "",
GSTCompanyContactNumber: hasGST ? (form.contactPhone || "")                : "",
GSTCompanyName:          hasGST ? (form.gstCompanyName || "")              : "",
GSTNumber:               hasGST ? (form.gstNumber || "")                   : "",
GSTCompanyEmail:         hasGST ? (form.gstCompanyEmail || form.contactEmail || "") : "",
        Fare:        perPaxFare(paxType),
        ...(baggage.length     > 0 ? { Baggage:     baggage     } : {}),
        ...(mealDynamic.length > 0 ? { MealDynamic: mealDynamic } : {}),
      };
    });
  }

  // ── CORE BOOKING LOGIC ────────────────────────────────────

  /**
   * bookAndTicketSingleLeg
   *
   * LCC:     ticketFlight directly (isLCC: true)
   * Non-LCC: bookFlight → ticketFlight (isLCC: false)
   *
   * Returns { bookingId, pnr }.
   */
  async function bookAndTicketSingleLeg(
    legFlight: DisplayFlight,
    legTier: FareTier,
    legIndexes: number[],
    isPriceChangeAccepted = false,
    overridePendingInputs?: BookTicketInput,
  ): Promise<{ bookingId: number | undefined; pnr: string }> {
    if (legFlight.isLCC) {
      // ── LCC: direct ticket ──────────────────────────────
      const input: BookTicketInput = overridePendingInputs ?? {
        isLCC:        true,
        traceId:      legFlight.traceId,
        resultIndex:  legTier.resultIndex || legFlight.resultIndex,
        passengers:   buildLCCPassengers(legIndexes, legFlight, legTier),
        isPriceChangeAccepted,
      };

      const ticketRes = await apiBookTicket(input);

      if (ticketRes.ticketStatus === 8 || ticketRes.isPriceChanged) {
        // Surface price-change to caller — caller must re-call with accepted flag
        const err = new Error("PRICE_CHANGED");
        (err as any).ticketInput  = input;
        (err as any).newAmount    = ticketRes.flightItinerary
          ? (ticketRes.flightItinerary as any)?.Fare?.OfferedFare ?? null
          : null;
        throw err;
      }

      if (ticketRes.ticketStatus !== 1 && ticketRes.ticketStatus !== 6) {
        throw new Error(ticketRes.message || `Ticketing failed (status ${ticketRes.ticketStatus})`);
      }

      

      return { bookingId: ticketRes.bookingId, pnr: ticketRes.pnr };

    } else {
      // ── Non-LCC: Book → Ticket ──────────────────────────
      const passengers = buildNonLCCPassengers(legIndexes, legTier);

      const bookRes = await apiBookFlight({
        traceId:      legFlight.traceId,
        resultIndex:  legTier.resultIndex || legFlight.resultIndex,
        isLCC:        false,
        isInternational,
        passengers,
        contact: { Email: form.contactEmail, Mobile: form.contactPhone },
        gst: form.gstNumber ? {
          GSTNumber:         form.gstNumber,
          GSTCompanyName:    form.gstCompanyName,
          GSTCompanyEmail:   form.gstCompanyEmail,
          GSTCompanyAddress: form.gstCompanyAddress,
        } : undefined,
      });

      if (!bookRes.pnr) throw new Error("Booking succeeded but PNR missing");

      const ticketInput: BookTicketInput = overridePendingInputs ?? {
        isLCC:                 false,
        traceId:               legFlight.traceId,
        pnr:                   bookRes.pnr,
        bookingId:             bookRes.bookingId!,
        isPriceChangeAccepted,
      };

      const ticketRes = await apiBookTicket(ticketInput);

      if (ticketRes.ticketStatus === 8 || ticketRes.isPriceChanged) {
        const err = new Error("PRICE_CHANGED");
        (err as any).ticketInput = { ...ticketInput, isLCC: false };
        (err as any).newAmount   = null;
        throw err;
      }

// 1 = Successful, 6 = TicketAlreadyCreated (both are valid outcomes)
      if (ticketRes.ticketStatus !== 1 && ticketRes.ticketStatus !== 6) {
        throw new Error(ticketRes.message || `Ticketing failed (status ${ticketRes.ticketStatus})`);
      }

      return { bookingId: ticketRes.bookingId || bookRes.bookingId, pnr: ticketRes.pnr || bookRes.pnr };
    }
  }

  /**
   * runFullBooking — orchestrates single / round-trip / multi-city.
   * Handles the combination-error fallback for Non-LCC round-trips.
   */
  async function runFullBooking(
    isPriceChangeAccepted = false,
    overridePendingInputs?: BookTicketInput[],
  ): Promise<{ bookingId: number | undefined; pnr: string }> {
    const isSupplierCombinationError = (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err || "");
      return msg.toLowerCase().includes("combination") && msg.toLowerCase().includes("supplier");
    };

    // ── MULTI-CITY ─────────────────────────────────────────
    if (isMultiCity && activeMultiCityLegs && activeMultiCityLegs.length > 0) {
      const results: { bookingId: number | undefined; pnr: string }[] = [];
      for (let i = 0; i < activeMultiCityLegs.length; i++) {
        const leg = activeMultiCityLegs[i];
        const result = await bookAndTicketSingleLeg(
          leg.flight, leg.tier, [i],
          isPriceChangeAccepted,
          overridePendingInputs?.[i],
        );
        results.push(result);
      }
      return {
        bookingId: results[0]?.bookingId,
        pnr: results.map((r) => r.pnr).filter(Boolean).join(", "),
      };
    }

    // ── ROUND-TRIP ─────────────────────────────────────────
    if (isRoundTrip && returnFlight && activeReturnTier) {
      // International combined-itinerary fares share ONE ResultIndex for
      // both legs — never book them separately, regardless of LCC status.
      const isCombined = !!(flight as any).isCombinedRoundTrip;

      // For LCC or mixed (and not a combined single-fare itinerary), book separately
      const shouldBookSeparately = !isCombined && (flight.isLCC || returnFlight.isLCC);

      if (shouldBookSeparately) {
        // In runFullBooking — LCC round-trip block
       const out = await bookAndTicketSingleLeg(flight, activeTier, [0], isPriceChangeAccepted, overridePendingInputs?.[0]);
       const ret = await bookAndTicketSingleLeg(returnFlight, activeReturnTier, [1], isPriceChangeAccepted, overridePendingInputs?.[1]);
        return {
          bookingId: out.bookingId,
          pnr: [out.pnr, ret.pnr].filter(Boolean).join(" / "),
        };
      }

      if (isCombined) {
        // One combined fare — book once with the shared resultIndex, no comma-joining.
        return bookAndTicketSingleLeg(
          flight, activeTier, [0, 1],
          isPriceChangeAccepted,
          overridePendingInputs?.[0],
        );
      }

      // Non-LCC: try combined ResultIndex first, fall back to separate
      try {
        return await bookAndTicketSingleLeg(
          flight,
          { ...activeTier, resultIndex: `${activeTier.resultIndex},${activeReturnTier.resultIndex}` },
          [0, 1],
          isPriceChangeAccepted,
          overridePendingInputs?.[0],
        );
      } catch (err) {
        if (!isSupplierCombinationError(err)) throw err;
        // Fallback: book outbound + return separately
        const [out, ret] = await Promise.all([
          bookAndTicketSingleLeg(flight, activeTier, [0], isPriceChangeAccepted, overridePendingInputs?.[0]),
          bookAndTicketSingleLeg(returnFlight, activeReturnTier, [1], isPriceChangeAccepted, overridePendingInputs?.[1]),
        ]);
        return {
          bookingId: out.bookingId,
          pnr: [out.pnr, ret.pnr].filter(Boolean).join(" / "),
        };
      }
    }

    // ── ONE-WAY ────────────────────────────────────────────
    return bookAndTicketSingleLeg(
      flight, activeTier, [0],
      isPriceChangeAccepted,
      overridePendingInputs?.[0],
    );
  }

  // ── STEP 6: PAYMENT ───────────────────────────────────────

  async function handlePayment(isPriceChangeAccepted = false) {
    setLoading(true);
    setError(null);
    setTicketPriceChanged(false);

    const passengerNames = form.passengers.map(
      (p) => `${p.title} ${p.firstName} ${p.lastName}`.trim()
    );

    const finalize = async (bookingId?: number, pnr?: string) => {
      await saveBooking(bookingId, pnr);
      setConfirmedBookingId(bookingId);
      setConfirmedPnr(pnr);
      setConfirmedNames(passengerNames);
      setStep(7);
      onConfirm(bookingId, pnr, passengerNames, form.contactEmail, totalPayable);
    };

    // ── MOCK MODE ──────────────────────────────────────────
    if (MOCK_MODE) {
      try {
        const { bookingId, pnr } = await runFullBooking(isPriceChangeAccepted);
        await finalize(bookingId, pnr);
      } catch (e: any) {
        if (e.message === "PRICE_CHANGED") {
          setTicketPriceChanged(true);
          setTicketPriceChangedAmount(e.newAmount ?? null);
          setPendingTicketInputs([e.ticketInput]);
        } else {
          setError(e.message ?? "Booking failed. Please try again.");
        }
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
        amount:         totalPayable,
        bookingCode:    `FLIGHT_${Date.now()}`,
        traceId:        flight.traceId,
        flightRoute:    `${flight.fromCode}-${flight.toCode}`,
        flightDate:     flight.departDate,
        passengerCount: adults + children + infants,
      });

      await new Promise<void>((resolve, reject) => {
        const options = {
          key:         orderData.keyId,
          amount:      orderData.amount,
          currency:    orderData.currency,
          name:        "PlumTrips",
          description: `${flight.fromCode} → ${flight.toCode} · ${adults + children + infants} traveller${adults + children + infants !== 1 ? "s" : ""}`,
          order_id:    orderData.orderId,
          prefill: {
            name:    `${form.passengers[0]?.firstName ?? ""} ${form.passengers[0]?.lastName ?? ""}`.trim(),
            email:   form.contactEmail,
            contact: form.contactPhone,
          },
          theme: { color: "#2563eb" },
          modal: {
            backdropclose: false,
            ondismiss: () => reject(new Error("Payment cancelled. Your booking was not confirmed.")),
          },
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id:   string;
            razorpay_signature:  string;
          }) => {
            try {
              await verifyFlightPayment({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              });

              const { bookingId, pnr } = await runFullBooking(isPriceChangeAccepted);

              Promise.resolve().then(async () => {
                await finalize(bookingId, pnr);
              });
              resolve();
            } catch (err: any) {
              if (err.message === "PRICE_CHANGED") {
                setTicketPriceChanged(true);
                setTicketPriceChangedAmount(err.newAmount ?? null);
                setPendingTicketInputs([err.ticketInput]);
                resolve(); // don't reject — payment succeeded, ticketing is pending
              } else {
                reject(err);
              }
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

  /**
   * Called when user accepts the mid-ticketing price change.
   * Re-fires ticketing only (payment already captured) with
   * isPriceChangeAccepted:true and stored pendingTicketInputs.
   */
  async function handleAcceptTicketPriceChange() {
    setTicketPriceChanged(false);
    setTicketPriceChangedAmount(null);
    await handlePayment(true);
  }

  // ── SHELL PROPS ───────────────────────────────────────────

  const shellProps = {
    flight, tier: activeTier,
    returnFlight, returnTier: activeReturnTier,
    multiCityLegs: activeMultiCityLegs,
    adults, childcount: children, infants,
    discount: form.promoDiscount,
    extras:   form.extras,
    currentStep: step,
    passengers:  form.passengers,
    seatMaps,
    onBack: step === 1 ? onBack : () => setStep((s) => (s - 1) as any),
  };

  // ── CONFIRMATION (no shell) ───────────────────────────────

  if (step === 7) {
    return (
      <div className="min-h-screen" style={{ background: "#f8f7f4" }}>
        <BookingStep7Confirmation
          flight={flight} tier={activeTier}
          returnFlight={returnFlight} returnTier={activeReturnTier}
          multiCityLegs={activeMultiCityLegs}
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
          flight={flight} tier={activeTier}
          returnFlight={returnFlight} returnTier={activeReturnTier}
          multiCityLegs={activeMultiCityLegs}
          isInternational={isInternational}
          loading={loading} error={error}
          fareChanged={fareChanged}
          updatedFare={updatedFare}
          fareChangeMessage={fareChangeMessage}
          fareAlreadyConfirmed={hasPrefetchedFare}
          onLockFare={handleFareQuote}
          onAcceptNewFare={() => {
            setLockedFareTiers(pendingFareTiers);
            setPendingFareTiers({});
            setFareChanged(false);
            setFareChangeMessage(null);
            setStep(2);
          }}
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
          tier={activeTier}
          passengers={form.passengers}
          multiCityLegs={activeMultiCityLegs}
          returnFlight={returnFlight}
          isRoundTrip={isRoundTrip}
          isMultiCity={isMultiCity}
          ssrDataPerLeg={ssrDataPerLeg}
          ssrLoading={ssrLoading}
          returnTier={activeReturnTier}
          onChange={(updatedPax) => setForm((f) => ({ ...f, passengers: updatedPax }))}
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
          ssrDataPerLeg={ssrDataPerLeg}
          legs={legs}
          onChange={setForm}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}

      {step === 5 && (
        <BookingStep5Review
          flight={flight} tier={activeTier}
          returnFlight={returnFlight} returnTier={activeReturnTier}
          multiCityLegs={activeMultiCityLegs}
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
        <>
          {/* ── Mid-ticketing price change banner ── */}
          {ticketPriceChanged && (
            <div
              style={{
                background: "#fefce8",
                border: "1px solid #fbbf24",
                borderRadius: 8,
                padding: "12px 16px",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 14, color: "#92400e" }}>
                ⚠️ The airline has updated the fare
                {ticketPriceChangedAmount !== null
                  ? ` to ${formatINR(ticketPriceChangedAmount)}`
                  : ""}
                . Accept the new price to complete your booking.
              </span>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={() => { setTicketPriceChanged(false); setPendingTicketInputs(null); }}
                  style={{
                    padding: "6px 12px", borderRadius: 6, border: "1px solid #d1d5db",
                    background: "#fff", cursor: "pointer", fontSize: 13,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAcceptTicketPriceChange}
                  disabled={loading}
                  style={{
                    padding: "6px 14px", borderRadius: 6, border: "none",
                    background: "#f59e0b", color: "#fff", cursor: "pointer", fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Accept &amp; Confirm
                </button>
              </div>
            </div>
          )}

          <BookingStep6Payment
            flight={flight} tier={activeTier}
            returnFlight={returnFlight} returnTier={activeReturnTier}
            multiCityLegs={activeMultiCityLegs}
            form={form}
            adults={adults} children={children} infants={infants}
            loading={loading} error={error}
            onChange={setForm}
            onPay={() => handlePayment(false)}
            onBack={() => setStep(5)}
          />
        </>
      )}

    </BookingShell>
  );
}