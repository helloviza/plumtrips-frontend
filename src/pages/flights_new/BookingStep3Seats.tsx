// ============================================================
//  BookingStep3Seats.tsx — Step 3: Seat Selection (FIXED)
//
//  Fixes:
//  1. Props now use ssrDataPerLeg (array) consistently — no more
//     mixed ssrData / ssrDataPerLeg mismatch.
//  2. seatMaps is derived per-leg from ssrDataPerLeg[i], so
//     round-trip and multi-city show the correct seat map per leg.
//  3. legs array is memoized to avoid the useMemo dependency loop.
//  4. Premium note reads from current active leg's SSR, not undefined.
//  5. Completely redesigned aircraft-style seat map UI.
// ============================================================

import { useState, useMemo } from "react";
import type { DisplayFlight, FareTier } from "../../lib/types_t";
import type { PassengerData, SeatMap } from "./BookingShared";
import { SectionHeading, AIRLINE_COLORS } from "./BookingShared";
import type { SSRResult } from "../../lib/flights_api";

// ─── PROPS ──────────────────────────────────────────────────

interface Step3Props {
  flight: DisplayFlight;
  tier: FareTier;
  passengers: PassengerData[];
  paxTypes: ("Adult" | "Child" | "Infant")[];
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  returnFlight?: DisplayFlight;
  isRoundTrip: boolean;
  isMultiCity: boolean;
  ssrDataPerLeg: (SSRResult | null)[]; // one entry per leg, in leg order
  ssrLoading: boolean;
  onChange: (passengers: PassengerData[]) => void;
  onNext: () => void;
  onBack: () => void;
}

// ─── HELPERS ────────────────────────────────────────────────

function ssrToSeatMap(ssr: SSRResult | null): SeatMap | null {
  if (!ssr) return null;
  const apiMap = ssr.seatMap;
  if (!apiMap || !apiMap.rows || apiMap.rows.length === 0) return null;

  const occupied = apiMap.rows.flatMap((r) =>
    r.seats.filter((s) => s.isOccupied).map((s) => s.code)
  );
  const premium = apiMap.rows.flatMap((r) =>
    r.seats.filter((s) => s.isPremium).map((s) => s.code)
  );
  const prices: Record<string, number> = Object.fromEntries(
    apiMap.rows.flatMap((r) => r.seats.map((s) => [s.code, s.price]))
  );

  return {
    rows: apiMap.totalRows,
    cols: apiMap.cols,
    occupied,
    premium,
    prices,
  };
}

// ─── COMPONENT ──────────────────────────────────────────────

