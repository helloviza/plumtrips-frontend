import { useState, useRef, useEffect } from 'react';
import { Users, Plus, Minus, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';

const MAX_ADULTS_PER_ROOM = 4;
const MAX_CHILDREN_PER_ROOM = 4;
const MAX_ROOMS = 8;

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

interface RoomConfig {
  adults: number;
  children: number;
  childrenAges: number[];
}

// Distribute totals into initial per-room config on mount
function distributeGuests(
  totalRooms: number,
  totalAdults: number,
  totalChildren: number,
  totalChildrenAges: number[]
): RoomConfig[] {
  const configs = Array.from({ length: Math.max(1, totalRooms) }).map(() => ({
    adults: 1,
    children: 0,
    childrenAges: [] as number[],
  }));

  let remainingAdults = Math.max(0, totalAdults - totalRooms);
  let remainingChildren = totalChildren;
  let ageIdx = 0;

  // distribute adults evenly up to max
  let i = 0;
  while (remainingAdults > 0) {
    if (configs[i].adults < MAX_ADULTS_PER_ROOM) {
      configs[i].adults++;
      remainingAdults--;
    }
    i = (i + 1) % totalRooms;
  }

  // distribute children evenly up to max
  i = 0;
  while (remainingChildren > 0) {
    if (configs[i].children < MAX_CHILDREN_PER_ROOM) {
      configs[i].children++;
      configs[i].childrenAges.push(totalChildrenAges[ageIdx] ?? 5);
      ageIdx++;
      remainingChildren--;
    }
    i = (i + 1) % totalRooms;
  }

  return configs;
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

  const [roomConfigs, setRoomConfigs] = useState<RoomConfig[]>(() =>
    distributeGuests(rooms, adults, children, childrenAges)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Sync back to parent when roomConfigs change
  useEffect(() => {
    let newRooms = roomConfigs.length;
    let newAdults = 0;
    let newChildren = 0;
    let newAges: number[] = [];

    roomConfigs.forEach(r => {
      newAdults += r.adults;
      newChildren += r.children;
      newAges.push(...r.childrenAges);
    });

    if (newRooms !== rooms) onRoomsChange(newRooms);
    if (newAdults !== adults) onAdultsChange(newAdults);
    if (newChildren !== children) onChildrenChange(newChildren);
    if (JSON.stringify(newAges) !== JSON.stringify(childrenAges)) onChildrenAgesChange(newAges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomConfigs]);

  const addRoom = () => {
    if (roomConfigs.length >= MAX_ROOMS) return;
    setRoomConfigs([...roomConfigs, { adults: 1, children: 0, childrenAges: [] }]);
  };

  const removeRoom = (index: number) => {
    if (roomConfigs.length <= 1) return;
    setRoomConfigs(roomConfigs.filter((_, i) => i !== index));
  };

  const updateAdults = (index: number, delta: number) => {
    setRoomConfigs(prev => {
      const next = [...prev];
      const curr = next[index].adults;
      const minAdults = index === 0 ? 1 : 0;
      const newVal = Math.max(minAdults, Math.min(MAX_ADULTS_PER_ROOM, curr + delta));
      
      let newChildren = next[index].children;
      let newAges = [...next[index].childrenAges];
      if (newVal === 0 && newChildren === 0) {
        newChildren = 1;
        newAges.push(5);
      }
      
      next[index] = { ...next[index], adults: newVal, children: newChildren, childrenAges: newAges };
      return next;
    });
  };

  const updateChildren = (index: number, delta: number) => {
    setRoomConfigs(prev => {
      const next = [...prev];
      const curr = next[index].children;
      const minChildren = next[index].adults === 0 ? 1 : 0;
      const newVal = Math.max(minChildren, Math.min(MAX_CHILDREN_PER_ROOM, curr + delta));
      
      const newAges = [...next[index].childrenAges];
      if (newVal > curr) {
        newAges.push(5);
      } else if (newVal < curr) {
        newAges.pop();
      }

      next[index] = { ...next[index], children: newVal, childrenAges: newAges };
      return next;
    });
  };

  const updateAge = (roomIndex: number, childIndex: number, age: number) => {
    setRoomConfigs(prev => {
      const next = [...prev];
      const newAges = [...next[roomIndex].childrenAges];
      newAges[childIndex] = age;
      next[roomIndex] = { ...next[roomIndex], childrenAges: newAges };
      return next;
    });
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex w-full items-center justify-between transition-all',
          isBar
            ? 'h-full bg-transparent px-2 text-left'
            : 'rounded-xl border bg-white px-4 py-3 text-left shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20',
          error ? 'border-red-500' : 'border-gray-300'
        )}
      >
        <div className="flex items-center gap-3">
          {!isBar && <Users className="h-5 w-5 text-gray-400" />}
          <div>
            <div className={cn(isBar ? 'text-[16px] font-bold text-[#00477f]' : 'text-base font-medium text-gray-900')}>
              {rooms} Room{rooms !== 1 ? 's' : ''} · {adults} Adult{adults !== 1 ? 's' : ''}
            </div>
            {children > 0 && (
              <div className={cn(isBar ? 'text-[13px] font-medium text-[#00477f]/70' : 'text-sm text-gray-500')}>
                {children} Child{children !== 1 ? 'ren' : ''}
              </div>
            )}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className={cn(
          'absolute z-50 w-[340px] rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl',
          isBar ? 'left-0 top-full mt-2' : 'left-0 top-full mt-2'
        )}>
          <div className="max-h-[350px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
            {roomConfigs.map((room, idx) => (
              <div key={idx} className="border-b border-gray-100 py-4 last:border-0 first:pt-0">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-900">Room {idx + 1}</h4>
                  {roomConfigs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRoom(idx)}
                      className="text-sm font-medium text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Adults */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Adults</div>
                    <div className="text-xs text-gray-500">12+ yrs</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateAdults(idx, -1)}
                      disabled={room.adults <= (idx === 0 ? 1 : 0)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{room.adults}</span>
                    <button
                      type="button"
                      onClick={() => updateAdults(idx, 1)}
                      disabled={room.adults >= MAX_ADULTS_PER_ROOM}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Children */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">Children</div>
                    <div className="text-xs text-gray-500">2–12 yrs</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateChildren(idx, -1)}
                      disabled={room.children <= (room.adults === 0 ? 1 : 0)}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{room.children}</span>
                    <button
                      type="button"
                      onClick={() => updateChildren(idx, 1)}
                      disabled={room.children >= MAX_CHILDREN_PER_ROOM}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Children Ages */}
                {room.children > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {room.childrenAges.map((age, cIdx) => (
                      <div key={cIdx}>
                        <div className="text-xs text-gray-500 mb-1">Child {cIdx + 1} Age</div>
                        <select
                          value={age}
                          onChange={(e) => updateAge(idx, cIdx, parseInt(e.target.value))}
                          className="w-full rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        >
                          {Array.from({ length: 11 }, (_, i) => i + 2).map(i => (
                            <option key={i} value={i}>
                              {i} years
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
            {roomConfigs.length < MAX_ROOMS && (
              <button
                type="button"
                onClick={addRoom}
                className="w-full text-center text-sm font-bold text-[#003580] hover:underline"
              >
                + Add Another Room
              </button>
            )}
            <Button type="button" onClick={() => setIsOpen(false)} fullWidth size="sm">
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
