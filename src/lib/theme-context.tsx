"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type ThemeId =
  | "default"
  | "debug-amber"
  | "purple-flow"
  | "teal-insight"
  | "cyber-dark"
  | "glass-violet"
  | "neon-rose"
  | "indigo-pipeline"
  | "twitch-stream"
  | "synthwave"
  | "trust-blue"
  | "vercel-minimal";

export interface Theme {
  id: ThemeId;
  name: string;
  description: string;
  swatches: [string, string, string];
}

export const THEMES: Theme[] = [
  {
    id: "default",
    name: "Warm Cafe",
    description: "ครีม-น้ำตาล อบอุ่น",
    swatches: ["#FDF6EC", "#8B5E3C", "#C4956A"],
  },
  {
    id: "debug-amber",
    name: "Debug Amber",
    description: "อำพัน-น้ำตาล · terminal style",
    swatches: ["#FFFBF0", "#D97706", "#F59E0B"],
  },
  {
    id: "purple-flow",
    name: "Purple Flow",
    description: "ม่วง-เขียว teal · HR/workflow",
    swatches: ["#FAFAFA", "#7C3AED", "#0D9488"],
  },
  {
    id: "teal-insight",
    name: "Teal Insight",
    description: "เขียว teal-ม่วง · analytics",
    swatches: ["#F8FAFC", "#0D9488", "#9333EA"],
  },
  {
    id: "cyber-dark",
    name: "Cyber Dark",
    description: "cyan neon · MIS/data monitor",
    swatches: ["#F0FFFE", "#0891B2", "#06B6D4"],
  },
  {
    id: "glass-violet",
    name: "Glass Violet",
    description: "ม่วง-cyan · glassmorphism",
    swatches: ["#F5F3FF", "#7C3AED", "#0891B2"],
  },
  {
    id: "neon-rose",
    name: "Neon Rose",
    description: "ชมพู neon-ฟ้า · TikTok/social",
    swatches: ["#FFF0F3", "#E11D48", "#06B6D4"],
  },
  {
    id: "indigo-pipeline",
    name: "Indigo Pipeline",
    description: "น้ำเงินม่วง-cyan · sales/CRM",
    swatches: ["#FAFAFA", "#4F46E5", "#06B6D4"],
  },
  {
    id: "twitch-stream",
    name: "Twitch Stream",
    description: "ม่วง Twitch · live stream",
    swatches: ["#FAF9FF", "#9146FF", "#A970FF"],
  },
  {
    id: "synthwave",
    name: "Synthwave",
    description: "ชมพู hot-ม่วง · retro 80s",
    swatches: ["#FFF0F7", "#FF006E", "#8338EC"],
  },
  {
    id: "trust-blue",
    name: "Trust Blue",
    description: "กรมเข้ม-ฟ้า · fintech/banking",
    swatches: ["#F5F7FA", "#003087", "#009CDE"],
  },
  {
    id: "vercel-minimal",
    name: "Vercel Minimal",
    description: "ขาว-ดำ · minimal clean",
    swatches: ["#FFFFFF", "#171717", "#FF5B4F"],
  },
];

interface ThemeContextType {
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  dark: boolean;
  toggleDark: () => void;
  currentTheme: Theme;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function applyToDOM(id: ThemeId, isDark: boolean) {
  const html = document.documentElement;
  if (id === "default") {
    html.removeAttribute("data-theme");
  } else {
    html.setAttribute("data-theme", id);
  }
  isDark ? html.classList.add("dark") : html.classList.remove("dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeId, setThemeId] = useState<ThemeId>("default");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("sml-theme") ?? "default") as ThemeId;
    const savedDark = localStorage.getItem("sml-dark") === "true";
    const validTheme = THEMES.find((t) => t.id === savedTheme) ? savedTheme : "default";
    setThemeId(validTheme);
    setDark(savedDark);
    applyToDOM(validTheme, savedDark);
  }, []);

  function setTheme(id: ThemeId) {
    setThemeId(id);
    localStorage.setItem("sml-theme", id);
    applyToDOM(id, dark);
  }

  function toggleDark() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("sml-dark", String(next));
    applyToDOM(themeId, next);
  }

  const currentTheme = THEMES.find((t) => t.id === themeId)!;

  return (
    <ThemeContext.Provider value={{ themeId, setTheme, dark, toggleDark, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
