import React from "react";
import { C, FONT, SectionHead } from "./token";
import type { TestimonialsProps } from "./types";

export function Testimonials({ eyebrow, title, actionLabel, onActionClick, reviews }: TestimonialsProps) {
  return (
    <section className="testimonials-section">
      <style>{`
        .testimonials-section {
          background: #fff;
          padding: 72px 48px;
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(${reviews.length}, 1fr);
          gap: 20px;
        }
        @media (max-width: 900px) {
          .testimonials-section { padding: 48px 24px; }
          .testimonials-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 560px) {
          .testimonials-section { padding: 36px 16px; }
          .testimonials-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        <SectionHead eyebrow={eyebrow} title={title} action={actionLabel} onAction={onActionClick} />
        <div className="testimonials-grid">
          {reviews.map((review) => {
            const stars = "★".repeat(review.rating ?? 5);
            return (
              <div
                key={review.name}
                style={{
                  background: C.softWhite,
                  borderRadius: 16,
                  padding: "24px 22px",
                  border: "1px solid rgba(10,30,63,0.06)",
                }}
              >
                <div style={{ color: C.orange, fontSize: 15, marginBottom: 12, letterSpacing: 2 }}>{stars}</div>
                <p style={{ fontFamily: FONT, fontSize: 13.5, lineHeight: 1.7, color: C.navy, margin: "0 0 20px" }}>
                  "{review.quote}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      backgroundImage: `url('${review.avatarUrl}')`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 13.5, color: C.navy }}>
                      {review.name}
                    </div>
                    <div style={{ fontFamily: FONT, fontSize: 11.5, color: C.textMuted }}>{review.city}</div>
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