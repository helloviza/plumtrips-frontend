// ============================================================
//  CancellationPage.tsx — Request a PNR Cancellation
// ============================================================

import React, { useState } from "react";
import { apiCancelPNR, type CancelPNRResult } from "../../lib/flights_api";
import { formatINR } from "../../lib/flights_api";

interface CancellationPageProps {
  // Optional prefill — pass these in if the user is arriving from an
  // existing booking (e.g. "My Trips" screen). Both remain editable.
  defaultbookingId?: number;
  defaultsource?: number;
  onDone?: () => void;
}

export default function CancellationPageFlights({
  defaultbookingId,
  defaultsource,
  onDone,
}: CancellationPageProps) {
  const [bookingId, setbookingId] = useState<string>(
    defaultbookingId != null ? String(defaultbookingId) : ""
  );
  const [source, setsource] = useState<string>(
    defaultsource != null ? String(defaultsource) : ""
  );
  const [remarks, setRemarks] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<CancelPNRResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const bookingIdNum = Number(bookingId);
  const sourceNum    = Number(source);
  const isValid =
    bookingId.trim() !== "" &&
    source.trim() !== "" &&
    Number.isFinite(bookingIdNum) &&
    Number.isFinite(sourceNum);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");
    setResult(null);

    try {
      const res = await apiCancelPNR({
        bookingId: bookingIdNum,
        source:    sourceNum,
        remarks:   remarks.trim() || undefined,
      });
      setResult(res);
      setStatus("success");
    } catch (err: any) {
      setErrorMsg(err?.message ?? "Something went wrong while requesting cancellation.");
      setStatus("error");
    }
  }

  function handleReset() {
    setStatus("idle");
    setResult(null);
    setErrorMsg("");
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="font-black text-3xl text-slate-900 tracking-tight mb-2">Cancel a Booking</h1>
        <p className="text-slate-500 text-sm">
          Enter your booking details below to request a cancellation.
        </p>
      </div>

      {/* Success state */}
      {status === "success" && result && (
        <div className="mb-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-3xl p-6 mb-4 text-white">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
              Cancellation Request
            </div>
            <div className="flex flex-wrap gap-4 mb-4">
              {result.cancellationId && (
                <div>
                  <div className="text-[10px] text-slate-500 mb-0.5">Cancellation ID</div>
                  <div className="font-black text-xl font-mono">#{result.cancellationId}</div>
                </div>
              )}
              <div>
                <div className="text-[10px] text-slate-500 mb-0.5">Status</div>
                <div className="font-black text-xl font-mono tracking-widest text-emerald-400">
                  {result.status ?? "Requested"}
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Reference booking #{bookingId} · Source {source}
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5 mb-4">
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
              {result.message ? "Confirmation" : "Request Submitted"}
            </div>
            <p className="text-sm text-emerald-800">
              {result.message ?? "Your cancellation request has been submitted successfully."}
            </p>
          </div>

          {typeof result.refundAmount === "number" && result.refundAmount > 0 && (
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                    Estimated Refund
                  </div>
                  <div className="text-[10px] text-slate-400">Subject to airline &amp; fare rules</div>
                </div>
                <div className="font-black text-3xl text-slate-900">{formatINR(result.refundAmount)}</div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onDone}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-200"
            >
              Back to Home
            </button>
            <button
              onClick={handleReset}
              className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-4 rounded-2xl text-sm hover:border-slate-300 hover:bg-white transition-all"
            >
              Cancel Another Booking
            </button>
          </div>
        </div>
      )}

      {/* Form state (idle / loading / error) */}
      {status !== "success" && (
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-4">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Booking Details
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Booking ID
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={bookingId}
                  onChange={(e) => setbookingId(e.target.value)}
                  placeholder="e.g. 1029384"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Source
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={source}
                  onChange={(e) => setsource(e.target.value)}
                  placeholder="e.g. 1"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  The supplier/source code from your original flight result.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Reason for Cancellation <span className="normal-case text-slate-300 font-semibold">(optional)</span>
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Let us know why you're cancelling (optional)"
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {status === "error" && (
            <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {errorMsg}
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-4 mb-6 text-xs text-amber-800">
            Cancellation fees and refund amounts (if any) are governed by the airline's fare rules
            and will be confirmed after your request is processed.
          </div>

          <button
            type="submit"
            disabled={!isValid || status === "loading"}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black py-4 rounded-2xl text-sm transition-all shadow-lg shadow-red-200 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {status === "loading" ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Submitting Request...
              </>
            ) : (
              "Request Cancellation"
            )}
          </button>
        </form>
      )}
    </div>
  );
}