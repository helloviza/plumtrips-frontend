import React from "react";
import { C, FONT, IconCheck } from "./token";
import type { CorporateTravelProps } from "./types";

export function CorporateTravel({
  eyebrow,
  title,
  subtitle,
  imageUrl,
  features,
  primaryCta,
  secondaryCta,
  onPrimaryClick,
  onSecondaryClick,
}: CorporateTravelProps) {
  return (
    <section className="corporate-section">
      <style>{`
        .corporate-section {
          background: ${C.softWhite};
          padding: 72px 48px;
        }
        .corporate-grid {
          max-width: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        .corporate-image {
          border-radius: 20px;
          overflow: hidden;
          height: 380px;
          box-shadow: 0 24px 60px rgba(10,30,63,0.18);
          background-size: cover;
          background-position: center;
        }
        .corporate-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px 20px;
          margin-bottom: 30px;
        }
        .corporate-ctas {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
        }
        @media (max-width: 900px) {
          .corporate-section { padding: 48px 24px; }
          .corporate-grid { grid-template-columns: 1fr; gap: 32px; }
          .corporate-image { height: 280px; }
        }
        @media (max-width: 480px) {
          .corporate-section { padding: 36px 16px; }
          .corporate-image { height: 220px; }
          .corporate-features { grid-template-columns: 1fr; }
          .corporate-ctas { flex-direction: column; }
          .corporate-ctas button { width: 100%; }
        }
      `}</style>

      <div className="corporate-grid">
        <div
          className="corporate-image"
          style={{ backgroundImage: `url('${imageUrl}')` }}
        />
        <div>
          <span
            style={{
              display: "inline-block",
              marginBottom: 12,
              fontFamily: FONT,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.orange,
            }}
          >
            {eyebrow}
          </span>
          <h2
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: "2rem",
              lineHeight: 1.2,
              color: C.navy,
              margin: "0 0 14px",
              letterSpacing: "-0.02em",
              whiteSpace: "pre-line",
            }}
          >
            {title}
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 14.5, lineHeight: 1.7, color: C.textMuted, margin: "0 0 24px" }}>
            {subtitle}
          </p>
          <div className="corporate-features">
            {features.map((feat) => (
              <div key={feat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 7,
                    background: "rgba(255,104,44,0.12)",
                    color: C.orange,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <IconCheck />
                </div>
                <span style={{ fontFamily: FONT, fontSize: 13.5, color: C.navy, fontWeight: 500 }}>{feat}</span>
              </div>
            ))}
          </div>
          <div className="corporate-ctas">
            <button
              onClick={onPrimaryClick}
              style={{
                padding: "13px 26px",
                borderRadius: 11,
                border: "none",
                background: C.orange,
                color: "#fff",
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(255,104,44,0.4)",
              }}
            >
              {primaryCta}
            </button>
            <button
              onClick={onSecondaryClick}
              style={{
                padding: "13px 26px",
                borderRadius: 11,
                border: `1.5px solid ${C.navy}`,
                background: "none",
                color: C.navy,
                fontFamily: FONT,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {secondaryCta}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}