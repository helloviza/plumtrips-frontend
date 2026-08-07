import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { C, FONT, IconArrow } from "./token";
import type { AIPlannerProps, PlannerField } from "./types";
import { Link } from "react-router-dom";

import { useCurrency } from "../../context/currencyContext";
import { usePlannerChat } from "./PlannerChatContext";
import { searchCities } from "../../hooks/useHotelApi";

// ─── DESTINATION DETECTION ──────────────────────────────────────
const DESTINATION_PATTERN = /destination|where.*(go|travel)|\bcity\b/i;
function isDestinationField(f: PlannerField): boolean {
  const key = f.name ?? f.label ?? "";
  return DESTINATION_PATTERN.test(key) || DESTINATION_PATTERN.test(f.label ?? "");
}

// ─── DURATION / DATE-RANGE DETECTION ────────────────────────────
// Matches fields meant to capture a travel date range: "Duration",
// "Dates", "When", "Check-in / Check-out", "Travel dates", etc.
const DURATION_PATTERN = /duration|dates?|when|check.?in|check.?out|travel.?dates?/i;
function isDurationField(f: PlannerField): boolean {
  const key = f.name ?? f.label ?? "";
  return DURATION_PATTERN.test(key) || DURATION_PATTERN.test(f.label ?? "");
}

function isTravelersField(f: PlannerField): boolean {
  return f.name === "travelers" || /travelers?/i.test(f.label ?? "");
}

function isTripVibeField(f: PlannerField): boolean {
  return f.name === "tripVibe" || /vibe|mood/i.test(f.label ?? "");
}

// ─── CITY SEARCH ─────────────────────────────────────────────────
interface CitySearchResult {
  cityCode?: string;
  countryCode?: string;
  name?: string;
  cityName?: string;
  city?: string;
  country?: string;
}

function getCityLabel(city: CitySearchResult): string {
  return city.name ?? city.cityName ?? city.city ?? city.cityCode ?? "Unknown";
}

const SEARCH_DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

/** Debounced, cancellation-safe city search. Only fetches while `enabled`. */
function useCitySearch(query: string, enabled: boolean) {
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const trimmed = query.trim();
    if (!enabled || trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const cities = await searchCities(trimmed);
        if (requestIdRef.current === requestId) {
          setResults(cities ?? []);
        }
      } catch (err) {
        if (requestIdRef.current === requestId) {
          setResults([]);
          console.error("City search failed:", err);
        }
      } finally {
        if (requestIdRef.current === requestId) setLoading(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query, enabled]);

  return { results, loading };
}

