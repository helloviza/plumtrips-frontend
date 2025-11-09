/* ===== Co-located images ===== */
const cover      = new URL("./cover-bali.jpg", import.meta.url).href;
const imgUbud    = new URL("./ubud-rice-terrace-villa.jpg", import.meta.url).href;
const imgUluwatu = new URL("./uluwatu-cliffs.jpg", import.meta.url).href;
const imgNusa    = new URL("./nusa-penida.jpg", import.meta.url).href;
const imgCanggu  = new URL("./canggu-cafes.jpg", import.meta.url).href;
const imgTemples = new URL("./bali-temples.jpg", import.meta.url).href;
const imgSpa     = new URL("./bali-spa-ritual.jpg", import.meta.url).href;

/* ===== Meta ===== */
export const meta = {
  slug: "traveling-to-bali-top-10-hotels-and-activities",
  title: "Traveling To Bali — Top 10 Hotels & Activities",
  excerpt: "Jungle pools, temple dawns, surf sunsets — Bali is a mood you can live in.",
  tags: ["Bali","Wellness","Nature"],
  cover,
};

const H={heroTitle:"text-2xl md:text-4xl font-extrabold text-white drop-shadow",sectionH2:"text-2xl md:text-3xl font-extrabold text-[#00477f]"};
const Tip=({t}:{t:string})=><div className="mt-3 rounded-xl bg-[#d06549]/10 px-4 py-3 text-sm text-[#d06549] font-semibold">💡 PlumTip: {t}</div>;
const Shot=({src,alt}:{src:string;alt:string})=><img src={src} alt={alt} className="w-full rounded-2xl object-cover shadow-md" style={{aspectRatio:"16 / 9"}} loading="lazy"/>;
const Bullets=({items}:{items:string[]})=><ul className="mt-2 list-disc pl-5 text-slate-700">{items.map(i=><li key={i} className="mb-1">{i}</li>)}</ul>;
function Block({title,img,points}:{title:string;img:string;points:string[]}){return(<section className="mt-10"><h2 className={H.sectionH2}>{title}</h2><div className="mt-4"><Shot src={img} alt={title}/></div><div className="mt-4 rounded-xl bg-white border p-5 shadow-sm"><Bullets items={points}/></div></section>)}

export default function Post(){return(<article className="bg-gradient-to-b from-slate-50 to-white">
  <header className="relative"><div className="relative h-[280px] md:h-[380px]"><img src={cover} alt={meta.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/10"/><div className="absolute inset-x-0 bottom-0"><div className="mx-auto max-w-4xl px-4 pb-10"><h1 className={H.heroTitle}>{meta.title}</h1><p className="mt-3 text-white/90">Wellness rituals, cliff sunsets, island hops — Bali’s greatest hits.</p></div></div></div></header>
  <main className="mx-auto max-w-4xl px-4 py-10">
    <Tip t="Pair Ubud (jungle calm) with Uluwatu (ocean drama) for balance."/>
    <Block title="Ubud Villas" img={imgUbud} points={["Pool villas over rice terraces","Sound bath + flower bath combo","Chef’s table by the paddies"]}/>
    <Block title="Uluwatu Cliffs" img={imgUluwatu} points={["Sunset at cliff temples","Hidden beaches by stairs","Ocean-view brunches"]}/>
    <Block title="Nusa Penida Day" img={imgNusa} points={["Kelingking views","Snorkel with manta rays","Blue bays for swims"]}/>
    <Block title="Canggu Cafés" img={imgCanggu} points={["Third-wave coffee","Brunch bowls","Sunset beach bars"]}/>
    <Block title="Temple Trail" img={imgTemples} points={["Sunrise rituals","Shrines in the jungle","Respectful dress, sarongs"]}/>
    <Block title="Spa Rituals" img={imgSpa} points={["Balinese massage","Herbal steam","Evening calm reset"]}/>
    <div className="mt-12 rounded-2xl border bg-white p-6 shadow-md"><h3 className="text-lg md:text-xl font-bold">Plan it with PlumTrips ✈️</h3><p className="mt-2 text-slate-700">We’ll sync transfers, spa slots, and island hops — smooth & luxe.</p><div className="mt-5"><a href="/go/concierge" className="inline-flex rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold hover:bg-[#c2513d]">Design My Bali</a></div></div>
  </main>
</article>)}
