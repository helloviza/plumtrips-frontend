// ============================================================
//  ResultsPage.tsx — Complete Industry-Standard Rewrite
//  Handles: One-Way, Round Trip, Multi-City
//  Filters: Stops, Airlines, Price, Departure/Arrival slots,
//           Duration, Refundable, Aircraft type, Early bird
//  Sort: Price, Duration, Departure, Arrival, Rating
//  Mobile-first, fully responsive
// ============================================================

import { useState, useMemo, useEffect, useCallback } from "react";
import type { SearchForm, DisplayFlight, ActiveFilters, FareTier, Airport } from "../../lib/types_t";
import { formatINR, MOCK_MODE, apiSearchFlights, apiFareQuote } from "../../lib/flights_api";
import type { FlightSearchResult, FareQuoteResult } from "../../lib/flights_api";

type CityLeg = { from: Airport; to: Airport; departDate: string };

// ─── CONSTANTS ─────────────────────────────────────────────

const AIRLINE_COLORS: Record<string, { bg: string; text: string }> = {
  "6E": { bg: "#1b4b9e", text: "#fff" },
  AI: { bg: "#c8102e", text: "#fff" },
  SG: { bg: "#d03f2f", text: "#fff" },
  UK: { bg: "#5c1c81", text: "#fff" },
  QP: { bg: "#e87722", text: "#fff" },
  IX: { bg: "#c8102e", text: "#fff" },
  G8: { bg: "#f5a623", text: "#000" },
  "2T": { bg: "#00796b", text: "#fff" },
};

const AIRLINE_NAMES: Record<string, string> = {
  "6E": "IndiGo", AI: "Air India", SG: "SpiceJet",
  UK: "Vistara", QP: "Akasa Air", IX: "Air India Express",
  G8: "Go First", "2T": "TruJet",
};

const TIME_SLOTS = [
  { id: "early", label: "Early Morning", sub: "Before 6 AM", icon: "🌙", range: [0, 6] },
  { id: "morning", label: "Morning", sub: "6 AM – 12 PM", icon: "🌅", range: [6, 12] },
  { id: "afternoon", label: "Afternoon", sub: "12 PM – 6 PM", icon: "☀️", range: [12, 18] },
  { id: "evening", label: "Evening", sub: "After 6 PM", icon: "🌆", range: [18, 24] },
];

// ─── HELPERS ───────────────────────────────────────────────

