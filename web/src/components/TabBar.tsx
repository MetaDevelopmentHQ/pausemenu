import clsx from "clsx";
import { t } from "../i18n";
import { useMenu } from "../store";
import type { Tab } from "../types";

/** label: locale key */
const TABS: { id: Tab; label: string }[] = [
  { id: "main", label: "tab.main" },
  { id: "map", label: "tab.map" },
];

/** Tabs shown in the menu (the MAP tab is hidden when Config.EnableMap = false) */
export const visibleTabs = (mapEnabled: boolean) => TABS.filter((tab) => tab.id !== "map" || mapEnabled);

export default function TabBar() {
  const tab = useMenu((s) => s.tab);
  const setTab = useMenu((s) => s.setTab);
  const mapEnabled = useMenu((s) => s.data?.mapEnabled !== false);
  const tabs = visibleTabs(mapEnabled);

  return (
    <nav className="anim-down flex items-center gap-[0.75rem]" style={{ animationDelay: "60ms" }}>
      {tabs.length > 1 ? <span className="keycap keycap--ghost">Q</span> : null}
      {tabs.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => setTab(item.id)}
          className={clsx("tab-chip font-display px-[1.6rem] py-[0.55rem] text-[1.15rem] font-bold tracking-[0.08em]", tab === item.id && "is-active")}
        >
          <span>{t(item.label)}</span>
        </button>
      ))}
      {tabs.length > 1 ? <span className="keycap keycap--ghost">E</span> : null}
    </nav>
  );
}
