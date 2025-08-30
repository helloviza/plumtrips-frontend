import { BLOGS } from "../../content/blogs/registry"; // ensure this path exists
import BlogCard from "./BlogCard";

export default function BlogIndex() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold text-[#00477f]">
          PlumTrips Journal
        </h1>
        <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
          Curated itineraries, trendy stays, and hidden gems for modern luxury travellers.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
