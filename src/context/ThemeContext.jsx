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

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || "light";
    } catch {
      return "light";
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

  const setThemeSafe = useCallback((id) => {
    if (THEMES.some((t) => t.id === id)) setTheme(id);
  }, []);

  const value = useMemo(() => ({ theme, setTheme: setThemeSafe, themes: THEMES }), [theme, setThemeSafe]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
