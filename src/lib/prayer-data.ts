// Official prayer times sourced from Bashkësia Islame e Kosovës (BIK)
// Takvimi zyrtar 2026 — pozicioni i diellit përsëritet çdo vit.
// Source: https://github.com/drilonjaha/kohet-e-namazit-kosove-json
// Reference city: Deçan. Apply per-city offset for other locations.

import bikTimes from "./bik-times.json";

export type DayTimes = {
  imsaku: string;
  sabahu: string;
  lindja: string;
  dreka: string;
  ikindia: string;
  akshami: string;
  jacia: string;
};

const BUNDLED = bikTimes as Record<string, DayTimes>;
const REMOTE_KEY = "vaktia-bik-remote-v1";
const REMOTE_META_KEY = "vaktia-bik-remote-meta-v1";
const LIVE_KEY = "vaktia-bik-live-v1";

let override: Record<string, DayTimes> | null = null;
// Today's live times scraped from bislame.net/namazet/ (reference city = Deçan)
let liveToday: { date: string; times: Partial<DayTimes> } | null = null;

if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(REMOTE_KEY);
    if (raw) override = JSON.parse(raw);
  } catch {}
  try {
    const raw = localStorage.getItem(LIVE_KEY);
    if (raw) liveToday = JSON.parse(raw);
  } catch {}
}

function activeMap(): Record<string, DayTimes> {
  return override ?? BUNDLED;
}

export const CITY_OFFSETS = {
  Decan: 0,
  Gjakova: 0,
  Peja: 0,
  Prizreni: 0,
  Mitrovica: 0,
  Sharri: 2,
  Ferizaj: -1,
  Gjilan: -1,
  Prishtina: -1,
  Podujeva: -1,
  Vushtrri: -1,
  Presheva: -2,
} as const;

export type CityKey = keyof typeof CITY_OFFSETS;

