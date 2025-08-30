/* ===== Co-located images ===== */
const cover      = new URL("./cover-winter-de.jpg", import.meta.url).href;
const imgAlps    = new URL("./alps-ski-chalet.jpg", import.meta.url).href;
const imgLapland = new URL("./lapland-aurora.jpg", import.meta.url).href;
const imgCanary  = new URL("./canary-islands-winter-sun.jpg", import.meta.url).href;
const imgDubai   = new URL("./dubai-winter-warmth.jpg", import.meta.url).href;
const imgMadeira = new URL("./madeira-winter.jpg", import.meta.url).href;
const imgMaldives= new URL("./maldives-winter-escape.jpg", import.meta.url).href;

/* ===== Meta ===== */
export const meta = {
  slug: "winterurlaubsorte-kalte-oder-warme-finde-dein-perfektes-reiseziel-uber-plumtrips",
  title: "Winterurlaubsorte — Kalte Oder Warme? Finde Dein Perfektes Reiseziel Über PlumTrips",
  excerpt: "Sonne oder Schnee? Von Alpenzauber bis Inselwärme — dein perfekter Wintertrip.",
  tags: ["Winter","SonneOderSchnee","DE"],
  cover,
};

const H={heroTitle:"text-2xl md:text-4xl font-extrabold text-white drop-shadow",sectionH2:"text-2xl md:text-3xl font-extrabold text-[#00477f]"};
const Tip=({t}:{t:string})=><div className="mt-3 rounded-xl bg-[#d06549]/10 px-4 py-3 text-sm text-[#d06549] font-semibold">💡 PlumTip: {t}</div>;
const Shot=({src,alt}:{src:string;alt:string})=><img src={src} alt={alt} className="w-full rounded-2xl object-cover shadow-md" style={{aspectRatio:"16 / 9"}} loading="lazy"/>;
const Bullets=({items}:{items:string[]})=><ul className="mt-2 list-disc pl-5 text-slate-700">{items.map(i=><li key={i} className="mb-1">{i}</li>)}</ul>;
function Block({title,img,points}:{title:string;img:string;points:string[]}){return(<section className="mt-10"><h2 className={H.sectionH2}>{title}</h2><div className="mt-4"><Shot src={img} alt={title}/></div><div className="mt-4 rounded-xl bg-white border p-5 shadow-sm"><Bullets items={points}/></div></section>)}

export default function Post(){return(<article className="bg-gradient-to-b from-slate-50 to-white">
  <header className="relative"><div className="relative h-[280px] md:h-[380px]"><img src={cover} alt={meta.title} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/10"/><div className="absolute inset-x-0 bottom-0"><div className="mx-auto max-w-4xl px-4 pb-10"><h1 className={H.heroTitle}>{meta.title}</h1><p className="mt-3 text-white/90">Ski & Sauna oder Sonne & Strand — du wählst, wir planen.</p></div></div></div></header>
  <main className="mx-auto max-w-4xl px-4 py-10">
    <Tip t="Weihnachten/Neujahr früh sichern — beste Zimmer sind schnell weg."/>
    <Block title="Alpenzauber" img={imgAlps} points={["Ski-in Chalets","Spa-Etage mit Ausblick","Fondue am Kamin"]}/>
    <Block title="Lappland & Polarlichter" img={imgLapland} points={["Huskys & Schnee-Expedition","Glas-Iglu Nächte","Nordlicht-Jagd"]}/>
    <Block title="Kanarische Inseln" img={imgCanary} points={["Wintersonne + mildes Meer","Küsten-Wanderwege","Vulkansand-Strände"]}/>
    <Block title="Dubai Wärme" img={imgDubai} points={["Pooltage + Citylights","Wüstencamp am Abend","Yacht-Stunde am Marina"]}/>
    <Block title="Madeira Grün" img={imgMadeira} points={["Levadas & Gärten","Klippenpools","Whale/Winter-Boatdays"]}/>
    <Block title="Maldives Escape" img={imgMaldives} points={["Overwater-Tage","Sandbank-Picknick","Delfin-Sonnenuntergang"]}/>
    <div className="mt-12 rounded-2xl border bg-white p-6 shadow-md"><h3 className="text-lg md:text-xl font-bold">Mit PlumTrips planen ✈️</h3><p className="mt-2 text-slate-700">Wir sichern dir die besten Daten, Transfers und Zimmer — schneekalt oder tropenwarm.</p><div className="mt-5"><a href="/go/concierge" className="inline-flex rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold hover:bg-[#c2513d]">Mein Wintertrip</a></div></div>
  </main>
</article>)}
