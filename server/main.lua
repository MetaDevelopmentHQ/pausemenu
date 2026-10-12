-- A player can only drop THEMSELVES; no target parameter is accepted.
RegisterNetEvent('pausemenu:server:disconnect', function()
    local src = source
    if type(src) ~= 'number' or src <= 0 then return end
    if not GetPlayerName(src) then return end

    DropPlayer(tostring(src), _L(Config.DisconnectMessage or 'disconnect.message'))
end)
