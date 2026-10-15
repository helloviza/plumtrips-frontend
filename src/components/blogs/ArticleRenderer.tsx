import React from 'react';
import type {
  PostBlock,
  PostBlockSettings,
  StoryStyle,
  TypographyRules,
  LayoutRules,
  BlogTextSize,
  BlogLineHeight,
  BlogLetterSpacing,
  BlogContentWidth,
  BlogImageAlignment,
  BlogSpacing,
} from '../../pages/marketing/blogs.model';
import { InlineText } from '../../pages/marketing/InlineText';
import { getTemplateDefaultsForStoryStyle } from '../../pages/marketing/blog-templates.data';

const FONT_FAMILIES: Record<string, string> = {
  'template-default': 'Inter, ui-sans-serif, system-ui, sans-serif',
  'plumtrips-editorial': 'var(--font-display, "Playfair Display", Georgia, serif)',
  georgia: 'Georgia, serif',
  arial: 'Arial, sans-serif',
  'times-new-roman': '"Times New Roman", serif',
  tahoma: 'Tahoma, sans-serif',
};

const H1_SIZES: Record<BlogTextSize, string> = {
  small: 'clamp(22px, 2.6vw, 28px)',
  normal: 'clamp(26px, 3.2vw, 36px)',
  large: 'clamp(30px, 3.6vw, 42px)',
  xl: 'clamp(36px, 4.2vw, 48px)',
};

const H2_SIZES: Record<BlogTextSize, string> = {
  small: 'clamp(18px, 2.2vw, 22px)',
  normal: 'clamp(22px, 2.6vw, 28px)',
  large: 'clamp(26px, 3.0vw, 32px)',
  xl: 'clamp(30px, 3.4vw, 36px)',
};

const H3_SIZES: Record<BlogTextSize, string> = {
  small: 'clamp(15px, 1.8vw, 17px)',
  normal: 'clamp(18px, 2.2vw, 22px)',
  large: 'clamp(20px, 2.4vw, 24px)',
  xl: 'clamp(24px, 2.8vw, 28px)',
};

const BODY_SIZES: Record<BlogTextSize, number> = {
  small: 14,
  normal: 17,
  large: 19,
  xl: 22,
};

const HEADING_LINE_HEIGHTS: Record<BlogLineHeight, number> = {
  tight: 1.15,
  normal: 1.25,
  relaxed: 1.38,
};

const BODY_LINE_HEIGHTS: Record<BlogLineHeight, number> = {
  tight: 1.5,
  normal: 1.65,
  relaxed: 1.8,
};

const LETTER_SPACING: Record<BlogLetterSpacing, string> = {
  tight: '-0.02em',
  normal: 'normal',
  wide: '0.04em',
};

const COLOR_TOKENS: Record<string, string> = {
  default: 'var(--blog-ink, #222)',
  heading: 'var(--blog-ink, #111827)',
  accent: 'var(--blog-accent, #c8943a)',
  muted: 'var(--blog-ink-muted, #777)',
  custom: 'var(--blog-accent, #c8943a)',
};

const SAFE_HEX_COLOR_REGEX = /^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const SAFE_RGB_COLOR_REGEX = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*(?:0|1|0?\.\d+)\s*)?\)$/;

const resolveColor = (tokenOrValue?: string, fallback = 'var(--blog-ink, #222)'): string => {
  if (!tokenOrValue) return fallback;
  if (COLOR_TOKENS[tokenOrValue]) return COLOR_TOKENS[tokenOrValue];
  if (SAFE_HEX_COLOR_REGEX.test(tokenOrValue) || SAFE_RGB_COLOR_REGEX.test(tokenOrValue)) {
    return tokenOrValue;
  }
  return fallback;
};

type RenderContentWidth = BlogContentWidth | NonNullable<PostBlockSettings['width']>;

const WIDTHS: Record<RenderContentWidth, number | string> = {
  narrow: 640,
  small: 640,
  standard: 820,
  medium: 820,
  large: 1040,
  wide: '100%',
  full: '100%',
};

const SECTION_SPACING: Record<BlogSpacing, number> = {
  compact: 16,
  standard: 32,
  relaxed: 48,
};

const IMAGE_SPACING: Record<BlogSpacing, number> = {
  compact: 12,
  standard: 24,
  relaxed: 40,
};

