// apps/frontend/src/components/Header.tsx
import { Link, NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import UserMenu from "./UserMenu";
import { useUi } from "../context/UiContext";

/* >>> If you used Option A (bundled asset), keep this import: */
import logo from "../assets/logo.png";
/* >>> If you used Option B (public asset), delete the line above and:
   const logo = "/logo.png";
*/

const leftNav = [
  { to: "/flights", label: "Flights" },
  { to: "/hotels", label: "Hotels" },
  { to: "/go/visa", label: "Visa" },
  { to: "/holidays", label: "Holidays" },
  { to: "/mice", label: "MICE" },
];

const rightNav = [
  { to: "/blogs", label: "Blogs" },
  { to: "/offers", label: "Offers" },
  { to: "/business", label: "Business" },
  { to: "/cruises", label: "Cruises" },
];

const flashPhrases = [
  "Corporate Booking",
  "Enterprise Bookings",
  "Social Booking",
  "MICE Booking",
  "Holiday Booking",
  "VISA Booking",
];

export default function Header() {
  const [idx, setIdx] = useState(0);
  const { openAuth } = useUi();

  useEffect(() => {
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % flashPhrases.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#00477f] to-[#00477f] text-white">
        <div className="mx-auto flex h-22 max-w-screen-2xl items-center justify-between px-4 md:px-6">
          {/* Left: logo + left nav */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3" aria-label="PlumTrips home">
              <img
                src={logo}
                alt="PlumTrips"
                className="h-10 w-auto select-none object-contain pointer-events-none"
              />
            </Link>

            <nav className="hidden items-center gap-10 text-[17px] md:flex">
              {leftNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `relative pb-1 font-medium ${
                      isActive ? "text-white" : "text-white/90 hover:text-white"
                    }`
                  }
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
              ))}
            </nav>
          </div>

          {/* Center: FULL-HEIGHT rotating text — fly-in + sparkle */}
          <div className="relative hidden h-full flex-1 items-center justify-center md:flex">
            <div className="relative inline-flex h-full items-center justify-center">
              {/* sparkle lives behind the text and uses full header height */}
              <i
                key={`spark-${idx}`}
                className="sparkle-burst pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                aria-hidden
              />
              <span
                key={idx} // remount on change → animation restarts
                className="flycore z-10 text-[24px] md:text-[30px] font-extrabold leading-none tracking-wide"
                style={{ color: "#d06549" }}
              >
                {flashPhrases[idx]}
              </span>
            </div>
          </div>

          {/* Right: right nav + User menu */}
          <div className="flex items-center gap-6">
            <nav className="hidden items-center gap-8 text-[17px] lg:flex">
              {rightNav.map((item) => {
                if (item.label === "Business") {
                  return (
                    <button
                      key={item.label}
                      onClick={() => openAuth("mobile", "biz", true)}
                      className="relative pb-1 font-medium text-white/90 hover:text-white"
                      aria-label="Business sign in (MyBiz)"
                    >
                      {item.label}
                    </button>
                  );
                }
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `relative pb-1 font-medium ${
                        isActive ? "text-white" : "text-white/90 hover:text-white"
                      }`
                    }
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
              })}
            </nav>

            <UserMenu />
          </div>
        </div>
      </header>

      {/* Local styles for full-height fly-in + sparkles */}
      <style>{`
        :root {
          --spark: #f3cfae;   /* warm sparkle tint */
        }

        /* Smooth "from inside" reveal that uses the full header height */
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

        /* Sparkle burst now scales relative to the header (not clipped) */
        .sparkle-burst {
          width: 6px; height: 6px; border-radius: 9999px;
          color: var(--spark);
          opacity: .9;
          /* multiple tiny dots around center */
          box-shadow:
            0  -14px 0 0 currentColor,
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
          box-shadow: 0 0 0 0 currentColor;
          opacity: .55;
          animation: ringFull 1100ms ease-out forwards;
        }

        /* Expands to fit most of the header height */
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
