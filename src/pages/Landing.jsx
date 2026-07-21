import React from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Stethoscope, MapPin, Shield, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <div className="pastel-bg">
      <nav className="max-w-7xl mx-auto flex items-center justify-between p-5 lg:p-8">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-rose-200 grid place-items-center">
            <Heart className="w-5 h-5 text-rose-700" strokeWidth={2.6}/>
          </div>
          <span className="font-display text-2xl">CareAI</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" data-testid="nav-login" className="px-4 py-2 rounded-full text-sm font-semibold text-slate-700 hover:bg-white/70">Sign in</Link>
          <Link to="/register" data-testid="nav-register" className="px-5 py-2 rounded-full text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition">Get started</Link>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-5 lg:px-8 pt-6 lg:pt-14 pb-24 grid lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 relative">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 text-xs font-bold text-rose-700 border border-rose-100">
            <Sparkles className="w-3.5 h-3.5"/> Your gentle health companion
          </span>
          <h1 className="font-display mt-4 text-5xl sm:text-6xl lg:text-7xl leading-[1.02] text-slate-900">
            Health, <span className="text-rose-500">gently</span>.<br/>Guidance you can trust.
          </h1>
          <p className="mt-5 text-lg text-slate-600 max-w-xl leading-relaxed">
            Chat with an AI health assistant, check symptoms, estimate risks and keep loved ones one tap away — wrapped in a warm, pastel experience.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/register" data-testid="hero-cta-register" className="px-6 py-3 rounded-full bg-rose-400 text-white font-bold shadow-lg shadow-rose-200 hover:scale-105 transition-transform">Create your account</Link>
            <Link to="/login" data-testid="hero-cta-login" className="px-6 py-3 rounded-full bg-white/80 border border-white font-semibold text-slate-800 hover:bg-white transition">I already have one</Link>
          </div>

          <div className="mt-10 grid sm:grid-cols-3 gap-3 max-w-xl">
            {[
              { icon: MessageCircle, t: "AI Chat", d: "Claude 4.5 powered" },
              { icon: Stethoscope, t: "Symptom Checker", d: "Instant guidance" },
              { icon: MapPin, t: "Nearby Care", d: "Hospitals & pharmacies" },
            ].map(({ icon: Icon, t, d }) => (
              <div key={t} className="glass rounded-2xl p-4">
                <Icon className="w-5 h-5 text-rose-600" strokeWidth={2.5}/>
                <div className="font-semibold mt-2">{t}</div>
                <div className="text-xs text-slate-500">{d}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="relative aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-rose-100 via-pink-100 to-blue-100"></div>
            <img
              src="https://images.unsplash.com/photo-1689154345830-861f74006b09?crop=entropy&cs=srgb&fm=jpg&q=85&w=900"
              alt="Pastel abstract"
              className="absolute inset-0 w-full h-full object-cover rounded-[3rem] mix-blend-multiply opacity-95"
            />
            <div className="absolute -top-6 -left-6 w-28 h-28 float-slow sticker" style={{"--r":"-8deg"}}>
              <img src="https://images.unsplash.com/photo-1707216171962-9f1514c0bda6?crop=entropy&cs=srgb&fm=jpg&q=85&w=400" alt="Heart" className="w-full h-full object-cover rounded-3xl"/>
            </div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 float-slower sticker" style={{"--r":"10deg"}}>
              <img src="https://images.pexels.com/photos/31406896/pexels-photo-31406896.jpeg?auto=compress&cs=tinysrgb&w=400" alt="Pills" className="w-full h-full object-cover rounded-3xl"/>
            </div>
            <div className="absolute bottom-6 left-6 glass-strong rounded-2xl p-3 pr-4 flex items-center gap-2 shadow-lg">
              <Shield className="w-4 h-4 text-emerald-600"/>
              <span className="text-xs font-semibold text-slate-700">Not a substitute for professional care</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

