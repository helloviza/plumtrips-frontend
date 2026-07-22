import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isHotelSearchTraceExpired } from '../lib/hotelSearchSession';

export interface Guest {
  id: string;
  title: 'Mr' | 'Mrs' | 'Ms' | 'Miss' | 'Mstr';
  firstName: string;
  middleName?: string;
  lastName: string;
  paxType?: 1 | 2;   // 1=Adult, 2=Child
  age?: number;
  leadGuest?: boolean;
  pan?: string;
  gender?: 'Male' | 'Female' | 'Other';
  passportNumber?: string;
  passportExpiry?: string;
  nationality?: string;
}

export interface CancelPolicySlab {
  charge: number;
  chargeType: number;
  currency: string;
  fromDate?: string;
  toDate?: string;
  remarks?: string;
  FromDate?: string;
  ToDate?: string;
  ChargeType?: string | number;
  CancellationCharge?: number;
  Currency?: string;
}

export interface Room {
  id: string;
  name: string;
  type: string;
  bedType: string;
  occupancy: string;
  size: number;
  view: string;
  breakfast: boolean;
  cancellationPolicy: string;
  cancellationDate?: string;
  cancelPolicies?: CancelPolicySlab[];
  amenities: string[];
  images?: string[];
  price: number;
  originalPrice?: number;
  taxesAndFees: number;
  additionalCharges?: number;
  additionalChargesCurrency?: string;
  quantity: number;
  /** Extra name lines from supplier (e.g. TBO Name[1]) */
  roomSubtitle?: string;
  /** Human label for MealType */
  mealPlanLabel?: string;
  /** Raw meal type code for logic */
  _mealType?: string;
  // Raw fields for prebook
  _bookingCode?: string;
  _isRefundable?: boolean;
}

export interface Hotel {
  id: string;
  name: string;
  starRating: number;
  location: string;
  landmark: string;
  distance: string;
  images: string[];
  amenities: string[];
  description?: string;
  rating: number;
  reviewCount: number;
  price: number;
  originalPrice?: number;
  freeCancellation: boolean;
  ixigoAssured: boolean;
  payAtHotel: boolean;
  propertyType: string;
  checkInTime?: string;
  checkOutTime?: string;
  isInternational?: boolean;
    isCorporateAllowed?: boolean;
  policies: {
    ageRestriction?: string;
    idProof: string[];
    localGuest: string;
  };
  nearbyLandmarks: Array<{ name: string; distance: string }>;
  // Raw fields for room selection / prebook
  _hotelCode?: string;
  _mealType?: string;
  _rooms?: any[];
  _taxes?: number;
  _traceId?: string;
  _latitude?: number;
  _longitude?: number;
}

export interface RoomGuestConfig {
  adults: number;
  children: number;
  childrenAges: number[];
}

export interface SearchParams {
  location: string;
  locationId?: string;
  destinationCountryCode?: string;
  nationality?: string;
  checkIn: Date | null;
  checkOut: Date | null;
  rooms: number;
  adults: number;
  children: number;
  childrenAges: number[];
  freeCancellation: boolean;
  hourlyStay: boolean;
  hourlyDuration?: 3 | 6 | 12;
  travelStyle?: 'Friends' | 'Family' | 'Couple' | 'Solo';
  roomGuests?: RoomGuestConfig[];
}

export interface Filters {
  priceRange: [number, number];
  starRatings: number[];
  propertyTypes: string[];
  amenities: string[];
  cancellationPolicy: 'all' | 'free' | 'non-refundable';
  neighborhoods: string[];
  travelerTypes: string[];
  reviewScore: number;
  payAtHotel: boolean;
}

export interface AddOns {
  travelInsurance: boolean;
  airportTransfer: boolean;
  breakfastUpgrade: boolean;
  roomUpgrade: boolean;
  lateCheckout: boolean;
  flightBooking: boolean;
}

export interface UserData {
  isLoggedIn: boolean;
  mobile: string;
  email: string;
  firstName: string;
  lastName: string;
  savedPaymentMethods: Array<{ id: string; type: string; last4: string; brand: string }>;
  mmtBlackPoints?: number;
  ixigoCoins?: number;
}

// ── Booking flow state ──────────────────────────────────────────────────────
export type BookingStep = 'search' | 'results' | 'detail' | 'rooms' | 'prebook' | 'guests' | 'checkout' | 'confirmed';

