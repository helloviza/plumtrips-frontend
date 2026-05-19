import { useState, useRef, useEffect } from 'react';
import { Users, Plus, Minus, Info } from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

const MAX_ADULTS_PER_ROOM = 2;
const MAX_ROOMS = 8;
const MAX_ADULTS = 16;
const MAX_CHILDREN = 6;

interface GuestsRoomsSelectorProps {
  rooms: number;
  adults: number;
  children: number;
  childrenAges: number[];
  onRoomsChange: (rooms: number) => void;
  onAdultsChange: (adults: number) => void;
  onChildrenChange: (children: number) => void;
  onChildrenAgesChange: (ages: number[]) => void;
  error?: string;
  variant?: 'default' | 'bar';
}

export default function GuestsRoomsSelector({
  rooms,
  adults,
  children,
  childrenAges,
  onRoomsChange,
  onAdultsChange,
  onChildrenChange,
  onChildrenAgesChange,
  error,
  variant = 'default',
}: GuestsRoomsSelectorProps) {
  const isBar = variant === 'bar';
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Minimum rooms needed to fit current adults (2 adults per room)
  const minRoomsForAdults = Math.ceil(adults / MAX_ADULTS_PER_ROOM);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // When adults increase, auto-bump rooms if needed
  const handleAdultsChange = (newAdults: number) => {
    onAdultsChange(newAdults);
    const requiredRooms = Math.ceil(newAdults / MAX_ADULTS_PER_ROOM);
    if (requiredRooms > rooms) {
      onRoomsChange(requiredRooms);
    }
  };

  // When rooms decrease, cap adults to rooms × MAX_ADULTS_PER_ROOM
  const handleRoomsChange = (newRooms: number) => {
    onRoomsChange(newRooms);
    const maxAdults = newRooms * MAX_ADULTS_PER_ROOM;
    if (adults > maxAdults) {
      onAdultsChange(maxAdults);
    }
  };

  const handleChildrenChange = (newChildren: number) => {
    onChildrenChange(newChildren);
    if (newChildren > children) {
      const newAges = [...childrenAges];
      for (let i = childrenAges.length; i < newChildren; i++) {
        newAges.push(5);
      }
      onChildrenAgesChange(newAges);
    } else {
      onChildrenAgesChange(childrenAges.slice(0, newChildren));
    }
  };

  const handleChildAgeChange = (index: number, age: number) => {
    const newAges = [...childrenAges];
    newAges[index] = age;
    onChildrenAgesChange(newAges);
  };

  const totalGuests = adults + children;
  const maxAdultsAllowed = rooms * MAX_ADULTS_PER_ROOM;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between text-left transition-colors',
          isBar ? 'border-0 bg-transparent py-0 px-0' : 'rounded-lg border border-gray-300 bg-white px-4 py-3',
          isBar ? '' : 'focus:border-[#003580] focus:outline-none focus:ring-2 focus:ring-[#003580]/15',
          { 'border-red-500': error && !isBar }
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {!isBar && <Users className="h-5 w-5 shrink-0 text-gray-400" />}
          <div className="min-w-0">
            {isBar ? (
              <div className="truncate text-base font-semibold text-[#003580]">
                {rooms} Room{rooms !== 1 ? 's' : ''}, {totalGuests} Guest{totalGuests !== 1 ? 's' : ''}
              </div>
            ) : (
              <>
                <div className="text-sm font-medium text-gray-900">
                  {totalGuests} Guest{totalGuests !== 1 ? 's' : ''}, {rooms} Room{rooms !== 1 ? 's' : ''}
                </div>
                <div className="text-xs text-gray-500">
                  {adults} Adult{adults !== 1 ? 's' : ''}
                  {children > 0 && `, ${children} Child${children !== 1 ? 'ren' : ''}`}
                </div>
              </>
            )}
          </div>
        </div>
      </button>

      {error && (
        <p className={cn('text-red-500', isBar ? 'mt-1 text-xs' : 'mt-1.5 text-sm')}>{error}</p>
      )}

      {isOpen && (
        <div className="absolute left-0 z-[100] mt-2 w-full max-w-[calc(100vw-2rem)] rounded-lg border border-gray-200 bg-white p-4 shadow-xl sm:max-w-none sm:w-96">

          {/* Occupancy rule hint */}
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-700">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Max {MAX_ADULTS_PER_ROOM} adults per room. Extra adults automatically add a room.</span>
          </div>

          {/* Rooms */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <div className="text-sm font-medium text-gray-900">Rooms</div>
              <div className="text-xs text-gray-500">Up to {MAX_ADULTS_PER_ROOM} adults each</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleRoomsChange(Math.max(minRoomsForAdults, rooms - 1))}
                disabled={rooms <= minRoomsForAdults}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{rooms}</span>
              <button
                type="button"
                onClick={() => handleRoomsChange(Math.min(MAX_ROOMS, rooms + 1))}
                disabled={rooms >= MAX_ROOMS}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Adults */}
          <div className="flex items-center justify-between border-b border-gray-100 py-4">
            <div>
              <div className="text-sm font-medium text-gray-900">Adults</div>
              <div className="text-xs text-gray-500">12+ years</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleAdultsChange(Math.max(1, adults - 1))}
                disabled={adults <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{adults}</span>
              <button
                type="button"
                onClick={() => handleAdultsChange(Math.min(MAX_ADULTS, adults + 1))}
                disabled={adults >= MAX_ADULTS}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Auto-room indicator */}
          {adults > 2 && (
            <div className="border-b border-gray-100 py-2 text-xs text-gray-500">
              {rooms} room{rooms !== 1 ? 's' : ''} needed for {adults} adults
              &nbsp;({MAX_ADULTS_PER_ROOM} adults × {rooms} room{rooms !== 1 ? 's' : ''} = {maxAdultsAllowed} max)
            </div>
          )}

          {/* Children */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="text-sm font-medium text-gray-900">Children</div>
              <div className="text-xs text-gray-500">0–12 years</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleChildrenChange(Math.max(0, children - 1))}
                disabled={children <= 0}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{children}</span>
              <button
                type="button"
                onClick={() => handleChildrenChange(Math.min(MAX_CHILDREN, children + 1))}
                disabled={children >= MAX_CHILDREN}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Children Ages */}
          {children > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <div className="mb-3 text-sm font-medium text-gray-900">Age of Children</div>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: children }).map((_, index) => (
                  <select
                    key={index}
                    value={childrenAges[index] ?? 5}
                    onChange={(e) => handleChildAgeChange(index, parseInt(e.target.value))}
                    className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  >
                    {Array.from({ length: 13 }, (_, i) => (
                      <option key={i} value={i}>
                        {i} {i === 1 ? 'year' : 'years'}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            </div>
          )}

          {/* Done */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <Button type="button" onClick={() => setIsOpen(false)} fullWidth size="sm">
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
