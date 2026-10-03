// Data definition of the settings screen. Texts come from rows.<id> and options.<set> in the locale file.
//
// Row fields:
//   type    : 'enum' | 'range' | 'bool' | 'key' | 'info' | 'header'
//   access  : 'apply' (group 1: readable and applied from script)
//             'read'  (group 2: read only, "Open in GTA settings" shortcut)
//             'none'  (group 3: not accessible in FiveM, hidden; kept here for transparency)
//             'pref'  (Panel: this menu's own preferences, KVP)
//   source  : { profile: id } GetProfileSetting | { special: name } dedicated native | { control: id } key | { pref: name }
//   opts    : options.<set> key (enum)
//   min/max : range bounds
//   def     : value used when the game can't be read (browser preview)
//   restart : change takes effect after a game restart

const e = (id, opts, source, access, def = 0, extra = {}) => ({ id, type: 'enum', opts, source, access, def, ...extra });
const b = (id, source, access, def = 0, extra = {}) => ({ id, type: 'bool', source, access, def, ...extra });
const r = (id, source, access, def = 0, max = 10, extra = {}) => ({ id, type: 'range', source, access, def, min: 0, max, ...extra });
const k = (id, control, fallback) => ({ id, type: 'key', source: { control }, access: 'read', def: fallback });
const h = (id) => ({ id, type: 'header' });
const P = (id) => ({ profile: id });
const S = (name) => ({ special: name });
const NONE = null;

