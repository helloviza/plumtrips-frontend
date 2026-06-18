import React from "react";
import { Link } from "react-router-dom";

export function Header_Holiday() {
  return (
    <div className="absolute top-[124px] left-0 right-0 z-40 bg-transparent hidden lg:block">
      <div className="max-w-full mx-auto px-6 lg:px-12 flex items-center justify-between h-14 text-[14px] font-medium text-white/90">
        <div className="flex items-center space-x-8">
          <Link to="/holidays" className="text-[#febb3c] font-bold">All Holidays</Link>
          <Link to="/vietnam-personal" className="hover:text-white transition-colors">Vietnam</Link>
          <Link to="/thailand-personal" className="hover:text-white transition-colors">Thailand</Link>
          <Link to="/japan-personal" className="hover:text-white transition-colors">Japan</Link>
          <Link to="/bali-personal" className="hover:text-white transition-colors">Bali</Link>
        </div>
        <div className="flex items-center space-x-6 text-[13px] tracking-wide uppercase">
          <span className="text-white/50 border-r border-white/20 pr-6">Corporate Teams:</span>
          <Link to="/vietnam-corporate" className="hover:text-[#febb3c] transition-colors">Vietnam</Link>
          <Link to="/thailand-corporate" className="hover:text-[#febb3c] transition-colors">Thailand</Link>
          <Link to="/japan-corporate" className="hover:text-[#febb3c] transition-colors">Japan</Link>
          <Link to="/bali-corporate" className="hover:text-[#febb3c] transition-colors">Bali</Link>
        </div>
      </div>
    </div>
  );
}

