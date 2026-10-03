# GTA ayarları fizibilite raporu

FiveM'in her GTA ayarı için scripte neye izin verdiği ve ayarlar ekranının bunu nasıl ele aldığı.

**Kaynaklar:** FiveM profil ayarları referansı (docs.fivem.net → Game References → Profile Settings) ve `GET_PROFILE_SETTING`, `SET_PLAYER_TARGETING_MODE`, `SET_FOLLOW_PED_CAM_VIEW_MODE`, `GET_CONTROL_INSTRUCTIONAL_BUTTON`, `GET_ACTIVE_SCREEN_RESOLUTION`, `GET_ASPECT_RATIO`, `GET_CURRENT_LANGUAGE`, `SHOULD_USE_METRIC_MEASUREMENTS` native dokümanları.

**Ana bulgu:** FiveM, GTA profil ayarlarını `GetProfileSetting(id)` ile **okuyabiliyor** ama **yazacak bir native yok**. Bu yüzden bir GTA ayarı scriptten ancak ona ait ayrı bir çalışma zamanı native'i varsa "değiştirilebilir" ve bu da sadece o oturum için geçerlidir (değeri KVP'de saklayıp her girişte yeniden uyguluyoruz).

## Üç grup

| Grup | Anlamı | Arayüzde |
|---|---|---|
| 1. Okunur ve değiştirilir | Okunabiliyor ve bir native var | Normal düzenlenebilir satır, **Uygula** ile uygulanır |
| 2. Sadece okunur | `GetProfileSetting` veya başka bir native ile okunuyor | Değer gösterilir, dış bağlantı butonu GTA ayarlarını açar (ENTER) |
| 3. Erişilemez | Scriptten okunamıyor | Satır gizlenir; boş kalan kategorinin sekmesi de gizlenir |

## Kontrol (Gamepad)

| Ayar | Kaynak | Grup |
|---|---|---|
| Nişan modu | `SetPlayerTargetingMode` / profil 0 | **1** (kilitlenebilir) |
| Titreşim | profil 2 | 2 |
| Bakışı ters çevir | profil 1 | 2 |
| 3. / 1. şahıs kontrol tipi | profil 12 / 20 | 2 |
| 3. / 1. şahıs nişan hassasiyeti | profil 13 / 233 | 2 |
| 3. / 1. şahıs bakış hassasiyeti | profil 14 / 232 | 2 |
| 3. / 1. şahıs ölü bölge | profil 240 / 238 | 2 |
| 3. / 1. şahıs ivme | profil 241 / 239 | 2 |
| Yakınlaştırırken harekete izin ver | profil 17 | 2 |
| El frenini çömelme / hidrolik ile değiştir | profil 223 *(eklendi, tasarımda yoktu)* | 2 |
| "Kontrolleri göster" | ayar değil, sadece görüntüleyici | 3, kaldırıldı |
| Araçta / uçarken bakışı ters çevir | GTA'da ayrı ayar değil | 3, kaldırıldı |

Nişan modu seçenekleri GTA'daki gibi 4 taneye düzeltildi: Yardımlı nişan (tam), Yardımlı nişan (kısmi), Serbest nişan (yardımlı), Serbest nişan.

## Klavye / Fare

