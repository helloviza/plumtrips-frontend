// ============================================================
//  PLUMTRIPS — Flight API (backend-proxy only)
//  All TBO credentials and auth live on the server.
//  Frontend never talks to TBO directly.
// ============================================================

import type {
  DisplayFlight, FareTier, Airport, SearchForm, TBOFlightResult, TBOMiniFareRule
} from "./types_t";

import type {
  TicketPassportDetail, TicketBaggage, TicketMealDynamic, TicketPassengerFare,
  TicketLCCPassenger, TicketNonLCCInput, TicketLCCInput, BookTicketResponse, BookTicketInput
} from "./types_t";

// ─── CONFIG ────────────────────────────────────────────────

export const MOCK_MODE = import.meta.env.VITE_MOCK_MODE === "true";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

// ─── HELPERS: TBO → DisplayFlight ─────────────────────────

function fmtTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function fmtDateLocal(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function minToLabel(m: number): string {
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

// ─── TBO FARE CLASS → HUMAN-READABLE NAME ─────────────────

const TBO_FARE_CLASS_MAP: Record<string, string> = {
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
  J:  "Business",
  C:  "Business Flex",
  D:  "Business Saver",
  I:  "Business",
  F:  "First Class",
  A:  "First Class",
  P:  "First Class Flex",
  R:  "First Saver",
  "6E_SAVER":    "IndiGo Saver",
  "6E_FLEXI":    "IndiGo Flexi",
  "6E_SUPERMAX": "IndiGo SuperMax",
  AI_SAVER:  "AI Saver",
  AI_FLEXI:  "AI Flexi",
  AI_VALUE:  "AI Value",
};

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

function resolveFareName(
  fareClass: string | undefined,
  fareType: string | undefined,
  index: number,
  supplierFareClass?: string,
  fareClassificationType?: string,
): string {
  if (supplierFareClass && supplierFareClass.trim() !== "") {
    return supplierFareClass.trim();
  }
  if (
    fareClassificationType &&
    fareClassificationType.trim() !== "" &&
    fareClassificationType.toLowerCase() !== "regular"
  ) {
    return fareClassificationType.trim();
  }
  if (
    fareType &&
    fareType !== "Regular" &&
    fareType !== "RegularFare" &&
    fareType !== "Default" &&
    fareType !== ""
  ) {
    return TBO_FARE_TYPE_MAP[fareType] ?? fareType;
  }
  if (fareClass && fareClass !== "") {
    const mapped = TBO_FARE_CLASS_MAP[fareClass.toUpperCase()];
    if (mapped) return mapped;
    return `Class ${fareClass.toUpperCase()}`;
  }
  const fallbacks = ["Economy", "Economy Flexi", "Economy Premium", "Business", "First Class"];
  return fallbacks[index] ?? `Option ${index + 1}`;
}

// ─── EXTRACT MINI FARE RULE FEES ──────────────────────────

function extractMiniFareRuleFees(raw: TBOFlightResult): { cancellationFee: string; dateChangeFee: string } {
  const rules: TBOMiniFareRule[] = raw.MiniFareRules?.[0] ?? [];

  const cancelRule =
    rules.find(r => r.Type === "Cancellation" && r.From !== "0") ??
    rules.find(r => r.Type === "Cancellation");

  const reissueRule =
    rules.find(r => r.Type === "Reissue" && r.From !== "0") ??
    rules.find(r => r.Type === "Reissue");

  const fmt = (r: TBOMiniFareRule | undefined): string => {
    if (!r) return "Non-refundable";
    if (r.Details === "100%") return "100% penalty";
    return r.Details ?? "Non-refundable";
  };

  return {
    cancellationFee: fmt(cancelRule),
    dateChangeFee:   fmt(reissueRule),
  };
}

// ─── VARIANT → FARE TIER ──────────────────────────────────

function variantToFareTier(
  v: DisplayFlight,
  raw: TBOFlightResult,
  isRecommended: boolean,
): FareTier {
  const { cancellationFee, dateChangeFee } = extractMiniFareRuleFees(raw);

  // Fare name — prefer SupplierFareClass from first segment, then FareClassification.Type
  const supplierFareClass: string = raw.Segments?.[0]?.[0]?.SupplierFareClass ?? "";
  const fareClassificationType: string = raw.FareClassification?.Type ?? "";
  const fareClassCode: string = raw.Segments?.[0]?.[0]?.Airline?.FareClass ?? v.fareClass ?? "";
  const fareTypeRaw: string = raw.FareType ?? raw.ResultFareType ?? v.fareType ?? "Regular";

  const name = resolveFareName(
    fareClassCode,
    fareTypeRaw,
    0,
    supplierFareClass,
    fareClassificationType,
  );

  // Baggage — FareBreakdown SegmentDetails[0] is most reliable
  const seg0 = raw.FareBreakdown?.[0]?.SegmentDetails?.[0];
  const checkinBag =
    (seg0?.CheckedInBaggage?.FreeText || null) ??
    (raw.Segments?.[0]?.[0]?.Baggage || null) ??
    v.checkinBaggage ??
    "15 KG";
  const cabinBag =
    (seg0?.CabinBaggage?.FreeText || null) ??
    (raw.Segments?.[0]?.[0]?.CabinBaggage || null) ??
    v.cabinBaggage ??
    "7 KG";

  // Inclusions from FareInclusions array
  const inclusions: string[] = (raw as any).FareInclusions ?? [];
  const mealIncluded = inclusions.some(s => /meal.*included/i.test(s));
  const seatIncluded = inclusions.some(s => /seat.*included/i.test(s));

  // Per-adult fare from FareBreakdown
  const fareBreakdown: any[] = raw.FareBreakdown ?? [];
  const adultBD  = fareBreakdown.find((b: any) => b.PassengerType === 1);
  const childBD  = fareBreakdown.find((b: any) => b.PassengerType === 2);
  const infantBD = fareBreakdown.find((b: any) => b.PassengerType === 3);

  const adultFare = adultBD
    ? Math.round((adultBD.BaseFare + adultBD.Tax) / Math.max(adultBD.PassengerCount ?? 1, 1))
    : Math.round(raw.Fare.OfferedFare);
  const childFare = childBD
    ? Math.round((childBD.BaseFare + childBD.Tax) / Math.max(childBD.PassengerCount ?? 1, 1))
    : undefined;
  const infantFare = infantBD
    ? Math.round((infantBD.BaseFare + infantBD.Tax) / Math.max(infantBD.PassengerCount ?? 1, 1))
    : undefined;

  const adultBase= adultBD?.BaseFare ?? 0;
  const childBase= childBD?.BaseFare ?? 0;
  const infantBase= infantBD?.BaseFare ?? 0;
  const adultTax= adultBD?.Tax ?? 0;
  const childTax= childBD?.Tax ?? 0;
  const infantTax= infantBD?.Tax ?? 0;
  return {
    name,
    resultIndex:      v.resultIndex,
    price:            adultFare,
    checkinBag,
    cabinBag,
    cancellationFee,
    dateChangeFee,
    seatSelection:    seatIncluded ? "Free" : "Paid",
    meals:            mealIncluded ? "Included" : "Paid",
    isRefundable:     raw.IsRefundable,
    recommended:      isRecommended,
    taxesIncluded:    true,
    adultFare,
    childFare,
    infantFare,
    adultBase,
    childBase,
    infantBase,
    adultTax,
    childTax,
    infantTax,
    totalOfferedFare: raw.Fare.OfferedFare,
    seatCharges:      raw.Fare.TotalSeatCharges,
    mealCharges:      raw.Fare.TotalMealCharges,
    baggageCharges:   raw.Fare.TotalBaggageCharges,
  };
}

// ─── TBO RESULT → DISPLAY FLIGHT ──────────────────────────

export function tboResultToDisplay(
  result: TBOFlightResult,
  traceId: string,
  legIndex = 0,
): DisplayFlight {
  const allSegs = result.Segments[legIndex] ?? result.Segments[0];
  const seg     = allSegs[0];
  const lastSeg = allSegs[allSegs.length - 1];
  const totalDuration = allSegs.reduce((acc, s) => acc + s.Duration, 0);
  const stops   = allSegs.length - 1;

  const depISO  = seg.Origin.DepTime;
  const arrISO  = lastSeg.Destination.ArrTime;

  const baggage  = result.Baggage?.[0];
  const cabinBag = result.CabinBaggage?.[0];

  const segments: import("./types_t").FlightSegmentDetail[] = allSegs.map((s) => ({
    airlineCode:     s.Airline.AirlineCode,
    airlineName:     s.Airline.AirlineName,
    flightNumber:    `${s.Airline.AirlineCode}-${s.Airline.FlightNumber}`,
    operatingCarrier: s.Airline.OperatingCarrier !== s.Airline.AirlineCode ? s.Airline.OperatingCarrier : undefined,
    fareClass:       s.Airline.FareClass || undefined,
    fromCode:        s.Origin.Airport.AirportCode,
    fromCity:        s.Origin.Airport.CityName,
    fromAirport:     s.Origin.Airport.AirportName,
    fromTerminal:    s.Origin.Airport.Terminal || undefined,
    toCode:          s.Destination.Airport.AirportCode,
    toCity:          s.Destination.Airport.CityName,
    toAirport:       s.Destination.Airport.AirportName,
    toTerminal:      s.Destination.Airport.Terminal || undefined,
    departISO:       s.Origin.DepTime,
    arriveISO:       s.Destination.ArrTime,
    departTime:      fmtTime(s.Origin.DepTime),
    arriveTime:      fmtTime(s.Destination.ArrTime),
    departDate:      fmtDate(s.Origin.DepTime),
    arriveDate:      fmtDate(s.Destination.ArrTime),
    duration:        s.Duration,
    durationLabel:   minToLabel(s.Duration),
    craft:           s.Craft || undefined,
    groundTime:      s.GroundTime || undefined,
    mile:            s.Mile || undefined,
  }));

  return {
    resultIndex:       result.ResultIndex,
    traceId,
    source:            result.Source,
    airline:           seg.Airline.AirlineName,
    airlineCode:       seg.Airline.AirlineCode,
    flightNumber:      `${seg.Airline.AirlineCode}-${seg.Airline.FlightNumber}`,
    operatingCarrier:  seg.Airline.OperatingCarrier !== seg.Airline.AirlineCode ? seg.Airline.OperatingCarrier : undefined,
    fromCode:          seg.Origin.Airport.AirportCode,
    fromCity:          seg.Origin.Airport.CityName,
    fromAirport:       seg.Origin.Airport.AirportName,
    toCode:            lastSeg.Destination.Airport.AirportCode,
    toCity:            lastSeg.Destination.Airport.CityName,
    toAirport:         lastSeg.Destination.Airport.AirportName,
    departTime:        fmtTime(depISO),
    arriveTime:        fmtTime(arrISO),
    departDate:        fmtDate(depISO),
    arriveDate:        fmtDate(arrISO),
    departISO:         depISO,
    arriveISO:         arrISO,
    duration:          totalDuration,
    durationLabel:     minToLabel(totalDuration),
    stops,
    stopInfo:          stops > 0 ? allSegs.slice(0, -1).map(s => s.Destination.Airport.CityCode).join(", ") : undefined,
    price:             result.Fare.OfferedFare,
    baseFare:          result.Fare.BaseFare,
    tax:               result.Fare.Tax,
    cabinBaggage:      cabinBag?.CabinBaggage ?? "7 Kg",
    checkinBaggage:    baggage?.Baggage ?? "15 Kg",
    isRefundable:      result.IsRefundable,
    isLCC:             result.IsLCC,
    fareType:          result.FareType,
    fareClass:         seg.Airline.FareClass || undefined,
    terminal:          seg.Origin.Airport.Terminal || undefined,
    arrivalTerminal:   lastSeg.Destination.Airport.Terminal || undefined,
    craft:             seg.Craft || undefined,
    seatsLeft:         seg.NoOfSeatAvailable,
    lastTicketingDate: result.LastTicketingDate || undefined,
    isPanRequired:     result.IsPanRequiredAtBook,
    isPassportRequired: result.IsPassportRequiredAtBook,
    airlineRemark:     result.AirlineRemark || undefined,
    segments,
  };
}

function tboResultToMultiCityItinerary(
  result: TBOFlightResult,
  traceId: string,
): DisplayFlight {
  const itineraryLegs = result.Segments.map((_, legIndex) =>
    tboResultToDisplay(result, traceId, legIndex)
  );
  const firstLeg = itineraryLegs[0];
  const lastLeg  = itineraryLegs[itineraryLegs.length - 1] ?? firstLeg;
  const totalDuration = itineraryLegs.reduce((sum, leg) => sum + leg.duration, 0);

  return {
    ...firstLeg,
    toCode:          lastLeg.toCode,
    toCity:          lastLeg.toCity,
    toAirport:       lastLeg.toAirport,
    arriveTime:      lastLeg.arriveTime,
    arriveDate:      lastLeg.arriveDate,
    arriveISO:       lastLeg.arriveISO,
    arrivalTerminal: lastLeg.arrivalTerminal,
    duration:        totalDuration,
    durationLabel:   minToLabel(totalDuration),
    stops:           itineraryLegs.reduce((sum, leg) => sum + leg.stops, 0),
    stopInfo:        itineraryLegs.map((leg) => `${leg.fromCode}-${leg.toCode}`).join(" | "),
    segments:        itineraryLegs.flatMap((leg) => leg.segments),
    itineraryLegs,
  };
}

// ─── GROUP BY FLIGHT + BUILD fareTiers ────────────────────
//
// Accepts the raw TBOFlightResult[] alongside the mapped DisplayFlight[].
// Groups variants of the same physical flight, sorts cheapest first,
// and builds fareTiers[] from the raws so the FareModal needs no API call.

function groupByFlight(
  flights: DisplayFlight[],
  raws: TBOFlightResult[] = [],
): DisplayFlight[] {
  const map    = new Map<string, DisplayFlight[]>();
  const rawMap = new Map<string, TBOFlightResult>();

  // Index raws by ResultIndex for O(1) lookup
  for (const raw of raws) {
    rawMap.set(raw.ResultIndex, raw);
  }

  for (const f of flights) {
    const key   = `${f.airlineCode}-${f.flightNumber}-${f.departISO}-${f.arriveISO}`;
    const group = map.get(key);
    if (group) group.push(f);
    else map.set(key, [f]);
  }

  const result: DisplayFlight[] = [];

  for (const variants of map.values()) {
    // Cheapest first
    variants.sort((a, b) => a.price - b.price);

    // Build fareTiers only when raws are available
    let fareTiers: FareTier[] | undefined;
    if (raws.length > 0) {
      const variantRaws = variants
        .map(v => rawMap.get(v.resultIndex))
        .filter((r): r is TBOFlightResult => !!r);

      if (variantRaws.length > 0) {
        fareTiers = variantRaws.map((raw, idx) => {
          const variant = variants.find(v => v.resultIndex === raw.ResultIndex) ?? variants[0];
          return variantToFareTier(variant, raw, idx === 0 /* cheapest = recommended */);
        });
      }
    }

    result.push({
      ...variants[0],
      fareVariants: variants,
      ...(fareTiers ? { fareTiers } : {}),
    });
  }

  return result;
}

// ─── UTILS ────────────────────────────────────────────────

export function cabinClassCode(c: SearchForm["cabinClass"]): number {
  return { Economy: 2, "Premium Economy": 3, Business: 4, First: 5 }[c];
}

export function formatINR(n: number): string {
  return `₹${Math.ceil(n).toLocaleString("en-IN")}`;
}

function normalizeTboResults(rawResults: unknown): TBOFlightResult[] {
  if (!Array.isArray(rawResults)) return [];
  return Array.isArray(rawResults[0])
    ? (rawResults as TBOFlightResult[][]).flat()
    : rawResults as TBOFlightResult[];
}

// ─── MOCK AIRPORTS ─────────────────────────────────────────

export function getMockFlights(from: string, to: string, date: string): DisplayFlight[] {
  const airportLookup: Record<string, { city: string; name: string }> = {
    DEL: { city: "New Delhi",   name: "Indira Gandhi International" },
    BOM: { city: "Mumbai",      name: "Chhatrapati Shivaji Maharaj International" },
    BLR: { city: "Bengaluru",   name: "Kempegowda International" },
    HYD: { city: "Hyderabad",   name: "Rajiv Gandhi International" },
    MAA: { city: "Chennai",     name: "Chennai International" },
    CCU: { city: "Kolkata",     name: "Netaji Subhas Chandra Bose International" },
    GOI: { city: "Goa",         name: "Goa International" },
    AMD: { city: "Ahmedabad",   name: "Sardar Vallabhbhai Patel International" },
    BKK: { city: "Bangkok",     name: "Suvarnabhumi International" },
    DXB: { city: "Dubai",       name: "Dubai International" },
    SIN: { city: "Singapore",   name: "Changi International" },
    LHR: { city: "London",      name: "Heathrow" },
    JFK: { city: "New York",    name: "John F. Kennedy International" },
  };
  const fromInfo = airportLookup[from] ?? { city: from, name: from };
  const toInfo   = airportLookup[to]   ?? { city: to,   name: to   };

  const airlines = [
    { name: "IndiGo",           code: "6E", fn: "6E-2045", lcc: true  },
    { name: "Air India",        code: "AI", fn: "AI-101",  lcc: false },
    { name: "SpiceJet",         code: "SG", fn: "SG-162",  lcc: true  },
    { name: "Vistara",          code: "UK", fn: "UK-822",  lcc: false },
    { name: "Akasa Air",        code: "QP", fn: "QP-1820", lcc: true  },
    { name: "Air India Express",code: "IX", fn: "IX-763",  lcc: true  },
  ];
  const prices     = [6820, 7890, 7308, 9450, 6978, 6499];
  const deps       = ["05:30", "08:15", "10:00", "13:45", "17:20", "21:00"];
  const durations  = [135, 145, 150, 140, 155, 130];
  const terminals  = ["T1", "T3", "T1", "T3", "T2", "T1"];
  const arrTerminals = ["T2", "T2", "T1", "T2", "T1", "T2"];
  const crafts     = ["A320neo", "B787-8", "B737", "A320", "B737-MAX", "A320neo"];
  const seats      = [7, 22, 3, 15, 9, 28];
  const fareClasses = ["V", "S", "Q", "Y", "K", "L"];

  const safeDate = date || new Date().toISOString().split("T")[0];
  const dispDate = fmtDateLocal(safeDate);

  return airlines.map((a, i) => {
    const [hh, mm] = deps[i].split(":").map(Number);
    const dur    = durations[i];
    const arrMin = hh * 60 + mm + dur;
    const arrH   = String(Math.floor(arrMin / 60) % 24).padStart(2, "0");
    const arrM   = String(arrMin % 60).padStart(2, "0");
    const crosses    = Math.floor(arrMin / (24 * 60));
    const arriveTime = `${arrH}:${arrM}`;
    const arrDate    = crosses > 0 ? `+${crosses}d` : dispDate;
    const baseFare   = Math.round(prices[i] * 0.7);
    const tax        = prices[i] - baseFare;

    const segment: import("./types_t").FlightSegmentDetail = {
      airlineCode:  a.code,
      airlineName:  a.name,
      flightNumber: a.fn,
      fareClass:    fareClasses[i],
      fromCode:     from,
      fromCity:     fromInfo.city,
      fromAirport:  fromInfo.name,
      fromTerminal: terminals[i],
      toCode:       to,
      toCity:       toInfo.city,
      toAirport:    toInfo.name,
      toTerminal:   arrTerminals[i],
      departISO:    `${safeDate}T${deps[i]}:00`,
      arriveISO:    `${safeDate}T${arriveTime}:00`,
      departTime:   deps[i],
      arriveTime,
      departDate:   dispDate,
      arriveDate:   arrDate,
      duration:     dur,
      durationLabel: `${Math.floor(dur / 60)}h ${dur % 60}m`,
      craft:        crafts[i],
    };

    return {
      resultIndex:    `MOCK_R${i}`,
      traceId:        "MOCK_TRACE_001",
      source:         1,
      airline:        a.name,
      airlineCode:    a.code,
      flightNumber:   a.fn,
      fromCode:       from,
      fromCity:       fromInfo.city,
      fromAirport:    fromInfo.name,
      toCode:         to,
      toCity:         toInfo.city,
      toAirport:      toInfo.name,
      departTime:     deps[i],
      arriveTime,
      departDate:     dispDate,
      arriveDate:     arrDate,
      departISO:      `${safeDate}T${deps[i]}:00`,
      arriveISO:      `${safeDate}T${arriveTime}:00`,
      duration:       dur,
      durationLabel:  `${Math.floor(dur / 60)}h ${dur % 60}m`,
      stops:          i === 0 ? 1 : 0,
      stopInfo:       i === 0 ? "via LKO" : undefined,
      price:          prices[i],
      baseFare,
      tax,
      cabinBaggage:   "7 Kg",
      checkinBaggage: i >= 3 ? "20 Kg" : "15 Kg",
      isRefundable:   i >= 2,
      isLCC:          a.lcc,
      fareType:       i === 3 ? "SME" : "Regular",
      fareClass:      fareClasses[i],
      terminal:       terminals[i],
      arrivalTerminal: arrTerminals[i],
      craft:          crafts[i],
      seatsLeft:      seats[i],
      isPanRequired:  i < 3,
      isPassportRequired: false,
      segments:       [segment],
    };
  });
}

export function getMockReturnFlights(from: string, to: string, date: string): DisplayFlight[] {
  return getMockFlights(to, from, date).map((f, i) => ({
    ...f,
    resultIndex: `MOCK_RET${i}`,
    traceId:     "MOCK_TRACE_001",
  }));
}

// ─── MOCK FARE TIERS ───────────────────────────────────────

export function getMockFareTiers(flight: DisplayFlight): FareTier[] {
  return [
    {
      name:            "Saver",
      price:           flight.price,
      totalOfferedFare: flight.price,
      cabinBag:        flight.cabinBaggage,
      checkinBag:      flight.checkinBaggage,
      cancellationFee: "₹4,999 (3h – 3 days before)",
      dateChangeFee:   "₹2,999 (3h – 365 days)",
      seatSelection:   "Chargeable",
      meals:           "Chargeable",
      resultIndex:     flight.resultIndex,
    },
    {
      name:            "Flexi",
      tag:             "Best Value",
      price:           flight.price + 544,
      totalOfferedFare: flight.price + 544,
      cabinBag:        flight.cabinBaggage,
      checkinBag:      flight.checkinBaggage,
      cancellationFee: "₹3,499 (3h – 24h)",
      dateChangeFee:   "₹999 (3h – 3 days)",
      seatSelection:   "Free (Standard)",
      meals:           "Chargeable",
      recommended:     true,
      resultIndex:     flight.resultIndex + "_FLEXI",
    },
    {
      name:            "Premium",
      price:           flight.price + 3150,
      totalOfferedFare: flight.price + 3150,
      cabinBag:        flight.cabinBaggage,
      checkinBag:      "20 Kg",
      cancellationFee: "₹799 (3 days+)",
      dateChangeFee:   "Free Date Change",
      seatSelection:   "Free (XL Seats)",
      meals:           "Complimentary",
      resultIndex:     flight.resultIndex + "_PREM",
    },
  ];
}

// ─── MOCK POPULAR ROUTES ───────────────────────────────────

export const POPULAR_ROUTES = [
  { from: "DEL", to: "BOM", fromCity: "Delhi",     toCity: "Mumbai",    price: 3499,  img: "mumbai"    },
  { from: "DEL", to: "BLR", fromCity: "Delhi",     toCity: "Bengaluru", price: 4199,  img: "bangalore" },
  { from: "BOM", to: "GOI", fromCity: "Mumbai",    toCity: "Goa",       price: 2899,  img: "goa"       },
  { from: "DEL", to: "DXB", fromCity: "Delhi",     toCity: "Dubai",     price: 12499, img: "dubai"     },
  { from: "BOM", to: "SIN", fromCity: "Mumbai",    toCity: "Singapore", price: 18999, img: "singapore" },
  { from: "DEL", to: "BKK", fromCity: "Delhi",     toCity: "Bangkok",   price: 14299, img: "bangkok"   },
];

export const PROMO_OFFERS = [
  {
    code:     "FIRST500",
    title:    "First Booking Discount",
    desc:     "Save ₹500 on your first flight booking with PlumTrips",
    badge:    "New User",
    discount: "₹500 off",
  },
  {
    code:     "HDFC10",
    title:    "HDFC Bank Offer",
    desc:     "10% instant discount on HDFC credit cards, max ₹2,000",
    badge:    "Bank Offer",
    discount: "10% off",
  },
  {
    code:     "EARLYBIRD",
    title:    "Early Bird Fares",
    desc:     "Book 30 days in advance and save up to 25%",
    badge:    "Limited Time",
    discount: "Up to 25%",
  },
];

// ─── CALENDAR PRICES ───────────────────────────────────────

export async function apiGetCalendarPrices(
  fromCode: string,
  toCode: string,
  cabinClass: SearchForm["cabinClass"] = "Economy",
): Promise<Record<string, number>> {
  if (MOCK_MODE) return {};

  try {
    const params = new URLSearchParams({
      from:       fromCode,
      to:         toCode,
      cabinClass: String(cabinClassCode(cabinClass)),
      daysAhead:  "62",
    });
    const res = await fetch(`${API_BASE}/api/v1/flights/calendar-prices?${params.toString()}`);
    if (!res.ok) {
      console.warn(`[apiGetCalendarPrices] HTTP ${res.status}; leaving calendar prices blank`);
      return {};
    }
    const json = await res.json();
    const data: Record<string, number> = json?.data ?? json;
    if (!data || typeof data !== "object" || Array.isArray(data)) return {};
    return Object.fromEntries(
      Object.entries(data).filter(([, price]) => typeof price === "number" && price > 0)
    );
  } catch (err) {
    console.warn("[apiGetCalendarPrices] Network error", err);
    return {};
  }
}

// ─── SEARCH ────────────────────────────────────────────────

export type FlightSearchResult = {
  outbound: DisplayFlight[];
  returnFlights?: DisplayFlight[];
  multiLegFlights?: DisplayFlight[][];
  noResultReason?: string;
};

export async function apiSearchFlights(
  form: SearchForm,
  multiLegs?: { from: Airport; to: Airport; departDate: string }[],
): Promise<FlightSearchResult> {

  // ── MOCK ──────────────────────────────────────────────────
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 900));
    if (form.tripType === "roundTrip" && form.returnDate) {
      return {
        outbound:      getMockFlights(form.from.code, form.to.code, form.departDate),
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

  // ── BUILD REQUEST BODY ─────────────────────────────────────
  const body: Record<string, unknown> = {
    origin:      form.from.code,
    destination: form.to.code,
    departDate:  form.departDate,
    cabinClass:  cabinClassCode(form.cabinClass),
    adults:      form.adults,
    children:    form.children,
    infants:     form.infants,
    nonStopOnly: form.nonStopOnly,
    fareType:    form.fareType,
    tripType:    form.tripType,
  };
  if (form.tripType === "roundTrip" && form.returnDate) {
    body.returnDate = form.returnDate;
  }
  if (form.tripType === "multiCity" && multiLegs && multiLegs.length >= 2) {
    body.segments = multiLegs.map((leg) => ({
      origin:      leg.from.code,
      destination: leg.to.code,
      departDate:  leg.departDate,
    }));
  }

  const res = await fetch(`${API_BASE}/api/v1/flights/tbo/search`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
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

  // ── MULTI-CITY ─────────────────────────────────────────────
  if (form.tripType === "multiCity") {
    const responseData = json?.ok === false
      ? (() => { throw new Error(json.message ?? "Search failed"); })()
      : json?.data ?? json;

    const legs: Array<{
      legIndex:    number;
      origin:      string;
      destination: string;
      departDate:  string;
      traceId:     string;
      results:     TBOFlightResult[];
    }> = responseData?.legs ?? [];

    if (!legs.length) {
      return { outbound: [], noResultReason: "No flights found for one or more legs" };
    }

    const multiLegFlights: DisplayFlight[][] = legs.map((leg) => {
      const legRaws = normalizeTboResults(leg.results);
      return groupByFlight(
        legRaws.map((r) => tboResultToDisplay(r, leg.traceId)),
        legRaws,
      );
    });

    return { outbound: multiLegFlights[0] ?? [], multiLegFlights };
  }

  // ── ONE-WAY / ROUND-TRIP ───────────────────────────────────
  const responseData = json?.ok === false
    ? (() => { throw new Error(json.message ?? "Search failed"); })()
    : json?.data ?? json;

  const traceId: string   = responseData?.Response?.TraceId ?? "";
  const rawResults         = responseData?.Response?.Results ?? [];

  const results: TBOFlightResult[][] = Array.isArray(rawResults[0])
    ? rawResults
    : rawResults.length > 0 ? [rawResults] : [];

  if (!results.length) {
    const noResultReason: string | undefined = responseData?.Response?.NoResultReason;
    return { outbound: [], noResultReason };
  }

  // Keep raws for fareTiers building
  const outboundRaws = results[0] ?? [];
  const outbound     = outboundRaws.map((r) => tboResultToDisplay(r, traceId));

  if (form.tripType === "roundTrip") {
    if (results[1] && results[1].length > 0) {
      // Domestic-style: TBO already gave us two separate result arrays
      const returnRaws = results[1];
      const returnMapped = returnRaws.map((r) => tboResultToDisplay(r, traceId));
      return {
        outbound:      groupByFlight(outbound, outboundRaws),
        returnFlights: groupByFlight(returnMapped, returnRaws),
      };
    }

    // ── International / combined-itinerary style ────────────
    // A single result can carry BOTH legs: Segments[0] = outbound,
    // Segments[1] = return. The whole pair shares one ResultIndex
    // (it's one bookable fare), so we must NOT invent separate
    // ResultIndex values — both display objects below keep the
    // same resultIndex/raw so booking still uses the combined fare.
    const isCombinedItinerary = outboundRaws.some(r => (r.Segments?.length ?? 0) > 1);

    if (isCombinedItinerary) {
      // [COMBINED-DIRECTION-FIX] `.some()` above only checks that AT LEAST
      // ONE raw is a true 2-leg combined fare — but outboundRaws can be a
      // MIX of true combined fares (Segments.length === 2) and one-way-only
      // results that happened to land in the same array (Segments.length
      // === 1). tboResultToDisplay(r, traceId, 1) falls back to
      // result.Segments[0] whenever Segments[1] doesn't exist (see its `??`
      // fallback), so mapping EVERY raw through legIndex=1 silently cloned
      // the outbound leg into the "return" slot for any raw that wasn't
      // actually a combined fare — showing BOM→DXB as the "return" for a
      // BOM→DXB outbound instead of DXB→BOM.
      // Fix: only raws that genuinely carry both segment-groups are used to
      // build the outbound/return pair. Raws with just one segment-group
      // aren't valid combined round-trip fares and are dropped here (they
      // fall through to the origin-code-split fallback below when none of
      // the raws qualify, same as before this branch existed).
      const trueCombinedRaws = outboundRaws.filter(r => (r.Segments?.length ?? 0) > 1);

      if (trueCombinedRaws.length > 0) {
        const outboundLegDisplays = trueCombinedRaws.map(r => ({
          ...tboResultToDisplay(r, traceId, 0),
          isCombinedRoundTrip: true,
        }));
        const returnLegDisplays = trueCombinedRaws.map(r => ({
          ...tboResultToDisplay(r, traceId, 1),
          isCombinedRoundTrip: true,
        }));

        return {
          outbound:      groupByFlight(outboundLegDisplays, trueCombinedRaws),
          returnFlights: groupByFlight(returnLegDisplays, trueCombinedRaws),
        };
      }
    }

    // Fallback: split a single results[0] into outbound + return by origin code
    // (covers suppliers that return separate single-leg results in one array)
    const returnCode = form.to.code.toUpperCase();
    const returnRaws = outboundRaws.filter(
      r => r.Segments?.[0]?.[0]?.Origin?.Airport?.AirportCode === returnCode
    );
    const returnFlights = returnRaws.map(r => tboResultToDisplay(r, traceId));
    const filteredOutbound = outbound.filter(f => f.fromCode !== returnCode);
    const filteredOutboundRaws = outboundRaws.filter(
      r => r.Segments?.[0]?.[0]?.Origin?.Airport?.AirportCode !== returnCode
    );
    if (returnFlights.length > 0) {
      return {
        outbound:      groupByFlight(filteredOutbound, filteredOutboundRaws),
        returnFlights: groupByFlight(returnFlights, returnRaws),
      };
    }
    return { outbound: groupByFlight(outbound, outboundRaws) };
  }

  // One-way
  return { outbound: groupByFlight(outbound, outboundRaws) };
}

// ─── FARE QUOTE ────────────────────────────────────────────

function policyLabel(
  policies: import("./types_t").TBOCancellationPolicy[] | undefined,
  type: 1 | 4,
): string {
  if (!policies || !Array.isArray(policies) || policies.length === 0) return "As per airline";
  const matches = policies.filter((p) => p && p.PolicyType === type);
  if (!matches.length) return "As per airline";
  matches.sort((a, b) => (a.FromHours ?? 0) - (b.FromHours ?? 0));
  const lines = matches.slice(0, 2).map((p) => {
    const fromHours = p.FromHours ?? 0;
    const toHours   = p.ToHours   ?? 0;
    const amount    = p.Amount    ?? 0;
    const percentage = p.Percentage ?? 0;
    let window: string;
    if (fromHours === 0 && toHours === 0) window = "Anytime";
    else if (toHours > 0) window = `${fromHours}h–${toHours}h before`;
    else window = `${fromHours}h+ before`;
    if (amount === 0 && percentage === 0) return `Free (${window})`;
    if (amount === 0 && percentage > 0)   return `${percentage}% (${window})`;
    if (percentage > 0) return `₹${amount.toLocaleString("en-IN")} + ${percentage}% (${window})`;
    return `₹${amount.toLocaleString("en-IN")} (${window})`;
  });
  return lines.join(" / ") || "As per airline";
}

function miniFareRuleLabel(
  rules: Array<{ Type: string; From: string; To: string; Unit: string; Details: string }> | undefined,
  type: "Cancellation" | "Reissue",
): string {
  if (!rules || !Array.isArray(rules) || rules.length === 0) return "As per airline";
  const matches = rules.filter(r => r && r.Type === type);
  if (!matches.length) return "As per airline";
  matches.sort((a, b) => Number(a.From ?? 0) - Number(b.From ?? 0));
  const lines = matches.slice(0, 2).map(r => {
    const from    = r.From ?? "0";
    const to      = r.To   ?? "";
    const unit    = (r.Unit ?? "HOURS").toUpperCase() === "DAYS" ? "d" : "h";
    const details = (r.Details ?? "").trim();
    let window: string;
    if (from === "0" && to === "") window = "Anytime";
    else if (to !== "")            window = `${from}${unit}–${to}${unit} before`;
    else                           window = `${from}${unit}+ before`;
    const upper = details.toUpperCase();
    if (upper === "NIL" || upper === "NILL" || upper === "FREE" || upper === "") return `Free (${window})`;
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

export async function apiFareQuote(flight: DisplayFlight): Promise<FareQuoteResult> {
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
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ traceId: v.traceId, resultIndex: v.resultIndex }),
        });
        if (res.status === 410) {
          const errJson = await res.json();
          throw new Error(errJson?.message ?? "Your search has expired. Please search again.");
        }
        if (!res.ok) return null;
        const json = await res.json();
        return json?.data ?? json;
      } catch (e: any) {
        if (e.message?.includes("expired") || e.message?.includes("search again")) throw e;
        return null;
      }
    })
  );

  const tiers: FareTier[] = [];
  let fareChanged = false;

  responses.forEach((responseData, i) => {
    if (!responseData) {
      tiers.push({
        name:            resolveFareName(variants[i].fareClass, variants[i].fareType, i),
        price:           variants[i].price,
        totalOfferedFare: variants[i].price,
        cabinBag:        variants[i].cabinBaggage,
        checkinBag:      variants[i].checkinBaggage,
        cancellationFee: "As per airline",
        dateChangeFee:   "As per airline",
        seatSelection:   variants[i].isLCC ? "Chargeable" : "Free (Standard)",
        meals:           variants[i].isLCC ? "Chargeable" : "Complimentary",
        recommended:     i === 0,
        resultIndex:     variants[i].resultIndex,
      });
      return;
    }

    const response = responseData?.Response;
    if (!response?.Results) return;
    const result = response.Results;
    const fare   = result.Fare;

    if (response.IsFareChanged) fareChanged = true;

    const supplierFareClass:      string = result.Segments?.[0]?.[0]?.SupplierFareClass ?? "";
    const fareClassificationType: string =
      result.FareClassification?.Type ?? result.Segments?.[0]?.[0]?.FareClassification?.Type ?? "";
    const fareClassCode: string =
      result.Segments?.[0]?.[0]?.Airline?.FareClass ?? variants[i].fareClass ?? "";
    const fareTypeRaw:  string =
      result.FareType ?? result.ResultFareType ?? variants[i].fareType ?? "Regular";

    const fareName = resolveFareName(fareClassCode, fareTypeRaw, i, supplierFareClass, fareClassificationType);

    const segCheckin = result.Segments?.[0]?.[0]?.Baggage      ?? "";
    const segCabin   = result.Segments?.[0]?.[0]?.CabinBaggage ?? "";
    const fbCheckin  = result.FareBreakdown?.[0]?.SegmentDetails?.[0]?.CheckedInBaggage?.FreeText ?? "";
    const fbCabin    = result.FareBreakdown?.[0]?.SegmentDetails?.[0]?.CabinBaggage?.FreeText     ?? "";

    const checkinBagRaw =
      (segCheckin && segCheckin !== "0 KG" && segCheckin !== "0" ? segCheckin : null) ??
      (fbCheckin  && fbCheckin  !== "0 KG" && fbCheckin  !== "0" ? fbCheckin  : null) ??
      result.Baggage?.[0]?.Baggage ??
      variants[i].checkinBaggage ??
      "15 Kg";

    const cabinBagRaw =
      (segCabin && segCabin !== "0 KG" && segCabin !== "0" ? segCabin : null) ??
      (fbCabin  && fbCabin  !== "0 KG" && fbCabin  !== "0" ? fbCabin  : null) ??
      result.CabinBaggage?.[0]?.CabinBaggage ??
      variants[i].cabinBaggage ??
      "7 Kg";

    const miniFareRules: Array<{ Type: string; From: string; To: string; Unit: string; Details: string }> =
      (result as any).MiniFareRules?.[0] ?? (result as any).MiniFareRules ?? [];

    const cancelFee = miniFareRules.length > 0
      ? miniFareRuleLabel(miniFareRules, "Cancellation")
      : policyLabel(response.CancellationPolicies, 1);

    const changeFee = miniFareRules.length > 0
      ? miniFareRuleLabel(miniFareRules, "Reissue")
      : policyLabel(response.CancellationPolicies, 4);

    const isRefundable = response.IsRefundable ?? result.IsRefundable ?? variants[i].isRefundable ?? false;
    const isLCC        = result.IsLCC ?? variants[i].isLCC ?? false;

    const fareBreakdown: any[] = result.FareBreakdown ?? [];
    const adultBD  = fareBreakdown.find((b: any) => b.PassengerType === 1);
    const childBD  = fareBreakdown.find((b: any) => b.PassengerType === 2);
    const infantBD = fareBreakdown.find((b: any) => b.PassengerType === 3);

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
      name:             fareName,
      price:            adultFare,
      cabinBag:         cabinBagRaw,
      checkinBag:       checkinBagRaw,
      cancellationFee:  cancelFee,
      dateChangeFee:    changeFee,
      seatSelection:    isLCC ? "Chargeable" : "Free (Standard)",
      meals:            isLCC ? "Chargeable" : "Complimentary",
      recommended:      i === 0,
      resultIndex:      result.ResultIndex ?? variants[i].resultIndex,
      isRefundable,
      taxesIncluded:    true,
      adultFare,
      childFare,
      infantFare,
      totalOfferedFare: fare?.PublishedFare ?? variants[i].price,
    });
  });

  if (tiers.length === 0) {
    tiers.push({
      name:            resolveFareName(flight.fareClass, flight.fareType, 0),
      price:           flight.price,
      totalOfferedFare: flight.price,
      cabinBag:        flight.cabinBaggage,
      checkinBag:      flight.checkinBaggage,
      cancellationFee: policyLabel(flight.cancellationPolicies, 1),
      dateChangeFee:   policyLabel(flight.cancellationPolicies, 4),
      seatSelection:   flight.isLCC ? "Chargeable" : "Free (Standard)",
      meals:           flight.isLCC ? "Chargeable" : "Complimentary",
      recommended:     true,
      resultIndex:     flight.resultIndex,
    });
  }

  return { tiers, fareChanged };
}

