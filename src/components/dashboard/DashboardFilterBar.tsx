"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  ArrowRight,
  Check,
  Loader2,
  CalendarRange
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DashboardPresetKey, PeriodInfo } from "@/lib/queries/dashboard";

type DashboardFilterBarProps = {
  period: PeriodInfo;
};

const PRESETS: { key: DashboardPresetKey; label: string; shortLabel?: string }[] = [
  { key: "this_month", label: "เดือนนี้" },
  { key: "last_month", label: "เดือนที่แล้ว" },
  { key: "last_3_months", label: "3 เดือนล่าสุด", shortLabel: "3 เดือน" },
  { key: "this_quarter", label: "ไตรมาสนี้" },
  { key: "this_year", label: "ปีนี้" },
  { key: "custom", label: "กำหนดเอง" }
];

function formatThaiDateShort(dateStr: string) {
  if (!dateStr) return "-";
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Bangkok"
  }).format(new Date(`${dateStr}T00:00:00+07:00`));
}

export function DashboardFilterBar({ period }: DashboardFilterBarProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Optimistic preset tracking for instant UI responsiveness
  const [activePreset, setActivePreset] = useState<DashboardPresetKey>(
    period.preset || "this_month"
  );
  const [isCustomDropdownOpen, setIsCustomDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [customFrom, setCustomFrom] = useState(period.start_date);
  const [customTo, setCustomTo] = useState(period.end_date);

  const customDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Sync state when period props update from server
  useEffect(() => {
    setActivePreset(period.preset || "this_month");
    setCustomFrom(period.start_date);
    setCustomTo(period.end_date);
  }, [period.preset, period.start_date, period.end_date]);

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        customDropdownRef.current &&
        !customDropdownRef.current.contains(target)
      ) {
        setIsCustomDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target)
      ) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPreset = (key: DashboardPresetKey) => {
    // 1. Optimistic feedback: update UI immediately (0ms delay)
    setActivePreset(key);
    setIsMobileMenuOpen(false);

    if (key === "custom") {
      setIsCustomDropdownOpen((prev) => !prev);
      return;
    }

    setIsCustomDropdownOpen(false);

    // 2. Non-blocking navigation: does not lock button or cause scroll jumps
    startTransition(() => {
      router.replace(`/dashboard?preset=${key}`, { scroll: false });
    });
  };

  const handleCustomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customFrom || !customTo) return;
    setActivePreset("custom");
    setIsCustomDropdownOpen(false);
    setIsMobileMenuOpen(false);

    startTransition(() => {
      router.replace(
        `/dashboard?preset=custom&from=${customFrom}&to=${customTo}`,
        { scroll: false }
      );
    });
  };

  const activeLabel =
    PRESETS.find((p) => p.key === activePreset)?.label || period.preset_label;

  return (
    <Card className="premium-surface col-span-12 !overflow-visible relative z-40 p-2 sm:px-3.5 sm:py-2 [&::before]:rounded-lg">
      <div className="relative z-40 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side: Segmented Presets on Desktop */}
        <div className="hidden sm:flex sm:items-center sm:gap-2">
          <div className="flex items-center gap-1.5 text-text-tertiary">
            <CalendarDays className="h-4 w-4 text-accent" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              ช่วงเวลา
            </span>
          </div>

          <div className="flex items-center gap-1 rounded-pill bg-surface-muted/80 p-0.5 border border-border/50">
            {PRESETS.filter((p) => p.key !== "custom").map((preset) => {
              const isActive = activePreset === preset.key;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => handleSelectPreset(preset.key)}
                  className={cn(
                    "relative inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-xs font-medium transition-all duration-150 active:scale-95",
                    isActive
                      ? "bg-accent text-text-on-accent shadow-sm"
                      : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
                  )}
                >
                  {isActive && (
                    <Check className="h-3 w-3 stroke-[2.5]" aria-hidden="true" />
                  )}
                  <span>{preset.label}</span>
                </button>
              );
            })}

            {/* "กำหนดเอง" button with dropdown popover */}
            <div ref={customDropdownRef} className="relative z-50">
              <button
                type="button"
                onClick={() => handleSelectPreset("custom")}
                className={cn(
                  "relative inline-flex h-8 items-center gap-1 rounded-pill px-2.5 text-xs font-medium transition-all duration-150 active:scale-95",
                  activePreset === "custom"
                    ? "bg-accent text-text-on-accent shadow-sm"
                    : "text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
                )}
              >
                <span>กำหนดเอง</span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 transition-transform duration-200",
                    isCustomDropdownOpen && "rotate-180"
                  )}
                  aria-hidden="true"
                />
              </button>

              {/* Floating Dropdown for Custom Date Range */}
              {isCustomDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 z-50 w-80 rounded-xl border border-border bg-surface p-4 shadow-lift animate-in fade-in zoom-in-95 duration-150">
                  <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                      <CalendarRange className="h-4 w-4 text-accent" />
                      <span>ระบุช่วงวันที่ต้องการ</span>
                    </div>
                    <span className="text-[11px] text-text-tertiary">กำหนดเอง</span>
                  </div>

                  <form onSubmit={handleCustomSubmit} className="space-y-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-text-secondary">
                        วันที่เริ่มต้น:
                      </label>
                      <Input
                        type="date"
                        value={customFrom}
                        onChange={(e) => setCustomFrom(e.target.value)}
                        className="h-9 text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-[11px] font-medium text-text-secondary">
                        วันที่สิ้นสุด:
                      </label>
                      <Input
                        type="date"
                        value={customTo}
                        onChange={(e) => setCustomTo(e.target.value)}
                        className="h-9 text-xs"
                        required
                      />
                    </div>

                    <div className="pt-1 flex items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsCustomDropdownOpen(false)}
                        className="h-8 text-xs text-text-tertiary hover:text-text-primary"
                      >
                        ยกเลิก
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        className="h-8 px-4 text-xs font-medium"
                      >
                        นำไปใช้
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile: Compact Dropdown Button */}
        <div ref={mobileMenuRef} className="relative z-50 sm:hidden">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-muted/60 px-3 py-2 text-xs font-medium text-text-primary transition-colors hover:bg-surface-sunken"
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-accent" />
              <span className="font-semibold">{activeLabel}:</span>
              <span className="font-mono text-text-secondary">
                {formatThaiDateShort(period.start_date)} - {formatThaiDateShort(period.end_date)}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-text-tertiary transition-transform",
                isMobileMenuOpen && "rotate-180"
              )}
            />
          </button>

          {isMobileMenuOpen && (
            <div className="absolute left-0 top-full mt-1.5 z-50 w-full rounded-xl border border-border bg-surface p-3 shadow-lift">
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {PRESETS.map((preset) => {
                  const isActive = activePreset === preset.key;
                  return (
                    <button
                      key={preset.key}
                      type="button"
                      onClick={() => handleSelectPreset(preset.key)}
                      className={cn(
                        "flex h-8 items-center justify-between rounded-md px-2.5 text-xs font-medium transition-all",
                        isActive
                          ? "bg-accent text-text-on-accent"
                          : "bg-surface-muted text-text-secondary hover:bg-surface-sunken"
                      )}
                    >
                      <span>{preset.label}</span>
                      {isActive && <Check className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>

              {/* Mobile custom range section */}
              {activePreset === "custom" && (
                <form
                  onSubmit={handleCustomSubmit}
                  className="space-y-2 border-t border-border pt-2"
                >
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={customFrom}
                      onChange={(e) => setCustomFrom(e.target.value)}
                      className="h-8 text-xs flex-1"
                      required
                    />
                    <ArrowRight className="h-3 w-3 text-text-tertiary" />
                    <Input
                      type="date"
                      value={customTo}
                      onChange={(e) => setCustomTo(e.target.value)}
                      className="h-8 text-xs flex-1"
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                    className="w-full h-8 text-xs"
                  >
                    นำไปใช้
                  </Button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right side: Active date range badge & subtle loading indicator */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-pill bg-surface-muted px-3 py-1 text-text-secondary border border-border/40">
            <span className="font-mono font-medium text-text-primary">
              {formatThaiDateShort(period.start_date)} ถึง {formatThaiDateShort(period.end_date)}
            </span>
            <span className="hidden lg:inline text-[11px] text-text-tertiary">
              (เทียบปีก่อน: {formatThaiDateShort(period.previous_start_date)} - {formatThaiDateShort(period.previous_end_date)})
            </span>
          </div>

          {/* Non-blocking subtle loading indicator */}
          {isPending && (
            <div className="flex items-center gap-1 text-[11px] font-medium text-accent animate-in fade-in duration-150">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="hidden sm:inline">กำลังอัปเดต...</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
