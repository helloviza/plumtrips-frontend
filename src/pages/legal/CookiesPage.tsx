import type { ReactNode } from "react";

/**
 * Plumtrips.com — Cookies Policy
 * Same content & order as the original document. Typeface: Poppins.
 */

const SUPPORT_EMAIL = "hello@plumtrips.com";
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

function Email() {
  return (
    <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: LINK }}>
      {SUPPORT_EMAIL}
    </a>
  );
}

export default function CookiesPage() {
  return (
    <>
      <style>{`
        ${fontImport}
        .cookies-doc, .cookies-doc * { box-sizing: border-box; }
        .cookies-doc {
          font-family: 'Poppins', Arial, sans-serif;
          color: ${INK};
          background-color: #ffffff;
          margin: 0 auto;
          width: 100%;
          max-width: 1100px;
          padding: 48px 60px 80px;
          line-height: 1.7;
        }
        .cookies-doc h1 {
          font-size: 1.9rem;
          font-weight: 600;
          margin: 0 0 4px;
          letter-spacing: -0.01em;
        }
        .cookies-doc .meta {
          color: ${MUTED};
          font-size: 0.9rem;
          margin-bottom: 32px;
        }
        .cookies-doc h2 {
          font-size: 1.15rem;
          font-weight: 600;
          margin-top: 34px;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 1px solid #e5e7eb;
          color: #00325a;
        }
        .cookies-doc p {
          font-size: 0.98rem;
          margin: 0 0 12px;
        }
        .cookies-doc p.subhead {
          font-weight: 600;
          margin-top: 14px;
          margin-bottom: 4px;
        }
        .cookies-doc ul {
          margin: 0 0 14px;
          padding-left: 1.7em;
        }
        .cookies-doc li {
          font-size: 0.98rem;
          margin-bottom: 6px;
        }
        .cookies-doc a {
          color: ${LINK};
        }
        .cookies-doc strong {
          font-weight: 600;
        }
        @media (max-width: 900px) {
          .cookies-doc { padding: 36px 32px 60px; }
        }
        @media (max-width: 600px) {
          .cookies-doc { font-size: 0.95em; padding: 28px 16px 56px; }
          .cookies-doc h1 { font-size: 1.5em; }
        }
      `}</style>

      <main className="cookies-doc">
        <h1>COOKIES POLICY</h1>
        <div className="meta">
          Plumtrips.com
          <br />
          Last updated: {LAST_UPDATED}
        </div>

        <h2>A. INTRODUCTION</h2>
        <P>
          Plumtrips.com ("Plumtrips," "we," "us," or "our") is committed to
          protecting the privacy of your personal information. This Cookies
          Policy explains how and when we use cookies and similar tracking
          technologies across our customer interface channels, including our
          website, mobile site, mobile app, and offline channels including
          call centres and offices (collectively, "Sales Channels"). Please
          read this Policy alongside our Privacy Policy, which explains
          more broadly how we handle your personal data.
        </P>
        <p className="subhead">
          By continuing to use our Sales Channels, and where required by
          law by providing your consent through our cookie banner or
          preference centre, you agree to the use of cookies as described
          in this Policy.
        </p>

        <h2>B. PURPOSE</h2>
        <P>
          We use cookies to ensure that anyone using our Sales Channels
          gets the best possible experience — from keeping your session
          secure, to remembering your preferences, to helping us understand
          how our Platform is used so we can improve it.
        </P>

        <h2>C. WHAT IS A COOKIE?</h2>
        <P>
          A cookie is a small text file placed on your device when you
          visit our website or use our app. Cookies are sent back to us (or
          to another site that recognises them) on each subsequent visit,
          allowing us to recognise your device and remember information
          about your preferences or past actions. Cookies cannot access any
          other information stored on your device. Related technologies
          covered by this Policy include local storage, pixel tags, SDKs
          (in our mobile app), and web beacons.
        </P>
        <P>
          We also advertise on third-party websites. As part of measuring
          the effectiveness of these campaigns, we may use
          visitor-identification technologies such as web beacons or action
          tags, which count visitors who reach our Platform after seeing a
          Plumtrips ad on a third-party site. This technology does not give
          us access to your personal information — it is used only to
          compile aggregated statistics about the performance of our
          advertising.
        </P>

        <h2>D. TYPES OF COOKIES WE USE</h2>
        <p className="subhead">By source:</p>
        <ul>
          <li>First-party cookies: served directly by us to your device.</li>
          <li>
            Third-party cookies: served by a third party (such as an
            analytics, advertising, or payment partner) on our behalf.
          </li>
        </ul>
        <p className="subhead">By duration:</p>
        <ul>
          <li>
            Persistent/permanent cookies: remain on your device for a
            pre-defined period and help us recognise you as a returning
            User, so you don't need to sign in again each visit.
          </li>
          <li>
            Session cookies: last only as long as your browsing session and
            are erased when you close your browser.
          </li>
        </ul>
        <p className="subhead">By function:</p>
        <ul>
          <li>
            Strictly Necessary: required for core functionality, including
            security, session management, fraud prevention, and
            navigation. These cannot be switched off, as our Platform will
            not work properly without them.
          </li>
          <li>
            Performance/Analytics: help us understand how our Platform is
            used — such as which pages are visited most, and how long
            Users stay — so that we can identify issues and improve the
            experience.
          </li>
          <li>
            Functionality: remember your preferences, such as language,
            currency, recent searches, or region, so the Platform behaves
            and looks the way you expect.
          </li>
          <li>
            Marketing/Advertising: used to make advertising more relevant
            to you, to measure the performance of our campaigns, to avoid
            repeatedly showing you ads you've already seen, and to
            personalise offers, newsletters, and promotional content based
            on how you interact with our Platform.
          </li>
        </ul>

        <h2>E. LEGAL BASIS AND CONSENT</h2>
        <P>
          We place non-essential cookies (performance, functionality, and
          marketing cookies) only with your explicit consent, obtained
          through our cookie banner or preferences centre when you first
          visit our Platform. Strictly necessary cookies are placed without
          consent, as they are essential to the security and operation of
          the Platform, consistent with applicable law.
        </P>
        <P>
          We seek to renew your consent every 12 months from the date it is
          originally given. We periodically review the cookies placed on
          our Platform to identify and classify any new or previously
          unclassified cookies, and will seek your consent afresh for any
          new category of non-essential cookie introduced.
        </P>

        <h2>F. HOW TO MANAGE OR WITHDRAW YOUR CONSENT</h2>
        <P>You can control cookies in the following ways:</P>
        <ul>
          <li>
            Cookie preferences centre: where available on our Platform, use
            the on-site cookie banner or preferences centre to accept,
            reject, or customise non-essential cookie categories at any
            time.
          </li>
          <li>
            Browser settings: most browsers let you block or delete
            cookies through their settings. Note that our Platform relies
            on cookies to function, so if you block or delete them, some
            features may not work as intended, and you may need to
            re-enter information more often.
          </li>
          <li>
            Do Not Track: if we detect that you have enabled a "Do Not
            Track" setting in your browser, we will automatically disable
            advertising and targeting cookies.
          </li>
          <li>
            Withdrawing consent: to withdraw consent for cookies already
            placed, adjust your preferences through the cookie banner, your
            browser settings, or write to us at <Email />. If you disable a
            cookie, we may continue to use information already collected
            from it before your preference was changed, but will stop
            collecting further information through that cookie.
          </li>
        </ul>

        <h2>G. THIRD-PARTY COOKIES</h2>
        <P>
          Some cookies on our Platform are set by third parties, including
          analytics providers, payment gateways, advertising partners, and
          other service providers who support our Sales Channels. These
          third parties may use cookies according to their own privacy and
          cookie policies, which we encourage you to review, as we do not
          control how they process the data collected through their
          cookies.
        </P>

        <h2>H. YOUR PRIVACY RIGHTS</h2>
        <P>
          For details of the broader rights available to you regarding
          your personal data — including access, correction, and erasure —
          please refer to our Privacy Policy. If you have questions or wish
          to exercise any of these rights, contact us at <Email />.
        </P>

        <h2>I. UPDATES TO THIS POLICY</h2>
        <P>
          We may update this Cookies Policy from time to time to reflect
          changes in law, technology, or our practices. Material changes
          will be indicated by an updated "Last updated" date at the top of
          this page. We encourage you to review this Policy periodically.
        </P>

        <h2>J. CONTACT US</h2>
        <P>
          If you have questions, comments, or concerns about this Cookies
          Policy, please contact us at:
        </P>
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