"use client";

import { useRef, useEffect, type ReactNode } from "react";

interface GlassProps {
  children: ReactNode;
  className?: string;
  /** Enable pointer-following specular highlight (data-tilt) */
  tilt?: boolean;
  /** Optional: "bar" | "card" for preset styles */
  variant?: "bar" | "card" | "chip";
}

export function Glass({ children, className = "", tilt = false, variant }: GlassProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tilt || !ref.current) return;
    const el = ref.current;

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${-py * 6}deg) rotateY(${px * 8}deg) translateY(-1px)`;
      el.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
      el.style.setProperty("--my", `${(py + 0.5) * 100}%`);
    };

    const onLeave = () => {
      el.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateY(0)";
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [tilt]);

  const variantClass = variant === "bar" ? " glass-bar" : variant === "card" ? " glass-card" : "";
  const tiltAttr = tilt ? { "data-tilt": true } : {};

  return (
    <div
      ref={ref}
      className={`glass${variantClass} ${className}`.trim()}
      {...tiltAttr}
    >
      <div className="glass-highlight" aria-hidden />
      {children}
    </div>
  );
}
