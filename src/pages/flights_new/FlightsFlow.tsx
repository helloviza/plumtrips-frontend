// ============================================================
//  FlightsFlow.tsx — Option B: URL-driven page state
//
//  Pages map to URLs:
//    /flights            → search
//    /flights/results    → results
//    /flights/booking    → booking
//    /flights/confirmation → confirmation
//
//  State is persisted in sessionStorage so refresh works.
//  Query params are passed at every navigation for shareability.
// ============================================================

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchPage from "./SearchPage";
import ResultsPage from "./ResultsPage";
import BookingPage from "./BookingPage";
import ConfirmationPage from "./ConfirmationPage";
import type { SearchForm, DisplayFlight, FareTier, Airport } from "../../lib/types_t";

export type CityLeg = { from: Airport; to: Airport; departDate: string };

const SESSION_KEY = "flightFlowState";

// ── International route detection ─────────────────────────────────────────────
const INTERNATIONAL_CODES = new Set([
  "DXB","AUH","SHJ","DOH","BAH","KWI","MCT","MLE",
  "CMB","KTM","DAC","RGN","BKK","SIN","KUL","CGK",
  "MNL","HKG","TPE","PEK","PVG","ICN","NRT","HND",
  "SYD","MEL","JFK","LAX","ORD","LHR","CDG","FRA",
  "AMS","IST","CAI","NBO","ADD","JNB",
]);

function isInternationalRoute(form: SearchForm | null): boolean {
  if (!form) return false;
  const fromCountry = form.from.country ?? "India";
  const toCountry = form.to.country ?? "India";
  if (fromCountry !== toCountry) return true;
  return INTERNATIONAL_CODES.has(form.to.code) || INTERNATIONAL_CODES.has(form.from.code);
}

// ── State shape ───────────────────────────────────────────────────────────────
interface FlightState {
  searchForm: SearchForm | null;
  multiLegs?: CityLeg[];

  selectedFlight: DisplayFlight | null;
  selectedTier: FareTier | null;

  selectedReturnFlight: DisplayFlight | null;
  selectedReturnTier: FareTier | null;

  selectedLegs: Array<{ flight: DisplayFlight; tier: FareTier } | null>;

  bookingId?: number;
  pnr?: string;
  passengerNames?: string[];
  contactEmail?: string;
  totalPaid?: number;
}

const DEFAULT_STATE: FlightState = {
  searchForm: null,
  selectedFlight: null,
  selectedTier: null,
  selectedReturnFlight: null,
  selectedReturnTier: null,
  selectedLegs: [],
};

const DEFAULT_SEARCH_FORM: SearchForm = {
  tripType: "oneWay",
  from: { code: "DEL", city: "New Delhi", name: "Indira Gandhi International", cityCode: "DEL", country: "India", countryCode: "IN", label: "New Delhi (DEL)" },
  to:   { code: "BOM", city: "Mumbai",    name: "Chhatrapati Shivaji Maharaj International", cityCode: "BOM", country: "India", countryCode: "IN", label: "Mumbai (BOM)" },
  departDate:  new Date().toLocaleDateString("en-CA"),
  returnDate:  "",
  adults:      1,
  children:    0,
  infants:     0,
  cabinClass:  "Economy",
  nonStopOnly: false,
  fareType:    "Regular",
};

// ── Build query params from SearchForm ────────────────────────────────────────
function searchFormToParams(form: SearchForm): Record<string, string> {
  return {
    from:     form.from.code,
    to:       form.to.code,
    depart:   form.departDate,
    trip:     form.tripType,
    adults:   String(form.adults),
    children: String(form.children),
    infants:  String(form.infants),
    cabin:    form.cabinClass,
    fare:     form.fareType,
    ...(form.returnDate  && { return:  form.returnDate }),
    ...(form.nonStopOnly && { nonStop: "1" }),
  };
}

// ── Safely write state to sessionStorage ──────────────────────────────────────
function persistState(s: FlightState) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
  } catch { /* ignore quota errors */ }
}

// ── Resolve flight id across possible field names ─────────────────────────────
function flightId(flight: DisplayFlight): string {
  const f = flight as any;
  return String(f.id ?? f.flightId ?? f._id ?? f.key ?? "");
}

