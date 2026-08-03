import React, { useEffect, useRef } from "react";

interface TransparentVideoProps {
  src: string;
  style?: React.CSSProperties;
  className?: string;
  tolerance?: number;
}

export function TransparentVideo({ src, style, className, tolerance = 15 }: TransparentVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let cancelled = false;
    const context = canvas.getContext("2d");

    if (!context) return;

    const resizeCanvas = () => {
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 360;

      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
    };

    const sampleBackgroundColor = (imageData: ImageData, width: number, height: number) => {
      const data = imageData.data;
      const samplePoints = [
        { x: 4, y: 4 },
        { x: Math.max(4, width - 5), y: 4 },
        { x: 4, y: Math.max(4, height - 5) },
        { x: Math.max(4, width - 5), y: Math.max(4, height - 5) },
        { x: Math.floor(width / 2), y: 4 },
      ];

      let totalR = 0;
      let totalG = 0;
      let totalB = 0;
      let count = 0;

      for (const point of samplePoints) {
        const index = (point.y * width + point.x) * 4;
        totalR += data[index];
        totalG += data[index + 1];
        totalB += data[index + 2];
        count += 1;
      }

      return {
        r: totalR / count,
        g: totalG / count,
        b: totalB / count,
      };
    };

    const getSoftAlpha = (
      r: number,
      g: number,
      b: number,
      bg: { r: number; g: number; b: number },
      keyDistance: number,
      softDistance: number,
      lowSaturation: number,
      brightnessTol: number
    ) => {
      const dr = r - bg.r;
      const dg = g - bg.g;
      const db = b - bg.b;
      const dist = Math.sqrt(dr * dr + dg * dg + db * db);
      const maxc = Math.max(r, g, b);
      const minc = Math.min(r, g, b);
      const saturation = maxc - minc;
      const brightness = r * 0.299 + g * 0.587 + b * 0.114;
      const bgBrightness = bg.r * 0.299 + bg.g * 0.587 + bg.b * 0.114;
      const brightnessDiff = Math.abs(brightness - bgBrightness);

      if (saturation > lowSaturation || brightnessDiff > brightnessTol) {
        return 1;
      }

      if (dist <= keyDistance) {
        return 0;
      }

      if (dist >= softDistance) {
        return 1;
      }

      return (dist - keyDistance) / (softDistance - keyDistance);
    };

    let backgroundColor = { r: 0, g: 0, b: 0 };
    let shouldSampleBackground = true;

    const renderFrame = () => {
      if (cancelled || !video || !canvas || !context) return;

      if (video.readyState >= 2) {
        resizeCanvas();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const keyDistance = Math.max(tolerance + 18, 72);
        const softDistance = Math.max(keyDistance + 36, 110);
        const lowSaturation = 50;
        const brightnessTol = 40;

        if (shouldSampleBackground) {
          backgroundColor = sampleBackgroundColor(imageData, canvas.width, canvas.height);
          shouldSampleBackground = false;
        }

        for (let i = 0; i < data.length; i += 4) {
          const red = data[i];
          const green = data[i + 1];
          const blue = data[i + 2];
          const alpha = data[i + 3];

          if (alpha === 0) continue;

          const desiredAlpha = getSoftAlpha(
            red,
            green,
            blue,
            backgroundColor,
            keyDistance,
            softDistance,
            lowSaturation,
            brightnessTol
          );

          if (desiredAlpha < 1) {
            data[i + 3] = Math.round(alpha * desiredAlpha);
          }
        }

        context.putImageData(imageData, 0, 0);
      }

      frameRef.current = window.requestAnimationFrame(renderFrame);
    };

    const startPlayback = async () => {
      try {
        video.muted = true;
        video.playsInline = true;
        video.loop = true;
        video.autoplay = true;
        video.crossOrigin = "anonymous";
        video.preload = "auto";

        if (video.readyState >= 2) {
          resizeCanvas();
          await video.play();
          renderFrame();
          return;
        }

        await new Promise<void>((resolve) => {
          const onLoaded = () => {
            video.removeEventListener("loadeddata", onLoaded);
            resolve();
          };
          video.addEventListener("loadeddata", onLoaded, { once: true });
        });

        if (!cancelled) {
          resizeCanvas();
          await video.play();
          renderFrame();
        }
      } catch {
        // Autoplay can be blocked until the user interacts with the page.
        // The video will still be rendered and can play after the first click.
      }
    };

    video.addEventListener("loadedmetadata", resizeCanvas);
    void startPlayback();

    return () => {
      cancelled = true;
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
      video.pause();
      video.removeEventListener("loadedmetadata", resizeCanvas);
    };
  }, [src, tolerance]);

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        className={className}
        style={{
          display: "none",
        }}
        crossOrigin="anonymous"
      />
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          display: "block",
          objectFit: "contain",
          pointerEvents: "none",
          background: "transparent",
          ...style,
        }}
      />
    </>
  );
}
