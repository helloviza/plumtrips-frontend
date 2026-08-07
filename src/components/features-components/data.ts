// ─────────────────────────────────────────────
// PlumTrips — Centralised Data & Props
// Edit content here; components stay untouched.
// ─────────────────────────────────────────────

import type {
  StatsStripProps,
  TrustBarProps,
  TrustedPartnersProps,
  TravelYourWayProps,
  TrendingDestinationProps,
  AIPlannerProps,
  CorporateTravelProps,
  TestimonialsProps,
  TravelStoriesProps,
  ConciergeCTAProps,
} from "./types";

import type { HotelCollectionsProps,
  HotelTrendingDestinationsProps,
  AIHotelFinderProps,
  ExclusiveHotelOffersProps,
  TopHotelBrandsProps,
  WhyBookWithPumTripsProps,
  HotelsByExperiencesProps,
  GuestStoriesProps,
  ExploreOnMapProps,
  NeedHelpChoosingProps,
  PumTripsPrivilegeProps } from "./types";



// ── StatsStrip ────────────────────────────────
export const statsStripProps: StatsStripProps = {
  stats: [
    { value: "50,000+", label: "Happy Travelers" },
    { value: "125+",    label: "Corporate Clients" },
    { value: "4.8/5",   label: "Average Rating" },
    { value: "30+",     label: "Countries Covered" },
    { value: "10M+",    label: "Trips Booked" },
  ],
};

// ── TrustBar ─────────────────────────────────
export const trustBarProps: TrustBarProps = {
  items: [
    { icon: "tag",      title: "Best Price Guarantee",         subtitle: "Lowest fares, always" },
    { icon: "gift",     title: "Exclusive Deals for You",       subtitle: "Member-only offers" },
    { icon: "headset",  title: "24/7 Concierge Support",        subtitle: "We're here anytime" },
    { icon: "shield",   title: "Secure Booking & Payments",     subtitle: "Bank-grade safety" },
    { icon: "calendar", title: "Flexible & Easy Cancellations", subtitle: "Plans change, we get it" },
    { icon: "star",     title: "Trusted by 50,000+",            subtitle: "Happy travelers" },
  ],
};

// ── TrustedPartners ──────────────────────────
export const trustedPartnersProps: TrustedPartnersProps = {
  heading: "Our Trusted Partners",
  logos: ["/home/airindia.png", "/home/indigo.png","/home/vistara.png", "/home/logos/spicejet.png",
     "/home/logos/akasa.png", "/home/logos/etihad.png","/home/AirAstana.jpg","/home/CandadianAirlines.jpg",
    "/home/EmirateLogo.jpg","/home/FlyDubai.jpg","/home/ITA.png","/home/JETAIR.png","/home/Lufthansa.png",
   "/home/Oman.jpg"],
};

