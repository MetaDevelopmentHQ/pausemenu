import { useMenu } from "./store";
import { applyTheme, DEFAULT_THEME } from "./theme";
import type { Theme } from "./types";
import { fetchNui, isEnvBrowser } from "./utils/nui";

const LS_KEY = "pausemenu:theme";
let saveTimer: number | undefined;

/** Applies the theme instantly and saves it after a short debounce (KVP in game, localStorage in the browser).
 *  In game only the map style is stored; the rest comes from Config.DefaultTheme. */
export function updateTheme(patch: Partial<Theme>) {
  const next = { ...useMenu.getState().theme, ...patch };
  useMenu.getState().setTheme(next);
  applyTheme(next);
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    if (isEnvBrowser()) {
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch { /* ignore */ }
    } else {
      void fetchNui("saveTheme", next);
    }
  }, 300);
}

/** Reads the saved theme for the browser preview. */
export function loadBrowserTheme(): Theme | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? { ...DEFAULT_THEME, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}