// Icon paths from the design (24x24 viewBox)
export const CATEGORIES = [
  {
    id: 'kontrol',
    icon: 'M6 11h4M8 9v4M15 12h.01M18 10h.01M17.3 5H6.7a4 4 0 0 0-4 3.6l-.7 6.2A3 3 0 0 0 5 18c1 0 1.9-.5 2.4-1.3L9 15h6l1.6 1.7A3 3 0 0 0 19 18a3 3 0 0 0 3-3.2l-.7-6.2A4 4 0 0 0 17.3 5z',
    rows: [
      e('targetingMode', 'targeting', S('targetingMode'), 'apply', 3, { lockKey: 'targetingMode' }),
      b('vibration', P(2), 'read', 1),
      b('invertLook', P(1), 'read', 0),
      e('tpControlType', 'controlType', P(12), 'read', 0),
      e('fpControlType', 'fpControlType', P(20), 'read', 0),
      r('tpAimSens', P(13), 'read', 5, 14),
      r('tpLookSens', P(14), 'read', 5, 14),
      r('fpAimSens', P(233), 'read', 5, 14),
      r('fpLookSens', P(232), 'read', 5, 14),
      r('tpDeadzone', P(240), 'read', 14, 14),
      r('fpDeadzone', P(238), 'read', 14, 14),
      r('tpAccel', P(241), 'read', 7, 14),
      r('fpAccel', P(239), 'read', 7, 14),
      b('moveWhenZoomed', P(17), 'read', 1),
      b('handbrakeSwap', P(223), 'read', 0),
      // Not real GTA settings, or not readable
      e('showControls', 'controlType', NONE, 'none'),
      b('invertLookVehicle', NONE, 'none'),
      b('invertLookFlying', NONE, 'none'),
    ],
  },
  {
    id: 'fare',
    icon: 'M12 2a6 6 0 0 0-6 6v8a6 6 0 0 0 12 0V8a6 6 0 0 0-6-6zM12 6v4',
    rows: [
      e('mouseInput', 'mouseInput', P(750), 'read', 0),
      b('invertMouse', P(15), 'read', 0),
      b('invertMouseFlying', P(21), 'read', 0),
      b('invertMouseSub', P(22), 'read', 0),
      e('mouseDriving', 'mouseControl', P(752), 'read', 0),
      e('mouseFlying', 'mouseControl', P(753), 'read', 0),
      e('mouseSub', 'mouseControl', P(751), 'read', 0),
      e('flyingControlType', 'flyingControl', P(26), 'read', 0),
      b('autoCenterCar', P(23), 'read', 1),
      b('autoCenterBike', P(24), 'read', 1),
      b('autoCenterAircraft', P(25), 'read', 1),
      r('mouseLookSens', P(754), 'read', 7, 14),
      r('mouseDriveSens', P(755), 'read', 6, 14),
      r('mousePlaneSens', P(756), 'read', 6, 14),
      r('mouseHeliSens', P(757), 'read', 6, 14),
      r('mouseSubSens', P(760), 'read', 6, 14),
      b('toggleAim', P(758), 'read', 0),
      b('fineAim', P(762), 'read', 0),
      b('mouseSmoothing', NONE, 'none'),
      b('edgePan', NONE, 'none'),
    ],
  },
  {
    id: 'tuslar',
    icon: 'M4 6h16v12H4zM8 10h.01M12 10h.01M16 10h.01M8 14h8',
    rows: [
      h('onFoot'),
      k('keyForward', 32, 't_W'), k('keyBack', 33, 't_S'), k('keyLeft', 34, 't_A'), k('keyRight', 35, 't_D'),
      k('keySprint', 21, 'b_1000'), k('keyJump', 22, 'b_2000'), k('keyDuck', 36, 'b_1013'), k('keyCover', 44, 't_Q'),
      k('keyAttack', 24, 'b_100'), k('keyAim', 25, 'b_101'), k('keyReload', 45, 't_R'), k('keyMelee', 140, 't_R'),
      k('keyWheel', 37, 'b_1002'), k('keyCamera', 0, 't_V'), k('keyPhone', 27, 'b_194'), k('keyInteraction', 244, 't_M'),
      h('vehicle'),
      k('keyAccel', 71, 't_W'), k('keyBrake', 72, 't_S'), k('keyHandbrake', 76, 'b_2000'), k('keyHorn', 86, 't_E'),
      k('keyLights', 74, 't_H'), k('keyExit', 75, 't_F'), k('keyRadio', 85, 't_Q'), k('keyLookBehind', 79, 't_C'),
      h('multiplayer'),
      k('keyPtt', 249, 't_N'), k('keyPlayerList', 20, 't_Z'), k('keyChat', 245, 't_T'),
    ],
  },
  {
    id: 'ses',
    icon: 'M11 5L6 9H2v6h4l5 4V5zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14',
    rows: [
      r('sfxVolume', P(300), 'read', 8),
      r('musicVolume', P(306), 'read', 6),
      b('dialogueBoost', P(308), 'read', 0),
      e('audioOutput', 'audioOutput', P(305), 'read', 0),
      b('muteOnFocusLoss', P(318), 'read', 1),
      e('selfRadioMode', 'selfRadio', P(316), 'read', 0),
      b('autoScan', P(317), 'read', 0),
      r('onlineMusic', NONE, 'none'),
      e('speakerSetup', 'audioOutput', NONE, 'none'),
      e('radioStation', 'selfRadio', NONE, 'none'),
      b('interactiveMusic', NONE, 'none'),
      b('autoRadio', NONE, 'none'),
    ],
  },
  {
    id: 'kamera',
    icon: 'M23 7l-7 5 7 5V7zM1 5h15v14H1z',
    rows: [
      e('camDistance', 'camDistance', S('camDistance'), 'apply', 1, { lockKey: 'camDistance' }),
      e('vehCamHeight', 'camHeight', P(220), 'read', 0),
      b('independentCam', P(230), 'read', 0),
      r('fpFov', P(231), 'read', 5),
      b('fpHeadBob', P(236), 'read', 1),
      b('fpCover', P(237), 'read', 0),
      b('fpRoll', P(235), 'read', 0),
      b('fpRagdoll', P(234), 'read', 1),
      b('fpAutoLevel', P(242), 'read', 1),
      b('fpVehHood', P(243), 'read', 0),
      b('fpVehAutoCenter', P(244), 'read', 1),
      b('fpDriveby', P(245), 'read', 0),
      b('tpVehAutoCenter', NONE, 'none'),
      r('vehFov', NONE, 'none'),
      b('aimTpCam', NONE, 'none'),
      b('lookOutside', NONE, 'none'),
    ],
  },
  {
    id: 'ekran',
    icon: 'M2 4h20v13H2zM8 21h8M12 17v4',
    rows: [
      b('radar', P(204), 'read', 1),
      b('hud', P(205), 'read', 1),
      b('expandedRadar', P(221), 'read', 0),
      e('reticle', 'reticle', P(412), 'read', 0),
      r('reticleSize', P(415), 'read', 4),
      b('gps', P(207), 'read', 1),
      r('safezone', P(212), 'read', 9),
      b('subtitles', P(203), 'read', 1),
      e('measurement', 'measurement', S('measurement'), 'read', 0),
      r('brightness', P(213), 'read', 5),
      b('killEffects', P(226), 'read', 1),
      e('language', 'language', S('language'), 'read', 0),
      r('gamma', NONE, 'none'),
    ],
  },
  {
    id: 'grafik',
    icon: 'M3 3h18v18H3zM3 15l5-5 4 4 3-3 6 6',
    rows: [
      { id: 'resolution', type: 'info', source: S('resolution'), access: 'read', def: '1920 × 1080' },
      { id: 'aspect', type: 'info', source: S('aspect'), access: 'read', def: '16:9' },
      b('ignoreLimits', P(710), 'read', 0),
      // Graphics settings live in settings.xml; FiveM has no native to read or write them.
      e('directx', 'directx', NONE, 'none', 0, { restart: true }),
      ...['screenType', 'refreshRate', 'fxaa', 'msaa', 'txaa', 'vsync', 'pauseOnFocusLoss', 'popDensity', 'popVariety',
        'distScaling', 'textureQuality', 'shaderQuality', 'shadowQuality', 'reflectionQuality', 'reflectionMsaa',
        'waterQuality', 'particleQuality', 'grassQuality', 'softShadows', 'postFx', 'motionBlur', 'dof', 'anisotropic',
        'ao', 'tessellation'].map((id) => b(id, NONE, 'none')),
    ],
  },
  {
    id: 'gelismis',
    icon: 'M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z',
    rows: ['longShadows', 'hiResShadows', 'flyingStreaming', 'extDistScaling', 'extShadowDist', 'frameScaling']
      .map((id) => b(id, NONE, 'none')),
  },
  {
    id: 'sohbet',
    icon: 'M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v4',
    rows: [
      b('vcEnabled', P(720), 'read', 1),
      r('vcVolume', P(722), 'read', 8),
      b('micEnabled', P(723), 'read', 1),
      e('vcMode', 'vcMode', P(725), 'read', 0),
      r('micVolume', P(726), 'read', 6),
      r('micSens', P(727), 'read', 5),
      r('sfxDuringVc', P(728), 'read', 8),
      r('musicDuringVc', P(729), 'read', 4),
      e('vcOutputDevice', 'vcMode', NONE, 'none'),
      e('vcInputDevice', 'vcMode', NONE, 'none'),
    ],
  },
  {
    id: 'panel',
    sub: true,
    icon: 'M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6',
    rows: [
      e('layout', 'layout', { pref: 'layout' }, 'pref', 0, { values: ['tabs', 'sidebar', 'list'] }),
      e('corners', 'corners', { pref: 'corners' }, 'pref', 0, { values: ['default', 'sharp', 'soft', 'round'] }),
      e('accent', 'accent', { pref: 'accent' }, 'pref', 0, { values: ['default', 'amber', 'mint', 'blue', 'purple', 'coral', 'white'] }),
      e('style', 'style', { pref: 'style' }, 'pref', 0, { values: ['default', 'glass', 'minimal'] }),
      { id: 'size', type: 'range', source: { pref: 'size' }, access: 'pref', def: 4, min: 1, max: 10 },
      { id: 'fontSize', type: 'range', source: { pref: 'fontSize' }, access: 'pref', def: 7, min: 1, max: 10 },
      b('blur', { pref: 'blur' }, 'pref', 1),
    ],
  },
];

