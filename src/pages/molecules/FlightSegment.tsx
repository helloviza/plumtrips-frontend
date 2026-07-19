import React from 'react';

interface FlightSegmentProps {
  departureTime: string;
  arrivalTime: string;
  origin: string;
  destination: string;
  duration: string;
  stops: string;
  isNextDay?: boolean;
}

export function FlightSegment({
  departureTime,
  arrivalTime,
  origin,
  destination,
  duration,
  stops,
  isNextDay
}: FlightSegmentProps) {
  return (
    <div className="flex items-center gap-4 flex-1">
      <div className="text-right flex flex-col min-w-[60px]">
        <span className="text-xl font-bold text-slate-900">{departureTime}</span>
        <span className="text-sm text-slate-500">{origin}</span>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-[200px]">
        <span className="text-xs text-slate-500 mb-1">{duration} • {stops}</span>
        <div className="w-full flex items-center">
          <div className="h-px bg-slate-300 flex-1 relative">
            <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-300 -left-1 -top-1/2 translate-y-1/2" />
          </div>
          <span className="text-slate-400 px-1 text-[10px]">✈</span>
          <div className="h-px bg-slate-300 flex-1 relative">
            <div className="absolute w-1.5 h-1.5 rounded-full bg-slate-300 -right-1 -top-1/2 translate-y-1/2" />
          </div>
        </div>
      </div>

      <div className="text-left flex flex-col min-w-[70px]">
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold text-slate-900">{arrivalTime}</span>
          {isNextDay && <span className="text-[10px] font-bold text-orange-600">+1</span>}
        </div>
        <span className="text-sm text-slate-500">{destination}</span>
      </div>
    </div>
  );
}
