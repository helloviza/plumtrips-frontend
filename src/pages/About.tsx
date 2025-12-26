// apps/frontend/src/pages/About.tsx

export default function AboutPage() {
  return (
    <div className="bg-slate-950 text-slate-50">
      {/* HERO: FUTURE OF TRAVEL OS */}
      <section className="relative overflow-hidden">
        {/* Background gradients + AI orbits */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.4),_transparent_55%),_radial-gradient(circle_at_bottom,_rgba(148,163,184,0.18),_transparent_60%)]" />
          <div className="absolute -left-32 top-10 h-64 w-64 rounded-full border border-sky-500/30 ai-orbit" />
          <div className="absolute right-[-80px] top-36 h-80 w-80 rounded-full border border-emerald-400/18 ai-orbit-slow" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 md:pb-20 md:pt-20">
          <div className="grid gap-10 md:grid-cols-[3fr,2fr] md:items-center">
            {/* Left copy */}
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-slate-900/70 px-3 py-1 text-[11px] md:text-xs text-slate-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 ai-pulse" />
                SYSTEM ONLINE Â· Travel OS // AI-enabled
              </div>

              <h1 className="mt-4 text-3xl leading-tight md:text-4xl lg:text-[2.9rem] lg:leading-[1.1] font-extrabold tracking-tight">
                Travel designed by humans,
                <span className="text-sky-300"> supercharged by AI.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm md:text-base text-slate-200">
                Plumtrips is a travel-tech platform crafting a user-experience-first
                ecosystem for travellers and B2B partners. Flights, visas, holidays,
                hotels and MICE - all stitched together with intelligent workflows
                and an AI layer we call <span className="font-semibold">pluto.ai</span>.
              </p>

              <div className="mt-6 flex flex-wrap gap-3 text-[11px] md:text-xs text-slate-100">
                <span className="rounded-full bg-sky-500/15 px-3 py-1 border border-sky-400/40">
                  B2B-first travel operating system
                </span>
                <span className="rounded-full bg-slate-900/80 px-3 py-1 border border-slate-700">
                  Human + AI decision making
                </span>
                <span className="rounded-full bg-emerald-500/10 px-3 py-1 border border-emerald-400/40">
                  Experience-driven design
                </span>
              </div>
            </div>

            {/* Right "OS panel" card + AI core chip */}
            <div className="relative">
              {/* Floating AI core */}
              <div
                className="pointer-events-none absolute -right-4 -top-6 hidden md:block"
                aria-hidden
              >
                <div className="relative h-20 w-20 rounded-3xl border border-sky-400/60 bg-slate-900/80 shadow-[0_0_35px_rgba(56,189,248,0.9)]">
                  <div className="absolute inset-[6px] rounded-2xl bg-gradient-to-br from-sky-500/40 via-slate-900 to-emerald-400/30 ai-orbit-slow" />
                  <div className="absolute inset-[10px] rounded-2xl border border-sky-300/40 bg-slate-900/90 flex items-center justify-center">
                    <RobotIcon />
                  </div>
                </div>
              </div>

              <div className="os-grid rounded-3xl border border-slate-800 bg-slate-900/80 p-5 md:p-6 shadow-[0_18px_60px_rgba(15,23,42,0.85)]">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>MODULE Â· Core Values</span>
                  <span className="ai-pulse text-emerald-400">LIVE</span>
                </div>
                <div className="mt-3 text-xs font-semibold tracking-wide text-sky-300">
                  WHAT Plumtrips STANDS FOR
                </div>
                <p className="mt-3 text-sm md:text-[15px] text-slate-100">
                  We are building a travel layer where:
                </p>
                <ul className="mt-3 space-y-2 text-xs md:text-sm text-slate-200">
                  <li>- agents respond in minutes, not hours.</li>
                  <li>- travellers get clarity, not hidden surprises.</li>
                  <li>- businesses see policy-friendly, budget-aware options by default.</li>
                  <li>- technology handles the complexity, humans curate the experience.</li>
                </ul>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center text-[11px] md:text-xs">
                  <div className="rounded-2xl bg-slate-950/70 p-3 border border-slate-800">
                    <div className="text-[15px] md:text-lg font-bold text-sky-300">
                      User-first
                    </div>
                    <div className="mt-1 text-slate-400">Design philosophy</div>
                  </div>
                  <div className="rounded-2xl bg-slate-950/70 p-3 border border-slate-800">
                    <div className="text-[15px] md:text-lg font-bold text-emerald-300">
                      B2B
                    </div>
                    <div className="mt-1 text-slate-400">Travel ecosystem</div>
                  </div>
                  <div className="rounded-2xl bg-slate-950/70 p-3 border border-slate-800">
                    <div className="text-[15px] md:text-lg font-bold text-rose-300">
                      AI-enabled
                    </div>
                    <div className="mt-1 text-slate-400">Decision layer</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VISION / MISSION - MODULE PANEL */}
      <section className="bg-slate-950/95 border-t border-slate-800/70">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="mb-5 flex items-center justify-between text-[11px] md:text-xs text-slate-400">
            <span>MODULE Â· Vision / Mission</span>
            <span className="text-sky-300">SYSTEM LAYER // PURPOSE</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="os-grid rounded-3xl bg-slate-900/80 border border-slate-800 p-6 md:p-7">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ai-pulse" />
                VISION
              </div>
              <h2 className="mt-3 text-lg md:text-xl font-semibold text-slate-50">
                Our Vision
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                To be the most trusted experience-led travel platform for travellers
                and businesses - a place where every journey feels intelligently
                designed, deeply considered and simple to manage.
              </p>
              <p className="mt-3 text-xs md:text-sm text-slate-400">
                We see a world where every trip - a quick visa run, a family vacation
                or a global offsite - is powered by an invisible, reliable tech layer
                that quietly does the heavy lifting.
              </p>
            </div>

            <div className="os-grid rounded-3xl bg-slate-900/80 border border-slate-800 p-6 md:p-7">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-400 ai-pulse" />
                MISSION
              </div>
              <h2 className="mt-3 text-lg md:text-xl font-semibold text-slate-50">
                Our Mission
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                To build a unified travel stack that blends human expertise with AI,
                giving travellers and B2B partners transparent choices, smarter
                workflows and support that actually shows up when plans change.
              </p>
              <p className="mt-3 text-xs md:text-sm text-slate-400">
                From discovery to post-trip reporting, our mission is to remove noise
                and surface what matters: time, safety, clarity and meaningful
                experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY Plumtrips - SYSTEM LOG */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="mb-5 flex items-center justify-between text-[11px] md:text-xs text-slate-400">
            <span>MODULE Â· Origin Story</span>
            <span className="text-emerald-300">SYSTEM LOG // CONTEXT</span>
          </div>

          <div className="grid gap-10 md:grid-cols-[1.4fr,1.6fr] md:items-start">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
                Why Plumtrips exists
              </h2>
              <p className="mt-4 text-sm md:text-base text-slate-200">
                Plumtrips was born from years spent inside the travel industry -
                airlines, OTAs, offline agencies, corporate travel desks, and
                travel-tech products. We saw the same friction everywhere:
              </p>
              <ul className="mt-4 space-y-2 text-xs md:text-sm text-slate-300">
                <li>- scattered tools for flights, hotels, visas and support.</li>
                <li>- endless email threads instead of clean workflows.</li>
                <li>- confusing fare rules, fine print and policy exceptions.</li>
                <li>- travellers feeling lost once the booking was "done".</li>
              </ul>
              <p className="mt-4 text-sm md:text-base text-slate-200">
                Plumtrips is our answer: a travel platform that behaves like a calm,
                capable co-pilot - for individual travellers, for agents, and for
                B2B partners who need reliability at scale.
              </p>
            </div>

            <div className="os-grid rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900 to-sky-900/40 p-5 md:p-6">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>OVERVIEW PANEL</span>
                <span className="text-sky-300">TRAVEL OS // FEATURES</span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {[
                  {
                    title: "Flights, hotels & more",
                    body:
                      "Intelligent search and curated options instead of random combinations.",
                  },
                  {
                    title: "Visa & documentation",
                    body:
                      "Structured guidance, checklists and status visibility for critical journeys.",
                  },
                  {
                    title: "Holidays & experiences",
                    body:
                      "Itineraries that respect energy levels, budgets and real-world logistics.",
                  },
                  {
                    title: "Corporate & MICE",
                    body:
                      "From single travellers to large groups, with policy-aware controls.",
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4"
                  >
                    <h3 className="text-xs md:text-sm font-semibold text-slate-50">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[11px] md:text-xs text-slate-300">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRAVEL TECH APPROACH - ARCHITECTURE VIEW */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 pb-12 md:pb-16">
          <div className="mb-5 flex items-center justify-between text-[11px] md:text-xs text-slate-400">
            <span>MODULE Â· Architecture</span>
            <span className="text-sky-300">TRAVEL OS // B2B LAYER</span>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:p-8 os-grid">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="md:max-w-md">
                <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
                  Our travel-tech approach
                </h2>
                <p className="mt-3 text-sm md:text-base text-slate-200">
                  We&apos;re building a user-experience-based travel ecosystem
                  tailored for B2B: agencies, enterprises, distributors and new-age
                  communities. Instead of one more booking engine, we&apos;re
                  designing a <span className="font-semibold">travel operating system</span>.
                </p>
                <p className="mt-3 text-xs md:text-sm text-slate-400">
                  Every feature is weighed against a simple question:{" "}
                  <span className="italic">
                    does this make the traveller and the travel manager feel more in control?
                  </span>
                </p>
              </div>

              <div className="grid flex-1 gap-4 md:grid-cols-3">
                <TechPillar
                  label="Unified stack"
                  desc="Flights, hotels, visas, holidays, support & reporting living on the same spine."
                />
                <TechPillar
                  label="Role-aware UX"
                  desc="Different views for travellers, agents, finance teams and admins - one source of truth."
                />
                <TechPillar
                  label="Ready to integrate"
                  desc="Built to plug into HR, finance and partner systems instead of replacing everything."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* pluto.ai - INTELLIGENCE LAYER */}
      <section className="border-y border-slate-800 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="mb-5 flex items-center justify-between text-[11px] md:text-xs text-slate-400">
            <span>MODULE Â· Intelligence Layer</span>
            <span className="text-sky-300">AI ENGINE // pluto.ai</span>
          </div>

          <div className="grid gap-10 md:grid-cols-[1.4fr,1.6fr] md:items-start">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 text-[11px] md:text-xs text-sky-100">
                <span className="h-2 w-2 rounded-full bg-sky-300 ai-pulse" />
                pluto.ai Â· AI co-pilot for Plumtrips
              </div>
              <h2 className="mt-4 text-xl md:text-2xl font-semibold text-slate-50">
                pluto.ai - the intelligence that sits behind every journey
              </h2>
              <p className="mt-3 text-sm md:text-base text-slate-200">
                pluto.ai is being designed as a calm, always-on co-pilot across
                the Plumtrips ecosystem. It doesn't replace humans - it amplifies
                them: scanning options, simplifying rules and highlighting trade-offs
                in plain language.
              </p>
              <p className="mt-3 text-xs md:text-sm text-slate-400">
                Our focus is on safety, transparency and keeping people in the
                decision loop. AI suggests; humans choose.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "Agent co-pilot",
                  desc:
                    "Helps agents compare routes, cabins and fare types quickly, so responses land in minutes, not hours.",
                },
                {
                  title: "Trip design & re-design",
                  desc:
                    "Suggests itineraries, alternatives and re-routes when plans or budgets change - without starting from zero.",
                },
                {
                  title: "Policy-aware B2B flows",
                  desc:
                    "Understands corporate rules, approval flows and budgets so suggestions remain practical, not theoretical.",
                },
                {
                  title: "Plain-language clarity",
                  desc:
                    "Explains fare rules, visa basics and conditions in human language instead of long blocks of jargon.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="os-grid rounded-2xl border border-slate-800 bg-slate-950/80 p-4"
                >
                  <h3 className="text-xs md:text-sm font-semibold text-slate-50">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[11px] md:text-xs text-slate-300">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-6 text-[11px] md:text-xs text-slate-400">
            As pluto.ai evolves, our commitment stays constant: explainable
            behaviour, clear guardrails and human-centric use cases.
          </p>
        </div>
      </section>

      {/* TEAM STRENGTHS - HUMAN LAYER */}
      <section className="bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="mb-5 flex items-center justify-between text-[11px] md:text-xs text-slate-400">
            <span>MODULE Â· Human Layer</span>
            <span className="text-emerald-300">CREW // EXPERTISE</span>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
            The team behind Plumtrips
          </h2>
          <p className="mt-3 max-w-3xl text-sm md:text-base text-slate-200">
            The people building Plumtrips bring together deep travel industry
            experience and modern product thinking - from airline revenue and GDS
            systems to offline trade networks, digital brands and AI-driven
            products.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Travel industry depth",
                desc:
                  "Hands-on experience with airlines, consolidators, DMCs and large retail agencies.",
              },
              {
                title: "Product & UX mindset",
                desc:
                  "Backgrounds in building consumer and B2B products help us design journeys, not just screens.",
              },
              {
                title: "AI & data orientation",
                desc:
                  "A strong focus on using data and AI responsibly to augment decision making, not fully automate it.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="os-grid rounded-3xl border border-slate-800 bg-slate-900/80 p-5"
              >
                <h3 className="text-sm md:text-base font-semibold text-slate-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs md:text-sm text-slate-300">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Micro personas - light, fun but professional */}
          <div className="mt-9 grid gap-4 md:grid-cols-4">
            {[
              {
                title: "The Route Architect",
                desc:
                  "Obsessed with time, connections and practical layovers that don't break humans.",
              },
              {
                title: "The Visa Strategist",
                desc:
                  "Lives inside embassy updates and checklists so travellers don't have to.",
              },
              {
                title: "The Stay Curator",
                desc:
                  "Understands neighbourhoods, not just star ratings and glossy photos.",
              },
              {
                title: "The Experience Designer",
                desc:
                  "Balances must-see sights with breathing room, so trips feel energising, not exhausting.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-900 bg-slate-950/70 p-4"
              >
                <h3 className="text-[11px] md:text-sm font-semibold text-slate-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-[11px] md:text-xs text-slate-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRINCIPLES - GUARDRAILS */}
      <section className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="mb-5 flex items-center justify-between text-[11px] md:text-xs text-slate-400">
            <span>MODULE Â· Guardrails</span>
            <span className="text-rose-300">GOVERNANCE // PRINCIPLES</span>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
            Principles we build by
          </h2>
          <p className="mt-3 max-w-3xl text-sm md:text-base text-slate-200">
            A platform is only as good as the values baked into it. These are
            the non-negotiables that guide how Plumtrips and pluto.ai evolve.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Clarity over complexity",
                desc:
                  "We hide technical complexity, not information. Users should see trade-offs clearly.",
              },
              {
                title: "Human in the loop",
                desc:
                  "AI assists, humans decide. Especially when it impacts safety, finances or work travel.",
              },
              {
                title: "Respect for time & money",
                desc:
                  "We treat every booking like it's our own - careful with costs, practical with plans.",
              },
              {
                title: "Honesty beats hype",
                desc:
                  "If a plan is risky, timelines are tight or expectations are unrealistic, we say so.",
              },
              {
                title: "Inclusive by design",
                desc:
                  "From first-time travellers to seasoned executives, we design for different comfort levels.",
              },
              {
                title: "Long-term relationships",
                desc:
                  "We build for repeat journeys, not one-time transactions. Trust compounds over time.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="os-grid rounded-3xl border border-slate-800 bg-slate-900/80 p-5"
              >
                <h3 className="text-sm md:text-base font-semibold text-slate-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs md:text-sm text-slate-300">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUTURE ROADMAP + CTA - RELEASE CHANNEL */}
      <section className="bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
        <div className="mx-auto max-w-6xl px-4 pb-14 pt-10 md:pb-16 md:pt-14">
          <div className="mb-5 flex items-center justify-between text-[11px] md:text-xs text-slate-400">
            <span>MODULE Â· Roadmap</span>
            <span className="text-sky-300">RELEASE CHANNEL // IN PROGRESS</span>
          </div>

          <div className="grid gap-8 md:grid-cols-[1.6fr,1.4fr] md:items-start">
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-slate-50">
                Where we&apos;re headed
              </h2>
              <p className="mt-3 max-w-3xl text-sm md:text-base text-slate-200">
                Plumtrips is still in active build mode. Every month, we&apos;re
                tightening the platform, refining pluto.ai&apos;s capabilities
                and adding the pieces required for a complete travel operating
                system - built from India, for a global audience.
              </p>
              <ul className="mt-4 space-y-2 text-xs md:text-sm text-slate-300">
                <li>- Deeper tools for B2B partners and agencies.</li>
                <li>- Richer, more visual experiences for travellers.</li>
                <li>- Stronger AI assistance with clear, human-readable reasoning.</li>
                <li>- More integrations with the tools businesses already use.</li>
              </ul>
            </div>

            <div className="os-grid rounded-3xl border border-slate-800 bg-slate-900/80 p-6 md:p-7">
              <h3 className="text-sm md:text-base font-semibold text-slate-50">
                Be part of the journey
              </h3>
              <p className="mt-3 text-xs md:text-sm text-slate-300">
                Whether you&apos;re planning a personal trip, running a travel
                business or leading corporate travel for your company, we&apos;d
                love to explore how Plumtrips can fit into your world.
              </p>

              <div className="mt-5 flex flex-wrap gap-3 text-xs md:text-sm">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full bg-[#d06549] px-6 py-2 font-semibold text-slate-50 hover:bg-[#bf583f]"
                >
                  Talk to our team
                </a>
                <a
                  href="/go/concierge"
                  className="inline-flex items-center justify-center rounded-full border border-slate-500 px-6 py-2 font-semibold text-slate-100 hover:bg-slate-900"
                >
                  Explore concierge flows
                </a>
                <a
                  href="/careers"
                  className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-2 font-semibold text-slate-300 hover:bg-slate-900/80"
                >
                  Build with us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local styles for AI / OS animation + grid */}
      <style>{`
        @keyframes spin-orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.35); opacity: 1; }
        }
        .ai-orbit {
          animation: spin-orbit 26s linear infinite;
          transform-origin: center;
        }
        .ai-orbit-slow {
          animation: spin-orbit 46s linear infinite;
          transform-origin: center;
        }
        .ai-pulse {
          animation: pulse-glow 3.2s ease-in-out infinite;
        }
        .os-grid {
          background-image:
            linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px);
          background-size: 40px 40px;
          background-position: 0 0, 0 0;
        }
      `}</style>
    </div>
  );
}

/* --- Small helper component for tech pillars --- */

function TechPillar({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 os-grid">
      <div className="text-[11px] md:text-xs font-semibold uppercase tracking-wide text-sky-300">
        {label}
      </div>
      <p className="mt-2 text-[11px] md:text-xs text-slate-300">{desc}</p>
    </div>
  );
}

/* --- Tiny robot / AI icon --- */

function RobotIcon() {
  return (
    <svg
      viewBox="0 0 40 40"
      className="h-7 w-7 text-sky-200"
      aria-hidden="true"
    >
      <rect
        x="8"
        y="10"
        width="24"
        height="18"
        rx="4"
        ry="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <rect
        x="15"
        y="6"
        width="10"
        height="4"
        rx="1"
        ry="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="15" cy="19" r="2.2" fill="currentColor" />
      <circle cx="25" cy="19" r="2.2" fill="currentColor" />
      <rect
        x="16"
        y="23"
        width="8"
        height="1.4"
        rx="0.7"
        ry="0.7"
        fill="currentColor"
        opacity="0.85"
      />
      <line
        x1="8"
        y1="16"
        x2="4"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="36"
        y1="16"
        x2="32"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}
