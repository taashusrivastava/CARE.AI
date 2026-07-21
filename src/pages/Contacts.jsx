import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, Plus, Trash2, Phone, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function Contacts() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", relationship: "", hospital: "" });

  const load = () => api.get("/contacts").then(r => setItems(r.data));
  useEffect(() => { load(); }, []);

  const add = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return toast.error("Name & phone required");
    try {
      await api.post("/contacts", form);
      setForm({ name: "", phone: "", relationship: "", hospital: "" });
      load();
      toast.success("Contact added");
    } catch { toast.error("Failed to add"); }
  };

  const del = async (id) => { await api.delete(`/contacts/${id}`); load(); };

  return (
    <div className="max-w-5xl mx-auto" data-testid="contacts-page">
      <div className="glass-strong rounded-3xl p-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-blue-100 grid place-items-center">
          <Users className="w-5 h-5 text-blue-700" strokeWidth={2.5}/>
        </div>
        <div>
          <h1 className="font-display text-3xl">Emergency contacts</h1>
          <p className="text-sm text-slate-500">One tap to call or text in an emergency.</p>
        </div>
      </div>

      <form onSubmit={add} className="mt-6 glass rounded-3xl p-6 grid md:grid-cols-4 gap-3">
        <input data-testid="contact-name" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})}
          className="px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="contact-phone" placeholder="Phone" value={form.phone} onChange={(e)=>setForm({...form, phone: e.target.value})}
          className="px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="contact-relationship" placeholder="Relationship" value={form.relationship} onChange={(e)=>setForm({...form, relationship: e.target.value})}
          className="px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <input data-testid="contact-hospital" placeholder="Hospital (optional)" value={form.hospital} onChange={(e)=>setForm({...form, hospital: e.target.value})}
          className="px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none text-sm"/>
        <button data-testid="contact-add" type="submit" className="md:col-span-4 py-2.5 rounded-full bg-rose-400 text-white font-bold hover:scale-[1.01] transition inline-flex items-center justify-center gap-2">
          <Plus className="w-4 h-4"/> Add contact
        </button>
      </form>

      <div className="mt-6 grid md:grid-cols-2 gap-4">
        {items.length === 0 && <div className="glass rounded-3xl p-6 text-slate-500 md:col-span-2">No contacts yet.</div>}
        {items.map((c) => (
          <div key={c.id} className="glass rounded-3xl p-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-display text-xl truncate">{c.name}</div>
              <div className="text-sm text-slate-500 truncate">{c.relationship || c.hospital || ""}</div>
              <div className="text-sm text-slate-700 mt-1">{c.phone}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <a href={`tel:${c.phone}`} className="p-2 rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200"><Phone className="w-4 h-4"/></a>
              <a href={`sms:${c.phone}`} className="p-2 rounded-xl bg-blue-100 text-blue-800 hover:bg-blue-200"><MessageSquare className="w-4 h-4"/></a>
              <button data-testid={`contact-del-${c.id}`} onClick={() => del(c.id)} className="p-2 rounded-xl bg-red-100 text-red-700 hover:bg-red-200"><Trash2 className="w-4 h-4"/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

