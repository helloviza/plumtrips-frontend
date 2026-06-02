import logoImg from "../../public/assets/logoW&OO.png";
import React, { useRef, type AnyActionArg } from "react";
import { motion, useInView } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch, Route, useLocation } from "wouter";
import { FaWhatsapp } from "react-icons/fa";
import { MapPin, Calendar, Users, Wallet, Check, Star, ArrowRight,  Mail } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { createTripInquiry,  type TripInquiryForm } from "../lib/api";



import { Header_Holiday } from "../components/Header_Holiday";
import { Button } from "../components/ui_d/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui_d/form";
import { Input } from "../components/ui_d//input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui_d/select";
import { useToast } from "../components/hooks/use-toast";
import { useForm } from "react-hook-form"

import heroBg from "../../public/assets/attached_assets/hero-bg.png";
import expTuscany from "../../public/assets/attached_assets/exp-tuscany.png";
import expThailand from "../../public/assets/attached_assets/exp-thailand.png";
import expTokyo from "../../public/assets/attached_assets/exp-tokyo.png";
import expIceland from "../../public/assets/attached_assets/exp-iceland.png";
import expDubai from "../../public/assets/attached_assets/exp-dubai.png";
import destItaly from "../../public/assets/attached_assets/dest-italy.png";
import destThailand from "../../public/assets/attached_assets/dest-thailand.png";
import destJapan from "../../public/assets/attached_assets/dest-japan.png";
import destBali from "../../public/assets/attached_assets/dest-bali.png";

