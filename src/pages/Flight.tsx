// apps/frontend/src/pages/Flight.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import type { Flight } from "../components/flights/FlightCard";

/* ------------------------------ Utils ------------------------------ */
const pad2 = (n: number) => String(n).padStart(2, "0");
const hhmm = (d?: Date | null) => (d ? `${pad2(d.getHours())}:${pad2(d.getMinutes())}` : "--:--");
const toNum = (v: unknown, fb = 0) => (Number.isFinite(Number(v)) ? Number(v) : fb);
const fmtINR = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

/** Pull selected flight from sessionStorage if state is missing */
function readSelectedFlightFromStorage(): Flight | null {
  try {
    const raw = sessionStorage.getItem("plumtrips.selectedFlight");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.flight) return parsed.flight as Flight;
  } catch {}
  return null;
}

/** Map a TBO FareQuote-like object to our Flight shape */
function mapQuoteToFlight(obj: any, idx = 0): Flight {
  const segs = obj?.Segments;
  const legs: any[] = Array.isArray(segs?.[0]) ? segs[0] : Array.isArray(segs) ? segs : [];
  const first = legs[0] ?? segs?.[0]?.[0] ?? segs?.[0] ?? {};

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
    first?.CabinClass === 6 ? "first" : first?.CabinClass === 4 ? "business" : first?.CabinClass === 3 ? "premium" : "economy";

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

/* ------------------------------ Page ------------------------------ */
export default function FlightReviewPage() {
  const { search, state } = useLocation();
  const navigate = useNavigate();
  const q = new URLSearchParams(search);

  const ri = q.get("ri") || "";
  const from = (q.get("from") || "").toUpperCase();
  const to = (q.get("to") || "").toUpperCase();
  const date = q.get("date") || "";
  const adults = q.get("adults") || "1";
  const cabin = (q.get("cabin") || "economy") as Flight["cabin"];

  // 1) Show immediately from state (if we arrived via Select), otherwise sessionStorage
  const fastFromState = (state as any)?.flight as Flight | undefined;
  const fastFromStore = !fastFromState ? readSelectedFlightFromStorage() ?? undefined : undefined;
  const [flight, setFlight] = useState<Flight | null>(fastFromState ?? fastFromStore ?? null);

  // 2) Then try live FareQuote (optional)
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    if (!ri) return; // nothing to quote without a ResultIndex

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/v1/flights/tbo/fare-quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resultIndex: ri }),
        });

        if (!res.ok) throw new Error(`FareQuote failed: ${res.status}`);

        const data = await res.json();
        const result = data?.Response?.Results ?? data?.Response ?? data;

        if (!ignore) {
          setQuote(result);
          if (!fastFromState && !fastFromStore) setFlight(mapQuoteToFlight(result));
        }
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to quote fare.");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ri]);

  // Fare summary (falls back to selected flight price if no quote)
  const fare = useMemo(() => {
    const f = quote?.Fare ?? {};
    return {
      published: toNum(f?.PublishedFare, flight?.priceINR ?? 0),
      offered: toNum(f?.OfferedFare, 0),
      base: toNum(f?.BaseFare, 0),
      taxes: toNum(f?.Tax, 0),
      yqTax: toNum(f?.YQTax, 0),
      otherCharges: toNum(f?.OtherCharges, 0),
      discounts: toNum(f?.Discount, 0),
      refundable: Boolean(quote?.IsRefundable ?? quote?.FareRules?.[0]?.IsRefundable),
      currency: f?.Currency || "INR",
    };
  }, [quote, flight?.priceINR]);

  const handleBack = () => {
    const params = new URLSearchParams({ from, to, date, adults, cabin });
    navigate(`/flights?${params.toString()}`);
  };

  const handleBook = () => {
    const params = new URLSearchParams({ ri, from, to, date, adults, cabin });
    navigate(`/flights/book?${params.toString()}`, { state: { flight, quote } });
  };

  // ---- Debug banner (helps confirm data flow; remove if you like) ----
  const showDebug = !flight;
  // -------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header / crumbs */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
        <button type="button" onClick={handleBack} className="rounded-md border px-3 py-1.5 hover:bg-zinc-50">
          ← Back to results
        </button>
        <span className="mx-1 text-zinc-400">•</span>
        <span className="font-medium">
          Review &amp; Fare Quote — {from} → {to} {date ? `on ${date}` : ""}
        </span>
      </div>

      {showDebug && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Selected flight not found in navigation state/session. Still trying live quote (ri={ri || "—"}).
          If this persists, go back and select a flight again.
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
          Live quote unavailable ({error}). Showing your selected flight details (if available).
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr,340px]">
        {/* Left: selected itinerary */}
        <div className="rounded-lg border bg-white p-5">
          <div className="mb-4 text-lg font-semibold">Selected Itinerary</div>

          {flight ? (
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm text-zinc-500">
                  {(flight.airlineName || flight.airlineCode) ?? "--"} • {flight.flightNumber}
                </div>
                <div className="text-xl font-bold">
                  {flight.from} {flight.departTime} → {flight.to} {flight.arriveTime}
                </div>
                <div className="text-xs text-zinc-500">
                  {flight.durationMins} mins •{" "}
                  {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`} •{" "}
                  {flight.cabin}
                </div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-lg font-semibold">{fmtINR(flight.priceINR)}</div>
                <div className="text-xs text-zinc-500">Indicative</div>
              </div>
            </div>
          ) : (
            <div className="text-sm text-zinc-600">
              {loading ? "Loading quote…" : "No flight details received. Go back and pick a flight again."}
            </div>
          )}
        </div>

        {/* Right: fare breakdown / actions */}
        <div className="md:sticky md:top-20 md:self-start">
          <div className="rounded-lg border bg-white p-5">
            <div className="mb-3 text-base font-semibold">Fare Summary</div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Fare</span>
                <span>{fmtINR(fare.base)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes &amp; Fees</span>
                <span>{fmtINR(fare.taxes + fare.yqTax + fare.otherCharges)}</span>
              </div>
              {fare.discounts > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>-{fmtINR(fare.discounts)}</span>
                </div>
              )}
              <div className="my-2 border-t" />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{fmtINR(fare.published || fare.offered)}</span>
              </div>
              <div className="text-xs text-zinc-500">
                {fare.refundable ? "Refundable" : "Non-refundable"} • Currency: {fare.currency}
              </div>
            </div>

            <button
              type="button"
              disabled={loading || !ri}
              onClick={handleBook}
              className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Preparing…" : "Proceed to Book"}
            </button>

            <div className="mt-3 text-center text-xs">
              <Link to="#" onClick={handleBack} className="text-blue-700 underline underline-offset-4">
                Change selection
              </Link>
            </div>
          </div>

          {loading && (
            <div className="mt-4 rounded-md border bg-white p-4 text-sm text-zinc-600">
              Fetching live fare quote…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
