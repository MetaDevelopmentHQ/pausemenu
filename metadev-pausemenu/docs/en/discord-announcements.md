# Discord announcements

The server reads the latest messages of one Discord channel and shows the last 2 in the menu. The bot token never leaves the server.

## 1. Create a bot

1. Go to <https://discord.com/developers/applications> → **New Application**, give it a name.
2. Open **Bot** → **Reset Token** → copy the token. Keep it secret.
3. Under **Privileged Gateway Intents** enable **Message Content Intent** (without it, message text comes back empty).

## 2. Invite the bot to your Discord server

1. **OAuth2 → URL Generator** → scope **bot**.
2. Permissions: **View Channels** and **Read Message History**.
3. Open the generated URL and add the bot to your server.
4. Make sure the bot can see the announcement channel (channel permissions).

## 3. Get the channel ID

1. Discord → **User Settings → Advanced → Developer Mode** on.
2. Right click the announcement channel → **Copy Channel ID**.

## 4. Configure

`server.cfg` (use `set`, **not** `setr`, so it is never sent to clients):

```cfg
set metadev_pause_discord_token "YOUR_BOT_TOKEN"
ensure metadev-pausemenu
```

`config.lua`:

```lua
Config.Announcements = {
    source = 'discord',
    refreshMinutes = 5,
    discordChannelId = '123456789012345678',
    maxLength = 160,
    static = { ... },   -- still used as fallback
}
```

## How messages are shown

- The first line of a message becomes the **title**, the rest the **text** (cut to `maxLength`).
- Embeds are used when a message has no plain text (embed title + description).
- Markdown, mentions (`@user`, `@role`, `#channel`, `@everyone`), custom emojis and code blocks are stripped; `[text](link)` becomes `text`.
- TODAY / YESTERDAY / date is calculated from the message time in the player's local time zone.
- The channel is fetched every `refreshMinutes` and cached; players opening the menu never trigger a Discord request.

## Fallback

If the token or channel is missing, the request fails, or the channel has no usable messages, the menu silently shows `Config.Announcements.static`. With `Config.Debug = true` HTTP errors are printed to the server console.
