export const MODULE_EVENT = "vaktia:open-module";

export function openModule(id: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(MODULE_EVENT, { detail: id }));
}

export function onOpenModule(cb: (id: string) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => cb((e as CustomEvent<string>).detail);
  window.addEventListener(MODULE_EVENT, handler);
  return () => window.removeEventListener(MODULE_EVENT, handler);
}
