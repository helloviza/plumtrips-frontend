/* ===== Top 10 Dubai Cruise for Indians =====
   Images:
   - cover-dubai.jpg
   - skyline.jpg
   - ship-pool.jpg
   - abu-dhabi.jpg
   - muscat.jpg
*/
const cover = new URL("./cover-dubai.jpg", import.meta.url).href;
const imgSkyline = new URL("./skyline.jpg", import.meta.url).href;
const imgPool    = new URL("./ship-pool.jpg", import.meta.url).href;
const imgAbu     = new URL("./abu-dhabi.jpg", import.meta.url).href;
const imgMuscat  = new URL("./muscat.jpg", import.meta.url).href;

export const meta = {
  slug: "top-10-dubai-cruise-for-indians",
  title: "Top 10 Dubai Cruise for Indians",
  excerpt:
    "Sail the Middle East with family-friendly ships, visa clarity, and easy flight connections from India.",
  cover,
  tags: ["Cruises", "Dubai", "Middle East"],
};

export default function Page() {
  return (
    <article className="pb-14">
      <header className="relative">
        <img src={cover} alt="" className="h-[42vh] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 mx-auto max-w-4xl px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow">
            Top 10 Dubai Cruise for Indians
          </h1>
          <p className="mt-2 max-w-2xl text-white/90">
            Family-friendly ships, visa clarity, and easy flight connections from India.
          </p>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-4xl px-4 prose prose-slate">
        <p>
          Dubai’s modern cruise terminals and smooth visa processes make it a perfect gateway for first-time cruisers
          from India. Here’s how to pick the right ship, cabin and itinerary—plus our 10 favorite sailings this season.
        </p>

        <Grid img={imgSkyline} title="Best time to cruise" bullets={[
          "Nov–Mar for cooler weather; shoulder months get better pricing.",
          "Avoid New Year week if you want quieter pool decks and value fares.",
          "Fly in a day earlier. We love a quick stay at Jumeirah Beach to settle in.",
        ]}/>

        <Grid img={imgPool} title="Cabins that work for families" bullets={[
          "Balcony cabins mid-ship reduce motion; interconnecting rooms are gold.",
          "On large ships, stick near elevators; those corridors are long.",
          "If budget allows, a suite nets priority boarding and extra dining options.",
        ]}/>

        <Grid img={imgAbu} title="Ports you’ll likely see" bullets={[
          "Abu Dhabi for the Louvre + the Desert Safari.",
          "Sir Bani Yas Island’s beach day is underrated—book a cabana early.",
          "Muscat for corniche sunsets and the souq.",
        ]}/>

        <Grid img={imgMuscat} title="Our top 10 picks" bullets={[
          "7N Gulf Explorer (MSC) — best for kids’ clubs.",
          "5N Short & Sweet (Costa) — quick value sailing.",
          "7N Premium Gulf (Oceania) — foodie heaven.",
          "6N Culture & Coast (Royal) — balanced ports.",
          "7N Arabia Icons (Celebrity) — modern luxury.",
          "5N Beach & Dunes (AIDA) — lively German vibe.",
          "7N Pearl of Arabia (Princess) — classic experience.",
          "6N City & Sea (Norwegian) — entertainment heavy.",
          "7N Luxe Gulf (Regent) — all-inclusive splurge.",
          "4N Weekend Teaser (var.) — great trial run.",
        ]}/>

        <Cta />
      </div>
    </article>
  );
}

function Grid({ img, title, bullets }: { img: string; title: string; bullets: string[] }) {
  return (
    <section className="not-prose mt-8 grid grid-cols-1 gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow md:grid-cols-3">
      <img src={img} alt="" className="h-48 w-full object-cover md:col-span-1" />
      <div className="p-5 md:col-span-2">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">{bullets.map((b) => <li key={b}>{b}</li>)}</ul>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <div className="not-prose mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <p className="text-slate-800">
        Need visa guidance, flights, and a suite on the same booking?
      </p>
      <a href="/go/concierge?from=blog&topic=dubai-cruise"
         className="mt-3 inline-flex rounded-xl bg-[#0b2235] px-4 py-2 font-semibold text-white hover:brightness-110">
        Plan with Concierge
      </a>
    </div>
  );
}
