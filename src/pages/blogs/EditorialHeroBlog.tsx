/*EditorialHeroBlog.tsx*/ 
import React, { useRef } from 'react';
import styles from "../../styles/EditorialHeroBlog.module.css";
// import { BLOGS } from "../../content/blogs/registry";
// import BlogCard from "./BlogCard";
import { useState } from "react";
import { getBlogs, type Post } from "../../lib/api";


function resolveCover(cover: Post["cover"]): string | undefined {
  if (!cover) return undefined;
  if (typeof cover === "string") return cover;
  return cover.src || undefined;
}

const STORIES_PAGE_SIZE = 6;
const SEARCH_DEBOUNCE_MS = 300;

function normalizePost(raw: Post & { _id?: string }): Post {
  return {
    ...raw,
    id: raw.id ?? raw._id ?? undefined,
  };
}

function matchesSearch(post: Post, query: string): boolean {
  if (!query) return true;

  return [
    post.title,
    post.excerpt,
    post.subtitle,
    post.seo?.description,
    ...(post.categories ?? []),
  ].some((value) => value?.toLowerCase().includes(query));
}

/* ── Types ──────────────────────────────────────────────────── */
export interface StoryItem {
  id: number | string;
  image: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  href?: string;
}

interface EditorialHeroBlogProps {
  posts: Post[];
  loading: boolean;
  error: string | null;
}

/* ── Data ──────────────────────────────────────────────────── */
const CATEGORIES = ['ALL STORIES', 'ADVENTURE', 'FOOD & DRINK', 'CULTURE', 'TRAVEL TIPS', 'HIDDEN GEMS', 'NATURE'];

