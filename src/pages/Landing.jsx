import React from "react";
import { Link } from "react-router-dom";
import {
  Heart, MessageCircle, Stethoscope, MapPin, Shield, Sparkles,
  Activity, Pill, CalendarClock, Users, Brain, ArrowRight,
  Phone, Syringe, HeartPulse, ScanLine, Home, Sun, Moon, Star,
  Zap, CheckCircle2
} from "lucide-react";
import ThemePicker from "@/components/ThemePicker";

const features = [
  {
    icon: MessageCircle, title: "AI Health Chat",
    desc: "Talk to CareAI with voice or text, powered by GPT-4o-mini. Get warm health guidance anytime.",
    color: "bg-purple-100 text-purple-700",
    darkColor: "dark-feat-purple",
    img: "/doodle-chat.jpg",
    tag: "🤖 AI Powered",
    tagColor: "bg-purple-100 text-purple-700"
  },
  {
    icon: Stethoscope, title: "Symptom Checker",
    desc: "Select symptoms from 30+ options. Match against 9 conditions with confidence scores.",
    color: "bg-blue-100 text-blue-700",
    darkColor: "dark-feat-blue",
    img: "/doodle-symptoms.jpg",
    tag: "🔍 30+ Symptoms",
    tagColor: "bg-blue-100 text-blue-700"
  },
  {
    icon: Activity, title: "Health Risk Predictors",
    desc: "Assess heart disease risk, diabetes likelihood and calculate your BMI.",
    color: "bg-rose-100 text-rose-700",
    darkColor: "dark-feat-rose",
    img: "/doodle-dashboard.jpg",
    tag: "❤️ Risk Analysis",
    tagColor: "bg-rose-100 text-rose-700"
  },
  {
    icon: Pill, title: "Medicine Reminders",
    desc: "Log medications with dosage and schedule. Morning, afternoon and night tracking.",
    color: "bg-pink-100 text-pink-700",
    darkColor: "dark-feat-pink",
    img: "/doodle-medicine.jpg",
    tag: "💊 Never Miss a Dose",
    tagColor: "bg-pink-100 text-pink-700"
  },
  {
    icon: CalendarClock, title: "Appointments",
    desc: "Book and manage doctor visits. Keep every appointment organized in one place.",
    color: "bg-indigo-100 text-indigo-700",
    darkColor: "dark-feat-indigo",
    img: null,
    tag: "📅 Stay Organized",
    tagColor: "bg-indigo-100 text-indigo-700"
  },
  {
    icon: Users, title: "Emergency Contacts",
    desc: "Store loved ones and reach instantly. One-tap call or SMS from SOS button.",
    color: "bg-orange-100 text-orange-700",
    darkColor: "dark-feat-orange",
    img: null,
    tag: "🚨 SOS Ready",
    tagColor: "bg-orange-100 text-orange-700"
  },
  {
    icon: HeartPulse, title: "Health Score",
    desc: "Get a personalized wellness score with sleep, diet, stress and activity insights.",
    color: "bg-lime-100 text-lime-700",
    darkColor: "dark-feat-lime",
    img: null,
    tag: "⭐ Wellness Insights",
    tagColor: "bg-lime-100 text-lime-700"
  },
  {
    icon: ScanLine, title: "Medicine Scanner",
    desc: "Look up uses, dosage, side effects, interactions and alternatives for common medicines.",
    color: "bg-cyan-100 text-cyan-700",
    darkColor: "dark-feat-cyan",
    img: null,
    tag: "🔬 Drug Info",
    tagColor: "bg-cyan-100 text-cyan-700"
  },
  {
    icon: Home, title: "Family Healthcare",
    desc: "Track health details, allergies, medications and vaccination schedules for loved ones.",
    color: "bg-teal-100 text-teal-700",
    darkColor: "dark-feat-teal",
    img: "/doodle-family.jpg",
    tag: "👨‍👩‍👧 For Your Family",
    tagColor: "bg-teal-100 text-teal-700"
  },
];

const stats = [
  { value: "9+", label: "Conditions Checked", icon: Brain, emoji: "🧠" },
  { value: "30+", label: "Symptoms Tracked", icon: Syringe, emoji: "💉" },
  { value: "24/7", label: "AI Support", icon: MessageCircle, emoji: "🤖" },
  { value: "1 Tap", label: "SOS Emergency", icon: Phone, emoji: "🚨" },
];

