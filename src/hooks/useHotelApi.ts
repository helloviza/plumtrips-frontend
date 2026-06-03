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

import { useState, useCallback } from 'react';
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
  type TboCity,
  type StaticHotelDetail,
  type PreBookResult,
  type BookParams,
  type BookResult,
} from '../services/hotelApi';
import type { Hotel, Room, PreBookResponse } from '../stores/hotelStore';
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

  // Cheapest room drives the card-level price
  const cheapest = rooms.reduce(
    (min: any, r: any) => (!min || Number(r.TotalFare) < Number(min.TotalFare) ? r : min),
    null
  );

  const totalFare = cheapest ? Number(cheapest.TotalFare ?? 0) : 0;
  const taxes = cheapest ? Number(cheapest.TotalTax ?? 0) : 0;
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
  const isRefundable = Boolean(raw.IsRefundable);
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
  let occupancy = '';
  if (adults > 0 || children > 0) {
    const parts: string[] = [];
    if (adults > 0) parts.push(`${adults} adult${adults !== 1 ? 's' : ''}`);
    if (children > 0) parts.push(`${children} child${children !== 1 ? 'ren' : ''}`);
    occupancy = parts.join(' · ');
  } else {
    occupancy = 'Up to 2 adults';
  }

  const size = Number(raw.RoomSize ?? raw.SquareFeet ?? raw.Size ?? raw.RoomSizeSqFt ?? 0) || 0;
  const view = String(raw.ViewType ?? raw.Facing ?? raw.RoomView ?? '').trim();

  const published = Number(
    raw.PublishedPrice ?? raw.PublishedPriceRoundedOff ?? raw.Price?.PublishedPriceRoundedOff ?? 0
  );
  const originalPrice =
    published > 0 && published > price + taxes ? Math.round(published) : undefined;

  return {
    id: String(raw.BookingCode ?? index),
    name: roomName,
    type: roomName,
    bedType: extractBedType(roomName),
    occupancy,
    size,
    view,
    breakfast: hasBreakfast,
    cancellationPolicy: isRefundable
      ? 'Free cancellation available'
      : 'Non-refundable',
    amenities,
    price,
    originalPrice,
    taxesAndFees: taxes,
    additionalCharges: Number(raw.additionalCharges || raw.AdditionalCharges || 0),
    quantity: 1,
    roomSubtitle: roomSubtitle || undefined,
    mealPlanLabel: mealPlanLabel || undefined,
    _bookingCode: String(raw.BookingCode ?? ''),
    _mealType: mealType,
    _isRefundable: isRefundable,
  } as Room & {
    _bookingCode: string;
    _mealType: string;
    _isRefundable: boolean;
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
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const [allCityHotels, setAllCityHotels] = useState<any[]>([]);
  const [currentParams, setCurrentParams] = useState<HotelSearchInput | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchBatch = async (
    params: HotelSearchInput,
    cityHotels: any[]
  ) => {
    if (cityHotels.length === 0) return;

    const cityHotelMap: Record<string, any> = {};
    for (const h of cityHotels) {
      const code = h.HotelCode || h.hotelCode;
      if (code) cityHotelMap[code] = h;
    }

    const hotelCodes = cityHotels
      .map((h: any) => h.HotelCode || h.hotelCode)
      .filter(Boolean)
      .join(',');

    setStatusMessage('Searching for available rooms…');
    const { hotelResults: searchResults, traceId: searchTraceId } = await searchHotels({
      ...params,
      hotelCodes,
    });

    setRawResults(searchResults);

    if (searchTraceId) {
      useHotelStore.getState().setTraceId(searchTraceId);
    } else if (searchResults.length > 0) {
      toast.error(
        'Hotel search did not return a trace id. You may need to search again before booking.',
        { duration: 6000 }
      );
    }

    if (searchResults.length === 0) {
      setError('No rooms available for the selected dates. Try different dates.');
      return;
    }

    setStatusMessage('Loading hotel details…');
    const resultCodes = searchResults
      .map((r: any) => r.HotelCode || r.hotelCode)
      .filter(Boolean);

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
      // Note: searchTraceId doesn't accurately represent per-hotel chunked TraceId
      // because backend injects it inside sr._traceId. normHotel picks it up.
      return normHotel(cityHotel, sr, sd, sr._traceId || searchTraceId);
    });

    setHotels(normalized);
    setHasMore(false);
  };

  const search = useCallback(async (params: HotelSearchInput) => {
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
            actualCityCode = cities[0].cityCode; // Use exact TBO Code, not CC:Code
            // Store the resolved country code so checkout knows if it's an international booking
            if (cities[0].countryCode) {
              useHotelStore.getState().setSearchParams({ destinationCountryCode: cities[0].countryCode });
            }
          }
        }
      }
      
      const cityHotels: any[] = await getCityHotels(actualCityCode);

      if (cityHotels.length === 0) {
        setError('No hotels found for this city. Try a different destination.');
        return;
      }

      setAllCityHotels(cityHotels);
      setCurrentParams(params);
      
      await fetchBatch(params, cityHotels);
    } catch (err: any) {
      setError(err?.message ?? 'Hotel search failed. Please try again.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  }, []);

  const loadMore = useCallback(async () => {
    // No-op since we fetch all hotels now
  }, []);

  return { hotels, rawResults, loading, error, statusMessage, search, loadMore, hasMore, loadingMore };
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

  // TBO prebook response nests price inside HotelRoomsDetails[0].Price
  // Fall back to top-level NetAmount / Price for other providers
  const roomDetail = raw.HotelRoomsDetails?.[0];
  const priceObj = roomDetail?.Price ?? raw.Price ?? {};

  // Display / UI only — never sent on POST /hotels/book (server uses PreBook for price).
  let netAmount = Number(raw.NetAmount ?? 0);
  if (!netAmount) {
    // Sum across all room details in case of multi-room bookings
    const details: any[] = raw.HotelRoomsDetails ?? [];
    netAmount = details.reduce(
      (sum: number, d: any) => sum + Number(d?.Price?.OfferedPriceRoundedOff ?? 0),
      0
    );
  }
  if (!netAmount) {
    netAmount = Number(priceObj.OfferedPriceRoundedOff ?? priceObj.PublishedPriceRoundedOff ?? 0);
  }

  // Tax is separate from the offered price in TBO
  const tax = Number(priceObj.Tax ?? priceObj.OtherCharges ?? 0);

  const confirmedPrice = netAmount;
  const confirmedTaxes = tax;

  const originalPrice = Number(
    priceObj.PublishedPriceRoundedOff ??
    raw.Price?.PublishedPriceRoundedOff ??
    0
  );

  const cancellationPolicy =
    raw.CancellationPolicy ??
    roomDetail?.CancellationPolicies?.[0]?.PolicyDescription ??
    'Please check hotel cancellation policy';

  return {
    traceId: tid,
    bookingCode: raw.BookingCode ?? bookingCode,
    confirmedPrice,
    confirmedTaxes,
    cancellationPolicy,
    roomAvailable: raw.IsHotelPolicyComplied !== false,
    priceChanged: Boolean(raw.IsPriceChanged),
    originalPrice: originalPrice && originalPrice !== confirmedPrice ? originalPrice : undefined,
    sessionExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
    isPackageFare: raw.IsPackageFare,
    isPackageDetailsMandatory: raw.IsPackageDetailsMandatory,
    netAmount,
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

