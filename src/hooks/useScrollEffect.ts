import { useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// useScrollEffects
//
// Drop-in replacement for the simple `useReveal` hook in Home.tsx and
// HotelHome.tsx. Call it once at the top of either page component — it wires
// up five distinct scroll effects:
//
//  1. Staggered section reveal    (.reveal)
//  2. Parallax depth layers       ([data-parallax])
//  3. Scroll-velocity tilt        ([data-tilt])
//  4. Kinetic counter animation   ([data-count])
//  5. Reading-progress bar        (#scroll-progress)
// ─────────────────────────────────────────────────────────────────────────────
export function useScrollEffect() {
  const rafRef = useRef<number | null>(null);
  const lastScrollY = useRef(0);
  const velocity = useRef(0);

  useEffect(() => {
    // ── 1. Staggered reveal ─────────────────────────────────────────────────
    const revealEls = document.querySelectorAll<HTMLElement>(".reveal");
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            // Find sibling .reveal nodes inside the same parent to stagger them
            const siblings = Array.from(
              entry.target.parentElement?.querySelectorAll(".reveal") ?? []
            );
            const idx = siblings.indexOf(entry.target as HTMLElement);
            const delay = Math.min(idx * 80, 400); // max 400 ms lag
            (entry.target as HTMLElement).style.transitionDelay = `${delay}ms`;
            entry.target.classList.add("active");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObs.observe(el));

    // ── 2. Kinetic counter animation ────────────────────────────────────────
    const countEls = document.querySelectorAll<HTMLElement>("[data-count]");
    const countObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const target = parseFloat(el.dataset.count ?? "0");
          const suffix = el.dataset.countSuffix ?? "";
          const duration = 1800;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min((now - start) / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            const value = Math.round(eased * target);
            el.textContent = value.toLocaleString() + suffix;
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          countObs.unobserve(el);
        });
      },
      { threshold: 0.5 }
    );
    countEls.forEach((el) => countObs.observe(el));

    // ── 3. Scroll-velocity tilt ─────────────────────────────────────────────
    const tiltEls = document.querySelectorAll<HTMLElement>("[data-tilt]");

    // ── 4. Progress bar ─────────────────────────────────────────────────────
    const progressBar = document.getElementById("scroll-progress");

    // ── 5. Parallax depth ───────────────────────────────────────────────────
    const parallaxEls =
      document.querySelectorAll<HTMLElement>("[data-parallax]");

    const onScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;

      // velocity (clamped to ±1)
      velocity.current = Math.max(
        -1,
        Math.min(1, (scrollY - lastScrollY.current) / 30)
      );
      lastScrollY.current = scrollY;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        // Progress bar
        if (progressBar) {
          const pct = maxScroll > 0 ? (scrollY / maxScroll) * 100 : 0;
          progressBar.style.transform = `scaleX(${pct / 100})`;
        }

        // Parallax
        parallaxEls.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax ?? "0.15");
          const rect = el.getBoundingClientRect();
          const centerOffset = rect.top + rect.height / 2 - window.innerHeight / 2;
          const translateY = centerOffset * speed;
          el.style.transform = `translateY(${translateY}px)`;
        });

        // Velocity tilt on hero cards / feature cards
        tiltEls.forEach((el) => {
          const tilt = velocity.current * 3; // max ±3 deg
          el.style.transform = `perspective(600px) rotateX(${-tilt}deg) translateZ(0)`;
          el.style.transition = "transform 0.3s ease-out";
        });
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // Decay tilt back to 0 when not scrolling
    let decayTimer: ReturnType<typeof setTimeout>;
    const decayTilt = () => {
      clearTimeout(decayTimer);
      decayTimer = setTimeout(() => {
        tiltEls.forEach((el) => {
          el.style.transform = "perspective(600px) rotateX(0deg) translateZ(0)";
        });
      }, 150);
    };
    window.addEventListener("scroll", decayTilt, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", decayTilt);
      revealObs.disconnect();
      countObs.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(decayTimer);
    };
  }, []);
}