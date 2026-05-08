// src/pages/marketing/MarketingDash.tsx
import { useMemo, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

const logo = "/assets/logo.png";

export default function MarketingDash() {
  const { user, logout: marketlogout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ ALL hooks must be called before any early return
  const activeTab = location.pathname.split("/")[2] || "cruises"; // default to holidays if no subpath

  const userEmail = useMemo(() => {
    return user?.email || "marketing@plumtrips.com";
  }, [user]);

  // Auth redirect — runs as a side-effect, not an early return
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

  // ✅ Conditional renders AFTER all hooks
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-xl overflow-y-auto border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          
          <div className="flex items-center gap-3 mb-2">
            <img  src={logo} alt="Plumtrips" className="h-10 w-10 rounded" />
            <span className="font-bold text-xl text-[#00477f]">Plumtrips</span>
          </div>
          <p className="text-xs text-gray-600">Marketing Control Panel</p>
        </div>

        {/* Welcome */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-[#d06549] flex items-center justify-center text-white font-bold">
              {(user?.email?.[0] || "M").toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">Welcome!</p>
              <p className="text-xs text-gray-600 truncate">{userEmail}</p>
            </div>
          </div>
          <div className="text-xs text-gray-700 bg-white rounded px-2 py-1 text-center font-medium">
            Marketing Admin
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 space-y-2">
          <NavItem
            icon="🚢"
            label="Cruises"
            isActive={activeTab === "cruises"}
            onClick={() => navigate("/marketing-dash/cruises")}
          />
          <NavItem
            icon="🏖️"
            label="Holidays"
            isActive={activeTab === "holidays"}
            onClick={() => navigate("/marketing-dash/holidays")}
          />
          <NavItem
            icon="🎁"
            label="Offers"
            isActive={activeTab === "offers"}
            onClick={() => navigate("/marketing-dash/offers")}
          />
          <NavItem
            icon="📝"
            label="Blogs"
            isActive={activeTab === "blogs"}
            onClick={() => navigate("/marketing-dash/blogs")}
          />
          <NavItem
            icon="🏠"
            label="Frontpage"
            isActive={activeTab === "frontpage"}
            onClick={() => navigate("/marketing-dash/frontpage")}
          />
        </div>

        {/* Footer logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white w-64">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition font-medium text-sm"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white shadow border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#00477f]">
            {activeTab === "cruises" && "Cruise Management"}
            {activeTab === "holidays" && "Holiday Packages Management"}
            {activeTab === "offers" && "Offers & Promotions Management"}
            {activeTab === "blogs" && "Journal & Blog Management"}
            {activeTab === "frontpage" && "Frontpage Management"}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">📧 {userEmail}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-[#d06549] text-white rounded-lg hover:bg-[#c85a42] transition font-semibold text-sm"
            >
              <span>🚪</span>
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

// ─── Nav Item ─────────────────────────────────────────────────────────────────
function NavItem({
  icon,
  label,
  isActive,
  onClick,
}: {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-left ${
        isActive
          ? "bg-[#d06549] text-white shadow-lg"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );
}