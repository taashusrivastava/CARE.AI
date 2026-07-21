import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Stethoscope, Search } from "lucide-react";

export default function Symptoms() {
  const [all, setAll] = useState([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(new Set());
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get("/symptoms/list").then(r => setAll(r.data.symptoms)); }, []);

  const toggle = (s) => {
    const next = new Set(selected);
    if (next.has(s)) next.delete(s); else next.add(s);
    setSelected(next);
  };

  const check = async () => {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      const r = await api.post("/symptoms/check", { symptoms: Array.from(selected) });
      setResults(r.data.results);
    } finally { setBusy(false); }
  };

  const filtered = all.filter(s => s.includes(q.toLowerCase().trim()));

  return (
    <div className="max-w-6xl mx-auto" data-testid="symptoms-page">
      <div className="glass-strong rounded-3xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-100 grid place-items-center">
            <Stethoscope className="w-5 h-5 text-blue-700" strokeWidth={2.5}/>
          </div>
          <div>
            <h1 className="font-display text-3xl">Symptom Checker</h1>
            <p className="text-sm text-slate-500">Select all symptoms that apply. Not a diagnosis.</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/80 border border-white">
          <Search className="w-4 h-4 text-slate-400"/>
          <input data-testid="symptoms-search" value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search symptoms…"
            className="flex-1 bg-transparent outline-none text-sm"/>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {filtered.map((s) => {
            const on = selected.has(s);
            return (
              <button key={s} data-testid={`symptom-${s.replace(/\s+/g,"-")}`} onClick={() => toggle(s)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  on ? "bg-rose-200 text-rose-900 border-rose-300 shadow" : "bg-white text-slate-700 border-slate-200 hover:bg-rose-50"
                }`}>
                {on ? "✓ " : ""}{s}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button data-testid="symptoms-check" onClick={check} disabled={busy || selected.size === 0}
            className="px-6 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50 transition">
            {busy ? "Analyzing…" : `Check ${selected.size ? `(${selected.size})` : ""}`}
          </button>
          {selected.size > 0 && (
            <button onClick={() => { setSelected(new Set()); setResults(null); }} className="text-sm text-slate-500 hover:text-slate-800">
              Clear
            </button>
          )}
        </div>
      </div>

      {results && (
        <div className="mt-6 grid md:grid-cols-2 gap-4" data-testid="symptom-results">
          {results.length === 0 && <div className="glass rounded-3xl p-6 md:col-span-2 text-slate-600">No matches — please describe more symptoms or ask CareAI.</div>}
          {results.map((r) => (
            <div key={r.disease} className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-2xl">{r.disease}</h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  r.severity === "Severe" || r.severity === "Serious" ? "bg-red-100 text-red-700" :
                  r.severity === "Moderate" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                }`}>{r.severity}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-rose-400" style={{ width: `${r.confidence}%` }}/>
                </div>
                <span className="text-sm font-bold text-slate-700">{r.confidence}%</span>
              </div>
              <div className="mt-3 text-sm text-slate-600"><b>Matched:</b> {r.matched_symptoms.join(", ")}</div>
              <div className="mt-1 text-sm text-slate-600"><b>See:</b> {r.specialist}</div>
              <div className="mt-1 text-sm text-slate-600"><b>Suggested tests:</b> {r.tests.join(", ")}</div>
            </div>
          ))}
          <div className="glass rounded-3xl p-4 md:col-span-2 text-xs text-slate-500">
            This is a heuristic tool — not a diagnosis. Please consult a qualified healthcare professional.
          </div>
        </div>
      )}
    </div>
  );
}

