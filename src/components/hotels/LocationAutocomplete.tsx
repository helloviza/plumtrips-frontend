import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin, Building2, MapPinned, Loader2 } from 'lucide-react';
import { cn, debounce } from '../../lib/utils';
import { searchCities, type CityOption } from '../../hooks/useHotelApi';
import { useHotelStore } from '../../stores/hotelStore';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string, cityId?: string, countryCode?: string) => void;
  placeholder?: string;
  error?: string;
  variant?: 'default' | 'bar';
}

export default function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Enter city, area, or hotel name',
  error,
  variant = 'default',
}: LocationAutocompleteProps) {
  const isBar = variant === 'bar';
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSearchParams } = useHotelStore();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced API call
  const fetchCities = useCallback(
    debounce(async (q: string) => {
      if (!q.trim() || q.length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const cities = await searchCities(q);
        setResults(cities);
        setIsOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350),
    []
  );

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    if (inputValue.trim().length >= 2) {
      setLoading(true);
      fetchCities(inputValue);
    } else {
      setResults([]);
      setIsOpen(false);
      setLoading(false);
    }
  };

  const handleSelect = (city: CityOption) => {
    onChange(city.name, city.cityCode, city.countryCode);
    // Store the cityCode (TBO Code) and countryCode in searchParams for the city-hotels + search calls
    setSearchParams({ 
      locationId: city.cityCode,
      destinationCountryCode: city.countryCode
    });
    setIsOpen(false);
    setResults([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'hotel': return <Building2 className="h-4 w-4" />;
      case 'area': return <MapPinned className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        {!isBar && (
          <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        )}
        <input
          type="text"
          value={value}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => value.length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          autoComplete="off"
          className={cn(
            'w-full transition-colors',
            isBar
              ? 'border-0 bg-transparent py-0 pl-0 pr-8 text-[15px] font-black text-[#0d2d5e] placeholder:font-normal placeholder:text-gray-400 focus:outline-none focus:ring-0'
              : 'rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-10 text-gray-900 placeholder:text-gray-400 focus:border-[#003580] focus:outline-none focus:ring-2 focus:ring-[#003580]/15',
            { 'border-red-500 focus:border-red-500 focus:ring-red-500/20': error && !isBar }
          )}
        />
        {loading && (
          <Loader2
            className={cn(
              'absolute top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-400',
              isBar ? 'right-0' : 'right-3'
            )}
          />
        )}
      </div>

      {error && (
        <p className={cn('text-red-500', isBar ? 'mt-1 text-xs' : 'mt-1.5 text-sm')}>{error}</p>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute left-0 right-0 z-[100] mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-xl">
          <div className="max-h-72 overflow-y-auto">
            {results.map(city => (
              <button
                key={city.id}
                type="button"
                onClick={() => handleSelect(city)}
                className="flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50 last:border-b-0"
              >
                <div className="text-gray-400">{getIcon(city.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium text-gray-900">{city.name}</div>
                  <div className="text-xs text-gray-500">
                    {city.countryCode && city.countryCode !== '—'
                      ? `City · ${city.countryCode}`
                      : 'City'}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && !loading && results.length === 0 && value.trim().length >= 2 && (
        <div className="absolute left-0 right-0 z-[100] mt-1 w-full rounded-lg border border-gray-200 bg-white p-4 shadow-xl">
          <p className="text-sm text-gray-500">No cities found for "{value}"</p>
        </div>
      )}
    </div>
  );
}

