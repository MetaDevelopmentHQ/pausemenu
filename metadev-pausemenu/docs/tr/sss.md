# Sık sorulan sorular

**GTA'nın pause menüsü hâlâ açılıyor.**
Başka bir resource da ESC'yi yakalıyor olabilir (bazı HUD veya telefon scriptleri yapar). `DisableControlAction(0, 200, ...)` çağıran ya da frontend menü açan başka scriptleri kontrol et. `metadev-pausemenu`'nün başlatıldığından (`ensure`) emin ol.

**Oyuncular grafik / ses / kontrol ayarlarını neden menüden değiştiremiyor?**
FiveM, scriptlerin GTA profil ayarlarını okumasına izin veriyor ama yazmasına izin vermiyor. Menü gerçek değerleri gösterir; dış bağlantı butonu (veya ENTER) GTA'nın kendi ayar menüsünü açar. Sadece nişan modu ve 3. şahıs kamera mesafesinin native'i var, onlar doğrudan uygulanır. Bkz. [ayar-fizibilite.md](ayar-fizibilite.md).

**Gelişmiş grafik sekmesi ve çoğu grafik ayarı neden yok?**
Bunlar `settings.xml`'de tutuluyor ve hiçbir FiveM native'i bu dosyayı okuyamıyor. Uydurma değer göstermektense gizlemek daha doğru.

**Bulanıklık görünmüyor / çok fazla.**
Oyuncu Ayarlar → Panel → Arka plan bulanıklığı'ndan açıp kapatabilir. Glass, GTA'nın ekran bulanıklığını (`Config.Blur.glassFadeMs`), Minimal daha hafif bir timecycle bulanıklığını (`Config.Blur.minimalStrength`) kullanır. Başka bir script zaten timecycle kullanıyorsa Minimal onu bozmamak için ekran bulanıklığına düşer.

**Serbest nişanı zorunlu yapabilir miyim?**
Evet: `Config.LockedSettings = { targetingMode = 'free' }`. Klavye / farede GTA zaten her zaman serbest nişan kullanır; kilit gamepad oyuncuları için önemlidir.

**Meslek sayıları hep 0.**
`Config.Jobs.list` içindeki `job` alanının framework'teki meslek **adıyla** (label değil) aynı olduğunu ve `onDutyOnly = true`'nun oyuncuları elemediğini kontrol et.

**Karakter adı yerine FiveM adı görünüyor.**
Framework algılanmamış demektir (standalone). Framework'ün bu resource'tan **önce** başladığından emin ol ya da `Config.Framework`'ü elle ayarla.

**Discord duyuruları görünmüyor.**
[discord-duyurular.md](discord-duyurular.md) içindeki yedek davranış bölümüne bak. En sık nedenler: Message Content Intent kapalı, bot kanalı göremiyor, `set` yerine `setr` kullanılmış.

**Oyuncu tercihleri nerede saklanıyor?**
Oyuncunun kendi FiveM istemcisinde (resource KVP). Sunucuda hiçbir şey saklanmaz.

**Performansa etkisi var mı?**
Menü kapalıyken tek bir hafif döngü ESC/P'yi engeller (resmon'da ~0.00–0.01 ms). Menü kapalıyken veri çekilmez. Menü açılınca veri bir kez istenir, sunucu kısa bir önbellekten cevap verir.

**Çıkış ekranındaki "Karakterin şu anki konumunda kaydedilecek" yazısı benim sunucumda doğru değil.**
`locales/tr.json` / `locales/en.json` içindeki `quit.body` metnini düzenle.
