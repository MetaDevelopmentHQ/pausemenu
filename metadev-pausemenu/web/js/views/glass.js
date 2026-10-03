// Glass pause menu (design/1-glass.html).
// Numbered menu on the left, glass panel for the selected entry on the right.

import { state, esc, icon, ICONS } from '../core.js';
import { t } from '../i18n.js';
import {
  menuItems, clickItem, activate, moveSelection, handleShortcut, closeMenu, openMap, openSettings, quitServer, select,
  SWATCHES, currentSwatch, pickSwatch, cycleSwatch,
  localTime, localDate, gameTime, sessionText, pingColor, initials, announceTag, jobColor,
} from '../menu.js';
import { ACCENTS } from '../prefs.js';

// ---------------------------------------------------------------------------
// Parts
// ---------------------------------------------------------------------------

function brand() {
  const { logo, shortName, serverName } = state.config;
  const mark = logo
    ? `<img src="${esc(logo)}" alt="">`
    : esc(shortName || '');
  return `
    <div class="g-brand">
      <div class="g-logo">${mark}</div>
      <div class="g-brand-text">
        <div class="g-server">${esc(serverName)}</div>
        <div class="mono-label">${t('header.paused')}</div>
      </div>
    </div>`;
}

function clock() {
  return `
    <div class="g-clock">
      <div class="g-time" data-bind="time">${localTime()}</div>
      <div class="g-date" data-bind="dateLine">${esc(dateLine())}</div>
    </div>`;
}

function dateLine() {
  return `${localDate()} · ${t('header.cityTime', { time: gameTime() })}`;
}

function nav() {
  const items = menuItems().map((item) => {
    const on = item.id === state.sel;
    const cls = ['g-item', on ? 'is-on' : '', item.id === 'quit' ? 'is-danger' : ''].join(' ');
    return `
      <button class="${cls}" data-action="item" data-id="${item.id}">
        <span class="g-item-n">${item.n}</span>
        <span class="g-item-label">${esc(t(`menu.${item.id}`))}</span>
        ${item.ext ? icon(ICONS.external, 18, '#9AA3AE') : ''}
        ${item.key ? `<span class="kbd g-item-key">${esc(item.key)}</span>` : ''}
      </button>`;
  });
  return `<nav class="g-nav">${items.join('')}</nav>`;
}

// --- Panel contents ---

function homePanel() {
  const data = state.data;
  const player = data?.player;
  const city = data?.city;
  const jobs = state.config.jobsEnabled && Array.isArray(data?.jobs) ? data.jobs : [];
  const fill = city && city.max > 0 ? Math.min(100, (city.online / city.max) * 100) : 0;

  const idLine = player
    ? [t('home.idLine', { id: player.id }), player.job].filter(Boolean).join(' · ')
    : '—';

  const jobBoxes = jobs.length
    ? `<div class="g-jobs" style="grid-template-columns: repeat(${jobs.length}, minmax(0, 1fr))">
        ${jobs.map((job) => `
          <div class="g-stat">
            <div class="g-stat-label">${esc(job.label)}</div>
            <div class="g-stat-value is-big" style="color: ${jobColor(job.color)}">${Number(job.count) || 0}</div>
          </div>`).join('')}
      </div>`
    : '';

  return `
    <div class="g-home-top">
      <div class="g-card">
        <div class="g-char">
          <div class="g-avatar">${esc(initials(player?.name))}</div>
          <div class="g-char-text">
            <div class="mono-label">${t('home.character')}</div>
            <div class="g-char-name">${esc(player?.name || '—')}</div>
            <div class="g-char-sub">${esc(idLine)}</div>
          </div>
        </div>
        <div class="g-stats">
          <div class="g-stat">
            <div class="g-stat-label">${t('home.session')}</div>
            <div class="g-stat-value" data-bind="session">${esc(sessionText())}</div>
          </div>
          <div class="g-stat">
            <div class="g-stat-label">${t('home.ping')}</div>
            <div class="g-stat-value" style="color: ${player ? pingColor(player.ping) : '#EDEFF2'}">${player ? esc(t('home.pingValue', { ms: player.ping })) : '—'}</div>
          </div>
        </div>
      </div>
      <div class="g-card g-city">
        <div class="g-city-head">
          <div class="mono-label">${t('home.city')}</div>
          <div class="g-city-count"><span>${city ? city.online : '—'}</span> ${esc(t('home.playersOf', { max: city ? city.max : '—' }))}</div>
        </div>
        <div class="g-bar"><div class="g-bar-fill" style="width: ${fill}%"></div></div>
        ${jobBoxes}
      </div>
    </div>
    ${announcementsCard()}`;
}

function announcementsCard() {
  const list = Array.isArray(state.data?.announcements) ? state.data.announcements.slice(0, 2) : [];
  const source = state.data?.announceSource === 'discord' ? t('home.fromDiscord') : t('home.fromConfig');

  const body = list.length
    ? list.map((item, i) => `
        ${i > 0 ? '<div class="g-divider"></div>' : ''}
        <div class="g-announce">
          <div class="g-chip ${i === 0 ? 'is-accent' : ''}">${esc(announceTag(item))}</div>
          <div class="g-announce-text">
            <div class="g-announce-title">${esc(item.title)}</div>
            ${item.text ? `<div class="g-announce-body">${esc(item.text)}</div>` : ''}
          </div>
        </div>`).join('')
    : `<div class="g-announce-body">${state.data ? t('home.noAnnouncements') : '—'}</div>`;

  return `
    <div class="g-card g-announcements">
      <div class="g-announce-head">
        <div class="mono-label">${t('home.announcements')}</div>
        <div class="g-muted-sm">${esc(source)}</div>
      </div>
      ${body}
    </div>`;
}

