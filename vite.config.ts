import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      registerType: "autoUpdate",
      injectRegister: false,
      manifest: {
        name: "الرسالة - رفيق المسلم",
        short_name: "الرسالة",
        description: "تطبيق الرسالة - حاسبة الزكاة والميراث وأوقات الصلاة والأذكار والتقويم الهجري",
        theme_color: "#215B4C",
        background_color: "#215B4C",
        display: "standalone",
        orientation: "portrait",
        dir: "rtl",
        lang: "ar",
        icons: [
          {
            src: "icons/icon-48.webp",
            sizes: "48x48",
            type: "image/webp",
          },
          {
            src: "icons/icon-72.webp",
            sizes: "72x72",
            type: "image/webp",
          },
          {
            src: "icons/icon-96.webp",
            sizes: "96x96",
            type: "image/webp",
          },
          {
            src: "icons/icon-128.webp",
            sizes: "128x128",
            type: "image/webp",
          },
          {
            src: "icons/icon-192.webp",
            sizes: "192x192",
            type: "image/webp",
          },
          {
            src: "icons/icon-256.webp",
            sizes: "256x256",
            type: "image/webp",
          },
          {
            src: "icons/icon-512.webp",
            sizes: "512x512",
            type: "image/webp",
          },
          {
            src: "icons/icon-512.webp",
            sizes: "512x512",
            type: "image/webp",
            purpose: "maskable",
          },
        ],
      },
      injectManifest: {
        injectionPoint: "__WB_MANIFEST",
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
