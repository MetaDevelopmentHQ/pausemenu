-- Framework bridge. Every bridge file fills Bridges[name] with:
--   detect()                       -> boolean  (is the framework running?)
--   init()                         -> nil      (grabs the core object)
--   getCharacter(src)              -> { name = string, job = string|nil } | nil
--   countJobs(wanted, onDutyOnly)  -> { [jobName] = count } | nil
-- The framework is only used for character name, job label and job counts.

Bridges = {}
Bridge = nil

-- Detection order for 'auto'. Qbox ships a qb-core compatibility layer, so it is checked first.
local AUTO_ORDER = { 'qbox', 'esx', 'qb' }

function SelectBridge()
    local wanted = Config.Framework or 'auto'
    local name = 'standalone'

    if wanted == 'auto' then
        for _, candidate in ipairs(AUTO_ORDER) do
            if Bridges[candidate] and Bridges[candidate].detect() then
                name = candidate
                break
            end
        end
    elseif Bridges[wanted] then
        name = wanted
    end

    Bridge = Bridges[name]
    local ok, err = pcall(Bridge.init)
    if not ok then
        print(L('framework_failed', name, tostring(err)))
        name = 'standalone'
        Bridge = Bridges.standalone
        Bridge.init()
    end

    Bridge.name = name
    print(L('framework_detected', name))
end

--- Returns whether a resource is started.
function IsStarted(resource)
    return GetResourceState(resource) == 'started'
end
