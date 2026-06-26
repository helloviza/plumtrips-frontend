// ============================================================
//  PLUMTRIPS — Flight API (backend-proxy only)
//  All TBO credentials and auth live on the server.
//  Frontend never talks to TBO directly.
// ============================================================

import type {
  DisplayFlight, FareTier, Airport, SearchForm, TBOFlightResult
} from "./types_t";

import type {
  TicketPassportDetail,TicketBaggage,TicketMealDynamic,TicketPassengerFare,
  TicketLCCPassenger,TicketNonLCCInput,TicketLCCInput,BookTicketResponse,BookTicketInput
} from "./types_t";

// ─── CONFIG ────────────────────────────────────────────────

/**
 * FIX #1: VITE_MOCK_MODE=false in .env now correctly disables mock mode.
 * Previously, an unset variable evaluates undefined !== "false" = true (always mock).
 * Now: only true when explicitly set to "true". Defaults to false (live mode).
 */
export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === "true";

/** Backend proxy base URL — all TBO calls go through here. */
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

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

// ─── TBO FARE CLASS → HUMAN-READABLE NAME ─────────────────
/**
 * TBO returns raw fare class codes (RR, SO, GG, F, Y, etc.) in FareClass.
 * FareType gives the category (Regular, SME, Student, etc.).
 * This mapper turns them into readable names for display in the fare tier cards.
 *
 * Priority order:
 *  1. FareType (if not "Regular") — e.g. "SME", "Student", "Armed Forces"
 *  2. FareClass code lookup — map known IATA/TBO codes to friendly names
 *  3. Cabin class fallback based on first letter heuristic
 *  4. Generic fallback "Option N"
 */

// Known TBO / IATA fare class code → friendly label
const TBO_FARE_CLASS_MAP: Record<string, string> = {
  // Economy — Saver / Basic
  Y:  "Economy Flex",
  B:  "Economy",
  M:  "Economy",
  H:  "Economy Saver",
  K:  "Economy Saver",
  L:  "Economy Lite",
  V:  "Economy Value",
  S:  "Economy Smart",
  N:  "Economy",
  Q:  "Economy",
  T:  "Economy",
  O:  "Economy",
  G:  "Economy",
  X:  "Economy",
  E:  "Economy",
  Z:  "Business Flex",
  W:  "Premium Economy",
  // TBO-specific / airline-specific codes
  RR: "Regular Fare",
  SO: "Special Offer",
  GG: "Group Fare",
  SR: "Super Saver",
  SP: "Saver Plus",
  FL: "Flexi",
  PF: "Premium Flexi",
  CF: "Corporate Fare",
  SF: "Student Fare",
  AF: "Armed Forces",
  SE: "Senior Citizen",
  // Business / First
  J:  "Business",
  C:  "Business Flex",
  D:  "Business Saver",
  I:  "Business",
  F:  "First Class",
  A:  "First Class",
  P:  "First Class Flex",
  R:  "First Saver",
  // IndiGo specific
  "6E_SAVER":    "IndiGo Saver",
  "6E_FLEXI":    "IndiGo Flexi",
  "6E_SUPERMAX": "IndiGo SuperMax",
  // Air India
  AI_SAVER:  "AI Saver",
  AI_FLEXI:  "AI Flexi",
  AI_VALUE:  "AI Value",
};

// FareType overrides (when TBO sends a non-"Regular" FareType)
const TBO_FARE_TYPE_MAP: Record<string, string> = {
  SME:              "Corporate / SME",
  Student:          "Student Fare",
  ArmedForces:      "Armed Forces",
  SeniorCitizen:    "Senior Citizen",
  DoubleSeat:       "Double Seat",
  Tactical:         "Special Offer",
  Offer:            "Special Offer",
  "Special Return": "Special Return",
  Series:           "Series Fare",
  Default:          "Standard",
};

/**
 * Resolves a human-readable fare tier name from TBO response fields.
 * @param fareClass  - e.g. "RR", "SO", "Y", "J"
 * @param fareType   - e.g. "Regular", "SME", "Student"
 * @param index      - position among variants (0-based), used only as last resort
 */
function resolveFareName(
  fareClass: string | undefined,
  fareType: string | undefined,
  index: number,
  supplierFareClass?: string,
  fareClassificationType?: string,
): string {
  // 1. SupplierFareClass — most human-readable, directly from TBO segment
  //    e.g. "Saver (Regular)", "UpFront", "FlexMax"
  if (supplierFareClass && supplierFareClass.trim() !== "") {
    return supplierFareClass.trim();
  }

  // 2. FareClassification.Type — same value, second source
  if (
    fareClassificationType &&
    fareClassificationType.trim() !== "" &&
    fareClassificationType.toLowerCase() !== "regular"
  ) {
    return fareClassificationType.trim();
  }

  // 3. Non-generic FareType
  if (
    fareType &&
    fareType !== "Regular" &&
    fareType !== "RegularFare" &&
    fareType !== "Default" &&
    fareType !== ""
  ) {
    return TBO_FARE_TYPE_MAP[fareType] ?? fareType;
  }

  // 4. FareClass code lookup
  if (fareClass && fareClass !== "") {
    const mapped = TBO_FARE_CLASS_MAP[fareClass.toUpperCase()];
    if (mapped) return mapped;
    return `Class ${fareClass.toUpperCase()}`;
  }

  // 5. Index fallback 
  const fallbacks = ["Economy", "Economy Flexi", "Economy Premium", "Business", "First Class"];
  return fallbacks[index] ?? `Option ${index + 1}`;
}

