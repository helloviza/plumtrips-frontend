// ============================================================
//  PLUMTRIPS — Flight API (backend-proxy only)
//  All TBO credentials and auth live on the server.
//  Frontend never talks to TBO directly.
// ============================================================

import type {
  DisplayFlight, FareTier, Airport, SearchForm,
} from "./types_t";

// ─── CONFIG ────────────────────────────────────────────────

/**
 * FIX #1: VITE_MOCK_MODE=false in .env now correctly disables mock mode.
 * Previously, an unset variable evaluates undefined !== "false" = true (always mock).
 * Now: only true when explicitly set to "true". Defaults to false (live mode).
 */
export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === "true";

/** Backend proxy base URL — all TBO calls go through here. */
const API_BASE = import.meta.env.VITE_BACKEND_ORIGIN ?? "http://localhost:8080";

// ─── HELPERS: TBO → DisplayFlight ─────────────────────────

/**
 * FIX #2: Date parsing now uses T00:00:00 suffix to force local time interpretation.
 * Without this, new Date("2026-06-01") is parsed as UTC midnight, which in IST (+5:30)
 * renders as May 31 — one day behind.
 */
function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function fmtDate(iso: string): string {
  // ISO strings from TBO already include time (e.g. "2026-06-01T05:30:00"), safe to parse directly.
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function fmtDateLocal(dateStr: string): string {
  // For plain date strings like "YYYY-MM-DD", force local time to avoid UTC offset shift.
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function minToLabel(m: number): string {
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export function tboResultToDisplay(result: import("./types_t").TBOFlightResult, traceId: string,legIndex = 0  ): DisplayFlight {
  
  const allSegs = result.Segments[legIndex] ?? result.Segments[0];
  

  const seg = allSegs[0];
  const lastSeg = allSegs[allSegs.length - 1];
  const totalDuration = allSegs.reduce((acc, s) => acc + s.Duration, 0);
  const stops = allSegs.length - 1;
  

  const depISO = seg.Origin.DepTime;
  const arrISO = lastSeg.Destination.ArrTime;

  const baggage = result.Baggage?.[0];
  const cabinBag = result.CabinBaggage?.[0];
 

  // Build per-segment details
  const segments: import("./types_t").FlightSegmentDetail[] = allSegs.map((s) => ({
    airlineCode: s.Airline.AirlineCode,
    airlineName: s.Airline.AirlineName,
    flightNumber: `${s.Airline.AirlineCode}-${s.Airline.FlightNumber}`,
    operatingCarrier: s.Airline.OperatingCarrier !== s.Airline.AirlineCode ? s.Airline.OperatingCarrier : undefined,
    fareClass: s.Airline.FareClass || undefined,
    fromCode: s.Origin.Airport.AirportCode,
    fromCity: s.Origin.Airport.CityName,
    fromAirport: s.Origin.Airport.AirportName,
    fromTerminal: s.Origin.Airport.Terminal || undefined,
    toCode: s.Destination.Airport.AirportCode,
    toCity: s.Destination.Airport.CityName,
    toAirport: s.Destination.Airport.AirportName,
    toTerminal: s.Destination.Airport.Terminal || undefined,
    departISO: s.Origin.DepTime,
    arriveISO: s.Destination.ArrTime,
    departTime: fmtTime(s.Origin.DepTime),
    arriveTime: fmtTime(s.Destination.ArrTime),
    departDate: fmtDate(s.Origin.DepTime),
    arriveDate: fmtDate(s.Destination.ArrTime),
    duration: s.Duration,
    durationLabel: minToLabel(s.Duration),
    craft: s.Craft || undefined,
    groundTime: s.GroundTime || undefined,
    mile: s.Mile || undefined,
    
  }));

  return {
    resultIndex: result.ResultIndex,
    traceId,
    source: result.Source,
    airline: seg.Airline.AirlineName,
    airlineCode: seg.Airline.AirlineCode,
    flightNumber: `${seg.Airline.AirlineCode}-${seg.Airline.FlightNumber}`,
    operatingCarrier: seg.Airline.OperatingCarrier !== seg.Airline.AirlineCode ? seg.Airline.OperatingCarrier : undefined,
    fromCode: seg.Origin.Airport.AirportCode,
    fromCity: seg.Origin.Airport.CityName,
    fromAirport: seg.Origin.Airport.AirportName,
    toCode: lastSeg.Destination.Airport.AirportCode,
    toCity: lastSeg.Destination.Airport.CityName,
    toAirport: lastSeg.Destination.Airport.AirportName,
    departTime: fmtTime(depISO),
    arriveTime: fmtTime(arrISO),
    departDate: fmtDate(depISO),
    arriveDate: fmtDate(arrISO),
    departISO: depISO,
    arriveISO: arrISO,
    duration: totalDuration,
    durationLabel: minToLabel(totalDuration),
    stops,
    stopInfo: stops > 0 ? allSegs.slice(0, -1).map(s => s.Destination.Airport.CityCode).join(", ") : undefined,
    price: result.Fare.OfferedFare,
    baseFare: result.Fare.BaseFare,
    tax: result.Fare.Tax,
    cabinBaggage: cabinBag?.CabinBaggage ?? "7 Kg",
    checkinBaggage: baggage?.Baggage ?? "15 Kg",
    isRefundable: result.IsRefundable,
    isLCC: result.IsLCC,
    fareType: result.FareType,
    fareClass: seg.Airline.FareClass || undefined,
    terminal: seg.Origin.Airport.Terminal || undefined,
    arrivalTerminal: lastSeg.Destination.Airport.Terminal || undefined,
    craft: seg.Craft || undefined,
    seatsLeft: seg.NoOfSeatAvailable,
    lastTicketingDate: result.LastTicketingDate || undefined,
    isPanRequired: result.IsPanRequiredAtBook,
    isPassportRequired: result.IsPassportRequiredAtBook,
    airlineRemark: result.AirlineRemark || undefined,
    segments,
  };
}

function groupByFlight(flights: DisplayFlight[]): DisplayFlight[] {
  const map = new Map<string, DisplayFlight[]>();

  for (const f of flights) {
    // Key = same physical flight (airline + number + dep time + arr time)
    const key = `${f.airlineCode}-${f.flightNumber}-${f.departISO}-${f.arriveISO}`;
    const group = map.get(key);
    if (group) group.push(f);
    else map.set(key, [f]);
  }

  const result: DisplayFlight[] = [];
  for (const variants of map.values()) {
    // Sort by price — cheapest first
    variants.sort((a, b) => a.price - b.price);
    // Cheapest is the primary card, rest are fareVariants
    result.push({
      ...variants[0],
      fareVariants: variants, // all including itself
    });
  }

  return result;
}

export function cabinClassCode(c: SearchForm["cabinClass"]): number {
  return { Economy: 2, "Premium Economy": 3, Business: 4, First: 5 }[c];
}

export function formatINR(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

// ─── MOCK AIRPORTS ─────────────────────────────────────────

// export const MOCK_AIRPORTS: Airport[] = [
//   { code: "DEL", city: "New Delhi", name: "Indira Gandhi International" },
//   { code: "BOM", city: "Mumbai", name: "Chhatrapati Shivaji Maharaj International" },
//   { code: "BLR", city: "Bengaluru", name: "Kempegowda International" },
//   { code: "HYD", city: "Hyderabad", name: "Rajiv Gandhi International" },
//   { code: "MAA", city: "Chennai", name: "Chennai International" },
//   { code: "CCU", city: "Kolkata", name: "Netaji Subhas Chandra Bose International" },
//   { code: "GOI", city: "Goa", name: "Goa International" },
//   { code: "AMD", city: "Ahmedabad", name: "Sardar Vallabhbhai Patel International" },
//   { code: "PNQ", city: "Pune", name: "Pune International" },
//   { code: "JAI", city: "Jaipur", name: "Jaipur International" },
//   { code: "BKK", city: "Bangkok", name: "Suvarnabhumi International", country: "Thailand" },
//   { code: "DXB", city: "Dubai", name: "Dubai International", country: "UAE" },
//   { code: "SIN", city: "Singapore", name: "Changi International", country: "Singapore" },
//   { code: "LHR", city: "London", name: "Heathrow", country: "UK" },
//   { code: "NRT", city: "Tokyo", name: "Narita International", country: "Japan" },
//   { code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "France" },
//   { code: "JFK", city: "New York", name: "John F. Kennedy International", country: "USA" },
// ];

// ─── MOCK FLIGHTS ──────────────────────────────────────────

export function getMockFlights(from: string, to: string, date: string): DisplayFlight[] {
  const airportLookup: Record<string, { city: string; name: string }> = {
  DEL: { city: "New Delhi",   name: "Indira Gandhi International" },
  BOM: { city: "Mumbai",      name: "Chhatrapati Shivaji Maharaj International" },
  BLR: { city: "Bengaluru",  name: "Kempegowda International" },
  HYD: { city: "Hyderabad",  name: "Rajiv Gandhi International" },
  MAA: { city: "Chennai",    name: "Chennai International" },
  CCU: { city: "Kolkata",    name: "Netaji Subhas Chandra Bose International" },
  GOI: { city: "Goa",        name: "Goa International" },
  AMD: { city: "Ahmedabad",  name: "Sardar Vallabhbhai Patel International" },
  BKK: { city: "Bangkok",    name: "Suvarnabhumi International" },
  DXB: { city: "Dubai",      name: "Dubai International" },
  SIN: { city: "Singapore",  name: "Changi International" },
  LHR: { city: "London",     name: "Heathrow" },
  JFK: { city: "New York",   name: "John F. Kennedy International" },
};
  const fromInfo = airportLookup[from] ?? { city: from, name: from };
  const toInfo = airportLookup[to] ?? { city: to, name: to };

  const airlines = [
    { name: "IndiGo", code: "6E", fn: "6E-2045", lcc: true },
    { name: "Air India", code: "AI", fn: "AI-101", lcc: false },
    { name: "SpiceJet", code: "SG", fn: "SG-162", lcc: true },
    { name: "Vistara", code: "UK", fn: "UK-822", lcc: false },
    { name: "Akasa Air", code: "QP", fn: "QP-1820", lcc: true },
    { name: "Air India Express", code: "IX", fn: "IX-763", lcc: true },
  ];
  const prices = [6820, 7890, 7308, 9450, 6978, 6499];
  const deps = ["05:30", "08:15", "10:00", "13:45", "17:20", "21:00"];
  const durations = [135, 145, 150, 140, 155, 130];
  const terminals = ["T1", "T3", "T1", "T3", "T2", "T1"];
  const arrTerminals = ["T2", "T2", "T1", "T2", "T1", "T2"];
  const crafts = ["A320neo", "B787-8", "B737", "A320", "B737-MAX", "A320neo"];
  const seats = [7, 22, 3, 15, 9, 28];
  const fareClasses = ["V", "S", "Q", "Y", "K", "L"];

  // FIX #2 applied: use T00:00:00 to force local date interpretation
  const safeDate = date || new Date().toISOString().split("T")[0];
  const dispDate = fmtDateLocal(safeDate);

  return airlines.map((a, i) => {
    const [hh, mm] = deps[i].split(":").map(Number);
    const dur = durations[i];
    const arrMin = hh * 60 + mm + dur;
    const arrH = String(Math.floor(arrMin / 60) % 24).padStart(2, "0");
    const arrM = String(arrMin % 60).padStart(2, "0");
    const crosses = Math.floor(arrMin / (24 * 60));
    const arriveTime = `${arrH}:${arrM}`;
    const arrDate = crosses > 0 ? `+${crosses}d` : dispDate;
    const baseFare = Math.round(prices[i] * 0.7);
    const tax = prices[i] - baseFare;

    const segment: import("./types_t").FlightSegmentDetail = {
      airlineCode: a.code,
      airlineName: a.name,
      flightNumber: a.fn,
      fareClass: fareClasses[i],
      fromCode: from,
      fromCity: fromInfo.city,
      fromAirport: fromInfo.name,
      fromTerminal: terminals[i],
      toCode: to,
      toCity: toInfo.city,
      toAirport: toInfo.name,
      toTerminal: arrTerminals[i],
      departISO: `${safeDate}T${deps[i]}:00`,
      arriveISO: `${safeDate}T${arriveTime}:00`,
      departTime: deps[i],
      arriveTime: arriveTime,
      departDate: dispDate,
      arriveDate: arrDate,
      duration: dur,
      durationLabel: `${Math.floor(dur / 60)}h ${dur % 60}m`,
      craft: crafts[i],
    };
    
    return {
      resultIndex: `MOCK_R${i}`,
      traceId: "MOCK_TRACE_001",
      source: 1,
      airline: a.name,
      airlineCode: a.code,
      flightNumber: a.fn,
      fromCode: from,
      fromCity: fromInfo.city,
      fromAirport: fromInfo.name,
      toCode: to,
      toCity: toInfo.city,
      toAirport: toInfo.name,
      departTime: deps[i],
      arriveTime,
      departDate: dispDate,
      arriveDate: arrDate,
      departISO: `${safeDate}T${deps[i]}:00`,
      arriveISO: `${safeDate}T${arriveTime}:00`,
      duration: dur,
      durationLabel: `${Math.floor(dur / 60)}h ${dur % 60}m`,
      stops: i === 0 ? 1 : 0,
      stopInfo: i === 0 ? "via LKO" : undefined,
      price: prices[i],
      baseFare,
      tax,
      cabinBaggage: "7 Kg",
      checkinBaggage: i >= 3 ? "20 Kg" : "15 Kg",
      isRefundable: i >= 2,
      isLCC: a.lcc,
      fareType: i === 3 ? "SME" : "Regular",
      fareClass: fareClasses[i],
      terminal: terminals[i],
      arrivalTerminal: arrTerminals[i],
      craft: crafts[i],
      seatsLeft: seats[i],
      isPanRequired: i < 3,
      isPassportRequired: false,
      segments: [segment],
    };
  });
}

export function getMockReturnFlights(from: string, to: string, date: string): DisplayFlight[] {
  return getMockFlights(to, from, date).map((f, i) => ({
    ...f,
    resultIndex: `MOCK_RET${i}`,
    traceId: "MOCK_TRACE_001",
  }));
}

// ─── MOCK FARE TIERS ───────────────────────────────────────

export function getMockFareTiers(flight: DisplayFlight): FareTier[] {
  return [
    {
      name: "Saver",
      price: flight.price,
      cabinBag: flight.cabinBaggage,
      checkinBag: flight.checkinBaggage,
      cancellationFee: "₹4,999 (3h – 3 days before)",
      dateChangeFee: "₹2,999 (3h – 365 days)",
      seatSelection: "Chargeable",
      meals: "Chargeable",
      resultIndex: flight.resultIndex,
    },
    {
      name: "Flexi",
      tag: "Best Value",
      price: flight.price + 544,
      cabinBag: flight.cabinBaggage,
      checkinBag: flight.checkinBaggage,
      cancellationFee: "₹3,499 (3h – 24h)",
      dateChangeFee: "₹999 (3h – 3 days)",
      seatSelection: "Free (Standard)",
      meals: "Chargeable",
      recommended: true,
      resultIndex: flight.resultIndex + "_FLEXI",
    },
    {
      name: "Premium",
      price: flight.price + 3150,
      cabinBag: flight.cabinBaggage,
      checkinBag: "20 Kg",
      cancellationFee: "₹799 (3 days+)",
      dateChangeFee: "Free Date Change",
      seatSelection: "Free (XL Seats)",
      meals: "Complimentary",
      resultIndex: flight.resultIndex + "_PREM",
    },
  ];
}

// ─── MOCK POPULAR ROUTES ───────────────────────────────────

export const POPULAR_ROUTES = [
  { from: "DEL", to: "BOM", fromCity: "Delhi", toCity: "Mumbai", price: 3499, img: "mumbai" },
  { from: "DEL", to: "BLR", fromCity: "Delhi", toCity: "Bengaluru", price: 4199, img: "bangalore" },
  { from: "BOM", to: "GOI", fromCity: "Mumbai", toCity: "Goa", price: 2899, img: "goa" },
  { from: "DEL", to: "DXB", fromCity: "Delhi", toCity: "Dubai", price: 12499, img: "dubai" },
  { from: "BOM", to: "SIN", fromCity: "Mumbai", toCity: "Singapore", price: 18999, img: "singapore" },
  { from: "DEL", to: "BKK", fromCity: "Delhi", toCity: "Bangkok", price: 14299, img: "bangkok" },
];

export const PROMO_OFFERS = [
  {
    code: "FIRST500",
    title: "First Booking Discount",
    desc: "Save ₹500 on your first flight booking with PlumTrips",
    badge: "New User",
    discount: "₹500 off",
  },
  {
    code: "HDFC10",
    title: "HDFC Bank Offer",
    desc: "10% instant discount on HDFC credit cards, max ₹2,000",
    badge: "Bank Offer",
    discount: "10% off",
  },
  {
    code: "EARLYBIRD",
    title: "Early Bird Fares",
    desc: "Book 30 days in advance and save up to 25%",
    badge: "Limited Time",
    discount: "Up to 25%",
  },
];

// ─── FRONTEND API LAYER ─────────────────────────────────────
// All calls go through our backend proxy — never direct to TBO.

// ── Search ──────────────────────────────────────────────────

export type FlightSearchResult = {
  outbound: DisplayFlight[];
  returnFlights?: DisplayFlight[];
  multiLegFlights?: DisplayFlight[][];
  // FIX #4: Surface the TBO "no results" reason so ResultsPage can show a
  // helpful message like "No flights on this route for the selected date"
  // instead of a blank empty-state with no context.
  noResultReason?: string;
};

export async function apiSearchFlights(
  form: SearchForm,
  multiLegs?: { from: Airport; to: Airport; departDate: string }[]
): Promise<FlightSearchResult> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 900));
    if (form.tripType === "roundTrip" && form.returnDate) {
      return {
        outbound: getMockFlights(form.from.code, form.to.code, form.departDate),
        returnFlights: getMockReturnFlights(form.from.code, form.to.code, form.returnDate),
      };
    }
    // Mock path — already correct structure, just add _legIndex tags
if (form.tripType === "multiCity" && multiLegs && multiLegs.length >= 2) {
  const multiLegFlights = multiLegs.map((leg, legIdx) =>
    getMockFlights(leg.from.code, leg.to.code, leg.departDate).map(f => ({
      ...f, _legIndex: legIdx,
    }))
  );
  return {
    outbound: multiLegFlights[0] ?? [],
    multiLegFlights,
  };
}
    return { outbound: getMockFlights(form.from.code, form.to.code, form.departDate) };
  }

  // ── Live TBO via backend proxy ──────────────────────────
  const body: Record<string, unknown> = {
    origin: form.from.code,
    destination: form.to.code,
    departDate: form.departDate,
    cabinClass: cabinClassCode(form.cabinClass),
    adults: form.adults,
    children: form.children,
    infants: form.infants,
    nonStopOnly: form.nonStopOnly,
    fareType: form.fareType,
    tripType: form.tripType,
  };

  if (form.tripType === "roundTrip" && form.returnDate) {
    body.returnDate = form.returnDate;
  }

  if (form.tripType === "multiCity" && multiLegs && multiLegs.length >= 2) {
    body.segments = multiLegs.map((leg) => ({
      origin: leg.from.code,
      destination: leg.to.code,
      departDate: leg.departDate,
    }));
  }

  const res = await fetch(`${API_BASE}/api/v1/flights/tbo/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let errMsg = `Search failed (HTTP ${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson?.message) errMsg = errJson.message;
      else if (errJson?.error) errMsg = errJson.error;
    } catch { /* ignore parse errors, keep generic message */ }
    throw new Error(errMsg);
  }

  const json = await res.json();

  const responseData = json?.ok === false
    ? (() => { throw new Error(json.message ?? "Search failed"); })()
    : json?.data ?? json;

  const traceId: string = responseData?.Response?.TraceId ?? "";
  const rawResults = responseData?.Response?.Results ?? [];

  // TBO sometimes returns TBOFlightResult[] instead of TBOFlightResult[][]
  const results: import("./types_t").TBOFlightResult[][] = Array.isArray(rawResults[0])
    ? rawResults
    : rawResults.length > 0 ? [rawResults] : [];

  if (!results.length) {
    // FIX #4: Pass the human-readable reason (set by backend when ErrorCode 25/6)
    // to the UI so ResultsPage can render a meaningful empty state message.
    const noResultReason: string | undefined = responseData?.Response?.NoResultReason;
    return { outbound: [], noResultReason };
  }

  const outbound = (results[0] ?? []).map((r) => tboResultToDisplay(r, traceId));

// flights_api.ts — replace the round-trip block
if (form.tripType === "roundTrip") {
  // Case A: TBO gave us two separate arrays (standard)
  if (results[1] && results[1].length > 0) {
    return {
      outbound: groupByFlight(outbound),
      returnFlights: results[1].map((r) => tboResultToDisplay(r, traceId)),
    };
  }
  // Case B: TBO gave us one flat array — split by origin code
  const returnCode = form.to.code.toUpperCase();
  const returnFlights = (results[0] ?? [])
    .filter(r => r.Segments?.[0]?.[0]?.Origin?.Airport?.AirportCode === returnCode)
    .map(r => tboResultToDisplay(r, traceId));
  const filteredOutbound = outbound.filter(
    f => f.fromCode !== returnCode
  );
  if (returnFlights.length > 0) {
    return { outbound: filteredOutbound, returnFlights };
  }
  return { outbound };
}

// ── Multi-City ────────────────────────────────────────────
if (form.tripType === "multiCity") {
  const legCount = multiLegs?.length ?? 2;

  const allResults = results[0] ?? [];

  const multiLegFlights: DisplayFlight[][] = Array.from({ length: legCount }, (_, legIdx) =>
    groupByFlight(
    allResults
      .filter(r => r.Segments?.[legIdx] && r.Segments[legIdx].length > 0)
      .map(r => ({
        ...tboResultToDisplay(r, traceId, legIdx),
        _legIndex: legIdx,
      } as DisplayFlight & { _legIndex: number }))
    )
  );

  return {
    outbound: multiLegFlights[0] ?? [],
    multiLegFlights,
    noResultReason:
      multiLegFlights.some(leg => leg.length === 0)
        ? "Some legs returned no flights — try different dates"
        : undefined,
  };
}

// ── One-Way fallback ─────────────────────────────────────
return { outbound: groupByFlight(outbound) };
}

