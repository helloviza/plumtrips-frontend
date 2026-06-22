import React, { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FaWhatsapp } from "react-icons/fa";
import { MapPin, Users, Check, ArrowRight, Star, Map, Compass, CalendarHeart } from "lucide-react";
import { createTripInquiry, type TripInquiryForm } from "../lib/api";
import { Link } from "react-router-dom";
import {Header_Holiday} from "../components/Header_Holiday";

import { Button } from "../components/ui_d/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui_d/form";
import { Input } from "../components/ui_d/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui_d/select";
import { useToast } from "../components/hooks/use-toast";
import { useForm } from "react-hook-form";

const inquirySchema = z.object({
  destination: z.string().min(2, "Please enter a destination"),
  departureCity: z.string().min(2, "Please enter your departure city"),
  budget: z.string().min(1, "Please select a budget range"),
  month: z.string().min(1, "Please select a travel month"),
  travelers: z.number().min(1, "Must be at least 1").max(20, "Please contact us directly for large groups"),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

const FadeIn = ({ children, delay = 0, className = "" }: { children: React.ReactNode, delay?: number, className?: string }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
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

export default function Home_Holiday() {
  const { toast } = useToast();
  const heroImgRef = useRef<HTMLImageElement>(null);

  const form = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      destination: "",
      departureCity: "",
      budget: "",
      month: "",
      travelers: 2,
    },
  });

  const onSubmit = async (data: InquiryFormValues) => {
    try {
      await createTripInquiry(data as TripInquiryForm);
      toast({
        title: "Inquiry Received",
        description: "Our travel experts will contact you shortly.",
      });
      form.reset();
    } catch (err: any) {
      toast({
        title: "Something went wrong",
        description: err?.message || "Please try again or WhatsApp us.",
        variant: "destructive",
      });
    }
  };

  const scrollToForm = () => {
    document.getElementById("inquiry-form")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleHeroMouseMove = (e: React.MouseEvent) => {
    if (!heroImgRef.current) return;
    const moveX = (e.clientX - window.innerWidth / 2) * 0.005;
    const moveY = (e.clientY - window.innerHeight / 2) * 0.005;
    heroImgRef.current.style.transform = `scale(1.1) translate(${moveX}px, ${moveY}px)`;
  };
  const handleHeroMouseLeave = () => {
    if (heroImgRef.current) heroImgRef.current.style.transform = "scale(1.1) translate(0,0)";
  };

  const cardEnter = (e: React.MouseEvent, type: "orange" | "blue" = "blue") => {
    const el = e.currentTarget as HTMLElement;
    el.style.transform = "scale(1.03)";
    el.style.boxShadow =
      type === "orange"
        ? "0 10px 30px -5px rgba(208,101,73,0.3)"
        : "0 10px 30px -5px rgba(0,71,127,0.2)";
  };
  const cardLeave = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.style.transform = "";
    el.style.boxShadow = "";
  };

  return (
    <div className="bg-[#f9f9fc] text-[#1a1c1e] font-sans overflow-x-hidden selection:bg-[#d06549] selection:text-white -mt-[124px] font-poppins">
      <style>{`
        .glass-panel { background: rgba(255,255,255,0.92); border: 1px solid rgba(0,71,127,0.1); box-shadow: 0 18px 35px rgba(0,0,0,0.1); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .hero-gradient { background: linear-gradient(160deg, rgba(0,40,80,0.4) 0%, rgba(0,55,105,0.3) 50%, rgba(0,30,60,0.2) 100%); }
        .font-montserrat { font-family: "Poppins, sans-serif" }
        .timeline-line { position: absolute; left: 1.5rem; top: 0; bottom: 0; width: 2px; background: linear-gradient(to bottom, transparent, #00477f, transparent); }
      `}</style>

      {/* 1. HERO SECTION */}
      <section 
        className="relative min-h-[85vh] flex items-center pt-[180px] pb-12 px-6 lg:px-12 overflow-hidden"
        onMouseMove={handleHeroMouseMove}
        onMouseLeave={handleHeroMouseLeave}
      >
        <Header_Holiday />
        <div className="absolute inset-0 z-0 bg-[#002040]">
          <img 
            ref={heroImgRef}
            src="/assets/attached_assets/holidays_hero_premium.png" 
            alt="Cinematic luxury travel destination" 
            className="w-full h-full object-cover transition-transform duration-[10000ms] brightness-90"
            style={{ transform: "scale(1.1) translate(0px,0px)" }}
          />
          <div className="absolute inset-0 hero-gradient"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#f9f9fc] via-transparent to-transparent opacity-90 h-32 bottom-0 top-auto"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 text-white mt-12 lg:mt-0">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-[#febb3c] font-bold tracking-widest uppercase mb-4 text-sm drop-shadow-sm"
            >
              Plumtrips Holidays
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold font-montserrat leading-[1.1] mb-6 text-white text-balance drop-shadow-lg"
            >
              Design Your <span className="text-[#febb3c]">Dream</span> <br/> Getaway.
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-white/95 max-w-xl font-medium leading-relaxed mb-8 drop-shadow"
            >
              Exclusive itineraries, premium stays, and seamless planning for the discerning traveler.
            </motion.p>
          </div>

<motion.div 
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ duration: 0.8, delay: 0.5 }}
  className="lg:col-span-5 w-full mt-8 lg:mt-0"
  id="inquiry-form"
