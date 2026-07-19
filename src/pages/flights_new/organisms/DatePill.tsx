import React from 'react';
import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';

interface DatePillProps {
  day: string;
  date: string;
  /** Already-formatted fare string, e.g. "₹6,699". Pass null while loading / unavailable. */
  price: string | null;
  active?: boolean;
  /** True while this date's fare is still being fetched — shows a shimmer instead of the price. */
  isLoading?: boolean;
  onClick?: () => void;
}

export function DatePill({ day, date, price, active, isLoading, onClick }: DatePillProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center min-w-[80px] h-[60px] rounded-lg border px-3 transition-colors",
        active
          ? "border-orange-500 bg-orange-50 shadow-sm"
          : "border-transparent hover:border-slate-200 bg-white"
      )}
    >
      <span className={cn("text-xs font-medium", active ? "text-orange-600" : "text-slate-500")}>
        {day} {date}
      </span>
      {isLoading ? (
        <span className="mt-1 h-3 w-10 rounded bg-slate-200 animate-pulse" />
      ) : (
        <span className={cn("text-xs font-bold mt-0.5", active ? "text-orange-700" : "text-slate-900")}>
          {price ?? "—"}
        </span>
      )}
    </motion.button>
  );
}