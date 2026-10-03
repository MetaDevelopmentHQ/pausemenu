-- GTA settings bridge.
-- In FiveM, GTA profile settings can be READ with GetProfileSetting but cannot be WRITTEN from scripts.
-- Settings therefore fall into three groups (see docs/en/settings-feasibility.md):
--   1. Read + apply: applied to the session via natives, stored in KVP and re-applied on every join.
--   2. Read only:    the value is shown, with an "Open in GTA settings" shortcut.
--   3. No access:    hidden in the UI.

GameSettings = {}

local KVP_KEY = 'metadev_pause:gta'

-- Group 1 value names <-> native values
local TARGETING = { assisted_full = 0, assisted_partial = 1, free_assisted = 2, free = 3 }
local CAM_DISTANCE = { near = 0, medium = 1, far = 2 }

local saved = nil       -- group 1 values from KVP { targetingMode = 0-3, camDistance = 0-2 }
local locks = {}        -- { targetingMode = { value = n, reason = string|nil } }

-- ---------------------------------------------------------------------------
-- Locks
-- ---------------------------------------------------------------------------

local function parseLock(entry, map)
    local value, reason = entry, nil
    if type(entry) == 'table' then value, reason = entry.value, entry.reason end
    local mapped = map[value]
    if mapped == nil then return nil end
    return { value = mapped, reason = type(reason) == 'string' and reason or nil }
end

local function loadLocks()
    local cfg = Config.LockedSettings or {}
    locks.targetingMode = cfg.targetingMode and parseLock(cfg.targetingMode, TARGETING) or nil
    locks.camDistance = cfg.thirdPersonDistance and parseLock(cfg.thirdPersonDistance, CAM_DISTANCE) or nil
end

--- Locks in the shape the UI expects.
function GameSettings.Locks()
    local out = {}
    for key, lock in pairs(locks) do
        out[key] = { value = lock.value, reason = lock.reason }
    end
    return out
end

-- ---------------------------------------------------------------------------
-- Storage and applying
-- ---------------------------------------------------------------------------

local function getSaved()
    if not saved then
        local ok, decoded = pcall(json.decode, GetResourceKvpString(KVP_KEY) or '{}')
        saved = ok and type(decoded) == 'table' and decoded or {}
    end
    return saved
end

local function inRange(value, min, max)
    value = tonumber(value)
    if not value then return nil end
    value = math.floor(value)
    if value < min or value > max then return nil end
    return value
end

--- Applies group 1 settings (locks win) to the game.
local function applyToGame()
    local s = getSaved()

    local targeting = locks.targetingMode and locks.targetingMode.value or s.targetingMode
    if targeting then SetPlayerTargetingMode(targeting) end

    local distance = locks.camDistance and locks.camDistance.value or s.camDistance
    -- Don't force the camera while the player is in first person (4).
    if distance and GetFollowPedCamViewMode() ~= 4 then SetFollowPedCamViewMode(distance) end
end

--- Validates, stores and applies group 1 values coming from the UI.
---@param values table { targetingMode?, camDistance? }
function GameSettings.Apply(values)
    if type(values) ~= 'table' then return end
    local s = getSaved()

    local targeting = inRange(values.targetingMode, 0, 3)
    if targeting and not locks.targetingMode then s.targetingMode = targeting end

    local distance = inRange(values.camDistance, 0, 2)
    if distance and not locks.camDistance then s.camDistance = distance end

    SetResourceKvp(KVP_KEY, json.encode(s))
    applyToGame()
end

-- ---------------------------------------------------------------------------
-- Reading
-- ---------------------------------------------------------------------------

local function readTargetingMode()
    if locks.targetingMode then return locks.targetingMode.value end
    local s = getSaved()
    if s.targetingMode then return s.targetingMode end
    return GetProfileSetting(0)
end

local function readCamDistance()
    if locks.camDistance then return locks.camDistance.value end
    local mode = GetFollowPedCamViewMode()
    if mode >= 0 and mode <= 2 then return mode end
    return getSaved().camDistance or 1
end

--- Reads the setting values requested by the UI.
---@param request table { profile = { id, ... }, controls = { id, ... } }
function GameSettings.Read(request)
    request = type(request) == 'table' and request or {}
    local result = { profile = {}, controls = {}, special = {} }

    -- Profile settings (numeric ids in a sane range only)
    if type(request.profile) == 'table' then
        for i = 1, math.min(#request.profile, 128) do
            local id = inRange(request.profile[i], 0, 1000)
            if id then result.profile[tostring(id)] = GetProfileSetting(id) end
        end
    end

    -- Key bindings: GetControlInstructionalButton returns codes like "t_W" or "b_100".
    if type(request.controls) == 'table' then
        for i = 1, math.min(#request.controls, 64) do
            local id = inRange(request.controls[i], 0, 400)
            if id then result.controls[tostring(id)] = GetControlInstructionalButton(0, id, true) end
        end
    end

    local width, height = GetActiveScreenResolution()
    result.special = {
        targetingMode = readTargetingMode(),
        camDistance = readCamDistance(),
        resolution = ('%d × %d'):format(width, height),
        aspect = GetAspectRatio(false),
        language = GetCurrentLanguage(),
        metric = ShouldUseMetricMeasurements(),
    }
    return result
end

-- ---------------------------------------------------------------------------
-- Startup
-- ---------------------------------------------------------------------------

loadLocks()

AddEventHandler('playerSpawned', applyToGame)

CreateThread(function()
    Wait(2000)
    applyToGame()

    -- If targeting mode is locked, re-apply it every few seconds (in case it is changed in the GTA menu).
    if not locks.targetingMode then return end
    while true do
        Wait(5000)
        SetPlayerTargetingMode(locks.targetingMode.value)
    end
end)
