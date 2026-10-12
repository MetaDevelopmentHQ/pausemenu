import { create } from "zustand";
import { DEFAULT_THEME } from "./theme";
import type { MapLocation, MapUpdate, MenuData, PlayerState, Tab, Theme } from "./types";

interface MenuState {
  visible: boolean;
  closing: boolean;
  data: MenuData | null;
  tab: Tab;
  cardIndex: number;
  confirmDisconnect: boolean;

  theme: Theme;

  // Map
  locations: MapLocation[];
  player: PlayerState | null;
  waypoint: { x: number; y: number } | null;
  route: [number, number][] | null;

  open: (data: MenuData) => void;
  startClose: () => void;
  finishClose: () => void;
  setTab: (tab: Tab) => void;
  setCardIndex: (i: number) => void;
  setConfirmDisconnect: (v: boolean) => void;
  setTheme: (t: Theme) => void;
  setLocations: (l: MapLocation[]) => void;
  applyMapUpdate: (u: MapUpdate) => void;
}

export const useMenu = create<MenuState>((set) => ({
  visible: false,
  closing: false,
  data: null,
  tab: "main",
  cardIndex: 0,
  confirmDisconnect: false,
  theme: DEFAULT_THEME,
  locations: [],
  player: null,
  waypoint: null,
  route: null,

  open: (data) =>
    set((s) => ({
      visible: true,
      closing: false,
      data,
      tab: data.initialTab ?? "main",
      theme: data.theme ?? s.theme,
      cardIndex: 0,
      confirmDisconnect: false,
    })),
  startClose: () => set({ closing: true, confirmDisconnect: false }),
  finishClose: () => set({ visible: false, closing: false }),
  setTab: (tab) => set({ tab, confirmDisconnect: false }),
  setCardIndex: (cardIndex) => set({ cardIndex, confirmDisconnect: false }),
  setConfirmDisconnect: (confirmDisconnect) => set({ confirmDisconnect }),
  setTheme: (theme) => set({ theme }),
  setLocations: (locations) => set({ locations }),
  applyMapUpdate: (u) =>
    set((s) => {
      // Keep the old object for the same waypoint -> marker/route aren't redrawn on every update
      const wp = u.waypoint ?? null;
      const sameWp = !!wp && !!s.waypoint && wp.x === s.waypoint.x && wp.y === s.waypoint.y;
      const waypoint = sameWp ? s.waypoint : wp;
      // The route only arrives on the update it was computed in; cleared when there's no waypoint
      let route = s.route;
      if (!waypoint || !sameWp) route = null; // waypoint changed: hide the old route until the new one arrives
      if (waypoint && u.route && JSON.stringify(u.route) !== JSON.stringify(route)) route = u.route;
      return { player: u.player ?? s.player, waypoint, route };
    }),
}));
