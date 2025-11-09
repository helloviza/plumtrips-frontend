/* ===== Co-located images ===== */
const cover           = new URL("./cover-world-beaches.jpg", import.meta.url).href;
const imgGraceBay     = new URL("./grace-bay-turks.jpg", import.meta.url).href;
const imgNavagio      = new URL("./navagio-zakynthos.jpg", import.meta.url).href;
const imgWhitehaven   = new URL("./whitehaven-whitsundays.jpg", import.meta.url).href;
const imgAnseSource   = new URL("./anse-source-argent.jpg", import.meta.url).href;
const imgSevenMile    = new URL("./seven-mile-negril.jpg", import.meta.url).href;
const imgPinkSand     = new URL("./harbour-island-pink-sand.jpg", import.meta.url).href;

/* ===== Meta ===== */
export const meta = {
  slug: "the-most-beautiful-beaches-in-the-world-your-dream-vacation-with-plumtrips",
  title: "The Most Beautiful Beaches In The World — Your Dream Vacation With PlumTrips",
  excerpt: "From Caribbean shallows to Greek coves — the world’s prettiest sands, curated.",
  tags: ["Beaches","Bucket List","Islands"],
  cover,
};

const H={heroTitle:"text-2xl md:text-4xl font-extrabold text-white drop-shadow",sectionH2:"text-2xl md:text-3xl font-extrabold text-[#00477f]"};
const Tip=({t}:{t:string})=><div className="mt-3 rounded-xl bg-[#d06549]/10 px-4 py-3 text-sm text-[#d06549] font-semibold">💡 PlumTip: {t}</div>;
const Shot=({src,alt}:{src:string;alt:string})=><img src={src} alt={alt} className="w-full rounded-2xl object-cover shadow-md" style={{aspectRatio:"16 / 9"}} loading="lazy"/>;
const Bullets=({items}:{items:string[]})=><ul className="mt-2 list-disc pl-5 text-slate-700">{items.map(i=><li key={i} className="mb-1">{i}</li>)}</ul>;
function Block({title,img,points}:{title:string;img:string;points:string[]}){return(<section className="mt-10"><h2 className={H.sectionH2}>{title}</h2><div className="mt-4"><Shot src={img} alt={title}/></div><div className="mt-4 rounded-xl bg-white border p-5 shadow-sm"><Bullets items={points}/></div></section>)}

export default function Post(){return(<article className="bg-gradient-to-b from-slate-50 to-white">
  <header className="relative"><div className="relative h-[280px] md:h-[380px]"><img src={cover} alt={meta.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/10"/><div className="absolute inset-x-0 bottom-0"><div className="mx-auto max-w-4xl px-4 pb-10"><h1 className={H.heroTitle}>{meta.title}</h1><p className="mt-3 text-white/90">Powder sand, crazy blues, and coves that break the feed.</p></div></div></div></header>
  <main className="mx-auto max-w-4xl px-4 py-10">
    <Tip t="Midweek flights + shoulder season = empty beaches & better prices."/>
    <Block title="Grace Bay, Turks & Caicos" img={imgGraceBay} points={["Soft shallows for days","Sail to uninhabited cays","Sunset walks = chef’s kiss"]}/>
    <Block title="Navagio, Zakynthos" img={imgNavagio} points={["Cliff-framed azure","Boat-only access","Blue caves nearby"]}/>
    <Block title="Whitehaven, Whitsundays" img={imgWhitehaven} points={["Silica sand swirls","Hill Inlet lookout","Sail the archipelago"]}/>
    <Block title="Anse Source d’Argent, Seychelles" img={imgAnseSource} points={["Granite boulders + glass water","Cycle between beaches","Perfect for golden hour"]}/>
    <Block title="Seven Mile, Negril" img={imgSevenMile} points={["Laid-back reggae vibe","West End cliffs + jumps","Sunsets that linger"]}/>
    <Block title="Harbour Island Pink Sand" img={imgPinkSand} points={["Dreamy blush tones","Morning is quietest","Golf carts + chic cafes"]}/>
    <div className="mt-12 rounded-2xl border bg-white p-6 shadow-md"><h3 className="text-lg md:text-xl font-bold">Plan it with PlumTrips ✈️</h3><p className="mt-2 text-slate-700">Tell us your beach style — we’ll match stays and boat days.</p><div className="mt-5"><a href="/go/concierge" className="inline-flex rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold hover:bg-[#c2513d]">Design My Beach Trip</a></div></div>
  </main>
</article>)}
