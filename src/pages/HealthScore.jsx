import React, { useState } from "react";
import { api } from "@/lib/api";
import { HeartPulse, Moon, Droplets, Scale, Activity, Brain, Apple, Trophy, Sparkles } from "lucide-react";

const INITIAL = {
  sleep_hours: 7,
  water_glasses: 6,
  bmi: 22,
  heart_rate: 72,
  exercise_minutes: 30,
  stress_level: 3,
  diet_quality: 3,
};

export default function HealthScore() {
  const [form, setForm] = useState(INITIAL);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  const field = (k, v) => setForm({ ...form, [k]: Number(v) });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.post("/health-score/calculate", form);
      setResult(r.data);
    } finally { setBusy(false); }
  };

  const catColor = (c) => {
    if (c === "Excellent") return "bg-emerald-100 text-emerald-700";
    if (c === "Good") return "bg-teal-100 text-teal-700";
    if (c === "Fair") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  const scoreColor = (s) => {
    if (s >= 85) return "text-emerald-600";
    if (s >= 70) return "text-teal-600";
    if (s >= 50) return "text-amber-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-6xl mx-auto" data-testid="health-score-page">
      <div className="glass-strong rounded-3xl p-6 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-emerald-100 grid place-items-center">
          <HeartPulse className="w-5 h-5 text-emerald-700" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="font-display text-3xl">Health Score</h1>
          <p className="text-sm text-slate-500">Get a personalized wellness score based on your lifestyle.</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-6 grid md:grid-cols-2 gap-4">
        <Metric icon={Moon} color="bg-indigo-100 text-indigo-700" label="Sleep (hours)" value={form.sleep_hours} min={0} max={12} step={0.5} onChange={(v)=>field("sleep_hours", v)} testid="hs-sleep" />
        <Metric icon={Droplets} color="bg-blue-100 text-blue-700" label="Water (glasses/day)" value={form.water_glasses} min={0} max={15} step={1} onChange={(v)=>field("water_glasses", v)} testid="hs-water" />
        <Metric icon={Scale} color="bg-emerald-100 text-emerald-700" label="BMI" value={form.bmi} min={10} max={40} step={0.1} onChange={(v)=>field("bmi", v)} testid="hs-bmi" />
        <Metric icon={HeartPulse} color="bg-rose-100 text-rose-700" label="Resting heart rate (bpm)" value={form.heart_rate} min={30} max={160} step={1} onChange={(v)=>field("heart_rate", v)} testid="hs-hr" />
        <Metric icon={Activity} color="bg-orange-100 text-orange-700" label="Exercise (min/day)" value={form.exercise_minutes} min={0} max={180} step={5} onChange={(v)=>field("exercise_minutes", v)} testid="hs-exercise" />
        <Metric icon={Brain} color="bg-purple-100 text-purple-700" label="Stress level (1-10)" value={form.stress_level} min={1} max={10} step={1} onChange={(v)=>field("stress_level", v)} testid="hs-stress" />
        <Metric icon={Apple} color="bg-lime-100 text-lime-700" label="Diet quality (1-5)" value={form.diet_quality} min={1} max={5} step={1} onChange={(v)=>field("diet_quality", v)} testid="hs-diet" />
        <button data-testid="hs-submit" type="submit" disabled={busy}
          className="md:col-span-2 py-3 rounded-full bg-emerald-400 text-white font-bold hover:scale-[1.01] transition disabled:opacity-60 inline-flex items-center justify-center gap-2">
          <Sparkles className="w-5 h-5" /> Calculate my health score
        </button>
      </form>

      {result && (
        <div className="mt-6 glass-strong rounded-3xl p-8" data-testid="hs-result">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-40 h-40">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle cx="60" cy="60" r="52" fill="none"
                  stroke={result.score >= 85 ? "#10b981" : result.score >= 70 ? "#14b8a6" : result.score >= 50 ? "#f59e0b" : "#ef4444"}
                  strokeWidth="12" strokeLinecap="round"
                  strokeDasharray={`${(result.score / 100) * 326.7} 326.7`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-display text-4xl ${scoreColor(result.score)}`}>{result.score}</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase">/ 100</span>
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${catColor(result.category)}`}>
                <Trophy className="w-3.5 h-3.5" /> {result.category}
              </div>
              <h2 className="font-display text-3xl mt-2">Your health score</h2>
              <p className="text-sm text-slate-500 mt-1">Based on your daily lifestyle habits.</p>
            </div>
          </div>

          <div className="mt-8 grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-bold text-slate-700 mb-2">Personalized tips</h3>
              <ul className="space-y-2">
                {result.tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-slate-700 mb-2">Breakdown</h3>
              <div className="space-y-2">
                {Object.entries(result.breakdown).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="w-24 text-xs font-semibold text-slate-500 capitalize">{key.replace("_", " ")}</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div className="h-full bg-emerald-400" style={{ width: `${Math.min(100, val.score)}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-600">{Math.round(val.score)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ icon: Icon, color, label, value, min, max, step, onChange, testid }) {
  return (
    <label className="glass rounded-3xl p-5">
      <div className="flex items-center gap-2">
        <div className={`w-9 h-9 rounded-2xl grid place-items-center ${color}`}>
          <Icon className="w-4 h-4" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold text-slate-700">{label}</span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <input data-testid={testid} type="number" min={min} max={max} step={step} value={value}
          onChange={(e)=>onChange(e.target.value === "" ? 0 : e.target.value)}
          className="w-24 px-3 py-2 rounded-2xl bg-white/90 border border-white outline-none focus:ring-4 focus:ring-emerald-200 text-sm font-semibold" />
        <input type="range" min={min} max={max} step={step} value={value} onChange={(e)=>onChange(e.target.value)}
          className="flex-1 accent-emerald-500" />
      </div>
    </label>
  );
}