// ─── DATE HELPERS ────────────────────────────────────────────────
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function pad2(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatISO(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Parses "YYYY-MM-DD to YYYY-MM-DD" back into Date objects (for re-opening the picker). */
function parseRangeValue(value: string): { start: Date | null; end: Date | null } {
  const match = value.match(/^(\d{4}-\d{2}-\d{2})\s*to\s*(\d{4}-\d{2}-\d{2})$/);
  if (!match) return { start: null, end: null };
  const [, startStr, endStr] = match;
  const start = new Date(`${startStr}T00:00:00`);
  const end = new Date(`${endStr}T00:00:00`);
  return {
    start: isNaN(start.getTime()) ? null : start,
    end: isNaN(end.getTime()) ? null : end,
  };
}

/** Builds a 7-column week matrix for the given month, padded with nulls. */
function getMonthMatrix(viewDate: Date): (Date | null)[][] {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// ─── SHARED FIELD CHROME (label + input box) ────────────────────
const labelStyle = (isMissing?: boolean): React.CSSProperties => ({
  display: "block",
  fontFamily: FONT,
  fontSize: 11,
  fontWeight: 600,
  color: isMissing ? "#ff9a7a" : "rgba(255,255,255,0.55)",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  marginBottom: 6,
  transition: "color 0.15s ease",
});

const inputStyle = (isMissing?: boolean): React.CSSProperties => ({
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
});

// ─── PLAIN FIELD (unchanged behaviour) ──────────────────────────
function Field({
  label,
  placeholder,
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
      <label style={labelStyle(isMissing)}>{displayLabel}</label>
      <input
        placeholder={displayPlaceholder}
        aria-label={displayLabel}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        style={inputStyle(isMissing)}
      />
    </div>
  );
}

// ─── DESTINATION FIELD (city autocomplete) ──────────────────────
function DestinationField({
  label,
  placeholder,
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
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const { results, loading } = useCitySearch(value, open);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  useEffect(() => setHighlighted(-1), [results]);

  const handleSelect = useCallback(
    (city: CitySearchResult) => {
      onChange(getCityLabel(city));
      setOpen(false);
      onBlur?.();
    },
    [onChange, onBlur]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || results.length === 0) return;
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlighted((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlighted((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        if (highlighted >= 0) {
          e.preventDefault();
          handleSelect(results[highlighted]);
        }
        break;
      case "Escape":
        setOpen(false);
        break;
    }
  };

  const showDropdown = open && value.trim().length >= MIN_QUERY_LENGTH;

  return (
    <div ref={containerRef} style={{ gridColumn: "auto", position: "relative" }}>
      <label style={labelStyle(isMissing)}>{label}</label>
      <input
        placeholder={placeholder}
        aria-label={label}
        value={value}
        autoComplete="off"
        role="combobox"
        aria-expanded={showDropdown}
        aria-autocomplete="list"
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        style={inputStyle(isMissing)}
      />

      {showDropdown && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 30,
            maxHeight: 240,
            overflowY: "auto",
            borderRadius: 10,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(15,26,48,0.98)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
          }}
        >
          {loading && (
            <div style={{ padding: "10px 14px", fontFamily: FONT, fontSize: 12.5, color: "rgba(255,255,255,0.5)" }}>
              Searching…
            </div>
          )}
          {!loading && results.length === 0 && (
            <div style={{ padding: "10px 14px", fontFamily: FONT, fontSize: 12.5, color: "rgba(255,255,255,0.5)" }}>
              No matches
            </div>
          )}
          {!loading &&
            results.map((city, idx) => (
              <button
                key={city.cityCode ?? `${getCityLabel(city)}-${idx}`}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(city);
                }}
                onMouseEnter={() => setHighlighted(idx)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "9px 14px",
                  border: "none",
                  background: idx === highlighted ? "rgba(255,104,44,0.16)" : "transparent",
                  color: "#fff",
                  fontFamily: FONT,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                {getCityLabel(city)}
                {city.country && (
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}> · {city.country}</span>
                )}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}

// ─── DATE-RANGE FIELD (duration calendar) ───────────────────────
function DateRangeField({
  label,
  placeholder,
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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => startOfDay(new Date()), []);
  const parsed = useMemo(() => parseRangeValue(value), [value]);

  const [rangeStart, setRangeStart] = useState<Date | null>(parsed.start);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(parsed.end);
  const [viewDate, setViewDate] = useState<Date>(parsed.start ?? today);

  // Keep internal selection in sync if the value changes/clears externally.
  useEffect(() => {
    setRangeStart(parsed.start);
    setRangeEnd(parsed.end);
    if (parsed.start) setViewDate(parsed.start);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open, onBlur]);

  const commitRange = useCallback(
    (start: Date, end: Date) => {
      // Final string shape: "2026-09-26 to 2026-09-28"
      onChange(`${formatISO(start)} to ${formatISO(end)}`);
    },
    [onChange]
  );

  const handleDayClick = (day: Date) => {
    if (day < today) return; // no past dates, ever

    if (!rangeStart || (rangeStart && rangeEnd)) {
      // Start a fresh selection.
      setRangeStart(day);
      setRangeEnd(null);
      return;
    }

    // rangeStart is set, rangeEnd isn't yet — this click completes the range.
    if (day < rangeStart) {
      setRangeStart(day);
      setRangeEnd(null);
      return;
    }

    setRangeEnd(day);
    commitRange(rangeStart, day);
    setOpen(false);
    onBlur?.();
  };

  const canGoPrev =
    viewDate.getFullYear() > today.getFullYear() ||
    (viewDate.getFullYear() === today.getFullYear() && viewDate.getMonth() > today.getMonth());

  const goPrevMonth = () => {
    if (!canGoPrev) return;
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  };
  const goNextMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  };

  const weeks = useMemo(() => getMonthMatrix(viewDate), [viewDate]);

  const isInRange = (day: Date) => {
    if (!rangeStart) return false;
    const end = rangeEnd ?? rangeStart;
    const lo = rangeStart < end ? rangeStart : end;
    const hi = rangeStart < end ? end : rangeStart;
    return day >= lo && day <= hi;
  };
  const isEndpoint = (day: Date) =>
    (!!rangeStart && day.getTime() === rangeStart.getTime()) ||
    (!!rangeEnd && day.getTime() === rangeEnd.getTime());

  return (
    <div ref={containerRef} style={{ gridColumn: "auto", position: "relative" }}>
      <label style={labelStyle(isMissing)}>{label}</label>
      <input
        placeholder={placeholder}
        aria-label={label}
        value={value}
        readOnly
        onClick={() => setOpen((o) => !o)}
        style={{ ...inputStyle(isMissing), cursor: "pointer" }}
      />

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            zIndex: 30,
            width: 280,
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(15,26,48,0.98)",
            backdropFilter: "blur(18px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.45)",
            padding: 14,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <button
              type="button"
              onClick={goPrevMonth}
              disabled={!canGoPrev}
              style={{
                background: "transparent",
                border: "none",
                color: canGoPrev ? "#fff" : "rgba(255,255,255,0.25)",
                cursor: canGoPrev ? "pointer" : "default",
                fontFamily: FONT,
                fontSize: 16,
                padding: "2px 8px",
              }}
            >
              ‹
            </button>
            <div style={{ fontFamily: FONT, fontSize: 13, fontWeight: 600, color: "#fff" }}>
              {MONTH_LABELS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </div>
            <button
              type="button"
              onClick={goNextMonth}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                cursor: "pointer",
                fontFamily: FONT,
                fontSize: 16,
                padding: "2px 8px",
              }}
            >
              ›
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 4 }}>
            {WEEKDAY_LABELS.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontFamily: FONT,
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  fontWeight: 600,
                  padding: "4px 0",
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {weeks.map((week, wIdx) => (
            <div key={wIdx} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2 }}>
              {week.map((day, dIdx) => {
                if (!day) return <div key={dIdx} />;
                const disabled = day < today;
                const inRange = isInRange(day);
                const endpoint = isEndpoint(day);
                return (
                  <button
                    key={dIdx}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleDayClick(day)}
                    style={{
                      aspectRatio: "1",
                      border: "none",
                      borderRadius: 8,
                      background: endpoint ? C.orange : inRange ? "rgba(255,104,44,0.22)" : "transparent",
                      color: disabled ? "rgba(255,255,255,0.2)" : "#fff",
                      fontFamily: FONT,
                      fontSize: 12,
                      cursor: disabled ? "default" : "pointer",
                    }}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── TRAVELERS DROPDOWN FIELD ────────────────────────────────────
function TravelersDropdownField({
  label,
  placeholder,
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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  // Sync internal state -> value only when dropdown closes or value initially parsed
  useEffect(() => {
    let str = `${adults} Adult${adults !== 1 ? 's' : ''}`;
    if (children >= 0) str += ` with ${children} Child${children > 1 ? 'ren' : ''}`;
    if (infants >= 0) str += ` & with ${infants} Infant${infants > 1 ? 's' : ''}`;
    onChange(str);
  }, [adults, children, infants]);

  // Click outside logic
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open, onBlur]);

  const Counter = ({ title, desc, val, setVal, min }: any) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <div>
        <div style={{ fontFamily: FONT, fontSize: 14, color: "#fff", fontWeight: 600 }}>{title}</div>
        <div style={{ fontFamily: FONT, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{desc}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          onClick={() => setVal(Math.max(min, val - 1))}
          disabled={val <= min}
          style={{
            width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)",
            background: "transparent", color: val <= min ? "rgba(255,255,255,0.2)" : "#fff",
            cursor: val <= min ? "default" : "pointer", fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >-</button>
        <div style={{ fontFamily: FONT, fontSize: 14, color: "#fff", minWidth: 16, textAlign: "center" }}>{val}</div>
        <button
          type="button"
          onClick={() => setVal(val + 1)}
          style={{
            width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)",
            background: "transparent", color: "#fff", cursor: "pointer", fontSize: 18,
            display: "flex", alignItems: "center", justifyContent: "center"
          }}
        >+</button>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} style={{ gridColumn: "auto", position: "relative" }}>
      <label style={labelStyle(isMissing)}>{label}</label>
      <input
        placeholder={placeholder}
        aria-label={label}
        value={value || "1 Adult"}
        readOnly
        onClick={() => setOpen((o) => !o)}
        style={{ ...inputStyle(isMissing), cursor: "pointer" }}
      />
      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 30, width: 300,
            borderRadius: 12, border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(15,26,48,0.98)", backdropFilter: "blur(18px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.45)", padding: 18,
          }}
        >
          <Counter title="Adults" desc="Ages 12 or above" val={adults} setVal={setAdults} min={1} />
          <Counter title="Children" desc="Ages 2 - 11" val={children} setVal={setChildren} min={0} />
          <Counter title="Infants" desc="Under 2" val={infants} setVal={setInfants} min={0} />
          
          <button
            type="button"
            onClick={() => { setOpen(false); onBlur?.(); }}
            style={{
              marginTop: 12, width: "100%", padding: "10px", borderRadius: 8,
              background: C.orange, color: "#fff", border: "none", fontFamily: FONT,
              fontWeight: 600, cursor: "pointer"
            }}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}

// ─── TRIP VIBE DROPDOWN FIELD ────────────────────────────────────
function TripVibeDropdownField({
  label,
  placeholder,
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
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options = ["Adventure", "Relaxation", "Luxury", "Family", "Romantic", "Solo", "Business"];

  // Click outside logic
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        onBlur?.();
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open, onBlur]);

  return (
    <div ref={containerRef} style={{ gridColumn: "auto", position: "relative" }}>
      <label style={labelStyle(isMissing)}>{label}</label>
      <input
        placeholder={placeholder}
        aria-label={label}
        value={value}
        readOnly
        onClick={() => setOpen((o) => !o)}
        style={{ ...inputStyle(isMissing), cursor: "pointer" }}
      />
      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 30,
            borderRadius: 12, border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(15,26,48,0.98)", backdropFilter: "blur(18px)",
            boxShadow: "0 20px 40px rgba(0,0,0,0.45)", maxHeight: 240, overflowY: "auto"
          }}
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => {
                onChange(opt);
                setOpen(false);
                onBlur?.();
              }}
              style={{
                display: "block", width: "100%", textAlign: "left", padding: "10px 14px",
                border: "none", background: value === opt ? "rgba(255,104,44,0.16)" : "transparent",
                color: value === opt ? C.orange : "#fff", fontFamily: FONT, fontSize: 13, cursor: "pointer"
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
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
              const fieldProps = {
                ...f,
                value: values[key] ?? "",
                onChange: (value: string) => handleFieldChange(key, value),
                onBlur: () => handleFieldBlur(key),
                isMissing: missingFieldKeys.includes(key),
              };
              if (isDestinationField(f)) {
                return <DestinationField key={key} {...fieldProps} />;
              }
              if (isDurationField(f)) {
                return <DateRangeField key={key} {...fieldProps} />;
              }
              if (isTravelersField(f)) {
                return <TravelersDropdownField key={key} {...fieldProps} />;
              }
              if (isTripVibeField(f)) {
                return <TripVibeDropdownField key={key} {...fieldProps} />;
              }
              return <Field key={key} {...fieldProps} />;
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