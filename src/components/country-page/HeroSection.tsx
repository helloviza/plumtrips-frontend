import { useCurrency } from '../../hooks/useCurrency';
import React from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
//import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui_d/form";
import { Input } from "../ui_d/input";
import { Button } from "../ui_d/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui_d/select";
import { useToast } from "../hooks/use-toast";
import { MapPin, Users, Calendar, Wallet, Phone, Mail } from "lucide-react";
import type { CountryData } from "../data/countryData";

const inquirySchema = z.object({
  destination: z.string().min(2, "Please enter a destination"),
  departureCity: z.string().min(2, "Please enter your departure city"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  email: z.string().email("Please enter a valid email"),
  budget: z.string().min(1, "Please select a budget range"),
  month: z.string().min(1, "Please select a travel month"),
  //travelers: z.coerce.number().min(1, "Must be at least 1").max(20, "Please contact us directly for large groups")
  travelers: z.number().min(1).max(20)
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

export default function HeroSection({ data }: { data: CountryData }) {
  const { formatCurrency, symbol } = useCurrency();
  const { toast } = useToast();
  
  const form = useForm<InquiryFormValues, any>({
  resolver: zodResolver(inquirySchema),
  defaultValues: {
    destination: data.name, // pre-fill with country name
    departureCity: "",
    phone: "",
    email: "",
    budget: "",
    month: "",
    travelers: 2,
  }
})

  const onSubmit = (formData: InquiryFormValues) => {
    toast({
      title: "Inquiry Received",
      description: `Our travel experts will contact you shortly to start planning your ${data.name} journey.`,
    });
    form.reset({ ...formData, departureCity: "", phone: "", email: "", budget: "", month: "", travelers: 2 });
  };

  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 px-6 lg:px-16 overflow-hidden">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={data.hero.image} 
          alt={`${data.name} landscape`} 
          className="w-full h-full object-cover scale-105"
        />
        {/* Soft, rich gradient for contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050814]/90 via-[#050814]/60 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-transparent to-black/30"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 items-center">
        
        {/* Left Column: Huge Elegant Typography */}
        <div className="lg:col-span-7 text-white">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="h-[1px] w-12 bg-[#f26722]"></div>
              <p className="text-[#f26722] font-semibold tracking-[0.2em] uppercase text-xs">
                Plumtrips Destination
              </p>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif font-medium leading-[1.05] tracking-tight mb-8 text-white text-balance drop-shadow-sm">
              {data.hero.headlinePrefix} <br/>
              <span className="italic text-white/90 font-light">{data.hero.headlineHighlight}</span>
            </h1>
            
            <p className="text-lg md:text-2xl text-white/70 max-w-2xl font-light leading-relaxed">
              Curated experiences in {data.name}, designed exclusively for the discerning traveler.
            </p>
          </motion.div>
        </div>

        {/* Right Column: Premium Frosted Form */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="lg:col-span-5 w-full max-w-md ml-auto"
          id="inquiry-form"
        >
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            {/* Subtle highlight effect */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

            <h3 className="text-xl font-serif text-white mb-6 font-medium tracking-wide">Design Your Journey</h3>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70 text-[10px] uppercase tracking-widest font-semibold">Destination</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                            <Input className="pl-6 bg-transparent border-0 border-b border-white/20 rounded-none text-white text-base focus-visible:ring-0 focus-visible:border-white h-10 transition-colors placeholder:text-white/30" {...field} readOnly />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control as any}
                    name="departureCity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70 text-[10px] uppercase tracking-widest font-semibold">Departure</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                            <Input placeholder="e.g. London" className="pl-6 bg-transparent border-0 border-b border-white/20 rounded-none text-white text-base focus-visible:ring-0 focus-visible:border-white h-10 transition-colors placeholder:text-white/30" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70 text-[10px] uppercase tracking-widest font-semibold">Phone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                            <Input placeholder="+91" type="tel" className="pl-6 bg-transparent border-0 border-b border-white/20 rounded-none text-white text-base focus-visible:ring-0 focus-visible:border-white h-10 transition-colors placeholder:text-white/30" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70 text-[10px] uppercase tracking-widest font-semibold">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                            <Input placeholder="hello@example.com" type="email" className="pl-6 bg-transparent border-0 border-b border-white/20 rounded-none text-white text-base focus-visible:ring-0 focus-visible:border-white h-10 transition-colors placeholder:text-white/30" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control as any}
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70 text-[10px] uppercase tracking-widest font-semibold">When</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-transparent border-0 border-b border-white/20 rounded-none text-white focus:ring-0 focus:border-white pl-0 h-10 shadow-none [&>svg]:text-white/50">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-[#050814] border-white/10 text-white">
                            {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m) => (
                              <SelectItem key={m} value={m} className="focus:bg-white/10 focus:text-white">{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as any}
                    name="travelers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/70 text-[10px] uppercase tracking-widest font-semibold">Travelers</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Users className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                            <Input type="number" min="1" max="20" className="pl-6 bg-transparent border-0 border-b border-white/20 rounded-none text-white text-base focus-visible:ring-0 focus-visible:border-white h-10 transition-colors placeholder:text-white/30" {...field} />
                          </div>
                        </FormControl>
                        <FormMessage className="text-red-400 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control as any}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70 text-[10px] uppercase tracking-widest font-semibold">Budget Range</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-0 border-b border-white/20 rounded-none text-white focus:ring-0 focus:border-white pl-0 h-10 shadow-none [&>svg]:text-white/50">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-[#050814] border-white/10 text-white">
                          <SelectItem value="under-1L" className="focus:bg-white/10 focus:text-white">Under {formatCurrency(1)}L</SelectItem>
                          <SelectItem value="1L-2L" className="focus:bg-white/10 focus:text-white">{symbol}1L – {formatCurrency(2)}L</SelectItem>
                          <SelectItem value="2L-5L" className="focus:bg-white/10 focus:text-white">{symbol}2L – {formatCurrency(5)}L</SelectItem>
                          <SelectItem value="5L-plus" className="focus:bg-white/10 focus:text-white">{symbol}5L+</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-400 text-xs" />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <Button type="submit" size="lg" className="w-full bg-white text-[#050814] hover:bg-white/90 h-12 text-sm font-semibold tracking-wider uppercase rounded-none transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                    Request Itinerary
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
