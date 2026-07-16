// apps/frontend/src/components/Footer.tsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { createCallbackRequest } from "../lib/api";
import "./Footer.css";
import {useState} from "react";

const BG = "#f8fafc";
const TEXT = "#00477f";
const DIV = "rgba(0,71,127,0.25)";

function CallbackPopup({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

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
  const navigate=useNavigate();

  return (
    <footer className="footer">
      {showPopup && <CallbackPopup onClose={() => setShowPopup(false)} />}
      <div className="footer-container">
        {/* Left Brand */}
        <div className="footer-brand">
          <img
            src="/assets/footer-logo.png"
            alt="Plumtrips"
            className="footer-logo"
          />
          <h2>
            Let's plan your next
            <span> extraordinary journey.</span>
          </h2>
          <p>
            AI-powered luxury travel platform for business and leisure.
            Flights, Hotels, Holidays, Corporate Travel,
            Visa and Concierge — all in one place.
          </p> 
          <button onClick={() => navigate("/")} className="cta">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
            Plan Your Trip
            <span>→</span>
          </button>
          <button  onClick={() => setShowPopup(true)} className="cta mt-5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
            Request Callback
            <span>→</span>
          </button>
        </div>

        {/* Explore */}
        <div>
          <h4>Explore</h4>
          <FooterLink to="/">Flights</FooterLink>
          <FooterLink to="/hotels">Hotels</FooterLink>
          <FooterLink to="/holidays">Holiday Packages</FooterLink>
          <a href="https://helloviza.com" target="_blank" rel="noopener noreferrer" className="footer-link">
            Visa
          </a>
          {/* <FooterLink to="/cruises">Cruises</FooterLink> */}
          <FooterLink to="/blogs">Travel Blogs</FooterLink>
          <FooterLink to="/offers">Offers</FooterLink>
        </div>

        {/* AI & Business */}
        <div>
          <h4>AI & Business</h4>
          <FooterLink to="/marketing-login">Marketing Login</FooterLink>
         <a href="https://plumbox.plumtrips.com" target="_blank" rel="noopener noreferrer" className="footer-link">Corporate Travel</a>
          {/* <FooterLink to="/expenses">Expense Management</FooterLink> */}
          <FooterLink to="/mice">Group Booking</FooterLink>
          {/* <FooterLink to="/meetings">MICE</FooterLink> */}
          {/* <FooterLink to="/api">Developer API</FooterLink> */}
        </div>

        {/* Company */}
        <div>
          <h4>Company</h4>
          <FooterLink to="/about">About Us</FooterLink>
          <FooterLink to="/careers">Careers</FooterLink>
          <FooterLink to="/contact">Contact</FooterLink>
          <FooterLink to="/privacy-policy">Privacy Policy</FooterLink>
          <FooterLink to="/terms-and-conditions">Terms of Service</FooterLink>
          <FooterLink to="/cancellation-and-refund">Cancellation Policy</FooterLink>
          <FooterLink to="/cookies-policy">Cookies Policy</FooterLink>
        </div>

        {/* Contact & Social */}
        <div className="footer-contact">
          <h4>Get in touch</h4>
          <div className="contact-item">
            <div className="contact-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.02 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.13 1 .37 1.97.72 2.9a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.18-1.18a2 2 0 012.11-.45c.93.35 1.9.59 2.9.72A2 2 0 0122 14.92z"/>
              </svg>
            </div>
            <div>
              <div style={{ color: "#fff", marginBottom: "4px" }}>+91 70659 32396</div>
              <div style={{ fontSize: "12px" }}>Mon – Sat, 9:00 AM – 8:00 PM (IST)</div>
            </div>
          </div>
          
          <div className="contact-item">
            <div className="contact-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <div style={{ color: "#fff" }}>hello@plumtrips.com</div>
            </div>
          </div>

          <div className="contact-item">
            <div className="contact-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <div style={{ color: "#fff", marginBottom: "4px" }}>Peachmint Trips and Planners Pvt. Ltd.</div>
              <div style={{ fontSize: "12px", lineHeight: "1.4" }}>Bengaluru • Dubai • Gurgaon • Vietnam</div>
            </div>
          </div>

          <h4 style={{ marginTop: "40px" }}>Follow Us</h4>
          <div className="social">
            <a href="https://facebook.com/Plumtrips" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href="https://instagram.com/Plumtrips" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href="https://linkedin.com/company/plumtrips" aria-label="LinkedIn">
              <LinkedInIcon />
            </a>
            <a href="https://youtube.com/@Plumtrips" aria-label="YouTube">
              <YouTubeIcon />
            </a>
            <a href="https://x.com/Plumtrips" aria-label="X">
              <XIcon />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div>
          © {year} Peachmint Trips and Planners Private Limited. All rights reserved.
        </div>
        
        <div className="footer-bottom-links">
          <div className="payment-methods">
            <span style={{ marginRight: "12px", color: "#fff" }}>We accept</span>
            <span style={{ fontWeight: 800, color: "#fff", fontStyle: "italic", fontSize: "18px" }}>VISA</span>
            <span style={{ display: "flex", gap: "2px" }}>
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#eb001b" }}></div>
              <div style={{ width: "16px", height: "16px", borderRadius: "50%", background: "#f79e1b", marginLeft: "-8px", mixBlendMode: "multiply" }}></div>
            </span>
            <span style={{ fontWeight: 600, color: "#0070ba", fontStyle: "italic" }}>AMEX</span>
            <span style={{ fontWeight: 700, color: "#ff8457" }}>RuPay</span>
            <span style={{ fontWeight: 700, color: "#fff", fontStyle: "italic" }}>UPI</span>
          </div>
          
          <div style={{ width: "1px", height: "24px", background: "rgba(255,255,255,0.1)" }}></div>
          
          <span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            Secured by 256-bit SSL
          </span>
        </div>
      </div>

      <div className="watermark">
        PLUMTRIPS
      </div>
    </footer>
  );
}

function FooterLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to}>
      {children}
      <span className="footer-link-icon">›</span>
    </Link>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M13.5 9H15V6h-2c-1.7 0-3 1.3-3 3v2H8v3h2v7h3v-7h2.1l.4-3H13V9c0-.6.4-1 1-1z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M3 3l7.5 9L3 21h3l6-7.2L18 21h3l-7.5-9L21 3h-3l-6 7.2L6 3H3z" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 3a5 5 0 110 10 5 5 0 010-10zm6-1a1 1 0 110 2 1 1 0 010-2z" />
    </svg>
  );
}
function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.06C12.6 8.76 14.2 8 16.2 8c4 0 4.8 2.6 4.8 6V24h-4v-7.2c0-1.72-.04-3.94-2.4-3.94-2.4 0-2.76 1.88-2.76 3.82V24h-4V8z" />
    </svg>
  );
}
function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
      <path d="M23.5 6.2a3 3 0 00-2.1-2.1C19 3.5 12 3.5 12 3.5s-7 0-9.4.6A3 3 0 00.5 6.2 31 31 0 000 12a31 31 0 00.6 5.8 3 3 0 002.1 2.1C5 20.5 12 20.5 12 20.5s7 0 9.4-.6a3 3 0 002.1-2.1A31 31 0 0024 12a31 31 0 00-.5-5.8zM9.8 15.5V8.5l6.2 3.5-6.2 3.5z" />
    </svg>
  );
}