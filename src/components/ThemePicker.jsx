import React, { useEffect, useRef, useState } from "react";
import { Palette, Sun, Moon, Flame, ChevronDown, Check } from "lucide-react";
import { useTheme, THEMES } from "@/context/ThemeContext";

// Small stacked-mode icons for the quick toggle (dark / light / warm)
const quickThemes = [
  { id: "dark", icon: Moon, label: "Dark" },
  { id: "light", icon: Sun, label: "Light" },
  { id: "warm", icon: Flame, label: "Warm" },
];

export default function ThemePicker() {
  const { theme, setTheme } = useTheme();
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

  return (
    <div ref={ref} className="relative flex items-center gap-2">
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
        <div className="absolute right-0 top-12 w-64 glass-strong rounded-2xl p-2 z-50 shadow-xl">
          <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Palette className="w-4 h-4" /> Themes
          </div>
          <div className="grid grid-cols-1 gap-1 max-h-80 overflow-y-auto">
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
      )}
    </div>
  );
}