// ── FareQuote ───────────────────────────────────────────────

/**
 * Converts a TBO cancellation policy amount + hour range into a human-readable string.
 * PolicyType: 1 = cancellation charge, 4 = date change charge
 */
function policyLabel(
  policies: import("./types_t").TBOCancellationPolicy[],
  type: 1 | 4
): string {
  const matches = policies.filter((p) => p.PolicyType === type);
  if (!matches.length) return "As per airline";
  // Sort by FromHours ascending — show the first (most common) bracket
  matches.sort((a, b) => a.FromHours - b.FromHours);
  const p = matches[0];
  if (p.Amount === 0) return "Free";
  const hrs = p.ToHours > 0 ? `${p.FromHours}h – ${p.ToHours}h before` : `${p.FromHours}h+ before`;
  return `₹${p.Amount.toLocaleString("en-IN")} (${hrs})`;
}

export type FareQuoteResult = {
  tiers: FareTier[];
  fareChanged: boolean;
};

export async function apiFareQuote(
  flight: DisplayFlight
): Promise<FareQuoteResult> {
  // ── MOCK path (unchanged) ──────────────────────────────
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 900));
    return { tiers: getMockFareTiers(flight), fareChanged: false };
  }

  // ── LIVE path ──────────────────────────────────────────
  // Use fareVariants if available, otherwise just this flight
  const variants: DisplayFlight[] = 
    (flight.fareVariants && flight.fareVariants.length > 0)
      ? flight.fareVariants
      : [flight];

  // Call fare-quote for all variants in parallel
  const responses = await Promise.all(
    variants.map(async (v) => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/flights/tbo/fare-quote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            traceId: v.traceId,
            resultIndex: v.resultIndex,
          }),
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json?.data ?? json;
      } catch {
        return null;
      }
    })
  );

  const tiers: FareTier[] = [];
  let fareChanged = false;

  responses.forEach((responseData, i) => {
    if (!responseData) return;

    const response = responseData?.Response;
    if (!response?.Results) return;

    const result = response.Results;
    const fare = result.Fare;
console.log("RAW FARE QUOTE RESPONSE:", JSON.stringify(response?.Results, null, 2));
console.log("CANCELLATION POLICIES:", JSON.stringify(response?.CancellationPolicies, null, 2));
    const policies: import("./types_t").TBOCancellationPolicy[] =
      response.CancellationPolicies ?? [];

    if (response.IsFareChanged) fareChanged = true;

    const cabinBag =
      result.CabinBaggage?.[0]?.CabinBaggage ?? variants[i].cabinBaggage;
    const checkinBag =
      result.Baggage?.[0]?.Baggage ?? variants[i].checkinBaggage;
    const livePrice = fare.OfferedFare;
    const cancelFee = policyLabel(policies, 1);
    const changeFee = policyLabel(policies, 4);

    // Fare name: use TBO's actual fare type/class
    const fareName =
      result.FareType ||
      result.FareClass ||
      variants[i].fareType ||
      variants[i].fareClass ||
      `Option ${i + 1}`;

    tiers.push({
      name: fareName,
      price: livePrice,
      cabinBag,
      checkinBag,
      cancellationFee: cancelFee,
      dateChangeFee: changeFee,
      seatSelection: result.IsLCC ? "Chargeable" : "Free (Standard)",
      meals: result.IsLCC ? "Chargeable" : "Complimentary",
      // Mark cheapest as recommended
      recommended: i === 0,
      resultIndex: result.ResultIndex,
    });
  });

  // Fallback: if all fare-quote calls failed, show single tier
  // from original search data so user isn't stuck
  if (tiers.length === 0) {
    tiers.push({
      name: flight.fareType || "Standard",
      price: flight.price,
      cabinBag: flight.cabinBaggage,
      checkinBag: flight.checkinBaggage,
      cancellationFee: "As per airline",
      dateChangeFee: "As per airline",
      seatSelection: flight.isLCC ? "Chargeable" : "Free",
      meals: flight.isLCC ? "Chargeable" : "Complimentary",
      recommended: true,
      resultIndex: flight.resultIndex,
    });
  }

  return { tiers, fareChanged };
  
}