export function tboResultToDisplay(result: import("./types_t").TBOFlightResult, traceId: string, legIndex = 0): DisplayFlight {

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

function tboResultToMultiCityItinerary(
  result: import("./types_t").TBOFlightResult,
  traceId: string,
): DisplayFlight {
  const itineraryLegs = result.Segments.map((_, legIndex) =>
    tboResultToDisplay(result, traceId, legIndex)
  );
  const firstLeg = itineraryLegs[0];
  const lastLeg = itineraryLegs[itineraryLegs.length - 1] ?? firstLeg;
  const totalDuration = itineraryLegs.reduce((sum, leg) => sum + leg.duration, 0);

  return {
    ...firstLeg,
    toCode: lastLeg.toCode,
    toCity: lastLeg.toCity,
    toAirport: lastLeg.toAirport,
    arriveTime: lastLeg.arriveTime,
    arriveDate: lastLeg.arriveDate,
    arriveISO: lastLeg.arriveISO,
    arrivalTerminal: lastLeg.arrivalTerminal,
    duration: totalDuration,
    durationLabel: minToLabel(totalDuration),
    stops: itineraryLegs.reduce((sum, leg) => sum + leg.stops, 0),
    stopInfo: itineraryLegs.map((leg) => `${leg.fromCode}-${leg.toCode}`).join(" | "),
    segments: itineraryLegs.flatMap((leg) => leg.segments),
    itineraryLegs,
  };
}

function groupByFlight(flights: DisplayFlight[]): DisplayFlight[] {
  const map = new Map<string, DisplayFlight[]>();

  for (const f of flights) {
    const key = `${f.airlineCode}-${f.flightNumber}-${f.departISO}-${f.arriveISO}`;
    const group = map.get(key);
    if (group) group.push(f);
    else map.set(key, [f]);
  }

  const result: DisplayFlight[] = [];
  for (const variants of map.values()) {
    variants.sort((a, b) => a.price - b.price);
    result.push({
      ...variants[0],
      fareVariants: variants,
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

// ── Calendar Prices ─────────────────────────────────────────

/**
 * Returns a map of { "YYYY-MM-DD": lowestFareINR } for a given route
 * across the next ~90 days. Used to display price hints on the calendar.
 */
export async function apiGetCalendarPrices(
  fromCode: string,
  toCode: string,
  cabinClass: SearchForm["cabinClass"] = "Economy"
): Promise<Record<string, number>> {
  if (MOCK_MODE) {
    return {};
  }

  try {
    const params = new URLSearchParams({
      from: fromCode,
      to: toCode,
      cabinClass: String(cabinClassCode(cabinClass)),
      daysAhead: "62",
    });

    const res = await fetch(
      `${API_BASE}/api/v1/flights/calendar-prices?${params.toString()}`
    );

    if (!res.ok) {
      console.warn(`[apiGetCalendarPrices] HTTP ${res.status}; leaving calendar prices blank`);
      return {};
    }

    const json = await res.json();
    const data: Record<string, number> = json?.data ?? json;

    if (!data || typeof data !== "object" || Array.isArray(data)) {
      console.warn("[apiGetCalendarPrices] Unexpected response shape; leaving calendar prices blank");
      return {};
    }

    return Object.fromEntries(
      Object.entries(data).filter(([, price]) => typeof price === "number" && price > 0)
    );
  } catch (err) {
    console.warn("[apiGetCalendarPrices] Network error; leaving calendar prices blank", err);
    return {};
  }
}

// ── Search ──────────────────────────────────────────────────

export type FlightSearchResult = {
  outbound: DisplayFlight[];
  returnFlights?: DisplayFlight[];
  multiLegFlights?: DisplayFlight[][];
  noResultReason?: string;
};

function normalizeTboResults(rawResults: unknown): TBOFlightResult[] {
  if (!Array.isArray(rawResults)) return [];
  return Array.isArray(rawResults[0])
    ? (rawResults as TBOFlightResult[][]).flat()
    : rawResults as TBOFlightResult[];
}

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
    if (form.tripType === "multiCity" && multiLegs && multiLegs.length >= 2) {
      const multiLegFlights = multiLegs.map((leg, legIdx) =>
        getMockFlights(leg.from.code, leg.to.code, leg.departDate).map(f => ({
          ...f, _legIndex: legIdx,
        }))
      );
      return { outbound: multiLegFlights[0] ?? [], multiLegFlights };
    }
    return { outbound: getMockFlights(form.from.code, form.to.code, form.departDate) };
  }

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
    } catch { /* ignore */ }
    throw new Error(errMsg);
  }

  const json = await res.json();

  // ── MULTI-CITY: backend returns { ok, data: { legs: [...] } } ──────────────
  // This shape has NO Response.Results — handle it FIRST before anything else.
  if (form.tripType === "multiCity") {
    const responseData = json?.ok === false
      ? (() => { throw new Error(json.message ?? "Search failed"); })()
      : json?.data ?? json;

    const legs: Array<{
      legIndex: number;
      origin: string;
      destination: string;
      departDate: string;
      traceId: string;
      results: TBOFlightResult[];
    }> = responseData?.legs ?? [];

    if (!legs.length) {
      return { outbound: [], noResultReason: "No flights found for one or more legs" };
    }

    const multiLegFlights: DisplayFlight[][] = legs.map((leg) =>
      groupByFlight(
        normalizeTboResults(leg.results).map((r) => tboResultToDisplay(r, leg.traceId))
      )
    );

    return {
      outbound: multiLegFlights[0] ?? [],
      multiLegFlights,
    };
  }

  // ── ONE-WAY / ROUND-TRIP: backend returns { ok, data: { Response: { Results } } } ──
  const responseData = json?.ok === false
    ? (() => { throw new Error(json.message ?? "Search failed"); })()
    : json?.data ?? json;

  const traceId: string = responseData?.Response?.TraceId ?? "";
  const rawResults = responseData?.Response?.Results ?? [];

  const results: TBOFlightResult[][] = Array.isArray(rawResults[0])
    ? rawResults
    : rawResults.length > 0 ? [rawResults] : [];

  if (!results.length) {
    const noResultReason: string | undefined = responseData?.Response?.NoResultReason;
    return { outbound: [], noResultReason };
  }

  const outbound = (results[0] ?? []).map((r) => tboResultToDisplay(r, traceId));

  if (form.tripType === "roundTrip") {
    if (results[1] && results[1].length > 0) {
      return {
        outbound: groupByFlight(outbound),
        returnFlights: results[1].map((r) => tboResultToDisplay(r, traceId)),
      };
    }
    const returnCode = form.to.code.toUpperCase();
    const returnFlights = (results[0] ?? [])
      .filter(r => r.Segments?.[0]?.[0]?.Origin?.Airport?.AirportCode === returnCode)
      .map(r => tboResultToDisplay(r, traceId));
    const filteredOutbound = outbound.filter(f => f.fromCode !== returnCode);
    if (returnFlights.length > 0) {
      return { outbound: filteredOutbound, returnFlights };
    }
    return { outbound };
  }

  return { outbound: groupByFlight(outbound) };
}

// ── FareQuote ───────────────────────────────────────────────

/**
 * Parses TBO CancellationPolicy[] into a human-readable string.
 *
 * TBO PolicyType:
 *   1 = Cancellation fee
 *   4 = Date change fee
 *
 * Amount=0 means free. ToHours=0 means "from X hours onwards" (no upper bound).
 * We sort by FromHours ascending and show the most common/relevant window.
 */
function policyLabel(
  policies: import("./types_t").TBOCancellationPolicy[] | undefined,
  type: 1 | 4
): string {
  if (!policies || !Array.isArray(policies) || policies.length === 0) {
    return "As per airline";
  }

  const matches = policies.filter((p) => p && p.PolicyType === type);
  if (!matches.length) return "As per airline";

  // Sort by FromHours ascending
  matches.sort((a, b) => (a.FromHours ?? 0) - (b.FromHours ?? 0));

  // Build a human-readable summary (pick up to 2 most important windows)
  const lines = matches.slice(0, 2).map((p) => {
    // Build time window string
    const fromHours = p.FromHours ?? 0;
    const toHours = p.ToHours ?? 0;
    const amount = p.Amount ?? 0;
    const percentage = p.Percentage ?? 0;

    let window: string;
    if (fromHours === 0 && toHours === 0) {
      window = "Anytime";
    } else if (toHours > 0) {
      window = `${fromHours}h–${toHours}h before`;
    } else {
      window = `${fromHours}h+ before`;
    }

    // Build fee string
    if (amount === 0 && percentage === 0) {
      return `Free (${window})`;
    } else if (amount === 0 && percentage > 0) {
      return `${percentage}% (${window})`;
    } else if (percentage > 0) {
      return `₹${amount.toLocaleString("en-IN")} + ${percentage}% (${window})`;
    } else {
      return `₹${amount.toLocaleString("en-IN")} (${window})`;
    }
  });

  return lines.join(" / ") || "As per airline";
}


/**
 * Parses TBO MiniFareRules[] into a human-readable fee string.
 *
 * MiniFareRules element shape:
 *   { Type: "Cancellation"|"Reissue", From: "0", To: "3", Unit: "DAYS", Details: "INR 3999" }
 *
 * Unit can be "HOURS" or "DAYS".
 * To="" means "onwards" (no upper bound).
 * Details can be "INR 999", "NIL", "NILL", "FREE".
 */
function miniFareRuleLabel(
  rules: Array<{
    Type: string;
    From: string;
    To: string;
    Unit: string;
    Details: string;
  }> | undefined,
  type: "Cancellation" | "Reissue"
): string {
  if (!rules || !Array.isArray(rules) || rules.length === 0) return "As per airline";

  const matches = rules.filter(r => r && r.Type === type);
  if (!matches.length) return "As per airline";

  // Sort by From ascending numerically
  matches.sort((a, b) => Number(a.From ?? 0) - Number(b.From ?? 0));

  // Build label for each window, show up to 2
  const lines = matches.slice(0, 2).map(r => {
    const from    = r.From ?? "0";
    const to      = r.To ?? "";
    const rawUnit = (r.Unit ?? "HOURS").toUpperCase();
    const unit    = rawUnit === "DAYS" ? "d" : "h";
    const details = (r.Details ?? "").trim();

    // Build time window string
    let window: string;
    if (from === "0" && to === "") {
      window = "Anytime";
    } else if (to !== "") {
      window = `${from}${unit}–${to}${unit} before`;
    } else {
      window = `${from}${unit}+ before`;
    }

    // Parse fee from Details
    const upper = details.toUpperCase();
    if (upper === "NIL" || upper === "NILL" || upper === "FREE" || upper === "") {
      return `Free (${window})`;
    }
    const match = details.match(/[\d,]+/);
    if (match) {
      const amount = parseInt(match[0].replace(/,/g, ""), 10);
      return `₹${amount.toLocaleString("en-IN")} (${window})`;
    }
    return `${details} (${window})`;
  });

  return lines.join(" / ") || "As per airline";
}


export type FareQuoteResult = {
  tiers: FareTier[];
  fareChanged: boolean;
};

export async function apiFareQuote(
  flight: DisplayFlight
): Promise<FareQuoteResult> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 900));
    return { tiers: getMockFareTiers(flight), fareChanged: false };
  }

  const variants: DisplayFlight[] =
    (flight.fareVariants && flight.fareVariants.length > 0)
      ? flight.fareVariants
      : [flight];

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
        // 410 = session expired — throw so BookingPage catches it and
        // redirects the user back to search with a clear message.
        if (res.status === 410) {
          const errJson = await res.json();
          throw new Error(errJson?.message ?? "Your search has expired. Please search again.");
        }
        if (!res.ok) return null;
        const json = await res.json();
        return json?.data ?? json;
      } catch (e: any) {
        // Re-throw session expiry — don't swallow it
        if (e.message?.includes("expired") || e.message?.includes("search again")) throw e;
        return null;
      }
    })
  );

  const tiers: FareTier[] = [];
  let fareChanged = false;

