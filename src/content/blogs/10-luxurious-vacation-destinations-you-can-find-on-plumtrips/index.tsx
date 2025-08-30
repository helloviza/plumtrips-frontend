/* ===== Co-located images ===== */
const cover        = new URL("./cover-luxury.jpg", import.meta.url).href;
const imgMaldives  = new URL("./maldives.jpg", import.meta.url).href;
const imgSantorini = new URL("./santorini.jpg", import.meta.url).href;
const imgBoraBora  = new URL("./bora-bora.jpg", import.meta.url).href;
const imgSwissAlps = new URL("./swiss-alps.jpg", import.meta.url).href;
const imgDubai     = new URL("./dubai.jpg", import.meta.url).href;
const imgSeychelles= new URL("./seychelles.jpg", import.meta.url).href;
const imgBali      = new URL("./bali-ubud.jpg", import.meta.url).href;
const imgAmalfi    = new URL("./amalfi.jpg", import.meta.url).href;
const imgKyoto     = new URL("./kyoto.jpg", import.meta.url).href;
const imgMauritius = new URL("./mauritius.jpg", import.meta.url).href;

/* ===== Meta for BlogIndex ===== */
export const meta = {
  slug: "10-luxurious-vacation-destinations-you-can-find-on-plumtrips",
  title: "10 Luxurious Vacation Destinations You Can Find On PlumTrips",
  excerpt:
    "Overwater dawns, cliff-edge sunsets, private pools & whisper-quiet service — here’s the PlumTrips shortlist for your next flex.",
  tags: ["Luxury", "Honeymoon", "Bucket List"],
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
function LuxBlock({
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
          <h3 className="font-bold text-slate-900">✨ Core Moments</h3>
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
                Quiet luxury, statement views, and service that anticipates — curated by PlumTrips.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:py-12 leading-relaxed">
        <p className="text-lg text-slate-700">
          Luxe doesn’t shout; it whispers. Think still-water pools, linen mornings, and sunsets that
          feel designed. If you’re planning a **honeymoon, milestone, or “I deserve this” trip**, start here —
          our travel designers lock in the suites and experiences that photograph *and* feel incredible.
        </p>

        <PlumTip text="Travel in shoulder season for the same suites at softer rates — ask us for the perfect dates." />

        <LuxBlock
          i={1} place="Maldives (North & South Atolls)" country="Maldives" img={imgMaldives}
          vibe="Glass-clear lagoons, private decks, sand as fine as sugar."
          stays={[
            "Overwater villas with steps into the lagoon.",
            "Beach pool villas for soft-sand mornings.",
            "Boutique eco-islands with design-forward dining.",
          ]}
          moments={[
            "Sunrise snorkel with reef life meters from your bed.",
            "Sandbank picnic with champagne on ice.",
            "Stargazing from your deck — ocean hush only.",
          ]}
          tip="Split stay: 2 nights beach villa + 2 nights overwater for two vibes in one trip."
        />

        <LuxBlock
          i={2} place="Santorini" country="Greece" img={imgSantorini}
          vibe="Cliff-edge suites, cave pools, caldera sunsets that stop time."
          stays={[
            "Cave suites in Oia with plunge pools.",
            "Adults-only hideaways in Imerovigli.",
            "Design hotels in Fira with easy nightlife access.",
          ]}
          moments={[
            "Golden hour from your private terrace.",
            "Catamaran around the caldera with swim stops.",
            "Sunrise village strolls before the crowds.",
          ]}
          tip="Stay in Imerovigli for the view without the Oia price tag."
        />

        <LuxBlock
          i={3} place="Bora Bora" country="French Polynesia" img={imgBoraBora}
          vibe="Iconic lagoon blues, mountain backdrop, quiet-perfect service."
          stays={[
            "Overwater bungalows with glass floors.",
            "Lagoon-front villas with private docks.",
            "Boutique motu (islet) retreats for deep privacy.",
          ]}
          moments={[
            "Shallow-lagoon paddle at sunrise.",
            "Floating breakfast (yes, it’s worth it).",
            "Stingray & reef snorkel with a guide.",
          ]}
          tip="Combine with Moorea for a 2-island itinerary and better value."
        />

        <LuxBlock
          i={4} place="Zermatt & St. Moritz" country="Switzerland" img={imgSwissAlps}
          vibe="Alpine suites, firelit lounges, window-frame peaks."
          stays={[
            "Ski-in chalets with spa floors.",
            "Belle Époque grand hotels with lake views.",
            "Modern alpine lodges with Michelin dining.",
          ]}
          moments={[
            "Glacier express panoramas between resorts.",
            "Private guide for first tracks after snowfall.",
            "Fondue night with mountain silhouettes.",
          ]}
          tip="January & March are sweet spots for snow + rates."
        />

        <LuxBlock
          i={5} place="Dubai" country="UAE" img={imgDubai}
          vibe="Skyline suites, desert silence, yacht afternoons."
          stays={[
            "Palm-side water villas and beach clubs.",
            "Desert resorts with private plunge pools.",
            "Downtown skyline suites for nightlife access.",
          ]}
          moments={[
            "Sunset dune drive + Bedouin dinner.",
            "Yacht hour along the Marina.",
            "Sky-high brunch with views for days.",
          ]}
          tip="Nov–Mar has perfect weather; book early over NYE."
        />

        <LuxBlock
          i={6} place="Seychelles" country="Indian Ocean" img={imgSeychelles}
          vibe="Granite boulders, jungle villas, beaches that reset your brain."
          stays={[
            "Clifftop villas with infinity pools.",
            "Nature-first island lodges.",
            "Beachfront suites on powder bays.",
          ]}
          moments={[
            "Anse Source d’Argent photo-walk.",
            "Private picnic on a hidden cove.",
            "Turtle spotting in season.",
          ]}
          tip="Island-hop Mahé, Praslin & La Digue for a full picture."
        />

        <LuxBlock
          i={7} place="Ubud" country="Bali" img={imgBali}
          vibe="Jungle canopies, floating breakfasts, spa rituals that slow time."
          stays={[
            "Pool villas overlooking rice terraces.",
            "Design-led wellness retreats.",
            "Boutique jungle lodges with outdoor baths.",
          ]}
          moments={[
            "Private sound bath + flower bath combo.",
            "Sunrise hike on Campuhan ridge.",
            "Chef’s table in the paddies.",
          ]}
          tip="Pair Ubud with Uluwatu (cliff sunsets) for contrast."
        />

        <LuxBlock
          i={8} place="Amalfi Coast" country="Italy" img={imgAmalfi}
          vibe="Lemon groves, cliff hotels, glamorous boats between villages."
          stays={[
            "Positano cliff suites with terraces.",
            "Ravello palazzos with gardens.",
            "Hidden coves near Praiano.",
          ]}
          moments={[
            "Private boat to Capri & the Grotta Azzurra.",
            "Sunset aperitivo on the terrace.",
            "Coastal road spin with a driver (zero stress).",
          ]}
          tip="May & late Sept = sunshine + calmer streets."
        />

        <LuxBlock
          i={9} place="Kyoto" country="Japan" img={imgKyoto}
          vibe="Ryokans, tatami calm, gardens that feel painted."
          stays={[
            "Luxury ryokan with kaiseki dinners.",
            "Villa suites near Arashiyama.",
            "Boutique machiya (townhouse) stays.",
          ]}
          moments={[
            "Private tea ceremony in a garden.",
            "Arashiyama bamboo at dawn.",
            "Evening Gion walk — lantern glow.",
          ]}
          tip="Book ryokan dinners — it’s half the experience."
        />

        <LuxBlock
          i={10} place="Mauritius" country="Indian Ocean" img={imgMauritius}
          vibe="Lagoon blues, mountain silhouettes, creole warmth."
          stays={[
            "Beach pool suites with butler service.",
            "Adults-only boutique bays.",
            "North coast resorts with sailing clubs.",
          ]}
          moments={[
            "Catamaran to flat island sandbanks.",
            "Chamarel rum tasting + seven-colored earth.",
            "Sunset sail with Sega rhythms.",
          ]}
          tip="East coast for breeze in summer; west for calmer seas in winter."
        />

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-lg md:text-xl font-bold text-slate-900">
            Ready for quiet luxury done right?
          </h3>
          <p className="mt-2 text-slate-700">
            Tell us your vibe (overwater, cliff-edge, desert, alpine) and we’ll craft a
            <strong> made-for-you</strong> itinerary — best suites, smooth transfers, perfect dates.
          </p>
          <div className="mt-5">
            <a
              href="/go/concierge"
              className="inline-flex items-center rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold shadow hover:bg-[#c2513d] transition"
            >
              Design My Luxe Escape
            </a>
          </div>
        </div>
      </main>
    </article>
  );
}
