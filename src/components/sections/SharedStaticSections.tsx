import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { useLocation } from "wouter";
import { Check, Star } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Button } from "../ui_d/button";

import heroBg from "../../../public/assets/attached_assets/hero-bg.png";
import expTuscany from "../../../public/assets/attached_assets/exp-tuscany.png";
import expThailand from "../../../public/assets/attached_assets/exp-thailand.png";
import expTokyo from "../../../public/assets/attached_assets/exp-tokyo.png";
import expIceland from "../../../public/assets/attached_assets/exp-iceland.png";
import expDubai from "../../../public/assets/attached_assets/exp-dubai.png";
import destThailand from "../../../public/assets/attached_assets/dest-thailand.png";
import destJapan from "../../../public/assets/attached_assets/dest-japan.png";
import destBali from "../../../public/assets/attached_assets/dest-bali.png";

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export function SharedStaticSections() {
  const [, setLocation] = useLocation();

  const scrollToForm = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* 2. TRUST BAR */}
      <div className="bg-[#0a1c2b] text-white/80 py-5 border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 md:justify-between items-center text-sm font-medium tracking-wide uppercase">
            <span className="flex items-center gap-2"><Check className="h-4 w-4" /> 500+ Curated Journeys</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Visa Guidance Included</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Personalized Itineraries</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4" /> Transparent Planning</span>
            <span className="hidden md:flex items-center gap-2"><Check className="h-4 w-4" /> Dedicated Travel Expert</span>
          </div>
        </div>
      </div>

      {/* 3. EXPERIENCES */}
      <section className="py-24 px-6 lg:px-12 bg-[#f5f0e6]">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="flex flex-col items-center text-center mb-16">
              <span className="text-[#e35d29] font-medium tracking-widest uppercase mb-3 text-sm">Curated Moments</span>
              <h2 className="text-4xl md:text-5xl font-serif text-[#0a1c2b] font-medium mb-4">Beyond the Guidebook</h2>
              <p className="text-[#0a1c2b]/70 max-w-2xl text-lg">We don't just book hotels. We unlock exclusive access to the world's most captivating experiences.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 h-[600px]">
            {[
              { img: expTuscany, title: "Wine Tasting", loc: "Tuscany, Italy", span: "lg:col-span-2" },
              { img: expThailand, title: "Private Island Hopping", loc: "Phuket, Thailand", span: "lg:col-span-1" },
              { img: expTokyo, title: "Hidden Cafés", loc: "Tokyo, Japan", span: "lg:col-span-2" },
              { img: expIceland, title: "Northern Lights", loc: "Reykjavik, Iceland", span: "lg:col-span-2" },
              { img: expDubai, title: "Desert Luxury", loc: "Dubai, UAE", span: "lg:col-span-3" }
            ].map((exp, i) => (
              <FadeIn key={i} delay={i * 0.1} className={`relative group overflow-hidden rounded-xl ${exp.span}`}>
                <img src={exp.img} alt={exp.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1c2b]/90 via-[#0a1c2b]/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <p className="text-white/90 text-[10px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis tracking-wider uppercase mb-1">{exp.loc}</p>
                  <h3 className="text-white text-xl font-serif">{exp.title}</h3>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-24 px-6 lg:px-12 bg-white border-y border-[#0a1c2b]/10">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-20">
              <span className="text-[#e35d29] font-medium tracking-widest uppercase mb-3 text-sm">The Process</span>
              <h2 className="text-4xl md:text-5xl font-serif text-[#0a1c2b] font-medium">Effortless Journey Planning</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[1px] bg-[#0a1c2b]/10 z-0"></div>
            
            {[
              { num: "01", title: "Tell us your dream trip", desc: "Share your vision, preferred destinations, ideal dates, and budget range with our experts." },
              { num: "02", title: "We curate your journey", desc: "Our concierges craft a fully personalized itinerary, from boutique stays to hidden gems." },
              { num: "03", title: "Travel stress-free", desc: "We handle the visas, flight bookings, transfers, and ensure every detail is flawless." }
            ].map((step, i) => (
              <FadeIn key={i} delay={i * 0.2} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border border-[#0a1c2b]/20 flex items-center justify-center text-3xl font-serif text-[#0a1c2b] mb-6 shadow-sm">
                  {step.num}
                </div>
                <h3 className="text-xl font-serif text-[#0a1c2b] mb-3">{step.title}</h3>
                <p className="text-[#0a1c2b]/70 leading-relaxed px-4">{step.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 5. DESTINATIONS */}
      <section className="py-24 px-6 lg:px-12 bg-[#f5f0e6]">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-[#e35d29] font-medium tracking-widest uppercase mb-3 text-sm block">Discover</span>
              <h2 className="text-4xl md:text-5xl font-serif text-[#0a1c2b] font-medium">Signature Destinations</h2>
            </div>
            <Button variant="outline" className="border-[#0a1c2b]/20 text-[#0a1c2b] hover:bg-[#0a1c2b] hover:text-white" onClick={scrollToForm}>
              Request Custom Destination
            </Button>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: heroBg, name: "Vietnam", vibe: "Cultural & Scenic", duration: "7-10 Days", exp: "Ha Long Bay & Hanoi streets" },
              { img: destThailand, name: "Thailand", vibe: "Tropical Luxury", duration: "6-8 Days", exp: "Private villas & yacht charters" },
              { img: destJapan, name: "Japan", vibe: "Cultural & Serene", duration: "10-14 Days", exp: "Ryokans & cherry blossoms" },
              { img: destBali, name: "Bali", vibe: "Wellness & Nature", duration: "5-8 Days", exp: "Jungle retreats & beach clubs" }
            ].map((dest, i) => (
              <FadeIn key={i} delay={i * 0.1} className="group cursor-pointer">
                <div className="relative overflow-hidden rounded-xl aspect-[3/4] mb-4">
                  <img src={dest.img} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-[10px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-[#0a1c2b] uppercase tracking-wider">
                    {dest.vibe}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1c2b]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <Button className="w-full bg-[#e35d29] text-white hover:bg-[#c94e1e]" onClick={(e) => { e.stopPropagation(); setLocation(`/country/${dest.name.toLowerCase()}`); }}>
                      Get Custom Plan
                    </Button>
                  </div>
                </div>
                <h3 className="text-xl font-serif text-[#0a1c2b] mb-1">{dest.name}</h3>
                <div className="text-sm text-[#0a1c2b]/70 space-y-1">
                  <p>Ideal: {dest.duration}</p>
                  <p>Highlight: {dest.exp}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-24 px-6 lg:px-12 bg-[#f5f0e6]">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-[#e35d29] font-medium tracking-widest uppercase mb-3 text-sm">Traveler Stories</span>
            <h2 className="text-4xl md:text-5xl font-serif text-[#0a1c2b] font-medium">Memories Crafted by Plumtrips</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: "Sarah & James", dest: "Honeymoon in Maldives", text: "We didn't have to think about a single detail. From the visa process to the private beach dinner, Plumtrips made our honeymoon absolutely flawless." },
              { name: "Priya T.", dest: "Solo Trip to Japan", text: "I wanted an authentic experience away from the crowds. Plumtrips curated a route through traditional ryokans and hidden shrines that I would never have found myself." },
              { name: "The Kapoor Family", dest: "Europe Grand Tour", text: "Traveling with kids is stressful, but the personalized itinerary perfectly balanced culture with relaxation. The dedicated support on WhatsApp was a lifesaver." },
              { name: "Arjun M.", dest: "Anniversary in Switzerland", text: "The team upgraded our room and arranged a surprise glacier picnic. It's the small, thoughtful touches that make Plumtrips a premium service." }
            ].map((review, i) => (
              <FadeIn key={i} delay={i * 0.1} className="bg-white p-8 rounded-2xl shadow-sm border border-[#0a1c2b]/10 hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-[#e35d29] text-[#e35d29]" />)}
                </div>
                <p className="text-lg text-[#0a1c2b] font-serif italic mb-6 leading-relaxed">"{review.text}"</p>
                <div>
                  <p className="font-semibold text-[#0a1c2b]">{review.name}</p>
                  <p className="text-sm text-[#0a1c2b]/70">{review.dest}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="py-24 px-6 lg:px-12 bg-[#0a1c2b] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-serif text-white mb-6">Your next unforgettable journey starts here.</h2>
            <p className="text-xl text-white/70 mb-10 font-light">Tell us where you want to go — we'll handle the planning.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button size="lg" className="bg-[#e35d29] hover:bg-[#c94e1e] text-white h-14 px-8 text-lg" onClick={scrollToForm}>
                Get My Personalized Trip Plan
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-14 px-8 text-lg bg-transparent" onClick={() => window.open('https://wa.me/919999999999', '_blank')}>
                <FaWhatsapp className="mr-2 h-5 w-5" /> Chat on WhatsApp
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>
    </>
  );
}
