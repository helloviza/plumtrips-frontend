// apps/frontend/src/pages/go/Concierge.tsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUi } from "../../context/UiContext";
import { Phone, MessageCircle, Mail, MapPin, Calendar, Users, DollarSign, PenTool, CheckCircle2 } from "lucide-react";

/** Brand palette */
const PRIMARY = "#00477f";
const ACCENT = "#d06549";
const ACCENT_SOFT = "rgba(208, 101, 73, 0.1)";

/** Hero image (matches the offers section) */
const hero = "/assets/offers/offers123.jpeg";

/** Contact details */
const DESK_EMAIL = "concierge@Plumtrips.com";
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
    const subject = `Concierge Request - ${name || "New lead"}`;
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
      `Plumtrips Concierge request`,
      `-`,
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
      alert("Please add your name so we can respond.");
      return;
    }
    if (!email && user?.email) setEmail(user.email);
    window.location.href = buildMailto();
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* HERO */}
      <header className="relative text-white py-24 md:py-32 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={hero}
            alt="Concierge hero"
            className="absolute inset-0 h-full w-full object-cover transform scale-105 transition-transform duration-1000"
            loading="eager"
          />
          {/* Heavy gradient mask to guarantee text readability against bright photos */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-900/60" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl text-center animate-fade-in-up">
          <div className="max-w-3xl mx-auto">
             <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-orange-200 bg-orange-500/20 rounded-full border border-orange-400/30 backdrop-blur-md uppercase">
              Bespoke Journeys
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight drop-shadow-2xl">
              Plumtrips <span className="text-orange-400 drop-shadow-xl">Concierge</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-white leading-relaxed font-medium drop-shadow-xl max-w-2xl mx-auto">
              Seamless, bespoke journeys - villa keys, overwater mornings, private transfers, and hidden-gem experiences curated to your taste.
            </p>

            <div className="mt-8 flex flex-wrap justify-center items-center gap-4 text-sm font-medium">
              <a
                href={`tel:${PHONE_DISPLAY.replace(/\s+/g, "")}`}
                className="inline-flex items-center gap-2 rounded-full bg-white text-slate-800 px-6 py-2.5 hover:bg-slate-100 transition-all shadow-lg hover:shadow-xl"
                title="Call us"
              >
                <Phone size={16} className="text-[#00477f]" />
                {PHONE_DISPLAY}
              </a>
              <a
                href={`https://wa.me/${WHATSAPP_E164}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#25D366] text-white px-6 py-2.5 hover:bg-[#20bd5a] transition-all shadow-lg hover:shadow-xl"
                title="Chat on WhatsApp"
              >
                <MessageCircle size={16} />
                 WhatsApp
              </a>

              {fromSlug ? (
                <span
                  className="inline-flex items-center rounded-full px-4 py-2.5 text-sm font-semibold border border-orange-200"
                  style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }}
                  title="Source page"
                >
                  From: {fromSlug}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* FORM + SIDECARD */}
      <main className="mx-auto max-w-7xl px-6 py-12 md:py-16 -mt-8 relative z-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <form
            onSubmit={onSubmit}
            className="lg:col-span-2 rounded-3xl bg-white p-8 md:p-10 shadow-xl border border-slate-100"
          >
            <SectionTitle title="Tell us about your trip" subtitle="We'll take it from here." />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
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
                <div className="relative">
                  <input
                    className="lux-input !pl-10"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Maldives, Bali, Greece"
                  />
                  <MapPin size={18} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </Field>

              <Field label="Dates / Flex">
                <div className="relative">
                  <input
                    className="lux-input !pl-10"
                    value={dates}
                    onChange={(e) => setDates(e.target.value)}
                    placeholder="Oct 10-18 (flex±2)"
                  />
                  <Calendar size={18} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </Field>
              <Field label="Budget (total or per night)">
                <div className="relative">
                  <input
                    className="lux-input !pl-10"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="3000 INR / night or 20,000 INR total"
                  />
                  <DollarSign size={18} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </Field>

              <Field label="Travellers">
                <div className="relative">
                  <input
                    className="lux-input !pl-10"
                    value={travellers}
                    onChange={(e) => setTravellers(e.target.value)}
                    placeholder="2 adults, 1 child"
                  />
                  <Users size={18} className="absolute left-3 top-3 text-slate-400" />
                </div>
              </Field>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-semibold text-slate-700">Travel style</label>
              <div className="mt-3 flex flex-wrap gap-2">
                <Chip label="Luxury" active={styles.luxury} onClick={() => toggleStyle("luxury")} />
                <Chip label="Beach" active={styles.beach} onClick={() => toggleStyle("beach")} />
                <Chip label="Wellness" active={styles.wellness} onClick={() => toggleStyle("wellness")} />
                <Chip label="Culture" active={styles.culture} onClick={() => toggleStyle("culture")} />
                <Chip label="Adventure" active={styles.adventure} onClick={() => toggleStyle("adventure")} />
                <Chip label="Budget Chic" active={styles.budget} onClick={() => toggleStyle("budget")} />
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-sm font-semibold text-slate-700">Notes</label>
              <div className="relative mt-2">
                <textarea
                  className="lux-input h-32 resize-y !pl-10 pt-3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us about the trip you have in mind..."
                />
                <PenTool size={18} className="absolute left-3 top-3.5 text-slate-400" />
              </div>
            </div>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                className="lux-btn bg-[#00477f] text-white hover:bg-[#003865]"
              >
               <Mail size={18} /> Send via Email
              </button>

              <a
                href={buildWhatsApp()}
                target="_blank"
                rel="noreferrer"
                className="lux-btn-outline"
              >
                <MessageCircle size={18} /> WhatsApp Us
              </a>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500"/> Private transfers</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500"/> Handpicked stays</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-green-500"/> 24/7 assistance</span>
            </div>
          </form>

          <aside className="lg:col-span-1 h-fit sticky top-24">
            <div className="rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
              <SectionTitle title="What you get" subtitle="Beyond bookings." />
              <ul className="mt-6 space-y-4 text-slate-600 text-sm">
                <li className="flex gap-3"><Dot />Ultra-curated stays (suites, overwater, cliff-edge).</li>
                <li className="flex gap-3"><Dot />Seamless routing & private transfers.</li>
                <li className="flex gap-3"><Dot />Tables, spa slots, yachts & guides secured.</li>
                <li className="flex gap-3"><Dot />Ethical, small-scale experiences that feel special.</li>
              </ul>

              <div className="mt-8 rounded-2xl bg-orange-50 border border-orange-100 p-5">
                <h4 className="text-[#00477f] font-bold text-sm">Timing tip</h4>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  For peak dates & wow suites, <span className="font-semibold text-slate-800">6-10 weeks ahead</span> is the real sweet spot.
                </p>
              </div>

              <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

              <p className="mt-6 text-xs text-slate-400 text-center leading-relaxed">
                By submitting, you agree that we may contact you about this request. No spam - ever.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <style>{`
        .lux-input {
          width: 100%;
          color: #1e293b;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.75rem 1rem;
          outline: none;
          transition: all 200ms ease;
          font-size: 0.95rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        }
        .lux-input::placeholder { color: #94a3b8; }
        .lux-input:focus {
          border-color: ${ACCENT};
          box-shadow: 0 0 0 3px ${ACCENT_SOFT};
        }
        .lux-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          font-weight: 600; padding: 0.8rem 1.5rem; border-radius: 999px;
          transition: all 200ms ease;
          box-shadow: 0 4px 12px rgba(0, 71, 127, 0.2);
        }
        .lux-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(0, 71, 127, 0.3); }
        .lux-btn-outline {
          display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.8rem 1.5rem; border-radius: 999px; color: ${PRIMARY}; border: 2px solid ${PRIMARY};
          background: transparent; transition: all 200ms ease; font-weight: 600;
        }
        .lux-btn-outline:hover { background: rgba(0, 71, 127, 0.05); transform: translateY(-2px); }
      `}</style>
    </div>
  );
}

/* --- UI bits --- */
function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <div className="inline-flex items-center gap-2 mb-2">
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: ACCENT }} />
        <span className="uppercase tracking-[.15em] text-[.7rem] font-bold text-[#00477f]">Concierge</span>
      </div>
      <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800">{title}</h2>
      {subtitle ? <p className="text-slate-500 mt-2 text-sm">{subtitle}</p> : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all border ${active ? "shadow-md" : "hover:bg-slate-50"}`}
      style={{
        background: active ? ACCENT : "#ffffff",
        borderColor: active ? ACCENT : "#cbd5e1",
        color: active ? "#ffffff" : "#64748b",
      }}
    >
      {label}
    </button>
  );
}

function Dot() {
  return <span className="mt-1.5 inline-block h-2 w-2 flex-shrink-0 rounded-full" style={{ backgroundColor: ACCENT }} />;
}