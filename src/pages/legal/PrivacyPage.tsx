import React from "react";

const baseFont = "'Barlow Condensed', Arial, sans-serif";
const BRAND = "Plumtrips.com";
const SUPPORT_EMAIL = "hello@plumtrips.com";
const SUPPORT_PHONE = "+91 70659 32396";

export default function PrivacyPage() {
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
        Privacy Policy
      </h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>Last updated: 9 Nov 2025</p>

      <p>
        {BRAND} (“we”, “us”, “our”) respects your privacy. This Privacy Policy
        explains how we collect, use, disclose, and safeguard your information
        when you use our website, mobile experiences, and related services for
        travel (flights, hotels, holidays, visa assistance, MICE).
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>1. Scope</h2>
      <p>
        This Policy applies to users, prospects, and business contacts who
        access or use our services. By using {BRAND}, you consent to the
        practices described here.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        2. Information We Collect
      </h2>
      <ul>
        <li>
          <strong>Identity & Contact:</strong> name, email, phone, gender,
          date of birth, nationality.
        </li>
        <li>
          <strong>Travel Details:</strong> trip preferences, destinations, dates,
          co-traveller details, special requests.
        </li>
        <li>
          <strong>KYC & Visa Docs:</strong> passport details, photos, address
          proof—only when you choose to submit for visa/booking assistance.
        </li>
        <li>
          <strong>Payment Data:</strong> limited billing info (we use PCI-DSS
          compliant payment gateways; we do not store full card data).
        </li>
        <li>
          <strong>Technical:</strong> device/browser info, IP, cookies,
          analytics, referrers.
        </li>
        <li>
          <strong>Communications:</strong> emails, chat messages, call notes
          relating to support and bookings.
        </li>
      </ul>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>3. How We Use Data</h2>
      <ul>
        <li>Provide and manage bookings (flights/hotels/holidays/visa/MICE).</li>
        <li>Quote fares, issue tickets, process refunds, and deliver itineraries.</li>
        <li>Verify identity and comply with KYC/visa/documentation requirements.</li>
        <li>Improve site performance, UX, and offerings using analytics.</li>
        <li>Customer support, notifications, travel alerts, and service updates.</li>
        <li>Fraud prevention, security, audits, and legal compliance.</li>
        <li>Marketing with consent and opt-out controls.</li>
      </ul>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        4. Legal Bases (incl. India DPDPA/GDPR concepts)
      </h2>
      <p>
        We process data based on consent, contract performance (to deliver
        bookings/services), legitimate interests (security, analytics, customer
        experience), and legal obligations (KYC, tax, audit).
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        5. Sharing & International Transfers
      </h2>
      <p>
        We share data with trusted providers strictly for service delivery:
        GDS/aggregators/airlines/hotels/DMCs/visa partners, payment gateways,
        customer support and analytics tools, cloud hosting. Data may be
        transferred outside your country subject to appropriate safeguards.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>6. Data Retention</h2>
      <p>
        We retain data for the duration needed to provide services, meet legal
        and tax/audit requirements, resolve disputes, and enforce agreements.
        Passport/visa copies submitted for processing are retained only for
        mandated durations and securely deleted thereafter.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>7. Your Rights</h2>
      <ul>
        <li>Access, correction, update, and deletion (subject to legal holds).</li>
        <li>Withdraw consent where processing is consent-based.</li>
        <li>Object/limit certain processing and opt out of marketing.</li>
      </ul>
      <p>
        To exercise rights, email <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        We may verify your identity before actioning requests.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>8. Security</h2>
      <p>
        We implement administrative, technical, and physical safeguards. No
        method of transmission is 100% secure; we aim to reduce risks with
        strong controls and vendor due diligence.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>9. Children</h2>
      <p>
        Our services are not directed to children under 13. We process minor
        data only as needed for travel bookings with guardian consent.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        10. Updates to This Policy
      </h2>
      <p>
        We may update this Policy. Material changes will be highlighted on this
        page with a new “Last updated” date.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>11. Contact</h2>
      <p>
        Questions? Contact {BRAND}: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>{" "}
        | {SUPPORT_PHONE}
      </p>
    </main>
  );
}
