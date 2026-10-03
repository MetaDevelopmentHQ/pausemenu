-- Server entry point: menu data request and "Leave Server".
-- Nothing coming from the client is trusted; events only ever act on their own source.

local RESOURCE = GetCurrentResourceName()
local REQUEST_COOLDOWN_MS = 1000

local lastRequest = {}      -- [src] = GetGameTimer() of the last request (rate limiting)
local shared = nil          -- cache of the data that is the same for every player
local sharedAt = 0

--- Shared data (city, jobs, announcements), cached for a few seconds.
local function getSharedData()
    local now = GetGameTimer()
    if shared and now - sharedAt < (Config.DataCacheSeconds or 4) * 1000 then
        return shared
    end

    local announcements, source = GetAnnouncements()
    shared = {
        city = {
            online = GetNumPlayerIndices(),
            max = GetConvarInt('sv_maxclients', 48),
        },
        jobs = GetJobCounts(),
        announcements = announcements,
        announceSource = source,
    }
    sharedAt = now
    return shared
end

--- Per-player data (character name, job, ping).
local function getPlayerData(src)
    local ok, character = pcall(Bridge.getCharacter, src)
    if not ok or type(character) ~= 'table' then
        character = { name = GetPlayerName(src), job = nil }
    end

    local name = character.name
    if type(name) ~= 'string' or name == '' then name = GetPlayerName(src) or '?' end

    return {
        id = src,
        name = name,
        job = type(character.job) == 'string' and character.job or nil,
        ping = GetPlayerPing(src),
    }
end

RegisterNetEvent(RESOURCE .. ':server:requestData', function()
    local src = source
    if type(src) ~= 'number' or src <= 0 or not Bridge then return end

    -- Simple rate limit: one request per menu open is all a client needs.
    local now = GetGameTimer()
    if lastRequest[src] and now - lastRequest[src] < REQUEST_COOLDOWN_MS then return end
    lastRequest[src] = now

    local data = getSharedData()
    TriggerClientEvent(RESOURCE .. ':client:data', src, {
        player = getPlayerData(src),
        city = data.city,
        jobs = data.jobs,
        announcements = data.announcements,
        announceSource = data.announceSource,
    })
end)

-- "Leave Server": takes no arguments and only ever drops the player who sent it.
RegisterNetEvent(RESOURCE .. ':server:quit', function()
    local src = source
    if type(src) ~= 'number' or src <= 0 then return end
    DropPlayer(tostring(src), L('quit_reason'))
end)

AddEventHandler('playerDropped', function()
    lastRequest[source] = nil
end)

CreateThread(function()
    -- Give framework resources a moment to start.
    Wait(500)
    SelectBridge()
end)
