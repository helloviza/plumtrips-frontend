/*Blogs.tsx*/
import React, { useEffect, useRef, useState } from 'react';
import type { Post } from '../../lib/api';
import type {
  BlogHighlight,
  LayoutOverrides,
  PostBlock,
  PostBlockSettings,
  TemplateAuthoringProfile,
  TemplateBlockGuidance,
  TypographyOverrides,
  InlineTextMarks,
  BlogGalleryComposition,
  BlogImageFit,
  BlogImageRatio,
  StoryStyle,
  BackgroundTheme,
  BlockType,
  ListItem,
} from './blogs.model';
import {
  BLOG_FORMATS,
  FORMAT_GALLERY_INFO,
  STORY_STYLE_LABELS,
  TEMPLATES_BY_FORMAT,
  type BlogFormat,
  type BlogFormatDefinition,
  type BlogTemplateBlock,
  type BlogTemplateDefinition,
} from './blog-templates.data';
import {
  applyInlineMark,
  sanitizeHref,
  InlineRichTextEditor,
  type InlineRichTextEditorRef,
  getMarksAtCaret,
  getMarksAtIndex,
  isBooleanMarkActiveInRange,
  getSharedValueMarkInRange,
  hasAnyInlineMark,
  clearInlineMarks,
  withoutLinkMarks,
  resolveTypingMarks,
} from './InlineText';
import { ITINERARY_SCAFFOLDS, hasExistingItineraryScaffold, type ItineraryScaffoldDuration } from './itinerary-scaffold';
import BlogLocationPicker from './BlogLocationPicker';
import { getBlogs, createBlog, updateBlog, deleteBlog, publishBlog, uploadBlogImage } from '../../lib/api';
import ReadBlog from '../blogs/ReadBlog';
import './published-styles.css';

// ─── Normalize MongoDB _id → id ───────────────────────────────────────────────
const normalizeTags = (tags: unknown): string[] => {
  if (!Array.isArray(tags)) return [];

  const seen = new Set<string>();
  return tags.reduce<string[]>((normalized, tag) => {
    if (typeof tag !== 'string') return normalized;
    const readableTag = tag.trim();
    const key = readableTag.toLowerCase();
    if (!key || seen.has(key)) return normalized;
    seen.add(key);
    normalized.push(readableTag);
    return normalized;
  }, []);
};

const displayLabels = (values: unknown): string[] => (
  Array.isArray(values)
    ? values.filter((value): value is string => typeof value === 'string').map((value) => value.trim()).filter(Boolean)
    : []
);

function normalizePost(raw: Partial<Post> & { _id?: string }): Post {
  return {
    ...raw,
    id: raw.id ?? raw._id ?? '',
    tags: normalizeTags(raw.tags),
  } as Post;
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

const hasText = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const hasMeaningfulBlockContent = (block: PostBlock): boolean => {
  switch (block.type) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'p':
    case 'quote':
      return hasText(block.text);
    case 'image':
    case 'cover':
      return hasText(block.src);
    case 'gallery':
      return Array.isArray(block.images) && block.images.some(hasText);
    case 'numlist':
      return Array.isArray(block.items) && block.items.some((item) => (
        (hasText(item.title) && !/^item\s+\d+$/i.test(item.title.trim()))
        || hasText(item.loc)
        || hasText(item.body)
        || hasText(item.img)
      ));
    case 'hotel':
      return hasText(block.name) || hasText(block.desc) || hasText(block.img);
    case 'map':
      return Array.isArray(block.pins) && block.pins.some((pin) => (
        hasText(pin.label) && pin.label.trim().toLowerCase() !== 'pin label'
      ));
    case 'video':
      return hasText(block.url);
    case 'newsletter':
      return hasText(block.body);
    default:
      return false;
  }
};

const validatePublishPost = (post: Post): string[] => {
  const errors: string[] = [];
  const cleanTitle = (post.title || '').trim();
  if (!cleanTitle || cleanTitle.toLowerCase().startsWith('untitled blog')) {
    errors.push('Provide a descriptive article title before publishing.');
  }
  if (!hasText(post.slug)) {
    errors.push('Add a URL slug before publishing.');
  } else if (/\s/.test(post.slug.trim())) {
    errors.push('Use a URL-friendly slug without spaces.');
  }

  const cleanExcerpt = (post.excerpt || '').trim();
  const cleanSubtitle = (post.subtitle || '').trim();
  const hasOpeningParagraph = Array.isArray(post.blocks) && post.blocks.some(
    (b) => b.type === 'p' && (b.text || '').trim().length >= 30,
  );
  if (!cleanExcerpt && !cleanSubtitle && !hasOpeningParagraph) {
    errors.push('Add an engaging subtitle, excerpt, or introductory paragraph to introduce your article.');
  }

  if (!Array.isArray(post.blocks) || post.blocks.filter(hasMeaningfulBlockContent).length < 2) {
    errors.push('Add at least 2 complete content sections with descriptive text, itineraries, or photography.');
  }

  const hasBlankHeading = (post.blocks || []).some(
    (b) => (b.type === 'h1' || b.type === 'h2' || b.type === 'h3') && !(b.text || '').trim(),
  );
  if (hasBlankHeading) {
    errors.push('One or more section headings are currently empty. Add heading text or remove the section.');
  }

  return errors;
};

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
  { type: 'image', label: 'Image', desc: 'Inline image with caption' },
  { type: 'cover', label: 'Cover', desc: 'Hero photograph' },
  { type: 'gallery', label: 'Gallery', desc: 'Grid of images' },
  { type: 'quote', label: 'Quote', desc: 'Pull quote with attribution' },
  { type: 'numlist', label: 'Numbered list', desc: 'Top list, route, or itinerary' },
  { type: 'hotel', label: 'Hotel card', desc: 'Curated stay recommendation' },
  { type: 'map', label: 'Map', desc: 'Pinned map with waypoints' },
  { type: 'callout', label: 'Callout Tip', desc: 'Travel tip, warning, or highlight box' },
  { type: 'faq', label: 'FAQ Item', desc: 'Traveler question and answer' },
  { type: 'budget', label: 'Budget Row', desc: 'Expense item and estimated price' },
  { type: 'video', label: 'Video', desc: 'Video embed placeholder' },
  { type: 'newsletter', label: 'Newsletter', desc: 'Subscribe CTA' },
];

const makeId = () => `b${Math.random().toString(36).slice(2, 10)}`;

const CONTENT_FIELD_KEYS = new Set([
  'type', 'url', 'text', 'caption', 'cite', 'src', 'images', 'items',
  'kicker', 'name', 'loc', 'desc', 'price', 'nights', 'img',
  'pins', 'title', 'body',
]);

const createDefaultBlock = (
  type: BlockType,
  settings?: PostBlockSettings,
  initial?: Partial<PostBlock>,
): PostBlock => {
  switch (type) {
    case 'h1': case 'h2': case 'h3': case 'p':
      return { id: makeId(), type, text: initial?.text ?? '' };
    case 'quote':
      return { id: makeId(), type, text: initial?.text ?? '', cite: initial?.cite ?? '' };
    case 'image': case 'cover':
      return { id: makeId(), type, src: initial?.src ?? '', caption: initial?.caption ?? '' };
    case 'gallery':
      return { id: makeId(), type, images: initial?.images ?? Array.from({ length: settings?.imageCount ?? 0 }, () => '') };
    case 'numlist':
      return {
        id: makeId(),
        type,
        items: initial?.items && initial.items.length > 0
          ? initial.items.map((it, idx) => ({ n: it.n ?? idx + 1, title: it.title, loc: it.loc ?? '', body: it.body ?? '', img: it.img ?? '' }))
          : Array.from({ length: Math.max(1, settings?.minItems ?? 1) }, (_, index) => ({
            n: index + 1,
            title: `Item ${index + 1}`,
            loc: '',
            body: '',
            img: '',
          })),
      };
    case 'hotel':
      return {
        id: makeId(),
        type,
        kicker: initial?.kicker ?? "Editor's pick",
        name: initial?.name ?? '',
        loc: initial?.loc ?? '',
        desc: initial?.desc ?? '',
        price: initial?.price ?? '',
        nights: initial?.nights ?? '',
        img: initial?.img ?? '',
      };
    case 'map':
      return { id: makeId(), type, pins: initial?.pins ? initial.pins.map((p) => ({ ...p })) : [{ x: 50, y: 50, label: 'Pin label' }] };
    case 'video':
      return { id: makeId(), type, url: initial?.url ?? '' };
    case 'newsletter':
      return { id: makeId(), type, title: initial?.title ?? 'Join the newsletter', body: initial?.body ?? '' };
    case 'callout':
      return {
        id: makeId(),
        type,
        title: initial?.title ?? '',
        text: initial?.text ?? initial?.body ?? '',
      };
    case 'faq':
      return {
        id: makeId(),
        type,
        title: initial?.title ?? 'Frequently Asked Questions',
        items: initial?.items && initial.items.length > 0
          ? initial.items.map((it, idx) => ({ n: it.n ?? idx + 1, title: it.title, loc: it.loc ?? '', body: it.body ?? '', img: it.img ?? '' }))
          : [{ n: 1, title: 'Frequently Asked Question', loc: '', body: 'Answer details go here...', img: '' }],
      };
    case 'budget':
      return {
        id: makeId(),
        type,
        title: initial?.title ?? 'Trip Cost Breakdown',
        price: initial?.price ?? '',
        body: initial?.body ?? '',
      };
    default:
      return { id: makeId(), type, text: initial?.text ?? '' };
  }
};

const defaultBlock = (
  type: BlockType,
  settings?: PostBlockSettings,
  initial?: Partial<PostBlock>,
): PostBlock => {
  const block = createDefaultBlock(type, settings, initial);
  return settings ? { ...block, settings } : block;
};

