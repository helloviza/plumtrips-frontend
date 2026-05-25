import React from "react";
import type { InclusionsExclusionsSection } from "../../types/destination";;

export function InclusionsSection({ data, theme }: { data: InclusionsExclusionsSection['data'], theme: any }) {
  const isDark = theme.bg === '#0a1c2b';
  
  return (
    <section className={`py-24 px-8 max-w-[1400px] mx-auto border-b ${isDark ? 'border-white/10' : 'border-[#0a1c2b]/10'}`}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        
        <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-[#0a1c2b]/10'} p-10 rounded-2xl shadow-sm border`}>
          <div className="flex items-center gap-4 mb-8">
            <div className={`w-12 h-12 rounded-full ${isDark ? 'bg-[#e35d29]/20' : 'bg-[#e35d29]/10'} flex items-center justify-center`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#e35d29" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h3 className={`text-3xl font-serif ${isDark ? 'text-white' : ''}`}>What's Included</h3>
          </div>
          <ul className="space-y-4">
            {data.inclusions.map((item, i) => (
              <li key={i} className={`flex items-start gap-3 ${isDark ? 'text-white/70' : 'text-[#0a1c2b]/80'}`}>
                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-[#e35d29] shrink-0"></div>
                <span className="leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={`${isDark ? 'bg-[#0a1c2b] border-white/10' : 'bg-[#f5f0e6] border-[#0a1c2b]/10'} p-10 rounded-2xl border relative`}>
          {isDark && <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl pointer-events-none"></div>}
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className={`w-12 h-12 rounded-full ${isDark ? 'bg-white/10' : 'bg-[#0a1c2b]/10'} flex items-center justify-center`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={isDark ? "#fff" : "#0a1c2b"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </div>
              <h3 className={`text-3xl font-serif ${isDark ? 'text-white' : ''}`}>What's Not Included</h3>
            </div>
            <ul className="space-y-4">
              {data.exclusions.map((item, i) => (
                <li key={i} className={`flex items-start gap-3 ${isDark ? 'text-white/60' : 'text-[#0a1c2b]/70'}`}>
                  <div className={`mt-2 w-1.5 h-1.5 rounded-full ${isDark ? 'bg-white/30' : 'bg-[#0a1c2b]/40'} shrink-0`}></div>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </section>
  );
}
