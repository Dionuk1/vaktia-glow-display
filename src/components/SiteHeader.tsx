import { motion } from "framer-motion";
import logo from "@/assets/vaktiaks-logo.png.asset.json";

export function BrandLogo({
  size = 44,
  showText = true,
  className = "",
}: {
  size?: number;
  showText?: boolean;
  className?: string;
}) {
  return (
    <div className={["flex items-center gap-3", className].join(" ")}>
      <img
        src={logo.url}
        alt="Logo e VaktiaKS"
        width={size}
        height={size}
        className="shrink-0 rounded-xl object-cover"
        style={{ width: size, height: size, objectPosition: "50% 30%" }}
      />
      {showText && (
        <div className="min-w-0 leading-none">
          <div className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            VAKTIA<span className="text-primary">KS</span>
          </div>
          <div className="mt-1 text-[8px] uppercase tracking-[0.22em] text-muted-foreground sm:text-[9px]">
            Kohët e namazit &amp; Dhikri
          </div>
        </div>
      )}
    </div>
  );
}

export const NAV_LINKS: { id: string; label: string }[] = [
  { id: "kreu", label: "Kreu" },
  { id: "namazet", label: "Namazet" },
  { id: "dhikr", label: "Dhikr" },
  { id: "kalendari", label: "Kalendari" },
  { id: "rreth", label: "Rreth nesh" },
];

export function scrollToId(id: string) {
  if (typeof document === "undefined") return;
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function SiteHeader({ menu }: { menu?: React.ReactNode }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 w-full border-b border-primary/15 bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex w-full max-w-[1600px] items-center gap-3 px-3 py-2.5 sm:px-[3vw]">
        <button onClick={() => scrollToId("kreu")} aria-label="Kreu" className="shrink-0">
          <BrandLogo />
        </button>

        <nav className="mx-auto hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <motion.button
              key={l.id}
              whileHover={{ scale: 1.025, translateY: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              onClick={() => scrollToId(l.id)}
              className="group relative rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-foreground/80 transition hover:text-primary"
            >
              {l.label}
              <span className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
            </motion.button>
          ))}
          <Link
            to="/kalendari-ramazanit"
            className="group relative rounded-full px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-primary transition hover:text-primary"
          >
            Ramazani
            <span className="absolute inset-x-3 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
          </Link>
        </nav>


        <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-0">{menu}</div>
      </div>
    </motion.header>
  );
}
