import type {
  BlockType,
  StoryStyle,
  TemplateAuthoringProfile,
  TypographyRules,
  LayoutRules,
  TypographyOverrides,
  LayoutOverrides,
  BlogHighlight,
} from './blogs.model';

export type BlogFormat =
  | 'editorial-destination'
  | 'photography-narrative'
  | 'practical-planning'
  | 'discovery-experience'
  | 'decision-interactive'
  | 'blank';

export interface BlogFormatDefinition {
  type: BlogFormat;
  label: string;
  description: string;
  blocks: BlockType[];
}

export const BLOG_FORMATS: BlogFormatDefinition[] = [
  {
    type: 'editorial-destination',
    label: 'Editorial & Destination Guides (Itineraries & Stories)',
    description: 'Magazine features, chronological itineraries, photo journeys, scenic routes, and smart travel handbooks.',
    blocks: ['cover', 'h1', 'p', 'h2', 'p', 'numlist', 'image', 'quote', 'p'],
  },
  {
    type: 'photography-narrative',
    label: 'Photography & Narrative (Visual Stories)',
    description: 'Cinematic wide-bleed spreads, photo essays, travel diaries, culture features, and nature expeditions.',
    blocks: ['cover', 'h1', 'p', 'image', 'p', 'gallery', 'quote', 'image', 'p'],
  },
  {
    type: 'practical-planning',
    label: 'Itinerary Planners & City Guides (Practical Planning)',
    description: 'Cost breakdowns, master multi-day planners, weekend escapes, transit hubs, and curated stays.',
    blocks: ['cover', 'h1', 'p', 'numlist', 'hotel', 'map', 'p'],
  },
  {
    type: 'discovery-experience',
    label: 'Discoveries & Local Experiences (Food & Adventure)',
    description: 'Culinary maps, adventure pursuits, coastal islands, secret spots, and seasonal timing.',
    blocks: ['cover', 'h1', 'p', 'numlist', 'gallery', 'quote', 'p'],
  },
  {
    type: 'decision-interactive',
    label: 'Things To Do & Decision Guides (Interactive Support)',
    description: 'Side-by-side comparisons, activity countdowns, packing checklists, FAQs, and field guides.',
    blocks: ['cover', 'h1', 'p', 'numlist', 'map', 'p'],
  },
  {
    type: 'blank',
    label: 'Blank / Custom',
    description: 'Start with an empty editor and build your custom article block by block.',
    blocks: [],
  },
];

export type BlogTemplateBlock = {
  type: BlockType;
  minWords?: number;
  maxWords?: number;
  minItems?: number;
  maxItems?: number;
  imageCount?: number;
  imageStyle?: 'standard' | 'large' | 'full-width' | 'gallery';
  imagePosition?: 'left' | 'right' | 'center' | 'top' | 'bottom';
  width?: 'small' | 'medium' | 'large' | 'full';
  alignment?: 'left' | 'center' | 'right';
  required?: boolean;
  typography?: TypographyOverrides;
  layout?: LayoutOverrides;
  highlight?: BlogHighlight;
  url?: string;
  text?: string;
  caption?: string;
  cite?: string;
  src?: string;
  images?: string[];
  items?: Array<{ n?: number; title: string; loc?: string; body: string; img?: string }>;
  kicker?: string;
  name?: string;
  loc?: string;
  desc?: string;
  price?: string;
  nights?: string;
  img?: string;
  pins?: Array<{ x: number; y: number; label: string }>;
  title?: string;
  body?: string;
};

export type BlogTemplateDefinition = {
  id: StoryStyle;
  name: string;
  description: string;
  thumbnail: string;
  blocks: BlogTemplateBlock[];
  profile?: TemplateAuthoringProfile;
  typography?: TypographyRules;
  layout?: LayoutRules;
};

// ─── GROUP A — EDITORIAL AND DESTINATION STORIES ──────────────────────────────
export const GROUP_A_TEMPLATES: BlogTemplateDefinition[] = [
  {
    id: 'editorial-journal',
    name: '01. Editorial Journal',
    description: 'Magazine-style narrative with editorial headline, rich typography, pull quotes, and immersion.',
    thumbnail: '/assets/attached_assets/dest-bali.png',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/dest-bali.png', caption: 'Dawn breaking over the ancient coastal horizon', required: true },
      { type: 'h1', text: 'The Spirit of the Journey: A Writer’s Chronicle', required: true },
      { type: 'p', text: 'Travel begins before the journey itself, in the quiet anticipation of departure. As morning mist lifted from the hillside terraces, the true character of this place revealed itself not in landmark monuments, but in slow daily rituals and conversations with villagers along the stone lanes.' },
      { type: 'quote', text: 'To travel is to discover that everyone is wrong about other countries.', cite: 'Aldous Huxley' },
      { type: 'h2', text: 'I. The Morning Light on the Terraces' },
      { type: 'p', text: 'Winding paths take you past centuries of stone and timber architecture. Locals greet you with gentle nods, and the scent of wild herbs and woodsmoke mingles in the cool mountain air.' },
      { type: 'image', src: '/assets/attached_assets/bali_replacement_1.jpg', caption: 'Morning light falling across quiet alleys' },
      { type: 'h2', text: 'II. The Architecture of Memory' },
      { type: 'p', text: 'Every archway tells of trades and migrations that shaped this region over generations. Taking time to linger without an itinerary yields the richest discoveries.' },
      { type: 'newsletter', title: 'Read More Editorial Travel Dispatches', body: 'Subscribe for weekly long-form narratives, essays, and field notes.' },
    ],
  },
  {
    id: 'day-by-day',
    name: '02. Day-by-Day Explorer',
    description: 'Chronological multi-day itinerary with day markers, timelines, daily highlights, activities, and timings.',
    thumbnail: '/assets/attached_assets/exp-tuscany.png',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/exp-tuscany.png', caption: 'Rolling vistas welcoming travelers on Day 1', required: true },
      { type: 'h1', text: '4 Days in the Valley: The Complete Chronological Explorer', required: true },
      { type: 'p', text: 'An optimized day-by-day journey planned to avoid backtracking, balance energetic exploring with restful evenings, and experience both landmarks and quiet hideaways.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Day 01: Arrival & Historic Core', loc: 'Old Town & Riverfront', body: 'Check into your base, walk through the medieval market square, and savor dinner at a family-run trattoria.' },
          { n: 2, title: 'Day 02: Art, Architecture & Rooftop Views', loc: 'Upper Citadel', body: 'Ascend the historic towers before midday heat. Spend the afternoon admiring master frescoes and sunset over the bridges.' },
          { n: 3, title: 'Day 03: Countryside & Vineyard Trails', loc: 'Rolling Foothills', body: 'Rent an e-bike or hire a local driver to explore olive groves, scenic hill stations, and artisan cheese dairies.' },
          { n: 4, title: 'Day 04: Local Artisans & Farewell Feast', loc: 'Artisans Quarter', body: 'Shop for handmade leather goods and ceramics, followed by a celebratory tasting menu.' },
        ],
      },
      { type: 'h2', text: 'Essential Day-by-Day Route & Map' },
      { type: 'p', text: 'All 4 stages are mapped below. Transit between Day 1 and Day 3 can be done by regional train or a 45-minute rental drive.' },
      {
        type: 'map',
        pins: [
          { x: 25, y: 35, label: 'Day 1: Historic Core' },
          { x: 45, y: 55, label: 'Day 2: Upper Citadel' },
          { x: 70, y: 40, label: 'Day 3: Vineyard Trails' },
          { x: 60, y: 75, label: 'Day 4: Artisans Quarter' },
        ],
      },
    ],
  },
  {
    id: 'visual-journey',
    name: '03. Visual Journey',
    description: 'Photography-led storytelling with large images, diptych spreads, galleries, and vivid vignettes.',
    thumbnail: '/assets/attached_assets/bali_rice_terrace_1780482458839.png',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/bali_rice_terrace_1780482458839.png', caption: 'Emerald terraces captured in first morning illumination', required: true },
      { type: 'h1', text: 'Visual Journey: Light, Land & Coastal Textures', required: true },
      { type: 'p', text: 'A visual celebration of dramatic landscapes, quiet moments, and atmospheric tones. Let the photography lead you through the destination’s most compelling vistas.' },
      {
        type: 'gallery',
        images: [
          '/assets/attached_assets/bali_replacement_2.jpg',
          '/assets/attached_assets/bali_replacement_3.jpg',
          '/assets/attached_assets/bali_replacement_4.jpg',
          '/assets/attached_assets/bali_replacement_5.jpg',
        ],
      },
      { type: 'quote', text: 'Photography is the story I fail to put into words.', cite: 'Destin Sparks' },
      { type: 'p', text: 'When the midday sun subsides, the coastal shadows lengthen and color saturates the horizon in tones of gold and slate.' },
      {
        type: 'gallery',
        images: [
          '/assets/attached_assets/bali_replacement_6.jpg',
          '/assets/attached_assets/bali_replacement_7.jpg',
        ],
      },
    ],
  },
  {
    id: 'route-explorer',
    name: '04. Route Explorer',
    description: 'Ordered road trip or transit itinerary with sequential stops, travel legs, and waypoint notes.',
    thumbnail: '/assets/attached_assets/island-hop.jpg',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/island-hop.jpg', caption: 'The open coastal highway winding along cliffs', required: true },
      { type: 'h1', text: 'The Grand Route: Waypoints & Scenic Byways', required: true },
      { type: 'p', text: 'A step-by-step route guide connecting key stops across scenic highways, transit hubs, and lookout points.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Stop 01: Coastal Bay Starting Point', loc: 'Km 0 — Southern Port', body: 'Pick up your rental vehicle, fuel up, and begin the drive along the cliffside road.' },
          { n: 2, title: 'Stop 02: Mountain Pass & Lookout', loc: 'Km 48 — High Ridge', body: 'A steep climb rewarding drivers with 360-degree panoramic ocean views. Perfect for morning coffee.' },
          { n: 3, title: 'Stop 03: River Valley Settlement', loc: 'Km 92 — Central Basin', body: 'Descend into lush valleys with riverside eateries and suspension bridges.' },
          { n: 4, title: 'Stop 04: The Northern Peninsula Terminal', loc: 'Km 140 — Lighthouse Point', body: 'End the road trip at the rugged sea cliffs where the lighthouse overlooks crashing surf.' },
        ],
      },
      {
        type: 'map',
        pins: [
          { x: 18, y: 70, label: 'Km 0: Southern Port' },
          { x: 42, y: 50, label: 'Km 48: High Ridge' },
          { x: 65, y: 38, label: 'Km 92: Central Basin' },
          { x: 82, y: 22, label: 'Km 140: Lighthouse Point' },
        ],
      },
      { type: 'h2', text: 'Driving Notes & Fuel Stops' },
      { type: 'p', text: 'Gas stations are readily available every 30 km. Road tolls are electronic; ensure your rental vehicle has an active toll pass card.' },
    ],
  },
  {
    id: 'smart-travel',
    name: '05. Smart Travel Guide',
    description: 'Practical destination guide with key facts, best season, getting there, stays, and FAQs.',
    thumbnail: '/assets/attached_assets/dest-japan.png',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/dest-japan.png', caption: 'Modern transit and ancient shrines coexist harmoniously', required: true },
      { type: 'h1', text: 'The Smart Traveler’s Handbook: Practical Planning', required: true },
      { type: 'p', text: 'Everything you need to know before visiting: climate windows, transit passes, recommended hotels, and local insider advice.' },
      { type: 'h2', text: 'Getting There & Airport Transfers' },
      { type: 'p', text: 'Express trains connect the international terminal to the city center in under 35 minutes. Pre-book an IC card for seamless tapping on buses and metros.' },
      { type: 'h2', text: 'Curated Stays by Neighborhood' },
      { type: 'hotel', kicker: 'Best for First-Timers', name: 'Grand Heritage Hotel', loc: 'Central District', price: '₹9,500/night', nights: '3 nights', desc: 'Step out directly into pedestrian shopping streets and transit lines.' },
      { type: 'hotel', kicker: 'Boutique & Quiet', name: 'Riverside Boutique Retreat', loc: 'Historic Canal Quarter', price: '₹7,200/night', nights: '2 nights', desc: 'Peaceful garden courtyards with traditional breakfast.' },
      { type: 'h2', text: 'Frequently Asked Questions' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Is tap water safe to drink?', body: 'Yes, municipal tap water is completely safe across the entire metropolitan area.' },
          { n: 2, title: 'What currency is preferred?', body: 'Contactless cards and digital wallets are accepted at 95% of shops. Keep a small reserve of cash for temple stalls.' },
        ],
      },
    ],
  },
];

