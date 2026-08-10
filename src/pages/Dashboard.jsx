import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { MessageCircle, Stethoscope, Activity, Pill, CalendarClock, MapPin, Users, Sparkles, ArrowRight, HeartPulse, ScanLine, Home } from "lucide-react";
import Gamification from "@/components/Gamification";

const tips = [
  "Aim for 7–9 hours of quality sleep each night.",
  "Drink at least 6–8 glasses of water daily.",
  "Take a 10-minute walk after meals to help digestion.",
  "Practice deep breathing for 5 minutes when stressed.",
  "Include leafy greens & lean protein in every meal.",
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ contacts: 0, meds: 0, appts: 0 });
  const [tip] = useState(tips[Math.floor(Math.random() * tips.length)]);

  useEffect(() => {
    Promise.all([
      api.get("/contacts").catch(() => ({ data: [] })),
      api.get("/medicines").catch(() => ({ data: [] })),
      api.get("/appointments").catch(() => ({ data: [] })),
    ]).then(([c, m, a]) => setStats({ contacts: c.data.length, meds: m.data.length, appts: a.data.length }));
  }, []);

const quick = [
    { to: "/app/chat", label: "Talk to CareAI", desc: "Speak or type your health questions", icon: MessageCircle, color: "bg-rose-100 text-rose-700" },
    { to: "/app/symptoms", label: "Check Symptoms", desc: "Find possible causes", icon: Stethoscope, color: "bg-blue-100 text-blue-700" },
    { to: "/app/risk", label: "Risk Predictors", desc: "Heart · Diabetes · BMI", icon: Activity, color: "bg-purple-100 text-purple-700" },
    { to: "/app/nearby", label: "Nearby Hospitals", desc: "Care around you", icon: MapPin, color: "bg-emerald-100 text-emerald-700" },
    { to: "/app/health-score", label: "Health Score", desc: "Wellness snapshot", icon: HeartPulse, color: "bg-orange-100 text-orange-700" },
    { to: "/app/medicine-scanner", label: "Medicine Scanner", desc: "Look up medicines", icon: ScanLine, color: "bg-pink-100 text-pink-700" },
    { to: "/app/family", label: "Family Care", desc: "Track loved ones", icon: Home, color: "bg-teal-100 text-teal-700" },
  ];

  return (
    <div className="max-w-7xl mx-auto" data-testid="dashboard">
      {/* Welcome */}
      <div className="relative glass-strong rounded-3xl p-6 md:p-8 overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 float-slow sticker hidden md:block" style={{"--r":"-6deg"}}>
          <img src="https://images.unsplash.com/photo-1707216171962-9f1514c0bda6?crop=entropy&cs=srgb&fm=jpg&q=85&w=400" alt="" className="w-full h-full object-cover rounded-3xl"/>
        </div>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-xs font-bold text-rose-700"><Sparkles className="w-3.5 h-3.5"/> Good to see you</span>
        <h1 className="font-display text-4xl md:text-5xl mt-3">Hi, {user?.full_name?.split(" ")[0] || "friend"} <span className="text-rose-500">.</span></h1>
        <p className="text-slate-600 mt-2 max-w-xl">Here's your gentle health snapshot. Everything's a tap away — and CareAI is here whenever you need to talk.</p>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-3 glass rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-3xl bg-rose-100 grid place-items-center text-rose-700">
              <MessageCircle className="w-6 h-6" strokeWidth={2.4}/>
            </div>
            <div>
              <div className="font-display text-2xl text-slate-900">Speak with CareAI</div>
              <p className="mt-2 text-slate-600 max-w-2xl">Use voice or text to ask health questions anytime. It’s an easy, hands-free way to get quick wellness guidance.</p>
            </div>
          </div>
          <Link to="/app/chat" data-testid="dashboard-voice-cta"
            className="inline-flex items-center justify-center rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-200 hover:bg-rose-600 transition">
            Open voice chat
          </Link>
        </div>
      </div>

      {/* Bento grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-5">
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quick.map(({ to, label, desc, icon: Icon, color }) => (
            <Link key={to} to={to} data-testid={`quick-${label.toLowerCase().replace(/\s+/g,"-")}`}
              className="glass rounded-3xl p-5 hover:scale-[1.02] transition-transform group">
              <div className={`w-11 h-11 rounded-2xl grid place-items-center ${color}`}>
                <Icon className="w-5 h-5" strokeWidth={2.6}/>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <div className="font-display text-xl">{label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all"/>
              </div>
            </Link>
          ))}
        </div>

        <div className="md:col-span-4 glass rounded-3xl p-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Care</div>
          <div className="mt-3 space-y-3">
            <Row icon={Users} to="/app/contacts" label="Emergency contacts" value={stats.contacts}/>
            <Row icon={Pill} to="/app/medicines" label="Medicine reminders" value={stats.meds}/>
            <Row icon={CalendarClock} to="/app/appointments" label="Upcoming appointments" value={stats.appts}/>
          </div>
        </div>

        <div className="md:col-span-4 mt-4 md:mt-0">
          <Gamification />
        </div>

        <div className="md:col-span-8 glass rounded-3xl p-6 relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's health tip</div>
          <div className="font-display text-2xl md:text-3xl mt-2 leading-snug text-slate-800">{tip}</div>
          <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500">
            <Sparkles className="w-3.5 h-3.5 text-rose-500"/> Small steps daily add up to big change.
          </div>
        </div>

        <div className="md:col-span-4 glass rounded-3xl p-6 relative overflow-hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Wellness</div>
          <div className="mt-2 font-display text-2xl">Complete your profile</div>
          <p className="text-sm text-slate-500 mt-1">Adding medical history helps CareAI give better guidance.</p>
          <Link to="/app/profile" data-testid="dash-profile-cta"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition">
            Update profile <ArrowRight className="w-4 h-4"/>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ icon: Icon, to, label, value }) {
  return (
    <Link to={to} className="flex items-center justify-between p-3 rounded-2xl bg-white/70 hover:bg-white transition">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-100 grid place-items-center">
          <Icon className="w-4 h-4 text-rose-700" strokeWidth={2.5}/>
        </div>
        <div className="text-sm font-semibold text-slate-700">{label}</div>
      </div>
      <div className="font-display text-xl">{value}</div>
    </Link>
  );
}

