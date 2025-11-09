/* ===== Co-located images ===== */
const cover       = new URL("./cover-autumn.jpg", import.meta.url).href;
const imgKyoto    = new URL("./kyoto-fall.jpg", import.meta.url).href;
const imgBavaria  = new URL("./bavaria-lakes.jpg", import.meta.url).href;
const imgTuscany  = new URL("./tuscany-vineyards.jpg", import.meta.url).href;
const imgVermont  = new URL("./vermont-foliage.jpg", import.meta.url).href;
const imgIstanbul = new URL("./istanbul-fall.jpg", import.meta.url).href;
const imgMadeira  = new URL("./madeira-levadas.jpg", import.meta.url).href;

/* ===== Meta ===== */
export const meta = {
  slug: "top-10-vacation-spots-for-autumn-holidays-discover-the-best-destinations-on-plumtrips",
  title: "Top 10 Vacation Spots For Autumn Holidays — Discover The Best Destinations On PlumTrips",
  excerpt: "Fall color, warm seas, truffle nights — the sweet spot of the year.",
  tags: ["Autumn","Seasonal","Short Breaks"],
  cover,
};

const H={heroTitle:"text-2xl md:text-4xl font-extrabold text-white drop-shadow",sectionH2:"text-2xl md:text-3xl font-extrabold text-[#00477f]"};
const Tip=({t}:{t:string})=><div className="mt-3 rounded-xl bg-[#d06549]/10 px-4 py-3 text-sm text-[#d06549] font-semibold">💡 PlumTip: {t}</div>;
const Shot=({src,alt}:{src:string;alt:string})=><img src={src} alt={alt} className="w-full rounded-2xl object-cover shadow-md" style={{aspectRatio:"16 / 9"}} loading="lazy"/>;
const Bullets=({items}:{items:string[]})=><ul className="mt-2 list-disc pl-5 text-slate-700">{items.map(i=><li key={i} className="mb-1">{i}</li>)}</ul>;
function Block({title,img,points}:{title:string;img:string;points:string[]}){return(<section className="mt-10"><h2 className={H.sectionH2}>{title}</h2><div className="mt-4"><Shot src={img} alt={title}/></div><div className="mt-4 rounded-xl bg-white border p-5 shadow-sm"><Bullets items={points}/></div></section>)}

export default function Post(){return(<article className="bg-gradient-to-b from-slate-50 to-white">
  <header className="relative"><div className="relative h-[280px] md:h-[380px]"><img src={cover} alt={meta.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/10"/><div className="absolute inset-x-0 bottom-0"><div className="mx-auto max-w-4xl px-4 pb-10"><h1 className={H.heroTitle}>{meta.title}</h1><p className="mt-3 text-white/90">Soft light, crisp air, harvest tables, warm seas in the south — autumn wins.</p></div></div></div></header>
  <main className="mx-auto max-w-4xl px-4 py-10">
    <Tip t="Fly midweek, book boutique — autumn is when luxury gets friendlier."/>
    <Block title="Kyoto, Japan" img={imgKyoto} points={["Maple tunnels + temples","Tea houses in Gion","Arashiyama at dawn"]}/>
    <Block title="Bavarian Lakes, Germany" img={imgBavaria} points={["Mirror mornings on Eibsee","Alm huts + hearty plates","Cable-car viewpoints"]}/>
    <Block title="Tuscany, Italy" img={imgTuscany} points={["Harvest time in vineyards","Truffle menus","Hill towns without crowds"]}/>
    <Block title="Vermont, USA" img={imgVermont} points={["Foliage road trips","Cider mills + barns","Porch sunsets"]}/>
    <Block title="İstanbul, Türkiye" img={imgIstanbul} points={["Rooftop sunsets in cool air","Markets without heat","Bosphorus ferries"]}/>
    <Block title="Madeira, Portugal" img={imgMadeira} points={["Levadas in golden light","Clifftop pools","Whale season overlap"]}/>
    <div className="mt-12 rounded-2xl border bg-white p-6 shadow-md"><h3 className="text-lg md:text-xl font-bold">Plan it with PlumTrips ✈️</h3><p className="mt-2 text-slate-700">We’ll time foliage, harvests, and sea temps to your dates.</p><div className="mt-5"><a href="/go/concierge" className="inline-flex rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold hover:bg-[#c2513d]">Design My Autumn</a></div></div>
  </main>
</article>)}
