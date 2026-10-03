fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'metadev-pausemenu'
author 'MetaDev'
description 'Pause menu replacing the GTA ESC menu (Glass / Minimal) with a custom settings screen'
version '1.0.0'
license 'MIT'

ui_page 'web/index.html'

shared_scripts {
    'config.lua',
    'locales/locale.lua',
    'locales/tr.lua',
    'locales/en.lua',
}

client_scripts {
    'client/prefs.lua',
    'client/settings.lua',
    'client/menu.lua',
    'client/main.lua',
}

server_scripts {
    'server/bridge/bridge.lua',
    'server/bridge/esx.lua',
    'server/bridge/qb.lua',
    'server/bridge/qbox.lua',
    'server/bridge/standalone.lua',
    'server/jobs.lua',
    'server/announcements.lua',
    'server/main.lua',
}

files {
    'locales/*.json',
    'web/index.html',
    'web/css/*.css',
    'web/js/*.js',
    'web/js/views/*.js',
    'web/fonts/*.woff2',
    'web/img/*',
}
