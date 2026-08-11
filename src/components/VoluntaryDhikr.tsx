import { useState } from "react";
import { logDhikr } from "@/lib/dhikr-log";
import { RotateCcw, Check, Sparkles } from "lucide-react";

type Dhikr = {
  key: string;
  title: string;
  arabic: string;
  target: number;
  meaning: string;
};

const DHIKRS: Dhikr[] = [
  {
    key: "estagfirullah",
    title: "Estagfirullah",
    arabic: "أَسْتَغْفِرُ ٱللَّٰهَ",
    target: 100,
    meaning: "Kërkoj falje nga Allahu.",
  },
  {
    key: "lailaheilallah",
    title: "La ilahe il-lAllah",
    arabic: "لَا إِلَٰهَ إِلَّا ٱللَّٰهُ",
    target: 100,
    meaning: "Nuk ka zot tjetër përveç Allahut.",
  },
  {
    key: "lahavle",
    title: "La havle ve la kuvvete il-la bil-lah",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِٱللَّٰهِ",
    target: 33,
    meaning: "Nuk ka ndryshim e as fuqi pa ndihmën e Allahut.",
  },
  {
    key: "subhanallah",
    title: "Subhanallah",
    arabic: "سُبْحَانَ ٱللَّٰهِ",
    target: 33,
    meaning: "I lartësuar qoftë Allahu.",
  },
  {
    key: "elhamdulillah",
    title: "Elhamdulillah",
    arabic: "ٱلْحَمْدُ لِلَّٰهِ",
    target: 33,
    meaning: "Falënderimi i takon Allahut.",
  },
  {
    key: "allahuekber",
    title: "Allahu Ekber",
    arabic: "ٱللَّٰهُ أَكْبَرُ",
    target: 34,
    meaning: "Allahu është më i madhi.",
  },
];

export default function VoluntaryDhikr() {
  const [selectedKey, setSelectedKey] = useState<string>(DHIKRS[0].key);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  const selected = DHIKRS.find((d) => d.key === selectedKey)!;
  const progress = Math.min(100, (count / selected.target) * 100);

  const pick = (key: string) => {
    setSelectedKey(key);
    setCount(0);
    setDone(false);
  };

  const handleTap = () => {
    if (done) return;
    const next = count + 1;
    logDhikr(1);
    if (next >= selected.target) {
      setCount(selected.target);
      setTimeout(() => setDone(true), 200);
    } else {
      setCount(next);
    }
  };

  const reset = () => {
    setCount(0);
    setDone(false);
  };

  return (
    <div className="space-y-4">
      {/* Main counter card */}
      <div className="relative rounded-3xl bg-surface/60 backdrop-blur card-glow p-6 sm:p-8 overflow-hidden">
        <button
          onClick={reset}
          aria-label="Rifillo"
          className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground/70 hover:text-foreground hover:bg-surface transition"
        >
          <RotateCcw className="size-4" />
        </button>

        <div className="text-center transition-all duration-500">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-2">
            Dhikri i zgjedhur
          </div>
          <p
            className="text-3xl sm:text-4xl font-semibold mb-1 transition-all duration-500"
            dir="rtl"
            lang="ar"
          >
            {selected.arabic}
          </p>
          <p className="text-base sm:text-lg text-foreground/85 mb-1 transition-all duration-500">
            {selected.title}
          </p>
          <p className="text-xs text-muted-foreground mb-5 italic">
            {selected.meaning}
          </p>

          {done ? (
            <div className="mx-auto flex size-40 sm:size-48 items-center justify-center rounded-full bg-primary/15 ring-2 ring-primary animate-pulse-glow">
              <div className="text-center">
                <Check className="mx-auto size-10 text-primary mb-1" />
                <div className="text-sm font-semibold text-primary">
                  Përfunduar!
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-baseline justify-center gap-2 mb-6">
                <span className="text-6xl sm:text-7xl font-bold tabular-nums leading-none">
                  {count}
                </span>
                <span className="text-2xl sm:text-3xl font-medium text-muted-foreground tabular-nums">
                  / {selected.target}
                </span>
              </div>

              <div className="mx-auto mb-6 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-border/60">
                <div
                  className="h-full rounded-full transition-all duration-300 bg-primary"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <button
                onClick={handleTap}
                className="mx-auto flex size-40 sm:size-48 items-center justify-center rounded-full font-bold text-2xl sm:text-3xl bg-primary text-primary-foreground shadow-[0_0_50px_-5px_var(--color-primary)] hover:shadow-[0_0_70px_-5px_var(--color-primary)] transition-all duration-500 active:scale-95 hover:scale-[1.02]"
              >
                Thuaj
              </button>
            </>
          )}

          <p className="mt-4 text-xs text-muted-foreground">
            {done
              ? "Trokit ikonën sipër për rifillim ose zgjidh një dhikr tjetër."
              : "Trokit butonin për të numëruar."}
          </p>
        </div>
      </div>

      {/* Suggested dhikrs */}
      <div>
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3 px-1">
          <Sparkles className="size-4" /> Dhikre të Sugjeruara
        </div>
        <div className="-mx-4 px-4 overflow-x-auto scrollbar-none">
          <div className="flex gap-3 pb-2 snap-x snap-mandatory">
            {DHIKRS.map((d) => {
              const active = d.key === selectedKey;
              return (
                <button
                  key={d.key}
                  onClick={() => pick(d.key)}
                  className={[
                    "snap-start shrink-0 w-[260px] text-left rounded-2xl p-5 bg-surface/60 backdrop-blur transition-all duration-300 active:scale-[0.98]",
                    active
                      ? "ring-2 ring-primary shadow-[0_0_30px_-5px_var(--color-primary)]"
                      : "ring-1 ring-border hover:ring-primary/40",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="text-sm font-semibold text-foreground leading-snug break-words min-w-0">
                      {d.title}
                    </div>
                    <span
                      className={[
                        "shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold tabular-nums",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-border/60 text-foreground/80",
                      ].join(" ")}
                    >
                      {d.target}x
                    </span>
                  </div>
                  <p
                    className="text-lg font-semibold mb-3 leading-snug break-words"
                    dir="rtl"
                    lang="ar"
                  >
                    {d.arabic}
                  </p>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {d.meaning}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
