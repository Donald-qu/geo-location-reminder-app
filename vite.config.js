import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate", // Automatically updates service worker
      includeAssets: ["vite.svg"], // Logo
      manifest: {
        name: " Geo-Location Reminder App",
        short_name: "ReminderApp",
        description:
          "A smart location-based reminder app that alerts you when you enter your chosen area.",
        theme_color: "#00bfff", // Sea blue
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        icons: [
          {
            src: "/vite.svg",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/vite.svg",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],

  // ✅ Allow all ngrok domains and local network hosts
  server: {
    allowedHosts: [
      ".ngrok-free.app",
      ".ngrok-free.dev",
      ".ngrok.io",
      "localhost",
    ],
    host: true,
  },
});
