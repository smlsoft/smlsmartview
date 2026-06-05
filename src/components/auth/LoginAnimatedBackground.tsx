"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme-context";

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function parseColor(value: string, fallback: Rgb): Rgb {
  const color = value.trim();
  const hex = color.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const raw = hex[1].length === 3
      ? hex[1].split("").map((part) => part + part).join("")
      : hex[1];
    return {
      r: Number.parseInt(raw.slice(0, 2), 16),
      g: Number.parseInt(raw.slice(2, 4), 16),
      b: Number.parseInt(raw.slice(4, 6), 16),
    };
  }

  const rgb = color.match(/^rgba?\(([^)]+)\)$/i);
  if (rgb) {
    const [r, g, b] = rgb[1]
      .split(",")
      .slice(0, 3)
      .map((part) => Number.parseFloat(part.trim()));
    if ([r, g, b].every(Number.isFinite)) {
      return { r, g, b };
    }
  }

  return fallback;
}

function rgba(color: Rgb, alpha: number) {
  return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

// Ease out function for smooth settling
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function LoginAnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTheme, dark } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    
    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const rootStyle = getComputedStyle(document.documentElement);
    
    // Base colors from theme
    const themeAccent = parseColor(rootStyle.getPropertyValue("--color-accent"), { r: 91, g: 156, b: 255 });
    const themeSecondary = parseColor(rootStyle.getPropertyValue("--color-chart-2"), { r: 96, g: 165, b: 250 });
    
    // Dynamic theme colors instead of hardcoded ones
    const color1 = themeAccent; 
    const color2 = themeSecondary;
    const color3 = parseColor(rootStyle.getPropertyValue("--color-chart-3"), { r: 168, g: 85, b: 247 });
    const color4 = parseColor(rootStyle.getPropertyValue("--color-chart-4"), { r: 236, g: 72, b: 153 });

    const orbs = [
      { color: color1, phaseX: 0, phaseY: 2, speedX: 0.0003, speedY: 0.0004, sizeScale: 0.75 },
      { color: color3, phaseX: 1, phaseY: 3, speedX: 0.0004, speedY: 0.0003, sizeScale: 0.8 },
      { color: color2, phaseX: 2, phaseY: 1, speedX: 0.0005, speedY: 0.0005, sizeScale: 0.7 },
      { color: color4, phaseX: 3, phaseY: 0, speedX: 0.00035, speedY: 0.00045, sizeScale: 0.85 },
      { color: themeAccent, phaseX: 4, phaseY: 2.5, speedX: 0.00045, speedY: 0.00035, sizeScale: 0.65 },
    ];

    const startedAt = performance.now();
    const activeDuration = 6000; // Plays actively for 6 seconds
    const settleDuration = 3500; // Takes 3.5 seconds to settle to the center

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      // If we resize after it settled, we need to redraw once
      if (performance.now() - startedAt > activeDuration + settleDuration) {
        draw(startedAt + activeDuration + settleDuration);
      }
    }

    function drawOrb(x: number, y: number, radius: number, color: Rgb, alpha: number) {
      const gradient = ctx!.createRadialGradient(x, y, 0, x, y, radius);
      gradient.addColorStop(0, rgba(color, alpha));
      gradient.addColorStop(0.5, rgba(color, alpha * 0.6));
      gradient.addColorStop(1, rgba(color, 0));
      ctx!.fillStyle = gradient;
      ctx!.beginPath();
      ctx!.arc(x, y, radius, 0, Math.PI * 2);
      ctx!.fill();
    }

    function draw(now: number) {
      const elapsed = now - startedAt;
      let progress = 1; // 1 = fully active, 0 = settled
      let isComplete = false;

      if (elapsed > activeDuration) {
        const settleElapsed = elapsed - activeDuration;
        if (settleElapsed >= settleDuration) {
          progress = 0;
          isComplete = true;
        } else {
          // Smooth transition from active to settled
          const settleProgress = settleElapsed / settleDuration;
          progress = 1 - easeOutCubic(settleProgress);
        }
      }

      ctx!.clearRect(0, 0, width, height);
      const maxDim = Math.max(width, height);
      ctx!.globalCompositeOperation = dark ? "screen" : "source-over";

      orbs.forEach((orb, i) => {
        // Dynamic position
        const dynX = width / 2 + Math.sin(now * orb.speedX + orb.phaseX) * width * 0.45;
        const dynY = height / 2 + Math.cos(now * orb.speedY + orb.phaseY) * height * 0.45;

        // Settled position (center)
        // Add a tiny bit of offset based on index so they don't perfectly overlap
        const settledX = width / 2 + Math.sin(i * 1.2) * (width * 0.05);
        const settledY = height / 2 + Math.cos(i * 1.2) * (height * 0.05);

        // Interpolate position based on progress
        const x = settledX + (dynX - settledX) * progress;
        const y = settledY + (dynY - settledY) * progress;
        
        // Size settles down slightly
        const dynRadius = maxDim * orb.sizeScale * (0.55 + Math.sin(now * 0.001 + i) * 0.15);
        const settledRadius = maxDim * orb.sizeScale * 0.6;
        const radius = settledRadius + (dynRadius - settledRadius) * progress;
        
        // Alpha dims slightly when settled
        const dynAlpha = dark 
            ? 0.45 + Math.sin(now * 0.0008 + i) * 0.15 
            : 0.65 + Math.sin(now * 0.0008 + i) * 0.15;
        const settledAlpha = dark ? 0.35 : 0.55;
        const alpha = settledAlpha + (dynAlpha - settledAlpha) * progress;

        drawOrb(x, y, radius, orb.color, alpha);
      });
      
      if (!isComplete) {
        animationFrameId = requestAnimationFrame(draw);
      }
    }

    resize();
    window.addEventListener("resize", resize);
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentTheme.id, dark]);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full scale-[1.2]" 
        style={{ filter: "blur(60px)", opacity: dark ? 0.8 : 0.5, transition: "opacity 0.5s ease" }} 
      />
    </div>
  );
}
