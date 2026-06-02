import { useState } from "react";

const colors = {
  primary: "#003059",
  primaryContainer: "#00477f",
  onPrimary: "#ffffff",
  onPrimaryFixedVariant: "#034880",
  secondary: "#9f4028",
  secondaryContainer: "#fd8869",
  onSecondary: "#ffffff",
  tertiaryFixedDim: "#febb3c",
  tertiary: "#412b00",
  onPrimaryContainer: "#86b6f5",
  surface: "#f9f9fc",
  surfaceContainer: "#eeeef0",
  surfaceContainerLow: "#f3f3f6",
  surfaceContainerHigh: "#e8e8ea",
  surfaceContainerLowest: "#ffffff",
  onBackground: "#1a1c1e",
  onSurface: "#1a1c1e",
  onSurfaceVariant: "#424750",
  outlineVariant: "#c2c7d1",
  outline: "#727781",
  accentOrange: "#d06549",
  accentOrangeDark: "#b04d33",
  primaryFixedDim: "#a2c9ff",
};

const styles: Record<string, React.CSSProperties> = {
  body: {
    overflowX: "hidden",
    fontFamily: "'Inter', sans-serif",
    color: colors.onBackground,
    backgroundColor: colors.surface,
    backgroundImage: `linear-gradient(rgba(249,249,252,0.82), rgba(249,249,252,0.82)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAPIhJ37qJ6D1YMIXhB1UXPvJJc4bQgaQGMaYUzqU9G7GY8GVI5mr_GoEWvs4JoNj-Leotg1e-2P6ZSkyzgJkWYrzUq4dF7AP1upJnR_bvYQUDpEHc3DY1BgEghlAjbwW0VZ5TpBcyK_YGz6aJnorbylQEETpumUQWXNaMjTxTAs4yEVpQVic-2i2Zd28QpIHGPLha07QNEwCjjpOwsraF1SJOhtOPdixbyQfoTUa_XfFh-kdbubSxVG6nX-3D6ITOX9XXlQmMQPX44')`,
    backgroundAttachment: "fixed",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
};

function MaterialIcon({ name, style }: { name: string; style?: React.CSSProperties }) {
  return (
    <span className="material-symbols-outlined" style={{ fontSize: 20, verticalAlign: "middle", ...style }}>
      {name}
    </span>
  );
}

// ── Counter sub-component ───────────────────────────────────────────────────
function PassengerCounter({
  label,
  count,
  onDecrement,
  onIncrement,
  minZero = false,
}: {
  label: string;
  count: number;
  onDecrement: () => void;
  onIncrement: () => void;
  minZero?: boolean;
}) {
  return (
    <div>
      <span
        style={{
          display: "block",
          fontSize: 10,
          fontWeight: 700,
          color: colors.primary,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 4,
          fontFamily: "'Inter', sans-serif",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={onDecrement}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: colors.surfaceContainer,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.onSurfaceVariant,
            opacity: count === (minZero ? 0 : 1) ? 0.5 : 1,
          }}
        >
          <MaterialIcon name="remove" />
        </button>
        <span style={{ fontWeight: 600, fontSize: 20, fontFamily: "'Montserrat', sans-serif", minWidth: 16, textAlign: "center" }}>
          {count}
        </span>
        <button
          onClick={onIncrement}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: colors.secondary,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
          }}
        >
          <MaterialIcon name="add" />
        </button>
      </div>
    </div>
  );
}

