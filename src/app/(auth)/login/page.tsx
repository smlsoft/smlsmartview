"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Database,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Moon,
  ShieldCheck,
  Sun,
  UserRound,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ThemeSelector } from "@/components/ui/theme-selector";
import { useTheme } from "@/lib/theme-context";
import type { Branch } from "@/lib/session";

type Step = "credentials" | "select-db";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const { dark, toggleDark } = useTheme();
  const redirectTo = params.get("from") || "/dashboard";

  const [step, setStep] = useState<Step>("credentials");
  const [provider, setProvider] = useState("SMLGOH");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userName, setUserName] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selected, setSelected] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedBranch = useMemo(
    () => branches.find((branch) => branch.db_code === selected),
    [branches, selected]
  );

  async function submitCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }
      const preferredBranch =
        data.branches.find((branch: Branch) => branch.db_code === "tdl_test") ??
        data.branches[0];
      setUserName(data.user_name);
      setBranches(data.branches);
      setSelected(preferredBranch?.db_code ?? "");
      setStep("select-db");
    } catch (err) {
      setError(err instanceof Error ? err.message : "เชื่อมต่อไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function submitDb(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!selectedBranch) {
        setError("กรุณาเลือกฐานข้อมูล");
        return;
      }
      const res = await fetch("/api/auth/select-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          db_code: selectedBranch.db_code,
          db_name: selectedBranch.db_name
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "เลือกฐานข้อมูลไม่สำเร็จ");
        return;
      }
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "เชื่อมต่อไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  async function backToCredentials() {
    setError(null);
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setLoading(false);
    }
    setStep("credentials");
    setPassword("");
    setUserName("");
    setBranches([]);
    setSelected("");
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="premium-page-bg relative flex min-h-screen items-center justify-center p-4 text-text-primary md:p-6">
      <div className="grid w-full max-w-[860px] gap-3.5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="relative flex min-h-[520px] flex-col justify-between overflow-hidden rounded-lg bg-accent px-8 py-9 text-text-on-accent shadow-lift md:px-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-[280px] w-[280px] rounded-pill border border-chart-2/25" />
          <div className="pointer-events-none absolute -bottom-24 -left-12 h-[260px] w-[260px] rounded-pill bg-white/5" />

          <div className="relative z-10">
            <div className="mb-12 flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-md bg-chart-2 text-white">
                <Zap className="h-[18px] w-[18px]" aria-hidden="true" />
              </div>
              <span className="font-mono text-xs font-medium tracking-[0.12em] text-bg/90">
                SML MIS AI
              </span>
            </div>

            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-chart-2/90">
              Management Information System
            </p>
            <h1 className="font-display mt-3 text-[44px] leading-[1.12] text-bg">
              ข้อมูล
              <br />
              เพื่อการ
              <br />
              <span className="text-chart-2">ตัดสินใจ</span>
            </h1>
            <div className="my-6 h-0.5 w-8 bg-chart-2/60" />
            <p className="max-w-[300px] text-[13.5px] leading-7 text-bg/65">
              ระบบบริหารจัดการธุรกิจอัจฉริยะ รวมข้อมูลทุกด้านขององค์กรไว้ในที่เดียว
              วิเคราะห์ด้วย AI และเชื่อมข้อมูลจริงจาก SMLERP
            </p>
          </div>

          <div className="relative z-10">
            <div className="space-y-3">
              {[
                "Executive Dashboard แบบ Real-time",
                "วิเคราะห์กำไร-ขาดทุนอัตโนมัติ",
                "จัดการสต็อก ลูกหนี้ เจ้าหนี้",
                "รายงาน AI พร้อมคำแนะนำเชิงลึก"
              ].map((item) => (
                <div key={item} className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-pill bg-chart-2" />
                  <span className="text-[13px] text-bg/70">{item}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 font-mono text-[10px] tracking-[0.1em] text-bg/30">
              SML MIS AI v2.1.0 - 2026
            </p>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-lg bg-surface px-8 py-10 shadow-micro md:px-9">
            {step === "credentials" ? (
              <form onSubmit={submitCredentials} className="space-y-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-chart-2">
                    Welcome back
                  </p>
                  <h2 className="font-display mt-2 text-[30px] leading-9 text-text-primary">
                    เข้าสู่ระบบ
                  </h2>
                  <p className="mt-1.5 text-[13.5px] leading-6 text-text-tertiary">
                    กรอกข้อมูลเพื่อเข้าใช้งาน SML MIS AI
                  </p>
                </div>

                <div className="space-y-[18px] pt-3">
                  <div className="space-y-2">
                    <Label htmlFor="provider" className="label-caps text-text-secondary">
                      Provider Code
                    </Label>
                    <Input
                      id="provider"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="uppercase"
                      required
                      autoComplete="organization"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="label-caps text-text-secondary">
                      อีเมล / ชื่อผู้ใช้
                    </Label>
                    <div className="relative">
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pr-11"
                        placeholder="กรอกอีเมลหรือชื่อผู้ใช้"
                        required
                        autoComplete="username"
                      />
                      <UserRound className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="label-caps text-text-secondary">
                      รหัสผ่าน
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-11"
                        placeholder="กรอกรหัสผ่าน"
                        required
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary transition-colors hover:text-accent"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setRemember((value) => !value)}
                    className="flex items-center gap-2.5 text-[13px] text-text-tertiary"
                  >
                    <span className="neu-inset grid h-[19px] w-[19px] place-items-center rounded-xs">
                      {remember ? (
                        <Check className="h-3 w-3 text-accent" strokeWidth={3} />
                      ) : null}
                    </span>
                    จดจำการเข้าสู่ระบบ
                  </button>
                  <span className="text-[13px] font-medium text-accent">
                    ลืมรหัสผ่าน?
                  </span>
                </div>

                {error ? (
                  <div className="rounded-md bg-danger-soft p-3 text-sm text-danger">
                    {error}
                  </div>
                ) : null}

                <Button type="submit" className="h-[50px] w-full" disabled={loading}>
                  {loading ? "กำลังตรวจสอบ" : "เข้าสู่ระบบ"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>

                <div className="border-t border-border pt-4 text-center">
                  <p className="text-[11.5px] text-text-tertiary">
                    ระบบรักษาความปลอดภัยด้วย{" "}
                    <span className="font-medium text-accent">SSL Encryption</span>
                  </p>
                  <p className="mt-3 font-mono text-[10px] tracking-[0.08em] text-border-strong">
                    v2.1.0
                  </p>
                </div>
              </form>
            ) : (
              <form onSubmit={submitDb} className="space-y-5">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-success">
                    Verified
                  </p>
                  <h2 className="font-display mt-2 text-[30px] leading-9 text-text-primary">
                    เลือกฐานข้อมูล
                  </h2>
                  <p className="mt-1.5 text-[13.5px] leading-6 text-text-tertiary">
                    ยินดีต้อนรับ {userName} เลือกบริษัท/สาขาที่ต้องการดูข้อมูล
                  </p>
                </div>

                <div className="rounded-md bg-success-soft p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-success" />
                    <div>
                      <p className="text-sm font-semibold text-text-primary">
                        สิทธิ์ผ่านแล้ว
                      </p>
                      <p className="mt-1 text-sm text-text-secondary">
                        พบฐานข้อมูลที่เข้าได้ {branches.length.toLocaleString("th-TH")} รายการ
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch" className="label-caps text-text-secondary">
                    ฐานข้อมูล / บริษัท
                  </Label>
                  <div className="relative">
                    <Select
                      id="branch"
                      value={selected}
                      onChange={(e) => setSelected(e.target.value)}
                      className="pr-11"
                      required
                    >
                      {branches.map((branch) => (
                        <option key={branch.db_code} value={branch.db_code}>
                          {branch.db_name} ({branch.db_code})
                        </option>
                      ))}
                    </Select>
                    <Database className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                  </div>
                </div>

                {error ? (
                  <div className="rounded-md bg-danger-soft p-3 text-sm text-danger">
                    {error}
                  </div>
                ) : null}

                <div className="grid grid-cols-[auto_1fr] gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    onClick={backToCredentials}
                    disabled={loading}
                    aria-label="ย้อนกลับไปหน้ากรอกรหัส"
                  >
                    <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                  </Button>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={loading || !selectedBranch}
                  >
                    {loading ? "กำลังเข้า dashboard" : "เข้าสู่ Dashboard"}
                    <LockKeyhole className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* Theme controls — bottom-right corner */}
      <div className="fixed bottom-4 right-4 z-[400] flex items-center gap-1.5 rounded-xl border border-border bg-surface/80 px-2 py-1.5 shadow-lift backdrop-blur-sm">
        <ThemeSelector placement="up" />
        <div className="h-5 w-px bg-border" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={toggleDark}
          aria-label={dark ? "เปลี่ยนเป็นโหมดสว่าง" : "เปลี่ยนเป็นโหมดมืด"}
          className="h-8 w-8 text-text-tertiary hover:bg-surface-muted hover:text-accent"
        >
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </main>
  );
}
