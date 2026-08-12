import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

const ThemeCtx = createContext(null);

// All available themes with metadata (label, color for the picker swatch, description)
export const THEMES = [
  { id: "light", label: "Light", swatch: "#FDFBF7", desc: "Soft pastel light" },
  { id: "dark", label: "Dark", swatch: "#0f172a", desc: "Deep night mode" },
  { id: "warm", label: "Warm Light", swatch: "#FBE9D7", desc: "Cozy warm tones" },
  { id: "cartoon", label: "Cartoon", swatch: "#FFD166", desc: "Playful bright" },
  { id: "nineties", label: "90's Retro", swatch: "#7C3AED", desc: "Neon retro pop" },
  { id: "floral", label: "Floral", swatch: "#F9A8D4", desc: "Garden pastel" },
  { id: "anime", label: "Anime", swatch: "#F472B6", desc: "Vibrant pop-anime" },
];

const STORAGE_KEY = "careai_theme";
const EASY_VIEW_KEY = "careai_easy_view";
const TEXT_SCALE_KEY = "careai_text_scale";
const HIGH_CONTRAST_KEY = "careai_high_contrast";
const REDUCE_MOTION_KEY = "careai_reduce_motion";
const LANGUAGE_KEY = "careai_language";

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "light";
    } catch {
      return "light";
    }
  });

  const [easyView, setEasyView] = useState(() => {
    try {
      return localStorage.getItem(EASY_VIEW_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [textScale, setTextScale] = useState(() => {
    try {
      return Number(localStorage.getItem(TEXT_SCALE_KEY) || 1);
    } catch {
      return 1;
    }
  });

  const [highContrast, setHighContrast] = useState(() => {
    try {
      return localStorage.getItem(HIGH_CONTRAST_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [reduceMotion, setReduceMotion] = useState(() => {
    try {
      return localStorage.getItem(REDUCE_MOTION_KEY) === "true";
    } catch {
      return false;
    }
  });

  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem(LANGUAGE_KEY) || "en";
    } catch {
      return "en";
    }
  });

  // Apply the theme class to <html> so CSS variables can scope under it.
  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    THEMES.forEach((t) => root.classList.remove("theme-" + t.id));
    root.classList.add("theme-" + theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-easy-view", String(easyView));
    root.setAttribute("data-high-contrast", String(highContrast));
    root.setAttribute("data-reduce-motion", String(reduceMotion));
    root.setAttribute("data-text-scale", String(textScale));
    root.setAttribute("data-language", language);
    root.style.setProperty("--careai-text-scale", String(textScale));
    root.style.setProperty("--careai-easy-view", easyView ? "1" : "0");
    root.style.setProperty("--careai-high-contrast", highContrast ? "1" : "0");
    root.style.setProperty("--careai-reduce-motion", reduceMotion ? "1" : "0");
    root.lang = language === "hi" ? "hi-IN" : "en-US";

    try {
      localStorage.setItem(EASY_VIEW_KEY, String(easyView));
      localStorage.setItem(TEXT_SCALE_KEY, String(textScale));
      localStorage.setItem(HIGH_CONTRAST_KEY, String(highContrast));
      localStorage.setItem(REDUCE_MOTION_KEY, String(reduceMotion));
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch {}
  }, [easyView, textScale, highContrast, reduceMotion, language]);

  const setThemeSafe = useCallback((id) => {
    if (THEMES.some((t) => t.id === id)) setTheme(id);
  }, []);

  const value = useMemo(() => ({
    theme,
    setTheme: setThemeSafe,
    themes: THEMES,
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
  }), [theme, setThemeSafe, easyView, textScale, highContrast, reduceMotion, language]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
