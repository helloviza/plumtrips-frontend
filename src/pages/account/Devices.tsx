import { useEffect, useState } from "react";
const API = import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:8080";

type Session = {
  _id: string;
  userAgent: string;
  ip?: string;
  createdAt: string;
  lastSeenAt?: string;
  current?: boolean;
};

export default function Devices() {
  const [items, setItems] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`${API}/api/v1/me/sessions`, { credentials: "include" });
    const data = await res.json();
    setItems(data.items || []);
    setLoading(false);
  }
  useEffect(()=>{ load(); }, []);

  async function logout(id: string) {
    const res = await fetch(`${API}/api/v1/me/sessions/${id}/revoke`, { method:"POST", credentials:"include" });
    if (res.ok) load();
  }

  if (loading) return <div>Loading…</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Logged in Devices</h1>

      <ul className="space-y-3">
        {items.map(s => (
          <li key={s._id} className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <div className="font-medium">
                {s.current ? "Current device" : s.userAgent?.split("(")[0] || "Device"}
              </div>
              <div className="text-sm text-zinc-600">
                {s.userAgent}
              </div>
              <div className="text-xs text-zinc-500">
                Logged in: {new Date(s.createdAt).toLocaleString()}
                {s.lastSeenAt ? ` • Last seen: ${new Date(s.lastSeenAt).toLocaleString()}` : ""}
                {s.ip ? ` • IP: ${s.ip}` : ""}
              </div>
            </div>
            {!s.current && (
              <button onClick={()=>logout(s._id)} className="rounded-md border px-3 py-2">
                Logout
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