responses.forEach((responseData, i) => {
    if (!responseData) {
      // API call failed — build a best-effort tier from cached flight data
      tiers.push({
        name: resolveFareName(
          variants[i].fareClass,
          variants[i].fareType,
          i,
          undefined,
          undefined,
        ),
        price: variants[i].price,
        cabinBag: variants[i].cabinBaggage,
        checkinBag: variants[i].checkinBaggage,
        cancellationFee: "As per airline",
        dateChangeFee: "As per airline",
        seatSelection: variants[i].isLCC ? "Chargeable" : "Free (Standard)",
        meals: variants[i].isLCC ? "Chargeable" : "Complimentary",
        recommended: i === 0,
        resultIndex: variants[i].resultIndex,
      });
      return;
    }

    const response = responseData?.Response;
    if (!response?.Results) return;
    const result = response.Results;
    const fare   = result.Fare;

    if (response.IsFareChanged) fareChanged = true;

    // ── Fare Name ────────────────────────────────────────────────────────────
    // Priority: SupplierFareClass > FareClassification.Type > FareClass code > FareType > fallback
    const supplierFareClass: string =
      result.Segments?.[0]?.[0]?.SupplierFareClass ?? "";

    const fareClassificationType: string =
      result.FareClassification?.Type ??
      result.Segments?.[0]?.[0]?.FareClassification?.Type ??
      "";

    const fareClassCode: string =
      result.Segments?.[0]?.[0]?.Airline?.FareClass ??
      variants[i].fareClass ??
      "";

    const fareTypeRaw: string =
      result.FareType ?? result.ResultFareType ?? variants[i].fareType ?? "Regular";

    const fareName = resolveFareName(
      fareClassCode,
      fareTypeRaw,
      i,
      supplierFareClass,
      fareClassificationType,
    );

    // ── Baggage ──────────────────────────────────────────────────────────────
    // Priority 1: Segments[0][0].Baggage / CabinBaggage (most reliable in FareQuote)
    const segCheckin = result.Segments?.[0]?.[0]?.Baggage ?? "";
    const segCabin   = result.Segments?.[0]?.[0]?.CabinBaggage ?? "";

    // Priority 2: FareBreakdown SegmentDetails
    const fbCheckin  =
      result.FareBreakdown?.[0]?.SegmentDetails?.[0]?.CheckedInBaggage?.FreeText ?? "";
    const fbCabin    =
      result.FareBreakdown?.[0]?.SegmentDetails?.[0]?.CabinBaggage?.FreeText ?? "";

    const checkinBagRaw =
      (segCheckin && segCheckin !== "0 KG" && segCheckin !== "0"
        ? segCheckin : null) ??
      (fbCheckin  && fbCheckin  !== "0 KG" && fbCheckin  !== "0"
        ? fbCheckin  : null) ??
      result.Baggage?.[0]?.Baggage ??
      variants[i].checkinBaggage ??
      "15 Kg";

    const cabinBagRaw =
      (segCabin && segCabin !== "0 KG" && segCabin !== "0"
        ? segCabin : null) ??
      (fbCabin  && fbCabin  !== "0 KG" && fbCabin  !== "0"
        ? fbCabin  : null) ??
      result.CabinBaggage?.[0]?.CabinBaggage ??
      variants[i].cabinBaggage ??
      "7 Kg";

    // ── Cancellation & Date Change ───────────────────────────────────────────
    // TBO FareQuote returns MiniFareRules[0] (array of rules), NOT CancellationPolicies.
    // MiniFareRules is array-of-arrays: [[rule1, rule2, ...]]
    const miniFareRules: Array<{
      Type: string; From: string; To: string; Unit: string; Details: string;
    }> =
      (result as any).MiniFareRules?.[0] ??   // normal: array-of-arrays
      (result as any).MiniFareRules ??          // flat fallback
      [];

    const cancelFee = miniFareRules.length > 0
      ? miniFareRuleLabel(miniFareRules, "Cancellation")
      : policyLabel(response.CancellationPolicies, 1);   // legacy fallback

    const changeFee = miniFareRules.length > 0
      ? miniFareRuleLabel(miniFareRules, "Reissue")
      : policyLabel(response.CancellationPolicies, 4);

    // ── Refundable ───────────────────────────────────────────────────────────
    const isRefundable =
      response.IsRefundable ?? result.IsRefundable ?? variants[i].isRefundable ?? false;

    // ── Seat & Meals ─────────────────────────────────────────────────────────
    const isLCC = result.IsLCC ?? variants[i].isLCC ?? false;
    const seatSelection = isLCC ? "Chargeable" : "Free (Standard)";
    const meals         = isLCC ? "Chargeable" : "Complimentary";
// ── FIX: Read per-pax fares directly from FareBreakdown ──────────────
// TBO FareBreakdown[i].BaseFare + Tax = TOTAL for all pax of that type
// Divide by PassengerCount to get per-pax fare

const fareBreakdown: any[] = result.FareBreakdown ?? [];

const adultBD  = fareBreakdown.find((b: any) => b.PassengerType === 1);
const childBD  = fareBreakdown.find((b: any) => b.PassengerType === 2);
const infantBD = fareBreakdown.find((b: any) => b.PassengerType === 3);

// Per single passenger fare (BaseFare + Tax) / PassengerCount
const adultFare = adultBD
  ? Math.round((adultBD.BaseFare + adultBD.Tax) / Math.max(adultBD.PassengerCount, 1))
  : (fare?.OfferedFare ?? variants[i].price);

const childFare = childBD
  ? Math.round((childBD.BaseFare + childBD.Tax) / Math.max(childBD.PassengerCount, 1))
  : undefined;

const infantFare = infantBD
  ? Math.round((infantBD.BaseFare + infantBD.Tax) / Math.max(infantBD.PassengerCount, 1))
  : undefined;

tiers.push({
  name:            fareName,
  price:           adultFare,                          // per adult, from API
  cabinBag:        cabinBagRaw,
  checkinBag:      checkinBagRaw,
  cancellationFee: cancelFee,
  dateChangeFee:   changeFee,
  seatSelection,
  meals,
  recommended:     i === 0,
  resultIndex:     result.ResultIndex ?? variants[i].resultIndex,
  isRefundable,
  taxesIncluded:   true,                               // TBO OfferedFare always includes all taxes
  adultFare,                                           // per adult total (base+tax)
  childFare,                                           // per child total (base+tax), undefined if no children
  infantFare,                                          // per infant total (base+tax), undefined if no infants
  totalOfferedFare: fare?.OfferedFare ?? variants[i].price, // grand total from TBO
});
});

  // ── Fallback: if all variant calls failed, show a single tier from flight data ──
  if (tiers.length === 0) {
    const cancelFee = policyLabel(flight.cancellationPolicies, 1);
    const changeFee = policyLabel(flight.cancellationPolicies, 4);
    
    tiers.push({
      name: resolveFareName(flight.fareClass, flight.fareType, 0),
      price: flight.price,
      cabinBag: flight.cabinBaggage,
      checkinBag: flight.checkinBaggage,
      cancellationFee: cancelFee,
      dateChangeFee: changeFee,
      seatSelection: flight.isLCC ? "Chargeable" : "Free (Standard)",
      meals: flight.isLCC ? "Chargeable" : "Complimentary",
      recommended: true,
      resultIndex: flight.resultIndex,
    });
  }

  return { tiers, fareChanged };
}

