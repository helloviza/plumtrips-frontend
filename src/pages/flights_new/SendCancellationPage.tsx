// ============================================================
//  CancellationPage.tsx — Request a PNR Cancellation
//  Matches TBO's SendChangeRequest spec via apiCancelSend()
// ============================================================

import React, { useState } from "react";
import {
  apiCancelSend,
  formatINR,
  CancelRequestType,
  CancelCancellationType,
  type CancelSendResult,
} from "../../lib/flights_api";

interface CancellationPageProps {
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
  // Comma-separated ticket IDs. Only sent to TBO for Partial Cancellation.
  const [ticketId, setTicketId] = useState<string>(
    defaultTicketId != null ? String(defaultTicketId) : ""
  );
  const [remarks, setRemarks] = useState("");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<CancelSendResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>("");

  const isPartial = requestType === CancelRequestType.PartialCancellation;
  const isReissuance = requestType === CancelRequestType.Reissuance;

  const bookingIdNum = Number(bookingId);

  const ticketIdsArray = ticketId
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);

  const isValid =
    bookingId.trim() !== "" &&
    Number.isFinite(bookingIdNum) &&
    remarks.trim() !== "" &&
    (!isPartial ||
      (origin.trim() !== "" &&
        destination.trim() !== "" &&
        ticketIdsArray.length > 0 &&
        ticketIdsArray.every((n) => Number.isFinite(n))));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");
    setResult(null);

    try {
      const normalizedOrigin = origin.trim().toUpperCase();
      const normalizedDestination = destination.trim().toUpperCase();
      const normalizedTicketIds = ticketIdsArray.join(",");

      const res = await apiCancelSend({
        bookingId: bookingIdNum,
        requestType,
        cancellationType,
        remarks: remarks.trim(),
        ...(isPartial
          ? {
              origin: normalizedOrigin,
              destination: normalizedDestination,
              ticketId: normalizedTicketIds,
            }
          : {
              ticketId: normalizedTicketIds,
            }),
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

  // TBO's Status/ChangeRequestStatus codes — adjust labels once you've confirmed
  // the full enum against TBO docs (4 = Cancelled Successfully, seen in your sample).
  function statusLabel(changeRequestStatus?: number) {
    switch (changeRequestStatus) {
      case 4:
        return { text: "Cancelled", color: "text-emerald-400" };
      default:
        return { text: "Requested", color: "text-amber-400" };
    }
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
        <div className="mb-6 space-y-4">
          {result.changeRequestInfo?.map((t, index) => {
            const s = statusLabel(t.changeRequestStatus);
            return (
              <div
                key={t.changeRequestId ?? `${t.ticketId ?? "request"}-${index}`}
                className="bg-linear-to-br from-slate-900 to-slate-700 rounded-3xl p-6 text-white"
              >
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                  Change Request
                </div>
                <div className="flex flex-wrap gap-4 mb-4">
                  <div>
                    <div className="text-[10px] text-slate-500 mb-0.5">Change Request ID</div>
                    <div className="font-black text-xl font-mono">#{t.changeRequestId}</div>
                  </div>
                  {t.ticketId != null && (
                    <div>
                      <div className="text-[10px] text-slate-500 mb-0.5">Ticket ID</div>
                      <div className="font-black text-xl font-mono">{t.ticketId}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-[10px] text-slate-500 mb-0.5">Status</div>
                    <div className={`font-black text-xl font-mono tracking-widest ${s.color}`}>
                      {s.text}
                    </div>
                  </div>
                </div>

                {t.remarks && <p className="text-xs text-slate-400 mb-3">{t.remarks}</p>}

                {(typeof t.cancellationCharge === "number" || typeof t.refundedAmount === "number") && (
                  <div className="flex gap-6 pt-3 border-t border-white/10">
                    {typeof t.cancellationCharge === "number" && (
                      <div>
                        <div className="text-[10px] text-slate-500 mb-0.5">Cancellation Charge</div>
                        <div className="font-bold text-sm">{formatINR(t.cancellationCharge)}</div>
                      </div>
                    )}
                    {typeof t.refundedAmount === "number" && (
                      <div>
                        <div className="text-[10px] text-slate-500 mb-0.5">Refunded Amount</div>
                        <div className="font-bold text-sm text-emerald-400">
                          {formatINR(t.refundedAmount)}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {t.creditNoteNo && (
                  <p className="text-[11px] text-slate-500 mt-3">
                    Credit Note: {t.creditNoteNo}
                    {t.creditNoteCreatedOn ? ` · ${new Date(t.creditNoteCreatedOn).toLocaleDateString()}` : ""}
                  </p>
                )}
              </div>
            );
          })}

          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
            <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">
              Request Submitted
            </div>
            <p className="text-sm text-emerald-800">
              Your cancellation request for booking #{bookingId} has been submitted successfully.
            </p>
          </div>

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
                {isReissuance && (
                  <p className="text-[11px] text-amber-600 mt-1.5">
                    Reissuance payload isn't confirmed against TBO's spec yet — verify required
                    fields before relying on this in production.
                  </p>
                )}
              </div>

              {/* Ticket ID(s) — only meaningful (and only sent) for Partial Cancellation */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  Ticket ID(s) {isPartial ? "" : "(optional, for your reference)"}
                </label>
                <input
                  type="text"
                  value={ticketId}
                  onChange={(e) => setTicketId(e.target.value)}
                  placeholder="e.g. 5012345 or 5012345,5012346"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={isPartial}
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {isPartial
                    ? "Comma-separate multiple ticket IDs to cancel more than one passenger. Required for partial cancellation."
                    : "Not sent to TBO for full cancellation — the whole booking is cancelled regardless of individual ticket IDs."}
                </p>
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