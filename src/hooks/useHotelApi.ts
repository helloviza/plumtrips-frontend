/**
 * src/hooks/useHotelApi.ts
 *
 * React hooks and helpers that wrap src/services/hotelApi.ts.
 *
 * Actual API response shapes (confirmed from backend):
 *
 * POST /city-hotels → { ok, data: { Hotels: [{ HotelCode, HotelName, Address, CityName, HotelRating, Latitude, Longitude }] } }
 * POST /search      → { ok, data: { HotelResult: [...], traceId, ... } }  (traceId required for prebook/book chain)
 * POST /static-details → { ok, data: [...] }  (optional enrichment)
 */

import { useState, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  searchHotelCities,
  getCityHotels,
  searchHotels,
  searchHotelsStream,
  getHotelStaticDetails,
  preBookHotel,
  bookHotel,
  getBookingDetail,
  cancelHotelBooking,
  getHotelVoucher,
  type TboCity,
  type StaticHotelDetail,
  type PreBookResult,
  type BookParams,
  type BookResult,
} from '../services/hotelApi';
import type { Hotel, Room, PreBookResponse, CancelPolicySlab } from '../stores/hotelStore';

function mapPolicy(p: any, fallbackCurrency: string = 'INR'): CancelPolicySlab {
  const rawChargeValue =
    p?.CancellationCharge ??
    p?.Charge ??
    p?.charge ??
    p?.Amount ??
    p?.PenaltyAmount ??
    p?.ChargeAmount ??
    p?.Percentage ??
    p?.value ??
    p?.Value ??
    0;

  let rawType = p?.ChargeType ?? p?.chargeType;
  let chargeType = 0;
  if (typeof rawType === 'string') {
    const lower = rawType.toLowerCase();
    if (lower === 'percentage') chargeType = 2;
    else if (lower === 'fixed') chargeType = 1;
    else if (lower === 'night') chargeType = 3;
    else chargeType = Number(rawType) || 0;
  } else {
    chargeType = Number(rawType ?? 0);
  }

  const currencyValue = String(p?.Currency ?? p?.currency ?? fallbackCurrency);
  const rawFromDate = p?.FromDate ?? p?.fromDate;
  const rawToDate = p?.ToDate ?? p?.toDate;
  const rawCharge = Number(rawChargeValue);

  return {
    charge: rawCharge,
    chargeType,
    currency: currencyValue,
    fromDate: rawFromDate,
    toDate: rawToDate,
    remarks: p?.Remarks ?? p?.remarks,
    FromDate: rawFromDate,
    ToDate: rawToDate,
    ChargeType: rawType,
    CancellationCharge: rawCharge,
    Currency: currencyValue,
  };
}

function findPolicies(obj: any, fallbackCurrency: string = 'INR'): CancelPolicySlab[] {
  if (!obj || typeof obj !== 'object') return [];
  
  const curr = obj.Currency || obj.currency || fallbackCurrency;
  
  if (Array.isArray(obj.CancelPolicies)) return obj.CancelPolicies.map((p: any) => mapPolicy(p, curr));
  if (Array.isArray(obj.cancellationPolicies)) return obj.cancellationPolicies.map((p: any) => mapPolicy(p, curr));
  if (Array.isArray(obj.CancellationPolicies)) return obj.CancellationPolicies.map((p: any) => mapPolicy(p, curr));
  if (Array.isArray(obj.CancelPolicy)) return obj.CancelPolicy.map((p: any) => mapPolicy(p, curr));
  if (Array.isArray(obj.cancellationPolicy)) return obj.cancellationPolicy.map((p: any) => mapPolicy(p, curr));
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const result = findPolicies(obj[key], curr);
      if (result.length > 0) return result;
    }
  }
  return [];
}

function findCancellationString(obj: any): string | null {
  if (!obj || typeof obj !== 'object') return null;
  const keys = ['CancellationPolicy', 'cancellationPolicy', 'CancelPolicy', 'cancelPolicy'];
  for (const k of keys) {
    if (typeof obj[k] === 'string' && obj[k].trim() !== '') {
      return obj[k].trim();
    }
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const result = findCancellationString(obj[key]);
      if (result) return result;
    }
  }
  return null;
}

function findCancellationDeadline(obj: any): string | null {
  if (!obj || typeof obj !== 'object') return null;
  const keys = ['FreeCancellationUntil', 'freeCancellationUntil', 'LastCancellationDate', 'lastCancellationDate', 'LastCancellationDeadline', 'lastCancellationDeadline'];
  for (const k of keys) {
    if (typeof obj[k] === 'string' && obj[k].trim() !== '') {
      return obj[k].trim();
    }
    if (obj[k] instanceof Date && !isNaN(obj[k].getTime())) {
      return obj[k].toISOString();
    }
    if (typeof obj[k] === 'number' && Number.isFinite(obj[k])) {
      return new Date(obj[k]).toISOString();
    }
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const result = findCancellationDeadline(obj[key]);
      if (result) return result;
    }
  }
  return null;
}

function safeFormatDate(dStr: string | null | undefined): string | null {
  if (!dStr) return null;
  try {
    let parseStr = dStr.trim();

    const ddmmyyyy = dStr.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(.*))?$/);
    if (ddmmyyyy) {
      const time = ddmmyyyy[4] ? 'T' + ddmmyyyy[4] : '';
      parseStr = `${ddmmyyyy[3]}-${ddmmyyyy[2]}-${ddmmyyyy[1]}${time}`;
    }

    const ddmmyyyySlash = dStr.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(.*))?$/);
    if (ddmmyyyySlash) {
      const time = ddmmyyyySlash[4] ? 'T' + ddmmyyyySlash[4] : '';
      parseStr = `${ddmmyyyySlash[3]}-${ddmmyyyySlash[2]}-${ddmmyyyySlash[1]}${time}`;
    }

    const yyyymmdd = dStr.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(.*))?$/);
    if (yyyymmdd) {
      const time = yyyymmdd[4] ? 'T' + yyyymmdd[4] : '';
      parseStr = `${yyyymmdd[1]}-${yyyymmdd[2]}-${yyyymmdd[3]}${time}`;
    }

    const d = new Date(parseStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
}

