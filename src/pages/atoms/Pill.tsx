import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface PillProps {
  active?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Pill({ active = false, children, onClick, className }: PillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-4 py-1.5 rounded-full text-sm font-medium transition-colors relative',
        active ? 'text-white' : 'text-slate-600 hover:bg-slate-100',
        className
      )}
    >
      {active && (
        <motion.div
          layoutId="pill-active"
          className="absolute inset-0 bg-blue-600 rounded-full"
          initial={false}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          style={{ zIndex: -1 }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
}
