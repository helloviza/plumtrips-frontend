// ============================================================
//  ConfirmationPage.tsx — Post-booking confirmation
// ============================================================

import type { DisplayFlight, FareTier } from "../../lib/types_t";
import { formatINR, MOCK_MODE } from "../../lib/flights_api";

interface ConfirmationPageProps {
  flight: DisplayFlight;
  tier: FareTier;
  bookingId?: number;
  pnr?: string;
  passengerNames?: string[];
  contactEmail?: string;
  onSearchAgain: () => void;
}

export default function ConfirmationPage({
  flight, tier, bookingId, pnr, passengerNames, contactEmail, onSearchAgain,
}: ConfirmationPageProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xs">P</span>
          </div>
          <span className="text-slate-800 font-black">plumtrips</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Success card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden mb-4">
            {/* Green header */}
            <div className="bg-emerald-600 px-8 py-8 text-center">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-white font-black text-2xl mb-1">Booking Confirmed!</div>
              <div className="text-emerald-100 text-sm font-medium">
                {contactEmail
                  ? `Your e-ticket will be sent to ${contactEmail}`
                  : "Your e-ticket will be sent to your email shortly"}
              </div>
              {MOCK_MODE && (
                <div className="mt-3 text-xs font-bold text-amber-200 bg-amber-900/30 px-3 py-1.5 rounded-full inline-block">
                  ⚠ Mock mode — no real booking was made
                </div>
              )}
            </div>

            {/* Details */}
            <div className="p-8">
              {/* Booking ref row */}
              <div className="grid grid-cols-2 gap-6 mb-6 pb-6 border-b border-slate-100">
                {bookingId && (
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Booking ID</div>
                    <div className="font-black text-slate-800 text-lg">{bookingId}</div>
                  </div>
                )}
                {pnr && (
                  <div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">PNR</div>
                    <div className="font-black text-slate-800 text-lg tracking-widest">{pnr}</div>
                  </div>
                )}

                {/* Flight details */}
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Flight</div>
                  <div className="font-bold text-slate-800">{flight.airline} · {flight.flightNumber}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Date</div>
                  <div className="font-bold text-slate-800">{flight.departDate}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Departure</div>
                  <div className="font-black text-slate-800 text-lg">{flight.departTime}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Arrival</div>
                  <div className="font-black text-slate-800 text-lg">{flight.arriveTime}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Fare Type</div>
                  <div className="font-bold text-slate-800">{tier.name}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-1">Amount Paid</div>
                  <div className="font-black text-blue-600 text-lg">{formatINR(tier.price)}</div>
                </div>
              </div>

              {/* Passengers */}
              {passengerNames && passengerNames.length > 0 && (
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-3">Passengers</div>
                  <div className="space-y-2">
                    {passengerNames.map((name, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center shrink-0">
                          {i + 1}
                        </div>
                        <div className="font-semibold text-slate-800 text-sm">{name || `Passenger ${i + 1}`}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Baggage reminder */}
              <div className="flex gap-3 mb-6 p-4 bg-blue-50 rounded-2xl">
                <span className="text-xl shrink-0">🧳</span>
                <div className="text-sm text-blue-800">
                  <span className="font-bold">Cabin:</span> {tier.cabinBag} &nbsp;·&nbsp;
                  <span className="font-bold">Check-in:</span> {tier.checkinBag}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-sm hover:border-slate-300 transition-colors">
                  Download E-Ticket
                </button>
                <button
                  onClick={onSearchAgain}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-2xl text-sm transition-colors"
                >
                  Search Again
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Need help? Contact PlumTrips support · Booking powered by TBO Global API
          </p>
        </div>
      </div>
    </div>
  );
}