/* ===== Co-located images ===== */
const cover      = new URL("./cover-safari.jpg", import.meta.url).href;
const imgSeren   = new URL("./serengeti.jpg", import.meta.url).href;
const imgMara    = new URL("./maasai-mara.jpg", import.meta.url).href;
const imgOkav    = new URL("./okavango-delta.jpg", import.meta.url).href;
const imgKruger  = new URL("./kruger-private.jpg", import.meta.url).href;
const imgSabi    = new URL("./sabi-sands.jpg", import.meta.url).href;
const imgAtNight = new URL("./safari-sundowner.jpg", import.meta.url).href;

/* ===== Meta ===== */
export const meta = {
  slug: "the-best-safaris-to-remember-for-a-lifetime",
  title: "The Best Safaris — To Remember For A Lifetime",
  excerpt: "Dawn drives, sundowners, and stargazer lodges — lifetime safari ideas.",
  tags: ["Safari","Africa","Bucket List"],
  cover,
};

const H={heroTitle:"text-2xl md:text-4xl font-extrabold text-white drop-shadow",sectionH2:"text-2xl md:text-3xl font-extrabold text-[#00477f]"};
const Tip=({t}:{t:string})=><div className="mt-3 rounded-xl bg-[#d06549]/10 px-4 py-3 text-sm text-[#d06549] font-semibold">💡 PlumTip: {t}</div>;
const Shot=({src,alt}:{src:string;alt:string})=><img src={src} alt={alt} className="w-full rounded-2xl object-cover shadow-md" style={{aspectRatio:"16 / 9"}} loading="lazy"/>;
const Bullets=({items}:{items:string[]})=><ul className="mt-2 list-disc pl-5 text-slate-700">{items.map(i=><li key={i} className="mb-1">{i}</li>)}</ul>;
function Block({title,img,points}:{title:string;img:string;points:string[]}){return(<section className="mt-10"><h2 className={H.sectionH2}>{title}</h2><div className="mt-4"><Shot src={img} alt={title}/></div><div className="mt-4 rounded-xl bg-white border p-5 shadow-sm"><Bullets items={points}/></div></section>)}

export default function Post(){return(<article className="bg-gradient-to-b from-slate-50 to-white">
  <header className="relative"><div className="relative h-[280px] md:h-[380px]"><img src={cover} alt={meta.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/10"/><div className="absolute inset-x-0 bottom-0"><div className="mx-auto max-w-4xl px-4 pb-10"><h1 className={H.heroTitle}>{meta.title}</h1><p className="mt-3 text-white/90">Epic wildlife, quiet luxury — safari memories that last forever.</p></div></div></div></header>
  <main className="mx-auto max-w-4xl px-4 py-10">
    <Tip t="Green vs. dry season changes everything — ask us which fits your style."/>
    <Block title="Serengeti, Tanzania" img={imgSeren} points={["Migration drama","Endless plains","Balloon safaris"]}/>
    <Block title="Maasai Mara, Kenya" img={imgMara} points={["Big-cat territory","River crossings","Community conservancies"]}/>
    <Block title="Okavango Delta, Botswana" img={imgOkav} points={["Mokoro canoe rides","Water + land mix","High-end camps"]}/>
    <Block title="Kruger Private Reserves" img={imgKruger} points={["Off-road sightings","Fewer vehicles","Lux lodges"]}/>
    <Block title="Sabi Sands, South Africa" img={imgSabi} points={["Leopard central","Photographer heaven","Spa + wine cellars"]}/>
    <Block title="Sundowners & Stars" img={imgAtNight} points={["Golden hour drinks","Braai dinners","Night-sky stories"]}/>
    <div className="mt-12 rounded-2xl border bg-white p-6 shadow-md"><h3 className="text-lg md:text-xl font-bold">Plan it with PlumTrips ✈️</h3><p className="mt-2 text-slate-700">We’ll pick parks, camps, and routes for max wildlife + comfort.</p><div className="mt-5"><a href="/go/concierge" className="inline-flex rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold hover:bg-[#c2513d]">Design My Safari</a></div></div>
  </main>
</article>)}
