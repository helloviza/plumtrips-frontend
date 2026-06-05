import { useEffect, useRef, useState } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type Props = {
  className?: string;
  images: string[];
  intervalMs?: number;
  fadeDurationMs?: number;
  activeTab?: "flights" | "hotels";
};

export default function HeroCarousel({
  className = "",
  images,
  intervalMs = 12_000,
  fadeDurationMs = 1_400,
  activeTab = "flights",
}: Props) {
  const [current, setCurrent] = useState(0);
  const [next, setNext]       = useState<number | null>(null);
  const [fading, setFading]   = useState(false);
  // Track which image URLs have been loaded so we never show the broken-img icon
  const [loaded, setLoaded]   = useState<Record<string, boolean>>({});

  const currentRef   = useRef(0);
  const fadingRef    = useRef(false);
  const imagesLenRef = useRef(images.length);
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { imagesLenRef.current = images.length; }, [images.length]);

  // Preload every image in the list up-front so transitions are instant
  useEffect(() => {
    images.forEach((src) => {
      if (!src) return;
      const img = new Image();
      img.onload = () => setLoaded((prev) => ({ ...prev, [src]: true }));
      img.src = src;
    });
  }, [images]);

  useEffect(() => {
    currentRef.current = 0;
    fadingRef.current  = false;
    setCurrent(0);
    setNext(null);
    setFading(false);
  }, [images.length]);

  useEffect(() => {
    if (images.length < 2) return;

    intervalRef.current = setInterval(() => {
      if (fadingRef.current) return;

      const nextIdx = (currentRef.current + 1) % imagesLenRef.current;
      setNext(nextIdx);
      setFading(false);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          fadingRef.current = true;
          setFading(true);

          fadeTimerRef.current = setTimeout(() => {
            currentRef.current = nextIdx;
            fadingRef.current  = false;
            setCurrent(nextIdx);
            setNext(null);
            setFading(false);
          }, fadeDurationMs + 50);
        });
      });
    }, intervalMs);

    return () => {
      if (intervalRef.current)  clearInterval(intervalRef.current);
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
    };
  }, [images.length, intervalMs, fadeDurationMs]);

  if (!images.length) return null;

  const heightClass =
    activeTab === "flights"
      ? "h-[340px] sm:h-[360px] lg:h-[480px]"
      : "h-[240px] sm:h-[280px] lg:h-[310px]";

  const isLoaded = (src: string) => !!loaded[src];

  return (
    <div className={cx("w-full", className)}>
      <div
        className={cx(
          "relative w-full rounded-2xl overflow-hidden bg-transparent",
          "transition-[height] duration-500 ease-in-out",
          heightClass
        )}
      >
        {/* Base layer — only visible once the image has loaded */}
        <img
          src={images[current]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: isLoaded(images[current]) ? 1 : 0 }}
          onLoad={() =>
            setLoaded((prev) => ({ ...prev, [images[current]]: true }))
          }
        />

        {/* Fade layer */}
        {next !== null && (
          <img
            src={images[next]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              // Only start fading in once the image is actually ready
              opacity: fading && isLoaded(images[next]) ? 1 : 0,
              transition:
                fading && isLoaded(images[next])
                  ? `opacity ${fadeDurationMs}ms cubic-bezier(0.4, 0, 0.2, 1)`
                  : "none",
            }}
            onLoad={() =>
              setLoaded((prev) => ({ ...prev, [images[next]]: true }))
            }
          />
        )}
      </div>
    </div>
  );
}