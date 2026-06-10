import React from "react";
import { C, FONT, ICON_MAP } from "./token";
import type { TrustBarProps } from "./types";

export function TrustBar({ items }: TrustBarProps) {
  return (
    <section className="trustbar-section">
      <style>{`
        .trustbar-section {
          background: ${C.softWhite};
          padding: 0 48px;
          display: flow-root;
        }
        .trustbar-card {
          background: #fff;
          border-radius: 18px;
          margin-top: -44px;
          position: relative;
          z-index: 20;
          box-shadow: 0 24px 60px rgba(10,30,63,0.18);
          border: 1px solid rgba(10,30,63,0.06);
          display: grid;
          grid-template-columns: repeat(${items.length}, 1fr);
        }
        .trustbar-item {
          padding: 22px 16px;
          display: flex;
          gap: 12px;
          align-items: center;
        }
        @media (max-width: 900px) {
          .trustbar-section { padding: 0 24px; }
          .trustbar-card {
            grid-template-columns: repeat(2, 1fr);
            margin-top: -32px;
          }
          .trustbar-item {
            border-right: none !important;
            border-bottom: 1px solid rgba(10,30,63,0.07);
          }
          .trustbar-item:nth-child(odd) { border-right: 1px solid rgba(10,30,63,0.07) !important; }
          .trustbar-item:nth-last-child(-n+2):nth-child(odd),
          .trustbar-item:last-child { border-bottom: none; }
        }
        @media (max-width: 480px) {
          .trustbar-section { padding: 0 16px; }
          .trustbar-card {
            grid-template-columns: 1fr;
            margin-top: -24px;
            border-radius: 14px;
          }
          .trustbar-item {
            border-right: none !important;
            border-bottom: 1px solid rgba(10,30,63,0.07) !important;
          }
          .trustbar-item:last-child { border-bottom: none !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1184, margin: "0 auto" }}>
        <div className="trustbar-card">
          {items.map((item, i) => {
            const Icon = ICON_MAP[item.icon];
            return (
              <div
                key={item.title}
                className="trustbar-item"
                style={{
                  borderRight: i < items.length - 1 ? "1px solid rgba(10,30,63,0.07)" : "none",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    flexShrink: 0,
                    borderRadius: 10,
                    color: C.orange,
                    background: "rgba(255,104,44,0.10)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon />
                </div>
                <div>
                  <div style={{ fontFamily: FONT, fontSize: 12.5, fontWeight: 600, color: C.navy, lineHeight: 1.25 }}>
                    {item.title}
                  </div>
                  <div style={{ fontFamily: FONT, fontSize: 11, color: C.textMuted, marginTop: 2 }}>
                    {item.subtitle}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}