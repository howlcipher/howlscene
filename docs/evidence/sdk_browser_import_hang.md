# Export package Node lifecycle regression

The clean consumer installed both packed packages, compiled its TypeScript, printed its successful rendering message, then did not exit for more than two minutes. Process inspection identified the child as `node output/consumer.js`. It was terminated, and the SDK check correctly failed.

The exporter imported `react-dom/server.browser` directly. The installed React browser server implementation constructs a MessageChannel and installs a port listener at module initialization. This entry is appropriate inside the browser but pins a Node consumer process.

Correction: import the public environment-selected `react-dom/server` entry and externalize that same entry in the exporter library build. Vite selects the browser implementation for browser consumers; Node selects the Node implementation. The external Node consumer now has a 15-second process timeout; install/build operations have a 120-second timeout. No retry or forced successful exit is used.

Reproduction and verification: `npm run sdk:check`. Browser ZIP export and the full user journey must also pass after this correction.
