/*Blogs.tsx*/
import React, { useEffect, useRef, useState } from 'react';
import type { Post } from '../../lib/api';
import type {
  BlogHighlight,
  LayoutOverrides,
  LayoutRules,
  PostBlock,
  PostBlockSettings,
  TemplateAuthoringProfile,
  TemplateBlockGuidance,
  TypographyOverrides,
  TypographyRules,
  InlineTextMarks,
  BlogGalleryComposition,
  BlogImageFit,
  BlogImageRatio,
} from './blogs.model';
import { applyInlineMark, InlineText } from './InlineText';
import BlogLocationPicker from './BlogLocationPicker';
import { getBlogs, createBlog, updateBlog, deleteBlog, uploadBlogImage } from '../../lib/api';
import './published-styles.css';

// ─── Normalize MongoDB _id → id ───────────────────────────────────────────────
function normalizePost(raw: any): Post {
  return {
    ...raw,
    id: raw.id ?? raw._id ?? undefined,
  };
}

// ─── Error message mapper ─────────────────────────────────────────────────────
const mapErrorMessage = (error: unknown): string => {
  const msg = error instanceof Error ? error.message : String(error);
  const errorMap: Record<string, string> = {
    'invalid token': '❌ Invalid authentication token. Please sign in again.',
    'unauthorized': '❌ Unauthorized: You are not authenticated. Please sign in.',
    'forbidden': "❌ Forbidden: You don't have permission to create blogs.",
    'not found': '❌ Blog not found.',
    'duplicate': '❌ A blog with this slug already exists.',
    'validation failed': '❌ Please fill in all required fields.',
    'http 401': '❌ Unauthorized: Please sign in.',
    'http 403': "❌ Forbidden: You don't have permission.",
  };
  const lower = msg.toLowerCase();
  for (const [key, value] of Object.entries(errorMap)) {
    if (lower.includes(key)) return value;
  }
  return `❌ ${msg.startsWith('Error: ') ? msg.slice(7) : msg || 'An unexpected error occurred.'}`;
};

type BlockType =
  | 'h1' | 'h2' | 'h3' | 'p' | 'quote' | 'image' | 'cover'
  | 'gallery' | 'numlist' | 'hotel' | 'map' | 'video' | 'newsletter';

interface BlogsProps {
  posts?: Post[];
  layout?: 'magazine' | 'listicle' | 'essay';
  displayFont?: 'serif' | 'sans';
  onPostClick?: (post: Post) => void;
  showListView?: boolean;
}

type ViewMode = 'list' | 'editor' | 'preview';

const BLOCK_LIBRARY: { type: BlockType; label: string; desc: string }[] = [
  { type: 'h1', label: 'Heading 1', desc: 'Main section title' },
  { type: 'h2', label: 'Heading 2', desc: 'Section heading' },
  { type: 'h3', label: 'Heading 3', desc: 'Small heading' },
  { type: 'p', label: 'Paragraph', desc: 'Body text' },
  { type: 'image', label: 'Image', desc: 'Inline image' },
  { type: 'cover', label: 'Cover', desc: 'Hero image' },
  { type: 'gallery', label: 'Gallery', desc: 'Grid of images' },
  { type: 'quote', label: 'Quote', desc: 'Pull quote' },
  { type: 'numlist', label: 'Numbered list', desc: 'Top list or itinerary' },
  { type: 'hotel', label: 'Hotel card', desc: 'Destination & hotel summary' },
  { type: 'map', label: 'Map', desc: 'Pinned map graphic' },
  { type: 'video', label: 'Video', desc: 'Video embed placeholder' },
  { type: 'newsletter', label: 'Newsletter', desc: 'Subscribe CTA' },
];

type BlogFormat =
  | 'destination-guide'
  | 'itinerary'
  | 'travel-story'
  | 'city-guide'
  | 'things-to-do'
  | 'blank';

interface BlogFormatDefinition {
  type: BlogFormat;
  label: string;
  description: string;
  blocks: BlockType[];
}

const BLOG_FORMATS: BlogFormatDefinition[] = [
  {
    type: 'destination-guide',
    label: 'Destination Guide',
    description: 'Complete guide with highlights, tips and places to explore.',
    blocks: ['cover', 'h1', 'p', 'h2', 'p', 'numlist', 'image', 'quote', 'p'],
  },
  {
    type: 'itinerary',
    label: '3/5/7-Day Itinerary',
    description: 'Day-by-day travel plan with places, activities and images.',
    blocks: ['cover', 'h1', 'p', 'numlist', 'map', 'p', 'quote'],
  },
  {
    type: 'travel-story',
    label: 'Travel Story',
    description: 'Story-focused format for personal travel experiences.',
    blocks: ['cover', 'h1', 'p', 'image', 'p', 'quote', 'image', 'p'],
  },
  {
    type: 'city-guide',
    label: 'City Guide',
    description: 'City-focused guide covering places, food, stays and tips.',
    blocks: ['cover', 'h1', 'p', 'h2', 'numlist', 'hotel', 'map', 'p'],
  },
  {
    type: 'things-to-do',
    label: 'Things To Do',
    description: 'List-style format for activities and attractions.',
    blocks: ['cover', 'h1', 'p', 'numlist', 'image', 'quote', 'p'],
  },
  {
    type: 'blank',
    label: 'Blank / Custom',
    description: 'Start with an empty editor and add your own sections.',
    blocks: [],
  },
];

type BlogTemplateBlock = {
  type: BlockType;

  // Content guidance
  minWords?: number;
  maxWords?: number;
  minItems?: number;
  maxItems?: number;

  // Image rules
  imageCount?: number;
  imageStyle?: 'standard' | 'large' | 'full-width' | 'gallery';
  imagePosition?: 'left' | 'right' | 'center' | 'top' | 'bottom';

  // Layout rules
  width?: 'small' | 'medium' | 'large' | 'full';
  alignment?: 'left' | 'center' | 'right';

  // Block-specific settings
  required?: boolean;
  typography?: TypographyOverrides;
  layout?: LayoutOverrides;
  highlight?: BlogHighlight;
};

type BlogTemplateDefinition = {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  blocks: BlogTemplateBlock[];
  profile?: TemplateAuthoringProfile;
  typography?: TypographyRules;
  layout?: LayoutRules;
};

const DESTINATION_TEMPLATES: BlogTemplateDefinition[] = [
  {
    id: 'complete-escape',
    name: 'The Complete Escape',
    description: 'A complete destination guide with practical information, luxury stays, and experiences.',
    thumbnail: '/assets/attached_assets/dest-bali.png',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'full-width', width: 'full', required: true },
      { type: 'h1', maxWords: 12, alignment: 'left', required: true },
      { type: 'p', minWords: 60, maxWords: 100 },
      { type: 'h2', maxWords: 8 },
      { type: 'p', minWords: 50, maxWords: 100 },
      { type: 'numlist', minItems: 5, maxItems: 8 },
      { type: 'image', imageCount: 1, imageStyle: 'large', imagePosition: 'center', width: 'large' },
      { type: 'h2', maxWords: 8 },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'hotel', minItems: 2, maxItems: 4 },
      { type: 'map', width: 'full' },
      { type: 'quote', minWords: 10, maxWords: 30, alignment: 'center' },
      { type: 'newsletter', width: 'full' },
    ],
  },
  {
    id: 'explorer',
    name: 'The Explorer',
    description: 'A discovery-focused guide for places, experiences and highlights.',
    thumbnail: '/assets/attached_assets/exp-iceland.png',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'large', width: 'large', required: true },
      { type: 'h1', maxWords: 11, alignment: 'center', required: true },
      { type: 'p', minWords: 40, maxWords: 70 },
      { type: 'h2', maxWords: 8 },
      { type: 'image', imageCount: 1, imageStyle: 'standard', imagePosition: 'right', width: 'medium' },
      { type: 'numlist', minItems: 4, maxItems: 8 },
      { type: 'gallery', imageCount: 4, imageStyle: 'gallery', width: 'large' },
      { type: 'map', width: 'large' },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'newsletter', width: 'full' },
    ],
  },
  {
    id: 'essential-guide',
    name: 'The Essential Guide',
    description: 'A practical and easy-to-scan destination guide.',
    thumbnail: '/assets/holidays/jaipur.jpg',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'standard', width: 'large', required: true },
      { type: 'h1', maxWords: 10, alignment: 'left', required: true },
      { type: 'p', minWords: 40, maxWords: 70 },
      { type: 'h2', maxWords: 7 },
      { type: 'numlist', minItems: 4, maxItems: 6 },
      { type: 'h2', maxWords: 7 },
      { type: 'hotel', minItems: 2, maxItems: 3 },
      { type: 'map', width: 'large' },
      { type: 'p', minWords: 60, maxWords: 100 },
    ],
  },
  {
    id: 'local-lens',
    name: 'The Local Lens',
    description: 'A local-focused format for authentic places, food and experiences.',
    thumbnail: '/assets/attached_assets/culinary_bali.jpg',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'standard', width: 'large', required: true },
      { type: 'h1', maxWords: 10, alignment: 'left', required: true },
      { type: 'p', minWords: 50, maxWords: 100 },
      { type: 'quote', minWords: 10, maxWords: 25, alignment: 'center' },
      { type: 'image', imageCount: 1, imageStyle: 'large', imagePosition: 'left', width: 'large' },
      { type: 'h2', maxWords: 8 },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'gallery', imageCount: 5, imageStyle: 'gallery', width: 'large' },
      { type: 'map', width: 'full' },
      { type: 'newsletter', width: 'full' },
    ],
  },
  {
    id: 'hidden-route',
    name: 'The Hidden Route',
    description: 'A discovery format focused on lesser-known places and experiences.',
    thumbnail: '/assets/attached_assets/island-hop.jpg',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'full-width', width: 'full', required: true },
      { type: 'h1', maxWords: 11, alignment: 'center', required: true },
      { type: 'p', minWords: 40, maxWords: 80 },
      { type: 'image', imageCount: 1, imageStyle: 'standard', imagePosition: 'right', width: 'medium' },
      { type: 'h2', maxWords: 8 },
      { type: 'numlist', minItems: 6, maxItems: 12 },
      { type: 'gallery', imageCount: 3, imageStyle: 'gallery', width: 'large' },
      { type: 'map', width: 'full' },
      { type: 'quote', minWords: 10, maxWords: 30, alignment: 'center' },
      { type: 'p', minWords: 60, maxWords: 120 },
    ],
  },
];

const ITINERARY_TEMPLATES: BlogTemplateDefinition[] = [
  {
    id: 'classic-journey',
    name: 'The Classic Journey',
    description: 'A balanced day-by-day itinerary covering landmark sights, leisure, and dining.',
    thumbnail: '/assets/attached_assets/exp-tuscany.png',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'full-width', width: 'full', required: true },
      { type: 'h1', maxWords: 10, alignment: 'center', required: true },
      { type: 'p', minWords: 40, maxWords: 70 },
      { type: 'map', width: 'full' },
      { type: 'h2', maxWords: 8 },
      { type: 'numlist', minItems: 3, maxItems: 5 },
      { type: 'image', imageCount: 1, imageStyle: 'standard', imagePosition: 'center', width: 'large' },
      { type: 'h2', maxWords: 8 },
      { type: 'numlist', minItems: 2, maxItems: 4 },
      { type: 'hotel', minItems: 2, maxItems: 3 },
      { type: 'p', minWords: 60, maxWords: 100 },
      { type: 'newsletter', width: 'full' },
    ],
  },
  {
    id: 'detailed-route',
    name: 'The Detailed Route',
    description: 'An in-depth chronological plan with transit notes, timed stops, and route maps.',
    thumbnail: '/assets/attached_assets/vietnam_halong_1780482394962.png',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'large', width: 'large', required: true },
      { type: 'h1', maxWords: 10, alignment: 'left', required: true },
      { type: 'p', minWords: 50, maxWords: 90 },
      { type: 'map', width: 'large' },
      { type: 'h2', maxWords: 8 },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'numlist', minItems: 3, maxItems: 7 },
      { type: 'image', imageCount: 1, imageStyle: 'large', imagePosition: 'right', width: 'large' },
      { type: 'h2', maxWords: 8 },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'numlist', minItems: 3, maxItems: 7 },
      { type: 'quote', minWords: 10, maxWords: 30, alignment: 'center' },
      { type: 'hotel', minItems: 2, maxItems: 5 },
      { type: 'p', minWords: 60, maxWords: 100 },
    ],
  },
  {
    id: 'complete-trip',
    name: 'The Complete Trip',
    description: 'All-in-one vacation blueprint with activities, curated stays, and packing essentials.',
    thumbnail: '/assets/attached_assets/holidays_hero_premium.png',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'full-width', width: 'full', required: true },
      { type: 'h1', maxWords: 10, alignment: 'center', required: true },
      { type: 'p', minWords: 50, maxWords: 90 },
      { type: 'h2', maxWords: 8 },
      { type: 'numlist', minItems: 4, maxItems: 8 },
      { type: 'gallery', imageCount: 6, imageStyle: 'gallery', width: 'full' },
      { type: 'h2', maxWords: 8 },
      { type: 'hotel', minItems: 2, maxItems: 4 },
      { type: 'map', width: 'full' },
      { type: 'video', width: 'large' },
      { type: 'quote', minWords: 10, maxWords: 30, alignment: 'center' },
      { type: 'p', minWords: 80, maxWords: 150 },
      { type: 'newsletter', width: 'full' },
    ],
  },
  {
    id: 'scenic-trail',
    name: 'The Scenic Trail',
    description: 'A visual road trip or scenic tour highlighting viewpoints, drives, and natural stops.',
    thumbnail: '/assets/europe/europe_coast.jpg',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'large', width: 'large', required: true },
      { type: 'h1', maxWords: 10, alignment: 'center', required: true },
      { type: 'p', minWords: 40, maxWords: 70 },
      { type: 'image', imageCount: 1, imageStyle: 'full-width', imagePosition: 'top', width: 'full' },
      { type: 'map', width: 'large' },
      { type: 'h2', maxWords: 8 },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'gallery', imageCount: 4, imageStyle: 'gallery', width: 'large' },
      { type: 'numlist', minItems: 3, maxItems: 7 },
      { type: 'quote', minWords: 10, maxWords: 25, alignment: 'center' },
      { type: 'p', minWords: 60, maxWords: 120 },
    ],
  },
  {
    id: 'slow-journey',
    name: 'The Slow Journey',
    description: 'A relaxed, low-pace itinerary emphasizing mindful exploration, wellness, and local immersion.',
    thumbnail: '/assets/attached_assets/japan_serene_1780482413728.png',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'standard', width: 'large', required: true },
      { type: 'h1', maxWords: 10, alignment: 'left', required: true },
      { type: 'p', minWords: 40, maxWords: 80 },
      { type: 'quote', minWords: 10, maxWords: 30, alignment: 'center' },
      { type: 'image', imageCount: 1, imageStyle: 'large', imagePosition: 'center', width: 'large' },
      { type: 'h2', maxWords: 8 },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'hotel', minItems: 2, maxItems: 4 },
      { type: 'h2', maxWords: 8 },
      { type: 'numlist', minItems: 3, maxItems: 5 },
      { type: 'p', minWords: 60, maxWords: 100 },
      { type: 'newsletter', width: 'full' },
    ],
  },
];

