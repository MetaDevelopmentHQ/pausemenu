---------------------------------------------------------------------------
-- LOCALE
-- Loads locales/<Config.Locale>.json on top of en.json, so a partial
-- translation still shows English for any missing key.
-- The same table is sent to the NUI, so every UI string lives in these files.
---------------------------------------------------------------------------
local function load(code)
    local raw = LoadResourceFile(GetCurrentResourceName(), ('locales/%s.json'):format(code))
    if not raw then
        print(('[pausemenu] locale file not found: locales/%s.json'):format(code))
        return {}
    end
    local ok, data = pcall(json.decode, raw)
    if not ok or type(data) ~= 'table' then
        print(('[pausemenu] invalid JSON in locales/%s.json'):format(code))
        return {}
    end
    return data
end

Locale = load('en')
local wanted = type(Config.Locale) == 'string' and Config.Locale or 'en'
if wanted ~= 'en' then
    for k, v in pairs(load(wanted)) do Locale[k] = v end
end

-- Returns the translation, or the key itself so config fields also accept plain text.
function _L(key)
    return Locale[key] or key
end
