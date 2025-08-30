/* ===== Co-located images ===== */
const cover      = new URL("./cover-crystal-clear.jpg", import.meta.url).href;
const imgMaldives = new URL("./maldives.jpg", import.meta.url).href;
const imgBoraBora = new URL("./bora-bora.jpg", import.meta.url).href;
const imgSeychelles = new URL("./seychelles.jpg", import.meta.url).href;
const imgFiji = new URL("./fiji.jpg", import.meta.url).href;
const imgZakynthos = new URL("./zakynthos.jpg", import.meta.url).href;
const imgBahamas = new URL("./bahamas.jpg", import.meta.url).href;
const imgMoorea = new URL("./moorea.jpg", import.meta.url).href;
const imgPalawan = new URL("./palawan.jpg", import.meta.url).href;
const imgGreatBarrierReef = new URL("./great-barrier-reef.jpg", import.meta.url).href;
const imgTurksCaicos = new URL("./turks-caicos.jpg", import.meta.url).href;

/* ===== Meta for BlogIndex ===== */
export const meta = {
  slug: "crystal-clear-waters-dream-destinations-around-the-world-not-just-in-the-maldives",
  title: "Crystal Clear Waters: Dream Destinations Around The World — Not Just In The Maldives",
  excerpt:
    "From Bora Bora to Palawan, here’s your handpicked edit of the clearest waters on earth — curated by PlumTrips.",
  tags: ["Beach Vibes", "Luxury Escapes", "Bucket List"],
  cover,
};

/* ===== UI helpers ===== */
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

