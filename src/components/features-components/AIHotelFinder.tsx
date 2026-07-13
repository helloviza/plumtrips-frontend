import React, { useEffect, useMemo, useRef, useState } from "react";
import { C, FONT, IconArrow } from "./token";
import type { AIHotelFinderProps, PlannerField } from "./types";
import { Link, useNavigate } from "react-router-dom";
import { useCurrency } from "../../context/currencyContext";
import { getBackendOrigin } from "../../lib/backendOrigin";

// ── Sub-components ────────────────────────────────────────────────

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
    <div style={{ gridColumn: fullWidth ? "1 / -1" : "auto" }}>
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
        placeholder={String(displayPlaceholder)}
        aria-label={label}
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

// Simple inline icons for the floating chat widget — mirrors the pattern
// used by AIPlanner so both experiences feel consistent.
function IconChatBubble() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 4h16v11H8l-4 4V4z"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 6L18 18M18 6L6 18" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 11L21 3L13 21L11 13L3 11Z" fill="#fff" />
    </svg>
  );
}

// Turns a raw field label into a natural, first-person phrase, so a missed
// field is asked about like a real question rather than flagged as a
// "required field".
function describeHotelFieldNaturally(label: string): string {
  const key = label.toLowerCase();
  if (key.includes("destination") || key.includes("city") || key.includes("location")) return "which city or area you're staying in";
  if (key.includes("check-in") || key.includes("check in") || key.includes("arrival")) return "when you'll be checking in";
  if (key.includes("check-out") || key.includes("check out") || key.includes("departure")) return "when you'll be checking out";
  if (key.includes("date")) return "your travel dates";
  if (key.includes("budget") || key.includes("price") || key.includes("cost")) return "roughly what budget you have in mind per night";
  if (key.includes("guest") || key.includes("adult") || key.includes("people") || key.includes("traveler")) return "how many guests will be staying";
  if (key.includes("room")) return "how many rooms you'll need";
  if (key.includes("star") || key.includes("rating") || key.includes("class")) return "what star rating you're after";
  return `your ${label.toLowerCase()}`;
}

const HOTEL_FRIENDLY_OPENERS = [
  "Before I find some options, ",
  "One quick thing — ",
  "Happy to hunt for hotels! First, ",
  "Almost ready to search — just ",
];

// Short acknowledgements used between questions so asking multiple missing
// fields still feels like a real back-and-forth, not a repeated script.
const HOTEL_CONTINUATION_OPENERS = [
  "Got it, thanks! ",
  "Perfect, noted. ",
  "Great, thank you! ",
  "Awesome. ",
];

