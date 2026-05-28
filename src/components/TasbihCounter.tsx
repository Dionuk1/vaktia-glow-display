import { useState } from "react";
import { RotateCcw, Check } from "lucide-react";

type Stage = {
  key: string;
  label: string;
  arabic: string;
  target: number;
  buttonClass: string;
  accentClass: string;
  ringClass: string;
};

const STAGES: Stage[] = [
  {
    key: "subhanallah",
    label: "SubhanAllah",
    arabic: "سُبْحَانَ ٱللَّٰهِ",
    target: 33,
    buttonClass:
      "bg-[#00ffaa] text-[#0b1a18] shadow-[0_0_50px_-5px_#00ffaa] hover:shadow-[0_0_70px_-5px_#00ffaa]",
    accentClass: "text-[#00ffaa]",
    ringClass: "ring-[#00ffaa]/40",
  },
  {
    key: "elhamdulillah",
    label: "Elhamdulillah",
    arabic: "ٱلْحَمْدُ لِلَّٰهِ",
    target: 33,
    buttonClass:
      "bg-[#22d3ff] text-[#06202a] shadow-[0_0_50px_-5px_#22d3ff] hover:shadow-[0_0_70px_-5px_#22d3ff]",
    accentClass: "text-[#22d3ff]",
    ringClass: "ring-[#22d3ff]/40",
  },
  {
    key: "allahuekber",
    label: "Allahu Ekber",
    arabic: "ٱللَّٰهُ أَكْبَرُ",
    target: 34,
    buttonClass:
      "bg-[#e8fff7] text-[#0b1a18] shadow-[0_0_60px_-5px_#b8fff0] hover:shadow-[0_0_80px_-5px_#b8fff0]",
    accentClass: "text-[#e8fff7]",
    ringClass: "ring-[#e8fff7]/40",
  },
];

export default function TasbihCounter() {
  const [stageIdx, setStageIdx] = useState(0);
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);

  const stage = STAGES[stageIdx];

  const handleTap = () => {
    if (done) return;
    const next = count + 1;
    if (next >= stage.target) {
      // advance
      if (stageIdx >= STAGES.length - 1) {
        setCount(stage.target);
        setTimeout(() => setDone(true), 250);
      } else {
        setTimeout(() => {
          setStageIdx((i) => i + 1);
          setCount(0);
        }, 250);
        setCount(next);
      }
    } else {
      setCount(next);
    }
  };

  const resetStage = () => {
    setCount(0);
  };

  const resetAll = () => {
    setStageIdx(0);
    setCount(0);
    setDone(false);
  };

  if (done) {
    return (
      <div className="relative rounded-3xl bg-surface/60 backdrop-blur card-active p-6 sm:p-8 text-center transition-all duration-500 animate-in fade-in zoom-in-95">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Check className="size-7" />
        </div>
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
          Tesbihu i përfunduar
        </div>
        <p className="text-xl sm:text-2xl font-semibold leading-snug mb-3" dir="rtl" lang="ar">
          لَا إِلَٰهَ إِلَّا ٱللَّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ ٱلْمُلْكُ وَلَهُ ٱلْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ
        </p>
        <p className="text-base sm:text-lg text-foreground/90 leading-relaxed">
          “Lā ilāhe illallāhu wahdahū lā sherīke leh. Lehūl-mulku wa lehūl-hamdu wa Huwa ‘alā kulli
          shay’in qadīr.”
        </p>
        <p className="mt-3 italic text-sm sm:text-base text-muted-foreground">
          (Nuk ka zot tjetër përveç Allahut, i vetëm, pa ortak. Atij i takon sundimi dhe lavdia, dhe
          Ai është i pushtetshëm mbi çdo gjë.)
        </p>
        <button
          onClick={resetAll}
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90 transition active:scale-95"
        >
          <RotateCcw className="size-4" />
          Fillo Përsëri
        </button>
      </div>
    );
  }

  const progress = (count / stage.target) * 100;

  return (
    <div className="relative rounded-3xl bg-surface/60 backdrop-blur card-glow p-6 sm:p-8 overflow-hidden">
      {/* Reset */}
      <button
        onClick={resetStage}
        aria-label="Rifillo fazën"
        className="absolute top-4 right-4 rounded-full p-2 text-muted-foreground/70 hover:text-foreground hover:bg-surface transition"
      >
        <RotateCcw className="size-4" />
      </button>

      {/* Stage indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {STAGES.map((s, i) => (
          <div
            key={s.key}
            className={[
              "h-1.5 rounded-full transition-all duration-500",
              i === stageIdx ? "w-8 bg-primary" : i < stageIdx ? "w-6 bg-primary/60" : "w-6 bg-border",
            ].join(" ")}
          />
        ))}
      </div>

      <div className="text-center transition-all duration-500">
        <div
          className={[
            "text-xs uppercase tracking-[0.3em] mb-2 transition-colors duration-500",
            stage.accentClass,
          ].join(" ")}
        >
          Faza {stageIdx + 1} / {STAGES.length}
        </div>
        <p
          className="text-3xl sm:text-4xl font-semibold mb-1 transition-all duration-500"
          dir="rtl"
          lang="ar"
        >
          {stage.arabic}
        </p>
        <p className="text-base sm:text-lg text-foreground/85 mb-5 transition-all duration-500">
          {stage.label}
        </p>

        {/* Counter */}
        <div className="flex items-baseline justify-center gap-2 mb-6">
          <span className="text-6xl sm:text-7xl font-bold tabular-nums leading-none transition-all duration-300">
            {count}
          </span>
          <span className="text-2xl sm:text-3xl font-medium text-muted-foreground tabular-nums">
            / {stage.target}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mx-auto mb-6 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-border/60">
          <div
            className="h-full rounded-full transition-all duration-300 bg-current"
            style={{ width: `${progress}%` }}
            data-tone={stage.key}
          />
        </div>

        {/* Tap button */}
        <button
          onClick={handleTap}
          className={[
            "mx-auto flex size-40 sm:size-48 items-center justify-center rounded-full font-bold text-2xl sm:text-3xl",
            "transition-all duration-500 active:scale-95 hover:scale-[1.02]",
            stage.buttonClass,
          ].join(" ")}
        >
          Thuaj
        </button>

        <p className="mt-4 text-xs text-muted-foreground">
          Trokit butonin për të numëruar.
        </p>
      </div>
    </div>
  );
}
