import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { getOffers, type Offer } from "../../lib/api";

const HERO_BG = "https://images.openai.com/static-rsc-4/jZ0v3WnqJ3eC4VYsKw8lpJREAQFEGnP4by3sO70qJw9Q26ta0zvj2JhiUcthpAS6UIQkG1OT6ioNkVWwQUlCEHNdeF9scvY6ZAG_dflhsOZSu3ybVa79_iXjiLZq3K3Hg0stdvYt-u_0_L0rlpYOOwHyVTqkPOm8T86TPgnRhOpa6El7Hpc3Auus3SJRa7-X?purpose=fullsize";

type OfferType = "All" | "Hotel" | "Flight" | "Tour" | "Transfer" | "Activity" | "Package" | "Other";
const TABS: OfferType[] = ["All", "Hotel", "Flight", "Tour", "Transfer", "Activity", "Package", "Other"];

const STATIC_OFFERS = [
  { id: "holiday1", type: "Tour", label: "Save 30%", labelVariant: "primary" as const, title: "Romantic Maldives Escape", subtitle: "5 Nights · Water Villa + Seaplane Transfers", priceCrossed: "₹6,83,700", price: "₹4,78,200", img: "/assets/offers/maldives.jpg", perk: "Exclusive Perk" },
  { id: "holiday2", type: "Tour", label: "Limited Availability", labelVariant: "error" as const, title: "Swiss Alps Experience", subtitle: "7 Nights · Scenic Trains & Luxury Stays", priceCrossed: "₹8,74,500", price: "₹6,56,000", img: "/assets/offers/switzerland.jpg", perk: "Butler Service" },
  { id: "flight1", type: "Flight", label: "Flash Deal", labelVariant: "dark" as const, title: "Return to Dubai", subtitle: "From Delhi · Direct Flights", priceCrossed: null, price: "₹18,500", img: "/assets/offers/dubai-flight.jpg", perk: "Priority Boarding" },
  { id: "flight2", type: "Flight", label: "Exclusive Perk", labelVariant: "dark" as const, title: "Singapore Special", subtitle: "From Mumbai · Full-Service Airline", priceCrossed: null, price: "₹24,000", img: "/assets/offers/singapore-flight.jpg", perk: "Lounge Access" },
  { id: "hotel1", type: "Hotel", label: "Save 23%", labelVariant: "primary" as const, title: "Udaipur Heritage Palace Stay", subtitle: "2 Nights · Lake View Suite", priceCrossed: "₹2,66,500", price: "₹2,05,200", img: "/assets/offers/udaipur-hotel.jpg", perk: "Breakfast Included" },
  { id: "hotel2", type: "Hotel", label: "Member Rate", labelVariant: "primary" as const, title: "Dubai Marina Luxury", subtitle: "3 Nights · Breakfast Included", priceCrossed: "₹4,00,000", price: "₹3,00,000", img: "/assets/offers/dubai-hotel.jpg", perk: "Late Checkout" },
];

const IMMERSIONS = [
  { id: "im1", size: "large", category: "ESTATE IMMERSION", badge: "LIMITED WINDOW", title: "The Dynastic Echo", description: "Fourteen days of deep seclusion in a restored 17th-century private monastery.", remaining: "2 Suites", priceCrossed: "₹46,65,000 pp", price: "Member: ₹35,00,000 pp", img: "/assets/offers/maldives.jpg" },
  { id: "im2", size: "tall", category: "Highland Retreat", badge: "LIMITED TIME", title: "Glenfinnan Manor", description: "Master the art of falconry and estate management in a residence that hosted kings.", dates: "Oct – Nov 2024", remaining: "4 Capacity Left", img: "/assets/offers/switzerland.jpg" },
  { id: "im3", size: "standard", title: "Varanasi Private Ghat", tagline: "A ritual of dawn & dusk", price: "₹15,42,000", img: "/assets/offers/udaipur-hotel.jpg" },
  { id: "im4", size: "standard", title: "Bavarian Archives", tagline: "Alpine Slow Living", price: "₹10,75,000", img: "/assets/offers/dubai-hotel.jpg" },
  { id: "im5", size: "standard", title: "Kyoto Master Artisan", tagline: "7 days of silent craft", priceCrossed: "₹23,75,000", price: "₹18,33,000", img: "/assets/offers/dubai-flight.jpg" },
];

