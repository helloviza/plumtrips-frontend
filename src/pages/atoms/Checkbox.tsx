import React from 'react';
import { cn } from '../../lib/utils';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: React.ReactNode;
  rightLabel?: React.ReactNode;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Checkbox({ label, rightLabel, checked = false, onChange, className, id, ...props }: CheckboxProps) {
  const defaultId = React.useId();
  const inputId = id || defaultId;

  return (
    <div className={cn('flex items-center justify-between w-full group cursor-pointer', className)} onClick={() => onChange?.(!checked)}>
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-5 h-5">
          <input
            type="checkbox"
            id={inputId}
            className="peer sr-only"
            checked={checked}
            onChange={(e) => onChange?.(e.target.checked)}
            {...props}
          />
          <div className={cn(
            "w-5 h-5 border rounded flex items-center justify-center transition-colors",
            checked ? "bg-orange-500 border-orange-500" : "bg-white border-slate-300 group-hover:border-orange-400"
          )}>
            <motion.div
              initial={false}
              animate={{ scale: checked ? 1 : 0, opacity: checked ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </motion.div>
          </div>
        </div>
        <label htmlFor={inputId} className="text-sm text-slate-700 cursor-pointer select-none">
          {label}
        </label>
      </div>
      {rightLabel && (
        <span className="text-sm text-slate-500">{rightLabel}</span>
      )}
    </div>
  );
}
