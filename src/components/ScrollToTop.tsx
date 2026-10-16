import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(window.scrollY > 400);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <button
      aria-label="Kthehu lart"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={[
        "fixed bottom-5 right-5 z-[70] grid size-12 place-items-center rounded-full border border-[#00D9A3]/40 bg-[#00D9A3] text-[#0B1E24] shadow-lg transition-all duration-300 hover:bg-[#00D9A3]/80",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      ].join(" ")}
    >
      <ArrowUp className="size-5" />
    </button>
  );
}
