import React, { useState, useRef, useEffect } from 'react';
import SharedCalendarPopup from './SharedCalendarPopup';

export function HotelRangePickerTriggers({
  checkIn, checkOut,
  onCheckInChange, onCheckOutChange,
  minDate,
  checkInError, checkOutError,
  checkInLabel = 'Check In',
  checkOutLabel = 'Check Out',
  nightsLabel = true,
  checkInIcon,
  checkOutIcon,
}: {
  checkIn: Date | null; checkOut: Date | null;
  onCheckInChange: (d: Date | null) => void;
  onCheckOutChange: (d: Date | null) => void;
  minDate?: Date;
  checkInError?: string; checkOutError?: string;
  checkInLabel?: string; checkOutLabel?: string;
  nightsLabel?: boolean;
  checkInIcon?: React.ReactNode;
  checkOutIcon?: React.ReactNode;
}) {
  const [openField, setOpenField] = useState<'checkIn' | 'checkOut' | null>(null);
  const checkInRef = useRef<HTMLDivElement>(null);
  const checkOutRef = useRef<HTMLDivElement>(null);

  const nights = checkIn && checkOut
    ? Math.round((checkOut.getTime() - checkIn.getTime()) / 86400000) : 0;

  const labelStyle: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
    letterSpacing: '0.08em', color: '#8fafd4',
    display: 'block', marginBottom: 2,
  };

  const dateToStr = (d: Date | null) => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "";
  const strToDate = (s: string) => s ? new Date(s + "T00:00:00") : null;

  const checkInContent = (
    <>
      <span style={labelStyle}>{checkInLabel}</span>
      {checkIn
        ? <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
            {checkIn.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        : <span style={{ fontSize: 13, color: '#94a3b8' }}>Add date</span>
      }
      {checkInError && <p style={{ fontSize: 10, color: '#ef4444', marginTop: 2 }}>{checkInError}</p>}
    </>
  );

  const checkOutContent = (
    <>
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
    </>
  );

  return (
    <div className="contents">
      {/* Check-in trigger */}
      <div
        ref={checkInRef}
        role="button" tabIndex={0}
        onClick={() => setOpenField(f => f === 'checkIn' ? null : 'checkIn')}
        onKeyDown={e => e.key === 'Enter' && setOpenField('checkIn')}
        className="shrink-0 min-h-[64px] w-full md:w-auto md:min-w-[140px] md:max-w-[180px] border-b md:border-b-0"
        style={{
          position: 'relative', borderRight: '1px solid #e2ecf7',
          padding: '10px 14px', cursor: 'pointer',
          background: openField === 'checkIn' ? '#fef9f7' : 'transparent',
        }}
      >
        {checkInIcon ? (
          <div className="flex items-center gap-3 h-full">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              {checkInIcon}
            </div>
            <div className="min-w-0 flex-1">{checkInContent}</div>
          </div>
        ) : checkInContent}
      </div>

      {/* Check-out trigger */}
      <div
        ref={checkOutRef}
        role="button" tabIndex={0}
        onClick={() => setOpenField(f => f === 'checkOut' ? null : 'checkOut')}
        onKeyDown={e => e.key === 'Enter' && setOpenField('checkOut')}
        className="shrink-0 min-h-[64px] w-full md:w-auto md:min-w-[140px] md:max-w-[200px] border-b md:border-b-0"
        style={{
          position: 'relative', borderRight: '1px solid #e2ecf7',
          padding: '10px 14px', cursor: 'pointer',
          background: openField === 'checkOut' ? '#fef9f7' : 'transparent',
        }}
      >
        {checkOutIcon ? (
          <div className="flex items-center gap-3 h-full">
            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              {checkOutIcon}
            </div>
            <div className="min-w-0 flex-1">{checkOutContent}</div>
          </div>
        ) : checkOutContent}
      </div>

      {/* Floating panel */}
      {openField && (
        <SharedCalendarPopup
          value={dateToStr(checkIn)}
          value2={dateToStr(checkOut)}
          isRange={true}
          min={dateToStr(minDate || new Date())}
          onChange={(d1, d2) => {
            onCheckInChange(strToDate(d1));
            if (d2 !== undefined) onCheckOutChange(strToDate(d2));
          }}
          onClose={() => setOpenField(null)}
          anchorRef={openField === 'checkIn' ? checkInRef : checkOutRef}
        />
      )}
    </div>
  );
}