// ── SSR (Seats + Meals + Baggage) ───────────────────────────

export type ApiSeat = {
  code: string;
  isOccupied: boolean;
  isPremium: boolean;
  price: number;
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
  origin:string;
  destination:string;
  price: number;
  emoji: string;
};

export type SSRBaggage = {
  code: string;
  kg: number;
  label: string;
  description: string;
  price: number;
};

export type SSRResult = {
  seatMap: ApiSeatMap;
  meals: SSRMeal[];
  baggage: SSRBaggage[];
  availability?: {
    seatMap: boolean;
    meals: boolean;
    baggage: boolean;
    seatMapMessage?: string;
    mealsMessage?: string;
    baggageMessage?: string;
  };
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

function emptySeatMap(): ApiSeatMap {
  return { rows: [], cols: [], totalRows: 0 };
}

function airlineUnavailableMessage(kind: string, airlineName?: string): string {
  const airline = airlineName?.trim() || "this airline";
  return `${kind} is not available for this ${airline} flight.`;
}

function unavailableSSR(airlineName?: string): SSRResult {
  return {
    seatMap: emptySeatMap(),
    meals: [],
    baggage: [],
    availability: {
      seatMap: false,
      meals: false,
      baggage: false,
      seatMapMessage: airlineUnavailableMessage("Seat map", airlineName),
      mealsMessage: airlineUnavailableMessage("Meals", airlineName),
      baggageMessage: airlineUnavailableMessage("Extra baggage", airlineName),
    },
  };
}

function parseTBOSSR(raw: any, airlineName?: string): SSRResult {
  const response = raw?.Response;

  const allSegmentSeats: any[] = [];
  const seatDynArr: any[] = response?.SeatDynamic ?? [];
  for (const sd of seatDynArr) {
    const segSeats: any[] = sd?.SegmentSeat ?? [];
    for (const ss of segSeats) {
      if (ss?.RowSeats?.length > 0) {
        allSegmentSeats.push(ss);
        break; // Take the first non-empty segment per SeatDynamic entry
      }
    }
  }
  // SeatDynamic can be indexed differently per carrier — try segment 0, then segment 1
   const segSeat = allSegmentSeats[0] ?? null;
  const rowSeats: any[] = segSeat?.RowSeats ?? [];
  

  const validRows = rowSeats.filter((rowObj: any) => {
    const first = rowObj?.Seats?.[0];
    return first && String(first.RowNo).trim() !== "0" && first.Code !== "NoSeat";
  });

  let seatMap: ApiSeatMap;
  let hasSeatMap = false;
  if (validRows.length > 0) {
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
          code: s.Code,
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
    hasSeatMap = true;
  } else {
    seatMap = emptySeatMap();
  }
// MealDynamic is array-of-arrays: [segment][mealItem]
// Some carriers flatten it; handle both shapes
const mealOuter: any = response?.MealDynamic?.[0] ?? [];
const rawMeals: any[] = Array.isArray(mealOuter?.[0])
  ? mealOuter[0]           // double-nested: [[meal1, meal2]]
  : Array.isArray(mealOuter)
    ? mealOuter            // single array: [meal1, meal2]
    : [];
const realMeals = rawMeals.filter(
  (m: any) => m && m.Code && m.Code !== "NoMeal" && m.Code !== "NOML"
);

  const meals: SSRMeal[] =
    realMeals.length > 0
      ? [
          { code: "NoMeal", label: "No meal", description: "Skip meal selection", price: 0,origin:"",destination:"", emoji: "🚫" },
          ...realMeals.map((m: any) => {
            const meta = MEAL_META[m.Code];
            return {
              code: m.Code,
              label: meta?.label ?? m.AirlineDescription ?? m.Code,
              description: meta?.desc ?? m.AirlineDescription ?? "",
              origin: m.Origin,
              destination: m.Destination,
              price: Number(m.Price ?? 0),
              emoji: meta?.emoji ?? "🍽️",
            };
          }),
        ]
      : [];

  // Baggage is also array-of-arrays per segment
const bagOuter: any = response?.Baggage?.[0] ?? [];
const rawBaggage: any[] = Array.isArray(bagOuter?.[0])
  ? bagOuter[0]
  : Array.isArray(bagOuter)
    ? bagOuter
    : [];
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
          { code: "NoBaggage", kg: 0, label: "Included only", description: "Use fare allowance", price: 0 },
          ...[...bagByWeight.values()]
            .sort((a, b) => Number(a.Weight) - Number(b.Weight))
            .map((b: any) => ({
              code: String(b.Code ?? ""),
              kg: Number(b.Weight),
              label: `+ ${b.Weight} kg`,
              description: b.Text ?? `Extra ${b.Weight}kg check-in`,
              price: Number(b.Price),
            })),
        ]
      : [];

  return {
    seatMap,
    meals,
    baggage,
    availability: {
      seatMap: hasSeatMap,
      meals: meals.length > 0,
      baggage: baggage.length > 0,
      seatMapMessage: hasSeatMap ? undefined : airlineUnavailableMessage("Seat map", airlineName),
      mealsMessage: meals.length > 0 ? undefined : airlineUnavailableMessage("Meals", airlineName),
      baggageMessage: baggage.length > 0 ? undefined : airlineUnavailableMessage("Extra baggage", airlineName),
    },
  };
}