// ─── SSR ───────────────────────────────────────────────────

export type ApiSeat = {
  code:       string;
  isOccupied: boolean;
  isPremium:  boolean;
  price:      number;
  type:       "Window" | "Middle" | "Aisle";
};

export type ApiSeatRow = {
  rowNumber: number;
  seats:     ApiSeat[];
};

export type ApiSeatMap = {
  rows:      ApiSeatRow[];
  cols:      string[];
  totalRows: number;
};

export type SSRMeal = {
  code:         string;
  label:        string;
  description:  string;
  origin:       string;
  destination:  string;
  flightNumber?: string;
  price:        number;
  emoji:        string;
};

export type SSRBaggage = {
  code:         string;
  kg:           number;
  label:        string;
  description:  string;
  origin?:      string;
  destination?: string;
  flightNumber?: string;
  price:        number;
};

type SSRAvailability = {
  seatMap:          boolean;
  meals:            boolean;
  baggage:          boolean;
  seatMapMessage?:  string;
  mealsMessage?:    string;
  baggageMessage?:  string;
};

// One entry per PHYSICAL flight segment (i.e. per stop). A direct flight
// has exactly one segment; a 1-stop flight has two; a 2-stop flight has
// three. TBO returns seat/meal/baggage options per segment (each keyed by
// its own Origin/Destination/FlightNumber) — they must be selected and
// booked independently, since a passenger can pick a different seat and
// meal on each physical flight of a connecting itinerary.
export type SSRSegment = {
  origin:       string;
  destination:  string;
  flightNumber: string;
  airlineCode:  string;
  seatMap:      ApiSeatMap;
  meals:        SSRMeal[];
  baggage:      SSRBaggage[];
  availability: SSRAvailability;
};

