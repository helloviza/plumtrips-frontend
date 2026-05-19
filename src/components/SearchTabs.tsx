// apps/frontend/src/components/SearchTabs.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchPage from "../pages/flights_new/SearchPage";
import HotelSearchForm from "../pages/hotels/HotelSearchForm";
import type { SearchForm } from "../lib/types_t";

// CityLeg type matches what SearchPage/FlightsFlow expect
export type CityLeg = { from: import("../lib/types_t").Airport; to: import("../lib/types_t").Airport; departDate: string };

const topTabs = [
  { id: "flights", label: "Flights" },
  { id: "hotels", label: "Hotels" },
] as const;

type TopTab = (typeof topTabs)[number]["id"];

const tripTabs = [
  { key: "oneWay" as const,    label: "One way" },
  { key: "roundTrip" as const, label: "Round trip" },
  { key: "multiCity" as const, label: "Multi-city" },
];

type TripType = "oneWay" | "roundTrip" | "multiCity";

export default function SearchTabs() {
  const [active, setActive]       = useState<TopTab>("flights");
  const [tripType, setTripType]   = useState<TripType>("oneWay");
  const navigate = useNavigate();

  function handleFlightSearch(form: SearchForm, multiLegs?: CityLeg[]) {
    sessionStorage.setItem(
      "flightSearch",
      JSON.stringify({ form, multiLegs: multiLegs ?? null })
    );
    navigate("/flights-new");
  }

  return (
    <div className="w-full mt-10 sm:mt-14">

      {/* ── Single header row: Flights/Hotels LEFT · trip type RIGHT ── */}
      <div className="flex items-end justify-between mb-4">

        {/* Left — Flights / Hotels */}
        <div className="flex shrink-0 gap-8 text-base sm:text-lg font-semibold text-white">
          {topTabs.map((t) => {
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
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

        {/* Right — trip type pill (only visible when Flights tab is active) */}
        {active === "flights" && (
          <div
            className="flex items-center gap-0.5 p-0.5 rounded-lg shrink-0"
            style={{ background: "rgba(255,255,255,0.12)" }}
          >
            {tripTabs.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTripType(t.key)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                  tripType === t.key
                    ? "bg-white text-[#00477f] shadow-sm"
                    : "text-white/65 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Form area ── */}
      <div>
        {active === "flights" ? (
          <SearchPage onSearch={handleFlightSearch} tripType={tripType} onTripTypeChange={setTripType} />
        ) : (
          <HotelSearchForm />
        )}
      </div>
    </div>
  );
}