// ── TravelYourWay ────────────────────────────
export const travelYourWayProps: TravelYourWayProps = {
  eyebrow: "TAILORED TRIPS",
  title: "Travel Your Way",
  actionLabel: "Explore all trips",
  items: [

  { name: "Honeymoon",       description: "Romantic escapes for two",        imageUrl: "https://images.openai.com/static-rsc-4/0bfm4dptZW2bxbJ0L5pAjneiOvK4WIUGEMpMBh6iDEq2nf55haMJB11jNA2h-0rkL6QPSN-h_FJpBdmoc7F9H-gjB1Uw5tgseguoI4zV5vBKa7gnVqvCCU-RfegsCQ11E8kbWqvlN1fbNx38kdkZYnlRZDX-y10XO3o660IXSampRYewF8RvXe_hk-l7G15J?purpose=fullsize" },

  { name: "Group Trip",      description: "Adventure is better together",    imageUrl: "https://images.openai.com/static-rsc-4/s65fnlwIc6WPHswWfypbdn_p0q1hsfCdKsNRz_FHicvGtStFIgPYCIsjif4xCRTIpd81g3M8kS6hbT_f34f2LxT8fBEQtNUlGEH9Dv6KcVl3YKa503_OAMcUE9FeD3_JvgY1dKOfUSziuRWn5o3Ynm-Oj6yfn1xvflbidIYQBOESSlLZb-4qb_yFDVdWhdgv?purpose=fullsize" },

  { name: "Corporate Trip",  description: "Business travel, made seamless",  imageUrl: "https://images.openai.com/static-rsc-4/vLh0Iy0R_KhOq5COIWaSmSKDYxZIf4QmDd1K6us12r7Oc6-73hIWt_N5cv5MYqN8HAunTWolIWtM4fR_5IIvyFG6B0su2x9SJ1aX8lzbPzzollW82KIYPi21Jd78hfrtMlzO_d0vFusvjS5g6tNVzXs4tejygyBgrwHro1GM9XNZGzJ1NwApfhzgbzNJAsiP?purpose=fullsize" },

  { name: "Family Vacation", description: "Memories for the whole family",   imageUrl: "https://images.openai.com/static-rsc-4/5vS8SHYTiKp18maesjjQOrR6De8hhN3oOA6WTjmLts6EId_2ZZgkQtq1xqfmMbQy0DAUjhitWuJHot7KfTu9XgytsNRGQRXyugwK6-vjoQlaoH0tHnu8SP6g-uTYMbIekZfKsl7308qrtJdSsHLkuBRT3feDa4r3bSHszQalskLIUF5DtzFcubD5CjEEsJih?purpose=fullsize" },

  { name: "Solo Adventure",  description: "Find yourself on the road",       imageUrl: "https://images.openai.com/static-rsc-4/BGoAXxX3AbrjmB0tmJ8LgxL-VEkPQ4LWVyCZB9aznsq8DtOs11Jnpx4bZuVC4-hv0Gh5_i-wo9_Ypv4rgt9kxRKTHmcslX5LTWxuXJwhzlZDMuQ6DFZc0sUtDQtPJSkUH_3YuJ6xoOzbmsq9dTbvzaxD-Y5wPqvoIlMxl7FUV3T1YE9s2HX3y-uAmU63nlJD?purpose=fullsize" },

  { name: "Luxury Escape",   description: "Indulge in the finest experiences", imageUrl: "https://images.openai.com/static-rsc-4/ILm4FHJYwtcvL6IS1mOVOTM84wEhA8kHAIeCo1q1U1byCDuZ5MQYz4KfKsAyVBLE-QO8JJ6WtEPOhlTQ_7L0Kp6tllfrpllM-8CuXK9bmA_zZeJRbQ1x4xyjA7xiwwQ8VuC0xQ_YGA6kPa2-3i3HNeCgQnqOE4kR_Dhic_YZu78X2jlgpIfy3AWo7UcNr-fC?purpose=fullsize" },

],
};