export type SSRResult = {
  // Backward-compatible aggregate fields — mirror segments[0] so existing
  // single-segment (direct-flight) call sites keep working untouched.
  seatMap:  ApiSeatMap;
  meals:    SSRMeal[];
  baggage:  SSRBaggage[];
  // Authoritative per-segment breakdown. ALWAYS use this for connecting
  // (1-stop/2-stop) flights — seatMap/meals/baggage above only reflect the
  // FIRST physical segment.
  segments: SSRSegment[];
  availability?: SSRAvailability;
};

const MEAL_META: Record<string, { label: string; desc: string; emoji: string }> = {
  VGML: { label: "Vegetarian",  desc: "Fresh veg meal",         emoji: "🥗" },
  NVML: { label: "Non-Veg",     desc: "Chicken / mutton",       emoji: "🍗" },
  VJML: { label: "Jain Meal",   desc: "No root vegetables",     emoji: "🙏" },
  VLML: { label: "Vegan",       desc: "100% plant-based",       emoji: "🌱" },
  DBML: { label: "Diabetic",    desc: "Low-sugar, high-fiber",  emoji: "💊" },
  BLML: { label: "Bland Meal",  desc: "Plain & easy to digest", emoji: "🍚" },
  HNML: { label: "Hindu Meal",  desc: "No beef/pork",           emoji: "🪔" },
  MOML: { label: "Muslim Meal", desc: "Halal certified",        emoji: "☪️" },
  CHML: { label: "Child Meal",  desc: "Kid-friendly",           emoji: "🧒" },
};

