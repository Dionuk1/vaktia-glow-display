# Mobile install prompt

## Build
- Add home-screen app metadata and correctly sized VaktiaKS icons, without adding offline caching.
- Add a bottom floating install prompt on the home screen only.
- Detect iPhone/iPad Safari and show the requested three-step Add to Home Screen guide.
- Detect Android/Chrome and use the browser's native installation prompt when available.
- Save dismissal under `vaktiaks_install_dismissed` so the prompt stays closed after refresh.

## Verify
- Check desktop and mobile layouts, dismissal persistence, metadata, and the current build.
