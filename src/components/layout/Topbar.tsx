"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Moon, RefreshCw, Sun, Zap, PanelLeft, PanelTop } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { useTheme } from "@/lib/theme-context";

type TopbarProps = {
  user_name: string;
  db_name: string;
  db_code: string;
};

export function Topbar({ user_name, db_name, db_code }: TopbarProps) {
  const router = useRouter();
  const { dark, toggleDark, menuLayout, toggleMenuLayout } = useTheme();
  const [dateLabel, setDateLabel] = useState("");
  const initial = user_name.trim().charAt(0) || "U";

  useEffect(() => {
    const now = new Date();
    const date = new Intl.DateTimeFormat("th-TH", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "Asia/Bangkok"
    }).format(now);
    const time = new Intl.DateTimeFormat("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Bangkok"
    }).format(now);
    setDateLabel(`${date} · อัปเดตล่าสุด ${time} น.`);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="z-[200] flex h-[60px] shrink-0 items-center gap-4 rounded-lg bg-surface px-4 shadow-micro md:px-5">
      <div className="hidden items-center gap-2.5 md:flex">
        <Link href="/dashboard" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-accent text-text-on-accent">
            <Zap className="h-4 w-4" aria-hidden="true" />
          </div>
          <span className="font-mono text-xs font-medium tracking-[0.1em] text-text-primary">
            SML MIS AI
          </span>
        </Link>
        <div className="ml-3 h-7 w-px bg-border" aria-hidden="true" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-display truncate text-lg leading-5 text-text-primary">
          สวัสดี, <span className="text-accent">{user_name}</span>
        </p>
        <p className="mt-1 truncate text-[11.5px] text-text-tertiary">
          {dateLabel || "กำลังอ่านเวลาจากเครื่อง"} · {db_name} ({db_code})
        </p>
      </div>

      <div className="hidden rounded-md bg-surface-muted p-0.5 md:flex">
        {["วันนี้", "เดือนนี้", "ปีนี้"].map((label) => (
          <button
            key={label}
            type="button"
            className={
              label === "เดือนนี้"
                ? "rounded-sm bg-surface px-3 py-1.5 text-xs font-semibold text-accent shadow-[0_1px_4px_rgba(139,94,60,0.12)]"
                : "rounded-sm px-3 py-1.5 text-xs font-medium text-text-tertiary transition-colors hover:text-text-primary"
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <ThemeSelector />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleMenuLayout}
          aria-label={menuLayout === "side" ? "ย้ายเมนูไปด้านบน" : "ย้ายเมนูไปด้านข้าง"}
          title={menuLayout === "side" ? "ย้ายเมนูไปด้านบน" : "ย้ายเมนูไปด้านข้าง"}
          className="h-9 w-9 bg-surface-muted text-text-tertiary hover:bg-surface-sunken hover:text-accent"
        >
          {menuLayout === "side" ? <PanelTop className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleDark}
          aria-label={dark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
          className="h-9 w-9 bg-surface-muted text-text-tertiary hover:bg-surface-sunken hover:text-accent"
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => router.refresh()}
          aria-label="รีเฟรชข้อมูล"
          className="hidden h-9 w-9 bg-surface-muted text-text-tertiary hover:bg-surface-sunken hover:text-accent sm:inline-flex"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="การแจ้งเตือน"
          className="relative h-9 w-9 bg-surface-muted text-text-tertiary hover:bg-surface-sunken hover:text-accent"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-pill bg-danger ring-2 ring-surface" />
        </Button>
        <div className="hidden h-9 w-9 place-items-center rounded-pill bg-chart-2 text-sm font-semibold text-white ring-2 ring-surface-muted sm:grid">
          {initial}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={logout}
          aria-label="ออกจากระบบ"
          className="h-9 w-9"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
