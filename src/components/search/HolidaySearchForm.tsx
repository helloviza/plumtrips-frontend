import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HolidaySearchForm() {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("Dubai");
  const [days, setDays] = useState(5);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      destination,
      days: String(days),
    });
    navigate(`/holidays?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-600">Destination</label>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Dubai"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-600">Days</label>
          <input
            type="number"
            min={1}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Search Holidays
        </button>
      </div>
    </form>
  );
}
