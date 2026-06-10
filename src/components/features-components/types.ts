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
  whatsappLabel: string;
  callbackLabel: string;
  phone: string;
  onWhatsAppClick?: () => void;
  onCallbackClick?: () => void;
}