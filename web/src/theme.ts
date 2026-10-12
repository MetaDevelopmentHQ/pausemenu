import type { MapStyle, Theme } from "./types";
import { hexToRgb } from "./utils/nui";

export const DEFAULT_THEME: Theme = {
  accent: "#FFB020",
  mapStyle: "dark",
  scanlines: true,
  motion: true,
  blur: true,
  scale: 100,
};

/** label: locale key */
export const MAP_STYLES: { id: MapStyle; label: string }[] = [
  { id: "dark", label: "mapstyle.dark" },
  { id: "atlas", label: "mapstyle.atlas" },
  { id: "satellite", label: "mapstyle.satellite" },
];

/** Readable dark/light text color on top of the accent color */
function inkFor(hex: string): string {
  const [r, g, b] = hexToRgb(hex).split(",").map(Number);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#141008" : "#ffffff";
}

/** Applies the theme to the document root (CSS variables + classes). */
export function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.style.setProperty("--accent", t.accent);
  root.style.setProperty("--accent-rgb", hexToRgb(t.accent));
  root.style.setProperty("--accent-ink", inkFor(t.accent));
  root.style.setProperty("--ui-scale", String(t.scale / 100));
  root.classList.toggle("no-scanlines", !t.scanlines);
  root.classList.toggle("reduce-motion", !t.motion);
}
