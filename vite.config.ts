import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const BASE = '/Somm-Wine-Recs-App/';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: BASE,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // Offline mode: the whole app shell (all region data is bundled JS) is
        // precached, so the guide keeps working in a vineyard with no signal.
        // Photos, map tiles and fonts are cached as you browse.
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['favicon.png', 'apple-touch-icon.png'],
          manifest: {
            name: 'Somm — wine regions, properly',
            short_name: 'Somm',
            description:
              'Your companion to the world\'s great wine regions — estates, wines, experiences and the Somm himself.',
            theme_color: '#F6F1E7',
            background_color: '#F6F1E7',
            display: 'standalone',
            start_url: BASE,
            scope: BASE,
            icons: [
              { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
              { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
              { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
            ],
          },
          workbox: {
            globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],
            maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
            navigateFallback: `${BASE}index.html`,
            runtimeCaching: [
              {
                // Estate photography and any other imagery, wherever it lives
                urlPattern: ({ request }) => request.destination === 'image',
                handler: 'CacheFirst',
                options: {
                  cacheName: 'somm-images',
                  expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 },
                  cacheableResponse: { statuses: [0, 200] },
                },
              },
              {
                // Map tiles (CARTO voyager) — cached as you pan, so the map
                // you looked at over breakfast still works among the vines
                urlPattern: /^https:\/\/[a-d]\.basemaps\.cartocdn\.com\/.*/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'somm-map-tiles',
                  expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 14 },
                  cacheableResponse: { statuses: [0, 200] },
                },
              },
              {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
                handler: 'StaleWhileRevalidate',
                options: { cacheName: 'somm-font-css' },
              },
              {
                urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
                handler: 'CacheFirst',
                options: {
                  cacheName: 'somm-fonts',
                  expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                  cacheableResponse: { statuses: [0, 200] },
                },
              },
              {
                // Leaflet + the ElevenLabs widget embed
                urlPattern: /^https:\/\/unpkg\.com\/.*/,
                handler: 'StaleWhileRevalidate',
                options: {
                  cacheName: 'somm-cdn',
                  cacheableResponse: { statuses: [0, 200] },
                },
              },
            ],
          },
        }),
      ],
      define: {
        'process.env.VITE_AI_PROXY_URL': JSON.stringify(env.VITE_AI_PROXY_URL),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      css: {
        postcss: './postcss.config.js',
      },
    };
});
