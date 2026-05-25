import React from "react";
import { motion } from "framer-motion";
import type { CountryData } from "../data/countryData";

export default function NoticeSection({ data }: { data: CountryData }) {
  return (
    <section className="py-32 px-6 lg:px-12 bg-[#050814] text-white">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-24 text-center max-w-4xl mx-auto"
        >
          <span className="text-[#f26722] font-medium tracking-[0.2em] uppercase text-xs block mb-6">
            The Plumtrips Standard
          </span>
          <h2 className="text-4xl md:text-6xl font-serif font-medium leading-tight text-white">
            {data.notices.headlinePrefix} <br/>
            <span className="italic text-white/70 font-light">{data.notices.headlineHighlight}</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
          {data.notices.items.map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
              className="text-center group"
            >
              <div className="w-12 h-[1px] bg-[#f26722] mx-auto mb-8 transition-all duration-500 group-hover:w-24 group-hover:bg-white"></div>
              <h4 className="text-2xl font-serif mb-6 text-white group-hover:text-[#f26722] transition-colors">{item.title}</h4>
              <p className="text-white/50 text-base font-light leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
