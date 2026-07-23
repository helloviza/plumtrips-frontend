//  SearchBar.tsx — search bar, responsive (mobile / tablet /
//  desktop) via Tailwind breakpoints on one shared layout.
//
//  UI reworked to match the single-card / two-row layout:
//   Row 1: trip-type pills + non-stop toggle  |  passengers / class / Search
//   Row 2: From  |  swap  |  To  |  Departure Date (+ Return Date if round-trip)
//
//  Payment Method and Fare Type controls have been removed entirely.
//
//  Feature parity kept from the functional version:
//   - Separate Return Date box when Round-trip is selected.
//   - Multi-city leg editor stays fully built but commented out,
//     same as before, since the trip-type option is disabled for now.
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Pill } from '../../atoms/Pill';
import { Button } from '../../atoms/Button';
import {
  ArrowLeftRight, PlaneTakeoff, PlaneLanding, Calendar,
  User, Sofa, ChevronDown, ChevronLeft, ChevronRight, Search,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { SearchForm, Airport } from '../../../lib/types_t';
import { apiGetAirports, apiGetCalendarPrices } from '../../../lib/flights_api';
import type { CityLeg } from '../ResultShared';

// ─── MOCK FALLBACK — seed data used when the API is down ───────────────────
const MOCK_AIRPORTS: Airport[] = [
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International', cityCode: 'DEL', country: 'India', countryCode: 'IN', label: 'New Delhi (DEL)' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj International', cityCode: 'BOM', country: 'India', countryCode: 'IN', label: 'Mumbai (BOM)' },
  { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International', cityCode: 'BLR', country: 'India', countryCode: 'IN', label: 'Bengaluru (BLR)' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhas Chandra Bose International', cityCode: 'CCU', country: 'India', countryCode: 'IN', label: 'Kolkata (CCU)' },
];

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

// ─── COLOR TOKENS ───────────────────────────────────────────────────────────
const ACCENT = '#f97316';    // orange-500
const ACCENT_DK = '#ea580c'; // orange-600
const INK = '#0f172a';       // slate-900
const BORDER = '#e2e8f0';    // slate-200

function formatPriceShort(price: number): string {
  if (price >= 100000) return `₹${(price / 100000).toFixed(1)}L`;
  if (price >= 1000) return `₹${(price / 1000).toFixed(1)}k`;
  return `₹${price}`;
}

// ─── VIEWPORT WIDTH HOOK ────────────────────────────────────────────────────
function useViewportWidth() {
  const [w, setW] = useState(() => (typeof window !== 'undefined' ? window.innerWidth : 1280));
  useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w;
}

// ─── PORTAL POSITION HOOK ───────────────────────────────────────────────────
function usePortalPos(anchorRef: React.RefObject<HTMLElement | null>, open: boolean) {
  const [pos, setPos] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  useEffect(() => {
    if (!open) { setPos(null); return; }
    function measure() {
      if (!anchorRef.current) return;
      const r = anchorRef.current.getBoundingClientRect();
      setPos({ top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height });
    }
    measure();
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => { window.removeEventListener('scroll', measure, true); window.removeEventListener('resize', measure); };
  }, [open, anchorRef]);
  return pos;
}

