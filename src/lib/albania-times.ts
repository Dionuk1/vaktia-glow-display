// =============================================================================
// KMSH (Komuniteti Mysliman i Shqipërisë) — Takvimi
// Këshillat e Myftinive + qytetet bregdetare të pushimeve
//
// Burimi zyrtar: https://kmsh.al/takvimi/
//
// Motori i llogaritjes: pozicioni real i diellit (algoritmi standard astronomik),
// i kalibruar sipas parametrave zyrtarë të KMSH:
//   Imsaku / Sabahu  -> 18° nën horizont (Sabahu = Imsaku + 30 min, si në takvim)
//   Ikindia          -> Hanefi (hija = 2x)
//   Akshami          -> +3 min pas perëndimit
//   Jacia            -> 17° nën horizont
// Çdo Këshill llogaritet me koordinatat e tij reale, kështu që Tirana, Shkodra,
// Lezha, Vlora etc. dalin me kohë të ndryshme e të sakta gjeografikisht.
//
//   Shëngjin  -> Këshilli i Lezhës
//   Velipojë  -> Këshilli i Shkodrës
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

// Koordinatat zyrtare të Këshillit (qendra e Myftinisë) — bazë e llogaritjes
export const COUNCIL_COORDS: Record<AlbaniaCouncilKey, { lat: number; lon: number }> =
  ALBANIA_COUNCILS.reduce(
    (acc, c) => {
      acc[c] = ALBANIA_CITY_COORDS[c];
      return acc;
    },
    {} as Record<AlbaniaCouncilKey, { lat: number; lon: number }>,
  );

// -----------------------------------------------------------------------------
// Parametrat KMSH
// -----------------------------------------------------------------------------

const FAJR_ANGLE = 18; // Imsaku
const ISHA_ANGLE = 17; // Jacia
const SABAH_AFTER_IMSAK = 30; // minuta
const MAGHRIB_DELAY = 3; // minuta pas perëndimit
const ASR_SHADOW_FACTOR = 2; // Hanefi

const DEG = Math.PI / 180;
const sin = (d: number) => Math.sin(d * DEG);
const cos = (d: number) => Math.cos(d * DEG);
const tan = (d: number) => Math.tan(d * DEG);
const asin = (x: number) => Math.asin(x) / DEG;
const acos = (x: number) => Math.acos(x) / DEG;
const atan2d = (y: number, x: number) => Math.atan2(y, x) / DEG;

function julianDay(y: number, m: number, d: number) {
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5;
}

/** Deklinacioni i diellit (deg) dhe ekuacioni i kohës (min) */
function sunPosition(jd: number) {
  const d = jd - 2451545.0;
  const g = (357.529 + 0.98560028 * d) % 360;
  const q = (280.459 + 0.98564736 * d) % 360;
  const L = (q + 1.915 * sin(g) + 0.02 * sin(2 * g)) % 360;
  const e = 23.439 - 0.00000036 * d;
  const RA = atan2d(cos(e) * sin(L), cos(L)) / 15;
  const decl = asin(sin(e) * sin(L));
  const eqt = q / 15 - ((RA + 24) % 24);
  return { decl, eqt: eqt * 60 };
}

/** Gjysma e kohëzgjatjes së harkut për një lartësi të dhënë (në orë) */
function hourAngle(altitude: number, lat: number, decl: number): number | null {
  const x =
    (sin(altitude) - sin(lat) * sin(decl)) / (cos(lat) * cos(decl));
  if (x > 1 || x < -1) return null;
  return acos(x) / 15;
}

/** Offset-i i kohës lokale në Shqipëri (CET/CEST) për një datë */
function albaniaUtcOffset(date: Date): number {
  const y = date.getFullYear();
  const lastSunday = (month: number) => {
    const d = new Date(Date.UTC(y, month + 1, 0));
    d.setUTCDate(d.getUTCDate() - d.getUTCDay());
    return d;
  };
  const dstStart = lastSunday(2); // Mars, 01:00 UTC
  dstStart.setUTCHours(1, 0, 0, 0);
  const dstEnd = lastSunday(9); // Oktober, 01:00 UTC
  dstEnd.setUTCHours(1, 0, 0, 0);
  const utcNoon = Date.UTC(y, date.getMonth(), date.getDate(), 12);
  return utcNoon >= dstStart.getTime() && utcNoon < dstEnd.getTime() ? 2 : 1;
}

function fmtHours(h: number): string {
  let mins = Math.round(h * 60);
  mins = ((mins % 1440) + 1440) % 1440;
  const hh = Math.floor(mins / 60);
  const mm = mins % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

// -----------------------------------------------------------------------------
// Motori i llogaritjes për një Këshill
// -----------------------------------------------------------------------------

export function computeCouncilTimes(date: Date, council: AlbaniaCouncilKey): DayTimes {
  const { lat, lon } = COUNCIL_COORDS[council] ?? COUNCIL_COORDS.Tirane;
  const tz = albaniaUtcOffset(date);
  const jd = julianDay(date.getFullYear(), date.getMonth() + 1, date.getDate()) - lon / (15 * 24);
  const { decl, eqt } = sunPosition(jd);

  // Mesdita e vërtetë diellore (dreka) + 3 min ihtiat si në takvim
  const noon = 12 - eqt / 60 - lon / 15 + tz;
  const dhuhr = noon + 3 / 60;

  const sunriseHA = hourAngle(-0.833, lat, decl);
  const fajrHA = hourAngle(-FAJR_ANGLE, lat, decl);
  const ishaHA = hourAngle(-ISHA_ANGLE, lat, decl);

  const asrAltitude = -atan2d(1, ASR_SHADOW_FACTOR + tan(Math.abs(lat - decl)));
  const asrHA = hourAngle(asrAltitude, lat, decl);

  const sunrise = sunriseHA !== null ? noon - sunriseHA : noon - 6;
  const sunset = sunriseHA !== null ? noon + sunriseHA : noon + 6;
  const imsak = fajrHA !== null ? noon - fajrHA : sunrise - 1.5;
  const asr = asrHA !== null ? noon + asrHA : noon + 4;
  const maghrib = sunset + MAGHRIB_DELAY / 60;
  const isha = ishaHA !== null ? noon + ishaHA : maghrib + 1.5;

  return {
    imsaku: fmtHours(imsak),
    sabahu: fmtHours(imsak + SABAH_AFTER_IMSAK / 60),
    lindja: fmtHours(sunrise),
    dreka: fmtHours(dhuhr),
    ikindia: fmtHours(asr),
    akshami: fmtHours(maghrib),
    jacia: fmtHours(Math.max(isha, maghrib + 70 / 60)),
  };
}

export function getAlbanianTimesForDate(date: Date, city: AlbaniaCityKey): DayTimes {
  return computeCouncilTimes(date, getCouncilForCity(city));
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
