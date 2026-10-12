import clsx from "clsx";
import { useEffect } from "react";
import { closeMenu, runCard } from "./actions";
import Header from "./components/Header";
import MainCards from "./components/MainCards";
import PromptBar from "./components/PromptBar";
import TabBar, { visibleTabs } from "./components/TabBar";
import { useNuiEvent } from "./hooks/useNuiEvent";
import { setLocale, t } from "./i18n";
import { mockData } from "./mock";
import MapScreen from "./screens/MapScreen";
import { useMenu } from "./store";
import { applyTheme } from "./theme";
import { loadBrowserTheme } from "./themeActions";
import type { MapLocation, MapUpdate, MenuData } from "./types";
import { isEnvBrowser } from "./utils/nui";

function openWith(data: MenuData) {
  setLocale(data.locale);
  useMenu.getState().open(data);
  applyTheme(useMenu.getState().theme);
}

function openMock() {
  openWith({ ...mockData, theme: loadBrowserTheme() ?? mockData.theme });
}

export default function App() {
  const visible = useMenu((s) => s.visible);
  const closing = useMenu((s) => s.closing);
  const tab = useMenu((s) => s.tab);

  useNuiEvent<MenuData>("open", openWith);
  useNuiEvent("close", () => closeMenu(false));
  useNuiEvent<{ locations: MapLocation[] }>("mapData", (d) => useMenu.getState().setLocations(Array.isArray(d?.locations) ? d.locations : []));
  useNuiEvent<MapUpdate>("mapUpdate", (u) => useMenu.getState().applyMapUpdate(u));

  // Browser development: fake background + auto open
  useEffect(() => {
    if (!isEnvBrowser()) return;
    document.body.classList.add("dev-bg");
    openMock();
  }, []);

  // Global keyboard: Q/E tabs, ESC back/close, main menu card controls.
  // The map listens to its own keys in its own screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const s = useMenu.getState();

      if (!s.visible) {
        if (isEnvBrowser() && e.key === "Escape") openMock();
        return;
      }
      if (s.closing || e.repeat) return;
      if (document.activeElement instanceof HTMLInputElement) return; // typing (the input handles ESC itself)

      if (e.key === "Escape") {
        e.preventDefault();
        if (s.tab !== "main") s.setTab("main");
        else closeMenu(true);
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "q" || key === "e") {
        const ids = visibleTabs(s.data?.mapEnabled !== false).map((t) => t.id);
        const i = ids.indexOf(s.tab);
        s.setTab(ids[(i + (key === "e" ? 1 : -1) + ids.length) % ids.length]);
        return;
      }

      if (s.tab !== "main") return;
      const cards = s.data?.cards ?? [];
      const count = cards.length;
      if (!count) return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") s.setCardIndex((s.cardIndex + 1) % count);
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") s.setCardIndex((s.cardIndex - 1 + count) % count);
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const card = cards[s.cardIndex];
        if (card) runCard(card.id);
      } else if (/^[1-9]$/.test(e.key)) {
        const i = Number(e.key) - 1;
        const card = cards[i];
        if (card) {
          // Disconnect confirmation needs a second press on the same card; setCardIndex resets it
          if (i !== s.cardIndex) s.setCardIndex(i);
          runCard(card.id);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!visible) return null;

  return (
    <div className={clsx("pm-root", closing && "is-closing")}>
      <div className="pm-dim" />
      <div className="pm-scanlines" />

      {tab === "map" ? (
        // Full-screen map: no header / tabs / footer, only the map's own panels
        <div className="absolute inset-0">
          <MapScreen />
          <div className="pointer-events-none absolute bottom-[1rem] left-[1rem] right-[26rem] z-[600] flex justify-end">
            <div className="panel px-[0.8rem] py-[0.45rem]">
              <PromptBar compact />
            </div>
          </div>
        </div>
      ) : (
      <div className="relative flex h-full flex-col px-[4rem] pb-[2.75rem] pt-[3rem]">
        <Header />
        <div className="mt-[2.25rem]">
          <TabBar />
        </div>

        <main className="mt-[2rem] min-h-0 flex-1">
          <MainCards />
        </main>

        <footer className="mt-[1.75rem] flex items-center justify-between">
          {tab === "main" ? (
            <div
              className="anim-up font-display flex items-center gap-[0.6rem] text-[0.95rem] font-semibold tracking-[0.25em] text-muted"
              style={{ animationDelay: "120ms" }}
            >
              <span className="h-[0.5rem] w-[0.5rem] rotate-45 bg-accent" />
              {t("main.background")}
            </div>
          ) : (
            <span />
          )}
          <PromptBar />
        </footer>
      </div>
      )}
    </div>
  );
}
