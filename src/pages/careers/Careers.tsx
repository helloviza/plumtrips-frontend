// apps/frontend/src/pages/careers/Careers.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

/* ================= Brand & Contact ================= */
const BRAND = "#00477f";
const ACCENT = "#d06549";
const SUPPORT_PHONE = "+917065932396";
const SUPPORT_EMAIL = "hello@plumtrips.com";

/* ================= Types ================= */
type Job = {
  id: string;
  title: string;
  team:
    | "Engineering"
    | "Design"
    | "Product"
    | "Operations"
    | "Marketing"
    | "Travel Concierge"
    | "Visa";
  location: "Bengaluru" | "Mumbai" | "Delhi" | "Remote" | "Hybrid";
  type: "Full-time" | "Contract" | "Internship";
  tags: string[];
  description: string;
  about?: string;
  responsibilities?: string[];
  requirements?: string[];
};

/* ================= Sample Roles ================= */
const ROLES: Job[] = [
  {
    id: "fe-react",
    title: "Senior Frontend Engineer (React + TypeScript)",
    team: "Engineering",
    location: "Remote",
    type: "Full-time",
    tags: ["React", "TypeScript", "Tailwind", "Web Perf", "Design Systems"],
    description:
      "Craft high-performance, elegant UIs for PlumTrips & HelloViza. You’ll sweat details, accessibility, and speed.",
    about:
      "Work closely with Design & Product to deliver refined, scalable interfaces that feel inevitable.",
    responsibilities: [
      "Lead complex UI builds with React + TypeScript",
      "Own performance budgets and accessibility standards",
      "Advance our design system / component library",
      "Partner with backend for clean API contracts",
    ],
    requirements: [
      "5+ years building modern web apps",
      "Expert in React + TypeScript",
      "Strong eye for visual polish & UX craft",
    ],
  },
  {
    id: "be-platform",
    title: "Backend Engineer (Node / Platform)",
    team: "Engineering",
    location: "Bengaluru",
    type: "Full-time",
    tags: ["Node", "Postgres", "API", "Security"],
    description:
      "Design reliable, secure services that make complex travel & visa flows effortless.",
    responsibilities: [
      "Design and operate resilient APIs (Node + Postgres)",
      "Model data with clarity; build for correctness and scale",
      "Own observability, monitoring, incident response",
    ],
    requirements: ["4+ years backend/platform", "Node/TypeScript", "SQL mastery"],
  },
  {
    id: "product-designer",
    title: "Product Designer (UI/UX)",
    team: "Design",
    location: "Hybrid",
    type: "Full-time",
    tags: ["UI/UX", "Prototyping", "Design Systems"],
    description:
      "Define the visual language of modern luxury travel—from polished flows to subtle micro-interactions.",
  },
  {
    id: "concierge-luxe",
    title: "Luxury Travel Concierge",
    team: "Travel Concierge",
    location: "Mumbai",
    type: "Full-time",
    tags: ["Itineraries", "HNW Clients", "Detail-oriented"],
    description:
      "Curate rarefied journeys: exquisite stays, bespoke experiences, and seamless service.",
  },
  {
    id: "visa-specialist",
    title: "Visa Specialist (HelloViza)",
    team: "Visa",
    location: "Delhi",
    type: "Full-time",
    tags: ["Operations", "Compliance", "Client Handling"],
    description:
      "Own documentation flows, timelines, and proactive client updates with precision.",
  },
  {
    id: "growth-lead",
    title: "Growth & Partnerships Lead",
    team: "Marketing",
    location: "Remote",
    type: "Full-time",
    tags: ["Partnerships", "Funnels", "Brand"],
    description:
      "Scale PlumTrips with taste—build partnerships, campaigns, and brand moments that resonate.",
  },
];

/* ================= Little UI bits ================= */
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="uppercase tracking-[.22em] text-[12px] font-semibold"
      style={{ color: ACCENT }}
    >
      {children}
    </div>
  );
}
function SectionHeader({
  kicker,
  title,
  sub,
  align = "center",
}: {
  kicker: string;
  title: string;
  sub?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`mx-auto mb-10 ${align === "center" ? "text-center max-w-3xl" : "text-left"}`}>
      <Kicker>{kicker}</Kicker>
      <h2 className="text-3xl md:text-4xl font-extrabold mt-2" style={{ color: BRAND }}>
        {title}
      </h2>
      {sub && <p className="text-slate-600 mt-3 leading-relaxed">{sub}</p>}
    </div>
  );
}
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
      {children}
    </span>
  );
}
function IconCheck() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      className="flex-shrink-0"
      fill="none"
      stroke={ACCENT}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

