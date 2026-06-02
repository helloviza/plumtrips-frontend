import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Share2, Star, MapPin, Wifi, Dumbbell, UtensilsCrossed,
  Car, Coffee, Waves, Shield, ChevronLeft, ChevronRight, Clock,
  CheckCircle, XCircle, Users, Heart, Loader2, AlertTriangle
} from 'lucide-react';
import { useHotelStore } from '../../stores/hotelStore';
import { useHotelDetail, useHotelRooms } from '../../hooks/useHotelApi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { formatCurrency, calculateNights } from '../../lib/utils';
import toast from 'react-hot-toast';

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  'Free WiFi': <Wifi className="h-5 w-5" />,
  'Gym': <Dumbbell className="h-5 w-5" />,
  'Restaurant': <UtensilsCrossed className="h-5 w-5" />,
  'Parking': <Car className="h-5 w-5" />,
  'Coffee': <Coffee className="h-5 w-5" />,
  'Pool': <Waves className="h-5 w-5" />,
};

const MOCK_REVIEWS = [
  { id: 1, name: 'Rahul M.', type: 'Business', rating: 5, comment: 'Excellent service and great location. The room was spotless and the staff was very helpful.', date: 'Apr 2026' },
  { id: 2, name: 'Priya S.', type: 'Family', rating: 4, comment: 'Great family stay! Kids loved the pool. Breakfast was amazing. Will definitely come back.', date: 'Mar 2026' },
  { id: 3, name: 'Amit K.', type: 'Couple', rating: 5, comment: 'Perfect romantic getaway. The sea view room was breathtaking. Highly recommended!', date: 'Mar 2026' },
  { id: 4, name: 'Sneha R.', type: 'Solo', rating: 4, comment: 'Safe and comfortable for solo travel. Great location with easy access to attractions.', date: 'Feb 2026' },
];

