import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Minus,
  MapPin,
  Navigation,
  Trophy,
  Check,
  Flame,
  Bell,
  Smartphone,
  Watch,
} from "lucide-react";
import { LANGS, useLang, type Lang } from "@/lib/i18n";
import {
  last7Days,
  readDhikrGoal,
  readDhikrLog,
  todayKey,
  writeDhikrGoal,
} from "@/lib/dhikr-log";

/* ------------------------------------------------------------------ shell */

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        aria-label="Mbyll"
        onClick={onClose}
        className="absolute inset-0 bg-background/70 backdrop-blur-md"
      />
      <div className="relative w-full sm:max-w-lg max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-surface/95 backdrop-blur border border-primary/20 card-glow p-4 sm:p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-lg font-bold leading-snug text-foreground">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Mbyll"
            className="shrink-0 rounded-full p-2 text-muted-foreground hover:text-foreground hover:bg-surface-elevated transition"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}

/* --------------------------------------------------------- rakat table */

const REKATE: { name: string; parts: { label: string; type: "sunet" | "farz" | "vitr" }[] }[] = [
  { name: "Sabahu", parts: [{ label: "2 Sunet", type: "sunet" }, { label: "2 Farz", type: "farz" }] },
  {
    name: "Dreka",
    parts: [
      { label: "4 Sunet", type: "sunet" },
      { label: "4 Farz", type: "farz" },
      { label: "2 Sunet", type: "sunet" },
    ],
  },
  { name: "Ikindia", parts: [{ label: "4 Sunet", type: "sunet" }, { label: "4 Farz", type: "farz" }] },
  { name: "Akshami", parts: [{ label: "3 Farz", type: "farz" }, { label: "2 Sunet", type: "sunet" }] },
  {
    name: "Jacia",
    parts: [
      { label: "4 Farz", type: "farz" },
      { label: "2 Sunet", type: "sunet" },
      { label: "3 Vitr", type: "vitr" },
    ],
  },
];

