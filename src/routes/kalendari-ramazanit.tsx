import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Clock, Moon, Sunrise } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FeaturesDrawer from "@/components/FeaturesDrawer";
import { RamadanCountdownCard, RAMADAN_LABEL } from "@/components/RamadanCountdown";

const URL = "https://vaktia-glow-display.lovable.app/kalendari-ramazanit";
const TITLE = "Kalendari i Ramazanit 2027 — Imsaku dhe Iftari | VaktiaKS";
const DESC =
  "Kalendari i Ramazanit 2027 (1448 H) për Kosovë dhe Shqipëri: numërimi deri në 8 Shkurt 2027, kohët e imsakut dhe iftarit sipas qytetit, bazuar në oraret zyrtare.";

export const Route = createFileRoute("/kalendari-ramazanit")({
  component: RamadanPage,
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "article" },
      { property: "og:url", content: URL },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
});

function InfoCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Moon;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-primary/20 bg-surface/60 p-5 backdrop-blur card-glow sm:p-6">
      <h3 className="flex items-center gap-2 text-base font-bold text-foreground">
        <Icon className="size-4 text-primary" /> {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

function RamadanPage() {
  return (
    <div className="min-h-screen w-full bg-background">
      <SiteHeader menu={<FeaturesDrawer />} />

      <main className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-[3vw] sm:py-14">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
          <CalendarDays className="size-4" /> {RAMADAN_LABEL}
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Kalendari i Ramazanit 2027 për Kosovë dhe Shqipëri
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Ramazani i vitit 1448 hixhri pritet të fillojë më 8 Shkurt 2027. Këtu ndiqni numërimin
          deri në ditën e parë, kuptimin e imsakut dhe iftarit, dhe si t&apos;i shihni kohët e
          sakta për qytetin tuaj sipas orareve zyrtare të Bashkësisë Islame të Kosovës (BIK) dhe
          Komunitetit Muslian të Shqipërisë (KMSH).
        </p>

        <section className="mt-8">
          <h2 className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Numërimi deri në Ramazan
          </h2>
          <RamadanCountdownCard />
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Imsaku dhe Iftari
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard icon={Sunrise} title="Imsaku (fillimi i agjërimit)">
              Imsaku përkon me kohën e sabahut në orarin ditor. Pas kësaj kohe ndalohet ngrënia dhe
              pirja deri në iftar.
            </InfoCard>
            <InfoCard icon={Moon} title="Iftari (çelja e agjërimit)">
              Iftari është koha e akshamit. Në VaktiaKS akshami shfaqet automatikisht sipas qytetit
              që zgjedhni në rregullimet.
            </InfoCard>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Kohët sipas qytetit tuaj
          </h2>
          <div className="rounded-3xl border border-primary/20 bg-surface/60 p-5 backdrop-blur card-glow sm:p-7">
            <p className="text-sm leading-relaxed text-muted-foreground">
              Orari mujor me imsakun (sabahun) dhe iftarin (akshamin) për Prishtinë, Prizren, Pejë,
              Gjakovë, Ferizaj, Mitrovicë, Gjilan, si edhe Shkodër, Shëngjin, Lezhë, Velipojë dhe
              Durrës, gjendet në faqen kryesore. Zgjidhni shtetin dhe qytetin në rregullime dhe
              tabela përditësohet automatikisht.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                <Clock className="size-4" /> Shiko orarin e ditës
              </Link>
              <Link
                to="/"
                hash="kalendari"
                className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground/85 transition hover:border-primary/40 hover:text-primary"
              >
                <CalendarDays className="size-4" /> Orari mujor
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
