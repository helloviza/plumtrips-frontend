/*ReadBlogPage.tsx*/ 
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ReadBlog from "./ReadBlog";
import { getBlog, getRelatedBlogs } from "../../lib/api";

import type { Post } from "../../lib/api";

function normalizePost(raw: Post & { _id?: string }): Post {
  return {
    ...raw,
    id: raw.id ?? raw._id ?? undefined,
  };
}

export default function ReadBlogPage() {
  const { id } = useParams();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;

      try {
        const res = await getBlog(id);

        if (res.success) {
          const normalizedPost = normalizePost(res.data);

          if (normalizedPost.related?.length) {
            setPost(normalizedPost);
          } else {
            const related = await getRelatedBlogs(normalizedPost);
            setPost({ ...normalizedPost, related });
          }
        } else {
          setError("Blog not found");
        }
      } catch {
        setError("Failed to load blog");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "'Manrope', system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#747878",
          background: "#fbf9f8",
        }}
      >
        Loading…
      </div>
    );
  }

  if (error || !post) {
    return (
      <div
        style={{
          height: "100vh",
          display: "grid",
          placeItems: "center",
          fontFamily: "'Manrope', system-ui, sans-serif",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#747878",
          background: "#fbf9f8",
        }}
      >
        {error || "Blog not found"}
      </div>
    );
  }

  return <ReadBlog post={post} />;
}