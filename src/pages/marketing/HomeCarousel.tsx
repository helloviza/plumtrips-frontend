// src/pages/marketing/HomeCarousel.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  getHomeCarousels,
  createHomeCarousel,
  updateHomeCarousel,
  deleteHomeCarousel,
  type HomeCarousel,
} from "../../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type FormMode = "add" | "edit";

// ─── Blank form state ─────────────────────────────────────────────────────────
const blank = (): Omit<HomeCarousel, "id"> => ({
  name: "",
  image: "",
});

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  mode: FormMode;
  initial: Omit<HomeCarousel, "id"> & { id?: string };
  onClose: () => void;
  onSave: (data: Omit<HomeCarousel, "id">, imageFile: File | null, id?: string) => Promise<void>;
}

function HomeCarouselModal({ mode, initial, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initial.image ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      set("image", "");
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Name is required."); return; }
    if (mode === "add" && !imageFile) { setError("Please upload an image."); return; }

    setSaving(true);
    try {
      const { id, ...payload } = form as HomeCarousel;
      await onSave(payload, imageFile, mode === "edit" ? id : undefined);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#00477f]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-[#00477f]">
              {mode === "add" ? "Add Carousel Item" : "Edit Carousel Item"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === "add" ? "Fill in the details below" : "Update the fields"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Name *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Summer Sale Banner"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00477f]/30 focus:border-[#00477f] transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Image {mode === "add" ? "*" : "(leave blank to keep current)"}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative flex flex-col items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed border-slate-200 hover:border-[#00477f] cursor-pointer transition-colors bg-slate-50 hover:bg-[#00477f]/5 overflow-hidden"
              style={{ minHeight: "120px" }}
            >
              {imagePreview ? (
                <>
                  <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                  <span className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm text-[10px] font-semibold text-slate-500 px-2 py-0.5 rounded-full shadow">
                    Click to change
                  </span>
                </>
              ) : (
                <>
                  <span className="text-2xl">🖼️</span>
                  <p className="text-xs text-slate-400">Click to upload an image</p>
                  <p className="text-[10px] text-slate-300">PNG, JPG, WEBP accepted</p>
                </>
              )}
            </div>
            {imageFile && (
              <p className="mt-1.5 text-[11px] text-slate-400 truncate">
                📎 {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#d06549] hover:bg-[#b8543a] disabled:opacity-60 transition shadow-sm"
          >
            {saving ? "Saving…" : mode === "add" ? "Add Item" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#00477f]/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🗑️</span>
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Delete Item?</h3>
        <p className="text-sm text-slate-500 mb-5">
          <span className="font-semibold text-slate-700">"{name}"</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomeCarouselPage() {
  const [items, setItems] = useState<HomeCarousel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: FormMode; item?: HomeCarousel } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<HomeCarousel | null>(null);
  const [searchQ, setSearchQ] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHomeCarousels();
      setItems(data);
    } catch {
      console.error("Failed to load carousel items");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (payload: Omit<HomeCarousel, "id">, imageFile: File | null, id?: string) => {
    if (id) {
      const updated = await updateHomeCarousel(id, payload, imageFile ?? undefined);
      setItems((p) => p.map((c) => (c.id === id ? updated : c)));
    } else {
      const created = await createHomeCarousel(payload, imageFile!);
      setItems((p) => [created, ...p]);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteHomeCarousel(deleteTarget.id);
    setItems((p) => p.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const filtered = items.filter((c) =>
    c.name.toLowerCase().includes(searchQ.toLowerCase())
  );

  return (
    <div className="min-h-screen px-6 py-8" style={{ background: "#f0f4f8", fontFamily: "'Exo 2', system-ui, sans-serif" }}>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#00477f" }}>Home Carousel</h1>
          <p className="text-sm text-slate-500 mt-0.5">{items.length} item{items.length !== 1 ? "s" : ""} total</p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
          style={{ background: "#d06549" }}
        >
          <span className="text-base leading-none">＋</span>
          Add Item
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search items…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:border-[#00477f] transition"
          />
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">Loading carousel items…</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm gap-2">
            <span className="text-3xl">🖼️</span>
            <p>No carousel items found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Image", "Name", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr
                    key={c.id}
                    className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors ${i === filtered.length - 1 ? "border-b-0" : ""}`}
                  >
                    <td className="px-5 py-4">
                      {c.image ? (
                        <img
                          src={c.image}
                          alt={c.name}
                          className="w-20 h-12 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-20 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-slate-300 text-xs">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-800">{c.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModal({ mode: "edit", item: c })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#00477f] bg-[#00477f]/8 hover:bg-[#00477f]/15 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <HomeCarouselModal
          mode={modal.mode}
          initial={modal.item ? { ...modal.item } : (blank() as HomeCarousel)}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          name={deleteTarget.name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}