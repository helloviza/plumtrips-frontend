import { useEffect, useState } from "react";
const API = import.meta.env.VITE_BACKEND_ORIGIN || "http://localhost:8080";

type CoTraveller = {
  _id?: string;
  firstName?: string;
  lastName?: string;
  gender?: "male" | "female" | "other";
  dob?: string;
  nationality?: string;
  relationship?: string;
  mealPreference?: string;
  trainBerthPreference?: string;
  passport?: { number?: string; expiry?: string; issuingCountry?: string };
  phone?: string;
  email?: string;
  frequentFlyer?: { airline?: string; number?: string };
};

export default function CoTravellers() {
  const [list, setList] = useState<CoTraveller[]>([]);
  const [editing, setEditing] = useState<CoTraveller | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`${API}/api/v1/me/co-travellers`, { credentials: "include" });
    const data = await res.json();
    setList(data.items || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function save(item: CoTraveller) {
    const isEdit = Boolean(item._id);
    const url = isEdit ? `${API}/api/v1/me/co-travellers/${item._id}` : `${API}/api/v1/me/co-travellers`;
    const method = isEdit ? "PUT" : "POST";
    const res = await fetch(url, {
      method, credentials: "include", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item),
    });
    if (res.ok) { setEditing(null); load(); } else { alert("Save failed"); }
  }
  async function remove(id: string) {
    if (!confirm("Remove this co-traveller?")) return;
    const res = await fetch(`${API}/api/v1/me/co-travellers/${id}`, { method: "DELETE", credentials: "include" });
    if (res.ok) load();
  }

  if (loading) return <div>Loading…</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Co-Travellers</h1>
        <button onClick={() => setEditing({})} className="rounded-md border px-3 py-2">+ Add</button>
      </div>

      {list.length === 0 && <p className="text-zinc-600">No co-travellers yet.</p>}

      <ul className="space-y-3">
        {list.map((c) => (
          <li key={c._id} className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{c.firstName} {c.lastName}</div>
                <div className="text-sm text-zinc-600">{c.relationship || c.gender || ""}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(c)} className="rounded-md border px-3 py-2">Edit</button>
                <button onClick={() => remove(c._id!)} className="rounded-md border px-3 py-2">Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <Editor
          value={editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
    </div>
  );
}

function Editor({ value, onClose, onSave }:{
  value: CoTraveller; onClose: ()=>void; onSave:(v:CoTraveller)=>void;
}) {
  const [v, setV] = useState<CoTraveller>(value);
  function set<K extends keyof CoTraveller>(k: K, val: any) { setV((p)=>({ ...p, [k]: val })); }
  function setPass<K extends keyof NonNullable<CoTraveller["passport"]>>(k: K, val: any){
    setV((p)=>({ ...p, passport: { ...(p.passport||{}), [k]: val } }));
  }
  return (
    <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">{v._id ? "Edit Co-Traveller" : "Add Co-Traveller"}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Input label="First & Middle Name" value={v.firstName || ""} onChange={(x)=>set("firstName", x)} />
          <Input label="Last Name" value={v.lastName || ""} onChange={(x)=>set("lastName", x)} />
          <Input label="Relationship" value={v.relationship || ""} onChange={(x)=>set("relationship", x)} />
          <Select label="Gender" value={v.gender || ""} onChange={(x)=>set("gender", x as any)} options={["male","female","other"]} />
          <Input type="date" label="Date of Birth" value={v.dob || ""} onChange={(x)=>set("dob", x)} />
          <Input label="Nationality" value={v.nationality || ""} onChange={(x)=>set("nationality", x)} />
          <Input label="Meal Preference" value={v.mealPreference || ""} onChange={(x)=>set("mealPreference", x)} />
          <Input label="Train Berth Preference" value={v.trainBerthPreference || ""} onChange={(x)=>set("trainBerthPreference", x)} />

          <Input label="Passport No." value={v.passport?.number || ""} onChange={(x)=>setPass("number", x)} />
          <Input type="date" label="Passport Expiry" value={v.passport?.expiry || ""} onChange={(x)=>setPass("expiry", x)} />
          <Input label="Issuing Country" value={v.passport?.issuingCountry || ""} onChange={(x)=>setPass("issuingCountry", x)} />

          <Input label="Mobile Number" value={v.phone || ""} onChange={(x)=>set("phone", x)} />
          <Input label="Email ID" value={v.email || ""} onChange={(x)=>set("email", x)} />

          <Input label="Frequent Flyer Airline" value={v.frequentFlyer?.airline || ""} onChange={(x)=>set("frequentFlyer", { ...(v.frequentFlyer||{}), airline:x })} />
          <Input label="Frequent Flyer Number" value={v.frequentFlyer?.number || ""} onChange={(x)=>set("frequentFlyer", { ...(v.frequentFlyer||{}), number:x })} />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border px-3 py-2">Cancel</button>
          <button onClick={()=>onSave(v)} className="rounded-md bg-[#00477f] px-4 py-2 text-white">Save</button>
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type="text" }:{label:string; value:string; onChange:(v:string)=>void; type?:string;}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-zinc-600">{label}</div>
      <input className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none"
        type={type} value={value} onChange={(e)=>onChange(e.target.value)} />
    </label>
  );
}
function Select({ label, value, onChange, options }:{
  label:string; value:string; onChange:(v:string)=>void; options:string[];
}) {
  return (
    <label className="block">
      <div className="mb-1 text-sm text-zinc-600">{label}</div>
      <select className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none bg-white"
        value={value} onChange={(e)=>onChange(e.target.value)}>
        <option value="">Select…</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