// ── TrendingDestination ──────────────────────
export const trendingDestinationProps: TrendingDestinationProps = {
  eyebrow: "TRENDING NOW",
  title: "Top Destinations",
  actionLabel: "Explore all destinations",
items: [

  { name: "Italy",       description: "Romance, art & la dolce vita",    imageUrl: "https://images.openai.com/static-rsc-4/M5FrVXHUYMJE8os1To-ubycdC1m3M-tg92fADIYrcVM4IoW536iHRkVobVRp99JCax7aS6-NSKtTUTyAey0i8G-89FzFjIydnDu74GHcU0VoiNYQtDc_aBeFxp9saHbjG-LScc_RveblgsPRS3By2DP48tHNNJ8RY4-Ypb75thsUQovu04Nx_zkUqfpAhN0p?purpose=fullsize" },

  { name: "Norway",      description: "Fjords, auroras & wild nature",    imageUrl: "https://images.openai.com/static-rsc-4/Ds9NiXlLmm8k9NCb-a3D16aQP6xAZfYs37ONyN1iQQEzgL6V_1ZmMVHSYAFSKLocYiJek0kmN6UZUik4toI6gaqMlsG9Z3VlYRT6iIWjuZGT_uejW_VHcNyTeqG9W3QxNcjSfd2-L5gI7AHZXCC4yHC0Sc1qmcuJG1xwwJFtkwptb-66dQ7_c_gFxZo37dpL?purpose=fullsize" },

  { name: "Germany",     description: "Castles, culture & cool cities",   imageUrl: "https://images.openai.com/static-rsc-4/3m0zcX_CDEXreC3UFj5TLJQHra_mpOv8fqDilL1FhNps1LoMSUXjL7eb2tHCVaE1kgWjjYM9h7520BDhpKNNGL6MkUnF2_ygbqO7b73lntCx0WaVACmxz7xlh3nXUbTB5S_GofVSlPBuVjY0tjFVyQGVUkWLhRfo9xQWr1CSKYIjMa7N6ivR0QMT2bT2BxVC?purpose=fullsize" },

  { name: "Switzerland", description: "Alpine peaks & pristine lakes",    imageUrl: "https://images.openai.com/static-rsc-4/0vxCzAWqccT_Z1_t1JzrwrmhVBTd-RtiveOlOBxlJXDxO9VbdpQ13aZDuNe79Hhc-rPD_V8nbhxAg1I9OiTGrMD1ttwy21nAhu5SqU_8yfhEI5aTL4n6UQsKgXzoJe3G-KdoNYOxajPrP0bv-Odv74vcYS5-aVqHcn0Ke2r8iFCW8dabWpNdiJlP5P4v0kWw?purpose=fullsize" },

  { name: "Bali",        description: "Temples, rice fields & surf",      imageUrl: "https://images.openai.com/static-rsc-4/9Ntrk_pD08lcd2T4h3SAidaL7Keuws5lhoWbtzwVmexqUweGQzi7zX-hoOavJpd8HigrhcK5h61eNk2H3u4wBXaGLRJkfAH9nktbC3iUqVnKvEUyjsbdZWdnBRL9MQSBvzbXdq_xVHIrWsGcYIwXPyOhlVabheC-ByjKAG2Iq1i--tCpwvJ5YIGwNbu9Lwmi?purpose=fullsize" },

  { name: "Morocco",     description: "Desert, souks & vibrant color",    imageUrl: "https://images.openai.com/static-rsc-4/xbAMXdWkiNjdmekBtvgzm8ByRdNzDFannbWOBGhosH6QFIPBr4GnfhH9ImqC_OpdP7CgM5F7H-PIoP4IMHX6F4H3VmVyjDA0mpDp2VvrM_xteLokwBlDveoW55FqXandeoeL_EI8FMvFl2CsqD0dicYuuWTqk2LF15oaNJ5Dbx5yIPCKctQnBjlugRIM7mEk?purpose=fullsize" },

],

};

// ── AIPlanner ────────────────────────────────
export const aiPlannerProps: AIPlannerProps = {
  badge: " AI Trip Planner",
  title: "Not sure where to go?",
  subtitle: "Let AI plan the perfect trip for you — based on your budget, vibe and dates.",
  fields: [
    { name: "destination", label: "Where do you want to go?", placeholder: "e.g. Switzerland", fullWidth: true },
    { name: "departureCity", label: "Departure city", placeholder: "e.g. Mumbai" },
    { name: "phoneNumber", label: "Phone Number", placeholder: "e.g. 9876543210" },
    { name: "budget", label: "Budget", placeholder: "75000", isCurrency: true },
    { name: "duration", label: "Duration", placeholder: "2026-08-08 to 2026-08-15" },
    { name: "travelers", label: "Travelers", placeholder: "1 Adults with No Child" },
    { name: "tripVibe", label: "Trip vibe", placeholder: "Relaxing / Adventure" },
    { name: "specialRequests", label: "Special requests", placeholder: "Name for Personalisation ", fullWidth: true },
  ],
  ctaLabel: "Generate My Trip",
  suggestion: {
    imageUrl: "/assets/attached_assets/dest-italy.png",
    badge: "Suggested for you",
    destination: "Italy",
    tagline: "7 Days · Rome, Florence & Venice",
    estimatedPrice: 72500,
  },
};

