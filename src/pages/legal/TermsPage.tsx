import type { ReactNode } from "react";

/**
 * Plumtrips.com — User Agreement & Terms of Service
 * Same content & order as the original document. Typeface: Poppins.
 */

const SUPPORT_EMAIL = "hello@plumtrips.com";

// Fixed on purpose — bump this string manually when the terms actually change.
const LAST_UPDATED = "7 August 2026";

const INK = "#1a1a1a";
const MUTED = "#5b5b5b";
const LINK = "#00477f";

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
`;

function P({ children }: { children: ReactNode }) {
  return <p style={{ margin: "1em 0" }}>{children}</p>;
}

function Email() {
  return (
    <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: LINK }}>
      {SUPPORT_EMAIL}
    </a>
  );
}

export default function TermsPage() {
  return (
    <>
      <style>{`
        ${fontImport}
        .terms-doc, .terms-doc * { box-sizing: border-box; }
        .terms-doc {
          font-family: 'Poppins', Arial, sans-serif;
          color: ${INK};
          background-color: #fdfdfd;
          margin: 0 auto;
          width: 100%;
          max-width: 1100px;
          padding: 50px 60px 80px;
          line-height: 1.7;
        }
        .terms-doc h1 {
          font-size: 2rem;
          font-weight: 600;
          text-align: center;
          margin: 0 0 8px;
          letter-spacing: -0.01em;
        }
        .terms-doc header {
          margin-bottom: 2.5em;
          text-align: center;
        }
        .terms-doc h2 {
          font-size: 1.3rem;
          font-weight: 600;
          margin-top: 2em;
          margin-bottom: 0.6em;
          color: #00325a;
        }
        .terms-doc p {
          margin: 1em 0;
          text-align: left;
        }
        .terms-doc ul {
          padding-left: 1.6em;
          margin: 1em 0;
        }
        .terms-doc li {
          margin: 0.4em 0;
        }
        .terms-doc a {
          color: ${LINK};
        }
        .terms-doc a:visited {
          color: ${LINK};
        }
        .terms-doc strong {
          font-weight: 600;
        }
        @media (max-width: 900px) {
          .terms-doc { padding: 40px 32px 60px; }
        }
        @media (max-width: 600px) {
          .terms-doc { font-size: 0.95em; padding: 30px 16px 60px; }
          .terms-doc h1 { font-size: 1.6em; }
        }
      `}</style>

      <main className="terms-doc">
        <header>
          <h1>Plumtrips.com — User Agreement &amp; Terms of Service</h1>
        </header>

        <P><strong>USER AGREEMENT &amp; TERMS OF SERVICE</strong></P>
        <p style={{ margin: "1em 0", fontStyle: "italic", color: MUTED }}>
          Last updated: {LAST_UPDATED}
        </p>
        <P>Operated by Plumtrips ("Plumtrips", "we", "us", "our")</P>

        <P><strong>A. USER AGREEMENT</strong></P>
        <P>
          This User Agreement, together with the Terms of Service set out in
          Part B below (collectively, the "User Agreement"), governs your
          access to and use of the website www.plumtrips.com, our mobile
          applications, and any other channel through which Plumtrips offers
          its services, including our concierge desk, sales staff, call
          centre, and authorised partners (together, the "Platform").
        </P>
        <P>
          Any person who browses, enquires about, or books any product or
          service offered by Plumtrips through the Platform ("You" or "User")
          agrees to be bound by this User Agreement. Plumtrips and the User
          are individually a "Party" and together the "Parties".
        </P>
        <P>
          Specific products and services (for example flights, hotels,
          holidays, visas, or MICE bookings) carry their own Terms of Service
          set out in Part B, which You should read alongside this Part A. In
          the event of a conflict between Part A and a service-specific term
          in Part B, the service-specific term will govern for that service
          alone.
        </P>
        <P>
          By using the Platform, You confirm that You have read, understood,
          and accepted this User Agreement. If You do not agree with any part
          of it, please stop using the Platform and do not proceed with any
          booking.
        </P>

        <h2>1. Definitions</h2>
        <ul>
          <li>
            <strong>"Services"</strong> means flight, hotel, holiday/tour,
            visa, MICE (meetings, incentives, conferences and exhibitions),
            concierge, and any other travel-related search, booking, or
            support service made available on the Platform.
          </li>
          <li>
            <strong>"Supplier"</strong> or <strong>"Service Provider"</strong>{" "}
            means the airline, hotel, DMC (destination management company),
            embassy/consulate, insurer, or other third party that actually
            performs or delivers a Service booked through the Platform.
          </li>
          <li>
            <strong>"Booking Voucher"</strong> means the confirmation
            document issued by Plumtrips evidencing a reservation with a
            Supplier.
          </li>
          <li>
            <strong>"Content"</strong> means all text, images, pricing,
            itineraries, software, and other material made available on the
            Platform.
          </li>
        </ul>

        <h2>2. Eligibility</h2>
        <P>
          You must be at least 18 years old and legally capable of entering
          into a binding contract to register on or transact through the
          Platform. By using the Platform You represent that You meet this
          requirement and that Your use of the Services complies with all
          applicable laws, including aviation, immigration, foreign-exchange,
          taxation, and sanctions regulations of India and of any country You
          intend to visit.
        </P>
        <P>
          If We discover that a User is a minor, or that any information
          given at registration is false, We may suspend or terminate that
          User's account and refuse further access to the Platform.
        </P>

        <h2>3. Account &amp; Security</h2>
        <P>
          Where registration is required, You must provide accurate and
          current information and keep it updated. You are responsible for
          maintaining the confidentiality of Your login credentials and for
          all activity that takes place under Your account, whether or not
          authorised by You. You must notify Us immediately at <Email /> if
          You suspect any unauthorised use of Your account.
        </P>
        <P>
          We use industry-standard measures to protect account and payment
          data, but no system is completely secure, and We cannot guarantee
          that a breach will never occur. You accept that transmitting
          information over the internet carries inherent risk.
        </P>

        <h2>4. Content &amp; Intellectual Property</h2>
        <P>
          All Content on the Platform, together with the Plumtrips name,
          logo, and other marks, is owned by or licensed to Plumtrips and is
          protected under applicable intellectual property law. Subject to
          Your eligibility to use the Platform, We grant You a limited,
          revocable, non-exclusive, non-transferable licence to access the
          Platform and to view, download, or print Content solely for Your
          personal, non-commercial travel-planning use.
        </P>
        <P>
          You may not copy, republish, distribute, sell, or otherwise
          commercially exploit any Content or Mark without Our prior written
          consent. Nothing in this Agreement transfers any ownership right in
          the Platform or its Content to You.
        </P>

        <h2>5. Booking &amp; Fulfilment; Role of Plumtrips</h2>
        <P>
          Except where We expressly act as a reseller of a specific product,
          Plumtrips acts as a facilitator connecting You with the relevant
          Supplier. The contract for travel, accommodation, transport, visa
          processing, or any other underlying service is between You and the
          Supplier, and that Supplier's own terms and conditions (including
          its cancellation and refund rules) will apply in addition to this
          Agreement.
        </P>
        <P>
          Prices, fares, and inventory displayed on the Platform are supplied
          by, or sourced from, the relevant Supplier and can change until a
          booking is fully paid for and confirmed. Names, dates of travel,
          passport, and other identity details entered at the time of
          booking must exactly match the corresponding travel documents;
          Plumtrips is not responsible for losses arising from a mismatch
          caused by information You supplied.
        </P>
        <P>
          A Booking Voucher or e-ticket will be issued only once payment has
          been successfully verified. Plumtrips does not guarantee the
          availability, quality, fitness for purpose, or standard of service
          of any Supplier, and any dispute concerning the actual delivery of
          a Service should, in the first instance, be raised with the
          Supplier directly; We will assist in escalating such disputes
          where reasonably possible.
        </P>

        <h2>6. Bookings by Trade Partners &amp; Travel Agents</h2>
        <P>
          Travel agents, tour operators, consolidators, or aggregators may
          not use the Platform for commercial resale unless they have
          separately registered with Plumtrips as a trade or B2B partner and
          received Our written permission to do so. Bookings made in breach
          of this clause may be cancelled by Us without notice, and any
          resulting loss will be borne solely by the agent responsible, not
          by Plumtrips.
        </P>

        <h2>7. Your Responsibilities</h2>
        <P>
          You are responsible for reviewing the description, fare rules, and
          cancellation policy of a Service before booking, and for complying
          with all conditions stated in the Booking Voucher. If You book on
          behalf of another traveller, You must ensure that traveller is made
          aware of, and agrees to, the relevant terms.
        </P>
        <P>
          Services are provided on an "as is" and "as available" basis. We
          may change the features of the Platform at any time without prior
          notice. No statement made by Plumtrips staff, whether oral or
          written, creates a warranty beyond what is expressly set out in
          this Agreement.
        </P>
        <P>
          By booking through the Platform, You authorise Plumtrips
          representatives to contact You by phone, SMS, WhatsApp, or e-mail
          regarding that booking, and this consent overrides any contrary
          preference recorded on the National Customer Preference Register
          or a similar registry, to the extent permitted by law.
        </P>

        <h2>8. Payments, Fees &amp; Taxes</h2>
        <P>
          In addition to the Supplier's charges, Plumtrips may levy a
          convenience fee, service fee, or concierge fee, which will be
          disclosed before You confirm payment. We reserve the right to
          revise these fees from time to time.
        </P>
        <P>
          If a booking is undercharged because of a technical error or any
          other reason, Plumtrips may recover the shortfall from You; if the
          shortfall is identified before the Service is used, We may cancel
          the booking if the balance is not paid in time.
        </P>
        <P>
          Any increase in price caused by a change in applicable taxes,
          duties, or government levies must be borne by You, even if such
          change is announced after booking and applied retrospectively,
          provided it is permitted under law.
        </P>
        <P>
          Where a booking is not confirmed for any reason, Plumtrips will
          refund the amount paid and is under no obligation to arrange an
          alternative booking. Refunds for cancellations are processed once
          received from the Supplier and, unless stated otherwise, are
          credited back to the original payment method. Where payments
          amounting to ₹25,000 or more are made in cash, a copy of Your PAN
          card will be required as per applicable law.
        </P>
        <P>
          Payments must only be made to bank accounts held in the name of
          Plumtrips. No Plumtrips employee or representative will ever ask
          You to transfer money to a personal account, or ask for Your card
          number, CVV, OTP, or net-banking password. If anyone claiming to
          represent Plumtrips makes such a request, please report it
          immediately to <Email /> — acting on it may make You a victim of
          fraud, and Plumtrips will not be liable for any resulting loss.
        </P>
        <P>
          Chargebacks and payment disputes must be raised in good faith.
          Plumtrips reserves the right to restrict the account of a User who
          repeatedly raises chargebacks that are later found to be
          unjustified.
        </P>

        <h2>9. Use of Your Contact Details</h2>
        <P>
          We will send booking confirmations, itinerary updates, payment and
          refund status, and schedule-change alerts via SMS, WhatsApp or
          similar messaging applications, voice call, or e-mail, using the
          details You provide at the time of booking. These communications
          are transactional in nature and sent at Your request; You agree
          that they do not constitute unsolicited commercial communication
          under applicable telecom regulations. You agree to indemnify
          Plumtrips against any complaint raised with a regulator arising
          from a wrong number or e-mail address supplied by You.
        </P>

        <h2>10. Insurance</h2>
        <P>
          Unless a specific product expressly includes insurance, obtaining
          adequate travel insurance is Your own responsibility. Where
          Plumtrips facilitates the sale of a third-party insurance product,
          We act only as a facilitator; the contract of insurance is between
          You and the insurer, and any claim must be pursued with the
          insurer directly.
        </P>

        <h2>11. Tax Collected at Source (TCS) &amp; Related Compliance</h2>
        <P>
          Bookings that qualify as an "overseas tour package" under Section
          206C(1G)(b) of the Income Tax Act, 1961 attract Tax Collected at
          Source at the applicable rate, over and above the package price.
          Plumtrips will deposit this amount with the Government and issue
          the relevant certificate to You.
        </P>
        <P>
          You must provide a valid PAN for every traveller on an overseas
          booking. Plumtrips may validate this PAN, including to check
          whether a traveller qualifies as a "Specified Person" under
          Section 206CCA, and may collect TCS at a correspondingly higher
          rate. If a valid PAN is not provided, or the traveller does not
          agree to pay the applicable TCS, Plumtrips may cancel the booking
          and process a refund in line with the applicable cancellation
          policy.
        </P>

        <h2>12. Liberalised Remittance Scheme (LRS) Compliance</h2>
        <P>
          For international bookings, RBI rules require Plumtrips to collect
          PAN details for compliance with the Liberalised Remittance Scheme.
          You confirm that the total foreign exchange purchased or remitted
          by You in the current financial year, across all sources, remains
          within the limit prescribed by the RBI. If this limit is breached
          before Your payment is approved by the remitting bank, Plumtrips
          may cancel the booking and process a refund as per the applicable
          cancellation policy.
        </P>

        <h2>13. Travel Documents &amp; Obligation to Obtain a Visa</h2>
        <P>
          You are responsible for holding valid travel documents, including
          passport, visa, and any transit or "OK to board" clearance
          required for Your itinerary. Plumtrips is not liable for any
          inability to travel arising from a missing or rejected visa, and
          no refund is payable on that basis beyond what the relevant
          Supplier's cancellation policy allows, even where Plumtrips has
          separately assisted with the visa application (see Part B, Section
          4).
        </P>

        <h2>14. Force Majeure</h2>
        <P>
          Plumtrips and its Suppliers may be unable to honour a confirmed
          booking due to circumstances beyond reasonable control, including
          natural disasters, epidemics or pandemics, strikes, government
          action, terrorism, or technical failures. Where We become aware of
          such a situation in advance, We will make reasonable efforts to
          offer an alternative or process a refund of amounts actually
          recovered from the Supplier. Plumtrips will not be liable for
          indirect, incidental, or consequential loss arising from such
          events.
        </P>

        <h2>15. Third-Party Links &amp; Advertisers</h2>
        <P>
          The Platform may contain links to, or advertisements from,
          third-party websites that Plumtrips does not control. We are not
          responsible for the content, accuracy, or practices of such sites,
          and any transaction You enter into with a linked third party is at
          Your own risk. Inclusion of a link does not imply Our endorsement
          of that site or its operator.
        </P>

        <h2>16. Our Right to Refuse or Suspend Access</h2>
        <P>
          Plumtrips may, at its discretion, decline a booking, withhold
          confirmed details until full payment is received, or suspend or
          terminate a User's access to the Platform where the User breaches
          this Agreement, where We cannot verify information provided, or
          where We reasonably believe the User's conduct may create
          liability for Plumtrips or another User. A suspended User may not
          attempt to re-register under different credentials without Our
          consent.
        </P>
        <P>
          You must not send Plumtrips, or communicate on the Platform, any
          content that is abusive, threatening, defamatory, obscene,
          unlawful, or otherwise objectionable. A Supplier may separately
          refuse to provide a Service to You (for example, on grounds of
          conduct, safety, or a government order); such refusal is outside
          Plumtrips' control, and any resulting claim must be pursued
          against the Supplier.
        </P>

        <h2>17. Our Right to Cancel a Booking</h2>
        <P>
          If Plumtrips discovers that information supplied for a booking is
          incorrect, that a booking is unauthorised, or that a fact has been
          misrepresented, We may cancel the booking without prior notice and
          will not be responsible for any resulting loss. We will likewise
          cancel a booking if directed to do so by a court, regulator, or
          investigating authority, without approaching You first.
        </P>

        <h2>18. Conduct on the Platform</h2>
        <ul>
          <li>
            Do not scrape, data-mine, or systematically extract Content from
            the Platform.
          </li>
          <li>
            Do not attempt to bypass rate limits, security features, or
            access controls.
          </li>
          <li>
            Do not impersonate another person, misuse promotional offers, or
            attempt fraud.
          </li>
          <li>
            Do not use the Platform for any unlawful purpose or in a manner
            that disrupts its operation.
          </li>
          <li>
            Respect the rules of Suppliers and venues (dress codes, safety
            briefings, check-in requirements, and similar conditions) when
            availing a Service.
          </li>
        </ul>

        <h2>19. Fraud Alerts &amp; Grievance Redressal</h2>
        <P>
          If You believe You have been contacted by someone falsely claiming
          to represent Plumtrips, or asked for sensitive payment
          information, please write to <Email /> immediately.
        </P>
        <P>
          If You are dissatisfied with the resolution of a complaint, You
          may escalate it to Our Grievance Officer, who will endeavour to
          address the concern within 30 days of escalation. Please quote
          Your booking reference and any prior ticket number when
          escalating.
        </P>
        <P>
          Grievance Officer contact details are available on request at{" "}
          <Email />, in compliance with the Information Technology Act, 2000
          and the Consumer Protection (E-Commerce) Rules, 2020.
        </P>

        <h2>20. Disclaimers &amp; Limitation of Liability</h2>
        <P>
          The Platform and the Services are provided "as is" and "as
          available." To the maximum extent permitted by law, Plumtrips
          disclaims all implied warranties, including merchantability and
          fitness for a particular purpose, and does not warrant that the
          Platform will operate uninterrupted or error-free.
        </P>
        <P>
          Save where caused by Our fraud or wilful default, Plumtrips'
          aggregate liability for any claim arising out of or in connection
          with a booking is limited to the amount actually paid by You to
          Plumtrips for the affected Service. Plumtrips is not liable for
          indirect, incidental, special, or consequential loss, including
          loss of profit, data, or opportunity.
        </P>

        <h2>21. Indemnification</h2>
        <P>
          You agree to indemnify and hold Plumtrips, its officers,
          directors, and employees harmless from any loss, liability,
          claim, or expense (including reasonable legal fees) arising out of
          Your breach of this Agreement, misuse of the Services, or
          violation of any applicable law or third-party right.
        </P>

        <h2>22. Governing Law &amp; Jurisdiction</h2>
        <P>
          This Agreement is governed by the laws of India. Subject to any
          mandatory consumer-protection forum available to You, the courts
          at Gurugram, Haryana shall have exclusive jurisdiction over any
          dispute arising out of or in connection with this Agreement.
          Where reasonably possible, Plumtrips will first attempt to resolve
          a dispute amicably or through mediation before litigation.
        </P>

        <h2>23. Changes to this Agreement</h2>
        <P>
          We may revise this Agreement from time to time by posting an
          updated version on the Platform with a new "Last updated" date.
          Continued use of the Platform after a revision takes effect
          constitutes Your acceptance of the updated terms; it is Your
          responsibility to review this page periodically.
        </P>

        <h2>24. Severability &amp; Miscellaneous</h2>
        <P>
          If any provision of this Agreement is found invalid or
          unenforceable, the remaining provisions continue in full force.
          Our failure to enforce a provision is not a waiver of Our right to
          do so later. Nothing in this Agreement creates a partnership,
          joint venture, or employment relationship between You and
          Plumtrips.
        </P>

        <h2>25. Contact Us</h2>
        <P>
          For questions about this Agreement or the Services, write to us at{" "}
          <Email />.
        </P>

        <P><strong>B. TERMS OF SERVICE</strong></P>
        <P>
          The following service-specific terms apply in addition to Part A
          whenever You book the corresponding Service. Where a term below
          conflicts with Part A for that specific Service, this Part B
          prevails.
        </P>

        <h2>1. Flights</h2>
        <P>
          Flight tickets booked through Plumtrips are subject to the fare
          rules, baggage policy, and cancellation terms of the operating
          airline. Plumtrips acts solely as a facilitator; the contract of
          carriage is between You and the airline, which retains full
          discretion to reschedule, delay, or cancel a flight without prior
          reference to Plumtrips.
        </P>
        <P>
          Where a flight involves a code-share arrangement, this will be
          disclosed to You before payment, to the extent the operating
          airline has disclosed it to Us. Displayed fares include base fare,
          applicable government taxes, and Our convenience fee; some fares
          are "hand-baggage only" and check-in baggage must be purchased
          separately from the airline.
        </P>
        <P>
          Infant fares apply only where the child remains under 24 months
          for the entire itinerary, including the return sector; a separate
          child fare must be booked if the infant turns 24 months before the
          return journey. If You fail to take the onward sector of an
          itinerary, the airline may automatically cancel the remaining
          sectors of that PNR; Plumtrips has no control over this and is not
          obliged to arrange an alternative.
        </P>
        <P>
          Refunds are processed once received from the airline, and Our
          service fee and convenience fee are non-refundable. Please inform
          Us promptly of any cancellation made directly with the airline so
          that We can initiate a refund on Our end.
        </P>

        <h2>2. Hotels &amp; Homestays</h2>
        <P>
          Plumtrips provides a platform to search and book hotels,
          homestays, and similar accommodation ("Hotel"). Hotel
          descriptions, images, and amenity lists are supplied by the
          property itself; any discrepancy between the listing and the
          actual property should be raised with the hotel directly.
        </P>
        <P>
          The hotel retains sole discretion over admission, including
          requiring valid identity proof at check-in and applying its own
          policies regarding unmarried or unrelated guests, or local
          residents. Where a confirmed booking is denied at check-in due to
          overbooking or a similar hotel-side issue, Our liability is
          limited to arranging a comparable alternative where possible, or
          refunding the amount paid; the primary guest must be at least 18
          years old.
        </P>
        <P>
          Bookings may be "Prepaid" (full amount collected at booking) or
          "Pay at Hotel" (collected by the property at check-in); incidental
          charges such as room service, minibar, or laundry are payable
          directly to the hotel and are not part of the amount collected by
          Plumtrips.
        </P>

        <h2>3. Holiday Packages, Tours &amp; MICE</h2>
        <P>
          Package holidays and MICE (meetings, incentives, conferences and
          exhibitions) programmes are put together using hotels, transport,
          activities, and local representatives who are independent
          contractors, not employees of Plumtrips. Plumtrips is not liable
          for the standard of service delivered by any such independent
          contractor, though We will assist in escalating a genuine
          complaint.
        </P>
        <P>
          Itineraries shared before booking are proposals and may change
          based on supplier or government-imposed availability; the
          confirmed itinerary and vouchers issued after full payment are
          final. A booking fee paid at the time of reservation is typically
          non-refundable. Cancellation charges rise as the date of
          departure approaches and will be communicated at the time of
          booking or in the applicable brochure; where no specific schedule
          is given, standard charges range from the booking fee alone (45+
          days before departure) up to the full package cost (within 7 days
          of departure or for a no-show).
        </P>
        <P>
          Where the package price changes due to currency fluctuation, fuel
          surcharge, or a supplier-imposed increase before departure, the
          difference must be paid by You before travel. It is a condition of
          booking a package holiday that You hold adequate travel insurance.
        </P>

        <h2>4. Visa Services</h2>
        <P>
          Plumtrips facilitates visa applications by collecting the
          documents You provide and forwarding them to the relevant
          embassy, consulate, or an appointed visa-processing partner. The
          decision to grant or refuse a visa rests entirely with the
          concerned authority; Plumtrips does not offer visa or immigration
          advice and makes no representation about the likelihood of
          approval.
        </P>
        <P>
          You are responsible for the accuracy and genuineness of documents
          submitted; Plumtrips does not independently verify them. Our
          service fee for visa facilitation is non-refundable even if the
          application is ultimately withdrawn or refused; embassy fees and
          any third-party charges follow the refund policy of the relevant
          authority, which Plumtrips does not control.
        </P>

        <h2>5. Concierge Services</h2>
        <P>
          Our concierge service covers bespoke requests such as itinerary
          curation, restaurant or event bookings, and on-trip assistance.
          Where a concierge request results in a booking with a third-party
          Supplier, that booking is subject to this Part B and to the
          Supplier's own terms. Concierge requests are handled on a
          best-efforts basis and are subject to third-party availability,
          which Plumtrips cannot guarantee.
        </P>

        <h2>6. Cancellations &amp; Refunds - General</h2>
        <P>
          All changes and cancellations are governed first by the fare,
          rate, or package rules of the relevant Supplier, and second by Our
          published Cancellation &amp; Refund Policy at{" "}
          <a href="https://plumtrips.com/cancellation-and-refund">
            plumtrips.com/cancellation-and-refund
          </a>
          . Certain fares and packages are marked non-refundable or
          non-changeable at the time of booking; a no-show ordinarily
          forfeits the full value paid. Refund timelines depend on how
          quickly the Supplier processes the refund to Plumtrips, and We
          will pass on funds received without unreasonable delay.
        </P>

        <P><strong>C. CONTACT</strong></P>
        <P>Plumtrips</P>
        <P>
          Email: <Email />
        </P>
        <P>Governing law: India - Courts at Gurugram, Haryana</P>
      </main>
    </>
  );
}