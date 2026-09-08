"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Filter, ArrowRight, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { DashboardPresetKey, PeriodInfo } from "@/lib/queries/dashboard";

type DashboardFilterBarProps = {
  period: PeriodInfo;
};

const PRESETS: { key: DashboardPresetKey; label: string }[] = [
  { key: "this_month", label: "เดือนนี้" },
  { key: "last_month", label: "เดือนที่แล้ว" },
  { key: "last_3_months", label: "3 เดือนล่าสุด" },
  { key: "this_quarter", label: "ไตรมาสนี้" },
  { key: "this_year", label: "ปีนี้" },
  { key: "custom", label: "กำหนดเอง" }
];

function formatThaiDateFull(dateStr: string) {
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

  const [activePreset, setActivePreset] = useState<DashboardPresetKey>(
    period.preset || "this_month"
  );
  const [isCustomOpen, setIsCustomOpen] = useState(
    period.preset === "custom"
  );

  const [customFrom, setCustomFrom] = useState(period.start_date);
  const [customTo, setCustomTo] = useState(period.end_date);

  const handleSelectPreset = (key: DashboardPresetKey) => {
    setActivePreset(key);
    if (key === "custom") {
      setIsCustomOpen(true);
    } else {
      setIsCustomOpen(false);
      startTransition(() => {
        router.push(`/dashboard?preset=${key}`);
      });
    }
  };

  const handleCustomSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customFrom || !customTo) return;
    startTransition(() => {
      router.push(`/dashboard?preset=custom&from=${customFrom}&to=${customTo}`);
    });
  };

  return (
    <Card className="premium-surface col-span-12 p-4 md:p-5">
      <div className="flex flex-col gap-4">
        {/* Top controls row: Presets & Dropdown */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
              <Filter className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
                ตัวกรองช่วงเวลา
              </span>
              <p className="text-sm font-medium text-text-primary">
                เลือกช่วงเวลาที่ต้องการดูข้อมูล
              </p>
            </div>
          </div>

          {/* Desktop/Tablet preset buttons */}
          <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-1.5">
            {PRESETS.map((preset) => {
              const isActive = activePreset === preset.key;
              return (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => handleSelectPreset(preset.key)}
                  disabled={isPending}
                  className={cn(
                    "inline-flex h-9 items-center gap-1.5 rounded-pill px-3.5 text-xs font-medium transition-all",
                    isActive
                      ? "bg-accent text-text-on-accent shadow-sm ring-2 ring-accent/30"
                      : "bg-surface-muted text-text-secondary hover:bg-surface-sunken hover:text-text-primary"
                  )}
                >
                  {isActive && <Check className="h-3 w-3" aria-hidden="true" />}
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile dropdown selector */}
          <div className="sm:hidden">
            <Select
              value={activePreset}
              onChange={(e) =>
                handleSelectPreset(e.target.value as DashboardPresetKey)
              }
              className="h-10 text-xs"
              aria-label="เลือกช่วงเวลา"
              disabled={isPending}
            >
              {PRESETS.map((preset) => (
                <option key={preset.key} value={preset.key}>
                  {preset.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {/* Custom date range inputs (visible when กำหนดเอง is active) */}
        {isCustomOpen && (
          <div className="rounded-lg border border-border bg-surface-muted/60 p-3.5 transition-all">
            <form
              onSubmit={handleCustomSubmit}
              className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-text-secondary">
                  กำหนดช่วงวันที่:
                </span>
              </div>
              <div className="relative min-w-[150px] flex-1">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
                  aria-hidden="true"
                />
                <Input
                  type="date"
                  name="from"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-10 pl-9 text-xs"
                  aria-label="วันที่เริ่มต้น"
                  required
                />
              </div>
              <div className="hidden sm:flex sm:items-center text-text-tertiary">
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="relative min-w-[150px] flex-1">
                <CalendarDays
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary"
                  aria-hidden="true"
                />
                <Input
                  type="date"
                  name="to"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-10 pl-9 text-xs"
                  aria-label="วันที่สิ้นสุด"
                  required
                />
              </div>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                disabled={isPending}
                className="h-10 px-5 text-xs whitespace-nowrap"
              >
                {isPending ? "กำลังโหลด..." : "นำไปใช้"}
              </Button>
            </form>
          </div>
        )}

        {/* Active period visibly labelled in Thai */}
        <div className="flex flex-col gap-1.5 border-t border-border/60 pt-3 text-xs md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-text-primary">ช่วงเวลาที่แสดง:</span>
            <span className="inline-flex items-center rounded-pill bg-accent/15 px-2.5 py-0.5 font-medium text-accent-strong">
              {period.preset_label}
            </span>
            <span className="font-mono font-medium text-text-primary">
              {formatThaiDateFull(period.start_date)} ถึง{" "}
              {formatThaiDateFull(period.end_date)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-text-tertiary">
            <span>เปรียบเทียบกับช่วงเดียวกันปีก่อน:</span>
            <span className="font-mono font-medium text-text-secondary">
              {formatThaiDateFull(period.previous_start_date)} ถึง{" "}
              {formatThaiDateFull(period.previous_end_date)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