// Schema for inquiry form
const inquirySchema = z.object({
  destination: z.string().min(2, "Please enter a destination"),
  departureCity: z.string().min(2, "Please enter your departure city"),
  budget: z.string().min(1, "Please select a budget range"),
  month: z.string().min(1, "Please select a travel month"),
  travelers: z.number().min(1, "Must be at least 1").max(20, "Please contact us directly for large groups")
  // travelers: z.coerce.number().min(1, "Must be at least 1").max(20, "Please contact us directly for large groups")
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

export default function Home_Holiday() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  
  

const form = useForm<InquiryFormValues>({
  resolver: zodResolver(inquirySchema),
  defaultValues: {
    destination: "",
    departureCity: "",
    budget: "",
    month: "",
    travelers: 2,
  }
})

const onSubmit = async (data: InquiryFormValues) => {
  try {
    await createTripInquiry(data as TripInquiryForm);  // ← cast here
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

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden selection:bg-secondary selection:text-primary">
      <Header_Holiday />
      
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[100dvh] flex items-center pt-20 pb-12 px-6 lg:px-12">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroBg} 
            alt="Cinematic Tuscany landscape" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-background"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 text-white">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-secondary font-medium tracking-widest uppercase mb-4 text-sm"
            >
              Plumtrips
            </motion.p>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl font-serif font-medium leading-[1.1] mb-6 text-white text-balance"
            >
              Experience the world, <br/><span className="italic text-white/90">not just the landmarks.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-white/80 max-w-xl font-light leading-relaxed mb-8"
            >
              Flights, hotels, visas, and unforgettable local experiences — all seamlessly planned by our expert curators.
            </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="lg:col-span-5 w-full"
            id="inquiry-form"
          >
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-xl shadow-2xl max-w-[320px] ml-auto">
              <h3 className="text-xl font-serif text-white mb-4">Design Your Journey</h3>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control as any}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80 text-xs uppercase tracking-wider">Destination</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                              <Input placeholder="e.g. Amalfi Coast" className="pl-9 bg-white/5 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-secondary" {...field} data-testid="input-destination" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-300 text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="departureCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80 text-xs uppercase tracking-wider">Departure City</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Mumbai" className="bg-white/5 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-secondary" {...field} data-testid="input-departure" />
                          </FormControl>
                          <FormMessage className="text-red-300 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormField
                      control={form.control as any}
                      name="month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80 text-xs uppercase tracking-wider">Travel Month</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/5 border-white/20 text-white focus:ring-secondary" data-testid="select-month">
                                <SelectValue placeholder="Select month" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                                <SelectItem className="text-black hover:bg-gray-100 focus:bg-gray-100" key={m} value={m}>{m}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-300 text-xs" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control as any}
                      name="travelers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/80 text-xs uppercase tracking-wider">Travelers</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Users className="absolute left-3 top-3 h-4 w-4 text-white/50" />
                              <Input type="number" min="1" max="20" className="pl-9 bg-white/5 border-white/20 text-white focus-visible:ring-secondary" {...field} data-testid="input-travelers" />
                            </div>
                          </FormControl>
                          <FormMessage className="text-red-300 text-xs" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control as any}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/80 text-xs uppercase tracking-wider">Budget Range</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white/5 border-white/20 text-white focus:ring-secondary" data-testid="select-budget">
                              <SelectValue placeholder="Select budget range" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem className="text-black hover:bg-gray-100 focus:bg-gray-100" value="under-1L">Under ₹1L</SelectItem>
                            <SelectItem className="text-black hover:bg-gray-100 focus:bg-gray-100" value="1L-2L">₹1L – ₹2L</SelectItem>
                            <SelectItem className="text-black hover:bg-gray-100 focus:bg-gray-100" value="2L-5L">₹2L – ₹5L</SelectItem>
                            <SelectItem className="text-black hover:bg-gray-100 focus:bg-gray-100" value="5L-plus">₹5L+</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-300 text-xs" />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4 flex flex-col gap-3">
                    <Button type="submit" size="lg" className="w-full bg-secondary hover:bg-secondary/90 text-primary font-medium text-base h-9" data-testid="button-submit-inquiry">
                      Get My Trip Plan
                    </Button>
                    <Button type="button" variant="outline" size="lg" className="w-full border-white/20 bg-transparent text-white hover:bg-white/10 h-9" onClick={() => window.open('https://wa.me/919999999999', '_blank')} data-testid="button-whatsapp-hero">
                      <FaWhatsapp className="mr-2 h-5 w-5" /> Chat on WhatsApp
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. TRUST BAR */}
      <div className="bg-primary text-secondary/80 py-5 border-y border-white/5 overflow-hidden">
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
      <section className="py-24 px-6 lg:px-12 bg-background">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="flex flex-col items-center text-center mb-16">
              <span className="text-secondary font-medium tracking-widest uppercase mb-3 text-sm">Curated Moments</span>
              <h2 className="text-4xl md:text-5xl font-serif text-primary font-medium mb-4">Beyond the Guidebook</h2>
              <p className="text-muted-foreground max-w-2xl text-lg">We don't just book hotels. We unlock exclusive access to the world's most captivating experiences.</p>
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
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 w-full">
                  <p className="text-secondary/90 text-[10px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis tracking-wider uppercase mb-1">{exp.loc}</p>
                  <h3 className="text-white text-xl font-serif">{exp.title}</h3>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-24 px-6 lg:px-12 bg-white border-y border-muted">
        <div className="max-w-7xl mx-auto">
          <FadeIn>
            <div className="text-center mb-20">
              <span className="text-secondary font-medium tracking-widest uppercase mb-3 text-sm">The Process</span>
              <h2 className="text-4xl md:text-5xl font-serif text-primary font-medium">Effortless Journey Planning</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[1px] bg-muted-foreground/20 z-0"></div>
            
            {[
              { num: "01", title: "Tell us your dream trip", desc: "Share your vision, preferred destinations, ideal dates, and budget range with our experts." },
              { num: "02", title: "We curate your journey", desc: "Our concierges craft a fully personalized itinerary, from boutique stays to hidden gems." },
              { num: "03", title: "Travel stress-free", desc: "We handle the visas, flight bookings, transfers, and ensure every detail is flawless." }
            ].map((step, i) => (
              <FadeIn key={i} delay={i * 0.2} className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-background border border-muted-foreground/20 flex items-center justify-center text-3xl font-serif text-primary mb-6 shadow-sm">
                  {step.num}
                </div>
                <h3 className="text-xl font-serif text-primary mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed px-4">{step.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 5. DESTINATIONS */}
      <section className="py-24 px-6 lg:px-12 bg-background">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-secondary font-medium tracking-widest uppercase mb-3 text-sm block">Discover</span>
              <h2 className="text-4xl md:text-5xl font-serif text-primary font-medium">Signature Destinations</h2>
            </div>
            <Button variant="outline" className="border-primary/20 text-primary hover:bg-primary hover:text-white" onClick={scrollToForm} data-testid="button-view-all">
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
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded text-[10px] font-semibold whitespace-nowrap overflow-hidden text-ellipsis text-primary uppercase tracking-wider">
                    {dest.vibe}
                  </div>
                  {/* <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <Button className="w-full bg-secondary text-primary hover:bg-secondary/90" onClick={(e) => { e.stopPropagation(); setLocation(`/country/${dest.name.toLowerCase()}`); }} data-testid={`button-plan-${dest.name}`}>
                      Get Custom Plan
                    </Button>
                  </div> */}
                </div>
                <h3 className="text-xl font-serif text-primary mb-1">{dest.name}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Ideal: {dest.duration}</p>
                  <p>Highlight: {dest.exp}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 6. SAMPLE ITINERARY */}
      <section className="py-24 px-6 lg:px-12 bg-[#0a1128] text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <FadeIn>
            <span className="text-secondary font-medium tracking-widest uppercase mb-3 text-sm block">Sample Itinerary</span>
            <h2 className="text-4xl md:text-5xl font-serif font-medium mb-8">Romantic Italy Escape</h2>
            
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/20 before:to-transparent hidden-line-mobile">
              
              <div className="relative pl-12 border-l border-white/20 pb-8">
                <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-secondary"></div>
                <span className="text-secondary text-sm font-semibold tracking-wider uppercase mb-1 block">Days 1-3: Tuscany</span>
                <h4 className="text-xl font-serif mb-2">Vineyards & Villas</h4>
                <p className="text-white/70 text-sm leading-relaxed mb-3">Stay at a 16th-century boutique estate. Private truffle hunting, sunset wine tasting overlooking the rolling hills, and a masterclass in regional pasta making.</p>
                <p className="text-white/50 text-xs italic">Stay: Rosewood Castiglion del Bosco</p>
              </div>
              
              <div className="relative pl-12 border-l border-white/20 pb-8">
                <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-secondary"></div>
                <span className="text-secondary text-sm font-semibold tracking-wider uppercase mb-1 block">Days 4-5: Venice</span>
                <h4 className="text-xl font-serif mb-2">Canals & Culture</h4>
                <p className="text-white/70 text-sm leading-relaxed mb-3">Arrive by private water taxi. Exclusive after-hours tour of St. Mark's Basilica, hidden bacari tour with a local food historian, and a private gondola ride at dusk.</p>
                <p className="text-white/50 text-xs italic">Stay: The Gritti Palace</p>
              </div>

              <div className="relative pl-12 border-l border-white/20">
                <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-secondary"></div>
                <span className="text-secondary text-sm font-semibold tracking-wider uppercase mb-1 block">Days 6-8: Amalfi Coast</span>
                <h4 className="text-xl font-serif mb-2">Cliffs & Coastlines</h4>
                <p className="text-white/70 text-sm leading-relaxed mb-3">Helicopter transfer to Positano. Private vintage Riva boat charter to Capri, cliffside dining at La Sponda, and leisurely days by the infinity pool.</p>
                <p className="text-white/50 text-xs italic">Stay: Le Sirenuse</p>
              </div>

            </div>
          </FadeIn>
          
          <FadeIn delay={0.2} className="relative h-[600px] lg:h-[800px] w-full rounded-2xl overflow-hidden shadow-2xl">
            <img src={heroBg} alt="Italy Landscape" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1128] via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <h4 className="text-xl font-serif mb-2">Want an itinerary like this?</h4>
              <p className="text-white/80 text-sm mb-4">Every detail customized to your preferences.</p>
              <Button className="w-full bg-secondary hover:bg-secondary/90 text-primary" onClick={scrollToForm} data-testid="button-get-itinerary">
                Request Custom Itinerary
              </Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 7. TESTIMONIALS */}
      <section className="py-24 px-6 lg:px-12 bg-background">
        <div className="max-w-7xl mx-auto">
          <FadeIn className="text-center mb-16">
            <span className="text-secondary font-medium tracking-widest uppercase mb-3 text-sm">Traveler Stories</span>
            <h2 className="text-4xl md:text-5xl font-serif text-primary font-medium">Memories Crafted by Plumtrips</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: "Sarah & James", dest: "Honeymoon in Maldives", text: "We didn't have to think about a single detail. From the visa process to the private beach dinner, Plumtrips made our honeymoon absolutely flawless." },
              { name: "Priya T.", dest: "Solo Trip to Japan", text: "I wanted an authentic experience away from the crowds. Plumtrips curated a route through traditional ryokans and hidden shrines that I would never have found myself." },
              { name: "The Kapoor Family", dest: "Europe Grand Tour", text: "Traveling with kids is stressful, but the personalized itinerary perfectly balanced culture with relaxation. The dedicated support on WhatsApp was a lifesaver." },
              { name: "Arjun M.", dest: "Anniversary in Switzerland", text: "The team upgraded our room and arranged a surprise glacier picnic. It's the small, thoughtful touches that make Plumtrips a premium service." }
            ].map((review, i) => (
              <FadeIn key={i} delay={i * 0.1} className="bg-white p-8 rounded-2xl shadow-sm border border-muted hover:shadow-md transition-shadow">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />)}
                </div>
                <p className="text-lg text-primary font-serif italic mb-6 leading-relaxed">"{review.text}"</p>
                <div>
                  <p className="font-semibold text-primary">{review.name}</p>
                  <p className="text-sm text-muted-foreground">{review.dest}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FINAL CTA */}
      <section className="py-24 px-6 lg:px-12 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-secondary via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeIn>
            <h2 className="text-4xl md:text-6xl font-serif text-white mb-6">Your next unforgettable journey starts here.</h2>
            <p className="text-xl text-white/70 mb-10 font-light">Tell us where you want to go — we'll handle the planning.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button size="lg" className="bg-[#d06549] hover:bg-[#f85830] text-white h-14 px-8 text-lg" onClick={scrollToForm} data-testid="button-cta-primary">
                Get My Personalized Trip Plan
              </Button>
              <Button size="lg" variant="outline" className=" text-white hover:bg-[#f85830] h-14 px-8 text-lg bg-[#d06549]" onClick={() => window.open('https://wa.me/917065932396', '_blank')} data-testid="button-cta-whatsapp">
                <FaWhatsapp className="mr-2 h-5 w-5" /> Chat on WhatsApp
              </Button>
            </div>   
          </FadeIn>
        </div>
      </section>

      {/* 9. FOOTER */}
      <footer className="bg-[#050814] text-white/60 py-12 px-6 lg:px-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <img src={logoImg} alt="Plumtrips Logo" className="h-16 w-auto object-contain mb-4 " />
            <p className="text-sm max-w-sm mb-6">Experience the world, not just the landmarks. Premium travel concierge for the discerning explorer.</p>
            <div className="flex gap-3">
              <a href="#" className="hover:text-white transition-colors" data-testid="link-instagram"><SiInstagram className="h-5 w-5" /></a>
              <a href="mailto:hello@voyara.com" className="hover:text-white transition-colors" data-testid="link-email"><Mail className="h-5 w-5" /></a>
              <a href="https://wa.me/917065932396" target="_blank" rel="noreferrer" className="hover:text-white transition-colors" data-testid="link-whatsapp-footer"><FaWhatsapp className="h-5 w-5" /></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wider uppercase text-xs">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); window.scrollTo({top:0, behavior:'smooth'}); }}>About Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); scrollToForm(); }}>Destinations</a></li>
              <li><a href="#" className="hover:text-white transition-colors" onClick={(e) => { e.preventDefault(); scrollToForm(); }}>How it Works</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4 tracking-wider uppercase text-xs">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs">
          <p>&copy; {new Date().getFullYear()} Plumtrips. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Designed for the extraordinary.</p>
        </div>
      </footer>

      {/* FLOATING WHATSAPP */}
      <a 
        href="https://wa.me/917065932396" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-20 md:bottom-8 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center"
        aria-label="Chat on WhatsApp"
        data-testid="floating-whatsapp"
      >
        <FaWhatsapp className="h-7 w-7" />
      </a>

      {/* MOBILE STICKY CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-muted z-40">
        <Button className="w-full bg-primary text-white h-9" onClick={scrollToForm} data-testid="mobile-sticky-cta">
          Plan My Journey
        </Button>
      </div>

    </div>
  );
}



