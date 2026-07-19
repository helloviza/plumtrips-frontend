import React from 'react';
import { cn } from '../../lib/utils';
import { Icon } from './Icon';
import { icons } from 'lucide-react';

interface TagProps {
  icon?: keyof typeof icons;
  label: string;
  color?: 'green' | 'purple' | 'slate';
  className?: string;
}

export function Tag({ icon, label, color = 'slate', className }: TagProps) {
  const styles = {
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    slate: 'bg-slate-100 text-slate-700',
  };

  const iconStyles = {
    green: 'text-green-600',
    purple: 'text-purple-600',
    slate: 'text-slate-500',
  };

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium', styles[color], className)}>
      {icon && <Icon name={icon} size={14} className={iconStyles[color]} />}
      <span>{label}</span>
    </div>
  );
}
