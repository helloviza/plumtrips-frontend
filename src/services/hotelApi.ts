/**
 * src/services/hotelApi.ts
 *
 * Single source of truth for all hotel-related backend API calls.
 * Base URL matches auth and the rest of the app (see getBackendOrigin).
 * All requests include credentials: "include" for cookie-based auth.
 *
 * Backend response envelope: { ok: boolean, data?: any, error?: string }
 */

import { getBackendOrigin } from '../lib/backendOrigin';

const BASE = getBackendOrigin();
const TIMEOUT_MS = 120_000; // 2 min for slow hotel APIs

// ─── Low-level helpers ────────────────────────────────────────────────────────

async function parseJson(res: Response): Promise<any> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function extractError(data: any, fallback: string): string {
  if (typeof data?.error === 'string' && data.error.trim()) return data.error;
  if (typeof data?.message === 'string' && data.message.trim()) return data.message;
  return fallback;
}

async function request<T>(
  method: 'GET' | 'POST',
  path: string,
  body?: unknown
): Promise<T> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      signal: ctrl.signal,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

    const data = await parseJson(res);

    // Backend returns { ok: false, error: "..." } even on 200
    if (data && data.ok === false) {
      throw new Error(extractError(data, 'Request failed'));
    }

    if (!res.ok) {
      throw new Error(
        extractError(data, `HTTP ${res.status} ${res.statusText}`.trim())
      );
    }

    return data as T;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error(`Request timed out after ${TIMEOUT_MS / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function get<T>(path: string) {
  return request<T>('GET', path);
}

function post<T>(path: string, body: unknown) {
  return request<T>('POST', path, body);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TboCity {
  Code: string;
  Name: string;
  CountryCode: string;
}

export interface TboCountry {
  Code: string;
  Name: string;
}

export interface CitySearchResponse {
  ok: boolean;
  data: { CityList: TboCity[] };
}

export interface CityHotelsResponse {
  ok: boolean;
  data: string[]; // array of hotel codes
}

export interface HotelSearchParams {
  hotelCodes: string;       // comma-separated, max 100
  checkIn: string;          // YYYY-MM-DD
  checkOut: string;         // YYYY-MM-DD
  rooms: number;            // 1-9
  adults: number;           // 1-8
  children?: number;        // 0-4
  childrenAges?: number[];  // required if children > 0, each 0-18
  nationality?: string;     // 2-letter ISO, default "IN"
  /** Optional; server generates if omitted. Same id must be used for prebook/book for this itinerary. */
  traceId?: string;
}

export interface HotelResult {
  BookingCode: string;
  HotelCode: string;
  HotelName: string;
  StarRating: number;
  HotelAddress: string;
  HotelPicture?: string;
  Images?: string[];
  HotelFacilities?: string[];
  MealType?: string;
  IsFreeCancellation?: boolean;
  Price?: {
    OfferedPriceRoundedOff?: number;
    PublishedPriceRoundedOff?: number;
    Tax?: number;
    OtherCharges?: number;
  };
  Rooms?: any[];
  [key: string]: any;
}

export interface HotelSearchResponse {
  ok: boolean;
  /** Merged TBO payload: HotelResult[], traceId, Status, etc. */
  data: any;
}

/** Normalised outcome of POST /hotels/search */
export interface HotelSearchOutcome {
  hotelResults: HotelResult[];
  /** From merged `data.traceId` / `data.TraceId` after search; required for prebook/book. */
  traceId: string | null;
}

export interface StaticDetailsParams {
  hotelCodes: string | string[];
}

export interface StaticHotelDetail {
  HotelCode: string;
  HotelName?: string;
  Description?: string;
  StarRating?: number;
  Images?: Array<{ Url?: string; url?: string } | string>;
  HotelFacilities?: Array<string | { Name?: string }>;
  [key: string]: any;
}

export interface StaticDetailsResponse {
  ok: boolean;
  data: StaticHotelDetail[];
}

export interface PreBookParams {
  bookingCode: string;
  /** Same traceId returned from search for this itinerary (required). */
  traceId: string;
}

export interface PreBookResult {
  BookingCode: string;
  NetAmount: number;
  IsPackageFare?: boolean;
  IsPackageDetailsMandatory?: boolean;
  CancellationPolicy?: string;
  IsPriceChanged?: boolean;
  [key: string]: any;
}

export interface PreBookResponse {
  ok: boolean;
  data: PreBookResult;
}

export interface BookGuest {
  title: 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Mstr';
  firstName: string;
  middleName?: string;
  lastName: string;
  paxType: 1 | 2;       // 1=Adult, 2=Child
  leadGuest: boolean;
  age?: number;          // required for children, 1-12
  pan?: string;          // required for international bookings
}

export interface BookParams {
  bookingCode: string;
  /** Same traceId as search and prebook for this booking (required). */
  traceId: string;
  guestNationality: string;
  isVoucherBooking: true;
  /** Must match the last /hotels/search occupancy. */
  rooms: number;
  adults: number;
  children: number;
  guests: BookGuest[];
  contact: { email: string; mobile: string };
  isPackageFare?: boolean;
  isPackageDetailsMandatory?: boolean;
}

export interface BookResult {
  BookingId: string;
  ConfirmationNo: string;
  HotelBookingStatus: string;
  [key: string]: any;
}

export interface BookResponse {
  ok: boolean;
  data: BookResult;
}

export interface BookingDetailResponse {
  ok: boolean;
  data: any;
}

export interface CancelResponse {
  ok: boolean;
  data: any;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * 1. City search — GET /api/v1/hotels/cities?query=<string>
 * Optional countryCode (2-letter ISO) limits to one country; omit for worldwide results.
 */
export async function searchHotelCities(
  query: string,
  countryCode?: string
): Promise<TboCity[]> {
  const params = new URLSearchParams({ query });
  const cc = countryCode?.trim().toUpperCase();
  if (cc && cc !== 'ALL') params.set('countryCode', cc);
  const res = await get<CitySearchResponse>(
    `/api/v1/hotels/cities?${params.toString()}`
  );
  return res?.data?.CityList ?? [];
}

/**
 * 1b. Get all countries — GET /api/v1/hotels/countries
 */
export async function getCountries(): Promise<TboCountry[]> {
  const res = await get<{ ok: boolean; data: any }>('/api/v1/hotels/countries');
  const raw = res?.data;
  if (!raw) return [];
  const list = raw.CountryList || raw.Countries || (raw.Response && raw.Response.CountryList) || [];
  if (!Array.isArray(list)) return [];
  return list.map((c: any) => ({
    Code: String(c.Code || c.CountryCode || c.countryCode || '').trim(),
    Name: String(c.Name || c.CountryName || c.countryName || '').trim()
  })).filter(c => c.Code !== '');
}

/**
 * 2. Hotel codes for a city — POST /api/v1/hotels/city-hotels
 * Returns full hotel objects; we extract HotelCode from each.
 */
export async function getCityHotelCodes(cityCode: string): Promise<string[]> {
  const res = await post<CityHotelsResponse>('/api/v1/hotels/city-hotels', {
    cityCode,
  });
  const raw = res?.data;
  // Response shape: { Hotels: [{ HotelCode, HotelName, ... }] }
  const hotels: any[] = (raw as any)?.Hotels ?? (Array.isArray(raw) ? raw : []);
  return hotels.map((h: any) => String(h.HotelCode)).filter(Boolean);
}

/**
 * 2b. Full hotel list for a city (includes name, address, lat/lng)
 * Same endpoint as getCityHotelCodes but returns the full objects.
 */
export async function getCityHotels(cityCode: string): Promise<any[]> {
  const res = await post<CityHotelsResponse>('/api/v1/hotels/city-hotels', {
    cityCode,
  });
  const raw = res?.data;
  return (raw as any)?.Hotels ?? (Array.isArray(raw) ? raw : []);
}

function pickTraceIdFromSearchData(raw: any): string | null {
  const t =
    raw?.traceId ??
    raw?.TraceId ??
    raw?.data?.traceId ??
    raw?.data?.TraceId;
  if (typeof t === 'string' && t.trim()) return t.trim();
  return null;
}

/**
 * 3. Hotel search — POST /api/v1/hotels/search
 * Response `data` merges TBO fields with `traceId` (same chain for prebook/book).
 */
export async function searchHotels(
  params: HotelSearchParams
): Promise<HotelSearchOutcome> {
  const body: Record<string, unknown> = {
    hotelCodes: params.hotelCodes,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    rooms: params.rooms,
    adults: params.adults,
    nationality: params.nationality ?? 'IN',
  };
  if (params.children !== undefined) body.children = params.children;
  if (params.childrenAges !== undefined) body.childrenAges = params.childrenAges;
  if (params.traceId?.trim()) body.traceId = params.traceId.trim();

  console.log("FRONTEND SENDING SEARCH BODY:", body);

  const res = await post<HotelSearchResponse>('/api/v1/hotels/search', body);
  const raw = res?.data;
  const traceId = pickTraceIdFromSearchData(raw);
  const results: any[] = (raw as any)?.HotelResult ?? (Array.isArray(raw) ? raw : []);
  return { hotelResults: results as HotelResult[], traceId };
}

/**
 * 4. Static details — POST /api/v1/hotels/static-details
 */
export async function getHotelStaticDetails(
  hotelCodes: string | string[]
): Promise<StaticHotelDetail[]> {
  const codesString = Array.isArray(hotelCodes) ? hotelCodes.join(',') : hotelCodes;
  const res = await post<StaticDetailsResponse>('/api/v1/hotels/static-details', {
    hotelCodes: codesString,
  });
  const raw = res?.data;
  return (raw as any)?.HotelDetails ?? (Array.isArray(raw) ? raw : []);
}

/**
 * 5. PreBook — POST /api/v1/hotels/prebook
 */
export async function preBookHotel(params: PreBookParams): Promise<PreBookResult> {
  const res = await post<PreBookResponse>('/api/v1/hotels/prebook', {
    bookingCode: params.bookingCode,
    traceId: params.traceId,
  });
  return res?.data;
}

/**
 * 6. Book — POST /api/v1/hotels/book
 *
 * TBO backend wraps the result in a `BookResult` key:
 *   { ok: true, data: { BookResult: { BookingId, ConfirmationNo, HotelBookingStatus, ... } } }
 * We unwrap it here so callers always get a flat BookResult object.
 */
export async function bookHotel(params: BookParams): Promise<BookResult> {
  // Server re-runs PreBook and sets price — never forward client-computed amounts.
  const body: Record<string, unknown> = {
    traceId: params.traceId,
    bookingCode: params.bookingCode,
    guestNationality: params.guestNationality,
    isVoucherBooking: params.isVoucherBooking,
    rooms: params.rooms,
    adults: params.adults,
    children: params.children ?? 0,
    guests: params.guests,
    contact: params.contact,
  };
  if (params.isPackageFare !== undefined) body.isPackageFare = params.isPackageFare;
  if (params.isPackageDetailsMandatory !== undefined) {
    body.isPackageDetailsMandatory = params.isPackageDetailsMandatory;
  }
  const res = await post<BookResponse>('/api/v1/hotels/book', body);
  const raw: any = res?.data;
  // Unwrap nested BookResult if present
  const inner: any = raw?.BookResult ?? raw;
  return inner as BookResult;
}

/**
 * 7. Booking detail — POST /api/v1/hotels/booking-detail
 */
export async function getBookingDetail(bookingId: string): Promise<any> {
  const res = await post<BookingDetailResponse>(
    '/api/v1/hotels/booking-detail',
    { bookingId }
  );
  return res?.data;
}

/**
 * 8. Cancel — POST /api/v1/hotels/cancel
 */
export async function cancelHotelBooking(
  bookingId: string,
  requestType: 1 | 4 = 1
): Promise<any> {
  const res = await post<CancelResponse>('/api/v1/hotels/cancel', {
    bookingId,
    requestType,
  });
  return res?.data;
}
