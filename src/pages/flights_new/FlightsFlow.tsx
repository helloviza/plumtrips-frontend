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

// ── State shape (no longer includes `page` — that's the URL now) ──────────────
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

// ── Restore state from sessionStorage on refresh ──────────────────────────────
function buildInitialState(): FlightState {
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
    if (raw) return JSON.parse(raw) as FlightState;
  } catch { /* ignore */ }

  // ── NEW: if landing directly on /results with no state, use a default form
  const onResultsPage = window.location.pathname.includes("/results");
  if (onResultsPage) {
    return { ...DEFAULT_STATE, searchForm: DEFAULT_SEARCH_FORM };
  }

  return DEFAULT_STATE;
}

// ── URL → logical page mapping ────────────────────────────────────────────────
type Page = "search" | "results" | "booking" | "confirmation";

function urlToPage(pathname: string): Page {
  if (pathname.endsWith("/results"))      return "results";
  if (pathname.endsWith("/booking"))      return "booking";
  if (pathname.endsWith("/confirmation")) return "confirmation";
  return "search";
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function FlightsFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<FlightState>(buildInitialState);

  // Persist state to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  }, [state]);

  // Helper: navigate to a sub-page URL
  function goTo(page: Page) {
    const base = "/flights-new";
    const url = page === "search" ? base : `${base}/${page}`;
    navigate(url);
    window.scrollTo({ top: 0 });
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handleSearch(form: SearchForm, legs?: CityLeg[]) {
    setState((s) => ({
      ...s,
      searchForm: form,
      multiLegs: legs,
      selectedFlight: null,
      selectedTier: null,
      selectedReturnFlight: null,
      selectedReturnTier: null,
      selectedLegs: Array(legs?.length ?? 0).fill(null),
    }));
    goTo("results");
  }

  function handleDateChange(newDate: string) {
    setState((s) => {
      if (!s.searchForm) return s;
      return {
        ...s,
        searchForm: { ...s.searchForm, departDate: newDate },
        selectedFlight: null,
        selectedTier: null,
        selectedReturnFlight: null,
        selectedReturnTier: null,
      };
    });
    window.scrollTo({ top: 0 });
  }

  function handleBook(flight: DisplayFlight, tier: FareTier, legIndex?: number) {
    const tripType = state.searchForm?.tripType;
    const totalLegs = state.multiLegs?.length ?? 1;

    // Round-Trip: two-step selection
    if (tripType === "roundTrip") {
      if (!state.selectedFlight) {
        setState((s) => ({ ...s, selectedFlight: flight, selectedTier: tier }));
      } else {
        setState((s) => ({
          ...s,
          selectedReturnFlight: flight,
          selectedReturnTier: tier,
        }));
        goTo("booking");
      }
      return;
    }

    // Multi-City: collect one flight per leg
    if (tripType === "multiCity" && legIndex !== undefined) {
      const newLegs = [...state.selectedLegs];
      newLegs[legIndex] = { flight, tier };
      const allLegsSelected = newLegs.every(Boolean) && newLegs.length === totalLegs;
      if (allLegsSelected) {
        setState((s) => ({
          ...s,
          selectedFlight: newLegs[0]!.flight,
          selectedTier: newLegs[0]!.tier,
          selectedLegs: newLegs,
        }));
        goTo("booking");
      } else {
        setState((s) => ({ ...s, selectedLegs: newLegs }));
      }
      return;
    }

    // One-Way
    setState((s) => ({ ...s, selectedFlight: flight, selectedTier: tier }));
    goTo("booking");
  }

  function handleConfirm(
    bookingId?: number,
    pnr?: string,
    passengerNames?: string[],
    contactEmail?: string,
    totalPaid?: number,
  ) {
    setState((s) => ({ ...s, bookingId, pnr, passengerNames, contactEmail, totalPaid }));
    goTo("confirmation");
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
  // Removed the hard redirect — ResultsPage handles null form gracefully
  return (
    <ResultsPage
      form={state.searchForm ?? DEFAULT_SEARCH_FORM}  // ← fallback here too
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
        navigate("/flights-new/results", { replace: true });
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
          onBack={() => goTo("results")}
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
