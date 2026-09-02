// =============================================================================
// KMSH (Komuniteti Mysliman i Shqipërisë) — Takvimi 2026
// Këshillat e Myftinive + qytetet bregdetare të pushimeve
//
// Burimi zyrtar: https://kmsh.al/takvimi/
//
// Struktura: çdo qytet i zgjedhur mapohet 100% në Këshillin (Myftininë) zyrtare.
//   Shëngjin  -> Këshilli i Lezhës
//   Velipojë  -> Këshilli i Shkodrës
// Oraret bazë (seed) janë të Shkodrës; çdo Këshill përdorin korrigjim minutash
// sipas gjatësisë gjeografike derisa të vendosen tabelat e plota zyrtare.
// =============================================================================

import type { DayTimes } from "./prayer-data";

// ---------- Këshillat zyrtare të KMSH ----------

export const ALBANIA_COUNCILS = [
  "Tirane",
  "Shkoder",
  "Lezhe",
  "Durres",
  "Elbasan",
  "Korce",
  "Vlore",
  "Fier",
  "Gjirokaster",
  "Kukes",
  "Berat",
  "Diber",
] as const;

export type AlbaniaCouncilKey = (typeof ALBANIA_COUNCILS)[number];

export const ALBANIA_COUNCIL_LABELS: Record<AlbaniaCouncilKey, string> = {
  Tirane: "Tiranë",
  Shkoder: "Shkodër",
  Lezhe: "Lezhë",
  Durres: "Durrës",
  Elbasan: "Elbasan",
  Korce: "Korçë",
  Vlore: "Vlorë",
  Fier: "Fier",
  Gjirokaster: "Gjirokastër",
  Kukes: "Kukës",
  Berat: "Berat",
  Diber: "Dibër",
};

// Qytetet/vendet e zgjedhshme (përfshin bregdetin e pushimeve)
export const ALBANIA_CITIES = [
  "Tirane",
  "Shkoder",
  "Velipoje",
  "Lezhe",
  "Shengjin",
  "Durres",
  "Elbasan",
  "Korce",
  "Vlore",
  "Fier",
  "Gjirokaster",
  "Kukes",
  "Berat",
  "Diber",
] as const;

export type AlbaniaCityKey = (typeof ALBANIA_CITIES)[number];

export const ALBANIA_CITY_LABELS: Record<AlbaniaCityKey, string> = {
  ...ALBANIA_COUNCIL_LABELS,
  Velipoje: "Velipojë",
  Shengjin: "Shëngjin",
};

// Mapim 100% i saktë: qytet -> Këshilli i Myftinisë
export const CITY_TO_COUNCIL: Record<AlbaniaCityKey, AlbaniaCouncilKey> = {
  Tirane: "Tirane",
  Shkoder: "Shkoder",
  Velipoje: "Shkoder",
  Lezhe: "Lezhe",
  Shengjin: "Lezhe",
  Durres: "Durres",
  Elbasan: "Elbasan",
  Korce: "Korce",
  Vlore: "Vlore",
  Fier: "Fier",
  Gjirokaster: "Gjirokaster",
  Kukes: "Kukes",
  Berat: "Berat",
  Diber: "Diber",
};

export function getCouncilForCity(city: AlbaniaCityKey): AlbaniaCouncilKey {
  return CITY_TO_COUNCIL[city] ?? "Tirane";
}

export function getCouncilLabelForCity(city: AlbaniaCityKey): string {
  return ALBANIA_COUNCIL_LABELS[getCouncilForCity(city)];
}

// Koordinatat e qyteteve (për zbulim automatik të vendndodhjes)
export const ALBANIA_CITY_COORDS: Record<AlbaniaCityKey, { lat: number; lon: number }> = {
  Tirane: { lat: 41.3275, lon: 19.8187 },
  Shkoder: { lat: 42.0693, lon: 19.5033 },
  Velipoje: { lat: 41.8697, lon: 19.4181 },
  Lezhe: { lat: 41.7836, lon: 19.6436 },
  Shengjin: { lat: 41.8153, lon: 19.5936 },
  Durres: { lat: 41.3231, lon: 19.4414 },
  Elbasan: { lat: 41.1125, lon: 20.0822 },
  Korce: { lat: 40.6186, lon: 20.7808 },
  Vlore: { lat: 40.4667, lon: 19.4897 },
  Fier: { lat: 40.7239, lon: 19.5567 },
  Gjirokaster: { lat: 40.0758, lon: 20.1389 },
  Kukes: { lat: 42.0769, lon: 20.4219 },
  Berat: { lat: 40.7058, lon: 19.9522 },
  Diber: { lat: 41.6853, lon: 20.4292 },
};

// -----------------------------------------------------------------------------
// SEED — Qershor / Korrik 2026 (Shkodër, DST CEST)
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

const REF_LON = ALBANIA_CITY_COORDS.Shkoder.lon;

// Korrigjim minutash sipas gjatësisë gjeografike (4 min / gradë), relativ me Shkodrën.
export const COUNCIL_MINUTE_OFFSETS: Record<AlbaniaCouncilKey, number> = ALBANIA_COUNCILS.reduce(
  (acc, c) => {
    acc[c] = Math.round((REF_LON - ALBANIA_CITY_COORDS[c].lon) * 4);
    return acc;
  },
  {} as Record<AlbaniaCouncilKey, number>,
);

export const KMSH_2026: Record<AlbaniaCouncilKey, DayMap> = ALBANIA_COUNCILS.reduce(
  (acc, c) => {
    acc[c] = SHKODER_SEED;
    return acc;
  },
  {} as Record<AlbaniaCouncilKey, DayMap>,
);

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

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
  const [m2, d2] = target.split("-").map(Number);
  for (const k of keys) {
    const [m1, d1] = k.split("-").map(Number);
    const dist = Math.abs((m1 * 31 + d1) - (m2 * 31 + d2));
    if (dist < bestDelta) {
      best = k;
      bestDelta = dist;
    }
  }
  return best;
}

export function getAlbanianTimesForDate(date: Date, city: AlbaniaCityKey): DayTimes {
  const council = getCouncilForCity(city);
  const map = KMSH_2026[council] ?? SHKODER_SEED;
  const key = dateKey(date);
  const useKey = map[key] ? key : findClosestKey(map, key);
  const base = useKey ? map[useKey] : SHKODER_SEED["06-15"];
  const offset = COUNCIL_MINUTE_OFFSETS[council] ?? 0;
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

// Zbulim automatik: koordinata -> qyteti/këshilli më i afërt
export function nearestAlbanianCity(lat: number, lon: number): AlbaniaCityKey {
  let best: AlbaniaCityKey = "Tirane";
  let bestD = Infinity;
  for (const c of ALBANIA_CITIES) {
    const { lat: a, lon: b } = ALBANIA_CITY_COORDS[c];
    const dx = (b - lon) * Math.cos(((a + lat) / 2) * (Math.PI / 180));
    const dy = a - lat;
    const d = dx * dx + dy * dy;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}

// Kufijtë e përafërt të Shqipërisë (për të vendosur nëse jemi në AL apo XK)
export function isInsideAlbania(lat: number, lon: number): boolean {
  return lat >= 39.6 && lat <= 42.7 && lon >= 19.0 && lon <= 21.06;
}
