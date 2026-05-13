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
      if (fileRef.current) fileRef.current.value='';
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

  const blockTypeLabel: Record<string, string> = {
    h1: 'Heading 1', h2: 'Heading 2', h3: 'Heading 3', p: 'Paragraph',
    quote: 'Pull Quote', image: 'Image', cover: 'Cover Image',
    gallery: 'Gallery', numlist: 'Numbered List', hotel: 'Hotel Card',
    map: 'Map', video: 'Video', newsletter: 'Newsletter',
  };

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

      {['h1', 'h2', 'h3', 'p'].includes(block.type) && (
        <textarea style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={block.text || ''} onChange={(e) => updateField('text', e.target.value)} placeholder="Block text" />
      )}

      {block.type === 'quote' && (
        <>
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Quote text</label>
          <textarea style={{ width: '100%', minHeight: 80, marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={block.text || ''} onChange={(e) => updateField('text', e.target.value)} placeholder="Quote text" />
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Attribution / credit</label>
          <input style={{ width: '100%', marginBottom: 12, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={block.cite || ''} onChange={(e) => updateField('cite', e.target.value)} placeholder="— Person Name" />
        </>
      )}

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
          <label style={{ fontSize: 12, fontWeight: 600, color: '#555', display: 'block', marginBottom: 4 }}>Image URLs (one per line)</label>
          <textarea style={{ width: '100%', minHeight: 80, padding: 10, borderRadius: 8, border: '1px solid #ddd' }} value={(block.images || []).join('\n')} onChange={(e) => updateField('images', e.target.value.split('\n').map((v) => v.trim()).filter(Boolean))} placeholder="https://example.com/photo1.jpg&#10;https://example.com/photo2.jpg" />
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
const PubBlock: React.FC<{ block: PostBlock }> = ({ block }) => {
  switch (block.type) {
    case 'h1':
      return (
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600, color: 'var(--ink)', margin: '36px 0 12px', lineHeight: 1.25 }}>
          {block.text}
        </h1>
      );
    case 'h2':
      return (
        <h2 id={`s-${block.id}`} style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'var(--ink)', margin: '36px 0 12px', paddingBottom: 10, borderBottom: '2px solid var(--accent-soft)' }}>
          {block.text}
        </h2>
      );
    case 'h3':
      return (
        <h3 id={`s-${block.id}`} style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', margin: '24px 0 8px' }}>
          {block.text}
        </h3>
      );
    case 'p':
      return <p style={{ fontSize: 16, lineHeight: 1.85, color: '#333', marginBottom: 22 }}>{block.text}</p>;
    case 'quote':
      return (
        <blockquote style={{ margin: '28px 0', padding: '16px 20px', background: 'var(--paper-2)', borderLeft: '3px solid var(--accent)', borderRadius: '0 10px 10px 0', fontStyle: 'italic', fontSize: 17, color: 'var(--ink-2)', lineHeight: 1.7 }}>
          {block.text}
          {block.cite && <cite style={{ display: 'block', marginTop: 8, fontSize: 13, fontStyle: 'normal', color: 'var(--muted)' }}>{block.cite}</cite>}
        </blockquote>
      );
    case 'image':
    case 'cover':
      return (
        <figure style={{ margin: '28px 0' }}>
          {block.src
            ? <img src={block.src} alt={block.caption || ''} style={{ width: '100%', borderRadius: 10, display: 'block' }} />
            : <div style={{ aspectRatio: '16/9', background: 'var(--paper-2)', borderRadius: 10, border: '1px dashed var(--line-2)' }} />}
          {block.caption && <figcaption style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted)', fontStyle: 'italic', marginTop: 8 }}>{block.caption}</figcaption>}
        </figure>
      );
    case 'gallery':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, margin: '28px 0' }}>
          {(block.images || []).map((src, i) => (
            <div key={i} style={{ aspectRatio: '1', borderRadius: 8, overflow: 'hidden', background: 'var(--paper-2)' }}>
              {src && <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
          ))}
        </div>
      );
    case 'numlist':
      return (
        <div style={{ display: 'grid', gap: 24, margin: '28px 0' }}>
          {(block.items || []).map((it, i) => (
            <div key={i} id={`n-${i + 1}`} style={{ display: 'grid', gridTemplateColumns: '48px 1fr', gap: 16, alignItems: 'start' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent)', color: '#fff', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {String(it.n).padStart(2, '0')}
              </div>
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{it.title}</h4>
                {it.loc && <div style={{ fontSize: 12, color: 'var(--muted)', letterSpacing: '.05em', marginBottom: 8 }}>📍 {it.loc}</div>}
                {it.img && <img src={it.img} alt={it.title} loading="lazy" style={{ width: '100%', borderRadius: 8, marginBottom: 10, maxHeight: 180, objectFit: 'cover', display: 'block' }} />}
                <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.6, margin: 0 }}>{it.body}</p>
              </div>
            </div>
          ))}
        </div>
      );
    case 'hotel':
      return (
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', border: '1px solid var(--line-2)', borderRadius: 14, overflow: 'hidden', margin: '28px 0' }}>
          <div style={{ background: 'var(--paper-2)', minHeight: 160 }}>
            {block.img && <img src={block.img} alt={block.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />}
          </div>
          <div style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6 }}>{block.kicker}</div>
            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>{block.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>{block.loc}</div>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, marginBottom: 14 }}>{block.desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent)' }}>{block.price}</span>
              <button className="btn btn-primary btn-sm" type="button">View hotel →</button>
            </div>
          </div>
        </div>
      );
    case 'map':
      return (
        <div className="pub-map" style={{ margin: '28px 0' }}>
          {(block.pins || []).map((p, i) => (
            <div key={i} className="pin" style={{ left: `${p.x}%`, top: `${p.y}%` }} title={p.label} />
          ))}
        </div>
      );
    case 'video':
      return (
        <div style={{ aspectRatio: '16/9', background: '#0a0a0a', borderRadius: 12, display: 'grid', placeItems: 'center', margin: '28px 0', color: '#fff' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'grid', placeItems: 'center' }}>▶</div>
        </div>
      );
    case 'newsletter':
      return (
        <div style={{ background: 'var(--paper-2)', border: '1px solid var(--line-2)', borderRadius: 14, padding: '28px 24px', textAlign: 'center', margin: '36px 0' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>{block.title}</h3>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', marginBottom: 18 }}>{block.body}</p>
          <div style={{ display: 'flex', gap: 8, maxWidth: 380, margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
            <input type="email" placeholder="your@email.com" style={{ flex: 1, minWidth: 180, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--line-2)', fontSize: 14 }} />
            <button className="btn btn-primary" type="button">Subscribe</button>
          </div>
        </div>
      );
    default:
      return null;
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
      const entries = el.querySelectorAll('.numlist-entry');
      let best = 0;
      entries.forEach((entry, i) => { if ((entry as HTMLElement).getBoundingClientRect().top < 200) best = i; });
      setActiveToc(best);
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const formattedDate = new Date(post.publishDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  const categories = post.categories || [];
  const breadcrumbCat = categories[0] || 'Travel';

  return (
    <div
      className="pub"
      data-layout={layout}
      data-display-font={displayFont}
      ref={ref}
      style={{ height: '100%', overflow: 'auto', background: 'var(--paper, #fff)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}
    >
      {/* Reading progress */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, height: 3, background: 'var(--line-2, #eee)' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent, #c8943a)', transition: 'width .1s linear' }} />
      </div>

      <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 20px 60px' }}>

        {/* Breadcrumb */}
        {/* <nav style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '16px 0 12px', fontSize: 12, color: 'var(--muted, #999)', flexWrap: 'wrap' }}>
          {['Home', 'Travel', breadcrumbCat].map((crumb, i) => (
            <React.Fragment key={i}>
              <span style={{ color: 'var(--muted)' }}>{crumb}</span>
              <span style={{ fontSize: 10 }}>›</span>
            </React.Fragment>
          ))}
          <span style={{ color: 'var(--ink-2, #555)', fontWeight: 500 }}>{post.title}</span>
        </nav> */}

        {/* Category pill */}
        <span style={{ display: 'inline-block', background: 'var(--accent-soft, rgba(200,148,58,0.10))', color: 'var(--accent, #c8943a)', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 999, border: '1px solid rgba(200,148,58,0.25)', marginBottom: 14 }}>
          {categories.join(' · ') || 'Travel'}
        </span>

        {/* Title */}
        <h1 style={{ fontFamily: 'var(--font-display, Georgia, serif)', fontSize: 'clamp(22px, 4vw, 36px)', fontWeight: 600, lineHeight: 1.2, color: 'var(--ink, #1a1a1a)', marginBottom: 12 }}>
          {post.title}
        </h1>

        {/* Subtitle */}
        {post.subtitle && (
          <p style={{ fontSize: 16, color: 'var(--ink-2, #555)', lineHeight: 1.6, marginBottom: 18, fontStyle: 'italic' }}>
            {post.subtitle}
          </p>
        )}

        {/* Author meta strip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderTop: '1px solid var(--line-2, #ece9e2)', borderBottom: '1px solid var(--line-2, #ece9e2)', marginBottom: 0, flexWrap: 'wrap' }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent-soft, rgba(200,148,58,0.10))', border: '2px solid var(--line-2, #ece9e2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: 'var(--accent, #c8943a)', flexShrink: 0, overflow: 'hidden', ...(post.author.avatar ? { backgroundImage: `url(${post.author.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}) }}>
            {!post.author.avatar && post.author.initials}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink, #1a1a1a)' }}>{post.author.name}</div>
            <div style={{ fontSize: 11, color: 'var(--muted, #999)', letterSpacing: '.06em', textTransform: 'uppercase' }}>{post.author.role}</div>
          </div>
          <span style={{ color: 'var(--line-2, #ddd)', fontSize: 18 }}>·</span>
          <span style={{ fontSize: 13, color: 'var(--muted, #999)' }}>📅 {formattedDate}</span>
          <span style={{ color: 'var(--line-2, #ddd)', fontSize: 18 }}>·</span>
          <span style={{ fontSize: 13, color: 'var(--muted, #999)' }}>⏱ {post.readingTime} min read</span>
          {/* <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button type="button" style={{ background: 'transparent', border: '1px solid var(--line-2, #ece9e2)', borderRadius: 999, padding: '5px 14px', fontSize: 12, color: 'var(--ink-2, #555)', cursor: 'pointer' }}>♡ Save</button>
            <button type="button" style={{ background: 'transparent', border: '1px solid var(--line-2, #ece9e2)', borderRadius: 999, padding: '5px 14px', fontSize: 12, color: 'var(--ink-2, #555)', cursor: 'pointer' }}>↗ Share</button>
          </div> */}
        </div>

        {/* Hero image */}
        {post.cover?.src && (
          <>
            <div style={{ margin: '20px 0 8px', borderRadius: 14, overflow: 'hidden' }}>
              <img src={post.cover.src} alt="" style={{ width: '100%', display: 'block', maxHeight: 440, objectFit: 'cover' }} />
            </div>
            {post.cover.caption && (
              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--muted, #999)', fontStyle: 'italic', marginBottom: 20 }}>{post.cover.caption}</p>
            )}
          </>
        )}

        {/* Article content */}
        <div style={{ fontSize: 16, lineHeight: 1.85, color: '#333' }}>
          {post.blocks.map((block) => <PubBlock key={block.id} block={block} />)}
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 24, borderTop: '1px solid var(--line-2, #ece9e2)', marginTop: 36 }}>
            {post.tags.map((tag) => (
              <span key={tag} style={{ background: 'var(--paper-2, #f9f6f1)', border: '1px solid var(--line-2, #ece9e2)', borderRadius: 999, padding: '5px 14px', fontSize: 12, color: 'var(--ink-2, #666)' }}>#{tag}</span>
            ))}
          </div>
        )}

        {/* Author bio */}
        <div style={{ display: 'flex', gap: 18, alignItems: 'flex-start', padding: '22px 24px', background: 'var(--paper-2, #f9f6f1)', border: '1px solid var(--line-2, #ece9e2)', borderRadius: 14, marginTop: 32 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-soft, rgba(200,148,58,0.10))', border: '2px solid var(--line-2, #ece9e2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: 'var(--accent, #c8943a)', flexShrink: 0, overflow: 'hidden', ...(post.author.avatar ? { backgroundImage: `url(${post.author.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}) }}>
            {!post.author.avatar && post.author.initials}
          </div>
          <div>
            <div style={{ fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--muted, #999)', marginBottom: 2, fontWeight: 600 }}>Written by</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink, #1a1a1a)' }}>{post.author.name}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2, #666)' }}>{post.author.role}</div>
          </div>
        </div>

      </div>
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
            <input style={inputStyle} value={post.cover?.caption || ''} onChange={(e) => updatePost({ cover: { src: post.cover?.src || '', caption: e.target.value } })} placeholder="Caption shown below the hero image" />
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
              <input style={inputStyle} value={post.categories.join(', ')} onChange={(e) => updatePost({ categories: e.target.value.split(',').map((v) => v.trim()).filter(Boolean) })} placeholder="Travel, Asia, Food" />
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
            <label style={fieldLabel}>OG / Social share image URL</label>
            <input style={inputStyle} value={post.seo.ogImage} onChange={(e) => updatePost({ seo: { ...post.seo, ogImage: e.target.value } })} placeholder="https://…/og-image.jpg" />
          </div>
        </div>
      </div>

      {/* ── Content Blocks ── */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 18, paddingBottom: 14, borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap' }}>
          <p style={{ ...sectionHeadStyle, margin: 0, paddingBottom: 0, border: 'none' }}>📝 Content Blocks</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {BLOCK_LIBRARY.map((b) => (
              <button key={b.type} type="button" className="btn btn-xs" onClick={() => onAddBlock(b.type)} style={{ whiteSpace: 'nowrap', fontSize: 11 }} title={b.desc}>+ {b.label}</button>
            ))}
          </div>
        </div>
        {post.blocks.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#bbb', border: '2px dashed #eee', borderRadius: 10 }}>
            No content blocks yet. Add one above.
          </div>
        )}
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
    setViewMode(mode);
    if (mode === 'preview') onPostClick?.(post);
  };

  const createPost = async () => {
    setError(null);
    try {
      const response = await createBlog(createEmptyPost());
      if (response.success) {
        const normalized = normalizePost(response.data);
        setPostsState((prev) => [normalized, ...prev]);
        setActivePost(normalized);
        setViewMode('editor');
      }
    } catch (err) {
      setError(mapErrorMessage(err));
    }
  };

  const handlePostChange = (next: Post) => {
    setActivePost(next);
    setPostsState((prev) => prev.map((p) => (p.id === next.id ? next : p)));
  };

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

  if (viewMode === 'editor' && activePost) {
    return (
      <BlogEditor
        post={activePost}
        onChange={handlePostChange}
        onSave={async () => { await savePost(activePost); setViewMode('list'); }}
        onPreview={() => { savePost(activePost); setViewMode('preview'); }}
        onCancel={() => { savePost(activePost); setViewMode('list'); }}
        onDelete={() => { if (activePost.id) deletePost(activePost.id); }}
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
          <button
            type="button"
            className="btn btn-sm"
            onClick={() => setViewMode('list')}
            style={{ background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999 }}
          >
            ← List
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary"
            onClick={() => setViewMode('editor')}
            style={{ borderRadius: 999 }}
          >
            ✏️ Edit
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
