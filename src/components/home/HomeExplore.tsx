import { Link, useNavigate } from "react-router-dom";
import { useUi } from "../../context/UiContext";
import { useAuth } from "../../context/AuthContext";

/**
 * HomeExplore (brand-styled)
 * - Stronger brand accents (#00477f), soft gradients, elevated cards
 * - Image zoom on hover + subtle overlay
 * - Sidebar cards with icon chips and accent stripe
 * - Pill chips refined to match theme
 */

const BRAND = {
  primary: "#00477f",
  primaryText: "text-[#00477f]",
  primaryBg: "bg-[#00477f]",
} as const;

type Feature = {
  badge: string; // e.g. "Visa" / "Holidays" / "Dubai Stopover"
  tag?: string; // pill on the top-right (e.g. "Dubai Visa")
  title: string;
  subtitle: string;
  cta?: string; // defaults to "Know more"
  to?: string; // original router path (used as fallback)
  img?: string; // /assets/... ; graceful fallback if absent
};

/** Flexible chip item so some chips can have custom links */
type ChipItem = string | { label: string; to?: string };

const visas: Feature[] = [
  {
    badge: "Visa",
    tag: "Dubai Visa",
    title: "Dubai Visa",
    subtitle: "Get a 100% refund in case of rejection",
    to: "/visas/dubai",
    img: "/assets/home/visa-dubai.jpg",
  },
  {
    badge: "Visa",
    tag: "Worldwide Visas",
    title: "Worldwide Visas",
    subtitle: "Our easy visa application process at great prices",
    to: "/visas",
    img: "/assets/home/visa-world.jpg",
  },
  {
    badge: "Visa",
    tag: "Singapore Visa",
    title: "Singapore Visa",
    subtitle: "Get best price with expert assistance",
    to: "/visas/singapore",
    img: "/assets/home/visa-singapore.jpg",
  },
];

const holidaysRow1: Feature[] = [
  {
    badge: "Holidays",
    tag: "Qatar Packages",
    title: "Best Of Qatar",
    subtitle: "Visit Doha",
    to: "/holidays/qatar",
    img: "/assets/home/holiday-qatar.jpg",
  },
  {
    badge: "Holidays",
    tag: "Hong Kong Packages",
    title: "Discover Hong Kong",
    subtitle: "Visit Hong Kong",
    to: "/holidays/hong-kong",
    img: "/assets/home/holiday-hk.jpg",
  },
  {
    badge: "Holidays",
    tag: "Group Departures",
    title: "Group Departures",
    subtitle: "Thailand, Vietnam, Bali, Europe",
    to: "/holidays/group-departures",
    img: "/assets/home/holiday-groups.jpg",
  },
];

const holidaysRow2: Feature[] = [
  {
    badge: "Dubai Stopover",
    tag: "Dubai Stopover",
    title: "Dubai Stopover Package",
    subtitle: "Visit Dubai",
    to: "/holidays/dubai-stopover",
    img: "/assets/home/holiday-dubai-stop.jpg",
  },
  {
    badge: "Holidays",
    tag: "Saudi Packages",
    title: "Spectacular Saudi Arabia",
    subtitle: "Riyadh, AlUla & Jeddah",
    to: "/holidays/saudi",
    img: "/assets/home/holiday-saudi.jpg",
  },
  {
    badge: "Qatar Stopover",
    tag: "Qatar Stopover",
    title: "Qatar Stopover Package",
    subtitle: "Visit Qatar",
    to: "/holidays/qatar-stopover",
    img: "/assets/home/holiday-qatar-stop.jpg",
  },
];

