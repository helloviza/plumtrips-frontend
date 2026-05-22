import { useEffect, useRef } from "react";

import "../styles/about.css"
import { Link } from "react-router-dom";

// ── Inline SVG icon component using Google Material Symbols font ──
function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
  );
}

// ── Reveal-on-scroll hook ──
function useReveal() {
  const refs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRef = (el: HTMLElement | null) => {
    if (el && !refs.current.includes(el)) refs.current.push(el);
  };

  return addRef;
}

// ── Data ──
const STATS = [
  { value: "10x", label: "Faster decisions" },
  { value: "360°", label: "Trip visibility" },
  { value: "24/7", label: "AI co-pilot" },
  { value: "B2B", label: "Unified platform" },
];

const TRAVELLER_FEATURES = [
  "AI finds smarter options instantly",
  "Real-time delay & price alerts",
  "Budget-aware recommendations",
];

const BUSINESS_FEATURES = [
  "Intelligent multi-modal booking",
  "Policy automation — no manual work",
  "CFO-grade reporting & audit trails",
];

const INTELLIGENCE_CARDS = [
  { icon: "speed", title: "Infinite scale", desc: "Surfaces best flights & hotels across thousands of combos — in seconds." },
  { icon: "gavel", title: "Simplified rules", desc: "Turns complex fare rules and visa jargon into plain, actionable language." },
  { icon: "balance", title: "Smart trade-offs", desc: "Price vs. flexibility, speed vs. comfort — you decide with full clarity." },
  { icon: "notifications_active", title: "Always-on alerts", desc: "Detects delays and cancellations before they become problems." },
];

