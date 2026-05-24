import { BLOGS } from "../../content/blogs/registry";
import BlogCard from "./BlogCard";
import { getBlogs } from "../../lib/api";
import { useEffect, useState } from "react";
import type { Post } from "../../lib/api";

function normalizePost(raw: any): Post {
  return { ...raw, id: raw.id ?? raw._id ?? undefined };
}

function resolveCover(cover: Post["cover"]): string | undefined {
  if (!cover) return undefined;
  if (typeof cover === "string") return cover;
  return cover.src || undefined;
}

export default function BlogIndex() {
  const [dbBlogs, setDbBlogs] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await getBlogs({ status: "published" });
        if (!cancelled && res.success) {
          setDbBlogs(res.data.posts.map(normalizePost));
        }
      } catch {
        if (!cancelled) setError("Failed to load blogs.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#00477f]">
          Plumtrips Journal
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
          Curated itineraries, trendy stays, and hidden gems for modern luxury travellers.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">

                {/* DB blogs loading skeletons */}
        {loading && Array.from({ length: 3 }).map((_, i) => (
          <div key={`skel-${i}`} className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse">
            <div className="aspect-[16/9] bg-slate-200" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-3 bg-slate-100 rounded w-full" />
              <div className="h-3 bg-slate-100 rounded w-5/6" />
            </div>
          </div>
        ))}

        {/* DB blogs error */}
        {!loading && error && (
          <p className="col-span-full text-center text-sm text-red-500">{error}</p>
        )}

        {/* DB blogs cards */}
        {!loading && !error && dbBlogs.map((b) => (
          <BlogCard
            key={b.id ?? b.slug}
            title={b.title}
            excerpt={b.excerpt}
            cover={resolveCover(b.cover)}
            tags={b.tags}
            href={`/readblogs/${b.id}`}
          />
        ))}


        {/* Static blogs — untouched */}
        {BLOGS.map((b) => (
          <BlogCard
            key={b.slug}
            title={b.title}
            excerpt={b.excerpt}
            cover={b.cover}
            tags={b.tags}
            href={`/blogs/${b.slug}`}
          />
        ))}


      </section>
    </main>
  );
}