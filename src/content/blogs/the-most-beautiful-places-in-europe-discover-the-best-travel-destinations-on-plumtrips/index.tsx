/* ===== Co-located images ===== */
const cover       = new URL("./cover-europe-places.jpg", import.meta.url).href;
const imgPositano = new URL("./positano-amalfi.jpg", import.meta.url).href;
const imgHallstatt= new URL("./hallstatt-austria.jpg", import.meta.url).href;
const imgSantorini= new URL("./santorini-greece.jpg", import.meta.url).href;
const imgInterlaken= new URL("./interlaken-switzerland.jpg", import.meta.url).href;
const imgPrague   = new URL("./prague-charles-bridge.jpg", import.meta.url).href;
const imgAzores   = new URL("./azores-crater-lake.jpg", import.meta.url).href;

/* ===== Meta ===== */
export const meta = {
  slug: "the-most-beautiful-places-in-europe-discover-the-best-travel-destinations-on-plumtrips",
  title: "The Most Beautiful Places In Europe — Discover The Best Travel Destinations On PlumTrips",
  excerpt: "Clifftop villages, alpine mirrors, storybook streets — Europe’s best, distilled.",
  tags: ["Europe","City+Nature","Inspo"],
  cover,
};

const H={heroTitle:"text-2xl md:text-4xl font-extrabold text-white drop-shadow",sectionH2:"text-2xl md:text-3xl font-extrabold text-[#00477f]"};
const Tip=({t}:{t:string})=><div className="mt-3 rounded-xl bg-[#d06549]/10 px-4 py-3 text-sm text-[#d06549] font-semibold">💡 PlumTip: {t}</div>;
const Shot=({src,alt}:{src:string;alt:string})=><img src={src} alt={alt} className="w-full rounded-2xl object-cover shadow-md" style={{aspectRatio:"16 / 9"}} loading="lazy"/>;
const Bullets=({items}:{items:string[]})=><ul className="mt-2 list-disc pl-5 text-slate-700">{items.map(i=><li key={i} className="mb-1">{i}</li>)}</ul>;
function Block({title,img,points}:{title:string;img:string;points:string[]}){return(<section className="mt-10"><h2 className={H.sectionH2}>{title}</h2><div className="mt-4"><Shot src={img} alt={title}/></div><div className="mt-4 rounded-xl bg-white border p-5 shadow-sm"><Bullets items={points}/></div></section>)}

export default function Post(){return(<article className="bg-gradient-to-b from-slate-50 to-white">
  <header className="relative"><div className="relative h-[280px] md:h-[380px]"><img src={cover} alt={meta.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/10"/><div className="absolute inset-x-0 bottom-0"><div className="mx-auto max-w-4xl px-4 pb-10"><h1 className={H.heroTitle}>{meta.title}</h1><p className="mt-3 text-white/90">From Amalfi terraces to alpine stillness and volcanic lakes — Europe, perfected.</p></div></div></div></header>
  <main className="mx-auto max-w-4xl px-4 py-10">
    <Tip t="Trains + shoulder season = fewer crowds, better light, better rates."/>
    <Block title="Positano, Amalfi Coast" img={imgPositano} points={["Cliff hotels with wow views","Sunset aperitivo terraces","Private boat to Capri"]}/>
    <Block title="Hallstatt, Austria" img={imgHallstatt} points={["Mirror-lake mornings","Pastel houses + mountains","Best at dawn before buses"]}/>
    <Block title="Santorini, Greece" img={imgSantorini} points={["Caldera sunsets","Cave suites + plunge pools","Catamaran around the island"]}/>
    <Block title="Interlaken, Switzerland" img={imgInterlaken} points={["Lakes & peaks combo","Paragliding over emerald water","Train to Jungfraujoch"]}/>
    <Block title="Prague, Czechia" img={imgPrague} points={["Sunrise on Charles Bridge","Old Town lanes + cafés","Castle walks at dusk"]}/>
    <Block title="Azores, Portugal" img={imgAzores} points={["Crater-lake panoramas","Thermal pools in nature","Whale-watching season"]}/>
    <div className="mt-12 rounded-2xl border bg-white p-6 shadow-md"><h3 className="text-lg md:text-xl font-bold">Plan it with PlumTrips ✈️</h3><p className="mt-2 text-slate-700">We’ll tie routes, trains, and view rooms into one seamless itinerary.</p><div className="mt-5"><a href="/go/concierge" className="inline-flex rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold hover:bg-[#c2513d]">Design My Europe</a></div></div>
  </main>
</article>)}
