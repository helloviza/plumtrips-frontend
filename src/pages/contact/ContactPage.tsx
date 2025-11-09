// apps/frontend/src/pages/contact/ContactPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";   // <- your AuthContext
import { useUi } from "../../context/UiContext";       // <- to open login modal, if available

/* ===== Co-located images (put these next to this file) =====
   hero-contact.jpg
   office-gurgaon.jpg   (optional)
   office-mumbai.jpg    (optional)
*/
const hero          = new URL("./hero-contact.jpg", import.meta.url).href;
const officeGgn     = new URL("./office-gurgaon.jpg", import.meta.url).href;
const officeMumbai  = new URL("./office-mumbai.jpg", import.meta.url).href;

const ACCENT = "#d06549";

/** Central contact config (all requirements applied) */
const CONTACT = {
  phoneMain: "+917065932396", // single number everywhere
  whatsapp:  "https://wa.me/917065932396", // same number for WhatsApp
  emailSupport:  "hello@plumtrips.com",
  emailHolidays: "hello@plumtrips.com",
  emailMice:     "hello@plumtrips.com",
  hours: "Mon – Sat · 9:00 AM – 8:00 PM IST",
  emergencyNote:
    "If you are already travelling, call the hotline in your voucher for 24×7 assistance.",
};

// Two office addresses (India)
const ADDR_GGN =
  "Vatika Business Park, 12th Floor, Sohna Road, Gurgaon–122001, Haryana, India";
const ADDR_MUM =
  "1207–1208 Damji Shamji Business Galleria, Ambedkar Nagar, Hiranandani Gardens, Kanjurmarg West, Bhandup West, Mumbai, Maharashtra 400078, India";

// Simple Google Maps embeds from addresses
const mapUrl = (addr: string) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

/** Optional API endpoint for server-side email submission.
 *  If not set, we gracefully fall back to mailto.
 */
const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || "";

