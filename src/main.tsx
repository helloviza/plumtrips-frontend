import { enableImageFallback } from "./utils/fixImageFallback";
enableImageFallback();


// apps/frontend/src/main.tsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./router";

/**
 * Global event wiring for Profile Meter actions:
 *  - plum:openOtp                → open AuthModal on "Mobile" tab
 *  - plum:sendEmailVerification  → POST verify-email; emit toast events (fallback to alert)
 *
 * It purposely does NOT import any modal/toast implementation—just dispatches events
 * your app can already listen for. Safe to keep even if no listeners exist.
 */
function GlobalEvents() {
  useEffect(() => {
    const openOtp = () => {
      // Forward to your AuthModal (expected listener in your app)
      window.dispatchEvent(
        new CustomEvent("plum:authmodal-open", { detail: { tab: "mobile" } })
      );
    };

    const sendEmailVerification = async () => {
      // Try v1 route first; fall back to legacy route if needed.
      const tryPost = async (url: string) => {
        const res = await fetch(url, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(await res.text().catch(() => "Request failed"));
      };

      try {
        try {
          await tryPost("/api/v1/auth/email/verify/start");
        } catch {
          await tryPost("/api/auth/email/verify/start");
        }

        // Toast if available; otherwise use alert as a minimal fallback.
        const detail = { type: "success", msg: "Verification email sent." };
        window.dispatchEvent(new CustomEvent("plum:toast", { detail }));
        // Fallback if no toast system picks it up within a tick
        setTimeout(() => {
          // @ts-expect-error optional global
          if (typeof window.__PLUM_TOAST_HANDLED__ === "undefined") {
            alert("Verification email sent.");
          }
        }, 50);
      } catch (err) {
        const detail = { type: "error", msg: "Could not send verification email." };
        window.dispatchEvent(new CustomEvent("plum:toast", { detail }));
        setTimeout(() => {
          // @ts-expect-error optional global
          if (typeof window.__PLUM_TOAST_HANDLED__ === "undefined") {
            alert("Could not send verification email. Please try again.");
          }
        }, 50);
        console.error(err);
      }
    };

    // Wire listeners for actions triggered by ProfileMeter
    window.addEventListener("plum:openOtp" as any, openOtp);
    window.addEventListener("plum:sendEmailVerification" as any, sendEmailVerification);

    return () => {
      window.removeEventListener("plum:openOtp" as any, openOtp);
      window.removeEventListener("plum:sendEmailVerification" as any, sendEmailVerification);
    };
  }, []);

  return null;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* Global event bridge for app-wide actions */}
    <GlobalEvents />
    <RouterProvider router={router} />
  </React.StrictMode>
);
