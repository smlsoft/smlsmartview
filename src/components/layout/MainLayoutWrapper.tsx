"use client";

import { useTheme } from "@/lib/theme-context";

export function MainLayoutWrapper({
  topbar,
  sidebar,
  topNav,
  mainContent,
}: {
  topbar: React.ReactNode;
  sidebar: React.ReactNode;
  topNav: React.ReactNode;
  mainContent: React.ReactNode;
}) {
  const { menuLayout } = useTheme();

  if (menuLayout === "top") {
    return (
      <div className="flex h-full flex-col gap-3 overflow-hidden md:gap-4">
        <div className="flex flex-col gap-1.5 shrink-0">
          {topbar}
          {topNav}
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {mainContent}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden md:gap-4">
      {topbar}
      <div className="flex min-h-0 flex-1 gap-3 overflow-hidden md:gap-4">
        {sidebar}
        {mainContent}
      </div>
    </div>
  );
}