export default function ContactPage() {
  const { user } = useAuth() as any;     // expects user?.email
  const { openAuth } = useUi() as any;   // optional modal login
  const navigate = useNavigate();

  // Always start at the top
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  // No-backend mailto fallback
  const [topic, setTopic]     = useState("General");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [phone, setPhone]     = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent]       = useState(false);

  // Prefill email when signed in
  useEffect(() => {
    if (user?.email) setEmail(user.email);
  }, [user]);

  const disabled = useMemo(
    () => !name.trim() || !email.trim() || !message.trim(),
    [name, email, message]
  );

  // Construct mailto body for fallback
  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(`[${topic}] Message from ${name}`);
    const lines = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone/WhatsApp: ${phone}` : "",
      "",
      "Message:",
      message,
    ]
      .filter(Boolean)
      .join("\n");
    const body = encodeURIComponent(lines);
    const to =
      topic === "MICE"
        ? CONTACT.emailMice
        : topic === "Holidays"
        ? CONTACT.emailHolidays
        : CONTACT.emailSupport;
    return `mailto:${to}?subject=${subject}&body=${body}`;
  }, [topic, name, email, phone, message]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    // If not logged in, prompt login then return
    if (!user) {
      // Prefer your modal if present, else route to login
      if (openAuth) openAuth("mobile"); else navigate("/auth/login?ret=/contact");
      return;
    }

    // If API endpoint is configured, POST to server
    if (CONTACT_ENDPOINT) {
      try {
        setSending(true);
        const res = await fetch(CONTACT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic, name, email, phone, message,
            source: "contact-page",
          }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setSent(true);
        setSending(false);
        return;
      } catch (err) {
        // Fallback: open the user's mail client
        setSending(false);
        window.location.href = mailtoHref;
        return;
      }
    }

    // No API configured → fallback to mailto
    window.location.href = mailtoHref;
  }

  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      {/* HERO */}
      <section className="relative">
        <div className="relative h-[220px] md:h-[320px] lg:h-[380px] overflow-hidden">
          <img src={hero} alt="" className="absolute inset-0 z-0 h-full w-full object-cover" />
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,.55) 45%, rgba(246,249,252,1) 95%)",
            }}
          />
          <div className="absolute inset-x-0 top-[18%] z-10">
            <div className="mx-auto max-w-6xl px-4">
              <span className="inline-flex items-center gap-2">
                <i
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: ACCENT }}
                />
                <span className="uppercase tracking-[.16em] text-[.72rem] font-semibold text-white/90">
                  We’re here for you
                </span>
              </span>
              <h1 className="mt-2 text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow">
                Contact PlumTrips
              </h1>
              <p className="mt-2 max-w-2xl text-white/90">
                Luxury trips, visas, MICE, cruises — talk to a real human who cares.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT CHANNELS (raised above gradient → z-10, no clipping) */}
      <section className="relative z-10 mx-auto -mt-10 md:-mt-14 max-w-6xl px-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <ContactTile
            title="Call us"
            subtitle={CONTACT.hours}
            lines={[`India: ${CONTACT.phoneMain}`]}
            actions={[
              { label: "Call India", href: `tel:${CONTACT.phoneMain}` },
            ]}
            icon={<PhoneIcon />}
          />
          <ContactTile
            title="WhatsApp"
            subtitle="Fast answers for quotes & changes"
            lines={[`We reply quickly during business hours.`]}
            actions={[{ label: "Chat on WhatsApp", href: CONTACT.whatsapp }]}
            icon={<WhatsAppIcon />}
          />
          <ContactTile
            title="Email"
            subtitle="We typically reply in a few hours"
            lines={[
              `Support: ${CONTACT.emailSupport}`,
              `Holidays: ${CONTACT.emailHolidays}`,
              `MICE: ${CONTACT.emailMice}`,
            ]}
            actions={[
              { label: "Write to Support",  href: `mailto:${CONTACT.emailSupport}` },
              { label: "Plan Holidays",     href: `mailto:${CONTACT.emailHolidays}` },
            ]}
            icon={<MailIcon />}
          />
        </div>

        <p className="mt-4 text-[13px] text-slate-500">{CONTACT.emergencyNote}</p>

        <div className="mt-5 flex flex-wrap gap-3">
          <a
            href="/go/concierge?from=contact"
            className="inline-flex items-center justify-center rounded-xl bg-[#0b2235] px-4 py-3 text-white font-semibold hover:brightness-110"
          >
            Live chat with Concierge
          </a>
          <a
            href="/support"
            className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-800 font-semibold hover:bg-slate-50"
          >
            View ticket status
          </a>
        </div>
      </section>

      {/* FORM + OFFICES */}
      <section className="mx-auto max-w-6xl px-4 mt-10 md:mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr,.9fr]">
        {/* FORM */}
        <div className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">Send us a message</h2>
          <p className="mt-1 text-slate-600">
            No bots. Your note lands directly with our travel specialists.
          </p>

          <form onSubmit={onSubmit} className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="block text-xs font-semibold text-slate-600">Topic</span>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-inner focus:border-slate-400 outline-none"
              >
                {["General","Holidays","MICE","Flights","Hotels","Cruises","Visa"].map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </label>

            <Input label="Your name" value={name} onChange={setName} placeholder="Alex Traveller" />
            <Input
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
              placeholder="you@email.com"
              disabled={!!user?.email} // lock when logged in
            />
            <Input
              label="Phone / WhatsApp (optional)"
              value={phone}
              onChange={setPhone}
              placeholder={CONTACT.phoneMain}
              className="md:col-span-2"
            />

            <label className="block md:col-span-2">
              <span className="block text-xs font-semibold text-slate-600">Message</span>
              <textarea
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your trip. Dates, budget range, travellers, departure city…"
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-inner focus:border-slate-400 outline-none"
              />
            </label>

            <div className="md:col-span-2 flex items-center justify-between">
              <p className="text-[12px] text-slate-500">
                By sending, you agree to our terms & privacy policy.
              </p>
              <button
                disabled={disabled || sending || sent}
                className={`inline-flex items-center justify-center rounded-xl px-4 py-3 font-semibold shadow-lg ${
                  disabled || sending || sent
                    ? "bg-slate-400 text-white cursor-not-allowed"
                    : "bg-[#0b2235] text-white hover:brightness-110"
                }`}
                title={!user ? "Sign in required to send" : undefined}
              >
                {sent ? "Message sent ✓" : sending ? "Sending…" : "Send via Email"}
              </button>
            </div>
          </form>
        </div>

        {/* OFFICES */}
        <div className="space-y-6">
          <OfficeCard
            title="PlumTrips — Gurgaon (HQ)"
            img={officeGgn}
            address={[ADDR_GGN]}
            phone={CONTACT.phoneMain}
            email={CONTACT.emailSupport}
          />
          <OfficeCard
            title="PlumTrips — Mumbai"
            img={officeMumbai}
            address={[ADDR_MUM]}
            phone={CONTACT.phoneMain}
            email={CONTACT.emailHolidays}
          />
        </div>
      </section>

      {/* MAPS (both offices) */}
      <section className="mx-auto max-w-6xl px-4 mt-10 md:mt-14 mb-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <MapCard title="Gurgaon Office" src={mapUrl(ADDR_GGN)} />
          <MapCard title="Mumbai Office"  src={mapUrl(ADDR_MUM)} />
        </div>
      </section>
    </div>
  );
}

/* ——— small components ——— */
function ContactTile({
  title, subtitle, lines, actions, icon,
}: {
  title: string;
  subtitle?: string;
  lines?: string[];
  actions?: { label: string; href: string }[];
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-6">
      <div className="flex items-center gap-3">
        <span
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: "rgba(208,101,73,.12)", color: ACCENT }}
        >
          {icon}
        </span>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {subtitle && <p className="text-[13px] text-slate-600">{subtitle}</p>}
        </div>
      </div>
      {lines && (
        <ul className="mt-3 space-y-1 text-sm text-slate-700">
          {lines.map((l) => <li key={l}>{l}</li>)}
        </ul>
      )}
      {actions && actions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {actions.map((a) => (
            <a
              key={a.label}
              href={a.href}
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              {a.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function OfficeCard({
  title, img, address, phone, email,
}: {
  title: string;
  img?: string;
  address: string[];
  phone: string;
  email: string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/5">
      {img ? (
        <img src={img} alt="" className="h-36 w-full object-cover" />
      ) : (
        <div
          className="h-36 w-full"
          style={{
            background:
              "radial-gradient(ellipse at top left, rgba(208,101,73,.25), transparent 55%), radial-gradient(ellipse at bottom right, rgba(11,34,53,.15), transparent 50%)",
          }}
        />
      )}
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <div className="mt-2 text-sm text-slate-700">
          {address.map((line) => <div key={line}>{line}</div>)}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <a
            href={`tel:${phone}`}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-800 hover:bg-slate-50"
          >
            {phone}
          </a>
          <a
            href={`mailto:${email}`}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-800 hover:bg-slate-50"
          >
            {email}
          </a>
        </div>
      </div>
    </div>
  );
}

function MapCard({ title, src }: { title: string; src: string }) {
  return (
    <div className="overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5 bg-white">
      <div className="px-4 pt-4 text-sm font-semibold text-slate-900">{title}</div>
      <div className="h-[320px] w-full">
        <iframe title={title} src={src} className="h-full w-full" loading="lazy" />
      </div>
    </div>
  );
}

function Input({
  label, value, onChange, placeholder, type = "text", className = "", disabled = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-semibold text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm shadow-inner focus:border-slate-400 outline-none ${disabled ? "opacity-90" : ""}`}
      />
    </label>
  );
}

