import preact from "@preact/preset-vite";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // GitHub Pages base path ("/<repo>/").
  base: "/who-pays/",
  plugins: [
    preact(),
    VitePWA({
      registerType: "prompt",
      includeAssets: ["icons/icon-192.svg", "icons/icon-512.svg"],
      workbox: {
        mode: "production",
        cleanupOutdatedCaches: true,
        navigateFallback: "/who-pays/index.html",
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
      },
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Who Pays?",
        short_name: "Who Pays?",
        start_url: "/who-pays/",
        scope: "/who-pays/",
        display: "standalone",
        background_color: "#f7f3ef",
        theme_color: "#f7f3ef",
        icons: [
          {
            src: "/who-pays/icons/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml",
            purpose: "any",
          },
          {
            src: "/who-pays/icons/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any",
          },
        ],
      },
    }),
  ],
});
