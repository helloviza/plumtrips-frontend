import React from "react";

const baseFont = "'Barlow Condensed', Arial, sans-serif";
const BRAND = "Plumtrips.com";
const SUPPORT_EMAIL = "hello@plumtrips.com";

export default function CookiesPage() {
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
        Cookies Policy
      </h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>Last updated: 9 Nov 2025</p>

      <p>
        {BRAND} uses cookies and similar technologies to make our website work,
        enhance performance, personalize content, and analyze traffic. This page
        explains what cookies are, how we use them, and how you can manage them.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        1. What Are Cookies?
      </h2>
      <p>
        Cookies are small text files placed on your device. They help remember
        your preferences and improve your browsing experience. Related tools
        include local storage, pixels, and SDKs.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        2. Types of Cookies We Use
      </h2>
      <ul>
        <li>
          <strong>Strictly Necessary:</strong> Required for core functionality
          (security, session, navigation).
        </li>
        <li>
          <strong>Performance/Analytics:</strong> Understand usage to improve UX.
        </li>
        <li>
          <strong>Functionality:</strong> Remember preferences (language,
          currency, recent searches).
        </li>
        <li>
          <strong>Marketing:</strong> Measure campaigns and deliver relevant
          offers (used with consent where required).
        </li>
      </ul>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        3. Managing Preferences
      </h2>
      <p>
        You can control cookies via your browser settings and, where available,
        our on-site cookie banner/preferences center. Blocking certain cookies
        may impact site functionality.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        4. Third-Party Cookies
      </h2>
      <p>
        Some cookies are set by third parties (analytics, payment gateways,
        partners). We encourage reviewing their policies for details on usage.
      </p>

      <h2 style={{ fontSize: "1.4rem", marginTop: 28 }}>
        5. Updates & Contact
      </h2>
      <p>
        We may update this Policy to reflect changes in law or technology. For
        questions, contact <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
      </p>
    </main>
  );
}