export const CITY_LABELS: Record<CityKey, string> = {
  Decan: "Deçan",
  Gjakova: "Gjakovë",
  Peja: "Pejë",
  Prizreni: "Prizren",
  Mitrovica: "Mitrovicë",
  Sharri: "Sharr",
  Ferizaj: "Ferizaj",
  Gjilan: "Gjilan",
  Prishtina: "Prishtinë",
  Podujeva: "Podujevë",
  Vushtrri: "Vushtrri",
  Presheva: "Preshevë",
};

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function fmtMin(n: number) {
  const h = Math.floor(n / 60 + 24) % 24;
  const m = ((n % 60) + 60) % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
function pad(t: string) {
  const [h, m] = t.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
}

function dateKey(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getTimesForDate(date: Date, city: CityKey = "Prishtina"): DayTimes {
  const map = activeMap();
  let key = dateKey(date);
  if (!map[key]) key = "02-28";
  const base = { ...map[key] };
  // Merge live (Deçan-based) values for today, overriding bundled
  if (liveToday && liveToday.date === isoDate(date)) {
    for (const k of Object.keys(liveToday.times) as (keyof DayTimes)[]) {
      const v = liveToday.times[k];
      if (v) base[k] = v;
    }
  }
  const offset = CITY_OFFSETS[city];
  if (offset === 0) return base;
  const out = {} as DayTimes;
  (Object.keys(base) as (keyof DayTimes)[]).forEach((k) => {
    out[k] = fmtMin(toMin(base[k]) + offset);
  });
  return out;
}

export function getMonthTimes(year: number, month: number, city: CityKey = "Prishtina") {
  const days = new Date(year, month + 1, 0).getDate();
  const out: { date: Date; times: DayTimes }[] = [];
  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    out.push({ date, times: getTimesForDate(date, city) });
  }
  return out;
}

export const PRAYER_LABELS: Record<keyof DayTimes, string> = {
  imsaku: "Imsaku",
  sabahu: "Sabahu",
  lindja: "Lindja e Diellit",
  dreka: "Dreka",
  ikindia: "Ikindia",
  akshami: "Akshami",
  jacia: "Jacia",
};

// 7 cards displayed (now including Sabahu)
export const CARD_KEYS: (keyof DayTimes)[] = [
  "imsaku",
  "sabahu",
  "lindja",
  "dreka",
  "ikindia",
  "akshami",
  "jacia",
];
export const CARD_LABELS: Record<string, string> = {
  imsaku: "Imsaku",
  sabahu: "Sabahu",
  lindja: "Lindja e Diellit",
  dreka: "Dreka",
  ikindia: "Ikindia",
  akshami: "Akshami",
  jacia: "Jacia",
};

// ---------- Region dispatcher (Kosovë + Shqipëri pushime) ----------

import {
  ALBANIA_CITIES,
  ALBANIA_CITY_LABELS,
  getAlbanianTimesForDate,
  getAlbanianMonthTimes,
  type AlbaniaCityKey,
} from "./albania-times";

export type RegionKey = "Kosove" | "Shqiperi";

export const REGION_LABELS: Record<RegionKey, string> = {
  Kosove: "Kosovë",
  Shqiperi: "Shqipëri — Pushime",
};

export const REGION_CITIES: Record<RegionKey, readonly string[]> = {
  Kosove: Object.keys(CITY_LABELS),
  Shqiperi: ALBANIA_CITIES,
};

export type AnyCityKey = CityKey | AlbaniaCityKey;

export function getCityLabel(region: RegionKey, city: AnyCityKey): string {
  if (region === "Shqiperi") return ALBANIA_CITY_LABELS[city as AlbaniaCityKey] ?? String(city);
  return CITY_LABELS[city as CityKey] ?? String(city);
}

export function getRegionLabel(region: RegionKey): string {
  return region === "Kosove" ? "Kosovë · BIK" : "Shqipëri · KMSH";
}

export function getTimesForLocation(
  date: Date,
  region: RegionKey,
  city: AnyCityKey,
): DayTimes {
  if (region === "Shqiperi") {
    return getAlbanianTimesForDate(date, city as AlbaniaCityKey);
  }
  return getTimesForDate(date, city as CityKey);
}

export function getMonthTimesForLocation(
  year: number,
  month: number,
  region: RegionKey,
  city: AnyCityKey,
) {
  if (region === "Shqiperi") {
    return getAlbanianMonthTimes(year, month, city as AlbaniaCityKey);
  }
  return getMonthTimes(year, month, city as CityKey);
}

export { ALBANIA_CITIES, ALBANIA_CITY_LABELS };
export type { AlbaniaCityKey };

// ---------- Remote sync from BIK GitHub mirror ----------

const REMOTE_URL =
  "https://raw.githubusercontent.com/drilonjaha/kohet-e-namazit-kosove-json/main/kosovo-prayer-times.min.json";

export type RemoteMeta = { updatedAt: string; year?: number; days: number };

export function getRemoteMeta(): RemoteMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(REMOTE_META_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function fetchLatestFromBIK(): Promise<RemoteMeta> {
  const res = await fetch(REMOTE_URL, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as {
    metadata?: { year?: number };
    prayer_times: Record<string, Array<Record<string, string | number>>>;
  };

  const out: Record<string, DayTimes> = {};
  for (const month of Object.values(json.prayer_times)) {
    for (const day of month) {
      const dateStr = String(day.date); // YYYY-MM-DD
      const [, mm, dd] = dateStr.split("-");
      const key = `${mm}-${dd}`;
      out[key] = {
        imsaku: pad(String(day.imsak)),
        sabahu: pad(String(day.fajr)),
        lindja: pad(String(day.sunrise)),
        dreka: pad(String(day.dhuhr)),
        ikindia: pad(String(day.asr)),
        akshami: pad(String(day.maghrib)),
        jacia: pad(String(day.isha)),
      };
    }
  }

  const days = Object.keys(out).length;
  if (days < 300) throw new Error("Të dhëna jo të plota");

  const meta: RemoteMeta = {
    updatedAt: new Date().toISOString(),
    year: json.metadata?.year,
    days,
  };

  override = out;
  try {
    localStorage.setItem(REMOTE_KEY, JSON.stringify(out));
    localStorage.setItem(REMOTE_META_KEY, JSON.stringify(meta));
  } catch {}
  return meta;
}

export function resetToBundled() {
  override = null;
  try {
    localStorage.removeItem(REMOTE_KEY);
    localStorage.removeItem(REMOTE_META_KEY);
  } catch {}
}

// ---------- Live "today" sync from bislame.net/namazet/ ----------

export type LiveMeta = { date: string; fetchedAt: string };

export function getLiveToday(): LiveMeta | null {
  if (!liveToday) return null;
  return { date: liveToday.date, fetchedAt: new Date().toISOString() };
}

export async function fetchLiveTodayFromBislame(): Promise<LiveMeta> {
  const res = await fetch("/api/public/bik-today", { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = (await res.json()) as {
    date: string | null;
    fetchedAt: string;
    times: Partial<DayTimes>;
  };
  const date = json.date ?? isoDate(new Date());
  liveToday = { date, times: json.times };
  try {
    localStorage.setItem(LIVE_KEY, JSON.stringify(liveToday));
  } catch {}
  return { date, fetchedAt: json.fetchedAt };
}
