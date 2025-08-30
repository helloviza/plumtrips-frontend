// apps/frontend/src/pages/go/Concierge.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUi } from "../../context/UiContext";

/** Brand palette */
const PRIMARY = "#0b2235";
const ACCENT = "#c7a56b";
const ACCENT_SOFT = "rgba(199,165,107,0.15)";

/** Hero image (place next to this file as concierge-hero.jpg) */
const hero = new URL("./concierge-hero.jpg", import.meta.url).href;

/** Contact details */
const DESK_EMAIL = "concierge@plumtrips.com";
const PHONE_DISPLAY = "+91 70659 32396";
const WHATSAPP_E164 = "917065932396"; // no leading "+"

type StyleKey = "adventure" | "beach" | "culture" | "wellness" | "luxury" | "budget";

export default function Concierge() {
  const [sp] = useSearchParams();
  const fromSlug = sp.get("from") || "";

  const { user } = useAuth?.() || ({} as any);
  const { openAuth } = useUi();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [budget, setBudget] = useState("");
  const [travellers, setTravellers] = useState("");
  const [notes, setNotes] = useState(
    fromSlug ? `Found via blog: ${fromSlug.replaceAll("-", " ")}` : ""
  );
  const [styles, setStyles] = useState<Record<StyleKey, boolean>>({
    adventure: false,
    beach: false,
    culture: false,
    wellness: false,
    luxury: true,
    budget: false,
  });

  // Prefill from session (matches Contact page behavior)
  useEffect(() => {
    if (user) {
      if (user.fullName && !name) setName(user.fullName);
      if (user.email && !email) setEmail(user.email);
      if (user.phone && !phone) setPhone(user.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const styleList = useMemo(
    () =>
      Object.entries(styles)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(", "),
    [styles]
  );

  function toggleStyle(key: StyleKey) {
    setStyles((s) => ({ ...s, [key]: !s[key] }));
  }

  function buildMailto() {
    const subject = `Concierge Request — ${name || "New lead"}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Destination(s): ${destination}`,
      `Dates / Flex: ${dates}`,
      `Travellers: ${travellers}`,
      `Budget: ${budget}`,
      `Travel style: ${styleList || "-"}`,
      `Source: ${fromSlug ? `Blog (${fromSlug})` : "Direct"}`,
      "",
      `Notes:`,
      `${notes || "-"}`,
    ].join("\n");
    return `mailto:${encodeURIComponent(
      DESK_EMAIL
    )}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function buildWhatsApp() {
    const text = [
      `PlumTrips Concierge request`,
      `—`,
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Destination(s): ${destination}`,
      `Dates / Flex: ${dates}`,
      `Travellers: ${travellers}`,
      `Budget: ${budget}`,
      `Travel style: ${styleList || "-"}`,
      `Source: ${fromSlug ? `Blog (${fromSlug})` : "Direct"}`,
      `Notes: ${notes || "-"}`,
    ].join("\n");
    return `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(text)}`;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Gate by login (same as Contact page)
    const effectiveEmail = email || user?.email;
    if (!effectiveEmail) {
      // open the auth modal (no args to satisfy your UiContext types)
      openAuth();
      return;
    }
    if (!name) {
      alert("Please add your name so we can respond. ✨");
      return;
    }
    if (!email && user?.email) setEmail(user.email);
    window.location.href = buildMailto();
  }

  return (
    <div className="min-h-[100dvh] bg-black">
      {/* HERO */}
      <header className="relative">
        <div className="relative h-[360px] md:h-[520px] w-full overflow-hidden">
          <img
            src={hero}
            alt="Concierge hero"
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.35),rgba(0,0,0,0.65))]" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.5) 60%, rgba(11,34,53,0.95))",
            }}
          />
          <div className="absolute inset-x-0 bottom-0">
            <div className="mx-auto max-w-5xl px-4 pb-8 md:pb-10">
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 md:p-8 shadow-2xl">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white">
                  PlumTrips Concierge
                </h1>
                <p className="mt-3 max-w-2xl text-white/90">
                  Seamless, bespoke journeys — villa keys, overwater mornings, private
                  transfers, and hidden-gem experiences curated to your taste.
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-[13px]">
                  <a
                    href={`tel:${PHONE_DISPLAY.replace(/\s+/g, "")}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/15"
                    title="Call us"
                  >
                    ☎︎ {PHONE_DISPLAY}
                  </a>
                  <a
                    href={`https://wa.me/${WHATSAPP_E164}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/15"
                    title="Chat on WhatsApp"
                  >
                    🟢 WhatsApp
                  </a>

                  {fromSlug ? (
                    <span
                      className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                      style={{ backgroundColor: ACCENT_SOFT, color: ACCENT }}
                      title="Source page"
                    >
                      From: {fromSlug}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-[1px]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(199,165,107,0.75), transparent)",
            }}
          />
        </div>
      </header>

      {/* FORM + SIDECARD */}
      <main
        className="mx-auto max-w-5xl px-4 py-10 md:py-14"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,34,53,1) 0%, rgba(12,26,39,1) 40%, rgba(8,17,26,1) 100%)",
        }}
      >
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <form
            onSubmit={onSubmit}
            className="md:col-span-2 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-2xl"
          >
            <SectionTitle title="Tell us about your trip" subtitle="We’ll take it from here." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Field label="Your name *">
                <input
                  className="lux-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Traveller"
                  required
                />
              </Field>
              <Field label="Email *">
                <input
                  type="email"
                  className="lux-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@email.com"
                  required
                />
              </Field>

              <Field label="Phone / WhatsApp">
                <input
                  className="lux-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 70659 32396"
                />
              </Field>
              <Field label="Destination(s)">
                <input
                  className="lux-input"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Maldives, Amalfi, Bali…"
                />
              </Field>

              <Field label="Dates / Flex">
                <input
                  className="lux-input"
                  value={dates}
                  onChange={(e) => setDates(e.target.value)}
                  placeholder="Oct 10–18 (flex ±2)"
                />
              </Field>
              <Field label="Budget (total or per night)">
                <input
                  className="lux-input"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="€3000 total / €250–€350 pn"
                />
              </Field>

              <Field label="Travellers">
                <input
                  className="lux-input"
                  value={travellers}
                  onChange={(e) => setTravellers(e.target.value)}
                  placeholder="2 adults, 1 child"
                />
              </Field>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-white/90">Travel style</label>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip label="Luxury" active={styles.luxury} onClick={() => toggleStyle("luxury")} />
                <Chip label="Beach" active={styles.beach} onClick={() => toggleStyle("beach")} />
                <Chip label="Wellness" active={styles.wellness} onClick={() => toggleStyle("wellness")} />
                <Chip label="Culture" active={styles.culture} onClick={() => toggleStyle("culture")} />
                <Chip label="Adventure" active={styles.adventure} onClick={() => toggleStyle("adventure")} />
                <Chip label="Budget Chic" active={styles.budget} onClick={() => toggleStyle("budget")} />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-white/90">Notes</label>
              <textarea
                className="lux-input h-32 resize-y"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell us about the trip you have in mind…"
              />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button
                type="submit"
                className="lux-btn"
                style={{ background: "linear-gradient(90deg, #b89054, #d8b97d, #b89054)" }}
              >
                ✉️ Send via Email
              </button>

              <a
                href={buildWhatsApp()}
                target="_blank"
                rel="noreferrer"
                className="lux-btn-outline"
              >
                WhatsApp Us
              </a>

              <a href="/support" className="lux-btn-plain">
                Need help? Support
              </a>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 text-[12px] text-white/70">
              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1">✓ Private transfers</span>
              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1">✓ Handpicked stays</span>
              <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1">✓ 24/7 assistance</span>
            </div>
          </form>

          <aside className="md:col-span-1">
            <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl p-6 md:p-8 shadow-2xl">
              <SectionTitle title="What you get" subtitle="Beyond bookings." />
              <ul className="mt-4 space-y-3 text-white/85">
                <li className="flex gap-3"><Dot />Ultra-curated stays (suites, overwater, cliff-edge).</li>
                <li className="flex gap-3"><Dot />Seamless routing & private transfers.</li>
                <li className="flex gap-3"><Dot />Tables, spa slots, yachts & guides secured.</li>
                <li className="flex gap-3"><Dot />Ethical, small-scale experiences that feel special.</li>
              </ul>

              <div className="mt-8 rounded-xl border border-white/15 bg-gradient-to-br from-white/10 to-white/5 p-4">
                <h4 className="text-white font-semibold">Timing tip</h4>
                <p className="mt-1 text-sm text-white/80">
                  For peak dates & wow suites, 6–10 weeks ahead is the real sweet spot.
                </p>
              </div>

              <div
                className="mt-8 h-px w-full"
                style={{ background: "linear-gradient(90deg, transparent, rgba(199,165,107,.7), transparent)" }}
              />

              <p className="mt-8 text-xs text-white/60">
                By submitting, you agree that we may contact you about this request. No spam — ever.
              </p>
            </div>
          </aside>
        </div>

        <div
          className="mt-10 h-24 w-full rounded-b-[2rem] blur-2xl"
          style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(199,165,107,0.25), transparent 70%)" }}
        />
      </main>

      <style>{`
        .lux-input {
          width: 100%;
          color: #eef3f8;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 14px;
          padding: 0.8rem 0.95rem;
          outline: none;
          transition: box-shadow 160ms, border-color 160ms, background 160ms;
        }
        .lux-input::placeholder { color: rgba(255,255,255,0.5); }
        .lux-input:focus {
          border-color: ${ACCENT};
          box-shadow: 0 0 0 4px ${ACCENT_SOFT};
          background: rgba(255,255,255,0.08);
        }
        .lux-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
          color: ${PRIMARY}; font-weight: 700; padding: .9rem 1.2rem; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.15);
          box-shadow: 0 12px 24px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.3);
          transition: transform 120ms ease, filter 120ms ease, box-shadow 120ms ease;
        }
        .lux-btn:hover { filter: brightness(1.05); transform: translateY(-1px); }
        .lux-btn-outline {
          display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
          padding: .9rem 1.2rem; border-radius: 999px; color: ${ACCENT}; border: 1px solid ${ACCENT};
          background: transparent; transition: background 120ms, color 120ms, transform 120ms;
        }
        .lux-btn-outline:hover { background: ${ACCENT_SOFT}; transform: translateY(-1px); }
        .lux-btn-plain {
          display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
          padding: .9rem 1.2rem; border-radius: 999px; color: #e7edf2;
          border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.06);
          transition: background 120ms, transform 120ms;
        }
        .lux-btn-plain:hover { background: rgba(255,255,255,0.1); transform: translateY(-1px); }
      `}</style>
    </div>
  );
}

/* ——— UI bits ——— */
function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: ACCENT }} />
        <span className="uppercase tracking-[.16em] text-[.68rem] font-semibold text-white/70">Concierge</span>
      </div>
      <h2 className="mt-1 text-xl md:text-2xl font-extrabold text-white">{title}</h2>
      {subtitle ? <p className="text-white/70 text-sm">{subtitle}</p> : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-white/90">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition border ${active ? "" : "text-white/90"}`}
      style={{
        background: active ? ACCENT : "rgba(255,255,255,0.05)",
        borderColor: active ? ACCENT : "rgba(255,255,255,0.18)",
        color: active ? PRIMARY : "rgba(255,255,255,0.9)",
      }}
    >
      {label}
    </button>
  );
}

function Dot() {
  return <span className="mt-[6px] inline-block h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: ACCENT }} />;
}
