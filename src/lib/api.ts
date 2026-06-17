// apps/frontend/src/lib/api.ts

// Minimal client for your backend (runs in browser)
const BACKEND = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:8080";

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

/** GET JSON, return JSON, throw clean Error on HTTP/ok:false failures */
async function getJson<T>(
  path: string,
  timeoutMs?: number
): Promise<T> {
  const res = await fetchWithTimeout(`${BACKEND}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    timeoutMs,
  });

  const data = await parseJsonSafe(res);

  if (data && typeof data === "object" && (data as any).ok === false) {
    const msg = ensureErrorMessage(data, "Request failed");
    throw new Error(msg);
  }

  if (!res.ok) {
    const txt = !data ? await res.text().catch(() => "") : "";
    const msg = ensureErrorMessage(
      data ?? txt,
      `HTTP ${res.status} ${res.statusText || ""}`.trim()
    );
    throw new Error(msg);
  }

  return data as T;
}

/** PUT JSON, return JSON, throw clean Error on HTTP/ok:false failures */
async function putJson<T>(
  path: string,
  body: unknown,
  timeoutMs?: number
): Promise<T> {
  const res = await fetchWithTimeout(`${BACKEND}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body ?? {}),
    timeoutMs,
  });

  const data = await parseJsonSafe(res);

  if (data && typeof data === "object" && (data as any).ok === false) {
    const msg = ensureErrorMessage(data, "Request failed");
    throw new Error(msg);
  }

  if (!res.ok) {
    const txt = !data ? await res.text().catch(() => "") : "";
    const msg = ensureErrorMessage(
      data ?? txt,
      `HTTP ${res.status} ${res.statusText || ""}`.trim()
    );
    throw new Error(msg);
  }

  return data as T;
}

/** PATCH JSON, return JSON, throw clean Error on HTTP/ok:false failures */
async function patchJson<T>(
  path: string,
  body: unknown,
  timeoutMs?: number
): Promise<T> {
  const res = await fetchWithTimeout(`${BACKEND}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body ?? {}),
    timeoutMs,
  });

  const data = await parseJsonSafe(res);

  if (data && typeof data === "object" && (data as any).ok === false) {
    const msg = ensureErrorMessage(data, "Request failed");
    throw new Error(msg);
  }

  if (!res.ok) {
    const txt = !data ? await res.text().catch(() => "") : "";
    const msg = ensureErrorMessage(
      data ?? txt,
      `HTTP ${res.status} ${res.statusText || ""}`.trim()
    );
    throw new Error(msg);
  }

  return data as T;
}

/** DELETE JSON, return JSON, throw clean Error on HTTP/ok:false failures */
async function deleteJson<T>(
  path: string,
  timeoutMs?: number
): Promise<T> {
  const res = await fetchWithTimeout(`${BACKEND}${path}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    timeoutMs,
  });

  const data = await parseJsonSafe(res);

  if (data && typeof data === "object" && (data as any).ok === false) {
    const msg = ensureErrorMessage(data, "Request failed");
    throw new Error(msg);
  }

  if (!res.ok) {
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
/* Blog API functions                                                 */
/* ------------------------------------------------------------------ */

export type Post = {
  id?: string;
  title: string;
  subtitle: string;
  slug: string;
  excerpt: string;
  cover?: { src: string; caption: string };
  author: { name: string; role: string; initials: string; avatar: string };
  categories: string[];
  tags: string[];
  readingTime: number;
  publishDate: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  featured: boolean;
  seo: { title: string; description: string; ogImage: string };
  blocks: any[];
  related: any[];
  createdAt?: string;
  updatedAt?: string;
};

export async function getBlogs(filters?: any) {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, String(v));
    });
  }
  return getJson<{ success: boolean; data: { posts: Post[]; total: number; page: number; limit: number } }>(
    `/api/abx/blogs?${params.toString()}`
  );
}

export async function getBlog(idOrSlug: string) {
  return getJson<{ success: boolean; data: Post }>(`/api/abx/blogs/${idOrSlug}`);
}

