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
      rgba(0,71,127,0.55) 95%,
      rgba(0,71,127,0.35) 100%
    )
  `;

  return (
    <div className="relative">
      {/* HERO */}
      <div className="text-white" style={{ background: heroBg }}>
        <div className="mx-auto max-w-6xl px-4 py-10">
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
              "linear-gradient(to bottom, rgba(0,71,127,0.35) 0%, rgba(0,71,127,0.25) 0%, rgba(0,71,127,0.00) 0%)",
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
    </div>
  );
}
