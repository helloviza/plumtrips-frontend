import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

/** Small utility to merge class strings */
function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** ----- DATA ----- */
const visaRows = [
  { label: "14", unit: "Days", price: 7099 },
  { label: "30", unit: "Days", price: 7299 },
  { label: "60", unit: "Days", price: 12399 },
];

const flightRows = [
  { from: "DEL", to: "SIN", tag: "Return • Economy", price: 15999 },
  { from: "BOM", to: "DXB", tag: "Return • Economy", price: 17999 },
  { from: "BLR", to: "BKK", tag: "Return • Economy", price: 13999 },
];

const holidayRows = [
  { where: "Bali", nights: 5, tag: "Private transfers", price: 44999 },
  { where: "Dubai", nights: 5, tag: "City + Desert", price: 55999 },
  { where: "Singapore", nights: 4, tag: "Orchard • 4★", price: 52999 },
];

const cruiseRows = [
  { where: "Dubai", nights: 5, tag: "Oceanview", price: 55999 },
  { where: "Singapore", nights: 4, tag: "Straits", price: 47999 },
  { where: "Alaska", nights: 7, tag: "Inside Passage", price: 89999 },
];

const hotelRows = [
  { city: "Singapore", area: "Orchard • 4★", price: 12399 },
  { city: "Dubai", area: "Marina • 5★", price: 14999 },
  { city: "Bangkok", area: "Riverside • 4★", price: 7999 },
];

type SlideKind = "Visa" | "Flights" | "Holidays" | "Cruises" | "Hotels";

const ORDER: SlideKind[] = ["Visa", "Flights", "Holidays", "Cruises", "Hotels"];

type Props = {
  className?: string;
  pad?: string;
  gap?: string;
  compact?: boolean;
  intervalMs?: number;
};

