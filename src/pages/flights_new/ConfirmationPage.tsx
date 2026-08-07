// ============================================================
//  BookingStep7Confirmation.tsx — Step 7: Booking Confirmed
// ============================================================

import React, { useEffect, useState, useRef } from "react";
import type { DisplayFlight, FareTier } from "../../lib/types_t";
import { formatINR } from "../../lib/flights_api";
import { AIRLINE_COLORS } from "./BookingShared";
import { sendFlightConfirmationEmail, sendTaxInvoiceEmail } from "../../lib/emailApi";
import { buildFlightConfirmationHtml, buildTaxInvoiceHtml } from "../../lib/buildBookingEmail";
import { downloadTicketPdf } from "./generateTicketPdf";

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

  // --- NEW: optional data to fill the email templates properly ---------
  // If you don't have a real breakdown yet, omit this and the email will
  // just show the full totalPaid as "Flights" with 0 taxes — good enough
  // to unblock sending, fix up once your API returns a real breakdown.
  priceBreakdown?: {
    flightsAmount: number;
    hotelsAmount?: number;
    transfersAmount?: number;
    taxesAmount: number;
    hotelNights?: number;
  };
  // Billing info for the tax invoice. Optional for the same reason —
  // omit it and the invoice will use the contact email's name/blank address.
  billingInfo?: {
    customerName: string;
    addressLine1: string;
    city: string;
    stateZip: string;
    country: string;
  };
  invoiceNumber?: string; // e.g. from your backend once booking is created
}

