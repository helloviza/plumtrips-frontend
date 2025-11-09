/* ===== Co-located images ===== */
const cover        = new URL("./cover-germany-paradise.jpg", import.meta.url).href;
const imgMallorca  = new URL("./mallorca.jpg", import.meta.url).href;
const imgIbiza     = new URL("./ibiza.jpg", import.meta.url).href;
const imgSantorini = new URL("./santorini.jpg", import.meta.url).href;
const imgDubrovnik = new URL("./dubrovnik.jpg", import.meta.url).href;
const imgNice      = new URL("./nice.jpg", import.meta.url).href;
const imgLisbon    = new URL("./lisbon.jpg", import.meta.url).href;
const imgMadeira   = new URL("./madeira.jpg", import.meta.url).href;
const imgSplit     = new URL("./split.jpg", import.meta.url).href;
const imgReykjavik = new URL("./reykjavik.jpg", import.meta.url).href;
const imgMykonos   = new URL("./mykonos.jpg", import.meta.url).href;

/* ===== Meta for BlogIndex ===== */
export const meta = {
  slug: "10-short-flights-from-germany-to-paradise-book-with-plumtrips",
  title: "10 Short Flights From Germany To Paradise — Book With PlumTrips",
  excerpt:
    "Weekend escapes, sunny coasts, island bliss — 10 destinations under 4 hours from Germany, curated the PlumTrips way.",
  tags: ["Weekend Getaways", "Island Vibes", "Europe"],
  cover,
};

/* ===== UI bits ===== */
const H = {
  heroTitle: "text-2xl md:text-4xl font-extrabold text-white drop-shadow",
  sectionH2: "text-2xl md:text-3xl font-extrabold text-[#00477f]",
};
const PlumTip = ({ text }: { text: string }) => (
  <div className="mt-3 rounded-xl bg-[#d06549]/10 px-4 py-3 text-sm text-[#d06549] font-semibold">
    💡 PlumTip: {text}
  </div>
);
function Shot({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className="w-full rounded-2xl object-cover shadow-md"
      style={{ aspectRatio: "16 / 9" }}
      loading="lazy"
    />
  );
}
function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 list-disc pl-5 text-slate-700">
      {items.map((t) => (
        <li key={t} className="mb-1 leading-relaxed">{t}</li>
      ))}
    </ul>
  );
}
function FlightBlock({
  i, place, country, img, vibe, stays, moments, tip,
}: {
  i: number; place: string; country: string; img: string;
  vibe: string; stays: string[]; moments: string[]; tip?: string;
}) {
  return (
    <section className="mt-12">
      <h2 className={H.sectionH2}>{i}. {place}, {country}</h2>
      <p className="mt-2 text-slate-600 italic">{vibe}</p>
      <div className="mt-5"><Shot src={img} alt={`${place}, ${country}`} /></div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white shadow-sm border p-5">
          <h3 className="font-bold text-slate-900">🏨 Where You’ll Stay</h3>
          <Bullets items={stays} />
        </div>
        <div className="rounded-xl bg-white shadow-sm border p-5">
          <h3 className="font-bold text-slate-900">✨ Why Go</h3>
          <Bullets items={moments} />
        </div>
      </div>
      {tip && <PlumTip text={tip} />}
    </section>
  );
}

