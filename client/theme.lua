PM = PM or {}

-- Data saved by older versions of this script (settings / theme tab). Removed once on start.
DeleteResourceKvp('pausemenu:custom_settings')
DeleteResourceKvp('pausemenu:client_settings')

---------------------------------------------------------------------------
-- THEME (fixed by Config.DefaultTheme; only the map style is chosen by the player on the map screen)
---------------------------------------------------------------------------
local MAP_STYLE_KEY = 'pausemenu:theme'
local MAP_STYLES = { dark = true, atlas = true, satellite = true }
local SCALES = { [90] = true, [100] = true, [110] = true }

local function defaults()
    local d = Config.DefaultTheme or {}
    return {
        accent = (type(d.accent) == 'string' and d.accent:match('^#%x%x%x%x%x%x$')) and d.accent:upper() or Config.AccentColor or '#FFB020',
        mapStyle = MAP_STYLES[d.mapStyle] and d.mapStyle or 'dark',
        scanlines = d.scanlines ~= false,
        motion = d.motion ~= false,
        blur = d.blur ~= false,
        scale = SCALES[d.scale] and d.scale or 100,
    }
end

local function savedMapStyle()
    local raw = GetResourceKvpString(MAP_STYLE_KEY)
    if not raw or raw == '' then return nil end
    local ok, decoded = pcall(json.decode, raw)
    local style = ok and type(decoded) == 'table' and decoded.mapStyle or nil
    return MAP_STYLES[style] and style or nil
end

function PM.getTheme()
    local theme = defaults()
    theme.mapStyle = savedMapStyle() or theme.mapStyle
    return theme
end

-- Map screen style chips: only the map style is stored, everything else stays at the config value
RegisterNUICallback('saveTheme', function(data, cb)
    local style = type(data) == 'table' and data.mapStyle or nil
    if MAP_STYLES[style] then
        SetResourceKvp(MAP_STYLE_KEY, json.encode({ mapStyle = style }))
    end
    cb(PM.getTheme())
end)
