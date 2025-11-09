import { useParams } from "react-router-dom";

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

  if (!match) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Blog not found 😢</h1>
        <p className="mt-3 text-slate-600">
          The page you’re looking for doesn’t exist.
        </p>
      </main>
    );
  }

  const Component = match.default as React.ComponentType;
  return <Component />;
}
