// apps/frontend/src/pages/contact/ContactPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUi } from "../../context/UiContext";

/* ===== Co-located images (put these next to this file) =====
   hero-contact.jpg
   office-gurgaon.jpg   (optional)
   office-mumbai.jpg    (optional)
*/
const hero         = new URL("./contact_p.jpeg",   import.meta.url).href;
const officeGgn    = new URL("./office-gurgaon.jpg", import.meta.url).href;
const officeMumbai = new URL("./office-mumbai.jpg",  import.meta.url).href;

// ── Design tokens ──────────────────────────────────────────
const BLUE        = "#1a56db";   // primary CTA / accent
const BLUE_LIGHT  = "#eff6ff";   // tile backgrounds
const BLUE_MID    = "#dbeafe";   // borders / hover fills
const NAVY        = "#0f2d6b";   // headings / dark buttons
const SLATE       = "#475569";   // body text
const BORDER      = "#e2e8f0";

// ── Contact config (unchanged) ─────────────────────────────
const CONTACT = {
  phoneMain:     "+917065932396",
  whatsapp:      "https://wa.me/917065932396",
  emailSupport:  "hello@plumtrips.com",
  emailHolidays: "hello@plumtrips.com",
  emailMice:     "hello@plumtrips.com",
  hours:         "Mon – Sat · 10 AM to 7 PM IST",
  emergencyNote:
    "If you are already travelling, call the hotline in your voucher for 24 × 7 assistance.",
};

const ADDR_GGN =
  "Vatika Business Park, 12th Floor, Sohna Road, Gurgaon-122001, Haryana, India";
const ADDR_MUM =
  "1207-1208 Damji Shamji Business Galleria, Ambedkar Nagar, Hiranandani Gardens, Kanjurmarg West, Bhandup West, Mumbai, Maharashtra 400078, India";

