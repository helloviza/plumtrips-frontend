// apps/frontend/src/lib/authApi.ts
const BACKEND = import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:8080";

async function http<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BACKEND}${path}`, {
    credentials: "include", // important for httpOnly cookie JWT
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(msg || `${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export type MeResponse = { user: { id?: string; email: string; fullName?: string; phone?: string } | null };

export const authApi = {
  me: () => http<MeResponse>("/api/auth/me", { method: "GET" }),
  login: (body: { email: string; password: string }) =>
    http<MeResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body: { fullName: string; email: string; phone?: string; password: string }) =>
    http<MeResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  logout: () => http<{ ok: true }>("/api/auth/logout", { method: "POST" }),
};