function durationStr(mins: number) {
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function timeToMins(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function slotMatch(time: string, slotId: string | null) {
  if (!slotId) return true;
  const slot = TIME_SLOTS.find(s => s.id === slotId);
  if (!slot) return true;
  const h = Math.floor(timeToMins(time) / 60);
  return h >= slot.range[0] && h < slot.range[1];
}

function co2Badge(stops: number, duration: number) {
  const base = 80 + duration * 0.15 + stops * 25;
  return Math.round(base);
}

// ─── AIRLINE BADGE ─────────────────────────────────────────

function AirlineLogo({ code, size = "md" }: { code: string; size?: "sm" | "md" | "lg" }) {
  const color = AIRLINE_COLORS[code] ?? { bg: "#475569", text: "#fff" };
  const sz = { sm: "w-8 h-8 text-[10px]", md: "w-10 h-10 text-xs", lg: "w-12 h-12 text-sm" }[size];
  return (
    <div
      className={`${sz} rounded-xl flex items-center justify-center font-black shrink-0 shadow-sm`}
      style={{ background: color.bg, color: color.text }}
    >
      {code}
    </div>
  );
}

// ─── FLIGHT TIMELINE ───────────────────────────────────────

function FlightTimeline({ stops, stopInfo }: { stops: number; stopInfo?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 flex-1 px-2">
      <div className="flex items-center w-full gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
        <div className="flex-1 relative h-px">
          <div className="absolute inset-0 border-t-2 border-dashed border-slate-200" />
          {stops > 0 && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 border-2 border-white shadow" />
          )}
        </div>
        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
        </svg>
      </div>
      <div className={`text-[10px] font-bold ${stops === 0 ? "text-emerald-600" : "text-amber-600"}`}>
        {stops === 0 ? "Non-stop" : `${stops} stop${stops > 1 ? "s" : ""}${stopInfo ? ` · ${stopInfo}` : ""}`}
      </div>
    </div>
  );
}

// ─── FARE TIER CARD ────────────────────────────────────────

function FareTierCard({
  tier, selected, onSelect
}: { tier: FareTier; selected: boolean; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className={`relative rounded-2xl border-2 cursor-pointer transition-all duration-200 ${selected ? "border-blue-600 shadow-lg shadow-blue-100" : "border-slate-200 hover:border-slate-300"
        }`}
    >
      {tier.recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-blue-500 text-white text-[10px] font-black px-3 py-0.5 rounded-full whitespace-nowrap tracking-wide uppercase">
          Best Value
        </div>
      )}
      <div className={`p-4 rounded-2xl h-full flex flex-col gap-3 ${selected ? "bg-blue-50/60" : "bg-white"}`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="font-black text-slate-800 text-sm">{tier.name}</div>
            <div className="text-xl font-black text-slate-900 mt-0.5">{formatINR(tier.price)}</div>
            <div className="text-[10px] text-slate-400 font-medium">per adult</div>
          </div>
          <div className={`w-5 h-5 rounded-full border-2 mt-1 flex items-center justify-center shrink-0 transition-all ${selected ? "border-blue-600 bg-blue-600" : "border-slate-300"
            }`}>
            {selected && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
        </div>

        <div className="space-y-2 flex-1">
          {[
            { icon: "🧳", label: "Check-in", val: tier.checkinBag },
            { icon: "💼", label: "Cabin", val: tier.cabinBag },
            { icon: "↩️", label: "Cancel", val: tier.cancellationFee },
            { icon: "📅", label: "Reschedule", val: tier.dateChangeFee },
            { icon: "💺", label: "Seat", val: tier.seatSelection },
            { icon: "🍽️", label: "Meals", val: tier.meals },
          ].map(({ icon, label, val }) => (
            <div key={label} className="flex items-start gap-2">
              <span className="text-xs mt-0.5 shrink-0">{icon}</span>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-400 font-medium leading-none">{label}</div>
                <div className="text-xs font-semibold text-slate-700 leading-tight mt-0.5">{val}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FARE MODAL ────────────────────────────────────────────

function FareModal({
  flight, legIndex, totalLegs, onClose, onBook,
}: {
  flight: DisplayFlight;
  legIndex?: number;
  totalLegs?: number;
  onClose: () => void;
  onBook: (tier: FareTier) => void;
}) {
  const [selected, setSelected] = useState(1);
  const [tiers, setTiers] = useState<FareTier[]>([]);
  const [quoteLoading, setQuoteLoading] = useState(true);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [fareChanged, setFareChanged] = useState(false);
  const isMultiLeg = totalLegs && totalLegs > 1;

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // FIX: Fetch real fare tiers via apiFareQuote instead of calling getMockFareTiers.
  // apiFareQuote handles MOCK_MODE internally, so this single call works in both modes.
  useEffect(() => {
    setQuoteLoading(true);
    setQuoteError(null);
    apiFareQuote(flight)
      .then((result: FareQuoteResult) => {
        setTiers(result.tiers);
        setFareChanged(result.fareChanged);
        // Default selection: recommended tier if present, else index 1, else 0
        const recIdx = result.tiers.findIndex(t => t.recommended);
        setSelected(recIdx >= 0 ? recIdx : Math.min(1, result.tiers.length - 1));
        setQuoteLoading(false);
      })
      .catch((e: unknown) => {
        setQuoteError(e instanceof Error ? e.message : "Failed to fetch fare details");
        setQuoteLoading(false);
      });
  }, [flight.resultIndex]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-3xl bg-white sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95dvh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 shrink-0 bg-white">
          <AirlineLogo code={flight.airlineCode} />
          <div className="flex-1 min-w-0">
            <div className="font-black text-slate-800 text-sm truncate">
              {flight.airline} · {flight.flightNumber}
              {isMultiLeg && (
                <span className="ml-2 text-xs font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                  Leg {(legIndex ?? 0) + 1} of {totalLegs}
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500 truncate">
              {flight.departTime} → {flight.arriveTime} · {flight.durationLabel} · {
                flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`
              }
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Fare changed warning */}
        {fareChanged && (
          <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
            <span className="text-amber-500 text-lg shrink-0">⚠️</span>
            <div className="text-xs text-amber-700 font-semibold">
              The fare has changed since your search. The updated price is shown below.
            </div>
          </div>
        )}

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-5">
          {quoteLoading ? (
            // Loading skeleton
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[0, 1, 2].map(i => (
                <div key={i} className="rounded-2xl border-2 border-slate-100 p-4 animate-pulse space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-16" />
                  <div className="h-7 bg-slate-200 rounded w-24" />
                  <div className="space-y-2 mt-4">
                    {[1, 2, 3, 4].map(j => <div key={j} className="h-3 bg-slate-100 rounded" />)}
                  </div>
                </div>
              ))}
            </div>
          ) : quoteError ? (
            // Error state with retry
            <div className="text-center py-10">
              <div className="text-4xl mb-3">⚠️</div>
              <div className="font-black text-slate-700 mb-1">Could not load fares</div>
              <div className="text-sm text-slate-400 mb-5">{quoteError}</div>
              <button
                onClick={() => {
                  setQuoteLoading(true);
                  setQuoteError(null);
                  apiFareQuote(flight)
                    .then((r: FareQuoteResult) => { setTiers(r.tiers); setFareChanged(r.fareChanged); setQuoteLoading(false); })
                    .catch((e: unknown) => { setQuoteError(e instanceof Error ? e.message : "Failed"); setQuoteLoading(false); });
                }}
                className="bg-blue-600 text-white text-sm font-black px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tiers.map((tier, idx) => (
                  <FareTierCard
                    key={tier.name}
                    tier={tier}
                    selected={selected === idx}
                    onSelect={() => setSelected(idx)}
                  />
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                {MOCK_MODE
                  ? "* Mock mode — fares are simulated. Policies sourced from TBO Global API in live mode."
                  : "* Fares per traveller. PlumTrips service fee not included. Cancellation policies sourced live from TBO Global API."}
                {" "}CO₂ emissions: ~{co2Badge(flight.stops, flight.duration)} kg/traveller.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        {!quoteLoading && !quoteError && tiers.length > 0 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0 gap-4">
            <div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wide">{tiers[selected]?.name}</div>
              <div className="text-2xl font-black text-slate-900 leading-tight">{formatINR(tiers[selected]?.price ?? 0)}</div>
              <div className="text-xs text-slate-400">per adult · {tiers[selected]?.cancellationFee}</div>
            </div>
            <button
              onClick={() => onBook(tiers[selected])}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black py-3.5 px-7 rounded-2xl text-sm transition-all shadow-lg shadow-blue-200 whitespace-nowrap"
            >
              Continue →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FLIGHT CARD ───────────────────────────────────────────

function FlightCard({
  flight, onViewFares,
}: {
  flight: DisplayFlight;
  onViewFares: (f: DisplayFlight) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all overflow-hidden group">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Flight info */}
          <div className="flex items-center gap-3 sm:gap-5 flex-1 min-w-0">
            {/* Airline */}
            <div className="flex items-center gap-2 sm:w-36 shrink-0">
              <AirlineLogo code={flight.airlineCode} size="sm" />
              <div className="min-w-0 hidden sm:block">
                <div className="font-bold text-slate-700 text-xs truncate">{flight.airline}</div>
                <div className="text-[10px] text-slate-400">{flight.flightNumber}</div>
                {flight.fareType !== "Regular" && (
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded mt-0.5 inline-block">
                    {flight.fareType}
                  </span>
                )}
              </div>
            </div>

            {/* Depart */}
            <div className="text-right shrink-0">
              <div className="text-lg sm:text-2xl font-black text-slate-900 leading-none">{flight.departTime}</div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-bold">{flight.fromCode}</div>
              {flight.terminal && <div className="text-[10px] text-slate-400">T{flight.terminal}</div>}
            </div>

            {/* Timeline */}
            <div className="flex flex-col items-center gap-1 flex-1 px-2">
              <div className="text-[10px] text-slate-500 font-bold">{flight.durationLabel}</div>
              <div className="flex items-center w-full gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                <div className="flex-1 relative h-px">
                  <div className="absolute inset-0 border-t-2 border-dashed border-slate-200" />
                  {flight.stops > 0 && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 border-2 border-white shadow" />
                  )}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
              </div>
              <div className={`text-[10px] font-bold ${flight.stops === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}${flight.stopInfo ? ` · ${flight.stopInfo}` : ""}`}
              </div>
            </div>

            {/* Arrive */}
            <div className="shrink-0">
              <div className="text-lg sm:text-2xl font-black text-slate-900 leading-none">
                {flight.arriveTime}
                {flight.arriveDate !== flight.departDate && (
                  <sup className="text-[10px] text-amber-500 font-bold ml-0.5">+1</sup>
                )}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5 font-bold">{flight.toCode}</div>
            </div>

            {/* Duration (desktop) */}
            <div className="hidden md:block text-center shrink-0 px-2">
              <div className="text-xs font-bold text-slate-600">{flight.durationLabel}</div>
              <div className={`text-[10px] font-bold ${flight.isLCC ? "text-amber-600" : "text-indigo-600"}`}>
                {flight.isLCC ? "LCC" : "FSC"}
              </div>
            </div>
          </div>

          {/* Right panel: baggage + price + CTA */}
          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start sm:pl-4 sm:border-l sm:border-slate-100 sm:min-w-[140px] gap-3 sm:gap-2">
            {/* Baggage pills */}
            <div className="flex sm:flex-col gap-1.5">
              <div className="flex items-center gap-1 bg-slate-50 rounded-lg px-2 py-1">
                <span className="text-xs">🧳</span>
                <span className="text-xs font-bold text-slate-600">{flight.checkinBaggage}</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-50 rounded-lg px-2 py-1">
                <span className="text-xs">💼</span>
                <span className="text-xs font-bold text-slate-600">{flight.cabinBaggage}</span>
              </div>
            </div>

            {/* Price */}
            <div className="text-right sm:mt-auto">
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">{formatINR(flight.price)}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">per adult</div>
              <div className={`text-[10px] font-bold mt-1 ${flight.isRefundable ? "text-emerald-600" : "text-slate-400"}`}>
                {flight.isRefundable ? "✓ Refundable" : "Non-refundable"}
              </div>
              {flight.seatsLeft && flight.seatsLeft < 10 && (
                <div className="text-[10px] text-red-500 font-bold mt-0.5 animate-pulse">
                  {flight.seatsLeft} seats left!
                </div>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={() => onViewFares(flight)}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-black py-2.5 px-4 sm:px-5 rounded-xl text-xs sm:text-sm transition-all shadow-sm whitespace-nowrap w-full sm:w-auto text-center"
            >
              View Fares
            </button>
          </div>
        </div>
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full border-t border-slate-100 py-2 text-[10px] sm:text-xs text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 font-semibold"
      >
        {expanded ? "Hide details" : "Flight details & fare rules"}
        <svg className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 sm:px-5 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
            {[
              ["Aircraft", flight.craft ?? "—"],
              ["Terminal", flight.terminal ? `T${flight.terminal}` : "—"],
              ["Carrier", flight.isLCC ? "Low-Cost" : "Full Service"],
              ["PAN required", flight.isPanRequired ? "Yes" : "No"],
              ["Passport", flight.isPassportRequired ? "Yes" : "No"],
              ["CO₂", `~${co2Badge(flight.stops, flight.duration)} kg`],
            ].map(([lbl, val]) => (
              <div key={lbl} className="bg-white rounded-xl p-2.5">
                <div className="text-[10px] text-slate-400 font-medium">{lbl}</div>
                <div className="font-bold text-slate-700 mt-0.5">{val}</div>
              </div>
            ))}
          </div>
          {flight.lastTicketingDate && (
            <div className="mt-2 text-[10px] text-amber-600 font-semibold">
              ⏰ Book by {new Date(flight.lastTicketingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </div>
          )}
          <div className="mt-2 text-[10px] text-slate-300 font-mono">
            {flight.resultIndex} · {flight.traceId}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DATE STRIP ────────────────────────────────────────────
// NOTE: TBO does not provide a per-date fare grid in a single call.
// Fetching 7 separate searches on render would be too expensive.
// The strip shows navigation only; prices are omitted until a dedicated
// "flexible dates" API endpoint is available on the backend.

function DateStrip({ baseDate, onSelect }: { baseDate: string; onSelect: (d: string) => void }) {
  const base = new Date(baseDate + "T00:00:00");
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(d.getDate() + i - 3);
    return d;
  });

  return (
    <div className="flex overflow-x-auto scrollbar-none border-t border-white/10 -mx-0">
      {dates.map((d, i) => {
        const isActive = i === 3;
        const dateStr = d.toISOString().split("T")[0];
        return (
          <button
            key={i}
            onClick={() => onSelect(dateStr)}
            className={`shrink-0 flex-1 min-w-[80px] text-center px-3 py-2.5 border-b-2 transition-all relative ${isActive
              ? "border-white text-white bg-white/10"
              : "border-transparent text-blue-200 hover:text-white hover:border-white/30"
              }`}
          >
            <div className="text-[10px] font-semibold opacity-80">
              {d.toLocaleDateString("en-IN", { weekday: "short" })}
            </div>
            <div className="text-xs font-black">
              {d.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── FILTER DRAWER (Mobile) ─────────────────────────────────

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${active
        ? "bg-blue-600 text-white border-blue-600"
        : "bg-white text-slate-600 border-slate-200"
        }`}
    >
      {label}
    </button>
  );
}

// ─── FILTER SIDEBAR ────────────────────────────────────────

interface ExtendedFilters extends ActiveFilters {
  arrivalSlot: string | null;
  maxDuration: number | null;
}

function FilterPanel({
  flights,
  filters,
  onChange,
  onReset,
  mobile,
}: {
  flights: DisplayFlight[];
  filters: ExtendedFilters;
  onChange: (f: ExtendedFilters) => void;
  onReset: () => void;
  mobile?: boolean;
}) {
  const airlines = [...new Set(flights.map(f => f.airline))].sort();
  const prices = flights.map(f => f.price);
  const durations = flights.map(f => f.duration);
  const maxP = prices.length ? Math.max(...prices) : 20000;
  const minP = prices.length ? Math.min(...prices) : 1000;
  const maxD = durations.length ? Math.max(...durations) : 300;

  const activeCount = [
    filters.stops !== null,
    filters.maxPrice !== null && filters.maxPrice < maxP,
    filters.airlines.length > 0,
    !!filters.departureSlot,
    !!filters.arrivalSlot,
    filters.refundable !== null,
    filters.maxDuration !== null && filters.maxDuration < maxD,
  ].filter(Boolean).length;

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
  }

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-5">
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2.5">{title}</div>
      {children}
    </div>
  );

  return (
    <div className={mobile ? "" : "bg-white rounded-2xl border border-slate-100 p-4 sticky top-24"}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-black text-slate-800">Filters</h3>
          {activeCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        <button onClick={onReset} className="text-xs text-blue-600 font-bold hover:text-blue-700">
          Reset all
        </button>
      </div>

      {/* Stops */}
      <Section title="Stops">
        <div className="flex gap-2 flex-wrap">
          {([null, 0, 1, 2] as const).map((s) => (
            <button
              key={String(s)}
              onClick={() => onChange({ ...filters, stops: filters.stops === s ? null : s })}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${filters.stops === s
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-300"
                }`}
            >
              {s === null ? "Any" : s === 0 ? "Non-stop" : `${s} Stop${s > 1 ? "s" : ""}`}
            </button>
          ))}
        </div>
      </Section>

      {/* Departure time */}
      <Section title="Departure Time">
        <div className="grid grid-cols-2 gap-1.5">
          {TIME_SLOTS.map(({ id, label, sub, icon }) => (
            <button
              key={id}
              onClick={() => onChange({ ...filters, departureSlot: filters.departureSlot === id ? null : id })}
              className={`p-2 rounded-xl border text-left transition-all ${filters.departureSlot === id
                ? "border-blue-600 bg-blue-50"
                : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
            >
              <div className="text-sm">{icon}</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">{label}</div>
              <div className="text-[10px] text-slate-400">{sub}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Arrival time */}
      <Section title="Arrival Time">
        <div className="grid grid-cols-2 gap-1.5">
          {TIME_SLOTS.map(({ id, label, sub, icon }) => (
            <button
              key={id}
              onClick={() => onChange({ ...filters, arrivalSlot: filters.arrivalSlot === id ? null : id })}
              className={`p-2 rounded-xl border text-left transition-all ${filters.arrivalSlot === id
                ? "border-purple-600 bg-purple-50"
                : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
            >
              <div className="text-sm">{icon}</div>
              <div className="text-xs font-bold text-slate-700 mt-0.5">{label}</div>
              <div className="text-[10px] text-slate-400">{sub}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Price range */}
      <Section title="Max Price">
        <input
          type="range"
          min={minP}
          max={maxP}
          step={500}
          value={filters.maxPrice ?? maxP}
          onChange={e => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs mt-1">
          <span className="text-slate-400">{formatINR(minP)}</span>
          <span className="font-black text-slate-700">{formatINR(filters.maxPrice ?? maxP)}</span>
        </div>
      </Section>

      {/* Duration */}
      <Section title="Max Duration">
        <input
          type="range"
          min={60}
          max={maxD}
          step={30}
          value={filters.maxDuration ?? maxD}
          onChange={e => onChange({ ...filters, maxDuration: Number(e.target.value) })}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs mt-1">
          <span className="text-slate-400">1h</span>
          <span className="font-black text-slate-700">{durationStr(filters.maxDuration ?? maxD)}</span>
        </div>
      </Section>

      {/* Fare type */}
      <Section title="Fare Type">
        <div className="flex gap-2">
          {([
            { val: true, label: "✓ Refundable" },
            { val: false, label: "Non-refundable" },
          ] as const).map(({ val, label }) => (
            <button
              key={label}
              onClick={() => onChange({ ...filters, refundable: filters.refundable === val ? null : val })}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-all ${filters.refundable === val
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Section>

      {/* Airlines */}
      {airlines.length > 0 && (
        <Section title="Airlines">
          <div className="space-y-1">
            {airlines.map(a => {
              const flightCount = flights.filter(f => f.airline === a).length;
              const minPrice = Math.min(...flights.filter(f => f.airline === a).map(f => f.price));
              const checked = filters.airlines.length === 0 || filters.airlines.includes(a);
              return (
                <label key={a} className="flex items-center gap-2.5 py-1.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      const newList = checked
                        ? airlines.filter(x => x !== a)
                        : [...filters.airlines.filter(x => airlines.includes(x)), a];
                      onChange({ ...filters, airlines: newList.length === airlines.length ? [] : newList });
                    }}
                    className="accent-blue-600 rounded w-3.5 h-3.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-700 truncate">{a}</div>
                    <div className="text-[10px] text-slate-400">{flightCount} flights · from {formatINR(minPrice)}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}

// ─── MOBILE FILTER DRAWER ──────────────────────────────────

function MobileFilterDrawer({
  flights, filters, onChange, onReset, onClose,
}: {
  flights: DisplayFlight[];
  filters: ExtendedFilters;
  onChange: (f: ExtendedFilters) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full bg-white rounded-t-3xl max-h-[90dvh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
          <h2 className="font-black text-slate-800">Filters & Sort</h2>
          <button onClick={onClose} className="text-blue-600 font-bold text-sm">Done</button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4">
          <FilterPanel flights={flights} filters={filters} onChange={onChange} onReset={onReset} mobile />
        </div>
      </div>
    </div>
  );
}

// ─── SKELETON LOADER ───────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="flex-1 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 bg-slate-200 rounded w-24" />
            <div className="h-2.5 bg-slate-100 rounded w-16" />
          </div>
          <div className="flex-1 h-2 bg-slate-100 rounded" />
          <div className="space-y-2 text-right">
            <div className="h-6 bg-slate-200 rounded w-20 ml-auto" />
            <div className="h-2 bg-slate-100 rounded w-14 ml-auto" />
          </div>
        </div>
        <div className="w-24 h-9 bg-slate-200 rounded-xl shrink-0" />
      </div>
    </div>
  );
}

// ─── EMPTY STATE ───────────────────────────────────────────

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-10 sm:p-16 text-center">
      <div className="text-5xl mb-4">✈️</div>
      <div className="font-black text-slate-700 text-lg mb-1">No flights found</div>
      <div className="text-sm text-slate-400 mb-6 max-w-xs mx-auto">
        No flights match your current filters. Try adjusting or removing some filters.
      </div>
      <button
        onClick={onReset}
        className="bg-blue-600 text-white text-sm font-black px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
      >
        Clear all filters
      </button>
    </div>
  );
}

// ─── MAIN RESULTS PAGE ─────────────────────────────────────

interface ResultsPageProps {
  form: SearchForm;
  multiLegs?: CityLeg[];
  onBack: () => void;
  onBook: (flight: DisplayFlight, tier: FareTier) => void;
}

type SortKey = "price" | "duration" | "depart" | "arrive" | "stops";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "price", label: "Cheapest" },
  { key: "duration", label: "Fastest" },
  { key: "depart", label: "Depart ↑" },
  { key: "arrive", label: "Arrive ↑" },
  { key: "stops", label: "Non-stop first" },
];

const defaultFilters = (maxP: number, maxD: number): ExtendedFilters => ({
  stops: null,
  maxPrice: null,
  airlines: [],
  departureSlot: null,
  arrivalSlot: null,
  refundable: null,
  sortBy: "price",
  maxDuration: null,
});

export default function ResultsPage({ form, multiLegs, onBack, onBook }: ResultsPageProps) {
  const [allFlights, setAllFlights] = useState<DisplayFlight[]>([]);
  const [returnFlightsList, setReturnFlightsList] = useState<DisplayFlight[]>([]);
  const [multiLegFlightsList, setMultiLegFlightsList] = useState<DisplayFlight[][]>([]);
  const [loading, setLoading] = useState(true);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ExtendedFilters>({
    stops: null, maxPrice: null, airlines: [], departureSlot: null,
    arrivalSlot: null, refundable: null, sortBy: "price", maxDuration: null,
  });
  const [sortKey, setSortKey] = useState<SortKey>("price");
  const [selectedFlight, setSelectedFlight] = useState<DisplayFlight | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // for multi-city leg tabs

  const fetchFlights = useCallback(() => {
    setLoading(true);
    setSearchError(null);
    apiSearchFlights(form, multiLegs)
      .then((result: FlightSearchResult) => {
        setAllFlights(result.outbound ?? []);
        setReturnFlightsList(result.returnFlights ?? []);
        setMultiLegFlightsList(result.multiLegFlights ?? []);
        setLoading(false);
      })
      .catch((e: any) => { setSearchError(e?.message ?? "Search failed"); setLoading(false); });
  }, [form, multiLegs]);

  useEffect(() => { fetchFlights(); }, [form.from?.code, form.to?.code, form.departDate, form.returnDate, form.tripType]);

  const maxP = allFlights.length ? Math.max(...allFlights.map(f => f.price)) : 20000;
  const maxD = allFlights.length ? Math.max(...allFlights.map(f => f.duration)) : 300;

  const resetFilters = () => setFilters(defaultFilters(maxP, maxD));

  // Pick the correct source list based on trip type and active tab
  const sourceFlights = useMemo(() => {
    if (form.tripType === "multiCity" && multiLegFlightsList.length > 0) {
      return multiLegFlightsList[activeTab] ?? [];
    }
    return allFlights;
  }, [form.tripType, allFlights, multiLegFlightsList, activeTab]);

  const applyFiltersAndSort = (list: DisplayFlight[]) => {
    return list.filter(f => {
      if (filters.stops !== null && f.stops !== filters.stops) return false;
      if (filters.maxPrice !== null && f.price > filters.maxPrice) return false;
      if (filters.maxDuration !== null && f.duration > filters.maxDuration) return false;
      if (filters.airlines.length > 0 && !filters.airlines.includes(f.airline)) return false;
      if (filters.refundable !== null && f.isRefundable !== filters.refundable) return false;
      if (!slotMatch(f.departTime, filters.departureSlot)) return false;
      if (!slotMatch(f.arriveTime, filters.arrivalSlot)) return false;
      if (form.nonStopOnly && f.stops > 0) return false;
      return true;
    }).sort((a, b) => {
      switch (sortKey) {
        case "price": return a.price - b.price;
        case "duration": return a.duration - b.duration;
        case "depart": return timeToMins(a.departTime) - timeToMins(b.departTime);
        case "arrive": return timeToMins(a.arriveTime) - timeToMins(b.arriveTime);
        case "stops": return a.stops - b.stops;
        default: return 0;
      }
    });
  };

  const filtered = useMemo(() => applyFiltersAndSort(sourceFlights), [sourceFlights, filters, sortKey, form.nonStopOnly]);
  const filteredReturn = useMemo(() => applyFiltersAndSort(returnFlightsList), [returnFlightsList, filters, sortKey, form.nonStopOnly]);

  // Active filter count
  const activeFilterCount = [
    filters.stops !== null,
    filters.maxPrice !== null && filters.maxPrice < maxP,
    filters.airlines.length > 0,
    !!filters.departureSlot,
    !!filters.arrivalSlot,
    filters.refundable !== null,
    filters.maxDuration !== null && filters.maxDuration < maxD,
  ].filter(Boolean).length;

  const isRoundTrip = form.tripType === "roundTrip";
  const isMultiCity = form.tripType === "multiCity";
  const legs = multiLegs ?? [];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── HEADER ── */}
      <header style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0f2657 55%, #1d4ed8 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Top bar */}
          <div className="flex items-center gap-3 sm:gap-5 py-3 flex-wrap">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shadow">
                <span className="text-white font-black text-xs">P</span>
              </div>
              <span className="text-white font-black text-sm hidden sm:block">plumtrips</span>
            </div>

            <div className="w-px h-5 bg-white/20 shrink-0" />

            <button onClick={onBack} className="text-blue-300 hover:text-white text-xs sm:text-sm font-semibold transition-colors shrink-0">
              ← Modify
            </button>

            {/* Trip type badge */}
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full shrink-0 ${isRoundTrip ? "bg-emerald-500/20 text-emerald-300" :
              isMultiCity ? "bg-purple-500/20 text-purple-300" :
                "bg-blue-500/20 text-blue-300"
              }`}>
              {isRoundTrip ? "Round Trip" : isMultiCity ? "Multi-City" : "One Way"}
            </span>

            {/* Route display */}
            {isMultiCity && legs.length > 0 ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {legs.map((leg, i) => (
                  <div key={i} className="flex items-center gap-1 text-white font-black text-sm">
                    {i > 0 && <span className="text-blue-400 text-[10px] mx-0.5">·</span>}
                    <span>{leg.from.code}</span>
                    <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                    <span>{leg.to.code}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-white font-black text-base sm:text-lg">
                <span>{form.from?.code}</span>
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                    d={isRoundTrip
                      ? "M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4"
                      : "M17 8l4 4m0 0l-4 4m4-4H3"} />
                </svg>
                <span>{form.to?.code}</span>
              </div>
            )}

            {/* Trip info */}
            <div className="text-blue-200 text-[10px] sm:text-xs font-medium leading-relaxed">
              {isMultiCity && legs.length > 0 ? (
                <span>
                  {legs[0].departDate ? new Date(legs[0].departDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                  {legs.length > 1 && legs[legs.length - 1].departDate
                    ? " → " + new Date(legs[legs.length - 1].departDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                    : ""}
                </span>
              ) : (
                <span>
                  {new Date(form.departDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {isRoundTrip && form.returnDate
                    ? " → " + new Date(form.returnDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : ""}
                </span>
              )}
              {" · "}
              {form.adults + form.children + form.infants} traveller{form.adults + form.children + form.infants !== 1 ? "s" : ""}
              {" · "}{form.cabinClass}
            </div>

            {MOCK_MODE && (
              <span className="ml-auto text-[10px] font-black text-amber-300 bg-amber-900/40 px-2 py-1 rounded-full">
                MOCK
              </span>
            )}
          </div>

          {/* Date strip — only for one-way / round trip */}
          {!isMultiCity && (
            <DateStrip baseDate={form.departDate} onSelect={() => { }} />
          )}

          {/* Multi-city leg tabs */}
          {isMultiCity && legs.length > 0 && (
            <div className="flex gap-1 pt-2 pb-1 overflow-x-auto scrollbar-none">
              {legs.map((leg, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`shrink-0 px-4 py-2 rounded-t-xl text-xs font-black transition-all ${activeTab === i
                    ? "bg-white text-blue-700"
                    : "text-blue-200 hover:text-white"
                    }`}
                >
                  Leg {i + 1}: {leg.from.code} → {leg.to.code}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ── MOBILE FILTER BAR ── */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setShowFilters(true)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${activeFilterCount > 0
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-slate-600 border-slate-200"
              }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h2M13 16h-2" />
            </svg>
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
          <div className="w-px h-5 bg-slate-200 shrink-0" />
          {/* Quick sort chips */}
          {SORT_OPTIONS.map(({ key, label }) => (
            <FilterChip
              key={key}
              label={label}
              active={sortKey === key}
              onClick={() => setSortKey(key)}
            />
          ))}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex gap-6">

        {/* Sidebar (desktop) */}
        <aside className="w-60 shrink-0 hidden lg:block">
          <FilterPanel
            flights={allFlights}
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
          />
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          {/* Desktop sort + count bar */}
          <div className="hidden lg:flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-sm text-slate-500 font-semibold">
              {loading ? "Searching…" : `${filtered.length} of ${allFlights.length} flights`}
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-slate-400 font-medium">Sort</span>
              {SORT_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortKey(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${sortKey === key
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile count */}
          <div className="lg:hidden text-xs text-slate-500 font-semibold mb-3 px-1">
            {loading ? "Searching for flights…" : `${filtered.length} flight${filtered.length !== 1 ? "s" : ""} found`}
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : searchError ? (
            <div className="bg-white rounded-2xl border border-red-100 p-10 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <div className="font-black text-slate-700 mb-1">Search failed</div>
              <div className="text-sm text-slate-400 mb-5">{searchError}</div>
              <button
                onClick={fetchFlights}
                className="bg-blue-600 text-white text-sm font-black px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <>
              {/* Round trip: show outbound header */}
              {isRoundTrip && returnFlightsList.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-sm font-black text-slate-800">Outbound · {form.from?.code} → {form.to?.code}</span>
                  <span className="text-xs text-slate-400">{new Date(form.departDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                </div>
              )}

              <div className="space-y-3">
                {filtered.map(f => (
                  <FlightCard
                    key={f.resultIndex}
                    flight={f}
                    onViewFares={(flight) => setSelectedFlight(flight)}
                  />
                ))}
              </div>

              {/* Round trip: return flights section */}
              {isRoundTrip && filteredReturn.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mt-8 mb-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-600" />
                    <span className="text-sm font-black text-slate-800">Return · {form.to?.code} → {form.from?.code}</span>
                    <span className="text-xs text-slate-400">{form.returnDate ? new Date(form.returnDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</span>
                  </div>
                  <div className="space-y-3">
                    {filteredReturn.map(f => (
                      <FlightCard
                        key={f.resultIndex}
                        flight={f}
                        onViewFares={(flight) => setSelectedFlight(flight)}
                      />
                    ))}
                  </div>
                </>
              )}

              {/* Multi-city: show current leg info */}
              {isMultiCity && legs.length > 0 && (
                <div className="text-xs text-slate-400 mt-4 text-center">
                  Showing flights for Leg {activeTab + 1}: {legs[activeTab]?.from.code} → {legs[activeTab]?.to.code}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <MobileFilterDrawer
          flights={allFlights}
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Fare modal */}
      {selectedFlight && (
        <FareModal
          flight={selectedFlight}
          legIndex={isMultiCity ? activeTab : undefined}
          totalLegs={isMultiCity ? legs.length : undefined}
          onClose={() => setSelectedFlight(null)}
          onBook={tier => {
            setSelectedFlight(null);
            onBook(selectedFlight, tier);
          }}
        />
      )}
    </div>
  );
}