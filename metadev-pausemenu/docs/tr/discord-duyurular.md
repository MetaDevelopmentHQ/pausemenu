# Discord duyuruları

Sunucu bir Discord kanalının son mesajlarını okur ve menüde son 2 tanesini gösterir. Bot token'ı sunucudan asla çıkmaz.

## 1. Bot oluştur

1. <https://discord.com/developers/applications> → **New Application**, bir ad ver.
2. **Bot** sekmesi → **Reset Token** → token'ı kopyala. Kimseyle paylaşma.
3. **Privileged Gateway Intents** altında **Message Content Intent**'i aç (kapalıysa mesaj metinleri boş gelir).

## 2. Botu Discord sunucuna ekle

1. **OAuth2 → URL Generator** → scope olarak **bot**.
2. İzinler: **View Channels** ve **Read Message History**.
3. Oluşan linki aç ve botu sunucuna ekle.
4. Botun duyuru kanalını görebildiğinden emin ol (kanal izinleri).

## 3. Kanal ID'sini al

1. Discord → **Kullanıcı Ayarları → Gelişmiş → Geliştirici Modu**'nu aç.
2. Duyuru kanalına sağ tıkla → **Kanal ID'sini Kopyala**.

## 4. Ayarla

`server.cfg` (`setr` **değil** `set` kullan, böylece client'lara hiç gönderilmez):

```cfg
set metadev_pause_discord_token "BOT_TOKENIN"
ensure metadev-pausemenu
```

`config.lua`:

```lua
Config.Announcements = {
    source = 'discord',
    refreshMinutes = 5,
    discordChannelId = '123456789012345678',
    maxLength = 160,
    static = { ... },   -- yedek olarak kullanılmaya devam eder
}
```

## Mesajlar nasıl gösterilir

- Mesajın ilk satırı **başlık**, kalanı **metin** olur (`maxLength`'e göre kısaltılır).
- Düz metni olmayan mesajlarda embed kullanılır (embed başlığı + açıklaması).
- Markdown, mention'lar (`@kullanıcı`, `@rol`, `#kanal`, `@everyone`), özel emojiler ve kod blokları temizlenir; `[metin](link)` sadece `metin` olur.
- BUGÜN / DÜN / tarih etiketi mesaj zamanından, oyuncunun yerel saatine göre hesaplanır.
- Kanal her `refreshMinutes` dakikada bir çekilip önbelleğe alınır; oyuncuların menüyü açması Discord'a istek atmaz.

## Yedek davranış

Token veya kanal eksikse, istek başarısız olursa ya da kanalda kullanılabilir mesaj yoksa menü sessizce `Config.Announcements.static` listesini gösterir. `Config.Debug = true` iken HTTP hataları sunucu konsoluna yazılır.
