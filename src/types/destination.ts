export type SectionType = 
  | 'Hero' 
  | 'Itinerary' 
  | 'PricingTiers' 
  | 'InclusionsExclusions' 
  | 'TextMediaGrid' 
  | 'FeatureList'
  | 'Experiences'
  | 'TextGrid'
  | 'FAQAccordion'
  | 'Testimonials'
  | 'FinalCTA';

export interface BaseSection {
  id: string;
  type: SectionType;
}

export interface HeroSection extends BaseSection {
  type: 'Hero';
  data: {
    theme: 'light' | 'dark';
    badge: string;
    title: {
      regular: string;
      italic: string;
    };
    description: string;
    backgroundImage: string;
    form: {
      title: string;
      buttonText: string;
      isCorporate: boolean;
      fields?: any[];
    };
  };
}

export interface ItineraryItem {
  day: string;
  title: string;
  desc: string;
  img?: string;
}

export interface ItinerarySection extends BaseSection {
  type: 'Itinerary';
  data: {
    badge: string;
    title: {
      regular: string;
      italic: string;
    };
    description: string;
    items: ItineraryItem[];
  };
}

export interface PricingTier {
  stars?: string;
  price: string;
  location1?: string;
  hotel1?: string;
  nights1?: string;
  location2?: string;
  hotel2?: string;
  nights2?: string;
  highlight?: boolean;
  name?: string;
  description?: string;
  features?: string[];
}

export interface PricingSection extends BaseSection {
  type: 'PricingTiers';
  data: {
    badge: string;
    title: {
      regular: string;
      italic: string;
    };
    description: string;
    theme: 'light' | 'dark';
    tiers: PricingTier[];
  };
}

export interface InclusionsExclusionsSection extends BaseSection {
  type: 'InclusionsExclusions';
  data: {
    theme: 'light' | 'dark';
    inclusions: string[];
    exclusions: string[];
  };
}

export interface TextMediaGridSection extends BaseSection {
  type: 'TextMediaGrid';
  data: {
    badge: string;
    title: {
      regular: string;
      italic: string;
    };
    description: string;
    theme: 'light' | 'dark';
    items: {
      title: string;
      desc: string;
      dark?: boolean;
      forText?: string;
      price?: string;
    }[];
  };
}

export interface FeatureListSection extends BaseSection {
  type: 'FeatureList';
  data: {
    badge: string;
    title: {
      regular: string;
      italic: string;
    };
    description: string;
    image?: string;
    items: {
      title: string;
      desc: string;
      img?: string;
      align?: 'left' | 'right';
    }[];
  };
}

export interface ExperienceItem {
  img: string;
  title: string;
  loc: string;
  span: string;
}

export interface ExperiencesSection extends BaseSection {
  type: 'Experiences';
  data: {
    badge: string;
    title: {
      regular: string;
      italic: string;
    };
    description: string;
    items: ExperienceItem[];
  };
}

export interface TextGridSection extends BaseSection {
  type: 'TextGrid';
  data: {
    badge: string;
    title: {
      regular: string;
      italic: string;
    };
    description?: string;
    theme: 'light' | 'dark';
    items: {
      title: string;
      desc: string;
    }[];
  };
}

export interface FAQAccordionSection extends BaseSection {
  type: 'FAQAccordion';
  data: {
    badge: string;
    title: {
      regular: string;
      italic: string;
    };
    faqs: {
      question: string;
      answer: string;
    }[];
  };
}

export interface TestimonialsSection extends BaseSection {
  type: 'Testimonials';
  data: {
    badge: string;
    title: {
      regular: string;
      italic: string;
    };
    testimonials: {
      quote: string;
      author: string;
      company?: string;
      location?: string;
    }[];
  };
}

export interface FinalCTASection extends BaseSection {
  type: 'FinalCTA';
  data: {
    badge: string;
    title: {
      regular: string;
      italic: string;
    };
    description: string;
    buttonText: string;
    backgroundImage?: string;
  };
}

export type DestinationSection = 
  | HeroSection 
  | ItinerarySection 
  | PricingSection 
  | InclusionsExclusionsSection 
  | TextMediaGridSection 
  | FeatureListSection
  | ExperiencesSection
  | TextGridSection
  | FAQAccordionSection
  | TestimonialsSection
  | FinalCTASection;

export interface DestinationConfig {
  id: string;
  name: string;
  type: 'personal' | 'corporate';
  pageTheme: {
    bg: string;
    text: string;
    selectionBg: string;
    selectionText: string;
  };
  sections: DestinationSection[];
}
