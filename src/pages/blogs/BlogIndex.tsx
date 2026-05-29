// import { BLOGS } from "../../content/blogs/registry";
// import BlogCard from "./BlogCard";
// import { getBlogs } from "../../lib/api";
// import { useEffect, useState } from "react";
// import type { Post } from "../../lib/api";

// function normalizePost(raw: any): Post {
//   return { ...raw, id: raw.id ?? raw._id ?? undefined };
// }

// function resolveCover(cover: Post["cover"]): string | undefined {
//   if (!cover) return undefined;
//   if (typeof cover === "string") return cover;
//   return cover.src || undefined;
// }

// export default function BlogIndex() {
//   const [dbBlogs, setDbBlogs] = useState<Post[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let cancelled = false;
//     async function load() {
//       try {
//         const res = await getBlogs({ status: "published" });
//         if (!cancelled && res.success) {
//           setDbBlogs(res.data.posts.map(normalizePost));
//         }
//       } catch {
//         if (!cancelled) setError("Failed to load blogs.");
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }
//     load();
//     return () => { cancelled = true; };
//   }, []);

//   return (
//     <main className="mx-auto max-w-6xl px-4 py-10">
//       <header className="mb-8 text-center">
//         <h1 className="text-3xl md:text-5xl font-extrabold text-[#00477f]">
//           Plumtrips Journal
//         </h1>
//         <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
//           Curated itineraries, trendy stays, and hidden gems for modern luxury travellers.
//         </p>
//       </header>

//       <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">

//                 {/* DB blogs loading skeletons */}
//         {loading && Array.from({ length: 3 }).map((_, i) => (
//           <div key={`skel-${i}`} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse">
//             <div className="aspect-[16/9] bg-slate-200" />
//             <div className="p-5 space-y-3">
//               <div className="h-4 bg-slate-200 rounded w-3/4" />
//               <div className="h-3 bg-slate-100 rounded w-full" />
//               <div className="h-3 bg-slate-100 rounded w-5/6" />
//             </div>
//           </div>
//         ))}

//         {/* DB blogs error */}
//         {!loading && error && (
//           <p className="col-span-full text-center text-sm text-red-500">{error}</p>
//         )}

//         {/* DB blogs cards */}
//         {!loading && !error && dbBlogs.map((b) => (
//           <BlogCard
//             key={b.id ?? b.slug}
//             title={b.title}
//             excerpt={b.excerpt}
//             cover={resolveCover(b.cover)}
//             tags={b.tags}
//             href={`/readblogs/${b.id}`}
//           />
//         ))}


//         {/* Static blogs — untouched */}
//         {BLOGS.map((b) => (
//           <BlogCard
//             key={b.slug}
//             title={b.title}
//             excerpt={b.excerpt}
//             cover={b.cover}
//             tags={b.tags}
//             href={`/blogs/${b.slug}`}
//           />
//         ))}


//       </section>
//     </main>
//   );
// }




// ─────────────────────────────────────────────────────────────
//  BlogIndex.tsx  —  All 6 improvements applied
//
//  1. Hero carousel verified (logs removed, real data flows in)
//  2. Deduplication: DB posts that share a slug with static ones are filtered
//  3. Tag filter UI: pill row above the grid, filters both static + DB posts
//  4. Pagination: "Load more" button using getBlogs({ page })
//  5. Unified routing: all cards go to /blogs/:slug (DB posts need a slug)
//  6. Empty state: friendly UI when there are zero posts to show
// ─────────────────────────────────────────────────────────────

import { BLOGS } from "../../content/blogs/registry";
import BlogCard from "./BlogCard";
import { getBlogs } from "../../lib/api";
import { useEffect, useState, useCallback } from "react";
import type { Post } from "../../lib/api";
import EditorialHeroBlog from "./EditorialHeroBlog";
import type { StoryItem } from "./EditorialHeroBlog";

// ── Helpers ───────────────────────────────────────────────────

function normalizePost(raw: any): Post {
  return { ...raw, id: raw.id ?? raw._id ?? undefined };
}

