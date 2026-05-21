"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { useTheme } from "@/lib/theme-context";

const themeDrivenGlow = {
  "--login-bg-0": "var(--color-bg)",
  "--login-bg-1": "var(--color-accent)",
  "--login-bg-2": "var(--color-chart-2)",
} as CSSProperties;

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

function mix(a: Rgb, b: Rgb, amount: number): Rgb {
  const t = Math.max(0, Math.min(1, amount));
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.max(0, Math.min(1, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function drawGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: Rgb,
  alpha: number,
) {
  const gradient = ctx.createRadialGradient(x, y, radius * 0.04, x, y, radius);
  gradient.addColorStop(0, rgba(color, alpha));
  gradient.addColorStop(0.36, rgba(color, alpha * 0.54));
  gradient.addColorStop(0.68, rgba(color, alpha * 0.16));
  gradient.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

function drawWave(
  ctx: CanvasRenderingContext2D,
  width: number,
  y: number,
  amplitude: number,
  phase: number,
  color: Rgb,
  alpha: number,
  thickness: number,
) {
  ctx.beginPath();
  for (let x = -60; x <= width + 60; x += 42) {
    const progress = x / width;
    const waveY =
      y +
      Math.sin(progress * Math.PI * 2.2 + phase) * amplitude +
      Math.sin(progress * Math.PI * 4.1 - phase * 0.72) * amplitude * 0.36;
    if (x === -60) {
      ctx.moveTo(x, waveY);
    } else {
      ctx.lineTo(x, waveY);
    }
  }
  ctx.strokeStyle = rgba(color, alpha);
  ctx.lineWidth = thickness;
  ctx.lineCap = "round";
  ctx.stroke();
}

export function LoginAnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { currentTheme, dark } = useTheme();
  const animationKey = `${currentTheme.id}-${dark ? "dark" : "light"}`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;
    const canvasEl: HTMLCanvasElement = canvas;
    const context: CanvasRenderingContext2D = ctx;

    let frame = 0;
    let lastDraw = 0;
    let visible = !document.hidden;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let startedAt = performance.now();
    let complete = false;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = 8400;
    const frameInterval = 1000 / (reducedMotion ? 20 : 32);
    const motionScale = reducedMotion ? 0.95 : 1.18;

    const rootStyle = getComputedStyle(document.documentElement);
    const accent = parseColor(rootStyle.getPropertyValue("--color-accent"), { r: 91, g: 156, b: 255 });
    const secondary = parseColor(rootStyle.getPropertyValue("--color-chart-2"), { r: 96, g: 165, b: 250 });
    const tertiary = parseColor(rootStyle.getPropertyValue("--color-chart-3"), { r: 147, g: 197, b: 253 });
    const white = { r: 255, g: 255, b: 255 };
    const accentAir = dark ? mix(accent, white, 0.18) : mix(accent, white, 0.54);
    const secondaryAir = dark ? mix(secondary, white, 0.16) : mix(secondary, white, 0.5);
    const tertiaryAir = dark ? mix(tertiary, white, 0.16) : mix(tertiary, white, 0.48);

    function resize() {
      const rect = canvasEl.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 1.35);
      canvasEl.width = Math.round(width * dpr);
      canvasEl.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(complete ? startedAt + duration : performance.now());
    }

    function draw(now: number) {
      const ctx = context;
      const rawProgress = Math.max(0, Math.min(1, (now - startedAt) / duration));
      const progress = smoothstep(0, 1, rawProgress);
      const seconds = rawProgress * 14;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";

      const maxSide = Math.max(width, height);
      const phase = seconds * 0.3;
      const enter = smoothstep(0.02, 0.18, rawProgress);
      const middle = smoothstep(0.18, 0.36, rawProgress) * (1 - smoothstep(0.66, 0.88, rawProgress));
      const greenPass = smoothstep(0.34, 0.48, rawProgress) * (1 - smoothstep(0.62, 0.82, rawProgress));
      const fadeOut = 1 - smoothstep(0.82, 1, rawProgress);
      const tail = 0.1 * (1 - smoothstep(0.92, 1, rawProgress));
      const intensity = (tail + enter * 0.42 + middle * 0.8) * fadeOut;
      const calm = dark ? 0.62 : 1;
      const sheetColor = mix(secondaryAir, tertiaryAir, greenPass * 0.88);
      const companionColor = mix(tertiaryAir, accentAir, 0.28 + greenPass * 0.34);
      const sweepX = width * (-0.42 + progress * 1.82);
      const sweepY =
        height * (1.08 - progress * 1.04) +
        Math.sin(progress * Math.PI * 2.1) * height * 0.11 * motionScale;

      const veil = ctx.createLinearGradient(
        width * (-0.12 + progress * 0.44),
        height * 0.04,
        width * (0.82 + progress * 0.34),
        height * 0.78,
      );
      veil.addColorStop(0, rgba(sheetColor, (dark ? 0.22 : 0.28) * calm * intensity));
      veil.addColorStop(0.46, rgba(companionColor, (dark ? 0.15 : 0.2) * calm * intensity));
      veil.addColorStop(1, rgba(tertiaryAir, 0));
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, width, height);

      drawGlow(
        ctx,
        sweepX,
        sweepY,
        maxSide * (0.96 + middle * 0.22),
        sheetColor,
        (dark ? 0.52 : 0.74) * calm * intensity,
      );
      drawGlow(
        ctx,
        sweepX + width * (0.34 + Math.sin(phase) * 0.16 * motionScale),
        sweepY - height * (0.34 + Math.cos(phase * 0.7) * 0.08 * motionScale),
        maxSide * 0.72,
        companionColor,
        (dark ? 0.34 : 0.46) * calm * intensity,
      );
      drawGlow(
        ctx,
        width * (-0.08 + progress * 0.7),
        height * (0.86 - progress * 0.52),
        maxSide * 0.6,
        secondaryAir,
        (dark ? 0.18 : 0.28) * calm * (intensity + 0.08),
      );
      drawGlow(
        ctx,
        width * (1.02 - progress * 0.42 + Math.sin(phase * 0.8) * 0.1 * motionScale),
        height * (0.94 - progress * 0.38),
        maxSide * 0.52,
        sheetColor,
        (dark ? 0.12 : 0.2) * calm * (1 - progress) * 0.9,
      );

      ctx.save();
      ctx.filter = "blur(24px)";
      ctx.globalCompositeOperation = "screen";
      drawWave(
        ctx,
        width,
        height * (0.54 + Math.sin(phase) * 0.09 * motionScale - progress * 0.32),
        Math.max(20, height * 0.03),
        seconds * 0.58,
        mix(secondaryAir, white, 0.18),
        (dark ? 0.052 : 0.084) * intensity,
        Math.max(40, height * 0.058),
      );
      drawWave(
        ctx,
        width,
        height * (0.74 + Math.cos(phase * 0.8) * 0.06 * motionScale - progress * 0.28),
        Math.max(18, height * 0.024),
        -seconds * 0.5,
        mix(tertiaryAir, white, 0.24),
        (dark ? 0.042 : 0.072) * intensity,
        Math.max(34, height * 0.048),
      );
      ctx.restore();

      ctx.globalCompositeOperation = "destination-in";
      const fade = ctx.createLinearGradient(0, 0, 0, height);
      fade.addColorStop(0, "rgba(255,255,255,0.98)");
      fade.addColorStop(0.34, "rgba(255,255,255,0.9)");
      fade.addColorStop(0.72, "rgba(255,255,255,0.52)");
      fade.addColorStop(1, "rgba(255,255,255,0.18)");
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "source-over";
    }

    function tick(now: number) {
      if (visible && now - lastDraw >= frameInterval) {
        draw(now);
        lastDraw = now;
      }
      if (now - startedAt >= duration) {
        complete = true;
        draw(startedAt + duration);
        return;
      }
      frame = window.requestAnimationFrame(tick);
    }

    function onVisibilityChange() {
      visible = !document.hidden;
    }

    resize();
    startedAt = performance.now();
    draw(startedAt);
    frame = window.requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [animationKey, dark]);

  return (
    <div
      aria-hidden="true"
      className="login-animated-bg"
      style={themeDrivenGlow}
    >
      <canvas ref={canvasRef} className="login-animated-bg__canvas" />
      <div className="login-animated-bg__wash" />
    </div>
  );
}
