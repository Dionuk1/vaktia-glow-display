import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Info,
  Droplets,
  ListOrdered,
  BookOpen,
  Footprints,
} from "lucide-react";
import { Modal } from "./FeatureModals";
import pdfAsset from "@/assets/falja-namazit.pdf.asset.json";

type TabId = "pdf" | "abdes" | "rekate" | "hapat" | "ajete";

const TABS: { id: TabId; label: string; icon: typeof BookOpen }[] = [
  { id: "pdf", label: "Libri PDF", icon: BookOpen },
  { id: "abdes", label: "Abdesi", icon: Droplets },
  { id: "rekate", label: "Rekatet", icon: ListOrdered },
  { id: "hapat", label: "Hapat e Faljes", icon: Footprints },
  { id: "ajete", label: "Ajete & Hadithe", icon: Info },
];

const ABDES_STEPS = [
  "Nijeti — qëllimi me zemër për marrjen e abdesit dhe Bismillah.",
  "Lani duart deri në kyçe, tri herë.",
  "Shpërlani gojën tri herë (mesvak/misvak nëse ka).",
  "Shpërlani hundën tri herë me dorën e djathtë.",
  "Lani fytyrën tri herë, nga balli deri nën mjekër.",
  "Lani krahët deri mbi bërryla, tri herë (djathtin i parë).",
  "Mesh koka (mes-h) një herë, dhe pastroni veshët e qafën.",
  "Lani këmbët deri mbi kyçe, tri herë (djathtën e parë).",
];

type Vocal = "loud" | "silent" | "mixed";

const REKATE_ROWS: {
  name: string;
  parts: { label: string; type: "sunet" | "farz" | "vitr" }[];
  vocal: Vocal;
  note: string;
}[] = [
  {
    name: "Sabahu",
    parts: [
      { label: "2 Sunet", type: "sunet" },
      { label: "2 Farz", type: "farz" },
    ],
    vocal: "loud",
    note: "Të 2 rekatet e Farzit falen ME ZË",
  },
  {
    name: "Dreka",
    parts: [
      { label: "4 Sunet", type: "sunet" },
      { label: "4 Farz", type: "farz" },
      { label: "2 Sunet", type: "sunet" },
    ],
    vocal: "silent",
    note: "Të gjitha rekatet falen PA ZË",
  },
  {
    name: "Ikindia",
    parts: [
      { label: "4 Sunet", type: "sunet" },
      { label: "4 Farz", type: "farz" },
    ],
    vocal: "silent",
    note: "Të gjitha rekatet falen PA ZË",
  },
  {
    name: "Akshami",
    parts: [
      { label: "3 Farz", type: "farz" },
      { label: "2 Sunet", type: "sunet" },
    ],
    vocal: "mixed",
    note: "2 rekatet e para të Farzit ME ZË · rekati i 3-të PA ZË",
  },
  {
    name: "Jacia",
    parts: [
      { label: "4 Farz", type: "farz" },
      { label: "2 Sunet", type: "sunet" },
      { label: "3 Vitr", type: "vitr" },
    ],
    vocal: "mixed",
    note: "2 rekatet e para të Farzit ME ZË · 2 rekatet e fundit PA ZË",
  },
];

const HAPAT = [
  "Nijeti — qëllimi për namazin që falni.",
  "Tekbiri fillestar: «Allahu Ekber» me ngritjen e duarve.",
  "Kijami: leximi i Fatihasë dhe një sure të shkurtër.",
  "Rukuja: «Subhane Rabbijel Adhim» (3 herë).",
  "Ngritja nga rukuja: «Semi Allahu limen hamideh · Rabbena lekel hamd».",
  "Sexhdeja e parë: «Subhane Rabbijel Ala» (3 herë).",
  "Ulja mes sexhdeve, pastaj sexhdeja e dytë.",
  "Rekati i dytë dhe ulja e fundit: Et-tehijjatu, Salavatet, Duatë.",
  "Selami: djathtas dhe majtas — «Es-selamu alejkum ve rahmetullah».",
];

const AJETE = [
  {
    ar: "وَأَقِمِ الصَّلَاةَ إِنَّ الصَّلَاةَ تُنْهَى عَنِ الْفَحْشَاءِ وَالْمُنْكَرِ",
    sq: "Fal namazin, se namazi largon nga të pahijshmet dhe të keqen.",
    src: "Ankebut, 45",
  },
  {
    ar: "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا",
    sq: "Namazi është detyrë e caktuar në kohë për besimtarët.",
    src: "Nisa, 103",
  },
  {
    ar: "الصَّلَاةُ نُورُ الْمُؤْمِنِ",
    sq: "Namazi është drita e besimtarit.",
    src: "Hadith",
  },
  {
    ar: "مِفْتَاحُ الْجَنَّةِ الصَّلَاةُ",
    sq: "Çelësi i Xhenetit është namazi.",
    src: "Tirmidhiu",
  },
];

