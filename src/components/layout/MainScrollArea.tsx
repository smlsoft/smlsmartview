"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const VISIBLE_MS = 900;

export function MainScrollArea({ children }: { children: React.ReactNode }) {
  const [scrolling, setScrolling] = useState(false);
  const areaRef = useRef<HTMLElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return undefined;
    let lastTop = area.scrollTop;
    let lastLeft = area.scrollLeft;
    let frame = 0;

    const watchScrollPosition = () => {
      if (area.scrollTop !== lastTop || area.scrollLeft !== lastLeft) {
        lastTop = area.scrollTop;
        lastLeft = area.scrollLeft;
        markScrolling();
      }
      frame = requestAnimationFrame(watchScrollPosition);
    };

    area.addEventListener("scroll", markScrolling, { passive: true });
    area.addEventListener("wheel", markScrolling, { passive: true });
    area.addEventListener("touchmove", markScrolling, { passive: true });
    frame = requestAnimationFrame(watchScrollPosition);

    return () => {
      cancelAnimationFrame(frame);
      area.removeEventListener("scroll", markScrolling);
      area.removeEventListener("wheel", markScrolling);
      area.removeEventListener("touchmove", markScrolling);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function markScrolling() {
    setScrolling(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setScrolling(false), VISIBLE_MS);
  }

  return (
    <main
      ref={areaRef}
      className={cn(
        "premium-scrollbar min-w-0 flex-1 overflow-y-auto flex flex-col",
        scrolling ? "is-scrolling" : ""
      )}
    >
      {children}
    </main>
  );
}
