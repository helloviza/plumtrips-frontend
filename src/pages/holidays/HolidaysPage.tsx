import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

type Scope = "International" | "Domestic";
type Category =
  | "Top Destination"
  | "Trending"
  | "International"
  | "Domestic"
  | "Budget";

type PackageCard = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  price: number;
  scope: Scope;
  trending?: boolean;
  href?: string;
};

const HERO_BG = "/assets/holidays/kashmir.jpg";

const BRAND_PRIMARY = "#00477f";
const ACTIVE_HEX = "#d06549";
const TYPEWRITER_COLOR = "#d06549";

const DEST_GLOBAL = [
  "Bali",
  "Dubai",
  "Singapore",
  "Qatar",
  "Georgia",
  "Maldives",
  "Paris",
  "New Zealand",
  "Tokyo",
  "Oman",
];
const DEST_INDIA = [
  "Goa",
  "Kerala",
  "Kashmir",
  "Andaman",
  "Ladakh",
  "Manali",
  "Jaipur",
  "Udaipur",
  "Rishikesh",
  "Coorg",
];
const TYPEWRITER_WORDS = [...DEST_GLOBAL, ...DEST_INDIA];
const LONGEST = TYPEWRITER_WORDS.reduce((a, b) =>
  a.length >= b.length ? a : b
);
const LONGEST_CH = LONGEST.length;

/* ---------- Catalog with fixed images ---------- */
const CATALOG: PackageCard[] = [
  {
    id: "bali",
    title: "Bali Packages",
    subtitle: "Kuta - Ubud - Seminyak",
    price: 29999,
    scope: "International",
    trending: true,
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1400&auto=format&fit=crop",
    href: "/packages/bali",
  },
  {
    id: "dubai",
    title: "Dubai Packages",
    subtitle: "Dubai & Abu Dhabi",
    price: 26999,
    scope: "International",
    trending: true,
    image:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1400&auto=format&fit=crop",
    href: "/packages/dubai",
  },
  {
    id: "singapore",
    title: "Singapore & Malaysia",
    subtitle: "City + Nature",
    price: 56999,
    scope: "International",
    image:
      "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=1400&auto=format&fit=crop",
    href: "/packages/singapore",
  },
  {
    id: "qatar",
    title: "Qatar Packages",
    subtitle: "Doha & Lusail",
    price: 25999,
    scope: "International",
    image:
      "/assets/holidays/qatar_2.jpg",
    href: "/packages/qatar",
  },
  { 
    id: "georgia",
    title: "Georgia Packages",
    subtitle: "Tbilisi & Batumi",
    price: 73999,
    scope: "International",
    image:
      "https://images.unsplash.com/photo-1565008576549-57569a49371d?q=80&w=1400&auto=format&fit=crop",
    href: "/packages/georgia",
  },
  {
    id: "maldives",
    title: "Maldives Overwater",
    subtitle: "Water Villas & Seaplanes",
    price: 37999,
    scope: "International",
    trending: true,
    image:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=1400&auto=format&fit=crop",
    href: "/packages/maldives",
  },
  {
    id: "paris",
    title: "Paris Getaway",
    subtitle: "Louvre - Seine - Montmartre",
    price: 118999,
    scope: "International",
    image:
      "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?q=80&w=1400&auto=format&fit=crop",
    href: "/packages/paris",
  },
  {
    id: "newzealand",
    title: "New Zealand",
    subtitle: "Auckland - Rotorua - Glacier",
    price: 94699,
    scope: "International",
    image:
      "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?q=80&w=1400&auto=format&fit=crop",
    href: "/packages/new-zealand",
  },
  {
    id: "tokyo",
    title: "Japan Highlights",
    subtitle: "Tokyo - Kyoto - Osaka",
    price: 168599,
    scope: "International",
    image:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1400&auto=format&fit=crop",
    href: "/packages/japan",
  },
  {
    id: "oman",
    title: "Oman",
    subtitle: "Muscat & Desert Nights",
    price: 22990,
    scope: "International",
    image:
      "https://images.unsplash.com/photo-1590076215667-875d4ef2d7de?q=80&w=1400&auto=format&fit=crop",
    href: "/packages/oman",
  },
  {
    id: "goa",
    title: "Goa",
    subtitle: "Beaches & Boutique Stays",
    price: 8999,
    scope: "Domestic",
    trending: true,
    image:
      "https://images.unsplash.com/photo-1614082242765-7c98ca0f3df3?q=80&w=1400&auto=format&fit=crop",
    href: "/packages/goa",
  },
  {
    id: "kerala",
    title: "Kerala",
    subtitle: "Backwaters - Munnar - Alleppey",
    price: 15999,
    scope: "Domestic",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1400&auto=format&fit=crop",
    href: "/packages/kerala",
  },
  {
    id: "kashmir",
    title: "Kashmir",
    subtitle: "Gulmarg - Pahalgam - Dal Lake",
    price: 22999,
    scope: "Domestic",
    trending: true,
    image:
      "/assets/holidays/kashmir_2.jpg",
    href: "/packages/kashmir",
  },
  {
    id: "andaman",
    title: "Andaman",
    subtitle: "Havelock - Radhanagar",
    price: 32999,
    scope: "Domestic",
    image:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1400&auto=format&fit=crop",
    href: "/packages/andaman",
  },
  {
    id: "ladakh",
    title: "Ladakh",
    subtitle: "Nubra - Pangong - Monasteries",
    price: 34999,
    scope: "Domestic",
    image:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1400&auto=format&fit=crop",
    href: "/packages/ladakh",
  },
  {
    id: "manali",
    title: "Manali",
    subtitle: "Himalayan Retreat",
    price: 12999,
    scope: "Domestic",
    image:
      "/assets/holidays/manali.jpg",
    href: "/packages/manali",
  },
  {
    id: "jaipur",
    title: "Jaipur",
    subtitle: "Palaces & Pink City",
    price: 11999,
    scope: "Domestic",
    image:
      "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1400&auto=format&fit=crop",
    href: "/packages/jaipur",
  },
  {
    id: "udaipur",
    title: "Udaipur",
    subtitle: "Lakes & Heritage",
    price: 14999,
    scope: "Domestic",
    image:
      "/assets/holidays/udaipur.jpg",
    href: "/packages/udaipur",
  },
  {
    id: "rishikesh",
    title: "Rishikesh",
    subtitle: "Ganga - Yoga - Adventure",
    price: 10999,
    scope: "Domestic",
    image:
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?q=80&w=1400&auto=format&fit=crop",
    href: "/packages/rishikesh",
  },
  {
    id: "coorg",
    title: "Coorg",
    subtitle: "Coffee Hills & Mist",
    price: 12999,
    scope: "Domestic",
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1400&auto=format&fit=crop",
    href: "/packages/coorg",
  },
];