const testimonials = [
  { name: "Priya S.", role: "Working Mom", text: "CareAI feels like having a doctor friend available at 3am. Absolutely love it!", avatar: "👩‍💼" },
  { name: "Rahul M.", role: "Senior Citizen", text: "The medicine reminders are a lifesaver. Never miss my blood pressure pills now.", avatar: "👴" },
  { name: "Anika T.", role: "Student", text: "The symptom checker helped me understand my health better before visiting the doctor.", avatar: "👩‍🎓" },
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
      if (choice.outcome === 'accepted') setInstallable(false);
      window.careaiDeferredInstallPrompt = null;
    }
  };

  return (
    <div className="landing-root overflow-hidden">

      {/* ── Ambient Blobs ── */}
      <div className="landing-blob landing-blob-1" aria-hidden="true" />
      <div className="landing-blob landing-blob-2" aria-hidden="true" />
      <div className="landing-blob landing-blob-3" aria-hidden="true" />

      {/* ══════════════════════════════════════════ NAVIGATION ══ */}
      <nav className="relative z-20 max-w-7xl mx-auto flex items-center justify-between px-5 py-5 lg:px-8 lg:py-7">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 grid place-items-center shadow-lg shadow-rose-200/60">
            <Heart className="w-6 h-6 text-white" strokeWidth={2.8} />
          </div>
          <div>
            <span className="font-display text-2xl landing-text-primary">CareAI</span>
            <div className="text-[10px] landing-text-muted font-semibold tracking-widest uppercase -mt-0.5">Health, Gently.</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemePicker />
          <Link to="/login" data-testid="nav-login"
            className="px-5 py-2 rounded-full text-sm font-semibold landing-text-secondary hover:landing-hover transition-all hidden sm:block">
            Sign in
          </Link>
          <Link to="/register" data-testid="nav-register"
            className="px-6 py-2.5 rounded-full text-sm font-bold bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-lg shadow-rose-300/50 hover:scale-105 hover:shadow-xl transition-all">
            Get started ✨
          </Link>
        </div>
      </nav>

      {/* ══════════════════════════════════════════ HERO ══ */}
      <section className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 pt-6 pb-20">
        <div className="grid lg:grid-cols-12 gap-12 items-center">

          {/* Left */}
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full landing-glass text-xs font-bold text-rose-600 border border-rose-200/60 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              Your gentle health companion
            </span>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.1] landing-text-primary">
              <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500 bg-clip-text text-transparent">
                Health, gently.
              </span>
              <br />
              <span>Guidance you can </span>
              <span className="text-rose-500 relative">
                trust
                <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                  <path d="M0,4 Q25,0 50,4 Q75,8 100,4" stroke="#f43f5e" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            <p className="text-lg landing-text-secondary leading-relaxed max-w-xl">
              Chat with an AI health assistant, check symptoms instantly, estimate health risks,
              manage medicines and appointments — all wrapped in a warm, beautiful experience.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/register" data-testid="hero-cta-register"
                className="group px-8 py-4 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-base shadow-xl shadow-rose-300/50 hover:scale-105 hover:shadow-2xl transition-all inline-flex items-center gap-2">
                Create your account
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" data-testid="hero-cta-login"
                className="px-8 py-4 rounded-full landing-glass border border-white/50 font-semibold landing-text-secondary hover:landing-hover transition-all">
                Sign in
              </Link>
              {installable && (
                <button onClick={installApp}
                  className="px-6 py-4 rounded-full border-2 border-dashed border-rose-300 landing-text-muted text-sm font-semibold hover:border-rose-400 transition-all flex items-center gap-2">
                  📲 Install App
                </button>
              )}
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3 pt-2">
              {["✅ Free forever", "🔒 Private & secure", "🏥 Not a medical device", "⭐ AI powered"].map(b => (
                <span key={b} className="text-xs landing-text-muted font-semibold px-3 py-1.5 rounded-full landing-glass border border-white/40">
                  {b}
                </span>
              ))}
            </div>
          </div>

          {/* Right — doodle hero visual */}
          <div className="lg:col-span-5">
            <div className="relative">
              {/* Glow ring */}
              <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-br from-rose-200 via-purple-200 to-blue-200 blur-2xl opacity-60 scale-95" />

              {/* Main card */}
              <div className="relative landing-glass-strong rounded-[3rem] p-6 border border-white/60 shadow-2xl">
                <img
                  src="/doodle-hero.jpg"
                  alt="CareAI doodles — AI robot, heart, pills, calendar, family"
                  className="w-full rounded-2xl object-cover"
                  style={{ maxHeight: 340 }}
                />

                {/* Floating badge: Always here */}
                <div className="absolute top-8 -right-4 landing-glass-strong rounded-2xl px-4 py-2 shadow-xl border border-white/70 flex items-center gap-2">
                  <span className="text-xl">🤖</span>
                  <div>
                    <div className="text-xs font-bold landing-text-primary">Always here</div>
                    <div className="text-[10px] landing-text-muted">24/7 AI Support</div>
                  </div>
                </div>

                {/* Floating badge: Privacy */}
                <div className="absolute bottom-12 -left-4 landing-glass-strong rounded-2xl px-4 py-2 shadow-xl border border-white/70 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold landing-text-primary">Your data stays private</span>
                </div>

                {/* Animated dots */}
                <div className="absolute bottom-6 right-6 flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-bounce" style={{animationDelay:"0s"}} />
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-bounce" style={{animationDelay:"0.15s"}} />
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-bounce" style={{animationDelay:"0.3s"}} />
                </div>
              </div>

              {/* Doodle dots decoration */}
              <span className="absolute -top-5 left-8 w-12 h-12 rounded-full bg-rose-200/80 doodle-dot float-slow" />
              <span className="absolute -bottom-4 right-10 w-10 h-10 rounded-full bg-purple-200/80 doodle-ring float-slower" />
              <span className="absolute top-1/2 -left-6 w-8 h-8 rounded-full bg-blue-200/80 doodle-dot float-slow" style={{animationDelay:"2s"}} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ STATS ══ */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8 mb-16">
        <div className="landing-glass-strong rounded-3xl p-6 md:p-8 border border-white/50 shadow-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map(({ value, label, emoji }) => (
              <div key={label} className="text-center group">
                <div className="text-3xl mb-2 group-hover:scale-125 transition-transform">{emoji}</div>
                <div className="font-display text-3xl md:text-4xl landing-text-primary">{value}</div>
                <div className="text-xs landing-text-muted font-semibold mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ FEATURES ══ */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full landing-glass border border-purple-200/60 text-xs font-bold text-purple-700 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Everything you need
          </span>
          <h2 className="font-display text-4xl sm:text-5xl mt-4 landing-text-primary">
            Your complete health <span className="text-rose-500">companion</span>
          </h2>
          <p className="mt-3 landing-text-secondary max-w-lg mx-auto leading-relaxed">
            From AI conversations to emergency contacts — CareAI brings warmth, clarity, and care.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map(({ icon: Icon, title, desc, color, img, tag, tagColor }) => (
            <div key={title}
              className="feat-card landing-glass rounded-3xl overflow-hidden hover:scale-[1.03] hover:shadow-2xl transition-all duration-300 group cursor-default relative border border-white/50">

              {/* Image section if available */}
              {img && (
                <div className="relative h-40 overflow-hidden">
                  <img src={img} alt={title} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                  <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full ${tagColor} shadow-sm`}>
                    {tag}
                  </span>
                </div>
              )}

              <div className="p-6">
                {!img && (
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${tagColor} mb-3 inline-block`}>{tag}</span>
                )}

                {/* Doodle decorations */}
                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white/70 doodle-ring pointer-events-none" />
                <span className="absolute bottom-4 right-4 w-5 h-5 rounded-full bg-rose-200/60 doodle-dot pointer-events-none" />

                <div className={`w-12 h-12 rounded-2xl grid place-items-center ${color} mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                  <Icon className="w-6 h-6" strokeWidth={2.5} />
                </div>
                <h3 className="font-display text-xl landing-text-primary">{title}</h3>
                <p className="mt-2 text-sm landing-text-muted leading-relaxed">{desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs text-rose-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════ DARK/LIGHT SHOWCASE ══ */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8 pb-20">
        <div className="landing-glass-strong rounded-[3rem] p-8 md:p-12 border border-white/60 shadow-2xl overflow-hidden relative">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-gradient-to-br from-rose-300/30 to-purple-300/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-gradient-to-br from-blue-300/30 to-pink-300/30 rounded-full blur-3xl" />

          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-700 text-xs font-bold mb-4">
                🎨 Beautiful Themes
              </span>
              <h2 className="font-display text-3xl sm:text-4xl landing-text-primary mb-4">
                Dark mode, light mode, and <span className="text-purple-500">8 pastel themes</span>
              </h2>
              <p className="landing-text-secondary leading-relaxed mb-6">
                Choose the look that feels right for you. Switch between stunning dark, warm light,
                anime, floral, nineties, and more — instantly. Your eyes will thank you.
              </p>
              <div className="flex gap-3 flex-wrap">
                {["☀️ Light", "🌙 Dark", "🌸 Floral", "🌊 Anime", "✨ Nineties", "🌿 Warm"].map(t => (
                  <span key={t} className="px-4 py-2 rounded-full landing-glass border border-white/50 text-sm font-semibold landing-text-secondary hover:scale-105 transition-transform cursor-default">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="relative">
              <img src="/doodle-dashboard.jpg" alt="CareAI dark theme dashboard with health score, heart rate monitor" className="rounded-2xl w-full object-cover shadow-2xl" style={{maxHeight: 280}} />
              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-purple-200/80 doodle-ring float-slow" />
              <div className="absolute -bottom-3 -left-3 w-8 h-8 rounded-full bg-rose-200/80 doodle-dot float-slower" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ TESTIMONIALS ══ */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8 pb-20">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl landing-text-primary">
            Loved by <span className="text-rose-500">real people</span> 💝
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {testimonials.map(({ name, role, text, avatar }) => (
            <div key={name} className="landing-glass rounded-3xl p-6 border border-white/50 hover:scale-[1.02] transition-all group relative overflow-hidden">
              <span className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-rose-100/80 doodle-ring pointer-events-none" />
              <div className="text-3xl mb-4">{avatar}</div>
              <p className="text-sm landing-text-secondary leading-relaxed mb-4 italic">"{text}"</p>
              <div>
                <div className="font-bold landing-text-primary text-sm">{name}</div>
                <div className="text-xs landing-text-muted">{role}</div>
              </div>
              <div className="flex gap-0.5 mt-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════ CTA ══ */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 lg:px-8 pb-20">
        <div className="relative rounded-[3rem] overflow-hidden">
          {/* Dark gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900" />
          <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 via-transparent to-purple-500/20" />

          {/* Doodle blobs */}
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />

          <div className="relative p-10 md:p-16 text-center">
            <div className="text-6xl mb-6 float-slow" style={{"--r": "0deg"}}>💚</div>
            <h2 className="font-display text-4xl sm:text-5xl text-white mb-4">
              Ready to feel <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">better</span>?
            </h2>
            <p className="text-slate-300 max-w-md mx-auto text-lg leading-relaxed mb-8">
              Join CareAI today. It is free, warm, and always here when you need a gentle hand.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Link to="/register"
                className="px-10 py-4 rounded-full bg-gradient-to-r from-rose-400 to-pink-500 text-white font-bold text-lg shadow-2xl shadow-rose-500/40 hover:scale-105 hover:shadow-3xl transition-all inline-flex items-center gap-2">
                Get started — it's free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login"
                className="px-10 py-4 rounded-full bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all backdrop-blur-sm">
                Sign in
              </Link>
            </div>

            {/* Feature checklist */}
            <div className="flex flex-wrap justify-center gap-4">
              {["Free forever", "No credit card", "Privacy first", "AI powered", "Works offline"].map(f => (
                <div key={f} className="flex items-center gap-1.5 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════ FOOTER ══ */}
      <footer className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 pb-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs landing-text-muted border-t border-white/20 pt-8">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" strokeWidth={2.5} />
            <span className="font-semibold">CareAI — Health, gently.</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Not a medical device</span>
            <span className="w-1 h-1 rounded-full bg-current opacity-50" />
            <span>Always consult a professional</span>
            <span className="w-1 h-1 rounded-full bg-current opacity-50" />
            <span>Made with 💗</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
