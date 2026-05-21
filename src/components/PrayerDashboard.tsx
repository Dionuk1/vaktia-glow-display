import { useEffect, useMemo, useState } from "react";
import { Settings, MapPin } from "lucide-react";
import {
  getTimesForDate,
  CARD_KEYS,
  CARD_LABELS,
  type DayTimes,
} from "@/lib/prayer-data";

type Offsets = Record<keyof DayTimes, number>;

const ZERO_OFFSETS: Offsets = {
  imsaku: 0, sabahu: 0, lindja: 0, dreka: 0, ikindia: 0, akshami: 0, jacia: 0,
};

const STORAGE_KEY = "vaktia-offsets-v1";

function loadOffsets(): Offsets {
  if (typeof window === "undefined") return ZERO_OFFSETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ZERO_OFFSETS;
    return { ...ZERO_OFFSETS, ...JSON.parse(raw) };
  } catch {
    return ZERO_OFFSETS;
  }
}

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function fmtMin(n: number) {
  const h = Math.floor(n / 60) % 24;
  const m = ((n % 60) + 60) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function applyOffsets(times: DayTimes, offsets: Offsets): DayTimes {
  const out = {} as DayTimes;
  (Object.keys(times) as (keyof DayTimes)[]).forEach((k) => {
    out[k] = fmtMin(toMin(times[k]) + offsets[k]);
  });
  return out;
}

function formatClock(d: Date) {
  return [d.getHours(), d.getMinutes(), d.getSeconds()]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

function formatGregorian(d: Date) {
  return d.toLocaleDateString("sq-AL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Simple Hijri approximation
function formatHijri(d: Date): string {
  try {
    return new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return "";
  }
}

function formatCountdown(secs: number): string {
  const s = Math.max(0, Math.floor(secs));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function PrayerDashboard() {
  const [now, setNow] = useState(() => new Date());
  const [offsets, setOffsets] = useState<Offsets>(() => loadOffsets());
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const times = useMemo(
    () => applyOffsets(getTimesForDate(now), offsets),
    [now.getDate(), now.getMonth(), now.getFullYear(), offsets]
  );

  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  // Determine next prayer among CARD_KEYS
  const next = useMemo(() => {
    for (const k of CARD_KEYS) {
      const t = toMin(times[k]);
      if (t > nowMin) return { key: k, minutes: t };
    }
    // After last prayer → next is tomorrow's first
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tTimes = applyOffsets(getTimesForDate(tomorrow), offsets);
    return { key: CARD_KEYS[0], minutes: toMin(tTimes[CARD_KEYS[0]]) + 24 * 60 };
  }, [times, nowMin, offsets, now]);

  const remainingSecs = (next.minutes - nowMin) * 60;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background bg-radial-glow text-foreground">
      {/* Subtle pattern overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative flex h-full w-full flex-col p-[2vh] gap-[2vh]">
        {/* HEADER */}
        <header className="flex items-center justify-between rounded-3xl bg-surface/60 backdrop-blur card-glow px-[3vw] py-[2vh]">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-[1.5vh] uppercase tracking-[0.3em] text-muted-foreground">
              <MapPin className="size-[1.8vh]" />
              Prishtinë, Kosovë
            </div>
            <div className="text-[2.4vh] font-medium text-foreground/90 capitalize">
              {formatGregorian(now)}
            </div>
            <div className="text-[1.8vh] text-muted-foreground" dir="rtl">
              {formatHijri(now)}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <div className="font-bold tabular-nums leading-none text-foreground text-[14vh] tracking-tight">
              {formatClock(now)}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="text-[1.5vh] uppercase tracking-[0.3em] text-muted-foreground">
              Koha e mbetur
            </div>
            <div className="text-[2.2vh] text-foreground/80">
              {CARD_LABELS[next.key]} pas
            </div>
            <div className="text-[5vh] font-bold tabular-nums leading-none text-primary">
              {formatCountdown(remainingSecs)}
            </div>
          </div>
        </header>

        {/* GRID */}
        <main className="grid flex-1 grid-cols-3 grid-rows-2 gap-[2vh]">
          {CARD_KEYS.map((k) => {
            const isActive = k === next.key;
            return (
              <div
                key={k}
                className={[
                  "relative flex flex-col items-center justify-center rounded-3xl p-[2vh] transition-all duration-500",
                  isActive
                    ? "bg-gradient-to-br from-surface-elevated to-surface card-active"
                    : "bg-surface/70 card-glow",
                ].join(" ")}
              >
                {isActive && (
                  <div className="absolute top-[2vh] right-[2vh] flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-[1.3vh] font-semibold uppercase tracking-widest text-primary">
                    <span className="size-2 animate-pulse rounded-full bg-primary" />
                    Tjetra
                  </div>
                )}
                <div
                  className={[
                    "text-[3vh] font-medium uppercase tracking-[0.2em]",
                    isActive ? "text-primary" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {CARD_LABELS[k]}
                </div>
                <div
                  className={[
                    "mt-[1vh] font-bold tabular-nums leading-none text-[12vh]",
                    isActive ? "text-foreground" : "text-foreground/85",
                  ].join(" ")}
                >
                  {times[k]}
                </div>
              </div>
            );
          })}
        </main>
      </div>

      {/* Settings */}
      <button
        onClick={() => setShowSettings(true)}
        aria-label="Cilësimet"
        className="absolute bottom-3 right-3 rounded-full p-2 text-muted-foreground/50 hover:text-foreground hover:bg-surface transition"
      >
        <Settings className="size-5" />
      </button>

      {showSettings && (
        <SettingsModal
          offsets={offsets}
          onClose={() => setShowSettings(false)}
          onChange={(o) => {
            setOffsets(o);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(o)); } catch {}
          }}
        />
      )}
    </div>
  );
}

function SettingsModal({
  offsets,
  onClose,
  onChange,
}: {
  offsets: Offsets;
  onClose: () => void;
  onChange: (o: Offsets) => void;
}) {
  const adjust = (k: keyof Offsets, delta: number) => {
    const next = { ...offsets, [k]: Math.max(-30, Math.min(30, offsets[k] + delta)) };
    onChange(next);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-surface-elevated p-6 card-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Rregullimi i kohëve</h2>
          <button
            onClick={onClose}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Mbyll
          </button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Shto ose largo minuta nga koha e secilës falje (±30 min).
        </p>
        <div className="space-y-2">
          {CARD_KEYS.map((k) => (
            <div
              key={k}
              className="flex items-center justify-between rounded-xl bg-surface px-4 py-3"
            >
              <span className="font-medium">{CARD_LABELS[k]}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjust(k, -1)}
                  className="size-9 rounded-lg bg-background hover:bg-muted text-lg font-bold"
                >
                  −
                </button>
                <span className="w-16 text-center tabular-nums font-semibold">
                  {offsets[k] > 0 ? `+${offsets[k]}` : offsets[k]} min
                </span>
                <button
                  onClick={() => adjust(k, +1)}
                  className="size-9 rounded-lg bg-background hover:bg-muted text-lg font-bold"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
