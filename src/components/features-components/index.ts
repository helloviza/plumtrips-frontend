// ─────────────────────────────────────────────
// PlumTrips — Public API
// Import components and data from here.
// ─────────────────────────────────────────────

// Components
export { AIPlanner }           from "./AIPlanner";
export { ConciergeCTA }        from "./ConcieregeCTA";
export { CorporateTravel }     from "./CorporateTravel";
export { StatsStrip }          from "./StatsStrip";
export { Testimonials }        from "./Testimonials";
export { TravelStories }       from "./TravelStories";
export { TravelYourWay }       from "./TravelYourWay";
export { TrendingDestination } from "./TrendingDestination";
export { TrustBar }            from "./TrustBar";
export { TrustedPartners }     from "./TrustedPartners";

// Data (pre-filled props for each component)
export {
  aiPlannerProps,
  conciergeCTAProps,
  corporateTravelProps,
  statsStripProps,
  testimonialsProps,
  travelStoriesProps,
  travelYourWayProps,
  trendingDestinationProps,
  trustBarProps,
  trustedPartnersProps,
} from "./data";

// Types
export type {
  AIPlannerProps,
  AIPlannerSuggestion,
  ColorPalette,
  ConciergeCTAProps,
  CorporateTravelProps,
  FeaturedStory,
  PlannerField,
  Review,
  StatItem,
  StatsStripProps,
  StoryCard,
  TestimonialsProps,
  TravelStoriesProps,
  TravelWayItem,
  TravelYourWayProps,
  TrendingDestinationProps,
  TrendingItem,
  TrustBarProps,
  TrustItem,
  TrustedPartnersProps,
} from "./types";

// Design tokens (if you need to extend)
export { C, FONT, SectionHead } from "./token";