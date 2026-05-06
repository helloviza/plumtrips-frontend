import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Post } from '../../lib/api';
import type { PostBlock } from './blogs.model';
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

const makeId = () => `b${Math.random().toString(36).slice(2, 10)}`;

const defaultBlock = (type: BlockType): PostBlock => {
  switch (type) {
    case 'h1': case 'h2': case 'h3': case 'p':
      return { id: makeId(), type, text: '' };
    case 'quote':
      return { id: makeId(), type, text: '', cite: '' };
    case 'image': case 'cover':
      return { id: makeId(), type, src: '', caption: '' };
    case 'gallery':
      return { id: makeId(), type, images: [] };
    case 'numlist':
      return { id: makeId(), type, items: [{ n: 1, title: 'Example item', loc: '', body: '', img: '' }] };
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

const createEmptyPost = (): Omit<Post, 'id'> => {
  const timestamp = `${Date.now()}`;
  return {
    title: `Untitled blog ${timestamp}`,
    subtitle: 'Add a subtitle',
    slug: `untitled-blog-${timestamp}`,
    excerpt: 'Add your excerpt here.',
    cover: { src: 'https://placehold.co/1200x630', caption: 'Cover image caption' },
    author: { name: 'Author Name', role: 'Contributor', initials: 'AN', avatar: 'https://placehold.co/100x100' },
    categories: ['Journal'],
    tags: ['blog'],
    readingTime: 1,
    publishDate: new Date().toISOString().slice(0, 10),
    status: 'draft',
    featured: false,
    seo: { title: '', description: '', ogImage: 'https://placehold.co/1200x630' },
    blocks: [defaultBlock('p')],
    related: [],
  };
};

// ─── Block Editor ─────────────────────────────────────────────────────────────
const BlogBlockEditor: React.FC<{
  block: PostBlock;
  onChange: (value: PostBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDuplicate: () => void;
}> = ({ block, onChange, onDelete, onMoveUp, onMoveDown, onDuplicate }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTargetField, setUploadTargetField] = useState<string>('src');

  const updateField = (field: string, value: any) => onChange({ ...block, [field]: value });
  const updateItems = (items: any[]) => updateField('items', items);
  const updatePins = (pins: any[]) => updateField('pins', pins);

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

  const triggerUpload = (fieldName: string) => {
    setUploadTargetField(fieldName);
    fileInputRef.current?.click();
  };

  return (
    <div className="block-editor" style={{ border: '1px solid #ddd', borderRadius: 12, padding: 16, marginBottom: 16, background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <strong>{block.type.toUpperCase()}</strong>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-sm" onClick={onMoveUp}>↑</button>
          <button type="button" className="btn btn-sm" onClick={onMoveDown}>↓</button>
          <button type="button" className="btn btn-sm" onClick={onDuplicate}>⎘</button>
          <button type="button" className="btn btn-sm" onClick={onDelete}>✕</button>
        </div>
      </div>

      {['h1', 'h2', 'h3', 'p'].includes(block.type) && (
        <textarea style={{ width: '100%', minHeight: 80, marginBottom: 12 }} value={block.text || ''} onChange={(e) => updateField('text', e.target.value)} placeholder="Block text" />
      )}

      {block.type === 'quote' && (
        <>
          <textarea style={{ width: '100%', minHeight: 80, marginBottom: 12 }} value={block.text || ''} onChange={(e) => updateField('text', e.target.value)} placeholder="Quote text" />
          <input style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={block.cite || ''} onChange={(e) => updateField('cite', e.target.value)} placeholder="Quote credit" />
        </>
      )}

      {(block.type === 'image' || block.type === 'cover') && (
        <>
          <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} style={{ display: 'none' }} />
              <button type="button" className="btn btn-sm" onClick={() => triggerUpload('src')} disabled={uploading} style={{ backgroundColor: uploading ? '#ccc' : '#007bff', color: 'white' }}>
                {uploading ? '⏳ Uploading...' : '📤 Upload Image'}
              </button>
              {block.src && <span style={{ fontSize: 12, color: '#666' }}>✓ Image uploaded</span>}
            </div>
          </div>
          <textarea style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid #ddd', minHeight: 60, fontSize: 12 }} value={block.src || ''} onChange={(e) => updateField('src', e.target.value)} placeholder="Or paste image URL directly" disabled={uploading} />
          {block.src && (
            <div style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', maxHeight: 300, backgroundColor: '#f5f5f5' }}>
              <img src={block.src} alt="Preview" style={{ width: '100%', maxHeight: 300, objectFit: 'cover' }} />
            </div>
          )}
          <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={block.caption || ''} onChange={(e) => updateField('caption', e.target.value)} placeholder="Caption" disabled={uploading} />
        </>
      )}

      {block.type === 'gallery' && (
        <textarea style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={(block.images || []).join('\n')} onChange={(e) => updateField('images', e.target.value.split('\n').map((v) => v.trim()).filter(Boolean))} placeholder="One image URL per line" />
      )}

      {block.type === 'numlist' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {(block.items || []).map((item, index) => (
            <div key={index} style={{ border: '1px solid #eee', padding: 12, borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <strong>Entry {index + 1}</strong>
                <button type="button" className="btn btn-xs" onClick={() => updateItems((block.items || []).filter((_, i) => i !== index))}>Remove</button>
              </div>
              {['title', 'loc', 'img'].map((field) => (
                <input key={field} style={{ width: '100%', marginBottom: 8, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={(item as any)[field] || ''} onChange={(e) => { const next = [...(block.items || [])]; next[index] = { ...next[index], [field]: e.target.value }; updateItems(next); }} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} />
              ))}
              <textarea style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={item.body || ''} onChange={(e) => { const next = [...(block.items || [])]; next[index] = { ...next[index], body: e.target.value }; updateItems(next); }} placeholder="Body text" />
            </div>
          ))}
          <button type="button" className="btn btn-sm" onClick={() => updateItems([...(block.items || []), { n: (block.items || []).length + 1, title: '', loc: '', body: '', img: '' }])}>Add list entry</button>
        </div>
      )}

      {block.type === 'hotel' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {(['kicker', 'name', 'loc', 'price', 'nights'] as const).map((field) => (
            <input key={field} style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={(block as any)[field] || ''} onChange={(e) => updateField(field, e.target.value)} placeholder={field.charAt(0).toUpperCase() + field.slice(1)} />
          ))}
          <textarea style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={block.desc || ''} onChange={(e) => updateField('desc', e.target.value)} placeholder="Description" />
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button type="button" className="btn btn-sm" onClick={() => triggerUpload('img')} disabled={uploading} style={{ backgroundColor: uploading ? '#ccc' : '#007bff', color: 'white' }}>
                {uploading ? '⏳ Uploading...' : '📤 Upload Hotel Image'}
              </button>
              {block.img && <span style={{ fontSize: 12, color: '#666' }}>✓ Image uploaded</span>}
            </div>
            <textarea style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd', minHeight: 60, fontSize: 12 }} value={block.img || ''} onChange={(e) => updateField('img', e.target.value)} placeholder="Or paste image URL directly" disabled={uploading} />
            {block.img && <div style={{ borderRadius: 8, overflow: 'hidden', maxHeight: 200 }}><img src={block.img} alt="Hotel preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover' }} /></div>}
          </div>
        </div>
      )}

      {block.type === 'map' && (
        <div style={{ display: 'grid', gap: 12 }}>
          {(block.pins || []).map((pin, index) => (
            <div key={index} style={{ display: 'grid', gap: 8, border: '1px solid #eee', padding: 10, borderRadius: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>Pin {index + 1}</strong>
                <button type="button" className="btn btn-xs" onClick={() => updatePins((block.pins || []).filter((_, i) => i !== index))}>Remove</button>
              </div>
              <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={pin.label || ''} onChange={(e) => { const next = [...(block.pins || [])]; next[index] = { ...next[index], label: e.target.value }; updatePins(next); }} placeholder="Label" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {(['x', 'y'] as const).map((axis) => (
                  <input key={axis} style={{ padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={String(pin[axis] ?? '')} onChange={(e) => { const next = [...(block.pins || [])]; next[index] = { ...next[index], [axis]: Number(e.target.value) }; updatePins(next); }} placeholder={`${axis.toUpperCase()} %`} />
                ))}
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-sm" onClick={() => updatePins([...(block.pins || []), { x: 50, y: 50, label: 'New pin' }])}>Add pin</button>
        </div>
      )}

      {block.type === 'video' && (
        <input style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={block.url || ''} onChange={(e) => updateField('url', e.target.value)} placeholder="Video URL" />
      )}

      {block.type === 'newsletter' && (
        <>
          <input style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={block.title || ''} onChange={(e) => updateField('title', e.target.value)} placeholder="Newsletter title" />
          <textarea style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={block.body || ''} onChange={(e) => updateField('body', e.target.value)} placeholder="Newsletter body" />
        </>
      )}
    </div>
  );
};

// ─── Published Block Renderer ─────────────────────────────────────────────────
const PubBlock: React.FC<{ block: PostBlock }> = ({ block }) => {
  switch (block.type) {
    case 'h1': return <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 500, margin: '40px 0 16px' }}>{block.text}</h1>;
    case 'h2': return <h2 id={`s-${block.id}`}>{block.text}</h2>;
    case 'h3': return <h3 id={`s-${block.id}`}>{block.text}</h3>;
    case 'p': return <p>{block.text}</p>;
    case 'quote':
      return <blockquote>{block.text}{block.cite && <cite>{block.cite}</cite>}</blockquote>;
    case 'image': case 'cover':
      return (
        <figure>
          {block.src ? <img src={block.src} alt={block.caption || ''} /> : <div style={{ aspectRatio: '16/9', background: 'var(--paper-2)', borderRadius: 12, border: '1px dashed var(--line-2)' }} />}
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    case 'gallery':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, margin: '32px 0' }}>
          {(block.images || []).map((src, i) => (
            <div key={i} style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: 'var(--paper-2)' }}>
              {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
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
        <div className="pub-map">
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
        <div className="pub-newsletter">
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

// ─── Blog Post View ───────────────────────────────────────────────────────────
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

  return (
    <div className="pub" data-layout={layout} data-display-font={displayFont} ref={ref} style={{ height: '100%', overflow: 'auto' }}>
      <div className="pub-progress"><div className="bar" style={{ width: `${progress}%` }} /></div>
      <nav className="pub-nav">
        <div className="brand"><span className="mark">P</span> Plumtrips</div>
        <div className="links"><a>Hotels</a><a>Destinations</a><a>Journal</a><a>Concierge</a></div>
        <div className="right">
          <button className="btn btn-sm">Sign in</button>
          <button className="btn btn-sm btn-primary">Plan a trip</button>
        </div>
      </nav>
      <header className="pub-hero">
        <div className="crumbs">
          <a>Journal</a><span>/</span>
          {post.categories.map((c, i) => (<React.Fragment key={c}>{i > 0 && <span> · </span>}<a>{c}</a></React.Fragment>))}
        </div>
        <h1>{post.title}</h1>
        <p className="deck">{post.subtitle}</p>
        <div className="meta">
          <div className="author">
            <div className="avatar" style={{ backgroundImage: `url(${post.author.avatar})`, backgroundSize: 'cover' }}>{!post.author.avatar && post.author.initials}</div>
            <div>
              <div style={{ fontWeight: 500 }}>{post.author.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', letterSpacing: '.12em', textTransform: 'uppercase' }}>{post.author.role}</div>
            </div>
          </div>
          <span className="sep" />
          <span>{new Date(post.publishDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span className="sep" />
          <span>{post.readingTime} min read</span>
        </div>
      </header>
      {post.cover && (
        <div className="pub-cover">
          <div className="frame">{post.cover.src && <img src={post.cover.src} alt="" />}</div>
          {post.cover.caption && <div className="cap">{post.cover.caption}</div>}
        </div>
      )}
      <div className="pub-body">
        {hasToc && (
          <aside className="pub-toc">
            <h6>In this article</h6>
            <ol>
              {numlistBlock?.items?.map((it: any, i: number) => (
                <li key={i} className={i === activeToc ? 'active' : ''} onClick={() => scrollTo(i)}>{it.title}</li>
              ))}
            </ol>
          </aside>
        )}
        <article className="pub-content">
          {post.blocks.map((block) => <PubBlock key={block.id} block={block} />)}
          <div className="pub-tags">{post.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}</div>
          <div className="pub-author">
            <div className="avatar" style={{ backgroundImage: `url(${post.author.avatar})`, backgroundSize: 'cover' }} />
            <div>
              <div className="role">{post.author.role}</div>
              <h4 className="name">{post.author.name}</h4>
            </div>
          </div>
        </article>
        {layout === 'magazine' && (
          <aside className="pub-aside-r">
            <div className="share">
              <span>Share</span>
              <div className="share-btns">
                <button className="btn btn-sm">⤴</button>
                <button className="btn btn-sm">𝕏</button>
                <button className="btn btn-sm">in</button>
                <button className="btn btn-sm">✉</button>
              </div>
            </div>
          </aside>
        )}
      </div>
      <section className="pub-related">
        <h3>You might also like</h3>
        <div className="grid">
          {post.related.map((r, i) => (
            <div className="card" key={i}>
              <div className="thumb" style={{ backgroundImage: `url(${r.thumb})` }} />
              <div className="cat">{r.cat}</div>
              <h4>{r.title}</h4>
              <p className="excerpt">{r.excerpt}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="pub-foot">
        <div className="inner">
          <div>
            <div className="brand"><span className="mark">P</span> Plumtrips</div>
            <p className="blurb">A members' concierge for travellers who care where they sleep, eat and wake up.</p>
          </div>
          <div><h6>Travel</h6><ul><li><a>Hotels</a></li><li><a>Destinations</a></li><li><a>Itineraries</a></li></ul></div>
          <div><h6>Read</h6><ul><li><a>Journal</a></li><li><a>Dispatch newsletter</a></li></ul></div>
          <div><h6>Plumtrips</h6><ul><li><a>Membership</a></li><li><a>About</a></li><li><a>Contact</a></li></ul></div>
        </div>
        <div className="legal"><span>© 2026 Plumtrips Ltd</span><span>Terms · Privacy · Cookies</span></div>
      </footer>
    </div>
  );
};

// ─── Blog Editor ──────────────────────────────────────────────────────────────
const BlogEditor: React.FC<{
  post: Post;
  onChange: (next: Post) => void;
  onSave: () => void;
  onPreview: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onAddBlock: (type: BlockType) => void;
  saving?: boolean;
}> = ({ post, onChange, onSave, onPreview, onCancel, onDelete, onAddBlock, saving }) => {
  const updatePost = (patch: Partial<Post>) => onChange({ ...post, ...patch });

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

  return (
    <div className="blog-editor" style={{ padding: 24, background: '#f7f7f7', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ margin: 0 }}>Edit blog</h1>
          <p style={{ margin: '8px 0 0', color: '#666' }}>Write and update the blog content, then preview the published post.</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCancel}>Back</button>
          <button type="button" className="btn btn-sm" onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
          <button type="button" className="btn btn-sm btn-primary" onClick={onPreview}>Preview</button>
          <button type="button" className="btn btn-sm" style={{ background: '#ff5c5c', color: '#fff' }} onClick={onDelete}>Delete</button>
        </div>
      </div>

      <section style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
        <input style={{ width: '100%', fontSize: 24, padding: 12, borderRadius: 12, border: '1px solid #ddd' }} value={post.title} onChange={(e) => updatePost({ title: e.target.value })} placeholder="Headline" />
        <input style={{ width: '100%', fontSize: 16, padding: 12, borderRadius: 12, border: '1px solid #ddd' }} value={post.subtitle} onChange={(e) => updatePost({ subtitle: e.target.value })} placeholder="Subtitle" />
        <textarea style={{ width: '100%', minHeight: 120, padding: 12, borderRadius: 12, border: '1px solid #ddd' }} value={post.excerpt} onChange={(e) => updatePost({ excerpt: e.target.value })} placeholder="Excerpt" />
      </section>

      <section style={{ display: 'grid', gap: 12, marginBottom: 24 }}>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
          <input value={post.slug} onChange={(e) => updatePost({ slug: e.target.value })} placeholder="Slug" style={{ padding: 12, borderRadius: 12, border: '1px solid #ddd' }} />
          <input type="date" value={post.publishDate} onChange={(e) => updatePost({ publishDate: e.target.value })} style={{ padding: 12, borderRadius: 12, border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
          <input value={post.categories.join(', ')} onChange={(e) => updatePost({ categories: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} placeholder="Categories (comma separated)" style={{ padding: 12, borderRadius: 12, border: '1px solid #ddd' }} />
          <input value={post.tags.join(', ')} onChange={(e) => updatePost({ tags: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} placeholder="Tags (comma separated)" style={{ padding: 12, borderRadius: 12, border: '1px solid #ddd' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <select value={post.status} onChange={(e) => updatePost({ status: e.target.value as Post['status'] })} style={{ padding: 12, borderRadius: 12, border: '1px solid #ddd' }}>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <input value={post.cover?.src || ''} onChange={(e) => updatePost({ cover: { src: e.target.value, caption: post.cover?.caption || '' } })} placeholder="Cover image URL" style={{ padding: 12, borderRadius: 12, border: '1px solid #ddd' }} />
          <input value={post.cover?.caption || ''} onChange={(e) => updatePost({ cover: { caption: e.target.value, src: post.cover?.src || '' } })} placeholder="Cover caption" style={{ padding: 12, borderRadius: 12, border: '1px solid #ddd' }} />
        </div>
      </section>

      <section style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
        <h2 style={{ margin: 0 }}>SEO & metadata</h2>
        <input value={post.seo.title} onChange={(e) => updatePost({ seo: { ...post.seo, title: e.target.value } })} placeholder="SEO title" style={{ padding: 12, borderRadius: 12, border: '1px solid #ddd' }} />
        <textarea style={{ width: '100%', minHeight: 80, padding: 12, borderRadius: 12, border: '1px solid #ddd' }} value={post.seo.description} onChange={(e) => updatePost({ seo: { ...post.seo, description: e.target.value } })} placeholder="SEO description" />
        <input value={post.seo.ogImage} onChange={(e) => updatePost({ seo: { ...post.seo, ogImage: e.target.value } })} placeholder="OG image URL" style={{ padding: 12, borderRadius: 12, border: '1px solid #ddd' }} />
      </section>

      <section style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0 }}>Content blocks</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {BLOCK_LIBRARY.map((b) => (
              <button key={b.type} type="button" className="btn btn-xs" onClick={() => onAddBlock(b.type)} style={{ whiteSpace: 'nowrap' }}>+ {b.label}</button>
            ))}
          </div>
        </div>
        {post.blocks.map((block) => (
          <BlogBlockEditor
            key={block.id}
            block={block}
            onChange={(next) => updateBlock(block.id, next)}
            onDelete={() => deleteBlock(block.id)}
            onMoveUp={() => moveBlock(block.id, -1)}
            onMoveDown={() => moveBlock(block.id, 1)}
            onDuplicate={() => duplicateBlock(block.id)}
          />
        ))}
      </section>
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
  // postsState always holds normalized posts (id guaranteed from _id)
  const [postsState, setPostsState] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // KEY FIX: store the actual post object being edited/viewed, not just an ID
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>(showListView ? 'list' : 'preview');

  // ── Load posts on mount ──
  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getBlogs();
      if (response.success) {
        // Normalize: ensure every post has .id from MongoDB _id
        const normalized = response.data.posts.map(normalizePost);
        setPostsState(normalized);
      }
    } catch (err) {
      setError(mapErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // If posts are passed as props (e.g. from a parent), normalize and use them
  useEffect(() => {
    if (propPosts.length > 0) {
      setPostsState(propPosts.map(normalizePost));
    }
  }, [propPosts]);

  // ── Open a post for reading or editing ──
  // KEY FIX: store the whole post object so we never lose it
  const openPost = (post: Post, mode: ViewMode) => {
    setActivePost(post);
    setViewMode(mode);
    if (mode === 'preview') onPostClick?.(post);
  };

  // ── Create a new post ──
  const createPost = async () => {
    setError(null);
    try {
      const response = await createBlog(createEmptyPost());
      if (response.success) {
        const normalized = normalizePost(response.data);
        setPostsState((prev) => [normalized, ...prev]);
        // KEY FIX: set the full object immediately so editor has it
        setActivePost(normalized);
        setViewMode('editor');
      }
    } catch (err) {
      setError(mapErrorMessage(err));
    }
  };

  // ── Local-first update: update activePost state immediately, then sync to server ──
  const handlePostChange = (next: Post) => {
    // Update the active post for immediate UI responsiveness
    setActivePost(next);
    // Also keep the list in sync
    setPostsState((prev) => prev.map((p) => (p.id === next.id ? next : p)));
  };

  // ── Save post to server ──
  const savePost = async (post?: Post) => {
    const target = post ?? activePost;
    if (!target?.id) return;
    setSaving(true);
    try {
      const response = await updateBlog(target.id, target);
      if (response.success) {
        const normalized = normalizePost(response.data);
        setPostsState((prev) => prev.map((p) => (p.id === normalized.id ? normalized : p)));
        setActivePost(normalized);
      }
    } catch (err) {
      console.error('Failed to save blog:', err);
      setError(mapErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Delete post ──
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

  // ── Add block to active post ──
  const addBlock = (type: BlockType) => {
    if (!activePost) return;
    const newBlock = defaultBlock(type);
    const updated = { ...activePost, blocks: [...activePost.blocks, newBlock] };
    handlePostChange(updated);
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (viewMode === 'editor' && activePost) {
    return (
      <BlogEditor
        post={activePost}
        onChange={handlePostChange}
        onSave={async () => {
          await savePost(activePost);
          setViewMode('list');
        }}
        onPreview={() => {
          // Auto-save then preview
          savePost(activePost);
          setViewMode('preview');
        }}
        onCancel={() => {
          savePost(activePost); // save on back
          setViewMode('list');
        }}
        onDelete={() => { if (activePost.id) deletePost(activePost.id); }}
        onAddBlock={addBlock}
        saving={saving}
      />
    );
  }

  if (viewMode === 'preview' && activePost) {
    return (
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 1000, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-sm" onClick={() => setViewMode('list')}>← Back to list</button>
          <button type="button" className="btn btn-sm btn-primary" onClick={() => setViewMode('editor')}>Edit post</button>
        </div>
        <div style={{ paddingTop: 80 }}>
          <BlogPostView post={activePost} layout={layout} displayFont={displayFont} />
        </div>
      </div>
    );
  }

  // Default: list view
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