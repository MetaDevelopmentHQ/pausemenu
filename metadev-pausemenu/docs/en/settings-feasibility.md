# GTA settings feasibility

What FiveM lets a script do with each GTA setting, and how the settings screen handles it.

**Sources:** the FiveM profile settings reference (docs.fivem.net → Game References → Profile Settings) and the native docs for `GET_PROFILE_SETTING`, `SET_PLAYER_TARGETING_MODE`, `SET_FOLLOW_PED_CAM_VIEW_MODE`, `GET_CONTROL_INSTRUCTIONAL_BUTTON`, `GET_ACTIVE_SCREEN_RESOLUTION`, `GET_ASPECT_RATIO`, `GET_CURRENT_LANGUAGE`, `SHOULD_USE_METRIC_MEASUREMENTS`.

**Key finding:** FiveM can **read** GTA profile settings (`GetProfileSetting(id)`) but has **no native to write** them. The only `STAT_SET_PROFILE_SETTING_VALUE`-style natives touch a few unrelated story-mode flags. So a GTA setting can only be "changed" from script if there is a separate runtime native for it, and then only for the current session (we store it in KVP and re-apply it on every join).

## The three groups

| Group | Meaning | In the UI |
|---|---|---|
| 1. Read + apply | Readable, and a runtime native exists | Normal editable row, applied with **Apply** |
| 2. Read only | Readable with `GetProfileSetting` or another native | Value shown, external-link button opens GTA's settings (ENTER) |
| 3. No access | Not readable from script | Row hidden; an empty category hides its tab |

## Gamepad (Kontrol)

| Setting | Source | Group |
|---|---|---|
| Targeting mode | `SetPlayerTargetingMode` / profile 0 | **1** (lockable) |
| Vibration | profile 2 | 2 |
| Invert look | profile 1 | 2 |
| Third person control type | profile 12 | 2 |
| First person control type | profile 20 | 2 |
| Third / first person aiming sensitivity | profile 13 / 233 | 2 |
| Third / first person look-around sensitivity | profile 14 / 232 | 2 |
| Third / first person aim-look deadzone | profile 240 / 238 | 2 |
| Third / first person aim-look acceleration | profile 241 / 239 | 2 |
| Allow movement when zoomed | profile 17 | 2 |
| Switch handbrake with duck / hydraulics | profile 223 *(added, missing in the design)* | 2 |
| "Show controls" | not a setting (just a layout viewer) | 3 – removed |
| Invert look in vehicles / when flying | not separate GTA settings | 3 – removed |

## Keyboard / Mouse