const GALLERY_GAPS: Record<BlogSpacing, number> = {
  compact: 8,
  standard: 16,
  relaxed: 24,
};

const HIGHLIGHT_MAP: Record<string, string> = {
  tip: 'rgba(200, 148, 58, 0.08)',
  important: 'rgba(59, 130, 246, 0.08)',
  warning: 'rgba(239, 68, 68, 0.08)',
  'quick-fact': 'rgba(16, 185, 129, 0.08)',
  'editor-note': 'rgba(139, 92, 246, 0.08)',
  custom: 'rgba(200, 148, 58, 0.08)',
};

const ratioValue = (ratio: PostBlockSettings['imageRatio']): string | undefined =>
  ratio && ratio !== 'original' ? ratio.replace(':', ' / ') : undefined;

export interface BlockStyleContext {
  templateTypography: TypographyRules;
  templateLayout: LayoutRules;
}

const blockStyle = (block: PostBlock, ctx: BlockStyleContext): React.CSSProperties => {
  const settings = block.settings;
  const typography = settings?.typography;
  const layout = settings?.layout;
  const { templateTypography, templateLayout } = ctx;

  const style: React.CSSProperties = {};
  const isHeading = block.type === 'h1' || block.type === 'h2' || block.type === 'h3';
  const isMedia = block.type === 'image' || block.type === 'cover' || block.type === 'gallery';
  const isBody = block.type === 'p' || block.type === 'quote';

  // 1. Font Family
  if (typography?.fontFamily && typography.fontFamily !== 'template-default' && FONT_FAMILIES[typography.fontFamily]) {
    style.fontFamily = FONT_FAMILIES[typography.fontFamily];
  } else if (isHeading) {
    const familyKey = templateTypography.headingFontFamily;
    style.fontFamily = (familyKey && FONT_FAMILIES[familyKey]) || FONT_FAMILIES['plumtrips-editorial'];
  } else if (isBody) {
    const familyKey = templateTypography.bodyFontFamily;
    style.fontFamily = (familyKey && FONT_FAMILIES[familyKey]) || FONT_FAMILIES['georgia'];
  }

  // 2. Font Size
  if (typography?.size && (typography.size as string) !== 'template-default') {
    if (block.type === 'h1') style.fontSize = H1_SIZES[typography.size] || H1_SIZES.normal;
    else if (block.type === 'h2') style.fontSize = H2_SIZES[typography.size] || H2_SIZES.normal;
    else if (block.type === 'h3') style.fontSize = H3_SIZES[typography.size] || H3_SIZES.normal;
    else style.fontSize = BODY_SIZES[typography.size] || BODY_SIZES.normal;
  } else if (block.type === 'h1') {
    style.fontSize = H1_SIZES[templateTypography.h1Size || 'xl'] || H1_SIZES.xl;
  } else if (block.type === 'h2') {
    style.fontSize = H2_SIZES[templateTypography.h2Size || 'large'] || H2_SIZES.large;
  } else if (block.type === 'h3') {
    style.fontSize = H3_SIZES[templateTypography.h3Size || 'normal'] || H3_SIZES.normal;
  } else if (isBody) {
    style.fontSize = BODY_SIZES[templateTypography.bodyTextSize || 'normal'] || BODY_SIZES.normal;
  }

  // 3. Font Weight & Italic
  if (typography?.bold !== undefined) {
    style.fontWeight = typography.bold ? 700 : 400;
  } else if (isHeading) {
    style.fontWeight = templateTypography.headingWeight || 600;
  } else if (isBody) {
    style.fontWeight = templateTypography.bodyWeight || 400;
  }

  if (typography?.italic !== undefined) {
    style.fontStyle = typography.italic ? 'italic' : 'normal';
  } else if (block.type === 'quote') {
    style.fontStyle = 'italic';
  }

  // 4. Line Height
  const lineHeightKey = typography?.lineHeight || templateTypography.lineHeight;
  if (lineHeightKey) {
    style.lineHeight = isHeading
      ? HEADING_LINE_HEIGHTS[lineHeightKey] || 1.25
      : BODY_LINE_HEIGHTS[lineHeightKey] || 1.8;
  }

  // 5. Letter Spacing
  const letterSpacingKey = typography?.letterSpacing || templateTypography.letterSpacing;
  if (letterSpacingKey && LETTER_SPACING[letterSpacingKey]) {
    style.letterSpacing = LETTER_SPACING[letterSpacingKey];
  }

  // 6. Color
  if (typography?.color && (typography.color as string) !== 'template-default') {
    style.color = resolveColor(typography.color);
  } else if (isHeading) {
    style.color = resolveColor(templateTypography.headingColor || 'heading', 'var(--blog-ink, #111827)');
  } else if (isBody) {
    style.color = resolveColor(templateTypography.bodyColor || 'default', 'var(--blog-ink, #222)');
  }

  // 7. Text Alignment
  const textAlignment =
    typography?.alignment ||
    layout?.textAlignment ||
    settings?.alignment ||
    templateLayout.textAlignment ||
    templateTypography.textAlignment;
  if (textAlignment && (textAlignment as string) !== 'template-default') {
    style.textAlign = textAlignment;
  }

  // 8. Layout: Width & Alignment
  if (isMedia) {
    const imgWidth = layout?.imageWidth || settings?.width || templateLayout.imageWidth;
    if (imgWidth && (imgWidth as string) !== 'template-default' && WIDTHS[imgWidth] !== undefined) {
      style.maxWidth = imgWidth === 'full' ? '100%' : WIDTHS[imgWidth];
      style.width = '100%';
    }
    const imgAlign = layout?.imageAlignment || (settings?.imagePosition as BlogImageAlignment | undefined) || templateLayout.imageAlignment;
    if (imgAlign === 'left') style.marginInline = '0 auto 0 0';
    else if (imgAlign === 'right') style.marginInline = '0 0 0 auto';
    else if (imgAlign === 'center') style.marginInline = 'auto';
    else if (imgAlign === 'full') {
      style.maxWidth = '100%';
      style.width = '100%';
      style.marginInline = '0 auto';
    }

    const imgSpacing = layout?.imageTextSpacing || templateLayout.imageTextSpacing || 'standard';
    const spacingY = IMAGE_SPACING[imgSpacing] || IMAGE_SPACING.standard;
    style.marginBlock = `${spacingY}px`;
  } else {
    const cWidth = layout?.contentWidth || settings?.width || templateLayout.contentWidth;
    if (cWidth && (cWidth as string) !== 'template-default' && WIDTHS[cWidth] !== undefined) {
      style.maxWidth = cWidth === 'full' ? '100%' : WIDTHS[cWidth];
      style.width = '100%';
      style.marginInline = 'auto';
    }

    const sSpacing = layout?.sectionSpacing || templateLayout.sectionSpacing;
    if (sSpacing && (sSpacing as string) !== 'template-default' && SECTION_SPACING[sSpacing] !== undefined) {
      style.marginBlock = `${SECTION_SPACING[sSpacing]}px`;
    }
  }

  // 9. Highlights
  if (settings?.highlight && settings.highlight !== 'none') {
    style.backgroundColor = `var(--article-highlight-${settings.highlight}, ${
      HIGHLIGHT_MAP[settings.highlight] || 'var(--blog-surface-elevated, #f9f6f1)'
    })`;
    style.borderRadius = 12;
    style.padding = '18px 24px';
  }

  return style;
};

