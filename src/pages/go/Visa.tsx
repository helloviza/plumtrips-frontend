// src/pages/go/Visa.tsx
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useLocation } from "react-router-dom";
import { api } from "../../utils/api";
import { useUi } from "../../context/UiContext";

type TicketResp = { ok: boolean; redirectUrl: string };

function getHvBase(): string {
  // HelloViza BACKEND origin where /sso/consume lives
  return (
    import.meta.env.VITE_HV_BACKEND ||
    import.meta.env.VITE_HV_SSO_CONSUMER_BASE || // optional alias
    "http://localhost:5055"
  );
}

/**
 * Build the absolute HelloViza /sso/consume URL ON THE BACKEND HOST (always),
 * and preserve a safe SPA-relative ret (path+search only) so HV lands on /go-for-visa.
 *
 * NOTE: We purposely ignore the host/origin in redirectUrlFromApi to avoid
 * "Cannot GET /sso/consume" when that URL points to the HV FRONTEND host.
 */
function buildConsumeUrl(
  redirectUrlFromApi: string | null,
  retPathPlusSearch: string
) {
  const HV_BASE = getHvBase();

  // 1) Extract ticket (if present) from redirectUrlFromApi
  let ticket: string | null = null;
  if (redirectUrlFromApi) {
    try {
      const u = new URL(redirectUrlFromApi, window.location.origin);
      ticket = u.searchParams.get("ticket");
    } catch {
      /* ignore */
    }
  }

  // 2) Normalize ret to path+search only, default to /go-for-visa
  let safeRet = "/go-for-visa";
  try {
    const tmp = new URL(retPathPlusSearch, window.location.origin);
    safeRet = tmp.pathname + tmp.search;
    if (!safeRet.startsWith("/")) safeRet = "/go-for-visa";
  } catch {
    /* keep default */
  }

  // 3) ALWAYS point to the HV BACKEND /sso/consume
  const result = new URL("/sso/consume", HV_BASE);
  if (ticket) result.searchParams.set("ticket", ticket);
  result.searchParams.set("ret", safeRet);
  return result.toString();
}

export default function GoVisa() {
  const { openAuth } = useUi();
  const location = useLocation();

  const [phase, setPhase] =
    useState<"checking" | "auth" | "loading" | "error">("checking");
  const [err, setErr] = useState<string | null>(null);
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);

  // guards
  const once = useRef(false);
  const pollId = useRef<number | null>(null);
  const tries = useRef(0);

  const clearPoll = () => {
    if (pollId.current) {
      window.clearInterval(pollId.current);
      pollId.current = null;
    }
  };

  async function issueTicketAndEmbed() {
    try {
      setPhase("loading");

      // Preserve current query params so HV can prefill
      const retPathPlusSearch =
        "/go-for-visa" + (location.search ? location.search : "");

      // Ask PT issuer for a ticket; it returns a redirectUrl (may be relative or wrong-origin)
      const { redirectUrl } = await api.post<TicketResp>("/api/v1/sso/ticket", {
        aud: "helloviza",
        return: retPathPlusSearch,
      });

      // Force /sso/consume to the HV BACKEND host to avoid "Cannot GET /sso/consume" on FE host
      const absoluteConsumer = buildConsumeUrl(redirectUrl, retPathPlusSearch);

      // Embed the SSO handoff; it will 302 to HV SPA /go-for-visa inside this iframe (full width)
      setIframeSrc(absoluteConsumer);
    } catch (e: any) {
      if (e?.status === 401) {
        promptLogin();
      } else {
        setPhase("error");
        setErr(e?.message || "Could not connect to Visa.");
      }
    }
  }

  function promptLogin() {
    if (phase !== "auth") {
      setPhase("auth");
      openAuth?.();

      if (!pollId.current) {
        pollId.current = window.setInterval(async () => {
          tries.current += 1;
          try {
            await api.get("/api/v1/me/profile");
            clearPoll();
            await issueTicketAndEmbed();
          } catch {
            if (tries.current >= 15) {
              clearPoll();
              setPhase("error");
              setErr(
                "We couldn’t detect a login. Please finish signing in in the popup, then refresh."
              );
            }
          }
        }, 1000);
      }
    }
  }

  async function checkAuthThenGo() {
    if (once.current) return;
    once.current = true;

    try {
      await api.get("/api/v1/me/profile");
      await issueTicketAndEmbed();
    } catch {
      promptLogin();
    }
  }

  useEffect(() => {
    checkAuthThenGo();
    return clearPoll;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // FULL-BLEED: break out of centered container
  const bleedStyle: CSSProperties = {
    marginLeft: "calc(50% - 50vw)",
    marginRight: "calc(50% - 50vw)",
    width: "100vw",
  };

  // FULL-WIDTH + FULL-HEIGHT (minus header)
  const frameStyle: CSSProperties = {
    width: "100vw",
    minHeight: "calc(100vh - 110px)",
    display: "block",
    border: "0",
    background: "white",
  };

  return (
    <div style={bleedStyle}>
      {phase === "checking" && (
        <div className="text-center py-10 text-zinc-600">Checking your session…</div>
      )}
      {phase === "auth" && (
        <div className="text-center py-10 text-zinc-600">Opening sign-in…</div>
      )}
      {phase === "loading" && !iframeSrc && (
        <div className="text-center py-10 text-zinc-600">Connecting you to Visa…</div>
      )}
      {phase === "error" && (
        <div className="text-center py-10 text-red-600">{err}</div>
      )}

      {iframeSrc && (
        <>
          <iframe title="Helloviza" src={iframeSrc} style={frameStyle} />
          {/* Fallback if iframe is blocked by CSP/X-Frame-Options */}
          <div className="text-center py-3">
            <a
              href={iframeSrc}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              Open in a new tab
            </a>
          </div>
        </>
      )}
    </div>
  );
}
