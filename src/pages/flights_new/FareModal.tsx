// ============================================================
//  FareModal.tsx — fare-tier selector modal, its per-tier card,
//  and the cancellation/reissue policy sub-modal. Lifted 1:1
//  out of ResultsPage.tsx — no behavioural changes.
// ============================================================

import { useState, useEffect } from "react";
import type { DisplayFlight, FareTier } from "../../lib/types_t";
import { MOCK_MODE } from "../../lib/flights_api";
import { useCurrency } from "../../context/currencyContext";
import { S, AirlineLogo, co2Badge } from "./ResultShared";

// ─── COMBINED-FARE HELPERS ──────────────────────────────────
//
// International "combined" round-trip fares (see flights_api.ts
// isCombinedItinerary) share ONE TBO ResultIndex for BOTH the outbound
// and return legs — it's a single bookable fare, not two independent
// legs. Given the ResultIndex the user just picked on the outbound side,
// find the return-flight/tier pair built from that exact same raw so we
// can auto-select it instead of letting the user pick an unrelated
// return option (picking two different ResultIndex values for one
// combined itinerary causes the return leg's FareQuote/SSR calls to fail
// against TBO — see BookingPage/flights_api SSR comments).
export function findMatchingReturnLeg(
  returnFlights: DisplayFlight[],
  resultIndex: string,
): { flight: DisplayFlight; tier: FareTier } | null {
  for (const rf of returnFlights) {
    if (rf.resultIndex === resultIndex) {
      const tier = rf.fareTiers?.find(t => t.resultIndex === resultIndex) ?? rf.fareTiers?.[0];
      if (tier) return { flight: rf, tier };
    }
    const tier = rf.fareTiers?.find(t => t.resultIndex === resultIndex);
    if (tier) return { flight: rf, tier };
  }
  return null;
}

// ─── FARE TIER CARD ────────────────────────────────────────

function FareTierCard({
  tier, selected, onSelect, onShowPolicy,
}: { tier: FareTier; selected: boolean; onSelect: () => void; onShowPolicy?: () => void }) {
  const { convert } = useCurrency();
  return (
    <div
      onClick={onSelect}
      style={{
        position: "relative",
        borderRadius: 16,
        border: `2px solid ${selected ? S.navyDeep : S.border}`,
        cursor: "pointer",
        transition: "all .2s",
        background: selected ? "#f0f6ff" : "#fff",
        overflow: "hidden",
      }}
    >
      {tier.recommended && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          background: S.accent, color: "#fff",
          fontSize: 9, fontWeight: 800, textAlign: "center",
          padding: "3px 0", letterSpacing: "0.1em",
          fontFamily: "'Sora', sans-serif", textTransform: "uppercase",
        }}>
          Best Value
        </div>
      )}
      <div style={{ padding: tier.recommended ? "28px 14px 14px" : "14px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: S.navyDeep }}>{tier.name}</div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: S.ink, marginTop: 2 }}>{convert(tier.totalOfferedFare)}</div>
            <div style={{ fontSize: 10, color: S.muted, marginTop: 1 }}>per adult</div>
          </div>
          <div style={{
            width: 18, height: 18, borderRadius: "50%", marginTop: 2, flexShrink: 0,
            border: `2px solid ${selected ? S.navyDeep : S.borderMid}`,
            background: selected ? S.navyDeep : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all .15s",
          }}>
            {selected && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            { icon: "🧳", label: "Check-in",    val: tier.checkinBag      },
            { icon: "💼", label: "Cabin",        val: tier.cabinBag        },
            { icon: "↩️", label: "Cancel",       val: tier.cancellationFee },
            { icon: "📅", label: "Reissue",   val: tier.dateChangeFee   },
            { icon: "💺", label: "Seat",         val: tier.seatSelection   },
            { icon: "🍽️", label: "Meals",        val: tier.meals           },
            {
              icon: tier.isRefundable ? "✅" : "❌",
              label: "Refundable",
              val: tier.isRefundable ? "Yes" : "No",
            },
          ].map(({ icon, label, val }) => (
            <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
              <span style={{ fontSize: 11, marginTop: 1, flexShrink: 0 }}>{icon}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 9, color: S.muted, fontWeight: 600, lineHeight: 1 }}>{label}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: S.navyDeep, lineHeight: 1.3, marginTop: 2 }}>{val}</div>
              </div>
            </div>
          ))}
        </div>

        {onShowPolicy && (
          <button
            onClick={(e) => { e.stopPropagation(); onShowPolicy(); }}
            style={{
              marginTop: 2, display: "flex", alignItems: "center", justifyContent: "center",
              gap: 5, width: "100%", padding: "7px 6px", borderRadius: 8,
              border: `1px dashed ${S.borderMid}`, background: "#fbfdff",
              color: S.navyMid, fontSize: 10, fontWeight: 800,
              fontFamily: "'Sora',sans-serif", cursor: "pointer",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = S.navyMid; e.currentTarget.style.background = "#f0f6ff"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = S.borderMid; e.currentTarget.style.background = "#fbfdff"; }}
          >
            <span style={{ fontSize: 11 }}>🛈</span> Cancellation & Reissue Rules
          </button>
        )}
      </div>
    </div>
  );
}