function parseTBOSSRForLeg(raw: any, legIndex: number): SSRResult {
  // Unwrap the Response envelope first
  const resp = raw?.Response ?? raw;

  const seatDynamic = resp?.SeatDynamic ?? [];
  const mealDynamic = resp?.MealDynamic ?? [];
  const baggage     = resp?.Baggage     ?? [];

  // Each array index corresponds to a leg (0 = leg1, 1 = leg2, etc.)
  const legSeatDynamic = seatDynamic[legIndex];
  const legMealDynamic = mealDynamic[legIndex];
  const legBaggage = baggage[legIndex];

  // If nothing for this leg — return truly empty (not FALLBACK mock data)
  if (!legSeatDynamic && !legMealDynamic && !legBaggage) {
    return unavailableSSR();
  }

  // Build a mini-SSR object shaped like what parseTBOSSR expects, then call it
  const miniRaw = {
    Response: {
      SeatDynamic: legSeatDynamic ? [legSeatDynamic] : [],
      MealDynamic: legMealDynamic ? [legMealDynamic] : [],
      Baggage:     legBaggage ? [legBaggage]  : [],
    }
  };
  return parseTBOSSR(miniRaw);
}


async function fetchSSRForFlight(
  flight: DisplayFlight,
): Promise<SSRResult> {
  const res = await fetch(`${API_BASE}/api/v1/flights/tbo/ssr`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      traceId:              flight.traceId,
      resultIndex:          flight.resultIndex,
    }),
  });
  if (!res.ok) {
    let errMsg = `SSR failed (HTTP ${res.status})`;
    try {
      const errJson = await res.json();
      errMsg = errJson?.message || errJson?.error || errMsg;
    } catch { /* ignore */ }
    throw new Error(errMsg);
  }
  const json = await res.json();
  if (json?.ok === false) {
    throw new Error(json?.message || "SSR failed");
  }
  return parseTBOSSR(json?.data ?? json, flight.airline);
}

