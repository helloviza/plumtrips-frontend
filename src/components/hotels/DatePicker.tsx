import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { cn, formatDate, formatDateSearchBar, getDayOfWeek } from '../../lib/utils';

const CALENDAR_WIDTH = 320;
const CALENDAR_GAP = 8;

interface DatePickerProps {
  selected: Date | null;
  onSelect: (date: Date | null) => void;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  error?: string;
  showPricePreview?: boolean;
  variant?: 'default' | 'bar';
  /** Bar variant: align calendar under field start or end edge */
  popoverAlign?: 'start' | 'end';
}

export default function DatePicker({
  selected,
  onSelect,
  placeholder = 'Select date',
  minDate = new Date(),
  maxDate,
  disabledDates = [],
  error,
  showPricePreview = false,
  variant = 'default',
  popoverAlign = 'start',
}: DatePickerProps) {
  const isBar = variant === 'bar';
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: CALENDAR_WIDTH });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const computePopoverPosition = useCallback(
    (rect: DOMRect, measuredHeight?: number) => {
      const viewportPad = 16;
      const estimatedHeight = measuredHeight ?? popoverRef.current?.offsetHeight ?? 340;
      const maxWidth = Math.min(CALENDAR_WIDTH, window.innerWidth - viewportPad * 2);

      let left =
        popoverAlign === 'end' ? rect.right - maxWidth : rect.left;

      left = Math.min(
        Math.max(viewportPad, left),
        window.innerWidth - maxWidth - viewportPad
      );

      let top = rect.bottom + CALENDAR_GAP;
      if (top + estimatedHeight > window.innerHeight - viewportPad) {
        top = rect.top - estimatedHeight - CALENDAR_GAP;
      }
      top = Math.max(viewportPad, top);

      return { top, left, width: maxWidth };
    },
    [popoverAlign]
  );

  const updatePopoverPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    setPopoverPos(computePopoverPosition(trigger.getBoundingClientRect()));
  }, [computePopoverPosition]);

  useEffect(() => {
    if (!isOpen) return;
    updatePopoverPosition();
    const onLayout = () => updatePopoverPosition();
    window.addEventListener('resize', onLayout);
    window.addEventListener('scroll', onLayout, true);
    return () => {
      window.removeEventListener('resize', onLayout);
      window.removeEventListener('scroll', onLayout, true);
    };
  }, [isOpen, updatePopoverPosition]);

  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(() => updatePopoverPosition());
  }, [isOpen, updatePopoverPosition]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        containerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (date: Date | undefined) => {
    onSelect(date || null);
    setIsOpen(false);
  };

  const calendarPanel = (
    <div
      ref={popoverRef}
      className={cn(
        'rounded-xl border border-gray-200 bg-white p-3 shadow-2xl',
        isBar
          ? 'fixed z-[1200] shadow-2xl overflow-hidden'
          : 'absolute left-0 z-[100] mt-2'
      )}
      style={
        isBar
          ? { top: popoverPos.top, left: popoverPos.left, width: popoverPos.width, maxWidth: 'calc(100vw - 2rem)' }
          : { width: CALENDAR_WIDTH, maxWidth: 'calc(100vw - 2rem)' }
      }
      role="dialog"
      aria-label="Choose date"
    >
      <DayPicker
        mode="single"
        selected={selected || undefined}
        onSelect={handleSelect}
        disabled={[
          { before: minDate },
          ...(maxDate ? [{ after: maxDate }] : []),
          ...disabledDates,
        ]}
        className="hotel-date-picker mx-auto"
        modifiersClassNames={{
          selected: 'bg-[#003580] text-white hover:bg-[#00224f]',
          today: 'font-bold text-[#003580]',
        }}
      />
      {showPricePreview && !isBar && (
        <p className="mt-3 border-t border-gray-200 pt-3 text-xs text-gray-500">
          Weekend prices may be higher
        </p>
      )}
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setIsOpen((open) => {
            const next = !open;
            if (next && triggerRef.current) {
              setPopoverPos(
                computePopoverPosition(triggerRef.current.getBoundingClientRect())
              );
            }
            return next;
          });
        }}
        className={cn(
          'flex w-full items-center justify-between text-left transition-all duration-200',
          isBar
            ? 'border border-slate-200 rounded-xl bg-white px-4 py-3 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#003580]/15'
            : 'rounded-lg border border-gray-300 bg-white px-4 py-3 focus:border-[#003580] focus:outline-none focus:ring-2 focus:ring-[#003580]/15',
          { 'border-red-500': error }
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {!isBar && <Calendar className="h-5 w-5 shrink-0 text-gray-400" />}
          {selected ? (
            isBar ? (
              <span className="truncate text-base font-semibold text-slate-900">
                {formatDateSearchBar(selected)}
              </span>
            ) : (
              <div>
                <div className="text-sm font-medium text-gray-900">{formatDate(selected)}</div>
                <div className="text-xs text-gray-500">{getDayOfWeek(selected)}</div>
              </div>
            )
          ) : (
            <span className={isBar ? 'text-sm text-slate-500' : 'text-gray-400'}>{placeholder}</span>
          )}
        </div>
        {isBar && <Calendar className="h-4 w-4 shrink-0 text-gray-400" />}
      </button>

      {error && (
        <p className={cn('text-red-500', isBar ? 'mt-1 text-xs' : 'mt-1.5 text-sm')}>{error}</p>
      )}

      {isOpen &&
        (isBar
          ? createPortal(calendarPanel, document.body)
          : calendarPanel)}
    </div>
  );
}
