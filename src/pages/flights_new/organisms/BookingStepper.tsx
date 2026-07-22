// ============================================================
//  BookingStepper.tsx — Shared step-progress indicator
// ============================================================

import React from 'react';
import { Check } from 'lucide-react';

export const BOOKING_STEPS = [
  'Fare Review',
  'Passengers',
  'Seat Selection',
  'Extras',
  'Review',
  'Payment',
  'Confirmation',
];

interface BookingStepperProps {
  active: number;
  steps?: string[];
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
}

export function BookingStepper({
  active,
  steps = BOOKING_STEPS,
  orientation = 'horizontal',
  showLabels = true,
}: BookingStepperProps) {
  if (orientation === 'vertical') {
    return (
      <div className="space-y-1">
        {steps.map((step, i) => {
          const done = i < active;
          const current = i === active;
          return (
            <div
              key={step}
              className={`flex items-center gap-2.5 text-[10px] font-semibold py-0.5 transition-colors ${
                done ? 'text-emerald-600' : current ? 'text-[#2563eb]' : 'text-slate-300'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 transition-all"
                style={
                  current
                    ? { background: 'rgba(37,99,235,0.1)', color: '#2563eb' }
                    : done
                    ? { background: '#dcfce7', color: '#16a34a' }
                    : { background: '#f1f5f9', color: '#cbd5e1' }
                }
              >
                {done ? <Check size={9} strokeWidth={3} /> : i + 1}
              </div>
              {step}
              {current && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#2563eb] animate-pulse" />}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center overflow-x-auto scrollbar-none min-w-0 py-2">
      {steps.map((step, i) => {
        const done = i < active;
        const current = i === active;
        return (
          <React.Fragment key={step}>
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold shrink-0 transition-all duration-200"
                style={
                  current
                    ? { background: '#2563eb', color: '#fff' }
                    : done
                    ? { background: '#22c55e', color: '#fff' }
                    : { background: '#fff', color: '#94a3b8', border: '1.5px solid #cbd5e1' }
                }
              >
                {done ? <Check size={13} /> : i + 1}
              </div>
              {showLabels && (
                <span
                  className={`hidden lg:block text-xs font-semibold whitespace-nowrap transition-colors duration-200 ${
                    current ? 'text-[#2563eb]' : done ? 'text-emerald-500' : 'text-slate-400'
                  }`}
                >
                  {step}
                </span>
              )}
            </div>

            {i < steps.length - 1 && (
              <div className="flex items-center mx-2 sm:mx-2.5 shrink-0">
                <span
                  className={`text-xs tracking-widest select-none ${
                    done ? 'text-emerald-300' : 'text-slate-300'
                  }`}
                >
                  - -
                </span>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}