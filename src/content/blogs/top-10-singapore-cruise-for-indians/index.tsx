/* ===== Top 10 Singapore Cruise for Indians =====
   Images:
   - cover-singapore.jpg
   - marina-bay.jpg
   - seaplex.jpg
   - balcony-cabin.jpg
*/
const cover = new URL("./cover-singapore.jpg", import.meta.url).href;
const imgBay = new URL("./marina-bay.jpg", import.meta.url).href;
const imgSea = new URL("./seaplex.jpg", import.meta.url).href;
const imgCabin = new URL("./balcony-cabin.jpg", import.meta.url).href;

export const meta = {
  slug: "top-10-singapore-cruise-for-indians",
  title: "Top 10 Singapore Cruise for Indians",
  excerpt:
    "Easy flights, efficient terminals and headline ships—here’s how to do Singapore sailings right.",
  cover,
  tags: ["Cruises", "Singapore"],
};

export default function Page() {
  return (
    <article className="pb-14">
      <header className="relative">
        <img src={cover} alt="" className="h-[42vh] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 mx-auto max-w-4xl px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow">
            Top 10 Singapore Cruise for Indians
          </h1>
          <p className="mt-2 max-w-2xl text-white/90">
            Easy flights, efficient terminals and headline ships—here’s how to sail smart.
          </p>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-4xl px-4 prose prose-slate">
        <p>
          Singapore is the region’s cruise capital—clean terminals, intuitive boarding, and plenty of
          pre/post fun on land. Build your trip around these ten editor-picked itineraries and tips.
        </p>

        <Block img={imgBay} title="Where to begin" text={[
          "Fly into Changi a day early; stay near Marina Bay for easy transfers.",
          "Pack a day bag for boarding—cabins open later in the afternoon.",
          "Keep passports handy for quick pre-boarding checks.",
        ]}/>

        <Block img={imgSea} title="Ships to look for" text={[
          "Spectrum / Quantum (Royal): action-packed for families.",
          "Resorts World One: shorter fun sailings.",
          "Princess & Celebrity: more premium vibe.",
        ]}/>

        <Block img={imgCabin} title="Cabin picks" text={[
          "Balcony mid-ship = smoothest ride + fresh air.",
          "Obstructed balcony for value (great if you’re out all day).",
          "If splurging: mini-suite for bath + extra storage.",
        ]}/>

        <ul className="mt-6 list-disc pl-6">
          <li>3N Weekend Getaway — “test the waters.”</li>
          <li>4N Phuket + Penang — best starter itinerary.</li>
          <li>5N Malaysia Sprint — mixes beach + city.</li>
          <li>7N Thailand Triangle — beaches, food, temples.</li>
          <li>7N Borneo Edge — more nature, fewer crowds.</li>
          <li>10N Spice Route — deeper ports, food lovers’ pick.</li>
          <li>7N Family Fav — school-holiday friendly.</li>
          <li>8N Premium Isles — Princess/Celebrity vibe.</li>
          <li>5N Value Run — Resorts World One fun.</li>
          <li>7N North Star Views — quintessential Royal moment.</li>
        </ul>

        <div className="not-prose mt-8">
          <a href="/go/concierge?from=blog&topic=singapore-cruise"
             className="inline-flex rounded-xl bg-[#0b2235] px-4 py-2 font-semibold text-white hover:brightness-110">
            Plan with Concierge
          </a>
        </div>
      </div>
    </article>
  );
}

function Block({ img, title, text }: { img: string; title: string; text: string[] }) {
  return (
    <section className="not-prose mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow">
      <img src={img} alt="" className="h-56 w-full object-cover" />
      <div className="p-5">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">{text.map((t) => <li key={t}>{t}</li>)}</ul>
      </div>
    </section>
  );
}