export default function HeroPlainCarousel({
  className = "",
  pad = "p-3 md:p-4",
  gap = "space-y-3",
  compact = false,
  intervalMs = 3800,
}: Props) {
  const [index, setIndex] = useState(0);

  // Auto-rotate
  useEffect(() => {
    if (!intervalMs) return;
    const t = setInterval(
      () => setIndex((i) => (i + 1) % ORDER.length),
      intervalMs
    );
    return () => clearInterval(t);
  }, [intervalMs]);

  // Precompute all slides
  const slides = useMemo(() => {
    return ORDER.map((kind) => {
      let header: { title: string; subtitle: string };
      let rows: ReactNode[] = [];

      switch (kind) {
        case "Visa":
          header = { title: "💖", subtitle: "Dubai Visa" };
          rows = visaRows.map((r, i) => (
            <Row key={i} pad={pad} compact={compact}>
              <div className="flex items-baseline gap-2">
                <div
                  className={
                    compact
                      ? "text-xl sm:text-2xl font-extrabold"
                      : "text-2xl sm:text-3xl font-extrabold"
                  }
                >
                  {r.label}
                </div>
                <div
                  className={
                    compact
                      ? "text-sm sm:text-base font-semibold"
                      : "text-base sm:text-lg font-semibold"
                  }
                >
                  {r.unit}
                </div>
              </div>
              <PricePill label="From INR" value={r.price} />
            </Row>
          ));
          break;

        case "Flights":
          header = { title: "💖", subtitle: "Top Flights" };
          rows = flightRows.map((r, i) => (
            <Row key={i} pad={pad} compact={compact}>
              <div>
                <div
                  className={
                    compact
                      ? "text-xl sm:text-2xl font-extrabold"
                      : "text-2xl sm:text-3xl font-extrabold"
                  }
                >
                  {r.from} <span className="text-lg sm:text-xl">↔</span> {r.to}
                </div>
                <div className="text-[11px] sm:text-xs opacity-80">{r.tag}</div>
              </div>
              <PricePill label="From INR" value={r.price} />
            </Row>
          ));
          break;

        case "Holidays":
          header = { title: "💖", subtitle: "Best Holidays" };
          rows = holidayRows.map((r, i) => (
            <Row key={i} pad={pad} compact={compact}>
              <div>
                <div
                  className={
                    compact
                      ? "text-xl sm:text-2xl font-extrabold"
                      : "text-2xl sm:text-3xl font-extrabold"
                  }
                >
                  {r.where}
                </div>
                <div className="text-[11px] sm:text-xs opacity-80">
                  {r.nights} Night{r.nights > 1 ? "s" : ""} • {r.tag}
                </div>
              </div>
              <PricePill label="From INR" value={r.price} />
            </Row>
          ));
          break;

        case "Cruises":
          header = { title: "💖", subtitle: "Top Cruises" };
          rows = cruiseRows.map((r, i) => (
            <Row key={i} pad={pad} compact={compact}>
              <div>
                <div
                  className={
                    compact
                      ? "text-xl sm:text-2xl font-extrabold"
                      : "text-2xl sm:text-3xl font-extrabold"
                  }
                >
                  {r.where}
                </div>
                <div className="text-[11px] sm:text-xs opacity-80">
                  {r.nights} Night{r.nights > 1 ? "s" : ""} • {r.tag}
                </div>
              </div>
              <PricePill label="From INR" value={r.price} />
            </Row>
          ));
          break;

        case "Hotels":
          header = { title: "💖", subtitle: "Top Hotels" };
          rows = hotelRows.map((r, i) => (
            <Row key={i} pad={pad} compact={compact}>
              <div>
                <div
                  className={
                    compact
                      ? "text-xl sm:text-2xl font-extrabold"
                      : "text-2xl sm:text-3xl font-extrabold"
                  }
                >
                  {r.city}
                </div>
                <div className="text-[11px] sm:text-xs opacity-80">
                  {r.area}
                </div>
              </div>
              <PricePill label="Per night" value={r.price} tone="blue" />
            </Row>
          ));
          break;

        default:
          header = { title: "", subtitle: "" };
      }

      return { header, rows };
    });
  }, [pad, compact]);

  const titleCls = compact
    ? "text-2xl sm:text-3xl font-extrabold leading-tight text-white"
    : "text-3xl sm:text-[34px] font-extrabold leading-tight text-white";

  return (
    <aside
      className={cx(
        // full width on mobile, but visually contained
        "w-full max-w-[320px] sm:max-w-[340px] lg:max-w-[360px] overflow-hidden mx-auto lg:mx-0",
        className
      )}
    >
      {/* Badge */}
      <div className="relative">
        <div className="absolute right-4 top-2 md:right-8 md:top-3 -rotate-10 rounded-full border border-yellow-300 px-2.5 py-0.5 text-[10px] md:text-xs font-extrabold text-yellow-200 shadow-lg bg-[#00477f]/70">
          100% Refund*
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative w-full overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div key={i} className="w-full flex-shrink-0">
              {/* Title */}
              <div className="mt-6 select-none">
                <div className={titleCls}>{s.header.title}</div>
                <div className={titleCls}>{s.header.subtitle}</div>
              </div>

              {/* Rows */}
              <div className={cx("mt-3", gap)}>{s.rows}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="mt-3 flex items-center gap-2">
        {ORDER.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setIndex(idx)}
            aria-label={`Go to ${ORDER[idx]} slide`}
            className={cx(
              "h-2.5 w-2.5 rounded-full transition",
              index === idx ? "bg-white" : "bg-white/60 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </aside>
  );
}

/** Row container (white chip) */
function Row({
  children,
  pad,
  compact,
}: {
  children: ReactNode;
  pad: string;
  compact: boolean;
}) {
  return (
    <div
      className={cx(
        "flex items-center justify-between rounded-2xl bg-white/95 text-zinc-900 shadow",
        pad,
        compact ? "min-h-[40px]" : "min-h-[44px]"
      )}
    >
      {children}
    </div>
  );
}

/** Price pill component */
function PricePill({
  label,
  value,
  tone = "red",
}: {
  label: string;
  value: number;
  tone?: "red" | "blue";
}) {
  const toneCls = tone === "red" ? "bg-rose-600" : "bg-sky-600";
  return (
    <div
      className={cx(
        "rounded-md px-2.5 py-1 text-right text-white",
        toneCls
      )}
    >
      <div className="text-[9px] leading-3 opacity-90">{label}</div>
      <div className="text-lg sm:text-xl font-extrabold">
        {value.toLocaleString("en-IN")}
      </div>
    </div>
  );
}
