// ============================================================
//  BookingStep7Confirmation.tsx — Step 7: Booking Confirmed
// ============================================================

import type { DisplayFlight, FareTier } from "../../lib/types_t";
import { formatINR } from "../../lib/flights_api";
import { AIRLINE_COLORS } from "./BookingShared";

interface Step7Props {
  flight: DisplayFlight;
  tier: FareTier;
  returnFlight?: DisplayFlight;
  returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  bookingId?: number;
  pnr?: string;
  passengerNames?: string[];
  contactEmail?: string;
  totalPaid: number;
  isInternational: boolean;
  onDone: () => void;
}

export default function BookingStep7Confirmation({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  bookingId, pnr, passengerNames, contactEmail,
  totalPaid, isInternational, onDone,
}: Step7Props) {
  const isRoundTrip = !!returnFlight && !!returnTier;
  const isMultiCity = !!(multiCityLegs && multiCityLegs.length > 1);

  const allLegs = [
    { flight, label: isRoundTrip ? "Outbound" : isMultiCity ? "Leg 1" : "Flight" },
    ...(isRoundTrip && returnFlight ? [{ flight: returnFlight, label: "Return" }] : []),
    ...(isMultiCity ? (multiCityLegs ?? []).slice(1).map((l, i) => ({ flight: l.flight, label: `Leg ${i + 2}` })) : []),
  ];

  const pnrList = pnr ? pnr.split(", ") : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Success banner */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-black text-3xl text-slate-900 tracking-tight mb-2">Booking Confirmed!</h1>
        <p className="text-slate-500 text-sm">
          Your e-ticket has been sent to{" "}
          <span className="font-bold text-slate-700">{contactEmail}</span>
        </p>
      </div>

      {/* PNR / Booking ref */}
      {(pnr || bookingId) && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-3xl p-6 mb-6 text-white">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Booking Reference</div>
          <div className="flex flex-wrap gap-4 mb-4">
            {bookingId && (
              <div>
                <div className="text-[10px] text-slate-500 mb-0.5">Booking ID</div>
                <div className="font-black text-xl font-mono">#{bookingId}</div>
              </div>
            )}
            {pnrList.map((p, i) => (
              <div key={i}>
                <div className="text-[10px] text-slate-500 mb-0.5">{pnrList.length > 1 ? `PNR (Leg ${i + 1})` : "PNR"}</div>
                <div className="font-black text-xl font-mono tracking-widest text-emerald-400">{p}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">Use this reference for check-in, changes, or cancellations.</p>
        </div>
      )}

      {/* Flight details */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-4">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flight Itinerary</div>
        </div>
        <div className="divide-y divide-slate-100">
          {allLegs.map(({ flight: f, label }, i) => (
            <div key={i} className="flex items-center gap-4 p-5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-black shrink-0"
                style={{ background: AIRLINE_COLORS[f.airlineCode] ?? "#64748b" }}
              >
                {f.airlineCode}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-slate-900 text-sm">{f.airline} · {f.flightNumber}</span>
                  <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">{label}</span>
                </div>
                <div className="text-xs text-slate-500">{f.fromCode} → {f.toCode} · {f.departDate}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-black text-slate-900 text-sm">{f.departTime}</div>
                <div className="text-[10px] text-slate-400">→ {f.arriveTime}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Passengers */}
      {passengerNames && passengerNames.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 mb-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Passengers</div>
          <div className="space-y-2">
            {passengerNames.map((name, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</div>
                <span className="text-sm font-semibold text-slate-800">{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment confirmation */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-0.5">Amount Paid</div>
            <div className="text-[10px] text-emerald-600">Inclusive of all taxes and fees</div>
          </div>
          <div className="font-black text-3xl text-emerald-700">{formatINR(totalPaid)}</div>
        </div>
      </div>

      {/* What's next */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 mb-6">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">What's Next</div>
        <div className="space-y-3">
          {[
            { icon: "📧", title: "Check your email", desc: "Your e-ticket and booking confirmation has been sent." },
            { icon: "📱", title: "Download airline app", desc: "Check in online 48 hours before departure." },
            { icon: isInternational ? "🛂" : "🪪", title: isInternational ? "Prepare your passport" : "Carry valid photo ID", desc: isInternational ? "All passengers need valid passports at the airport." : "Government-issued ID required for all passengers." },
            { icon: "⏰", title: `Arrive ${isInternational ? "3 hours" : "2 hours"} early`, desc: `Check-in closes ${isInternational ? "60" : "45"} minutes before departure.` },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-2xl bg-slate-100 flex items-center justify-center text-lg shrink-0">{icon}</div>
              <div>
                <div className="font-bold text-slate-800 text-sm">{title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onDone}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-200"
        >
          Back to Home
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-4 rounded-2xl text-sm hover:border-slate-300 hover:bg-white transition-all"
        >
          🖨️ Print Itinerary
        </button>
      </div>
    </div>
  );
}