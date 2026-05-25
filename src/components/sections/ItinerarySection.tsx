import React from "react";
import { motion } from "framer-motion";
import type { ItinerarySection as ItinerarySectionType } from "../../types/destination";;

export function ItinerarySection({ data, theme }: { data: ItinerarySectionType['data'], theme: any }) {
  const isDark = theme.bg === '#0a1c2b';
  const textClasses = isDark ? 'text-white' : 'text-[#0a1c2b]';
  const descClasses = isDark ? 'text-white/60' : 'text-[#0a1c2b]/70';

  const midpoint = Math.ceil(data.items.length / 2);
  const leftCol = data.items.slice(0, midpoint);
  const rightCol = data.items.slice(midpoint);

  return (
    <section className="py-24 px-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <p className="text-[#e35d29] font-medium tracking-widest uppercase mb-4 text-xs">{data.badge}</p>
          <h2 className={`text-4xl md:text-5xl font-serif font-medium leading-tight ${textClasses}`}>
            {data.title.regular}<br/>
            <span className="italic text-[#e35d29]">{data.title.italic}</span>
          </h2>
        </div>
        <p className={`text-lg ${descClasses} max-w-md`}>
          {data.description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative">
        <div className="space-y-12">
          {leftCol.map((item, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              key={i} 
              className="relative pl-8 border-l border-[#e35d29]/30"
            >
              <div className="absolute w-3 h-3 bg-[#e35d29] rounded-full -left-[6.5px] top-2"></div>
              <span className="text-sm font-bold text-[#e35d29] uppercase tracking-wider mb-2 block">{item.day}</span>
              <h4 className={`text-2xl font-serif mb-3 ${textClasses}`}>{item.title}</h4>
              <p className={`${descClasses} leading-relaxed`}>{item.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="space-y-12">
          {rightCol.map((item, i) => (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              key={i} 
              className="relative pl-8 border-l border-[#e35d29]/30"
            >
              <div className="absolute w-3 h-3 bg-[#e35d29] rounded-full -left-[6.5px] top-2"></div>
              <span className="text-sm font-bold text-[#e35d29] uppercase tracking-wider mb-2 block">{item.day}</span>
              <h4 className={`text-2xl font-serif mb-3 ${textClasses}`}>{item.title}</h4>
              <p className={`${descClasses} leading-relaxed`}>{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
