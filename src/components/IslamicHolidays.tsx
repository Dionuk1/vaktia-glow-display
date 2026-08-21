import { useEffect, useState } from "react";

export type Holiday = {
  name: string;
  hijri: string;
  weekday: string;
  date: Date;
  emoji: string;
};

export const HOLIDAYS_2026: Holiday[] = [
  { name: "Nata e Kadrit", hijri: "Nata e 27-të e Ramazanit", weekday: "E Martë", date: new Date(2026, 2, 16), emoji: "🌙" },
  { name: "Fitër Bajrami", hijri: "1 Shawwal 1447 H", weekday: "E Premte", date: new Date(2026, 2, 20), emoji: "🕌" },
  { name: "Dita e Arafatit", hijri: "9 Dhu al-Hijjah 1447 H", weekday: "E Hënë", date: new Date(2026, 4, 25), emoji: "⛰️" },
  { name: "Kurban Bajrami", hijri: "10 Dhu al-Hijjah 1447 H", weekday: "E Martë", date: new Date(2026, 4, 26), emoji: "🐏" },
  { name: "Ramazani 2027", hijri: "1 Ramazan 1448 H", weekday: "E Hënë", date: new Date(2027, 1, 8), emoji: "✨" },
];

const MONTHS_SQ = [
  "Janar", "Shkurt", "Mars", "Prill", "Maj", "Qershor",
  "Korrik", "Gusht", "Shtator", "Tetor", "Nëntor", "Dhjetor",
];

function fmt(d: Date) {
  return `${d.getDate()} ${MONTHS_SQ[d.getMonth()]} ${d.getFullYear()}`;
}

function daysLeft(d: Date, now: Date) {
  return Math.ceil((d.getTime() - now.getTime()) / 86_400_000);
}

export function HolidayCountdownBadges() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  if (!now) return null;
  const upcoming = HOLIDAYS_2026.filter((h) => h.date.getTime() > now.getTime()).slice(0, 3);
  if (!upcoming.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {upcoming.map((h) => (
        <div
          key={h.name}
          className="flex items-center gap-2 rounded-full border border-[#00D9A3]/20 bg-[#18282E] px-3.5 py-2 shadow-[0_0_20px_rgba(0,217,165,0.2)]"
        >
          <span className="text-base leading-none">{h.emoji}</span>
          <span className="text-xs font-semibold text-white">{h.name}</span>
          <span className="rounded-full bg-[#00D9A3]/15 px-2 py-0.5 text-[10px] font-bold tabular-nums text-[#00D9A3]">
            {daysLeft(h.date, now)} ditë
          </span>
        </div>
      ))}
    </div>
  );
}

export default function IslamicHolidays() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  return (
    <div className="space-y-3 p-5 sm:p-7">
      <p className="text-sm text-[#9CA3AF]">
        Datat zyrtare sipas kalendarit të Bashkësisë Islame të Kosovës (BIK) për vitin 2026.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {HOLIDAYS_2026.map((h) => {
          const left = now ? daysLeft(h.date, now) : null;
          const passed = left !== null && left < 0;
          return (
            <div
              key={h.name}
              className={[
                "rounded-2xl border bg-[#18282E] p-4 transition",
                passed
                  ? "border-[#00D9A3]/10 opacity-60"
                  : "border-[#00D9A3]/20 shadow-[0_0_20px_rgba(0,217,165,0.2)]",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-bold text-white">
                    <span>{h.emoji}</span> {h.name}
                  </div>
                  <div className="mt-1 text-xs text-[#9CA3AF]">
                    {h.weekday}, {fmt(h.date)}
                  </div>
                  <div className="mt-0.5 text-[11px] text-[#9CA3AF]/80">{h.hijri}</div>
                </div>
                {left !== null && !passed && (
                  <span className="shrink-0 rounded-full border border-[#00D9A3]/40 bg-[#00D9A3]/10 px-2.5 py-1 text-[10px] font-bold tabular-nums text-[#00D9A3]">
                    {left} ditë
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
