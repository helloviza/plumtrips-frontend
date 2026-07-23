import React from 'react';
import { SummaryBenefit } from '../../molecules/SummaryBenefit';
import { Button } from '../../atoms/Button';
//import { Badge } from '@/atoms/Badge';
import { Plane, Calendar, User, ArrowRight } from 'lucide-react';
import type { SearchForm } from '../../../lib/types_t';

interface SearchSummaryProps {
  form: SearchForm;
  onEdit: () => void;
}

function formatDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function SearchSummary({ form, onEdit }: SearchSummaryProps) {
  const totalPax = form.adults + form.children + form.infants;
  const paxLabel = totalPax === 1 ? '1 Adult' : `${totalPax} Travellers`;

  return (
    <div className="w-72 shrink-0 flex flex-col gap-4 sticky top-[280px]">
      
      {/* Summary Card */}
      <div className="rounded-xl p-5 flex flex-col gap-4" style={{ background: 'rgba(255,255,255,0.28)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.5)', boxShadow: '0 8px 32px rgba(40,60,120,0.10), inset 0 1px 0 rgba(255,255,255,0.6)' }}>
        {/* <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">Your Search Summary</h3>
          <button onClick={onEdit} className="text-xs font-semibold text-orange-600 hover:underline">Edit</button>
        </div> */}
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-slate-700 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
            <Plane size={16} className="text-slate-400" />
            <span className="font-bold text-slate-900">{form.from?.code}</span>
            <ArrowRight size={14} className="text-slate-400" />
            <span className="font-bold text-slate-900">{form.to?.code}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600 px-1">
            <span className="flex items-center gap-1.5"><Calendar size={14} className="text-slate-400"/> {formatDate(form.departDate)}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600 px-1">
            <span className="flex items-center gap-1.5"><User size={14} className="text-slate-400"/> {paxLabel}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{form.cabinClass}</span>
          </div>
        </div>

        <div className="h-px w-full bg-slate-100 my-1" />

        <div className="flex flex-col gap-4">
          <SummaryBenefit 
            icon="Ban" 
            title="Free Cancellation" 
            description="on selected fares" 
          />
          <SummaryBenefit 
            icon="Headset" 
            title="24/7 Customer Support" 
            description="Always here for you" 
          />
          <SummaryBenefit 
            icon="Lock" 
            title="Secure Payment" 
            description="100% safe & encrypted" 
          />
          <SummaryBenefit 
            icon="Leaf" 
            title="Choose greener journeys" 
            description="Lower carbon flights available on this route." 
          />
        </div>
      </div>

      {/* AI Promo Card */}
      <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 rounded-xl shadow-sm border border-indigo-800 p-5 flex flex-col gap-4 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 opacity-20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
        
        <div className="w-12 h-12 bg-indigo-800 rounded-full flex items-center justify-center border-2 border-indigo-600/50 shadow-inner">
          <img src="/pluto-mascot.png" alt="Pluto AI" className="w-full h-full object-cover scale-110" style={{ filter: 'drop-shadow(0 0 6px rgba(96,165,250,0.7))' }} />
                  
        </div>
        
        <div>
          <h3 className="font-bold text-white text-lg leading-tight mb-2">Let Pluto plan the perfect trip for you</h3>
          <ul className="flex flex-col gap-1.5">
            <li className="flex items-center gap-2 text-xs text-indigo-200">
              <span className="w-1 h-1 rounded-full bg-indigo-400" /> Best time to book
            </li>
            <li className="flex items-center gap-2 text-xs text-indigo-200">
              <span className="w-1 h-1 rounded-full bg-indigo-400" /> Price drop alerts
            </li>
            <li className="flex items-center gap-2 text-xs text-indigo-200">
              <span className="w-1 h-1 rounded-full bg-indigo-400" /> Personalized recommendations
            </li>
          </ul>
        </div>
        
        <Button variant="primary" className="w-full bg-indigo-600 hover:bg-indigo-500 border-indigo-500 mt-2 text-white">
          🚀 Try AI Trip Planner →
        </Button>
      </div>

    </div>
  );
}