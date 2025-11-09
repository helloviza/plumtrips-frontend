export default function BlogCard({
  title,
  excerpt,
  cover,
  tags,
  href,
}: {
  title: string;
  excerpt: string;
  cover?: string;
  tags?: string[];
  href: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition overflow-hidden group">
      <a href={href} className="block">
        <div className="relative aspect-[16/9] overflow-hidden">
          {cover ? (
            <img
              src={cover}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-slate-200" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white text-lg font-extrabold drop-shadow">
              {title}
            </h3>
          </div>
        </div>

        <div className="p-5">
          <p className="text-slate-600 text-sm leading-6 line-clamp-3">
            {excerpt}
          </p>
          {tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-block rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-4 text-right">
            <span className="text-[#00477f] text-sm font-semibold">
              Read →
            </span>
          </div>
        </div>
      </a>
    </article>
  );
}
