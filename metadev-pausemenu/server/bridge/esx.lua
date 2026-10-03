local ESX

Bridges.esx = {
    detect = function()
        return IsStarted('es_extended')
    end,

    init = function()
        ESX = exports['es_extended']:getSharedObject()
    end,

    getCharacter = function(src)
        local xPlayer = ESX.GetPlayerFromId(src)
        if not xPlayer then return nil end
        local job = xPlayer.getJob and xPlayer.getJob() or xPlayer.job
        return {
            name = xPlayer.getName(),
            job = job and job.label or nil,
        }
    end,

    countJobs = function(wanted, onDutyOnly)
        local counts = {}
        local players = ESX.GetExtendedPlayers and ESX.GetExtendedPlayers() or nil

        -- Fallback for older ESX versions
        if not players then
            players = {}
            for _, id in ipairs(ESX.GetPlayers()) do
                players[#players + 1] = ESX.GetPlayerFromId(id)
            end
        end

        for _, xPlayer in pairs(players) do
            local job = xPlayer and (xPlayer.getJob and xPlayer.getJob() or xPlayer.job)
            -- ESX Legacy 1.11+ has job.onDuty; older versions don't, so everyone is counted there.
            if job and wanted[job.name] and (not onDutyOnly or job.onDuty ~= false) then
                counts[job.name] = (counts[job.name] or 0) + 1
            end
        end
        return counts
    end,
}
