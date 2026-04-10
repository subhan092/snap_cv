import { create } from "zustand";

interface ThemeState {
  theme: "light" | "dark";
  toggle: () => void;
  hydrate: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  toggle: () => {
    const next = get().theme === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    set({ theme: next });
  },
  hydrate: () => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;
    const theme = saved || "light";
    document.documentElement.classList.toggle("dark", theme === "dark");
    set({ theme });
  },
}));
