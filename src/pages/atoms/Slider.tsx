import React, { useRef } from 'react';
import { cn } from '../../lib/utils';

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  /** [lowValue, highValue] — controlled, matches the two handles in the UI. */
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  className?: string;
}

export function Slider({ min, max, step = 1, value, onValueChange, className }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const range = max - min || 1;
  const [lo, hi] = value;

  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const snap = (v: number) => Math.round(v / step) * step;
  const pctFromClientX = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return min;
    const pct = (clientX - rect.left) / rect.width;
    return clamp(snap(min + pct * range));
  };

  const startDrag = (handle: 'lo' | 'hi') => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);

    const move = (ev: PointerEvent) => {
      const v = pctFromClientX(ev.clientX);
      if (handle === 'lo') onValueChange([Math.min(v, hi), hi]);
      else onValueChange([lo, Math.max(v, lo)]);
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const nudge = (handle: 'lo' | 'hi') => (e: React.KeyboardEvent) => {
    const delta = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? step
      : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -step
      : 0;
    if (!delta) return;
    e.preventDefault();
    if (handle === 'lo') onValueChange([clamp(lo + delta), hi]);
    else onValueChange([lo, clamp(hi + delta)]);
  };

  const loPct = ((lo - min) / range) * 100;
  const hiPct = ((hi - min) / range) * 100;

  return (
    // Added 'px-2' here so the track is inset by 8px on each side. 
    // This perfectly accommodates the 16px (w-4) handles.
    <div className={cn('relative w-full h-5 flex items-center px-2', className)}>
      <div ref={trackRef} className="relative w-full h-1">
        {/* Base track */}
        <div className="absolute inset-0 bg-slate-200 rounded-full" />

        {/* Selected range */}
        <div
          className="absolute top-0 h-full bg-orange-500 rounded-full"
          style={{ left: `${loPct}%`, right: `${100 - hiPct}%` }}
        />

        {/* Low handle */}
        <div
          role="slider"
          aria-label="Minimum"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={lo}
          tabIndex={0}
          onPointerDown={startDrag('lo')}
          onKeyDown={nudge('lo')}
          className="absolute top-1/2 w-4 h-4 bg-white border-2 border-orange-500 rounded-full shadow-sm cursor-grab active:cursor-grabbing touch-none"
          style={{ left: `${loPct}%`, transform: 'translate(-50%, -50%)' }}
        />

        {/* High handle */}
        <div
          role="slider"
          aria-label="Maximum"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={hi}
          tabIndex={0}
          onPointerDown={startDrag('hi')}
          onKeyDown={nudge('hi')}
          className="absolute top-1/2 w-4 h-4 bg-white border-2 border-orange-500 rounded-full shadow-sm cursor-grab active:cursor-grabbing touch-none"
          style={{ left: `${hiPct}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>
    </div>
  );
}