// apps/frontend/src/components/SearchTabs.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchPage from "../pages/flights_new/SearchPage";
import HotelSearchForm from "../pages/hotels/HotelSearchForm";
import type { SearchForm } from "../lib/types_t";

export type CityLeg = {
  from: import("../lib/types_t").Airport;
  to: import("../lib/types_t").Airport;
  departDate: string;
};

const topTabs = [
  { id: "flights", label: "Flights", icon: "✈" },
  { id: "hotels",  label: "Hotels",  icon: "🏨" },
] as const;

type TopTab = (typeof topTabs)[number]["id"];
type TripType = "oneWay" | "roundTrip" | "multiCity";

export type { TopTab };

type Props = {
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
    sessionStorage.removeItem("flightFlowState");
    sessionStorage.setItem(
      "flightSearch",
      JSON.stringify({ form, multiLegs: multiLegs ?? null })
    );
    navigate("/flights-new/results");
  }

  return (
    <div style={{ width: "100%" }}>

      {/* ── Tab row ── */}
      <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 12, gap: 4 }}>
        {topTabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => switchTab(t.id)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "8px 20px 10px",
                borderRadius: "10px 10px 0 0",
                border: "none",
                cursor: "pointer",
                fontFamily: "Poppins, sans-serif",
                fontWeight: isActive ? 700 : 500,
                fontSize: 14,
                letterSpacing: "0.01em",
                transition: "all 0.2s",
                // Active: opaque glass matching the card; Inactive: lighter ghost
                background: isActive
                  ? "linear-gradient(180deg, rgba(31,50,86,0.72), rgba(10,22,44,0.82))"
                  : "rgba(255,255,255,0.08)",
                color: isActive ? "#fff" : "rgba(255,255,255,0.55)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderTop: isActive ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.08)",
                borderLeft: isActive ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.06)",
                borderRight: isActive ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.06)",
                // Bottom accent bar for active
                boxShadow: isActive ? "inset 0 -2.5px 0 #FF682C" : "none",
              }}
              onMouseEnter={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.85)";
              }}
              onMouseLeave={e => {
                if (!isActive) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)";
              }}
            >
              <span style={{ fontSize: 13 }}>{t.icon}</span>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── Form area — no extra wrapper, forms have their own glass card ── */}
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
