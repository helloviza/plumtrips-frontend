import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { BOOKING_STEPS, HOTEL_BG, HOTEL_NAVY } from './hotelTheme';

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
  secureBadge = true,
}: HotelBookingShellProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: HOTEL_BG }}>
      <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/95 shadow-sm backdrop-blur-md">
        <div className={`mx-auto flex ${maxWClass[maxWidth]} items-center justify-between gap-3 px-4 py-3`}>
          <button
            type="button"
            onClick={onBack ?? (() => navigate(-1))}
            className="flex shrink-0 items-center gap-2 rounded-lg px-2 py-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden text-sm font-medium sm:inline">Back</span>
          </button>

          <nav className="hidden flex-1 items-center justify-center sm:flex" aria-label="Booking progress">
            {BOOKING_STEPS.map((label, i) => {
              const done = i < activeStep;
              const current = i === activeStep;
              return (
                <div key={label} className="flex items-center">
                  <div className="flex flex-col items-center gap-1 px-2">
                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${
                        done
                          ? 'bg-emerald-500 text-white'
                          : current
                            ? 'text-white shadow-md'
                            : 'bg-gray-100 text-gray-400'
                      }`}
                      style={current ? { backgroundColor: HOTEL_NAVY } : undefined}
                    >
                      {done ? '✓' : i + 1}
                    </div>
                    <span
                      className={`hidden text-[10px] font-semibold uppercase tracking-wide lg:block ${
                        current ? 'text-[#003580]' : done ? 'text-emerald-600' : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {i < BOOKING_STEPS.length - 1 && (
                    <div
                      className={`mx-0.5 h-0.5 w-6 rounded-full sm:w-10 ${
                        i < activeStep ? 'bg-emerald-400' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </nav>

          {secureBadge ? (
            <div className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
              <Shield className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Secure</span>
            </div>
          ) : (
            <div className="w-16 shrink-0 sm:w-20" />
          )}
        </div>

        {(title || subtitle) && (
          <div className={`mx-auto border-t border-gray-100 px-4 py-3 ${maxWClass[maxWidth]}`}>
            {title && <h1 className="text-lg font-bold text-gray-900 sm:text-xl">{title}</h1>}
            {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
          </div>
        )}
      </header>

      <main className={`mx-auto px-4 py-6 ${maxWClass[maxWidth]}`}>{children}</main>
    </div>
  );
}


