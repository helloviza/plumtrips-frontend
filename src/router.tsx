// src/router.tsx

import { type ReactElement, lazy, Suspense, useEffect } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useSearchParams,
  useParams
} from "react-router-dom";   

import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";


import DynamicDestination from "./pages/DynamicDestination";

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
import FlightSearchPage from "./pages/flights/Search";
import FarePage from "./pages/flights/Fare";
import FlightsForm from "./pages/Flights";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Hotel booking flow
import HotelSearch from "./pages/hotels/HotelSearch";
import HotelResults from "./pages/hotels/HotelResults";
import HotelDetail from "./pages/hotels/HotelDetail";
import RoomSelection from "./pages/hotels/RoomSelection";
import GuestDetails from "./pages/hotels/GuestDetails";
import Checkout from "./pages/hotels/Checkout";
import BookingConfirmation from "./pages/hotels/BookingConfirmation";
import SendCancellationRequest from "./pages/flights_new/SendCancellationPage";

//Read Blogs
import ReadBlogPage from "./pages/blogs/ReadBlogPage";

// Account
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

// Providers & guards
import { AuthProvider } from "./context/AuthContext";
import { UiProvider } from "./context/UiContext";
import RequireAuth from "./components/RequireAuth";

import MarketingDash from "./pages/marketing/MarketingDash";
import MarketingLogin from "./pages/auth/MarketingLogin";
import Holiday from "./pages/marketing/Holidays";
import Blog from "./pages/marketing/Blogs";
import Cruise from "./pages/marketing/Cruises";
import Offer from "./pages/marketing/Offers";
import FrontpagePage from "./pages/marketing/Frontpage";

import RequireMarketAuth from "./components/RequireMarketAuth";
import GlobalErrorBoundary from "./components/GlobalErrorBoundary";

// New Flight Flow
import FlightsFlow from "./pages/flights_new/FlightsFlow";
import SearchPage from "./pages/flights/Search";
import Search from "./pages/flights/Search";
import SearchTabs from "./components/SearchTabs";
import Home_Holiday from "./pages/Home_Holiday";
import HomeCarouselPage from "./pages/marketing/HomeCarousel";
import  Reviews from "./components/Reviews";
import TripPlanner from "./pages/Itenary/TripPlanner";
import CancellationPageFlights from "./pages/flights_new/CancellationPageFlights";
import { Send } from "lucide-react";

// BLOG
const BlogIndex = lazy(() => import("./pages/blogs/BlogIndex"));
const BlogPost = lazy(() => import("./pages/blogs/BlogPost"));

// CAREERS
const Careers = lazy(() => import("./pages/careers/Careers"));

function RouteFallback(): ReactElement {
  return (
    <div className="px-4 py-10 text-center text-slate-600">
      Loading…
    </div>
  );
}

function DynamicDestinationWrapper(): ReactElement {
  const params = useParams();

  return (
    <DynamicDestination
      params={{
        slug: params.slug || "",
      }}
    />
  );
}

// ---------- SSO Forward ----------
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

  const ticket = sp.get("ticket") || "";
  const ret = sp.get("ret") || "/go-for-visa";

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