/* ——— tiny icons ——— */
function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07A19.5 19.5 0 013.15 9.81 19.8 19.8 0 01.08 1.18 2 2 0 012.06-.99h3a2 2 0 012 1.72c.13 1 .35 1.97.64 2.91a2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 007.27 7.27l1.27-1.27a2 2 0 012.11-.45c.94.29 1.91.51 2.91.64A2 2 0 0122 16.92z" strokeWidth="1.8"/>
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M.5 24l1.7-6.2A10 10 0 1112 22a10.3 10.3 0 01-5-.9L.5 24zM12 2.5A8.5 8.5 0 003.5 11a8.4 8.4 0 001.1 4.2l-.7 2.6 2.6-.7A8.5 8.5 0 1012 2.5zm4.9 11.6c-.3-.2-1.7-.9-2-.9s-.4.1-.6.3l-.3.3c-.2.2-.5.3-.8.2a6.8 6.8 0 01-3.4-3.1c-.2-.3 0-.6.2-.8l.3-.3c.2-.2.3-.4.3-.6 0-.2-.5-1.7-.7-2S9.6 7.1 9.4 7s-.4 0-.6 0a1.2 1.2 0 00-.8.4c-.3.3-1 1-1 2.4s1 2.8 1.1 3c.1.2 2 3.2 4.8 4.4a5.4 5.4 0 002.5.6 2.9 2.9 0 002-1.3c.2-.4.8-1 .8-1.8s-.1-1.3-.3-1.4z"/>
    </svg>
  );
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none">
      <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" strokeWidth="1.8" />
      <path d="M22 6l-10 7L2 6" strokeWidth="1.8" />
    </svg>
  );
}
