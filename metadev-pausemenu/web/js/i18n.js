// Locale helper. Every UI string comes from locales/<lang>.json.

let strings = {};

export function setStrings(data) {
  strings = data && typeof data === 'object' ? data : {};
}

/** Returns a string by dotted path: t('home.ping'). {name} placeholders are filled from vars. */
export function t(path, vars) {
  const value = path.split('.').reduce((obj, key) => (obj == null ? undefined : obj[key]), strings);
  if (value == null) return path;
  if (typeof value !== 'string' || !vars) return value;
  return value.replace(/\{(\w+)\}/g, (match, key) => (vars[key] !== undefined ? vars[key] : match));
}

/** Upper-casing that respects the Turkish i/İ rule. */
export function upper(str) {
  return String(str).toLocaleUpperCase(dateLocale());
}

export function dateLocale() {
  return strings.dateLocale || 'tr-TR';
}