const mediaStyle = (block: PostBlock): React.CSSProperties => ({
  width: '100%',
  height: block.settings?.imageFit === 'natural' ? 'auto' : '100%',
  objectFit: block.settings?.imageFit === 'contain' || block.settings?.imageFit === 'natural' ? 'contain' : 'cover',
  display: 'block',
});

interface ArticleBlockProps {
  block: PostBlock;
  storyStyle?: StoryStyle;
  isFirstParagraph?: boolean;
  ctx: BlockStyleContext;
}

const ArticleBlock: React.FC<ArticleBlockProps> = ({ block, storyStyle, isFirstParagraph, ctx }) => {
  const style = blockStyle(block, ctx);

  switch (block.type) {
    case 'h1': {
      const text = (block.text || '').trim();
      if (!text && (!block.inlineContent || block.inlineContent.length === 0)) return null;
      return (
        <h2
          id={`s-${block.id}`}
          style={{
            fontSize: 'clamp(26px, 3.2vw, 36px)',
            lineHeight: 1.25,
            margin: '40px 0 16px',
            fontFamily: 'var(--font-display, "Playfair Display", Georgia, serif)',
            color: 'var(--blog-ink, #1b1c1c)',
            ...style,
          }}
        >
          <InlineText text={block.text} fragments={block.inlineContent} />
        </h2>
      );
    }

    case 'h2': {
      const text = (block.text || '').trim();
      if (!text && (!block.inlineContent || block.inlineContent.length === 0)) return null;
      return (
        <h2
          id={`s-${block.id}`}
          style={{
            fontSize: 'clamp(22px, 2.6vw, 28px)',
            lineHeight: 1.3,
            margin: '32px 0 14px',
            fontFamily: 'var(--font-display, "Playfair Display", Georgia, serif)',
            color: 'var(--blog-ink, #1b1c1c)',
            ...style,
          }}
        >
          <InlineText text={block.text} fragments={block.inlineContent} />
        </h2>
      );
    }

    case 'h3': {
      const text = (block.text || '').trim();
      if (!text && (!block.inlineContent || block.inlineContent.length === 0)) return null;
      return (
        <h3
          id={`s-${block.id}`}
          style={{
            fontSize: 'clamp(18px, 2.2vw, 22px)',
            lineHeight: 1.35,
            margin: '24px 0 10px',
            fontFamily: 'var(--font-display, "Playfair Display", Georgia, serif)',
            color: 'var(--blog-ink, #1b1c1c)',
            ...style,
          }}
        >
          <InlineText text={block.text} fragments={block.inlineContent} />
        </h3>
      );
    }

    case 'p': {
      const text = (block.text || '').trim();
      if (!text && (!block.inlineContent || block.inlineContent.length === 0)) return null;
      return (
        <p
          className={isFirstParagraph && storyStyle === 'editorial-journal' ? 'editorial-lead-para' : undefined}
          style={{
            fontSize: 17,
            lineHeight: 1.8,
            color: 'var(--blog-ink, #222)',
            margin: '0 0 24px',
            ...style,
          }}
        >
          <InlineText text={block.text} fragments={block.inlineContent} />
        </p>
      );
    }

    case 'quote': {
      const text = (block.text || '').trim();
      if (!text && (!block.inlineContent || block.inlineContent.length === 0)) return null;
      return (
        <blockquote style={style}>
          <InlineText text={block.text} fragments={block.inlineContent} />
          {block.cite && <cite>— {block.cite}</cite>}
        </blockquote>
      );
    }

    case 'image':
    case 'cover': {
      if (!block.src) return null;
      return (
        <figure style={{ margin: '24px 0', ...style }}>
          <div
            style={{
              aspectRatio: ratioValue(block.settings?.imageRatio) || '16 / 9',
              width: '100%',
              overflow: 'hidden',
              borderRadius: 16,
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
            }}
          >
            <img
              src={block.src}
              alt={block.caption || ''}
              loading="lazy"
              decoding="async"
              style={mediaStyle(block)}
            />
          </div>
          {block.caption && (
            <figcaption
              style={{
                marginTop: 10,
                fontSize: 13,
                fontStyle: 'italic',
                color: 'var(--blog-ink-muted, #777)',
                textAlign: 'center',
              }}
            >
              {block.caption}
            </figcaption>
          )}
        </figure>
      );
    }

    case 'gallery': {
      const validImages = (block.images || []).filter(Boolean);
      if (validImages.length === 0) return null;

      // When there is only 1 valid image, render as a clean lead image instead of broken grid
      if (validImages.length === 1) {
        return (
          <figure style={{ margin: '24px 0', ...style }}>
            <div
              style={{
                aspectRatio: '16 / 9',
                width: '100%',
                overflow: 'hidden',
                borderRadius: 16,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
              }}
            >
              <img
                src={validImages[0]}
                alt=""
                loading="lazy"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {block.caption && (
              <figcaption style={{ marginTop: 10, fontSize: 13, color: 'var(--blog-ink-muted, #777)', textAlign: 'center' }}>
                {block.caption}
              </figcaption>
            )}
          </figure>
        );
      }

      // Visual Journey, Cinematic, or Photo Essay dual-spread layout for 2 images
      if ((storyStyle === 'visual-journey' || storyStyle === 'cinematic-destination' || storyStyle === 'photo-essay') && validImages.length === 2) {
        return (
          <div className="visual-spread-grid" style={style}>
            {validImages.map((src, i) => (
              <div key={i} className="visual-spread-item" style={{ aspectRatio: '4 / 3' }}>
                <img src={src} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>
        );
      }

      return (
        <div
          className={`blog-gallery-grid blog-gallery-${block.settings?.galleryComposition || 'equal'}`}
          style={{
            gap: GALLERY_GAPS[block.settings?.galleryGap || 'standard'] || 16,
            margin: '24px 0',
            ...style,
          }}
        >
          {validImages.map((src, i) => (
            <div
              key={i}
              className="blog-gallery-tile"
              style={{
                aspectRatio: ratioValue(block.settings?.imageRatio) || '1 / 1',
                overflow: 'hidden',
                borderRadius: 14,
                boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
              }}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                decoding="async"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: block.settings?.imageFit === 'contain' ? 'contain' : 'cover',
                  display: 'block',
                  transition: 'transform 0.3s ease',
                }}
              />
            </div>
          ))}
        </div>
      );
    }

    case 'numlist': {
      const items = (block.items || []).filter((it) => (it.title || '').trim() || (it.body || '').trim());
      if (items.length === 0) return null;

      // 02. Day-by-Day Explorer & 12. Ultimate Itinerary Planner: Chronological timeline track
      if (storyStyle === 'day-by-day' || storyStyle === 'itinerary-planner') {
        return (
          <div className="pub-timeline-track" style={style}>
            {items.map((item, i) => (
              <div className="pub-timeline-step" key={i} id={`n-${i + 1}`}>
                <div className="pub-timeline-node">
                  {String(item.n || i + 1).padStart(2, '0')}
                </div>
                <div className="pub-timeline-card">
                  <div className="pub-timeline-day-label">
                    {storyStyle === 'itinerary-planner' ? `Stage ${String(item.n || i + 1).padStart(2, '0')}` : `Day ${String(item.n || i + 1).padStart(2, '0')}`}
                    {item.loc ? ` · ${item.loc}` : ''}
                  </div>
                  <h3 style={{ fontSize: 21, fontWeight: 700, margin: '0 0 8px', color: 'var(--blog-ink, #1b1c1c)' }}>
                    {item.title}
                  </h3>
                  {item.img && (
                    <img
                      src={item.img}
                      alt={item.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        borderRadius: 12,
                        margin: '14px 0',
                        objectFit: 'cover',
                        maxHeight: 420,
                        boxShadow: '0 6px 18px rgba(0,0,0,0.05)',
                      }}
                    />
                  )}
                  <p style={{ margin: 0, lineHeight: 1.75, color: 'var(--blog-ink, #333)' }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        );
      }

      // 04. Route Explorer & 14. Transport and Getting There: Waypoints stops sequence
      if (storyStyle === 'route-explorer' || storyStyle === 'transport-guide') {
        return (
          <div className="pub-route-stops" style={{ display: 'grid', gap: 28, margin: '36px 0', ...style }}>
            {items.map((item, i) => (
              <div className="pub-route-stop-card" key={i} id={`n-${i + 1}`}>
                <div className="pub-route-stop-header">
                  <div className="pub-route-stop-pin">
                    <span>{storyStyle === 'transport-guide' ? '✈ / 🚆' : '📍'}</span>
                    {storyStyle === 'transport-guide' ? `LEG ${String(item.n || i + 1).padStart(2, '0')}` : `STOP ${String(item.n || i + 1).padStart(2, '0')}`}
                  </div>
                  {item.loc && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--blog-ink-muted, #777)' }}>
                      {item.loc}
                    </span>
                  )}
                </div>
                <div style={{ padding: 24 }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 10px', color: 'var(--blog-ink, #1b1c1c)' }}>
                    {item.title}
                  </h3>
                  {item.img && (
                    <img
                      src={item.img}
                      alt={item.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        borderRadius: 12,
                        margin: '12px 0 16px',
                        objectFit: 'cover',
                        maxHeight: 400,
                      }}
                    />
                  )}
                  <p style={{ margin: 0, lineHeight: 1.75, color: 'var(--blog-ink, #333)' }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        );
      }

      // 08. Travel Diary: Journal entries
      if (storyStyle === 'travel-diary') {
        return (
          <div style={{ display: 'grid', gap: 28, margin: '36px 0', ...style }}>
            {items.map((item, i) => (
              <div className="diary-entry-card" key={i} id={`n-${i + 1}`}>
                <div className="diary-dateline">
                  <span>🖋 ENTRY {String(item.n || i + 1).padStart(2, '0')}</span>
                  {item.loc && <span>— {item.loc}</span>}
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 12px', color: 'var(--blog-ink, #1b1c1c)' }}>
                  {item.title}
                </h3>
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title}
                    loading="lazy"
                    style={{ width: '100%', borderRadius: 12, margin: '14px 0', objectFit: 'cover', maxHeight: 400 }}
                  />
                )}
                <p style={{ margin: 0, lineHeight: 1.75, color: 'var(--blog-ink, #333)' }}>{item.body}</p>
              </div>
            ))}
          </div>
        );
      }

      // 11. Budget Breakdown: Categorized expense cards
      if (storyStyle === 'budget-breakdown') {
        return (
          <div style={{ display: 'grid', gap: 24, margin: '36px 0', ...style }}>
            {items.map((item, i) => (
              <div key={i} id={`n-${i + 1}`} style={{
                background: 'var(--blog-surface-elevated, #faf8f5)',
                border: '1px solid var(--blog-border, #e2d9cd)',
                borderRadius: 18,
                padding: '22px 26px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blog-accent, #c8943a)' }}>
                    CATEGORY {String(item.n || i + 1).padStart(2, '0')} {item.loc ? `· ${item.loc}` : ''}
                  </span>
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 700, margin: '0 0 8px', color: 'var(--blog-ink, #1b1c1c)' }}>
                  {item.title}
                </h3>
                {item.img && (
                  <img src={item.img} alt={item.title} loading="lazy" style={{ width: '100%', borderRadius: 12, margin: '12px 0', objectFit: 'cover', maxHeight: 360 }} />
                )}
                <p style={{ margin: 0, lineHeight: 1.7, color: 'var(--blog-ink, #333)' }}>{item.body}</p>
              </div>
            ))}
          </div>
        );
      }

      // 19. Hidden Gems: Secret discoveries
      if (storyStyle === 'hidden-gems') {
        return (
          <div style={{ display: 'grid', gap: 32, margin: '36px 0', ...style }}>
            {items.map((item, i) => (
              <div className="gem-card" key={i} id={`n-${i + 1}`}>
                <span className="gem-tag">GEM {String(item.n || i + 1).padStart(2, '0')}</span>
                <h3 style={{ fontSize: 21, fontWeight: 700, margin: '8px 0 10px', color: 'var(--blog-ink, #1b1c1c)' }}>
                  {item.title}
                </h3>
                {item.loc && <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--blog-ink-muted, #777)', marginBottom: 12 }}>📍 {item.loc}</div>}
                {item.img && (
                  <img src={item.img} alt={item.title} loading="lazy" style={{ width: '100%', borderRadius: 14, margin: '12px 0 16px', objectFit: 'cover', maxHeight: 420 }} />
                )}
                <p style={{ margin: 0, lineHeight: 1.75, color: 'var(--blog-ink, #333)' }}>{item.body}</p>
              </div>
            ))}
          </div>
        );
      }

      // 23. Traveller's Checklist
      if (storyStyle === 'traveller-checklist') {
        return (
          <div className="checklist-container" style={style}>
            <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blog-accent, #c8943a)', marginBottom: 16 }}>
              ✓ TRIP PREPARATION & PACKING ITEMS
            </div>
            {items.map((item, i) => (
              <div className="checklist-item" key={i} id={`n-${i + 1}`}>
                <div className="checklist-checkbox">✓</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--blog-ink, #1b1c1c)' }}>{item.title}</div>
                  {item.body && <div style={{ fontSize: 13, color: 'var(--blog-ink-muted, #666)', marginTop: 2 }}>{item.body}</div>}
                </div>
              </div>
            ))}
          </div>
        );
      }

      // 24. Frequently Asked Questions Guide
      if (storyStyle === 'faq-guide') {
        return (
          <div className="faq-list" style={style}>
            {items.map((item, i) => (
              <div className="faq-card" key={i} id={`n-${i + 1}`}>
                <div className="faq-q">
                  <span>Q{i + 1}.</span> {item.title}
                </div>
                <p className="faq-a">{item.body}</p>
                {item.img && (
                  <img src={item.img} alt={item.title} loading="lazy" style={{ width: '100%', borderRadius: 12, marginTop: 14, objectFit: 'cover', maxHeight: 360 }} />
                )}
              </div>
            ))}
          </div>
        );
      }

      // 18. Beaches and Island Hopping: Coastal cards with landscape visuals
      if (storyStyle === 'beaches-islands') {
        return (
          <div className="pub-coastal-list" style={{ display: 'grid', gap: 32, margin: '28px 0', ...style }}>
            {items.map((item, i) => (
              <div className="coastal-card" key={i} id={`n-${i + 1}`}>
                {item.img && (
                  <div className="coastal-img-frame">
                    <img
                      src={item.img}
                      alt={item.title}
                      loading="lazy"
                      style={{
                        width: '100%',
                        aspectRatio: '16 / 9',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                    <span className="coastal-badge">
                      ISLAND #{String(item.n || i + 1).padStart(2, '0')}
                    </span>
                  </div>
                )}
                <div style={{ padding: item.img ? '20px 24px 24px' : '24px' }}>
                  {!item.img && (
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blog-accent, #c8943a)', marginBottom: 8 }}>
                      ISLAND #{String(item.n || i + 1).padStart(2, '0')}
                    </div>
                  )}
                  <h3 style={{ fontSize: 21, fontWeight: 700, margin: '0 0 6px', color: 'var(--blog-ink, #1b1c1c)' }}>
                    {item.title}
                  </h3>
                  {item.loc && <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--blog-ink-muted, #777)', marginBottom: 12 }}>📍 {item.loc}</div>}
                  <p style={{ margin: 0, lineHeight: 1.75, color: 'var(--blog-ink, #333)' }}>{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        );
      }

      // Standard / Editorial Journal listicle
      return (
        <div className="pub-numlist" style={style}>
          {items.map((item, i) => (
            <div className="nentry" key={i} id={`n-${i + 1}`}>
              <div className="num">{String(item.n || i + 1).padStart(2, '0')}</div>
              <div>
                <h3>{item.title}</h3>
                {item.loc && <div className="loc">{item.loc}</div>}
                {item.img && (
                  <img
                    src={item.img}
                    alt={item.title}
                    loading="lazy"
                    style={{
                      width: '100%',
                      aspectRatio: '16 / 9',
                      borderRadius: 14,
                      marginBottom: 16,
                      objectFit: 'cover',
                      maxHeight: 460,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    }}
                  />
                )}
                <p>{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case 'hotel': {
      if (!block.name && !block.title) return null;
      const hasImg = Boolean(block.img);
      return (
        <div className={`pub-hotel${hasImg ? '' : ' pub-hotel--no-img'}`} style={style}>
          {hasImg && (
            <div className="h-img">
              <img src={block.img} alt={block.name || ''} loading="lazy" />
            </div>
          )}
          <div className="h-body">
            {block.kicker && <div className="h-kicker">{block.kicker}</div>}
            <h4>{block.name || block.title}</h4>
            {block.loc && <div className="h-loc">📍 {block.loc}</div>}
            <p>{block.desc || block.body}</p>
            <div className="h-foot">
              <span className="price">{block.price || 'Check availability'}</span>
              <button className="btn btn-primary btn-sm" type="button">
                View hotel →
              </button>
            </div>
          </div>
        </div>
      );
    }

    case 'map': {
      const hasPins = Array.isArray(block.pins) && block.pins.length > 0;
      if (!hasPins && !block.name && !block.loc) return null;

      return (
        <div className="pub-map" style={style}>
          {(block.name || block.loc) && (
            <div className="pub-map-badge">
              📍 {block.name || block.loc}
            </div>
          )}
          {hasPins &&
            block.pins!.map((pin, i) => (
              <div key={i} className="pin" style={{ left: `${pin.x}%`, top: `${pin.y}%` }} title={pin.label} />
            ))}
        </div>
      );
    }

    case 'video': {
      if (!block.url) return null;
      return (
        <div className="pub-video" style={style}>
          <div className="pub-video-play" aria-label="Video placeholder">
            ▶
          </div>
        </div>
      );
    }

    case 'callout': {
      const text = block.text || block.body || '';
      if (!text.trim()) return null;
      const highlight = block.settings?.highlight || 'tip';
      const icon = highlight === 'warning' ? '⚠️' : highlight === 'important' ? '⭐' : highlight === 'editor-note' ? '📝' : '💡';
      return (
        <div className="pub-callout-box" style={style}>
          <div className="pub-callout-icon">{icon}</div>
          <div>
            {block.title && <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{block.title}</div>}
            <div style={{ lineHeight: 1.6, fontSize: 14 }}>
              <InlineText text={text} fragments={block.inlineContent} />
            </div>
          </div>
        </div>
      );
    }

    case 'faq': {
      const items = (block.items || []).filter((it) => (it.title || '').trim() || (it.body || '').trim());
      if (items.length === 0 && !block.title) return null;
      return (
        <div className="faq-list" style={style}>
          {block.title && <h3 style={{ margin: '0 0 16px', fontSize: 20, fontWeight: 700 }}>{block.title}</h3>}
          {items.map((item, i) => (
            <div className="faq-card" key={i}>
              <div className="faq-q">
                <span>Q{i + 1}.</span> {item.title}
              </div>
              <p className="faq-a">{item.body}</p>
            </div>
          ))}
        </div>
      );
    }

    case 'budget': {
      if (!block.title && !block.price && !block.body) return null;
      return (
        <div className="pub-budget-summary" style={style}>
          <div className="pub-budget-header">
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{block.title || 'Trip Cost Breakdown'}</h3>
            {block.price && <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--blog-accent, #c8943a)' }}>Est. Total: {block.price}</span>}
          </div>
          {block.body && <p style={{ margin: '0 0 16px', fontSize: 14, lineHeight: 1.6, color: 'var(--blog-ink-muted, #666)' }}>{block.body}</p>}
        </div>
      );
    }

    case 'newsletter':
      return (
        <div className="pub-newsletter" style={{ borderRadius: 18, ...style }}>
          <h3>{block.title || 'Subscribe to PlumTrips Journal'}</h3>
          <p>{block.body || 'Get curated travel itineraries, destination insights, and exclusive trip perks.'}</p>
          <div className="pub-newsletter-form">
            <input type="email" placeholder="your@email.com" aria-label="Email address" />
            <button className="btn btn-primary" type="button">
              Subscribe
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
};

export interface ArticleRendererProps {
  blocks?: PostBlock[];
  className?: string;
  storyStyle?: StoryStyle;
  typography?: TypographyRules;
  layout?: LayoutRules;
}

const DEFAULT_TYPOGRAPHY: TypographyRules = {
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
};

const DEFAULT_LAYOUT: LayoutRules = {
  contentWidth: 'wide',
  imageWidth: 'wide',
  imageAlignment: 'center',
  textAlignment: 'left',
  sectionSpacing: 'relaxed',
  imageTextSpacing: 'standard',
  sidebar: 'none',
};

export const ArticleRenderer: React.FC<ArticleRendererProps> = ({
  blocks = [],
  className,
  storyStyle,
  typography: typographyProp,
  layout: layoutProp,
}) => {
  const defaults = getTemplateDefaultsForStoryStyle(storyStyle);
  const templateTypography = typographyProp || defaults.typography || DEFAULT_TYPOGRAPHY;
  const templateLayout = layoutProp || defaults.layout || DEFAULT_LAYOUT;
  const ctx: BlockStyleContext = { templateTypography, templateLayout };

  let firstParagraphFound = false;

  return (
    <div className={className ? `article-renderer ${className}` : 'article-renderer'}>
      {blocks.map((block, index) => {
        let isFirstParagraph = false;
        if (block.type === 'p' && !firstParagraphFound) {
          isFirstParagraph = true;
          firstParagraphFound = true;
        }

        return (
          <ArticleBlock
            key={block.id || `block-${index}`}
            block={block}
            storyStyle={storyStyle}
            isFirstParagraph={isFirstParagraph}
            ctx={ctx}
          />
        );
      })}
    </div>
  );
};

export default ArticleRenderer;