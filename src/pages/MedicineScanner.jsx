import React, { useState } from "react";
import { api } from "@/lib/api";
import { Pill, Search, AlertTriangle, Droplet, Clock, Package, RefreshCw, FlaskConical, BriefcaseMedical, Info } from "lucide-react";
import { toast } from "sonner";

export default function MedicineScanner() {
  const [query, setQuery] = useState("");
  const [info, setInfo] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const lookup = async (e) => {
    e.preventDefault();
    const name = query.trim();
    if (!name) return;
    setBusy(true);
    setError(null);
    try {
      const r = await api.post("/medicines/info", { name });
      setInfo(r.data);
    } catch (err) {
      setInfo(null);
      setError(err?.response?.data?.detail || "Medicine not found. Try a common generic name like paracetamol or ibuprofen.");
    } finally { setBusy(false); }
  };

  return (
    <div className="max-w-5xl mx-auto" data-testid="medicine-scanner-page">
      <div className="glass-strong rounded-3xl p-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-pink-100 grid place-items-center">
          <Pill className="w-5 h-5 text-pink-700" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-display text-3xl">Medicine Scanner</h1>
          <p className="text-sm text-slate-500">Look up uses, dosage, side effects & more.</p>
        </div>
      </div>

      <form onSubmit={lookup} className="mt-6 glass rounded-3xl p-6">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Medicine name</label>
        <div className="mt-2 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/90 border border-white focus-within:ring-4 focus-within:ring-pink-200">
          <Search className="w-4 h-4 text-slate-400" />
          <input data-testid="scanner-input" value={query} onChange={(e)=>setQuery(e.target.value)}
            placeholder="e.g. paracetamol, ibuprofen, amoxicillin"
            className="flex-1 bg-transparent outline-none text-sm" />
          <button data-testid="scanner-search" type="submit" disabled={busy || !query.trim()}
            className="px-4 py-2 rounded-full bg-pink-400 text-white font-bold text-xs disabled:opacity-50 hover:scale-105 transition">
            {busy ? "Looking…" : "Look up"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {["paracetamol", "ibuprofen", "amoxicillin", "metformin", "cetirizine", "aspirin"].map((m) => (
            <button key={m} type="button" onClick={() => { setQuery(m); }}
              className="px-3 py-1 rounded-full bg-white/70 border border-white text-xs text-slate-600 hover:bg-white">
              {m}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <div className="mt-6 glass rounded-3xl p-6 border border-amber-200 text-amber-800 flex gap-3" data-testid="scanner-error">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-500" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      {info && (
        <div className="mt-6 glass rounded-3xl p-6" data-testid="scanner-result">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 grid place-items-center">
              <Pill className="w-6 h-6 text-pink-700" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="font-display text-3xl">{info.name}</h2>
              <div className="text-xs text-slate-500">Medicine information</div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <Section icon={BriefcaseMedical} color="bg-blue-100 text-blue-700" title="Uses" body={info.uses} />
            <Section icon={AlertTriangle} color="bg-amber-100 text-amber-700" title="Side effects" body={info.side_effects} />
            <Section icon={Clock} color="bg-purple-100 text-purple-700" title="Dosage" body={info.dosage} />
            <Section icon={Package} color="bg-emerald-100 text-emerald-700" title="Expiry" body={info.expiry_info} />
            <Section icon={RefreshCw} color="bg-teal-100 text-teal-700" title="Alternatives" body={info.alternatives.join(", ")} />
            <Section icon={FlaskConical} color="bg-rose-100 text-rose-700" title="Drug interactions" body={info.drug_interactions.join(" · ")} />
          </div>

          <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-2 text-sm text-slate-600">
            <Info className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
            <div>
              <b>Storage:</b> {info.storage}
              <div className="mt-1 text-xs text-slate-500">This is informational only. Always consult a doctor or pharmacist before taking any medicine.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, color, title, body }) {
  return (
    <div className="p-4 rounded-2xl bg-white/70 border border-white">
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-xl grid place-items-center ${color}`}>
          <Icon className="w-4 h-4" strokeWidth={2.5} />
        </div>
        <div className="font-bold text-sm text-slate-700">{title}</div>
      </div>
      <p className="mt-2 text-sm text-slate-600 leading-relaxed">{body}</p>
    </div>
  );
}
