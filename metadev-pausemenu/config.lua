Config = {}

-- ---------------------------------------------------------------------------
-- General
-- ---------------------------------------------------------------------------

Config.Locale     = 'tr'                -- 'tr' or 'en'
Config.Style      = 'glass'             -- 'glass' or 'minimal' (players can override it in the Panel settings)
Config.Accent     = '#F5B544'           -- server default accent colour (hex)
Config.Corners    = 'default'           -- 'default' (design values), 'sharp', 'soft', 'round'
Config.ServerName = 'MetaV Roleplay'
Config.ShortName  = 'MV'                -- shown instead of a logo when Config.Logo is nil
Config.Logo       = nil                 -- 'web/img/logo.png' (inside this resource) or an https URL
Config.Framework  = 'auto'              -- 'auto', 'esx', 'qb', 'qbox', 'standalone'
Config.ShowCredit = true                -- "MADE BY METADEV" signature in the corner

-- ---------------------------------------------------------------------------
-- Menu entries and shortcuts
-- ---------------------------------------------------------------------------

-- A disabled entry is removed from the menu entirely. "Resume" and "Leave Server" always exist.
Config.Menu = { map = true, settings = true, rules = true, discord = true }

-- Shortcuts while the menu is open. Letters, digits or F1-F12.
Config.Keys = { map = 'P', settings = 'F2', rules = 'R', discord = 'D', quit = 'Q' }

Config.DiscordInvite = 'https://discord.gg/metav'

-- Reopen the pause menu after the player closes the GTA map?
Config.ReturnAfterMap = true

-- P key in game (menu closed): 'menu' opens this menu, 'map' opens the GTA map directly
Config.PauseKeyAction = 'menu'

-- ---------------------------------------------------------------------------
-- Visuals
-- ---------------------------------------------------------------------------

Config.Blur = {
    glassFadeMs     = 250,      -- Glass: TriggerScreenblurFadeIn duration (full blur)
    minimalStrength = 0.45,     -- Minimal: light blur strength (0.0 - 1.0, 'hud_def_blur' timecycle;
                                -- falls back to the Glass screen blur if another timecycle is active)
}

Config.HideHud = true           -- hide radar and HUD while the menu is open

-- ---------------------------------------------------------------------------
-- Rules
-- ---------------------------------------------------------------------------

Config.Rules = {
    { title = 'Meta-gaming yasaktır',    text = 'Karakterinin bilmediği bilgiyi oyunda kullanma.' },
    { title = 'Power-gaming yasaktır',   text = 'Karşı tarafa tepki verme şansı tanı.' },
    { title = 'Yeşil bölgelere saygı',   text = 'Hastane ve karakol çevresinde çatışma başlatılmaz.' },
    { title = 'Fear RP',                 text = 'Silah karşısında karakterinin hayatını önemse.' },
    { title = 'Combat logging yasaktır', text = 'Çatışma ya da RP sırasında oyundan çıkma.' },
    { title = 'Ticket ile bildir',       text = 'Kural ihlallerini Discord üzerinden ilet.' },
}

-- ---------------------------------------------------------------------------
-- Job counts (needs a framework; hidden automatically in standalone)
-- ---------------------------------------------------------------------------

Config.Jobs = {
    enabled    = true,
    onDutyOnly = true,          -- only count players who are on duty
    list = {                    -- max 4. color: hex or 'accent'
        { job = 'police',    label = 'Polis',   color = '#7AA8FF' },
        { job = 'ambulance', label = 'EMS',     color = '#FF7A7A' },
        { job = 'mechanic',  label = 'Mekanik', color = 'accent' },
    },
}

-- ---------------------------------------------------------------------------
-- Announcements
-- ---------------------------------------------------------------------------

Config.Announcements = {
    source           = 'config',    -- 'config' or 'discord'
    refreshMinutes   = 5,           -- how often the Discord channel is fetched
    discordChannelId = '',          -- bot token goes in server.cfg: set metadev_pause_discord_token "..."
    maxLength        = 160,         -- max characters of an announcement body
    -- date (optional, 'YYYY-MM-DD'): used for the "Today / Yesterday / date" label
    static = {
        { title = "Legion Meydanı'nda araç fuarı", text = "Bu akşam 22:00'de. Tüm galeriler ve modifiye ekipleri davetli." },
        { title = 'Ekonomi güncellemesi yayında',  text = 'Meslek maaşları ve market fiyatları yeniden dengelendi.' },
    },
}

-- ---------------------------------------------------------------------------
-- GTA settings locked by the server
-- ---------------------------------------------------------------------------
-- Only settings a script can apply can be locked (see docs/en/config.md):
--   targetingMode       : 'assisted_full', 'assisted_partial', 'free_assisted', 'free'
--   thirdPersonDistance : 'near', 'medium', 'far'
-- Simple:      targetingMode = 'free'
-- With reason: targetingMode = { value = 'free', reason = 'Sunucuda serbest nişan zorunludur.' }
Config.LockedSettings = {
    -- targetingMode = 'free',
}

-- ---------------------------------------------------------------------------
-- Advanced
-- ---------------------------------------------------------------------------

Config.DataCacheSeconds = 4     -- cache time for menu data (player count, jobs, announcements)
Config.Debug = false