const chips = {
  visas: [
    "Dubai Visa",
    "US Visa",
    "UK Visa",
    "Schengen Visa",
    "Singapore Visa",
    "Malaysia Visa",
    "Thailand Visa",
    "Sri Lanka Visa",
    "Vietnam Visa",
    "Turkey Visa",
    "Japan Visa",
    "Canada Visa",
  ] as ChipItem[],
  holidays: [
    "Andaman",
    "Kerala",
    "Kashmir",
    "Himachal",
    "Ladakh",
    "Maldives",
    "Bali",
    "Singapore",
    "Thailand",
    "Turkey",
    "Europe",
    "Bhutan",
    "Jordan",
    "Vietnam",
  ] as ChipItem[],
  airlines: [
    "Air India",
    "IndiGo",
    "Vistara",
    "SpiceJet",
    "Air Arabia",
    "Qatar Airways",
  ] as ChipItem[],
  domesticRoutes: [
    "Mumbai ↔ Delhi",
    "Delhi ↔ Goa",
    "Bengaluru ↔ Mumbai",
    "Chennai ↔ Delhi",
    "Delhi ↔ Pune",
    "Hyderabad ↔ Kolkata",
  ] as ChipItem[],
  internationalRoutes: [
    "Mumbai ↔ Dubai",
    "Delhi ↔ London",
    "Mumbai ↔ Singapore",
    "Delhi ↔ Sydney",
    "Delhi ↔ Paris",
  ] as ChipItem[],
  blogs: [
    "Visa Rejections: What to do?",
    "Dubai Shopping Festival",
    "Guide: Singapore",
    "Guide: Australia",
    "Guide: Kerala",
  ] as ChipItem[],
};

export default function HomeExplore() {
  const { openAuth } = useUi();
  const { user } = useAuth(); // ✅ Use real auth context
  const navigate = useNavigate();

  const goMyTrip = () => {
    if (user) {
      navigate("/account/trips"); // logged in → go to My Trip
    } else {
      openAuth?.(); // not logged in → show login/signup popup
    }
  };

  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-10">
      {/* Section header with accent bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`inline-block h-6 w-1.5 rounded-full ${BRAND.primaryBg}`}
            aria-hidden
          />
          <h2 className="text-xl font-semibold text-zinc-900">
            Explore more with PlumTrips
          </h2>
        </div>
        <Link
          to="/offers"
          className={`hidden md:inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold ${BRAND.primaryText} border-zinc-200 hover:bg-zinc-50`}
        >
          View offers
          <ArrowRight />
        </Link>
      </div>

      {/* Top grid (main + sidebar) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Main (9/12) */}
        <div className="space-y-6 lg:col-span-9">
          <CardRow features={visas} />

          <PromoBanner
            img="/assets/home/visa-promo.jpg"
            title="Get 100% Refund in Case of Visa Rejection"
            caption="On select visas • Terms apply"
          />

          <CardRow features={holidaysRow1} />
          <CardRow features={holidaysRow2} />
        </div>

        {/* Sidebar (3/12) */}
        <aside className="space-y-4 lg:col-span-3">
          <SidebarCard
            title="Follow us on Facebook"
            actionLabel="FOLLOW"
            to="#"
            icon={<FacebookIcon />}
          />
          <SidebarCard
            title="Follow us on Instagram"
            actionLabel="FOLLOW"
            to="#"
            icon={<InstagramIcon />}
          />
          <SidebarCard
            title="Get our best offers by email"
            actionLabel="SUBSCRIBE"
            to="#"
            icon={<MailIcon />}
          />
          {/* 🔐 Reprint ticket → requires login */}
          <SidebarCard
            title="Reprint ticket"
            actionLabel="MY TRIP"
            to="/account/trips"
            onActionClick={goMyTrip}
            icon={<TicketIcon />}
          />
          <SidebarCard
            title="Baggage and contact info"
            actionLabel="INFO"
            to="/info"
            icon={<InfoIcon />}
          />
          <SidebarCard
            title="Frequently asked questions"
            actionLabel="FAQ"
            to="/faq"
            icon={<HelpIcon />}
          />
          <SidebarCard
            title="Travel Inspiration"
            actionLabel="EXPLORE"
            to="/blogs"
            variant="accent"
            icon={<SparklesIcon />}
          />
        </aside>
      </div>

      {/* Chip clouds */}
      <div className="mt-10 space-y-8">
        <ChipsGroup heading="Tourist Visas" items={chips.visas} baseTo="/visas" />
        <ChipsGroup
          heading="Top holiday ideas"
          items={chips.holidays}
          baseTo="/holidays"
        />
        <ChipsGroup heading="Airlines" items={chips.airlines} baseTo="/flights" />
        <ChipsGroup
          heading="Domestic flights"
          items={chips.domesticRoutes}
          baseTo="/flights"
        />
        <ChipsGroup
          heading="International flights"
          items={chips.internationalRoutes}
          baseTo="/flights"
        />
        <ChipsGroup heading="Blogs" items={chips.blogs} baseTo="/blogs" />
        <ChipsGroup
          heading="Customer care"
          items={[
            { label: "Web check-in", to: "/checkin" },
            { label: "Contact us", to: "/contact" },
            { label: "Careers", to: "/careers" },
          ]}
          baseTo="/"
        />
      </div>
    </section>
  );
}