function VocalBadge({ vocal }: { vocal: Vocal }) {
  if (vocal === "silent")
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
        <VolumeX className="size-3.5" /> Pa zë
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-primary">
      <Volume2 className="size-3.5" /> {vocal === "mixed" ? "Me zë / Pa zë" : "Me zë"}
    </span>
  );
}

function PdfReader() {
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const src = `${pdfAsset.url}#page=${page}&zoom=${zoom}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-background/60 p-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            aria-label="Faqja e mëparshme"
            className="rounded-full border border-border p-2 text-foreground/80 transition hover:border-primary/40 hover:text-primary active:scale-95"
          >
            <ChevronLeft className="size-4" />
          </button>
          <input
            type="number"
            min={1}
            value={page}
            onChange={(e) => setPage(Math.max(1, Number(e.target.value) || 1))}
            className="w-14 rounded-lg border border-border bg-surface/60 px-2 py-1.5 text-center text-sm tabular-nums text-foreground outline-none focus:border-primary/50"
            aria-label="Numri i faqes"
          />
          <button
            onClick={() => setPage((p) => p + 1)}
            aria-label="Faqja tjetër"
            className="rounded-full border border-border p-2 text-foreground/80 transition hover:border-primary/40 hover:text-primary active:scale-95"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setZoom((z) => Math.max(50, z - 25))}
            aria-label="Zvogëlo"
            className="rounded-full border border-border p-2 text-foreground/80 transition hover:border-primary/40 hover:text-primary active:scale-95"
          >
            <ZoomOut className="size-4" />
          </button>
          <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">{zoom}%</span>
          <button
            onClick={() => setZoom((z) => Math.min(250, z + 25))}
            aria-label="Zmadho"
            className="rounded-full border border-border p-2 text-foreground/80 transition hover:border-primary/40 hover:text-primary active:scale-95"
          >
            <ZoomIn className="size-4" />
          </button>
        </div>

        <a
          href={pdfAsset.url}
          download="Falja_e_Namazit_DIGITAL.pdf"
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90 active:scale-95"
        >
          <Download className="size-4" /> Shkarko
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-primary/20 bg-background">
        <iframe
          key={src}
          src={src}
          title="Falja e Namazit — libri dixhital"
          className="h-[60vh] w-full"
        />
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Nëse lexuesi nuk shfaqet në pajisjen tuaj, shkarkoni PDF-në dhe lexojeni offline.
      </p>
    </div>
  );
}

export function NamazGuideModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<TabId>("pdf");

  return (
    <Modal title="Si të falet namazi" onClose={onClose}>
      <div className="space-y-4">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {TABS.map((tb) => {
            const active = tab === tb.id;
            return (
              <motion.button
                key={tb.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => setTab(tb.id)}
                className={[
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  active
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-border bg-surface/50 text-muted-foreground hover:text-foreground",
                ].join(" ")}
              >
                <tb.icon className="size-3.5" /> {tb.label}
              </motion.button>
            );
          })}
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {tab === "pdf" && <PdfReader />}

          {tab === "abdes" && (
            <div className="space-y-2">
              {ABDES_STEPS.map((s, i) => (
                <div
                  key={s}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-background/60 p-3"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground/90">{s}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "rekate" && (
            <div className="space-y-3">
              {REKATE_ROWS.map((r) => (
                <div key={r.name} className="rounded-2xl border border-border bg-background/60 p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-bold uppercase tracking-[0.2em] text-foreground/90">
                      {r.name}
                    </div>
                    <VocalBadge vocal={r.vocal} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {r.parts.map((p) => (
                      <span
                        key={p.label}
                        className={[
                          "rounded-full border px-3 py-1 text-xs font-bold tabular-nums",
                          p.type === "farz"
                            ? "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                            : p.type === "vitr"
                              ? "border-[#06B6D4]/40 bg-[#06B6D4]/10 text-[#06B6D4]"
                              : "border-border bg-surface-elevated/60 text-foreground/80",
                        ].join(" ")}
                      >
                        {p.label}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">{r.note}</div>
                </div>
              ))}
              <div className="flex items-start gap-2 rounded-2xl border border-primary/30 bg-primary/10 p-3 text-xs leading-relaxed text-primary/90">
                <Info className="mt-0.5 size-4 shrink-0" />
                <span>
                  Në namazet me zë, leximi me zë aplikohet kur faleni me xhemat ose si imam.
                </span>
              </div>
            </div>
          )}

          {tab === "hapat" && (
            <ol className="space-y-2">
              {HAPAT.map((h, i) => (
                <li
                  key={h}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-background/60 p-3"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#06B6D4]/15 text-xs font-bold text-[#06B6D4]">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground/90">{h}</span>
                </li>
              ))}
            </ol>
          )}

          {tab === "ajete" && (
            <div className="space-y-3">
              {AJETE.map((a) => (
                <div key={a.sq} className="rounded-2xl border border-border bg-background/60 p-4">
                  <div dir="rtl" className="text-lg leading-relaxed text-primary">
                    {a.ar}
                  </div>
                  <div className="mt-2 text-sm text-foreground/90">{a.sq}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {a.src}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Modal>
  );
}

export default NamazGuideModal;