function emptySeatMap(): ApiSeatMap {
  return { rows: [], cols: [], totalRows: 0 };
}

function airlineUnavailableMessage(kind: string, airlineName?: string): string {
  return `${kind} is not available for this ${airlineName?.trim() || "this airline"} flight.`;
}

function unavailableSSR(airlineName?: string): SSRResult {
  return {
    seatMap: emptySeatMap(),
    meals:   [],
    baggage: [],
    segments: [],
    availability: {
      seatMap:          false,
      meals:            false,
      baggage:          false,
      seatMapMessage:   airlineUnavailableMessage("Seat map", airlineName),
      mealsMessage:     airlineUnavailableMessage("Meals", airlineName),
      baggageMessage:   airlineUnavailableMessage("Extra baggage", airlineName),
    },
  };
}

// Builds one segment's seat map from its RowSeats array. Extracted so it
// can be called once per physical flight segment instead of only ever
// being applied to the first one.
function buildSeatMapFromRowSeats(rowSeats: any[]): ApiSeatMap | null {
  const validRows = rowSeats.filter((rowObj: any) => {
    const first = rowObj?.Seats?.[0];
    return first && String(first.RowNo).trim() !== "0" && first.Code !== "NoSeat";
  });
  if (validRows.length === 0) return null;

  const colSet = new Set<string>();
  validRows.forEach((rowObj: any) => {
    (rowObj.Seats ?? []).forEach((s: any) => { if (s.SeatNo) colSet.add(String(s.SeatNo)); });
  });
  const cols = [...colSet].sort();
  const rows: ApiSeatRow[] = validRows.map((rowObj: any) => {
    const seats: any[] = rowObj.Seats ?? [];
    const rowNo = String(seats[0]?.RowNo ?? "0").trim();
    return {
      rowNumber: Number(rowNo),
      seats: seats.map((s: any) => ({
        code:       s.Code,
        isOccupied: s.AvailablityType === 3 || s.AvailablityType === 2,
        isPremium:  s.SeatType === 1 || Number(rowNo) <= 3,
        price:      Number(s.Price ?? 0),
        type:
          s.SeatNo === "A" || s.SeatNo === "F" ? "Window"
          : s.SeatNo === "C" || s.SeatNo === "D" ? "Aisle"
          : "Middle",
      })),
    };
  });
  return { rows, cols, totalRows: rows.length };
}

