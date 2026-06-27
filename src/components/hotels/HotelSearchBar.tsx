import { useState, useEffect } from 'react';
import { Search, Clock } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';
import DatePicker from './DatePicker';
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
    <span className="mb-1 block text-[10px] font-bold text-[#8fafd4] uppercase tracking-widest">
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
        className="md:flex md:items-stretch"
        style={{
          display: "flex",
          background: "#fff",
          borderRadius: variant === 'results' ? 0 : 14,
          boxShadow: variant === 'results' ? "none" : "0 8px 30px rgba(0,0,0,0.12)",
          position: "relative",
          zIndex: 50,
          minHeight: 64
        }}
      >
        {/* Destination */}
        <div style={{ zIndex: 50, flexShrink: 0, minWidth: 240, maxWidth: 320, minHeight: 64, position: 'relative', borderRight: '1px solid #e2ecf7', padding: '10px 14px' }} className="border-b md:border-b-0">
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

        {/* Check-in */}
        <div style={{ zIndex: 40, flexShrink: 0, minWidth: 150, maxWidth: 180, minHeight: 64, position: 'relative', borderRight: '1px solid #e2ecf7', padding: '10px 14px' }} className="border-b md:border-b-0">
          <FieldLabel>Check In</FieldLabel>
          <DatePicker
            variant="bar"
            popoverAlign="start"
            selected={checkIn}
            onSelect={(date) => {
              setSearchParams({ checkIn: date });
              if (date && checkOut && date >= checkOut) {
                const next = new Date(date);
                next.setDate(next.getDate() + 1);
                setSearchParams({ checkOut: next });
              }
            }}
            placeholder="Add date"
            error={errors.checkIn}
          />
        </div>

        {/* Check-out */}
        <div style={{ zIndex: 30, flexShrink: 0, minWidth: 150, maxWidth: 180, minHeight: 64, position: 'relative', borderRight: '1px solid #e2ecf7', padding: '10px 14px' }} className="border-b md:border-b-0">
          <FieldLabel>
            Check Out
            {nights > 0 && (
              <span className="ml-1.5 normal-case font-normal text-[#003580]">
                · {nights} night{nights !== 1 ? 's' : ''}
              </span>
            )}
          </FieldLabel>
          <DatePicker
            variant="bar"
            popoverAlign="end"
            selected={checkOut}
            onSelect={(date) => setSearchParams({ checkOut: date })}
            placeholder="Add date"
            minDate={
              checkIn
                ? new Date(checkIn.getTime() + 86400000)
                : new Date()
            }
            error={errors.checkOut}
          />
        </div>

        {/* Guests */}
        <div style={{ zIndex: 20, flexShrink: 0, minWidth: 200, maxWidth: 280, minHeight: 64, position: 'relative', borderRight: '1px solid #e2ecf7', padding: '10px 14px' }} className="border-b md:border-b-0">
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

        {/* Nationality */}
        <div style={{ zIndex: 10, flexShrink: 0, minWidth: 150, maxWidth: 200, minHeight: 64, position: 'relative', borderRight: '1px solid #e2ecf7', padding: '10px 14px' }} className="border-b md:border-b-0">
          <FieldLabel>Nationality</FieldLabel>
          <NationalitySelector
            variant="bar"
            value={searchParams.nationality || 'IN'}
            onChange={(nationality) => setSearchParams({ nationality })}
            error={errors.nationality}
          />
        </div>

        <div style={{ flex: 1 }} className="hidden md:block" />

        {/* Search Button */}
        <button
          type="button"
          onClick={onSearch}
          style={{
            background: '#d06549', color: '#fff', border: 'none',
            padding: '0 26px', cursor: 'pointer',
            fontWeight: 800, fontSize: 13, letterSpacing: '0.04em',
            transition: 'background .2s', flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: 8,
            borderRadius: variant === 'results' ? 0 : '0 14px 14px 0',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#b8543a'}
          onMouseLeave={e => e.currentTarget.style.background = '#d06549'}
        >
          <Search className="h-4 w-4 md:hidden" />
          Search
        </button>
      </div>

    </div>
  );
}