// ── Restore state from sessionStorage on refresh ──────────────────────────────
function buildInitialState(): FlightState {
  const pathname = window.location.pathname;
  const onBookingOrConfirmation =
    pathname.includes("/booking") || pathname.includes("/confirmation");

  // Always try SESSION_KEY first — this is what keeps booking/confirmation
  // alive across a refresh.
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FlightState;
      // For booking/confirmation pages we MUST have a selectedFlight;
      // for other pages any cached state is fine.
      if (!onBookingOrConfirmation || parsed.selectedFlight) {
        return parsed;
      }
    }
  } catch { /* ignore */ }

  // flightSearch key written by external entry points
  try {
    const raw = sessionStorage.getItem("flightSearch");
    if (raw) {
      sessionStorage.removeItem("flightSearch");
      const { form, multiLegs } = JSON.parse(raw) as { form: SearchForm; multiLegs: CityLeg[] | null };
      return {
        ...DEFAULT_STATE,
        searchForm: form,
        multiLegs: multiLegs ?? undefined,
        selectedLegs: Array(multiLegs?.length ?? 0).fill(null),
      };
    }
  } catch { /* ignore */ }

  // If we land directly on /results with no state, seed a default form so
  // the results page can at least render the search bar.
  if (pathname.includes("/results")) {
    return { ...DEFAULT_STATE, searchForm: DEFAULT_SEARCH_FORM };
  }

  return DEFAULT_STATE;
}

// ── URL → logical page mapping ────────────────────────────────────────────────
type Page = "search" | "results" | "booking" | "confirmation";

