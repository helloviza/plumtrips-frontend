import React, { useEffect, useRef, useState } from 'react';
import type { Post } from '../../lib/api';
import type { PostBlock } from '../../pages/marketing/blogs.model';

// ─── Published Block Renderer ─────────────────────────────────────────────────
const PubBlock: React.FC<{ block: PostBlock }> = ({ block }) => {
  switch (block.type) {
    case 'h1':
      return (
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 500, margin: '40px 0 16px' }}>
          {block.text}
        </h1>
      );
    case 'h2':
      return <h2 id={`s-${block.id}`}>{block.text}</h2>;
    case 'h3':
      return <h3 id={`s-${block.id}`}>{block.text}</h3>;
    case 'p':
      return <p>{block.text}</p>;
    case 'quote':
      return (
        <blockquote>
          {block.text}
          {block.cite && <cite>{block.cite}</cite>}
        </blockquote>
      );
    case 'image':
    case 'cover':
      return (
        <figure>
          {block.src ? (
            <img src={block.src} alt={block.caption || ''} />
          ) : (
            <div
              style={{
                aspectRatio: '16/9',
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3,1fr)',
            gap: 8,
            margin: '32px 0',
          }}
        >
          {(block.images || []).map((src, i) => (
            <div
              key={i}
              style={{
                aspectRatio: '1',
                borderRadius: 10,
                overflow: 'hidden',
                background: 'var(--paper-2)',
              }}
            >
              {src && (
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
          ))}
        </div>
      );
    case 'numlist':
      return (
        <div className="pub-numlist">
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
        <div className="pub-hotel">
          <div className="h-img">
            {block.img && <img src={block.img} alt={block.name} loading="lazy" />}
          </div>
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
        <div className="pub-map">
          {(block.pins || []).map((p, i) => (
            <div
              key={i}
              className="pin"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              title={p.label}
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
            borderRadius: 12,
            display: 'grid',
            placeItems: 'center',
            margin: '32px 0',
            color: '#fff',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'grid',
              placeItems: 'center',
            }}
          >
            ▶
          </div>
        </div>
      );
    case 'newsletter':
      return (
        <div className="pub-newsletter">
          <h3>{block.title}</h3>
          <p>{block.body}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="email" placeholder="your@email.com" />
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
      const entries = el.querySelectorAll('.pub-numlist .nentry');
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
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="pub"
      data-layout={layout}
      data-display-font={displayFont}
      ref={ref}
      style={{ height: '100%', overflow: 'auto', background: 'var(--paper, #fff)' }}
    >
      {/* Reading progress bar */}
      <div
        className="pub-progress"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 3,
          background: 'var(--line-2, #eee)',
        }}
      >
        <div
          className="bar"
          style={{
            width: `${progress}%`,
            height: '100%',
            background: 'var(--accent, #c8943a)',
            transition: 'width .1s linear',
          }}
        />
      </div>

      {/* ── Hero Section ── */}
      <div
        style={{
          position: 'relative',
          minHeight: 520,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          overflow: 'hidden',
        }}
      >
        {/* Hero background image */}
        {post.cover?.src && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <img
              src={post.cover.src}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Gradient overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.18) 30%, rgba(0,0,0,0.72) 80%, rgba(0,0,0,0.85) 100%)',
              }}
            />
          </div>
        )}

        {/* Hero text content */}
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '60px 32px 40px',
            maxWidth: 820,
            margin: '0 auto',
            width: '100%',
          }}
        >
          {/* Categories */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              alignItems: 'center',
              marginBottom: 20,
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '.18em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.7)',
                background: 'rgba(255,255,255,0.12)',
                padding: '4px 12px',
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              {post.categories[0] || 'Travel'}
            </span>
            {post.categories.slice(1).map((c) => (
              <span
                key={c}
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                · {c}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: 'var(--font-display, Georgia, serif)',
              fontSize: 'clamp(28px, 5vw, 52px)',
              fontWeight: 600,
              lineHeight: 1.12,
              color: '#fff',
              margin: '0 0 16px',
              textShadow: '0 2px 16px rgba(0,0,0,0.3)',
            }}
          >
            {post.title}
          </h1>

          {/* Subtitle */}
          {post.subtitle && (
            <p
              style={{
                fontSize: 'clamp(14px, 2vw, 18px)',
                color: 'rgba(255,255,255,0.82)',
                margin: '0 0 28px',
                fontStyle: 'italic',
                maxWidth: 600,
                lineHeight: 1.5,
              }}
            >
              {post.subtitle}
            </p>
          )}

          {/* Author + meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundImage: post.author.avatar ? `url(${post.author.avatar})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '2px solid rgba(255,255,255,0.4)',
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {!post.author.avatar && post.author.initials}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{post.author.name}</div>
              <div
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.6)',
                  letterSpacing: '.08em',
                  textTransform: 'uppercase',
                }}
              >
                {post.author.role}
              </div>
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
        <div
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: 'var(--muted, #999)',
            padding: '8px 24px',
            fontStyle: 'italic',
            borderBottom: '1px solid var(--line-2, #eee)',
          }}
        >
          {post.cover.caption}
        </div>
      )}

      {/* ── Body ── */}
      <div
        className="pub-body"
        style={{
          display: 'grid',
          gridTemplateColumns: hasToc ? '220px 1fr' : '1fr',
          gap: 48,
          maxWidth: 1060,
          margin: '0 auto',
          padding: '48px 24px',
          alignItems: 'start',
        }}
      >
        {/* Sidebar TOC */}
        {hasToc && (
          <aside
            className="pub-toc"
            style={{
              position: 'sticky',
              top: 24,
              background: 'var(--paper-2, #f9f6f1)',
              border: '1px solid var(--line-2, #ece9e2)',
              borderRadius: 14,
              padding: '20px 18px',
            }}
          >
            <h6
              style={{
                fontSize: 10,
                letterSpacing: '.16em',
                textTransform: 'uppercase',
                color: 'var(--muted, #999)',
                margin: '0 0 14px',
                fontWeight: 700,
              }}
            >
              In this article
            </h6>
            <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 4 }}>
              {numlistBlock?.items?.map((it: any, i: number) => (
                <li
                  key={i}
                  onClick={() => scrollTo(i)}
                  style={{
                    fontSize: 13,
                    padding: '7px 10px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontWeight: i === activeToc ? 600 : 400,
                    color:
                      i === activeToc ? 'var(--accent, #c8943a)' : 'var(--ink-2, #555)',
                    background:
                      i === activeToc
                        ? 'var(--accent-soft, rgba(200,148,58,0.08))'
                        : 'transparent',
                    borderLeft:
                      i === activeToc
                        ? '2px solid var(--accent, #c8943a)'
                        : '2px solid transparent',
                    transition: 'all .15s',
                  }}
                >
                  <span
                    style={{
                      opacity: 0.5,
                      fontSize: 11,
                      marginRight: 6,
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
        <article className="pub-content" style={{ minWidth: 0 }}>
          {post.blocks.map((block) => (
            <PubBlock key={block.id} block={block} />
          ))}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div
              style={{
                marginTop: 48,
                paddingTop: 24,
                borderTop: '1px solid var(--line-2, #eee)',
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 12,
                    padding: '5px 14px',
                    borderRadius: 999,
                    background: 'var(--paper-2, #f5f2ec)',
                    color: 'var(--ink-2, #666)',
                    border: '1px solid var(--line-2, #ece9e2)',
                    letterSpacing: '.04em',
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Author bio card */}
          <div
            style={{
              marginTop: 40,
              padding: '24px 28px',
              borderRadius: 16,
              background: 'var(--paper-2, #f9f6f1)',
              border: '1px solid var(--line-2, #ece9e2)',
              display: 'flex',
              gap: 20,
              alignItems: 'flex-start',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                flexShrink: 0,
                backgroundImage: post.author.avatar ? `url(${post.author.avatar})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: 'var(--line-2, #ddd)',
                display: 'grid',
                placeItems: 'center',
                color: 'var(--ink, #333)',
                fontSize: 16,
                fontWeight: 700,
                border: '2px solid var(--line-2, #ddd)',
              }}
            >
              {!post.author.avatar && post.author.initials}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: '.12em',
                  textTransform: 'uppercase',
                  color: 'var(--muted, #999)',
                  marginBottom: 4,
                  fontWeight: 600,
                }}
              >
                Written by
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink, #1a1a1a)', marginBottom: 2 }}>
                {post.author.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-2, #666)' }}>{post.author.role}</div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

export default ReadBlog;