// Single guarded service-worker registration point. Never registers in dev/preview.
function refused(): boolean {
  if (!import.meta.env.PROD) return true;
  try {
    if (window.self !== window.top) return true;
  } catch {
    return true;
  }
  const h = window.location.hostname.toLowerCase();
  const platform = /\.(lovable\.app|gpt-eng\.com|gptengineer\.run)$/.test(h);
  if (platform && /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/.test(h.split(".")[0])) return true;
  if (platform && h.split(".")[0] === "project--9c207b4a-93be-4857-9b70-6ac7bc95bfa6-dev") return true;
  if (h === "id-preview--9c207b4a-93be-4857-9b70-6ac7bc95bfa6.lovable.app") return true;
  if (/(^|\.)lovableproject(-dev)?\.com$/.test(h)) return true;
  if (/(^|\.)beta\.lovable\.dev$/.test(h)) return true;
  if (new URLSearchParams(location.search).get("sw") === "off") return true;
  return false;
}

export async function registerAppServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (refused()) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      regs
        .filter((r) => (r.active || r.installing || r.waiting)?.scriptURL.endsWith("/sw.js"))
        .map((r) => r.unregister()),
    );
    return;
  }
  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {}
}
