// ============================================================
//  FlightsFlow.tsx — updated to support Home → results flow
//
//  When navigated from Home (via SearchTabs), the search form
//  is stored in sessionStorage under "flightSearch".
//  FlightsFlow reads it on mount and starts directly at "results".
//  All other logic (round-trip, multi-city, booking, etc.) unchanged.
// ============================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchPage from "./SearchPage";
import ResultsPage from "./ResultsPage";
import BookingPage from "./BookingPage";
import ConfirmationPage from "./ConfirmationPage";
import type { SearchForm, DisplayFlight, FareTier, Airport } from "../../lib/types_t";

export type CityLeg = { from: Airport; to: Airport; departDate: string };

type Page = "search" | "results" | "booking" | "confirmation";

interface FlightState {
  page: Page;
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
}

// ── International route detection ────────────────────────────────────────────
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

// ── Build initial state ───────────────────────────────────────────────────────
// If sessionStorage has a pending search (set by SearchTabs on Home),
// boot directly into the results page and clear the stored value.
function buildInitialState(): FlightState {
  try {
    const raw = sessionStorage.getItem("flightSearch");
    if (raw) {
      sessionStorage.removeItem("flightSearch");
      const { form, multiLegs } = JSON.parse(raw) as {
        form: SearchForm;
        multiLegs: CityLeg[] | null;
      };
      return {
        page: "results",
        searchForm: form,
        multiLegs: multiLegs ?? undefined,
        selectedFlight: null,
        selectedTier: null,
        selectedReturnFlight: null,
        selectedReturnTier: null,
        selectedLegs: Array(multiLegs?.length ?? 0).fill(null),
      };
    }
  } catch {
    // ignore parse errors — fall through to default
  }

  return {
    page: "search",
    searchForm: null,
    selectedFlight: null,
    selectedTier: null,
    selectedReturnFlight: null,
    selectedReturnTier: null,
    selectedLegs: [],
  };
}

export default function FlightsFlow() {
  const [state, setState] = useState<FlightState>(buildInitialState);
  // ↑ FIX 2: useNavigate so "Modify / Back" from results goes to Home, not internal search
  const navigate = useNavigate();

  function handleSearch(form: SearchForm, legs?: CityLeg[]) {
    setState((s) => ({
      ...s,
      page: "results",
      searchForm: form,
      multiLegs: legs,
      selectedFlight: null,
      selectedTier: null,
      selectedReturnFlight: null,
      selectedReturnTier: null,
      selectedLegs: Array(legs?.length ?? 0).fill(null),
    }));
    window.scrollTo({ top: 0 });
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

    // ── Round-Trip: two-step selection ───────────────────────
    if (tripType === "roundTrip") {
      if (!state.selectedFlight) {
        setState((s) => ({ ...s, selectedFlight: flight, selectedTier: tier }));
      } else {
        setState((s) => ({
          ...s,
          page: "booking",
          selectedReturnFlight: flight,
          selectedReturnTier: tier,
        }));
        window.scrollTo({ top: 0 });
      }
      return;
    }

    // ── Multi-City: collect one flight per leg ────────────────
    if (tripType === "multiCity" && legIndex !== undefined) {
      const newLegs = [...state.selectedLegs];
      newLegs[legIndex] = { flight, tier };
      const allLegsSelected = newLegs.every(Boolean) && newLegs.length === totalLegs;
      if (allLegsSelected) {
        setState((s) => ({
          ...s,
          page: "booking",
          selectedFlight: newLegs[0]!.flight,
          selectedTier: newLegs[0]!.tier,
          selectedLegs: newLegs,
        }));
        window.scrollTo({ top: 0 });
      } else {
        setState((s) => ({ ...s, selectedLegs: newLegs }));
      }
      return;
    }

    // ── One-Way ──────────────────────────────────────────────
    setState((s) => ({ ...s, page: "booking", selectedFlight: flight, selectedTier: tier }));
    window.scrollTo({ top: 0 });
  }

  function handleConfirm(
    bookingId?: number, pnr?: string, passengerNames?: string[], contactEmail?: string
  ) {
    setState((s) => ({ ...s, page: "confirmation", bookingId, pnr, passengerNames, contactEmail }));
    window.scrollTo({ top: 0 });
  }

  // ↑ FIX 2: Navigate back to Home ("/") instead of switching to internal "search" page.
  // This means Modify/Back on the results page returns the user to the Home hero
  // with the full SearchTabs UI, exactly as they started.
  function handleReset() {
    navigate("/");
    window.scrollTo({ top: 0 });
  }

  const isIntl = isInternationalRoute(state.searchForm);

  switch (state.page) {
    case "search":
      return <SearchPage onSearch={handleSearch} />;

    case "results":
      if (!state.searchForm) return null;
      return (
        <ResultsPage
          form={state.searchForm}
          multiLegs={state.multiLegs}
          onBack={handleReset}
          onBook={handleBook}
          onNewSearch={handleSearch}
          onDateChange={handleDateChange}
          selectedOutboundFlight={state.selectedFlight}
          selectedLegs={state.selectedLegs}
        />
      );

    case "booking":
      if (!state.selectedFlight || !state.selectedTier || !state.searchForm) return null;
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
          onBack={() => setState((s) => ({ ...s, page: "results" }))}
          onConfirm={handleConfirm}
        />
      );

    case "confirmation":
      if (!state.selectedFlight || !state.selectedTier) return null;
      return (
        <ConfirmationPage
          flight={state.selectedFlight}
          tier={state.selectedTier}
          returnFlight={state.selectedReturnFlight ?? undefined}
          returnTier={state.selectedReturnTier ?? undefined}
          bookingId={state.bookingId}
          pnr={state.pnr}
          passengerNames={state.passengerNames}
          contactEmail={state.contactEmail}
          onSearchAgain={handleReset}
        />
      );

    default:
      return null;
  }
}