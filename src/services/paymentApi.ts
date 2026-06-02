/**
 * Hotel Razorpay payment APIs — mirrors hotelApi.ts envelope and fetch pattern.
 */

import { getBackendOrigin } from '../lib/backendOrigin';

const BASE = getBackendOrigin();
const TIMEOUT_MS = 60_000;

async function parseJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function extractError(data: unknown, fallback: string): string {
  const d = data as { error?: string; message?: string } | null;
  if (typeof d?.error === 'string' && d.error.trim()) return d.error;
  if (typeof d?.message === 'string' && d.message.trim()) return d.message;
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

    if (data && typeof data === 'object' && (data as { ok?: boolean }).ok === false) {
      throw new Error(extractError(data, 'Request failed'));
    }

    if (!res.ok) {
      throw new Error(
        extractError(data, `HTTP ${res.status} ${res.statusText}`.trim())
      );
    }

    return data as T;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${TIMEOUT_MS / 1000}s`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

function post<T>(path: string, body: unknown) {
  return request<T>('POST', path, body);
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateHotelPaymentOrderParams {
  /** Total fare in INR (rupees, not paise). */
  amount: number;
  bookingCode: string;
  traceId: string;
  hotelName?: string;
  currency?: string;
}

export interface CreateFlightPaymentOrderParams {
  /** Total fare in INR (rupees, not paise). */
  amount: number;
  bookingCode: string;
  traceId: string;
  flightRoute: string;
  flightDate?: string;
  passengerCount?: number;
  currency?: string;
}

export interface HotelPaymentOrderData {
  orderId: string;
  amount: number;
  amountInr: number;
  currency: string;
  keyId: string;
  receipt: string | null;
  bookingCode: string;
  traceId: string;
  status: string;
  notes?: Record<string, string>;
}

export interface CreateHotelPaymentOrderResponse {
  ok: boolean;
  data: HotelPaymentOrderData;
}

export interface VerifyHotelPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyHotelPaymentData {
  verified: boolean;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  message: string;
}

export interface VerifyHotelPaymentResponse {
  ok: boolean;
  data: VerifyHotelPaymentData;
}

// ─── API functions ────────────────────────────────────────────────────────────

/**
 * POST /api/v1/payments/hotel/order
 * amount — INR rupees (backend converts to paise for Razorpay).
 */
export async function createHotelPaymentOrder(
  params: CreateHotelPaymentOrderParams
): Promise<HotelPaymentOrderData> {
  const res = await post<CreateHotelPaymentOrderResponse>(
    '/api/v1/payments/hotel/order',
    {
      amount: params.amount,
      bookingCode: params.bookingCode,
      traceId: params.traceId,
      ...(params.hotelName ? { hotelName: params.hotelName } : {}),
      ...(params.currency ? { currency: params.currency } : {}),
    }
  );
  return res.data;
}

export async function createFlightPaymentOrder(
  params: CreateFlightPaymentOrderParams
): Promise<HotelPaymentOrderData> {
  const res = await post<CreateHotelPaymentOrderResponse>(
    '/api/v1/payments/flight/order',
    {
      amount: params.amount,
      bookingCode: params.bookingCode,
      traceId: params.traceId,
      flightRoute: params.flightRoute,
      ...(params.flightDate ? { flightDate: params.flightDate } : {}),
      ...(typeof params.passengerCount === 'number' ? { passengerCount: params.passengerCount } : {}),
      ...(params.currency ? { currency: params.currency } : {}),
    }
  );
  return res.data;
}

/**
 * POST /api/v1/payments/hotel/verify
 */
export async function verifyHotelPayment(
  params: VerifyHotelPaymentParams
): Promise<VerifyHotelPaymentData> {
  const res = await post<VerifyHotelPaymentResponse>(
    '/api/v1/payments/hotel/verify',
    params
  );
  return res.data;
}

export async function verifyFlightPayment(
  params: VerifyHotelPaymentParams
): Promise<VerifyHotelPaymentData> {
  const res = await post<VerifyHotelPaymentResponse>(
    '/api/v1/payments/flight/verify',
    params
  );
  return res.data;
}
