"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { THEMES } from "@/lib/theme";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (open && wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        if (!target.closest(".theme-sheet-panel")) setOpen(false);
      }
    };
    if (open) document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  return (
    <>
      <div className="theme-switcher-wrap" ref={wrapRef}>
        <button
          type="button"
          className="theme-switcher-trigger icon-btn"
          onClick={() => setOpen((o) => !o)}
          aria-label="Change theme"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="theme-sheet-overlay" onClick={() => setOpen(false)} aria-hidden />
      )}

      {open && (
        <div className="theme-sheet-panel" role="dialog" aria-label="Choose theme">
          <div className="theme-sheet-handle" aria-hidden />
          <div className="theme-switcher-label">Theme</div>
          <div className="theme-switcher-swatches">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`theme-swatch${theme === t.id ? " active" : ""}`}
                onClick={() => {
                  setTheme(t.id);
                  setOpen(false);
                }}
                style={{ ["--swatch-color" as string]: t.color }}
                title={t.label}
                aria-label={`${t.label} theme`}
                role="menuitemradio"
                aria-checked={theme === t.id}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