const TRAVEL_STORY_TEMPLATES: BlogTemplateDefinition[] = [
  {
    id: 'the-journey',
    name: 'The Journey',
    description: 'An immersive narrative following an evocative journey from departure to homecoming.',
    thumbnail: '/assets/attached_assets/hero.jpg',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'full-width', width: 'full', required: true },
      { type: 'h1', maxWords: 12, alignment: 'left', required: true },
      { type: 'p', minWords: 50, maxWords: 90 },
      { type: 'image', imageCount: 1, imageStyle: 'large', imagePosition: 'center', width: 'large' },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'quote', minWords: 10, maxWords: 30, alignment: 'center' },
      { type: 'h2', maxWords: 8 },
      { type: 'p', minWords: 80, maxWords: 180 },
      { type: 'image', imageCount: 1, imageStyle: 'standard', imagePosition: 'right', width: 'medium' },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'newsletter', width: 'full' },
    ],
  },
  {
    id: 'photo-story',
    name: 'The Photo Story',
    description: 'A photography-driven essay letting striking visuals and vignettes tell the tale.',
    thumbnail: '/assets/attached_assets/bali_rice_terrace_1780482458839.png',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'large', width: 'large', required: true },
      { type: 'h1', maxWords: 10, alignment: 'center', required: true },
      { type: 'p', minWords: 40, maxWords: 70 },
      { type: 'image', imageCount: 1, imageStyle: 'full-width', imagePosition: 'top', width: 'full' },
      { type: 'p', minWords: 40, maxWords: 80 },
      { type: 'gallery', imageCount: 6, imageStyle: 'gallery', width: 'full' },
      { type: 'quote', minWords: 10, maxWords: 25, alignment: 'center' },
      { type: 'image', imageCount: 1, imageStyle: 'large', imagePosition: 'center', width: 'large' },
      { type: 'p', minWords: 50, maxWords: 100 },
      { type: 'gallery', imageCount: 4, imageStyle: 'gallery', width: 'large' },
      { type: 'p', minWords: 60, maxWords: 120 },
    ],
  },
  {
    id: 'travel-diary',
    name: 'The Travel Diary',
    description: 'Personal reflections, journal entries, and intimate impressions from the road.',
    thumbnail: '/assets/attached_assets/japan_pers_tea_1780482988284.png',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'standard', width: 'large', required: true },
      { type: 'h1', maxWords: 12, alignment: 'left', required: true },
      { type: 'p', minWords: 50, maxWords: 100 },
      { type: 'quote', minWords: 10, maxWords: 30, alignment: 'center' },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'image', imageCount: 1, imageStyle: 'large', imagePosition: 'left', width: 'large' },
      { type: 'h2', maxWords: 8 },
      { type: 'p', minWords: 80, maxWords: 180 },
      { type: 'image', imageCount: 1, imageStyle: 'standard', imagePosition: 'right', width: 'medium' },
      { type: 'quote', minWords: 10, maxWords: 25, alignment: 'center' },
      { type: 'p', minWords: 60, maxWords: 120 },
    ],
  },
  {
    id: 'memory-trail',
    name: 'The Memory Trail',
    description: 'A nostalgic reflection on meaningful encounters, timeless places, and unforgettable moments.',
    thumbnail: '/assets/attached_assets/thailand-personal-final-1.jpg',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'full-width', width: 'full', required: true },
      { type: 'h1', maxWords: 12, alignment: 'center', required: true },
      { type: 'p', minWords: 50, maxWords: 90 },
      { type: 'image', imageCount: 1, imageStyle: 'large', imagePosition: 'center', width: 'large' },
      { type: 'h2', maxWords: 8 },
      { type: 'p', minWords: 80, maxWords: 180 },
      { type: 'quote', minWords: 10, maxWords: 30, alignment: 'center' },
      { type: 'gallery', imageCount: 5, imageStyle: 'gallery', width: 'large' },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'newsletter', width: 'full' },
    ],
  },
  {
    id: 'postcard-story',
    name: 'The Postcard Story',
    description: 'Short, vivid dispatch capturing the sensory pulse and distinct charm of a destination.',
    thumbnail: '/assets/attached_assets/vietnam_lanterns_1780482438085.png',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'standard', width: 'large', required: true },
      { type: 'h1', maxWords: 10, alignment: 'center', required: true },
      { type: 'p', minWords: 40, maxWords: 70 },
      { type: 'gallery', imageCount: 3, imageStyle: 'gallery', width: 'large' },
      { type: 'quote', minWords: 10, maxWords: 25, alignment: 'center' },
      { type: 'p', minWords: 50, maxWords: 100 },
      { type: 'image', imageCount: 1, imageStyle: 'large', imagePosition: 'bottom', width: 'large' },
      { type: 'p', minWords: 50, maxWords: 100 },
    ],
  },
];

const CITY_GUIDE_TEMPLATES: BlogTemplateDefinition[] = [
  {
    id: 'complete-city',
    name: 'The Complete City',
    description: 'Comprehensive urban guide covering iconic attractions, food scenes, and top hotels.',
    thumbnail: '/assets/attached_assets/dubai_f.jpg',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'full-width', width: 'full', required: true },
      { type: 'h1', maxWords: 10, alignment: 'left', required: true },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'map', width: 'full' },
      { type: 'h2', maxWords: 8 },
      { type: 'numlist', minItems: 6, maxItems: 12 },
      { type: 'image', imageCount: 1, imageStyle: 'large', imagePosition: 'center', width: 'large' },
      { type: 'h2', maxWords: 8 },
      { type: 'hotel', minItems: 2, maxItems: 5 },
      { type: 'h2', maxWords: 8 },
      { type: 'gallery', imageCount: 6, imageStyle: 'gallery', width: 'full' },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'newsletter', width: 'full' },
    ],
  },
  {
    id: 'city-essentials',
    name: 'The City Essentials',
    description: 'The quintessential 48-hour city guide with must-see landmarks and neighborhood highlights.',
    thumbnail: '/assets/singapore/singapore_f.jpg',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'large', width: 'large', required: true },
      { type: 'h1', maxWords: 10, alignment: 'center', required: true },
      { type: 'p', minWords: 40, maxWords: 70 },
      { type: 'h2', maxWords: 8 },
      { type: 'numlist', minItems: 4, maxItems: 8 },
      { type: 'image', imageCount: 1, imageStyle: 'standard', imagePosition: 'right', width: 'medium' },
      { type: 'hotel', minItems: 2, maxItems: 3 },
      { type: 'map', width: 'large' },
      { type: 'quote', minWords: 10, maxWords: 30, alignment: 'center' },
      { type: 'p', minWords: 60, maxWords: 100 },
    ],
  },
  {
    id: 'weekend-edit',
    name: 'The Weekend Edit',
    description: 'A curated 2-to-3 day metropolitan getaway packed with brunch, culture, and nightlife.',
    thumbnail: '/assets/attached_assets/italy_replacement_1.jpg',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'standard', width: 'large', required: true },
      { type: 'h1', maxWords: 10, alignment: 'center', required: true },
      { type: 'p', minWords: 40, maxWords: 70 },
      { type: 'h2', maxWords: 8 },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'gallery', imageCount: 4, imageStyle: 'gallery', width: 'large' },
      { type: 'h2', maxWords: 8 },
      { type: 'numlist', minItems: 3, maxItems: 6 },
      { type: 'hotel', minItems: 2, maxItems: 3 },
      { type: 'p', minWords: 60, maxWords: 100 },
      { type: 'newsletter', width: 'full' },
    ],
  },
  {
    id: 'neighborhood-lens',
    name: 'The Neighborhood Lens',
    description: 'An authentic deep-dive into bohemian quarters, boutique lanes, and local character.',
    thumbnail: '/assets/attached_assets/japan-tourism-1.jpg',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'full-width', width: 'full', required: true },
      { type: 'h1', maxWords: 11, alignment: 'left', required: true },
      { type: 'p', minWords: 50, maxWords: 100 },
      { type: 'quote', minWords: 10, maxWords: 25, alignment: 'center' },
      { type: 'map', width: 'full' },
      { type: 'h2', maxWords: 8 },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'gallery', imageCount: 5, imageStyle: 'gallery', width: 'large' },
      { type: 'numlist', minItems: 4, maxItems: 8 },
      { type: 'hotel', minItems: 2, maxItems: 4 },
      { type: 'p', minWords: 60, maxWords: 120 },
    ],
  },
  {
    id: 'local-life',
    name: 'The Local Life',
    description: 'Where locals eat, drink, shop, and unwind away from the tourist crowds.',
    thumbnail: '/assets/attached_assets/culinary_vietnam.jpg',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'large', width: 'large', required: true },
      { type: 'h1', maxWords: 10, alignment: 'center', required: true },
      { type: 'p', minWords: 50, maxWords: 90 },
      { type: 'image', imageCount: 1, imageStyle: 'standard', imagePosition: 'left', width: 'medium' },
      { type: 'h2', maxWords: 8 },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'numlist', minItems: 5, maxItems: 10 },
      { type: 'quote', minWords: 10, maxWords: 30, alignment: 'center' },
      { type: 'gallery', imageCount: 4, imageStyle: 'gallery', width: 'large' },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'newsletter', width: 'full' },
    ],
  },
];

const THINGS_TO_DO_TEMPLATES: BlogTemplateDefinition[] = [
  {
    id: 'top-picks',
    name: 'The Top Picks',
    description: 'A curated countdown of the absolute best activities, attractions, and must-dos.',
    thumbnail: '/assets/attached_assets/exp-dubai.jpg',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'full-width', width: 'full', required: true },
      { type: 'h1', maxWords: 10, alignment: 'center', required: true },
      { type: 'p', minWords: 40, maxWords: 70 },
      { type: 'h2', maxWords: 8 },
      { type: 'numlist', minItems: 5, maxItems: 10 },
      { type: 'image', imageCount: 1, imageStyle: 'large', imagePosition: 'center', width: 'large' },
      { type: 'h2', maxWords: 8 },
      { type: 'numlist', minItems: 4, maxItems: 8 },
      { type: 'quote', minWords: 10, maxWords: 25, alignment: 'center' },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'newsletter', width: 'full' },
    ],
  },
  {
    id: 'experience-list',
    name: 'The Experience List',
    description: 'A bucket-list compilation of thrilling adventures, cultural moments, and workshops.',
    thumbnail: '/assets/attached_assets/exp-thailand.png',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'large', width: 'large', required: true },
      { type: 'h1', maxWords: 11, alignment: 'left', required: true },
      { type: 'p', minWords: 50, maxWords: 90 },
      { type: 'numlist', minItems: 6, maxItems: 12 },
      { type: 'gallery', imageCount: 6, imageStyle: 'gallery', width: 'full' },
      { type: 'h2', maxWords: 8 },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'numlist', minItems: 4, maxItems: 8 },
      { type: 'map', width: 'large' },
      { type: 'p', minWords: 60, maxWords: 120 },
    ],
  },
  {
    id: 'essential-experiences',
    name: 'The Essential Experiences',
    description: 'Signature activities you cannot afford to miss when visiting the destination.',
    thumbnail: '/assets/attached_assets/thai_pers_temple_1780483761928.png',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'standard', width: 'large', required: true },
      { type: 'h1', maxWords: 10, alignment: 'center', required: true },
      { type: 'p', minWords: 40, maxWords: 70 },
      { type: 'h2', maxWords: 8 },
      { type: 'numlist', minItems: 6, maxItems: 10 },
      { type: 'image', imageCount: 1, imageStyle: 'full-width', imagePosition: 'top', width: 'full' },
      { type: 'map', width: 'large' },
      { type: 'quote', minWords: 10, maxWords: 30, alignment: 'center' },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'newsletter', width: 'full' },
    ],
  },
  {
    id: 'experience-trail',
    name: 'The Experience Trail',
    description: 'A connected route connecting unforgettable activities from morning until evening.',
    thumbnail: '/assets/attached_assets/exp-tusc.jpg',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'full-width', width: 'full', required: true },
      { type: 'h1', maxWords: 10, alignment: 'left', required: true },
      { type: 'p', minWords: 40, maxWords: 80 },
      { type: 'map', width: 'full' },
      { type: 'h2', maxWords: 8 },
      { type: 'numlist', minItems: 4, maxItems: 8 },
      { type: 'image', imageCount: 1, imageStyle: 'large', imagePosition: 'right', width: 'large' },
      { type: 'gallery', imageCount: 3, imageStyle: 'gallery', width: 'large' },
      { type: 'quote', minWords: 10, maxWords: 25, alignment: 'center' },
      { type: 'p', minWords: 60, maxWords: 120 },
    ],
  },
  {
    id: 'perfect-day',
    name: 'The Perfect Day',
    description: 'A morning-to-night curated schedule showcasing the finest experiences in a single day.',
    thumbnail: '/assets/attached_assets/culinary_thai.jpg',
    blocks: [
      { type: 'cover', imageCount: 1, imageStyle: 'large', width: 'large', required: true },
      { type: 'h1', maxWords: 10, alignment: 'center', required: true },
      { type: 'p', minWords: 40, maxWords: 70 },
      { type: 'image', imageCount: 1, imageStyle: 'standard', imagePosition: 'center', width: 'medium' },
      { type: 'h2', maxWords: 8 },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'numlist', minItems: 6, maxItems: 8 },
      { type: 'hotel', minItems: 2, maxItems: 3 },
      { type: 'gallery', imageCount: 4, imageStyle: 'gallery', width: 'large' },
      { type: 'p', minWords: 60, maxWords: 120 },
      { type: 'newsletter', width: 'full' },
    ],
  },
];