export async function apiGetSSR(flight: DisplayFlight): Promise<SSRResult> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 700));
    return unavailableSSR(flight.airline);
  }
  return fetchSSRForFlight(flight);
}



export async function apiGetSSRForLegs(
  legs: DisplayFlight[],
  _isMultiCity = false   // kept for signature compat but no longer changes behaviour
): Promise<SSRResult[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 700));
    return legs.map((leg) => unavailableSSR(leg.airline));
  }

  // Always call per leg — TBO requires individual FareQuote+SSR per leg
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
  ContactNo?: string;
  Email?: string;
  IsLeadPax?: boolean;
  AddressLine1?: string;
  City?: string;
  CountryCode?: string;
  CountryName?: string;
  Nationality?: string;
  Fare?: {
    BaseFare: number;
    Tax: number;
    TransactionFee: number;
    YQTax: number;
    AdditionalTxnFeeOfrd: number;
    AdditionalTxnFeePub: number;
    AirTransFee: number;
  };
};

export type BookFlightInput = {
  traceId: string;
  resultIndex: string;
  isLCC?: boolean;
  isInternational?: boolean;
  passengers: BookPassenger[];
  contact: { Email: string; Mobile: string };
  gst?: {
    GSTNumber?: string;
    GSTCompanyName?: string;
    GSTCompanyEmail?: string;
    GSTCompanyAddress?: string;
  };
  segments?: Array<Array<{
    Origin: { Airport?: { CountryCode?: string } };
    Destination: { Airport?: { CountryCode?: string } };
    FlightNumber?: string;
  }>>;
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
      console.error("[apiBookFlight] Backend error response:", errJson);
      if (errJson?.message) errMsg = errJson.message;
      if (errJson?.error) errMsg = errJson.error;
    } catch { /* ignore */ }
    throw new Error(errMsg);
  }