export function parsePolicyDate(dStr: string | null | undefined): Date | null {
  if (!dStr) return null;
  try {
    let year: number, month: number, day: number;
    // DD-MM-YYYY [HH:MM:SS] — TBO format
    const ddmmyyyy = dStr.match(/^(\d{2})-(\d{2})-(\d{4})(?:\s+(.*))?$/);
    if (ddmmyyyy) {
      day   = Number(ddmmyyyy[1]);
      month = Number(ddmmyyyy[2]) - 1;
      year  = Number(ddmmyyyy[3]);
      // Parse as local midnight to avoid UTC→local shift
      return new Date(year, month, day);
    }
    // YYYY-MM-DD — parse as local midnight
    const yyyymmdd = dStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (yyyymmdd) {
      year  = Number(yyyymmdd[1]);
      month = Number(yyyymmdd[2]) - 1;
      day   = Number(yyyymmdd[3]);
      return new Date(year, month, day);
    }
    // Fallback
    const d = new Date(dStr);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function parseCheckInDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  // Always parse as local midnight (no timezone shift) to avoid off-by-one
  // when converting between UTC and local time (e.g. IST +5:30).
  if (date instanceof Date) {
    if (isNaN(date.getTime())) return null;
    // Re-parse from the local date components to strip any UTC offset
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
  // String: try YYYY-MM-DD first (split to avoid UTC parsing)
  const iso = String(date).split('T')[0];
  const parts = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (parts) {
    return new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]));
  }
  return parsePolicyDate(date);
}

