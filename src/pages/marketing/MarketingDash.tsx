// src/pages/marketing/MarketingDash.tsx
import { useMemo, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Ship,
  Umbrella,
  Tag,
  Pencil,
  LayoutDashboard,
  LogOut,
  Mail, Image
} from "lucide-react";

const logo = "/assets/logo.png";

export default function MarketingDash() {
  const { user, logout: marketlogout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.split("/")[2] || "cruises";

  const userEmail = useMemo(() => {
    return user?.email || "marketing@plumtrips.com";
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/marketing-login");
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    try {
      await marketlogout();
      navigate("/marketing-login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/marketing-login");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00477f] mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const headerTitle: Record<string, string> = {
    cruises: "Cruise Management",
    holidays: "Holiday Packages Management",
    offers: "Offers & Promotions Management",
    blogs: "Journal & Blog Management",
    frontpage: "Frontpage Management",
    Carousel: "Homepage Carousel Management",
  };

  return (
    <div className="flex h-screen bg-gray-50">

      {/* ── Sidebar ── */}
      <div className="w-60 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">

        {/*
          KEY FIX: sidebar-top is h-16 (64px) — exactly the same height as the
          main header. This locks the logo block and "Cruise Management" heading
          onto the same horizontal band, giving perfect side-by-side alignment.
        */}
        <div className="h-16 border-b border-gray-200 px-4 flex flex-col justify-center gap-0.5 flex-shrink-0">
          <img
            src={logo}
            alt="Plumtrips"
            className="h-9 w-auto object-contain"
          />
          <p className="text-[10px] text-center text-gray-400 font-medium tracking-wide uppercase">
            Marketing Control Panel
          </p>
        </div>

        {/* Nav — scrollable, fills remaining space */}
        <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-0.5">
          <NavItem
            icon={<Ship size={17} />}
            label="Cruises"
            isActive={activeTab === "cruises"}
            onClick={() => navigate("/marketing-dash/cruises")}
          />
          <NavItem
            icon={<Umbrella size={17} />}
            label="Holidays"
            isActive={activeTab === "holidays"}
            onClick={() => navigate("/marketing-dash/holidays")}
          />
          <NavItem
            icon={<Tag size={17} />}
            label="Offers"
            isActive={activeTab === "offers"}
            onClick={() => navigate("/marketing-dash/offers")}
          />
          <NavItem
            icon={<Pencil size={17} />}
            label="Blogs"
            isActive={activeTab === "blogs"}
            onClick={() => navigate("/marketing-dash/blogs")}
          />
          <NavItem
            icon={<LayoutDashboard size={17} />}
            label="Frontpage"
            isActive={activeTab === "frontpage"}
            onClick={() => navigate("/marketing-dash/frontpage")}
          />
          <NavItem
            icon={<Image size={17} />}
            label="Home Carousel"
            isActive={activeTab === "homecarousel"}
            onClick={() => navigate("/marketing-dash/homecarousel")}
           />
        </nav>

        {/* Footer logout — flex-shrink-0, NOT absolute */}
        <div className="p-3 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-medium text-sm"
          >
            <LogOut size={15} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/*
          KEY FIX: header is also h-16 (64px) — matches sidebar-top exactly.
          items-center keeps everything vertically centred in that same band.
        */}
        <div className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-semibold text-[#00477f]">
            {headerTitle[activeTab] ?? ""}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 flex items-center gap-1.5">
              <Mail size={14} />
              {userEmail}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-[#d06549] text-white rounded-lg hover:bg-[#c85a42] transition font-semibold text-sm"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>

        {/* Route outlet */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// ─── Nav Item ────────────────────────────────────────────────────────────────
function NavItem({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm text-left ${
        isActive
          ? "bg-[#d06549] text-white"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </button>
  );
}