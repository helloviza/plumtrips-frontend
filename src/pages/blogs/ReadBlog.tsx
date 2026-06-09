import React, { useEffect, useRef, useState } from 'react';
import type { Post } from '../../lib/api';
import type { PostBlock } from '../../pages/marketing/blogs.model';

// ─── Google Fonts injection (Playfair Display + Manrope) ──────────────────────
const FontLoader: React.FC = () => {
  useEffect(() => {
    const id = 'aureate-fonts';
    if (document.getElementById(id)) return;
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Manrope:wght@400;600;800&display=swap';
    document.head.appendChild(link);
  }, []);
  return null;
};

// ─── Design tokens ────────────────────────────────────────────────────────────
const tokens = {
  bg: '#fbf9f8',
  bgDim: '#f5f3f3',
  bgContainer: '#efeded',
  ink: '#1b1c1c',
  inkMuted: '#444748',
  outline: '#747878',
  outlineVariant: '#c4c7c7',
  gold: '#e9c176',
  goldSoft: 'rgba(233,193,118,0.15)',
  fontDisplay: "'Playfair Display', Georgia, serif",
  fontBody: "'Manrope', system-ui, sans-serif",
};

const label: React.CSSProperties = {
  fontFamily: tokens.fontBody,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  color: tokens.outlineVariant,
};