const TEMPLATE_AUTHORING_PROFILES: Record<string, TemplateAuthoringProfile> = {
  'the-complete-escape': {
    purpose: 'Comprehensive destination guide with practical information and broad coverage.',
    contentDensity: 'balanced',
    imageStrategy: 'balanced',
    editorialRhythm: 'practical',
    recommendedTextRange: { minWords: 80, maxWords: 180 },
    recommendedImageCount: { min: 3, max: 6 },
    recommendedListDensity: { minItems: 2, maxItems: 6 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'h2', 'map', 'hotel', 'quote'],
      optional: ['gallery', 'newsletter'],
    },
    highlightUsage: ['tip', 'important', 'quick-fact'],
    typographyBias: 'balanced editorial',
    layoutBias: 'wide practical',
  },
  'the-explorer': {
    purpose: 'Discovery-led narrative with a stronger visual exploration rhythm.',
    contentDensity: 'balanced',
    imageStrategy: 'image-led',
    editorialRhythm: 'visual',
    recommendedTextRange: { minWords: 40, maxWords: 120 },
    recommendedImageCount: { min: 4, max: 8 },
    recommendedListDensity: { minItems: 2, maxItems: 6 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'image', 'map', 'numlist'],
      optional: ['gallery', 'quote'],
    },
    highlightUsage: ['editor-note', 'tip', 'quick-fact'],
    typographyBias: 'exploration-forward editorial',
    layoutBias: 'wide visual',
  },
  'the-essential-guide': {
    purpose: 'Fast, practical city or destination planning with scannable sections.',
    contentDensity: 'light',
    imageStrategy: 'text-led',
    editorialRhythm: 'scannable',
    recommendedTextRange: { minWords: 35, maxWords: 100 },
    recommendedImageCount: { min: 2, max: 5 },
    recommendedListDensity: { minItems: 3, maxItems: 8 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'h2', 'numlist', 'map'],
      optional: ['image', 'quote', 'hotel'],
    },
    highlightUsage: ['quick-fact', 'tip', 'important'],
    typographyBias: 'compact practical',
    layoutBias: 'standard scannable',
  },
  'the-local-lens': {
    purpose: 'Local culture and neighborhood-driven perspective with narrative texture.',
    contentDensity: 'balanced',
    imageStrategy: 'balanced',
    editorialRhythm: 'narrative',
    recommendedTextRange: { minWords: 50, maxWords: 140 },
    recommendedImageCount: { min: 3, max: 7 },
    recommendedListDensity: { minItems: 2, maxItems: 6 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'quote', 'gallery', 'map'],
      optional: ['hotel', 'newsletter'],
    },
    highlightUsage: ['tip', 'editor-note', 'quick-fact'],
    typographyBias: 'editorial narrative',
    layoutBias: 'wide local',
  },
  'the-hidden-route': {
    purpose: 'Stealth discovery with hidden gems, maps, and discovery-driven visuals.',
    contentDensity: 'balanced',
    imageStrategy: 'image-led',
    editorialRhythm: 'visual',
    recommendedTextRange: { minWords: 40, maxWords: 120 },
    recommendedImageCount: { min: 4, max: 8 },
    recommendedListDensity: { minItems: 2, maxItems: 6 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'image', 'map', 'gallery'],
      optional: ['quote', 'newsletter'],
    },
    highlightUsage: ['tip', 'important', 'editor-note'],
    typographyBias: 'discovery editorial',
    layoutBias: 'wide discovery',
  },
  'classic-journey': {
    purpose: 'Balanced day-by-day itinerary with practical route and stay guidance.',
    contentDensity: 'balanced',
    imageStrategy: 'balanced',
    editorialRhythm: 'practical',
    recommendedTextRange: { minWords: 50, maxWords: 120 },
    recommendedImageCount: { min: 3, max: 5 },
    recommendedListDensity: { minItems: 3, maxItems: 8 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'h2', 'map', 'hotel', 'numlist'],
      optional: ['quote', 'newsletter'],
    },
    highlightUsage: ['tip', 'quick-fact', 'important'],
    typographyBias: 'clear practical',
    layoutBias: 'standard route',
  },
  'detailed-route': {
    purpose: 'Detailed route planning with more explanation and more practical notes.',
    contentDensity: 'dense',
    imageStrategy: 'balanced',
    editorialRhythm: 'practical',
    recommendedTextRange: { minWords: 60, maxWords: 160 },
    recommendedImageCount: { min: 2, max: 5 },
    recommendedListDensity: { minItems: 3, maxItems: 8 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'map', 'numlist', 'hotel'],
      optional: ['quote', 'image'],
    },
    highlightUsage: ['important', 'tip', 'warning'],
    typographyBias: 'detailed practical',
    layoutBias: 'standard detailed',
  },
  'complete-trip': {
    purpose: 'End-to-end trip planning with accommodation, food, travel, and practical notes.',
    contentDensity: 'dense',
    imageStrategy: 'gallery-heavy',
    editorialRhythm: 'practical',
    recommendedTextRange: { minWords: 80, maxWords: 180 },
    recommendedImageCount: { min: 4, max: 8 },
    recommendedListDensity: { minItems: 4, maxItems: 10 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'numlist', 'gallery', 'hotel', 'map'],
      optional: ['quote', 'video', 'newsletter'],
    },
    highlightUsage: ['important', 'tip', 'quick-fact'],
    typographyBias: 'planning-focused editorial',
    layoutBias: 'full practical',
  },
  'scenic-trail': {
    purpose: 'Visual road-trip and route story emphasizing scenic stops and imagery.',
    contentDensity: 'balanced',
    imageStrategy: 'image-led',
    editorialRhythm: 'visual',
    recommendedTextRange: { minWords: 40, maxWords: 120 },
    recommendedImageCount: { min: 4, max: 7 },
    recommendedListDensity: { minItems: 3, maxItems: 7 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'image', 'map', 'gallery'],
      optional: ['quote', 'numlist'],
    },
    highlightUsage: ['tip', 'editor-note'],
    typographyBias: 'scenic visual editorial',
    layoutBias: 'wide route',
  },
  'slow-journey': {
    purpose: 'Relaxed travel pace with longer narrative beats and generous whitespace.',
    contentDensity: 'balanced',
    imageStrategy: 'balanced',
    editorialRhythm: 'narrative',
    recommendedTextRange: { minWords: 60, maxWords: 140 },
    recommendedImageCount: { min: 3, max: 6 },
    recommendedListDensity: { minItems: 2, maxItems: 6 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'quote', 'image', 'hotel'],
      optional: ['numlist', 'newsletter'],
    },
    highlightUsage: ['editor-note', 'tip'],
    typographyBias: 'slow narrative editorial',
    layoutBias: 'spacious narrative',
  },
  'the-journey': {
    purpose: 'Narrative travel story that follows a beginning, key moments, and reflection.',
    contentDensity: 'balanced',
    imageStrategy: 'balanced',
    editorialRhythm: 'narrative',
    recommendedTextRange: { minWords: 80, maxWords: 180 },
    recommendedImageCount: { min: 3, max: 5 },
    recommendedListDensity: { minItems: 0, maxItems: 4 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'quote', 'image', 'h2'],
      optional: ['newsletter'],
    },
    highlightUsage: ['editor-note', 'quick-fact'],
    typographyBias: 'immersive narrative',
    layoutBias: 'wide narrative',
  },
  'photo-story': {
    purpose: 'Photography-first story with wide visuals and lighter supporting text.',
    contentDensity: 'light',
    imageStrategy: 'gallery-heavy',
    editorialRhythm: 'visual',
    recommendedTextRange: { minWords: 40, maxWords: 100 },
    recommendedImageCount: { min: 6, max: 10 },
    recommendedListDensity: { minItems: 0, maxItems: 2 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'gallery', 'image', 'quote'],
      optional: ['newsletter'],
    },
    highlightUsage: ['quick-fact', 'editor-note'],
    typographyBias: 'visual image-led',
    layoutBias: 'full visual',
  },
  'travel-diary': {
    purpose: 'Personal diary rhythm with reflective text and intimate observations.',
    contentDensity: 'balanced',
    imageStrategy: 'balanced',
    editorialRhythm: 'narrative',
    recommendedTextRange: { minWords: 70, maxWords: 180 },
    recommendedImageCount: { min: 3, max: 6 },
    recommendedListDensity: { minItems: 0, maxItems: 4 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'quote', 'image', 'h2'],
      optional: ['newsletter'],
    },
    highlightUsage: ['editor-note', 'tip'],
    typographyBias: 'reflective narrative',
    layoutBias: 'wide diary',
  },
  'memory-trail': {
    purpose: 'Emotion-driven reflective travel story with fewer but stronger images.',
    contentDensity: 'balanced',
    imageStrategy: 'image-led',
    editorialRhythm: 'narrative',
    recommendedTextRange: { minWords: 80, maxWords: 180 },
    recommendedImageCount: { min: 3, max: 6 },
    recommendedListDensity: { minItems: 0, maxItems: 3 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'quote', 'gallery', 'image'],
      optional: ['newsletter'],
    },
    highlightUsage: ['editor-note', 'important'],
    typographyBias: 'emotive editorial',
    layoutBias: 'spacious reflective',
  },
  'postcard-story': {
    purpose: 'Short, vivid travel note designed to feel visual and compact.',
    contentDensity: 'light',
    imageStrategy: 'image-led',
    editorialRhythm: 'visual',
    recommendedTextRange: { minWords: 40, maxWords: 100 },
    recommendedImageCount: { min: 3, max: 6 },
    recommendedListDensity: { minItems: 0, maxItems: 2 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'gallery', 'quote', 'image'],
      optional: ['newsletter'],
    },
    highlightUsage: ['tip', 'quick-fact'],
    typographyBias: 'short visual',
    layoutBias: 'compact visual',
  },
  'complete-city': {
    purpose: 'Comprehensive city guide covering neighborhoods, dining, stay, and practical essentials.',
    contentDensity: 'dense',
    imageStrategy: 'balanced',
    editorialRhythm: 'practical',
    recommendedTextRange: { minWords: 60, maxWords: 160 },
    recommendedImageCount: { min: 3, max: 7 },
    recommendedListDensity: { minItems: 4, maxItems: 10 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'map', 'numlist', 'hotel', 'gallery'],
      optional: ['quote', 'newsletter'],
    },
    highlightUsage: ['important', 'tip', 'quick-fact'],
    typographyBias: 'reference editorial',
    layoutBias: 'wide reference',
  },
  'city-essentials': {
    purpose: 'Scannable city planning guide built around essentials and quick decisions.',
    contentDensity: 'light',
    imageStrategy: 'text-led',
    editorialRhythm: 'scannable',
    recommendedTextRange: { minWords: 40, maxWords: 100 },
    recommendedImageCount: { min: 2, max: 5 },
    recommendedListDensity: { minItems: 4, maxItems: 8 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'h2', 'numlist', 'hotel', 'map'],
      optional: ['quote', 'image'],
    },
    highlightUsage: ['quick-fact', 'tip', 'warning'],
    typographyBias: 'compact practical',
    layoutBias: 'standard scannable',
  },
  'weekend-edit': {
    purpose: 'Short city break format with a compact itinerary and fewer sections.',
    contentDensity: 'light',
    imageStrategy: 'balanced',
    editorialRhythm: 'practical',
    recommendedTextRange: { minWords: 40, maxWords: 100 },
    recommendedImageCount: { min: 3, max: 5 },
    recommendedListDensity: { minItems: 3, maxItems: 6 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'h2', 'gallery', 'numlist', 'hotel'],
      optional: ['newsletter'],
    },
    highlightUsage: ['important', 'tip'],
    typographyBias: 'travel-short practical',
    layoutBias: 'compact weekend',
  },
  'neighborhood-lens': {
    purpose: 'Neighborhood-first city exploration with local flavor and map-led discovery.',
    contentDensity: 'balanced',
    imageStrategy: 'image-led',
    editorialRhythm: 'visual',
    recommendedTextRange: { minWords: 50, maxWords: 120 },
    recommendedImageCount: { min: 4, max: 7 },
    recommendedListDensity: { minItems: 4, maxItems: 8 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'map', 'gallery', 'quote'],
      optional: ['hotel', 'numlist'],
    },
    highlightUsage: ['tip', 'editor-note', 'quick-fact'],
    typographyBias: 'local discovery editorial',
    layoutBias: 'wide neighborhood',
  },
  'local-life': {
    purpose: 'Everyday local culture with food, neighborhoods, and lived-in city rhythm.',
    contentDensity: 'balanced',
    imageStrategy: 'balanced',
    editorialRhythm: 'narrative',
    recommendedTextRange: { minWords: 60, maxWords: 140 },
    recommendedImageCount: { min: 4, max: 6 },
    recommendedListDensity: { minItems: 4, maxItems: 10 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'image', 'h2', 'numlist', 'quote'],
      optional: ['gallery', 'newsletter'],
    },
    highlightUsage: ['editor-note', 'tip', 'quick-fact'],
    typographyBias: 'local narrative',
    layoutBias: 'balanced local',
  },
  'top-picks': {
    purpose: 'Ranked experiences highlighting the strongest moments without too much clutter.',
    contentDensity: 'light',
    imageStrategy: 'balanced',
    editorialRhythm: 'scannable',
    recommendedTextRange: { minWords: 40, maxWords: 90 },
    recommendedImageCount: { min: 3, max: 6 },
    recommendedListDensity: { minItems: 5, maxItems: 10 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'h2', 'numlist', 'image'],
      optional: ['quote', 'newsletter'],
    },
    highlightUsage: ['quick-fact', 'tip'],
    typographyBias: 'ranked scannable',
    layoutBias: 'compact ranked',
  },
  'experience-list': {
    purpose: 'Broad activity catalogue with consistent item structure and many options.',
    contentDensity: 'dense',
    imageStrategy: 'gallery-heavy',
    editorialRhythm: 'scannable',
    recommendedTextRange: { minWords: 50, maxWords: 120 },
    recommendedImageCount: { min: 4, max: 8 },
    recommendedListDensity: { minItems: 6, maxItems: 12 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'numlist', 'gallery', 'map'],
      optional: ['quote', 'newsletter'],
    },
    highlightUsage: ['important', 'tip', 'quick-fact'],
    typographyBias: 'catalogue practical',
    layoutBias: 'standard catalogue',
  },
  'essential-experiences': {
    purpose: 'Must-do focus with a smaller set of stronger experiences and clearer hierarchy.',
    contentDensity: 'balanced',
    imageStrategy: 'image-led',
    editorialRhythm: 'practical',
    recommendedTextRange: { minWords: 60, maxWords: 120 },
    recommendedImageCount: { min: 3, max: 5 },
    recommendedListDensity: { minItems: 6, maxItems: 10 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'numlist', 'image', 'map'],
      optional: ['quote', 'newsletter'],
    },
    highlightUsage: ['important', 'tip'],
    typographyBias: 'must-do editorial',
    layoutBias: 'wide focused',
  },
  'experience-trail': {
    purpose: 'Route-led experience sequence connecting a day or chapter in order.',
    contentDensity: 'balanced',
    imageStrategy: 'image-led',
    editorialRhythm: 'visual',
    recommendedTextRange: { minWords: 40, maxWords: 100 },
    recommendedImageCount: { min: 4, max: 6 },
    recommendedListDensity: { minItems: 4, maxItems: 8 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'map', 'numlist', 'gallery'],
      optional: ['quote'],
    },
    highlightUsage: ['tip', 'quick-fact'],
    typographyBias: 'route visual',
    layoutBias: 'wide route',
  },
  'perfect-day': {
    purpose: 'Curated one-day flow that feels itinerary-like and highly usable.',
    contentDensity: 'balanced',
    imageStrategy: 'balanced',
    editorialRhythm: 'practical',
    recommendedTextRange: { minWords: 60, maxWords: 120 },
    recommendedImageCount: { min: 3, max: 5 },
    recommendedListDensity: { minItems: 6, maxItems: 8 },
    sectionGuidance: {
      required: ['cover', 'h1'],
      recommended: ['p', 'image', 'numlist', 'hotel'],
      optional: ['gallery', 'newsletter'],
    },
    highlightUsage: ['tip', 'important'],
    typographyBias: 'day-plan practical',
    layoutBias: 'balanced day-plan',
  },
};

const TEMPLATES_BY_FORMAT: Record<Exclude<BlogFormat, 'blank'>, BlogTemplateDefinition[]> = {
  'destination-guide': [],
  'itinerary': [],
  'travel-story': [],
  'city-guide': [],
  'things-to-do': [],
};

