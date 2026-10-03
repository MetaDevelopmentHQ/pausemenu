// Shared state, NUI communication and small helpers.

export const state = {
  ready: false,
  open: false,
  screen: 'menu',       // 'menu' | 'settings'
  config: {
    serverName: 'MetaV Roleplay', shortName: 'MV', logo: null, accent: '#F5B544', corners: 'default', style: 'glass',
    menu: {}, keys: {}, discordInvite: '', rules: [], showCredit: true, jobsEnabled: true, transitionMs: 180,
  },
  data: null,           // menu data from the server
  clock: { gameHour: 0, gameMinute: 0, session: 0 },
  prefs: {},            // live (previewed) panel preferences
  savedPrefs: {},       // saved panel preferences
  locks: {},            // GTA settings locked by the server
  sel: 'home',          // selected pause menu entry
  toast: null,          // { text, kind }
};

/** Are we running inside FiveM or in a browser preview? */
export const inGame = typeof window.GetParentResourceName === 'function';
const RESOURCE = inGame ? window.GetParentResourceName() : 'metadev-pausemenu';

/** POSTs to a RegisterNUICallback on the Lua side. Returns null in the browser. */
export async function nui(name, data = {}) {
  if (!inGame) return typeof window.__previewNui === 'function' ? window.__previewNui(name, data) : null;
  try {
    const res = await fetch(`https://${RESOURCE}/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return null;
  }
}

// --- Render scheduling: several changes in one frame collapse into a single render ---
let renderer = null;
let frame = 0;

export function setRenderer(fn) {
  renderer = fn;
}

export function render() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    if (renderer) renderer();
  });
}

/** HTML escaping. Every string from the server, Discord or config goes through this. */
export function esc(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

let toastTimer = 0;

/** Shows a short toast. */
export function showToast(text, kind = 'info', ms = 2200) {
  state.toast = { text, kind };
  render();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    state.toast = null;
    render();
  }, ms);
}

export const pad2 = (n) => String(n).padStart(2, '0');

/** Line icon (the stroke icons from the design). */
export function icon(path, size = 24, stroke = 'currentColor', width = 2) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"></path></svg>`;
}

export const ICONS = {
  external: 'M14 3h7v7M21 3l-9 9M19 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5',
  chevronLeft: 'M15 18l-6-6 6-6',
  chevronRight: 'M9 18l6-6-6-6',
  map: 'M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
  lock: 'M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4',
};
