import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  BarChart3,
  CheckCircle2,
  Trophy,
  MapPin,
  Languages,
  LayoutGrid,
  ListOrdered,
  ChevronRight,
  Info,
  BookOpen,
  Bell,
} from "lucide-react";
import { useLang } from "@/lib/i18n";
import {
  AnalyticsModal,
  KazaModal,
  LanguageModal,
  MosqueModal,
  RekateModal,
  StreaksModal,
  WidgetModal,
} from "./FeatureModals";
import { NamazGuideModal } from "./NamazGuide";
import { AboutModal, PrivacyModal, TermsModal } from "./LegalModals";
import { onOpenModule } from "@/lib/modules";

type FeatureId =
  | "analytics"
  | "kaza"
  | "streaks"
  | "mosque"
  | "langs"
  | "widget"
  | "rekate"
  | "guide"
  | "about"
  | "terms"
  | "privacy";

type BadgeKind = "new" | "newF" | "updated" | "soon";

const BADGE_STYLE: Record<BadgeKind, string> = {
  new: "bg-[#00D9A3] text-[#052e23]",
  newF: "bg-[#B6FF2E] text-[#152600]",
  updated: "bg-[#06B6D4] text-[#04212a]",
  soon: "bg-[#F59E0B] text-[#2b1a00]",
};

const FEATURES: {
  id: FeatureId;
  icon: typeof BarChart3;
  titleKey: string;
  subKey: string;
  badge: BadgeKind;
}[] = [
  { id: "guide", icon: BookOpen, titleKey: "guide", subKey: "guideSub", badge: "new" },
  { id: "analytics", icon: BarChart3, titleKey: "analytics", subKey: "analyticsSub", badge: "updated" },
  { id: "kaza", icon: CheckCircle2, titleKey: "kaza", subKey: "kazaSub", badge: "new" },
  { id: "streaks", icon: Trophy, titleKey: "streaks", subKey: "streaksSub", badge: "new" },
  { id: "mosque", icon: MapPin, titleKey: "mosque", subKey: "mosqueSub", badge: "newF" },
  { id: "langs", icon: Languages, titleKey: "langs", subKey: "langsSub", badge: "updated" },
  { id: "widget", icon: LayoutGrid, titleKey: "widget", subKey: "widgetSub", badge: "soon" },
];


export function FeatureCard({
  icon: Icon,
  title,
  subtitle,
  badge,
  badgeLabel,
  onClick,
}: {
  icon: typeof BarChart3;
  title: string;
  subtitle: string;
  badge: BadgeKind;
  badgeLabel: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.025, translateY: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className="group relative w-full overflow-hidden rounded-2xl border border-primary/25 bg-surface/70 p-4 pt-9 text-left transition-colors duration-300 hover:border-primary/50 hover:shadow-[0_0_40px_-12px_var(--color-primary)]"
    >
      <span
        className={[
          "absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide",
          BADGE_STYLE[badge],
        ].join(" ")}
      >
        {badgeLabel}
      </span>
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary transition group-hover:bg-primary/25">
          <Icon className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-snug text-foreground break-words">
            {title}
          </span>
          <span className="mt-0.5 block text-xs leading-snug text-muted-foreground break-words">
            {subtitle}
          </span>
        </span>
        <ChevronRight className="mt-2 size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary" />
      </div>
    </motion.button>
  );
}

/** Grid usable both inside the drawer and as a page section. */
export function FeatureShowcaseGrid({ onOpen }: { onOpen: (id: FeatureId) => void }) {
  const { t } = useLang();
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURES.map((f) => (
        <FeatureCard
          key={f.id}
          icon={f.icon}
          title={t(f.titleKey)}
          subtitle={t(f.subKey)}
          badge={f.badge}
          badgeLabel={t(f.badge)}
          onClick={() => onOpen(f.id)}
        />
      ))}
    </div>
  );
}

