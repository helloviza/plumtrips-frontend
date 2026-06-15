import React from "react";
import { C, FONT, SectionHead } from "./token";
import type { TravelStoriesProps } from "./types";

export function TravelStories({ eyebrow, title, actionLabel, onActionClick, featured, stories }: TravelStoriesProps) {
  return (
    <section className="travel-stories-section">
      <style>{`
        .travel-stories-section {
          background: ${C.softWhite};
          padding: 72px 48px;
        }
        .travel-stories-grid {
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          gap: 24px;
        }
        .travel-stories-featured {
          border-radius: 18px;
          overflow: hidden;
          position: relative;
          min-height: 380px;
          cursor: pointer;
          box-shadow: 0 14px 40px rgba(10,30,63,0.14);
        }
        .travel-stories-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .travel-story-card {
          display: flex;
          gap: 16px;
          background: #fff;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid rgba(10,30,63,0.06);
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(10,30,63,0.06);
        }
        .travel-story-thumb {
          width: 120px;
          flex-shrink: 0;
          background-size: cover;
          background-position: center;
        }
        @media (max-width: 900px) {
          .travel-stories-section { padding: 48px 24px; }
          .travel-stories-grid { grid-template-columns: 1fr; }
          .travel-stories-featured { min-height: 300px; }
        }
        @media (max-width: 480px) {
          .travel-stories-section { padding: 36px 16px; }
          .travel-story-thumb { width: 90px; }
        }
      `}</style>

      <div style={{ maxWidth: "100%", margin: "0 auto" }}>
        <SectionHead eyebrow={eyebrow} title={title} action={actionLabel} onAction={onActionClick} />
        <div className="travel-stories-grid">
          {/* ── Featured story ── */}
          <div className="travel-stories-featured">
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `url('${featured.imageUrl}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg,rgba(6,18,36,0.1) 30%,rgba(6,18,36,0.9) 100%)",
              }}
            />
            <div style={{ position: "absolute", left: 26, right: 26, bottom: 26 }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "5px 12px",
                  borderRadius: 999,
                  background: C.orange,
                  color: "#fff",
                  fontFamily: FONT,
                  fontSize: 11,
                  fontWeight: 600,
                  marginBottom: 12,
                }}
              >
                {featured.badge}
              </span>
              <h3
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 24,
                  color: "#fff",
                  margin: "0 0 8px",
                  lineHeight: 1.25,
                }}
              >
                {featured.title}
              </h3>
              <p style={{ fontFamily: FONT, fontSize: 13, color: "rgba(255,255,255,0.78)", margin: 0 }}>
                {featured.excerpt}
              </p>
            </div>
          </div>

          {/* ── Story cards ── */}
          <div className="travel-stories-list">
            {stories.map((story) => (
              <div key={story.title} className="travel-story-card">
                <div
                  className="travel-story-thumb"
                  style={{ backgroundImage: `url('${story.imageUrl}')` }}
                />
                <div style={{ padding: "16px 16px 16px 0" }}>
                  <div
                    style={{
                      fontFamily: FONT,
                      fontSize: 11,
                      fontWeight: 600,
                      color: C.orange,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      marginBottom: 6,
                    }}
                  >
                    {story.tag}
                  </div>
                  <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 15, color: C.navy, lineHeight: 1.35 }}>
                    {story.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}