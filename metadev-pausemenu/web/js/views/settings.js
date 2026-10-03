// Settings screen (design/3-ayarlar.html): replaces the GTA settings, plus the Panel category.
// Layout is tabs, sidebar or a single list depending on the Panel "Menu layout" preference.

import { state, nui, render, esc, icon, ICONS, showToast } from '../core.js';
import { t, upper } from '../i18n.js';
import { visibleCategories, readRequest, formatControlKey } from '../settings-data.js';
import { previewPref, savePrefs, revertPrefs, prefsDirty } from '../prefs.js';

const S = {
  cats: [],          // visible categories
  catId: null,       // selected category in tabs / sidebar layout
  rowId: null,       // selected row
  values: {},        // GTA setting values (groups 1 and 2)
  original: {},      // applied values of group 1 settings
  confirm: null,     // { focus: 0..2 } unsaved changes dialog
  scrollTop: 0,
};

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

const layout = () => (['tabs', 'sidebar', 'list'].includes(state.prefs.layout) ? state.prefs.layout : 'tabs');
const navigable = (row) => row.type !== 'header';

function findRow(id) {
  for (const cat of S.cats) {
    const row = cat.rows.find((r) => r.id === id);
    if (row) return { row, cat };
  }
  return null;
}

function currentCat() {
  if (layout() === 'list') return findRow(S.rowId)?.cat || S.cats[0];
  return S.cats.find((cat) => cat.id === S.catId) || S.cats[0];
}

/** Rows reachable with up/down: all of them in list layout, the selected category otherwise. */
function scopeRows() {
  if (layout() === 'list') return S.cats.flatMap((cat) => cat.rows.filter(navigable));
  return currentCat().rows.filter(navigable);
}

function currentRow() {
  const rows = scopeRows();
  return rows.find((row) => row.id === S.rowId) || rows[0];
}

function lockOf(row) {
  return row.lockKey && state.locks ? state.locks[row.lockKey] : null;
}

function editable(row) {
  if (row.access === 'pref') return true;
  return row.access === 'apply' && !lockOf(row);
}

function readValue(row) {
  if (row.access === 'pref') {
    const value = state.prefs[row.source.pref];
    if (row.values) return Math.max(0, row.values.indexOf(value));
    if (row.type === 'bool') return value ? 1 : 0;
    return Number(value) || row.def;
  }
  const lock = lockOf(row);
  if (lock) return lock.value;
  return S.values[row.id] !== undefined ? S.values[row.id] : row.def;
}

function optionList(row) {
  const list = t(`options.${row.opts}`);
  return Array.isArray(list) ? list : [];
}

function maxOf(row) {
  if (row.type === 'bool') return 1;
  if (row.type === 'range') return row.max;
  return Math.max(0, optionList(row).length - 1);
}

function setValue(row, value) {
  if (!editable(row)) return;
  const min = row.type === 'range' ? row.min : 0;
  value = Math.min(maxOf(row), Math.max(min, value));
  S.rowId = row.id;

  if (row.access === 'pref') {
    const key = row.source.pref;
    if (row.values) previewPref(key, row.values[value]);
    else if (row.type === 'bool') previewPref(key, value === 1);
    else previewPref(key, value);
    return;
  }
  S.values[row.id] = value;
  render();
}

function change(row, delta) {
  if (!editable(row) || row.type === 'key' || row.type === 'info') return;
  const value = readValue(row);
  setValue(row, row.type === 'bool' ? 1 - value : value + delta);
}

function gameDirty() {
  return Object.keys(S.original).some((id) => S.values[id] !== S.original[id]);
}

const isDirty = () => gameDirty() || prefsDirty();

// ---------------------------------------------------------------------------
// Reading values from the game
// ---------------------------------------------------------------------------

const ASPECTS = [[16 / 9, '16:9'], [16 / 10, '16:10'], [21 / 9, '21:9'], [43 / 18, '21:9'], [32 / 9, '32:9'], [4 / 3, '4:3'], [5 / 4, '5:4'], [3 / 2, '3:2']];

function aspectLabel(ratio) {
  if (typeof ratio !== 'number' || !ratio) return null;
  const match = ASPECTS.find(([value]) => Math.abs(value - ratio) < 0.02);
  return match ? match[1] : ratio.toFixed(2);
}

