import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BedDouble, Maximize2, Eye,
  CheckCircle, XCircle, Shield, Plus, Minus, Loader2, AlertTriangle,
  UtensilsCrossed, Sparkles, Star, MapPin, 
  Dumbbell, Wind, ConciergeBell, MessageCircle, Navigation, ChevronRight, Images, Info, Map, X
} from 'lucide-react';
import { useHotelStore } from '../../stores/hotelStore';
import { useHotelRooms } from '../../hooks/useHotelApi';
import type { Room } from '../../stores/hotelStore';
import Button from '../../components/ui/Button';
import { formatCurrency, calculateNights } from '../../lib/utils';
import toast from 'react-hot-toast';
import HotelBookingShell from '../../components/hotels/HotelBookingShell';

export default function RoomSelection() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { searchParams, selectedRooms, addRoom, removeRoom, updateRoomQuantity, selectedHotel, searchResultsMap, clearRooms } = useHotelStore();
  const { rooms, loading, error, loadRoomsFromResult } = useHotelRooms();

  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [showMoreAbout, setShowMoreAbout] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [expandedRoom, setExpandedRoom] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  const nights = calculateNights(searchParams.checkIn, searchParams.checkOut) || 1;

  useEffect(() => {
    if (!id) { navigate('/hotels/results'); return; }
    const rawResult = searchResultsMap[id];
    if (rawResult) {
      clearRooms();
      loadRoomsFromResult(rawResult);
    } else {
      navigate('/hotels/results');
    }
  }, [id, searchResultsMap, clearRooms, loadRoomsFromResult, navigate]);

  const hotel = selectedHotel;

  if (!hotel) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4]">
      <h2 className="text-xl font-bold">Hotel not found</h2>
    </div>
  );

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f7f4]">
      <Loader2 className="h-10 w-10 animate-spin text-[#003580]" />
    </div>
  );

  if (error) return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-[#f8f7f4]">
      <div className="text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-orange-400" />
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );

  const lowestRoomTotal = rooms.reduce((min, room) => room.price < min ? room.price : min, Infinity);

  const scrollToRooms = () => {
    document.getElementById('rooms-list')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getSelectedRoom = (roomId: string) => selectedRooms.find(r => r.id === roomId);
  const totalRoomsSelected = selectedRooms.reduce((sum, r) => sum + r.quantity, 0);
  const totalPrice = selectedRooms.reduce((sum, r) => sum + (r.price * r.quantity), 0);

  const handleAddRoom = (room: Room) => {
    clearRooms();
    addRoom(room);
  };
  
  const cancelDateMatch = rooms[0]?.cancellationPolicy.match(/until (\d+ [a-zA-Z]+ \d+)/i);
  const cancelDateStr = cancelDateMatch ? cancelDateMatch[1] : "8 Jun 2026";

  const totalGuests = searchParams.adults + searchParams.children;

  return (
    <HotelBookingShell activeStep={1} maxWidth="7xl">
      <div className="font-sans pb-24 w-full">
        {/* Top Gallery Section */}
        <div className="mb-6 rounded-2xl overflow-hidden bg-white p-2 shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-[400px]">
            {/* Main Left Image */}
            <div className="md:col-span-2 rounded-xl overflow-hidden relative group cursor-pointer" onClick={() => setIsGalleryOpen(true)}>
              {hotel.images?.[0] ? (
                <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full bg-slate-200 flex items-center justify-center"><BedDouble className="w-16 h-16 text-slate-400"/></div>
              )}
              {/* Mobile View All Photos Overlay */}
              <div className="absolute bottom-4 right-4 md:hidden z-10">
                <div className="bg-black/60 backdrop-blur-md border border-white/20 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2 text-sm shadow-lg">
                  <Images className="w-4 h-4" /> View Photos
                </div>
              </div>
            </div>
            {/* Right Stacked Images */}
            <div className="hidden md:flex flex-col gap-2 h-full">
              <div className="flex-1 min-h-0 rounded-xl overflow-hidden relative group">
                {hotel.images?.[1] ? (
                  <img src={hotel.images[1]} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-slate-200" />
                )}
              </div>
              <div className="flex-1 min-h-0 rounded-xl overflow-hidden relative group cursor-pointer">
                {hotel.images?.[2] ? (
                  <img src={hotel.images[2]} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-slate-200" />
                )}
                {/* View All Photos Overlay */}
                <div 
                  className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity hover:bg-black/50 cursor-pointer z-10"
                  onClick={() => setIsGalleryOpen(true)}
                >
                  <div className="bg-white/20 backdrop-blur-md border border-white/40 text-white font-bold py-2 px-4 rounded-full flex items-center gap-2">
                    <Images className="w-5 h-5" /> View All Photos
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hotel Info Banner */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-0.5 text-amber-400">
                {Array.from({ length: hotel.starRating || 0 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded">{hotel.propertyType || 'Hotel'}</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{hotel.name}</h1>
            <p className="text-slate-600 flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="w-4 h-4 text-[#00477f]" />
              {hotel.location} {hotel.distance && <span className="text-slate-400 font-normal">| {hotel.distance}</span>}
              <span className="text-[#00477f] font-bold cursor-pointer hover:underline ml-2 hidden sm:inline">Show on Map</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* About the Property */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-4">About the Property</h2>
              <div 
                className={`text-slate-600 leading-relaxed text-sm [&>p]:mb-3 [&>br]:mb-2 [&>b]:font-bold [&>strong]:font-bold ${showMoreAbout ? '' : 'line-clamp-3'}`}
                dangerouslySetInnerHTML={{ 
                  __html: hotel.description || `The ${hotel.name} stands as a beacon of luxury and sustainability, located at the heart of the vibrant cityscape. Its commitment to eco-friendly practices is seamlessly integrated with its opulent design, making it an architectural gem. Noteworthy for its award-winning services, sweeping views, and world-class dining options, ensuring an unforgettable stay.`
                }}
              />
              <button 
                onClick={() => setShowMoreAbout(!showMoreAbout)}
                className="text-[#00477f] font-bold text-sm mt-3 flex items-center hover:underline"
              >
                {showMoreAbout ? 'Show less' : 'Show more'} <ChevronRight className={`w-4 h-4 ml-0.5 transition-transform ${showMoreAbout ? '-rotate-90' : 'rotate-90'}`} />
              </button>
            </section>

            {/* Experience & Amenities */}
            <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Experience & Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
                {hotel.amenities.slice(0, showAllAmenities ? hotel.amenities.length : 8).map((am, i) => (
                  <div key={i} className="flex items-start gap-3 text-slate-700 text-sm font-medium">
                    <CheckCircle className="w-5 h-5 text-[#00477f] shrink-0" />
                    <span className="leading-tight pt-0.5">{am}</span>
                  </div>
                ))}
              </div>
              {hotel.amenities.length > 8 && (
                <button 
                  onClick={() => setShowAllAmenities(!showAllAmenities)}
                  className="text-[#00477f] font-bold text-sm mt-6 flex items-center hover:underline"
                >
                  {showAllAmenities ? 'Show Less' : `Show All ${hotel.amenities.length} Amenities`} <ChevronRight className={`w-4 h-4 ml-0.5 transition-transform ${showAllAmenities ? '-rotate-90' : 'rotate-90'}`} />
                </button>
              )}
            </section>

            {/* Choose Your Room */}
            <section id="rooms-list" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Choose Your Room</h2>
              
              <div className="flex flex-col gap-6">
                {rooms.map((room, index) => {
                  const selected = getSelectedRoom(room.id);
                  const totalStay = room.price;
                  const roomImage = room.images?.[0] || hotel.images?.[(index + 1) % (hotel.images.length || 1)];
                  
                  return (
                    <article
                      key={room.id}
                      className={`flex flex-col md:flex-row overflow-hidden rounded-2xl border transition-all duration-200 ${
                        selected
                          ? 'border-[#003580] shadow-md shadow-blue-900/10 bg-blue-50/5 ring-2 ring-[#003580]'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-md bg-white'
                      }`}
                    >
                      {/* Left Side: Room Image */}
                      <div className="w-full md:w-[280px] lg:w-[320px] shrink-0 bg-slate-100 h-64 md:h-auto relative border-b md:border-b-0 md:border-r border-slate-100">
                        {roomImage ? (
                          <img src={roomImage} alt={room.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <BedDouble className="w-12 h-12" />
                          </div>
                        )}
                        {room.size > 0 && (
                          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1.5 border border-white">
                            <Maximize2 className="w-3.5 h-3.5" /> {room.size} sq.ft
                          </div>
                        )}
                      </div>

                      {/* Right Side: Content */}
                      <div className="flex-1 p-5 md:p-6 flex flex-col relative">
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight leading-tight">{room.name}</h3>
                          <div className="flex flex-col items-end gap-1.5 shrink-0 relative z-10">
                            <span className="bg-blue-50 text-[#00477f] text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-blue-100 shadow-sm">Top Pick</span>
                            <span className="bg-rose-50 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest border border-rose-100 shadow-sm">Non-Refundable</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-slate-600 mb-5 font-medium">
                          <span className="flex items-center gap-1.5 text-[#00477f]">
                            <CheckCircle className="w-4 h-4" /> {room.mealPlanLabel || 'Room Only'}
                          </span>
                        </div>

                        {/* Cancellation Policy Boxes */}
                        <div className="space-y-2.5 mb-5 max-w-md">
                          <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-2.5 rounded-xl shadow-sm">
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span className="leading-snug">Free cancellation until {cancelDateStr} 23:59</span>
                          </div>
                          <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-100 text-rose-800 text-xs font-semibold px-3 py-2.5 rounded-xl shadow-sm">
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            <span className="leading-snug">100% cancellation charge from {cancelDateStr.replace(/\d+/, (d) => String(Number(d)+1))}</span>
                          </div>
                        </div>

                        {/* Mandatory Tax Box */}
                        {room.additionalCharges ? (
                          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-3.5 shadow-sm max-w-md">
                            <div className="flex items-start gap-2 mb-2.5">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                              <span className="text-xs font-bold text-amber-900 leading-tight">
                                Mandatory extra charges – payable directly to the hotel at check-in/check-out
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-bold text-amber-800 ml-6 bg-white px-3 py-2 rounded-lg border border-amber-100">
                              <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"/> Mandatory Tax</span>
                              <span>{room.additionalChargesCurrency || 'AED'} {room.additionalCharges}</span>
                            </div>
                          </div>
                        ) : null}

                        {/* Card Footer */}
                        <div className="mt-auto pt-5 border-t border-slate-100 flex items-end justify-between">
                          <div>
                            <div className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-1">{formatCurrency(totalStay)}</div>
                            <div className="text-xs text-slate-500 font-medium tracking-wide uppercase">Total • {nights} Night{nights !== 1 ? 's' : ''}</div>
                          </div>
                          
                          {selected ? (
                            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-8 shadow-lg shadow-emerald-900/20 flex items-center gap-2" onClick={() => removeRoom(room.id)}>
                              <CheckCircle className="w-5 h-5" />
                              Selected
                            </Button>
                          ) : (
                            <Button size="lg" className="bg-[#00477f] hover:bg-[#003580] rounded-xl font-bold px-8 shadow-lg shadow-blue-900/20" onClick={() => handleAddRoom(room)}>
                              Select Room &rarr;
                            </Button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Sticky Sidebar */}
          <div className="relative hidden lg:block">
            <div className="sticky top-24 space-y-6">
              
              {/* Sticky Booking Card */}
              <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-gradient-to-b from-blue-50/50 to-white">
                  <div className="text-xs font-bold text-slate-500 tracking-wide uppercase mb-1">Starting from</div>
                  <div className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter mb-1">
                    {formatCurrency(lowestRoomTotal)}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mb-4">per night / estimated</div>
                  <Button fullWidth size="lg" className="bg-orange-600 hover:bg-orange-700 font-bold rounded-xl text-base shadow-lg shadow-orange-600/20" onClick={scrollToRooms}>
                    View Rooms &rarr;
                  </Button>
                </div>
                
                {/* Mini Location Map inside booking card */}
                <div className="p-4 border-b border-slate-100">
                  <div className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                    <Map className="w-4 h-4 text-[#00477f]" /> Location
                  </div>
                  <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name + ' ' + hotel.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-xl overflow-hidden mb-3 relative h-32 bg-slate-100 border border-slate-200 cursor-pointer group"
                  >
                    <iframe 
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(hotel.name + ' ' + hotel.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      width="100%" 
                      height="100%" 
                      style={{ border: 0, pointerEvents: 'none' }} 
                      allowFullScreen={false} 
                      loading="lazy"
                      className="opacity-80 group-hover:opacity-100 transition"
                    ></iframe>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white p-2 rounded-full shadow-lg text-red-500 transform group-hover:scale-110 transition pointer-events-none">
                        <MapPin className="w-5 h-5 fill-red-50" />
                      </div>
                    </div>
                  </a>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {hotel.location} - {hotel.landmark}
                  </p>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hotel.name + ' ' + hotel.location)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#00477f] font-bold text-xs mt-2 flex items-center hover:underline"
                  >
                    Get Directions <Navigation className="w-3 h-3 ml-1" />
                  </a>
                </div>

                <div className="p-4 bg-slate-50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Check-in</span>
                    <span className="font-bold text-slate-900">{hotel.checkInTime || '2:00 PM'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-slate-500 font-medium">Check-out</span>
                    <span className="font-bold text-slate-900">{hotel.checkOutTime || '12:00 PM'}</span>
                  </div>
                </div>
              </div>

              {/* Need Help Banner (Sidebar version) */}
              <div className="bg-gradient-to-br from-[#00477f] to-blue-900 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg">
                <div className="absolute -top-4 -right-4 p-4 opacity-10">
                  <MessageCircle className="w-32 h-32" />
                </div>
                <h3 className="text-xl font-bold mb-2 relative z-10 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-300" /> Need help?
                </h3>
                <p className="text-blue-100 text-sm mb-5 relative z-10 leading-relaxed font-medium">
                  Our travel team is available 24/7 to assist with your booking and queries.
                </p>
                <a href="mailto:hello@plumtrips.com" className="inline-flex items-center justify-center w-full bg-white/10 hover:bg-white/20 border border-white/20 transition-colors rounded-xl py-2.5 text-white font-bold text-sm relative z-10">
                  hello@plumtrips.com
                </a>
              </div>

            </div>
          </div>
        </div>

      {/* Floating Bottom Right Support Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-14 h-14 bg-[#00477f] hover:bg-blue-800 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Checkout Sticky Bottom Bar (Only visible when rooms are selected) */}
      {totalRoomsSelected > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white p-4 shadow-[0_-12px_40px_rgba(15,23,42,0.12)] transform transition-transform animate-in slide-in-from-bottom-full">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4">
            <div>
              <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Your Selection</div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-black text-slate-900 tracking-tight leading-none">{formatCurrency(totalPrice)}</div>
                <div className="text-sm font-medium text-slate-500 mb-0.5">
                  {totalRoomsSelected} room{totalRoomsSelected !== 1 ? 's' : ''} • {nights} night{nights !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <Button
              size="lg"
              onClick={() => navigate('/hotels/guest-details')}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl px-10 shadow-lg shadow-emerald-600/20 text-lg"
            >
              Book Now
            </Button>
          </div>
        </div>
      )}
    </div>

      {/* Fullscreen Photo Gallery Modal */}
      {isGalleryOpen && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-in fade-in duration-300">
          <div className="p-4 flex justify-between items-center bg-black/50 sticky top-0 z-10 backdrop-blur-md">
            <h3 className="text-white font-bold text-lg">{hotel.name} - Photos</h3>
            <button 
              onClick={() => setIsGalleryOpen(false)}
              className="p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 sm:p-8">
            <div className="max-w-6xl mx-auto columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
              {hotel.images?.map((img, i) => (
                <div key={i} className="break-inside-avoid rounded-xl overflow-hidden bg-slate-900 border border-white/10">
                  <img src={img} alt={`${hotel.name} photo ${i + 1}`} className="w-full h-auto object-cover hover:opacity-90 transition" loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

    </HotelBookingShell>
  );
}