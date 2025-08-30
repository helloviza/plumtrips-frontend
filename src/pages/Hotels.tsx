import { motion } from "framer-motion";

export default function Hotels() {
  return (
    <div className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/hotel-bg.jpg')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Center Card */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-6">
        <motion.div
          className="max-w-3xl bg-white/40 backdrop-blur-lg shadow-2xl rounded-3xl p-12 text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-[#00477f] to-[#d06549] bg-clip-text text-transparent animate-pulse">
            Hotels by Plumtrips
          </h1>
          <p className="text-lg text-gray-700 mb-8">
            A curated collection of luxurious hotels is on the way. We’re
            designing an experience where **comfort, elegance, and modern design**
            meet to delight every traveler.
          </p>

          {/* Luxury highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#f9f9f9] rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-[#00477f]">🏨 Elegant Stays</h3>
              <p className="text-sm text-gray-600 mt-2">
                Boutique & design-driven hotels for the discerning traveler.
              </p>
            </div>
            <div className="bg-[#f9f9f9] rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-[#d06549]">✨ Modern Comfort</h3>
              <p className="text-sm text-gray-600 mt-2">
                Clean, safe, and seamlessly styled — luxury without compromise.
              </p>
            </div>
            <div className="bg-[#f9f9f9] rounded-xl p-6 shadow-md hover:shadow-lg transition">
              <h3 className="text-xl font-semibold text-[#00477f]">🌍 Smart Travel</h3>
              <p className="text-sm text-gray-600 mt-2">
                Connected locations with easy access and effortless transfers.
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-gray-500 text-sm">
            🌟 Coming soon — the <span className="font-bold text-[#00477f]">Plumtrips way</span> 
            of booking your perfect stay.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
