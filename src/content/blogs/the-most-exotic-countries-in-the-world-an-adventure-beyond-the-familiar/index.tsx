/* ===== Co-located images ===== */
const cover      = new URL("./cover-exotic.jpg", import.meta.url).href;
const imgMorocco = new URL("./morocco-souk.jpg", import.meta.url).href;
const imgPeru    = new URL("./peru-rainbow-mountain.jpg", import.meta.url).href;
const imgBhutan  = new URL("./bhutan-tigers-nest.jpg", import.meta.url).href;
const imgOman    = new URL("./oman-wadis.jpg", import.meta.url).href;
const imgVietnam = new URL("./vietnam-ha-long.jpg", import.meta.url).href;
const imgJordan  = new URL("./jordan-petra.jpg", import.meta.url).href;

/* ===== Meta ===== */
export const meta = {
  slug: "the-most-exotic-countries-in-the-world-an-adventure-beyond-the-familiar",
  title: "The Most Exotic Countries In The World — An Adventure Beyond The Familiar",
  excerpt: "Vivid markets, jungle hideaways, and coastlines you’ve only seen in dreams.",
  tags: ["Exotic","Culture","Adventure"],
  cover,
};

const H={heroTitle:"text-2xl md:text-4xl font-extrabold text-white drop-shadow",sectionH2:"text-2xl md:text-3xl font-extrabold text-[#00477f]"};
const Tip=({t}:{t:string})=><div className="mt-3 rounded-xl bg-[#d06549]/10 px-4 py-3 text-sm text-[#d06549] font-semibold">💡 PlumTip: {t}</div>;
const Shot=({src,alt}:{src:string;alt:string})=><img src={src} alt={alt} className="w-full rounded-2xl object-cover shadow-md" style={{aspectRatio:"16 / 9"}} loading="lazy"/>;
const Bullets=({items}:{items:string[]})=><ul className="mt-2 list-disc pl-5 text-slate-700">{items.map(i=><li key={i} className="mb-1">{i}</li>)}</ul>;
function Block({title,img,points}:{title:string;img:string;points:string[]}){return(<section className="mt-10"><h2 className={H.sectionH2}>{title}</h2><div className="mt-4"><Shot src={img} alt={title}/></div><div className="mt-4 rounded-xl bg-white border p-5 shadow-sm"><Bullets items={points}/></div></section>)}

export default function Post(){return(<article className="bg-gradient-to-b from-slate-50 to-white">
  <header className="relative"><div className="relative h-[280px] md:h-[380px]"><img src={cover} alt={meta.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/10"/><div className="absolute inset-x-0 bottom-0"><div className="mx-auto max-w-4xl px-4 pb-10"><h1 className={H.heroTitle}>{meta.title}</h1><p className="mt-3 text-white/90">Color, spice, altitude, and sea — journeys that feel truly elsewhere.</p></div></div></div></header>
  <main className="mx-auto max-w-4xl px-4 py-10">
    <Tip t="Travel slower: 2–3 bases per country beats fast hopping for depth + joy."/>
    <Block title="Morocco" img={imgMorocco} points={["Médinas & riads with courtyards","Sahara overnight + dunes","Tagines + rooftop sunsets"]}/>
    <Block title="Peru" img={imgPeru} points={["Andean peaks + Rainbow Mountain","Sacred Valley trains","Amazon lodge add-on"]}/>
    <Block title="Bhutan" img={imgBhutan} points={["Tiger’s Nest hike","Dzongs & prayer flags","High-altitude calm"]}/>
    <Block title="Oman" img={imgOman} points={["Wadi swims + desert camps","Clifftop drives","Muscat old town + incense"]}/>
    <Block title="Vietnam" img={imgVietnam} points={["Ha Long karsts","Lantern-lit Hoi An","Street food that slaps"]}/>
    <Block title="Jordan" img={imgJordan} points={["Petra by candlelight","Wadi Rum jeep + stars","Dead Sea float session"]}/>
    <div className="mt-12 rounded-2xl border bg-white p-6 shadow-md"><h3 className="text-lg md:text-xl font-bold">Plan it with PlumTrips ✈️</h3><p className="mt-2 text-slate-700">We’ll sync seasons, altitude, and visas — so you just live the moments.</p><div className="mt-5"><a href="/go/concierge" className="inline-flex rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold hover:bg-[#c2513d]">Design My Adventure</a></div></div>
  </main>
</article>)}
