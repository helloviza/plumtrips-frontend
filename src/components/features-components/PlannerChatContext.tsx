import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { getBackendOrigin } from "../../lib/backendOrigin";
import type { PlannerField } from "./types";

type ChatMessage = { role: "user" | "assistant"; text: string };

function isNonAIField(key: string): boolean {
  const normalized = key.trim().toLowerCase();
  return normalized === "phonenumber" || normalized === "contactphone";
}

// Turns a raw field label ("Budget", "Adults", "Trip Vibe"...) into a
// natural, first-person phrase so we can ask about it the way a person
// would, instead of echoing the form label back like a validator.
function describeFieldNaturally(label: string): string {
  const key = label.toLowerCase();
  if (key.includes("destination")) return "where you're dreaming of going";
  if (key.includes("origin") || key.includes("from")) return "which city you'll be setting off from";
  if (key.includes("date") || key.includes("when")) return "when you're hoping to travel";
  if (key.includes("budget") || key.includes("price") || key.includes("cost")) return "roughly what budget you have in mind";
  if (key.includes("child")) return "how many kids will be joining";
  if (key.includes("adult") || key.includes("traveler") || key.includes("guest") || key.includes("people")) return "how many of you are travelling";
  if (key.includes("vibe") || key.includes("style") || key.includes("mood")) return "what kind of vibe you're after for this trip";
  if (key.includes("night") || key.includes("duration") || key.includes("day")) return "how many days you'd like to be away";
  return `your ${label.toLowerCase()}`;
}

// A few warm, varied openers so the very first question doesn't feel
// copy-pasted every time someone opens the planner.
const FRIENDLY_OPENERS = [
  "Before I get going, ",
  "One quick thing — ",
  "Happy to start planning! First, ",
  "Almost there — just ",
];

// A few short, varied acknowledgements used between questions so a
// multi-question flow still feels like a real back-and-forth conversation.
const CONTINUATION_OPENERS = [
  "Got it, thanks! ",
  "Perfect, noted. ",
  "Great, thank you! ",
  "Awesome. ",
];

// Asks about exactly ONE missing field at a time — never the whole list —
// so filling in a multi-field gap feels like a short back-and-forth
// conversation instead of a wall of validation text.
function buildSingleFieldQuestion(label: string, isFirstQuestion: boolean): string {
  const ask = describeFieldNaturally(label);
  if (isFirstQuestion) {
    const opener = FRIENDLY_OPENERS[Math.floor(Math.random() * FRIENDLY_OPENERS.length)];
    return `${opener}could you tell me ${ask}? 😊`;
  }
  const opener = CONTINUATION_OPENERS[Math.floor(Math.random() * CONTINUATION_OPENERS.length)];
  return `${opener}And could you tell me ${ask}?`;
}

interface PlannerChatContextValue {
  activeFields: PlannerField[];
  values: Record<string, string>;
  missingFieldKeys: string[];
  awaitingFieldKey: string | null;
  chatLog: ChatMessage[];
  isLoading: boolean;
  customFieldLabel: string;
  isWidgetOpen: boolean;
  hasUnread: boolean;
  chatInput: string;
  chatBodyRef: React.RefObject<HTMLDivElement | null>;
  setChatInput: (value: string) => void;
  setIsWidgetOpen: (value: boolean | ((open: boolean) => boolean)) => void;
  setHasUnread: (value: boolean) => void;
  setCustomFieldLabel: (value: string) => void;
  handleFieldChange: (key: string, value: string) => void;
  handleFieldBlur: (key: string) => Promise<void>;
  handleGenerate: () => Promise<void>;
  handleSendChatInput: (msg?: string) => Promise<void>;
  handleAddCustomField: () => void;
}

const PlannerChatContext = createContext<PlannerChatContextValue | null>(null);

