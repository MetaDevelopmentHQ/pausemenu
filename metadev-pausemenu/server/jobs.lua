-- Job counts. Counting happens on the server; the result is cached together with the shared menu data.

local MAX_JOBS = 4
local jobList = {}      -- validated Config.Jobs.list
local wanted = {}       -- { [jobName] = true }

local function isHex(color)
    return type(color) == 'string' and color:match('^#%x%x%x%x%x%x$') ~= nil
end

--- Validates Config.Jobs.list and trims it to 4 entries.
local function buildJobList()
    jobList, wanted = {}, {}
    if not (Config.Jobs and Config.Jobs.enabled) then return end

    for _, entry in ipairs(Config.Jobs.list or {}) do
        if #jobList >= MAX_JOBS then break end
        if type(entry.job) == 'string' and entry.job ~= '' then
            jobList[#jobList + 1] = {
                job = entry.job,
                label = tostring(entry.label or entry.job),
                color = (entry.color == 'accent' or isHex(entry.color)) and entry.color or 'accent',
            }
            wanted[entry.job] = true
        end
    end
end

--- Job list for the UI; nil when disabled or when no framework is running.
---@return table|nil
function GetJobCounts()
    if #jobList == 0 or not Bridge or Bridge.name == 'standalone' then return nil end

    local ok, counts = pcall(Bridge.countJobs, wanted, Config.Jobs.onDutyOnly ~= false)
    if not ok or type(counts) ~= 'table' then
        if Config.Debug then print(L('jobs_failed', tostring(counts))) end
        return nil
    end

    local result = {}
    for i, entry in ipairs(jobList) do
        result[i] = { label = entry.label, color = entry.color, count = counts[entry.job] or 0 }
    end
    return result
end

buildJobList()
