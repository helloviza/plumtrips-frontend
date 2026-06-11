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
  logos: ["/home/airindia.png", "/home/indigo.png","/home/vistara.png", "/home/marriott.png", "/home/hilton.png", "/home/mmt.png"],
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
  badge: "✨ AI Trip Planner",
  title: "Not sure where to go?",
  subtitle: "Let AI plan the perfect trip for you — based on your budget, vibe and dates.",
  fields: [
    { label: "Where do you want to go?", placeholder: "e.g. Switzerland", fullWidth: true },
    { label: "Budget (₹)",               placeholder: "₹75,000" },
    { label: "Duration",                 placeholder: "7 days" },
    { label: "Travelers",                placeholder: "2 adults" },
    { label: "Trip vibe",                placeholder: "Relaxing / Adventure" },
  ],
  ctaLabel: "Generate My Trip",
  suggestion: {
    imageUrl: "https://images.unsplash.com/photo-1502786129293-79981df4e689?w=800&q=80",
    badge: "✨ Suggested for you",
    destination: "Switzerland",
    tagline: "7 days · Alps, Lucerne & Interlaken",
    estimatedPrice: "₹72,500",
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
  whatsappLabel: "💬 Chat on WhatsApp",
  callbackLabel: "📞 Request a Callback",
  phone: "+91 98765 43210",
};