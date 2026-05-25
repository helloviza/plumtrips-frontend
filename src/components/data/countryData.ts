import destThailand from "../../../public/assets/attached_assets/dest-thailand.png";
import destJapan from "../../../public/assets/attached_assets/dest-japan.png";
import expThailand from "@assets/exp-thailand.png";
import expTokyo from "../../../public/assets/attached_assets/exp-tokyo.png";
import expTuscany from "../../../public/assets/attached_assets/exp-tuscany.png";
import destItaly from "../../../public/assets/attached_assets/dest-italy.png";
import destBali from "../../../public/assets/attached_assets/dest-bali.png";
import heroBg from "../../../public/assets/attached_assets/hero-bg.png";
import expDubai from "../../../public/assets/attached_assets/exp-dubai.png";

export interface Memory {
  image: string;
  title: string;
  span?: string; // e.g. "lg:col-span-2"
}

export interface Detail {
  timestamp: string;
  title: string;
  description: string;
}

export interface NoticeItem {
  title: string;
  description: string;
}

export interface CountryData {
  id: string;
  name: string;
  hero: {
    image: string;
    headlinePrefix: string;
    headlineHighlight: string;
  };
  quote: {
    line1: string;
    line2: string;
  };
  memories: {
    headlinePrefix: string;
    headlineHighlight: string;
    items: Memory[];
  };
  details: {
    headlinePrefix: string;
    headlineHighlight: string;
    heroImage: string;
    items: Detail[];
  };
  notices: {
    headlinePrefix: string;
    headlineHighlight: string;
    items: NoticeItem[];
  };
  cta: {
    headlinePrefix: string;
    headlineHighlight: string;
    subheadline: string;
  };
}