const mapUrl = (addr: string) =>
  `https://maps.google.com/maps?q=${encodeURIComponent(addr)}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || "";

// ── FAQ data ───────────────────────────────────────────────
const FAQS = [
  {
    q: "Do you make fully customised packages?",
    a: "Yes — every trip is built from scratch based on your dates, budget, and interests. No fixed packages, ever.",
  },
  {
    q: "What's included in a typical package?",
    a: "Flights, hotels, transfers, guided experiences, travel insurance, and 24/7 WhatsApp support — all in one quote.",
  },
  {
    q: "Do you offer EMI or payment plans?",
    a: "Yes. We offer no-cost EMI through major cards and buy-now-pay-later options on select packages.",
  },
  {
    q: "Can you help with visa assistance?",
    a: "Absolutely. We handle documentation, embassy appointments, and submission for most popular destinations.",
  },
  {
    q: "How far in advance should I book?",
    a: "For peak seasons and international trips, 60–90 days ahead is ideal. We can often manage last-minute requests too.",
  },
];

// ── Social links ───────────────────────────────────────────
const SOCIALS = [
  { label: "Instagram", href: "#", icon: <InstagramIcon /> },
  { label: "Facebook",  href: "#", icon: <FacebookIcon /> },
  { label: "YouTube",   href: "#", icon: <YouTubeIcon /> },
];

// ── Page ───────────────────────────────────────────────────
export default function ContactPage() {
  const { user }    = useAuth() as any;
  const { openAuth } = useUi() as any;
  const navigate    = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  const [topic,   setTopic]   = useState("General");
  const [name,    setName]    = useState("");
  const [email,   setEmail]   = useState("");
  const [phone,   setPhone]   = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => { if (user?.email) setEmail(user.email); }, [user]);

  const disabled = useMemo(
    () => !name.trim() || !email.trim() || !message.trim(),
    [name, email, message],
  );

  const mailtoHref = useMemo(() => {
    const subject = encodeURIComponent(`[${topic}] Message from ${name}`);
    const lines   = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone/WhatsApp: ${phone}` : "",
      "",
      "Message:",
      message,
    ].filter(Boolean).join("\n");
    const body = encodeURIComponent(lines);
    const to   =
      topic === "MICE"     ? CONTACT.emailMice :
      topic === "Holidays" ? CONTACT.emailHolidays :
                             CONTACT.emailSupport;
    return `mailto:${to}?subject=${subject}&body=${body}`;
  }, [topic, name, email, phone, message]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      if (openAuth) openAuth("mobile");
      else navigate("/auth/login?ret=/contact");
      return;
    }
    if (CONTACT_ENDPOINT) {
      try {
        setSending(true);
        const res = await fetch(CONTACT_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ topic, name, email, phone, message, source: "contact-page" }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setSent(true);
        setSending(false);
        return;
      } catch {
        setSending(false);
        window.location.href = mailtoHref;
        return;
      }
    }
    window.location.href = mailtoHref;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8faff", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=DM+Serif+Display:ital@0;1&display=swap');

        * { box-sizing: border-box; }

        .ct-hero-img { object-fit: cover; width: 100%; height: 100%; }

        .ct-card {
          background: #fff;
          border-radius: 20px;
          border: 1px solid ${BORDER};
          box-shadow: 0 2px 16px rgba(26,86,219,.06), 0 1px 3px rgba(0,0,0,.04);
        }

        .ct-pill-btn {
          display: inline-flex; align-items: center; justify-content: center;
          border-radius: 12px; padding: 9px 18px;
          font-size: 13px; font-weight: 600; cursor: pointer;
          transition: all .15s ease; text-decoration: none; border: none;
          font-family: 'DM Sans', sans-serif;
        }
        .ct-pill-btn-outline {
          background: #fff; border: 1.5px solid ${BORDER}; color: ${NAVY};
        }
        .ct-pill-btn-outline:hover { background: ${BLUE_LIGHT}; border-color: ${BLUE_MID}; }
        .ct-pill-btn-primary {
          background: ${BLUE}; color: #fff;
        }
        .ct-pill-btn-primary:hover { background: #1447c0; }
        .ct-pill-btn-navy {
          background: ${NAVY}; color: #fff;
        }
        .ct-pill-btn-navy:hover { background: #0a1f50; }

        .ct-input {
          width: 100%; border-radius: 12px;
          border: 1.5px solid ${BORDER}; background: #f8faff;
          padding: 10px 14px; font-size: 14px; color: #0f172a;
          outline: none; font-family: 'DM Sans', sans-serif;
          transition: border-color .15s;
        }
        .ct-input:focus { border-color: ${BLUE}; background: #fff; }
        .ct-input::placeholder { color: #94a3b8; }

        .ct-channel-icon {
          width: 44px; height: 44px;
          border-radius: 14px;
          background: ${BLUE_LIGHT};
          display: flex; align-items: center; justify-content: center;
          color: ${BLUE}; flex-shrink: 0;
        }

        .ct-faq-item {
          border-bottom: 1px solid ${BORDER};
        }
        .ct-faq-item:last-child { border-bottom: none; }
        .ct-faq-q {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 0; cursor: pointer; gap: 12px;
          font-size: 14px; font-weight: 600; color: ${NAVY};
          user-select: none;
        }
        .ct-faq-icon {
          width: 22px; height: 22px; border-radius: 50%;
          background: ${BLUE_LIGHT}; color: ${BLUE};
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; font-size: 15px; line-height: 1;
          transition: background .15s;
        }
        .ct-faq-icon.open { background: ${BLUE}; color: #fff; }
        .ct-faq-a {
          font-size: 13px; color: ${SLATE}; padding-bottom: 14px;
          line-height: 1.6;
        }

        .ct-status-dot {
          width: 9px; height: 9px; border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 3px rgba(34,197,94,.2);
          animation: pulse-dot 2s infinite;
          flex-shrink: 0;
        }
        @keyframes pulse-dot {
          0%,100% { box-shadow: 0 0 0 3px rgba(34,197,94,.2); }
          50%      { box-shadow: 0 0 0 6px rgba(34,197,94,.08); }
        }

        .ct-social-btn {
          display: flex; flex-direction: column; align-items: center; gap: 6px;
          padding: 14px 18px; border-radius: 16px;
          background: ${BLUE_LIGHT}; border: 1.5px solid ${BLUE_MID};
          color: ${BLUE}; text-decoration: none; font-size: 12px;
          font-weight: 600; transition: all .15s; cursor: pointer;
        }
        .ct-social-btn:hover { background: ${BLUE_MID}; }

        .ct-label { display: block; font-size: 12px; font-weight: 600; color: #64748b; margin-bottom: 5px; }
        .ct-section-eyebrow {
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 700; letter-spacing: .12em;
          text-transform: uppercase; color: ${BLUE}; margin-bottom: 6px;
        }
        .ct-section-eyebrow::before {
          content: ''; display: block; width: 24px; height: 2px;
          background: ${BLUE}; border-radius: 2px;
        }

        @media (max-width: 768px) {
          .ct-two-col { grid-template-columns: 1fr !important; }
          .ct-three-col { grid-template-columns: 1fr !important; }
          .ct-hero-h { height: 240px !important; }
          .ct-hero-title { font-size: 28px !important; }
        }
      `}</style>

      {/* ─── HERO ─────────────────────────────────────────── */}
      <section style={{ position: "relative" }}>
        <div className="ct-hero-h" style={{ height: 340, overflow: "hidden", position: "relative" }}>
          <img src={hero} alt="" className="ct-hero-img"
            style={{ position: "absolute", inset: 0 }} />
          {/* Blue-tinted overlay instead of warm */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(160deg, rgba(15,45,107,.75) 0%, rgba(26,86,219,.55) 50%, rgba(248,250,255,.95) 100%)",
          }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end" }}>
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px 40px", width: "100%" }}>
              <div className="ct-section-eyebrow" style={{ color: "rgba(255,255,255,.85)" }}>
                <span style={{ background: "rgba(255,255,255,.85)", height: 2, width: 24, display: "inline-block", borderRadius: 2 }} />
                We're here for you
              </div>
              <h1 className="ct-hero-title" style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 46, fontWeight: 400, color: "#fff",
                margin: "6px 0 8px", lineHeight: 1.1,
                textShadow: "0 2px 20px rgba(0,0,0,.3)",
              }}>
                Contact Plumtrips
              </h1>
              <p style={{ color: "rgba(255,255,255,.85)", fontSize: 16, maxWidth: 480 }}>
                Luxury trips, visas, MICE, cruises — talk to a real human who cares.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MAIN CONTENT ─────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

        {/* ─── STATUS BANNER ──────────────────────────────── */}
        <div style={{
          marginTop: -28, position: "relative", zIndex: 10,
          background: "#f0fdf4", border: "1.5px solid #bbf7d0",
          borderRadius: 16, padding: "14px 20px",
          display: "flex", alignItems: "center", gap: 10,
          boxShadow: "0 4px 20px rgba(34,197,94,.1)",
          marginBottom: 24,
        }}>
          <span className="ct-status-dot" />
          <span style={{ fontWeight: 700, color: "#15803d", fontSize: 14 }}>Team is online right now</span>
          <span style={{ color: "#4ade80", margin: "0 2px" }}>·</span>
          <span style={{ color: "#166534", fontSize: 13 }}>Average reply under 2 hours · WhatsApp or email</span>
        </div>

        {/* ─── TWO-COLUMN LAYOUT ──────────────────────────── */}
        <div className="ct-two-col" style={{ display: "grid", gridTemplateColumns: "1.15fr .85fr", gap: 24, alignItems: "start" }}>

          {/* ─── LEFT: FORM ─────────────────────────────── */}
          <div>
            {/* Form card */}
            <div className="ct-card" style={{ padding: "32px 36px" }}>
              <div className="ct-section-eyebrow">Send us a message</div>
              <h2 style={{
                fontFamily: "'DM Serif Display', serif",
                fontSize: 28, fontWeight: 400, color: NAVY,
                margin: "4px 0 6px",
              }}>
                Your own travel team, directly
              </h2>
              <p style={{ color: SLATE, fontSize: 14, marginBottom: 24 }}>
                No bots. Your note lands directly with our travel specialists.
              </p>

              <form onSubmit={onSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {/* Topic */}
                <div style={{ gridColumn: "1/-1" }}>
                  <label className="ct-label">Type</label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="ct-input"
                    style={{ appearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", backgroundSize: 18, paddingRight: 36 }}
                  >
                    {["General","Holidays","MICE","Flights","Hotels","Cruises","Visa"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="ct-label">Your name</label>
                  <input className="ct-input" type="text" value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Traveller" />
                </div>

                {/* Email */}
                <div>
                  <label className="ct-label">Email</label>
                  <input className="ct-input" type="email" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    disabled={!!user?.email}
                    style={user?.email ? { opacity: .8, cursor: "not-allowed" } : {}} />
                </div>

                {/* Phone */}
                <div style={{ gridColumn: "1/-1" }}>
                  <label className="ct-label">Phone / WhatsApp (optional)</label>
                  <input className="ct-input" type="text" value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={`+91 98765 43210`} />
                </div>

                {/* Message */}
                <div style={{ gridColumn: "1/-1" }}>
                  <label className="ct-label">Message</label>
                  <textarea className="ct-input" rows={5} value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your trip. Dates, budget, type (number, destination, dream trip, etc.)"
                    style={{ resize: "vertical" }} />
                </div>

                {/* Footer row */}
                <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <p style={{ fontSize: 12, color: "#94a3b8" }}>
                    By sending you agree to our{" "}
                    <a href="/terms" style={{ color: BLUE, textDecoration: "underline" }}>terms</a>
                    {" & "}
                    <a href="/privacy" style={{ color: BLUE, textDecoration: "underline" }}>privacy policy</a>.
                  </p>
                  <button
                    type="submit"
                    disabled={disabled || sending || sent}
                    className="ct-pill-btn ct-pill-btn-primary"
                    style={{
                      padding: "12px 28px", fontSize: 14,
                      opacity: (disabled || sending || sent) ? .55 : 1,
                      cursor: (disabled || sending || sent) ? "not-allowed" : "pointer",
                    }}
                    title={!user ? "Sign in required to send" : undefined}
                  >
                    {sent ? "✓ Message sent" : sending ? "Sending…" : (
                      <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <SendIcon /> Send via Email
                      </span>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Quick action buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
              <a href="/go/concierge?from=contact" className="ct-pill-btn ct-pill-btn-navy" style={{ padding: "12px 22px", fontSize: 14 }}>
                Live chat with Concierge
              </a>
              <a href="/support" className="ct-pill-btn ct-pill-btn-outline" style={{ padding: "12px 22px", fontSize: 14 }}>
                View ticket status
              </a>
            </div>

            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 10 }}>{CONTACT.emergencyNote}</p>
          </div>

          {/* ─── RIGHT: CHANNELS + FAQ + SOCIALS ─────────── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Channel cards */}
            <div className="ct-card" style={{ padding: 8, display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Live Concierge */}
              <ChannelRow
                icon={<span style={{ fontSize: 22 }}>🎯</span>}
                label="LIVE CONCIERGE"
                title="Chat with a travel expert"
                sub="Already travelling? Get support 24/7 via our concierge line"
                href="/go/concierge?from=contact"
              />
              {/* Email */}
              <ChannelRow
                icon={<MailColorIcon />}
                label="EMAIL US"
                title={CONTACT.emailSupport}
                sub={`Support: ${CONTACT.emailSupport} · MICE: ${CONTACT.emailMice}`}
                href={`mailto:${CONTACT.emailSupport}`}
              />
              {/* Call */}
              <ChannelRow
                icon={<PhoneColorIcon />}
                label="CALL US"
                title={CONTACT.phoneMain.replace("+91", "+91 ").replace(/(\d{5})(\d{5})/, "$1 $2")}
                sub={CONTACT.hours}
                href={`tel:${CONTACT.phoneMain}`}
                last
              />
            </div>

            {/* View offices */}
            <a href="#offices" className="ct-pill-btn ct-pill-btn-outline" style={{ justifyContent: "center", padding: "13px 20px", fontSize: 13, borderRadius: 14 }}>
              🗺️ &nbsp;View our offices on Google Maps →
            </a>

            {/* Follow journeys */}
            <div className="ct-card" style={{ padding: "20px 20px 16px" }}>
              <div className="ct-section-eyebrow" style={{ marginBottom: 12 }}>Follow our journeys</div>
              <div style={{ display: "flex", gap: 10 }}>
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} className="ct-social-btn">
                    {s.icon}
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="ct-card" style={{ padding: "20px 24px" }}>
              <div className="ct-section-eyebrow" style={{ marginBottom: 2 }}>Quick answers</div>
              {FAQS.map((faq, i) => (
                <div key={i} className="ct-faq-item">
                  <div className="ct-faq-q" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                    <span>{faq.q}</span>
                    <span className={`ct-faq-icon${openFaq === i ? " open" : ""}`}>
                      {openFaq === i ? "−" : "+"}
                    </span>
                  </div>
                  {openFaq === i && <div className="ct-faq-a">{faq.a}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── OFFICES SECTION ──────────────────────────── */}
        <div id="offices" style={{ marginTop: 48 }}>
          <div className="ct-section-eyebrow">Our offices</div>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 30, fontWeight: 400, color: NAVY,
            marginBottom: 20,
          }}>
            Find us in person
          </h2>
          <div className="ct-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <OfficeCard
              badge="Gurgaon HQ"
              title="PlumTrips — Gurgaon (HQ)"
              img={officeGgn}
              address={ADDR_GGN}
              phone={CONTACT.phoneMain}
              email={CONTACT.emailSupport}
              mapAddr={ADDR_GGN}
            />
            <OfficeCard
              badge="Mumbai"
              title="PlumTrips — Mumbai"
              img={officeMumbai}
              address={ADDR_MUM}
              phone={CONTACT.phoneMain}
              email={CONTACT.emailHolidays}
              mapAddr={ADDR_MUM}
            />
          </div>
        </div>

        {/* ─── MAPS ─────────────────────────────────────── */}
        <div className="ct-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20 }}>
          <MapCard title="Gurgaon Office" src={mapUrl(ADDR_GGN)} />
          <MapCard title="Mumbai Office"  src={mapUrl(ADDR_MUM)} />
        </div>

        {/* ─── TESTIMONIALS ─────────────────────────────── */}
        <div style={{ marginTop: 56, marginBottom: 64 }}>
          <div className="ct-section-eyebrow">What our travellers say</div>
          <h2 style={{
            fontFamily: "'DM Serif Display', serif",
            fontSize: 30, fontWeight: 400, color: NAVY,
            marginBottom: 24,
          }}>
            Real stories, real trips
          </h2>
          <div className="ct-three-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 18 }}>
            {[
              { text: "They replied in under an hour and planned our entire Bali honeymoon in just two days. The attention to detail was extraordinary.", name: "Priya M.", initials: "PM", trip: "Mumbai · Bali Honeymoon" },
              { text: "Family trip to Europe with elderly parents and kids — they handled every detail including wheelchair access. Absolutely seamless.", name: "Amit K.", initials: "AK", trip: "Delhi · Family Europe Tour" },
              { text: "Best Maldives package we found anywhere. Transparent pricing, zero hidden charges, and incredible support on WhatsApp throughout.", name: "Sneha R.", initials: "SR", trip: "Bangalore · Maldives Getaway" },
            ].map((t) => (
              <div key={t.name} className="ct-card" style={{ padding: "22px 24px" }}>
                <div style={{ color: "#fbbf24", fontSize: 15, letterSpacing: 1, marginBottom: 10 }}>★★★★★</div>
                <p style={{ fontSize: 14, color: SLATE, lineHeight: 1.65, marginBottom: 16, fontStyle: "italic" }}>
                  "{t.text}"
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: BLUE_LIGHT, border: `1.5px solid ${BLUE_MID}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, color: BLUE,
                  }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>{t.trip}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>{/* /max-w container */}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────

function ChannelRow({
  icon, label, title, sub, href, last,
}: {
  icon: React.ReactNode; label: string; title: string; sub: string; href: string; last?: boolean;
}) {
  return (
    <a href={href} style={{
      display: "flex", alignItems: "flex-start", gap: 14,
      padding: "14px 14px",
      borderRadius: 14,
      textDecoration: "none",
      transition: "background .12s",
      borderBottom: last ? "none" : `1px solid ${BORDER}`,
    }}
      onMouseEnter={(e) => (e.currentTarget.style.background = BLUE_LIGHT)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 14,
        background: BLUE_LIGHT, display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "#94a3b8", textTransform: "uppercase", marginBottom: 2 }}>
          {label}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: NAVY, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 12, color: SLATE }}>{sub}</div>
      </div>
    </a>
  );
}

function OfficeCard({
  badge, title, img, address, phone, email, mapAddr,
}: {
  badge: string; title: string; img?: string; address: string;
  phone: string; email: string; mapAddr: string;
}) {
  return (
    <div className="ct-card" style={{ overflow: "hidden" }}>
      {/* Image / placeholder */}
      <div style={{ position: "relative", height: 140 }}>
        {img ? (
          <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{
            height: "100%",
            background: `linear-gradient(135deg, ${BLUE_LIGHT} 0%, ${BLUE_MID} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48,
          }}>🏢</div>
        )}
        <span style={{
          position: "absolute", top: 12, left: 12,
          background: NAVY, color: "#fff",
          borderRadius: 20, padding: "4px 12px",
          fontSize: 11, fontWeight: 700,
        }}>{badge}</span>
      </div>
      <div style={{ padding: "18px 20px" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 4 }}>{title}</h3>
        <p style={{ fontSize: 13, color: SLATE, marginBottom: 14, lineHeight: 1.5 }}>{address}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <a href={`tel:${phone}`} className="ct-pill-btn ct-pill-btn-outline" style={{ fontSize: 12, padding: "7px 14px" }}>
            📞 {phone.replace("+91", "+91 ")}
          </a>
          <a href={`mailto:${email}`} className="ct-pill-btn ct-pill-btn-outline" style={{ fontSize: 12, padding: "7px 14px" }}>
            ✉️ {email}
          </a>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(mapAddr)}`} target="_blank" rel="noreferrer" className="ct-pill-btn ct-pill-btn-outline" style={{ fontSize: 12, padding: "7px 14px" }}>
            🗺️ Open in Maps
          </a>
        </div>
      </div>
    </div>
  );
}

function MapCard({ title, src }: { title: string; src: string }) {
  return (
    <div className="ct-card" style={{ overflow: "hidden" }}>
      <div style={{ padding: "14px 16px 10px", fontSize: 13, fontWeight: 700, color: NAVY }}>{title}</div>
      <div style={{ height: 300 }}>
        <iframe title={title} src={src} style={{ width: "100%", height: "100%", border: "none" }} loading="lazy" />
      </div>
    </div>
  );
}

// ── Icons ──────────────────────────────────────────────────
function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" stroke="currentColor" fill="none" strokeWidth="2">
      <path d="M22 2L11 13M22 2L15 22 11 13 2 9l20-7z" />
    </svg>
  );
}
function MailColorIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" stroke="#6366f1" fill="none" strokeWidth="1.7">
      <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2z" />
      <path d="M22 6l-10 7L2 6" />
    </svg>
  );
}
function PhoneColorIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="#ec4899" fill="none" strokeWidth="1.7">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07A19.5 19.5 0 013.15 9.81 19.8 19.8 0 01.08 1.18 2 2 0 012.06-.99h3a2 2 0 012 1.72c.13 1 .35 1.97.64 2.91a2 2 0 01-.45 2.11l-1.27 1.27a16 16 0 007.27 7.27l1.27-1.27a2 2 0 012.11-.45c.94.29 1.91.51 2.91.64A2 2 0 0122 16.92z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" strokeWidth="1.7">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r=".5" fill="currentColor" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
    </svg>
  );
}
function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
      <path d="M22.54 6.42A2.78 2.78 0 0020.59 4.5C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.5C5.12 20 12 20 12 20s6.88 0 8.59-.5a2.78 2.78 0 001.95-1.92A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  );
}
