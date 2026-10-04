import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, Plus, Share2, Smartphone, X } from "lucide-react";

const DISMISSED_KEY = "vaktiaks_install_dismissed";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

export default function InstallAppPrompt() {
  const [visible, setVisible] = useState(false);
  const [isIosSafari, setIsIosSafari] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    const safari = /Safari/.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(userAgent);
    setIsIosSafari(ios && safari);

    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) === "true";
    } catch {}

    if (!dismissed && !isStandalone()) setVisible(true);

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
      if (!dismissed && !isStandalone()) setVisible(true);
    };
    const onInstalled = () => setVisible(false);

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISSED_KEY, "true");
    } catch {}
    setVisible(false);
  };

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setVisible(false);
    setInstallPrompt(null);
  };

  if (!visible) return null;

  return createPortal(
    <aside
      aria-label="Instalo VaktiaKS"
      className="fixed bottom-3 left-1/2 z-[90] w-[calc(100%-1.5rem)] max-w-md -translate-x-1/2 rounded-lg border border-primary/30 bg-surface p-4 shadow-[0_0_20px_color-mix(in_oklab,var(--color-primary)_20%,transparent)] sm:bottom-5"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Mbyll njoftimin e instalimit"
        className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-md text-muted-foreground transition hover:bg-surface-elevated hover:text-foreground"
      >
        <X className="size-4" />
      </button>

      <div className="flex items-center gap-3 pr-9">
        <div className="grid size-11 shrink-0 place-items-center rounded-md border border-accent/35 bg-accent/10 text-xl" aria-hidden="true">
          🕌
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase text-accent">VaktiaKS</p>
          <h2 className="text-base font-bold text-foreground">Instalo VaktiaKS në Telefon</h2>
        </div>
      </div>

      {isIosSafari ? (
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-sm font-semibold text-foreground">Për ta përdorur si aplikacion në iPhone:</p>
          <ol className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
            <li className="flex gap-2"><Share2 className="mt-0.5 size-4 shrink-0 text-primary" /><span>1. Kliko butonin <strong className="text-foreground">Share (Shpërndaj)</strong> në pjesën e poshtme të Safari.</span></li>
            <li className="flex gap-2"><Plus className="mt-0.5 size-4 shrink-0 text-primary" /><span>2. Zgjidh <strong className="text-foreground">Add to Home Screen (Shto në Ekranin Bazë)</strong>.</span></li>
            <li className="flex gap-2"><Smartphone className="mt-0.5 size-4 shrink-0 text-primary" /><span>3. Kliko <strong className="text-foreground">Add</strong> në këndin e djathtë lart.</span></li>
          </ol>
        </div>
      ) : (
        <div className="mt-4">
          <button
            type="button"
            onClick={install}
            disabled={!installPrompt}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download className="size-4" />
            Instalo Tani
          </button>
          {!installPrompt && (
            <p className="mt-2 text-center text-xs text-muted-foreground">Instalimi aktivizohet kur shfletuesi e mbështet.</p>
          )}
        </div>
      )}
    </aside>,
    document.body,
  );
}