// ── Search Panel ────────────────────────────────────────────────────────────
function SearchPanel() {
  const [tripType, setTripType] = useState("One way");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [cabinClass, setCabinClass] = useState("Economy");
  const [classOpen, setClassOpen] = useState(false);

  const cabinOptions = ["Economy", "Premium Economy", "Business", "First Class"];
  const totalTravellers = adults + children + infants;
  const travellerLabel = `${totalTravellers} Traveller${totalTravellers !== 1 ? "s" : ""}`;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Tab: Flights / Hotels */}
      <div style={{ display: "flex", gap: 24 }}>
        {["Flights", "Hotels"].map((t) => (
          <button
            key={t}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              fontSize: 20,
              color: t === "Flights" ? "#fff" : "rgba(255,255,255,0.7)",
              borderBottom: t === "Flights" ? `4px solid ${colors.secondary}` : "none",
              paddingBottom: 4,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Glass Panel */}
      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          padding: 24,
          borderRadius: 16,
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Trip type buttons */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          {["One way", "Round trip", "Multi-city"].map((type) => (
            <button
              key={type}
              onClick={() => setTripType(type)}
              style={{
                background: tripType === type ? "#fff" : "transparent",
                border: tripType === type ? `1px solid ${colors.outlineVariant}` : "none",
                borderRadius: 9999,
                padding: "6px 16px",
                cursor: "pointer",
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: "0.05em",
                color: tripType === type ? colors.primary : colors.onSurfaceVariant,
                boxShadow: tripType === type ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* From / To */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            border: `1px solid ${colors.outlineVariant}`,
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 16,
          }}
        >
          <div style={{ padding: 16, borderRight: `1px solid ${colors.outlineVariant}`, cursor: "pointer" }}>
            <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: colors.primary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>From</span>
            <div style={{ fontSize: 20, fontWeight: 600, color: colors.onBackground, fontFamily: "'Montserrat', sans-serif" }}>DEL — New Delhi</div>
            <span style={{ fontSize: 12, color: colors.onSurfaceVariant, fontWeight: 600 }}>Indira Gandhi International</span>
          </div>
          <div style={{ padding: 16, cursor: "pointer" }}>
            <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: colors.primary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>To</span>
            <div style={{ fontSize: 20, fontWeight: 600, color: colors.onBackground, fontFamily: "'Montserrat', sans-serif" }}>BOM — Mumbai</div>
            <span style={{ fontSize: 12, color: colors.onSurfaceVariant, fontWeight: 600 }}>Chhatrapati Shivaji Maharaj International</span>
          </div>
        </div>

        {/* Departure / Return */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div style={{ border: `1px solid ${colors.outlineVariant}`, borderRadius: 12, padding: 16, cursor: "pointer" }}>
            <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: colors.primary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Departure</span>
            <div style={{ fontSize: 20, fontWeight: 600, fontFamily: "'Montserrat', sans-serif" }}>29 May</div>
            <span style={{ fontSize: 12, color: colors.onSurfaceVariant, fontWeight: 600 }}>Fri</span>
          </div>
          <div style={{ border: `1px solid ${colors.outlineVariant}`, borderRadius: 12, padding: 16, opacity: 0.6, background: "rgba(238,238,240,0.5)" }}>
            <span style={{ display: "block", fontSize: 12, fontWeight: 700, color: colors.primary, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Return On</span>
            <div style={{ fontSize: 20, fontWeight: 600, color: colors.onSurfaceVariant, fontFamily: "'Montserrat', sans-serif" }}>—</div>
          </div>
        </div>

        {/* ── Passengers row (Adults + Children + Infants + Class) ── */}
        <div
          style={{
            border: `1px solid ${colors.outlineVariant}`,
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 20,
          }}
        >
          {/* Counters row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr 1px 1fr",
              alignItems: "center",
            }}
          >
            {/* Adults */}
            <div style={{ padding: 16, borderRight: `1px solid ${colors.outlineVariant}` }}>
              <PassengerCounter
                label="Adults"
                count={adults}
                onDecrement={() => setAdults(Math.max(1, adults - 1))}
                onIncrement={() => setAdults(adults + 1)}
              />
            </div>

            {/* Children */}
            <div style={{ padding: 16, borderRight: `1px solid ${colors.outlineVariant}` }}>
              <PassengerCounter
                label="Children"
                count={children}
                onDecrement={() => setChildren(Math.max(0, children - 1))}
                onIncrement={() => setChildren(children + 1)}
                minZero
              />
            </div>

            {/* Infants */}
            <div style={{ padding: 16, borderRight: `1px solid ${colors.outlineVariant}` }}>
              <PassengerCounter
                label="Infants"
                count={infants}
                onDecrement={() => setInfants(Math.max(0, infants - 1))}
                onIncrement={() => setInfants(Math.min(adults, infants + 1))}
                minZero
              />
            </div>

            {/* Divider */}
            <div style={{ width: 1, background: colors.outlineVariant, alignSelf: "stretch" }} />

            {/* Passengers & Class */}
            <div
              style={{ padding: 16, cursor: "pointer", position: "relative" }}
              onClick={() => setClassOpen(!classOpen)}
            >
              <span
                style={{
                  display: "block",
                  fontSize: 10,
                  fontWeight: 700,
                  color: colors.primary,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: 4,
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Passengers &amp; Class
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: colors.onBackground,
                      fontFamily: "'Montserrat', sans-serif",
                      lineHeight: 1.2,
                    }}
                  >
                    {travellerLabel}
                  </div>
                  <span style={{ fontSize: 12, color: colors.onSurfaceVariant, fontWeight: 600 }}>
                    {cabinClass}
                  </span>
                </div>
                <MaterialIcon
                  name={classOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                  style={{ color: colors.primary, fontSize: 22 }}
                />
              </div>

              {/* Dropdown */}
              {classOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    right: 0,
                    background: "#fff",
                    border: `1px solid ${colors.outlineVariant}`,
                    borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    zIndex: 100,
                    overflow: "hidden",
                  }}
                >
                  {cabinOptions.map((opt) => (
                    <div
                      key={opt}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCabinClass(opt);
                        setClassOpen(false);
                      }}
                      style={{
                        padding: "12px 16px",
                        cursor: "pointer",
                        fontSize: 14,
                        fontWeight: opt === cabinClass ? 700 : 500,
                        color: opt === cabinClass ? colors.primary : colors.onBackground,
                        background: opt === cabinClass ? colors.surfaceContainerLow : "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {opt}
                      {opt === cabinClass && (
                        <MaterialIcon name="check" style={{ color: colors.primary, fontSize: 18 }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Find Flights CTA */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            style={{
              background: colors.accentOrange,
              color: "#fff",
              padding: "20px 48px",
              borderRadius: 12,
              border: "none",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: 20,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(208,101,73,0.4)",
            }}
          >
            Find Flights
          </button>
        </div>
      </div>

      {/* Non-stop only */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingLeft: 8 }}>
        <input type="checkbox" id="non-stop" style={{ width: 20, height: 20, accentColor: colors.primary }} />
        <label htmlFor="non-stop" style={{ color: "#fff", fontSize: 14, fontWeight: 600, filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))", cursor: "pointer" }}>
          Non-stop only
        </label>
      </div>
    </div>
  );
}

// ── Top Flights Sidebar ─────────────────────────────────────────────────────
function TopFlightsSidebar() {
  const flights = [
    { from: "DEL", to: "SIN", price: "15,999", borderColor: colors.secondary },
    { from: "BOM", to: "DXB", price: "17,999", borderColor: colors.primary },
    { from: "BLR", to: "BKK", price: "13,999", borderColor: colors.outline },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", fontFamily: "'Montserrat', sans-serif", display: "flex", alignItems: "center", gap: 8, filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))", margin: 0 }}>
          Top Flights{" "}
          <span className="material-symbols-outlined" style={{ color: "#fd8869", fontSize: 24 }}>favorite</span>
        </h2>
        <div style={{ background: colors.tertiaryFixedDim, color: colors.tertiary, fontWeight: 700, fontSize: 10, padding: "4px 8px", borderRadius: 2, transform: "rotate(3deg)", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
          100% REFUND*
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {flights.map((f) => (
          <div
            key={f.from + f.to}
            style={{
              background: "rgba(255,255,255,0.95)",
              padding: 16,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderLeft: `4px solid ${f.borderColor}`,
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              cursor: "pointer",
              transition: "transform 0.2s",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700, color: colors.onBackground }}>
                <span style={{ fontSize: 20, fontWeight: 600, fontFamily: "'Montserrat', sans-serif" }}>{f.from}</span>
                <MaterialIcon name="sync" style={{ color: colors.outline, fontSize: 16 }} />
                <span style={{ fontSize: 20, fontWeight: 600, fontFamily: "'Montserrat', sans-serif" }}>{f.to}</span>
              </div>
              <span style={{ fontSize: 12, color: colors.onSurfaceVariant, fontWeight: 500 }}>Return • Economy</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ display: "block", fontSize: 10, color: colors.onSurfaceVariant, fontWeight: 700, textTransform: "uppercase" }}>From INR</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: colors.secondary, fontFamily: "'Montserrat', sans-serif" }}>{f.price}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center", gap: 8, paddingTop: 8 }}>
        <div style={{ width: 24, height: 8, borderRadius: 9999, background: "#fff" }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.4)" }} />
        ))}
      </div>
    </div>
  );
}

// ── Hero Section ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <header style={{ position: "relative", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }}>
        <img
          alt="Himalayan mountain background"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPrdPFPE8eNavLsNhU40Vr6HgI6m6zUFGkKy7pMsMq6f7mll2KFuCsho_t5W0X0nniQXQIiVeXavDh_DPHCYMYIc0vv75xa6PUV13_Mu-rZjBln8Ci_jFfWpkStL4seYnTwcW4S1fYr70VC2NSM8MfRyBdlBj5x-SGzva53bTVO5colVAd-V3hKXlT0_W8-Gb8YWjzDDD2yNpUjLZ46kLTmEAITKba_8Y8JiIpVPiY5Lztat_8ytxVUyZCuYO4LKE77OrsjG5c3cnO"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 33%", filter: "brightness(0.92)", display: "block" }}
        />
      </div>
      <div style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(to bottom, rgba(0,20,50,0.1) 0%, rgba(0,0,0,0.06) 100%)" }} />

      <main
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          padding: "60px 48px 100px",
          width: "100%",
          maxWidth: "1800px",
          margin: "0 auto",
          minHeight: 850,
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "3fr 1.2fr", gap: 40, alignItems: "end", width: "100%" }}>
          <SearchPanel />
          <TopFlightsSidebar />
        </div>
      </main>
    </header>
  );
}

// ── Destination Card ──────────────────────────────────────────────────────────
function DestinationCard({ img, alt, badges, title, subtitle }: { img: string; alt: string; badges: { label: string; color?: string; bg?: string }[]; title: string; subtitle: string }) {
  return (
    <div style={{ borderRadius: 24, overflow: "hidden", position: "relative", aspectRatio: "3/4", boxShadow: "0 4px 20px rgba(0,0,0,0.15)", cursor: "pointer" }}>
      <img alt={alt} src={img} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.7s" }} />
      {/* Stronger gradient so text pops over any image */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.15) 100%)" }} />
      {/* Badge chips */}
      <div style={{ position: "absolute", top: 14, left: 14, display: "flex", gap: 6, flexWrap: "wrap" }}>
        {badges.map((b, i) => (
          <span
            key={b.label}
            style={{
              background: i === 0 ? "#febb3c" : "#00477f",
              color: i === 0 ? "#3a2500" : "#a2c9ff",
              fontWeight: 800,
              fontSize: 13,
              padding: "6px 14px",
              borderRadius: 9999,
              textTransform: "uppercase",
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "0.06em",
              boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
              border: i === 1 ? "1.5px solid rgba(0,48,89,0.18)" : "none",
            }}
          >
            {b.label}
          </span>
        ))}
      </div>
      {/* Title & subtitle */}
      <div style={{ position: "absolute", bottom: 22, left: 22, right: 22 }}>
        <h3
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: "'Montserrat', sans-serif",
            margin: 0,
            textShadow: "0 2px 8px rgba(0,0,0,0.7)",
            lineHeight: 1.25,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "rgba(255,255,255,0.92)",
            margin: "5px 0 0",
            textShadow: "0 1px 6px rgba(0,0,0,0.6)",
            letterSpacing: "0.02em",
          }}
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

