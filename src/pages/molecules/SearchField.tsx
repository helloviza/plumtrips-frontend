import React from 'react';
import { cn } from '../../lib/utils';
import { Icon } from '../atoms/Icon';
import { icons } from 'lucide-react';

interface SearchFieldProps {
  label: string;
  value: string;
  icon?: keyof typeof icons;
  className?: string;
}

export function SearchField({ label, value, icon, className }: SearchFieldProps) {
  return (
    <div className={cn("flex flex-col group cursor-pointer rounded-lg hover:bg-slate-50 transition-colors px-3 py-2 -mx-3 -my-2", className)}>
      <span className="text-xs font-semibold text-slate-500 mb-1">{label}</span>
      <div className="flex items-center gap-2">
        {icon && <Icon name={icon} size={18} className="text-slate-400 group-hover:text-orange-500 transition-colors" />}
        <span className="text-sm font-bold text-slate-900 whitespace-nowrap">{value}</span>
      </div>
    </div>
  );
}
