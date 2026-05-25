import React, { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import type { FAQAccordionSection as FAQAccordionSectionType } from "../../types/destination";

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

function AccordionItem({ question, answer, isOpen, onClick }: { question: string, answer: string, isOpen: boolean, onClick: () => void }) {
  return (
    <div className="border-b border-[#0a1c2b]/10">
      <button 
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left focus:outline-none"
      >
        <span className={`text-xl font-serif text-[#0a1c2b] transition-colors ${isOpen ? 'text-[#e35d29]' : ''}`}>
          {question}
        </span>
        <span className={`text-2xl text-[#0a1c2b]/40 font-light transition-transform duration-300 ${isOpen ? 'rotate-45 text-[#e35d29]' : ''}`}>
          +
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[#0a1c2b]/70 leading-relaxed pr-12">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQAccordionSection({ data }: { data: FAQAccordionSectionType['data'] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 px-6 lg:px-12 bg-[#f5f0e6]">
      <div className="max-w-4xl mx-auto">
        <FadeIn>
          <div className="mb-16">
            <span className="text-[#e35d29] font-medium tracking-widest uppercase mb-3 text-sm block">
              {data.badge}
            </span>
            <h2 className="text-4xl md:text-5xl font-serif font-medium text-[#0a1c2b]">
              {data.title.regular}
              <span className="italic text-[#e35d29]">{data.title.italic}</span>
            </h2>
          </div>
        </FadeIn>

        <div className="flex flex-col">
          {data.faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <AccordionItem 
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === i}
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
