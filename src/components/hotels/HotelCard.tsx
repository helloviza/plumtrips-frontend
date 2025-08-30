export type Hotel = {
  id: string;
  name: string;
  city: string;
  rating: number;
  priceINR: number;
};

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-lg font-semibold">{hotel.name}</div>
          <div className="text-sm text-zinc-600">{hotel.city} • ⭐ {hotel.rating.toFixed(1)}</div>
        </div>
        <div className="text-right">
          <div className="text-xs uppercase tracking-wide text-zinc-500">from</div>
          <div className="text-2xl font-extrabold">₹{hotel.priceINR.toLocaleString('en-IN')}</div>
          <button className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700">
            View rooms
          </button>
        </div>
      </div>
    </div>
  );
}
