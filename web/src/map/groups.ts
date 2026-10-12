import { lang, t } from "../i18n";
import type { MapLocation } from "../types";

export interface LocGroup {
  key: string;
  label: string;
  icon: string;
  color: number;
  category: string;
  /** sorted by distance to the player */
  items: MapLocation[];
}

export interface CategoryBlock {
  name: string;
  groups: LocGroup[];
  count: number;
}

/** Category display order (locale keys; Lua sends translated names) */
const ORDER = ["cat.public", "cat.finance", "cat.shops", "cat.vehicle", "cat.jobs", "cat.fun", "cat.transport", "cat.property", "cat.crime", "cat.other"];

export function buildCategories(locations: MapLocation[], search: string, from?: { x: number; y: number } | null): CategoryBlock[] {
  const lc = lang();
  const lower = (s: string) => s.toLocaleLowerCase(lc);
  const order = ORDER.map((k) => t(k));
  const q = lower(search.trim());
  const byCat = new Map<string, Map<string, LocGroup>>();

  for (const loc of locations) {
    if (q && !lower(loc.label).includes(q) && !lower(loc.category).includes(q)) continue;
    let groups = byCat.get(loc.category);
    if (!groups) byCat.set(loc.category, (groups = new Map()));
    const key = `${loc.category}|${loc.label}`;
    let g = groups.get(key);
    if (!g) groups.set(key, (g = { key, label: loc.label, icon: loc.icon, color: loc.color, category: loc.category, items: [] }));
    g.items.push(loc);
  }

  const dist = (l: MapLocation) => (from ? (l.x - from.x) ** 2 + (l.y - from.y) ** 2 : 0);
  const rank = (c: string) => {
    const i = order.indexOf(c);
    return i === -1 ? order.length - 1 : i; // unknown categories go next to OTHER
  };

  return [...byCat.entries()]
    .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b, lc))
    .map(([name, groups]) => {
      const list = [...groups.values()].sort((a, b) => a.label.localeCompare(b.label, lc));
      for (const g of list) g.items.sort((a, b) => dist(a) - dist(b));
      return { name, groups: list, count: list.reduce((n, g) => n + g.items.length, 0) };
    });
}
