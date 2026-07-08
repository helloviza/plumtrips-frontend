import { useEffect, useMemo, useState } from "react";
import { C, FONT, IconArrow } from "./token";
import type { AIPlannerProps, PlannerField } from "./types";
import { getBackendOrigin } from "../../lib/backendOrigin";
import { Link, useNavigate } from "react-router-dom";

function Field({ label, placeholder, fullWidth, value, onChange }: PlannerField & { value: string; onChange: (value: string) => void }) {
  return (
    <div style={{ gridColumn: "auto" }}>
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
        {label}
      </label>
      <input
        placeholder={placeholder}
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
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

export function AIPlanner({ badge, title, subtitle, fields, ctaLabel, onGenerate, suggestion }: AIPlannerProps) {
  const navigate = useNavigate();
  const [activeFields, setActiveFields] = useState<PlannerField[]>(fields);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.name ?? field.label, ""]))
  );
  const [chatLog, setChatLog] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customFieldLabel, setCustomFieldLabel] = useState("");

  useEffect(() => {
    setActiveFields(fields);
    setValues((current) => ({
      ...Object.fromEntries(fields.map((field) => [field.name ?? field.label, ""])),
      ...current,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  const sessionId = useMemo(() => {
    let sid = window.localStorage.getItem("plumml_session_id");
    if (!sid) {
      sid = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `plumml-${Date.now()}`;
      window.localStorage.setItem("plumml_session_id", sid);
    }
    return sid;
  }, []);

  const handleFieldChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const buildMessageFromFields = () => {
    return [
      "Please use the information below to start the travel planning conversation.",
      ...activeFields.map((field) => {
        const key = field.name ?? field.label;
        const value = values[key] || "";
        return `${field.label}: ${value || "(not provided)"}`;
      }),
    ].join("\n");
  };

  const downloadFile = async (url: string) => {
    const fileName = url.split("/").pop()?.split("?")[0] || "itinerary.pdf";
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.setAttribute("download", fileName);
    anchor.setAttribute("target", "_blank");
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => {
      window.open(url, "_blank");
    }, 100);
  };

  const handleGenerate = async () => {
    if (isLoading) return;

    const missingFields = activeFields.filter((field) => {
      const key = field.name ?? field.label;
      return !String(values[key] ?? "").trim();
    });

    if (missingFields.length) {
      const missingLabels = missingFields.map((field) => field.label).join(", ");
      setChatLog((current) => [
        ...current,
        { role: "assistant", text: `Please fill in all required fields before generating: ${missingLabels}.` },
      ]);
      return;
    }

    const message = buildMessageFromFields();
    setChatLog((current) => [...current, { role: "user", text: message }]);
    setIsLoading(true);

    const BACKEND = getBackendOrigin();
    try {
      const response = await fetch(`${BACKEND}/api/v1/plumml/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const errorText = data?.error || data?.message || response.statusText || "Unknown error";
        throw new Error(`Planner request failed: ${errorText}`);
      }

      const replyText = data?.reply || "Planner responded without text.";
      setChatLog((current) => [...current, { role: "assistant", text: replyText }]);

      const plannerResult = {
        itinerary: data?.itinerary,
        outboundFlight: data?.outboundFlight,
        returnFlight: data?.returnFlight,
        hotel: data?.hotel,
        priceBreakdown: data?.priceBreakdown,
        pdfUrl: data?.pdfUrl,
        slots: data?.slots || {},
        reply: replyText,
      };

      if (plannerResult.itinerary) {
        try {
          sessionStorage.setItem("plumml_itinerary_data", JSON.stringify(plannerResult));
        } catch {
          // ignore session storage failures
        }
      }

      if (data?.pdfUrl) {
        const downloadUrl = data.pdfUrl.startsWith("http")
          ? data.pdfUrl
          : `${BACKEND}${data.pdfUrl.startsWith("/") ? "" : "/"}${data.pdfUrl}`;
        await downloadFile(downloadUrl);
        setChatLog((current) => [
          ...current,
          {
            role: "assistant",
            text: `Your itinerary PDF has been generated and the download should begin shortly.`,
          },
        ]);
      }

      if (plannerResult.itinerary) {
        navigate("/tripPlanner", { state: plannerResult });
      }

      onGenerate?.();
    } catch (error: any) {
      console.error("AIPlanner request failed", error);
      const errorMessage = error?.message || "Sorry, something went wrong while sending your request.";
      setChatLog((current) => [...current, { role: "assistant", text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCustomField = () => {
    const label = customFieldLabel.trim();
    if (!label) return;
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    if (values[key] !== undefined) return;
    setActiveFields((prev) => [
      ...prev,
      { name: key, label, placeholder: `Enter ${label.toLowerCase()}`, fullWidth: true },
    ]);
    setValues((prev) => ({ ...prev, [key]: "" }));
    setCustomFieldLabel("");
  };

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
        .ai-planner-chat {
          margin-top: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .ai-planner-chat-message {
          border-radius: 18px;
          padding: 16px;
          line-height: 1.6;
          max-width: 100%;
          white-space: pre-wrap;
        }
        .ai-planner-chat-message.user {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          align-self: flex-end;
        }
        .ai-planner-chat-message.assistant {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.14);
          align-self: flex-start;
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
                />
              );
            })}
          </div>
          {/* <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, marginTop: 14 }}>
            <input
              value={customFieldLabel}
              onChange={(event) => setCustomFieldLabel(event.target.value)}
              placeholder="Add another requirement"
              aria-label="Add another requirement"
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
            <button
              onClick={handleAddCustomField}
              style={{
                borderRadius: 12,
                border: "none",
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
                fontFamily: FONT,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                padding: "11px 18px",
              }}
            >
              Add field
            </button>
          </div> */}
          <button
            onClick={handleGenerate}
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
          <div className="ai-planner-chat">
            {chatLog.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`ai-planner-chat-message ${item.role}`}>
                <strong style={{ display: "block", marginBottom: 8, opacity: 0.8 }}>
                  {item.role === "user" ? "You" : "Planner"}
                </strong>
                {item.text}
              </div>
            ))}
            {isLoading && (
              <div className="ai-planner-chat-message assistant">Sending to planner…</div>
            )}
          </div>
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
                  {suggestion.estimatedPrice}
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
              </button></Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}