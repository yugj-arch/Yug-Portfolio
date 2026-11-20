// Accent themes. Applied as CSS variables on <html data-theme>. Stored on this device only.
export const THEMES = {
  teal: { accent: "#5eead4", bg: "#0a0e17" },
  amber: { accent: "#fbbf24", bg: "#120d05" },
  rose: { accent: "#fb7185", bg: "#14080c" },
  violet: { accent: "#a78bfa", bg: "#0d0a17" },
  ice: { accent: "#7dd3fc", bg: "#06101a" },
} as const;

export type ThemeName = keyof typeof THEMES;
export const THEME_KEY = "yj:theme";

export function applyTheme(name: ThemeName) {
  const t = THEMES[name];
  const root = document.documentElement;
  root.dataset.theme = name;
  root.style.setProperty("--accentColor", t.accent);
  root.style.setProperty("--backgroundColor", t.bg);
}
