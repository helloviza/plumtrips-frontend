/* ===== Co-located images (same folder as this file) ===== */
const cover       = new URL("./cover-affordable-trips.jpg", import.meta.url).href;
const imgBudapest = new URL("./budapest.jpg", import.meta.url).href;
const imgLisbon   = new URL("./lisbon.jpg", import.meta.url).href;
const imgPrague   = new URL("./prague.jpg", import.meta.url).href;
const imgKrakow   = new URL("./krakow.jpg", import.meta.url).href;
const imgSofia    = new URL("./sofia.jpg", import.meta.url).href;
const imgValencia = new URL("./valencia.jpg", import.meta.url).href;
const imgPorto    = new URL("./porto.jpg", import.meta.url).href;
const imgAthens   = new URL("./athens.jpg", import.meta.url).href;
const imgEdinburgh= new URL("./edinburgh.jpg", import.meta.url).href;
const imgIstanbul = new URL("./istanbul.jpg", import.meta.url).href;

/* ===== Meta for BlogIndex ===== */
export const meta = {
  slug: "10-affordable-trips-you-can-book-through-plumtrips",
  title: "10 Affordable Trips You Can Book Through PlumTrips",
  excerpt:
    "From boutique hostels in Budapest to sunset escapes in Lisbon, here’s your Gen Z-friendly guide to 10 pocket-smart adventures without compromising luxury.",
  tags: ["Gen Z", "Luxury Travel", "Budget Chic"],
  cover,
};

/* ===== Small UI helpers ===== */
const H = {
  heroTitle: "text-2xl md:text-4xl font-extrabold text-white drop-shadow",
  sectionH2: "text-2xl md:text-3xl font-extrabold text-[#00477f]",
};

const PlumTip = ({ text }: { text: string }) => (
  <div className="mt-3 rounded-xl bg-[#d06549]/10 px-4 py-3 text-sm text-[#d06549] font-semibold">
    💡 PlumTip: {text}
  </div>
);

function SectionImage({ src, alt }: { src: string; alt: string }) {
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

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 list-disc pl-5 text-slate-700">
      {items.map((t) => (
        <li key={t} className="mb-1 leading-relaxed">{t}</li>
      ))}
    </ul>
  );
}

