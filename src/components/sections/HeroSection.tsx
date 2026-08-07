// import React, { useRef } from "react";
// import { motion, useInView } from "framer-motion";
// import { Button } from "../ui_d/button";
// import { Input } from "../ui_d/input";
// import { Textarea } from "../ui_d/textarea";
// import type { HeroSection as HeroSectionType } from "../../types/destination";

// // Re-using the same resolveImage logic from HeroSection to handle local vs remote images
// import destBali from "../../../public/assets/attached_assets/dest-bali.png";
// import destItaly from "../../../public/assets/attached_assets/dest-italy.png";
// import destJapan from "../../../public/assets/attached_assets/dest-japan.png";
// import destThailand from "../../../public/assets/attached_assets/dest-thailand.png";
// import expDubai from "../../../public/assets/attached_assets/exp-dubai.png";
// import expIceland from "../../../public/assets/attached_assets/exp-iceland.png";
// import expThailand from "../../../public/assets/attached_assets/exp-thailand.png";
// import expTokyo from "../../../public/assets/attached_assets/exp-tokyo.png";
// import expTuscany from "../../../public/assets/attached_assets/exp-tuscany.png";
// import heroBg from "../../../public/assets/attached_assets/hero-bg.png";

// const assetMap: Record<string, string> = {
//   "../../../public/assets/attached_assets/dest-bali.png": destBali,
//   "../../../public/assets/attached_assets/dest-italy.png": destItaly,
//   "../../../public/assets/attached_assets/dest-japan.png": destJapan,
//   "../../../public/assets/attached_assets/dest-thailand.png": destThailand,
//   "../../../public/assets/attached_assets/exp-dubai.png": expDubai,
//   "../../../public/assets/attached_assets/exp-iceland.png": expIceland,
//   "../../../public/assets/attached_assets/exp-thailand.png": expThailand,
//   "../../../public/assets/attached_assets/exp-tokyo.png": expTokyo,
//   "../../../public/assets/attached_assets/exp-tuscany.png": expTuscany,
//   "../../../public/assets/attached_assets/hero-bg.png": heroBg,
// };

// function resolveImage(path: string | undefined): string {
//   if (!path) return '';
//   const cleanPath = path.trim();
//   if (assetMap[cleanPath]) return assetMap[cleanPath];
//   for (const [key, val] of Object.entries(assetMap)) {
//     if (cleanPath.includes(key)) return val;
//   }
//   return path;
// }

// export function HeroSection({ data }: { data: HeroSectionType['data'] }) {
//   const isDark = data.theme === 'dark';

//   return (
//     <section className="relative min-h-[90vh] flex items-center pt-24 pb-12 px-8">
//       <div className="absolute inset-0 z-0">
//         <img 
//           src={resolveImage(data.backgroundImage)} 
//           alt="Destination landscape" 
//           className="w-full h-full object-cover"
//         />
//         <div className="absolute inset-0 bg-[#0a1c2b]/40 backdrop-blur-[2px]"></div>
//         <div className={`absolute inset-0 bg-gradient-to-b from-transparent via-[#0a1c2b]/20 ${isDark ? 'to-[#0a1c2b]' : 'to-[#f5f0e6]'}`}></div>
//       </div>

//       <div className="relative z-10 w-full max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-16 mt-20">
//         <motion.div 
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 1 }}
//           className="text-white max-w-2xl"
//         >
//           <p className="text-[#e35d29] font-medium tracking-widest uppercase mb-4 text-xs">{data.badge}</p>
//           <h1 className="text-6xl md:text-[5.5rem] font-serif font-medium leading-[1.05] mb-6">
//             {data.title.regular}<br/>
//             <span className="italic text-[#e35d29]">{data.title.italic}</span>
//           </h1>
//           <p className="text-xl text-white/90 font-light mb-10 max-w-md">
//             {data.description}
//           </p>
//           <div className="flex items-center gap-6">
//             <Button className="bg-[#e35d29] hover:bg-[#c94e1e] text-white rounded-full px-10 py-6 text-lg font-semibold h-auto">
//               {data.form.buttonText}
//             </Button>
//           </div>
//         </motion.div>

//         <div className="w-full max-w-[320px] ml-auto">
//           <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-5 shadow-2xl">
//             <HeroForm isCorporate={data.form.isCorporate} title={data.form.title} buttonText={data.form.isCorporate ? 'Get a proposal' : 'Request itinerary'} />
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// function HeroForm({ isCorporate, title, buttonText }: { isCorporate: boolean, title: string, buttonText: string }) {
//   const [formState, setFormState] = React.useState<'idle' | 'otp' | 'success'>('idle');
//   const [phone, setPhone] = React.useState('');