export function formatPolicyDate(dStr: string | null | undefined): string {
  const d = parsePolicyDate(dStr);
  if (!d) return String(dStr || '');
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatPolicyDateFromDate(d: Date | null): string | null {
  if (!d) return null;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function sortCancelPolicies(policies: CancelPolicySlab[] = []): CancelPolicySlab[] {
  return [...policies].sort((a, b) => {
    const aDate = parsePolicyDate(a.fromDate ?? a.toDate ?? '');
    const bDate = parsePolicyDate(b.fromDate ?? b.toDate ?? '');
    if (aDate && bDate) return aDate.getTime() - bDate.getTime();
    if (aDate) return -1;
    if (bDate) return 1;
    return 0;
  });
}

export function getCancellationPolicyDisplay(
  cancelPolicies: CancelPolicySlab[] | undefined,
  cancellationPolicy: string | undefined,
  isRefundable: boolean | undefined,
  checkInDate?: Date | string | null,
  seed?: string
) {
  const policies = sortCancelPolicies(cancelPolicies ?? []);
  const normalizedText = typeof cancellationPolicy === 'string' && cancellationPolicy.trim() ? cancellationPolicy.trim() : null;
  const isNonRefundable = isRefundable === false;
  const zeroChargeSlabs = policies.filter((p) => p.charge === 0);
  const penaltySlabs = policies.filter((p) => p.charge > 0);

  const explicitFreeDeadline = zeroChargeSlabs
    .map((p) => p.toDate)
    .map((d) => parsePolicyDate(d))
    .filter(Boolean)[0] ?? null;

  const impliedFreeDeadline = !isNonRefundable && !explicitFreeDeadline && penaltySlabs.length > 0
    ? (() => {
        const firstPenalty = penaltySlabs.find((p) => p.fromDate);
        if (!firstPenalty) return null;
        const date = parsePolicyDate(firstPenalty.fromDate);
        if (!date) return null;
        date.setDate(date.getDate() - 1);
        return date;
      })()
    : null;

  const isPlaceholderPolicy = normalizedText ? /please check hotel cancellation policy/i.test(normalizedText) : false;
  const hasPolicySlabs = policies.length > 0;
  const freeCancellationDeadline = explicitFreeDeadline
    ? formatPolicyDateFromDate(explicitFreeDeadline)
    : impliedFreeDeadline
      ? formatPolicyDateFromDate(impliedFreeDeadline)
      : null;

  let summary: string | null = null;
  if (isNonRefundable) {
    summary = 'Non-Refundable';
  } else if (zeroChargeSlabs.length > 0) {
    summary = freeCancellationDeadline
      ? `Free Cancellation until ${freeCancellationDeadline}`
      : 'Free Cancellation available';
  } else if (freeCancellationDeadline) {
    summary = `Free Cancellation until ${freeCancellationDeadline}`;
  } else if (normalizedText) {
    summary = normalizedText;
  } else if (isRefundable === true) {
    summary = 'Free Cancellation available';
  } else if (isRefundable === false) {
    summary = 'Non-Refundable';
  }

  return {
    summary,
    sortedPolicies: policies,
    freeCancellationDeadline,
    isNonRefundable,
    rawPolicyText: normalizedText,
  };
}

function resolvePolicyChargeType(rawType: any): number {
  if (typeof rawType === 'number' && !isNaN(rawType)) return rawType;
  if (typeof rawType !== 'string') return Number(rawType ?? 0) || 0;
  const lower = rawType.toLowerCase();
  if (lower === 'percentage') return 2;
  if (lower === 'fixed') return 1;
  if (lower === 'night') return 3;
  return Number(rawType) || 0;
}

export function getPolicyChargeAmount(policy: CancelPolicySlab): number {
  const rawCharge = policy.CancellationCharge ?? policy.charge ?? policy.ChargeAmount ?? policy.Amount ?? policy.value ?? policy.Value ?? 0;
  const amount = Number(rawCharge);
  return Number.isFinite(amount) ? amount : 0;
}

export function getPolicyChargeType(policy: CancelPolicySlab): number {
  return resolvePolicyChargeType(policy.ChargeType ?? policy.chargeType ?? policy.type);
}

export function getPolicyChargeCurrency(policy: CancelPolicySlab): string {
  return policy.currency ?? policy.Currency ?? 'INR';
}

export function getPolicyChargeText(policy: CancelPolicySlab): string {
  const amount = getPolicyChargeAmount(policy);
  const type = getPolicyChargeType(policy);
  const currency = getPolicyChargeCurrency(policy);

  if (type === 2) {
    // Percentage charge
    return `${amount}% cancellation charge`;
  }

  // Fixed / night charge — format as currency with symbol
  const symbol = currency === 'INR' ? '₹' : currency;
  const formatted = amount.toLocaleString('en-IN', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted} cancellation charge`;
}

import { useHotelStore } from '../stores/hotelStore';

/** Surfaces backend 400s about missing traceId in a booking-friendly way. */
export function formatHotelTraceApiError(err: unknown, fallback: string): string {
  const msg = err instanceof Error ? err.message : String(err ?? '');
  if (/trace\s*id|traceId/i.test(msg)) {
    return `${msg} Run a fresh hotel search from the results page, then continue your booking with the same dates and room.`;
  }
  return msg.trim() ? msg : fallback;
}

// ─── Star rating parser ───────────────────────────────────────────────────────
// /city-hotels returns strings like "FiveStar", "ThreeStar", "All", etc.
function parseStarRating(ratingStr: string | number | undefined): number {
  if (typeof ratingStr === 'number') return ratingStr;
  if (!ratingStr) return 3;
  const s = String(ratingStr).toLowerCase();
  if (s.includes('5') || s.includes('five')) return 5;
  if (s.includes('4') || s.includes('four')) return 4;
  if (s.includes('3') || s.includes('three')) return 3;
  if (s.includes('2') || s.includes('two')) return 2;
  if (s.includes('1') || s.includes('one')) return 1;
  return 3;
}

// ─── Bed type extractor ───────────────────────────────────────────────────────
function extractBedType(roomName: string): string {
  const lower = roomName.toLowerCase();
  if (lower.includes('king')) return 'King Bed';
  if (lower.includes('queen')) return 'Queen Bed';
  if (lower.includes('twin')) return 'Twin Beds';
  if (lower.includes('double')) return 'Double Bed';
  return 'Standard Bed';
}

// ─── Build images from static details ────────────────────────────────────────
function buildImages(staticDetail?: StaticHotelDetail): string[] {
  const imgs: string[] = [];
  const imagesArray = staticDetail?.Images || (staticDetail as any)?.images;
  if (imagesArray) {
    for (const img of imagesArray) {
      const url = typeof img === 'string' ? img : (img as any)?.Url ?? (img as any)?.url ?? (img as any)?.Picture ?? (img as any)?.picture;
      if (url) imgs.push(url);
    }
  }
  if (imgs.length === 0) return [];
  return imgs;
}

// ─── Build amenities from static details ─────────────────────────────────────
function buildAmenities(staticDetail?: StaticHotelDetail): string[] {
  const raw = staticDetail?.HotelFacilities ?? (staticDetail as any)?.hotelFacilities ?? (staticDetail as any)?.Facilities ?? (staticDetail as any)?.facilities ?? [];
  return (raw as any[])
    .map((a: any) => (typeof a === 'string' ? a : a?.Name ?? a?.name ?? ''))
    .filter(Boolean);
}

// ─── Normalise a hotel card from city-hotels + search + static ───────────────
/**
 * cityHotel  — one entry from /city-hotels Hotels[]
 * searchResult — matching entry from /search HotelResult[] (has Rooms[])
 * staticDetail — optional /static-details entry
 */
function resolveRoomTotalFare(raw: any): number {
  return Number(
    raw?.TotalFare ??
    raw?.Price?.OfferedPriceRoundedOff ??
    raw?.PublishedPriceRoundedOff ??
    raw?.Price?.PublishedPriceRoundedOff ??
    0
  );
}

function resolveRoomTotalTax(raw: any): number {
  return Number(
    raw?.TotalTax ??
    raw?.Price?.Tax ??
    raw?.Price?.OtherCharges ??
    0
  );
}

function parseRoomQuantityValue(value: any): number {
  if (value == null) return 0;
  if (typeof value === 'string') {
    const digits = value.trim().replace(/[^0-9.-]+/g, '');
    const parsed = Number(digits);
    if (Number.isFinite(parsed)) return Math.max(0, Math.round(parsed));
    return 0;
  }
  const num = Number(value);
  return Number.isFinite(num) ? Math.max(0, Math.round(num)) : 0;
}

function resolveRoomQuantity(raw: any): number {
  const candidates = [
    raw?.Quantity,
    raw?.RoomCount,
    raw?.NumberOfRooms,
    raw?.NoOfRooms,
    raw?.RoomQuantity,
    raw?.RoomsCount,
  ];

  for (const value of candidates) {
    const n = parseRoomQuantityValue(value);
    if (n > 0) {
      return Math.max(1, n);
    }
  }

  return 1;
}

function normHotel(
  cityHotel: any,
  searchResult: any,
  staticDetail: StaticHotelDetail | undefined,
  searchTraceId?: string,
  searchedRooms: number = 1
): Hotel {
  const rooms: any[] = searchResult?.Rooms ?? [];

  // Cheapest room drives the card-level price.
  // TBO returns TotalFare as the aggregate for ALL rooms searched.
  // Divide by searchedRooms (not resolveRoomQuantity which always returns 1)
  // to get the per-room price shown on the hotel card.
  const cheapest = rooms.reduce(
    (min: any, r: any) => {
      const fare = resolveRoomTotalFare(r);
      const minFare = resolveRoomTotalFare(min);
      return !min || fare < minFare ? r : min;
    },
    null
  );

  const roomDivisor = Math.max(1, searchedRooms);
  const totalFare = cheapest ? resolveRoomTotalFare(cheapest) : 0;
  const taxes = cheapest ? resolveRoomTotalTax(cheapest) : 0;
  // Divide by searchedRooms to normalise to per-room price
  const perRoomTax = Math.ceil(Math.max(0, taxes / roomDivisor));
  const perRoomTotalFare = Math.ceil(Math.max(0, totalFare / roomDivisor));
  const price = Math.max(0, perRoomTotalFare - perRoomTax);
  const freeCancellation = rooms.some((r: any) => r.IsRefundable === true);
  const mealType: string = cheapest?.MealType ?? '';

  return {
    id: String(cityHotel?.HotelCode ?? cityHotel?.hotelCode ?? ''),
    name: cityHotel?.HotelName ?? cityHotel?.hotelName ?? staticDetail?.HotelName ?? (staticDetail as any)?.hotelName ?? '',
    starRating: parseStarRating(cityHotel?.HotelRating ?? cityHotel?.hotelRating ?? staticDetail?.StarRating ?? (staticDetail as any)?.starRating),
    location: [cityHotel?.Address ?? cityHotel?.address, cityHotel?.CityName ?? cityHotel?.cityName].filter(Boolean).join(', '),
    landmark: cityHotel?.Address ?? '',
    distance: '',
    images: buildImages(staticDetail),
    amenities: buildAmenities(staticDetail),
    description: staticDetail?.Description || staticDetail?.HotelDescription || cityHotel?.Description || `Experience a wonderful stay at ${cityHotel?.HotelName || 'our property'}, offering exceptional service and comfort in the heart of the city.`,
    rating: 0,
    reviewCount: 0,
    price,
    originalPrice: undefined,
    freeCancellation,
    ixigoAssured: false,
    payAtHotel: false,
    propertyType: staticDetail?.HotelCategory ?? 'Hotel',
    checkInTime: '2:00 PM',
    checkOutTime: '12:00 PM',
    isCorporateAllowed: Boolean(searchResult?.isCorporateAllowed || searchResult?.IsCorporateAllowed || cityHotel?.isCorporateAllowed || cityHotel?.IsCorporateAllowed),
    policies: {
      idProof: ['Aadhar Card', 'Passport', 'Driving License'],
      localGuest: 'Local ID accepted',
    },
    nearbyLandmarks: [],
    // Raw fields preserved for room selection / prebook
    _hotelCode: String(cityHotel?.HotelCode ?? ''),
    _mealType: mealType,
    _rooms: rooms,       // raw room array from /search
    _taxes: perRoomTax,  // per-room tax (TBO aggregate divided by quantity)
    _traceId: searchTraceId,
  } as Hotel & {
    _hotelCode: string;
    _mealType: string;
    _rooms: any[];
    _taxes: number;
    _traceId?: string;
  };
}

// ─── Normalise a room from /search Rooms[] ────────────────────────────────────
function mealPlanLabelFromCode(code: string): string {
  const map: Record<string, string> = {
    Room_Only: 'Room only',
    BreakFast: 'Breakfast included',
    Half_Board: 'Half board (breakfast + dinner)',
    Full_Board: 'Full board',
    All_Inclusive: 'All inclusive',
    Lunch: 'Lunch included',
    Dinner: 'Dinner included',
  };
  if (!code) return '';
  return map[code] ?? code.replace(/_/g, ' ');
}

/**
 * /search room shape:
 * { Name: string[], BookingCode, TotalFare, TotalTax, MealType, IsRefundable, Inclusion, ... }
 *
 * TBO returns TotalFare as the aggregate for ALL rooms searched (e.g. rooms=2 → TotalFare
 * is the 2-room total). TBO does NOT return a Quantity field on individual room objects.
 * We must divide by searchedRooms to get the per-room price shown on each room card.
 */
function normRoom(raw: any, index: number, searchedRooms: number = 1): Room {
  const names: string[] = Array.isArray(raw.Name) ? raw.Name : [raw.Name ?? `Room ${index + 1}`];
  const roomName = names[0] ?? `Room ${index + 1}`;
  const roomSubtitle = names
    .slice(1)
    .map((n: string) => String(n).trim())
    .filter(Boolean)
    .join(' · ');

  const quantity = resolveRoomQuantity(raw);
  const totalFare = resolveRoomTotalFare(raw);
  const taxes = resolveRoomTotalTax(raw);
  // TBO returns TotalFare as aggregate for all searched rooms.
  // resolveRoomQuantity returns 1 because TBO doesn't send a Quantity field.
  // Use searchedRooms (from the original search params) to normalise to per-room price.
  const roomDivisor = Math.max(1, quantity > 1 ? quantity : searchedRooms);
  const perRoomTax = Math.ceil(Math.max(0, taxes / roomDivisor));
  const perRoomTotalFare = Math.ceil(Math.max(0, totalFare / roomDivisor));
  const price = Math.max(0, perRoomTotalFare - perRoomTax);
  const isRefundable = raw.IsRefundable === true || String(raw.IsRefundable).toLowerCase() === 'true';
  const mealType: string = raw.MealType ?? '';
  const mealPlanLabel = mealPlanLabelFromCode(mealType);

  const inclusion: string = Array.isArray(raw.Inclusion)
    ? raw.Inclusion.join(', ')
    : String(raw.Inclusion ?? '');

  const hasBreakfast =
    mealType === 'BreakFast' ||
    mealType === 'Half_Board' ||
    mealType === 'Full_Board' ||
    inclusion.toLowerCase().includes('breakfast');

  let amenities = inclusion
    ? inclusion.split(/[,;|]/).map((s: string) => s.trim()).filter(Boolean)
    : [];

  if (amenities.length === 0 && mealPlanLabel) {
    amenities = [mealPlanLabel];
  }

  const adults = Number(raw.AdultCount ?? raw.Adults ?? raw.NumberOfAdults ?? 0);
  const children = Number(raw.ChildCount ?? raw.Children ?? raw.NumberOfChildren ?? 0);
  if (adults > 0 || children > 0) {
    const parts: string[] = [];
    if (adults > 0) parts.push(`${adults} adult${adults !== 1 ? 's' : ''}`);
    if (children > 0) parts.push(`${children} child${children !== 1 ? 'ren' : ''}`);
  } else {
  }

  const size = Number(raw.RoomSize ?? raw.SquareFeet ?? raw.Size ?? raw.RoomSizeSqFt ?? 0) || 0;
  const view = String(raw.ViewType ?? raw.Facing ?? raw.RoomView ?? '').trim();

  const published = Number(
    raw.PublishedPrice ?? raw.PublishedPriceRoundedOff ?? raw.Price?.PublishedPriceRoundedOff ?? 0
  );
  const originalPrice =
    published > 0 && published > price + taxes ? Math.ceil(published) : undefined;

  if (amenities.length === 0 && mealPlanLabel) {
    amenities.push(mealPlanLabel);
  }
  if (amenities.length === 0 && isRefundable) {
    amenities.push('Free Cancellation');
  }

  let additionalCharges = parseInt(String(raw.additionalCharges || raw.AdditionalCharges || 0));
  if (isNaN(additionalCharges)) additionalCharges = 0;
  
  let additionalChargesCurrency: string | undefined = raw.additionalChargesCurrency || raw.AdditionalChargesCurrency;
  
  if (!additionalCharges && Array.isArray(raw.Supplements)) {
    const flatSupplements = raw.Supplements.flat(Infinity);
    additionalCharges = flatSupplements.reduce((sum: number, supp: any) => {
      if (
        supp &&
        (supp.Type === 'Mandatory' ||
        supp.Type === 'AtProperty' ||
        supp.ChargeType === 'AtProperty' ||
        (supp.Description && supp.Description.toLowerCase().includes('mandatory')))
      ) {
        if (!additionalChargesCurrency && supp.Currency) additionalChargesCurrency = supp.Currency;
        return sum + (parseInt(String(supp.Price || supp.Amount || 0)) || 0);
      }
      return sum;
    }, 0);
  }
  if (!additionalCharges && Array.isArray(raw.MandatoryTaxes)) {
    additionalCharges = raw.MandatoryTaxes.reduce((sum: number, tax: any) => {
      if (!additionalChargesCurrency && tax.Currency) additionalChargesCurrency = tax.Currency;
      return sum + parseInt(String(tax.Amount || tax.Price || 0));
    }, 0);
  }

  const roomImages = Array.isArray(raw.Images) ? raw.Images : Array.isArray(raw.images) ? raw.images : raw.RoomPicture ? [raw.RoomPicture] : raw.Picture ? [raw.Picture] : [];

  // Read CancelPolicies and LastCancellationDate directly from the search response.
  // The prebook API returns 402 in test environments, so we must use search-time
  // policy data as the source of truth for cancellation display.
  const searchCancelPolicies: CancelPolicySlab[] =
    Array.isArray(raw.CancelPolicies) && raw.CancelPolicies.length > 0
      ? raw.CancelPolicies.map((p: any) => mapPolicy(p, raw.Currency ?? 'INR'))
      : Array.isArray(raw.CancellationPolicies) && raw.CancellationPolicies.length > 0
        ? raw.CancellationPolicies.map((p: any) => mapPolicy(p, raw.Currency ?? 'INR'))
        : [];

  // Per-room taxes already calculated above as perRoomTax using roomDivisor.

  return {
    id: String(raw.BookingCode ?? index),
    name: roomName,
    type: roomName,
    bedType: extractBedType(roomName),
    occupancy: '',
    size,
    view,
    breakfast: hasBreakfast,
    cancellationPolicy: findCancellationString(raw) || (isRefundable ? 'Free cancellation available' : 'Non-refundable'),
    cancelPolicies: searchCancelPolicies,
    amenities,
    price,
    originalPrice,
    taxesAndFees: perRoomTax,
    additionalCharges,
    additionalChargesCurrency,
    quantity: 1,
    images: roomImages,
    roomSubtitle: roomSubtitle || undefined,
    mealPlanLabel: mealPlanLabel || undefined,
    _bookingCode: String(raw.BookingCode ?? ''),
    _mealType: mealType,
    _isRefundable: isRefundable,
    _raw: raw,
  } as Room & {
    _bookingCode: string;
    _mealType: string;
    _isRefundable: boolean;
    _raw: any;
  };
}

// ─── useHotelSearch ───────────────────────────────────────────────────────────
export interface HotelSearchInput {
  cityCode: string;       // TBO city Code from city search
  checkIn: string;        // YYYY-MM-DD
  checkOut: string;       // YYYY-MM-DD
  rooms: number;
  adults: number;
  children?: number;
  childrenAges?: number[];
  nationality?: string;
}

export function useHotelSearch() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [rawResults, setRawResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const [allCityHotels, setAllCityHotels] = useState<any[]>([]);
  const [currentParams, setCurrentParams] = useState<HotelSearchInput | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const searchSessionId = useRef(0);

  const fetchBatch = async (
    params: HotelSearchInput,
    cityHotelsChunk: any[],
    isFirstBatch: boolean,
    sessionId: number
  ): Promise<{ normalized: Hotel[]; searchResults: any[] }> => {
    if (cityHotelsChunk.length === 0) return { normalized: [], searchResults: [] };
    if (sessionId !== searchSessionId.current) return { normalized: [], searchResults: [] };

    const cityHotelMap: Record<string, any> = {};
    for (const h of cityHotelsChunk) {
      const code = h.HotelCode || h.hotelCode;
      if (code) cityHotelMap[code] = h;
    }

    const hotelCodes = cityHotelsChunk
      .map((h: any) => h.HotelCode || h.hotelCode)
      .filter(Boolean)
      .join(',');

    if (isFirstBatch) setStatusMessage('Searching for available rooms…');
    
    try {
      console.time('searchHotels-api');
      const { hotelResults: searchResults, traceId: searchTraceId } = await searchHotels({
        ...params,
        hotelCodes,
      });
      console.timeEnd('searchHotels-api');

      if (sessionId !== searchSessionId.current) return { normalized: [], searchResults: [] };

      if (searchTraceId && !useHotelStore.getState().traceId) {
        useHotelStore.getState().setTraceId(searchTraceId);
      } else if (searchResults.length > 0 && isFirstBatch && !searchTraceId) {
        toast.error(
          'Hotel search did not return a trace id. You may need to search again before booking.',
          { duration: 6000 }
        );
      }

      // Render immediately WITHOUT waiting for static details
      const normalized = searchResults.map((sr: any) => {
        const code = sr.HotelCode || sr.hotelCode;
        const cityHotel = cityHotelMap[code] ?? { HotelCode: code };
        return normHotel(cityHotel, sr, undefined, sr._traceId || searchTraceId, params.rooms ?? 1);
      });

      // Fetch static details in the background and merge them in
      const resultCodes = searchResults
        .map((r: any) => r.HotelCode || r.hotelCode)
        .filter(Boolean)
        .slice(0, 100);

      if (resultCodes.length > 0) {
        getHotelStaticDetails(resultCodes).then((staticDetails) => {
          if (sessionId !== searchSessionId.current) return;
          const staticMap: Record<string, StaticHotelDetail> = {};
          for (const sd of staticDetails) {
            const code = sd.HotelCode || (sd as any).hotelCode;
            if (code) staticMap[code] = sd;
          }
          // Re-normalize with static details and update state
          const enriched = searchResults.map((sr: any) => {
            const code = sr.HotelCode || sr.hotelCode;
            const cityHotel = cityHotelMap[code] ?? { HotelCode: code };
            const sd = staticMap[code];
            return normHotel(cityHotel, sr, sd, sr._traceId || searchTraceId, params.rooms ?? 1);
          });
          setHotels(prev => {
            // Merge enriched hotels into existing list (replace by id)
            const map = new Map(prev.map(h => [h.id, h]));
            for (const h of enriched) map.set(h.id, h);
            return Array.from(map.values());
          });
        }).catch(() => {
          // Static details are optional — ignore failures
        });
      }

      return { normalized, searchResults };
    } catch (err) {
      console.error('[fetchBatch] fetch failed for chunk', err);
      throw err;
    }
  };

  const search = useCallback(async (params: HotelSearchInput) => {
    searchSessionId.current += 1;
    const sessionId = searchSessionId.current;
    
    setLoading(true);
    setError(null);
    setHotels([]);
    setRawResults([]);
    useHotelStore.getState().setTraceId(null);
    setHasMore(false);

    // Abort controller so we can cancel the stream on new search
    const abortController = new AbortController();

    try {
      setStatusMessage('Finding hotels in this city…');
      let actualCityCode = params.cityCode;
      
      // If it's a CC:ID format (e.g. from an old store state), extract just the ID
      if (actualCityCode && actualCityCode.includes(':')) {
        actualCityCode = actualCityCode.split(':')[1];
      } else if (actualCityCode) {
        // Resolve plain strings if it's not a numeric ID
        if (!/^\d+$/.test(actualCityCode)) {
          const cities = await searchCities(actualCityCode);
          if (sessionId !== searchSessionId.current) return;
          if (cities.length > 0) {
            actualCityCode = cities[0].cityCode;
            if (cities[0].countryCode) {
              useHotelStore.getState().setSearchParams({ destinationCountryCode: cities[0].countryCode });
            }
          }
        }
      }
      
      // Fetch all hotel codes for the city
      setStatusMessage('Loading hotel list…');
      const cityHotels: any[] = await getCityHotels(actualCityCode);
      if (sessionId !== searchSessionId.current) return;

      setAllCityHotels(cityHotels);
      setCurrentParams(params);

      if (cityHotels.length === 0) {
        setError('No hotels found in this city.');
        setHasSearched(true);
        setLoading(false);
        setStatusMessage('');
        return;
      }

      setStatusMessage('Searching for available rooms…');

      // Build a cityHotelMap for fast lookup during streaming
      const cityHotelMap: Record<string, any> = {};
      for (const h of cityHotels) {
        const code = h.HotelCode || h.hotelCode;
        if (code) cityHotelMap[code] = h;
      }

      // Send ALL city hotel codes — backend splits into 20-code chunks (5 concurrent)
      // TBO only returns hotels with availability, so we need broad coverage to get 100+
      const streamCodes = cityHotels
        .map((h: any) => h.HotelCode || h.hotelCode)
        .filter(Boolean)
        .join(',');

      // No "load more" needed — we stream everything upfront
      setHasMore(false);

      let firstBatchRendered = false;
      const seenResults: any[] = [];

      await searchHotelsStream(
        { ...params, hotelCodes: streamCodes },
        // onBatch — called as each 20-code TBO response arrives
        (rawHotels: any[], batchTraceId: string) => {
          if (sessionId !== searchSessionId.current) return;

          // Store traceId from first batch
          if (batchTraceId && !useHotelStore.getState().traceId) {
            useHotelStore.getState().setTraceId(batchTraceId);
          }

          // Normalize and add to state immediately
          const newNormalized = rawHotels.map((sr: any) => {
            const code = sr.HotelCode || sr.hotelCode;
            const cityHotel = cityHotelMap[code] ?? { HotelCode: code };
            return normHotel(cityHotel, sr, undefined, sr._traceId || batchTraceId, params.rooms ?? 1);
          });

          seenResults.push(...rawHotels);

          // Render hotels as they arrive — React batches these setState calls
          setHotels(prev => {
            const map = new Map(prev.map(h => [h.id, h]));
            for (const h of newNormalized) map.set(h.id, h);
            return Array.from(map.values());
          });
          setRawResults(prev => [...prev, ...rawHotels]);

          if (!firstBatchRendered) {
            firstBatchRendered = true;
            setHasSearched(true);
            setLoading(false);
            setStatusMessage('');
          }

          // Kick off background static details enrichment for this batch
          const codes = rawHotels.map((r: any) => r.HotelCode || r.hotelCode).filter(Boolean);
          if (codes.length > 0) {
            getHotelStaticDetails(codes).then((staticDetails) => {
              if (sessionId !== searchSessionId.current) return;
              const staticMap: Record<string, StaticHotelDetail> = {};
              for (const sd of staticDetails) {
                const code = sd.HotelCode || (sd as any).hotelCode;
                if (code) staticMap[code] = sd;
              }
              const enriched = rawHotels.map((sr: any) => {
                const code = sr.HotelCode || sr.hotelCode;
                const cityHotel = cityHotelMap[code] ?? { HotelCode: code };
                return normHotel(cityHotel, sr, staticMap[code], sr._traceId || batchTraceId, params.rooms ?? 1);
              });
              setHotels(prev => {
                const map = new Map(prev.map(h => [h.id, h]));
                for (const h of enriched) map.set(h.id, h);
                return Array.from(map.values());
              });
            }).catch(() => { /* static details optional */ });
          }
        },
        // onDone
        (_total: number) => {
          if (sessionId !== searchSessionId.current) return;
          if (!firstBatchRendered) {
            // Stream completed but no hotels found
            setError('No rooms available for the selected dates. Try different dates.');
            setHasSearched(true);
            setLoading(false);
            setStatusMessage('');
          }
        },
        // onError
        (msg: string) => {
          if (sessionId !== searchSessionId.current) return;
          if (!firstBatchRendered) {
            setError(msg || 'Hotel search failed. Please try again.');
            setHasSearched(true);
            setLoading(false);
            setStatusMessage('');
          }
        },
        abortController.signal,
      );

    } catch (err: any) {
      if (sessionId !== searchSessionId.current) return;
      setError(err?.message ?? 'Hotel search failed. Please try again.');
      setHasSearched(true);
      setLoading(false);
      setStatusMessage('');
    }
  }, []);

  const loadMore = useCallback(async () => {
    // loadMore is kept for API compatibility but the stream now covers all codes.
    // Nothing to do.
    setHasMore(false);
  }, []);

  return { hotels, rawResults, loading, hasSearched, error, statusMessage, search, loadMore, hasMore, loadingMore };
}

// ─── useHotelDetail ───────────────────────────────────────────────────────────
/**
 * If rawResult is provided (from searchResultsMap), we build the hotel from it
 * directly — no extra API call needed. We still try to enrich with static details
 * (images, amenities) but fall back gracefully if that fails.
 */
export function useHotelDetail() {
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (params: {
      hotelCode: string;
      rawResult?: any;
      // Pre-built Hotel object from the results list (already has name, price, etc.)
      existingHotel?: Hotel | null;
    }) => {
      setLoading(true);
      setError(null);
      try {
        // If we already have a fully-built Hotel object from the search results,
        // use it immediately and just try to enrich images/amenities in the background.
        if (params.existingHotel) {
          setHotel(params.existingHotel);
          setLoading(false);
          // Try to enrich with static details (images, amenities) silently
          try {
            const details = await getHotelStaticDetails([params.hotelCode]);
            const sd = details[0];
            if (sd) {
              const imgs = buildImages(sd);
              const amenities = buildAmenities(sd);
              setHotel(prev => prev ? {
                ...prev,
                images: imgs.length > 1 ? imgs : prev.images,
                amenities: amenities.length > 0 ? amenities : prev.amenities,
                propertyType: sd.HotelCategory ?? prev.propertyType,
              } : prev);
            }
          } catch {
            // Static details are optional — keep existing hotel data
          }
          return;
        }

        // Fallback: build from rawResult + static details
        const details = await getHotelStaticDetails([params.hotelCode]);
        const sd = details[0];
        const cityHotel = { HotelCode: params.hotelCode };
        const sr = Math.max(1, useHotelStore.getState().searchParams.rooms ?? 1);
        setHotel(normHotel(cityHotel, params.rawResult ?? {}, sd, undefined, sr));
      } catch (err: any) {
        // If we have rawResult, build a basic hotel from it even without static details
        if (params.rawResult) {
          const cityHotel = { HotelCode: params.hotelCode };
          const sr = Math.max(1, useHotelStore.getState().searchParams.rooms ?? 1);
          setHotel(normHotel(cityHotel, params.rawResult, undefined, undefined, sr));
        } else {
          setError(err?.message ?? 'Failed to load hotel details');
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { hotel, loading, error, fetch };
}

// ─── useHotelRooms ────────────────────────────────────────────────────────────
/**
 * Extracts Room[] from the raw search result stored in searchResultsMap.
 * The /search response embeds rooms directly: { HotelCode, Rooms: [...] }
 */
export function useHotelRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRoomsFromResult = useCallback((rawResult: any) => {
    setLoading(true);
    setError(null);
    try {
      // /search embeds rooms as rawResult.Rooms (or rawResult._rooms if pre-processed)
      const roomList: any[] =
        rawResult?.Rooms ??
        rawResult?._rooms ??
        [];

      // Pass searchedRooms so normRoom can divide the aggregate TotalFare correctly.
      // TBO returns TotalFare for all rooms in the search, not per room.
      const searchedRooms = Math.max(1, useHotelStore.getState().searchParams.rooms ?? 1);

      if (roomList.length > 0) {
        setRooms(roomList.map((r: any, i: number) => normRoom(r, i, searchedRooms)));
      } else {
        setError('No rooms found for this hotel.');
      }
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }, []);

  return { rooms, loading, error, loadRoomsFromResult };
}

// ─── runHotelPreBook ──────────────────────────────────────────────────────────
export async function runHotelPreBook(
  bookingCode: string,
  traceId: string,
  checkIn?: string,
  roomName?: string
): Promise<PreBookResponse> {
  const tid = traceId?.trim();
  if (!tid) {
    throw new Error(
      'Missing hotel search session (traceId). Open hotel results and run your search again, then pick your room.'
    );
  }

  const envelope: any = await preBookHotel({
    bookingCode,
    traceId: tid,
    ...(checkIn ? { checkIn } : {}),
    ...(roomName ? { roomName } : {}),
  });

  // ── Unwrap backend envelope: { ok, data: { HotelResult: [...], ... } } ──
  // preBookHotel returns the raw JSON. Our backend wraps TBO data under `data`.
  const raw: any = envelope?.data ?? envelope;

  // ── Log the full response for debugging ──────────────────────────────────
  const httpStatus = envelope?._httpStatus ?? 0;
  console.log('[PreBook] HTTP status:', httpStatus);
  console.log('[PreBook] FULL envelope:', JSON.stringify(envelope));

  // Backend returns 200 with HotelResult even on balance errors (computed fallback)
  // so we never need to handle 402 here — just fall through to normal parsing.

  // ── Unwrap TBO HotelResult array ──────────────────────────────────────────
  // TBO structure: { HotelResult: [{ HotelRoomsDetails: [...], ... }] }
  // Backend may also pass through a flat structure or wrap under `data`.
  const tboResultRaw = raw?.HotelResult ?? raw;
  const tboResult = Array.isArray(tboResultRaw) ? tboResultRaw[0] : tboResultRaw;

  // Full dump so we can see the exact response shape in browser devtools
  console.log('[PreBook] FULL envelope:', JSON.stringify(envelope));
  console.log('[PreBook] envelope keys:', Object.keys(envelope ?? {}));
  console.log('[PreBook] raw keys:', Object.keys(raw ?? {}));
  console.log('[PreBook] tboResult keys:', Object.keys(tboResult ?? {}));

  // ── Extract room detail — try every known nesting path ───────────────────
  // Path A: HotelResult[0].HotelRoomsDetails[0]  (standard TBO PreBook)
  // Path B: HotelResult[0].Rooms[0]              (alternate key)
  // Path C: HotelResult[0].RoomDetails[0]        (alternate key)
  // Path D: tboResult itself has CancelPolicies  (flat/passthrough)
  const roomDetail =
    tboResult?.HotelRoomsDetails?.[0] ??
    tboResult?.Rooms?.[0] ??
    tboResult?.RoomDetails?.[0];
  const priceObj = roomDetail?.Price ?? tboResult?.Price ?? {};

  console.log('[PreBook] roomDetail keys:', JSON.stringify(Object.keys(roomDetail ?? {})));
  console.log('[PreBook] roomDetail.CancelPolicies:', JSON.stringify(roomDetail?.CancelPolicies));
  console.log('[PreBook] tboResult.CancelPolicies:', JSON.stringify(tboResult?.CancelPolicies));
  console.log('[PreBook] roomDetail.IsRefundable:', roomDetail?.IsRefundable);
  console.log('[PreBook] tboResult.IsRefundable:', tboResult?.IsRefundable);

  let netAmount = Number(tboResult?.NetAmount ?? 0);
  if (!netAmount) {
    const details: any[] = tboResult?.HotelRoomsDetails ?? tboResult?.Rooms ?? tboResult?.RoomDetails ?? [];
    netAmount = details.reduce(
      (sum: number, d: any) => sum + Number(d?.Price?.OfferedPriceRoundedOff ?? 0),
      0
    );
  }
  if (!netAmount) {
    netAmount = Number(priceObj.OfferedPriceRoundedOff ?? priceObj.PublishedPriceRoundedOff ?? 0);
  }

  const tax = Number(priceObj.Tax ?? priceObj.OtherCharges ?? 0);
  const confirmedPrice = netAmount;
  const confirmedTaxes = tax;
  const originalPrice = Number(raw?.Price?.PublishedPriceRoundedOff ?? 0);

  // ── Extract IsRefundable ──────────────────────────────────────────────────
  // Check room detail first, then tboResult, then raw envelope — in case of
  // flat/passthrough response shapes.
  const isRefundable: boolean =
    roomDetail?.IsRefundable === true ||
    roomDetail?.isRefundable === true ||
    tboResult?.IsRefundable === true ||
    tboResult?.isRefundable === true ||
    raw?.IsRefundable === true ||
    false;

  // ── Extract cancellation policies ────────────────────────────────────────
  // Try roomDetail directly first (preferred), then tboResult, then raw.
  // This covers both nested (HotelResult[0].HotelRoomsDetails[0].CancelPolicies)
  // and flat (tboResult.CancelPolicies or raw.CancelPolicies) response shapes.
  const currency: string =
    roomDetail?.Currency ?? roomDetail?.currency ??
    tboResult?.Currency ?? tboResult?.currency ??
    raw?.Currency ?? 'INR';

  let cancelPolicies: import('../stores/hotelStore').CancelPolicySlab[] = [];

  // Direct room-level access — most reliable
  if (Array.isArray(roomDetail?.CancelPolicies) && roomDetail.CancelPolicies.length > 0) {
    cancelPolicies = roomDetail.CancelPolicies.map((p: any) => mapPolicy(p, currency));
  } else if (Array.isArray(roomDetail?.CancellationPolicies) && roomDetail.CancellationPolicies.length > 0) {
    cancelPolicies = roomDetail.CancellationPolicies.map((p: any) => mapPolicy(p, currency));
  // tboResult level (flat passthrough from backend)
  } else if (Array.isArray(tboResult?.CancelPolicies) && tboResult.CancelPolicies.length > 0) {
    cancelPolicies = tboResult.CancelPolicies.map((p: any) => mapPolicy(p, currency));
  } else if (Array.isArray(tboResult?.CancellationPolicies) && tboResult.CancellationPolicies.length > 0) {
    cancelPolicies = tboResult.CancellationPolicies.map((p: any) => mapPolicy(p, currency));
  // raw envelope level
  } else if (Array.isArray(raw?.CancelPolicies) && raw.CancelPolicies.length > 0) {
    cancelPolicies = raw.CancelPolicies.map((p: any) => mapPolicy(p, currency));
  } else if (Array.isArray(raw?.CancellationPolicies) && raw.CancellationPolicies.length > 0) {
    cancelPolicies = raw.CancellationPolicies.map((p: any) => mapPolicy(p, currency));
  } else {
    // Last resort: recursive deep search
    cancelPolicies = findPolicies(tboResult, currency);
    if (cancelPolicies.length === 0) {
      cancelPolicies = findPolicies(raw, currency);
    }
  }

  console.log('[PreBook] cancelPolicies found:', cancelPolicies.length, JSON.stringify(cancelPolicies));

  // ── Extract free cancellation deadline from backend
  // Backend computes FreeCancellationUntil / LastCancellationDate at room level.
  const freeCancellationDeadlineRaw: string | null =
    findCancellationDeadline(roomDetail) ??
    findCancellationDeadline(tboResult) ??
    findCancellationDeadline(raw);

  const policyText = typeof raw?.CancellationPolicy === 'string' && raw.CancellationPolicy.trim()
    ? raw.CancellationPolicy.trim()
    : typeof raw?.cancellationPolicy === 'string' && raw.cancellationPolicy.trim()
    ? raw.cancellationPolicy.trim()
    : typeof raw?.CancelPolicy === 'string' && raw.CancelPolicy.trim()
    ? raw.CancelPolicy.trim()
    : typeof raw?.cancelPolicy === 'string' && raw.cancelPolicy.trim()
    ? raw.cancelPolicy.trim()
    : null;

  const penaltySlabs = cancelPolicies.filter(p => p.charge > 0);
  const freeSlabs = cancelPolicies.filter(p => p.charge === 0);

  const firstPenaltyFrom = penaltySlabs
    .map((p) => parsePolicyDate(p.fromDate ?? ''))
    .filter((d): d is Date => d instanceof Date && !isNaN(d.getTime()))
    .sort((a, b) => a.getTime() - b.getTime())[0] ?? null;

  const firstFreeTo = freeSlabs
    .map((p) => parsePolicyDate(p.toDate ?? p.fromDate ?? ''))
    .filter((d): d is Date => d instanceof Date && !isNaN(d.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0] ?? null; // latest free-period end

  // Free cancellation deadline — in priority order:
  // 1. firstFreeTo from zero-charge slab toDate/fromDate
  // 2. day before first penalty slab from earliest penalty
  // 3. Backend-free cancellation deadline fields
  const freeCancellationDeadline =
    firstFreeTo
      ? formatPolicyDateFromDate(firstFreeTo)
      : firstPenaltyFrom
        ? formatPolicyDateFromDate(new Date(firstPenaltyFrom.getTime() - 86400000))
        : freeCancellationDeadlineRaw
          ? safeFormatDate(freeCancellationDeadlineRaw)
          : null;

  const buildPolicyString = (): string => {
    if (isRefundable === false) return 'Non-Refundable';
    if (cancelPolicies.length > 0) {
      if (freeCancellationDeadline) {
        return `Free Cancellation until ${freeCancellationDeadline}`;
      }
      if (isRefundable === true) {
        return 'Free Cancellation available';
      }
    }
    if (policyText) return policyText;
    if (isRefundable === true) return 'Free Cancellation available';
    if (isRefundable === false) return 'Non-Refundable';
    return 'Please check hotel cancellation policy';
  };

  const cancellationPolicy = buildPolicyString();

  // Extract corporateBookingAllowed from validationInfo (located at the root level of TBO response)
  const validationInfo = raw?.ValidationInfo ?? raw?.validationInfo ?? {};
  const corporateBookingAllowed = Boolean(
    validationInfo?.CorporateBookingAllowed ??
    validationInfo?.corporateBookingAllowed ??
    false
  );

  const promotions = Array.isArray(roomDetail?.Promotions) ? roomDetail.Promotions.map((p: any) => typeof p === 'string' ? p : p?.Description || '') : [];
  const rateConditions = Array.isArray(roomDetail?.RateConditions) ? roomDetail.RateConditions.map((p: any) => typeof p === 'string' ? p : p?.Description || '') : [];

  return {
    traceId: tid,
    bookingCode: raw?.BookingCode ?? bookingCode,
    confirmedPrice,
    confirmedTaxes,
    cancellationPolicy,
    cancelPolicies,
    isRefundable,
    roomAvailable: raw?.IsHotelPolicyComplied !== false,
    priceChanged: Boolean(raw?.IsPriceChanged),
    originalPrice: originalPrice && originalPrice !== confirmedPrice ? originalPrice : undefined,
    sessionExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    isPackageFare: raw?.IsPackageFare,
    isPackageDetailsMandatory: raw?.IsPackageDetailsMandatory,
    netAmount,
    corporateBookingAllowed,
    promotions: promotions.filter(Boolean),
    rateConditions: rateConditions.filter(Boolean),
  } as PreBookResponse & {
    isPackageFare?: boolean;
    isPackageDetailsMandatory?: boolean;
    netAmount?: number;
  };
}

// ─── runHotelBook ─────────────────────────────────────────────────────────────
export async function runHotelBook(params: BookParams): Promise<BookResult> {
  return bookHotel(params);
}

// ─── getHotelBookingDetail ────────────────────────────────────────────────────
export async function getHotelBookingDetail(bookingId: string): Promise<any> {
  return getBookingDetail(bookingId);
}

// ─── cancelHotel ─────────────────────────────────────────────────────────────
export async function cancelHotel(
  bookingId: string,
  requestType: 4 = 4
): Promise<any> {
  return cancelHotelBooking(bookingId, requestType);
}

// ─── getHotelVoucher ─────────────────────────────────────────────────────────
export async function getHotelVoucherUrl(bookingId: string): Promise<string> {
  return getHotelVoucher(bookingId);
}

// ─── City autocomplete ────────────────────────────────────────────────────────
export interface CityOption {
  id: string;
  name: string;
  cityCode: string;
  countryCode: string;
  type: 'city';
}

const COUNTRY_LABELS: Record<string, string> = {
  IN: 'India', AE: 'UAE', SG: 'Singapore', TH: 'Thailand', US: 'United States',
  GB: 'United Kingdom', FR: 'France', AU: 'Australia', MY: 'Malaysia', ID: 'Indonesia',
  MV: 'Maldives', LK: 'Sri Lanka', NP: 'Nepal', HK: 'Hong Kong', CH: 'Switzerland',
  DE: 'Germany', IT: 'Italy', ES: 'Spain', NL: 'Netherlands', CA: 'Canada',
  NZ: 'New Zealand', JP: 'Japan', KR: 'South Korea', CN: 'China', BT: 'Bhutan',
  QA: 'Qatar', OM: 'Oman', SA: 'Saudi Arabia', KW: 'Kuwait', BH: 'Bahrain',
  EG: 'Egypt', TR: 'Turkey', VN: 'Vietnam', PH: 'Philippines', KH: 'Cambodia',
  MU: 'Mauritius', SC: 'Seychelles', ZA: 'South Africa', PT: 'Portugal', GR: 'Greece',
};

export function countryLabel(code: string): string {
  const cc = code.trim().toUpperCase();
  return COUNTRY_LABELS[cc] ?? cc;
}

export async function searchCities(
  query: string,
  countryCode?: string
): Promise<CityOption[]> {
  if (!query.trim() || query.length < 2) return [];
  try {
    const cities: TboCity[] = await searchHotelCities(query, countryCode);
    return cities.map((c) => {
      const cc = (c.CountryCode ?? '').trim().toUpperCase();
      return {
        id: `${cc}:${c.Code}`,
        name: cc ? `${c.Name}, ${countryLabel(cc)}` : c.Name,
        cityCode: c.Code,
        countryCode: cc || '—',
        type: 'city' as const,
      };
    });
  } catch {
    return [];
  }
}



