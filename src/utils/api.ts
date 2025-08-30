// apps/frontend/src/utils/api.ts

export const API_BASE =
  (import.meta.env.VITE_BACKEND_ORIGIN as string) || "http://localhost:8080";

/** Build a safe URL like `${API_BASE}/path` without duplicate slashes */
function makeUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path; // already absolute
  const base = API_BASE.replace(/\/+$/, "");
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export class ApiError<T = any> extends Error {
  status: number;
  data?: T;
  constructor(status: number, message: string, data?: T) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

type Json = Record<string, any>;

async function handle<T>(res: Response): Promise<T> {
  // 204 No Content
  if (res.status === 204) return undefined as unknown as T;

  const isJson = res.headers.get("content-type")?.includes("application/json");

  if (!res.ok) {
    // Try to parse error body for message/details
    let payload: any = undefined;
    if (isJson) {
      try {
        payload = await res.json();
      } catch {
        /* ignore */
      }
    } else {
      try {
        payload = { message: await res.text() };
      } catch {
        /* ignore */
      }
    }
    const message = (payload && (payload.message || payload.error)) || `HTTP ${res.status}`;
    throw new ApiError(res.status, message, payload);
  }

  // Success with JSON body
  if (isJson) {
    return (await res.json()) as T;
  }

  // If server returned non-JSON for a JSON endpoint, surface a clear error
  const text = await res.text();
  throw new ApiError(res.status, "Unexpected non-JSON response", { text } as any);
}

export const api = {
  get<T = Json>(path: string): Promise<T> {
    return fetch(makeUrl(path), {
      method: "GET",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
      // avoid cached 304s / mixed ETag behavior in dev
      cache: "no-store",
    }).then((r) => handle<T>(r));
  },

  post<T = Json>(path: string, body?: Json): Promise<T> {
    return fetch(makeUrl(path), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    }).then((r) => handle<T>(r));
  },

  put<T = Json>(path: string, body?: Json): Promise<T> {
    return fetch(makeUrl(path), {
      method: "PUT",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    }).then((r) => handle<T>(r));
  },

  del<T = Json>(path: string): Promise<T> {
    return fetch(makeUrl(path), {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    }).then((r) => handle<T>(r));
  },
};
