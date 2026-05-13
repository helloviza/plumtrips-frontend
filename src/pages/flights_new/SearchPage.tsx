import { useState, useRef, useEffect } from "react";
import type { SearchForm, Airport } from "../../lib/types_t";
import { MOCK_AIRPORTS, apiGetAirports, formatINR } from "../../lib/flights_api";
import flights from "../../assets/flights.jpeg";

// ─── TYPES ─────────────────────────────────────────────────

interface CityLeg {
  from: Airport;
  to: Airport;
  departDate: string;
}

// ─── AIRPORT AUTOCOMPLETE ──────────────────────────────────

function AirportInput({
  label,
  value,
  onChange,
  icon,
  airports,
}: {
  label: string;
  value: Airport;
  onChange: (a: Airport) => void;
  icon?: React.ReactNode;
  airports: Airport[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // FIX: Filter from the passed-in airports list (live API data or mock fallback)
  // instead of the hardcoded MOCK_AIRPORTS constant.
  const filtered = airports.filter(
    (a) =>
      a.city.toLowerCase().includes(query.toLowerCase()) ||
      a.code.toLowerCase().includes(query.toLowerCase()) ||
      a.name.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full h-full">
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setTimeout(() => inputRef.current?.focus(), 10);
          setQuery("");
        }}
        className="w-full h-full text-left px-4 py-3 hover:bg-orange-50/40 transition-colors group"
      >
        <div className="flex items-start gap-2">
          {icon && (
            <span className="text-[#d06549] mt-0.5 shrink-0">{icon}</span>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              {label}
            </div>
            <div className="text-2xl font-black text-gray-800 leading-none tracking-tight group-hover:text-[#d06549] transition-colors truncate">
              {value.code}
            </div>
            <div className="text-sm font-semibold text-gray-600 mt-0.5 truncate">{value.city}</div>
            <div className="text-xs text-gray-400 truncate">{value.name}</div>
          </div>
        </div>
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400 bg-transparent"
                placeholder={`Search ${label.toLowerCase()} city or airport...`}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-400 text-center">No airports found</div>
            ) : (
              filtered.map((a) => (
                <button
                  key={a.code}
                  type="button"
                  onClick={() => {
                    onChange(a);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 text-left transition-colors border-b border-gray-50 last:border-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-black text-xs text-gray-700 shrink-0">
                    {a.code}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-gray-800 text-sm">{a.city}</div>
                    <div className="text-xs text-gray-400 truncate">
                      {a.name}
                      {a.country ? ` · ${a.country}` : ""}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── CALENDAR / DATE PICKER ────────────────────────────────

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function CalendarPopup({
  value,
  value2,
  isRange,
  min,
  onChange,
  onClose,
}: {
  value: string;
  value2?: string;
  isRange?: boolean;
  min?: string;
  onChange: (d1: string, d2?: string) => void;
  onClose: () => void;
}) {
  const today = new Date();
  const minDate = min ? new Date(min) : new Date(today.toISOString().split("T")[0]);

  const parseDate = (s: string) => (s ? new Date(s + "T00:00:00") : null);

  const [hovering, setHovering] = useState<string | null>(null);
  const [selecting, setSelecting] = useState<"from" | "to">(value ? (isRange && !value2 ? "to" : "from") : "from");

  const [viewYear, setViewYear] = useState(() => {
    const d = parseDate(value);
    return d ? d.getFullYear() : today.getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const d = parseDate(value);
    return d ? d.getMonth() : today.getMonth();
  });

  const [viewYear2, setViewYear2] = useState(() => {
    const nextY = viewMonth === 11 ? viewYear + 1 : viewYear;
    return nextY;
  });
  const [viewMonth2, setViewMonth2] = useState(() => {
    return viewMonth === 11 ? 0 : viewMonth + 1;
  });

  function advanceMonth(dir: 1 | -1) {
    let m = viewMonth + dir;
    let y = viewYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setViewMonth(m);
    setViewYear(y);
    let m2 = m + 1;
    let y2 = y;
    if (m2 > 11) { m2 = 0; y2++; }
    setViewMonth2(m2);
    setViewYear2(y2);
  }

  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function getFirstDayOfWeek(year: number, month: number) {
    return new Date(year, month, 1).getDay();
  }

  function toStr(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  function isDisabled(dateStr: string) {
    return dateStr < minDate.toISOString().split("T")[0];
  }

  function isSelected(dateStr: string) {
    return dateStr === value || (isRange && dateStr === value2);
  }

  function isInRange(dateStr: string) {
    if (!isRange || !value || !value2) return false;
    return dateStr > value && dateStr < value2;
  }

  function isHoverRange(dateStr: string) {
    if (!isRange || !value || value2 || !hovering || selecting !== "to") return false;
    const lo = value < hovering ? value : hovering;
    const hi = value < hovering ? hovering : value;
    return dateStr > lo && dateStr < hi;
  }

  function handleDayClick(dateStr: string) {
    if (isDisabled(dateStr)) return;
    if (!isRange) {
      onChange(dateStr);
      onClose();
      return;
    }
    if (selecting === "from") {
      onChange(dateStr, "");
      setSelecting("to");
    } else {
      if (dateStr < value) {
        onChange(dateStr, value);
      } else {
        onChange(value, dateStr);
      }
      onClose();
    }
  }

  function renderMonth(year: number, month: number) {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfWeek(year, month);
    const cells: React.ReactNode[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`e-${i}`} />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = toStr(year, month, d);
      const disabled = isDisabled(dateStr);
      const selected = isSelected(dateStr);
      const inRange = isInRange(dateStr) || isHoverRange(dateStr);
      const isToday = dateStr === today.toISOString().split("T")[0];

      cells.push(
        <button
          key={d}
          type="button"
          disabled={disabled}
          onMouseEnter={() => setHovering(dateStr)}
          onMouseLeave={() => setHovering(null)}
          onClick={() => handleDayClick(dateStr)}
          className={`
            relative h-8 w-full text-xs font-semibold transition-all
            ${disabled ? "text-gray-300 cursor-not-allowed" : "cursor-pointer"}
            ${inRange && !disabled ? "bg-orange-50 text-[#d06549]" : ""}
            ${selected ? "z-10" : ""}
          `}
        >
          <span
            className={`
              relative z-10 flex items-center justify-center w-8 h-8 mx-auto rounded-full text-xs font-bold transition-all
              ${selected ? "bg-[#d06549] text-white shadow-md" : ""}
              ${!selected && !disabled && isToday ? "ring-2 ring-[#d06549] ring-offset-1 text-[#d06549]" : ""}
              ${!selected && !disabled && !isToday ? "hover:bg-orange-100 hover:text-[#d06549]" : ""}
            `}
          >
            {d}
          </span>
        </button>
      );
    }
    return cells;
  }

  return (
    <div
      className="absolute top-full mt-2 left-0 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[200] overflow-hidden"
      style={{ minWidth: "620px" }}
    >
      {isRange && (
        <div className="flex border-b border-gray-100 bg-gray-50">
          <button
            type="button"
            onClick={() => setSelecting("from")}
            className={`flex-1 py-3 px-5 text-left text-xs font-bold transition-colors ${selecting === "from" ? "text-[#d06549] border-b-2 border-[#d06549]" : "text-gray-400"}`}
          >
            <div className="text-[10px] uppercase tracking-widest mb-0.5">Departure</div>
            <div className="text-sm font-black text-gray-800">
              {value ? new Date(value + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Select date"}
            </div>
          </button>
          <div className="w-px bg-gray-200 my-2" />
          <button
            type="button"
            onClick={() => value && setSelecting("to")}
            className={`flex-1 py-3 px-5 text-left text-xs font-bold transition-colors ${selecting === "to" ? "text-[#d06549] border-b-2 border-[#d06549]" : "text-gray-400"}`}
          >
            <div className="text-[10px] uppercase tracking-widest mb-0.5">Return</div>
            <div className="text-sm font-black text-gray-800">
              {value2 ? new Date(value2 + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Select date"}
            </div>
          </button>
        </div>
      )}

      <div className="flex gap-0">
        {[
          { year: viewYear, month: viewMonth },
          { year: viewYear2, month: viewMonth2 },
        ].map((cal, idx) => (
          <div key={idx} className={`flex-1 p-4 ${idx === 0 ? "border-r border-gray-100" : ""}`}>
            <div className="flex items-center justify-between mb-3">
              {idx === 0 ? (
                <button
                  type="button"
                  onClick={() => advanceMonth(-1)}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              ) : <div className="w-7" />}
              <div className="text-sm font-black text-gray-800">
                {MONTHS[cal.month]} {cal.year}
              </div>
              {idx === 1 ? (
                <button
                  type="button"
                  onClick={() => advanceMonth(1)}
                  className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : <div className="w-7" />}
            </div>
            <div className="grid grid-cols-7 mb-1">
              {DAYS.map((d) => (
                <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-0.5">
              {renderMonth(cal.year, cal.month)}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-100 px-5 py-3 flex items-center justify-between bg-gray-50">
        <button
          type="button"
          onClick={() => { onChange("", ""); }}
          className="text-xs text-gray-400 hover:text-[#d06549] font-semibold transition-colors"
        >
          Clear dates
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2 rounded-xl text-xs font-black text-white transition-all hover:brightness-90"
          style={{ background: "#d06549" }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ─── DATE FIELD ────────────────────────────────────────────

function DateField({
  label,
  value,
  value2,
  isRange,
  min,
  disabled,
  onClick,
}: {
  label: string;
  value: string;
  value2?: string;
  isRange?: boolean;
  min?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const fmt = (v: string) => {
    if (!v) return null;
    const d = new Date(v + "T00:00:00");
    return {
      date: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      year: d.getFullYear().toString(),
      day: d.toLocaleDateString("en-IN", { weekday: "long" }),
    };
  };

  const f = fmt(value);

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full h-full text-left px-4 py-3 transition-colors
        ${disabled ? "opacity-40 cursor-not-allowed" : "hover:bg-orange-50/40 cursor-pointer"}
      `}
    >
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">{label}</div>
      {f ? (
        <>
          <div className="text-2xl font-black text-gray-800 leading-none tracking-tight">
            {f.date}
            <span className="text-sm font-semibold text-gray-400 ml-1">'{f.year.slice(2)}</span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{f.day}</div>
        </>
      ) : (
        <div className="text-sm text-gray-400 font-medium mt-1">
          {disabled ? "—" : "Select date"}
        </div>
      )}
    </button>
  );
}

// ─── PASSENGER ROW ─────────────────────────────────────────

function PassengerRow({
  label,
  sub,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  sub: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <div className="text-sm font-bold text-gray-800">{label}</div>
        <div className="text-xs text-gray-400">{sub}</div>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border-2 border-gray-300 text-gray-600 flex items-center justify-center hover:border-[#d06549] hover:text-[#d06549] disabled:opacity-30 transition-colors text-lg leading-none font-bold"
        >
          −
        </button>
        <span className="w-5 text-center font-black text-gray-800 text-sm">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 transition-colors text-lg leading-none font-bold text-white"
          style={{ background: "#d06549" }}
        >
          +
        </button>
      </div>
    </div>
  );
}

// ─── PASSENGER PICKER ──────────────────────────────────────

function PassengerPicker({
  adults,
  children,
  infants,
  cabinClass,
  onChange,
}: {
  adults: number;
  children: number;
  infants: number;
  cabinClass: SearchForm["cabinClass"];
  onChange: (a: number, c: number, i: number, cls: SearchForm["cabinClass"]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const classes: SearchForm["cabinClass"][] = ["Economy", "Premium Economy", "Business", "First"];
  const total = adults + children + infants;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full h-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-full text-left px-4 py-3 hover:bg-orange-50/40 transition-colors group"
      >
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-[#d06549] mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">
              Passengers &amp; Class
            </div>
            <div className="text-2xl font-black text-gray-800 leading-none tracking-tight group-hover:text-[#d06549] transition-colors">
              {total}
            </div>
            <div className="text-sm font-semibold text-gray-600 mt-0.5">
              {total === 1 ? "Traveller" : "Travellers"}
            </div>
            <div className="text-xs text-gray-400">{cabinClass}</div>
          </div>
        </div>
      </button>

      {open && (
        <div className="absolute top-full mt-1 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-[100] p-5">
          <PassengerRow
            label="Adults"
            sub="12+ years"
            value={adults}
            min={1}
            max={9}
            onChange={(v) => onChange(v, children, infants, cabinClass)}
          />
          <PassengerRow
            label="Children"
            sub="2 – 12 years"
            value={children}
            min={0}
            max={9}
            onChange={(v) => onChange(adults, v, infants, cabinClass)}
          />
          <PassengerRow
            label="Infants"
            sub="Under 2 years"
            value={infants}
            min={0}
            max={4}
            onChange={(v) => onChange(adults, children, v, cabinClass)}
          />

          <div className="mt-4">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
              Cabin Class
            </div>
            <div className="grid grid-cols-2 gap-2">
              {classes.map((cls) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => onChange(adults, children, infants, cls)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition-all ${cabinClass === cls
                    ? "text-white border-[#d06549]"
                    : "border-gray-200 text-gray-600 hover:border-[#d06549] hover:text-[#d06549]"
                    }`}
                  style={cabinClass === cls ? { background: "#d06549", borderColor: "#d06549" } : {}}
                >
                  {cls}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 w-full bg-gray-800 text-white rounded-xl py-2.5 text-sm font-bold hover:bg-gray-700 transition-colors"
          >
            Confirm
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MULTI-CITY LEG ROW ────────────────────────────────────

function MultiCityLeg({
  leg,
  index,
  total,
  today,
  airports,
  onUpdate,
  onRemove,
}: {
  leg: CityLeg;
  index: number;
  total: number;
  today: string;
  airports: Airport[];
  onUpdate: (l: Partial<CityLeg>) => void;
  onRemove: () => void;
}) {
  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function swap() {
    onUpdate({ from: leg.to, to: leg.from });
  }

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[10px] font-black text-[#d06549] uppercase tracking-widest bg-orange-50 px-2.5 py-0.5 rounded-full">
          Flight {index + 1}
        </span>
        {total > 2 && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-auto text-[10px] text-gray-400 hover:text-red-400 font-semibold transition-colors flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Remove
          </button>
        )}
      </div>
      <div className="flex rounded-xl border border-gray-200 overflow-visible">
        <div className="flex-1" style={{ borderRight: "1px solid #e5e7eb" }}>
          <AirportInput
            label="From"
            value={leg.from}
            airports={airports}
            onChange={(a) => onUpdate({ from: a })}
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            }
          />
        </div>

        <div className="relative flex items-center justify-center" style={{ width: 0 }}>
          <button
            onClick={swap}
            className="absolute z-10 w-7 h-7 rounded-full bg-white border-2 border-gray-200 hover:border-[#d06549] flex items-center justify-center shadow transition-colors group"
          >
            <svg className="w-3 h-3 text-gray-400 group-hover:text-[#d06549]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
        </div>

        <div className="flex-1" style={{ borderRight: "1px solid #e5e7eb" }}>
          <AirportInput
            label="To"
            value={leg.to}
            airports={airports}
            onChange={(a) => onUpdate({ to: a })}
            icon={
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            }
          />
        </div>

        <div className="flex-[0.7] relative" ref={calRef}>
          <DateField
            label="Depart"
            value={leg.departDate}
            min={today}
            onClick={() => setCalOpen(!calOpen)}
          />
          {calOpen && (
            <CalendarPopup
              value={leg.departDate}
              min={today}
              onChange={(d1) => {
                onUpdate({ departDate: d1 });
                setCalOpen(false);
              }}
              onClose={() => setCalOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SEARCH PAGE ───────────────────────────────────────────

interface SearchPageProps {
  onSearch: (form: SearchForm, multiLegs?: CityLeg[]) => void;
}

// Stacked box style matching FlightSearchForm
const stackedBox =
  "rounded-xl border-2 border-[#a8d5ff] bg-white p-2.5";

export default function SearchPage({ onSearch }: SearchPageProps) {
  const today = new Date().toISOString().split("T")[0];

  // FIX Bug 2: Fetch live airports from API; fall back to MOCK_AIRPORTS on error.
  // This is the root cause of cities not showing — AirportInput was always
  // filtering from the hardcoded 17-airport MOCK_AIRPORTS list.
  const [airports, setAirports] = useState<Airport[]>(MOCK_AIRPORTS);
  useEffect(() => {
    apiGetAirports().then(setAirports).catch(() => setAirports(MOCK_AIRPORTS));
  }, []);

  const [form, setForm] = useState<SearchForm>({
    tripType: "oneWay",
    from: MOCK_AIRPORTS[0],
    to: MOCK_AIRPORTS[1],
    departDate: today,
    returnDate: "",
    adults: 1,
    children: 0,
    infants: 0,
    cabinClass: "Economy",
    nonStopOnly: false,
    fareType: "Regular",
  });

  const [multiLegs, setMultiLegs] = useState<CityLeg[]>([
    { from: MOCK_AIRPORTS[0], to: MOCK_AIRPORTS[1], departDate: today },
    // FIX Bug 3: Safe fallback in case airport list has < 3 entries
    { from: MOCK_AIRPORTS[1] ?? MOCK_AIRPORTS[0], to: MOCK_AIRPORTS[2] ?? MOCK_AIRPORTS[0], departDate: "" },
  ]);

  const [calOpen, setCalOpen] = useState(false);
  const calRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  function swap() {
    setForm((f) => ({ ...f, from: f.to, to: f.from }));
  }

  function addLeg() {
    if (multiLegs.length >= 5) return;
    const last = multiLegs[multiLegs.length - 1];
    setMultiLegs((legs) => [
      ...legs,
      // FIX: Use airports state (live data) not hardcoded MOCK_AIRPORTS
      { from: last.to, to: airports[0] ?? MOCK_AIRPORTS[0], departDate: "" },
    ]);
  }

  function updateLeg(idx: number, update: Partial<CityLeg>) {
    setMultiLegs((legs) => legs.map((l, i) => (i === idx ? { ...l, ...update } : l)));
  }

  function removeLeg(idx: number) {
    setMultiLegs((legs) => legs.filter((_, i) => i !== idx));
  }

  const isRound = form.tripType === "roundTrip";
  const isMulti = form.tripType === "multiCity";

  const tripTabs = [
    { key: "oneWay" as const, label: "One way" },
    { key: "roundTrip" as const, label: "Round trip" },
    { key: "multiCity" as const, label: "Multi-city" },
  ];

  function handleSearch() {
    if (isMulti) {
      onSearch({ ...form, tripType: "multiCity" }, multiLegs);
    } else {
      onSearch(form);
    }
  }

  return (
    <div className="min-h-screen font-sans" style={{ background: "#f0f2f5" }}>

      {/* ══════════════════════════════════════════
           HERO
         ══════════════════════════════════════════ */}
      <section className="relative" style={{ minHeight: "520px" }}>
        <img src={flights} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(155deg, rgba(10,72,170,0.93) 0%, rgba(20,120,210,0.82) 50%, rgba(30,155,235,0.58) 100%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-32"
          style={{ background: "linear-gradient(to top, #f0f2f5, transparent)" }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 pt-6 pb-24">

          {/* ══ WHITE FORM CARD ══ */}
          <div className="bg-white rounded-2xl overflow-visible">

            {/* Trip type tabs */}
            <div className="flex border-b border-gray-100" style={{ background: "#fafafa" }}>
              {tripTabs.map((t, i) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tripType: t.key }))}
                  className={`px-7 py-3.5 text-sm font-bold transition-all border-b-2 ${form.tripType === t.key
                    ? "border-[#d06549] text-[#d06549] bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/70"
                    }`}
                  style={{ borderRight: i < 2 ? "1px solid #f0f0f0" : undefined }}
                >
                  {t.label}
                </button>
              ))}

              {/* Fare type pills (right side) */}
              <div className="flex-1 flex items-center justify-end gap-3 px-5">
                {(["Regular", "Student", "ArmedForces", "SeniorCitizen"] as const).map((ft, i) => (
                  <label key={ft} className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="fareType"
                      checked={form.fareType === ft}
                      onChange={() => setForm((f) => ({ ...f, fareType: ft }))}
                      className="accent-[#d06549]"
                    />
                    <span className="text-xs text-gray-500 font-semibold whitespace-nowrap">
                      {["Regular", "Student", "Armed Forces", "Senior Citizen"][i]}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="p-5">

              {/* ═══ MULTI-CITY LAYOUT ═══ */}
              {isMulti ? (
                <div>
                  {multiLegs.map((leg, idx) => (
                    <MultiCityLeg
                      key={idx}
                      leg={leg}
                      index={idx}
                      total={multiLegs.length}
                      today={today}
                      airports={airports}
                      onUpdate={(u) => updateLeg(idx, u)}
                      onRemove={() => removeLeg(idx)}
                    />
                  ))}

                  <div className="flex items-center justify-between mt-2 mb-4">
                    {multiLegs.length < 5 ? (
                      <button
                        type="button"
                        onClick={addLeg}
                        className="flex items-center gap-2 text-sm font-bold transition-colors px-4 py-2 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#d06549] hover:text-[#d06549] text-gray-400"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Add another city
                      </button>
                    ) : (
                      <div className="text-xs text-gray-400">Maximum 5 flights</div>
                    )}

                    <div className="border border-gray-200 rounded-xl overflow-visible">
                      <PassengerPicker
                        adults={form.adults}
                        children={form.children}
                        infants={form.infants}
                        cabinClass={form.cabinClass}
                        onChange={(a, c, i, cls) =>
                          setForm((f) => ({ ...f, adults: a, children: c, infants: i, cabinClass: cls }))
                        }
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* ═══ ONE WAY / ROUND TRIP — STACKED BOX LAYOUT (like FlightSearchForm) ═══ */
                <div className="space-y-3.5">

                  {/* ROW 1 — From | swap | To */}
                  <div className={stackedBox}>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 relative">
                      <AirportInput
                        label="From"
                        value={form.from}
                        airports={airports}
                        onChange={(a) => setForm((f) => ({ ...f, from: a }))}
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                        }
                      />
                      {/* Swap button — centered between From and To on md+ */}
                      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                        <button
                          onClick={swap}
                          title="Swap airports"
                          className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 hover:border-[#d06549] flex items-center justify-center shadow transition-colors group"
                        >
                          <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#d06549]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
                          </svg>
                        </button>
                      </div>
                      <AirportInput
                        label="To"
                        value={form.to}
                        airports={airports}
                        onChange={(a) => setForm((f) => ({ ...f, to: a }))}
                        icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        }
                      />
                    </div>
                  </div>

                  {/* ROW 2 — Depart date | Return date (or empty) */}
                  <div className={stackedBox} ref={calRef}>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 relative">
                      {/* DEPART */}
                      <div className="relative">
                        <DateField
                          label="Leave on"
                          value={form.departDate}
                          min={today}
                          onClick={() => !isRound && setCalOpen(true)}
                        />
                        {!isRound && calOpen && (
                          <CalendarPopup
                            value={form.departDate}
                            min={today}
                            onChange={(d1) => {
                              setForm((f) => ({ ...f, departDate: d1 }));
                              setCalOpen(false);
                            }}
                            onClose={() => setCalOpen(false)}
                          />
                        )}
                      </div>

                      {/* RETURN — shown for round trip, clickable placeholder for one-way */}
                      <div
                        className="relative"
                        onClick={
                          !isRound
                            ? () => setForm((f) => ({ ...f, tripType: "roundTrip" }))
                            : undefined
                        }
                      >
                        <DateField
                          label="Return on"
                          value={form.returnDate}
                          value2={form.returnDate}
                          isRange={isRound}
                          min={form.departDate || today}
                          disabled={!isRound}
                          onClick={isRound ? () => setCalOpen(!calOpen) : undefined}
                        />
                        {isRound && calOpen && (
                          <CalendarPopup
                            value={form.departDate}
                            value2={form.returnDate}
                            isRange
                            min={today}
                            onChange={(d1, d2) => {
                              setForm((f) => ({ ...f, departDate: d1, returnDate: d2 ?? "" }));
                              if (d2) setCalOpen(false);
                            }}
                            onClose={() => setCalOpen(false)}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ROW 3 — Adults | Children | Infants + cabin via PassengerPicker */}
                  <div className={stackedBox}>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {/* Left cell: passenger counts summary */}
                      <div className="flex items-center gap-6 px-2">
                        {[
                          { label: "Adults", value: form.adults, min: 1, max: 9, key: "adults" as const },
                          { label: "Children", value: form.children, min: 0, max: 9, key: "children" as const },
                          { label: "Infants", value: form.infants, min: 0, max: 4, key: "infants" as const },
                        ].map(({ label, value, min, max, key }) => (
                          <label key={key} className="flex flex-col items-center gap-1 text-sm cursor-pointer select-none">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, [key]: Math.max(min, f[key] - 1) }))}
                                disabled={value <= min}
                                className="w-6 h-6 rounded-full border border-gray-300 text-gray-500 flex items-center justify-center hover:border-[#d06549] hover:text-[#d06549] disabled:opacity-30 transition-colors text-sm font-bold leading-none"
                              >
                                −
                              </button>
                              <span className="w-4 text-center font-black text-gray-800 text-base">{value}</span>
                              <button
                                type="button"
                                onClick={() => setForm((f) => ({ ...f, [key]: Math.min(max, f[key] + 1) }))}
                                disabled={value >= max}
                                className="w-6 h-6 rounded-full flex items-center justify-center disabled:opacity-30 transition-colors text-sm font-bold leading-none text-white"
                                style={{ background: "#d06549" }}
                              >
                                +
                              </button>
                            </div>
                          </label>
                        ))}
                      </div>

                      {/* Right cell: cabin class via PassengerPicker dropdown */}
                      <div className="border border-gray-200 rounded-xl overflow-visible">
                        <PassengerPicker
                          adults={form.adults}
                          children={form.children}
                          infants={form.infants}
                          cabinClass={form.cabinClass}
                          onChange={(a, c, i, cls) =>
                            setForm((f) => ({ ...f, adults: a, children: c, infants: i, cabinClass: cls }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* ─── Bottom options row ─── */}
              <div className="flex items-center justify-between mt-3.5">
                <div className="flex items-center gap-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.nonStopOnly}
                      onChange={(e) => setForm((f) => ({ ...f, nonStopOnly: e.target.checked }))}
                      className="accent-[#d06549] rounded w-4 h-4"
                    />
                    <span className="text-sm text-gray-600 font-semibold">Non-stop only</span>
                  </label>
                </div>

                <button
                  onClick={handleSearch}
                  className="font-black text-sm tracking-widest text-white px-12 py-3.5 rounded-xl transition-all hover:brightness-90 active:scale-95 shadow-lg"
                  style={{
                    background: "linear-gradient(135deg, #d06549 0%, #b8543a 100%)",
                    letterSpacing: "0.12em",
                    boxShadow: "0 4px 20px rgba(208,101,73,0.35)",
                  }}
                >
                  FIND FLIGHTS
                </button>
              </div>
            </div>
          </div>
          {/* END FORM CARD */}
        </div>
      </section>


    </div>
  );
}