// ── SSR (Seats + Meals + Baggage) ───────────────────────────

export type ApiSeat = {
  code: string;        // "14A"
  isOccupied: boolean;
  isPremium: boolean;
  price: number;       // 0 = free
  type: "Window" | "Middle" | "Aisle";
};

export type ApiSeatRow = {
  rowNumber: number;
  seats: ApiSeat[];
};

export type ApiSeatMap = {
  rows: ApiSeatRow[];
  cols: string[];
  totalRows: number;
};

export type SSRMeal = {
  code: string;
  label: string;
  description: string;
  price: number;
  emoji: string;
};

export type SSRBaggage = {
  kg: number;
  label: string;
  description: string;
  price: number;
};

export type SSRResult = {
  seatMap: ApiSeatMap;
  meals: SSRMeal[];
  baggage: SSRBaggage[];
};

const MEAL_META: Record<string, { label: string; desc: string; emoji: string }> = {
  VGML: { label: "Vegetarian",    desc: "Fresh veg meal",        emoji: "🥗" },
  NVML: { label: "Non-Veg",       desc: "Chicken / mutton",      emoji: "🍗" },
  VJML: { label: "Jain Meal",     desc: "No root vegetables",    emoji: "🙏" },
  VLML: { label: "Vegan",         desc: "100% plant-based",      emoji: "🌱" },
  DBML: { label: "Diabetic",      desc: "Low-sugar, high-fiber", emoji: "💊" },
  BLML: { label: "Bland Meal",    desc: "Plain & easy to digest",emoji: "🍚" },
  HNML: { label: "Hindu Meal",    desc: "No beef/pork",          emoji: "🪔" },
  MOML: { label: "Muslim Meal",   desc: "Halal certified",       emoji: "☪️" },
  CHML: { label: "Child Meal",    desc: "Kid-friendly",          emoji: "🧒" },
};

