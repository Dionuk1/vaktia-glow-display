import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellRing, CheckCheck, Clock, Sparkles } from "lucide-react";
import { Modal } from "./FeatureModals";
import { getNextPrayer, onNextPrayer, type NextPrayerInfo } from "@/lib/next-prayer";

const ALERTS_KEY = "vaktiaks_prayer_alerts";
const READ_KEY = "vaktiaks_notifications_read";

const PRAYERS = ["Sabahu", "Dreka", "Ikindia", "Akshami", "Jacia"] as const;

const UPDATES: { icon: string; text: string; tag: string; tone: string }[] = [
  {
    icon: "✨",
    text: "U shtua kalendari i Ramazanit 2027 me countdown live",
    tag: "SEZONALE",
    tone: "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]",
  },
  {
    icon: "📱",
    text: "U përditësua moduli i xhamive me gjeolokacion GPS dhe distancë në km",
    tag: "PËRDITËSUAR",
    tone: "border-[#00D9A3]/40 bg-[#00D9A3]/10 text-[#00D9A3]",
  },
  {
    icon: "📄",
    text: "Moduli i ri: Si të falet namazi (lexues PDF)",
    tag: "I RI",
    tone: "border-[#00D9A3]/40 bg-[#00D9A3]/10 text-[#00D9A3]",
  },
  {
    icon: "🎨",
    text: "Dizajn i ri Emerald Slate në të gjithë platformën",
    tag: "PËRDITËSUAR",
    tone: "border-[#06B6D4]/40 bg-[#06B6D4]/10 text-[#06B6D4]",
  },
];

function readAlerts(): Record<string, boolean> {
  try {
    const raw = window.localStorage.getItem(ALERTS_KEY);
    if (raw) return JSON.parse(raw) as Record<string, boolean>;
  } catch {
    /* ignore */
  }
  return Object.fromEntries(PRAYERS.map((p) => [p, true]));
}

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={[
        "relative h-6 w-11 shrink-0 rounded-full border transition",
        on ? "border-[#00D9A3]/50 bg-[#00D9A3]/30" : "border-[#00D9A3]/15 bg-[#0B1E24]",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 size-4 rounded-full transition-all",
          on ? "left-6 bg-[#00D9A3]" : "left-0.5 bg-[#9CA3AF]",
        ].join(" ")}
      />
    </button>
  );
}

export function NotificationsModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<"all" | "prayers" | "updates">("all");
  const [alerts, setAlerts] = useState<Record<string, boolean>>({});
  const [next, setNext] = useState<NextPrayerInfo | null>(getNextPrayer());
  const [push, setPush] = useState(false);

  useEffect(() => {
    setAlerts(readAlerts());
    setPush(typeof Notification !== "undefined" && Notification.permission === "granted");
    return onNextPrayer(setNext);
  }, []);

  const toggle = (p: string) => {
    const nextState = { ...alerts, [p]: !alerts[p] };
    setAlerts(nextState);
    try {
      window.localStorage.setItem(ALERTS_KEY, JSON.stringify(nextState));
    } catch {
      /* ignore */
    }
  };

  const markAllRead = () => {
    try {
      window.localStorage.setItem(READ_KEY, String(UPDATES.length));
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event("vaktia:notifications-read"));
  };

  const enablePush = async () => {
    if (typeof Notification === "undefined") return;
    if (push) {
      setPush(false);
      return;
    }
    const res = await Notification.requestPermission();
    setPush(res === "granted");
  };

  const showPrayers = tab === "all" || tab === "prayers";
  const showUpdates = tab === "all" || tab === "updates";

  return (
    <Modal title="Njoftimet" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["all", "Të gjitha"],
              ["prayers", "Namazet"],
              ["updates", "Përditësimet"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                tab === id
                  ? "border-[#00D9A3] bg-[#00D9A3]/15 text-[#00D9A3]"
                  : "border-[#00D9A3]/20 bg-[#18282E] text-[#9CA3AF] hover:text-white",
              ].join(" ")}
            >
              {label}
            </button>
          ))}
          <button
            onClick={markAllRead}
            className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D9A3] hover:underline"
          >
            <CheckCheck className="size-4" /> Shëno të gjitha si të lexuara
          </button>
        </div>

        {showPrayers && (
          <div className="space-y-3">
            <div className="rounded-2xl border border-[#00D9A3]/25 bg-[#18282E] p-4 shadow-[0_0_20px_rgba(0,217,165,0.2)]">
              <div className="flex items-start gap-2 text-sm text-white">
                <Clock className="mt-0.5 size-4 shrink-0 text-[#00D9A3]" />
                {next ? (
                  <span>
                    ⏰ Ka mbetur edhe {Math.max(0, next.minsLeft)} min deri në Namazin e{" "}
                    <span className="font-bold text-[#00D9A3]">{next.name}</span> ({next.time})
                  </span>
                ) : (
                  <span className="text-[#9CA3AF]">Kohët po sinkronizohen…</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {PRAYERS.map((p) => (
                <div
                  key={p}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-[#00D9A3]/15 bg-[#0B1E24] p-3"
                >
                  <span className="text-sm font-semibold text-white">{p}</span>
                  <Switch on={!!alerts[p]} onToggle={() => toggle(p)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {showUpdates && (
          <div className="space-y-2">
            {UPDATES.map((u) => (
              <div
                key={u.text}
                className="flex items-start gap-3 rounded-2xl border border-[#00D9A3]/15 bg-[#0B1E24] p-3"
              >
                <span className="text-base leading-none">{u.icon}</span>
                <span className="min-w-0 flex-1 text-sm leading-relaxed text-white">{u.text}</span>
                <span
                  className={["shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-bold", u.tone].join(
                    " ",
                  )}
                >
                  {u.tag}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#00D9A3]/25 bg-[#18282E] p-4">
          <span className="flex items-center gap-2 text-sm font-semibold text-white">
            <BellRing className="size-4 text-[#00D9A3]" /> Njoftimet e Shfletuesit
          </span>
          <Switch on={push} onToggle={() => void enablePush()} />
        </div>
      </div>
    </Modal>
  );
}

export function NotificationBell({ onClick }: { onClick: () => void }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const sync = () => {
      let read = 0;
      try {
        read = Number(window.localStorage.getItem(READ_KEY) ?? 0);
      } catch {
        /* ignore */
      }
      setUnread(Math.max(0, UPDATES.length - read));
    };
    sync();
    window.addEventListener("vaktia:notifications-read", sync);
    return () => window.removeEventListener("vaktia:notifications-read", sync);
  }, []);

  return (
    <motion.button
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Njoftimet"
      onClick={onClick}
      className="relative grid size-9 place-items-center rounded-full border border-[#00D9A3]/20 bg-[#18282E] text-white/80 transition hover:border-[#00D9A3]/60 hover:text-[#00D9A3]"
    >
      <Bell className="size-4" />
      {unread > 0 && (
        <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#00D9A3] shadow-[0_0_10px_#00D9A3]" />
      )}
    </motion.button>
  );
}

export const NOTIFICATION_ICON = Sparkles;