// ─── GROUP B — PHOTOGRAPHY AND NARRATIVE ──────────────────────────────────────
export const GROUP_B_TEMPLATES: BlogTemplateDefinition[] = [
  {
    id: 'cinematic-destination',
    name: '06. Cinematic Destination',
    description: 'Dramatic, oversized visuals with widescreen chapter breaks and cinematic storytelling.',
    thumbnail: '/assets/attached_assets/dest-italy.png',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/dest-italy.png', caption: 'Dramatic cliffside panoramas stretching toward the horizon', required: true },
      { type: 'h1', text: 'Realm of High Horizons: A Cinematic Odyssey', required: true },
      { type: 'p', text: 'Monumental geography, dramatic vistas, and breathtaking light that feels composed like cinema.' },
      { type: 'image', src: '/assets/attached_assets/italy_replacement_1.jpg', caption: 'Chapter I: The Valley of Whispers' },
      { type: 'h2', text: 'Chapter I: The Ancient Ramparts' },
      { type: 'p', text: 'Standing atop these ancient limestone ramparts, one feels the sheer magnitude of geological time and the silence of the highlands.' },
      {
        type: 'gallery',
        images: [
          '/assets/attached_assets/exp-tusc.jpg',
          '/assets/attached_assets/dest-thailand.png',
          '/assets/attached_assets/exp-thailand.png',
        ],
      },
      { type: 'quote', text: 'Nature in its grandest scale humbles the human spirit.' },
    ],
  },
  {
    id: 'photo-essay',
    name: '07. Photo Essay',
    description: 'Visual story sequence where photography drives narrative progression with captions.',
    thumbnail: '/assets/attached_assets/vietnam_lanterns_1780482438085.png',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/vietnam_lanterns_1780482438085.png', caption: 'Lanterns glowing over the river at twilight', required: true },
      { type: 'h1', text: 'Portraits of the Old Quarter: A Photographic Essay', required: true },
      { type: 'p', text: 'A visual documentation of morning markets, skilled artisans, and atmospheric waterways where life unfolds along the cobblestones.' },
      {
        type: 'gallery',
        images: [
          '/assets/attached_assets/culinary_vietnam.jpg',
          '/assets/attached_assets/vietnam_halong_1780482394962.png',
          '/assets/attached_assets/thai_pers_temple_1780483761928.png',
          '/assets/attached_assets/japan_pers_tea_1780482988284.png',
        ],
      },
      { type: 'p', text: 'The rhythm of life begins before dawn as wooden boats glide across misty river channels laden with fresh market produce.' },
      {
        type: 'gallery',
        images: [
          '/assets/attached_assets/japan_serene_1780482413728.png',
          '/assets/attached_assets/japan-tourism-1.jpg',
        ],
      },
      { type: 'quote', text: 'In every portrait, there is a lifetime of devotion to craft and quiet grace.' },
    ],
  },
  {
    id: 'travel-diary',
    name: '08. Travel Diary',
    description: 'Intimate first-person chronological journal entries with timestamps, thoughts, and field notes.',
    thumbnail: '/assets/attached_assets/japan_pers_tea_1780482988284.png',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/japan_pers_tea_1780482988284.png', caption: 'A quiet morning tea ritual in the cedar pavilion', required: true },
      { type: 'h1', text: 'Pages from My Field Journal: Notes from the Road', required: true },
      { type: 'p', text: 'Raw impressions, personal reflections, and sensory field notes recorded on the trail.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Oct 12 — 06:15 AM: First Light over the Valley', loc: 'Ridge Camp', body: 'The air smelled of cedar needles and frost. Watching the valley fill with gold was worth the predawn hike.' },
          { n: 2, title: 'Oct 13 — 02:30 PM: Lost in the Artisan Alleyways', loc: 'Old Potter’s Row', body: 'Turned off the main street and stumbled into an eighty-year-old kiln workshop. Spent two hours drinking green tea with the master.' },
          { n: 3, title: 'Oct 14 — 08:00 PM: Rain on the Tile Roofs', loc: 'Traditional Inn', body: 'A heavy mountain downpour has trapped us in the tea parlor. The sound of rain on curved clay tiles is the sweetest lullaby.' },
        ],
      },
      { type: 'quote', text: 'We travel not to escape life, but for life not to escape us.' },
    ],
  },
  {
    id: 'culture-heritage',
    name: '09. Culture & Heritage',
    description: 'Deep-dive into historic landmarks, ancient traditions, architecture, and cultural etiquette.',
    thumbnail: '/assets/attached_assets/thai_pers_temple_1780483761928.png',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/thai_pers_temple_1780483761928.png', caption: 'Golden stupas reflecting timeless architectural genius', required: true },
      { type: 'h1', text: 'Sacred Sanctums: Centuries of Architecture & Ritual', required: true },
      { type: 'p', text: 'A cultural journey examining ancient kingdoms, master craftsmanship, spiritual traditions, and heritage conservation.' },
      { type: 'h2', text: 'The Origins of the Sacred Complex' },
      { type: 'p', text: 'Built across four successive dynasties, the temple grounds preserve stone carvings that chronicle cosmic mythologies and ancient dynastic treaties.' },
      { type: 'image', src: '/assets/attached_assets/dest-thailand.png', caption: 'Intricate bas-reliefs carved from local sandstone' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Temple Dress Code & Footwear', loc: 'Entry Protocol', body: 'Shoulders and knees must remain covered. Slip-on shoes are recommended as footwear is removed before entering all sacred halls.' },
          { n: 2, title: 'Morning Merit-Making & Alms', loc: 'Main Gate — 06:00 AM', body: 'Visitors are welcome to witness the dawn almsgiving ceremony in respectful silence without flash photography.' },
          { n: 3, title: 'Preserving Fragile Frescoes', loc: 'Inner Sanctum', body: 'Touching historical plaster or using selfie sticks inside the painted pavilions is strictly prohibited.' },
        ],
      },
      { type: 'quote', text: 'Heritage is our legacy from the past, what we live with today, and what we pass on to future generations.' },
    ],
  },
  {
    id: 'nature-wildlife',
    name: '10. Nature & Wildlife',
    description: 'Ecological adventures, biodiversity, conservation zones, national parks, and wildlife spotting.',
    thumbnail: '/assets/attached_assets/exp-iceland.png',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/exp-iceland.png', caption: 'Wild volcanic landscapes sculpted by glacial meltwater', required: true },
      { type: 'h1', text: 'Wild Sanctuaries: An Ecological Expedition', required: true },
      { type: 'p', text: 'Discovering pristine biodiversity, protected natural reserves, rare wildlife habitats, and ethical observation protocols.' },
      { type: 'h2', text: 'Ecosystem Overview & Flora Highlights' },
      { type: 'p', text: 'Home to rare avian species and ancient moss-covered basalt plateaus, this protected biome maintains ecological equilibrium through strict park guidelines.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Optimal Wildlife Viewing Hours', loc: 'Wetland Trails', body: 'Dawn and dusk offer 4x the likelihood of observing nesting cranes and wild deer grazing along riverbanks.' },
          { n: 2, title: 'Responsible Trail Ethics', loc: 'Strict Leave-No-Trace', body: 'Stay strictly on marked boardwalks to prevent soil compaction and protect fragile endemic subalpine flora.' },
        ],
      },
      {
        type: 'gallery',
        images: [
          '/assets/attached_assets/exp-iceland.png',
          '/assets/attached_assets/holidays.jpeg',
        ],
      },
      { type: 'quote', text: 'In every walk with nature, one receives far more than he seeks.', cite: 'John Muir' },
    ],
  },
];

