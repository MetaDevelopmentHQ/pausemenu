<div align="center">

<img src="docs/images/kapak.png" alt="MetaDev Pause Menu" width="100%">

# MetaDev Pause Menu

**Players hit ESC dozens of times a day. Now they see your server, not GTA's menu.**

A free, open source FiveM pause menu that replaces GTA's ESC menu, with redesigned settings and per-player customization.

[![License: MIT](https://img.shields.io/badge/License-MIT-8B5CF6.svg)](LICENSE)
[![FiveM](https://img.shields.io/badge/FiveM-Ready-22C3E6.svg)](#installation)
[![Frameworks](https://img.shields.io/badge/ESX%20%C2%B7%20QBCore%20%C2%B7%20Qbox%20%C2%B7%20Standalone-supported-8B5CF6.svg)](#frameworks)
[![Discord](https://img.shields.io/badge/Discord-Join-5865F2.svg)](https://discord.gg/metadev)

**English** · [Türkçe](README.tr.md)

</div>

---

## Features

### Your server's second face
Press ESC and see the city at a glance: character card, players online, on-duty job counts and the latest announcements, pulled automatically from your Discord channel.

### Redesigned settings
GTA's settings menu rebuilt in the same clean interface: controls, keyboard and mouse, key bindings, audio, camera, display, graphics, advanced graphics and voice chat.

### Every player makes it their own
The **Panel** tab lets each player choose their accent color, corner style, menu layout, menu size, text size, background blur and even the menu style. Stored on their own computer only; it never touches the game's settings.

### Built for server owners
- Turn the **Rules**, **Discord**, **Map** and **Settings** buttons on or off
- Choose which job counts are shown (up to 4), or hide them
- The **Discord** button opens your invite link directly in the player's browser
- Announcements from a **Discord channel** or from your config
- Lock specific GTA settings server-wide (e.g. free aim only)
- **2 designs:** Glass and Minimal

### Feels native
- The game keeps running behind the menu, blurred with GTA's own screen blur
- Full keyboard and mouse support: `↑ ↓` select, `← →` change, `Q` `E` category, `Enter` confirm, `Esc` back
- Almost zero resource usage while closed

## Screenshots

| Glass | Minimal |
|---|---|
| ![Glass](docs/images/glass.png) | ![Minimal](docs/images/minimal.png) |

![Settings](docs/images/ayarlar.png)

## Installation

1. Download the [latest release](../../releases/latest) and extract it into your `resources` folder.
2. Make sure the folder is named `metadev-pausemenu`.
3. Add this line to your `server.cfg`:
   ```cfg
   ensure metadev-pausemenu
   ```
4. Restart your server. Done.

> Pairs perfectly with [MetaDev Loadscreen](https://github.com/MetaDevelopmentHQ), built in the same design language.

## Configuration

Open `config.lua`:

```lua
Config.Locale        = 'en'                 -- 'en' or 'tr'
Config.Style         = 'glass'              -- 'glass' or 'minimal' (players can change it)
Config.Accent        = '#F5B544'
Config.ServerName    = 'Your Server'
Config.Framework     = 'auto'               -- 'auto', 'esx', 'qb', 'qbox', 'standalone'
Config.DiscordInvite = 'https://discord.gg/yourserver'

Config.Menu = { map = true, settings = true, rules = true, discord = true }

Config.Jobs = {
  enabled = true,
  onDutyOnly = true,
  list = {                                  -- up to 4
    { job = 'police',    label = 'Police',   color = '#7AA8FF' },
    { job = 'ambulance', label = 'EMS',      color = '#FF7A7A' },
    { job = 'mechanic',  label = 'Mechanic', color = 'accent'  },
  },
}
```

### Discord announcements

1. Create a bot in the [Discord Developer Portal](https://discord.com/developers/applications) and invite it to your server with permission to read your announcements channel.
2. Put the token in `server.cfg`. It never reaches players:
   ```cfg
   set metadev_pause_discord_token "YOUR_BOT_TOKEN"
   ```
3. In `config.lua`, set `Config.Announcements.source = 'discord'` and your channel ID.

## Frameworks

Works standalone. If `Config.Framework` is `auto`, ESX, QBCore and Qbox are detected automatically. The framework is only used for the character name, job and job counts; in standalone mode those parts are hidden automatically.

## FAQ

**Is it really free?**
Yes. Free and open source under the MIT license.

**Does the game pause?**
No. Like GTA Online, the world keeps going. Player controls are locked while the menu is open.

**Some settings show "Open in GTA settings". Why?**
Not every GTA setting can be changed by a script. Those settings show their current value and open the matching page in GTA's own settings.

**Can players change the colors?**
Yes. Each player can pick their own accent color and style from the Panel tab. Your server's choice stays the default for everyone else.

## Support

Questions and bug reports: **[discord.gg/metadev](https://discord.gg/metadev)**

Found a bug? [Open an issue](../../issues).

## License

[MIT](LICENSE) © MetaDev