//   const handleInitialSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setFormState('otp');
//   };

//   const handleOtpSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setFormState('success');
//   };

//   if (formState === 'success') {
//     return (
//       <div className="text-center py-8">
//         <div className="w-16 h-16 bg-[#e35d29]/20 text-[#e35d29] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#e35d29]/30">
//           <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
//         </div>
//         <h3 className="text-xl font-serif text-white mb-2 font-semibold">Request Received</h3>
//         <p className="text-sm text-white/70">Thanks for verifying your number. Our expert concierge will reach out to {phone} within 24 hours.</p>
//         <Button onClick={() => setFormState('idle')} variant="ghost" className="mt-6 text-white/50 hover:text-white text-xs">Submit another request</Button>
//       </div>
//     );
//   }

//   if (formState === 'otp') {
//     return (
//       <div className="py-2">
//         <h3 className="text-xl font-serif text-white mb-2 font-semibold">Verify your number</h3>
//         <p className="text-xs text-white/70 mb-6">Enter the 4-digit code sent to <span className="text-white font-medium">{phone || 'your phone'}</span></p>
        
//         <form onSubmit={handleOtpSubmit} className="space-y-4">
//           <div className="space-y-1 text-center">
//             <Input 
//               autoFocus
//               placeholder="0 0 0 0" 
//               maxLength={4}
//               className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 text-center text-2xl tracking-[1em] font-mono mx-auto w-48" 
//               required
//             />
//           </div>
//           <Button type="submit" className="w-full bg-[#e35d29] hover:bg-[#c94e1e] text-white rounded-full h-10 text-sm font-semibold mt-4">
//             Verify & Submit
//           </Button>
//           <div className="text-center pt-2">
//             <button type="button" onClick={() => setFormState('idle')} className="text-xs text-white/50 hover:text-white transition-colors">Wrong number? Go back</button>
//           </div>
//         </form>
//       </div>
//     );
//   }

//   return (
//     <>
//       <h3 className="text-xl font-serif text-white mb-4 font-semibold">
//         {title}
//       </h3>
//       <form onSubmit={handleInitialSubmit} className="space-y-3">
//         <div className="space-y-1">
//           <label className="text-[10px] font-semibold text-white/70 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">Name</label>
//           <Input placeholder="John Doe" required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9" />
//         </div>
        
//         <div className="grid grid-cols-2 gap-3">
//           <div className="space-y-1">
//             <label className="text-[10px] font-semibold text-white/70 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">{isCorporate ? 'Work Email' : 'Email'}</label>
//             <Input placeholder="john@example.com" type="email" required className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9" />
//           </div>
//           <div className="space-y-1">
//             <label className="text-[10px] font-semibold text-white/70 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">Phone</label>
//             <Input placeholder="+1 234 567 8900" type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9" />
//           </div>
//         </div>
        
//         <div className="grid grid-cols-2 gap-3">
//           <div className="space-y-1">
//             <label className="text-[10px] font-semibold text-white/70 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">{isCorporate ? 'Team Size' : 'Travelers'}</label>
//             <Input placeholder={isCorporate ? 'Min 10' : '2'} className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9" />
//           </div>
//           <div className="space-y-1">
//             <label className="text-[10px] font-semibold text-white/70 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">{isCorporate ? 'Date' : 'Travel Month'}</label>
//             <Input placeholder="mm/yyyy" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-9" />
//           </div>
//         </div>

//         <div className="space-y-1">
//           <label className="text-[10px] font-semibold text-white/70 uppercase tracking-wider whitespace-nowrap overflow-hidden text-ellipsis">{isCorporate ? 'Note' : 'Special Requests'}</label>
//           <Textarea placeholder="Optional message" className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none h-14" />
//         </div>

//         <Button type="submit" className="w-full bg-[#e35d29] hover:bg-[#c94e1e] text-white rounded-full h-9 text-sm font-semibold mt-2">
//           {buttonText}
//         </Button>
//         {isCorporate && (
//           <p className="text-center text-[10px] text-white/50 mt-3 leading-tight">
//             No commitment required. We'll get back to you within 24 hours.
//           </p>
//         )}
//       </form>
//     </>
//   );
// }


import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "../ui_d/button";
import { Input } from "../ui_d/input";
import { Textarea } from "../ui_d/textarea";
import { submitInquiry } from "../../lib/api";
import type { HeroSection as HeroSectionType } from "../../types/destination";

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

