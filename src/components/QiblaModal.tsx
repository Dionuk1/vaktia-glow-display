import { Modal } from "./FeatureModals";
import QiblaCompass from "./QiblaCompass";

export default function QiblaModal({
  cityLabel,
  qibla,
  onClose,
}: {
  cityLabel: string;
  qibla: number;
  onClose: () => void;
}) {
  return (
    <Modal title={`📍 ${cityLabel} · Drejtimi i Kiblës`} onClose={onClose}>
      <div className="flex flex-col items-center gap-4">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00D9A3]/40 bg-[#00D9A3]/10 px-3 py-1 text-xs font-semibold text-[#00D9A3]">
          📍 {cityLabel}
        </span>
        <p className="max-w-xs text-center text-sm text-[#9CA3AF]">
          Mbajeni telefonin rrafsh dhe rrotullohuni derisa gjilpëra të tregojë lart.
        </p>
        <div className="w-full rounded-3xl border border-[#00D9A3]/20 bg-[#0B1E24] p-4 shadow-[0_0_20px_rgba(0,217,165,0.2)]">
          <QiblaCompass qibla={qibla} cityLabel={cityLabel} />
        </div>
      </div>
    </Modal>
  );
}
