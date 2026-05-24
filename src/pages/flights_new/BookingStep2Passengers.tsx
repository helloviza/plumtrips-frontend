// ============================================================
//  BookingStep2Passengers.tsx — Step 2: Passenger Details
// ============================================================

import { useState } from "react";
import type { PassengerData, BookingFormState } from "./BookingShared";
import { FieldLabel, TextInput, SelectInput, SectionHeading, ErrorBanner } from "./BookingShared";

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
        <div className="flex items-start gap-3 bg-orange-50 border-2 border-orange-200 rounded-2xl px-5 py-4 mb-6">
          <span className="text-2xl shrink-0">🛂</span>
          <div>
            <div className="font-black text-orange-900 text-sm mb-0.5">International Travel — Passport Required</div>
            <p className="text-xs text-orange-700 leading-relaxed">All passengers must provide a valid passport. Must be valid for at least 6 months beyond the travel date.</p>
          </div>
        </div>
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
        />
      ))}

      {/* Contact details */}
      <div className="mt-2 mb-4">
        <SectionHeading title="Contact Details" desc="Your e-ticket and booking updates will be sent here." />
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
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
        </div>
      </div>

      {/* GST section */}
      <GSTSection form={form} onChange={onChange} />

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
          className="flex-2 flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 rounded-2xl text-sm transition-all shadow-lg shadow-blue-200"
        >
          Continue to Seat Selection →
        </button>
      </div>
    </div>
  );
}

// ─── PASSENGER CARD ───────────────────────────────────────────

function PassengerCard({ index, paxType, data, needsPan, needsPassport, onChange }: {
  index: number;
  paxType: "Adult" | "Child" | "Infant";
  data: PassengerData;
  needsPan: boolean;
  needsPassport: boolean;
  onChange: (d: PassengerData) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [showFF, setShowFF] = useState(false);

  const titles = paxType === "Adult"
    ? [{ value: "Mr", label: "Mr" }, { value: "Mrs", label: "Mrs" }, { value: "Ms", label: "Ms" }]
    : [{ value: "Mstr", label: "Mstr" }, { value: "Miss", label: "Miss" }];

  const paxStyle = {
    Adult: { pill: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
    Child: { pill: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
    Infant: { pill: "bg-pink-100 text-pink-700", dot: "bg-pink-500" },
  }[paxType];

  const hasName = data.firstName.trim() && data.lastName.trim();

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden mb-4">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors text-left group"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-8 rounded-full ${paxStyle.dot}`} />
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${paxStyle.pill}`}>{paxType}</span>
              {needsPassport && (
                <span className="text-[9px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">🛂 Passport req.</span>
              )}
            </div>
            <div className="font-black text-slate-900 text-sm mt-0.5">
              {hasName ? `${data.title} ${data.firstName} ${data.lastName}` : `Passenger ${index + 1}`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasName && !expanded && (
            <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <svg className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-slate-100">
          {/* Name row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <FieldLabel required>Title</FieldLabel>
              <SelectInput
                value={data.title}
                onChange={(v) => onChange({ ...data, title: v as PassengerData["title"] })}
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
              <FieldLabel required={paxType !== "Adult"}>Date of Birth</FieldLabel>
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

          {showFF && (
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
          )}
        </div>
      )}
    </div>
  );
}

// ─── GST SECTION ─────────────────────────────────────────────

function GSTSection({ form, onChange }: { form: BookingFormState; onChange: (f: BookingFormState) => void }) {
  const [show, setShow] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold text-slate-900 text-sm">GST Invoice</div>
          <div className="text-xs text-slate-400 mt-0.5">Optional — for business travel reimbursement</div>
        </div>
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className={`relative w-11 h-6 rounded-full transition-colors ${show ? "bg-blue-600" : "bg-slate-200"}`}
        >
          <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${show ? "translate-x-5" : ""}`} />
        </button>
      </div>

      {show && (
        <div className="mt-5 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4">
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
      )}
    </div>
  );
}