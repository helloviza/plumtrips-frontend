import { useCurrency } from '../../hooks/useCurrency';
import { Star, MapPin, Shield, Wifi, Coffee, Dumbbell, UtensilsCrossed } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Hotel } from '../../stores/hotelStore';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { } from '../../lib/utils';
import { cn } from '../../lib/utils';

interface HotelCardProps {
  hotel: Hotel;
  nights?: number;
}

export default function HotelCard({ hotel, nights = 1 }: HotelCardProps) {
  const { formatCurrency, symbol } = useCurrency();
  const navigate = useNavigate();

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi')) return <Wifi className="h-4 w-4" />;
    if (lower.includes('gym')) return <Dumbbell className="h-4 w-4" />;
    if (lower.includes('restaurant') || lower.includes('breakfast'))
      return <UtensilsCrossed className="h-4 w-4" />;
    if (lower.includes('coffee')) return <Coffee className="h-4 w-4" />;
    return null;
  };

  const totalPrice = hotel.price * nights;
  const totalOriginalPrice = hotel.originalPrice ? hotel.originalPrice * nights : null;
  const discount = totalOriginalPrice
    ? Math.round(((totalOriginalPrice - totalPrice) / totalOriginalPrice) * 100)
    : 0;

  return (
    <div className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-xl">
      <div className="flex flex-col md:flex-row">
        {/* Image */}
        <div className="relative h-48 w-full md:h-auto md:w-72">
          <img
            src={hotel.images[0]}
            alt={hotel.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          
          {/* Badges on Image */}
          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {hotel.ixigoAssured && (
              <Badge variant="success" className="bg-green-600 text-white">
                <Shield className="mr-1 h-3 w-3" />
                ixigo Assured
              </Badge>
            )}
            {discount > 0 && (
              <Badge variant="danger" className="bg-red-600 text-white">
                {discount}% OFF
              </Badge>
            )}
          </div>

          {/* Star Rating on Image */}
          <div className="absolute bottom-3 left-3">
            <div className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-semibold">
              {Array.from({ length: hotel.starRating }).map((_, i) => (
                <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 md:p-5">
          <div className="flex flex-1 flex-col">
            {/* Header */}
            <div className="mb-2">
              <h3 className="text-lg font-bold text-gray-900 md:text-xl">{hotel.name}</h3>
              <div className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{hotel.location}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">{hotel.distance} from {hotel.landmark}</span>
              </div>
            </div>

            {/* Amenities */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {hotel.amenities.slice(0, 4).map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700"
                >
                  {getAmenityIcon(amenity)}
                  <span>{amenity}</span>
                </div>
              ))}
              {hotel.amenities.length > 4 && (
                <span className="text-xs text-gray-500">+{hotel.amenities.length - 4} more</span>
              )}
            </div>

            {/* Badges */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {hotel.freeCancellation && (
                <Badge variant="success">Free Cancellation</Badge>
              )}
              {hotel.payAtHotel && (
                <Badge variant="info">Pay at Hotel</Badge>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded-lg bg-green-600 px-2 py-1 text-sm font-bold text-white">
                <Star className="h-3 w-3 fill-white" />
                {hotel.rating}
              </div>
              <span className="text-sm text-gray-600">
                ({hotel.reviewCount.toLocaleString()} reviews)
              </span>
            </div>
          </div>

          {/* Price & CTA */}
          <div className="mt-4 flex flex-col items-start justify-between gap-3 border-t border-gray-100 pt-4 md:flex-row md:items-end">
            <div>
              {totalOriginalPrice && (
                <div className="text-sm text-gray-500 line-through">
                  {formatCurrency(totalOriginalPrice)}
                </div>
              )}
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalPrice)}
                </span>
                {nights > 1 && (
                  <span className="text-sm text-gray-500">for {nights} nights</span>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {formatCurrency(hotel.price)} per night + taxes
              </div>
            </div>

            <Button
              onClick={() => navigate(`/hotels/${hotel.id}`)}
              className="w-full md:w-auto !bg-[#003580] hover:!bg-[#002255]"
            >
              View Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
