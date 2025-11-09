// apps/frontend/src/lib/api.ts

// Minimal client for your backend (runs in browser)
const BACKEND =
  import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:8080";

// Default timeout (ms) for network calls. You can override per call below.
const DEFAULT_TIMEOUT_MS = Number(import.meta.env.VITE_HTTP_TIMEOUT_MS || 90000); // 90s

/* ------------------------------------------------------------------ */
/* Robust fetch helpers                                                */
/* ------------------------------------------------------------------ */

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function ensureErrorMessage(raw: unknown, fallback: string) {
  if (typeof raw === "string" && raw.trim()) return raw;
  if (raw && typeof raw === "object") {
    const msg = (raw as any).message || (raw as any).error || (raw as any).detail;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return fallback;
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit & { timeoutMs?: number } = {}
): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...opts } = init;
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(input, { ...opts, signal: ctrl.signal });
  } catch (err: any) {
    // Surface a nice timeout message
    if (err?.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs} ms`);
    }
    throw err;
  } finally {
    clearTimeout(id);
  }
}

/** POST JSON, return JSON, throw clean Error on HTTP/ok:false failures */
async function postJson<T>(
  path: string,
  body: unknown,
  timeoutMs?: number
): Promise<T> {
  const res = await fetchWithTimeout(`${BACKEND}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body ?? {}),
    timeoutMs,
  });

  const data = await parseJsonSafe(res);

  // Backend may respond with ok:false but still 200/4xx
  if (data && typeof data === "object" && (data as any).ok === false) {
    const msg = ensureErrorMessage(data, "Request failed");
    throw new Error(msg);
  }

  if (!res.ok) {
    // Try to extract message from JSON, then fallback to text/status
    const txt = !data ? await res.text().catch(() => "") : "";
    const msg = ensureErrorMessage(
      data ?? txt,
      `HTTP ${res.status} ${res.statusText || ""}`.trim()
    );
    throw new Error(msg);
  }

  return data as T;
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type SearchBody = {
  origin: string;
  destination: string;
  departDate: string; // YYYY-MM-DD
  returnDate?: string; // optional
  cabinClass?: number; // 1 All, 2 Economy, 3 PremEco, 4 Biz, 6 First
  adults?: number;
  children?: number;
  infants?: number;
  sources?: string[]; // ["GDS","LCC"]
};

export type FareParams = { traceId: string; resultIndex: string | number };

export type BookBody = {
  traceId: string;
  resultIndex: string | number;
  isLCC?: boolean;
  blockedFare?: boolean;
  contact: { Email: string; Mobile: string };
  address?: {
    AddressLine?: string;
    AddressLine1?: string;
    AddressLine2?: string;
    City?: string;
    CountryCode?: string;
    ZipCode?: string;
  };
  passengers: Array<{
    Title: "Mr" | "Ms" | "Mrs" | "Mstr" | "Miss";
    FirstName: string;
    LastName: string;
    PaxType: 1 | 2 | 3;
    DateOfBirth: string; // YYYY-MM-DDT00:00:00
    Gender: 1 | 2;
    ContactNo: string;
    Email?: string;
  }>;
};

/* ---------- LCC ticketing helper types (mirrors TBO LCC schema) ---------- */

export type LccAncillary = {
  AirlineCode: string;
  FlightNumber: string | number;
  WayType: number;                // e.g. 2 (one-way)
  Code: string;                   // "NoBaggage" | "NoMeal" | "NoSeat" | etc.
  Description: number | string;   // often 2 for "none"
  Origin: string;
  Destination: string;
  Currency: string;
  Price: number;
  // Optional seat/extra fields:
  CraftType?: string;
  AvailablityType?: number;
  RowNo?: string;
  SeatNo?: string | null;
  SeatType?: number;
  SeatWayType?: number;
  Compartment?: number;
  Deck?: number;
  Weight?: number;
  Quantity?: number;
  AirlineDescription?: string;
};

export type LccPassengerForTicket = {
  Title: "Mr" | "Ms" | "Mrs" | "Mstr" | "Miss";
  FirstName: string;
  LastName: string;
  PaxType: 1 | 2 | 3;             // 1 Adult, 2 Child, 3 Infant
  DateOfBirth: string;            // "YYYY-MM-DDT00:00:00"
  Gender: 1 | 2;
  PassportNo?: string;
  PassportExpiry?: string;        // ISO
  AddressLine1?: string;
  AddressLine2?: string;
  Fare: {
    BaseFare: number;
    Tax: number;
    YQTax?: number;
    AdditionalTxnFeePub?: number;
    AdditionalTxnFeeOfrd?: number;
    OtherCharges?: number;
  };
  City?: string;
  CountryCode?: string;
  CountryName?: string;
  Nationality?: string;
  ContactNo?: string;
  Email?: string;
  IsLeadPax?: boolean;
  FFAirlineCode?: string | null;
  FFNumber?: string | null;
  Baggage?: LccAncillary[];
  MealDynamic?: LccAncillary[];
  SeatDynamic?: LccAncillary[];
  SpecialServices?: Array<{
    Origin: string; Destination: string; DepartureTime: string;
    AirlineCode: string; FlightNumber: string | number;
    Code: string; ServiceType: number; Text: string;
    WayType: number; Currency: string; Price: number;
  }>;
  GSTCompanyAddress?: string;
  GSTCompanyContactNumber?: string;
  GSTCompanyName?: string;
  GSTNumber?: string;
  GSTCompanyEmail?: string;
};