function buildMealsFromRaw(rawMeals: any[]): SSRMeal[] {
  const realMeals = rawMeals.filter(
    (m: any) => m && m.Code && m.Code !== "NoMeal" && m.Code !== "NOML"
  );
  if (realMeals.length === 0) return [];
  return [
    { code: "NoMeal", label: "No meal", description: "Skip meal selection", price: 0, origin: "", destination: "", emoji: "🚫" },
    ...realMeals.map((m: any) => {
      const meta = MEAL_META[m.Code];
      return {
        code:         m.Code,
        label:        meta?.label ?? m.AirlineDescription ?? m.Code,
        description:  meta?.desc  ?? m.AirlineDescription ?? "",
        origin:       m.Origin,
        destination:  m.Destination,
        flightNumber: m.FlightNumber != null ? String(m.FlightNumber) : undefined,
        price:        Number(m.Price ?? 0),
        emoji:        meta?.emoji ?? "🍽️",
      };
    }),
  ];
}

function buildBaggageFromRaw(rawBaggage: any[]): SSRBaggage[] {
  const realBaggage = rawBaggage.filter(
    (b: any) => b.Code !== "NoBaggage" && Number(b.Weight ?? 0) > 0
  );
  if (realBaggage.length === 0) return [];

  const bagByWeight = new Map<number, any>();
  realBaggage.forEach((b: any) => {
    const kg       = Number(b.Weight);
    const existing = bagByWeight.get(kg);
    if (!existing || Number(b.Price) < Number(existing.Price)) bagByWeight.set(kg, b);
  });

  const sample = realBaggage[0];
  return [
    { code: "NoBaggage", kg: 0, label: "Included only", description: "Use fare allowance", price: 0, origin: sample?.Origin, destination: sample?.Destination },
    ...[...bagByWeight.values()]
      .sort((a, b) => Number(a.Weight) - Number(b.Weight))
      .map((b: any) => ({
        code:         String(b.Code ?? ""),
        kg:           Number(b.Weight),
        label:        `+ ${b.Weight} kg`,
        description:  b.Text ?? `Extra ${b.Weight}kg check-in`,
        origin:       b.Origin,
        destination:  b.Destination,
        flightNumber: b.FlightNumber != null ? String(b.FlightNumber) : undefined,
        price:        Number(b.Price),
      })),
  ];
}

