import { useCurrency } from '../../hooks/useCurrency';
﻿// apps/frontend/src/pages/go/Concierge.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUi } from "../../context/UiContext";

/** Brand palette */
const NAVY       = "#0b1528";   // primary navy blue — headings, dark surfaces
const ORANGE     = "#d06549";   // primary orange accent — eyebrows, active, CTAs
const ORANGE_LIGHT = "#f4ede9"; // very light orange tint — chip backgrounds
const ON_SURFACE_VAR = "#45474d";
const OUTLINE_VAR    = "#c6c6cd";
const SURFACE        = "#f8f9ff";

/** Hero background image (fixed, full-bleed) */
const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAlJXD--WtWe_dqu2BiqGO9yN1rWT96LhSwQ18mjKdD7PhJCg8UjdiEQS4zB2SXvKX99bOCpkgDGo-kP3a7nj8LkmxsNPXXLiqaa62_7WJW3tCrAHa8HcB-LvSAV27kzyuOO2ySNn94bZP-tIj5Sba-VC1J7P8q6rrYPu21Czx2OoynXtdD72cvLuNZAmN0rnBo0KExy7fLNk_EiL0O1xtQ0ziIHwbRqkquKpAW3fZD4H1sEsJSGM_FYapQ4BCWtdZvQ1uk8I-uJnGW";

const DESK_EMAIL    = "concierge@Plumtrips.com";
const PHONE_DISPLAY = "+91 70659 32396";
const WHATSAPP_E164 = "917065932396";

type StyleKey = "adventure" | "beach" | "culture" | "wellness" | "luxury" | "budget";

