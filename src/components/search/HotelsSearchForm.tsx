import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/datepicker.css";

const rowBox =
  "rounded-none border-2 border-[#a8d5ff] bg-white p-2.5 shadow-none";
const bigBtn =
  "rounded-none bg-[#d06549] px-8 py-2.5 text-white font-extrabold tracking-wider uppercase hover:opacity-95";
const inputBase =
  "mt-0 w-full border-0 bg-transparent text-lg placeholder-zinc-400 focus:outline-none";

export default function HotelSearchForm() {
  const [location, setLocation] = useState("");
  const [checkIn, setCheckIn] = useState<Date | null>(null);
  const [checkOut, setCheckOut] = useState<Date | null>(null);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  function submitHotel(e: React.FormEvent) {
    e.preventDefault();
    alert(`Hotel search: ${location}, ${adults} adults, ${children} children`);
  }

  return (
    <form onSubmit={submitHotel} className="space-y-4">
      {/* Location */}
      <div className="space-y-1">
        <div className="text-sm font-semibold text-white/90">Hotel location</div>
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
        <div className="text-sm font-semibold text-white/90">Check-in / Check-out</div>
        <div className={rowBox}>
          <div className="grid md:grid-cols-2 gap-3">
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
          <div className="grid md:grid-cols-2 gap-3">
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
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <a href="#" className="text-xl text-white/90 underline underline-offset-4">
          Add another room
        </a>
        <button type="submit" className={bigBtn}>
          Find Hotels
        </button>
      </div>
    </form>
  );
}