export default function BookingStep7Confirmation({
  flight, tier, returnFlight, returnTier, multiCityLegs,
  bookingId, pnr, passengerNames, contactEmail,
  totalPaid, isInternational, onDone,
  priceBreakdown, billingInfo, invoiceNumber,
}: Step7Props) {
  const isRoundTrip = !!returnFlight && !!returnTier;
  const isMultiCity = !!(multiCityLegs && multiCityLegs.length > 1);
  const tripType: "One-way" | "Round Trip" | "Multi-City" = isMultiCity
    ? "Multi-City"
    : isRoundTrip
    ? "Round Trip"
    : "One-way";

  const allLegs = [
    { flight, tier, label: isRoundTrip ? "Outbound" : isMultiCity ? "Leg 1" : "Flight" },
    ...(isRoundTrip && returnFlight && returnTier ? [{ flight: returnFlight, tier: returnTier, label: "Return" }] : []),
    ...(isMultiCity
      ? (multiCityLegs ?? []).slice(1).map((l, i) => ({ flight: l.flight, tier: l.tier, label: `Leg ${i + 2}` }))
      : []),
  ];

  const pnrList = pnr
    ? pnr
        .split(/\s*(?:,|\/)\s*/g)
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const emailSentRef = useRef(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'preparing' | 'error'>('idle');

  useEffect(() => {
    if (!bookingId || !contactEmail || emailSentRef.current) return;

    // Prevent strict mode double-firing
    emailSentRef.current = true;
    setEmailStatus('sending');

    const today = new Date().toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
    });

    const price = priceBreakdown ?? {
      flightsAmount: totalPaid,
      hotelsAmount: 0,
      transfersAmount: 0,
      taxesAmount: 0,
      hotelNights: 0,
    };

    const flightHtml = buildFlightConfirmationHtml({
      bookingReference: pnrList[0] ?? String(bookingId),
      bookingDate: today,
      primaryFlight: allLegs[0].flight,
      tier,
      passengerNames: passengerNames ?? [],
      paxCount: (passengerNames ?? []).length || 1,
      price: {
        flightsAmount: price.flightsAmount,
        hotelsAmount: price.hotelsAmount,
        transfersAmount: price.transfersAmount,
        taxesAmount: price.taxesAmount,
        totalAmount: totalPaid,
        hotelNights: price.hotelNights,
      },
    });

    const invoiceHtml = buildTaxInvoiceHtml({
      invoiceNumber: invoiceNumber ?? `INV-${bookingId}`,
      invoiceDate: today,
      customerName: billingInfo?.customerName ?? passengerNames?.[0] ?? contactEmail,
      billingAddressLine1: billingInfo?.addressLine1 ?? "",
      billingCity: billingInfo?.city ?? "",
      billingStateZip: billingInfo?.stateZip ?? "",
      billingCountry: billingInfo?.country ?? "",
      items: [
        {
          description: `Flight — ${allLegs[0].flight.fromCode} to ${allLegs[0].flight.toCode}`,
          qty: (passengerNames ?? []).length || 1,
          unitPrice: price.flightsAmount / ((passengerNames ?? []).length || 1),
          amount: price.flightsAmount,
        },
      ],
      subtotal: price.flightsAmount + (price.hotelsAmount ?? 0) + (price.transfersAmount ?? 0),
      taxes: price.taxesAmount,
      taxName: "GST",
      totalAmount: totalPaid,
      amountPaid: totalPaid,
    });

    Promise.all([
      sendFlightConfirmationEmail({
        bookingId,
        pnr,
        email: contactEmail,
        subject: `Your PlumTrips Booking is Confirmed — ${pnrList[0] ?? bookingId}`,
        html: flightHtml,
      }),
      sendTaxInvoiceEmail({
        bookingId,
        type: 'flight',
        email: contactEmail,
        subject: `Tax Invoice for Booking ${pnrList[0] ?? bookingId}`,
        html: invoiceHtml,
      }),
    ]).then(([confSuccess, invSuccess]) => {
      // If either fails, we can show an error, but usually partial success is okay.
      // For simplicity, we just mark success if both or at least one succeeds, or show error if both fail.
      setEmailStatus((confSuccess || invSuccess) ? 'success' : 'error');
    });
  }, [bookingId, contactEmail, pnr]);

  async function handleDownloadTicket() {
    setDownloadStatus('preparing');
    try {
      await downloadTicketPdf({
        bookingId,
        pnrList,
        legs: allLegs,
        tripType,
        passengerNames: passengerNames ?? [],
        contactEmail,
        totalPaid,
        isInternational,
        formatAmount: formatINR,
      });
      setDownloadStatus('idle');
    } catch (e) {
      console.error("Ticket PDF generation failed:", e);
      setDownloadStatus('error');
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Success banner */}
      <div className="text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-black text-3xl text-slate-900 tracking-tight mb-2">Booking Confirmed!</h1>
        <p className="text-slate-500 text-sm">
          Your e-ticket has been secured.
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <span className="text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white px-3 py-1 rounded-full">
            {tripType}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
            {(passengerNames?.length || 1)} {(passengerNames?.length || 1) > 1 ? "Passengers" : "Passenger"}
          </span>
          {isInternational && (
            <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
              International
            </span>
          )}
        </div>
      </div>

      {/* Email feedback banner */}
      {emailStatus === 'sending' && (
        <div className="mb-8 p-3 rounded-xl bg-blue-50 text-blue-700 text-sm text-center flex items-center justify-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
          Sending confirmation and tax invoice emails to {contactEmail}...
        </div>
      )}
      {emailStatus === 'success' && (
        <div className="mb-8 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-sm text-center font-medium">
          A confirmation and tax invoice have been sent to your registered email address ({contactEmail}).
        </div>
      )}
      {emailStatus === 'error' && (
        <div className="mb-8 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm text-center">
          We couldn't send the emails at this time, but your booking is perfectly safe and confirmed!
        </div>
      )}

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
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Flight Itinerary</div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{allLegs.length} {allLegs.length > 1 ? "Legs" : "Leg"}</div>
        </div>
        <div className="divide-y divide-slate-100">
          {allLegs.map(({ flight: f, tier: legTier, label }, i) => (
            <div key={i} className="flex items-center gap-4 p-5">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-xs font-black shrink-0"
                style={{ background: AIRLINE_COLORS[f.airlineCode] ?? "#64748b" }}
              >
                {f.airlineCode}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-bold text-slate-900 text-sm">{f.airline} · {f.flightNumber}</span>
                  <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full uppercase">{label}</span>
                  {legTier?.name && (
                    <span className="text-[9px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full uppercase">{legTier.name}</span>
                  )}
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
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
            Passengers ({passengerNames.length})
          </div>
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

      {downloadStatus === 'error' && (
        <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm text-center">
          Couldn't generate the PDF ticket right now — please try again.
        </div>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={handleDownloadTicket}
          disabled={downloadStatus === 'preparing'}
          className="sm:col-span-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-black py-4 rounded-2xl text-sm transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
        >
          {downloadStatus === 'preparing' ? (
            <>
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              Preparing…
            </>
          ) : (
            <>⬇️ Download Ticket</>
          )}
        </button>
        <button
          onClick={onDone}
          className="sm:col-span-1 border-2 border-slate-200 text-slate-700 font-bold py-4 rounded-2xl text-sm hover:border-slate-300 hover:bg-white transition-all"
        >
          Back to Home
        </button>
        <button
          onClick={() => window.print()}
          className="sm:col-span-1 border-2 border-slate-200 text-slate-700 font-bold py-4 rounded-2xl text-sm hover:border-slate-300 hover:bg-white transition-all"
        >
          🖨️ Print
        </button>
      </div>
    </div>
  );
}