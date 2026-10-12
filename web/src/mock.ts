import { DEFAULT_THEME } from "./theme";
import en from "../../locales/en.json";
import tr from "../../locales/tr.json";
import type { MapLocation, MapUpdate, MenuData } from "./types";

// Browser preview language: ?lang=tr in the URL, English otherwise
const locale: Record<string, string> = new URLSearchParams(window.location.search).get("lang") === "tr" ? tr : en;
const tl = (key: string) => locale[key] ?? key;

/** Sample data used only in the browser (vite dev). */
export const mockData: MenuData = {
  theme: DEFAULT_THEME,
  locale,
  player: { name: "John Carter", id: 12, job: "LSPD · Officer" },
  server: { name: "LOS SANTOS RP", tagline: "ROLEPLAY" },
  accent: "#FFB020",
  cards: [
    { id: "resume", title: tl("card.resume"), subtitle: tl("card.resume.sub") },
    { id: "map", title: tl("card.map"), subtitle: tl("card.map.sub") },
    { id: "settings", title: tl("card.settings"), subtitle: tl("card.settings.sub") },
    { id: "disconnect", title: tl("card.disconnect"), subtitle: tl("card.disconnect.sub") },
  ],
};

/** Browser preview: map locations like Config.MapBlips (approximate coordinates, visual testing only) */
const L = (label: string, category: string, icon: string, color: number, x: number, y: number): MapLocation => ({ label, category: tl(`cat.${category}`), icon, color, x, y });
export const mockLocations: MapLocation[] = [
  L("Mission Row PD", "public", "shield", 29, 425.1, -979.5),
  L("Pillbox Hospital", "public", "hospital", 2, 298.6, -584.4),
  L("City Hall", "public", "landmark", 0, -544.9, -204.4),
  L("DMV", "public", "building", 3, 240.0, -1380.0),
  L("Fleeca Bank", "finance", "banknote", 2, 149.9, -1040.5),
  L("Fleeca Bank", "finance", "banknote", 2, -1212.9, -330.8),
  L("Fleeca Bank", "finance", "banknote", 2, 314.2, -278.6),
  L("24/7 Supermarket", "shops", "store", 2, 25.7, -1347.3),
  L("24/7 Supermarket", "shops", "store", 2, -48.5, -1757.5),
  L("24/7 Supermarket", "shops", "store", 2, 1135.8, -982.3),
  L("24/7 Supermarket", "shops", "store", 2, 1960.1, 3740.0),
  L("Suburban", "shops", "shirt", 0, 72.3, -1399.1),
  L("Suburban", "shops", "shirt", 0, -703.8, -152.3),
  L("Barber Shop", "shops", "scissors", 0, -814.3, -183.8),
  L("Ammu-Nation", "shops", "crosshair", 1, 22.0, -1107.2),
  L("Gas Station", "vehicle", "fuel", 1, 265.6, -1261.3),
  L("Gas Station", "vehicle", "fuel", 1, -724.6, -935.2),
  L("Gas Station", "vehicle", "fuel", 1, 1208.9, -1402.5),
  L("Gas Station", "vehicle", "fuel", 1, 49.4, 2778.8),
  L("Public Garage", "vehicle", "warehouse", 3, 215.8, -810.0),
  L("Los Santos Customs", "vehicle", "wrench", 0, -337.4, -136.9),
  L("Premium Deluxe Motorsport", "vehicle", "car", 2, -56.7, -1096.6),
  L("Trucking Job", "jobs", "truck", 5, 153.5, -3211.6),
  L("LS International Airport", "transport", "plane", 0, -1037.0, -2737.0),
];

export const mockMapUpdate = (): MapUpdate => ({
  player: { x: 195.0, y: -934.0, heading: 30, zone: "Pillbox Hill", street: "Vespucci Blvd" },
  waypoint: null,
});
