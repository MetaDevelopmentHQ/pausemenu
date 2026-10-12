fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'pausemenu'
description 'Custom ESC (pause) menu with map - QBox / QBCore / ESX / standalone'
version '2.0.0'

shared_scripts {
    'config.lua',
    'shared/locale.lua',
}

client_scripts {
    'client/bridge.lua',
    'client/theme.lua',
    'client/map.lua',
    'client/main.lua',
}

server_scripts {
    'server/main.lua',
}

ui_page 'web/dist/index.html'

files {
    'locales/*.json',
    'web/dist/index.html',
    'web/dist/**/*',
}
