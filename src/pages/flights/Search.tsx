// apps/frontend/src/pages/flights/Search.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  searchFlights as apiSearchFlights,
  loadAirlines,
  airlineName,
} from "../../lib/api";

/* ------------------------------ Types ------------------------------ */
type Cabin = "economy" | "premium" | "business" | "first";

type ResultCard = {
  resultIndex: string;
  airlineCode: string;
  airlineName: string;
  flightNumber?: string;
  from: string;
  to: string;
  departISO?: string;
  arriveISO?: string;
  departHHMM: string;
  arriveHHMM: string;
  durationMins: number;
  stops: number;
  priceINR: number;
  isNonStop: boolean;
};

/* ------------------------------ Utils ------------------------------ */
const pad = (n: number) => String(n).padStart(2, "0");
const hhmm = (d?: Date) => (d ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : "--:--");
const toMinsHHMM = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

function mapTBOToCard(obj: any): ResultCard {
  const seg0 =
    obj?.Segments?.[0]?.[0] ??
    obj?.Segments?.[0] ??
    (Array.isArray(obj?.Segments) ? obj?.Segments[0] : obj?.Segments) ??
    {};

  const airline = seg0?.Airline ?? {};
  const origin = seg0?.Origin?.Airport ?? seg0?.Origin ?? {};
  const dest = seg0?.Destination?.Airport ?? seg0?.Destination ?? {};

  const depISO = seg0?.Origin?.DepTime || seg0?.DepTime || seg0?.DepartureTime || "";
  const arrISO = seg0?.Destination?.ArrTime || seg0?.ArrTime || seg0?.ArrivalTime || "";

  const dep = depISO ? new Date(depISO) : undefined;
  const arr = arrISO ? new Date(arrISO) : undefined;

  const durationMins = Number(seg0?.Duration ?? obj?.AccumulatedDuration ?? 0);
  const priceINR = Number(obj?.Fare?.PublishedFare ?? obj?.Fare?.OfferedFare ?? 0);
  const stops =
    typeof obj?.NoOfStops === "number"
      ? obj.NoOfStops
      : seg0?.StopOver
      ? 1
      : Array.isArray(obj?.Segments?.[0])
      ? Math.max(0, obj.Segments[0].length - 1)
      : 0;

  return {
    resultIndex: String(obj?.ResultIndex ?? obj?.FlightInfoIndex ?? ""),
    airlineCode: airline?.AirlineCode ?? airline?.OperatingCarrier ?? "--",
    airlineName: airline?.AirlineName ?? "",
    flightNumber: airline?.FlightNumber ?? seg0?.FlightNumber ?? "",
    from: origin?.AirportCode ?? origin?.CityCode ?? "—",
    to: dest?.AirportCode ?? dest?.CityCode ?? "—",
    departISO: depISO || undefined,
    arriveISO: arrISO || undefined,
    departHHMM: hhmm(dep),
    arriveHHMM: hhmm(arr),
    durationMins,
    stops,
    priceINR,
    isNonStop: stops === 0,
  };
}