export interface PreBookResponse {
  traceId: string;
  bookingCode: string;
  confirmedPrice: number;
  confirmedTaxes: number;
  cancellationPolicy: string;
  cancelPolicies?: CancelPolicySlab[];
  /** IsRefundable from the Prebook API response (room level) */
  isRefundable?: boolean;
  roomAvailable: boolean;
  priceChanged: boolean;
  originalPrice?: number;
  sessionExpiresAt: number;
  // Pass-through fields required by /book
  isPackageFare?: boolean;
  isPackageDetailsMandatory?: boolean;
  netAmount?: number;
  /** Index into selectedRooms[] that this prebook belongs to */
  roomIndex?: number;
  /** From TBO validationInfo.CorporateBookingAllowed — only show corporate PAN field when true */
  corporateBookingAllowed?: boolean;
}

interface HotelBookingState {
  // Search
  searchParams: SearchParams;
  setSearchParams: (params: Partial<SearchParams>) => void;

  // Filters
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  resetFilters: () => void;

  // Selected Hotel
  selectedHotel: Hotel | null;
  setSelectedHotel: (hotel: Hotel | null) => void;

  // Selected Rooms
  selectedRooms: Room[];
  addRoom: (room: Room) => void;
  removeRoom: (roomId: string) => void;
  updateRoomQuantity: (roomId: string, quantity: number) => void;
  clearRooms: () => void;

  // Guests
  guests: Guest[];
  setGuests: (guests: Guest[]) => void;
  addGuest: (guest: Guest) => void;
  updateGuest: (guestId: string, guest: Partial<Guest>) => void;
  removeGuest: (guestId: string) => void;

  // Add-ons
  addOns: AddOns;
  setAddOns: (addOns: Partial<AddOns>) => void;

  // User
  user: UserData;
  setUser: (user: Partial<UserData>) => void;
  login: (mobile: string, otp: string) => void;
  logout: () => void;

  // ── Booking flow ──
  currentStep: BookingStep;
  setCurrentStep: (step: BookingStep) => void;

  traceId: string | null;
  /** Wall time when traceId was last set from a successful /hotels/search (for stale-session guard). */
  traceIdIssuedAt: number | null;
  bookingCode: string | null;
  /** All booking codes — one per selected room, in selectedRooms[] order */
  bookingCodes: string[];
  setTraceId: (id: string | null) => void;
  setBookingCode: (code: string) => void;
  setBookingCodes: (codes: string[]) => void;

  preBookResponse: PreBookResponse | null;
  setPreBookResponse: (res: PreBookResponse | null) => void;

  /** Per-room prebook responses — index matches selectedRooms[] index */
  preBookResponses: (PreBookResponse | null)[];
  setPreBookResponses: (responses: (PreBookResponse | null)[]) => void;
  setPreBookResponseForRoom: (index: number, res: PreBookResponse | null) => void;

  bookingId: string | null;
  pnr: string | null;
  tboReferenceNo: string | null;
  voucherUrl: string | null;
  setBookingId: (id: string) => void;
  setPnr: (pnr: string) => void;
  setTboReferenceNo: (ref: string) => void;
  setVoucherUrl: (url: string) => void;

  // Raw search results map (HotelCode → raw result) for prebook/book
  searchResultsMap: Record<string, any>;
  setSearchResultsMap: (map: Record<string, any>) => void;

  // Confirmation details from /book and /booking-detail
  confirmationNo: string | null;
  setConfirmationNo: (no: string) => void;
  bookingDetail: any | null;
  setBookingDetail: (detail: any) => void;

  // Payment guard
  paymentSubmitted: boolean;
  setPaymentSubmitted: (v: boolean) => void;

  /** Amount charged at checkout (INR), used on confirmation for consistency with payment. */
  confirmedPaidAmount: number | null;
  setConfirmedPaidAmount: (amount: number | null) => void;

  // Session
  sessionExpired: boolean;
  setSessionExpired: (v: boolean) => void;

  // Room Guest Names (Pre-filled from search modal)
  roomGuestNames: string[];
  setRoomGuestNames: (names: string[]) => void;

  // Special Requests
  specialRequests: string;
  setSpecialRequests: (requests: string) => void;

  // Promo Code
  promoCode: string;
  promoDiscount: number;
  applyPromoCode: (code: string) => void;

  // View State
  viewMode: 'list' | 'map';
  setViewMode: (mode: 'list' | 'map') => void;
  sortBy: 'cheapest' | 'rating' | 'distance' | 'reviews';
  setSortBy: (sort: 'cheapest' | 'rating' | 'distance' | 'reviews') => void;
  sortDirection: 'asc' | 'desc';
  setSortDirection: (dir: 'asc' | 'desc') => void;

