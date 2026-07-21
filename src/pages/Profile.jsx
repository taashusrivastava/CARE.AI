import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { User } from "lucide-react";

const FIELDS = [
  ["age", "Age", "number"],
  ["gender", "Gender", "text"],
  ["blood_group", "Blood Group", "text"],
  ["height_cm", "Height (cm)", "number"],
  ["weight_kg", "Weight (kg)", "number"],
  ["contact_number", "Contact Number", "tel"],
  ["address", "Address", "text"],
  ["medical_history", "Medical History", "textarea"],
  ["allergies", "Allergies", "textarea"],
  ["current_medications", "Current Medications", "textarea"],
  ["chronic_diseases", "Chronic Diseases", "textarea"],
  ["emergency_contact_name", "Emergency Contact Name", "text"],
  ["emergency_contact_phone", "Emergency Contact Phone", "tel"],
];

export default function Profile() {
  const [p, setP] = useState({});
  const [busy, setBusy] = useState(false);
  useEffect(() => { api.get("/profile").then(r => setP(r.data || {})); }, []);

  const save = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const payload = {};
      Object.entries(p).forEach(([k, v]) => { if (v !== "" && v != null) payload[k] = v; });
      const r = await api.put("/profile", payload);
      setP(r.data);
      toast.success("Profile saved");
    } catch { toast.error("Could not save"); } finally { setBusy(false); }
  };

  const set = (k, v) => setP({ ...p, [k]: v });

  return (
    <div className="max-w-5xl mx-auto" data-testid="profile-page">
      <div className="glass-strong rounded-3xl p-6 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-100 grid place-items-center">
          <User className="w-6 h-6 text-purple-700" strokeWidth={2.5}/>
        </div>
        <div>
          <h1 className="font-display text-3xl">Your profile</h1>
          <p className="text-sm text-slate-500">Better data helps CareAI give more relevant guidance.</p>
        </div>
      </div>

      <form onSubmit={save} className="mt-6 glass rounded-3xl p-6 grid md:grid-cols-2 gap-4">
        {FIELDS.map(([k, label, type]) => (
          <label key={k} className={type === "textarea" ? "md:col-span-2" : ""}>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
            {type === "textarea" ? (
              <textarea data-testid={`profile-${k}`} value={p[k] || ""} onChange={(e)=>set(k, e.target.value)} rows={2}
                className="mt-1 w-full px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none focus:ring-4 focus:ring-rose-200 text-sm"/>
            ) : (
              <input data-testid={`profile-${k}`} type={type} value={p[k] ?? ""} onChange={(e)=>set(k, type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
                className="mt-1 w-full px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none focus:ring-4 focus:ring-rose-200 text-sm"/>
            )}
          </label>
        ))}
        <button data-testid="profile-save" disabled={busy} type="submit"
          className="md:col-span-2 mt-2 py-3 rounded-full bg-rose-400 text-white font-bold hover:scale-[1.01] transition disabled:opacity-60">
          {busy ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}

