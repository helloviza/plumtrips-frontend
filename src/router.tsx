// src/router.tsx
import type { ReactNode, ReactElement } from "react";
import { useEffect, lazy, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useSearchParams,
} from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";

import HolidaysPage from "./pages/holidays/HolidaysPage";
import MicePage from "./pages/mice/MicePage";
import CruisesPage from "./pages/cruises/CruisesPage";
import OffersPage from "./pages/offers/Offers";

import TermsPage from "./pages/legal/TermsPage";
import PrivacyPage from "./pages/legal/PrivacyPage";
import CancellationPage from "./pages/legal/CancellationPage";
import CookiesPage from "./pages/legal/CookiesPage";

import FlightsEnginePage from "./pages/engine/FlightsEnginePage";
import HotelsEnginePage from "./pages/engine/HotelsEnginePage";

import AboutPage from "./pages/About";

import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import Hotels from "./pages/Hotels";
import GoVisa from "./pages/go/Visa";
import Concierge from "./pages/go/Concierge";
import ContactPage from "./pages/contact/ContactPage";

// Flights
import SearchPage from "./pages/flights/Search";
import FarePage from "./pages/flights/Fare";
import FlightsForm from "./pages/Flights";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Account (protected)
import AccountLayout from "./pages/account/AccountLayout";
import MyProfile from "./pages/account/MyProfile";
import CoTravellers from "./pages/account/CoTravellers";
import Devices from "./pages/account/Devices";
import MyTrips from "./pages/account/MyTrips";
import MyWallet from "./pages/account/MyWallet";
import MyPayments from "./pages/account/MyPayments";
import MyWishlist from "./pages/account/MyWishlist";
import ResetPassword from "./pages/account/ResetPassword";
import Logout from "./pages/account/Logout";

// Providers & guard
import { AuthProvider } from "./context/AuthContext";
import { UiProvider } from "./context/UiContext";
import RequireAuth from "./components/RequireAuth";
import MarketingDash from "./pages/marketing/MarketingDash";
import MarketingLogin from "./pages/auth/MarketingLogin";
import Holiday from "./pages/marketing/Holidays";
import Blog from "./pages/marketing/Blogs"
import Cruise from "./pages/marketing/Cruises";
import Offer from "./pages/marketing/Offers"

import RequireMarketAuth from "./components/RequireMarketAuth";
import FrontpagePage from "./pages/marketing/Frontpage";

// BLOG (lazy to speed initial load)
const BlogIndex = lazy(() => import("./pages/blogs/BlogIndex"));
const BlogPost = lazy(() => import("./pages/blogs/BlogPost"));

// CAREERS (lazy)
const Careers = lazy(() => import("./pages/careers/Careers"));



// Tiny fallback while lazy chunks load
function RouteFallback() {
  return (
    <div className="px-4 py-10 text-center text-slate-600">
      Loading…
    </div>
  );
}

// ---------- HelloViza SSO forward ----------
function SsoForward(): ReactElement {
  const [sp] = useSearchParams();

  useEffect(() => {
    const HV_BASE =
      import.meta.env.VITE_HV_BACKEND ||
      import.meta.env.VITE_HV_SSO_CONSUMER_BASE ||
      "http://localhost:5055";

    const ticket = sp.get("ticket") || "";
    const ret = sp.get("ret") || "/go-for-visa";

    const url = new URL("/sso/consume", HV_BASE);
    if (ticket) url.searchParams.set("ticket", ticket);
    if (ret) url.searchParams.set("ret", ret);

    window.location.replace(url.toString());
  }, [sp]);

  const hvBase =
    import.meta.env.VITE_HV_BACKEND ||
    import.meta.env.VITE_HV_SSO_CONSUMER_BASE ||
    "http://localhost:5055";
  const ticket = (sp.get("ticket") || "").toString();
  const ret = (sp.get("ret") || "/go-for-visa").toString();
  const href = (() => {
    const u = new URL("/sso/consume", hvBase);
    if (ticket) u.searchParams.set("ticket", ticket);
    if (ret) u.searchParams.set("ret", ret);
    return u.toString();
  })();

  return (
    <div style={{ padding: "2rem" }}>
      Redirecting to HelloViza…{" "}
      <a href={href}>Click here if not redirected</a>
    </div>
  );
}

// Wrap the app with providers
const withProviders = (node: ReactNode): ReactElement => (
  <AuthProvider>
    <UiProvider>{node}</UiProvider>
  </AuthProvider>
);

