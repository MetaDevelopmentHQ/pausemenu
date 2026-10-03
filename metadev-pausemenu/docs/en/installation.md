# Installation

## Requirements

- A FiveM server (any recent artifact, `lua54` support)
- Optional: ESX Legacy, QBCore or Qbox for character names, job labels and job counts

## Steps

1. Copy the `metadev-pausemenu` folder into your `resources` directory. Keep the folder name as is.
2. Add it to `server.cfg`, **after** your framework:
   ```cfg
   ensure es_extended        # or qb-core / qbx_core, if you use one
   ensure metadev-pausemenu
   ```
3. Open `config.lua` and set at least:
   - `Config.ServerName`, `Config.ShortName` (or `Config.Logo`)
   - `Config.Accent`
   - `Config.DiscordInvite`
   - `Config.Rules`
   - `Config.Jobs.list` (your framework's job names)
4. Restart the server or run `ensure metadev-pausemenu`.
5. In game press **ESC**: the pause menu should open instead of GTA's.

## Logo

Put your logo in `web/img/` (e.g. `web/img/logo.png`) and set:

```lua
Config.Logo = 'web/img/logo.png'
```

A square image works best. An `https://` URL works too.

## Language

```lua
Config.Locale = 'en'   -- or 'tr'
```

UI strings live in `locales/en.json` / `locales/tr.json`, server/console strings in `locales/en.lua` / `locales/tr.lua`. To add a language, copy both files, translate them and set `Config.Locale` to the new code.

## Announcements from Discord

See [discord-announcements.md](discord-announcements.md).

## Updating

Replace every file except `config.lua` (and your logo). Player preferences are stored on their own PC (KVP) and survive updates.

## Previewing the UI in a browser

From the resource folder run `npx serve .` and open `http://localhost:3000/web/index.html`. Query options: `?style=minimal`, `?screen=settings`, `?lang=en`, `?lock` (shows a locked setting).