function WaterBlock({
  i, place, country, img, vibe, stays, activities, tip,
}: {
  i: number; place: string; country: string; img: string;
  vibe: string; stays: string[]; activities: string[]; tip?: string;
}) {
  return (
    <section className="mt-12">
      <h2 className={H.sectionH2}>{i}. {place}, {country}</h2>
      <p className="mt-2 text-slate-600 italic">{vibe}</p>
      <div className="mt-5"><Shot src={img} alt={`${place}, ${country}`} /></div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white shadow-sm border p-5">
          <h3 className="font-bold text-slate-900">🏝 Where To Stay</h3>
          <Bullets items={stays} />
        </div>
        <div className="rounded-xl bg-white shadow-sm border p-5">
          <h3 className="font-bold text-slate-900">🌊 Must-Do Experiences</h3>
          <Bullets items={activities} />
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
                Lagoon blues, barefoot luxury, cinematic sunsets — your ultimate PlumTrips water edit.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:py-12 leading-relaxed">
        <p className="text-lg text-slate-700">
          If paradise had a texture, it would be water. Think turquoise lagoons, palm-framed bays,
          and coral gardens that rewrite your reel aesthetics. Here’s our curated **top 10 list** of
          destinations where crystal-clear waters meet luxury stays and immersive adventures.
        </p>

        <PlumTip text="Book shoulder season for the same turquoise waters minus the crowds and premiums." />

        <WaterBlock
          i={1} place="Maldives" country="Indian Ocean" img={imgMaldives}
          vibe="Private decks, overwater villas, coral reefs in HD clarity."
          stays={[
            "Overwater villas with glass floors.",
            "Luxury beach suites with infinity pools.",
            "Eco-resorts designed for barefoot luxury.",
          ]}
          activities={[
            "Snorkel house reefs with manta rays.",
            "Floating breakfast + sandbank picnics.",
            "Sunset dolphin cruise under pastel skies.",
          ]}
          tip="Split stay between North & South Atolls for different reef experiences."
        />

        <WaterBlock
          i={2} place="Bora Bora" country="French Polynesia" img={imgBoraBora}
          vibe="Teal lagoons, mountain peaks, iconic floating villas."
          stays={[
            "Signature overwater bungalows.",
            "Private beachfront villas.",
            "Luxury resorts on boutique motus (islets).",
          ]}
          activities={[
            "Shallow-water paddleboarding.",
            "Snorkel coral gardens with sharks & rays.",
            "Sunset kayak with Mount Otemanu backdrop.",
          ]}
          tip="Combine Bora Bora with Moorea for a double-lagoon escape."
        />

        <WaterBlock
          i={3} place="Seychelles" country="Africa" img={imgSeychelles}
          vibe="Wild granite boulders, soft-sand beaches, jungle-framed bays."
          stays={[
            "Hilltop pool villas with panoramic views.",
            "Boutique beachfront escapes.",
            "Private island retreats for deep luxury.",
          ]}
          activities={[
            "Dive world-class coral gardens.",
            "Cycle La Digue beaches.",
            "Romantic sunset picnics on hidden coves.",
          ]}
          tip="Pair Mahé, Praslin, and La Digue for three vibes in one trip."
        />

        <WaterBlock
          i={4} place="Fiji" country="South Pacific" img={imgFiji}
          vibe="Coral coastlines, kava nights, barefoot paradises."
          stays={[
            "All-inclusive island resorts.",
            "Clifftop boutique villas.",
            "Private eco-resorts on untouched atolls.",
          ]}
          activities={[
            "Swim with gentle reef sharks.",
            "Sunset village fire dances.",
            "Kayak turquoise lagoons.",
          ]}
          tip="Go April–June for calm seas and vibrant marine life."
        />

        <WaterBlock
          i={5} place="Zakynthos" country="Greece" img={imgZakynthos}
          vibe="Blue caves, white cliffs, and beaches like postcards."
          stays={[
            "Luxury cliffside suites with plunge pools.",
            "Chic boutique villas above Navagio Bay.",
            "Sea-view lofts along Tsilivi coast.",
          ]}
          activities={[
            "Boat trips to Navagio (Shipwreck Beach).",
            "Explore hidden Blue Caves.",
            "Private yacht to Kefalonia islands.",
          ]}
          tip="June & September = sunshine, fewer crowds, perfect waters."
        />

        <WaterBlock
          i={6} place="Bahamas" country="Caribbean" img={imgBahamas}
          vibe="Powder beaches, pink sands, and swimming pigs (yes, really)."
          stays={[
            "Overwater bungalows on private islands.",
            "Beach villas with cabana decks.",
            "Luxury resorts on Exuma bays.",
          ]}
          activities={[
            "Swim with pigs in Big Major Cay.",
            "Snorkel Thunderball Grotto.",
            "Island-hop on luxury catamarans.",
          ]}
          tip="Stay near Exuma for the clearest waters in the Bahamas."
        />

        <WaterBlock
          i={7} place="Moorea" country="French Polynesia" img={imgMoorea}
          vibe="Emerald peaks, hidden bays, and shark-ray lagoons."
          stays={[
            "Boutique beach bungalows.",
            "Overwater villas with glass decks.",
            "Sustainable barefoot retreats.",
          ]}
          activities={[
            "Snorkel coral gardens near Opunohu Bay.",
            "Hike Three Coconut Trees Pass.",
            "Sunset picnic on a private motu.",
          ]}
          tip="Combine with Bora Bora or Tahiti for a tri-island itinerary."
        />

        <WaterBlock
          i={8} place="Palawan" country="Philippines" img={imgPalawan}
          vibe="Emerald lagoons, dramatic cliffs, secret beaches."
          stays={[
            "Luxury eco-resorts near El Nido.",
            "Hidden coves with boutique glamping.",
            "Floating villas in Coron Bay.",
          ]}
          activities={[
            "Island-hop El Nido’s Big Lagoon.",
            "Swim Twin Lagoon hidden passageways.",
            "Kayak limestone-framed secret beaches.",
          ]}
          tip="Book private island stays for next-level seclusion."
        />

        <WaterBlock
          i={9} place="Great Barrier Reef" country="Australia" img={imgGreatBarrierReef}
          vibe="Iconic reefs, kaleidoscopic marine life, zero filter needed."
          stays={[
            "Private reef-side retreats.",
            "Luxury eco-lodges near Cairns.",
            "Yacht charters over Whitsundays.",
          ]}
          activities={[
            "Snorkel Heart Reef by helicopter.",
            "Glass-bottom sailing experiences.",
            "Underwater observatories for coral viewing.",
          ]}
          tip="Avoid Jan–Mar cyclone season for smooth sailing."
        />

        <WaterBlock
          i={10} place="Turks & Caicos" country="Caribbean" img={imgTurksCaicos}
          vibe="Instagram’s favorite blue — softest sands, endless shallows."
          stays={[
            "Beachfront designer villas.",
            "Adults-only boutique resorts.",
            "Private homes with chef service.",
          ]}
          activities={[
            "Horseback ride along Grace Bay Beach.",
            "Sail to uninhabited cays.",
            "Sunset champagne on a luxury yacht.",
          ]}
          tip="Grace Bay = shallow perfection; Long Bay = kiteboarding heaven."
        />

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-lg md:text-xl font-bold text-slate-900">
            Dreaming of water this clear?
          </h3>
          <p className="mt-2 text-slate-700">
            Our designers craft **bucket-list itineraries** with handpicked stays and private transfers —
            you just bring your swimwear.
          </p>
          <div className="mt-5">
            <a
              href="/go/concierge"
              className="inline-flex items-center rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold shadow hover:bg-[#c2513d] transition"
            >
              Plan My Dream Trip
            </a>
          </div>
        </div>
      </main>
    </article>
  );
}
