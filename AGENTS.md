# Architecture rules

- Offline support uses vite-plugin-pwa generateSW registered only via src/lib/pwa-register.ts (guarded against dev/preview), so previews never serve stale caches.- MCP server is defined in src/lib/mcp/ (one tool per file) and mounted at /mcp by mcpPlugin; never hand-write its generated routes.