export async function getBlogsStatus(status: string) {
  return getJson<{ success: boolean; data: Post[]} >(
    `/api/abx/blogs?status=${status}`
  );
}

export async function createBlog(blog: Partial<Post>) {
  return postJson<{ success: boolean; data: Post }>(`/api/abx/blogs`, blog);
}

export async function updateBlog(id: string, blog: Partial<Post>) {
  return putJson<{ success: boolean; data: Post }>(`/api/abx/blogs/${id}`, blog);
}

export async function deleteBlog(id: string) {
  return deleteJson<{ success: boolean; data: { deleted: boolean } }>(`/api/abx/blogs/${id}`);
}

export async function publishBlog(id: string) {
  return patchJson<{ success: boolean; data: Post }>(`/api/abx/blogs/${id}/publish`, {});
}

export async function unpublishBlog(id: string) {
  return patchJson<{ success: boolean; data: Post }>(`/api/abx/blogs/${id}/unpublish`, {});
}

export async function uploadBlogImage(file: File) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetchWithTimeout(`${BACKEND}/api/abx/blogs/upload-image`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    timeoutMs: DEFAULT_TIMEOUT_MS,
  });

  const data = await parseJsonSafe(res);

  if (data && typeof data === 'object' && (data as any).ok === false) {
    const msg = ensureErrorMessage(data, 'Image upload failed');
    throw new Error(msg);
  }

  if (!res.ok) {
    const msg = ensureErrorMessage(
      data,
      `HTTP ${res.status} ${res.statusText || 'Image upload failed'}`
    );
    throw new Error(msg);
  }

  return data as { success: boolean; data: { url: string } };
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


// src/lib/api.ts
// Single source of truth for all marketing-dashboard API calls.
// Both Cruises.tsx and Holidays.tsx import from here.

//const BACKEND = import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:8080";
const BASE = `${BACKEND}/api/abx`;

// ─── Shared helpers ────────────────────────────────────────────────────────────

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return (json.data ?? json) as T;
}

async function sendForm<T>(
  method: "POST" | "PUT",
  path: string,
  fields: Record<string, string | number | boolean>,
  imageFile?: File,
  imageFieldName = "image"
): Promise<T> {
  const body = new FormData();
  for (const [k, v] of Object.entries(fields)) {
    body.append(k, String(v));
  }
  if (imageFile) body.append(imageFieldName, imageFile);

  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include",
    body,
  });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return (json.data ?? json) as T;
}

