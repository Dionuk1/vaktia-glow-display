// =============================================================================
// KMSH (Komuniteti Mysliman i Shqipërisë) — Takvimi 2026
// Shqipëri · qytetet bregdetare për pushimet verore
//
// Burimi zyrtar: https://kmsh.al/takvimi/
//
// ⚠️  PASTE-HERE BLOCK ⚠️
// Më poshtë janë vetëm vlera DEMO/placeholder për Qershor–Korrik 2026.
// Për të vendosur kalendarin e plotë zyrtar 2026 të KMSH, zëvendëso
// objektet brenda `KMSH_2026[city]` me të gjitha 365 ditët. Çelësi është
// `MM-DD` dhe vlerat janë në formatin 24h `HH:MM`. Strukturë:
//
//   "06-15": { imsaku, sabahu, lindja, dreka, ikindia, akshami, jacia }
//
// Funksioni `getAlbanianTimesForDate` zgjedh ditën më të afërt nëse data
// nuk gjendet, kështu që mund ta plotësosh në mënyrë inkrementale.
// =============================================================================

import type { DayTimes } from "./prayer-data";

export const ALBANIA_CITIES = [
  "Shkoder",
  "Shengjin",
  "Lezhe",
  "Velipoje",
  "Durres",
] as const;

export type AlbaniaCityKey = (typeof ALBANIA_CITIES)[number];

export const ALBANIA_CITY_LABELS: Record<AlbaniaCityKey, string> = {
  Shkoder: "Shkodër",
  Shengjin: "Shëngjin",
  Lezhe: "Lezhë",
  Velipoje: "Velipojë",
  Durres: "Durrës",
};

// -----------------------------------------------------------------------------
// SEED — Qershor / Korrik 2026 (placeholder, vlera përafërsisht KMSH, DST CEST)
// Zëvendëso me kalendarin e plotë zyrtar kur ta kesh në dorë.
// -----------------------------------------------------------------------------

type DayMap = Record<string, DayTimes>;

const SHKODER_SEED: DayMap = {
  "06-01": { imsaku: "02:42", sabahu: "03:12", lindja: "05:01", dreka: "12:39", ikindia: "16:38", akshami: "20:16", jacia: "22:05" },
  "06-15": { imsaku: "02:38", sabahu: "03:08", lindja: "04:58", dreka: "12:41", ikindia: "16:42", akshami: "20:24", jacia: "22:14" },
  "06-30": { imsaku: "02:42", sabahu: "03:12", lindja: "05:02", dreka: "12:45", ikindia: "16:45", akshami: "20:27", jacia: "22:15" },
  "07-15": { imsaku: "02:55", sabahu: "03:25", lindja: "05:12", dreka: "12:47", ikindia: "16:44", akshami: "20:21", jacia: "22:05" },
  "07-31": { imsaku: "03:21", sabahu: "03:51", lindja: "05:28", dreka: "12:48", ikindia: "16:38", akshami: "20:06", jacia: "21:42" },
};

// Per-city minute offsets relative to Shkodër (placeholder approximations).
// Replace by full per-city tables once you have the official KMSH numbers.
const CITY_MINUTE_OFFSETS: Record<AlbaniaCityKey, number> = {
  Shkoder: 0,
  Shengjin: 0,
  Lezhe: 0,
  Velipoje: 0,
  Durres: 1,
};

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export const KMSH_2026: Record<AlbaniaCityKey, DayMap> = {
  Shkoder: SHKODER_SEED,
  Shengjin: SHKODER_SEED,
  Lezhe: SHKODER_SEED,
  Velipoje: SHKODER_SEED,
  Durres: SHKODER_SEED,
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

function dateKey(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function findClosestKey(map: DayMap, target: string): string | null {
  const keys = Object.keys(map).sort();
  if (keys.length === 0) return null;
  let best = keys[0];
  let bestDelta = Infinity;
  for (const k of keys) {
    const delta = Math.abs(k.localeCompare(target));
    // localeCompare gives -1/0/1; fall back to numeric month-day distance
    const [m1, d1] = k.split("-").map(Number);
    const [m2, d2] = target.split("-").map(Number);
    const dist = Math.abs((m1 * 31 + d1) - (m2 * 31 + d2));
    if (dist < bestDelta) {
      best = k;
      bestDelta = dist;
    }
    void delta;
  }
  return best;
}

export function getAlbanianTimesForDate(date: Date, city: AlbaniaCityKey): DayTimes {
  const map = KMSH_2026[city];
  const key = dateKey(date);
  const useKey = map[key] ? key : findClosestKey(map, key);
  const base = useKey ? map[useKey] : SHKODER_SEED["06-15"];
  const offset = CITY_MINUTE_OFFSETS[city] ?? 0;
  if (offset === 0) return { ...base };
  const out = {} as DayTimes;
  (Object.keys(base) as (keyof DayTimes)[]).forEach((k) => {
    out[k] = fmtMin(toMin(base[k]) + offset);
  });
  return out;
}

export function getAlbanianMonthTimes(year: number, month: number, city: AlbaniaCityKey) {
  const days = new Date(year, month + 1, 0).getDate();
  const out: { date: Date; times: DayTimes }[] = [];
  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    out.push({ date, times: getAlbanianTimesForDate(date, city) });
  }
  return out;
}
