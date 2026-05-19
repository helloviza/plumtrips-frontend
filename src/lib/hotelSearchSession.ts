/** Max age for reusing search traceId / room BookingCode before prebook/book (TBO session drift). */
export const HOTEL_TRACE_CHAIN_MAX_MS = Number(
  import.meta.env.VITE_HOTEL_TRACE_TTL_MS ?? 20 * 60 * 1000
);

export function isHotelSearchTraceExpired(
  traceId: string | null | undefined,
  issuedAt: number | null | undefined
): boolean {
  if (!traceId?.trim()) return true;
  if (issuedAt == null || !Number.isFinite(issuedAt)) return true;
  return Date.now() - issuedAt > HOTEL_TRACE_CHAIN_MAX_MS;
}
