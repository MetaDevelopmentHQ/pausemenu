// Keyboard input: normalises keys to simple names and forwards them to the active view.
// ESC is handled on keyup, so the key release can't leak into the game and reopen the menu.

const NAMED = {
  Escape: 'ESC', Enter: 'ENTER', NumpadEnter: 'ENTER', Space: 'SPACE', Backspace: 'BACKSPACE', Tab: 'TAB',
  ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
};

/** KeyboardEvent -> 'ESC', 'ENTER', 'UP', 'Q', 'F2', '1' ... */
export function keyName(event) {
  if (NAMED[event.code]) return NAMED[event.code];
  if (/^Key[A-Z]$/.test(event.code)) return event.code.slice(3);
  if (/^Digit\d$/.test(event.code)) return event.code.slice(5);
  if (/^F\d{1,2}$/.test(event.code)) return event.code;
  return (event.key || '').toUpperCase();
}

/** Does a key from the config ('p', 'F2') match this key name? */
export function matchesKey(name, configured) {
  return typeof configured === 'string' && configured.trim().toUpperCase() === name;
}

let handler = null;

/** Sets the active view's key handler: fn(name, event). */
export function setKeyHandler(fn) {
  handler = fn;
}

export function initInput(isActive) {
  document.addEventListener('keydown', (event) => {
    if (!isActive()) return;
    const name = keyName(event);
    // Block CEF defaults (F5 reload, Space clicking buttons, Tab moving focus)
    event.preventDefault();
    if (name === 'ESC' || event.repeat && name === 'ENTER' || !handler) return;
    handler(name, event);
  });

  document.addEventListener('keyup', (event) => {
    if (!isActive() || keyName(event) !== 'ESC') return;
    event.preventDefault();
    if (handler) handler('ESC', event);
  });
}