const json = await res.json();
const responseData = json?.data ?? json;
// TBO wraps in double Response: { data: { Response: { Response: { PNR, BookingId, ... } } } }
const outerResponse = responseData?.Response;
const response = outerResponse?.Response ?? outerResponse; // handle both single and double-nested
const tboError = response?.Error ?? outerResponse?.Error;
if (tboError?.ErrorCode && tboError.ErrorCode !== 0) {
  throw new Error(tboError.ErrorMessage || "Booking failed");
}
const pnr = response?.FlightItinerary?.PNR || response?.PNR;
const bookingId = response?.FlightItinerary?.BookingId || response?.BookingId;
if (!pnr) {
  throw new Error("Booking succeeded but PNR is missing from response");
}
return {
  pnr,
  bookingId,
};
}



// ── Ticket ──────────────────────────────────────────────────

/**
 * apiBookTicket — Generate ticket for both LCC and Non-LCC.
 *
 * Non-LCC flow:  apiBookFlight → apiBookTicket({ isLCC: false, pnr, bookingId })
 * LCC flow:      skip apiBookFlight → apiBookTicket({ isLCC: true, resultIndex, passengers })
 *
 * Price change:
 *   If isPriceChanged=true in response, show user the new fare,
 *   then re-call with isPriceChangeAccepted: true to confirm.
 */
