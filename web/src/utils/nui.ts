export const isEnvBrowser = (): boolean => !(window as unknown as { invokeNative?: unknown }).invokeNative;

const resourceName = (): string => {
  const w = window as unknown as { GetParentResourceName?: () => string };
  return w.GetParentResourceName ? w.GetParentResourceName() : "pausemenu";
};

/** Sends data to a RegisterNUICallback on the Lua side. Skipped (logged) in the browser (dev). */
export async function fetchNui<T = unknown>(event: string, data?: unknown): Promise<T | null> {
  if (isEnvBrowser()) {
    console.log(`[pausemenu] fetchNui → ${event}`, data ?? "");
    return null;
  }
  try {
    const resp = await fetch(`https://${resourceName()}/${event}`, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=UTF-8" },
      body: JSON.stringify(data ?? {}),
    });
    return (await resp.json()) as T;
  } catch {
    return null;
  }
}

/** "#FFB020" -> "255,176,32" (for use inside rgba()). Returns amber when invalid. */
export function hexToRgb(hex: string): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "255,176,32";
  const n = parseInt(m[1], 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}
