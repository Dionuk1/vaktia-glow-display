import { motion } from "framer-motion";
import { Facebook, Instagram, Github } from "lucide-react";
import { BrandLogo, scrollToId } from "./SiteHeader";
import { openModule } from "@/lib/modules";

const TOOLS: { label: string; module: string }[] = [
  { label: "Kalendari i Ramazanit & Countdown", module: "ramadan" },
  { label: "Gjurmuesi i Kazave", module: "kaza" },
  { label: "Analitika e Tespihut", module: "analytics" },
  { label: "Busulla e Kibles", module: "" },
  { label: "Xhamia më e Afërt", module: "mosque" },
  { label: "Si të falet namazi", module: "guide" },
];

const SOCIALS = [
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Github, href: "https://github.com", label: "GitHub" },
];

function FooterLink({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ translateX: 3 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="block text-left text-sm text-foreground/75 transition hover:text-primary"
    >
      {children}
    </motion.button>
  );
}

export default function SiteFooter() {
  return (
    <footer id="rreth" className="w-full border-t border-primary/15 bg-[#0B1E24]">
      <div className="mx-auto grid w-full max-w-[1600px] gap-8 px-4 py-10 sm:px-[3vw] md:grid-cols-3">
        <div className="space-y-4">
          <BrandLogo size={52} />
          <p className="max-w-sm text-sm leading-relaxed text-foreground/70">
            Platforma juaj dixhitale për oraret zyrtare të namazit në Kosovë dhe Shqipëri.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <span className="size-2 rounded-full bg-primary shadow-[0_0_10px_var(--color-primary)]" />
            Kohët e sinkronizuara
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Shkurtoret &amp; Veglat
          </div>
          <div className="space-y-2">
            {TOOLS.map((t) => (
              <FooterLink
                key={t.label}
                onClick={() => (t.module ? openModule(t.module) : scrollToId("kibla"))}
              >
                {t.label}
              </FooterLink>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Rreth &amp; Ndihmë
          </div>
          <div className="space-y-2">
            <FooterLink onClick={() => openModule("about")}>Rreth VaktiaKS</FooterLink>
            <FooterLink onClick={() => openModule("cookies")}>Cilësimet e Cookies</FooterLink>
            <FooterLink onClick={() => openModule("terms")}>Kushtet e Përdorimit</FooterLink>
            <FooterLink onClick={() => openModule("privacy")}>Politika e Privatësisë</FooterLink>
          </div>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row sm:px-[3vw]">
          <p className="text-xs text-muted-foreground">
            © 2026 VaktiaKS. Të gjitha të drejtat e rezervuara.
          </p>
          <div className="flex items-center gap-2">
            {SOCIALS.map((s) => (
              <motion.a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={s.label}
                whileHover={{ scale: 1.12, translateY: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="grid size-9 place-items-center rounded-full border border-border text-foreground/70 transition hover:border-primary/50 hover:text-primary hover:shadow-[0_0_18px_-4px_var(--color-primary)]"
              >
                <s.icon className="size-4" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
