import { useEffect, useState } from "react";
import { CalendarDays, Moon } from "lucide-react";
import { HOLIDAYS_2027 } from "./IslamicHolidays";
import { Modal } from "./FeatureModals";

/** 1 Ramazan 1448 H — 8 February 2027 (BIK / astronomical calendar). */
export const RAMADAN_START = new Date("2027-02-08T00:00:00+01:00");
export const RAMADAN_LABEL = "Ramazani i Ardhshëm: 8 Shkurt 2027 (1448 H)";

const MONTHS = ["Janar","Shkurt","Mars","Prill","Maj","Qershor","Korrik","Gusht","Shtator","Tetor","Nëntor","Dhjetor"];

function useRamadanCountdown() {
  return useCountdownTo(RAMADAN_START);
}

function useCountdownTo(target: Date) {
  const [left, setLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, target.getTime() - Date.now());
      const total = Math.floor(diff / 1000);
      setLeft({
        d: Math.floor(total / 86400),
        h: Math.floor((total % 86400) / 3600),
        m: Math.floor((total % 3600) / 60),
        s: total % 60,
      });
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);
  return left;
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-2xl border border-[#00D9A3]/25 bg-[#18282E] px-3 py-3 text-center shadow-[0_0_20px_rgba(0,217,165,0.2)]">
      <div className="text-2xl font-bold tabular-nums text-white sm:text-3xl">
        {String(value).padStart(2, "0")}
      </div>
      <div className="mt-1 text-[9px] uppercase tracking-[0.2em] text-[#9CA3AF]">{label}</div>
    </div>
  );
}

export function RamadanCountdownCard() {
  const [idx, setIdx] = useState(0);
  const h = HOLIDAYS_2027[idx];
  const left = useCountdownTo(h.date);
  return (
    <div
      id="ramazani"
      className="rounded-3xl border border-[#00D9A3]/20 bg-[#18282E] p-5 shadow-[0_0_20px_rgba(0,217,165,0.2)] sm:p-7"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
          <Moon className="size-4 text-[#00D9A3]" /> Ramazani &amp; Festat 2027
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {HOLIDAYS_2027.map((x, i) => (
          <button
            key={x.name}
            onClick={() => setIdx(i)}
            className={[
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition",
              i === idx
                ? "border-[#00D9A3] bg-[#00D9A3] text-[#0B1E24]"
                : "border-[#00D9A3]/25 text-white hover:border-[#00D9A3]/60",
            ].join(" ")}
          >
            {x.emoji} {x.name}
          </button>
        ))}
      </div>
      <h3 className="text-lg font-bold text-white sm:text-xl">Edhe sa kohë ka mbetur deri: {h.name}?</h3>
      <p className="mt-1 text-sm text-[#9CA3AF]">
        {h.weekday}, {h.date.getDate()} {MONTHS[h.date.getMonth()]} {h.date.getFullYear()} · {h.hijri}
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
        <Unit value={left?.d ?? 0} label="Ditë" />
        <Unit value={left?.h ?? 0} label="Orë" />
        <Unit value={left?.m ?? 0} label="Min" />
        <Unit value={left?.s ?? 0} label="Sek" />
      </div>
      <p className="mt-5 rounded-2xl border border-[#B6FF2E]/20 bg-[#B6FF2E]/5 p-4 text-sm leading-relaxed text-white">
        🤲 Allahu na e mundësoftë ta arrijmë Ramazanin dhe këto ditë të bekuara me shëndet, iman dhe bereqet. Amin!
      </p>
    </div>
  );
}

export function RamadanModal({ onClose }: { onClose: () => void }) {
  const left = useRamadanCountdown();
  return (
    <Modal title="Ramazani 2027 & Countdown" onClose={onClose}>
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#00D9A3]/40 bg-[#00D9A3]/10 px-3 py-1.5 text-xs font-semibold text-[#00D9A3]">
          <CalendarDays className="size-4" /> {RAMADAN_LABEL}
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Unit value={left?.d ?? 0} label="Ditë" />
          <Unit value={left?.h ?? 0} label="Orë" />
          <Unit value={left?.m ?? 0} label="Min" />
          <Unit value={left?.s ?? 0} label="Sek" />
        </div>
        <p className="text-sm leading-relaxed text-[#9CA3AF]">
          Data e fillimit bazohet në kalendarin astronomik islam dhe konfirmohet nga Bashkësia
          Islame. Iftari dhe imsaku për qytetin tuaj shfaqen automatikisht në orarin ditor.
        </p>
      </div>
    </Modal>
  );
}

