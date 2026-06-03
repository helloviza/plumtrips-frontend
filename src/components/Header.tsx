// apps/frontend/src/components/Header.tsx
import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import UserMenu from "./UserMenu";
import { useUi } from "../context/UiContext";

// Public logo (placed in apps/frontend/public/assets/logo.png)
const logo = "/assets/logoW&OO.png";
const EXTERNAL_BUSINESS_URL = "https://plumbox.plumtrips.com";

const allNav = [
  { to: "/flights-new/results", label: "Flights" },
  { to: "/hotels/results?default=true", label: "Hotels" },
  { to: "/holidays", label: "Holidays" },
  { to: "/mice", label: "Group Booking" },
  { to: "/blogs", label: "Blogs" },
  { to: "/offers", label: "Offers" },
  { to: "/business", label: "Business" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openAuth } = useUi();
  const location = useLocation();

  // Only merge with hero on the home page
 const isHome = location.pathname === "/" || location.pathname === "/home";
  const isTransparent = isHome && !scrolled;

  const toggleMobile = () => setMobileOpen((v) => !v);
  const closeMobile = () => setMobileOpen(false);

  // Close mobile menu on route change
  useEffect(() => {
    closeMobile();
  }, [location.pathname]);

  // Scroll listener — threshold 10px so it triggers almost immediately
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    // Set initial state in case page loads mid-scroll (e.g. browser back)
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const externalByLabel = useMemo(
  () =>
    ({
      Business: EXTERNAL_BUSINESS_URL,
    }) as Record<string, string>,
  []
);

  const renderNavItemDesktop = (item: { to: string; label: string }) => {
    const externalUrl = externalByLabel[item.label];
    if (externalUrl) {
  return (
    <a
      key={item.label}
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="relative pb-1 font-medium text-white/90 hover:text-white transition-colors"
      onClick={closeMobile}
      aria-label={`${item.label} (opens external site)`}
    >
      {item.label}
    </a>
  );
}

    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `nav-item relative pb-1 font-medium transition-colors ${
            isActive ? "text-white" : "text-white/90"
          }`
        }
        onClick={closeMobile}
      >
        {({ isActive }) => (
          <>
            {item.label}
            {isActive && (
              <span className="absolute -bottom-1 left-0 h-[3px] w-8 bg-[#d06549]" />
            )}
          </>
        )}
      </NavLink>
    );
  };

  const renderNavItemMobile = (item: { to: string; label: string }) => {
    const externalUrl = externalByLabel[item.label];
    if (externalUrl) {
  return (
    <a
      key={item.label}
      href={externalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded px-1 py-1.5 text-white/90"
      onClick={closeMobile}
      aria-label={`${item.label} (opens external site)`}
    >
      {item.label}
    </a>
  );
}

    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={({ isActive }) =>
          `nav-item-mobile block rounded px-1 py-1.5 ${
            isActive ? "font-semibold text-white" : "text-white/90"
          }`
        }
        onClick={closeMobile}
      >
        {item.label}
      </NavLink>
    );
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 text-white transition-[background-color,box-shadow] duration-300 ease-in-out ${
          isTransparent
            ? "bg-transparent shadow-none"
            : "bg-[#00477f] shadow-md"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-screen-2xl items-center px-4 md:px-6">

          {/* ── LEFT: Logo ── */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center"
              aria-label="Plumtrips home"
              onClick={closeMobile}
            >
              <img
                src={logo}
                alt="Plumtrips"
                className="h-36 w-auto select-none object-contain pointer-events-none"
              />
            </Link>
          </div>

          {/* ── CENTER: All nav items (desktop) ── */}
          <nav className="hidden md:flex flex-1 items-center justify-center gap-7 text-[15.5px]">
            {allNav.map(renderNavItemDesktop)}
          </nav>

          {/* ── RIGHT: UserMenu + mobile burger ── */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="signin-wrapper">
              <UserMenu />
            </div>

            {/* Mobile burger (only < md) */}
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 md:hidden"
              onClick={toggleMobile}
              aria-label="Toggle navigation menu"
            >
              <div className="space-y-1.5">
                <span
                  className={`block h-[2px] w-5 bg-white transition-transform ${
                    mobileOpen ? "translate-y-[5px] rotate-45" : ""
                  }`}
                />
                <span
                  className={`block h-[2px] w-5 bg-white transition-opacity ${
                    mobileOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`block h-[2px] w-5 bg-white transition-transform ${
                    mobileOpen ? "-translate-y-[5px] -rotate-45" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* ── Mobile slide-down menu ── */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/20 bg-[#439be2]">
            <nav className="mx-auto max-w-screen-2xl px-4 py-3 flex flex-col gap-2 text-sm">
              {allNav.map(renderNavItemMobile)}
            </nav>
          </div>
        )}
      </header>

      {/* Local styles */}
      <style>{`
        :root {
          --spark: #f3cfae;
          --accent: #d06549;
        }

        /* ── Desktop nav hover ── */
        .nav-item:hover {
          color: var(--accent) !important;
        }

        /* ── Mobile nav hover ── */
        .nav-item-mobile:hover {
          color: var(--accent) !important;
          background-color: rgba(208, 101, 73, 0.15);
        }

        /* ── Sign-in button background ── */
        .signin-wrapper button,
        .signin-wrapper a[role="button"] {
          background-color: var(--accent) !important;
          border-color: var(--accent) !important;
          color: white !important;
        }
        .signin-wrapper button:hover,
        .signin-wrapper a[role="button"]:hover {
          background-color: #b8503a !important;
          border-color: #b8503a !important;
        }

        @keyframes flyCore {
          0%   { opacity: 0; transform: scale(.88) translateY(10%); letter-spacing: .02em; filter: blur(5px); }
          55%  { opacity: .98; transform: scale(1.04) translateY(0);   filter: blur(.35px); }
          100% { opacity: 1;  transform: scale(1)    translateY(0);   filter: blur(0); }
        }
        .flycore {
          animation: flyCore 900ms cubic-bezier(.18,.72,.18,1) both;
          text-shadow: 0 1px 0 rgba(255,255,255,.25);
          will-change: transform, opacity, filter, letter-spacing;
        }
        .sparkle-burst {
          width: 6px; height: 6px; border-radius: 9999px;
          color: var(--spark);
          opacity: .9;
          box-shadow:
            0  -14px 0  0 currentColor,
            14px   0  0 0 currentColor,
           -14px   0  0 0 currentColor,
            0   14px 0 0 currentColor,
            10px   8px 0 0 currentColor,
           -10px  -8px 0 0 currentColor,
            12px  -6px 0 0 currentColor,
           -12px   6px 0 0 currentColor,
             6px -12px 0 0 currentColor,
            -6px  12px 0 0 currentColor;
          filter:
            drop-shadow(0 0 8px rgba(243,207,174,.9))
            drop-shadow(0 0 18px rgba(243,207,174,.45));
          animation: burstFull 1100ms ease-out forwards;
          z-index: 0;
        }
        .sparkle-burst::after {
          content: "";
          position: absolute;
          left: 50%; top: 50%;
          width: 2px; height: 2px; border-radius: 9999px;
          background: currentColor;
          transform: translate(-50%, -50%);
          opacity: .55;
          animation: ringFull 1100ms ease-out forwards;
        }
        @keyframes burstFull {
          0%   { transform: translate(-50%, -50%) scale(.5);  opacity: .95; }
          70%  { transform: translate(-50%, -50%) scale(1.8); opacity: .85; }
          100% { transform: translate(-50%, -50%) scale(2.6); opacity: 0;   }
        }
        @keyframes ringFull {
          0%   { box-shadow: 0 0 0 0 currentColor; opacity: .55; }
          100% { box-shadow: 0 0 0 28px rgba(243,207,174,0); opacity: 0; }
        }
      `}</style>
    </>
  );
}