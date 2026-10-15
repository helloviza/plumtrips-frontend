/*ReadBlog.tsx*/
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  getBlogInteraction,
  likeBlog,
  rateBlog,
  saveBlog,
  type Post,
  type StoryStyle,
  type BackgroundTheme,
} from '../../lib/api';
import { ArticleRenderer } from '../../components/blogs/ArticleRenderer';
import type { BlogSidebar, ListItem } from '../marketing/blogs.model';
import { STORY_STYLE_LABELS } from '../marketing/blog-templates.data';
import '../marketing/published-styles.css';

// ─── Design tokens ────────────────────────────────────────────────────────────
const tokens = {
  fontDisplay: "'Playfair Display', Georgia, serif",
  fontBody: "'Manrope', system-ui, sans-serif",
  gold: '#c8943a',
};

const label: React.CSSProperties = {
  fontFamily: tokens.fontBody,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: 'rgba(255,255,255,0.7)',
};

// ─── Props ────────────────────────────────────────────────────────────────────
export interface ReadBlogProps {
  post: Post;
  storyStyle?: StoryStyle;
  theme?: BackgroundTheme;
  layout?: 'magazine' | 'listicle' | 'essay';
  displayFont?: 'serif' | 'sans';
  isPreview?: boolean;
}

interface TocItem {
  id: string;
  title: string;
  num: string;
  loc?: string;
}



// ─── Auto-detect style for existing blogs across all 25 templates ────────────
const autoDetectStoryStyle = (p: Post): StoryStyle => {
  if (p.storyStyle) return p.storyStyle;

  const titleLower = (p.title || '').toLowerCase();
  const excerptLower = (p.excerpt || '').toLowerCase();
  const catsLower = (p.categories || []).map((c) => c.toLowerCase()).join(' ');
  const tagsLower = (p.tags || []).map((t) => t.toLowerCase()).join(' ');
  const combined = `${titleLower} ${excerptLower} ${catsLower} ${tagsLower}`;

  // 14. Transport & Getting There (Cruises, Ferries, Flights, Transit)
  if (
    combined.includes('cruise') ||
    combined.includes('flight') ||
    combined.includes('transit') ||
    combined.includes('getting there') ||
    combined.includes('train') ||
    combined.includes('rail')
  ) {
    return 'transport-guide';
  }

  // 16. Food & Local Flavours
  if (
    combined.includes('food') ||
    combined.includes('culinary') ||
    combined.includes('taste') ||
    combined.includes('flavours') ||
    combined.includes('dining') ||
    combined.includes('eat')
  ) {
    return 'food-flavours';
  }

  // 10. Nature & Wildlife
  if (
    combined.includes('safari') ||
    combined.includes('wildlife') ||
    combined.includes('animal') ||
    combined.includes('flamingo') ||
    combined.includes('nature') ||
    combined.includes('forest')
  ) {
    return 'nature-wildlife';
  }

  // 18. Beaches & Island Hopping
  if (
    combined.includes('beach') ||
    combined.includes('island') ||
    combined.includes('waters') ||
    combined.includes('maldives') ||
    combined.includes('bahamas') ||
    combined.includes('phuket') ||
    combined.includes('phi phi') ||
    combined.includes('kos') ||
    combined.includes('coastal')
  ) {
    return 'beaches-islands';
  }

  // 20. Seasonal Travel Guide
  if (
    combined.includes('autumn') ||
    combined.includes('spring') ||
    combined.includes('winter') ||
    combined.includes('summer') ||
    combined.includes('season')
  ) {
    return 'seasonal-guide';
  }

  // 11. Budget Breakdown
  if (
    combined.includes('budget') ||
    combined.includes('cost') ||
    combined.includes('price') ||
    combined.includes('affordable') ||
    combined.includes('how much')
  ) {
    return 'budget-breakdown';
  }

  // 15. Accommodation & Stay Guide
  if (
    combined.includes('hotels') ||
    combined.includes('resort') ||
    combined.includes('stay') ||
    combined.includes('villas') ||
    p.blocks?.some((b) => b.type === 'hotel')
  ) {
    return 'stay-guide';
  }

  // 21. Destination Comparison
  if (combined.includes(' vs ') || combined.includes('versus') || combined.includes('comparison')) {
    return 'destination-comparison';
  }

  // 23. Traveller's Checklist
  if (combined.includes('checklist') || combined.includes('packing') || combined.includes('preparation')) {
    return 'traveller-checklist';
  }

  // 24. FAQ Guide
  if (combined.includes('faq') || combined.includes('questions answered') || combined.includes('q&a')) {
    return 'faq-guide';
  }

  // 19. Hidden Gems
  if (
    combined.includes('hidden gem') ||
    combined.includes('undiscovered') ||
    combined.includes('secret')
  ) {
    return 'hidden-gems';
  }

  // 13. Weekend Escape
  if (
    combined.includes('weekend') ||
    combined.includes('48 hours') ||
    combined.includes('72 hours') ||
    combined.includes('3 days in')
  ) {
    return 'weekend-escape';
  }

  // 02. Day-by-Day Explorer & 12. Itinerary Planner
  if (
    combined.includes('itinerary') ||
    combined.includes('day-by-day') ||
    combined.includes('days in') ||
    p.blocks?.some((b) => b.type === 'numlist' && b.items?.some((it: ListItem) => (it.title || '').toLowerCase().includes('day ')))
  ) {
    return 'day-by-day';
  }

  // 04. Route Explorer
  if (
    combined.includes('route') ||
    combined.includes('road trip') ||
    combined.includes('stops') ||
    combined.includes('drive') ||
    p.blocks?.some((b) => b.type === 'map' && (b.pins?.length || 0) > 1)
  ) {
    return 'route-explorer';
  }

  // 17. Adventure Expedition
  if (
    combined.includes('adventure') ||
    combined.includes('trek') ||
    combined.includes('hike') ||
    combined.includes('expedition') ||
    combined.includes('climb')
  ) {
    return 'adventure-expedition';
  }

  // 09. Culture & Heritage
  if (
    combined.includes('culture') ||
    combined.includes('heritage') ||
    combined.includes('temple') ||
    combined.includes('history') ||
    combined.includes('ancient')
  ) {
    return 'culture-heritage';
  }

  // 22. Things to Do Explorer
  if (
    combined.includes('things to do') ||
    combined.includes('top 10') ||
    combined.includes('top 25') ||
    combined.includes('activities') ||
    combined.includes('best of')
  ) {
    return 'things-to-do';
  }

  // 03. Visual Journey & 07. Photo Essay
  const galleryCount = p.blocks?.filter((b) => b.type === 'gallery').length || 0;
  const imageCount = p.blocks?.filter((b) => b.type === 'image').length || 0;
  const paragraphCount = p.blocks?.filter((b) => b.type === 'p').length || 0;
  if ((galleryCount >= 1 && imageCount >= 1) || (imageCount >= 3 && paragraphCount <= 4)) {
    return 'visual-journey';
  }

  // 05. Smart Travel Guide
  if (
    combined.includes('guide') ||
    combined.includes('tips') ||
    combined.includes('how to') ||
    combined.includes('what to know')
  ) {
    return 'smart-travel';
  }

  return 'editorial-journal';
};