function minutesToHMM(mins: number) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${pad(m)}m`;
}

function addDays(iso: string, delta: number) {
  if (!iso) return "";
  const d = new Date(iso);
  d.setDate(d.getDate() + delta);
  return d.toISOString().slice(0, 10);
}

/* ---------------------------- Component ---------------------------- */
export default function SearchPage() {
  const navigate = useNavigate();
  const { search } = useLocation();
  const q = new URLSearchParams(search);

  // Query params (defaults keep the page lively if opened blank)
  const from = (q.get("from") || "BOM").toUpperCase();
  const to = (q.get("to") || "DEL").toUpperCase();
  const date = q.get("date") || new Date().toISOString().slice(0, 10);
  const adults = Number(q.get("adults") || "1");
  const children = Number(q.get("children") || "0");
  const infants = Number(q.get("infants") || "0");
  const cabin = (q.get("cabin") || "any").toLowerCase() as Cabin | "any";

  // Data state
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [traceId, setTraceId] = useState<string>("");
  const [cards, setCards] = useState<ResultCard[]>([]);
  const [airlineMap, setAirlineMap] = useState<Record<string, string>>({});

  // Filters / sort
  const [nonStop, setNonStop] = useState(false);
  const [oneStop, setOneStop] = useState(false);
  const [twoPlus, setTwoPlus] = useState(false);
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [selectedAirlines, setSelectedAirlines] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<"cheapest" | "nonstop" | "prefer">("cheapest");

  // Airline names map
  useEffect(() => {
    loadAirlines().then(setAirlineMap).catch(() => {});
  }, []);

  // Search
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await apiSearchFlights({
          origin: from,
          destination: to,
          departDate: date,
          cabinClass:
            cabin === "first" ? 6 : cabin === "business" ? 4 : cabin === "premium" ? 3 : 2,
          adults,
          children,
          infants,
          sources: ["GDS", "LCC"],
        });

        const tid = res?.data?.Response?.TraceId || res?.data?.TraceId || "";
        const raw: any[] =
          res?.data?.Response?.Results?.[0] ??
          res?.data?.Response?.Results ??
          [];
        const mapped = (Array.isArray(raw) ? raw : []).map(mapTBOToCard);

        if (!ignore) {
          setTraceId(tid);
          sessionStorage.setItem("plumtrips.traceId", tid);
          setCards(mapped);
        }
      } catch (e: any) {
        if (!ignore) setErr(e?.message || "Failed to search flights");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, date, adults, children, infants, cabin]);

  // Price stats
  const priceStats = useMemo(() => {
    if (cards.length === 0) return { min: 0, max: 0 };
    const p = cards.map((c) => c.priceINR);
    return { min: Math.min(...p), max: Math.max(...p) };
  }, [cards]);

  useEffect(() => {
    if (cards.length > 0) {
      setMinPrice(priceStats.min);
      setMaxPrice(priceStats.max);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length]);

  // Airline checkbox list for right rail
  const airlineOptions = useMemo(() => {
    const codes = Array.from(new Set(cards.map((c) => c.airlineCode))).sort();
    return codes.map((code) => ({
      code,
      name: airlineName(code, airlineMap),
      lowest: Math.min(...cards.filter((c) => c.airlineCode === code).map((c) => c.priceINR)),
    }));
  }, [cards, airlineMap]);

  // Apply filters / sort
  const filtered = useMemo(() => {
    let arr = cards.slice();

    if (nonStop || oneStop || twoPlus) {
      arr = arr.filter((c) => {
        if (nonStop && c.stops === 0) return true;
        if (oneStop && c.stops === 1) return true;
        if (twoPlus && c.stops >= 2) return true;
        return false;
      });
    }

    if (minPrice != null) arr = arr.filter((c) => c.priceINR >= minPrice!);
    if (maxPrice != null) arr = arr.filter((c) => c.priceINR <= maxPrice!);

    if (selectedAirlines.size > 0) {
      arr = arr.filter((c) => selectedAirlines.has(c.airlineCode));
    }

    if (sortBy === "cheapest") {
      arr.sort((a, b) => a.priceINR - b.priceINR);
    } else if (sortBy === "nonstop") {
      arr.sort((a, b) => {
        if (a.isNonStop !== b.isNonStop) return a.isNonStop ? -1 : 1;
        return a.priceINR - b.priceINR;
      });
    } else {
      arr.sort(
        (a, b) => toMinsHHMM(a.departHHMM) - toMinsHHMM(b.departHHMM) || a.priceINR - b.priceINR
      );
    }

    return arr;
  }, [cards, nonStop, oneStop, twoPlus, minPrice, maxPrice, selectedAirlines, sortBy]);

  function clearFilters() {
    setNonStop(false);
    setOneStop(false);
    setTwoPlus(false);
    setSelectedAirlines(new Set());
    if (cards.length > 0) {
      setMinPrice(priceStats.min);
      setMaxPrice(priceStats.max);
    }
  }

  function selectCard(c: ResultCard) {
    sessionStorage.setItem(
      "plumtrips.selectedFlight",
      JSON.stringify({ flight: { id: c.resultIndex }, from, to, date })
    );
    navigate(
      `/flights/fare?traceId=${encodeURIComponent(traceId)}&resultIndex=${encodeURIComponent(
        c.resultIndex
      )}`
    );
  }

  /* ------------------------------ UI ------------------------------ */
  const dateTabs = [-3, -2, -1, 0, 1, 2, 3].map((d) => ({
    iso: addDays(date, d),
    label: new Date(addDays(date, d)).toLocaleDateString(undefined, {
      weekday: "short",
      day: "2-digit",
    }),
    active: d === 0,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Title */}
      <div className="mb-2">
        <h1 className="text-xl font-semibold">
          Flights from <span className="text-blue-700">{from}</span> to{" "}
          <span className="text-blue-700">{to}</span>
        </h1>
        <div className="text-sm text-zinc-600">
          {new Date(date).toLocaleDateString(undefined, {
            weekday: "long",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}{" "}
          • {adults} adult{adults > 1 ? "s" : ""} • {cabin}
        </div>
      </div>

      {/* Full-width date strip + sort chips */}
      <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr,380px]">
        <div className="flex items-center gap-2 overflow-x-auto rounded-lg border bg-white p-2">
          {dateTabs.map((t) => (
            <Link
              key={t.iso}
              to={`/flights/search?from=${from}&to=${to}&date=${t.iso}&adults=${adults}&children=${children}&infants=${infants}&cabin=${cabin}`}
              className={`min-w-[90px] rounded-md border px-3 py-2 text-center text-xs ${t.active ? "border-blue-600 bg-blue-50 text-blue-700" : "hover:bg-zinc-50"}`}
            >
              {t.label}
              <div className="mt-1 text-[10px] text-zinc-500">tap to change</div>
            </Link>
          ))}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setSortBy("cheapest")}
            className={`rounded-md px-3 py-2 text-xs font-medium ${sortBy === "cheapest" ? "bg-emerald-100 text-emerald-900" : "bg-white"} border`}
          >
            💸 CHEAPEST
          </button>
          <button
            onClick={() => setSortBy("nonstop")}
            className={`rounded-md px-3 py-2 text-xs font-medium ${sortBy === "nonstop" ? "bg-blue-100 text-blue-900" : "bg-white"} border`}
          >
            ⛳ NON STOP FIRST
          </button>
          <button
            onClick={() => setSortBy("prefer")}
            className={`rounded-md px-3 py-2 text-xs font-medium ${sortBy === "prefer" ? "bg-zinc-100 text-zinc-900" : "bg-white"} border`}
          >
            ⭐ YOU MAY PREFER
          </button>
        </div>
      </div>

      {/* Full-width FILTER TOOLBAR */}
      <div className="mb-5 rounded-lg border bg-white p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4" checked={nonStop} onChange={(e) => setNonStop(e.target.checked)} />
              Non Stop
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4" checked={oneStop} onChange={(e) => setOneStop(e.target.checked)} />
              1 Stop
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4" checked={twoPlus} onChange={(e) => setTwoPlus(e.target.checked)} />
              2+ Stops
            </label>
          </div>

          <div className="mx-2 hidden h-6 w-px bg-zinc-200 md:block" />

          <div className="flex items-center gap-2 text-sm">
            <span className="text-zinc-600">One Way Price</span>
            <input
              type="number"
              className="w-28 rounded border px-2 py-1 text-sm"
              value={minPrice ?? ""}
              onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
              placeholder={priceStats.min ? String(priceStats.min) : "min"}
            />
            <span className="text-zinc-400">—</span>
            <input
              type="number"
              className="w-28 rounded border px-2 py-1 text-sm"
              value={maxPrice ?? ""}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
              placeholder={priceStats.max ? String(priceStats.max) : "max"}
            />
          </div>

          <div className="ml-auto">
            <button
              onClick={clearFilters}
              className="rounded border px-3 py-1.5 text-sm hover:bg-zinc-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {err && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-800">
          {err}
        </div>
      )}

      {/* Content: results + RIGHT rail filters */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr,300px]">
        {/* RESULTS */}
        <section>
          {loading ? (
            <div className="rounded-lg border bg-white p-6">Searching…</div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border bg-white p-6 text-zinc-600">
              No flights match these filters.
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((c) => (
                <div key={c.resultIndex} className="overflow-hidden rounded-lg border bg-white">
                  {/* ribbon + top actions */}
                  <div className="flex items-center justify-between border-b px-4 py-2 text-[11px] text-zinc-600">
                    <div className="inline-flex items-center rounded bg-emerald-50 px-2 py-0.5 text-emerald-700">
                      Free Seat with VISA Card*
                    </div>
                    <button
                      onClick={() => selectCard(c)}
                      className="rounded bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      VIEW PRICES
                    </button>
                  </div>

                  {/* main row */}
                  <div className="grid grid-cols-12 items-center gap-3 px-4 py-3">
                    <div className="col-span-3">
                      <div className="text-sm font-semibold">
                        {airlineName(c.airlineCode, airlineMap) || c.airlineCode}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {c.airlineCode} {c.flightNumber || ""}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <div className="text-lg font-semibold">{c.departHHMM}</div>
                      <div className="text-xs text-zinc-500">{c.from}</div>
                    </div>

                    <div className="col-span-2 text-center text-xs text-zinc-500">
                      <div className="text-zinc-700">{minutesToHMM(c.durationMins)}</div>
                      <div className="my-1 h-[2px] w-full bg-gradient-to-r from-zinc-300 via-zinc-400 to-zinc-300" />
                      <div>{c.isNonStop ? "Non stop" : `${c.stops} stop`}</div>
                    </div>

                    <div className="col-span-2 text-right">
                      <div className="text-lg font-semibold">{c.arriveHHMM}</div>
                      <div className="text-xs text-zinc-500">{c.to}</div>
                    </div>

                    <div className="col-span-3 text-right">
                      <div className="text-xl font-bold">
                        ₹ {c.priceINR.toLocaleString("en-IN")}
                      </div>
                      <button
                        onClick={() => selectCard(c)}
                        className="mt-1 rounded border border-blue-600 px-3 py-1.5 text-sm font-semibold text-blue-700 hover:bg-blue-50"
                      >
                        Select
                      </button>
                    </div>
                  </div>

                  {/* tiny footer */}
                  <div className="border-t px-4 py-2 text-[11px] text-zinc-500">
                    Get FLAT ₹175 OFF using MMTSUPER | Get FLAT ₹500 OFF using HDFCDEALS
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RIGHT RAIL: Airlines filter */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-lg border bg-white p-4">
            <div className="mb-2 font-semibold">Airlines</div>
            <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
              {airlineOptions.map((a) => {
                const checked = selectedAirlines.has(a.code);
                return (
                  <label key={a.code} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedAirlines((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(a.code);
                          else next.delete(a.code);
                          return next;
                        });
                      }}
                    />
                    {a.name || a.code}
                    <span className="ml-auto text-[12px] text-zinc-500">
                      ₹ {a.lowest.toLocaleString("en-IN")}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setSelectedAirlines(new Set())}
                className="rounded border px-3 py-1.5 text-sm hover:bg-zinc-50"
              >
                Clear airlines
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
