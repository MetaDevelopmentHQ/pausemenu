-- No framework: name = FiveM player name, no job, job counts are hidden.
Bridges.standalone = {
    detect = function() return true end,
    init = function() end,

    getCharacter = function(src)
        return { name = GetPlayerName(src), job = nil }
    end,

    countJobs = function()
        return nil
    end,
}
