export type BlockType =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'p'
  | 'quote'
  | 'image'
  | 'cover'
  | 'gallery'
  | 'numlist'
  | 'hotel'
  | 'map'
  | 'video'
  | 'newsletter';

export interface ListItem {
  n: number;
  title: string;
  loc: string;
  body: string;
  img?: string;
}

export interface MapPin {
  x: number;
  y: number;
  label: string;
}

export interface BlogLocation {
  name: string;
  latitude: number;
  longitude: number;
}

export type BlogFontFamily =
  | 'template-default'
  | 'plumtrips-editorial'
  | 'georgia'
  | 'arial'
  | 'times-new-roman'
  | 'tahoma';

export type BlogTextSize = 'small' | 'normal' | 'large' | 'xl';
export type BlogTextAlignment = 'left' | 'center' | 'right';
export type BlogColorToken = 'default' | 'heading' | 'accent' | 'muted' | 'custom';
export type BlogLineHeight = 'tight' | 'normal' | 'relaxed';
export type BlogLetterSpacing = 'tight' | 'normal' | 'wide';
export type BlogHighlight = 'none' | 'tip' | 'important' | 'warning' | 'quick-fact' | 'editor-note' | 'custom';

export interface TypographyRules {
  headingFontFamily: BlogFontFamily;
  bodyFontFamily: BlogFontFamily;
  h1Size: BlogTextSize;
  h2Size: BlogTextSize;
  h3Size: BlogTextSize;
  bodyTextSize: BlogTextSize;
  headingWeight: 400 | 500 | 600 | 700;
  bodyWeight: 400 | 500 | 600;
  lineHeight: BlogLineHeight;
  letterSpacing: BlogLetterSpacing;
  headingColor: BlogColorToken;
  bodyColor: BlogColorToken;
  accentColor: BlogColorToken;
  textAlignment: BlogTextAlignment;
}

export type TypographyOverrides = Partial<TypographyRules> & {
  fontFamily?: BlogFontFamily;
  size?: BlogTextSize;
  color?: BlogColorToken;
  alignment?: BlogTextAlignment;
  bold?: boolean;
  italic?: boolean;
};

export type BlogContentWidth = 'narrow' | 'standard' | 'wide' | 'full';
export type BlogImageAlignment = 'left' | 'center' | 'right' | 'full';
export type BlogSidebar = 'none' | 'left' | 'right';
export type BlogSpacing = 'compact' | 'standard' | 'relaxed';
export type BlogImageFit = 'cover' | 'contain' | 'natural';
export type BlogImageRatio = '16:9' | '4:3' | '3:2' | '1:1' | 'original';
export type BlogGalleryComposition = 'equal' | 'featured-left' | 'featured-right' | 'featured-top';

export interface LayoutRules {
  contentWidth: BlogContentWidth;
  imageWidth: BlogContentWidth;
  imageAlignment: BlogImageAlignment;
  textAlignment: BlogTextAlignment;
  sectionSpacing: BlogSpacing;
  imageTextSpacing: BlogSpacing;
  sidebar: BlogSidebar;
}

export type LayoutOverrides = Partial<LayoutRules>;

export type TemplateContentDensity = 'light' | 'balanced' | 'dense';
export type TemplateImageStrategy = 'image-led' | 'balanced' | 'text-led' | 'gallery-heavy';
export type TemplateEditorialRhythm = 'narrative' | 'practical' | 'scannable' | 'visual';

export interface TemplateBlockGuidance {
  purpose?: string;
  recommendedTextRange?: { minWords?: number; maxWords?: number };
  recommendedImageCount?: { min?: number; max?: number };
  recommendedItemRange?: { minItems?: number; maxItems?: number };
  imageStyle?: string;
  guidance?: string;
}

export interface TemplateAuthoringProfile {
  purpose: string;
  contentDensity: TemplateContentDensity;
  imageStrategy: TemplateImageStrategy;
  editorialRhythm: TemplateEditorialRhythm;
  recommendedTextRange?: { minWords?: number; maxWords?: number };
  recommendedImageCount?: { min?: number; max?: number };
  recommendedListDensity?: { minItems?: number; maxItems?: number };
  sectionGuidance?: {
    required?: string[];
    recommended?: string[];
    optional?: string[];
  };
  blockGuidance?: Record<string, TemplateBlockGuidance>;
  highlightUsage: BlogHighlight[];
  typographyBias: string;
  layoutBias: string;
}

export interface PostBlockSettings {
  imageStyle?: 'standard' | 'large' | 'full-width' | 'gallery';
  imagePosition?: 'left' | 'right' | 'center' | 'top' | 'bottom';
  imageFit?: BlogImageFit;
  imageRatio?: BlogImageRatio;
  galleryComposition?: BlogGalleryComposition;
  galleryGap?: BlogSpacing;
  width?: 'small' | 'medium' | 'large' | 'full';
  alignment?: 'left' | 'center' | 'right';
  minWords?: number;
  maxWords?: number;
  minItems?: number;
  maxItems?: number;
  imageCount?: number;
  required?: boolean;
  typography?: TypographyOverrides;
  layout?: LayoutOverrides;
  highlight?: BlogHighlight;
}

export interface InlineTextMarks {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  highlight?: string;
}

export interface InlineTextFragment {
  text: string;
  marks?: InlineTextMarks;
}

export interface PostBlock {
  id: string;
  type: BlockType;
  settings?: PostBlockSettings;
  text?: string;
  inlineContent?: InlineTextFragment[];
  cite?: string;
  caption?: string;
  src?: string;
  images?: string[];
  items?: ListItem[];
  kicker?: string;
  name?: string;
  loc?: string;
  desc?: string;
  price?: string;
  nights?: string;
  img?: string;
  pins?: MapPin[];
  title?: string;
  body?: string;
  url?: string;
  [key: string]: any;
}

export interface PostCover {
  src: string;
  caption: string;
  alt?: string;
}

export interface PostAuthor {
  name: string;
  role: string;
  initials: string;
  avatar: string;
}

export interface Post {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  excerpt: string;
  location?: BlogLocation;
  cover?: PostCover;
  author: PostAuthor;
  categories: string[];
  tags: string[];
  readingTime: number;
  publishDate: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  featured: boolean;
  seo: {
    title: string;
    description: string;
    ogImage: string;
    ogImageAlt?: string;
    canonicalUrl?: string;
  };
  blocks: PostBlock[];
  related: Array<{ cat: string; title: string; excerpt: string; thumb: string }>;
}