// ─── GROUP C — PRACTICAL PLANNING ─────────────────────────────────────────────
export const GROUP_C_TEMPLATES: BlogTemplateDefinition[] = [
  {
    id: 'budget-breakdown',
    name: '11. Budget Breakdown',
    description: 'Financial blueprint with itemized costs, budget tiers, currency advice, and saving tips.',
    thumbnail: '/assets/attached_assets/vietnam_halong_1780482394962.png',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/vietnam_halong_1780482394962.png', caption: 'Affordable emerald bays that offer world-class luxury at budget prices', required: true },
      { type: 'h1', text: 'Real Travel Costs: The Complete Budget Breakdown', required: true },
      { type: 'p', text: 'A transparent expense guide detailing stay costs, daily dining budgets, transport fares, and money-saving tactics for every traveler type.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Accommodation Tiers (Per Night)', loc: 'Hostel to Luxury Resort', body: 'Budget hostels: ₹800–₹1,500. Boutique mid-range hotels: ₹3,500–₹6,500. Five-star beachfront villas: ₹12,000+.' },
          { n: 2, title: 'Daily Meals & Culinary Spending', loc: 'Street Stalls to Fine Dining', body: 'Street food and casual cafes: ₹600–₹1,200/day. Mid-tier restaurants with drinks: ₹1,800–₹3,200/day.' },
          { n: 3, title: 'Local Transit & Sightseeing Passes', loc: 'Trains, Taxis, Boats', body: 'Public transit & day passes: ₹250–₹500/day. Private scooter hire: ₹450/day. Guided tours & entrance fees: ₹800–₹1,800.' },
        ],
      },
      { type: 'h2', text: '5 Smart Ways to Stretch Your Budget by 35%' },
      { type: 'p', text: 'Book accommodations with included breakfast, use reloadable transit passes, and dine where local office workers congregate for the freshest meals at half the tourist price.' },
    ],
  },
  {
    id: 'itinerary-planner',
    name: '12. Ultimate Itinerary Planner',
    description: 'Master travel planner with stage breakdowns, activity schedules, and transition logistics.',
    thumbnail: '/assets/attached_assets/holidays_hero_premium.png',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/holidays_hero_premium.png', caption: 'An effortlessly choreographed multi-day route', required: true },
      { type: 'h1', text: 'The Master 7-Day Itinerary: Hour-by-Hour Blueprint', required: true },
      { type: 'p', text: 'A rigorously planned vacation schedule designed to maximize landmark sights without rushing, exhaustion, or wasted transit hours.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Stage 1 (Days 1–2): City Arrival & Heritage Immersion', loc: 'Historic Core', body: 'Settle into your central hotel, explore key museums during off-peak morning hours, and enjoy evening boat cruises.' },
          { n: 2, title: 'Stage 2 (Days 3–4): Coastal Detour & Hidden Beaches', loc: 'Southern Riviera', body: 'Take the morning express train to the coast. Spend two sunlit days discovering secluded coves and fresh seafood markets.' },
          { n: 3, title: 'Stage 3 (Days 5–6): Alpine Foothills & Panoramic Vistas', loc: 'Mountain Station', body: 'Cable cars to high ridges, hiking scenic mountain trails, and staying at an alpine lodge.' },
          { n: 4, title: 'Stage 4 (Day 7): Return & Farewell Shopping', loc: 'Grand Boulevard', body: 'Pack gifts, visit artisan workshops, and head to the airport smoothly.' },
        ],
      },
      { type: 'hotel', kicker: 'Basecamp 1', name: 'Metropolitan City Palace', loc: 'City Center', price: '₹8,500/night', desc: 'Central hub for Days 1–2.' },
      {
        type: 'map',
        pins: [
          { x: 30, y: 30, label: 'Stage 1: Historic Core' },
          { x: 60, y: 70, label: 'Stage 2: Southern Riviera' },
          { x: 80, y: 40, label: 'Stage 3: Mountain Station' },
        ],
      },
    ],
  },
  {
    id: 'weekend-escape',
    name: '13. Weekend Escape',
    description: 'High-efficiency 48–72 hour weekend itinerary from Friday arrival to Sunday evening.',
    thumbnail: '/assets/attached_assets/italy_replacement_1.jpg',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/italy_replacement_1.jpg', caption: 'A quick 48-hour metropolitan reset', required: true },
      { type: 'h1', text: '48 Hours In: The Definitive Weekend Getaway', required: true },
      { type: 'p', text: 'Transform your weekend into an unforgettable adventure. A high-yield itinerary crafted for Friday night arrival to Sunday evening departure.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Friday 07:00 PM: Check-in, Aperitivo & Canal Walk', loc: 'Arrival Night', body: 'Drop your bags at your boutique hotel and head straight out for an evening cocktail and small plates along the canal.' },
          { n: 2, title: 'Saturday 09:30 AM – 06:00 PM: Art, Architecture & Market Feast', loc: 'Full Exploration Day', body: 'Morning museum tour, leisurely market lunch, artisan shopping, and a panoramic sunset viewpoint.' },
          { n: 3, title: 'Sunday 10:00 AM – 04:00 PM: Brunch, Botanical Gardens & Departure', loc: 'Finale', body: 'A decadent rooftop brunch, a slow walk through historic botanical gardens, and an effortless transfer to the airport.' },
        ],
      },
      { type: 'hotel', kicker: 'Weekend Boutique Stay', name: 'The Urban Loft & Spa', loc: 'Downtown', price: '₹7,000/night', desc: 'Walking distance to all weekend activities.' },
    ],
  },
  {
    id: 'transport-guide',
    name: '14. Transport & Getting There',
    description: 'Transit and logistics guide: flights, trains, ferries, cruises, passes, and transfer hubs.',
    thumbnail: '/assets/attached_assets/dubai_f.jpg',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/dubai_f.jpg', caption: 'Modern rail networks and airport transfers', required: true },
      { type: 'h1', text: 'Getting There & Around: Complete Transit Masterplan', required: true },
      { type: 'p', text: 'Navigating flights, high-speed rail, regional ferries, metro networks, and rideshare apps with zero friction.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Leg 1: Airport to City Center', loc: 'Express Train / Taxi', body: 'The dedicated express airport train departs every 15 minutes, costing ₹350 and taking 22 minutes directly to the central terminal.' },
          { n: 2, title: 'Leg 2: Inter-City High Speed Rail', loc: 'Bullet Train / Express Line', body: 'Book train seats at least 3 weeks ahead for a 30% discount. Luggage racks accommodate up to 28-inch suitcases.' },
          { n: 3, title: 'Leg 3: Ferries & Coastal Transit', loc: 'Island Terminals', body: 'Catamarans and vehicle ferries run regularly. Check wind and sea forecasts during monsoon seasons.' },
        ],
      },
      {
        type: 'map',
        pins: [
          { x: 20, y: 30, label: 'Airport Express Hub' },
          { x: 50, y: 50, label: 'Central High Speed Station' },
          { x: 80, y: 75, label: 'Ferry Terminal' },
        ],
      },
      { type: 'h2', text: 'Essential Transit Cards & Smartphone Apps' },
      { type: 'p', text: 'Download the official transit app for real-time schedule tracking and discounted tap-and-go contactless payment.' },
    ],
  },
  {
    id: 'stay-guide',
    name: '15. Accommodation & Stay Guide',
    description: 'Curated stay portfolio: luxury resorts, heritage villas, boutique retreats, and neighborhood advice.',
    thumbnail: '/assets/attached_assets/hero.jpg',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/hero.jpg', caption: 'From cliffside infinity pools to historic townhouses', required: true },
      { type: 'h1', text: 'Where to Stay: Curated Stays & Neighborhood Guide', required: true },
      { type: 'p', text: 'An honest review of luxury resorts, boutique city hotels, and serene countryside hideaways across the best neighborhoods.' },
      { type: 'hotel', kicker: 'Ultra Luxury Pick', name: 'Amanpuri Coastal Haven', loc: 'North Beach Cliff', price: '₹24,000/night', nights: '3 nights', desc: 'Private plunge pools, world-class spa facilities, and secluded beach access.' },
      { type: 'hotel', kicker: 'Boutique Heritage', name: 'Villa San Marco', loc: 'Old Town Quarter', price: '₹6,800/night', nights: '2 nights', desc: '17th-century courtyard architecture with contemporary luxury comforts.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Neighborhood 1: The Historic District', loc: 'Walkability 10/10', body: 'Best for first-time visitors who want historic sights, cafes, and museums right outside their doorstep.' },
          { n: 2, title: 'Neighborhood 2: The Beachfront Riviera', loc: 'Relaxation 10/10', body: 'Best for travelers seeking ocean sounds, seafood dining, and watersports.' },
        ],
      },
    ],
  },
];

