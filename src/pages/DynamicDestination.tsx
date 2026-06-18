import React, { useEffect, useState } from "react";
import { Header_Holiday } from "../components/Header_Holiday";
import { HeroSection } from "../components/sections/HeroSection";
import { ItinerarySection } from "../components/sections/ItinerarySection";
import { PricingSection } from "../components/sections/PricingSection";
import { InclusionsSection } from "../components/sections/InclusionsSection";
import { TextMediaGridSection } from "../components/sections/TextMediaGridSection";
import { FeatureListSection } from "../components/sections/FeatureListSection";
import { ExperiencesSection } from "../components/sections/ExperiencesSection";
import { TextGridSection } from "../components/sections/TextGridSection";
import { FAQAccordionSection } from "../components/sections/FAQAccordionSection";
import { TestimonialsSection } from "../components/sections/TestimonialsSection";
import { FinalCTASection } from "../components/sections/FinalCTASection";
import type { DestinationConfig } from "../types/destination";



export default function DynamicDestination({ params }: { params: { slug: string } }) {
  const [config, setConfig] = useState<DestinationConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Dynamic import of the JSON configuration based on URL
    const loadData = async () => {
      try {
        let destination = '';
        let type = '';

        if (params.slug === 'personal') {
          destination = 'thailand';
          type = 'personal';
        } else if (params.slug === 'corporate') {
          destination = 'thailand';
          type = 'corporate';
        } else {
          const parts = params.slug.split('-');
          if (parts.length >= 2) {
            destination = parts.slice(0, -1).join('-');
            type = parts[parts.length - 1];
          } else {
            throw new Error("Invalid URL slug");
          }
        }

        // Construct the filename (e.g. bali-personal.json)
        const data = await import(`../components/data/destinations/${destination}-${type}.json`);
        setConfig(data.default || data);
      } catch (e) {
        console.error("Failed to load destination config", e);
        setError("Destination not found.");
      }
    };
    loadData();
  }, [params.slug]);

  if (error) {
    return <div className="min-h-screen bg-[#f5f0e6] flex items-center justify-center text-2xl font-serif">{error}</div>;
  }

  if (!config) {
    return <div className="min-h-screen bg-[#0a1c2b] flex items-center justify-center">
       <div className="w-12 h-12 border-4 border-white/20 border-t-[#e35d29] rounded-full animate-spin"></div>
    </div>;
  }

  const { pageTheme, sections } = config;

  return (
    <div 
      className={`min-h-screen font-sans overflow-x-hidden -mt-[124px] font-poppins`}
      style={{ 
        backgroundColor: pageTheme.bg, 
        color: pageTheme.text 
      }}
    >
      
      {sections.map((section, index) => {
        switch (section.type) {
          case 'Hero':
            return (
              <HeroSection key={section.id || index} data={section.data}>
                <Header_Holiday />
              </HeroSection>
            );
          case 'Itinerary':
            return <ItinerarySection key={section.id || index} data={section.data} theme={pageTheme} />;
          case 'PricingTiers':
            return <PricingSection key={section.id || index} data={section.data} theme={pageTheme} />;
          case 'InclusionsExclusions':
            return <InclusionsSection key={section.id || index} data={section.data} theme={pageTheme} />;
          case 'TextMediaGrid':
            return <TextMediaGridSection key={section.id || index} data={section.data} theme={pageTheme} />;
          case 'FeatureList':
            return <FeatureListSection key={section.id || index} data={section.data} theme={pageTheme} />;
          case 'Experiences':
            return <ExperiencesSection key={section.id || index} data={section.data} theme={config.pageTheme} />;
          case 'TextGrid':
            return <TextGridSection key={section.id || index} data={section.data} />;
          case 'FAQAccordion':
            return <FAQAccordionSection key={section.id || index} data={section.data} />;
          case 'Testimonials':
            return <TestimonialsSection key={section.id || index} data={section.data} />;
          case 'FinalCTA':
            return <FinalCTASection key={section.id || index} data={section.data} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
