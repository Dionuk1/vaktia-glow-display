import { useEffect, useMemo, useState } from "react";
import { Settings, MapPin } from "lucide-react";
import {
  getTimesForDate,
  CARD_KEYS,
  CARD_LABELS,
  CITY_OFFSETS,
  CITY_LABELS,
  type CityKey,
  type DayTimes,
} from "@/lib/prayer-data";

type Offsets = Record<keyof DayTimes, number>;

const ZERO_OFFSETS: Offsets = {
  imsaku: 0, sabahu: 0, lindja: 0, dreka: 0, ikindia: 0, akshami: 0, jacia: 0,
};

const CITY_KEY = "vaktia-city-v1";

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
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const [offsets, setOffsets] = useState<Offsets>(ZERO_OFFSETS);
  const [city, setCity] = useState<CityKey>("Prishtina");
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setMounted(true);
    setOffsets(loadOffsets());
    try {
      const c = localStorage.getItem(CITY_KEY) as CityKey | null;
      if (c && c in CITY_OFFSETS) setCity(c);
    } catch {}
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const times = useMemo(
    () => applyOffsets(getTimesForDate(now, city), offsets),
    [now.getDate(), now.getMonth(), now.getFullYear(), offsets, city]
  );

  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  const next = useMemo(() => {
    for (const k of CARD_KEYS) {
      const t = toMin(times[k]);
      if (t > nowMin) return { key: k, minutes: t };
    }
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tTimes = applyOffsets(getTimesForDate(tomorrow, city), offsets);
    return { key: CARD_KEYS[0], minutes: toMin(tTimes[CARD_KEYS[0]]) + 24 * 60 };
  }, [times, nowMin, offsets, now, city]);

  const remainingSecs = (next.minutes - nowMin) * 60;

  if (!mounted) {
    // Avoid SSR/locale hydration mismatch — render blank shell
    return <div className="h-screen w-screen bg-background" />;
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background bg-radial-glow text-foreground">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative flex h-full w-full flex-col gap-3 p-3 sm:gap-[2vh] sm:p-[2vh]">
        {/* HEADER */}
        <header className="flex flex-col gap-3 rounded-3xl bg-surface/60 backdrop-blur card-glow p-4 sm:flex-row sm:items-center sm:justify-between sm:px-[3vw] sm:py-[2vh]">
          {/* Clock */}
          <div className="order-1 flex flex-col items-center sm:order-2">
            <div className="font-bold tabular-nums leading-none text-foreground text-[14vw] sm:text-[14vh] tracking-tight">
              {formatClock(now)}
            </div>
          </div>

          {/* Location + date */}
          <div className="order-2 flex flex-col items-center gap-1 text-center sm:order-1 sm:items-start sm:text-left">
            <div className="flex items-center gap-2 text-[11px] sm:text-[1.5vh] uppercase tracking-[0.3em] text-muted-foreground">
              <MapPin className="size-3 sm:size-[1.8vh]" />
              {CITY_LABELS[city]}, Kosovë · BIK
            </div>
            <div className="text-sm sm:text-[2.4vh] font-medium text-foreground/90 capitalize">
              {formatGregorian(now)}
            </div>
            <div className="text-xs sm:text-[1.8vh] text-muted-foreground" dir="rtl">
              {formatHijri(now)}
            </div>
          </div>

          {/* Countdown */}
          <div className="order-3 flex flex-col items-center gap-1 sm:items-end">
            <div className="text-[11px] sm:text-[1.5vh] uppercase tracking-[0.3em] text-muted-foreground">
              Koha e mbetur
            </div>
            <div className="text-sm sm:text-[2.2vh] text-foreground/80">
              {CARD_LABELS[next.key]} pas
            </div>
            <div className="text-3xl sm:text-[5vh] font-bold tabular-nums leading-none text-primary">
              {formatCountdown(remainingSecs)}
            </div>
          </div>
        </header>

        {/* GRID */}
        <main className="grid flex-1 min-h-0 grid-cols-2 grid-rows-3 gap-3 sm:grid-cols-3 sm:grid-rows-2 sm:gap-[2vh]">
          {CARD_KEYS.map((k) => {
            const isActive = k === next.key;
            return (
              <div
                key={k}
                className={[
                  "relative flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl p-2 sm:p-[2vh] transition-all duration-500",
                  isActive
                    ? "bg-gradient-to-br from-surface-elevated to-surface card-active"
                    : "bg-surface/70 card-glow",
                ].join(" ")}
              >
                {isActive && (
                  <div className="absolute top-2 right-2 sm:top-[2vh] sm:right-[2vh] flex items-center gap-1.5 rounded-full bg-primary/15 px-2 py-0.5 sm:px-3 sm:py-1 text-[9px] sm:text-[1.3vh] font-semibold uppercase tracking-widest text-primary">
                    <span className="size-1.5 sm:size-2 animate-pulse rounded-full bg-primary" />
                    Tjetra
                  </div>
                )}
                <div
                  className={[
                    "text-[10px] sm:text-[3vh] font-medium uppercase tracking-[0.2em] text-center px-1",
                    isActive ? "text-primary" : "text-muted-foreground",
                  ].join(" ")}
                >
                  {CARD_LABELS[k]}
                </div>
                <div
                  className={[
                    "mt-1 sm:mt-[1vh] font-bold tabular-nums leading-none text-[7vw] sm:text-[12vh]",
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

      <button
        onClick={() => setShowSettings(true)}
        aria-label="Cilësimet"
        className="absolute bottom-3 right-3 rounded-full p-2 text-muted-foreground/60 hover:text-foreground hover:bg-surface transition"
      >
        <Settings className="size-5" />
      </button>

      {showSettings && (
        <SettingsModal
          offsets={offsets}
          city={city}
          onClose={() => setShowSettings(false)}
          onChange={(o) => {
            setOffsets(o);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(o)); } catch {}
          }}
          onCityChange={(c) => {
            setCity(c);
            try { localStorage.setItem(CITY_KEY, c); } catch {}
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
        className="w-full max-w-lg rounded-3xl bg-surface-elevated p-6 card-glow max-h-[90vh] overflow-y-auto"
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