export function RekateModal({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  return (
    <Modal title={t("rekate")} onClose={onClose}>
      <div className="space-y-3">
        {REKATE.map((r) => (
          <div
            key={r.name}
            className="rounded-2xl bg-background/60 border border-border p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/90">
              {r.name}
            </div>
            <div className="flex flex-wrap gap-2">
              {r.parts.map((p) => (
                <span
                  key={p.label}
                  className={[
                    "rounded-full px-3 py-1 text-xs font-bold tabular-nums border",
                    p.type === "farz"
                      ? "text-[#F59E0B] border-[#F59E0B]/40 bg-[#F59E0B]/10"
                      : p.type === "vitr"
                        ? "text-[#06B6D4] border-[#06B6D4]/40 bg-[#06B6D4]/10"
                        : "text-foreground/80 border-border bg-surface-elevated/60",
                  ].join(" ")}
                >
                  {p.label}
                </span>
              ))}
            </div>
          </div>
        ))}
        <p className="text-xs text-muted-foreground leading-relaxed">
          Farzet janë të detyrueshme (ngjyra e artë), sunetet janë të pëlqyeshme, dhe Vitri falet pas
          Jacisë.
        </p>
      </div>
    </Modal>
  );
}

/* ----------------------------------------------------------- analytics */

export function AnalyticsModal({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const [log, setLog] = useState<Record<string, number>>({});
  const [goal, setGoal] = useState(100);

  useEffect(() => {
    const load = () => {
      setLog(readDhikrLog());
      setGoal(readDhikrGoal());
    };
    load();
    window.addEventListener("vaktia:dhikr-updated", load);
    return () => window.removeEventListener("vaktia:dhikr-updated", load);
  }, []);

  const days = useMemo(() => last7Days(log), [log]);
  const max = Math.max(goal, ...days.map((d) => d.count), 1);
  const today = log[todayKey()] ?? 0;
  const total = days.reduce((a, d) => a + d.count, 0);
  const peak = days.reduce((a, d) => (d.count > a.count ? d : a), days[0]);

  return (
    <Modal title={t("analytics")} onClose={onClose}>
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Sot", value: today },
            { label: "7 ditë", value: total },
            { label: "Dita maks.", value: peak?.count ?? 0 },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl bg-background/60 border border-border p-3 text-center">
              <div className="text-2xl font-bold tabular-nums text-primary">{s.value}</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-background/60 border border-border p-4">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="uppercase tracking-[0.2em]">7 ditët e fundit</span>
            <span className="tabular-nums">Synimi: {goal}/ditë</span>
          </div>
          <div className="flex h-40 items-end gap-2">
            {days.map((d) => {
              const h = Math.round((d.count / max) * 100);
              const hit = d.count >= goal;
              return (
                <div key={d.key} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
                  <div className="text-[10px] tabular-nums text-foreground/70">{d.count}</div>
                  <div className="relative flex h-full w-full items-end rounded-lg bg-surface-elevated/50 overflow-hidden">
                    <div
                      className={[
                        "w-full rounded-lg transition-all duration-500",
                        hit ? "bg-primary" : "bg-[#06B6D4]",
                      ].join(" ")}
                      style={{ height: `${Math.max(h, d.count > 0 ? 4 : 0)}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-muted-foreground">{d.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl bg-background/60 border border-border p-4">
          <div className="mb-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Synimi ditor
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={33}
              max={500}
              step={1}
              value={goal}
              onChange={(e) => {
                const v = Number(e.target.value);
                setGoal(v);
                writeDhikrGoal(v);
              }}
              className="w-full accent-[oklch(0.78_0.15_165)]"
            />
            <span className="w-14 shrink-0 text-right text-sm font-bold tabular-nums text-primary">
              {goal}
            </span>
          </div>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-border/60">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min(100, (today / goal) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {today >= goal
              ? "Synimi i ditës është plotësuar. MashAllah!"
              : `Edhe ${goal - today} dhikre për synimin e ditës.`}
          </p>
        </div>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------- kaza */

const KAZA_KEY = "vaktia:kaza";
const KAZA_PRAYERS = ["Sabahu", "Dreka", "Ikindia", "Akshami", "Jacia", "Vitri"] as const;
type KazaState = Record<string, number>;

function readKaza(): KazaState {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(KAZA_KEY) ?? "{}") as KazaState;
  } catch {
    return {};
  }
}

export function KazaModal({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const [state, setState] = useState<KazaState>({});

  useEffect(() => setState(readKaza()), []);

  const save = (next: KazaState) => {
    setState(next);
    try {
      window.localStorage.setItem(KAZA_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const bump = (name: string, delta: number) =>
    save({ ...state, [name]: Math.max(0, (state[name] ?? 0) + delta) });

  const clearAll = () => save({});
  const total = KAZA_PRAYERS.reduce((a, p) => a + (state[p] ?? 0), 0);

  return (
    <Modal title={t("kaza")} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-background/60 border border-border p-4">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Kaza të mbetura
            </div>
            <div className="text-3xl font-bold tabular-nums text-[#F59E0B]">{total}</div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary ring-1 ring-primary/30">
            <Flame className="size-4" />
            {total === 0 ? "Të gjitha të plotësuara" : "Vazhdo hap pas hapi"}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {KAZA_PRAYERS.map((p) => {
            const v = state[p] ?? 0;
            return (
              <div
                key={p}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl bg-background/60 border border-border p-3"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-foreground">{p}</div>
                  <div className="text-xs tabular-nums text-muted-foreground">{v} kaza</div>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => bump(p, -1)}
                    aria-label={`Hiq një kaza për ${p}`}
                    className="rounded-full border border-border p-2 text-foreground/80 hover:border-primary/40 hover:text-primary transition active:scale-95"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold tabular-nums text-primary">
                    {v}
                  </span>
                  <button
                    onClick={() => bump(p, 1)}
                    aria-label={`Shto një kaza për ${p}`}
                    className="rounded-full border border-border p-2 text-foreground/80 hover:border-primary/40 hover:text-primary transition active:scale-95"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={clearAll}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.99]"
        >
          <Check className="size-4" />
          Zgjidh të gjitha
        </button>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------- streaks */

const STREAK_KEY = "vaktia:streak";

function readStreak(): { count: number; last: string } {
  if (typeof window === "undefined") return { count: 0, last: "" };
  try {
    return JSON.parse(window.localStorage.getItem(STREAK_KEY) ?? '{"count":0,"last":""}');
  } catch {
    return { count: 0, last: "" };
  }
}

export function StreaksModal({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const [streak, setStreak] = useState({ count: 0, last: "" });
  const [log, setLog] = useState<Record<string, number>>({});

  useEffect(() => {
    setLog(readDhikrLog());
    const s = readStreak();
    const today = todayKey();
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yKey = todayKey(y);
    let next = s;
    if (s.last !== today) {
      next = { count: s.last === yKey ? s.count + 1 : 1, last: today };
      try {
        window.localStorage.setItem(STREAK_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    }
    setStreak(next);
  }, []);

  const totalDhikr = Object.values(log).reduce((a, b) => a + b, 0);
  const kazaCleared = Object.values(readKaza()).every((v) => v === 0);

  const badges = [
    { name: "3 Ditë Rresht", have: streak.count, need: 3 },
    { name: "7 Ditë Rresht", have: streak.count, need: 7 },
    { name: "30 Ditë Rresht", have: streak.count, need: 30 },
    { name: "100 Ditë Rresht", have: streak.count, need: 100 },
    { name: "100 Dhikre", have: totalDhikr, need: 100 },
    { name: "1000 Dhikre", have: totalDhikr, need: 1000 },
    { name: "Kaza Master", have: kazaCleared ? 1 : 0, need: 1 },
  ];

  return (
    <Modal title={t("streaks")} onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-center gap-4 rounded-2xl bg-background/60 border border-primary/25 p-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary">
            <Trophy className="size-7" />
          </div>
          <div className="min-w-0">
            <div className="text-3xl font-bold tabular-nums text-primary">{streak.count}</div>
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              ditë rresht aktiv
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {badges.map((b) => {
            const pct = Math.min(100, Math.round((b.have / b.need) * 100));
            const unlocked = pct >= 100;
            return (
              <div
                key={b.name}
                className={[
                  "rounded-2xl border p-4",
                  unlocked
                    ? "border-primary/40 bg-primary/10"
                    : "border-border bg-background/60",
                ].join(" ")}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="min-w-0 truncate text-sm font-semibold text-foreground">
                    {b.name}
                  </div>
                  <span
                    className={[
                      "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                      unlocked
                        ? "bg-primary text-primary-foreground"
                        : "bg-surface-elevated text-muted-foreground",
                    ].join(" ")}
                  >
                    {unlocked ? "HAPUR" : `${pct}%`}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-border/60">
                  <div
                    className={["h-full rounded-full transition-all duration-500", unlocked ? "bg-primary" : "bg-[#06B6D4]"].join(" ")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------- mosque */

const MOSQUES = [
  { name: "Xhamia e Madhe – Prishtinë", lat: 42.6629, lon: 21.1655 },
  { name: "Xhamia e Llapit – Prishtinë", lat: 42.6702, lon: 21.1671 },
  { name: "Xhamia Bajrakli – Pejë", lat: 42.6593, lon: 20.2887 },
  { name: "Xhamia e Sinan Pashës – Prizren", lat: 42.2139, lon: 20.7397 },
  { name: "Xhamia e Plumbit – Shkodër", lat: 42.0668, lon: 19.5126 },
  { name: "Xhamia Et'hem Bej – Tiranë", lat: 41.3283, lon: 19.8188 },
];

function haversine(aLat: number, aLon: number, bLat: number, bLon: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLon = ((bLon - aLon) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function MosqueModal({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [err, setErr] = useState("");

  const locate = () => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setErr("Pajisja nuk mbështet gjeolokacionin.");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setCoords({ lat: p.coords.latitude, lon: p.coords.longitude });
        setStatus("ok");
      },
      (e) => {
        setStatus("error");
        setErr(e.message || "Leja e vendndodhjes u refuzua.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const list = useMemo(() => {
    if (!coords) return MOSQUES.map((m) => ({ ...m, dist: null as number | null }));
    return MOSQUES.map((m) => ({ ...m, dist: haversine(coords.lat, coords.lon, m.lat, m.lon) })).sort(
      (a, b) => (a.dist ?? 0) - (b.dist ?? 0),
    );
  }, [coords]);

  return (
    <Modal title={t("mosque")} onClose={onClose}>
      <div className="space-y-4">
        <button
          onClick={locate}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90 active:scale-[0.99]"
        >
          <Navigation className="size-4" />
          {status === "loading" ? "Duke lokalizuar…" : "Gjej vendndodhjen tim"}
        </button>

        {status === "error" && (
          <p className="rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/30 p-3 text-xs text-[#F59E0B]">
            {err}
          </p>
        )}

        <div className="space-y-2">
          {list.map((m, i) => (
            <div
              key={m.name}
              className={[
                "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border p-4",
                i === 0 && coords ? "border-primary/40 bg-primary/10" : "border-border bg-background/60",
              ].join(" ")}
            >
              <div className="flex min-w-0 items-center gap-2">
                <MapPin className="size-4 shrink-0 text-primary" />
                <span className="truncate text-sm font-medium text-foreground">{m.name}</span>
              </div>
              <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">
                {m.dist == null ? "—" : `${m.dist.toFixed(1)} km`}
              </span>
            </div>
          ))}
        </div>

        <a
          href="https://www.google.com/maps/search/mosque+near+me"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20"
        >
          Hape në Google Maps
        </a>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------ language */

export function LanguageModal({ onClose }: { onClose: () => void }) {
  const { t, lang, setLang: apply } = useLang();
  return (
    <Modal title={t("langs")} onClose={onClose}>
      <div className="space-y-2">
        {LANGS.map((l) => {
          const active = l.code === (lang as Lang);
          return (
            <button
              key={l.code}
              onClick={() => apply(l.code)}
              className={[
                "flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition",
                active
                  ? "border-primary/50 bg-primary/10 shadow-[0_0_30px_-10px_var(--color-primary)]"
                  : "border-border bg-background/60 hover:border-primary/30",
              ].join(" ")}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="text-xl">{l.flag}</span>
                <span className="truncate text-sm font-semibold text-foreground">{l.label}</span>
              </span>
              {active ? (
                <Check className="size-4 shrink-0 text-primary" />
              ) : (
                <span className="shrink-0 text-xs font-bold text-muted-foreground">{l.short}</span>
              )}
            </button>
          );
        })}
        <p className="text-xs text-muted-foreground">
          Gjuha zbatohet menjëherë në menynë dhe modulet e veçorive.
        </p>
      </div>
    </Modal>
  );
}

/* -------------------------------------------------------------- widget */

export function WidgetModal({ onClose }: { onClose: () => void }) {
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <Modal title={t("widget")} onClose={onClose}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Smartphone className="size-4" /> Widget ekrani
            </div>
            <div className="rounded-xl bg-surface-elevated/70 p-3">
              <div className="text-[10px] uppercase tracking-[0.2em] text-primary">Jacia pas</div>
              <div className="text-2xl font-bold tabular-nums text-foreground">01:24</div>
              <div className="text-[10px] text-muted-foreground">Prishtinë · 20:52</div>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Watch className="size-4" /> Wear OS tile
            </div>
            <div className="mx-auto grid size-24 place-items-center rounded-full bg-surface-elevated/70 ring-1 ring-primary/30">
              <div className="text-center">
                <div className="text-[9px] uppercase tracking-widest text-primary">Ikindia</div>
                <div className="text-lg font-bold tabular-nums">17:38</div>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          Widget-et për iOS/Android dhe kutizat për smartwatch po zhvillohen. Lëri email-in tënd dhe
          njoftohesh kur publikohen.
        </p>

        {sent ? (
          <div className="flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 p-4 text-sm text-primary">
            <Check className="size-4" /> Faleminderit! Do të njoftohesh me email.
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.includes("@")) return;
              try {
                window.localStorage.setItem("vaktia:widget-beta-email", email);
              } catch {
                /* ignore */
              }
              setSent(true);
            }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="emri@shembull.com"
              className="min-w-0 flex-1 rounded-2xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Bell className="size-4" />
              Më njofto
            </button>
          </form>
        )}
      </div>
    </Modal>
  );
}
