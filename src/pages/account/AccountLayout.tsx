// apps/frontend/src/pages/account/AccountLayout.tsx
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/* Inline outline icons (24x24, currentColor) */
const ico = {
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4 19.5c1.8-3.2 5-5 8-5s6.2 1.8 8 5" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="8.5" r="3" />
      <path d="M2.5 19c1.3-2.6 3.9-4 6.5-4" />
      <circle cx="17" cy="9.5" r="2.5" />
      <path d="M13.5 14.5c2.3 0 4.8 1.2 6 3.5" />
    </svg>
  ),
  plane: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M10 13l-7-2 1-2 8 1 6-6 3 3-6 6 1 8-2 1-2-7-4 4-2-2 4-4z" />
    </svg>
  ),
  wallet: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M17 10h2a2 2 0 012 2 2 2 0 01-2 2h-2z" />
      <path d="M3 8l12-3" />
    </svg>
  ),
  card: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 10h18M7 15h4" />
    </svg>
  ),
  heart: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20s-7-4.5-9-8.5A5.5 5.5 0 0112 7a5.5 5.5 0 019 4.5C19 15.5 12 20 12 20z" />
    </svg>
  ),
  monitor: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 118 0v3" />
    </svg>
  ),
  logout: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 12H3" />
      <path d="M11 8l-4 4 4 4" />
      <path d="M21 4v16a2 2 0 01-2 2h-6" />
    </svg>
  ),
};

/* Left-side nav items with icons */
const nav = [
  { to: "/account/profile", label: "My Profile", icon: ico.user },
  { to: "/account/trips", label: "My Trips", icon: ico.plane },
  { to: "/account/wallet", label: "My Wallet", icon: ico.wallet },
  { to: "/account/payments", label: "My Payments", icon: ico.card },
  { to: "/account/wishlist", label: "My Wishlist", icon: ico.heart },
  { to: "/account/co-travellers", label: "Co-Travellers", icon: ico.users },
  { to: "/account/devices", label: "Logged in Devices", icon: ico.monitor },
  { to: "/account/reset-password", label: "Reset Password", icon: ico.lock },
  { to: "/account/logout", label: "Logout", icon: ico.logout },
];

export default function AccountLayout() {
  const { user } = useAuth();
  const first = (user?.fullName || user?.email || "?").trim()[0]?.toUpperCase() || "U";

  // Respect BASE_URL if app is deployed under a subpath
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const bannerUrl = `${base}/assets/account/banner.jpg`;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-zinc-50 pb-14">
      <div className="mx-auto w-full max-w-[1440px] px-3 sm:px-6">
        {/* Banner (gradient + image overlay) */}
        <div className="relative mt-6 overflow-hidden rounded-2xl text-white shadow-lg bg-gradient-to-r from-sky-900 via-sky-800 to-sky-700 min-h-[220px] md:min-h-[260px]">
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-35"
            style={{ backgroundImage: `url(${bannerUrl})` }}
            aria-hidden
          />
          <div className="relative flex h-full flex-col gap-6 p-6 md:flex-row md:items-center md:gap-8 md:p-8">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-white/15 text-2xl font-semibold ring-1 ring-white/20">
              {first}
            </div>
            <div className="flex-1">
              <div className="text-xl font-semibold leading-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                {user?.fullName || user?.email}
              </div>
              {user?.email && (
                <div className="mt-1 text-sm text-white/80 drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                  {user.email}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Left nav */}
          <aside className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
            <nav className="p-2" aria-label="Account navigation">
              {nav.map((n) => (
                <div key={n.to}>
                  {n.label === "Logout" && <div className="my-2 border-t border-zinc-100" />}
                  <NavLink
                    to={n.to}
                    end={n.to === "/account/profile"}
                    className={({ isActive }) =>
                      `cursor-pointer flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-medium
                       ${
                         isActive
                           ? "bg-sky-50 text-sky-900 ring-1 ring-sky-200"
                           : "text-zinc-700 hover:bg-zinc-50"
                       }`
                    }
                  >
                    <span className="w-6 h-6 shrink-0">{n.icon}</span>
                    <span>{n.label}</span>
                  </NavLink>
                </div>
              ))}
            </nav>
          </aside>

          {/* Right content */}
          <section className="min-w-0">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  );
}