// ─── GROUP D — DISCOVERY AND EXPERIENCE ───────────────────────────────────────
export const GROUP_D_TEMPLATES: BlogTemplateDefinition[] = [
  {
    id: 'food-flavours',
    name: '16. Food & Local Flavours',
    description: 'Culinary journey: street food, signature dishes, morning markets, and celebrated eateries.',
    thumbnail: '/assets/attached_assets/culinary_bali.jpg',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/culinary_bali.jpg', caption: 'Fragrant spices and fresh farm-to-table cuisine', required: true },
      { type: 'h1', text: 'The Culinary Map: Signature Dishes & Night Markets', required: true },
      { type: 'p', text: 'An aromatic exploration of street food stalls, heritage eateries, morning markets, and celebrated culinary customs.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Must-Try Dish 1: Slow-Braised Heritage Stew', loc: 'Morning Market Stalls', body: 'Simmered with lemongrass, galangal, and fresh coconut cream for over eight hours.' },
          { n: 2, title: 'Must-Try Dish 2: Charred Seafood with Chili-Lime Glaze', loc: 'Harbor Grills', body: 'Caught by local fishermen at dawn and grilled over open coconut husk charcoals.' },
          { n: 3, title: 'Must-Try Dish 3: Palm Sugar & Coconut Rice Dessert', loc: 'Night Street Vendors', body: 'Warm sweet sticky rice served in banana leaves with fresh toasted sesame.' },
        ],
      },
      {
        type: 'gallery',
        images: [
          '/assets/attached_assets/culinary_thai.jpg',
          '/assets/attached_assets/culinary_italy.jpg',
          '/assets/attached_assets/culinary_vietnam.jpg',
        ],
      },
      { type: 'h2', text: 'Top Night Markets for Street Food Lovers' },
      { type: 'p', text: 'Arrive around 06:30 PM just as stalls light their lanterns. Bring small cash denominations and look for stalls with the longest local queues.' },
    ],
  },
  {
    id: 'adventure-expedition',
    name: '17. Adventure Expedition',
    description: 'Thrilling pursuits: treks, climbs, dive sites, trail difficulty, gear specs, and safety.',
    thumbnail: '/assets/attached_assets/exp-thailand.png',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/exp-thailand.png', caption: 'High-altitude ridges and wilderness trails', required: true },
      { type: 'h1', text: 'The Summit Trail: An Adventure Expedition Guide', required: true },
      { type: 'p', text: 'A challenging outdoor guide covering trail difficulty ratings, required equipment, weather precautions, and panoramic checkpoints.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Trailhead Departure: The Lowland Forest', loc: 'Elevation: 400m — Difficulty: Moderate', body: 'Begin through temperate canopy forest. Well-marked trail with stone switchbacks.' },
          { n: 2, title: 'Ridge Push: The Granite Slabs', loc: 'Elevation: 1,800m — Difficulty: Strenuous', body: 'Steep incline requiring sturdy hiking boots with ankle support. High wind exposure.' },
          { n: 3, title: 'The Summit Caldera: 360° Cloud Inversion', loc: 'Elevation: 2,400m — Summit Glory', body: 'Reach the summit at sunrise for dramatic views above the ocean of clouds.' },
        ],
      },
      {
        type: 'map',
        pins: [
          { x: 20, y: 75, label: 'Trailhead 400m' },
          { x: 50, y: 45, label: 'Ridge Camp 1800m' },
          { x: 80, y: 20, label: 'Summit Peak 2400m' },
        ],
      },
      { type: 'h2', text: 'Essential Expedition Gear Checklist' },
      { type: 'p', text: 'Waterproof outer shell, 2.5L water bladder, thermal layer, headlamp with spare batteries, and offline GPS maps.' },
    ],
  },
  {
    id: 'beaches-islands',
    name: '18. Beaches & Island Hopping',
    description: 'Coastal adventures: hidden coves, boat transfers, reef spots, and island-hopping routes.',
    thumbnail: '/assets/attached_assets/thailand-personal-final-1.jpg',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/thailand-personal-final-1.jpg', caption: 'Crystal turquoise waters and limestone karst islands', required: true },
      { type: 'h1', text: 'Island Hopping: Secret Coves & Coral Shores', required: true },
      { type: 'p', text: 'Sailing between emerald lagoons, secret white-sand beaches, vibrant coral reefs, and sun-drenched coastal villages.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Island 1: The Emerald Lagoon', loc: 'Accessible by Longtail Boat', body: 'Enclosed by sheer 100-meter karst cliffs. Pristine visibility for snorkeling with sea turtles.' },
          { n: 2, title: 'Island 2: Sunset Bay & Coral Sand Spit', loc: 'West Reef Terminal', body: 'A narrow sandbar connecting two forested islets that emerges fully at low tide.' },
          { n: 3, title: 'Island 3: Fisherman’s Cove & Floating Pier', loc: 'Southern Bay', body: 'Dine on grilled snapper right on the floating wooden pier as traditional longtail boats drift past.' },
        ],
      },
      {
        type: 'gallery',
        images: [
          '/assets/attached_assets/bali_replacement_8.jpg',
          '/assets/attached_assets/bali_replacement_9.jpg',
        ],
      },
      { type: 'h2', text: 'Boat Charter Tips & Marine Conservation' },
      { type: 'p', text: 'Hire registered boat captains and ensure your sunscreen is certified reef-safe (oxybenzone-free) to protect delicate coral reefs.' },
    ],
  },
  {
    id: 'hidden-gems',
    name: '19. Hidden Gems',
    description: 'Off-the-beaten-path discoveries: uncrowded viewpoints, secret alleys, and local favorites.',
    thumbnail: '/assets/attached_assets/japan_serene_1780482413728.png',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/japan_serene_1780482413728.png', caption: 'A secluded bamboo forest path where few tourists venture', required: true },
      { type: 'h1', text: 'Undiscovered: Secret Corners & Hidden Gems', required: true },
      { type: 'p', text: 'Stepping off the beaten tourist path to uncover quiet sanctuaries, secret viewpoints, family-run workshops, and secluded coves.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Secret Overlook: The Forgotten Monastery Ruins', loc: '15-min walk past Main Trail', body: 'While crowds queue at the main pagoda, this 14th-century hillside ruin offers total peace and identical vistas.' },
          { n: 2, title: 'Hidden Courtyard Cafe & Bookshop', loc: 'Old Town Lane 4', body: 'Tucked behind an unmarked carved wooden door, serving single-origin mountain roasts in a tranquil garden.' },
          { n: 3, title: 'The Hidden Sea Cave Beach', loc: 'Low Tide Access Only', body: 'A natural tunnel through sea cliffs opening onto a private pocket beach with sparkling turquoise pools.' },
        ],
      },
      { type: 'quote', text: 'The real voyage of discovery consists not in seeking new landscapes, but in having new eyes.', cite: 'Marcel Proust' },
    ],
  },
  {
    id: 'seasonal-guide',
    name: '20. Seasonal Travel Guide',
    description: 'Weather and timing handbook: peak vs shoulder seasons, festivals, rainfall, and packing.',
    thumbnail: '/assets/attached_assets/japan-tourism-1.jpg',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/japan-tourism-1.jpg', caption: 'Autumn colors painting temple gardens in vermilion and gold', required: true },
      { type: 'h1', text: 'When to Visit: The Four Seasons Climate & Planning Guide', required: true },
      { type: 'p', text: 'Detailed month-by-month weather analysis, seasonal festival calendars, rainfall patterns, and crowd level breakdowns.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Spring (March – May): Wildflowers & Mild Breezes', loc: 'Shoulder Season — Great Value', body: 'Crisp pleasant days, blooming hillside gardens, and moderate crowd levels. Ideal for walking and cycling tours.' },
          { n: 2, title: 'Summer (June – August): Peak Sun & Coastal Energy', loc: 'High Season — Vibrant & Busy', body: 'Long sunny days, vibrant beach clubs, and festive evening markets. Pre-booking 2 months ahead is essential.' },
          { n: 3, title: 'Autumn (September – November): Golden Foliage & Harvest Season', loc: 'Editor’s Choice — Best Experience', body: 'Sublime temperatures, spectacular foliage colors, lower accommodation rates, and harvest festivals.' },
          { n: 4, title: 'Winter (December – February): Crisp Skies & Mountain Retreats', loc: 'Low Season — Peaceful Reset', body: 'Snowcapped peaks, cozy fire-lit taverns, and zero tourist lines at famous galleries.' },
        ],
      },
      { type: 'h2', text: 'The Shoulder Season Secret' },
      { type: 'p', text: 'Visiting during late October or early May provides 90% of peak weather with 40% lower hotel rates.' },
    ],
  },
];