const TEAM_MEMBERS = [
  { title: "Airline Ops", subtitle: "Ex-IATA Veterans", img: "https://images.unsplash.com/photo-1551887488-13343d412680?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  {title: "Hotel Ops",subtitle: "Hospitality Leaders",img: "https://images.unsplash.com/photo-1652348716053-3447e551dd1f?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG90ZWxzJTIwb3BzfGVufDB8fDB8fHww"},
  { title: "AI & Data", subtitle: "Applied ML Pros", img: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=765&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { title: "Global Ops", subtitle: "Strategic Scale", img: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { title: "Strategy", subtitle: "Policy Thinkers", img: "https://images.unsplash.com/photo-1623652554515-91c833e3080e?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
];

const MILESTONES = [
  { badge: "Live", badgeClass: "badge-live", icon: "verified", title: "AI trip planning", desc: "Real-time flight, hotel, and experience recommendations powered by pluto.ai.", dark: false },
  { badge: "In Progress", badgeClass: "badge-inprogress", icon: "autorenew", title: "pluto.ai upgrades", desc: "Advanced multi-stop logic and predictive disruption handling features.", dark: false },
  { badge: "Coming Soon", badgeClass: "badge-soon", icon: "dashboard", title: "B2B dashboard", desc: "Corporate booking, policy enforcement, and CFO-grade spend reporting.", dark: false },
  { badge: "Coming Soon", badgeClass: "badge-soon", icon: "groups", title: "Groups & MICE", desc: "Dedicated intelligent tools for group bookings and conference travel.", dark: false },
  { badge: "Planned", badgeClass: "badge-soon", icon: "sync_alt", title: "ERP integrations", desc: "Native sync with major platforms like SAP Concur and Workday.", dark: false },
  { badge: "Join Us", badgeClass: "badge-inprogress", icon: "rocket_launch", title: "Build with us", desc: "Help us shape the future of travel. We're looking for visionary partners.", dark: true },
];

// ── Components ──

function HeroSection({ addRef }: { addRef: (el: HTMLElement | null) => void }) {
  return (
    <section className="hero-section">
      <div className="hero-bg">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8Ak-WAVBj-7Ps5bsPpovVVq_QVVeu2KwlkKW5G5KJEelAzNR9pF3i98MaOtVmBf42d0fd5yoqt371ojomDZYKIqdjDDneYlHPxIk9vT58BKDhqpPFZU2IhfkoooR3G2aXpZGrQgaWqxhRSZeTpdeH7zuSGIAewV5aGk86o3zUh3CGjsKHRDbS5ahYpYLLDgpgZsvWsW7Cx6n5zk5l9JBNO5ZjXk3_TuN6vpzFZCRZ8UhjFHb-bFQJCjZJQSUSkUqjlaPz6k6XM7XP"
          alt="Airplane soaring above clouds at sunset"
        />
        <div className="hero-overlay" />
      </div>
      <div className="hero-content reveal active" ref={addRef as any}>
        <div className="hero-badge">Our Story</div>
        <h1 className="hero-title">
  <span className="hero-line-one">
    Travel designed by humans,
  </span>

  <span className="hero-highlight hero-line-two">
    Superchanged by AI
  </span>
</h1>
        <p className="hero-subtitle">
          We built Plumtrips because travel was broken — scattered tools, confusing rules, and
          support that vanished when you needed it most.
        </p>
        <div className="hero-ctas">
          <button className="btn-hero-primary">Plan my trip</button>
          <Link to="/about" className="btn-hero-ghost">
  Read our story <Icon name="arrow_forward" />
</Link>
        </div>
      </div>
    </section>
  );
}

function StatsBar({ addRef }: { addRef: (el: HTMLElement | null) => void }) {
  return (
    <div className="stats-bar reveal" ref={addRef as any}>
      <div className="stats-grid">
        {STATS.map((s) => (
          <div key={s.value} className="stat-card">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">
              <Icon name="check" className="stat-icon" /> {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OurStorySection({ addRef }: { addRef: (el: HTMLElement | null) => void }) {
  return (
    <section className="section bg-background story-section">
      <div className="container story-grid">
        <div className="reveal" ref={addRef as any}>
          <span className="section-eyebrow">Our Origin</span>
          <h2 className="section-title">About Us</h2>
          <div className="story-body">
            <p>
              Travel should feel seamless, inspiring, and stress-free — not complicated by endless
              searches, confusing policies, and disconnected tools. Yet for most travellers and
              businesses, planning a journey still means navigating scattered platforms, unclear
              pricing, delayed support, and unnecessary complexity.
            </p>
            <p>
              At Plumtrips, we believe travel deserves a smarter experience. Built by a team with
              deep expertise across airlines, technology, and customer experience, Plumtrips combines
              thoughtful human insight with intelligent AI to simplify every step of the journey.
            </p>
            <div className="mission-block">
              <h4>Our mission</h4>
              <p className="italic">
                To make modern travel more intelligent, more transparent, and genuinely effortless.
              </p>
            </div>
          </div>
        </div>
        <div className="story-image-wrapper reveal" ref={addRef as any}>
          <div className="story-image-frame">
            <img
              src="https://images.unsplash.com/photo-1642551669512-2f03916e3b26?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Modern airport architecture"
            />
          </div>
          <div className="story-quote reveal" ref={addRef as any}>
            <p className="italic">
              "A travel platform that behaves like a calm, capable co-pilot — for individual
              travellers and B2B partners."
            </p>
            <p className="quote-author">— The Plumtrips Team</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BuiltForSection({ addRef }: { addRef: (el: HTMLElement | null) => void }) {
  return (
    <section className="section bg-surface-container-low">
      <div className="container">
        <div className="text-center reveal" ref={addRef as any}>
          <span className="section-eyebrow">Who We Serve</span>
          <h2 className="section-title">
            Built for travellers
            <br />
            <span className="text-secondary">Trusted by businesses</span>
          </h2>
        </div>
        <div className="two-col-grid reveal" ref={addRef as any}>
          {/* For Travellers */}
          <div className="glass-card rounded-3xl p-8 flex flex-col card-hover">
            <div className="card-image-wrap">
              <img
                src="https://images.unsplash.com/photo-1502126324834-38f8e02d7160?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Solo traveller at sunrise"
              />
              <span className="card-badge badge-traveller">FOR TRAVELLERS</span>
            </div>
            <h3 className="card-title">Your trip, your way.</h3>
            <p className="card-desc">
              Stop juggling tabs. Plumtrips brings flights, hotels, and experiences into one
              intelligent platform that finds better options and keeps plans on track.
            </p>
            <ul className="feature-list mt-auto">
              {TRAVELLER_FEATURES.map((f) => (
                <li key={f}>
                  <Icon name="check_circle" className="icon-primary-container" /> {f}
                </li>
              ))}
            </ul>
          </div>
          {/* For Businesses */}
          <div className="glass-card rounded-3xl p-8 flex flex-col card-hover">
            <div className="card-image-wrap">
              <img
                src= "https://images.unsplash.com/photo-1582192730841-2a682d7375f9?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Corporate boardroom city view"
              />
              <span className="card-badge badge-business">FOR BUSINESS</span>
            </div>
            <h3 className="card-title">Travel ops, under control.</h3>
            <p className="card-desc">
              Policy-compliant bookings, complete spend visibility, and an AI co-pilot that handles
              complexity so your team focuses on what matters.
            </p>
            <ul className="feature-list mt-auto">
              {BUSINESS_FEATURES.map((f) => (
                <li key={f}>
                  <Icon name="check_circle" className="icon-secondary" /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function IntelligenceSection({ addRef }: { addRef: (el: HTMLElement | null) => void }) {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="text-center intel-header reveal" ref={addRef as any}>
          <div className="pluto-badge">
            <span className="pluto-dot" /> pluto.ai — always on
          </div>
          <h2 className="section-title">
            The intelligence behind <span className="text-primary">every journey</span>
          </h2>
        </div>
        <div className="intel-grid reveal" ref={addRef as any}>
          {INTELLIGENCE_CARDS.map((c) => (
            <div key={c.title} className="intel-card group">
              <div className="intel-icon-wrap">
                <Icon name={c.icon} className="intel-icon" />
              </div>
              <h4 className="intel-card-title">{c.title}</h4>
              <p className="intel-card-desc">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamSection({ addRef }: { addRef: (el: HTMLElement | null) => void }) {
  return (
    <section className="section bg-surface-container">
      <div className="container">
        <div className="team-header reveal" ref={addRef as any}>
          <div>
            <span className="section-eyebrow">Our Team</span>
            <h2 className="section-title">
              Travel experts
              <br />
              <span className="text-primary">on a mission</span>
            </h2>
            <p className="team-desc">
              Deep expertise across airlines, consumer apps, and AI research — united by one belief:
              travel should work better.
            </p>
          </div>
          <div className="team-photo-wrap">
            <img
              src="https://images.unsplash.com/photo-1669633760258-186e9dee81e7?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Team collaboration"
            />
          </div>
        </div>
        <div className="team-grid reveal" ref={addRef as any}>
          {TEAM_MEMBERS.map((m) => (
            <div key={m.title} className="team-card">
              <div className="team-avatar-wrap">
                <img src={m.img} alt={m.title} className="team-avatar" />
              </div>
              <h5 className="team-name">{m.title}</h5>
              <p className="team-role">{m.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MilestonesSection({ addRef }: { addRef: (el: HTMLElement | null) => void }) {
  return (
    <section className="section bg-background">
      <div className="container">
        <div className="text-center reveal" ref={addRef as any}>
          <span className="section-eyebrow">Where We're Headed</span>
          <h2 className="section-title">
            Every month, a <span className="text-primary">milestone</span>
          </h2>
        </div>
        <div className="milestones-grid reveal" ref={addRef as any}>
          {MILESTONES.map((m) => (
            <div key={m.title} className={`milestone-card group ${m.dark ? "milestone-dark" : ""}`}>
              <div className="milestone-top">
                <span className={`milestone-badge ${m.badgeClass}`}>{m.badge}</span>
                <Icon
                  name={m.icon}
                  className={`milestone-icon ${m.dark ? "icon-primary-container" : "icon-primary-container opacity-40 group-hover-full"}`}
                />
              </div>
              <h4 className="milestone-title">{m.title}</h4>
              <p className="milestone-desc">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection({ addRef }: { addRef: (el: HTMLElement | null) => void }) {
  return (
    <section className="section bg-white">
      <div className="container">
        <div className="cta-box reveal" ref={addRef as any}>
          <div className="cta-glow-right" />
          <div className="cta-glow-left" />
          <div className="cta-content">
            <h2 className="cta-title">The future of travel starts here.</h2>
            <p className="cta-sub">
              Whether you're planning an adventure or transforming how your company travels, we're
              here to help.
            </p>
            <div className="cta-buttons">
              <button className="btn-cta-primary">Plan my trip</button>
              <button className="btn-cta-ghost">Talk to our team</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Main Page ──
export default function About() {
  const addRef = useReveal();

  return (
    <main className="about-page">
      <HeroSection addRef={addRef} />
      <StatsBar addRef={addRef} />
      <OurStorySection addRef={addRef} />
      <BuiltForSection addRef={addRef} />
      <IntelligenceSection addRef={addRef} />
      <TeamSection addRef={addRef} />
      <MilestonesSection addRef={addRef} />
      <CTASection addRef={addRef} />
    </main>
  );
}