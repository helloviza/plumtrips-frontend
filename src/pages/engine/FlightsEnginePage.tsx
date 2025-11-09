// src/pages/engine/FlightsEnginePage.tsx
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

const PT_IN_FLIGHTS = "https://www.plumtrips.in/flights";

export default function FlightsEnginePage() {
  const location = useLocation();

  // Build plumtrips.in URL with same query string as .com
  const iframeUrl = useMemo(() => {
    const base = new URL(PT_IN_FLIGHTS);
    const search = new URLSearchParams(location.search);

    search.forEach((value, key) => {
      if (value != null && value !== "") {
        base.searchParams.set(key, value);
      }
    });

    return base.toString();
  }, [location.search]);

  return (
    <main className="relative bg-slate-50">
      {/* Full-bleed wrapper so iframe spans the full viewport width */}
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-slate-50">
        {/* Small negative margin so plumtrips.in header tucks under .com header nicely */}
        <div className="relative -mt-4 md:-mt-6">
          <div className="relative h-[calc(100vh-4rem)] min-h-[640px] w-full">
            <iframe
              src={iframeUrl}
              title="PlumTrips Flight Search"
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              // Allow scripts/forms/same-origin and popups so their flow can open new tabs
              sandbox="allow-forms allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
