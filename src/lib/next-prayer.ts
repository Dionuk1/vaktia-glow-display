export type NextPrayerInfo = { name: string; time: string; minsLeft: number };

const EVENT = "vaktia:next-prayer";
let current: NextPrayerInfo | null = null;

export function setNextPrayer(info: NextPrayerInfo) {
  const same =
    current &&
    current.name === info.name &&
    current.time === info.time &&
    current.minsLeft === info.minsLeft;
  current = info;
  if (same || typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<NextPrayerInfo>(EVENT, { detail: info }));
}

export function getNextPrayer() {
  return current;
}

export function onNextPrayer(cb: (info: NextPrayerInfo) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => cb((e as CustomEvent<NextPrayerInfo>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
