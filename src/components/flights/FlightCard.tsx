// apps/frontend/src/components/flights/FlightCard.tsx
export type Flight = {
  id: string;
  from: string;
  to: string;
  departTime: string;
  arriveTime: string;
  durationMins: number;
  stops: number;
  airlineCode: string;
  airlineName: string;
  priceINR: number;
  cabin: "economy" | "premium" | "business" | "first";
  flightNumber: string;
};

type Props = {
  flight: Flight;
  onSelect?: (flight: Flight) => void;
};

export default function FlightCard({ flight, onSelect }: Props) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm text-zinc-500">
            {flight.airlineName || flight.airlineCode} • {flight.flightNumber}
          </div>
          <div className="text-lg font-semibold">
            {flight.from} {flight.departTime} → {flight.to} {flight.arriveTime}
          </div>
          <div className="text-xs text-zinc-500">
            {flight.durationMins} mins •{" "}
            {flight.stops === 0 ? "Non-stop" : `${flight.stops} stop${flight.stops > 1 ? "s" : ""}`} •{" "}
            {flight.cabin}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold">
            ₹{Math.round(flight.priceINR).toLocaleString("en-IN")}
          </div>
          <button
            type="button"
            onClick={() => onSelect?.(flight)}
            className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
