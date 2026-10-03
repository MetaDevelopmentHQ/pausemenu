-- Panel preferences: the player's own settings for this menu.
-- Stored locally with KVP only; never sent to the server and never touches GTA settings.

Prefs = {}

local KVP_KEY = 'metadev_pause:prefs'

-- Allowed values per field. Data coming from the UI is validated against these.
local ALLOWED = {
    layout  = { tabs = true, sidebar = true, list = true },
    corners = { default = true, sharp = true, soft = true, round = true },
    accent  = { default = true, amber = true, mint = true, blue = true, purple = true, coral = true, white = true },
    style   = { default = true, glass = true, minimal = true },
}

local DEFAULTS = {
    layout = 'tabs',
    corners = 'default',
    accent = 'default',
    style = 'default',
    size = 4,           -- 1-10, menu scale
    fontSize = 7,       -- 1-10, text scale
    blur = true,
}

local current = nil

local function clampLevel(value, fallback)
    value = tonumber(value)
    if not value then return fallback end
    return math.max(1, math.min(10, math.floor(value + 0.5)))
end

--- Validates a raw table and fills missing fields with defaults.
local function sanitize(raw)
    raw = type(raw) == 'table' and raw or {}
    local out = {}
    for key, allowed in pairs(ALLOWED) do
        out[key] = allowed[raw[key]] and raw[key] or DEFAULTS[key]
    end
    out.size = clampLevel(raw.size, DEFAULTS.size)
    out.fontSize = clampLevel(raw.fontSize, DEFAULTS.fontSize)
    if type(raw.blur) == 'boolean' then out.blur = raw.blur else out.blur = DEFAULTS.blur end
    return out
end

function Prefs.Get()
    if not current then
        local stored = GetResourceKvpString(KVP_KEY)
        local ok, decoded = pcall(json.decode, stored or '{}')
        current = sanitize(ok and decoded or nil)
    end
    return current
end

function Prefs.Save(raw)
    current = sanitize(raw)
    SetResourceKvp(KVP_KEY, json.encode(current))
    return current
end

--- Pause menu style picked by the player, or the server default.
function Prefs.Style()
    local style = Prefs.Get().style
    if style == 'default' then
        return Config.Style == 'minimal' and 'minimal' or 'glass'
    end
    return style
end
