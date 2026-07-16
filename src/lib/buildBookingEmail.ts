// src/lib/buildBookingEmails.ts
//
// Fills your two templates with real booking data on the FRONTEND, right
// on the confirmation screen — so what gets emailed matches what the user
// just saw. Requires the two .html files to live somewhere under src/
// (Vite ?raw import reads the file at build time as a plain string).
//
// ⚠️ ADJUST THESE TWO IMPORT PATHS to wherever you actually keep the
// templates in the frontend repo:
import flightTemplateRaw from "../pages/templates/02-flight-ticket-confirmation.html?raw";
import invoiceTemplateRaw from "../pages/templates/04-tax-invoice.html?raw";

import { renderTemplate, absolutizeAssetPaths } from "./emailTemplateRender";
import type { DisplayFlight, FareTier } from "./types_t";

// Public URL where /assets/* (logo, gifs etc referenced by the templates)
// is actually hosted — templates use relative "./assets/..." which only
// works on disk, emails need a real absolute URL.
const EMAIL_ASSET_BASE_URL =
  import.meta.env.VITE_EMAIL_ASSET_BASE_URL || "https://plumtrips.com/email-assets";

// Static company details for the invoice footer — these don't change
// per-booking, so hardcode (or pull from an env/config file) rather than
// threading them through every call site.
const COMPANY_DETAILS = {
  company_name: "PlumTrips Travel Pvt. Ltd.",
  company_gstin: "07AAAPX1234C1ZV", // TODO: replace with real GSTIN
  company_pan: "AAAPX1234C", // TODO: replace with real PAN
};