const MICE = [
  { icon: "https://cdn-icons-png.flaticon.com/512/906/906343.png", title: "Meetings", desc: "Seamless city-to-city arrangements, boardroom-ready venues, and smooth transfers for executives." },
  { icon: "https://cdn-icons-png.flaticon.com/512/2583/2583344.png", title: "Incentives", desc: "Reward teams with curated holiday packages at special corporate rates, boosting morale and retention." },
  { icon: "https://cdn-icons-png.flaticon.com/512/1705/1705312.png", title: "Conferences & Exhibitions", desc: "From flights and hotels to large-scale event coordination, Plumtrips ensures everything runs flawlessly." },
];

const JOURNEY_STEPS = [
  { num: "1", title: "Booking", desc: "Private consultation & custom itinerary.", bonus: "Welcome Kit" },
  { num: "2", title: "Preparation", desc: "Historical briefings & wardrobe curation.", bonus: "Concierge App" },
  { num: "3", title: "Arrival", desc: "VIP fast-track & private chauffeur.", bonus: "Lounge Access" },
  { num: "4", title: "Immersion", desc: "The keys to the estate are yours.", bonus: "Private Chef" },
];

function ChipBadge({ label, variant }: { label: string; variant: "primary" | "error" | "dark" }) {
  const cls = variant === "primary" ? "bg-[#d06549] text-white" : variant === "error" ? "bg-[#d06549] text-white" : "bg-[#1f2937] text-white";
  return <span className={`${cls} px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase`}>{label}</span>;
}

