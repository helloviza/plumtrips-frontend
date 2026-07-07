import React, { useState } from 'react';
import { 
  MapPin, Star, Wifi, Dumbbell, Coffee, Car, 
  Waves, Wind, Utensils, GlassWater, Shield,
  Clock, CreditCard, Info, CheckCircle, X
} from 'lucide-react';
import type { Hotel } from '../../stores/hotelStore';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Free WiFi': <Wifi className="h-4 w-4" />,
  'Gym': <Dumbbell className="h-4 w-4" />,
  'Breakfast': <Coffee className="h-4 w-4" />,
  'Parking': <Car className="h-4 w-4" />,
  'Pool': <Waves className="h-4 w-4" />,
  'Air Conditioning': <Wind className="h-4 w-4" />,
  'Restaurant': <Utensils className="h-4 w-4" />,
  'Bar': <GlassWater className="h-4 w-4" />,
};

export default function HotelDetails({ hotel }: { hotel: Hotel }) {
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Safe defaults
  const images = hotel.images?.length > 0 ? hotel.images : [];
  const displayRating = hotel.reviewCount > 0 ? hotel.rating : hotel.starRating;

  return (
    <div className="mb-10 space-y-8">
      {/* 1. Header Section */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex gap-0.5">
            {Array.from({ length: hotel.starRating || 1 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
            {hotel.propertyType || 'Hotel'}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">{hotel.name}</h1>
        <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm font-medium text-slate-600">
          <MapPin className="h-4 w-4 text-slate-400" />
          {hotel.location}
          {hotel.landmark && <span className="text-slate-400 mx-1">•</span>}
          {hotel.landmark && <span>{hotel.distance} from {hotel.landmark}</span>}
        </p>

        {/* Rating Badge */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex items-center justify-center rounded-lg bg-[#003580] px-3 py-1.5 text-white font-bold text-sm">
            {displayRating ? displayRating.toFixed(1) : '-'}
          </div>
          {hotel.reviewCount > 0 ? (
            <div className="text-sm">
              <span className="font-bold text-slate-900">Very Good</span>
              <span className="ml-1 text-slate-500">({hotel.reviewCount} reviews)</span>
            </div>
          ) : (
            <div className="text-sm font-medium text-slate-600">Star Rating</div>
          )}
        </div>
      </div>

      {/* 2. Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-[400px] md:h-[450px] rounded-2xl overflow-hidden">
        <div 
          className={`md:col-span-2 md:row-span-2 relative group ${images.length > 5 ? 'cursor-pointer' : ''}`}
          onClick={() => images.length > 5 && setShowImageModal(true)}
        >
          <img 
            src={images[0]} 
            alt="Main" 
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        </div>
        
        {images.slice(1, 5).map((img, idx) => (
          <div 
            key={idx} 
            className={`hidden md:block relative group overflow-hidden ${images.length > 5 ? 'cursor-pointer' : ''}`}
            onClick={() => images.length > 5 && setShowImageModal(true)}
          >
            <img 
              src={img} 
              alt={`Gallery ${idx + 1}`} 
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
            {idx === 3 && images.length > 5 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg backdrop-blur-sm">
                +{images.length - 5} photos
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Amenities & Description (Left Col) */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Popular Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-2">
              {(showAllAmenities ? hotel.amenities : hotel.amenities?.slice(0, 12))?.map((amenity, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                  <div className="text-[#003580]">
                    {AMENITY_ICONS[amenity] || <CheckCircle className="h-4 w-4" />}
                  </div>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
            
            {hotel.amenities?.length > 12 && (
              <button 
                onClick={() => setShowAllAmenities(!showAllAmenities)}
                className="mt-4 text-[#003580] font-bold text-sm hover:underline"
              >
                {showAllAmenities ? 'View less' : `View all ${hotel.amenities.length} amenities`}
              </button>
            )}
          </section>

          {hotel.nearbyLandmarks && hotel.nearbyLandmarks.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">What's nearby</h2>
              <ul className="space-y-3">
                {hotel.nearbyLandmarks.map((landmark, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      {landmark.name}
                    </span>
                    <span className="font-medium text-slate-900">{landmark.distance}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* 4. Policies (Right Col) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Info className="h-5 w-5 text-[#003580]" />
              Property Rules
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3 border-b border-slate-200 pb-4">
                <Clock className="h-5 w-5 shrink-0 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Check-in / Check-out</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Check-in from: {hotel.checkInTime || '14:00'}<br/>
                    Check-out before: {hotel.checkOutTime || '11:00'}
                  </p>
                </div>
              </div>

              {hotel.freeCancellation && (
                <div className="flex items-start gap-3 border-b border-slate-200 pb-4">
                  <Shield className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">Free Cancellation Available</p>
                    <p className="text-sm text-slate-600 mt-1">
                      Check specific room rates below for exact cancellation policies.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 shrink-0 text-slate-500 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Payment & ID</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {hotel.payAtHotel ? 'Pay at hotel available.' : 'Prepayment required.'}
                  </p>
                  {hotel.policies?.idProof?.length > 0 && (
                    <p className="text-xs text-slate-500 mt-1.5">
                      Accepted IDs: {hotel.policies.idProof.join(', ')}
                    </p>
                  )}
                  {hotel.policies?.localGuest && (
                    <p className="text-xs text-slate-500 mt-1">
                      Local ID: {hotel.policies.localGuest}
                    </p>
                  )}
                  {hotel.policies?.ageRestriction && (
                    <p className="text-xs text-slate-500 mt-1">
                      Age policy: {hotel.policies.ageRestriction}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm">
          <div className="relative h-full w-full max-w-6xl overflow-hidden rounded-xl bg-black">
            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/80 p-4">
              <h3 className="text-lg font-bold text-white">{hotel.name} - All Photos</h3>
              <button 
                onClick={() => setShowImageModal(false)}
                className="rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            {/* Scrollable Gallery */}
            <div className="h-full w-full overflow-y-auto p-4 pt-20 pb-10 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden group">
                    <img 
                      src={img} 
                      alt={`Photo ${idx + 1}`} 
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105" 
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
