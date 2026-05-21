// Mock prayer times database (Prishtinë, Kosovë)
// Keyed by MM-DD; covers a representative month.

export type DayTimes = {
  imsaku: string;
  sabahu: string;
  lindja: string;
  dreka: string;
  ikindia: string;
  akshami: string;
  jacia: string;
};

// A small seeded month + interpolation fallback to any day
const SCHEDULE: Record<string, DayTimes> = {
  "01-01": { imsaku: "05:42", sabahu: "05:57", lindja: "07:18", dreka: "11:48", ikindia: "14:08", akshami: "16:18", jacia: "17:48" },
  "02-01": { imsaku: "05:30", sabahu: "05:45", lindja: "07:00", dreka: "11:55", ikindia: "14:35", akshami: "16:55", jacia: "18:20" },
  "03-01": { imsaku: "04:55", sabahu: "05:10", lindja: "06:20", dreka: "11:55", ikindia: "15:00", akshami: "17:35", jacia: "19:00" },
  "04-01": { imsaku: "04:00", sabahu: "04:15", lindja: "05:30", dreka: "12:50", ikindia: "16:25", akshami: "19:15", jacia: "20:45" },
  "05-01": { imsaku: "03:10", sabahu: "03:25", lindja: "04:42", dreka: "12:45", ikindia: "16:40", akshami: "19:50", jacia: "21:25" },
  "06-01": { imsaku: "02:30", sabahu: "02:45", lindja: "04:15", dreka: "12:50", ikindia: "16:55", akshami: "20:25", jacia: "22:05" },
  "07-01": { imsaku: "02:40", sabahu: "02:55", lindja: "04:20", dreka: "12:55", ikindia: "17:00", akshami: "20:30", jacia: "22:10" },
  "08-01": { imsaku: "03:30", sabahu: "03:45", lindja: "05:00", dreka: "13:00", ikindia: "16:45", akshami: "20:00", jacia: "21:35" },
  "09-01": { imsaku: "04:15", sabahu: "04:30", lindja: "05:40", dreka: "12:50", ikindia: "16:15", akshami: "19:00", jacia: "20:25" },
  "10-01": { imsaku: "04:55", sabahu: "05:10", lindja: "06:20", dreka: "12:35", ikindia: "15:35", akshami: "18:00", jacia: "19:20" },
  "11-01": { imsaku: "05:35", sabahu: "05:50", lindja: "07:05", dreka: "11:30", ikindia: "14:10", akshami: "16:20", jacia: "17:45" },
  "12-01": { imsaku: "06:00", sabahu: "06:15", lindja: "07:30", dreka: "11:35", ikindia: "13:55", akshami: "16:00", jacia: "17:30" },
};

const KEYS: (keyof DayTimes)[] = ["imsaku", "sabahu", "lindja", "dreka", "ikindia", "akshami", "jacia"];

function toMin(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function fromMin(n: number): string {
  const h = Math.floor(n / 60) % 24;
  const m = Math.round(n % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function lerpDay(a: DayTimes, b: DayTimes, t: number): DayTimes {
  const out = {} as DayTimes;
  for (const k of KEYS) {
    out[k] = fromMin(toMin(a[k]) + (toMin(b[k]) - toMin(a[k])) * t);
  }
  return out;
}

export function getTimesForDate(date: Date): DayTimes {
  const month = date.getMonth(); // 0-11
  const day = date.getDate();
  const daysInMonth = new Date(date.getFullYear(), month + 1, 0).getDate();

  const thisKey = `${String(month + 1).padStart(2, "0")}-01`;
  const nextMonth = (month + 1) % 12;
  const nextKey = `${String(nextMonth + 1).padStart(2, "0")}-01`;

  const a = SCHEDULE[thisKey];
  const b = SCHEDULE[nextKey];
  const t = (day - 1) / daysInMonth;
  return lerpDay(a, b, t);
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

// Cards displayed (6 cards — combine Sabahu+Lindja per spec? spec says 6: Imsaku, Sabah (Lindja e Diellit), Dreka, Ikindia, Akshami, Jacia)
export const CARD_KEYS: (keyof DayTimes)[] = ["imsaku", "lindja", "dreka", "ikindia", "akshami", "jacia"];
export const CARD_LABELS: Record<string, string> = {
  imsaku: "Imsaku",
  lindja: "Lindja e Diellit",
  dreka: "Dreka",
  ikindia: "Ikindia",
  akshami: "Akshami",
  jacia: "Jacia",
};
