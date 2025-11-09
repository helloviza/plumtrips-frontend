import { useState } from "react";
const API = import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:8080";

export default function ResetPassword() {
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch(`${API}/api/v1/me/password`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword: oldPw, newPassword: newPw }),
    });
    setBusy(false);
    alert(res.ok ? "Password updated" : "Failed to update password");
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-3">
      <h1 className="text-xl font-semibold">Reset Password</h1>
      <input className="w-full rounded border px-3 py-2" placeholder="Current password" type="password" value={oldPw} onChange={(e)=>setOldPw(e.target.value)} />
      <input className="w-full rounded border px-3 py-2" placeholder="New password (min 8)" type="password" value={newPw} onChange={(e)=>setNewPw(e.target.value)} />
      <button disabled={busy} className="rounded bg-[#00477f] px-4 py-2 text-white">{busy ? "Saving…" : "Save"}</button>
    </form>
  );
}
