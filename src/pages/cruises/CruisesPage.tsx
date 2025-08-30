// apps/frontend/src/pages/cruises/CruisesPage.tsx
import { useMemo, useState, type ReactNode } from "react";

/* ===== Co-located images (put these JPGs next to this file) =====
   hero-cruise.jpg
   dest-barcelona.jpg
   dest-rome.jpg
   dest-dubai.jpg
   dest-singapore.jpg
   dest-southampton.jpg
   dest-alaska.jpg
   article-royal.jpg
   article-dubai.jpg
   article-singapore.jpg
   article-top25.jpg
*/
const hero = new URL("./hero-cruise.jpg", import.meta.url).href;
const imgBarcelona = new URL("./dest-barcelona.jpg", import.meta.url).href;
const imgRome = new URL("./dest-rome.jpg", import.meta.url).href;
const imgDubai = new URL("./dest-dubai.jpg", import.meta.url).href;
const imgSingapore = new URL("./dest-singapore.jpg", import.meta.url).href;
const imgSouthampton = new URL("./dest-southampton.jpg", import.meta.url).href;
const imgAlaska = new URL("./dest-alaska.jpg", import.meta.url).href;

const artRoyal = new URL("./article-royal.jpg", import.meta.url).href;
const artDubai = new URL("./article-dubai.jpg", import.meta.url).href;
const artSingapore = new URL("./article-singapore.jpg", import.meta.url).href;
const artTop25 = new URL("./article-top25.jpg", import.meta.url).href;

const ACCENT = "#d06549";