const TEMPLATE_DEFAULTS: Record<Exclude<BlogFormat, 'blank'>, Pick<BlogTemplateDefinition, 'typography' | 'layout'>> = {
  'destination-guide': {
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
  'itinerary': {
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
  'travel-story': {
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
  'city-guide': {
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
      sidebar: 'right',
    },
  },
  'things-to-do': {
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

const addTemplateDefaults = (format: Exclude<BlogFormat, 'blank'>, template: BlogTemplateDefinition): BlogTemplateDefinition => ({
  ...template,
  profile: template.profile ?? TEMPLATE_AUTHORING_PROFILES[template.id] ?? undefined,
  typography: template.typography ?? TEMPLATE_DEFAULTS[format].typography,
  layout: template.layout ?? TEMPLATE_DEFAULTS[format].layout,
});

for (const format of Object.keys(TEMPLATE_DEFAULTS) as Exclude<BlogFormat, 'blank'>[]) {
  const templates = {
    'destination-guide': DESTINATION_TEMPLATES,
    'itinerary': ITINERARY_TEMPLATES,
    'travel-story': TRAVEL_STORY_TEMPLATES,
    'city-guide': CITY_GUIDE_TEMPLATES,
    'things-to-do': THINGS_TO_DO_TEMPLATES,
  }[format];
  TEMPLATES_BY_FORMAT[format] = templates.map((template) => addTemplateDefaults(format, template));
}

const FORMAT_GALLERY_INFO: Record<Exclude<BlogFormat, 'blank'>, { title: string; subtitle: string }> = {
  'destination-guide': {
    title: 'Destination Guide',
    subtitle: 'Choose a starting template for your destination story.',
  },
  'itinerary': {
    title: '3/5/7-Day Itinerary',
    subtitle: 'Choose a starting template for your day-by-day travel plan.',
  },
  'travel-story': {
    title: 'Travel Story',
    subtitle: 'Choose a starting template for your personal travel narrative.',
  },
  'city-guide': {
    title: 'City Guide',
    subtitle: 'Choose a starting template for your metropolitan guide.',
  },
  'things-to-do': {
    title: 'Things To Do',
    subtitle: 'Choose a starting template for your curated activity list.',
  },
};

const makeId = () => `b${Math.random().toString(36).slice(2, 10)}`;

const createDefaultBlock = (type: BlockType, settings?: PostBlockSettings): PostBlock => {
  switch (type) {
    case 'h1': case 'h2': case 'h3': case 'p':
      return { id: makeId(), type, text: '' };
    case 'quote':
      return { id: makeId(), type, text: '', cite: '' };
    case 'image': case 'cover':
      return { id: makeId(), type, src: '', caption: '' };
    case 'gallery':
      return { id: makeId(), type, images: Array.from({ length: settings?.imageCount ?? 0 }, () => '') };
    case 'numlist':
      return {
        id: makeId(),
        type,
        items: Array.from({ length: Math.max(1, settings?.minItems ?? 1) }, (_, index) => ({
          n: index + 1,
          title: `Item ${index + 1}`,
          loc: '',
          body: '',
          img: '',
        })),
      };
    case 'hotel':
      return { id: makeId(), type, kicker: "Editor's pick", name: '', loc: '', desc: '', price: '', nights: '', img: '' };
    case 'map':
      return { id: makeId(), type, pins: [{ x: 50, y: 50, label: 'Pin label' }] };
    case 'video':
      return { id: makeId(), type, url: '' };
    case 'newsletter':
      return { id: makeId(), type, title: 'Join the newsletter', body: '' };
    default:
      return { id: makeId(), type, text: '' };
  }
};

const defaultBlock = (type: BlockType, settings?: PostBlockSettings): PostBlock => {
  const block = createDefaultBlock(type, settings);
  return settings ? { ...block, settings } : block;
};

const templateBlockSettings = (block: BlogTemplateBlock, profile?: TemplateAuthoringProfile): PostBlockSettings => {
  const explicitSettings = Object.fromEntries(
    Object.entries(block).filter(([key]) => key !== 'type'),
  ) as PostBlockSettings;

  const guidance = profile?.blockGuidance?.[block.type];
  const isTextBlock = block.type === 'p';
  const isListBlock = block.type === 'numlist';

  return {
    ...explicitSettings,
    ...(isTextBlock && (guidance?.recommendedTextRange || profile?.recommendedTextRange)
      ? {
        minWords: explicitSettings.minWords ?? guidance?.recommendedTextRange?.minWords ?? profile?.recommendedTextRange?.minWords,
        maxWords: explicitSettings.maxWords ?? guidance?.recommendedTextRange?.maxWords ?? profile?.recommendedTextRange?.maxWords,
      }
      : {}),
    ...(isListBlock && (guidance?.recommendedItemRange || profile?.recommendedListDensity)
      ? {
        minItems: explicitSettings.minItems ?? guidance?.recommendedItemRange?.minItems ?? profile?.recommendedListDensity?.minItems,
        maxItems: explicitSettings.maxItems ?? guidance?.recommendedItemRange?.maxItems ?? profile?.recommendedListDensity?.maxItems,
      }
      : {}),
    ...(guidance?.recommendedImageCount && explicitSettings.imageCount === undefined
      ? { imageCount: guidance.recommendedImageCount.min ?? guidance.recommendedImageCount.max }
      : {}),
    ...(guidance?.imageStyle && explicitSettings.imageStyle === undefined
      ? { imageStyle: guidance.imageStyle as PostBlockSettings['imageStyle'] }
      : {}),
  };
};

const templateBlocksToPostBlocks = (templateBlocks: BlogTemplateBlock[], profile?: TemplateAuthoringProfile): PostBlock[] => {
  return templateBlocks.map((block) => {
    const settings = templateBlockSettings(block, profile);
    return defaultBlock(block.type, Object.keys(settings).length > 0 ? settings : undefined);
  });
};

const createEmptyPost = (): Omit<Post, 'id'> => {
  const timestamp = `${Date.now()}`;
  return {
    title: `Untitled blog ${timestamp}`,
    subtitle: 'Add a subtitle',
    slug: `untitled-blog-${timestamp}`,
    excerpt: 'Add your excerpt here.',
    cover: { src: 'https://placehold.co/1200x630', caption: 'Cover image caption', alt: '' },
    author: { name: 'Author Name', role: 'Contributor', initials: 'AN', avatar: 'https://placehold.co/100x100' },
    categories: ['Journal'],
    tags: ['blog'],
    readingTime: 1,
    publishDate: new Date().toISOString().slice(0, 10),
    status: 'draft',
    featured: false,
    seo: { title: '', description: '', ogImage: 'https://placehold.co/1200x630', ogImageAlt: '', canonicalUrl: '' },
    blocks: [defaultBlock('p')],
    related: [],
  };
};

const BLOG_CATEGORY_OPTIONS = [
  'All Stories',
  'Adventure',
  'Food & Drink',
  'Culture',
  'Travel Tips',
  'Hidden Gems',
  'Nature',
] as const;

const ALL_STORIES_CATEGORY = BLOG_CATEGORY_OPTIONS[0];

const CategoryMultiSelect: React.FC<{
  value: string[];
  onChange: (categories: string[]) => void;
  inputStyle: React.CSSProperties;
}> = ({ value, onChange, inputStyle }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedCategories = value.filter((category) => category !== ALL_STORIES_CATEGORY);
  const legacyCategories = selectedCategories.filter(
    (category) => !(BLOG_CATEGORY_OPTIONS as readonly string[]).includes(category),
  );
  const options = [
    ...BLOG_CATEGORY_OPTIONS.slice(1),
    ...legacyCategories,
  ];

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [open]);

  const toggleCategory = (category: string) => {
    const nextCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((selected) => selected !== category)
      : [...selectedCategories, category];
    onChange(nextCategories);
  };

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        style={{
          ...inputStyle,
          position: 'relative',
          paddingRight: 36,
          textAlign: 'left',
          cursor: 'pointer',
          color: selectedCategories.length ? '#222' : '#777',
        }}
      >
        {selectedCategories.length ? selectedCategories.join(', ') : ALL_STORIES_CATEGORY}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: 14,
            top: '50%',
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '6px solid #555',
            transform: `translateY(-25%) rotate(${open ? '180deg' : '0deg'})`,
            transition: 'transform 120ms ease',
          }}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Blog categories"
          aria-multiselectable="true"
          style={{
            position: 'absolute',
            zIndex: 20,
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            maxHeight: 240,
            overflowY: 'auto',
            padding: 6,
            border: '1px solid #ddd',
            borderRadius: 10,
            background: '#fff',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.12)',
          }}
        >
          <button
            type="button"
            onClick={() => onChange([])}
            style={{
              display: 'flex',
              width: '100%',
              alignItems: 'center',
              gap: 8,
              padding: '9px 8px',
              border: 0,
              borderRadius: 7,
              background: selectedCategories.length ? 'transparent' : '#f4f4f4',
              color: '#333',
              cursor: 'pointer',
              textAlign: 'left',
              fontSize: 14,
            }}
          >
            <input type="checkbox" checked={!selectedCategories.length} readOnly tabIndex={-1} />
            {ALL_STORIES_CATEGORY}
          </button>

          {options.map((category) => (
            <label
              key={category}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '9px 8px',
                borderRadius: 7,
                cursor: 'pointer',
                fontSize: 14,
              }}
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => toggleCategory(category)}
              />
              {category}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Reusable image upload field ──────────────────────────────────────────────
const ImageUploadField: React.FC<{
  label: string;
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  previewHeight?: number;
}> = ({ label, value, onChange, placeholder = 'Paste image URL or upload', previewHeight = 160 }) => {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await uploadBlogImage(file);
      if (response.success) onChange(response.data.url);
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value ='';
    }
  };

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: '#555', textTransform: 'uppercase', letterSpacing: '.08em' }}>{label}</label>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ backgroundColor: uploading ? '#ccc' : '#007bff', color: '#fff', whiteSpace: 'nowrap' }}
        >
          {uploading ? '⏳ Uploading…' : '📤 Upload'}
        </button>
        {value && <span style={{ fontSize: 12, color: '#28a745' }}>✓ Image set</span>}
      </div>
      <input
        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={uploading}
      />
      {value && (
        <div style={{ borderRadius: 10, overflow: 'hidden', maxHeight: previewHeight, background: '#f0f0f0' }}>
          <img src={value} alt="Preview" style={{ width: '100%', maxHeight: previewHeight, objectFit: 'cover' }} />
        </div>
      )}
    </div>
  );
};

