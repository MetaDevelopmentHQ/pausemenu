-- Client entry point: ESC takeover, open/close, background blur, map and GTA settings flows.

local RESOURCE = GetCurrentResourceName()

local isOpen = false
local suppressUntil = 0     -- ESC/P won't open the menu before this time (stops the closing key leaking into the game)
local frontendBusy = false  -- true while the GTA map or GTA settings are opening/open
local blurMode = nil        -- 'screen' (Glass) | 'timecycle' (Minimal) | nil

local CONTROL_PAUSE = 200   -- ESC
local CONTROL_MAP = 199     -- P

-- Controls locked while the menu is open: movement, sprint, jump, attack, aim, melee, weapon wheel, vehicle.
-- Camera controls (1, 2) are left alone.
local LOCKED_CONTROLS = {
    21, 22, 23, 24, 25, 30, 31, 32, 33, 34, 35, 36, 37, 44, 45, 47, 58, 59, 60, 63, 64,
    68, 69, 70, 71, 72, 75, 76, 91, 92, 106, 114, 140, 141, 142, 143, 199, 200, 202,
    257, 263, 264, 331,
}

function MenuIsOpen()
    return isOpen
end

-- ---------------------------------------------------------------------------
-- Background blur (done with GTA's own screen effects, not CSS)
-- ---------------------------------------------------------------------------

local function startBlur()
    if blurMode or not Prefs.Get().blur then return end
    -- Minimal uses a light blur: TriggerScreenblurFadeIn has no strength control, so the
    -- 'hud_def_blur' timecycle (used by the GTA pause menu) is applied at low strength.
    -- If another script already uses a timecycle we don't touch it and use the screen blur instead.
    if Prefs.Style() == 'minimal' and GetTimecycleModifierIndex() == -1 then
        SetTimecycleModifier('hud_def_blur')
        SetTimecycleModifierStrength(Config.Blur.minimalStrength or 0.45)
        blurMode = 'timecycle'
    else
        TriggerScreenblurFadeIn(Config.Blur.glassFadeMs or 250)
        blurMode = 'screen'
    end
end

local function stopBlur()
    if blurMode == 'screen' then
        TriggerScreenblurFadeOut(Config.Blur.glassFadeMs or 250)
    elseif blurMode == 'timecycle' then
        ClearTimecycleModifier()
    end
    blurMode = nil
end

-- ---------------------------------------------------------------------------
-- Open / close
-- ---------------------------------------------------------------------------

local CloseMenu

--- Per-frame loop while the menu is open: locks controls and pushes the clock.
local function openLoop()
    CreateThread(function()
        local nextClock = 0
        local playerId = PlayerId()
        while isOpen do
            for i = 1, #LOCKED_CONTROLS do
                DisableControlAction(0, LOCKED_CONTROLS[i], true)
            end
            DisablePlayerFiring(playerId, true)
            if Config.HideHud then HideHudAndRadarThisFrame() end

            local now = GetGameTimer()
            if now >= nextClock then
                nextClock = now + 1000
                SendNUIMessage({ action = 'clock', clock = MenuData.Clock() })
            end
            Wait(0)
        end
    end)
end

---@param screen? string 'menu' | 'settings'
local function OpenMenu(screen)
    if isOpen or frontendBusy or IsPauseMenuActive() then return end
    isOpen = true

    SetNuiFocus(true, true)
    SendNUIMessage({
        action = 'open',
        style = Prefs.Style(),
        screen = screen or 'menu',
        clock = MenuData.Clock(),
    })
    startBlur()
    MenuData.Request()
    openLoop()
end

CloseMenu = function()
    if not isOpen then return end
    isOpen = false
    suppressUntil = GetGameTimer() + 400
    SetNuiFocus(false, false)
    SendNUIMessage({ action = 'close' })
    stopBlur()
end

-- ---------------------------------------------------------------------------
-- GTA's own menus (map, settings)
-- ---------------------------------------------------------------------------

--- Opens a GTA frontend menu and optionally comes back to our menu once it closes.
---@param menuName string frontend menu name
---@param goDeeper boolean enter the first tab (used for the map)
---@param returnScreen string|nil screen to reopen when the frontend closes
local function openFrontend(menuName, goDeeper, returnScreen)
    CloseMenu()
    frontendBusy = true

    CreateThread(function()
        Wait(50)
        ActivateFrontendMenu(GetHashKey(menuName), false, -1)

        local started = GetGameTimer()
        while not IsPauseMenuActive() and GetGameTimer() - started < 1500 do Wait(0) end

        if goDeeper then
            -- The first tab of the MP pause menu is the map; going one level deeper opens it full screen.
            Wait(100)
            PauseMenuceptionGoDeeper(0)
        end

        while IsPauseMenuActive() do
            -- In the map ESC/P would normally go back to the tab bar; close the frontend directly instead.
            if goDeeper and (IsControlJustPressed(0, CONTROL_PAUSE) or IsControlJustPressed(0, CONTROL_MAP)) then
                SetFrontendActive(false)
            end
            Wait(0)
        end

        suppressUntil = GetGameTimer() + 400
        frontendBusy = false

        if returnScreen then
            Wait(150)
            OpenMenu(returnScreen)
        end
    end)
end

local function openMap(returnToMenu)
    openFrontend('FE_MENU_VERSION_MP_PAUSE', true, returnToMenu and 'menu' or nil)
end

-- ---------------------------------------------------------------------------
-- ESC takeover (runs while the menu is closed too, so it is kept as light as possible)
-- ---------------------------------------------------------------------------

CreateThread(function()
    while true do
        if IsPauseMenuActive() or frontendBusy then
            -- A GTA menu (map, GTA settings) is open: leave the keys alone.
            Wait(0)
        else
            DisableControlAction(0, CONTROL_PAUSE, true)
            DisableControlAction(0, CONTROL_MAP, true)

            if not isOpen and GetGameTimer() > suppressUntil then
                if IsDisabledControlJustReleased(0, CONTROL_PAUSE) then
                    OpenMenu('menu')
                elseif IsDisabledControlJustReleased(0, CONTROL_MAP) then
                    if Config.PauseKeyAction == 'map' then openMap(false) else OpenMenu('menu') end
                end
            end
            Wait(0)
        end
    end
end)

-- ---------------------------------------------------------------------------
-- NUI
-- ---------------------------------------------------------------------------

--- Turns Config.Logo into a URL the NUI page can load.
local function logoUrl()
    local logo = Config.Logo
    if type(logo) ~= 'string' or logo == '' then return nil end
    if logo:match('^https?://') then return logo end
    -- 'web/img/logo.png' -> 'img/logo.png' (index.html lives in web/)
    return (logo:gsub('^web/', ''))
end

local function loadLocale()
    local raw = LoadResourceFile(RESOURCE, ('locales/%s.json'):format(Config.Locale))
        or LoadResourceFile(RESOURCE, 'locales/en.json')
    local ok, decoded = pcall(json.decode, raw or '{}')
    return ok and decoded or {}
end

--- Config values the UI needs (all of them are already public on the client).
local function initPayload()
    return {
        locale = Config.Locale,
        strings = loadLocale(),
        config = {
            serverName = Config.ServerName,
            shortName = Config.ShortName,
            logo = logoUrl(),
            accent = Config.Accent,
            style = Config.Style,
            corners = Config.Corners,
            menu = Config.Menu,
            keys = Config.Keys,
            discordInvite = Config.DiscordInvite,
            rules = Config.Rules,
            showCredit = Config.ShowCredit ~= false,
            jobsEnabled = Config.Jobs and Config.Jobs.enabled or false,
            transitionMs = 180,
        },
        prefs = Prefs.Get(),
        locks = GameSettings.Locks(),
    }
end

RegisterNUICallback('ready', function(_, cb)
    cb(initPayload())
end)

RegisterNUICallback('close', function(_, cb)
    CloseMenu()
    cb(true)
end)

RegisterNUICallback('openMap', function(_, cb)
    cb(true)
    if Config.Menu.map == false then return end
    openMap(Config.ReturnAfterMap ~= false)
end)

-- Group 2 settings: opens GTA's own settings menu and returns to our settings screen when it closes.
RegisterNUICallback('openGtaSettings', function(data, cb)
    cb(true)
    local menuName = (type(data) == 'table' and data.section == 'keys')
        and 'FE_MENU_VERSION_LANDING_KEYMAPPING_MENU'
        or 'FE_MENU_VERSION_LANDING_MENU'
    openFrontend(menuName, false, 'settings')
end)

RegisterNUICallback('quit', function(_, cb)
    cb(true)
    TriggerServerEvent(RESOURCE .. ':server:quit')
end)

RegisterNUICallback('getGameSettings', function(data, cb)
    cb(GameSettings.Read(data))
end)

RegisterNUICallback('applyGameSettings', function(data, cb)
    GameSettings.Apply(data)
    cb(true)
end)

RegisterNUICallback('savePrefs', function(data, cb)
    local before = Prefs.Get()
    local beforeBlur, beforeStyle = before.blur, Prefs.Style()
    local saved = Prefs.Save(data)

    -- Reflect blur or style changes right away while the menu is open.
    if isOpen and (saved.blur ~= beforeBlur or Prefs.Style() ~= beforeStyle) then
        stopBlur()
        startBlur()
    end
    cb(saved)
end)

AddEventHandler('onResourceStop', function(resource)
    if resource ~= RESOURCE then return end
    if isOpen then SetNuiFocus(false, false) end
    stopBlur()
end)