// ─── GROUP E — DECISION SUPPORT AND INTERACTIVE GUIDES ────────────────────────
export const GROUP_E_TEMPLATES: BlogTemplateDefinition[] = [
  {
    id: 'destination-comparison',
    name: '21. Destination Comparison',
    description: 'Head-to-head evaluation: comparing two places on budget, beaches, nightlife, and culture.',
    thumbnail: '/assets/attached_assets/culinary_italy.jpg',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/culinary_italy.jpg', caption: 'Comparing two iconic destinations across culture, budget, and lifestyle', required: true },
      { type: 'h1', text: 'Destination Comparison: Which Trip is Right for You?', required: true },
      { type: 'p', text: 'Can’t decide between Destination A and Destination B? We evaluate budgets, beaches, culinary scenes, and access to help you choose.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Scenery & Atmosphere Comparison', body: 'Destination A offers rugged mountain cliffs and medieval architecture; Destination B specializes in tropical palm-fringed sands and coral bays.' },
          { n: 2, title: 'Average Daily Spending & Hotel Rates', body: 'Destination A is ideal for mid-to-luxury budgets (₹8,000–₹15,000/day); Destination B offers outstanding luxury value for budget-conscious travelers (₹3,500–₹7,000/day).' },
          { n: 3, title: 'Food, Dining & Nightlife Scene', body: 'Destination A boasts Michelin-star bistros and wine cellars; Destination B dominates with street food markets and beachfront sunset bars.' },
        ],
      },
      { type: 'h2', text: 'The Verdict: Who Should Choose Which Destination' },
      { type: 'p', text: 'Choose Destination A if you crave historic walks, architecture, and romantic wine dinners. Choose Destination B if you want warm seas, tropical adventure, and relaxed island days.' },
    ],
  },
  {
    id: 'things-to-do',
    name: '22. Things to Do Explorer',
    description: 'Curated countdown of top activities, landmarks, unique experiences, and attractions.',
    thumbnail: '/assets/attached_assets/exp-dubai.jpg',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/exp-dubai.jpg', caption: 'From architectural wonders to desert safaris', required: true },
      { type: 'h1', text: 'Top Experiences & Things to Do: The Essential Countdown', required: true },
      { type: 'p', text: 'A curated countdown of unforgettable attractions, cultural activities, and signature adventures.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: '01. Watch Sunrise from the Highest Observatory', loc: 'City Center Tower', body: 'Catch the 06:00 AM elevator for panoramic sunrise views above the morning cloud layer.' },
          { n: 2, title: '02. Sail Through the Mangrove Lagoons by Kayak', loc: 'Eastern Estuary', body: 'Guided paddle tour through serene mangrove channels teeming with herons and flamingos.' },
          { n: 3, title: '03. Savor Traditional Tasting Platters at Spice Souk', loc: 'Old Trading Wharf', body: 'Sample artisanal saffron, cardamom dates, and freshly ground Arabian coffees.' },
          { n: 4, title: '04. Sunset Dune Drive & Bedouin Camp Dinner', loc: 'Red Sand Dunes', body: 'Thrilling off-road desert drive followed by an authentic starlit dinner in the desert.' },
        ],
      },
      {
        type: 'map',
        pins: [
          { x: 35, y: 40, label: 'Highest Observatory' },
          { x: 65, y: 55, label: 'Mangrove Lagoons' },
          { x: 25, y: 65, label: 'Old Spice Souk' },
          { x: 80, y: 35, label: 'Red Sand Dunes' },
        ],
      },
    ],
  },
  {
    id: 'traveller-checklist',
    name: "23. Traveller's Checklist",
    description: 'Preparation and readiness guide: packing lists, visa rules, currency, apps, and health.',
    thumbnail: '/assets/attached_assets/dest-thailand.png',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/dest-thailand.png', caption: 'Travel preparation made effortless and systematic', required: true },
      { type: 'h1', text: 'Pre-Departure Readiness: The Complete Traveler’s Checklist', required: true },
      { type: 'p', text: 'Everything you need to check off before you head to the departure gate: visas, adapters, packing essentials, and apps.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Passport Validity & Electronic Visa Entry', body: 'Ensure passport has at least 6 months validity from return date and 2 blank pages. Complete online arrival declarations 48 hours before flying.' },
          { n: 2, title: 'Universal Power Adapters & Portable Power Banks', body: 'Type C and G sockets are standard. Carry a 10,000mAh battery pack in carry-on luggage (never check power banks).' },
          { n: 3, title: 'Prescription Medicines & Health Documentation', body: 'Carry original prescription packaging. Bring a compact first-aid kit with electrolytes, antihistamines, and motion sickness tablets.' },
          { n: 4, title: 'Financial Cards & Travel Insurance Policy', body: 'Notify banks of foreign transactions. Keep a digital PDF copy of your comprehensive medical and travel insurance policy on your phone.' },
        ],
      },
      { type: 'h2', text: 'Crucial Mobile Apps to Download Offline' },
      { type: 'p', text: 'Download offline Google Maps of your destination city, Google Translate language packages, and the local rideshare app.' },
    ],
  },
  {
    id: 'faq-guide',
    name: '24. Frequently Asked Questions Guide',
    description: 'Question-first guide answering the most common queries, safety notes, and planning concerns.',
    thumbnail: '/assets/attached_assets/exp-tokyo.jpg',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/exp-tokyo.jpg', caption: 'Clear answers to every common question travelers ask', required: true },
      { type: 'h1', text: 'Everything You Need to Know: Complete Travel FAQ', required: true },
      { type: 'p', text: 'Direct, expert answers to the most common traveler questions: safety, cash vs cards, tipping, tap water, and local customs.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Is the destination safe for solo and female travelers?', body: 'Yes, violent crime rates are exceptionally low. Common precautions against pickpocketing in crowded transit hubs apply.' },
          { n: 2, title: 'Do I need local currency cash or can I pay by card?', body: 'Cards are accepted at 90% of stores and restaurants. It is wise to carry ₹2,000–₹3,000 cash for small street vendors and tips.' },
          { n: 3, title: 'What is the tipping etiquette in cafes and taxis?', body: 'Tipping is not mandatory. Rounding up taxi fares or leaving 5–10% in sit-down restaurants for good service is appreciated.' },
          { n: 4, title: 'What should I wear when visiting cultural monuments?', body: 'Modest attire covering shoulders and knees is strictly required at religious sanctuaries. Carry a light scarf in your daypack.' },
        ],
      },
      { type: 'p', text: 'Still have specific questions? Contact our PlumTrips travel concierge team for personalized advice.' },
    ],
  },
  {
    id: 'field-guide',
    name: '25. Destination Field Guide',
    description: 'Comprehensive field handbook: orientation, culture, navigation, stays, and essential rules.',
    thumbnail: '/assets/attached_assets/culinary_vietnam.jpg',
    blocks: [
      { type: 'cover', src: '/assets/attached_assets/culinary_vietnam.jpg', caption: 'The ultimate reference manual for cultural orientation and navigation', required: true },
      { type: 'h1', text: 'Destination Field Guide: Comprehensive Country Dossier', required: true },
      { type: 'p', text: 'An all-encompassing reference handbook: geographic orientation, cultural etiquette, transit hubs, top stays, and regional highlights.' },
      {
        type: 'numlist',
        items: [
          { n: 1, title: 'Geographic Orientation & Main Hubs', loc: 'Dossier Section 1', body: 'The country spans three distinct topographical regions: northern alpine peaks, central agricultural river basins, and the southern tropical coastline.' },
          { n: 2, title: 'Cultural Etiquette & Local Laws', loc: 'Dossier Section 2', body: 'Always greet with palms pressed together and a gentle nod. Never touch anyone’s head or point your feet directly at sacred statues.' },
          { n: 3, title: 'Key Transport Gateways & Hubs', loc: 'Dossier Section 3', body: 'Main international flights land at Terminal 1. High-speed rail connects all provincial capitals in under 3 hours.' },
        ],
      },
      { type: 'hotel', kicker: 'Field Recommendation', name: 'Imperial Heritage Palace', loc: 'Capital Center', price: '₹11,000/night', desc: 'Historic 5-star base with concierge desk.' },
      {
        type: 'map',
        pins: [
          { x: 30, y: 25, label: 'Northern Alpine Peaks' },
          { x: 55, y: 50, label: 'Capital Center' },
          { x: 75, y: 80, label: 'Southern Coastline' },
        ],
      },
    ],
  },
];