export async function apiBookTicket(
  input: BookTicketInput
): Promise<BookTicketResponse> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 1500));
    return {
      isPriceChanged: false,
      isTimeChanged: false,
      pnr: "MOCK" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      bookingId: Math.floor(Math.random() * 9_000_000 + 1_000_000),
      ticketStatus: 1,
    };
  }

  // ── Build request body based on LCC vs Non-LCC ──
  const body =
    input.isLCC
      ? {
          isLCC: true,
          TraceId:              input.traceId,
          ResultIndex:          input.resultIndex,
          Passengers:           input.passengers,
          IsPriceChangeAccepted: input.isPriceChangeAccepted ?? false,
        }
      : {
          isLCC: false,
          TraceId:              input.traceId,
          PNR:                  input.pnr,
          BookingId:            input.bookingId,
          ...(input.passport?.length ? { Passport: input.passport } : {}),
          IsPriceChangeAccepted: input.isPriceChangeAccepted ?? false,
        };

  const res = await fetch(`${API_BASE}/api/v1/flights/tbo/ticket`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let errMsg = `Ticketing failed (HTTP ${res.status})`;
    try {
      const errJson = await res.json();
      console.error("[apiBookTicket] Backend error response:", errJson);
      if (errJson?.message) errMsg = errJson.message;
      if (errJson?.error)   errMsg = errJson.error;
    } catch { /* ignore */ }
    throw new Error(errMsg);
  }

  const json = await res.json();
  const responseData = json?.data ?? json;
  const response = responseData?.Response ?? responseData;

  // ── TBO error check ──
// ── TBO error check ──
  const tboError = response?.Error;
  if (tboError?.ErrorCode && tboError.ErrorCode !== 0) {
    throw new Error(tboError.ErrorMessage || "Ticketing failed");
  }

  // ── Price changed — return as-is so caller can re-invoke ──
  if (response?.IsPriceChanged === true && !body.IsPriceChangeAccepted) {
    return {
      isPriceChanged: true,
      isTimeChanged:  response.IsTimeChanged ?? false,
      pnr:            response.PNR ?? "",
      bookingId:      response.BookingId ?? 0,
      ticketStatus:   8,   // PriceChanged
      flightItinerary: response.FlightItinerary,
    };
  }

  // ── TicketAlreadyCreated (6) — treat as success ──
  // Happens when TBO ErrorCode 2 was caught in the backend and
  // converted. The booking exists and is valid.
  if (response?.TicketStatus === 6) {
    return {
      isPriceChanged: false,
      isTimeChanged:  false,
      pnr:            response.PNR ?? "",
      bookingId:      response.BookingId ?? 0,
      ticketStatus:   6,
      message:        "Ticket already created — booking confirmed",
      flightItinerary: response.FlightItinerary,
    };
  }

  return {
    isPriceChanged:  response?.IsPriceChanged  ?? false,
    isTimeChanged:   response?.IsTimeChanged   ?? false,
    pnr:             response?.PNR             ?? "",
    bookingId:       response?.BookingId       ?? 0,
    ticketStatus:    response?.TicketStatus    ?? 0,
    message:         response?.Message,
    flightItinerary: response?.FlightItinerary,
  };
}







// ── Airports ────────────────────────────────────────────────

export async function apiGetAirports(): Promise<Airport[]> {
  const res = await fetch(`${API_BASE}/api/v1/flights/tbo/airports`);
  if (!res.ok) throw new Error("Failed to fetch airports");
  const json = await res.json();
  return (json?.data ?? json) as Airport[];
}


// NEW FUNCTION — call SSR once for multi-city, return per-leg results
export async function apiGetSSRForMultiCity(legs: DisplayFlight[]): Promise<SSRResult[]> {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 700));
    return legs.map((leg) => unavailableSSR(leg.airline));
  }    
  // Each leg has its own traceId from the new parallel-search backend
  return Promise.all(
    legs.map((legFlight) => fetchSSRForFlight(legFlight))
    // fetchSSRForFlight already calls /tbo/ssr with { traceId: flight.traceId, resultIndex: flight.resultIndex }
    // Since each leg's traceId is independent, this just works
  );
}






// ── ADD THIS at the bottom of flights_api.ts ──────────────────────────────────


export async function apiDownloadTicketPdf(
  ticketResponse: Record<string, unknown>
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/flights/tbo/ticket/pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ticketResponse),
  });

  if (!res.ok) {
    let msg = `PDF download failed (HTTP ${res.status})`;
    try { const j = await res.json(); msg = j?.message ?? msg; } catch { /**/ }
    throw new Error(msg);
  }

  const blob     = await res.blob();
  const url      = URL.createObjectURL(blob);
  const pnr      = (ticketResponse.PNR ?? (ticketResponse.FlightItinerary as any)?.PNR ?? "ticket") as string;
  const a        = document.createElement("a");
  a.href         = url;
  a.download     = `ticket-${pnr}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}