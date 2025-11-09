console.log("Rendering FlightsForm");

// apps/frontend/src/pages/Flights.tsx
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

// value imports (components)
import FlightCard from "../components/flights/FlightCard";
import FlightsFilters from "../components/flights/FlightsFilters";

// type-only imports
import type { Flight } from "../components/flights/FlightCard";
import type { Filters } from "../components/flights/FlightsFilters";

// API helper
import { searchFlights as apiSearchFlights } from "../lib/api";

/* --------------------------------- Utils --------------------------------- */

function toMinsHHMM(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

const pad2 = (n: number) => String(n).padStart(2, "0");
const hhmm = (d: Date | null) => (d ? `${pad2(d.getHours())}:${pad2(d.getMinutes())}` : "--:--");

/** Coerce unknown-ish to number safely */
function toNum(n: unknown, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

/** Ensure filters are immutable + normalized for reliable recompute */
function normalizeFilters(f: Filters): Filters {
  const min = f.minPrice != null ? Number(f.minPrice) : undefined;
  const max = f.maxPrice != null ? Number(f.maxPrice) : undefined;
  const airlinesUpper = new Set(
    Array.from(f.airlines ?? []).map((s) => String(s).toUpperCase()).filter(Boolean)
  );
  return {
    ...f,
    airlines: airlinesUpper, // new Set identity & normalized case
    minPrice: Number.isFinite(min!) ? min : undefined,
    maxPrice: Number.isFinite(max!) ? max : undefined,
  };
}

/* ----------------------------- TBO → Flight map ----------------------------- */
function mapTBOToFlight(obj: any, idx: number): Flight {
  const slices0 = obj?.Segments;
  const legs: any[] = Array.isArray(slices0?.[0]) ? slices0[0] : Array.isArray(slices0) ? slices0 : [];
  const first = legs[0] ?? slices0?.[0]?.[0] ?? slices0?.[0] ?? {};

  const airline = first?.Airline ?? {};
  const origin = first?.Origin?.Airport ?? first?.Origin ?? {};
  const dest = first?.Destination?.Airport ?? first?.Destination ?? {};

  const depISO = first?.Origin?.DepTime || first?.DepTime || first?.DepartureTime || "";
  const arrISO = first?.Destination?.ArrTime || first?.ArrTime || first?.ArrivalTime || "";

  const dep = depISO ? new Date(depISO) : null;
  const arr = arrISO ? new Date(arrISO) : null;

  const durationMins = toNum(first?.Duration ?? first?.AccumulatedDuration, 0);
  const priceINR = toNum(obj?.Fare?.PublishedFare ?? obj?.Fare?.OfferedFare, 0);

  const flightNumber =
    String(
      airline?.FlightNumber ??
        first?.FlightNumber ??
        first?.Airline?.FlightNumber ??
        obj?.FlightNumber ??
        ""
    ) || "--";

  const stops =
    Array.isArray(legs) && legs.length > 0 ? Math.max(0, legs.length - 1) : Number(first?.StopOver ? 1 : 0);

  const cabin: Flight["cabin"] =
    first?.CabinClass === 6
      ? "first"
      : first?.CabinClass === 4
      ? "business"
      : first?.CabinClass === 3
      ? "premium"
      : "economy";

  return {
    id: `${obj?.ResultIndex ?? obj?.FlightInfoIndex ?? idx}`,
    from: origin?.AirportCode ?? origin?.CityCode ?? "—",
    to: dest?.AirportCode ?? dest?.CityCode ?? "—",
    departTime: hhmm(dep),
    arriveTime: hhmm(arr),
    durationMins,
    stops,
    airlineCode: (airline?.AirlineCode ?? airline?.OperatingCarrier ?? "--")?.toUpperCase(),
    airlineName: airline?.AirlineName ?? "",
    priceINR,
    cabin,
    flightNumber,
  };
}

/* --------------------------------- Page --------------------------------- */

export default function Flights() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const q = new URLSearchParams(search);

  const from = (q.get("from") || "").toUpperCase();
  const to = (q.get("to") || "").toUpperCase();
  const date = q.get("date") || "";
  const adults = q.get("adults") || "1";
  const cabin = (q.get("cabin") || "economy") as Flight["cabin"];

  // Initial filters
  const [filters, setFilters] = useState<Filters>({
    stops: "any",
    airlines: new Set<string>(),
    minPrice: undefined,
    maxPrice: undefined,
    sort: "cheapest",
  });

  // Data
  const [source, setSource] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch from backend whenever query changes
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!from || !to) {
        setSource([]);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const resp = await apiSearchFlights({
          origin: from,
          destination: to,
          departDate: date || new Date().toISOString().slice(0, 10),
          cabinClass: cabin === "first" ? 6 : cabin === "business" ? 4 : cabin === "premium" ? 3 : 2,
          adults: Number(adults || "1"),
          children: 0,
          infants: 0,
          sources: ["GDS", "LCC"],
        });

        const rawResults: any[] =
          resp?.data?.Response?.Results?.[0] ??
          resp?.data?.Response?.Results ??
          [];

        const mapped: Flight[] = Array.isArray(rawResults)
          ? rawResults.map((r: any, i: number) => mapTBOToFlight(r, i))
          : [];

        if (!ignore) setSource(mapped);
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to load flights");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [from, to, date, adults, cabin]);

  const airlineCodes = useMemo(
    () => Array.from(new Set(source.map((f) => (f.airlineCode || "").toUpperCase()).filter(Boolean))),
    [source]
  );

  const filtersKey = useMemo(
    () =>
      JSON.stringify({
        stops: filters.stops,
        airlines: Array.from(filters.airlines).sort(),
        minPrice: filters.minPrice ?? null,
        maxPrice: filters.maxPrice ?? null,
        sort: filters.sort,
      }),
    [filters]
  );

  const results = useMemo(() => {
    let arr = source.slice();

    if (filters.stops !== "any") {
      if (filters.stops === "2+") arr = arr.filter((f) => f.stops >= 2);
      else arr = arr.filter((f) => String(f.stops) === filters.stops);
    }

    if (filters.airlines.size > 0) {
      const selected = filters.airlines;
      arr = arr.filter((f) => {
        const tokens = [
          (f.airlineCode || "").toUpperCase(),
          (f.airlineName || "").toUpperCase(),
        ].filter(Boolean);
        for (const sel of selected) if (tokens.includes(sel)) return true;
        return false;
      });
    }

    if (filters.minPrice != null) arr = arr.filter((f) => f.priceINR >= filters.minPrice!);
    if (filters.maxPrice != null) arr = arr.filter((f) => f.priceINR <= filters.maxPrice!);

    if (filters.sort === "cheapest") arr.sort((a, b) => a.priceINR - b.priceINR);
    else if (filters.sort === "fastest") arr.sort((a, b) => a.durationMins - b.durationMins);
    else if (filters.sort === "earliest") arr.sort((a, b) => toMinsHHMM(a.departTime) - toMinsHHMM(b.departTime));

    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, filtersKey]);

  /* Select → persist then navigate to /flight with query + state */
  const handleSelect = (f: Flight) => {
    try {
      sessionStorage.setItem(
        "plumtrips.selectedFlight",
        JSON.stringify({ flight: f, ts: Date.now() })
      );
    } catch {}
    navigate(
      `/flights/fare?ri=${encodeURIComponent(f.id)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(
        to
      )}&date=${encodeURIComponent(date || new Date().toISOString().slice(0, 10))}&adults=${encodeURIComponent(
        adults
      )}&cabin=${encodeURIComponent(cabin)}`,
      { state: { flight: f } }
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Toast-style summary */}
      <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold">Showing {results.length}</span>
          <span className="text-blue-800/80">of {source.length} results</span>
          <span className="mx-1 text-blue-800/50">•</span>
          <span className="font-medium">
            {from || "—"} → {to || "—"} {date ? `on ${date}` : ""}
          </span>
          <span className="mx-1 text-blue-800/50">•</span>
          <span className="text-blue-800/80">
            {adults} adult{Number(adults) > 1 ? "s" : ""} • {cabin}
          </span>
          <span className="flex-1" />
          <Link to="/" className="text-blue-700 underline underline-offset-4">
            Change search
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px,1fr]">
        {/* Filters */}
        <div className="md:sticky md:top-20 md:self-start">
          <FlightsFilters
            airlineCodes={airlineCodes}
            value={filters}
            onChange={(next) => setFilters(normalizeFilters(next))}
          />
        </div>

        {/* Results */}
        <div>
          {loading ? (
            <div className="rounded-lg border bg-white p-6">Loading…</div>
          ) : (
            <>
              <div className="mb-3 text-sm text-zinc-600">
                Showing <strong>{results.length}</strong> of {source.length} flights
              </div>

              <div className="flex flex-col gap-4">
                {results.map((f) => (
                  <FlightCard key={f.id} flight={f} onSelect={handleSelect} />
                ))}
                {results.length === 0 && (
                  <div className="rounded-lg border bg-white p-6 text-zinc-600">
                    No flights match these filters. Try clearing some filters.
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
