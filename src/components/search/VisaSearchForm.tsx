import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function VisaSearchForm() {
  const navigate = useNavigate();
  const [country, setCountry] = useState("UAE");
  const [type, setType] = useState("tourist");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ country, type });
    navigate(`/visa?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-600">Country</label>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="UAE"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-600">Visa Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 w-full rounded-md border px-3 py-2"
          >
            <option value="tourist">Tourist</option>
            <option value="business">Business</option>
            <option value="student">Student</option>
            <option value="transit">Transit</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Find Visa Info
        </button>
      </div>
    </form>
  );
}