// ── Explore Section ───────────────────────────────────────────────────────────
function ExploreSection() {
  return (
    <section style={{ padding: "80px 24px", background: "transparent" }}>
      <div style={{ width: "100%", maxWidth: "1800px", margin: "0 auto", padding: "0 32px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 4, height: 32, background: colors.primary, borderRadius: 9999 }} />
            <h2 style={{ fontSize: 32, fontWeight: 700, color: colors.onBackground, fontFamily: "'Montserrat', sans-serif", margin: 0 }}>Explore more with Plumtrips</h2>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", color: colors.primary, fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}>
            View offers <MaterialIcon name="arrow_right_alt" />
          </button>
        </div>

        {/* Bento Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(320px, 1fr))", gap: 24, marginBottom: 80 }}>
          <DestinationCard img="https://lh3.googleusercontent.com/aida-public/AB6AXuC9Pd-tYI0uGNsPn2qn8bwIMMqFjtX9s3d3QUxL9xJcvwuefH96BFAiGWoO03Sj4AvTcmQLE5rkuDyu5TXn40bgVbaZRXydEGyPWeWBO2HpUkRRN6jeVGnoXV9sSrbrs3f7jxZJVNuPbE-A1gWKqnJj08eHxScu_yJYqG1bCMlNPDOQasV9DtStNKATIryxYT3NSxucQrb4Wo7i45F5nZcB8SLk9xjkqXZORhMIP_Bf5aLdTEXMbDjwVv7AuAfzWN48pY56fvi6NyUg" alt="Qatar skyline" badges={[{ label: "Holidays" }, { label: "Qatar Packages", bg: colors.primaryContainer, color: colors.onPrimaryContainer }]} title="Best Of Qatar" subtitle="Visit Doha" />
          <DestinationCard img="https://lh3.googleusercontent.com/aida-public/AB6AXuCMWznJ9cY4YSdKBd2Q_2wexZ-NOk_EcA1CmHDwJSOLdW5mU73A2ZGEWdH9QO_-bhhpPszsLkaZlrDpp_S8jghD6llS76vOJJ7u-pIYnnRNCyFokmUzAi92II7AJoMt9rIxVVVC7rurHAGiAYFlke4KXb8uSzbFJ_ckZn_0vHIsosvmek9_JxxfKxDHDDVpqnyaJzrSG1bVl97RAV62yavwbjt9xG4j93WkKLo8R2Bg_6K_nzBXRki0ltAua4hkSlwNXmHIxcmd5bC9" alt="Hong Kong skyline" badges={[{ label: "Holidays" }, { label: "Hong Kong Packages", bg: colors.primaryContainer, color: colors.onPrimaryContainer }]} title="Discover Hong Kong" subtitle="Visit Hong Kong" />
          <DestinationCard img="https://lh3.googleusercontent.com/aida-public/AB6AXuDtzDJdP9pfLtVZDvFOJOEHeNMZPLyipGk2cn0BjwDIAZGhyz9A_sGno5r8O_J7OxCJGPvUloUGeNTsD6Z4Vprss-xYeNH-4bskyEAOogVc8EaxYwGw4xe8aM5wHLyVfaLEk7B-iqB_e9QxSgy7aEELSDqpPLbY6nbZjKleCE_-2Xfg-vLhBMRVLqOrU1U_kL7iKkwrR8viQ3A3XVvad8KFLGGH2L6A6xpO8P0_02qY-scd_rfenALOkcj-yiv_2RHvnVCqvjiaLkqf" alt="Tropical beach sunset" badges={[{ label: "Holidays" }, { label: "Group Departures", bg: colors.primaryContainer, color: colors.onPrimaryContainer }]} title="Group Departures" subtitle="Thailand, Vietnam, Bali" />

          {/* Action Items */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: colors.accentOrange, padding: 24, borderRadius: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, background: "rgba(255,255,255,0.2)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                  <MaterialIcon name="mail" style={{ fontSize: 24 }} />
                </div>
                <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 16, margin: 0 }}>Get our best offers by email</h4>
              </div>
              <button style={{ width: "100%", background: "#fff", color: colors.accentOrange, padding: "8px 0", borderRadius: 12, border: "none", fontWeight: 700, fontSize: 16, textTransform: "uppercase", letterSpacing: "0.02em", cursor: "pointer", fontFamily: "'Montserrat', sans-serif" }}>
                Subscribe
              </button>
            </div>
            {[{ icon: "airplane_ticket", label: "Reprint ticket" }, { icon: "luggage", label: "Baggage info" }, { icon: "help", label: "FAQ" }].map((item) => (
              <div key={item.label} style={{ background: "#fff", padding: 24, borderRadius: 24, border: `1px solid ${colors.accentOrange}`, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, background: colors.surfaceContainer, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", color: colors.primary }}>
                    <MaterialIcon name={item.icon} style={{ fontSize: 24 }} />
                  </div>
                  <h4 style={{ fontWeight: 700, color: colors.onBackground, margin: 0 }}>{item.label}</h4>
                </div>
                <MaterialIcon name="chevron_right" style={{ color: colors.outline }} />
              </div>
            ))}
          </div>
        </div>

        {/* Stopover Packages */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(420px, 1fr))", gap: 24, marginBottom: 80 }}>
          {[
            { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQG2C4XzfvG1KkGgwI3MJB98rZl8DRkrq3ANqSGj9swjXP1cu4kYKq71-J79UhhWW1TmU9L2wnSUAPbxYJ4XuLfyP2h1GRbNahGidpNtklm3zRA_8mXQ8o07dp0UPnGV4dcuzE6ql-HTvDA9HO_tg4UwcXq0_vC3LSYngC-qjXT6XffQZE9R1uXIvibFHpyFyXpfTI0akRWstmj5Ag2qkPJaQs-JBer2gBUjlMC8ec6rDUDBjJ1NDn-6PsM6SfU8C8J-AQM40dIloT", tag: "Dubai Stopover", title: "Dubai Stopover Package", desc: "Experience the magic of the Emirates.", btn: "Visit Dubai" },
            { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuC1GkxlO5Aww3MpJPbwaAWkufu0REoFl_R5z-0r3uLY0DkAhjD3hILRHpQB7iK0ZfSIbxGPFqFEjLjb9MnKTmB_WWH_eB2jeKTLQ1J_MBBEUuZuJ3GThEkBNtVgeRVK7T_vY6EFJT0iSkVZAOfiKgyp0oOXU9_XJB4wMpDqRDka2oAcjiNockFCsd3FSA5VzcvblHJxVVnHHxnvRV7iQ7yZA0NDybjwqRqd9nY41fv2IqCIdEmd9iEz41rX0VXuJdSn_Ys472Ws6MgY", tag: "Saudi Packages", title: "Spectacular Saudi Arabia", desc: "Riyadh, AlUla & Jeddah", btn: "Explore" },
            { img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDF2wIBP4s5V-SA--OLqFYi_x4kzSdIF60R9GKMsdNe3pt2tNYqDXsoMvYMUUgoyBO0JxmvBO6TEIKvOIcL8cylCq4QrlqnHzJRrSrqir0Z194TDQSyVONvP-xFPJkOM6OwF5v8-2o8DkCYTHEB2JhKxf4fNZB_u6ePCHa-RucVWkBx2jpb4w9o5WBuADxlIVqXdn5aFfhzAYn-ICHXiuXyV4odBJ2kyddHEEY6lX7gT-5iJdmFscNJzrtO9gTTGrj_kyczyvBxngpY", tag: "Qatar Stopover", title: "Qatar Stopover Package", desc: "Luxury meets tradition in Doha.", btn: "Visit Qatar" },
          ].map((pkg) => (
            <div key={pkg.title} style={{ background: "#fff", borderRadius: 24, overflow: "hidden", border: `1px solid ${colors.outlineVariant}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", cursor: "pointer" }}>
              <div style={{ height: 256, position: "relative" }}>
                <img src={pkg.img} alt={pkg.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", top: 16, left: 16, background: colors.tertiaryFixedDim, color: colors.tertiary, fontWeight: 700, fontSize: 13, padding: "6px 14px", borderRadius: 9999, textTransform: "uppercase" }}>
                  {pkg.tag}
                </div>
              </div>
              <div style={{ padding: 24 }}>
                <h3 style={{ fontSize: 20, fontWeight: 600, color: colors.onBackground, fontFamily: "'Montserrat', sans-serif", margin: "0 0 4px" }}>{pkg.title}</h3>
                <p style={{ color: colors.onSurfaceVariant, margin: "0 0 16px", fontSize: 16 }}>{pkg.desc}</p>
                <button style={{ background: "none", border: "none", color: colors.primary, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: 16, padding: 0 }}>
                  {pkg.btn} <MaterialIcon name="arrow_forward" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Blog + Concierge */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 80 }}>
          <div style={{ position: "relative", overflow: "hidden", borderRadius: 32, boxShadow: "0 4px 20px rgba(0,0,0,0.15)", height: 300 }}>
            <div style={{ position: "absolute", inset: 0, background: colors.primary }}>
              <img alt="Explorer Journals Background" src="https://lh3.googleusercontent.com/aida/ADBb0uhbxZ95cnuGbDBZ8jZo0SSUVqeP-IQ-n6LAr_XPXUH-H7X8rbFpTSHpG7bfUHJ0M02oStZuCE0NeTMQdszby564t3m3wUtpDFCYnS52OjQ5JaLR0d9cmBjy4-MFnzX4QTl_a_LtMYonyPqAV6OR095hpOVdpjUlZr-ANXMXV13Y1sV00naM224xhtCZSde1dLgVlP7P-9zwRZidy8llnNwGFR_FRpgUSmGWyeeNrqTuRp4eaT1YZ-SKgxuZ" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.4 }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,48,89,0.8), transparent)" }} />
            </div>
            <div style={{ position: "relative", height: "100%", padding: 32, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <span style={{ background: colors.secondary, color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 9999, textTransform: "uppercase", letterSpacing: "0.1em", display: "inline-block", marginBottom: 16, alignSelf: "flex-start" }}>Explorer Journals</span>
              <h3 style={{ fontSize: 48, fontWeight: 700, color: "#fff", fontFamily: "'Montserrat', sans-serif", lineHeight: 1.2, margin: "0 0 24px" }}>Inspiring Travel<br />Stories</h3>
              <button style={{ background: "#fff", color: colors.primary, padding: "12px 32px", borderRadius: 12, border: "none", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, alignSelf: "flex-start" }}>
                Read Stories <MaterialIcon name="auto_stories" />
              </button>
            </div>
          </div>

          <div style={{ position: "relative", overflow: "hidden", borderRadius: 32, height: 300, background: colors.surfaceContainerHigh, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <div style={{ height: "100%", padding: 32, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ maxWidth: "60%" }}>
                <span style={{ background: colors.primary, color: "#fff", fontSize: 10, fontWeight: 700, padding: "4px 12px", borderRadius: 9999, textTransform: "uppercase", letterSpacing: "0.1em", display: "inline-block", marginBottom: 16 }}>Concierge Support</span>
                <h3 style={{ fontSize: 32, fontWeight: 700, color: colors.onSurface, fontFamily: "'Montserrat', sans-serif", margin: "0 0 16px", lineHeight: 1.3 }}>Expert Assistance Anytime</h3>
                <p style={{ color: colors.onSurfaceVariant, marginBottom: 24, fontWeight: 500, fontSize: 16 }}>Your personal travel specialists are just a click away for seamless luxury.</p>
                <button style={{ background: colors.accentOrange, color: "#fff", padding: "12px 32px", borderRadius: 12, border: "none", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                  Contact Us <MaterialIcon name="support_agent" />
                </button>
              </div>
              <div style={{ width: 160, height: 160, borderRadius: "50%", overflow: "hidden", border: "4px solid #fff", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", flexShrink: 0 }}>
                <img alt="Concierge Specialist" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDcngLwwqt7wY1bY7xR64KBWe2lc2Wdrr6OmF1KMRsMeFoWzCoQvefEaGCUD8uUKTV4edbf6nbcV63c2ffYxnOe1-xuDRamPG2Z0uCgG-rDi7JbK9l_88IcXE9HeDgFHKhHEkLsg113W0QKIJMea_MNtgs7Z0ncFFPRB7FuZvAxg7nrrDd56piRYTu0frDAyDYUU13pzc6htkNS3er3f48QvU39MYlj4DQxyHO25gKZbq7husmiNsb1z-qW0W-uLwgnmCstoVZiqyW" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function MainPage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      <style>{`
        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          font-family: 'Material Symbols Outlined';
          font-size: 20px;
          line-height: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          user-select: none;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #003059; border-radius: 10px; }
      `}</style>
      <div style={styles.body}>
        <HeroSection />
        <ExploreSection />
      </div>
    </>
  );
}