// ─── FARE POLICY (CANCELLATION / REISSUE) MODAL ──────────────

function FarePolicyModal({
  tier, airline, onClose,
}: { tier: FareTier; airline?: string; onClose: () => void }) {
  // Optional richer fields — present only if lib/flights_api.ts maps them
  // through from the supplier's PenaltyCharges / MiniFareRules payload.
  // TBO's MiniFareRules carries From/To/Unit which is the actual time
  // window (e.g. From:0 To:24 Unit:"Hours" ⇒ "within 24 hrs of departure").
  const t: any = tier;
  const penalty = t.penaltyCharges as { cancellationCharge?: string; reissueCharge?: string } | undefined;
  type MiniRule = {
    type?: string;
    journeyPoints?: string;
    details?: string;
    from?: number | string | null;
    to?: number | string | null;
    unit?: string | null;
  };
  const miniRules = (t.miniFareRules as MiniRule[] | undefined)?.filter(Boolean) ?? [];

  const fmtTimeWindow = (r: MiniRule): string | null => {
    const hasFrom = r.from !== null && r.from !== undefined && r.from !== "";
    const hasTo = r.to !== null && r.to !== undefined && r.to !== "";
    if (!hasFrom && !hasTo) return null;
    const unit = r.unit || "Hrs";
    if (hasFrom && hasTo) return `${r.from}–${r.to} ${unit} before departure`;
    if (hasTo) return `Up to ${r.to} ${unit} before departure`;
    return `From ${r.from} ${unit} before departure`;
  };

  const cancelRules = miniRules.filter(r => (r.type || "").toLowerCase().includes("cancel"));
  const reissueRules = miniRules.filter(r => (r.type || "").toLowerCase().includes("reissue") || (r.type || "").toLowerCase().includes("change"));
  const anyTimingAvailable = miniRules.some(r => fmtTimeWindow(r) !== null);

  const summaryRows = [
    { key: "cancel",  label: "Cancellation charge", value: penalty?.cancellationCharge || tier.cancellationFee || "Not available" },
    { key: "reissue", label: "Reissue / Date change charge", value: penalty?.reissueCharge || tier.dateChangeFee || "Not available" },
  ];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const RuleGroup = ({ title, icon, rules, fallbackLabel, fallbackValue }: {
    title: string; icon: string; rules: MiniRule[]; fallbackLabel: string; fallbackValue: string;
  }) => (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <span style={{ fontSize: 12 }}>{icon}</span>
        <span style={{ fontSize: 10, color: S.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {title}
        </span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {rules.length > 0 ? (
          rules.map((r, i) => {
            const window = fmtTimeWindow(r);
            return (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                padding: "9px 11px", borderRadius: 9, border: `1px solid ${S.border}`, background: "#fff",
              }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: S.navyDeep, fontFamily: "'Sora',sans-serif" }}>
                    {r.journeyPoints || "All sectors"}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, marginTop: 2,
                    color: window ? "#0d7a52" : S.muted,
                    display: "flex", alignItems: "center", gap: 4,
                  }}>
                    <span>🕐</span>{window ?? "Timing not specified by airline — applies anytime"}
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: S.accentDk, fontFamily: "'Sora',sans-serif", whiteSpace: "nowrap" }}>
                  {r.details}
                </span>
              </div>
            );
          })
        ) : (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 12px", borderRadius: 10, background: S.surface, border: `1px solid ${S.border}`,
          }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: S.navyDeep, fontFamily: "'Sora',sans-serif" }}>{fallbackLabel}</div>
              <div style={{ fontSize: 10, color: S.muted, fontWeight: 600, marginTop: 2 }}>No time-slab data returned — flat charge, any time</div>
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: S.accentDk, fontFamily: "'Sora',sans-serif" }}>{fallbackValue}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      />
      <div className="fare-policy-modal" style={{
        position: "relative", width: "100%", maxWidth: 480,
        background: "#fff", borderRadius: 18, maxHeight: "85dvh",
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,48,95,0.35)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 20px", borderBottom: `1px solid ${S.border}`, flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 14, color: S.navyDeep }}>
              Cancellation & Reissue Rules
            </div>
            <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>
              {airline ? `${airline} · ` : ""}{tier.name}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: "50%", border: `1px solid ${S.border}`,
            background: S.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width={13} height={13} fill="none" stroke={S.navyDeep} strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ overflowY: "auto", flex: 1, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Refundable status — shown regardless, since non-refundable fares can still carry time-based no-show/reissue windows */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span>{tier.isRefundable ? "✅" : "❌"}</span>
            <span style={{ fontSize: 11, color: S.navyDeep, fontWeight: 700 }}>
              {tier.isRefundable ? "This fare is refundable" : "This fare is non-refundable"}
              {!tier.isRefundable && " — cutoff timing & reissue charges below still apply"}
            </span>
          </div>

          <RuleGroup
            title="Cancellation — time frame"
            icon="↩️"
            rules={cancelRules}
            fallbackLabel="Cancellation charge"
            fallbackValue={summaryRows[0].value}
          />

          <RuleGroup
            title="Reissue / Date change — time frame"
            icon="📅"
            rules={reissueRules}
            fallbackLabel="Reissue / Date change charge"
            fallbackValue={summaryRows[1].value}
          />

          {!anyTimingAvailable && (
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 8,
              padding: "10px 12px", borderRadius: 10, background: "#fffbeb", border: "1px solid #fef3c7",
            }}>
              <span style={{ fontSize: 13 }}>⏱️</span>
              <span style={{ fontSize: 10.5, color: "#92400e", lineHeight: 1.5 }}>
                This supplier hasn't returned specific hour-slabs (e.g. "0–4 hrs", "4–24 hrs before departure")
                for this fare — only the flat charge shown above. Time-based slabs, when the airline provides
                them, will automatically appear here.
              </span>
            </div>
          )}

          <p style={{ fontSize: 10, color: S.muted, lineHeight: 1.6, margin: 0 }}>
            Charges shown are per traveller as quoted at the time of search and may change closer to
            departure or once the fare is repriced at booking. Final cut-off timing and amount are
            reconfirmed on the fare rules page during checkout.
          </p>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${S.border}`, background: S.surface, flexShrink: 0 }}>
          <button
            onClick={onClose}
            style={{
              width: "100%", background: S.navyDeep, color: "#fff", border: "none", borderRadius: 10,
              padding: "11px 20px", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer",
            }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FARE MODAL ────────────────────────────────────────────

export function FareModal({
  flight, legIndex, totalLegs, onClose, onBook,
}: {
  flight: DisplayFlight;
  legIndex?: number;
  totalLegs?: number;
  onClose: () => void;
  onBook: (tier: FareTier) => void;
}) {
  const isMultiLeg = totalLegs && totalLegs > 1;
  const tiers: FareTier[] = flight.fareTiers ?? [];
  const recIdx = tiers.findIndex(t => t.recommended);
  const [selected, setSelected] = useState(recIdx >= 0 ? recIdx : 0);
  const [policyIdx, setPolicyIdx] = useState<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  const { convert } = useCurrency();

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      <div className="fare-modal" style={{
        position: "relative", width: "100%", maxWidth: 780,
        background: "#fff", borderRadius: 20, maxHeight: "92dvh",
        display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 24px 80px rgba(0,48,95,0.30)",
      }}>

        {/* Header */}
        <div className="fare-modal-header" style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 20px", borderBottom: `1px solid ${S.border}`, flexShrink: 0,
        }}>
          <AirlineLogo code={flight.airlineCode} size="lg" />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 13, color: S.navyDeep, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {flight.airline} · {flight.flightNumber}
              {isMultiLeg && (
                <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, color: "#7c3aed", background: "#ede9fe", padding: "2px 7px", borderRadius: 20 }}>
                  Leg {(legIndex ?? 0) + 1} of {totalLegs}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: S.muted, marginTop: 2 }}>
              {flight.departTime} → {flight.arriveTime} · {flight.durationLabel} · {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop`}
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: "50%", border: `1px solid ${S.border}`,
            background: S.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width={14} height={14} fill="none" stroke={S.navyDeep} strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="fare-modal-body" style={{ overflowY: "auto", flex: 1, padding: "20px" }}>
          {tiers.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>✈️</div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 15, color: S.navyDeep, marginBottom: 4 }}>
                No fare options available
              </div>
              <div style={{ fontSize: 12, color: S.muted }}>This flight has no selectable fare tiers.</div>
            </div>
          ) : (
            <>
              <div className="fare-tier-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                {tiers.map((tier, idx) => (
                  <FareTierCard
                    key={tier.resultIndex + idx}
                    tier={tier}
                    selected={selected === idx}
                    onSelect={() => setSelected(idx)}
                    onShowPolicy={() => setPolicyIdx(idx)}
                  />
                ))}
              </div>
              <p style={{ fontSize: 10, color: S.muted, marginTop: 14, lineHeight: 1.6 }}>
                {MOCK_MODE ? "* Mock mode — fares are simulated." : "* Fares per traveller. PlumTrips service fee not included."}
                {" "}CO₂ emissions: ~{co2Badge(flight.stops, flight.duration)} kg/traveller.
              </p>
            </>
          )}
        </div>

        {/* Footer */}
        {tiers.length > 0 && (
          <div className="fare-modal-footer" style={{
            padding: "14px 20px", borderTop: `1px solid ${S.border}`,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: S.surface, flexShrink: 0, gap: 16,
          }}>
            <div>
              <div style={{ fontSize: 10, color: S.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {tiers[selected]?.name}
              </div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 24, color: S.navyDeep, lineHeight: 1.1 }}>
                {convert(tiers[selected]?.totalOfferedFare ?? 0)}
              </div>
              <div style={{ fontSize: 11, color: S.muted }}>
                per adult · {tiers[selected]?.cancellationFee}
              </div>
            </div>
            <button
              onClick={() => onBook(tiers[selected])}
              className="fare-modal-cta"
              style={{
                background: S.accent, color: "#fff", border: "none", borderRadius: 12,
                padding: "13px 28px", fontFamily: "'Sora',sans-serif", fontWeight: 800,
                fontSize: 13, cursor: "pointer", whiteSpace: "nowrap",
                letterSpacing: "0.04em", transition: "all .2s",
              }}
            >
              {(legIndex !== undefined && totalLegs && legIndex < totalLegs - 1)
                ? `Select Leg ${legIndex + 1} →`
                : "Continue →"}
            </button>
          </div>
        )}
      </div>

      {policyIdx !== null && tiers[policyIdx] && (
        <FarePolicyModal
          tier={tiers[policyIdx]}
          airline={flight.airline}
          onClose={() => setPolicyIdx(null)}
        />
      )}
    </div>
  );
}