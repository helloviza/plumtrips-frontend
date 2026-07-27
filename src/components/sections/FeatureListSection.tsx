import React from "react";
import type { FeatureListSection as FeatureListSectionType } from "../../types/destination";

// Re-using the same resolveImage logic from HeroSection to handle local vs remote images
import destBali from "../../../public/assets/attached_assets/dest-bali.png";
import destItaly from "../../../public/assets/attached_assets/dest-italy.png";
import destJapan from "../../../public/assets/attached_assets/dest-japan.png";
import destThailand from "../../../public/assets/attached_assets/dest-thailand.png";
import expDubai from "../../../public/assets/attached_assets/exp-dubai.jpg";
import expIceland from "../../../public/assets/attached_assets/exp-iceland.png";
import expThailand from "../../../public/assets/attached_assets/exp-thailand.png";
import expTokyo from "../../../public/assets/attached_assets/exp-tokyo.jpg";
import expTuscany from "../../../public/assets/attached_assets/exp-tuscany.png";
import heroBg from "../../../public/assets/attached_assets/hero-bg.png";

const assetMap: Record<string, string> = {
  "../../../public/assets/attached_assets/dest-bali.png": destBali,
  "../../../public/assets/attached_assets/dest-italy.png": destItaly,
  "../../../public/assets/attached_assets/dest-japan.png": destJapan,
  "../../../public/assets/attached_assets/dest-thailand.png": destThailand,
  "../../../public/assets/attached_assets/exp-dubai.png": expDubai,
  "../../../public/assets/attached_assets/exp-iceland.png": expIceland,
  "../../../public/assets/attached_assets/exp-thailand.png": expThailand,
  "../../../public/assets/attached_assets/exp-tokyo.png": expTokyo,
  "../../../public/assets/attached_assets/exp-tuscany.png": expTuscany,
  "../../../public/assets/attached_assets/hero-bg.png": heroBg,
};

function resolveImage(path: string | undefined): string {
  if (!path) return '';
  const cleanPath = path.trim();
  if (assetMap[cleanPath]) return assetMap[cleanPath];
  for (const [key, val] of Object.entries(assetMap)) {
    if (cleanPath.includes(key)) return val;
  }
  return path;
}

export function FeatureListSection({ data, theme }: { data: FeatureListSectionType['data'], theme: any }) {
  const isDark = theme.bg === '#0a1c2b';
  const textClasses = isDark ? 'text-white' : 'text-[#0a1c2b]';
  const descClasses = isDark ? 'text-white/70' : 'text-[#0a1c2b]/70';

  const hasItemImages = data.items.some(item => item.img);

  return (
    <section className="py-24 px-8 max-w-[1400px] mx-auto border-t border-b border-[#0a1c2b]/10" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : undefined }}>
      {hasItemImages ? (
        <div className="flex flex-col space-y-24">
          <div className="text-center max-w-3xl mx-auto mb-8">
            {data.badge && (
              <span className="uppercase tracking-widest text-sm font-semibold text-[#e35d29] mb-4 block">
                {data.badge}
              </span>
            )}
            <h2 className={`text-4xl md:text-5xl font-serif font-medium leading-tight ${textClasses}`}>
              {data.title.regular}<br/>
              <span className=" text-[#e35d29]">{data.title.italic}</span>
            </h2>
          </div>
          <ul className="space-y-32">
            {data.items.map((item, i) => (
               <li key={i} className={`flex flex-col lg:flex-row gap-16 items-center ${item.align === 'right' ? 'lg:flex-row-reverse' : ''}`}>
                  <div className="w-full lg:w-1/2">
                    <img src={resolveImage(item.img)} alt={item.title} className="w-full h-[500px] object-cover rounded-2xl shadow-xl" />
                  </div>
                  <div className="w-full lg:w-1/2 lg:px-12 text-left">
                    <h4 className={`text-4xl font-serif mb-6 ${textClasses}`}>{item.title}</h4>
                    <p className={`text-xl leading-relaxed ${descClasses}`}>{item.desc}</p>
                  </div>
               </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-4 sticky top-32">
            {data.badge && (
              <span className="uppercase tracking-widest text-sm font-semibold text-[#e35d29] mb-6 block">
                {data.badge}
              </span>
            )}
            <h2 className={`text-4xl md:text-5xl font-serif font-medium leading-tight mb-8 ${textClasses}`}>
              {data.title.regular}<br/>
              <span className=" text-[#e35d29]">{data.title.italic}</span>
            </h2>
            {data.image && (
              <img src={resolveImage(data.image)} alt="Features" className="w-full h-80 object-cover rounded-2xl shadow-xl" />
            )}
          </div>
          <div className="lg:col-span-8">
            <ul className="space-y-12">
              {data.items.map((item, i) => (
                <li key={i} className="flex gap-6">
                  <div className="w-12 h-12 shrink-0 rounded-full bg-[#e35d29]/10 flex items-center justify-center text-[#e35d29] font-serif text-xl border border-[#e35d29]/20">
                    {i + 1}
                  </div>
                  <div>
                    <h4 className={`text-2xl font-serif mb-2 ${textClasses}`}>{item.title}</h4>
                    <p className={`text-lg leading-relaxed ${descClasses}`}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
