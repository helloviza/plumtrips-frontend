/* ===== Co-located images ===== */
const cover      = new URL("./cover-culinary.jpg", import.meta.url).href;
const imgTokyo   = new URL("./tokyo-ramen.jpg", import.meta.url).href;
const imgNaples  = new URL("./naples-pizza.jpg", import.meta.url).href;
const imgBkk     = new URL("./bangkok-streetfood.jpg", import.meta.url).href;
const imgIstanbul= new URL("./istanbul-mezze.jpg", import.meta.url).href;
const imgCDMX    = new URL("./mexico-tacos.jpg", import.meta.url).href;
const imgBCN     = new URL("./barcelona-tapas.jpg", import.meta.url).href;
const imgMarr    = new URL("./marrakech-tagine.jpg", import.meta.url).href;
const imgLima    = new URL("./lima-ceviche.jpg", import.meta.url).href;
const imgHanoi   = new URL("./hanoi-pho.jpg", import.meta.url).href;
const imgSeoul   = new URL("./seoul-bbq.jpg", import.meta.url).href;

/* ===== Meta for BlogIndex ===== */
export const meta = {
  slug: "10-culinary-delights-from-around-the-world-a-journey-for-your-taste-buds",
  title: "10 Culinary Delights From Around The World — A Journey For Your Taste Buds",
  excerpt:
    "From Tokyo ramen counters to Barcelona tapas bars — the world’s tastiest cities, served the Plum way.",
  tags: ["Food Trips", "City Breaks", "Gen Z"],
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
function CityBlock({
  i, city, country, img, vibe, musts, where, tip,
}: {
  i: number; city: string; country: string; img: string;
  vibe: string; musts: string[]; where: string[]; tip?: string;
}) {
  return (
    <section className="mt-12">
      <h2 className={H.sectionH2}>{i}. {city}, {country}</h2>
      <p className="mt-2 text-slate-600 italic">{vibe}</p>
      <div className="mt-5"><Shot src={img} alt={`${city} food`} /></div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white shadow-sm border p-5">
          <h3 className="font-bold text-slate-900">🍽️ Eat This</h3>
          <Bullets items={musts} />
        </div>
        <div className="rounded-xl bg-white shadow-sm border p-5">
          <h3 className="font-bold text-slate-900">📍 Where To Find It</h3>
          <Bullets items={where} />
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
                Street bites or chef’s menus — these cities prove great taste doesn’t need a fat bill.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <main className="mx-auto max-w-4xl px-4 py-8 md:py-12 leading-relaxed">
        <p className="text-lg text-slate-700">
          Travel tastes better when the food slaps. From midnight noodles to seaside ceviche,
          here’s our **globetrotting menu** of cities where you’ll eat incredibly well — and
          still have budget for that extra dessert. Save these and thank us later. 😋
        </p>

        <PlumTip text="Aim for lunch sets — many top spots serve signature menus at 30–50% less than dinner." />

        <CityBlock
          i={1} city="Tokyo" country="Japan" img={imgTokyo}
          vibe="Neon lanes, tiny ramen bars, immaculate sushi — precision meets comfort."
          musts={[
            "Tonkotsu ramen at a counter-only spot.",
            "Tsukiji/Toyosu sushi breakfast.",
            "7-Eleven egg sando + convenience store dessert run.",
          ]}
          where={[
            "Shinjuku Omoide Yokocho for late-night ramen.",
            "Depachika (food halls) for bento and sweets.",
            "Golden Gai for post-dinner bar hopping.",
          ]}
          tip="Go early or super late for no-wait ramen; cash still wins in small shops."
        />

        <CityBlock
          i={2} city="Naples" country="Italy" img={imgNaples}
          vibe="Pizza’s birthplace — blistered crusts, San Marzano tang, basil perfume."
          musts={[
            "Margherita STG from a wood-fired pizzeria.",
            "Sfogliatella with espresso standing at the bar.",
            "Frittatine di pasta (deep-fried pasta bites).",
          ]}
          where={[
            "Historic pizzerias around Via dei Tribunali.",
            "Caffè counters (al banco) for cheap, perfect espresso.",
            "Seafront spots near Castel dell’Ovo.",
          ]}
          tip="Order ‘margherita’ first — it’s the benchmark; share a second creative pie."
        />

        <CityBlock
          i={3} city="Bangkok" country="Thailand" img={imgBkk}
          vibe="Street food royalty — wok fire, herbal heat, sweet-icy finishes."
          musts={[
            "Pad kra pao (holy basil stir-fry) with a fried egg.",
            "Boat noodles by the canal.",
            "Mango sticky rice at night markets.",
          ]}
          where={[
            "Victory Monument boat noodle alley.",
            "Yaowarat (Chinatown) for grills & sweets.",
            "Ari & Thonglor for café-hopping.",
          ]}
          tip="Look for busy queues + short menus — that’s your green flag."
        />

        <CityBlock
          i={4} city="İstanbul" country="Türkiye" img={imgIstanbul}
          vibe="Mezze spreads, ferry breezes, coffee that lingers — east meets west on a plate."
          musts={[
            "Mezze + grilled fish supper.",
            "Simit + Turkish tea breakfast.",
            "Baklava with kaymak (clotted cream).",
          ]}
          where={[
            "Karaköy & Galata for chic bistros.",
            "Kadıköy market for casual grazing.",
            "Spice Bazaar lanes for sweets.",
          ]}
          tip="Split time: 1 night European side, 1 night Asian side for two food scenes."
        />

        <CityBlock
          i={5} city="Mexico City" country="Mexico" img={imgCDMX}
          vibe="Tortillas on the griddle, salsa bars, avant-garde tasting menus — pick your lane."
          musts={[
            "Tacos al pastor with pineapple.",
            "Blue-corn tlacoyos at markets.",
            "Churros with thick hot chocolate.",
          ]}
          where={[
            "Street stands in Roma/Condesa.",
            "Mercado Medellín or Coyoacán.",
            "Churrerías around El Centro.",
          ]}
          tip="Carry small change; add salsa gradually (they’re hot 🔥)."
        />

        <CityBlock
          i={6} city="Barcelona" country="Spain" img={imgBCN}
          vibe="Tapas and vermut, beach picnics, late dinners — Barcelona runs on flavor."
          musts={[
            "Pan con tomate + anchovies.",
            "Patatas bravas + bombas.",
            "Basque-style cheesecake slice.",
          ]}
          where={[
            "El Born for cozy tapas bars.",
            "La Barceloneta for seafood rice.",
            "Sant Antoni market for snacks.",
          ]}
          tip="Tapas are social — order small, share, reorder favorites."
        />

        <CityBlock
          i={7} city="Marrakech" country="Morocco" img={imgMarr}
          vibe="Spiced tagines, rooftop mint tea, souk aromas — sensory and soulful."
          musts={[
            "Lamb or veggie tagine with preserved lemon.",
            "Harira soup at dusk.",
            "Pastilla (sweet-savory pastry).",
          ]}
          where={[
            "Medina rooftops for sunset dinners.",
            "Food stalls off Jemaa el-Fnaa.",
            "Gueliz for modern Moroccan plates.",
          ]}
          tip="Confirm prices before ordering at stalls; cash helps you bargain respectfully."
        />

        <CityBlock
          i={8} city="Lima" country="Peru" img={imgLima}
          vibe="Ocean-fresh ceviche, Nikkei mashups, pisco perfection."
          musts={[
            "Classic ceviche with leche de tigre.",
            "Aji de gallina (comfort classic).",
            "Chifa (Peruvian-Chinese) stir-fries.",
          ]}
          where={[
            "Barranco & Miraflores for trendy kitchens.",
            "Local cebicherías for midday ceviche (not at night).",
            "Pisco bars for sours + snacks.",
          ]}
          tip="Ceviche is a lunch thing — fish is freshest earlier."
        />

        <CityBlock
          i={9} city="Hanoi" country="Vietnam" img={imgHanoi}
          vibe="Brothy mornings, herb baskets, low stools — pure noodle joy."
          musts={[
            "Phở bò with extra lime & herb add-ins.",
            "Bún chả (grilled pork + noodles).",
            "Egg coffee for dessert vibes.",
          ]}
          where={[
            "Old Quarter for tiny phở shops.",
            "Street corners with sizzling grills.",
            "Hidden cafés up narrow stairwells.",
          ]}
          tip="Sit where the locals sit; finish with hot tea for balance."
        />

        <CityBlock
          i={10} city="Seoul" country="South Korea" img={imgSeoul}
          vibe="BBQ nights, K-snacks, impeccable cafés — energy in every bite."
          musts={[
            "Samgyeopsal (pork belly) BBQ feast.",
            "Tteokbokki (spicy rice cakes).",
            "Bingsu dessert mountains.",
          ]}
          where={[
            "Hongdae for youthy food streets.",
            "Gwangjang Market for classics.",
            "Seongsu for design cafés.",
          ]}
          tip="BBQ hack: let staff handle the grill — perfectly cooked, no stress."
        />

        {/* CTA */}
        <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 shadow-md">
          <h3 className="text-lg md:text-xl font-bold text-slate-900">
            Hungry for a food-forward escape?
          </h3>
          <p className="mt-2 text-slate-700">
            Tell us your vibe (street eats, rooftops, chef’s table) and we’ll craft a
            <strong> deliciously affordable</strong> itinerary — reservations included.
          </p>
          <div className="mt-5">
            <a
              href="/go/concierge"
              className="inline-flex items-center rounded-full bg-[#d06549] px-6 py-3 text-white font-semibold shadow hover:bg-[#c2513d] transition"
            >
              Plan My Tasty Trip
            </a>
          </div>
        </div>
      </main>
    </article>
  );
}
