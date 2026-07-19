import React from 'react';
import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'outline' | 'ghost' | 'text';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const variants = {
      primary: 'bg-orange-500 text-white hover:brightness-105 border border-orange-600 shadow-sm',
      outline: 'border border-orange-500 text-orange-600 hover:bg-orange-50',
      ghost: 'text-slate-600 hover:bg-slate-100',
      text: 'text-orange-600 hover:underline p-0 h-auto',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm font-medium',
      lg: 'px-6 py-3 text-base font-medium',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={variant !== 'text' ? { scale: 1.02 } : {}}
        whileTap={variant !== 'text' ? { scale: 0.98 } : {}}
        className={cn(
          'inline-flex items-center justify-center rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50',
          variant !== 'text' && sizes[size],
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
Button.displayName = 'Button';
