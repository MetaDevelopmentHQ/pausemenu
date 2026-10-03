// App entry: Lua messages, view selection, mouse/keyboard routing, open/close transition.

import { state, nui, inGame, setRenderer, render } from './core.js';
import { setStrings } from './i18n.js';
import { initInput, setKeyHandler } from './input.js';
import { DEFAULT_PREFS, applyPrefs, styleOf } from './prefs.js';
import { ensureSelection } from './menu.js';
import * as glass from './views/glass.js';
import * as minimal from './views/minimal.js';
import * as settings from './views/settings.js';

const app = document.getElementById('app');
const viewRoot = document.getElementById('view');
let closeTimer = 0;

/** The view that should be shown right now. */
function activeView() {
  if (state.screen === 'settings') return settings;
  return styleOf() === 'minimal' ? minimal : glass;
}

function draw() {
  if (!state.open && !app.classList.contains('is-closing')) return;
  const view = activeView();
  if (view.beforeRender) view.beforeRender(viewRoot);
  viewRoot.innerHTML = view.renderView();
  if (view.afterRender) view.afterRender(viewRoot);
}

setRenderer(draw);

// --- Mouse: every click is routed from one place via data-action ---
viewRoot.addEventListener('click', (event) => {
  const target = event.target.closest('[data-action]');
  if (!target || target.disabled) return;
  activeView().onAction(target.dataset.action, target.dataset.id, target);
});

// --- Keyboard ---
initInput(() => state.open);
setKeyHandler((name, event) => activeView().onKey(name, event));

// ---------------------------------------------------------------------------
// Open / close
// ---------------------------------------------------------------------------

function open(message) {
  clearTimeout(closeTimer);
  state.open = true;
  state.screen = message.screen === 'settings' ? 'settings' : 'menu';
  state.sel = 'home';
  state.toast = null;
  if (message.clock) state.clock = message.clock;
  ensureSelection();
  app.classList.remove('is-closing');
  draw();
  // Add the class on the next frame so the transition runs
  requestAnimationFrame(() => app.classList.add('is-open'));
}

function close() {
  if (!state.open) return;
  state.open = false;
  settings.reset();
  app.classList.remove('is-open');
  app.classList.add('is-closing');
  closeTimer = setTimeout(() => {
    app.classList.remove('is-closing');
    viewRoot.innerHTML = '';
  }, state.config.transitionMs || 180);
}

// ---------------------------------------------------------------------------
// Lua messages
// ---------------------------------------------------------------------------

window.addEventListener('message', (event) => {
  const msg = event.data;
  if (!msg || typeof msg !== 'object') return;

  switch (msg.action) {
    case 'open':
      open(msg);
      break;
    case 'close':
      close();
      break;
    case 'data':
      state.data = msg.data || null;
      if (state.open) render();
      break;
    case 'clock':
      state.clock = msg.clock || state.clock;
      if (state.open && activeView().updateClock) activeView().updateClock(viewRoot);
      break;
    default:
      break;
  }
});

// ---------------------------------------------------------------------------
// Startup
// ---------------------------------------------------------------------------

function init(payload) {
  setStrings(payload.strings);
  Object.assign(state.config, payload.config || {});
  state.savedPrefs = { ...DEFAULT_PREFS, ...(payload.prefs || {}) };
  state.prefs = { ...state.savedPrefs };
  state.locks = payload.locks || {};
  document.documentElement.lang = payload.locale || 'tr';
  applyPrefs();
  state.ready = true;
}

async function boot() {
  if (inGame) {
    const payload = await nui('ready');
    if (payload) init(payload);
    return;
  }
  // Browser preview: serving web/index.html locally runs it with sample data.
  document.body.classList.add('is-preview');
  const { previewPayload, previewData } = await import('./preview.js');
  init(await previewPayload());
  state.data = previewData;
  window.postMessage({ action: 'open', screen: new URLSearchParams(location.search).get('screen') || 'menu' }, '*');
  window.addEventListener('keyup', (event) => {
    if (event.key === 'Escape' && !state.open) setTimeout(() => window.postMessage({ action: 'open' }, '*'), 50);
  });
}

boot();
