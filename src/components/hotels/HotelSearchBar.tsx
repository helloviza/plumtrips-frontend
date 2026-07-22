import { useState, useEffect } from 'react';
import { Search, Clock, MapPin, Users, Globe2, Calendar } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';
import { HotelRangePickerTriggers } from './HotelRangePicker';
import GuestsRoomsSelector from './GuestsRoomsSelector';
import { useHotelStore } from '../../stores/hotelStore';
import { getCountries, type TboCountry } from '../../services/hotelApi';
import NationalitySelector from './NationalitySelector';
import { calculateNights, cn } from '../../lib/utils';
import { HOTEL_NAVY, HOTEL_NAVY_HOVER, HOTEL_SEARCH_SHADOW } from './hotelTheme';

export interface HotelSearchBarProps {
  errors?: Record<string, string>;
  onSearch: () => void;
  showOptions?: boolean;
  className?: string;
  darkTheme?: boolean;
  variant?: 'default' | 'results';
}

function FieldDivider() {
  return <div className="hidden h-12 w-px shrink-0 self-center bg-gray-200 md:block" aria-hidden />;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-0.5 block text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
      {children}
    </span>
  );
}

export default function HotelSearchBar({
  errors = {},
  onSearch,
  showOptions = true,
  className = '',
  darkTheme = false,
  variant = 'default',
}: HotelSearchBarProps) {
  const { searchParams, setSearchParams } = useHotelStore();
  const nights = calculateNights(searchParams.checkIn, searchParams.checkOut);

  const checkIn =
    searchParams.checkIn instanceof Date
      ? searchParams.checkIn
      : searchParams.checkIn
        ? new Date(searchParams.checkIn)
        : null;
  const checkOut =
    searchParams.checkOut instanceof Date
      ? searchParams.checkOut
      : searchParams.checkOut
        ? new Date(searchParams.checkOut)
        : null;

  return (
    <div className={cn('relative z-30', className)}>
      <div
        className="flex flex-col md:flex-row md:items-center gap-0"
        style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: variant === 'results' ? 0 : 14,
          boxShadow: variant === 'results' ? "none" : "0 1px 6px rgba(40,60,120,0.07)",
          position: "relative",
          zIndex: 50,
          minHeight: 64,
          padding: variant === 'results' ? 0 : '10px 14px',
        }}
      >
        {/* Destination */}
        <div
          style={{ zIndex: 50, position: 'relative' }}
          className="flex items-center gap-3 flex-1 min-w-0 w-full md:w-auto pr-0 md:pr-4 pb-3 md:pb-0 border-b md:border-b-0 md:border-r border-slate-200"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
            <MapPin size={17} className="text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <FieldLabel>Destination</FieldLabel>
            <LocationAutocomplete
              variant="bar"
              value={searchParams.location}
              onChange={(value, locationId) =>
                setSearchParams({ location: value, ...(locationId ? { locationId } : {}) })
              }
              placeholder="City or hotel"
              error={errors.location}
            />
          </div>
        </div>

        {/* Check-in + Check-out — no extra wrapper/border here; each trigger carries its own icon + its own border-right (matches "like others" partitions, no doubling) */}
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
          checkInError={errors.checkIn}
          checkOutError={errors.checkOut}
          checkInIcon={<Calendar size={17} className="text-orange-500" />}
          checkOutIcon={<Calendar size={17} className="text-orange-500" />}
        />

        {/* Guests */}
        <div
          style={{ zIndex: 20, position: 'relative' }}
          className="flex items-center gap-3 flex-1 min-w-0 w-full md:w-auto py-3 md:py-0 md:px-5 border-b md:border-b-0 md:border-r border-slate-200"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
            <Users size={17} className="text-purple-600" />
          </div>
          <div className="min-w-0 flex-1">
            <FieldLabel>Guest</FieldLabel>
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
              error={errors.guests}
            />
          </div>
        </div>

        {/* Nationality */}
        <div
          style={{ zIndex: 10, position: 'relative' }}
          className="flex items-center gap-3 flex-1 min-w-0 w-full md:w-auto py-3 md:py-0 md:px-5"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Globe2 size={17} className="text-emerald-600" />
          </div>
          <div className="min-w-0 flex-1">
            <FieldLabel>Nationality</FieldLabel>
            <NationalitySelector
              variant="bar"
              value={searchParams.nationality || 'IN'}
              onChange={(nationality) => setSearchParams({ nationality })}
              error={errors.nationality}
            />
          </div>
        </div>

        {/* Search Button */}
        <button
          type="button"
          onClick={onSearch}
          style={{
            background: 'linear-gradient(135deg,#f97316,#ea580c)',
            color: '#fff',
            border: 'none',
            padding: '12px 24px',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: '0.01em',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(249,115,22,0.35)',
            marginTop: 12,
          }}
          className="w-full md:w-auto md:mt-0 md:ml-4 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <Search size={15} />
          Search
        </button>
      </div>
    </div>
  );
}