local qbx

Bridges.qbox = {
    detect = function()
        return IsStarted('qbx_core')
    end,

    init = function()
        qbx = exports.qbx_core
    end,

    getCharacter = function(src)
        local player = qbx:GetPlayer(src)
        if not player then return nil end
        local data = player.PlayerData
        local info = data.charinfo or {}
        return {
            name = ('%s %s'):format(info.firstname or '', info.lastname or ''):gsub('^%s+', ''):gsub('%s+$', ''),
            job = data.job and data.job.label or nil,
        }
    end,

    countJobs = function(wanted, onDutyOnly)
        local counts = {}
        for _, player in pairs(qbx:GetQBPlayers()) do
            local job = player.PlayerData and player.PlayerData.job
            if job and wanted[job.name] and (not onDutyOnly or job.onduty) then
                counts[job.name] = (counts[job.name] or 0) + 1
            end
        end
        return counts
    end,
}
