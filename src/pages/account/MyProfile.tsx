import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import ProfileMeter from "../../components/profile/ProfileMeter";

type Profile = {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  dob?: string;
  nationality?: string;
  maritalStatus?: string;
  anniversary?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  pan?: string;
  passport?: { number?: string; expiry?: string; issuingCountry?: string };
  emergencyContact?: { name?: string; phone?: string };
  preferences?: {
    domesticTripProtection?: string;
    internationalTravelInsurance?: string;
  };
  frequentFlyers?: { airline?: string; number?: string }[];
};

// Ensure <input type="date"> always receives YYYY-MM-DD
function normalizeDateInput(v?: string) {
  if (!v) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v;
  const s = String(v);
  const head = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (head) return head[1];
  const d = new Date(s);
  return isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

export default function MyProfile() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<Profile>({});

  async function fetchProfile() {
    const data = await api.get<{ ok?: boolean; profile?: Profile }>(
      `/api/v1/me/profile?ts=${Date.now()}`
    );
    setProfile(data?.profile || {});
  }

  useEffect(() => {
    fetchProfile().catch(console.error);
  }, []);

  const set = (k: keyof Profile, v: any) =>
    setProfile((p) => ({ ...p, [k]: v }));

  async function onSave() {
    setSaving(true);
    setSaved(false);
    try {
      // Save and use the server’s canonical response
      const data = await api.put<{ ok: boolean; profile: Profile }>(
        "/api/v1/me/profile",
        { profile }
      );
      setProfile(data?.profile || profile);

      // Success overlay → brief pause → hard refresh
      setSaved(true);
      setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
      {/* Sticky header */}
      <div className="sticky top-[64px] z-10 flex items-center justify-between gap-4 border-b bg-white/90 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <h2 className="text-xl font-semibold text-zinc-900">My Profile</h2>
        <button
          onClick={onSave}
          disabled={saving}
          className="rounded-xl bg-sky-700 px-5 py-2 font-semibold text-white shadow-sm hover:bg-sky-800 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {/* Processing / success overlay */}
      {(saving || saved) && (
        <div className="pointer-events-auto fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl ring-1 ring-zinc-200">
            <div className="flex items-center gap-3">
              {!saved ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-800" />
              ) : (
                <svg
                  className="h-5 w-5 text-emerald-600"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
              <div className="text-sm font-medium text-zinc-900">
                {saved ? "Your Profile has been updated." : "Saving your profile…"}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8 p-6">
        {/* Profile Completion Meter */}
        <section className="rounded-xl border border-zinc-200 p-5">
          <ProfileMeter />
        </section>

        {/* General Information */}
        <section className="rounded-xl border border-zinc-200 p-5">
          <h3 className="mb-4 text-base font-semibold text-zinc-900">
            General Information
          </h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-2">
              <Input
                label="First & Middle Name"
                value={profile.firstName || ""}
                onChange={(v) => set("firstName", v)}
              />
              <Input
                label="Last Name"
                value={profile.lastName || ""}
                onChange={(v) => set("lastName", v)}
              />
            </div>

            <Select
              label="Gender"
              value={profile.gender || ""}
              onChange={(v) => set("gender", v)}
              options={["male", "female", "other"]}
              placeholder="Select…"
            />
            <Input
              label="Date of Birth"
              type="date"
              value={normalizeDateInput(profile.dob)}
              onChange={(v) => set("dob", v)}
            />

            <Input
              label="Nationality"
              value={profile.nationality || ""}
              onChange={(v) => set("nationality", v)}
            />
            <Select
              label="Marital Status"
              value={profile.maritalStatus || ""}
              onChange={(v) => set("maritalStatus", v)}
              options={["single", "married", "divorced", "widowed"]}
              placeholder="Select…"
            />

            <Input
              label="Anniversary"
              type="date"
              value={normalizeDateInput(profile.anniversary)}
              onChange={(v) => set("anniversary", v)}
            />
          </div>
        </section>

        {/* Address */}
        <section id="address" className="rounded-xl border border-zinc-200 p-5">
          <h3 className="mb-4 text-base font-semibold text-zinc-900">Address</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input
              label="City of Residence"
              value={profile.city || ""}
              onChange={(v) => set("city", v)}
            />
            <Input
              label="State"
              value={profile.state || ""}
              onChange={(v) => set("state", v)}
            />
            <Input
              label="Country"
              value={profile.country || ""}
              onChange={(v) => set("country", v)}
            />
            <Input
              label="Postal Code"
              value={profile.postalCode || ""}
              onChange={(v) => set("postalCode", v)}
            />
          </div>
        </section>

        {/* Documents */}
        <section id="passport" className="rounded-xl border border-zinc-200 p-5">
          <h3 className="mb-4 text-base font-semibold text-zinc-900">Documents</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Input label="PAN" value={profile.pan || ""} onChange={(v) => set("pan", v)} />
            <Input
              label="Passport No."
              value={profile.passport?.number || ""}
              onChange={(v) =>
                set("passport", { ...(profile.passport || {}), number: v })
              }
            />
            <Input
              label="Expiry Date"
              type="date"
              value={normalizeDateInput(profile.passport?.expiry)}
              onChange={(v) =>
                set("passport", { ...(profile.passport || {}), expiry: v })
              }
            />
            <Input
              label="Issuing Country"
              value={profile.passport?.issuingCountry || ""}
              onChange={(v) =>
                set("passport", { ...(profile.passport || {}), issuingCountry: v })
              }
            />
          </div>
        </section>

        {/* Emergency Contact */}
        <section id="emergency" className="rounded-xl border border-zinc-200 p-5">
          <h3 className="mb-4 text-base font-semibold text-zinc-900">
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Contact Name"
              value={profile.emergencyContact?.name || ""}
              onChange={(v) =>
                set("emergencyContact", {
                  ...(profile.emergencyContact || {}),
                  name: v,
                })
              }
            />
            <Input
              label="Contact Phone"
              value={profile.emergencyContact?.phone || ""}
              onChange={(v) =>
                set("emergencyContact", {
                  ...(profile.emergencyContact || {}),
                  phone: v,
                })
              }
              placeholder="+91-XXXXXXXXXX"
            />
          </div>
        </section>

        {/* Preferences */}
        <section id="preferences" className="rounded-xl border border-zinc-200 p-5">
          <h3 className="mb-4 text-base font-semibold text-zinc-900">Your Preferences</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Select
              label="Domestic Trip Protection Plan"
              value={profile.preferences?.domesticTripProtection || ""}
              onChange={(v) =>
                set("preferences", {
                  ...(profile.preferences || {}),
                  domesticTripProtection: v,
                })
              }
              options={["None", "Basic", "Plus", "Premium"]}
              placeholder="Select…"
            />
            <Select
              label="International Travel Insurance Plan"
              value={profile.preferences?.internationalTravelInsurance || ""}
              onChange={(v) =>
                set("preferences", {
                  ...(profile.preferences || {}),
                  internationalTravelInsurance: v,
                })
              }
              options={["None", "Basic", "Gold", "Platinum"]}
              placeholder="Select…"
            />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ——— Form primitives ——— */
function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-800">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-zinc-300 px-3 py-2 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-800">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none rounded-lg border border-zinc-300 bg-white px-3 py-2 outline-none ring-0 transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o[0].toUpperCase() + o.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}