  // Reset
  resetBooking: () => void;
}

const defaultSearchParams: SearchParams = {
  location: '',
  locationId: undefined,
  destinationCountryCode: undefined,
  nationality: 'IN',
  checkIn: null,
  checkOut: null,
  rooms: 1,
  adults: 2,
  children: 0,
  childrenAges: [],
  freeCancellation: false,
  hourlyStay: false,
};

const defaultFilters: Filters = {
  priceRange: [0, 50000],
  starRatings: [],
  propertyTypes: [],
  amenities: [],
  cancellationPolicy: 'all',
  neighborhoods: [],
  travelerTypes: [],
  reviewScore: 0,
  payAtHotel: false,
};

const defaultAddOns: AddOns = {
  travelInsurance: false,
  airportTransfer: false,
  breakfastUpgrade: false,
  roomUpgrade: false,
  lateCheckout: false,
  flightBooking: false,
};

const defaultUser: UserData = {
  isLoggedIn: false,
  mobile: '',
  email: '',
  firstName: '',
  lastName: '',
  savedPaymentMethods: [],
};

export const useHotelStore = create<HotelBookingState>()(
  persist(
    (set) => ({
      searchParams: defaultSearchParams,
      filters: defaultFilters,
      selectedHotel: null,
      selectedRooms: [],
      guests: [],
      addOns: defaultAddOns,
      user: defaultUser,
      currentStep: 'search',
      traceId: null,
      traceIdIssuedAt: null,
      bookingCode: null,
      bookingCodes: [],
      preBookResponse: null,
      preBookResponses: [],
      bookingId: null,
      pnr: null,
      tboReferenceNo: null,
      voucherUrl: null,
      searchResultsMap: {},
      confirmationNo: null,
      bookingDetail: null,
      paymentSubmitted: false,
      confirmedPaidAmount: null,
      sessionExpired: false,
      roomGuestNames: [],
      specialRequests: '',
      promoCode: '',
      promoDiscount: 0,
      viewMode: 'list',
      sortBy: 'rating',
      sortDirection: 'desc',

      setSearchParams: (params) =>
        set((s) => ({ searchParams: { ...s.searchParams, ...params } })),

      setFilters: (filters) =>
        set((s) => ({ filters: { ...s.filters, ...filters } })),

      resetFilters: () => set({ filters: defaultFilters }),

      setSelectedHotel: (hotel) => set({ selectedHotel: hotel }),

      addRoom: (room) =>
        set((s) => {
          const existing = s.selectedRooms.find((r) => r.id === room.id);
          if (existing) {
            return {
              selectedRooms: s.selectedRooms.map((r) =>
                r.id === room.id ? { ...r, quantity: r.quantity + 1 } : r
              ),
            };
          }
          return { selectedRooms: [...s.selectedRooms, { ...room, quantity: 1 }] };
        }),

      removeRoom: (roomId) =>
        set((s) => ({ selectedRooms: s.selectedRooms.filter((r) => r.id !== roomId) })),

      updateRoomQuantity: (roomId, quantity) =>
        set((s) => ({
          selectedRooms: s.selectedRooms.map((r) =>
            r.id === roomId ? { ...r, quantity } : r
          ),
        })),

      clearRooms: () => set({ selectedRooms: [] }),

      setGuests: (guests) => set({ guests }),
      addGuest: (guest) => set((s) => ({ guests: [...s.guests, guest] })),
      updateGuest: (guestId, guest) =>
        set((s) => ({
          guests: s.guests.map((g) => (g.id === guestId ? { ...g, ...guest } : g)),
        })),
      removeGuest: (guestId) =>
        set((s) => ({ guests: s.guests.filter((g) => g.id !== guestId) })),

      setAddOns: (addOns) => set((s) => ({ addOns: { ...s.addOns, ...addOns } })),

      setUser: (user) => set((s) => ({ user: { ...s.user, ...user } })),
      login: (mobile, otp) => {
        if (otp.length === 6) {
          set((s) => ({ user: { ...s.user, isLoggedIn: true, mobile } }));
        }
      },
      logout: () => set({ user: defaultUser }),

      setCurrentStep: (step) => set({ currentStep: step }),
      setTraceId: (id) =>
        set({ traceId: id, traceIdIssuedAt: id ? Date.now() : null }),
      setBookingCode: (code) => set({ bookingCode: code }),
      setBookingCodes: (codes) => set({ bookingCodes: codes }),
      setPreBookResponse: (res) => set({ preBookResponse: res }),
      setPreBookResponses: (responses) => set({ preBookResponses: responses }),
      setPreBookResponseForRoom: (index, res) =>
        set((s) => {
          const updated = [...s.preBookResponses];
          // Grow the array if needed
          while (updated.length <= index) updated.push(null);
          updated[index] = res;
          // Keep legacy single preBookResponse in sync with room 0 for backward compat
          return { preBookResponses: updated, ...(index === 0 ? { preBookResponse: res } : {}) };
        }),
      setBookingId: (id) => set({ bookingId: id }),
      setPnr: (pnr) => set({ pnr }),
      setTboReferenceNo: (tboReferenceNo) => set({ tboReferenceNo }),
      setVoucherUrl: (voucherUrl) => set({ voucherUrl }),
      setSearchResultsMap: (map) => set({ searchResultsMap: map }),
      setConfirmationNo: (no) => set({ confirmationNo: no }),
      setBookingDetail: (detail) => set({ bookingDetail: detail }),
      setPaymentSubmitted: (paymentSubmitted) => set({ paymentSubmitted }),
      setConfirmedPaidAmount: (confirmedPaidAmount) => set({ confirmedPaidAmount }),
      setSessionExpired: (sessionExpired) => set({ sessionExpired }),
      setRoomGuestNames: (roomGuestNames) => set({ roomGuestNames }),
      setSpecialRequests: (specialRequests) => set({ specialRequests }),

      applyPromoCode: (code) => {
        set({ promoCode: code, promoDiscount: 0 });
      },

      setViewMode: (mode) => set({ viewMode: mode }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setSortDirection: (dir) => set({ sortDirection: dir }),

      resetBooking: () =>
        set({
          selectedHotel: null,
          selectedRooms: [],
          guests: [],
          addOns: defaultAddOns,
          bookingId: null,
          pnr: null,
          tboReferenceNo: null,
          voucherUrl: null,
          traceId: null,
          traceIdIssuedAt: null,
          bookingCode: null,
          bookingCodes: [],
          preBookResponse: null,
          preBookResponses: [],
          searchResultsMap: {},
          confirmationNo: null,
          bookingDetail: null,
          paymentSubmitted: false,
          confirmedPaidAmount: null,
          sessionExpired: false,
          specialRequests: '',
          promoCode: '',
          promoDiscount: 0,
          currentStep: 'search',
        }),
    }),
    {
      name: 'hotel-booking-storage',
      partialize: (s) => ({
        user: s.user,
        searchParams: s.searchParams,
        // Persist critical booking state for recovery
        traceId: s.traceId,
        traceIdIssuedAt: s.traceIdIssuedAt,
        bookingCode: s.bookingCode,
        bookingCodes: s.bookingCodes,
        preBookResponse: s.preBookResponse,
        preBookResponses: s.preBookResponses,
        selectedHotel: s.selectedHotel,
        selectedRooms: s.selectedRooms,
        guests: s.guests,
        currentStep: s.currentStep,
        // Persist post-booking state so confirmation page survives a reload
        bookingId: s.bookingId,
        confirmationNo: s.confirmationNo,
        tboReferenceNo: s.tboReferenceNo,
        voucherUrl: s.voucherUrl,
        bookingDetail: s.bookingDetail,
        confirmedPaidAmount: s.confirmedPaidAmount,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.searchParams) {
          const { checkIn, checkOut } = state.searchParams;
          if (checkIn) state.searchParams.checkIn = new Date(checkIn);
          if (checkOut) state.searchParams.checkOut = new Date(checkOut);
        }
        // Ensure new array fields exist after hydration from old persisted state
        if (state && !state.preBookResponses) state.preBookResponses = [];
        if (state && !state.bookingCodes) state.bookingCodes = [];
        if (
          state &&
          isHotelSearchTraceExpired(state.traceId, state.traceIdIssuedAt)
        ) {
          state.traceId = null;
          state.traceIdIssuedAt = null;
          state.bookingCode = null;
          state.bookingCodes = [];
          state.preBookResponse = null;
          state.preBookResponses = [];
        }
        // Check session expiry on rehydrate
        if (state?.preBookResponse) {
          if (Date.now() > state.preBookResponse.sessionExpiresAt) {
            state.preBookResponse = null;
            state.preBookResponses = [];
            state.sessionExpired = true;
          }
        }
      },
    }
  )
);



