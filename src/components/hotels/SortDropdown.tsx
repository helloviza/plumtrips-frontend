import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useHotelStore } from '../../stores/hotelStore';

type SortValue = 'cheapest' | 'rating' | 'reviews';

interface SortOption {
  value: SortValue;
  label: string;
  asc: string;   // what "asc" means for this field
  desc: string;  // what "desc" means for this field
}

const SORT_OPTIONS: SortOption[] = [
  {
    value: 'cheapest',
    label: 'Price',
    asc:  'Lowest to highest',
    desc: 'Highest to lowest',
  },
  {
    value: 'rating',
    label: 'Star rating',
    asc:  'Lowest to highest',
    desc: 'Highest to lowest',
  },
  {
    value: 'reviews',
    label: 'User rating',
    asc:  'Lowest to highest',
    desc: 'Highest to lowest',
  },
];

export default function SortDropdown() {
  const { sortBy, setSortBy, sortDirection, setSortDirection } = useHotelStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (value: SortValue) => {
    if (sortBy === value) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(value);
      setSortDirection(value === 'rating' || value === 'reviews' ? 'desc' : 'asc');
    }
    setIsOpen(false);
  };

  const current = SORT_OPTIONS.find(o => o.value === sortBy);
  const dirLabel = current
    ? (sortDirection === 'asc' ? current.asc : current.desc)
    : '';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 py-2 pl-4 pr-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors focus:border-[#003580] focus:ring-1 focus:ring-[#003580] outline-none cursor-pointer min-w-[220px] justify-between"
      >
        <span>
          {current ? (
            <>
              <span className="text-gray-900">{current.label}</span>
              <span className="text-gray-400 font-normal"> · {dirLabel}</span>
            </>
          ) : 'Sort by'}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-[260px] rounded-lg bg-white py-1 shadow-lg border border-gray-100 right-0">
          {SORT_OPTIONS.map((option) => {
            const isActive = sortBy === option.value;
            // Which direction is currently applied (or default) for this option
            const activeDir = isActive ? sortDirection : (option.value === 'rating' || option.value === 'reviews' ? 'desc' : 'asc');
            const activeLabel = activeDir === 'asc' ? option.asc : option.desc;

            return (
              <button
                key={option.value}
                onClick={() => handleOptionClick(option.value)}
                className={`flex w-full items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                  isActive ? 'bg-[#dff0ff] text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{activeLabel}</div>
                </div>
                {isActive && (
                  sortDirection === 'asc'
                    ? <ArrowUp className="h-4 w-4 text-gray-500 shrink-0" />
                    : <ArrowDown className="h-4 w-4 text-gray-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
