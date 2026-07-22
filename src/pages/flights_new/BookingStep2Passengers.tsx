// ============================================================
//  BookingStep2Passengers.tsx — Step 2: Passenger Details
//  UI refreshed to match the PassengerDetails page visual language.
//  Props, state, hooks, and all frontend/backend logic are UNCHANGED.
// ============================================================

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, ChevronDown, ChevronUp, Building2, Info, Check } from "lucide-react";
import type { PassengerData, BookingFormState } from "./BookingShared";
import { FieldLabel, TextInput, SelectInput, SectionHeading, ErrorBanner } from "./BookingShared";
import { useAuth } from "../../context/AuthContext";

interface Step2Props {
  form: BookingFormState;
  paxTypes: ("Adult" | "Child" | "Infant")[];
  adults: number;
  needsPan: boolean;
  needsPassport: boolean;
  error: string | null;
  onChange: (form: BookingFormState) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function BookingStep2Passengers({
  form, paxTypes, adults, needsPan, needsPassport,
  error, onChange, onNext, onBack,
}: Step2Props) {

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let updated = { ...form };
    let dirty = false;

    if (!updated.contactEmail && user.email) {
      updated = { ...updated, contactEmail: user.email };
      dirty = true;
    }
    if (!updated.contactPhone && user.phone) {
      // Strip leading "+91" / "91" so it fits the bare-number field
      const bare = user.phone.replace(/^\+?91/, "").trim();
      updated = { ...updated, contactPhone: bare };
      dirty = true;
    }

    if (dirty) onChange(updated);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function updatePassenger(i: number, data: PassengerData) {
    const arr = [...form.passengers];
    arr[i] = data;
    onChange({ ...form, passengers: arr });
  }

  return (
    <div>
      <SectionHeading
        step="2"
        title="Passenger Details"
        desc={needsPassport
          ? "International flight — passport details are mandatory for all passengers."
          : "Names must exactly match your government-issued photo ID."}
      />

      {needsPassport && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-5 py-4 mb-6"
        >
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
            <span className="text-lg">🛂</span>
          </div>
          <div>
            <div className="font-black text-orange-900 text-sm mb-0.5">International Travel — Passport Required</div>
            <p className="text-xs text-orange-700 leading-relaxed">All passengers must provide a valid passport. Must be valid for at least 6 months beyond the travel date.</p>
          </div>
        </motion.div>
      )}

      {/* Passenger cards */}
      {form.passengers.map((pax, i) => (
        <PassengerCard
          key={i}
          index={i}
          paxType={paxTypes[i]}
          data={pax}
          needsPan={needsPan && paxTypes[i] === "Adult"}
          needsPassport={needsPassport}
          onChange={(d) => updatePassenger(i, d)}
          delay={0.04 + i * 0.04}
        />
      ))}

      {/* Contact details */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 + form.passengers.length * 0.04 }}
        className="mt-2 mb-4 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
      >
        <div
          className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100"
          style={{ background: "linear-gradient(90deg,#f0fdf4,#f8faff)" }}
        >
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
            <Mail size={15} className="text-green-600" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-slate-800">Contact Details</div>
            <div className="text-[11px] text-slate-400">Your e-ticket and booking updates will be sent here</div>
          </div>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <FieldLabel required>Email Address</FieldLabel>
              <TextInput
                type="email" value={form.contactEmail}
                onChange={(v) => onChange({ ...form, contactEmail: v })}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <FieldLabel required>Mobile Number</FieldLabel>
              <div className="flex gap-2">
                <div className="w-16 shrink-0">
                  <TextInput value="+91" onChange={() => {}} className="text-center text-slate-400" disabled />
                </div>
                <TextInput
                  type="tel" value={form.contactPhone}
                  onChange={(v) => onChange({ ...form, contactPhone: v })}
                  placeholder="9876543210"
                />
              </div>
            </div>
          </div>

