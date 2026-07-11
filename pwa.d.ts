/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

// Build stamp injected by vite.config.ts — date and commit of the deploy,
// shown in the footer so anyone can tell at a glance which version a
// device is running.
declare const __BUILD_ID__: string;