export function FeatureModalHost({
  open,
  onClose,
}: {
  open: FeatureId | null;
  onClose: () => void;
}) {
  if (!open) return null;
  switch (open) {
    case "analytics":
      return <AnalyticsModal onClose={onClose} />;
    case "kaza":
      return <KazaModal onClose={onClose} />;
    case "streaks":
      return <StreaksModal onClose={onClose} />;
    case "mosque":
      return <MosqueModal onClose={onClose} />;
    case "langs":
      return <LanguageModal onClose={onClose} />;
    case "widget":
      return <WidgetModal onClose={onClose} />;
    case "rekate":
      return <RekateModal onClose={onClose} />;
    case "guide":
      return <NamazGuideModal onClose={onClose} />;
    case "about":
      return <AboutModal onClose={onClose} />;
    case "terms":
      return <TermsModal onClose={onClose} />;
    case "privacy":
      return <PrivacyModal onClose={onClose} />;
  }
}

/** Listens for global openModule() events and renders the matching modal. */
export function GlobalModuleHost() {
  const [open, setOpen] = useState<FeatureId | null>(null);
  useEffect(
    () =>
      onOpenModule((id) => {
        if (id === "cookies") return;
        setOpen(id as FeatureId);
      }),
    [],
  );
  return <FeatureModalHost open={open} onClose={() => setOpen(null)} />;
}


export default function FeaturesDrawer() {
  const { t } = useLang();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<FeatureId | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openFeature = (id: FeatureId) => {
    setOpen(false);
    setModal(id);
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Njoftime"
        onClick={() => openFeature("widget")}
        className="grid size-9 place-items-center rounded-full border border-border bg-surface/60 text-foreground/80 backdrop-blur transition hover:border-primary/40 hover:text-primary"
      >
        <Bell className="size-4" />
      </motion.button>

      <motion.button
        onClick={() => setOpen(true)}
        aria-label={t("menu")}
        whileHover={{ scale: 1.025, translateY: -2 }}
        whileTap={{ scale: 0.97 }}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-2 text-foreground/90 backdrop-blur transition hover:border-primary/40 hover:text-primary"
      >
        <Menu className="size-5" />
        <span className="hidden text-[11px] font-semibold uppercase tracking-[0.25em] sm:inline">
          {t("menu")}
        </span>
      </motion.button>

      {/* Drawer */}
      {mounted && createPortal(
      <div
        className={[
          "fixed inset-0 z-[60] transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <button
          aria-label="Mbyll menynë"
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-background/70 backdrop-blur-md"
        />
        <aside
          className={[
            "absolute inset-y-0 right-0 flex w-[92vw] max-w-md flex-col border-l border-primary/25 bg-surface/95 backdrop-blur",
            "shadow-[-20px_0_60px_-30px_var(--color-primary)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
            open ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
        >

          <div className="flex items-center justify-between gap-3 border-b border-primary/20 p-4">
            <div className="flex min-w-0 items-center gap-2">
              <span className="size-2 shrink-0 rounded-full bg-primary shadow-[0_0_12px_var(--color-primary)]" />
              <span className="truncate text-sm font-bold uppercase tracking-[0.3em] text-foreground">
                VaktiaKS
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Mbyll"
              className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-surface-elevated hover:text-foreground transition"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* About */}
            <div className="rounded-2xl border border-primary/25 bg-background/60 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-primary">
                <Info className="size-4" /> {t("about")}
              </div>
              <p className="text-sm leading-relaxed text-foreground/85">{t("aboutText")}</p>
            </div>

            {/* Rekate */}
            <button
              onClick={() => openFeature("rekate")}
              className="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-[#F59E0B]/35 bg-[#F59E0B]/10 p-4 text-left transition hover:scale-[1.02] hover:border-[#F59E0B]/60 active:scale-[0.99]"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#F59E0B]/20 text-[#F59E0B]">
                <ListOrdered className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{t("rekate")}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground break-words">
                  {t("rekateSub")}
                </span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-[#F59E0B] transition group-hover:translate-x-0.5" />
            </button>

            <div className="pt-1">
              <div className="mb-3 px-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {t("features")}
              </div>
              <div className="grid gap-3">
                {FEATURES.map((f) => (
                  <FeatureCard
                    key={f.id}
                    icon={f.icon}
                    title={t(f.titleKey)}
                    subtitle={t(f.subKey)}
                    badge={f.badge}
                    badgeLabel={t(f.badge)}
                    onClick={() => openFeature(f.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>, document.body)}

      <FeatureModalHost open={modal} onClose={() => setModal(null)} />
    </>
  );
}
