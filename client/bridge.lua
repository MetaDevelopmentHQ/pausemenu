PM = PM or {}

---------------------------------------------------------------------------
-- FRAMEWORK BRIDGE: QBox, QBCore, ESX or no framework (standalone)
-- With Config.Framework = 'auto' the running framework is detected automatically.
-- Using a custom framework? Add a reader to the `readers` table below.
---------------------------------------------------------------------------
local framework = nil
local QBCore, ESX = nil, nil

local function started(resource)
    return GetResourceState(resource) == 'started'
end

local function detect()
    local wanted = Config.Framework or 'auto'
    if wanted ~= 'auto' then return wanted end
    if started('qbx_core') then return 'qbox' end     -- checked first because QBox also provides qb-core compatibility
    if started('qb-core') then return 'qb' end
    if started('es_extended') then return 'esx' end
    return 'standalone'
end

function PM.getFramework()
    if not framework then
        framework = detect()
        print(('[pausemenu] framework: %s'):format(framework))
    end
    return framework
end

local function joinName(first, last)
    local name = ('%s %s'):format(first or '', last or ''):gsub('^%s+', ''):gsub('%s+$', '')
    return name ~= '' and name or nil
end

local function joinJob(label, grade)
    if type(label) ~= 'string' or label == '' then return nil end
    if type(grade) == 'string' and grade ~= '' and grade ~= label then
        return ('%s · %s'):format(label, grade)
    end
    return label
end

-- QBCore and QBox share the same PlayerData shape (charinfo, job.label, job.grade.name)
local function fromQbData(pd)
    if type(pd) ~= 'table' then return nil, nil end
    local ci, job = pd.charinfo, pd.job
    local name = type(ci) == 'table' and joinName(ci.firstname, ci.lastname) or nil
    local grade = type(job) == 'table' and type(job.grade) == 'table' and job.grade.name or nil
    return name, type(job) == 'table' and joinJob(job.label, grade) or nil
end

local readers = {
    qbox = function()
        return fromQbData(exports.qbx_core:GetPlayerData())
    end,
    qb = function()
        QBCore = QBCore or exports['qb-core']:GetCoreObject()
        return fromQbData(QBCore.Functions.GetPlayerData())
    end,
    esx = function()
        ESX = ESX or exports['es_extended']:getSharedObject()
        local pd = ESX.GetPlayerData()
        if type(pd) ~= 'table' then return nil, nil end
        local job = pd.job
        return joinName(pd.firstName, pd.lastName), type(job) == 'table' and joinJob(job.label, job.grade_label) or nil
    end,
    standalone = function()
        return nil, nil
    end,
}

-- Player info for the header. Falls back to the FiveM player name if framework data can't be read.
function PM.getPlayerInfo()
    local fw = PM.getFramework()
    local name, job
    local ok, n, j = pcall(readers[fw] or readers.standalone)
    if ok then name, job = n, j end
    return {
        name = name or GetPlayerName(PlayerId()),
        id = GetPlayerServerId(PlayerId()),
        job = job,
    }
end
