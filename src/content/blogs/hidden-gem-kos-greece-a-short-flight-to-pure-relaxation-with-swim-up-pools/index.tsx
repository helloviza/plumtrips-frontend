/* ===== Co-located images ===== */
const cover        = new URL("./cover-kos.jpg", import.meta.url).href;
const imgSwimUp    = new URL("./swim-up-suite.jpg", import.meta.url).href;
const imgZia       = new URL("./zia-village-sunset.jpg", import.meta.url).href;
const imgNisyros   = new URL("./nisyros-caldera.jpg", import.meta.url).href;
const imgAgios     = new URL("./agios-stefanos-beach.jpg", import.meta.url).href;
const imgOldTown   = new URL("./kos-old-town.jpg", import.meta.url).href;
const imgTigaki    = new URL("./tigaki-salt-lake.jpg", import.meta.url).href;

/* ===== Meta for BlogIndex ===== */
export const meta = {
  slug: "hidden-gem-kos-greece-a-short-flight-to-pure-relaxation-with-swim-up-pools",
  title:
    "Hidden Gem Kos, Greece — A Short Flight To Pure Relaxation (With Swim-Up Pools)",
  excerpt:
    "Kos keeps it quiet: white lanes, turquoise coves, and swim-up suites that whisper luxury.",
  tags: ["Greece", "Short Flights", "Pool Suites"],
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
                Swim-up mornings, taverna afternoons, lacework lanes by night — Kos is
                a gentle luxury escape.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 md:py-12 leading-relaxed">
        <PlumTip text="May–June & September = warm water, softer rates, and sunsets that linger." />

        <Block
          title="Swim-Up Suites We Love"
          img={imgSwimUp}
          points={[
            "Adults-only swim-up rooms near sandy bays.",
            "Breakfast on the deck, dip between bites.",
            "Quiet zones away from kids’ pools.",
          ]}
        />
        <Block
          title="Zia Village at Golden Hour"
          img={imgZia}
          points={[
            "Views across the whole island.",
            "Boutique shops and honey tastings.",
            "Book a terrace table for sunset mezze.",
          ]}
        />
        <Block
          title="Boat Day to Nisyros"
          img={imgNisyros}
          points={[
            "Walk the volcanic caldera rim.",
            "Whitewashed lanes in Mandraki.",
            "Seaside lunch; ferry back at dusk.",
          ]}
        />
        <Block
          title="Beaches to Bookmark"
          img={imgAgios}
          points={[
            "Agios Stefanos for ruins + sea.",
            "Tigaki salt lake for flamingo season (quiet viewing).",
            "Kefalos coves for turquoise swims.",
          ]}
        />
        {/* NEW blocks to use remaining images */}
        <Block
          title="Kos Old Town (Evenings)"
          img={imgOldTown}
          points={[
            "Lantern-lit alleys and castle walls.",
            "Slow mezze dinners on leafy squares.",
            "Boutique shops for local olive oils & honey.",
          ]}
        />
        <Block
          title="Tigaki Salt Lake (Seasonal Flamingos)"
          img={imgTigaki}
          points={[
            "Boardwalk viewpoints for quiet birdwatching.",
            "Best light: sunrise or late golden hour.",
            "Combine with a calm beach afternoon nearby.",
          ]}
        />

        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-lg md:text-xl font-bold text-slate-900">
            Plan it with PlumTrips ✈️
          </h3>
          <p className="mt-2 text-slate-700">
            We’ll pick the right swim-up suite, line up ferry times, and secure the
            best golden-hour dining spots.
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
