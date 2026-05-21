"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fallbackNavIcon,
  type SidebarNavGroup,
  type SidebarNavItem,
  sidebarNavGroups
} from "@/components/layout/sidebar-menu";

const SCROLLBAR_VISIBLE_MS = 900;
const LONG_PRESS_FAVORITE_MS = 650;
const FAVORITES_GROUP_ID = "favorites";
const FAVORITES_STORAGE_KEY = "sml-mis-ai.sidebar.favorites";
const OPEN_GROUPS_STORAGE_KEY = "sml-mis-ai.sidebar.open-groups";

type DecoratedNavItem = SidebarNavItem & {
  groupId: string;
  groupLabel: string;
  groupIcon: SidebarNavGroup["icon"];
};

type RenderNavGroup = {
  id: string;
  label: string;
  icon: SidebarNavGroup["icon"];
  items: DecoratedNavItem[];
};

type CollapsedTooltip = {
  label: string;
  badge?: string;
  top: number;
  left: number;
};

const defaultOpenGroupIds = sidebarNavGroups
  .filter((group) => group.defaultOpen)
  .map((group) => group.id);

function safeParseStringArray(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function uniqueIds(ids: string[]) {
  return Array.from(new Set(ids));
}

function itemMatchesLocation(
  item: SidebarNavItem,
  pathname: string,
  searchParams: URLSearchParams
) {
  const target = new URL(item.href, "http://sml-mis.local");
  if (target.pathname !== pathname) return false;

  for (const [key, value] of target.searchParams.entries()) {
    if (searchParams.get(key) !== value) return false;
  }

  return true;
}

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const currentSearchParams = useMemo(
    () => new URLSearchParams(searchKey),
    [searchKey]
  );

  const [collapsed, setCollapsed] = useState(false);
  const [navScrolling, setNavScrolling] = useState(false);
  const [collapsedTooltip, setCollapsedTooltip] =
    useState<CollapsedTooltip | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [openGroupIds, setOpenGroupIds] = useState<string[]>([
    FAVORITES_GROUP_ID,
    ...defaultOpenGroupIds
  ]);
  const [openGroupsReady, setOpenGroupsReady] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const navTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allItems = useMemo(
    () =>
      sidebarNavGroups.flatMap((group) =>
        group.items.map(
          (item): DecoratedNavItem => ({
            ...item,
            groupId: group.id,
            groupLabel: group.label,
            groupIcon: group.icon
          })
        )
      ),
    []
  );

  const itemById = useMemo(
    () => new Map(allItems.map((item) => [item.id, item])),
    [allItems]
  );

  const favoriteItems = useMemo(
    () =>
      favoriteIds
        .map((id) => itemById.get(id))
        .filter((item): item is DecoratedNavItem => Boolean(item)),
    [favoriteIds, itemById]
  );

  const renderGroups = useMemo<RenderNavGroup[]>(
    () => [
      {
        id: FAVORITES_GROUP_ID,
        label: "Favorites",
        icon: Star,
        items: favoriteItems
      },
      ...sidebarNavGroups.map((group) => ({
        id: group.id,
        label: group.label,
        icon: group.icon,
        items: group.items.map(
          (item): DecoratedNavItem => ({
            ...item,
            groupId: group.id,
            groupLabel: group.label,
            groupIcon: group.icon
          })
        )
      }))
    ],
    [favoriteItems]
  );

  const activeGroupId = useMemo(() => {
    const activeGroup = sidebarNavGroups.find((group) =>
      group.items.some((item) =>
        itemMatchesLocation(item, pathname, currentSearchParams)
      )
    );
    return activeGroup?.id ?? null;
  }, [currentSearchParams, pathname]);

  useEffect(() => {
    const validIds = new Set(allItems.map((item) => item.id));
    const storedIds = safeParseStringArray(
      window.localStorage.getItem(FAVORITES_STORAGE_KEY)
    ).filter((id) => validIds.has(id));

    setFavoriteIds(uniqueIds(storedIds));
    setFavoritesReady(true);
  }, [allItems]);

  useEffect(() => {
    if (!favoritesReady) return;
    window.localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(favoriteIds)
    );
  }, [favoriteIds, favoritesReady]);

  useEffect(() => {
    const validGroupIds = new Set([
      FAVORITES_GROUP_ID,
      ...sidebarNavGroups.map((group) => group.id)
    ]);
    const storedIds = safeParseStringArray(
      window.localStorage.getItem(OPEN_GROUPS_STORAGE_KEY)
    ).filter((id) => validGroupIds.has(id));

    setOpenGroupIds(
      storedIds.length
        ? uniqueIds([FAVORITES_GROUP_ID, ...storedIds])
        : uniqueIds([FAVORITES_GROUP_ID, ...defaultOpenGroupIds])
    );
    setOpenGroupsReady(true);
  }, []);

  useEffect(() => {
    if (!openGroupsReady) return;
    window.localStorage.setItem(
      OPEN_GROUPS_STORAGE_KEY,
      JSON.stringify(openGroupIds)
    );
  }, [openGroupIds, openGroupsReady]);

  useEffect(() => {
    if (!activeGroupId) return;
    setOpenGroupIds((ids) =>
      ids.includes(activeGroupId) ? ids : [...ids, activeGroupId]
    );
  }, [activeGroupId]);

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

  function showCollapsedTooltip(
    data: { label: string; badge?: string },
    target: HTMLElement
  ) {
    if (!collapsed) return;

    const rect = target.getBoundingClientRect();
    setCollapsedTooltip({
      label: data.label,
      badge: data.badge,
      top: Math.min(
        Math.max(rect.top + rect.height / 2, 24),
        window.innerHeight - 24
      ),
      left: rect.right + 10
    });
  }

  function toggleGroup(groupId: string) {
    setOpenGroupIds((ids) =>
      ids.includes(groupId)
        ? ids.filter((id) => id !== groupId)
        : [...ids, groupId]
    );
  }

  function openGroupFromCollapsed(groupId: string) {
    setCollapsed(false);
    setOpenGroupIds((ids) =>
      ids.includes(groupId) ? ids : [...ids, groupId]
    );
  }

  function toggleFavorite(itemId: string) {
    setFavoriteIds((ids) =>
      ids.includes(itemId)
        ? ids.filter((id) => id !== itemId)
        : [...ids, itemId]
    );
    setOpenGroupIds((ids) =>
      ids.includes(FAVORITES_GROUP_ID) ? ids : [FAVORITES_GROUP_ID, ...ids]
    );
  }

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const openGroupSet = useMemo(() => new Set(openGroupIds), [openGroupIds]);

  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 overflow-hidden rounded-lg bg-surface shadow-micro transition-[height,width,padding] duration-200 lg:flex lg:flex-col",
          collapsed
            ? "h-[80%] max-h-[80vh] w-16 self-center px-2 py-3"
            : "h-full w-[264px] px-2.5 py-4"
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
            collapsed ? "scrollbar-none px-0" : "premium-scrollbar pr-1",
            navScrolling ? "is-scrolling" : ""
          )}
          aria-label="เมนูหลัก"
        >
          {collapsed ? (
            <div className="flex flex-col items-center gap-1">
              {renderGroups.map((group) => (
                <CollapsedGroupButton
                  key={group.id}
                  group={group}
                  active={activeGroupId === group.id}
                  onClick={() => openGroupFromCollapsed(group.id)}
                  onTooltipHide={() => setCollapsedTooltip(null)}
                  onTooltipShow={showCollapsedTooltip}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {renderGroups.map((group) => {
                const groupOpen = openGroupSet.has(group.id);
                return (
                  <SidebarGroup
                    key={group.id}
                    group={group}
                    favoriteIdSet={favoriteIdSet}
                    groupOpen={groupOpen}
                    isFavoritesGroup={group.id === FAVORITES_GROUP_ID}
                    pathname={pathname}
                    searchParams={currentSearchParams}
                    onFavoriteToggle={toggleFavorite}
                    onGroupToggle={() => toggleGroup(group.id)}
                    onTooltipHide={() => setCollapsedTooltip(null)}
                    onTooltipShow={showCollapsedTooltip}
                  />
                );
              })}
            </div>
          )}
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
          className="pointer-events-none fixed z-[250] flex max-w-[240px] -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-md border border-border bg-surface-elevated px-3 py-2 text-xs font-medium text-text-primary shadow-lift"
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

function CollapsedGroupButton({
  group,
  active,
  onClick,
  onTooltipHide,
  onTooltipShow
}: {
  group: RenderNavGroup;
  active: boolean;
  onClick: () => void;
  onTooltipHide: () => void;
  onTooltipShow: (
    data: { label: string; badge?: string },
    target: HTMLElement
  ) => void;
}) {
  const Icon = group.icon;
  const count = group.items.length ? String(group.items.length) : undefined;

  const handleTooltipShow = (
    event:
      | FocusEvent<HTMLElement>
      | MouseEvent<HTMLElement>
      | PointerEvent<HTMLElement>
  ) => {
    onTooltipShow({ label: group.label, badge: count }, event.currentTarget);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onBlur={onTooltipHide}
      onFocus={handleTooltipShow}
      onMouseEnter={handleTooltipShow}
      onMouseMove={handleTooltipShow}
      onMouseLeave={onTooltipHide}
      onPointerEnter={handleTooltipShow}
      onPointerLeave={onTooltipHide}
      onPointerMove={handleTooltipShow}
      className={cn(
        "relative grid h-10 w-10 place-items-center rounded-md transition-colors duration-200",
        active
          ? "bg-accent text-text-on-accent"
          : "text-text-tertiary hover:bg-surface-muted hover:text-text-primary"
      )}
      aria-label={group.label}
      title={group.label}
    >
      <Icon className="h-[17px] w-[17px]" aria-hidden="true" />
      {count ? (
        <span
          className={cn(
            "absolute right-0.5 top-0.5 h-3 min-w-3 rounded-pill px-0.5 text-[8px] leading-3",
            active
              ? "bg-text-on-accent text-accent"
              : "bg-surface-muted text-text-tertiary"
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

function SidebarGroup({
  group,
  favoriteIdSet,
  groupOpen,
  isFavoritesGroup,
  pathname,
  searchParams,
  onFavoriteToggle,
  onGroupToggle,
  onTooltipHide,
  onTooltipShow
}: {
  group: RenderNavGroup;
  favoriteIdSet: Set<string>;
  groupOpen: boolean;
  isFavoritesGroup: boolean;
  pathname: string;
  searchParams: URLSearchParams;
  onFavoriteToggle: (itemId: string) => void;
  onGroupToggle: () => void;
  onTooltipHide: () => void;
  onTooltipShow: (
    data: { label: string; badge?: string },
    target: HTMLElement
  ) => void;
}) {
  const Icon = group.icon;

  return (
    <section className="border-b border-border pb-1 last:border-b-0">
      <button
        type="button"
        onClick={onGroupToggle}
        className="flex h-9 w-full items-center gap-2 rounded-md px-2.5 text-left text-[13px] font-semibold text-text-secondary transition-colors duration-200 hover:bg-surface-muted hover:text-text-primary"
        aria-expanded={groupOpen}
      >
        <Icon
          className="h-[15px] w-[15px] shrink-0 text-text-tertiary"
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1 truncate">{group.label}</span>
        <span className="label-caps shrink-0 text-text-tertiary">
          {group.items.length}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-text-tertiary transition-transform",
            groupOpen ? "rotate-180" : ""
          )}
          aria-hidden="true"
        />
      </button>

      {groupOpen ? (
        <div className="space-y-1 pb-1 pt-1">
          {group.items.length ? (
            group.items.map((item) => (
              <SidebarItem
                key={`${group.id}-${item.id}`}
                item={item}
                icon={item.groupIcon ?? fallbackNavIcon}
                active={itemMatchesLocation(item, pathname, searchParams)}
                favorited={favoriteIdSet.has(item.id)}
                favoritesView={isFavoritesGroup}
                onFavoriteToggle={onFavoriteToggle}
                onTooltipHide={onTooltipHide}
                onTooltipShow={onTooltipShow}
              />
            ))
          ) : (
            <div className="mx-2.5 rounded-md bg-surface-muted px-3 py-2 text-[12px] text-text-tertiary">
              ยังไม่มีรายการ
            </div>
          )}
        </div>
      ) : null}
    </section>
  );
}

function SidebarItem({
  item,
  icon: Icon,
  active,
  favorited,
  favoritesView,
  onFavoriteToggle,
  onTooltipHide,
  onTooltipShow
}: {
  item: DecoratedNavItem;
  icon: SidebarNavGroup["icon"];
  active: boolean;
  favorited: boolean;
  favoritesView: boolean;
  onFavoriteToggle: (itemId: string) => void;
  onTooltipHide: () => void;
  onTooltipShow: (
    data: { label: string; badge?: string },
    target: HTMLElement
  ) => void;
}) {
  const enabled = item.enabled === true;
  const favoriteable = item.favoriteable !== false;
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

  function stopLongPress() {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }

  function startLongPress(event: PointerEvent<HTMLElement>) {
    if (!favoriteable || (event.pointerType === "mouse" && event.button !== 0)) {
      return;
    }

    stopLongPress();
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      onFavoriteToggle(item.id);
      if ("vibrate" in navigator) {
        navigator.vibrate(8);
      }
    }, LONG_PRESS_FAVORITE_MS);
  }

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (longPressTriggeredRef.current) {
      event.preventDefault();
      event.stopPropagation();
      longPressTriggeredRef.current = false;
      return;
    }
    onTooltipHide();
  }

  const handleTooltipShow = (
    event:
      | FocusEvent<HTMLElement>
      | MouseEvent<HTMLElement>
      | PointerEvent<HTMLElement>
  ) => {
    onTooltipShow(
      {
        label: item.label,
        badge: enabled ? item.badge : item.badge ?? "รอ"
      },
      event.currentTarget
    );
  };

  const rowClass = cn(
    "group/item flex min-h-9 items-center gap-1 rounded-md pl-2.5 pr-1 text-[13px] transition-colors duration-200",
    active
      ? "bg-accent font-semibold text-text-on-accent"
      : "text-text-secondary hover:bg-surface-muted hover:text-text-primary",
    !enabled ? "opacity-65" : ""
  );

  const labelContent = (
    <>
      <Icon
        className={cn(
          "h-[15px] w-[15px] shrink-0",
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

  return (
    <div
      className={rowClass}
      onPointerDown={startLongPress}
      onPointerCancel={stopLongPress}
      onPointerLeave={stopLongPress}
      onPointerUp={stopLongPress}
      title={item.label}
    >
      {enabled ? (
        <Link
          href={item.href}
          className="flex min-w-0 flex-1 items-center gap-2.5 self-stretch py-2"
          aria-label={item.label}
          onBlur={onTooltipHide}
          onClick={handleClick}
          onFocus={handleTooltipShow}
          onMouseEnter={handleTooltipShow}
          onMouseMove={handleTooltipShow}
          onMouseLeave={onTooltipHide}
          onPointerEnter={handleTooltipShow}
          onPointerLeave={onTooltipHide}
          onPointerMove={handleTooltipShow}
        >
          {labelContent}
        </Link>
      ) : (
        <div
          className="flex min-w-0 flex-1 cursor-not-allowed items-center gap-2.5 self-stretch py-2"
          aria-label={item.label}
          onBlur={onTooltipHide}
          onFocus={handleTooltipShow}
          onMouseEnter={handleTooltipShow}
          onMouseMove={handleTooltipShow}
          onMouseLeave={onTooltipHide}
          onPointerEnter={handleTooltipShow}
          onPointerLeave={onTooltipHide}
          onPointerMove={handleTooltipShow}
        >
          {labelContent}
        </div>
      )}

      {favoriteable ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onFavoriteToggle(item.id);
          }}
          onPointerDown={(event) => event.stopPropagation()}
          className={cn(
            "grid h-7 w-7 shrink-0 place-items-center rounded-md transition-colors",
            favorited
              ? active
                ? "text-current"
                : "text-warning"
              : "text-text-tertiary opacity-0 hover:text-warning group-hover/item:opacity-100 focus-visible:opacity-100",
            favoritesView ? "opacity-100" : ""
          )}
          aria-label={favorited ? "เอาออกจาก Favorites" : "เพิ่มใน Favorites"}
          aria-pressed={favorited}
          title={favorited ? "เอาออกจาก Favorites" : "เพิ่มใน Favorites"}
        >
          <Star
            className={cn("h-3.5 w-3.5", favorited ? "fill-current" : "")}
            aria-hidden="true"
          />
        </button>
      ) : null}
    </div>
  );
}
