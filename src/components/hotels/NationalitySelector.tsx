import { useState, useRef, useEffect } from 'react';
import { Globe, Search, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getCountries, type TboCountry } from '../../services/hotelApi';

interface NationalitySelectorProps {
  value: string;
  onChange: (code: string) => void;
  error?: string;
  variant?: 'default' | 'bar';
  theme?: 'light' | 'dark';
}

export default function NationalitySelector({
  value,
  onChange,
  error,
  variant = 'default',
  theme = 'light',
}: NationalitySelectorProps) {
  const isBar = variant === 'bar';
  const [isOpen, setIsOpen] = useState(false);
  const [countries, setCountries] = useState<TboCountry[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    const fetchCountries = async () => {
      setLoading(true);
      try {
        const list = await getCountries();
        if (mounted) setCountries(list);
      } catch (err) {
        console.error("Failed to fetch countries", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCountries();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // If no value, fallback to "IN" locally just for display purposes
  const currentVal = value || 'IN';
  const selectedCountry = countries.find(c => c.Code === currentVal);
  const displayName = selectedCountry ? selectedCountry.Name : (currentVal === 'IN' ? 'India' : currentVal);

  const filteredCountries = countries.filter(c => 
    c.Name.toLowerCase().includes(search.toLowerCase()) || 
    c.Code.toLowerCase().includes(search.toLowerCase())
  );

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
        <div className="flex items-center gap-3 overflow-hidden">
          {!isBar && <Globe className="h-5 w-5 text-gray-400 shrink-0" />}
          <div className="truncate">
            <div className={cn(
              "truncate",
              isBar 
                ? `text-[16px] font-bold ${theme === 'dark' ? 'text-white' : 'text-[#00477f]'}` 
                : 'text-base font-medium text-gray-900'
            )}>
              {displayName}
            </div>
            {isBar && (
               <div className={cn("text-[13px] font-medium truncate", theme === 'dark' ? 'text-white/70' : 'text-[#00477f]/70')}>
                 Nationality
               </div>
            )}
          </div>
        </div>
      </button>

      {isOpen && (
        <div className={cn(
          'absolute z-[100] w-[280px] rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl',
          isBar ? 'left-0 top-full mt-2' : 'left-0 top-full mt-2'
        )}>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              autoFocus
            />
          </div>
          
          <div className="custom-scrollbar h-[240px] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex h-full items-center justify-center text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : filteredCountries.length === 0 ? (
              <div className="text-center text-sm text-gray-500 py-4">No countries found</div>
            ) : (
              <div className="space-y-0.5 pr-1">
                {filteredCountries.map((country) => (
                  <button
                    key={country.Code}
                    type="button"
                    onClick={() => {
                      onChange(country.Code);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={cn(
                      "w-full rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      currentVal === country.Code 
                        ? "bg-[#003580] text-white font-medium" 
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {country.Name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
