// apps/frontend/src/components/SearchTabs.tsx
import { useState } from "react";
import FlightSearchForm from "./search/FlightSearchForm";
import type { TripType } from "./search/FlightSearchForm";
import HotelsSearchForm from "./search/HotelsSearchForm"; // ✅ correct filename

/* top-level tabs (Flights / Hotels) */
const topTabs = [
  { id: "flights", label: "Flights" },
  { id: "hotels", label: "Hotels" },
] as const;

type TopTab = (typeof topTabs)[number]["id"];

/* trip tabs (right side) */
const tabsFrame = "rounded-none border border-[#a8d5ff] bg-white/95 p-px";
const tripBtn = (active: boolean) =>
  `px-11 py-2 text-xl font-semibold ${
    active ? "bg-[#00477f] text-white" : "bg-white text-[#1e88e5]"
  }`;

/** Keep tabs and search form inside the SAME max width
 *  so the tabs never stick out beyond the form. */
const CONTENT_MAX = "max-w-[1120px]"; // feel free to nudge (e.g., 1080 / 1160)
const TABS_WIDTH = "w-[660px] md:w-[720px] lg:w-[780px] xl:w-[820px]";

export default function SearchTabs() {
  const [active, setActive] = useState<TopTab>("flights");
  const [tripType, setTripType] = useState<TripType>("round");
  const showTripTabs = active === "flights";

  return (
    <div className={`w-full mx-auto mt-20 ${CONTENT_MAX}`}>
      {/* Header row: left labels + right tabs (only on Flights) */}
      <div className="flex items-center justify-between gap-8">
        {/* left: Flights / Hotels */}
        <div className="flex shrink-0 gap-12 text-xl font-semibold text-white">
          {topTabs.map((t) => {
            const isActive = t.id === active;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActive(t.id)}
                className={`relative pb-2 ${
                  isActive ? "text-white" : "text-white/85 hover:text-white"
                }`}
              >
                {t.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 h-[3px] w-28 bg-[#d06549]" />
                )}
              </button>
            );
          })}
        </div>

        {/* a flexible spacer keeps the gap tidy & even */}
        <div className="flex-1" />

        {/* right: Round trip / One way / Multi-city — hidden on Hotels.
            Width is capped so it never exceeds the search form width. */}
        {showTripTabs && (
          <div className={`${TABS_WIDTH}`}>
            <div className={`${tabsFrame} w-full`}>
              <div className="flex gap-px">
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

      {/* Content shares the same container width so edges align */}
      <div className="mt-3">
        {active === "flights" ? (
          <FlightSearchForm tripType={tripType} />
        ) : (
          <HotelsSearchForm />
        )}
      </div>
    </div>
  );
}
