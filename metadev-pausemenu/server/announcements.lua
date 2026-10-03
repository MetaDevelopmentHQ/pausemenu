-- Announcements: either the static config list or the latest messages of a Discord channel.
-- The bot token is read server-side only, from a server.cfg convar; it never reaches clients.

local MAX_ITEMS = 2
local TITLE_MAX = 80
local cache = nil           -- last valid list fetched from Discord
local activeSource = 'config'

--- UTF-8 safe truncation.
local function truncate(str, max)
    local len = utf8.len(str)
    if len == nil or len <= max then return str end
    local cut = utf8.offset(str, max)
    return str:sub(1, cut - 1):gsub('%s+$', '') .. '…'
end

local function trim(str)
    return (str:gsub('^%s+', ''):gsub('%s+$', ''))
end

--- Strips Discord markdown and mentions, returning plain text.
local function toPlainText(str)
    str = str:gsub('<a?:[%w_]+:%d+>', '')            -- custom emojis
    str = str:gsub('<@[!&]?%d+>', '')                -- user / role mentions
    str = str:gsub('<#%d+>', '')                     -- channel mentions
    str = str:gsub('<t:%d+:?%a?>', '')               -- timestamps
    str = str:gsub('@everyone', ''):gsub('@here', '')
    str = str:gsub('%[([^%]]+)%]%(([^%)]+)%)', '%1') -- [text](link)
    str = str:gsub('```[^`]*```', '')                -- code blocks
    str = str:gsub('[%*_~`|]+', '')                  -- bold, italic, strike, spoiler, inline code
    str = str:gsub('\n%s*#+%s*', '\n'):gsub('^%s*#+%s*', '') -- headings
    str = str:gsub('\n%s*>%s?', '\n'):gsub('^%s*>%s?', '')   -- quotes
    str = str:gsub('\n%s*[%-%*]%s+', '\n• ')         -- bullet points
    str = str:gsub('<(https?://[^>]+)>', '%1')
    str = str:gsub('[ \t]+', ' ')
    return trim(str)
end

--- Converts a Discord message into { title, text, time }; nil when empty.
local function parseMessage(msg)
    local raw = msg.content or ''
    if raw == '' and type(msg.embeds) == 'table' and msg.embeds[1] then
        local embed = msg.embeds[1]
        raw = ('%s\n%s'):format(embed.title or '', embed.description or '')
    end

    local clean = toPlainText(raw)
    if clean == '' then return nil end

    local first, rest = clean:match('^([^\n]+)\n?(.*)$')
    first = trim(first or clean)
    rest = trim((rest or ''):gsub('%s*\n%s*', ' '))

    return {
        title = truncate(first, TITLE_MAX),
        text = truncate(rest, Config.Announcements.maxLength or 160),
        time = msg.timestamp,       -- ISO 8601; the "Today / Yesterday" label is computed in the UI (player's local time)
    }
end

--- Static announcements from the config.
local function staticAnnouncements()
    local list = {}
    for _, item in ipairs(Config.Announcements.static or {}) do
        if #list >= MAX_ITEMS then break end
        list[#list + 1] = {
            title = tostring(item.title or ''),
            text = tostring(item.text or ''),
            date = type(item.date) == 'string' and item.date:match('^%d%d%d%d%-%d%d%-%d%d$') and item.date or nil,
        }
    end
    return list
end

--- Fetches and caches the latest channel messages. On any error it silently falls back to the config list.
local function fetchDiscord(token, channelId)
    local url = ('https://discord.com/api/v10/channels/%s/messages?limit=10'):format(channelId)
    PerformHttpRequest(url, function(status, body)
        if status ~= 200 or not body then
            cache = nil
            if Config.Debug then print(L('discord_http_error', tostring(status))) end
            return
        end

        local ok, messages = pcall(json.decode, body)
        if not ok or type(messages) ~= 'table' then
            cache = nil
            return
        end

        local list = {}
        for _, msg in ipairs(messages) do
            if #list >= MAX_ITEMS then break end
            local parsed = parseMessage(msg)
            if parsed then list[#list + 1] = parsed end
        end
        cache = #list > 0 and list or nil
    end, 'GET', '', {
        ['Authorization'] = 'Bot ' .. token,
        ['User-Agent'] = 'DiscordBot (https://github.com/metadev, 1.0) metadev-pausemenu',
    })
end

--- Announcement list for the UI and where it came from.
---@return table list, string source
function GetAnnouncements()
    if activeSource == 'discord' and cache then
        return cache, 'discord'
    end
    return staticAnnouncements(), 'config'
end

-- Discord poller: only runs when the source is 'discord' and both token and channel are set.
CreateThread(function()
    local cfg = Config.Announcements or {}
    if cfg.source ~= 'discord' then return end

    local token = GetConvar('metadev_pause_discord_token', '')
    local channelId = tostring(cfg.discordChannelId or '')

    if token == '' then print(L('discord_no_token')) return end
    if not channelId:match('^%d+$') then print(L('discord_no_channel')) return end

    activeSource = 'discord'
    local interval = math.max(1, tonumber(cfg.refreshMinutes) or 5) * 60000

    while true do
        fetchDiscord(token, channelId)
        Wait(interval)
    end
end)
