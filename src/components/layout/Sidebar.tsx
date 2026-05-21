"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useRef,
  useState
} from "react";
import {
  Banknote,
  Bot,
  BookOpenCheck,
  BrainCircuit,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Cloud,
  DatabaseZap,
  FileSearch,
  Gauge,
  GitFork,
  HandCoins,
  Inbox,
  Landmark,
  Library,
  LineChart,
  MessageCircle,
  Package,
  Sparkles,
  ShoppingCart,
  ReceiptText,
  UserRoundCog
} from "lucide-react";
import { cn } from "@/lib/utils";

const SCROLLBAR_VISIBLE_MS = 900;

type NavItem = {
  label: string;
  href: string;
  icon: typeof Gauge;
  enabled?: boolean;
  badge?: string;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

type CollapsedTooltip = {
  label: string;
  badge?: string;
  top: number;
  left: number;
};

const navGroups: NavGroup[] = [
  {
    label: "ระบบหลัก",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: Gauge, enabled: true },
      { label: "ระบบสินค้า", href: "/inventory", icon: Package, enabled: true },
      { label: "ระบบซื้อ", href: "/purchase", icon: ShoppingCart },
      { label: "ระบบขาย", href: "/sales", icon: ReceiptText },
      { label: "ระบบเจ้าหนี้", href: "/ap", icon: HandCoins },
      { label: "ระบบลูกหนี้", href: "/ar", icon: Landmark },
      { label: "ระบบเงินสด/ธนาคาร", href: "/cash-bank", icon: Banknote },
      { label: "ระบบบัญชี", href: "/accounting", icon: BookOpenCheck }
    ]
  },
  {
    label: "รอลูกค้าจ้างทำ",
    items: [
      { label: "สถานะทางการเงิน", href: "/finance", icon: Landmark, badge: "รอ" },
      { label: "ออเดอร์จาก LINE", href: "/line-orders", icon: Inbox, badge: "รอ" },
      { label: "คุยกับลูกค้า", href: "/customer-chat", icon: MessageCircle, badge: "รอ" },
      { label: "แนวโน้มรายงาน", href: "/reports", icon: LineChart, badge: "รอ" }
    ]
  },
  {
    label: "AI ในอนาคต",
    items: [
      { label: "Alert สมอง", href: "/brain-alerts", icon: BrainCircuit, badge: "AI" },
      { label: "แนะนำระบบ", href: "/recommendations", icon: Sparkles, badge: "AI" },
      { label: "ค้นหาข้อมูล", href: "/search", icon: FileSearch, badge: "AI" },
      { label: "ผู้ช่วย AI", href: "/assistant", icon: Bot, badge: "AI" },
      { label: "เลขาส่วนตัว", href: "/secretary", icon: UserRoundCog, badge: "AI" },
      { label: "KMS", href: "/kms", icon: Library, badge: "AI" },
      { label: "MCP Endpoint", href: "/mcp-endpoint", icon: DatabaseZap, badge: "AI" },
      { label: "Graph สมอง", href: "/brain-graph", icon: GitFork, badge: "AI" },
      { label: "Object Storage", href: "/object-storage", icon: Cloud, badge: "AI" }
    ]
  }
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [navScrolling, setNavScrolling] = useState(false);
  const [collapsedTooltip, setCollapsedTooltip] =
    useState<CollapsedTooltip | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;
    let lastTop = nav.scrollTop;
    let lastLeft = nav.scrollLeft;
    let frame = 0;

    const watchScrollPosition = () => {
      if (nav.scrollTop !== lastTop || nav.scrollLeft !== lastLeft) {
        lastTop = nav.scrollTop;
        lastLeft = nav.scrollLeft;
        markNavScrolling();
      }
      frame = requestAnimationFrame(watchScrollPosition);
    };

    nav.addEventListener("scroll", markNavScrolling, { passive: true });
    nav.addEventListener("wheel", markNavScrolling, { passive: true });
    nav.addEventListener("touchmove", markNavScrolling, { passive: true });
    frame = requestAnimationFrame(watchScrollPosition);

    return () => {
      cancelAnimationFrame(frame);
      nav.removeEventListener("scroll", markNavScrolling);
      nav.removeEventListener("wheel", markNavScrolling);
      nav.removeEventListener("touchmove", markNavScrolling);
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!collapsed) {
      setCollapsedTooltip(null);
    }
  }, [collapsed]);

  function scrollRail(direction: "up" | "down") {
    setCollapsedTooltip(null);
    navRef.current?.scrollBy({
      top: direction === "up" ? -180 : 180,
      behavior: "smooth"
    });
  }

  function markNavScrolling() {
    setCollapsedTooltip(null);
    setNavScrolling(true);
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    navTimerRef.current = setTimeout(
      () => setNavScrolling(false),
      SCROLLBAR_VISIBLE_MS
    );
  }

  function showCollapsedTooltip(item: NavItem, target: HTMLElement) {
    if (!collapsed) return;

    const rect = target.getBoundingClientRect();
    setCollapsedTooltip({
      label: item.label,
      badge: item.enabled === true ? undefined : item.badge,
      top: Math.min(
        Math.max(rect.top + rect.height / 2, 24),
        window.innerHeight - 24
      ),
      left: rect.right + 10
    });
  }

  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 overflow-hidden rounded-lg bg-surface shadow-micro transition-[height,width,padding] duration-200 lg:flex lg:flex-col",
          collapsed
            ? "h-[80%] max-h-[80vh] w-16 self-center px-2 py-3"
            : "h-full w-[224px] px-2.5 py-4"
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center",
            collapsed ? "justify-center pb-2" : "justify-between px-2.5 pb-2"
          )}
        >
          {!collapsed ? (
            <p className="label-caps text-text-tertiary">เมนู</p>
          ) : null}
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="grid h-8 w-8 place-items-center rounded-md bg-surface-muted text-text-tertiary transition-colors hover:bg-surface-sunken hover:text-accent"
            aria-label={collapsed ? "ขยาย sidebar" : "ซ่อน sidebar"}
            title={collapsed ? "ขยาย sidebar" : "ซ่อน sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            ) : (
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>

        {collapsed ? (
          <button
            type="button"
            onClick={() => scrollRail("up")}
            className="mx-auto mb-1 grid h-7 w-8 shrink-0 place-items-center rounded-md text-text-tertiary transition-colors hover:bg-surface-muted hover:text-accent"
            aria-label="เลื่อนเมนูขึ้น"
            title="เลื่อนเมนูขึ้น"
          >
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}

        <nav
          ref={navRef}
          className={cn(
            "min-h-0 flex-1 overflow-y-auto",
            collapsed ? "scrollbar-none px-0" : "premium-scrollbar",
            navScrolling ? "is-scrolling" : ""
          )}
          aria-label="เมนูหลัก"
        >
          {navGroups.map((group, groupIndex) => (
            <div
              key={group.label}
              className={
                collapsed
                  ? groupIndex === 0
                    ? ""
                    : "mt-2 border-t border-border pt-2"
                  : groupIndex === 0
                    ? ""
                    : "mt-3 border-t border-border pt-3"
              }
            >
              {!collapsed ? (
                <p className="label-caps px-2.5 pb-2 pt-1 text-text-tertiary">
                  {group.label}
                </p>
              ) : null}
              <div className={cn("space-y-1", collapsed ? "flex flex-col items-center" : "")}>
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.href}
                    item={item}
                    active={pathname === item.href}
                    collapsed={collapsed}
                    onTooltipHide={() => setCollapsedTooltip(null)}
                    onTooltipShow={showCollapsedTooltip}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {collapsed ? (
          <button
            type="button"
            onClick={() => scrollRail("down")}
            className="mx-auto mt-1 grid h-7 w-8 shrink-0 place-items-center rounded-md text-text-tertiary transition-colors hover:bg-surface-muted hover:text-accent"
            aria-label="เลื่อนเมนูลง"
            title="เลื่อนเมนูลง"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </aside>

      {collapsedTooltip ? (
        <div
          role="tooltip"
          className="pointer-events-none fixed z-[250] flex max-w-[220px] -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-md border border-border bg-surface-elevated px-3 py-2 text-xs font-medium text-text-primary shadow-lift"
          style={{
            left: collapsedTooltip.left,
            top: collapsedTooltip.top
          }}
        >
          <span
            className="absolute left-[-4px] top-1/2 h-2 w-2 -translate-y-1/2 rotate-45 border-b border-l border-border bg-surface-elevated"
            aria-hidden="true"
          />
          <span className="truncate">{collapsedTooltip.label}</span>
          {collapsedTooltip.badge ? (
            <span className="shrink-0 rounded-pill bg-surface-muted px-1.5 py-0.5 font-mono text-[10px] text-text-tertiary">
              {collapsedTooltip.badge}
            </span>
          ) : null}
        </div>
      ) : null}
    </>
  );
}

function SidebarItem({
  item,
  active,
  collapsed,
  onTooltipHide,
  onTooltipShow
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onTooltipHide: () => void;
  onTooltipShow: (item: NavItem, target: HTMLElement) => void;
}) {
  const Icon = item.icon;
  const enabled = item.enabled === true;
  const itemClass = collapsed
    ? cn(
        "grid h-10 w-10 place-items-center rounded-md transition-colors duration-200",
        active
          ? "bg-accent text-text-on-accent"
          : "text-text-tertiary hover:bg-surface-muted hover:text-text-primary"
      )
    : cn(
        "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors duration-200",
        active
          ? "bg-accent font-semibold text-text-on-accent"
          : "text-text-secondary hover:bg-surface-muted hover:text-text-primary"
      );
  const content = (
    <>
      <Icon
        className={cn(
          "shrink-0",
          collapsed ? "h-[17px] w-[17px]" : "h-[15px] w-[15px]",
          active ? "text-current" : collapsed ? "text-current" : "text-text-tertiary"
        )}
        aria-hidden="true"
      />
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {!enabled && item.badge ? (
            <span className="ml-auto shrink-0 rounded-pill bg-surface-muted px-2 py-0.5 text-[10px] text-text-tertiary">
              {item.badge}
            </span>
          ) : null}
        </>
      ) : null}
    </>
  );
  const handleTooltipShow = (
    event:
      | FocusEvent<HTMLElement>
      | MouseEvent<HTMLElement>
      | PointerEvent<HTMLElement>
  ) => {
    onTooltipShow(item, event.currentTarget);
  };

  if (!enabled) {
    return (
      <div
        className={cn(itemClass, "cursor-not-allowed opacity-55")}
        aria-label={item.label}
        onBlur={onTooltipHide}
        onFocus={handleTooltipShow}
        onMouseEnter={handleTooltipShow}
        onMouseMove={handleTooltipShow}
        onMouseLeave={onTooltipHide}
        onPointerEnter={handleTooltipShow}
        onPointerLeave={onTooltipHide}
        onPointerMove={handleTooltipShow}
        title={item.label}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={itemClass}
      aria-label={item.label}
      onBlur={onTooltipHide}
      onClick={onTooltipHide}
      onFocus={handleTooltipShow}
      onMouseEnter={handleTooltipShow}
      onMouseMove={handleTooltipShow}
      onMouseLeave={onTooltipHide}
      onPointerEnter={handleTooltipShow}
      onPointerLeave={onTooltipHide}
      onPointerMove={handleTooltipShow}
      title={item.label}
    >
      {content}
    </Link>
  );
}