async function del(path: string): Promise<void> {
  const res = await fetch(`${BASE}${path}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error(await res.text());
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CruiseScope = "International" | "Domestic";
export type HolidayScope = "International" | "Domestic";
export type FrontpageScope = "VISAS" | "HOLIDAYS" | "STOPOVER" | "CRUISES" | "OFFERS" | "BLOGS" | "FLIGHTS" | "HOTELS";
export type OfferType =
  | "Hotel"
  | "Flight"
  | "Tour"
  | "Transfer"
  | "Activity"
  | "Package"
  | "Other";




  export interface Cruise {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  scope: CruiseScope;
  trending: boolean;
  active: boolean;
  image: string;
  href: string;
}

export interface Holiday {
  id: string;
  title: string;
  subtitle: string;
  price: number;
  scope: HolidayScope;
  trending: boolean;
  active: boolean;
  image: string;
  href: string;
}

export interface Offer {
  id: string;
  type: OfferType;
  title: string;
  subtitle: string;
  img: string;
  active: boolean;
}

export interface Frontpage{
  id: string;
  title:string;
  subtitle:string;
  scope:FrontpageScope;
  tag_one:string;
  tag_two:string;
  trending:boolean;
  active:boolean;
  image:string;
  href:string;
  extra_info?:string;

}

// ─── Raw shape returned by MongoDB (uses _id) ─────────────────────────────────

type RawCruise = Omit<Cruise, "id"> & { _id: string };
type RawHoliday = Omit<Holiday, "id"> & { _id: string };
type RawOffer = Omit<Offer, "id"> & { _id: string };
type RawFrontpage = Omit<Frontpage, "id"> & { _id: string };

function normalizeCruise(r: RawCruise): Cruise {
  return { ...r, id: r._id };
}
function normalizeHoliday(r: RawHoliday): Holiday {
  return { ...r, id: r._id };
}
function normalizeOffer(r: RawOffer): Offer {
  return { ...r, id: r._id };
}
function normalizeFrontpage(r: RawFrontpage): Frontpage {
  return { ...r, id: r._id };
}

// ─── Cruise API ────────────────────────────────────────────────────────────────

export async function getCruises(): Promise<Cruise[]> {
  const raw = await get<RawCruise[]>("/cruises");
  return raw.map(normalizeCruise);
}

export async function createCruise(
  payload: Omit<Cruise, "id">,
  imageFile: File
): Promise<Cruise> {
  const { image: _image, ...fields } = payload;
  const raw = await sendForm<RawCruise>("POST", "/cruises", fields, imageFile, "image");
  return normalizeCruise(raw);
}

export async function updateCruise(
  id: string,
  payload: Omit<Cruise, "id">,
  imageFile?: File
): Promise<Cruise> {
  const { image, ...rest } = payload;
  // Only drop image URL if we're uploading a new file; otherwise send it along
  const fields = imageFile ? rest : { ...rest, image };
  const raw = await sendForm<RawCruise>("PUT", `/cruises/${id}`, fields, imageFile, "image");
  return normalizeCruise(raw);
}

export async function deleteCruise(id: string): Promise<void> {
  return del(`/cruises/${id}`);
}

// ─── Holiday API ───────────────────────────────────────────────────────────────

export async function getHolidays(): Promise<Holiday[]> {
  const raw = await get<RawHoliday[]>("/holidays");
  return raw.map(normalizeHoliday);
}

export async function createHoliday(
  payload: Omit<Holiday, "id">,
  imageFile: File
): Promise<Holiday> {
  const { image: _image, ...fields } = payload;
  const raw = await sendForm<RawHoliday>("POST", "/holidays", fields, imageFile, "image");
  return normalizeHoliday(raw);
}

export async function updateHoliday(
  id: string,
  payload: Omit<Holiday, "id">,
  imageFile?: File
): Promise<Holiday> {
  const { image, ...rest } = payload;
  const fields = imageFile ? rest : { ...rest, image };
  const raw = await sendForm<RawHoliday>("PUT", `/holidays/${id}`, fields, imageFile, "image");
  return normalizeHoliday(raw);
}

export async function deleteHoliday(id: string): Promise<void> {
  return del(`/holidays/${id}`);
}

// ─── Offer API ─────────────────────────────────────────────────────────────────

export async function getOffers(): Promise<Offer[]> {
  const raw = await get<RawOffer[]>("/offers");
  return raw.map(normalizeOffer);
}

export async function createOffer(
  payload: Omit<Offer, "id">,
  imageFile: File
): Promise<Offer> {
  const { img: _img, ...fields } = payload;
  const raw = await sendForm<RawOffer>("POST", "/offers", fields, imageFile, "img");
  return normalizeOffer(raw);
}

export async function updateOffer(
  id: string,
  payload: Omit<Offer, "id">,
  imageFile?: File
): Promise<Offer> {
  const { img, ...rest } = payload;
  const fields = imageFile ? rest : { ...rest, img };
  const raw = await sendForm<RawOffer>("PUT", `/offers/${id}`, fields, imageFile, "img");
  return normalizeOffer(raw);
}

export async function deleteOffer(id: string): Promise<void> {
  return del(`/offers/${id}`);
}

// ─── Frontpage API ─────────────────────────────────────────────────────────────────
export async function getFrontpage() {
  const raw = await get<RawFrontpage[]>("/frontpage");
  return raw.map(normalizeFrontpage);

}

export async function createFrontpage(
  payload: Omit<Frontpage, "id">,
  imageFile: File
): Promise<Frontpage> {
  const { image: _image, ...fields } = payload;
  const raw = await sendForm<RawFrontpage>("POST", "/frontpage", fields, imageFile, "image");
  return normalizeFrontpage(raw);
}

export async function updateFrontpage(
  id: string,
  payload: Omit<Frontpage, "id">,
  imageFile?: File  
): Promise<Frontpage> {
  const { image, ...rest } = payload;
  const fields = imageFile ? rest : { ...rest, image };
  const raw = await sendForm<RawFrontpage>("PUT", `/frontpage/${id}`, fields, imageFile, "image");
  return normalizeFrontpage(raw);
}

export async function deleteFrontpage(id: string): Promise<void> {
  return del(`/frontpage/${id}`);
}

// ─── Callback Request API ──────────────────────────────────────────────────────
// Add these imports at the top of api.ts (alongside your existing model imports):
// import type { CallbackRequestPayload, CallbackRequestResponse } from "../models/request.model";
// import { buildCallbackPayload } from "../models/request.model";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type CallbackStatus = "pending" | "contacted" | "resolved";

export interface CallbackRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  submittedAt: string;
  source: string;
  status: CallbackStatus;
  createdAt: string;
}



// ─── Raw shape returned by MongoDB (uses _id) ─────────────────────────────────

type RawCallbackRequest = Omit<CallbackRequest, "id"> & { _id: string };

function normalizeCallbackRequest(r: RawCallbackRequest): CallbackRequest {
  return { ...r, id: r._id };
}

// ─── Callback Request API ─────────────────────────────────────────────────────

export interface CallbackRequestForm {
  name: string;
  email: string;
  phone: string;
}

export interface CallbackRequestResponse {
  success: boolean;
  message: string;
  requestId?: string;
}

export async function getCallbackRequests(): Promise<CallbackRequest[]> {
  const raw = await get<RawCallbackRequest[]>("/requests");
  return raw.map(normalizeCallbackRequest);
}

export async function createCallbackRequest(
  form: CallbackRequestForm,
  source: string = "footer"
): Promise<CallbackRequestResponse> {
  return postJson<CallbackRequestResponse>("/api/abx/requests", {
    ...form,
    name: form.name.trim(),
    email: form.email.trim().toLowerCase(),
    phone: form.phone.trim(),
    submittedAt: new Date().toISOString(),
    source,
  });
}

export async function deleteCallbackRequest(id: string): Promise<void> {
  return del(`/requests/${id}`);
}



// ─── Types ────────────────────────────────────────────────────────────────────

export type TripBudgetRange = "under-1L" | "1L-2L" | "2L-5L" | "5L-plus";

export type TripTravelMonth =
  | "January" | "February" | "March" | "April"
  | "May" | "June" | "July" | "August"
  | "September" | "October" | "November" | "December";

export interface TripInquiry {
  id: string;
  destination: string;
  departureCity: string;
  budget: TripBudgetRange;
  month: TripTravelMonth;
  travelers: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Raw shape returned by MongoDB (uses _id) ─────────────────────────────────

type RawTripInquiry = Omit<TripInquiry, "id"> & { _id: string };

function normalizeTripInquiry(r: RawTripInquiry): TripInquiry {
  return { ...r, id: r._id };
}

// ─── Trip Inquiry Form (matches your Home_Holiday form fields) ────────────────

export interface TripInquiryForm {
  destination: string;
  departureCity: string;
  budget: TripBudgetRange;
  month: TripTravelMonth;
  travelers: number;
}

export interface TripInquiryResponse {
  success: boolean;
  message: string;
  inquiryId?: string;
}

// ─── Trip Inquiry API ─────────────────────────────────────────────────────────

export async function createTripInquiry(
  form: TripInquiryForm
): Promise<TripInquiryResponse> {
  return postJson<TripInquiryResponse>("/api/abx/tripenquiry", {
    ...form,
    destination: form.destination.trim(),
    departureCity: form.departureCity.trim(),
  });
}

export async function getTripInquiries(): Promise<TripInquiry[]> {
  const raw = await get<RawTripInquiry[]>("/tripenquiry");
  return raw.map(normalizeTripInquiry);
}

export async function deleteTripInquiry(id: string): Promise<void> {
  return del(`/tripenquiry/${id}`);
}


// ─── Country Enquiry Types ────────────────────────────────────────────────────

export interface CountryEnquiry {
    id: string;
    name: string;
    email: string;
    teamSize: number;
    date: string;
    note?: string;
    createdAt: string;
    updatedAt: string;
}

type RawCountryEnquiry = Omit<CountryEnquiry, "id"> & { _id: string };

function normalizeCountryEnquiry(r: RawCountryEnquiry): CountryEnquiry {
    return { ...r, id: r._id };
}

export interface CountryEnquiryForm {
    name: string;
    email: string;
    teamSize: number;
    date: string;
    note?: string;
}

export interface CountryEnquiryResponse {
    success: boolean;
    message: string;
    enquiryId?: string;
}

// ─── Country Enquiry API ──────────────────────────────────────────────────────

export async function createCountryEnquiry(
    form: CountryEnquiryForm
): Promise<CountryEnquiryResponse> {
    return postJson<CountryEnquiryResponse>("/api/abx/countryenquiry", {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
    });
}

export async function getCountryEnquiries(): Promise<CountryEnquiry[]> {
    const raw = await get<RawCountryEnquiry[]>("/countryenuiry");
    return raw.map(normalizeCountryEnquiry);
}

export async function deleteCountryEnquiry(id: string): Promise<void> {
    return del(`/countryenquiry/${id}`);
}


// ─── Types ────────────────────────────────────────────────────────────────────
// Add to your existing lib/api.ts

export interface HomeCarousel {
  id: string;
  name: string;
  image: string;
}

type RawHomeCarousel = Omit<HomeCarousel, "id"> & { _id: string };

// ─── Normalizer ───────────────────────────────────────────────────────────────

function normalizeHomeCarousel(r: RawHomeCarousel): HomeCarousel {
  return { ...r, id: r._id };
}

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getHomeCarousels(): Promise<HomeCarousel[]> {
  const raw = await get<RawHomeCarousel[]>("/homeCarousel");
  return raw.map(normalizeHomeCarousel);
}

export async function createHomeCarousel(
  payload: Omit<HomeCarousel, "id">,
  imageFile: File
): Promise<HomeCarousel> {
  const { image: _image, ...fields } = payload;
  const raw = await sendForm<RawHomeCarousel>("POST", "/homeCarousel", fields, imageFile, "image");
  return normalizeHomeCarousel(raw);
}

export async function updateHomeCarousel(
  id: string,
  payload: Omit<HomeCarousel, "id">,
  imageFile?: File
): Promise<HomeCarousel> {
  const { image, ...rest } = payload;
  // Only drop image URL if we're uploading a new file; otherwise send it along
  const fields = imageFile ? rest : { ...rest, image };
  const raw = await sendForm<RawHomeCarousel>("PUT", `/homeCarousel/${id}`, fields, imageFile, "image");
  return normalizeHomeCarousel(raw);
}

export async function deleteHomeCarousel(id: string): Promise<void> {
  return del(`/homeCarousel/${id}`);
}
/* ------------------------------------------------------------------ */
/* Inquiries API                                                      */
/* ------------------------------------------------------------------ */

export type InquiryPayload = {
  name: string;
  email?: string;
  phone: string;
  destination?: string;
  departureCity?: string;
  budget?: string;
  month?: string;
  travelers?: number;
  formType: "hero" | "holiday" | "general";
};

export async function submitInquiry(payload: InquiryPayload) {
  return postJson<{ ok: boolean; message: string; data: any }>(
    "/api/v1/inquiries",
    payload
  );
}