// ── CorporateTravel ──────────────────────────
export const corporateTravelProps: CorporateTravelProps = {
  eyebrow: "CORPORATE TRAVEL",
  title: "Simplify Business Travel,\nMaximize Productivity",
  subtitle: "End-to-end travel management for teams of any size. Control costs, automate approvals, and keep everyone moving.",
  imageUrl: "/home/meeting_img.jpeg",
  features: [
    "Centralized travel management",
    "Real-time expense tracking",
    "Dedicated account manager",
    "24/7 priority corporate support",
  ],
  primaryCta: "Book Corporate Travel",
  secondaryCta: "Schedule a Demo",
};

// ── Testimonials ─────────────────────────────
export const testimonialsProps: TestimonialsProps = {
  eyebrow: "TESTIMONIALS",
  title: "What Travelers Say",
  actionLabel: "View all reviews",
  reviews: [
    {
      name: "Ananya Sharma",
      city: "Mumbai",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      quote: "PlumTrips made our Europe trip absolutely magical. The concierge team handled every little detail.",
    },
    {
      name: "Rohit Verma",
      city: "Bengaluru",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      quote: "Best corporate travel experience ever. Smooth bookings, transparent pricing and great support.",
    },
    {
      name: "Neha Iyer",
      city: "Delhi",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
      quote: "They planned our honeymoon perfectly. Every moment felt thoughtful and effortless.",
    },
    {
      name: "Arjun Mehta",
      city: "Pune",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
      quote: "Great prices, excellent service, and a support team that actually responds instantly.",
    },
  ],
};