const isUsableImageUrl = (value: string): boolean => {
  const url = value.trim();
  if (!url) return false;
  if (url.startsWith('/') || url.startsWith('data:image/')) return true;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

const GalleryImageField: React.FC<{
  images: string[];
  onChange: (images: string[]) => void;
}> = ({ images, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setUploadError(null);
    const uploaded: string[] = [];
    const failed: string[] = [];

    for (const file of files) {
      try {
        const response = await uploadBlogImage(file);
        if (response.success && isUsableImageUrl(response.data.url)) {
          uploaded.push(response.data.url);
        } else {
          failed.push(file.name);
        }
      } catch {
        failed.push(file.name);
      }
    }

    if (uploaded.length) onChange([...images, ...uploaded]);
    if (failed.length) {
      setUploadError(`Could not upload: ${failed.join(', ')}`);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!isUsableImageUrl(url)) {
      setUploadError('Enter a valid http(s) image URL.');
      return;
    }
    onChange([...images, url]);
    setUrlInput('');
    setUploadError(null);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, imageIndex) => imageIndex !== index));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= images.length) return;
    const next = [...images];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  };

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          disabled={uploading}
          style={{ display: 'none' }}
        />
        <button type="button" className="btn btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? '⏳ Uploading…' : '📤 Upload images'}
        </button>
        <span style={{ fontSize: 12, color: '#777' }}>
          {uploading ? 'Uploading selected images…' : 'Select one or more files'}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          style={{ flex: 1, minWidth: 180, padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl(); } }}
          placeholder="Paste an image URL"
          disabled={uploading}
        />
        <button type="button" className="btn btn-sm" onClick={addUrl} disabled={uploading || !urlInput.trim()}>
          Add URL
        </button>
      </div>

      {uploadError && <div style={{ color: '#b42318', fontSize: 12 }}>{uploadError}</div>}

      {images.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {images.map((src, index) => (
            <div key={`${src}-${index}`} style={{ border: '1px solid #eee', borderRadius: 10, padding: 8, background: '#fafafa' }}>
              <div style={{ aspectRatio: '4 / 3', borderRadius: 7, overflow: 'hidden', background: '#f0f0f0', marginBottom: 8 }}>
                {src ? (
                  <img src={src} alt={`Gallery image ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: '100%', display: 'grid', placeItems: 'center', color: '#999', fontSize: 12 }}>Empty slot</div>
                )}
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-xs" onClick={() => moveImage(index, -1)} disabled={index === 0} title="Move image left">←</button>
                <button type="button" className="btn btn-xs" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} title="Move image right">→</button>
                <button type="button" className="btn btn-xs" onClick={() => removeImage(index)} style={{ color: '#dc3545' }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const TEXT_BLOCK_TYPES: BlockType[] = ['h1', 'h2', 'h3', 'p', 'quote'];

const typographySelectStyle: React.CSSProperties = {
  width: '100%',
  padding: '7px 8px',
  borderRadius: 8,
  border: '1px solid #ddd',
  background: '#fff',
  fontSize: 12,
};

const typographyFieldLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: '#777',
  display: 'block',
  marginBottom: 4,
  textTransform: 'uppercase',
  letterSpacing: '.06em',
};

const TextBlockSettings: React.FC<{
  block: PostBlock;
  onChange: (settings: PostBlockSettings | undefined) => void;
}> = ({ block, onChange }) => {
  if (!TEXT_BLOCK_TYPES.includes(block.type)) return null;

  const typography = block.settings?.typography;
  const layout = block.settings?.layout;

  const updateTypography = (
    patch: Partial<TypographyOverrides> = {},
    clearKey?: keyof TypographyOverrides,
  ) => {
    const nextTypography: TypographyOverrides = { ...typography, ...patch };
    if (clearKey) delete nextTypography[clearKey];

    const nextSettings: PostBlockSettings = { ...block.settings };
    if (Object.keys(nextTypography).length > 0) {
      nextSettings.typography = nextTypography;
    } else {
      delete nextSettings.typography;
    }

    onChange(Object.keys(nextSettings).length > 0 ? nextSettings : undefined);
  };

  const updateLayout = (
    patch: Partial<LayoutOverrides> = {},
    clearKey?: keyof LayoutOverrides,
  ) => {
    const nextLayout: LayoutOverrides = { ...layout, ...patch };
    if (clearKey) delete nextLayout[clearKey];

    const nextSettings: PostBlockSettings = { ...block.settings };
    if (Object.keys(nextLayout).length > 0) {
      nextSettings.layout = nextLayout;
    } else {
      delete nextSettings.layout;
    }

    onChange(Object.keys(nextSettings).length > 0 ? nextSettings : undefined);
  };

  const updateHighlight = (highlight: BlogHighlight) => {
    const nextSettings: PostBlockSettings = { ...block.settings };
    if (highlight === 'none') {
      delete nextSettings.highlight;
    } else {
      nextSettings.highlight = highlight;
    }
    onChange(Object.keys(nextSettings).length > 0 ? nextSettings : undefined);
  };

  const selectTypography = <K extends keyof TypographyOverrides>(key: K, value: string) => {
    if (value === 'template-default') {
      updateTypography({}, key);
      return;
    }
    updateTypography({ [key]: value as TypographyOverrides[K] } as Partial<TypographyOverrides>);
  };

  const selectLayout = <K extends keyof LayoutOverrides>(key: K, value: string) => {
    if (value === 'template-default') {
      updateLayout({}, key);
      return;
    }
    updateLayout({ [key]: value as LayoutOverrides[K] } as Pick<LayoutOverrides, K>);
  };

  return (
    <details style={{ marginTop: 12, border: '1px solid #eee', borderRadius: 10, background: '#fafafa' }}>
      <summary style={{ cursor: 'pointer', padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#555' }}>Formatting & layout</summary>
      <fieldset style={{ padding: '0 12px 12px', border: 0 }}>
        <legend className="sr-only">Formatting and layout settings</legend>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
        <label>
          <span style={typographyFieldLabel}>Font</span>
          <select
            aria-label="Text font"
            style={typographySelectStyle}
            value={typography?.fontFamily || 'template-default'}
            onChange={(e) => selectTypography('fontFamily', e.target.value)}
          >
            <option value="template-default">Template Default</option>
            <option value="plumtrips-editorial">PlumTrips Editorial</option>
            <option value="georgia">Georgia</option>
            <option value="arial">Arial</option>
            <option value="times-new-roman">Times New Roman</option>
            <option value="tahoma">Tahoma</option>
          </select>
        </label>

        <label>
          <span style={typographyFieldLabel}>Size</span>
          <select
            aria-label="Text size"
            style={typographySelectStyle}
            value={typography?.size || 'template-default'}
            onChange={(e) => selectTypography('size', e.target.value)}
          >
            <option value="template-default">Template Default</option>
            <option value="small">Small</option>
            <option value="normal">Normal</option>
            <option value="large">Large</option>
            <option value="xl">XL</option>
          </select>
        </label>

        <label>
          <span style={typographyFieldLabel}>Alignment</span>
          <select
            aria-label="Text alignment"
            style={typographySelectStyle}
            value={typography?.alignment || 'template-default'}
            onChange={(e) => selectTypography('alignment', e.target.value)}
          >
            <option value="template-default">Template Default</option>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>

        <label>
          <span style={typographyFieldLabel}>Color</span>
          <select
            aria-label="Text color"
            style={typographySelectStyle}
            value={typography?.color || 'template-default'}
            onChange={(e) => selectTypography('color', e.target.value)}
          >
            <option value="template-default">Template Default</option>
            <option value="heading">Heading</option>
            <option value="accent">Accent</option>
            <option value="muted">Muted</option>
            <option value="custom">Custom</option>
          </select>
        </label>

        <label>
          <span style={typographyFieldLabel}>Highlight</span>
          <select
            aria-label="Text highlight"
            style={typographySelectStyle}
            value={block.settings?.highlight || 'none'}
            onChange={(e) => updateHighlight(e.target.value as BlogHighlight)}
          >
            <option value="none">None</option>
            <option value="tip">Tip</option>
            <option value="important">Important</option>
            <option value="warning">Warning</option>
            <option value="quick-fact">Quick Fact</option>
            <option value="editor-note">Editor Note</option>
            <option value="custom">Custom</option>
          </select>
        </label>

        <div>
          <span style={typographyFieldLabel}>Formatting</span>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', minHeight: 31 }}>
            <label style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: 12 }}>
              <input
                type="checkbox"
                checked={typography?.bold === true}
                onChange={(e) => updateTypography({ bold: e.target.checked })}
              />
              Bold
            </label>
            <label style={{ display: 'flex', gap: 5, alignItems: 'center', fontSize: 12 }}>
              <input
                type="checkbox"
                checked={typography?.italic === true}
                onChange={(e) => updateTypography({ italic: e.target.checked })}
              />
              Italic
            </label>
          </div>
        </div>

        <label>
          <span style={typographyFieldLabel}>Content width</span>
          <select
            aria-label="Content width"
            style={typographySelectStyle}
            value={layout?.contentWidth || 'template-default'}
            onChange={(e) => selectLayout('contentWidth', e.target.value)}
          >
            <option value="template-default">Template Default</option>
            <option value="narrow">Narrow</option>
            <option value="standard">Standard</option>
            <option value="wide">Wide</option>
            <option value="full">Full</option>
          </select>
        </label>

        <label>
          <span style={typographyFieldLabel}>Text alignment</span>
          <select
            aria-label="Text alignment override"
            style={typographySelectStyle}
            value={layout?.textAlignment || 'template-default'}
            onChange={(e) => selectLayout('textAlignment', e.target.value)}
          >
            <option value="template-default">Template Default</option>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>

        <label>
          <span style={typographyFieldLabel}>Section spacing</span>
          <select
            aria-label="Section spacing"
            style={typographySelectStyle}
            value={layout?.sectionSpacing || 'template-default'}
            onChange={(e) => selectLayout('sectionSpacing', e.target.value)}
          >
            <option value="template-default">Template Default</option>
            <option value="compact">Compact</option>
            <option value="standard">Normal</option>
            <option value="relaxed">Spacious</option>
          </select>
        </label>

        <label>
          <span style={typographyFieldLabel}>Sidebar</span>
          <select
            aria-label="Sidebar override"
            style={typographySelectStyle}
            value={layout?.sidebar || 'template-default'}
            onChange={(e) => selectLayout('sidebar', e.target.value)}
          >
            <option value="template-default">Template Default</option>
            <option value="none">None</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </label>

        {['image', 'cover'].includes(block.type) && (
          <>
            <label>
              <span style={typographyFieldLabel}>Image width</span>
              <select
                aria-label="Image width"
                style={typographySelectStyle}
                value={layout?.imageWidth || 'template-default'}
                onChange={(e) => selectLayout('imageWidth', e.target.value)}
              >
                <option value="template-default">Template Default</option>
                <option value="narrow">Narrow</option>
                <option value="standard">Standard</option>
                <option value="wide">Wide</option>
                <option value="full">Full</option>
              </select>
            </label>

            <label>
              <span style={typographyFieldLabel}>Image alignment</span>
              <select
                aria-label="Image alignment"
                style={typographySelectStyle}
                value={layout?.imageAlignment || 'template-default'}
                onChange={(e) => selectLayout('imageAlignment', e.target.value)}
              >
                <option value="template-default">Template Default</option>
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="full">Full</option>
              </select>
            </label>

            <label>
              <span style={typographyFieldLabel}>Image/text spacing</span>
              <select
                aria-label="Image text spacing"
                style={typographySelectStyle}
                value={layout?.imageTextSpacing || 'template-default'}
                onChange={(e) => selectLayout('imageTextSpacing', e.target.value)}
              >
                <option value="template-default">Template Default</option>
                <option value="compact">Compact</option>
                <option value="standard">Normal</option>
                <option value="relaxed">Spacious</option>
              </select>
            </label>
          </>
        )}
      </div>
      </fieldset>
    </details>
  );
};

const MEDIA_SETTINGS_TYPES: BlockType[] = ['image', 'cover', 'gallery'];

const mediaSettingButtonStyle = (selected: boolean): React.CSSProperties => ({
  border: `1px solid ${selected ? '#a17f3b' : '#ddd'}`,
  background: selected ? '#fff8ef' : '#fff',
  color: '#555',
  borderRadius: 8,
  padding: '8px 10px',
  cursor: 'pointer',
  fontSize: 12,
  fontWeight: selected ? 700 : 500,
});

const MediaBlockSettings: React.FC<{
  block: PostBlock;
  onChange: (settings: PostBlockSettings | undefined) => void;
}> = ({ block, onChange }) => {
  if (!MEDIA_SETTINGS_TYPES.includes(block.type)) return null;

  const settings = block.settings || {};
  const update = (patch: Partial<PostBlockSettings>) => {
    const next = { ...settings, ...patch };
    onChange(Object.keys(next).length ? next : undefined);
  };

  const composition = settings.galleryComposition || 'equal';
  const imageFit = settings.imageFit || 'cover';
  const imageRatio = settings.imageRatio || '1:1';
  const galleryGap = settings.galleryGap || 'standard';

  return (
    <details style={{ marginTop: 12, border: '1px solid #eee', borderRadius: 10, background: '#fafafa' }}>
      <summary style={{ cursor: 'pointer', padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#555' }}>
        Media presentation
      </summary>
      <fieldset style={{ border: 0, padding: '0 12px 12px', display: 'grid', gap: 12 }}>
        <legend className="sr-only">Media presentation settings</legend>
        <div>
          <span style={typographyFieldLabel}>Image fit</span>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(['cover', 'contain', 'natural'] as BlogImageFit[]).map((fit) => (
              <button key={fit} type="button" aria-pressed={imageFit === fit} style={mediaSettingButtonStyle(imageFit === fit)} onClick={() => update({ imageFit: fit })}>
                {fit === 'cover' ? 'Fill frame' : fit === 'contain' ? 'Show whole image' : 'Original'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <span style={typographyFieldLabel}>Image ratio</span>
          <select aria-label="Image ratio" style={typographySelectStyle} value={imageRatio} onChange={(event) => update({ imageRatio: event.target.value as BlogImageRatio })}>
            <option value="16:9">16:9 Landscape</option>
            <option value="4:3">4:3 Standard</option>
            <option value="3:2">3:2 Classic</option>
            <option value="1:1">1:1 Square</option>
            <option value="original">Original ratio</option>
          </select>
        </div>
        {block.type === 'gallery' && (
          <>
            <div>
              <span style={typographyFieldLabel}>Gallery composition</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 6 }}>
                {([
                  ['equal', 'Three equal'],
                  ['featured-left', 'Featured left'],
                  ['featured-right', 'Featured right'],
                  ['featured-top', 'Featured top'],
                ] as Array<[BlogGalleryComposition, string]>).map(([value, label]) => (
                  <button key={value} type="button" aria-pressed={composition === value} style={{ ...mediaSettingButtonStyle(composition === value), minHeight: 52 }} onClick={() => update({ galleryComposition: value })}>
                    <span aria-hidden="true" style={{ display: 'block', marginBottom: 4, opacity: 0.65 }}>{value === 'equal' ? '▦ ▦ ▦' : value === 'featured-top' ? '▰ / ▦ ▦' : value === 'featured-left' ? '▮ ▦' : '▦ ▮'}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span style={typographyFieldLabel}>Gallery spacing</span>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {(['compact', 'standard', 'relaxed'] as const).map((gap) => (
                  <button key={gap} type="button" aria-pressed={galleryGap === gap} style={mediaSettingButtonStyle(galleryGap === gap)} onClick={() => update({ galleryGap: gap })}>
                    {gap === 'compact' ? 'Tight' : gap === 'standard' ? 'Balanced' : 'Airy'}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </fieldset>
    </details>
  );
};

const formatGuidanceRange = (min: number | undefined, max: number | undefined, label: string): string => {
  if (min !== undefined && max !== undefined) return `${min}-${max} ${label}`;
  if (min !== undefined) return `${min}+ ${label}`;
  if (max !== undefined) return `up to ${max} ${label}`;
  return `as needed ${label}`;
};

const formatGuidanceCount = (min: number | undefined, max: number | undefined, label: string): string => {
  if (min !== undefined && max !== undefined && min === max) return `${min} ${label}${min === 1 ? '' : 's'}`;
  return formatGuidanceRange(min, max, `${label}${max === 1 ? '' : 's'}`);
};

const blockWordCount = (block: PostBlock): number => (block.text || '').trim().split(/\s+/).filter(Boolean).length;

const blockImageCount = (block: PostBlock): number | undefined => {
  if (block.type === 'image' || block.type === 'cover') return block.src ? 1 : 0;
  if (block.type === 'gallery') return (block.images || []).filter(Boolean).length;
  return undefined;
};

// ─── Block Editor ─────────────────────────────────────────────────────────────
const BlogBlockEditor: React.FC<{
  block: PostBlock;
  authoringProfile?: TemplateAuthoringProfile;
  onChange: (value: PostBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}> = ({ block, authoringProfile, onChange, onDelete, onMoveUp, onMoveDown, onDuplicate }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetField] = useState<string>('src');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [textSelection, setTextSelection] = useState({ start: 0, end: 0 });

  const updateField = (field: string, value: any) => onChange({ ...block, [field]: value });
  const updateItems = (items: any[]) => updateField('items', items);
  const updatePins = (pins: any[]) => updateField('pins', pins);

  const updateText = (value: string) => onChange({ ...block, text: value, inlineContent: undefined });

  const rememberTextSelection = () => {
    const textarea = textAreaRef.current;
    if (!textarea) return;
    setTextSelection({ start: textarea.selectionStart, end: textarea.selectionEnd });
  };

  const applyTextMark = (mark: keyof InlineTextMarks, value: boolean | string) => {
    const text = block.text || '';
    const { start, end } = textSelection;
    if (start === end) return;
    onChange({
      ...block,
      inlineContent: applyInlineMark(text, block.inlineContent, start, end, mark, value),
    });
  };

  const clearSelectionAfterFormatting = () => {
    requestAnimationFrame(() => {
      textAreaRef.current?.setSelectionRange(textSelection.start, textSelection.end);
    });
  };

  const formatSelection = (mark: keyof InlineTextMarks, value: boolean | string) => {
    applyTextMark(mark, value);
    clearSelectionAfterFormatting();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const response = await uploadBlogImage(file);
      if (response.success) updateField(uploadTargetField, response.data.url);
    } catch (error) {
      alert(`Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const blockTypeLabel: Record<string, string> = {
    h1: 'Heading 1', h2: 'Heading 2', h3: 'Heading 3', p: 'Paragraph',
    quote: 'Pull Quote', image: 'Image', cover: 'Cover Image',
    gallery: 'Gallery', numlist: 'Numbered List', hotel: 'Hotel Card',
    map: 'Map', video: 'Video', newsletter: 'Newsletter',
  };

  const blockGuidance: TemplateBlockGuidance | undefined = authoringProfile?.blockGuidance?.[block.type];
  const settingsGuidance = block.settings;
  const guidanceLines = [
    blockGuidance?.purpose,
    blockGuidance?.recommendedTextRange || settingsGuidance?.minWords !== undefined || settingsGuidance?.maxWords !== undefined
      ? `Text: ${formatGuidanceRange(blockGuidance?.recommendedTextRange?.minWords ?? settingsGuidance?.minWords, blockGuidance?.recommendedTextRange?.maxWords ?? settingsGuidance?.maxWords, 'words')}`
      : undefined,
    blockGuidance?.recommendedImageCount || settingsGuidance?.imageCount !== undefined
      ? `Images: ${formatGuidanceCount(blockGuidance?.recommendedImageCount?.min ?? settingsGuidance?.imageCount, blockGuidance?.recommendedImageCount?.max, 'image')}`
      : undefined,
    blockGuidance?.recommendedItemRange || settingsGuidance?.minItems !== undefined || settingsGuidance?.maxItems !== undefined
      ? `Items: ${formatGuidanceRange(blockGuidance?.recommendedItemRange?.minItems ?? settingsGuidance?.minItems, blockGuidance?.recommendedItemRange?.maxItems ?? settingsGuidance?.maxItems, 'items')}`
      : undefined,
    blockGuidance?.imageStyle || settingsGuidance?.imageStyle
      ? `Image style: ${blockGuidance?.imageStyle ?? settingsGuidance?.imageStyle}`
      : undefined,
    blockGuidance?.guidance,
  ].filter((line): line is string => Boolean(line));
  const textRange = blockGuidance?.recommendedTextRange || (settingsGuidance?.minWords !== undefined || settingsGuidance?.maxWords !== undefined
    ? { minWords: settingsGuidance.minWords, maxWords: settingsGuidance.maxWords }
    : undefined);
  const imageRange = blockGuidance?.recommendedImageCount || (settingsGuidance?.imageCount !== undefined
    ? { min: settingsGuidance.imageCount, max: settingsGuidance.imageCount }
    : undefined);
  const itemRange = blockGuidance?.recommendedItemRange || (settingsGuidance?.minItems !== undefined || settingsGuidance?.maxItems !== undefined
    ? { minItems: settingsGuidance.minItems, maxItems: settingsGuidance.maxItems }
    : undefined);
  const imageCount = blockImageCount(block);
  const qualityLines = [
    textRange ? `Current text: ${blockWordCount(block)} words (recommended ${formatGuidanceRange(textRange.minWords, textRange.maxWords, 'words')})` : undefined,
    imageRange && imageCount !== undefined ? `Current images: ${imageCount} (recommended ${formatGuidanceCount(imageRange.min, imageRange.max, 'image')})` : undefined,
    itemRange && block.items ? `Current items: ${block.items.length} (recommended ${formatGuidanceRange(itemRange.minItems, itemRange.maxItems, 'items')})` : undefined,
  ].filter((line): line is string => Boolean(line));

  return (
    <div className="block-editor" style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16, marginBottom: 16, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: '#888', background: '#f0f0f0', padding: '4px 10px', borderRadius: 999 }}>
          {blockTypeLabel[block.type] || block.type}
        </span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-sm" onClick={onMoveUp} title="Move up">↑</button>
          <button type="button" className="btn btn-sm" onClick={onMoveDown} title="Move down">↓</button>
          <button type="button" className="btn btn-sm" onClick={onDuplicate} title="Duplicate">⎘</button>
          <button type="button" className="btn btn-sm" onClick={onDelete} title="Delete" style={{ color: '#dc3545' }}>✕</button>
        </div>
      </div>

      {guidanceLines.length > 0 && (
        <div style={{ marginBottom: 12, padding: '10px 12px', borderRadius: 8, background: '#fff8ef', border: '1px solid #f3dfc4', color: '#76552f', fontSize: 12 }}>
          <strong>Authoring suggestion</strong>
          <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
            {guidanceLines.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </div>
      )}

      {qualityLines.length > 0 && (
        <div style={{ marginBottom: 12, padding: '9px 12px', borderRadius: 8, background: '#f7f9fb', border: '1px solid #e1e7ee', color: '#52606d', fontSize: 12 }}>
          <strong>Content quality</strong>
          <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
            {qualityLines.map((line) => <li key={line}>{line}</li>)}
          </ul>
        </div>
      )}

      {['h1', 'h2', 'h3', 'p'].includes(block.type) && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            <button
              type="button"
              className="btn btn-sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => formatSelection('bold', true)}
              disabled={textSelection.start === textSelection.end}
              title="Bold selected text"
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              className="btn btn-sm"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => formatSelection('italic', true)}
              disabled={textSelection.start === textSelection.end}
              title="Italicize selected text"
            >
              <em>I</em>
            </button>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
              Text color
              <input
                type="color"
                aria-label="Text color for selected text"
                title="Apply text color to selected text"
                defaultValue="#7c3aed"
                disabled={textSelection.start === textSelection.end}
                onChange={(e) => formatSelection('color', e.target.value)}
              />
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>
              Highlight color
              <input
                type="color"
                aria-label="Highlight color for selected text"
                title="Apply highlight color to selected text"
                defaultValue="#fde68a"
                disabled={textSelection.start === textSelection.end}
                onChange={(e) => formatSelection('highlight', e.target.value)}
              />
            </label>
            <span style={{ fontSize: 11, color: '#777' }}>
              {textSelection.start === textSelection.end ? 'Select text to format' : `${textSelection.end - textSelection.start} characters selected`}
            </span>
          </div>
          <textarea
            ref={textAreaRef}
            style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
            value={block.text || ''}
            onChange={(e) => updateText(e.target.value)}
            onSelect={rememberTextSelection}
            onKeyUp={rememberTextSelection}
            onMouseUp={rememberTextSelection}
            placeholder="Block text"
          />
        </>
      )}

      {block.type === 'quote' && (
        <>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Quote text</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            <button type="button" className="btn btn-sm" onMouseDown={(e) => e.preventDefault()} onClick={() => formatSelection('bold', true)} disabled={textSelection.start === textSelection.end} title="Bold selected text"><strong>B</strong></button>
            <button type="button" className="btn btn-sm" onMouseDown={(e) => e.preventDefault()} onClick={() => formatSelection('italic', true)} disabled={textSelection.start === textSelection.end} title="Italicize selected text"><em>I</em></button>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>Text color <input type="color" aria-label="Text color for selected quote text" title="Apply text color to selected quote text" defaultValue="#7c3aed" disabled={textSelection.start === textSelection.end} onChange={(e) => formatSelection('color', e.target.value)} /></label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12 }}>Highlight color <input type="color" aria-label="Highlight color for selected quote text" title="Apply highlight color to selected quote text" defaultValue="#fde68a" disabled={textSelection.start === textSelection.end} onChange={(e) => formatSelection('highlight', e.target.value)} /></label>
          </div>
          <textarea ref={textAreaRef} style={{ width: '100%', minHeight: 80, marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={block.text || ''} onChange={(e) => updateText(e.target.value)} onSelect={rememberTextSelection} onKeyUp={rememberTextSelection} onMouseUp={rememberTextSelection} placeholder="Quote text" />
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Attribution / credit</label>
          <input style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={block.cite || ''} onChange={(e) => updateField('cite', e.target.value)} placeholder="— Person Name" />
        </>
      )}

      <TextBlockSettings
        block={block}
        onChange={(settings) => onChange({ ...block, settings })}
      />
      <MediaBlockSettings
        block={block}
        onChange={(settings) => onChange({ ...block, settings })}
      />

      {(block.type === 'image' || block.type === 'cover') && (
        <>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ display: 'none' }} />
          <ImageUploadField
            label={block.type === 'cover' ? 'Cover / Hero image' : 'Image'}
            value={block.src || ''}
            onChange={(url) => updateField('src', url)}
            previewHeight={220}
          />
          <div style={{ marginTop: 10 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Caption</label>
            <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={block.caption || ''} onChange={(e) => updateField('caption', e.target.value)} placeholder="Image caption (optional)" />
          </div>
        </>
      )}

      {block.type === 'gallery' && (
        <>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Gallery images</label>
          <GalleryImageField
            images={block.images || []}
            onChange={(images) => updateField('images', images)}
          />
        </>
      )}

      {block.type === 'numlist' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {(block.items || []).map((item, index) => (
            <div key={index} style={{ border: '1px solid #eee', padding: 12, borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <strong style={{ fontSize: 13 }}>Entry {index + 1}</strong>
                <button type="button" className="btn btn-xs" onClick={() => updateItems((block.items || []).filter((_, i) => i !== index))}>Remove</button>
              </div>
              {[{ f: 'title', ph: 'Title' }, { f: 'loc', ph: 'Location' }, { f: 'img', ph: 'Image URL' }].map(({ f, ph }) => (
                <div key={f} style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 3 }}>{ph}</label>
                  <input style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd' }} value={(item as any)[f] || ''} onChange={(e) => { const next = [...(block.items || [])]; next[index] = { ...next[index], [f]: e.target.value }; updateItems(next); }} placeholder={ph} />
                </div>
              ))}
              <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 3 }}>Body text</label>
              <textarea style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={item.body || ''} onChange={(e) => { const next = [...(block.items || [])]; next[index] = { ...next[index], body: e.target.value }; updateItems(next); }} placeholder="Description…" />
            </div>
          ))}
          <button type="button" className="btn btn-sm" onClick={() => updateItems([...(block.items || []), { n: (block.items || []).length + 1, title: '', loc: '', body: '', img: '' }])}>+ Add list entry</button>
        </div>
      )}

      {block.type === 'hotel' && (
        <div style={{ display: 'grid', gap: 10 }}>
          {([
            { f: 'kicker', ph: 'Kicker (e.g. Editor\'s pick)' },
            { f: 'name', ph: 'Hotel / Property name' },
            { f: 'loc', ph: 'Location / City' },
            { f: 'price', ph: 'Price (e.g. from ₹8,000/night)' },
            { f: 'nights', ph: 'Suggested nights (e.g. 2–3 nights)' },
          ] as const).map(({ f, ph }) => (
            <div key={f}>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 3 }}>{ph.split('(')[0].trim()}</label>
              <input style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd' }} value={(block as any)[f] || ''} onChange={(e) => updateField(f, e.target.value)} placeholder={ph} />
            </div>
          ))}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 3 }}>Description</label>
            <textarea style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={block.desc || ''} onChange={(e) => updateField('desc', e.target.value)} placeholder="Hotel description…" />
          </div>
          <ImageUploadField label="Hotel image" value={block.img || ''} onChange={(url) => updateField('img', url)} previewHeight={180} />
        </div>
      )}

      {block.type === 'map' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {(block.pins || []).map((pin, index) => (
            <div key={index} style={{ display: 'grid', gap: 8, border: '1px solid #eee', padding: 10, borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong style={{ fontSize: 13 }}>Pin {index + 1}</strong>
                <button type="button" className="btn btn-xs" onClick={() => updatePins((block.pins || []).filter((_, i) => i !== index))}>Remove</button>
              </div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#888' }}>Label</label>
              <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={pin.label || ''} onChange={(e) => { const next = [...(block.pins || [])]; next[index] = { ...next[index], label: e.target.value }; updatePins(next); }} placeholder="Pin label" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['x', 'y'] as const).map((axis) => (
                  <div key={axis}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 3 }}>{axis.toUpperCase()} position (%)</label>
                    <input style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd', width: '100%' }} value={String(pin[axis] ?? '')} onChange={(e) => { const next = [...(block.pins || [])]; next[index] = { ...next[index], [axis]: Number(e.target.value) }; updatePins(next); }} placeholder={`${axis.toUpperCase()} %`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-sm" onClick={() => updatePins([...(block.pins || []), { x: 50, y: 50, label: 'New pin' }])}>+ Add pin</button>
        </div>
      )}

      {block.type === 'video' && (
        <>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Video URL</label>
          <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={block.url || ''} onChange={(e) => updateField('url', e.target.value)} placeholder="https://youtube.com/watch?v=..." />
        </>
      )}

      {block.type === 'newsletter' && (
        <>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Newsletter title</label>
          <input style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={block.title || ''} onChange={(e) => updateField('title', e.target.value)} placeholder="Join the newsletter" />
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Body text</label>
          <textarea style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={block.body || ''} onChange={(e) => updateField('body', e.target.value)} placeholder="Subscribe for weekly travel stories…" />
        </>
      )}
    </div>
  );
};

// ─── Published Block Renderer ─────────────────────────────────────────────────
const PREVIEW_FONT_FAMILIES: Record<string, string> = {
  'plumtrips-editorial': 'var(--font-display, Georgia, serif)',
  georgia: 'Georgia, serif',
  arial: 'Arial, sans-serif',
  'times-new-roman': 'Times New Roman, serif',
  tahoma: 'Tahoma, sans-serif',
};

const PREVIEW_TEXT_SIZES: Record<string, number> = { small: 14, normal: 16, large: 19, xl: 23 };
const PREVIEW_COLORS: Record<string, string> = {
  default: 'var(--ink, #222)',
  heading: 'var(--ink, #222)',
  accent: 'var(--accent, #c8943a)',
  muted: 'var(--muted, #777)',
};

const getPreviewBlockStyle = (block: PostBlock): React.CSSProperties => {
  const settings = block.settings;
  const typography = block.settings?.typography;
  const layout = block.settings?.layout;
  const style: React.CSSProperties = {};

  if (settings?.width) {
    style.maxWidth = { small: 420, medium: 640, large: 920, full: 'none' }[settings.width];
    style.width = '100%';
    style.marginInline = 'auto';
  }

  const isMediaBlock = ['image', 'cover', 'gallery'].includes(block.type);
  if (isMediaBlock && settings?.imagePosition) {
    if (settings.imagePosition === 'left') {
      style.marginInlineStart = 0;
      style.marginInlineEnd = 'auto';
    } else if (settings.imagePosition === 'right') {
      style.marginInlineStart = 'auto';
      style.marginInlineEnd = 0;
    } else if (settings.imagePosition === 'center') {
      style.marginInline = 'auto';
    }
  } else if (!isMediaBlock && settings?.alignment) {
    style.textAlign = settings.alignment;
  }

  if (typography?.fontFamily && PREVIEW_FONT_FAMILIES[typography.fontFamily]) style.fontFamily = PREVIEW_FONT_FAMILIES[typography.fontFamily];
  if (typography?.size && PREVIEW_TEXT_SIZES[typography.size]) style.fontSize = PREVIEW_TEXT_SIZES[typography.size];
  if (typography?.color && PREVIEW_COLORS[typography.color]) style.color = PREVIEW_COLORS[typography.color];
  if (typography?.alignment) style.textAlign = typography.alignment;
  if (typography?.bold) style.fontWeight = 700;
  if (typography?.italic) style.fontStyle = 'italic';

  if (layout?.textAlignment) style.textAlign = layout.textAlignment;
  if (layout?.contentWidth) {
    style.maxWidth = { narrow: 560, standard: 720, wide: 920, full: 'none' }[layout.contentWidth];
    style.width = '100%';
    style.marginInline = 'auto';
  }
  if (layout?.imageWidth) {
    style.maxWidth = { narrow: 560, standard: 720, wide: 920, full: 'none' }[layout.imageWidth];
    style.width = '100%';
  }
  if (layout?.imageAlignment) {
    if (layout.imageAlignment === 'left') {
      style.marginInlineStart = 0;
      style.marginInlineEnd = 'auto';
    } else if (layout.imageAlignment === 'right') {
      style.marginInlineStart = 'auto';
      style.marginInlineEnd = 0;
    } else {
      style.marginInline = 'auto';
    }
  }
  if (layout?.sectionSpacing) style.marginBlock = { compact: 12, standard: 24, relaxed: 40 }[layout.sectionSpacing];
  if (block.settings?.highlight) style.backgroundColor = 'var(--paper-2, #f9f6f1)';

  return style;
};

const getMediaRatio = (ratio: string | undefined): string | undefined => {
  if (!ratio || ratio === 'original') return undefined;
  return ratio.replace(':', ' / ');
};

const getGalleryPreviewClass = (block: PostBlock): string => `blog-gallery-grid blog-gallery-${block.settings?.galleryComposition || 'equal'}`;

const getGalleryGap = (block: PostBlock): number => ({ compact: 6, standard: 12, relaxed: 20 }[block.settings?.galleryGap || 'standard']);

const PubBlock: React.FC<{ block: PostBlock }> = ({ block }) => {
  switch (block.type) {
    case 'h1': return <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 500, margin: '40px 0 16px', ...getPreviewBlockStyle(block) }}><InlineText text={block.text} fragments={block.inlineContent} /></h1>;
    case 'h2': return <h2 id={`s-${block.id}`} style={getPreviewBlockStyle(block)}><InlineText text={block.text} fragments={block.inlineContent} /></h2>;
    case 'h3': return <h3 id={`s-${block.id}`} style={getPreviewBlockStyle(block)}><InlineText text={block.text} fragments={block.inlineContent} /></h3>;
    case 'p': return <p style={getPreviewBlockStyle(block)}><InlineText text={block.text} fragments={block.inlineContent} /></p>;
    case 'quote':
      return <blockquote style={getPreviewBlockStyle(block)}><InlineText text={block.text} fragments={block.inlineContent} />{block.cite && <cite>{block.cite}</cite>}</blockquote>;
    case 'image': case 'cover':
      return (
        <figure style={getPreviewBlockStyle(block)}>
          {block.src ? (
            <div
              style={{
                aspectRatio: getMediaRatio(block.settings?.imageRatio) || '16 / 9',
                width: '100%',
                background: 'var(--paper-2)',
                borderRadius: 12,
                overflow: 'hidden',
              }}
            >
              <img
                src={block.src}
                alt={block.caption || ''}
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  objectFit: block.settings?.imageFit === 'contain' ? 'contain' : block.settings?.imageFit === 'natural' ? 'contain' : 'cover',
                  height: block.settings?.imageFit === 'natural' ? 'auto' : '100%',
                  display: 'block',
                }}
              />
            </div>
          ) : (
            <div
              style={{
                aspectRatio: '16 / 9',
                background: 'var(--paper-2)',
                borderRadius: 12,
                border: '1px dashed var(--line-2)',
              }}
            />
          )}
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    case 'gallery':
      return (
        <div className={getGalleryPreviewClass(block)} style={{ gap: getGalleryGap(block), margin: '32px 0', ...getPreviewBlockStyle(block) }}>
          {(block.images || []).map((src, i) => (
            <div key={i} className="blog-gallery-tile" style={{ aspectRatio: getMediaRatio(block.settings?.imageRatio) || '1 / 1', borderRadius: 10, overflow: 'hidden', background: 'var(--paper-2)' }}>
              {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: block.settings?.imageFit === 'contain' || block.settings?.imageFit === 'natural' ? 'contain' : 'cover' }} />}
            </div>
          ))}
        </div>
      );
    case 'numlist':
      return (
        <div className="pub-numlist" style={getPreviewBlockStyle(block)}>
          {(block.items || []).map((it, i) => (
            <div className="nentry" key={i} id={`n-${i + 1}`}>
              <div className="num">{String(it.n).padStart(2, '0')}</div>
              <div>
                <h3>{it.title}</h3>
                <div className="loc">{it.loc}</div>
                {it.img && <img src={it.img} alt={it.title} loading="lazy" />}
                <p>{it.body}</p>
              </div>
            </div>
          ))}
        </div>
      );
    case 'hotel':
      return (
        <div className="pub-hotel" style={getPreviewBlockStyle(block)}>
          <div className="h-img">{block.img && <img src={block.img} alt={block.name} loading="lazy" />}</div>
          <div className="h-body">
            <div className="h-kicker">{block.kicker}</div>
            <h4>{block.name}</h4>
            <div className="h-loc">{block.loc}</div>
            <p>{block.desc}</p>
            <div className="h-foot">
              <span className="price">{block.price}</span>
              <button className="btn btn-primary btn-sm">View hotel →</button>
            </div>
          </div>
        </div>
      );
    case 'map':
      return (
        <div className="pub-map" style={getPreviewBlockStyle(block)}>
          {(block.pins || []).map((p, i) => (
            <div key={i} className="pin" style={{ left: `${p.x}%`, top: `${p.y}%` }} title={p.label} />
          ))}
        </div>
      );
    case 'video':
      return (
        <div style={{ aspectRatio: '16/9', background: '#0a0a0a', borderRadius: 12, display: 'grid', placeItems: 'center', margin: '32px 0', color: '#fff' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>▶</div>
        </div>
      );
    case 'newsletter':
      return (
        <div className="pub-newsletter" style={getPreviewBlockStyle(block)}>
          <h3>{block.title}</h3>
          <p>{block.body}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="email" placeholder="your@email.com" />
            <button className="btn btn-primary" type="button">Subscribe</button>
          </div>
        </div>
      );
    default: return null;
  }
};

