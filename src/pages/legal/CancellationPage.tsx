import React from "react";

const baseFont = "'Barlow Condensed', Arial, sans-serif";
const BRAND = "Plumtrips.com";
const SUPPORT_EMAIL = "hello@Plumtrips.com";
const SUPPORT_PHONE = "+91 70659 32396";

export default function CancellationPage() {
  return (
    <main
      style={{
        fontFamily: baseFont,
        maxWidth: 980,
        margin: "0 auto",
        padding: "40px 20px 80px",
        lineHeight: 1.65,
      }}
    >
      <h1 style={{ fontSize: "2.2rem", color: "#00477f", marginBottom: 8 }}>
        Cancellation &amp; Refund Policy
      </h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>Last updated: 9 Nov 2025</p>

      <p>
        This Policy explains how cancellations, changes, and refunds work across
        our services (flights, hotels, holidays, visa assistance, MICE). Supplier
        rules always prevail in addition to this Policy.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>1. General Rules</h2>
      <ul>
        <li>
          <strong>Supplier Terms:</strong> Each booking is governed by airline,
          hotel, DMC, and visa partner rules.
        </li>
        <li>
          <strong>Service/Processing Fees:</strong> Our fees (where applicable)
          are non-refundable once service has commenced.
        </li>
        <li>
          <strong>Refund Timeline:</strong> Typically 7-21 business days after
          supplier confirmation; banks may take extra time to post credits.
        </li>
        <li>
          <strong>No-Shows:</strong> Generally non-refundable and may forfeit all value.
        </li>
        <li>
          <strong>Force Majeure:</strong> We facilitate per supplier policies; waivers are
          not guaranteed.
        </li>
      </ul>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>2. Flights</h2>
      <ul>
        <li>
          Changes/cancellations depend on fare rules (refundable vs. non-refundable).
        </li>
        <li>
          Airline penalties, fare differences, and {BRAND} service fees may apply.
        </li>
        <li>
          Partially used tickets are usually non-refundable; some allow prorated tax refunds only.
        </li>
      </ul>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>3. Hotels</h2>
      <ul>
        <li>
          Policies vary by rate plan: fully refundable until a cutoff, partially
          refundable, or non-refundable.
        </li>
        <li>
          No-show often incurs 100% first night or full stay charge depending on policy.
        </li>
      </ul>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>4. Holidays &amp; MICE</h2>
      <ul>
        <li>
          Deposits may be non-refundable; staged cancellation slabs apply (e.g.,
          25%/50%/100% as departure nears).
        </li>
        <li>
          Third-party components (tickets, activities) follow their specific rules.
        </li>
      </ul>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>5. Visa Services</h2>
      <ul>
        <li>
          Visa fees (govt. charges) are non-refundable once applied/paid to the authority.
        </li>
        <li>
          {BRAND} processing/service fees are non-refundable after submission work starts.
        </li>
        <li>
          Visa approval is at the sole discretion of the issuing authority; rejections
          are not eligible for refunds of govt. fees or consumed services.
        </li>
      </ul>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>6. How to Request</h2>
      <p>
        Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a> or call {SUPPORT_PHONE} with
        your booking ID, passenger names, and request (change/cancel/refund). We will
        confirm eligibility, charges, and timelines before proceeding.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>7. Refund Method</h2>
      <p>
        Refunds are issued to the original payment method wherever possible. For
        partial refunds or complex cases, alternate arrangements may be discussed.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        8. Policy Updates
      </h2>
      <p>
        We may revise this Policy without prior notice; the latest version is
        always available on this page.
      </p>
    </main>
  );
}
