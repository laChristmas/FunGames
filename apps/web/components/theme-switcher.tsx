"use client";

import { useEffect, useState } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme";

type ThemePreference = "light" | "dark" | "system";

const options: { id: ThemePreference; label: string }[] = [
  { id: "light", label: "亮色" },
  { id: "dark", label: "暗色" },
  { id: "system", label: "跟随系统" },
];

function isPreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

export function applyTheme(pref: ThemePreference) {
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = pref === "dark" || (pref === "system" && systemDark);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
  root.dataset.theme = pref;
  localStorage.setItem(THEME_STORAGE_KEY, pref);
}

export function ThemeSwitcher() {
  const [pref, setPref] = useState<ThemePreference>("system");

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const initial = isPreference(stored) ? stored : "system";
    setPref(initial);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      const current = localStorage.getItem(THEME_STORAGE_KEY);
      if (!isPreference(current) || current === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="theme-switch" role="group" aria-label="外观">
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          aria-pressed={pref === option.id}
          onClick={() => {
            applyTheme(option.id);
            setPref(option.id);
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
