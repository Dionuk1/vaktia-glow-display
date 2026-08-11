import { useEffect, useMemo, useState } from "react";
import { Settings, MapPin, RefreshCw, Check, AlertCircle, ChevronDown, Compass, Hand, Sunrise, Sunset, Sun, SunMedium, SunDim, Moon, MoonStar, X } from "lucide-react";
import TasbihCounter from "./TasbihCounter";
import VoluntaryDhikr from "./VoluntaryDhikr";
import QiblaCompass from "./QiblaCompass";
import {
  getMonthTimesForLocation,
  getTimesForLocation,
  CARD_KEYS,
  CARD_LABELS,
  CITY_OFFSETS,
  CITY_LABELS,
  ALBANIA_CITIES,
  ALBANIA_CITY_LABELS,
  
  getCityLabel,
  getRegionLabel,
  fetchLatestFromBIK,
  fetchLiveTodayFromBislame,
  getRemoteMeta,
  type CityKey,
  type AlbaniaCityKey,
  type AnyCityKey,
  type RegionKey,
  type DayTimes,
  type RemoteMeta,
} from "@/lib/prayer-data";

type Offsets = Record<keyof DayTimes, number>;

const ZERO_OFFSETS: Offsets = {
  imsaku: 0, sabahu: 0, lindja: 0, dreka: 0, ikindia: 0, akshami: 0, jacia: 0,
};

const PRAYER_ICONS: Record<keyof DayTimes, typeof Sun> = {
  imsaku: Moon,
  sabahu: Sunrise,
  lindja: Sun,
  dreka: SunMedium,
  ikindia: SunDim,
  akshami: Sunset,
  jacia: MoonStar,
};


const REGION_KEY = "vaktia-region-v1";
const CITY_KEY = "vaktia-city-v1";
const AL_CITY_KEY = "vaktia-al-city-v1";