/* ---------- Budget ranges ---------- */
const BUDGET_RANGES: Record<
  Scope,
  { label: string; min: number; max: number }[]
> = {
  Domestic: [
    { label: "Under 15k", min: 0, max: 15000 },
    { label: "15k-30k", min: 15000, max: 30000 },
    { label: "30k-50k", min: 30000, max: 50000 },
    { label: "50k+", min: 50000, max: Number.MAX_SAFE_INTEGER },
  ],
  International: [
    { label: "Under 40k", min: 0, max: 40000 },
    { label: "40k-80k", min: 40000, max: 80000 },
    { label: "80k-1.5L", min: 80000, max: 150000 },
    { label: "1.5L+", min: 150000, max: Number.MAX_SAFE_INTEGER },
  ],
};

const formatINR = (n: number) =>
  n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

/* ---------- Typewriter ---------- */
function useTypewriter(words: string[], typing = 110, deleting = 65, hold = 1600) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"type" | "hold" | "delete">("type");

  useEffect(() => {
    const current = words[index % words.length];
    let id: number;

    const step = () => {
      if (phase === "type") {
        if (text.length < current.length) {
          setText(current.slice(0, text.length + 1));
          id = window.setTimeout(step, typing);
        } else {
          setPhase("hold");
          id = window.setTimeout(step, hold);
        }
      } else if (phase === "hold") {
        setPhase("delete");
        id = window.setTimeout(step, deleting);
      } else {
        if (text.length > 0) {
          setText(current.slice(0, text.length - 1));
          id = window.setTimeout(step, deleting);
        } else {
          setIndex((n) => (n + 1) % words.length);
          setPhase("type");
          id = window.setTimeout(step, typing);
        }
      }
    };

    id = window.setTimeout(step, phase === "type" ? typing : deleting);
    return () => window.clearTimeout(id);
  }, [words, index, text, phase, typing, deleting, hold]);

  return text;
}

/* ---------- Chip UI ---------- */
function Chip({ label, active, onClick }: { label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all",
        active
          ? "text-white shadow-md"
          : "text-white/90 hover:bg-white/15 border border-white/40",
      ].join(" ")}
      style={{ backgroundColor: active ? ACTIVE_HEX : "transparent" }}
    >
      {label}
    </button>
  );
}