// ── TravelStories ────────────────────────────
export const travelStoriesProps: TravelStoriesProps = {
  eyebrow: "TRAVEL BLOG",
  title: "Travel Stories & Inspiration",
  actionLabel: "Read all stories",
  featured: {
    imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=900&q=80",
    badge: "Featured Guide",
    title: "A Complete Guide to Bali for First-Time Travelers",
    excerpt: "From stunning beaches to cultural escapes — everything you need to know before you go.",
  },
  stories: [
    { title: "Top 10 Places to Visit in Switzerland", tag: "Destinations",  imageUrl: "https://images.unsplash.com/photo-1502786129293-79981df4e689?w=300&q=80" },
    { title: "How to Find the Best Flight Deals",      tag: "Tips & Tricks", imageUrl: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&q=80" },
    { title: "Luxury Stays That Redefine Comfort",     tag: "Hotels",        imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=80" },
  ],
};

// ── ConciergeCTA ─────────────────────────────
export const conciergeCTAProps: ConciergeCTAProps = {
  title: "Your Journey, Our Priority",
  subtitle: "Expert concierge assistance — call or message anytime to curate your perfect trip.",
};




// ── HotelCollections ──────────────────────────
export const hotelCollectionsProps: HotelCollectionsProps = {
  eyebrow: "Hotel Collections",
  title: "Curated stays for every kind of traveler",
  actionLabel: "View all collections →",
  items: [
    {
      name: "Luxury Escapes",
      description: "Indulge in the finest stays",
      imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80",
    },
    {
      name: "Family Resorts",
      description: "Perfect for unforgettable family vacations",
      imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&q=80",
    },
    {
      name: "Business Hotels",
      description: "Comfort meets productivity",
      imageUrl: "https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=400&q=80",
    },
    {
      name: "Romantic Getaways",
      description: "Made for special moments",
      imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80",
    },
    {
      name: "Wellness Retreats",
      description: "Rejuvenate your body and soul",
      imageUrl: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&q=80",
    },
    {
      name: "Beachfront Resorts",
      description: "Wake up to the ocean breeze",
      imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80",
    },
  ],
};
 
 
// ── HotelTrendingDestinations ─────────────────
export const hotelTrendingDestinationsProps: HotelTrendingDestinationsProps = {
  eyebrow: "Trending Destinations",
  title: "Top places. Exceptional stays.",
  actionLabel: "View all destinations →",
  items: [
    {
      name: "Dubai",
      description: 7999,
      isCurrency: true,
      imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80",
    },
    {
      name: "Bali",
      description: 6499,
      isCurrency: true,
      imageUrl: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&q=80",
    },
    {
      name: "Maldives",
      description: 12999,
      isCurrency: true,
      imageUrl: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=400&q=80",
    },
    {
      name: "Thailand",
      description: 5999,
      isCurrency: true,
      imageUrl: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80",
    },
    {
      name: "Europe",
      description: 12999,
      isCurrency: true,
      imageUrl: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=400&q=80",
    },
    {
      name: "Singapore",
      description: 9499,
      isCurrency: true,
      imageUrl: "https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=80",
    },
  ],
};
 
 
// ── AIHotelFinder ─────────────────────────────
export const aiHotelFinderProps: AIHotelFinderProps = {
  badge: "AI Hotel Finder",
  title: "Tell us what you need, our AI will find the perfect stay.",
  bullets: [
    "Personalized recommendations",
    "Matches your preferences & budget",
    "Saves time & effort",
  ],
  fields: [
    { label: "Where do you want to go?",  placeholder: "e.g. Switzerland" },
    { label: "Check-in – Check-out",      placeholder: "12 Jun – 14 Jun" },
    { name: "budget", label: "Budget per night", placeholder: "15000", isCurrency: true },
    { label: "Guests & Rooms",            placeholder: "e.g. 2 Guests, 1 Room" },
  ],
  ctaLabel: "Find My Perfect Stay ✦",
  suggestion: {
    imageUrl: "/assets/attached_assets/dest-italy.png",
    badge: "AI Suggested for You",
    name: "Hotel Caravel",
    location: "Italy",
    rating: "4.8",
    ratingCount: "340",
    pricePerNight: 18999,
  },
};
 
 
// ── ExclusiveHotelOffers ──────────────────────
export const exclusiveHotelOffersProps: ExclusiveHotelOffersProps = {
  eyebrow: "Exclusive Hotel Offers",
  title: "Limited time deals for you",
  actionLabel: "View all offers →",
  items: [
    {
      title: "Weekend Escapes",
      subtitle: "Up to 40% OFF",
      ctaLabel: "Book Now →",
      imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&q=80",
    },
    {
      title: "Luxury Deals",
      subtitle: "Premium stays, great prices",
      ctaLabel: "Book Now →",
      imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=80",
    },
    {
      title: "Family Holidays",
      subtitle: "Kids stay & eat free",
      ctaLabel: "Book Now →",
      imageUrl: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80",
    },
    {
      title: "Last Minute Deals",
      subtitle: "Best prices on last minute stays",
      ctaLabel: "Book Now →",
      imageUrl: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80",
    },
    {
      title: "PlumTrips Exclusive",
      subtitle: "Extra 10% OFF",
      ctaLabel: "Login / Join Now",
      imageUrl: "",
      isHighlighted: true,
      highlightBadge: "PlumTrips Exclusive",
      highlightCta: "Login / Join Now",
    },
  ],
};
 
 
// ── TopHotelBrands ────────────────────────────
export const topHotelBrandsProps: TopHotelBrandsProps = {
  heading: "Top Hotel Brands",
  logos: [
    "/home/logos/taj.png","/home/logos/oberoi.png","/home/marriott.png","/home/hilton.png","/home/logos/hyatt.jpg",
    "/home/logos/lemeridian.png","/home/logos/accor.png" ,"/home/logos/ihg.png","/home/logos/CHGearth.png","/home/logos/fern.png",
    "/home/logos/itc.png","/home/logos/lalit.jpg","/home/logos/leela.png","/home/logos/neemrana.png","/home/logos/roseate.png",
    "/home/logos/sarovar.png"
  ]
};
 
 
// ── WhyBookWithPumTrips ───────────────────────
export const whyBookWithPumTripsProps: WhyBookWithPumTripsProps = {
  heading: "Why Book With PumTrips?",
  items: [
    {
      icon: "shield-check",
      title: "Best Price Promise",
      description: "We guarantee you the best price online",
    },
    {
      icon: "sparkles",
      title: "Handpicked Properties",
      description: "Every hotel is verified by our experts",
    },
    {
      icon: "headset",
      title: "24/7 Concierge",
      description: "We're here for you before, during & after",
    },
    {
      icon: "calendar-x",
      title: "Flexible Cancellation",
      description: "Plans change, we've got you covered",
    },
    {
      icon: "lock",
      title: "Secure Payments",
      description: "Your data is safe with us",
    },
    {
      icon: "star",
      title: "Loyalty Privileges",
      description: "Exclusive benefits for our members",
    },
  ],
};
 
 
// ── HotelsByExperiences ───────────────────────
export const hotelsByExperiencesProps: HotelsByExperiencesProps = {
  eyebrow: "Hotels by Experiences",
  title: "Find stays that thrill on you",
  actionLabel: "View all experiences →",
  items: [
    {
      icon: "pool",
      name: "Private Pool Villas",
      description: "Ultimate privacy and luxury",
      imageUrl: "https://images.unsplash.com/photo-1602343168117-bb8ffe3e2e9f?w=400&q=80",
    },
    {
      icon: "infinity",
      name: "Infinity Pool Stays",
      description: "Relax with stunning views",
      imageUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=400&q=80",
    },
    {
      icon: "spa",
      name: "Spa & Wellness",
      description: "Rejuvenate your mind & body",
      imageUrl: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=400&q=80",
    },
    {
      icon: "umbrella",
      name: "All Inclusive Resorts",
      description: "Everything taken care of",
      imageUrl: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=400&q=80",
    },
    {
      icon: "mountain",
      name: "Adventure Retreats",
      description: "For thrill seekers and explorers",
      imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80",
    },
    {
      icon: "paw",
      name: "Pet Friendly Stays",
      description: "Because they're a family too",
      imageUrl: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=400&q=80",
    },
  ],
};
 
 
// ── GuestStories ──────────────────────────────
export const guestStoriesProps: GuestStoriesProps = {
  eyebrow: "Guest Stories",
  title: "Real experiences from real travelers",
  actionLabel: "View all reviews →",
  reviews: [
    {
      name: "Ananya Sharma",
      city: "Mumbai",
      avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      quote: "Our stay in Bali was beyond amazing! PumTrips curated everything perfectly.",
    },
    {
      name: "Rohit Verma",
      city: "Bangalore",
      avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
      quote: "Excellent service and great hotel options. Highly recommended!",
    },
    {
      name: "Neha Iyer",
      city: "Delhi",
      avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
      quote: "The concierge support was incredible throughout our Switzerland trip.",
    },
  ],
};
 
 
// ── ExploreOnMap ──────────────────────────────
export const exploreOnMapProps: ExploreOnMapProps = {
  eyebrow: "Explore Hotels on Map",
  title: "Discover hotels in your favorite locations",
  actionLabel: "Explore on Map →",
  previewImageUrl: "/hotels/map-preview.png",
};
 
 
// ── NeedHelpChoosing ──────────────────────────
export const needHelpChoosingProps: NeedHelpChoosingProps = {
  heading: "Need Help Choosing?",
  subheading: "Our hotel experts are here for you.",
  bullets: [
    "Personalized recommendations",
    "Best deals & exclusive upgrades",
    "Call, Chat or Schedule a call back",
  ],
  ctaLabel: "Talk to Hotel Expert",
  expertImageUrl: "/hotels/expert.png",
};
 
 
// ── PumTripsPrivilege ─────────────────────────
export const pumTripsPrivilegeProps: PumTripsPrivilegeProps = {
  brandLabel: "PumTrips Privilege",
  brandDescription: "More than a membership, it's an experience.",
  ctaLabel: "Join Now",
  perks: [
    {
      icon: "tag",
      title: "Member Rates",
      description: "Exclusive prices for members",
    },
    {
      icon: "arrow-up",
      title: "Room Upgrades",
      description: "Complimentary upgrades",
    },
    {
      icon: "headset",
      title: "Priority Support",
      description: "Faster responses, 24/7",
    },
    {
      icon: "gift",
      title: "Exclusive Offers",
      description: "Special deals every month",
    },
  ],
};