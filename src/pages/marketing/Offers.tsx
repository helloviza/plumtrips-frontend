// src/pages/marketing/Offers.tsx
import { useState, useEffect, useCallback, useRef } from "react";
import {
  getOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  type OfferType,
  type Offer,
} from "../../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────
type FormMode = "add" | "edit";

const OFFER_TYPES: OfferType[] = [
  "Hotel", "Flight", "Tour", "Transfer", "Activity", "Package", "Other",
];

const TYPE_META: Record<OfferType, { emoji: string; color: string; bg: string }> = {
  Hotel:    { emoji: "🏨", color: "text-sky-700",    bg: "bg-sky-50"    },
  Flight:   { emoji: "✈️", color: "text-indigo-700", bg: "bg-indigo-50" },
  Tour:     { emoji: "🗺️", color: "text-teal-700",   bg: "bg-teal-50"   },
  Transfer: { emoji: "🚌", color: "text-orange-700", bg: "bg-orange-50" },
  Activity: { emoji: "🎯", color: "text-pink-700",   bg: "bg-pink-50"   },
  Package:  { emoji: "📦", color: "text-violet-700", bg: "bg-violet-50" },
  Other:    { emoji: "✨", color: "text-slate-700",  bg: "bg-slate-100" },
};

// ─── Blank form state ─────────────────────────────────────────────────────────
const blank = (): Omit<Offer, "id"> => ({
  type: "Hotel",
  title: "",
  subtitle: "",
  img: "",
  active: true,
});

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${
        active
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-slate-400"}`} />
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function TypeBadge({ type }: { type: OfferType }) {
  const m = TYPE_META[type];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${m.bg} ${m.color}`}>
      {m.emoji} {type}
    </span>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ModalProps {
  mode: FormMode;
  initial: Omit<Offer, "id"> & { id?: string };
  onClose: () => void;
  // Consistent with Cruises/Holidays: imageFile is a separate arg, not bundled in payload
  onSave: (data: Omit<Offer, "id">, imageFile: File | null, id?: string) => Promise<void>;
}

function OfferModal({ mode, initial, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initial.img ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof typeof form, v: unknown) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      set("img", ""); // clear stale URL; real S3 URL will come back from server
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleSubmit = async () => {
    if (!form.title.trim()) { setError("Title is required."); return; }
    // Require an image on create, same as Cruises/Holidays
    if (mode === "add" && !imageFile) { setError("Please upload an image."); return; }

    setSaving(true);
    try {
      const { id, ...payload } = form as Offer;
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-[#00477f]">
              {mode === "add" ? "Add Offer" : "Edit Offer"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === "add" ? "Create a new offer listing" : "Update offer details"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {/* Offer Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
              Offer Type *
            </label>
            <div className="grid grid-cols-4 gap-2">
              {OFFER_TYPES.map((t) => {
                const m = TYPE_META[t];
                const active = form.type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => set("type", t)}
                    className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                      active
                        ? "border-[#00477f] bg-[#00477f]/6 text-[#00477f]"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <span className="text-base">{m.emoji}</span>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Title *
            </label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="e.g. Dubai Marina Luxury"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00477f]/30 focus:border-[#00477f] transition"
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Subtitle
            </label>
            <input
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              placeholder="e.g. 3 Nights – Breakfast Included"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-[#00477f]/30 focus:border-[#00477f] transition"
            />
          </div>

          {/* Image upload — consistent with Cruises/Holidays drag-zone style */}
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
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-xl"
                  />
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

          {/* Active toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
            <button
              type="button"
              role="switch"
              aria-checked={form.active}
              onClick={() => set("active", !form.active)}
              className={`relative w-10 h-5.5 rounded-full transition-colors ${
                form.active ? "bg-[#00477f]" : "bg-slate-200"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${
                  form.active ? "translate-x-4.5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm text-slate-700">Active</span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#d06549] hover:bg-[#b8543a] disabled:opacity-60 transition shadow-sm"
          >
            {saving ? "Saving…" : mode === "add" ? "Add Offer" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({
  title,
  onConfirm,
  onCancel,
}: {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#00477f]/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🗑️</span>
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">Delete Offer?</h3>
        <p className="text-sm text-slate-500 mb-5">
          <span className="font-semibold text-slate-700">"{title}"</span> will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function OffersPage() {
  const [items, setItems] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ mode: FormMode; item?: Offer } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Offer | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | OfferType>("All");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getOffers();
      setItems(data);
    } catch {
      console.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Consistent with Cruises/Holidays: imageFile is a separate argument.
  // For edit with no new image, imageFile is null — api.ts updateOffer keeps existing img URL.
  const handleSave = async (
    payload: Omit<Offer, "id">,
    imageFile: File | null,
    id?: string
  ) => {
    if (id) {
      const updated = await updateOffer(id, payload, imageFile ?? undefined);
      setItems((p) => p.map((o) => (o.id === id ? updated : o)));
    } else {
      const created = await createOffer(payload, imageFile!);
      setItems((p) => [created, ...p]);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteOffer(deleteTarget.id);
    setItems((p) => p.filter((o) => o.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const filtered = items.filter((o) => {
    const matchQ =
      o.title.toLowerCase().includes(searchQ.toLowerCase()) ||
      o.subtitle.toLowerCase().includes(searchQ.toLowerCase());
    const matchType = typeFilter === "All" || o.type === typeFilter;
    return matchQ && matchType;
  });

  const typeCounts = OFFER_TYPES.reduce(
    (acc, t) => ({ ...acc, [t]: items.filter((o) => o.type === t).length }),
    {} as Record<OfferType, number>
  );

  return (
    <div
      className="min-h-screen px-6 py-8"
      style={{ background: "#f0f4f8", fontFamily: "'Exo 2', system-ui, sans-serif" }}
    >
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#00477f" }}>
            Offers
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {items.length} offer{items.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: "add" })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
          style={{ background: "#d06549" }}
        >
          <span className="text-base leading-none">＋</span>
          Add Offer
        </button>
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setTypeFilter("All")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            typeFilter === "All"
              ? "text-white shadow-sm"
              : "bg-white text-slate-500 border border-slate-200 hover:border-[#00477f] hover:text-[#00477f]"
          }`}
          style={typeFilter === "All" ? { background: "#00477f" } : {}}
        >
          All ({items.length})
        </button>
        {OFFER_TYPES.map((t) => {
          const m = TYPE_META[t];
          const active = typeFilter === t;
          return (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                active
                  ? "text-white shadow-sm"
                  : "bg-white text-slate-500 border border-slate-200 hover:border-[#00477f] hover:text-[#00477f]"
              }`}
              style={active ? { background: "#00477f" } : {}}
            >
              {m.emoji} {t} ({typeCounts[t] ?? 0})
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
        <input
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
          placeholder="Search offers…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 placeholder-slate-300 focus:outline-none focus:ring-2 focus:border-[#00477f] transition"
        />
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
            Loading offers…
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm gap-2">
            <span className="text-3xl">🎁</span>
            <p>No offers found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Offer", "Type", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((o, i) => (
                  <tr
                    key={o.id}
                    className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors ${
                      i === filtered.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    {/* Offer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {o.img ? (
                          <img
                            src={o.img}
                            alt={o.title}
                            className="w-12 h-10 rounded-lg object-cover shrink-0 border border-slate-100"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-lg">
                            {TYPE_META[o.type].emoji}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-800">{o.title}</p>
                          <p className="text-xs text-slate-400">{o.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    {/* Type */}
                    <td className="px-5 py-4">
                      <TypeBadge type={o.type} />
                    </td>
                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge active={o.active} />
                    </td>
                    {/* Actions */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setModal({ mode: "edit", item: o })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#00477f] bg-[#00477f]/8 hover:bg-[#00477f]/15 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(o)}
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

      {/* Stats bar */}
      <div className="mt-4 flex gap-4 text-xs text-slate-400">
        <span>{items.filter((o) => o.active).length} active</span>
        <span>·</span>
        <span>{items.filter((o) => !o.active).length} inactive</span>
        {OFFER_TYPES.map((t) =>
          typeCounts[t] > 0 ? (
            <span key={t}>
              · {typeCounts[t]} {t.toLowerCase()}{typeCounts[t] !== 1 ? "s" : ""}
            </span>
          ) : null
        )}
      </div>

      {/* Modals */}
      {modal && (
        <OfferModal
          mode={modal.mode}
          initial={modal.item ? { ...modal.item } : (blank() as Offer)}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          title={deleteTarget.title}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}