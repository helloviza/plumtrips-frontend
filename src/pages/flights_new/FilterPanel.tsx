// ============================================================
//  FilterPanel.tsx — desktop sidebar filters, mobile filter
//  drawer, and the mobile sort chip.
//
//  UI redesigned to match the reference layout (collapsible
//  accordion sections, checkbox-style stops list, airline
//  "show more", etc). All filter state, shapes, and the
//  onChange/onReset contract are unchanged.
//
//  BUG FIX: the Airlines checkbox handler used to rebuild the
//  selection from the full `airlines` list instead of the
//  current `filters.airlines` selection, so unchecking a second
//  airline could silently re-check one you'd already unchecked.
//  Fixed below — see the `toggleAirline` function.
// ============================================================

import { useState, useEffect } from "react";
import type { DisplayFlight } from "../../lib/types_t";
import { useCurrency } from "../../context/currencyContext";
import { S, TIME_SLOTS, type ExtendedFilters, AirlineLogo } from "./ResultShared";

const AIRLINES_PREVIEW_COUNT = 5;

// ─── FILTER PANEL ──────────────────────────────────────────

export function FilterPanel({
  flights, filters, onChange, onReset, mobile,
}: {
  flights: DisplayFlight[];
  filters: ExtendedFilters;
  onChange: (f: ExtendedFilters) => void;
  onReset: () => void;
  mobile?: boolean;
}) {
  const airlines = [...new Set(flights.map(f => f.airline))].sort();
  const prices = flights.map(f => f.price);
  const maxP = prices.length ? Math.max(...prices) : 20000;
  const minP = prices.length ? Math.min(...prices) : 1000;
  const { convert } = useCurrency();

  // Which accordion sections start open — matches the reference design
  // (Price / Stops / Airlines open, the rest collapsed). Purely visual
  // state — doesn't touch the filters object at all.
  const [open, setOpen] = useState<Record<string, boolean>>({
    price: true, stops: true, airlines: true,
    departure: false, refund: false, baggage: false, layover: false,
  });
  const toggleSection = (id: string) => setOpen(o => ({ ...o, [id]: !o[id] }));

  const [showAllAirlines, setShowAllAirlines] = useState(false);

  // Decorative only — no `lowCarbon` field exists on DisplayFlight yet,
  // so this doesn't call onChange / filter anything. Wire it up once
  // real carbon data is available on each flight.
  const [lowCarbonOnly, setLowCarbonOnly] = useState(false);

  const fsLabel: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: S.muted,
    textTransform: "uppercase", letterSpacing: "0.08em",
    fontFamily: "'Sora',sans-serif",
  };

  // Correctly toggles a single airline in/out of the current selection.
  // (filters.airlines === [] is treated as "everything selected".)
  function toggleAirline(a: string) {
    const isChecked = filters.airlines.length === 0 || filters.airlines.includes(a);
    const current = filters.airlines.length === 0 ? airlines : filters.airlines;
    const next = isChecked ? current.filter(x => x !== a) : [...current, a];
    onChange({ ...filters, airlines: next.length === airlines.length ? [] : next });
  }

  // Collapsible section wrapper with a chevron toggle
  const Section = ({
    id, title, children,
  }: { id: string; title: string; children: React.ReactNode }) => {
    const isOpen = open[id];
    return (
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${S.border}` }}>
        <button
          type="button"
          onClick={() => toggleSection(id)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", padding: 0, cursor: "pointer" }}
        >
          <span style={fsLabel}>{title}</span>
          <svg width={12} height={12} fill="none" stroke={S.muted} strokeWidth={2.4} viewBox="0 0 24 24"
            style={{ flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {isOpen && <div style={{ marginTop: 10 }}>{children}</div>}
      </div>
    );
  };

  return (
    <div style={mobile ? {} : {
      background: "#fff", borderRadius: 16, border: `1px solid ${S.border}`,
      overflow: "hidden", position: "sticky", top: 16,
      maxHeight: "calc(100vh - 32px)", overflowY: "auto",
      scrollbarWidth: "none",          /* Firefox */
      msOverflowStyle: "none",         /* IE/Edge */
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px 0",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingBottom: 14, borderBottom: `1px solid ${S.border}`,
      }}>
        <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 12, color: S.navyDeep, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Filters
        </span>
        <button
          onClick={onReset}
          style={{ fontSize: 11, color: S.accent, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans',sans-serif" }}
          onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
          onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
        >
          Clear all
        </button>
      </div>

      {/* Price Range */}
      <Section id="price" title="Price Range">
        <input
          type="range" min={minP} max={maxP} step={500}
          value={filters.maxPrice ?? maxP}
          onChange={e => onChange({ ...filters, maxPrice: Number(e.target.value) })}
          style={{ width: "100%", accentColor: S.navyDeep, margin: "4px 0 10px" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontFamily: "'Sora',sans-serif", fontWeight: 700 }}>
          <span style={{ color: S.muted }}>{convert(minP)}</span>
          <span style={{ color: S.muted }}>{convert(maxP)}</span>
        </div>
      </Section>

      {/* Stops — checkbox-style rows, mutually exclusive (same stops value/semantics as before) */}
      <Section id="stops" title="Stops">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {([0, 1, 2] as const).map(s => {
            const active = filters.stops === s;
            const label = s === 0 ? "Direct" : s === 1 ? "1 Stop" : "2+ Stops";
            const matching = flights.filter(f => (s === 2 ? f.stops >= 2 : f.stops === s));
            const price = matching.length ? Math.min(...matching.map(f => f.price)) : null;
            return (
              <button
                key={s}
                type="button"
                onClick={() => onChange({ ...filters, stops: filters.stops === s ? null : s })}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 10px", borderRadius: 9,
                  border: `1px solid ${active ? S.navyDeep : S.border}`,
                  background: active ? "#f0f6ff" : "#fff",
                  cursor: "pointer", transition: "all .15s",
                }}
              >
                <div style={{
                  width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                  border: `1.5px solid ${active ? S.navyDeep : S.borderMid}`,
                  background: active ? S.navyDeep : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .15s",
                }}>
                  {active && (
                    <svg width={9} height={9} fill="none" stroke="#fff" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span style={{ flex: 1, textAlign: "left", fontSize: 12.5, fontWeight: 700, color: S.navyDeep, fontFamily: "'Sora',sans-serif" }}>
                  {label}
                </span>
                {price !== null && (
                  <span style={{ fontSize: 12, fontWeight: 800, color: S.accent, fontFamily: "'Sora',sans-serif" }}>
                    {convert(price)}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Airlines */}
      {airlines.length > 0 && (
        <Section id="airlines" title="Airlines">
          <div>
            {(showAllAirlines ? airlines : airlines.slice(0, AIRLINES_PREVIEW_COUNT)).map((a, idx) => {
              const minPrice = Math.min(...flights.filter(f => f.airline === a).map(f => f.price));
              const checked = filters.airlines.length === 0 || filters.airlines.includes(a);
              const code = flights.find(f => f.airline === a)?.airlineCode ?? "";
              return (
                <div
                  key={a}
                  onClick={() => toggleAirline(a)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "7px 0",
                    borderTop: idx > 0 ? `1px solid #f0f5fc` : "none",
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: `1.5px solid ${checked ? S.navyDeep : S.borderMid}`,
                    background: checked ? S.navyDeep : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "all .15s",
                  }}>
                    {checked && (
                      <svg width={9} height={9} fill="none" stroke="#fff" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <AirlineLogo code={code} size="sm" />
                  <div style={{ flex: 1, minWidth: 0, fontSize: 12, fontWeight: 600, color: "#4a5e7a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: S.accent, fontFamily: "'Sora',sans-serif", flexShrink: 0 }}>
                    {convert(minPrice)}
                  </span>
                </div>
              );
            })}
            {airlines.length > AIRLINES_PREVIEW_COUNT && (
              <button
                type="button"
                onClick={() => setShowAllAirlines(v => !v)}
                style={{ marginTop: 8, background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: S.navyMid, fontFamily: "'Sora',sans-serif" }}
              >
                {showAllAirlines ? "Show less" : `Show ${airlines.length - AIRLINES_PREVIEW_COUNT} more`}
                <svg width={10} height={10} fill="none" stroke={S.navyMid} strokeWidth={2.4} viewBox="0 0 24 24"
                  style={{ transform: showAllAirlines ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
                </svg>
              </button>
            )}
          </div>
        </Section>
      )}

      {/* Departure time (collapsed by default, same slots/logic as before) */}
      <Section id="departure" title="Departure Time">
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {TIME_SLOTS.map(({ id, label, sub }) => {
            const active = filters.departureSlot === id;
            return (
              <button
                key={id}
                onClick={() => onChange({ ...filters, departureSlot: filters.departureSlot === id ? null : id })}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px", borderRadius: 9,
                  border: `1px solid ${active ? S.navyDeep : S.border}`,
                  background: active ? "#f0f6ff" : "#fff",
                  cursor: "pointer", transition: "all .15s",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.navyDeep, fontFamily: "'Sora',sans-serif" }}>{label}</div>
                  <div style={{ fontSize: 10, color: S.muted, marginTop: 1 }}>{sub}</div>
                </div>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                  border: `1.5px solid ${active ? S.navyDeep : S.borderMid}`,
                  background: active ? S.navyDeep : "transparent",
                  transition: "all .15s",
                }} />
              </button>
            );
          })}
        </div>
      </Section>

      {/* Baggage & Fare Type — placeholder section; no baggage/fare-type
          filter data exists on DisplayFlight yet, so this doesn't call
          onChange. Wire it up once that data is available. */}
      <Section id="baggage" title="Baggage & Fare Type">
        <div style={{ fontSize: 11.5, color: S.muted }}>More options coming soon.</div>
      </Section>

      {/* Refundability (renamed from "Fare type", same refundable/non-refundable toggle) */}
      <Section id="refund" title="Refundability">
        <div style={{ display: "flex", gap: 6 }}>
          {([
            { val: true,  label: "Refundable"     },
            { val: false, label: "Non-refundable"  },
          ] as const).map(({ val, label }) => {
            const active = filters.refundable === val;
            return (
              <button
                key={label}
                onClick={() => onChange({ ...filters, refundable: filters.refundable === val ? null : val })}
                style={{
                  flex: 1, padding: "7px 6px", borderRadius: 8,
                  fontSize: 11, fontWeight: 700, fontFamily: "'Sora',sans-serif",
                  border: `1px solid ${active ? S.green : S.borderMid}`,
                  background: active ? S.greenBg : "#fff",
                  color: active ? S.green : "#6b7fa3",
                  cursor: "pointer", transition: "all .15s",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Layover City — placeholder section; no layover-city data exists
          on DisplayFlight yet, so this doesn't call onChange. */}
      <Section id="layover" title="Layover City">
        <div style={{ fontSize: 11.5, color: S.muted }}>More options coming soon.</div>
      </Section>

      {/* Lower Carbon Flights — decorative toggle only (see note above the
          lowCarbonOnly state); doesn't filter results yet. */}
      <div style={{ padding: "14px 16px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
          <input
            type="checkbox" checked={lowCarbonOnly}
            onChange={e => setLowCarbonOnly(e.target.checked)}
            style={{ width: 16, height: 16, accentColor: S.green, flexShrink: 0 }}
          />
          <span style={{ fontSize: 12, fontWeight: 700, color: S.green, fontFamily: "'Sora',sans-serif" }}>
            🌿 Lower Carbon Flights
          </span>
        </label>
      </div>
    </div>
  );
}

// ─── MOBILE FILTER DRAWER ──────────────────────────────────

export function MobileFilterDrawer({
  flights, filters, onChange, onReset, onClose,
}: {
  flights: DisplayFlight[];
  filters: ExtendedFilters;
  onChange: (f: ExtendedFilters) => void;
  onReset: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={onClose} />
      <div style={{
        position: "relative", width: "100%", background: "#fff",
        borderRadius: "20px 20px 0 0", maxHeight: "90dvh",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: `1px solid ${S.border}`, flexShrink: 0,
        }}>
          <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: S.navyDeep }}>Filters</span>
          <button
            onClick={onClose}
            style={{ fontSize: 13, color: S.accent, fontWeight: 700, background: "none", border: "none", cursor: "pointer" }}
          >
            Done
          </button>
        </div>
        <div
          className="mobile-filter-scroll"
          style={{ overflowY: "auto", flex: 1, padding: "0 0 20px", scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <FilterPanel flights={flights} filters={filters} onChange={onChange} onReset={onReset} mobile />
        </div>
      </div>
    </div>
  );
}

// ─── SORT CHIP (mobile) ────────────────────────────────────

export function SortChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0, padding: "6px 14px", borderRadius: 20,
        fontSize: 11, fontWeight: 700, fontFamily: "'Sora',sans-serif",
        border: `1px solid ${active ? S.navyDeep : S.borderMid}`,
        background: active ? S.navyDeep : "#fff",
        color: active ? "#fff" : "#6b7fa3",
        cursor: "pointer", transition: "all .15s",
      }}
    >
      {label}
    </button>
  );
}