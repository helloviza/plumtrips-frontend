import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Star, ArrowRight, Quote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

// Extrapolated list of premium reviews
const reviews = [
  { name: "Sarah & James", dest: "Honeymoon in Maldives", text: "We didn't have to think about a single detail. From the visa process to the private beach dinner, Plumtrips made our honeymoon absolutely flawless.", rating: 5 },
  { name: "Priya T.", dest: "Solo Trip to Japan", text: "I wanted an authentic experience away from the crowds. Plumtrips curated a route through traditional ryokans and hidden shrines that I would never have found myself.", rating: 5 },
  { name: "The Kapoor Family", dest: "Europe Grand Tour", text: "Traveling with kids is stressful, but the personalized itinerary perfectly balanced culture with relaxation. The dedicated support on WhatsApp was a lifesaver.", rating: 5 },
  { name: "Arjun M.", dest: "Anniversary in Switzerland", text: "The team upgraded our room and arranged a surprise glacier picnic. It's the small, thoughtful touches that make Plumtrips a premium service.", rating: 5 },
  { name: "Ana Paula Chagia", dest: "Mediterranean Cruise", text: "Grand experience! MSC Grandiosa is a fantastic ship. The Plumtrips concierge was very professional and thorough—booked a dreamy suite and secured shore excursions we loved.", rating: 5 },
  { name: "Rohan D.", dest: "Adventure in New Zealand", text: "From bungee jumping to serene fiord cruises, everything was impeccably planned. Highly recommend for thrill-seekers who also appreciate luxury.", rating: 5 },
  { name: "Meera & Siddharth", dest: "Bali Getaway", text: "The private villa selection was out of this world. We felt like royalty from the moment we landed. Thank you for the unforgettable memories!", rating: 5 },
  { name: "Vikram S.", dest: "Business & Leisure in Dubai", text: "Plumtrips flawlessly combined my work trip with a desert safari weekend. Efficient, luxurious, and hassle-free.", rating: 4 },
  { name: "Emily R.", dest: "Alaskan Cruise", text: "Waking up to glaciers outside our window was magical. The team made sure we had the best cabin views and amazing shore excursions!", rating: 5 },
  { name: "Rahul & Neha", dest: "Paris Getaway", text: "The perfect romantic escape. Skipping the lines at the Louvre and the private Seine boat ride made it extra special.", rating: 5 },
  { name: "Suresh P.", dest: "Corporate Retreat in Goa", text: "Flawless execution for our team of 50. The beachside venue and coordinated activities kept everyone engaged. Truly top-tier service.", rating: 5 },
  { name: "Nisha V.", dest: "Cultural Tour of Egypt", text: "A breathtaking journey through history. The local guides provided by Plumtrips were incredibly knowledgeable and accommodating.", rating: 5 },
];

export default function Reviews() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen -mt-[124px] bg-[#f9f9fc] font-inter">
      
      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden bg-[#003059] pt-32 pb-24 lg:pt-40 lg:pb-32 px-6">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#00477f] via-[#003059] to-[#001e38]"></div>
        
        {/* Subtle decorative elements */}
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-[#d06549] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-1/3 right-10 w-72 h-72 bg-[#2D8CFF] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" style={{animationDelay: '2s'}}></div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <FadeIn>
            <span className="text-[#d06549] font-bold tracking-widest uppercase mb-4 text-sm block">Authentic Experiences</span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-montserrat text-white leading-tight mb-6">
              Don't just take <br className="hidden md:block"/> our word for it.
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              Join thousands of travelers who have experienced the world the Plumtrips way — effortless, luxurious, and unforgettable.
            </p>
            
            {/* Trust Indicator */}
            <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-full px-6 py-3">
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => <Star key={j} className="h-5 w-5 fill-[#febb3c] text-[#febb3c]" />)}
              </div>
              <div className="text-white/90 font-medium">
                <span className="text-white font-bold text-lg">4.9/5</span> from 10,000+ reviews
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── REVIEWS MASONRY GRID ── */}
      <section className="py-20 px-6 lg:px-12 max-w-[1400px] mx-auto">
        {/* We use CSS columns for a masonry effect without external libraries */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {reviews.map((review, i) => (
            <FadeIn key={i} delay={(i % 3) * 0.15} className="break-inside-avoid">
              <div className="relative bg-white p-8 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300 border border-slate-100 group">
                
                {/* Decorative Quote Icon Background */}
                <Quote className="absolute top-6 right-6 w-16 h-16 text-slate-50 opacity-50 rotate-12 transition-transform duration-500 group-hover:rotate-0" />

                <div className="relative z-10">
                  <div className="flex gap-1 mb-6">
                    {[...Array(review.rating)].map((_, j) => <Star key={j} className="h-4 w-4 fill-[#febb3c] text-[#febb3c]" />)}
                    {[...Array(5 - review.rating)].map((_, j) => <Star key={j} className="h-4 w-4 fill-slate-200 text-slate-200" />)}
                  </div>
                  
                  <p className="text-[#1a1c1e] font-medium text-lg italic mb-8 leading-relaxed">
                    "{review.text}"
                  </p>
                  
                  <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#003059] to-[#00477f] flex items-center justify-center text-white font-bold text-lg font-montserrat shrink-0 shadow-inner">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-[#003059]">{review.name}</p>
                      <p className="text-sm text-[#d06549] font-semibold">{review.dest}</p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="py-24 px-6 lg:px-12 relative overflow-hidden bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl font-bold font-montserrat text-[#003059] mb-6">Ready to create your own story?</h2>
            <p className="text-xl text-slate-600 mb-10 font-medium">Let our experts craft the perfect itinerary for your next adventure.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button 
                onClick={() => navigate('/holidays')}
                className="inline-flex items-center justify-center bg-[#d06549] hover:bg-[#b8543a] text-white h-14 px-8 text-lg rounded-xl font-bold shadow-lg transition-all hover:scale-105"
              >
                Plan My Trip <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>   
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