/* ================= Apply Modal ================= */
function ApplyModal({
  open,
  job,
  onClose,
}: {
  open: boolean;
  job: Job | null;
  onClose: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  if (!open || !job) return null;

  return (
    <div className="fixed inset-0 z-[5000]" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5">
          <div className="border-b p-6">
            <Kicker>Apply — {job.team}</Kicker>
            <h3 className="mt-1 text-2xl font-extrabold" style={{ color: BRAND }}>
              {job.title}
            </h3>
          </div>
          <form
            className="grid gap-4 p-6"
            onSubmit={async (e) => {
              e.preventDefault();
              setSubmitting(true);
              setErr(null);
              setOk(false);
              const form = e.currentTarget as HTMLFormElement;
              const formData = new FormData(form);
              formData.set("roleId", job.id);
              formData.set("roleTitle", job.title);
              try {
                // Implement this endpoint in your API
                const res = await fetch("/api/careers/apply", { method: "POST", body: formData });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                setOk(true);
                form.reset();
              } catch {
                setErr("We couldn’t reach the server. Please email your CV or ping us on WhatsApp.");
              } finally {
                setSubmitting(false);
              }
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Full Name">
                <input
                  name="name"
                  required
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e5e7eb" }}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  name="email"
                  required
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none focus:ring-2"
                  style={{ borderColor: "#e5e7eb" }}
                />
              </Field>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="LinkedIn">
                <input
                  name="linkedin"
                  placeholder="https://linkedin.com/in/…"
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none"
                  style={{ borderColor: "#e5e7eb" }}
                />
              </Field>
              <Field label="Portfolio / GitHub">
                <input
                  name="portfolio"
                  placeholder="https://…"
                  className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none"
                  style={{ borderColor: "#e5e7eb" }}
                />
              </Field>
            </div>
            <Field label="Resume (PDF)">
              <input
                type="file"
                name="resume"
                accept="application/pdf"
                className="mt-1 w-full rounded-xl border px-3 py-2 focus:outline-none"
                style={{ borderColor: "#e5e7eb" }}
              />
            </Field>

            {ok && (
              <div className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
                Thank you! We’ve received your application. We’ll respond within 3–5 business days.
              </div>
            )}
            {err && (
              <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
                {err} —{" "}
                <a className="underline" href={`mailto:${SUPPORT_EMAIL}?subject=Career Application: ${encodeURIComponent(job.title)}`}>
                  Email {SUPPORT_EMAIL}
                </a>{" "}
                or{" "}
                <a className="underline" href={`https://wa.me/${SUPPORT_PHONE.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                  WhatsApp {SUPPORT_PHONE}
                </a>
                .
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button type="button" onClick={onClose} className="rounded-full border px-4 py-2" style={{ borderColor: "#e5e7eb", color: BRAND }}>
                Close
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full px-6 py-2 font-bold text-white shadow"
                style={{ background: ACCENT, boxShadow: "0 10px 20px rgba(208,101,73,.25)" }}
              >
                {submitting ? "Submitting…" : "Submit Application"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700">{label}</label>
      {children}
    </div>
  );
}

/* ================= Page ================= */
export default function Careers() {
  useEffect(() => {
    document.title = "Careers — PlumTrips";
  }, []);

  const [query, setQuery] = useState("");
  const [team, setTeam] = useState<"" | Job["team"]>("");
  const [location, setLocation] = useState<"" | Job["location"]>("");
  const [type, setType] = useState<"" | Job["type"]>("");
  const [open, setOpen] = useState<Job | null>(null);

  const teams = useMemo(() => Array.from(new Set(ROLES.map((r) => r.team))) as Job["team"][], []);
  const locations = useMemo(
    () => Array.from(new Set(ROLES.map((r) => r.location))) as Job["location"][],
    []
  );
  const types = useMemo(() => Array.from(new Set(ROLES.map((r) => r.type))) as Job["type"][], []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ROLES.filter((r) => {
      const byQ =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.tags.join(" ").toLowerCase().includes(q);
      const byT = !team || r.team === team;
      const byL = !location || r.location === location;
      const byTy = !type || r.type === type;
      return byQ && byT && byL && byTy;
    });
  }, [query, team, location, type]);

  // SEO JSON-LD for job postings
  const jobLd = useMemo(() => {
    const items = ROLES.map((j) => ({
      "@type": "JobPosting",
      title: j.title,
      employmentType: j.type,
      industry: "Travel & Hospitality",
      hiringOrganization: { "@type": "Organization", name: "PlumTrips" },
      jobLocationType: j.location === "Remote" ? "TELECOMMUTE" : "ON_SITE",
      jobLocation:
        j.location === "Remote"
          ? undefined
          : [{ "@type": "Place", address: { "@type": "PostalAddress", addressLocality: j.location, addressCountry: "IN" } }],
      description: j.description,
      datePosted: new Date().toISOString().slice(0, 10),
      validThrough: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120).toISOString().slice(0, 10),
    }));
    return JSON.stringify({ "@context": "https://schema.org", "@graph": items });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        {/* Ambient background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(1200px 600px at 20% 10%, #e8f2ff 0%, transparent 60%),
                         radial-gradient(1000px 600px at 100% 0%, #ffe9e2 0%, transparent 60%)`,
          }}
        />
        {/* thin top beam */}
        <div className="absolute inset-x-0 top-0 h-[2px] opacity-80" style={{ background: `linear-gradient(90deg, ${ACCENT}, ${BRAND})` }} />
        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-28">
          <div className="mx-auto max-w-3xl text-center">
            <Kicker>We’re hiring across multiple teams</Kicker>
            <h1 className="mt-3 text-4xl font-extrabold md:text-6xl" style={{ color: BRAND }}>
              Build the future of <span style={{ color: ACCENT }}>luxury travel</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Elegance engineered. Join a team where craft, speed and hospitality meet—across travel, design and technology.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`https://wa.me/${SUPPORT_PHONE.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-5 py-2 font-bold text-white"
                style={{ background: ACCENT, boxShadow: "0 10px 20px rgba(208,101,73,.25)" }}
              >
                Chat on WhatsApp
              </a>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Careers@PlumTrips`}
                className="rounded-full px-5 py-2 font-bold"
                style={{ color: BRAND, border: "1px solid #e5e7eb" }}
              >
                Email {SUPPORT_EMAIL}
              </a>
            </div>
          </div>

          {/* little stat bar */}
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 rounded-2xl border bg-white/80 p-4 text-sm shadow-sm backdrop-blur md:grid-cols-4" style={{ borderColor: "#eef2f7" }}>
            {[
              { k: "Offices", v: "Mumbai • Delhi" },
              { k: "Team", v: "Growing fast" },
              { k: "Work style", v: "Remote-friendly" },
              { k: "Customers", v: "HNW & global travelers" },
            ].map((s) => (
              <div key={s.k} className="text-center">
                <div className="font-extrabold" style={{ color: BRAND }}>
                  {s.v}
                </div>
                <div className="text-slate-500">{s.k}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Why PlumTrips ===== */}
      <section className="mx-auto max-w-7xl px-6 py-14">
        <SectionHeader
          kicker="Why PlumTrips"
          title="Where high standards meet warm hospitality"
          sub="We design products and experiences we’d be proud to use with our own families. You’ll ship with taste, and be supported by people who care."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: "Ownership & Pace", d: "Work with autonomy. Ship fast. No dead weight." },
            { t: "Craft & Taste", d: "We sweat the details—from micro-interactions to white-glove service." },
            { t: "Top-tier Tools", d: "React + TypeScript + Tailwind, modern backend, crisp design systems." },
            { t: "Great People", d: "Low-ego, high-bar teammates who obsess over the customer." },
            { t: "Benefits", d: "Competitive compensation, flexibility, and travel perks." },
            { t: "Impact", d: "Your work goes live in days—not quarters." },
          ].map((p) => (
            <div key={p.t} className="rounded-2xl border bg-white/80 p-6 shadow-sm backdrop-blur-sm transition hover:shadow-md" style={{ borderColor: "#eef2f7" }}>
              <div className="flex items-start gap-3">
                <IconCheck />
                <div>
                  <div className="text-lg font-extrabold" style={{ color: BRAND }}>
                    {p.t}
                  </div>
                  <div className="mt-1 text-slate-600">{p.d}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Open Roles & Filters ===== */}
      <section id="open-roles" className="border-y bg-slate-50/60" style={{ borderColor: "#eef2f7" }}>
        <div className="mx-auto max-w-7xl px-6 py-14">
          <SectionHeader kicker="Open Roles" title="Join a team that builds beautifully" />
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <input
              className="w-full rounded-xl border px-4 py-2 md:w-1/2"
              style={{ borderColor: "#e5e7eb" }}
              placeholder="Search roles, skills, or tags…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <select
                value={team}
                onChange={(e) => setTeam(e.target.value as Job["team"] | "")}
                className="rounded-xl border px-3 py-2"
                style={{ borderColor: "#e5e7eb" }}
              >
                <option value="">All teams</option>
                {teams.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as Job["location"] | "")}
                className="rounded-xl border px-3 py-2"
                style={{ borderColor: "#e5e7eb" }}
              >
                <option value="">All locations</option>
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Job["type"] | "")}
                className="rounded-xl border px-3 py-2"
                style={{ borderColor: "#e5e7eb" }}
              >
                <option value="">All types</option>
                {types.map((ty) => (
                  <option key={ty} value={ty}>
                    {ty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-5">
            {filtered.map((job) => (
              <article key={job.id} className="group overflow-hidden rounded-2xl border bg-white transition hover:shadow-md" style={{ borderColor: "#eef2f7" }}>
                <div className="h-[3px] w-full" style={{ background: `linear-gradient(90deg, ${ACCENT}, ${BRAND})` }} />
                <div className="p-5 md:p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-[12px] font-bold uppercase tracking-widest" style={{ color: ACCENT }}>
                        {job.team} · {job.type}
                      </div>
                      <h3 className="mt-1 text-2xl font-extrabold md:text-3xl" style={{ color: BRAND }}>
                        {job.title}
                      </h3>
                      <p className="mt-2 text-slate-600">{job.description}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Chip>{job.location}</Chip>
                        {job.tags.map((t) => (
                          <Chip key={t}>{t}</Chip>
                        ))}
                      </div>

                      {(job.about || job.requirements || job.responsibilities) && (
                        <details className="mt-4">
                          <summary className="cursor-pointer select-none text-sm font-semibold text-slate-700 hover:text-slate-900">
                            Role details
                          </summary>
                          <div className="mt-3 grid gap-3 text-sm text-slate-700">
                            {job.about && <p>{job.about}</p>}
                            {job.responsibilities?.length ? (
                              <div>
                                <div className="mb-1 font-semibold">Responsibilities</div>
                                <ul className="ml-5 list-disc space-y-1">
                                  {job.responsibilities.map((it) => (
                                    <li key={it}>{it}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                            {job.requirements?.length ? (
                              <div>
                                <div className="mb-1 font-semibold">Requirements</div>
                                <ul className="ml-5 list-disc space-y-1">
                                  {job.requirements.map((it) => (
                                    <li key={it}>{it}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : null}
                          </div>
                        </details>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setOpen(job)}
                        className="rounded-full px-5 py-2 font-bold text-white shadow"
                        style={{ background: ACCENT, boxShadow: "0 10px 20px rgba(208,101,73,.25)" }}
                        aria-label={`Apply to ${job.title}`}
                      >
                        Apply
                      </button>
                      <Link
                        to="#"
                        className="rounded-full px-5 py-2 font-bold"
                        style={{ color: BRAND, border: "1px solid #e5e7eb" }}
                        onClick={(e) => {
                          e.preventDefault();
                          setOpen(job);
                        }}
                        aria-label={`View details for ${job.title}`}
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {filtered.length === 0 && (
              <div className="rounded-2xl border p-8 text-center text-slate-600" style={{ borderColor: "#eef2f7" }}>
                No matching roles right now. Email{" "}
                <a className="underline" href={`mailto:${SUPPORT_EMAIL}?subject=General Application`}>
                  {SUPPORT_EMAIL}
                </a>{" "}
                or WhatsApp{" "}
                <a className="underline" href={`https://wa.me/${SUPPORT_PHONE.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                  {SUPPORT_PHONE}
                </a>
                .
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== Life at PlumTrips (image placeholders) ===== */}
      <section id="life" className="mx-auto max-w-7xl px-6 py-14">
        <SectionHeader
          kicker="Life at PlumTrips"
          title="Quietly beautiful workspaces, calmly ambitious people"
          sub="Drop your own photos in /public/assets/careers/* to replace these elegant placeholders."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {["A", "B", "C", "D", "E", "F"].map((k, i) => (
            <div
              key={k}
              className="aspect-[4/3] w-full rounded-2xl"
              style={{
                background:
                  i % 2
                    ? `linear-gradient(135deg, #f7f7f8 0%, #f0f9ff 40%, #f7f7f8 100%)`
                    : `linear-gradient(135deg, #f7f7f8 0%, #fff4ee 40%, #f7f7f8 100%)`,
              }}
            />
          ))}
        </div>
      </section>

      {/* ===== Values ===== */}
      <section id="values" className="mx-auto max-w-7xl px-6 py-14">
        <SectionHeader
          kicker="Our Values"
          title="Luxury is a standard, not a price point"
          sub="We aim for products that feel inevitable—clear, fast, and quietly beautiful."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { t: "Hospitality", d: "Every interaction should feel considered and kind." },
            { t: "Taste", d: "Refined defaults, strong opinions—then we simplify." },
            { t: "Speed", d: "Momentum compounds. We ship small, often, with care." },
          ].map((v) => (
            <div key={v.t} className="rounded-2xl border bg-white/80 p-6 shadow-sm backdrop-blur-sm transition hover:shadow-md" style={{ borderColor: "#eef2f7" }}>
              <div className="text-lg font-extrabold" style={{ color: BRAND }}>
                {v.t}
              </div>
              <div className="mt-2 text-slate-600">{v.d}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== Hiring Process ===== */}
      <section id="process" className="border-y bg-slate-50/60" style={{ borderColor: "#eef2f7" }}>
        <div className="mx-auto max-w-7xl px-6 py-14">
          <SectionHeader kicker="Process" title="Clear steps, respectful timelines" />
          <ol className="relative mx-auto max-w-3xl space-y-8 border-l border-slate-200 pl-6">
            {[
              { t: "Hello", d: "Intro chat (15–20 min) to align on role & motivation." },
              { t: "Craft", d: "Portfolio/code walkthrough or short task based on your preference." },
              { t: "Deep Dive", d: "Meet future teammates. Focus on collaboration & taste." },
              { t: "Offer", d: "Reference checks, compensation, and start date." },
            ].map((s, i) => (
              <li key={s.t}>
                <span className="absolute -left-[9px] mt-1 h-4 w-4 rounded-full border-2" style={{ borderColor: ACCENT, background: "#fff" }} />
                <div className="font-extrabold" style={{ color: BRAND }}>
                  {i + 1}. {s.t}
                </div>
                <div className="text-slate-600">{s.d}</div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(900px 500px at 20% 120%, #ffe9e2 0%, transparent 60%),
                         radial-gradient(900px 500px at 100% 120%, #e8f2ff 0%, transparent 60%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-6 py-16">
          <div className="rounded-3xl border bg-white/80 p-8 shadow-xl backdrop-blur md:p-10" style={{ borderColor: "#eef2f7" }}>
            <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div>
                <Kicker>Ready to craft what’s next?</Kicker>
                <h3 className="mt-1 text-3xl font-extrabold md:text-4xl" style={{ color: BRAND }}>
                  Don’t see your role? Write to us.
                </h3>
                <p className="mt-2 text-slate-600">Tell us about your superpower and the work you love doing.</p>
              </div>
              <div className="flex gap-3">
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=Open Application@PlumTrips`}
                  className="rounded-full px-6 py-3 font-bold text-white shadow"
                  style={{ background: ACCENT, boxShadow: "0 10px 20px rgba(208,101,73,.25)" }}
                >
                  Email {SUPPORT_EMAIL}
                </a>
                <a
                  href={`https://wa.me/${SUPPORT_PHONE.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full px-6 py-3 font-bold"
                  style={{ color: BRAND, border: "1px solid #e5e7eb" }}
                >
                  WhatsApp {SUPPORT_PHONE}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Apply Modal */}
      <ApplyModal open={!!open} job={open} onClose={() => setOpen(null)} />

      {/* SEO JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jobLd }} />
    </div>
  );
}
