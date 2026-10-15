/*BlogPost.tsx*/ 
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBlog, getRelatedBlogs } from "../../lib/api";
import type { Post } from "../../lib/api";
import ReadBlog from "./ReadBlog";

/** Dynamically load all blog components + meta */
const modules = import.meta.glob(
  "../../content/blogs/**/index.tsx",
  { eager: true }
) as Record<string, any>;

export default function BlogPost() {
  const { slug = "" } = useParams();

  // Find the module whose meta.slug matches the URL slug
  const match = Object.values(modules).find(
    (m) => m?.meta?.slug === slug
  );

  // ── Fallback: no static content module for this slug — try the CMS ──
  const [dbPost, setDbPost] = useState<Post | null>(null);
  const [dbLoading, setDbLoading] = useState(!match);
  const [dbError, setDbError] = useState(false);

  useEffect(() => {
    if (match || !slug) return;
    let cancelled = false;
    setDbLoading(true);
    setDbError(false);
    getBlog(slug)
      .then(async (res) => {
        if (cancelled) return;
        if (res.success && res.data) {
          const post = { ...res.data, id: res.data.id ?? (res.data as any)._id };
          if (post.related?.length) {
            setDbPost(post);
            return;
          }

          try {
            const related = await getRelatedBlogs(post);
            if (!cancelled) setDbPost({ ...post, related });
          } catch {
            if (!cancelled) setDbPost(post);
          }
        } else {
          setDbError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setDbError(true);
      })
      .finally(() => {
        if (!cancelled) setDbLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [match, slug]);

  if (match) {
    const Component = match.default as React.ComponentType;
    return (
      <div className="static-blog-shell">
        <Component />
      </div>
    );
  }

  if (dbLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="mt-3 text-slate-600">Loading…</p>
      </main>
    );
  }

  if (dbError || !dbPost) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Blog not found 😢</h1>
        <p className="mt-3 text-slate-600">
          The page you’re looking for doesn’t exist.
        </p>
      </main>
    );
  }

  return <ReadBlog post={dbPost} />;
}