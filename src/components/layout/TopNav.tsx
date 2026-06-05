"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  sidebarNavGroups,
  type SidebarNavGroup,
  type SidebarNavItem,
  fallbackNavIcon
} from "@/components/layout/sidebar-menu";
import { useMemo, useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

function itemMatchesLocation(
  item: SidebarNavItem,
  pathname: string,
  searchParams: URLSearchParams
) {
  try {
    const target = new URL(item.href, "http://sml-mis.local");
    if (target.pathname !== pathname) return false;

    for (const [key, value] of target.searchParams.entries()) {
      if (searchParams.get(key) !== value) return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function TopNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const currentSearchParams = useMemo(
    () => new URLSearchParams(searchKey),
    [searchKey]
  );

  return (
    <nav className="z-[190] flex min-h-[44px] shrink-0 items-center gap-1 overflow-x-auto rounded-lg bg-surface px-2 shadow-micro md:px-4 premium-scrollbar">
      {sidebarNavGroups.map((group) => (
        <TopNavGroup
          key={group.id}
          group={group}
          pathname={pathname}
          searchParams={currentSearchParams}
        />
      ))}
    </nav>
  );
}

function TopNavGroup({
  group,
  pathname,
  searchParams,
}: {
  group: SidebarNavGroup;
  pathname: string;
  searchParams: URLSearchParams;
}) {
  const Icon = group.icon;
  const isActiveGroup = group.items.some((item) =>
    itemMatchesLocation(item, pathname, searchParams)
  );

  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setCanScrollUp(scrollTop > 0);
      setCanScrollDown(Math.ceil(scrollTop + clientHeight) < scrollHeight);
    }
  };

  useEffect(() => {
    if (open) {
      // Check immediately after render
      setTimeout(checkScroll, 10);
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        const dropdown = document.getElementById(`dropdown-${group.id}`);
        if (dropdown && dropdown.contains(event.target as Node)) {
          return;
        }
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      const updateRect = () => {
        if (buttonRef.current) setRect(buttonRef.current.getBoundingClientRect());
      };
      window.addEventListener("scroll", updateRect, true);
      window.addEventListener("resize", updateRect);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", updateRect, true);
        window.removeEventListener("resize", updateRect);
      };
    }
  }, [open, group.id]);

  function toggleOpen() {
    if (buttonRef.current) setRect(buttonRef.current.getBoundingClientRect());
    setOpen((v) => !v);
  }

  const dropdownContent = open && rect ? (
    <div
      id={`dropdown-${group.id}`}
      className="fixed z-[9999] flex min-w-[240px] flex-col rounded-lg border border-border bg-surface shadow-lift animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
      style={{
        top: rect.bottom + 4,
        left: Math.min(rect.left, typeof window !== "undefined" ? window.innerWidth - 260 : rect.left),
      }}
    >
      {canScrollUp && (
        <div className="flex h-6 shrink-0 items-center justify-center border-b border-border/40 bg-surface-muted/50 text-text-tertiary">
          <ChevronDown className="h-4 w-4 rotate-180" aria-hidden="true" />
        </div>
      )}

      <div 
        ref={scrollRef}
        onScroll={checkScroll}
        className="max-h-[60vh] overflow-y-auto p-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {group.items.length ? (
          group.items.map((item) => (
            <TopNavItem
              key={item.id}
              item={item}
              groupIcon={group.icon}
              active={itemMatchesLocation(item, pathname, searchParams)}
              onClick={() => setOpen(false)}
            />
          ))
        ) : (
          <div className="px-3 py-2 text-xs text-text-tertiary">
            ยังไม่มีรายการ
          </div>
        )}
      </div>

      {canScrollDown && (
        <div className="flex h-6 shrink-0 items-center justify-center border-t border-border/40 bg-surface-muted/50 text-text-tertiary">
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        </div>
      )}
    </div>
  ) : null;

  return (
    <div className="relative flex items-center shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className={cn(
          "flex h-9 items-center gap-2 rounded-md px-3 text-[13px] font-semibold transition-colors duration-200",
          isActiveGroup
            ? "bg-accent/10 text-accent"
            : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
          open && "bg-surface-muted text-text-primary"
        )}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        <span className="whitespace-nowrap">{group.label}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 opacity-50 transition-transform", open && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {typeof document !== "undefined" && createPortal(dropdownContent, document.body)}
    </div>
  );
}

function TopNavItem({
  item,
  groupIcon: Icon,
  active,
  onClick,
}: {
  item: SidebarNavItem;
  groupIcon: any;
  active: boolean;
  onClick?: () => void;
}) {
  const enabled = item.enabled === true;

  const content = (
    <>
      <Icon
        className={cn(
          "h-4 w-4 shrink-0",
          active ? "text-current" : "text-text-tertiary"
        )}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span
          className={cn(
            "shrink-0 rounded-pill px-1.5 py-0.5 text-[10px]",
            active
              ? "bg-surface text-accent"
              : "bg-surface-muted text-text-tertiary"
          )}
        >
          {item.badge}
        </span>
      ) : null}
    </>
  );

  const className = cn(
    "flex min-h-9 items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] transition-colors duration-200",
    active
      ? "bg-accent font-semibold text-text-on-accent"
      : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
    !enabled ? "opacity-65" : ""
  );

  if (enabled) {
    return (
      <Link href={item.href} className={className} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cn(className, "cursor-not-allowed")} onClick={onClick}>
      {content}
    </div>
  );
}
