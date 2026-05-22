import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

// ─── DATA ──────────────────────────────────────────────────

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
  { where: "Bali",      nights: 5, tag: "Private transfers", price: 44999 },
  { where: "Dubai",     nights: 5, tag: "City + Desert",     price: 55999 },
  { where: "Singapore", nights: 4, tag: "Orchard • 4★",      price: 52999 },
];
const cruiseRows = [
  { where: "Dubai",     nights: 5, tag: "Oceanview",      price: 55999 },
  { where: "Singapore", nights: 4, tag: "Straits",         price: 47999 },
  { where: "Alaska",    nights: 7, tag: "Inside Passage",  price: 89999 },
];
const hotelRows = [
  { city: "Singapore", area: "Orchard • 4★",   price: 12399 },
  { city: "Dubai",     area: "Marina • 5★",    price: 14999 },
  { city: "Bangkok",   area: "Riverside • 4★", price: 7999 },
];

type SlideKind = "Visa" | "Flights" | "Holidays" | "Cruises" | "Hotels";
const ORDER: SlideKind[] = ["Visa", "Flights", "Holidays", "Cruises", "Hotels"];

// ─── PROPS ─────────────────────────────────────────────────

type Props = {
  className?: string;
  /**
   * When true the carousel shrinks its internal padding and row min-height
   * so the total height aligns with the HotelsSearchForm beside it.
   *
   * ── HEIGHT CONTROL ────────────────────────────────────────
   * Row height is set by the `rowH` variable below (in pixels).
   *   alignToForm=false → rowH = 38   (normal mode)
   *   alignToForm=true  → rowH = 32   (compact mode, matches form)
   * Decrease rowH to make rows shorter, increase to make them taller.
   *
   * ── WIDTH CONTROL ─────────────────────────────────────────
   * The outer <aside> has:
   *   max-w-[320px]  on mobile
   *   max-w-[340px]  on sm screens
   *   max-w-[360px]  on lg screens
   * Change those three values to resize the card width at each breakpoint.
   * The component always fills its parent up to these max-widths.
   */
  alignToForm?: boolean;
  intervalMs?: number;
};

