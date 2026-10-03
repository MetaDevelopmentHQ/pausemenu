Locales = Locales or {}

Locales.en = {
    quit_reason        = 'You left the server. See you soon!',
    discord_no_token   = '[metadev-pausemenu] Announcement source is "discord" but the metadev_pause_discord_token convar is empty. Falling back to config announcements.',
    discord_no_channel = '[metadev-pausemenu] Config.Announcements.discordChannelId is empty. Falling back to config announcements.',
    discord_http_error = '[metadev-pausemenu] Could not fetch Discord announcements (HTTP %s). Falling back to config announcements.',
    framework_detected = '[metadev-pausemenu] Framework: %s',
    framework_failed   = '[metadev-pausemenu] Could not start the %s bridge, using standalone: %s',
    jobs_failed        = '[metadev-pausemenu] Job count failed: %s',
}
