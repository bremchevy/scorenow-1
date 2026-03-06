export const THEME_STORAGE_KEY = "scorenow-theme";

export type ThemeId = "light" | "dark" | "blue" | "red" | "green" | "purple";

export const THEMES: { id: ThemeId; label: string; color: string }[] = [
  { id: "light", label: "Light", color: "#f5f5f7" },
  { id: "dark", label: "Dark", color: "#1d1d1f" },
  { id: "blue", label: "Blue", color: "#5ac8fa" },
  { id: "red", label: "Red", color: "#ff6482" },
  { id: "green", label: "Green", color: "#30d158" },
  { id: "purple", label: "Purple", color: "#bf5af2" },
];

export function getStoredTheme(): ThemeId {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeId | null;
  if (stored && THEMES.some((t) => t.id === stored)) return stored;
  return "light";
}

export function setStoredTheme(theme: ThemeId): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  document.documentElement.setAttribute("data-theme", theme);
}