>
  <div
    className="max-w-[420px] mx-auto lg:ml-auto lg:mr-0 rounded-3xl p-7 sm:p-8"
    style={{
      background: "rgba(255,255,255,0.10)",
      border: "1px solid rgba(255,255,255,0.22)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow: "0 24px 48px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.18)",
      
    }}
  >
    <h3 className="text-xl font-bold text-white mb-6 text-center tracking-wide">
      Plan Your Journey
    </h3>

    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="destination" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/70 font-semibold text-[10px] uppercase tracking-widest">Destination</FormLabel>
              <FormControl>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    placeholder="Amalfi Coast"
                    className="pl-9 h-10 text-sm text-white placeholder:text-white/35 rounded-xl border-white/20 focus-visible:ring-[#febb3c]/60"
                    style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.22)" }}
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-[#ffb3a7] text-[10px]" />
            </FormItem>
          )} />

          <FormField control={form.control} name="departureCity" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/70 font-semibold text-[10px] uppercase tracking-widest">From</FormLabel>
              <FormControl>
                <Input
                  placeholder="Mumbai"
                  className="h-10 text-sm text-white placeholder:text-white/35 rounded-xl border-white/20 focus-visible:ring-[#febb3c]/60"
                  style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.22)" }}
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[#ffb3a7] text-[10px]" />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-2 gap-3">
        <FormField control={form.control} name="budget" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white/70 font-semibold text-[10px] uppercase tracking-widest">Budget Range</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger
                  className="h-10 text-sm text-white rounded-xl border-white/20 focus:ring-[#febb3c]/60"
                  style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.22)" }}
                >
                  <SelectValue placeholder="Select budget range" className="text-white/35" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-[#003059] border-white/20">
                  {["January","February","March","April","May","June","July","August","September","October","November","December"].map((m) => (
                    <SelectItem key={m} value={m} className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-[#ffb3a7] text-[10px]" />
            </FormItem>
          )} />

          <FormField control={form.control} name="travelers" render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white/70 font-semibold text-[10px] uppercase tracking-widest">Travelers</FormLabel>
              <FormControl>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    type="number" min="1" max="20"
                    className="pl-9 h-10 text-sm text-white placeholder:text-white/35 rounded-xl border-white/20 focus-visible:ring-[#febb3c]/60"
                    style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.22)" }}
                    {...field}
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </div>
              </FormControl>
              <FormMessage className="text-[#ffb3a7] text-[10px]" />
            </FormItem>
          )} />
        </div>

        <FormField control={form.control} name="budget" render={({ field }) => (
          <FormItem>
            <FormLabel className="text-white/70 font-semibold text-[10px] uppercase tracking-widest">Budget Range</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger
                  className="h-10 text-sm text-white rounded-xl border-white/20 focus:ring-[#febb3c]/60"
                  style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.22)" }}
                >
                  <SelectValue placeholder="Select budget range" className="text-white/35" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="bg-[#003059] border-white/20">
                <SelectItem value="under-1L" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">Under ₹1L</SelectItem>
                <SelectItem value="1L-2L" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">₹1L – ₹2L</SelectItem>
                <SelectItem value="2L-5L" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">₹2L – ₹5L</SelectItem>
                <SelectItem value="5L-plus" className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">₹5L+</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage className="text-[#ffb3a7] text-[10px]" />
          </FormItem>
        )} />

        <Button type="submit" size="lg" className="w-full bg-[#d06549] hover:bg-[#b8543a] text-white font-bold text-base h-12 rounded-xl shadow-lg mt-2 transition-all">
          Get My Trip Plan
        </Button>
      </form>
    </Form>
  </div>
