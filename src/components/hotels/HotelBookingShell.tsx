import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { BOOKING_STEPS } from './hotelTheme';
import HotelSearchSummaryBar from './HotelSearchSummaryBar';

interface HotelBookingShellProps {
  children: ReactNode;
  activeStep: number;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  maxWidth?: '4xl' | '6xl' | '7xl';
  secureBadge?: boolean;
}

const maxWClass = {
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
} as const;

export default function HotelBookingShell({
  children,
  activeStep,
  title,
  subtitle,
  onBack,
  maxWidth = '6xl',
}: HotelBookingShellProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen" style={{ background: "#f8f7f4", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {/* Top nav */}
      <header className="bg-white border-b border-slate-100 sticky top-[64px] z-30 shadow-sm">
        <div className={`mx-auto px-4 sm:px-6 h-16 flex items-center gap-6 ${maxWClass[maxWidth]}`}>
          <button
            onClick={onBack ?? (() => navigate(-1))}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:block">Back</span>
          </button>

          {/* Step indicators */}
          <div className="flex-1 flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto scrollbar-none max-w-4xl mx-auto w-full px-2">
            {BOOKING_STEPS.slice(0, 7).map((label, i) => {
              const stepNum = i + 1;
              const done   = stepNum < activeStep + 1; // +1 since activeStep is 0-indexed here but 1-indexed in flights? Wait, BOOKING_STEPS in hotel is 0-indexed. activeStep=0 is first step.
              const active = stepNum === activeStep + 1;
              return (
                <div key={label} className={`flex items-center ${i < BOOKING_STEPS.length - 1 ? 'flex-1' : ''}`}>
                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black transition-all ${
                      done ? "bg-emerald-500 text-white" : active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                    }`}>
                      {done ? "✓" : stepNum}
                    </div>
                    <span className={`hidden md:block text-[10px] sm:text-xs font-semibold whitespace-nowrap ${
                      active ? "text-blue-600" : done ? "text-emerald-500" : "text-slate-300"
                    }`}>{label}</span>
                  </div>
                  {i < BOOKING_STEPS.length - 1 && (
                    <div className={`flex-1 h-[2px] mx-1 sm:mx-3 shrink-0 transition-colors ${done ? "bg-emerald-300" : "bg-slate-200"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Optional Title Bar below header if needed, matching the flights top spacing */}
        {(title || subtitle) && (
          <div className={`mx-auto border-t border-slate-100 px-4 sm:px-6 py-3 ${maxWClass[maxWidth]}`}>
            {title && <h1 className="text-lg font-bold text-slate-900">{title}</h1>}
            {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
          </div>
        )}
      </header>

      {/* Main layout */}
      <div className={`mx-auto px-4 sm:px-6 py-8 flex gap-8 items-start ${maxWClass[maxWidth]}`}>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}


