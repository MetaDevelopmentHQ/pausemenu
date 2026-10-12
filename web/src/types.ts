export type CardId = "resume" | "map" | "settings" | "disconnect";

export interface CardConfig {
  id: CardId;
  title: string;
  subtitle: string;
  image?: string | null;
}

export type Tab = "main" | "map";
export type MapStyle = "dark" | "atlas" | "satellite";
export type UiScale = 90 | 100 | 110;

export interface Theme {
  accent: string;
  mapStyle: MapStyle;
  scanlines: boolean;
  motion: boolean;
  blur: boolean;
  scale: UiScale;
}

export interface MenuData {
  player: { name: string; id: number; job?: string | null };
  server: { name: string; tagline?: string | null };
  accent: string;
  cards: CardConfig[];
  theme?: Theme;
  /** Config.EnableMap: false = no MAP tab; the map card opens GTA's own map */
  mapEnabled?: boolean;
  initialTab?: Tab;
  /** UI dictionary from locales/<Config.Locale>.json */
  locale?: Record<string, string>;
}

/** A point on the map (in-game blip or config location) */
export interface MapLocation {
  x: number;
  y: number;
  label: string;
  category: string;
  icon: string;
  color: number;
}

export interface PlayerState {
  x: number;
  y: number;
  heading: number;
  zone: string;
  street: string;
}

export interface MapUpdate {
  player: PlayerState;
  waypoint: { x: number; y: number } | null;
  /** Only sent when the route was computed: [x, y] points */
  route?: [number, number][] | null;
}
