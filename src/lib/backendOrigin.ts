/**
 * Single origin for all browser → backend calls (auth, hotels, flights, blogs, etc.).
 * Keeps cookies and CORS aligned with the dev server that serves /api (same host:port as hotel routes).
 *
 * Resolution order: VITE_API_URL → VITE_API_BASE_URL → VITE_BACKEND_ORIGIN → http://localhost:3000
 */
export function getBackendOrigin(): string {
  const raw =
    (import.meta.env.VITE_API_URL as string | undefined) ||
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
    (import.meta.env.VITE_BACKEND_ORIGIN as string | undefined);
  if (typeof raw === 'string' && raw.trim()) return raw.trim().replace(/\/+$/, '');
  return 'http://localhost:8080';
}