/* ---------- building blocks ---------- */

function CardRow({ features }: { features: Feature[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {features.map((f, i) => (
        <FeatureCard key={i} f={f} />
      ))}
    </div>
  );
}

/** Compute link mapping for cards (requirements) */
function computeFeatureLink(f: Feature): string {
  const badge = (f.badge || "").toLowerCase();
  const text = `${f.badge} ${f.tag || ""} ${f.title}`.toLowerCase();

  if (badge.includes("visa")) return "/go/visa";
  if (badge.includes("holiday")) {
    return `/go/concierge?from=home&topic=holidays&card=${encodeURIComponent(
      f.title
    )}`;
  }
  if (text.includes("stopover")) {
    return `/go/concierge?from=home&topic=stopover&card=${encodeURIComponent(
      f.title
    )}`;
  }

  return f.to || "#";
}

function FeatureCard({ f }: { f: Feature }) {
  const to = computeFeatureLink(f);
  const navigate = useNavigate();

  return (
    <div
      className={`group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition
                  hover:shadow-md hover:ring-2 hover:ring-[#00477f]/15`}
    >
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <Thumb src={f.img} alt={f.title} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-0 transition group-hover:opacity-100" />
        <div className="absolute left-3 top-3 rounded-md bg-amber-400/95 px-2 py-1 text-xs font-semibold text-zinc-900 shadow">
          {f.badge}
        </div>
        {f.tag && (
          <div
            className={`absolute right-3 top-3 rounded-md px-2 py-1 text-xs font-semibold text-white shadow ${BRAND.primaryBg}`}
          >
            {f.tag}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="text-base font-semibold text-zinc-900">{f.title}</div>
        <div className="mt-1 line-clamp-2 text-sm text-zinc-600">
          {f.subtitle}
        </div>
        <div className="mt-3">
          <Link
            to={to}
            className={`inline-flex items-center gap-1 text-sm font-semibold ${BRAND.primaryText} hover:underline`}
            onClick={(e) => {
              e.preventDefault();
              navigate(to);
            }}
          >
            {f.cta || "Know more"}
            <ArrowRight className="transition group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function PromoBanner({
  img,
  title,
  caption,
}: {
  img?: string;
  title: string;
  caption?: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-r from-sky-50 to-amber-50">
      <div className="relative aspect-[24/5] w-full">
        <Thumb src={img} alt={title} />
        <div className="absolute inset-0 flex items-center">
          <div
            className={`mx-6 rounded-xl bg-white/90 px-4 py-3 shadow ring-1 ring-zinc-200 backdrop-blur`}
          >
            <div className={`text-sm font-bold ${BRAND.primaryText}`}>
              {title}
            </div>
            {caption && <div className="text-xs text-zinc-600">{caption}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarCard({
  title,
  actionLabel,
  to,
  variant = "default",
  icon,
  onActionClick,
}: {
  title: string;
  actionLabel: string;
  to: string;
  variant?: "default" | "accent";
  icon?: React.ReactNode;
  onActionClick?: () => void;
}) {
  const navigate = useNavigate();

  const Action = onActionClick ? (
    <button
      onClick={onActionClick}
      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-800 hover:bg-zinc-50"
    >
      {actionLabel}
    </button>
  ) : (
    <Link
      to={to}
      className={
        "rounded-md px-3 py-1.5 text-xs font-semibold " +
        (variant === "accent"
          ? "bg-sky-700 text-white hover:bg-sky-800"
          : "border border-zinc-300 text-zinc-800 hover:bg-zinc-50")
      }
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
    >
      {actionLabel}
    </Link>
  );

  return (
    <div
      className={
        "flex items-center justify-between gap-3 rounded-2xl border p-4 shadow-sm transition hover:shadow-md " +
        (variant === "accent"
          ? "border-sky-200 bg-sky-50"
          : "border-zinc-200 bg-white")
      }
    >
      <div className="flex items-center gap-3">
        <div
          className={`grid h-9 w-9 place-items-center rounded-lg ${BRAND.primaryBg} text-white shadow-sm`}
        >
          {icon || <SparklesIcon />}
        </div>
        <div className="text-sm font-medium text-zinc-900">{title}</div>
      </div>
      {Action}
    </div>
  );
}

function ChipsGroup({
  heading,
  items,
  baseTo,
}: {
  heading: string;
  items: ChipItem[];
  baseTo: string;
}) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className={`inline-block h-4 w-1 rounded ${BRAND.primaryBg}`} />
        <div className="text-sm font-semibold text-zinc-900">{heading}</div>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((t) => {
          const label = typeof t === "string" ? t : t.label;
          const to = typeof t === "string" ? baseTo : t.to || baseTo;
          return (
            <Link
              key={label}
              to={to}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-sky-300 hover:text-sky-800 hover:shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                navigate(to);
              }}
              aria-label={`${label} – open ${to}`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Thumb({ src, alt }: { src?: string; alt: string }) {
  if (!src) {
    return (
      <div
        className="h-full w-full"
        style={{
          background:
            "linear-gradient(135deg, #f4f4f5 0%, #fafafa 50%, #f4f4f5 100%)",
        }}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className="h-full w-full scale-100 object-cover transition duration-300 group-hover:scale-[1.03]"
      loading="lazy"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.display = "none";
        (e.currentTarget.parentElement as HTMLElement).style.background =
          "linear-gradient(135deg,#f4f4f5,#fafafa,#f4f4f5)";
      }}
    />
  );
}

/* ---------- lightweight icons ---------- */

function ArrowRight({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`h-4 w-4 ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.5 9H15V6h-2c-1.7 0-3 1.3-3 3v2H8v3h2v7h3v-7h2.1l.4-3H13V9c0-.6.4-1 1-1z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 3a5 5 0 110 10 5 5 0 010-10zm0 2.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5zM18 6.5a1 1 0 110 2 1 1 0 010-2z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20 4H4a2 2 0 00-2 2v1l10 6 10-6V6a2 2 0 00-2-2z" />
      <path d="M22 9.5l-10 6-10-6V18a2 2 0 002 2h16a2 2 0 002-2V9.5z" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2 2 2 0 100 4 2 2 0 012 2v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 012-2 2 2 0 100-4 2 2 0 01-2-2V7z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 110 20 10 10 0 010-20zm1 7h-2V7h2v2zm-2 2h2v6h-2v-6z" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm.1 14.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM11 7.8c0-1.2.9-2.1 2.3-2.1s2.3.8 2.3 2c0 .7-.3 1.1-1.1 1.7l-.5.3c-.5.3-.7.6-.7 1.2v.5h-1.9v-.6c0-1 .4-1.6 1.2-2.1l.5-.3c.5-.3.7-.6.7-1 0-.5-.4-.9-1-.9-.7 0-1.1.4-1.1 1.1H11z" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3l1.2 3.6L10 8 6.2 9.4 5 13 3.8 9.4 0 8l3.8-1.4L5 3zm10 3l1.5 4.5L21 12l-4.5 1.5L15 18l-1.5-4.5L9 12l4.5-1.5L15 6zm-6 8l.9 2.7L13 18l-3.1 1.3L9 22l-.9-2.7L5 18l3.1-1.3L9 14z" />
    </svg>
  );
}
