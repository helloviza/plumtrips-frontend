import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ReadBlog from "./ReadBlog";
import { getBlog } from "../../lib/api";

import type { Post } from "../../lib/api";

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
          setPost(res.data);
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
