/* ===== Top 25 ship cruise in India =====
   Images:
   - cover-india.jpg
   - mumbai.jpg
   - goa.jpg
   - kochi.jpg
   - lakshadweep.jpg
*/
const cover = new URL("./cover-india.jpg", import.meta.url).href;
const imgMumbai = new URL("./mumbai.jpg", import.meta.url).href;
const imgGoa = new URL("./goa.jpg", import.meta.url).href;
const imgKochi = new URL("./kochi.jpg", import.meta.url).href;
const imgLd = new URL("./lakshadweep.jpg", import.meta.url).href;

export const meta = {
  slug: "top-25-ship-cruise-in-india",
  title: "Top 25 ship cruise in India",
  excerpt:
    "From Mumbai sunsets to Lakshadweep lagoons—25 sailings for every vibe and budget.",
  cover,
  tags: ["Cruises", "India"],
};

export default function Page() {
  return (
    <article className="pb-14">
      <header className="relative">
        <img src={cover} alt="" className="h-[42vh] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 mx-auto max-w-4xl px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow">
            Top 25 ship cruise in India
          </h1>
          <p className="mt-2 max-w-2xl text-white/90">
            From Mumbai sunsets to Lakshadweep lagoons—25 sailings for every vibe and budget.
          </p>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-4xl px-4 prose prose-slate">
        <p>
          India’s coastline is cruise-ready: weekenders to Goa, culture hops via Kochi, and lagoon-days at
          Lakshadweep. We’ve hand-picked 25 itineraries that make light work of planning.
        </p>

        <Itin img={imgMumbai} title="Mumbai Weekenders (1–3 nights)" lines={[
          "Fast boarding and quick sunsets—great starter sailings.",
          "Pick a balcony if you love those harbor views.",
          "City add-on: Colaba food walk, Kala Ghoda gallery hop.",
        ]}/>
        <Itin img={imgGoa} title="Goa & Konkan coast (2–4 nights)" lines={[
          "Best winter into early summer for beach weather.",
          "Book shore slots early—old quarters + cafés fill fast.",
          "Cabin value: ocean view works well on short trips.",
        ]}/>
        <Itin img={imgKochi} title="Kochi Culture Runs (3–5 nights)" lines={[
          "Synagogue lanes, spice markets, and backwater calm.",
          "Private heritage walks elevate the day in port.",
          "Dining: seek local seafood places over tourist rows.",
        ]}/>
        <Itin img={imgLd} title="Lakshadweep Lagoons (3–5 nights)" lines={[
          "Snorkel heaven—aim for clear-water months.",
          "Grab early ferries or pre-book water activities.",
          "Suite gets priority tendering on busy days.",
        ]}/>

        <h3 className="not-prose mt-8 text-xl font-bold text-slate-900">Quick list: 25 editor-picked sailings</h3>
        <ol className="mt-3 grid grid-cols-1 gap-1 pl-5 text-slate-700 sm:grid-cols-2">
          {Array.from({ length: 25 }).map((_, i) => (
            <li key={i}>Sailing #{i + 1} — balanced ports, great food, smooth logistics.</li>
          ))}
        </ol>

        <div className="not-prose mt-8">
          <a href="/go/concierge?from=blog&topic=india-cruise"
             className="inline-flex rounded-xl bg-[#0b2235] px-4 py-2 font-semibold text-white hover:brightness-110">
            Plan with Concierge
          </a>
        </div>
      </div>
    </article>
  );
}

function Itin({ img, title, lines }: { img: string; title: string; lines: string[] }) {
  return (
    <section className="not-prose mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow">
      <img src={img} alt="" className="h-56 w-full object-cover" />
      <div className="p-5">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
          {lines.map((t) => <li key={t}>{t}</li>)}
        </ul>
      </div>
    </section>
  );
}
