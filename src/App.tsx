import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import Flights from "./pages/Flights";
import FlightReviewPage from "./pages/Flight";
import Careers from "./pages/careers/Careers"; // ⬅️ note the folder + file


// ⬇️ adjust this import path to where you saved HomeExplore.tsx
// e.g. "./components/home/HomeExplore" or "./components/HomeExplore"
import HomeExplore from "./components/home/HomeExplore";

function HomeLanding() {
  return (
    <div className="min-h-[60vh] bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
        <div className="text-3xl font-bold">PlumTrips Frontend is Ready 🚀</div>
        <p className="max-w-2xl text-white/90">
          Use the homepage chips to explore. Careers is available via the HomeExplore chip.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/flights?from=BOM&to=DEL&date=2025-09-01&adults=1&cabin=economy"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-white/90"
          >
            Try a sample search
          </Link>
          <Link
            to="/flights"
            className="rounded-lg border border-white/60 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Open Flights page
          </Link>
        </div>
      </div>
    </div>
  );
}

function Home() {
  return (
    <>
      <HomeLanding />
      {/* Mount HomeExplore so the Careers chip is visible on the home page */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <HomeExplore />
      </div>
    </>
  );
}

function BookPlaceholder() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-lg border bg-white p-6">
        <h1 className="mb-2 text-xl font-bold">Booking – Placeholder</h1>
        <p className="text-zinc-600">
          This is a placeholder for <code>/flights/book</code>.
        </p>
        <div className="mt-4">
          <Link to="/flights" className="text-blue-700 underline underline-offset-4">
            ← Back to flights
          </Link>
        </div>
      </div>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Simple header (no Careers link here) */}
      <header className="sticky top-0 z-10 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="text-lg font-bold text-blue-700">
            PlumTrips
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="text-zinc-700 hover:text-blue-700">
              Home
            </Link>
            <Link to="/flights" className="text-zinc-700 hover:text-blue-700">
              Flights
            </Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* HOME: now includes HomeExplore (with the Careers chip linking to /careers) */}
        <Route
          path="/"
          element={
            <Shell>
              <Home />
            </Shell>
          }
        />

        {/* Search/results */}
        <Route
          path="/flights"
          element={
            <Shell>
              <Flights />
            </Shell>
          }
        />

        {/* Careers page (only reachable via the Careers chip in HomeExplore) */}
        <Route
          path="/careers"
          element={
            <Shell>
              <Careers />
            </Shell>
          }
        />

        {/* Review routes */}
        <Route
          path="/flight"
          element={
            <Shell>
              <FlightReviewPage />
            </Shell>
          }
        />
        <Route
          path="/flights/review"
          element={
            <Shell>
              <FlightReviewPage />
            </Shell>
          }
        />
        <Route
          path="/flights/:slug"
          element={
            <Shell>
              <FlightReviewPage />
            </Shell>
          }
        />

        {/* Book placeholder */}
        <Route
          path="/flights/book"
          element={
            <Shell>
              <BookPlaceholder />
            </Shell>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
