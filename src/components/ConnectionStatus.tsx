import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function ConnectionStatus() {
  const [online, setOnline] = useState(true);
  const [toast, setToast] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    setOnline(navigator.onLine);
    wasOffline.current = !navigator.onLine;
    let t: ReturnType<typeof setTimeout>;
    const on = () => {
      setOnline(true);
      if (wasOffline.current) {
        setToast(true);
        clearTimeout(t);
        t = setTimeout(() => setToast(false), 3500);
      }
      wasOffline.current = false;
    };
    const off = () => {
      setOnline(false);
      wasOffline.current = true;
    };
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
      clearTimeout(t);
    };
  }, []);

  return (
    <>
      {!online && (
        <span
          role="status"
          className="hidden items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[10px] font-bold text-accent sm:inline-flex"
          title="Oraret janë të ruajtura"
        >
          ⚡ Modali Offline
        </span>
      )}
      {!online && (
        <span role="status" className="inline-flex rounded-full border border-accent/40 bg-accent/10 px-2 py-1 text-[10px] font-bold text-accent sm:hidden">
          ⚡ Offline
        </span>
      )}
      {toast &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed left-1/2 top-20 z-[95] -translate-x-1/2 animate-in fade-in slide-in-from-top-2 rounded-full border border-primary/40 bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-lg">
            🟢 U lidhët me sukses përsëri
          </div>,
          document.body,
        )}
    </>
  );
}