export default function BookingStep3Seats({
  flight,
  tier,
  passengers,
  paxTypes,
  multiCityLegs,
  returnFlight,
  isRoundTrip,
  isMultiCity,
  ssrDataPerLeg,
  ssrLoading,
  onChange,
  onNext,
  onBack,
}: Step3Props) {
  const [activeLeg, setActiveLeg] = useState(0);
  const [activePax, setActivePax] = useState(0);

  // ── Leg definitions (memoized so they don't cause useMemo loops) ──
  const legs = useMemo(
    () => [
      {
        flight,
        tier,
        label:
          isRoundTrip ? "Outbound" : isMultiCity ? "Leg 1" : "Seat Map",
      },
      ...(isRoundTrip && returnFlight
        ? [{ flight: returnFlight, tier, label: "Return" }]
        : []),
      ...(isMultiCity
        ? (multiCityLegs ?? []).slice(1).map((l, i) => ({
            ...l,
            label: `Leg ${i + 2}`,
          }))
        : []),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      flight.resultIndex,
      returnFlight?.resultIndex,
      isRoundTrip,
      isMultiCity,
      multiCityLegs?.length,
    ]
  );

  // ── One SeatMap entry per leg ──────────────────────────────
  const seatMaps: (SeatMap | null)[] = useMemo(
    () => legs.map((_, i) => ssrToSeatMap(ssrDataPerLeg[i] ?? null)),
    [legs, ssrDataPerLeg]
  );

  // ── Seat selections keyed as "legIdx-paxIdx" ──────────────
  const [selections, setSelections] = useState<Record<string, string>>({});

  function seatKey(legIdx: number, paxIdx: number) {
    return `${legIdx}-${paxIdx}`;
  }

  function selectSeat(seat: string) {
    const key = seatKey(activeLeg, activePax);
    const currentMap = seatMaps[activeLeg];
    if (!currentMap) return;
    if (currentMap.occupied.includes(seat)) return;

    // Don't allow another pax's already-selected seat on this leg
    const takenByOther = Object.entries(selections).some(
      ([k, v]) => v === seat && k.startsWith(`${activeLeg}-`) && k !== key
    );
    if (takenByOther) return;

    setSelections((prev) => {
      const next = { ...prev };
      if (prev[key] === seat) {
        delete next[key]; // deselect
      } else {
        next[key] = seat;
        // Auto-advance to next passenger
        if (activePax < passengers.length - 1) setActivePax((p) => p + 1);
      }
      return next;
    });
  }

  function handleContinue() {
    // Write leg-0 seat selections back into passenger data
    const updated = passengers.map((p, i) => ({
      ...p,
      selectedSeat: selections[seatKey(0, i)] ?? p.selectedSeat,
    }));
    onChange(updated);
    onNext();
  }

  const currentMap = seatMaps[activeLeg];
  const activeLegSSR = ssrDataPerLeg[activeLeg] ?? null;

  // Price of cheapest premium seat on this leg
  const premiumPrice = activeLegSSR
    ? activeLegSSR.seatMap.rows
        .flatMap((r) => r.seats)
        .filter((s) => s.isPremium && s.price > 0)
        .reduce((min, s) => (s.price < min ? s.price : min), Infinity)
    : null;

  // ── RENDER ─────────────────────────────────────────────────

  return (
    <div>
      <SectionHeading
        step="3"
        title="Seat Selection"
        desc="Pick your preferred seats. You can skip — seats can also be selected at check-in."
        accent="violet"
      />

      {/* ── Leg tabs ────────────────────────────────────────── */}
      {legs.length > 1 && (
        <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-none">
          {legs.map((leg, i) => (
            <button
              key={i}
              onClick={() => {
                setActiveLeg(i);
                setActivePax(0);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeLeg === i
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
              }`}
            >
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black"
                style={{
                  background:
                    activeLeg === i
                      ? "rgba(255,255,255,0.25)"
                      : (AIRLINE_COLORS[leg.flight.airlineCode] ?? "#64748b"),
                  color: "white",
                }}
              >
                {leg.flight.airlineCode.slice(0, 2)}
              </div>
              {leg.label}: {leg.flight.fromCode} → {leg.flight.toCode}
              {seatMaps[i] === null && !ssrLoading && (
                <span className="ml-1 text-[9px] text-amber-500 font-normal">
                  unavailable
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Passenger selector ──────────────────────────────── */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {passengers.map((p, i) => {
          const hasSeat = !!selections[seatKey(activeLeg, i)];
          const seatCode = selections[seatKey(activeLeg, i)];
          const isPremiumSeat =
            seatCode && currentMap?.premium.includes(seatCode);
          return (
            <button
              key={i}
              onClick={() => setActivePax(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                activePax === i
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black ${
                  hasSeat
                    ? isPremiumSeat
                      ? "bg-amber-400 text-white"
                      : "bg-emerald-500 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {hasSeat ? "✓" : i + 1}
              </div>
              {p.firstName || `Pax ${i + 1}`}
              {hasSeat && (
                <span
                  className={`font-mono font-black ${
                    isPremiumSeat ? "text-amber-500" : "text-emerald-600"
                  }`}
                >
                  {seatCode}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Seat map ────────────────────────────────────────── */}
      {ssrLoading ? (
        <LoadingState />
      ) : currentMap ? (
        <AircraftSeatMap
          map={currentMap}
          activeLeg={activeLeg}
          activePax={activePax}
          passengers={passengers}
          selections={selections}
          onSelectSeat={selectSeat}
          premiumPrice={premiumPrice === Infinity ? null : premiumPrice}
        />
      ) : (
        <UnavailableState />
      )}

      {/* ── Selection summary ───────────────────────────────── */}
      {Object.keys(selections).length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
          <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">
            Selected Seats
          </div>
          <div className="flex flex-wrap gap-2">
            {legs.map((leg, legIdx) =>
              passengers.map((p, paxIdx) => {
                const seat = selections[seatKey(legIdx, paxIdx)];
                if (!seat) return null;
                return (
                  <div
                    key={`${legIdx}-${paxIdx}`}
                    className="flex items-center gap-1.5 bg-white rounded-xl px-3 py-1.5 border border-blue-200"
                  >
                    {legs.length > 1 && (
                      <span className="text-[9px] font-black text-slate-400 uppercase">
                        {leg.label}
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-700">
                      {p.firstName || `Pax ${paxIdx + 1}`}
                    </span>
                    <span className="text-xs font-mono font-black text-blue-600">
                      {seat}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── Navigation ──────────────────────────────────────── */}
      <div className="flex gap-3 mt-2">
        <button
          onClick={onBack}
          className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-sm hover:border-slate-300 hover:bg-white transition-all"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 border-2 border-slate-200 text-slate-600 font-bold py-3.5 rounded-2xl text-sm hover:border-blue-300 hover:text-blue-600 transition-all"
        >
          Skip for now
        </button>
        <button
          onClick={handleContinue}
          className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-blue-200"
        >
          Continue to Extras →
        </button>
      </div>
    </div>
  );
}

// ─── AIRCRAFT SEAT MAP ───────────────────────────────────────

interface AircraftSeatMapProps {
  map: SeatMap;
  activeLeg: number;
  activePax: number;
  passengers: PassengerData[];
  selections: Record<string, string>;
  onSelectSeat: (seat: string) => void;
  premiumPrice: number | null;
}

function AircraftSeatMap({
  map,
  activeLeg,
  activePax,
  passengers,
  selections,
  onSelectSeat,
  premiumPrice,
}: AircraftSeatMapProps) {
  function seatKey(legIdx: number, paxIdx: number) {
    return `${legIdx}-${paxIdx}`;
  }

  // Find the aisle position — split between column groups
  // Standard: ABC | DEF  → aisle after index 2 (before D)
  // Some aircraft: AB | CDE → aisle after 1
  const aisleAfterIndex = map.cols.length > 4 ? Math.floor(map.cols.length / 2) : Math.ceil(map.cols.length / 2);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-4">

      {/* Aircraft nose graphic */}
      <div className="relative bg-gradient-to-b from-slate-50 to-white border-b border-slate-100 py-5 flex flex-col items-center">
        {/* Nose SVG */}
        <svg width="80" height="40" viewBox="0 0 80 40" className="mb-1 opacity-30">
          <path d="M40 2 C20 2, 4 12, 4 24 L4 38 L76 38 L76 24 C76 12, 60 2, 40 2 Z"
            fill="none" stroke="#64748b" strokeWidth="1.5" />
          <path d="M40 2 L40 38" stroke="#64748b" strokeWidth="0.75" strokeDasharray="3 3" />
          <ellipse cx="40" cy="38" rx="36" ry="4" fill="#64748b" opacity="0.08" />
        </svg>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
          Front of aircraft
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-[10px]">
          <LegendItem
            color="bg-blue-600"
            border=""
            label="Your seat"
          />
          <LegendItem
            color="bg-emerald-100"
            border="border border-emerald-300"
            label="Other pax"
          />
          <LegendItem
            color="bg-amber-100"
            border="border border-amber-300"
            label="Premium"
          />
          <LegendItem
            color="bg-slate-100"
            border="border border-slate-200"
            label="Available"
          />
          <LegendItem
            color="bg-slate-700"
            border=""
            label="Taken"
          />
        </div>
      </div>

      {/* Scrollable seat grid */}
      <div className="overflow-auto max-h-[520px]">
        <div className="p-4 min-w-[340px] w-fit mx-auto">

          {/* Column headers */}
          <div className="flex items-center mb-3 pl-9">
            {map.cols.map((col, ci) => (
              <div
                key={col}
                className={`w-10 text-center text-[10px] font-black text-slate-400 ${
                  ci === aisleAfterIndex ? "ml-6" : ""
                }`}
              >
                {col}
              </div>
            ))}
          </div>

          {/* Seat rows */}
          {Array.from({ length: map.rows }, (_, ri) => {
            const row = ri + 1;
            // Determine zone by row number for visual banding
            const isExitRow =
              row === 12 || row === 13 || row === 14 || row === 26 || row === 27;
            const isFirstPremiumZone = row <= 3;
            const isSecondPremiumZone =
              (row === 12 || row === 13) && map.premium.some((s) => s.startsWith(`${row}`));

            return (
              <div key={row}>
                {/* Zone label */}
                {row === 1 && (
                  <ZoneLabel label="Business / Premium" color="text-amber-500" />
                )}
                {row === 4 && !isSecondPremiumZone && (
                  <ZoneLabel label="Economy" color="text-slate-400" />
                )}
                {isExitRow && row === 12 && (
                  <ExitRowDivider />
                )}

                <div className="flex items-center mb-1.5 group">
                  {/* Row number */}
                  <div className="w-8 shrink-0 text-right pr-2 text-[10px] text-slate-300 font-bold group-hover:text-slate-500 transition-colors">
                    {row}
                  </div>

                  {/* Seats */}
                  {map.cols.map((col, ci) => {
                    const seat = `${row}${col}`;
                    const isOccupied = map.occupied.includes(seat);
                    const isPremium = map.premium.includes(seat);
                    const price = map.prices?.[seat] ?? 0;

                    // Who has this seat?
                    const myKey = seatKey(activeLeg, activePax);
                    const isSelectedByMe = selections[myKey] === seat;
                    const otherPaxIdx = Object.entries(selections).find(
                      ([k, v]) =>
                        v === seat &&
                        k.startsWith(`${activeLeg}-`) &&
                        k !== myKey
                    )?.[0]?.split("-")[1];
                    const isSelectedByOther = otherPaxIdx !== undefined;

                    const seatType =
                      ci === 0 || ci === map.cols.length - 1
                        ? "window"
                        : ci === aisleAfterIndex - 1 || ci === aisleAfterIndex
                        ? "aisle"
                        : "middle";

                    return (
                      <button
                        key={col}
                        onClick={() => onSelectSeat(seat)}
                        disabled={isOccupied || isSelectedByOther}
                        title={
                          isOccupied
                            ? "Seat unavailable"
                            : isSelectedByOther
                            ? `Taken by ${
                                passengers[Number(otherPaxIdx)]?.firstName ||
                                `Pax ${Number(otherPaxIdx) + 1}`
                              }`
                            : price > 0
                            ? `${seatType.charAt(0).toUpperCase() + seatType.slice(1)} · Premium · +₹${price}`
                            : `${seatType.charAt(0).toUpperCase() + seatType.slice(1)} · Free`
                        }
                        className={[
                          "relative w-10 h-9 rounded-t-2xl rounded-b-sm text-[9px] font-bold transition-all duration-100",
                          "flex flex-col items-center justify-center gap-px",
                          ci === aisleAfterIndex ? "ml-6" : "",
                          isOccupied
                            ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                            : isSelectedByOther
                            ? "bg-emerald-100 border border-emerald-300 text-emerald-700 cursor-not-allowed"
                            : isSelectedByMe
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200/60 scale-105 ring-2 ring-blue-400 ring-offset-1 z-10"
                            : isPremium && price > 0
                            ? "bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 hover:scale-105 hover:shadow-md hover:shadow-amber-100 cursor-pointer"
                            : "bg-slate-100 border border-slate-200 text-slate-500 hover:bg-slate-200 hover:scale-105 hover:shadow-sm cursor-pointer",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {isOccupied ? (
                          <span className="text-[10px] opacity-40">✕</span>
                        ) : isSelectedByMe ? (
                          <>
                            <span className="text-[11px] leading-none">✓</span>
                            <span className="text-[8px] font-mono opacity-80 leading-none">{seat}</span>
                          </>
                        ) : isSelectedByOther ? (
                          <span className="text-[8px] font-mono leading-none">
                            {passengers[Number(otherPaxIdx)]?.firstName?.[0] ||
                              "P"}
                          </span>
                        ) : (
                          <>
                            <span className="font-mono leading-none">{seat}</span>
                            {price > 0 && (
                              <span className="text-[7px] opacity-60 leading-none">
                                ₹{price >= 1000 ? `${(price / 1000).toFixed(1)}k` : price}
                              </span>
                            )}
                          </>
                        )}

                        {/* Seat back indicator (bottom bar) */}
                        <span
                          className={[
                            "absolute bottom-0 left-1 right-1 h-1 rounded-full",
                            isSelectedByMe
                              ? "bg-blue-400"
                              : isOccupied
                              ? "bg-slate-600"
                              : isPremium && price > 0
                              ? "bg-amber-200"
                              : "bg-slate-200",
                          ].join(" ")}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Tail of aircraft */}
          <div className="flex flex-col items-center mt-4 opacity-30">
            <svg width="80" height="30" viewBox="0 0 80 30">
              <path
                d="M4 2 L76 2 L76 14 C76 22, 60 28, 40 28 C20 28, 4 22, 4 14 Z"
                fill="none"
                stroke="#64748b"
                strokeWidth="1.5"
              />
            </svg>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">
              Rear
            </div>
          </div>
        </div>
      </div>

      {/* Premium info footer */}
      {premiumPrice !== null && premiumPrice !== undefined && (
        <div className="px-6 py-3 bg-amber-50 border-t border-amber-100 flex items-center gap-2">
          <span className="text-amber-500 text-sm">★</span>
          <span className="text-xs text-amber-700 font-medium">
            Premium seats include extra legroom · from{" "}
            <strong>+₹{premiumPrice.toLocaleString("en-IN")}</strong> per seat
          </span>
        </div>
      )}
    </div>
  );
}

// ─── SMALL HELPERS ───────────────────────────────────────────

function LegendItem({
  color,
  border,
  label,
}: {
  color: string;
  border: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-5 h-4 rounded-t-lg rounded-b-sm ${color} ${border}`}
      />
      <span className="text-slate-500">{label}</span>
    </div>
  );
}

function ZoneLabel({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <div className={`text-[9px] font-black uppercase tracking-widest ${color} py-1.5 text-center`}>
      {label}
    </div>
  );
}

function ExitRowDivider() {
  return (
    <div className="flex items-center gap-2 my-2 py-1">
      <div className="flex-1 border-t border-dashed border-green-300" />
      <div className="text-[9px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 whitespace-nowrap">
        ⚡ Emergency Exit Row
      </div>
      <div className="flex-1 border-t border-dashed border-green-300" />
    </div>
  );
}

function LoadingState() {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-10 text-center mb-4">
      <div className="w-7 h-7 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
      <p className="text-sm font-medium text-slate-500 mb-1">
        Loading seat map from airline…
      </p>
      <p className="text-xs text-slate-400">This usually takes a few seconds</p>
    </div>
  );
}

function UnavailableState() {
  return (
    <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-8 text-center mb-4">
      <div className="text-3xl mb-3">✈️</div>
      <p className="text-sm font-medium text-slate-600 mb-1">
        Seat map not available for this flight
      </p>
      <p className="text-xs text-slate-400">
        You can choose your seat at check-in, usually 24–48 hours before departure.
      </p>
    </div>
  );
}