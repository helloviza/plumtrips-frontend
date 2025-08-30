/* ===== Co-located images ===== */
const cover        = new URL("./cover-hidden-gems.jpg", import.meta.url).href;
const imgCliffSpa  = new URL("./cliffside-spa.jpg", import.meta.url).href;
const imgJungle    = new URL("./jungle-lodge.jpg", import.meta.url).href;
const imgFarmStay  = new URL("./farm-to-fork-stay.jpg", import.meta.url).href;
const imgRiver     = new URL("./river-bend-villa.jpg", import.meta.url).href;
const imgMountain  = new URL("./mountain-retreat.jpg", import.meta.url).href;
const imgSunrise   = new URL("./sunrise-deck.jpg", import.meta.url).href;

/* ===== Meta for BlogIndex ===== */
export const meta = {
  slug: "hidden-gems-resorts-surrounded-by-breathtaking-nature-cuisine-and-relaxation",
  title:
    "Hidden Gems — Resorts Surrounded By Breathtaking Nature, Cuisine & Relaxation",
  excerpt:
    "Forest villas, cliffside spas, and farm-to-fork dinners — true hidden-gem energy.",
  tags: ["Hidden Gems", "Nature", "Wellness"],
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
function Block({
  title,
  img,
  points,
}: {
  title: string;
  img: string;
  points: string[];
}) {
  return (
    <section className="mt-10">
      <h2 className={H.sectionH2}>{title}</h2>
      <div className="mt-4">
        <Shot src={img} alt={title} />
      </div>
      <div className="mt-4 rounded-xl bg-white shadow-sm border p-5">
        <Bullets items={points} />
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
                For travellers who love privacy + scenery: forest villas, cliffside
                spas, and farm-to-fork dinners.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 md:py-12 leading-relaxed">
        <PlumTip text="Ask for sunrise-facing suites — quiet light, birdsong, and breakfast on your terrace." />

        <Block
          title="Cliffside Spa Retreats"
          img={imgCliffSpa}
          points={[
            "Infinity pools that blur into the horizon.",
            "Steam rituals with ocean air.",
            "Couples’ treatments in rock-cut rooms.",
          ]}
        />
        <Block
          title="Jungle Lodges & River Bends"
          img={imgJungle}
          points={[
            "Outdoor showers under canopy shade.",
            "Boardwalks to private river decks.",
            "Nature-first design, low impact.",
          ]}
        />
        <Block
          title="Farm-to-Fork Estate Stays"
          img={imgFarmStay}
          points={[
            "Kitchen gardens, chef tastings, bread still warm.",
            "Local varietals, olive oils, and honeys.",
            "Workshops: pasta, pickles, roasting.",
          ]}
        />
        {/* NEW blocks to use remaining images */}
        <Block
          title="River-Bend Villas"
          img={imgRiver}
          points={[
            "Private decks that hover over slow bends.",
            "Kayak-at-dawn calm with mist on the water.",
            "Outdoor breakfast trays with birdsong.",
          ]}
        />
        <Block
          title="Mountain Retreats"
          img={imgMountain}
          points={[
            "Big-view terraces for sunrise yoga.",
            "Fireplace lounges + stargazing blankets.",
            "Trailheads starting at your front door.",
          ]}
        />
        <Block
          title="Sunrise, Mountains, Silence"
          img={imgSunrise}
          points={[
            "Tea on your deck before the world wakes.",
            "Golden trails with soft views.",
            "Evening stargazing with blankets.",
          ]}
        />

        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-lg md:text-xl font-bold text-slate-900">
            Plan it with PlumTrips ✈️
          </h3>
          <p className="mt-2 text-slate-700">
            Tell us your scenery (cliff, jungle, farm, mountain) and we’ll match you to
            under-the-radar resorts with standout kitchens and soulful calm.
          </p>
          <div className="mt-5">
            <a
              href="/go/concierge"
              className="inline-flex items-center rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold shadow hover:bg-[#c2513d] transition"
            >
              Design My Hidden-Gem Escape
            </a>
          </div>
        </div>
      </main>
    </article>
  );
}