// Static fallbacks used when airline returns no SSR
const FALLBACK_MEALS: SSRMeal[] = [
  { code: "NONE",  label: "No meal",        description: "Skip meal selection",    price: 0,   emoji: "🚫" },
  { code: "VGML",  label: "Vegetarian",     description: "Fresh veg meal",         price: 299, emoji: "🥗" },
  { code: "NVML",  label: "Non-Vegetarian", description: "Chicken / mutton",       price: 349, emoji: "🍗" },
  { code: "VLML",  label: "Vegan",          description: "100% plant-based",       price: 349, emoji: "🌱" },
  { code: "VJML",  label: "Jain Meal",      description: "No root vegetables",     price: 299, emoji: "🙏" },
  { code: "DBML",  label: "Diabetic",       description: "Low-sugar, high-fiber",  price: 349, emoji: "💊" },
];

const FALLBACK_BAGGAGE: SSRBaggage[] = [
  { kg: 0,  label: "Included only", description: "Use fare allowance", price: 0    },
  { kg: 5,  label: "+ 5 kg",        description: "Extra check-in",     price: 599  },
  { kg: 10, label: "+ 10 kg",       description: "Extra check-in",     price: 999  },
  { kg: 15, label: "+ 15 kg",       description: "Extra check-in",     price: 1399 },
  { kg: 20, label: "+ 20 kg",       description: "Extra check-in",     price: 1799 },
];

