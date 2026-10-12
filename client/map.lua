PM = PM or {}

---------------------------------------------------------------------------
-- MAP
-- Only the places listed in Config.MapBlips are shown (in-game blips are not read).
-- Config.EnableMap = false: the menu has no map; the map card / key open GTA's own pause map.
---------------------------------------------------------------------------
local mapActive = false
local WORLD = { minX = -5000.0, maxX = 6500.0, minY = -4500.0, maxY = 8500.0 } -- used to validate waypoints

local function round1(v) return math.floor(v * 10 + 0.5) / 10 end

function PM.isMapEnabled()
    return Config.EnableMap ~= false
end

-- Closes our menu (if open) and opens GTA's own pause menu, which starts on the map
function PM.openNativeMap()
    PM.closeMenu(0.0)
    ActivateFrontendMenu(GetHashKey('FE_MENU_VERSION_MP_PAUSE'), false, -1)
end

-- Built-in categories: short name in config ('shops') -> translated name (locale key 'cat.shops')
local CATEGORIES = {
    public = true, finance = true, shops = true, vehicle = true, jobs = true,
    fun = true, transport = true, property = true, crime = true, other = true,
}

-- 'shops' -> translated built-in category; any other text is shown as written
local function categoryName(c)
    if type(c) ~= 'string' or c == '' then c = 'other' end
    local id = c:lower():gsub('^cat%.', '')
    if CATEGORIES[id] then return _L('cat.' .. id) end
    return c
end

-- Config.MapBlips -> UI list (translated once; invalid entries are skipped)
local configBlips = nil

local function mapBlips()
    if configBlips then return configBlips end
    configBlips = {}
    for _, b in ipairs(Config.MapBlips or {}) do
        if type(b) == 'table' and type(b.x) == 'number' and type(b.y) == 'number' and type(b.label) == 'string' then
            configBlips[#configBlips + 1] = {
                x = b.x, y = b.y, label = b.label,
                category = categoryName(b.category),
                icon = type(b.icon) == 'string' and b.icon or 'pin',
                color = type(b.color) == 'number' and b.color or 0,
            }
        end
    end
    return configBlips
end

local function waypointCoords()
    if not IsWaypointActive() then return nil end
    local blip = GetFirstBlipInfoId(8) -- radar_waypoint
    if blip == 0 then return nil end
    local c = GetBlipInfoIdCoord(blip)
    return { x = round1(c.x), y = round1(c.y) }
end

-- Samples the GPS route into points (GTA's own road route).
-- slotType: 0 = waypoint, 1 = radar blip, 2 = discrete (docs.fivem.net). 0 is tried first; the working slot is remembered.
local routeSlot = nil
local ROUTE_TIMEOUT_MS = 3000
local pendingWp, pendingSince = nil, 0 -- avoids falling back to a straight line while GTA is still computing the route

local function sampleRoute(wp, px, py)
    if not wp then
        pendingWp = nil
        return nil
    end
    local wpKey = wp.x .. ',' .. wp.y
    if pendingWp ~= wpKey then
        pendingWp, pendingSince = wpKey, GetGameTimer()
    end

    local length = GetGpsBlipRouteLength()
    if GetGpsBlipRouteFound() and length and length > 0 then
        local step = math.max(25.0, length / 150.0)
        local slots = routeSlot and { routeSlot } or { 0, 1, 2 }
        for _, slot in ipairs(slots) do
            local points = { { round1(px), round1(py) } }
            local d = step
            while d < length do
                local ok, pos = GetPosAlongGpsTypeRoute(true, d, slot)
                if not ok or not pos then break end
                points[#points + 1] = { round1(pos.x), round1(pos.y) }
                d = d + step
            end
            if #points > 2 then
                routeSlot = slot
                points[#points + 1] = { wp.x, wp.y }
                return points
            end
        end
    end
    -- GTA may still be computing the route: wait briefly (nil = UI draws no line)
    if GetGameTimer() - pendingSince < ROUTE_TIMEOUT_MS then
        return nil
    end
    -- Fallback: no road found (e.g. off-road area) -> straight line from player to waypoint
    return { { round1(px), round1(py) }, { wp.x, wp.y } }
end

local function locationNames(coords)
    local zone = GetNameOfZone(coords.x, coords.y, coords.z)
    local zoneName = zone and GetLabelText(zone) or ''
    if zoneName == 'NULL' then zoneName = zone or '' end
    local streetHash = GetStreetNameAtCoord(coords.x, coords.y, coords.z)
    local street = streetHash and GetStreetNameFromHashKey(streetHash) or ''
    return zoneName, street
end

local function playerState()
    local ped = PlayerPedId()
    local c = GetEntityCoords(ped)
    local zone, street = locationNames(c)
    return {
        x = round1(c.x), y = round1(c.y), heading = round1(GetEntityHeading(ped)),
        zone = zone, street = street,
    }, c
end

local function sendUpdate(withRoute)
    local p, c = playerState()
    local wp = waypointCoords()
    SendNUIMessage({
        action = 'mapUpdate',
        data = {
            player = p,
            waypoint = wp,
            route = withRoute and sampleRoute(wp, c.x, c.y) or nil,
        },
    })
end

function PM.stopMapLoop()
    mapActive = false
end

local function startMapLoop()
    if mapActive then return end
    mapActive = true
    CreateThread(function()
        local tick = 0
        while mapActive and PM.isOpen() do
            sendUpdate(tick % 5 == 0) -- position every 200 ms, route once per second
            tick = tick + 1
            Wait(200)
        end
        mapActive = false
    end)
end

RegisterNUICallback('mapOpen', function(_, cb)
    cb('ok')
    if not PM.isMapEnabled() then return end
    sendUpdate(true)
    startMapLoop()
    SendNUIMessage({ action = 'mapData', data = { locations = mapBlips() } })
end)

RegisterNUICallback('mapClose', function(_, cb)
    PM.stopMapLoop()
    cb('ok')
end)

RegisterNUICallback('setWaypoint', function(data, cb)
    cb('ok')
    if type(data) ~= 'table' then return end
    local x, y = tonumber(data.x), tonumber(data.y)
    if not x or not y or x ~= x or y ~= y then return end -- not a number / NaN
    if x < WORLD.minX or x > WORLD.maxX or y < WORLD.minY or y > WORLD.maxY then return end
    SetNewWaypoint(x, y)
    SetTimeout(100, function() if mapActive then sendUpdate(true) end end)
end)

RegisterNUICallback('clearWaypoint', function(_, cb)
    cb('ok')
    SetWaypointOff()
    SetTimeout(100, function() if mapActive then sendUpdate(true) end end)
end)
