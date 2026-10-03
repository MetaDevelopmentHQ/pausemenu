// Browser preview (only loaded outside FiveM).
// Start a local server in the resource folder and open web/index.html:
//   npx serve .   ->  http://localhost:3000/web/index.html   (?lang=en, ?screen=settings)

const params = new URLSearchParams(location.search);
const lang = params.get('lang') === 'en' ? 'en' : 'tr';

export async function previewPayload() {
  const strings = await fetch(`../locales/${lang}.json`).then((res) => res.json());
  return {
    locale: lang,
    strings,
    config: {
      serverName: 'MetaV Roleplay',
      shortName: 'MV',
      logo: null,
      accent: '#F5B544',
      style: params.get('style') === 'minimal' ? 'minimal' : 'glass',
      corners: 'default',
      menu: { map: true, settings: true, rules: true, discord: true },
      keys: { map: 'P', settings: 'F2', rules: 'R', discord: 'D', quit: 'Q' },
      discordInvite: 'https://discord.gg/metav',
      rules: [
        { title: 'Meta-gaming yasaktır', text: 'Karakterinin bilmediği bilgiyi oyunda kullanma.' },
        { title: 'Power-gaming yasaktır', text: 'Karşı tarafa tepki verme şansı tanı.' },
        { title: 'Yeşil bölgelere saygı', text: 'Hastane ve karakol çevresinde çatışma başlatılmaz.' },
        { title: 'Fear RP', text: 'Silah karşısında karakterinin hayatını önemse.' },
        { title: 'Combat logging yasaktır', text: 'Çatışma ya da RP sırasında oyundan çıkma.' },
        { title: 'Ticket ile bildir', text: 'Kural ihlallerini Discord üzerinden ilet.' },
      ],
      showCredit: true,
      jobsEnabled: true,
      transitionMs: 180,
    },
    prefs: {},
    locks: params.has('lock') ? { targetingMode: { value: 3, reason: null } } : {},
  };
}

const now = new Date();
const yesterday = new Date(now.getTime() - 86400000);

export const previewData = {
  player: { id: 24, name: 'Alex Kaya', job: 'Mekanik', ping: 38 },
  city: { online: 128, max: 256 },
  jobs: [
    { label: 'Polis', color: '#7AA8FF', count: 6 },
    { label: 'EMS', color: '#FF7A7A', count: 3 },
    { label: 'Mekanik', color: 'accent', count: 4 },
  ],
  announcements: [
    { title: "Legion Meydanı'nda araç fuarı", text: "Bu akşam 22:00'de. Tüm galeriler ve modifiye ekipleri davetli.", time: now.toISOString() },
    { title: 'Ekonomi güncellemesi yayında', text: 'Meslek maaşları ve market fiyatları yeniden dengelendi.', time: yesterday.toISOString() },
  ],
  announceSource: 'discord',
};

// Browser stand-ins for the Lua callbacks
window.__previewNui = (name, data) => {
  if (['close', 'openMap', 'openGtaSettings', 'quit'].includes(name)) {
    window.postMessage({ action: 'close' }, '*');
  }
  if (name === 'savePrefs') return data;
  return null;
};
