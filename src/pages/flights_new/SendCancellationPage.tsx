// ============================================================
//  CancellationPage.tsx — Request a PNR Cancellation
//  Matches TBO's SendChangeRequest spec via apiCancelPNR()
// ============================================================

import React, { useState } from "react";
import {
  apiCancelSend,
  formatINR,
  CancelRequestType,
  CancelCancellationType,
  type CancelPNRResult,
} from "../../lib/flights_api";

interface CancellationPageProps {
  // Optional prefill — pass these in if the user is arriving from an
  // existing booking (e.g. "My Trips" screen). All remain editable.
  defaultBookingId?: number;
  defaultTicketId?: string | number;
  onDone?: () => void;
}

const REQUEST_TYPE_OPTIONS: { value: CancelRequestType; label: string; desc: string }[] = [
  { value: CancelRequestType.FullCancellation, label: "Full Cancellation", desc: "Cancel the entire booking" },
  { value: CancelRequestType.PartialCancellation, label: "Partial Cancellation", desc: "Cancel only one sector / passenger" },
  { value: CancelRequestType.Reissuance, label: "Reissuance", desc: "Reissue / rebook the ticket" },
];

const CANCELLATION_TYPE_OPTIONS: { value: CancelCancellationType; label: string }[] = [
  { value: CancelCancellationType.NoShow, label: "No Show" },
  { value: CancelCancellationType.FlightCancelled, label: "Flight Cancelled" },
  { value: CancelCancellationType.Others, label: "Others" },
];

export default function CancellationPage({
  defaultBookingId,
  defaultTicketId,
  onDone,
}: CancellationPageProps) {
  const [bookingId, setBookingId] = useState<string>(
    defaultBookingId != null ? String(defaultBookingId) : ""
  );
  const [requestType, setRequestType] = useState<CancelRequestType>(
    CancelRequestType.FullCancellation
  );
  const [cancellationType, setCancellationType] = useState<CancelCancellationType>(
    CancelCancellationType.Others
  );
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [ticketId, setTicketId] = useState<string>(
    defaultTicketId != null ? String(defaultTicketId) : ""
  );
  const [remarks, setRemarks] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<CancelPNRResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const isPartial = requestType === CancelRequestType.PartialCancellation;

  const bookingIdNum = Number(bookingId);
  const isValid =
    bookingId.trim() !== "" &&
    Number.isFinite(bookingIdNum) &&
    ticketId.trim() !== "" &&
    remarks.trim() !== "" &&
    (!isPartial || (origin.trim() !== "" && destination.trim() !== ""));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");
    setResult(null);

    try {
      const res = await apiCancelSend({
        bookingId:        bookingIdNum,
        requestType,
        cancellationType,
        origin:           isPartial ? origin.trim().toUpperCase() : undefined,
        destination:      isPartial ? destination.trim().toUpperCase() : undefined,
        ticketId:         ticketId.trim(),
        remarks:          remarks.trim(),
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
              Reference booking #{bookingId} · Ticket {ticketId}
              {isPartial ? ` · ${origin.toUpperCase()} → ${destination.toUpperCase()}` : ""}
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
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="e.g. 1029384"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Ticket ID(s)
                </label>
                <input
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="e.g. 5012345 or 5012345,5012346"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Comma-separate multiple ticket IDs to cancel more than one passenger.
                </p>
              </div>

              {/* Request Type */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Request Type
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {REQUEST_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setRequestType(opt.value)}
                      className={`text-left rounded-2xl border-2 px-4 py-3 transition-all ${
                        requestType === opt.value
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="font-bold text-sm text-slate-900">{opt.label}</div>
                      <div className="text-xs text-slate-500">{opt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Origin / Destination — only for Partial Cancellation */}
              {isPartial && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Origin
                    </label>
                    <input
                      type="text"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value.toUpperCase())}
                      placeholder="DEL"
                      maxLength={3}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={isPartial}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                      Destination
                    </label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value.toUpperCase())}
                      placeholder="BOM"
                      maxLength={3}
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold uppercase text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required={isPartial}
                    />
                  </div>
                </div>
              )}

              {/* Cancellation Type */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Cancellation Reason Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {CANCELLATION_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCancellationType(opt.value)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold border-2 transition-all ${
                        cancellationType === opt.value
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Reason for cancelling this booking"
                  rows={3}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
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