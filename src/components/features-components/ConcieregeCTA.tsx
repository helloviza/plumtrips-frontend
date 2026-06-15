import React from "react";
import { C, FONT } from "./token";
import type { ConciergeCTAProps } from "./types";

export function ConciergeCTA({
  title,
  subtitle,
  // whatsappLabel,
  // callbackLabel,
  // phone,
  // onWhatsAppClick,
  // onCallbackClick,
}: ConciergeCTAProps) {
  return (
    <section className="concierge-section">
      <style>{`
        .concierge-section {
          background: linear-gradient(120deg, ${C.orange} 0%, #ff8a4c 100%);
          padding: 56px 48px;
        }
        .concierge-inner {
          max-width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
        }
        .concierge-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .concierge-section { padding: 40px 24px; }
          .concierge-inner { flex-direction: column; align-items: flex-start; }
          .concierge-actions { width: 100%; }
        }
        @media (max-width: 480px) {
          .concierge-section { padding: 32px 16px; }
          .concierge-actions { flex-direction: column; align-items: stretch; }
          .concierge-actions button { text-align: center; justify-content: center; width: 100%; }
        }
      `}</style>

      <div className="concierge-inner">
        <div>
          <h2
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: "1.9rem",
              color: "#fff",
              margin: "0 0 8px",
              lineHeight: 1.2,
            }}
          >
            {title}
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 15, color: "rgba(255,255,255,0.9)", margin: 0 }}>
            {subtitle}
          </p>
        </div>
        {/* <div className="concierge-actions">
          <button
            onClick={onWhatsAppClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "13px 24px",
              borderRadius: 11,
              border: "none",
              background: "#1FA855",
              color: "#fff",
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            }}
          >
            {whatsappLabel}
          </button>
          <button
            onClick={onCallbackClick}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "13px 24px",
              borderRadius: 11,
              border: "none",
              background: C.navy,
              color: "#fff",
              fontFamily: FONT,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            }}
          >
            {callbackLabel}
          </button>
          <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: 16, color: "#fff" }}>{phone}</span>
        </div> */}
      </div>
    </section>
  );
}