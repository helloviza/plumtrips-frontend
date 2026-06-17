import React from "react";
import { Button } from "../ui_d/button";
import type { PricingSection as PricingSectionType } from "../../types/destination";

export function PricingSection({ data, theme }: { data: PricingSectionType['data'], theme: any }) {
  const isDark = data.theme === 'dark';
  
  return (
    <section className={`py-24 px-8 ${isDark ? 'bg-[#0a1c2b] text-white' : 'bg-[#f5f0e6] text-[#0a1c2b]'}`}>
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <p className="text-[#e35d29] font-medium tracking-widest uppercase mb-4 text-xs">{data.badge}</p>
          <h2 className="text-4xl md:text-5xl font-serif font-medium leading-tight">
            {data.title.regular}<br/>
            <span className="italic text-[#e35d29]">{data.title.italic}</span>
          </h2>
          <p className={`${isDark ? 'text-white/70' : 'text-[#0a1c2b]/70'} mt-6 max-w-xl mx-auto`}>
            {data.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {data.tiers.map((tier, i) => (
            <div key={i} className={`p-10 rounded-2xl flex flex-col transition-transform hover:-translate-y-2 ${tier.highlight ? 'bg-[#e35d29] text-white shadow-2xl scale-105 z-10' : isDark ? 'bg-white/5 border border-white/10' : 'bg-white shadow-sm border border-[#0a1c2b]/10'}`}>
              <h4 className="text-xl font-serif mb-2">{tier.stars || tier.name}</h4>
              <div className="flex items-end gap-2 mb-8 border-b border-inherit pb-8" style={{ borderColor: tier.highlight ? 'rgba(255,255,255,0.2)' : undefined }}>
                <span className="text-5xl font-serif font-medium">{tier.price}</span>
                <span className="text-sm opacity-80 mb-2">{tier.price === 'Custom' ? '' : '/ person'}</span>
              </div>
              
              <div className="space-y-6 flex-grow">
                {tier.location1 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider opacity-70 font-semibold mb-2">{tier.location1}</p>
                    <p className="font-medium text-lg leading-snug">{tier.hotel1}</p>
                    <p className="text-sm opacity-80 mt-1">{tier.nights1}</p>
                  </div>
                )}
                {tier.location2 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider opacity-70 font-semibold mb-2">{tier.location2}</p>
                    <p className="font-medium text-lg leading-snug">{tier.hotel2}</p>
                    <p className="text-sm opacity-80 mt-1">{tier.nights2}</p>
                  </div>
                )}
                {tier.description && (
                  <p className="text-sm opacity-80 mb-4">{tier.description}</p>
                )}
                {tier.features && (
                  <ul className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${tier.highlight ? 'bg-white' : 'bg-[#e35d29]'}`} />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Button 
                className={`w-full rounded-full h-12 font-semibold mt-8 ${tier.highlight ? 'bg-white text-[#e35d29] hover:bg-gray-100' : isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-[#0a1c2b] hover:bg-[#0a1c2b]/90 text-white'}`}
                onClick={() => {
                  const formEl = document.getElementById("inquiry-form");
                  if (formEl) {
                    formEl.scrollIntoView({ behavior: "smooth", block: "center" });
                    formEl.style.transform = "scale(1.03)";
                    formEl.style.transition = "transform 0.3s ease";
                    setTimeout(() => { formEl.style.transform = "scale(1)"; }, 300);
                    setTimeout(() => { formEl.querySelector("input")?.focus(); }, 400);
                  }
                }}
              >
                {tier.stars ? `Select ${tier.stars.split(' ')[0]}* Package` : `Select ${tier.name}`}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
