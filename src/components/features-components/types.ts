// ─────────────────────────────────────────────
// PlumTrips — Shared Prop Types
// ─────────────────────────────────────────────

export interface ColorPalette {
  orange: string;
  navy: string;
  navyDeep: string;
  blue: string;
  slate: string;
  softWhite: string;
  textMuted: string;
  border: string;
  cardBg: string;
}

// ── StatsStrip ────────────────────────────────
export interface StatItem {
  value: string;
  label: string;
}

export interface StatsStripProps {
  stats: StatItem[];
}

// ── TrustBar ─────────────────────────────────
export interface TrustItem {
  icon: "tag" | "gift" | "headset" | "shield" | "calendar" | "star";
  title: string;
  subtitle: string;
}

export interface TrustBarProps {
  items: TrustItem[];
}

// ── TrustedPartners ──────────────────────────
export interface TrustedPartnersProps {
  heading: string;
  logos: string[];
}

// ── TravelYourWay ────────────────────────────
export interface TravelWayItem {
  name: string;
  description: string;
  imageUrl: string;
}

export interface TravelYourWayProps {
  eyebrow: string;
  title: string;
  actionLabel: string;
  onActionClick?: () => void;
  items: TravelWayItem[];
}

// ── TrendingDestination ──────────────────────
export interface TrendingItem {
  name: string;
  description: string;
  imageUrl: string;
}

export interface TrendingDestinationProps {
  eyebrow: string;
  title: string;
  actionLabel: string;
  onActionClick?: () => void;
  items: TrendingItem[];
}

// ── AIPlanner ────────────────────────────────
export interface PlannerField {
  label: string;
  placeholder: string;
  name?: string;
  fullWidth?: boolean;
}

export interface AIPlannerSuggestion {
  imageUrl: string;
  badge: string;
  destination: string;
  tagline: string;
  estimatedPrice: string;
  onViewItinerary?: () => void;
}

export interface AIPlannerProps {
  badge: string;
  title: string;
  subtitle: string;
  fields: PlannerField[];
  ctaLabel: string;
  onGenerate?: () => void;
  suggestion: AIPlannerSuggestion;
}

// ── CorporateTravel ──────────────────────────
export interface CorporateTravelProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  features: string[];
  primaryCta: string;
  secondaryCta: string;
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;
}

// ── Testimonials ─────────────────────────────
export interface Review {
  name: string;
  city: string;
  avatarUrl: string;
  quote: string;
  rating?: number; // 1–5, defaults to 5
}

export interface TestimonialsProps {
  eyebrow: string;
  title: string;
  actionLabel: string;
  onActionClick?: () => void;
  reviews: Review[];
}

// ── TravelStories ────────────────────────────
export interface StoryCard {
  title: string;
  tag: string;
  imageUrl: string;
}

export interface FeaturedStory {
  imageUrl: string;
  badge: string;
  title: string;
  excerpt: string;
}

export interface TravelStoriesProps {
  eyebrow: string;
  title: string;
  actionLabel: string;
  onActionClick?: () => void;
  featured: FeaturedStory;
  stories: StoryCard[];
}

// ── ConciergeCTA ─────────────────────────────
export interface ConciergeCTAProps {
  title: string;
  subtitle: string;

}




// ─────────────────────────────────────────────
// PlumTrips — Hotels Page Centralised Data
// Edit content here; components stay untouched.
// ─────────────────────────────────────────────
 
// ── Types ─────────────────────────────────────
 
export interface HotelCollectionsProps {
  eyebrow: string;
  title: string;
  actionLabel: string;
  onActionClick?: () => void;
  items: {
    name: string;
    description: string;
    imageUrl: string;
  }[];
}
 
export interface HotelTrendingDestinationsProps {
  eyebrow: string;
  title: string;
  actionLabel: string;
  onActionClick?: () => void;
  items: {
    name: string;
    description: string;  // e.g. "₹7,999" (Or PricePerNight)
    imageUrl: string;
  }[];
}
 
export interface AIHotelFinderProps {
  badge: string;
  title: string;
  bullets: string[];
  fields: PlannerField[];
  ctaLabel: string;
  onFind?: () => void;
  suggestion: {
    imageUrl: string;
    badge: string;
    name: string;
    location: string;
    rating: string;
    ratingCount: string;
    pricePerNight: string;
    onViewDetails?: () => void;
  };
}
 
export interface ExclusiveHotelOffersProps {
  eyebrow: string;
  title: string;
  actionLabel: string;
  onActionClick?: () => void; 
  items: {
    title: string;
    subtitle: string;
    ctaLabel: string;
    imageUrl: string;
    isHighlighted?: boolean;  // dark card with login CTA
    highlightBadge?: string;
    highlightCta?: string;
  }[];
}
 
export interface TopHotelBrandsProps {
  heading: string;
  logos: string[];
}
 
export interface WhyBookWithPumTripsProps {
  heading: string;
  items: {
    icon: string;
    title: string;
    description: string;
  }[];
}
  
export interface HotelsByExperiencesProps {
  eyebrow: string;
  title: string;
  actionLabel: string;
  onActionClick?: () => void;
  items: {
    icon: string;
    name: string;
    description: string;
    imageUrl: string;
  }[];
}
 
export interface GuestStoriesProps {
  eyebrow: string;
  title: string;
  actionLabel: string;
  onActionClick?: () => void;
  reviews: {
    name: string;
    city: string;
    avatarUrl: string;
    quote: string;
  }[];
}
 
export interface ExploreOnMapProps {
  eyebrow: string;
  title: string;
  actionLabel: string;
  onActionClick?: () => void;
  previewImageUrl: string;
}
 
export interface NeedHelpChoosingProps {
  heading: string;
  subheading: string;
  bullets: string[];
  ctaLabel: string;
  expertImageUrl: string;
}
 
export interface PumTripsPrivilegeProps {
  brandLabel: string;
  brandDescription: string;
  ctaLabel: string;
  perks: {
    icon: string;
    title: string;
    description: string;
  }[];
}