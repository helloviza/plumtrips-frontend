// apps/frontend/src/components/Footer.tsx
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const BG = "#d06549";
const TEXT = "#00477f";
const DIV = "rgba(0,71,127,0.25)";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: BG, color: TEXT }}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* ---------- TOP ROW: 4 link columns + brand/contact on the RIGHT ---------- */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-12">
          <Group title="PRODUCTS" className="md:col-span-2">
            <FLink to="/go/visa">Visa</FLink>
            <FLink to="/cruises">Cruises</FLink>
            <FLink to="/hotels">Hotels</FLink>
            <FLink to="/flights">Flights</FLink>
          </Group>

          <Group title="USEFUL LINKS" className="md:col-span-2">
            <FLink to="/about">About Us</FLink>
            <FLink to="/blogs">Blogs</FLink>
            <FLink to="/offers">Offers</FLink>
            <FLink to="/contact">Contact</FLink>
          </Group>

          <Group title="FOR AGENTS" className="md:col-span-2">
            <FLink to="/auth/register">Sign Up</FLink>
            <FLink to="/auth/login">Login</FLink>
          </Group>

          <Group title="OTHERS" className="md:col-span-2">
            <FLink to="/privacy">Privacy</FLink>
            <FLink to="/terms">Terms</FLink>
            <FLink to="/cancellation">Cancellation</FLink>
            <FLink to="/cookies">Cookies</FLink>
          </Group>

          {/* Brand + Contact lives in the same top row, right aligned */}
          <div className="md:col-span-4 flex items-start justify-end">
            <div className="flex flex-col items-end gap-3">
              <img src={logo} alt="PlumTrips" className="h-12 w-auto object-contain" />
              <div className="text-base font-semibold">
                <a href="tel:+917065932396" className="hover:underline" style={{ color: TEXT }}>
                  +91 70659 32396
                </a>
              </div>
              <div className="text-sm">
                <a href="mailto:hello@plumtrips.com" className="hover:underline" style={{ color: TEXT }}>
                  hello@plumtrips.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-10 h-px w-full" style={{ background: DIV }} />

        {/* ---------- Social row ---------- */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 pt-6">
          <Social href="#" label="Facebook"><FacebookIcon /></Social>
          <Social href="#" label="X"><XIcon /></Social>
          <Social href="#" label="Instagram"><InstagramIcon /></Social>
          <Social href="#" label="LinkedIn"><LinkedInIcon /></Social>
          <Social href="#" label="YouTube"><YouTubeIcon /></Social>
        </div>

        {/* Divider */}
        <div className="mt-6 h-px w-full" style={{ background: DIV }} />

        {/* Bottom note */}
        <div className="flex items-center justify-between pt-6 text-xs">
          <p>© {year} — PlumTrips Private Limited</p>
        </div>
      </div>
    </footer>
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
      <Link to={to} className="hover:underline underline-offset-4" style={{ color: TEXT }}>
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