// ─── Travel Blog Post View (Read / Preview) ───────────────────────────────────
const BlogPostView: React.FC<{ post: Post; layout?: 'magazine' | 'listicle' | 'essay'; displayFont?: 'serif' | 'sans' }> = ({ post, layout = 'magazine', displayFont = 'serif' }) => {
  const [progress, setProgress] = useState(0);
  const [activeToc, setActiveToc] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
      const entries = el.querySelectorAll('.pub-numlist .nentry');
      let best = 0;
      entries.forEach((entry, i) => { if ((entry as HTMLElement).getBoundingClientRect().top < 200) best = i; });
      setActiveToc(best);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const numlistBlock = post.blocks.find((b) => b.type === 'numlist');
  const hasToc = layout !== 'essay' && !!numlistBlock;

  const scrollTo = (i: number) => {
    const el = ref.current?.querySelector(`#n-${i + 1}`) as HTMLElement | null;
    if (el && ref.current) {
      const top = el.getBoundingClientRect().top + ref.current.scrollTop - 100;
      ref.current.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const formattedDate = new Date(post.publishDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div
      className="pub"
      data-layout={layout}
      data-display-font={displayFont}
      ref={ref}
      style={{ height: '100%', overflow: 'auto', background: 'var(--paper, #fff)' }}
    >
      {/* Reading progress bar */}
      <div className="pub-progress" style={{ position: 'sticky', top: 0, zIndex: 100, height: 3, background: 'var(--line-2, #eee)' }}>
        <div className="bar" style={{ width: `${progress}%`, height: '100%', background: 'var(--accent, #c8943a)', transition: 'width .1s linear' }} />
      </div>

      {/* ── Hero Section ── */}
      <div style={{ position: 'relative', minHeight: 520, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
        {/* Hero background image */}
        {post.cover?.src && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img
              src={post.cover.src}
              alt={post.cover.alt || post.title || ''}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Gradient overlay for readability */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 30%, rgba(0,0,0,0.72) 80%, rgba(0,0,0,0.85) 100%)',
            }} />
          </div>
        )}

        {/* Hero text content */}
        <div style={{ position: 'relative', zIndex: 1, padding: '60px 32px 40px', maxWidth: 820, margin: '0 auto', width: '100%' }}>
          {/* Breadcrumb / categories */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.12)',
              padding: '4px 12px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)',
            }}>
              {post.categories[0] || 'Travel'}
            </span>
            {post.categories.slice(1).map((c) => (
              <span key={c} style={{ fontSize: 10, fontWeight: 600, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>· {c}</span>
            ))}
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: 'var(--font-display, Georgia, serif)',
            fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: 600,
            lineHeight: 1.12,
            color: '#fff',
            margin: '0 0 16px',
            textShadow: '0 2px 16px rgba(0,0,0,0.3)',
          }}>
            {post.title}
          </h1>

          {/* Subtitle */}
          {post.subtitle && (
            <p style={{
              fontSize: 'clamp(14px, 2vw, 18px)',
              color: 'rgba(255,255,255,0.82)',
              margin: '0 0 28px',
              fontStyle: 'italic',
              maxWidth: 600,
              lineHeight: 1.5,
            }}>
              {post.subtitle}
            </p>
          )}

          {/* Author + meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              backgroundImage: post.author.avatar ? `url(${post.author.avatar})` : undefined,
              backgroundSize: 'cover', backgroundPosition: 'center',
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: '2px solid rgba(255,255,255,0.4)',
              display: 'grid', placeItems: 'center',
              color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0,
            }}>
              {!post.author.avatar && post.author.initials}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{post.author.name}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{post.author.role}</div>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, margin: '0 2px' }}>·</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{formattedDate}</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 16, margin: '0 2px' }}>·</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{post.readingTime} min read</div>
          </div>
        </div>
      </div>

      {/* Optional cover caption */}
      {post.cover?.caption && (
        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted, #999)', padding: '8px 24px', fontStyle: 'italic', borderBottom: '1px solid var(--line-2, #eee)' }}>
          {post.cover.caption}
        </div>
      )}

      {/* ── Body ── */}
      <div className="pub-body" style={{ display: 'grid', gridTemplateColumns: hasToc ? '220px 1fr' : '1fr', gap: 48, maxWidth: 1060, margin: '0 auto', padding: '48px 24px', alignItems: 'start' }}>

        {/* Sidebar TOC */}
        {hasToc && (
          <aside className="pub-toc" style={{
            position: 'sticky', top: 24,
            background: 'var(--paper-2, #f9f6f1)',
            border: '1px solid var(--line-2, #ece9e2)',
            borderRadius: 14,
            padding: '20px 18px',
          }}>
            <h6 style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'var(--muted, #999)', margin: '0 0 14px', fontWeight: 700 }}>In this article</h6>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 4 }}>
              {numlistBlock?.items?.map((it: any, i: number) => (
                <li
                  key={i}
                  onClick={() => scrollTo(i)}
                  style={{
                    fontSize: 13, padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                    fontWeight: i === activeToc ? 600 : 400,
                    color: i === activeToc ? 'var(--accent, #c8943a)' : 'var(--ink-2, #555)',
                    background: i === activeToc ? 'var(--accent-soft, rgba(200,148,58,0.08))' : 'transparent',
                    borderLeft: i === activeToc ? '2px solid var(--accent, #c8943a)' : '2px solid transparent',
                    transition: 'all .15s',
                  }}
                >
                  <span style={{ opacity: 0.5, fontSize: 11, marginRight: 6, fontVariantNumeric: 'tabular-nums' }}>{String(i + 1).padStart(2, '0')}</span>
                  {it.title}
                </li>
              ))}
            </ol>
          </aside>
        )}

        {/* Main article */}
        <article className="pub-content" style={{ minWidth: 0 }}>
          {post.blocks.map((block) => <PubBlock key={block.id} block={block} />)}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div style={{ marginTop: 48, paddingTop: 24, borderTop: '1px solid var(--line-2, #eee)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {post.tags.map((tag) => (
                <span key={tag} style={{
                  fontSize: 12, padding: '5px 14px', borderRadius: 999,
                  background: 'var(--paper-2, #f5f2ec)',
                  color: 'var(--ink-2, #666)',
                  border: '1px solid var(--line-2, #ece9e2)',
                  letterSpacing: '.04em',
                }}>#{tag}</span>
              ))}
            </div>
          )}

          {/* Author bio card */}
          <div style={{
            marginTop: 40,
            padding: '24px 28px',
            borderRadius: 16,
            background: 'var(--paper-2, #f9f6f1)',
            border: '1px solid var(--line-2, #ece9e2)',
            display: 'flex',
            gap: 20,
            alignItems: 'flex-start',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
              backgroundImage: post.author.avatar ? `url(${post.author.avatar})` : undefined,
              backgroundSize: 'cover', backgroundPosition: 'center',
              backgroundColor: 'var(--line-2, #ddd)',
              display: 'grid', placeItems: 'center',
              color: 'var(--ink, #333)', fontSize: 16, fontWeight: 700,
              border: '2px solid var(--line-2, #ddd)',
            }}>
              {!post.author.avatar && post.author.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted, #999)', marginBottom: 4, fontWeight: 600 }}>Written by</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink, #1a1a1a)', marginBottom: 2 }}>{post.author.name}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2, #666)' }}>{post.author.role}</div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

// ─── Google Search Result Preview ─────────────────────────────────────────────
// Visual approximation only — not a pixel-perfect match of Google's live SERP UI.
const seoFieldLabel: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  color: '#555',
  marginBottom: 4,
  display: 'block',
  textTransform: 'uppercase',
  letterSpacing: '.06em',
};