export default function Concierge() {
  const { formatCurrency, symbol } = useCurrency();
  const [sp] = useSearchParams();
  const fromSlug = sp.get("from") || "";

  const { user } = useAuth?.() || ({} as any);
  const { openAuth } = useUi();

  const [name, setName]             = useState("");
  const [email, setEmail]           = useState("");
  const [phone, setPhone]           = useState("");
  const [destination, setDestination] = useState("");
  const [dates, setDates]           = useState("");
  const [budget, setBudget]         = useState("");
  const [travellers, setTravellers] = useState("");
  const [notes, setNotes]           = useState(
    fromSlug ? `Found via blog: ${fromSlug.replaceAll("-", " ")}` : ""
  );
  const [styles, setStyles] = useState<Record<StyleKey, boolean>>({
    adventure: false, beach: false, culture: false,
    wellness: false, luxury: false, budget: false,
  });

  useEffect(() => {
    if (user) {
      if (user.fullName && !name) setName(user.fullName);
      if (user.email && !email)   setEmail(user.email);
      if (user.phone && !phone)   setPhone(user.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const styleList = useMemo(
    () => Object.entries(styles).filter(([, v]) => v).map(([k]) => k).join(", "),
    [styles]
  );

  function toggleStyle(key: StyleKey) {
    setStyles((s) => ({ ...s, [key]: !s[key] }));
  }

  function buildMailto() {
    const subject = `Concierge Request - ${name || "New lead"}`;
    const body = [
      `Name: ${name}`, `Email: ${email}`, `Phone: ${phone}`,
      `Destination(s): ${destination}`, `Dates / Flex: ${dates}`,
      `Travellers: ${travellers}`, `Budget: ${budget}`,
      `Travel style: ${styleList || "-"}`,
      `Source: ${fromSlug ? `Blog (${fromSlug})` : "Direct"}`,
      "", `Notes:`, `${notes || "-"}`,
    ].join("\n");
    return `mailto:${encodeURIComponent(DESK_EMAIL)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function buildWhatsApp() {
    const text = [
      `Plumtrips Concierge request`, `-`,
      `Name: ${name}`, `Email: ${email}`, `Phone: ${phone}`,
      `Destination(s): ${destination}`, `Dates / Flex: ${dates}`,
      `Travellers: ${travellers}`, `Budget: ${budget}`,
      `Travel style: ${styleList || "-"}`,
      `Source: ${fromSlug ? `Blog (${fromSlug})` : "Direct"}`,
      `Notes: ${notes || "-"}`,
    ].join("\n");
    return `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const effectiveEmail = email || user?.email;
    if (!effectiveEmail) { openAuth(); return; }
    if (!name) { alert("Please add your name so we can respond."); return; }
    if (!email && user?.email) setEmail(user.email);
    window.location.href = buildMailto();
  }

  return (
    <div
      className="min-h-[100dvh] selection:bg-[#ffdbd2] selection:text-[#3c0800] font-poppins"
      style={{
        backgroundImage: `linear-gradient(rgba(11,21,40,0.50), rgba(11,21,40,0.50)), url('${HERO_IMAGE}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <main className="pt-24">

        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className="relative min-h-[70vh] flex flex-col justify-center px-5 md:px-16 overflow-hidden">
          <div className="max-w-[1280px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div
              className="lg:col-span-8 z-10 space-y-2 p-10 rounded-lg shadow-2xl reveal-up"
              style={{
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: `1px solid rgba(208,101,73,0.15)`,
                borderLeft: `4px solid ${ORANGE}`,   // ← orange left accent bar
              }}
            >
              {/* Eyebrow — orange */}
              <span
                className="uppercase tracking-[0.2em] text-xs font-semibold"
                style={{ color: ORANGE }}
              >
                Bespoke Excellence
              </span>

              {/* Headline — navy */}
              <h1
                className="text-[clamp(40px,6vw,64px)] font-bold leading-[1.1] tracking-[-0.02em] mt-4"
                style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}
              >
                Plumtrips{" "}
                <span style={{ color: ORANGE }}>Concierge</span>
              </h1>

              {/* Sub — dark grey */}
              <p
                className="text-[18px] leading-[1.6] max-w-xl mt-6"
                style={{ color: ON_SURFACE_VAR }}
              >
                Seamless journeys and bespoke experiences curated for those who value{" "}
                <strong style={{ color: NAVY }}>time, discretion,</strong> and{" "}
                <strong style={{ color: NAVY }}>effortless precision.</strong>
              </p>

              {/* Contact chips */}
              <div className="flex flex-wrap items-center gap-3 mt-4 text-[13px]">
                <a
                  href={`tel:${PHONE_DISPLAY.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 border transition-colors hover:border-orange-400"
                  style={{ borderColor: ORANGE, color: NAVY, fontWeight: 600 }}
                >
                  {PHONE_DISPLAY}
                </a>
                <a
                  href={`https://wa.me/${WHATSAPP_E164}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 transition-colors"
                  style={{ background: ORANGE, color: "#fff", fontWeight: 600 }}
                >
                  WhatsApp
                </a>
                {fromSlug && (
                  <span
                    className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: ORANGE_LIGHT, color: ORANGE }}
                  >
                    From: {fromSlug}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── INQUIRY FORM ──────────────────────────────────────────── */}
        <section className="py-24 px-5 md:px-16">
          <div className="max-w-4xl mx-auto">
            <div
              className="p-10 md:p-16 shadow-2xl rounded-lg relative z-20"
              style={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.4)",
              }}
            >
              {/* Form heading */}
              <div className="mb-12 text-center">
                <span
                  className="uppercase tracking-[0.2em] text-xs font-semibold block mb-3"
                  style={{ color: ORANGE }}
                >
                  Your Vision, Our Craft
                </span>
                <h2
                  className="text-[32px] font-semibold leading-[1.3]"
                  style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}
                >
                  Design Your Journey
                </h2>
                <p className="text-[16px] leading-[1.6] mt-2" style={{ color: ON_SURFACE_VAR }}>
                  The first step to a curated experience is understanding your vision.
                </p>
                {/* Orange underline accent */}
                <div
                  style={{
                    width: "48px", height: "3px",
                    background: ORANGE,
                    borderRadius: "2px",
                    margin: "16px auto 0",
                  }}
                />
              </div>

              <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <LineField label="Full Name *">
                  <input className="lux-line-input" value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alexander Sterling" required />
                </LineField>

                <LineField label="Email *">
                  <input type="email" className="lux-line-input" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@residence.com" required />
                </LineField>

                <LineField label="Phone / WhatsApp">
                  <input className="lux-line-input" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 70659 32396" />
                </LineField>

                <LineField label="Destination(s)">
                  <input className="lux-line-input" value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Maldives, Swiss Alps" />
                </LineField>

                <LineField label="Dates / Flex">
                  <input className="lux-line-input" value={dates}
                    onChange={(e) => setDates(e.target.value)}
                    placeholder="Dec 2024 or Flexible" />
                </LineField>

                <LineField label="Budget (total or per night)">
                  <input className="lux-line-input" value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="e.g. {formatCurrency(10)}k total" />
                </LineField>

                <LineField label="Travellers (count/type)">
                  <input className="lux-line-input" value={travellers}
                    onChange={(e) => setTravellers(e.target.value)}
                    placeholder="2 Adults, 1 Child" />
                </LineField>

                {/* Travel style chips */}
                <div className="space-y-2">
                  <label
                    className="block text-[12px] uppercase tracking-[0.08em] font-semibold"
                    style={{ color: NAVY }}
                  >
                    Travel Style
                  </label>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(["Luxury", "Beach", "Wellness", "Culture", "Adventure", "Budget Chic"] as const).map(
                      (label) => {
                        const key = label.toLowerCase().replace(" chic", "") as StyleKey;
                        const active = styles[key];
                        return (
                          <button
                            key={label}
                            type="button"
                            onClick={() => toggleStyle(key)}
                            className="px-4 py-1 rounded-full text-[12px] font-semibold tracking-[0.08em] border transition-all"
                            style={{
                              borderColor: active ? ORANGE : OUTLINE_VAR,
                              background: active ? ORANGE_LIGHT : "transparent",
                              color: active ? ORANGE : ON_SURFACE_VAR,
                            }}
                          >
                            {label}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div className="md:col-span-2 space-y-2">
                  <label
                    className="block text-[12px] uppercase tracking-[0.08em] font-semibold"
                    style={{ color: NAVY }}
                  >
                    Notes
                  </label>
                  <textarea
                    className="lux-line-input resize-none"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional details…"
                  />
                </div>

                {/* CTA buttons */}
                <div className="md:col-span-2 pt-8 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Primary CTA — orange */}
                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 py-4 text-[14px] font-semibold tracking-[0.05em] uppercase transition-all shadow-xl rounded-[4px]"
                      style={{ background: ORANGE, color: "#fff" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "#b8573e")}
                      onMouseLeave={e => (e.currentTarget.style.background = ORANGE)}
                    >
                      <span className="material-symbols-outlined text-lg">mail</span>
                      Send via Email
                    </button>
                    {/* Secondary CTA — navy outline */}
                    <a
                      href={buildWhatsApp()}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-4 text-[14px] font-semibold tracking-[0.05em] uppercase transition-all rounded-[4px] border"
                      style={{ border: `2px solid ${NAVY}`, color: NAVY, background: "transparent" }}
                    >
                      <span className="material-symbols-outlined text-lg">chat</span>
                      WhatsApp Us
                    </a>
                  </div>
                  <div className="text-center">
                    <a
                      href="/support"
                      className="text-[12px] underline transition-colors"
                      style={{ color: ORANGE }}
                    >
                      Need help? Support
                    </a>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* ── FEATURE BENTO ─────────────────────────────────────────── */}
        <section className="py-32 px-5 md:px-16">
          <div className="max-w-[1280px] mx-auto">

            {/* Section eyebrow */}
            <div className="text-center mb-12">
              <span
                className="uppercase tracking-[0.2em] text-xs font-semibold"
                style={{ color: ORANGE }}
              >
                What We Offer
              </span>
              <h2
                className="text-[32px] font-semibold mt-2"
                style={{ fontFamily: "'Playfair Display', serif", color: "#ffffff" }}
              >
                Every Detail, Perfected
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Card 1 — light glass */}
              <BentoCard dark={false}>
                <span className="material-symbols-outlined text-4xl" style={{ color: ORANGE }}>
                  flight_takeoff
                </span>
                <div>
                  <h3
                    className="text-[24px] font-semibold leading-[1.4] mb-4"
                    style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}
                  >
                    Private Transfers
                  </h3>
                  <p className="text-[16px] leading-[1.6]" style={{ color: ON_SURFACE_VAR }}>
                    From private hangars to chauffeur-driven luxury, we ensure every transition is
                    seamless and discreet.
                  </p>
                </div>
              </BentoCard>

              {/* Card 2 — dark navy */}
              <BentoCard dark={true}>
                <span className="material-symbols-outlined text-4xl" style={{ color: ORANGE }}>
                  bed
                </span>
                <div>
                  <h3
                    className="text-[24px] font-semibold leading-[1.4] mb-4"
                    style={{ fontFamily: "'Playfair Display', serif", color: "#ffffff" }}
                  >
                    Handpicked Stays
                  </h3>
                  <p className="text-[16px] leading-[1.6] opacity-90" style={{ color: "#c5c7c8" }}>
                    Exclusive access to off-market villas, private estates, and the world's most
                    refined hotel suites.
                  </p>
                </div>
              </BentoCard>

              {/* Card 3 — light glass */}
              <BentoCard dark={false}>
                <span className="material-symbols-outlined text-4xl" style={{ color: ORANGE }}>
                  support_agent
                </span>
                <div>
                  <h3
                    className="text-[24px] font-semibold leading-[1.4] mb-4"
                    style={{ fontFamily: "'Playfair Display', serif", color: NAVY }}
                  >
                    24/7 Assistance
                  </h3>
                  <p className="text-[16px] leading-[1.6]" style={{ color: ON_SURFACE_VAR }}>
                    Dedicated experts available around the clock to manage every detail of your
                    journey with quiet precision.
                  </p>
                </div>
              </BentoCard>
            </div>
          </div>
        </section>
      </main>

      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 300, 'GRAD' 0, 'opsz' 24;
        }

        .lux-line-input {
          width: 100%;
          background: transparent;
          border: 0;
          border-bottom: 1.5px solid ${OUTLINE_VAR};
          border-radius: 0;
          padding: 0.75rem 0;
          font-size: 16px;
          line-height: 1.6;
          color: ${NAVY};
          outline: none;
          transition: border-color 160ms;
          font-family: 'DM Sans', sans-serif;
        }
        .lux-line-input::placeholder {
          color: ${ON_SURFACE_VAR};
          opacity: 0.6;
        }
        .lux-line-input:focus {
          border-bottom-color: ${ORANGE};
        }
      `}</style>
    </div>
  );
}

/* ── Helper components ──────────────────────────────────────────── */

function LineField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label
        className="block text-[12px] uppercase tracking-[0.08em] font-semibold"
        style={{ color: NAVY }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function BentoCard({ dark, children }: { dark: boolean; children: React.ReactNode }) {
  return (
    <div
      className="p-12 rounded-lg flex flex-col justify-between min-h-[320px] shadow-xl gap-6"
      style={
        dark
          ? {
              background: `rgba(11,21,40,0.82)`,
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: `1px solid rgba(208,101,73,0.25)`,
            }
          : {
              background: "rgba(255,255,255,0.88)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: `1px solid rgba(208,101,73,0.15)`,
            }
      }
    >
      {children}
    </div>
  );
}