// apps/frontend/src/pages/About.tsx
import "../index.css";
import { useState, useEffect, useRef } from "react";
import bannerImg from "../assets/flights.jpeg";
import bgImage from "../assets/flights1.jpeg";


// ── Types ────────────────────────────────────────────────────────────────────
interface PhilCard { num: string; tag: string; title: string; desc: string; }
interface VmCard { label: string; title: string; p1: string; p2: string; accent: string; }
interface ServeFeature { text: string; }
interface ServeCard { badge: string; badgeColor: string; title: string; desc: string; features: ServeFeature[]; }
interface IntelFeature { icon: string; title: string; desc: string; }
interface TeamCard { icon: string; title: string; desc: string; }
interface RoadmapItem { status: string; title: string; desc: string; live?: boolean; }

// ── Data ─────────────────────────────────────────────────────────────────────
const PHIL_CARDS: PhilCard[] = [
  { num: "01", tag: "User-first", title: "Every screen built for real people", desc: "Every interface designed around how real people travel — not how backend systems work. Clarity at every tap." },
  { num: "02", tag: "Travel Ecosystem", title: "B2B + B2C, one platform", desc: "One unified platform for individual travellers and enterprise travel teams alike. No silos, no switching." },
  { num: "03", tag: "AI-enabled", title: "pluto.ai handles complexity", desc: "pluto.ai handles complexity so you get clarity, speed, and smarter choices — without the cognitive overhead." },
];

const VM_CARDS: VmCard[] = [
  {
    label: "Our Vision", accent: "#0ea5e9",
    title: "The most trusted travel platform — for everyone.",
    p1: "We're building an experience-led platform for travellers and businesses — one where every journey feels intelligently designed, deeply considered, and simple to manage.",
    p2: "Think of it as a trusted global advisor — an intelligent co-pilot that rapidly shows you what matters most, whether you're booking a beach trip or a quarterly offsite.",
  },
  {
    label: "Our Mission", accent: "#14b8a6",
    title: "Human expertise, amplified by AI that actually shows up.",
    p1: "We're building a trusted travel stack that blends human expertise with AI — giving travellers and B2B partners smarter workflows and support that shows up precisely when plans change.",
    p2: "Our mission: make trip planning genuinely good — with real-time safety, clarity, and meaningful experiences.",
  },
];

const FRICTIONS = [
  "Scattered tools for flights, hotels, visas and support",
  "Decisions buried in hundreds of chat workflows",
  "Bookings that feel fine — until something goes wrong",
  "Fare rules and policy mazes printed in dense jargon",
  "Briefings that land too late, advice that arrives too slow",
];

const SERVE_CARDS: ServeCard[] = [
  {
    badge: "For Travellers", badgeColor: "#818cf8",
    title: "Your trip, your way. Smarter at every step.",
    desc: "Stop juggling tabs and guessing at deals. Plumtrips brings flights, hotels, holidays, and experiences into one intelligent platform with an AI co-pilot that finds better options, catches problems early, and keeps your plans on track.",
    features: [
      { text: "AI finds smarter options instantly — no endless searching" },
      { text: "Real-time alerts for delays, price drops and itinerary changes" },
      { text: "Budget-aware recommendations with no hidden surprises" },
      { text: "Plans that adapt in real-time when things change" },
      { text: "Human support when the AI isn't enough" },
    ],
  },
  {
    badge: "For Businesses", badgeColor: "#14b8a6",
    title: "Travel operations, finally under control.",
    desc: "From startups to enterprise — Plumtrips gives your travel team policy-compliant bookings, complete spend visibility, and an AI co-pilot that handles complexity so your people focus on what matters.",
    features: [
      { text: "Intelligent multi-modal booking with zero vendor juggling" },
      { text: "Policy automation — no manual enforcement needed" },
      { text: "Structured reporting and data reliability for CFOs and auditors" },
      { text: "Concierge tools for groups, MICE, and large event travel" },
      { text: "Dedicated support with SLA-backed reliability" },
    ],
  },
];

