import type { PostBlock } from './blogs.model';

export type ItineraryScaffoldDuration = '3-day' | '5-day' | '7-day';

export interface ItineraryScaffoldDefinition {
  id: ItineraryScaffoldDuration;
  name: string;
  badge: string;
  duration: string;
  idealFor: string;
  description: string;
  blockTypesCount: Record<string, number>;
  createBlocks: (makeId: () => string) => PostBlock[];
}

/**
 * Detects whether the post blocks already contain itinerary days or scaffolds.
 * Used to warn users and prevent accidental duplicate scaffold insertions.
 */
export const hasExistingItineraryScaffold = (blocks: PostBlock[]): boolean => {
  return blocks.some((b) => {
    if (b.type === 'h1' || b.type === 'h2' || b.type === 'h3') {
      const text = b.text || '';
      return /\b(day\s*\d|stage\s*\d|\d+[\s-]day)\b/i.test(text);
    }
    if (b.type === 'numlist' && b.items) {
      return b.items.some((item) => /\b(day\s*\d|stage\s*\d)\b/i.test(item.title));
    }
    return false;
  });
};

export const ITINERARY_SCAFFOLDS: Record<ItineraryScaffoldDuration, ItineraryScaffoldDefinition> = {
  '3-day': {
    id: '3-day',
    name: '3-Day Weekend Express',
    badge: '72 Hours · Fast Paced',
    duration: '3 Days / 2 Nights',
    idealFor: 'City breaks, weekend escapes, and high-yield short trips.',
    description: 'An efficient 72-hour route blueprint balancing iconic landmarks, walkable districts, and evening culinary dining.',
    blockTypesCount: { h1: 1, p: 4, numlist: 1, hotel: 1, h2: 3, image: 1, quote: 1, callout: 1, map: 1 },
    createBlocks: (makeId: () => string): PostBlock[] => [
      {
        id: makeId(),
        type: 'h1',
        text: 'The 3-Day Weekend Express: The Essential Itinerary',
      },
      {
        id: makeId(),
        type: 'p',
        text: 'Designed for time-conscious travelers looking to experience the soul of the destination without rushing. This 72-hour blueprint balances iconic highlights, pedestrian-friendly exploration, and restorative dining.',
      },
      {
        id: makeId(),
        type: 'numlist',
        items: [
          {
            n: 1,
            title: 'Day 01: Arrival, Landmark Sights & Sunset Aperitivo',
            loc: 'Historic Center',
            body: 'Check into your stay, stroll through pedestrian plazas, and catch golden hour from the main panorama point.',
          },
          {
            n: 2,
            title: 'Day 02: Art, Historic Quarters & Culinary Trails',
            loc: 'Cultural District',
            body: 'Morning museum access before the crowds, artisan workshop browsing, and an evening market tasting tour.',
          },
          {
            n: 3,
            title: 'Day 03: Scenic Viewpoints, Leisurely Brunch & Departure',
            loc: 'Riverside Promenade',
            body: 'Slow breakfast, boutique shopping, and a final panoramic stroll before heading to the station or airport.',
          },
        ],
      },
      {
        id: makeId(),
        type: 'h2',
        text: 'Day 1: Arrival, Orientation & Evening Magic',
      },
      {
        id: makeId(),
        type: 'p',
        text: 'Settle into your accommodation, drop your luggage, and set out on foot. Begin with a leisurely walk through the central quarter, orienting yourself among winding historic lanes and bustling plazas.',
      },
      {
        id: makeId(),
        type: 'hotel',
        kicker: 'Weekend Basecamp',
        name: 'The Boutique Heritage Hotel',
        loc: 'Central Historic Quarter',
        price: '₹7,200/night',
        desc: 'Centrally positioned within walking distance of all Day 1 and Day 2 sights, featuring rooftop views and complimentary espresso.',
      },
      {
        id: makeId(),
        type: 'h2',
        text: 'Day 2: Deep Cultural Dive & Local Flavors',
      },
      {
        id: makeId(),
        type: 'p',
        text: 'Rise early to experience premier cultural institutions while the corridors are serene. Reserve afternoon hours for exploring backstreets, independent galleries, and neighborhood cafés.',
      },
      {
        id: makeId(),
        type: 'image',
        src: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
        caption: 'Golden light washing over historic facades in the old artisan quarter.',
      },
      {
        id: makeId(),
        type: 'quote',
        text: 'The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.',
        cite: 'Marcel Proust',
      },
      {
        id: makeId(),
        type: 'h2',
        text: 'Day 3: Scenic Perspectives & Relaxed Farewell',
      },
      {
        id: makeId(),
        type: 'p',
        text: 'Spend your final morning taking in panoramic views from high vantage points before enjoying a relaxed lunch at a neighborhood institution. Pick up local culinary specialties to bring home.',
      },
      {
        id: makeId(),
        type: 'callout',
        text: 'Weekend Travel Tip: Book popular dining venues at least one week in advance. Purchase a 72-hour transit card on arrival to skip ticket counter queues.',
      },
      {
        id: makeId(),
        type: 'map',
        pins: [
          { x: 28, y: 38, label: 'Day 1: Historic Center & Plazas' },
          { x: 52, y: 56, label: 'Day 2: Cultural District & Galleries' },
          { x: 74, y: 32, label: 'Day 3: Panorama Viewpoint & Gardens' },
        ],
      },
    ],
  },

  '5-day': {
    id: '5-day',
    name: '5-Day Classic Explorer',
    badge: '5 Days · Balanced Pace',
    duration: '5 Days / 4 Nights',
    idealFor: 'Regional journeys, pairing urban exploration with scenic countryside or coast.',
    description: 'A curated 5-day journey pairing quintessential cultural landmarks with countryside excursions, paced to avoid travel fatigue.',
    blockTypesCount: { h1: 1, p: 6, numlist: 1, hotel: 1, h2: 5, image: 1, callout: 1, gallery: 1, quote: 1, map: 1 },
    createBlocks: (makeId: () => string): PostBlock[] => [
      {
        id: makeId(),
        type: 'h1',
        text: 'The 5-Day Classic Explorer: Highlights, Heritage & Hidden Gems',
      },
      {
        id: makeId(),
        type: 'p',
        text: 'A curated 5-day journey that pairs quintessential cultural landmarks with countryside excursions. Paced to avoid burnout, this itinerary gives you time to linger at sights that truly matter.',
      },
      {
        id: makeId(),
        type: 'numlist',
        items: [
          {
            n: 1,
            title: 'Day 01: Settle In, Old Town Heritage & Welcome Feast',
            loc: 'Historic Downtown',
            body: 'Morning arrival, neighborhood orientation, architectural highlights, and a welcome dinner featuring regional delicacies.',
          },
          {
            n: 2,
            title: 'Day 02: Iconic Sights, Museums & Rooftop Sunsets',
            loc: 'Museum Mile',
            body: 'Early museum entry, guided historical tour, garden stroll, and craft cocktail hour with panoramic views.',
          },
          {
            n: 3,
            title: 'Day 03: Scenic Countryside & Vineyard Day-Trip',
            loc: 'Rolling Foothills',
            body: 'Escape the urban bustle with a 45-minute scenic journey into terraced valleys, olive groves, and artisan cellars.',
          },
          {
            n: 4,
            title: 'Day 04: Coastal Cliffs, Secluded Coves & Seafood',
            loc: 'Maritime Coast',
            body: 'Scenic coastal train ride, clifftop walking paths, maritime history, and dinner by the harbor.',
          },
          {
            n: 5,
            title: 'Day 05: Artisan Workshops, Flea Markets & Departure',
            loc: 'Craft Quarter',
            body: 'Savor slow morning pastries, shop for handmade souvenirs directly from craftspeople, and prepare for onward travel.',
          },
        ],
      },
      {
        id: makeId(),
        type: 'h2',
        text: 'Day 1: Welcome to the City & Historic Center',
      },
      {
        id: makeId(),
        type: 'p',
        text: 'Arrive and settle into your basecamp. Spend the afternoon uncovering hidden courtyards, cobblestone lanes, and family-run bakeries that tourist buses bypass.',
      },
      {
        id: makeId(),
        type: 'hotel',
        kicker: 'Primary Stay',
        name: 'The Grand Central Villa',
        loc: 'Historic Core',
        price: '₹9,500/night',
        desc: 'Elegant boutique property featuring courtyard gardens, locally roasted coffee, and concierge-arranged walking tours.',
      },
      {
        id: makeId(),
        type: 'h2',
        text: 'Day 2: Monuments, Masterpieces & Sunset Terraces',
      },
      {
        id: makeId(),
        type: 'p',
        text: 'Dedicate today to the architectural masterpieces that define this destination. Pace yourself with a midday pause at a shaded square café.',
      },
      {
        id: makeId(),
        type: 'image',
        src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
        caption: 'Scenic vistas unfolding across the regional valley.',
      },
      {
        id: makeId(),
        type: 'h2',
        text: 'Day 3: Scenic Countryside Escape',
      },
      {
        id: makeId(),
        type: 'p',
        text: 'Rent an electric vehicle or hop on a regional rail spur into the rolling green foothills. Experience farm-to-table traditions and slow living.',
      },
      {
        id: makeId(),
        type: 'callout',
        text: 'Explorer Note: Regional trains run hourly. Download the local rail app for live schedules and discounted digital ticket bundles.',
      },
      {
        id: makeId(),
        type: 'h2',
        text: 'Day 4: Maritime Vistas & Coastal Trails',
      },
      {
        id: makeId(),
        type: 'p',
        text: 'Head toward the water to experience rugged cliffs, salty air, and coastal trails that reward walkers with breathtaking ocean horizons.',
      },
      {
        id: makeId(),
        type: 'gallery',
        images: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80',
        ],
      },
      {
        id: makeId(),
        type: 'h2',
        text: 'Day 5: Artisan Souvenirs & Fond Farewells',
      },
      {
        id: makeId(),
        type: 'p',
        text: 'Wrap up your expedition exploring local ceramicists, perfumers, and textile studios. Conclude with a celebratory farewell lunch.',
      },
      {
        id: makeId(),
        type: 'quote',
        text: "Travel isn't always pretty. It isn't always comfortable. Sometimes it hurts, it even breaks your heart. But that's okay. The journey changes you.",
        cite: 'Anthony Bourdain',
      },
      {
        id: makeId(),
        type: 'map',
        pins: [
          { x: 22, y: 35, label: 'Day 1–2: City Core & Heritage Hub' },
          { x: 48, y: 65, label: 'Day 3: Countryside Valley & Vineyards' },
          { x: 78, y: 42, label: 'Day 4: Coastal Headlands & Harbor' },
          { x: 30, y: 78, label: 'Day 5: Artisan Flea Market' },
        ],
      },
    ],
  },

  '7-day': {
    id: '7-day',
    name: '7-Day Master Grand Tour',
    badge: '1 Week · Comprehensive Immersion',
    duration: '7 Days / 6 Nights',
    idealFor: 'Full-week vacations, multi-region circuits, and in-depth cultural itineraries.',
    description: 'The definitive week-long travel blueprint. Sequenced into three geographic stages with built-in rest days and logistical clarity.',
    blockTypesCount: { h1: 1, p: 6, numlist: 1, hotel: 1, h2: 4, image: 1, callout: 1, gallery: 1, quote: 1, faq: 1, budget: 1, map: 1, newsletter: 1 },
    createBlocks: (makeId: () => string): PostBlock[] => [
      {
        id: makeId(),
        type: 'h1',
        text: 'The Master 7-Day Grand Tour: Complete Week-Long Blueprint',
      },
      {
        id: makeId(),
        type: 'p',
        text: 'The definitive week-long travel blueprint. Carefully sequenced into three travel stages to maximize geographic efficiency, experience variety, and authentic immersion while building in essential breathing room.',
      },
      {
        id: makeId(),
        type: 'numlist',
        items: [
          {
            n: 1,
            title: 'Stage 1 / Days 1–2: Metropolitan Arrival, Historic Highlights & Cultural Core',
            loc: 'Capital City',
            body: 'Grand boulevards, national galleries, historical landmarks, evening performances, and premier dining.',
          },
          {
            n: 2,
            title: 'Stage 2 / Days 3–4: Mountain Foothills, Medieval Towns & Outdoor Pursuits',
            loc: 'Alpine Valley',
            body: 'Scenic highway transit, castle ruins, pine forest ridge hikes, and hearty alpine gastronomy.',
          },
          {
            n: 3,
            title: 'Stage 3 / Days 5–6: Sunlit Coastline, Island Hopping & Hidden Coves',
            loc: 'Riviera Coast',
            body: 'Ferry crossings, secluded swimming bays, waterfront promenade sunsets, and fresh catch of the day.',
          },
          {
            n: 4,
            title: 'Stage 4 / Day 07: Return Loop, Artisan Shopping & Farewell Feast',
            loc: 'Old Port Quarter',
            body: 'Last-minute regional food shopping, quiet café reflection, and departure coordination.',
          },
        ],
      },
      {
        id: makeId(),
        type: 'h2',
        text: 'Stage 1 (Days 1–2): The Cultural Capital',
      },
      {
        id: makeId(),
        type: 'p',
        text: 'Begin your week in the bustling heart of the region. Explore grand architecture, world-renowned collections, and vibrant public markets.',
      },
      {
        id: makeId(),
        type: 'hotel',
        kicker: 'Basecamp 1 (Days 1–3)',
        name: 'The Metropolitan Heritage Palace',
        loc: 'Capital Center',
        price: '₹11,000/night',
        desc: 'Historic landmark property with private gardens, walking distance to primary museums and the central railway terminal.',
      },
      {
        id: makeId(),
        type: 'h2',
        text: 'Stage 2 (Days 3–4): Into the High Valleys',
      },
      {
        id: makeId(),
        type: 'p',
        text: 'Leave urban rhythm behind as you head toward mist-shrouded mountain passes. The temperature cools, the scenery turns dramatic, and quiet villages welcome travelers with warm hearths.',
      },
      {
        id: makeId(),
        type: 'image',
        src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
        caption: 'Majestic peaks flanking the valley trail on Day 4.',
      },
      {
        id: makeId(),
        type: 'callout',
        text: 'Pacing Tip: Day 4 is intentionally designed as an active morning followed by a restorative afternoon. Take time to relax in the village hot baths or lakeside sauna.',
      },
      {
        id: makeId(),
        type: 'h2',
        text: 'Stage 3 (Days 5–6): The Sun-Drenched Coast',
      },
      {
        id: makeId(),
        type: 'p',
        text: 'Travel south toward turquoise waters and whitewashed cliff villages. Spend your days on wooden charter boats and evening hours dining along the water’s edge.',
      },
      {
        id: makeId(),
        type: 'gallery',
        images: [
          'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=600&q=80',
          'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
        ],
      },
      {
        id: makeId(),
        type: 'quote',
        text: 'We travel not to escape life, but for life not to escape us.',
        cite: 'Anonymous',
      },
      {
        id: makeId(),
        type: 'h2',
        text: 'Stage 4 (Day 7): Leisurely Finale & Departure',
      },
      {
        id: makeId(),
        type: 'p',
        text: 'Spend your last day packing regional treats—hand-pressed oils, local textiles, and spices. Enjoy one final leisurely lunch before heading to your departure hub.',
      },
      {
        id: makeId(),
        type: 'faq',
        title: 'Frequently Asked Questions About This 7-Day Route',
        body: 'What is the best way to travel between stages? Regional express trains connect Stage 1 to Stage 2 and Stage 3 effortlessly.\nHow much luggage should I bring? Pack one carry-on roller and a daypack for ease during transit days.',
      },
      {
        id: makeId(),
        type: 'budget',
        title: 'Estimated Budget per Traveler (Excluding Flights)',
        price: '₹48,000 – ₹62,000',
        desc: 'Includes 6 nights boutique lodging, rail passes, museum tickets, and moderate dining.',
      },
      {
        id: makeId(),
        type: 'map',
        pins: [
          { x: 20, y: 30, label: 'Days 1–2: Capital City Core' },
          { x: 50, y: 22, label: 'Days 3–4: Alpine Valley & Trails' },
          { x: 80, y: 65, label: 'Days 5–6: Sunlit Coast & Islands' },
          { x: 25, y: 75, label: 'Day 7: Farewell Harbor District' },
        ],
      },
      {
        id: makeId(),
        type: 'newsletter',
        title: 'Get Our Complete Printable 7-Day Packing Checklist',
        body: 'Subscribe to PlumTrips for downloadable day-by-day maps, train schedules, and hand-picked stay recommendations.',
      },
    ],
  },
};