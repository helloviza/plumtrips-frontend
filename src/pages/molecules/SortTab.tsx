import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface SortTabProps {
  label: string;
  price?: string;
  active?: boolean;
  onClick?: () => void;
  hasChevron?: boolean;
}

export function SortTab({ label, price, active, onClick, hasChevron }: SortTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-start px-4 py-3 min-w-[120px] transition-colors",
        active ? "text-blue-700 bg-blue-50/50" : "text-slate-600 hover:bg-slate-50"
      )}
    >
      <div className="flex items-center gap-1">
        <span className="text-sm font-medium">{label}</span>
        {hasChevron && <span className="text-[10px]">▼</span>}
      </div>
      {price && (
        <span className={cn("text-xs mt-0.5", active ? "font-bold" : "font-normal")}>
          {price}
        </span>
      )}
      
      {active && (
        <motion.div
          layoutId="sort-tab-indicator"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
        />
      )}
    </button>
  );
}
