Config = {}

-- Language: 'en' | 'tr'  (file in locales/; add your own e.g. locales/de.json and set 'de')
-- Missing keys in a custom file fall back to English.
Config.Locale = 'en'

-- Framework: 'auto' (detects it) | 'qbox' | 'qb' | 'esx' | 'standalone'
Config.Framework = 'auto'

-- Server name shown in the header
Config.ServerName = 'LOS SANTOS RP'
Config.ServerTagline = 'ROLEPLAY'

-- Theme: accent color (hex). Every amber tone in the UI comes from here.
Config.AccentColor = '#FFB020'

-- Message shown when the player disconnects (a locale key or plain text)
Config.DisconnectMessage = 'disconnect.message'

-- Card texts (fixed order: resume, map, settings, disconnect)
-- title / subtitle: a locale key (translated automatically) or plain text.
-- image: optional path to an image you put inside web/dist (e.g. 'images/map.jpg'). Empty = built-in CSS scene.
Config.Cards = {
    { id = 'resume',     title = 'card.resume',     subtitle = 'card.resume.sub',     image = nil },
    { id = 'map',        title = 'card.map',        subtitle = 'card.map.sub',        image = nil },
    { id = 'settings',   title = 'card.settings',   subtitle = 'card.settings.sub',   image = nil },
    { id = 'disconnect', title = 'card.disconnect', subtitle = 'card.disconnect.sub', image = nil },
}

-- THEME (same for every player; only the map style can be switched by players on the map screen)
Config.DefaultTheme = {
    accent    = Config.AccentColor, -- accent color (hex)
    mapStyle  = 'dark',             -- default map style: 'dark' | 'atlas' | 'satellite'
    scanlines = true,               -- thin line texture
    motion    = true,               -- animations
    blur      = true,               -- background blur
    scale     = 100,                -- UI size: 90 | 100 | 110
}

-- MAP: true = the menu's own map (MAP tab + map card)
--      false = no map in the menu; the map card and the map key open GTA's original pause map instead
Config.EnableMap = true

-- MAP: key that opens the map directly (empty = no default key; players can bind it in FiveM key settings)
Config.MapKeybind = ''

-- MAP: blips shown on the menu's map. Only the places listed here are shown (in-game blips are not read).
-- label: the place name, shown exactly as written
-- category: one of the built-in categories (shown in the menu language):
--   public, finance, shops, vehicle, jobs, fun, transport, property, crime, other
--   Any other text becomes its own category, shown as written. Empty = other.
-- icon options: shield, hospital, flame, landmark, banknote, store, shirt, scissors, pen, crosshair, drama,
-- book, fuel, warehouse, wrench, droplets, car, truck, trash, bus, car-taxi, target, briefcase, laptop, beer,
-- music, film, mic, flag, dumbbell, camera, plane, helicopter, anchor, home, building, leaf, pill, package, key, pin, info, dice, fish, pickaxe, utensils, coffee, gem
--   The icons are from Lucide: https://lucide.dev/icons/  (README.md has a link to each icon above)
--   Only the names above work; an unknown name shows a pin.
-- color: GTA blip color id (https://docs.fivem.net/docs/game-references/blips/#blip-colors)
-- x, y: game coordinates (z is not needed)
Config.MapBlips = {
    -- EXAMPLES: replace with real places on your server
    { label = 'City Hall', category = 'public', icon = 'landmark', color = 0, x = -544.9, y = -204.4 },
    { label = 'DMV',       category = 'public', icon = 'building', color = 3, x = 240.0,  y = -1380.0 },
    -- { label = 'Job Center', category = 'jobs', icon = 'briefcase', color = 5, x = 0.0, y = 0.0 },
}
