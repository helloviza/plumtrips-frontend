import React from "react";

const baseFont = "'Barlow Condensed', Arial, sans-serif";
const BRAND = "Plumtrips.com";
const SUPPORT_EMAIL = "hello@plumtrips.com";

export default function TermsPage() {
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
        Terms &amp; Conditions
      </h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>Last updated: 9 Nov 2025</p>

      <p>
        Welcome to {BRAND}. By using our website and services you agree to these
        Terms. If you do not agree, please discontinue use.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>1. Definitions</h2>
      <p>
        “Services” include flight/hotel/holiday/visa/MICE search, booking,
        concierge, and related support. “You” means the user/customer.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>2. Eligibility</h2>
      <p>
        You must be capable of forming a legally binding contract and use the
        Services in compliance with applicable laws/regulations (aviation,
        immigration, tax, sanctions).
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        3. Account & Security
      </h2>
      <p>
        Maintain accurate info and safeguard credentials. You are responsible
        for all activities under your account. Notify us of suspected misuse.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        4. Booking & Fulfilment
      </h2>
      <ul>
        <li>
          We act as agent to present rates/inventory from airlines, hotels,
          DMCs, and visa partners. Fulfilment is subject to supplier terms.
        </li>
        <li>
          Prices/taxes may change until ticketing/confirmation is complete.
        </li>
        <li>
          Names, travel dates, and passport details must exactly match documents.
        </li>
        <li>
          E-tickets/vouchers are issued post successful payment/verification.
        </li>
      </ul>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        5. Payments, Fees & Taxes
      </h2>
      <ul>
        <li>
          We may charge convenience/service fees. Taxes and fees are shown at
          checkout where feasible; final amounts depend on supplier rules.
        </li>
        <li>
          Currency conversion and bank charges may apply from your issuer.
        </li>
        <li>
          Chargebacks/disputes must be raised in good faith; misuse may lead to
          account restriction.
        </li>
      </ul>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        6. Changes, Cancellations & Refunds
      </h2>
      <p>
        All changes/cancellations are governed by supplier fare/rate rules in
        addition to our{" "}
        <a href="/cancellation-and-refund">Cancellation &amp; Refund Policy</a>.
        Certain fares are non-refundable/non-changeable. No-shows usually forfeit
        value. Refund timelines depend on supplier processing.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        7. Travel Documents & Visa
      </h2>
      <p>
        You are responsible for valid passports, visas, health docs, and entry
        requirements. We can assist with visa processing, but approval is at
        the sole discretion of the issuing authority.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>8. Conduct</h2>
      <ul>
        <li>No unlawful content, scraping, or rate-limiting circumvention.</li>
        <li>No infringement, fraud, or abuse of promotions.</li>
        <li>Respect supplier/venue rules and public safety regulations.</li>
      </ul>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>9. IP & License</h2>
      <p>
        Content, brand, and software are protected. You get a limited,
        revocable, non-transferable license to use the site for personal or
        authorized business travel purposes.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        10. Disclaimers & Limitation of Liability
      </h2>
      <p>
        Services are provided “as is”. We do not warrant uninterrupted or
        error-free operation. To the maximum extent permitted by law, our
        liability is limited to the amount paid to us for the affected service.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>11. Indemnity</h2>
      <p>
        You agree to indemnify and hold us harmless from claims arising out of
        your misuse of the Services or breach of these Terms.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        12. Governing Law & Disputes
      </h2>
      <p>
        These Terms are governed by the laws of India. Courts at Gurugram
        (Haryana) shall have exclusive jurisdiction. We may offer amicable
        resolution/mediation as a first step.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        13. Changes to Terms
      </h2>
      <p>
        We may update Terms; continued use constitutes acceptance. Material
        changes will be posted on this page.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>14. Contact</h2>
      <p>
        Questions? Email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </main>
  );
}
