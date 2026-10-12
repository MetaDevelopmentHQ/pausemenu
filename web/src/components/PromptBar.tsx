import clsx from "clsx";
import { Fragment } from "react";
import { t } from "../i18n";
import { useMenu } from "../store";

/** keys and label are locale keys (unknown keys such as "ESC" pass through unchanged) */
type Prompt = { keys: string[]; label: string };

/** compact: smaller keys and text (map overlay, where space is shared with the style chips) */
export default function PromptBar({ compact = false }: { compact?: boolean }) {
  const tab = useMenu((s) => s.tab);

  let prompts: Prompt[];
  if (tab === "map") {
    prompts = [
      { keys: ["prompt.left_click"], label: "prompt.waypoint" },
      { keys: ["prompt.right_click"], label: "prompt.remove" },
      { keys: ["↑", "↓"], label: "prompt.location" },
      { keys: ["←", "→"], label: "prompt.change" },
      { keys: ["SPACE"], label: "prompt.find_me" },
      { keys: ["F"], label: "prompt.search" },
      { keys: ["ESC"], label: "prompt.back" },
    ];
  } else {
    prompts = [
      { keys: ["←", "→"], label: "prompt.navigate" },
      { keys: ["1-4"], label: "prompt.quick_select" },
      { keys: ["ENTER"], label: "prompt.select" },
      { keys: ["ESC"], label: "prompt.resume" },
    ];
  }

  return (
    <div className={clsx("anim-up flex items-center", compact ? "gap-[0.55rem]" : "gap-[1rem]")} style={{ animationDelay: "120ms" }}>
      {prompts.map((p, i) => (
        <Fragment key={p.label}>
          {i > 0 ? <span className={clsx("text-white/25", compact ? "text-[0.85rem]" : "text-[1.1rem]")}>/</span> : null}
          <div className={clsx("flex items-center", compact ? "gap-[0.3rem]" : "gap-[0.45rem]")}>
            {p.keys.map((k) => (
              <span key={k} className={clsx("keycap", compact && "keycap--sm")}>{t(k)}</span>
            ))}
            <span className={clsx("font-display ml-[0.15rem] font-bold text-ink", compact ? "text-[0.85rem] tracking-[0.05em]" : "text-[1.05rem] tracking-[0.08em]")}>{t(p.label)}</span>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
