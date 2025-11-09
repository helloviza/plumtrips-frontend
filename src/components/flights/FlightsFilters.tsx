export type Filters = {
  stops: "any" | "0" | "1" | "2+";
  airlines: Set<string>; // airline codes selected
  minPrice?: number;
  maxPrice?: number;
  sort: "cheapest" | "fastest" | "earliest";
};

export default function FlightsFilters({
  airlineCodes,
  value,
  onChange,
}: {
  airlineCodes: string[];
  value: Filters;
  onChange: (next: Filters) => void;
}) {
  function toggleAirline(code: string) {
    const next = new Set(value.airlines);
    next.has(code) ? next.delete(code) : next.add(code);
    onChange({ ...value, airlines: next });
  }

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Stops */}
        <div>
          <div className="text-sm font-semibold">Stops</div>
          <select
            className="mt-2 w-full rounded-md border px-3 py-2"
            value={value.stops}
            onChange={(e) => onChange({ ...value, stops: e.target.value as Filters["stops"] })}
          >
            <option value="any">Any</option>
            <option value="0">Non-stop</option>
            <option value="1">1 stop</option>
            <option value="2+">2+ stops</option>
          </select>
        </div>

        {/* Airlines */}
        <div>
          <div className="text-sm font-semibold">Airlines</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {airlineCodes.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => toggleAirline(code)}
                className={`rounded-md border px-3 py-1 text-sm ${
                  value.airlines.has(code)
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "hover:bg-zinc-50"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div>
          <div className="text-sm font-semibold">Price (₹)</div>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              className="w-1/2 rounded-md border px-3 py-2"
              value={value.minPrice ?? ""}
              onChange={(e) =>
                onChange({ ...value, minPrice: e.target.value ? Number(e.target.value) : undefined })
              }
            />
            <input
              type="number"
              placeholder="Max"
              className="w-1/2 rounded-md border px-3 py-2"
              value={value.maxPrice ?? ""}
              onChange={(e) =>
                onChange({ ...value, maxPrice: e.target.value ? Number(e.target.value) : undefined })
              }
            />
          </div>
        </div>
      </div>

      {/* Sort */}
      <div className="mt-4 border-t pt-4">
        <div className="text-sm font-semibold">Sort by</div>
        <div className="mt-2">
          <select
            className="rounded-md border px-3 py-2"
            value={value.sort}
            onChange={(e) => onChange({ ...value, sort: e.target.value as Filters["sort"] })}
          >
            <option value="cheapest">Cheapest</option>
            <option value="fastest">Fastest</option>
            <option value="earliest">Earliest departure</option>
          </select>
        </div>
      </div>
    </div>
  );
}
