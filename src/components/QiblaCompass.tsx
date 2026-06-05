import { useEffect, useMemo, useState } from "react";

const QIBLA = 137; // Qibla angle for Kosovo

type DeviceOrientationEventiOS = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<"granted" | "denied">;
};

export default function QiblaCompass() {
  const [heading, setHeading] = useState<number | null>(null);
  const [supported, setSupported] = useState<boolean>(false);
  const [needsPermission, setNeedsPermission] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const DOE = (window as unknown as { DeviceOrientationEvent?: DeviceOrientationEventiOS })
      .DeviceOrientationEvent;
    if (!DOE) return;
    setSupported(true);
    if (typeof DOE.requestPermission === "function") {
      setNeedsPermission(true);
    } else {
      attach();
    }
    return () => detach();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onOrient = (e: DeviceOrientationEvent) => {
    // webkitCompassHeading on iOS gives true heading
    const wk = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
    let h: number | null = null;
    if (typeof wk === "number") {
      h = wk;
    } else if (typeof e.alpha === "number") {
      // alpha = rotation around z; convert to compass heading
      h = 360 - e.alpha;
    }
    if (h !== null && !Number.isNaN(h)) {
      setHeading(((h % 360) + 360) % 360);
    }
  };

  const attach = () => {
    window.addEventListener("deviceorientationabsolute", onOrient as EventListener, true);
    window.addEventListener("deviceorientation", onOrient, true);
  };
  const detach = () => {
    window.removeEventListener("deviceorientationabsolute", onOrient as EventListener, true);
    window.removeEventListener("deviceorientation", onOrient, true);
  };

  const requestPerm = async () => {
    const DOE = (window as unknown as { DeviceOrientationEvent?: DeviceOrientationEventiOS })
      .DeviceOrientationEvent;
    try {
      const res = await DOE?.requestPermission?.();
      if (res === "granted") {
        setNeedsPermission(false);
        attach();
      }
    } catch {
      /* noop */
    }
  };

  // Direction the user needs to turn from current heading toward Qibla
  const relative = useMemo(() => {
    if (heading === null) return QIBLA; // static: show Qibla at QIBLA° on wheel
    return (QIBLA - heading + 360) % 360;
  }, [heading]);

  const aligned =
    heading !== null && Math.min(Math.abs(QIBLA - heading), 360 - Math.abs(QIBLA - heading)) <= 2;

  // Wheel rotates so that "N" stays at top relative to world.
  // When heading is known, rotate wheel by -heading so N points to true north.
  const wheelRotation = heading === null ? 0 : -heading;

  return (
    <div className="flex flex-col items-center">
      <div
        className={[
          "relative aspect-square w-full max-w-[280px] rounded-full",
          "bg-gradient-to-b from-surface-elevated to-surface",
          "border border-border transition-shadow duration-300",
          aligned ? "animate-pulse-glow" : "",
        ].join(" ")}
        style={{
          boxShadow: aligned
            ? undefined
            : "inset 0 2px 20px oklch(0 0 0 / 0.4), 0 10px 30px -10px oklch(0 0 0 / 0.5)",
        }}
      >
        {/* Rotating wheel */}
        <div
          className="absolute inset-0 transition-transform duration-200 ease-out"
          style={{ transform: `rotate(${wheelRotation}deg)` }}
        >
          {/* Tick marks */}
          {Array.from({ length: 72 }).map((_, i) => {
            const angle = i * 5;
            const major = angle % 30 === 0;
            return (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 origin-bottom"
                style={{
                  width: major ? 2 : 1,
                  height: major ? "46%" : "44%",
                  transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                  transformOrigin: "50% 100%",
                }}
              >
                <div
                  className={major ? "bg-foreground/40" : "bg-foreground/15"}
                  style={{ width: "100%", height: major ? 8 : 4 }}
                />
              </div>
            );
          })}

          {/* Cardinal labels */}
          {[
            { l: "N", a: 0, color: "text-destructive" },
            { l: "E", a: 90, color: "text-muted-foreground" },
            { l: "S", a: 180, color: "text-muted-foreground" },
            { l: "W", a: 270, color: "text-muted-foreground" },
          ].map((c) => (
            <div
              key={c.l}
              className="absolute left-1/2 top-1/2"
              style={{
                transform: `rotate(${c.a}deg) translateY(-46%) rotate(${-c.a - wheelRotation}deg)`,
              }}
            >
              <span className={`text-sm font-semibold ${c.color}`}>{c.l}</span>
            </div>
          ))}

          {/* Qibla indicator at 137° */}
          <div
            className="absolute left-1/2 top-1/2 origin-bottom"
            style={{
              width: 0,
              height: "46%",
              transform: `translate(-50%, -100%) rotate(${QIBLA}deg)`,
              transformOrigin: "50% 100%",
            }}
          >
            <div className="relative h-full w-0 mx-auto">
              <div
                className="absolute left-1/2 -translate-x-1/2 top-0 w-1 h-[28%] rounded-full bg-primary"
                style={{
                  boxShadow:
                    "0 0 12px var(--color-primary), 0 0 24px color-mix(in oklab, var(--color-primary) 60%, transparent)",
                }}
              />
              <div
                className="absolute left-1/2 -translate-x-1/2 -top-1 size-3 rounded-full bg-primary"
                style={{ boxShadow: "0 0 16px var(--color-primary)" }}
              />
            </div>
          </div>
        </div>

        {/* Fixed pointer at top (device-facing direction) */}
        {heading !== null && (
          <div className="pointer-events-none absolute left-1/2 -top-2 -translate-x-1/2">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-foreground/80" />
          </div>
        )}

        {/* Center Kaaba */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <div className="size-14 rounded-md bg-foreground/90 border-2 border-gold flex items-center justify-center shadow-lg">
              <div className="absolute inset-x-0 top-1/3 h-1 bg-gold/80" />
              <span className="text-[10px] font-bold tracking-widest text-background relative">
                KAABA
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 text-sm">
        <div className="rounded-full bg-surface-elevated px-3 py-1 border border-border tabular-nums">
          Cak: <span className="text-primary font-semibold">137°</span>
        </div>
        {heading !== null ? (
          <div
            className={`rounded-full px-3 py-1 border tabular-nums ${
              aligned
                ? "bg-primary/15 border-primary text-primary"
                : "bg-surface-elevated border-border"
            }`}
          >
            Drejtimi: <span className="font-semibold">{Math.round(heading)}°</span>
          </div>
        ) : (
          <div className="rounded-full bg-surface-elevated px-3 py-1 border border-border text-muted-foreground">
            {supported ? "Statike" : "Pa sensor"}
          </div>
        )}
      </div>

      {needsPermission && (
        <button
          type="button"
          onClick={requestPerm}
          className="mt-3 rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
        >
          Aktivizo busullën
        </button>
      )}

      {aligned && (
        <p className="mt-2 text-sm text-primary font-medium animate-fade-in">
          ✓ Po shikoni drejt Qabesë
        </p>
      )}

      <p className="mt-3 text-xs text-muted-foreground text-center max-w-xs">
        {heading === null
          ? "Pajisja juaj nuk e mbështet busullën — shenja e gjelbër tregon 137° si referencë fikse."
          : "Mbani telefonin drejt dhe rrotullohuni derisa shigjeta lart të përputhet me shenjën e gjelbër."}
        {" "}Drejtimi nga Kosova drejt Qabesë: <span className="text-primary font-semibold">137° (jug-juglindje)</span>.
      </p>
    </div>
  );
}
