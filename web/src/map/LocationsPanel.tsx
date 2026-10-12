import clsx from "clsx";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Navigation2, Search } from "lucide-react";
import { forwardRef } from "react";
import { t } from "../i18n";
import { blipColor } from "./blipColors";
import type { CategoryBlock } from "./groups";
import { iconFor } from "./icons";

interface Props {
  categories: CategoryBlock[];
  search: string;
  onSearch: (s: string) => void;
  /** hidden category names and group keys ("category|label") */
  hidden: Set<string>;
  collapsed: Set<string>;
  onToggleHidden: (cat: string) => void;
  onToggleCollapsed: (cat: string) => void;
  selectedKey: string | null;
  instance: number;
  onSelect: (key: string) => void;
  onCycle: (key: string, dir: 1 | -1) => void;
  onFocusPlayer: () => void;
  onWaypoint: (key: string) => void;
}

const LocationsPanel = forwardRef<HTMLInputElement, Props>(function LocationsPanel(p, searchRef) {
  return (
    <aside className="panel anim-up absolute bottom-[1rem] right-[1rem] top-[1rem] z-[500] flex w-[24rem] flex-col" style={{ animationDelay: "80ms" }}>
      {/* Title + search */}
      <div className="flex items-center gap-[0.75rem] px-[1.1rem] pb-[0.8rem] pt-[1rem]">
        <span className="font-display text-[1.25rem] font-bold tracking-[0.08em] text-ink">{t("map.locations")}</span>
        <label className="relative ml-auto block flex-1">
          <Search className="pointer-events-none absolute left-[0.7rem] top-1/2 h-[0.95rem] w-[0.95rem] -translate-y-1/2 text-muted" />
          <input
            ref={searchRef}
            value={p.search}
            onChange={(e) => p.onSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.stopPropagation();
                if (p.search) p.onSearch("");
                (e.target as HTMLInputElement).blur();
              }
            }}
            spellCheck={false}
            placeholder={t("map.search")}
            className="search-input w-full py-[0.55rem] pl-[2.1rem] pr-[0.6rem] text-[0.95rem]"
          />
        </label>
      </div>

      {/* You */}
      <button
        type="button"
        onClick={p.onFocusPlayer}
        className="loc-row mx-[0.6rem] mb-[0.6rem] flex items-center gap-[0.8rem] px-[0.8rem] py-[0.65rem] text-left"
      >
        <Navigation2 className="h-[1.1rem] w-[1.1rem] text-accent" fill="currentColor" />
        <span className="font-display text-[1.15rem] font-bold tracking-[0.04em] text-ink">{t("map.you")}</span>
        <span className="keycap keycap--ghost ml-auto">SPACE</span>
      </button>

      {/* Categories */}
      <div className="scroll-y flex-1 px-[0.6rem] pb-[0.8rem]">
        {p.categories.length === 0 ? (
          <div className="font-display px-[0.5rem] py-[1.5rem] text-[1.05rem] font-bold tracking-[0.08em] text-muted">{t("map.empty")}</div>
        ) : null}

        {p.categories.map((cat) => {
          const isHidden = p.hidden.has(cat.name);
          const isCollapsed = p.collapsed.has(cat.name) && !p.search;
          return (
            <div key={cat.name} className="mb-[0.5rem]">
              <div className="flex items-center gap-[0.5rem] px-[0.4rem] py-[0.45rem]">
                <button type="button" onClick={() => p.onToggleCollapsed(cat.name)} className="flex flex-1 items-center gap-[0.45rem] text-left">
                  <ChevronDown className={clsx("h-[0.95rem] w-[0.95rem] text-muted transition-transform", isCollapsed && "-rotate-90")} />
                  <span className={clsx("font-display text-[0.9rem] font-bold tracking-[0.25em]", isHidden ? "text-muted" : "text-accent")}>{cat.name}</span>
                  <span className="text-[0.8rem] text-muted">{cat.count}</span>
                </button>
                <button
                  type="button"
                  title={t(isHidden ? "map.show" : "map.hide")}
                  onClick={() => p.onToggleHidden(cat.name)}
                  className={clsx("loc-check", !isHidden && "is-on")}
                >
                  {!isHidden ? <Check className="h-[0.8rem] w-[0.8rem]" strokeWidth={3} /> : null}
                </button>
              </div>

              {!isCollapsed &&
                cat.groups.map((g) => {
                  const Icon = iconFor(g.icon);
                  const active = g.key === p.selectedKey;
                  const n = g.items.length;
                  const rowHidden = p.hidden.has(g.key);
                  return (
                    <div
                      key={g.key}
                      onClick={() => p.onSelect(g.key)}
                      onDoubleClick={() => p.onWaypoint(g.key)}
                      className={clsx("loc-row flex items-center gap-[0.75rem] px-[0.8rem] py-[0.55rem]", active && "is-active", (isHidden || rowHidden) && "opacity-40")}
                    >
                      <span className="pm-blip-badge shrink-0" style={{ ["--c" as string]: blipColor(g.color) }}>
                        <Icon strokeWidth={2.4} />
                      </span>
                      <span className="font-display min-w-0 flex-1 truncate text-[1.08rem] font-bold tracking-[0.03em] text-ink">{g.label}</span>
                      {n > 1 ? (
                        <span className="flex items-center gap-[0.15rem] text-[0.85rem] text-white/70" onClick={(e) => e.stopPropagation()}>
                          <ChevronLeft className="set-arrow h-[1rem] w-[1rem]" onClick={() => p.onCycle(g.key, -1)} />
                          <span className="font-display min-w-[2.6rem] text-center font-bold tabular-nums">
                            {active ? p.instance + 1 : 1}/{n}
                          </span>
                          <ChevronRight className="set-arrow h-[1rem] w-[1rem]" onClick={() => p.onCycle(g.key, 1)} />
                        </span>
                      ) : null}
                      <button
                        type="button"
                        title={t(rowHidden ? "map.show" : "map.hide")}
                        onClick={(e) => {
                          e.stopPropagation();
                          p.onToggleHidden(g.key);
                        }}
                        onDoubleClick={(e) => e.stopPropagation()}
                        className={clsx("loc-check shrink-0", !rowHidden && "is-on")}
                      >
                        {!rowHidden ? <Check className="h-[0.8rem] w-[0.8rem]" strokeWidth={3} /> : null}
                      </button>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </aside>
  );
});

export default LocationsPanel;
