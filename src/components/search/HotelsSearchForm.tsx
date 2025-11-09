// src/components/search/HotelsSearchForm.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { format } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/datepicker.css";

const rowBox =
  "rounded-none border-2 border-[#a8d5ff] bg-white p-2.5 shadow-none";
const bigBtn =
  "w-full sm:w-auto rounded-none bg-[#d06549] px-5 sm:px-8 py-2 text-xs sm:text-sm text-white font-extrabold tracking-wider uppercase hover:opacity-95";
const inputBase =
  "mt-0 w-full border-0 bg-transparent text-base sm:text-lg placeholder-zinc-400 focus:outline-none";

const fmt = (d: Date | null) => (d ? format(d, "yyyy-MM-dd") : "");

export default function HotelsSearchForm() {
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  function submitHotel(e: React.FormEvent) {
    e.preventDefault();

    const params = new URLSearchParams({
      location: location.trim(),
      checkin: fmt(checkIn),
      checkout: fmt(checkOut),
      adults: String(adults),
      children: String(children),
      rooms: "1",
    });

    // Stay on plumtrips.com and open the embedded engine page
    navigate(`/engine/hotels?${params.toString()}`);
  }

  return (
    <form onSubmit={submitHotel} className="space-y-4">
      {/* Location */}
      <div className="space-y-1">
        <div className="text-sm font-semibold text-white/90">
          Hotel location
        </div>
        <div className={rowBox}>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City or area"
            className={inputBase}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-1">
        <div className="text-sm font-semibold text-white/90">
          Check-in / Check-out
        </div>
        <div className={rowBox}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <DatePicker
              selected={checkIn}
              onChange={setCheckIn}
              placeholderText="dd-mm-yyyy"
              className={`${inputBase} cursor-pointer`}
              dateFormat="dd-MM-yyyy"
              minDate={new Date()}
            />
            <DatePicker
              selected={checkOut}
              onChange={setCheckOut}
              placeholderText="dd-mm-yyyy"
              className={`${inputBase} cursor-pointer`}
              dateFormat="dd-MM-yyyy"
              minDate={checkIn ?? new Date()}
            />
          </div>
        </div>
      </div>

      {/* Room */}
      <div className="space-y-1">
        <div className="text-sm font-semibold text-white/90">Room 1</div>
        <div className={rowBox}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="flex items-center justify-between gap-2 text-sm">
              <span>Adults</span>
              <select
                className="rounded border px-2 py-1 text-sm"
                value={adults}
                onChange={(e) => setAdults(Number(e.target.value))}
              >
                {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <label className="flex items-center justify-between gap-2 text-sm">
              <span>Children</span>
              <select
                className="rounded border px-2 py-1 text-sm"
                value={children}
                onChange={(e) => setChildren(Number(e.target.value))}
              >
                {Array.from({ length: 10 }, (_, i) => i).map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <a
          href="#"
          className="text-xs sm:text-sm text-white/90 underline underline-offset-4"
          onClick={(e) => e.preventDefault()}
        >
          Add another room
        </a>
        <button type="submit" className={bigBtn}>
          Find Hotels
        </button>
      </div>
    </form>
  );
}
