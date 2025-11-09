/* ===== Co-located images ===== */
const cover      = new URL("./cover-bahamas-pigs.jpg", import.meta.url).href;
const imgPigs    = new URL("./big-major-cay-pigs.jpg", import.meta.url).href;
const imgExuma   = new URL("./exuma-blues.jpg", import.meta.url).href;
const imgThunder = new URL("./thunderball-grotto.jpg", import.meta.url).href;
const imgNurse   = new URL("./nurse-shark-sandbar.jpg", import.meta.url).href;
const imgYacht   = new URL("./bahamas-yacht-day.jpg", import.meta.url).href;
const imgResort  = new URL("./exuma-resort.jpg", import.meta.url).href;

/* ===== Meta ===== */
export const meta = {
  slug: "swimming-in-paradise-swimming-with-pigs-in-the-crystal-clear-waters-of-the-bahamas",
  title: "Swimming In Paradise — Swimming With Pigs In The Crystal Clear Waters Of The Bahamas",
  excerpt: "Emerald shallows, friendly pigs, and a boat day you’ll never forget.",
  tags: ["Bahamas","Unique","Boat Day"],
  cover,
};

const H={heroTitle:"text-2xl md:text-4xl font-extrabold text-white drop-shadow",sectionH2:"text-2xl md:text-3xl font-extrabold text-[#00477f]"};
const Tip=({t}:{t:string})=><div className="mt-3 rounded-xl bg-[#d06549]/10 px-4 py-3 text-sm text-[#d06549] font-semibold">💡 PlumTip: {t}</div>;
const Shot=({src,alt}:{src:string;alt:string})=><img src={src} alt={alt} className="w-full rounded-2xl object-cover shadow-md" style={{aspectRatio:"16 / 9"}} loading="lazy"/>;
const Bullets=({items}:{items:string[]})=><ul className="mt-2 list-disc pl-5 text-slate-700">{items.map(i=><li key={i} className="mb-1">{i}</li>)}</ul>;
function Block({title,img,points}:{title:string;img:string;points:string[]}){return(<section className="mt-10"><h2 className={H.sectionH2}>{title}</h2><div className="mt-4"><Shot src={img} alt={title}/></div><div className="mt-4 rounded-xl bg-white border p-5 shadow-sm"><Bullets items={points}/></div></section>)}

export default function Post(){return(<article className="bg-gradient-to-b from-slate-50 to-white">
  <header className="relative"><div className="relative h-[280px] md:h-[380px]"><img src={cover} alt={meta.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/10"/><div className="absolute inset-x-0 bottom-0"><div className="mx-auto max-w-4xl px-4 pb-10"><h1 className={H.heroTitle}>{meta.title}</h1><p className="mt-3 text-white/90">Yes, really. Crystal shallows, happy pigs, and cinematic cays.</p></div></div></div></header>
  <main className="mx-auto max-w-4xl px-4 py-10">
    <Tip t="Go early with a licensed operator; treat animals gently and keep beaches clean."/>
    <Block title="Pig Beach, Big Major Cay" img={imgPigs} points={["Gentle interactions from the boat","No feeding junk food","Camera straps on!"]}/>
    <Block title="Exuma Blues" img={imgExuma} points={["Shallow sandbars","Neon-blue water","Sand-dollar hunts"]}/>
    <Block title="Thunderball Grotto" img={imgThunder} points={["James Bond cave swim","High-tide timing matters","Mask + fins ready"]}/>
    <Block title="Nurse Shark Sandbar" img={imgNurse} points={["Calm sharks, guided wade","Respectful distance","No sudden moves"]}/>
    <Block title="Yacht Day" img={imgYacht} points={["Island-hop in comfort","Shade + coolers","Drone-free etiquette"]}/>
    <Block title="Where To Stay" img={imgResort} points={["Exuma resorts with private docks","Beach villas with decks","Chef kitchens for fresh catch"]}/>
    <div className="mt-12 rounded-2xl border bg-white p-6 shadow-md"><h3 className="text-lg md:text-xl font-bold">Plan it with PlumTrips ✈️</h3><p className="mt-2 text-slate-700">We’ll line up boats, timing, and the chillest cays — stress-free.</p><div className="mt-5"><a href="/go/concierge" className="inline-flex rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold hover:bg-[#c2513d]">Design My Exuma Day</a></div></div>
  </main>
</article>)}
