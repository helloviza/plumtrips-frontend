// ============================================================
//  BookingStep6Payment.tsx — Step 6: Payment Options
// ============================================================

import { useState } from "react";
import type { BookingFormState } from "./BookingShared";
import { SectionHeading, ErrorBanner, calcFares } from "./BookingShared";
import { formatINR, MOCK_MODE } from "../../lib/flights_api";
import type { DisplayFlight, FareTier } from "../../lib/types_t";

const PROMOS: Record<string, number | ((total: number) => number)> = {
  FIRST500: 500,
  HDFC10: (t) => Math.round(t * 0.1),
  PLUM200: 200,
};

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

type PayMethod = "upi" | "card" | "netbanking" | "emi" | "wallet";

const PAYMENT_METHODS: { id: PayMethod; label: string; icon: string; desc: string }[] = [
  { id: "upi", label: "UPI", icon: "⚡", desc: "PhonePe, GPay, Paytm, BHIM" },
  { id: "card", label: "Credit / Debit Card", icon: "💳", desc: "Visa, Mastercard, RuPay, Amex" },
  { id: "netbanking", label: "Net Banking", icon: "🏦", desc: "All major Indian banks" },
  { id: "emi", label: "EMI", icon: "📆", desc: "No-cost EMI on select cards" },
  { id: "wallet", label: "Wallets", icon: "👛", desc: "Paytm, Amazon Pay, Freecharge" },
];

export default function BookingStep6Payment({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  form, adults, children, infants,
  loading, error, onChange, onPay, onBack,
}: Step6Props) {
  const [selectedMethod, setSelectedMethod] = useState<PayMethod>("upi");
  const [promoInput, setPromoInput] = useState(form.promoCode);
  const [promoError, setPromoError] = useState<string | null>(null);

  const { subtotal, extrasTotal, taxes } = calcFares({
    tier, returnTier, multiCityLegs, adults, children, infants, extras: form.extras,
  });

  const rawTotal = subtotal + extrasTotal + taxes;
  const totalPayable = Math.round(rawTotal - form.promoDiscount);

  function applyPromo() {
    setPromoError(null);
    const rule = PROMOS[promoInput.toUpperCase()];
    if (!rule) { setPromoError("Invalid or expired promo code"); return; }
    const disc = typeof rule === "function" ? rule(rawTotal) : rule;
    onChange({ ...form, promoCode: promoInput.toUpperCase(), promoApplied: true, promoDiscount: disc });
  }

  function removePromo() {
    setPromoInput("");
    onChange({ ...form, promoCode: "", promoApplied: false, promoDiscount: 0 });
  }

  return (
    <div>
      <SectionHeading
        step="6"
        title="Secure Payment"
        desc={MOCK_MODE
          ? "Running in mock mode — no real payment will be processed."
          : "Powered by Razorpay. PCI-DSS Level 1 certified."}
      />

      {/* Promo code */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 mb-4">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Promo Code</div>
        {form.promoApplied ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm font-bold text-emerald-700">{form.promoCode} applied — {formatINR(form.promoDiscount)} off!</span>
            </div>
            <button onClick={removePromo} className="text-xs text-slate-400 hover:text-slate-600 underline">Remove</button>
          </div>
        ) : (
          <>
            <div className="flex gap-3">
              <input
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="FIRST500, HDFC10, PLUM200…"
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono font-bold tracking-widest text-slate-800 placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <button
                onClick={applyPromo}
                className="bg-slate-900 hover:bg-slate-700 text-white px-5 rounded-xl text-sm font-bold transition-colors shrink-0"
              >
                Apply
              </button>
            </div>
            {promoError && <p className="text-xs text-red-500 mt-2">{promoError}</p>}
            <p className="text-[10px] text-slate-400 mt-2">Try: FIRST500 · HDFC10 · PLUM200</p>
          </>
        )}
      </div>

      {/* Payment method selection */}
      {!MOCK_MODE && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 mb-4">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Payment Method</div>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMethod(m.id)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border-2 text-left transition-all ${
                  selectedMethod === m.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-100 bg-slate-50 hover:border-slate-300"
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  selectedMethod === m.id ? "bg-blue-100" : "bg-white"
                }`}>{m.icon}</div>
                <div className="flex-1">
                  <div className={`font-bold text-sm ${selectedMethod === m.id ? "text-blue-700" : "text-slate-800"}`}>{m.label}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{m.desc}</div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  selectedMethod === m.id ? "border-blue-500 bg-blue-500" : "border-slate-300"
                }`}>
                  {selectedMethod === m.id && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </button>
            ))}
          </div>

          {/* Razorpay badge */}
          <div className="flex items-center gap-2 mt-4 p-3 bg-slate-50 rounded-xl">
            <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <span className="text-white text-[10px] font-black">R</span>
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">
              Powered by Razorpay · PCI-DSS Level 1 · 3D Secure · 256-bit SSL
            </div>
          </div>
        </div>
      )}

      {/* Price summary card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 mb-5">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Price Summary</div>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-slate-500">Base fare + taxes</span>
            <span className="font-semibold">{formatINR(subtotal + taxes)}</span>
          </div>
          {extrasTotal > 0 && (
            <div className="flex justify-between text-violet-600">
              <span>Meals & Baggage</span>
              <span className="font-semibold">+{formatINR(extrasTotal)}</span>
            </div>
          )}
          {form.promoDiscount > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Promo discount</span>
              <span className="font-semibold">−{formatINR(form.promoDiscount)}</span>
            </div>
          )}
        </div>
        <div className="flex items-end justify-between border-t border-slate-100 pt-4">
          <div>
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Payable</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Incl. all taxes & fees · No hidden charges</div>
          </div>
          <div className="font-black text-3xl text-slate-900">{formatINR(totalPayable)}</div>
        </div>
      </div>

      {/* Security badges */}
      <div className="flex items-center justify-center gap-6 mb-6">
        {[{ icon: "🔒", label: "256-bit SSL" }, { icon: "✅", label: "PCI DSS" }, { icon: "🛡️", label: "3D Secure" }].map(({ icon, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
            <span className="text-base">{icon}</span> {label}
          </div>
        ))}
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="flex gap-3">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-sm hover:border-slate-300 hover:bg-white transition-all disabled:opacity-50"
        >
          ← Back
        </button>
        <button
          onClick={onPay}
          disabled={loading}
          className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-4 rounded-2xl text-base transition-all shadow-xl shadow-blue-300 flex items-center justify-center gap-3"
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {MOCK_MODE ? "Confirming booking…" : "Opening Razorpay…"}</>
          ) : (
            <>
              {MOCK_MODE ? (
                <>✓ Confirm Booking — {formatINR(totalPayable)}</>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Pay {formatINR(totalPayable)} via Razorpay
                </>
              )}
            </>
          )}
        </button>
      </div>

      <p className="text-[10px] text-slate-400 text-center mt-3">
        By paying you agree to PlumTrips{" "}
        <a href="/terms" className="underline hover:text-slate-600">Terms of Service</a> and{" "}
        <a href="/cancellation" className="underline hover:text-slate-600">Cancellation Policy</a>.
        {MOCK_MODE && " (Mock mode — no actual charge.)"}
      </p>
    </div>
  );
}