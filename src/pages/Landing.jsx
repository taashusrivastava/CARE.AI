import React from "react";
import { Link } from "react-router-dom";
import {
  Heart, MessageCircle, Stethoscope, MapPin, Shield, Sparkles,
  Activity, Pill, CalendarClock, Users, Brain, ArrowRight,
  Phone, Syringe, HeartPulse, ScanLine, Home
} from "lucide-react";
import ThemePicker from "@/components/ThemePicker";

const features = [
  { icon: MessageCircle, title: "AI Health Chat",
    desc: "Talk to CareAI with voice or text, powered by GPT-4o-mini. Get warm health guidance anytime.",
    color: "bg-purple-100 text-purple-700" },
  { icon: Stethoscope, title: "Symptom Checker",
    desc: "Select symptoms from 30+ options. Match against 9 conditions with confidence scores.",
    color: "bg-blue-100 text-blue-700" },
  { icon: Activity, title: "Health Risk Predictors",
    desc: "Assess heart disease risk, diabetes likelihood and calculate your BMI.",
    color: "bg-rose-100 text-rose-700" },
  { icon: Pill, title: "Medicine Reminders",
    desc: "Log medications with dosage and schedule. Morning, afternoon and night tracking.",
    color: "bg-pink-100 text-pink-700" },
  { icon: CalendarClock, title: "Appointments",
    desc: "Book and manage doctor visits. Keep every appointment organized in one place.",
    color: "bg-indigo-100 text-indigo-700" },
{ icon: Users, title: "Emergency Contacts",
    desc: "Store loved ones and reach instantly. One-tap call or SMS from SOS button.",
    color: "bg-orange-100 text-orange-700" },
  { icon: HeartPulse, title: "Health Score",
    desc: "Get a personalized wellness score with sleep, diet, stress and activity insights.",
    color: "bg-lime-100 text-lime-700" },
  { icon: ScanLine, title: "Medicine Scanner",
    desc: "Look up uses, dosage, side effects, interactions and alternatives for common medicines.",
    color: "bg-cyan-100 text-cyan-700" },
  { icon: Home, title: "Family Healthcare",
    desc: "Track health details, allergies, medications and vaccination schedules for loved ones.",
    color: "bg-teal-100 text-teal-700" },
];

const stats = [
  { value: "9+", label: "Conditions", icon: Brain },
  { value: "30+", label: "Symptoms", icon: Syringe },
  { value: "24/7", label: "AI Support", icon: MessageCircle },
  { value: "1 Tap", label: "SOS Help", icon: Phone },
];

