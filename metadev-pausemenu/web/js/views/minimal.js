// Minimal pause menu (design/2-minimal.html).
// Big type menu, no panels; the selected entry grows and shows a one-line description.

import { state, esc } from '../core.js';
import { t, upper } from '../i18n.js';
import {
  menuItems, clickItem, activate, moveSelection, handleShortcut, closeMenu, pickSwatch, cycleSwatch,
  SWATCHES, currentSwatch, shortUrl, localTime, localDateUpper, announceTag,
} from '../menu.js';
import { ACCENTS } from '../prefs.js';

function topBar() {
  const { logo, serverName } = state.config;
  return `
    <div class="m-top">
      <div class="m-brand">
        ${logo ? `<img class="m-logo" src="${esc(logo)}" alt="">` : ''}
        <div class="m-name">${esc(serverName)}<span class="accent">.</span></div>
        <div class="mono-label m-dim">${t('header.pausedShort')}</div>
      </div>
      <div class="m-clock" data-bind="clockLine">${esc(clockLine())}</div>
    </div>`;
}

function clockLine() {
  return `${localTime()} · ${localDateUpper()}`;
}

function nav() {
  const items = menuItems().map((item) => {
    const on = item.id === state.sel;
    const cls = ['m-item', on ? 'is-on' : '', item.id === 'quit' ? 'is-danger' : ''].join(' ');
    const desc = item.id === 'quit' || !item.key
      ? t(`menuDesc.${item.id}`)
      : `${t(`menuDesc.${item.id}`)} · ${item.key}`;
    return `
      <div class="m-entry">
        <button class="${cls}" data-action="item" data-id="${item.id}"><span class="m-dot"></span>${esc(t(`minimalMenu.${item.id}`))}</button>
        ${on ? `<div class="m-desc">${esc(desc)}</div>` : ''}
      </div>`;
  });
  return `<nav class="m-nav">${items.join('')}</nav>`;
}

function side() {
  // The Discord notice wins over everything else
  if (state.toast && state.toast.kind === 'discord') {
    return `
      <div class="m-side m-discord">
        <div class="mono-label accent">${t('discord.opening')}</div>
        <div class="m-big">${esc(shortUrl(state.config.discordInvite))}</div>
      </div>`;
  }

  if (state.sel === 'rules') {
    return `
      <div class="m-side m-rules">
        ${(state.config.rules || []).map((rule, i) => `
          <div class="m-rule">
            <div class="m-rule-n">${String(i + 1).padStart(2, '0')}</div>
            <div class="m-rule-text">
              <div class="m-rule-title">${esc(rule.title)}</div>
              <div class="m-rule-body">${esc(rule.text)}</div>
            </div>
          </div>`).join('')}
      </div>`;
  }

  if (state.sel === 'settings') {
    const current = currentSwatch();
    return `
      <div class="m-side m-settings">
        <div class="mono-label m-dim">${t('minimal.accentLabel')}</div>
        <div class="swatches is-small">
          ${SWATCHES.map((name) => `
            <button class="swatch ${name === current ? 'is-on' : ''}" style="--sw: ${ACCENTS[name]}"
              data-action="swatch" data-id="${name}" aria-label="${ACCENTS[name]}"></button>`).join('')}
        </div>
        <div class="m-note">${t('minimal.enterForSettings')}</div>
      </div>`;
  }

  return '';
}

function statLine() {
  const data = state.data;
  if (!data) return '—';
  const parts = [t('minimal.players', { online: data.city?.online ?? '—', max: data.city?.max ?? '—' })];
  if (state.config.jobsEnabled && Array.isArray(data.jobs)) {
    for (const job of data.jobs) parts.push(`${Number(job.count) || 0} ${upper(job.label)}`);
  }
  if (data.player) parts.push(t('minimal.ping', { ms: data.player.ping }));
  return parts.join(' · ');
}

function bottom() {
  const first = Array.isArray(state.data?.announcements) ? state.data.announcements[0] : null;
  const announcement = first
    ? `
      <div class="m-announce">
        <div class="mono-label accent m-announce-tag">${esc(t('minimal.announce', { tag: announceTag(first) }))}</div>
        <div class="m-announce-text">${esc(first.text ? `${first.title} · ${first.text}` : first.title)}</div>
      </div>`
    : '<div></div>';

  const credit = state.config.showCredit
    ? '<div class="credit is-small"><img src="img/metadev-logo.png" alt="">METADEV</div>'
    : '';

  return `
    <div class="m-bottom">
      ${announcement}
      <div class="m-bottom-right">
        <div class="m-stats">${esc(statLine())}</div>
        ${credit}
      </div>
    </div>
    <div class="m-accent-line"></div>`;
}

// ---------------------------------------------------------------------------
// View interface
// ---------------------------------------------------------------------------

export function renderView() {
  return `
    <div class="view minimal">
      <div class="m-shade"></div>
      ${topBar()}
      ${nav()}
      ${side()}
      ${bottom()}
    </div>`;
}

export function updateClock(root) {
  const line = root.querySelector('[data-bind="clockLine"]');
  if (line) line.textContent = clockLine();
}

export function onAction(action, id) {
  if (action === 'item') return clickItem(id);
  if (action === 'swatch') return pickSwatch(id);
  return undefined;
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
