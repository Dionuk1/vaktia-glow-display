import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { RefreshCw, Check, MapPin, LocateFixed } from "lucide-react";
import {
  ALBANIA_CITIES,
  ALBANIA_CITY_LABELS,
  CITY_LABELS,
  getCouncilLabel,
  type AnyCityKey,
  type AlbaniaCityKey,
  type CityKey,
  type RegionKey,
} from "@/lib/prayer-data";

// ---------- Toast ----------

function SyncToast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDone, 3800);
    return () => clearTimeout(id);
  }, [onDone]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-md items-start gap-2.5 rounded-2xl border border-[#B6FF2E]/40 bg-[#18282E]/95 px-4 py-3 text-sm font-semibold text-white shadow-[0_0_30px_rgba(182,255,46,0.25)] backdrop-blur">
        <Check className="mt-0.5 size-4 shrink-0 text-[#B6FF2E]" />
        <span>{message}</span>
      </div>
    </div>,
    document.body,
  );
}

// ---------- Sync button ----------

export function SyncOraretButton({
  region,
  city,
  onSync,
  compact = false,
}: {
  region: RegionKey;
  city: AnyCityKey;
  onSync: () => Promise<void> | void;
  compact?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const run = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onSync();
      setToast(
        `Oraret e namazit u sinkronizuan me sukses 100% sipas Këshillit të ${getCouncilLabel(region, city)}`,
      );
    } catch {
      setToast("Sinkronizimi dështoi — provo përsëri.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={run}
        disabled={loading}
        aria-label="Përditëso oraret"
        className={[
          "inline-flex items-center gap-2 rounded-full border border-[#B6FF2E]/40 bg-[#B6FF2E]/10 font-bold uppercase tracking-[0.14em] text-[#B6FF2E] transition hover:bg-[#B6FF2E]/20 hover:shadow-[0_0_20px_rgba(182,255,46,0.3)] disabled:opacity-60",
          compact ? "px-2.5 py-2 text-[10px]" : "px-3.5 py-2 text-[11px]",
        ].join(" ")}
      >
        <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        <span className={compact ? "hidden sm:inline" : ""}>Përditëso Oraret</span>
      </button>
      {toast && <SyncToast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}

// ---------- Quick switch (region + council) ----------

export function LocationQuickSwitch({
  region,
  city,
  alCity,
  onRegionChange,
  onCityChange,
  onAlCityChange,
  onAutoDetect,
  detecting,
}: {
  region: RegionKey;
  city: CityKey;
  alCity: AlbaniaCityKey;
  onRegionChange: (r: RegionKey) => void;
  onCityChange: (c: CityKey) => void;
  onAlCityChange: (c: AlbaniaCityKey) => void;
  onAutoDetect: () => void;
  detecting?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
      <select
        aria-label="Zgjidh shtetin"
        value={region}
        onChange={(e) => onRegionChange(e.target.value as RegionKey)}
        className="rounded-full border border-[#00D9A3]/25 bg-[#18282E] px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#00D9A3]"
      >
        <option value="Kosove">Kosovë · BIK</option>
        <option value="Shqiperi">Shqipëri · KMSH</option>
      </select>

      {region === "Kosove" ? (
        <select
          aria-label="Zgjidh qytetin"
          value={city}
          onChange={(e) => onCityChange(e.target.value as CityKey)}
          className="rounded-full border border-[#00D9A3]/25 bg-[#18282E] px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#00D9A3]"
        >
          {(Object.keys(CITY_LABELS) as CityKey[]).map((c) => (
            <option key={c} value={c}>{CITY_LABELS[c]}</option>
          ))}
        </select>
      ) : (
        <select
          aria-label="Zgjidh Këshillin e Myftinisë"
          value={alCity}
          onChange={(e) => onAlCityChange(e.target.value as AlbaniaCityKey)}
          className="rounded-full border border-[#00D9A3]/25 bg-[#18282E] px-3 py-2 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-[#00D9A3]"
        >
          {(ALBANIA_CITIES as readonly AlbaniaCityKey[]).map((c) => (
            <option key={c} value={c}>
              {ALBANIA_CITY_LABELS[c]} · Këshilli i {getCouncilLabel("Shqiperi", c)}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={onAutoDetect}
        disabled={detecting}
        className="inline-flex items-center gap-1.5 rounded-full border border-[#00D9A3]/30 bg-[#00D9A3]/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#00D9A3] transition hover:bg-[#00D9A3]/20 disabled:opacity-60"
      >
        {detecting ? <LocateFixed className="size-3.5 animate-pulse" /> : <MapPin className="size-3.5" />}
        Auto
      </button>
    </div>
  );
}