export const FORMAT_GALLERY_INFO: Record<Exclude<BlogFormat, 'blank'>, { title: string; subtitle: string }> = {
  'editorial-destination': {
    title: 'Editorial & Destination Guides',
    subtitle: 'Magazine-style narratives, day-by-day itineraries, visual journeys, scenic road trips, and smart travel handbooks.',
  },
  'photography-narrative': {
    title: 'Photography & Narrative Stories',
    subtitle: 'Cinematic wide-bleed spreads, photo essays, travel diaries, cultural heritage features, and nature expeditions.',
  },
  'practical-planning': {
    title: 'Itinerary Planners & City Guides',
    subtitle: 'Master multi-day itineraries, weekend city breaks, cost breakdowns, transit hubs, and curated stays.',
  },
  'discovery-experience': {
    title: 'Discoveries & Local Experiences',
    subtitle: 'Culinary dining scenes, outdoor adventure expeditions, coastal island hopping, hidden gems, and seasonal travel.',
  },
  'decision-interactive': {
    title: 'Things To Do & Decision Guides',
    subtitle: 'Curated activity countdowns, side-by-side comparisons, packing checklists, traveler FAQs, and field dossiers.',
  },
};

export const STORY_STYLE_LABELS: Record<StoryStyle, string> = {
  'editorial-journal': 'Editorial Journal',
  'day-by-day': 'Day-by-Day Explorer',
  'visual-journey': 'Visual Journey',
  'route-explorer': 'Route Explorer',
  'smart-travel': 'Smart Travel Guide',
  'cinematic-destination': 'Cinematic Destination',
  'photo-essay': 'Photo Essay',
  'travel-diary': 'Travel Diary',
  'culture-heritage': 'Culture & Heritage',
  'nature-wildlife': 'Nature & Wildlife',
  'budget-breakdown': 'Budget Breakdown',
  'itinerary-planner': 'Ultimate Itinerary Planner',
  'weekend-escape': 'Weekend Escape',
  'transport-guide': 'Transport & Getting There',
  'stay-guide': 'Accommodation & Stay Guide',
  'food-flavours': 'Food & Local Flavours',
  'adventure-expedition': 'Adventure Expedition',
  'beaches-islands': 'Beaches & Island Hopping',
  'hidden-gems': 'Hidden Gems',
  'seasonal-guide': 'Seasonal Travel Guide',
  'destination-comparison': 'Destination Comparison',
  'things-to-do': 'Things to Do Explorer',
  'traveller-checklist': "Traveller's Checklist",
  'faq-guide': 'FAQ Guide',
  'field-guide': 'Destination Field Guide',
};

