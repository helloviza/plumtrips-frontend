import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { ExperiencesSection as ExperiencesSectionType } from "../../types/destination";

// Re-using the same resolveImage logic from HeroSection to handle local vs remote images
import destBali from "../../../public/assets/attached_assets/dest-bali.png";
import destItaly from "../../../public/assets/attached_assets/dest-italy.png";
import destJapan from "../../../public/assets/attached_assets/dest-japan.png";
import destThailand from "../../../public/assets/attached_assets/dest-thailand.png";
import expDubai from "../../../public/assets/attached_assets/exp-dubai.jpg";
import expIceland from "../../../public/assets/attached_assets/exp-iceland.png";
import expThailand from "../../../public/assets/attached_assets/exp-thailand.png";
import expTokyo from "../../../public/assets/attached_assets/exp-tokyo.jpg";
import expTuscany from "../../../public/assets/attached_assets/exp-tuscany.png";
import heroBg from "../../../public/assets/attached_assets/hero-bg.png";

const assetMap: Record<string, string> = {
  "../../../public/assets/attached_assets/dest-bali.png": destBali,
  "../../../public/assets/attached_assets/dest-italy.png": destItaly,
  "../../../public/assets/attached_assets/dest-japan.png": destJapan,
  "../../../public/assets/attached_assets/dest-thailand.png": destThailand,
  "../../../public/assets/attached_assets/exp-dubai.png": expDubai,
  "../../../public/assets/attached_assets/exp-iceland.png": expIceland,
  "../../../public/assets/attached_assets/exp-thailand.png": expThailand,
  "../../../public/assets/attached_assets/exp-tokyo.png": expTokyo,
  "../../../public/assets/attached_assets/exp-tuscany.png": expTuscany,
  "../../../public/assets/attached_assets/hero-bg.png": heroBg,
};

function resolveImage(path: string | undefined): string {
  if (!path) return '';
  const cleanPath = path.trim();
  if (assetMap[cleanPath]) return assetMap[cleanPath];
  for (const [key, val] of Object.entries(assetMap)) {
    if (cleanPath.includes(key)) return val;
  }
  return path;
}

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export function ExperiencesSection({ data, theme }: { data: ExperiencesSectionType['data'], theme: any }) {
  const isDark = theme.bg === '#0a1c2b';
  const textClasses = isDark ? 'text-white' : 'text-[#0a1c2b]';
  const descClasses = isDark ? 'text-white/70' : 'text-[#0a1c2b]/70';

  return (
    <section className="py-24 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto">
        <FadeIn>
          <div className="flex flex-col items-center text-center mb-16">
            <span className="text-[#e35d29] font-medium tracking-widest uppercase mb-3 text-sm">{data.badge}</span>
            <h2 className={`text-4xl md:text-5xl font-serif font-medium mb-4 ${textClasses}`}>
              {data.title.regular}
              <span className=" text-[#e35d29]">{data.title.italic}</span>
            </h2>
            <p className={`${descClasses} max-w-2xl text-lg`}>{data.description}</p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 h-[600px]">
          {data.items.map((exp, i) => (
            <FadeIn key={i} delay={i * 0.1} className={`relative group overflow-hidden rounded-xl ${exp.span}`}>
              <img src={resolveImage(exp.img)} alt={exp.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a1c2b]/90 via-[#0a1c2b]/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 w-full">
                <p className="text-white/90 text-[10px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis tracking-wider uppercase mb-1">{exp.loc}</p>
                <h3 className="text-white text-xl font-serif">{exp.title}</h3>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