function OfferCard({ offer }: { offer: (typeof STATIC_OFFERS)[number] }) {
  return (
    <Link
      to="/go/concierge"
      className="group bg-white rounded-xl overflow-hidden flex flex-col"
      style={{ boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.08)", transition: "box-shadow 0.3s ease, transform 0.3s ease" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px) scale(1.01)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)"; }}
    >
      <div className="relative h-64 overflow-hidden">
        <img src={offer.img} alt={offer.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute top-4 left-4"><ChipBadge label={offer.label} variant={offer.labelVariant} /></div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="mb-1 text-[22px] leading-snug" style={{ fontFamily: "Poppins, sans-serif", color: "#121c2a" }}>{offer.title}</h3>
        <p className="text-sm text-[#57423c] mb-6 flex-grow">{offer.subtitle}</p>
        <div className="border-t border-[#e5e7eb] pt-4">
          <div className="flex justify-between items-end mb-4">
            <div>
              {offer.priceCrossed && <span className="text-xs text-[#8b716a] line-through block">Market: {offer.priceCrossed}</span>}
              <span className="text-[#d06549] font-bold text-lg">{offer.priceCrossed ? `Member: ${offer.price}` : offer.price}</span>
            </div>
            <span className="text-[10px] font-bold text-[#d06549] uppercase tracking-tight">{offer.perk}</span>
          </div>
          <button className="w-full bg-[#d06549] text-white py-3 rounded-full text-sm font-semibold tracking-wide hover:opacity-90 transition-opacity" style={{ fontFamily: "Poppins, sans-serif" }}>
            Secure Rate
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function OffersPage() {
  const [activeTab, setActiveTab] = useState<OfferType>("All");
  const [items, setItems] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [flashTimer] = useState("04:22:15");

  const load = useCallback(async () => {
    setLoading(true);
    try { const data = await getOffers(); setItems(data); }
    catch { console.error("Failed to load offers"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filteredOffers = activeTab === "All" ? STATIC_OFFERS : STATIC_OFFERS.filter((o) => o.type === activeTab);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');
        .serif-italic { font-family: 'Poppins', sans-serif; font-style: italic; }
        .glass-panel { background: rgba(255,255,255,0.7); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .soft-lift { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05), 0 10px 15px -3px rgba(0,0,0,0.08); transition: box-shadow 0.3s ease, transform 0.3s ease; }
        .soft-lift:hover { box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); transform: translateY(-2px) scale(1.01); }
      `}</style>

      <main className="min-h-screen overflow-x-hidden" style={{ backgroundColor: "#f8f9ff", color: "#121c2a", fontFamily: "Poppins, sans-serif" }}>

        {/* Flash Deal Banner */}
        <div className="py-3 px-6 text-center relative z-40" style={{ backgroundColor: "#d06549", color: "#ffffff" }}>
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 flex-wrap">
            <span style={{ fontSize: 18 }}>⏱</span>
            <p className="text-sm font-semibold tracking-wider uppercase" style={{ fontFamily: "Poppins, sans-serif" }}>
              Flash Deal: <span className="font-bold">25% Off</span> Kyoto Master Artisan — Ends in{" "}
              <span className="px-2 py-0.5 rounded" style={{ background: "rgba(255,255,255,0.2)" }}>{flashTimer}</span>
            </p>
            <Link to="/go/concierge" className="bg-white px-4 py-1 rounded-full text-xs font-bold hover:opacity-90 transition-opacity" style={{ color: "#d06549" }}>Claim Now</Link>
          </div>
        </div>

        {/* Hero */}
        <section className="relative flex items-center overflow-hidden" style={{ height: "min(88vh, 820px)", minHeight: 540 }}>
          <div className="absolute inset-0 z-0">
            <div className="h-full w-full bg-center bg-cover" style={{ backgroundImage: `url(${HERO_BG})` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent" />
          </div>
          <div className="relative z-10 px-6 md:px-12 max-w-7xl mx-auto w-full">
            <div className="max-w-2xl text-white">
              <span className="uppercase tracking-widest block mb-4 text-xs font-semibold" style={{ color: "#ffb59f", fontFamily: "Poppins, sans-serif" }}>Seasonal Edition</span>
              <h1 className="leading-tight mb-6" style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(3rem, 8vw, 5.5rem)", lineHeight: 1.05 }}>
                Exclusive Travel Offers<br />
                <span className="serif-italic" style={{ color: "#ffb59f" }}>Holidays, Flights & Hotels</span>
              </h1>
              <p className="mb-8 max-w-lg opacity-90 text-lg" style={{ fontFamily: "Poppins, sans-serif", lineHeight: 1.6 }}>
                Experience luxury for less. Plumtrips brings curated offers that combine best-in-class pricing with unmatched concierge service — perfect for leisure and corporate travellers alike.
              </p>
              <div className="flex gap-4 flex-wrap">
                <Link to="/go/concierge" className="px-8 py-4 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: "#d06549", color: "#ffffff", fontFamily: "Poppins, sans-serif" }}>Speak to a Concierge</Link>
                <button onClick={() => document.getElementById("journey-steps")?.scrollIntoView({ behavior: "smooth", block: "start" })} className="glass-panel px-8 py-4 rounded-full text-sm font-semibold flex items-center gap-2" style={{ color: "#121c2a", fontFamily: "Poppins, sans-serif" }}>Explore More ↓</button>
              </div>
            </div>
          </div>
        </section>

        {/* Journey Steps */}
        <section className="py-16 bg-white">
          <div className="px-6 md:px-12 max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="mb-3" style={{ fontFamily: "Poppins, sans-serif", fontSize: 32, fontWeight: 600, color: "#121c2a" }}>Your Journey to Legacy</h2>
              <p className="text-[#57423c] max-w-xl mx-auto">A seamless transition from the modern world to historical immersion.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative">
              <div className="absolute top-6 left-0 w-full h-px hidden md:block" style={{ backgroundColor: "rgba(222,192,183,0.4)" }} />
              {JOURNEY_STEPS.map((s) => (
                <div key={s.num} className="relative z-10 bg-white p-4 text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-white" style={{ backgroundColor: "#d06549" }}>{s.num}</div>
                  <h4 className="font-semibold mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>{s.title}</h4>
                  <p className="text-sm text-[#57423c]">{s.desc}</p>
                  <span className="mt-3 block text-xs font-bold uppercase" style={{ color: "#d06549", fontFamily: "Poppins, sans-serif" }}>Bonus: {s.bonus}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <div id="offers" className="px-6 md:px-12 max-w-7xl mx-auto pt-14 pb-2">
          <div className="text-center mb-8">
            <span className="uppercase tracking-widest text-xs font-semibold block mb-2" style={{ color: "#d06549", fontFamily: "Poppins, sans-serif" }}>Elite Access</span>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "#121c2a" }}>Member Exclusive Offers</h2>
            <p className="text-[#57423c] max-w-xl mx-auto mt-3">Preferential rates and unique privileges reserved exclusively for our travellers.</p>
          </div>
          <div id="journey-steps" className="flex justify-center gap-3 flex-wrap">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200"
                style={activeTab === tab
                  ? { backgroundColor: "#d06549", color: "#ffffff", fontFamily: "Poppins, sans-serif", boxShadow: "0 4px 12px rgba(162,57,23,0.3)" }
                  : { backgroundColor: "#ffffff", color: "#57423c", border: "1px solid #dec0b7", fontFamily: "Poppins, sans-serif" }
                }
              >{tab}</button>
            ))}
          </div>
        </div>

        {/* Offers Grid */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto py-10">
          {filteredOffers.length === 0
            ? <div className="text-center py-16 text-[#8b716a]">No offers available in this category right now.</div>
            : <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">{filteredOffers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div>
          }
        </section>

        {/* Immersions */}
        <section className="px-6 md:px-12 max-w-7xl mx-auto py-16">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="uppercase tracking-widest text-xs font-semibold block mb-2" style={{ color: "#d06549", fontFamily: "Poppins, sans-serif" }}>Once-in-a-Lifetime</span>
              <h2 style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "#121c2a" }}>The Current Immersions</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Large Card */}
            <div className="lg:col-span-2 group">
              <div className="relative overflow-hidden rounded-xl soft-lift" style={{ height: 560 }}>
                <img src={IMMERSIONS[0].img} alt={IMMERSIONS[0].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute top-6 left-6 flex gap-2 flex-wrap">
                  <span className="glass-panel px-4 py-1 rounded-full text-[10px] font-bold tracking-widest text-[#121c2a] uppercase">{IMMERSIONS[0].category}</span>
                  <span className="px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-white" style={{ backgroundColor: "#d06549" }}>{IMMERSIONS[0].badge}</span>
                </div>
                <div className="absolute bottom-10 left-10 right-10">
                  <div className="flex justify-between items-end gap-4">
                    <div className="max-w-md">
                      <h3 className="text-white mb-2" style={{ fontFamily: "Poppins, sans-serif", fontSize: 36, lineHeight: 1.2 }}>{IMMERSIONS[0].title}</h3>
                      <p className="mb-4 italic" style={{ color: "rgba(255,255,255,0.8)", fontSize: 16 }}>{IMMERSIONS[0].description}</p>
                      <div className="flex items-center gap-6 text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>
                        <span>Remaining: <strong style={{ color: "#ffb59f" }}>{IMMERSIONS[0].remaining}</strong></span>
                        <div>
                          <span className="text-xs block" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "line-through" }}>{IMMERSIONS[0].priceCrossed}</span>
                          <span className="font-semibold">{IMMERSIONS[0].price}</span>
                        </div>
                      </div>
                    </div>
                    <Link to="/go/concierge" className="shrink-0 px-8 py-3 rounded-full text-sm font-semibold bg-white transition-all hover:bg-[#d06549] hover:text-white" style={{ color: "#121c2a", fontFamily: "Poppins, sans-serif" }}>View Legacy</Link>
                  </div>
                </div>
              </div>
            </div>
            {/* Tall Card */}
            <div className="group" style={{ height: 560 }}>
              <div className="relative h-full overflow-hidden rounded-xl soft-lift flex flex-col bg-white">
                <div className="h-1/2 overflow-hidden">
                  <img src={IMMERSIONS[1].img} alt={IMMERSIONS[1].title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-7 flex flex-col justify-between flex-grow">
                  <div>
                    <span className="text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full inline-block mb-3" style={{ backgroundColor: "#d06549" }}>{IMMERSIONS[1].badge}</span>
                    <span className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: "#d06549", fontFamily: "Poppins, sans-serif" }}>{IMMERSIONS[1].category}</span>
                    <h3 className="mb-3" style={{ fontFamily: "Poppins, sans-serif", fontSize: 22, color: "#121c2a" }}>{IMMERSIONS[1].title}</h3>
                    <p className="text-sm text-[#57423c]">{IMMERSIONS[1].description}</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center pt-5 mb-4" style={{ borderTop: "1px solid #e5e7eb" }}>
                      <span className="text-xs text-[#8b716a]">{IMMERSIONS[1].dates}</span>
                      <span className="text-xs font-bold" style={{ color: "#d06549" }}>{IMMERSIONS[1].remaining}</span>
                    </div>
                    <Link to="/go/concierge" className="block w-full text-center py-3 rounded-full text-sm font-semibold transition-all border"
                      style={{ borderColor: "#d06549", color: "#d06549", fontFamily: "Poppins, sans-serif", transition: "background-color 0.2s ease, color 0.2s ease" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#d06549"; (e.currentTarget as HTMLElement).style.color = "#ffffff"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "#d06549"; }}
                    >Request Access</Link>
                  </div>
                </div>
              </div>
            </div>
            {/* Standard Cards */}
            {IMMERSIONS.slice(2).map((im) => (
              <div key={im.id} className="group">
                <Link to="/go/concierge" className="relative block overflow-hidden rounded-xl soft-lift" style={{ height: 420 }}>
                  <img src={im.img} alt={im.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-white mb-2" style={{ fontFamily: "Poppins, sans-serif", fontSize: 22 }}>{im.title}</h3>
                    <div className="flex justify-between items-center">
                      <span className="italic text-sm" style={{ color: "rgba(255,255,255,0.8)" }}>{im.tagline}</span>
                      <div className="text-right">
                        {im.priceCrossed && <span className="text-xs block" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "line-through" }}>{im.priceCrossed}</span>}
                        <span className="font-bold" style={{ color: "#ffb59f" }}>{im.price}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Corporate MICE */}
        <section className="py-16 px-6 md:px-12" style={{ backgroundColor: "#eff4ff" }}>
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <span className="uppercase tracking-widest text-xs font-semibold block mb-2" style={{ color: "#d06549", fontFamily: "Poppins, sans-serif" }}>Corporate Solutions</span>
              <h2 className="mb-4" style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 700, color: "#121c2a" }}>Why Plumtrips Works for Corporates</h2>
              <p className="text-[#57423c] max-w-2xl mx-auto text-lg">
                Beyond leisure, our offers are tailored for businesses planning <strong>Meetings, Incentives, Conferences, and Exhibitions (MICE)</strong>. Exclusive fares, group hotel discounts, and destination packages — saving costs while ensuring a premium experience.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {MICE.map((m) => (
                <div key={m.title} className="bg-white p-7 rounded-xl soft-lift">
                  <img src={m.icon} alt={m.title} className="w-10 h-10 mb-4 object-contain" />
                  <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "Poppins, sans-serif", color: "#27609d" }}>{m.title}</h3>
                  <p className="text-[#57423c] text-sm leading-relaxed">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-6 md:px-12 text-white text-center" style={{ backgroundColor: "#0f2a4a" }}>
          <div className="max-w-2xl mx-auto">
            <span className="text-5xl block mb-6">📜</span>
            <h2 className="mb-4" style={{ fontFamily: "Poppins, sans-serif", fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700 }}>Ready to Unlock Your Exclusive Offer?</h2>
            <p className="text-white/70 text-lg mb-10">Our Heritage & Legacy series is released in four seasonal windows. Each immersion is strictly limited to ensure absolute privacy and a premium experience.</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
              <input type="email" placeholder="Your Private Email" className="w-full md:w-80 px-6 py-4 rounded-full text-sm"
                style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff", outline: "none", fontFamily: "Poppins, sans-serif" }} />
              <Link to="/go/concierge" className="px-10 py-4 rounded-full text-sm font-semibold whitespace-nowrap hover:scale-105 transition-transform"
                style={{ backgroundColor: "#d06549", color: "#ffffff", fontFamily: "Poppins, sans-serif" }}>Speak to a Concierge</Link>
            </div>
            <p className="mt-6 text-xs italic" style={{ color: "rgba(255,255,255,0.4)" }}>Next window opening: Autumn Equinox 2024</p>
          </div>
        </section>

      </main>
    </>
  );
}