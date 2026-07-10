import React from "react";
import { C, FONT, IconArrow } from "./token";
import type { AIHotelFinderProps, PlannerField } from "./types";
import { Link, useNavigate } from "react-router-dom";
import { useCurrency } from "../../context/currencyContext";

// ── Sub-components ────────────────────────────────────────────────

function Field({ label, placeholder, fullWidth, isCurrency }: PlannerField) {
  const { convert, symbol } = useCurrency();
  const displayLabel = isCurrency ? `${label} (${symbol})` : label;
  const displayPlaceholder = isCurrency ? convert(Number(placeholder)) : placeholder;

  return (
    <div style={{ gridColumn: fullWidth ? "1 / -1" : "auto" }}>
      <label
        style={{
          display: "block",
          fontFamily: FONT,
          fontSize: 11,
          fontWeight: 600,
          color: "rgba(255,255,255,0.55)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 6,
        }}
      >
        {displayLabel}
      </label>
      <input
        placeholder={String(displayPlaceholder)}
        aria-label={label}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "11px 14px",
          borderRadius: 10,
          border: "1px solid rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.06)",
          color: "#fff",
          fontFamily: FONT,
          fontSize: 13,
          outline: "none",
        }}
      />
    </div>
  );
}

function StarRating({ rating }: { rating: string }) {
  const score = parseFloat(rating);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill={i <= Math.round(score) ? C.orange : "rgba(255,255,255,0.25)"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

function BulletCheck({ text }: { text: string }) {
  return (
    <li
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        fontFamily: FONT,
        fontSize: 13,
        color: "rgba(255,255,255,0.72)",
        listStyle: "none",
        margin: 0,
        padding: 0,
      }}
    >
      {/* Checkmark circle */}
      <span
        style={{
          flexShrink: 0,
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "rgba(255,104,44,0.18)",
          border: "1px solid rgba(255,104,44,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6l3 3 5-5"
            stroke={C.orange}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {text}
    </li>
  );
}

// ── Main component ────────────────────────────────────────────────

export function AIHotelFinder({
  badge,
  title,
  bullets,
  fields,
  ctaLabel,
  onFind,
  suggestion,
}: AIHotelFinderProps) {
  const navigate = useNavigate();
  const { convert } = useCurrency();

  return (
    <section className="ai-hotel-section">
      <style>{`
        .ai-hotel-section {
          background: linear-gradient(135deg, ${C.navy} 0%, ${C.navyDeep} 100%);
          padding: 72px 48px;
        }
        .ai-hotel-grid {
          max-width: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 32px;
          align-items: stretch;
        }
        .ai-hotel-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .ai-hotel-suggestion {
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          min-height: 380px;
          box-shadow: 0 30px 70px rgba(0,0,0,0.45);
        }
        @media (max-width: 900px) {
          .ai-hotel-section  { padding: 48px 24px; }
          .ai-hotel-grid     { grid-template-columns: 1fr; }
          .ai-hotel-suggestion { min-height: 320px; }
        }
        @media (max-width: 480px) {
          .ai-hotel-section  { padding: 36px 16px; }
          .ai-hotel-fields   { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ai-hotel-grid">
        {/* ── Form card ── */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 20,
            padding: "36px 34px",
            boxShadow:
              "0 30px 70px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)",
          }}
        >
          {/* Badge */}
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 999,
              background: "rgba(255,104,44,0.15)",
              border: "1px solid rgba(255,104,44,0.3)",
              color: C.orange,
              fontFamily: FONT,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 18,
            }}
          >
            {badge}
          </span>

            <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "5px 10px",
      borderRadius: 999,
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.18)",
      color: "rgba(255,255,255,0.8)",
      fontFamily: FONT,
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    }}
  >
    <span
      style={{
        width: 5,
        height: 5,
        borderRadius: "50%",
        background: "#4ade80",
        display: "inline-block",
      }}
    />
    Beta
  </span>

          {/* Title */}
          <h2
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: "1.9rem",
              lineHeight: 1.2,
              color: "#fff",
              margin: "0 0 16px",
            }}
          >
            {title}
          </h2>

          {/* Bullet list — replaces subtitle */}
          <ul
            style={{
              margin: "0 0 26px",
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {bullets.map((b) => (
              <BulletCheck key={b} text={b} />
            ))}
          </ul>

          {/* Fields grid */}
          <div className="ai-hotel-fields">
            {fields.map((f) => (
              <Field key={f.label} {...f} />
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={onFind}
            style={{
              marginTop: 22,
              width: "100%",
              padding: "14px",
              borderRadius: 12,
              border: "none",
              background: C.orange,
              color: "#fff",
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 10px 30px rgba(255,104,44,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {ctaLabel} <IconArrow />
          </button>
        </div>

        {/* ── Suggestion card ── */}
        <div className="ai-hotel-suggestion">
          {/* Background image */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url('${suggestion.imageUrl}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          {/* Gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg,rgba(6,18,36,0.2) 0%,rgba(6,18,36,0.92) 100%)",
            }}
          />

          {/* Top badge */}
          <div
            style={{
              position: "absolute",
              top: 18,
              left: 18,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              color: "#fff",
              fontFamily: FONT,
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {suggestion.badge}
          </div>

          {/* Bottom content */}
          <div style={{ position: "absolute", left: 22, right: 22, bottom: 22 }}>
            {/* Hotel name + location */}
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: 22,
                color: "#fff",
                lineHeight: 1.2,
              }}
            >
              {suggestion.name}
            </div>
            <div
              style={{
                fontFamily: FONT,
                fontSize: 13,
                color: "rgba(255,255,255,0.65)",
                margin: "4px 0 10px",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {/* Pin icon */}
              <svg width="11" height="13" viewBox="0 0 12 16" fill="none">
                <path
                  d="M6 0C3.24 0 1 2.24 1 5c0 3.75 5 11 5 11s5-7.25 5-11c0-2.76-2.24-5-5-5zm0 6.75A1.75 1.75 0 1 1 6 3.25a1.75 1.75 0 0 1 0 3.5z"
                  fill="rgba(255,255,255,0.55)"
                />
              </svg>
              {suggestion.location}
            </div>

            {/* Rating row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 14,
              }}
            >
              <StarRating rating={suggestion.rating} />
              <span
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: 13,
                  color: "#fff",
                }}
              >
                {suggestion.rating}
              </span>
              <span
                style={{
                  fontFamily: FONT,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                ({suggestion.ratingCount} reviews)
              </span>
            </div>

            {/* Price + CTA row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    fontFamily: FONT,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.6)",
                  }}
                >
                  Per night
                </span>
                <div
                  style={{
                    fontFamily: FONT,
                    fontWeight: 800,
                    fontSize: 24,
                    color: C.orange,
                    lineHeight: 1,
                  }}
                >
                  {convert(suggestion.pricePerNight)}
                </div>
              </div>
              <Link to={"/holidays"}>
              <button
                onClick={suggestion.onViewDetails}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: "#fff",
                  color: C.navy,
                  fontFamily: FONT,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                View details
              </button></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}