export const TEMPLATE_AUTHORING_PROFILES: Record<string, TemplateAuthoringProfile> = {
  'editorial-journal': {
    purpose: 'Magazine-style article with an editorial headline, large hero photograph, strong introduction, refined typography, pull quotes, and immersive narrative sections.',
    contentDensity: 'balanced',
    imageStrategy: 'balanced',
    editorialRhythm: 'editorial',
    recommendedTextRange: { minWords: 80, maxWords: 200 },
    recommendedImageCount: { min: 2, max: 5 },
    recommendedListDensity: { minItems: 2, maxItems: 6 },
    sectionGuidance: { required: ['cover', 'h1'], recommended: ['p', 'quote', 'h2', 'image', 'newsletter'] },
  },
  'day-by-day': {
    purpose: 'A chronological itinerary with day markers, timelines, daily highlights, activities, photographs, and practical notes.',
    contentDensity: 'dense',
    imageStrategy: 'balanced',
    editorialRhythm: 'chronological',
    recommendedTextRange: { minWords: 50, maxWords: 150 },
    recommendedImageCount: { min: 2, max: 6 },
    recommendedListDensity: { minItems: 3, maxItems: 8 },
    sectionGuidance: { required: ['cover', 'h1', 'numlist'], recommended: ['map', 'h2', 'p'] },
  },
  'visual-journey': {
    purpose: 'A photography-led story where large images, diptych spreads, galleries, captions, and short descriptive passages drive the narrative.',
    contentDensity: 'light',
    imageStrategy: 'gallery-heavy',
    editorialRhythm: 'visual',
    recommendedTextRange: { minWords: 30, maxWords: 80 },
    recommendedImageCount: { min: 4, max: 12 },
    sectionGuidance: { required: ['cover', 'h1', 'gallery'], recommended: ['quote', 'p'] },
  },
  'route-explorer': {
    purpose: 'A route-focused article with ordered stops, route overview, travel transitions, distances, and waypoint notes.',
    contentDensity: 'balanced',
    imageStrategy: 'balanced',
    editorialRhythm: 'waypoint',
    recommendedListDensity: { minItems: 3, maxItems: 8 },
    sectionGuidance: { required: ['cover', 'h1', 'numlist', 'map'], recommended: ['p', 'h2'] },
  },
  'smart-travel': {
    purpose: 'A practical destination guide organized around essential facts, planning tips, transport, accommodation, and useful FAQs.',
    contentDensity: 'dense',
    imageStrategy: 'text-led',
    editorialRhythm: 'practical',
    sectionGuidance: { required: ['cover', 'h1'], recommended: ['hotel', 'numlist', 'h2', 'p'] },
  },
  'cinematic-destination': {
    purpose: 'A dramatic, immersive design with an oversized hero, full-bleed image sections, restrained overlays, and chapter-like transitions.',
    contentDensity: 'light',
    imageStrategy: 'image-led',
    editorialRhythm: 'cinematic',
    sectionGuidance: { required: ['cover', 'h1'], recommended: ['image', 'gallery', 'quote', 'p'] },
  },
  'photo-essay': {
    purpose: 'A sequence of photographs with meaningful captions and concise storytelling.',
    contentDensity: 'light',
    imageStrategy: 'gallery-heavy',
    editorialRhythm: 'visual',
    sectionGuidance: { required: ['cover', 'h1', 'gallery'], recommended: ['p', 'quote'] },
  },
  'travel-diary': {
    purpose: 'A chronological first-person journal with dated entries, personal observations, and contextual photographs.',
    contentDensity: 'balanced',
    imageStrategy: 'balanced',
    editorialRhythm: 'diary',
    sectionGuidance: { required: ['cover', 'h1', 'numlist'], recommended: ['quote', 'image', 'p'] },
  },
  'culture-heritage': {
    purpose: 'A structured cultural feature with historical context, traditions, landmarks, and explanatory sections.',
    contentDensity: 'dense',
    imageStrategy: 'balanced',
    editorialRhythm: 'heritage',
    sectionGuidance: { required: ['cover', 'h1'], recommended: ['h2', 'p', 'image', 'numlist'] },
  },
  'nature-wildlife': {
    purpose: 'A nature-focused design featuring landscape photography, habitat context, observation notes, and responsible-travel guidance.',
    contentDensity: 'balanced',
    imageStrategy: 'image-led',
    editorialRhythm: 'ecological',
    sectionGuidance: { required: ['cover', 'h1'], recommended: ['numlist', 'gallery', 'p'] },
  },
  'budget-breakdown': {
    purpose: 'A cost-oriented guide with categorized expenses, budget tables, cost assumptions, and money-saving suggestions.',
    contentDensity: 'dense',
    imageStrategy: 'text-led',
    editorialRhythm: 'analytical',
    sectionGuidance: { required: ['cover', 'h1', 'numlist'], recommended: ['h2', 'p'] },
  },
  'itinerary-planner': {
    purpose: 'A detailed multi-day or multi-stop itinerary with schedules, activities, transitions, and practical notes.',
    contentDensity: 'dense',
    imageStrategy: 'balanced',
    editorialRhythm: 'chronological',
    sectionGuidance: { required: ['cover', 'h1', 'numlist'], recommended: ['hotel', 'map', 'p'] },
  },
  'weekend-escape': {
    purpose: 'A compact 48–72 hour short-trip guide organized by Friday arrival, Saturday activities, and Sunday departure.',
    contentDensity: 'balanced',
    imageStrategy: 'balanced',
    editorialRhythm: 'compact',
    sectionGuidance: { required: ['cover', 'h1', 'numlist'], recommended: ['hotel', 'p'] },
  },
  'transport-guide': {
    purpose: 'A transport-focused guide explaining available travel modes, route choices, transfer points, and transit logistics.',
    contentDensity: 'dense',
    imageStrategy: 'text-led',
    editorialRhythm: 'transit',
    sectionGuidance: { required: ['cover', 'h1', 'numlist', 'map'], recommended: ['p', 'h2'] },
  },
  'stay-guide': {
    purpose: 'A stay-oriented article with accommodation categories, location context, comparison tables, and curated properties.',
    contentDensity: 'balanced',
    imageStrategy: 'image-led',
    editorialRhythm: 'hospitality',
    sectionGuidance: { required: ['cover', 'h1', 'hotel'], recommended: ['numlist', 'p'] },
  },
  'food-flavours': {
    purpose: 'A culinary travel story featuring dishes, local food experiences, market photography, and practical dining advice.',
    contentDensity: 'balanced',
    imageStrategy: 'image-led',
    editorialRhythm: 'culinary',
    sectionGuidance: { required: ['cover', 'h1', 'numlist'], recommended: ['gallery', 'p', 'h2'] },
  },
  'adventure-expedition': {
    purpose: 'An activity-led article with preparation, difficulty, equipment, safety considerations, and route notes.',
    contentDensity: 'balanced',
    imageStrategy: 'balanced',
    editorialRhythm: 'adventure',
    sectionGuidance: { required: ['cover', 'h1', 'numlist'], recommended: ['map', 'h2', 'p'] },
  },
  'beaches-islands': {
    purpose: 'A coastal travel design with island or beach sections, beach galleries, transfer information, and reef tips.',
    contentDensity: 'light',
    imageStrategy: 'gallery-heavy',
    editorialRhythm: 'coastal',
    sectionGuidance: { required: ['cover', 'h1', 'numlist'], recommended: ['gallery', 'p', 'h2'] },
  },
  'hidden-gems': {
    purpose: 'A discovery-focused article introducing lesser-known places, explaining what makes each special, and how to reach them.',
    contentDensity: 'balanced',
    imageStrategy: 'balanced',
    editorialRhythm: 'discovery',
    sectionGuidance: { required: ['cover', 'h1', 'numlist'], recommended: ['image', 'quote', 'p'] },
  },
  'seasonal-guide': {
    purpose: 'A season-based guide organized around weather, suitable activities, seasonal experiences, and timing.',
    contentDensity: 'balanced',
    imageStrategy: 'balanced',
    editorialRhythm: 'seasonal',
    sectionGuidance: { required: ['cover', 'h1', 'numlist'], recommended: ['h2', 'p'] },
  },
  'destination-comparison': {
    purpose: 'A comparison-driven article with structured criteria, side-by-side cards, and decision factors.',
    contentDensity: 'dense',
    imageStrategy: 'balanced',
    editorialRhythm: 'comparison',
    sectionGuidance: { required: ['cover', 'h1', 'numlist'], recommended: ['h2', 'p'] },
  },
  'things-to-do': {
    purpose: 'An activity catalogue with grouped experiences, descriptive countdown cards, and attractions.',
    contentDensity: 'balanced',
    imageStrategy: 'balanced',
    editorialRhythm: 'countdown',
    sectionGuidance: { required: ['cover', 'h1', 'numlist'], recommended: ['map', 'image', 'p'] },
  },
  'traveller-checklist': {
    purpose: 'A preparation-oriented guide featuring packing lists, booking reminders, documents, and readiness checklists.',
    contentDensity: 'dense',
    imageStrategy: 'text-led',
    editorialRhythm: 'checklist',
    sectionGuidance: { required: ['cover', 'h1', 'numlist'], recommended: ['h2', 'p'] },
  },
  'faq-guide': {
    purpose: 'A question-led article with clearly organized answers, supporting explanations, and jump navigation.',
    contentDensity: 'dense',
    imageStrategy: 'text-led',
    editorialRhythm: 'faq',
    sectionGuidance: { required: ['cover', 'h1', 'numlist'], recommended: ['p'] },
  },
  'field-guide': {
    purpose: 'A comprehensive reference-style article with destination overview, key locations, transport, stays, and dossiers.',
    contentDensity: 'dense',
    imageStrategy: 'balanced',
    editorialRhythm: 'dossier',
    sectionGuidance: { required: ['cover', 'h1', 'numlist'], recommended: ['hotel', 'map', 'p'] },
  },
};

