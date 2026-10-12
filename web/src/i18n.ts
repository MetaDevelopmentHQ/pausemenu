/**
 * UI translations. The dictionary comes from locales/<Config.Locale>.json, sent by Lua on every "open".
 * The locale cannot change while the menu is open, so a module-level dictionary is enough.
 */
type Dict = Record<string, string>;

let dict: Dict = {};

export function setLocale(d: Dict | null | undefined) {
  dict = d ?? {};
}

/** Looks up a key; unknown keys return the key itself, so plain config text passes through. `{name}` is replaced from vars. */
export function t(key: string, vars?: Record<string, string | number>): string {
  let s = dict[key] ?? key;
  if (vars) for (const k in vars) s = s.split(`{${k}}`).join(String(vars[k]));
  return s;
}

/** BCP 47 tag of the active language, for case conversion and sorting (e.g. Turkish dotted İ). */
export const lang = (): string => dict._lang || "en-US";
