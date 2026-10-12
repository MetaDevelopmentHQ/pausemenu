import clsx from "clsx";
import { LogOut, Map, Play, Settings2, type LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { runCard } from "../actions";
import { t } from "../i18n";
import { useMenu } from "../store";
import type { CardId } from "../types";

const ICONS: Record<CardId, LucideIcon> = {
  resume: Play,
  map: Map,
  settings: Settings2,
  disconnect: LogOut,
};

export default function MainCards() {
  const cards = useMenu((s) => s.data?.cards ?? []);
  const cardIndex = useMenu((s) => s.cardIndex);
  const setCardIndex = useMenu((s) => s.setCardIndex);
  const confirm = useMenu((s) => s.confirmDisconnect);

  return (
    <div className="flex h-full w-full gap-[1.4rem] px-[3vh]">
      {cards.map((card, i) => {
        const Icon = ICONS[card.id] ?? Play;
        const active = i === cardIndex;
        const danger = card.id === "disconnect";
        const confirming = danger && confirm;

        const style = {
          animationDelay: `${120 + i * 70}ms`,
          "--card-accent": danger ? "var(--danger)" : "var(--accent)",
          "--card-accent-rgb": danger ? "var(--danger-rgb)" : "var(--accent-rgb)",
        } as CSSProperties;

        return (
          <div
            key={card.id}
            role="button"
            tabIndex={-1}
            className={clsx("card", active && "is-active")}
            style={style}
            onMouseEnter={() => {
              if (i !== cardIndex) setCardIndex(i);
            }}
            onClick={() => {
              // setCardIndex resets the disconnect confirmation; keep it on a second click on the same card
              if (i !== cardIndex) setCardIndex(i);
              runCard(card.id);
            }}
          >
            <div className="card__inner">
              <div
                className={clsx("card__scene", !card.image && `scene-${card.id}`)}
                style={card.image ? { backgroundImage: `url(${card.image})` } : undefined}
              />
              <div className="card__shade" />
              <div className="card__dim" />

              <div className="card__content">
                {/* The skew shifts the top-left corner inward; pad the number so it isn't clipped */}
                <div className="flex items-start justify-between pl-[4.5vh]">
                  <span className="font-display text-[1.1rem] font-bold tracking-[0.2em] text-white/50">0{i + 1}</span>
                  <span className={clsx("keycap", !active && "keycap--ghost")}>{i + 1}</span>
                </div>

                <div className="flex flex-1 items-center justify-center">
                  <Icon className="card__icon h-[5.5rem] w-[5.5rem]" strokeWidth={1.4} />
                </div>

                <div>
                  <div className="card__bar mb-[1rem]" />
                  <div className="font-display text-[2.9rem] font-bold leading-[0.95] tracking-[0.03em] text-ink">{card.title}</div>
                  <div
                    className={clsx(
                      "mt-[0.6rem] text-[1rem] font-medium",
                      confirming ? "confirm-pulse font-display text-[1.1rem] font-bold tracking-[0.08em] text-[color:var(--danger)]" : "text-white/60",
                    )}
                  >
                    {confirming ? t("main.confirm") : card.subtitle}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
