// src/pages/engine/HotelsEnginePage.tsx
import { useLocation } from "react-router-dom";
import { useMemo } from "react";

const PT_IN_HOTELS = "https://www.plumtrips.in/hotels";

export default function HotelsEnginePage() {
  const location = useLocation();

  const iframeUrl = useMemo(() => {
    const base = new URL(PT_IN_HOTELS);
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
      <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen bg-slate-50">
        <div className="relative -mt-4 md:-mt-6">
          <div className="relative h-[calc(100vh-4rem)] min-h-[640px] w-full">
            <iframe
              src={iframeUrl}
              title="PlumTrips Hotel Search"
              className="absolute inset-0 h-full w-full border-0"
              loading="lazy"
              sandbox="allow-forms allow-same-origin allow-scripts allow-popups allow-popups-to-escape-sandbox"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
