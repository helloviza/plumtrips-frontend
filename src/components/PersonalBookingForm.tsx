import React from "react";
import { Button } from "./ui_d/button";
import { Input } from "./ui_d/input";
import { Textarea } from "./ui_d/textarea";

interface PersonalBookingFormProps {
  title?: string;
  fields?: React.ReactNode;
}

export function PersonalBookingForm({ 
  title = "Start your journey", 
  fields 
}: PersonalBookingFormProps) {
  return (
    <div className="w-full max-w-[340px] ml-auto">
      <div className="bg-black/20 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl">
        <h3 className="text-2xl font-serif text-white mb-6 font-semibold drop-shadow-md">
          {title}
        </h3>
        
        <form className="space-y-4">
          {fields ? fields : (
            <>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/80 uppercase tracking-wider drop-shadow-sm">Name</label>
                <Input placeholder="John Doe" className="bg-transparent border-white/40 text-white placeholder:text-white/50 h-10 backdrop-blur-sm focus:border-white focus:ring-white" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/80 uppercase tracking-wider drop-shadow-sm">Email</label>
                <Input placeholder="john@example.com" className="bg-transparent border-white/40 text-white placeholder:text-white/50 h-10 backdrop-blur-sm focus:border-white focus:ring-white" type="email" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-white/80 uppercase tracking-wider drop-shadow-sm">Guests</label>
                  <Input placeholder="E.g. 2" className="bg-transparent border-white/40 text-white placeholder:text-white/50 h-10 backdrop-blur-sm focus:border-white focus:ring-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-white/80 uppercase tracking-wider drop-shadow-sm">Date</label>
                  <Input placeholder="mm/yyyy" className="bg-transparent border-white/40 text-white placeholder:text-white/50 h-10 backdrop-blur-sm focus:border-white focus:ring-white" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-white/80 uppercase tracking-wider drop-shadow-sm">Note</label>
                <Textarea placeholder="Optional message" className="bg-transparent border-white/40 text-white placeholder:text-white/50 resize-none h-16 backdrop-blur-sm focus:border-white focus:ring-white" />
              </div>
            </>
          )}

          <Button type="submit" className="w-full bg-[#e35d29] hover:bg-[#c94e1e] text-white rounded-full h-11 text-base font-semibold shadow-lg mt-2">
            Get a proposal
          </Button>
        </form>
      </div>
    </div>
  );
}