| Ayar | Kaynak | Grup |
|---|---|---|
| Fare giriş yöntemi | profil 750 | 2 |
| Fareyi ters çevir / uçarken / denizaltıda | profil 15 / 21 / 22 | 2 |
| Araçta / uçarken / denizaltıda varsayılan fare kontrolü | profil 752 / 753 / 751 *(tasarımda "tekne" yazıyordu, GTA'da denizaltı)* | 2 |
| Uçuşta fare kontrol tipi | profil 26 | 2 |
| Araçta / motosiklette / uçakta fareyi otomatik ortala | profil 23 / 24 / 25 | 2 |
| Yaya / araç / uçak / helikopter / denizaltı fare hassasiyeti | profil 754 / 755 / 756 / 757 / 760 | 2 |
| Nişanı aç / kapa | profil 758 *(eklendi)* | 2 |
| Hassas nişan kontrolü | profil 762 *(eklendi)* | 2 |
| Fare yumuşatma | güvenilir profil kimliği yok | 3 |
| Ekran kenarında fareyle kaydır | GTA ayarı değil | 3, kaldırıldı |

## Tuş atamaları

Tüm satırlar mevcut tuşu `GetControlInstructionalButton` ile okur (`t_W`, `b_100` gibi) → **grup 2**. ENTER, GTA'nın tuş atama menüsünü açar (`FE_MENU_VERSION_LANDING_KEYMAPPING_MENU`). "Radyo istasyonu" satırı, Q'nun gerçekte yaptığı iş olan **Radyo çarkı** (kontrol 85) olarak düzeltildi.

## Ses

| Ayar | Kaynak | Grup |
|---|---|---|
| Ses efektleri seviyesi | profil 300 | 2 |
| Müzik seviyesi | profil 306 | 2 |
| Diyalog güçlendirme | profil 308 | 2 |
| Ses çıkışı | profil 305 | 2 |
| Odak kaybında sesi kapat | profil 318 *(tasarımdaki "arka plandayken sesi çal" gerçek ayarın tersi)* | 2 |
| Kendi radyon modu | profil 316 | 2 |
| Müzik için otomatik tarama | profil 317 *(eklendi)* | 2 |
| Online müzik seviyesi, hoparlör kurulumu, radyo istasyonu, etkileşimli müzik, araç radyosunu otomatik aç | profil kimliği yok | 3 |

## Kamera

| Ayar | Kaynak | Grup |
|---|---|---|
| 3. şahıs kamera mesafesi | `SetFollowPedCamViewMode` 0/1/2 | **1** (kilitlenebilir) |
| Araç kamerası yüksekliği | profil 220 *(eklendi)* | 2 |
| Bağımsız kamera modları | profil 230 *(eklendi)* | 2 |
| Yaya: 1. şahıs görüş açısı | profil 231 | 2 |
| 1. şahıs kafa sallantısı | profil 236 | 2 |
| Siperde / yuvarlanırken / düşerken 3. şahıs kamera | profil 237 / 235 / 234 | 2 |
| 1. şahıs kamerayı otomatik dengele | profil 242 *(eklendi)* | 2 |
| 1. şahıs araç kaputu | profil 243 *(eklendi)* | 2 |
| 1. şahıs araç kamerası otomatik ortalama | profil 244 | 2 |
| Araçtan ateşte kamera araca göre | profil 245 *(eklendi)* | 2 |
| 3. şahıs araç otomatik ortalama, araç görüş açısı, nişan alırken 3. şahıs, aracın dışına bak | profil kimliği yok | 3 |

## Ekran

| Ayar | Kaynak | Grup |
|---|---|---|
| Radar / HUD / Genişletilmiş radar | profil 204 / 205 / 221 | 2 |
| Nişangah / nişangah boyutu | profil 412 / 415 | 2 |
| GPS rotası | profil 207 | 2 |
| Güvenli alan boyutu | profil 212 | 2 |
| Altyazılar | profil 203 | 2 |
| Ölçü sistemi | `ShouldUseMetricMeasurements` | 2 |
| Parlaklık | profil 213 | 2 |
| Ekran öldürme efektleri | profil 226 *(eklendi)* | 2 |
| Dil | `GetCurrentLanguage` *(tasarımda Türkçe vardı; GTA V'de Türkçe yok, 13 gerçek dil kullanılıyor)* | 2 |
| Gama | profil kimliği yok | 3 |

Radar ve HUD teknik olarak `DisplayRadar` / `DisplayHud` ile zorlanabilir ama bu her sunucunun HUD scriptiyle çakışır; bilerek sadece okunur bırakıldı.

## Grafik / Gelişmiş grafik

Grafik ayarları profilde değil `settings.xml`'de tutulur ve FiveM'de bunları okuyan ya da yazan bir native yok.

| Ayar | Kaynak | Grup |
|---|---|---|
| Çözünürlük | `GetActiveScreenResolution` | 2 |
| En boy oranı | `GetAspectRatio` | 2 |
| Önerilen sınırları yoksay | profil 710 | 2 |
| DirectX, ekran modu, yenileme hızı, FXAA, MSAA, TXAA, VSync, odak kaybında duraklat, nüfus, mesafe, tüm kalite ayarları, yumuşak gölgeler, Post FX, hareket bulanıklığı, alan derinliği, anizotropik, AO, mozaikleme | yok | 3 |
| Tüm **Gelişmiş grafik** ayarları | yok | 3 → **sekme gizli** |

"Yeniden başlatma gerekir" etiketi kodda var (`settings-data.js` içinde `restart: true`) ve DirectX'e işaretli; ancak DirectX grup 3 olduğu için şu an görünmüyor.

## Sesli sohbet

| Ayar | Kaynak | Grup |
|---|---|---|
| Sesli sohbet / mikrofon açık | profil 720 / 723 | 2 |
| Sohbet ses seviyesi / mikrofon seviyesi / hassasiyeti | profil 722 / 726 / 727 | 2 |
| Konuşma modu | profil 725 | 2 |
| Sohbet sırasında efekt / müzik seviyesi | profil 728 / 729 *(tasarımdaki "hoparlörden çıkış" ve "konuşurken müziği kıs" yerine)* | 2 |
| Çıkış / giriş cihazı | cihaz adları okunamıyor | 3 |

## Notlar

- Seçenek sırası ile profil değeri arasında 1:1 eşleşme varsayılıyor (0. seçenek = 0 değeri). Değer aralık dışındaysa satır tahmin yürütmek yerine "Bilinmiyor (n)" gösterir.
- Kaydırıcı üst sınırları (10 veya 14) en iyi tahmindir; arayüz okunan değeri kırpmaz, olduğu gibi gösterir.
- Nişan modu sadece gamepad oyuncularını etkiler; klavye / farede GTA her zaman serbest nişan kullanır.
