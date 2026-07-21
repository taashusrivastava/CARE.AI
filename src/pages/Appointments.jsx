import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { CalendarClock, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Appointments() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ doctor: "", hospital: "", date: "", time: "", reason: "" });

  const load = () => api.get("/appointments").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.doctor || !form.date || !form.time) return toast.error("Doctor, date & time required");
    await api.post("/appointments", form);
    setForm({ doctor: "", hospital: "", date: "", time: "", reason: "" });
    load();
    toast.success("Appointment saved");
  };
  const del = async (id) => { await api.delete(`/appointments/${id}`); load(); };

  return (
    <div className="max-w-5xl mx-auto" data-testid="appointments-page">
      <div className="glass-strong rounded-3xl p-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-purple-100 grid place-items-center">
          <CalendarClock className="w-5 h-5 text-purple-700" strokeWidth={2.5}/>
        </div>
        <div>
          <h1 className="font-display text-3xl">Appointments</h1>
          <p className="text-sm text-slate-500">Keep every visit organized.</p>
        </div>
      </div>

      <form onSubmit={add} className="mt-6 glass rounded-3xl p-6 grid md:grid-cols-6 gap-3">
        <input data-testid="appt-doctor" placeholder="Doctor" value={form.doctor} onChange={(e)=>setForm({...form, doctor: e.target.value})} className="md:col-span-3 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="appt-hospital" placeholder="Hospital / Clinic" value={form.hospital} onChange={(e)=>setForm({...form, hospital: e.target.value})} className="md:col-span-3 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="appt-date" type="date" value={form.date} onChange={(e)=>setForm({...form, date: e.target.value})} className="md:col-span-2 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="appt-time" type="time" value={form.time} onChange={(e)=>setForm({...form, time: e.target.value})} className="md:col-span-2 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="appt-reason" placeholder="Reason" value={form.reason} onChange={(e)=>setForm({...form, reason: e.target.value})} className="md:col-span-2 px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <button data-testid="appt-add" type="submit" className="md:col-span-6 py-2.5 rounded-full bg-rose-400 text-white font-bold hover:scale-[1.01] transition inline-flex items-center justify-center gap-2">
          <Plus className="w-4 h-4"/> Book appointment
        </button>
      </form>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {items.length === 0 && <div className="glass rounded-3xl p-6 text-slate-500 md:col-span-2">No appointments yet.</div>}
        {items.map((a) => (
          <div key={a.id} className="glass rounded-3xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display text-xl">{a.doctor}</div>
                <div className="text-sm text-slate-500">{a.hospital}</div>
                <div className="text-sm mt-1"><b>{a.date}</b> at <b>{a.time}</b></div>
                {a.reason && <div className="text-sm text-slate-600 mt-1">{a.reason}</div>}
              </div>
              <button onClick={()=>del(a.id)} className="p-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200" data-testid={`appt-del-${a.id}`}>
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

