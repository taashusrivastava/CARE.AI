import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Pill, Plus, Trash2, Sun, Sunrise, Moon } from "lucide-react";
import { toast } from "sonner";

export default function Medicines() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", dose: "", morning: false, afternoon: false, night: false, notes: "" });

  const load = () => api.get("/medicines").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.name || !form.dose) return toast.error("Name & dose required");
    await api.post("/medicines", form);
    setForm({ name: "", dose: "", morning: false, afternoon: false, night: false, notes: "" });
    load();
    toast.success("Reminder added");
  };
  const del = async (id) => { await api.delete(`/medicines/${id}`); load(); };

  return (
    <div className="max-w-5xl mx-auto" data-testid="medicines-page">
      <div className="glass-strong rounded-3xl p-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-pink-100 grid place-items-center">
          <Pill className="w-5 h-5 text-pink-700" strokeWidth={2.5}/>
        </div>
        <div>
          <h1 className="font-display text-3xl">Medicine reminders</h1>
          <p className="text-sm text-slate-500">Track your daily doses.</p>
        </div>
      </div>

      <form onSubmit={add} className="mt-6 glass rounded-3xl p-6 grid md:grid-cols-6 gap-3">
        <input data-testid="med-name" placeholder="Medicine name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} className="md:col-span-3 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="med-dose" placeholder="Dose (e.g. 500mg)" value={form.dose} onChange={(e)=>setForm({...form, dose: e.target.value})} className="md:col-span-3 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <label className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-2xl bg-white/70 border border-white">
          <input type="checkbox" data-testid="med-morning" checked={form.morning} onChange={(e)=>setForm({...form, morning: e.target.checked})}/>
          <Sunrise className="w-4 h-4 text-amber-500"/> Morning
        </label>
        <label className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-2xl bg-white/70 border border-white">
          <input type="checkbox" data-testid="med-afternoon" checked={form.afternoon} onChange={(e)=>setForm({...form, afternoon: e.target.checked})}/>
          <Sun className="w-4 h-4 text-orange-500"/> Afternoon
        </label>
        <label className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-2xl bg-white/70 border border-white">
          <input type="checkbox" data-testid="med-night" checked={form.night} onChange={(e)=>setForm({...form, night: e.target.checked})}/>
          <Moon className="w-4 h-4 text-indigo-500"/> Night
        </label>
        <input data-testid="med-notes" placeholder="Notes (optional)" value={form.notes} onChange={(e)=>setForm({...form, notes: e.target.value})} className="md:col-span-3 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <button data-testid="med-add" type="submit" className="md:col-span-6 py-2.5 rounded-full bg-rose-400 text-white font-bold hover:scale-[1.01] transition inline-flex items-center justify-center gap-2">
          <Plus className="w-4 h-4"/> Add reminder
        </button>
      </form>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {items.length === 0 && <div className="glass rounded-3xl p-6 text-slate-500 md:col-span-2">No reminders yet.</div>}
        {items.map((m) => (
          <div key={m.id} className="glass rounded-3xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display text-xl">{m.name}</div>
                <div className="text-sm text-slate-500">{m.dose}</div>
              </div>
              <button onClick={() => del(m.id)} className="p-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200" data-testid={`med-del-${m.id}`}>
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
            <div className="mt-3 flex gap-2 text-xs">
              {m.morning && <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-800">Morning</span>}
              {m.afternoon && <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800">Afternoon</span>}
              {m.night && <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">Night</span>}
            </div>
            {m.notes && <div className="mt-2 text-sm text-slate-600">{m.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

