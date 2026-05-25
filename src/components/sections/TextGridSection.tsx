import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { TextGridSection as TextGridSectionType } from "../../types/destination";

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
};

export function TextGridSection({ data }: { data: TextGridSectionType['data'] }) {
  const isDark = data.theme === 'dark';
  const bgClass = isDark ? 'bg-[#0a1c2b]' : 'bg-[#f5f0e6]';
  const textClass = isDark ? 'text-white' : 'text-[#0a1c2b]';
  const descClass = isDark ? 'text-white/70' : 'text-[#0a1c2b]/70';
  const borderClass = isDark ? 'border-white/10' : 'border-[#0a1c2b]/10';
  
  // Decide grid columns based on items count
  const cols = data.items.length >= 6 ? 'lg:grid-cols-3' : 'lg:grid-cols-2';

  return (
    <section className={`py-24 px-6 lg:px-12 ${bgClass}`}>
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="mb-16">
            <span className="text-[#e35d29] font-medium tracking-widest uppercase mb-3 text-sm block">
              {data.badge}
            </span>
            <h2 className={`text-4xl md:text-5xl font-serif font-medium mb-4 ${textClass} max-w-2xl`}>
              {data.title.regular}
              <span className="italic text-[#e35d29]">{data.title.italic}</span>
            </h2>
            {data.description && (
              <p className={`${descClass} max-w-2xl text-lg mt-6`}>{data.description}</p>
            )}
          </div>
        </FadeIn>

        <div className={`grid grid-cols-1 md:grid-cols-2 ${cols} gap-x-12 gap-y-16`}>
          {data.items.map((item, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className={`border-t ${borderClass} pt-6`}>
                <h3 className={`text-xl font-serif mb-4 ${textClass}`}>{item.title}</h3>
                <p className={`${descClass} leading-relaxed`}>{item.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