const GoogleSearchPreview: React.FC<{ post: Post }> = ({ post }) => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://plumtrips.com';
  const path = `/blogs/${post.slug || 'your-post-slug'}`;
  const displayUrl = (post.seo.canonicalUrl || `${origin}${path}`).replace(/^https?:\/\//, '');
  const urlParts = displayUrl.split('/');
  const title = post.seo.title || post.title || 'Untitled blog post';
  const description = post.seo.description || post.excerpt || 'Add a meta description so this preview looks right in search results.';

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label style={seoFieldLabel}>Google search preview</label>
      <div style={{
        border: '1px solid #eee', borderRadius: 10, padding: '16px 18px',
        background: '#fff', fontFamily: 'arial, sans-serif', maxWidth: 600,
      }}>
        <div style={{ fontSize: 14, color: '#202124', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span>{urlParts[0]}</span>
          {urlParts.length > 1 && <span style={{ color: '#5f6368' }}>{' › ' + urlParts.slice(1).join(' › ')}</span>}
        </div>
        <div style={{ fontSize: 20, color: '#1a0dab', margin: '2px 0 3px', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </div>
        <div style={{ fontSize: 14, color: '#4d5156', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {description}
        </div>
      </div>
      <p style={{ fontSize: 11, color: '#999', margin: 0 }}>Approximate preview — actual Google search results may render differently.</p>
    </div>
  );
};

const TemplateThumbnail: React.FC<{ template: BlogTemplateDefinition }> = ({ template }) => {
  const [imageFailed, setImageFailed] = useState(false);

  if (imageFailed || !template.thumbnail) {
    return (
      <div className="flex h-64 items-center justify-center bg-[#f3eee8] p-6 text-center">
        <div className="w-full rounded-lg border border-dashed border-[#d8c7b8] bg-white/70 p-8 text-sm font-medium text-[#8b6f58]">
          {template.profile?.imageStrategy === 'image-led' || template.profile?.imageStrategy === 'gallery-heavy'
            ? 'Visual preview unavailable'
            : 'Template preview'}
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 bg-gray-100">
      <img
        src={template.thumbnail}
        alt={`${template.name} preview`}
        loading="lazy"
        onError={() => setImageFailed(true)}
        className="h-full w-full object-cover"
      />
    </div>
  );
};

const TemplateGuidancePanel: React.FC<{ profile: TemplateAuthoringProfile }> = ({ profile }) => (
  <div style={{ marginBottom: 20, padding: 16, borderRadius: 12, background: '#fff8ef', border: '1px solid #f3dfc4', color: '#76552f' }}>
    <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em' }}>Template guidance</div>
    <p style={{ margin: '8px 0 12px', fontSize: 13, lineHeight: 1.5 }}>{profile.purpose}</p>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 11, fontWeight: 600 }}>
      <span>Density: {profile.contentDensity}</span>
      <span>Images: {formatGuidanceRange(profile.recommendedImageCount?.min, profile.recommendedImageCount?.max, 'recommended')}</span>
      <span>Text: {formatGuidanceRange(profile.recommendedTextRange?.minWords, profile.recommendedTextRange?.maxWords, 'words per block')}</span>
      <span>Rhythm: {profile.editorialRhythm}</span>
    </div>
    {profile.sectionGuidance && (
      <div style={{ marginTop: 10, fontSize: 12, lineHeight: 1.5 }}>
        {profile.sectionGuidance.required?.length ? <div><strong>Usually included:</strong> {profile.sectionGuidance.required.join(', ')}</div> : null}
        {profile.sectionGuidance.recommended?.length ? <div><strong>Useful blocks:</strong> {profile.sectionGuidance.recommended.join(', ')}</div> : null}
      </div>
    )}
  </div>
);

// ─── Blog Editor ──────────────────────────────────────────────────────────────
const BlogEditor: React.FC<{
  post: Post;
  authoringProfile?: TemplateAuthoringProfile;
  onChange: (next: Post) => void;
  onSave: () => void;
  onPreview: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onAddBlock: (type: BlockType) => void;
  saving?: boolean;
}> = ({ post, authoringProfile, onChange, onSave, onPreview, onCancel, onDelete, onAddBlock, saving }) => {
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);

  const updatePost = (patch: Partial<Post>) => onChange({ ...post, ...patch });
  const updateAuthor = (patch: Partial<Post['author']>) => updatePost({ author: { ...post.author, ...patch } });

  const updateBlock = (id: string, next: PostBlock) => {
    onChange({ ...post, blocks: post.blocks.map((b) => (b.id === id ? next : b)) });
  };

  const deleteBlock = (id: string) => onChange({ ...post, blocks: post.blocks.filter((b) => b.id !== id) });

  const moveBlock = (id: string, dir: number) => {
    const idx = post.blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const next = [...post.blocks];
    const [item] = next.splice(idx, 1);
    next.splice(idx + dir, 0, item);
    onChange({ ...post, blocks: next });
  };

  const duplicateBlock = (id: string) => {
    const idx = post.blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const copy = { ...JSON.parse(JSON.stringify(post.blocks[idx])), id: makeId() };
    const next = [...post.blocks];
    next.splice(idx + 1, 0, copy);
    onChange({ ...post, blocks: next });
  };

  const sectionStyle: React.CSSProperties = {
    background: '#fff',
    border: '1px solid #e8e8e8',
    borderRadius: 14,
    padding: '24px 24px',
    marginBottom: 20,
  };

  const sectionHeadStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '.1em',
    color: '#888',
    margin: '0 0 18px',
    paddingBottom: 12,
    borderBottom: '1px solid #f0f0f0',
  };

  const fieldLabel: React.CSSProperties = {
    fontSize: 12,
    fontWeight: 600,
    color: '#555',
    marginBottom: 4,
    display: 'block',
    textTransform: 'uppercase',
    letterSpacing: '.06em',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 10,
    border: '1px solid #ddd',
    fontSize: 14,
    background: '#fafafa',
    boxSizing: 'border-box',
  };

  return (
    <div className="blog-editor" style={{ padding: 24, background: '#f4f4f4', minHeight: '100vh' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>Edit Blog Post</h1>
          <p style={{ margin: '6px 0 0', color: '#666', fontSize: 13 }}>Edit content, then preview the published post before saving.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>← Back</button>
          <button type="button" className="btn btn-sm" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : '💾 Save'}</button>
          <button type="button" className="btn btn-sm btn-primary" onClick={onPreview}>👁 Preview</button>
          <button type="button" className="btn btn-sm" style={{ background: '#ff5c5c', color: '#fff' }} onClick={onDelete}>🗑 Delete</button>
        </div>
      </div>

      {authoringProfile && <TemplateGuidancePanel profile={authoringProfile} />}

      {/* ── Post Details ── */}
      <div style={sectionStyle}>
        <p style={sectionHeadStyle}>📄 Post Details</p>
        <div style={{ display: 'grid', gap: 14 }}>
          <div>
            <label style={fieldLabel}>Headline / Title</label>
            <input style={{ ...inputStyle, fontSize: 18 }} value={post.title} onChange={(e) => updatePost({ title: e.target.value })} placeholder="Your blog headline" />
          </div>
          <div>
            <label style={fieldLabel}>Subtitle / Deck</label>
            <input style={inputStyle} value={post.subtitle} onChange={(e) => updatePost({ subtitle: e.target.value })} placeholder="A short subtitle that teases the story" />
          </div>
          <div>
            <label style={fieldLabel}>Excerpt (shown in listing)</label>
            <textarea style={{ ...inputStyle, minHeight: 90, resize: 'vertical' } as React.CSSProperties} value={post.excerpt} onChange={(e) => updatePost({ excerpt: e.target.value })} placeholder="Short summary for the blog list card" />
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <p style={sectionHeadStyle}>📍 Location</p>
        <BlogLocationPicker
          value={post.location}
          onChange={(location) => updatePost(location ? { location } : { location: undefined })}
        />
      </div>

      {/* ── Cover Image ── */}
      <div style={sectionStyle}>
        <p style={sectionHeadStyle}>🖼 Cover / Hero Image</p>
        <div style={{ display: 'grid', gap: 14 }}>
          <ImageUploadField
            label="Cover image"
            value={post.cover?.src || ''}
            onChange={(url) => updatePost({ cover: { src: url, caption: post.cover?.caption || '' } })}
            previewHeight={220}
            placeholder="Upload or paste cover image URL"
          />
          <div>
            <label style={fieldLabel}>Cover caption</label>
            <input style={inputStyle} value={post.cover?.caption || ''} onChange={(e) => updatePost({ cover: { src: post.cover?.src || '', caption: e.target.value, alt: post.cover?.alt || '' } })} placeholder="Caption shown below the hero image" />
          </div>
          <div>
            <label style={fieldLabel}>Image alt text</label>
            <input style={inputStyle} value={post.cover?.alt || ''} onChange={(e) => updatePost({ cover: { src: post.cover?.src || '', caption: post.cover?.caption || '', alt: e.target.value } })} placeholder="Describe the image for screen readers & search engines" />
          </div>
        </div>
      </div>

      {/* ── Author Info ── */}
      <div style={sectionStyle}>
        <p style={sectionHeadStyle}>✍️ Author</p>

        {/* Avatar preview */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18, padding: '14px 16px', background: '#f9f9f9', borderRadius: 10, border: '1px solid #eee' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            backgroundImage: post.author.avatar ? `url(${post.author.avatar})` : undefined,
            backgroundSize: 'cover', backgroundPosition: 'center',
            backgroundColor: '#e0e0e0', display: 'grid', placeItems: 'center',
            color: '#666', fontSize: 16, fontWeight: 700, flexShrink: 0,
            border: '2px solid #ddd',
          }}>
            {!post.author.avatar && (post.author.initials || '?')}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{post.author.name || 'Author name'}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{post.author.role || 'Role'}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={fieldLabel}>Full name</label>
              <input style={inputStyle} value={post.author.name} onChange={(e) => updateAuthor({ name: e.target.value })} placeholder="Author's full name" />
            </div>
            <div>
              <label style={fieldLabel}>Role / Title</label>
              <input style={inputStyle} value={post.author.role} onChange={(e) => updateAuthor({ role: e.target.value })} placeholder="e.g. Travel Editor" />
            </div>
          </div>
          <div>
            <label style={fieldLabel}>Initials (shown if no avatar)</label>
            <input style={{ ...inputStyle, maxWidth: 100 }} value={post.author.initials} onChange={(e) => updateAuthor({ initials: e.target.value })} placeholder="AB" maxLength={3} />
          </div>
          <ImageUploadField
            label="Author avatar"
            value={post.author.avatar || ''}
            onChange={(url) => updateAuthor({ avatar: url })}
            previewHeight={100}
            placeholder="Upload or paste avatar URL"
          />
        </div>
      </div>

      {/* ── Publishing Settings ── */}
      <div style={sectionStyle}>
        <p style={sectionHeadStyle}>⚙️ Publishing Settings</p>
        <div style={{ display: 'grid', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={fieldLabel}>URL slug</label>
              <input style={inputStyle} value={post.slug} onChange={(e) => updatePost({ slug: e.target.value })} placeholder="url-friendly-slug" />
            </div>
            <div>
              <label style={fieldLabel}>Publish date</label>
              <input type="date" style={inputStyle} value={post.publishDate} onChange={(e) => updatePost({ publishDate: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={fieldLabel}>Status</label>
              <select style={inputStyle} value={post.status} onChange={(e) => updatePost({ status: e.target.value as Post['status'] })}>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label style={fieldLabel}>Categories</label>
              <CategoryMultiSelect
                value={post.categories}
                inputStyle={inputStyle}
                onChange={(categories) => updatePost({ categories })}
              />
            </div>
            <div>
              <label style={fieldLabel}>Tags</label>
              <input style={inputStyle} value={post.tags.join(', ')} onChange={(e) => updatePost({ tags: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} placeholder="india, monsoon, solo" />
            </div>
          </div>
        </div>
      </div>

      {/* ── SEO ── */}
      <div style={sectionStyle}>
        <p style={sectionHeadStyle}>🔍 SEO & Metadata</p>
        <div style={{ display: 'grid', gap: 12 }}>
          <div>
            <label style={fieldLabel}>SEO title</label>
            <input style={inputStyle} value={post.seo.title} onChange={(e) => updatePost({ seo: { ...post.seo, title: e.target.value } })} placeholder="Search engine title" />
          </div>
          <div>
            <label style={fieldLabel}>Meta description</label>
            <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' } as React.CSSProperties} value={post.seo.description} onChange={(e) => updatePost({ seo: { ...post.seo, description: e.target.value } })} placeholder="Short description for search results (150–160 chars)" />
          </div>
          <div>
            <label style={fieldLabel}>Canonical URL</label>
            <input style={inputStyle} value={post.seo.canonicalUrl || ''} onChange={(e) => updatePost({ seo: { ...post.seo, canonicalUrl: e.target.value } })} placeholder={`${typeof window !== 'undefined' ? window.location.origin : ''}/blogs/${post.slug || 'your-post-slug'}`} />
          </div>
          <div>
            <label style={fieldLabel}>OG / Social share image URL</label>
            <input style={inputStyle} value={post.seo.ogImage} onChange={(e) => updatePost({ seo: { ...post.seo, ogImage: e.target.value } })} placeholder="https://…/og-image.jpg" />
          </div>
          <div>
            <label style={fieldLabel}>OG image alt text</label>
            <input style={inputStyle} value={post.seo.ogImageAlt || ''} onChange={(e) => updatePost({ seo: { ...post.seo, ogImageAlt: e.target.value } })} placeholder="Describe the social share image" />
          </div>
          <GoogleSearchPreview post={post} />
        </div>
      </div>

      {/* ── Content Blocks ── */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
          <p style={{ ...sectionHeadStyle, margin: 0, paddingBottom: 0, border: 'none' }}>📝 Content Blocks</p>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => setShowBlockLibrary((value) => !value)}
            style={{ whiteSpace: 'nowrap' }}
          >
            + Add Section
          </button>
        </div>

        {showBlockLibrary && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
            {BLOCK_LIBRARY.map((b) => (
              <button
                key={b.type}
                type="button"
                className="btn btn-xs"
                onClick={() => {
                  onAddBlock(b.type);
                  setShowBlockLibrary(false);
                }}
                style={{ whiteSpace: 'nowrap', fontSize: 11 }}
                title={b.desc}
              >
                + {b.label}
              </button>
            ))}
          </div>
        )}

        {post.blocks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#bbb', border: '2px dashed #eee', borderRadius: 10 }}>
            <div style={{ fontSize: 15, marginBottom: 16, color: '#888' }}>No sections added yet.</div>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => setShowBlockLibrary(true)}>
              + Add Section
            </button>
          </div>
        )}
        {post.blocks.map((block) => (
          <BlogBlockEditor
            key={block.id}
            block={block}
            authoringProfile={authoringProfile}
            onChange={(next) => updateBlock(block.id, next)}
            onDelete={() => deleteBlock(block.id)}
            onMoveUp={() => moveBlock(block.id, -1)}
            onMoveDown={() => moveBlock(block.id, 1)}
            onDuplicate={() => duplicateBlock(block.id)}
          />
        ))}
      </div>
    </div>
  );
};

// ─── Blog List Item ───────────────────────────────────────────────────────────
const BlogListItem: React.FC<{ post: Post; onOpen: (post: Post, mode: ViewMode) => void }> = ({ post, onOpen }) => (
  <div className="blog-list-item" style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
    {post.cover?.src && (
      <div style={{ height: 200, overflow: 'hidden' }}>
        <img src={post.cover.src} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
    )}
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10, color: '#777', fontSize: 13 }}>
        <span>{post.categories[0] || 'Uncategorized'}</span>
        <span>{new Date(post.publishDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        <span>{post.readingTime} min read</span>
        <span style={{ background: post.status === 'published' ? '#d4edda' : '#fff3cd', color: post.status === 'published' ? '#155724' : '#856404', borderRadius: 999, padding: '2px 8px', fontSize: 11 }}>{post.status}</span>
      </div>
      <h3 style={{ margin: '0 0 10px' }}>{post.title}</h3>
      <p style={{ margin: 0, color: '#555' }}>{post.excerpt}</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundImage: `url(${post.author.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#ccc', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 12 }}>
          {!post.author.avatar && post.author.initials}
        </div>
        <span style={{ fontSize: 14 }}>{post.author.name}</span>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        {post.tags.slice(0, 3).map((tag) => (
          <span key={tag} style={{ background: '#f1f1f1', borderRadius: 999, padding: '4px 10px', fontSize: 12 }}>#{tag}</span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
        <button
          type="button"
          className="btn btn-xs"
          onClick={(e) => { e.stopPropagation(); onOpen(post, 'preview'); }}
          style={{ cursor: 'pointer' }}
        >
          Read
        </button>
        <button
          type="button"
          className="btn btn-xs btn-primary"
          onClick={(e) => { e.stopPropagation(); onOpen(post, 'editor'); }}
          style={{ cursor: 'pointer' }}
        >
          Edit
        </button>
      </div>
    </div>
  </div>
);

// ─── Blog List View ───────────────────────────────────────────────────────────
const BlogListView: React.FC<{ posts: Post[]; onOpen: (post: Post, mode: ViewMode) => void; onCreate: () => void; loading?: boolean; error?: string | null }> = ({ posts, onOpen, onCreate, loading, error }) => (
  <div style={{ padding: 24 }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
      <div>
        <h1 style={{ margin: 0 }}>Journal</h1>
        <p style={{ marginTop: 8, color: '#666' }}>Browse posts, open them for reading, or edit any entry.</p>
      </div>
      <button type="button" className="btn btn-primary" onClick={onCreate}>New post</button>
    </header>
    {error && (
      <div style={{ marginBottom: 20, padding: 16, borderRadius: 12, background: '#ffe5e5', color: '#8a1c1c', border: '1px solid #f5c2c2' }}>
        <strong>Error:</strong> {error}
      </div>
    )}
    {loading && <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>Loading blogs…</div>}
    {!loading && posts.length === 0 && !error && (
      <div style={{ padding: 48, textAlign: 'center', color: '#888', border: '2px dashed #e0e0e0', borderRadius: 16 }}>
        <p style={{ fontSize: 18, margin: '0 0 16px' }}>No posts yet</p>
        <button type="button" className="btn btn-primary" onClick={onCreate}>Create your first post</button>
      </div>
    )}
    <div style={{ display: 'grid', gap: 24 }}>
      {posts.map((post) => (
        <BlogListItem key={post.id || post.slug} post={post} onOpen={onOpen} />
      ))}
    </div>
  </div>
);

// ─── Main Blogs Component ─────────────────────────────────────────────────────
const Blogs: React.FC<BlogsProps> = ({
  posts: propPosts = [],
  layout = 'magazine',
  displayFont = 'serif',
  onPostClick,
  showListView = true,
}) => {
  const [postsState, setPostsState] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [showFormatLibrary, setShowFormatLibrary] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<BlogFormat | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<BlogTemplateDefinition | null>(null);
  const [returnToTemplateLibrary, setReturnToTemplateLibrary] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(showListView ? 'list' : 'preview');

  useEffect(() => { loadBlogs(); }, []);

  const loadBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBlogs();
      if (response.success) {
        setPostsState(response.data.posts.map(normalizePost));
      }
    } catch (err) {
      setError(mapErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propPosts.length > 0) setPostsState(propPosts.map(normalizePost));
  }, [propPosts]);

  const openPost = (post: Post, mode: ViewMode) => {
    setActivePost(post);
    setIsCreatingPost(false);
    setReturnToTemplateLibrary(false);
    setViewMode(mode);
    if (mode === 'preview') onPostClick?.(post);
  };

  const createPost = () => {
    setError(null);
    setSelectedFormat(null);
    setSelectedTemplate(null);
    setReturnToTemplateLibrary(false);
    setShowFormatLibrary(true);
  };

  const createPostFromTemplate = async (template: BlogTemplateDefinition) => {
    setShowFormatLibrary(false);
    setSelectedTemplate(template);
    setReturnToTemplateLibrary(true);
    setError(null);

    const basePost = createEmptyPost();
    const templateBlocks = templateBlocksToPostBlocks(template.blocks, template.profile);
    const draftPost: Post = {
      ...basePost,
      id: `local-${makeId()}`,
      blocks: templateBlocks,
    };

    setActivePost(draftPost);
    setIsCreatingPost(true);
    setViewMode('editor');
  };

  const createPostFromFormat = async (format: BlogFormatDefinition) => {
    setShowFormatLibrary(false);
    setSelectedFormat(null);
    setSelectedTemplate(null);
    setReturnToTemplateLibrary(false);
    setError(null);

    const basePost = createEmptyPost();
    const draftPost: Post = {
      ...basePost,
      id: `local-${makeId()}`,
      blocks: format.blocks.map((type) => defaultBlock(type)),
    };

    setActivePost(draftPost);
    setIsCreatingPost(true);
    setViewMode('editor');
  };

  const handlePostChange = (next: Post) => {
    setActivePost(next);
    setPostsState((prev) => prev.map((p) => (p.id === next.id ? next : p)));
  };

  const savePost = async (post?: Post) => {
    const target = post ?? activePost;
    if (!target) return false;

    setSaving(true);
    try {
      const createPayload = { ...target };
      delete createPayload.id;

      const response = isCreatingPost
        ? await createBlog(createPayload)
        : target.id
          ? await updateBlog(target.id, target)
          : null;

      if (!response) {
        setError('This post is missing a valid ID and cannot be updated.');
        return false;
      }

      if (response.success) {
        const normalized = normalizePost(response.data);
        setPostsState((prev) => prev.map((p) => (p.id === normalized.id ? normalized : p)));
        if (isCreatingPost) {
          setPostsState((prev) => [normalized, ...prev.filter((p) => p.id !== normalized.id)]);
          setIsCreatingPost(false);
        }
        setActivePost(normalized);
        return true;
      }
    } catch (err) {
      console.error('Failed to save blog:', err);
      setError(mapErrorMessage(err));
    } finally {
      setSaving(false);
    }
    return false;
  };

  const deletePost = async (id: string) => {
    if (!window.confirm('Delete this blog post? This cannot be undone.')) return;
    try {
      const response = await deleteBlog(id);
      if (response.success) {
        setPostsState((prev) => prev.filter((p) => p.id !== id));
        setActivePost(null);
        setViewMode('list');
      }
    } catch (err) {
      setError(mapErrorMessage(err));
    }
  };

  const addBlock = (type: BlockType) => {
    if (!activePost) return;
    const newBlock = defaultBlock(type);
    handlePostChange({ ...activePost, blocks: [...activePost.blocks, newBlock] });
  };

  if (showFormatLibrary) {
    const isCategorySelected = selectedFormat && selectedFormat !== 'blank';
    const currentTemplates = isCategorySelected ? TEMPLATES_BY_FORMAT[selectedFormat] : null;
    const currentInfo = isCategorySelected ? FORMAT_GALLERY_INFO[selectedFormat] : null;

    return (
      <div style={{ padding: 32, background: '#f4f4f4', minHeight: '100vh' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {isCategorySelected && currentTemplates && currentInfo ? (
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFormat(null);
                  setSelectedTemplate(null);
                }}
                className="mb-6 rounded-full bg-[#d06549] px-5 py-2 text-white"
              >
                ← Back
              </button>

              <h2 className="mb-2 text-2xl font-semibold">
                {currentInfo.title}
              </h2>

              <p className="mb-8 text-gray-600">
                {currentInfo.subtitle}
              </p>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {currentTemplates.map((template) => {
                  const isSelected = selectedTemplate?.id === template.id;
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => void createPostFromTemplate(template)}
                      className={`overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                        isSelected ? 'border-[#d06549] ring-2 ring-[#d06549]/30' : 'border-gray-200'
                      }`}
                    >
                      <TemplateThumbnail template={template} />

                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">
                            {template.name}
                          </h3>
                          {isSelected && (
                            <span className="rounded-full bg-[#d06549]/10 px-2 py-0.5 text-xs font-semibold text-[#d06549]">
                              Selected
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-gray-600">
                          {template.description}
                        </p>

                        {template.profile && (
                          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                            <span className="rounded-full bg-[#f8f2ed] px-2 py-1">
                              {template.profile.contentDensity}
                            </span>
                            <span className="rounded-full bg-[#f8f2ed] px-2 py-1">
                              {template.profile.imageStrategy}
                            </span>
                            <span className="rounded-full bg-[#f8f2ed] px-2 py-1">
                              {template.profile.editorialRhythm}
                            </span>
                          </div>
                        )}

                        <div className="mt-4 text-xs font-medium text-gray-400">
                          {template.blocks.length} sections
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedTemplate && (
                <div className="mt-6 flex items-center justify-between rounded-xl border border-[#d06549]/30 bg-[#d06549]/5 p-4 text-[#d06549]">
                  <div>
                    <span className="font-semibold">Selected Template:</span> {selectedTemplate.name} ({selectedTemplate.blocks.length} sections)
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 28 }}>
                <h1 style={{ margin: 0 }}>Choose a Blog Format</h1>
                <p style={{ color: '#666', marginTop: 8 }}>
                  Start with a predefined structure or build your blog from scratch.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: 16,
                }}
              >
                {BLOG_FORMATS.map((format) => (
                  <button
                    key={format.type}
                    type="button"
                    onClick={() => {
                      if (format.type === 'blank') {
                        createPostFromFormat(format);
                      } else {
                        setSelectedFormat(format.type);
                        setSelectedTemplate(null);
                      }
                    }}
                    style={{
                      textAlign: 'left',
                      padding: 20,
                      border: '1px solid #ddd',
                      borderRadius: 14,
                      background: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 700 }}>
                      {format.label}
                    </div>

                    <p style={{ margin: '8px 0 0', color: '#666', lineHeight: 1.5 }}>
                      {format.description}
                    </p>

                    <div style={{ marginTop: 14, fontSize: 12, color: '#888' }}>
                      {format.blocks.length === 0
                        ? 'Start with an empty editor'
                        : `${format.blocks.length} starting sections`}
                    </div>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setReturnToTemplateLibrary(false);
                  setShowFormatLibrary(false);
                }}
                style={{ marginTop: 24 }}
              >
                ← Back
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (viewMode === 'editor' && activePost) {
    return (
      <BlogEditor
        post={activePost}
        authoringProfile={selectedTemplate?.profile}
        onChange={handlePostChange}
        onSave={async () => {
          const saved = await savePost(activePost);
          if (saved) {
            setReturnToTemplateLibrary(false);
            setViewMode('list');
          }
        }}
        onPreview={() => setViewMode('preview')}
        onCancel={() => {
          if (isCreatingPost) {
            setActivePost(null);
            setIsCreatingPost(false);
          } else {
            void savePost(activePost);
          }
          if (returnToTemplateLibrary) {
            setShowFormatLibrary(true);
          } else {
            setViewMode('list');
          }
        }}
        onDelete={() => {
          if (isCreatingPost) {
            setActivePost(null);
            setIsCreatingPost(false);
            setViewMode('list');
          } else if (activePost.id) {
            void deletePost(activePost.id);
          }
        }}
        onAddBlock={addBlock}
        saving={saving}
      />
    );
  }

  if (viewMode === 'preview' && activePost) {
    return (
      <div style={{ position: 'relative', height: '100%' }}>
        {/* Floating toolbar */}
        <div style={{
          position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
          zIndex: 1000, display: 'flex', gap: 8,
          background: 'rgba(20,20,20,0.85)', backdropFilter: 'blur(10px)',
          borderRadius: 999, padding: '8px 16px', boxShadow: '0 4px 24px rgba(0,0,0,0.25)',
        }}>
          <span style={{ color: '#fff', fontSize: 12, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', alignSelf: 'center', paddingLeft: 4 }}>
            👁 Preview (unsaved)
          </span>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => setViewMode('editor')}
            style={{ borderRadius: 999 }}
          >
            ✏️ Back to editor
          </button>
        </div>
        <BlogPostView post={activePost} layout={layout} displayFont={displayFont} />
      </div>
    );
  }

  return (
    <BlogListView
      posts={postsState}
      onOpen={openPost}
      onCreate={createPost}
      loading={loading}
      error={error}
    />
  );
};

export default Blogs;