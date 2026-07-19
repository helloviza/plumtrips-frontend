import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface AirlineLogoProps {
  code: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /**
   * Logo image URL. Defaults to the same local path FilterPanel/ResultShared
   * already use (`/airlines/{code}.gif`) — override per-call if a flight
   * carries its own logo URL instead.
   */
  logoSrc?: string;
}

// Hardcoded brand colors — used as the fallback badge when there's no
// image, or the image fails to load.
const colors: Record<string, string> = {
  '6E': 'bg-[#001B94] text-white', // IndiGo
  AI: 'bg-[#ED1C24] text-white',   // Air India
  QP: 'bg-[#FF6600] text-white',   // Akasa Air
  SG: 'bg-[#EB2027] text-white',   // SpiceJet
  UK: 'bg-[#5B2A86] text-white',   // Vistara
};

const sizes = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

export function AirlineLogo({ code, name, size = 'md', className, logoSrc }: AirlineLogoProps) {
  // Skip straight to the fallback badge if there's no code to build a path
  // from — no point firing a request that can only 404.
  const [imgFailed, setImgFailed] = useState(!code);

  const bgColor = colors[code] || 'bg-slate-800 text-white';
  const src = logoSrc ?? `/airlines/${code}.gif`;

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full font-bold shadow-sm shrink-0 overflow-hidden',
        sizes[size],
        imgFailed ? bgColor : 'bg-white',
        className
      )}
      title={name}
    >
      {imgFailed ? (
        code
      ) : (
        <img
          src={src}
          alt={name || code}
          className="w-full h-full object-contain"
          onError={() => setImgFailed(true)}
        />
      )}
    </div>
  );
}