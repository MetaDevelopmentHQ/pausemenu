PM = PM or {} -- shared table across client files (bridge / theme / map / main)

local isOpen = false
local pauseWasActive = false
local blockUntil = 0 -- don't reopen from the same ESC press right after the menu/native menu closed

local CONTROL_PAUSE = 199     -- INPUT_FRONTEND_PAUSE (P)
local CONTROL_PAUSE_ALT = 200 -- INPUT_FRONTEND_PAUSE_ALTERNATE (ESC)
local BLUR_MS = 250.0

local ALLOWED_ACTIONS = { resume = true, disconnect = true, settings = true, map = true }

RegisterNUICallback('action', function(data, cb)
    cb('ok')

    local id = type(data) == 'table' and data.id or nil
    if type(id) ~= 'string' or not ALLOWED_ACTIONS[id] then return end

    if id == 'resume' then
        PM.closeMenu()
    elseif id == 'map' then
        PM.openNativeMap() -- only sent when Config.EnableMap = false
    elseif id == 'settings' then
        PM.openNativeSettings()
    elseif id == 'disconnect' then
        PM.closeMenu(0.0)
        TriggerServerEvent('pausemenu:server:disconnect')
    end
end)

---------------------------------------------------------------------------
-- OPEN / CLOSE MENU (also used by map.lua through PM)
---------------------------------------------------------------------------
function PM.isOpen()
    return isOpen
end

-- Card title/subtitle may be locale keys or plain text
local function localizedCards()
    local list = {}
    for i, c in ipairs(Config.Cards or {}) do
        list[i] = { id = c.id, title = _L(c.title or ''), subtitle = _L(c.subtitle or ''), image = c.image }
    end
    return list
end

-- opts: { tab = 'main' | 'map' }
function PM.openMenu(opts)
    if isOpen then return end
    isOpen = true
    opts = opts or {}

    local theme = PM.getTheme()
    SendNUIMessage({
        action = 'open',
        data = {
            player = PM.getPlayerInfo(),
            server = { name = Config.ServerName, tagline = Config.ServerTagline },
            accent = theme.accent,
            cards = localizedCards(),
            locale = Locale,
            theme = theme,
            mapEnabled = PM.isMapEnabled(),
            initialTab = (opts.tab == 'map' and PM.isMapEnabled()) and 'map' or 'main',
        },
    })
    SetNuiFocus(true, true)
    if theme.blur then
        TriggerScreenblurFadeIn(BLUR_MS)
    end
end

function PM.closeMenu(blurTime)
    if not isOpen then return end
    isOpen = false
    blockUntil = GetGameTimer() + 300 -- don't reopen when ESC is pressed in the UI and released in game

    PM.stopMapLoop()
    SetNuiFocus(false, false)
    TriggerScreenblurFadeOut(blurTime or BLUR_MS)
    SendNUIMessage({ action = 'close' })
end

-- Closes our menu and opens GTA's own settings screen; closing that screen returns to the game.
function PM.openNativeSettings()
    PM.closeMenu(0.0)
    ActivateFrontendMenu(GetHashKey('FE_MENU_VERSION_LANDING_MENU'), false, -1)
end

-- ESC / P capture: blocks the native pause menu and opens ours instead.
-- This loop must run every frame (DisableControlAction is per-frame); the work per frame is tiny.
CreateThread(function()
    while true do
        Wait(0)

        local pauseActive = IsPauseMenuActive()
        if pauseWasActive and not pauseActive then
            blockUntil = GetGameTimer() + 300
        end
        pauseWasActive = pauseActive

        if not pauseActive then
            DisableControlAction(0, CONTROL_PAUSE, true)
            DisableControlAction(0, CONTROL_PAUSE_ALT, true)

            if not isOpen
                and GetGameTimer() > blockUntil
                and (IsDisabledControlJustPressed(0, CONTROL_PAUSE_ALT) or IsDisabledControlJustPressed(0, CONTROL_PAUSE))
                and not IsNuiFocused()
            then
                PM.openMenu()
            end
        end
    end
end)

-- Key that opens the map directly (no default key when Config.MapKeybind is empty)
RegisterCommand('pausemenu_map', function()
    if not isOpen and not IsPauseMenuActive() and not IsNuiFocused() then
        if PM.isMapEnabled() then
            PM.openMenu({ tab = 'map' })
        else
            PM.openNativeMap()
        end
    end
end, false)
if type(Config.MapKeybind) == 'string' and Config.MapKeybind ~= '' then
    RegisterKeyMapping('pausemenu_map', _L('keymap.open_map'), 'keyboard', Config.MapKeybind)
end

RegisterNUICallback('close', function(_, cb)
    PM.closeMenu()
    cb('ok')
end)

AddEventHandler('onResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end
    if isOpen then
        SetNuiFocus(false, false)
        TriggerScreenblurFadeOut(0.0)
    end
end)
