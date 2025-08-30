// src/utils/fixImageFallback.ts
export function enableImageFallback() {
  function checkAndFix(img: HTMLImageElement) {
    if (!img.src) return;

    const url = new URL(img.src, window.location.origin);

    // If .jpg/.jpeg requested → try .webp
    if (url.pathname.match(/\.(jpg|jpeg)$/i)) {
      const webpUrl = url.pathname.replace(/\.(jpg|jpeg)$/i, ".webp");
      fetch(webpUrl, { method: "HEAD" }).then((res) => {
        if (res.ok) {
          console.log(`🔄 Using fallback: ${webpUrl}`);
          img.src = webpUrl;
        }
      });
    }

    // If .webp requested → try .jpg
    if (url.pathname.endsWith(".webp")) {
      const jpgUrl = url.pathname.replace(/\.webp$/, ".jpg");
      fetch(jpgUrl, { method: "HEAD" }).then((res) => {
        if (res.ok) {
          console.log(`🔄 Using fallback: ${jpgUrl}`);
          img.src = jpgUrl;
        }
      });
    }
  }

  // Scan all <img> on page load
  document.querySelectorAll("img").forEach((img) => checkAndFix(img as HTMLImageElement));

  // Also watch dynamically added images
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (node instanceof HTMLImageElement) {
          checkAndFix(node);
        }
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}
