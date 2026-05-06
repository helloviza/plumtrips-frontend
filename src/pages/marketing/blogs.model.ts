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

export interface PostBlock {
  id: string;
  type: BlockType;
  text?: string;
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
  };
  blocks: PostBlock[];
  related: Array<{ cat: string; title: string; excerpt: string; thumb: string }>;
}