// ─── Published Block Renderer ─────────────────────────────────────────────────
const PubBlock: React.FC<{ block: PostBlock; isFirst?: boolean }> = ({ block, isFirst }) => {
  switch (block.type) {
    case 'h1':
      return (
        <h1
          style={{
            fontFamily: tokens.fontDisplay,
            fontSize: 'clamp(32px, 4vw, 52px)',
            fontWeight: 400,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: tokens.ink,
            margin: '56px 0 20px',
          }}
        >
          {block.text}
        </h1>
      );

    case 'h2':
      return (
        <h2
          id={`s-${block.id}`}
          style={{
            fontFamily: tokens.fontDisplay,
            fontSize: 'clamp(24px, 3vw, 36px)',
            fontWeight: 400,
            lineHeight: 1.25,
            color: tokens.ink,
            margin: '48px 0 16px',
          }}
        >
          {block.text}
        </h2>
      );

    case 'h3':
      return (
        <h3
          id={`s-${block.id}`}
          style={{
            fontFamily: tokens.fontDisplay,
            fontSize: 24,
            fontWeight: 400,
            lineHeight: 1.3,
            color: tokens.ink,
            margin: '36px 0 12px',
          }}
        >
          {block.text}
        </h3>
      );

    case 'p': {
      const isDropCap = isFirst;
      return (
        <p
          style={{
            fontFamily: tokens.fontBody,
            fontSize: 16,
            lineHeight: 1.75,
            color: tokens.inkMuted,
            margin: '0 0 24px',
          }}
        >
          {isDropCap ? (
            <>
              <span
                style={{
                  float: 'left',
                  fontFamily: tokens.fontDisplay,
                  fontSize: 80,
                  lineHeight: 0.78,
                  paddingRight: 12,
                  paddingTop: 8,
                  color: tokens.ink,
                  fontWeight: 400,
                }}
              >
                {block.text?.charAt(0)}
              </span>
              {block.text?.slice(1)}
            </>
          ) : (
            block.text
          )}
        </p>
      );
    }

    case 'quote':
      return (
        <blockquote
          style={{
            margin: '40px 0',
            paddingLeft: 24,
            borderLeft: `2px solid ${tokens.gold}`,
          }}
        >
          <p
            style={{
              fontFamily: tokens.fontDisplay,
              fontSize: 'clamp(18px, 2.5vw, 24px)',
              fontStyle: 'italic',
              lineHeight: 1.5,
              color: tokens.ink,
              margin: 0,
            }}
          >
            {block.text}
          </p>
          {block.cite && (
            <cite
              style={{
                display: 'block',
                marginTop: 12,
                fontFamily: tokens.fontBody,
                fontSize: 11,
                fontStyle: 'normal',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: tokens.outline,
              }}
            >
              — {block.cite}
            </cite>
          )}
        </blockquote>
      );

    case 'image':
    case 'cover':
      return (
        <figure style={{ margin: '40px 0' }}>
          {block.src ? (
            <img
              src={block.src}
              alt={block.caption || ''}
              style={{ width: '100%', display: 'block' }}
            />
          ) : (
            <div
              style={{
                aspectRatio: '16/9',
                background: tokens.bgContainer,
                border: `1px dashed ${tokens.outlineVariant}`,
              }}
            />
          )}
          {block.caption && (
            <figcaption style={{ ...label, marginTop: 12, color: tokens.outline }}>
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'gallery':
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 8,
            margin: '40px 0',
          }}
        >
          {(block.images || []).map((src, i) => (
            <div key={i} style={{ aspectRatio: '1', overflow: 'hidden', background: tokens.bgContainer }}>
              {src && (
                <img
                  src={src}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
          ))}
        </div>
      );

    case 'numlist':
      return (
        <div style={{ margin: '40px 0' }}>
          {(block.items || []).map((it, i) => (
            <div
              key={i}
              id={`n-${i + 1}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '48px 1fr',
                gap: 24,
                padding: '32px 0',
                borderTop: `1px solid ${tokens.outlineVariant}30`,
              }}
            >
              <div
                style={{
                  fontFamily: tokens.fontBody,
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  color: tokens.outlineVariant,
                  paddingTop: 4,
                }}
              >
                {String(it.n || i + 1).padStart(2, '0')}
              </div>
              <div>
                <h3
                  style={{
                    fontFamily: tokens.fontDisplay,
                    fontSize: 22,
                    fontWeight: 400,
                    margin: '0 0 6px',
                    color: tokens.ink,
                  }}
                >
                  {it.title}
                </h3>
                {it.loc && (
                  <div style={{ ...label, marginBottom: 16, color: tokens.outline }}>{it.loc}</div>
                )}
                {it.img && (
                  <img
                    src={it.img}
                    alt={it.title}
                    loading="lazy"
                    style={{ width: '100%', marginBottom: 16 }}
                  />
                )}
                <p style={{ fontFamily: tokens.fontBody, fontSize: 15, lineHeight: 1.75, color: tokens.inkMuted, margin: 0 }}>
                  {it.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      );

    case 'hotel':
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 0,
            margin: '40px 0',
            border: `1px solid ${tokens.outlineVariant}30`,
          }}
        >
          <div style={{ overflow: 'hidden' }}>
            {block.img ? (
              <img
                src={block.img}
                alt={block.name}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{ height: '100%', minHeight: 200, background: tokens.bgContainer }} />
            )}
          </div>
          <div style={{ padding: '32px 28px', background: tokens.bgDim }}>
            {block.kicker && (
              <div style={{ ...label, marginBottom: 10 }}>{block.kicker}</div>
            )}
            <h4
              style={{
                fontFamily: tokens.fontDisplay,
                fontSize: 22,
                fontWeight: 400,
                margin: '0 0 6px',
                color: tokens.ink,
              }}
            >
              {block.name}
            </h4>
            {block.loc && (
              <div style={{ ...label, marginBottom: 14, color: tokens.outline }}>{block.loc}</div>
            )}
            <p style={{ fontFamily: tokens.fontBody, fontSize: 14, lineHeight: 1.7, color: tokens.inkMuted, margin: '0 0 24px' }}>
              {block.desc}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              {block.price && (
                <span style={{ fontFamily: tokens.fontBody, fontSize: 14, fontWeight: 600, color: tokens.ink }}>
                  {block.price}
                </span>
              )}
              <button
                style={{
                  fontFamily: tokens.fontBody,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  padding: '8px 20px',
                  border: `1px solid ${tokens.ink}`,
                  background: 'transparent',
                  color: tokens.ink,
                  cursor: 'pointer',
                }}
              >
                View hotel →
              </button>
            </div>
          </div>
        </div>
      );

    case 'map':
      return (
        <div
          style={{
            position: 'relative',
            aspectRatio: '16/9',
            background: tokens.bgContainer,
            margin: '40px 0',
            border: `1px solid ${tokens.outlineVariant}30`,
          }}
        >
          {(block.pins || []).map((p, i) => (
            <div
              key={i}
              title={p.label}
              style={{
                position: 'absolute',
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: tokens.ink,
                transform: 'translate(-50%,-50%)',
              }}
            />
          ))}
        </div>
      );

    case 'video':
      return (
        <div
          style={{
            aspectRatio: '16/9',
            background: '#0a0a0a',
            margin: '40px 0',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 20,
            }}
          >
            ▶
          </div>
        </div>
      );

    case 'newsletter':
      return (
        <div
          style={{
            margin: '48px 0',
            padding: '40px',
            background: tokens.ink,
            color: '#fff',
          }}
        >
          <div style={{ ...label, color: tokens.gold, marginBottom: 12 }}>Newsletter</div>
          <h3
            style={{
              fontFamily: tokens.fontDisplay,
              fontSize: 28,
              fontWeight: 400,
              fontStyle: 'italic',
              margin: '0 0 12px',
              color: '#fff',
            }}
          >
            {block.title}
          </h3>
          <p style={{ fontFamily: tokens.fontBody, fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)', margin: '0 0 24px' }}>
            {block.body}
          </p>
          <div style={{ display: 'flex', gap: 0 }}>
            <input
              type="email"
              placeholder="your@email.com"
              style={{
                flex: 1,
                padding: '10px 16px',
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.4)',
                background: 'transparent',
                color: '#fff',
                fontFamily: tokens.fontBody,
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              type="button"
              style={{
                padding: '10px 24px',
                background: tokens.gold,
                color: tokens.ink,
                border: 'none',
                fontFamily: tokens.fontBody,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                cursor: 'pointer',
              }}
            >
              Subscribe
            </button>
          </div>
        </div>
      );

    default:
      return null;
  }
};

// ─── Props ────────────────────────────────────────────────────────────────────
export interface ReadBlogProps {
  post: Post;
  layout?: 'magazine' | 'listicle' | 'essay';
  displayFont?: 'serif' | 'sans';
}

// ─── ReadBlog Component ───────────────────────────────────────────────────────
const ReadBlog: React.FC<ReadBlogProps> = ({
  post,
  layout = 'magazine',
  displayFont = 'serif',
}) => {
  const [progress, setProgress] = useState(0);
  const [activeToc, setActiveToc] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? (el.scrollTop / max) * 100 : 0);
      const entries = el.querySelectorAll('[id^="n-"]');
      let best = 0;
      entries.forEach((entry, i) => {
        if ((entry as HTMLElement).getBoundingClientRect().top < 200) best = i;
      });
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

  const formattedDate = new Date(post.publishDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: '2-digit',
  });

  // Track which p block is first for drop cap
  let firstPIndex = -1;
  post.blocks.forEach((b, i) => {
    if (b.type === 'p' && firstPIndex === -1) firstPIndex = i;
  });

  return (
    <div
      ref={ref}
      data-layout={layout}
      data-display-font={displayFont}
      style={{
        height: '100%',
        overflow: 'auto',
        background: tokens.bg,
        fontFamily: tokens.fontBody,
        color: tokens.ink,
      }}
    >
      <FontLoader />

      {/* ── Reading progress bar ── */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 2,
          background: tokens.outlineVariant,
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: tokens.gold,
            transition: 'width .1s linear',
          }}
        />
      </div>

      {/* ── Cinematic Hero ── */}
      <section
        style={{
          position: 'relative',
          height: '85vh',
          minHeight: 480,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          overflow: 'hidden',
        }}
      >
        {/* Hero bg */}
        {post.cover?.src && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img
              src={post.cover.src}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}
        {/* Gradient */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            background:
              'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
          }}
        />

        {/* Hero content */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            padding: '0 clamp(24px, 5vw, 80px) 48px',
            maxWidth: 1600,
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Top: 12-col grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(12,1fr)',
              gap: 24,
              alignItems: 'flex-end',
            }}
          >
            {/* Left: category + title */}
            <div style={{ gridColumn: 'span 8' }}>
              <div
                style={{
                  ...label,
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: 16,
                }}
              >
                {post.categories[0] || 'Travel'}
              </div>
              <h1
                style={{
                  fontFamily: tokens.fontDisplay,
                  fontSize: 'clamp(28px, 5vw, 68px)',
                  fontWeight: 400,
                  lineHeight: 1.08,
                  letterSpacing: '-0.02em',
                  color: '#fff',
                  margin: '0 0 0',
                }}
              >
                {post.title}
              </h1>
            </div>

            {/* Right: author chip + engagement */}
            <div
              style={{
                gridColumn: 'span 4',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                alignItems: 'flex-end',
              }}
            >
              {/* Author chip */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: 'rgba(0,0,0,0.45)',
                  backdropFilter: 'blur(8px)',
                  padding: '12px 16px',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.2)',
                    flexShrink: 0,
                    background: 'rgba(255,255,255,0.1)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    backgroundImage: post.author.avatar ? `url(${post.author.avatar})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'grayscale(1)',
                  }}
                >
                  {!post.author.avatar && post.author.initials}
                </div>
                <div style={{ color: '#fff', flex: 1 }}>
                  <div style={{ ...label, fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>
                    Curated by
                  </div>
                  <div style={{ fontFamily: tokens.fontBody, fontSize: 13, fontWeight: 600 }}>
                    {post.author.name}
                  </div>
                </div>
                <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.2)' }} />
                <div style={{ color: '#fff', textAlign: 'right' }}>
                  <div style={{ ...label, fontSize: 9, color: 'rgba(255,255,255,0.5)', marginBottom: 2 }}>
                    Date
                  </div>
                  <div style={{ fontFamily: tokens.fontBody, fontSize: 13, fontWeight: 600 }}>
                    {formattedDate}
                  </div>
                </div>
              </div>

              {/* Engagement row */}
              <div style={{ display: 'flex', gap: 24, color: '#fff' }}>
                {[
                  { icon: '♥', label: 'LIKE' },
                  { icon: '🔖', label: 'SAVE' },
                  { icon: '↑', label: 'SHARE' },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      ...label,
                      fontSize: 10,
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

      {/* Optional cover caption */}
      {post.cover?.caption && (
        <div
          style={{
            ...label,
            textAlign: 'center',
            padding: '10px 24px',
            color: tokens.outline,
            borderBottom: `1px solid ${tokens.outlineVariant}20`,
          }}
        >
          {post.cover.caption}
        </div>
      )}

      {/* ── Body ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: hasToc ? '220px 1fr' : '1fr',
          gap: 48,
          maxWidth: 1060,
          margin: '0 auto',
          padding: '64px 24px 80px',
          alignItems: 'start',
          boxSizing: 'border-box',
        }}
      >
        {/* Sidebar TOC */}
        {hasToc && (
          <aside
            style={{
              position: 'sticky',
              top: 24,
              background: tokens.bgDim,
              border: `1px solid ${tokens.outlineVariant}30`,
              padding: '20px 18px',
            }}
          >
            <div style={{ ...label, marginBottom: 16 }}>In this article</div>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 2 }}>
              {numlistBlock?.items?.map((it: any, i: number) => (
                <li
                  key={i}
                  onClick={() => scrollTo(i)}
                  style={{
                    fontFamily: tokens.fontBody,
                    fontSize: 13,
                    padding: '8px 10px',
                    cursor: 'pointer',
                    fontWeight: i === activeToc ? 600 : 400,
                    color: i === activeToc ? tokens.ink : tokens.inkMuted,
                    background: i === activeToc ? tokens.goldSoft : 'transparent',
                    borderLeft: i === activeToc ? `2px solid ${tokens.gold}` : '2px solid transparent',
                    transition: 'all .15s',
                  }}
                >
                  <span
                    style={{
                      opacity: 0.45,
                      fontSize: 10,
                      marginRight: 8,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {it.title}
                </li>
              ))}
            </ol>
          </aside>
        )}

        {/* Main article */}
        <article style={{ minWidth: 0 }}>
          {post.blocks.map((block, idx) => (
            <PubBlock key={block.id} block={block} isFirst={idx === firstPIndex} />
          ))}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div
              style={{
                marginTop: 56,
                paddingTop: 24,
                borderTop: `1px solid ${tokens.outlineVariant}20`,
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    ...label,
                    fontSize: 10,
                    padding: '6px 16px',
                    border: `1px solid ${tokens.outlineVariant}`,
                    color: tokens.outline,
                    cursor: 'pointer',
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
              marginTop: 32,
              padding: '20px 0',
              borderTop: `1px solid ${tokens.outlineVariant}20`,
              borderBottom: `1px solid ${tokens.outlineVariant}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', gap: 24 }}>
              {[
                { icon: '♥', text: 'Like' },
                { icon: '🔖', text: 'Save' },
                { icon: '↑', text: 'Share' },
              ].map((btn) => (
                <button
                  key={btn.text}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    ...label,
                    fontSize: 10,
                    color: tokens.outline,
                  }}
                >
                  <span>{btn.icon}</span>
                  <span>{btn.text}</span>
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 24 }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ ...label, fontSize: 9, color: tokens.outlineVariant, marginBottom: 2 }}>
                  Series
                </div>
                <div style={{ fontFamily: tokens.fontBody, fontSize: 13, fontStyle: 'italic' }}>
                  {post.categories[1] || post.categories[0] || '—'}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ ...label, fontSize: 9, color: tokens.outlineVariant, marginBottom: 2 }}>
                  Reading time
                </div>
                <div style={{ fontFamily: tokens.fontBody, fontSize: 13 }}>{post.readingTime} min</div>
              </div>
            </div>
          </div>

          {/* Author bio card */}
          <div
            style={{
              marginTop: 40,
              padding: '28px 32px',
              background: tokens.bgDim,
              borderTop: `3px solid ${tokens.gold}`,
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
                border: `1px solid ${tokens.outlineVariant}`,
                background: tokens.bgContainer,
                backgroundImage: post.author.avatar ? `url(${post.author.avatar})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'grid',
                placeItems: 'center',
                color: tokens.ink,
                fontSize: 14,
                fontWeight: 700,
                filter: 'grayscale(1)',
              }}
            >
              {!post.author.avatar && post.author.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ ...label, fontSize: 9, color: tokens.outlineVariant, marginBottom: 6 }}>
                Written by
              </div>
              <div
                style={{
                  fontFamily: tokens.fontDisplay,
                  fontSize: 18,
                  fontWeight: 400,
                  color: tokens.ink,
                  marginBottom: 2,
                }}
              >
                {post.author.name}
              </div>
              <div style={{ fontFamily: tokens.fontBody, fontSize: 13, color: tokens.inkMuted }}>
                {post.author.role}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ReadBlog;
