import React from 'react';
import { icons } from 'lucide-react';

interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  name: keyof typeof icons;
  size?: number;
}

export function Icon({ name, size = 20, className, ...props }: IconProps) {
  const LucideIcon = icons[name];
  if (!LucideIcon) return null;
  return <LucideIcon size={size} className={className} {...props} />;
}
