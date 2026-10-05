import { useEffect, useRef, useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Loader2 } from "lucide-react";

type PdfDoc = { numPages: number; getPage: (n: number) => Promise<any> };

function PdfPage({ doc, num, zoom, width }: { doc: PdfDoc; num: number; zoom: number; width: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ratio, setRatio] = useState(297 / 210);
  useEffect(() => {
    let cancelled = false;
    let task: any;
    (async () => {
      const page = await doc.getPage(num);
      const base = page.getViewport({ scale: 1 });
      if (cancelled) return;
      setRatio(base.height / base.width);
      const cssW = width * zoom;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const vp = page.getViewport({ scale: (cssW / base.width) * dpr });
      const c = canvasRef.current;
      if (!c) return;
      c.width = Math.floor(vp.width);
      c.height = Math.floor(vp.height);
      task = page.render({ canvasContext: c.getContext("2d")!, viewport: vp });
      await task.promise.catch(() => {});
    })();
    return () => {
      cancelled = true;
      task?.cancel?.();
    };
  }, [doc, num, zoom, width]);
  const cssW = width * zoom;
  return (
    <div
      className="mx-auto overflow-hidden rounded-lg bg-card shadow-lg transition-[width] duration-200"
      style={{ width: cssW, aspectRatio: `1 / ${ratio}` }}
    >
      <canvas ref={canvasRef} aria-label={`Faqja ${num}`} className="block h-full w-full" />
    </div>
  );
}

export default function PdfPagesViewer({ url }: { url: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [doc, setDoc] = useState<PdfDoc | null>(null);
  const [error, setError] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
        pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
        const d = await pdfjs.getDocument(url).promise;
        if (alive) setDoc(d as unknown as PdfDoc);
      } catch {
        if (alive) setError(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [url]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(Math.min(el.clientWidth - 16, 800)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const btn =
    "rounded-full border border-border p-2 text-foreground/80 transition hover:border-primary/40 hover:text-primary active:scale-95 disabled:opacity-40";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-1">
        <button className={btn} aria-label="Zvogëlo" disabled={zoom <= 0.5} onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))}>
          <ZoomOut className="size-4" />
        </button>
        <span className="w-14 text-center text-xs tabular-nums text-muted-foreground">{Math.round(zoom * 100)}%</span>
        <button className={btn} aria-label="Zmadho" disabled={zoom >= 3} onClick={() => setZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))}>
          <ZoomIn className="size-4" />
        </button>
        <button className={btn} aria-label="Rikthe zmadhimin" onClick={() => setZoom(1)}>
          <RotateCcw className="size-4" />
        </button>
        {doc && <span className="ml-2 text-xs text-muted-foreground">{doc.numPages} faqe</span>}
      </div>
      <div ref={wrapRef} className="h-[65vh] w-full overflow-auto rounded-2xl border border-primary/20 bg-background p-2">
        {error ? (
          <p className="p-6 text-center text-sm text-muted-foreground">PDF-ja nuk u ngarkua. Provoni ta shkarkoni.</p>
        ) : !doc || !width ? (
          <div className="flex h-full items-center justify-center text-primary">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {Array.from({ length: doc.numPages }, (_, i) => (
              <PdfPage key={i} doc={doc} num={i + 1} zoom={zoom} width={width} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
