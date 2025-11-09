// src/components/ScrollToTop.tsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function hardScrollToTop() {
  // robust: handle different scroll roots
  try {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    (document.scrollingElement || document.documentElement).scrollTop = 0;
    document.body.scrollTop = 0;
  } catch {}
}

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  // Disable browser's automatic restoration (covers refresh/back-forward)
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // on first mount (page load / hard refresh)
    hardScrollToTop();
  }, []);

  // On every route change, jump to top (ignore hash to always start at top)
  useEffect(() => {
    hardScrollToTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, search, hash]);

  return null;
}