const templateBlockSettings = (block: BlogTemplateBlock, profile?: TemplateAuthoringProfile): PostBlockSettings => {
  const explicitSettings = Object.fromEntries(
    Object.entries(block).filter(([key]) => !CONTENT_FIELD_KEYS.has(key)),
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
    const initial: Partial<PostBlock> = {};
    if (block.url !== undefined) initial.url = block.url;
    if (block.text !== undefined) initial.text = block.text;
    if (block.caption !== undefined) initial.caption = block.caption;
    if (block.cite !== undefined) initial.cite = block.cite;
    if (block.src !== undefined) initial.src = block.src;
    if (block.images !== undefined) initial.images = [...block.images];
    if (block.items !== undefined) initial.items = block.items.map((it, idx) => ({
      n: it.n ?? idx + 1,
      title: it.title,
      loc: it.loc ?? '',
      body: it.body ?? '',
      img: it.img,
    }));
    if (block.kicker !== undefined) initial.kicker = block.kicker;
    if (block.name !== undefined) initial.name = block.name;
    if (block.loc !== undefined) initial.loc = block.loc;
    if (block.desc !== undefined) initial.desc = block.desc;
    if (block.price !== undefined) initial.price = block.price;
    if (block.nights !== undefined) initial.nights = block.nights;
    if (block.img !== undefined) initial.img = block.img;
    if (block.pins !== undefined) initial.pins = block.pins.map((p) => ({ ...p }));
    if (block.title !== undefined) initial.title = block.title;
    if (block.body !== undefined) initial.body = block.body;
    return defaultBlock(block.type, Object.keys(settings).length > 0 ? settings : undefined, initial);
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

const TEXT_BLOCK_TYPES: BlockType[] = ['h1', 'h2', 'h3', 'p', 'quote', 'callout', 'keyinfo'];

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

        <label>
          <span style={typographyFieldLabel}>Line height</span>
          <select
            aria-label="Line height override"
            style={typographySelectStyle}
            value={typography?.lineHeight || 'template-default'}
            onChange={(e) => selectTypography('lineHeight', e.target.value)}
          >
            <option value="template-default">Template Default</option>
            <option value="tight">Tight</option>
            <option value="normal">Normal</option>
            <option value="relaxed">Relaxed</option>
          </select>
        </label>

        <label>
          <span style={typographyFieldLabel}>Letter spacing</span>
          <select
            aria-label="Letter spacing override"
            style={typographySelectStyle}
            value={typography?.letterSpacing || 'template-default'}
            onChange={(e) => selectTypography('letterSpacing', e.target.value)}
          >
            <option value="template-default">Template Default</option>
            <option value="tight">Tight</option>
            <option value="normal">Normal</option>
            <option value="wide">Wide</option>
          </select>
        </label>

        <label>
          <span style={typographyFieldLabel}>Weight</span>
          <select
            aria-label="Font weight"
            style={typographySelectStyle}
            value={typography?.bold === true ? 'bold' : typography?.bold === false ? 'normal' : 'template-default'}
            onChange={(e) => {
              if (e.target.value === 'template-default') {
                updateTypography({}, 'bold');
              } else {
                updateTypography({ bold: e.target.value === 'bold' });
              }
            }}
          >
            <option value="template-default">Template Default</option>
            <option value="bold">Bold</option>
            <option value="normal">Regular</option>
          </select>
        </label>

        <label>
          <span style={typographyFieldLabel}>Style</span>
          <select
            aria-label="Font style"
            style={typographySelectStyle}
            value={typography?.italic === true ? 'italic' : typography?.italic === false ? 'normal' : 'template-default'}
            onChange={(e) => {
              if (e.target.value === 'template-default') {
                updateTypography({}, 'italic');
              } else {
                updateTypography({ italic: e.target.value === 'italic' });
              }
            }}
          >
            <option value="template-default">Template Default</option>
            <option value="italic">Italic</option>
            <option value="normal">Normal</option>
          </select>
        </label>

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
  const layout = settings.layout;

  const update = (patch: Partial<PostBlockSettings>) => {
    const next = { ...settings, ...patch };
    onChange(Object.keys(next).length ? next : undefined);
  };

  const updateLayout = (
    patch: Partial<LayoutOverrides> = {},
    clearKey?: keyof LayoutOverrides,
  ) => {
    const nextLayout: LayoutOverrides = { ...layout, ...patch };
    if (clearKey) delete nextLayout[clearKey];

    const nextSettings: PostBlockSettings = { ...settings };
    if (Object.keys(nextLayout).length > 0) {
      nextSettings.layout = nextLayout;
    } else {
      delete nextSettings.layout;
    }

    onChange(Object.keys(nextSettings).length > 0 ? nextSettings : undefined);
  };

  const selectLayout = <K extends keyof LayoutOverrides>(key: K, value: string) => {
    if (value === 'template-default') {
      updateLayout({}, key);
      return;
    }
    updateLayout({ [key]: value as LayoutOverrides[K] } as Pick<LayoutOverrides, K>);
  };

  const composition = settings.galleryComposition || 'equal';
  const imageFit = settings.imageFit || 'cover';
  const imageRatio = settings.imageRatio || '1:1';
  const galleryGap = settings.galleryGap || 'standard';

  return (
    <details style={{ marginTop: 12, border: '1px solid #eee', borderRadius: 10, background: '#fafafa' }}>
      <summary style={{ cursor: 'pointer', padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#555' }}>
        Media presentation & layout
      </summary>
      <fieldset style={{ border: 0, padding: '0 12px 12px', display: 'grid', gap: 12 }}>
        <legend className="sr-only">Media presentation and layout settings</legend>
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginTop: 4, paddingTop: 10, borderTop: '1px solid #eee' }}>
          <label>
            <span style={typographyFieldLabel}>Image width</span>
            <select
              aria-label="Image width override"
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
              aria-label="Image alignment override"
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
              aria-label="Image text spacing override"
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

          <label>
            <span style={typographyFieldLabel}>Section spacing</span>
            <select
              aria-label="Section spacing override"
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
        </div>
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

// ─── Block Type Display Labels ────────────────────────────────────────────────
const BLOCK_TYPE_LABELS: Record<string, string> = {
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  p: 'Paragraph',
  quote: 'Pull Quote',
  image: 'Image',
  cover: 'Cover Image',
  gallery: 'Gallery',
  numlist: 'Numbered List',
  hotel: 'Hotel Card',
  map: 'Map',
  callout: 'Callout Tip',
  faq: 'FAQ Item',
  budget: 'Budget Row',
  video: 'Video',
  newsletter: 'Newsletter',
};

// ─── Numbered List Editor ─────────────────────────────────────────────────────
const NumberedListEditor: React.FC<{
  items: ListItem[];
  onChange: (items: ListItem[]) => void;
}> = ({ items = [], onChange }) => {
  const reindex = (list: ListItem[]): ListItem[] =>
    list.map((it, idx) => ({ ...it, n: idx + 1 }));

  const updateItem = (index: number, patch: Partial<ListItem>) => {
    const next = [...items];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const [entry] = next.splice(index, 1);
    next.splice(target, 0, entry);
    onChange(reindex(next));
  };

  const handleRemove = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    onChange(reindex(next));
  };

  const handleAdd = () => {
    const next = [...items, { n: items.length + 1, title: '', loc: '', body: '', img: '' }];
    onChange(reindex(next));
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {items.length === 0 ? (
        <div
          style={{
            padding: '24px 16px',
            textAlign: 'center',
            background: '#fafafa',
            border: '1px dashed #d1d5db',
            borderRadius: 10,
            color: '#6b7280',
          }}
        >
          <div style={{ fontSize: 13, marginBottom: 10 }}>This numbered list has no entries yet.</div>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={handleAdd}
          >
            + Add First Entry
          </button>
        </div>
      ) : (
        items.map((item, index) => (
          <div
            key={index}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: 12,
              background: '#ffffff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            }}
          >
            {/* Header row: Number badge + Title + Action buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 30,
                  height: 30,
                  borderRadius: 6,
                  background: '#f3f0ff',
                  color: '#6d28d9',
                  fontWeight: 700,
                  fontSize: 12,
                  fontVariantNumeric: 'tabular-nums',
                  flexShrink: 0,
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <input
                style={{
                  flex: 1,
                  padding: '7px 10px',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  fontSize: 13,
                  fontWeight: 600,
                  background: '#fafafa',
                }}
                value={item.title || ''}
                onChange={(e) => updateItem(index, { title: e.target.value })}
                placeholder={`Entry ${index + 1} headline or title...`}
              />
              <div style={{ display: 'inline-flex', gap: 4, flexShrink: 0 }}>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  title="Move entry up"
                  style={{ opacity: index === 0 ? 0.35 : 1 }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === items.length - 1}
                  title="Move entry down"
                  style={{ opacity: index === items.length - 1 ? 0.35 : 1 }}
                >
                  ↓
                </button>
                <button
                  type="button"
                  className="btn btn-xs"
                  onClick={() => handleRemove(index)}
                  title="Delete entry"
                  style={{ color: '#dc2626' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Secondary metadata row (Location + Image URL) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 2 }}>
                  Location (optional)
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid #e5e7eb',
                    fontSize: 12,
                    background: '#f9fafb',
                    boxSizing: 'border-box',
                  }}
                  value={item.loc || ''}
                  onChange={(e) => updateItem(index, { loc: e.target.value })}
                  placeholder="e.g. Kyoto, Japan"
                />
              </div>
              <div>
                <label style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 2 }}>
                  Image URL (optional)
                </label>
                <input
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    borderRadius: 6,
                    border: '1px solid #e5e7eb',
                    fontSize: 12,
                    background: '#f9fafb',
                    boxSizing: 'border-box',
                  }}
                  value={item.img || ''}
                  onChange={(e) => updateItem(index, { img: e.target.value })}
                  placeholder="https://... image url"
                />
              </div>
            </div>

            {/* Body text */}
            <div>
              <label style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 2 }}>
                Description / Body
              </label>
              <textarea
                style={{
                  width: '100%',
                  minHeight: 64,
                  padding: '7px 8px',
                  borderRadius: 6,
                  border: '1px solid #e5e7eb',
                  fontSize: 12,
                  lineHeight: 1.5,
                  background: '#fafafa',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                }}
                value={item.body || ''}
                onChange={(e) => updateItem(index, { body: e.target.value })}
                placeholder="Describe this highlight, tip, or stop…"
              />
            </div>
          </div>
        ))
      )}

      {items.length > 0 && (
        <button
          type="button"
          className="btn btn-sm"
          onClick={handleAdd}
          style={{
            alignSelf: 'start',
            background: '#f9fafb',
            border: '1px dashed #d1d5db',
            color: '#374151',
            fontWeight: 500,
          }}
        >
          + Add List Entry ({items.length} current)
        </button>
      )}
    </div>
  );
};

