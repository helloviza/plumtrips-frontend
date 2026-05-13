// src/pages/flights_new/FlightsFlow.tsx

import { useState } from "react";

import SearchPage from "./SearchPage";
import ResultsPage from "./ResultsPage";
import BookingPage from "./BookingPage";
import ConfirmationPage from "./ConfirmationPage";

import type {
  SearchForm,
  DisplayFlight,
  FareTier,
  Airport,
} from "../../lib/types_t";

export type CityLeg = { from: Airport; to: Airport; departDate: string };

type Page =
  | "search"
  | "results"
  | "booking"
  | "confirmation";

interface FlightState {
  page: Page;
  searchForm: SearchForm | null;
  multiLegs?: CityLeg[];
  selectedFlight: DisplayFlight | null;
  selectedTier: FareTier | null;
  bookingId?: number;
  pnr?: string;
  passengerNames?: string[];
  contactEmail?: string;
}

export default function FlightsFlow() {
  const [state, setState] = useState<FlightState>({
    page: "search",
    searchForm: null,
    selectedFlight: null,
    selectedTier: null,
  });

  // Search
  function handleSearch(form: SearchForm, legs?: CityLeg[]) {
    setState((s) => ({
      ...s,
      page: "results",
      searchForm: form,
      multiLegs: legs,
    }));

    window.scrollTo({ top: 0 });
  }

  // Book
  function handleBook(
    flight: DisplayFlight,
    tier: FareTier
  ) {
    setState((s) => ({
      ...s,
      page: "booking",
      selectedFlight: flight,
      selectedTier: tier,
    }));

    window.scrollTo({ top: 0 });
  }

  // Confirm
  function handleConfirm(
    bookingId?: number,
    pnr?: string,
    passengerNames?: string[],
    contactEmail?: string
  ) {
    setState((s) => ({
      ...s,
      page: "confirmation",
      bookingId,
      pnr,
      passengerNames,
      contactEmail,
    }));
    window.scrollTo({ top: 0 });
  }

  // Reset
  function handleReset() {
    setState({
      page: "search",
      searchForm: null,
      selectedFlight: null,
      selectedTier: null,
    });

    window.scrollTo({ top: 0 });
  }

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
        />
      );

    case "booking":
      if (
        !state.selectedFlight ||
        !state.selectedTier ||
        !state.searchForm
      ) {
        return null;
      }

      return (
        <BookingPage
          flight={state.selectedFlight}
          tier={state.selectedTier}
          adults={state.searchForm.adults}
          children={state.searchForm.children}
          infants={state.searchForm.infants}
          onBack={() =>
            setState((s) => ({
              ...s,
              page: "results",
            }))
          }
          onConfirm={handleConfirm}
        />
      );

    case "confirmation":
      if (
        !state.selectedFlight ||
        !state.selectedTier
      ) {
        return null;
      }

      return (
        <ConfirmationPage
          flight={state.selectedFlight}
          tier={state.selectedTier}
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

