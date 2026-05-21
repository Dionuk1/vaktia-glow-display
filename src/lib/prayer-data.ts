// Official prayer times sourced from Bashkësia Islame e Kosovës (BIK)
// Takvimi zyrtar 2026 — pozicioni i diellit përsëritet çdo vit.
// Source: https://github.com/drilonjaha/kohet-e-namazit-kosove-json
//         (PDF: https://dituriaislame.com/wp-content/uploads/2026/01/takvimi2026vaktet.pdf)
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

const TIMES = bikTimes as Record<string, DayTimes>;

// City offsets in minutes vs. reference city (Deçan)
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

function dateKey(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function getTimesForDate(date: Date, city: CityKey = "Prishtina"): DayTimes {
  let key = dateKey(date);
  // Feb 29 fallback (data is 365-day, no leap day)
  if (!TIMES[key]) key = "02-28";
  const base = TIMES[key];
  const offset = CITY_OFFSETS[city];
  if (offset === 0) return { ...base };
  const out = {} as DayTimes;
  (Object.keys(base) as (keyof DayTimes)[]).forEach((k) => {
    out[k] = fmtMin(toMin(base[k]) + offset);
  });
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

// 6 cards displayed: Imsaku, Lindja, Dreka, Ikindia, Akshami, Jacia
export const CARD_KEYS: (keyof DayTimes)[] = [
  "imsaku",
  "lindja",
  "dreka",
  "ikindia",
  "akshami",
  "jacia",
];
export const CARD_LABELS: Record<string, string> = {
  imsaku: "Imsaku",
  lindja: "Lindja e Diellit",
  dreka: "Dreka",
  ikindia: "Ikindia",
  akshami: "Akshami",
  jacia: "Jacia",
};
