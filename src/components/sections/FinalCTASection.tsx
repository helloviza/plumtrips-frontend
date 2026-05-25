import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "../ui_d/button";
import type { FinalCTASection as FinalCTASectionType } from "../../types/destination";

import heroBg from "../../../public/assets/attached_assets/hero-bg.png"; // We'll use this as the subtle background

const FadeIn = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
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

export function FinalCTASection({ data }: { data: FinalCTASectionType['data'] }) {
  return (
    <section className="relative py-32 px-6 lg:px-12 bg-[#0a1c2b] overflow-hidden">
      {/* Background with heavy multiply blend to make it dark and subtle */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroBg} 
          alt="Atmospheric background" 
          className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1c2b] via-[#0a1c2b]/95 to-[#0a1c2b]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <FadeIn>
          <span className="text-[#e35d29] font-medium tracking-widest uppercase mb-4 text-sm block">
            {data.badge}
          </span>
          <h2 className="text-5xl md:text-6xl lg:text-[4.5rem] font-serif font-medium text-white mb-8 leading-[1.1]">
            {data.title.regular}
            <span className="italic text-[#e35d29]">{data.title.italic}</span>
          </h2>
          <p className="text-xl text-white/70 font-light mb-12 max-w-2xl mx-auto">
            {data.description}
          </p>
          <Button className="bg-[#e35d29] hover:bg-[#c94e1e] text-white rounded-full px-10 py-7 text-lg font-semibold h-auto shadow-xl shadow-[#e35d29]/20 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#e35d29]/30">
            {data.buttonText}
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