/* ---------- Card UI ---------- */
function Card({ pkg }: { pkg: PackageCard }) {
  return (
    <Link to="/go/concierge" className="group block">
      <div className="relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-200 bg-white">
        <div className="relative h-44 w-full">
          <img
            src={pkg.image}
            alt={pkg.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-4 text-white pointer-events-none">
          <div className="text-xs uppercase tracking-widest opacity-90">
            {pkg.scope}
          </div>
          <div className="text-xl font-extrabold drop-shadow-sm leading-6">
            {pkg.title}
          </div>
        </div>
        <div className="relative p-4">
          <div className="text-[13.5px] text-slate-600">{pkg.subtitle}</div>
          <div className="mt-3 text-right text-[13px]">
            <span className="text-slate-500">From&nbsp;</span>
            <span className="font-semibold text-[15px]" style={{ color: BRAND_PRIMARY }}>
              {formatINR(pkg.price)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ---------- Main Page ---------- */
export default function HolidaysPage() {
  const [category, setCategory] = useState<Category>("Top Destination");
  const [budgetScope, setBudgetScope] = useState<Scope>("Domestic");
  const [budgetIndex, setBudgetIndex] = useState(0);

  const typed = useTypewriter(TYPEWRITER_WORDS, 110, 65, 1600);

  const visible = useMemo(() => {
    if (category === "Top Destination") return CATALOG;
    if (category === "Trending") {
      const intl = CATALOG.filter((p) => p.scope === "International" && p.trending).slice(0, 3);
      const dom = CATALOG.filter((p) => p.scope === "Domestic" && p.trending).slice(0, 3);
      return [...intl, ...dom];
    }
    if (category === "International") {
      return CATALOG.filter((p) => p.scope === "International").slice(0, 10);
    }
    if (category === "Domestic") {
      return CATALOG.filter((p) => p.scope === "Domestic").slice(0, 10);
    }
    const r = BUDGET_RANGES[budgetScope][budgetIndex] || BUDGET_RANGES[budgetScope][0];
    return CATALOG.filter((p) => p.scope === budgetScope && p.price >= r.min && p.price <= r.max).slice(0, 12);
  }, [category, budgetScope, budgetIndex]);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section
        className="relative w-full"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,102,161,0.90) 0%, rgba(11,112,180,0.80) 40%, rgba(11,123,200,0.70) 100%)",
        }}
      >
        {/* BG Image */}
        <div
    className="absolute inset-0 bg-center bg-cover bg-no-repeat opacity-70"
    style={{ backgroundImage: `url(${HERO_BG})` }}
  />

        <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-16">
          <h1 className="text-center font-extrabold tracking-tight text-white font-mono">
            <span className="block text-4xl md:text-6xl leading-tight">
              Find your holiday <span className="hidden md:inline">in</span>
            </span>
            <span className="block md:hidden text-2xl mt-2 font-sans">in</span>
            <span
              className="block md:inline font-sans align-baseline border-b"
              style={{
                color: TYPEWRITER_COLOR,
                borderColor: TYPEWRITER_COLOR + "66",
                width: `${LONGEST_CH}ch`,
                display: "inline-block",
                fontSize: "clamp(1.75rem, 5.3vw, 3.75rem)",
                lineHeight: "1.1",
                height: "1.1em",
                minHeight: "1.1em",
                verticalAlign: "baseline",
                whiteSpace: "nowrap",
              }}
            >
              {typed || "\u00A0"}
            </span>
          </h1>

          <div className="mx-auto mt-5 h-1 w-24 rounded-full bg-white/70" />
          <p className="mx-auto mt-4 max-w-3xl text-center text-[#ffffff]">
            Curated escapes, crafted the Plumtrips way - private transfers, hand-picked hotels, thoughtful dining, and experiences you'll talk about for years.
          </p>

          {/* Category Chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {(["Top Destination", "Trending", "International", "Domestic", "Budget"] as Category[]).map((c) => (
              <Chip key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
            ))}
          </div>

          {/* Budget controls */}
          {category === "Budget" && (
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <div className="flex items-center gap-2">
                <span className="text-white/90 text-sm">Scope</span>
                <select
                  className="rounded-full bg-white/95 px-4 py-2 text-sm"
                  value={budgetScope}
                  onChange={(e) => {
                    setBudgetScope(e.target.value as Scope);
                    setBudgetIndex(0);
                  }}
                >
                  <option value="Domestic">Domestic</option>
                  <option value="International">International</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/90 text-sm">Budget</span>
                <select
                  className="rounded-full bg-white/95 px-4 py-2 text-sm"
                  value={budgetIndex}
                  onChange={(e) => setBudgetIndex(Number(e.target.value))}
                >
                  {BUDGET_RANGES[budgetScope].map((r, i) => (
                    <option key={r.label} value={i}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-4 pb-20 mt-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((pkg) => (
            <Card key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </section>
    </main>
  );
}
