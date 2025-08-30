/* ===== Co-located images ===== */
const cover                = new URL("./cover-maldives-beaches.jpg", import.meta.url).href;
const imgOverwater         = new URL("./overwater-villas.jpg", import.meta.url).href;
const imgSandbank          = new URL("./sandbank-picnic.jpg", import.meta.url).href;
const imgHouseReef         = new URL("./house-reef-snorkel.jpg", import.meta.url).href;
const imgSpa               = new URL("./overwater-spa.jpg", import.meta.url).href;
const imgSunsetCruise      = new URL("./sunset-dolphin-cruise.jpg", import.meta.url).href;
const imgBeachVilla        = new URL("./beach-pool-villa.jpg", import.meta.url).href;

/* ===== Meta ===== */
export const meta = {
  slug: "the-most-beautiful-beaches-and-resorts-in-the-maldives-your-paradise-vacation",
  title: "The Most Beautiful Beaches & Resorts In The Maldives — Your Paradise Vacation",
  excerpt: "Iconic blues, powder sands, and overwater villas — Maldives perfected.",
  tags: ["Maldives", "Overwater", "Honeymoon"],
  cover,
};

const H={heroTitle:"text-2xl md:text-4xl font-extrabold text-white drop-shadow",sectionH2:"text-2xl md:text-3xl font-extrabold text-[#00477f]"};
const Tip=({t}:{t:string})=><div className="mt-3 rounded-xl bg-[#d06549]/10 px-4 py-3 text-sm text-[#d06549] font-semibold">💡 PlumTip: {t}</div>;
const Shot=({src,alt}:{src:string;alt:string})=><img src={src} alt={alt} className="w-full rounded-2xl object-cover shadow-md" style={{aspectRatio:"16 / 9"}} loading="lazy"/>;
const Bullets=({items}:{items:string[]})=><ul className="mt-2 list-disc pl-5 text-slate-700">{items.map(x=><li key={x} className="mb-1">{x}</li>)}</ul>;
function Block({title,img,points}:{title:string;img:string;points:string[]}){return(<section className="mt-10"><h2 className={H.sectionH2}>{title}</h2><div className="mt-4"><Shot src={img} alt={title}/></div><div className="mt-4 rounded-xl bg-white border p-5 shadow-sm"><Bullets items={points}/></div></section>)}

export default function Post(){
  return(<article className="bg-gradient-to-b from-slate-50 to-white">
    <header className="relative"><div className="relative h-[280px] md:h-[380px]"><img src={cover} alt={meta.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/10"/><div className="absolute inset-x-0 bottom-0"><div className="mx-auto max-w-4xl px-4 pb-10"><h1 className={H.heroTitle}>{meta.title}</h1><p className="mt-3 text-white/90">Overwater dawns, glassy lagoons, and beach villas made for barefoot luxury.</p></div></div></div></header>
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Tip t="Split stay: 2 nights beach villa + 2 nights overwater = two vibes, one trip."/>
      <Block title="Overwater Villa Heaven" img={imgOverwater} points={["Steps into the lagoon","Sunrise coffee on the deck","Stargazing with ocean hush"]}/>
      <Block title="Iconic Sandbank Moments" img={imgSandbank} points={["Private picnics on powder-white sand","Drone-free frames from shore","Champagne at golden hour"]}/>
      <Block title="House-Reef Snorkel" img={imgHouseReef} points={["Coral gardens in HD","Reef fish + turtles meters away","Guided night snorkel glow"]}/>
      <Block title="Overwater Spa Rituals" img={imgSpa} points={["Glass-floor treatment rooms","Aromatherapy with sea breeze","Sound bath at sunset"]}/>
      <Block title="Dolphin Sunset Cruise" img={imgSunsetCruise} points={["Pastel skies + playful pods","Photo ops without chasing","Toast to the moment"]}/>
      <Block title="Beach Pool Villas" img={imgBeachVilla} points={["Soft sand at your doorstep","Private pool & palms","Perfect for longer stays"]}/>
      <div className="mt-12 rounded-2xl border bg-white p-6 shadow-md"><h3 className="text-lg md:text-xl font-bold">Plan it with PlumTrips ✈️</h3><p className="mt-2 text-slate-700">We’ll match the right island, villa type, and season to your vibe.</p><div className="mt-5"><a href="/go/concierge" className="inline-flex rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold hover:bg-[#c2513d]">Design My Maldives</a></div></div>
    </main>
  </article>);
}
