import React from "react";
import { motion } from "framer-motion";
import type { CountryData } from "../data/countryData";

export default function QuoteSection({ data }: { data: CountryData }) {
  return (
    <section className="py-32 px-6 lg:px-12 bg-[#fdfaf6] border-y border-black/5 text-center relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-16 bg-gradient-to-b from-transparent to-[#f26722]/50"></div>
      
      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="space-y-6"
        >
          <h2 className="text-5xl md:text-7xl font-serif text-[#050814] leading-[1.1] tracking-tight">
            {data.quote.line1} <br/>
            <span className="italic text-[#f26722] font-light">{data.quote.line2}</span>
          </h2>
          <div className="w-12 h-[1px] bg-[#050814]/20 mx-auto mt-12"></div>
        </motion.div>
      </div>
    </section>
  );
}
