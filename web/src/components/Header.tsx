import { useEffect, useState } from "react";
import { lang } from "../i18n";
import { useMenu } from "../store";

function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);
  return now.toLocaleTimeString(lang(), { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function Header() {
  const data = useMenu((s) => s.data);
  const time = useClock();
  if (!data) return null;

  return (
    <header className="anim-down flex items-start justify-between">
      <div className="flex items-center gap-[1.1rem]">
        <div className="h-[3.4rem] w-[0.45rem] -skew-x-12 bg-accent shadow-[0_0_1.25rem_rgba(var(--accent-rgb),0.5)]" />
        <div className="leading-none">
          <div className="font-display skew-text text-[2.6rem] font-bold tracking-[0.04em] text-ink">{data.server.name}</div>
          {data.server.tagline ? (
            <div className="font-display mt-[0.35rem] text-[0.95rem] font-semibold tracking-[0.42em] text-accent">{data.server.tagline}</div>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-[1.75rem]">
        <div className="text-right leading-tight">
          <div className="font-display text-[1.5rem] font-bold tracking-[0.03em] text-ink">{data.player.name}</div>
          <div className="mt-[0.15rem] flex items-center justify-end gap-[0.6rem] text-[0.9rem] text-muted">
            <span className="font-display font-semibold tracking-[0.1em] text-accent">ID {data.player.id}</span>
            {data.player.job ? (
              <>
                <span className="h-[0.25rem] w-[0.25rem] rotate-45 bg-muted" />
                <span>{data.player.job}</span>
              </>
            ) : null}
          </div>
        </div>
        <div className="h-[3rem] w-[0.0625rem] bg-white/15" />
        <div className="font-display text-[2.4rem] font-bold tabular-nums tracking-[0.04em] text-ink">{time}</div>
      </div>
    </header>
  );
}