export default function HeroPlainCarousel({
  className = "",
  alignToForm = false,
  intervalMs = 3800,
}: Props) {
  const [index, setIndex]       = useState(0);
  // Track the previous index so we can animate out the old slide
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);

  // ── SIZE TOKENS ────────────────────────────────────────────
  // To adjust row height: change `rowH` (pixels).
  // To adjust inner padding: change `pad`.
  // To adjust gap between rows: change `gap`.
  const pad      = alignToForm ? "px-2.5 py-1.5" : "px-3 py-2";
  const gap      = alignToForm ? "space-y-1"     : "space-y-2";
  const rowH     = alignToForm ? 32              : 38;   // ← CHANGE THIS for row height
  const titleH   = alignToForm ? "mt-1.5"        : "mt-4";
  const titleCls = alignToForm
    ? "text-xl font-extrabold leading-tight text-white"
    : "text-3xl sm:text-[34px] font-extrabold leading-tight text-white";
  const numCls   = alignToForm
    ? "text-base font-extrabold"
    : "text-xl sm:text-2xl font-extrabold";
  const tagCls   = "text-[10px] opacity-80";

  // Auto-advance with smooth crossfade
  useEffect(() => {
    if (!intervalMs) return;
    const t = setInterval(() => {
      setIndex((i) => {
        const next = (i + 1) % ORDER.length;
        setPrevIndex(i);
        setAnimating(true);
        setTimeout(() => {
          setPrevIndex(null);
          setAnimating(false);
        }, 500); // matches transition duration below
        return next;
      });
    }, intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);

  // Manual dot click — also crossfades
  const goTo = (idx: number) => {
    if (idx === index || animating) return;
    setPrevIndex(index);
    setAnimating(true);
    setIndex(idx);
    setTimeout(() => {
      setPrevIndex(null);
      setAnimating(false);
    }, 500);
  };

  const slides = useMemo(() => {
    return ORDER.map((kind) => {
      let header: { title: string; subtitle: string };
      let rows: ReactNode[] = [];

      switch (kind) {
        case "Visa":
          header = { title: "💖", subtitle: "Dubai Visa" };
          rows = visaRows.map((r, i) => (
            <Row key={i} pad={pad} minH={rowH}>
              <div className="flex items-baseline gap-1.5">
                <div className={numCls}>{r.label}</div>
                <div className="text-sm font-semibold">{r.unit}</div>
              </div>
              <PricePill label="From INR" value={r.price} compact={alignToForm} />
            </Row>
          ));
          break;

        case "Flights":
          header = { title: "💖", subtitle: "Top Flights" };
          rows = flightRows.map((r, i) => (
            <Row key={i} pad={pad} minH={rowH}>
              <div>
                <div className={numCls}>
                  {r.from} <span className="text-base">↔</span> {r.to}
                </div>
                <div className={tagCls}>{r.tag}</div>
              </div>
              <PricePill label="From INR" value={r.price} compact={alignToForm} />
            </Row>
          ));
          break;

        case "Holidays":
          header = { title: "💖", subtitle: "Best Holidays" };
          rows = holidayRows.map((r, i) => (
            <Row key={i} pad={pad} minH={rowH}>
              <div>
                <div className={numCls}>{r.where}</div>
                <div className={tagCls}>
                  {r.nights} Night{r.nights > 1 ? "s" : ""} • {r.tag}
                </div>
              </div>
              <PricePill label="From INR" value={r.price} compact={alignToForm} />
            </Row>
          ));
          break;

        case "Cruises":
          header = { title: "💖", subtitle: "Top Cruises" };
          rows = cruiseRows.map((r, i) => (
            <Row key={i} pad={pad} minH={rowH}>
              <div>
                <div className={numCls}>{r.where}</div>
                <div className={tagCls}>
                  {r.nights} Night{r.nights > 1 ? "s" : ""} • {r.tag}
                </div>
              </div>
              <PricePill label="From INR" value={r.price} compact={alignToForm} />
            </Row>
          ));
          break;

        case "Hotels":
          header = { title: "💖", subtitle: "Top Hotels" };
          rows = hotelRows.map((r, i) => (
            <Row key={i} pad={pad} minH={rowH}>
              <div>
                <div className={numCls}>{r.city}</div>
                <div className={tagCls}>{r.area}</div>
              </div>
              <PricePill label="Per night" value={r.price} tone="blue" compact={alignToForm} />
            </Row>
          ));
          break;

        default:
          header = { title: "", subtitle: "" };
      }

      return { header, rows };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    });
  }, [pad, rowH, alignToForm]);

  return (
    <aside
      className={cx(
        // ── WIDTH ─────────────────────────────────────────────
        // Change max-w-[Xpx] values here to resize at each breakpoint:
        //   max-w-[320px]  → mobile width cap
        //   sm:max-w-[340px] → small screens
        //   lg:max-w-[360px] → large screens
        "w-full max-w-[320px] sm:max-w-[340px] lg:max-w-[360px] overflow-hidden mx-auto lg:mx-0",
        alignToForm && "flex flex-col justify-between",
        className
      )}
    >
      {/* Badge */}
      <div className="relative">
        <div className="absolute right-0 top-0 -rotate-6 rounded-full border border-yellow-300 px-2.5 py-0.5 text-[10px] font-extrabold text-yellow-200 shadow-lg bg-[#00477f]/70">
          100% Refund*
        </div>
      </div>

      {/* Crossfade slider */}
      <div className="relative w-full">
        {/* Outgoing slide fades out */}
        {prevIndex !== null && (
          <div
            key={`prev-${prevIndex}`}
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0,
              transition: "opacity 500ms cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <SlideContent
              slide={slides[prevIndex]}
              titleCls={titleCls}
              titleH={titleH}
              gap={gap}
            />
          </div>
        )}

        {/* Incoming slide fades in */}
        <div
          key={`curr-${index}`}
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? "translateY(6px)" : "translateY(0)",
            transition: animating
              ? "none"
              : "opacity 500ms cubic-bezier(0.4,0,0.2,1), transform 500ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          <SlideContent
            slide={slides[index]}
            titleCls={titleCls}
            titleH={titleH}
            gap={gap}
          />
        </div>
      </div>

      {/* Dots */}
      <div className="mt-2 flex items-center gap-2">
        {ORDER.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            aria-label={`Go to ${ORDER[idx]} slide`}
            className={cx(
              "h-2 rounded-full transition-all duration-300",
              index === idx
                ? "w-5 bg-white"          // active dot stretches into a pill
                : "w-2 bg-white/50 hover:bg-white/75"
            )}
          />
        ))}
      </div>
    </aside>
  );
}

// ─── SLIDE CONTENT (extracted for reuse in crossfade) ──────

function SlideContent({
  slide,
  titleCls,
  titleH,
  gap,
}: {
  slide: { header: { title: string; subtitle: string }; rows: ReactNode[] };
  titleCls: string;
  titleH: string;
  gap: string;
}) {
  return (
    <div className="w-full">
      <div className={cx("select-none", titleH)}>
        <div className={titleCls}>{slide.header.title}</div>
        <div className={titleCls}>{slide.header.subtitle}</div>
      </div>
      <div className={cx("mt-2", gap)}>{slide.rows}</div>
    </div>
  );
}

// ─── ROW ───────────────────────────────────────────────────

function Row({
  children,
  pad,
  minH,
}: {
  children: ReactNode;
  pad: string;
  minH: number;
}) {
  return (
    <div
      className={cx(
        "flex items-center justify-between rounded-xl bg-white/95 text-zinc-900 shadow",
        pad
      )}
      style={{ minHeight: minH }}
    >
      {children}
    </div>
  );
}

// ─── PRICE PILL ────────────────────────────────────────────

function PricePill({
  label,
  value,
  tone = "red",
  compact = false,
}: {
  label: string;
  value: number;
  tone?: "red" | "blue";
  compact?: boolean;
}) {
  const toneCls = tone === "red" ? "bg-rose-600" : "bg-sky-600";
  return (
    <div className={cx("rounded-md px-2 py-1 text-right text-white shrink-0", toneCls)}>
      <div className="text-[9px] leading-3 opacity-90">{label}</div>
      <div className={compact ? "text-sm font-extrabold" : "text-base font-extrabold"}>
        {value.toLocaleString("en-IN")}
      </div>
    </div>
  );
}