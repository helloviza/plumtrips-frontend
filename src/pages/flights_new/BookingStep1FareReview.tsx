// ============================================================
//  BookingStep1FareReview.tsx — Step 1: Fare Review & Lock
//  UI refreshed to match the FareReview page visual language.
//  Props, state, and all frontend/backend logic are UNCHANGED.
// ============================================================

import type { DisplayFlight, FareTier } from "../../lib/types_t";
import { formatINR } from "../../lib/flights_api";
import { AIRLINE_COLORS, SectionHeading, ErrorBanner } from "./BookingShared";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Plane, ChevronDown, ChevronUp } from "lucide-react";
import { useCurrency } from "../../context/currencyContext";

interface Step1Props {
  flight: DisplayFlight;
  tier: FareTier;
  returnFlight?: DisplayFlight;
  returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  isInternational: boolean;
  loading: boolean;
  error: string | null;
  fareChanged: boolean;
  updatedFare: number | null;
  fareChangeMessage?: string | null;
  /** True when fareQuote was already run on the Results page — skip the spinner */
  fareAlreadyConfirmed?: boolean;
  onLockFare: () => void;
  onAcceptNewFare: () => void;
  onAbort: () => void;
}

function AirlineLogo({
  code,
  size = "md",
}: {
  code: string;
  size?: "sm" | "md" | "lg";
}) {
  const [imgFailed, setImgFailed] = useState(false);

  const color = AIRLINE_COLORS[code] ?? { bg: "#475569", text: "#fff" };

  const dims: Record<string, React.CSSProperties> = {
    sm: { width: 32, height: 32, fontSize: 9, borderRadius: 10 },
    md: { width: 40, height: 40, fontSize: 10, borderRadius: 12 },
    lg: { width: 44, height: 44, fontSize: 11, borderRadius: 14 },
  };

  return (
    <div
      style={{
        ...dims[size],
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontFamily: "'Sora', sans-serif",
        flexShrink: 0,
        overflow: "hidden",

        boxShadow: "0 2px 8px rgba(15,23,42,0.12)",
      }}
    >
      {imgFailed ? (
        code
      ) : (
        <img
          src={`/airlines/${code}.gif`}
          alt={code}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
          onError={() => setImgFailed(true)}
        />
      )}
    </div>
  );
}