export default function HotelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { searchParams, setSelectedHotel, searchResultsMap, selectedHotel: storeHotel, clearRooms } = useHotelStore();
  const { hotel, loading: hotelLoading, error: hotelError, fetch: fetchHotel } = useHotelDetail();
  const { rooms, loading: roomsLoading, loadRoomsFromResult } = useHotelRooms();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeReviewFilter, setActiveReviewFilter] = useState('All');
  const [isWishlisted, setIsWishlisted] = useState(false);

  const nights = calculateNights(searchParams.checkIn, searchParams.checkOut) || 1;

  useEffect(() => {
    if (!id) { navigate('/hotels/results'); return; }

    // Get the raw search result for this hotel (keyed by HotelCode)
    const rawResult = searchResultsMap[id];
    const hotelCode = rawResult?.HotelCode ?? id;

    // Find the already-normalized hotel from the store's selected hotel
    // or build it from the raw result
    const existingHotel = storeHotel?.id === id ? storeHotel : null;

    fetchHotel({ hotelCode, rawResult, existingHotel });

    // Load rooms from the raw search result
    if (rawResult) {
      loadRoomsFromResult(rawResult);
    }

    // Clear any previously selected rooms from a different hotel
    clearRooms();
  }, [id]);

  if (hotelLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-[#003580]" />
          <p className="text-gray-600">Loading hotel details…</p>
        </div>
      </div>
    );
  }

  // If no raw result in map, the user may have navigated directly — redirect to results
  if (!searchResultsMap[id ?? ''] && !hotel) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-orange-400" />
          <h2 className="mb-2 text-xl font-bold text-gray-900">Session expired</h2>
          <p className="mb-4 text-gray-500">Please search again to view hotel details.</p>
          <Button onClick={() => navigate('/hotels/results')}>Back to results</Button>
        </div>
      </div>
    );
  }

  if (hotelError || !hotel) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="max-w-md text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-orange-400" />
          <h2 className="mb-2 text-xl font-bold text-gray-900">Could not load hotel</h2>
          <p className="mb-4 text-gray-500">{hotelError ?? 'Hotel not found'}</p>
          <Button onClick={() => navigate('/hotels/results')}>Back to results</Button>
        </div>
      </div>
    );
  }

  const handleSelectRooms = () => {
    setSelectedHotel(hotel);
    if (hotel._traceId) {
      useHotelStore.getState().setTraceId(hotel._traceId);
    }
    navigate(`/hotels/${id}/rooms`);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  const filteredReviews = activeReviewFilter === 'All'
    ? MOCK_REVIEWS
    : MOCK_REVIEWS.filter(r => r.type === activeReviewFilter);

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <button
            onClick={() => navigate('/hotels/results')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Back to results</span>
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                isWishlisted ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-300 text-gray-600 hover:border-red-300'
              }`}
            >
              <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Wishlist</span>
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-full border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:border-gray-400"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Photo Gallery */}
        <div className="relative mb-6 overflow-hidden rounded-2xl">
          <div className="relative h-64 sm:h-80 md:h-96">
            <img
              src={hotel.images[currentImageIndex]}
              alt={hotel.name}
              className="h-full w-full object-cover"
            />
            {/* Navigation */}
            <button
              onClick={() => setCurrentImageIndex(i => (i - 1 + hotel.images.length) % hotel.images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentImageIndex(i => (i + 1) % hotel.images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {hotel.images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentImageIndex(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${i === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                />
              ))}
            </div>
            {/* Counter */}
            <div className="absolute right-3 bottom-3 rounded-full bg-black/50 px-2 py-1 text-xs text-white">
              {currentImageIndex + 1} / {hotel.images.length}
            </div>
          </div>
          {/* Thumbnail strip */}
          <div className="flex gap-2 overflow-x-auto bg-gray-900 p-2">
            {hotel.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  i === currentImageIndex ? 'border-orange-500' : 'border-transparent'
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Hotel Info */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    {Array.from({ length: hotel.starRating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm text-gray-500">{hotel.propertyType}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{hotel.name}</h1>
                  <div className="mt-1 flex items-center gap-1 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{hotel.location}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {hotel.ixigoAssured && (
                    <Badge variant="success" size="md">
                      <Shield className="mr-1 h-4 w-4" /> ixigo Assured
                    </Badge>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-white">
                      <Star className="h-4 w-4 fill-white" />
                      <span className="font-bold">{hotel.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">{hotel.reviewCount.toLocaleString()} reviews</span>
                  </div>
                </div>
              </div>

              {/* Travel style badges */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="info">Best for Families</Badge>
                <Badge variant="info">Best for Couples</Badge>
                <Badge variant="info">Business Friendly</Badge>
              </div>
            </div>

            {/* Check-in/out times */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Check-in / Check-out</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-lg bg-green-50 p-4">
                  <Clock className="h-6 w-6 text-green-600" />
                  <div>
                    <div className="text-xs text-gray-500">Check-in from</div>
                    <div className="font-bold text-gray-900">{hotel.checkInTime}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4">
                  <Clock className="h-6 w-6 text-red-500" />
                  <div>
                    <div className="text-xs text-gray-500">Check-out by</div>
                    <div className="font-bold text-gray-900">{hotel.checkOutTime}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Amenities</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {hotel.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-700">
                    <div className="text-orange-500">
                      {AMENITY_ICONS[amenity] || <CheckCircle className="h-5 w-5" />}
                    </div>
                    <span className="text-sm">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Landmarks */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Nearby Landmarks</h2>
              <div className="space-y-3">
                {hotel.nearbyLandmarks.map((landmark, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      <span className="text-sm">{landmark.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-500">{landmark.distance}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotel Policies */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">Hotel Policies</h2>
              <div className="space-y-4">
                {hotel.policies.ageRestriction && (
                  <div className="flex items-start gap-3">
                    <Users className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">Age Restriction</div>
                      <div className="text-sm text-gray-500">{hotel.policies.ageRestriction}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Accepted ID Proof</div>
                    <div className="text-sm text-gray-500">{hotel.policies.idProof.join(', ')}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium text-gray-700">Local Guest Policy</div>
                    <div className="text-sm text-gray-500">{hotel.policies.localGuest}</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  {hotel.freeCancellation ? (
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-gray-700">Cancellation Policy</div>
                    <div className="text-sm text-gray-500">
                      {hotel.freeCancellation ? 'Free cancellation available on select rooms' : 'Non-refundable'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Guest Reviews</h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-white">
                    <Star className="h-4 w-4 fill-white" />
                    <span className="font-bold">{hotel.rating}</span>
                  </div>
                  <span className="text-sm text-gray-500">{hotel.reviewCount.toLocaleString()} reviews</span>
                </div>
              </div>

              {/* Review type filter */}
              <div className="mb-4 flex flex-wrap gap-2">
                {['All', 'Business', 'Family', 'Couple', 'Solo'].map(type => (
                  <button
                    key={type}
                    onClick={() => setActiveReviewFilter(type)}
                    className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                      activeReviewFilter === type
                        ? 'border-orange-500 bg-orange-50 text-orange-600'
                        : 'border-gray-300 text-gray-600 hover:border-orange-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredReviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                          {review.name[0]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{review.name}</div>
                          <div className="text-xs text-gray-500">{review.type} • {review.date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 rounded-lg bg-green-600 px-2 py-0.5 text-sm font-bold text-white">
                        <Star className="h-3 w-3 fill-white" />
                        {review.rating}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Price & CTA */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4">
                {hotel.originalPrice && (
                  <div className="text-sm text-gray-500 line-through">
                    {formatCurrency(hotel.originalPrice)}
                  </div>
                )}
                <div className="text-3xl font-bold text-gray-900">
                  {formatCurrency(hotel.price)}
                </div>
                <div className="text-sm text-gray-500">
                  Total for {nights} night{nights !== 1 ? 's' : ''}
                  {nights > 0 && hotel.price > 0 && (
                    <span className="ml-1 text-gray-400">
                      (≈ {formatCurrency(Math.round(hotel.price / nights))}/night)
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-gray-400">+ taxes & fees</div>
              </div>

              <div className="mb-4 space-y-2">
                {hotel.freeCancellation && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Free Cancellation
                  </div>
                )}
                {hotel.payAtHotel && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <CheckCircle className="h-4 w-4" />
                    Pay at Hotel available
                  </div>
                )}
                {hotel.ixigoAssured && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Shield className="h-4 w-4" />
                    ixigo Assured Property
                  </div>
                )}
              </div>

              <Button fullWidth size="lg" onClick={handleSelectRooms}>
                Select Rooms
              </Button>

              <div className="mt-3 text-center text-xs text-gray-400">
                Best Price Guarantee · No hidden fees
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white p-4 lg:hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xl font-bold text-gray-900">{formatCurrency(hotel.price)}</div>
            <div className="text-xs text-gray-500">{nights} night{nights !== 1 ? 's' : ''} + taxes</div>
          </div>
          <Button onClick={handleSelectRooms} size="lg">
            Select Rooms
          </Button>
        </div>
      </div>
    </div>
  );
}
