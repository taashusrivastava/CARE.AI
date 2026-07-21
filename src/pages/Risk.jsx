import React, { useState } from "react";
import { api } from "@/lib/api";
import { Heart, Droplet, Scale } from "lucide-react";

function Card({ title, icon: Icon, color, children }) {
  return (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-2xl grid place-items-center ${color}`}>
          <Icon className="w-5 h-5" strokeWidth={2.5}/>
        </div>
        <h2 className="font-display text-2xl">{title}</h2>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Field({ label, ...rest }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <input {...rest} className="mt-1 w-full px-4 py-2.5 rounded-2xl bg-white/90 border border-white outline-none focus:ring-4 focus:ring-rose-200 text-sm"/>
    </label>
  );
}

export default function Risk() {
  const [heart, setHeart] = useState({ age: 45, systolic_bp: 130, cholesterol: 200, heart_rate: 80, diabetes: false, smoker: false });
  const [heartRes, setHeartRes] = useState(null);
  const [dia, setDia] = useState({ glucose: 110, bmi: 25, insulin: 80, age: 40 });
  const [diaRes, setDiaRes] = useState(null);
  const [bmi, setBmi] = useState({ height_cm: 170, weight_kg: 70 });
  const [bmiRes, setBmiRes] = useState(null);

  const num = (v) => (v === "" ? "" : Number(v));

  const submitHeart = async (e) => { e.preventDefault(); const r = await api.post("/predict/heart", heart); setHeartRes(r.data); };
  const submitDia = async (e) => { e.preventDefault(); const r = await api.post("/predict/diabetes", dia); setDiaRes(r.data); };
  const submitBmi = async (e) => { e.preventDefault(); const r = await api.post("/predict/bmi", bmi); setBmiRes(r.data); };

  return (
    <div className="max-w-6xl mx-auto space-y-6" data-testid="risk-page">
      <div className="glass-strong rounded-3xl p-6">
        <h1 className="font-display text-3xl">Health Risk Predictors</h1>
        <p className="text-sm text-slate-500 mt-1">Quick heuristic estimates. Not medical diagnosis.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <Card title="Heart Risk" icon={Heart} color="bg-rose-100 text-rose-700">
          <form onSubmit={submitHeart} className="grid grid-cols-2 gap-3">
            <Field label="Age" type="number" value={heart.age} onChange={(e)=>setHeart({...heart, age: num(e.target.value)})} data-testid="heart-age"/>
            <Field label="Systolic BP" type="number" value={heart.systolic_bp} onChange={(e)=>setHeart({...heart, systolic_bp: num(e.target.value)})} data-testid="heart-bp"/>
            <Field label="Cholesterol" type="number" value={heart.cholesterol} onChange={(e)=>setHeart({...heart, cholesterol: num(e.target.value)})} data-testid="heart-chol"/>
            <Field label="Heart Rate" type="number" value={heart.heart_rate} onChange={(e)=>setHeart({...heart, heart_rate: num(e.target.value)})} data-testid="heart-hr"/>
            <label className="col-span-1 flex items-center gap-2 text-sm mt-2">
              <input type="checkbox" data-testid="heart-diabetes" checked={heart.diabetes} onChange={(e)=>setHeart({...heart, diabetes: e.target.checked})}/> Diabetic
            </label>
            <label className="col-span-1 flex items-center gap-2 text-sm mt-2">
              <input type="checkbox" data-testid="heart-smoker" checked={heart.smoker} onChange={(e)=>setHeart({...heart, smoker: e.target.checked})}/> Smoker
            </label>
            <button data-testid="heart-submit" type="submit" className="col-span-2 mt-2 py-2.5 rounded-full bg-rose-400 text-white font-bold hover:scale-[1.02] transition">Estimate risk</button>
          </form>
          {heartRes && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-100" data-testid="heart-result">
              <div className="font-display text-3xl text-rose-700">{heartRes.risk_percent}%</div>
              <div className="text-sm font-semibold">Risk level: {heartRes.level}</div>
              <div className="text-xs text-slate-600 mt-1">{heartRes.advice}</div>
            </div>
          )}
        </Card>

        <Card title="Diabetes Check" icon={Droplet} color="bg-blue-100 text-blue-700">
          <form onSubmit={submitDia} className="grid grid-cols-2 gap-3">
            <Field label="Glucose" type="number" value={dia.glucose} onChange={(e)=>setDia({...dia, glucose: num(e.target.value)})} data-testid="dia-glucose"/>
            <Field label="BMI" type="number" step="0.1" value={dia.bmi} onChange={(e)=>setDia({...dia, bmi: num(e.target.value)})} data-testid="dia-bmi"/>
            <Field label="Insulin" type="number" value={dia.insulin} onChange={(e)=>setDia({...dia, insulin: num(e.target.value)})} data-testid="dia-insulin"/>
            <Field label="Age" type="number" value={dia.age} onChange={(e)=>setDia({...dia, age: num(e.target.value)})} data-testid="dia-age"/>
            <button data-testid="dia-submit" type="submit" className="col-span-2 mt-2 py-2.5 rounded-full bg-blue-400 text-white font-bold hover:scale-[1.02] transition">Check risk</button>
          </form>
          {diaRes && (
            <div className="mt-4 p-4 rounded-2xl bg-blue-50 border border-blue-100" data-testid="dia-result">
              <div className="font-display text-3xl text-blue-700">{diaRes.result}</div>
              <div className="text-sm">Score: {diaRes.risk_percent}%</div>
              <div className="text-xs text-slate-600 mt-1">{diaRes.advice}</div>
            </div>
          )}
        </Card>

        <Card title="BMI Calculator" icon={Scale} color="bg-emerald-100 text-emerald-700">
          <form onSubmit={submitBmi} className="grid grid-cols-2 gap-3">
            <Field label="Height (cm)" type="number" value={bmi.height_cm} onChange={(e)=>setBmi({...bmi, height_cm: num(e.target.value)})} data-testid="bmi-height"/>
            <Field label="Weight (kg)" type="number" value={bmi.weight_kg} onChange={(e)=>setBmi({...bmi, weight_kg: num(e.target.value)})} data-testid="bmi-weight"/>
            <button data-testid="bmi-submit" type="submit" className="col-span-2 mt-2 py-2.5 rounded-full bg-emerald-400 text-white font-bold hover:scale-[1.02] transition">Calculate</button>
          </form>
          {bmiRes && (
            <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100" data-testid="bmi-result">
              <div className="font-display text-3xl text-emerald-700">{bmiRes.bmi}</div>
              <div className="text-sm font-semibold">{bmiRes.category}</div>
            </div>
          )}
        </Card>

        <div className="glass rounded-3xl p-6">
          <h3 className="font-display text-2xl">A note on accuracy</h3>
          <p className="text-sm text-slate-600 mt-2">
            These predictors use simple heuristics for guidance only. They are not calibrated medical scores.
            Always speak to a qualified healthcare professional for a real assessment.
          </p>
        </div>
      </div>
    </div>
  );
}