export default function CruisesPage() {
  // simple local state for the faux search panel
  const [goingTo, setGoingTo] = useState("");
  const [departPort, setDepartPort] = useState("");
  const [travelDates, setTravelDates] = useState("");
  const [duration, setDuration] = useState("");
  const [travellers, setTravellers] = useState("2 adults");

  const canSearch = useMemo(
    () => goingTo && departPort && duration,
    [goingTo, departPort, duration]
  );

  const destinations = [
    { img: imgBarcelona, title: "Western Mediterranean from Barcelona", count: "6 cruises" },
    { img: imgRome, title: "Western Mediterranean from Rome", count: "7 cruises" },
    { img: imgDubai, title: "Middle East from Dubai", count: "6 cruises" },
    { img: imgSingapore, title: "Southeast Asia from Singapore", count: "7 cruises" },
    { img: imgSouthampton, title: "Norway & Iceland from Southampton", count: "12 cruises" },
    { img: imgAlaska, title: "Alaska from Seattle", count: "2 cruises" },
  ];

  const partners = [
    "Cunard", "Oceania", "Fred. Olsen", "Azamara", "Viking",
    "Silversea", "MSC", "Emerald", "Avalon", "Uniworld",
    "Celestyal", "AmaWaterways", "Voyages", "CroisiEurope",
  ];

  const faqs = [
    {
      q: "How do I book a cruise online?",
      a: "Choose destination, ship, and dates on PlumTrips, then continue to review your cabin and inclusions. Our concierge finalizes details and secures perks where available.",
    },
    {
      q: "What is included in the cruise price?",
      a: "Your cabin, meals in main restaurants, entertainment, and selected onboard activities. Gratuities, specialty dining, excursions and Wi-Fi vary by line.",
    },
    {
      q: "Can I cancel or change my booking?",
      a: "Yes—each cruise line has its own policy. We surface the terms during checkout, and our team can help with flexible fares when you prefer that safety.",
    },
    {
      q: "Do I need a visa for my cruise?",
      a: "Some itineraries require visas or eTAs. Use our Visa section or ask concierge—we’ll check requirements for every port of call.",
    },
    {
      q: "Can you arrange flights & transfers?",
      a: "Absolutely. We package flights, pre/post stays, private transfers and tours so the whole journey feels seamless.",
    },
  ];

  const articles = [
    { img: artRoyal, title: "Top 4 Royal Caribbean Cruise Singapore", href: "/blogs/top-4-royal-caribbean-cruise-singapore" },
    { img: artDubai, title: "Top 10 Dubai Cruise for Indians", href: "/blogs/top-10-dubai-cruise-for-indians" },
    { img: artSingapore, title: "Top 10 Singapore Cruise for Indians", href: "/blogs/top-10-singapore-cruise-for-indians" },
    { img: artTop25, title: "Top 25 Ship Cruise in India", href: "/blogs/top-25-ship-cruise-in-india" },
  ];

  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      {/* HERO */}
      <section className="relative">
        {/* Keep overflow hidden ONLY on the image wrapper, not the whole section */}
        <div className="relative h-[260px] md:h-[380px] lg:h-[460px]">
          <div className="absolute inset-0 overflow-hidden">
            <img src={hero} alt="" className="h-full w-full object-cover" />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.45) 45%, rgba(246,249,252,1) 95%)",
              }}
            />
          </div>

          <div className="absolute inset-x-0 top-[12%] md:top-[16%]">
            <div className="mx-auto max-w-6xl px-4">
              <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow">
                Your Cruise, Your Way.
              </h1>
              <p className="mt-2 max-w-2xl text-white/90">
                Luxe ships, curated ports, and stress-free planning—handpicked by PlumTrips.
              </p>
            </div>
          </div>
        </div>

        {/* Search panel now OUTSIDE the overflow-hidden container */}
        <div className="relative z-10 -mt-10 md:-mt-12">
          <div className="mx-auto max-w-6xl px-4">
            <div className="rounded-2xl border border-white/30 bg-white/80 backdrop-blur-xl shadow-xl">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 p-3 md:p-4">
                <Select
                  label="Going to"
                  value={goingTo}
                  onChange={setGoingTo}
                  options={[
                    "Select destination",
                    "Mediterranean",
                    "Middle East",
                    "Alaska",
                    "Norway & Iceland",
                    "Southeast Asia",
                  ]}
                />
                <Select
                  label="Departure port"
                  value={departPort}
                  onChange={setDepartPort}
                  options={[
                    "Select",
                    "Barcelona",
                    "Rome",
                    "Dubai",
                    "Singapore",
                    "Southampton",
                    "Seattle",
                  ]}
                />
                <Input
                  label="Travel dates"
                  value={travelDates}
                  onChange={setTravelDates}
                  placeholder="Oct 12–19"
                />
                <Select
                  label="Duration"
                  value={duration}
                  onChange={setDuration}
                  options={["Select", "3–4 nights", "5–7 nights", "8–10 nights", "10+ nights"]}
                />
                <Input label="Travellers" value={travellers} onChange={setTravellers} />
                <div className="flex items-end">
                  <a
                    href={
                      canSearch
                        ? `/go/concierge?from=cruises&to=${encodeURIComponent(
                            goingTo
                          )}&port=${encodeURIComponent(
                            departPort
                          )}&dates=${encodeURIComponent(
                            travelDates
                          )}&duration=${encodeURIComponent(
                            duration
                          )}&pax=${encodeURIComponent(travellers)}`
                        : "#"
                    }
                    onClick={(e) => {
                      if (!canSearch) e.preventDefault();
                    }}
                    className={`w-full inline-flex items-center justify-center rounded-xl px-4 py-3 text-white font-semibold shadow-lg transition
                                ${
                                  canSearch
                                    ? "bg-[#0b2235] hover:brightness-110"
                                    : "bg-slate-400 cursor-not-allowed"
                                }`}
                  >
                    Search
                  </a>
                </div>
              </div>

              {/* advanced row */}
              <div className="flex items-center justify-between px-4 pb-3 text-sm">
                <div className="text-slate-600">
                  <button className="underline underline-offset-4 decoration-slate-300 hover:text-slate-900">
                    Advanced search
                  </button>
                </div>
                <div className="text-slate-500">Best-price protection • Flexible fares • Concierge assist</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* small spacer after overlapping card */}
      <div className="h-10 md:h-12" />

      {/* DESTINATIONS */}
      <section className="mx-auto max-w-6xl px-4">
        <SectionTitle title="Top cruise destinations" subtitle="A quick list if you’re cruising for the first time." />
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinations.map((d) => (
            <DestinationCard key={d.title} img={d.img} title={d.title} count={d.count} />
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="mx-auto max-w-6xl px-4 mt-10 md:mt-14">
        <div className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-6 md:p-8">
          <h3 className="text-xl font-bold text-slate-900">Customer reviews and ratings</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-[220px,1fr] gap-6">
            <div className="rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200 p-5 text-center">
              <div className="text-5xl font-extrabold text-slate-900">4.9</div>
              <div className="mt-1 text-xs text-slate-500">From 457 reviews</div>
              <div className="mt-2 text-[11px] text-slate-500">Google, Instagram and Facebook</div>
              <div className="mt-3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
              <div className="mt-3 text-left space-y-1 text-sm">
                {[
                  { stars: 5, count: 431 },
                  { stars: 4, count: 24 },
                  { stars: 3, count: 3 },
                  { stars: 2, count: 2 },
                  { stars: 1, count: 1 },
                ].map((r) => (
                  <div key={r.stars} className="flex items-center gap-2">
                    <span className="inline-flex text-amber-500">
                      {Array.from({ length: r.stars }).map((_, i) => (
                        <Star key={i} />
                      ))}
                    </span>
                    <div className="h-2 flex-1 rounded bg-slate-200 overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (r.count / 431) * 100)}%` }} />
                    </div>
                    <span className="tabular-nums text-slate-600">{r.count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5 bg-gradient-to-br from-white to-slate-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar />
                  <div>
                    <div className="font-semibold text-slate-900">Ana Paula Chagia</div>
                    <div className="text-xs text-slate-500">India • a month ago</div>
                  </div>
                </div>
                <div className="text-amber-500">
                  <Star />
                  <Star />
                  <Star />
                  <Star />
                  <Star />
                </div>
              </div>
              <p className="mt-3 text-slate-700">
                Grand experience… MSC Grandiosa is a fantastic ship. The PlumTrips concierge was very professional and
                thorough—booked a dreamy suite and secured shore excursions we loved.
              </p>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[imgBarcelona, imgRome, imgDubai, imgSingapore].map((src, i) => (
                  <img key={i} src={src} alt="" className="h-20 w-full object-cover rounded-lg" />
                ))}
              </div>

              <div className="mt-4 text-sm">
                <a className="text-slate-600 underline underline-offset-4 decoration-slate-300 hover:text-slate-900" href="#">
                  View it on Google reviews
                </a>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              View all reviews
            </button>
          </div>
        </div>
      </section>

      {/* Concierge CTA */}
      <section className="mx-auto max-w-6xl px-4 mt-10 md:mt-14">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,360px] gap-5">
          <div className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-6 md:p-8">
            <h3 className="text-xl font-bold text-slate-900">CruiseBot books it. Just a chat away!</h3>
            <p className="mt-2 text-slate-600">
              Find and book your ideal cruise with zero hassle. No app installs, no wait times. Our team handles cabins,
              dining times, excursions and private transfers.
            </p>
            <a
              href="/go/concierge?from=cruises"
              className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#0b2235] px-4 py-3 font-semibold text-white hover:brightness-110"
            >
              Start a chat
            </a>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-white to-slate-50 shadow-xl ring-1 ring-black/5 p-4 md:p-6">
            <div className="h-[200px] w-full rounded-2xl bg-[radial-gradient(ellipse_at_top_left,rgba(208,101,73,.25),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(11,34,53,.15),transparent_50%)]" />
          </div>
        </div>
      </section>

      {/* PARTNERS */}
      <section className="mx-auto max-w-6xl px-4 mt-12 md:mt-16">
        <SectionTitle title="Our cruise partners" />
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {partners.map((p) => (
            <div key={p} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-center text-slate-700 shadow-sm hover:shadow-md">
              {p}
            </div>
          ))}
        </div>
      </section>

      {/* DIFFERENTIATORS */}
      <section className="mx-auto max-w-6xl px-4 mt-12 md:mt-16">
        <SectionTitle title="What makes us different?" />
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <DiffCard icon={<Shield />} title="Best price guarantee" text="We ensure you get the best deal on your cruise, offering unbeatable prices that you won't find anywhere else." />
          <DiffCard icon={<Lightning />} title="Live inventory & confirmations" text="Book your entire cruise journey online with a seamless flow and secure confirmations." />
          <DiffCard icon={<Plane />} title="Cruise + Flights + Hotels + Visa" text="We cover every travel need—routes, suites, dining, tours—so your trip feels silky smooth." />
          <DiffCard icon={<Refund />} title="Up to 100% refund" text="Flexible policies allow changes up to 75 days before sail (varies by cruise line)." />
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-6xl px-4 mt-12 md:mt-16">
        <SectionTitle title="Frequently asked questions" />
        <div className="mt-6 divide-y divide-slate-200 rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
          {faqs.map((f, i) => (
            <FaqItem key={i} {...f} />
          ))}
        </div>
      </section>

      {/* ARTICLES */}
      <section className="mx-auto max-w-6xl px-4 mt-12 md:mt-16 mb-16">
        <div className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-6 md:p-8">
          <h3 className="text-xl font-bold text-slate-900 text-center">Check our articles</h3>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {articles.map((a) => (
              <a key={a.title} href={a.href} className="block overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-lg transition">
                <img src={a.img} alt="" className="h-36 w-full object-cover" />
                <div className="p-4">
                  <h4 className="font-semibold text-slate-900">{a.title}</h4>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-6 text-center">
            <a href="/blogs" className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              See more
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ——— Reusable bits ——— */
function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: ACCENT }} />
        <span className="uppercase tracking-[.14em] text-[.72rem] font-semibold text-slate-500">Cruises</span>
      </div>
      <h2 className="mt-1 text-2xl md:text-3xl font-extrabold text-slate-900">{title}</h2>
      {subtitle ? <p className="mt-1 text-slate-600">{subtitle}</p> : null}
    </div>
  );
}

function DestinationCard({ img, title, count }: { img: string; title: string; count: string }) {
  return (
    <a href={`/go/concierge?from=cruises&to=${encodeURIComponent(title)}`} className="group relative block overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5">
      <img src={img} alt="" className="h-48 w-full object-cover transition group-hover:scale-[1.03]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h4 className="font-semibold text-white drop-shadow">{title}</h4>
        <div className="mt-1 inline-flex items-center gap-2 rounded-full bg-white/85 px-2 py-1 text-xs font-semibold text-slate-800 shadow">
          {count}
        </div>
      </div>
    </a>
  );
}

function DiffCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(208,101,73,.12)", color: ACCENT }}>
          {icon}
        </span>
        <h4 className="font-semibold text-slate-900">{title}</h4>
      </div>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="px-4 md:px-6">
      <button className="flex w-full items-center justify-between py-4 md:py-5 text-left" onClick={() => setOpen(!open)}>
        <span className="font-semibold text-slate-900">{q}</span>
        <span className={`ml-3 inline-flex h-6 w-6 items-center justify-center rounded-full border ${open ? "rotate-45" : ""} transition`}>
          <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" fill="none">
            <path d="M12 5v14M5 12h14" strokeWidth={2} strokeLinecap="round" />
          </svg>
        </span>
      </button>
      {open && <div className="pb-4 md:pb-6 text-slate-600">{a}</div>}
      <div className="h-px bg-slate-200/70" />
    </div>
  );
}

/* tiny icons */
function Star() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M12 17.3l-5.5 3 1.3-6.1-4.6-4 6.2-.6L12 4l2.6 5.6 6.2.6-4.6 4 1.3 6.1z" />
    </svg>
  );
}
function Shield() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
      <path d="M12 3l7 3v6c0 5-3.5 8-7 9-3.5-1-7-4-7-9V6l7-3z" strokeWidth="1.8" />
    </svg>
  );
}
function Lightning() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
      <path d="M13 2L3 14h7l-1 8 12-14h-8l0-6z" strokeWidth="1.8" />
    </svg>
  );
}
function Plane() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
      <path d="M2 16l20-7-8 10v3l-4-3-5 2 2-5-5-2z" strokeWidth="1.8" />
    </svg>
  );
}
function Refund() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
      <path d="M21 12a9 9 0 10-9 9" strokeWidth="1.8" />
      <path d="M9 12h6M12 9v6" strokeWidth="1.8" />
    </svg>
  );
}
function Avatar() {
  return (
    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600 font-bold">
      A
    </span>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-600">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner placeholder:text-slate-400 focus:border-slate-400 focus:outline-none"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-600">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-inner focus:border-slate-400 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o} value={o === "Select destination" || o === "Select" ? "" : o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