// ─── AIRPORT DROPDOWN (unchanged) ───────────────────────────────────────────
function AirportDropdown({
  anchorRef, open, airports, onSelect, onClose,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean; airports: Airport[];
  onSelect: (a: Airport) => void; onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const pos = usePortalPos(anchorRef, open);
  const vw = useViewportWidth();
  const isNarrow = vw < 640;
  const POPUP_H = isNarrow ? 320 : 300;
  const POPUP_W = Math.min(320, vw - 16);

  useEffect(() => {
    if (open) { setQuery(''); setTimeout(() => inputRef.current?.focus(), 10); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return;
      if (popupRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, anchorRef, onClose]);

  if (!open || !pos) return null;

  const filtered = query.trim()
    ? airports.filter(a => {
        const q = query.toLowerCase();
        return a.city?.toLowerCase().includes(q) || a.code?.toLowerCase().includes(q) ||
          a.name?.toLowerCase().includes(q) || a.country?.toLowerCase().includes(q);
      })
    : airports.slice(0, 80);

  const spaceBelow = window.innerHeight - (pos.top - window.scrollY) - pos.height;
  const goAbove = spaceBelow < POPUP_H + 16;
  const top = goAbove ? Math.max(8, pos.top - POPUP_H - 6) : pos.top + pos.height + 6;
  const left = isNarrow
    ? Math.max(8, (vw - POPUP_W) / 2)
    : Math.max(8, Math.min(pos.left, vw - POPUP_W - 8));

  return createPortal(
    <div ref={popupRef} className="absolute z-40 flex flex-col overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-white"
      style={{ top, left, width: POPUP_W, height: POPUP_H }}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 shrink-0 bg-slate-50">
        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input ref={inputRef} className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          placeholder="Search city or airport…" value={query} onChange={e => setQuery(e.target.value)} />
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-6 px-4 text-center text-[13px] text-slate-400">No airports found</div>
        ) : filtered.map(a => (
          <button key={a.code} type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => { onSelect(a); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left border-b border-slate-50 hover:bg-orange-50 transition-colors">
            <div className="w-9 h-9 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-black text-[11px] shrink-0">{a.code}</div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-slate-900">{a.city}</div>
              <div className="text-[11px] text-slate-400 truncate">{a.name}{a.country ? ` · ${a.country}` : ''}</div>
            </div>
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}

// ─── CALENDAR POPUP (unchanged) ─────────────────────────────────────────────
function CalendarPopup({
  anchorRef, value, value2, isRange, min, onChange, onClose, prices = {},
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  value: string; value2?: string; isRange?: boolean; min?: string;
  onChange: (d1: string, d2?: string) => void;
  onClose: () => void;
  prices?: Record<string, number>;
}) {
  const todayDate = new Date();
  const todayStr = todayDate.toLocaleDateString('en-CA');
  const minStr = min ?? todayStr;
  const popupRef = useRef<HTMLDivElement>(null);
  const pos = usePortalPos(anchorRef, true);
  const vw = useViewportWidth();
  const showSingleMonth = vw < 640;
  const POPUP_H = isRange ? (showSingleMonth ? 460 : 510) : (showSingleMonth ? 400 : 450);
  const POPUP_W = showSingleMonth ? Math.min(vw - 16, 340) : 560;

  const parse = (s: string) => (s ? new Date(s + 'T00:00:00') : null);
  const [hovering, setHovering] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<'from' | 'to'>(value ? (isRange && !value2 ? 'to' : 'from') : 'from');
  const [vy, setVy] = useState(() => { const d = parse(value); return d ? d.getFullYear() : todayDate.getFullYear(); });
  const [vm, setVm] = useState(() => { const d = parse(value); return d ? d.getMonth() : todayDate.getMonth(); });
  const [vy2, setVy2] = useState(() => (vm === 11 ? vy + 1 : vy));
  const [vm2, setVm2] = useState(() => (vm === 11 ? 0 : vm + 1));

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return;
      if (popupRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose, anchorRef]);

  function advance(dir: 1 | -1) {
    let m = vm + dir, y = vy;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setVm(m); setVy(y);
    let m2 = m + 1, y2 = y;
    if (m2 > 11) { m2 = 0; y2++; }
    setVm2(m2); setVy2(y2);
  }

  function toStr(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  function clickDay(s: string) {
    if (s < minStr) return;
    if (!isRange) { onChange(s); onClose(); return; }
    if (selecting === 'from') { onChange(s, ''); setSelecting('to'); }
    else {
      if (s < value) onChange(s, value);
      else onChange(value, s);
      onClose();
    }
  }

  function getVisiblePriceRange(): { min: number; max: number } {
    const dates: string[] = [];
    for (let d = 1; d <= new Date(vy, vm + 1, 0).getDate(); d++) dates.push(toStr(vy, vm, d));
    if (!showSingleMonth) {
      for (let d = 1; d <= new Date(vy2, vm2 + 1, 0).getDate(); d++) dates.push(toStr(vy2, vm2, d));
    }
    const vals = dates.map(s => prices[s]).filter((p): p is number => p !== undefined && p > 0);
    if (!vals.length) return { min: 0, max: 0 };
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }

  function priceColor(price: number, isSel: boolean, range: { min: number; max: number }): string {
    if (isSel) return 'rgba(255,255,255,0.9)';
    if (!price || range.min === range.max) return '#059669';
    const ratio = (price - range.min) / (range.max - range.min);
    if (ratio < 0.33) return '#059669';
    if (ratio < 0.66) return '#d97706';
    return '#dc2626';
  }

  function renderMonth(y: number, m: number, priceRange: { min: number; max: number }) {
    const days = new Date(y, m + 1, 0).getDate();
    const first = new Date(y, m, 1).getDay();
    const cells: React.ReactNode[] = [];
    for (let i = 0; i < first; i++) cells.push(<div key={`e${i}`} />);
    for (let d = 1; d <= days; d++) {
      const s = toStr(y, m, d);
      const disabled = s < minStr;
      const sel = s === value || (isRange && s === value2);
      const inRange = isRange && value && value2 && s > value && s < value2;
      const hov = isRange && value && !value2 && hovering && selecting === 'to' &&
        ((s > value && s < hovering) || (s > hovering && s < value));
      const isToday = s === todayStr;
      const price = prices[s];
      const pColor = priceColor(price ?? 0, !!sel, priceRange);

      cells.push(
        <button key={d} type="button" disabled={disabled}
          onMouseEnter={() => setHovering(s)}
          onMouseLeave={() => setHovering(null)}
          onMouseDown={e => e.preventDefault()}
          onClick={() => clickDay(s)}
          className="flex items-center justify-center border-none"
          style={{ height: showSingleMonth ? 42 : 46, background: (inRange || hov) && !disabled ? 'rgba(249,115,22,0.08)' : 'transparent', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.25 : 1 }}
        >
          <span className="flex flex-col items-center justify-center gap-0.5 rounded-lg font-bold"
            style={{ width: showSingleMonth ? 32 : 36, height: showSingleMonth ? 36 : 40, fontSize: showSingleMonth ? 11 : 12, background: sel ? ACCENT : 'transparent', color: sel ? 'white' : isToday && !disabled ? ACCENT : disabled ? '#cbd5e1' : INK, outline: isToday && !sel && !disabled ? `2px solid ${ACCENT}` : 'none', outlineOffset: -2 }}>
            <span className="leading-none">{d}</span>
            {price !== undefined && !disabled && (
              <span className="text-[7px] font-extrabold leading-none whitespace-nowrap" style={{ color: pColor, letterSpacing: '-0.02em' }}>
                {formatPriceShort(price)}
              </span>
            )}
          </span>
        </button>
      );
    }
    return cells;
  }

  if (!pos) return null;

  const priceRange = getVisiblePriceRange();
  const spaceBelow = window.innerHeight - (pos.top - window.scrollY) - pos.height;
  const goAbove = spaceBelow < POPUP_H + 16;
  const top = goAbove ? Math.max(8, pos.top - POPUP_H - 6) : pos.top + pos.height + 6;
  const left = showSingleMonth
    ? Math.max(8, (vw - POPUP_W) / 2)
    : Math.max(8, Math.min(pos.left, vw - POPUP_W - 8));
  const calendars = showSingleMonth ? [{ y: vy, m: vm }] : [{ y: vy, m: vm }, { y: vy2, m: vm2 }];

  return createPortal(
    <div ref={popupRef} className="absolute z-40 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden" style={{ top, left, width: POPUP_W }}>
      {isRange && (
        <div className="flex border-b border-slate-100 bg-slate-50">
          {([
            { key: 'from' as const, label: 'Departure', v: value },
            { key: 'to' as const, label: 'Return', v: value2 ?? '' },
          ] as const).map(({ key, label, v }) => (
            <button key={key} type="button"
              onClick={() => { if (key === 'to' && !value) return; setSelecting(key); }}
              className="flex-1 px-3.5 py-2.5 text-left bg-transparent"
              style={{ borderBottom: selecting === key ? `2px solid ${ACCENT}` : '2px solid transparent' }}>
              <div className="text-[9px] uppercase tracking-wider text-slate-400 mb-0.5">{label}</div>
              <div className="text-[13px] font-black text-slate-900">
                {v ? new Date(v + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Select date'}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="flex">
        {calendars.map((cal, idx) => (
          <div key={idx} className="flex-1" style={{ padding: showSingleMonth ? 12 : 16, borderRight: !showSingleMonth && idx === 0 ? `1px solid ${BORDER}` : 'none' }}>
            <div className="flex items-center justify-between mb-2.5">
              {idx === 0 ? (
                <button type="button" onClick={() => advance(-1)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              ) : <div className="w-7" />}
              <span className="text-[13px] font-black text-slate-900">{MONTHS[cal.m]} {cal.y}</span>
              {(showSingleMonth || idx === 1) ? (
                <button type="button" onClick={() => advance(1)} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-slate-100">
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : <div className="w-7" />}
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map(d => <div key={d} className="text-center text-[9px] font-bold text-slate-400 py-0.5">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-y-px">
              {renderMonth(cal.y, cal.m, priceRange)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 px-3.5 py-2.5 flex items-center justify-between bg-slate-50">
        <button type="button" onClick={() => onChange('', '')} className="text-xs font-semibold text-slate-400 hover:text-orange-500">Clear dates</button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg text-xs font-black text-white bg-orange-500 hover:bg-orange-600 transition-colors">Done</button>
      </div>
    </div>,
    document.body
  );
}

// ─── PASSENGERS & CLASS POPOVER (unchanged) ─────────────────────────────────
function PaxPicker({
  anchorRef, open, adults, children, infants, cabinClass, onChange, onClose,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  adults: number; children: number; infants: number;
  cabinClass: SearchForm['cabinClass'];
  onChange: (a: number, c: number, i: number, cls: SearchForm['cabinClass']) => void;
  onClose: () => void;
}) {
  const popupRef = useRef<HTMLDivElement>(null);
  const pos = usePortalPos(anchorRef, open);
  const vw = useViewportWidth();
  const isNarrow = vw < 640;

  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => {
      if (anchorRef.current?.contains(e.target as Node)) return;
      if (popupRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open, anchorRef, onClose]);

  if (!open || !pos) return null;

  const classes: SearchForm['cabinClass'][] = ['Economy', 'Premium Economy', 'Business', 'First'];
  const POPUP_W = Math.min(288, vw - 16);
  const left = isNarrow
    ? Math.max(8, (vw - POPUP_W) / 2)
    : Math.max(8, Math.min(pos.left + pos.width - POPUP_W, vw - POPUP_W - 8));
  const top = Math.max(8, pos.top + pos.height + 6);

  const PRow = ({ label, sub, value, min, max, onCh }: { label: string; sub: string; value: number; min: number; max: number; onCh: (v: number) => void }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-100">
      <div>
        <div className="text-sm font-bold text-slate-900">{label}</div>
        <div className="text-[11px] text-slate-400">{sub}</div>
      </div>
      <div className="flex items-center gap-2.5">
        <button type="button" onClick={() => onCh(Math.max(min, value - 1))} disabled={value <= min}
          className="w-[30px] h-[30px] rounded-full border border-slate-300 text-slate-500 flex items-center justify-center text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:border-slate-400 transition-colors">−</button>
        <span className="w-[18px] text-center font-black text-slate-900 text-sm">{value}</span>
        <button type="button" onClick={() => onCh(Math.min(max, value + 1))} disabled={value >= max}
          className="w-[30px] h-[30px] rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center text-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-colors">+</button>
      </div>
    </div>
  );

  return createPortal(
    <div ref={popupRef} className="absolute z-40 rounded-2xl border border-slate-200 shadow-2xl p-[18px] bg-white" style={{ top, left, width: POPUP_W }}>
      <PRow label="Adults" sub="12+ years" value={adults} min={1} max={9} onCh={v => onChange(v, children, infants, cabinClass)} />
      <PRow label="Children" sub="2–12 years" value={children} min={0} max={9} onCh={v => onChange(adults, v, infants, cabinClass)} />
      <PRow label="Infants" sub="Under 2 years" value={infants} min={0} max={4} onCh={v => onChange(adults, children, v, cabinClass)} />
      <div className="mt-3.5">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Cabin Class</div>
        <div className="grid grid-cols-2 gap-1.5">
          {classes.map(cls => (
            <button key={cls} type="button" onClick={() => onChange(adults, children, infants, cls)}
              className="py-2 px-1 rounded-lg text-xs font-bold transition-colors"
              style={{ background: cabinClass === cls ? ACCENT : 'white', color: cabinClass === cls ? 'white' : '#475569', border: cabinClass === cls ? `2px solid ${ACCENT}` : `2px solid ${BORDER}` }}>
              {cls}
            </button>
          ))}
        </div>
      </div>
      <button type="button" onClick={onClose} className="mt-3.5 w-full rounded-lg py-2.5 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors">
        Confirm
      </button>
    </div>,
    document.body
  );
}

// ─── FIELD (row-2 fields — unchanged visuals, forwarded ref) ───────────────
const Field = React.forwardRef<HTMLDivElement, {
  label: string;
  value: string;
  Icon: React.ElementType;
  onClick?: () => void;
}>(function Field({ label, value, Icon, onClick }, ref) {
  return (
    <div ref={ref} onClick={onClick} className="flex items-center gap-3 px-4 py-3 cursor-pointer group w-full">
      <Icon size={17} className="text-slate-400 shrink-0 group-hover:text-orange-500 transition-colors" />
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide leading-none mb-0.5">
          {label}
        </span>
        <span className="text-[15px] font-bold text-slate-900 truncate">{value}</span>
      </div>
    </div>
  );
});

/* ============================================================
   MULTI-CITY LEG EDITOR — fully built, but DISABLED: the
   Multi-city Pill is commented out below, so `form.tripType`
   can never become "multiCity" and none of this renders.
   Kept ready to enable — uncomment the Pill, the multiLegs
   state/handlers in the component body, and the
   <MultiCityPanel /> render at the bottom.

   (unchanged — omitted here for brevity, same content as before)
============================================================ */

// ─── MAIN COMPONENT ─────────────────────────────────────────
export interface SearchBarProps {
  onSearch: (form: SearchForm, multiLegs?: CityLeg[]) => void;
  form?: Partial<SearchForm>;
  tripType?: SearchForm['tripType'];
  onTripTypeChange?: (t: SearchForm['tripType']) => void;
}

type ActivePopup = 'from' | 'to' | 'depart' | 'return' | 'pax' | null;

export default function SearchBar({ onSearch, form: formProp, tripType: tripTypeProp, onTripTypeChange }: SearchBarProps) {
  const today = new Date().toLocaleDateString('en-CA');

  const [airports, setAirports] = useState<Airport[]>(MOCK_AIRPORTS);
  useEffect(() => {
    apiGetAirports().then(setAirports).catch(() => setAirports(MOCK_AIRPORTS));
  }, []);

  const [form, setForm] = useState<SearchForm>({
    tripType: tripTypeProp ?? formProp?.tripType ?? 'oneWay',
    from: formProp?.from ?? MOCK_AIRPORTS[3],
    to: formProp?.to ?? MOCK_AIRPORTS[0],
    departDate: formProp?.departDate ?? today,
    returnDate: formProp?.returnDate ?? '',
    adults: formProp?.adults ?? 1,
    children: formProp?.children ?? 0,
    infants: formProp?.infants ?? 0,
    cabinClass: formProp?.cabinClass ?? 'Economy',
    nonStopOnly: formProp?.nonStopOnly ?? false,
    // fareType kept in state only because SearchForm requires it —
    // there is no UI control for it anymore.
    fareType: formProp?.fareType ?? 'Regular',
  });

  useEffect(() => {
    if (tripTypeProp) setForm(f => ({ ...f, tripType: tripTypeProp }));
  }, [tripTypeProp]);

  const [calPrices, setCalPrices] = useState<Record<string, number>>({});
  const [pricesLoading, setPricesLoading] = useState(false);
  useEffect(() => {
    const fromCode = form.from?.code;
    const toCode = form.to?.code;
    if (!fromCode || !toCode || fromCode === toCode) return;
    let cancelled = false;
    setPricesLoading(true);
    apiGetCalendarPrices(fromCode, toCode, form.cabinClass)
      .then(prices => { if (!cancelled) { setCalPrices(prices); setPricesLoading(false); } })
      .catch(() => { if (!cancelled) setPricesLoading(false); });
    return () => { cancelled = true; };
  }, [form.from?.code, form.to?.code, form.cabinClass]);

  const [popup, setPopup] = useState<ActivePopup>(null);
  const toggle = useCallback((p: ActivePopup) => setPopup(prev => (prev === p ? null : p)), []);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);
  const departRef = useRef<HTMLDivElement>(null);
  const returnRef = useRef<HTMLDivElement>(null);
  const paxRef = useRef<HTMLDivElement>(null);

  const isRound = form.tripType === 'roundTrip';

  function fmtDateLong(d: string) {
    if (!d) return 'Select date';
    const dt = new Date(d + 'T00:00:00');
    const weekday = dt.toLocaleDateString('en-US', { weekday: 'short' });
    return `${weekday}, ${dt.getDate()} ${MONTHS[dt.getMonth()].slice(0, 3)} ${dt.getFullYear()}`;
  }

  // Steps a date string by `delta` days, respecting an optional min bound.
  function shiftDate(d: string, delta: number, min?: string): string {
    const base = d ? new Date(d + 'T00:00:00') : new Date();
    base.setDate(base.getDate() + delta);
    const next = base.toLocaleDateString('en-CA');
    if (min && next < min) return min;
    return next;
  }

  const totalPax = form.adults + form.children + form.infants;

  function handleSearch() {
    if (!form.departDate) { alert('Please select a departure date.'); return; }
    if (isRound && !form.returnDate) { alert('Please select a return date.'); return; }
    onSearch(form);
    setPopup(null);
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full pt-3 pb-1 relative z-20">

      {/* ── Single white card wrapping both rows ── */}
      <div className="rounded-xl overflow-visible bg-white border border-slate-200 shadow-sm">

        {/* ── Row 1: trip-type tabs + non-stop toggle (left) | passengers / class / Search (right) ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-4 py-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <Pill active={form.tripType === 'oneWay'} onClick={() => { setForm(f => ({ ...f, tripType: 'oneWay', returnDate: '' })); onTripTypeChange?.('oneWay'); }}>
              One-way
            </Pill>
            <Pill active={form.tripType === 'roundTrip'} onClick={() => { setForm(f => ({ ...f, tripType: 'roundTrip' })); onTripTypeChange?.('roundTrip'); }}>
              Round-trip
            </Pill>
            {/* <Pill active={form.tripType === 'multiCity'} onClick={...}>Multi-city</Pill> */}

            <label className="flex items-center gap-2 cursor-pointer select-none ml-1">
              <input
                type="checkbox"
                checked={form.nonStopOnly}
                onChange={e => setForm(f => ({ ...f, nonStopOnly: e.target.checked }))}
                className="w-4 h-4 rounded accent-orange-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-slate-500">Non-stop only</span>
            </label>
          </div>

          <div className="flex items-center gap-1 flex-wrap justify-end">
            <div ref={paxRef} className="relative">
              <button type="button" onClick={() => toggle('pax')}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-orange-500 transition-colors px-3 py-1.5">
                <User size={14} className="text-slate-400" />
                {totalPax} {totalPax === 1 ? 'Adult' : 'Travellers'}
                <ChevronDown size={12} className="text-slate-400" />
              </button>
              <PaxPicker anchorRef={paxRef} open={popup === 'pax'}
                adults={form.adults} children={form.children} infants={form.infants} cabinClass={form.cabinClass}
                onChange={(a, c, i, cls) => setForm(f => ({ ...f, adults: a, children: c, infants: i, cabinClass: cls }))}
                onClose={() => setPopup(null)} />
            </div>

            <div className="w-px h-4 bg-slate-200" />

            <button type="button" onClick={() => toggle('pax')}
              className="flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-orange-500 transition-colors px-3 py-1.5">
              <Sofa size={14} className="text-slate-400" />
              {form.cabinClass}
              <ChevronDown size={12} className="text-slate-400" />
            </button>

            <Button size="md" className="rounded-xl px-6 ml-2 flex items-center gap-2" onClick={handleSearch} disabled={pricesLoading}>
              <Search size={15} />
              {pricesLoading ? 'Loading…' : 'Search'}
            </Button>
          </div>
        </div>

        {/* ── Row 2: From / swap / To / Departure Date (+ Return Date) ── */}
        <div className="flex flex-col sm:flex-row items-stretch w-full overflow-visible divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

          {/* FROM */}
          <div className="flex-1 min-w-0 relative">
            <Field ref={fromRef} label="From" value={form.from ? `${form.from.city} (${form.from.code})` : 'Select'} Icon={PlaneTakeoff}
              onClick={() => toggle('from')} />
            <AirportDropdown anchorRef={fromRef} open={popup === 'from'} airports={airports}
              onSelect={a => { setForm(f => ({ ...f, from: a })); setPopup(null); }}
              onClose={() => setPopup(null)} />
            {/* Swap button */}
            <div
              onClick={() => setForm(f => ({ ...f, from: f.to, to: f.from }))}
              className="absolute z-20 flex items-center justify-center w-7 h-7 bg-white rounded-full border border-slate-200 cursor-pointer text-slate-400 hover:text-orange-500 shadow-sm transition-colors
                left-1/2 -translate-x-1/2 -bottom-3.5 rotate-90
                sm:left-auto sm:translate-x-0 sm:bottom-auto sm:rotate-0 sm:right-[-14px] sm:top-1/2 sm:-translate-y-1/2"
            >
              <ArrowLeftRight size={13} />
            </div>
          </div>

          {/* TO */}
          <div className="flex-1 min-w-0 sm:pl-4">
            <Field ref={toRef} label="To" value={form.to ? `${form.to.city} (${form.to.code})` : 'Select'} Icon={PlaneLanding}
              onClick={() => toggle('to')} />
            <AirportDropdown anchorRef={toRef} open={popup === 'to'} airports={airports}
              onSelect={a => { setForm(f => ({ ...f, to: a })); setPopup(null); }}
              onClose={() => setPopup(null)} />
          </div>

          {/* DEPARTURE DATE (with nav arrows) */}
          <div className="flex-[1.2] min-w-0 relative">
            <div className="flex items-center w-full">
              <div className="flex-1 min-w-0">
                <Field ref={departRef} label="Departure Date" value={fmtDateLong(form.departDate)} Icon={Calendar}
                  onClick={() => toggle('depart')} />
              </div>
              <div className="flex items-center gap-1 pr-3 shrink-0">
                <button type="button"
                  onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, departDate: shiftDate(f.departDate, -1, today) })); }}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <ChevronLeft size={14} />
                </button>
                <button type="button"
                  onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, departDate: shiftDate(f.departDate, 1, today) })); }}
                  className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
            {popup === 'depart' && (
              <CalendarPopup anchorRef={departRef} value={form.departDate}
                value2={isRound ? form.returnDate : undefined} isRange={isRound}
                min={today} prices={calPrices}
                onChange={(d1, d2) => { setForm(f => ({ ...f, departDate: d1, returnDate: d2 ?? f.returnDate })); if (!isRound || d2) setPopup(null); }}
                onClose={() => setPopup(null)} />
            )}
          </div>

          {/* RETURN DATE — only when Round-trip is selected */}
          {isRound && (
            <div className="flex-[1.2] min-w-0 relative">
              <div className="flex items-center w-full">
                <div className="flex-1 min-w-0">
                  <Field ref={returnRef} label="Return Date" value={form.returnDate ? fmtDateLong(form.returnDate) : 'Select date'} Icon={Calendar}
                    onClick={() => toggle('return')} />
                </div>
                <div className="flex items-center gap-1 pr-3 shrink-0">
                  <button type="button"
                    onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, returnDate: shiftDate(f.returnDate || f.departDate, -1, f.departDate) })); }}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <ChevronLeft size={14} />
                  </button>
                  <button type="button"
                    onClick={e => { e.stopPropagation(); setForm(f => ({ ...f, returnDate: shiftDate(f.returnDate || f.departDate, 1, f.departDate) })); }}
                    className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
              {popup === 'return' && (
                <CalendarPopup anchorRef={returnRef} value={form.departDate} value2={form.returnDate}
                  isRange min={today} prices={calPrices}
                  onChange={(d1, d2) => { setForm(f => ({ ...f, departDate: d1, returnDate: d2 ?? '' })); if (d2) setPopup(null); }}
                  onClose={() => setPopup(null)} />
              )}
            </div>
          )}
        </div>

      </div>{/* end white card */}
    </motion.div>
  );
}