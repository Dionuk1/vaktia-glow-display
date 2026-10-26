# Architecture rules

- Offline support uses vite-plugin-pwa generateSW registered only via src/lib/pwa-register.ts (guarded against dev/preview); navigation is NetworkFirst and the asset-pointer PDF is precached so previews never serve stale caches.
- MCP server is defined in src/lib/mcp/ (one tool per file) and mounted at /mcp by mcpPlugin; never hand-write its generated routes.
- BIK rows already include seasonal civil time; normalize source-year DST boundaries and stale live summer clocks rather than subtracting an hour twice.
- Keep the app-wide auth session in one provider at the root; magic-link callbacks return to the public homepage and open the Sunnah tracker after session confirmation.