// ─── ReadBlog Component ───────────────────────────────────────────────────────
const ReadBlog: React.FC<ReadBlogProps> = ({
  post,
  storyStyle,
  theme,
  layout = 'magazine',
  displayFont = 'serif',
  isPreview = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [activeToc, setActiveToc] = useState(0);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes ?? 0);
  const [saved, setSaved] = useState(false);

  const activeStoryStyle: StoryStyle = storyStyle || post.storyStyle || autoDetectStoryStyle(post);
  const activeTheme: BackgroundTheme = theme || post.theme || 'classic-editorial';

  const categories = Array.isArray(post.categories)
    ? post.categories
      .filter((category): category is string => typeof category === 'string')
      .map((category) => category.trim())
      .filter(Boolean)
    : [];

  const tags = Array.isArray(post.tags)
    ? post.tags
      .filter((tag): tag is string => typeof tag === 'string')
      .map((tag) => tag.trim())
      .filter(Boolean)
    : [];

  useEffect(() => {
    if (!post.id || isPreview) return;

    const blogId = post.id;

    async function loadInteraction() {
      try {
        const response = await getBlogInteraction(blogId);

        if (response.success) {
          setLiked(response.data.liked);
          setRating(response.data.rating);
          setSaved(response.data.saved);
        }
      } catch {
        // User may be logged out, so no interaction state to restore.
      }
    }

    loadInteraction();
  }, [post.id, isPreview]);

  const ref = useRef<HTMLDivElement>(null);

  // ─── Derive Table of Contents Items ──────────────────────────────────────────
  const tocItems = useMemo<TocItem[]>(() => {
    const items: TocItem[] = [];

    // Check numlist entries (e.g. Goa blog)
    const numlistBlock = post.blocks?.find((b) => b.type === 'numlist');
    if (numlistBlock && numlistBlock.items && numlistBlock.items.length > 0) {
      numlistBlock.items.forEach((item: ListItem, i: number) => {
        items.push({
          id: `n-${i + 1}`,
          title: item.title,
          num: String(item.n || i + 1).padStart(2, '0'),
          loc: item.loc,
        });
      });
      return items;
    }

    // Check in-body h2 / h1 headings
    const headingBlocks = (post.blocks || []).filter(
      (b) => (b.type === 'h2' || b.type === 'h1') && (b.text || '').trim().length > 0
    );

    if (headingBlocks.length >= 2) {
      headingBlocks.forEach((b, i) => {
        items.push({
          id: `s-${b.id}`,
          title: b.text || '',
          num: String(i + 1).padStart(2, '0'),
        });
      });
    }

    return items;
  }, [post.blocks]);

  const sidebarOverride = useMemo<BlogSidebar | undefined>(() => {
    for (const b of post.blocks || []) {
      const sb = b.settings?.layout?.sidebar;
      if (sb) return sb;
    }
    return undefined;
  }, [post.blocks]);

  const hasToc = sidebarOverride === 'none' ? false : (layout !== 'essay' && tocItems.length >= 2);
  const isSidebarRight = sidebarOverride === 'right';

  // ─── Smooth Scroll with Sticky Header Offset ────────────────────────────────
  const scrollTo = (targetId: string, index: number) => {
    setActiveToc(index);
    setMobileTocOpen(false);

    const targetEl =
      document.getElementById(targetId) ||
      (ref.current?.querySelector(`#${targetId}`) as HTMLElement | null);

    if (!targetEl) return;

    // Check whether window or container is scrolling
    const container = ref.current;
    const isContainerScrolling =
      container &&
      container.scrollHeight > container.clientHeight + 40 &&
      container.clientHeight > 0 &&
      window.scrollY < 40;

    if (isContainerScrolling && container) {
      const top = targetEl.getBoundingClientRect().top + container.scrollTop - 90;
      container.scrollTo({ top, behavior: 'smooth' });
    } else {
      const yOffset = -90;
      const y = targetEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // ─── Scroll Listener & Spy (Window + Container) ─────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      // Progress calculation
      const winScroll = window.pageYOffset || document.documentElement.scrollTop;
      const winHeight = document.documentElement.scrollHeight - window.innerHeight;
      const winProgress = winHeight > 0 ? (winScroll / winHeight) * 100 : 0;

      const el = ref.current;
      const elHeight = el ? el.scrollHeight - el.clientHeight : 0;
      const elProgress = el && elHeight > 0 ? (el.scrollTop / elHeight) * 100 : 0;

      setProgress(Math.max(0, Math.min(100, elProgress > 0 ? elProgress : winProgress)));

      // Active TOC Spy
      if (tocItems.length === 0) return;
      let best = 0;
      tocItems.forEach((item, i) => {
        const entry =
          document.getElementById(item.id) ||
          (el?.querySelector(`#${item.id}`) as HTMLElement | null);
        if (entry) {
          const top = entry.getBoundingClientRect().top;
          if (top < 220) best = i;
        }
      });
      setActiveToc(best);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    const container = ref.current;
    if (container) {
      container.addEventListener('scroll', onScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (container) {
        container.removeEventListener('scroll', onScroll);
      }
    };
  }, [tocItems]);

  // ─── SEO: document title, meta description, canonical link ──────────────────
  useEffect(() => {
    if (isPreview) return;
    const prevTitle = document.title;
    document.title = post.seo?.title || post.title || prevTitle;

    const setMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
      if (!content) return tag;
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('name', name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
      return tag;
    };

    const description = post.seo?.description || post.excerpt || '';
    setMeta('description', description);

    let canonicalTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const canonicalHref = post.seo?.canonicalUrl || `${window.location.origin}/blogs/${post.slug}`;
    const hadCanonical = !!canonicalTag;
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalHref);

    return () => {
      document.title = prevTitle;
      if (!hadCanonical && canonicalTag) canonicalTag.remove();
    };
  }, [isPreview, post.seo?.title, post.seo?.description, post.seo?.canonicalUrl, post.title, post.excerpt, post.slug]);

  const handleLike = async () => {
    if (isPreview) {
      setLiked((prev) => !prev);
      setLikes((prev) => (liked ? Math.max(0, prev - 1) : prev + 1));
      return;
    }

    if (!post.id) {
      alert('Blog ID is missing.');
      return;
    }

    if (liked) return;

    try {
      const response = await likeBlog(post.id);
      setLiked(true);
      setLikes(response.data.likes);
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      if (message.includes('unauthorized') || message.includes('login') || message.includes('log in')) {
        alert('You need to log in to like this blog.');
        return;
      }
      alert('Failed to like this blog.');
    }
  };

  const handleShare = async () => {
    if (isPreview) return;

    const shareUrl = window.location.href;

    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.subtitle || post.excerpt,
        url: shareUrl,
      });
      return;
    }

    await navigator.clipboard.writeText(shareUrl);
    alert('Blog link copied!');
  };

  const handleSave = async () => {
    if (isPreview) {
      setSaved((prev) => !prev);
      return;
    }

    if (!post.id) {
      alert('Blog ID is missing.');
      return;
    }

    if (saved) return;

    try {
      await saveBlog(post.id);
      setSaved(true);
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      if (message.includes('unauthorized') || message.includes('login') || message.includes('log in')) {
        alert('You need to log in to save this blog.');
        return;
      }
      alert('Failed to save this blog.');
    }
  };

  const handleRating = async (star: number) => {
    if (isPreview) {
      setRating(star);
      return;
    }

    if (!post.id) {
      alert('Blog ID is missing.');
      return;
    }

    if (star < 1 || star > 5) return;

    try {
      await rateBlog(post.id, star);
      setRating(star);
    } catch (error) {
      const message = error instanceof Error ? error.message.toLowerCase() : '';
      if (message.includes('unauthorized') || message.includes('login') || message.includes('log in')) {
        alert('You need to log in to rate this blog.');
        return;
      }
      alert('Failed to rate this blog.');
    }
  };

  const formattedDate = new Date(post.publishDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });

  return (
    <div
      ref={ref}
      className="pub"
      data-story-style={activeStoryStyle}
      data-theme={activeTheme}
      data-layout={layout}
      data-display-font={displayFont}
      style={{
        minHeight: '100%',
        fontFamily: displayFont === 'sans' ? 'Inter, ui-sans-serif, system-ui, sans-serif' : tokens.fontBody,
      }}
    >
      {/* ── Reading progress bar ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 3,
          background: 'rgba(0, 0, 0, 0.08)',
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'var(--blog-accent, #c8943a)',
            transition: 'width .1s linear',
          }}
        />
      </div>

      {/* ── Hero: Photographic if cover image exists, Text-First if absent ── */}
      {post.cover?.src ? (
        <section
          style={{
            position: 'relative',
            height: activeStoryStyle === 'visual-journey' || activeStoryStyle === 'cinematic-destination' ? '88vh' : '82vh',
            minHeight: 480,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            overflow: 'hidden',
          }}
        >
          {/* Hero image background */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img
              src={post.cover.src}
              alt={post.cover.alt || post.title || ''}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>

          {/* Gradient overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              background:
                'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.15) 100%)',
            }}
          />

          {/* Hero content */}
          <div
            style={{
              position: 'relative',
              zIndex: 2,
              padding: '0 clamp(1rem, 2.5vw, 2rem) 40px',
              maxWidth: 1380,
              margin: '0 auto',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12,1fr)',
                gap: 28,
                alignItems: 'flex-end',
              }}
            >
              <div style={{ gridColumn: 'span 8' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    flexWrap: 'wrap',
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      ...label,
                      background: 'rgba(255, 255, 255, 0.18)',
                      backdropFilter: 'blur(8px)',
                      padding: '4px 12px',
                      borderRadius: 999,
                      color: '#fff',
                    }}
                  >
                    {categories.length > 0 ? categories.join(' · ') : 'Travel'}
                  </span>

                  <span
                    style={{
                      ...label,
                      background: 'var(--blog-accent, #c8943a)',
                      padding: '4px 12px',
                      borderRadius: 999,
                      color: '#fff',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {STORY_STYLE_LABELS[activeStoryStyle]}
                  </span>
                </div>

                <h1
                  style={{
                    fontFamily: tokens.fontDisplay,
                    fontSize: 'clamp(28px, 4.5vw, 62px)',
                    fontWeight: 400,
                    lineHeight: 1.1,
                    letterSpacing: '-0.02em',
                    color: '#fff',
                    margin: 0,
                    textShadow: '0 2px 10px rgba(0,0,0,0.4)',
                  }}
                >
                  {post.title}
                </h1>

                {post.subtitle && (
                  <p
                    style={{
                      margin: '14px 0 0',
                      fontSize: 'clamp(15px, 2vw, 19px)',
                      lineHeight: 1.5,
                      color: 'rgba(255, 255, 255, 0.88)',
                      maxWidth: 780,
                    }}
                  >
                    {post.subtitle}
                  </p>
                )}
              </div>

              <div
                style={{
                  gridColumn: 'span 4',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                  alignItems: 'flex-end',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(10px)',
                    padding: '12px 18px',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.15)',
                    width: '100%',
                    maxWidth: 340,
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.3)',
                      flexShrink: 0,
                      background: 'rgba(255,255,255,0.15)',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {post.author.avatar ? (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name || 'Author'}
                        width={40}
                        height={40}
                        loading="eager"
                        fetchPriority="high"
                        decoding="async"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    ) : (
                      post.author.initials || 'PT'
                    )}
                  </div>

                  <div style={{ color: '#fff', flex: 1, minWidth: 0 }}>
                    <div style={{ ...label, fontSize: 9, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>
                      Curated by
                    </div>
                    <div
                      style={{
                        fontFamily: tokens.fontBody,
                        fontSize: 13,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {post.author.name}
                    </div>
                  </div>

                  <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.2)' }} />

                  <div style={{ color: '#fff', textAlign: 'right' }}>
                    <div style={{ ...label, fontSize: 9, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>
                      Published
                    </div>
                    <div style={{ fontFamily: tokens.fontBody, fontSize: 13, fontWeight: 600 }}>
                      {formattedDate}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 20, color: '#fff' }}>
                  {[
                    {
                      icon: liked ? '♥' : '♡',
                      label: liked ? `LIKED (${likes})` : `LIKE (${likes})`,
                      onClick: handleLike,
                    },
                    {
                      icon: '🔖',
                      label: saved ? 'SAVED' : 'SAVE',
                      onClick: handleSave,
                    },
                    {
                      icon: '↑',
                      label: 'SHARE',
                      onClick: handleShare,
                    },
                  ].map((btn) => (
                    <button
                      key={btn.label}
                      onClick={btn.onClick}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#fff',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        ...label,
                        fontSize: 11,
                        textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                      }}
                    >
                      <span>{btn.icon}</span>
                      <span>{btn.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : (
        /* ── Text-First Hero (When Cover Image is Absent) ── */
        <section className="pub-hero--text-first" style={{ padding: '36px clamp(1rem, 2.5vw, 2rem) 16px' }}>
          <div
            style={{
              maxWidth: 1380,
              margin: '0 auto',
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: 32,
              alignItems: 'center',
            }}
          >
            <div style={{ gridColumn: 'span 8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
                <span
                  style={{
                    ...label,
                    background: 'var(--blog-surface, #fff)',
                    border: '1px solid var(--blog-border, #ddd)',
                    padding: '4px 12px',
                    borderRadius: 999,
                    color: 'var(--blog-accent, #c8943a)',
                  }}
                >
                  {categories.length > 0 ? categories.join(' · ') : 'Travel'}
                </span>

                <span
                  style={{
                    ...label,
                    background: 'var(--blog-accent, #c8943a)',
                    padding: '4px 12px',
                    borderRadius: 999,
                    color: '#fff',
                  }}
                >
                  {STORY_STYLE_LABELS[activeStoryStyle]}
                </span>
              </div>

              <h1
                style={{
                  fontFamily: tokens.fontDisplay,
                  fontSize: 'clamp(28px, 4vw, 54px)',
                  fontWeight: 700,
                  lineHeight: 1.15,
                  color: 'var(--blog-ink, #1b1c1c)',
                  margin: 0,
                }}
              >
                {post.title}
              </h1>

              {post.subtitle && (
                <p
                  style={{
                    margin: '16px 0 0',
                    fontSize: 'clamp(16px, 1.8vw, 19px)',
                    lineHeight: 1.6,
                    color: 'var(--blog-ink-muted, #555)',
                    maxWidth: 780,
                  }}
                >
                  {post.subtitle}
                </p>
              )}
            </div>

            <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-end' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'var(--blog-surface, #fff)',
                  border: '1px solid var(--blog-border, #ddd)',
                  padding: '12px 18px',
                  borderRadius: 14,
                  width: '100%',
                  maxWidth: 340,
                  boxSizing: 'border-box',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'var(--blog-accent-soft, rgba(200, 148, 58, 0.15))',
                    display: 'grid',
                    placeItems: 'center',
                    color: 'var(--blog-accent, #c8943a)',
                    fontWeight: 700,
                    fontSize: 13,
                    flexShrink: 0,
                  }}
                >
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.name || 'Author'}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    post.author.initials || 'PT'
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ ...label, fontSize: 9, color: 'var(--blog-ink-muted, #777)', marginBottom: 2 }}>
                    Curated by
                  </div>
                  <div style={{ fontFamily: tokens.fontBody, fontSize: 13, fontWeight: 600, color: 'var(--blog-ink, #222)' }}>
                    {post.author.name}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ ...label, fontSize: 9, color: 'var(--blog-ink-muted, #777)', marginBottom: 2 }}>
                    Published
                  </div>
                  <div style={{ fontFamily: tokens.fontBody, fontSize: 13, fontWeight: 600, color: 'var(--blog-ink, #222)' }}>
                    {formattedDate}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16 }}>
                <button
                  type="button"
                  onClick={handleLike}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    ...label,
                    color: liked ? 'var(--blog-accent, #c8943a)' : 'var(--blog-ink-muted, #555)',
                  }}
                >
                  {liked ? '♥' : '♡'} LIKE ({likes})
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    ...label,
                    color: saved ? 'var(--blog-accent, #c8943a)' : 'var(--blog-ink-muted, #555)',
                  }}
                >
                  🔖 {saved ? 'SAVED' : 'SAVE'}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    ...label,
                    color: 'var(--blog-ink-muted, #555)',
                  }}
                >
                  ↑ SHARE
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Cover caption */}
      {post.cover?.caption && (
        <div
          style={{
            ...label,
            textAlign: 'center',
            padding: '12px 24px',
            color: 'var(--blog-ink-muted, #747878)',
            borderBottom: '1px solid var(--blog-border-subtle, rgba(0,0,0,0.06))',
            background: 'var(--blog-surface-elevated, #fbf9f7)',
          }}
        >
          {post.cover.caption}
        </div>
      )}

      {/* ── Story Style Specific Top Banners ── */}

      {/* 05. Smart Travel Guide & 25. Destination Field Guide: At a Glance Card */}
      {(activeStoryStyle === 'smart-travel' || activeStoryStyle === 'field-guide') && (
        <div className="pub-top-banner">
          <div className="pub-glance-card">
            <div className="pub-glance-title">
              <span>✦</span> {activeStoryStyle === 'field-guide' ? 'DESTINATION FIELD DOSSIER · QUICK FACTS' : 'TRIP AT A GLANCE · SMART ESSENTIALS'}
            </div>
            <div className="pub-glance-grid">
              <div className="pub-glance-item">
                <div className="pub-glance-label">Best Season</div>
                <div className="pub-glance-val">{post.location?.name ? 'October to March' : 'Year-Round'}</div>
              </div>
              <div className="pub-glance-item">
                <div className="pub-glance-label">Ideal Duration</div>
                <div className="pub-glance-val">4 to 6 Days</div>
              </div>
              <div className="pub-glance-item">
                <div className="pub-glance-label">Experience Type</div>
                <div className="pub-glance-val">{categories[0] || 'Culture & Discovery'}</div>
              </div>
              <div className="pub-glance-item">
                <div className="pub-glance-label">Target Traveler</div>
                <div className="pub-glance-val">Couples, Friends & Solo</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 04. Route Explorer & 14. Transport and Getting There: Waypoints / Route Banner */}
      {(activeStoryStyle === 'route-explorer' || activeStoryStyle === 'transport-guide') && tocItems.length > 0 && (
        <div className="pub-top-banner">
          <div className="pub-route-banner">
            <span className="pub-route-banner-tag">{activeStoryStyle === 'transport-guide' ? 'TRANSIT LEGS' : 'SCENIC ROUTE'}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 13, fontWeight: 600 }}>
              {tocItems.map((item, idx) => (
                <React.Fragment key={item.id}>
                  <button
                    type="button"
                    onClick={() => scrollTo(item.id, idx)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px 6px',
                      borderRadius: 4,
                      color: idx === activeToc ? 'var(--blog-accent, #c8943a)' : 'var(--blog-ink, #222)',
                      fontWeight: idx === activeToc ? 700 : 500,
                    }}
                  >
                    Stop {item.num}: {item.title}
                  </button>
                  {idx < tocItems.length - 1 && <span style={{ color: 'var(--blog-ink-muted, #999)' }}>→</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 02. Day-by-Day Explorer & 12. Itinerary Planner: Day Selector Strip */}
      {(activeStoryStyle === 'day-by-day' || activeStoryStyle === 'itinerary-planner') && tocItems.length > 0 && (
        <div className="pub-top-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: 'var(--blog-surface-elevated, #fbf9f7)', padding: '14px 20px', borderRadius: 16, border: '1px solid var(--blog-border-subtle, rgba(220, 214, 204, 0.7))' }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blog-accent, #c8943a)' }}>
              📅 JUMP TO DAY:
            </span>
            {tocItems.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id, idx)}
                style={{
                  background: idx === activeToc ? 'var(--blog-accent, #c8943a)' : 'var(--blog-surface, #fff)',
                  color: idx === activeToc ? '#fff' : 'var(--blog-ink, #222)',
                  border: '1px solid var(--blog-border, #ddd)',
                  padding: '6px 14px',
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Day {item.num}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 11. Budget Breakdown: Top Summary Header */}
      {activeStoryStyle === 'budget-breakdown' && (
        <div className="pub-top-banner">
          <div className="pub-budget-summary" style={{ margin: 0 }}>
            <div className="pub-budget-header">
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--blog-accent, #c8943a)' }}>
                  ESTIMATED TRIP BUDGET
                </span>
                <h3 style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700 }}>Categorized Spending Guide</h3>
              </div>
              <div style={{ fontSize: 13, color: 'var(--blog-ink-muted, #777)' }}>Estimates per traveler in mid-range tier</div>
            </div>
            <div className="pub-budget-grid">
              <div className="pub-budget-tile">
                <div className="pub-budget-tile-label">Stay / Night</div>
                <div className="pub-budget-tile-amount">₹4,500 – ₹9,000</div>
              </div>
              <div className="pub-budget-tile">
                <div className="pub-budget-tile-label">Daily Meals</div>
                <div className="pub-budget-tile-amount">₹1,200 – ₹2,500</div>
              </div>
              <div className="pub-budget-tile">
                <div className="pub-budget-tile-label">Local Transit</div>
                <div className="pub-budget-tile-amount">₹500 – ₹1,500</div>
              </div>
              <div className="pub-budget-tile">
                <div className="pub-budget-tile-label">Activities & Entry</div>
                <div className="pub-budget-tile-amount">₹800 – ₹2,000</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 13. Weekend Escape: 3-Stage Timeline Header */}
      {activeStoryStyle === 'weekend-escape' && (
        <div className="pub-top-banner">
          <div className="season-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'var(--blog-accent, #c8943a)', color: '#fff', padding: '4px 12px', borderRadius: 999 }}>
                48–72H ESCAPE
              </span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--blog-ink, #222)' }}>
                Friday Evening Arrival → Sunday Night Departure
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span className="weekend-tab-pill">FRI: ARRIVAL</span>
              <span className="weekend-tab-pill">SAT: EXPLORE</span>
              <span className="weekend-tab-pill">SUN: FINALE</span>
            </div>
          </div>
        </div>
      )}

      {/* 20. Seasonal Travel Guide: Timing Header */}
      {activeStoryStyle === 'seasonal-guide' && (
        <div className="pub-top-banner">
          <div className="season-banner">
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blog-accent, #c8943a)', marginBottom: 4 }}>
                CLIMATE & BEST TIMING
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--blog-ink, #222)' }}>
                Peak Weather vs Shoulder Month Savings
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ padding: '6px 14px', borderRadius: 999, background: 'var(--blog-surface, #fff)', border: '1px solid var(--blog-border, #ddd)', fontSize: 12, fontWeight: 600 }}>🌸 Spring: Mild</span>
              <span style={{ padding: '6px 14px', borderRadius: 999, background: 'var(--blog-surface, #fff)', border: '1px solid var(--blog-border, #ddd)', fontSize: 12, fontWeight: 600 }}>☀️ Summer: Peak</span>
              <span style={{ padding: '6px 14px', borderRadius: 999, background: 'var(--blog-accent-soft, rgba(200, 148, 58, 0.15))', border: '1px solid var(--blog-accent, #c8943a)', color: 'var(--blog-accent, #c8943a)', fontSize: 12, fontWeight: 700 }}>🍁 Autumn: Best Value</span>
              <span style={{ padding: '6px 14px', borderRadius: 999, background: 'var(--blog-surface, #fff)', border: '1px solid var(--blog-border, #ddd)', fontSize: 12, fontWeight: 600 }}>❄️ Winter: Quiet</span>
            </div>
          </div>
        </div>
      )}

      {/* 21. Destination Comparison: Scorecard Header */}
      {activeStoryStyle === 'destination-comparison' && (
        <div className="pub-top-banner">
          <div className="comparison-scorecard" style={{ padding: '24px 28px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blog-accent, #c8943a)', marginBottom: 8 }}>
              SIDE-BY-SIDE EVALUATION
            </div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Key Decision Criteria at a Glance</h3>
            <p style={{ margin: '8px 0 0', fontSize: 14, color: 'var(--blog-ink-muted, #666)' }}>
              Comparing scenery, budget tiers, culinary scenes, and ease of getting around to help you choose the right trip.
            </p>
          </div>
        </div>
      )}

      {/* 23. Traveller's Checklist: Interactive Prep Counter */}
      {activeStoryStyle === 'traveller-checklist' && (
        <div className="pub-top-banner">
          <div className="checklist-container" style={{ margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blog-accent, #c8943a)' }}>
                PRE-DEPARTURE READINESS
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--blog-ink-muted, #666)' }}>Interactive Checklist</span>
            </div>
            <div className="checklist-progress-bar">
              <div className="checklist-progress-fill" style={{ width: '40%' }} />
            </div>
            <div style={{ fontSize: 13, color: 'var(--blog-ink, #333)' }}>
              Review document requirements, packing essentials, currency notes, and emergency contacts below.
            </div>
          </div>
        </div>
      )}

      {/* ── Main Article Shell ── */}
      <div
        className={`article-shell${hasToc
            ? ` article-shell--has-toc${isSidebarRight ? ' article-shell--sidebar-right' : ''}`
            : ' article-shell--single-column'
          }`}
      >
        {/* Desktop Sidebar TOC */}
        {hasToc && (
          <aside className="pub-sidebar-toc">
            <div className="pub-sidebar-toc-title">
              <span>In this article</span>
              <span style={{ fontSize: 9, opacity: 0.6 }}>{tocItems.length} SECTIONS</span>
            </div>

            <ol className="pub-sidebar-toc-list">
              {tocItems.map((item, i) => (
                <li
                  key={item.id}
                  onClick={() => scrollTo(item.id, i)}
                  className={`pub-sidebar-toc-item${i === activeToc ? ' active' : ''}`}
                >
                  <span className="pub-sidebar-toc-num">{item.num}</span>
                  <span style={{ flex: 1 }}>{item.title}</span>
                </li>
              ))}
            </ol>

            {/* Sidebar Supporting Context (Eliminates Blank Space) */}
            <div className="pub-sidebar-widget">
              <div className="pub-sidebar-widget-title">Travel Context</div>
              <div className="pub-sidebar-info-card">
                <strong>{post.location?.name || categories[0] || 'Curated Exploration'}</strong>
                ⏱ {post.readingTime || 4} min read · {categories.join(' · ') || 'Travel'}
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--blog-ink-muted, #777)' }}>
                  PlumTrips verified travel notes for modern travelers.
                </div>
              </div>

              <div className="pub-sidebar-actions">
                <button type="button" className="pub-sidebar-btn" onClick={handleSave}>
                  <span>{saved ? '🔖 Saved' : '🔖 Save'}</span>
                </button>
                <button type="button" className="pub-sidebar-btn" onClick={handleShare}>
                  <span>↑ Share</span>
                </button>
              </div>
            </div>
          </aside>
        )}

        {/* Article Content */}
        <article className="article-shell-content">
          {/* Mobile Collapsible TOC */}
          {hasToc && (
            <div className="mobile-toc-drawer">
              <button
                type="button"
                className="mobile-toc-header"
                onClick={() => setMobileTocOpen((prev) => !prev)}
              >
                <span>📖 In this article ({tocItems.length} sections)</span>
                <span>{mobileTocOpen ? '▴' : '▾'}</span>
              </button>

              {mobileTocOpen && (
                <div className="mobile-toc-content">
                  {tocItems.map((item, i) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollTo(item.id, i)}
                      style={{
                        textAlign: 'left',
                        background: i === activeToc ? 'var(--blog-accent-soft, rgba(200, 148, 58, 0.12))' : 'none',
                        border: 'none',
                        padding: '8px 10px',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 13,
                        fontWeight: i === activeToc ? 700 : 500,
                        color: i === activeToc ? 'var(--blog-accent, #c8943a)' : 'var(--blog-ink, #222)',
                        display: 'flex',
                        gap: 8,
                      }}
                    >
                      <span style={{ opacity: 0.6, fontVariantNumeric: 'tabular-nums' }}>{item.num}</span>
                      <span>{item.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Unified Content Blocks Renderer */}
          <ArticleRenderer blocks={post.blocks || []} storyStyle={activeStoryStyle} />

          {/* Tags */}
          {tags.length > 0 && (
            <div
              style={{
                marginTop: 48,
                paddingTop: 24,
                borderTop: '1px solid var(--blog-border-subtle, rgba(0,0,0,0.08))',
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              {tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    ...label,
                    fontSize: 11,
                    padding: '6px 14px',
                    borderRadius: 999,
                    border: '1px solid var(--blog-border, #ddd)',
                    color: 'var(--blog-ink-muted, #666)',
                    background: 'var(--blog-surface-elevated, #fbf9f7)',
                    transition: 'all .15s',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Engagement strip */}
          <div
            style={{
              marginTop: 36,
              padding: '22px 0',
              borderTop: '1px solid var(--blog-border-subtle, rgba(0,0,0,0.08))',
              borderBottom: '1px solid var(--blog-border-subtle, rgba(0,0,0,0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                flexWrap: 'wrap',
              }}
            >
              {/* Like */}
              <button
                type="button"
                onClick={handleLike}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  ...label,
                  fontSize: 11,
                  color: liked ? 'var(--blog-accent, #c8943a)' : 'var(--blog-ink-muted, #666)',
                  fontWeight: liked ? 700 : 600,
                }}
              >
                <span>{liked ? '♥' : '♡'}</span>
                <span>{liked ? 'Liked' : 'Like'} ({likes})</span>
              </button>

              {/* Save */}
              <button
                type="button"
                onClick={handleSave}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  ...label,
                  fontSize: 11,
                  color: saved ? 'var(--blog-accent, #c8943a)' : 'var(--blog-ink-muted, #666)',
                  fontWeight: saved ? 700 : 600,
                }}
              >
                <span>🔖</span>
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>

              {/* Share */}
              <button
                type="button"
                onClick={handleShare}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  ...label,
                  fontSize: 11,
                  color: 'var(--blog-ink-muted, #666)',
                }}
              >
                <span>↑</span>
                <span>Share</span>
              </button>

              {/* Rating */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginLeft: 8,
                }}
              >
                <span
                  style={{
                    ...label,
                    fontSize: 10,
                    color: 'var(--blog-ink-muted, #777)',
                  }}
                >
                  Rate
                </span>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                  aria-label={`Rating: ${rating} out of 5`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRating(star)}
                      aria-label={`Rate ${star} out of 5`}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 2,
                        cursor: 'pointer',
                        fontSize: 20,
                        lineHeight: 1,
                        color: star <= rating ? 'var(--blog-accent, #c8943a)' : '#d0d0d0',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <span
                  style={{
                    fontFamily: tokens.fontBody,
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--blog-ink-muted, #777)',
                    minWidth: 28,
                  }}
                >
                  {rating > 0 ? `${rating}/5` : ''}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ ...label, fontSize: 9, color: 'var(--blog-ink-faint, #888)', marginBottom: 2 }}>
                  Category
                </div>
                <div style={{ fontFamily: tokens.fontBody, fontSize: 13, fontStyle: 'italic' }}>
                  {categories[1] || categories[0] || 'Journal'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ ...label, fontSize: 9, color: 'var(--blog-ink-faint, #888)', marginBottom: 2 }}>
                  Read Time
                </div>
                <div style={{ fontFamily: tokens.fontBody, fontSize: 13 }}>{post.readingTime || 4} min</div>
              </div>
            </div>
          </div>

          {/* Author bio card */}
          <div
            style={{
              marginTop: 40,
              padding: '28px 32px',
              background: 'var(--blog-surface-elevated, #fbf9f7)',
              border: '1px solid var(--blog-border-subtle, rgba(0,0,0,0.06))',
              borderLeft: '4px solid var(--blog-accent, #c8943a)',
              borderRadius: 16,
              display: 'flex',
              gap: 20,
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                flexShrink: 0,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1px solid var(--blog-border, #ddd)',
                background: '#e8e8e8',
                backgroundImage: post.author.avatar ? `url(${post.author.avatar})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--blog-ink, #222)',
                fontSize: 15,
                fontWeight: 700,
              }}
            >
              {!post.author.avatar && (post.author.initials || 'PT')}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ ...label, fontSize: 10, color: 'var(--blog-ink-faint, #888)', marginBottom: 4 }}>
                Written by
              </div>
              <div
                style={{
                  fontFamily: tokens.fontDisplay,
                  fontSize: 19,
                  fontWeight: 600,
                  color: 'var(--blog-ink, #1b1c1c)',
                  marginBottom: 2,
                }}
              >
                {post.author.name}
              </div>
              <div style={{ fontFamily: tokens.fontBody, fontSize: 13, color: 'var(--blog-ink-muted, #666)' }}>
                {post.author.role || 'Travel Editor'}
              </div>
            </div>
          </div>

          {/* Related blogs */}
          {post.related && post.related.length > 0 && (
            <section
              style={{
                marginTop: 64,
                paddingTop: 40,
                borderTop: '1px solid var(--blog-border-subtle, rgba(0,0,0,0.08))',
              }}
            >
              <h2
                style={{
                  fontFamily: tokens.fontDisplay,
                  fontSize: 26,
                  fontWeight: 400,
                  color: 'var(--blog-ink, #1b1c1c)',
                  margin: '0 0 24px',
                }}
              >
                Related Stories & Journeys
              </h2>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 24,
                }}
              >
                {post.related.map((blog: { title: string; excerpt?: string; thumb?: string; cat?: string; slug?: string }, index: number) => (
                  <a
                    key={`${blog.title}-${index}`}
                    href={blog.slug ? `/blogs/${blog.slug}` : '#'}
                    style={{
                      display: 'block',
                      overflow: 'hidden',
                      borderRadius: 16,
                      border: '1px solid var(--blog-border-subtle, #e5e5e5)',
                      background: 'var(--blog-surface, #fff)',
                      color: 'var(--blog-ink, #1b1c1c)',
                      textDecoration: 'none',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.04)',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    }}
                  >
                    {blog.thumb && (
                      <img
                        src={blog.thumb}
                        alt={blog.title}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: 180,
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                    )}

                    <div style={{ padding: 18 }}>
                      {blog.cat && (
                        <div style={{ ...label, color: 'var(--blog-accent, #c8943a)', marginBottom: 6 }}>
                          {blog.cat}
                        </div>
                      )}
                      <h3
                        style={{
                          fontFamily: tokens.fontDisplay,
                          fontSize: 18,
                          fontWeight: 600,
                          lineHeight: 1.3,
                          color: 'var(--blog-ink, #1b1c1c)',
                          margin: 0,
                        }}
                      >
                        {blog.title}
                      </h3>
                      {blog.excerpt && (
                        <p
                          style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            overflow: 'hidden',
                            fontFamily: tokens.fontBody,
                            fontSize: 13,
                            lineHeight: 1.6,
                            color: 'var(--blog-ink-muted, #666)',
                            margin: '8px 0 0',
                          }}
                        >
                          {blog.excerpt}
                        </p>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </article>
      </div>
    </div>
  );
};

export default ReadBlog;