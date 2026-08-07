import type { ReactNode } from "react";

/**
 * Plumtrips.com — Privacy Policy
 * Same content & order as the original document. Typeface: Poppins.
 */

const SUPPORT_EMAIL = "hello@plumtrips.com";
const GRIEVANCE_EMAIL = "grievance@plumtrips.com";
const SUPPORT_PHONE_DISPLAY = "+91 70659 32396";
const SUPPORT_PHONE_TEL = "+917065932396";

// Fixed on purpose — bump this string manually when the policy actually changes.
const LAST_UPDATED = "6 August 2026";

const INK = "#1a1a1a";
const MUTED = "#5b5b5b";
const LINK = "#00477f";

const fontImport = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
`;

function P({ children }: { children: ReactNode }) {
  return <p style={{ margin: "0 0 12px" }}>{children}</p>;
}

function NumItem({ children }: { children: ReactNode }) {
  return <p style={{ margin: "0 0 12px", marginLeft: 8 }}>{children}</p>;
}

function Email({ address = SUPPORT_EMAIL }: { address?: string }) {
  return (
    <a href={`mailto:${address}`} style={{ color: LINK }}>
      {address}
    </a>
  );
}

export default function PrivacyPage() {
  return (
    <>
      <style>{`
        ${fontImport}
        .privacy-doc, .privacy-doc * { box-sizing: border-box; }
        .privacy-doc {
          font-family: 'Poppins', Arial, sans-serif;
          color: ${INK};
          background-color: #ffffff;
          margin: 0 auto;
          width: 100%;
          max-width: 1100px;
          padding: 48px 60px 80px;
          line-height: 1.7;
        }
        .privacy-doc h1 {
          font-size: 1.9rem;
          font-weight: 600;
          margin: 0 0 4px;
          letter-spacing: -0.01em;
        }
        .privacy-doc .meta {
          color: ${MUTED};
          font-size: 0.9rem;
          margin-bottom: 32px;
        }
        .privacy-doc h2 {
          font-size: 1.15rem;
          font-weight: 600;
          margin-top: 34px;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid #e5e7eb;
          color: #00325a;
        }
        .privacy-doc p {
          font-size: 0.98rem;
          margin: 0 0 12px;
        }
        .privacy-doc p.subhead {
          font-weight: 600;
          margin-top: 14px;
          margin-bottom: 4px;
        }
        .privacy-doc ul {
          margin: 0 0 14px;
          padding-left: 1.7em;
        }
        .privacy-doc li {
          font-size: 0.98rem;
          margin-bottom: 6px;
        }
        .privacy-doc a {
          color: ${LINK};
        }
        .privacy-doc strong {
          font-weight: 600;
        }
        @media (max-width: 900px) {
          .privacy-doc { padding: 36px 32px 60px; }
        }
        @media (max-width: 600px) {
          .privacy-doc { font-size: 0.95em; padding: 28px 16px 56px; }
          .privacy-doc h1 { font-size: 1.5em; }
        }
      `}</style>

      <main className="privacy-doc">
        <h1>PRIVACY POLICY</h1>
        <div className="meta">
          Plumtrips.com
          <br />
          Last updated: {LAST_UPDATED}
        </div>

        <h2>A. INTRODUCTION</h2>
        <P>
          Plumtrips.com ("Plumtrips," "the Platform," "we," "us," or "our")
          is a brand and website operated by Peachmint Trips and Planners
          Private Limited ("Peachmint," "the Company"), recognised as a data
          fiduciary under applicable law. We recognise the importance of the
          privacy of our users and are committed to maintaining the
          confidentiality of the information they share with us.
        </P>
        <P>
          This Privacy Policy sets out our practices for handling and
          securing the personal information ("Personal Information," defined
          in Section C below) of any person who purchases, intends to
          purchase, or enquires about any product or service made available
          by Plumtrips through any of our customer interface channels,
          including our website, mobile site, mobile app, and offline
          channels including call centres and offices (collectively, "Sales
          Channels" or "the Platform").
        </P>
        <P>
          For the purposes of this Policy, "you" or "your" means the User,
          and "we," "us," or "our" means Plumtrips. "Website" means our
          website(s), mobile site(s), and mobile application(s).
        </P>
        <P>
          By using or accessing the Website or other Sales Channels, you
          agree to the terms of this Privacy Policy. If you disagree with
          this Policy, please do not use or access our Website or other
          Sales Channels.
        </P>
        <P>
          This Privacy Policy does not apply to any third-party websites,
          mobile sites, or mobile apps, even where they are linked to or
          from our Website. The privacy practices of our business partners,
          advertisers, sponsors, or other linked sites may differ materially
          from this Policy, and we recommend you review their respective
          privacy statements independently.
        </P>
        <P>
          This Privacy Policy is an integral part of your User Agreement
          with Plumtrips, and capitalised terms used but not defined here
          carry the meaning given to them in the User Agreement.
        </P>
        <P>
          This Policy is drafted with reference to the Digital Personal Data
          Protection Act, 2023 ("DPDP Act"), the Information Technology Act,
          2000 and rules made thereunder (including the IT Rules, 2021),
          and, for users outside India, the General Data Protection
          Regulation ("GDPR") and other applicable data protection laws.
        </P>

        <h2>B. USERS OUTSIDE THE GEOGRAPHICAL LIMITS OF INDIA</h2>
        <P>
          Data shared with Plumtrips is primarily processed in India and in
          such other jurisdictions where a third party engaged by us may
          process data on our behalf. By agreeing to this Policy, you
          provide your explicit consent to such processing for the purposes
          described herein. Data protection regulations in India, or in
          these other jurisdictions, may differ from those of your country
          of residence.
        </P>
        <P>
          If you have concerns about the processing of your data and wish to
          withdraw consent, you may write to us at <Email />. However, if
          such processing is essential for us to provide a service to you,
          we may not be able to serve or confirm your bookings after
          withdrawal. For instance, where you make a booking, certain
          information such as your contact details, dietary preferences,
          room preferences, or any medical condition requiring specific
          attention may need to be shared with our vendors so they can make
          suitable arrangements for you during your trip.
        </P>
        <P>A withdrawal of consent may therefore:</P>
        <ul>
          <li>
            severely inhibit our ability to serve you properly, such that we
            may have to refuse the booking altogether; or
          </li>
          <li>
            unreasonably restrict our ability to service a booking already
            made, which may affect your trip or compel us to cancel it.
          </li>
        </ul>

        <h2>C. TYPE OF INFORMATION WE COLLECT AND ITS LEGAL BASIS</h2>
        <P>
          The information detailed below is collected so that we can
          provide the services you have chosen, and to fulfil our legal
          obligations and our obligations to third parties under our User
          Agreement.
        </P>
        <P>
          "Personal Information" of a User includes information shared by
          the User and collected by us for the following purposes:
        </P>
        <NumItem>
          1. Registration on the Website: information you provide while
          subscribing to or registering with us, including your personal
          identity (name, gender, marital status, religion, age, date of
          birth, profile picture, etc.) and contact details (email address,
          postal address, frequent flyer number, telephone/fax numbers).
          This may also include banking details (including credit/debit
          card information), and any other information relating to your
          income, lifestyle, billing, or payment history, as shared by you.
        </NumItem>
        <NumItem>
          2. Other information we may collect, including but not limited
          to:
        </NumItem>
        <ul>
          <li>
            Transactional history (other than banking details) about your
            activity and buying behaviour on the Platform.
          </li>
          <li>
            Your usernames, passwords, email addresses, and other
            security-related information used in connection with our
            Services.
          </li>
          <li>
            Data created by you or a third party that you wish to store on
            our servers, such as image files or documents.
          </li>
          <li>
            Data available in the public domain, or received from a third
            party, including linked social media channels (name, email
            address, friend list, profile picture, or other information
            permitted by your account settings).
          </li>
          <li>
            Information about any other traveller(s) for whom you make a
            booking through your account. By providing this information,
            you confirm that each such traveller has agreed to have their
            information disclosed to us and shared with the relevant
            service provider(s).
          </li>
          <li>
            If you request visa assistance from us: copies of your
            passport, bank statements, completed visa application forms,
            photographs, and any other information required by the
            relevant embassy to process your application.
          </li>
          <li>
            For international bookings, and in compliance with the Reserve
            Bank of India's Liberalized Remittance Scheme (LRS) or other
            applicable law, your PAN details, passport number, or other
            information required by the service provider. If you do not
            wish to provide this, we may be unable to process the booking.
            We will never share your PAN details without your consent,
            unless required by law enforcement, court order, or other legal
            process.
          </li>
          <li>
            If you opt for contactless check-in at hotels: copies of
            government identification (Aadhaar, driving licence, election
            card, etc.), a self-declaration, and information such as date
            of birth, origin/destination of travel, and place of residence
            that the hotel requires to honour your booking.
          </li>
          <li>
            Any health, dietary, accessibility, or medical information you
            choose to share with us so we, or our vendors, can make
            suitable travel arrangements for you.
          </li>
        </ul>
        <P>
          Information collected under this Section is used strictly for the
          specified, lawful purpose for which it was collected. We may
          share it with the end service provider or another third party
          solely to provide and facilitate your booking. We redact
          sensitive or confidential information contained in identity
          documents, bank statements, or similar submissions wherever it is
          not needed for the relevant purpose. If you decline to provide
          requested information, or ask us to delete information already
          provided, we may be unable to process the relevant booking
          request. We will never share PAN, passport, or Aadhaar details
          you have provided without your prior consent, unless required by
          law enforcement, court order, or other legal process.
        </P>
        <P>
          Under the DPDP Act, we treat the above documents (passport, PAN,
          Aadhaar, and other government identifiers, and any health
          information you share) as Sensitive Personal Data, collected and
          processed only under explicit consent or another lawful ground
          permitted by the Act.
        </P>

        <h2>D. HOW WE USE YOUR PERSONAL INFORMATION</h2>
        <P>
          While making a booking: we use your Personal Information,
          including payment details (cardholder name, encrypted card number
          and expiry, banking or wallet details) that you have shared and
          allowed us to store, and traveller information linked to your
          account, to help you complete your booking efficiently.
        </P>
        <P>We may also use your Personal Information to:</P>
        <ul>
          <li>confirm your reservations with the relevant service providers;</li>
          <li>keep you informed of your transaction status;</li>
          <li>
            send booking confirmations via SMS, WhatsApp, email, or other
            messaging services;
          </li>
          <li>send updates or changes to your booking(s);</li>
          <li>
            allow our customer service team to contact you where necessary;
          </li>
          <li>
            customise the content of our website, mobile site, and mobile
            app;
          </li>
          <li>
            request reviews of our products or services, or ask how we can
            improve;
          </li>
          <li>send verification messages or emails;</li>
          <li>
            validate and authenticate your account, and prevent misuse or
            abuse;
          </li>
          <li>
            contact you on your birthday or anniversary with a relevant
            offer, where you have not opted out.
          </li>
        </ul>
        <P>
          Surveys: We value the opinions of our Users and may conduct
          surveys, online or offline. Participation is entirely optional.
          Responses are typically aggregated and used to improve the
          Website, our Sales Channels, and our services, and to develop
          features and promotions. Survey participants remain anonymous
          unless the survey states otherwise.
        </P>
        <P>
          Marketing promotions, research, and programmes: These help us
          understand your preferences and improve your experience. We may
          run promotions offering travel-related prizes; Personal
          Information collected for such activities may include your
          contact details and survey responses, used to notify winners and
          to develop future promotions. As a registered User, you may
          occasionally receive updates about fare sales, special offers,
          new services, or other benefits relevant to you, as well as
          periodic newsletters and exclusive deals.
        </P>
        <P>
          Where we introduce new or enhanced services, we will use the
          Personal Information you provide to deliver the specific service
          requested — for example, using your email address and query
          details to respond if you write to us.
        </P>
        <P>
          Reward or loyalty programmes: If we launch a rewards programme, we
          may use your Personal Information to enrol you and track your
          status. If you win a reward, we may share relevant Personal
          Information with a third party responsible for fulfilling it. You
          may opt out of reward programmes by writing to us. We may also
          verify customer information, including credit information, for
          fraud detection or to offer bookings on credit, and may share
          anonymised or aggregated data with a third party engaged to
          perform tasks such as payment processing, data hosting, or
          assessing creditworthiness.
        </P>

        <h2>E. HOW LONG WE KEEP YOUR PERSONAL INFORMATION</h2>
        <P>
          We retain your Personal Information for as long as is reasonably
          necessary for the purposes set out in this Policy. In some cases
          we retain it for longer, where required by legal, regulatory,
          tax, or accounting obligations. Where your data is no longer
          required, we ensure it is securely deleted or stored in a manner
          that means it will no longer be used by the business. You may
          delete your account and associated data at any time by writing to{" "}
          <Email />.
        </P>
        <P>
          Passport, visa, PAN, Aadhaar, and other identity documents are
          retained only for the period legally mandated or operationally
          necessary for the relevant booking or compliance purpose, and are
          then securely deleted or anonymised, subject to any applicable
          legal hold.
        </P>

        <h2>F. COOKIES AND SESSION DATA</h2>
        <P>
          Cookies: We use cookies to personalise your experience on the
          Website and the advertisements shown to you, in line with
          standard industry practice. Cookies are small pieces of
          information stored by your browser on your device. They let us
          serve you more efficiently — for example, keeping you signed in
          without re-entering your username each time — and may be used to
          display offers or destination-related content relevant to your
          interests.
        </P>
        <P>
          Cookies may also be placed by our advertising servers or
          third-party advertising companies, to track the effectiveness of
          advertising and to use aggregated, anonymous statistics about
          your visits to serve you more relevant ads on our Website or
          elsewhere. This is typically done using pixel tags, an
          industry-standard technology. No Personal Information is
          collected through this process, and the data gathered cannot on
          its own be linked back to identify you.
        </P>
        <P>
          You can control or disable cookies through your browser settings.
          Blocking our cookies may disable certain features of the Website
          and affect your experience; you can also choose to block cookies
          from specific sites while permitting others you trust.
        </P>
        <P>
          Automatic logging of session data: Each time you access the
          Website, session data is logged, including your IP address,
          operating system, browser type, and activity on the Website. We
          use this to analyse usage patterns, diagnose server issues, and
          better administer our systems. This information does not on its
          own identify you personally, though it may reveal your internet
          service provider or approximate geographic location.
        </P>

        <h2>G. WITH WHOM YOUR PERSONAL INFORMATION IS SHARED</h2>
        <P>
          Service providers and suppliers: Your information is shared with
          the end service providers — airlines, hotels, bus operators, cab
          rental companies, railways, or other suppliers — responsible for
          fulfilling your booking. By booking with us, you authorise this
          sharing. We do not authorise these providers to use your
          information beyond fulfilling their part of the service; however,
          once shared, they process your Personal Information as
          independent data controllers, and how they use it is outside our
          control. We recommend reviewing the privacy policies of any
          service provider or supplier whose services you use.
        </P>
        <P>
          We do not sell or rent your name or other Personal Information to
          third parties, except where shared with business or alliance
          partners engaged to provide referral services, or to share
          promotional benefits with you based on your booking history.
        </P>
        <P>
          Companies in the same group: To improve personalisation and
          service efficiency, we may, under controlled and secure
          conditions, share your Personal Information with our affiliate or
          associate entities, to inform you about relevant products and
          services or to help address questions about your bookings. If our
          assets are acquired, or as part of a business restructuring,
          sale, or transfer, your Personal Information may be transferred
          to the acquiring or resulting entity as part of that transaction.
        </P>
        <P>
          Business partners and third-party vendors: We may share filtered
          Personal Information with corporate affiliates or business
          partners who may offer you products or services intended to
          improve your travel experience — for example, providers of
          co-branded credit cards, travel insurance, or wallet/loss cover.
          If you choose to take up such an offer, that provider's own
          privacy policy will govern the relationship. We may also engage
          third parties to perform tasks on our behalf, including payment
          processing, data hosting, and data processing.
        </P>
        <P>
          We use non-identifiable Personal Information, in aggregate or
          anonymised form, to improve our services through statistical
          analysis of customer behaviour, and may share anonymous
          statistical information with suppliers, advertisers, affiliates,
          and other business partners. Such aggregated data is our property
          and may be used at our discretion for legitimate business
          purposes.
        </P>
        <P>
          Where we engage a third party for market research or surveys, we
          provide information to them under confidentiality agreements, for
          use solely on the specific project, and in compliance with
          applicable regulations.
        </P>
        <P>
          Disclosure of information: In addition to the above, we may
          disclose your Personal Information where required by law, by an
          enforcement authority for investigation, by court order, or in
          reference to a legal process; to conduct our business; for
          regulatory, compliance, or audit purposes; to secure our systems;
          or to enforce or protect the rights or property of Plumtrips, its
          affiliates, employees, or officers, including where we believe
          disclosure is necessary to address interference with our rights
          or property, or to prevent harm to any person. Such disclosure
          may occur without your knowledge where legally permitted, and we
          will not be liable for damages arising from disclosure made in
          good faith under this Section.
        </P>

        <h2>H. USER-GENERATED CONTENT</h2>
        <P>
          We may allow Users to post reviews, ratings, and responses to
          poll questions, or to ask and answer questions about our
          services. We may also engage a third party to contact you for
          feedback about a recent booking. Participation is optional,
          though you may receive messages inviting you to share a review or
          respond to others. Reviews may be written or in video format, and
          may also appear on other travel-related platforms.
        </P>
        <P>
          User-generated content we collect may include reviews and
          ratings, questions and answers, and poll responses. Users who
          post such content will have a profile, visible to other Users,
          showing details such as the number of trips taken, reviews
          written, and questions asked or answered.
        </P>

        <h2>I. HOW YOU CAN OPT OUT OF PROMOTIONAL COMMUNICATIONS</h2>
        <P>
          You may occasionally receive email updates about fare sales,
          special offers, new services, and other items we think may
          interest you. If you would prefer not to receive these, click
          "unsubscribe" in any message, or follow the instructions
          provided, or write to <Email />.
        </P>

        <h2>J. PERMISSIONS REQUESTED BY OUR MOBILE APPLICATION</h2>
        <P>
          When you install the Plumtrips app, it may request the
          permissions described below to function effectively. This list
          reflects the categories of permissions common to travel booking
          apps; please refer to the in-app permissions screen for the exact
          list requested on your device, as this may vary by platform and
          app version.
        </P>
        <ul>
          <li>
            Device &amp; app information: to identify your device, OS, and
            app version, so we can optimise your booking experience and
            diagnose issues.
          </li>
          <li>
            Location: to auto-fill your nearest airport or city, recommend
            nearby hotels, and determine your time zone for international
            travel.
          </li>
          <li>
            Camera: to let you upload a profile picture, submit photo or
            video reviews, and scan QR codes for payments.
          </li>
          <li>
            Contacts: if you allow this, to enable sharing bookings with
            friends or sending referral invitations; this information is
            stored on our servers and synced from your device.
          </li>
          <li>
            SMS: to auto-fill OTPs during payment and validate your mobile
            number, and to notify you of PNR status.
          </li>
          <li>
            Notifications: to send booking confirmations, offers, and
            travel alerts to your device.
          </li>
          <li>
            Calendar: to add your travel itinerary to your device calendar,
            where you choose to do so.
          </li>
          <li>
            Photos/media/storage: to save map data locally for a smoother,
            low-bandwidth map experience, and to let you upload images for
            reviews.
          </li>
        </ul>
        <P>
          We will never request a permission that is not genuinely required
          for a feature you use, and most permissions can be managed or
          revoked from your device settings at any time; doing so may
          disable the related feature.
        </P>

        <h2>K. HOW WE PROTECT YOUR PERSONAL INFORMATION</h2>
        <P>
          All payments on the Website are secured using TLS (Transport
          Layer Security) encryption, which encrypts your data before it is
          transmitted to us. We maintain security measures designed to
          protect against the loss, misuse, and unauthorised alteration of
          information under our control, including the use of secure
          servers when you access or change your account information. Once
          in our possession, your information is protected under strict
          security guidelines against unauthorised access.
        </P>

        <h2>L. WITHDRAWAL OF CONSENT AND PERMISSIONS</h2>
        <P>
          You may withdraw your consent to provide any or all Personal
          Information, or decline any permission described in this Policy,
          at any time. Doing so may limit your access to the Website or our
          ability to provide certain services to you. You may withdraw
          consent by writing to <Email />.
        </P>

        <h2>M. YOUR RIGHTS AS A DATA PRINCIPAL</h2>
        <P>Subject to applicable law, you have the right to:</P>
        <ul>
          <li>
            Access the Personal Information we hold about you, largely
            available directly through your account; if you do not have an
            account, write to <Email />.
          </li>
          <li>
            Correct or update your Personal Information, or delete it
            (except certain mandatory fields), directly from your account
            or by writing to us.
          </li>
          <li>
            Request erasure of your data, subject to legal and regulatory
            retention requirements.
          </li>
          <li>
            Withdraw consent at any time where processing is
            consent-based, without affecting the lawfulness of processing
            already carried out.
          </li>
          <li>
            Object to processing based on our legitimate interests, and opt
            out of marketing communications at any time.
          </li>
          <li>
            Nominate another individual to exercise these rights on your
            behalf in the event of your death or incapacity, once this
            mechanism is notified under the DPDP Act.
          </li>
          <li>
            Seek grievance redressal regarding our handling of your
            Personal Information (Section P), and, where applicable,
            approach the Data Protection Board of India.
          </li>
        </ul>

        <h2>N. DATA BREACH NOTIFICATION</h2>
        <P>
          In the event of a personal data breach likely to affect your
          rights or pose a significant risk, we will notify affected Users
          and, where required under the DPDP Act, the Data Protection
          Board of India, without undue delay.
        </P>

        <h2>O. ELIGIBILITY TO TRANSACT WITH PLUMTRIPS</h2>
        <P>
          You must be at least 18 years of age to transact directly with us
          and to consent to the processing of your Personal Information.
        </P>
        <P>
          Our Services are not directed at children. Where data relating to
          a minor (under 18) is required for a booking — for example, a
          child travelling with family — we collect and process it only
          with the consent and involvement of a parent or legal guardian,
          and solely to the extent necessary for that booking or legal
          compliance. If we learn that a child's data has been processed
          without valid guardian consent, we will delete it.
        </P>

        <h2>P. GRIEVANCE OFFICER</h2>
        <P>
          In accordance with the Information Technology Act, 2000, the IT
          Rules, 2021, and the DPDP Act, complaints or concerns about this
          Policy or our handling of your Personal Information may be
          directed to:
        </P>
        <P>Grievance Officer</P>
        <P>
          Peachmint Trips and Planners Private Limited (operating the brand
          "Plumtrips.com")
        </P>
        <p className="subhead">
          Registered Address: Vatika Business Park, Gurugram, Haryana
        </p>
        <p className="subhead">
          Email: <Email address={GRIEVANCE_EMAIL} />
        </p>
        <P>
          The Grievance Officer will acknowledge your complaint within 24
          hours and endeavour to resolve it within 15 days of receipt, or
          within such shorter period as applicable law may require.
        </P>

        <h2>Q. CHANGES TO THIS PRIVACY POLICY</h2>
        <P>
          We reserve the right to revise this Privacy Policy from time to
          time to suit legal, business, or customer requirements. We will
          notify Users as may be necessary, and will update the "Last
          updated" date at the top of this page. You are advised to review
          this Policy periodically.
        </P>
        <P>
          You may always submit concerns regarding this Privacy Policy by
          emailing <Email />. We will endeavour to respond to all
          reasonable concerns and enquiries.
        </P>

        <h2>R. CONTACT US</h2>
        <P>Plumtrips.com</P>
        <p className="subhead">
          Email: <Email />
        </p>
        <p className="subhead">
          Phone:{" "}
          <a href={`tel:${SUPPORT_PHONE_TEL}`} style={{ color: LINK }}>
            {SUPPORT_PHONE_DISPLAY}
          </a>
        </p>
      </main>
    </>
  );
}