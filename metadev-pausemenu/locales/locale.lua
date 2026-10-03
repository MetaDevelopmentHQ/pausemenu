-- Minimal locale helper. Lua-side strings live in tr.lua / en.lua,
-- UI strings live in tr.json / en.json.
Locales = Locales or {}

--- Returns the string for the configured locale. Falls back to English, then to the key itself.
---@param key string
---@param ... any string.format arguments
function L(key, ...)
    local lang = Locales[Config.Locale] or Locales.en or {}
    local str = lang[key] or (Locales.en and Locales.en[key]) or key
    if select('#', ...) > 0 then
        return str:format(...)
    end
    return str
end
