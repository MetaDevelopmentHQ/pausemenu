# Config açıklaması

Tüm ayarlar `config.lua` içinde.

## Genel

| Ayar | Varsayılan | Açıklama |
|---|---|---|
| `Config.Locale` | `'tr'` | `'tr'` veya `'en'` |
| `Config.Style` | `'glass'` | Varsayılan pause menü tarzı: `'glass'` veya `'minimal'`. Oyuncu Ayarlar → Panel'den değiştirebilir. |
| `Config.Accent` | `'#F5B544'` | Sunucunun varsayılan vurgu rengi (hex). Oyuncu değiştirebilir. |
| `Config.Corners` | `'default'` | Varsayılan köşe stili: `'default'`, `'sharp'`, `'soft'`, `'round'` |
| `Config.ServerName` | `'MetaV Roleplay'` | Sol üstte görünür |
| `Config.ShortName` | `'MV'` | Logo yoksa logo kutusunda görünür |
| `Config.Logo` | `nil` | `'web/img/logo.png'` veya https adresi |
| `Config.Framework` | `'auto'` | `'auto'`, `'esx'`, `'qb'`, `'qbox'`, `'standalone'` |
| `Config.ShowCredit` | `true` | "MADE BY METADEV" imzası |

## Menü öğeleri ve tuşlar

```lua
Config.Menu = { map = true, settings = true, rules = true, discord = true }
Config.Keys = { map = 'P', settings = 'F2', rules = 'R', discord = 'D', quit = 'Q' }
```

- Bir öğeyi `false` yapmak onu tamamen kaldırır, kalanların numaraları yeniden sıralanır. **Devam Et** ve **Sunucudan Çık** her zaman vardır.
- Tuşlar menü açıkken çalışır: harf, rakam veya `F1`–`F12`. `P` ve `F2` haritayı / ayarları doğrudan açar; `R` ve `Q` Kurallar / Sunucudan Çık'ı seçer (çıkışı ENTER onaylar); `D` Discord'u açar.
- `Config.Rules` boşsa Kurallar, `Config.DiscordInvite` boşsa Discord otomatik gizlenir.

| Ayar | Varsayılan | Açıklama |
|---|---|---|
| `Config.DiscordInvite` | `'https://discord.gg/metav'` | `discord.gg` veya `discord.com` linki olmalı |
| `Config.ReturnAfterMap` | `true` | Harita kapanınca pause menüsü yeniden açılsın |
| `Config.PauseKeyAction` | `'menu'` | Menü kapalıyken oyunda **P**: `'menu'` bu menüyü, `'map'` GTA haritasını açar |

## Görsel

```lua
Config.Blur = { glassFadeMs = 250, minimalStrength = 0.45 }
Config.HideHud = true
```

- `glassFadeMs`: Glass ekran bulanıklığının geçiş süresi.
- `minimalStrength`: Minimal'deki hafif bulanıklığın şiddeti (0.0–1.0).
- `HideHud`: menü açıkken radar ve HUD gizlenir.

Oyuncu bulanıklığı Ayarlar → Panel'den tamamen kapatabilir.

## Kurallar

```lua
Config.Rules = {
    { title = 'Meta-gaming yasaktır', text = 'Karakterinin bilmediği bilgiyi oyunda kullanma.' },
}
```

## Meslek sayıları

```lua
Config.Jobs = {
    enabled = true,
    onDutyOnly = true,
    list = {
        { job = 'police',    label = 'Polis',   color = '#7AA8FF' },
        { job = 'ambulance', label = 'EMS',     color = '#FF7A7A' },
        { job = 'mechanic',  label = 'Mekanik', color = 'accent' },
    },
}
```

- En fazla **4** meslek; fazlası yok sayılır. Kutular meslek sayısına göre kendini ayarlar.
- `job` framework'teki meslek **adı**, `label` ekranda görünen ad.
- `color` hex renk veya `'accent'`.
- `onDutyOnly`: ESX Legacy 1.11+ (`job.onDuty`), QBCore / Qbox (`job.onduty`). Eski ESX'te görev bilgisi olmadığı için o meslekteki herkes sayılır.
- Standalone'da otomatik gizlenir.

## Duyurular

```lua
Config.Announcements = {
    source = 'config',          -- 'config' veya 'discord'
    refreshMinutes = 5,
    discordChannelId = '',
    maxLength = 160,
    static = {
        { title = "Legion Meydanı'nda araç fuarı", text = 'Bu akşam 22:00.', date = '2026-10-03' },
    },
}
```

- Son **2** duyuru gösterilir.
- Sabit duyurulardaki `date` (isteğe bağlı, `YYYY-AA-GG`) BUGÜN / DÜN / tarih etiketini belirler. Yoksa etiket DUYURU olur.
- Discord kurulumu: [discord-duyurular.md](discord-duyurular.md).

## Kilitli ayarlar

```lua
Config.LockedSettings = {
    targetingMode = { value = 'free', reason = 'Sunucuda serbest nişan zorunludur.' },
    thirdPersonDistance = 'medium',
}
```

Sadece scriptin gerçekten uygulayabildiği ayarlar kilitlenebilir:

| Anahtar | Değerler |
|---|---|
| `targetingMode` | `'assisted_full'`, `'assisted_partial'`, `'free_assisted'`, `'free'` |
| `thirdPersonDistance` | `'near'`, `'medium'`, `'far'` |

Kilitli satır gri ve kilit ikonlu görünür, açıklamada neden (veya varsayılan metin) yazar. Kilitli nişan modu 5 saniyede bir yeniden uygulanır; GTA'nın kendi menüsünden değiştirilse de kalıcı olmaz.

## Gelişmiş

| Ayar | Varsayılan | Açıklama |
|---|---|---|
| `Config.DataCacheSeconds` | `4` | Oyuncu sayısı, meslekler ve duyurular için önbellek süresi |
| `Config.Debug` | `false` | Discord / meslek sayımı hatalarını konsola yazar |
