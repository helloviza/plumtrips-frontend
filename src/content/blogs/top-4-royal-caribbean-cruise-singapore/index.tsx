/* ===== Top 4 Royal Caribbean Cruise Singapore =====
   Files to place in this folder:
   - cover-royal.jpg
   - quantum.jpg
   - spectrum.jpg
   - ovation.jpg
   - anthem.jpg
*/
const cover = new URL("./cover-royal.jpg", import.meta.url).href;
const imgQuantum  = new URL("./quantum.jpg", import.meta.url).href;
const imgSpectrum = new URL("./Spectrum.jpg".toLowerCase(), import.meta.url).href;
const imgOvation  = new URL("./ovation.jpg", import.meta.url).href;
const imgAnthem   = new URL("./anthem.jpg", import.meta.url).href;

export const meta = {
  slug: "top-4-royal-caribbean-cruise-singapore",
  title: "Top 4 Royal Caribbean Cruise — Singapore",
  excerpt:
    "The sleekest ships sailing from Marina Bay: our editor’s shortlist with cabins to book, shows to catch, and sweet-spot dates.",
  cover,
  tags: ["Cruises", "Singapore", "Royal Caribbean"],
};

export default function Page() {
  return (
    <article className="pb-14">
      {/* HERO */}
      <header className="relative">
        <img src={cover} alt="" className="h-[42vh] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-0 right-0 mx-auto max-w-4xl px-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow">
            Top 4 Royal Caribbean Cruise — Singapore
          </h1>
          <p className="mt-2 max-w-2xl text-white/90">
            The sleekest ships sailing from Marina Bay: cabins to book, shows to catch, and sweet-spot dates.
          </p>
        </div>
      </header>

      <div className="mx-auto mt-8 max-w-4xl px-4 prose prose-slate">
        <p>
          Royal Caribbean’s Asia roster is a dream for first-timers and cruise nerds alike. Think skydiving simulators,
          bumper cars, surf-riders, and those nightly production shows that feel Broadway-big. Here’s our shortlist.
        </p>

        <Ship
          img={imgSpectrum}
          name="Spectrum of the Seas — 3 to 5 nights"
          why={[
            "Best for families: SeaPlex, kids’ clubs, Royal Promenade vibes.",
            "Dining wins: Teppanyaki, Wonderland (book early), and Izumi.",
            "Cabin pick: Ultra Spacious Ocean View for families; Balcony mid-ship deck 10–12 for couples.",
          ]}
          tips="Avoid school holidays if you want quieter pools; book specialty dining before sail."
        />

        <Ship
          img={imgQuantum}
          name="Quantum of the Seas — 4 to 7 nights"
          why={[
            "North Star capsule views and Two70 shows—signature Quantum-class moments.",
            "Itineraries often include Phuket or Penang—great starter ports.",
            "Cabin pick: Junior Suite cat J3 for lounge access without breaking the bank.",
          ]}
          tips="Pick My Time Dining if you want flexibility around show schedules."
        />

        <Ship
          img={imgOvation}
          name="Ovation of the Seas — seasonal highlights"
          why={[
            "Glass-walled Solarium is bliss on sea days.",
            "Entertainment is polished; grab show seats 30–40 min early.",
            "Cabin pick: Obstructed Balcony for value; owners suite when splurging.",
          ]}
          tips="Watch for repositioning deals shoulder-season—big value with cooler weather."
        />

        <Ship
          img={imgAnthem}
          name="Anthem of the Seas — limited Asia calls"
          why={[
            "Top-tier production shows (We Will Rock You on many sailings).",
            "SeaPlex + FlowRider keep teens very happy.",
            "Cabin pick: Spacious Balcony or a roomy interior with virtual balcony screens.",
          ]}
          tips="Check visa needs early if your itinerary ticks multiple countries."
        />

        <Callout />
      </div>
    </article>
  );
}

/* helpers */
function Ship({
  img,
  name,
  why,
  tips,
}: {
  img: string;
  name: string;
  why: string[];
  tips: string;
}) {
  return (
    <section className="not-prose mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow">
      <img src={img} alt="" className="h-56 w-full object-cover" />
      <div className="p-5">
        <h3 className="text-xl font-bold text-slate-900">{name}</h3>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-slate-700">
          {why.map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <strong className="font-semibold">Plum tip:</strong> {tips}
        </div>
      </div>
    </section>
  );
}

function Callout() {
  return (
    <div className="not-prose mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <p className="text-slate-800">
        Want us to hold a balcony or suite and sort flights + transfers in one go?
      </p>
      <a
        href="/go/concierge?from=blog&topic=royal-singapore"
        className="mt-3 inline-flex rounded-xl bg-[#0b2235] px-4 py-2 font-semibold text-white hover:brightness-110"
      >
        Plan with Concierge
      </a>
    </div>
  );
}