// Asks about exactly ONE missing field at a time — never the whole list —
// so a multi-field gap feels like a short conversation instead of a wall
// of validation text.
function buildSingleHotelFieldQuestion(label: string, isFirstQuestion: boolean): string {
  const ask = describeHotelFieldNaturally(label);
  if (isFirstQuestion) {
    const opener = HOTEL_FRIENDLY_OPENERS[Math.floor(Math.random() * HOTEL_FRIENDLY_OPENERS.length)];
    return `${opener}could you tell me ${ask}? 😊`;
  }
  const opener = HOTEL_CONTINUATION_OPENERS[Math.floor(Math.random() * HOTEL_CONTINUATION_OPENERS.length)];
  return `${opener}And could you tell me ${ask}?`;
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

// A single hotel result, normalized from whatever shape the backend sends.
type HotelCardData = {
  name?: string;
  location?: string;
  rating?: string | number;
  pricePerNight?: number;
  imageUrl?: string;
};

// A chat bubble is either plain text or a set of structured hotel cards —
// never both — so results render as a smooth little results list instead
// of a wall of text.
type ChatMessage =
  | { role: "user" | "assistant"; text: string; hotels?: undefined }
  | { role: "assistant"; hotels: HotelCardData[]; text?: undefined };

// Compact hotel result card used inside the chat log — image, name,
// location, rating, and price at a glance.
function ChatHotelCard({ hotel }: { hotel: HotelCardData }) {
  const { convert } = useCurrency();
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "center",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: 10,
      }}
    >
      {hotel.imageUrl && (
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 8,
            flexShrink: 0,
            backgroundImage: `url('${hotel.imageUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 13,
            color: "#fff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {hotel.name || "Hotel"}
        </div>
        <div style={{ fontFamily: FONT, fontSize: 11, color: "rgba(255,255,255,0.6)" }}>
          {[hotel.location, hotel.rating ? `⭐ ${hotel.rating}` : null].filter(Boolean).join("  ·  ")}
        </div>
      </div>
      {hotel.pricePerNight != null && (
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 13, color: C.orange, flexShrink: 0, textAlign: "right" }}>
          {convert(Number(hotel.pricePerNight))}
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>/night</div>
        </div>
      )}
    </div>
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

  const [activeFields, setActiveFields] = useState<PlannerField[]>(fields);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.name ?? field.label, ""]))
  );
  const [missingFieldKeys, setMissingFieldKeys] = useState<string[]>([]);

  // Shared chat state — used by both the "Find hotels" button and the
  // floating chat widget, so it all lands in one conversation, same
  // pattern as AIPlanner but scoped to hotel-only replies. Assistant
  // messages can optionally carry structured hotel cards instead of
  // (or in addition to) plain text, for a smoother, more visual result.
  const [chatLog, setChatLog] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const chatBodyRef = useRef<HTMLDivElement | null>(null);

  // The one field we're currently asking about — like AIPlanner, we only
  // ever ask about a single missing field at a time.
  const [awaitingFieldKey, setAwaitingFieldKey] = useState<string | null>(null);

  useEffect(() => {
    setActiveFields(fields);
    setValues((current) => ({
      ...Object.fromEntries(fields.map((field) => [field.name ?? field.label, ""])),
      ...current,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
    if (chatLog.length && !isWidgetOpen) {
      setHasUnread(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatLog]);

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
    if (value.trim()) {
      setMissingFieldKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : prev));
    }
  };

  // Which fields are still empty — optionally checked against a fresher
  // values object right after a setValues call.
  const getMissingFields = (valuesOverride?: Record<string, string>) => {
    const source = valuesOverride ?? values;
    return activeFields.filter((field) => {
      const key = field.name ?? field.label;
      return !String(source[key] ?? "").trim();
    });
  };

  // The core prompt sent to the shared backend. It's written to lock the
  // reply down to hotels only — no flights, no day-by-day itinerary, no
  // "book your whole trip" pitch — and to keep it short, warm, and
  // scannable, since this widget's whole job is to keep people engaged
  // with hotel options right here rather than pulling them elsewhere.
  const buildHotelMessageFromFields = (valuesOverride?: Record<string, string>) => {
    const source = valuesOverride ?? values;
    const details = activeFields
      .map((field) => {
        const key = field.name ?? field.label;
        const value = source[key] || "";
        return `- ${field.label}: ${value || "(not provided)"}`;
      })
      .join("\n");

    return [
      "You are the hotel concierge for this hotel-search widget only.",
      "Using the trip details below, respond with HOTEL SUGGESTIONS ONLY.",
      "Hard rules — do not break these:",
      "- Never mention flights, transport, or a full day-by-day itinerary.",
      "- Stay entirely on hotels: name, area/location, star rating, 1-2 standout amenities, and price per night.",
      "- Suggest 2-3 strong options when you can, each as one short, punchy line.",
      "- Keep the tone warm, confident, and concierge-like — you want the guest to book one of these stays with us.",
      "- Close with one short, inviting line nudging them to view details or refine the search, nothing more.",
      "",
      "Trip details:",
      details,
    ].join("\n");
  };

  // Core "send to planner backend" logic, shared by the field-based
  // "Find hotels" button and the free-typing floating chat box. Mirrors
  // AIPlanner's sendToPlanner, but only ever surfaces hotel info in chat.
  const sendHotelMessage = async (message: string, displayText?: string) => {
    if (isLoading || !message.trim()) return;

    // displayText lets us show a clean bubble to the user (e.g. their typed
    // reply) even when the actual payload sent to the backend is the fuller,
    // rule-laden prompt built from the form fields.
    setChatLog((current) => [...current, { role: "user", text: displayText ?? message }]);
    setIsLoading(true);
    setIsWidgetOpen(true);
    setHasUnread(false);

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
        throw new Error(`Hotel search failed: ${errorText}`);
      }

      const replyText = data?.reply || "Here's what I found.";
      setChatLog((current) => [...current, { role: "assistant", text: replyText }]);

      // Accept either a single hotel or a list, and normalize field names
      // so the concierge experience feels consistent no matter how the
      // backend happens to shape the payload.
      const rawHotels: any[] = Array.isArray(data?.hotels)
        ? data.hotels
        : data?.hotel
        ? [data.hotel]
        : [];

      const hotelCards: HotelCardData[] = rawHotels.map((hotel) => ({
        name: hotel.name || hotel.hotelName,
        location: hotel.location || hotel.city,
        rating: hotel.rating,
        pricePerNight: hotel.pricePerNight ?? hotel.price,
        imageUrl: hotel.imageUrl || hotel.image,
      }));

      if (hotelCards.length) {
        setChatLog((current) => [...current, { role: "assistant", hotels: hotelCards }]);
      }

      onFind?.();
    } catch (error: any) {
      console.error("AIHotelFinder request failed", error);
      const errorMessage = error?.message || "Sorry, something went wrong while finding hotels.";
      setChatLog((current) => [...current, { role: "assistant", text: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  // After a field gets answered (via the form or via chat), decide what
  // happens next: ask about the next missing field one at a time, or —
  // once nothing's left — send the locked-down hotel-only prompt.
  const askNextMissingOrFinish = async (
    answeredKey: string,
    updatedValues: Record<string, string>,
    autoSubmitWhenDone: boolean
  ) => {
    setMissingFieldKeys((prev) => prev.filter((k) => k !== answeredKey));
    const stillMissing = getMissingFields(updatedValues);

    if (stillMissing.length) {
      const nextField = stillMissing[0];
      const nextKey = nextField.name ?? nextField.label;
      setAwaitingFieldKey(nextKey);
      setMissingFieldKeys([nextKey]);
      setChatLog((current) => [
        ...current,
        { role: "assistant", text: buildSingleHotelFieldQuestion(nextField.label, false) },
      ]);
      setIsWidgetOpen(true);
      setHasUnread(false);
      return;
    }

    setAwaitingFieldKey(null);
    setMissingFieldKeys([]);

    if (autoSubmitWhenDone) {
      await sendHotelMessage(buildHotelMessageFromFields(updatedValues), "Here are all my details!");
    } else {
      setChatLog((current) => [
        ...current,
        { role: "assistant", text: "That's everything I need — hit Find hotels whenever you're ready! 🏨" },
      ]);
      setIsWidgetOpen(true);
      setHasUnread(false);
    }
  };

  // Fires when someone tabs/clicks out of the field we're currently asking
  // about in the form itself, so filling the form directly advances the
  // same one-at-a-time flow as answering in chat.
  const handleFieldBlur = async (key: string) => {
    if (key !== awaitingFieldKey) return;
    const value = values[key];
    if (!value || !value.trim()) return;
    await askNextMissingOrFinish(key, values, false);
  };

  const handleFind = async () => {
    const missingFields = getMissingFields();

    if (missingFields.length) {
      // Only ever ask about the FIRST missing field — the rest get asked
      // one at a time as each answer comes in.
      const firstField = missingFields[0];
      const firstKey = firstField.name ?? firstField.label;
      setAwaitingFieldKey(firstKey);
      setMissingFieldKeys([firstKey]);
      setChatLog((current) => [
        ...current,
        { role: "assistant", text: buildSingleHotelFieldQuestion(firstField.label, true) },
      ]);
      setIsWidgetOpen(true);
      setHasUnread(false);
      return;
    }

    setAwaitingFieldKey(null);
    setMissingFieldKeys([]);
    await sendHotelMessage(buildHotelMessageFromFields(), "Here are all my details!");
  };

  const handleSendChatInput = async () => {
    const message = chatInput.trim();
    if (!message) return;
    setChatInput("");

    // If we just asked about a specific field, treat this reply as the
    // answer to THAT field, fill it in, then move on to the next missing
    // one (or wrap up) — one question at a time.
    if (awaitingFieldKey) {
      setChatLog((current) => [...current, { role: "user", text: message }]);
      const updatedValues = { ...values, [awaitingFieldKey]: message };
      setValues(updatedValues);
      await askNextMissingOrFinish(awaitingFieldKey, updatedValues, true);
      return;
    }

    await sendHotelMessage(message);
  };

  return (
    <>
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

          {/* CTA */}
          <button
            onClick={handleFind}
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

      {/* ── Floating chat widget: fixed to the bottom-right of the VIEWPORT ── */}
      <style>{`
        .hotel-chat-fab {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 58px;
          height: 58px;
          border-radius: 50%;
          border: none;
          background: ${C.orange};
          box-shadow: 0 12px 28px rgba(255,104,44,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1000;
          transition: transform 0.15s ease;
        }
        .hotel-chat-fab:hover { transform: scale(1.06); }
        .hotel-chat-fab-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #ff3b3b;
          border: 2px solid ${C.navyDeep};
        }
        .hotel-chat-panel {
          position: fixed;
          bottom: 96px;
          right: 24px;
          width: 340px;
          max-width: calc(100vw - 32px);
          height: 460px;
          max-height: calc(100vh - 140px);
          background: ${C.navyDeep};
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 18px;
          box-shadow: 0 30px 70px rgba(0,0,0,0.5);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          z-index: 1000;
        }
        .hotel-chat-header {
          padding: 14px 16px;
          background: linear-gradient(135deg, ${C.navy} 0%, ${C.navyDeep} 100%);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .hotel-chat-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .hotel-chat-message {
          border-radius: 16px;
          padding: 10px 14px;
          line-height: 1.5;
          font-family: ${FONT};
          font-size: 13px;
          max-width: 85%;
          white-space: pre-wrap;
        }
        .hotel-chat-message.user {
          background: ${C.orange};
          color: #fff;
          align-self: flex-end;
          border-bottom-right-radius: 4px;
        }
        .hotel-chat-message.assistant {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          align-self: flex-start;
          border-bottom-left-radius: 4px;
        }
        .hotel-chat-empty {
          margin: auto;
          text-align: center;
          font-family: ${FONT};
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          padding: 0 20px;
        }
        .hotel-chat-input-row {
          display: flex;
          gap: 8px;
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.02);
        }
        .hotel-chat-input {
          flex: 1;
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.06);
          color: #fff;
          font-family: ${FONT};
          font-size: 13px;
          outline: none;
        }
        .hotel-chat-send {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: ${C.orange};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }
        @media (max-width: 480px) {
          .hotel-chat-panel {
            right: 16px;
            bottom: 88px;
            width: calc(100vw - 32px);
          }
          .hotel-chat-fab { right: 16px; bottom: 16px; }
        }
      `}</style>

      {isWidgetOpen && (
        <div className="hotel-chat-panel" role="dialog" aria-label="Hotel finder chat">
          <div className="hotel-chat-header">
            <div>
              <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 14, color: "#fff" }}>
                Hotel Finder Chat
              </div>
              <div style={{ fontFamily: FONT, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                {isLoading ? "Searching…" : "Ask about stays anytime"}
              </div>
            </div>
            <button
              onClick={() => setIsWidgetOpen(false)}
              aria-label="Close chat"
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "none",
                background: "rgba(255,255,255,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <IconClose />
            </button>
          </div>

          <div className="hotel-chat-body" ref={chatBodyRef}>
            {chatLog.length === 0 && !isLoading && (
              <div className="hotel-chat-empty">
                Fill in the search form or just type below to find your perfect stay.
              </div>
            )}
            {chatLog.map((item, index) => {
              if (item.hotels) {
                return (
                  <div
                    key={`hotels-${index}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      alignSelf: "flex-start",
                      maxWidth: "92%",
                    }}
                  >
                    {item.hotels.map((hotel, hotelIndex) => (
                      <ChatHotelCard key={hotelIndex} hotel={hotel} />
                    ))}
                  </div>
                );
              }
              return (
                <div key={`${item.role}-${index}`} className={`hotel-chat-message ${item.role}`}>
                  {item.text}
                </div>
              );
            })}
            {isLoading && (
              <div className="hotel-chat-message assistant">Looking up hotels…</div>
            )}
          </div>

          <div className="hotel-chat-input-row">
            <input
              className="hotel-chat-input"
              placeholder="Type a message…"
              aria-label="Chat message"
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleSendChatInput();
                }
              }}
              disabled={isLoading}
            />
            <button
              className="hotel-chat-send"
              onClick={handleSendChatInput}
              disabled={isLoading || !chatInput.trim()}
              aria-label="Send message"
              style={{ opacity: isLoading || !chatInput.trim() ? 0.6 : 1 }}
            >
              <IconSend />
            </button>
          </div>
        </div>
      )}

      <button
        className="hotel-chat-fab"
        onClick={() => {
          setIsWidgetOpen((open) => !open);
          setHasUnread(false);
        }}
        aria-label="Toggle hotel chat"
      >
        <IconChatBubble />
        {hasUnread && <span className="hotel-chat-fab-badge" />}
      </button>
    </>
  );
}