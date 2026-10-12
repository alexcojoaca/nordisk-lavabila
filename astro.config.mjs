import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";

export default defineConfig({
  site: "https://nordisk-lavabila.vercel.app",
  output: "server",
  adapter: vercel(),
  security: {
    checkOrigin: false,
    allowedDomains: [
      { hostname: "nordisk-lavabila.vercel.app" },
      { hostname: "*.vercel.app" },
      { hostname: "localhost" },
      { hostname: "127.0.0.1" },
    ],
  },
});
