import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Shield, Clock } from 'lucide-react';
import { useHotelStore } from '../../stores/hotelStore';
import HotelSearchBar from '../../components/hotels/HotelSearchBar';
const POPULAR_DESTINATIONS = [
  { name: 'Dubai', country: 'UAE', img: '/assets/home/holiday-dubai-stop.jpg' },
  { name: 'Mumbai', country: 'India', img: '/assets/hotel-bg.jpg' },
  { name: 'Goa', country: 'India', img: '/assets/holidays/kashmir.jpg' },
  { name: 'Jaipur', country: 'India', img: '/assets/holidays/jaipur.jpg' },
  { name: 'Maldives', country: 'Maldives', img: '/assets/offers/maldives.jpg' },
  { name: 'Singapore', country: 'Singapore', img: '/assets/home/visa-singapore.jpg' },
];

export default function HotelSearch() {
  const navigate = useNavigate();
  const { searchParams, setSearchParams, resetBooking } = useHotelStore();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!searchParams.location.trim()) e.location = 'Please enter a destination';
    else if (!searchParams.locationId) e.location = 'Please select a valid city or hotel from the dropdown list';
    if (!searchParams.checkIn) e.checkIn = 'Select check-in date';
    if (!searchParams.checkOut) e.checkOut = 'Select check-out date';
    if (searchParams.checkIn && searchParams.checkOut) {
      const ci = searchParams.checkIn instanceof Date ? searchParams.checkIn : new Date(searchParams.checkIn);
      const co = searchParams.checkOut instanceof Date ? searchParams.checkOut : new Date(searchParams.checkOut);
      if (ci >= co) e.checkOut = 'Check-out must be after check-in';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSearch = () => {
    if (!validate()) return;
    resetBooking();
    navigate('/hotels/results');
  };

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <div className="bg-gradient-to-b from-[#003580] via-[#002a62] to-[#001d3f] pb-28 pt-16 md:pb-32 md:pt-20">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h1 className="mb-3 text-3xl font-semibold text-white md:text-5xl">
            Find your perfect stay
          </h1>
          <p className="mx-auto max-w-2xl text-sm text-blue-200 md:text-base">
            Search deals on hotels, homes, and much more — local favourites, handpicked stays, and flexible booking options.
          </p>
        </div>
      </div>

      <div className="relative z-20 mx-auto -mt-16 max-w-6xl px-4 md:-mt-20">
        <HotelSearchBar errors={errors} onSearch={handleSearch} />
      </div>

      <div className="mx-auto mt-8 max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { icon: <Shield className="h-5 w-5 text-[#003580]" />, title: 'Best Price Guarantee', sub: 'Find it cheaper? We refund the diff' },
            { icon: <Star className="h-5 w-5 text-[#003580]" />, title: '1M+ Properties', sub: 'Hotels, apartments, villas & more' },
            { icon: <Shield className="h-5 w-5 text-[#003580]" />, title: 'Free Cancellation', sub: 'On most bookings' },
            { icon: <Clock className="h-5 w-5 text-[#003580]" />, title: '24/7 Support', sub: 'Always here to help' },
          ].map((b, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mt-0.5 shrink-0">{b.icon}</div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{b.title}</div>
                <div className="text-xs text-gray-500">{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl px-4 pb-16">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Popular destinations</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {POPULAR_DESTINATIONS.map((dest) => (
            <button
              key={dest.name}
              type="button"
              onClick={() => {
                setSearchParams({ location: `${dest.name}, ${dest.country}` });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group relative overflow-hidden rounded-xl shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md"
            >
              <div className="aspect-square">
                <img
                  src={dest.img}
                  alt={dest.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-3 text-left text-white">
                <div className="text-sm font-bold leading-tight">{dest.name}</div>
                <div className="text-xs text-white/80">{dest.country}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
