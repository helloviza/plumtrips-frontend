/* ===== Co-located images ===== */
const cover      = new URL("./cover-dubai.jpg", import.meta.url).href;
const imgSkyline = new URL("./dubai-skyline-suite.jpg", import.meta.url).href;
const imgDesert  = new URL("./dubai-desert-camp.jpg", import.meta.url).href;
const imgMarina  = new URL("./dubai-yacht-marina.jpg", import.meta.url).href;
const imgBrunch  = new URL("./dubai-sky-brunch.jpg", import.meta.url).href;
const imgOldTown = new URL("./dubai-old-town.jpg", import.meta.url).href;
const imgPalm    = new URL("./dubai-palm-beach.jpg", import.meta.url).href;

/* ===== Meta ===== */
export const meta = {
  slug: "travel-to-dubai-top-10-hotels-and-activities",
  title: "Travel To Dubai — Top 10 Hotels & Activities",
  excerpt: "Skyline suites, desert silence, and yacht afternoons — Dubai, done right.",
  tags: ["Dubai","City Luxe","Desert"],
  cover,
};

const H={heroTitle:"text-2xl md:text-4xl font-extrabold text-white drop-shadow",sectionH2:"text-2xl md:text-3xl font-extrabold text-[#00477f]"};
const Tip=({t}:{t:string})=><div className="mt-3 rounded-xl bg-[#d06549]/10 px-4 py-3 text-sm text-[#d06549] font-semibold">💡 PlumTip: {t}</div>;
const Shot=({src,alt}:{src:string;alt:string})=><img src={src} alt={alt} className="w-full rounded-2xl object-cover shadow-md" style={{aspectRatio:"16 / 9"}} loading="lazy"/>;
const Bullets=({items}:{items:string[]})=><ul className="mt-2 list-disc pl-5 text-slate-700">{items.map(i=><li key={i} className="mb-1">{i}</li>)}</ul>;
function Block({title,img,points}:{title:string;img:string;points:string[]}){return(<section className="mt-10"><h2 className={H.sectionH2}>{title}</h2><div className="mt-4"><Shot src={img} alt={title}/></div><div className="mt-4 rounded-xl bg-white border p-5 shadow-sm"><Bullets items={points}/></div></section>)}

export default function Post(){return(<article className="bg-gradient-to-b from-slate-50 to-white">
  <header className="relative"><div className="relative h-[280px] md:h-[380px]"><img src={cover} alt={meta.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/10"/><div className="absolute inset-x-0 bottom-0"><div className="mx-auto max-w-4xl px-4 pb-10"><h1 className={H.heroTitle}>{meta.title}</h1><p className="mt-3 text-white/90">From sky-high suites to silent dunes, here’s your sleek Dubai playbook.</p></div></div></div></header>
  <main className="mx-auto max-w-4xl px-4 py-10">
    <Tip t="Nov–Mar = prime weather. Book desert + yacht day ahead of weekends."/>
    <Block title="Skyline Suites" img={imgSkyline} points={["Floor-to-ceiling views","Clubs + restaurants in-lift","Pool decks over the city"]}/>
    <Block title="Desert Camps" img={imgDesert} points={["Dune drives + sundowners","Stargazing silence","Heritage camp dinners"]}/>
    <Block title="Yacht Hour" img={imgMarina} points={["Golden-hour cruise","Swim stop off the Palm","BYO playlist"]}/>
    <Block title="Sky Brunch" img={imgBrunch} points={["Panoramic dining","DJ sets + day parties","Reserve early for window tables"]}/>
    <Block title="Old Dubai" img={imgOldTown} points={["Souks + abras","Arabic coffee tastings","Traditional dining lanes"]}/>
    <Block title="Palm Beaches" img={imgPalm} points={["Beach clubs & daybeds","Calm lagoons","Sunset shots for the feed"]}/>
    <div className="mt-12 rounded-2xl border bg-white p-6 shadow-md"><h3 className="text-lg md:text-xl font-bold">Plan it with PlumTrips ✈️</h3><p className="mt-2 text-slate-700">We’ll balance luxe downtime with wow-moments — zero friction.</p><div className="mt-5"><a href="/go/concierge" className="inline-flex rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold hover:bg-[#c2513d]">Design My Dubai</a></div></div>
  </main>
</article>)}
