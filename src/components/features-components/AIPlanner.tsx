import { C, FONT, IconArrow } from "./token";
import type { AIPlannerProps, PlannerField } from "./types";
import { Link } from "react-router-dom";

import { useCurrency } from "../../context/currencyContext";
import { usePlannerChat } from "./PlannerChatContext";

function Field({
  label,
  placeholder,
  fullWidth,
  isCurrency,
  value,
  onChange,
  onBlur,
  isMissing,
}: PlannerField & {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  isMissing?: boolean;
}) {
  const { convert, symbol } = useCurrency();
  const displayLabel = isCurrency ? `${label} (${symbol})` : label;
  const displayPlaceholder = isCurrency ? convert(Number(placeholder)) : placeholder;
  return (
    <div style={{ gridColumn: "auto" }}>
      <label
        style={{
          display: "block",
          fontFamily: FONT,
          fontSize: 11,
          fontWeight: 600,
          color: isMissing ? "#ff9a7a" : "rgba(255,255,255,0.55)",
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          marginBottom: 6,
          transition: "color 0.15s ease",
        }}
      >
        {displayLabel}
      </label>
      <input
        placeholder={displayPlaceholder}
        aria-label={displayLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        style={{
          width: "100%",
          boxSizing: "border-box",
          padding: "11px 14px",
          borderRadius: 10,
          border: isMissing ? "1px solid rgba(255,104,44,0.75)" : "1px solid rgba(255,255,255,0.14)",
          background: isMissing ? "rgba(255,104,44,0.08)" : "rgba(255,255,255,0.06)",
          color: "#fff",
          fontFamily: FONT,
          fontSize: 13,
          outline: "none",
          boxShadow: isMissing ? "0 0 0 3px rgba(255,104,44,0.14)" : "none",
          transition: "border 0.15s ease, background 0.15s ease, box-shadow 0.15s ease",
        }}
      />
    </div>
  );
}

export function AIPlanner({ badge, title, subtitle, ctaLabel, suggestion }: AIPlannerProps) {
  const { convert } = useCurrency();
  const {
    activeFields,
    values,
    missingFieldKeys,
    isLoading,
    handleFieldChange,
    handleFieldBlur,
    handleGenerate,
  } = usePlannerChat();

  return (
    <section className="ai-planner-section">
      <style>{`
        .ai-planner-section {
          background: linear-gradient(135deg, ${C.navy} 0%, ${C.navyDeep} 100%);
          padding: 72px 48px;
        }
        .ai-planner-grid {
          max-width: 100%;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 32px;
          align-items: stretch;
        }
        .ai-planner-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        .ai-planner-suggestion {
          border-radius: 20px;
          overflow: hidden;
          position: relative;
          min-height: 380px;
          box-shadow: 0 30px 70px rgba(0,0,0,0.45);
        }
        @media (max-width: 900px) {
          .ai-planner-section { padding: 48px 24px; }
          .ai-planner-grid { grid-template-columns: 1fr; }
          .ai-planner-suggestion { min-height: 320px; }
        }
        @media (max-width: 480px) {
          .ai-planner-section { padding: 36px 16px; }
          .ai-planner-fields { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ai-planner-grid">
        {/* ── Form card ── */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 20,
            padding: "36px 34px",
            boxShadow: "0 30px 70px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)",
          }}
        >
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

          <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: "1.9rem", lineHeight: 1.2, color: "#fff", margin: "0 0 8px" }}>
            {title}
          </h2>
          <p style={{ fontFamily: FONT, fontSize: 14, color: "rgba(255,255,255,0.6)", margin: "0 0 20px" }}>
            {subtitle}
          </p>
          <div className="ai-planner-fields">
            {activeFields.map((f) => {
              const key = f.name ?? f.label;
              return (
                <Field
                  key={key}
                  {...f}
                  value={values[key] ?? ""}
                  onChange={(value) => handleFieldChange(key, value)}
                  onBlur={() => handleFieldBlur(key)}
                  isMissing={missingFieldKeys.includes(key)}
                />
              );
            })}
          </div>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
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
              cursor: isLoading ? "default" : "pointer",
              opacity: isLoading ? 0.7 : 1,
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
        <div className="ai-planner-suggestion">
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url('${suggestion.imageUrl}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg,rgba(6,18,36,0.2) 0%,rgba(6,18,36,0.92) 100%)",
            }}
          />
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
          <div style={{ position: "absolute", left: 22, right: 22, bottom: 22 }}>
            <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, color: "#fff" }}>
              {suggestion.destination}
            </div>
            <div style={{ fontFamily: FONT, fontSize: 13, color: "rgba(255,255,255,0.75)", margin: "4px 0 14px" }}>
              {suggestion.tagline}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontFamily: FONT, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>Est. package</span>
                <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 24, color: C.orange, lineHeight: 1 }}>
                  {convert(suggestion.estimatedPrice)}
                </div>
              </div>
              <Link to={"/holidays"}>
                <button
                  onClick={suggestion.onViewItinerary}
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
                  View itinerary
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}