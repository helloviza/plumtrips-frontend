import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ImageIcon, X } from 'lucide-react';

interface HotelGalleryProps {
  images: string[];
}

export default function HotelGallery({ images }: HotelGalleryProps) {
  const [showModal, setShowModal] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  if (!images || images.length === 0) return null;

  const displayImages = images.slice(0, 5);
  const remainingCount = images.length - 5;

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden mb-6 h-[300px] md:h-[400px]">
        {/* Left Side: 1 Big Image */}
        <div className="h-full">
          <img 
            src={displayImages[0]} 
            alt="Hotel main" 
            className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
            onClick={() => setShowModal(true)}
          />
        </div>
        
        {/* Right Side: Up to 4 Small Images (hidden on small screens) */}
        <div className="hidden md:grid grid-cols-2 grid-rows-2 gap-2 h-full">
          {displayImages.slice(1, 5).map((img, idx) => {
            const isLast = idx === 3; // The 5th image overall
            return (
              <div key={idx} className="relative h-full w-full">
                <img 
                  src={img} 
                  alt={`Hotel ${idx + 2}`} 
                  className="w-full h-full object-cover hover:opacity-90 transition-opacity cursor-pointer"
                  onClick={() => setShowModal(true)}
                />
                {isLast && remainingCount > 0 && (
                  <div 
                    className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer hover:bg-black/40 transition-colors"
                    onClick={() => setShowModal(true)}
                  >
                    <ImageIcon className="text-white w-8 h-8 mb-2" />
                    <span className="text-white font-semibold text-sm">View All Photos ({images.length})</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col animate-in fade-in duration-200">
          <div className="flex items-center justify-between p-4 bg-black/90 text-white">
            <h3 className="text-xl font-bold">All Photos ({images.length})</h3>
            <button 
              onClick={() => setShowModal(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-[1600px] mx-auto">
              {images.map((img, idx) => (
                <div key={idx} className="aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden relative group">
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
