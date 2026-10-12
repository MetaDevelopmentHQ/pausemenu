import L from "leaflet";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MapPin, Navigation2 } from "lucide-react";
import { blipColor } from "./blipColors";
import { iconFor } from "./icons";

const cache = new Map<string, L.DivIcon>();

/** Blip badge (colored ring + icon). One object is created per icon/color/selection. */
export function blipIcon(icon: string, color: number, selected: boolean): L.DivIcon {
  const key = `${icon}|${color}|${selected}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const svg = renderToStaticMarkup(createElement(iconFor(icon), { strokeWidth: 2.4 }));
  const div = L.divIcon({
    className: `pm-blip${selected ? " is-selected" : ""}`,
    html: `<div class="pm-blip-badge" style="--c:${blipColor(color)}">${svg}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
  cache.set(key, div);
  return div;
}

const arrowSvg = renderToStaticMarkup(createElement(Navigation2, { className: "pm-player-arrow", fill: "currentColor", strokeWidth: 1.5 }));
export const playerIcon = L.divIcon({
  className: "pm-player",
  html: `<div class="pm-player-dot">${arrowSvg}</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

const pinSvg = renderToStaticMarkup(createElement(MapPin, { className: "pm-waypoint-pin", fill: "currentColor", stroke: "#0b0b0d", strokeWidth: 1.5 }));
export const waypointIcon = L.divIcon({
  className: "pm-waypoint",
  html: pinSvg,
  iconSize: [36, 36],
  iconAnchor: [18, 34],
});
