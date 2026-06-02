// ============================================================
//  BookingStep6Payment.tsx — Step 6: Payment
// ============================================================

import type { BookingFormState } from "./BookingShared";
import { SectionHeading, ErrorBanner, calcFares } from "./BookingShared";
import { formatINR, MOCK_MODE } from "../../lib/flights_api";
import type { DisplayFlight, FareTier } from "../../lib/types_t";

interface Step6Props {
  flight: DisplayFlight; tier: FareTier;
  returnFlight?: DisplayFlight; returnTier?: FareTier;
  multiCityLegs?: { flight: DisplayFlight; tier: FareTier }[];
  form: BookingFormState;
  adults: number; children: number; infants: number;
  loading: boolean;
  error: string | null;
  onChange: (form: BookingFormState) => void;
  onPay: () => void;
  onBack: () => void;
}


export default function BookingStep6Payment({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  form, adults, children, infants,
  loading, error, onPay, onBack,
}: Step6Props) {
  const { subtotal, extrasTotal, taxes } = calcFares({
    tier, returnTier, multiCityLegs, adults, children, infants, extras: form.extras,
  });

  const totalPayable = Math.round(subtotal + extrasTotal + taxes - form.promoDiscount);

  return (
    <div>
      <SectionHeading
        step="6"
        title="Secure Payment"
        desc={MOCK_MODE
          ? "Running in mock mode — no real payment will be processed."
          : "Powered by Razorpay. PCI-DSS Level 1 certified."}
      />

      {error && <ErrorBanner message={error} />}

      {/* ── BIG PAYMENT BUTTON ──────────────────────────── */}
      <button
        onClick={onPay}
        disabled={loading}
        className="w-full group relative overflow-hidden rounded-3xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 transition-all duration-300 shadow-2xl shadow-blue-300 disabled:shadow-none mb-4"
        style={{ minHeight: "220px" }}
      >
        {/* Subtle animated radial glow on hover */}
        <span
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: "radial-gradient(ellipse at 60% 40%, rgba(255,255,255,0.12) 0%, transparent 70%)",
          }}
        />

        <span className="relative flex flex-col items-center justify-center gap-4 px-8 py-10">
          {loading ? (
            <>
              <span className="w-10 h-10 border-[3px] border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-white/80 font-semibold text-sm tracking-wide">
                {MOCK_MODE ? "Confirming booking…" : "Opening Razorpay…"}
              </span>
            </>
          ) : (
            <>
              {/* Lock icon */}
              <span className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 9V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2zm7 4v3" />
                </svg>
              </span>

              {/* Amount */}
              <span className="text-white font-black text-5xl tracking-tight leading-none">
                {formatINR(totalPayable)}
              </span>

              {/* CTA label */}
              <span className="text-white/80 text-sm font-semibold tracking-widest uppercase">
                {MOCK_MODE ? "Confirm Booking" : "Pay via Razorpay →"}
              </span>
            </>
          )}
        </span>
      </button>

      {/* Security strip */}
      <div className="flex items-center justify-center gap-6 mb-6">
        {[
          { icon: "🔒", label: "256-bit SSL" },
          { icon: "✅", label: "PCI DSS" },
          { icon: "🛡️", label: "3D Secure" },
        ].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
            <span className="text-base">{icon}</span> {label}
          </div>
        ))}
      </div>

      {/* Back button */}
      <button
        onClick={onBack}
        disabled={loading}
        className="w-full border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-sm hover:border-slate-300 hover:bg-white transition-all disabled:opacity-50"
      >
        ← Back
      </button>

      <p className="text-[10px] text-slate-400 text-center mt-4">
        By paying you agree to PlumTrips{" "}
        <a href="/terms" className="underline hover:text-slate-600">Terms of Service</a> and{" "}
        <a href="/cancellation" className="underline hover:text-slate-600">Cancellation Policy</a>.
        {MOCK_MODE && " (Mock mode — no actual charge.)"}
      </p>
    </div>
  );
}