export function HeroSection({ data, children }: { data: HeroSectionType['data'], children?: React.ReactNode }) {
  const isDark = data.theme === 'dark';

  return (
    <section className="relative min-h-[90vh] flex items-center pt-[144px] pb-12 px-8">
      {children}
      <div className="absolute inset-0 z-0">
        <img
          src={resolveImage(data.backgroundImage)}
          alt="Destination landscape"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0a1c2b]/50 backdrop-blur-[2px]"></div>
        <div className={`absolute inset-0 bg-gradient-to-b from-[#0a1c2b]/80 via-[#0a1c2b]/40 ${isDark ? 'to-[#0a1c2b]' : 'to-[#f9f9fc]'}`}></div>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-14 flex flex-col md:flex-row justify-between items-center gap-16 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-white max-w-2xl"
        >
          <p className="text-[#e35d29] font-medium tracking-widest uppercase mb-4 text-xs">{data.badge}</p>
          <h1 className="text-3xl md:text-[3.5rem] font-serif font-medium leading-[1.05] mb-6">
            {data.title.regular}<br />
            <span className=" text-[#e35d29]">{data.title.italic}</span>
          </h1>
          <p className="text-xl text-white/90 font-light mb-10 max-w-md">
            {data.description}
          </p>

        </motion.div>

        <div className="w-full max-w-[360px] ml-auto">
        <div className="w-full max-w-[380px] ml-auto bg-white/[0.08] backdrop-blur-xl border border-white/[0.18] rounded-2xl p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.15)]">
            <HeroForm
              isCorporate={data.form.isCorporate}
              title={data.form.title}
              buttonText={data.form.isCorporate ? 'Get a proposal' : 'Request itinerary'}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroForm({
  isCorporate,
  title,
  buttonText,
}: {
  isCorporate: boolean;
  title: string;
  buttonText: string;
}) {
  const [submitted, setSubmitted] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      travelers: Number(formData.get("travelers")) || 0,
      month: formData.get("month") as string,
      formType: "hero" as const,
    };
    try {
      setLoading(true);
      await submitInquiry(payload);
      setSubmitted(true);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-white/[0.08] border border-white/[0.15] text-white placeholder:text-white/30 " +
    "rounded-[10px] h-11 px-3.5 text-sm outline-none transition-all " +
    "focus:bg-white/[0.12] focus:border-[#e35d29]/60";

  const labelClass =
    "text-[10px] font-medium tracking-widest uppercase text-white/50 block mb-1.5";

  if (submitted) {
    return (
      <motion.div
        key="success"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center py-8"
      >
        <div className="w-16 h-16 bg-[#e35d29]/20 text-[#e35d29] rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-serif text-white mb-3 font-medium">Request Received!</h3>
        <p className="text-sm text-white/60 leading-relaxed mb-8">
          Our expert concierge will get back to you within{" "}
          <span className="text-white font-semibold">24 hours</span> with a personalised itinerary.
        </p>
        <div className="border-t border-white/10 mb-6" />
        <button
          onClick={() => setSubmitted(false)}
          className="w-full bg-white/10 hover:bg-white/15 text-white rounded-xl h-11 text-sm font-medium transition-all border border-white/15"
        >
          Submit another request
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <h3 className="text-[22px] font-serif text-white mb-1.5 font-medium">{title}</h3>
      <p className="text-[13px] text-white/50 mb-6">Our concierge responds within 24 hours.</p>

      <form id="inquiry-form" onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className={labelClass}>Name</label>
          <input name="name" placeholder="John Doe" required className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{isCorporate ? "Work Email" : "Email"}</label>
            <input name="email" placeholder="john@example.com" type="email" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input name="phone" placeholder="+91 234 567 8900" type="tel" required className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>{isCorporate ? "Team Size" : "Travelers"}</label>
            <input name="travelers" type="number" placeholder={isCorporate ? "Min 10" : "2"} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>{isCorporate ? "Date" : "Travel Month"}</label>
            <input name="month" placeholder="mm/yyyy" className={inputClass} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-1 bg-gradient-to-br from-[#e35d29] to-[#c94d1f] hover:from-[#c94d1f] hover:to-[#b34018] text-white rounded-xl h-12 text-[15px] font-medium transition-all shadow-[0_4px_16px_rgba(227,93,41,0.35)] disabled:opacity-50"
        >
          {loading ? "Sending..." : buttonText}
        </button>

        <div className="flex items-center gap-2 pt-4 border-t border-white/10">
          <svg className="w-3.5 h-3.5 text-[#ef4b0f] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-[12px] text-[#ef4b0f]">No commitment required · 100% private</span>
        </div>
      </form>
    </motion.div>
  );
}