// ─── parseTBOSSR ─────────────────────────────────────────────
//
// FIXED: previously this only ever read allSegmentSeats[0] — the FIRST
// physical flight segment with row data — and silently discarded every
// other segment. For a direct flight that's harmless (there's only one
// segment), but for a 1-stop or 2-stop flight, TBO's SeatDynamic response
// contains one `SegmentSeat` entry PER physical segment (e.g. DEL→IXB and
// IXB→BOM), and this function threw all but the first away. That's why
// seats never rendered past the first hop, and meals/baggage — which were
// naively flattened across every segment into one undifferentiated list —
// couldn't be matched back to a specific flight number for booking.
//
// Now every SegmentSeat / meal / baggage item is grouped into its own
// `SSRSegment`, keyed by Origin|Destination|FlightNumber, and returned in
// `segments[]`. The old top-level seatMap/meals/baggage fields are kept
// for backward compatibility and simply mirror segments[0].
function parseTBOSSR(raw: any, airlineName?: string): SSRResult {
  const response = raw?.Response ?? raw;

  type PartialSeg = {
    origin: string; destination: string; flightNumber: string; airlineCode: string;
    seatMap: ApiSeatMap; meals: SSRMeal[]; baggage: SSRBaggage[];
    availability: SSRAvailability;
  };
  const orderedKeys: string[] = [];
  const segByKey = new Map<string, PartialSeg>();

  function ensureSegment(key: string, origin: string, destination: string, flightNumber: string, airlineCode: string): PartialSeg {
    let seg = segByKey.get(key);
    if (!seg) {
      seg = {
        origin, destination, flightNumber, airlineCode,
        seatMap: emptySeatMap(), meals: [], baggage: [],
        availability: { seatMap: false, meals: false, baggage: false },
      };
      segByKey.set(key, seg);
      orderedKeys.push(key);
    }
    return seg;
  }

  // ── 1. Seats — one SegmentSeat entry per physical flight segment ──
  const seatDynArr: any[] = response?.SeatDynamic ?? [];
  for (const sd of seatDynArr) {
    const segSeats: any[] = sd?.SegmentSeat ?? [];
    for (const ss of segSeats) {
      const rowSeats: any[] = ss?.RowSeats ?? [];
      const sampleSeat = rowSeats
        .flatMap((r: any) => r?.Seats ?? [])
        .find((s: any) => s && s.Code !== "NoSeat");
      if (!sampleSeat) continue; // this segment has no bookable seats at all
      const origin       = sampleSeat.Origin ?? "";
      const destination   = sampleSeat.Destination ?? "";
      const flightNumber = sampleSeat.FlightNumber != null ? String(sampleSeat.FlightNumber) : "";
      const airlineCode  = sampleSeat.AirlineCode ?? "";
      const key = `${origin}|${destination}|${flightNumber}`;
      const seg = ensureSegment(key, origin, destination, flightNumber, airlineCode);
      const map = buildSeatMapFromRowSeats(rowSeats);
      if (map) { seg.seatMap = map; seg.availability.seatMap = true; }
    }
  }

  // ── 2. Meals — grouped by Origin|Destination|FlightNumber ──
  const mealOuter: any = response?.MealDynamic?.[0] ?? [];
  const rawMealsFlat: any[] = Array.isArray(mealOuter?.[0])
    ? mealOuter.flat()
    : Array.isArray(mealOuter) ? mealOuter : [];
  const mealsByKey = new Map<string, any[]>();
  rawMealsFlat.forEach((m: any) => {
    const key = `${m?.Origin ?? ""}|${m?.Destination ?? ""}|${m?.FlightNumber != null ? String(m.FlightNumber) : ""}`;
    (mealsByKey.get(key) ?? mealsByKey.set(key, []).get(key)!).push(m);
  });
  mealsByKey.forEach((raws, key) => {
    const sample = raws[0] ?? {};
    const seg = ensureSegment(
      key,
      sample.Origin ?? "",
      sample.Destination ?? "",
      sample.FlightNumber != null ? String(sample.FlightNumber) : "",
      sample.AirlineCode ?? "",
    );
    const meals = buildMealsFromRaw(raws);
    seg.meals = meals;
    seg.availability.meals = meals.length > 0;
  });

  // ── 3. Baggage — grouped the same way ──
  const bagOuter: any = response?.Baggage?.[0] ?? [];
  const rawBaggageFlat: any[] = Array.isArray(bagOuter?.[0])
    ? bagOuter.flat()
    : Array.isArray(bagOuter) ? bagOuter : [];
  const baggageByKey = new Map<string, any[]>();
  rawBaggageFlat.forEach((b: any) => {
    const key = `${b?.Origin ?? ""}|${b?.Destination ?? ""}|${b?.FlightNumber != null ? String(b.FlightNumber) : ""}`;
    (baggageByKey.get(key) ?? baggageByKey.set(key, []).get(key)!).push(b);
  });
  baggageByKey.forEach((raws, key) => {
    const sample = raws[0] ?? {};
    const seg = ensureSegment(
      key,
      sample.Origin ?? "",
      sample.Destination ?? "",
      sample.FlightNumber != null ? String(sample.FlightNumber) : "",
      sample.AirlineCode ?? "",
    );
    const baggage = buildBaggageFromRaw(raws);
    seg.baggage = baggage;
    seg.availability.baggage = baggage.length > 0;
  });

  const segments: SSRSegment[] = orderedKeys.map((key) => {
    const seg = segByKey.get(key)!;
    seg.availability.seatMapMessage = seg.availability.seatMap ? undefined : airlineUnavailableMessage("Seat map", airlineName);
    seg.availability.mealsMessage   = seg.availability.meals   ? undefined : airlineUnavailableMessage("Meals", airlineName);
    seg.availability.baggageMessage = seg.availability.baggage ? undefined : airlineUnavailableMessage("Extra baggage", airlineName);
    return seg;
  });

  const first = segments[0];
  return {
    seatMap:  first?.seatMap ?? emptySeatMap(),
    meals:    first?.meals   ?? [],
    baggage:  first?.baggage ?? [],
    segments,
    availability: first?.availability ?? {
      seatMap: false, meals: false, baggage: false,
      seatMapMessage: airlineUnavailableMessage("Seat map", airlineName),
      mealsMessage:   airlineUnavailableMessage("Meals", airlineName),
      baggageMessage: airlineUnavailableMessage("Extra baggage", airlineName),
    },
  };
}