function buildMockSeatMap(): ApiSeatMap {
  const cols = ["A", "B", "C", "D", "E", "F"];
  const rows: ApiSeatRow[] = Array.from({ length: 32 }, (_, ri) => {
    const rowNumber = ri + 1;
    const isPremiumRow = rowNumber <= 3 || rowNumber === 12 || rowNumber === 13;
    return {
      rowNumber,
      seats: cols.map((col, ci) => ({
        code: `${rowNumber}${col}`,
        isOccupied: Math.random() < 0.3,
        isPremium: isPremiumRow,
        price: isPremiumRow ? 499 : 0,
        type: ci === 0 || ci === 5 ? "Window" : ci === 2 || ci === 3 ? "Aisle" : "Middle",
      })),
    };
  });
  return { rows, cols, totalRows: 32 };
}

function parseTBOSSR(raw: any): SSRResult {
  const response = raw?.Response;

  // ── SEATS ──────────────────────────────────────────────────
  // CONFIRMED path from TBO logs:
  // SeatDynamic[0].SegmentSeat[0].RowSeats = [{Seats:[{Code:"1A",RowNo:"1",SeatNo:"A",...}]}, ...]
  // AvailablityType: 0=NoSeat, 1=Available, 2=Blocked, 3=Occupied
  const rowSeats: any[] =
    response?.SeatDynamic?.[0]?.SegmentSeat?.[0]?.RowSeats ?? [];

  // Skip the NoSeat placeholder row (RowNo "0")
  const validRows = rowSeats.filter((rowObj: any) => {
    const first = rowObj?.Seats?.[0];
    return first && String(first.RowNo).trim() !== "0" && first.Code !== "NoSeat";
  });

  let seatMap: ApiSeatMap;
  if (validRows.length > 0) {
    // Derive columns from actual data — handles non-standard aircraft configs
    const colSet = new Set<string>();
    validRows.forEach((rowObj: any) => {
      (rowObj.Seats ?? []).forEach((s: any) => {
        if (s.SeatNo) colSet.add(String(s.SeatNo));
      });
    });
    const cols = [...colSet].sort();

    const rows: ApiSeatRow[] = validRows.map((rowObj: any) => {
      const seats: any[] = rowObj.Seats ?? [];
      const rowNo = String(seats[0]?.RowNo ?? "0").trim();
      return {
        rowNumber: Number(rowNo),
        seats: seats.map((s: any) => ({
          code: s.Code,                            // already "1A","4B" etc from TBO
          isOccupied: s.AvailablityType === 3 || s.AvailablityType === 2,
          isPremium: s.SeatType === 1 || Number(rowNo) <= 3,
          price: Number(s.Price ?? 0),
          type:
            s.SeatNo === "A" || s.SeatNo === "F" ? "Window"
            : s.SeatNo === "C" || s.SeatNo === "D" ? "Aisle"
            : "Middle",
        })),
      };
    });
    seatMap = { rows, cols, totalRows: rows.length };
  } else {
    seatMap = buildMockSeatMap();
  }

  // ── MEALS ──────────────────────────────────────────────────
  // CONFIRMED path: MealDynamic[0] = flat array of meal objects
  // Each: { Code, AirlineDescription, Price, ... }
  const rawMeals: any[] = response?.MealDynamic?.[0] ?? [];
  const realMeals = rawMeals.filter((m: any) => m.Code && m.Code !== "NoMeal");

  const meals: SSRMeal[] =
    realMeals.length > 0
      ? [
          { code: "NONE", label: "No meal", description: "Skip meal selection", price: 0, emoji: "🚫" },
          ...realMeals.map((m: any) => {
            const meta = MEAL_META[m.Code];
            return {
              code: m.Code,
              label: meta?.label ?? m.AirlineDescription ?? m.Code,
              description: meta?.desc ?? m.AirlineDescription ?? "",
              price: Number(m.Price ?? 0),
              emoji: meta?.emoji ?? "🍽️",
            };
          }),
        ]
      : FALLBACK_MEALS;

  // ── BAGGAGE ────────────────────────────────────────────────
  // CONFIRMED path: Baggage[0] = flat array
  // Each: { Code, Weight (number), Price (number), Text? }
  // TBO sends duplicates per weight (different codes) — keep lowest price
  const rawBaggage: any[] = response?.Baggage?.[0] ?? [];
  const realBaggage = rawBaggage.filter(
    (b: any) => b.Code !== "NoBaggage" && Number(b.Weight ?? 0) > 0
  );

  const bagByWeight = new Map<number, any>();
  realBaggage.forEach((b: any) => {
    const kg = Number(b.Weight);
    const existing = bagByWeight.get(kg);
    if (!existing || Number(b.Price) < Number(existing.Price)) {
      bagByWeight.set(kg, b);
    }
  });

  const baggage: SSRBaggage[] =
    bagByWeight.size > 0
      ? [
          { kg: 0, label: "Included only", description: "Use fare allowance", price: 0 },
          ...[...bagByWeight.values()]
            .sort((a, b) => Number(a.Weight) - Number(b.Weight))
            .map((b: any) => ({
              kg: Number(b.Weight),
              label: `+ ${b.Weight} kg`,
              description: b.Text ?? `Extra ${b.Weight}kg check-in`,
              price: Number(b.Price),
            })),
        ]
      : FALLBACK_BAGGAGE;

  return { seatMap, meals, baggage };
}

