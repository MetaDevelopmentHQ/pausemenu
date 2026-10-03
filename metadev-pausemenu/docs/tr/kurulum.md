# Kurulum

## Gereksinimler

- FiveM sunucusu (güncel bir artifact, `lua54` desteği)
- İsteğe bağlı: karakter adı, meslek ve meslek sayıları için ESX Legacy, QBCore veya Qbox

## Adımlar

1. `metadev-pausemenu` klasörünü `resources` dizinine kopyala. Klasör adını değiştirme.
2. `server.cfg`'ye framework'ünden **sonra** ekle:
   ```cfg
   ensure es_extended        # veya qb-core / qbx_core, kullanıyorsan
   ensure metadev-pausemenu
   ```
3. `config.lua`'yı aç ve en azından şunları ayarla:
   - `Config.ServerName`, `Config.ShortName` (veya `Config.Logo`)
   - `Config.Accent`
   - `Config.DiscordInvite`
   - `Config.Rules`
   - `Config.Jobs.list` (framework'ündeki meslek adları)
4. Sunucuyu yeniden başlat veya `ensure metadev-pausemenu` yaz.
5. Oyunda **ESC**'ye bas: GTA'nın menüsü yerine bu menü açılmalı.

## Logo

Logonu `web/img/` içine koy (ör. `web/img/logo.png`) ve:

```lua
Config.Logo = 'web/img/logo.png'
```

Kare bir görsel en iyi sonucu verir. `https://` ile başlayan bir adres de olur.

## Dil

```lua
Config.Locale = 'tr'   -- veya 'en'
```

Arayüz metinleri `locales/tr.json` / `locales/en.json`'da, sunucu ve konsol metinleri `locales/tr.lua` / `locales/en.lua`'da. Yeni dil eklemek için iki dosyayı kopyala, çevir ve `Config.Locale`'i yeni koda ayarla.

## Discord'dan duyurular

Bkz. [discord-duyurular.md](discord-duyurular.md).

## Güncelleme

`config.lua` (ve logon) dışındaki tüm dosyaları değiştir. Oyuncu tercihleri kendi bilgisayarlarında (KVP) saklandığı için güncellemelerde kaybolmaz.

## Arayüzü tarayıcıda önizleme

Resource klasöründe `npx serve .` çalıştır ve `http://localhost:3000/web/index.html` adresini aç. Seçenekler: `?style=minimal`, `?screen=settings`, `?lang=en`, `?lock` (kilitli bir ayar gösterir).
