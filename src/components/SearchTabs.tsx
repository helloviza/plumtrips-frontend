// apps/frontend/src/components/SearchTabs.tsx
import { useState } from "react";
import FlightSearchForm from "./search/FlightSearchForm";
import type { TripType } from "./search/FlightSearchForm";
import HotelSearchForm from "./search/HotelsSearchForm"; // ⬅️ make sure this matches your actual file name

const topTabs = [
  { id: "flights", label: "Flights" },
  { id: "hotels", label: "Hotels" },
] as const;

type TopTab = (typeof topTabs)[number]["id"];

const tabsFrame = "rounded-none border border-[#a8d5ff] bg-white/95 p-px";
const tripBtn = (active: boolean) =>
  `flex-1 px-3 py-1.5 
   text-[10px] sm:text-xs md:text-sm lg:text-[15px]
   font-semibold leading-tight whitespace-nowrap
   ${
     active
       ? "bg-[#00477f] text-white"
       : "bg-white text-[#1e88e5]"
   }`;

export default function SearchTabs() {
  const [active, setActive] = useState<TopTab>("flights");
  const [tripType, setTripType] = useState<TripType>("round");
  const showTripTabs = active === "flights";

  return (
    <div className="w-full mx-auto mt-10 sm:mt-14 max-w-5xl">
      {/* Header row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {/* left: Flights / Hotels */}
        <div className="flex shrink-0 gap-8 text-base sm:text-lg font-semibold text-white">
          {topTabs.map((t) => {
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                className={`relative pb-1.5 ${
                  isActive ? "text-white" : "text-white/85 hover:text-white"
                }`}
              >
                {t.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 h-[3px] w-20 bg-[#d06549]" />
                )}
              </button>
            );
          })}
        </div>

        {/* right: Round trip / One way / Multi-city */}
        {showTripTabs && (
          <div className="w-full md:w-auto">
            <div className={`${tabsFrame} w-full`}>
              <div className="flex w-full gap-px">
                <button
                  type="button"
                  className={tripBtn(tripType === "round")}
                  onClick={() => setTripType("round")}
                >
                  Round trip
                </button>
                <button
                  type="button"
                  className={tripBtn(tripType === "oneway")}
                  onClick={() => setTripType("oneway")}
                >
                  One way
                </button>
                <button
                  type="button"
                  className={tripBtn(tripType === "multi")}
                  onClick={() => setTripType("multi")}
                >
                  Multi-city
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Forms */}
      <div className="mt-3">
        {active === "flights" ? (
          <FlightSearchForm tripType={tripType} />
        ) : (
          <HotelSearchForm />
        )}
      </div>
    </div>
  );
}
