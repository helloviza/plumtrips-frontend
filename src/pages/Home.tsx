// src/pages/Home.tsx
import SearchTabs from "../components/SearchTabs";
import HeroCarousel from "../components/HeroCarousel";
import HomeExplore from "../components/home/HomeExplore";

export default function Home() {
  // HERO gradient — bottom stop is brand blue at 35% opacity
  const heroBg = `
    linear-gradient(
      to bottom,
      rgba(0,71,127,1)    0%,
      rgba(0,71,127,1)    50%,
      rgba(0,71,127,0.85) 75%,
      rgba(0,71,127,0.70) 85%,
      rgba(0,71,127,0.35) 95%,
      rgba(0,71,127,0.15) 100%
    )
  `;

  return (
    <div className="relative">
      {/* HERO */}
      <div
        className="relative overflow-hidden text-white"
        style={{ background: heroBg }}
      >
        {/* === AI Artifact Background (stays inside hero only) === */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          {/* Soft central glow behind search + carousel */}
          <div className="absolute -top-32 left-1/2 h-80 w-[820px] -translate-x-1/2 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.55),_transparent_65%)] opacity-80" />

          {/* Subtle tech grid in upper hero band */}
          <div className="absolute inset-x-[-120px] top-0 h-[320px] opacity-30 mix-blend-screen">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(148,163,184,0.18) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.16) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />
          </div>

          {/* Left orbit ring */}
          <div className="ai-orbit absolute -left-28 top-10 h-40 w-40 rounded-full border border-sky-300/45 shadow-[0_0_35px_rgba(56,189,248,0.55)]" />

          {/* Right orbit ring */}
          <div className="ai-orbit-slow absolute right-[-60px] top-28 h-56 w-56 rounded-full border border-emerald-300/38 shadow-[0_0_40px_rgba(45,212,191,0.45)]" />

          {/* Small AI core node behind carousel side */}
          <div className="ai-node absolute right-16 top-10 hidden h-8 w-8 rounded-2xl border border-sky-300/60 bg-sky-400/20 shadow-[0_0_25px_rgba(56,189,248,0.9)] md:block" />

          {/* Bottom fade so artifact doesn’t merge into next section */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#00477f] via-[#00477f]/85 to-transparent" />
        </div>

        {/* Hero content (layout unchanged) */}
        <div className="relative z-[1] mx-auto max-w-6xl px-4 py-10">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-10">
            {/* LEFT: Search (70%) */}
            <div className="lg:col-span-7">
              <div className="max-w-[960px] text-zinc-900">
                <SearchTabs />
              </div>
            </div>

            {/* RIGHT: Carousel (30%) */}
            <div className="lg:col-span-3">
              <HeroCarousel />
            </div>
          </div>
        </div>
      </div>

      {/* EXPLORE with background image */}
      <section className="relative">
        {/* Background image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/home/explore-bg.jpg')" }}
          aria-hidden
        />

        {/* ---- Seam blender (sits on top edge; hides the line) ---- */}
        <div
          className="pointer-events-none absolute inset-x-0 top-[-1px] z-[2] h-6"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,71,127,0.35) 0%, rgba(0,71,127,0.25) 30%, rgba(0,71,127,0.00) 100%)",
          }}
          aria-hidden
        />

        {/* Main overlay starts TRANSPARENT at the top to avoid a double layer */}
        <div
          className="absolute inset-0 z-[1] bg-gradient-to-b from-transparent via-white/38 to-white/70"
          aria-hidden
        />

        {/* Content */}
        <div className="relative z-[3]">
          <HomeExplore />
        </div>
      </section>

      {/* Local styles just for hero AI animations */}
      <style>{`
        @keyframes spin-orbit-home {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse-node-home {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.25); opacity: 1; }
        }
        .ai-orbit {
          animation: spin-orbit-home 30s linear infinite;
          transform-origin: center;
        }
        .ai-orbit-slow {
          animation: spin-orbit-home 54s linear infinite;
          transform-origin: center;
        }
        .ai-node {
          animation: pulse-node-home 3.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