/** Visible rows (everything except group 3). */
export function visibleRows(category) {
  return category.rows.filter((row) => row.access !== 'none');
}

/** Categories with visible rows. A category left empty has its tab hidden. */
export function visibleCategories() {
  return CATEGORIES
    .map((cat) => ({ ...cat, rows: visibleRows(cat) }))
    .filter((cat) => cat.rows.some((row) => row.type !== 'header'));
}

/** Profile setting and control ids that have to be read from the game. */
export function readRequest() {
  const profile = new Set();
  const controls = new Set();
  for (const cat of CATEGORIES) {
    for (const row of cat.rows) {
      if (row.access === 'none' || !row.source) continue;
      if (row.source.profile !== undefined) profile.add(row.source.profile);
      if (row.source.control !== undefined) controls.add(row.source.control);
    }
  }
  return { profile: [...profile], controls: [...controls] };
}

// GetControlInstructionalButton "b_" codes -> locale keys.* entry.
// Unknown codes are shown raw.
const BUTTON_CODES = {
  100: 'MOUSE1', 101: 'MOUSE2', 102: 'MOUSE3', 115: 'WHEELUP', 116: 'WHEELDOWN',
  194: 'UP', 195: 'DOWN', 196: 'LEFT', 197: 'RIGHT',
  1000: 'LSHIFT', 1002: 'TAB', 1003: 'ENTER', 1004: 'BACKSPACE', 1013: 'LCTRL', 1015: 'LALT', 2000: 'SPACE',
};

/** Turns a key code like "t_W" / "b_100" into a readable label. */
export function formatControlKey(raw, t) {
  if (!raw || typeof raw !== 'string') return t('keys.unbound');
  if (raw.startsWith('t_')) return raw.slice(2).toUpperCase();
  if (raw.startsWith('b_')) {
    const name = BUTTON_CODES[Number(raw.slice(2))];
    return name ? t(`keys.${name}`) : raw.toUpperCase();
  }
  return raw.toUpperCase();
}