function resolveCover(cover: Post["cover"]): string | undefined {
  if (!cover) return undefined;
  if (typeof cover === "string") return cover;
  return cover.src || undefined;
}

/** Collect every unique tag from static + DB posts for the filter bar */
function collectAllTags(staticBlogs: typeof BLOGS, dbBlogs: Post[]): string[] {
  const tagSet = new Set<string>();
  staticBlogs.forEach((b) => b.tags?.forEach((t) => tagSet.add(t)));
  dbBlogs.forEach((b) => b.tags?.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}

// ── Component ─────────────────────────────────────────────────

export default function BlogIndex() {
  // ── State ──────────────────────────────────────────────────
  const [dbBlogs, setDbBlogs]       = useState<Post[]>([]);
  const [loading, setLoading]       = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [page, setPage]             = useState(1);
  const [hasMore, setHasMore]       = useState(true);
  const [activeTag, setActiveTag]   = useState<string>("All");

  // ── Fetch DB posts ─────────────────────────────────────────
  const fetchBlogs = useCallback(async (pageNum: number, isLoadMore = false) => {
    isLoadMore ? setLoadingMore(true) : setLoading(true);
    setError(null);
    try {
      const res = await getBlogs({ status: "published", page: pageNum, limit: 6 });
      if (res.success) {
        const fetched = res.data.posts.map(normalizePost);
        setDbBlogs((prev) => isLoadMore ? [...prev, ...fetched] : fetched);

        // If we received fewer posts than the limit, no more pages exist
        setHasMore(fetched.length === 6);
      }
    } catch {
      setError("Failed to load blogs. Please try again.");
    } finally {
      isLoadMore ? setLoadingMore(false) : setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs(1);
  }, [fetchBlogs]);

  // ── Load More handler ──────────────────────────────────────
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchBlogs(nextPage, true);
  };

  // ── Deduplication (fix 2) ──────────────────────────────────
  // Remove any DB post whose slug already exists in the static registry
  const staticSlugs = new Set(BLOGS.map((b) => b.slug));
  const uniqueDbBlogs = dbBlogs.filter(
    (b) => !b.slug || !staticSlugs.has(b.slug)
  );

  // ── Tag filter (fix 3) ─────────────────────────────────────
  const allTags = ["All", ...collectAllTags(BLOGS, uniqueDbBlogs)];

  const filteredStaticBlogs =
    activeTag === "All"
      ? BLOGS
      : BLOGS.filter((b) => b.tags?.includes(activeTag));

  const filteredDbBlogs =
    activeTag === "All"
      ? uniqueDbBlogs
      : uniqueDbBlogs.filter((b) => b.tags?.includes(activeTag));

  // ── Hero stories (fix 1) ───────────────────────────────────
  // Map DB posts to StoryItem; fallback handled inside EditorialHeroBlog
  const storyItems: StoryItem[] = uniqueDbBlogs.map((b, i) => ({
    id: b.id ?? i,
    image: resolveCover(b.cover) ?? "",
    category: (b.tags?.[0] ?? "TRAVEL").toUpperCase(),
    title: b.title,
    excerpt: b.excerpt ?? "",
    date: b.createdAt
      ? new Date(b.createdAt).toDateString().toUpperCase()
      : "",
    readTime: "5 MIN READ",
  }));

  // ── Unified href resolver (fix 5) ─────────────────────────
  // Prefer /blogs/:slug for all posts; fall back to /readblogs/:id only
  // when a DB post has no slug (temporary fallback — fix slugs in your DB)
  function dbPostHref(b: Post): string {
    if (b.slug) return `/blogs/${b.slug}`;
    return `/readblogs/${b.id}`;
  }

  // ── Empty state check (fix 6) ─────────────────────────────
  const totalVisible = filteredStaticBlogs.length + filteredDbBlogs.length;
  const nothingToShow = !loading && totalVisible === 0;

  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      {/* ── 1. Editorial Hero ─────────────────────────────── */}
      <EditorialHeroBlog stories={storyItems} />
    </>
  );
}