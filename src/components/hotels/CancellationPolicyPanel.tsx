import { CheckCircle, XCircle, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { getCancellationPolicyDisplay, getPolicyChargeText, formatPolicyDate, parsePolicyDate } from '../../hooks/useHotelApi';
import type { CancelPolicySlab } from '../../stores/hotelStore';

export interface CancellationPolicyPanelProps {
  cancelPolicies?: CancelPolicySlab[];
  cancellationPolicy?: string;
  isRefundable?: boolean;
  checkInDate?: Date | string | null;
  roomName?: string;
  loading?: boolean;
  size?: 'compact' | 'full';
}

/** Try to extract a date string from a free-text policy string like
 *  "Free cancellation available until 06-09-2026 12:00:00" */
function extractDateFromPolicyText(text: string | undefined): string | null {
  if (!text) return null;
  // DD-MM-YYYY or YYYY-MM-DD with optional time
  const m =
    text.match(/(\d{2}-\d{2}-\d{4})(?:\s+\d{2}:\d{2}:\d{2})?/) ||
    text.match(/(\d{4}-\d{2}-\d{2})(?:\s+\d{2}:\d{2}:\d{2})?/);
  if (!m) return null;
  const d = parsePolicyDate(m[1]);
  if (!d) return null;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function CancellationPolicyPanel({
  cancelPolicies,
  cancellationPolicy,
  isRefundable,
  checkInDate,
  roomName,
  loading = false,
  size: _size = 'compact',
}: CancellationPolicyPanelProps) {
  const display = getCancellationPolicyDisplay(
    cancelPolicies,
    cancellationPolicy,
    isRefundable,
    checkInDate,
    roomName,
  );

  const refundable = !display.isNonRefundable;
  const deadline   = display.freeCancellationDeadline;

  // Deduplicate penalty slabs by fromDate+charge
  const seen = new Set<string>();
  const penaltySlabs = display.sortedPolicies
    .filter((p) => p.charge > 0)
    .filter((p) => {
      const key = `${p.fromDate ?? p.FromDate ?? ''}|${p.charge}|${p.chargeType}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

  // When no structured deadline comes from slabs, try the raw policy text
  const fallbackDeadline = !deadline ? extractDateFromPolicyText(cancellationPolicy) : null;

  // Last resort: day before check-in
  const checkInFallback = (() => {
    if (deadline || fallbackDeadline || !checkInDate) return null;
    try {
      const d = checkInDate instanceof Date ? new Date(checkInDate) : new Date(String(checkInDate));
      if (isNaN(d.getTime())) return null;
      d.setDate(d.getDate() - 1);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return null; }
  })();

  const displayDeadline = deadline ?? fallbackDeadline ?? checkInFallback;

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (loading && isRefundable === undefined && !cancellationPolicy) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-slate-400 mb-5">
        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        <span>Loading cancellation policy…</span>
      </div>
    );
  }

  /* ── Non-refundable ──────────────────────────────────────────────── */
  if (!refundable) {
    return (
      <div className="flex items-center gap-1.5 text-sm font-medium text-rose-600 mb-5">
        <XCircle className="w-4 h-4 shrink-0" />
        <span>Non-Refundable</span>
      </div>
    );
  }

  /* ── Refundable ──────────────────────────────────────────────────── */
  return (
    <div className="mb-5 space-y-1">
      {/* Free cancellation headline */}
      <div className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
        <CheckCircle className="w-4 h-4 shrink-0" />
        <span>Free Cancellation{displayDeadline ? ` until ${displayDeadline}` : ''}</span>
      </div>

      {/* Penalty slabs */}
      {penaltySlabs.length > 0 && !loading && penaltySlabs.map((slab, i) => {
        const from   = slab.fromDate ?? slab.FromDate;
        const charge = getPolicyChargeText(slab);
        const fromLabel = from
          ? `From ${formatPolicyDate(from)}`
          : displayDeadline
            ? `After ${displayDeadline}`
            : 'After free period';
        return (
          <div key={i} className="flex items-center gap-1.5 text-sm text-slate-500 pl-0.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{fromLabel}: {charge}</span>
          </div>
        );
      })}

      {/* No slabs but has deadline — show that charges apply after */}
      {penaltySlabs.length === 0 && displayDeadline && !loading && (
        <div className="flex items-center gap-1.5 text-sm text-slate-500 pl-0.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Charges apply after {displayDeadline}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-1.5 text-sm text-slate-400 pl-0.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>Confirming charges…</span>
        </div>
      )}
    </div>
  );
}