export const countryData: Record<string, CountryData> = {
  vietnam: {
    id: "vietnam",
    name: "Vietnam",
    hero: {
      image: heroBg,
      headlinePrefix: "The kind of trip teams",
      headlineHighlight: "bring up later."
    },
    quote: {
      line1: "Not another offsite.",
      line2: "Something people remember."
    },
    memories: {
      headlinePrefix: "The kind of evenings",
      headlineHighlight: "people quote later.",
      items: [
        { image: expThailand, title: "Sunset cruise in Ha Long Bay", span: "md:col-span-1" },
        { image: expDubai, title: "Lantern-lit dinner in Hoi An", span: "md:col-span-2" },
        { image: destJapan, title: "Street food exploration in Hanoi", span: "md:col-span-2" },
        { image: heroBg, title: "Boutique stays by the river", span: "md:col-span-1" }
      ]
    },
    details: {
      headlinePrefix: "The shape of a trip",
      headlineHighlight: "people remember in detail.",
      heroImage: destThailand,
      items: [
        { timestamp: "08:00 AM", title: "Arrival & Welcome", description: "Settle into your private villa with a curated welcome basket." },
        { timestamp: "11:30 AM", title: "Local Discovery", description: "A private guided tour through hidden cultural gems." },
        { timestamp: "02:00 PM", title: "Culinary Masterclass", description: "Learn authentic cooking techniques from a local chef." },
        { timestamp: "06:00 PM", title: "Sunset Reception", description: "Exclusive cocktails with panoramic views." }
      ]
    },
    notices: {
      headlinePrefix: "Everything you would notice,",
      headlineHighlight: "has been noticed.",
      items: [
        { title: "Seamless Logistics", description: "From airport transfers to dinner reservations, everything is handled." },
        { title: "Curated Experiences", description: "Activities tailored specifically for your team's dynamics." },
        { title: "24/7 Concierge", description: "On-the-ground support for any spontaneous requests." }
      ]
    },
    cta: {
      headlinePrefix: "The teams people remember",
      headlineHighlight: "usually travelled differently.",
      subheadline: "Let us design something extraordinary."
    }
  },
  japan: {
    id: "japan",
    name: "Japan",
    hero: {
      image: destJapan,
      headlinePrefix: "The kind of trip teams",
      headlineHighlight: "bring up later."
    },
    quote: {
      line1: "Not another offsite.",
      line2: "Something people remember."
    },
    memories: {
      headlinePrefix: "The kind of evenings",
      headlineHighlight: "people quote later.",
      items: [
        { image: expTokyo, title: "Omakase dinner in Ginza", span: "md:col-span-2" },
        { image: destJapan, title: "Private tea ceremony in Kyoto", span: "md:col-span-1" },
        { image: heroBg, title: "Ryokan retreat in Hakone", span: "md:col-span-1" },
        { image: expDubai, title: "Neon lights of Shinjuku", span: "md:col-span-2" }
      ]
    },
    details: {
      headlinePrefix: "The shape of a trip",
      headlineHighlight: "people remember in detail.",
      heroImage: destJapan,
      items: [
        { timestamp: "09:00 AM", title: "Morning Zen", description: "Start the day with a guided meditation session at a historic temple." },
        { timestamp: "01:00 PM", title: "Artisan Encounters", description: "Meet with local craftsmen and learn traditional techniques." },
        { timestamp: "04:30 PM", title: "Boutique Shopping", description: "Explore curated design districts with a local expert." },
        { timestamp: "07:30 PM", title: "Kaiseki Experience", description: "A multi-course dinner celebrating seasonal ingredients." }
      ]
    },
    notices: {
      headlinePrefix: "Everything you would notice,",
      headlineHighlight: "has been noticed.",
      items: [
        { title: "Flawless Execution", description: "Bullet train tickets, luggage forwarding, and guides all pre-arranged." },
        { title: "Cultural Nuance", description: "We ensure your team navigates local etiquette with ease." },
        { title: "Exclusive Access", description: "Entry to venues and experiences usually closed to the public." }
      ]
    },
    cta: {
      headlinePrefix: "The teams people remember",
      headlineHighlight: "usually travelled differently.",
      subheadline: "Let us design something extraordinary."
    }
  },
  thailand: {
    id: "thailand",
    name: "Thailand",
    hero: {
      image: destThailand,
      headlinePrefix: "The kind of trip teams",
      headlineHighlight: "bring up later."
    },
    quote: {
      line1: "Not another offsite.",
      line2: "Something people remember."
    },
    memories: {
      headlinePrefix: "The kind of evenings",
      headlineHighlight: "people quote later.",
      items: [
        { image: expThailand, title: "Private island dining", span: "md:col-span-1" },
        { image: expDubai, title: "Yacht charter in the Andaman Sea", span: "md:col-span-2" },
        { image: destThailand, title: "Wellness retreat in Chiang Mai", span: "md:col-span-2" },
        { image: heroBg, title: "Bustling night markets in Bangkok", span: "md:col-span-1" }
      ]
    },
    details: {
      headlinePrefix: "The shape of a trip",
      headlineHighlight: "people remember in detail.",
      heroImage: destThailand,
      items: [
        { timestamp: "08:30 AM", title: "Yoga by the Sea", description: "Begin the day with a private session overlooking the ocean." },
        { timestamp: "12:00 PM", title: "Island Hopping", description: "Discover hidden coves and pristine beaches on a private speedboat." },
        { timestamp: "04:00 PM", title: "Spa Sanctuary", description: "Rejuvenate with traditional Thai massages." },
        { timestamp: "08:00 PM", title: "Beachfront Gala", description: "A memorable dinner under the stars with fire dancers." }
      ]
    },
    notices: {
      headlinePrefix: "Everything you would notice,",
      headlineHighlight: "has been noticed.",
      items: [
        { title: "VIP Transfers", description: "Helicopter or luxury van transfers upon arrival." },
        { title: "Tailored Menus", description: "Dietary preferences meticulously accommodated." },
        { title: "Group Cohesion", description: "Activities designed to foster connection without feeling forced." }
      ]
    },
    cta: {
      headlinePrefix: "The teams people remember",
      headlineHighlight: "usually travelled differently.",
      subheadline: "Let us design something extraordinary."
    }
  },
  bali: {
    id: "bali",
    name: "Bali",
    hero: {
      image: destBali,
      headlinePrefix: "The kind of trip teams",
      headlineHighlight: "bring up later."
    },
    quote: {
      line1: "Not another offsite.",
      line2: "Something people remember."
    },
    memories: {
      headlinePrefix: "The kind of evenings",
      headlineHighlight: "people quote later.",
      items: [
        { image: destBali, title: "Sunrise yoga over Ubud", span: "md:col-span-12 lg:col-span-7 row-span-2" },
        { image: expThailand, title: "Private villa beach club", span: "md:col-span-6 lg:col-span-5 row-span-1" },
        { image: expDubai, title: "Traditional fire dance ceremony", span: "md:col-span-6 lg:col-span-5 row-span-1" },
        { image: heroBg, title: "Jungle river rafting", span: "md:col-span-12 lg:col-span-12 row-span-1" }
      ]
    },
    details: {
      headlinePrefix: "The shape of a trip",
      headlineHighlight: "people remember in detail.",
      heroImage: destBali,
      items: [
        { timestamp: "08:00 AM", title: "Arrival & Welcome", description: "Settle into your private villa with a curated welcome basket." },
        { timestamp: "11:30 AM", title: "Local Discovery", description: "A private guided tour through hidden cultural gems." },
        { timestamp: "02:00 PM", title: "Culinary Masterclass", description: "Learn authentic cooking techniques from a local chef." },
        { timestamp: "06:00 PM", title: "Sunset Reception", description: "Exclusive cocktails with panoramic views." }
      ]
    },
    notices: {
      headlinePrefix: "Everything you would notice,",
      headlineHighlight: "has been noticed.",
      items: [
        { title: "VIP Transfers", description: "Helicopter or luxury van transfers upon arrival." },
        { title: "Tailored Menus", description: "Dietary preferences meticulously accommodated." },
        { title: "Group Cohesion", description: "Activities designed to foster connection without feeling forced." }
      ]
    },
    cta: {
      headlinePrefix: "The teams people remember",
      headlineHighlight: "usually travelled differently.",
      subheadline: "Let us design something extraordinary."
    }
  }
};