export default function Landing() {
  const [installable, setInstallable] = React.useState(false);

  React.useEffect(() => {
    setInstallable(!!window.careaiDeferredInstallPrompt);
    const handler = () => setInstallable(true);
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const installApp = async () => {
    if (window.careaiDeferredInstallPrompt) {
      window.careaiDeferredInstallPrompt.prompt();
      const choice = await window.careaiDeferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallable(false);
      }
      window.careaiDeferredInstallPrompt = null;
    }
  };

  return (
    <div className="pastel-bg overflow-hidden">

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto flex items-center justify-between p-5 lg:p-8">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-300 to-pink-400 grid place-items-center shadow-lg shadow-rose-200">
            <Heart className="w-6 h-6 text-white" strokeWidth={2.6} />
          </div>
          <span className="font-display text-2xl text-slate-800">CareAI</span>
        </div>
<div className="flex items-center gap-2">
          <ThemePicker />
          <Link to="/login" data-testid="nav-login"
            className="px-5 py-2 rounded-full text-sm font-semibold text-slate-700 hover:bg-white/70 transition-all">
            Sign in
          </Link>
          <Link to="/register" data-testid="nav-register"
            className="px-6 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-200 hover:scale-105 transition-transform">
            Get started
          </Link>
        </div>
</nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 pt-10 pb-20">
        <div className="grid lg:grid-cols-12 gap-8 items-center">

        {/* Left column */}
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 text-xs font-bold text-rose-700 border border-rose-200 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" /> Your gentle health companion
          </span>
          <h1 className="font-display mt-5 text-5xl sm:text-6xl lg:text-7xl leading-tight">
            <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              Health, gently.
            </span>
            <br />
            <span className="text-slate-900">Guidance you can </span>
            <span className="text-rose-500">trust</span>
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-xl leading-relaxed">
            Chat with an AI health assistant, check symptoms instantly, estimate health risks,
            manage medicines and appointments, and keep loved ones one tap away.
            All wrapped in a warm, pastel experience.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" data-testid="hero-cta-register"
              className="group px-7 py-3.5 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-base shadow-xl shadow-rose-200 hover:scale-105 transition-all inline-flex items-center gap-2">
              Create your account
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" data-testid="hero-cta-login"
              className="px-7 py-3.5 rounded-full bg-white/80 border-2 border-white font-semibold text-slate-700 hover:bg-white hover:border-rose-200 transition-all">
              I already have one
            </Link>
            {installable && (
              <button onClick={installApp}
                className="px-7 py-3.5 rounded-full bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-all">
                Install CareAI
              </button>
            )}
          </div>
          <div className="mt-10 grid sm:grid-cols-3 gap-3 max-w-xl">
            {[
              { icon: MessageCircle, t: "AI Chat", d: "GPT-4o powered" },
              { icon: Stethoscope, t: "Symptom Check", d: "30+ symptoms" },
              { icon: MapPin, t: "Nearby Care", d: "Hospitals near you" },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="glass rounded-2xl p-4 hover:scale-[1.03] transition-transform">
                <Icon className="w-5 h-5 text-rose-600" strokeWidth={2.5} />
                <div className="font-semibold mt-2 text-sm">{t}</div>
                <div className="text-xs text-slate-500">{d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-5">
          <div className="relative aspect-square max-w-md mx-auto">
            <span className="absolute -top-5 left-6 w-12 h-12 rounded-full bg-rose-200/80 doodle-dot"></span>
            <span className="absolute bottom-4 -right-4 w-14 h-14 rounded-full bg-purple-200/80 doodle-ring"></span>
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-rose-100 via-pink-100 via-purple-100 to-blue-100 animate-pulse opacity-80"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full bg-gradient-to-br from-rose-200 via-purple-200 to-blue-200 shadow-2xl flex items-center justify-center float-slow border-4 border-white">
                <div className="text-center">
                  <div className="text-7xl sm:text-8xl mb-2">&#x1fa7a;</div>
                  <div className="font-display text-2xl sm:text-3xl text-slate-800">CareAI</div>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <span className="text-2xl">&#x1f60a;</span>
                    <span className="text-xs text-slate-600 font-semibold">Always here to help</span>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-bounce" style={{animationDelay: "0s"}}></span>
                    <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{animationDelay: "0.15s"}}></span>
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{animationDelay: "0.3s"}}></span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -left-4 w-24 h-24 float-slow sticker" style={{"--r": "-8deg"}}>
              <img src="https://images.unsplash.com/photo-1707216171962-9f1514c0bda6?crop=entropy&cs=srgb&fm=jpg&q=85&w=400" alt="Heart" className="w-full h-full object-cover rounded-2xl border-2 border-white" />
            </div>
            <div className="absolute -bottom-3 -right-3 w-28 h-28 float-slower sticker" style={{"--r": "10deg"}}>
              <img src="https://images.pexels.com/photos/31406896/pexels-photo-31406896.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Pills" className="w-full h-full object-cover rounded-2xl border-2 border-white" />
            </div>
            <div className="absolute bottom-8 left-8 glass-strong rounded-2xl p-3 pr-4 flex items-center gap-2 shadow-lg border border-rose-100">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-700">Not a substitute for professional care</span>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8 mb-16">
        <div className="glass rounded-3xl p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <Icon className="w-6 h-6 text-rose-400 mx-auto mb-2" strokeWidth={2} />
              <div className="font-display text-3xl md:text-4xl text-slate-800">{value}</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8 pb-20">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 text-xs font-bold text-purple-700 border border-purple-200">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Everything you need
          </span>
          <h2 className="font-display text-4xl sm:text-5xl mt-4 text-slate-900">
            Your complete health <span className="text-rose-500">companion</span>
          </h2>
          <p className="mt-3 text-slate-600 max-w-lg mx-auto">
            From AI conversations to emergency contacts -- CareAI brings warmth, clarity, and care.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="glass rounded-3xl p-6 hover:scale-[1.02] transition-all group cursor-default relative overflow-hidden">
              <span className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white/80 doodle-ring"></span>
              <span className="absolute bottom-4 left-4 w-6 h-6 rounded-full bg-rose-200/85 doodle-dot"></span>
              <div className={"w-12 h-12 rounded-2xl grid place-items-center " + color + " mb-4 group-hover:scale-110 transition-transform"}>
                <Icon className="w-6 h-6" strokeWidth={2.5} />
              </div>
              <h3 className="font-display text-xl text-slate-800">{title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-rose-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8 pb-20">
        <div className="glass-strong rounded-[3rem] p-10 md:p-16 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-gradient-to-br from-rose-200 to-purple-200 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-gradient-to-br from-blue-200 to-pink-200 rounded-full blur-3xl"></div>
          <div className="relative">
            <span className="text-6xl mb-4 block">&#x1f49a;</span>
            <h2 className="font-display text-4xl sm:text-5xl text-slate-900">
              Ready to feel <span className="text-rose-500">better</span>?
            </h2>
            <p className="mt-4 text-slate-600 max-w-md mx-auto text-lg">
              Join CareAI today. It is free, warm, and always here when you need a gentle hand.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/register"
                className="px-8 py-4 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-lg shadow-xl shadow-rose-200 hover:scale-105 transition-all inline-flex items-center gap-2">
                Get started free
              </Link>
              <Link to="/login"
                className="px-8 py-4 rounded-full bg-white/80 border-2 border-white font-semibold text-slate-700 hover:bg-white transition-all">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 pb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" strokeWidth={2.5} />
            <span>CareAI -- Health, gently.</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Not a medical device</span>
            <span>.</span>
            <span>Always consult a professional</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

