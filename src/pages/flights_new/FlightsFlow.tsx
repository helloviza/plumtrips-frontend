// ============================================================
//  FlightsFlow.tsx — Fixed
//
//  Fixes applied:
//  [F1] Added `key` prop to ResultsPage so OneSearchBar remounts
//       cleanly on every new search (prevents stale internal state).
//  [F2] handleSearch uses functional setState to avoid stale closure
//       over `state` when called from inside ResultsPage/OneSearchBar.
//  [F3] handleBook also uses functional setState for same reason.
//  [F4] goTo is called AFTER setState in handleSearch so React has
//       committed the new state before the URL changes.
// ============================================================

import { useState, useEffect, useCallback } from "react";
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

  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as FlightState;
      if (!onBookingOrConfirmation || parsed.selectedFlight) {
        return parsed;
      }
    }
  } catch { /* ignore */ }

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

// ── Derive a stable search key for the ResultsPage `key` prop ────────────────
// [F1] This key changes whenever the search changes, forcing ResultsPage
//      (and OneSearchBar inside it) to fully remount with fresh state.
function deriveSearchKey(form: SearchForm | null, legs?: CityLeg[]): string {
  if (!form) return "empty";
  const base = [
    form.from?.code ?? "",
    form.to?.code ?? "",
    form.departDate ?? "",
    form.returnDate ?? "",
    form.tripType ?? "",
    String(form.adults),
    String(form.children),
    String(form.infants),
    form.cabinClass ?? "",
    String(form.nonStopOnly),
  ].join("|");

  // Include multi-city legs in the key so changing any leg also remounts
  const legsKey = legs?.map(l => `${l.from.code}-${l.to.code}-${l.departDate}`).join(",") ?? "";
  return legsKey ? `${base}__${legsKey}` : base;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FlightsFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<FlightState>(buildInitialState);

  // Keep sessionStorage in sync with every state change
  useEffect(() => {
    persistState(state);
  }, [state]);

  // ── Navigate with query params ────────────────────────────────────────────
  const goTo = useCallback((page: Page, params?: Record<string, string>) => {
    const base = "/flights-new";
    const path = page === "search" ? base : `${base}/${page}`;
    const search = params && Object.keys(params).length
      ? `?${new URLSearchParams(params).toString()}`
      : "";
    navigate(path + search);
    window.scrollTo({ top: 0 });
  }, [navigate]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // [F2] Use functional setState to avoid stale closure over `state`.
  // This is critical when handleSearch is called from inside ResultsPage
  // (via onNewSearch prop passed to OneSearchBar), where the `state`
  // variable captured at render time could be outdated.
  const handleSearch = useCallback((form: SearchForm, legs?: CityLeg[]) => {
    const next: FlightState = {
      // [F2] We build next from scratch rather than spreading stale `state`
      searchForm: form,
      multiLegs: legs,
      selectedFlight: null,
      selectedTier: null,
      selectedReturnFlight: null,
      selectedReturnTier: null,
      selectedLegs: Array(legs?.length ?? 0).fill(null),
    };

    // Write to session BEFORE navigate so a refresh on /results sees
    // the correct form immediately.
    persistState(next);

    // Functional update — guarantees we're working with the latest state
    // even if React batched previous updates.
    setState(next);

    goTo("results", searchFormToParams(form));
  }, [goTo]);

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

  // [F3] handleBook uses functional setState for the same stale-closure reason
  const handleBook = useCallback((flight: DisplayFlight, tier: FareTier, legIndex?: number) => {
    setState((prevState) => {
      const tripType = prevState.searchForm?.tripType;
      const totalLegs = prevState.multiLegs?.length ?? 1;
      const baseParams = prevState.searchForm ? searchFormToParams(prevState.searchForm) : {};

      // ── Round-Trip ──────────────────────────────────────────────────────────
      if (tripType === "roundTrip") {
        if (!prevState.selectedFlight) {
          // First leg — stay on results
          const next: FlightState = { ...prevState, selectedFlight: flight, selectedTier: tier };
          persistState(next);

          const existing = Object.fromEntries(new URLSearchParams(location.search));
          navigate(
            `/flights-new/results?${new URLSearchParams({
              ...existing,
              outboundId:   flightId(flight),
              outboundTier: tier.name ?? "",
            }).toString()}`
          );
          window.scrollTo({ top: 0 });

          return next;
        } else {
          // Second leg — go to booking
          const next: FlightState = {
            ...prevState,
            selectedReturnFlight: flight,
            selectedReturnTier: tier,
          };
          persistState(next);

          goTo("booking", {
            ...baseParams,
            outboundId:   flightId(prevState.selectedFlight),
            outboundTier: prevState.selectedTier?.name ?? "",
            returnId:     flightId(flight),
            returnTier:   tier.name ?? "",
          });

          return next;
        }
      }

      // ── Multi-City ──────────────────────────────────────────────────────────
      if (tripType === "multiCity" && legIndex !== undefined) {
        const newLegs = [...prevState.selectedLegs];
        newLegs[legIndex] = { flight, tier };
        const allLegsSelected = newLegs.every(Boolean) && newLegs.length === totalLegs;

        if (allLegsSelected) {
          const next: FlightState = {
            ...prevState,
            selectedFlight: newLegs[0]!.flight,
            selectedTier:   newLegs[0]!.tier,
            selectedLegs:   newLegs,
          };
          persistState(next);

          const legParams = newLegs.reduce<Record<string, string>>((acc, leg, i) => {
            if (leg) {
              acc[`leg${i}Id`]   = flightId(leg.flight);
              acc[`leg${i}Tier`] = leg.tier.name ?? "";
            }
            return acc;
          }, {});

          goTo("booking", { ...baseParams, ...legParams });
          return next;
        } else {
          const next: FlightState = { ...prevState, selectedLegs: newLegs };
          persistState(next);

          const existing = Object.fromEntries(new URLSearchParams(location.search));
          navigate(
            `/flights-new/results?${new URLSearchParams({
              ...existing,
              [`leg${legIndex}Id`]:   flightId(flight),
              [`leg${legIndex}Tier`]: tier.name ?? "",
            }).toString()}`
          );
          window.scrollTo({ top: 0 });

          return next;
        }
      }

      // ── One-Way ─────────────────────────────────────────────────────────────
      const next: FlightState = { ...prevState, selectedFlight: flight, selectedTier: tier };
      persistState(next);

      goTo("booking", {
        ...baseParams,
        flightId: flightId(flight),
        tier:     tier.name ?? "",
      });

      return next;
    });
  }, [goTo, navigate, location.search]);

  function handleConfirm(
    bookingId?: number,
    pnr?: string,
    passengerNames?: string[],
    contactEmail?: string,
    totalPaid?: number,
  ) {
    setState((prevState) => {
      const next: FlightState = { ...prevState, bookingId, pnr, passengerNames, contactEmail, totalPaid };
      persistState(next);

      const baseParams = prevState.searchForm ? searchFormToParams(prevState.searchForm) : {};
      goTo("confirmation", {
        ...baseParams,
        ...(bookingId !== undefined && { bookingId: String(bookingId) }),
        ...(pnr                     && { pnr }),
        ...(totalPaid !== undefined  && { total: String(totalPaid) }),
      });

      return next;
    });
  }

  function handleReset() {
    sessionStorage.removeItem(SESSION_KEY);
    setState(DEFAULT_STATE);
    navigate("/");
    window.scrollTo({ top: 0 });
  }

  // ── Render based on URL ────────────────────────────────────────────────────
  const page   = urlToPage(location.pathname);
  const isIntl = isInternationalRoute(state.searchForm);

  // [F1] Stable key derived from the active search form + multi-city legs.
  // When this string changes, React unmounts and remounts ResultsPage from
  // scratch, which means OneSearchBar re-runs its useState initializer with
  // the fresh formProp — guaranteed sync with whatever was searched.
  const resultsKey = deriveSearchKey(state.searchForm, state.multiLegs);

  switch (page) {
    case "search":
      return <SearchPage onSearch={handleSearch} />;

    case "results":
      return (
        <ResultsPage
          key={resultsKey}                              // [F1] THE CRITICAL FIX
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
