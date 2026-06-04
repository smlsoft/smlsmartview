"use client";

import { useState } from "react";
import { Bot, AlertCircle, Loader2 } from "lucide-react";

export default function AssistantPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Read the env variable exposed to the client
  const aichatUrl = process.env.NEXT_PUBLIC_AICHAT_URL ?? "http://localhost:3010";

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-64px)] overflow-hidden bg-bg">
      {/* Header section */}
      <div className="flex-none p-4 md:px-8 md:py-6 border-b border-border bg-surface">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 max-w-5xl mx-auto w-full">
          <div>
            <div className="flex items-center gap-2 text-accent">
              <Bot className="h-6 w-6" />
              <h1 className="font-display text-[24px] leading-[32px] text-text-primary">ผู้ช่วย AI</h1>
            </div>
            <p className="mt-1 text-sm text-text-secondary">ระบบถามตอบและค้นหาข้อมูลอัจฉริยะ</p>
          </div>
        </div>
      </div>

      {/* Embedded iframe area */}
      <div className="flex-1 p-4 md:px-8 overflow-hidden relative flex flex-col">
        <div className="max-w-5xl mx-auto w-full h-full relative flex flex-col flex-1">
          {isLoading && !hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface/50 rounded-lg z-10">
              <Loader2 className="h-8 w-8 text-accent animate-spin mb-4" />
              <p className="text-text-secondary">กำลังโหลดผู้ช่วย AI...</p>
            </div>
          )}
          
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface rounded-lg border border-border z-20 p-6 text-center shadow-micro">
              <AlertCircle className="h-12 w-12 text-danger mb-4 opacity-80" />
              <h2 className="text-lg font-medium text-text-primary mb-2">ไม่สามารถโหลดผู้ช่วย AI ได้</h2>
              <p className="text-text-secondary max-w-md">
                ไม่สามารถเชื่อมต่อกับ node smlaichat ได้ โปรดตรวจสอบว่า node กำลังรันอยู่ที่ <code className="bg-surface-muted px-1 py-0.5 rounded text-sm">{aichatUrl}</code>
              </p>
            </div>
          )}

          <div className="flex-1 overflow-hidden w-full h-full border border-border bg-surface shadow-micro rounded-lg flex flex-col relative z-0">
            <iframe
              src={aichatUrl}
              title="SML AI Chat"
              className={`w-full h-full flex-1 border-0 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
