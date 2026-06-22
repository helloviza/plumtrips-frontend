import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { TestimonialsSection as TestimonialsSectionType } from "../../types/destination";

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

export function TestimonialsSection({ data }: { data: TestimonialsSectionType['data'] }) {
  // Determine grid columns dynamically based on how many testimonials we have. Max 3 per row.
  const cols = data.testimonials.length === 2 ? 'lg:grid-cols-2 max-w-5xl' : 'lg:grid-cols-3 max-w-7xl';
  
  return (
    <section className="py-24 px-6 lg:px-12 bg-[#0a1c2b] text-white">
      <div className={`mx-auto ${cols}`}>
        <FadeIn>
          <div className="mb-16">
            <span className="text-[#e35d29] font-medium tracking-widest uppercase mb-3 text-sm block">
              {data.badge}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-medium max-w-xl">
              {data.title.regular}
              <span className=" text-[#e35d29]">{data.title.italic}</span>
            </h2>
          </div>
        </FadeIn>

        <div className={`grid grid-cols-1 md:grid-cols-2 ${data.testimonials.length > 2 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8`}>
          {data.testimonials.map((test, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <div className="bg-[#122b40] border border-white/5 p-8 rounded-2xl h-full flex flex-col justify-between hover:border-[#e35d29]/30 transition-colors">
                <p className="text-white/80 leading-relaxed text-lg mb-8 font-light ">
                  "{test.quote}"
                </p>
                <div>
                  <h4 className="text-white font-medium">{test.author}</h4>
                  {(test.company || test.location) && (
                    <p className="text-[#e35d29] text-sm mt-1">
                      {test.company} {test.company && test.location && " • "} {test.location}
                    </p>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
