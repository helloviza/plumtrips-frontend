// apps/frontend/src/layouts/MainLayout.tsx
import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AuthModal from "../components/auth/AuthModal";
import ScrollToTop from "../components/ScrollToTop";

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      {/* Always start pages at the top */}
      <ScrollToTop />

      {/* Global header */}
      <Header />

      {/* Routed content */}
      <main className="flex-1 pt-0">
        <Outlet />
      </main>

      {/* Global luxury footer */}
      <Footer />

      {/* Keep router-managed scroll state between route changes if needed */}
      <ScrollRestoration getKey={(loc) => loc.pathname} />

      {/* Auth popup lives here */}
      <AuthModal />
    </div>
  );
}
