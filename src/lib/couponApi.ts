// apps/frontend/src/lib/couponApi.ts
//
// User-facing coupon API only. Deliberately does NOT include admin actions
// (create/update/delete/list-all/get-by-id/get-any-coupon's-usages) — those
// live behind adminAuth on the backend and have no business being callable
// from the public frontend bundle.
//
// IMPORTANT: `userId` is intentionally NOT a parameter anywhere here.
// It must be derived server-side from the authenticated session (cookie/JWT),
// exactly like /api/auth/me does in authApi.ts — never trust a client-supplied
// userId for coupon redemption logic. See the note at the bottom of this file
// for the small backend change this requires.

const BACKEND =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_ORIGIN ||
  "http://localhost:8080";

const COUPON_BASE = "/api/v1/coupons";

/* ------------------------------------------------------------------ */
/* Fetch helpers (mirrors authApi.ts / api.ts conventions)             */
/* ------------------------------------------------------------------ */

async function parseJsonSafe(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function ensureErrorMessage(raw: unknown, fallback: string): string {
  if (typeof raw === "string" && raw.trim()) return raw;
  if (raw && typeof raw === "object") {
    const msg =
      (raw as any).message || (raw as any).error || (raw as any).detail;
    if (typeof msg === "string" && msg.trim()) return msg;
  }
  return fallback;
}

async function request<T>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BACKEND}${path}`, {
    credentials: "include", // sends the httpOnly auth cookie so the backend can resolve the user
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });

  const data = await parseJsonSafe(res);

  if (data && typeof data === "object" && (data as any).success === false) {
    throw new Error(ensureErrorMessage(data, "Request failed"));
  }

  if (!res.ok) {
    const txt = !data ? await res.text().catch(() => "") : "";
    throw new Error(
      ensureErrorMessage(data ?? txt, `HTTP ${res.status} ${res.statusText}`.trim())
    );
  }

  return data as T;
}

const get = <T>(path: string) => request<T>(path, { method: "GET" });
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) });

/* ------------------------------------------------------------------ */
/* Types (mirrors the backend's ApiResponse<T> + service result shapes)*/
/* ------------------------------------------------------------------ */

export type CouponCategory = "FLIGHT" | "HOTEL" | "GENERAL";
export type DiscountType = "PERCENTAGE" | "FLAT";

export interface CouponSummary {
  _id: string;
  code: string;
  description: string;
  category: CouponCategory;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount: number | null;
  minBookingAmount: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  // virtuals
  isExhausted?: boolean;
  remaining?: number;
}

export type CouponReasonCode =
  | "COUPON_NOT_FOUND"
  | "COUPON_INACTIVE"
  | "COUPON_NOT_YET_STARTED"
  | "COUPON_EXPIRED"
  | "COUPON_EXHAUSTED"
  | "CATEGORY_MISMATCH"
  | "MIN_BOOKING_AMOUNT_NOT_MET"
  | "USER_LIMIT_REACHED"
  | "OK";

interface ApiEnvelope<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
}

/* ---------- validate (dry run, does not consume a redemption) ---------- */

export interface ValidateCouponBody {
  code: string;
  category: CouponCategory;
  bookingAmount: number;
}

export interface ValidateCouponResult {
  eligible: boolean;
  reasonCode: CouponReasonCode;
  discountAmount: number;
  finalAmount: number;
  coupon: CouponSummary | null;
}

/* ---------- apply (actually redeems the coupon) ---------- */

export interface ApplyCouponBody extends ValidateCouponBody {
  bookingId?: string;
}

export interface CouponUsageRecord {
  _id: string;
  coupon: string;
  couponCode: string;
  userId: string;
  bookingId: string | null;
  bookingAmount: number;
  discountApplied: number;
  finalAmount: number;
  category: string;
  usedAt: string;
}

export interface ApplyCouponResult {
  discountAmount: number;
  finalAmount: number;
  coupon: CouponSummary;
  usage: CouponUsageRecord;
}

/* ------------------------------------------------------------------ */
/* couponApi — the only entry point the frontend should import        */
/* ------------------------------------------------------------------ */

export const couponApi = {
  /**
   * Dry-run check: is this coupon usable right now, by the logged-in user,
   * for this category/amount? Never consumes a redemption. Use this to
   * drive an "Apply" button's enabled state and to preview the discount.
   */
  validate: (body: ValidateCouponBody) =>
    post<ApiEnvelope<ValidateCouponResult>>(`${COUPON_BASE}/validate`, body).then(
      (r) => r.data
    ),

  /**
   * Actually redeems the coupon. Call this only at final booking
   * confirmation, not on every keystroke/render.
   */
  apply: (body: ApplyCouponBody) =>
    post<ApiEnvelope<ApplyCouponResult>>(`${COUPON_BASE}/apply`, body).then(
      (r) => r.data
    ),

  /**
   * Public lookup by code — e.g. to render a coupon banner/details before
   * the user has entered a booking amount. Does not require auth.
   */
  getByCode: (code: string) =>
    get<ApiEnvelope<CouponSummary>>(`${COUPON_BASE}/code/${encodeURIComponent(code)}`).then(
      (r) => r.data
    ),

  /**
   * The logged-in user's own redemption history.
   * Requires the backend route to resolve the user from the session
   * rather than trusting an :userId path param (see note below).
   */
  getMyUsageHistory: () =>
    get<ApiEnvelope<CouponUsageRecord[]>>(`${COUPON_BASE}/usage/me`).then(
      (r) => r.data
    ),
};