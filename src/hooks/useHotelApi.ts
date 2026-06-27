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
  let penalty = p?.charge ?? p?.Charge ?? p?.CancellationCharge ?? p?.Amount ?? p?.PenaltyAmount ?? p?.ChargeAmount ?? p?.Percentage ?? p?.value ?? p?.Value ?? 0;
  
  let rawType = p?.chargeType ?? p?.ChargeType;
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

  return {
    charge: Number(penalty),
    chargeType,
    currency: String(p?.currency ?? p?.Currency ?? fallbackCurrency),
    fromDate: p?.fromDate ?? p?.FromDate,
    toDate: p?.toDate ?? p?.ToDate,
    remarks: p?.remarks ?? p?.Remarks,
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

function findLastCancellationDate(obj: any): string | null {
  if (!obj || typeof obj !== 'object') return null;
  const keys = ['LastCancellationDate', 'lastCancellationDate'];
  for (const k of keys) {
    if (typeof obj[k] === 'string' && obj[k].trim() !== '') {
      return obj[k].trim();
    }
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const result = findLastCancellationDate(obj[key]);
      if (result) return result;
    }
  }
  return null;
}

function safeFormatDate(dStr: string | null | undefined): string | null {
  if (!dStr) return null;
  try {
    const d = new Date(dStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return null;
  }
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
  if (imgs.length === 0) imgs.push('/assets/hotel-bg.jpg');
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
function normHotel(
  cityHotel: any,
  searchResult: any,
  staticDetail?: StaticHotelDetail,
  searchTraceId?: string
): Hotel {
  const rooms: any[] = searchResult?.Rooms ?? [];

  // Cheapest room drives the card-level price.
  // TBO returns per-room prices regardless of the rooms count in the search;
  // we store the per-room amount and let the UI multiply by rooms count when displaying.
  const cheapest = rooms.reduce(
    (min: any, r: any) => (!min || Number(r.TotalFare) < Number(min.TotalFare) ? r : min),
    null
  );

  const totalFare = cheapest ? Number(cheapest.TotalFare ?? 0) : 0;
  const taxes = cheapest ? Number(cheapest.TotalTax ?? 0) : 0;
  // price = base fare (tax-exclusive) for ONE room
  const price = Math.max(0, totalFare - taxes);
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
    _taxes: taxes,
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
 */
function normRoom(raw: any, index: number): Room {
  const names: string[] = Array.isArray(raw.Name) ? raw.Name : [raw.Name ?? `Room ${index + 1}`];
  const roomName = names[0] ?? `Room ${index + 1}`;
  const roomSubtitle = names
    .slice(1)
    .map((n: string) => String(n).trim())
    .filter(Boolean)
    .join(' · ');

  const totalFare = Number(raw.TotalFare ?? 0);
  const taxes = Number(raw.TotalTax ?? 0);
  const price = Math.max(0, totalFare - taxes);
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
    published > 0 && published > price + taxes ? Math.round(published) : undefined;

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

  // CancelPolicies in search response are static TBO test data — ignored here.
  // Real cancellation policy only comes from PreBook API response.

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
    cancelPolicies: [],
    amenities,
    price,
    originalPrice,
    taxesAndFees: taxes,
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

  const [, setAllCityHotels] = useState<any[]>([]);
  const [, setCurrentParams] = useState<HotelSearchInput | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore] = useState(false);
  
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
      const { hotelResults: searchResults, traceId: searchTraceId } = await searchHotels({
        ...params,
        hotelCodes,
      });

      if (sessionId !== searchSessionId.current) return { normalized: [], searchResults: [] };

      if (searchTraceId && !useHotelStore.getState().traceId) {
        useHotelStore.getState().setTraceId(searchTraceId);
      } else if (searchResults.length > 0 && isFirstBatch && !searchTraceId) {
        toast.error(
          'Hotel search did not return a trace id. You may need to search again before booking.',
          { duration: 6000 }
        );
      }

      if (isFirstBatch) setStatusMessage('Loading hotel details…');
      const resultCodes = searchResults
        .map((r: any) => r.HotelCode || r.hotelCode)
        .filter(Boolean)
        .slice(0, 100);

      let staticMap: Record<string, StaticHotelDetail> = {};
      if (resultCodes.length > 0) {
        try {
          const staticDetails = await getHotelStaticDetails(resultCodes);
          for (const sd of staticDetails) {
            const code = sd.HotelCode || sd.hotelCode;
            if (code) staticMap[code] = sd;
          }
        } catch {
          // ignore
        }
      }

      const normalized = searchResults.map((sr: any) => {
        const code = sr.HotelCode || sr.hotelCode;
        const cityHotel = cityHotelMap[code] ?? { HotelCode: code };
        const sd = staticMap[code];
        return normHotel(cityHotel, sr, sd, sr._traceId || searchTraceId);
      });

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
          if (cities.length > 0) {
            actualCityCode = cities[0].cityCode;
            if (cities[0].countryCode) {
              useHotelStore.getState().setSearchParams({ destinationCountryCode: cities[0].countryCode });
            }
          }
        }
      }
      
      const cityHotels: any[] = await getCityHotels(actualCityCode);
      setAllCityHotels(cityHotels);
      setCurrentParams(params);

      const FIRST_CHUNK_SIZE = 20;
      const REST_CHUNK_SIZE = 100;
      
      const chunks: any[][] = [];
      if (cityHotels.length > 0) {
        chunks.push(cityHotels.slice(0, FIRST_CHUNK_SIZE));
        for (let i = FIRST_CHUNK_SIZE; i < cityHotels.length; i += REST_CHUNK_SIZE) {
          chunks.push(cityHotels.slice(i, i + REST_CHUNK_SIZE));
        }
      }
      
      let foundAnyHotels = false;

      if (chunks.length > 0) {
        for (let i = 0; i < chunks.length; i++) {
          if (sessionId !== searchSessionId.current) break;

          if (i > 0) {
            // Delay to avoid rate limiting
            setStatusMessage(`Loading more hotels (${i + 1}/${chunks.length})...`);
            await new Promise(r => setTimeout(r, 1000));
          }

          let retries = 3;
          let attempt = 0;
          while (retries > 0) {
            try {
              const res = await fetchBatch(params, chunks[i], i === 0, sessionId);
              if (res && sessionId === searchSessionId.current) {
                if (res.normalized.length > 0) {
                  foundAnyHotels = true;
                  setHasSearched(true);
                  setLoading(false);
                }
                setHotels(prev => {
                  const combined = [...prev, ...res.normalized];
                  return Array.from(new Map(combined.map(h => [h.id, h])).values());
                });
                setRawResults(prev => {
                  const combined = [...prev, ...res.searchResults];
                  return Array.from(new Map(combined.map(r => [String(r.HotelCode || r.hotelCode), r])).values());
                });
              }
              break;
            } catch (err) {
              retries--;
              attempt++;
              if (retries === 0 || sessionId !== searchSessionId.current) {
                console.warn(`[useHotelSearch] Chunk ${i} failed permanently after 3 retries. Skipping.`);
                break;
              }
              await new Promise(r => setTimeout(r, 1500 * attempt));
            }
          }
        }
      }
      if (sessionId !== searchSessionId.current) return;

      if (!foundAnyHotels && chunks.length > 0) {
        setError('No rooms available for the selected dates. Try different dates.');
      }

      setHasSearched(true);
      setLoading(false);
      setStatusMessage('');

    } catch (err: any) {
      if (sessionId !== searchSessionId.current) return;
      setError(err?.message ?? 'Hotel search failed. Please try again.');
      setHasSearched(true);
      setLoading(false);
      setStatusMessage('');
    }
  }, []);

  const loadMore = useCallback(async () => {
    // No-op since we fetch all hotels now
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
        setHotel(normHotel(cityHotel, params.rawResult ?? {}, sd));
      } catch (err: any) {
        // If we have rawResult, build a basic hotel from it even without static details
        if (params.rawResult) {
          const cityHotel = { HotelCode: params.hotelCode };
          setHotel(normHotel(cityHotel, params.rawResult, undefined));
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

      if (roomList.length > 0) {
        setRooms(roomList.map((r: any, i: number) => normRoom(r, i)));
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
  traceId: string
): Promise<PreBookResponse> {
  const tid = traceId?.trim();
  if (!tid) {
    throw new Error(
      'Missing hotel search session (traceId). Open hotel results and run your search again, then pick your room.'
    );
  }

  const raw: PreBookResult = await preBookHotel({ bookingCode, traceId: tid });

  // ── Handle 402 / TBO_INSUFFICIENT_BALANCE gracefully ─────────────────────
  // When the TBO account has no balance, prebook returns a structured error.
  // We return a minimal PreBookResponse so the booking flow can continue —
  // cancellation policy will show "unavailable" but checkout is not blocked.
  const errorCode = (raw as any)?.error?.code ?? (raw as any)?.code ?? '';
  const errorMsg = (raw as any)?.error?.message ?? (raw as any)?.message ?? '';
  if (
    errorCode === 'TBO_INSUFFICIENT_BALANCE' ||
    /insufficient.balance/i.test(errorMsg)
  ) {
    return {
      traceId: tid,
      bookingCode,
      confirmedPrice: 0,
      confirmedTaxes: 0,
      cancellationPolicy: 'Cancellation policy unavailable',
      cancelPolicies: [],
      roomAvailable: true,        // don't block checkout
      priceChanged: false,
      sessionExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };
  }

  const tboResultRaw = raw.HotelResult || raw;
  const tboResult = Array.isArray(tboResultRaw) ? tboResultRaw[0] : tboResultRaw;

  // ── Extract room detail — prebook returns Rooms[] with cancellation data ──
  // Backend instruction: use data.HotelResult[0].Rooms[0].CancellationPolicies
  // and data.HotelResult[0].Rooms[0].LastCancellationDate
  const roomDetail =
    tboResult?.HotelRoomsDetails?.[0] ??
    tboResult?.Rooms?.[0] ??
    tboResult?.RoomDetails?.[0];
  const priceObj = roomDetail?.Price ?? tboResult?.Price ?? {};

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
  const originalPrice = Number(raw.Price?.PublishedPriceRoundedOff ?? 0);

  // ── Extract cancellation policy from prebook response ────────────────────
  // Priority: roomDetail.CancellationPolicies → roomDetail.LastCancellationDate
  // → tboResult-level fallbacks
  const cancelPolicies = findPolicies(tboResult);
  const lastCancellationDate = findLastCancellationDate(tboResult);

  const effectiveCancelPolicies: import('../stores/hotelStore').CancelPolicySlab[] =
    cancelPolicies.length > 0
      ? cancelPolicies
      : lastCancellationDate
      ? [
          {
            charge: 0,
            chargeType: 0,
            currency: 'INR',
            fromDate: undefined,
            toDate: lastCancellationDate,
          },
          {
            charge: 100,
            chargeType: 2,
            currency: 'INR',
            fromDate: lastCancellationDate,
            toDate: undefined,
          },
        ]
      : [];

  const cancellationPolicy =
    findCancellationString(tboResult) ||
    (lastCancellationDate && safeFormatDate(lastCancellationDate)
      ? `Free cancellation before ${safeFormatDate(lastCancellationDate)}`
      : null) ||
    (effectiveCancelPolicies.length === 0 ? 'Cancellation policy unavailable' : 'Please check hotel cancellation policy');

  // Extract corporateBookingAllowed from validationInfo
  const validationInfo = tboResult?.ValidationInfo ?? tboResult?.validationInfo ?? {};
  const corporateBookingAllowed = Boolean(
    validationInfo?.CorporateBookingAllowed ??
    validationInfo?.corporateBookingAllowed ??
    false
  );

  return {
    traceId: tid,
    bookingCode: raw.BookingCode ?? bookingCode,
    confirmedPrice,
    confirmedTaxes,
    cancellationPolicy,
    cancelPolicies: effectiveCancelPolicies,
    roomAvailable: raw.IsHotelPolicyComplied !== false,
    priceChanged: Boolean(raw.IsPriceChanged),
    originalPrice: originalPrice && originalPrice !== confirmedPrice ? originalPrice : undefined,
    sessionExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    isPackageFare: raw.IsPackageFare,
    isPackageDetailsMandatory: raw.IsPackageDetailsMandatory,
    netAmount,
    corporateBookingAllowed,
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
  requestType: 1 | 4 = 1
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



