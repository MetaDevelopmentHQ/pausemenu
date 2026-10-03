// Panel preferences: accent colour, corner style, scale, text size, style.
// Changes are previewed instantly through CSS variables; "Apply" stores them in Lua (KVP).

import { state, nui, render } from './core.js';

export const ACCENTS = {
  amber: '#F5B544',
  mint: '#7CE7C3',
  blue: '#8EA8FF',
  purple: '#A78BFA',
  coral: '#FF7A6B',
  white: '#F2F3F5',
};

// Corner factors relative to the design's 28px panel radius (sharp 6, soft 18, round 36)
const CORNERS = { default: 1, sharp: 6 / 28, soft: 18 / 28, round: 36 / 28 };

export const DEFAULT_PREFS = {
  layout: 'tabs', corners: 'default', accent: 'default', style: 'default', size: 4, fontSize: 7, blur: true,
};

export function accentHex(prefs = state.prefs) {
  if (prefs.accent && ACCENTS[prefs.accent]) return ACCENTS[prefs.accent];
  return /^#[0-9a-f]{6}$/i.test(state.config.accent) ? state.config.accent : ACCENTS.amber;
}

export function styleOf(prefs = state.prefs) {
  if (prefs.style === 'glass' || prefs.style === 'minimal') return prefs.style;
  return state.config.style === 'minimal' ? 'minimal' : 'glass';
}

/** Menu size 1-10 -> scale. 4 = 100%, 1 = 85%, 10 = 115%. */
export function sizeScale(level) {
  const lv = Math.min(10, Math.max(1, Number(level) || 4));
  return lv <= 4 ? 0.85 + (lv - 1) * 0.05 : 1 + (lv - 4) * 0.025;
}

/** Text size 1-10 -> scale. 7 = 100%. */
export function fontScale(level) {
  const lv = Math.min(10, Math.max(1, Number(level) || 7));
  return 1 + (lv - 7) * 0.04;
}

function hexToRgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Applies preferences to CSS variables (live preview). */
export function applyPrefs(prefs = state.prefs) {
  const root = document.documentElement.style;
  const accent = accentHex(prefs);
  const corner = prefs.corners && prefs.corners !== 'default' ? prefs.corners : (state.config.corners || 'default');

  root.setProperty('--accent', accent);
  root.setProperty('--accent-soft', hexToRgba(accent, 0.14));
  root.setProperty('--rk', String(CORNERS[corner] ?? 1));
  root.setProperty('--fs', String(fontScale(prefs.fontSize)));
  layoutStage();
}

/** Fits the stage to the screen: the design is 1920x1080 virtual px, multiplied by the menu size. */
export function layoutStage() {
  const stage = document.getElementById('stage');
  if (!stage) return;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const scale = Math.min(w / 1920, h / 1080) * sizeScale(state.prefs.size);
  stage.style.width = `${w / scale}px`;
  stage.style.height = `${h / scale}px`;
  stage.style.transform = `scale(${scale})`;
}

/** Changes a preference live (does not save). */
export function previewPref(key, value) {
  state.prefs = { ...state.prefs, [key]: value };
  applyPrefs();
  render();
}

/** Saves preferences. Lua returns the validated version. */
export async function savePrefs(prefs = state.prefs) {
  const saved = (await nui('savePrefs', prefs)) || prefs;
  state.savedPrefs = { ...DEFAULT_PREFS, ...saved };
  state.prefs = { ...state.savedPrefs };
  applyPrefs();
  render();
}

/** Reverts an unsaved preview. */
export function revertPrefs() {
  state.prefs = { ...state.savedPrefs };
  applyPrefs();
  render();
}

export function prefsDirty() {
  return Object.keys(DEFAULT_PREFS).some((key) => state.prefs[key] !== state.savedPrefs[key]);
}

window.addEventListener('resize', layoutStage);