function parseTBOSSRForLeg(raw: any, legIndex: number): SSRResult {
  const resp         = raw?.Response ?? raw;
  const seatDynamic  = resp?.SeatDynamic ?? [];
  const mealDynamic  = resp?.MealDynamic ?? [];
  const baggage      = resp?.Baggage     ?? [];
  const legSeatDynamic = seatDynamic[legIndex];
  const legMealDynamic = mealDynamic[legIndex];
  const legBaggage     = baggage[legIndex];
  if (!legSeatDynamic && !legMealDynamic && !legBaggage) return unavailableSSR();
  // NOTE: legSeatDynamic/legMealDynamic/legBaggage can each still contain
  // MULTIPLE physical segments (SegmentSeat entries) when this leg itself
  // is a 1-stop/2-stop flight — parseTBOSSR (below) now correctly expands
  // all of them into `segments[]` instead of collapsing to the first.
  const miniRaw = {
    Response: {
      SeatDynamic: legSeatDynamic ? [legSeatDynamic] : [],
      MealDynamic: legMealDynamic ? [legMealDynamic] : [],
      Baggage:     legBaggage     ? [legBaggage]     : [],
    },
  };
  return parseTBOSSR(miniRaw);
}

async function fetchSSRForFlight(flight: DisplayFlight): Promise<SSRResult> {
  const res = await fetch(`${API_BASE}/api/v1/flights/tbo/ssr`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ traceId: flight.traceId, resultIndex: flight.resultIndex }),
  });
  if (!res.ok) {
    let errMsg = `SSR failed (HTTP ${res.status})`;
    try { const j = await res.json(); errMsg = j?.message || j?.error || errMsg; } catch { /* ignore */ }
    throw new Error(errMsg);
  }
  const json = await res.json();
  if (json?.ok === false) throw new Error(json?.message || "SSR failed");
  return parseTBOSSR(json?.data ?? json, flight.airline);
}

export async function apiGetSSR(flight: DisplayFlight): Promise<SSRResult> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 700));
    return unavailableSSR(flight.airline);
  }
  return fetchSSRForFlight(flight);
}

// One leg's SSR failure must not erase a leg that succeeded.
// fetchSSRForFlight throws on any non-2xx / ok:false response with no
// internal fallback (unlike apiFareQuote, which catches per-variant).
// Using Promise.all here meant ANY leg failing rejected the WHOLE array,
// so callers (FlightsFlow's prefetch) had no choice but to discard
// every leg's result — including legs that had already succeeded —
// forcing BookingPage to re-fetch SSR for all legs on Step 2 → 3 even
// though most of them were fine the first time.
// Promise.allSettled + a per-leg unavailableSSR fallback means a single
// bad leg degrades gracefully (that leg shows "not available", same as
// the existing MOCK_MODE / airline-unsupported path) instead of wiping
// out legs that already came back fine.
//
// [SSR-COMBINED-FIX v2] Originally tried deduping only when traceId AND
// resultIndex were both identical (true "combined fare" itineraries).
// That wasn't enough: TraceId is shared by EVERY leg of a round-trip
// search regardless of style (it comes from one shared search session —
// responseData.Response.TraceId) — including suppliers like ATG that DO
// hand back distinct ResultIndex values per leg. Firing two concurrent
// SSR requests against the same TraceId (even with different
// ResultIndex) still races against TBO's per-session lock: the first
// request wins fast, the second hangs against the same locked session
// until it times out and fails. That's the "leg 0 instant, leg 1 hangs
// then fails" pattern on ATG round-trips specifically.
//
// Fix: group legs by traceId. Legs in DIFFERENT traceId groups (e.g.
// unrelated multi-city searches) still fetch in parallel. Legs that
// SHARE a traceId are fetched SEQUENTIALLY (await one before starting
// the next) so we never have two in-flight SSR requests against the same
// TBO session. Within a traceId group, if two legs ALSO share the exact
// same resultIndex (true combined-fare case), we still only make ONE
// network call and split the response via parseTBOSSRForLeg.
async function ssrForLegsSettled(legs: DisplayFlight[]): Promise<SSRResult[]> {
  const results: SSRResult[] = new Array(legs.length);

  // Group leg indexes by traceId — these MUST be fetched sequentially.
  const byTraceId = new Map<string, number[]>();
  legs.forEach((f, i) => {
    const arr = byTraceId.get(f.traceId);
    if (arr) arr.push(i);
    else byTraceId.set(f.traceId, [i]);
  });

  async function fetchOne(flight: DisplayFlight): Promise<any> {
    const res = await fetch(`${API_BASE}/api/v1/flights/tbo/ssr`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ traceId: flight.traceId, resultIndex: flight.resultIndex }),
    });
    if (!res.ok) {
      let errMsg = `SSR failed (HTTP ${res.status})`;
      try { const j = await res.json(); errMsg = j?.message || j?.error || errMsg; } catch { /* ignore */ }
      throw new Error(errMsg);
    }
    const json = await res.json();
    if (json?.ok === false) throw new Error(json?.message || "SSR failed");
    return json?.data ?? json;
  }

  // Different traceId groups can run concurrently against each other.
  await Promise.allSettled(
    [...byTraceId.entries()].map(async ([, legIndexes]) => {
      // Within ONE traceId, dedupe by exact resultIndex (true combined
      // fares), then walk the unique resultIndexes SEQUENTIALLY.
      const byResultIndex = new Map<string, number[]>();
      legIndexes.forEach((i) => {
        const ri = legs[i].resultIndex;
        const arr = byResultIndex.get(ri);
        if (arr) arr.push(i);
        else byResultIndex.set(ri, [i]);
      });

      for (const [, sameResultLegIdxs] of byResultIndex) {
        const flight = legs[sameResultLegIdxs[0]];
        const isCombined = sameResultLegIdxs.length > 1;
        try {
          const raw = await fetchOne(flight);
          if (isCombined) {
            sameResultLegIdxs.forEach((legIdx, n) => {
              results[legIdx] = parseTBOSSRForLeg(raw, n);
            });
          } else {
            results[sameResultLegIdxs[0]] = parseTBOSSR(raw, flight.airline);
          }
        } catch {
          sameResultLegIdxs.forEach((legIdx) => {
            results[legIdx] = unavailableSSR(legs[legIdx].airline);
          });
        }
        // Sequential by design — do not start the next resultIndex's
        // request for this traceId until this one has fully settled.
      }
    })
  );

  return results;
}

