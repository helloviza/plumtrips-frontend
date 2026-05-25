import React from "react";
import { motion } from "framer-motion";
import { Button } from "../ui_d/button";
import type { CountryData } from "../data/countryData";

export default function BottomCTA({ data }: { data: CountryData }) {
  const scrollToForm = () => {
    document.getElementById("inquiry-form")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-40 px-6 lg:px-12 bg-[#050814] relative overflow-hidden">
      {/* Background Image styling to feel extremely subtle and rich */}
      <div className="absolute inset-0">
        <img src={data.hero.image} alt="Background" className="w-full h-full object-cover opacity-30 grayscale mix-blend-overlay scale-110" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-[#050814]/90 to-[#050814]/60"></div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <span className="text-white/50 font-semibold tracking-[0.3em] uppercase text-xs mb-8 block">
            Start Planning
          </span>
          <h2 className="text-5xl md:text-7xl font-serif text-white mb-8 leading-[1.1]">
            {data.cta.headlinePrefix} <br/>
            <span className="italic text-white/80 font-light">{data.cta.headlineHighlight}</span>
          </h2>
          <p className="text-xl text-white/60 mb-12 font-light max-w-xl mx-auto">{data.cta.subheadline}</p>
          
          <Button 
            size="lg" 
            className="bg-white hover:bg-white/90 text-[#050814] h-16 px-12 text-sm font-semibold tracking-widest uppercase rounded-none transition-all duration-500 shadow-2xl hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]" 
            onClick={scrollToForm}
          >
            Design Your {data.name} Trip
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
