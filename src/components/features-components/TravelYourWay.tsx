import React from "react";
import { C, SectionHead } from "./token";

import type { TravelYourWayProps } from "./types";
import { useNavigate } from "react-router-dom";

export function TravelYourWay({ eyebrow, title, actionLabel, onActionClick, items }: TravelYourWayProps) {

  const navigate=useNavigate();
  return (
    <section className="travel-way-section">
      <style>{`
        .travel-way-section {
          background: #fff;
          padding: 72px 48px;
        }
        .travel-way-grid {
          display: grid;
          grid-template-columns: repeat(${items.length}, 1fr);
          gap: 16px;
        }
        .travel-way-card {
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          height: 240px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(10,30,63,0.10);
          transition: transform 0.32s ease, box-shadow 0.32s ease;
        }
        .travel-way-card:hover {
          transform: scale(1.045);
          box-shadow: 0 16px 40px rgba(10,30,63,0.22);
        }
        .travel-way-card-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: transform 0.32s ease;
        }
        .travel-way-card:hover .travel-way-card-bg {
          transform: scale(1.06);
        }
        @media (max-width: 900px) {
          .travel-way-section { padding: 48px 24px; }
          .travel-way-grid { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 640px) {
          .travel-way-section { padding: 36px 16px; }
          .travel-way-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 400px) {
          .travel-way-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        <SectionHead eyebrow={eyebrow} title={title} action={actionLabel} onAction={onActionClick} />
        <div className="travel-way-grid">
          {items.map((item) => (
            <div key={item.name} className="travel-way-card" onClick={() => navigate('/offers')}>
              <div
                className="travel-way-card-bg"
                style={{ backgroundImage: `url('${item.imageUrl}')` }}
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