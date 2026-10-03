-- Menu data: fetched from the server with a single request and cached briefly.
-- Nothing is fetched while the menu is closed.

MenuData = {}

local RESOURCE = GetCurrentResourceName()
local sessionStart = GetGameTimer()     -- session time counts from the moment the player joined (resource start)
local cached = nil
local cachedAt = 0
local pending = false

--- Sends cached data to the NUI if it is fresh, otherwise asks the server.
function MenuData.Request()
    local now = GetGameTimer()
    if cached and now - cachedAt < (Config.DataCacheSeconds or 4) * 1000 then
        SendNUIMessage({ action = 'data', data = cached })
        return
    end
    if pending then return end
    pending = true
    TriggerServerEvent(RESOURCE .. ':server:requestData')

    -- Don't stay stuck if the server never answers.
    SetTimeout(3000, function() pending = false end)
end

RegisterNetEvent(RESOURCE .. ':client:data', function(data)
    pending = false
    if type(data) ~= 'table' then return end
    cached, cachedAt = data, GetGameTimer()
    if MenuIsOpen() then
        SendNUIMessage({ action = 'data', data = data })
    end
end)

--- Clock info: in-game city time and session length (seconds).
function MenuData.Clock()
    return {
        gameHour = GetClockHours(),
        gameMinute = GetClockMinutes(),
        session = math.floor((GetGameTimer() - sessionStart) / 1000),
    }
end
