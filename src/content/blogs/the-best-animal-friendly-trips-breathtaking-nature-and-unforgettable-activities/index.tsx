/* ===== Co-located images ===== */
const cover      = new URL("./cover-animal-friendly.jpg", import.meta.url).href;
const imgSafari  = new URL("./ethical-safari.jpg", import.meta.url).href;
const imgWhales  = new URL("./whale-watching.jpg", import.meta.url).href;
const imgTurtles = new URL("./turtle-hatchery.jpg", import.meta.url).href;
const imgPenguins= new URL("./penguin-reserve.jpg", import.meta.url).href;
const imgBorneo  = new URL("./borneo-orangutans.jpg", import.meta.url).href;
const imgGalap   = new URL("./galapagos.jpg", import.meta.url).href;

/* ===== Meta ===== */
export const meta = {
  slug: "the-best-animal-friendly-trips-breathtaking-nature-and-unforgettable-activities",
  title: "The Best Animal-Friendly Trips — Breathtaking Nature & Unforgettable Activities",
  excerpt: "Ethical wildlife encounters with expert guides and low-impact stays.",
  tags: ["Wildlife","Ethical","Outdoors"],
  cover,
};

const H={heroTitle:"text-2xl md:text-4xl font-extrabold text-white drop-shadow",sectionH2:"text-2xl md:text-3xl font-extrabold text-[#00477f]"};
const Tip=({t}:{t:string})=><div className="mt-3 rounded-xl bg-[#d06549]/10 px-4 py-3 text-sm text-[#d06549] font-semibold">💡 PlumTip: {t}</div>;
const Shot=({src,alt}:{src:string;alt:string})=><img src={src} alt={alt} className="w-full rounded-2xl object-cover shadow-md" style={{aspectRatio:"16 / 9"}} loading="lazy"/>;
const Bullets=({items}:{items:string[]})=><ul className="mt-2 list-disc pl-5 text-slate-700">{items.map(i=><li key={i} className="mb-1">{i}</li>)}</ul>;
function Block({title,img,points}:{title:string;img:string;points:string[]}){return(<section className="mt-10"><h2 className={H.sectionH2}>{title}</h2><div className="mt-4"><Shot src={img} alt={title}/></div><div className="mt-4 rounded-xl bg-white border p-5 shadow-sm"><Bullets items={points}/></div></section>)}

export default function Post(){return(<article className="bg-gradient-to-b from-slate-50 to-white">
  <header className="relative"><div className="relative h-[280px] md:h-[380px]"><img src={cover} alt={meta.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/10"/><div className="absolute inset-x-0 bottom-0"><div className="mx-auto max-w-4xl px-4 pb-10"><h1 className={H.heroTitle}>{meta.title}</h1><p className="mt-3 text-white/90">See the wild right — guided, respectful, and unforgettable.</p></div></div></div></header>
  <main className="mx-auto max-w-4xl px-4 py-10">
    <Tip t="No touching, no baiting, no flashes — your photos look better anyway."/>
    <Block title="Ethical Safari" img={imgSafari} points={["Conservancy models","Light-footprint camps","Local trackers"]}/>
    <Block title="Whale Watching" img={imgWhales} points={["Licenced vessels","Distance rules","Hydrophone listening"]}/>
    <Block title="Turtle Hatchery" img={imgTurtles} points={["Verified programs","Night patrols","Zero handling"]}/>
    <Block title="Penguin Reserves" img={imgPenguins} points={["Boardwalk viewing","No drones","Cold but cute"]}/>
    <Block title="Borneo Orangutans" img={imgBorneo} points={["Rehab centers","Jungle river lodges","Forest ethics"]}/>
    <Block title="Galápagos" img={imgGalap} points={["Park-certified guides","Fragile-island rules","Out-of-this-world life"]}/>
    <div className="mt-12 rounded-2xl border bg-white p-6 shadow-md"><h3 className="text-lg md:text-xl font-bold">Plan it with PlumTrips ✈️</h3><p className="mt-2 text-slate-700">We’ll choose operators who protect habitats and your experience.</p><div className="mt-5"><a href="/go/concierge" className="inline-flex rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold hover:bg-[#c2513d]">Design My Wildlife Trip</a></div></div>
  </main>
</article>)}