| Setting | Source | Group |
|---|---|---|
| Mouse input method | profile 750 | 2 |
| Invert mouse / flying / submarine | profile 15 / 21 / 22 | 2 |
| Default mouse driving / flying / submarine control | profile 752 / 753 / 751 *(design said "boat"; GTA has submarine)* | 2 |
| Mouse flying control type | profile 26 | 2 |
| Auto-center mouse in cars / bikes / aircraft | profile 23 / 24 / 25 *(renamed from the design's per-mode sensitivity split)* | 2 |
| Mouse look / driving / plane / heli / submarine sensitivity | profile 754 / 755 / 756 / 757 / 760 | 2 |
| Toggle aim | profile 758 *(added)* | 2 |
| Fine aiming control | profile 762 *(added)* | 2 |
| Mouse smoothing | no reliable profile id | 3 |
| Pan at screen edge | not a GTA setting | 3 – removed |

## Key bindings

All rows read the current key with `GetControlInstructionalButton` (e.g. `t_W`, `b_100`) → **group 2**. ENTER opens GTA's key binding menu (`FE_MENU_VERSION_LANDING_KEYMAPPING_MENU`). "Radio station" was renamed to **Radio wheel** (control 85), which is what Q actually does.

## Audio

| Setting | Source | Group |
|---|---|---|
| SFX volume | profile 300 | 2 |
| Music volume | profile 306 | 2 |
| Dialogue boost | profile 308 | 2 |
| Output | profile 305 | 2 |
| Mute audio on focus loss | profile 318 *(the design's "play audio in background" is the inverse of the real setting)* | 2 |
| Self radio mode | profile 316 | 2 |
| Auto-scan for music | profile 317 *(added)* | 2 |
| Online music volume, speaker setup, radio station, interactive music, vehicle radio auto-on | no profile id | 3 |

## Camera

| Setting | Source | Group |
|---|---|---|
| Third person camera distance | `SetFollowPedCamViewMode` 0/1/2 | **1** (lockable) |
| Vehicle camera height | profile 220 *(added)* | 2 |
| Independent camera modes | profile 230 *(added)* | 2 |
| On foot first person FOV | profile 231 | 2 |
| First person head bobbing | profile 236 | 2 |
| Third person camera in cover / when rolling / when ragdolling | profile 237 / 235 / 234 | 2 |
| First person auto-level | profile 242 *(added)* | 2 |
| First person vehicle hood | profile 243 *(added)* | 2 |
| First person vehicle auto-center | profile 244 | 2 |
| Drive-by camera relative to vehicle | profile 245 *(added)* | 2 |
| Third person vehicle auto-center, vehicle FOV, third person when aiming, look outside vehicle | no profile id | 3 |

## Display

| Setting | Source | Group |
|---|---|---|
| Radar / HUD / Expanded radar | profile 204 / 205 / 221 | 2 |
| Weapon target (reticle) / reticle size | profile 412 / 415 | 2 |
| GPS route | profile 207 | 2 |
| Safezone size | profile 212 | 2 |
| Subtitles | profile 203 | 2 |
| Measurement system | `ShouldUseMetricMeasurements` | 2 |
| Brightness | profile 213 | 2 |
| Screen kill effects | profile 226 *(added)* | 2 |
| Language | `GetCurrentLanguage` *(the design listed Turkish; GTA V has no Turkish, the 13 real languages are used)* | 2 |
| Gamma | no profile id | 3 |

Radar and HUD could technically be forced with `DisplayRadar` / `DisplayHud`, but that fights with every server HUD resource, so they are deliberately kept read-only.

## Graphics / Advanced graphics

Graphics settings live in `settings.xml`, not the profile, and FiveM has no native to read or write them.

| Setting | Source | Group |
|---|---|---|
| Resolution | `GetActiveScreenResolution` | 2 |
| Aspect ratio | `GetAspectRatio` | 2 |
| Ignore suggested limits | profile 710 | 2 |
| DirectX, screen type, refresh rate, FXAA, MSAA, TXAA, VSync, pause on focus loss, population density / variety, distance scaling, all quality options, soft shadows, post FX, motion blur, DOF, anisotropic, AO, tessellation | none | 3 |
| Every **Advanced graphics** option | none | 3 → **tab hidden** |

The "restart required" tag is implemented (`restart: true` in `settings-data.js`) and set on DirectX, but since DirectX is group 3 it isn't visible today.

## Voice chat

| Setting | Source | Group |
|---|---|---|
| Voice chat / microphone enabled | profile 720 / 723 | 2 |
| Voice chat volume / microphone volume / sensitivity | profile 722 / 726 / 727 | 2 |
| Voice chat mode | profile 725 | 2 |
| SFX / music volume during voice chat | profile 728 / 729 *(replace the design's "speaker output" and "duck music")* | 2 |
| Output / input device | device names not exposed | 3 |

## Caveats

- Option index ↔ profile value mapping is assumed to be 1:1 (option 0 = value 0). If a value is out of range the row shows "Unknown (n)" instead of guessing.
- Slider maximums (10 or 14) are best estimates; the UI never clamps a read value, it just shows it.
- Targeting mode only affects gamepad players: on keyboard / mouse GTA always uses free aim.
