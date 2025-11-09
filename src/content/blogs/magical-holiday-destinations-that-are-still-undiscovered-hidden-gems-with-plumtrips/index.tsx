/* ===== Co-located images ===== */
const cover       = new URL("./cover-undiscovered.jpg", import.meta.url).href;
const imgAlbania  = new URL("./albania-riviera.jpg", import.meta.url).href;
const imgAcores   = new URL("./azores-hidden.jpg", import.meta.url).href;
const imgGeorgia  = new URL("./georgia-caucasus.jpg", import.meta.url).href;
const imgPantelleria = new URL("./pantelleria-italy.jpg", import.meta.url).href;
const imgSaoTome  = new URL("./sao-tome-principe.jpg", import.meta.url).href;
const imgOman     = new URL("./oman-fjords-musandam.jpg", import.meta.url).href;

/* ===== Meta ===== */
export const meta = {
  slug: "magical-holiday-destinations-that-are-still-undiscovered-hidden-gems-with-plumtrips",
  title: "Magical Holiday Destinations That Are Still Undiscovered — Hidden Gems With PlumTrips",
  excerpt: "Under-the-radar shores and heritage towns — go now, before everyone else.",
  tags: ["Undiscovered","Islands","Culture"],
  cover,
};

const H={heroTitle:"text-2xl md:text-4xl font-extrabold text-white drop-shadow",sectionH2:"text-2xl md:text-3xl font-extrabold text-[#00477f]"};
const Tip=({t}:{t:string})=><div className="mt-3 rounded-xl bg-[#d06549]/10 px-4 py-3 text-sm text-[#d06549] font-semibold">💡 PlumTip: {t}</div>;
const Shot=({src,alt}:{src:string;alt:string})=><img src={src} alt={alt} className="w-full rounded-2xl object-cover shadow-md" style={{aspectRatio:"16 / 9"}} loading="lazy"/>;
const Bullets=({items}:{items:string[]})=><ul className="mt-2 list-disc pl-5 text-slate-700">{items.map(i=><li key={i} className="mb-1">{i}</li>)}</ul>;
function Block({title,img,points}:{title:string;img:string;points:string[]}){return(<section className="mt-10"><h2 className={H.sectionH2}>{title}</h2><div className="mt-4"><Shot src={img} alt={title}/></div><div className="mt-4 rounded-xl bg-white border p-5 shadow-sm"><Bullets items={points}/></div></section>)}

export default function Post(){return(<article className="bg-gradient-to-b from-slate-50 to-white">
  <header className="relative"><div className="relative h-[280px] md:h-[380px]"><img src={cover} alt={meta.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/10"/><div className="absolute inset-x-0 bottom-0"><div className="mx-auto max-w-4xl px-4 pb-10"><h1 className={H.heroTitle}>{meta.title}</h1><p className="mt-3 text-white/90">Quiet magic: wild coasts, heritage streets, landscapes that still feel secret.</p></div></div></div></header>
  <main className="mx-auto max-w-4xl px-4 py-10">
    <Tip t="Arrive midweek, stay longer — give places time to reveal themselves."/>
    <Block title="Albanian Riviera" img={imgAlbania} points={["Turquoise coves","Family-run stays","Sea-to-table dinners"]}/>
    <Block title="Azores (Hidden Corners)" img={imgAcores} points={["Crater lakes, hot springs","Hortensia-lined roads","Whale season overlap"]}/>
    <Block title="Svaneti, Georgia" img={imgGeorgia} points={["Medieval towers","Caucasus hikes","Hearty mountain cuisine"]}/>
    <Block title="Pantelleria, Italy" img={imgPantelleria} points={["Dammuso stone houses","Hot springs by sea","Capers & Zibibbo wines"]}/>
    <Block title="São Tomé & Príncipe" img={imgSaoTome} points={["Chocolate plantations","Emerald bays","Zero crowds"]}/>
    <Block title="Musandam Fjords, Oman" img={imgOman} points={["Arabian ‘Norway’ fjords","Dhow cruises","Cliffview camps"]}/>
    <div className="mt-12 rounded-2xl border bg-white p-6 shadow-md"><h3 className="text-lg md:text-xl font-bold">Plan it with PlumTrips ✈️</h3><p className="mt-2 text-slate-700">We’ll stitch routes and rare stays with care — sustainable, beautiful.</p><div className="mt-5"><a href="/go/concierge" className="inline-flex rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold hover:bg-[#c2513d]">Design My Hidden Gem</a></div></div>
  </main>
</article>)}