export const TEMPLATE_DEFAULTS: Record<Exclude<BlogFormat, 'blank'>, Pick<BlogTemplateDefinition, 'typography' | 'layout'>> = {
  'editorial-destination': {
    typography: {
      headingFontFamily: 'plumtrips-editorial',
      bodyFontFamily: 'georgia',
      h1Size: 'xl',
      h2Size: 'large',
      h3Size: 'normal',
      bodyTextSize: 'normal',
      headingWeight: 600,
      bodyWeight: 400,
      lineHeight: 'relaxed',
      letterSpacing: 'normal',
      headingColor: 'heading',
      bodyColor: 'default',
      accentColor: 'accent',
      textAlignment: 'left',
    },
    layout: {
      contentWidth: 'wide',
      imageWidth: 'wide',
      imageAlignment: 'center',
      textAlignment: 'left',
      sectionSpacing: 'relaxed',
      imageTextSpacing: 'standard',
      sidebar: 'none',
    },
  },
  'photography-narrative': {
    typography: {
      headingFontFamily: 'plumtrips-editorial',
      bodyFontFamily: 'georgia',
      h1Size: 'xl',
      h2Size: 'large',
      h3Size: 'normal',
      bodyTextSize: 'large',
      headingWeight: 500,
      bodyWeight: 400,
      lineHeight: 'relaxed',
      letterSpacing: 'wide',
      headingColor: 'heading',
      bodyColor: 'default',
      accentColor: 'accent',
      textAlignment: 'left',
    },
    layout: {
      contentWidth: 'wide',
      imageWidth: 'full',
      imageAlignment: 'full',
      textAlignment: 'left',
      sectionSpacing: 'relaxed',
      imageTextSpacing: 'relaxed',
      sidebar: 'none',
    },
  },
  'practical-planning': {
    typography: {
      headingFontFamily: 'plumtrips-editorial',
      bodyFontFamily: 'arial',
      h1Size: 'xl',
      h2Size: 'large',
      h3Size: 'normal',
      bodyTextSize: 'normal',
      headingWeight: 700,
      bodyWeight: 400,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      headingColor: 'heading',
      bodyColor: 'default',
      accentColor: 'accent',
      textAlignment: 'left',
    },
    layout: {
      contentWidth: 'standard',
      imageWidth: 'wide',
      imageAlignment: 'center',
      textAlignment: 'left',
      sectionSpacing: 'standard',
      imageTextSpacing: 'standard',
      sidebar: 'none',
    },
  },
  'discovery-experience': {
    typography: {
      headingFontFamily: 'plumtrips-editorial',
      bodyFontFamily: 'arial',
      h1Size: 'xl',
      h2Size: 'large',
      h3Size: 'normal',
      bodyTextSize: 'normal',
      headingWeight: 600,
      bodyWeight: 400,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      headingColor: 'heading',
      bodyColor: 'default',
      accentColor: 'accent',
      textAlignment: 'left',
    },
    layout: {
      contentWidth: 'wide',
      imageWidth: 'wide',
      imageAlignment: 'center',
      textAlignment: 'left',
      sectionSpacing: 'standard',
      imageTextSpacing: 'standard',
      sidebar: 'none',
    },
  },
  'decision-interactive': {
    typography: {
      headingFontFamily: 'plumtrips-editorial',
      bodyFontFamily: 'tahoma',
      h1Size: 'large',
      h2Size: 'normal',
      h3Size: 'normal',
      bodyTextSize: 'normal',
      headingWeight: 700,
      bodyWeight: 400,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      headingColor: 'heading',
      bodyColor: 'default',
      accentColor: 'accent',
      textAlignment: 'left',
    },
    layout: {
      contentWidth: 'standard',
      imageWidth: 'standard',
      imageAlignment: 'center',
      textAlignment: 'left',
      sectionSpacing: 'compact',
      imageTextSpacing: 'standard',
      sidebar: 'none',
    },
  },
};

export const addTemplateDefaults = (
  format: Exclude<BlogFormat, 'blank'>,
  template: BlogTemplateDefinition,
): BlogTemplateDefinition => ({
  ...template,
  profile: template.profile ?? TEMPLATE_AUTHORING_PROFILES[template.id] ?? undefined,
  typography: template.typography ?? TEMPLATE_DEFAULTS[format].typography,
  layout: template.layout ?? TEMPLATE_DEFAULTS[format].layout,
});

export const TEMPLATES_BY_FORMAT: Record<Exclude<BlogFormat, 'blank'>, BlogTemplateDefinition[]> = {
  'editorial-destination': GROUP_A_TEMPLATES.map((t) => addTemplateDefaults('editorial-destination', t)),
  'photography-narrative': GROUP_B_TEMPLATES.map((t) => addTemplateDefaults('photography-narrative', t)),
  'practical-planning': GROUP_C_TEMPLATES.map((t) => addTemplateDefaults('practical-planning', t)),
  'discovery-experience': GROUP_D_TEMPLATES.map((t) => addTemplateDefaults('discovery-experience', t)),
  'decision-interactive': GROUP_E_TEMPLATES.map((t) => addTemplateDefaults('decision-interactive', t)),
};

export const ALL_25_TEMPLATES: BlogTemplateDefinition[] = [
  ...TEMPLATES_BY_FORMAT['editorial-destination'],
  ...TEMPLATES_BY_FORMAT['photography-narrative'],
  ...TEMPLATES_BY_FORMAT['practical-planning'],
  ...TEMPLATES_BY_FORMAT['discovery-experience'],
  ...TEMPLATES_BY_FORMAT['decision-interactive'],
];

export const STORY_STYLE_TO_FORMAT: Record<StoryStyle, Exclude<BlogFormat, 'blank'>> = {
  'editorial-journal': 'editorial-destination',
  'day-by-day': 'editorial-destination',
  'visual-journey': 'editorial-destination',
  'route-explorer': 'editorial-destination',
  'smart-travel': 'editorial-destination',
  'cinematic-destination': 'photography-narrative',
  'photo-essay': 'photography-narrative',
  'travel-diary': 'photography-narrative',
  'culture-heritage': 'photography-narrative',
  'nature-wildlife': 'photography-narrative',
  'budget-breakdown': 'practical-planning',
  'itinerary-planner': 'practical-planning',
  'weekend-escape': 'practical-planning',
  'transport-guide': 'practical-planning',
  'stay-guide': 'practical-planning',
  'food-flavours': 'discovery-experience',
  'adventure-expedition': 'discovery-experience',
  'beaches-islands': 'discovery-experience',
  'hidden-gems': 'discovery-experience',
  'seasonal-guide': 'discovery-experience',
  'destination-comparison': 'decision-interactive',
  'things-to-do': 'decision-interactive',
  'traveller-checklist': 'decision-interactive',
  'faq-guide': 'decision-interactive',
  'field-guide': 'decision-interactive',
};

export const getTemplateDefaultsForStoryStyle = (
  storyStyle?: StoryStyle,
): Pick<BlogTemplateDefinition, 'typography' | 'layout'> => {
  const format = storyStyle ? STORY_STYLE_TO_FORMAT[storyStyle] : 'editorial-destination';
  return TEMPLATE_DEFAULTS[format || 'editorial-destination'];
};

export const getTemplateByStoryStyle = (
  storyStyle?: StoryStyle,
): BlogTemplateDefinition | undefined => {
  if (!storyStyle) return undefined;
  const format = STORY_STYLE_TO_FORMAT[storyStyle];
  if (!format) return undefined;
  return TEMPLATES_BY_FORMAT[format]?.find((t) => t.id === storyStyle);
};
