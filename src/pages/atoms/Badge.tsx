import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'blue' | 'green' | 'purple' | 'orange' | 'gray';
  children: React.ReactNode;
}

export function Badge({ color = 'blue', className, children, ...props }: BadgeProps) {
  const colorStyles = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    orange: 'bg-orange-50 text-orange-700 border-orange-200',
    gray: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide uppercase border',
        colorStyles[color],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
