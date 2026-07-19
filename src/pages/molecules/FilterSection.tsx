import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export function FilterSection({ title, children, defaultExpanded = true }: FilterSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left group"
      >
        <span className="text-sm font-bold text-slate-900">{title}</span>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-4 space-y-3">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}