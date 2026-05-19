import { Search, Clock } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';
import DatePicker from './DatePicker';
import GuestsRoomsSelector from './GuestsRoomsSelector';
import { useHotelStore } from '../../stores/hotelStore';
import { calculateNights, cn } from '../../lib/utils';
import { HOTEL_NAVY, HOTEL_NAVY_HOVER, HOTEL_SEARCH_SHADOW } from './hotelTheme';

export interface HotelSearchBarProps {
  errors?: Record<string, string>;
  onSearch: () => void;
  showOptions?: boolean;
  className?: string;
}

function FieldDivider() {
  return <div className="hidden h-12 w-px shrink-0 self-center bg-gray-200 md:block" aria-hidden />;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-gray-500">
      {children}
    </span>
  );
}

export default function HotelSearchBar({
  errors = {},
  onSearch,
  showOptions = true,
  className = '',
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
        className="overflow-visible rounded-xl border border-gray-100 bg-white md:flex md:items-stretch"
        style={{ boxShadow: HOTEL_SEARCH_SHADOW }}
      >
        {/* Destination */}
        <div className="min-w-0 flex-[1.4] border-b border-gray-100 px-4 py-3.5 md:border-b-0 md:border-r md:px-5 md:py-4">
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

        <FieldDivider />

        {/* Check-in */}
        <div className="min-w-0 flex-1 border-b border-gray-100 px-4 py-3.5 md:border-b-0 md:border-r md:px-4 md:py-4">
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

        <FieldDivider />

        {/* Check-out */}
        <div className="min-w-0 flex-1 border-b border-gray-100 px-4 py-3.5 md:border-b-0 md:border-r md:px-4 md:py-4">
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

        <FieldDivider />

        {/* Guests */}
        <div className="min-w-0 flex-1 border-b border-gray-100 px-4 py-3.5 md:border-b-0 md:border-r md:px-4 md:py-4">
          <FieldLabel>Guest</FieldLabel>
          <GuestsRoomsSelector
            variant="bar"
            rooms={searchParams.rooms}
            adults={searchParams.adults}
            children={searchParams.children}
            childrenAges={searchParams.childrenAges}
            onRoomsChange={(rooms) => setSearchParams({ rooms })}
            onAdultsChange={(adults) => setSearchParams({ adults })}
            onChildrenChange={(children) => setSearchParams({ children })}
            onChildrenAgesChange={(childrenAges) => setSearchParams({ childrenAges })}
            error={errors.guests}
          />
        </div>

        {/* Search CTA */}
        <div className="flex shrink-0 md:w-[140px] lg:w-[160px]">
          <button
            type="button"
            onClick={onSearch}
            className="flex h-full min-h-[52px] w-full items-center justify-center gap-2 px-6 text-base font-bold text-white transition-colors hover:opacity-95 active:scale-[0.99] md:min-h-0 md:rounded-none"
            style={{ backgroundColor: HOTEL_NAVY }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = HOTEL_NAVY_HOVER;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = HOTEL_NAVY;
            }}
          >
            <Search className="h-5 w-5 md:hidden" />
            Search
          </button>
        </div>
      </div>

      {showOptions && (
        <div className="mt-3 flex flex-wrap items-center gap-4 px-1">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={searchParams.freeCancellation}
              onChange={(e) => setSearchParams({ freeCancellation: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-[#003580] focus:ring-[#003580]"
            />
            Free cancellation only
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={searchParams.hourlyStay}
              onChange={(e) => setSearchParams({ hourlyStay: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-[#003580] focus:ring-[#003580]"
            />
            <Clock className="h-3.5 w-3.5" /> Hourly stay
          </label>
          {searchParams.hourlyStay && (
            <select
              value={searchParams.hourlyDuration || 3}
              onChange={(e) =>
                setSearchParams({ hourlyDuration: parseInt(e.target.value, 10) as 3 | 6 | 12 })
              }
              className="rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm shadow-sm"
            >
              <option value={3}>3 hrs</option>
              <option value={6}>6 hrs</option>
              <option value={12}>12 hrs</option>
            </select>
          )}
        </div>
      )}
    </div>
  );
}