export function PlannerChatProvider({
  fields,
  onGenerate,
  children,
}: {
  fields: PlannerField[];
  onGenerate?: () => void;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const [activeFields, setActiveFields] = useState<PlannerField[]>(fields);
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.name ?? field.label, ""]))
  );
  const [missingFieldKeys, setMissingFieldKeys] = useState<string[]>([]);
  // The one field we're currently asking about — we only ever ask about a
  // single missing field at a time, never the whole list at once.
  const [awaitingFieldKey, setAwaitingFieldKey] = useState<string | null>(null);

  // Shared chat state — used by BOTH the form's "Generate" button and the
  // floating chat widget, so every message lands in one single conversation.
  const [chatLog, setChatLog] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi! I'm Pluto AI ✨\n\nI can help you build custom itineraries, find top-rated hotels, or discover hidden gems. How can I help you plan your trip today?",
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [customFieldLabel, setCustomFieldLabel] = useState("");

  // Floating widget state
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const chatBodyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setActiveFields(fields);
    setValues((current) => ({
      ...Object.fromEntries(fields.map((field) => [field.name ?? field.label, ""])),
      ...current,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  // Auto-scroll to the latest message whenever the log changes
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
      sid =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `plumml-${Date.now()}`;
      window.localStorage.setItem("plumml_session_id", sid);
    }
    return sid;
  }, []);

  const handleFieldChange = (key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    // As soon as someone starts filling in a field we flagged, clear its error state.
    if (value.trim()) {
      setMissingFieldKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : prev));
    }
  };

  // Looks up which fields are still empty, optionally against a fresher
  // values object (useful right after a setValues call, since state
  // updates aren't visible synchronously).
  const getMissingFields = (valuesOverride?: Record<string, string>) => {
    const source = valuesOverride ?? values;
    return activeFields.filter((field) => {
      const key = field.name ?? field.label;
      if (isNonAIField(key)) return false;
      return !String(source[key] ?? "").trim();
    });
  };

  // After a field gets answered (via the form or via chat), this decides
  // what happens next: ask about the next missing field one at a time, or
  // — once nothing's left — either auto-continue the conversation or just
  // let the person know they're ready to hit Generate.
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
        { role: "assistant", text: buildSingleFieldQuestion(nextField.label, false) },
      ]);
      setIsWidgetOpen(true);
      setHasUnread(false);
      return;
    }

    setAwaitingFieldKey(null);
    setMissingFieldKeys([]);

    if (autoSubmitWhenDone) {
      await sendToPlanner(buildMessageFromFields(updatedValues));
    } else {
      setChatLog((current) => [
        ...current,
        { role: "assistant", text: "That's everything I need — hit Generate whenever you're ready! 🎉" },
      ]);
      setIsWidgetOpen(true);
      setHasUnread(false);
    }
  };

  // Fires when someone tabs/clicks out of the field we're currently
  // asking about in the form itself — lets typing directly into the form
  // advance the same one-at-a-time flow as answering in chat.
  const handleFieldBlur = async (key: string) => {
    if (key !== awaitingFieldKey) return;
    const value = values[key];
    if (!value || !value.trim()) return;
    await askNextMissingOrFinish(key, values, false);
  };

  const buildMessageFromFields = (valuesOverride?: Record<string, string>) => {
    const source = valuesOverride ?? values;
    return [
      "Please use the information below to start the travel planning conversation.",
      ...activeFields
        .filter((field) => !isNonAIField(field.name ?? field.label))
        .map((field) => {
          const key = field.name ?? field.label;
          const value = source[key] || "";
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

  // Core "send to planner backend" logic, shared by the field-based
  // Generate button and the free-typing floating chat box.
  const savePlannerSubmission = async () => {
    const BACKEND = getBackendOrigin();
    const contactPhone = values.phoneNumber || values.contactPhone || "";
    try {
      await fetch(`${BACKEND}/api/v1/plumml/submission`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, formValues: values, contactPhone }),
      });
    } catch {
      /* ignore persistence failures */
    }
  };

  const sendToPlanner = async (message: string) => {
    if (isLoading || !message.trim()) return;

    setChatLog((current) => [...current, { role: "user", text: message }]);
    setIsLoading(true);
    setIsWidgetOpen(true);
    setHasUnread(false);

    const BACKEND = getBackendOrigin();
    const contactPhone = values.phoneNumber || values.contactPhone || "";
    try {
      const response = await fetch(`${BACKEND}/api/v1/plumml/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, message, formValues: values, contactPhone }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const errorText = data?.error || data?.message || response.statusText || "Unknown error";
        throw new Error(`Planner request failed: ${errorText}`);
      }

      const replyText = data?.reply || "Planner responded without text.";
      setChatLog((current) => [...current, { role: "assistant", text: replyText }]);
      void savePlannerSubmission();

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

  const handleGenerate = async () => {
    const missingFields = getMissingFields();

    if (missingFields.length) {
      // Only ever ask about the FIRST missing field — the rest will be
      // asked one at a time as each answer comes in.
      const firstField = missingFields[0];
      const firstKey = firstField.name ?? firstField.label;
      setAwaitingFieldKey(firstKey);
      setMissingFieldKeys([firstKey]);
      setChatLog((current) => [
        ...current,
        { role: "assistant", text: buildSingleFieldQuestion(firstField.label, true) },
      ]);
      setIsWidgetOpen(true);
      setHasUnread(false);
      return;
    }

    setAwaitingFieldKey(null);
    setMissingFieldKeys([]);
    await sendToPlanner(buildMessageFromFields());
  };

  const handleSendChatInput = async (msg?: string) => {
    const message = (msg ?? chatInput).trim();
    if (!message) return;
    if (!msg) setChatInput("");

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

    await sendToPlanner(message);
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

  const value: PlannerChatContextValue = {
    activeFields,
    values,
    missingFieldKeys,
    awaitingFieldKey,
    chatLog,
    isLoading,
    customFieldLabel,
    isWidgetOpen,
    hasUnread,
    chatInput,
    chatBodyRef,
    setChatInput,
    setIsWidgetOpen,
    setHasUnread,
    setCustomFieldLabel,
    handleFieldChange,
    handleFieldBlur,
    handleGenerate,
    handleSendChatInput,
    handleAddCustomField,
  };

  return <PlannerChatContext.Provider value={value}>{children}</PlannerChatContext.Provider>;
}

export function usePlannerChat() {
  const ctx = useContext(PlannerChatContext);
  if (!ctx) {
    throw new Error("usePlannerChat must be used within a PlannerChatProvider");
  }
  return ctx;
}