async function loadValues() {
  const res = await nui('getGameSettings', readRequest());
  S.values = {};
  S.original = {};

  for (const cat of S.cats) {
    for (const row of cat.rows) {
      if (!row.source || row.access === 'pref' || row.type === 'header') continue;
      let value;
      if (res) {
        const src = row.source;
        if (src.profile !== undefined) value = res.profile?.[String(src.profile)];
        else if (src.control !== undefined) value = res.controls?.[String(src.control)];
        else if (src.special === 'measurement') value = res.special?.metric === false ? 1 : 0;
        else if (src.special === 'aspect') value = aspectLabel(res.special?.aspect);
        else if (src.special) value = res.special?.[src.special];
      }
      if (value === undefined || value === null) value = row.def;
      if (row.type === 'bool') value = value ? 1 : 0;
      if (row.type === 'range' || row.type === 'enum') value = Math.max(0, Number(value) || 0);
      S.values[row.id] = value;
      if (row.access === 'apply') S.original[row.id] = value;
    }
  }
  render();
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

/** Called when the screen is entered. */
export function enter() {
  S.cats = visibleCategories();
  S.catId = S.cats[0]?.id;
  S.rowId = S.cats[0]?.rows.find(navigable)?.id;
  S.confirm = null;
  S.scrollTop = 0;
  S.values = {};
  S.original = {};
  loadValues();
}

function selectRow(id) {
  S.rowId = id;
  render();
}

function moveRow(delta) {
  const rows = scopeRows();
  const index = rows.findIndex((row) => row.id === currentRow().id);
  const next = rows[Math.min(rows.length - 1, Math.max(0, index + delta))];
  if (next) selectRow(next.id);
}

function switchCat(delta) {
  const index = S.cats.findIndex((cat) => cat.id === currentCat().id);
  const next = S.cats[(index + delta + S.cats.length) % S.cats.length];
  pickCat(next.id);
}

function pickCat(id) {
  const cat = S.cats.find((c) => c.id === id);
  if (!cat) return;
  S.catId = cat.id;
  S.rowId = cat.rows.find(navigable)?.id;
  S.scrollTop = 0;
  render();
}

function openGta(row) {
  nui('openGtaSettings', { section: row.type === 'key' ? 'keys' : 'general' });
}

/** ENTER or a second click on a row. */
function activateRow(row) {
  if (row.access === 'read') return openGta(row);
  if (!editable(row)) return;
  if (row.type === 'bool') return change(row, 1);
  if (row.type === 'enum') {
    const value = readValue(row);
    return setValue(row, value >= maxOf(row) ? 0 : value + 1);
  }
  return undefined;
}

async function applyAll() {
  if (gameDirty()) {
    await nui('applyGameSettings', {
      targetingMode: S.values.targetingMode,
      camDistance: S.values.camDistance,
    });
    S.original = Object.fromEntries(Object.keys(S.original).map((id) => [id, S.values[id]]));
  }
  if (prefsDirty()) await savePrefs();
  showToast(t('settings.applied'), 'info', 1600);
  render();
}

function leave() {
  S.confirm = null;
  state.screen = 'menu';
  render();
}

function discard() {
  revertPrefs();
  for (const id of Object.keys(S.original)) S.values[id] = S.original[id];
  leave();
}

function back() {
  if (isDirty()) {
    S.confirm = { focus: 0 };
    render();
    return;
  }
  leave();
}

const CONFIRM_ACTIONS = ['confirm-apply', 'confirm-discard', 'confirm-cancel'];

async function runConfirm(action) {
  if (action === 'confirm-apply') {
    await applyAll();
    leave();
  } else if (action === 'confirm-discard') {
    discard();
  } else {
    S.confirm = null;
    render();
  }
}

// ---------------------------------------------------------------------------
// Texts
// ---------------------------------------------------------------------------

const rowLabel = (row) => t(`rows.${row.id}.l`);

function valueText(row, value) {
  switch (row.type) {
    case 'bool': return value ? t('settings.on') : t('settings.off');
    case 'range': return String(value);
    case 'key': return formatControlKey(value, t);
    case 'info': return String(value ?? '—');
    default: {
      const label = optionList(row)[value];
      return upper(label !== undefined ? label : `${t('settings.unknown')} (${value})`);
    }
  }
}

function detailText(row, value) {
  if (row.type === 'range') return `${value} / ${row.max}`;
  if (row.type === 'bool') return value ? t('settings.chipOn') : t('settings.chipOff');
  if (row.type === 'enum') {
    const label = optionList(row)[value];
    return label !== undefined ? label : `${t('settings.unknown')} (${value})`;
  }
  return valueText(row, value);
}

function description(row) {
  const parts = [];
  const own = t(`rows.${row.id}.d`);
  if (own !== `rows.${row.id}.d`) parts.push(own);

  const lock = lockOf(row);
  if (lock) parts.push(lock.reason || t('settings.lockedDefault'));
  else if (row.type === 'key') parts.push(t('settings.keyNote'));
  else if (row.access === 'read') parts.push(t('settings.readOnlyNote'));
  else if (!own || own === `rows.${row.id}.d`) {
    parts.push(row.type === 'range'
      ? t('settings.descRange', { min: row.min, max: row.max })
      : t('settings.descEnum'));
  }
  if (row.restart) parts.push(t('settings.restartNote'));
  return parts.join(' ');
}

// ---------------------------------------------------------------------------
// Render
// ---------------------------------------------------------------------------

function tabsBar() {
  return `
    <div class="s-tabs">
      ${S.cats.map((cat) => `
        <button class="s-tab ${cat.id === currentCat().id ? 'is-on' : ''} ${cat.id === 'panel' ? 'is-sep' : ''}"
          data-action="cat" data-id="${cat.id}">${esc(t(`categories.${cat.id}.label`))}</button>`).join('')}
    </div>`;
}

function sideBar() {
  return `
    <nav class="s-side">
      ${S.cats.map((cat) => `
        <button class="s-side-item ${cat.id === currentCat().id ? 'is-on' : ''} ${cat.id === 'panel' ? 'is-sep' : ''}"
          data-action="cat" data-id="${cat.id}">${icon(cat.icon, 18)}<span>${esc(t(`categories.${cat.id}.label`))}</span></button>`).join('')}
    </nav>`;
}

function ticks(row, value) {
  let html = '';
  for (let i = 0; i < row.max; i++) html += `<div class="s-tick ${i < value ? 'is-on' : ''}"></div>`;
  return `<div class="s-ticks" style="grid-template-columns: repeat(${row.max}, minmax(0, 1fr))">${html}</div><div class="s-num">${value}</div>`;
}

function rowHtml(row, selectedId) {
  if (row.type === 'header') {
    return `<div class="s-header">${esc(t(`headers.${row.id}`))}</div>`;
  }

  const value = readValue(row);
  const lock = lockOf(row);
  const canEdit = editable(row);
  const readOnly = row.access === 'read';
  const on = row.id === selectedId;
  const cls = ['s-row', on ? 'is-on' : '', lock ? 'is-locked' : '', readOnly ? 'is-readonly' : ''].join(' ');

  let valueHtml;
  if (row.type === 'range') valueHtml = ticks(row, value);
  else if (row.type === 'key') valueHtml = `<div class="s-keycap">${esc(valueText(row, value))}</div>`;
  else valueHtml = `<div class="s-text ${row.type === 'bool' && !value ? 'is-off' : ''}">${esc(valueText(row, value))}</div>`;

  const right = readOnly
    ? `<button class="s-arrow is-gta" data-action="gta" data-id="${row.id}" title="${esc(t('settings.openGta'))}" aria-label="${esc(t('settings.openGta'))}">${icon(ICONS.external, 16, 'currentColor', 2.2)}</button>`
    : `<button class="s-arrow" data-action="inc" data-id="${row.id}" ${canEdit ? '' : 'disabled'} aria-label="${esc(t('settings.increase'))}">${icon(ICONS.chevronRight, 16, 'currentColor', 2.4)}</button>`;

  return `
    <div class="${cls}" data-row="${row.id}">
      <button class="s-row-label" data-action="row" data-id="${row.id}">
        ${lock ? `<span class="s-lock">${icon(ICONS.lock, 16, 'currentColor', 2)}</span>` : ''}
        <span>${esc(rowLabel(row))}</span>
        ${row.restart ? `<span class="s-tag">${t('settings.restartTag')}</span>` : ''}
        ${lock ? `<span class="s-tag">${t('settings.lockedTag')}</span>` : ''}
      </button>
      <div class="s-ctrl">
        <button class="s-arrow ${readOnly ? 'is-hidden' : ''}" data-action="dec" data-id="${row.id}" ${canEdit ? '' : 'disabled'} aria-label="${esc(t('settings.decrease'))}">${icon(ICONS.chevronLeft, 16, 'currentColor', 2.4)}</button>
        <div class="s-value">${valueHtml}</div>
        ${right}
      </div>
    </div>`;
}

function rowsHtml(selectedId) {
  if (layout() === 'list') {
    return S.cats.map((cat) => `
      <div class="s-cat-header">${esc(t(`categories.${cat.id}.label`))}</div>
      ${cat.rows.map((row) => rowHtml(row, selectedId)).join('')}`).join('');
  }
  return currentCat().rows.map((row) => rowHtml(row, selectedId)).join('');
}

function mainPanel(cat, row) {
  const count = layout() === 'list'
    ? S.cats.reduce((n, c) => n + c.rows.filter(navigable).length, 0)
    : cat.rows.filter(navigable).length;
  const title = layout() === 'list' ? t('menu.settings') : t(`categories.${cat.id}.label`);
  const showPanelNote = cat.id === 'panel';

  return `
    <div class="s-main">
      <div class="s-main-head">
        <div class="s-title">${esc(title)}</div>
        <div class="s-count">${esc(t('settings.options', { n: count }))}</div>
        ${cat.sub && layout() !== 'list' ? `<div class="s-sub">${t('settings.panelSub')}</div>` : ''}
      </div>
      <div class="s-rows" data-scroll>${rowsHtml(row?.id)}</div>
      ${showPanelNote ? `<div class="s-note">${t('settings.panelNote')}</div>` : ''}
    </div>`;
}

function chips(row, value) {
  if (row.type !== 'enum' && row.type !== 'bool') return '';
  const labels = row.type === 'bool' ? [t('settings.chipOff'), t('settings.chipOn')] : optionList(row);
  const canEdit = editable(row);
  return `
    <div class="s-chips">
      ${labels.map((label, i) => `
        <button class="s-chip ${i === value ? 'is-on' : ''}" ${canEdit ? '' : 'disabled'}
          data-action="chip" data-id="${row.id}" data-value="${i}">${esc(label)}</button>`).join('')}
    </div>`;
}

function detailPanel(cat, row) {
  const tag = t(`categories.${cat.id}.tag`);
  if (!row) return '';
  const value = readValue(row);
  const gtaButton = row.access === 'read'
    ? `<button class="btn btn-ghost s-gta-btn" data-action="gta" data-id="${row.id}">${icon(ICONS.external, 16)}${t(row.type === 'key' ? 'settings.openGtaKeys' : 'settings.openGta')}</button>`
    : '';

  return `
    <div class="s-aside">
      <div class="s-hero">
        <div class="s-hero-ring">${icon(cat.icon, 64, 'var(--accent)', 1.6)}</div>
        <div class="s-hero-tag">${esc(tag)}</div>
      </div>
      <div class="s-detail">
        <div class="mono-label">${esc(tag)}</div>
        <div class="s-detail-title">${esc(rowLabel(row))}</div>
        <div class="s-detail-value">${esc(detailText(row, value))}</div>
        ${chips(row, value)}
        <div class="s-detail-desc">${esc(description(row))}</div>
        ${gtaButton}
      </div>
    </div>`;
}

function footer() {
  return `
    <div class="s-footer">
      ${state.config.showCredit ? '<div class="credit is-small"><img src="img/metadev-logo.png" alt="">METADEV</div>' : '<div></div>'}
      <div class="hints">
        <div class="hint"><span class="kbd">↑ ↓</span>${t('hints.pick')}</div>
        <div class="hint"><span class="kbd">← →</span>${t('hints.change')}</div>
        <div class="hint"><span class="kbd">Q E</span>${t('hints.category')}</div>
        <div class="hint"><span class="kbd">ESC</span>${t('hints.back')}</div>
        <button class="btn btn-accent s-apply ${isDirty() ? 'is-dirty' : ''}" data-action="apply">${t('hints.apply')}</button>
      </div>
    </div>`;
}

function confirmModal() {
  if (!S.confirm) return '';
  const labels = [t('settings.unsaved.apply'), t('settings.unsaved.discard'), t('settings.unsaved.cancel')];
  return `
    <div class="s-modal-backdrop">
      <div class="s-modal">
        <div class="s-modal-title">${t('settings.unsaved.title')}</div>
        <div class="s-modal-body">${t('settings.unsaved.body')}</div>
        <div class="s-modal-actions">
          ${CONFIRM_ACTIONS.map((action, i) => `
            <button class="btn ${i === 0 ? 'btn-accent' : 'btn-ghost'} ${S.confirm.focus === i ? 'is-focus' : ''}"
              data-action="${action}">${labels[i]}</button>`).join('')}
        </div>
      </div>
    </div>`;
}

function toast() {
  if (!state.toast || state.toast.kind === 'discord') return '';
  return `<div class="g-toast is-settings"><span class="dot"></span>${esc(state.toast.text)}</div>`;
}

export function renderView() {
  if (!S.cats.length) enter();
  const cat = currentCat();
  const row = currentRow();
  if (row) S.rowId = row.id;
  const mode = layout();

  return `
    <div class="view settings layout-${mode}">
      <div class="s-shade"></div>
      <div class="s-top">
        <button class="s-back" data-action="back" aria-label="${esc(t('settings.back'))}">${icon(ICONS.chevronLeft, 20, 'currentColor', 2.2)}</button>
        ${mode === 'tabs' ? tabsBar() : `<div class="s-top-title">${esc(t('menu.settings'))}</div>`}
        <div class="s-live"><span class="dot is-green"></span>${t('settings.live')}</div>
      </div>
      ${mode === 'sidebar' ? sideBar() : ''}
      ${mainPanel(cat, row)}
      ${detailPanel(cat, row)}
      ${footer()}
      ${toast()}
      ${confirmModal()}
    </div>`;
}

/** Before render: remember the list scroll position. */
export function beforeRender(root) {
  const list = root.querySelector('[data-scroll]');
  if (list) S.scrollTop = list.scrollTop;
}

/** After render: restore the scroll position and bring the selected row into view. */
export function afterRender(root) {
  const list = root.querySelector('[data-scroll]');
  if (!list) return;
  list.scrollTop = S.scrollTop;
  const selected = list.querySelector('.s-row.is-on');
  if (!selected) return;
  // .s-rows is position: relative, so offsetTop is already relative to the list
  const top = selected.offsetTop;
  const bottom = top + selected.offsetHeight;
  if (top < list.scrollTop) list.scrollTop = Math.max(0, top - 40);
  else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight + 8;
}

export function onAction(action, id, el) {
  if (CONFIRM_ACTIONS.includes(action)) return runConfirm(action);
  const found = id ? findRow(id) : null;
  const row = found?.row;

  switch (action) {
    case 'back': return back();
    case 'apply': return applyAll();
    case 'cat': return pickCat(id);
    case 'row':
      if (!row) return undefined;
      return S.rowId === row.id ? activateRow(row) : selectRow(row.id);
    case 'dec': return row && change(row, -1);
    case 'inc': return row && change(row, 1);
    case 'chip': return row && setValue(row, Number(el.dataset.value));
    case 'gta': return row && openGta(row);
    default: return undefined;
  }
}

export function onKey(name) {
  if (S.confirm) {
    if (name === 'LEFT') S.confirm.focus = Math.max(0, S.confirm.focus - 1);
    else if (name === 'RIGHT') S.confirm.focus = Math.min(2, S.confirm.focus + 1);
    else if (name === 'ENTER') return runConfirm(CONFIRM_ACTIONS[S.confirm.focus]);
    else if (name === 'ESC') S.confirm = null;
    render();
    return undefined;
  }

  const row = currentRow();
  switch (name) {
    case 'ESC': return back();
    case 'UP': return moveRow(-1);
    case 'DOWN': return moveRow(1);
    case 'LEFT': return row && change(row, -1);
    case 'RIGHT': return row && change(row, 1);
    case 'Q': return switchCat(-1);
    case 'E': return switchCat(1);
    case 'ENTER': return row && activateRow(row);
    case 'SPACE': return applyAll();
    default: return undefined;
  }
}

/** When the menu closes: revert any unsaved preview. */
export function reset() {
  if (prefsDirty()) revertPrefs();
  S.cats = [];
  S.confirm = null;
}
