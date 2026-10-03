# FAQ

**GTA's pause menu still opens.**
Another resource may be handling ESC too (some HUD or phone scripts do). Check for other scripts calling `DisableControlAction(0, 200, ...)` or opening frontend menus. Also make sure `metadev-pausemenu` is started (`ensure`).

**Why can't players change graphics / audio / control settings in the menu?**
FiveM lets scripts read GTA profile settings but not write them. The menu shows the real values and the external-link button (or ENTER) opens GTA's own settings menu. Only targeting mode and third person camera distance have natives and are applied directly. See [settings-feasibility.md](settings-feasibility.md).

**Why are the Advanced graphics tab and most graphics options missing?**
They are stored in `settings.xml`, which no FiveM native can read. Showing made-up values would be worse than hiding them.

**The blur doesn't show / is too strong.**
Players can toggle it in Settings → Panel → Background blur. Glass uses GTA's screen blur (`Config.Blur.glassFadeMs`), Minimal a lighter timecycle blur (`Config.Blur.minimalStrength`). If another script is already using a timecycle modifier, Minimal falls back to the screen blur instead of overwriting it.

**Can I lock free aim?**
Yes: `Config.LockedSettings = { targetingMode = 'free' }`. Note that on keyboard / mouse GTA always uses free aim; the lock matters for gamepad players.

**Job counts are always 0.**
Check that `job` in `Config.Jobs.list` matches the job **name** (not label) in your framework, and whether `onDutyOnly = true` is filtering players out.

**Character name shows the FiveM name.**
That means no framework was detected (standalone). Make sure your framework starts **before** this resource, or set `Config.Framework` explicitly.

**Discord announcements don't appear.**
See the fallback section in [discord-announcements.md](discord-announcements.md). The most common causes are a missing Message Content Intent, the bot not seeing the channel, or using `setr` instead of `set`.

**Where are player preferences stored?**
In the player's own FiveM client (resource KVP). Nothing is stored on the server.

**Does it cost performance?**
While closed, a single light loop disables ESC/P (~0.00–0.01 ms in resmon). Nothing is fetched while the menu is closed. While open, the menu requests data once, then the server answers from a short cache.

**The player is "saved at their location" text on the quit screen isn't true on my server.**
Edit `quit.body` in `locales/en.json` / `locales/tr.json`.