function urlToPage(pathname: string): Page {
  if (pathname.includes("/results"))      return "results";
  if (pathname.includes("/booking"))      return "booking";
  if (pathname.includes("/confirmation")) return "confirmation";
  return "search";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FlightsFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<FlightState>(buildInitialState);

  // Keep sessionStorage in sync (backup for minor state updates that don't
  // go through the explicit persistState() call before navigation).
  useEffect(() => {
    persistState(state);
  }, [state]);

  // ── Navigate with query params ───────────────────────────────────────────────
  function goTo(page: Page, params?: Record<string, string>) {
    const base = "/flights-new";
    const path = page === "search" ? base : `${base}/${page}`;
    const search = params && Object.keys(params).length
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    navigate(path + search);
    window.scrollTo({ top: 0 });
  }

  // ── Shared helper: update state + persist + navigate atomically ──────────────
  function setAndPersist(updater: (s: FlightState) => FlightState): FlightState {
    let next!: FlightState;
    setState((s) => {
      next = updater(s);
      persistState(next); // write BEFORE navigate so refresh sees it
      return next;
    });
    return next;
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handleSearch(form: SearchForm, legs?: CityLeg[]) {
    const next: FlightState = {
      ...state,
      searchForm: form,
      multiLegs: legs,
      selectedFlight: null,
      selectedTier: null,
      selectedReturnFlight: null,
      selectedReturnTier: null,
      selectedLegs: Array(legs?.length ?? 0).fill(null),
    };
    persistState(next);
    setState(next);
    goTo("results", searchFormToParams(form));
  }

  function handleDateChange(newDate: string) {
    setState((s) => {
      if (!s.searchForm) return s;
      const next = {
        ...s,
        searchForm: { ...s.searchForm, departDate: newDate },
        selectedFlight: null,
        selectedTier: null,
        selectedReturnFlight: null,
        selectedReturnTier: null,
      };
      persistState(next);
      return next;
    });

    const existing = Object.fromEntries(new URLSearchParams(location.search));
    navigate(
      `/flights-new/results?${new URLSearchParams({ ...existing, depart: newDate }).toString()}`
    );
    window.scrollTo({ top: 0 });
  }

  function handleBook(flight: DisplayFlight, tier: FareTier, legIndex?: number) {
    const tripType = state.searchForm?.tripType;
    const totalLegs = state.multiLegs?.length ?? 1;
    const baseParams = state.searchForm ? searchFormToParams(state.searchForm) : {};

    // ── Round-Trip ────────────────────────────────────────────────────────────
    if (tripType === "roundTrip") {
      if (!state.selectedFlight) {
        // First leg — stay on results
        const next: FlightState = { ...state, selectedFlight: flight, selectedTier: tier };
        persistState(next);
        setState(next);

        const existing = Object.fromEntries(new URLSearchParams(location.search));
        navigate(
          `/flights-new/results?${new URLSearchParams({
            ...existing,
            outboundId:   flightId(flight),
            outboundTier: tier.name ?? "",
          }).toString()}`
        );
      } else {
        // Second leg — go to booking
        const next: FlightState = {
          ...state,
          selectedReturnFlight: flight,
          selectedReturnTier: tier,
        };
        persistState(next);
        setState(next);

        goTo("booking", {
          ...baseParams,
          outboundId:   flightId(state.selectedFlight),
          outboundTier: state.selectedTier?.name ?? "",
          returnId:     flightId(flight),
          returnTier:   tier.name ?? "",
        });
      }
      return;
    }

    // ── Multi-City ────────────────────────────────────────────────────────────
    if (tripType === "multiCity" && legIndex !== undefined) {
      const newLegs = [...state.selectedLegs];
      newLegs[legIndex] = { flight, tier };
      const allLegsSelected = newLegs.every(Boolean) && newLegs.length === totalLegs;

      if (allLegsSelected) {
        const next: FlightState = {
          ...state,
          selectedFlight: newLegs[0]!.flight,
          selectedTier:   newLegs[0]!.tier,
          selectedLegs:   newLegs,
        };
        persistState(next);
        setState(next);

        const legParams = newLegs.reduce<Record<string, string>>((acc, leg, i) => {
          if (leg) {
            acc[`leg${i}Id`]   = flightId(leg.flight);
            acc[`leg${i}Tier`] = leg.tier.name ?? "";
          }
          return acc;
        }, {});

        goTo("booking", { ...baseParams, ...legParams });
      } else {
        const next: FlightState = { ...state, selectedLegs: newLegs };
        persistState(next);
        setState(next);

        const existing = Object.fromEntries(new URLSearchParams(location.search));
        navigate(
          `/flights-new/results?${new URLSearchParams({
            ...existing,
            [`leg${legIndex}Id`]:   flightId(flight),
            [`leg${legIndex}Tier`]: tier.name ?? "",
          }).toString()}`
        );
      }
      return;
    }

    // ── One-Way ───────────────────────────────────────────────────────────────
    const next: FlightState = { ...state, selectedFlight: flight, selectedTier: tier };
    persistState(next); // ← write BEFORE navigate to survive refresh
    setState(next);

    goTo("booking", {
      ...baseParams,
      flightId: flightId(flight),
      tier:     tier.name ?? "",
    });
  }

  function handleConfirm(
    bookingId?: number,
    pnr?: string,
    passengerNames?: string[],
    contactEmail?: string,
    totalPaid?: number,
  ) {
    const next: FlightState = { ...state, bookingId, pnr, passengerNames, contactEmail, totalPaid };
    persistState(next);
    setState(next);

    const baseParams = state.searchForm ? searchFormToParams(state.searchForm) : {};
    goTo("confirmation", {
      ...baseParams,
      ...(bookingId !== undefined && { bookingId: String(bookingId) }),
      ...(pnr                     && { pnr }),
      ...(totalPaid !== undefined  && { total: String(totalPaid) }),
    });
  }

  function handleReset() {
    sessionStorage.removeItem(SESSION_KEY);
    setState(DEFAULT_STATE);
    navigate("/");
    window.scrollTo({ top: 0 });
  }

  // ── Render based on URL ──────────────────────────────────────────────────────
  const page = urlToPage(location.pathname);
  const isIntl = isInternationalRoute(state.searchForm);

  switch (page) {
    case "search":
      return <SearchPage onSearch={handleSearch} />;

    case "results":
      return (
        <ResultsPage
          form={state.searchForm ?? DEFAULT_SEARCH_FORM}
          multiLegs={state.multiLegs}
          onBack={handleReset}
          onBook={handleBook}
          onNewSearch={handleSearch}
          selectedOutboundFlight={state.selectedFlight}
          selectedLegs={state.selectedLegs}
        />
      );

    case "booking":
      if (!state.selectedFlight || !state.selectedTier || !state.searchForm) {
        // State missing even after rehydration — send back to results if we
        // have a search form, otherwise home.
        if (state.searchForm) {
          navigate(
            `/flights-new/results?${new URLSearchParams(searchFormToParams(state.searchForm)).toString()}`,
            { replace: true }
          );
        } else {
          navigate("/", { replace: true });
        }
        return null;
      }
      return (
        <BookingPage
          flight={state.selectedFlight}
          tier={state.selectedTier}
          returnFlight={state.selectedReturnFlight ?? undefined}
          returnTier={state.selectedReturnTier ?? undefined}
          multiCityLegs={
            state.searchForm.tripType === "multiCity"
              ? (state.selectedLegs.filter(Boolean) as { flight: DisplayFlight; tier: FareTier }[])
              : undefined
          }
          adults={state.searchForm.adults}
          children={state.searchForm.children}
          infants={state.searchForm.infants}
          forcePassport={isIntl}
          isInternational={isIntl}
          onBack={() => goTo("results", state.searchForm ? searchFormToParams(state.searchForm) : undefined)}
          onConfirm={handleConfirm}
        />
      );

    case "confirmation":
      if (!state.selectedFlight || !state.selectedTier) {
        navigate("/", { replace: true });
        return null;
      }
      return (
        <div className="min-h-screen" style={{ background: "#f8f7f4" }}>
          <ConfirmationPage
            flight={state.selectedFlight}
            tier={state.selectedTier}
            returnFlight={state.selectedReturnFlight ?? undefined}
            returnTier={state.selectedReturnTier ?? undefined}
            multiCityLegs={
              state.searchForm?.tripType === "multiCity"
                ? (state.selectedLegs.filter(Boolean) as { flight: DisplayFlight; tier: FareTier }[])
                : undefined
            }
            bookingId={state.bookingId}
            pnr={state.pnr}
            passengerNames={state.passengerNames}
            contactEmail={state.contactEmail}
            totalPaid={state.totalPaid ?? 0}
            isInternational={isIntl}
            onDone={handleReset}
          />
        </div>
      );

    default:
      return null;
  }
}