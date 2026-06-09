import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { useHotelStore } from '../../stores/hotelStore';

const SORT_OPTIONS = [
  { value: 'distance', label: 'Sort by distance' },
  { value: 'cheapest', label: 'Sort by price' },
  { value: 'rating', label: 'Sort by star rating' },
  { value: 'reviews', label: 'Sort by user rating' },
] as const;

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

  const handleOptionClick = (value: typeof sortBy) => {
    if (sortBy === value) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(value);
      setSortDirection((value === 'rating' || value === 'reviews') ? 'desc' : 'asc');
    }
    setIsOpen(false);
  };

  const currentOption = SORT_OPTIONS.find(o => o.value === sortBy);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 py-2 pl-4 pr-3 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors focus:border-[#003580] focus:ring-1 focus:ring-[#003580] outline-none cursor-pointer min-w-[200px] justify-between"
      >
        <span className="flex items-center gap-1">
          {currentOption?.label}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-[220px] rounded-lg bg-white py-1 shadow-lg border border-gray-100 right-0">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleOptionClick(option.value)}
              className={`flex w-full items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                sortBy === option.value ? 'bg-[#dff0ff] text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{option.label}</span>
              {sortBy === option.value && (
                sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 text-gray-600" /> : <ArrowDown className="h-4 w-4 text-gray-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
