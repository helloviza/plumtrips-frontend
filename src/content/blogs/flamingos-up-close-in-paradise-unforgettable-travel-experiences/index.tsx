/* ===== Co-located images ===== */
const cover        = new URL("./cover-flamingos.jpg", import.meta.url).href;
const imgAruba     = new URL("./aruba-flamingo-beach.jpg", import.meta.url).href;
const imgBonaire   = new URL("./bonaire-goto-lake.jpg", import.meta.url).href;
const imgYucatan   = new URL("./rio-lagartos-yucatan.jpg", import.meta.url).href;
const imgCelestun  = new URL("./celestun-biosphere.jpg", import.meta.url).href;
const imgNakuru    = new URL("./lake-nakuru-kenya.jpg", import.meta.url).href;
const imgAtacama   = new URL("./lagunas-atacama-chile.jpg", import.meta.url).href;
const imgUyuni     = new URL("./salar-de-uyuni-bolivia.jpg", import.meta.url).href;
const imgWalvisBay = new URL("./walvis-bay-namibia.jpg", import.meta.url).href;

/* ===== Meta for BlogIndex ===== */
export const meta = {
  slug: "flamingos-up-close-in-paradise-unforgettable-travel-experiences",
  title: "Flamingos Up Close In Paradise — Unforgettable Travel Experiences",
  excerpt:
    "Candy-pink lagoons and mirror-like shallows — the chic way to meet flamingos up close.",
  tags: ["Wildlife", "Photography", "Island Vibes"],
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
        <li key={t} className="mb-1 leading-relaxed">
          {t}
        </li>
      ))}
    </ul>
  );
}
function Spot({
  i,
  name,
  country,
  img,
  why,
  how,
}: {
  i: number;
  name: string;
  country: string;
  img: string;
  why: string[];
  how: string[];
}) {
  return (
    <section className="mt-10">
      <h2 className={H.sectionH2}>
        {i}. {name}, {country}
      </h2>
      <div className="mt-4">
        <Shot src={img} alt={`${name}, ${country}`} />
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white shadow-sm border p-5">
          <h3 className="font-bold text-slate-900">✨ Why It’s Special</h3>
          <Bullets items={why} />
        </div>
        <div className="rounded-xl bg-white shadow-sm border p-5">
          <h3 className="font-bold text-slate-900">📍 How To See Them</h3>
          <Bullets items={how} />
        </div>
      </div>
    </section>
  );
}

/* ===== Page ===== */
export default function Post() {
  return (
    <article className="bg-gradient-to-b from-slate-50 to-white">
      <header className="relative">
        <div className="relative h-[280px] md:h-[380px] w-full overflow-hidden">
          <img
            src={cover}
            alt={meta.title}
            className="h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/10" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-4xl px-4 pb-8 md:pb-12">
              <h1 className={H.heroTitle}>{meta.title}</h1>
              <p className="mt-3 max-w-2xl text-white/90 text-base md:text-lg">
                Mirror-like lagoons, pastel skies, and feathered pinks — here’s where
                flamingo encounters feel cinematic and ethical.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 md:py-12 leading-relaxed">
        <PlumTip text="Go at sunrise when winds are low — flat water, golden light, and calm birds." />

        <Spot
          i={1}
          name="Flamingo Beach (Renaissance Island)"
          country="Aruba"
          img={imgAruba}
          why={["Shallow, glassy water for iconic shots", "Easy access from resort pier", "Beach club vibe with daybeds"]}
          how={["Stay on the island or get a day pass", "Arrive early for fewer people", "Keep distance; zoom lens > approach"]}
        />
        <Spot
          i={2}
          name="Goto Lake"
          country="Bonaire"
          img={imgBonaire}
          why={["Wild flamingos in pink salt lakes", "Dreamy sunset reflections", "Low crowds, relaxed pace"]}
          how={["Self-drive loop around the lake", "Use pullouts; don’t enter the flats", "Binoculars recommended"]}
        />
        <Spot
          i={3}
          name="Ría Lagartos"
          country="Yucatán, Mexico"
          img={imgYucatan}
          why={["Huge flocks feeding in pastel shallows", "Boat access to remote corners", "Combines well with cenote days"]}
          how={["Hire licensed boat guides", "Pack hat, reef-safe sunscreen", "Respect buffer distances from colonies"]}
        />
        <Spot
          i={4}
          name="Celestún Biosphere Reserve"
          country="Yucatán, Mexico"
          img={imgCelestun}
          why={["Mangrove backdrops + flamingo lines", "Quiet, nature-first experience", "Brilliant golden-hour colors"]}
          how={["Local boat tours at the bridge", "Go early or late for color", "Cash for community-run boats"]}
        />
        <Spot
          i={5}
          name="Lake Nakuru"
          country="Kenya"
          img={imgNakuru}
          why={["Classic pink shores when conditions align", "Big wildlife nearby (rhino, giraffe)", "Safari + flamingos in one park"]}
          how={["Private guide inside the park", "Telephoto lens for shoreline birds", "Avoid peak heat hours"]}
        />
        <Spot
          i={6}
          name="Altiplano Lagunas"
          country="Atacama, Chile"
          img={imgAtacama}
          why={["High-altitude blue lagoons", "Three species sightings possible", "Surreal mountain reflections"]}
          how={["Guided 4x4 to lagunas", "Dress warm; thin, dry air", "Hydrate and pace hikes"]}
        />
        <Spot
          i={7}
          name="Salar de Uyuni"
          country="Bolivia"
          img={imgUyuni}
          why={["Endless mirror effect after rains", "Pink dots against a white-blue world", "Bucket-list photography"]}
          how={["Visit wet season for mirrors", "Professional driver essential", "Protect gear from salt spray"]}
        />
        <Spot
          i={8}
          name="Walvis Bay Lagoon"
          country="Namibia"
          img={imgWalvisBay}
          why={["Vast, photogenic lagoon", "Easy boardwalk viewing", "Pairs with dunes & desert drives"]}
          how={["Stroll the promenade boardwalks", "Morning light is crispest", "Respect roped-off areas"]}
        />

        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-lg md:text-xl font-bold text-slate-900">
            Plan it with PlumTrips ✈️
          </h3>
          <p className="mt-2 text-slate-700">
            We’ll time seasons, tides, and permits — you get effortless, ethical, and beautiful encounters.
          </p>
          <div className="mt-5">
            <a
              href="/go/concierge"
              className="inline-flex items-center rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold shadow hover:bg-[#c2513d] transition"
            >
              Design My Trip
            </a>
          </div>
        </div>
      </main>
    </article>
  );
}