function rulesPanel() {
  const rules = state.config.rules || [];
  return `
    <div class="g-heading">
      <div class="mono-label">${t('rules.eyebrow')}</div>
      <div class="g-title">${t('rules.title')}</div>
    </div>
    <div class="g-rules">
      ${rules.map((rule, i) => `
        <div class="g-rule">
          <div class="g-rule-n">${String(i + 1).padStart(2, '0')}</div>
          <div class="g-rule-text">
            <div class="g-rule-title">${esc(rule.title)}</div>
            <div class="g-rule-body">${esc(rule.text)}</div>
          </div>
        </div>`).join('')}
    </div>`;
}

function mapPanel() {
  return `
    <div class="g-center">
      <div class="g-info-icon">${icon(ICONS.map, 40, 'var(--accent)', 1.8)}</div>
      <div class="g-title">${t('mapInfo.title')}</div>
      <div class="g-center-body">${t('mapInfo.body')}</div>
      <button class="btn btn-accent btn-lg" data-action="open-map">${t('mapInfo.cta')}</button>
    </div>`;
}

function settingsPanel() {
  const current = currentSwatch();
  return `
    <div class="g-heading">
      <div class="mono-label">${t('glassSettings.eyebrow')}</div>
      <div class="g-title">${t('glassSettings.title')}</div>
    </div>
    <div class="g-card g-swatch-card">
      <div class="g-swatch-head">
        <div class="g-card-title">${t('glassSettings.accent')}</div>
        <div class="g-muted-sm">${t('glassSettings.accentNote')}</div>
      </div>
      <div class="swatches">
        ${SWATCHES.map((name) => `
          <button class="swatch ${name === current ? 'is-on' : ''}" style="--sw: ${ACCENTS[name]}"
            data-action="swatch" data-id="${name}" aria-label="${ACCENTS[name]}"></button>`).join('')}
      </div>
    </div>
    <div class="g-card g-game-card">
      <div class="g-game-text">
        <div class="g-card-title">${t('glassSettings.gameTitle')}</div>
        <div class="g-announce-body">${t('glassSettings.gameBody')}</div>
      </div>
      <button class="btn btn-accent" data-action="open-settings">${t('glassSettings.cta')}</button>
    </div>`;
}

function quitPanel() {
  return `
    <div class="g-center">
      <div class="g-title">${t('quit.title')}</div>
      <div class="g-center-body is-wide">${t('quit.body')}</div>
      <div class="g-quit-actions">
        <button class="btn btn-ghost btn-lg" data-action="quit-cancel">${t('quit.cancel')}</button>
        <button class="btn btn-danger btn-lg" data-action="quit-confirm">${t('quit.confirm')}</button>
      </div>
    </div>`;
}

function panel() {
  switch (state.sel) {
    case 'rules': return rulesPanel();
    case 'map': return mapPanel();
    case 'settings': return settingsPanel();
    case 'quit': return quitPanel();
    default: return homePanel();
  }
}

function toast() {
  if (!state.toast) return '';
  return `<div class="g-toast"><span class="dot"></span>${esc(state.toast.text)}</div>`;
}

function footer() {
  const credit = state.config.showCredit
    ? `<div class="credit"><img src="img/metadev-logo.png" alt="">${t('hints.madeBy')} <span>METADEV</span></div>`
    : '<div></div>';
  return `
    <div class="g-footer">
      <div class="hints">
        <div class="hint"><span class="kbd">ESC</span>${t('hints.resume')}</div>
        <div class="hint"><span class="kbd">↑ ↓</span>${t('hints.navigate')}</div>
        <div class="hint"><span class="kbd">ENTER</span>${t('hints.select')}</div>
      </div>
      ${credit}
    </div>`;
}

// ---------------------------------------------------------------------------
// View interface
// ---------------------------------------------------------------------------

export function renderView() {
  return `
    <div class="view glass">
      <div class="g-shade"></div>
      ${brand()}
      ${clock()}
      ${nav()}
      <section class="g-panel" data-panel="${state.sel}">${panel()}</section>
      ${toast()}
      ${footer()}
    </div>`;
}

/** Every second: only updates the clock texts (no full render). */
export function updateClock(root) {
  const time = root.querySelector('[data-bind="time"]');
  if (time) time.textContent = localTime();
  const date = root.querySelector('[data-bind="dateLine"]');
  if (date) date.textContent = dateLine();
  const session = root.querySelector('[data-bind="session"]');
  if (session) session.textContent = sessionText();
}

export function onAction(action, id) {
  switch (action) {
    case 'item': return clickItem(id);
    case 'swatch': return pickSwatch(id);
    case 'open-map': return openMap();
    case 'open-settings': return openSettings();
    case 'quit-cancel': return select('home');
    case 'quit-confirm': return quitServer();
    default: return undefined;
  }
}

export function onKey(name) {
  switch (name) {
    case 'ESC': return closeMenu();
    case 'UP': return moveSelection(-1);
    case 'DOWN': return moveSelection(1);
    case 'ENTER': return activate(state.sel);
    case 'LEFT':
    case 'RIGHT':
      if (state.sel === 'settings') cycleSwatch(name === 'LEFT' ? -1 : 1);
      return undefined;
    default: return handleShortcut(name);
  }
}