/* ===== Page ===== */
export default function Post() {
  return (
    <article className="bg-gradient-to-b from-slate-50 to-white">
      {/* HERO */}
      <header className="relative">
        <div className="relative h-[280px] md:h-[380px] w-full overflow-hidden">
          <img src={cover} alt={meta.title} className="h-full w-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/10" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-4xl px-4 pb-8 md:pb-12">
              <h1 className={H.heroTitle}>{meta.title}</h1>
              <p className="mt-3 max-w-2xl text-white/90 text-base md:text-lg">
                Sun, sand, and cocktails on repeat — all within a short flight from Berlin, Munich, Hamburg, or Frankfurt.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:py-12 leading-relaxed">
        <p className="text-lg text-slate-700">
          Looking for a **quick recharge** without burning your annual leave? Here are 10 short-haul flights
          from Germany to paradise — curated with PlumTrips’ **luxury-but-effortless** lens. Expect boutique
          stays, soft beaches, and sunset dinners that look straight out of Instagram. ✈️
        </p>

        <PlumTip text="Mid-week flights are up to 35% cheaper — consider Tue/Thu departures for sweet savings." />

        <FlightBlock
          i={1} place="Mallorca" country="Spain" img={imgMallorca}
          vibe="Balearic vibes, hidden coves, lazy afternoons."
          stays={[
            "Finca-style boutique hotels near Deià.",
            "Beachfront suites in Cala d’Or.",
            "Adults-only spa retreats in Sóller.",
          ]}
          moments={[
            "Sunset tapas overlooking Port de Sóller.",
            "Wine tasting in local vineyards.",
            "Cliff walks with infinity views.",
          ]}
          tip="Skip July crowds — May & Sept offer perfect weather + lower rates."
        />

        <FlightBlock
          i={2} place="Ibiza" country="Spain" img={imgIbiza}
          vibe="Boho-chic meets sunset beats."
          stays={[
            "Cliffside bohemian villas.",
            "Boutique casitas near Cala Comte.",
            "Beach clubs on Talamanca Bay.",
          ]}
          moments={[
            "Sunset at Café del Mar.",
            "Beach hopping between hidden calas.",
            "Morning yoga overlooking turquoise seas.",
          ]}
          tip="Stay north for chill, south for nightlife."
        />

        <FlightBlock
          i={3} place="Santorini" country="Greece" img={imgSantorini}
          vibe="Whitewashed magic + endless blue horizons."
          stays={[
            "Cave suites in Oia.",
            "Infinity-pool hotels in Imerovigli.",
            "Seaview lofts in Fira.",
          ]}
          moments={[
            "Caldera sunset catamaran.",
            "Rooftop dining under fairy lights.",
            "Wander pastel lanes at sunrise.",
          ]}
          tip="Avoid peak crowds: late Sept is golden."
        />

        <FlightBlock
          i={4} place="Dubrovnik" country="Croatia" img={imgDubrovnik}
          vibe="Game of Thrones vibes, cobbled charm, Adriatic dreams."
          stays={[
            "Seafront heritage stays.",
            "Boutique lofts inside Old Town walls.",
            "Infinity-pool resorts along Lapad Bay.",
          ]}
          moments={[
            "Cable car ride at golden hour.",
            "Kayak to Lokrum island.",
            "Game of Thrones walking tour.",
          ]}
          tip="Fly midweek for cheaper rates + fewer crowds."
        />

        <FlightBlock
          i={5} place="Nice" country="France" img={imgNice}
          vibe="Azure beaches, Riviera glam, seafood brunches."
          stays={[
            "Chic seaside hotels on Promenade des Anglais.",
            "Luxury villas near Villefranche-sur-Mer.",
            "Art-filled boutique hotels in Old Town.",
          ]}
          moments={[
            "Evening rosé overlooking the harbor.",
            "Perfume atelier day-trip to Grasse.",
            "Old Town bistro hopping.",
          ]}
          tip="Pair Nice with Èze & Monaco for a mini-Riviera escape."
        />

        <FlightBlock
          i={6} place="Lisbon" country="Portugal" img={imgLisbon}
          vibe="Pastel facades, trams, rooftops, sardines on the grill."
          stays={[
            "Tiles-and-light guesthouses in Alfama.",
            "Design lofts in Chiado.",
            "Pool villas in Cascais.",
          ]}
          moments={[
            "Ride Tram 28, selfie ready.",
            "Fado night in Bairro Alto.",
            "Day-trip to Sintra palaces.",
          ]}
          tip="Try pastéis de nata at Manteigaria — life changing."
        />

        <FlightBlock
          i={7} place="Madeira" country="Portugal" img={imgMadeira}
          vibe="Emerald cliffs, volcanic pools, levada walks."
          stays={[
            "Clifftop spa resorts.",
            "Nature lodges deep in Laurisilva forest.",
            "Stylish villas in Funchal.",
          ]}
          moments={[
            "Whale watching in crystal waters.",
            "Swim volcanic lava pools.",
            "Hike sunrise at Pico do Arieiro.",
          ]}
          tip="Fly early morning for best winds."
        />

        <FlightBlock
          i={8} place="Split" country="Croatia" img={imgSplit}
          vibe="Roman ruins, Adriatic bays, beach bars that hum past midnight."
          stays={[
            "Sea-facing apartments near Bačvice Beach.",
            "Rooftop suites overlooking Diocletian’s Palace.",
            "Chic guesthouses near Marjan Hill.",
          ]}
          moments={[
            "Boat day to Hvar + Vis islands.",
            "Sunset wine on Riva promenade.",
            "Walk historic Old Town at dawn.",
          ]}
          tip="Split pairs well with Dubrovnik for a 2-stop Croatia escape."
        />

        <FlightBlock
          i={9} place="Reykjavík" country="Iceland" img={imgReykjavik}
          vibe="Geothermal lagoons, northern lights, midnight sun."
          stays={[
            "Glass-roof cabins outside town.",
            "Design hotels downtown.",
            "Spa retreats near Blue Lagoon.",
          ]}
          moments={[
            "Chase auroras by superjeep.",
            "Golden Circle waterfall tour.",
            "Dip into steaming blue lagoons.",
          ]}
          tip="Winter = lights; Summer = endless sun."
        />

        <FlightBlock
          i={10} place="Mykonos" country="Greece" img={imgMykonos}
          vibe="White lanes, beach beats, lazy chic lunches."
          stays={[
            "Pool villas overlooking Psarou Beach.",
            "Cycladic suites with rooftop decks.",
            "Seaside casitas near Ornos.",
          ]}
          moments={[
            "Paradise Beach clubbing.",
            "Windmill photoshoot at dusk.",
            "Luxury boat day to Delos island.",
          ]}
          tip="Visit mid-June for vibe + softer rates."
        />

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-lg md:text-xl font-bold text-slate-900">
            Ready for your next quick escape?
          </h3>
          <p className="mt-2 text-slate-700">
            Book short flights, boutique stays, and curated adventures — all wrapped up in one seamless PlumTrips itinerary.
          </p>
          <div className="mt-5">
            <a
              href="/go/concierge"
              className="inline-flex items-center rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold shadow hover:bg-[#c2513d] transition"
            >
              Plan My Getaway
            </a>
          </div>
        </div>
      </main>
    </article>
  );
}
