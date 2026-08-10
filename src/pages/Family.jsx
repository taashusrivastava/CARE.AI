import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, Plus, Trash2, Phone, Droplet, Stethoscope, Pill, Syringe, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const EMPTY = {
  name: "",
  relationship: "",
  age: "",
  gender: "",
  blood_group: "",
  medical_history: "",
  allergies: "",
  medications: "",
  vaccination_schedule: "",
  contact_number: "",
  emergency_contact_phone: "",
};

export default function Family() {
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState(EMPTY);

  const load = () => api.get("/family").then(r => setMembers(r.data));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.name || !form.relationship || !form.age) return toast.error("Name, relationship & age required");
    try {
      await api.post("/family", { ...form, age: Number(form.age) || 0 });
      setForm(EMPTY);
      load();
      toast.success("Family member added");
    } catch { toast.error("Failed to add member"); }
  };

  const del = async (id) => {
    await api.delete(`/family/${id}`);
    load();
    toast.success("Member removed");
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="max-w-6xl mx-auto" data-testid="family-page">
      <div className="glass-strong rounded-3xl p-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-teal-100 grid place-items-center">
          <Users className="w-5 h-5 text-teal-700" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-display text-3xl">Family Healthcare</h1>
          <p className="text-sm text-slate-500">Track health details for every family member.</p>
        </div>
      </div>

      <form onSubmit={add} className="mt-6 glass rounded-3xl p-6 grid md:grid-cols-3 gap-3">
        <input data-testid="family-name" placeholder="Full name" value={form.name} onChange={(e)=>set("name", e.target.value)}
          className="px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="family-relationship" placeholder="Relationship (e.g. Mother)" value={form.relationship} onChange={(e)=>set("relationship", e.target.value)}
          className="px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="family-age" type="number" placeholder="Age" value={form.age} onChange={(e)=>set("age", e.target.value)}
          className="px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="family-gender" placeholder="Gender" value={form.gender} onChange={(e)=>set("gender", e.target.value)}
          className="px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="family-blood" placeholder="Blood group" value={form.blood_group} onChange={(e)=>set("blood_group", e.target.value)}
          className="px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="family-phone" placeholder="Contact number" value={form.contact_number} onChange={(e)=>set("contact_number", e.target.value)}
          className="px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="family-history" placeholder="Medical history" value={form.medical_history} onChange={(e)=>set("medical_history", e.target.value)}
          className="md:col-span-3 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="family-allergies" placeholder="Allergies" value={form.allergies} onChange={(e)=>set("allergies", e.target.value)}
          className="md:col-span-3 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="family-meds" placeholder="Current medications" value={form.medications} onChange={(e)=>set("medications", e.target.value)}
          className="md:col-span-3 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="family-vacc" placeholder="Vaccination schedule" value={form.vaccination_schedule} onChange={(e)=>set("vaccination_schedule", e.target.value)}
          className="md:col-span-3 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <button data-testid="family-add" type="submit"
          className="md:col-span-3 py-2.5 rounded-full bg-teal-400 text-white font-bold hover:scale-[1.01] transition inline-flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> Add family member
        </button>
      </form>

      {members.length === 0 && (
        <div className="mt-6 glass rounded-3xl p-6 text-slate-500">No family members yet. Add one above to keep everyone's health in one place.</div>
      )}

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {members.map((m) => (
          <div key={m.id} className="glass rounded-3xl p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-teal-100 grid place-items-center">
                  <Users className="w-5 h-5 text-teal-700" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="font-display text-xl">{m.name}</div>
                  <div className="text-sm text-slate-500">{m.relationship}{m.age ? ` · ${m.age} yrs` : ""}{m.gender ? ` · ${m.gender}` : ""}</div>
                </div>
              </div>
              <button onClick={() => del(m.id)} className="p-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200" data-testid={`family-del-${m.id}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2 text-sm">
              {m.blood_group && <Info icon={Droplet} label="Blood group" value={m.blood_group} />}
              {m.medical_history && <Info icon={Stethoscope} label="Medical history" value={m.medical_history} />}
              {m.allergies && <Info icon={AlertTriangle} label="Allergies" value={m.allergies} />}
              {m.medications && <Info icon={Pill} label="Medications" value={m.medications} />}
              {m.vaccination_schedule && <Info icon={Syringe} label="Vaccinations" value={m.vaccination_schedule} />}
              {m.contact_number && <Info icon={Phone} label="Contact" value={m.contact_number} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" strokeWidth={2.2} />
      <span><b className="text-slate-600">{label}:</b> <span className="text-slate-700">{value}</span></span>
    </div>
  );
}
