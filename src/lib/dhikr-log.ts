export const DHIKR_LOG_KEY = "vaktia:dhikr:log";
export const DHIKR_GOAL_KEY = "vaktia:dhikr:goal";

export type DhikrLog = Record<string, number>; // "YYYY-MM-DD" -> count

export function todayKey(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function readDhikrLog(): DhikrLog {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(DHIKR_LOG_KEY);
    return raw ? (JSON.parse(raw) as DhikrLog) : {};
  } catch {
    return {};
  }
}

export function logDhikr(amount = 1) {
  if (typeof window === "undefined") return;
  try {
    const log = readDhikrLog();
    const k = todayKey();
    log[k] = (log[k] ?? 0) + amount;
    window.localStorage.setItem(DHIKR_LOG_KEY, JSON.stringify(log));
    window.dispatchEvent(new CustomEvent("vaktia:dhikr-updated"));
  } catch {
    /* ignore */
  }
}

export function readDhikrGoal(): number {
  if (typeof window === "undefined") return 100;
  const raw = window.localStorage.getItem(DHIKR_GOAL_KEY);
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 100;
}

export function writeDhikrGoal(n: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DHIKR_GOAL_KEY, String(Math.max(1, Math.round(n))));
  window.dispatchEvent(new CustomEvent("vaktia:dhikr-updated"));
}

/** Last 7 days including today, oldest first. */
export function last7Days(log: DhikrLog) {
  const out: { key: string; label: string; count: number }[] = [];
  const labels = ["Die", "Hën", "Mar", "Mër", "Enj", "Pre", "Sht"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = todayKey(d);
    out.push({ key: k, label: labels[d.getDay()], count: log[k] ?? 0 });
  }
  return out;
}
