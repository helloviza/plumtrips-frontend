/* ===== Co-located images ===== */
const cover     = new URL("./cover-germany-wellness.jpg", import.meta.url).href;
const imgBaden  = new URL("./baden-baden-spa.jpg", import.meta.url).href;
const imgBavaria= new URL("./bavaria-lakes-sauna.jpg", import.meta.url).href;
const imgSylt   = new URL("./sylt-thalasso.jpg", import.meta.url).href;
const imgBlack  = new URL("./black-forest-hotel.jpg", import.meta.url).href;
const imgHarz   = new URL("./harz-mountains.jpg", import.meta.url).href;
const imgSauna  = new URL("./sauna-ritual.jpg", import.meta.url).href;

/* ===== Meta ===== */
export const meta = {
  slug: "pure-relaxation-the-best-wellness-destinations-in-germany-for-a-relaxing-weekend",
  title: "Pure Relaxation — The Best Wellness Destinations In Germany For A Relaxing Weekend",
  excerpt: "Thermal baths, forest saunas, and design hotels — reset mode: ON.",
  tags: ["Germany","Wellness","Weekend"],
  cover,
};

const H={heroTitle:"text-2xl md:text-4xl font-extrabold text-white drop-shadow",sectionH2:"text-2xl md:text-3xl font-extrabold text-[#00477f]"};
const Tip=({t}:{t:string})=><div className="mt-3 rounded-xl bg-[#d06549]/10 px-4 py-3 text-sm text-[#d06549] font-semibold">💡 PlumTip: {t}</div>;
const Shot=({src,alt}:{src:string;alt:string})=><img src={src} alt={alt} className="w-full rounded-2xl object-cover shadow-md" style={{aspectRatio:"16 / 9"}} loading="lazy"/>;
const Bullets=({items}:{items:string[]})=><ul className="mt-2 list-disc pl-5 text-slate-700">{items.map(i=><li key={i} className="mb-1">{i}</li>)}</ul>;
function Block({title,img,points}:{title:string;img:string;points:string[]}){return(<section className="mt-10"><h2 className={H.sectionH2}>{title}</h2><div className="mt-4"><Shot src={img} alt={title}/></div><div className="mt-4 rounded-xl bg-white border p-5 shadow-sm"><Bullets items={points}/></div></section>)}

export default function Post(){return(<article className="bg-gradient-to-b from-slate-50 to-white">
  <header className="relative"><div className="relative h-[280px] md:h-[380px]"><img src={cover} alt={meta.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/10"/><div className="absolute inset-x-0 bottom-0"><div className="mx-auto max-w-4xl px-4 pb-10"><h1 className={H.heroTitle}>{meta.title}</h1><p className="mt-3 text-white/90">Thermal warmth, forest air, slow mornings — Germany’s wellness core.</p></div></div></div></header>
  <main className="mx-auto max-w-4xl px-4 py-10">
    <Tip t="Check sauna etiquette; many areas are textile-free — totally normal in DE."/>
    <Block title="Baden-Baden" img={imgBaden} points={["Historic thermal baths","Modern day spas","Elegant promenades"]}/>
    <Block title="Bavarian Lakes" img={imgBavaria} points={["Sauna with lake plunges","Mountain-view pools","Herbal steam rituals"]}/>
    <Block title="Sylt Thalasso" img={imgSylt} points={["North Sea air therapy","Seaweed treatments","Dune walks"]}/>
    <Block title="Black Forest" img={imgBlack} points={["Design hotels + trails","Cake & spa afternoons","Tranquil villages"]}/>
    <Block title="Harz Mountains" img={imgHarz} points={["Timber towns","Thermal + forest mix","Calm rail routes"]}/>
    <Block title="Sauna Rituals" img={imgSauna} points={["Aufguss ceremonies","Aroma infusions","Deep recovery"]}/>
    <div className="mt-12 rounded-2xl border bg-white p-6 shadow-md"><h3 className="text-lg md:text-xl font-bold">Plan it with PlumTrips ✈️</h3><p className="mt-2 text-slate-700">We’ll align spa slots, sauna circuits, and slow-food tables.</p><div className="mt-5"><a href="/go/concierge" className="inline-flex rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold hover:bg-[#c2513d]">Design My Wellness</a></div></div>
  </main>
</article>)}
