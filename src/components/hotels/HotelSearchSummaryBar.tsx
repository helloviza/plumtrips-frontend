import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Users, MapPin, X, Search } from 'lucide-react';
import { useHotelStore } from '../../stores/hotelStore';
import LocationAutocomplete from './LocationAutocomplete';
import { HotelRangePickerTriggers } from './HotelRangePicker';
import GuestsRoomsSelector from './GuestsRoomsSelector';
import { useHotelSearch } from '../../hooks/useHotelApi';

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      {children}
    </span>
  );
}

export default function HotelSearchSummaryBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { searchParams, setSearchParams } = useHotelStore();
  const { search } = useHotelSearch();
  const [isEditing, setIsEditing] = useState(false);

  const checkIn  = searchParams.checkIn  ? (searchParams.checkIn  instanceof Date ? searchParams.checkIn  : new Date(searchParams.checkIn))  : null;
  const checkOut = searchParams.checkOut ? (searchParams.checkOut instanceof Date ? searchParams.checkOut : new Date(searchParams.checkOut)) : null;
  const totalGuests = searchParams.adults + searchParams.children;
  const totalRooms = searchParams.rooms;
  const destination = searchParams.location || 'Select destination';

  const handleSearch = () => {
    setIsEditing(false);
    search({
      cityCode: searchParams.locationId ?? searchParams.location,
      checkIn: checkIn ? checkIn.toISOString().split('T')[0] : '',
      checkOut: checkOut ? checkOut.toISOString().split('T')[0] : '',
      rooms: searchParams.rooms,
      adults: searchParams.adults,
      children: searchParams.children || undefined,
      childrenAges:
        searchParams.children > 0
          ? searchParams.childrenAges.length === searchParams.children
            ? searchParams.childrenAges
            : Array(searchParams.children).fill(5)
          : undefined,
      nationality: 'IN',
    });
    if (location.pathname !== '/hotels/results') {
      navigate('/hotels/results');
    }
  };

  return (
    <>
      {/* ── Compact summary pill ── */}
      <button
        onClick={() => setIsEditing(true)}
        className="w-full mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm hover:border-[#003580] hover:shadow-md transition-all text-left group"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <MapPin className="h-4 w-4 text-[#003580] shrink-0" />
          <span className="font-semibold text-slate-800 text-sm truncate">{destination}</span>
        </div>
        <div className="h-4 w-px bg-slate-200 shrink-0 hidden sm:block" />
        <div className="flex items-center gap-2 shrink-0">
          <Calendar className="h-4 w-4 text-[#003580] shrink-0" />
          <span className="text-sm text-slate-600 whitespace-nowrap">
            {checkIn ? format(checkIn, 'dd MMM') : '—'}
            {' → '}
            {checkOut ? format(checkOut, 'dd MMM') : '—'}
          </span>
        </div>
        <div className="h-4 w-px bg-slate-200 shrink-0 hidden sm:block" />
        <div className="flex items-center gap-2 shrink-0">
          <Users className="h-4 w-4 text-[#003580] shrink-0" />
          <span className="text-sm text-slate-600 whitespace-nowrap">
            {totalRooms} Room{totalRooms !== 1 ? 's' : ''} · {totalGuests} Guest{totalGuests !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1.5 shrink-0 text-[#003580] font-semibold text-sm">
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Modify</span>
        </div>
      </button>

      {/* ── Modal overlay ── */}
      {isEditing && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: 1040 }}
            onClick={() => setIsEditing(false)}
          />

          {/* Modal */}
          <div
            className="fixed left-1/2 top-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl"
            style={{ zIndex: 1050 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">Modify Search</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form fields */}
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Destination */}
              <div className="sm:col-span-2">
                <FieldLabel>Destination</FieldLabel>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                  <LocationAutocomplete
                    variant="bar"
                    value={searchParams.location}
                    onChange={(value, locationId) =>
                      setSearchParams({ location: value, ...(locationId ? { locationId } : {}) })
                    }
                    placeholder="City or hotel"
                  />
                </div>
              </div>

              {/* Check-in + Check-out — trigger pair with floating picker */}
              <div className="sm:col-span-2">
                <FieldLabel>Dates</FieldLabel>
                <div className="flex flex-col sm:flex-row rounded-lg border border-slate-200 bg-white overflow-visible">
                  <HotelRangePickerTriggers
                    checkIn={checkIn}
                    checkOut={checkOut}
                    onCheckInChange={(date) => {
                      setSearchParams({ checkIn: date });
                      if (date && checkOut && date >= checkOut) {
                        const next = new Date(date);
                        next.setDate(next.getDate() + 1);
                        setSearchParams({ checkOut: next });
                      }
                    }}
                    onCheckOutChange={(date) => setSearchParams({ checkOut: date })}
                    minDate={new Date()}
                    checkInLabel="Check In"
                    checkOutLabel="Check Out"
                  />
                </div>
              </div>

              {/* Guests & Rooms */}
              <div className="sm:col-span-2">
                <FieldLabel>Guests & Rooms</FieldLabel>
                <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                  <GuestsRoomsSelector
                    variant="bar"
                    rooms={searchParams.rooms}
                    adults={searchParams.adults}
                    children={searchParams.children}
                    childrenAges={searchParams.childrenAges}
                    roomGuests={searchParams.roomGuests}
                    onRoomsChange={(rooms) => setSearchParams({ rooms })}
                    onAdultsChange={(adults) => setSearchParams({ adults })}
                    onChildrenChange={(children) => setSearchParams({ children })}
                    onChildrenAgesChange={(childrenAges) => setSearchParams({ childrenAges })}
                    onRoomGuestsChange={(roomGuests) => setSearchParams({ roomGuests })}
                  />
                </div>
              </div>
            </div>

            {/* Search button */}
            <div className="px-5 pb-5">
              <button
                onClick={handleSearch}
                className="w-full py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                style={{ background: '#d06549' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#b8543a')}
                onMouseLeave={e => (e.currentTarget.style.background = '#d06549')}
              >
                <Search className="h-4 w-4" />
                Search Hotels
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