</motion.div>
        </div>
      </section>

      {/* 2. TRUST BAR */}
      <div className="bg-[#003059] text-white py-5 shadow-inner">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 md:justify-between items-center text-xs sm:text-sm font-semibold tracking-wider uppercase">
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#febb3c]" /> 5000+ Curated Journeys</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#febb3c]" /> Visa Guidance</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#febb3c]" /> Personalized Itineraries</span>
            <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#febb3c]" /> Dedicated Concierge</span>
          </div>
        </div>
      </div>

      {/* 3. HOW IT WORKS */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-[#d06549] font-bold tracking-widest uppercase mb-3 text-sm block">The Process</span>
              <h2 className="text-4xl md:text-5xl font-bold font-montserrat text-[#003059] mb-4">Effortless Journey Planning</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[1px] bg-slate-200 z-0"></div>
            {[
              { icon: Map, title: "1. Tell us your dream trip", desc: "Share your vision, preferred destinations, ideal dates, and budget range with our experts." },
              { icon: Compass, title: "2. We curate your journey", desc: "Our concierges craft a fully personalized itinerary, from boutique stays to hidden gems." },
              { icon: CalendarHeart, title: "3. Travel stress-free", desc: "We handle the visas, flight bookings, transfers, and ensure every detail is flawless." }
            ].map((step, i) => (
              <FadeIn key={i} delay={i * 0.15} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-white border-2 border-[#00477f]/10 flex items-center justify-center text-[#00477f] mb-6 shadow-xl shadow-[#00477f]/5">
                  <step.icon className="h-10 w-10 text-[#d06549]" />
                </div>
                <h3 className="text-xl font-bold font-montserrat text-[#003059] mb-3">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed px-4">{step.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 4. EXPERIENCES (Bento Grid) */}
      <section className="py-24 px-6 lg:px-12 bg-[#f9f9fc]">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <span className="text-[#d06549] font-bold tracking-widest uppercase mb-3 text-sm block">Curated Moments</span>
              <h2 className="text-4xl md:text-5xl font-bold font-montserrat text-[#003059] mb-4">Beyond the Guidebook</h2>
              <p className="text-[#424750] max-w-2xl mx-auto text-lg">We unlock exclusive access to the world's most captivating experiences.</p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-auto lg:h-[500px]">
            {[
              { img: "/assets/attached_assets/exp-tuscany.png", title: "Wine Tasting", loc: "Tuscany", span: "lg:col-span-2 lg:row-span-2" },
              { img: "/assets/attached_assets/exp-dubai.png", title: "Desert Luxury", loc: "Dubai", span: "lg:col-span-1 lg:row-span-1" },
              { img: "/assets/attached_assets/exp-tokyo.png", title: "Hidden Cafés", loc: "Tokyo", span: "lg:col-span-1 lg:row-span-2" },
              { img: "/assets/home_m/bali1.png", title: "Island Hopping", loc: "Maldives", span: "lg:col-span-1 lg:row-span-1" }
            ].map((exp, i) => (
              <FadeIn 
                key={i} 
                delay={i * 0.1}
                className={`relative group overflow-hidden rounded-3xl shadow-lg cursor-pointer ${exp.span} min-h-[200px]`}
              >
                <div 
                  className="w-full h-full"
                  onMouseEnter={cardEnter}
                  onMouseLeave={cardLeave}
                  onClick={scrollToForm}
                  style={{ transition: "all 0.5s cubic-bezier(0.165,0.84,0.44,1)" }}
                >
                  <img src={exp.img} alt={exp.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#003059]/90 via-[#003059]/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <p className="text-[#febb3c] text-xs font-bold uppercase tracking-widest mb-1">{exp.loc}</p>
                    <h3 className="text-white text-2xl font-bold font-montserrat">{exp.title}</h3>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SAMPLE ITINERARY */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <span className="text-[#d06549] font-bold tracking-widest uppercase mb-3 text-sm block">Sample Itinerary</span>
            <h2 className="text-4xl md:text-5xl font-bold font-montserrat text-[#003059] mb-12">Romantic Italy Escape</h2>
            
            <div className="space-y-10 relative">
              <div className="timeline-line"></div>
              
              {[
                { day: "Days 1-3: Tuscany", title: "Vineyards & Villas", desc: "Stay at a 16th-century boutique estate. Private truffle hunting, sunset wine tasting overlooking the rolling hills.", stay: "Rosewood Castiglion del Bosco" },
                { day: "Days 4-5: Venice", title: "Canals & Culture", desc: "Arrive by private water taxi. Exclusive after-hours tour of St. Mark's Basilica, and a private gondola ride at dusk.", stay: "The Gritti Palace" },
                { day: "Days 6-8: Amalfi Coast", title: "Cliffs & Coastlines", desc: "Helicopter transfer to Positano. Private vintage Riva boat charter to Capri, cliffside dining, and leisurely days.", stay: "Le Sirenuse" }
              ].map((item, idx) => (
                <div key={idx} className="relative pl-12">
                  <div className="absolute left-[19px] top-1.5 w-3 h-3 rounded-full bg-[#d06549] shadow-[0_0_0_4px_white]"></div>
                  <span className="text-[#00477f] text-sm font-bold tracking-wider uppercase mb-1 block">{item.day}</span>
                  <h4 className="text-2xl font-bold font-montserrat text-[#1a1c1e] mb-2">{item.title}</h4>
                  <p className="text-slate-600 text-sm leading-relaxed mb-3">{item.desc}</p>
                  <p className="text-[#d06549] text-xs font-semibold">Stay: {item.stay}</p>
                </div>
              ))}
            </div>
          </FadeIn>
          
          <FadeIn delay={0.2} className="relative h-[600px] lg:h-[750px] w-full rounded-[2rem] overflow-hidden shadow-2xl">
            <img src="/assets/home_m/italy2.png" alt="Italy Landscape" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#003059]/90 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 p-8 bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl">
              <h4 className="text-2xl font-bold font-montserrat text-[#003059] mb-2">Want an itinerary like this?</h4>
              <p className="text-slate-600 text-sm mb-6">Every detail customized to your preferences.</p>
              <Button className="w-full bg-[#d06549] hover:bg-[#b8543a] text-white rounded-xl h-12 font-bold" onClick={scrollToForm}>
                Request Custom Itinerary
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 6. DESTINATIONS */}
      <section className="py-24 px-6 lg:px-12 bg-[#f9f9fc] border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-[#d06549] font-bold tracking-widest uppercase mb-3 text-sm block">Discover</span>
              <h2 className="text-4xl md:text-5xl font-bold font-montserrat text-[#003059]">Signature Destinations</h2>
            </div>
            <Button className="bg-[#00477f] hover:bg-[#003059] text-white rounded-xl h-12 px-8 font-bold" onClick={scrollToForm}>
              Custom Destination
            </Button>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: "/assets/attached_assets/dest-thailand.png", name: "Singapore", vibe: "City + Nature", duration: "6-8 Days" },
              { img: "/assets/home_m/italy1.png", name: "Paris", vibe: "Cultural Luxury", duration: "7-10 Days" },
              { img: "/assets/home_m/norway1.png", name: "New Zealand", vibe: "Scenic & Serene", duration: "10-14 Days" },
              { img: "/assets/home_m/Morocco.png", name: "Georgia", vibe: "Historic charm", duration: "5-8 Days" }
            ].map((dest, i) => (
              <FadeIn 
                key={i} 
                delay={i * 0.1}
                className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl border border-slate-100 group cursor-pointer"
              >
                <div 
                  className="w-full h-full"
                  onMouseEnter={cardEnter}
                  onMouseLeave={cardLeave}
                  onClick={scrollToForm}
                  style={{ transition: "all 0.5s cubic-bezier(0.165,0.84,0.44,1)" }}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img src={dest.img} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-[#00477f] uppercase tracking-wider">
                      {dest.vibe}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold font-montserrat text-[#1a1c1e] mb-2">{dest.name}</h3>
                    <p className="text-sm text-[#424750] mb-4">Ideal: {dest.duration}</p>
                    <button className="text-[#d06549] font-bold flex items-center gap-1 group/btn text-sm" onClick={scrollToForm}>
                      Plan Trip <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-[#d06549] font-bold tracking-widest uppercase mb-3 text-sm block">Traveler Stories</span>
            <h2 className="text-4xl md:text-5xl font-bold font-montserrat text-[#003059]">Memories Crafted by Plumtrips</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { name: "Sarah & James", dest: "Honeymoon in Maldives", text: "We didn't have to think about a single detail. From the visa process to the private beach dinner, Plumtrips made our honeymoon absolutely flawless." },
              { name: "Priya T.", dest: "Solo Trip to Japan", text: "I wanted an authentic experience away from the crowds. Plumtrips curated a route through traditional ryokans and hidden shrines that I would never have found myself." },
              { name: "The Kapoor Family", dest: "Europe Grand Tour", text: "Traveling with kids is stressful, but the personalized itinerary perfectly balanced culture with relaxation. The dedicated support on WhatsApp was a lifesaver." },
              { name: "Arjun M.", dest: "Anniversary in Switzerland", text: "The team upgraded our room and arranged a surprise glacier picnic. It's the small, thoughtful touches that make Plumtrips a premium service." }
            ].map((review, i) => (
              <FadeIn key={i} delay={i * 0.15} className="bg-[#f9f9fc] p-8 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-[#00477f]/5 relative">
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-5 w-5 fill-[#febb3c] text-[#febb3c]" />)}
                </div>
                <p className="text-lg text-[#1a1c1e] font-medium italic mb-8 leading-relaxed">"{review.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#00477f]/10 flex items-center justify-center text-[#00477f] font-bold text-xl font-montserrat">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-[#003059]">{review.name}</p>
                    <p className="text-sm text-[#d06549] font-semibold">{review.dest}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="py-24 px-6 lg:px-12 relative overflow-hidden bg-[#003059]">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#00477f] via-[#003059] to-[#001e38]"></div>
        <div className="max-w-full mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold font-montserrat text-white mb-6">Your next unforgettable journey starts here.</h2>
          <p className="text-xl text-white/80 mb-10 font-medium">Tell us where you want to go — we'll handle the planning.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-[#d06549] hover:bg-[#b8543a] text-white h-14 px-8 text-lg rounded-xl font-bold shadow-lg" onClick={scrollToForm}>
              Get My Personalized Trip Plan
            </Button>
            <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 h-14 px-8 text-lg bg-transparent rounded-xl font-bold" onClick={() => window.open('https://wa.me/917065932396', '_blank')}>
              <FaWhatsapp className="mr-2 h-6 w-6 text-[#25D366]" /> Chat on WhatsApp
            </Button>
          </div>   
        </div>
      </section>
      
      {/* FLOATING WHATSAPP */}
      <a 
        href="https://wa.me/917065932396" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-20 md:bottom-8 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center"
      >
        <FaWhatsapp className="h-7 w-7" />
      </a>
    </div>
  );
}