function CityBlock({
  i, city, country, image, vibe, stays, dos, tip,
}: {
  i: number; city: string; country: string; image: string;
  vibe: string; stays: string[]; dos: string[]; tip?: string;
}) {
  return (
    <section className="mt-12">
      <h2 className={H.sectionH2}>{i}. {city}, {country}</h2>
      <p className="mt-2 text-slate-600 italic">{vibe}</p>
      <div className="mt-5">
        <SectionImage src={image} alt={`${city}, ${country}`} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white shadow-sm border p-5">
          <h3 className="font-bold text-slate-900">🏨 Stays We Love</h3>
          <BulletList items={stays} />
        </div>
        <div className="rounded-xl bg-white shadow-sm border p-5">
          <h3 className="font-bold text-slate-900">🎒 Must-Do Experiences</h3>
          <BulletList items={dos} />
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/10" />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-4xl px-4 pb-8 md:pb-12">
              <h1 className={H.heroTitle}>{meta.title}</h1>
              <p className="mt-3 max-w-2xl text-white/90 text-base md:text-lg">
                Stylish escapes, Insta-worthy vibes & budget-chic stays — crafted for Gen Z & new-age travellers.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:py-12 leading-relaxed">
        <p className="text-lg text-slate-700">
          You want adventures ✈️, but without breaking the bank? Welcome to PlumTrips’
          <span className="font-semibold text-[#00477f]"> Budget-Chic Collection</span> — curated escapes where
          <strong> luxury meets affordability</strong>. Think boutique stays, rooftop cafés, street food that slaps,
          and sunsets you’ll want to post.
        </p>

        <PlumTip text="Save up to 40% when you book weekdays instead of weekends." />

        <CityBlock
          i={1} city="Budapest" country="Hungary" image={imgBudapest}
          vibe="Thermal baths, ruin bars & sunset river walks — Budapest blends boho & boujee like nowhere else."
          stays={[
            "Rooftop boutique hotels by the Danube.",
            "Design-forward lofts in District VII.",
            "Soulful B&Bs near Castle Hill.",
          ]}
          dos={[
            "Thermal spa hopping (Széchenyi + Rudas).",
            "Sunset cocktails at Fisherman’s Bastion.",
            "Night walks along the Danube Promenade.",
          ]}
          tip="Best months: April & September — mild weather + off-peak rates."
        />

        <CityBlock
          i={2} city="Lisbon" country="Portugal" image={imgLisbon}
          vibe="Pastel streets, rooftop brunches & trams through tiled alleys — Lisbon’s sunshine is unmatched."
          stays={[
            "Airy lofts with Tagus views.",
            "Alfama guesthouses with insta corners.",
            "Chic pods near Bairro Alto nightlife.",
          ]}
          dos={[
            "Ride Tram 28 for the ultimate reel.",
            "Pastéis de Nata tasting crawl.",
            "Pink Street nightlife + rooftop sunsets.",
          ]}
          tip="Don’t miss LX Factory — Lisbon’s creative hub for coffee, art & thrift finds."
        />

        <CityBlock
          i={3} city="Prague" country="Czech Republic" image={imgPrague}
          vibe="Fairytale bridges, Gothic alleys & 24/7 café culture — Prague is for dreamers on a budget."
          stays={[
            "Stone-house Airbnbs near Old Town Square.",
            "Art deco hotels around Charles Bridge.",
            "Vintage guesthouses in Malá Strana.",
          ]}
          dos={[
            "Sunrise photos on Charles Bridge 🌅.",
            "Explore Prague Castle like royalty.",
            "Kafka Museum + hidden courtyard cafés.",
          ]}
          tip="Book weekdays for 35% cheaper stays."
        />

        <CityBlock
          i={4} city="Krakow" country="Poland" image={imgKrakow}
          vibe="Medieval charm, student energy & affordable eats — Krakow is a budget favorite."
          stays={[
            "Modern rooms near Main Square.",
            "Kazimierz boutique stays by the boho quarter.",
            "Contemporary new-town guesthouses.",
          ]}
          dos={[
            "Wawel Castle & Cathedral.",
            "Kościuszko Mound / Kazimierz lanes.",
            "Auschwitz Memorial day trip.",
          ]}
          tip="Winter markets are magical (and cheaper) — carry warm layers."
        />

        <CityBlock
          i={5} city="Sofia" country="Bulgaria" image={imgSofia}
          vibe="Old-meets-new capital with mountain backdrops, cafés and cathedrals."
          stays={[
            "Design hotels with cathedral views.",
            "Friendly B&Bs in student zones.",
            "Central guesthouses on quiet streets.",
          ]}
          dos={[
            "Alexander Nevsky Cathedral & Roman ruins.",
            "Vitosha Boulevard promenades.",
            "National Museum of History.",
          ]}
          tip="Day-trip to Vitosha Mountain for easy hikes & city panoramas."
        />

        <CityBlock
          i={6} city="Valencia" country="Spain" image={imgValencia}
          vibe="Beach mornings, orange afternoons & paella evenings — Valencia is sunshine therapy."
          stays={[
            "Beach apartments near City of Arts & Sciences.",
            "North Malvarrosa B&Bs — clean, fair, linear.",
            "Old-town guesthouses by the centre.",
          ]}
          dos={[
            "Cycle Turia Gardens.",
            "Paella in its birthplace.",
            "Relax at Malvarrosa Beach.",
          ]}
          tip="Rent bikes — Valencia is perfectly flat and cycle-friendly."
        />

        <CityBlock
          i={7} city="Porto" country="Portugal" image={imgPorto}
          vibe="Tile-lined streets, river balconies & cosy wine lodges — Porto is a vibe."
          stays={[
            "Douro-facing pensões with balconies.",
            "Boutique B&Bs near Clérigos & Ribeira.",
            "Design hostels with private rooms at sharp rates.",
          ]}
          dos={[
            "Rabelo boat ride on the Douro.",
            "Livraria Lello & Clérigos Tower.",
            "Port wine lodges across the river.",
          ]}
          tip="Cross Dom Luís I Bridge at sunset for golden hour views."
        />

        <CityBlock
          i={8} city="Athens" country="Greece" image={imgAthens}
          vibe="Ancient wonders + rooftop bars + street food = iconic city break."
          stays={[
            "Neoclassical guesthouses in Plaka/Koukaki.",
            "Micro-hotels near Syntagma & café lanes.",
            "Budget-bright stays with rooftop Acropolis views.",
          ]}
          dos={[
            "Acropolis Museum & Parthenon.",
            "Anafiotika lanes + rooftop sunset.",
            "Central market tastings + mezze crawl.",
          ]}
          tip="Go early to the Acropolis, then brunch on a rooftop nearby."
        />

        <CityBlock
          i={9} city="Edinburgh" country="Scotland" image={imgEdinburgh}
          vibe="Storybook hills, cobbled lanes & writers’ cafés — cozy, cultured, camera-ready."
          stays={[
            "Classic townhouses with hill views.",
            "Arts-rich guest homes, hearty breakfasts.",
            "Old Town value rooms (shoulder-season sweet spot).",
          ]}
          dos={[
            "Royal Mile & Edinburgh Castle.",
            "Arthur’s Seat hike.",
            "Writers’ Museum + vintage bookshops.",
          ]}
          tip="Pack a windproof layer — weather changes fast."
        />

        <CityBlock
          i={10} city="İstanbul" country="Türkiye" image={imgIstanbul}
          vibe="Spice markets by day, Bosphorus breeze by night — a sensory city made for night walks."
          stays={[
            "Karaköy studios; Bosphorus vibe.",
            "Hammam-adjacent B&Bs in Cihangir.",
            "Chic pensions near Galata at enviable rates.",
          ]}
          dos={[
            "Hagia Sophia & Blue Mosque.",
            "Ferry across the Bosphorus.",
            "Kadıköy food walk & third-wave coffee stops.",
          ]}
          tip="Split your stay: 1 night on each side of the Bosphorus for two vibes."
        />

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-lg md:text-xl font-bold text-slate-900">
            Plan It Your Way, The PlumTrips Way ✈️
          </h3>
          <p className="mt-2 text-slate-700">
            Whether you’re chasing rooftops in Lisbon or street food in İstanbul, our designers craft
            <strong> exclusive itineraries</strong> that are big on vibes and light on budget.
          </p>
          <div className="mt-5">
            <a
              href="/go/concierge"
              className="inline-flex items-center rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold shadow hover:bg-[#c2513d] transition"
            >
              Start My Trip
            </a>
          </div>
        </div>
      </main>
    </article>
  );
}
