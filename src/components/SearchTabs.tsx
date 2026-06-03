// apps/frontend/src/components/SearchTabs.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchPage from "../pages/flights_new/SearchPage";
import HotelSearchForm from "../pages/hotels/HotelSearchForm";
import type { SearchForm } from "../lib/types_t";

// CityLeg type matches what SearchPage/FlightsFlow expect
export type CityLeg = {
  from: import("../lib/types_t").Airport;
  to: import("../lib/types_t").Airport;
  departDate: string;
};

const topTabs = [
  { id: "flights", label: "Flights" },
  { id: "hotels", label: "Hotels" },
] as const;

type TopTab = (typeof topTabs)[number]["id"];

type TripType = "oneWay" | "roundTrip" | "multiCity";

// ─── NEW: export so parent (e.g. HomePage) can read it ────────────────────────
export type { TopTab };

type Props = {
  /** Callback so the parent can mirror the active tab into HeroCarousel */
  onTabChange?: (tab: TopTab) => void;
};

export default function SearchTabs({ onTabChange }: Props) {
  const [active, setActive]     = useState<TopTab>("flights");
  const [tripType, setTripType] = useState<TripType>("oneWay");
  const navigate = useNavigate();

  function switchTab(tab: TopTab) {
    setActive(tab);
    onTabChange?.(tab);
  }

  function handleFlightSearch(form: SearchForm, multiLegs?: CityLeg[]) {
    sessionStorage.setItem(
      "flightSearch",
      JSON.stringify({ form, multiLegs: multiLegs ?? null })
    );
    navigate("/flights-new/results");
  }

  return (
    <div className="w-full mt-10 sm:mt-14">

      {/* ── Header row: Flights / Hotels only ── */}
      <div className="flex items-end mb-4">
        <div className="flex shrink-0 gap-8 text-base sm:text-lg font-semibold text-white">
          {topTabs.map((t) => {
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => switchTab(t.id)}
                className={`relative pb-1.5 transition-colors ${
                  isActive ? "text-white" : "text-white/70 hover:text-white"
                }`}
              >
                {t.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 h-[3px] w-full bg-[#d06549] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Form area ── */}
      <div>
        {active === "flights" ? (
          <SearchPage
            onSearch={handleFlightSearch}
            tripType={tripType}
            onTripTypeChange={setTripType}
          />
        ) : (
          <HotelSearchForm />
        )}
      </div>
    </div>
  );
}