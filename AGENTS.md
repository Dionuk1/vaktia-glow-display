# Architecture rules

- Offline support uses vite-plugin-pwa generateSW registered only via src/lib/pwa-register.ts (guarded against dev/preview), so previews never serve stale caches.