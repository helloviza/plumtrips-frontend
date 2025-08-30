/* ===== Co-located images ===== */
const cover       = new URL("./cover-nature-food.jpg", import.meta.url).href;
const imgForest   = new URL("./forest-lodge.jpg", import.meta.url).href;
const imgChef     = new URL("./chef-garden.jpg", import.meta.url).href;
const imgTrail    = new URL("./quiet-trail.jpg", import.meta.url).href;
const imgPicnic   = new URL("./forest-picnic.jpg", import.meta.url).href;
const imgWine     = new URL("./vineyard-tasting.jpg", import.meta.url).href;
const imgLake     = new URL("./lakeside-sunset.jpg", import.meta.url).href;

/* ===== Meta ===== */
export const meta = {
  slug: "vacation-in-nature-experience-wildlife-and-culinary-delights",
  title: "Vacation In Nature — Experience Wildlife & Culinary Delights",
  excerpt: "Forest lodges, chef gardens, and quiet trails — nature’s luxury edit.",
  tags: ["Nature","Food","Slow Travel"],
  cover,
};

const H={heroTitle:"text-2xl md:text-4xl font-extrabold text-white drop-shadow",sectionH2:"text-2xl md:text-3xl font-extrabold text-[#00477f]"};
const Tip=({t}:{t:string})=><div className="mt-3 rounded-xl bg-[#d06549]/10 px-4 py-3 text-sm text-[#d06549] font-semibold">💡 PlumTip: {t}</div>;
const Shot=({src,alt}:{src:string;alt:string})=><img src={src} alt={alt} className="w-full rounded-2xl object-cover shadow-md" style={{aspectRatio:"16 / 9"}} loading="lazy"/>;
const Bullets=({items}:{items:string[]})=><ul className="mt-2 list-disc pl-5 text-slate-700">{items.map(i=><li key={i} className="mb-1">{i}</li>)}</ul>;
function Block({title,img,points}:{title:string;img:string;points:string[]}){return(<section className="mt-10"><h2 className={H.sectionH2}>{title}</h2><div className="mt-4"><Shot src={img} alt={title}/></div><div className="mt-4 rounded-xl bg-white border p-5 shadow-sm"><Bullets items={points}/></div></section>)}

export default function Post(){return(<article className="bg-gradient-to-b from-slate-50 to-white">
  <header className="relative"><div className="relative h-[280px] md:h-[380px]"><img src={cover} alt={meta.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/10"/><div className="absolute inset-x-0 bottom-0"><div className="mx-auto max-w-4xl px-4 pb-10"><h1 className={H.heroTitle}>{meta.title}</h1><p className="mt-3 text-white/90">Eat from the land, wander slow, sleep better — simple luxury.</p></div></div></div></header>
  <main className="mx-auto max-w-4xl px-4 py-10">
    <Tip t="Look for stays with on-site gardens, local sourcing, and nature guides."/>
    <Block title="Forest Lodges" img={imgForest} points={["Cabins with wood-fired saunas","Outdoor tubs under trees","Birdsong wake-ups"]}/>
    <Block title="Chef Gardens" img={imgChef} points={["Farm-to-fork tasting menus","Workshops: pick, cook, taste","Local cheeses, oils, wines"]}/>
    <Block title="Quiet Trails" img={imgTrail} points={["Golden-hour walks","Wildflower pockets","No-signal, yes-silence"]}/>
    <Block title="Lakeside Picnics" img={imgPicnic} points={["Blankets + baskets","Artisanal bites","No rush agenda"]}/>
    <Block title="Vineyard Tastings" img={imgWine} points={["Small-producer stories","Cellar tours","Sunset pours"]}/>
    <Block title="Evening Calm" img={imgLake} points={["Candlelit decks","Soft water mirrors","Early night, deep rest"]}/>
    <div className="mt-12 rounded-2xl border bg-white p-6 shadow-md"><h3 className="text-lg md:text-xl font-bold">Plan it with PlumTrips ✈️</h3><p className="mt-2 text-slate-700">We’ll select stays where cuisine and biosphere truly connect.</p><div className="mt-5"><a href="/go/concierge" className="inline-flex rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold hover:bg-[#c2513d]">Design My Nature Trip</a></div></div>
  </main>
</article>)}
