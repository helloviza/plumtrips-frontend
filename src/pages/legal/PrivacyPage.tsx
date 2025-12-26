const baseFont = "'Barlow Condensed', Arial, sans-serif";

const BRAND = "Plumtrips.com";
const LEGAL_ENTITY = "Peachmint Trips and Planners Private Limited";
const SUPPORT_EMAIL = "hello@plumtrips.com";
const SUPPORT_PHONE_DISPLAY = "+91 70659 32396";
const SUPPORT_PHONE_TEL = "+917065932396";

// Set these to your official details (recommended for legal pages)
const REGISTERED_ADDRESS = "Vatika Business Park, Gurugram Haryana";
const GRIEVANCE_EMAIL = "grievance@plumtrips.com"; // change if you want to keep grievance@plumtrips.com
const LAST_UPDATED = "9 Nov 2025";

function linkStyle() {
  return { color: "#00477f", textDecoration: "underline" };
}

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
      <p style={{ marginTop: 0, opacity: 0.8 }}>Last updated: {LAST_UPDATED}</p>

      <p>
        <strong>{BRAND}</strong> is a brand and website operated by{" "}
        <strong>{LEGAL_ENTITY}</strong> (“Peachmint,” “we,” “us,” or “our”). This
        Privacy Policy explains how we collect, use, disclose, and safeguard your
        information when you access or use our website, mobile experiences, and
        related travel services, including flights, hotels, holidays, visa
        assistance, group bookings, and MICE (Meetings, Incentives, Conferences,
        and Events).
      </p>

      <p>
        We aim to handle personal data responsibly and in accordance with
        applicable laws, including the <strong>Digital Personal Data Protection Act, 2023</strong>{" "}
        (“<strong>DPDP Act</strong>”), the <strong>Information Technology Act, 2000</strong>, and
        applicable rules (including the IT Rules, 2021), and other applicable
        data protection laws (including GDPR where relevant).
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>1. Scope</h2>
      <p>
        This Policy applies to users, prospects, and business contacts who access
        or use our Services. By using {BRAND}, you consent to the practices
        described here.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>2. Information We Collect</h2>
      <ul>
        <li>
          <strong>Identity &amp; Contact:</strong> name, email, phone, gender,
          date of birth, nationality.
        </li>
        <li>
          <strong>Travel Details:</strong> trip preferences, destinations, dates,
          co-traveller details, special requests.
        </li>
        <li>
          <strong>KYC &amp; Visa Documents:</strong> passport details, photos,
          address proof—only when you choose to submit them for visa/booking
          assistance or where required by a service provider or law.
        </li>
        <li>
          <strong>Payment Data:</strong> limited billing information (we use
          PCI-DSS compliant payment gateways; we do not store full card data).
        </li>
        <li>
          <strong>Technical:</strong> device/browser information, IP address,
          cookies, analytics, referrers.
        </li>
        <li>
          <strong>Communications:</strong> emails, chat messages, and call notes
          relating to support and bookings.
        </li>
      </ul>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>3. How We Use Data</h2>
      <ul>
        <li>Provide and manage bookings (flights/hotels/holidays/visa/MICE).</li>
        <li>Quote fares, issue tickets, process refunds, and deliver itineraries.</li>
        <li>Verify identity and comply with KYC/visa/documentation requirements.</li>
        <li>Improve site performance, user experience, and offerings using analytics.</li>
        <li>Customer support, notifications, travel alerts, and service updates.</li>
        <li>Fraud prevention, security, audits, and legal compliance.</li>
        <li>Marketing with consent (where required) and opt-out controls.</li>
      </ul>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        4. Legal Bases (DPDP Act / GDPR where applicable)
      </h2>
      <p>
        We process personal data based on your consent (where required), to
        perform contracts and provide services you request (for example, booking
        travel), for legitimate interests (such as security, fraud prevention,
        analytics, and service improvement), and to comply with legal obligations
        (including KYC, tax, and audit requirements).
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        5. Sharing &amp; International Transfers
      </h2>
      <p>
        We share personal data with trusted service providers strictly to deliver
        the Services you request. This may include airlines, GDS/aggregators,
        hotels, DMCs, visa partners, payment gateways, customer support tools,
        analytics providers, and cloud hosting providers. We share only the data
        that is reasonably necessary for service delivery, compliance, and
        security.
      </p>
      <p>
        Your data may be processed or stored outside your country depending on
        where our providers operate. Where applicable, we take steps to implement
        appropriate safeguards consistent with applicable law.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>6. Cookies &amp; Tracking</h2>
      <p>
        We use cookies and similar technologies to operate the website, remember
        preferences, enhance performance, and understand usage through analytics.
        You can manage cookies through your browser settings. Disabling cookies
        may affect certain features of the Services.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>7. Data Retention</h2>
      <p>
        We retain data for the duration needed to provide Services, meet legal
        and tax/audit requirements, resolve disputes, and enforce agreements.
        Passport/visa documents submitted for processing are retained only for
        legally mandated or operationally necessary durations and are securely
        deleted thereafter, subject to legal holds.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>8. Your Rights</h2>
      <ul>
        <li>
          Access, correction, update, and deletion (subject to legal and
          regulatory requirements).
        </li>
        <li>Withdraw consent where processing is consent-based.</li>
        <li>Opt out of marketing communications.</li>
        <li>
          Request grievance redressal related to your personal data and our
          Services.
        </li>
        <li>
          Other rights available to you under applicable law (including where
          relevant, GDPR rights).
        </li>
      </ul>
      <p>
        To exercise your rights, email{" "}
        <a style={linkStyle()} href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>
        . We may verify your identity before actioning requests.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>9. Security</h2>
      <p>
        We implement reasonable administrative, technical, and physical
        safeguards designed to protect your data. No method of transmission or
        storage is 100% secure; we continuously work to reduce risk through
        security controls and vendor due diligence.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>10. Children</h2>
      <p>
        Our Services are not directed to children. Where child data is required
        for travel bookings (for example, for minors traveling with family), we
        collect and process such data only with the consent and involvement of a
        parent or legal guardian, and only to the extent necessary for service
        delivery and compliance.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        11. Updates to This Policy
      </h2>
      <p>
        We may update this Policy from time to time. Material changes will be
        highlighted on this page with a new “Last updated” date.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>12. Grievance Officer</h2>
      <p style={{ marginBottom: 8 }}>
        If you have complaints about our Services or how we handle personal data,
        please contact:
      </p>
      <p style={{ marginTop: 0 }}>
        <strong>Grievance Officer</strong>
        <br />
        <strong>{LEGAL_ENTITY}</strong> (operating the brand “Plumtrips.com”)
        <br />
        <strong>Registered Address:</strong> {REGISTERED_ADDRESS}
        <br />
        <strong>Email:</strong>{" "}
        <a style={linkStyle()} href={`mailto:${GRIEVANCE_EMAIL}`}>
          {GRIEVANCE_EMAIL}
        </a>
      </p>
      <p style={{ opacity: 0.9 }}>
        In accordance with Rule 3(2) of the Information Technology (Intermediary
        Guidelines and Digital Media Ethics Code) Rules, 2021, the Grievance
        Officer will acknowledge your complaint within 24 hours and will
        endeavour to resolve it within 15 days of receipt, or sooner if required
        by applicable law.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>13. Contact</h2>
      <p>
        Questions? Contact {BRAND}:{" "}
        <a style={linkStyle()} href={`mailto:${SUPPORT_EMAIL}`}>
          {SUPPORT_EMAIL}
        </a>{" "}
        {" | "}
        <a style={linkStyle()} href={`tel:${SUPPORT_PHONE_TEL}`}>
          {SUPPORT_PHONE_DISPLAY}
        </a>
      </p>
    </main>
  );
}
