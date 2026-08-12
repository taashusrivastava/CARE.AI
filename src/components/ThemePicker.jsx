import React, { useEffect, useRef, useState } from "react";
import { Palette, Sun, Moon, Flame, ChevronDown, Check, Volume2, VolumeX, Contrast, Type, Languages, Sparkles } from "lucide-react";
import { useTheme, THEMES } from "@/context/ThemeContext";

// Small stacked-mode icons for the quick toggle (dark / light / warm)
const quickThemes = [
  { id: "dark", icon: Moon, label: "Dark" },
  { id: "light", icon: Sun, label: "Light" },
  { id: "warm", icon: Flame, label: "Warm" },
];

export default function ThemePicker() {
  const {
    theme,
    setTheme,
    easyView,
    setEasyView,
    textScale,
    setTextScale,
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion,
    language,
    setLanguage,
  } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const current = THEMES.find((t) => t.id === theme) || THEMES[0];

  const handleReadAloud = () => {
    if (!window.speechSynthesis) {
      alert(language === "hi" ? "यह ब्राउज़र में आवाज़ सुविधा उपलब्ध नहीं है।" : "Read-aloud is not supported in this browser.");
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      return;
    }

    const payload = document.body.innerText.replace(/\s+/g, " ").trim();
    const ut = new SpeechSynthesisUtterance(payload.slice(0, 700));
    ut.lang = language === "hi" ? "hi-IN" : "en-US";
    ut.rate = 0.9;
    ut.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(ut);
  };

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      <button
        type="button"
        onClick={() => setEasyView(!easyView)}
        className={`rounded-full px-3 py-2 text-xs font-bold transition ${
          easyView
            ? "bg-emerald-600 text-white shadow-sm"
            : "bg-white/80 text-slate-700 hover:bg-white"
        }`}
        aria-label={easyView ? "Return to Normal View" : "Open Easy View"}
      >
        {easyView ? (language === "hi" ? "सामान्य दृश्य" : "Return to Normal View") : (language === "hi" ? "👴 आसान दृश्य" : "👴 Easy View")}
      </button>

      {/* Quick one-click toggles: dark / light / warm */}
      <div className="hidden sm:flex items-center gap-1 rounded-full glass px-1 py-1">
        {quickThemes.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            data-testid={"theme-" + id}
            title={label}
            onClick={() => setTheme(id)}
            className={
              "p-2 rounded-full transition-all duration-200 " +
              (theme === id
                ? "bg-slate-900 text-white shadow"
                : "text-slate-500 hover:bg-white/80 hover:text-slate-900")
            }
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Full theme picker dropdown */}
      <button
        data-testid="theme-picker"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-full glass text-sm font-semibold text-slate-700 hover:text-slate-900 transition"
      >
        <span className="w-4 h-4 rounded-full border border-black/10" style={{ background: current.swatch }} />
        <span className="hidden md:inline">{current.label}</span>
        <ChevronDown className={"w-4 h-4 transition-transform " + (open ? "rotate-180" : "")} />
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-72 glass-strong rounded-2xl p-2 z-50 shadow-xl">
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Palette className="w-4 h-4" /> {language === "hi" ? "अभिगम्यता" : "Accessibility"}
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setEasyView(!easyView)}
              className="flex w-full items-center justify-between rounded-xl bg-white/80 px-3 py-2 text-left text-sm font-bold text-slate-700"
            >
              <span>{easyView ? (language === "hi" ? "सामान्य दृश्य" : "Normal View") : (language === "hi" ? "आसान दृश्य" : "Easy View")}</span>
              <Sparkles className="w-4 h-4" />
            </button>

            <div className="rounded-xl bg-white/70 p-2">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <Type className="w-3.5 h-3.5" /> {language === "hi" ? "फ़ॉन्ट आकार" : "Text size"}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setTextScale(Math.max(0.9, Number((textScale - 0.1).toFixed(1))))} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-bold">A−</button>
                <button type="button" onClick={() => setTextScale(1)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-bold">A</button>
                <button type="button" onClick={() => setTextScale(Math.min(1.4, Number((textScale + 0.1).toFixed(1))))} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm font-bold">A+</button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHighContrast(!highContrast)}
                className={`flex items-center justify-center gap-2 rounded-xl px-2 py-2 text-sm font-bold ${highContrast ? "bg-slate-900 text-white" : "bg-white/80 text-slate-700"}`}
              >
                <Contrast className="w-4 h-4" /> {language === "hi" ? "कंट्रास्ट" : "Contrast"}
              </button>
              <button
                type="button"
                onClick={() => setReduceMotion(!reduceMotion)}
                className={`flex items-center justify-center gap-2 rounded-xl px-2 py-2 text-sm font-bold ${reduceMotion ? "bg-amber-500 text-white" : "bg-white/80 text-slate-700"}`}
              >
                <Sparkles className="w-4 h-4" /> {language === "hi" ? "गति कम" : "Reduce motion"}
              </button>
            </div>

            <div className="rounded-xl bg-white/70 p-2">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                <Languages className="w-3.5 h-3.5" /> {language === "hi" ? "भाषा" : "Language"}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setLanguage("en")} className={`rounded-lg px-2 py-2 text-sm font-bold ${language === "en" ? "bg-rose-500 text-white" : "bg-white text-slate-700"}`}>English</button>
                <button type="button" onClick={() => setLanguage("hi")} className={`rounded-lg px-2 py-2 text-sm font-bold ${language === "hi" ? "bg-rose-500 text-white" : "bg-white text-slate-700"}`}>हिंदी</button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReadAloud}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white"
            >
              {window.speechSynthesis && window.speechSynthesis.speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              {window.speechSynthesis && window.speechSynthesis.speaking ? (language === "hi" ? "पढ़ना बंद करें" : "Stop Reading") : (language === "hi" ? "पढ़कर सुनाएँ" : "Read Aloud")}
            </button>
          </div>

          <div className="mt-3 border-t border-white/60 pt-3">
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Palette className="w-4 h-4" /> Themes
            </div>
            <div className="grid grid-cols-1 gap-1 max-h-52 overflow-y-auto">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setOpen(false); }}
                  className={
                    "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition " +
                    (theme === t.id ? "bg-rose-100 text-rose-900" : "hover:bg-white/80 text-slate-700")
                  }
                >
                  <span className="w-6 h-6 rounded-lg border border-black/10 shrink-0" style={{ background: t.swatch }} />
                  <span className="flex-1 text-left">
                    <span className="block leading-tight">{t.label}</span>
                    <span className="block text-xs font-normal text-slate-400">{t.desc}</span>
                  </span>
                  {theme === t.id && <Check className="w-4 h-4 text-rose-600" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