export async function apiGetSSRForLegs(
  legs: DisplayFlight[],
  _isMultiCity = false,
): Promise<SSRResult[]> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 700));
    return legs.map((leg) => unavailableSSR(leg.airline));
  }
  return ssrForLegsSettled(legs);
}

export async function apiGetSSRForMultiCity(legs: DisplayFlight[]): Promise<SSRResult[]> {
  if (MOCK_MODE) {
    await new Promise(r => setTimeout(r, 700));
    return legs.map((leg) => unavailableSSR(leg.airline));
  }
  return ssrForLegsSettled(legs);
}

// ─── BOOK ──────────────────────────────────────────────────

export type BookPassenger = {
  Title:        "Mr" | "Ms" | "Mrs" | "Mstr" | "Miss";
  FirstName:    string;
  LastName:     string;
  PaxType:      1 | 2 | 3;
  DateOfBirth:  string;
  Gender:       1 | 2;
  PassportNo?:  string;
  PassportExpiry?: string;
  Pan?:         string;
  ContactNo?:   string;
  Email?:       string;
  IsLeadPax?:   boolean;
  AddressLine1?: string;
  City?:        string;
  CountryCode?: string;
  CountryName?: string;
  Nationality?: string;
  Fare?: {
    BaseFare:              number;
    Tax:                   number;
    TransactionFee:        number;
    YQTax:                 number;
    AdditionalTxnFeeOfrd:  number;
    AdditionalTxnFeePub:   number;
    AirTransFee:           number;
  };
};

export type BookFlightInput = {
  traceId:         string;
  resultIndex:     string;
  isLCC?:          boolean;
  isInternational?: boolean;
  passengers:      BookPassenger[];
  contact:         { Email: string; Mobile: string };
  gst?: {
    GSTNumber?:         string;
    GSTCompanyName?:    string;
    GSTCompanyEmail?:   string;
    GSTCompanyAddress?: string;
  };
  segments?: Array<Array<{
    Origin:      { Airport?: { CountryCode?: string } };
    Destination: { Airport?: { CountryCode?: string } };
    FlightNumber?: string;
  }>>;
};

export async function apiBookFlight(
  input: BookFlightInput,
): Promise<{ pnr: string; bookingId: number }> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 1500));
    return {
      pnr:       "MOCK" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      bookingId: Math.floor(Math.random() * 9_000_000 + 1_000_000),
    };
  }
  const res = await fetch(`${API_BASE}/api/v1/flights/tbo/book`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(input),
  });
  if (!res.ok) {
    let errMsg = `Booking failed (HTTP ${res.status})`;
    try {
      const errJson = await res.json();
      console.error("[apiBookFlight] Backend error response:", errJson);
      if (errJson?.message) errMsg = errJson.message;
      if (errJson?.error)   errMsg = errJson.error;
    } catch { /* ignore */ }
    throw new Error(errMsg);
  }
  const json          = await res.json();
  const responseData  = json?.data ?? json;
  const outerResponse = responseData?.Response;
  const response      = outerResponse?.Response ?? outerResponse;
  const tboError      = response?.Error ?? outerResponse?.Error;
  if (tboError?.ErrorCode && tboError.ErrorCode !== 0) {
    throw new Error(tboError.ErrorMessage || "Booking failed");
  }
  const pnr       = response?.FlightItinerary?.PNR || response?.PNR;
  const bookingId = response?.FlightItinerary?.BookingId || response?.BookingId;
  if (!pnr) throw new Error("Booking succeeded but PNR is missing from response");
  return { pnr, bookingId };
}

// ─── TICKET ────────────────────────────────────────────────

export async function apiBookTicket(input: BookTicketInput): Promise<BookTicketResponse> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 1500));
    return {
      isPriceChanged: false,
      isTimeChanged:  false,
      pnr:            "MOCK" + Math.random().toString(36).slice(2, 8).toUpperCase(),
      bookingId:      Math.floor(Math.random() * 9_000_000 + 1_000_000),
      ticketStatus:   1,
    };
  }

  const body = input.isLCC
    ? {
        isLCC:                true,
        TraceId:              input.traceId,
        ResultIndex:          input.resultIndex,
        Passengers:           input.passengers,
        IsPriceChangeAccepted: input.isPriceChangeAccepted ?? false,
      }
    : {
        isLCC:                false,
        TraceId:              input.traceId,
        PNR:                  input.pnr,
        BookingId:            input.bookingId,
        ...(input.passport?.length ? { Passport: input.passport } : {}),
        IsPriceChangeAccepted: input.isPriceChangeAccepted ?? false,
      };

  const res = await fetch(`${API_BASE}/api/v1/flights/tbo/ticket`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
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

  const json         = await res.json();
  const responseData = json?.data ?? json;
  const response     = responseData?.Response ?? responseData;

  const tboError = response?.Error;
  if (tboError?.ErrorCode && tboError.ErrorCode !== 0) {
    throw new Error(tboError.ErrorMessage || "Ticketing failed");
  }

  if (response?.IsPriceChanged === true && !body.IsPriceChangeAccepted) {
    return {
      isPriceChanged:  true,
      isTimeChanged:   response.IsTimeChanged ?? false,
      pnr:             response.PNR ?? "",
      bookingId:       response.BookingId ?? 0,
      ticketStatus:    8,
      flightItinerary: response.FlightItinerary,
    };
  }

  if (response?.TicketStatus === 6) {
    return {
      isPriceChanged:  false,
      isTimeChanged:   false,
      pnr:             response.PNR ?? "",
      bookingId:       response.BookingId ?? 0,
      ticketStatus:    6,
      message:         "Ticket already created — booking confirmed",
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


// ─── CANCEL PNR ────────────────────────────────────────────
 
export type CancelPNRInput = {
  bookingId: number;
  source:    number;   // TBO Source (same numeric Source you get back on the flight result)
  remarks?:  string;   // optional reason, shown to the airline/TBO ops team
};
 
export type CancelPNRResult = {
  success:         boolean;
  cancellationId?: number;
  status?:         string;   // e.g. "Requested" | "Cancelled" | "Rejected" | "InProgress"
  message?:        string;
  refundAmount?:   number;
};
 
export async function apiCancelPNR(input: CancelPNRInput): Promise<CancelPNRResult> {
  if (MOCK_MODE) {
    await new Promise((r) => setTimeout(r, 1200));
    return {
      success:        true,
      cancellationId: Math.floor(Math.random() * 900_000 + 100_000),
      status:         "Requested",
      message:        "Cancellation request submitted successfully. Refund (if applicable) will be processed as per the fare rules.",
      refundAmount:   0,
    };
  }
 
  const res = await fetch(`${API_BASE}/api/v1/flights/tbo/cancelPNR`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      bookingId: input.bookingId,
      source:    JSON.stringify(input.source),
      Remarks:   input.remarks ?? "",
    }),
  });
 
  if (!res.ok) {
    let errMsg = `Cancellation request failed (HTTP ${res.status})`;
    try {
      const errJson = await res.json();
      if (errJson?.message) errMsg = errJson.message;
      else if (errJson?.error) errMsg = errJson.error;
    } catch { /* ignore */ }
    throw new Error(errMsg);
  }
 
  const json = await res.json();
  if (json?.ok === false) throw new Error(json?.message ?? "Cancellation failed");
 
  const responseData = json?.data ?? json;
  const response      = responseData?.Response ?? responseData;
 
  const tboError = response?.Error;
  if (tboError?.ErrorCode && tboError.ErrorCode !== 0) {
    throw new Error(tboError.ErrorMessage || "Cancellation failed");
  }
 
  return {
    success:        true,
    cancellationId: response?.CancellationId ?? response?.CancellationRequestId,
    status:         response?.CancellationStatus ?? response?.Status ?? "Requested",
    message:        response?.Message ?? "Cancellation request submitted.",
    refundAmount:   response?.RefundAmount,
  };
}

// ─── AIRPORTS ──────────────────────────────────────────────

export async function apiGetAirports(): Promise<Airport[]> {
  const res = await fetch(`${API_BASE}/api/v1/flights/tbo/airports`);
  if (!res.ok) throw new Error("Failed to fetch airports");
  const json = await res.json();
  return (json?.data ?? json) as Airport[];
}

// ─── TICKET PDF ────────────────────────────────────────────

export async function apiDownloadTicketPdf(
  ticketResponse: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/flights/tbo/ticket/pdf`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(ticketResponse),
  });
  if (!res.ok) {
    let msg = `PDF download failed (HTTP ${res.status})`;
    try { const j = await res.json(); msg = j?.message ?? msg; } catch { /**/ }
    throw new Error(msg);
  }
  const blob = await res.blob();
  const url  = URL.createObjectURL(blob);
  const pnr  = (ticketResponse.PNR ?? (ticketResponse.FlightItinerary as any)?.PNR ?? "ticket") as string;
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `ticket-${pnr}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}