export const router = createBrowserRouter(
  [
    {
      errorElement: <GlobalErrorBoundary />,
      element: (
        <AuthProvider>
          <UiProvider>
            <Outlet />
          </UiProvider>
        </AuthProvider>
      ),

      

      children: [

        // AUTH
        {
          path: "/marketing-login",
          element: <MarketingLogin />,
        },

        {
          path: "auth/login",
          element: <Login />,
        },

        {
          path: "auth/register",
          element: <Register />,
        },

        {
          path: "signin",
          element: <Navigate to="/auth/login" replace />,
        },

        // MARKETING DASH
        {
          path: "/marketing-dash",
          element: (
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
            { path: "frontpage", element: <FrontpagePage /> },
            { path: "homecarousel", element: <HomeCarouselPage /> },
          ],
        },

        // MAIN LAYOUT
        {
          path: "/",
          element: <MainLayout />,

          children: [
            { index: true, element: <Home /> },
            { path: "holidays", element: <Home_Holiday /> },
            { path: ":slug", element: <DynamicDestinationWrapper /> },

            // Flights
            {
              path: "flights",
              element: <FlightSearchPage />,
            },


            {
              path: "engine/flights",
              element: <FlightsEnginePage />,
            },

            {
              path: "flights/form",
              element: <FlightsForm />,
            },

            {
              path: "flights/fare",
              element: (
                <RequireAuth>
                  <FarePage />
                </RequireAuth>
              ),
            },

            {
              path: "flights/search",
              element: <Navigate to="/flights" replace />,
            },

            {
              path: "flights/review",
              element: (
                <RequireAuth>
                  <FarePage />
                </RequireAuth>
              ),
            },

            {
              path: "flight",
              element: <Navigate to="/flights/fare" replace />,
            },

            // Hotels
            // {
            //   path: "hotels",
            //   element: <Hotels />,
            // },

            {
              path: "engine/hotels",
              element: <HotelsEnginePage />,
            },

                    // Hotels + engines
        { path: "hotels", element: <Hotels /> },
        { path: "hotels/results", element: <HotelResults /> },
        { path: "hotels/:id", element: <HotelDetail /> },
        { path: "hotels/:id/rooms", element: <RoomSelection /> },
        { path: "hotels/guest-details", element: <GuestDetails /> },
        { path: "hotels/checkout", element: <Checkout /> },
        { path: "hotels/confirmation", element: <BookingConfirmation /> },
        { path: "engine/hotels", element: <HotelsEnginePage /> },


                    {
              path: "/reviews",
              element: <Reviews/>,
            },

        //Read Blogs

        {
          path: "readblogs/:id", element: <ReadBlogPage/>
        },
            // Sections




            {
              path: "mice",
              element: <MicePage />,
            },

                    {
          path: "/tripPlanner",
          element: <TripPlanner />,
        },

            {
              path: "support",
              element: <Support />,
            },

            {
              path: "cruises",
              element: <CruisesPage />,
            },

            {
              path: "contact",
              element: <ContactPage />,
            },

            {
              path: "offers",
              element: <OffersPage />,
            },

            // Legal
            {
              path: "privacy-policy",
              element: <PrivacyPage />,
            },

            {
              path: "terms-and-conditions",
              element: <TermsPage />,
            },

       {path:"/flights-new", element:<FlightsFlow/>},
       {path:"/flights-new/results" ,element:<FlightsFlow /> },
       {path:"/flights-new/booking", element:<FlightsFlow /> },
       {path:"/flights-new/confirmation" ,element:<FlightsFlow />},
       {path:"/flights-new/cancellation" ,element:<CancellationPageFlights />},
       {path:"/flights-new/SendCancellation" ,element:<SendCancellationRequest />},

            {
              path: "cancellation-and-refund",
              element: <CancellationPage />,
            },

            {
              path: "cookies-policy",
              element: <CookiesPage />,
            },

            // About
            {
              path: "about",
              element: <AboutPage />,
            },

            // Visa
            {
              path: "go/visa",
              element: <GoVisa />,
            },

            {
              path: "visa",
              element: <Navigate to="/go/visa" replace />,
            },

            {
              path: "visas",
              element: <Navigate to="/go/visa" replace />,
            },

            // Concierge
            {
              path: "go/concierge",
              element: <Concierge />,
            },

            {
              path: "concierge",
              element: <Navigate to="/go/concierge" replace />,
            },

            // Careers
            {
              path: "careers",
              element: (
                <Suspense fallback={<RouteFallback />}>
                  <Careers />
                </Suspense>
              ),
            },

            // Blogs
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

            {
              path: "blog",
              element: <Navigate to="/blogs" replace />,
            },

            {
              path: "blog/:slug",
              element: (
                <Suspense fallback={<RouteFallback />}>
                  <BlogPost />
                </Suspense>
              ),
            },

            // SSO
            {
              path: "sso/consume",
              element: <SsoForward />,
            },

            // Account
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

            {
              path: "my-trips",
              element: <Navigate to="/account/trips" replace />,
            },

            // 404
            {
              path: "*",
              element: <NotFound />,
            },
          ],
        },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  }
);

