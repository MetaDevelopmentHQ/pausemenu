// Menu model, actions and formatting helpers shared by Glass and Minimal.

import { state, nui, render, showToast, pad2 } from './core.js';
import { t, upper, dateLocale } from './i18n.js';
import { matchesKey } from './input.js';
import { ACCENTS, previewPref, savePrefs } from './prefs.js';

// ---------------------------------------------------------------------------
// Menu entries
// ---------------------------------------------------------------------------

/** Visible menu entries per config. Disabled entries are removed and the numbering is redone. */
export function menuItems() {
  const { menu = {}, keys = {} } = state.config;
  const ids = ['home'];
  if (menu.map !== false) ids.push('map');
  if (menu.settings !== false) ids.push('settings');
  if (menu.rules !== false && (state.config.rules || []).length) ids.push('rules');
  if (menu.discord !== false && state.config.discordInvite) ids.push('discord');
  ids.push('quit');

  return ids.map((id, i) => ({
    id,
    n: pad2(i + 1),
    key: id === 'home' ? 'ESC' : String(keys[id] || '').toUpperCase(),
    ext: id === 'discord',
  }));
}

/** Keeps the selection on a valid entry (in case it was disabled in the config). */
export function ensureSelection() {
  if (!menuItems().some((item) => item.id === state.sel)) state.sel = 'home';
}

export function select(id) {
  state.sel = id;
  render();
}

export function moveSelection(delta) {
  const items = menuItems();
  const index = items.findIndex((item) => item.id === state.sel);
  const next = items[(index + delta + items.length) % items.length];
  select(next.id);
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export function closeMenu() {
  nui('close');
}

export function openMap() {
  nui('openMap');
}

export function openSettings() {
  state.screen = 'settings';
  render();
}

export function quitServer() {
  nui('quit');
}

/** Opens the Discord invite in the player's browser and shows a toast. */
export function openDiscord() {
  const url = state.config.discordInvite;
  if (!/^https:\/\/(www\.)?(discord\.gg|discord\.com)\//i.test(url)) return;
  try {
    window.invokeNative('openUrl', url);
  } catch {
    // No invokeNative in the browser preview
  }
  showToast(t('discord.toast', { url: shortUrl(url) }), 'discord');
}

export function shortUrl(url) {
  return String(url || '').replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '');
}

/** Runs an entry (ENTER or clicking the selected entry). */
export function activate(id) {
  switch (id) {
    case 'home': return closeMenu();
    case 'map': return openMap();
    case 'settings': return openSettings();
    case 'discord': return openDiscord();
    case 'quit': return quitServer();
    default: return select(id);
  }
}

/** Mouse click: select if not selected, run if already selected. Discord always opens directly. */
export function clickItem(id) {
  if (id === 'discord') {
    state.sel = 'discord';
    return openDiscord();
  }
  if (state.sel === id) return activate(id);
  return select(id);
}

/** Shortcut keys from the config. Returns true when a key matched. */
export function handleShortcut(name) {
  for (const item of menuItems()) {
    if (item.id === 'home' || !matchesKey(name, state.config.keys[item.id])) continue;
    if (item.id === 'map') openMap();
    else if (item.id === 'settings') openSettings();
    else if (item.id === 'discord') openDiscord();
    else select(item.id);          // Rules and Quit are selected first; ENTER confirms Quit
    return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Theme colour (the pause menu colour picker is bound to the Panel "Accent colour" setting)
// ---------------------------------------------------------------------------

export const SWATCHES = Object.keys(ACCENTS);

export function currentSwatch() {
  return state.prefs.accent && ACCENTS[state.prefs.accent] ? state.prefs.accent : null;
}

export function pickSwatch(name) {
  previewPref('accent', name);
  savePrefs();
}

export function cycleSwatch(delta) {
  const index = SWATCHES.indexOf(currentSwatch());
  const next = SWATCHES[(index + delta + SWATCHES.length) % SWATCHES.length];
  pickSwatch(next);
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

export function localTime(now = new Date()) {
  return `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
}

/** e.g. "Cumartesi, 3 Ekim" / "Saturday, 3 October" */
export function localDate(now = new Date()) {
  const loc = dateLocale();
  const weekday = now.toLocaleDateString(loc, { weekday: 'long' });
  const month = now.toLocaleDateString(loc, { month: 'long' });
  return `${weekday.charAt(0).toLocaleUpperCase(loc)}${weekday.slice(1)}, ${now.getDate()} ${month}`;
}

/** e.g. "CUMARTESİ 3 EKİM" */
export function localDateUpper(now = new Date()) {
  const loc = dateLocale();
  const weekday = now.toLocaleDateString(loc, { weekday: 'long' });
  const month = now.toLocaleDateString(loc, { month: 'long' });
  return upper(`${weekday} ${now.getDate()} ${month}`);
}

export function gameTime() {
  return `${pad2(state.clock.gameHour)}:${pad2(state.clock.gameMinute)}`;
}

export function sessionText() {
  const minutes = Math.floor((state.clock.session || 0) / 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? t('duration.hm', { h, m }) : t('duration.m', { m });
}

export function pingColor(ms) {
  if (ms < 80) return '#4ADE80';
  if (ms < 150) return '#F5B544';
  return '#FF7A7A';
}

/** "Alex Kaya" -> "AK" */
export function initials(name) {
  const parts = String(name || '?').trim().split(/\s+/).filter(Boolean);
  const letters = parts.length > 1 ? parts[0][0] + parts[parts.length - 1][0] : (parts[0] || '?').slice(0, 2);
  return upper(letters);
}

/** Announcement label: TODAY / YESTERDAY / short date (player's local time). */
export function announceTag(item) {
  let date = null;
  if (item.time) date = new Date(item.time);
  else if (item.date) date = new Date(`${item.date}T12:00:00`);
  if (!date || Number.isNaN(date.getTime())) return t('home.announceTag');

  const today = new Date();
  const startOf = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(today) - startOf(date)) / 86400000);
  if (days === 0) return t('home.today');
  if (days === 1) return t('home.yesterday');
  return upper(date.toLocaleDateString(dateLocale(), { day: 'numeric', month: 'short' }));
}

/** Job colour: 'accent' means the accent colour. */
export function jobColor(color) {
  return color === 'accent' || !/^#[0-9a-f]{6}$/i.test(color || '') ? 'var(--accent)' : color;
}