const STORAGE_KEY = "vaktia-offsets-v1";
const GLOBAL_OFFSET_KEY = "vaktia-global-offset-v1";

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
  const [globalOffset, setGlobalOffset] = useState<number>(0);
  const [region, setRegion] = useState<RegionKey>("Kosove");
  const [city, setCity] = useState<CityKey>("Prishtina");
  const [alCity, setAlCity] = useState<AlbaniaCityKey>("Shkoder");
  const [showSettings, setShowSettings] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  const [remoteMeta, setRemoteMeta] = useState<RemoteMeta | null>(null);

  const activeCity: AnyCityKey = region === "Shqiperi" ? alCity : city;

  useEffect(() => {
    setMounted(true);
    setOffsets(loadOffsets());
    setRemoteMeta(getRemoteMeta());
    try {
      const r = localStorage.getItem(REGION_KEY) as RegionKey | null;
      if (r === "Kosove" || r === "Shqiperi") setRegion(r);
      const c = localStorage.getItem(CITY_KEY) as CityKey | null;
      if (c && c in CITY_OFFSETS) setCity(c);
      const ac = localStorage.getItem(AL_CITY_KEY) as AlbaniaCityKey | null;
      if (ac && (ALBANIA_CITIES as readonly string[]).includes(ac)) setAlCity(ac);
      const g = localStorage.getItem(GLOBAL_OFFSET_KEY);
      if (g !== null) setGlobalOffset(Number(g) || 0);
    } catch {}
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);

    // Live sync with bislame.net/namazet/ — refresh on mount + every hour
    const syncLive = () => {
      fetchLiveTodayFromBislame()
        .then(() => setDataVersion((v) => v + 1))
        .catch(() => {});
    };
    syncLive();
    const liveId = setInterval(syncLive, 60 * 60 * 1000);
    return () => {
      clearInterval(id);
      clearInterval(liveId);
    };
  }, []);

  const effectiveOffsets = useMemo<Offsets>(() => {
    const out = {} as Offsets;
    (Object.keys(offsets) as (keyof Offsets)[]).forEach((k) => {
      out[k] = offsets[k] + globalOffset;
    });
    return out;
  }, [offsets, globalOffset]);

  const times = useMemo(() => {
    const base = getTimesForLocation(now, region, activeCity);
    return region === "Shqiperi" ? base : applyOffsets(base, effectiveOffsets);
  }, [now.getDate(), now.getMonth(), now.getFullYear(), effectiveOffsets, region, activeCity, dataVersion]);

  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;

  // Active prayer: most recent prayer started within last 20 minutes
  const activePrayer = useMemo(() => {
    let active: { key: typeof CARD_KEYS[number]; startedMin: number } | null = null;
    for (const k of CARD_KEYS) {
      const t = toMin(times[k]);
      if (nowMin >= t && nowMin - t <= 20) {
        active = { key: k, startedMin: t };
      }
    }
    return active;
  }, [times, nowMin]);

  const next = useMemo(() => {
    for (const k of CARD_KEYS) {
      const t = toMin(times[k]);
      if (t > nowMin) return { key: k, minutes: t };
    }
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const baseT = getTimesForLocation(tomorrow, region, activeCity);
    const tTimes = region === "Shqiperi" ? baseT : applyOffsets(baseT, effectiveOffsets);
    return { key: CARD_KEYS[0], minutes: toMin(tTimes[CARD_KEYS[0]]) + 24 * 60 };
  }, [times, nowMin, effectiveOffsets, now, region, activeCity, dataVersion]);

  const remainingSecs = (next.minutes - nowMin) * 60;
  const isFriday = now.getDay() === 5;
  const nearingAdhan = remainingSecs > 0 && remainingSecs <= 240 && !activePrayer;

  // 4-minute proximity popup
  const [alertDismissedFor, setAlertDismissedFor] = useState<string | null>(null);
  useEffect(() => {
    // Reset dismissal when the "next" prayer changes
    setAlertDismissedFor(null);
  }, [next.key]);
  const showAlertPopup = nearingAdhan && alertDismissedFor !== next.key;

  const updateGlobalOffset = (n: number) => {
    setGlobalOffset(n);
    try { localStorage.setItem(GLOBAL_OFFSET_KEY, String(n)); } catch {}
  };


  if (!mounted) {
    // Avoid SSR/locale hydration mismatch — render blank shell
    return <div className="h-screen w-screen bg-background" />;
  }


  return (
    <div className="relative w-full min-h-screen bg-background bg-radial-glow text-foreground">
      {showAlertPopup && (
        <ProximityAlertPopup
          prayerLabel={CARD_LABELS[next.key]}
          entryTime={times[next.key]}
          remainingSecs={remainingSecs}
          onDismiss={() => setAlertDismissedFor(next.key)}
        />
      )}
      <div className="relative min-h-screen w-full pb-20">

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
          <div className="order-2 flex flex-col items-center gap-1.5 text-center sm:order-1 sm:items-start sm:text-left">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface/60 px-3 py-1.5 text-[11px] sm:text-[1.5vh] uppercase tracking-[0.25em] text-foreground/90 hover:border-primary/40 hover:text-primary transition"
              aria-label="Ndrysho vendndodhjen"
            >
              <MapPin className="size-3 sm:size-[1.6vh]" />
              <span>
                {getCityLabel(region, activeCity)}, {region === "Shqiperi" ? "Shqipëri 🇦🇱" : "Kosovë 🇽🇰"}
              </span>
            </button>
            <div className="text-sm sm:text-[2.4vh] font-medium text-foreground/90 capitalize">
              {formatGregorian(now)}
            </div>
            <div className="text-xs sm:text-[1.8vh] text-muted-foreground" dir="rtl">
              {formatHijri(now)}
            </div>
          </div>

          {/* Countdown OR active prayer alert */}
          <div className="order-3 flex flex-col items-center gap-1 sm:items-end">
            {activePrayer ? (
              <>
                <div className="text-[11px] sm:text-[1.5vh] uppercase tracking-[0.3em] text-primary/80">
                  {CARD_LABELS[activePrayer.key]}
                </div>
                <div className="rounded-2xl px-4 py-2 sm:px-5 sm:py-3 bg-primary/15 ring-1 ring-primary/40 animate-pulse-glow">
                  <div className="text-base sm:text-[2.6vh] font-bold text-primary leading-tight text-center sm:text-right">
                    Tani është koha e namazit!
                  </div>
                  <div className="text-xs sm:text-[1.6vh] text-primary/80 text-center sm:text-right">
                    Faluni 🤲
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-[11px] sm:text-[1.5vh] uppercase tracking-[0.3em] text-muted-foreground">
                  Koha e mbetur
                </div>
                <div className="text-sm sm:text-[2.2vh] text-foreground/80">
                  {CARD_LABELS[next.key]} pas
                </div>
                <div
                  className={[
                    "text-3xl sm:text-[5vh] font-bold tabular-nums leading-none",
                    nearingAdhan ? "animate-amber-pulse" : "text-primary",
                  ].join(" ")}
                >
                  {formatCountdown(remainingSecs)}
                </div>
              </>
            )}

          </div>
        </header>

        {isFriday && (
          <div className="flex items-center justify-center gap-2 rounded-2xl bg-primary/10 ring-1 ring-primary/30 px-4 py-2 text-center text-xs sm:text-sm text-primary/90 backdrop-blur">
            <span className="size-2 rounded-full bg-primary animate-pulse" />
            <span className="font-medium">
              Sot e Xhuma: Ligjërata (Hytbeja) në 12:45 · Namazi në 13:00
            </span>
          </div>
        )}


        {/* GRID — 7 cards: mobile 2 cols (last spans 2), desktop 7 cols × 1 row */}
        <main className="grid flex-1 min-h-0 grid-cols-2 grid-rows-4 gap-3 sm:flex-none sm:h-[46vh] sm:my-auto sm:grid-cols-7 sm:grid-rows-1 sm:gap-[1.5vh]">
          {CARD_KEYS.map((k, i) => {
            const isActive = k === next.key;
            const isLast = i === CARD_KEYS.length - 1;
            const Icon = PRAYER_ICONS[k];
            return (
              <div
                key={k}
                  className={[
                    "relative flex flex-col items-center justify-center gap-2 rounded-3xl p-3 sm:p-[1.5vh] transition-all duration-500",
                    isLast ? "col-span-2 sm:col-span-1" : "",
                    isActive
                      ? "bg-gradient-to-br from-primary/20 via-surface-elevated to-surface card-active"
                      : "bg-surface/70 card-glow",
                  ].join(" ")}
              >
                {isActive && (
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/20 px-2.5 py-0.5 text-[8px] sm:text-[1vh] font-semibold uppercase tracking-[0.15em] text-primary whitespace-nowrap">
                    <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                    Namazi i Ardhshëm
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Icon
                    className={[
                      "size-6 sm:size-[3.4vh]",
                      isActive ? "text-primary" : "text-muted-foreground/70",
                    ].join(" ")}
                    strokeWidth={1.5}
                  />
                  <div
                    className={[
                      "text-[10px] sm:text-[1.8vh] font-medium uppercase tracking-[0.18em] whitespace-nowrap",
                      isActive ? "text-primary" : "text-muted-foreground",
                    ].join(" ")}
                  >
                    {CARD_LABELS[k]}
                  </div>
                </div>
                <div
                  className={[
                    "font-bold tabular-nums leading-none text-[8vw] sm:text-[6.5vh]",
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

        {/* Scroll cue */}
        <a
          href="#more"
          className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground/70 hover:text-foreground transition"
        >
          Më shumë
          <ChevronDown className="size-4 animate-bounce" />
        </a>

        <button
          onClick={() => setShowSettings(true)}
          aria-label="Cilësimet"
          className="absolute bottom-3 right-3 rounded-full p-2 text-muted-foreground/60 hover:text-foreground hover:bg-surface transition"
        >
          <Settings className="size-5" />
        </button>
      </div>

      {/* SCROLLABLE EXTRA SECTION */}
      <ExtraSection now={now} region={region} city={activeCity} dataVersion={dataVersion} offsets={effectiveOffsets} globalOffset={globalOffset} onGlobalOffsetChange={updateGlobalOffset} />

      {showSettings && (
        <SettingsModal
          offsets={offsets}
          region={region}
          city={city}
          alCity={alCity}
          remoteMeta={remoteMeta}
          onClose={() => setShowSettings(false)}
          onChange={(o) => {
            setOffsets(o);
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(o)); } catch {}
          }}
          onRegionChange={(r) => {
            setRegion(r);
            try { localStorage.setItem(REGION_KEY, r); } catch {}
          }}
          onCityChange={(c) => {
            setCity(c);
            try { localStorage.setItem(CITY_KEY, c); } catch {}
          }}
          onAlCityChange={(c) => {
            setAlCity(c);
            try { localStorage.setItem(AL_CITY_KEY, c); } catch {}
          }}
          onUpdated={(meta) => {
            setRemoteMeta(meta);
            setDataVersion((v) => v + 1);
          }}
        />
      )}
    </div>
  );
}

const DAILY_HADITHS = [
  { ar: "إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ", sq: "Veprat vlerësohen sipas qëllimeve.", src: "Buhariu & Muslimi" },
  { ar: "مَنْ لَا يَرْحَمُ لَا يُرْحَمُ", sq: "Kush nuk mëshiron, nuk mëshirohet.", src: "Buhariu" },
  { ar: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", sq: "Musliman është ai prej gjuhës e dorës së të cilit janë të sigurt muslimanët.", src: "Buhariu" },
  { ar: "الدِّينُ النَّصِيحَةُ", sq: "Feja është këshillë e sinqertë.", src: "Muslimi" },
  { ar: "خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ", sq: "Më i miri prej jush është ai që sillet më mirë me familjen e tij.", src: "Tirmidhiu" },
  { ar: "الطُّهُورُ شَطْرُ الْإِيمَانِ", sq: "Pastërtia është gjysma e besimit.", src: "Muslimi" },
  { ar: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", sq: "Askush prej jush nuk beson plotësisht derisa të dojë për vëllanë e tij atë që do për veten.", src: "Buhariu" },
];

const MONTH_NAMES_SQ = [
  "Janar","Shkurt","Mars","Prill","Maj","Qershor",
  "Korrik","Gusht","Shtator","Tetor","Nëntor","Dhjetor",
];

function ExtraSection({
  now, region, city, dataVersion, offsets, globalOffset, onGlobalOffsetChange,
}: { now: Date; region: RegionKey; city: AnyCityKey; dataVersion: number; offsets: Offsets; globalOffset: number; onGlobalOffsetChange: (n: number) => void }) {
  const month = now.getMonth();
  const year = now.getFullYear();
  const today = now.getDate();
  const isAlbania = region === "Shqiperi";

  const rows = useMemo(
    () => getMonthTimesForLocation(year, month, region, city).map((r) => ({
      date: r.date,
      times: isAlbania ? r.times : applyOffsets(r.times, offsets),
    })),
    [year, month, region, city, dataVersion, offsets, isAlbania]
  );

  return (
    <section id="more" className="relative w-full px-3 py-8 sm:px-[3vw] sm:py-12 space-y-6 sm:space-y-10">
      {/* Busulla-Kibla card */}
      <div className="rounded-3xl bg-surface/60 backdrop-blur card-glow p-5 sm:p-7">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <Compass className="size-4" /> Busulla-Kibla
          </div>
          <div className="text-xs text-muted-foreground">
            {getCityLabel(region, city)} · CET
          </div>
        </div>
        <QiblaCompass />
      </div>

      {/* Dhikr / Tasbih counter */}
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 px-1">
          <Hand className="size-4" /> Tesbihu pas namazit
        </div>
        <TasbihCounter />
      </div>

      {/* Voluntary dhikr */}
      <div>
        <VoluntaryDhikr />
      </div>
      {/* Features showcase */}
      <div id="features">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 px-1">
          <Sparkles className="size-4" /> Veçoritë e VaktiaKS
        </div>
        <FeatureShowcaseGrid onOpen={setFeatureModal} />
      </div>
      <FeatureModalHost open={featureModal} onClose={() => setFeatureModal(null)} />


      {/* Monthly table */}
      <div className="rounded-3xl bg-surface/60 backdrop-blur card-glow overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-border">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Orari mujor
            </div>
            <div className="text-lg sm:text-xl font-semibold mt-1">
              {MONTH_NAMES_SQ[month]} {year} · {getCityLabel(region, city)}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm sm:text-base">
            <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-surface/40">
              <tr>
                <th className="px-3 py-3 text-left font-medium">Data</th>
                {CARD_KEYS.map((k) => (
                  <th key={k} className="px-3 py-3 text-center font-medium">
                    {CARD_LABELS[k]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const isToday = r.date.getDate() === today;
                return (
                  <tr
                    key={r.date.toISOString()}
                    className={[
                      "border-t border-border/60 transition",
                      isToday ? "bg-primary/10 text-foreground font-semibold" : "text-foreground/85 hover:bg-surface/40",
                    ].join(" ")}
                  >
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      {String(r.date.getDate()).padStart(2, "0")}.{String(month + 1).padStart(2, "0")}
                      <span className="ml-2 text-xs text-muted-foreground capitalize">
                        {r.date.toLocaleDateString("sq-AL", { weekday: "short" })}
                      </span>
                    </td>
                    {CARD_KEYS.map((k) => (
                      <td key={k} className="px-3 py-2.5 text-center tabular-nums">
                        {r.times[k]}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global offset widget — Kosovë only (Shqipëri ka tabela të plota për qytet) */}
      {!isAlbania && (
        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70">
            Ndryshimi i takvimit
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {[-2, -1, 0, 1, 2, 3].map((n) => {
              const active = globalOffset === n;
              const label = n === 0 ? "Prishtinë (0)" : `${n > 0 ? "+" : ""}${n} min`;
              return (
                <button
                  key={n}
                  onClick={() => onGlobalOffsetChange(n)}
                  className={[
                    "rounded-full px-3 py-1 text-xs font-medium transition border",
                    active
                      ? "bg-primary/20 text-primary border-primary/40"
                      : "bg-surface/40 text-muted-foreground border-border hover:text-foreground hover:bg-surface",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground pb-2">
        {isAlbania
          ? "Të dhënat zyrtare nga Komuniteti Mysliman i Shqipërisë (KMSH)."
          : "Të dhënat zyrtare nga Bashkësia Islame e Kosovës (BIK)."}
      </p>


    </section>
  );
}

function SettingsModal({
  offsets,
  region,
  city,
  alCity,
  remoteMeta,
  onClose,
  onChange,
  onRegionChange,
  onCityChange,
  onAlCityChange,
  onUpdated,
}: {
  offsets: Offsets;
  region: RegionKey;
  city: CityKey;
  alCity: AlbaniaCityKey;
  remoteMeta: RemoteMeta | null;
  onClose: () => void;
  onChange: (o: Offsets) => void;
  onRegionChange: (r: RegionKey) => void;
  onCityChange: (c: CityKey) => void;
  onAlCityChange: (c: AlbaniaCityKey) => void;
  onUpdated: (meta: RemoteMeta) => void;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [errMsg, setErrMsg] = useState<string>("");

  const adjust = (k: keyof Offsets, delta: number) => {
    const next = { ...offsets, [k]: Math.max(-30, Math.min(30, offsets[k] + delta)) };
    onChange(next);
  };

  const handleUpdate = async () => {
    setStatus("loading");
    setErrMsg("");
    try {
      const meta = await fetchLatestFromBIK();
      onUpdated(meta);
      setStatus("ok");
      setTimeout(() => setStatus("idle"), 2500);
    } catch (e) {
      setErrMsg(e instanceof Error ? e.message : "Gabim i panjohur");
      setStatus("err");
    }
  };

  const lastUpdated = remoteMeta
    ? new Date(remoteMeta.updatedAt).toLocaleString("sq-AL", {
        day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      })
    : null;

  const regionOptions: { key: RegionKey; label: string }[] = [
    { key: "Kosove", label: "Kosovë 🇽🇰" },
    { key: "Shqiperi", label: "Shqipëri 🇦🇱" },
  ];

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
            className="text-sm font-semibold text-primary hover:opacity-80 rounded-full px-3 py-1.5 border border-primary/40 bg-primary/10"
          >
            Mbyll
          </button>
        </div>

        {region === "Kosove" && (
          <div className="mb-5 rounded-2xl bg-surface p-4 border border-border">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground">
                  Të dhënat BIK
                </div>
                <div className="text-sm font-medium mt-1">
                  {lastUpdated
                    ? `Përditësuar: ${lastUpdated}${remoteMeta?.year ? ` (Takvimi ${remoteMeta.year})` : ""}`
                    : "Po përdoren të dhënat e ndërtuara në app"}
                </div>
              </div>
              <button
                onClick={handleUpdate}
                disabled={status === "loading"}
                className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
              >
                <RefreshCw className={`size-4 ${status === "loading" ? "animate-spin" : ""}`} />
                Përditëso
              </button>
            </div>
            {status === "ok" && (
              <div className="flex items-center gap-2 text-xs text-primary mt-2">
                <Check className="size-3.5" /> Të dhënat u përditësuan me sukses.
              </div>
            )}
            {status === "err" && (
              <div className="flex items-center gap-2 text-xs text-destructive mt-2">
                <AlertCircle className="size-3.5" /> Dështoi përditësimi: {errMsg}
              </div>
            )}
          </div>
        )}

        {/* Region toggle */}
        <div className="mb-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Shteti
          </div>
          <div className="grid grid-cols-2 gap-2">
            {regionOptions.map((r) => {
              const active = region === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => onRegionChange(r.key)}
                  className={[
                    "rounded-xl px-4 py-3 text-sm font-semibold transition border",
                    active
                      ? "bg-primary/15 text-primary border-primary shadow-[0_0_20px_-4px_hsl(var(--primary)/0.6)]"
                      : "bg-surface text-foreground/80 border-border hover:text-foreground hover:border-primary/40",
                  ].join(" ")}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic city dropdown */}
        <div className="mb-5">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Qyteti
          </div>
          {region === "Kosove" ? (
            <select
              value={city}
              onChange={(e) => onCityChange(e.target.value as CityKey)}
              className="w-full rounded-xl bg-surface px-4 py-3 font-medium border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {(Object.keys(CITY_LABELS) as CityKey[]).map((c) => (
                <option key={c} value={c}>{CITY_LABELS[c]}</option>
              ))}
            </select>
          ) : (
            <select
              value={alCity}
              onChange={(e) => onAlCityChange(e.target.value as AlbaniaCityKey)}
              className="w-full rounded-xl bg-surface px-4 py-3 font-medium border border-border focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {(ALBANIA_CITIES as readonly AlbaniaCityKey[]).map((c) => (
                <option key={c} value={c}>{ALBANIA_CITY_LABELS[c]}</option>
              ))}
            </select>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {region === "Kosove"
              ? "Të dhënat zyrtare nga BIK, me korrigjim minutash sipas qytetit."
              : "Të dhënat zyrtare nga KMSH për qytetin e zgjedhur."}
          </p>
        </div>


        <p className="text-sm text-muted-foreground mb-3">
          Rregullimi manual i kohëve (±30 min):
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

function ProximityAlertPopup({
  prayerLabel,
  entryTime,
  remainingSecs,
  onDismiss,
}: {
  prayerLabel: string;
  entryTime: string;
  remainingSecs: number;
  onDismiss: () => void;
}) {
  const flooredSecs = Math.max(0, Math.floor(remainingSecs));
  const mm = Math.floor(flooredSecs / 60);
  const ss = flooredSecs % 60;

  useEffect(() => {
    if (flooredSecs <= 0) {
      onDismiss();
    }
  }, [flooredSecs, onDismiss]);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-background/70 backdrop-blur-md p-4 animate-in fade-in duration-300"
      onClick={onDismiss}
    >
      <div
        className="relative w-full max-w-md rounded-3xl border border-primary/40 bg-gradient-to-br from-surface-elevated via-surface to-background p-8 text-center card-active"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 rounded-full p-1.5 text-muted-foreground hover:bg-surface hover:text-foreground transition"
          aria-label="Mbyll"
        >
          <X className="size-4" />
        </button>
        <div className="text-[10px] uppercase tracking-[0.4em] text-primary/80 mb-2">
          • Namazi i Ardhshëm
        </div>
        <div className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
          {prayerLabel}
        </div>
        <div className="px-2">
          <div className="text-6xl sm:text-7xl font-black tabular-nums leading-none text-foreground animate-gentle-pulse">
            {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
          </div>
        </div>
        <div className="mt-6 text-sm uppercase tracking-[0.3em] text-muted-foreground">
          Në orën
        </div>
        <div className="text-3xl font-bold tabular-nums text-primary mt-1">
          {entryTime}
        </div>
      </div>
    </div>
  );
}


