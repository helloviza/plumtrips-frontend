import React from "react";
import type { TextMediaGridSection as TextMediaGridSectionType } from "../../types/destination";

export function TextMediaGridSection({ data, theme }: { data: TextMediaGridSectionType['data'], theme: any }) {
  const isDark = theme.bg === '#0a1c2b';
  const textClasses = isDark ? 'text-white' : 'text-[#0a1c2b]';
  const descClasses = isDark ? 'text-white/60' : 'text-[#0a1c2b]/70';

  return (
    <section className="py-24 px-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          {data.badge && <p className="text-[#e35d29] font-medium tracking-widest uppercase mb-4 text-xs">{data.badge}</p>}
          <h2 className={`text-4xl md:text-5xl font-serif font-medium leading-tight ${textClasses}`}>
            {data.title.regular}<br/>
            <span className=" text-[#e35d29]">{data.title.italic}</span>
          </h2>
        </div>
        {data.description && (
          <p className={`text-lg ${descClasses} max-w-md`}>
            {data.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {data.items.map((item, i) => (
          <div key={i} className={`p-8 rounded-2xl flex flex-col justify-between min-h-[320px] ${item.dark || isDark ? 'bg-[#0a1c2b] text-white border border-white/10' : 'bg-white shadow-sm border border-[#0a1c2b]/10'}`}>
            <div>
              <p className="text-xs uppercase tracking-widest mb-4 opacity-70 font-semibold">{item.forText}</p>
              <h3 className="text-2xl font-serif leading-snug mb-4">{item.title}</h3>
              <p className={`text-sm ${item.dark || isDark ? 'text-white/70' : 'text-[#0a1c2b]/70'}`}>{item.desc}</p>
            </div>
            {item.price && <div className="text-lg font-medium mt-8">{item.price}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}
