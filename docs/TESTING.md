# In-game test checklist

Run through this after installing or changing the resource.

- [ ] Server console shows `[pausemenu] framework: ...` with the right framework; character name and job in the header are correct
- [ ] `Config.Locale = 'tr'` → after a restart every text is Turkish; `'en'` → English
- [ ] ESC/P opens the menu, GTA's pause menu doesn't open, and closing with ESC doesn't reopen it
- [ ] Map: only the `Config.MapBlips` places are shown, in the right place with the configured icon/color; zone/street name correct; player arrow heading correct
- [ ] `Config.EnableMap = false`: no MAP tab; the Map card and the map key open GTA's original map
- [ ] Locations: the toggle next to a row hides only that entry on the map; the category toggle hides the whole category
- [ ] Map: click → waypoint also shows in GTA; route line follows roads (falls back to a straight line if not, please report)
- [ ] Settings card → GTA's own settings screen opens; closing it returns to the game, and ESC right after doesn't reopen anything by accident
- [ ] Map style choice persists after rejoining
- [ ] Disconnect: first press asks for confirmation, second press disconnects
- [ ] `resmon`: check the values with the menu closed and with the map open
