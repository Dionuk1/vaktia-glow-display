import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, CalendarDays, Menu, Moon } from "lucide-react";
import { Modal } from "./FeatureModals";
import logo from "@/assets/vaktiaks-logo.png.asset.json";

/** 1 Ramazan 1448 H — 8 February 2027 (BIK / astronomical calendar). */
export const RAMADAN_START = new Date("2027-02-08T00:00:00+01:00");
export const RAMADAN_LABEL = "Ramazani i Ardhshëm: 8 Shkurt 2027 (1448 H)";

function useRamadanCountdown() {
  const [left, setLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, RAMADAN_START.getTime() - Date.now());
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
  }, []);
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
  const left = useRamadanCountdown();
  return (
    <div
      id="ramazani"
      className="rounded-3xl border border-[#00D9A3]/20 bg-[#18282E] p-5 shadow-[0_0_20px_rgba(0,217,165,0.2)] sm:p-7"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
          <Moon className="size-4 text-[#00D9A3]" /> Kalendari i Ramazanit
        </div>
        <span className="rounded-full border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[#F59E0B]">
          Sezonale
        </span>
      </div>
      <h3 className="text-lg font-bold text-white sm:text-xl">
        Edhe sa ditë kanë mbetur deri në Ramazan?
      </h3>
      <p className="mt-1 text-sm text-[#9CA3AF]">{RAMADAN_LABEL}</p>
      <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
        <Unit value={left?.d ?? 0} label="Ditë" />
        <Unit value={left?.h ?? 0} label="Orë" />
        <Unit value={left?.m ?? 0} label="Min" />
        <Unit value={left?.s ?? 0} label="Sek" />
      </div>
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

/** Static mockup of the refreshed platform look. */
export function ThemePreviewCard() {
  return (
    <div className="rounded-3xl border border-[#00D9A3]/20 bg-[#18282E] p-5 shadow-[0_0_20px_rgba(0,217,165,0.2)] sm:p-7">
      <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-[#9CA3AF]">
        <Menu className="size-4 text-[#00D9A3]" /> Pamja e Re e Platformës (Theme Preview)
      </div>

      <div className="space-y-4 rounded-2xl border border-[#00D9A3]/15 bg-[#0B1E24] p-4">
        {/* header mock */}
        <div className="flex items-center gap-3 rounded-xl border border-[#00D9A3]/20 bg-[#18282E] px-3 py-2">
          <img src={logo.url} alt="" className="size-8 rounded-lg object-cover" />
          <div className="text-xs font-bold text-white">
            VAKTIA<span className="text-[#00D9A3]">KS</span>
          </div>
          <div className="ml-auto hidden items-center gap-3 text-[9px] font-bold uppercase tracking-[0.18em] sm:flex">
            <span className="relative text-[#00D9A3]">
              Kreu
              <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-[#00D9A3]" />
            </span>
            <span className="text-[#9CA3AF]">Namazet</span>
            <span className="text-[#9CA3AF]">Dhikr</span>
            <span className="text-[#9CA3AF]">Kalendari</span>
          </div>
          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            <span className="relative text-[#9CA3AF]">
              <Bell className="size-4" />
              <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-[#00D9A3] shadow-[0_0_8px_#00D9A3]" />
            </span>
            <Menu className="size-4 text-[#9CA3AF]" />
          </div>
        </div>

        {/* prayer card mock + badge */}
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <motion.div
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="rounded-2xl border border-[#00D9A3] bg-[#18282E] p-4 shadow-[0_0_20px_rgba(0,217,165,0.2)]"
          >
            <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#00D9A3]">
              • Namazi i ardhshëm
            </div>
            <div className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-white">
              Akshami
            </div>
            <div className="text-3xl font-bold tabular-nums text-white">19:42</div>
          </motion.div>
          <div className="grid place-items-center rounded-2xl border border-[#F59E0B]/35 bg-[#F59E0B]/10 px-4 py-3 text-center">
            <div className="text-[9px] uppercase tracking-[0.2em] text-[#F59E0B]">Ramazani</div>
            <div className="text-sm font-bold text-white">8 Shkurt 2027</div>
          </div>
        </div>
      </div>
    </div>
  );
}