const INTEL_FEATURES: IntelFeature[] = [
  { icon: "🔍", title: "Scans options at scale", desc: "Rapidly surfaces the best flights, hotels, and packages across thousands of combinations." },
  { icon: "📋", title: "Simplifies rules", desc: "Translates complex fare rules, visa requirements, and travel policies into plain language." },
  { icon: "⚖️", title: "Highlights trade-offs", desc: "Shows you what matters — price vs. flexibility, speed vs. comfort — so you decide with clarity." },
  { icon: "🔔", title: "Proactive disruption alerts", desc: "Detects delays, cancellations, and policy breaches before they become problems." },
];

const TEAM_CARDS: TeamCard[] = [
  { icon: "✈️", title: "Travel Industry Depth", desc: "Ex-airline, OTA, and travel agency veterans who know the system inside out." },
  { icon: "🎨", title: "Product & UX Mindset", desc: "Consumer and B2B product leaders who've shipped products millions rely on daily." },
  { icon: "🤖", title: "AI & Data Science", desc: "Strong foundation in applied ML, responsible AI, and decision-making systems." },
  { icon: "🌍", title: "Global Operators", desc: "Team that has lived and worked across multiple continents — not just read about it." },
  { icon: "🛂", title: "The Visa Strategist", desc: "Lives inside embassy updates and checklists so travellers don't have to." },
  { icon: "📊", title: "Finance & Compliance", desc: "CFO-grade thinkers ensuring every booking is audit-ready and policy-compliant." },
];

const ROADMAP: RoadmapItem[] = [
  { status: "Live now", live: true, title: "AI-powered trip planning for travellers", desc: "Personal trip builder with real-time flight, hotel, and experience recommendations." },
  { status: "Coming soon", title: "B2B travel management dashboard", desc: "Centralised corporate booking, policy enforcement, and spend reporting for travel managers." },
  { status: "In progress", title: "pluto.ai reasoning upgrades", desc: "Deeper contextual awareness, multi-stop trip logic, and smarter disruption handling." },
  { status: "Coming soon", title: "Groups & MICE module", desc: "Dedicated tools for group travel, conferences, and incentive travel programmes." },
  { status: "Planned", title: "ERP & expense tool integrations", desc: "Native sync with SAP Concur, Navan, Workday, and other enterprise finance stacks." },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(28px)",
      transition: `opacity 0.6s ${delay}s ease, transform 0.6s ${delay}s ease`,
    }}>
      {children}
    </div>
  );
}

// ── Styles object ─────────────────────────────────────────────────────────────
const S = {
  // colors
  teal: "#2563eb",
  tealLight: "#3b82f6",
  tealDark: "#1d4ed8",

  navy: "#ffffff",
  navyMid: "#f8fbff",
  navyLight: "#eef4ff",

  white: "#0f172a",
  offWhite: "#1e293b",
  muted: "#475569",

  border: "rgba(59,130,246,0.12)",
  cardBg: "#ffffff",
};

// ── Components ────────────────────────────────────────────────────────────────

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0.9rem 3rem",
      background: scrolled ? "rgba(10,22,40,0.95)" : "rgba(10,22,40,0.75)",
      backdropFilter: "blur(18px)",
      borderBottom: `1px solid ${S.border}`,
      transition: "background 0.3s",
    }}>
      <div style={{ fontFamily: "'Unbounded', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: S.white, letterSpacing: "-0.03em" }}>
        plum<span style={{ color: S.tealLight }}>trips</span>
      </div>
      <ul style={{ display: "flex", gap: "2rem", listStyle: "none", margin: 0, padding: 0 }}>
        {["About", "Vision", "Who we serve", "Team", "Roadmap"].map(l => (
          <li key={l}>
            <a href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
              style={{ color: S.muted, textDecoration: "none", fontSize: "0.86rem", fontWeight: 400, transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = S.tealLight)}
              onMouseLeave={e => (e.currentTarget.style.color = S.muted)}
            >{l}</a>
          </li>
        ))}
      </ul>
      <a href="#cta" style={{
        background: `linear-gradient(135deg, ${S.tealDark}, ${S.teal})`,
        color: S.white, padding: "0.5rem 1.2rem", borderRadius: "6px",
        fontSize: "0.84rem", fontWeight: 600, textDecoration: "none",
        boxShadow: "0 0 14px rgba(13,148,136,0.4)", transition: "box-shadow 0.2s",
      }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 24px rgba(13,148,136,0.65)")}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 14px rgba(13,148,136,0.4)")}
      >Plan my trip →</a>
    </nav>
  );
}

