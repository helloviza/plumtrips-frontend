import React from "react";
import { motion } from "framer-motion";
import type { CountryData } from "../data/countryData";

export default function MemoriesGrid({ data }: { data: CountryData }) {
  return (
    <section className="py-32 px-6 lg:px-12 bg-[#fdfaf6]">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="mb-20 text-center max-w-3xl mx-auto"
        >
          <span className="text-[#f26722] font-medium tracking-[0.2em] uppercase text-xs mb-6 block">
            Curated Experiences
          </span>
          <h2 className="text-4xl md:text-6xl font-serif text-[#050814] leading-tight">
            {data.memories.headlinePrefix} <br/>
            <span className="italic text-[#f26722] font-light">{data.memories.headlineHighlight}</span>
          </h2>
        </motion.div>

        {/* Masonry-style Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 auto-rows-[250px] lg:auto-rows-[300px]">
          {data.memories.items.map((exp, i) => {
            // Assign custom column spans to create an editorial layout
            const spans = [
              "md:col-span-12 lg:col-span-7 row-span-2", // Large hero image
              "md:col-span-6 lg:col-span-5 row-span-1",  // Top right
              "md:col-span-6 lg:col-span-5 row-span-1",  // Bottom right
              "md:col-span-12 lg:col-span-12 row-span-1" // Wide bottom
            ];
            const spanClass = spans[i % spans.length];

            return (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                className={`relative group overflow-hidden ${spanClass}`}
              >
                <img 
                  src={exp.image} 
                  alt={exp.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
                
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050814]/80 via-[#050814]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="absolute bottom-0 left-0 p-8 w-full translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <h3 className="text-white text-3xl font-serif font-medium">{exp.title}</h3>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
