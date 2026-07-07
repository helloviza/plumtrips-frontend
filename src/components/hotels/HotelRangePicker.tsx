import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/* ─── tiny helpers ────────────────────────────────────────────────────── */
function sod(d: Date) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
function same(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function shiftMonth(d: Date, n: number) { return new Date(d.getFullYear(), d.getMonth() + n, 1); }

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function fmtHeaderDate(d: Date | null) {
  if (!d) return null;
  const day  = d.getDate();
  const mon  = MONTHS[d.getMonth()].slice(0, 3);
  const year = d.getFullYear();
  const dow  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
  return { main: `${day} ${mon} ${year}`, dow };
}

function buildGrid(year: number, month: number) {
  const first = new Date(year, month, 1).getDay();
  const days  = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = Array(first).fill(null);
  for (let i = 1; i <= days; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const CELL = 30; // px — compact cell size

/* ─── one month calendar grid ─────────────────────────────────────────── */
function Month({
  year, month, checkIn, checkOut, hovered, minDate,
  onHover, onClick,
}: {
  year: number; month: number;
  checkIn: Date | null; checkOut: Date | null; hovered: Date | null;
  minDate: Date;
  onHover: (d: Date | null) => void;
  onClick: (d: Date) => void;
}) {
  const cells  = buildGrid(year, month);
  const endSel = checkOut ?? hovered;

  return (
    <div style={{ width: CELL * 7 }}>
      {/* day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(7, ${CELL}px)` }}>
        {DAYS.map(d => (
          <div key={d} style={{
            textAlign: 'center', fontSize: 10, fontWeight: 600,
            color: '#94a3b8', paddingBottom: 6, userSelect: 'none',
          }}>
            {d}
          </div>
        ))}
      </div>

      {/* date cells */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(7, ${CELL}px)`, rowGap: 0 }}>
        {cells.map((day, i) => {
          if (!day) return <div key={i} style={{ height: CELL }} />;

          const date     = new Date(year, month, day);
          const ds       = sod(date);
          const disabled = ds < sod(minDate);
          const isCI     = checkIn  != null && same(date, checkIn);
          const isCO     = checkOut != null && same(date, checkOut);
          const isEdge   = isCI || isCO;

          let inRange  = false;
          let capLeft  = false;
          let capRight = false;

          if (checkIn && endSel && !same(checkIn, endSel)) {
            const lo = sod(checkIn < endSel ? checkIn  : endSel);
            const hi = sod(checkIn < endSel ? endSel   : checkIn);
            if (ds > lo && ds < hi)   inRange  = true;
            if (same(date, lo))       capLeft  = true;
            if (same(date, hi))       capRight = true;
          }

          /* range strip bg — covers full cell width for seamless highlight */
          let stripLeft  = '0%';
          let stripRight = '0%';
          let showStrip  = false;

          if (capLeft  && !capRight) { showStrip = true; stripLeft  = '50%'; stripRight = '0%';  }
          if (capRight && !capLeft)  { showStrip = true; stripLeft  = '0%';  stripRight = '50%'; }
          if (inRange)               { showStrip = true; stripLeft  = '0%';  stripRight = '0%';  }
          if (capLeft && capRight)   { showStrip = false; }

          const today = same(date, sod(new Date()));

          return (
            <div
              key={i}
              onClick={() => !disabled && onClick(date)}
              onMouseEnter={() => !disabled && onHover(date)}
              onMouseLeave={() => onHover(null)}
              style={{
                height: CELL,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: disabled ? 'default' : 'pointer',
              }}
            >
              {/* seamless range strip behind cells */}
              {showStrip && (
                <div style={{
                  position: 'absolute',
                  inset: '4px 0',
                  left: stripLeft,
                  right: stripRight,
                  background: '#fde8df',
                  zIndex: 0,
                }} />
              )}

              {/* the circle */}
              <span style={{
                position: 'relative',
                zIndex: 1,
                width: 26,
                height: 26,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                fontSize: 11,
                fontWeight: isEdge ? 700 : today ? 600 : 400,
                background: isEdge ? '#d06549' : 'transparent',
                color: isEdge ? '#fff' : disabled ? '#d1d5db' : today ? '#d06549' : '#1e293b',
                border: today && !isEdge ? '1.5px solid #d06549' : 'none',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => { if (!disabled && !isEdge) (e.currentTarget as HTMLElement).style.background = '#fde8df'; }}
              onMouseLeave={e => { if (!disabled && !isEdge) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── props ───────────────────────────────────────────────────────────── */
export interface HotelRangePickerProps {
  checkIn:  Date | null;
  checkOut: Date | null;
  onCheckInChange:  (d: Date | null) => void;
  onCheckOutChange: (d: Date | null) => void;
  openField?: 'checkIn' | 'checkOut' | null;
  onClose?: () => void;
  minDate?: Date;
}

/* ─── the panel ───────────────────────────────────────────────────────── */
export function HotelRangePicker({
  checkIn, checkOut,
  onCheckInChange, onCheckOutChange,
  openField, onClose, minDate,
}: HotelRangePickerProps) {
  const today  = sod(new Date());
  const minDay = minDate ? sod(minDate) : today;

  const [step, setStep]       = useState<'checkIn' | 'checkOut'>(openField ?? 'checkIn');
  const [hovered, setHovered] = useState<Date | null>(null);

  const defaultLeft = checkIn ?? today;
  const [left, setLeft] = useState({ y: defaultLeft.getFullYear(), m: defaultLeft.getMonth() });

  useEffect(() => {
    if (openField === 'checkOut' && checkIn) setLeft({ y: checkIn.getFullYear(), m: checkIn.getMonth() });
    if (openField) setStep(openField);
  }, [openField]); // eslint-disable-line react-hooks/exhaustive-deps

  const rightDate = shiftMonth(new Date(left.y, left.m, 1), 1);
  const ry        = rightDate.getFullYear();
  const rm        = rightDate.getMonth();

  const prev    = () => { const d = shiftMonth(new Date(left.y, left.m, 1), -1); setLeft({ y: d.getFullYear(), m: d.getMonth() }); };
  const next    = () => { const d = shiftMonth(new Date(left.y, left.m, 1),  1); setLeft({ y: d.getFullYear(), m: d.getMonth() }); };
  const canPrev = sod(new Date(left.y, left.m + 1, 0)) >= minDay;

  const handleClick = (date: Date) => {
    if (step === 'checkIn') {
      onCheckInChange(date);
      if (checkOut && date >= checkOut) onCheckOutChange(null);
      setStep('checkOut');
    } else {
      if (checkIn && date <= checkIn) {
        onCheckInChange(date); onCheckOutChange(null); setStep('checkOut');
      } else {
        onCheckOutChange(date);
      }
    }
  };

  const ciInfo = fmtHeaderDate(checkIn);
  const coInfo = fmtHeaderDate(checkOut);

  const PANEL_W = CELL * 7 * 2 + 1 + 40 + 40 + 48; // two grids + separator + arrows + padding

  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      boxShadow: '0 20px 60px rgba(0,0,0,0.16), 0 4px 16px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      width: PANEL_W,
      fontFamily: 'inherit',
    }}>

      {/* ── HEADER TABS ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid #f1f5f9' }}>
        {(['checkIn', 'checkOut'] as const).map((field) => {
          const label  = field === 'checkIn' ? 'Check-in' : 'Check-out';
          const info   = field === 'checkIn' ? ciInfo : coInfo;
          const active = step === field;
          return (
            <button
              key={field}
              type="button"
              onClick={() => setStep(field)}
              style={{
                flex: 1, textAlign: 'left',
                padding: '10px 18px 10px',
                background: active ? '#fff9f7' : '#fff',
                border: 'none',
                borderBottom: active ? '2.5px solid #d06549' : '2.5px solid transparent',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
            >
              <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: '0.09em',
                textTransform: 'uppercase',
                color: active ? '#d06549' : '#94a3b8',
                marginBottom: 4,
              }}>
                {label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: info ? '#0f172a' : '#cbd5e1', lineHeight: 1.25 }}>
                {info ? (
                  <>{info.main} <span style={{ fontSize: 11, fontWeight: 400, color: '#94a3b8' }}>{info.dow}</span></>
                ) : (
                  <span style={{ fontSize: 13, fontWeight: 400, color: '#94a3b8' }}>Select date</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── CALENDAR BODY ── */}
      <div style={{ padding: '14px 16px 6px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>

          {/* Prev arrow */}
          <button
            type="button"
            onClick={prev}
            disabled={!canPrev}
            style={{
              width: 26, height: 26, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, border: '1px solid #e2e8f0',
              background: '#fff', cursor: canPrev ? 'pointer' : 'not-allowed',
              opacity: canPrev ? 1 : 0.35, marginTop: 22, alignSelf: 'flex-start',
            }}
          >
            <ChevronLeft size={13} color="#475569" />
          </button>

          {/* Left month */}
          <div style={{ flex: 1, minWidth: 0, padding: '0 4px' }}>
            <div style={{
              textAlign: 'center', fontWeight: 700, fontSize: 12,
              color: '#1e293b', marginBottom: 8, letterSpacing: '0.01em',
            }}>
              {MONTHS[left.m]} {left.y}
            </div>
            <Month
              year={left.y} month={left.m}
              checkIn={checkIn} checkOut={checkOut}
              hovered={step === 'checkOut' ? hovered : null}
              minDate={minDay}
              onHover={setHovered} onClick={handleClick}
            />
          </div>

          {/* Divider */}
          <div style={{ width: 1, background: '#f1f5f9', alignSelf: 'stretch', margin: '0 4px' }} />

          {/* Right month */}
          <div style={{ flex: 1, minWidth: 0, padding: '0 4px' }}>
            <div style={{
              textAlign: 'center', fontWeight: 700, fontSize: 12,
              color: '#1e293b', marginBottom: 8, letterSpacing: '0.01em',
            }}>
              {MONTHS[rm]} {ry}
            </div>
            <Month
              year={ry} month={rm}
              checkIn={checkIn} checkOut={checkOut}
              hovered={step === 'checkOut' ? hovered : null}
              minDate={minDay}
              onHover={setHovered} onClick={handleClick}
            />
          </div>

          {/* Next arrow */}
          <button
            type="button"
            onClick={next}
            style={{
              width: 26, height: 26, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 6, border: '1px solid #e2e8f0',
              background: '#fff', cursor: 'pointer',
              marginTop: 22, alignSelf: 'flex-start',
            }}
          >
            <ChevronRight size={13} color="#475569" />
          </button>

        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 18px 14px', borderTop: '1px solid #f1f5f9',
      }}>
        <button
          type="button"
          onClick={() => { onCheckInChange(null); onCheckOutChange(null); setStep('checkIn'); }}
          style={{
            background: 'none', border: 'none', fontSize: 12,
            fontWeight: 500, color: '#64748b', cursor: 'pointer', padding: '6px 0',
            textDecoration: 'underline',
          }}
        >
          Clear dates
        </button>
        <button
          type="button"
          onClick={() => onClose?.()}
          style={{
            background: '#d06549', color: '#fff', border: 'none',
            padding: '7px 22px', borderRadius: 7,
            fontSize: 12, fontWeight: 700, cursor: 'pointer',
            letterSpacing: '0.02em',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#b8543a')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#d06549')}
        >
          Done
        </button>
      </div>
    </div>
  );
}

/* ─── trigger pair used inside HotelSearchBar ─────────────────────────── */
export function HotelRangePickerTriggers({
  checkIn, checkOut,
  onCheckInChange, onCheckOutChange,
  minDate,
  checkInError, checkOutError,
  checkInLabel = 'Check In',
  checkOutLabel = 'Check Out',
  nightsLabel = true,
}: {
  checkIn: Date | null; checkOut: Date | null;
  onCheckInChange: (d: Date | null) => void;
  onCheckOutChange: (d: Date | null) => void;
  minDate?: Date;
  checkInError?: string; checkOutError?: string;
  checkInLabel?: string; checkOutLabel?: string;
  nightsLabel?: boolean;
}) {
  const [openField, setOpenField] = useState<'checkIn' | 'checkOut' | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  const nights = checkIn && checkOut
    ? Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000) : 0;

  const calcPos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect   = triggerRef.current.getBoundingClientRect();
    const panelW = CELL * 7 * 2 + 1 + 40 + 40 + 48;
    let left = rect.left;
    if (left + panelW > window.innerWidth - 12) left = window.innerWidth - panelW - 12;
    left = Math.max(12, left);
    const panelH = panelRef.current?.offsetHeight ?? 460;
    let top = rect.bottom + 6;
    if (top + panelH > window.innerHeight - 12) top = rect.top - panelH - 6;
    top = Math.max(12, top);
    setPos({ top, left });
  }, []);

  useEffect(() => {
    if (!openField) return;
    calcPos();
    window.addEventListener('resize', calcPos);
    window.addEventListener('scroll', calcPos, true);
    return () => {
      window.removeEventListener('resize', calcPos);
      window.removeEventListener('scroll', calcPos, true);
    };
  }, [openField, calcPos]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpenField(null);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: '#8fafd4',
    display: 'block', marginBottom: 2,
  };

  return (
    <div ref={triggerRef} className="contents">
      {/* Check-in trigger */}
      <div
        role="button" tabIndex={0}
        onClick={() => setOpenField(f => f === 'checkIn' ? null : 'checkIn')}
        onKeyDown={e => e.key === 'Enter' && setOpenField('checkIn')}
        style={{
          flexShrink: 0, minWidth: 140, maxWidth: 180, minHeight: 64,
          position: 'relative', borderRight: '1px solid #e2ecf7',
          padding: '10px 14px', cursor: 'pointer',
          background: openField === 'checkIn' ? '#fef9f7' : 'transparent',
        }}
      >
        <span style={labelStyle}>{checkInLabel}</span>
        {checkIn
          ? <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              {checkIn.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          : <span style={{ fontSize: 13, color: '#94a3b8' }}>Add date</span>
        }
        {checkInError && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 2 }}>{checkInError}</p>}
      </div>

      {/* Check-out trigger */}
      <div
        role="button" tabIndex={0}
        onClick={() => setOpenField(f => f === 'checkOut' ? null : 'checkOut')}
        onKeyDown={e => e.key === 'Enter' && setOpenField('checkOut')}
        style={{
          flexShrink: 0, minWidth: 140, maxWidth: 200, minHeight: 64,
          position: 'relative', borderRight: '1px solid #e2ecf7',
          padding: '10px 14px', cursor: 'pointer',
          background: openField === 'checkOut' ? '#fef9f7' : 'transparent',
        }}
      >
        <span style={labelStyle}>
          {checkOutLabel}
          {nightsLabel && nights > 0 && (
            <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#003580', marginLeft: 6 }}>
              · {nights} night{nights !== 1 ? 's' : ''}
            </span>
          )}
        </span>
        {checkOut
          ? <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
              {checkOut.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          : <span style={{ fontSize: 13, color: '#94a3b8' }}>Add date</span>
        }
        {checkOutError && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 2 }}>{checkOutError}</p>}
      </div>

      {/* Floating panel */}
      {openField && createPortal(
        <div ref={panelRef} style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999 }}>
          <HotelRangePicker
            checkIn={checkIn} checkOut={checkOut}
            onCheckInChange={onCheckInChange} onCheckOutChange={onCheckOutChange}
            openField={openField} onClose={() => setOpenField(null)} minDate={minDate}
          />
        </div>,
        document.body
      )}
    </div>
  );
}