function formatMoney(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

// --- very small INR words converter (0 – 99,99,99,999) ---------------
const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
  "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
  "Seventeen", "Eighteen", "Nineteen",
];
const TENS = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function twoDigitWords(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${TENS[t]}${o ? " " + ONES[o] : ""}`;
}

function threeDigitWords(n: number): string {
  const h = Math.floor(n / 100);
  const rest = n % 100;
  return `${h ? ONES[h] + " Hundred" + (rest ? " " : "") : ""}${rest ? twoDigitWords(rest) : ""}`;
}

/** Indian numbering (crore/lakh/thousand), rupees only — no paise. */
export function amountInWordsINR(amount: number): string {
  const n = Math.round(amount);
  if (n === 0) return "Zero Rupees Only";

  const crore = Math.floor(n / 1_00_00_000);
  const lakh = Math.floor((n % 1_00_00_000) / 1_00_000);
  const thousand = Math.floor((n % 1_00_000) / 1_000);
  const hundred = n % 1_000;

  const parts = [
    crore ? `${threeDigitWords(crore)} Crore` : "",
    lakh ? `${threeDigitWords(lakh)} Lakh` : "",
    thousand ? `${threeDigitWords(thousand)} Thousand` : "",
    hundred ? threeDigitWords(hundred) : "",
  ].filter(Boolean);

  return `${parts.join(" ")} Rupees Only`;
}

// -----------------------------------------------------------------------
// Flight confirmation email
// -----------------------------------------------------------------------

export interface PriceBreakdown {
  flightsAmount: number;
  hotelsAmount?: number;
  transfersAmount?: number;
  taxesAmount: number;
  totalAmount: number;
  hotelNights?: number;
}

export interface BuildFlightConfirmationInput {
  bookingReference: string; // PNR or booking id shown to the user
  bookingDate: string; // e.g. "15 Jul 2026"
  primaryFlight: DisplayFlight; // template only has room for one leg — see note below
  tier?: FareTier;
  passengerNames: string[]; // template shows first 2; extra names are dropped (template limitation)
  paxCount: number;
  price: PriceBreakdown;
  isRoundTripOrLayover?: {
    layoverAirport?: string;
    layoverDuration?: string;
  };
}

/**
 * NOTE: 02-flight-ticket-confirmation.html has fixed markup for exactly
 * ONE flight (with an optional single layover) and exactly TWO traveler
 * boxes. For round-trip / multi-city bookings you'll want to either:
 *   (a) send one email per leg, or
 *   (b) edit the template to loop over legs/travelers like the invoice
 *       does with {{#each invoice_items}}.
 * This function renders using the FIRST leg only, which matches what
 * ConfirmationPage.tsx treats as the "primary" flight today.
 */
export function buildFlightConfirmationHtml(input: BuildFlightConfirmationInput): string {
  const f = input.primaryFlight;
  const stopsLabel = input.isRoundTripOrLayover?.layoverAirport ? "1 Stop" : "Non-stop";

  const data = {
    booking_reference: input.bookingReference,
    booking_date: input.bookingDate,
    origin_city: f.fromCode, // TODO: swap for full city name if DisplayFlight has one (e.g. f.fromCity)
    origin_code: f.fromCode,
    destination_city: f.toCode, // TODO: same as above (e.g. f.toCity)
    destination_code: f.toCode,
    departure_date: f.departDate,
    departure_time: f.departTime,
    arrival_date: f.departDate, // TODO: use f.arriveDate if your type has a separate arrival date
    arrival_time: f.arriveTime,
    stops: stopsLabel,
    airline_name: f.airline,
    flight_number: f.flightNumber,
    layover_airport: input.isRoundTripOrLayover?.layoverAirport ?? "",
    layover_duration: input.isRoundTripOrLayover?.layoverDuration ?? "",
    traveler_1_name: input.passengerNames[0] ?? "",
    traveler_2_name: input.passengerNames[1] ?? "",
    pax_count: input.paxCount,
    flights_amount: formatMoney(input.price.flightsAmount),
    hotels_amount: formatMoney(input.price.hotelsAmount ?? 0),
    hotel_nights: input.price.hotelNights ?? 0,
    transfers_amount: formatMoney(input.price.transfersAmount ?? 0),
    taxes_amount: formatMoney(input.price.taxesAmount),
    total_amount: formatMoney(input.price.totalAmount),
  };

  const withAssets = absolutizeAssetPaths(flightTemplateRaw, EMAIL_ASSET_BASE_URL);
  return renderTemplate(withAssets, data);
}

// -----------------------------------------------------------------------
// Tax invoice email
// -----------------------------------------------------------------------

export interface InvoiceLineItem {
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
}

export interface BuildTaxInvoiceInput {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  // TODO: none of these exist on Step7Props today — thread them through
  // from wherever the user's billing address is captured (profile/checkout),
  // or drop the fields from the template if you don't collect them.
  billingAddressLine1: string;
  billingCity: string;
  billingStateZip: string;
  billingCountry: string;
  items: InvoiceLineItem[];
  subtotal: number;
  taxes: number;
  taxName: string; // e.g. "GST (5%)"
  totalAmount: number;
  amountPaid: number;
}

export function buildTaxInvoiceHtml(input: BuildTaxInvoiceInput): string {
  const balanceDue = input.totalAmount - input.amountPaid;

  const data = {
    invoice_number: input.invoiceNumber,
    invoice_date: input.invoiceDate,
    customer_name: input.customerName,
    billing_address_line1: input.billingAddressLine1,
    billing_city: input.billingCity,
    billing_state_zip: input.billingStateZip,
    billing_country: input.billingCountry,
    invoice_items: input.items.map((it) => ({
      description: it.description,
      qty: it.qty,
      unit_price: formatMoney(it.unitPrice),
      amount: formatMoney(it.amount),
    })),
    subtotal: formatMoney(input.subtotal),
    taxes: formatMoney(input.taxes),
    tax_name: input.taxName,
    tax_amount: formatMoney(input.taxes),
    total_amount: formatMoney(input.totalAmount),
    balance_due: formatMoney(balanceDue),
    amount_in_words: amountInWordsINR(input.totalAmount),
    ...COMPANY_DETAILS,
  };

  const withAssets = absolutizeAssetPaths(invoiceTemplateRaw, EMAIL_ASSET_BASE_URL);
  return renderTemplate(withAssets, data);
}