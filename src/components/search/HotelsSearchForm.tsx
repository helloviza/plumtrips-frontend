import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HotelsSearchForm() {
  const navigate = useNavigate();

  const [city, setCity] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  // rooms: keep simple — a list of { adults, children }
  const [rooms, setRooms] = useState([{ adults: 2, children: 0 }]);

  function addRoom() {
    setRooms((r) => [...r, { adults: 2, children: 0 }]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      city,
      checkin: checkIn,
      checkout: checkOut,
      rooms: JSON.stringify(rooms),
    });
    navigate(`/hotels?${params.toString()}`);
  }

  const card =
    "rounded-none border border-[#a8d5ff] bg-white p-5 text-zinc-900 shadow-sm";
  const bigButton =
    "rounded-none bg-[#ffd400] px-10 py-4 text-black font-extrabold tracking-wider uppercase hover:bg-yellow-300";

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className={card}>
        <label className="block text-lg text-zinc-500">Hotel location</label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="City or area"
          className="mt-2 w-full border-0 bg-transparent text-2xl focus:outline-none"
        />
      </div>

      <div className={card}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="block text-lg text-zinc-500">Check-in on</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="mt-2 w-full border-0 bg-transparent text-xl focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-lg text-zinc-500">Check-out on</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="mt-2 w-full border-0 bg-transparent text-xl focus:outline-none"
            />
          </div>
        </div>
      </div>

      {rooms.map((room, i) => (
        <div key={i} className={card}>
          <div className="mb-2 text-xl text-zinc-600">Room {i + 1}</div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <span className="text-lg">Adults</span>
              <select
                value={room.adults}
                onChange={(e) => {
                  const copy = [...rooms];
                  copy[i].adults = Number(e.target.value);
                  setRooms(copy);
                }}
                className="rounded border px-3 py-2"
              >
                {Array.from({ length: 6 }, (_, n) => n + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg">Children</span>
              <select
                value={room.children}
                onChange={(e) => {
                  const copy = [...rooms];
                  copy[i].children = Number(e.target.value);
                  setRooms(copy);
                }}
                className="rounded border px-3 py-2"
              >
                {Array.from({ length: 6 }, (_, n) => n).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addRoom}
        className="text-xl text-white/90 underline underline-offset-4"
      >
        Add another room
      </button>

      <div className="flex justify-end">
        <button type="submit" className={bigButton}>
          Find Hotels
        </button>
      </div>
    </form>
  );
}
