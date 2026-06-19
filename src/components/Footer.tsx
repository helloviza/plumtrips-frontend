// apps/frontend/src/components/Footer.tsx
import { Link } from "react-router-dom";
import { createCallbackRequest } from "../lib/api";
import { useState } from "react";

const BG = "#f8fafc";
const TEXT = "#00477f";
const DIV = "rgba(0,71,127,0.25)";

/* ===== Callback Popup ===== */
function CallbackPopup({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };



// then in handleSubmit:
const handleSubmit = async (e: React.MouseEvent) => {
  e.preventDefault();
  if (!form.name || !form.email || !form.phone) return;
  try {
    setLoading(true);
    await createCallbackRequest(form, "footer");
    setSubmitted(true);
  } catch (error) {
    console.error(error);
  } finally {
    setLoading(false);
  }
};


  return (
    /* Backdrop */
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,30,60,0.45)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Modal card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: BG,
          borderRadius: "16px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 24px 60px rgba(0,71,127,0.18)",
          overflow: "hidden",
          fontFamily: "inherit",
          animation: "popIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        <style>{`
          @keyframes popIn {
            from { opacity: 0; transform: scale(0.92) translateY(12px); }
            to   { opacity: 1; transform: scale(1)    translateY(0); }
          }
          .cb-input {
            width: 100%;
            padding: 10px 14px;
            border: 1.5px solid rgba(0,71,127,0.22);
            border-radius: 8px;
            background: #fff;
            color: ${TEXT};
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s;
            box-sizing: border-box;
          }
          .cb-input:focus {
            border-color: ${TEXT};
          }
          .cb-input::placeholder {
            color: rgba(0,71,127,0.4);
          }
          .cb-btn {
            width: 100%;
            padding: 11px;
            background: ${TEXT};
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s, transform 0.15s;
            letter-spacing: 0.02em;
          }
          .cb-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
          .cb-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        `}</style>

        {/* Header stripe */}
        <div
          style={{
            background: TEXT,
            padding: "20px 24px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ color: "#fff", fontSize: "17px", fontWeight: 700, letterSpacing: "0.01em" }}>
              Request a Callback
            </div>
            <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", marginTop: "3px" }}>
              We'll reach out within 24 hours
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
              color: "#fff",
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1l12 12M13 1L1 13" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>✅</div>
              <div style={{ color: TEXT, fontWeight: 700, fontSize: "16px" }}>
                We've got your details!
              </div>
              <div style={{ color: "rgba(0,71,127,0.65)", fontSize: "13px", marginTop: "6px" }}>
                Our team will call you back soon.
              </div>
              <button
                className="cb-btn"
                onClick={onClose}
                style={{ marginTop: "20px" }}
              >
                Close
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: TEXT, marginBottom: "5px", letterSpacing: "0.04em" }}>
                  FULL NAME
                </label>
                <input
                  className="cb-input"
                  name="name"
                  placeholder="Jane Smith"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: TEXT, marginBottom: "5px", letterSpacing: "0.04em" }}>
                  EMAIL ADDRESS
                </label>
                <input
                  className="cb-input"
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: TEXT, marginBottom: "5px", letterSpacing: "0.04em" }}>
                  PHONE NUMBER
                </label>
                <input
                  className="cb-input"
                  name="phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
              <button
                className="cb-btn"
                onClick={handleSubmit}
                disabled={loading || !form.name || !form.email || !form.phone}
                style={{ marginTop: "4px" }}
              >
                {loading ? "Submitting…" : "Request Callback"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      {showPopup && <CallbackPopup onClose={() => setShowPopup(false)} />}

      <footer style={{ backgroundColor: BG, color: TEXT }}>
        <div className="mx-auto max-w-[95%] px-4 py-10">
          {/* ---------- TOP ROW: 4 link columns + callback CTA on the RIGHT ---------- */}
          <div className="grid grid-cols-2 gap-8 md:grid-cols-12">
            <Group title="PRODUCTS" className="md:col-span-2">
              <FLink to="/go/visa">Visa</FLink>
              <FLink to="/cruises">Cruises</FLink>
              <FLink to="/hotels">Hotels</FLink>
              {/* <FLink to="/flights-new">Flights</FLink> */}
            </Group>

            <Group title="USEFUL LINKS" className="md:col-span-2">
              <FLink to="/about">About Us</FLink>
              <FLink to="/blogs">Blogs</FLink>
              <FLink to="/offers">Offers</FLink>
              <FLink to="/contact">Contact</FLink>
            </Group>

            <Group title="FOR TEAMS" className="md:col-span-2">
              {/* <FLink to="/auth/register">Sign Up</FLink>
              <FLink to="/auth/login">Login</FLink> */}
              <FLink to="/marketing-login">Marketing Login</FLink>
            </Group>

            <Group title="OTHERS" className="md:col-span-2">
              <FLink to="/privacy-policy">Privacy Policy</FLink>
              <FLink to="/terms-and-conditions">Terms &amp; Conditions</FLink>
              <FLink to="/cancellation-and-refund">Cancellation &amp; Refund</FLink>
              <FLink to="/cookies-policy">Cookies Policy</FLink>
            </Group>

            {/* Request a Callback — right aligned */}
            <div className="md:col-span-8 lex items-start justify-end">
              <button
                onClick={() => setShowPopup(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  background: TEXT,
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 18px",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                  whiteSpace: "nowrap",
                  transition: "opacity 0.2s, transform 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                {/* Phone ring icon */}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.02 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.13 1 .37 1.97.72 2.9a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.18-1.18a2 2 0 012.11-.45c.93.35 1.9.59 2.9.72A2 2 0 0122 14.92z"/>
                </svg>
                Request a Callback
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="mt-10 h-px w-full" style={{ background: DIV }} />

          {/* ---------- Social row ---------- */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-6">
            <Social href="https://www.facebook.com/profile.php?id=61581639161240" label="Facebook">
              <FacebookIcon />
            </Social>
            <Social href="https://x.com/Plumtrips" label="X">
              <XIcon />
            </Social>
            <Social href="https://www.instagram.com/Plumtrips/" label="Instagram">
              <InstagramIcon />
            </Social>
            <Social href="https://www.linkedin.com/company/plum-trips-and-events" label="LinkedIn">
              <LinkedInIcon />
            </Social>
            <Social href="https://www.youtube.com/@Plumtrips.official" label="YouTube">
              <YouTubeIcon />
            </Social>
          </div>

          {/* Divider */}
          <div className="mt-6 h-px w-full" style={{ background: DIV }} />

          {/* Bottom note */}
          <div className="flex items-center justify-between pt-6 text-xs">
            <p>© {year} - Peachmint Trips and Planners Private Limited</p>
          </div>
        </div>
      </footer>
    </>
  );
}

/* ===== Subcomponents ===== */

function Group({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-3 text-sm font-semibold tracking-wide">{title}</div>
      <ul className="space-y-2 text-sm">{children}</ul>
    </div>
  );
}

function FLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        to={to}
        className="hover:underline underline-offset-4"
        style={{ color: TEXT }}
      >
        {children}
      </Link>
    </li>
  );
}

function Social({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <a
        href={href}
        aria-label={label}
        className="grid h-9 w-9 place-items-center rounded-full border"
        style={{ borderColor: "rgba(0,71,127,0.35)", color: TEXT }}
        target="_blank"
        rel="noreferrer"
      >
        {children}
      </a>
      <span className="text-sm">{label}</span>
    </div>
  );
}

/* ===== Tiny brand-colored icons ===== */
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill={TEXT}>
      <path d="M13.5 9H15V6h-2c-1.7 0-3 1.3-3 3v2H8v3h2v7h3v-7h2.1l.4-3H13V9c0-.6.4-1 1-1z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill={TEXT}>
      <path d="M3 3l7.5 9L3 21h3l6-7.2L18 21h3l-7.5-9L21 3h-3l-6 7.2L6 3H3z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill={TEXT}>
      <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 3a5 5 0 110 10 5 5 0 010-10zm6-1a1 1 0 110 2 1 1 0 010-2z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill={TEXT}>
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.06C12.6 8.76 14.2 8 16.2 8c4 0 4.8 2.6 4.8 6V24h-4v-7.2c0-1.72-.04-3.94-2.4-3.94-2.4 0-2.76 1.88-2.76 3.82V24h-4V8z" />
    </svg>
  );
}
function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill={TEXT}>
      <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19 3.5 12 3.5 12 3.5s-7 0-9.4.6A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.6 5.8 3 3 0 002.1 2.1C5 20.5 12 20.5 12 20.5s7 0 9.4-.6a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.8 15.5V8.5l6.2 3.5-6.2 3.5z" />
    </svg>
  );
}