          {/* Privacy note */}
          <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: "#fffbeb", border: "1px solid #fde68a" }}>
            <Info size={13} className="text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              Your details are shared only with the airline for booking purposes and are never sold to third parties.
            </p>
          </div>
        </div>
      </motion.div>

      {/* GST section */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 + form.passengers.length * 0.04 }}
      >
        <GSTSection form={form} onChange={onChange} />
      </motion.div>

      {error && <ErrorBanner message={error} />}

      <div className="flex gap-3 mt-6">
        <button
          onClick={onBack}
          className="flex-1 border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-2xl text-sm hover:border-slate-300 hover:bg-white transition-all"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-[2] flex items-center justify-center gap-2 text-white font-black py-3.5 rounded-2xl text-sm shadow-lg shadow-blue-200 hover:opacity-95 active:scale-[0.99] transition-all"
          style={{ background: "linear-gradient(135deg,#2563eb,#1d4ed8)" }}
        >
          Continue to Seat Selection
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── PASSENGER CARD ───────────────────────────────────────────

function PassengerCard({ index, paxType, data, needsPan, needsPassport, onChange, delay = 0 }: {
  index: number;
  paxType: "Adult" | "Child" | "Infant";
  data: PassengerData;
  needsPan: boolean;
  needsPassport: boolean;
  onChange: (d: PassengerData) => void;
  delay?: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showFF, setShowFF] = useState(false);

  const titles = paxType === "Adult"
    ? [{ value: "Mr", label: "Mr" }, { value: "Mrs", label: "Mrs" }, { value: "Ms", label: "Ms" }]
    : [{ value: "Mstr", label: "Mstr" }, { value: "Miss", label: "Miss" }];

  const paxStyle = {
    Adult: { pill: "bg-blue-100 text-blue-700", badge: "bg-blue-600" },
    Child: { pill: "bg-violet-100 text-violet-700", badge: "bg-violet-600" },
    Infant: { pill: "bg-pink-100 text-pink-700", badge: "bg-pink-600" },
  }[paxType];

  const hasName = data.firstName.trim() && data.lastName.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-4"
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors"
        style={{ background: "linear-gradient(90deg,#eff6ff,#f8faff)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full ${paxStyle.badge} flex items-center justify-center shrink-0`}>
            <User size={15} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${paxStyle.pill}`}>{paxType}</span>
              {needsPassport && (
                <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">🛂 Passport req.</span>
              )}
            </div>
            <div className="text-[13px] font-bold text-slate-800 mt-0.5">
              {hasName ? `${data.title} ${data.firstName} ${data.lastName}` : `Passenger ${index + 1}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasName && !expanded && (
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Check size={11} className="text-emerald-600" strokeWidth={3} />
            </div>
          )}
          {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5 pt-4 border-t border-slate-100">
              {/* Name row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <FieldLabel required>Title</FieldLabel>
                  <SelectInput
                    value={data.title}
                    onChange={(v) => {
                      const title = v as PassengerData["title"];
                      const gender: "Male" | "Female" =
                        title === "Mrs" || title === "Ms" || title === "Miss" ? "Female" : "Male";
                      onChange({ ...data, title, gender });
                    }}
                    options={titles}
                  />
                </div>
                <div>
                  <FieldLabel required>First Name</FieldLabel>
                  <TextInput value={data.firstName} onChange={(v) => onChange({ ...data, firstName: v })} placeholder="As on ID" />
                </div>
                <div>
                  <FieldLabel required>Last Name</FieldLabel>
                  <TextInput value={data.lastName} onChange={(v) => onChange({ ...data, lastName: v })} placeholder="As on ID" />
                </div>
                <div>
                  <FieldLabel required>Gender</FieldLabel>
                  <SelectInput
                    value={data.gender}
                    onChange={(v) => onChange({ ...data, gender: v as "Male" | "Female" })}
                    options={[{ value: "Male", label: "Male" }, { value: "Female", label: "Female" }]}
                  />
                </div>
              </div>

              {/* DOB / Nationality / PAN */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <FieldLabel required={true}>Date of Birth</FieldLabel>
                  <TextInput type="date" value={data.dob} onChange={(v) => onChange({ ...data, dob: v })} />
                </div>
                <div>
                  <FieldLabel required>Nationality</FieldLabel>
                  <TextInput
                    value={data.nationality}
                    onChange={(v) => onChange({ ...data, nationality: v.toUpperCase().slice(0, 2) })}
                    placeholder="IN"
                  />
                </div>
                {needsPan && (
                  <div className="md:col-span-2">
                    <FieldLabel required>PAN Number</FieldLabel>
                    <TextInput
                      value={data.panNumber}
                      onChange={(v) => onChange({ ...data, panNumber: v.toUpperCase().slice(0, 10) })}
                      placeholder="ABCDE1234F"
                      className="font-mono tracking-widest"
                    />
                  </div>
                )}
              </div>

              {/* Passport section */}
              {needsPassport && (
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">🛂</span>
                    <span className="font-bold text-orange-900 text-sm">Passport Details</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <FieldLabel required>Passport Number</FieldLabel>
                      <TextInput
                        value={data.passportNo}
                        onChange={(v) => onChange({ ...data, passportNo: v.toUpperCase() })}
                        placeholder="A1234567"
                        className="font-mono tracking-widest"
                      />
                    </div>
                    <div>
                      <FieldLabel required>Passport Expiry</FieldLabel>
                      <TextInput
                        type="date"
                        value={data.passportExpiry}
                        onChange={(v) => onChange({ ...data, passportExpiry: v })}
                      />
                    </div>
                    <div>
                      <FieldLabel required>Issuing Country</FieldLabel>
                      <TextInput
                        value={data.nationality}
                        onChange={(v) => onChange({ ...data, nationality: v.toUpperCase().slice(0, 2) })}
                        placeholder="IN"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-orange-600 mt-3 font-medium">
                    ⚠️ Passport must be valid for at least 6 months beyond your travel date.
                  </p>
                </div>
              )}

              {/* Frequent flyer */}
              <button
                type="button"
                onClick={() => setShowFF((v) => !v)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showFF ? "M20 12H4" : "M12 4v16m8-8H4"} />
                </svg>
                {showFF ? "Remove" : "Add"} Frequent Flyer Number
              </button>

              <AnimatePresence initial={false}>
                {showFF && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <FieldLabel>Airline Code</FieldLabel>
                        <TextInput value={data.ffAirlineCode} onChange={(v) => onChange({ ...data, ffAirlineCode: v.toUpperCase() })} placeholder="AI" />
                      </div>
                      <div>
                        <FieldLabel>FF Number</FieldLabel>
                        <TextInput value={data.ffNumber} onChange={(v) => onChange({ ...data, ffNumber: v })} placeholder="123456789" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── GST SECTION ─────────────────────────────────────────────

function GSTSection({ form, onChange }: { form: BookingFormState; onChange: (f: BookingFormState) => void }) {
  const [show, setShow] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
            <Building2 size={15} className="text-blue-600" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-slate-800">GST Invoice</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Optional — for business travel reimbursement</div>
          </div>
        </div>
        {show ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </button>

      <AnimatePresence initial={false}>
        {show && (
          <motion.div
            key="gst-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FieldLabel>GSTIN</FieldLabel>
                <TextInput value={form.gstNumber} onChange={(v) => onChange({ ...form, gstNumber: v.toUpperCase() })} placeholder="22AAAAA0000A1Z5" className="font-mono tracking-wider" />
              </div>
              <div>
                <FieldLabel>Company Name</FieldLabel>
                <TextInput value={form.gstCompanyName} onChange={(v) => onChange({ ...form, gstCompanyName: v })} placeholder="Acme Pvt. Ltd." />
              </div>
              <div>
                <FieldLabel>Company Email</FieldLabel>
                <TextInput type="email" value={form.gstCompanyEmail} onChange={(v) => onChange({ ...form, gstCompanyEmail: v })} placeholder="accounts@acme.com" />
              </div>
              <div>
                <FieldLabel>Registered Address</FieldLabel>
                <TextInput value={form.gstCompanyAddress} onChange={(v) => onChange({ ...form, gstCompanyAddress: v })} placeholder="123 Business Park, Mumbai" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}