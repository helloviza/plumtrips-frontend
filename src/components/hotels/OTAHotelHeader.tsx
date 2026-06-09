import { useNavigate } from 'react-router-dom';
import { Calendar, Users, Share2, User, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';

interface OTAHotelHeaderProps {
  location: string;
  checkIn: string;
  checkOut: string;
  roomsCount: number;
  guestsCount: number;
  onBack?: () => void;
}

export default function OTAHotelHeader({
  location,
  checkIn,
  checkOut,
  roomsCount,
  guestsCount,
  onBack
}: OTAHotelHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  const formattedDates = checkIn && checkOut 
    ? `${format(new Date(checkIn), 'dd MMM')} - ${format(new Date(checkOut), 'dd MMM yyyy')}`
    : 'Select Dates';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Logo & Back */}
        <div className="flex items-center gap-4 shrink-0">
          <button 
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            {/* Plumtrips Logo Text */}
            <span className="text-xl font-black text-slate-900 tracking-tighter">
              Plum<span className="text-[#00477f]">trips</span>
            </span>
          </div>
        </div>

        {/* Center: Search Summary Pill */}
        <div className="hidden md:flex flex-1 max-w-2xl justify-center">
          <div className="flex items-center divide-x divide-slate-200 bg-slate-50 border border-slate-200 rounded-full shadow-sm text-sm font-medium text-slate-700 py-1.5 px-3">
            <div className="px-4 flex items-center gap-2 hover:bg-slate-100 rounded-l-full cursor-pointer transition-colors h-8">
              <span className="font-bold text-slate-900 truncate max-w-[150px]">{location || 'Anywhere'}</span>
            </div>
            <div className="px-4 flex items-center gap-2 hover:bg-slate-100 cursor-pointer transition-colors h-8">
              <Calendar className="w-4 h-4 text-[#00477f]" />
              <span className="whitespace-nowrap">{formattedDates}</span>
            </div>
            <div className="px-4 flex items-center gap-2 hover:bg-slate-100 rounded-r-full cursor-pointer transition-colors h-8">
              <Users className="w-4 h-4 text-[#00477f]" />
              <span className="whitespace-nowrap">{roomsCount} Room{roomsCount !== 1 ? 's' : ''}, {guestsCount} Guest{guestsCount !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors">
            <Share2 className="w-4 h-4 text-[#00477f]" />
            <span className="hidden sm:inline">Share</span>
          </button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors border border-slate-200">
            <div className="w-6 h-6 rounded-full bg-[#00477f] flex items-center justify-center text-white">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="hidden sm:inline">Account</span>
          </button>
        </div>

      </div>
    </header>
  );
}
