import React from "react";
import { SectionHead } from "./token";
import type { TrendingDestinationProps } from "./types";

export function TrendingDestination({ eyebrow, title, actionLabel, onActionClick, items }: TrendingDestinationProps) {
  return (
    <section className="trending-section">
      <style>{`
        .trending-section {
          background: #fff;
          padding: 20px 48px;
        }
        .trending-grid {
          display: grid;
          grid-template-columns: repeat(${items.length}, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .trending-section { padding: 10px 24px; }
          .trending-grid { grid-template-columns: repeat(3, 1fr); }
        } 
        @media (max-width: 640px) {
          .trending-section { padding: 36px 16px; }
          .trending-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 400px) {
          .trending-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ maxWidth: 1184, margin: "0 auto" }}>
        <SectionHead eyebrow={eyebrow} title={title} action={actionLabel} onAction={onActionClick} />
        <div className="trending-grid">
          {items.map((item) => (
            <div
              key={item.name}
              style={{
                borderRadius: 16,
                overflow: "hidden",
                position: "relative",
                height: 200,
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(10,30,63,0.10)",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url('${item.imageUrl}')`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg,rgba(6,18,36,0.12) 30%,rgba(6,18,36,0.9) 100%)",
                }}
              />
              <div style={{ position: "absolute", left: 14, right: 14, bottom: 14 }}>
                <div style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: 14.5, color: "#fff" }}>
                  {item.name}
                </div>
                <div style={{ fontFamily: "Poppins, sans-serif", fontSize: 11.5, color: "rgba(255,255,255,0.78)", marginTop: 2 }}>
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}