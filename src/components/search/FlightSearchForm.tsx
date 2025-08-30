import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/datepicker.css";

export type TripType = "round" | "oneway" | "multi";

const rowBox =
  "rounded-none border-2 border-[#a8d5ff] bg-white p-2.5 shadow-none";
const bigBtn =
  "rounded-none bg-[#d06549] px-8 py-2.5 text-white font-extrabold tracking-wider uppercase hover:opacity-95";
const inputBase =
  "mt-0 w-full border-0 bg-transparent text-lg placeholder-zinc-400 focus:outline-none";

type Props = { tripType: TripType };

type Airport = {
  code: string;
  name?: string;
  city?: string;
  country?: string;
  label?: string;
};

/* ---------- Auto-complete input ---------- */
function AirportInput({
  value,
  onChange,
  airports,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  airports: Airport[];
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => setQuery(value), [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const starts = airports.filter(
      (a) =>
        a.code?.toLowerCase().startsWith(q) ||
        a.city?.toLowerCase().startsWith(q) ||
        a.name?.toLowerCase().startsWith(q)
    );
    return (starts.length ? starts : airports).slice(0, 20);
  }, [airports, query]);

  function pick(a: Airport) {
    onChange(a.code.toUpperCase());
    setQuery(a.code.toUpperCase());
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <input
        value={query}
        onChange={(e) => {
          const v = e.target.value;
          setQuery(v);
          setOpen(v.trim().length >= 1);
        }}
        onFocus={() => {
          if (query.trim().length >= 1) setOpen(true);
        }}
        onBlur={() => {
          const m = query.toUpperCase().match(/\b([A-Z]{3})\b/);
          if (m) onChange(m[1]);
          else onChange(query.toUpperCase());
        }}
        placeholder={placeholder}
        className={inputBase}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-80 overflow-auto rounded-md border border-zinc-200 bg-white shadow-lg">
          {filtered.map((a) => (
            <button
              type="button"
              key={`${a.code}-${a.name}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(a)}
              className="flex w-full items-start gap-3 px-3 py-2 text-left hover:bg-zinc-100"
            >
              <div className="min-w-12 font-semibold">{a.code}</div>
              <div className="text-sm text-zinc-700">
                {a.label || `${a.name || a.city || ""} (${a.code}) — ${a.country || ""}`}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FlightSearchForm({ tripType }: Props) {
  const navigate = useNavigate();

  const [airports, setAirports] = useState<Airport[]>([]);
  useEffect(() => {
    fetch("/airports.min.json")
      .then((r) => r.json())
      .then((arr) => (Array.isArray(arr) ? setAirports(arr) : []))
      .catch(() => setAirports([]));
  }, []);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [leaveDate, setLeaveDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);

  const [showMore, setShowMore] = useState(false);
  const [cabin, setCabin] = useState("any");
  const [airline, setAirline] = useState("");
  const [nonStopOnly, setNonStopOnly] = useState(false);

  const [legs, setLegs] = useState([
    { label: "Flight 1", from: "", to: "", date: null as Date | null },
    { label: "Flight 2", from: "", to: "", date: null as Date | null },
    { label: "Flight 3", from: "", to: "", date: null as Date | null },
  ]);

  const fmt = (d: Date | null) => (d ? format(d, "yyyy-MM-dd") : "");
  const today = new Date();

  function submitRoundOrOneWay(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      date: fmt(leaveDate),
      ...(tripType === "round" && returnDate ? { return: fmt(returnDate) } : {}),
      adults: String(adults),
      children: String(children),
      infants: String(infants),
      cabin,
      ...(airline ? { airline } : {}),
      nonstop: String(nonStopOnly),
    });
    navigate(`/flights?${params.toString()}`);
  }

  function submitMulti(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      type: "multi",
      adults: String(adults),
      children: String(children),
      infants: String(infants),
      cabin,
      ...(airline ? { airline } : {}),
      nonstop: String(nonStopOnly),
    });
    legs.forEach((leg, i) => {
      const n = i + 1;
      if (leg.from) params.set(`from${n}`, leg.from.toUpperCase());
      if (leg.to) params.set(`to${n}`, leg.to.toUpperCase());
      if (leg.date) params.set(`date${n}`, format(leg.date, "yyyy-MM-dd"));
    });
    navigate(`/flights?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      {/* ===== Round / One way ===== */}
      {(tripType === "round" || tripType === "oneway") && (
        <form onSubmit={submitRoundOrOneWay} className="space-y-4">
          {/* From / To */}
          <div className={rowBox}>
            <div className="grid md:grid-cols-2 gap-3">
              <AirportInput value={from} onChange={setFrom} airports={airports} placeholder="From" />
              <AirportInput value={to} onChange={setTo} airports={airports} placeholder="To" />
            </div>
          </div>

          {/* Dates */}
          <div className={rowBox}>
            <div className="grid md:grid-cols-2 gap-3">
              <DatePicker
                selected={leaveDate}
                onChange={(d) => {
                  setLeaveDate(d);
                  if (returnDate && d && returnDate < d) setReturnDate(null);
                }}
                placeholderText="Leave on"
                className={`${inputBase} cursor-pointer`}
                dateFormat="dd-MM-yyyy"
                minDate={today}
                isClearable
              />
              {tripType === "round" ? (
                <DatePicker
                  selected={returnDate}
                  onChange={(d) => setReturnDate(d)}
                  placeholderText="Return on"
                  className={`${inputBase} cursor-pointer`}
                  dateFormat="dd-MM-yyyy"
                  minDate={leaveDate ?? today}
                  isClearable
                />
              ) : (
                <div className="hidden md:block" />
              )}
            </div>
          </div>

          {/* Pax row */}
          <div className={rowBox}>
            <div className="grid md:grid-cols-3 gap-3">
              <label className="flex justify-between">
                Adults
                <select value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label className="flex justify-between">
                Children
                <select value={children} onChange={(e) => setChildren(Number(e.target.value))}>
                  {Array.from({ length: 10 }, (_, i) => i).map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label className="flex justify-between">
                Infants
                <select value={infants} onChange={(e) => setInfants(Number(e.target.value))}>
                  {Array.from({ length: 10 }, (_, i) => i).map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* More options */}
          {showMore && (
            <div className={rowBox}>
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <span className="block text-lg">Any class</span>
                  <select value={cabin} onChange={(e) => setCabin(e.target.value)} className="mt-2 w-full rounded border px-3 py-2">
                    <option value="any">Any</option>
                    <option value="economy">Economy</option>
                    <option value="premium">Premium Economy</option>
                    <option value="business">Business</option>
                    <option value="first">First</option>
                  </select>
                </div>
                <div>
                  <span className="block text-lg">Airline</span>
                  <input
                    value={airline}
                    onChange={(e) => setAirline(e.target.value)}
                    placeholder="Optional"
                    className="mt-2 w-full rounded border px-3 py-2"
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    id="nonstop"
                    type="checkbox"
                    checked={nonStopOnly}
                    onChange={(e) => setNonStopOnly(e.target.checked)}
                  />
                  Non-stop only
                </label>
              </div>
            </div>
          )}

          <div className="flex justify-between">
            <button type="button" onClick={() => setShowMore((v) => !v)} className="text-xl text-white/90 underline">
              {showMore ? "Less options" : "More options"}
            </button>
            <button type="submit" className={bigBtn}>
              Find Flights
            </button>
          </div>
        </form>
      )}

      {/* ===== Multi-city ===== */}
      {tripType === "multi" && (
        <form onSubmit={submitMulti} className="space-y-4">
          {legs.map((leg, i) => (
            <div key={i} className="space-y-1">
              {/* Label outside */}
              <div className="text-sm font-semibold text-white/90">{leg.label}</div>
              <div className={rowBox}>
                <div className="grid md:grid-cols-3 gap-3">
                  <AirportInput
                    value={leg.from}
                    onChange={(v) => {
                      const copy = [...legs];
                      copy[i].from = v;
                      setLegs(copy);
                    }}
                    airports={airports}
                    placeholder="From"
                  />
                  <AirportInput
                    value={leg.to}
                    onChange={(v) => {
                      const copy = [...legs];
                      copy[i].to = v;
                      setLegs(copy);
                    }}
                    airports={airports}
                    placeholder="To"
                  />
                  <DatePicker
                    selected={leg.date}
                    onChange={(d) => {
                      const copy = [...legs];
                      copy[i].date = d;
                      setLegs(copy);
                    }}
                    placeholderText="Leave on"
                    className={`${inputBase} cursor-pointer`}
                    dateFormat="dd-MM-yyyy"
                    minDate={i === 0 ? today : legs[i - 1].date ?? today}
                    isClearable
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Pax row */}
          <div className={rowBox}>
            <div className="grid md:grid-cols-3 gap-3">
              <label className="flex justify-between">
                Adults
                <select value={adults} onChange={(e) => setAdults(Number(e.target.value))}>
                  {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label className="flex justify-between">
                Children
                <select value={children} onChange={(e) => setChildren(Number(e.target.value))}>
                  {Array.from({ length: 10 }, (_, i) => i).map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
              <label className="flex justify-between">
                Infants
                <select value={infants} onChange={(e) => setInfants(Number(e.target.value))}>
                  {Array.from({ length: 10 }, (_, i) => i).map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setShowMore((v) => !v)} className="text-xl text-white/90 underline">
              {showMore ? "Less options" : "More options"}
            </button>
            <button type="submit" className={bigBtn}>
              Find Flights
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
