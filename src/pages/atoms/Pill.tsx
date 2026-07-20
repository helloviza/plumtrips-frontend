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
        active ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100',
        className
      )}
    >
      {children}
    </button>
  );
}

