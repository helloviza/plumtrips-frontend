import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUi } from "../context/UiContext";

function AvatarCircle({ name }: { name: string }) {
  const initial = (name?.trim()?.[0] || "U").toUpperCase();
  return (
    <div className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white font-semibold">
      {initial}
    </div>
  );
}

export default function UserMenu() {
  const { user, logout } = useAuth();
  const { openAuth } = useUi();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onEsc);
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onEsc);
    };
  }, []);

  if (!user) {
    return (
      <button
        onClick={() => openAuth("mobile")}
        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0e67b8] hover:bg-white/90"
      >
        Sign in
      </button>
    );
  }

  const firstName =
    (user.fullName || user.email || "").replace(/@.*$/, "").split(/\s+/)[0];

  async function onLogout() {
    await logout();
    setOpen(false);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 rounded-full bg-white/10 pl-1 pr-3 py-1.5 text-white hover:bg-white/20"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <AvatarCircle name={firstName} />
        <span className="hidden sm:block">
          Hi, <strong>{firstName}</strong>
        </span>
        <svg
          className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.207l3.71-3.977a.75.75 0 111.08 1.04l-4.243 4.54a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-56 rounded-xl bg-white py-2 text-zinc-800 shadow-xl ring-1 ring-black/5"
        >
          <Item to="/account/profile" label="My Profile" icon="user" onClick={() => setOpen(false)} />
          <Item to="/account/trips" label="My Trips" icon="plane" onClick={() => setOpen(false)} />
          <Item to="/account/wallet" label="My Wallet" icon="wallet" onClick={() => setOpen(false)} />
          <Item to="/account/payments" label="My Payments" icon="card" onClick={() => setOpen(false)} />
          <Item to="/account/wishlist" label="My Wishlist" icon="heart" onClick={() => setOpen(false)} />
          <div className="my-2 h-px bg-zinc-100" />
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-50"
            role="menuitem"
          >
            <Icon name="logout" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
}

function Item({ to, label, icon, onClick }: { to: string; label: string; icon: IconName; onClick?: () => void }) {
  return (
    <Link to={to} onClick={onClick} role="menuitem" className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-50">
      <Icon name={icon} />
      <span>{label}</span>
    </Link>
  );
}

type IconName = "user" | "plane" | "wallet" | "card" | "heart" | "logout";
function Icon({ name }: { name: IconName }) {
  switch (name) {
    case "user":
      return (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 12a5 5 0 100-10 5 5 0 000 10ZM3 20.5a9 9 0 1118 0V22H3v-1.5Z" stroke="currentColor" strokeWidth="1.5"/></svg>);
    case "plane":
      return (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M10.5 12L3 9.5l1-2 7 2 8.5-7 1.5 1.5-7 8.5 2 7-2 1-2.5-7.5Z" stroke="currentColor" strokeWidth="1.5"/></svg>);
    case "wallet":
      return (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M3 7h16a2 2 0 012 2v8a2 2 0 01-2 2H3V7Z" stroke="currentColor" strokeWidth="1.5"/><path d="M3 7V5a2 2 0 012-2h10" stroke="currentColor" strokeWidth="1.5"/></svg>);
    case "card":
      return (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3 9h18" stroke="currentColor" strokeWidth="1.5"/></svg>);
    case "heart":
      return (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M12 21s-7.5-4.5-9-8.5A5.25 5.25 0 1112 7.75 5.25 5.25 0 1121 12.5c-1.5 4-9 8.5-9 8.5Z" stroke="currentColor" strokeWidth="1.5"/></svg>);
    case "logout":
      return (<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none"><path d="M15 17l5-5-5-5M20 12H9" stroke="currentColor" strokeWidth="1.5"/><path d="M12 19a7 7 0 110-14" stroke="currentColor" strokeWidth="1.5"/></svg>);
  }
}
