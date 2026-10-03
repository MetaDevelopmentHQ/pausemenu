# Config reference

Everything lives in `config.lua`.

## General

| Option | Default | Description |
|---|---|---|
| `Config.Locale` | `'tr'` | `'tr'` or `'en'` |
| `Config.Style` | `'glass'` | Default pause menu style: `'glass'` or `'minimal'`. Players can override it in Settings → Panel. |
| `Config.Accent` | `'#F5B544'` | Server default accent colour (hex). Players can override it. |
| `Config.Corners` | `'default'` | Server default corner style: `'default'`, `'sharp'`, `'soft'`, `'round'` |
| `Config.ServerName` | `'MetaV Roleplay'` | Shown top left |
| `Config.ShortName` | `'MV'` | Shown in the logo box when there is no logo |
| `Config.Logo` | `nil` | `'web/img/logo.png'` or an https URL |
| `Config.Framework` | `'auto'` | `'auto'`, `'esx'`, `'qb'`, `'qbox'`, `'standalone'` |
| `Config.ShowCredit` | `true` | "MADE BY METADEV" signature |

## Menu entries and keys

```lua
Config.Menu = { map = true, settings = true, rules = true, discord = true }
Config.Keys = { map = 'P', settings = 'F2', rules = 'R', discord = 'D', quit = 'Q' }
```

- Setting an entry to `false` removes it completely and renumbers the rest. **Resume** and **Leave Server** are always there.
- Keys work while the menu is open: letters, digits or `F1`–`F12`. `P` and `F2` open the map / settings directly; `R` and `Q` select Rules / Leave Server (ENTER confirms leaving); `D` opens Discord.
- Rules are hidden automatically if `Config.Rules` is empty, Discord if `Config.DiscordInvite` is empty.

| Option | Default | Description |
|---|---|---|
| `Config.DiscordInvite` | `'https://discord.gg/metav'` | Must be a `discord.gg` or `discord.com` link |
| `Config.ReturnAfterMap` | `true` | Reopen the pause menu after the map is closed |
| `Config.PauseKeyAction` | `'menu'` | What **P** does in game while the menu is closed: `'menu'` opens this menu, `'map'` opens the GTA map |

## Visuals

```lua
Config.Blur = { glassFadeMs = 250, minimalStrength = 0.45 }
Config.HideHud = true
```

- `glassFadeMs`: fade time of the Glass screen blur.
- `minimalStrength`: strength of Minimal's light blur (0.0–1.0).
- `HideHud`: hides radar and HUD while the menu is open.

Players can turn the blur off entirely in Settings → Panel.

## Rules

```lua
Config.Rules = {
    { title = 'Meta-gaming is not allowed', text = "Don't use information your character doesn't know." },
}
```

## Job counts

```lua
Config.Jobs = {
    enabled = true,
    onDutyOnly = true,
    list = {
        { job = 'police',    label = 'Police',   color = '#7AA8FF' },
        { job = 'ambulance', label = 'EMS',      color = '#FF7A7A' },
        { job = 'mechanic',  label = 'Mechanic', color = 'accent' },
    },
}
```

- Up to **4** jobs; extra entries are ignored. Boxes resize to the number of jobs.
- `job` is the job **name** in your framework, `label` is what is shown.
- `color` is a hex colour or `'accent'`.
- `onDutyOnly`: ESX Legacy 1.11+ (`job.onDuty`), QBCore / Qbox (`job.onduty`). Older ESX has no duty flag, so everyone with the job is counted.
- Hidden automatically in standalone.

## Announcements

```lua
Config.Announcements = {
    source = 'config',          -- 'config' or 'discord'
    refreshMinutes = 5,
    discordChannelId = '',
    maxLength = 160,
    static = {
        { title = 'Car meet at Legion Square', text = 'Tonight at 22:00.', date = '2026-10-03' },
    },
}
```

- The last **2** announcements are shown.
- `date` (optional, `YYYY-MM-DD`) on static announcements drives the TODAY / YESTERDAY / date label. Without it the label says NEWS.
- Discord setup: [discord-announcements.md](discord-announcements.md).

## Locked settings

```lua
Config.LockedSettings = {
    targetingMode = { value = 'free', reason = 'Free aim is mandatory on this server.' },
    thirdPersonDistance = 'medium',
}
```

Only settings a script can actually apply can be locked:

| Key | Values |
|---|---|
| `targetingMode` | `'assisted_full'`, `'assisted_partial'`, `'free_assisted'`, `'free'` |
| `thirdPersonDistance` | `'near'`, `'medium'`, `'far'` |

A locked row is grey with a lock icon and shows the reason (or a default text). A locked targeting mode is also re-applied every 5 seconds, so changing it in GTA's own menu doesn't stick.

## Advanced

| Option | Default | Description |
|---|---|---|
| `Config.DataCacheSeconds` | `4` | Cache for player count, jobs and announcements |
| `Config.Debug` | `false` | Prints Discord / job count errors to the console |