export const router = createBrowserRouter(
  [

    {
      // Single root element that wraps ALL routes
      element: (
        <AuthProvider>
          <UiProvider>
            <Outlet />
          </UiProvider>
        </AuthProvider>
      ),
      children: [
    // ✅ Route WITHOUT header/footer
    {path: "/marketing-login",element: withProviders(<MarketingLogin />)},
    { path: "auth/login", element: withProviders(<Login />) }, 
    { path: "auth/register", element: withProviders(<Register />) },
    { path: "signin", element: withProviders(<Navigate to="/auth/login" replace />) },
            //Marketing Admin Panel
    {
  path: "/marketing-dash",
  element: withProviders(
    <RequireMarketAuth>
      <MarketingDash />
    </RequireMarketAuth>
  ),
  children: [
    { index: true, element: <Cruise /> },
    { path: "cruises", element: <Cruise /> },
    { path: "holidays", element: <Holiday /> },
    { path: "offers", element: <Offer /> },
    { path: "blogs", element: <Blog /> },
    { path: "frontpage", element: <FrontpagePage/> },
  ],
},
    // ✅ All other routes (with header/footer)
    {
      path: "/",
      element: withProviders(<MainLayout />), // MainLayout must render <Outlet />
      children: [
        { index: true, element: <Home /> },

        // Flights
        { path: "flights", element: <SearchPage /> },
        { path: "engine/flights", element: <FlightsEnginePage /> },
        { path: "flights/form", element: <FlightsForm /> },
        {
          path: "flights/fare",
          element: (
            <RequireAuth>
              <FarePage />
            </RequireAuth>
          ),
        },
        { path: "flights/search", element: <Navigate to="/flights" replace /> },
        {
          path: "flights/review",
          element: (
            <RequireAuth>
              <FarePage />
            </RequireAuth>
          ),
        },
        { path: "flight", element: <Navigate to="/flights/fare" replace /> },

        // Hotels + engines
        { path: "hotels", element: <Hotels /> },
        { path: "engine/hotels", element: <HotelsEnginePage /> },

        // Core sections
        { path: "holidays", element: <HolidaysPage /> },
        { path: "mice", element: <MicePage /> },
        { path: "support", element: <Support /> },
        { path: "cruises", element: <CruisesPage /> },
        { path: "contact", element: <ContactPage /> },
        { path: "offers", element: <OffersPage /> },

        // Legal pages
        { path: "privacy-policy", element: <PrivacyPage /> },
        { path: "terms-and-conditions", element: <TermsPage /> },
        { path: "cancellation-and-refund", element: <CancellationPage /> },
        { path: "cookies-policy", element: <CookiesPage /> },

        // About Us
        { path: "about", element: <AboutPage /> },

        // Visa
        { path: "go/visa", element: <GoVisa /> },
        { path: "visa", element: <Navigate to="/go/visa" replace /> },
        { path: "visas", element: <Navigate to="/go/visa" replace /> },

        // Concierge
        { path: "go/concierge", element: <Concierge /> },
        { path: "concierge", element: <Navigate to="/go/concierge" replace /> },


        // Careers
        {
          path: "careers",
          element: (
            <Suspense fallback={<RouteFallback />}>
              <Careers />
            </Suspense>
          ),
        },

        // BLOG
        {
          path: "blogs",
          element: (
            <Suspense fallback={<RouteFallback />}>
              <BlogIndex />
            </Suspense>
          ),
        },
        {
          path: "blogs/:slug",
          element: (
            <Suspense fallback={<RouteFallback />}>
              <BlogPost />
            </Suspense>
          ),
        },
        { path: "blog", element: <Navigate to="/blogs" replace /> },
        {
          path: "blog/:slug",
          element: (
            <Suspense fallback={<RouteFallback />}>
              <BlogPost />
            </Suspense>
          ),
        },

        // SSO forward
        { path: "sso/consume", element: <SsoForward /> },

        // Account (protected)
        {
          path: "account",
          element: (
            <RequireAuth>
              <AccountLayout />
            </RequireAuth>
          ),
          children: [
            { index: true, element: <MyProfile /> },
            { path: "profile", element: <MyProfile /> },
            { path: "co-travellers", element: <CoTravellers /> },
            { path: "devices", element: <Devices /> },
            { path: "reset-password", element: <ResetPassword /> },
            { path: "trips", element: <MyTrips /> },
            { path: "wallet", element: <MyWallet /> },
            { path: "payments", element: <MyPayments /> },
            { path: "wishlist", element: <MyWishlist /> },
            { path: "logout", element: <Logout /> },
          ],
        },

        // Shortcut
        { path: "my-trips", element: <Navigate to="/account/trips" replace /> },

        

        // 404
        { path: "*", element: <NotFound /> },
      ],
    },
  ],
},
  ],
  { basename: import.meta.env.BASE_URL }
);