/* ------------------------------------------------------------------ */
/* TBO endpoints (frontend -> your backend)                            */
/* ------------------------------------------------------------------ */

export async function tboSearch(body: SearchBody) {
  // default timeout
  return postJson<{ ok: boolean; data: any }>(
    "/api/v1/flights/tbo/search",
    body
  );
}

export async function tboFareRule(body: FareParams) {
  // Fare rules can be slow; give them more time (120s)
  return postJson<{ ok: boolean; data: any }>(
    "/api/v1/flights/tbo/fare-rule",
    body,
    Math.max(DEFAULT_TIMEOUT_MS, 120_000)
  );
}

export async function tboFareQuote(body: FareParams) {
  // Quote also sometimes slow; 90–120s is safer
  return postJson<{ ok: boolean; data: any }>(
    "/api/v1/flights/tbo/fare-quote",
    body,
    Math.max(DEFAULT_TIMEOUT_MS, 90_000)
  );
}

export async function tboBook(body: BookBody) {
  // Booking can take longer (PCC queue/hold) — allow 120s
  return postJson<{ ok: boolean; data: any }>(
    "/api/v1/flights/tbo/book",
    body,
    Math.max(DEFAULT_TIMEOUT_MS, 120_000)
  );
}

/**
 * Ticket:
 * - GDS/standard flow: send { bookingId, pnr?, traceId? }
 * - LCC flow: send extended body with passengers/ancillaries (agentReferenceNo optional)
 * The backend is expected to add EndUserIp/TokenId/etc.
 */
export async function tboTicket(body: {
  // Standard/GDS:
  bookingId?: number | string;
  pnr?: string;
  traceId?: string;

  // LCC:
  isLCC?: boolean;
  agentReferenceNo?: string;
  preferredCurrency?: string | null;
  resultIndex?: string | number;
  passengers?: LccPassengerForTicket[];
}) {
  return postJson<{ ok: boolean; data: any }>(
    "/api/v1/flights/tbo/ticket",
    body,
    Math.max(DEFAULT_TIMEOUT_MS, 120_000)
  );
}

export async function tboGetBookingDetails(body: { bookingId: number | string }) {
  return postJson<{ ok: boolean; data: any }>(
    "/api/v1/flights/tbo/booking-details",
    body
  );
}

/* ------------------------------------------------------------------ */
/* Compatibility shims for existing pages                              */
/* Your Flights.tsx imports `searchFlights` from this module.          */
/* Map it to the TBO search so your page keeps working.                */
/* ------------------------------------------------------------------ */
export async function searchFlights(body: SearchBody) {
  return tboSearch(body);
}

/**
 * Hotels placeholder.
 * Your backend currently exposes only /api/v1/hotels/health.
 * Until we add a real hotels search endpoint, return an empty list
 * so the Hotels page renders gracefully.
 */
export async function searchHotels(_params: any) {
  console.warn(
    "[searchHotels] Not implemented server-side yet. Returning empty data."
  );
  return { ok: true, data: [] as any[] };
}

/* ------------------------------------------------------------------ */
/* Frontend helpers for airports/airlines JSON in /public              */
/* ------------------------------------------------------------------ */
export type Airport = {
  code: string;
  cityCode: string;
  city: string;
  name: string;
  countryCode: string;
  country: string;
  label: string; // e.g., "Delhi (DEL) — Indira Gandhi Airport, India"
};

export type Airline = { code: string; name: string; label: string };

export async function loadAirports(): Promise<Airport[]> {
  const res = await fetch("/airports.min.json", { credentials: "omit" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return (await res.json()) as Airport[];
}

export async function loadAirlines(): Promise<Record<string, string>> {
  // returns a map { "AI": "Air India", ... } for quick lookups
  const res = await fetch("/airlines.min.json", { credentials: "omit" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const items = (await res.json()) as Airline[];
  return items.reduce<Record<string, string>>((acc, a) => {
    acc[a.code] = a.name;
    return acc;
  }, {});
}

export function airlineName(code: string, map?: Record<string, string>) {
  const c = (code || "").trim().toUpperCase();
  if (!c) return "";
  return map?.[c] ?? c;
}

/** Extract IATA code from a field like "Delhi (DEL)" or just "DEL" */
export function extractIata(input: string) {
  const s = (input || "").trim();
  const m = s.match(/\(([A-Z]{3})\)$/i);
  if (m) return m[1].toUpperCase();
  if (/^[A-Za-z]{3}$/.test(s)) return s.toUpperCase();
  return s;
}

// apps/frontend/src/lib/api.ts (append these exports)
export type ProfileCompletion = {
  score: number;
  band: "start" | "good" | "half" | "almost" | "complete";
  nextStep?: {
    key:
      | "verify_mobile"
      | "verify_email"
      | "passport"
      | "address"
      | "emergency_contact"
      | "2fa"
      | "backup_email"
      | "payment"
      | "co_traveller"
      | "prefs"
      | "gst";
    label: string;
    reason: string;
    ctaText: string;
    target: string; // route or action
  };
  breakdown: Array<{ key: string; label: string; weight: number; completed: boolean }>;
  snoozed: string[];
};

export async function getProfileCompletion(): Promise<ProfileCompletion> {
  const res = await fetch(`/api/v1/me/profile-completion?ts=${Date.now()}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load profile completion");
  return res.json();
}


export async function snoozeProfileStep(key: string): Promise<void> {
  const res = await fetch(`/api/v1/me/profile-snooze`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key }),
  });
  if (!res.ok) throw new Error("Failed to snooze");
}