export default function BookingStep1FareReview({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  isInternational, loading, error,
  fareChanged, updatedFare, fareChangeMessage,
  fareAlreadyConfirmed = false,
  onLockFare, onAcceptNewFare, onAbort,
}: Step1Props) {
  const isRoundTrip = !!returnFlight && !!returnTier;
  const isMultiCity = !!(multiCityLegs && multiCityLegs.length > 1);
  const { convert } = useCurrency();
  const [cancellationOpen, setCancellationOpen] = useState(false);

  // ── Real, prop-driven price-lock validation ──────────────────
  // There is no server-side "quoted at" timestamp anywhere in the TBO
  // fare-quote response, so the client-observed moment is the most
  // accurate thing available — but it's only ever set from genuinely
  // real signals (fareAlreadyConfirmed / fareChanged / error / loading
  // all come straight from the actual apiFareQuote() call).
  const isPriceValidated = !loading && !error && !fareChanged && fareAlreadyConfirmed;
  const [fareLockedAt, setFareLockedAt] = useState<Date | null>(null);
  useEffect(() => {
    if (isPriceValidated && !fareLockedAt) {
      setFareLockedAt(new Date());
    } else if (!isPriceValidated && fareLockedAt) {
      // Airline changed the fare / an error occurred — the old lock no longer holds.
      setFareLockedAt(null);
    }
  }, [isPriceValidated, fareLockedAt]);

  const formatDateTime = (d: Date) =>
    d.toLocaleString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  // ── Real, per-fare cancellation policy (NOT a hardcoded 24h rule) ──
  // tier.cancellationFee is built server-side in flights_api.ts from TBO's
  // actual MiniFareRules / CancellationPolicies for THIS fare — e.g.
  // "Free (Anytime)", "₹4,999 (3h – 3 days before)", or "Non-refundable".
  // There is no 24-hours-from-booking rule in the TBO integration at all,
  // so nothing here should claim one.
  const cancellationPolicyLabel = tier.cancellationFee?.trim() || "As per airline";
  const isFreeCancellation = /^free\b/i.test(cancellationPolicyLabel);

  return (
    <div>
      <SectionHeading
        step="1"
        title="Review Your Fare"
        desc="We verify the latest price with the airline before you enter any details. This takes just a moment."
      />

      {/* International badge */}
      {isInternational && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 mb-4"
        >
          <span className="text-2xl shrink-0">🛂</span>
          <div>
            <div className="font-black text-amber-900 text-sm">International Flight</div>
            <p className="text-xs text-amber-700 mt-0.5">Passport details will be required for all passengers in the next step.</p>
          </div>
        </motion.div>
      )}

      {/* Price-locked confirmation banner — only shown once genuinely validated */}
      {isPriceValidated && fareLockedAt && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 mb-4 flex items-center gap-4"
        >
          <div className="w-11 h-11 rounded-2xl bg-green-500 flex items-center justify-center shrink-0 shadow-md">
            <Check size={20} className="text-white" strokeWidth={3} />
          </div>
          <div>
            <div className="text-base font-black text-slate-900 mb-0.5">Price Verified</div>
            <div className="text-[13px] text-slate-600 leading-relaxed">
              Confirmed with the airline as of <strong className="text-slate-800">{formatDateTime(fareLockedAt)}</strong> — no fare change reported since.
            </div>
          </div>
        </motion.div>
      )}

      {/* Primary flight card */}
      <FlightDetailCard
        flight={flight}
        tier={tier}
        label={isRoundTrip ? "Outbound" : isMultiCity ? "Leg 1" : undefined}
        accentColor={isRoundTrip ? "blue" : isMultiCity ? "violet" : undefined}
        delay={0.05}
      />

      {/* Return flight */}
      {isRoundTrip && returnFlight && returnTier && (
        <>
          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 border-t border-dashed border-slate-300" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 bg-[#f8f7f4]">Return Flight</span>
            <div className="flex-1 border-t border-dashed border-slate-300" />
          </div>
          <FlightDetailCard flight={returnFlight} tier={returnTier} label="Return" accentColor="emerald" delay={0.1} />
        </>
      )}

      {/* Multi-city legs */}
      {isMultiCity && multiCityLegs && multiCityLegs.length > 1 && (
        <>
          <div className="flex items-center gap-2 my-4">
            <div className="flex-1 border-t border-dashed border-slate-300" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 bg-[#f8f7f4]">Additional Legs</span>
            <div className="flex-1 border-t border-dashed border-slate-300" />
          </div>
          {multiCityLegs.slice(1).map((leg, i) => (
            <FlightDetailCard key={i} flight={leg.flight} tier={leg.tier} label={`Leg ${i + 2}`} accentColor="violet" delay={0.1 + i * 0.05} />
          ))}
        </>
      )}

      {/* Fare changed warning */}
      {fareChanged && updatedFare && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 mb-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">⚠️</span>
            <div className="flex-1">
              <div className="font-black text-amber-900 text-sm mb-1">Fare Updated by Airline</div>
              <p className="text-xs text-amber-700 mb-4">
                {fareChangeMessage ?? (
                  <>
                    Price changed from <strong>{convert(tier.price)}</strong> to{" "}
                    <strong className="text-amber-900">{convert(updatedFare)}</strong> per adult since you last checked.
                  </>
                )}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onAcceptNewFare}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
                >
                  Accept new fare & continue
                </button>
                <button onClick={onAbort} className="text-amber-700 text-xs font-semibold underline">
                  Search again
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Urgency */}
      {flight.seatsLeft && flight.seatsLeft <= 9 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-5 py-3 mb-4"
        >
          <span>🔥</span>
          <span className="text-sm text-rose-600 font-bold">
            Only {flight.seatsLeft} seat{flight.seatsLeft > 1 ? "s" : ""} left at this price!
          </span>
        </motion.div>
      )}

      {error && <ErrorBanner message={error} />}

      {/* Cancellation policy accordion — real, per-fare data from TBO */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.13 }}
        className="rounded-xl border overflow-hidden mb-4"
        style={
          isFreeCancellation
            ? { background: "#eff6ff", borderColor: "#bfdbfe" }
            : { background: "#f8fafc", borderColor: "#e2e8f0" }
        }
      >
        <button
          className="w-full flex items-center justify-between px-5 py-3.5 text-left"
          onClick={() => setCancellationOpen((o) => !o)}
        >
          <div className="flex items-center gap-2.5 text-[13px]">
            <span className={isFreeCancellation ? "text-blue-500" : "text-slate-400"}>ℹ️</span>
            <span className={`font-semibold ${isFreeCancellation ? "text-blue-700" : "text-slate-600"}`}>
              Cancellation: <strong>{cancellationPolicyLabel}</strong>
            </span>
          </div>
          {cancellationOpen ? (
            <ChevronUp size={16} className={isFreeCancellation ? "text-blue-500" : "text-slate-400"} />
          ) : (
            <ChevronDown size={16} className={isFreeCancellation ? "text-blue-500" : "text-slate-400"} />
          )}
        </button>
        {cancellationOpen && (
          <div className={`px-5 pb-4 text-[12px] ${isFreeCancellation ? "text-blue-700" : "text-slate-500"}`}>
            {tier.cancellationFee?.trim()
              ? <>Cancellation charge for the <strong>{tier.name}</strong> fare: <strong>{cancellationPolicyLabel}</strong>, as set by the airline for this ticket. Date change fee: <strong>{tier.dateChangeFee?.trim() || "As per airline"}</strong>.</>
              : "This airline hasn't returned a specific cancellation policy for this fare — standard airline terms apply at cancellation."}
          </div>
        )}
      </motion.div>

      {/* CTA */}
      {!fareChanged && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {fareAlreadyConfirmed ? (
            /* Fare was already verified when user picked this flight — show
               a confirmed badge + instant continue button (no spinner). */
            <button
              onClick={onLockFare}
              className="w-full flex items-center justify-between px-8 py-4 rounded-2xl text-white font-black text-base shadow-lg shadow-blue-200 hover:opacity-95 active:scale-[0.99] transition-all"
              style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
            >
              <span />
              <span className="flex items-center gap-2">
                Continue to Passenger Details
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </span>
              <span className="w-[72px]" />
            </button>
          ) : (
            <button
              onClick={onLockFare}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black text-base py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-3"
            >
              {loading ? (
                <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Confirming fare with airline…</>
              ) : (
                <>Lock Fare & Enter Details →</>
              )}
            </button>
          )}
          <p className="text-xs text-slate-400 text-center mt-3 flex items-center justify-center gap-1.5">
            🔒 Price confirmed with the airline in real time. No surprise charges at checkout.
          </p>
        </motion.div>
      )}

      {/* Trust footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-center gap-8 py-3 flex-wrap mt-2"
      >
        {[
          { icon: "✈️", label: "IATA Accredited" },
          { icon: "🔐", label: "PCI DSS Certified" },
          { icon: "🔒", label: "SSL Encrypted" },
          { icon: "🎧", label: "24x7 Support" },
          { icon: "⭐", label: "4.8/5 Rating", sub: "From 10L+ travellers" },
        ].map((b) => (
          <div key={b.label} className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span className="text-base">{b.icon}</span>
            <div>
              <div>{b.label}</div>
              {b.sub && <div className="text-slate-400">{b.sub}</div>}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── FLIGHT DETAIL CARD ───────────────────────────────────────

function FlightDetailCard({
  flight, tier, label, accentColor, delay = 0,
}: {
  flight: DisplayFlight;
  tier: FareTier;
  label?: string;
  accentColor?: "blue" | "emerald" | "violet";
  delay?: number;
}) {
  const accentMap: Record<string, string> = {
    blue: "text-blue-600 bg-blue-50",
    emerald: "text-emerald-600 bg-emerald-50",
    violet: "text-violet-600 bg-violet-50",
  };
  const accent = accentColor ? accentMap[accentColor] : "";
  const { convert } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4"
    >
      {/* Airline bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <AirlineLogo code={flight.airlineCode} size="lg" />
          <div>
            <div className="font-bold text-slate-900 text-sm">{flight.airline}</div>
            <div className="text-[11px] text-slate-400">{flight.flightNumber}{flight.craft ? ` · ${flight.craft}` : ""}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {label && <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${accent}`}>{label}</span>}
          <span
            className="text-[11px] font-bold px-2.5 py-1 rounded border"
            style={
              flight.isLCC
                ? { color: "#f97316", borderColor: "#fed7aa", background: "#fff7ed" }
                : { color: "#4338ca", borderColor: "#c7d2fe", background: "#eef2ff" }
            }
          >
            {flight.isLCC ? "LCC" : "Full Service"}
          </span>
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded border ${flight.isRefundable ? "text-emerald-700 border-emerald-200 bg-emerald-50" : "text-rose-600 border-rose-200 bg-rose-50"}`}>
            {flight.isRefundable ? "Refundable" : "Non-refundable"}
          </span>
        </div>
      </div>

      {/* Flight timeline */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-0">
          {/* Departure */}
          <div>
            <div className="text-3xl font-black text-slate-900">{flight.departTime}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{flight.departDate}</div>
            <div className="text-xl font-black text-slate-900 mt-1">{flight.fromCode}</div>
            {flight.fromCity && <div className="text-[11px] text-slate-500">{flight.fromCity}</div>}
            {flight.terminal && <div className="text-[11px] font-semibold text-blue-600 mt-0.5">Terminal {flight.terminal}</div>}
          </div>

          {/* Duration line */}
          <div className="flex-1 flex flex-col items-center gap-1 px-6">
            <span className="text-[11px] text-slate-400 font-medium">{flight.durationLabel}</span>
            <div className="flex items-center w-full gap-1">
              <div className="w-2 h-2 rounded-full border-2 border-slate-300 bg-white" />
              <div className="flex-1 border-t-2 border-dashed border-slate-200 relative">
                {flight.stops > 0 && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </div>
              <Plane size={16} className="text-slate-400 shrink-0" style={{ transform: "rotate(90deg)" }} />
              <div className="flex-1 border-t-2 border-dashed border-slate-200 relative">
                {flight.stops > 0 && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400" />
                )}
              </div>
              <div className="w-2 h-2 rounded-full border-2 border-slate-300 bg-white" />
            </div>
            <span className={`text-[11px] font-black uppercase tracking-widest ${flight.stops === 0 ? "text-emerald-600" : "text-amber-600"}`}>
              {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}${flight.stopInfo ? ` · ${flight.stopInfo}` : ""}`}
            </span>
          </div>

          {/* Arrival */}
          <div className="text-right">
            <div className="text-3xl font-black text-slate-900">{flight.arriveTime}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{flight.arriveDate}</div>
            <div className="text-xl font-black text-slate-900 mt-1">{flight.toCode}</div>
            {flight.toCity && <div className="text-[11px] text-slate-500">{flight.toCity}</div>}
            {flight.arrivalTerminal && <div className="text-[11px] font-semibold text-blue-600 mt-0.5">Terminal {flight.arrivalTerminal}</div>}
          </div>
        </div>
      </div>

      {/* Amenity tiles */}
      <div className="grid grid-cols-4 gap-3 px-5 pb-5">
        {[
          { icon: "🎒", label: "Cabin Baggage", value: tier.cabinBag },
          { icon: "🧳", label: "Check-in Baggage", value: tier.checkinBag },
          { icon: "💺", label: "Seat Selection", value: tier.seatSelection },
          { icon: "🍽️", label: "Meals", value: tier.meals },
        ].map(({ icon, label: tileLabel, value }) => (
          <div key={tileLabel} className="flex flex-col items-center gap-1.5 py-4 border border-slate-100 rounded-xl bg-slate-50/60">
            <span className="text-2xl">{icon}</span>
            <span className="text-[11px] text-slate-500 font-medium text-center">{tileLabel}</span>
            <span className="text-[12px] font-bold text-slate-800 text-center">{value}</span>
          </div>
        ))}
      </div>

      {/* Fare name & price */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          Fare: <strong className="text-slate-700">{tier.name}</strong>
        </div>
        <div className="font-black text-blue-600 text-base">{convert(tier.price)} <span className="text-slate-400 font-medium text-[11px]">/ adult</span></div>
      </div>
    </motion.div>
  );
}