const DESTINATIONS = [
  { name: 'Japan',         image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&auto=format&fit=crop' },
  { name: 'India',         image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&auto=format&fit=crop' },
  { name: 'Bali',          image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400&auto=format&fit=crop' },
  { name: 'Italy',         image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400&auto=format&fit=crop' },
  { name: 'Thailand',      image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&auto=format&fit=crop' },
  { name: 'Morocco',       image: 'https://images.unsplash.com/photo-1489493585363-d69421e0edd3?w=400&auto=format&fit=crop' },
  { name: 'Peru',          image: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&auto=format&fit=crop' },
  { name: 'Norway',        image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&auto=format&fit=crop' },
  { name: 'Patagonia',     image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&auto=format&fit=crop' },
  { name: 'Faroe Islands', image: 'https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400&auto=format&fit=crop' },
  { name: 'Nepal',         image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&auto=format&fit=crop' },
  { name: 'NZ',            image: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400&auto=format&fit=crop' },
];

const PICKS = [
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1h1-btNfvSWE7U4smLUctQeOT7DmO7K3r3l_TYIcE90_SNcgJQnjQRuL8ncsaEljdgS1HUrfJFOuH5DQOukZwkJwmhJMOz2bpkdFSEi71wpcWsSopkIkepQFFKoOP4qGLUD1v-bMooOik33fYUCk6Y3o8ExLcauCJWsNOGPycCQdGQ5DukoOFPanhMy2RWANYzaTZbiK2YZRwSMfiX_TITbvw8tguc_cjIhD7kyAaOB0aiPEkZELQm4mzV-vng3kgnWSt6YVKRA',
    name: 'Best of SE Asia',
    tag: 'GUIDE • ESSENTIAL',
  },
  {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmYHL3JBkOqi_5kVfP55DLFQgPTJtrk9tEOfB0IX2bCZ_aT-2ZHgZiHVmqCfHC07J72XH_zrQrMaBVvQzhBX7J05hrTyXBOuErbYMeHyFEA0dwaesuWoBsrl55TnfjQLVaqVKsTUeplzqwj4dJDv8vUWO_5-oUAt_iSwKl1MQkbDaq-qe_F_zF2aZWHgGGbzEYD3kXBXRP2GWYI2oNhOCFgeYhsSDY1qrR9ARQ79HRf6c_op4qWMA6Cea7WTtdYrQSFzmakoPfaw',
    name: '2026 Cities Ranking',
    tag: 'RANKING • TRENDING',
  },
];

const THEMES = ['GASTRONOMY', 'SLOW TRAVEL', 'LUXURY', 'PHOTOGRAPHY', 'SUSTAINABLE'];

const STATS = [
  { number: '10+',  label: 'STORIES PUBLISHED' },
  { number: '5',   label: 'COUNTRIES COVERED' },
  { number: '50K+', label: 'MONTHLY READERS' },
  { number: '10',    label: 'WANDERING WRITERS' },
];

/* ── Component ─────────────────────────────────────────────── */
export default function EditorialHeroBlog({
  posts,
  loading,
  error,
}: EditorialHeroBlogProps) {
  const [showAll, setShowAll] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = React.useState('ALL STORIES');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts);
  const [filterLoading, setFilterLoading] = useState(false);
  const [filterError, setFilterError] = useState<string | null>(null);
  const filterRequestId = useRef(0);

  const featuredBlog = posts[2] ?? null;
  const remainingBlogs = filteredPosts;

  React.useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    const category = activeCategory === 'ALL STORIES' ? '' : activeCategory;
    const requestId = ++filterRequestId.current;

    if (!category && !query) {
      setFilteredPosts(posts);
      setFilterLoading(false);
      setFilterError(null);
      return;
    }

    let cancelled = false;
    setFilterLoading(true);
    setFilterError(null);

    const loadFilteredPosts = async () => {
      try {
        const matchingPosts: Post[] = [];
        let page = 1;
        let total = Infinity;

        while (matchingPosts.length < STORIES_PAGE_SIZE && (page - 1) * STORIES_PAGE_SIZE < total) {
          const response = await getBlogs({
            status: 'published',
            ...(category ? { category } : {}),
            page,
            limit: STORIES_PAGE_SIZE,
          });

          if (!response.success) {
            throw new Error('Failed to load filtered blogs.');
          }

          const pagePosts = response.data.posts.map(normalizePost);
          total = response.data.total;

          for (const post of pagePosts) {
            const matchesCategory =
              !category || post.categories?.some(
                (postCategory) => postCategory.trim().toLowerCase() === category.toLowerCase()
              );

            if (matchesCategory && matchesSearch(post, query)) {
              matchingPosts.push(post);
            }
          }

          if (pagePosts.length === 0) break;
          page += 1;
        }

        if (!cancelled && filterRequestId.current === requestId) {
          setFilteredPosts(matchingPosts);
          setFilterLoading(false);
        }
      } catch (requestError) {
        if (!cancelled && filterRequestId.current === requestId) {
          setFilteredPosts([]);
          setFilterLoading(false);
          setFilterError(
            requestError instanceof Error ? requestError.message : 'Failed to load filtered blogs.'
          );
        }
      }
    };

    const timeoutId = window.setTimeout(loadFilteredPosts, query ? SEARCH_DEBOUNCE_MS : 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [activeCategory, posts, searchQuery]);

  // Use passed-in stories if provided, otherwise fall back to hardcoded STORIES
  // const displayStories: StoryItem[] = stories?.length ? stories : STORIES;

  const scroll = (dir: 'prev' | 'next') => {
    scrollRef.current?.scrollBy({ left: dir === 'next' ? 400 : -400, behavior: 'smooth' });
  };

  return (
    <main className={styles.editorialPage}>

      {loading && (
        <div
          style={{
            padding: "60px 20px",
            textAlign: "center",
            color: "#64748b",
            fontSize: "16px",
          }}
        >
          Loading blogs...
        </div>
      )}

      {!loading && error && (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "#dc2626",
            fontSize: "16px",
          }}
        >
          {error}
        </div>
      )}

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="hero">
        {/* Image side */}
        {/* Image side */}
<div className="hero__image-wrap">
  <img
    src={featuredBlog ? resolveCover(featuredBlog.cover) : "https://lh3.googleusercontent.com/...fallback..."}
    alt={featuredBlog?.title ?? "Featured Post"}
  />
  <div className="hero__badge">FEATURED POST</div>
</div>

{/* Content side */}
<div className="hero__content">
  <div className="hero__meta">
    <span>Journey</span>
    <span className="hero__meta-dot" />
    <span>{featuredBlog?.readingTime ?? 12} MIN READ</span>
  </div>

  <h1 className="hero__title">{featuredBlog?.title ?? "The Hidden Vineyards of Northern Provence"}</h1>

  <p className="hero__excerpt">{featuredBlog?.excerpt ?? "Beyond the lavender fields..."}</p>

  <a href={featuredBlog ? `/readblogs/${featuredBlog.id}` : "#"} className="btn btn--primary">
    Read the Feature
    <span className="material-symbols-outlined">arrow_forward</span>
  </a>
</div>
      </section>

      {/* ── Category Filter ─────────────────────────────────── */}
      <div className="filter-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`btn ${activeCategory === cat ? 'btn--chip-active' : 'btn--chip'}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div
        style={{
          margin: "24px 0",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "500px",
            position: "relative",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
              fontSize: "22px",
            }}
          >
            search
          </span>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search blogs..."
            style={{
              width: "100%",
              padding: "13px 18px 13px 48px",
              border: "1px solid #d1d5db",
              borderRadius: "999px",
              outline: "none",
              fontSize: "15px",
              background: "#fff",
            }}
          />
        </div>
      </div>

      {/* ── Latest Stories ──────────────────────────────────── */}
      <section className="latest-stories">
{filterLoading && (
  <div style={{ padding: '16px', textAlign: 'center', color: '#64748b' }}>
    Loading stories...
  </div>
)}

{!filterLoading && filterError && (
  <div style={{ padding: '16px', textAlign: 'center', color: '#dc2626' }}>
    {filterError}
  </div>
)}

<div className="section-header">
  <h2 className="section-header__title">LATEST STORIES</h2>
  <button
    className="section-header__link"
    onClick={() => setShowAll((prev) => !prev)}
    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
  >
    {showAll ? 'SHOW LESS' : 'VIEW ALL'}
  </button>
</div>

{showAll ? (
  /* ── Expanded grid: all blogs ── */
  remainingBlogs.length === 0 ? (
    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
      No stories match your selected filters.
    </div>
  ) : (
    <div className="stories-all-grid">
      {remainingBlogs.map((story) => (
        <article key={story.id} className="story-card">
          <div className="story-card__image">
            <img src={resolveCover(story.cover)} alt={story.title} />
          </div>
          <h3 className="story-card__title">{story.title}</h3>
          <a href={`/readblogs/${story.id}`} className="btn btn--link" style={{ marginTop: 16 }}>
            Read More
            <span className="material-symbols-outlined">arrow_forward</span>
          </a>
        </article>
      ))}
    </div>
  )
) : (
  /* ── Carousel: original ── */
  remainingBlogs.length === 0 ? (
    <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
      No stories match your selected filters.
    </div>
  ) : (
    <div className="stories-carousel-wrap">
      <div ref={scrollRef} className="stories-carousel scrollbar-hide">
        {remainingBlogs.map((story) => (
          <article key={story.id} className="story-card">
            <div className="story-card__image">
              <img src={resolveCover(story.cover)} alt={story.title} />
            </div>
            <h3 className="story-card__title">{story.title}</h3>
            <a href={`/readblogs/${story.id}`} className="btn btn--link" style={{ marginTop: 16 }}>
              Read More
              <span className="material-symbols-outlined">arrow_forward</span>
            </a>
          </article>
        ))}
      </div>
      <button className="carousel-arrow carousel-arrow--prev" onClick={() => scroll('prev')} aria-label="Previous">
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      <button className="carousel-arrow carousel-arrow--next" onClick={() => scroll('next')} aria-label="Next">
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  )
)}
        

        {/* Browse box */}
        <div className="browse-box">
          <h3 className="browse-box__title">Browse by Destination</h3>
          <div className="browse-grid">
            {DESTINATIONS.map((dest) => (
              <a key={dest.name} href="#" className="browse-chip">
                <img src={dest.image} alt={dest.name} className="browse-chip__img" />
                <span className="browse-chip__label">{dest.name.toUpperCase()}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ──────────────────────────────────────── */}
      <section className="newsletter">
        <div className="newsletter__grid">
          <div>
            <h2 className="newsletter__title">The Sunday Letter</h2>
            <p className="newsletter__desc">
              Curated stories and hidden spots delivered to your inbox every Sunday morning. No fluff, just inspiration.
            </p>
          </div>
          <div className="newsletter__form">
            <input
              className="newsletter__input"
              type="email"
              placeholder="Email address"
            />
            <button className="btn btn--primary" style={{ whiteSpace: 'nowrap' }}>
              SUBSCRIBE NOW
            </button>
          </div>
        </div>
      </section>

      {/* ── Picks & Themes ──────────────────────────────────── */}
      <section className="picks-themes">
        {/* Plumtrips Picks */}
        <div>
          <h3 className="sub-section-title">PLUMTRIPS PICKS</h3>
          <div className="picks-list">
            {PICKS.map((pick) => (
              <div key={pick.name} className="pick-item">
                <div className="pick-item__thumb">
                  <img src={pick.image} alt={pick.name} />
                </div>
                <div>
                  <div className="pick-item__name">{pick.name}</div>
                  <div className="pick-item__tag">{pick.tag}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explore Themes */}
        <div>
          <h3 className="sub-section-title">EXPLORE THEMES</h3>
          <div className="themes-grid">
            {THEMES.map((theme) => (
              <button key={theme} className="theme-chip">{theme}</button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Banner ────────────────────────────────────── */}
      <section className="stats-banner">
        <div className="stats-grid">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <div className="stat__number">{stat.number}</div>
              <div className="stat__label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}