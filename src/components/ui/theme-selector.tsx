"use client";

import { useEffect, useRef, useState } from "react";
import { Palette } from "lucide-react";
import { THEMES, useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";

interface ThemeSelectorProps {
  placement?: "down" | "up";
}

export function ThemeSelector({ placement = "down" }: ThemeSelectorProps) {
  const { themeId, setTheme, currentTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  return (
    <div ref={ref} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        aria-label="เลือกธีมสี"
        aria-expanded={open}
        className="h-9 w-9 bg-surface-muted text-text-tertiary hover:bg-surface-sunken hover:text-accent"
      >
        <span className="flex items-center gap-0.5">
          {currentTheme.swatches.map((color, i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </span>
      </Button>

      {open && (
        <div className={`absolute right-0 z-[300] w-72 overflow-hidden rounded-xl border border-border bg-surface shadow-lift ${placement === "up" ? "bottom-full mb-2" : "top-full mt-2"}`}>
          <div className="border-b border-border px-3 py-2.5">
            <div className="flex items-center gap-2">
              <Palette className="h-3.5 w-3.5 text-text-tertiary" />
              <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
                Color Theme
              </span>
            </div>
          </div>

          <div className="max-h-[420px] overflow-y-auto p-1.5 premium-scrollbar">
            {THEMES.map((theme) => {
              const active = themeId === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => { setTheme(theme.id); setOpen(false); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                    active
                      ? "bg-accent-soft text-accent"
                      : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
                  }`}
                >
                  <span className="flex shrink-0 items-center gap-0.5">
                    {theme.swatches.map((color, i) => (
                      <span
                        key={i}
                        className="h-4 w-4 rounded-full ring-1 ring-border"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold leading-4">
                      {theme.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-text-tertiary">
                      {theme.description}
                    </span>
                  </span>

                  {active && (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