// Fetch SSR for a single flight leg
async function fetchSSRForFlight(flight: DisplayFlight): Promise<SSRResult> {
  const res = await fetch(`${API_BASE}/api/v1/flights/tbo/ssr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ traceId: flight.traceId, resultIndex: flight.resultIndex }),
  });
  if (!res.ok) {
    console.warn(`[apiGetSSR] HTTP ${res.status} for ${flight.resultIndex} — using fallback`);
    return { seatMap: buildMockSeatMap(), meals: FALLBACK_MEALS, baggage: FALLBACK_BAGGAGE };
  }
  const json = await res.json();
  return parseTBOSSR(json?.data ?? json);
}

// Single-leg SSR (one-way)
export async function apiGetSSR(flight: DisplayFlight): Promise<SSRResult> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 700));
    return { seatMap: buildMockSeatMap(), meals: FALLBACK_MEALS, baggage: FALLBACK_BAGGAGE };
  }
  return fetchSSRForFlight(flight);
}

// Multi-leg SSR — returns one SSRResult per leg in order
// For round-trip: [outboundSSR, returnSSR]
// For multi-city: [leg0SSR, leg1SSR, leg2SSR, ...]
export async function apiGetSSRForLegs(
  legs: DisplayFlight[]
): Promise<SSRResult[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 700));
    return legs.map(() => ({
      seatMap: buildMockSeatMap(),
      meals: FALLBACK_MEALS,
      baggage: FALLBACK_BAGGAGE,
    }));
  }
  // Fetch all legs in parallel
  return Promise.all(legs.map((f) => fetchSSRForFlight(f)));
}

// ── Book ────────────────────────────────────────────────────

export type BookPassenger = {
  Title: "Mr" | "Ms" | "Mrs" | "Mstr" | "Miss";
  FirstName: string;
  LastName: string;
  PaxType: 1 | 2 | 3;
  DateOfBirth: string;
  Gender: 1 | 2;
  PassportNo?: string;
  PassportExpiry?: string;
  Pan?: string;
};

export type BookFlightInput = {
  traceId: string;
  resultIndex: string;
  isLCC?: boolean;
  passengers: BookPassenger[];
  contact: { Email: string; Mobile: string };
  gst?: {
    GSTNumber?: string;
    GSTCompanyName?: string;
    GSTCompanyEmail?: string;
    GSTCompanyAddress?: string;
  };
};

export async function apiBookFlight(
  input: BookFlightInput
): Promise<{ pnr: string; bookingId: number }> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 1500));
    return {
      pnr: "MOCK" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      bookingId: Math.floor(Math.random() * 9_000_000 + 1_000_000),
    };
  }
  const res = await fetch(`${API_BASE}/api/v1/flights/tbo/book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    let errMsg = `Booking failed (HTTP ${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson?.message) errMsg = errJson.message;
    } catch { /* ignore */ }
    throw new Error(errMsg);
  }
  const json = await res.json();
  const responseData = json?.data ?? json;
  const response = responseData?.Response;
  if (!response?.PNR) throw new Error("Booking succeeded but PNR is missing from response");
  return { pnr: response.PNR, bookingId: response.BookingId };
}

// ── Airports ────────────────────────────────────────────────

export async function apiGetAirports(): Promise<Airport[]> {
  const res = await fetch(`${API_BASE}/api/v1/flights/tbo/airports`);
  if (!res.ok) throw new Error("Failed to fetch airports");
  const json = await res.json();
  return (json?.data ?? json) as Airport[];
}