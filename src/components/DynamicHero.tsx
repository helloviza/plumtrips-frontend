import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui_d/button";

interface DynamicHeroProps {
  category: string;
  title: ReactNode;
  subtitle: string;
  backgroundImage: string;
  children: ReactNode; // For the form
  overlayType?: "personal" | "corporate";
}

export function DynamicHero({ category, title, subtitle, backgroundImage, children, overlayType = "personal" }: DynamicHeroProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-24 pb-12 px-8">
      <div className="absolute inset-0 z-0">
        <img 
          src={backgroundImage} 
          alt="Hero background" 
          className="w-full h-full object-cover"
        />
        {overlayType === "personal" ? (
          <>
            <div className="absolute inset-0 bg-[#0a1c2b]/50 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a1c2b]/80 via-transparent to-[#f5f0e6]"></div>
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[#0a1c2b]/70 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a1c2b] via-[#0a1c2b]/50 to-[#0a1c2b]"></div>
          </>
        )}
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-16 mt-20">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-white max-w-2xl"
        >
          <p className="text-[#e35d29] font-medium tracking-widest uppercase mb-4 text-xs">{category}</p>
          <h1 className="text-6xl md:text-[5.5rem] font-serif font-medium leading-[1.05] mb-6">
            {title}
          </h1>
          <p className="text-xl text-white/90 font-light mb-10 max-w-md">
            {subtitle}
          </p>
          <div className="flex items-center gap-6">
            <Button className="bg-[#e35d29] hover:bg-[#c94e1e] text-white rounded-full px-10 py-6 text-lg font-semibold h-auto">
              {overlayType === "personal" ? "Book this journey" : "Plan a team trip"}
            </Button>
            {overlayType === "corporate" && (
              <a href="#" className="text-white font-medium underline underline-offset-4 hover:text-white/80 transition-colors">
                Talk to experts
              </a>
            )}
          </div>
        </motion.div>

        {children}
      </div>
    </section>
  );
}