function Hero() {
  return (
    <section className="hero" style={{
      position: "relative", zIndex: 2, minHeight: "105vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", overflow: "hidden", textAlign: "center", padding: "4rem"
    }}>
      {/* Teal gradient background blobs */}
      <div style={{
        backgroundImage: `url(${bannerImg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", position: "absolute", inset: 0, zIndex: -3, filter: "brightness(0.28) contrast(1.18) saturate(1.01)", transform: "scale(1.04)",
      }} />
      <div style={{
        position: "absolute", inset: 0, background: "rgba(255,255,255,0.045)", zIndex: -1
      }} />
      {/* Decorative grid lines */}
      <div style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(circle at top right, rgba(59,130,246,0.22), transparent 28%)",
        zIndex: -1,
        pointerEvents: "none",
      }} />

      <div style={{
        display: "inline-flex", alignItems: "center", gap: "0.5rem",
        background: "rgba(13,148,136,0.15)", border: `1px solid rgba(13,148,136,0.35)`,
        borderRadius: "100px", padding: "0.35rem 1rem",
        fontSize: "0.75rem", letterSpacing: "0.12em", color: S.tealLight,
        textTransform: "uppercase", fontWeight: 600, marginBottom: "1.8rem",
        animation: "fadeUp 0.7s ease both",
      }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: S.tealLight, display: "inline-block" }} />
        About Plumtrips
      </div>

      <h1 style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: "clamp(2.6rem,5vw,5.2rem)",
        fontWeight: 800,
        lineHeight: 0.95,
        letterSpacing: "-0.06em",
        color: "#ffffff",
        maxWidth: "1200px",
        textAlign: "center",
        margin: "0 auto",
        padding: "5rem 1rem 1rem",
        textShadow: "0 8px 40px rgba(0,0,0,0.5)",
      }}
      >
        Travel designed by humans,
        <br />
        <span
          style={{
            color: "#3b82f6",
            textShadow: "0 0 20px rgba(37,99,235,0.28)",
          }}
        >
          supercharged by AI
        </span>
      </h1>

      <p style={{
        maxWidth: 720, color: "rgba(255,255,255,0.82)", fontSize: "1.12rem", marginTop: "1.2rem",
        lineHeight: 1.8, animation: "fadeUp 0.8s 0.2s ease both", textAlign: "center", fontWeight: 400,
      }}>
        Plumtrips makes every journey feel effortless — whether you're a solo explorer booking a last-minute getaway or a travel manager overseeing 500 corporate trips.
      </p>

      <div style={{ display: "flex", gap: "1rem", marginTop: "2.5rem", flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.8s 0.3s ease both" }}>
        <a href="#who-we-serve" style={{ background: `linear-gradient(135deg, ${S.tealDark}, ${S.teal})`, color: "#ffffff", padding: "0.75rem 2rem", borderRadius: "8px", fontSize: "0.93rem", fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 20px rgba(13,148,136,0.35)" }}>
          Plan my trip →
        </a>
        <a href="#vision" style={{
          background: "linear-gradient(135deg, #2563eb, #3b82f6)", color: "#ffffff", padding: "0.75rem 2rem", borderRadius: "8px",
          fontSize: "0.93rem", fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 18px rgba(59,130,246,0.35)", display: "inline-flex", alignItems: "center", gap: "0.5rem",
        }}>
          See how it works →
        </a>
      </div>

      <div style={{ display: "flex", gap: "2.5rem", marginTop: "3.5rem", flexWrap: "wrap", justifyContent: "center", animation: "fadeUp 0.8s 0.4s ease both" }}>
        {["End-to-end operating system", "Human + AI-driven booking", "Experience-driven design"].map(t => (
          <span key={t} style={{ color: "#ffffff", fontSize: "0.82rem", letterSpacing: "0.05em" }}>
            <span style={{ color: S.teal, marginRight: 6 }}>—</span>{t}
          </span>
        ))}
      </div>
    </section>
  );
}

function SectionLabel({ children }: { children: string }) {
  return <div style={{ fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.tealLight, fontWeight: 700, marginBottom: "0.8rem" }}>{children}</div>;
}

function SectionDivider() {
  return <div style={{ height: 1, background: S.border, maxWidth: 1140, margin: "0 auto" }} />;
}

function Philosophy() {
  return (
    <section style={{ padding: "5rem 2rem" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <Reveal>
          <SectionLabel>Design Philosophy</SectionLabel>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.7rem,3.5vw,2.7rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.025em", color: S.white }}>
            Made to match the way modern travellers move
          </h2>
        </Reveal>
        <div className="three-col" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5px", marginTop: "3rem", borderRadius: 14, overflow: "hidden", border: `1px solid ${S.border}` }}>
          {PHIL_CARDS.map((c, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <PhilCardEl card={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function PhilCardEl({ card }: { card: PhilCard }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? "rgba(13,31,60,0.98)" : S.navyMid,
        padding: "2.5rem 2rem", position: "relative", overflow: "hidden",
        transition: "background 0.25s", height: "100%",
        borderTop: hov ? `2px solid ${S.teal}` : "2px solid transparent",
      }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "2.4rem", fontWeight: 800, color: "rgba(13,148,136,0.15)", lineHeight: 1, marginBottom: "1.2rem" }}>{card.num}</div>
      <div style={{ fontSize: "0.69rem", letterSpacing: "0.14em", textTransform: "uppercase", color: S.tealLight, fontWeight: 700, marginBottom: "0.4rem" }}>{card.tag}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.6rem", color: S.white }}>{card.title}</div>
      <p style={{ color: S.muted, fontSize: "0.88rem", lineHeight: 1.65 }}>{card.desc}</p>
    </div>
  );
}

function VisionMission() {
  return (
    <section id="vision" style={{ padding: "5rem 2rem" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <Reveal>
          <SectionLabel>Vision & Mission</SectionLabel>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.7rem,3.5vw,2.7rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.025em", color: S.white }}>
            What we're building —<br />and why it matters.
          </h2>
        </Reveal>
        <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "3rem" }}>
          {VM_CARDS.map((c, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <div style={{
                background: S.navyMid, border: `1px solid ${S.border}`, borderRadius: 16,
                padding: "2.8rem 2.5rem", borderTop: `3px solid ${c.accent}`,
              }}>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 700, color: c.accent, marginBottom: "1rem" }}>{c.label}</div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.3rem", fontWeight: 700, lineHeight: 1.3, marginBottom: "1rem", color: S.white }}>{c.title}</h3>
                <p style={{ color: S.muted, fontSize: "0.93rem", lineHeight: 1.7, marginBottom: "0.8rem" }}>{c.p1}</p>
                <p style={{ color: S.muted, fontSize: "0.93rem", lineHeight: 1.7 }}>{c.p2}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Origin() {
  return (
    <section style={{ background: "rgba(10,22,40,0.95)", padding: "5rem 2rem" }}>
      <div className="two-col" style={{ maxWidth: 1140, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "start" }}>
        <Reveal>
          <div>
            <SectionLabel>Origin Story</SectionLabel>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.7rem,3vw,2.5rem)", fontWeight: 700, lineHeight: 1.2, color: "#ffffff", letterSpacing: "-0.025em" }}>The Reason Behind PlumTrips</h2>
            <p style={{ color: S.muted, marginTop: "0.8rem", fontSize: "0.97rem", lineHeight: 1.7 }}>Born from years inside the travel industry — airlines, OTAs, agencies, corporate desks, travel-tech. We saw the same friction everywhere.</p>
            <div style={{ marginTop: "2rem", display: "flex", flexDirection: "column", gap: "0.7rem" }}>
              {FRICTIONS.map((f, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: "0.75rem",
                  padding: "0.9rem 1.2rem", borderRadius: 8,
                  background: "rgba(13,148,136,0.07)", border: "1px solid rgba(13,148,136,0.14)",
                  fontSize: "0.88rem", color: "#ffffff", transition: "all 0.2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(59,130,246,0.35)"; (e.currentTarget as HTMLDivElement).style.color = "#ffffff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(59,130,246,0.14)"; (e.currentTarget as HTMLDivElement).style.color = "#ffffff"; }}
                >
                  <span style={{ color: "#ef4444", fontWeight: 700, flexShrink: 0 }}>✕</span> {f}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.15}>
          <div style={{
            background: `linear-gradient(135deg, ${S.navyLight}, ${S.navyMid})`,
            border: `1px solid ${S.border}`, borderRadius: 16, padding: "2.5rem",
            position: "sticky", top: "7rem",
          }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "5rem", lineHeight: 0.8, color: S.teal, opacity: 0.25 }}>"</div>
            <blockquote style={{ fontSize: "1.03rem", color: S.offWhite, lineHeight: 1.75, marginTop: "0.5rem", fontStyle: "italic" }}>
              Our answer: A travel platform that behaves like a calm, capable co-pilot — for individual travellers who want confidence at every step, and for B2B partners who need reliability at scale.
            </blockquote>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function WhoWeServe() {
  return (
    <section id="who-we-serve" style={{ padding: "5rem 2rem" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <Reveal>
          <SectionLabel>Who We Serve</SectionLabel>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.7rem,3.5vw,2.7rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.025em", color: S.white }}>
            Built for travellers.<br />Trusted by businesses.
          </h2>
          <p style={{ color: S.muted, maxWidth: 560, marginTop: "0.8rem", fontSize: "0.97rem", lineHeight: 1.7 }}>Whether you're planning a holidays or managing a company's entire travel programme — Plumtrips works for you.</p>
        </Reveal>
        <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "3rem" }}>
          {SERVE_CARDS.map((c, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <ServeCardEl card={c} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServeCardEl({ card }: { card: ServeCard }) {
  return (
    <div style={{ background: S.navyMid, border: `1px solid ${S.border}`, borderRadius: 16, overflow: "hidden" }}>
      <div style={{ padding: "2rem 2rem 1.5rem", borderBottom: `1px solid ${S.border}` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.45rem", fontSize: "0.69rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, color: card.badgeColor, marginBottom: "1.2rem" }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: card.badgeColor, display: "inline-block" }} />
          {card.badge}
        </div>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.4rem", fontWeight: 700, lineHeight: 1.25, marginBottom: "0.8rem", color: S.white }}>{card.title}</h3>
        <p style={{ color: S.muted, fontSize: "0.88rem", lineHeight: 1.65 }}>{card.desc}</p>
      </div>
      <div style={{ height: 2, background: `linear-gradient(90deg, ${card.badgeColor}, ${card.badgeColor}88)`, margin: "0 2rem", opacity: 0.6 }} />
      <div style={{ padding: "1.5rem 2rem 2rem", display: "flex", flexDirection: "column", gap: "0.7rem" }}>
        {card.features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "0.7rem", fontSize: "0.86rem", color: S.muted, lineHeight: 1.5 }}>
            <span style={{ width: 18, height: 18, borderRadius: 4, background: `${card.badgeColor}22`, color: card.badgeColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1, fontSize: "0.7rem", fontWeight: 700 }}>✓</span>
            {f.text}
          </div>
        ))}
      </div>
    </div>
  );
}

function Intelligence() {
  return (
    <section style={{ background: "rgba(10,22,40,0.95)", padding: "5rem 2rem" }}>
      <div className="two-col" style={{ maxWidth: 1140, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "4rem", alignItems: "center" }}>
        <div>
          <Reveal>
            <SectionLabel>Intelligence Layer</SectionLabel>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.7rem,3vw,2.5rem)", fontWeight: 700, lineHeight: 1.2, color: "#ffffff", letterSpacing: "-0.025em" }}>
              pluto.ai — the intelligence behind every journey
            </h2>
            <p style={{ color: S.muted, marginTop: "0.8rem", fontSize: "0.95rem", lineHeight: 1.7 }}>Your always-on co-pilot across the Plumtrips ecosystem. It doesn't replace humans — it amplifies them.</p>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.1rem", marginTop: "2.5rem" }}>
            {INTEL_FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.09}>
                <IntelFeatureEl feat={f} />
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.2}>
          <div style={{ background: S.navyMid, border: `1px solid ${S.border}`, borderRadius: 20, padding: "2.5rem", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-40%", right: "-20%", width: "70%", paddingBottom: "70%", borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.18), transparent 70%)", pointerEvents: "none" }} />
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.6rem", background: "rgba(13,148,136,0.15)", border: `1px solid rgba(13,148,136,0.3)`, borderRadius: "100px", padding: "0.4rem 1.1rem", fontSize: "0.78rem", color: S.tealLight, marginBottom: "1.5rem" }}>
              ✦ pluto.ai — always on
            </div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.45rem", fontWeight: 700, marginBottom: "0.8rem", color: S.white }}>Intelligent. Contextual. Always there.</h3>
            <p style={{ color: S.muted, fontSize: "0.88rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>pluto.ai scans options, simplifies rules, and highlights trade-offs in plain language — across every booking, every traveller, every trip.</p>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              {[["10×", "Faster booking decisions"], ["360°", "Trip visibility"], ["24/7", "AI availability"]].map(([val, lbl]) => (
                <div key={val} style={{ textAlign: "center", flex: 1 }}>
                  <strong style={{ display: "block", fontFamily: "'Syne', sans-serif", fontSize: "1.8rem", fontWeight: 800, color: S.tealLight, lineHeight: 1 }}>{val}</strong>
                  <span style={{ fontSize: "0.73rem", color: S.muted, marginTop: "0.3rem", display: "block" }}>{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function IntelFeatureEl({ feat }: { feat: IntelFeature }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", gap: "1rem", alignItems: "flex-start",
        padding: "1.1rem 1.3rem", borderRadius: 10,
        background: hov ? "rgba(13,148,136,0.14)" : "rgba(13,148,136,0.07)",
        border: `1px solid ${hov ? "rgba(13,148,136,0.3)" : "rgba(13,148,136,0.12)"}`,
        transition: "all 0.2s",
      }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: `linear-gradient(135deg, ${S.tealDark}, ${S.teal})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>{feat.icon}</div>
      <div>
        <strong style={{ display: "block", fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.2rem", color: "#93c5fd" }}>{feat.title}</strong>
        <span style={{ fontSize: "0.81rem", color: "#ffffff", lineHeight: 1.5 }}>{feat.desc}</span>
      </div>
    </div>
  );
}

function Team() {
  return (
    <section id="team" style={{ padding: "5rem 2rem" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <Reveal>
          <SectionLabel>The People Behind It</SectionLabel>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.7rem,3.5vw,2.7rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.025em", color: S.white }}>
            Travel experts on a mission to fix the experience
          </h2>
          <p style={{ color: S.muted, maxWidth: 560, marginTop: "0.8rem", fontSize: "0.97rem", lineHeight: 1.7 }}>Deep expertise from airlines, GDS systems, consumer apps, and AI research — united by one belief: travel should work better.</p>
        </Reveal>
        <div className="three-col" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "1.5rem", marginTop: "3rem" }}>
          {TEAM_CARDS.map((t, i) => (
            <Reveal key={i} delay={i * 0.07}>
              <TeamCardEl card={t} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamCardEl({ card }: { card: TeamCard }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: S.navyMid, border: `1px solid ${hov ? "rgba(13,148,136,0.4)" : S.border}`,
        borderRadius: 14, padding: "1.8rem",
        transform: hov ? "translateY(-4px)" : "none",
        borderBottom: hov ? `2px solid ${S.teal}` : `2px solid transparent`,
        transition: "all 0.25s",
      }}>
      <div style={{ fontSize: "1.6rem", marginBottom: "1rem" }}>{card.icon}</div>
      <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 700, marginBottom: "0.45rem", color: S.white }}>{card.title}</h4>
      <p style={{ color: S.muted, fontSize: "0.82rem", lineHeight: 1.6 }}>{card.desc}</p>
    </div>
  );
}

function Roadmap() {
  return (
    <section id="roadmap" style={{ background: "rgba(10,22,40,0.95)", padding: "5rem 2rem" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <Reveal>
          <SectionLabel>Where We're Headed</SectionLabel>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.7rem,3.5vw,2.7rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.025em", color: "#ffffff" }}>
            Every month is a milestone in the making
          </h2>
          <p style={{ color: S.muted, maxWidth: 560, marginTop: "0.8rem", fontSize: "0.97rem", lineHeight: 1.7 }}>Plumtrips is growing fast. Here's what we're working on — and what's coming next.</p>
        </Reveal>
        <div className="two-col" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: "1.5rem", marginTop: "3rem" }}>
          {ROADMAP.map((r, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <RoadmapItemEl item={r} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function RoadmapItemEl({ item }: { item: RoadmapItem }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? S.navyLight : S.navyMid,
        border: `1px solid ${hov ? "rgba(13,148,136,0.35)" : S.border}`,
        borderRadius: 12, padding: "1.6rem 1.8rem",
        display: "flex", gap: "1.2rem", alignItems: "flex-start",
        transition: "all 0.2s",
      }}>
      <div style={{
        width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
        background: item.live ? "#22c55e" : S.teal,
        boxShadow: item.live ? "0 0 8px rgba(34,197,94,0.5)" : `0 0 8px rgba(13,148,136,0.5)`,
        marginTop: "0.55rem",
      }} />
      <div>
        <div style={{ fontSize: "0.67rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, color: item.live ? "#22c55e" : S.tealLight, marginBottom: "0.35rem" }}>{item.status}</div>
        <h4 style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.93rem", fontWeight: 700, marginBottom: "0.35rem", color: S.white }}>{item.title}</h4>
        <p style={{ color: S.muted, fontSize: "0.82rem", lineHeight: 1.55 }}>{item.desc}</p>
      </div>
    </div>
  );
}

function CTA() {
  return (
    <section id="cta" style={{ textAlign: "center", padding: "6rem 2rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 80% at 50% 50%, rgba(13,148,136,0.15), transparent 70%)", pointerEvents: "none" }} />
      <Reveal>
        <SectionLabel>Join the Journey</SectionLabel>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.7rem,3.5vw,2.7rem)", fontWeight: 700, lineHeight: 1.2, letterSpacing: "-0.025em", color: S.white, maxWidth: 600, margin: "0 auto 1.2rem" }}>The future of travel starts here.</h2>
        <p style={{ color: S.muted, maxWidth: 480, margin: "0 auto 2.5rem", fontSize: "0.97rem", lineHeight: 1.7 }}>Whether you're planning your next adventure or transforming how your company travels — Plumtrips is ready for you.</p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#" style={{ background: `linear-gradient(135deg, ${S.tealDark}, ${S.teal})`, color: S.white, padding: "0.75rem 2rem", borderRadius: 8, fontSize: "0.93rem", fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 20px rgba(13,148,136,0.35)" }}>Explore homepage →</a>
          <a href="#" style={{ background: S.white, color: S.navy, padding: "0.75rem 2rem", borderRadius: 8, fontSize: "0.93rem", fontWeight: 700, textDecoration: "none" }}>Talk to our team →</a>
          <a href="#" style={{ background: "transparent", color: S.offWhite, padding: "0.75rem 2rem", borderRadius: 8, border: `1px solid ${S.border}`, fontSize: "0.93rem", textDecoration: "none" }}>Build with us</a>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${S.border}`, padding: "2.2rem 3rem", display: "flex", alignItems: "center", justifyContent: "space-between", color: S.muted, fontSize: "0.82rem" }}>
      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "1.2rem", color: S.white }}>plum<span style={{ color: S.tealLight }}>trips</span></div>
      <span>© 2026 Plumtrips. All rights reserved.</span>
      <span>Powered by <strong style={{ color: S.tealLight }}>pluto.ai</strong></span>
    </footer>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function PlumtripsAbout() {
  return (
    <>
      <div style={{ minHeight: "100vh", backgroundImage: `linear-gradient(rgba(255,255,255,0.72), rgba(255,255,255,0.78)), url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundAttachment: "fixed", }}>

        <Hero />
        <Philosophy />
        <SectionDivider />
        <VisionMission />
        <SectionDivider />
        <Origin />
        <WhoWeServe />
        <SectionDivider />
        <Intelligence />
        <Team />
        <SectionDivider />
        <Roadmap />
        <CTA />
      </div>
    </>
  );
}