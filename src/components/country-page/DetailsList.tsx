import React from "react";
import { motion } from "framer-motion";
import type { CountryData } from "../data/countryData";

export default function DetailsList({ data }: { data: CountryData }) {
  return (
    <section className="py-32 px-6 lg:px-12 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          {/* Left Side: Large Editorial Image */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="lg:col-span-6 h-[600px] lg:h-[800px] w-full"
          >
            <img 
              src={data.details.heroImage} 
              alt={`${data.name} details`} 
              className="w-full h-full object-cover rounded-sm shadow-xl" 
            />
          </motion.div>

          {/* Right Side: Elegant Timeline List */}
          <div className="lg:col-span-6">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-serif text-[#050814] font-medium leading-tight">
                {data.details.headlinePrefix} <br/>
                <span className="italic text-[#f26722] font-light">{data.details.headlineHighlight}</span>
              </h2>
            </motion.div>

            <div className="space-y-12">
              {data.details.items.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1, delay: i * 0.15, ease: "easeOut" }}
                  className="relative pl-8 border-l border-[#050814]/10 group hover:border-[#f26722]/50 transition-colors duration-500"
                >
                  <span className="text-[#f26722] text-xs font-semibold tracking-[0.2em] uppercase mb-2 block">
                    {item.timestamp}
                  </span>
                  <h4 className="text-2xl font-serif mb-3 text-[#050814] group-hover:text-[#f26722] transition-colors duration-500">{item.title}</h4>
                  <p className="text-[#050814]/60 text-base font-light leading-relaxed max-w-md">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
