const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

interface FlightEmailPayload {
  bookingId: string | number;
  pnr?: string;
  email: string;
  subject?: string;
  html: string; // now required — this is the rendered template, not raw data
}

interface HotelEmailPayload {
  bookingId: string | number;
  email: string;
  subject?: string;
  html: string;
}

interface TaxInvoicePayload {
  bookingId: string | number;
  email: string;
  type: "flight" | "hotel";
  subject?: string;
  html: string;
}

/**
 * Sends a flight confirmation email.
 * `html` must already be the fully-rendered template
 * (see src/lib/buildBookingEmails.ts -> buildFlightConfirmationHtml).
 */
export async function sendFlightConfirmationEmail(payload: FlightEmailPayload): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/email/flight-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("[sendFlightConfirmationEmail] Failed with status:", res.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[sendFlightConfirmationEmail] Network or server error:", error);
    return false;
  }
}

/**
 * Sends a hotel booking confirmation email.
 */
export async function sendHotelConfirmationEmail(payload: HotelEmailPayload): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/email/hotel-confirmation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("[sendHotelConfirmationEmail] Failed with status:", res.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[sendHotelConfirmationEmail] Network or server error:", error);
    return false;
  }
}

/**
 * Sends a tax invoice email.
 * `html` must already be the fully-rendered template
 * (see src/lib/buildBookingEmails.ts -> buildTaxInvoiceHtml).
 */
export async function sendTaxInvoiceEmail(payload: TaxInvoicePayload): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/api/v1/email/tax-invoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("[sendTaxInvoiceEmail] Failed with status:", res.status);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[sendTaxInvoiceEmail] Network or server error:", error);
    return false;
  }
}