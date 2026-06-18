// apps/frontend/src/components/Header.tsx
import { Link, NavLink, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import UserMenu from "./UserMenu";
import { useUi } from "../context/UiContext";
import { MapPin, PhoneCall, Briefcase, ClipboardList } from "lucide-react";

const logo = "/assets/logoW&OO.png";
const EXTERNAL_BUSINESS_URL = "https://plumbox.plumtrips.com";

/**
 * Use this on any page that wants its hero/content to bleed under the
 * floating header (same treatment as Home and Hotels).
 *
 * Utility bar (~36px) + floating nav (72px) + top padding (16px) = ~124px
 *
 * Usage:
 *   import { HEADER_BLEED } from "./Header";
 *   <div className={HEADER_BLEED}>...</div>
 *
 * Or just add `-mt-[124px]` directly to your page's top wrapper.
 */
export const HEADER_BLEED = "-mt-[124px]" as const;

const REGIONS = [
  { id: "IN", text: "🇮🇳 India — INR (₹)" },
  { id: "AE", text: "🇦🇪 Dubai (UAE) — AED (د.إ)" },
  { id: "VN", text: "🇻🇳 Vietnam — VND (₫)" },
  { id: "US", text: "🇺🇸 USA — USD ($)" },
];

const allNav = [
  { to: "/",        label: "Flights",       exact: true  },
  { to: "/hotels",  label: "Hotels",        exact: true  },
  { to: "/holidays", label: "Holidays",     exact: false },
  { to: "/mice",    label: "Group Booking", exact: false },
  { to: "/blogs",   label: "Blogs",         exact: false },
  { to: "/offers",  label: "Offers",        exact: false },
  { to: "/business", label: "Business",     exact: false },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [regionMenuOpen, setRegionMenuOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(REGIONS[0]);
  
  const { openAuth } = useUi();
  const location = useLocation();

  const toggleMobile = () => setMobileOpen((v) => !v);
  const closeMobile = () => setMobileOpen(false);

  useEffect(() => { closeMobile(); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isFloating = !scrolled;

  const externalByLabel = useMemo(
    () => ({ Business: EXTERNAL_BUSINESS_URL }) as Record<string, string>,
    []
  );

  // ── Desktop nav item ──
  const renderNavItemDesktop = (item: { to: string; label: string; exact: boolean }) => {
    const externalUrl = externalByLabel[item.label];
    const baseClasses =
      "relative flex items-center h-full px-4 text-[14px] font-medium transition-colors duration-200";

    if (externalUrl) {
      return (
        <a
          key={item.label}
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClasses} text-white/70 hover:text-white`}
          onClick={closeMobile}
        >
          {item.label}
        </a>
      );
    }

    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.exact}
        className={({ isActive }) =>
          `${baseClasses} ${isActive ? "text-white" : "text-white/70 hover:text-white"}`
        }
        onClick={closeMobile}
      >
        {({ isActive }) => (
          <>
            {item.label}
            {isActive && (
              <span className="absolute left-4 right-4 bottom-0 h-[3px] rounded-t-md bg-[#d06549]" />
            )}
          </>
        )}
      </NavLink>
    );
  };

  // ── Mobile nav item ──
  const renderNavItemMobile = (item: { to: string; label: string; exact: boolean }) => {
    const externalUrl = externalByLabel[item.label];
    if (externalUrl) {
      return (
        <a
          key={item.label}
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-lg px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 text-[15px] font-medium transition-all"
          onClick={closeMobile}
        >
          {item.label}
        </a>
      );
    }

    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.exact}
        className={({ isActive }) =>
          `block rounded-lg px-4 py-3 text-[15px] transition-all ${
            isActive
              ? "font-semibold text-white bg-[#d06549]/20 border border-[#d06549]/30"
              : "font-medium text-white/80 hover:text-white hover:bg-white/10"
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
      <div className="sticky top-0 z-[1000] w-full font-sans bg-transparent">

        {/* ── TOP UTILITY BAR ── */}
        <div className="hidden md:flex items-center justify-between px-8 py-2 bg-[#060c18] text-[11px] font-medium text-white/70">
          <div className="flex gap-8">
            <button className="flex items-center gap-2 hover:text-white transition-colors">
              <PhoneCall size={14} className="opacity-70" /> 24/7 Support
            </button>
            <button className="flex items-center gap-2 hover:text-white transition-colors">
              <Briefcase size={14} className="opacity-70" /> Corporate Travel
            </button>
            <button className="flex items-center gap-2 hover:text-white transition-colors">
              <ClipboardList size={14} className="opacity-70" /> Manage Booking
            </button>
          </div>
          <div className="flex gap-8 relative">
            <button 
              className="flex items-center gap-2 hover:text-white transition-colors"
              onClick={() => setRegionMenuOpen(!regionMenuOpen)}
            >
              <MapPin size={16} />
              <span>{selectedRegion.text}</span>
              <span className={`text-[9px] opacity-60 transition-transform duration-200 ${regionMenuOpen ? "rotate-180" : ""}`}>
                ▼
              </span>
            </button>

            {/* Dropdown Menu */}
            {regionMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-[1000]" 
                  onClick={() => setRegionMenuOpen(false)} 
                />
                <div className="absolute right-0 top-[calc(100%+8px)] flex flex-col w-[200px] bg-[#0b1528] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[1001]">
                  {REGIONS.map((region) => (
                    <button
                      key={region.id}
                      className={`text-left px-4 py-3 text-[12px] transition-colors ${
                        selectedRegion.id === region.id 
                          ? "bg-[#d06549]/20 text-white font-medium" 
                          : "text-white/70 hover:text-white hover:bg-white/5"
                      }`}
                      onClick={() => {
                        setSelectedRegion(region);
                        setRegionMenuOpen(false);
                      }}
                    >
                      {region.text}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── MAIN NAV WRAPPER ── */}
        <div
          className={`w-full transition-all duration-300 ease-in-out ${
            isFloating
              ? "bg-transparent px-4 md:px-6 pt-4"
              : "bg-[#0b1528] shadow-[0_4px_20px_rgba(0,0,0,0.15)] border-b border-white/5"
          }`}
        >
          <div
            className={`mx-auto flex items-center justify-between transition-all duration-300 ease-in-out ${
              isFloating
                ? "max-w-full bg-[#0b1528]/40 backdrop-blur-xl border border-white/20 rounded-2xl h-[72px] px-5 md:px-8 shadow-xl"
                : "max-w-full h-[64px] px-6 md:px-10 rounded-none border-transparent"
            }`}
          >
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center h-full">
              <Link to="/" className="flex items-center" aria-label="Plumtrips home" onClick={closeMobile}>
                <img
                  src={logo}
                  alt="Plumtrips"
                  className={`${isFloating ? "h-30" : "h-28"} w-auto select-none object-contain pointer-events-none transition-all duration-300`}
                />
              </Link>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex flex-1 items-center justify-center h-full gap-2">
              {allNav.map(renderNavItemDesktop)}
            </nav>

            {/* Right: UserMenu + mobile burger */}
            <div className="flex-shrink-0 flex items-center gap-4 h-full">
              <div className="signin-wrapper flex items-center h-full">
                <UserMenu />
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 md:hidden hover:bg-white/10 transition-colors"
                onClick={toggleMobile}
                aria-label="Toggle navigation menu"
              >
                <div className="space-y-1.5">
                  <span className={`block h-[2px] w-5 bg-white transition-transform duration-300 ${mobileOpen ? "translate-y-[8px] rotate-45" : ""}`} />
                  <span className={`block h-[2px] w-5 bg-white transition-opacity duration-300 ${mobileOpen ? "opacity-0" : "opacity-100"}`} />
                  <span className={`block h-[2px] w-5 bg-white transition-transform duration-300 ${mobileOpen ? "-translate-y-[8px] -rotate-45" : ""}`} />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ── Mobile slide-down menu ── */}
        <div
          className={`absolute top-[100%] left-0 w-full md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="m-4 rounded-2xl border border-white/10 bg-[#081020]/95 backdrop-blur-2xl p-3 shadow-2xl">
            <nav className="flex flex-col gap-1">
              {allNav.map(renderNavItemMobile)}
            </nav>
          </div>
        </div>
      </div>

      <style>{`
        :root { --accent: #d06549; }
        .signin-wrapper button, .signin-wrapper a[role="button"] {
          background-color: var(--accent) !important; color: white !important;
          padding: 8px 20px !important; border-radius: 8px !important;
          border: none !important; font-size: 14px !important; font-weight: 600 !important;
          cursor: pointer !important; letter-spacing: 0.02em !important;
          box-shadow: 0 4px 14px rgba(208,101,73,0.3) !important;
          transition: all 0.2s ease-in-out !important;
          display: flex !important; align-items: center !important; gap: 8px !important;
        }
        .signin-wrapper button::before, .signin-wrapper a[role="button"]::before {
          content: ""; display: inline-block; width: 16px; height: 16px;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E");
          background-size: contain; background-repeat: no-repeat;
        }
        .signin-wrapper button:hover, .signin-wrapper a[role="button"]:hover {
          background-color: #bd553b !important;
          box-shadow: 0 6px 20px rgba(208,101,73,0.5) !important;
          transform: translateY(-1px) !important;
        }
      `}</style>
    </>
  );
}