import { useMenu } from "./store";
import { fetchNui, isEnvBrowser } from "./utils/nui";
import type { CardId } from "./types";

const CLOSE_ANIM_MS = 180;
let confirmTimer: number | undefined;

/** Plays the close animation and hides the menu. notifyLua=false means Lua already closed it. */
export function closeMenu(notifyLua = true) {
  const s = useMenu.getState();
  if (!s.visible || s.closing) return;
  s.startClose();
  if (notifyLua) void fetchNui("close");
  window.setTimeout(() => useMenu.getState().finishClose(), CLOSE_ANIM_MS);
}

/** Runs a card's action. Disconnect requires a two-step confirmation. */
export function runCard(id: CardId) {
  const s = useMenu.getState();
  if (s.closing) return;

  if (id === "disconnect" && !s.confirmDisconnect) {
    s.setConfirmDisconnect(true);
    window.clearTimeout(confirmTimer);
    confirmTimer = window.setTimeout(() => useMenu.getState().setConfirmDisconnect(false), 3000);
    return;
  }
  window.clearTimeout(confirmTimer);

  if (id === "resume") {
    closeMenu(true);
    return;
  }
  if (id === "map" && s.data?.mapEnabled !== false) {
    s.setTab(id);
    return;
  }
  // Map with Config.EnableMap = false / Settings (open GTA's own screens) / Disconnect:
  // Lua closes the menu (focus + blur); the UI only plays the animation.
  s.startClose();
  void fetchNui("action", { id });
  window.setTimeout(() => useMenu.getState().finishClose(), CLOSE_ANIM_MS);
  if (isEnvBrowser()) console.log(`[pausemenu] action: ${id}`);
}
