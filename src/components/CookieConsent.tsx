import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { onOpenModule } from "@/lib/modules";

export const COOKIE_KEY = "vaktiaks_cookie_preferences";

export type CookiePrefs = {
  essential: true;
  analytics: boolean;
  preferences: boolean;
  decidedAt: string;
};

function readPrefs(): CookiePrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(COOKIE_KEY);
    return raw ? (JSON.parse(raw) as CookiePrefs) : null;
  } catch {
    return null;
  }
}

function writePrefs(p: Omit<CookiePrefs, "essential" | "decidedAt">) {
  try {
    window.localStorage.setItem(
      COOKIE_KEY,
      JSON.stringify({ essential: true, ...p, decidedAt: new Date().toISOString() }),
    );
  } catch {
    /* ignore */
  }
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={[
        "relative h-6 w-11 shrink-0 rounded-full border transition",
        checked ? "border-primary/50 bg-primary/30" : "border-border bg-surface-elevated",
        disabled ? "opacity-60" : "",
      ].join(" ")}
    >
      <span
        className={[
          "absolute top-0.5 size-4 rounded-full transition-all",
          checked ? "left-6 bg-primary" : "left-0.5 bg-muted-foreground",
        ].join(" ")}
      />
    </button>
  );
}

export default function CookieConsent() {
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [preferences, setPreferences] = useState(true);

  useEffect(() => {
    setMounted(true);
    const p = readPrefs();
    if (p) {
      setAnalytics(p.analytics);
      setPreferences(p.preferences);
    } else {
      setShowBanner(true);
    }
    return onOpenModule((id) => {
      if (id === "cookies") setShowPrefs(true);
    });
  }, []);

  const acceptAll = () => {
    writePrefs({ analytics: true, preferences: true });
    setAnalytics(true);
    setPreferences(true);
    setShowBanner(false);
    setShowPrefs(false);
  };

  const rejectNonEssential = () => {
    writePrefs({ analytics: false, preferences: false });
    setAnalytics(false);
    setPreferences(false);
    setShowBanner(false);
    setShowPrefs(false);
  };

  const saveCustom = () => {
    writePrefs({ analytics, preferences });
    setShowBanner(false);
    setShowPrefs(false);
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <AnimatePresence>
        {showBanner && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed inset-x-0 bottom-0 z-[80] p-3 sm:p-5"
          >
            <div className="mx-auto max-w-3xl rounded-3xl border border-primary/25 bg-surface/95 p-4 backdrop-blur-md card-glow sm:p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-foreground">
                <Cookie className="size-4 text-primary" />
                Rregullimi i Privatësisë &amp; Cookies
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                VaktiaKS përdor ruajtjen lokale (localStorage) dhe cookies minimale teknike për të
                ruajtur qytetin tuaj, arritjet e tespihut, seritë dhe preferencat e gjuhës.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.025, translateY: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={acceptAll}
                  className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground sm:text-sm"
                >
                  Prano të Gjitha
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.025, translateY: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={rejectNonEssential}
                  className="rounded-full border border-border bg-background/60 px-4 py-2 text-xs font-semibold text-foreground/85 transition hover:border-primary/40 sm:text-sm"
                >
                  Refuzo Jo-Esencialet
                </motion.button>
                <button
                  onClick={() => setShowPrefs(true)}
                  className="rounded-full px-3 py-2 text-xs font-semibold text-primary underline-offset-4 hover:underline sm:text-sm"
                >
                  Menaxho Preferencat
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPrefs && (
          <div className="fixed inset-0 z-[90] flex items-end justify-center p-0 sm:items-center sm:p-4">
            <motion.button
              aria-label="Mbyll"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrefs(false)}
              className="absolute inset-0 bg-background/70 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              className="relative w-full max-h-[88vh] overflow-y-auto rounded-t-3xl border border-primary/20 bg-surface/95 p-5 backdrop-blur card-glow sm:max-w-lg sm:rounded-3xl"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                  <ShieldCheck className="size-5 text-primary" /> Preferencat e Cookies
                </h3>
                <button
                  onClick={() => setShowPrefs(false)}
                  aria-label="Mbyll"
                  className="rounded-full p-2 text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background/60 p-4">
                  <div>
                    <div className="text-sm font-semibold text-foreground">Esenciale</div>
                    <div className="text-xs text-muted-foreground">
                      Gjithmonë aktive — nevojshme për funksionimin bazë.
                    </div>
                  </div>
                  <Toggle checked disabled />
                </div>
                <div className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background/60 p-4">
                  <div>
                    <div className="text-sm font-semibold text-foreground">Analitika</div>
                    <div className="text-xs text-muted-foreground">
                      Statistikat e tespihut dhe progresit tuaj.
                    </div>
                  </div>
                  <Toggle checked={analytics} onChange={setAnalytics} />
                </div>
                <div className="flex items-start justify-between gap-3 rounded-2xl border border-border bg-background/60 p-4">
                  <div>
                    <div className="text-sm font-semibold text-foreground">Preferencat</div>
                    <div className="text-xs text-muted-foreground">
                      Qyteti, gjuha dhe rregullimet e kohëve.
                    </div>
                  </div>
                  <Toggle checked={preferences} onChange={setPreferences} />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={saveCustom}
                  className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                >
                  Ruaj preferencat
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={acceptAll}
                  className="rounded-full border border-border bg-background/60 px-4 py-2 text-sm font-semibold text-foreground/85 hover:border-primary/40"
                >
                  Prano të gjitha
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>,
    document.body,
  );
}
