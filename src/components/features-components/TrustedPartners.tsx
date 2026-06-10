import React from "react";
import { C, FONT } from "./token";
import type { TrustedPartnersProps } from "./types";

export function TrustedPartners({ heading, logos }: TrustedPartnersProps) {
  return (
    <section className="partners-section">
      <style>{`
        .partners-section {
          background: #fff;
          padding: 56px 48px;
          border-top: 1px solid rgba(10,30,63,0.06);
        }
        .partners-logos {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 32px 56px;
        }
        @media (max-width: 768px) {
          .partners-section { padding: 40px 24px; }
          .partners-logos { gap: 24px 36px; }
        }
        @media (max-width: 480px) {
          .partners-section { padding: 32px 16px; }
          .partners-logos { gap: 20px 28px; }
        }
      `}</style>

      <div style={{ maxWidth: 1184, margin: "0 auto", textAlign: "center" }}>
        <div
          style={{
            fontFamily: FONT,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: C.textMuted,
            marginBottom: 28,
          }}
        >
          {heading}
        </div>
        <div className="partners-logos">
          {logos.map((logo) => (
            <span
              key={logo}
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 22,
                color: "#9aa6b6",
                letterSpacing: "-0.01em",
              }}
            >
              {logo}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}