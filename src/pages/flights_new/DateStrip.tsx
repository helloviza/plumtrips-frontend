// ============================================================
//  DateStrip.tsx — the horizontal date/price scroller shown
//  under the search bar, plus the "Best Price Calendar /
//  Price Alert / Lower Carbon Flights" utility badges.
//
//  Per-date fares come from the SAME endpoint SearchPage's
//  calendar popup uses — apiGetCalendarPrices(from, to, cabin)
//  — just windowed down to the ~7 days this strip actually
//  shows, instead of rendering/fetching a full month grid.
//
//  Drop-in call from ResultsPage.tsx:
//
//    <DateStrip
//      baseDate={form.departDate}
//      fromCode={form.from?.code}
//      toCode={form.to?.code}
//      cabinClass={form.cabinClass}
//      selectedPrice={cheapestPrice}
//      currency={convert}
//      onSelectDate={(iso) => onNewSearch?.({ ...form, departDate: iso }, multiLegs)}
//    />
// ============================================================

import { useEffect, useRef, useState } from "react";
import { apiGetCalendarPrices } from "../../lib/flights_api";
import { S } from "./ResultShared";

interface DateStripProps {
  baseDate: string;               // ISO yyyy-mm-dd — the currently selected date
  fromCode?: string;
  toCode?: string;
  cabinClass?: string;
  selectedPrice: number | null;   // cheapest fare for the currently selected date (fallback only)
  currency: (amount: number) => string;
  onSelectDate: (iso: string) => void;
  /** Optional pre-fetched ISO-date → fare map. Skips the internal
   *  apiGetCalendarPrices() call when supplied. */
  prices?: Record<string, number>;
  /** How many days to show either side of baseDate. Default 3 (7 total). */
  spread?: number;
}

function toISO(d: Date) {
  // Build the date string from LOCAL components — never toISOString(),
  // which converts to UTC first and silently shifts the calendar date
  // by ±1 day depending on the browser's timezone offset. SearchPage's
  // calendar (toStr) keys its price map the same local-component way,
  // so this keeps DateStrip's lookups aligned with it.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function DateStrip({
  baseDate,
  fromCode,
  toCode,
  cabinClass,
  selectedPrice,
  currency,
  onSelectDate,
  prices: pricesProp,
  spread = 3,
}: DateStripProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [fetchedPrices, setFetchedPrices] = useState<Record<string, number>>({});

  // Fetch the same calendar-price map SearchPage uses, once per route/cabin.
  // We still only ever render the small window of dates below — no month
  // grid, no extra UI — this just reuses the existing pricing data source.
  useEffect(() => {
    if (pricesProp) return; // caller already supplied prices — don't fetch
    if (!fromCode || !toCode || fromCode === toCode) return;
    let cancelled = false;
    apiGetCalendarPrices(fromCode, toCode)
      .then(p => { if (!cancelled) setFetchedPrices(p); })
      .catch(() => { if (!cancelled) setFetchedPrices({}); });
    return () => { cancelled = true; };
  }, [fromCode, toCode, cabinClass, pricesProp]);

  const prices = pricesProp ?? fetchedPrices;

  const base = new Date(baseDate + "T00:00:00");
  if (isNaN(base.getTime())) return null;

  const dates = Array.from({ length: spread * 2 + 1 }, (_, i) =>
    new Date(base.getFullYear(), base.getMonth(), base.getDate() + (i - spread))
  );

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 200, behavior: "smooth" });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 12 }}>
      {/* Left nav */}
      <button onClick={() => scrollBy(-1)} aria-label="Earlier dates" style={navBtnStyle}>
        <svg width={14} height={14} fill="none" stroke={S.navyMid} strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Date pills */}
      <div
        ref={scrollerRef}
        className="date-strip-scroller"
        style={{ display: "flex", gap: 8, overflowX: "auto", scrollbarWidth: "none", flex: 1, minWidth: 0 }}
      >
        {dates.map(d => {
          const iso = toISO(d);
          const isSelected = iso === baseDate;
          // Real fare for this date if we have it; otherwise fall back to
          // the currently-selected date's cheapest fare so the pill still
          // shows something sensible rather than a blank/dash.
          const fare = prices[iso] ?? selectedPrice ?? null;
          const weekday = d.toLocaleDateString("en-IN", { weekday: "short" });
          const dayMonth = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

          return (
            <button
              key={iso}
              onClick={() => onSelectDate(iso)}
              style={{
                flex: "0 0 auto",
                minWidth: 92,
                borderRadius: 12,
                border: `1.5px solid ${isSelected ? S.accent : S.border}`,
                background: isSelected ? "#fff8f4" : "#fff",
                padding: "8px 12px",
                cursor: "pointer",
                textAlign: "center",
                transition: "border-color .15s, background .15s",
              }}
            >
              <div style={{
                fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 11.5,
                color: isSelected ? S.accentDk : S.navyDeep, whiteSpace: "nowrap",
              }}>
                {weekday}, {dayMonth}
              </div>
              <div style={{
                fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, marginTop: 3,
                color: isSelected ? S.accentDk : S.ink,
              }}>
                {fare != null ? currency(fare) : "—"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Right nav */}
      <button onClick={() => scrollBy(1)} aria-label="Later dates" style={navBtnStyle}>
        <svg width={14} height={14} fill="none" stroke={S.navyMid} strokeWidth={2.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Utility badges */}
      <div className="date-strip-badges" style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <UtilityBadge icon="💎" title="Best Price Calendar" subtitle="View Month" />
        <UtilityBadge icon="🔔" title="Price Alert" subtitle="Get Notified" />
        <UtilityBadge icon="🌱" title="Lower Carbon Flights" subtitle="Available" tone="green" />
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  flexShrink: 0,
  width: 32, height: 32, borderRadius: "50%",
  border: `1px solid ${S.border}`, background: "#fff",
  display: "flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer",
};

function UtilityBadge({
  icon, title, subtitle, tone = "navy",
}: { icon: string; title: string; subtitle: string; tone?: "navy" | "green" }) {
  const colors = tone === "green"
    ? { border: "#bbf7d0", bg: "#f0fdf6", fg: S.green }
    : { border: S.border, bg: "#fff", fg: S.navyDeep };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      border: `1px solid ${colors.border}`, background: colors.bg,
      borderRadius: 999, padding: "7px 14px", whiteSpace: "nowrap",
    }}>
      <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
      <div style={{ textAlign: "left" }}>
        <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 10.5, color: colors.fg, lineHeight: 1.2 }}>
          {title}
        </div>
        <div style={{ fontSize: 9.5, color: S.muted, fontWeight: 600, lineHeight: 1.2 }}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}