export type BlogEditorElement = {
  focus: (options?: FocusOptions) => void;
  setSelectionRange?: (start: number, end: number) => void;
} | null;

// ─── Block Editor ─────────────────────────────────────────────────────────────
const BlogBlockEditor: React.FC<{
  block: PostBlock;
  index: number;
  isActive: boolean;
  authoringProfile?: TemplateAuthoringProfile;
  pendingMarks?: InlineTextMarks;
  onFormatKey?: (mark: 'bold' | 'italic' | 'underline' | 'strikethrough') => void;
  onChange: (value: PostBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
  onFocusBlock?: (id: string, editorEl?: BlogEditorElement) => void;
  onSelectionChange?: (sel: { start: number; end: number }, editorEl?: BlogEditorElement) => void;
}> = ({
  block,
  index,
  isActive,
  authoringProfile,
  pendingMarks,
  onFormatKey,
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onFocusBlock,
  onSelectionChange,
}) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetField] = useState<string>('src');
  const richEditorRef = useRef<InlineRichTextEditorRef>(null);

  const updateField = (field: string, value: unknown) => onChange({ ...block, [field]: value });
  const updateItems = (items: ListItem[]) => updateField('items', items);
  const updatePins = (pins: PostBlock['pins']) => updateField('pins', pins);

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
    <div
      id={`block-editor-${block.id}`}
      className={`block-editor ${isActive ? 'block-editor--active' : ''}`}
      onClick={() => onFocusBlock?.(block.id, richEditorRef.current)}
      style={{
        border: isActive ? '2px solid #7c3aed' : '1px solid #ddd',
        boxShadow: isActive ? '0 0 0 3px rgba(124, 58, 237, 0.12)' : 'none',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        background: '#fff',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        scrollMarginTop: 90,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: isActive ? '#6d28d9' : '#888', background: isActive ? '#f5f3ff' : '#f0f0f0', padding: '4px 10px', borderRadius: 999 }}>
            #{index + 1} {BLOCK_TYPE_LABELS[block.type] || block.type}
          </span>
          {isActive && (
            <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600 }}>
              Active
            </span>
          )}
        </div>
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
        <InlineRichTextEditor
          ref={richEditorRef}
          value={block.text || ''}
          fragments={block.inlineContent}
          pendingMarks={isActive ? pendingMarks : undefined}
          onFormatKey={isActive ? onFormatKey : undefined}
          placeholder={`${BLOCK_TYPE_LABELS[block.type] || 'Block'} text`}
          multiline={block.type === 'p'}
          blockType={block.type}
          style={{
            fontSize: block.type === 'h1' ? 22 : block.type === 'h2' ? 18 : block.type === 'h3' ? 16 : 14,
            fontWeight: ['h1', 'h2', 'h3'].includes(block.type) ? 700 : 400,
            minHeight: block.type === 'p' ? 80 : 42,
          }}
          onChange={(nextText, nextFragments) => {
            onChange({
              ...block,
              text: nextText,
              inlineContent: nextFragments.length > 0 ? nextFragments : undefined,
            });
          }}
          onFocus={() => {
            onFocusBlock?.(block.id, richEditorRef.current);
          }}
          onSelectionChange={(sel) => {
            onSelectionChange?.(sel, richEditorRef.current);
          }}
        />
      )}

      {block.type === 'quote' && (
        <>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Quote text</label>
          <InlineRichTextEditor
            ref={richEditorRef}
            value={block.text || ''}
            fragments={block.inlineContent}
            pendingMarks={isActive ? pendingMarks : undefined}
            onFormatKey={isActive ? onFormatKey : undefined}
            placeholder="Quote text"
            multiline={true}
            blockType="quote"
            style={{
              fontSize: 15,
              fontStyle: 'italic',
              marginBottom: 12,
              minHeight: 80,
            }}
            onChange={(nextText, nextFragments) => {
              onChange({
                ...block,
                text: nextText,
                inlineContent: nextFragments.length > 0 ? nextFragments : undefined,
              });
            }}
            onFocus={() => {
              onFocusBlock?.(block.id, richEditorRef.current);
            }}
            onSelectionChange={(sel) => {
              onSelectionChange?.(sel, richEditorRef.current);
            }}
          />
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Attribution / credit</label>
          <input
            style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
            value={block.cite || ''}
            onChange={(e) => updateField('cite', e.target.value)}
            onFocus={() => onFocusBlock?.(block.id, null)}
            placeholder="— Person Name"
          />
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
        <NumberedListEditor
          items={block.items || []}
          onChange={(items) => updateItems(items)}
        />
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
              <input style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd' }} value={((block as Record<string, unknown>)[f] as string) || ''} onChange={(e) => updateField(f, e.target.value)} placeholder={ph} />
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

      {block.type === 'callout' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Callout Title</label>
            <input
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
              value={block.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Pro Tip, Important Note"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Callout Text</label>
            <InlineRichTextEditor
              ref={richEditorRef}
              value={block.text || ''}
              fragments={block.inlineContent}
              pendingMarks={isActive ? pendingMarks : undefined}
              onFormatKey={isActive ? onFormatKey : undefined}
              placeholder="Callout details, tips, or highlights..."
              multiline={true}
              blockType="callout"
              style={{
                fontSize: 14,
                minHeight: 70,
              }}
              onChange={(nextText, nextFragments) => {
                onChange({
                  ...block,
                  text: nextText,
                  inlineContent: nextFragments.length > 0 ? nextFragments : undefined,
                });
              }}
              onFocus={() => {
                onFocusBlock?.(block.id, richEditorRef.current);
              }}
              onSelectionChange={(sel) => {
                onSelectionChange?.(sel, richEditorRef.current);
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Callout Style / Icon</label>
            <select
              style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid #ddd', background: '#fff' }}
              value={block.settings?.highlight || 'tip'}
              onChange={(e) => {
                const nextSettings = { ...(block.settings || {}), highlight: e.target.value as 'tip' | 'warning' | 'important' | 'editor-note' };
                onChange({ ...block, settings: nextSettings });
              }}
            >
              <option value="tip">💡 Tip</option>
              <option value="warning">⚠️ Warning</option>
              <option value="important">⭐ Important</option>
              <option value="editor-note">📝 Editor Note</option>
            </select>
          </div>
        </div>
      )}

      {block.type === 'faq' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>FAQ Section Title</label>
            <input
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
              value={block.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Frequently Asked Questions"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Questions & Answers</label>
            {(block.items || []).map((item, idx) => (
              <div key={idx} style={{ display: 'grid', gap: 6, border: '1px solid #eee', padding: 10, borderRadius: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: 12 }}>Question #{idx + 1}</strong>
                  <button
                    type="button"
                    className="btn btn-xs"
                    onClick={() => {
                      const nextItems = (block.items || []).filter((_, i) => i !== idx);
                      updateItems(nextItems);
                    }}
                    style={{ color: '#dc3545' }}
                  >
                    Remove
                  </button>
                </div>
                <input
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}
                  value={item.title || ''}
                  onChange={(e) => {
                    const nextItems = [...(block.items || [])];
                    nextItems[idx] = { ...nextItems[idx], title: e.target.value };
                    updateItems(nextItems);
                  }}
                  placeholder="Question title"
                />
                <textarea
                  style={{ width: '100%', minHeight: 60, padding: 8, borderRadius: 6, border: '1px solid #ddd', fontSize: 13 }}
                  value={item.body || ''}
                  onChange={(e) => {
                    const nextItems = [...(block.items || [])];
                    nextItems[idx] = { ...nextItems[idx], body: e.target.value };
                    updateItems(nextItems);
                  }}
                  placeholder="Answer explanation..."
                />
              </div>
            ))}
            <button
              type="button"
              className="btn btn-xs btn-secondary"
              onClick={() => {
                const nextItems: ListItem[] = [
                  ...(block.items || []),
                  { n: (block.items?.length || 0) + 1, title: 'New Question', loc: '', body: '', img: '' },
                ];
                updateItems(nextItems);
              }}
            >
              + Add FAQ Question
            </button>
          </div>
        </div>
      )}

      {block.type === 'budget' && (
        <div style={{ display: 'grid', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Budget Title</label>
            <input
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
              value={block.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Trip Cost Breakdown"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Estimated Total Price</label>
            <input
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
              value={block.price || ''}
              onChange={(e) => updateField('price', e.target.value)}
              placeholder="e.g. ₹45,000 / $550 per person"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Budget Description / Details</label>
            <textarea
              style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid #ddd' }}
              value={block.body || ''}
              onChange={(e) => updateField('body', e.target.value)}
              placeholder="Breakdown includes flights, 4-star boutique hotels, meals, local transit..."
            />
          </div>
        </div>
      )}
    </div>
  );
};

const BlogPostView: React.FC<{
  post: Post;
  storyStyle?: StoryStyle;
  theme?: BackgroundTheme;
  layout?: 'magazine' | 'listicle' | 'essay';
  displayFont?: 'serif' | 'sans';
}> = ({ post, storyStyle, theme, layout = 'magazine', displayFont = 'serif' }) => (
  <ReadBlog
    post={post}
    storyStyle={storyStyle || post.storyStyle}
    theme={theme || post.theme}
    layout={layout}
    displayFont={displayFont}
    isPreview
  />
);

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
  onPublish: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onAddBlock?: (type: BlockType) => void;
  saving?: boolean;
}> = ({ post, authoringProfile, onChange, onSave, onPreview, onPublish, onCancel, onDelete, saving }) => {
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  const [activeSelection, setActiveSelection] = useState<{ start: number; end: number }>({ start: 0, end: 0 });
  const activeTextareaRef = useRef<BlogEditorElement>(null);
  const pendingScrollBlockIdRef = useRef<string | null>(null);

  const [showScaffoldModal, setShowScaffoldModal] = useState(false);
  const [scaffoldDuration, setScaffoldDuration] = useState<ItineraryScaffoldDuration>('3-day');
  const [confirmReplaceMode, setConfirmReplaceMode] = useState(false);

  const handleApplyScaffold = (duration: ItineraryScaffoldDuration, mode: 'append' | 'replace') => {
    const scaffold = ITINERARY_SCAFFOLDS[duration];
    if (!scaffold) return;

    const newBlocks = scaffold.createBlocks(makeId);
    const firstNewBlockId = newBlocks[0]?.id;

    if (mode === 'replace') {
      onChange({
        ...post,
        blocks: newBlocks,
        storyStyle: duration === '7-day' ? 'itinerary-planner' : 'day-by-day',
      });
    } else {
      onChange({
        ...post,
        blocks: [...post.blocks, ...newBlocks],
      });
    }

    if (firstNewBlockId) {
      setActiveBlockId(firstNewBlockId);
      pendingScrollBlockIdRef.current = firstNewBlockId;
    }

    setShowScaffoldModal(false);
    setConfirmReplaceMode(false);
  };

  const updatePost = (patch: Partial<Post>) => onChange({ ...post, ...patch });
  const updateAuthor = (patch: Partial<Post['author']>) => updatePost({ author: { ...post.author, ...patch } });

  const updateBlock = (id: string, next: PostBlock) => {
    onChange({ ...post, blocks: post.blocks.map((b) => (b.id === id ? next : b)) });
  };

  const deleteBlock = (id: string) => {
    if (activeBlockId === id) setActiveBlockId(null);
    onChange({ ...post, blocks: post.blocks.filter((b) => b.id !== id) });
  };

  const moveBlock = (id: string, dir: number) => {
    const idx = post.blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= post.blocks.length) return;
    const next = [...post.blocks];
    const [item] = next.splice(idx, 1);
    next.splice(targetIdx, 0, item);
    onChange({ ...post, blocks: next });
  };

  const duplicateBlock = (id: string) => {
    const idx = post.blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const copy = { ...JSON.parse(JSON.stringify(post.blocks[idx])), id: makeId() };
    const next = [...post.blocks];
    next.splice(idx + 1, 0, copy);
    onChange({ ...post, blocks: next });
    setActiveBlockId(copy.id);
    pendingScrollBlockIdRef.current = copy.id;
  };

  useEffect(() => {
    const targetId = pendingScrollBlockIdRef.current;
    if (!targetId) return;

    const performScroll = () => {
      const el = document.getElementById(`block-editor-${targetId}`);
      if (!el) return false;

      pendingScrollBlockIdRef.current = null;

      const toolbar = document.querySelector('.sticky-editor-toolbar') as HTMLElement | null;
      const toolbarHeight = toolbar ? toolbar.offsetHeight : 64;
      const topOffset = toolbarHeight + 20;

      // Find scrollable container (e.g. parent with overflow-y: auto/scroll)
      let container: HTMLElement | null = null;
      let parent = el.parentElement;
      while (parent) {
        const style = window.getComputedStyle(parent);
        if (
          (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
          parent.scrollHeight > parent.clientHeight
        ) {
          container = parent;
          break;
        }
        parent = parent.parentElement;
      }

      if (container) {
        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const targetScrollTop = container.scrollTop + (elRect.top - containerRect.top) - topOffset;
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: 'smooth',
        });
      } else {
        const elRect = el.getBoundingClientRect();
        const targetScrollY = window.scrollY + elRect.top - topOffset;
        window.scrollTo({
          top: Math.max(0, targetScrollY),
          behavior: 'smooth',
        });
      }

      // Ready for editing: focus the primary editable field inside the block if available
      const primaryInput = el.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLDivElement>(
        '[contenteditable="true"], textarea, input[type="text"], input:not([type])'
      );
      if (primaryInput) {
        primaryInput.focus({ preventScroll: true });
        activeTextareaRef.current = primaryInput;
      }
      return true;
    };

    if (!performScroll()) {
      const rafId = requestAnimationFrame(() => {
        performScroll();
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [post.blocks]);

  const activeBlockIndex = post.blocks.findIndex((b) => b.id === activeBlockId);
  const activeBlock = activeBlockIndex >= 0 ? post.blocks[activeBlockIndex] : null;
  const isTextBlock = activeBlock ? ['h1', 'h2', 'h3', 'p', 'quote', 'callout'].includes(activeBlock.type) : false;
  const hasSelection = isTextBlock && activeSelection.end > activeSelection.start;

  const [showLinkPopover, setShowLinkPopover] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTargetBlank, setLinkTargetBlank] = useState(true);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [pendingMarks, setPendingMarks] = useState<InlineTextMarks>({});
  const [pendingOverride, setPendingOverride] = useState(false);
  const ignoreOverrideResetRef = useRef(false);
  const linkModeRef = useRef(false);

  useEffect(() => {
    setPendingMarks({});
    setPendingOverride(false);
    linkModeRef.current = false;
    setShowLinkPopover(false);
  }, [activeBlockId]);

  const fragmentMarksAtCaret = activeBlock
    ? hasSelection
      ? getMarksAtIndex(activeBlock.inlineContent, activeSelection.start)
      : getMarksAtCaret(activeBlock.inlineContent, activeSelection.start)
    : {};

  const typingMarks: InlineTextMarks = resolveTypingMarks(
    fragmentMarksAtCaret,
    pendingOverride,
    pendingMarks,
  );
  const hasPendingMarks = hasAnyInlineMark(typingMarks);
  const canClearFormatting = hasSelection || (isTextBlock && hasPendingMarks);

  const restoreEditorSelection = (start = activeSelection.start, end = activeSelection.end) => {
    ignoreOverrideResetRef.current = true;
    requestAnimationFrame(() => {
      if (activeTextareaRef.current) {
        activeTextareaRef.current.focus();
        activeTextareaRef.current.setSelectionRange?.(start, end);
      }
      requestAnimationFrame(() => {
        ignoreOverrideResetRef.current = false;
      });
    });
  };

  const isMarkActive = (mark: keyof InlineTextMarks): boolean => {
    if (hasSelection) {
      return isBooleanMarkActiveInRange(
        activeBlock?.inlineContent,
        activeSelection.start,
        activeSelection.end,
        mark,
      );
    }
    return Boolean(typingMarks[mark]);
  };

  const toolbarColor = hasSelection
    ? getSharedValueMarkInRange(activeBlock?.inlineContent, activeSelection.start, activeSelection.end, 'color')
    : typingMarks.color || '';
  const toolbarHighlight = hasSelection
    ? getSharedValueMarkInRange(activeBlock?.inlineContent, activeSelection.start, activeSelection.end, 'highlight')
    : typingMarks.highlight || '';

  const getActiveLinkInfo = (): { href?: string; targetBlank?: boolean } => {
    if (hasSelection) {
      const href = getSharedValueMarkInRange(
        activeBlock?.inlineContent,
        activeSelection.start,
        activeSelection.end,
        'href',
      );
      if (!href) return {};
      let offset = 0;
      for (const f of activeBlock?.inlineContent || []) {
        const fStart = offset;
        const fEnd = offset + f.text.length;
        offset = fEnd;
        if (Math.max(activeSelection.start, fStart) < Math.min(activeSelection.end, fEnd) && f.marks?.href === href) {
          return { href: f.marks.href, targetBlank: f.marks.targetBlank !== false };
        }
      }
      return { href };
    }
    if (typingMarks.href) {
      return { href: typingMarks.href, targetBlank: typingMarks.targetBlank !== false };
    }
    return {};
  };

  const handleOpenLinkPopover = () => {
    if (!isTextBlock) return;
    const current = getActiveLinkInfo();
    setLinkUrl(current.href || '');
    setLinkTargetBlank(current.targetBlank !== undefined ? current.targetBlank : true);
    setLinkError(null);
    setShowLinkPopover((prev) => !prev);
  };

  const handleApplyLink = () => {
    if (!isTextBlock || !linkUrl.trim()) return;
    const validated = sanitizeHref(linkUrl);
    if (!validated) {
      setLinkError('Please enter a valid URL (e.g. https://example.com or /blogs/guide)');
      return;
    }
    const nextPending: InlineTextMarks = {
      ...withoutLinkMarks(typingMarks),
      href: validated,
      targetBlank: linkTargetBlank,
    };
    linkModeRef.current = true;
    setPendingOverride(true);
    setPendingMarks(nextPending);
    if (hasSelection) {
      formatActiveSelection('href', validated, { targetBlank: linkTargetBlank });
    } else {
      restoreEditorSelection();
    }
    setShowLinkPopover(false);
    setLinkError(null);
  };

  const handleRemoveLink = () => {
    if (!isTextBlock) return;
    const nextPending = withoutLinkMarks(typingMarks);
    linkModeRef.current = false;
    setPendingMarks(nextPending);
    setPendingOverride(hasAnyInlineMark(nextPending));
    if (hasSelection) {
      formatActiveSelection('href', '');
    } else {
      restoreEditorSelection();
    }
    setShowLinkPopover(false);
    setLinkError(null);
  };

  const toggleMark = (mark: 'bold' | 'italic' | 'underline' | 'strikethrough') => {
    if (!activeBlock || !isTextBlock) return;
    if (hasSelection) {
      formatActiveSelection(mark, !isMarkActive(mark));
    } else {
      setPendingOverride(true);
      setPendingMarks(() => {
        const next = { ...typingMarks };
        if (next[mark]) {
          delete next[mark];
        } else {
          next[mark] = true;
        }
        if (next.href) linkModeRef.current = true;
        return next;
      });
      restoreEditorSelection();
    }
  };

  const setMarkValue = (mark: 'color' | 'highlight', value: string) => {
    if (!activeBlock || !isTextBlock) return;
    if (hasSelection) {
      formatActiveSelection(mark, value);
    } else {
      setPendingOverride(true);
      setPendingMarks(() => ({
        ...typingMarks,
        [mark]: value,
      }));
      restoreEditorSelection();
    }
  };

  const handleClearFormatting = () => {
    if (!activeBlock || !isTextBlock) return;
    if (hasSelection) {
      clearActiveSelectionMarks();
    } else {
      setPendingOverride(true);
      setPendingMarks({});
      linkModeRef.current = false;
      setShowLinkPopover(false);
      restoreEditorSelection();
    }
  };

  const formatActiveSelection = (
    mark: keyof InlineTextMarks,
    value: boolean | string | undefined,
    extra?: Partial<InlineTextMarks>
  ) => {
    if (!activeBlock || !isTextBlock) return;
    const text = activeBlock.text || '';
    const { start, end } = activeSelection;
    if (start >= end) return;
    let newInline = applyInlineMark(text, activeBlock.inlineContent, start, end, mark, value);
    if (extra) {
      for (const [k, v] of Object.entries(extra)) {
        newInline = applyInlineMark(text, newInline, start, end, k as keyof InlineTextMarks, v as boolean | string | undefined);
      }
    }
    updateBlock(activeBlock.id, { ...activeBlock, inlineContent: newInline });
    restoreEditorSelection(start, end);
  };

  const clearActiveSelectionMarks = () => {
    if (!activeBlock || !isTextBlock) return;
    const text = activeBlock.text || '';
    const { start, end } = activeSelection;
    if (start >= end) return;
    const inline = clearInlineMarks(text, activeBlock.inlineContent, start, end);
    updateBlock(activeBlock.id, { ...activeBlock, inlineContent: inline });
    setPendingOverride(true);
    setPendingMarks({});
    linkModeRef.current = false;
    setShowLinkPopover(false);
    restoreEditorSelection(start, end);
  };

  const handleAddSection = (type: BlockType) => {
    const newBlock = defaultBlock(type);
    if (activeBlockId && activeBlockIndex >= 0) {
      const next = [...post.blocks];
      next.splice(activeBlockIndex + 1, 0, newBlock);
      onChange({ ...post, blocks: next });
    } else {
      onChange({ ...post, blocks: [...post.blocks, newBlock] });
    }
    setActiveBlockId(newBlock.id);
    setShowBlockLibrary(false);
    pendingScrollBlockIdRef.current = newBlock.id;
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
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel} disabled={saving}>← Back</button>
          <button type="button" className="btn btn-sm" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : '💾 Save as Draft'}</button>
          <button type="button" className="btn btn-sm btn-primary" onClick={onPreview} disabled={saving}>👁 Preview</button>
          <button type="button" className="btn btn-sm" style={{ background: '#2f855a', color: '#fff' }} onClick={onPublish} disabled={saving}>{saving ? 'Publishing…' : '🚀 Publish'}</button>
          <button type="button" className="btn btn-sm" style={{ background: '#ff5c5c', color: '#fff' }} onClick={onDelete} disabled={saving}>🗑 Delete</button>
        </div>
      </div>

      {/* ── Relocated Top Sticky Editor Area: + Add Section & Formatting Toolbar ── */}
      <div
        className="sticky-editor-toolbar"
        style={{
          position: 'sticky',
          top: 8,
          zIndex: 40,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(12px)',
          borderRadius: 12,
          border: '1px solid #dcdfe4',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          padding: '10px 14px',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
          {/* Left: Add section trigger & Active context indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => setShowBlockLibrary((prev) => !prev)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                padding: '6px 12px',
              }}
            >
              <span>+ Add Section</span>
              <span style={{ fontSize: 10, opacity: 0.85 }}>{showBlockLibrary ? '▲' : '▼'}</span>
            </button>

            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                setScaffoldDuration('3-day');
                setConfirmReplaceMode(false);
                setShowScaffoldModal(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600,
                fontSize: 12,
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #dcdfe4',
                background: '#fafafa',
                color: '#374151',
                whiteSpace: 'nowrap',
              }}
              title="Insert a 3-day, 5-day, or 7-day travel itinerary blueprint"
            >
              <span>🗓️ Itinerary</span>
            </button>

            <div style={{ width: 1, height: 22, background: '#e0e0e0' }} />

            {/* Active block context pill */}
            {activeBlock ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#f5f3ff',
                  color: '#6d28d9',
                  border: '1px solid #ddd6fe',
                  padding: '3px 10px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed' }} />
                <span>#{activeBlockIndex + 1} {BLOCK_TYPE_LABELS[activeBlock.type] || activeBlock.type}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveBlockId(null);
                  }}
                  title="Deselect active section"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#8b5cf6',
                    cursor: 'pointer',
                    padding: '0 2px',
                    fontSize: 11,
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <span style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>
                No section focused (click into a block to target formatting)
              </span>
            )}
          </div>

          {/* Right: Text Formatting Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <button
                type="button"
                className="btn btn-sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleMark('bold')}
                disabled={!isTextBlock}
                title={
                  hasSelection
                    ? 'Toggle bold on selected text'
                    : isTextBlock
                    ? 'Toggle bold for subsequently typed text'
                    : 'Select a text block to format'
                }
                style={{
                  fontWeight: 700,
                  minWidth: 32,
                  background: isMarkActive('bold') ? '#ede9fe' : undefined,
                  color: isMarkActive('bold') ? '#6d28d9' : undefined,
                  border: isMarkActive('bold') ? '1px solid #c4b5fd' : undefined,
                  opacity: isTextBlock ? 1 : 0.45,
                  cursor: isTextBlock ? 'pointer' : 'not-allowed',
                }}
              >
                <strong>B</strong>
              </button>

              <button
                type="button"
                className="btn btn-sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleMark('italic')}
                disabled={!isTextBlock}
                title={
                  hasSelection
                    ? 'Toggle italic on selected text'
                    : isTextBlock
                    ? 'Toggle italic for subsequently typed text'
                    : 'Select a text block to format'
                }
                style={{
                  fontStyle: 'italic',
                  minWidth: 32,
                  background: isMarkActive('italic') ? '#ede9fe' : undefined,
                  color: isMarkActive('italic') ? '#6d28d9' : undefined,
                  border: isMarkActive('italic') ? '1px solid #c4b5fd' : undefined,
                  opacity: isTextBlock ? 1 : 0.45,
                  cursor: isTextBlock ? 'pointer' : 'not-allowed',
                }}
              >
                <em>I</em>
              </button>

              <button
                type="button"
                className="btn btn-sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleMark('strikethrough')}
                disabled={!isTextBlock}
                title={
                  hasSelection
                    ? 'Toggle strikethrough on selected text'
                    : isTextBlock
                    ? 'Toggle strikethrough for subsequently typed text'
                    : 'Select a text block to format'
                }
                style={{
                  textDecoration: 'line-through',
                  minWidth: 32,
                  background: isMarkActive('strikethrough') ? '#ede9fe' : undefined,
                  color: isMarkActive('strikethrough') ? '#6d28d9' : undefined,
                  border: isMarkActive('strikethrough') ? '1px solid #c4b5fd' : undefined,
                  opacity: isTextBlock ? 1 : 0.45,
                  cursor: isTextBlock ? 'pointer' : 'not-allowed',
                }}
              >
                <s>S</s>
              </button>

              <button
                type="button"
                className="btn btn-sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => toggleMark('underline')}
                disabled={!isTextBlock}
                title={
                  hasSelection
                    ? 'Toggle underline on selected text'
                    : isTextBlock
                    ? 'Toggle underline for subsequently typed text'
                    : 'Select a text block to format'
                }
                aria-label="Underline"
                style={{
                  textDecoration: 'underline',
                  minWidth: 32,
                  background: isMarkActive('underline') ? '#ede9fe' : undefined,
                  color: isMarkActive('underline') ? '#6d28d9' : undefined,
                  border: isMarkActive('underline') ? '1px solid #c4b5fd' : undefined,
                  opacity: isTextBlock ? 1 : 0.45,
                  cursor: isTextBlock ? 'pointer' : 'not-allowed',
                }}
              >
                <span style={{ textDecoration: 'underline', fontWeight: 700 }}>U</span>
              </button>

              <button
                type="button"
                className="btn btn-sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleOpenLinkPopover}
                disabled={!isTextBlock}
                title={
                  hasSelection
                    ? 'Add or edit hyperlink on selected text'
                    : isMarkActive('href')
                    ? 'Link mode is on — click to change URL or turn off'
                    : isTextBlock
                    ? 'Turn on link mode and set a URL for subsequently typed text'
                    : 'Select a text block to add hyperlink'
                }
                style={{
                  minWidth: 32,
                  background: isMarkActive('href') || showLinkPopover ? '#ede9fe' : undefined,
                  color: isMarkActive('href') || showLinkPopover ? '#6d28d9' : undefined,
                  border: isMarkActive('href') || showLinkPopover ? '1px solid #c4b5fd' : undefined,
                  opacity: isTextBlock ? 1 : 0.45,
                  cursor: isTextBlock ? 'pointer' : 'not-allowed',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                }}
              >
                <span>🔗</span>
                <span>Link</span>
              </button>

              <label
                onMouseDown={(e) => e.preventDefault()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  opacity: isTextBlock ? 1 : 0.45,
                  cursor: isTextBlock ? 'pointer' : 'not-allowed',
                  marginLeft: 4,
                }}
              >
                <span>Color</span>
                <input
                  type="color"
                  aria-label="Text color"
                  value={toolbarColor || '#7c3aed'}
                  disabled={!isTextBlock}
                  onChange={(e) => setMarkValue('color', e.target.value)}
                  style={{
                    width: 24,
                    height: 24,
                    padding: 0,
                    border: 'none',
                    borderRadius: 4,
                    cursor: isTextBlock ? 'pointer' : 'not-allowed',
                  }}
                />
              </label>

              <label
                onMouseDown={(e) => e.preventDefault()}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  opacity: isTextBlock ? 1 : 0.45,
                  cursor: isTextBlock ? 'pointer' : 'not-allowed',
                  marginLeft: 4,
                }}
              >
                <span>Highlight</span>
                <input
                  type="color"
                  aria-label="Highlight color"
                  value={toolbarHighlight || '#fde68a'}
                  disabled={!isTextBlock}
                  onChange={(e) => setMarkValue('highlight', e.target.value)}
                  style={{
                    width: 24,
                    height: 24,
                    padding: 0,
                    border: 'none',
                    borderRadius: 4,
                    cursor: isTextBlock ? 'pointer' : 'not-allowed',
                  }}
                />
              </label>

              <button
                type="button"
                className="btn btn-sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleClearFormatting}
                disabled={!canClearFormatting}
                title={
                  hasSelection
                    ? 'Clear formatting on selected text'
                    : hasPendingMarks
                    ? 'Reset typing formatting to plain text'
                    : 'Clear formatting'
                }
                style={{
                  minWidth: 32,
                  opacity: canClearFormatting ? 1 : 0.45,
                  cursor: canClearFormatting ? 'pointer' : 'not-allowed',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                Tx
              </button>
            </div>

            {hasSelection ? (
              <span style={{ fontSize: 11, color: '#6d28d9', fontWeight: 600 }}>
                {activeSelection.end - activeSelection.start} chars selected
              </span>
            ) : hasPendingMarks ? (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                <span>✏️ Typing:</span>
                <span>
                  {[
                    typingMarks.bold && 'Bold',
                    typingMarks.italic && 'Italic',
                    typingMarks.underline && 'Underline',
                    typingMarks.strikethrough && 'Strikethrough',
                    typingMarks.href && 'Link',
                    typingMarks.color && 'Color',
                    typingMarks.highlight && 'Highlight',
                  ]
                    .filter(Boolean)
                    .join(' + ')}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPendingOverride(true);
                    setPendingMarks({});
                    linkModeRef.current = false;
                  }}
                  title="Reset typing to plain text"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#b45309',
                    cursor: 'pointer',
                    padding: '0 2px',
                    fontSize: 11,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  ✕
                </button>
              </div>
            ) : null}
          </div>
        </div>

        {/* Inline Link Popover when toggled */}
        {showLinkPopover && isTextBlock && (
          <div
            style={{
              marginTop: 10,
              padding: '10px 12px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="https://example.com or /blogs/guide"
                value={linkUrl}
                onChange={(e) => {
                  setLinkUrl(e.target.value);
                  if (linkError) setLinkError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleApplyLink();
                  } else if (e.key === 'Escape') {
                    setShowLinkPopover(false);
                  }
                }}
                autoFocus
                style={{
                  flex: '1 1 240px',
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: linkError ? '1px solid #ef4444' : '1px solid #94a3b8',
                  fontSize: 12,
                  outline: 'none',
                  background: '#ffffff',
                }}
              />
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#475569', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <input
                  type="checkbox"
                  checked={linkTargetBlank}
                  onChange={(e) => setLinkTargetBlank(e.target.checked)}
                />
                <span>Open in new tab</span>
              </label>
              <button
                type="button"
                className="btn btn-xs btn-primary"
                onClick={handleApplyLink}
                style={{ padding: '6px 12px', fontWeight: 600 }}
              >
                Apply
              </button>
              {isMarkActive('href') && (
                <button
                  type="button"
                  className="btn btn-xs btn-secondary"
                  onClick={handleRemoveLink}
                  style={{ padding: '6px 10px', color: '#b91c1c' }}
                >
                  Remove Link
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowLinkPopover(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '0 4px',
                  fontSize: 14,
                  lineHeight: 1,
                }}
                title="Cancel"
              >
                ✕
              </button>
            </div>
            {linkError && (
              <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 500 }}>
                ⚠️ {linkError}
              </div>
            )}
          </div>
        )}

        {/* Block library drawer when toggled */}
        {showBlockLibrary && (
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid #edf2f7',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
              gap: 6,
              maxHeight: 240,
              overflowY: 'auto',
            }}
          >
            {BLOCK_LIBRARY.map((b) => (
              <button
                key={b.type}
                type="button"
                className="btn btn-xs"
                onClick={() => handleAddSection(b.type)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  gap: 6,
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: '1px solid #e2e8f0',
                  background: '#fafafa',
                  fontSize: 11,
                  fontWeight: 500,
                  textAlign: 'left',
                }}
                title={b.desc}
              >
                <span style={{ color: '#7c3aed', fontWeight: 700 }}>+</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.label}</span>
              </button>
            ))}
          </div>
        )}
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
              <input style={inputStyle} value={post.tags.join(', ')} onChange={(e) => updatePost({ tags: normalizeTags(e.target.value.split(',')) })} placeholder="india, monsoon, solo" />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0f0f0' }}>
            <div>
              <label style={fieldLabel}>Story Style / Template</label>
              <select
                style={inputStyle}
                value={post.storyStyle || 'editorial-journal'}
                onChange={(e) => updatePost({ storyStyle: e.target.value as StoryStyle })}
              >
                {Object.entries(TEMPLATES_BY_FORMAT).map(([groupKey, templates]) => {
                  const groupInfo = FORMAT_GALLERY_INFO[groupKey as keyof typeof FORMAT_GALLERY_INFO];
                  return (
                    <optgroup key={groupKey} label={groupInfo?.title || groupKey}>
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {STORY_STYLE_LABELS[t.id] || t.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                })}
              </select>
            </div>
            <div>
              <label style={fieldLabel}>Background Theme</label>
              <select
                style={inputStyle}
                value={post.theme || 'classic-editorial'}
                onChange={(e) => updatePost({ theme: e.target.value as BackgroundTheme })}
              >
                <option value="classic-editorial">Classic Editorial (Warm Off-White)</option>
                <option value="nature-wildlife">Nature & Wildlife (Pale Sage)</option>
                <option value="ocean-islands">Ocean & Islands (Pale Aqua)</option>
                <option value="culture-heritage">Culture & Heritage (Warm Parchment)</option>
                <option value="adventure">Adventure (Muted Sand)</option>
              </select>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
          <div>
            <p style={{ ...sectionHeadStyle, margin: 0, paddingBottom: 0, border: 'none' }}>📝 Content Blocks</p>
            <span style={{ fontSize: 12, color: '#888' }}>
              {post.blocks.length} {post.blocks.length === 1 ? 'section' : 'sections'} in story
            </span>
          </div>
          <div>
            <button
              type="button"
              className="btn btn-sm"
              onClick={() => {
                setScaffoldDuration('3-day');
                setConfirmReplaceMode(false);
                setShowScaffoldModal(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontWeight: 600,
                fontSize: 12,
                padding: '6px 14px',
                borderRadius: 8,
                border: '1px solid #c4b5fd',
                background: '#f5f3ff',
                color: '#6d28d9',
              }}
              title="Insert a pre-structured 3-day, 5-day, or 7-day travel itinerary blueprint"
            >
              <span>🗓️ Itinerary Scaffold</span>
            </button>
          </div>
        </div>

        {/* Polished Blank / Empty State */}
        {post.blocks.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 24px',
              color: '#4b5563',
              border: '2px dashed #d1d5db',
              borderRadius: 14,
              background: '#fcfcfd',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>✍️</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', marginBottom: 6 }}>
              Your story is a blank canvas
            </div>
            <p style={{ margin: '0 auto 20px', maxWidth: 440, fontSize: 13, lineHeight: 1.6, color: '#6b7280' }}>
              Start shaping your travel narrative by adding your first heading, lead paragraph, full-bleed photograph, or curated highlight.
            </p>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() => setShowBlockLibrary(true)}
              style={{ padding: '8px 18px', fontWeight: 600, fontSize: 13 }}
            >
              + Add First Section
            </button>
            <div style={{ marginTop: 24, paddingTop: 18, borderTop: '1px solid #e5e7eb', maxWidth: 620, margin: '24px auto 0' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>
                ⚡ Or Quick Start With an Itinerary Scaffold
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => handleApplyScaffold('3-day', 'replace')}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '7px 14px', fontWeight: 600, fontSize: 12, color: '#1e293b' }}
                >
                  🗓️ 3-Day Express
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => handleApplyScaffold('5-day', 'replace')}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '7px 14px', fontWeight: 600, fontSize: 12, color: '#1e293b' }}
                >
                  🗓️ 5-Day Explorer
                </button>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => handleApplyScaffold('7-day', 'replace')}
                  style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: 8, padding: '7px 14px', fontWeight: 600, fontSize: 12, color: '#1e293b' }}
                >
                  🗓️ 7-Day Grand Tour
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Blocks List */}
        {post.blocks.map((block, index) => (
          <BlogBlockEditor
            key={block.id}
            block={block}
            index={index}
            isActive={block.id === activeBlockId}
            authoringProfile={authoringProfile}
            pendingMarks={block.id === activeBlockId ? typingMarks : undefined}
            onFormatKey={toggleMark}
            onChange={(next) => updateBlock(block.id, next)}
            onDelete={() => deleteBlock(block.id)}
            onMoveUp={() => moveBlock(block.id, -1)}
            onMoveDown={() => moveBlock(block.id, 1)}
            onDuplicate={() => duplicateBlock(block.id)}
            onFocusBlock={(id, textareaEl) => {
              setActiveBlockId(id);
              if (textareaEl) activeTextareaRef.current = textareaEl;
            }}
            onSelectionChange={(sel, textareaEl) => {
              setActiveSelection(sel);
              if (textareaEl) activeTextareaRef.current = textareaEl;
              setActiveBlockId(block.id);
              if (ignoreOverrideResetRef.current) {
                ignoreOverrideResetRef.current = false;
                return;
              }
              if (linkModeRef.current) {
                const caretVisual = withoutLinkMarks(
                  sel.end > sel.start
                    ? getMarksAtIndex(block.inlineContent, sel.start)
                    : getMarksAtCaret(block.inlineContent, sel.start),
                );
                setPendingOverride(true);
                setPendingMarks((prev) =>
                  prev.href
                    ? { ...caretVisual, href: prev.href, targetBlank: prev.targetBlank }
                    : caretVisual,
                );
              } else {
                setPendingOverride(false);
                setPendingMarks({});
              }
            }}
          />
        ))}
      </div>

      {/* ── Itinerary Scaffold Selection & Confirmation Modal ── */}
      {showScaffoldModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="scaffold-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowScaffoldModal(false);
              setConfirmReplaceMode(false);
            }
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 16,
              width: '100%',
              maxWidth: 720,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '1px solid #f1f5f9',
              }}
            >
              <div>
                <h3 id="scaffold-modal-title" style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>🗓️</span> Travel Itinerary Scaffolds
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
                  Select an expertly structured travel blueprint for your blog post.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowScaffoldModal(false);
                  setConfirmReplaceMode(false);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: 20,
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: 4,
                  lineHeight: 1,
                }}
                title="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Scaffold Options Selector */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#475569', marginBottom: 10 }}>
                  Choose Itinerary Blueprint
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  {(['3-day', '5-day', '7-day'] as ItineraryScaffoldDuration[]).map((dur) => {
                    const item = ITINERARY_SCAFFOLDS[dur];
                    const isSelected = scaffoldDuration === dur;
                    return (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => {
                          setScaffoldDuration(dur);
                          setConfirmReplaceMode(false);
                        }}
                        style={{
                          textAlign: 'left',
                          padding: 14,
                          borderRadius: 12,
                          border: isSelected ? '2px solid #7c3aed' : '1px solid #e2e8f0',
                          background: isSelected ? '#f5f3ff' : '#fafafa',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 6,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: isSelected ? '#6d28d9' : '#64748b', background: isSelected ? '#ede9fe' : '#e2e8f0', padding: '2px 8px', borderRadius: 999 }}>
                            {item.duration}
                          </span>
                          {isSelected && <span style={{ color: '#7c3aed', fontWeight: 800 }}>✓</span>}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? '#4c1d95' : '#1e293b' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', lineHeight: 1.4 }}>
                          {item.badge}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Scaffold Details */}
              {(() => {
                const currentScaffold = ITINERARY_SCAFFOLDS[scaffoldDuration];
                return (
                  <div style={{ background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>
                      {currentScaffold.name} Blueprint Overview
                    </div>
                    <p style={{ margin: '0 0 10px', fontSize: 12, color: '#475569', lineHeight: 1.6 }}>
                      {currentScaffold.description}
                    </p>
                    <div style={{ fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600, color: '#334155' }}>Best for:</span>
                      <span>{currentScaffold.idealFor}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Duplicate Scaffold Detection Notice */}
              {hasExistingItineraryScaffold(post.blocks) && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 16 }}>⚠️</span>
                  <div style={{ fontSize: 12, color: '#92400e', lineHeight: 1.5 }}>
                    <strong>Existing Itinerary Detected:</strong> This story already contains day headings or stage itineraries. Appending will insert additional day sections without overwriting existing content.
                  </div>
                </div>
              )}

              {/* Overwrite Confirmation Warning Box (if triggered) */}
              {confirmReplaceMode && (
                <div style={{ background: '#fef2f2', border: '2px solid #ef4444', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#b91c1c', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>🚨</span> Confirm Destructive Replacement
                  </div>
                  <p style={{ margin: '0 0 14px', fontSize: 12, color: '#7f1d1d', lineHeight: 1.6 }}>
                    Are you sure you want to replace all <strong>{post.blocks.length} existing sections</strong> with the {ITINERARY_SCAFFOLDS[scaffoldDuration].name}? Existing content in Content Blocks will be replaced.
                  </p>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      type="button"
                      onClick={() => handleApplyScaffold(scaffoldDuration, 'replace')}
                      style={{
                        background: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 8,
                        padding: '8px 16px',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Yes, Replace All Sections
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReplaceMode(false)}
                      style={{
                        background: '#fff',
                        color: '#374151',
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        padding: '8px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Cancel Overwrite
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            {!confirmReplaceMode && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px 24px',
                  background: '#f8fafc',
                  borderTop: '1px solid #f1f5f9',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowScaffoldModal(false)}
                  style={{
                    background: 'transparent',
                    border: '1px solid #d1d5db',
                    color: '#475569',
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  {post.blocks.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setConfirmReplaceMode(true)}
                      style={{
                        background: '#fff',
                        border: '1px solid #fca5a5',
                        color: '#dc2626',
                        borderRadius: 8,
                        padding: '8px 14px',
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      title="Replace current story content with this scaffold"
                    >
                      🔄 Replace Entire Story...
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleApplyScaffold(scaffoldDuration, post.blocks.length === 0 ? 'replace' : 'append')}
                    style={{
                      background: '#7c3aed',
                      border: 'none',
                      color: '#fff',
                      borderRadius: 8,
                      padding: '8px 18px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      boxShadow: '0 2px 8px rgba(124, 58, 237, 0.25)',
                    }}
                  >
                    <span>{post.blocks.length === 0 ? '⚡ Insert Scaffold' : '➕ Append Scaffold to Story'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Blog List Item ───────────────────────────────────────────────────────────
const BlogListItem: React.FC<{ post: Post; onOpen: (post: Post, mode: ViewMode) => void }> = ({ post, onOpen }) => {
  const categories = displayLabels(post.categories);
  const tags = displayLabels(post.tags);

  return (
    <div className="blog-list-item" style={{ background: '#fff', borderRadius: 16, border: '1px solid #e8e8e8', overflow: 'hidden' }}>
      {post.cover?.src && (
        <div style={{ height: 200, overflow: 'hidden' }}>
          <img src={post.cover.src} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}
      <div style={{ padding: 20 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10, color: '#777', fontSize: 13 }}>
          {categories.length > 0
            ? categories.map((category) => <span key={category}>{category}</span>)
            : <span>Uncategorized</span>}
          <span>{new Date(post.publishDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>{post.readingTime} min read</span>
          <span style={{ background: post.status === 'published' ? '#d4edda' : '#fff3cd', color: post.status === 'published' ? '#155724' : '#856404', borderRadius: 999, padding: '2px 8px', fontSize: 11 }}>{post.status}</span>
        </div>
        <h3 style={{ margin: '0 0 10px' }}>{post.title}</h3>
        <p style={{ margin: 0, color: '#555' }}>{post.excerpt}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundImage: post.author.avatar ? `url(${post.author.avatar})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center', backgroundColor: '#ccc', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 12 }}>
            {!post.author.avatar && post.author.initials}
          </div>
          <span style={{ fontSize: 14 }}>{post.author.name}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {tags.slice(0, 3).map((tag) => (
            <span key={tag} style={{ background: '#f1f1f1', borderRadius: 999, padding: '4px 10px', fontSize: 12 }}>#{tag}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button type="button" className="btn btn-xs" onClick={(e) => { e.stopPropagation(); onOpen(post, 'preview'); }} style={{ cursor: 'pointer' }}>Read</button>
          <button type="button" className="btn btn-xs btn-primary" onClick={(e) => { e.stopPropagation(); onOpen(post, 'editor'); }} style={{ cursor: 'pointer' }}>Edit</button>
        </div>
      </div>
    </div>
  );
};

// ─── Blog List View ───────────────────────────────────────────────────────────
const BlogListView: React.FC<{ posts: Post[]; onOpen: (post: Post, mode: ViewMode) => void; onCreate: () => void; loading?: boolean; error?: string | null }> = ({ posts, onOpen, onCreate, loading, error }) => {
  const [selectedCategory, setSelectedCategory] = useState('');

  const categoryOptions = Array.from(
    posts
      .flatMap((post) => displayLabels(post.categories))
      .reduce((options, category) => {
        const key = category.toLowerCase();
        if (!options.has(key)) options.set(key, category);
        return options;
      }, new Map<string, string>())
      .entries(),
  ).sort(([, first], [, second]) => first.localeCompare(second));

  const filteredPosts = posts.filter((post) => {
    return !selectedCategory || displayLabels(post.categories).some(
      (category) => category.toLowerCase() === selectedCategory.toLowerCase(),
    );
  });
  const hasFilters = Boolean(selectedCategory);

  const clearFilters = () => {
    setSelectedCategory('');
  };

  return (
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
      {!loading && posts.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap', marginBottom: 24, padding: '16px 20px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12 }}>
          <label style={{ display: 'grid', gap: 6, minWidth: 220, fontSize: 12, fontWeight: 600, color: '#444' }}>
            Category
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #ddd', background: '#fafafa', fontSize: 14 }}
            >
              <option value="">All categories</option>
              {Array.from(new Set([...BLOG_CATEGORY_OPTIONS.slice(1), ...categoryOptions.map(([, category]) => category)])).map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          {hasFilters && <button type="button" className="btn btn-sm" onClick={clearFilters} style={{ height: 38, alignSelf: 'flex-end' }}>Clear filter</button>}
        </div>
      )}
      {loading && <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>Loading blogs…</div>}
      {!loading && posts.length === 0 && !error && (
        <div style={{ padding: 48, textAlign: 'center', color: '#888', border: '2px dashed #e0e0e0', borderRadius: 16 }}>
          <p style={{ fontSize: 18, margin: '0 0 16px' }}>No posts yet</p>
          <button type="button" className="btn btn-primary" onClick={onCreate}>Create your first post</button>
        </div>
      )}
      {!loading && posts.length > 0 && filteredPosts.length === 0 && (
        <div style={{ padding: 48, textAlign: 'center', color: '#888', border: '2px dashed #e0e0e0', borderRadius: 16 }}>
          <p style={{ fontSize: 18, margin: '0 0 16px' }}>No posts match these filters.</p>
          <button type="button" className="btn btn-sm" onClick={clearFilters}>Clear filters</button>
        </div>
      )}
      <div style={{ display: 'grid', gap: 24 }}>
        {filteredPosts.map((post) => (
          <BlogListItem key={post.id || post.slug} post={post} onOpen={onOpen} />
        ))}
      </div>
    </div>
  );
};

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
  const [savedPostSnapshot, setSavedPostSnapshot] = useState('');

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
    setSavedPostSnapshot(JSON.stringify(post));
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
    const initialStoryStyle: StoryStyle =
      (template.id as StoryStyle) ||
      (template.profile?.imageStrategy === 'gallery-heavy' || template.profile?.imageStrategy === 'image-led'
        ? 'visual-journey'
        : template.id.includes('route')
        ? 'route-explorer'
        : template.id.includes('explorer')
        ? 'day-by-day'
        : template.id.includes('essential') || template.id.includes('guide')
        ? 'smart-travel'
        : 'editorial-journal');

    const draftPost: Post = {
      ...basePost,
      id: `local-${makeId()}`,
      storyStyle: initialStoryStyle,
      theme: 'classic-editorial',
      blocks: templateBlocks,
    };

    setActivePost(draftPost);
    setSavedPostSnapshot('');
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
    const formatStyleMap: Record<BlogFormat, StoryStyle> = {
      'editorial-destination': 'editorial-journal',
      'photography-narrative': 'cinematic-destination',
      'practical-planning': 'budget-breakdown',
      'discovery-experience': 'food-flavours',
      'decision-interactive': 'destination-comparison',
      'blank': 'editorial-journal',
    };

    const draftPost: Post = {
      ...basePost,
      id: `local-${makeId()}`,
      storyStyle: formatStyleMap[format.type] || 'editorial-journal',
      theme: 'classic-editorial',
      blocks: format.blocks.map((type) => defaultBlock(type)),
    };

    setActivePost(draftPost);
    setSavedPostSnapshot('');
    setIsCreatingPost(true);
    setViewMode('editor');
  };

  const handlePostChange = (next: Post) => {
    setActivePost(next);
    setPostsState((prev) => prev.map((p) => (p.id === next.id ? next : p)));
  };

  const savePost = async (post?: Post): Promise<Post | null> => {
    const target = post ?? activePost;
    if (!target) return null;

    setSaving(true);
    try {
      const normalizedTarget = { ...target, tags: normalizeTags(target.tags) };
      const createPayload = { ...normalizedTarget };
      delete createPayload.id;

      const response = isCreatingPost
        ? await createBlog(createPayload)
        : normalizedTarget.id
          ? await updateBlog(normalizedTarget.id, normalizedTarget)
          : null;

      if (!response) {
        setError('This post is missing a valid ID and cannot be updated.');
        return null;
      }

      if (response.success) {
        const normalized = normalizePost(response.data);
        setPostsState((prev) => prev.map((p) => (p.id === normalized.id ? normalized : p)));
        if (isCreatingPost) {
          setPostsState((prev) => [normalized, ...prev.filter((p) => p.id !== normalized.id)]);
          setIsCreatingPost(false);
        }
        setActivePost(normalized);
        setSavedPostSnapshot(JSON.stringify(normalized));
        return normalized;
      }
    } catch (err) {
      console.error('Failed to save blog:', err);
      setError(mapErrorMessage(err));
    } finally {
      setSaving(false);
    }
    return null;
  };

  const deletePost = async (id: string) => {
    if (!window.confirm('Delete this blog post? This cannot be undone.')) return;
    setSaving(true);
    try {
      const response = await deleteBlog(id);
      if (!response.success) {
        throw new Error('The server did not confirm deletion.');
      }
      setPostsState((prev) => prev.filter((p) => p.id !== id));
      setActivePost(null);
      setSavedPostSnapshot('');
      setViewMode('list');
      alert('Blog post deleted.');
    } catch (err) {
      const message = mapErrorMessage(err);
      setError(message);
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  const hasUnsavedChanges = !!activePost && (
    isCreatingPost || JSON.stringify(activePost) !== savedPostSnapshot
  );

  const handleSaveDraft = async () => {
    if (!activePost || saving) return;
    setError(null);
    const saved = await savePost({ ...activePost, status: 'draft' });
    if (saved) {
      alert('Blog saved as draft.');
      setReturnToTemplateLibrary(false);
      setViewMode('list');
    } else {
      alert(error || 'Unable to save the draft. Check the form and try again.');
    }
  };

  const handlePublish = async () => {
    if (!activePost || saving) return;
    setError(null);
    const validationErrors = validatePublishPost(activePost);
    if (validationErrors.length > 0) {
      const message = validationErrors.join('\n');
      setError(message);
      alert(message);
      return;
    }

    const saved = await savePost({ ...activePost, status: 'draft' });
    if (!saved?.id) {
      alert(error || 'The latest edits could not be saved, so the post was not published.');
      return;
    }

    setSaving(true);
    try {
      const response = await publishBlog(saved.id);
      if (!response.success) {
        throw new Error('The server did not confirm publication.');
      }
      const published = normalizePost(response.data);
      setActivePost(published);
      setPostsState((prev) => prev.map((post) => (post.id === published.id ? published : post)));
      setSavedPostSnapshot(JSON.stringify(published));
      alert('Blog published successfully.');
      setViewMode('list');
    } catch (err) {
      const message = mapErrorMessage(err);
      setError(message);
      alert(`Publish failed: ${message} Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges && !window.confirm('You have unsaved changes. Leave without saving?')) return;
    setActivePost(null);
    setSavedPostSnapshot('');
    setViewMode('list');
    if (returnToTemplateLibrary) setShowFormatLibrary(true);
  };

  const handleDelete = () => {
    if (!activePost) return;
    if (isCreatingPost || !activePost.id || activePost.id.startsWith('local-')) {
      if (!window.confirm('Discard this new blog post? This cannot be undone.')) return;
      setActivePost(null);
      setSavedPostSnapshot('');
      setIsCreatingPost(false);
      setViewMode('list');
      if (returnToTemplateLibrary) setShowFormatLibrary(true);
      return;
    }
    void deletePost(activePost.id);
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
          await handleSaveDraft();
        }}
        onPreview={() => setViewMode('preview')}
        onPublish={() => { void handlePublish(); }}
        onCancel={handleBack}
        onDelete={handleDelete}
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
          zIndex: 1000, display: 'flex', alignItems: 'center', gap: 10,
          background: 'rgba(20,20,20,0.88)', backdropFilter: 'blur(12px)',
          borderRadius: 999, padding: '6px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.15)',
          maxWidth: '92vw', flexWrap: 'wrap', justifyContent: 'center'
        }}>
          <span style={{ color: '#fff', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', paddingLeft: 4 }}>
            👁 Preview
          </span>

          {/* Quick Style Switcher in Preview */}
          <select
            value={activePost.storyStyle || 'editorial-journal'}
            onChange={(e) => handlePostChange({ ...activePost, storyStyle: e.target.value as StoryStyle })}
            style={{
              background: 'rgba(255,255,255,0.14)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600, outline: 'none'
            }}
          >
            {Object.entries(TEMPLATES_BY_FORMAT).map(([groupKey, templates]) => {
              const groupInfo = FORMAT_GALLERY_INFO[groupKey as keyof typeof FORMAT_GALLERY_INFO];
              return (
                <optgroup key={groupKey} label={groupInfo?.title || groupKey} style={{ color: '#000', background: '#fff' }}>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id} style={{ color: '#000', background: '#fff' }}>
                      {STORY_STYLE_LABELS[t.id] || t.name}
                    </option>
                  ))}
                </optgroup>
              );
            })}
          </select>

          {/* Quick Theme Switcher in Preview */}
          <select
            value={activePost.theme || 'classic-editorial'}
            onChange={(e) => setActivePost({ ...activePost, theme: e.target.value as BackgroundTheme })}
            style={{
              background: 'rgba(255,255,255,0.14)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 600, outline: 'none'
            }}
          >
            <option value="classic-editorial" style={{ color: '#000' }}>Classic Editorial (Warm Off-White)</option>
            <option value="nature-wildlife" style={{ color: '#000' }}>Nature & Wildlife (Pale Sage)</option>
            <option value="ocean-islands" style={{ color: '#000' }}>Ocean & Islands (Pale Aqua)</option>
            <option value="culture-heritage" style={{ color: '#000' }}>Culture & Heritage (Warm Parchment)</option>
            <option value="adventure" style={{ color: '#000' }}>Adventure (Muted Sand)</option>
          </select>

          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => setViewMode('editor')}
            style={{ borderRadius: 999, padding: '6px 14px', fontSize: 12 }}
          >
            ✏️ Back to editor
          </button>
        </div>
        <BlogPostView
          post={activePost}
          storyStyle={activePost.storyStyle}
          theme={activePost.theme}
          layout={layout}
          displayFont={displayFont}
        />
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